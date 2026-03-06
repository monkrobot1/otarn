import { create } from 'zustand';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogSystem = 'combat' | 'map' | 'asset' | 'state' | 'animation' | 'network' | 'save';

export interface LogEntry {
    id: string;
    timestamp: number;
    level: LogLevel;
    system: LogSystem;
    message: string;
    data?: any;
}

interface DebugStore {
    enabled: boolean;
    logs: LogEntry[];
    systemFilters: Partial<Record<LogSystem, boolean>>;
    
    // Actions
    toggleDebug: () => void;
    toggleSystemFilter: (system: LogSystem) => void;
    log: (level: LogLevel, system: LogSystem, message: string, data?: any) => void;
    clearLogs: () => void;
}

export const useDebugStore = create<DebugStore>((set, get) => ({
    enabled: true, // Auto-enabled for prototype testing phase
    logs: [],
    systemFilters: {
        combat: true,
        map: true,
        asset: true,
        state: true,
        animation: true,
        network: true,
        save: true
    },
    
    toggleDebug: () => set(state => ({ enabled: !state.enabled })),
    
    toggleSystemFilter: (system) => set(state => ({
        systemFilters: { ...state.systemFilters, [system]: !state.systemFilters[system] }
    })),
    
    log: (level, system, message, data) => {
        const { enabled, systemFilters } = get();
        if (!enabled || systemFilters[system] === false) return;

        const entry: LogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            level,
            system,
            message,
            data
        };

        // Also pipe directly to browser console so I can read it
        const prefix = `[${system.toUpperCase()}]`;
        if (level === 'error') console.error(prefix, message, data || '');
        else if (level === 'warn') console.warn(prefix, message, data || '');
        else if (level === 'debug') console.debug(prefix, message, data || '');
        else console.log(prefix, message, data || '');

        // Fire-and-forget payload to backend so AI can read it in the Vite terminal
        fetch('/api/log', {
            method: 'POST',
            body: JSON.stringify({ level, prefix, message, data })
        }).catch(_err => {}); // ignore fetch errors quietly

        set(state => ({
            logs: [entry, ...state.logs].slice(0, 500) // Keep last 500 logs max
        }));
    },
    
    clearLogs: () => set({ logs: [] })
}));

// Convenience generic wrapper for direct file imports without accessing the hook
export const InternalLogger = {
  info: (system: LogSystem, message: string, data?: any) => useDebugStore.getState().log('info', system, message, data),
  warn: (system: LogSystem, message: string, data?: any) => useDebugStore.getState().log('warn', system, message, data),
  error: (system: LogSystem, message: string, data?: any) => useDebugStore.getState().log('error', system, message, data),
  debug: (system: LogSystem, message: string, data?: any) => useDebugStore.getState().log('debug', system, message, data),
};
