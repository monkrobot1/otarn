import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useCombatStore } from '../../store/combatStore';
import { CharacterFactory } from '../../core/CharacterFactory';
import type { ActiveCharacter } from '../../types/character';

export const PostBattleScreen = ({ encounterType = 'combat' }: { encounterType?: 'combat' | 'elite' | 'boss' }) => {
    const { setScene, runData, updateRunData, awardAxiomPoints, awardSparks } = useGameStore();
    const { allies } = useCombatStore();

    const [step, setStep] = useState<'resolution' | 'decision' | 'outcome' | 'retire'>('resolution');
    const [resultText, setResultText] = useState<string>('');
    const [anyLevelUp, setAnyLevelUp] = useState(false);
    
    // We compute the raw basic XP payload when mounting the component. 
    // We don't save it to the runStore yet, we just hold it in state.
    const [pendingParty, setPendingParty] = useState<ActiveCharacter[]>([]);
    
    useEffect(() => {
        if (!runData) return;
        const avgLevel = runData.activeParty.reduce((sum, p) => sum + p.level, 0) / (runData.activeParty.length || 1);
        const baseXP = CharacterFactory.calculateXpRequired(Math.floor(avgLevel));
        const xpReward = encounterType === 'boss' ? Math.floor(baseXP * 2.0) : encounterType === 'elite' ? Math.floor(baseXP * 1.5) : baseXP; 
        let leveledUp = false;
        
        const updatedParty = runData.activeParty.map(p => {
             const combatMatch = allies.find(a => a.instanceId === p.instanceId);
             if (combatMatch && !combatMatch.isDead) {
                 let currentXp = p.currentXp + xpReward;
                 let level = p.level;
                 let pendingUps = p.pendingLevelUps || 0;
                 let xpNeeded = p.xpToNextLevel;
                 
                 const maxMp = p.stats.base ? 5 + (p.stats.base.capacity * 10) : 100;
                 const mpRegen = Math.floor(maxMp * 0.5); // Replenish half MP based on max capacity config at the end of each battle
                 let finalChar = { ...p, currentHp: combatMatch.currentHp, currentMp: Math.min(maxMp, combatMatch.currentMp + mpRegen) }; // Carry over HP/MP from combat, restoring some MP

                 while (currentXp >= xpNeeded) {
                     currentXp -= xpNeeded;
                     level += 1;
                     pendingUps += 1;
                     leveledUp = true;
                     xpNeeded = CharacterFactory.calculateXpRequired(level);
                     finalChar.level = level; 
                     finalChar = CharacterFactory.applyLevelUpStats(finalChar);
                 }
                 
                 return {
                     ...finalChar,
                     currentXp,
                     level,
                     pendingLevelUps: pendingUps,
                     xpToNextLevel: xpNeeded,
                 };
             } else if (combatMatch && combatMatch.isDead) {
                 return { ...p, currentHp: 0, currentMp: 0, isDead: true };
             }
             return p;
        });

        setPendingParty(updatedParty);
        setAnyLevelUp(leveledUp);
    }, [runData, allies]);

    const handleAxiomChoice = (axiom: 'Judgment' | 'Order' | 'Chaos' | 'Love') => {
        let text = '';
        let modifiedParty = [...pendingParty];
        let faithGained = 0;

        // Apply 5 Axiom points globally
        awardAxiomPoints(axiom, 5);

        if (axiom === 'Judgment') {
            text = "The weak are scoured. The strong are elevated. \n\n[ +5 Judgment ]\n[ The Champion with the lowest HP suffers 10 Damage. The Champion with the highest HP gains 50 additional XP. ]";
            
            const alive = modifiedParty.filter(p => !p.isDead);
            if (alive.length > 0) {
                const sortedByHp = [...alive].sort((a, b) => a.currentHp - b.currentHp);
                const lowest = sortedByHp[0];
                const highest = sortedByHp[sortedByHp.length - 1];

                modifiedParty = modifiedParty.map(p => {
                    if (p.instanceId === lowest.instanceId) {
                        return { ...p, currentHp: Math.max(1, p.currentHp - 10) };
                    }
                    if (p.instanceId === highest.instanceId && p.instanceId !== lowest.instanceId) { // Just in case 1 alive
                        // Add XP logic
                        let newXp = p.currentXp + 50;
                        let newLvl = p.level;
                        let newPend = p.pendingLevelUps || 0;
                        const finalC = { ...p };
                        if (newXp >= p.xpToNextLevel) {
                            newXp -= p.xpToNextLevel;
                            newLvl++;
                            newPend++;
                            setAnyLevelUp(true);
                        }
                        return { ...finalC, currentXp: newXp, level: newLvl, pendingLevelUps: newPend };
                    }
                    return p;
                });
            }

        } else if (axiom === 'Order') {
            text = "Structure is enforced upon the chaotic residue. \n\n[ +5 Order ]\n[ All surviving Champions restore 15% Maximum HP. ]";
            modifiedParty = modifiedParty.map(p => {
                if (!p.isDead) {
                    const maxHp = p.stats.base.capacity ? 10 + (p.stats.base.capacity * 5) + (p.level * p.stats.base.capacity * 1) : 100;
                    return { ...p, currentHp: Math.min(maxHp, p.currentHp + Math.floor(maxHp * 0.15)) };
                }
                return p;
            });
        } else if (axiom === 'Chaos') {
            faithGained = Math.floor(Math.random() * 30) + 10;
            text = "The maelstrom consumes, leaving unpredictable bounties. \n\n[ +5 Chaos ]\n[ All Champions randomize their current Aether. Gained " + faithGained + " Ephemeral Faith. ]";
            modifiedParty = modifiedParty.map(p => {
                if (!p.isDead) {
                    const maxMp = 5 + (p.stats.base.capacity * 10);
                    return { ...p, currentMp: Math.floor(Math.random() * maxMp) };
                }
                return p;
            });
        } else if (axiom === 'Love') {
            text = "The echoes whisper of second chances and nurturing warmth. \n\n[ +5 Love ]\n[ Revive MIA Champions at 20% HP. If none are missing, grant a massive heal to all. ]";
            let revivedAnyone = false;
            modifiedParty = modifiedParty.map(p => {
                if (p.isDead) {
                    revivedAnyone = true;
                    const maxHp = p.stats.base.capacity ? 10 + (p.stats.base.capacity * 5) + (p.level * p.stats.base.capacity * 1) : 100;
                    return { ...p, isDead: false, currentHp: Math.floor(maxHp * 0.2), currentMp: 0 };
                }
                return p;
            });

            if (!revivedAnyone) {
                modifiedParty = modifiedParty.map(p => {
                    const maxHp = p.stats.base.capacity ? 10 + (p.stats.base.capacity * 5) + (p.level * p.stats.base.capacity * 1) : 100;
                    return { ...p, currentHp: Math.min(maxHp, p.currentHp + Math.floor(maxHp * 0.4)) };
                });
                text += "\n[ No casualties found. Massive healing applied! ]";
            }
        }

        setPendingParty(modifiedParty);
        setResultText(text);
        if (faithGained > 0 && runData) {
            updateRunData({ ephemeralFaith: runData.ephemeralFaith + faithGained });
        }
        setStep('outcome');
    };

    const handleFinalContinue = () => {
        if (!runData) {
            setScene('sector-map');
            return;
        }

        // Map visited nodes
        const newVisited = [...runData.visitedNodes];
        if (runData.currentNodeId && runData.currentNodeId !== 'START') {
            if (!newVisited.includes(runData.currentNodeId)) {
                newVisited.push(runData.currentNodeId);
            }
        }

        updateRunData({ 
            visitedNodes: newVisited,
            activeParty: pendingParty 
        });

        awardSparks(10); // Reward the combat sparks

        if (anyLevelUp) {
            setScene('level-up');
        } else {
            if (encounterType === 'boss') {
                setStep('retire');
            } else {
                setScene('sector-map');
            }
        }
    };

    if (step === 'decision') {
        return (
            <div className="w-full h-full flex flex-col pt-8 pb-32 px-16 relative overflow-y-auto">
                <header className="w-full flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-light tracking-widest text-cyan-400 border-b border-cyan-400/50 pb-2 drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
                        AXIOM COMMENDATION
                    </h1>
                    <div className="glass-panel px-4 py-2 text-sm text-cyan-300 font-mono tracking-widest">
                        FAITH: {runData?.ephemeralFaith || 0}
                    </div>
                </header>

                <div className="flex flex-1 gap-12 max-w-5xl w-full mx-auto">
                    <div className="flex-1 border border-cyan-400/30 glass-panel bg-black/50 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                        <div className="absolute inset-0 bg-gold-trim/5 mix-blend-overlay" />
                        <div className="w-64 h-64 border border-white/20 rounded flex flex-col justify-center items-center shadow-[0_0_50px_rgba(0,255,255,0.1)] relative overflow-hidden backdrop-blur-sm z-10 bg-black/40">
                            <span className="absolute top-2 left-2 text-cyan-300/80 font-mono text-[10px] tracking-widest">[ LATENT DATA ]</span>
                            <svg className="w-full h-full absolute inset-0 opacity-40 pointer-events-none -z-10 animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="30" fill="none" stroke="cyan" strokeWidth="0.5" strokeDasharray="5,5" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
                                <polygon points="50,15 85,75 15,75" fill="none" stroke="cyan" strokeWidth="0.5" className="animate-pulse" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="mb-8 space-y-4">
                            <p className="text-gray-300 font-body leading-relaxed text-lg tracking-wide border-l-2 border-cyan-400/50 pl-4 py-1">
                                The spiritual resonance of the fallen enemies lingers in the void. As the Architect, you must dictate how this energy is aligned.
                            </p>
                            <p className="text-gray-300 font-body leading-relaxed text-lg tracking-wide border-l-2 border-cyan-400/50 pl-4 py-1">
                                Which Axiom shall claim this offering?
                            </p>
                        </div>

                        <div className="space-y-4 mt-8">
                            <button onClick={() => handleAxiomChoice('Order')} className="w-full text-left p-4 glass-panel border border-cyan-400/30 hover:border-cyan-400 hover:bg-cyan-900/40 text-gray-200 transition-all active:scale-95 group relative overflow-hidden">
                                <div className="absolute inset-0 w-full h-full bg-cyan-400/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
                                <div className="relative z-10 font-mono mb-2 text-cyan-300">Enforce the Structure (Order)</div>
                                <div className="relative z-10 text-sm text-gray-400">Harmonize the data. (+5 Order. Grants 15% Max HP flat restoration.)</div>
                            </button>
                            <button onClick={() => handleAxiomChoice('Judgment')} className="w-full text-left p-4 glass-panel border border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-900/40 text-gray-200 transition-all active:scale-95 group relative overflow-hidden">
                                <div className="absolute inset-0 w-full h-full bg-yellow-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
                                <div className="relative z-10 font-mono mb-2 text-yellow-500">Extract the Useful (Judgment)</div>
                                <div className="relative z-10 text-sm text-gray-400">Scourge the weak. (+5 Judgment. Massive XP to highest HP Champion, damages the lowest HP Champion.)</div>
                            </button>
                            <button onClick={() => handleAxiomChoice('Chaos')} className="w-full text-left p-4 glass-panel border border-purple-500/30 hover:border-purple-500 hover:bg-purple-900/40 text-gray-200 transition-all active:scale-95 group relative overflow-hidden">
                                <div className="absolute inset-0 w-full h-full bg-purple-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
                                <div className="relative z-10 font-mono mb-2 text-purple-400">Sow the Maelstrom (Chaos)</div>
                                <div className="relative z-10 text-sm text-gray-400">Unpredictable variance. (+5 Chaos. Completely randomizes Aether levels across the party. Grants bonus Faith.)</div>
                            </button>
                            <button onClick={() => handleAxiomChoice('Love')} className="w-full text-left p-4 glass-panel border border-pink-500/30 hover:border-pink-500 hover:bg-pink-900/40 text-gray-200 transition-all active:scale-95 group relative overflow-hidden">
                                <div className="absolute inset-0 w-full h-full bg-pink-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
                                <div className="relative z-10 font-mono mb-2 text-pink-400">Embrace the Echoes (Love)</div>
                                <div className="relative z-10 text-sm text-gray-400">Nurture the remnants. (+5 Love. Revives MIA Champions, or grants massive healing if no casualties.)</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'outcome') {
        return (
            <div className="w-full h-full flex flex-col pt-8 pb-32 px-16 relative overflow-y-auto">
                <header className="w-full flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-light tracking-widest text-gold-trim border-b border-gold-trim/50 pb-2 drop-shadow-[0_0_15px_rgba(225,193,110,0.8)]">
                        AXIOM RESOLVED
                    </h1>
                </header>
                <div className="flex flex-col h-full justify-center items-center space-y-8 animate-[fade-in_0.5s_ease-out] max-w-3xl mx-auto">
                    <p className="text-gold-trim text-xl font-body leading-relaxed p-6 border border-gold-trim/30 bg-gold-trim/5 shadow-[0_0_30px_rgba(225,193,110,0.1)] whitespace-pre-wrap text-center">
                        {resultText}
                    </p>
                    <button 
                        onClick={handleFinalContinue}
                        className="mt-8 px-12 py-4 border tracking-widest font-bold transition-all mx-auto active:scale-95 cursor-pointer border-cyan-400 text-cyan-400 hover:bg-cyan-400/20 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                    >
                        CONTINUE ASCENT
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'retire') {
        return (
            <div className="w-full h-full flex flex-col pt-8 pb-32 px-16 relative overflow-y-auto">
                <header className="w-full flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-light tracking-widest text-cyan-400 border-b border-cyan-400/50 pb-2 drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
                        SECTOR CLEARED
                    </h1>
                </header>
                <div className="flex flex-col h-full justify-center items-center space-y-8 animate-[fade-in_0.5s_ease-out] max-w-3xl mx-auto">
                    <p className="text-gray-300 text-xl font-body leading-relaxed p-6 border border-cyan-400/30 bg-black/60 shadow-[0_0_30px_rgba(0,255,255,0.1)] text-center">
                        The sovereign of this sector has fallen. Your run is secure. You may choose to retire now, banking all your gathered Faith and Axiom power to your global reserves, or risk it all and push deeper into the next sector.
                    </p>
                    <div className="flex gap-8">
                        <button 
                            onClick={() => {
                                const gameStore = useGameStore.getState();
                                gameStore.endRun(true);
                            }}
                            className="mt-8 px-12 py-4 border tracking-widest font-bold transition-all mx-auto active:scale-95 cursor-pointer border-yellow-400 text-yellow-400 hover:bg-yellow-400/20 shadow-[0_0_15px_rgba(255,255,0,0.2)]"
                        >
                            RETIRE IN GLORY
                        </button>
                        <button 
                            onClick={() => {
                                const gameStore = useGameStore.getState();
                                if (gameStore.runData) {
                                    gameStore.updateRunData({
                                        currentSectorLevel: (gameStore.runData.currentSectorLevel || 1) + 1,
                                        currentNodeId: 'START'
                                    });
                                }
                                setScene('sector-map');
                            }}
                            className="mt-8 px-12 py-4 border tracking-widest font-bold transition-all mx-auto active:scale-95 cursor-pointer border-red-500 text-red-500 hover:bg-red-500/20 shadow-[0_0_15px_rgba(255,0,0,0.2)]"
                        >
                            DESCEND DEEPER
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step === 'resolution'
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-8 bg-black/80 backdrop-blur-md rounded-xl border border-gold-trim/30 relative overflow-y-auto py-8">
            <h1 className="text-5xl text-gold-trim font-mono tracking-widest border-b border-gold-trim pb-4 drop-shadow-[0_0_15px_rgba(225,193,110,0.8)] shrink-0">
                COMBAT RESOLVED
            </h1>
            <div className="flex flex-col items-center gap-6 max-w-4xl w-full p-8 glass-panel border border-cyan-400/30">
                <p className="text-cyan-400 font-mono tracking-widest text-lg">CHAMPIONS SECURED. ASSESSING CASUALTIES.</p>
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
                    onClick={() => setStep('decision')}
                    className="mt-4 px-12 py-4 border border-cyan-400 bg-cyan-900/40 text-cyan-400 hover:bg-cyan-400 hover:text-black tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                >
                    CLAIM AXIOM REWARD
                </button>
            </div>
        </div>
    );
};
