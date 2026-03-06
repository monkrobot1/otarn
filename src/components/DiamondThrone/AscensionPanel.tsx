import { useGameStore } from '../../store/gameStore';

export const AscensionPanel = () => {
  const { globalData } = useGameStore();

  const handleUpgrade = (stat: keyof typeof globalData.permanentStatBonuses, cost: number) => {
    if (globalData.divineSparks >= cost) {
      // In a full implementation, you'd add an `upgradePermanentStat` to the store.
      // For this prototype, we'll dummy it out and just consume the sparks for visual feedback.
      useGameStore.setState((state) => ({
        globalData: {
          ...state.globalData,
          divineSparks: state.globalData.divineSparks - cost,
          permanentStatBonuses: {
            ...state.globalData.permanentStatBonuses,
            [stat]: (state.globalData.permanentStatBonuses[stat] || 0) + 1
          }
        }
      }));
    } else {
        alert("Not enough Divine Sparks.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <h3 className="text-xl tracking-widest text-gold-trim font-light border-b border-white/20 pb-2">
        ASCENSION CHAMBER
      </h3>

      <div className="glass-panel p-8 w-2/3 mx-auto flex flex-col gap-8">
        <p className="text-gray-400 font-light text-sm italic">
          "Spend your Divine Sparks to permanently alter the baseline architecture of all Proxies."
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button 
             onClick={() => handleUpgrade('capacity', 50)}
             className="border border-white/10 p-4 flex justify-between items-center hover:bg-white/5 hover:border-gold-trim/50 transition-all text-left group"
          >
             <div>
                <h4 className="text-white tracking-widest text-sm">CAPACITY MATRIX +1</h4>
                <p className="text-xs text-gray-500 mt-1">Permanently bolsters starting HP and MP growth.</p>
             </div>
             <div className="text-gold-trim font-mono text-sm group-hover:scale-110 transition-transform">
                50 SPARKS
             </div>
          </button>

          <button 
             onClick={() => handleUpgrade('grace', 75)}
             className="border border-white/10 p-4 flex justify-between items-center hover:bg-white/5 hover:border-gold-trim/50 transition-all text-left group"
          >
             <div>
                <h4 className="text-white tracking-widest text-sm">CHRONO SYNAPSE +1</h4>
                <p className="text-xs text-gray-500 mt-1">Permanently increases base Grace (Initiative/Accuracy).</p>
             </div>
             <div className="text-gold-trim font-mono text-sm group-hover:scale-110 transition-transform">
                75 SPARKS
             </div>
          </button>
          
          <button 
             onClick={() => handleUpgrade('physicality', 50)}
             className="border border-white/10 p-4 flex justify-between items-center hover:bg-white/5 hover:border-gold-trim/50 transition-all text-left group"
          >
             <div>
                <h4 className="text-white tracking-widest text-sm">TUNGSTEN WEAVE +1</h4>
                <p className="text-xs text-gray-500 mt-1">Permanently increases base Physicality (Armor/Damage).</p>
             </div>
             <div className="text-gold-trim font-mono text-sm group-hover:scale-110 transition-transform">
                50 SPARKS
             </div>
          </button>

          <button 
             onClick={() => handleUpgrade('authority', 50)}
             className="border border-white/10 p-4 flex justify-between items-center hover:bg-white/5 hover:border-gold-trim/50 transition-all text-left group"
          >
             <div>
                <h4 className="text-white tracking-widest text-sm">DIVINE MANDATE +1</h4>
                <p className="text-xs text-gray-500 mt-1">Permanently increases base Authority (Spiritual Damage).</p>
             </div>
             <div className="text-gold-trim font-mono text-sm group-hover:scale-110 transition-transform">
                50 SPARKS
             </div>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-sm">
           <span className="text-gray-500">Current Sparks Available:</span>
           <span className="text-gold-trim font-mono text-xl">{globalData.divineSparks}</span>
        </div>
      </div>
    </div>
  );
};
