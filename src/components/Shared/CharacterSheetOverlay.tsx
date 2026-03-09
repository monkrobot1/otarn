import React from 'react';
import type { ActiveCharacter } from '../../types/character';
import { CharacterFactory } from '../../core/CharacterFactory';
import { PortraitSprite } from '../UI/PortraitSprite';

interface CharacterSheetOverlayProps {
    unit: ActiveCharacter | null;
    onClose: () => void;
}

export const CharacterSheetOverlay: React.FC<CharacterSheetOverlayProps> = ({ unit, onClose }) => {
    if (!unit) return null;

    const maxHp = CharacterFactory.calculateMaxHp(unit.stats.base, unit.level);

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-4xl bg-[#0a0d14] border border-cyan-500/50 shadow-[0_0_30px_rgba(0,255,255,0.1)] rounded-lg p-8 flex flex-col md:flex-row gap-8 overflow-y-auto max-h-full"
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-cyan-500 hover:text-white font-mono text-xl z-10"
                >
                    [X]
                </button>

                {/* Left Column: Art & Vitals */}
                <div className="flex flex-col items-center w-full md:w-1/3 border-r border-cyan-500/20 pr-8">
                    <div className="relative w-48 h-48 rounded-full border-2 border-cyan-400/50 overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                        <PortraitSprite 
                            baseId={unit.baseId} 
                            className="w-full h-full scale-[1.1] origin-center"
                        />
                    </div>
                    
                    <h2 className="mt-6 text-2xl font-mono text-white tracking-widest text-center uppercase">
                        {unit.name}
                    </h2>
                    
                    <div className="text-cyan-400 font-mono text-sm tracking-widest uppercase mt-2 text-center">
                        LVL {unit.level} <span className="text-gray-600">//</span> {unit.race} <span className="text-gray-600">//</span> {unit.combatRole}
                    </div>

                    <div className="w-full mt-8 flex flex-col gap-4 font-mono text-sm tracking-widest">
                        <div>
                            <div className="flex justify-between text-gray-400 mb-1">
                                <span>HP</span>
                                <span>{unit.currentHp} / {maxHp}</span>
                            </div>
                            <div className="h-2 w-full bg-black/80 border border-white/10">
                                <div 
                                    className="h-full bg-green-500" 
                                    style={{ width: `${Math.max(0, Math.min(100, (unit.currentHp/maxHp)*100))}%` }} 
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-gray-400 mb-1">
                                <span>MP</span>
                                <span>{unit.currentMp} / {unit.stats.base.capacity * 10 + 5}</span>
                            </div>
                            <div className="h-2 w-full bg-black/80 border border-white/10">
                                <div 
                                    className="h-full bg-blue-500" 
                                    style={{ width: `${Math.max(0, Math.min(100, (unit.currentMp/(unit.stats.base.capacity * 10 + 5))*100))}%` }} 
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-gray-400 mb-1">
                                <span>XP</span>
                                <span>{unit.currentXp} / {unit.xpToNextLevel}</span>
                            </div>
                            <div className="h-1 w-full bg-black/80 border border-white/10">
                                <div 
                                    className="h-full bg-yellow-500" 
                                    style={{ width: `${Math.max(0, Math.min(100, (unit.currentXp/unit.xpToNextLevel)*100))}%` }} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Talents */}
                <div className="flex flex-col w-full md:w-2/3">
                    <h3 className="text-lg text-gold-trim font-mono tracking-widest border-b border-gold-trim/30 pb-2 mb-4">
                        CORE MATRICES
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 font-mono text-sm mb-8">
                        {Object.entries(unit.stats.current).map(([stat, val]) => {
                            const baseVal = unit.stats.base[stat as keyof typeof unit.stats.base] || 0;
                            const isBuffed = val > baseVal;
                            const isDebuffed = val < baseVal;
                            
                            return (
                                <div key={stat} className="flex justify-between items-center bg-white/5 px-4 py-2 border border-white/5">
                                    <span className="text-gray-400 uppercase tracking-wider">{stat}</span>
                                    <span className={`font-bold ${isBuffed ? 'text-green-400' : isDebuffed ? 'text-red-400' : 'text-white'}`}>
                                        {val} {isBuffed && <span className="text-xs ml-1">(+{val - baseVal})</span>}
                                        {isDebuffed && <span className="text-xs ml-1">({val - baseVal})</span>}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <h3 className="text-lg text-gold-trim font-mono tracking-widest border-b border-gold-trim/30 pb-2 mb-4">
                        ACTIVE BLESSINGS
                    </h3>

                    <div className="flex flex-col gap-3 font-mono text-xs overflow-y-auto pr-2" style={{ maxHeight: '200px' }}>
                        {!unit.talents || unit.talents.length === 0 ? (
                            <div className="text-gray-500 italic">No blessings manifested yet.</div>
                        ) : (
                            unit.talents.map((talent, idx) => (
                                <div key={`${talent.id}-${idx}`} className="bg-white/5 border border-cyan-500/20 p-3 shadow-inner group hover:border-cyan-500/50 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-cyan-400 font-bold uppercase tracking-widest">{talent.name}</span>
                                        <span className="text-gray-500">TIER {talent.tier} // {talent.sector}</span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">
                                        {talent.effect}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    <h3 className="text-lg text-gold-trim font-mono tracking-widest border-b border-gold-trim/30 pb-2 mb-4 mt-8">
                        ABILITIES
                    </h3>

                    <div className="flex flex-col gap-3 font-mono text-xs overflow-y-auto pr-2" style={{ maxHeight: '200px' }}>
                        {unit.abilities.map((ability, idx) => (
                            <div key={`${ability.id}-${idx}`} className="bg-white/5 border border-white/10 p-3 shadow-inner flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-bold uppercase tracking-widest">{ability.name}</span>
                                    <span className="text-gray-500">MP: {ability.costMP} // TU: {ability.costTU}</span>
                                </div>
                                <p className="text-gray-400 break-words line-clamp-2">
                                    {ability.description}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};
