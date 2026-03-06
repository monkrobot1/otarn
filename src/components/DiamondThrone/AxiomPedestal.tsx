import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { AXIOM_TREES } from '../../data/axiomData';

type AxiomType = 'Order' | 'Chaos' | 'Judgment' | 'Love';

export const AxiomPedestal = () => {
    const { globalData, unlockAxiomNode } = useGameStore();
    const [selectedAxiom, setSelectedAxiom] = useState<AxiomType>('Order');

    const handleUnlock = (nodeId: string, cost: number, tier: number) => {
        if (globalData.axiomPoints[selectedAxiom] < cost) {
            alert(`Not enough ${selectedAxiom} Points.`);
            return;
        }

        // Check if a node in this tier is already unlocked
        const tierPrefix = `AXIOM_${selectedAxiom.toUpperCase()}_T${tier}_`;
        const hasUnlockedInTier = globalData.unlockedAxiomNodes.some(n => n.startsWith(tierPrefix));
        if (hasUnlockedInTier) {
            alert('You have already chosen a blessing from this tier.');
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
        return (
            <div className="grid grid-cols-8 gap-3 w-full h-full items-start overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {tree.map((tierOptions, tierIndex) => (
                    <div key={tierIndex} className="flex flex-col gap-2 h-full">
                        <div className="text-gray-500 font-mono text-[10px] tracking-widest border-b border-white/20 w-full text-center pb-1 uppercase shrink-0">
                            TIER {tierIndex + 1}
                        </div>
                        <div className="grid grid-rows-4 gap-2 h-full min-h-[300px]">
                            {tierOptions.map((opt) => {
                                const isUnlocked = globalData.unlockedAxiomNodes.includes(opt.id);
                                const tierPrefix = `AXIOM_${selectedAxiom.toUpperCase()}_T${tierIndex + 1}_`;
                                const tierLocked = !isUnlocked && globalData.unlockedAxiomNodes.some(n => n.startsWith(tierPrefix));
                                const canAfford = globalData.axiomPoints[selectedAxiom] >= opt.cost;
                                
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleUnlock(opt.id, opt.cost, opt.tier)}
                                        disabled={tierLocked || (!isUnlocked && !canAfford)}
                                        className={`w-full p-2 border text-left flex flex-col gap-1 transition-all group overflow-hidden relative ${
                                            isUnlocked 
                                                ? 'border-gold-trim bg-gold-trim/10 shadow-[0_0_10px_rgba(212,175,55,0.1)]' 
                                                : tierLocked
                                                    ? 'border-red-900/40 bg-black/60 opacity-40 cursor-not-allowed'
                                                    : canAfford
                                                        ? 'border-white/20 hover:border-gold-trim/60 hover:bg-white/5 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg'
                                                        : 'border-white/5 bg-black/50 opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        {isUnlocked && <div className="absolute inset-0 bg-gold-trim/5 z-0 animate-pulse pointer-events-none" />}
                                        <div className="flex justify-between items-start z-10 w-full">
                                            <span className={`text-[10px] tracking-widest font-mono font-bold w-full truncate pr-1 ${isUnlocked ? 'text-gold-trim drop-shadow-md' : 'text-gray-200'}`} title={opt.name.toUpperCase()}>
                                                {opt.name.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center w-full z-10 hidden xl:flex">
                                            {opt.effectType && (
                                                <span className="text-[8px] uppercase font-mono tracking-widest text-white/50 bg-white/10 px-1 py-0.5 rounded truncate max-w-[60%]">
                                                    {opt.effectType.replace('_', ' ')}
                                                </span>
                                            )}
                                            <span className={`text-[9px] font-mono font-bold shrink-0 ${isUnlocked ? 'text-green-400' : canAfford && !tierLocked ? 'text-cyan-400' : 'text-gray-600'}`}>
                                                {isUnlocked ? 'UNLOCKED' : `${opt.cost} PT`}
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-gray-400 z-10 mt-1 leading-snug line-clamp-4">
                                            {formatDescription(opt.description)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
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
                        Offer the latent resonance gathered from your ascensions. Choose wisely, as devoting yourself to an aspect seals the others of its tier forever.
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
                        <span className="text-xs text-gray-500 font-mono tracking-widest">CURRENT FOCUS</span>
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
