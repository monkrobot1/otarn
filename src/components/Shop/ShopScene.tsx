import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import allRelics from '../../data/relics.json';
import type { Relic } from '../../types/save';
import { CharacterFactory } from '../../core/CharacterFactory';

const TIER_PRICES: Record<string, number> = {
  Fractured: 40,
  Resonant: 75,
  Exalted: 120,
  Reliquary: 175,
  Divine: 250
};

interface ShopItem {
  id: string; // ID of relic, or 'service-heal'
  type: 'relic' | 'service';
  name: string;
  description: string;
  cost: number;
  relicData?: Relic;
  sold: boolean;
  color?: string;
}

export const ShopScene: React.FC = () => {
  const { runData, updateRunData, setScene } = useGameStore();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [hoveredItem, setHoveredItem] = useState<ShopItem | null>(null);

  const ephemeralFaith = runData?.ephemeralFaith || 0;

  useEffect(() => {
    // Generate shop inventory only once when component mounts
    const ownedRelicIds = runData?.activeRelics || [];
    
    // Filter available relics
    const availableRelics = allRelics.filter(r => !ownedRelicIds.includes(r.id));
    
    // Pick 3 random relics
    const selectedRelics: ShopItem[] = [];
    const pool = [...availableRelics];
    for (let i = 0; i < 3; i++) {
      if (pool.length === 0) break;
      const rIdx = Math.floor(Math.random() * pool.length);
      const chosen = pool.splice(rIdx, 1)[0] as Relic;
      
      selectedRelics.push({
        id: chosen.id,
        type: 'relic',
        name: chosen.name,
        description: chosen.effect,
        cost: TIER_PRICES[chosen.tier] || 50,
        relicData: chosen,
        sold: false,
        color: chosen.color
      });
    }

    // Add healing service
    selectedRelics.push({
      id: 'service-heal',
      type: 'service',
      name: 'Mend Proxies',
      description: 'Fully restore HP to all party members.',
      cost: 50,
      sold: false,
      color: '#22C55E'
    });

    setItems(selectedRelics);
  }, []); // Intentionally empty dependency array to only run once per shop visit

  const handleBuy = (item: ShopItem) => {
    if (ephemeralFaith < item.cost) {
        // Not enough currency (could show a flash or alert)
        return;
    }

    const newFaith = ephemeralFaith - item.cost;
    
    if (item.type === 'relic' && item.relicData) {
        // Need to add to active relics
        // But limit is 4 in RunStateData? Actually wait, let's just append.
        const currentRelics = runData?.activeRelics || [];
        updateRunData({
            ephemeralFaith: newFaith,
            activeRelics: [...currentRelics, item.id]
        });
    } else if (item.type === 'service' && item.id === 'service-heal') {
        const party = runData?.activeParty || [];
        const healedParty = party.map(p => ({
            ...p,
            currentHp: CharacterFactory.calculateMaxHp(p.stats.base, p.level)
        }));
        updateRunData({
            ephemeralFaith: newFaith,
            activeParty: healedParty
        });
    }

    // Mark as sold
    setItems(items.map(i => i.id === item.id ? { ...i, sold: true } : i));
  };

  const handleLeave = () => {
    setScene('sector-map');
  };

  return (
    <div className="w-full h-full p-8 flex flex-col relative bg-cover bg-center" style={{ backgroundImage: `url('/assets/default_galaxy.jpg')` }}>
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-none z-0" />
        
        {/* Header */}
        <header className="flex justify-between items-center w-full z-10 mb-8 relative">
            <div>
                <h2 className="text-3xl font-light tracking-widest text-orange-400 border-b border-orange-400/50 pb-2 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">
                    WANDERING MERCHANT
                </h2>
                <p className="text-gray-400 font-mono text-sm mt-2">
                    "I trade power for fragments of your faith. Choose wisely."
                </p>
            </div>
            
            <div className="glass-panel px-6 py-2 flex flex-col items-center border border-orange-400/30">
                <span className="text-xs text-gray-400 uppercase tracking-widest">Ephemeral Faith</span>
                <span className="text-2xl font-mono text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
                    {ephemeralFaith}
                </span>
            </div>
        </header>

        {/* Main Layout */}
        <div className="flex-1 flex gap-8 z-10 relative">
            {/* Left side: Merchant Image + Dialog */}
            <div className="w-1/3 flex flex-col justify-end">
                {hoveredItem && !hoveredItem.sold ? (
                    <div className="glass-panel p-6 mb-8 border border-orange-400/50 animate-[fade-in_0.2s_ease-out]">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold tracking-widest" style={{ color: hoveredItem.color }}>
                                {hoveredItem.name.toUpperCase()}
                            </h3>
                            <span className="font-mono text-orange-300 text-lg">
                                Cost: {hoveredItem.cost}
                            </span>
                        </div>
                        {hoveredItem.relicData && (
                            <span className="text-xs font-mono uppercase tracking-widest border border-current px-2 py-0.5 rounded opacity-70 mb-4 inline-block" style={{ color: hoveredItem.color }}>
                                {hoveredItem.relicData.tier} Tier  //  {hoveredItem.relicData.sector} Sector
                            </span>
                        )}
                        <p className="text-white text-sm mt-2 font-mono">
                            {hoveredItem.description}
                        </p>
                    </div>
                ) : (
                    <div className="glass-panel p-6 mb-8 border border-white/10 opacity-50">
                        <p className="text-gray-400 text-sm font-mono italic">
                            Hover over an item to inspect its resonance.
                        </p>
                    </div>
                )}
                
                <div className="relative group">
                    <img 
                        src="/assets/shopkeeper.png" 
                        alt="Merchant" 
                        className="w-full max-h-[50vh] object-contain object-bottom filter drop-shadow-[0_0_20px_rgba(251,146,60,0.3)] transition-all duration-500 group-hover:brightness-125"
                    />
                </div>
            </div>

            {/* Right side: Items grid */}
            <div className="w-2/3 glass-panel p-8 flex flex-col">
                <h3 className="text-xl font-light tracking-widest text-white mb-6 uppercase border-b border-white/20 pb-2">
                    Available Wares
                </h3>

                <div className="grid grid-cols-2 gap-6 flex-1">
                    {items.map(item => (
                        <div 
                            key={item.id}
                            className={`relative group flex flex-col justify-between p-6 border transition-all duration-300 ${
                                item.sold 
                                ? 'border-gray-800 bg-black/40 opacity-50' 
                                : `border-[${item.color || '#fff'}]/30 bg-black/60 hover:bg-black/80 cursor-pointer`
                            }`}
                            onMouseEnter={() => setHoveredItem(item)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={() => !item.sold && handleBuy(item)}
                            style={{
                                borderColor: item.sold ? '#374151' : (item.color ? `${item.color}80` : '#4b5563')
                            }}
                        >
                            {/* Hover effect highlight */}
                            {!item.sold && (
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{ backgroundColor: item.color || '#fff' }} />
                            )}

                            <div>
                                <h4 className="text-lg font-bold tracking-widest uppercase mb-1" style={{ color: item.sold ? '#9ca3af' : item.color }}>
                                    {item.name}
                                </h4>
                                <p className="text-sm text-gray-400 font-mono line-clamp-2">
                                    {item.description}
                                </p>
                            </div>

                            <div className="flex justify-between items-end mt-4">
                                {item.sold ? (
                                    <div className="text-red-500/80 font-bold tracking-widest uppercase text-xl transform -rotate-12">
                                        SOLD OUT
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">Price</span>
                                        <span className={`text-2xl font-mono ${ephemeralFaith >= item.cost ? 'text-orange-400 font-bold' : 'text-red-500 line-through'}`}>
                                            {item.cost}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleLeave}
                        className="glass-panel px-8 py-4 text-xl font-light tracking-[0.2em] text-white hover:text-orange-400 border border-white/20 hover:border-orange-400/80 transition-all duration-300 uppercase hover:bg-black/80"
                    >
                        Depart Shop
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
