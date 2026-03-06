import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { ActiveCharacter } from '../../types/character';
import type { Talent } from '../../types/save';
import talentsData from '../../data/talents.json';

const allTalents = talentsData as Talent[];

const generateOptions = (character: ActiveCharacter): Talent[] => {
    // Basic logic for the "3 trees" requirement until formal trees are mapped
    const raceTalents = allTalents.filter(t => t.sector === character.sector);
    const classTalents = allTalents.filter(t => t.sector !== character.sector); // Proxy class pool
    const wildCardTalents = allTalents;

    const pickRandom = (pool: Talent[]) => pool[Math.floor(Math.random() * pool.length)];

    const t1 = pickRandom(raceTalents.length ? raceTalents : allTalents);
    const t2 = pickRandom(classTalents.length ? classTalents : allTalents);
    const t3 = pickRandom(wildCardTalents);

    return [t1, t2, t3];
};

export const LevelUpScreen = () => {
    const { runData, updateRunData, setScene } = useGameStore();
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [options, setOptions] = useState<Talent[]>([]);

    const levelingCharacters = (runData?.activeParty || []).filter(c => (c.pendingLevelUps || 0) > 0);

    useEffect(() => {
        if (levelingCharacters.length > 0 && options.length === 0) {
            setOptions(generateOptions(levelingCharacters[0]));
        }
    }, [levelingCharacters, options.length]);

    if (!runData || levelingCharacters.length === 0) {
        // Fallback or finished
        setTimeout(() => setScene('sector-map'), 100);
        return <div className="text-white text-center w-full h-full pt-32 tracking-widest">RESUMING ASCENT...</div>;
    }

    const currentActor = levelingCharacters[currentCharIndex];

    const handleSelectOption = (talent: Talent) => {
        const newParty = runData.activeParty.map(c => {
            if (c.instanceId === currentActor.instanceId) {
                return {
                    ...c,
                    pendingLevelUps: (c.pendingLevelUps || 1) - 1,
                    talents: [...(c.talents || []), talent]
                };
            }
            return c;
        });

        const activeTalents = [...runData.activeTalents, talent.id];

        updateRunData({ activeParty: newParty, activeTalents });

        // If the same character still has a pending level up, reroll options immediately
        const stillPending = (currentActor.pendingLevelUps || 1) - 1 > 0;
        
        if (stillPending) {
            setOptions(generateOptions(currentActor));
        } else {
            // Move to next character if exists
            const nextIndex = currentCharIndex + 1;
            if (nextIndex < levelingCharacters.length) {
                setCurrentCharIndex(nextIndex);
                setOptions(generateOptions(levelingCharacters[nextIndex]));
            } else {
                setScene('sector-map');
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-8 bg-black/90 z-50 absolute inset-0 backdrop-blur-lg">
            <h1 className="text-5xl text-gold-trim font-mono tracking-widest border-b border-gold-trim pb-4 drop-shadow-[0_0_15px_rgba(225,193,110,0.8)]">
                ASCENSION REACHED
            </h1>

            <div className="flex flex-col items-center mt-6 z-10">
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
                    const treeColors = ["border-cyan-500 text-cyan-400", "border-purple-500 text-purple-400", "border-amber-500 text-amber-400"];
                    const hoverColors = ["hover:bg-cyan-900/40", "hover:bg-purple-900/40", "hover:bg-amber-900/40"];

                    return (
                        <div key={idx} className={`relative flex flex-col p-6 w-1/3 flex-1 glass-panel border ${treeColors[idx]} ${hoverColors[idx]} transition-all cursor-pointer group hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]`}
                            onClick={() => handleSelectOption(talent)}>
                            
                            <div className="absolute top-0 right-0 p-2 opacity-30 text-xs font-mono">- {treeNames[idx]} -</div>
                            
                            <h3 className="text-xl font-bold font-mono uppercase mt-4 mb-2 min-h-[3rem] text-white group-hover:text-gold-trim transition-colors">
                                {talent.name} <span className="text-xs text-gray-500 block">Tier {talent.tier}</span>
                            </h3>
                            <div className="h-px w-full bg-white/20 mb-4"></div>
                            <p className="font-mono text-sm text-gray-300 leading-relaxed min-h-[5rem]">
                                {talent.effect}
                            </p>
                            <div className="mt-auto pt-4 flex justify-between items-end opacity-50">
                                <span className="text-xs font-mono uppercase">Confirm Alignment</span>
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
