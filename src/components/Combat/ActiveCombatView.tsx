import { useEffect, useState, memo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useCombatStore } from '../../store/combatStore';
import { useShallow } from 'zustand/react/shallow';
import { EncounterManager } from '../../core/EncounterManager';
import { TimelineBar } from './TimelineBar';
import { CombatGrid } from './CombatGrid';
import { CommandPalette } from './CommandPalette';
import { EffectLayer } from './EffectLayer';
import { Tooltip } from '../UI/Tooltip';
import relicData from '../../data/relics.json';
import backgroundData from '../../data/backgrounds.json';
import { CombatAI } from '../../systems/CombatAI';

interface ActiveCombatViewProps {
    encounterType?: 'combat' | 'elite' | 'boss';
}

const FloatingCombatLog = memo(() => {
    const logs = useCombatStore(s => s.logs);
    return (
        <div className="absolute top-32 left-8 w-64 h-96 overflow-hidden flex flex-col-reverse text-[9px] font-mono gap-1 opacity-50 pointer-events-none z-30">
            {[...logs].reverse().slice(0, 10).map((log, i) => (
                <div key={`${log.id}-${i}`} className={`
                    ${log.type === 'damage' ? 'text-red-400' : ''}
                    ${log.type === 'heal' ? 'text-green-400' : ''}
                    ${log.type === 'god' ? 'text-gold-trim' : ''}
                    ${log.type === 'system' ? 'text-gray-500' : ''}
                `}>
                    &gt; {log.message}
                </div>
            ))}
        </div>
    );
});

export const ActiveCombatView = ({ encounterType = 'combat' }: ActiveCombatViewProps) => {
  const { runData, combatSpeed, setCombatSpeed } = useGameStore(
      useShallow(s => ({ runData: s.runData, combatSpeed: s.combatSpeed, setCombatSpeed: s.setCombatSpeed }))
  );
  const { activeTurnId, initializeCombat } = useCombatStore(
      useShallow(s => ({
          activeTurnId: s.activeTurnId,
          initializeCombat: s.initializeCombat
      }))
  );
  const allyCount = useCombatStore(s => s.allies.length);

  const [targetId, setTargetId] = useState<string | null>(null);

  // Initialize Combat on mount if it's empty
  useEffect(() => {
    if (runData && allyCount === 0) {
      const generatedEnemies = EncounterManager.generateEncounter(encounterType, 'Judgment', 1);
      initializeCombat(runData.activeParty, generatedEnemies);
    }
  }, [runData, allyCount, initializeCombat, encounterType]);

  // Handle rudimentary AI loops when an enemy turn is active
  useEffect(() => {
      if (!activeTurnId) return;
      const state = useCombatStore.getState();
      const activeChar = [...state.allies, ...state.enemies].find(c => c.instanceId === activeTurnId);
      const isEnemyTurn = state.enemies.some(e => e.instanceId === activeTurnId);

      if (isEnemyTurn && activeChar && !activeChar.isDead) {
          // Fake delay for AI
          const timer = setTimeout(() => {
              // Ensure we get the freshest state before deciding
              const freshState = useCombatStore.getState();
              const action = CombatAI.determineEnemyAction(activeChar, freshState.allies, freshState.enemies);
              
              if (action) {
                  freshState.processPayload({
                      sourceId: activeChar.instanceId,
                      targetIds: action.targetIds,
                      ability: action.ability
                  });
              } else {
                  const aliveAllies = freshState.allies.filter(a => !a.isDead);
                  if (aliveAllies.length > 0) {
                      const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)]; // Random target
                      freshState.processPayload({
                          sourceId: activeChar.instanceId,
                          targetIds: [target.instanceId],
                          damage: Math.max(1, activeChar.stats.base.physicality) // Weak AI attack
                      });
                  }
              }
          }, 1500 / (useGameStore.getState().combatSpeed || 1));
          return () => clearTimeout(timer);
      }
  }, [activeTurnId]);


  if (!runData) return null;

  // Determine active background. For now we use the first valid planetary background or fallback to cosmic
  const activeBg = backgroundData.filter(bg => bg.url && bg.url.trim() !== '' && bg.type === 'Planetary')[0]?.url || '/assets/default_galaxy.jpg';

  return (
    <div className="w-full h-full flex flex-col relative z-20 bg-transparent overflow-hidden">
      
      {/* Background Viewport (Constrained to preserve Aspect above HUD) */}
      <div 
          className="absolute top-0 left-0 w-full h-[calc(100%-15.5rem)] bg-cover bg-bottom z-10"
          style={{ backgroundImage: `url(${activeBg})` }}
      >
          {/* Smooth blend shadow into the HUD base */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070a0f] to-transparent pointer-events-none" />
      </div>

      {/* Solid HUD Backdrop layer below the action */}
      <div className="absolute bottom-0 left-0 w-full h-[15.5rem] bg-[#070a0f] border-t border-cyan-900/30 shadow-[0_-15px_30px_rgba(0,255,255,0.03)] z-10" />

      {/* Main Overlay Elements Container */}
      <div className="flex-1 w-full h-full p-6 flex flex-col relative z-20">
          
          {/* HUD Header and Passives */}
          <header className="absolute top-6 left-6 z-40">
            <h2 className="text-xl font-[family-name:var(--font-cinzel-dec)] tracking-widest text-[#B5A18C]/50 mb-3 drop-shadow-md">
              OTARAN PROTOCOL
            </h2>
            
            {/* Top Left Panel: Relics / Systems */}
            <div className="bg-[#1a2c3a]/80 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden pointer-events-auto w-[18rem]">
                <div className="flex gap-4 border-b border-white/10 mb-3 pb-2 text-[10px] tracking-wider font-mono text-gray-400 font-bold">
                    ACTIVE RELICS & BLESSINGS
                </div>
                
                <div className="flex gap-3 min-h-[3rem]">
                    {/* RELICS */}
                    <div className="flex-1 border-r border-white/10 pr-3">
                        <div className="flex flex-wrap gap-2 overflow-y-auto no-scrollbar max-h-24 items-start content-start">
                            {runData?.activeRelics?.map(rId => {
                                const relicInfo = relicData.find(r => r.id === rId);
                                if (!relicInfo) return null;
                                return (
                                    <Tooltip key={rId} content={
                                        <div className="text-left w-48">
                                            <div className="text-amber-400 font-bold mb-1 border-b border-amber-900/50 pb-1">{relicInfo.name}</div>
                                            <div className="text-xs text-slate-300 font-mono">{relicInfo.effect}</div>
                                        </div>
                                    }>
                                        <div 
                                            className="w-8 h-8 rounded border border-amber-600/50 bg-amber-900/40 flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.2)] hover:bg-amber-800/60 transition-colors cursor-help bg-cover bg-center overflow-hidden shrink-0 relative group" 
                                            style={{ backgroundImage: `url(/assets/relics/${rId}.png)` }}
                                        >
                                            <span className="text-amber-400 text-sm drop-shadow-md opacity-80 group-hover:opacity-100 transition-opacity z-10 relative">🏆</span>
                                            <div className="absolute inset-0 bg-black/50 z-0 group-hover:bg-black/30 transition-colors"></div>
                                        </div>
                                    </Tooltip>
                                );
                            })}
                            {(!runData?.activeRelics || runData.activeRelics.length === 0) && (
                                <div className="text-[9px] text-gray-500 font-mono py-1 w-full">
                                    No equipment.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BLESSINGS */}
                    <div className="flex-1 pl-1">
                        <div className="flex flex-wrap gap-2 overflow-y-auto no-scrollbar max-h-24 items-start content-start">
                            {runData?.activeBlessings?.map(bId => {
                                const bName = bId.replace(/_/g, ' ');
                                return (
                                    <Tooltip key={bId} content={
                                        <div className="text-left w-48">
                                            <div className="text-cyan-400 font-bold mb-1 border-b border-cyan-900/50 pb-1">{bName}</div>
                                            <div className="text-[10px] text-cyan-100 font-mono">A divine aura granting passive power.</div>
                                        </div>
                                    }>
                                        <div 
                                            className="w-8 h-8 rounded border border-cyan-600/50 bg-cyan-900/40 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.2)] hover:bg-cyan-800/60 transition-colors cursor-help bg-cover bg-center overflow-hidden shrink-0 relative group" 
                                            style={{ backgroundImage: `url(/assets/blessings/${bId}.png)` }}
                                        >
                                            <span className="text-cyan-400 text-[10px] drop-shadow-md opacity-80 group-hover:opacity-100 transition-opacity z-10 relative">✨</span>
                                            <div className="absolute inset-0 bg-black/50 z-0 group-hover:bg-black/30 transition-colors"></div>
                                        </div>
                                    </Tooltip>
                                );
                            })}
                            {(!runData?.activeBlessings || runData.activeBlessings.length === 0) && (
                                <div className="text-[9px] text-gray-500 font-mono py-1 w-full">
                                    No blessings.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </header>

          {/* Combat Speed Toggle */}
          <div className="absolute top-6 right-6 z-40">
             <button
                onClick={() => {
                   const nextSpeed = combatSpeed === 1 ? 2 : combatSpeed === 2 ? 4 : 1;
                   setCombatSpeed(nextSpeed);
                }}
                className="bg-[#1a2c3a]/80 backdrop-blur-md rounded border border-cyan-400/30 px-3 py-1 font-mono text-xs text-cyan-400 hover:bg-cyan-900/50 hover:text-white transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(0,255,255,0.1)]"
             >
                <span className="opacity-70 tracking-widest">SPEED:</span>
                <span className="font-bold">{combatSpeed}x</span>
             </button>
          </div>

          {/* Global Timeline */}
          <TimelineBar />

          {/* 4v4 Grid Data */}
          <div className="flex-1 flex items-center justify-center">
              <CombatGrid 
                  activeTurnId={activeTurnId} 
                  targetId={targetId}
                  setTargetId={setTargetId}
              />
          </div>

          {/* Control Surface */}
          <CommandPalette />

          {/* Floating Combat Log */}
          <FloatingCombatLog />

          <EffectLayer />
      </div>
    </div>
  );
};
