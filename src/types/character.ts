import type { StatBlock } from './stats';

// Enums to match JSON data
export type CharacterRole = 'Frontline' | 'Backline';
export type SectorName = 'Judgment' | 'Order' | 'Chaos' | 'Love';
export type RaceName = 'Null-Forged' | 'Lumina' | 'Espers' | 'Sylvan';

export interface SpriteAnimation {
  name: string;
  url: string;
  cols: number;
  rows: number;
  totalFrames: number;
  fps: number;
  loop: boolean;
}

export interface SpriteManifest {
  idle: SpriteAnimation;
  default_attack: SpriteAnimation;
  special_1: SpriteAnimation;
  special_2: SpriteAnimation;
  take_damage: SpriteAnimation;
  death: SpriteAnimation;
  dodge?: SpriteAnimation;
}

export interface AbilityHit {
  multiplier: number;
  damageType: 'Physical' | 'Spiritual' | 'True';
  statusEffect?: string;
}

export interface Ability {
  id: string;
  name: string;
  costMP: number;
  costTU: number; // Reintroducing TU cost for consistency
  description: string;
  targeting: 'enemy' | 'ally' | 'self' | 'all_enemies' | 'all_allies';
  baseDamage?: number;
  baseHeal?: number;
  hits?: AbilityHit[];
  statusEffects?: string[];
}

export interface BaseCharacter {
  id: string;
  name: string;
  classRole: string;
  race: RaceName;
  sector: SectorName;
  stats: StatBlock;
  abilities?: Ability[];
  spriteManifest?: SpriteManifest;
}

export interface StatusEffect {
  id: string;
  type: 'Stun' | 'Poison' | 'Bleed' | 'Confusion' | 'Regen' | 'Shield' | 'Haste' | 'Decay' | 'Overcharge';
  duration: number; // in rounds or turns
  value?: number;   // e.g. amount of poison or bleed damage
  sourceId?: string;
}

export interface ActiveCharacter {
  instanceId: string;       // Unique ID for this specific run
  baseId: string;           // Reference to BaseCharacter template
  name: string;
  portraitUrl: string; // Dynamic path or remote URL for 512x512 generated dummy art
  spriteSheet?: {
    url: string;
    cols: number;
    rows: number;
    totalFrames?: number;
  };
  spriteManifest?: SpriteManifest;
  race: RaceName;
  sector: SectorName;
  combatRole: CharacterRole;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  pendingLevelUps?: number;
  talents?: import('./save').Talent[];
  currentHp: number;
  currentMp: number;
  currentRevelation?: number;
  stats: {
    base: StatBlock; // The permanent base stats
    current: StatBlock; // Current stats after runtime buffs/debuffs
  };
  abilities: Ability[];
  hasActedThisRound: boolean;
  timelinePosition: number; // 100 counting down to 0
  buffs: StatusEffect[];             
  debuffs: StatusEffect[];           
  isDead: boolean;
}
