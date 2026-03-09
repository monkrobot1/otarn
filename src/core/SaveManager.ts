import type { GlobalSaveData, RunStateData } from '../types/save';

const SYSTEM_SAVE_KEY = 'otaran_save_system';

export interface SaveSlotMetadata {
  id: string;
  name: string;
  lastPlayed: number;
  runActive: boolean;
  sparks: number;
}

export interface SaveSystemData {
  slots: SaveSlotMetadata[];
  activeSlotId: string | null;
}

export class SaveManager {
  static getSystemData(): SaveSystemData {
    if (typeof window === 'undefined') return { slots: [], activeSlotId: null };
    try {
      const data = localStorage.getItem(SYSTEM_SAVE_KEY);
      return data ? JSON.parse(data) : { slots: [], activeSlotId: null };
    } catch {
      return { slots: [], activeSlotId: null };
    }
  }

  static saveSystemData(data: SaveSystemData): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SYSTEM_SAVE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error("Failed to save system data", e);
      }
    }
  }

  static getGlobalKey(slotId: string) {
    return `otaran_global_save_${slotId}`;
  }

  static getRunKey(slotId: string) {
    return `otaran_run_save_${slotId}`;
  }

  static saveGlobal(data: GlobalSaveData, slotId?: string): void {
    if (typeof window === 'undefined') return;
    const targetSlot = slotId || this.getSystemData().activeSlotId || 'default';
    try {
      localStorage.setItem(this.getGlobalKey(targetSlot), JSON.stringify(data));
      this.updateSlotMetadata(targetSlot, { sparks: data.divineSparks });
    } catch (e) {
      console.error("Failed to save global data", e);
    }
  }

  static loadGlobal(slotId?: string): GlobalSaveData | null {
    if (typeof window === 'undefined') return null;
    const targetSlot = slotId || this.getSystemData().activeSlotId;
    if (!targetSlot) return null;
    try {
      const data = localStorage.getItem(this.getGlobalKey(targetSlot));
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load global data", e);
      return null;
    }
  }

  static clearGlobal(slotId?: string): void {
    if (typeof window === 'undefined') return;
    const targetSlot = slotId || this.getSystemData().activeSlotId;
    if (targetSlot) localStorage.removeItem(this.getGlobalKey(targetSlot));
  }

  static saveRun(data: RunStateData, slotId?: string): void {
    if (typeof window === 'undefined') return;
    const targetSlot = slotId || this.getSystemData().activeSlotId || 'default';
    try {
      localStorage.setItem(this.getRunKey(targetSlot), JSON.stringify(data));
      this.updateSlotMetadata(targetSlot, { runActive: data.runActive });
    } catch (e) {
      console.error("Failed to save run data", e);
    }
  }

  static loadRun(slotId?: string): RunStateData | null {
    if (typeof window === 'undefined') return null;
    const targetSlot = slotId || this.getSystemData().activeSlotId;
    if (!targetSlot) return null;
    try {
      const data = localStorage.getItem(this.getRunKey(targetSlot));
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load run data", e);
      return null;
    }
  }

  static clearRun(slotId?: string): void {
    if (typeof window === 'undefined') return;
    const targetSlot = slotId || this.getSystemData().activeSlotId;
    if (targetSlot) {
      localStorage.removeItem(this.getRunKey(targetSlot));
      this.updateSlotMetadata(targetSlot, { runActive: false });
    }
  }

  static updateSlotMetadata(slotId: string, updates: Partial<SaveSlotMetadata>) {
    const sys = this.getSystemData();
    const slotIndex = sys.slots.findIndex(s => s.id === slotId);
    if (slotIndex >= 0) {
      sys.slots[slotIndex] = { ...sys.slots[slotIndex], ...updates, lastPlayed: Date.now() };
    } else {
      sys.slots.push({
        id: slotId,
        name: `Save ${sys.slots.length + 1}`,
        lastPlayed: Date.now(),
        runActive: updates.runActive || false,
        sparks: updates.sparks || 0,
        ...updates
      });
    }
    this.saveSystemData(sys);
  }

  static createSlot(name: string): string {
    const sys = this.getSystemData();
    const newId = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    sys.slots.push({
      id: newId,
      name,
      lastPlayed: Date.now(),
      runActive: false,
      sparks: 0
    });
    sys.activeSlotId = newId;
    this.saveSystemData(sys);
    return newId;
  }

  static deleteSlot(slotId: string) {
    if (typeof window === 'undefined') return;
    const sys = this.getSystemData();
    sys.slots = sys.slots.filter(s => s.id !== slotId);
    if (sys.activeSlotId === slotId) {
      sys.activeSlotId = sys.slots.length > 0 ? sys.slots[0].id : null;
    }
    this.saveSystemData(sys);
    localStorage.removeItem(this.getGlobalKey(slotId));
    localStorage.removeItem(this.getRunKey(slotId));
  }

  static setActiveSlot(slotId: string) {
    const sys = this.getSystemData();
    if (sys.slots.some(s => s.id === slotId)) {
      sys.activeSlotId = slotId;
      this.saveSystemData(sys);
    }
  }

  static wipeAllData(): void {
    if (typeof window !== 'undefined') {
      const sys = this.getSystemData();
      for (const slot of sys.slots) {
        localStorage.removeItem(this.getGlobalKey(slot.id));
        localStorage.removeItem(this.getRunKey(slot.id));
      }
      localStorage.removeItem(SYSTEM_SAVE_KEY);
    }
  }

  static exportSlotToFile(slotId: string) {
    const globalData = this.loadGlobal(slotId);
    const runData = this.loadRun(slotId);
    const sys = this.getSystemData();
    const meta = sys.slots.find(s => s.id === slotId);

    const exportObj = {
      meta,
      globalData,
      runData,
      exportVersion: 1
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `otaran_save_${meta?.name || slotId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  static importSlotFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed && typeof parsed === "object") {
            const newId = `slot_${Date.now()}_imp`;
            const name = parsed.meta?.name ? `${parsed.meta.name} (Imported)` : 'Imported Save';
            
            const sys = this.getSystemData();
            sys.slots.push({
              id: newId,
              name,
              lastPlayed: Date.now(),
              runActive: parsed.runData?.runActive || false,
              sparks: parsed.globalData?.divineSparks || 0,
            });
            sys.activeSlotId = newId;
            this.saveSystemData(sys);

            if (parsed.globalData) {
              localStorage.setItem(this.getGlobalKey(newId), JSON.stringify(parsed.globalData));
            }
            if (parsed.runData) {
              localStorage.setItem(this.getRunKey(newId), JSON.stringify(parsed.runData));
            }
            resolve(newId);
          } else {
            reject("Invalid save file format");
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }
}
