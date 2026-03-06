import type { ActiveCharacter } from './character';
import type { StatBlock } from './stats';
import type { MapNode } from './map';

export type TalentRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Divine';
export type TalentCategory = 'New Skill' | 'Passive Defensive' | 'Passive Offensive' | 'Stats Up' | 'Wildcard' | 'Unique';

export interface Talent {
  id: string;
  tier: 1 | 2 | 3 | 4;
  rarity: TalentRarity;
  category: TalentCategory;
  sector: string;
  name: string;
  effect: string;
  cost: number;
  icon?: string;
}

export type RelicTier = 'Fractured' | 'Resonant' | 'Exalted' | 'Reliquary' | 'Divine';

export interface Relic {
  id: string;
  name: string;
  sector: 'Judgment' | 'Order' | 'Chaos' | 'Love' | 'Universal';
  effect: string;
  tier: RelicTier;
  color: string; // Hex color for UI representation
}

export interface GlobalSaveData {
  divineSparks: number; // Keep as meta-currency if needed, or rename to Divine Essence? 
                       // User says "collect them to move forward" - usually fuel is run-specific.
                       // Let's keep a meta version for persistence if needed, but the core request is about fuel.
  axiomPoints: {
    Order: number;
    Chaos: number;
    Judgment: number;
    Love: number;
  };
  unlockedAxiomNodes: Record<string, number>; // nodeId -> currentLevel
  unlockedTalentIds: string[];
  unlockedRelicIds: string[];
  permanentStatBonuses: Partial<StatBlock>;
  unlockedGodAbilities: string[]; // IDs of unlocked player active skills
}

export interface GodIntervention {
  id: string;
  name: string;
  description: string;
  faithCost: number;
  effectType: 'execute' | 'shield' | 'dispel' | 'heal' | 'damage' | 'status';
  cooldown: number; // in combats or turns
}

export interface RunStateData {
  runActive: boolean;
  divineSparks: number; // FUEL: consumed to move nodes
  ephemeralFaith: number; // CURRENCY: spent in run
  currentNodeId: string;
  activeParty: ActiveCharacter[];
  activeRelics: string[]; // Up to 4 Relic IDs
  activeTalents: string[]; // Talent IDs drafted for this run
  visitedNodes: string[];
  generatedMap?: MapNode[];
  availableGodAbilities: string[]; // Unlocked abilities available for this run
}
