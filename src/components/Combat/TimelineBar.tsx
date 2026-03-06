import { useCombatStore } from '../../store/combatStore';

export const TimelineBar = () => {
    const { turnQueue, allies, enemies, currentRound, activeTurnId } = useCombatStore();
  
    // Display all combatants, sorted by turn order for the visual track
    const allLiving = [...allies, ...enemies].filter(c => !c.isDead);
    const actedThisRound = allLiving.filter(c => c.hasActedThisRound && c.instanceId !== activeTurnId).sort((a, b) => b.stats.current.fate - a.stats.current.fate);
    
    // Fully ordered display queue for the entire active round (Active -> Queue -> Already Acted)
    const activeUnit = turnQueue.length > 0 ? [turnQueue[0]] : [];
    const remainingQueue = turnQueue.slice(1);
    const displayQueue = [...activeUnit, ...remainingQueue, ...actedThisRound];

    return (
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4/5 max-w-5xl z-30">
        
        {/* Core Timeline Box */}
        <div className="relative w-full h-16 glass-panel rounded-xl flex items-center justify-start gap-4 mt-4 px-6 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.6)] border border-cyan-400/20">
            <div className="absolute left-0 w-full h-full bg-gradient-to-r from-cyan-900/10 via-black/40 to-black/80 pointer-events-none" />
            
            {/* The turn queue units */}
            {displayQueue.map((unit, index) => {
                const isActive = unit.instanceId === activeTurnId;
                const isEnemy = enemies.some(e => e.instanceId === unit.instanceId);
                const hasActed = unit.hasActedThisRound && !isActive;
  
                return (
                    <div 
                      key={unit.instanceId + '-' + index}
                      className={`relative w-12 h-12 rounded-full shadow-md transition-all duration-300 ease-out flex-shrink-0 flex items-center justify-center overflow-hidden
                        ${isEnemy ? 'border-2 border-red-500/50 grayscale-[30%] shadow-[0_0_8px_rgba(255,0,0,0.4)]' : 'border-2 border-cyan-400/50 shadow-[0_0_8px_rgba(0,255,255,0.4)]'} 
                        ${isActive ? 'scale-125 z-40 border-white shadow-[0_0_15px_rgba(255,255,255,0.8)] mx-3' : 'z-10'}
                        ${hasActed ? 'opacity-30 scale-90 grayscale-[50%]' : (!isActive ? 'bg-black/50 opacity-90 hover:opacity-100 hover:scale-110' : '')}
                      `}
                    >
                       <img src={unit.portraitUrl} className="w-full h-full object-cover" alt={unit.name} />
                       
                       {/* Arrow indicator for active */}
                       {isActive && (
                          <div className="absolute top-0 text-white text-[12px] animate-bounce text-shadow z-50">▼</div>
                       )}

                       {/* Queue Position Number */}
                       {!isActive && (
                           <div className="absolute bottom-0 right-0 bg-black/80 text-white text-[9px] font-mono px-1 rounded-tl">
                               {index + 1}
                           </div>
                       )}
                    </div>
                )
            })}
        </div>

        {/* Phase Indicator */}
        <div className="w-full flex justify-between mt-2 px-8">
            <div className="px-4 py-[2px] border border-cyan-400/20 bg-black/60 text-[10px] font-mono text-cyan-200 tracking-[0.2em]">
               ROUND <span className="text-white font-bold text-xs">{currentRound}</span>
            </div>
            <div className="text-[10px] font-mono text-gray-500 animate-pulse tracking-widest">
                STATIC INITIATIVE TRACK
            </div>
        </div>
      </div>
    );
  };
