import { useGameStore } from '../../store/gameStore';
import { useCombatStore } from '../../store/combatStore';
import { CharacterFactory } from '../../core/CharacterFactory';

export const PostBattleScreen = () => {
    const { setScene, runData, updateRunData } = useGameStore();
    const { allies } = useCombatStore();

    const xpReward = 50; // Simple base reward for now

    const handleContinue = () => {
        if (!runData) {
            setScene('sector-map');
            return;
        }

        let anyLevelUp = false;
        
        // 1. Process XP internally within runData's activeParty using combatStore's alive/dead state
        const updatedParty = runData.activeParty.map(p => {
             const combatMatch = allies.find(a => a.instanceId === p.instanceId);
             if (combatMatch && !combatMatch.isDead) {
                 let currentXp = p.currentXp + xpReward;
                 let level = p.level;
                 let pendingUps = p.pendingLevelUps || 0;
                 let xpNeeded = p.xpToNextLevel;
                 
                 let finalChar = { ...p };

                 while (currentXp >= xpNeeded) {
                     currentXp -= xpNeeded;
                     level += 1;
                     pendingUps += 1;
                     anyLevelUp = true;
                     xpNeeded = CharacterFactory.calculateXpRequired(level);
                     finalChar.level = level; // update for applyLevelUpStats
                     finalChar = CharacterFactory.applyLevelUpStats(finalChar);
                 }
                 
                 return {
                     ...finalChar,
                     currentXp,
                     level,
                     pendingLevelUps: pendingUps,
                     xpToNextLevel: xpNeeded,
                 };
             }
             return p;
        });

        // 2. Map visited nodes
        const newVisited = [...runData.visitedNodes];
        if (runData.currentNodeId && runData.currentNodeId !== 'START') {
            if (!newVisited.includes(runData.currentNodeId)) {
                newVisited.push(runData.currentNodeId);
            }
        }

        updateRunData({ 
            visitedNodes: newVisited,
            activeParty: updatedParty 
        });

        if (anyLevelUp) {
            setScene('level-up');
        } else {
            setScene('sector-map');
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-8 bg-black/80 z-50 absolute inset-0 backdrop-blur-md">
            <h1 className="text-5xl text-gold-trim font-mono tracking-widest border-b border-gold-trim pb-4 drop-shadow-[0_0_15px_rgba(225,193,110,0.8)]">
                COMBAT RESOLVED
            </h1>
            <div className="flex flex-col items-center gap-6 max-w-4xl w-full p-8 glass-panel border border-cyan-400/30">
                <p className="text-cyan-400 font-mono tracking-widest text-lg">PROXIES SECURED. ASSESSING CASUALTIES.</p>
                <div className="grid grid-cols-4 gap-8 w-full mt-4">
                    {allies.map(ally => (
                        <div key={ally.instanceId} className={`p-4 border ${ally.isDead ? 'border-red-500/50 opacity-50 grayscale bg-red-900/20' : 'border-cyan-400/30 bg-cyan-900/20'} flex flex-col items-center gap-4 rounded-lg shadow-inner transition-all hover:-translate-y-1`}>
                            <img src={ally.portraitUrl} className="w-20 h-20 object-cover rounded-full border-2 border-white/20 shadow-md" alt={ally.name} />
                            <span className="text-xs font-mono text-center tracking-widest text-white h-8 flex items-center">{ally.name}</span>
                            {!ally.isDead ? 
                                <span className="text-xs font-bold text-green-400 tracking-wider drop-shadow-md">+50 XP</span> :
                                <span className="text-xs font-bold text-red-500 tracking-wider">MIA</span>
                            }
                        </div>
                    ))}
                </div>
                
                <p className="text-gray-400 font-mono mt-4 tracking-widest">+10 DIVINE SPARKS HARVESTED</p>

                <button 
                    onClick={handleContinue} 
                    className="mt-4 px-12 py-4 border border-cyan-400 bg-cyan-900/40 text-cyan-400 hover:bg-cyan-400 hover:text-black tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                >
                    CONTINUE ASCENT
                </button>
            </div>
        </div>
    );
};
