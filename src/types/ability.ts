import type { ActiveCharacter } from './character';

export type TargetMode = 'SingleEnemy' | 'AllEnemies' | 'SingleAlly' | 'AllAllies' | 'Self';
export type AbilityType = 'Physical' | 'Spiritual' | 'Support';

import type { StatusEffect } from './character';

export interface AbilityPayload {
  sourceId: string;
  targetIds: string[];
  damage?: number;
  healing?: number;
  buffsApplied?: StatusEffect[];
  debuffsApplied?: StatusEffect[];
  ability?: import('./character').Ability; // For advanced engine logic
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  costMp: number;
  type: AbilityType;
  targetMode: TargetMode;
  baseTimeCost: number; // e.g., 100 for basic attack, 150 for heavy skill
  
  // A function that resolves the mathematical payload BEFORE mitigation
  calculatePayload: (source: ActiveCharacter, targets: ActiveCharacter[]) => AbilityPayload;
}

export interface GodIntervention {
  id: string;
  name: string;
  description: string;
  costEphemeralFaith: number;
  cooldownTurns: number;
  targetMode: TargetMode;
  execute: (targetIds: string[]) => void; // Triggered directly via the CombatStore
}
