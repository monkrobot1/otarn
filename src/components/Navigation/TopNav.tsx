import { useGameStore } from '../../store/gameStore';
import { Tooltip } from '../UI/Tooltip';
import relicsData from '../../data/relics.json';
import { Gem } from 'lucide-react';

export const TopNav = () => {
    const { globalData, runData, currentScene, setMenuOpen } = useGameStore();
    
    // Use runData if in a run, else globalData
    const isRunActive = currentScene !== 'throne' && currentScene !== 'cinematic' && currentScene !== 'summary';
    const sparks = isRunActive ? runData?.divineSparks : globalData.divineSparks;
    const faith = isRunActive ? runData?.ephemeralFaith : 0;
    
    // Check if we're actually in a sector by checking the scene, or fallback to Throne
    const currentSector = isRunActive 
        ? (runData?.currentSector ? `SECTOR: ${runData.currentSector.toUpperCase()}` : "ASTRAL PROJECTION")
        : "DIAMOND THRONE";

    const activeRelics = isRunActive ? (runData?.activeRelics || []) : [];

    return (
        <div className="absolute top-0 left-0 w-full h-12 bg-black/80 border-b border-cyan-900/50 flex items-center px-6 z-50 backdrop-blur-md font-mono text-xs justify-between shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-6">
                <div className="text-cyan-400 font-bold tracking-widest bg-cyan-900/20 px-3 py-1 border border-cyan-800/50 rounded flex items-center gap-2">
                    <span className="opacity-70">⟡</span> {currentSector}
                </div>
                <div 
                    className="text-gray-400 tracking-wider flex items-center gap-2 hover:text-white cursor-pointer transition-colors"
                    onClick={() => setMenuOpen(true)}
                >
                    <span className="text-lg">☰</span> MENU
                </div>
            </div>
            
            <div className="flex items-center gap-8">
                {isRunActive && (
                    <div className="flex items-center gap-4 cursor-pointer group">
                         <div className="flex gap-1 items-center bg-gray-900 px-3 py-1 rounded border border-gray-700 group-hover:border-gray-500 transition-colors">
                            <span className="text-green-500 font-bold">■ ■ ■ ■</span>
                            <span className="text-gray-400 ml-2 tracking-widest text-[10px]">ROSTER ({runData?.activeParty?.length || 0})</span>
                         </div>
                    </div>
                )}

                {isRunActive && (
                    <div className="flex gap-2 items-center mr-4">
                        {activeRelics.length > 0 ? activeRelics.map((relicId, i) => {
                            const relicInfo = relicsData.find(r => r.id === relicId);
                            if (!relicInfo) return null;
                            return (
                                <Tooltip
                                    key={`relic-${i}`}
                                    delayMs={200}
                                    content={
                                        <div className="flex flex-col gap-1 w-[200px]">
                                            <span className="font-[family-name:var(--font-cinzel-dec)] text-yellow-400 text-sm tracking-widest uppercase font-bold">{relicInfo.name}</span>
                                            <div className="flex justify-between items-center text-[8px] font-sans text-gray-500 mb-1 border-b border-white/10 pb-1">
                                                <span className="uppercase">{relicInfo.tier}</span>
                                                <span className="uppercase">{relicInfo.sector}</span>
                                            </div>
                                            <span className="text-gray-300 font-sans text-[10px] italic leading-tight">{relicInfo.effect}</span>
                                        </div>
                                    }
                                >
                                    <div className="w-8 h-8 rounded bg-gray-900 border border-gray-700 flex items-center justify-center hover:bg-gray-800 hover:border-white/30 transition-all cursor-help shadow-[0_0_5px_rgba(0,0,0,0.5)] group relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: relicInfo.color }} />
                                        <Gem className="w-4 h-4 transition-transform group-hover:scale-110 relative z-10" style={{ color: relicInfo.color || '#9CA3AF' }} />
                                    </div>
                                </Tooltip>
                            )
                        }) : (
                            <Tooltip delayMs={200} content={<span className="text-gray-400">Empty Relic Slot</span>}>
                                <div className="w-8 h-8 border border-dashed border-gray-800 rounded flex items-center justify-center opacity-30">
                                </div>
                            </Tooltip>
                        )}
                    </div>
                )}

                {isRunActive && (
                    <div className="flex items-center gap-2" title="Ephemeral Faith (Currency)">
                        <div className="w-5 h-5 flex items-center justify-center text-yellow-400 bg-yellow-900/30 rounded-full border border-yellow-700">
                           ✧
                        </div>
                        <span className="text-yellow-400 font-bold tracking-widest">{faith ?? 0}</span>
                    </div>
                )}

                <div className="flex items-center gap-2" title="Divine Sparks (Fuel)">
                    <div className="w-5 h-5 flex items-center justify-center text-cyan-300 bg-cyan-900/30 rounded-full border border-cyan-700">
                        ⚡
                    </div>
                    <span className="text-cyan-300 font-bold tracking-widest">{sparks ?? 0}</span>
                </div>

                <div 
                    className="text-gray-400 cursor-pointer hover:text-white transition-all hover:rotate-90"
                    onClick={() => setMenuOpen(true)}
                >
                    ⚙
                </div>
            </div>
        </div>
    );
};
