import { useState } from 'react';
import { CharacterFactory } from '../../core/CharacterFactory';
import { EncounterManager } from '../../core/EncounterManager';
import type { ActiveCharacter } from '../../types/character';

export const BattleSim = ({ onClose }: { onClose: () => void }) => {
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<{
        iterations: number;
        wins: number;
        losses: number;
        avgHpRemaining: number;
        avgTurns: number;
        logs: string[];
    } | null>(null);

    const runSimulation = async (iterations: number = 100) => {
        setRunning(true);
        setResults(null);
        
        // 1. Setup Tracking
        let wins = 0;
        let losses = 0;
        let totalHpRemaining = 0;
        let totalTurns = 0;
        const simLogs: string[] = [];

        // 2. Headless Simulation Loop
        for (let i = 0; i < iterations; i++) {
            // Setup fresh instances for this iteration
            const P1 = CharacterFactory.createFromBaseId('CHR_ORD_GRV_001', 1); // Grav-Lancer
            const P2 = CharacterFactory.createFromBaseId('CHR_LOV_BLD_001', 1); // Blood-Druid
            const P3 = CharacterFactory.createFromBaseId('CHR_JUD_DTH_001', 1); // Necro-Mechanic
            const P4 = CharacterFactory.createFromBaseId('CHR_CHA_AIR_001', 1); // Zephyr-Sprite
            
            if (!P1 || !P2 || !P3 || !P4) continue;
            
            const playerParty = [P1, P2, P3, P4] as ActiveCharacter[];
            const maxPartyHp = playerParty.reduce((sum, p) => sum + p.stats.current.capacity * 5 + 10, 0); // Approx
            
            const enemies = EncounterManager.generateEncounter('combat', 'Judgment', 1);

            const allAllies = [...playerParty];
            const allEnemies = [...enemies];
            let currentTurn = 0;
            let combatOver = false;

            // Simplified auto-battler logic bypassing Zustand for speed
            while (!combatOver && currentTurn < 100) {
                currentTurn++;
                
                // --- Simple Mock of Round Advance ---
                const allLiving = [...allAllies, ...allEnemies].filter(c => !c.isDead);
                if (allAllies.filter(a => !a.isDead).length === 0) {
                    combatOver = true;
                    losses++;
                    break;
                }
                if (allEnemies.filter(e => !e.isDead).length === 0) {
                    combatOver = true;
                    wins++;
                    
                    const remainingHp = allAllies.reduce((sum, a) => sum + (a.isDead ? 0 : a.currentHp), 0);
                    const hpPercent = (remainingHp / maxPartyHp) * 100;
                    totalHpRemaining += hpPercent;
                    break;
                }

                // Give everyone an action if they are alive (simplifying the queue)
                for (const actor of allLiving) {
                    if (actor.isDead || combatOver) continue;

                    if (allAllies.some(a => a.instanceId === actor.instanceId)) {
                        // Player Turn Mock (Random Target)
                        const livingEnemies = allEnemies.filter(e => !e.isDead);
                        if (livingEnemies.length > 0) {
                            const target = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
                            const dmg = Math.floor(Math.max(1, actor.stats.base.physicality * 1.5) - (target.stats.base.physicality * 0.5));
                            if (dmg > 0) target.currentHp -= dmg;
                            if (target.currentHp <= 0) target.isDead = true;
                        }
                    } else {
                        // Enemy Turn Mock using static stats (No CombatAI required for raw headless math simulation if we assume they hit average numbers)
                        const livingPlayers = allAllies.filter(p => !p.isDead);
                        if (livingPlayers.length > 0) {
                             const target = livingPlayers[Math.floor(Math.random() * livingPlayers.length)];
                             const dmg = Math.floor(Math.max(1, actor.stats.base.physicality * 1.5)); // Baseline
                             target.currentHp -= dmg;
                             if (target.currentHp <= 0) target.isDead = true;
                        }
                    }
                }
            }
            
            totalTurns += currentTurn;
        }

        // 3. Compile Results
        setResults({
            iterations,
            wins,
            losses,
            avgHpRemaining: wins > 0 ? (totalHpRemaining / wins) : 0,
            avgTurns: totalTurns / iterations,
            logs: simLogs
        });
        setRunning(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 backdrop-blur-md">
            <div className="w-[800px] h-[600px] bg-[#0b101a] border border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.2)] rounded flex flex-col font-mono">
                {/* Header */}
                <div className="flex justify-between items-center bg-red-900/40 p-3 border-b border-red-500 text-red-500">
                    <h2 className="text-xl tracking-widest">[HEADLESS COMBAT SIMULATOR]</h2>
                    <button onClick={onClose} className="hover:text-white px-2 cursor-pointer border border-transparent hover:border-red-500">
                        [X] CLOSE
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex p-4 gap-4">
                    {/* Controls */}
                    <div className="w-1/3 border-r border-red-500/30 pr-4 flex flex-col gap-4">
                        <div className="text-sm text-gray-400">
                            Run automated combats behind the scenes to calculate Attrition Curves and Win Rates without fully rendering the UI.
                        </div>
                        
                        <div className="bg-black/50 p-2 border border-red-900">
                            <h3 className="text-red-400 mb-2 border-b border-red-900 pb-1">DEFAULT LOADOUT</h3>
                            <ul className="text-xs text-gray-400 list-disc ml-4">
                                <li>Grav-Lancer (Lvl 1)</li>
                                <li>Blood-Druid (Lvl 1)</li>
                                <li>Necro-Mech (Lvl 1)</li>
                                <li>Zephyr (Lvl 1)</li>
                            </ul>
                        </div>

                        <div className="bg-black/50 p-2 border border-red-900">
                            <h3 className="text-red-400 mb-2 border-b border-red-900 pb-1">TARGET ENCOUNTER</h3>
                            <div className="text-xs text-gray-400">
                                Judgment Minion Node (Sector 1)
                            </div>
                        </div>

                        <button 
                            onClick={() => runSimulation(1000)}
                            disabled={running}
                            className={`mt-auto py-4 border ${running ? 'border-gray-600 text-gray-600' : 'border-red-500 text-red-500 hover:bg-red-900/30'} cursor-pointer transition-all active:scale-95 text-lg tracking-widest`}
                        >
                            {running ? 'CALCULATING...' : 'RUN 1,000 SIMS'}
                        </button>
                    </div>

                    {/* Output */}
                    <div className="flex-1 flex flex-col bg-black/40 border border-red-900/50 p-4">
                        <h3 className="text-lg text-red-400 border-b border-red-900/50 pb-2 mb-4 tracking-widest">
                            TELEMETRY OUTPUT
                        </h3>

                        {!results && !running && (
                            <div className="flex-1 flex items-center justify-center text-gray-600 animate-pulse">
                                AWAITING SIMULATION INITIATION
                            </div>
                        )}

                        {running && (
                            <div className="flex-1 flex flex-col items-center justify-center text-red-500 font-bold text-xl">
                                <span className="animate-ping mb-4">■</span>
                                CRUNCHING MATHEMATICS...
                            </div>
                        )}

                        {results && (
                            <div className="flex-1 flex flex-col gap-4 text-sm scroll-y-auto">
                                <div className="flex justify-between bg-black p-3 border border-green-900/50">
                                    <span className="text-gray-400">Total Runs:</span>
                                    <span className="text-green-400 text-xl font-bold">{results.iterations.toLocaleString()}</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black p-3 border border-red-900/50 flex flex-col items-center justify-center">
                                        <span className="text-gray-500 mb-1">Win Rate</span>
                                        <span className={`text-3xl font-bold ${((results.wins/results.iterations)*100) > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                                            {((results.wins / results.iterations) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="bg-black p-3 border border-blue-900/50 flex flex-col items-center justify-center">
                                        <span className="text-gray-500 mb-1">Avg Turns/Win</span>
                                        <span className="text-blue-400 text-3xl font-bold">
                                            {results.avgTurns.toFixed(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-black p-4 border border-purple-900/50 flex flex-col items-center mt-2">
                                    <span className="text-gray-400 mb-2">Avg Party Health Remaining (Attrition)</span>
                                    <div className="text-4xl text-purple-400 font-bold mb-2">
                                        {results.avgHpRemaining.toFixed(1)}%
                                    </div>
                                    <div className="w-full bg-gray-900 h-2 mt-2">
                                        <div 
                                            className="bg-purple-500 h-full" 
                                            style={{ width: `${results.avgHpRemaining}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4 text-center">
                                        If Attrition is below 75% on an unbuffed standard node, players mathematically cannot survive 4 nodes to reach the elite.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
