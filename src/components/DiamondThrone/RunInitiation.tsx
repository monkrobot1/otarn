import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import charactersData from '../../data/characters.json';
import type { BaseCharacter } from '../../types/character';
import { CharacterFactory } from '../../core/CharacterFactory';

export const RunInitiation = () => {
  const { startNewRun } = useGameStore();
  const [draftedIds, setDraftedIds] = useState<string[]>([]);

  const baseProxies = charactersData.filter(c => !c.id.includes('BOSS')) as unknown as BaseCharacter[];

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
        AWAKEN THE PROXIES
      </h3>

      <div className="flex flex-1 gap-8">
        {/* Selection Pool */}
        <div className="flex-1 glass-panel p-6 overflow-y-auto">
          <p className="text-sm text-gray-400 mb-4 tracking-widest">Select 4 Proxies to bind to your will.</p>
          <div className="grid grid-cols-2 gap-2">
             {baseProxies.map(proxy => {
               const isDrafted = draftedIds.includes(proxy.id);
               return (
                 <button 
                   key={proxy.id}
                   onClick={() => toggleDraft(proxy.id)}
                   className={`p-3 border text-left flex justify-between items-center transition-all ${isDrafted ? 'border-gold-trim bg-gold-trim/20 text-white' : 'border-white/10 hover:border-white/30 text-gray-400'}`}
                 >
                   <span className="font-bold tracking-wide text-sm">{proxy.name}</span>
                   <span className="font-mono text-xs opacity-50">{proxy.classRole}</span>
                 </button>
               )
             })}
          </div>
        </div>

        {/* Drafted Team Review */}
        <div className="w-1/3 flex flex-col gap-4">
           <div className="glass-panel p-6 flex-1 flex flex-col gap-2">
             <h4 className="text-white tracking-widest mb-4">ACTIVE COVENANT</h4>
             {[0, 1, 2, 3].map(slot => {
               const draftId = draftedIds[slot];
               const proxy = draftId ? baseProxies.find(p => p.id === draftId) : null;
               
               return (
                 <div key={slot} className="h-16 border border-white/10 bg-black/50 p-3 flex flex-col justify-center relative group">
                   {proxy ? (
                     <>
                       <div className="text-gold-trim font-bold text-sm">{proxy.name}</div>
                       <div className="text-xs text-gray-500 font-mono tracking-widest">{proxy.sector}</div>
                       <button 
                         onClick={() => toggleDraft(proxy.id)}
                         className="absolute top-0 right-0 h-full px-4 bg-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         X
                       </button>
                     </>
                   ) : (
                     <div className="text-gray-600 italic text-sm text-center">Empty Slot</div>
                   )}
                 </div>
               )
             })}
           </div>

           <button 
             disabled={draftedIds.length !== 4}
             onClick={launchRun}
             className={`p-4 border-2 tracking-widest font-bold transition-all ${draftedIds.length === 4 ? 'border-gold-trim text-gold-trim hover:bg-gold-trim/20' : 'border-gray-700 text-gray-700 cursor-not-allowed'}`}
           >
             ENGAGE SECTOR {draftedIds.length}/4
           </button>
        </div>
      </div>
    </div>
  );
};
