import { create } from 'zustand';
import type { ActiveCharacter } from '../types/character';
import type { AbilityPayload } from '../types/ability';
import { useGameStore } from './gameStore';
import { InternalLogger } from './debugStore';
import { TalentManager } from '../systems/TalentManager';

interface CombatLogEntry {
  id: string;
  message: string;
  type: 'damage' | 'heal' | 'buff' | 'system' | 'god';
}

interface CombatState {
  enemies: ActiveCharacter[];
  allies: ActiveCharacter[];
  turnQueue: ActiveCharacter[]; // The strict order for the current round
  currentRound: number;
  activeTurnId: string | null;
  logs: CombatLogEntry[];
  targetingAbility: import('../types/character').Ability | null;
  
  initializeCombat: (allies: ActiveCharacter[], enemies: ActiveCharacter[]) => void;
  advanceTurn: () => void;
  processPayload: (payload: AbilityPayload) => void;
  castGodIntervention: (faithCost: number, logic: () => void) => void;
  setTargetingAbility: (ability: import('../types/character').Ability | null) => void;
  endCombat: (victory: boolean) => void;
}

export const useCombatStore = create<CombatState>((set, get) => ({
  enemies: [],
  allies: [],
  turnQueue: [],
  currentRound: 1,
  activeTurnId: null,
  logs: [],
  targetingAbility: null,

  setTargetingAbility: (ability) => set({ targetingAbility: ability }),

  initializeCombat: (allies, enemies) => {
    // Generate initial turn queue based on Fate (Speed)
    // Apply static modifications based on currently active run talents
    const activeTalents = useGameStore.getState().runData?.activeTalents || [];
    const modifiedAllies = TalentManager.applyPreCombatModifiers(allies, activeTalents);
    
    // (Optional: Implement enemy talents later)
    const modifiedEnemies = enemies; 

    const allCombatants = [...modifiedAllies, ...modifiedEnemies];
    const sortedQueue = allCombatants.sort((a, b) => b.stats.current.fate - a.stats.current.fate);
    
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
           logs: [...get().logs, { id: Date.now().toString(), message: `--- Round ${currentRound} Begins ---`, type: 'system' }]
        });
    }

    const nextActor = turnQueue[0];

    if (nextActor) {
      InternalLogger.debug('combat', `Processing turn start for ${nextActor.name} (${nextActor.instanceId})`);
      let isStunned = false;
      let dotDamage = 0;
      let newDebuffs = [...nextActor.debuffs];
      let currentLogs = [...get().logs];

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
         let newHp = Math.max(0, nextActor.currentHp - dotDamage);
         let isDead = newHp <= 0;
         if (isDead) {
           currentLogs.push({ id: Date.now().toString() + '-death', message: `${nextActor.name} succumbed to damage.`, type: 'system' });
         }

         const updateUnitState = (u: ActiveCharacter) => u.instanceId === nextActor.instanceId ? { 
           ...u, 
           currentHp: newHp, 
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
            setTimeout(() => get().advanceTurn(), 0);
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
    let isConfused = sourceUnit.debuffs.some(d => d.type === 'Confusion');
    
    let totalDamageDealt = 0;
    let combatLogs: CombatLogEntry[] = [];
    
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

    // DEV TESTING HACK: Make player attacks 100x more damaging
    if (allies.some(a => a.instanceId === sourceUnit.instanceId)) {
       sourcePotencyPhysical *= 100;
       sourcePotencySpiritual *= 100;
    }

    const updateUnit = (unit: ActiveCharacter) => {
      // 1. Mark the acting unit as having acted
      if (unit.instanceId === payload.sourceId && unit.instanceId === activeTurnId) {
         return { ...unit, hasActedThisRound: true };
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
           } else {
               newDebuffs.push(effect);
               combatLogs.push({ id: effect.id, message: `${unit.name} afflicted by ${statusName}.`, type: 'damage' });
           }
        };

        if (payload.ability) {
           const abil = payload.ability;

           // 1. Process 'hits' array
           if (abil.hits && abil.hits.length > 0) {
              abil.hits.forEach((hit, index) => {
                let hitDamage = 0;
                if (hit.damageType === 'Physical') {
                  const mitigation = Math.max(1, unit.stats.base.physicality || 1);
                  hitDamage = Math.floor((sourcePotencyPhysical * hit.multiplier) / mitigation);
                } else if (hit.damageType === 'Spiritual') {
                  const mitigation = Math.max(1, unit.stats.base.spirit || 1);
                  hitDamage = Math.floor((sourcePotencySpiritual * hit.multiplier) / mitigation);
                } else if (hit.damageType === 'True') {
                  hitDamage = Math.floor(sourcePotencyPhysical * hit.multiplier); // True ignores mitigation
                }
                if (hitDamage < 1) hitDamage = 1;

                totalDamageDealt += hitDamage;
                newHp = Math.max(0, newHp - hitDamage);
                
                combatLogs.push({
                  id: Date.now().toString() + '-' + index + '-' + unit.instanceId,
                  message: `${sourceUnit.name} hit ${unit.name} for ${hitDamage} ${hit.damageType} damage.`,
                  type: 'damage'
                });

                if (hit.statusEffect) applyStatus(hit.statusEffect);
                InternalLogger.debug('combat', `[HIT] ${sourceUnit.name} -> ${unit.name} = ${hitDamage} (${hit.damageType})`);
              });
           } else if (abil.baseDamage) {
              // Fallback simple baseDamage
              const mitigationFactor = Math.max(1, unit.stats.base.physicality || 1);
              let actualDamage = Math.floor((sourcePotencyPhysical * abil.baseDamage) / mitigationFactor);
              if (actualDamage < 1) actualDamage = 1;

              totalDamageDealt += actualDamage;
              newHp = Math.max(0, newHp - actualDamage);
              combatLogs.push({
                id: Date.now().toString() + '-legacy-' + unit.instanceId,
                message: `${sourceUnit.name} hit ${unit.name} for ${actualDamage} damage.`,
                type: 'damage'
              });
           }

           // 2. Process baseHeal
           if (abil.baseHeal) {
              const maxHp = unit.stats.base.capacity ? unit.stats.base.capacity * 10 : 100;
              const healAmt = Math.floor(sourcePotencySpiritual * abil.baseHeal);
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

        } else {
           // Legacy un-typed damage/healing payloads
           if (payload.damage) {
              const mitigationFactor = Math.max(1, unit.stats.base.physicality || 1);
              let actualDamage = Math.floor(payload.damage * (sourcePotencyPhysical / mitigationFactor));
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

        return { 
          ...unit, 
          currentHp: newHp,
          buffs: newBuffs,
          debuffs: newDebuffs,
          isDead: newHp <= 0
        };
      }
      return unit;
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
    get().advanceTurn();
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
    set({ activeTurnId: null, logs: [...get().logs, { id: Date.now().toString(), message: victory ? "Victory Achieved." : "Proxy Wiped.", type: 'system' }] });
    
    // Simulate a brief delay before routing so player can read the log
    setTimeout(() => {
        if (victory) {
            useGameStore.getState().setScene('reward');
        } else {
            useGameStore.getState().endRun(false);
        }
    }, 2000);
  }
}));
