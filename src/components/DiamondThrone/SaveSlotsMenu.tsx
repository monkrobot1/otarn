import React, { useState } from 'react';
import { SaveManager } from '../../core/SaveManager';
import type { SaveSystemData } from '../../core/SaveManager';
import { useGameStore } from '../../store/gameStore';

export const SaveSlotsMenu = ({ onBack }: { onBack: () => void }) => {
  const [systemData, setSystemData] = useState<SaveSystemData>(SaveManager.getSystemData());
  const { loadSlot } = useGameStore();
  const [newSlotName, setNewSlotName] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const refreshData = () => {
      setSystemData(SaveManager.getSystemData());
  };

  const handleCreateSlot = () => {
      const name = newSlotName.trim() || `Covenant ${systemData.slots.length + 1}`;
      const newId = SaveManager.createSlot(name);
      loadSlot(newId);
      setNewSlotName('');
      refreshData();
  };

  const handleDeleteSlot = (id: string) => {
      if (confirm('Are you certain? This will permanently sever the connection to this timeline.')) {
         SaveManager.deleteSlot(id);
         const currentSys = SaveManager.getSystemData();
         if (currentSys.activeSlotId) {
             loadSlot(currentSys.activeSlotId);
         }
         refreshData();
      }
  };

  const handleLoadSlot = (id: string) => {
      loadSlot(id);
      refreshData();
  };

  const handleExportSlot = (id: string) => {
      SaveManager.exportSlotToFile(id);
  };

  const handleImportSlot = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsImporting(true);
      const file = e.target.files?.[0];
      if (file) {
          SaveManager.importSlotFromFile(file)
             .then((newId) => {
                 loadSlot(newId);
                 refreshData();
             })
             .catch((err) => {
                 console.error(err);
                 alert('Failed to import save file. The timeline may be corrupted.');
             })
             .finally(() => {
                 setIsImporting(false);
             });
      } else {
         setIsImporting(false);
      }
  };

  return (
      <div className="w-full h-full flex flex-col p-8 items-center bg-black/40 backdrop-blur-sm rounded-xl border border-cyan-900/30 overflow-y-auto">
         <div className="w-full max-w-4xl flex justify-between items-center mb-8 border-b border-gold-trim pb-4">
             <h2 className="text-3xl font-light tracking-widest text-white">RECALL TIMELINES</h2>
             <button 
                 onClick={onBack}
                 className="text-gold-trim hover:text-white transition-all active:scale-95 cursor-pointer tracking-widest text-sm font-mono border border-gold-trim/50 px-4 py-1 bg-black/50"
             >
                 &lt; ABORT
             </button>
         </div>

         <div className="w-full max-w-4xl flex flex-col gap-4">
             {/* New Slot Creation */}
             <div className="flex gap-4 items-center bg-white/5 p-4 rounded border border-white/10">
                 <input 
                     type="text" 
                     placeholder="New Timeline Designation..." 
                     value={newSlotName}
                     onChange={(e) => setNewSlotName(e.target.value)}
                     className="bg-black/50 border border-gold-trim/30 text-gold-trim px-4 py-2 font-mono outline-none focus:border-gold-trim flex-1"
                 />
                 <button 
                     onClick={handleCreateSlot}
                     className="px-6 py-2 border border-green-500/50 text-green-400 hover:bg-green-500/20 font-mono tracking-widest transition-all"
                 >
                     INITIALIZE
                 </button>
                 
                 <label className="px-6 py-2 border border-blue-500/50 text-blue-400 hover:bg-blue-500/20 font-mono tracking-widest transition-all cursor-pointer">
                     {isImporting ? 'IMPORTING...' : 'DECRYPT ARCHIVE'}
                     <input 
                         type="file" 
                         accept=".json" 
                         className="hidden" 
                         onChange={handleImportSlot} 
                         disabled={isImporting}
                     />
                 </label>
             </div>

             <div className="space-y-4">
                 {systemData.slots.length === 0 ? (
                     <div className="text-center text-gray-500 font-mono p-8 border border-white/5 bg-white/5 rounded">
                         NO TIMELINES FOUND
                     </div>
                 ) : (
                     systemData.slots.map(slot => (
                         <div 
                             key={slot.id} 
                             className={`flex flex-col md:flex-row justify-between items-center p-4 rounded border transition-all ${
                                 systemData.activeSlotId === slot.id 
                                     ? 'border-gold-trim bg-gold-trim/10' 
                                     : 'border-white/10 bg-white/5 hover:bg-white/10'
                             }`}
                         >
                             <div className="flex flex-col mb-4 md:mb-0 cursor-pointer flex-1" onClick={() => handleLoadSlot(slot.id)}>
                                 <div className="flex items-center gap-3">
                                     <span className="text-xl text-white font-mono">{slot.name}</span>
                                     {systemData.activeSlotId === slot.id && (
                                         <span className="text-xs text-black bg-gold-trim px-2 py-0.5 rounded font-bold tracking-widest">
                                             ACTIVE
                                         </span>
                                     )}
                                 </div>
                                 <div className="text-sm text-gray-400 font-mono mt-1 flex gap-4">
                                     <span>Last Synced: {new Date(slot.lastPlayed).toLocaleString()}</span>
                                     <span className="text-cyan-400">Sparks: {slot.sparks || 0}</span>
                                     {slot.runActive ? (
                                         <span className="text-green-400">Run In Progress</span>
                                     ) : (
                                         <span className="text-red-400">Dormant</span>
                                     )}
                                 </div>
                             </div>

                             <div className="flex gap-2">
                                 {systemData.activeSlotId !== slot.id && (
                                     <button 
                                         onClick={() => handleLoadSlot(slot.id)}
                                         className="px-4 py-2 border border-gold-trim text-gold-trim hover:bg-gold-trim/20 text-xs font-mono tracking-widest transition-all"
                                     >
                                         LOAD
                                     </button>
                                 )}
                                 <button 
                                     onClick={() => handleExportSlot(slot.id)}
                                     className="px-4 py-2 border border-blue-400/50 text-blue-400 hover:bg-blue-400/20 text-xs font-mono tracking-widest transition-all"
                                 >
                                     EXPORT
                                 </button>
                                 <button 
                                     onClick={() => handleDeleteSlot(slot.id)}
                                     className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/20 text-xs font-mono tracking-widest transition-all"
                                 >
                                     PURGE
                                 </button>
                             </div>
                         </div>
                     ))
                 )}
             </div>
         </div>
      </div>
  );
};
