import type { GlobalSaveData, RunStateData } from '../types/save';

const GLOBAL_SAVE_KEY = 'otaran_global_save';
const RUN_SAVE_KEY = 'otaran_run_save';

export class SaveManager {
  static saveGlobal(data: GlobalSaveData): void {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(GLOBAL_SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Failed to save global data", e);
        }
    }
  }

  static loadGlobal(): GlobalSaveData | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(GLOBAL_SAVE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load global data", e);
      return null;
    }
  }

  static clearGlobal(): void {
    if (typeof window !== 'undefined') localStorage.removeItem(GLOBAL_SAVE_KEY);
  }

  static saveRun(data: RunStateData): void {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(RUN_SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Failed to save run data", e);
        }
    }
  }

  static loadRun(): RunStateData | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(RUN_SAVE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load run data", e);
      return null;
    }
  }

  static clearRun(): void {
    if (typeof window !== 'undefined') localStorage.removeItem(RUN_SAVE_KEY);
  }

  static wipeAllData(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(GLOBAL_SAVE_KEY);
        localStorage.removeItem(RUN_SAVE_KEY);
    }
  }
}
