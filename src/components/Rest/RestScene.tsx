import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CharacterFactory } from '../../core/CharacterFactory';

export const RestScene = () => {
    const { setScene, runData, updateRunData } = useGameStore();
    const [actionTaken, setActionTaken] = useState<string | null>(null);

    const handleHeal = () => {
        if (!runData?.activeParty) return;
        
        const party = runData.activeParty;
        // Heal 30% of max HP
        const healedParty = party.map(p => {
            const maxHp = CharacterFactory.calculateMaxHp(p.stats.base, p.level);
            const healAmount = Math.floor(maxHp * 0.3);
            return {
                ...p,
                currentHp: Math.min(maxHp, p.currentHp + healAmount)
            };
        });
        
        updateRunData({ activeParty: healedParty });
        setActionTaken('You rest at the sanctuary. The party recovers 30% HP.');
    };

    const handleMeditate = () => {
        // Gain 50 Ephemeral Faith
        updateRunData({ ephemeralFaith: (runData?.ephemeralFaith || 0) + 50 });
        setActionTaken('You meditate in the silence of the void. Gained 50 Ephemeral Faith.');
    };

    const handleContinue = () => {
        setScene('sector-map');
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-16 relative bg-black/60 backdrop-blur-sm">
            
            <header className="absolute top-12 w-full flex justify-center">
                <h1 className="text-4xl font-light tracking-widest text-green-400 border-b border-green-400/50 pb-2 drop-shadow-[0_0_15px_rgba(0,255,100,0.4)]">
                    ASTRAL SANCTUARY
                </h1>
            </header>

            {!actionTaken ? (
                <div className="flex flex-col items-center gap-12 mt-16 animate-[fade-in_0.5s_ease-out]">
                    <p className="text-gray-300 font-mono tracking-widest text-center max-w-2xl text-lg relative">
                        <span className="absolute -left-8 text-green-400">"</span>
                        A pocket of calm in the chaotic astral storm. Choose how to spend your respite.
                        <span className="absolute -right-8 text-green-400">"</span>
                    </p>

                    <div className="flex gap-8 mt-8">
                        {/* Heal Option */}
                        <button 
                            onClick={handleHeal}
                            className="flex flex-col items-center gap-4 p-8 glass-panel border border-green-400/30 hover:border-green-400 transition-all hover:-translate-y-2 active:scale-95 cursor-pointer group w-64 bg-green-900/10"
                        >
                            <div className="w-16 h-16 rounded-full border border-green-400/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,255,100,0.2)]">
                                <span className="text-2xl text-green-400">+</span>
                            </div>
                            <h3 className="text-xl text-green-400 tracking-widest font-bold">RESTORE</h3>
                            <p className="text-sm text-gray-400 text-center font-mono">Heal entire party for 30% Max HP.</p>
                        </button>

                        {/* Meditate Option */}
                        <button 
                            onClick={handleMeditate}
                            className="flex flex-col items-center gap-4 p-8 glass-panel border border-cyan-400/30 hover:border-cyan-400 transition-all hover:-translate-y-2 active:scale-95 cursor-pointer group w-64 bg-cyan-900/10"
                        >
                            <div className="w-16 h-16 rounded-full border border-cyan-400/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                                <span className="text-2xl text-cyan-400">★</span>
                            </div>
                            <h3 className="text-xl text-cyan-400 tracking-widest font-bold">MEDITATE</h3>
                            <p className="text-sm text-gray-400 text-center font-mono">Channel the astral energy to gain 50 Faith.</p>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center space-y-12 animate-[fade-in_0.5s_ease-out]">
                    <p className="text-green-400 text-2xl font-body leading-relaxed p-8 border border-green-400/30 bg-green-400/10 shadow-[0_0_30px_rgba(0,255,100,0.1)] text-center">
                        {actionTaken}
                    </p>
                    
                    <button 
                        onClick={handleContinue}
                        className="px-12 py-4 border border-gold-trim text-gold-trim hover:bg-gold-trim/20 tracking-widest font-bold transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(225,193,110,0.2)]"
                    >
                        DEPART
                    </button>
                </div>
            )}
            
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
