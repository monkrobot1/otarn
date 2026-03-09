import { useState, useRef, useEffect } from 'react';
import { AutoRunEngine } from '../../systems/AutoRunEngine';
import type { SimRunStats, SimGameState } from '../../systems/AutoRunEngine';
import { CharacterFactory } from '../../core/CharacterFactory';
import { useGameStore } from '../../store/gameStore';
import { PortraitSprite } from '../UI/PortraitSprite';
import { calculatePartyPowerProfile } from '../../utils/powerLevel';

export const AutoPlayerSim = ({ onClose }: { onClose: () => void }) => {
    const [running, setRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [results, setResults] = useState<SimRunStats | null>(null);
    const [multiStats, setMultiStats] = useState<{ wins: number, losses: number, total: number, statsList?: SimRunStats[] } | null>(null);
    const [simState, setSimState] = useState<SimGameState | null>(null);
    
    // Config State
    const [startFaith, setStartFaith] = useState(50);
    const [useDmgRelic, setUseDmgRelic] = useState(false);
    const [useDefRelic, setUseDefRelic] = useState(false);
    const [useCurrentSave, setUseCurrentSave] = useState(false);
    
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const runWatchMode = async () => {
        setRunning(true);
        setLogs([]);
        setResults(null);
        setMultiStats(null);
        setSimState(null);
        
        
        const startingRelics = ['REL_STARTING_01'];
        if (useDmgRelic) startingRelics.push('REL_DMG_BOOST');
        if (useDefRelic) startingRelics.push('REL_DEF_BOOST');
        
        const storeState = useGameStore.getState();

        const stats = await AutoRunEngine.simulateRun({
            config: {
                startingFaith: startFaith,
                startingRelics: startingRelics,
                delayMs: 500,
                importedRunData: useCurrentSave ? storeState.runData : null,
                importedGlobalData: useCurrentSave ? storeState.globalData : null
            },
            onLog: (msg) => {
                setLogs(prev => [...prev, msg]);
            },
            onStateUpdate: (state) => {
                setSimState(state);
            }
        }); // 500ms delay per step so the user can watch

        setResults(stats);
        setRunning(false);
    };

    const runHeadlessBatch = async (count: number = 100) => {
        setRunning(true);
        setLogs(['--- INITIATING HIGH-SPEED HEADLESS BATCH (' + count + ' RUNS) ---']);
        setResults(null);
        setMultiStats({ wins: 0, losses: 0, total: 0 });
        setSimState(null);

        const startingRelics = ['REL_STARTING_01'];
        if (useDmgRelic) startingRelics.push('REL_DMG_BOOST');
        if (useDefRelic) startingRelics.push('REL_DEF_BOOST');

        const storeState = useGameStore.getState();

        let wins = 0;
        let losses = 0;
        const statsList: SimRunStats[] = [];

        // Run synchronously fast without UI blocking
        const processBatch = async () => {
            for (let i = 0; i < count; i++) {
                const stats = await AutoRunEngine.simulateRun({ 
                    config: {
                        startingFaith: startFaith,
                        startingRelics: startingRelics,
                        delayMs: 0,
                        importedRunData: useCurrentSave ? storeState.runData : null,
                        importedGlobalData: useCurrentSave ? storeState.globalData : null
                    }
                }); // 0ms delay, no callbacks
                
                statsList.push(stats);
                if (stats.win) wins++;
                else losses++;

                if (i % 10 === 0) {
                     setMultiStats({ wins, losses, total: i + 1 });
                     // Yield briefly to let React render progress indicator
                     await new Promise(r => setTimeout(r, 0));
                }
            }
            
            setMultiStats({ wins, losses, total: count, statsList });
            setLogs(prev => [
                ...prev, 
                '--- BATCH COMPLETE ---', 
                `WINS: ${wins} | LOSSES: ${losses} | WINRATE: ${((wins/count)*100).toFixed(1)}%`,
                `AVG SPARKS (WINS): ${Math.floor(statsList.filter(s => s.win).reduce((sum, s) => sum + s.finalSparks, 0) / (wins || 1))}`
            ]);
            setRunning(false);
        };

        processBatch();
    };

    const downloadTelemetry = () => {
        if (!multiStats || !multiStats.statsList) return;
        
        const data = {
            configUsed: {
                startingFaith: startFaith,
                dmgRelicUsed: useDmgRelic,
                defRelicUsed: useDefRelic
            },
            summary: {
                totalRuns: multiStats.total,
                wins: multiStats.wins,
                losses: multiStats.losses,
                winRate: `${((multiStats.wins / multiStats.total) * 100).toFixed(1)}%`
            },
            rawRuns: multiStats.statsList
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `otarn-telemetry-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-xl">
            <div className="w-[1200px] h-[800px] bg-[#070a0f] border border-cyan-800 shadow-[0_0_50px_rgba(0,255,255,0.1)] rounded flex flex-col font-mono">
                {/* Header */}
                <div className="flex justify-between items-center bg-cyan-900/40 p-3 border-b border-cyan-800 text-cyan-400">
                    <h2 className="text-xl tracking-widest">[AUTO-PLAYER AGENT INTERFACE]</h2>
                    <button onClick={onClose} className="hover:text-white px-2 cursor-pointer border border-transparent hover:border-cyan-500">
                        [X] ABORT
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Controls Panel */}
                    <div className="w-[300px] border-r border-cyan-800/50 p-6 flex flex-col gap-6 bg-black/40 overflow-y-auto shrink-0">
                        
                        <div className="text-xs text-gray-400 leading-relaxed mb-[-12px]">
                            Configure starting variables to test Meta-Progression balance:
                        </div>
                        
                        <div className="bg-black/80 px-4 py-3 border border-gray-800 flex flex-col gap-2 text-xs">
                            <div className="flex justify-between items-center text-green-400 font-bold border-b border-gray-800 pb-2 mb-1">
                                <label>USE CURRENT SAVE GAME:</label>
                                <input 
                                    type="checkbox" 
                                    checked={useCurrentSave}
                                    onChange={(e) => setUseCurrentSave(e.target.checked)}
                                    disabled={running}
                                />
                            </div>
                            <div className={`flex justify-between items-center text-gold-trim ${useCurrentSave ? 'opacity-30' : ''}`}>
                                <label>INIT FAITH:</label>
                                <input 
                                    type="number" 
                                    value={startFaith} 
                                    onChange={(e) => setStartFaith(Number(e.target.value))}
                                    className="bg-black border border-gold-trim/50 w-16 text-center text-white"
                                    disabled={running || useCurrentSave}
                                />
                            </div>
                            <div className={`flex justify-between items-center text-purple-400 border-t border-gray-800 pt-2 ${useCurrentSave ? 'opacity-30' : ''}`}>
                                <label>+20% DMG RELIC:</label>
                                <input 
                                    type="checkbox" 
                                    checked={useDmgRelic}
                                    onChange={(e) => setUseDmgRelic(e.target.checked)}
                                    disabled={running || useCurrentSave}
                                />
                            </div>
                            <div className={`flex justify-between items-center text-cyan-400 ${useCurrentSave ? 'opacity-30' : ''}`}>
                                <label>-20% DMG TAKEN RELIC:</label>
                                <input 
                                    type="checkbox" 
                                    checked={useDefRelic}
                                    onChange={(e) => setUseDefRelic(e.target.checked)}
                                    disabled={running || useCurrentSave}
                                />
                            </div>
                        </div>

                        <div className="bg-black/80 p-4 border border-cyan-900 shadow-inner">
                            <h3 className="text-cyan-400 mb-2 border-b border-cyan-900 pb-1 font-bold">MODE 01: WATCH</h3>
                            <p className="text-[10px] text-gray-500 mb-4">Slowly simulates a complete run, displaying combat outcomes and event rolls while visualizing the party's current status.</p>
                            <button 
                                onClick={() => runWatchMode()}
                                disabled={running}
                                className={`w-full py-3 border ${running ? 'border-gray-800 text-gray-600' : 'border-cyan-500 text-cyan-400 hover:bg-cyan-900/30'} cursor-pointer transition-all active:scale-95 text-sm tracking-widest font-bold`}
                            >
                                INITIATE WATCH MODE
                            </button>
                        </div>

                        <div className="bg-black/80 p-4 border border-orange-900 shadow-inner">
                            <h3 className="text-orange-400 mb-2 border-b border-orange-900 pb-1 font-bold">MODE 02: BATCH</h3>
                            <p className="text-[10px] text-gray-500 mb-4">Instantly runs the AI through a user-defined number of runs at max CPU speed to output aggregate run-completion telemetry.</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => runHeadlessBatch(100)}
                                    disabled={running}
                                    className={`flex-1 py-3 border ${running ? 'border-gray-800 text-gray-600' : 'border-orange-500 text-orange-400 hover:bg-orange-900/30'} cursor-pointer transition-all active:scale-95 text-xs tracking-widest font-bold`}
                                >
                                    100x RUNS
                                </button>
                                <button 
                                    onClick={() => runHeadlessBatch(1000)}
                                    disabled={running}
                                    className={`flex-1 py-3 border ${running ? 'border-gray-800 text-gray-600' : 'border-red-500 text-red-400 hover:bg-red-900/30'} cursor-pointer transition-all active:scale-95 text-xs tracking-widest font-bold`}
                                >
                                    1000x RUNS
                                </button>
                            </div>
                            {multiStats && multiStats.total >= 100 && !running && (
                                <button
                                    onClick={downloadTelemetry}
                                    className="w-full mt-2 py-2 border border-green-800 text-green-500 hover:bg-green-900/30 text-[10px] tracking-widest transition-all active:scale-95"
                                >
                                    [ EXPORT JSON TELEMETRY ]
                                </button>
                            )}
                        </div>

                        {/* Live Results Panel */}
                        {results && (
                           <div className="mt-auto bg-[#0a1510] p-4 border border-green-800 text-xs text-green-400">
                               <h3 className="font-bold border-b border-green-800 mb-2 pb-1 text-green-300">RUN COMPLETE</h3>
                               <div className="flex justify-between"><span>Status:</span> <span>{results.win ? 'VICTORY' : 'DEFEAT'}</span></div>
                               <div className="flex justify-between"><span>Battles Won:</span> <span>{results.battlesFought}</span></div>
                               <div className="flex justify-between"><span>Elites Slain:</span> <span>{results.elitesDefeated}</span></div>
                               <div className="flex justify-between"><span>Damage Taken:</span> <span>{results.totalDamageTaken} HP</span></div>
                               <div className="flex justify-between text-yellow-300 font-bold border-t border-green-800 pt-1 mt-1">
                                   <span>Sparks Earned:</span> <span>{results.finalSparks}</span>
                               </div>
                           </div>
                        )}

                        {multiStats && (
                           <div className="mt-auto bg-[#0a1015] p-4 border border-blue-800 text-xs text-blue-400">
                               <h3 className="font-bold border-b border-blue-800 mb-2 pb-1 text-blue-300">BATCH PROGRESS</h3>
                               <div className="flex justify-between mb-2">
                                   <span>COMPLETED:</span> 
                                   <span>{multiStats.total}</span>
                               </div>
                               <div className="w-full bg-blue-950 h-1 mb-4">
                                   <div className="bg-blue-400 h-full" style={{ width: `${(multiStats.total / multiStats.wins + multiStats.losses) * 100}%` }} />
                               </div>
                               <div className="flex justify-between text-green-500"><span>WINS:</span> <span>{multiStats.wins}</span></div>
                               <div className="flex justify-between text-red-500"><span>LOSSES:</span> <span>{multiStats.losses}</span></div>
                               <div className="flex justify-between text-yellow-500 font-bold mt-2 pt-2 border-t border-blue-900">
                                   <span>WINRATE:</span> 
                                   <span>{multiStats.total > 0 ? ((multiStats.wins / multiStats.total)*100).toFixed(1) : 0}%</span>
                               </div>
                           </div>
                        )}

                    </div>

                    {/* Simulation Visuals & Logs Panel */}
                    <div className="flex-1 flex flex-col bg-black">
                        {/* Real-time HUD (Only show in Watch Mode when simState exists) */}
                        {simState && (
                            <div className="w-full min-h-[300px] shrink-0 border-b border-cyan-900/50 bg-[#05080c] p-4 flex flex-col gap-4 overflow-visible">
                                <div className="flex justify-between items-center px-4">
                                    <div className="text-cyan-300 font-bold tracking-widest text-lg">
                                        CURRENT NODE: {simState.currentNode ? `[${simState.currentNode.type.toUpperCase()}]` : 'UNKNOWN'}
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="text-gold-trim font-mono text-sm border border-gold-trim/30 px-3 py-1 bg-gold-trim/10 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-gold-trim rounded-full animate-pulse"></span>
                                            SPARKS: {simState.divineSparks || 0}
                                        </div>
                                        <div className="text-cyan-300 font-mono text-sm border border-cyan-300/30 px-3 py-1 bg-cyan-900/10">
                                            FAITH: {simState.ephemeralFaith}
                                        </div>
                                        <div className="text-purple-300 font-mono text-sm border border-purple-300/30 px-3 py-1 bg-purple-900/10">
                                            CP: {calculatePartyPowerProfile(simState.party).totalScore}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Party Status */}
                                <div className="flex-1 flex gap-4 px-4 justify-center items-center">
                                    {simState.party.map((p, idx) => {
                                        const maxHp = CharacterFactory.calculateMaxHp(p.stats.base, p.level);
                                        const maxMp = p.stats.base ? 5 + (p.stats.base.capacity * 10) : 100;
                                        const maxZeal = 100;
                                        const hpPercent = Math.max(0, (p.currentHp / maxHp) * 100);
                                        const mpPercent = Math.max(0, Math.min(100, (p.currentMp / maxMp) * 100));
                                        const zealPercent = Math.max(0, Math.min(100, ((p.currentRevelation || 0) / maxZeal) * 100));
                                        const isDead = p.currentHp <= 0;
                                        
                                        return (
                                            <div key={idx} className={`w-[200px] border ${isDead ? 'border-red-900 bg-red-900/10 opacity-50' : 'border-cyan-800 bg-cyan-900/10'} p-3 rounded flex flex-col items-center relative overflow-hidden`}>
                                                {/* Mini portrait / Name */}
                                                <div className="w-16 h-16 rounded-full bg-black border border-cyan-800 mb-2 flex flex-col items-center justify-center overflow-hidden relative shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                                                    <PortraitSprite baseId={p.baseId} className="w-full h-full opacity-90 scale-[1.2] translate-y-2" />
                                                    <div className="absolute inset-x-0 bottom-0 bg-black/70 text-center text-[9px] font-bold text-yellow-400 font-mono py-0.5 shadow-[0_-2px_4px_rgba(0,0,0,0.5)]">
                                                        LVL {p.level}
                                                    </div>
                                                </div>
                                                <h4 className="text-sm text-cyan-200 truncate w-full text-center">{p.name}</h4>
                                                <span className="text-[10px] text-gray-500 mb-2">{p.race} {p.combatRole}</span>
                                                
                                                {/* HP Bar */}
                                                <div className="flex justify-between w-full text-[9px] text-gray-400 font-mono tracking-widest leading-none mb-1">
                                                    <span>HP:</span>
                                                    <span>{Math.max(0, Math.floor(p.currentHp))}/{maxHp}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-900 border border-black rounded relative mb-1.5 overflow-hidden">
                                                    <div 
                                                        className={`absolute left-0 top-0 bottom-0 ${isDead ? 'bg-red-500' : hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'} transition-all`} 
                                                        style={{ width: `${hpPercent}%` }}
                                                    />
                                                </div>

                                                <div className="flex justify-between w-full text-[9px] text-gray-400 font-mono tracking-widest leading-none mb-1">
                                                    <span className="text-blue-400/80">MP:</span>
                                                    <span>{Math.floor(p.currentMp)}/{maxMp}</span>
                                                </div>
                                                <div className="w-full h-1 bg-gray-900 border border-black rounded relative mb-1.5 overflow-hidden">
                                                    <div className="absolute left-0 top-0 bottom-0 bg-blue-500 transition-all shadow-[0_0_5px_rgba(59,130,246,0.5)]" style={{ width: `${mpPercent}%` }} />
                                                </div>

                                                <div className="flex justify-between w-full text-[9px] text-gray-400 font-mono tracking-widest leading-none mb-1">
                                                    <span className="text-purple-400/80">ZEAL:</span>
                                                    <span>{Math.floor(p.currentRevelation || 0)}/{maxZeal}</span>
                                                </div>
                                                <div className="w-full h-1 bg-gray-900 border border-black rounded relative mb-1.5 overflow-hidden">
                                                    <div className="absolute left-0 top-0 bottom-0 bg-purple-500 transition-all shadow-[0_0_5px_rgba(168,85,247,0.5)]" style={{ width: `${zealPercent}%` }} />
                                                </div>

                                                <div className="flex justify-between w-full text-[9px] text-gray-400 font-mono tracking-widest leading-none mb-1 border-t border-white/5 pt-1 mt-1">
                                                    <span className="text-cyan-600">XP:</span>
                                                    <span>{Math.floor(p.currentXp || 0)}/{p.xpToNextLevel || 100}</span>
                                                </div>
                                                <div className="w-full h-0.5 bg-black border border-gray-800 rounded relative overflow-hidden">
                                                    <div 
                                                        className="absolute left-0 top-0 bottom-0 bg-cyan-500 transition-all duration-300" 
                                                        style={{ width: `${Math.min(100, Math.max(0, ((p.currentXp || 0) / (p.xpToNextLevel || 100)) * 100))}%` }}
                                                    />
                                                </div>

                                                {/* Statuses */}
                                                {(p.buffs?.length > 0 || p.debuffs?.length > 0) && (
                                                    <div className="flex gap-1 mt-2 w-full flex-wrap justify-center border-t border-white/5 pt-1">
                                                        {p.buffs?.map((b, i) => <span key={`b-${i}`} className="text-[8px] bg-green-900/40 text-green-300 px-1 rounded border border-green-500/30 uppercase">{b.type}</span>)}
                                                        {p.debuffs?.map((d, i) => <span key={`d-${i}`} className="text-[8px] bg-red-900/40 text-red-300 px-1 rounded border border-red-500/30 uppercase">{d.type}</span>)}
                                                    </div>
                                                )}

                                                {isDead && (
                                                    <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center backdrop-blur-[1px]">
                                                        <span className="text-red-500 font-bold border border-red-500 px-2 py-1 bg-black/80 rotate-12 mt-8 shadow-[0_0_10px_rgba(255,0,0,0.5)]">SLAIN</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Relics / Inventory */}
                                <div className="px-4 flex gap-2 overflow-x-auto text-xs text-gray-500 items-center h-8 no-scrollbar">
                                                    <span className="text-cyan-700 mr-2 shrink-0">RELICS & TALENTS:</span>
                                                    {simState.activeRelics.length === 0 && simState.activeTalents.length === 0 && <span>None</span>}
                                                    {simState.activeRelics.map((r, i) => (
                                                        <div key={`relic-${i}`} className="px-2 py-1 border border-purple-900 bg-purple-900/20 text-purple-300 whitespace-nowrap shrink-0">
                                                            {r}
                                                        </div>
                                                    ))}
                                                    {simState.activeTalents?.map((t, i) => (
                                                        <div key={`talent-${i}`} className="px-2 py-1 border border-blue-900 bg-blue-900/20 text-blue-300 whitespace-nowrap shrink-0">
                                                            {t}
                                                        </div>
                                                    ))}
                                                </div>
                            </div>
                        )}

                        {/* Console Log MUD View */}
                        <div className="flex-1 p-6 flex flex-col items-start overflow-y-auto text-[11px] font-mono leading-relaxed max-h-full">
                            {logs.length === 0 && !running && (
                                <div className="w-full h-full flex items-center justify-center text-gray-700 animate-pulse text-lg tracking-widest">
                                    WAITING FOR COMMAND
                                </div>
                            )}
                            
                            {logs.map((log, i) => {
                                // Syntax Highlighting for important keywords
                                const isWin = log.includes('SUCCESSFUL');
                                const isFail = log.includes('FAILURE') || log.includes('WIPED');
                                const isCombat = log.includes('Initiating') || log.includes('Combat');
                                const isEvent = log.includes('Event') || log.includes('anomaly');
                                
                                return (
                                    <div key={i} className={`mb-1 ${
                                        isWin ? 'text-green-400 font-bold bg-green-900/20 px-2 py-1' :
                                        isFail ? 'text-red-500 font-bold bg-red-900/20 px-2 py-1' :
                                        isCombat ? 'text-orange-300' :
                                        isEvent ? 'text-purple-300' :
                                        'text-gray-400'
                                    }`}>
                                    &gt; {log}
                                    </div>
                                );
                            })}
                            
                            {running && !multiStats && (
                                <div className="text-cyan-600 mt-2 flex gap-2 w-full animate-pulse">
                                    <span>&gt;</span>
                                    <span className="bg-cyan-600 w-2 h-4 block"></span>
                                </div>
                            )}
                            
                            <div ref={logsEndRef} /> {/* Anchor for auto-scroll */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
