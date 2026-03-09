import { useState } from 'react';
import charactersData from '../../data/characters.json';
import type { BaseCharacter, ActiveCharacter } from '../../types/character';
import { CharacterFactory } from '../../core/CharacterFactory';
import { CharacterSheetOverlay } from '../Shared/CharacterSheetOverlay';

export const RosterView = () => {
  const [sheetUnit, setSheetUnit] = useState<ActiveCharacter | null>(null);

  // Filter only the 16 base Champions
  const baseChampions = charactersData.filter(c => !c.id.includes('BOSS')) as unknown as BaseCharacter[];

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h3 className="text-xl tracking-widest text-gold-trim font-light border-b border-white/20 pb-2">
        ROSTER ARCHIVE
      </h3>
      
      <div className="grid grid-cols-4 gap-4 overflow-y-auto pr-2 pb-10">
        {baseChampions.map(champion => (
          <div 
             key={champion.id} 
             onContextMenu={(e) => {
                 if (e.metaKey || e.ctrlKey) {
                     e.preventDefault();
                     const activeUnit = CharacterFactory.createFromBaseId(champion.id, 1);
                     if (activeUnit) setSheetUnit(activeUnit);
                 }
             }}
             className="glass-panel p-4 flex flex-col gap-2 hover:bg-white/10 transition-colors cursor-pointer group relative"
          >
             <div className="absolute top-0 right-0 p-2 text-xs font-mono text-gray-500 opacity-50 group-hover:opacity-100 transition-opacity">
               {champion.id.split('_').pop()}
             </div>
             
             <h4 className="text-lg font-bold text-white tracking-wide">{champion.name}</h4>
             <div className="flex gap-2 text-xs font-mono uppercase tracking-wider">
               <span className={`text-${champion.sector.toLowerCase()}`}>{champion.sector}</span>
               <span className="text-gray-400">/</span>
               <span className="text-gray-300">{champion.classRole}</span>
             </div>

             <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">PHY</span>
                  <span className="text-white font-mono">{champion.stats.physicality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">AUT</span>
                  <span className="text-white font-mono">{champion.stats.authority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GRA</span>
                  <span className="text-white font-mono">{champion.stats.grace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ACU</span>
                  <span className="text-white font-mono">{champion.stats.acumen}</span>
                </div>
             </div>

             <div className="mt-2 text-center text-[10px] tracking-widest text-gold-trim/50 border-t border-white/10 pt-2 group-hover:text-gold-trim transition-colors">
               [ 1 - STAR / LOCKED ]
             </div>
          </div>
        ))}
      </div>

      {sheetUnit && (
        <CharacterSheetOverlay unit={sheetUnit} onClose={() => setSheetUnit(null)} />
      )}
    </div>
  );
};
