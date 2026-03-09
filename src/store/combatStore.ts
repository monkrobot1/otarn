import { create } from 'zustand';
import type { ActiveCharacter } from '../types/character';
import type { AbilityPayload } from '../types/ability';
import { useGameStore } from './gameStore';
import { useCombatUIStore } from './combatUIStore';
import { TalentManager } from '../systems/TalentManager';
import { InternalLogger } from './debugStore';

interface CombatLogEntry {
  id: string;
  message: string;
  type: 'damage' | 'heal' | 'buff' | 'system' | 'god';
}

const getSectorModifier = (sourceSector: string, targetSector: string) => {
    if (!sourceSector || !targetSector) return { dmg: 1.0, crit: 0 };
    // Weakness ring: Order < Chaos < Judgment < Love < Order
    // A < B means A is weak to B, B is strong against A.
    // So Chaos beats Order. Judgment beats Chaos.
    const adv: Record<string, string> = {
      'Order': 'Love',
      'Chaos': 'Order',
      'Judgment': 'Chaos',
      'Love': 'Judgment'
    };
    if (adv[sourceSector] === targetSector) {
        return { dmg: 1.5, crit: 0.25 }; // +50% dmg, +25% crit
    }
    if (adv[targetSector] === sourceSector) {
        return { dmg: 0.5, crit: 0 }; // -50% dmg, base crit
    }
    return { dmg: 1.0, crit: 0 };
};

interface CombatState {
  enemies: ActiveCharacter[];
  allies: ActiveCharacter[];
  turnQueue: ActiveCharacter[]; // The strict order for the current round
  currentRound: number;
  activeTurnId: string | null;
  logs: CombatLogEntry[];
  
  initializeCombat: (allies: ActiveCharacter[], enemies: ActiveCharacter[]) => void;
  advanceTurn: () => void;
  processPayload: (payload: AbilityPayload) => void;
  endCombat: (isVictory: boolean) => void;
  castGodIntervention: (faithCost: number, logic: () => void) => void;
}

export const useCombatStore = create<CombatState>((set, get) => ({
  enemies: [],
  allies: [],
  turnQueue: [],
  currentRound: 1,
  activeTurnId: null,
  logs: [],

  initializeCombat: (allies, enemies) => {
    // Generate initial turn queue based on Fate (Speed)
    // Apply static modifications based on currently active run talents
    const activeTalents = useGameStore.getState().runData?.activeTalents || [];
    const activeRelics = useGameStore.getState().runData?.activeRelics || [];
    const modifiedAllies = TalentManager.applyPreCombatModifiers(allies, activeTalents, activeRelics);
    
    // (Optional: Implement enemy talents later)
    const modifiedEnemies = enemies; 

    const allCombatants = [...modifiedAllies, ...modifiedEnemies];
    const sortedQueue = allCombatants.sort((a, b) => b.stats.current.fate - a.stats.current.fate);
    
    useCombatUIStore.getState().clearAll();

    set({
      allies: modifiedAllies,
      enemies: modifiedEnemies,
      turnQueue: sortedQueue,
      currentRound: 1,
      activeTurnId: null,
      logs: [{ id: Date.now().toString(), message: "Combat Engaged.", type: 'system' }]
    });

    InternalLogger.info('combat', `Combat Initialized. Allies: ${allies.length}, Enemies: ${enemies.length}`);
    InternalLogger.debug('combat', 'Initial Turn Queue generated', sortedQueue.map(c => c.name));

    get().advanceTurn();
  },

  advanceTurn: () => {
    let { enemies, allies, turnQueue, currentRound } = get();
    
    // 1. Check win/loss first
    const livingAllies = allies.filter(a => !a.isDead);
    const livingEnemies = enemies.filter(e => !e.isDead);

    if (livingAllies.length === 0) {
        InternalLogger.warn('combat', 'Defeat Condition Met: No living allies');
        return get().endCombat(false);
    }
    if (livingEnemies.length === 0) {
        InternalLogger.info('combat', 'Victory Condition Met: No living enemies');
        return get().endCombat(true);
    }

    // 2. Clear acted characters or dead characters from queue
    turnQueue = turnQueue.filter(c => !c.hasActedThisRound && !c.isDead);

    // 3. If queue is empty, start a new round!
    if (turnQueue.length === 0) {
        currentRound++;
        
        // Reset action flag for all living combatants
        const resetUnit = (u: ActiveCharacter) => ({ ...u, hasActedThisRound: false });
        allies = allies.map(resetUnit);
        enemies = enemies.map(resetUnit);
        
        const allLiving = [...allies, ...enemies].filter(c => !c.isDead);
        
        // Sort by Fate (Speed) for the new round
        turnQueue = allLiving.sort((a, b) => b.stats.current.fate - a.stats.current.fate);
        
        InternalLogger.info('combat', `--- ROUND ${currentRound} START ---`);
        InternalLogger.debug('combat', 'New Round Queue', turnQueue.map(c => c.name));

        set({
           allies,
           enemies,
           currentRound,
           turnQueue,
           logs: [...get().logs, { id: Date.now().toString(), message: `--- Round ${currentRound} Begins ---`, type: 'system' }]
        });
    }

    const nextActor = turnQueue[0];

    if (nextActor) {
      InternalLogger.debug('combat', `Processing turn start for ${nextActor.name} (${nextActor.instanceId})`);
      let isStunned = false;
      let dotDamage = 0;
      let newDebuffs = [...nextActor.debuffs];
      const currentLogs = [...get().logs];

      // No per-turn MP regen; shifted to end of combat
      const newMp = nextActor.currentMp;

      newDebuffs = newDebuffs.map(d => {
        if (d.type === 'Stun') isStunned = true;
        if (d.type === 'Bleed' || d.type === 'Poison' || d.type === 'Decay') {
           const dotVal = d.value || 5;
           dotDamage += dotVal;
           currentLogs.push({
              id: Date.now().toString() + '-dot-' + Math.random(),
              message: `${nextActor.name} takes ${dotVal} ${d.type} damage.`,
              type: 'damage'
           });
        }
        return { ...d, duration: d.duration - 1 };
      }).filter(d => d.duration > 0);

      if (dotDamage > 0 || isStunned || newDebuffs.length !== nextActor.debuffs.length) {
         const newHp = Math.max(0, nextActor.currentHp - dotDamage);
         const isDead = newHp <= 0;
         if (isDead) {
           currentLogs.push({ id: Date.now().toString() + '-death', message: `${nextActor.name} succumbed to damage.`, type: 'system' });
         }

         const updateUnitState = (u: ActiveCharacter) => u.instanceId === nextActor.instanceId ? { 
           ...u, 
           currentHp: newHp, 
           currentMp: newMp,
           isDead, 
           debuffs: newDebuffs,
           hasActedThisRound: (isDead || isStunned) ? true : u.hasActedThisRound
         } : u;

         const updatedAllies = allies.map(updateUnitState);
         const updatedEnemies = enemies.map(updateUnitState);
         
         if (isStunned && !isDead) {
           currentLogs.push({ id: Date.now().toString() + '-stun', message: `${nextActor.name} is Stunned and misses their turn.`, type: 'system' });
         }

         set({
            allies: updatedAllies,
            enemies: updatedEnemies,
            turnQueue: [...updatedAllies, ...updatedEnemies].filter(u => !u.isDead && !u.hasActedThisRound).sort((a, b) => b.stats.current.fate - a.stats.current.fate),
            logs: currentLogs
         });

         if (isDead || isStunned) {
            // Auto skip
            setTimeout(() => get().advanceTurn(), 500 / (useGameStore.getState().combatSpeed || 1));
            return;
         }
      } else {
         set({ logs: currentLogs });
      }
    }

    set(state => ({
      turnQueue: state.turnQueue,
      activeTurnId: state.turnQueue.length > 0 ? state.turnQueue[0].instanceId : null
    }));
  },

  processPayload: (payload: AbilityPayload) => {
    const { allies, enemies, activeTurnId } = get();
    const sourceUnit = [...allies, ...enemies].find(c => c.instanceId === payload.sourceId);
    
    if (!sourceUnit) {
        InternalLogger.error('combat', `Failed to find source unit ${payload.sourceId} for payload`);
        return;
    }

    InternalLogger.info('combat', `[PAYLOAD] ${sourceUnit.name} casting ability on targets: ${payload.targetIds.join(', ')}`, payload.ability?.name || 'basic');

    let finalTargetIds = payload.targetIds;
    const isConfused = sourceUnit.debuffs.some(d => d.type === 'Confusion');
    
    let totalDamageDealt = 0;
    const combatLogs: CombatLogEntry[] = [];
    
    if (isConfused) {
       const allLiving = [...allies, ...enemies].filter(a => !a.isDead);
       if (allLiving.length > 0) {
           const randT = allLiving[Math.floor(Math.random() * allLiving.length)];
           finalTargetIds = [randT.instanceId];
           combatLogs.push({
             id: Date.now().toString() + '-confused',
             message: `${sourceUnit.name} is Confused and targets at random!`,
             type: 'system'
           });
       }
    }

    let sourcePotencyPhysical = Math.max(1, sourceUnit.stats.base.physicality || 1);
    let sourcePotencySpiritual = Math.max(1, sourceUnit.stats.base.authority || 1);

    // DEV TESTING HACK: Make player ULT attacks 100x more damaging
    if (allies.some(a => a.instanceId === sourceUnit.instanceId)) {
       if (payload.ability && payload.ability.id.includes('_ULT')) {
           sourcePotencyPhysical *= 100;
           sourcePotencySpiritual *= 100;
       }

       // Add Default Relic
       const activeRelics = useGameStore.getState().runData?.activeRelics || [];
       if (activeRelics.includes('REL_DEFAULT')) {
           sourcePotencyPhysical *= 1.2;
           sourcePotencySpiritual *= 1.2;
       }
    }

    const updateUnit = (unit: ActiveCharacter) => {
      const isSource = unit.instanceId === payload.sourceId && unit.instanceId === activeTurnId;
      let newMp = unit.currentMp;
      let newRev = unit.currentRevelation || 0;
      let actedState = unit.hasActedThisRound;

      // 1. Mark the acting unit as having acted, consume resources, generate passive zeal
      if (isSource) {
         actedState = true;
         if (payload.ability && payload.ability.costMP) {
             newMp = Math.max(0, newMp - payload.ability.costMP);
         }
         if (payload.ability && payload.ability.costRevelation) {
             newRev = Math.max(0, newRev - payload.ability.costRevelation);
         } else if (payload.ability) {
             // Generate Zeal for casting a normal ability
             newRev = Math.min(100, newRev + 15);
         }
      }

      // 2. Process Target Damage Mitigations & Healing
      if (finalTargetIds.includes(unit.instanceId)) {
        let newHp = unit.currentHp;
        let newBuffs = [...unit.buffs];
        let newDebuffs = [...unit.debuffs];

        const applyStatus = (statusName: string) => {
           // Basic mapping of status strings to StatusEffect interface
           const effect: import('../types/character').StatusEffect = {
               id: Date.now().toString() + Math.random(),
               type: statusName as any,
               duration: 3, 
               value: (statusName === 'Bleed' || statusName === 'Poison' || statusName === 'Decay') ? 5 : undefined,
               sourceId: sourceUnit.instanceId
           };
           // Determine if buff or debuff roughly
           if (['Regen', 'Shield', 'Haste', 'Overcharge'].includes(statusName)) {
               newBuffs.push(effect);
               combatLogs.push({ id: effect.id, message: `${unit.name} gained ${statusName}.`, type: 'buff' });
               const spd = useGameStore.getState().combatSpeed || 1;
               useCombatUIStore.getState().addVfx({
                   id: Date.now().toString() + '-' + unit.instanceId + Math.random(),
                   type: 'buff',
                   targetId: unit.instanceId,
                   spriteUrl: '/assets/default_buff.svg',
                   cols: 4, rows: 1, totalFrames: 4, fps: 12, durationMs: 400 / spd
               });
           } else {
               newDebuffs.push(effect);
               combatLogs.push({ id: effect.id, message: `${unit.name} afflicted by ${statusName}.`, type: 'damage' });
               const spd = useGameStore.getState().combatSpeed || 1;
               useCombatUIStore.getState().addVfx({
                   id: Date.now().toString() + '-' + unit.instanceId + Math.random(),
                   type: 'hit',
                   targetId: unit.instanceId,
                   spriteUrl: '/assets/default_hit.svg',
                   cols: 4, rows: 1, totalFrames: 4, fps: 15, durationMs: 300 / spd
               });
           }
        };

         if (payload.ability) {
           const abil = payload.ability;
           const sectorMod = getSectorModifier(sourceUnit.sector, unit.sector);

           // 1. Process 'hits' array
           if (abil.hits && abil.hits.length > 0) {
              abil.hits.forEach((hit, index) => {
                let hitDamage = 0;
                let isCrit = false;

                const BASE_SCALAR = 20;

                if (hit.damageType === 'Physical') {
                  const mitigation = Math.max(1, unit.stats.base.physicality || 1);
                  hitDamage = Math.floor((sourcePotencyPhysical * hit.multiplier * BASE_SCALAR) / mitigation);
                  
                  const baseCritChance = (sourceUnit.stats.current.destiny || 5) / 100;
                  if (Math.random() < (baseCritChance + sectorMod.crit)) isCrit = true;
                  
                  hitDamage = Math.floor(hitDamage * sectorMod.dmg * (isCrit ? 1.5 : 1.0));
                } else if (hit.damageType === 'Spiritual') {
                  const mitigation = Math.max(1, unit.stats.base.spirit || 1);
                  hitDamage = Math.floor((sourcePotencySpiritual * hit.multiplier * BASE_SCALAR) / mitigation);

                  const baseCritChance = (sourceUnit.stats.current.destiny || 5) / 100;
                  if (Math.random() < (baseCritChance + sectorMod.crit)) isCrit = true;
                  
                  hitDamage = Math.floor(hitDamage * sectorMod.dmg * (isCrit ? 1.5 : 1.0));
                } else if (hit.damageType === 'True') {
                  hitDamage = Math.floor(sourcePotencyPhysical * hit.multiplier * BASE_SCALAR); // True ignores mitigation, resistance, and crit
                }
                
                if (hitDamage < 1) hitDamage = 1;

                totalDamageDealt += hitDamage;
                newHp = Math.max(0, newHp - hitDamage);
                
                combatLogs.push({
                  id: Date.now().toString() + '-' + index + '-' + unit.instanceId,
                  message: `${sourceUnit.name} hit ${unit.name} for ${hitDamage} ${hit.damageType} damage${isCrit ? ' (CRIT!)' : ''}${sectorMod.dmg > 1.0 ? ' (Weakness!)' : sectorMod.dmg < 1.0 ? ' (Resisted)' : ''}.`,
                  type: 'damage'
                });

                if (hit.statusEffect) applyStatus(hit.statusEffect);
                InternalLogger.debug('combat', `[HIT] ${sourceUnit.name} -> ${unit.name} = ${hitDamage} (${hit.damageType})`);
              });
           } else if (abil.baseDamage) {
              // Fallback simple baseDamage
              const mitigationFactor = Math.max(1, unit.stats.base.physicality || 1);
              let actualDamage = Math.floor((sourcePotencyPhysical * abil.baseDamage * 20) / mitigationFactor);
              
              let isCrit = false;
              const baseCritChance = (sourceUnit.stats.current.destiny || 5) / 100;
              if (Math.random() < (baseCritChance + sectorMod.crit)) isCrit = true;

              actualDamage = Math.floor(actualDamage * sectorMod.dmg * (isCrit ? 1.5 : 1.0));
              if (actualDamage < 1) actualDamage = 1;

              totalDamageDealt += actualDamage;
              newHp = Math.max(0, newHp - actualDamage);
              combatLogs.push({
                id: Date.now().toString() + '-legacy-' + unit.instanceId,
                message: `${sourceUnit.name} hit ${unit.name} for ${actualDamage} damage${isCrit ? ' (CRIT!)' : ''}${sectorMod.dmg > 1.0 ? ' (Weakness!)' : sectorMod.dmg < 1.0 ? ' (Resisted)' : ''}.`,
                type: 'damage'
              });
           }

           // 2. Process baseHeal
           if (abil.baseHeal) {
              const maxHp = unit.stats.base.capacity ? 10 + (unit.stats.base.capacity * 5) + (unit.level * unit.stats.base.capacity) : 100;
              const healAmt = Math.floor(sourcePotencySpiritual * abil.baseHeal * 5); // 5 is a good baseline multiplier for heals to reach 30-50%
              newHp = Math.min(maxHp, newHp + healAmt);
              combatLogs.push({
                id: Date.now().toString() + '-heal-' + unit.instanceId,
                message: `${sourceUnit.name} healed ${unit.name} for ${healAmt} HP.`,
                type: 'heal'
              });
           }

           // 3. Process root statusEffects (global to the ability, e.g. Self buffs)
           if (abil.statusEffects) {
              abil.statusEffects.forEach(statusName => applyStatus(statusName));
           }

           // 4. Trigger localized Ability VFX
           if (abil.vfxType) {
               const spd = useGameStore.getState().combatSpeed || 1;
               useCombatUIStore.getState().addVfx({
                   id: Date.now().toString() + '-' + unit.instanceId + Math.random(),
                   type: abil.vfxType,
                   sourceId: sourceUnit.instanceId,
                   targetId: unit.instanceId,
                   spriteUrl: abil.vfxUrl || `/assets/default_${abil.vfxType}.svg`,
                   cols: 4, 
                   rows: 1, 
                   totalFrames: 4, 
                   fps: 15, 
                   durationMs: ['beam', 'projectile'].includes(abil.vfxType) ? 500 : 300
               }, spd);
           }
        } else {
           // Legacy un-typed damage/healing payloads
           if (payload.damage) {
              const mitigationFactor = Math.max(1, unit.stats.base.physicality || 1);
              let actualDamage = Math.floor(payload.damage * 20 * (sourcePotencyPhysical / mitigationFactor));
              if (actualDamage < 1) actualDamage = 1;

              totalDamageDealt += actualDamage;
              newHp = Math.max(0, newHp - actualDamage);
              combatLogs.push({
                id: Date.now().toString() + '-legacy-' + unit.instanceId,
                message: `${sourceUnit.name} hit ${unit.name} for ${actualDamage} damage.`,
                type: 'damage'
              });
           }
           if (payload.healing) {
              const maxHp = unit.stats.base.capacity ? unit.stats.base.capacity * 10 : 100;
              newHp = Math.min(maxHp, newHp + payload.healing);
              combatLogs.push({
                id: Date.now().toString() + '-heal-' + unit.instanceId,
                message: `${sourceUnit.name} healed ${unit.name} for ${payload.healing} HP.`,
                type: 'heal'
              });
           }
           if (payload.buffsApplied) {
               newBuffs = [...newBuffs, ...payload.buffsApplied];
               payload.buffsApplied.forEach(b => {
                   combatLogs.push({ id: Date.now().toString() + '-buff-' + Math.random(), message: `${unit.name} gained ${b.type}.`, type: 'buff' });
               });
           }
           if (payload.debuffsApplied) {
               newDebuffs = [...newDebuffs, ...payload.debuffsApplied];
               payload.debuffsApplied.forEach(b => {
                   combatLogs.push({ id: Date.now().toString() + '-debuff-' + Math.random(), message: `${unit.name} afflicted by ${b.type}.`, type: 'damage' });
               });
           }
        }

        // Generate Zeal when targeted by hostile abilities (damage or debuff)
        const isHostile = payload.ability && (payload.ability.targeting === 'enemy' || payload.ability.targeting === 'all_enemies');
        if (isHostile && unit.instanceId !== payload.sourceId) {
            newRev = Math.min(100, newRev + 20); // 20 Zeal for taking a hit
        }

        return { 
          ...unit, 
          currentHp: newHp,
          currentMp: newMp,
          currentRevelation: newRev,
          buffs: newBuffs,
          debuffs: newDebuffs,
          isDead: newHp <= 0,
          hasActedThisRound: actedState
        };
      }
      return isSource ? { ...unit, currentMp: newMp, currentRevelation: newRev, hasActedThisRound: actedState } : unit;
    };

    const nextAllies = allies.map(updateUnit);
    const nextEnemies = enemies.map(updateUnit);

    set(state => ({
      allies: nextAllies,
      enemies: nextEnemies,
      turnQueue: [...nextAllies, ...nextEnemies].filter(u => !u.isDead && !u.hasActedThisRound).sort((a, b) => b.stats.current.fate - a.stats.current.fate),
      logs: [...state.logs, ...combatLogs]
    }));

    InternalLogger.debug('combat', `Payload resolved, dealing ${totalDamageDealt} total damage across all targets.`);

    // Automatically advance to next turn after action resolves.
    setTimeout(() => {
        get().advanceTurn();
    }, 1500 / (useGameStore.getState().combatSpeed || 1));
  },

  castGodIntervention: (faithCost, logic) => {
    const gameStore = useGameStore.getState();
    if (!gameStore.runData || gameStore.runData.ephemeralFaith < faithCost) {
      set(state => ({ logs: [...state.logs, { id: Date.now().toString(), message: "Not enough Ephemeral Faith!", type: 'system' }] }));
      return;
    }

    // Deduct faith
    useGameStore.setState({ 
      runData: { ...gameStore.runData, ephemeralFaith: gameStore.runData.ephemeralFaith - faithCost } 
    });

    // Execute logic
    logic();
    
    set(state => ({ logs: [...state.logs, { id: Date.now().toString(), message: "Divine Intervention applied.", type: 'god' }] }));
  },

  endCombat: (victory) => {
    set({ activeTurnId: null, logs: [...get().logs, { id: Date.now().toString(), message: victory ? "Victory Achieved." : "Champion Wiped.", type: 'system' }] });
    
    // Simulate a brief delay before routing so player can read the log
    setTimeout(() => {
        if (victory) {
            useGameStore.getState().setScene('reward');
        } else {
            useGameStore.getState().setScene('summary');
        }
    }, 2000 / (useGameStore.getState().combatSpeed || 1));
  }
}));
