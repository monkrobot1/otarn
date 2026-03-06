import { create } from 'zustand';
import type { GlobalSaveData, RunStateData } from '../types/save';
import { SaveManager } from '../core/SaveManager';
import { AXIOM_TREES } from '../data/axiomData';

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
  consumeSpark: () => boolean; // Returns false if out of fuel
}

export const useGameStore = create<GameState>((set, get) => ({
  globalData: (() => {
    const defaults: GlobalSaveData = {
        divineSparks: 0,
        axiomPoints: { Order: 0, Chaos: 0, Judgment: 0, Love: 0 },
        unlockedAxiomNodes: {},
        unlockedTalentIds: [],
        unlockedRelicIds: [],
        permanentStatBonuses: {},
        unlockedGodAbilities: []
    };
    const loaded = SaveManager.loadGlobal();
    if (!loaded) return defaults;
    
    return {
        ...defaults,
        ...loaded,
        axiomPoints: { ...defaults.axiomPoints, ...(loaded.axiomPoints || {}) },
        unlockedGodAbilities: loaded.unlockedGodAbilities || []
    };
  })(),
  runData: (() => {
    const loaded = SaveManager.loadRun();
    if (!loaded) return null;
    
    // Ensure new fields exist even in old saves
    return {
        ...loaded,
        divineSparks: typeof loaded.divineSparks === 'number' ? loaded.divineSparks : 12,
        ephemeralFaith: typeof loaded.ephemeralFaith === 'number' ? loaded.ephemeralFaith : 50,
        availableGodAbilities: Array.isArray(loaded.availableGodAbilities) ? loaded.availableGodAbilities : []
    };
  })(),
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
    const { globalData } = get();
    const newRun: RunStateData = {
      runActive: true,
      divineSparks: 12, // Starting FUEL (like FTL)
      ephemeralFaith: 50, // Starting Run Currency
      currentNodeId: 'START',
      activeParty: [], // Drafted in Faith Draft phase
      activeRelics: [],
      activeTalents: [],
      visitedNodes: [],
      availableGodAbilities: Array.isArray(globalData.unlockedGodAbilities) ? [...globalData.unlockedGodAbilities] : []
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
    const currentLevel = globalData.unlockedAxiomNodes[nodeId] || 0;
    
    if (globalData.axiomPoints[axiom] >= cost) {
        let newUnlockedAbilities = Array.isArray(globalData.unlockedGodAbilities) ? [...globalData.unlockedGodAbilities] : [];

        // Find the node to check its effect
        const tree = AXIOM_TREES[axiom];
        let effectNode = null;
        for (const tier of tree) {
            const node = tier.find((n: any) => n.id === nodeId);
            if (node) {
                effectNode = node;
                break;
            }
        }

        if (effectNode && effectNode.effectType === 'unlock_god_ability') {
            if (!newUnlockedAbilities.includes(effectNode.effectValue)) {
                newUnlockedAbilities.push(effectNode.effectValue);
            }
        }

        const newGlobal = {
            ...globalData,
            axiomPoints: {
                ...globalData.axiomPoints,
                [axiom]: globalData.axiomPoints[axiom] - cost
            },
            unlockedAxiomNodes: {
                ...globalData.unlockedAxiomNodes,
                [nodeId]: currentLevel + 1
            },
            unlockedGodAbilities: newUnlockedAbilities
        };
        SaveManager.saveGlobal(newGlobal);
        set({ globalData: newGlobal });
    }
  },

  consumeSpark: () => {
    const { runData } = get();
    if (!runData || runData.divineSparks <= 0) return false;
    
    const updated = { ...runData, divineSparks: runData.divineSparks - 1 };
    SaveManager.saveRun(updated);
    set({ runData: updated });
    return true;
  }
}));
