import type { GodIntervention } from '../types/save';

export const GOD_ABILITIES: Record<string, GodIntervention> = {
    // Judgment (Absence)
    'GOD_ABS_ZERO': {
        id: 'GOD_ABS_ZERO',
        name: 'Absolute Zero',
        description: 'Instantly execute any non-boss enemy below 30% HP.',
        faithCost: 40,
        effectType: 'execute',
        cooldown: 2
    },
    'GOD_SILENCE': {
        id: 'GOD_SILENCE',
        name: 'The Great Silence',
        description: 'For the next 2 rounds, enemies cannot use Spiritual skills.',
        faithCost: 50,
        effectType: 'status',
        cooldown: 3
    },
    'GOD_HEAT_DEATH': {
        id: 'GOD_HEAT_DEATH',
        name: 'Heat Death',
        description: 'Instantly trigger all DoT damage on all enemies twice.',
        faithCost: 60,
        effectType: 'damage',
        cooldown: 3
    },

    // Order (Law)
    'GOD_DECREE': {
        id: 'GOD_DECREE',
        name: 'Absolute Decree',
        description: 'Strip all buffs from all enemies and all debuffs from all allies.',
        faithCost: 45,
        effectType: 'dispel',
        cooldown: 2
    },
    'GOD_REWIND': {
        id: 'GOD_REWIND',
        name: 'Temporal Rewind',
        description: 'Restore the entire party to their HP/MP states at the start of combat.',
        faithCost: 80,
        effectType: 'heal',
        cooldown: 5
    },
    'GOD_CATHEDRAL': {
        id: 'GOD_CATHEDRAL',
        name: 'The Grand Cathedral',
        description: 'Grant a Divine Shield (blocks 1 hit) to the entire party.',
        faithCost: 40,
        effectType: 'shield',
        cooldown: 2
    },

    // Chaos (Primal)
    'GOD_BIG_BANG': {
        id: 'GOD_BIG_BANG',
        name: 'Primal Big Bang',
        description: 'Your next critical strike deals 50% splash damage to all other enemies.',
        faithCost: 50,
        effectType: 'damage',
        cooldown: 2
    },
    'GOD_UNLEASHED': {
        id: 'GOD_UNLEASHED',
        name: 'Maelstrom Unleashed',
        description: 'Next 3 multi-hit skills are guaranteed to hit their maximum number of strikes.',
        faithCost: 40,
        effectType: 'status',
        cooldown: 2
    },
    'GOD_WORLD_BREAKER': {
        id: 'GOD_WORLD_BREAKER',
        name: 'World Breaker',
        description: 'Next 3 Spiritual attacks ignore 100% of enemy Spirit (Resistance).',
        faithCost: 55,
        effectType: 'status',
        cooldown: 3
    },

    // Love (Creation)
    'GOD_GENESIS': {
        id: 'GOD_GENESIS',
        name: 'Genesis',
        description: 'Heal the party for 50% Max HP and permanently increase Max HP by 20% for this run.',
        faithCost: 70,
        effectType: 'heal',
        cooldown: 4
    },
    'GOD_LOVE': {
        id: 'GOD_LOVE',
        name: 'Unconditional Love',
        description: 'The next time any proxy would take a lethal hit, they are left at 1 HP instead.',
        faithCost: 60,
        effectType: 'status',
        cooldown: 5
    },
    'GOD_HIVE_MIND': {
        id: 'GOD_HIVE_MIND',
        name: 'Hive Mind',
        description: 'For 3 turns, all damage taken by any proxy is distributed evenly across the party.',
        faithCost: 50,
        effectType: 'status',
        cooldown: 3
    }
};
