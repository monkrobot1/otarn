import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getRandomEvent } from '../../data/eventData';
import type { GameEvent } from '../../data/eventData';

export const EventScene = () => {
    const { setScene, runData, updateRunData } = useGameStore();
    const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
    const [resultText, setResultText] = useState<string | null>(null);

    // Initial load, select a random event.
    // In the real game, the node ID might dictate what event fires (so it is consistent if you quit and return)
    useEffect(() => {
        // Just pick a random event on mount
        setCurrentEvent(getRandomEvent());
    }, []);

    if (!currentEvent) return null;

    const handleChoice = (choice: any) => {
        const gameState = {
            runData,
            updateRunData,
            setEventResult: (text: string) => setResultText(text)
        };
        
        choice.onSelect(gameState);
    };

    const handleContinue = () => {
        // Return to sector map
        setScene('sector-map');
    };

    return (
        <div className="w-full h-full flex flex-col pt-8 pb-32 px-16 relative">
            
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
                    <div className="w-48 h-48 border border-white/10 rounded-full flex flex-col justify-center items-center shadow-[0_0_50px_rgba(0,255,255,0.1)] relative">
                       <span className="text-gray-500 font-mono text-xs tracking-widest">[ ASTRAL ANOMALY ]</span>
                       {/* In the future, place generated artwork here */}
                       <svg className="w-full h-full absolute inset-0 opacity-20 pointer-events-none -z-10 animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100">
                           <line x1="10" y1="10" x2="90" y2="90" stroke="white" strokeWidth="1" />
                           <line x1="90" y1="10" x2="10" y2="90" stroke="white" strokeWidth="1" />
                           <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1" />
                       </svg>
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
                            <p className="text-gold-trim text-xl font-body leading-relaxed p-6 border border-gold-trim/30 bg-gold-trim/5 shadow-[0_0_30px_rgba(225,193,110,0.1)]">
                                {resultText}
                            </p>
                            
                            <button 
                                onClick={handleContinue}
                                className="mt-8 px-12 py-4 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/20 tracking-widest font-bold transition-all mx-auto shadow-[0_0_15px_rgba(0,255,255,0.2)] active:scale-95 cursor-pointer"
                            >
                                CONTINUE JOURNEY
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
