import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useCombatStore } from '../../store/combatStore';
import { EncounterManager } from '../../core/EncounterManager';
import { TimelineBar } from './TimelineBar';
import { CombatGrid } from './CombatGrid';
import { CommandPalette } from './CommandPalette';
import backgroundData from '../../data/backgrounds.json';

interface ActiveCombatViewProps {
    encounterType?: 'combat' | 'elite' | 'boss';
}

export const ActiveCombatView = ({ encounterType = 'combat' }: ActiveCombatViewProps) => {
  const { runData } = useGameStore();
  const { allies, enemies, activeTurnId, initializeCombat, logs } = useCombatStore();
  const [targetId, setTargetId] = useState<string | null>(null);

  // Initialize Combat on mount if it's empty
  useEffect(() => {
    if (runData && allies.length === 0) {
      const generatedEnemies = EncounterManager.generateEncounter(encounterType, 'Judgment', 1);
      initializeCombat(runData.activeParty, generatedEnemies);
    }
  }, [runData, allies.length, initializeCombat, encounterType]);

  // Handle rudimentary AI loops when an enemy turn is active
  useEffect(() => {
      const activeChar = [...allies, ...enemies].find(c => c.instanceId === activeTurnId);
      const isEnemyTurn = enemies.some(e => e.instanceId === activeTurnId);

      if (isEnemyTurn && activeChar && !activeChar.isDead) {
          // Fake delay for AI
          const timer = setTimeout(() => {
              const aliveAllies = allies.filter(a => !a.isDead);
              if (aliveAllies.length > 0) {
                  const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)]; // Random target
                  useCombatStore.getState().processPayload({
                      sourceId: activeChar.instanceId,
                      targetIds: [target.instanceId],
                      damage: Math.max(1, activeChar.stats.base.physicality) // Weak AI attack
                  });
              }
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, [activeTurnId, allies, enemies]);


  if (!runData) return null;

  // Determine active background. For now we use the first valid planetary background or fallback to cosmic
  const activeBg = backgroundData.filter(bg => bg.url && bg.url.trim() !== '' && bg.type === 'Planetary')[0]?.url || '/assets/default_galaxy.jpg';

  return (
    <div className="w-full h-full flex flex-col relative z-20 bg-black overflow-hidden">
      
      {/* Background Viewport (Constrained to preserve Aspect above HUD) */}
      <div 
          className="absolute top-0 left-0 w-full h-[calc(100%-15.5rem)] bg-cover bg-bottom z-0"
          style={{ backgroundImage: `url(${activeBg})` }}
      >
          {/* Smooth blend shadow into the HUD base */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070a0f] to-transparent pointer-events-none" />
      </div>

      {/* Solid HUD Backdrop layer below the action */}
      <div className="absolute bottom-0 left-0 w-full h-[15.5rem] bg-[#070a0f] border-t border-cyan-900/30 shadow-[0_-15px_30px_rgba(0,255,255,0.03)] z-0" />

      {/* Main Overlay Elements Container */}
      <div className="flex-1 w-full h-full p-6 flex flex-col relative z-20">
          
          {/* HUD Header */}
          <header className="absolute top-6 left-6 z-40">
            <h2 className="text-xl font-light tracking-widest text-[#B5A18C]/50">
              OTARAN PROTOCOL
            </h2>
          </header>

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
          <div className="absolute top-32 left-8 w-64 h-96 overflow-hidden flex flex-col-reverse text-[9px] font-mono gap-1 opacity-50 pointer-events-none">
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

      </div>
    </div>
  );
};
