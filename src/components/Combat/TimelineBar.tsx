import { useCombatStore } from '../../store/combatStore';
import { PortraitSprite } from '../UI/PortraitSprite';
export const TimelineBar = () => {
    const currentRound = useCombatStore(s => s.currentRound);
    
    // We map out a strictly primitive string signature so Zustand doesn't think the state changed repeatedly 
    // due to newly minted object array maps, which causes React's "Maximum update depth exceeded" crash.
    const timelineSignature = useCombatStore(s => {
        const allLiving = [...s.allies, ...s.enemies].filter(c => !c.isDead);
        const actedThisRound = allLiving
            .filter(c => c.hasActedThisRound && c.instanceId !== s.activeTurnId)
            .sort((a, b) => b.stats.current.fate - a.stats.current.fate);
        
        const activeUnit = s.turnQueue.length > 0 ? [s.turnQueue[0]] : [];
        const remainingQueue = s.turnQueue.slice(1);
        const fullQueue = [...activeUnit, ...remainingQueue, ...actedThisRound];

        return fullQueue.map(u => {
            const isEnemy = s.enemies.some(e => e.instanceId === u.instanceId);
            const hasActed = u.hasActedThisRound && u.instanceId !== s.activeTurnId;
            const isActive = u.instanceId === s.activeTurnId;
            return `${u.instanceId}:${u.baseId}:${isEnemy}:${hasActed}:${isActive}`;
        }).join('|');
    });

    const displayQueue = timelineSignature ? timelineSignature.split('|').map(sig => {
        const [instanceId, baseId, isEnemyStr, hasActedStr, isActiveStr] = sig.split(':');
        return {
            instanceId,
            baseId,
            isEnemy: isEnemyStr === 'true',
            hasActed: hasActedStr === 'true',
            isActive: isActiveStr === 'true'
        };
    }) : [];

    return (
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4/5 max-w-5xl z-30">
        
        {/* Core Timeline Box */}
        <div className="relative w-full h-16 glass-panel rounded-xl flex items-center justify-start gap-4 mt-4 px-6 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.6)] border border-cyan-400/20">
            <div className="absolute left-0 w-full h-full bg-gradient-to-r from-cyan-900/10 via-black/40 to-black/80 pointer-events-none" />
            
            {/* The turn queue units */}
            {displayQueue.map((unit, index) => {
                return (
                    <div 
                      key={unit.instanceId + '-' + index}
                      className={`relative w-12 h-12 rounded shadow-md transition-all duration-300 ease-out flex-shrink-0 flex items-center justify-center overflow-hidden bg-black
                        ${unit.isEnemy ? 'border border-red-500/50 grayscale-[30%] shadow-[0_0_8px_rgba(255,0,0,0.4)]' : 'border border-cyan-400/50 shadow-[0_0_8px_rgba(0,255,255,0.4)]'} 
                        ${unit.isActive ? 'scale-[1.3] z-40 border-[1.5px] border-white shadow-[0_0_15px_rgba(255,255,255,0.8)] mx-3' : 'z-10'}
                        ${unit.hasActed ? 'opacity-30 scale-90 grayscale-[50%]' : (!unit.isActive ? 'bg-black/50 opacity-90 hover:opacity-100 hover:scale-110' : '')}
                      `}
                    >
                       <PortraitSprite baseId={unit.baseId} className="w-full h-full object-cover object-top" />
                       
                       {/* Arrow indicator for active */}
                       {unit.isActive && (
                          <div className="absolute -top-1 text-white text-[12px] animate-bounce text-shadow z-50">▼</div>
                       )}

                       {/* Queue Position Number */}
                       {!unit.isActive && (
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
