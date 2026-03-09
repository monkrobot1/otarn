import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getRandomEvent } from '../../data/eventData';
import type { GameEvent } from '../../data/eventData';
import type { ActiveCharacter } from '../../types/character';
import { useCombatStore } from '../../store/combatStore';
import { EncounterManager } from '../../core/EncounterManager';


export const EventScene = () => {
    const { setScene, runData, updateRunData } = useGameStore();
    const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
    const [resultText, setResultText] = useState<string | null>(null);
    const [pendingOutcome, setPendingOutcome] = useState<{type: string, payload?: any} | null>(null);
    const [animationStates, setAnimationStates] = useState<Record<string, 'talent' | 'damage' | null>>({});
    const [floatingEffects, setFloatingEffects] = useState<Record<string, { id: string, text: string, type: 'positive' | 'negative' | 'neutral' }[]>>({});
    const [debugLog, setDebugLog] = useState<{ roll: number, outcomes: any[], picked: any } | null>(null);
    const [hoveredChoiceId, setHoveredChoiceId] = useState<string | null>(null);
    const prevPartyRef = useRef<ActiveCharacter[]>([]);

    const triggerFloatingEffect = (charId: string, text: string, type: 'positive' | 'negative' | 'neutral' = 'neutral') => {
        const id = Math.random().toString(36).substr(2, 9);
        setFloatingEffects(prev => ({
            ...prev,
            [charId]: [...(prev[charId] || []), { id, text, type }]
        }));
        setTimeout(() => {
            setFloatingEffects(prev => ({
                ...prev,
                [charId]: (prev[charId] || []).filter(e => e.id !== id)
            }));
        }, 3000);
    };

    useEffect(() => {
        setCurrentEvent(getRandomEvent(runData?.currentSector, runData?.currentSectorLevel));
        if (runData?.activeParty) {
            prevPartyRef.current = runData.activeParty;
        }
    }, []);

    if (!currentEvent) return null;

    const handleChoice = (choice: any) => {
        const gameState = {
            runData,
            updateRunData,
            setEventResult: (text: string) => setResultText(text),
            setPendingOutcome: (outcome: any) => setPendingOutcome(outcome),
            triggerFloatingEffect,
            setDebugLog: (data: any) => setDebugLog(data)
        };
        
        choice.onSelect(gameState);
    };

    const handleContinue = () => {
        if (pendingOutcome?.type === 'start_combat') {
            const runData = useGameStore.getState().runData;
            if (runData) {
                const sector = runData.currentSector || 'Judgment';
                const difficulty = pendingOutcome.payload?.difficulty || 'combat';
                
                // Try and find the exact map node level
                const currentNode = runData.generatedMap?.find(n => n.id === runData.currentNodeId);
                const levelToUse = currentNode?.level || runData.currentSectorLevel || 1;

                const enemies = EncounterManager.generateEncounter(difficulty as any, sector, levelToUse);
                useCombatStore.getState().initializeCombat(runData.activeParty, enemies);
                setScene('combat');
            }
            setPendingOutcome(null);
        } else {
            setScene('sector-map');
        }
    };

    const handleCharacterSelect = (char: ActiveCharacter) => {
        if (!pendingOutcome || pendingOutcome.type === 'start_combat') return;

        if (pendingOutcome.type === 'gain_talent') {
            const party = runData?.activeParty ? [...runData.activeParty] : [];
            const targetIdx = party.findIndex(p => p.instanceId === char.instanceId);
            if (targetIdx !== -1) {
                party[targetIdx] = { 
                    ...party[targetIdx], 
                    talents: [...(party[targetIdx].talents || []), { id: 'evt_talent', name: pendingOutcome.payload?.talentName || 'Mystic Boon', tier: 1, rarity: 'Common', category: 'Wildcard', sector: 'Universal', effect: 'Granted by the stars.', cost: 0 }] 
                };
                updateRunData({ activeParty: party });
            }
            setResultText(resultText + `\n\n[ ${char.name} gained a new talent: ${pendingOutcome.payload?.talentName || 'Astral Echo'}! ]`);
            setAnimationStates(prev => ({ ...prev, [char.instanceId]: 'talent' }));
            triggerFloatingEffect(char.instanceId, "++ TALENT", 'positive');
            setTimeout(() => setAnimationStates(prev => ({ ...prev, [char.instanceId]: null })), 2500);
        } else if (pendingOutcome.type === 'take_damage') {
             const party = runData?.activeParty ? [...runData.activeParty] : [];
             const targetIdx = party.findIndex(p => p.instanceId === char.instanceId);
             if (targetIdx !== -1) {
                 party[targetIdx] = { ...party[targetIdx], currentHp: Math.max(1, party[targetIdx].currentHp - (pendingOutcome.payload?.amount || 10)) };
                 updateRunData({ activeParty: party });
             }
             setResultText(resultText + `\n\n[ ${char.name} offered their vitality! Took ${pendingOutcome.payload?.amount || 10} damage. ]`);
             setAnimationStates(prev => ({ ...prev, [char.instanceId]: 'damage' }));
             triggerFloatingEffect(char.instanceId, `-${pendingOutcome.payload?.amount || 10} HP`, 'negative');
             setTimeout(() => setAnimationStates(prev => ({ ...prev, [char.instanceId]: null })), 2000);
        }
        setPendingOutcome(null);
    };

    const renderPartyStatus = () => {
        if (!runData?.activeParty) return null;
        
        const hoveredChoice = currentEvent.choices.find(c => c.id === hoveredChoiceId);

        return (
            <div className="flex w-full justify-start items-stretch gap-6 mt-12 bg-black/40 p-4 border-t border-cyan-400/20 backdrop-blur-md relative z-20 min-h-[180px]">
                {/* Champions List */}
                <div className="flex gap-4">
                    {runData.activeParty.map((char, i) => {
                        const maxHp = char.stats.base.capacity ? 10 + (char.stats.base.capacity * 5) + (char.level * char.stats.base.capacity * 1) : 100;
                        const maxMp = 5 + (char.stats.base.capacity * 10);
                        const hpPct = Math.max(0, Math.min(100, (char.currentHp / maxHp) * 100));
                        const mpPct = Math.max(0, Math.min(100, (char.currentMp / maxMp) * 100));
                        
                        const animState = animationStates[char.instanceId];
                        const isSelectingChampion = pendingOutcome && (pendingOutcome.type === 'gain_talent' || pendingOutcome.type === 'take_damage') && !pendingOutcome.payload?.random;
                        const isSelectable = isSelectingChampion;
                        const isTakingDamage = animState === 'damage' || char.currentHp < (prevPartyRef.current[i]?.currentHp || char.currentHp);
                        const isGainingTalent = animState === 'talent';

                        return (
                            <div 
                                key={char.instanceId} 
                                onClick={() => isSelectable ? handleCharacterSelect(char) : undefined}
                                className={`flex flex-col items-center bg-black/60 border ${isSelectable ? 'border-yellow-400/50 hover:bg-yellow-400/10 cursor-pointer animate-pulse' : 'border-white/10'} p-2 rounded w-40 relative group transition-all
                                ${isTakingDamage ? 'bg-red-900/40 animate-[shake_0.5s_ease-in-out]' : ''}
                                ${isGainingTalent ? 'border-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.5)]' : ''}
                                `}
                            >
                                {isSelectable && <div className="absolute -top-3 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded font-bold uppercase tracking-widest z-10">Select</div>}
                                
                                {/* Effects Layer */}
                                {isGainingTalent && (
                                    <div className="absolute top-0 -inset-x-2 bottom-0 z-0 pointer-events-none flex items-center justify-center mix-blend-screen opacity-80 animate-[fade-in-out_2s_ease-in-out]">
                                        <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_4s_linear_infinite]">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#fde047" strokeWidth="2" strokeDasharray="10 5" />
                                            <polygon points="50,10 85,80 15,80" fill="none" stroke="#fef08a" strokeWidth="1" />
                                            <polygon points="50,90 85,20 15,20" fill="none" stroke="#fef08a" strokeWidth="1" />
                                        </svg>
                                    </div>
                                )}

                                {isTakingDamage && animState === 'damage' && (
                                    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center animate-[fade-in-out_1.5s_ease-out]">
                                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_5px_rgba(220,38,38,1)]">
                                            <path d="M 10,20 Q 30,50 80,90" fill="none" stroke="#ef4444" strokeWidth="4" className="animate-[dash_0.3s_ease-out]" />
                                            <path d="M 20,10 Q 50,40 90,80" fill="none" stroke="#dc2626" strokeWidth="3" className="animate-[dash_0.4s_ease-out]" />
                                        </svg>
                                    </div>
                                )}

                                <div className="w-16 h-16 rounded overflow-hidden border border-white/20 relative mb-2 shadow-inner z-10">
                                    <img src={char.portraitUrl} alt={char.name} className={`w-full h-full object-cover object-top ${isTakingDamage ? 'grayscale opacity-70' : ''} ${isGainingTalent ? 'sepia-[.5] hue-rotate-[20deg] brightness-125' : ''}`} />
                                    {isTakingDamage && <div className="absolute inset-0 bg-red-500/30 mix-blend-overlay"></div>}
                                    {isGainingTalent && <div className="absolute inset-0 bg-yellow-400/20 mix-blend-overlay"></div>}
                                </div>
                                <div className="text-[10px] font-mono tracking-widest text-gray-300 w-full text-center truncate mb-1 bg-black/50 px-1 py-0.5 rounded z-10">
                                    {char.name}
                                </div>
                                
                                <div className="w-full flex justify-between text-[8px] font-mono text-gray-400 px-1 mb-0.5">
                                    <span>HP</span><span>{Math.floor(char.currentHp)}</span>
                                </div>
                                <div className="w-full h-1.5 bg-red-900/50 mb-1 rounded overflow-hidden shadow-inner border border-red-900">
                                    <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${hpPct}%` }} />
                                </div>
                                
                                <div className="w-full flex justify-between text-[8px] font-mono text-gray-400 px-1 mb-0.5">
                                    <span>AETHER</span><span>{Math.floor(char.currentMp)}</span>
                                </div>
                                <div className="w-full h-1 bg-blue-900/50 mb-1 rounded overflow-hidden shadow-inner">
                                    <div className="h-full bg-blue-400 transition-all duration-300" style={{ width: `${mpPct}%` }} />
                                </div>

                                <div className="w-full h-1 bg-purple-900/50 rounded overflow-hidden shadow-inner mt-1">
                                    <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${char.currentRevelation || 0}%` }} />
                                </div>

                                {/* Floating Effect Indicators */}
                                <div className="absolute -bottom-2 w-full flex flex-col items-center gap-1 pointer-events-none z-30 translate-y-full">
                                    {(floatingEffects[char.instanceId] || []).map((effect) => (
                                        <div 
                                            key={effect.id}
                                            className={`px-3 py-1 rounded border shadow-lg text-[10px] font-mono font-bold tracking-widest whitespace-nowrap animate-[float-up_1.5s_ease-out_forwards]
                                                ${effect.type === 'positive' ? 'bg-green-900/80 border-green-400 text-green-300' : 
                                                effect.type === 'negative' ? 'bg-red-900/80 border-red-400 text-red-300' : 
                                                'bg-blue-900/80 border-blue-400 text-blue-300'}
                                            `}
                                        >
                                            {effect.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Debug / Chronicle Panel */}
                <div className="flex-1 glass-panel border border-cyan-400/20 bg-black/60 p-4 font-mono overflow-hidden flex flex-col">
                    <div className="text-[10px] text-cyan-400/50 uppercase tracking-[0.2em] mb-3 border-b border-cyan-400/20 pb-1 flex justify-between">
                        <span>Pre-cognitive Chronicle</span>
                        {debugLog && <span className="text-yellow-400 animate-pulse">ROLL: {debugLog.roll.toFixed(1)}</span>}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                        {debugLog ? (
                             <div className="space-y-1">
                                {debugLog.outcomes.map((out, idx) => {
                                    const isPicked = debugLog.picked.text === out.text;
                                    return (
                                        <div key={idx} className={`text-[10px] p-1.5 rounded border ${isPicked ? 'bg-cyan-900/40 border-cyan-400 text-cyan-200' : 'bg-black/20 border-white/5 text-gray-500'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold uppercase tracking-widest">{isPicked ? '▶ TRIGGERED' : 'POSSIBILITY'}</span>
                                                <span>{out.weight}% CHANCE</span>
                                            </div>
                                            <p className="leading-tight italic opacity-80">{out.text}</p>
                                        </div>
                                    );
                                })}
                             </div>
                        ) : hoveredChoice ? (
                            <div className="opacity-60 space-y-1">
                                <div className="text-[9px] text-gray-500 mb-2 italic px-1">Predicting outcomes for: {hoveredChoice.label}</div>
                                {((hoveredChoice as any).rawOutcomes || []).map((out: any, idx: number) => (
                                    <div key={idx} className="text-[10px] p-1.5 rounded border border-white/5 bg-white/5 text-gray-400 flex justify-between items-center">
                                        <span className="truncate max-w-[70%]">{out.text}</span>
                                        <span className="text-cyan-400/50">{out.weight}%</span>
                                    </div>
                                ))}
                                {(!(hoveredChoice as any).rawOutcomes || (hoveredChoice as any).rawOutcomes.length === 0) && (
                                    <div className="text-[10px] text-gray-600 text-center py-4 italic">[ No variable outcomes detected ]</div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <span className="text-[10px] text-gray-700 animate-pulse uppercase tracking-widest">Awaiting choice or scrutiny...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col pt-8 pb-32 px-16 relative overflow-y-auto">
            
            <header className="w-full flex justify-between items-center mb-12">
                <h1 className="text-3xl font-light tracking-widest text-cyan-400 border-b border-cyan-400/50 pb-2 drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
                    {currentEvent.title}
                </h1>
                <div className="glass-panel px-4 py-2 text-sm text-cyan-300 font-mono tracking-widest">
                    FAITH: {runData?.ephemeralFaith || 0}
                </div>
            </header>

            <div className="flex flex-1 gap-12 max-w-5xl w-full mx-auto">
                {/* Visual / Image Column */}
                <div className="flex-1 border border-cyan-400/30 glass-panel bg-black/50 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                    <div className="absolute inset-0 bg-gold-trim/5 mix-blend-overlay" />
                    
                    {currentEvent.image && (
                        <div className="absolute inset-0 z-0">
                            <img src={currentEvent.image} alt="Event Background" className="w-full h-full object-cover opacity-30 mix-blend-screen" />
                        </div>
                    )}
                    
                    <div className="w-64 h-64 border border-white/20 rounded flex flex-col justify-center items-center shadow-[0_0_50px_rgba(0,255,255,0.1)] relative overflow-hidden backdrop-blur-sm z-10 bg-black/40">
                       <span className="absolute top-2 left-2 text-cyan-300/80 font-mono text-[10px] tracking-widest">[ ASTRAL ANOMALY ]</span>
                       {currentEvent.image ? (
                           <img src={currentEvent.image} alt={currentEvent.title} className="w-full h-full object-cover p-1" />
                       ) : (
                           <svg className="w-full h-full absolute inset-0 opacity-20 pointer-events-none -z-10 animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100">
                               <line x1="10" y1="10" x2="90" y2="90" stroke="white" strokeWidth="1" />
                               <line x1="90" y1="10" x2="10" y2="90" stroke="white" strokeWidth="1" />
                               <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1" />
                           </svg>
                       )}
                    </div>
                </div>

                {/* Narrative / Choices Column */}
                <div className="flex-1 flex flex-col justify-center">
                    {!resultText ? (
                        <>
                            <div className="mb-8 space-y-4">
                                {currentEvent.description.map((paragraph, idx) => (
                                    <p key={idx} className="text-gray-300 font-body leading-relaxed text-lg tracking-wide border-l-2 border-cyan-400/50 pl-4 py-1"
                                        style={{ animation: `fade-in 0.5s ease-out ${idx * 0.2}s both` }}>
                                        {paragraph}
                                    </p>
                                ))}
                            </div>

                            <div className="space-y-4 mt-8">
                                {currentEvent.choices.map((choice, i) => {
                                    const disabled = choice.condition && !choice.condition({ runData });
                                    return (
                                        <button
                                            key={choice.id}
                                            onClick={() => handleChoice(choice)}
                                            onMouseEnter={() => setHoveredChoiceId(choice.id)}
                                            onMouseLeave={() => setHoveredChoiceId(null)}
                                            disabled={disabled}
                                             className={`w-full text-left p-4 glass-panel border transition-all duration-300 relative group overflow-hidden
                                                ${disabled 
                                                    ? 'border-gray-800 opacity-50 cursor-not-allowed bg-black/40 text-gray-500' 
                                                    : 'border-cyan-400/30 hover:border-cyan-400 hover:bg-cyan-900/40 text-gray-200 active:scale-95 cursor-pointer'
                                                }`}
                                            style={{ animation: `slide-up 0.5s ease-out ${0.5 + i * 0.1}s both` }}
                                        >
                                            <div className="absolute inset-0 w-full h-full bg-cyan-400/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
                                            <div className="relative z-10 font-mono mb-2 text-cyan-300">{choice.label}</div>
                                            <div className="relative z-10 text-sm text-gray-400 group-hover:text-gray-200">{choice.description}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col h-full justify-center space-y-8 animate-[fade-in_0.5s_ease-out]">
                            <p className="text-gold-trim text-xl font-body leading-relaxed p-6 border border-gold-trim/30 bg-gold-trim/5 shadow-[0_0_30px_rgba(225,193,110,0.1)] whitespace-pre-wrap">
                                {resultText}
                            </p>
                            
                            {pendingOutcome?.type === 'view_relic' && (
                                <div className="mt-6 p-6 border rounded bg-black/60 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col items-center animate-[slide-up_0.5s_ease-out]" style={{ borderColor: `${pendingOutcome.payload.relic.color}50` }}>
                                    <h4 className="absolute -top-3 bg-black px-4 text-xs tracking-widest uppercase font-mono" style={{ color: pendingOutcome.payload.relic.color }}>
                                        RELIC ACQUIRED
                                    </h4>
                                    <div className="w-20 h-20 border-2 rounded-full flex items-center justify-center mb-4 relative" style={{ borderColor: pendingOutcome.payload.relic.color }}>
                                        <div className="absolute inset-0 rounded-full opacity-20 blur-md" style={{ backgroundColor: pendingOutcome.payload.relic.color }}></div>
                                        <span className="text-3xl z-10" style={{ color: pendingOutcome.payload.relic.color }}>♦</span>
                                    </div>
                                    <h3 className="text-2xl font-body text-center" style={{ color: pendingOutcome.payload.relic.color }}>{pendingOutcome.payload.relic.name}</h3>
                                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-4">Tier: {pendingOutcome.payload.relic.tier} | Sector: {pendingOutcome.payload.relic.sector}</span>
                                    <p className="text-center text-sm font-body text-gray-300 leading-relaxed max-w-sm">
                                        {pendingOutcome.payload.relic.effect}
                                    </p>
                                </div>
                            )}

                            {pendingOutcome && (pendingOutcome.type === 'gain_talent' || pendingOutcome.type === 'take_damage') ? (
                                <div className="text-center text-yellow-400 font-mono tracking-widest uppercase animate-pulse mt-4 bg-black/40 p-4 border border-yellow-400/30 rounded">
                                    [ Select a Champion below to receive the anomaly's effect ]
                                </div>
                            ) : (
                                <button 
                                    onClick={handleContinue}
                                    className={`mt-8 px-12 py-4 border tracking-widest font-bold transition-all mx-auto active:scale-95 cursor-pointer
                                        ${pendingOutcome?.type === 'start_combat' 
                                            ? 'border-red-500 text-red-500 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.4)] bg-red-900/20 animate-pulse' 
                                            : 'border-cyan-400 text-cyan-400 hover:bg-cyan-400/20 shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                                        }`}
                                >
                                    {pendingOutcome?.type === 'start_combat' ? 'INITIATE COMBAT' : 'CONTINUE JOURNEY'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Render Party Selection/Status Block */}
            {renderPartyStatus()}

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    50% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                }
                @keyframes fade-in-out {
                    0% { opacity: 0; transform: scale(0.9); }
                    10% { opacity: 1; transform: scale(1.1); }
                    80% { opacity: 1; transform: scale(1.0); }
                    100% { opacity: 0; transform: scale(0.95); }
                }
                @keyframes dash {
                    0% { stroke-dasharray: 100; stroke-dashoffset: 100; }
                    100% { stroke-dasharray: 100; stroke-dashoffset: 0; }
                }
                @keyframes float-up {
                    0% { transform: translateY(0); opacity: 0; }
                    20% { opacity: 1; }
                    100% { transform: translateY(-30px); opacity: 0; }
                }
            `}</style>
        </div>
    );
};
