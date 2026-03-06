import type { ActiveCharacter } from './character';
import type { StatBlock } from './stats';
import type { MapNode } from './map';

export interface Talent {
  id: string;
  tier: 1 | 2 | 3 | 4;
  sector: string;
  name: string;
  effect: string;
  cost: number;
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
  divineSparks: number;
  axiomPoints: {
    Order: number;
    Chaos: number;
    Judgment: number;
    Love: number;
  };
  unlockedAxiomNodes: string[];
  unlockedTalentIds: string[];
  unlockedRelicIds: string[];
  permanentStatBonuses: Partial<StatBlock>;
}

export interface RunStateData {
  runActive: boolean;
  ephemeralFaith: number;
  currentNodeId: string;
  activeParty: ActiveCharacter[];
  activeRelics: string[]; // Up to 4 Relic IDs
  activeTalents: string[]; // Talent IDs drafted for this run
  visitedNodes: string[];
  generatedMap?: MapNode[];
}
