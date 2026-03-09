import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { InternalLogger } from '../../store/debugStore';
import type { ActiveCharacter } from '../../types/character';
import type { Talent } from '../../types/save';
import talentsData from '../../data/talents.json';

const allTalents = talentsData as Talent[];

const generateOptions = (character: ActiveCharacter): Talent[] => {
    // Basic logic for the "3 trees" requirement until formal trees are mapped
    const raceTalents = allTalents.filter(t => t.sector === character.sector);
    const classTalents = allTalents.filter(t => t.sector !== character.sector); // Champion class pool
    const wildCardTalents = allTalents;

    const pickRandom = (pool: Talent[]) => pool[Math.floor(Math.random() * pool.length)];

    const t1 = pickRandom(raceTalents.length ? raceTalents : allTalents);
    const t2 = pickRandom(classTalents.length ? classTalents : allTalents);
    const t3 = pickRandom(wildCardTalents);

    return [t1, t2, t3];
};

export const LevelUpScreen = () => {
    const { runData, updateRunData, setScene } = useGameStore();
    const [options, setOptions] = useState<Talent[]>([]);
    const [currentActorId, setCurrentActorId] = useState<string | null>(null);

    const levelingCharacters = (runData?.activeParty || []).filter(c => (c.pendingLevelUps || 0) > 0);

    // Effect to pick the next actor and generate their options
    useEffect(() => {
        if (levelingCharacters.length > 0) {
            const actor = levelingCharacters[0];
            // If we have a new actor or we haven't generated options yet, do it
            if (actor.instanceId !== currentActorId || options.length === 0) {
                InternalLogger.info('state', `Generating level-up options for ${actor.name}`, { pending: actor.pendingLevelUps });
                setCurrentActorId(actor.instanceId);
                setOptions(generateOptions(actor));
            }
        } else if (runData) {
            // No more characters to level up
            InternalLogger.info('state', 'Level-up phase complete. Returning to map.');
            setScene('sector-map');
        }
    }, [levelingCharacters, currentActorId, options.length, setScene, runData]);

    if (!runData || levelingCharacters.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg rounded-xl border border-cyan-500/30 relative">
                <div className="text-white text-center tracking-widest animate-pulse">RESUMING ASCENT...</div>
            </div>
        );
    }

    const currentActor = levelingCharacters[0];

    const handleSelectOption = (talent: Talent) => {
        InternalLogger.info('state', `Talent selected: ${talent.name} for ${currentActor.name}`);
        
        const newParty = runData.activeParty.map(c => {
            if (c.instanceId === currentActor.instanceId) {
                const updated = {
                    ...c,
                    pendingLevelUps: (c.pendingLevelUps || 1) - 1,
                    talents: [...(c.talents || []), talent],
                    level: c.level + 1 // Ensure level display increments
                };
                return updated;
            }
            return c;
        });

        const activeTalents = [...runData.activeTalents, talent.id];

        // Update global state
        updateRunData({ activeParty: newParty, activeTalents });

        // Force a reroll of options for the next level-up (same character or next)
        setOptions([]); 
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 z-50 backdrop-blur-lg rounded-xl border border-gold-trim/30 relative py-8 overflow-y-auto">
            <h1 className="text-5xl text-gold-trim font-mono tracking-widest border-b border-gold-trim pb-4 drop-shadow-[0_0_15px_rgba(225,193,110,0.8)] shrink-0">
                ASCENSION REACHED
            </h1>

            <div className="flex flex-col items-center mt-6 z-10 shrink-0">
                <img src={currentActor.portraitUrl} className="w-32 h-32 object-cover border-4 border-gold-trim/50 shadow-[0_0_20px_rgba(225,193,110,0.5)] rounded-full mb-4" alt={currentActor.name} />
                <h2 className="text-2xl text-white font-mono tracking-widest">{currentActor.name}</h2>
                <div className="text-sm text-cyan-400 font-mono mt-1 tracking-widest uppercase">
                    Level {currentActor.level} <span className="mx-2 text-gray-500">///</span> {currentActor.race} {currentActor.combatRole}
                </div>
            </div>

            <p className="text-gray-400 font-mono tracking-widest text-center max-w-lg mt-4 mb-4">
                CHOOSE A NEW BLESSING TO MANIFEST. CHOOSE WISELY.
            </p>

            <div className="flex gap-8 justify-center w-full max-w-5xl px-8 focus-visible:outline-none">
                {options.map((talent, idx) => {
                    const treeNames = ["RACE INHERITANCE", "CLASS DOCTRINE", "WILD CARD MUTATION"];
                    const treeColors = ["border-cyan-500/50 hover:border-cyan-400", "border-purple-500/50 hover:border-purple-400", "border-amber-500/50 hover:border-amber-400"];
                    const hoverColors = ["hover:bg-cyan-900/40", "hover:bg-purple-900/40", "hover:bg-amber-900/40"];
                    const glowColors = ["hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]", "hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]", "hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"];

                    const rarityColors: Record<string, string> = {
                        Common: "text-gray-400",
                        Uncommon: "text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]",
                        Rare: "text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]",
                        Epic: "text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]",
                        Divine: "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] font-bold tracking-widest"
                    };

                    const categoryIcons: Record<string, string> = {
                        "New Skill": "✨",
                        "Passive Defensive": "🛡️",
                        "Passive Offensive": "⚔️",
                        "Stats Up": "📈",
                        "Wildcard": "🌀",
                        "Unique": "💎"
                    };

                    return (
                        <div key={idx} className={`relative flex flex-col p-6 w-1/3 flex-1 bg-black/60 backdrop-blur-md border ${treeColors[idx]} ${hoverColors[idx]} ${glowColors[idx]} transition-all cursor-pointer group hover:-translate-y-2`}
                            onClick={() => handleSelectOption(talent)}>
                            
                            <div className="absolute top-0 right-0 p-2 opacity-50 text-[10px] font-mono tracking-widest uppercase">
                                /// {treeNames[idx]} ///
                            </div>
                            
                            <div className="mt-6 flex flex-col gap-1">
                                <span className={`text-xs font-mono uppercase tracking-widest ${rarityColors[talent.rarity] || "text-white"}`}>
                                    {talent.rarity}
                                </span>
                                <h3 className="text-xl font-bold font-mono uppercase mb-2 min-h-[3rem] text-white group-hover:text-gold-trim transition-colors flex items-center justify-between">
                                    <span>{talent.name}</span>
                                    <span className="text-2xl ml-2 opacity-80" title={talent.category}>{categoryIcons[talent.category] || "🔹"}</span>
                                </h3>
                            </div>
                            
                            <div className="h-px w-full bg-white/10 mb-4 relative">
                                <div className="absolute left-0 top-0 h-full w-1/3 bg-gold-trim/50 blur-[1px]"></div>
                            </div>
                            <p className="font-mono text-sm text-gray-300 leading-relaxed min-h-[5rem]">
                                {talent.effect}
                            </p>
                            <div className="mt-auto pt-6 flex justify-between items-end opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">
                                    [ CLICK TO INITIATE ]
                                </span>
                                <span className="text-[10px] font-mono text-cyan-400 border border-cyan-400/30 px-2 py-1 bg-cyan-900/20">
                                    {talent.category.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="text-xs font-mono tracking-widest text-gray-500 absolute bottom-8 left-8">
                {currentActor.pendingLevelUps && currentActor.pendingLevelUps > 1 ? `Multiple Level Ups Pending: ${currentActor.pendingLevelUps}` : '1 Level Up Pending'}
            </div>
        </div>
    );
};
