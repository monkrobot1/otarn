import { useGameStore } from '../../store/gameStore';

export const BottomNav = () => {
    const { currentScene, endRun } = useGameStore();
    
    // Only show during run if that makes sense, or adjust as needed. 
    // The user requested top and bottom nav 'throughout the game'
    const isRunActive = currentScene !== 'throne' && currentScene !== 'cinematic' && currentScene !== 'summary';

    if (!isRunActive) {
        return (
            <div className="absolute bottom-0 left-0 w-full h-10 bg-black/60 border-t border-cyan-900/50 flex items-center px-6 z-50 backdrop-blur-md font-mono text-xs justify-between">
                <div className="text-gray-500 tracking-wider">AWAITING COVENANT...</div>
                <div className="text-gray-500">VERSION 0.1a</div>
            </div>
        );
    }

    return (
        <div className="absolute bottom-0 left-0 w-full h-12 bg-black/80 border-t border-cyan-900/50 flex items-center justify-between px-6 z-50 backdrop-blur-md font-mono text-xs shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-6">
                 {/* Left side actions */}
                 <button 
                     onClick={() => {
                         if (currentScene !== 'sector-map') {
                             alert("Map view cannot be opened during an active node. Formally resolve the encounter first.");
                         }
                     }}
                     className={`flex items-center gap-2 uppercase tracking-widest px-4 py-1.5 border rounded transition-colors ${
                         currentScene === 'sector-map' 
                             ? 'text-cyan-400 bg-cyan-900/40 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                             : 'text-gray-500 bg-gray-900/30 border-gray-700 hover:text-white cursor-pointer'
                     }`}
                 >
                     [ MAP ]
                 </button>
                 <button 
                     onClick={() => alert("Deck and Inventory viewer not yet implemented.")}
                     className="flex items-center gap-2 text-yellow-500 hover:text-white transition-colors uppercase tracking-widest bg-yellow-900/30 px-4 py-1.5 border border-yellow-800 rounded"
                 >
                     [ DECK / INV ]
                 </button>
            </div>

            <div className="flex items-center gap-4 text-gray-400">
                <span>SECTOR LOG ACTIVE</span>
                <div className="h-4 w-px bg-cyan-900/50" />
                <span>COMBAT PREPARED</span>
            </div>

            <div className="flex items-center gap-6">
                <button 
                     onClick={() => {
                         if (window.confirm("Are you sure you want to terminate this run? All progress will be converted to sparks.")) {
                             endRun(false);
                         }
                     }}
                     className="flex items-center gap-2 text-red-500 hover:text-red-300 transition-colors uppercase tracking-widest bg-red-900/30 px-4 py-1.5 border border-red-800 rounded group"
                 >
                     <span className="group-hover:animate-pulse">TERMINATE RUN</span>
                </button>
            </div>
        </div>
    );
};
