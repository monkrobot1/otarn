export interface StatBlock {
  physicality: number; // Physical Damage output and Physical Resistance (Armor)
  authority: number;   // Spiritual Attack Damage (Magic/Tech) and Status Hit Chance
  grace: number;       // Physical Hit Chance (Accuracy) and Action Speed/Initiative
  acumen: number;      // Spiritual Hit Chance (Accuracy) and Critical Multiplier
  spirit: number;      // Spiritual Defense (Resistance) and Debuff Resist
  fate: number;        // Critical Strike Chance and base Dodge probability
  capacity: number;    // MP Capacity (Mana/Energy pool) and HP Growth
  destiny: number;     // Meta-stat affecting Stars (Rarity), Loot Rate, Future Capacity, and Random Event triggers
}

export interface CharacterStats {
  base: StatBlock;          // The permanent, unbuffed stats
  modifiers: StatBlock;     // Temporary +/- from buffs/debuffs or relics
}

export function getEffectiveStat(stats: CharacterStats, statName: keyof StatBlock): number {
  return Math.max(0, stats.base[statName] + stats.modifiers[statName]);
}
