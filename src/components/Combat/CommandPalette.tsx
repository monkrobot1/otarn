import { useCombatStore } from '../../store/combatStore';
import { Tooltip } from '../UI/Tooltip';

export const CommandPalette = () => {
    const { activeTurnId, allies, enemies, processPayload, targetingAbility, setTargetingAbility } = useCombatStore();
  
    const activeChar = [...allies, ...enemies].find(c => c.instanceId === activeTurnId);
    const isAllyTurn = allies.some(a => a.instanceId === activeTurnId);
  
    // Auto-skip or simple AI for enemies in this prototype wrapper
    if (!isAllyTurn && activeChar) {
       return (
         <div className="w-full h-56 flex items-center justify-center mt-auto pb-4 relative z-20">
           <div className="glass-panel w-2/3 max-w-2xl p-4 flex items-center justify-center opacity-70 animate-pulse bg-red-900/20">
              <span className="text-red-500 tracking-widest font-mono text-shadow">ENEMY FORMULATING ATTACK...</span>
           </div>
         </div>
       )
    }
  
    if (!activeChar) return <div className="w-full h-56 mt-auto pb-4 relative z-20" />;
  
    if (targetingAbility) {
       return (
          <div className="w-full h-56 flex items-center justify-center mt-auto pb-4 relative z-20">
             <div className="w-2/3 max-w-2xl p-6 flex flex-col gap-4 border border-yellow-400/50 bg-[#1a2332]/95 backdrop-blur-md rounded-lg shadow-[0_0_15px_rgba(255,200,0,0.2)]">
                 <h3 className="text-xl text-yellow-400 tracking-widest text-center animate-pulse font-bold">
                     SELECT TARGET FOR {targetingAbility.name.toUpperCase()}
                 </h3>
                 <button 
                    onClick={() => setTargetingAbility(null)} 
                    className="text-gray-400 text-xs hover:text-white font-mono uppercase tracking-widest mt-2"
                 >
                     [ Cancel Targeting ]
                 </button>
             </div>
          </div>
       );
    }
  
    return (
      <div className="w-full h-56 flex justify-between gap-4 mt-auto relative z-20 pb-4">
         
         {/* Left Panel: Stats */}
         <div className="flex-1 bg-[#1a2c3a]/80 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
            {/* Header: Name and Class */}
            <div className="border-b border-white/10 pb-2 mb-2">
              <div className="text-sm text-cyan-400 font-bold tracking-wider truncate">{activeChar.name.toUpperCase()}</div>
              <Tooltip content={activeChar.combatRole === 'Frontline' ? 'Melee combatants built for absorbing damage and holding the line.' : 'Ranged specialists focused on dealing damage or supporting allies.'}>
                 <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase inline-block">{activeChar.combatRole}</div>
              </Tooltip>
            </div>
            
            {/* Context: Level, HP, MP */}
            <div className="flex justify-between items-center bg-black/30 rounded px-2 py-1 mb-3">
               <span className="text-[10px] font-mono text-gray-300">LVL <span className="text-white font-bold">{activeChar.level}</span></span>
               <div className="flex gap-3 text-[10px] font-mono">
                  <Tooltip content="Health Points: Proxy is destroyed if this reaches 0."><span className="text-green-400 font-bold">HP {Math.max(0, activeChar.currentHp)}</span></Tooltip>
                  <Tooltip content="Mana Points: Required to cast powerful Spells and Skills."><span className="text-blue-400 font-bold">MP {Math.max(0, activeChar.currentMp)}</span></Tooltip>
               </div>
            </div>

            {/* 8 Stats Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-mono tracking-widest mt-auto">
                <Tooltip content="Physical damage scaling and basic damage mitigation.">
                   <div className="flex justify-between text-gray-400 w-full"><span>PHYS:</span><span className="text-white">{activeChar.stats.current.physicality}</span></div>
                </Tooltip>
                <Tooltip content="Determines maximum Health Points (HP) and Mana Points (MP).">
                   <div className="flex justify-between text-gray-400 w-full"><span>CAPA:</span><span className="text-white">{activeChar.stats.current.capacity}</span></div>
                </Tooltip>
                
                <Tooltip content="Magic damage scaling and debuff application chance.">
                   <div className="flex justify-between text-gray-400 w-full"><span>AUTH:</span><span className="text-white">{activeChar.stats.current.authority}</span></div>
                </Tooltip>
                <Tooltip content="Critical hit chance, dodge rate, and overall luck in encounters.">
                   <div className="flex justify-between text-gray-400 w-full"><span>DEST:</span><span className="text-white">{activeChar.stats.current.destiny}</span></div>
                </Tooltip>
                
                <Tooltip content="Healing power and magic resistance.">
                   <div className="flex justify-between text-gray-400 w-full"><span>SPIR:</span><span className="text-white">{activeChar.stats.current.spirit}</span></div>
                </Tooltip>
                <Tooltip content="Determines turn order speed and action recovery time.">
                   <div className="flex justify-between text-gray-400 w-full"><span>FATE:</span><span className="text-white">{activeChar.stats.current.fate}</span></div>
                </Tooltip>
                
                <Tooltip content="Accuracy, piercing resistance, and tactical advantage in events.">
                   <div className="flex justify-between text-gray-400 w-full"><span>ACUM:</span><span className="text-white">{activeChar.stats.current.acumen}</span></div>
                </Tooltip>
                <Tooltip content="Agility, movement, and evasion.">
                   <div className="flex justify-between text-gray-400 w-full"><span>GRAC:</span><span className="text-white">{activeChar.stats.current.grace}</span></div>
                </Tooltip>
            </div>
         </div>
  
         {/* Center Panel: Abilities */}
         <div className="flex-[1.5] bg-[#1a2c3a]/80 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center gap-4 overflow-x-auto no-scrollbar">
            {activeChar.abilities?.map(abil => (
               <button 
                  key={abil.id}
                  onClick={() => {
                      if (abil.targeting === 'enemy' || abil.targeting === 'ally') {
                          setTargetingAbility(abil);
                      } else if (abil.targeting === 'all_enemies') {
                          processPayload({
                              sourceId: activeChar.instanceId,
                              targetIds: enemies.filter(e => !e.isDead).map(e => e.instanceId),
                              ability: abil
                          });
                      } else if (abil.targeting === 'self') {
                          processPayload({
                              sourceId: activeChar.instanceId,
                              targetIds: [activeChar.instanceId],
                              ability: abil
                          });
                      }
                  }}
                  className="min-w-[80px] h-[100px] bg-gradient-to-b from-gray-700/40 to-black/60 border border-t-white/30 border-b-black/80 border-x-black/30 rounded-lg hover:border-cyan-400 hover:from-cyan-900/40 hover:to-black/80 transition-all flex flex-col justify-between p-2 shadow-inner group"
               >
                  <div className="w-full flex justify-center mb-1">
                     <div className="w-10 h-10 bg-gray-600/50 rounded flex items-center justify-center opacity-80 group-hover:scale-110 group-hover:bg-cyan-600/60 transition-transform">
                        {/* Placeholder Icon */}
                        {abil.baseDamage ? <span className="text-white font-serif">⚔️</span> : abil.baseHeal ? <span className="text-white text-[12px]">🟢</span> : <span className="text-white font-serif">🔥</span>}
                     </div>
                  </div>
                  <div className="text-[9px] text-gray-300 font-sans font-medium text-center leading-tight truncate w-full">
                     {abil.name}
                  </div>
                  <div className="flex justify-center items-center gap-1 mt-1 text-[8px] font-mono text-cyan-200/70">
                     {abil.costMP > 0 && <><span className="text-blue-400 font-bold">{abil.costMP}</span><span className="text-[10px]">💧</span></>}
                  </div>
               </button>
            ))}
            
            {/* Defensive/Item defaults (from concept) */}
            <button className="min-w-[80px] h-[100px] bg-gradient-to-b from-gray-700/40 to-black/60 border border-t-white/30 border-b-black/80 border-x-black/30 rounded-lg hover:border-cyan-400 hover:from-cyan-900/40 hover:to-black/80 transition-all flex flex-col justify-between p-2 shadow-inner group">
                <div className="w-full flex justify-center mb-1">
                    <div className="w-10 h-10 bg-gray-600/50 rounded flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform">
                        <span className="text-white font-serif opacity-50">🛡️</span>
                    </div>
                </div>
                <div className="text-[9px] text-gray-300 font-sans font-medium text-center">Defend</div>
                <div className="flex justify-center items-center gap-1 mt-1 text-[8px] font-mono text-cyan-200/70"></div>
            </button>
            <button className="min-w-[80px] h-[100px] bg-gradient-to-b from-gray-700/40 to-black/60 border border-t-white/30 border-b-black/80 border-x-black/30 rounded-lg hover:border-cyan-400 hover:from-cyan-900/40 hover:to-black/80 transition-all flex flex-col justify-between p-2 shadow-inner group">
                <div className="w-full flex justify-center mb-1">
                    <div className="w-10 h-10 bg-gray-600/50 rounded flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform">
                        <span className="text-white font-serif opacity-50">📦</span>
                    </div>
                </div>
                <div className="text-[9px] text-gray-300 font-sans font-medium text-center">Use Item</div>
                <div className="flex justify-center items-center gap-1 mt-1 text-[8px] font-mono text-cyan-200/70"></div>
            </button>
         </div>
  
         {/* Right Panel: Relics / System */}
         <div className="flex-1 bg-[#1a2c3a]/80 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
            <h3 className="text-sm text-gray-200 tracking-wider mb-2">Relics</h3>
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2">
                {[1, 2, 3, 4].map(idx => (
                    <div key={idx} className="flex gap-2 items-center">
                        <div className="w-6 h-6 border border-white/20 bg-white/5 rounded flex-shrink-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-cyan-400/20 rounded-full" />
                        </div>
                        <div className="flex flex-col flex-1 justify-center">
                            <span className="text-[10px] text-gray-300 font-sans font-medium leading-none">Dummy Relic {idx}</span>
                            <span className="text-[9px] text-gray-500 font-mono">Sector Alpha</span>
                        </div>
                    </div>
                ))}
            </div>
         </div>
         
      </div>
    );
  };
