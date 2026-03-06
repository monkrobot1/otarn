import { create } from 'zustand';
import type { GlobalSaveData, RunStateData } from '../types/save';
import { SaveManager } from '../core/SaveManager';

export type SceneType = 'throne' | 'cinematic' | 'global-map' | 'sector-map' | 'combat' | 'event' | 'rest' | 'reward' | 'shop' | 'level-up' | 'summary';
interface GameState {
  globalData: GlobalSaveData;
  runData: RunStateData | null;
  currentScene: SceneType;
  setScene: (scene: SceneType) => void;
  updateRunData: (partial: Partial<RunStateData>) => void;
  startNewRun: () => void;
  endRun: (success: boolean) => void;
  awardSparks: (amount: number) => void;
  awardAxiomPoints: (axiom: 'Order' | 'Chaos' | 'Judgment' | 'Love', amount: number) => void;
  unlockAxiomNode: (nodeId: string, cost: number, axiom: 'Order' | 'Chaos' | 'Judgment' | 'Love') => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  globalData: SaveManager.loadGlobal() || {
    divineSparks: 0,
    axiomPoints: { Order: 0, Chaos: 0, Judgment: 0, Love: 0 },
    unlockedAxiomNodes: [],
    unlockedTalentIds: [],
    unlockedRelicIds: [],
    permanentStatBonuses: {}
  },
  runData: SaveManager.loadRun() || null,
  currentScene: 'throne',

  setScene: (scene: SceneType) => set({ currentScene: scene }),

  updateRunData: (partial) => {
      const current = get().runData;
      if (current) {
          const updated = { ...current, ...partial };
          SaveManager.saveRun(updated);
          set({ runData: updated });
      }
  },

  startNewRun: () => {
    const newRun: RunStateData = {
      runActive: true,
      ephemeralFaith: 100, // Starting faith
      currentNodeId: 'START',
      activeParty: [], // Drafted in Faith Draft phase
      activeRelics: [],
      activeTalents: [],
      visitedNodes: []
    };
    SaveManager.saveRun(newRun);
    set({ runData: newRun });
  },

  endRun: (success) => {
    const { runData, globalData } = get();
    if (!runData) return;
    
    // Simple calc: nodes visited * 10
    const sparksEarned = runData.visitedNodes.length * 10 + (success ? 100 : 0);
    const newGlobal = { ...globalData, divineSparks: globalData.divineSparks + sparksEarned };
    
    SaveManager.saveGlobal(newGlobal);
    SaveManager.clearRun();
    
    set({ runData: null, globalData: newGlobal, currentScene: 'summary' });
  },

  awardSparks: (amount) => {
    const { globalData } = get();
    const newGlobal = { ...globalData, divineSparks: globalData.divineSparks + amount };
    SaveManager.saveGlobal(newGlobal);
    set({ globalData: newGlobal });
  },

  awardAxiomPoints: (axiom, amount) => {
    const { globalData } = get();
    const newGlobal = { 
        ...globalData, 
        axiomPoints: {
            ...globalData.axiomPoints,
            [axiom]: globalData.axiomPoints[axiom] + amount
        }
    };
    SaveManager.saveGlobal(newGlobal);
    set({ globalData: newGlobal });
  },

  unlockAxiomNode: (nodeId, cost, axiom) => {
    const { globalData } = get();
    if (globalData.axiomPoints[axiom] >= cost && !globalData.unlockedAxiomNodes.includes(nodeId)) {
        const newGlobal = {
            ...globalData,
            axiomPoints: {
                ...globalData.axiomPoints,
                [axiom]: globalData.axiomPoints[axiom] - cost
            },
            unlockedAxiomNodes: [...globalData.unlockedAxiomNodes, nodeId]
        };
        SaveManager.saveGlobal(newGlobal);
        set({ globalData: newGlobal });
    }
  }
}));
