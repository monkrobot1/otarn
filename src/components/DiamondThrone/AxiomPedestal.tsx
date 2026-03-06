import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { AXIOM_TREES } from '../../data/axiomData';

type AxiomType = 'Order' | 'Chaos' | 'Judgment' | 'Love';

export const AxiomPedestal = () => {
    const { globalData, unlockAxiomNode } = useGameStore();
    const [selectedAxiom, setSelectedAxiom] = useState<AxiomType>('Order');

    const getPointsSpent = (axiom: AxiomType) => {
        let spent = 0;
        const tree = AXIOM_TREES[axiom];
        Object.entries(globalData.unlockedAxiomNodes).forEach(([nodeId, level]) => {
            if (nodeId.startsWith(`AXIOM_${axiom.toUpperCase()}_`)) {
                for (const tier of tree) {
                    const node = tier.find(n => n.id === nodeId);
                    if (node) {
                        spent += node.cost * level; // Sum up all levels spent
                        break;
                    }
                }
            }
        });
        return spent;
    };

    const handleUnlock = (nodeId: string, cost: number, _tier: number, reqPoints: number, maxLevel: number) => {
        const pointsSpent = getPointsSpent(selectedAxiom);
        const currentLevel = globalData.unlockedAxiomNodes[nodeId] || 0;

        if (pointsSpent < reqPoints) {
            alert(`You must spend ${reqPoints} ${selectedAxiom} Points first to unlock this tier.`);
            return;
        }

        if (currentLevel >= maxLevel) {
            alert('This talent is already at maximum level.');
            return;
        }

        if (globalData.axiomPoints[selectedAxiom] < cost) {
            alert(`Not enough ${selectedAxiom} Points.`);
            return;
        }

        unlockAxiomNode(nodeId, cost, selectedAxiom);
    };

    const KEYWORDS = ['Capacity', 'Physicality', 'Authority', 'Grace', 'Speed', 'Shielding', 'Burn', 'Vulnerability', 'Regen', 'HP', 'MP', 'Exalted', 'Core', 'Drop Pool'];

    const formatDescription = (desc: string) => {
        const words = desc.split(' ');
        return words.map((word, i) => {
            const cleanWord = word.replace(/[.,]/g, '');
            if (KEYWORDS.includes(cleanWord)) {
                return (
                    <span 
                        key={i} 
                        className="font-bold text-white relative group cursor-help underline decoration-white/30 decoration-dotted underline-offset-2"
                        title={`Keyword: ${cleanWord}`}
                    >
                        {word}{' '}
                    </span>
                );
            }
            return word + ' ';
        });
    };

    const renderTree = () => {
        const tree = AXIOM_TREES[selectedAxiom];
        const pointsSpent = getPointsSpent(selectedAxiom);

        return (
            <div className="flex gap-4 w-full h-full items-start overflow-x-auto pb-6 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {tree.map((tierOptions, tierIndex) => {
                    const isTierAvailable = pointsSpent >= tierOptions[0].reqPoints;
                    
                    return (
                        <div key={tierIndex} className={`flex flex-col gap-2 h-full transition-all shrink-0 w-[260px] ${!isTierAvailable ? 'opacity-40 grayscale-[80%]' : ''}`}>
                            <div className="text-gray-500 font-mono text-[10px] tracking-widest border-b border-white/20 w-full text-center pb-1 uppercase shrink-0">
                                <div>TIER {tierIndex + 1}</div>
                                {!isTierAvailable && (
                                    <div className="text-[8px] text-red-500/80 mt-0.5" title="Points required to be spent in this tree before unlocking this tier">
                                        REQ: {tierOptions[0].reqPoints} PT
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 h-full">
                                {tierOptions.map((opt) => {
                                    const currentLevel = globalData.unlockedAxiomNodes[opt.id] || 0;
                                    const isUnlocked = currentLevel > 0;
                                    const isMaxLevel = currentLevel >= opt.maxLevel;
                                    const canAfford = globalData.axiomPoints[selectedAxiom] >= opt.cost;
                                    const isGodAbility = opt.effectType === 'unlock_god_ability';
                                    
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleUnlock(opt.id, opt.cost, opt.tier, opt.reqPoints, opt.maxLevel)}
                                            disabled={!isTierAvailable || isMaxLevel || (!isMaxLevel && !canAfford)}
                                            className={`w-full p-2 border text-left flex flex-col gap-1 transition-all group overflow-hidden relative min-h-[125px] ${
                                                !isTierAvailable
                                                    ? 'border-white/5 bg-black/80 cursor-not-allowed opacity-40'
                                                    : isMaxLevel
                                                        ? 'border-gold-trim bg-gold-trim/20 shadow-[0_0_15px_rgba(212,175,55,0.2)] pb-4'
                                                    : isUnlocked 
                                                        ? 'border-gold-trim/60 bg-gold-trim/5 hover:bg-gold-trim/10' 
                                                        : isGodAbility
                                                            ? 'border-cyan-500/50 bg-cyan-500/10 hover:border-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                                                            : canAfford
                                                                ? 'border-white/20 hover:border-gold-trim/60 hover:bg-white/5 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg'
                                                                : 'border-white/5 bg-black/50 opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        {isUnlocked && <div className="absolute inset-0 bg-gold-trim/5 z-0 animate-pulse pointer-events-none" />}
                                        {isGodAbility && !isUnlocked && <div className="absolute inset-0 bg-cyan-500/5 z-0 pointer-events-none" />}
                                            <div className="flex gap-2 items-start z-10 w-full mb-1">
                                                <div className={`w-8 h-8 shrink-0 rounded border flex items-center justify-center overflow-hidden bg-black/40 ${isUnlocked ? 'border-gold-trim/50 shadow-[0_0_5px_rgba(212,175,55,0.3)]' : 'border-white/10'}`}>
                                                    <img 
                                                        src={`/assets/icons/${opt.icon}`} 
                                                        alt="" 
                                                        className={`w-full h-full object-cover transition-transform duration-500 ${isMaxLevel ? 'scale-110' : 'group-hover:scale-110'}`}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/assets/icons/icon_axiom_order.png';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col flex-1 truncate">
                                                    <span className={`text-[10px] tracking-widest font-mono font-bold truncate ${isUnlocked ? 'text-gold-trim drop-shadow-md' : 'text-gray-200'}`} title={opt.name.toUpperCase()}>
                                                        {opt.name.toUpperCase()}
                                                    </span>
                                                    <span className={`text-[9px] font-mono ${isMaxLevel ? 'text-gold-trim' : isUnlocked ? 'text-white/80' : 'text-gray-500'}`}>
                                                        RANK {currentLevel} / {opt.maxLevel}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center w-full z-10">
                                                {opt.effectType && (
                                                    <span className={`text-[7px] uppercase font-mono tracking-widest px-1 py-0.5 rounded truncate max-w-[60%] ${isGodAbility ? 'text-cyan-400 bg-cyan-400/20' : 'text-white/50 bg-white/10'}`}>
                                                        {opt.effectType.replace('_', ' ')}
                                                    </span>
                                                )}
                                                <span className={`text-[9px] font-mono font-bold shrink-0 ${isMaxLevel ? 'text-gold-trim' : canAfford ? 'text-cyan-400' : 'text-gray-600'}`}>
                                                    {isMaxLevel ? 'MAXED' : `${opt.cost} PT`}
                                                </span>
                                            </div>
                                            <div className="text-[8px] text-gray-400 z-10 mt-1 leading-tight line-clamp-3">
                                                {formatDescription(opt.description)}
                                                {isUnlocked && !isMaxLevel && (
                                                    <span className="text-green-400 block mt-1 font-bold animate-pulse">
                                                        NEXT RANK: Increase Potency
                                                    </span>
                                                )}
                                            </div>
                                    </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full h-full flex items-stretch gap-6 overflow-hidden px-4 pb-4">
            {/* Left Side: Axiom Selectors */}
            <div className="w-[300px] h-full flex flex-col items-center gap-8 pt-2 shrink-0 border-r border-white/10 pr-6 pb-6 overflow-y-auto scrollbar-hide">
                <div className="flex flex-col items-center gap-3 w-full">
                    <h2 className="text-3xl font-light tracking-widest text-gold-trim text-center border-b border-gold-trim/30 pb-4 w-full">
                        AXIOM PEDESTAL
                    </h2>
                    <p className="text-gray-400 italic text-xs text-center leading-relaxed px-2">
                        Offer the latent resonance gathered from your ascensions. Invest deeply into your chosen aspects to unlock higher tiers of power.
                    </p>
                </div>

                <div className="flex flex-col gap-4 justify-center items-center w-full">
                    {(['Order', 'Chaos', 'Judgment', 'Love'] as AxiomType[]).map(axiom => (
                        <button 
                            key={axiom}
                            onClick={() => setSelectedAxiom(axiom)}
                            className={`flex items-center justify-start gap-4 transition-all hover:scale-105 active:scale-95 group w-full p-3 rounded-xl relative ${
                                selectedAxiom === axiom 
                                    ? 'opacity-100 scale-105 bg-white/5 border border-white/20 shadow-xl' 
                                    : 'opacity-50 grayscale hover:opacity-80 hover:grayscale-[50%] border border-transparent'
                            }`}
                        >
                            <img 
                                src={`/assets/icons/icon_axiom_${axiom.toLowerCase()}.png`} 
                                alt={axiom} 
                                className={`w-16 h-16 object-contain rounded-xl border-2 transition-colors ${
                                    selectedAxiom === axiom ? 'border-gold-trim' : 'border-white/10 group-hover:border-white/30'
                                }`} 
                            />
                            <div className="flex flex-col items-start gap-1">
                                <span className={`tracking-widest font-mono text-xl ${
                                    selectedAxiom === axiom ? 'text-white' : 'text-gray-400'
                                }`}>
                                    {axiom.toUpperCase()}
                                </span>
                                <span className="text-sm text-gold-trim font-mono font-bold bg-black/50 px-3 py-1 rounded">
                                    {globalData.axiomPoints[axiom]} <span className="text-gray-500 font-normal">PT</span>
                                </span>
                            </div>
                            
                            {/* Decorative glow for selected */}
                            {selectedAxiom === axiom && (
                                <div className="absolute inset-0 bg-gold-trim/10 blur-xl -z-10 rounded-xl pointer-events-none" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Side: Tree Container */}
            <div className="flex-1 h-full flex flex-col overflow-hidden pt-4">
                <div className="flex justify-between items-end w-full pb-4 border-b border-white/10 mb-4 px-4 shrink-0">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 font-mono tracking-widest flex items-center gap-2">
                            CURRENT FOCUS
                            <span className="text-white/40">({getPointsSpent(selectedAxiom)} PT SPENT TOTAL)</span>
                        </span>
                        <h3 className={`text-2xl font-mono tracking-widest uppercase ${
                            selectedAxiom === 'Order' ? 'text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]' :
                            selectedAxiom === 'Chaos' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' :
                            selectedAxiom === 'Judgment' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]' :
                            'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]'
                        }`}>
                            {selectedAxiom} DOMAIN
                        </h3>
                    </div>
                    
                    {/* Dev tool to add points for testing */}
                    <button 
                        onClick={() => useGameStore.getState().awardAxiomPoints(selectedAxiom, 100)}
                        className="text-xs px-3 py-2 border border-white/20 hover:bg-white/10 text-gray-400 font-mono transition-colors tracking-widest rounded"
                    >
                        [DEV: +100 {selectedAxiom.toUpperCase()}]
                    </button>
                </div>
                
                {renderTree()}
            </div>
        </div>
    );
};
