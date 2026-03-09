import { CharacterFactory } from '../core/CharacterFactory';
import { EncounterManager } from '../core/EncounterManager';
import { generateMap } from '../core/MapGenerator';
import type { ActiveCharacter } from '../types/character';
import type { MapNode } from '../types/map';
import type { GlobalSaveData, RunStateData } from '../types/save';
import talentsData from '../data/talents.json';
import relicsData from '../data/relics.json';
import { CombatAI } from './CombatAI';
import { calculatePartyPowerProfile } from '../utils/powerLevel';

export interface SimRunStats {
    battlesFought: number;
    eventsEncountered: number;
    restsTaken: number;
    shopsVisited: number;
    elitesDefeated: number;
    bossesDefeated: number;
    totalDamageTaken: number;
    finalSparks: number;
    win: boolean;
    logs: string[];
}

export interface SimGameState {
    party: ActiveCharacter[];
    ephemeralFaith: number;
    activeRelics: string[];
    activeBlessings: string[];
    currentNode: MapNode | null;
    divineSparks: number;
    activeTalents: string[];
}

export interface SimConfig {
    startingPartyBaseIds?: [string, string, string, string];
    startingRelics?: string[];
    startingFaith?: number;
    delayMs?: number;
    importedGlobalData?: GlobalSaveData | null;
    importedRunData?: RunStateData | null;
}

/**
 * A headless engine that can play an entire Run systematically,
 * making semi-optimal decisions and resolving combats quickly.
 */
export class AutoRunEngine {
    
    // Simulate a single fast run. Returns telemetry and logs.
    static async simulateRun(opts?: {
        config?: SimConfig;
        onLog?: (log: string) => void;
        onStateUpdate?: (state: SimGameState) => void;
    }): Promise<SimRunStats> {
        const { onLog, onStateUpdate, config } = opts || {};
        const delayMs = config?.delayMs || 0;
        
        const stats: SimRunStats = {
            battlesFought: 0,
            eventsEncountered: 0,
            restsTaken: 0,
            shopsVisited: 0,
            elitesDefeated: 0,
            bossesDefeated: 0,
            totalDamageTaken: 0,
            finalSparks: 0,
            win: false,
            logs: []
        };

        let currentParty: ActiveCharacter[] = [];
        let currentFaith = 50;
        let currentRelics: string[] = [];
        let currentBlessings: string[] = [];
        let currentTalents: string[] = [];
        let currentMapNode: MapNode | null = null;

        const emitState = () => {
            if (onStateUpdate) {
                // Return shallow copies so React detects changes
                onStateUpdate({
                    party: currentParty.map(p => ({ ...p, stats: { ...p.stats, current: { ...p.stats.current } } })),
                    ephemeralFaith: currentFaith,
                    activeRelics: [...currentRelics],
                    activeBlessings: [...currentBlessings],
                    currentNode: currentMapNode,
                    divineSparks: stats.finalSparks,
                    activeTalents: [...currentTalents]
                });
            }
        };

        const addLog = async (msg: string) => {
            const timeStr = `[TURN ${stats.battlesFought + stats.eventsEncountered + stats.restsTaken + stats.shopsVisited}]`;
            const formatted = `${timeStr} ${msg}`;
            stats.logs.push(formatted);
            if (onLog) onLog(formatted);
            emitState();
            if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
        };

        await addLog('--- INITIATING HEADLESS RUN PROTOCOL ---');
        
        let map = generateMap(false);

        if (config?.importedRunData && config.importedRunData.runActive) {
            await addLog('--- IMPORTING ACTIVE RUN DATA ---');
            
            // Deep clone to prevent mutating the store
            currentParty = JSON.parse(JSON.stringify(config.importedRunData.activeParty));
            currentFaith = config.importedRunData.ephemeralFaith;
            currentRelics = [...config.importedRunData.activeRelics];
            currentBlessings = [...config.importedRunData.activeBlessings];
            currentTalents = [...(config.importedRunData.activeTalents || [])];
            
            if (config.importedRunData.generatedMap) {
                map = [...config.importedRunData.generatedMap];
            }
            
            currentMapNode = map.find(n => n.id === config.importedRunData!.currentNodeId) || map.find(n => n.id.includes('c0')) || null;
            
            if (!currentMapNode) {
                 await addLog('ERROR: Malformed map payload in save. Aborting.');
                 return stats;
            }
            await addLog(`Resuming run from Node: [${currentMapNode.type.toUpperCase()}]`);

        } else {
            // Setup fresh Party
            const partyIds = config?.startingPartyBaseIds || [
                'CHR_ORD_GRV_001', 'CHR_LOV_BLD_001', 'CHR_JUD_DTH_001', 'CHR_CHA_AIR_001'
            ];
            
            const P1 = CharacterFactory.createFromBaseId(partyIds[0], 1);
            const P2 = CharacterFactory.createFromBaseId(partyIds[1], 1);
            const P3 = CharacterFactory.createFromBaseId(partyIds[2], 1);
            const P4 = CharacterFactory.createFromBaseId(partyIds[3], 1);
            
            if (!P1 || !P2 || !P3 || !P4) {
                await addLog('ERROR: Could not instantiate starting party. Aborting.');
                return stats;
            }

            if (config?.importedGlobalData?.permanentStatBonuses) {
                 const bonuses = config.importedGlobalData.permanentStatBonuses;
                 [P1, P2, P3, P4].forEach(p => {
                     if (p) {
                         if (bonuses.capacity) p.stats.base.capacity += bonuses.capacity;
                         if (bonuses.physicality) p.stats.base.physicality += bonuses.physicality;
                         if (bonuses.spirit) p.stats.base.spirit += bonuses.spirit;
                         // Add more stats as needed
                         p.currentHp = CharacterFactory.calculateMaxHp(p.stats.base, p.level);
                     }
                 });
                 await addLog('Applied Diamond Throne Stat Bonuses to fresh party.');
            }

            currentParty = [P1, P2, P3, P4] as ActiveCharacter[];
            currentFaith = config?.startingFaith ?? 50;
            currentRelics = config?.startingRelics ? [...config.startingRelics] : ['REL_STARTING_01']; 
            currentBlessings = [];

            await addLog(`Generated Sector 1 Map with ${map.length} nodes.`);

            currentMapNode = map.find(n => n.id.includes('c0')) || null; // start col

            if (!currentMapNode) {
                 await addLog('ERROR: Malformed map payload. Aborting.');
                 return stats;
            }

            await addLog(`Selected Start Node: [${currentMapNode.type.toUpperCase()}] at C0.`);
        }

        let isDead = false;

        // Main Run Loop
        while (currentMapNode && !isDead) {
             // 1. Resolve Current Node
             switch (currentMapNode.type) {
                 case 'combat':
                 case 'elite':
                 case 'boss': {
                     const isElite = currentMapNode.type === 'elite';
                     const isBoss = currentMapNode.type === 'boss';
                     
                     const enemies = EncounterManager.generateEncounter(currentMapNode.type, 'Judgment', 1); // Fixed level 1 for now
                     
                     const partyCP = calculatePartyPowerProfile(currentParty).totalScore;
                     const enemyCP = calculatePartyPowerProfile(enemies).totalScore;
                     await addLog(`Initiating ${currentMapNode.type.toUpperCase()} encounter... [ALLY CP: ${partyCP} vs ENEMY CP: ${enemyCP}]`);
                     
                     // Resolve Headless Combat
                     const { result, damageTaken, turns, log } = this.resolveHeadlessCombat(currentParty, enemies, currentRelics);
                     
                     if (opts?.config?.delayMs && opts.config.delayMs > 0 && log && log.length > 0) {
                        for (const l of log) {
                           await addLog(`[COMBAT] ${l}`);
                           // Optional super short delay so it doesn't instantly snap
                           if (opts?.config?.delayMs > 100) await new Promise(r => setTimeout(r, 20));
                        }
                     }
                     
                     stats.totalDamageTaken += damageTaken;
                     
                     if (result === 'win') {
                         await addLog(`Combat won in ${turns} turns. Taking ${damageTaken} total damage.`);
                         stats.battlesFought++;
                         if (isElite) stats.elitesDefeated++;
                         if (isBoss) stats.bossesDefeated++;
                         
                         // Post combat heal & reward logic
                         const faithEarned = isElite ? 30 : isBoss ? 100 : 10;
                         currentFaith += faithEarned;
                         const sparksEarned = isElite ? 3 : isBoss ? 10 : 1;
                         stats.finalSparks += sparksEarned;
                         
                         // XP & Leveling
                         const avgLevel = currentParty.reduce((sum, p) => sum + p.level, 0) / currentParty.length || 1;
                         const baseXP = CharacterFactory.calculateXpRequired(Math.floor(avgLevel));
                         const xpGained = isBoss ? Math.floor(baseXP * 2.0) : isElite ? Math.floor(baseXP * 1.5) : baseXP;
                         await addLog(`Party gained ${xpGained} XP from combat.`);
                         
                         let leveledUp = false;
                         currentParty.forEach(p => {
                             p.currentXp = (p.currentXp || 0) + xpGained;
                             if (!p.xpToNextLevel) p.xpToNextLevel = CharacterFactory.calculateXpRequired(p.level);
                             while (p.currentXp >= p.xpToNextLevel) {
                                  p.currentXp -= p.xpToNextLevel;
                                  p.level += 1;
                                  p.xpToNextLevel = CharacterFactory.calculateXpRequired(p.level);
                                  Object.assign(p, CharacterFactory.applyLevelUpStats(p));
                                  p.currentHp = Math.min(CharacterFactory.calculateMaxHp(p.stats.base, p.level), p.currentHp + 20);
                                  leveledUp = true;
                             }
                         });

                         let newRelicId: string | null = null;
                         if (isElite || isBoss) {
                             const pool = (relicsData as {id: string, name: string, effect: string, tier: string}[]).filter(r => r.tier === (isBoss ? 'Epic' : 'Rare') || r.tier === (isBoss ? 'Divine' : 'Uncommon'));
                             if (pool.length > 0) {
                                 const rand = pool[Math.floor(Math.random() * pool.length)];
                                 newRelicId = rand.id;
                                 currentRelics.push(newRelicId);
                             } else {
                                 newRelicId = `RELIC_GENERIC_${stats.battlesFought}`;
                                 currentRelics.push(newRelicId);
                             }
                         }

                         let draftedTalent = null;
                         if (leveledUp) {
                             const possibleTalents = talentsData.filter(t => !currentTalents.includes(t.id));
                             if (possibleTalents.length > 0) {
                                 const randomDraft = possibleTalents[Math.floor(Math.random() * possibleTalents.length)];
                                 currentTalents.push(randomDraft.id);
                                 draftedTalent = randomDraft;
                             }
                         }

                         await addLog(`Recovered ${sparksEarned} Divine Sparks and ${faithEarned} Faith.`);
                         if (newRelicId) {
                             const rData = (relicsData as {id: string, name: string, effect: string, tier: string}[]).find(r => r.id === newRelicId);
                             if (rData) await addLog(`Acquired Rare Artifact: [${rData.name}] - ${rData.effect}`);
                             else await addLog(`Acquired Rare Artifact: [${newRelicId}].`);
                         }
                         if (leveledUp) {
                             await addLog(`Party Leveled UP to LVL ${currentParty[0].level}! Base stats increased.`);
                             if (draftedTalent) {
                                 await addLog(`AI Drafted Talent Option: [${draftedTalent.name}] (${draftedTalent.category})`);
                             }
                         }
                         
                     } else {
                         await addLog(`PARTY WIPED. Total damage taken: ${damageTaken}. Terminating Run.`);
                         isDead = true;
                     }
                     break;
                 }
                 case 'event': {
                     await addLog(`Encountered strange anomaly. Resolving random event...`);
                     const roll = Math.random();
                     if (roll > 0.6) {
                         // Good event
                         const healAmt = 20;
                         currentParty.forEach(p => p.currentHp = Math.min(CharacterFactory.calculateMaxHp(p.stats.base, p.level), p.currentHp + healAmt));
                         await addLog(`Event cleared: Party healed for 20 HP.`);
                     } else if (roll > 0.3) {
                         // Neutral/Treasure event
                         currentFaith += 25;
                         stats.finalSparks += 1;
                         await addLog(`Event completed: Found 25 Faith and 1 Divine Spark.`);
                     } else {
                         // Bad event
                         const dmgAmt = 10;
                         currentParty.forEach(p => p.currentHp -= dmgAmt);
                         stats.totalDamageTaken += dmgAmt * currentParty.length;
                         await addLog(`Event failure: Party took 10 damage each.`);
                         if (currentParty.every(p => p.currentHp <= 0)) isDead = true;
                     }
                     stats.eventsEncountered++;
                     break;
                 }
                 case 'rest': {
                     await addLog(`Camp discovered. Resting...`);
                     // Heal 30% of max health
                     currentParty.forEach(p => {
                         const max = CharacterFactory.calculateMaxHp(p.stats.base, p.level);
                         p.currentHp = Math.min(max, p.currentHp + Math.floor(max * 0.3));
                     });
                     await addLog(`Party recovered 30% HP.`);
                     stats.restsTaken++;
                     break;
                 }
                 case 'shop': {
                     await addLog(`Shop entered. Current Faith: ${currentFaith}`);
                     if (currentFaith >= 50) {
                         currentFaith -= 50;
                         currentRelics.push(`SHOP_RELIC_${stats.shopsVisited + 1}`);
                         await addLog(`Purchased random Relic for 50 Faith.`);
                     } else {
                         await addLog(`Insufficient funds. Leaving shop.`);
                     }
                     stats.shopsVisited++;
                     break;
                 }
             }

             if (isDead) break;

             // Map Win Check
             if (currentMapNode.type === 'boss') {
                 await addLog(`SECTOR 1 BOSS DEFEATED! Proceeding to next phase...`);
                 stats.win = true;
                 break;
             }

             // 2. Routing Logic (Pick next node based on AI priorities)
             if (currentMapNode.connections.length > 0) {
                 // For now, simple greedy AI: prefers Rests > Shops (if money) > Events > Combat > Elites
                 const options = currentMapNode.connections.map(id => map.find(n => n.id === id)).filter(Boolean) as MapNode[];
                 
                 // Sort options by desire
                 options.sort((a, b) => {
                     const score = (node: MapNode) => {
                         if (node.type === 'rest') return currentParty.some(p => p.currentHp < 30) ? 10 : 3;
                         if (node.type === 'shop') return currentFaith >= 50 ? 8 : 1;
                         if (node.type === 'event') return 6;
                         if (node.type === 'combat') return 4;
                         if (node.type === 'elite') return currentParty.every(p => p.currentHp > 50) ? 7 : 0; // high risk/reward
                         return 5;
                     };
                     return score(b) - score(a);
                 });

                 currentMapNode = options[0];
                 await addLog(`AI Routed to next node: [${currentMapNode.type.toUpperCase()}]`);
             } else {
                 await addLog(`ERROR: No connections found! Dead end.`);
                 break;
             }
        }

        if (stats.win) {
            await addLog('RUN SUCCESSFUL.');
        } else {
            await addLog('RUN FAILURE.');
        }

        return stats;
    }

    private static resolveHeadlessCombat(allies: ActiveCharacter[], enemies: ActiveCharacter[], activeRelics: string[] = []): { result: 'win'|'loss', damageTaken: number, turns: number, log?: string[] } {
        const allAllies = [...allies].map(a => ({ ...a, debuffs: [...(a.debuffs || [])], buffs: [...(a.buffs || [])] }));
        const allEnemies = [...enemies].map(e => ({ ...e, debuffs: [...(e.debuffs || [])], buffs: [...(e.buffs || [])] }));
        
        const initialCombinedHp = allies.reduce((sum, a) => sum + (a.isDead ? 0 : a.currentHp), 0);
        let currentRound = 0;
        let combatOver = false;
        let victory = false;
        const log: string[] = [];

        let allyDmgMod = 1.0;
        if (activeRelics.includes('REL_DEFAULT')) allyDmgMod *= 1.2;

        while (!combatOver && currentRound < 100) {
            currentRound++;

            allAllies.forEach(a => a.hasActedThisRound = false);
            allEnemies.forEach(e => e.hasActedThisRound = false);

            const roundQueue = [...allAllies, ...allEnemies]
                .filter(u => !u.isDead)
                .sort((a,b) => b.stats.current.fate - a.stats.current.fate);

            while (roundQueue.length > 0 && !combatOver) {
                const livingAllies = allAllies.filter(a => !a.isDead);
                const livingEnemies = allEnemies.filter(a => !a.isDead);
                if (livingAllies.length === 0) { combatOver = true; victory = false; break; }
                if (livingEnemies.length === 0) { combatOver = true; victory = true; break; }

                const actor = roundQueue.shift();
                if (!actor || actor.isDead) continue;

                let isStunned = false;
                let dotDamage = 0;
                
                // actor.currentMp = Math.min(5 + (actor.stats.base.capacity * 10), actor.currentMp + Math.floor((5 + (actor.stats.base.capacity * 10)) * 0.1));
                
                actor.debuffs = actor.debuffs.map(d => {
                    if (d.type === 'Stun') isStunned = true;
                    if (d.type === 'Bleed' || d.type === 'Poison' || d.type === 'Decay') dotDamage += d.value || 5;
                    return { ...d, duration: d.duration - 1 };
                }).filter(d => d.duration > 0);
                
                actor.buffs = actor.buffs.map(b => ({ ...b, duration: b.duration - 1 })).filter(b => b.duration > 0);

                if (dotDamage > 0) actor.currentHp -= dotDamage;
                if (actor.currentHp <= 0) actor.isDead = true;

                if (actor.isDead || isStunned) continue;

                const isPlayer = allAllies.some(a => a.instanceId === actor.instanceId);
                const friendlyTeam = isPlayer ? allAllies : allEnemies;
                const enemyTeam = isPlayer ? allEnemies : allAllies;
                
                // Uses the core logic layer for the headless actor selection
                const aiDecision = CombatAI.determineEnemyAction(actor, enemyTeam, friendlyTeam);
                
                if (aiDecision && aiDecision.ability) {
                    const abil = aiDecision.ability;
                    actor.currentMp = Math.max(0, actor.currentMp - (abil.costMP || 0));
                    if (abil.costRevelation) actor.currentRevelation = Math.max(0, (actor.currentRevelation || 0) - abil.costRevelation);
                    else actor.currentRevelation = Math.min(100, (actor.currentRevelation || 0) + 15);

                    const targetsToProcess = [...friendlyTeam, ...enemyTeam].filter(t => aiDecision.targetIds.includes(t.instanceId));

                    let sourcePotencyPhysical = actor.stats.base.physicality || 1;
                    let sourcePotencySpiritual = actor.stats.base.authority || 1;

                    if (isPlayer) {
                        if (abil.id.includes('_ULT')) {
                            sourcePotencyPhysical *= 100;
                            sourcePotencySpiritual *= 100;
                        }
                        sourcePotencyPhysical *= allyDmgMod;
                        sourcePotencySpiritual *= allyDmgMod;
                    }

                    targetsToProcess.forEach(target => {
                        if (target.isDead) return;
                        
                        if (abil.hits && abil.hits.length > 0) {
                            abil.hits.forEach(hit => {
                                let hitDmg = 0;
                                const isCrit = Math.random() < ((actor.stats.current.destiny || 5) / 100);
                                const BASE_SCALAR = 20;

                                if (hit.damageType === 'Physical') hitDmg = Math.floor((sourcePotencyPhysical * hit.multiplier * BASE_SCALAR) / Math.max(1, target.stats.base.physicality || 1));
                                else if (hit.damageType === 'Spiritual') hitDmg = Math.floor((sourcePotencySpiritual * hit.multiplier * BASE_SCALAR) / Math.max(1, target.stats.base.spirit || 1));
                                else if (hit.damageType === 'True') hitDmg = Math.floor(sourcePotencyPhysical * hit.multiplier * BASE_SCALAR);

                                hitDmg = isCrit ? Math.floor(hitDmg * 1.5) : hitDmg;
                                target.currentHp -= Math.max(1, hitDmg);
                                
                                log.push(`${actor.name} used ${abil.name} on ${target.name} for ${Math.max(1, hitDmg)} ${hit.damageType} damage${isCrit ? ' (CRIT)' : ''}.`);
                                
                                if (target.currentHp <= 0) {
                                    target.isDead = true;
                                    log.push(`${target.name} was SLAIN!`);
                                }

                                if (hit.statusEffect) target.debuffs.push({ id: Math.random().toString(), type: hit.statusEffect as any, duration: 3, value: 5 });
                                if (!isPlayer && allAllies.some(a => a.instanceId === target.instanceId)) target.currentRevelation = Math.min(100, (target.currentRevelation || 0) + 20); 
                            });
                        } else if (abil.baseDamage) {
                            let actualDmg = Math.floor((sourcePotencyPhysical * abil.baseDamage * 20) / Math.max(1, target.stats.base.physicality || 1));
                            const isCrit = Math.random() < ((actor.stats.current.destiny || 5) / 100);
                            actualDmg = isCrit ? Math.floor(actualDmg * 1.5) : actualDmg;
                            target.currentHp -= Math.max(1, actualDmg);
                            
                            log.push(`${actor.name} used ${abil.name} on ${target.name} for ${Math.max(1, actualDmg)} damage${isCrit ? ' (CRIT)' : ''}.`);
                            
                            if (target.currentHp <= 0) {
                                target.isDead = true;
                                log.push(`${target.name} was SLAIN!`);
                            }
                            if (!isPlayer && allAllies.some(a => a.instanceId === target.instanceId)) target.currentRevelation = Math.min(100, (target.currentRevelation || 0) + 20);
                        }

                        if (abil.baseHeal) {
                            const maxHp = 10 + (target.stats.base.capacity * 5) + (target.level * target.stats.base.capacity);
                            const healAmount = Math.floor(sourcePotencySpiritual * abil.baseHeal * 5);
                            target.currentHp = Math.min(maxHp, target.currentHp + healAmount);
                            log.push(`${actor.name} healed ${target.name} for ${healAmount} HP using ${abil.name}.`);
                        }
                    });
                }
            }
        }

        allies.forEach(realAlly => {
            const simAlly = allAllies.find(a => a.instanceId === realAlly.instanceId);
            if (simAlly) {
                // End of battle MP recharge based on capacity
                const maxMp = simAlly.stats.base ? 5 + (simAlly.stats.base.capacity * 10) : 100;
                const mpRegen = Math.floor(maxMp * 0.5);
                
                realAlly.currentHp = simAlly.currentHp;
                realAlly.currentMp = Math.min(maxMp, simAlly.currentMp + mpRegen);
                realAlly.currentRevelation = simAlly.currentRevelation;
                realAlly.isDead = simAlly.isDead;
                realAlly.buffs = []; // clear buffs/debuffs on combat end
                realAlly.debuffs = []; 
            }
        });

        const finalCombinedHp = allies.reduce((sum, a) => sum + (a.isDead ? 0 : a.currentHp), 0);

        return {
            result: victory ? 'win' : 'loss',
            damageTaken: initialCombinedHp - finalCombinedHp,
            turns: currentRound,
            log
        };
    }
}
