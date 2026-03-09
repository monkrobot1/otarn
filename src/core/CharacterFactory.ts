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
    const portraitUrl = baseData.portraitUrl || `https://placehold.co/512x512/000000/${roleColor}?text=${encodedName}`;
    const fullArtUrl = baseData.fullArtUrl;

    // Generate role-specific abilities based on exact Base ID/Class
    let abilities: Ability[] = [];

    switch(baseData.id) {
        // --- Judgment Sector (Race: Null-Forged) ---
        case 'CHR_JUD_CAN_001': // Siege Cannoneer
             abilities = [
                 { id: 'ABIL_CAN_ATK', name: 'Shatter-Shot', costMP: 0, costTU: 120, description: 'Solid slug delaying target timeline.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Physical' }], vfxType: 'projectile', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_CAN_SP1', name: 'Artillery Bombardment', costMP: 20, costTU: 150, description: 'Massive delayed AoE damage.', targeting: 'all_enemies', hits: [{ multiplier: 2.5, damageType: 'Physical' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_CAN_SP1.svg' },
                 { id: 'ABIL_CAN_SP2', name: 'Overcharge Reactor', costMP: 0, costTU: 80, description: 'Self-damage for double next attack damage.', targeting: 'self', statusEffects: ['Overcharge'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_CAN_SP2.svg' , iconSprite: { sheet: 'judgment_ability_icons.png', row: 0, col: 2 } },
                 { id: 'ABIL_CAN_ULT', name: 'God-Killer Ordinance', costMP: 0, costTU: 0, costRevelation: 100, description: 'Obliterates target ignoring armor.', targeting: 'enemy', hits: [{ multiplier: 5.0, damageType: 'True' }], vfxType: 'beam', iconUrl: '/assets/icons/abilities/ABIL_CAN_ULT.svg' }
             ];
             break;
        case 'CHR_JUD_DCY_001': // Entropy Engine
             abilities = [
                 { id: 'ABIL_DCY_ATK', name: 'Corrosive Beam', costMP: 0, costTU: 100, description: 'Spiritual beam applying Decay.', targeting: 'enemy', hits: [{ multiplier: 0.5, damageType: 'Spiritual', statusEffect: 'Decay' }], vfxType: 'beam', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_DCY_SP1', name: 'Catalyst Outbreak', costMP: 15, costTU: 120, description: 'Spreads Decay stacks to all enemies.', targeting: 'all_enemies', vfxType: 'projectile', iconUrl: '/assets/icons/abilities/ABIL_DCY_SP1.svg' , iconSprite: { sheet: 'judgment_ability_icons.png', row: 1, col: 1 } },
                 { id: 'ABIL_DCY_SP2', name: 'Accelerated Entropy', costMP: 25, costTU: 150, description: 'Triggers active Decay instantly and strips buffs.', targeting: 'enemy', vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_DCY_SP2.svg' , iconSprite: { sheet: 'judgment_ability_icons.png', row: 1, col: 2 } },
                 { id: 'ABIL_DCY_ULT', name: 'Heat Death', costMP: 0, costTU: 0, costRevelation: 100, description: 'AoE true damage and massive Decay on death.', targeting: 'all_enemies', hits: [{ multiplier: 3.0, damageType: 'True' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_DCY_ULT.svg' }
             ];
             break;
        case 'CHR_JUD_VOD_001': // Void-Borg
             abilities = [
                 { id: 'ABIL_VOD_ATK', name: 'Phase Strike', costMP: 0, costTU: 100, description: 'Teleports along timeline on hit.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Physical' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_VOD_SP1', name: 'Warp Prison', costMP: 30, costTU: 120, description: 'Banishes enemy/delays bosses heavily.', targeting: 'enemy', vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_VOD_SP1.svg' , iconSprite: { sheet: 'judgment_ability_icons.png', row: 2, col: 1 } },
                 { id: 'ABIL_VOD_SP2', name: 'Singularity', costMP: 40, costTU: 150, description: 'Pulls enemies to timeline back.', targeting: 'all_enemies', vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_VOD_SP2.svg' , iconSprite: { sheet: 'judgment_ability_icons.png', row: 2, col: 2 } },
                 { id: 'ABIL_VOD_ULT', name: 'Absolute Vacuum', costMP: 0, costTU: 0, costRevelation: 100, description: 'Permanent core stat steal.', targeting: 'enemy', hits: [{ multiplier: 4.0, damageType: 'Physical' }], vfxType: 'beam', iconUrl: '/assets/icons/abilities/ABIL_VOD_ULT.svg' }
             ];
             break;
        case 'CHR_JUD_SHD_001': // Stealth-Operative
             abilities = [
                 { id: 'ABIL_SHD_ATK', name: 'Shadow Dagger', costMP: 0, costTU: 80, description: 'Quick attack. Crits if from stealth.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Physical' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_SHD_SP1', name: 'Cloak & Dagger', costMP: 15, costTU: 60, description: 'Enters Stealth and increases speed.', targeting: 'self', statusEffects: ['Stealth'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_SHD_SP1.svg' , iconSprite: { sheet: 'judgment_ability_icons.png', row: 2, col: 1 } },
                 { id: 'ABIL_SHD_SP2', name: 'Nerve Slice', costMP: 15, costTU: 100, description: 'Poisons target, reducing damage.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Physical', statusEffect: 'Poison' }], vfxType: 'projectile', iconUrl: '/assets/icons/abilities/ABIL_SHD_SP2.svg' },
                 { id: 'ABIL_SHD_ULT', name: 'Thousand Cuts', costMP: 0, costTU: 0, costRevelation: 100, description: '10 rapid strikes. True damage if all same target.', targeting: 'all_enemies', hits: [{ multiplier: 0.4, damageType: 'Physical' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_SHD_ULT.svg' }
             ];
             break;
        case 'CHR_JUD_DTH_001': // Necro-Mechanic
             abilities = [
                 { id: 'ABIL_DTH_ATK', name: 'Bone-Wrench', costMP: 0, costTU: 100, description: 'Physical hit that heals for a portion of damage.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Physical' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_DTH_SP1', name: 'Reassemble', costMP: 25, costTU: 120, description: 'Revives or heals & shields ally.', targeting: 'ally', baseHeal: 25, vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_DTH_SP1.svg' , iconSprite: { sheet: 'judgment_ability_icons.png', row: 3, col: 1 } },
                 { id: 'ABIL_DTH_SP2', name: 'Execution Protocol', costMP: 20, costTU: 100, description: 'Insta-kill below 20% HP, else moderate damage.', targeting: 'enemy', hits: [{ multiplier: 1.5, damageType: 'True' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_DTH_SP2.svg' },
                 { id: 'ABIL_DTH_ULT', name: 'Machine Graveyard', costMP: 0, costTU: 0, costRevelation: 100, description: 'Summons 3 Scrap-Drones to absorb hits.', targeting: 'ally', vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_DTH_ULT.svg' , iconSprite: { sheet: 'judgment_ability_icons.png', row: 3, col: 3 } }
             ];
             break;

        // --- Order Sector (Race: Lumina) ---
        case 'CHR_ORD_CHR_001': // Time-Paladin
             abilities = [
                 { id: 'ABIL_CHR_ATK', name: 'Luminous Strike', costMP: 0, costTU: 100, description: 'Smites enemy, advances ally timeline.', targeting: 'enemy', hits: [{ multiplier: 1.2, damageType: 'Spiritual' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_CHR_SP1', name: 'Chrono-Aura', costMP: 20, costTU: 100, description: 'Grants Haste to all allies.', targeting: 'all_allies', statusEffects: ['Haste'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_CHR_SP1.svg' , iconSprite: { sheet: 'order_ability_icons.png', row: 0, col: 1 } },
                 { id: 'ABIL_CHR_SP2', name: 'Temporal Rewind', costMP: 30, costTU: 120, description: 'Reverses HP of ally to last turn.', targeting: 'ally', baseHeal: 50, vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_CHR_SP2.svg' , iconSprite: { sheet: 'order_ability_icons.png', row: 0, col: 2 } },
                 { id: 'ABIL_CHR_ULT', name: 'Stasis Field', costMP: 0, costTU: 0, costRevelation: 100, description: 'Halts timeline for enemies for 1 round.', targeting: 'all_enemies', statusEffects: ['Stun'], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_CHR_ULT.svg' , iconSprite: { sheet: 'order_ability_icons.png', row: 0, col: 3 } }
             ];
             break;
        case 'CHR_ORD_GRV_001': // Grav-Lancer
             abilities = [
                 { id: 'ABIL_GRV_ATK', name: 'Grav-Thrust', costMP: 0, costTU: 100, description: 'Pierces front and damages behind.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Physical' }], vfxType: 'projectile', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_GRV_SP1', name: 'Crush Sphere', costMP: 15, costTU: 100, description: 'Roots enemy, drops dodge to 0.', targeting: 'enemy', statusEffects: ['Stun'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_GRV_SP1.svg' , iconSprite: { sheet: 'order_ability_icons.png', row: 1, col: 1 } },
                 { id: 'ABIL_GRV_SP2', name: 'Event Horizon', costMP: 25, costTU: 120, description: 'Swaps position of ally and enemy.', targeting: 'enemy', vfxType: 'beam', iconUrl: '/assets/icons/abilities/ABIL_GRV_SP2.svg' , iconSprite: { sheet: 'order_ability_icons.png', row: 1, col: 2 } },
                 { id: 'ABIL_GRV_ULT', name: 'Planetary Collapse', costMP: 0, costTU: 0, costRevelation: 100, description: 'Halves current HP for enemies in zone.', targeting: 'all_enemies', hits: [{ multiplier: 2.0, damageType: 'Spiritual' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_GRV_ULT.svg' }
             ];
             break;
        case 'CHR_ORD_MAG_001': // Mag-Sentinel
             abilities = [
                 { id: 'ABIL_MAG_ATK', name: 'Magnetic Bash', costMP: 0, costTU: 90, description: 'Low damage, high threat.', targeting: 'enemy', hits: [{ multiplier: 0.8, damageType: 'Physical' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_MAG_SP1', name: 'Iron Maiden Protocol', costMP: 20, costTU: 100, description: 'Taunts all enemies, boosts DEF.', targeting: 'self', statusEffects: ['Taunt'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_MAG_SP1.svg' , iconSprite: { sheet: 'order_ability_icons.png', row: 2, col: 1 } },
                 { id: 'ABIL_MAG_SP2', name: 'Polarity Shield', costMP: 15, costTU: 100, description: 'Shield reflects 50% damage.', targeting: 'ally', vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_MAG_SP2.svg' , iconSprite: { sheet: 'order_ability_icons.png', row: 2, col: 2 } },
                 { id: 'ABIL_MAG_ULT', name: 'Aegis of the Maker', costMP: 0, costTU: 0, costRevelation: 100, description: 'Invincible and intercepts damage.', targeting: 'self', statusEffects: ['Invincible'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_MAG_ULT.svg' , iconSprite: { sheet: 'order_ability_icons.png', row: 2, col: 3 } }
             ];
             break;
        case 'CHR_ORD_TRU_001': // Inquisitor
             abilities = [
                 { id: 'ABIL_TRU_ATK', name: 'Verdict', costMP: 0, costTU: 100, description: 'Holy damage, harder if enemy buffed.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Spiritual' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_TRU_SP1', name: 'Purge', costMP: 15, costTU: 100, description: 'Strips all positive buffs from target.', targeting: 'enemy', vfxType: 'beam', iconUrl: '/assets/icons/abilities/ABIL_TRU_SP1.svg' , iconSprite: { sheet: 'order_ability_icons.png', row: 3, col: 1 } },
                 { id: 'ABIL_TRU_SP2', name: 'Chain of Binding', costMP: 25, costTU: 120, description: 'Silence target for 1 turn.', targeting: 'enemy', statusEffects: ['Stun'], vfxType: 'projectile', iconUrl: '/assets/icons/abilities/ABIL_TRU_SP2.svg' , iconSprite: { sheet: 'order_ability_icons.png', row: 3, col: 2 } },
                 { id: 'ABIL_TRU_ULT', name: 'Final Judgment', costMP: 0, costTU: 0, costRevelation: 100, description: 'Massive Absolute Damage.', targeting: 'enemy', hits: [{ multiplier: 5.0, damageType: 'True' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_TRU_ULT.svg' }
             ];
             break;

        // --- Chaos Sector (Race: Espers) ---
        case 'CHR_CHA_FIR_001': // Pyromancer
             abilities = [
                 { id: 'ABIL_FIR_ATK', name: 'Firebolt', costMP: 0, costTU: 100, description: 'Moderate damage, 25% chance to Burn.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Spiritual', statusEffect: 'Burn' }], vfxType: 'projectile', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_FIR_SP1', name: 'Inferno Wave', costMP: 25, costTU: 120, description: 'AoE fire, doubles Burn duration.', targeting: 'all_enemies', hits: [{ multiplier: 1.5, damageType: 'Spiritual' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_FIR_SP1.svg' },
                 { id: 'ABIL_FIR_SP2', name: 'Cinder Cage', costMP: 20, costTU: 100, description: 'Traps enemy, burn damage per action.', targeting: 'enemy', statusEffects: ['Burn'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_FIR_SP2.svg' , iconSprite: { sheet: 'chaos_ability_icons.png', row: 0, col: 2 } },
                 { id: 'ABIL_FIR_ULT', name: 'Supernova', costMP: 0, costTU: 0, costRevelation: 100, description: 'Extreme AoE, permanent armor melt.', targeting: 'all_enemies', hits: [{ multiplier: 4.0, damageType: 'Spiritual' }], vfxType: 'beam', iconUrl: '/assets/icons/abilities/ABIL_FIR_ULT.svg' }
             ];
             break;
        case 'CHR_CHA_EAR_001': // Geomancer
             abilities = [
                 { id: 'ABIL_EAR_ATK', name: 'Rock Toss', costMP: 0, costTU: 100, description: 'Applies Brittle reducing DEF.', targeting: 'enemy', hits: [{ multiplier: 0.8, damageType: 'Physical', statusEffect: 'Brittle' }], vfxType: 'projectile', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_EAR_SP1', name: 'Tectonic Fault', costMP: 20, costTU: 120, description: 'Hazard zone dealing damage on movement.', targeting: 'all_enemies', hits: [{ multiplier: 1.0, damageType: 'Physical' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_EAR_SP1.svg' },
                 { id: 'ABIL_EAR_SP2', name: 'Fossilize', costMP: 30, costTU: 100, description: 'Ally turns to stone, 100% immune.', targeting: 'ally', statusEffects: ['Invincible'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_EAR_SP2.svg' , iconSprite: { sheet: 'chaos_ability_icons.png', row: 1, col: 2 } },
                 { id: 'ABIL_EAR_ULT', name: 'Earthshatter', costMP: 0, costTU: 0, costRevelation: 100, description: 'Destroys shields, stuns enemy team.', targeting: 'all_enemies', hits: [{ multiplier: 2.0, damageType: 'Physical', statusEffect: 'Stun' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_EAR_ULT.svg' }
             ];
             break;
        case 'CHR_CHA_WAT_001': // Tidecaller
             abilities = [
                 { id: 'ABIL_WAT_ATK', name: 'Water Whip', costMP: 0, costTU: 100, description: 'Moderate damage, pushes timeline back.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Physical' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_WAT_SP1', name: 'Healing Rain', costMP: 25, costTU: 100, description: 'Regen (HoT) to all allies.', targeting: 'all_allies', statusEffects: ['Regen'], baseHeal: 10, vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_WAT_SP1.svg' , iconSprite: { sheet: 'chaos_ability_icons.png', row: 2, col: 1 } },
                 { id: 'ABIL_WAT_SP2', name: 'Wash Away', costMP: 15, costTU: 90, description: 'Cleanses debuffs/DoTs from ally.', targeting: 'ally', vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_WAT_SP2.svg' , iconSprite: { sheet: 'chaos_ability_icons.png', row: 2, col: 2 } },
                 { id: 'ABIL_WAT_ULT', name: 'Tsunami', costMP: 0, costTU: 0, costRevelation: 100, description: 'Max heals party, resurrects, reduces enemy ATK.', targeting: 'all_allies', baseHeal: 999, vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_WAT_ULT.svg' , iconSprite: { sheet: 'chaos_ability_icons.png', row: 2, col: 3 } }
             ];
             break;
        case 'CHR_CHA_AIR_001': // Zephyr-Sprite
             abilities = [
                 { id: 'ABIL_AIR_ATK', name: 'Wind Blade', costMP: 0, costTU: 70, description: 'Fast attack hitting twice.', targeting: 'enemy', hits: [{ multiplier: 0.6, damageType: 'Physical' }, { multiplier: 0.6, damageType: 'Physical' }], vfxType: 'projectile', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_AIR_SP1', name: 'Tailwind', costMP: 15, costTU: 60, description: 'Improves Dodge rate to 75%.', targeting: 'self', statusEffects: ['DodgeUp'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_AIR_SP1.svg' , iconSprite: { sheet: 'chaos_ability_icons.png', row: 3, col: 1 } },
                 { id: 'ABIL_AIR_SP2', name: 'Cyclone Dash', costMP: 20, costTU: 90, description: 'Bypasses frontline to hit backline.', targeting: 'enemy', hits: [{ multiplier: 1.5, damageType: 'Physical' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_AIR_SP2.svg' },
                 { id: 'ABIL_AIR_ULT', name: 'Hurricane Flurry', costMP: 0, costTU: 0, costRevelation: 100, description: '15 rapid random strikes delaying turn.', targeting: 'all_enemies', hits: [{ multiplier: 0.3, damageType: 'Physical' }], vfxType: 'projectile', iconUrl: '/assets/icons/abilities/ABIL_AIR_ULT.svg' }
             ];
             break;

        // --- Love Sector (Race: Sylvan) ---
        case 'CHR_LOV_LIF_001': // Weaver of Life
             abilities = [
                 { id: 'ABIL_LIF_ATK', name: 'Spirit Mend', costMP: 0, costTU: 100, description: 'Small targeted heal.', targeting: 'ally', baseHeal: 15, vfxType: 'buff', iconUrl: '/assets/icons/abilities/generic_attack.svg' , iconSprite: { sheet: 'love_ability_icons.png', row: 0, col: 0 } },
                 { id: 'ABIL_LIF_SP1', name: 'Web of Hearts', costMP: 20, costTU: 100, description: 'Links two allies, sharing damage, double healing.', targeting: 'all_allies', statusEffects: ['Linked'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_LIF_SP1.svg' , iconSprite: { sheet: 'love_ability_icons.png', row: 0, col: 1 } },
                 { id: 'ABIL_LIF_SP2', name: 'Cocoon', costMP: 30, costTU: 80, description: 'Ensures ally survives lethal hit at 1 HP.', targeting: 'ally', statusEffects: ['Deathward'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_LIF_SP2.svg' , iconSprite: { sheet: 'love_ability_icons.png', row: 0, col: 2 } },
                 { id: 'ABIL_LIF_ULT', name: 'Genesis Spore', costMP: 0, costTU: 0, costRevelation: 100, description: 'Team revives with 50% HP on next death.', targeting: 'all_allies', statusEffects: ['AutoRevive'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_LIF_ULT.svg' , iconSprite: { sheet: 'love_ability_icons.png', row: 0, col: 3 } }
             ];
             break;
        case 'CHR_LOV_BLD_001': // Blood-Druid
             abilities = [
                 { id: 'ABIL_BLD_ATK', name: 'Vampiric Touch', costMP: 0, costTU: 100, description: 'Deals damage, heals 50%.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Spiritual', statusEffect: 'Lifesteal' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_BLD_SP1', name: 'Blood Pact', costMP: 0, costTU: 100, description: 'Spend 20% HP to deal massive dark damage.', targeting: 'enemy', hits: [{ multiplier: 2.5, damageType: 'Spiritual' }], vfxType: 'projectile', iconUrl: '/assets/icons/abilities/ABIL_BLD_SP1.svg' },
                 { id: 'ABIL_BLD_SP2', name: 'Sanguine Pool', costMP: 25, costTU: 120, description: 'AoE lifesteal from all enemies.', targeting: 'all_enemies', hits: [{ multiplier: 1.0, damageType: 'Spiritual' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_BLD_SP2.svg' },
                 { id: 'ABIL_BLD_ULT', name: 'Crimson Harvest', costMP: 0, costTU: 0, costRevelation: 100, description: 'Steals 25% of all enemies HP, heals party.', targeting: 'all_enemies', hits: [{ multiplier: 2.0, damageType: 'True' }], vfxType: 'beam', iconUrl: '/assets/icons/abilities/ABIL_BLD_ULT.svg' }
             ];
             break;
        case 'CHR_LOV_GRW_001': // Growth-Warden
             abilities = [
                 { id: 'ABIL_GRW_ATK', name: 'Briar Patch', costMP: 0, costTU: 100, description: 'Physical attack, small personal shield.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Physical' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_GRW_SP1', name: 'Nurture', costMP: 20, costTU: 100, description: 'Heals ally, excess increases Max HP.', targeting: 'ally', baseHeal: 25, vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_GRW_SP1.svg' , iconSprite: { sheet: 'love_ability_icons.png', row: 2, col: 1 } },
                 { id: 'ABIL_GRW_SP2', name: 'Barkskin', costMP: 20, costTU: 100, description: 'Increases resist of frontline.', targeting: 'all_allies', statusEffects: ['DefUp'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_GRW_SP2.svg' , iconSprite: { sheet: 'love_ability_icons.png', row: 2, col: 2 } },
                 { id: 'ABIL_GRW_ULT', name: 'World Tree\'s Embrace', costMP: 0, costTU: 0, costRevelation: 100, description: 'Converts shields to permanent offensive stats.', targeting: 'all_allies', statusEffects: ['AtkUp'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_GRW_ULT.svg' , iconSprite: { sheet: 'love_ability_icons.png', row: 2, col: 3 } }
             ];
             break;
        case 'CHR_LOV_DRM_001': // Dream-Walker
             abilities = [
                 { id: 'ABIL_DRM_ATK', name: 'Mind Spike', costMP: 0, costTU: 100, description: 'Spiritual damage ignoring defenses.', targeting: 'enemy', hits: [{ multiplier: 1.0, damageType: 'Spiritual' }], vfxType: 'projectile', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: 'ABIL_DRM_SP1', name: 'Lullaby', costMP: 20, costTU: 100, description: 'Puts enemy to Sleep until damaged.', targeting: 'enemy', statusEffects: ['Sleep'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_DRM_SP1.svg' , iconSprite: { sheet: 'love_ability_icons.png', row: 3, col: 1 } },
                 { id: 'ABIL_DRM_SP2', name: 'Nightmare Weaver', costMP: 25, costTU: 110, description: 'Massive damage if asleep without waking.', targeting: 'enemy', hits: [{ multiplier: 2.5, damageType: 'Spiritual' }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/ABIL_DRM_SP2.svg' },
                 { id: 'ABIL_DRM_ULT', name: 'Lucid Reality', costMP: 0, costTU: 0, costRevelation: 100, description: 'Reflects all damage team takes next round.', targeting: 'all_allies', statusEffects: ['Reflect'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/ABIL_DRM_ULT.svg' , iconSprite: { sheet: 'love_ability_icons.png', row: 3, col: 3 } }
             ];
             break;

        default: {
             let baseStatusEffect = 'Bleed';
             if (baseData.sector === 'Order') baseStatusEffect = 'Stun';
             if (baseData.sector === 'Love') baseStatusEffect = 'Poison';
             if (baseData.sector === 'Chaos') baseStatusEffect = 'Confusion';
             if (baseData.sector === 'Judgment') baseStatusEffect = 'Bleed';

             const tier = (baseData as any).tier || (baseData.id.includes('BOSS') ? 'boss' : 'grunt');
             const isBackline = baseData.classRole === 'Backline';
             const damageType: 'Physical' | 'Spiritual' = isBackline ? 'Spiritual' : 'Physical';
             
             // Base tuning - significantly reduced from the 1.5/3.0 era
             const mult = tier === 'boss' ? 1.3 : (tier === 'elite' ? 1.0 : 0.7);

             abilities = [
                 { id: `ABIL_GEN_ATK_${baseData.id}`, name: isBackline ? 'Energy Bolt' : 'Strike', costMP: 0, costTU: 100, description: 'Basic attack.', targeting: 'enemy', hits: [{ multiplier: mult, damageType: damageType }], vfxType: 'projectile', iconUrl: '/assets/icons/abilities/generic_attack.svg' },
                 { id: `ABIL_GEN_SP1_${baseData.id}`, name: 'Axiom Special', costMP: 10, costTU: 120, description: `Class Tactical inflicting ${baseStatusEffect}.`, targeting: 'enemy', hits: [{ multiplier: mult * 1.3, damageType: damageType, statusEffect: baseStatusEffect }], vfxType: 'beam', iconUrl: '/assets/icons/abilities/generic_attack.svg' }
             ];

             if (tier === 'elite' || tier === 'boss') {
                  abilities.push(
                     { id: `ABIL_GEN_SP2_${baseData.id}`, name: 'Axiom Resilience', costMP: 20, costTU: 100, description: 'Bolsters defenses.', targeting: 'self', baseHeal: 5.0, statusEffects: ['DefUp'], vfxType: 'buff', iconUrl: '/assets/icons/abilities/generic_attack.svg' }
                  );
             }

             if (tier === 'boss') {
                  abilities.push(
                     { id: `ABIL_GEN_ULT_${baseData.id}`, name: 'Axiom Execution', costMP: 0, costTU: 0, costRevelation: 100, description: 'Ultimate Finisher', targeting: 'all_enemies', hits: [{ multiplier: mult * 2.0, damageType: 'True', statusEffect: baseStatusEffect }], vfxType: 'hit', iconUrl: '/assets/icons/abilities/generic_attack.svg' }
                  );
             }

             break;
        }
    }

    
    let portraitSheet = { sheet: 'character_portraits.png', row: 0, col: 0 };
    if (baseData.id.includes('_CAN_')) portraitSheet = { sheet: 'character_portraits.png', row: 0, col: 0 };
    else if (baseData.id.includes('_DCY_')) portraitSheet = { sheet: 'character_portraits.png', row: 0, col: 1 };
    else if (baseData.id.includes('_VOD_')) portraitSheet = { sheet: 'character_portraits.png', row: 0, col: 2 };
    else if (baseData.id.includes('_SHD_')) portraitSheet = { sheet: 'character_portraits.png', row: 0, col: 3 };
    else if (baseData.id.includes('_DTH_')) portraitSheet = { sheet: 'character_portraits.png', row: 1, col: 0 };
    else if (baseData.id.includes('_CHR_')) portraitSheet = { sheet: 'character_portraits.png', row: 1, col: 1 };
    else if (baseData.id.includes('_GRV_')) portraitSheet = { sheet: 'character_portraits.png', row: 1, col: 2 };
    else if (baseData.id.includes('_MAG_')) portraitSheet = { sheet: 'character_portraits.png', row: 1, col: 3 };
    else if (baseData.id.includes('_TRU_')) portraitSheet = { sheet: 'character_portraits.png', row: 2, col: 0 };
    else if (baseData.id.includes('_FIR_')) portraitSheet = { sheet: 'character_portraits.png', row: 2, col: 1 };
    else if (baseData.id.includes('_EAR_')) portraitSheet = { sheet: 'character_portraits.png', row: 2, col: 2 };
    else if (baseData.id.includes('_WAT_')) portraitSheet = { sheet: 'character_portraits.png', row: 2, col: 3 };
    else if (baseData.id.includes('_AIR_')) portraitSheet = { sheet: 'character_portraits.png', row: 3, col: 0 };
    else if (baseData.id.includes('_LIF_')) portraitSheet = { sheet: 'character_portraits.png', row: 3, col: 1 };
    else if (baseData.id.includes('_BLD_')) portraitSheet = { sheet: 'character_portraits.png', row: 3, col: 2 };
    else if (baseData.id.includes('_GRW_')) portraitSheet = { sheet: 'character_portraits.png', row: 3, col: 3 };
    else if (baseData.id.includes('_DRM_')) portraitSheet = { sheet: 'character_portraits.png', row: 0, col: 0 };

    const activeChar: ActiveCharacter = {
      instanceId: `INST_${baseData.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      baseId: baseData.id,
      name: baseData.name,
      portraitUrl,
      portraitSprite: portraitSheet as any,
      fullArtUrl,
      spriteManifest: baseData.spriteManifest, // Pass the manifest from JSON
      spriteSheet: baseData.spriteManifest?.idle || {
        url: '/assets/death_knight_attack_two_handed_death_knight_melee_attack.webp',
        cols: 10,
        rows: 10,
        totalFrames: 100
      },
      race: baseData.race,
      sector: baseData.sector,
      combatRole: baseData.classRole === 'Frontline' ? 'Frontline' : baseData.classRole === 'Boss' ? 'Boss' : 'Backline',
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
