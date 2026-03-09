import { create } from 'zustand';
import type { Ability } from '../types/character';
export interface ActiveVfx {
  id: string;
  type: 'buff' | 'hit' | 'projectile' | 'beam';
  sourceId?: string;
  targetId: string;
  spriteUrl: string;
  cols: number;
  rows: number;
  totalFrames: number;
  fps: number;
  durationMs: number;
}

interface CombatUIState {
  targetingAbility: Ability | null;
  hoveredAbility: Ability | null;
  hoveredTargetId: string | null;
  activeVfx: ActiveVfx[];

  setTargetingAbility: (ability: Ability | null) => void;
  setHoveredAbility: (ability: Ability | null) => void;
  setHoveredTargetId: (id: string | null) => void;
  
  addVfx: (vfx: ActiveVfx, speedFactor?: number) => void;
  removeVfx: (id: string) => void;
  clearAll: () => void;
}

export const useCombatUIStore = create<CombatUIState>((set) => ({
  targetingAbility: null,
  hoveredAbility: null,
  hoveredTargetId: null,
  activeVfx: [],

  setTargetingAbility: (ability) => set({ targetingAbility: ability }),
  setHoveredAbility: (ability) => set({ hoveredAbility: ability }),
  setHoveredTargetId: (id) => set({ hoveredTargetId: id }),

  addVfx: (vfx, speedFactor = 1) => set(state => ({ 
      activeVfx: [...state.activeVfx, { ...vfx, durationMs: vfx.durationMs / speedFactor }] 
  })),
  removeVfx: (id) => set(state => ({ 
      activeVfx: state.activeVfx.filter(v => v.id !== id) 
  })),
  clearAll: () => set({ targetingAbility: null, hoveredAbility: null, hoveredTargetId: null, activeVfx: [] })
}));
