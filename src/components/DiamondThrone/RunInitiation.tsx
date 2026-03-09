import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import charactersData from '../../data/characters.json';
import { CharacterFactory } from '../../core/CharacterFactory';
import { PortraitSprite } from '../UI/PortraitSprite';
import { CharacterSheetOverlay } from '../Shared/CharacterSheetOverlay';
import type { ActiveCharacter, BaseCharacter } from '../../types/character';

export const RunInitiation = () => {
  const { startNewRun } = useGameStore();
  const [draftedIds, setDraftedIds] = useState<string[]>([]);
  const [sheetUnit, setSheetUnit] = useState<ActiveCharacter | null>(null);

  const baseChampions = charactersData.filter((c: any) => !c.id.includes('BOSS')) as unknown as BaseCharacter[];

  const toggleDraft = (id: string) => {
    if (draftedIds.includes(id)) {
      setDraftedIds(draftedIds.filter(d => d !== id));
    } else if (draftedIds.length < 4) {
      setDraftedIds([...draftedIds, id]);
    }
  };

  const launchRun = () => {
    if (draftedIds.length !== 4) return;
    
    // Convert base IDs to ActiveCharacters level 1
    const activeParty = draftedIds.map(id => CharacterFactory.createFromBaseId(id, 1)).filter(Boolean);
    
    // In a full implementation, we'd pass activeParty to startNewRun or update the store manually after.
    // We update the GameStore directly here for prototype flow bypass
    startNewRun();
    const currentState = useGameStore.getState();
    if (currentState.runData) {
        useGameStore.setState({
            runData: {
                ...currentState.runData,
                activeParty: activeParty as any[]
            }
        });
    }
    useGameStore.getState().setScene('cinematic');
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <h3 className="text-xl tracking-widest text-gold-trim font-light border-b border-white/20 pb-2">
        AWAKEN THE CHAMPIONS
      </h3>

      {/* Selection Pool */}
      <div className="flex-1 glass-panel p-6 overflow-hidden flex flex-col justify-center relative">
        <p className="text-sm text-gray-400 mb-6 tracking-widest text-center uppercase shrink-0">
          Right-Click to view full files
        </p>
        
        {/* Make rows uneven if needed to avoid scroll, flex wrap handles this properly. */}
        <div className="flex flex-wrap justify-center gap-[1.5vw] w-full max-w-[95%] mx-auto items-center content-center flex-1 min-h-0 pb-4">
           {baseChampions.map(champion => {
             const isDrafted = draftedIds.includes(champion.id);
             const draftIndex = draftedIds.indexOf(champion.id);

             return (
               <button 
                 key={champion.id}
                 onClick={() => toggleDraft(champion.id)}
                 onContextMenu={(e) => {
                     e.preventDefault();
                     const activeUnit = CharacterFactory.createFromBaseId(champion.id, 1);
                     if (activeUnit) setSheetUnit(activeUnit);
                 }}
                 className={`relative aspect-[3/4] w-[14vw] sm:w-[10vw] max-w-[140px] border-2 transition-all duration-300 flex flex-col items-center justify-end overflow-visible group ${
                     isDrafted 
                         ? 'border-gold-trim shadow-[0_0_20px_rgba(255,215,0,0.6)] z-20 scale-105' 
                         : 'border-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:scale-110 hover:z-30 hover:grayscale-0 grayscale-[40%] bg-black/50'
                 }`}
               >
                 {/* Portrait Background */}
                 <div className="absolute inset-x-0 bottom-0 top-[-10%] z-0 overflow-hidden flex items-end justify-center pointer-events-none">
                    <PortraitSprite baseId={champion.id} className="w-[110%] aspect-square transform scale-100 group-hover:scale-105 origin-bottom transition-transform duration-300 pointer-events-none" />
                 </div>
                 
                 {/* Overlay Gradient for contrast */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none transition-opacity group-hover:opacity-60"></div>
                 {isDrafted && <div className="absolute inset-0 bg-gold-trim/10 z-10 pointer-events-none mix-blend-overlay"></div>}

                 {/* Slot Number Label */}
                 {isDrafted && (
                     <div className="absolute -bottom-3 -right-3 z-30 w-8 h-8 rounded-full bg-gold-trim text-black font-black text-xl flex items-center justify-center border-2 border-[#0a0d14] shadow-[0_0_10px_rgba(255,215,0,0.8)]">
                         {4 - draftIndex}
                     </div>
                 )}
                 
                 {/* Hover Hover Tooltip with Stats & Details */}
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none z-50 p-3 bg-black/95 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.2)] flex flex-col gap-2 rounded">
                    <div className="text-cyan-400 font-bold text-[10px] tracking-widest text-center border-b border-cyan-500/30 pb-1 mb-1">{champion.classRole}</div>
                    
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-mono mx-auto">
                        <div className="text-gray-400 flex justify-between"><span>PHY</span> <span className="text-white">{champion.stats.physicality}</span></div>
                        <div className="text-gray-400 flex justify-between"><span>AUT</span> <span className="text-white">{champion.stats.authority}</span></div>
                        <div className="text-gray-400 flex justify-between"><span>GRA</span> <span className="text-white">{champion.stats.grace}</span></div>
                        <div className="text-gray-400 flex justify-between"><span>ACU</span> <span className="text-white">{champion.stats.acumen}</span></div>
                    </div>

                    <div className="text-[9px] text-gray-400 text-center leading-tight tracking-wider mt-1 border-t border-white/10 pt-1 italic whitespace-normal">
                        HP: {champion.stats.physicality * 10} // MP: {champion.stats.capacity * 10}
                    </div>
                 </div>
                 
                 {/* Name Banner */}
                 <div className={`relative z-20 w-full text-center py-1.5 backdrop-blur-md border-t transition-colors ${
                     isDrafted 
                         ? 'bg-gold-trim/90 border-gold-trim text-black' 
                         : 'bg-black/80 border-white/10 text-gray-300 group-hover:bg-cyan-950/90 group-hover:border-cyan-500/80 group-hover:text-cyan-100'
                 }`}>
                   <span className="font-bold tracking-widest text-[9.5px] sm:text-[11px] uppercase block truncate px-1 drop-shadow-md">
                       {champion.name}
                   </span>
                 </div>
               </button>
             )
           })}
        </div>
      </div>

      {/* Drafted Team Review (Bottom Layout) */}
      <div className="h-56 glass-panel p-6 flex flex-col gap-2 shrink-0">
         <div className="flex justify-between items-center mb-2">
           <h4 className="text-white tracking-widest text-sm">ACTIVE COVENANT (FORMATION)</h4>
           <button 
             disabled={draftedIds.length !== 4}
             onClick={launchRun}
             className={`px-8 py-3 border-2 tracking-widest font-bold transition-all text-sm ${draftedIds.length === 4 ? 'border-gold-trim text-gold-trim hover:bg-gold-trim/20 shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'border-gray-700 text-gray-700 cursor-not-allowed'}`}
           >
             ENGAGE SECTOR {draftedIds.length}/4
           </button>
         </div>

         <div className="flex-1 flex justify-center items-center gap-2">
           {/* Visual Frontline Representation */}
           <div className="flex justify-center gap-4 items-end h-32 relative w-full max-w-4xl mx-auto">
              <div className="absolute left-0 bottom-4 text-[10px] text-gray-500 font-mono tracking-widest rotate-[-90deg] origin-left uppercase opacity-50">Backline</div>
              <div className="absolute right-0 bottom-4 text-[10px] text-gold-trim font-mono tracking-widest rotate-[90deg] origin-right uppercase opacity-50">Frontline</div>
              {[0, 1, 2, 3].map(slot => {
                const draftId = draftedIds[slot];
                const champion = draftId ? baseChampions.find(p => p.id === draftId) : null;
                const visualSlot = 4 - slot; // 4, 3, 2, 1
                
                return (
                  <div key={slot} className="w-24 h-28 border border-white/10 bg-[#070a0f] relative flex flex-col justify-end items-center group shadow-md transition-all hover:border-cyan-500/50">
                    <span className="absolute top-1 left-1 bg-black/80 px-1 text-[9px] text-cyan-500/80 font-mono font-bold z-20 border border-cyan-900/50">SLOT {visualSlot}</span>
                    {champion ? (
                      <>
                        <div className="absolute inset-x-0 bottom-6 top-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity overflow-hidden flex justify-center">
                          <PortraitSprite baseId={champion.id} className="w-24 h-full object-cover transform scale-125 origin-bottom" />
                        </div>
                        <div className="z-10 bg-black/90 w-full text-center py-1 mt-auto border-t border-white/10 backdrop-blur-sm">
                          <div className="text-gold-trim font-bold text-[9px] truncate px-1 tracking-wider">{champion.name}</div>
                        </div>
                        <button 
                          onClick={() => toggleDraft(champion.id)}
                          className="absolute inset-0 bg-red-900/60 text-red-200 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center font-bold text-2xl backdrop-blur-sm shadow-inner"
                        >
                          X
                        </button>
                      </>
                    ) : (
                      <div className="text-gray-700 italic text-[10px] tracking-widest text-center w-full h-full flex flex-col items-center justify-center pointer-events-none gap-2">
                         <div className="w-8 h-8 rounded-full border border-dashed border-gray-700 flex items-center justify-center opacity-50">+</div>
                         EMPTY
                      </div>
                    )}
                  </div>
                );
              })}
           </div>
         </div>
      </div>

      {sheetUnit && (
        <CharacterSheetOverlay unit={sheetUnit} onClose={() => setSheetUnit(null)} />
      )}
    </div>
  );
};
