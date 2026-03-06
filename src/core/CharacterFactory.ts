import type { ActiveCharacter, BaseCharacter, Ability } from '../types/character';
import type { StatBlock } from '../types/stats';
import charactersData from '../data/characters.json';
import enemiesData from '../data/enemies.json';

const allBaseData = [...charactersData, ...enemiesData];

// Define growth matrices for primary roles (simplification of individual classes for prototype)
const RoleGrowthModifiers: Record<string, Partial<StatBlock>> = {
  'Frontline': {
    capacity: 2,
    physicality: 1.5,
    spirit: 1.5,
    grace: 0.8
  },
  'Backline': {
    capacity: 1,
    acumen: 1.8,
    authority: 1.8,
    fate: 1.2
  },
  // We can add distinct class-based curves later
};

const BASE_HP_MULTIPLIER = 5;
const BASE_MP_MULTIPLIER = 10;
const HP_GROWTH_PER_LEVEL = 1;

export class CharacterFactory {
  /**
   * Generates a fully playable ActiveCharacter from a JSON base template.
   */
  static createFromBaseId(baseId: string, level: number = 1): ActiveCharacter | null {
    // 1. Find the base data in the JSON
    const dataRow = allBaseData.find(c => c.id === baseId);
    if (!dataRow) {
      console.error(`Character ID ${baseId} not found in characters.json or enemies.json`);
      return null;
    }

    const baseData = dataRow as unknown as BaseCharacter; 
    console.log(`[CharacterFactory] Creating ${baseId}, Manifest present:`, !!baseData.spriteManifest);

    // 2. Map the base stats
    const scaledStats: StatBlock = { ...baseData.stats };

    // 3. Apply leveling math
    const roleMod = RoleGrowthModifiers[baseData.classRole === 'Frontline' ? 'Frontline' : 'Backline'] || {};
    
    // Simulate level ups (very basic linear scaling for prototype)
    if (level > 1) {
      const levelUps = level - 1;
      scaledStats.physicality += Math.floor(levelUps * (roleMod.physicality || 1));
      scaledStats.authority += Math.floor(levelUps * (roleMod.authority || 1));
      scaledStats.grace += Math.floor(levelUps * (roleMod.grace || 1));
      scaledStats.acumen += Math.floor(levelUps * (roleMod.acumen || 1));
      scaledStats.spirit += Math.floor(levelUps * (roleMod.spirit || 1));
      scaledStats.fate += Math.floor(levelUps * (roleMod.fate || 1));
      scaledStats.capacity += Math.floor(levelUps * (roleMod.capacity || 1));
      // Destiny typically doesn't scale with standard levels unless specific.
    }

    // 4. Calculate Derived Vitals
    // Max HP: Base HP (10) + (Capacity * 5) + (Level * Capacity * HP_GROWTH_PER_LEVEL)
    const maxHp = 10 + (scaledStats.capacity * BASE_HP_MULTIPLIER) + (level * scaledStats.capacity * HP_GROWTH_PER_LEVEL);
    
    // Max MP: Base MP (5) + (Capacity * 10)
    const maxMp = 5 + (scaledStats.capacity * BASE_MP_MULTIPLIER);

    // Generate a sleek 512x512 Sci-Fi placeholder
    const encodedName = encodeURIComponent(baseData.name);
    const roleColor = baseData.classRole === 'Frontline' ? 'E63946' 
                    : baseData.classRole === 'Backline' ? '457B9D' 
                    : baseData.classRole === 'Boss' ? 'FFB703' 
                    : '1D3557';
    const portraitUrl = `https://placehold.co/512x512/000000/${roleColor}?text=${encodedName}`;

    // Generate role-specific abilities based on exact Base ID/Class
    let abilities: Ability[] = [];

    switch(baseData.id) {
        case 'CHR_JUD_CAN_001': // Siege Cannoneer
             abilities = [
                 { id: 'ABIL_CAN_ATK', name: 'Shatter-Shot', costMP: 0, costTU: 120, description: 'Solid slug delaying target timeline.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Physical' }] },
                 { id: 'ABIL_CAN_SP1', name: 'Artillery Bombardment', costMP: 20, costTU: 150, description: 'Massive delayed AoE damage.', targeting: 'all_enemies', hits: [{ multiplier: 2.5, damageType: 'Physical' }] },
                 { id: 'ABIL_CAN_SP2', name: 'Overcharge Reactor', costMP: 0, costTU: 80, description: 'Self-damage for double next attack damage.', targeting: 'self', statusEffects: ['Overcharge'] },
                 { id: 'ABIL_CAN_ULT', name: 'God-Killer Ordinance', costMP: 0, costTU: 0, description: 'Obliterates target ignoring armor.', targeting: 'enemy', hits: [{ multiplier: 5.0, damageType: 'True' }] }
             ];
             break;
        case 'CHR_JUD_DCY_001': // Entropy Engine
             abilities = [
                 { id: 'ABIL_DCY_ATK', name: 'Corrosive Beam', costMP: 0, costTU: 100, description: 'Spiritual beam applying Decay.', targeting: 'enemy', hits: [{ multiplier: 0.5, damageType: 'Spiritual', statusEffect: 'Decay' }] },
                 { id: 'ABIL_DCY_SP1', name: 'Catalyst Outbreak', costMP: 15, costTU: 120, description: 'Spreads Decay stacks to all enemies.', targeting: 'all_enemies' },
                 { id: 'ABIL_DCY_SP2', name: 'Accelerated Entropy', costMP: 25, costTU: 150, description: 'Triggers active Decay instantly and strips buffs.', targeting: 'enemy' },
                 { id: 'ABIL_DCY_ULT', name: 'Heat Death', costMP: 0, costTU: 0, description: 'AoE true damage and massive Decay on death.', targeting: 'all_enemies', hits: [{ multiplier: 3.0, damageType: 'True' }] }
             ];
             break;
        case 'CHR_JUD_VOD_001': // Void-Borg
             abilities = [
                 { id: 'ABIL_VOD_ATK', name: 'Phase Strike', costMP: 0, costTU: 100, description: 'Teleports along timeline on hit.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Physical' }] },
                 { id: 'ABIL_VOD_SP1', name: 'Warp Prison', costMP: 30, costTU: 120, description: 'Banishes enemy/delays bosses heavily.', targeting: 'enemy' },
                 { id: 'ABIL_VOD_SP2', name: 'Singularity', costMP: 40, costTU: 150, description: 'Pulls enemies to timeline back.', targeting: 'all_enemies' },
                 { id: 'ABIL_VOD_ULT', name: 'Absolute Vacuum', costMP: 0, costTU: 0, description: 'Permanent core stat steal.', targeting: 'enemy', hits: [{ multiplier: 4.0, damageType: 'Physical' }] }
             ];
             break;
        // Generic fallbacks applying specialized Axiom status effects
        default: {
             let baseStatusEffect = 'Bleed';
             if (baseData.sector === 'Order') baseStatusEffect = 'Stun';
             if (baseData.sector === 'Love') baseStatusEffect = 'Poison';
             if (baseData.sector === 'Chaos') baseStatusEffect = 'Confusion';
             if (baseData.sector === 'Judgment') baseStatusEffect = 'Bleed';

             abilities = [
                 { id: `ABIL_GEN_ATK_${baseData.id}`, name: 'Strike', costMP: 0, costTU: 100, description: 'Basic attack.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Physical' }] },
                 { id: `ABIL_GEN_SP1_${baseData.id}`, name: 'Axiom Special', costMP: 10, costTU: 120, description: `Class Tactical inflicting ${baseStatusEffect}.`, targeting: 'enemy', hits: [{ multiplier: 1.5, damageType: 'Spiritual', statusEffect: baseStatusEffect }] },
                 { id: `ABIL_GEN_SP2_${baseData.id}`, name: 'Axiom Support', costMP: 20, costTU: 100, description: 'Class Support', targeting: 'ally', baseHeal: 5.0 },
                 { id: `ABIL_GEN_ULT_${baseData.id}`, name: 'Axiom Finisher', costMP: 0, costTU: 0, description: 'Ultimate Finisher', targeting: 'all_enemies', hits: [{ multiplier: 3.0, damageType: 'True', statusEffect: baseStatusEffect }] }
             ];
             break;
        }
    }

    const activeChar: ActiveCharacter = {
      instanceId: `INST_${baseData.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      baseId: baseData.id,
      name: baseData.name,
      portraitUrl,
      spriteManifest: baseData.spriteManifest, // Pass the manifest from JSON
      spriteSheet: baseData.spriteManifest?.idle || {
        url: '/assets/death_knight_attack_two_handed_death_knight_melee_attack.webp',
        cols: 10,
        rows: 10,
        totalFrames: 100
      },
      race: baseData.race,
      sector: baseData.sector,
      combatRole: baseData.classRole === 'Frontline' ? 'Frontline' : 'Backline',
      currentHp: maxHp,
      currentMp: maxMp,
      currentRevelation: 0,
      level: level,
      currentXp: 0,
      xpToNextLevel: CharacterFactory.calculateXpRequired(level),
      pendingLevelUps: 0,
      talents: [],
      stats: {
        base: scaledStats,
        current: { ...scaledStats }
      },
      abilities,
      hasActedThisRound: false,
      timelinePosition: 100,
      buffs: [],
      debuffs: [],
      isDead: false,
    };

    return activeChar;
  }

  static calculateXpRequired(currentLevel: number): number {
    return currentLevel * 100;
  }

  static calculateMaxHp(stats: StatBlock, level: number): number {
     return 10 + (stats.capacity * BASE_HP_MULTIPLIER) + (level * stats.capacity * HP_GROWTH_PER_LEVEL);
  }

  static applyLevelUpStats(character: ActiveCharacter): ActiveCharacter {
    const roleMod = RoleGrowthModifiers[character.combatRole] || {};
    
    const newBase: StatBlock = { ...character.stats.base };
    newBase.physicality += (roleMod.physicality || 1);
    newBase.authority += (roleMod.authority || 1);
    newBase.grace += (roleMod.grace || 1);
    newBase.acumen += (roleMod.acumen || 1);
    newBase.spirit += (roleMod.spirit || 1);
    newBase.fate += (roleMod.fate || 1);
    newBase.capacity += (roleMod.capacity || 1);

    Object.keys(newBase).forEach(k => {
      (newBase as any)[k] = Math.floor((newBase as any)[k]);
    });

    const maxHp = CharacterFactory.calculateMaxHp(newBase, character.level);
    const maxMp = 5 + (newBase.capacity * BASE_MP_MULTIPLIER);
    
    // Add current ratio of health or just flat increase
    const hpIncrease = maxHp - CharacterFactory.calculateMaxHp(character.stats.base, character.level - 1);
    const finalHp = Math.min(maxHp, character.currentHp + Math.max(0, hpIncrease));

    return {
      ...character,
      currentHp: finalHp,
      currentMp: maxMp,
      stats: {
        base: newBase,
        current: { ...newBase }
      }
    };
  }
}
