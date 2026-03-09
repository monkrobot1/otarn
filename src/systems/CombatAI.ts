import type { ActiveCharacter, Ability } from '../types/character';

/**
 * Combat AI Models for different unit types and bosses.
 * Handles selecting an AI intent (Ability + Targets) based on the current combat state.
 */
export class CombatAI {
  static determineEnemyAction(
    enemy: ActiveCharacter,
    allies: ActiveCharacter[], // Player characters
    enemies: ActiveCharacter[] // Other enemies
  ): { targetIds: string[]; ability: Ability } | null {
    if (enemy.isDead || !enemy.abilities || enemy.abilities.length === 0) return null;

    const aliveAllies = allies.filter(a => !a.isDead);
    const aliveEnemies = enemies.filter(e => !e.isDead);

    if (aliveAllies.length === 0) return null;

    // Available abilities that the enemy has MP for
    const availableAbilities = enemy.abilities.filter(a => enemy.currentMp >= (a.costMP || 0));
    
    // Default to the first available ability (usually basic attack) or just their first attack if out of MP
    let selectedAbility = availableAbilities.length > 0 ? availableAbilities[0] : enemy.abilities[0];
    
    // Classify Unit Type for AI Model
    const isBoss = enemy.baseId.includes('BOSS') || enemy.combatRole === 'Boss';
    const isHealer = enemy.abilities.some(a => a.baseHeal && a.baseHeal > 0);
    const isSupport = enemy.abilities.some(a => a.targeting === 'all_allies' || a.targeting === 'ally');

    if (availableAbilities.length > 1) {
        const rand = Math.random();
        
        const healerAbility = availableAbilities.find(a => a.baseHeal && a.baseHeal > 0);
        const ultimateAbility = availableAbilities.find(a => a.id.includes('_ULT'));
        const special2Ability = availableAbilities.find(a => a.id.includes('_SP2'));
        const special1Ability = availableAbilities.find(a => a.id.includes('_SP1'));

        // 1. Healer AI Model
        if (isHealer && healerAbility) {
             // Check if any ally is below 50% health (estimating max HP simply as generic)
             const woundedAlly = aliveEnemies.find(e => {
                  const maxHpEst = 10 + (e.stats.base.capacity * 5); // very rough estimate
                  return (e.currentHp / maxHpEst) < 0.6; 
             });
             
             if (woundedAlly && rand < 0.8) { // 80% chance to heal heavily wounded teammates
                  selectedAbility = healerAbility;
             }
        } 
        // 2. Boss AI Model
        else if (isBoss) {
            // Bosses rotate abilities aggressively
            if (ultimateAbility && rand > 0.85) { // 15% chance to use Ultimate
                selectedAbility = ultimateAbility;
            } else if (special2Ability && rand > 0.5 && rand <= 0.85) { // 35% chance to use SP2
                selectedAbility = special2Ability;
            } else if (special1Ability && rand > 0.2 && rand <= 0.5) { // 30% chance to use SP1
                selectedAbility = special1Ability;
            }
            // 20% chance to Basic Attack
        } 
        // 3. Support AI Model
        else if (isSupport) {
            const supportAbility = special1Ability || special2Ability;
            if (supportAbility && supportAbility.targeting === 'all_allies' && rand > 0.5) {
                selectedAbility = supportAbility; // 50% chance to mass buff team
            } else if (special1Ability && rand > 0.7) {
                selectedAbility = special1Ability;
            }
        }
        // 4. Standard Aggressive Model (Frontline/Grappler/Caster)
        else {
             if (special2Ability && rand > 0.8) { // 20% chance for heavy special
                 selectedAbility = special2Ability;
             } else if (special1Ability && rand > 0.5) { // 30% chance for light special
                 selectedAbility = special1Ability;
             }
             // 50% chance to Basic Attack
        }
    }

    // Determine Targets Based on Ability
    let targetIds: string[] = [];
    
    // Melee attacks (Hit VFX) cannot bypass the frontline if one exists
    const isMelee = selectedAbility.vfxType === 'hit';
    
    let validEnemiesToHit = aliveAllies;
    if (isMelee && selectedAbility.targeting === 'enemy') {
         const hasFrontline = validEnemiesToHit.some(a => a.combatRole === 'Frontline' || a.combatRole === 'Boss');
         if (hasFrontline) {
             validEnemiesToHit = validEnemiesToHit.filter(a => a.combatRole === 'Frontline' || a.combatRole === 'Boss');
         }
    }

    // Sort valid players by HP (lowest to highest) to pick off weak targets
    const lowestHpTarget = validEnemiesToHit.slice().sort((a, b) => a.currentHp - b.currentHp)[0];
    const randomTarget = validEnemiesToHit[Math.floor(Math.random() * validEnemiesToHit.length)];

    switch (selectedAbility.targeting) {
      case 'all_enemies':
        // For enemies, "all_enemies" means all players
        targetIds = aliveAllies.map(a => a.instanceId);
        break;
      case 'enemy':
        // Smart Targeting: 40% chance to focus lowest HP player, 60% chance to hit randomly
        targetIds = [Math.random() > 0.6 ? lowestHpTarget.instanceId : randomTarget.instanceId];
        break;
      case 'all_allies':
        // For enemies, "all_allies" means all other enemies
        targetIds = aliveEnemies.map(e => e.instanceId);
        break;
      case 'ally': {
        // Smart Targeting for Heals/Buffs: Target the most wounded ally
        const lowestHpTeammate = aliveEnemies.slice().sort((a, b) => a.currentHp - b.currentHp)[0];
        targetIds = [lowestHpTeammate.instanceId];
        break;
      }

      case 'self':
        targetIds = [enemy.instanceId];
        break;
      default:
        targetIds = [randomTarget.instanceId];
    }

    return { targetIds, ability: selectedAbility };
  }
}
