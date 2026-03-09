import React, { useEffect, useState, useRef } from 'react';
import type { ActiveCharacter } from '../../types/character';
import { useCombatStore } from '../../store/combatStore';
import { useCombatUIStore } from '../../store/combatUIStore';
import { useGameStore } from '../../store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { CharacterFactory } from '../../core/CharacterFactory';
import { createLog } from './perfTestUtils';

interface CombatGridProps {
  activeTurnId: string | null;
  targetId: string | null;
  setTargetId: (id: string | null) => void;
}

import { SpriteAnimator } from '../UI/SpriteAnimator';
import { CharacterSheetOverlay } from '../Shared/CharacterSheetOverlay';
import { PortraitSprite } from '../UI/PortraitSprite';
import { memo } from 'react';

const CharacterSlot = memo(({ 
    unit, 
    isEnemy, 
    isActive, 
    isTargeted, 
    isAttacking,
    onAttackComplete,
    onSelect,
    onRightClick,
    onMouseEnter,
    onMouseLeave,
    projectedDamage
}: { 
    unit: ActiveCharacter | undefined, 
    isEnemy: boolean, 
    isActive: boolean, 
    isTargeted: boolean, 
    isAttacking: boolean,
    onAttackComplete: () => void,
    onSelect: () => void,
    onRightClick: (e: React.MouseEvent) => void,
    onMouseEnter: () => void,
    onMouseLeave: () => void,
    projectedDamage?: number
}) => {
    console.log('--- RENDER CharacterSlot for:', unit?.instanceId);
    // Local state to detect HP changes for VFX
    const prevHpRef = useRef(unit?.currentHp);
    const [isHit, setIsHit] = useState(false);
    const [floatingTexts, setFloatingTexts] = useState<{id: number, val: number}[]>([]);

    useEffect(() => {
        if (unit && prevHpRef.current !== undefined && unit.currentHp !== prevHpRef.current) {
            const diff = unit.currentHp - prevHpRef.current;
            
            if (diff < 0) {
                setIsHit(true);
                setTimeout(() => setIsHit(false), 300);
            }

            const newText = { id: Date.now() + Math.random(), val: diff };
            setFloatingTexts(prev => [...prev, newText]);
            
            setTimeout(() => {
               setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
            }, 1200);
        }
        if (unit) prevHpRef.current = unit.currentHp;
    }, [unit?.currentHp]);

    if (!unit) {
      return (
        <div className="w-32 flex justify-center items-end py-4 opacity-50 h-full">
            <div className="w-24 h-6 rounded-full blur-md bg-white/5 border border-white/10" />
        </div>
      );
    }

    const maxHp = CharacterFactory.calculateMaxHp(unit.stats.base, unit.level);
    const healthPercent = (unit.currentHp / maxHp) * 100;
    const isDead = unit.isDead || unit.currentHp <= 0;

    let projectedHpPercent = 0;
    if (projectedDamage && projectedDamage > 0) {
       projectedHpPercent = (Math.max(0, unit.currentHp - projectedDamage) / maxHp) * 100;
    }

    return (
      <div 
        onClick={() => !isDead && onSelect()}
        onContextMenu={onRightClick}
        onMouseEnter={() => !isDead && onMouseEnter()}
        onMouseLeave={onMouseLeave}
        data-unit-id={unit.instanceId}
        className={`w-32 flex flex-col items-center transition-all duration-200 ease-out cursor-pointer group relative
          ${isDead ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]'}
          ${isActive ? 'drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]' : ''}
          ${isHit ? 'anim-damage' : ''}
        `}
      >
        {/* Floating Text Container */}
        {floatingTexts.map(t => (
            <div key={t.id} className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                <span className={`anim-float-text text-3xl font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] ${t.val < 0 ? 'text-red-500' : 'text-green-400'}`}>
                    {t.val > 0 ? '+' : ''}{t.val}
                </span>
            </div>
        ))}
        
        {/* Overhead Icons Container */}
        <div className="absolute -top-[120px] w-full flex flex-col items-center gap-1.5 z-40 pointer-events-none transition-all duration-300">
            {/* Enemy Intent (Slay the Spire style) - Mocked for now */}
            {isEnemy && !isDead && (
               <div className="flex flex-col items-center bg-black/80 px-3 py-1.5 rounded-xl border-2 border-red-900/50 shadow-[0_0_15px_rgba(0,0,0,0.8)] transform group-hover:scale-110 transition-transform cursor-help pointer-events-auto" title="Intends to Attack">
                   <div className="flex items-center gap-2">
                       <span className="text-red-400 text-2xl drop-shadow-md">⚔️</span>
                       <span className="text-2xl text-red-300 font-bold font-mono drop-shadow">
                          {Math.max(1, unit.stats.base.physicality)}
                       </span>
                   </div>
               </div>
            )}
            
            {/* Active Status Effects */}
            {(unit.buffs.length > 0 || unit.debuffs.length > 0) && (
                <div className="flex flex-wrap justify-center gap-1 pointer-events-auto">
                    {unit.buffs.map((b, i) => (
                        <div key={`buff-${i}`} className="w-4 h-4 bg-green-900/80 border border-green-400 rounded flex items-center justify-center text-[8px] shadow-sm transform hover:scale-125 transition-transform cursor-help overflow-hidden" title={`${b.type} (${b.duration}t)`}>
                            <img src={`/assets/icons/status/${b.type.toLowerCase().replace(' ', '_')}.svg`} alt={b.type} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                    ))}
                    {unit.debuffs.map((d, i) => (
                        <div key={`debuff-${i}`} className="w-4 h-4 bg-red-900/80 border border-red-400 rounded flex items-center justify-center text-[8px] shadow-sm transform hover:scale-125 transition-transform cursor-help overflow-hidden" title={`${d.type} (${d.duration}t)`}>
                            <img src={`/assets/icons/status/${d.type.toLowerCase().replace(' ', '_')}.svg`} alt={d.type} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {/* Dynamic Portrait Sprite */}
        <div className="relative w-32 h-[180px] flex items-end justify-center">
            {/* Ground Shadow / Selection Indicator */}
            <div className={`absolute bottom-0 w-24 h-6 rounded-full blur-sm -z-10 transition-colors duration-300
                ${isTargeted ? 'bg-yellow-400/60 animate-pulse' : (isActive ? 'bg-cyan-400/50' : 'bg-black/60')}
                ${isEnemy && isTargeted ? 'bg-red-500/60' : ''}
            `} />

            {/* Selection Ring (instead of card border) */}
            {isActive && (
                <div className="absolute -bottom-2 w-28 h-10 rounded-full border-2 border-cyan-400 z-0 animate-pulse" />
            )}
            {isTargeted && (
                <div className={`absolute -bottom-2 w-28 h-10 rounded-full border border-dashed z-0 animate-[spin_4s_linear_infinite]
                  ${isEnemy ? 'border-red-500' : 'border-yellow-400'}
                `} />
            )}

            {/* Dynamic Portrait Sprite */}
            {(() => {
                const manifest = unit.spriteManifest;
                let currentAnim = manifest?.idle;
                let loop = true;
                const playing = true;
                let onAnimComplete = undefined;

                if (isAttacking && manifest?.default_attack) {
                    currentAnim = manifest.default_attack;
                    loop = false;
                    onAnimComplete = onAttackComplete;
                } else if (isHit && manifest?.take_damage) {
                    currentAnim = manifest.take_damage;
                    loop = false;
                } else if (isDead && manifest?.death) {
                    currentAnim = manifest.death;
                    loop = false;
                }

                if (currentAnim) {
                    return (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 h-[220px] flex items-end justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] pointer-events-none">
                            <SpriteAnimator 
                                imageUrl={currentAnim.url} 
                                cols={currentAnim.cols} 
                                rows={currentAnim.rows} 
                                totalFrames={currentAnim.totalFrames}
                                fps={currentAnim.fps || 30}
                                playing={playing}
                                loop={loop}
                                onComplete={onAnimComplete}
                                className="h-[220px] w-auto"
                                mirrored={isEnemy}
                                scale={1.2}
                                randomStartOffset={loop}
                            />
                        </div>
                    );
                }

                // Fallback to old spriteSheet or portrait
                if (isAttacking) {
                    return (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 h-[220px] flex items-end justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] pointer-events-none">
                            <SpriteAnimator 
                                imageUrl={unit.spriteSheet?.url || "/assets/test_sprite_sheet.png"} 
                                cols={unit.spriteSheet?.cols || 10} 
                                rows={unit.spriteSheet?.rows || 10} 
                                totalFrames={unit.spriteSheet?.totalFrames || 100}
                                fps={30}
                                playing={true}
                                loop={false}
                                onComplete={onAttackComplete}
                                className="h-[220px] w-auto"
                                mirrored={isEnemy}
                                scale={1.2}
                            />
                        </div>
                    );
                }

                if (unit.spriteSheet) {
                    return (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 h-[220px] flex items-end justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] pointer-events-none">
                            <SpriteAnimator 
                                imageUrl={unit.spriteSheet.url} 
                                cols={unit.spriteSheet.cols} 
                                rows={unit.spriteSheet.rows} 
                                totalFrames={unit.spriteSheet.totalFrames}
                                fps={30}
                                playing={false}
                                className="h-[220px] w-auto"
                                mirrored={isEnemy}
                                scale={1.2}
                            />
                        </div>
                    );
                }

                return (
                    <PortraitSprite 
                        baseId={unit.baseId} 
                        className={`w-full h-full relative z-10 mx-auto
                            ${isEnemy ? 'scale-x-[-1] grayscale-[30%]' : ''} 
                        `} 
                    />
                );
            })()}

            {isTargeted && <div className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay pointer-events-none animate-pulse z-20" />}
            
            {/* Bottom Vitals and Name Plate */}
            <div className="absolute top-[185px] flex flex-col items-center w-full z-30 gap-1 pointer-events-none">
               <span className="text-[9px] font-mono tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] bg-black/80 px-2 py-0.5 rounded w-[66%] text-center truncate border border-white/5 mx-auto">
                 {unit.name}
               </span>
               
               {/* Vitals Container */}
               <div className="flex flex-col gap-[2px] w-[80%] mx-auto mt-1 opacity-90 drop-shadow-md">
                   {/* HP Bar */}
                   <div className="h-[8px] w-full bg-black/80 overflow-hidden border border-white/20 relative" title={`HP: ${unit.currentHp}`}>
                     {/* Base HP */}
                     <div 
                       className={`h-full ${isEnemy ? 'bg-red-500' : 'bg-green-400'} transition-all duration-300 absolute left-0 top-0`}
                       style={{ width: `${Math.max(0, Math.min(100, healthPercent))}%` }}
                     />
                     {/* Projected Damage Preview */}
                     {(projectedDamage ?? 0) > 0 && !isDead && (
                        <div 
                          className="h-full bg-red-100 animate-pulse transition-all duration-300 absolute top-0 overflow-visible flex items-center justify-end z-10"
                          style={{ 
                            left: `${Math.max(0, Math.min(100, projectedHpPercent))}%`, 
                            width: `${Math.max(0, Math.min(100, healthPercent - projectedHpPercent))}%` 
                          }}
                        >
                            <span className="absolute -top-[14px] right-0 text-[11px] text-white font-mono font-bold drop-shadow-[0_0_3px_rgba(255,0,0,1)] whitespace-nowrap">
                                -{projectedDamage}
                            </span>
                        </div>
                     )}
                   </div>
                   
                   {/* MP Bar */}
                   <div className="h-[4px] w-full bg-black/80 overflow-hidden border border-white/20" title={`MP: ${unit.currentMp}`}>
                     <div 
                       className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_4px_rgba(59,130,246,0.6)]"
                       style={{ width: `${Math.max(0, Math.min(100, (unit.currentMp / (unit.stats.base.capacity * 10 + 5)) * 100))}%` }} 
                     />
                   </div>

                   {/* Revelation Bar (Limit Break Equivalent) */}
                   <div className="h-[4px] w-full bg-black/80 overflow-hidden border border-white/20" title={`Revelation: ${unit.currentRevelation || 0}%`}>
                     <div 
                       className="h-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.8)] transition-all duration-300"
                       style={{ width: `${Math.max(0, Math.min(100, unit.currentRevelation || 0))}%` }} 
                     />
                   </div>
               </div>
            </div>
            
        </div>
      </div>
    );
}, (prev, next) => {
    return prev.unit?.instanceId === next.unit?.instanceId &&
           prev.unit?.currentHp === next.unit?.currentHp &&
           prev.unit?.currentMp === next.unit?.currentMp &&
           prev.unit?.currentRevelation === next.unit?.currentRevelation &&
           prev.isEnemy === next.isEnemy &&
           prev.isActive === next.isActive &&
           prev.isTargeted === next.isTargeted &&
           prev.isAttacking === next.isAttacking &&
           prev.projectedDamage === next.projectedDamage &&
           prev.unit?.buffs.length === next.unit?.buffs.length &&
           prev.unit?.debuffs.length === next.unit?.debuffs.length &&
           prev.unit?.isDead === next.unit?.isDead;
});

// We define exact deployment slots 
// Later when saving/loading rosters, units will be bound to exact slot IDs.
const CONST_SLOTS = [0, 1, 2, 3];

const EnemyIntentsOverlay = memo(({ slotPositions }: { slotPositions: Record<string, {x: number, y: number}> }) => {
    // We compute intents and return an array of strings like "sourceId:targetId"
    // useShallow will prevent re-renders unless the actual intent strings change.
    const intentStrings = useCombatStore(useShallow(s => {
        const intents: string[] = [];
        const aliveAllies = s.allies.filter(a => !a.isDead);
        const aliveEnemies = s.enemies.filter(e => !e.isDead);

        if (aliveAllies.length > 0) {
            aliveEnemies.forEach((enemy, index) => {
                const targetIndex = (enemy.name.length + index) % aliveAllies.length;
                intents.push(`${enemy.instanceId}:${aliveAllies[targetIndex].instanceId}`);
            });
        }
        return intents;
    }));

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
        <style>{`
          @keyframes intent-flow {
            from { stroke-dashoffset: 16; }
            to { stroke-dashoffset: 0; }
          }
          .anim-intent {
            animation: intent-flow 0.8s linear infinite;
          }
        `}</style>
        {intentStrings.map((intentStr, idx) => {
           const [sourceId, targetId] = intentStr.split(':');
           const start = slotPositions[sourceId];
           const end = slotPositions[targetId];
           if (!start || !end) return null;
           
           const cpX = (start.x + end.x) / 2;
           const xDistance = Math.abs(start.x - end.x);
           const cpY = Math.min(start.y, end.y) - 80 - xDistance * 0.15;
           
           return (
             <g key={intentStr}>
                <path 
                   d={`M ${start.x} ${start.y} Q ${cpX} ${cpY} ${end.x} ${end.y}`} 
                   fill="none" 
                   stroke="rgba(255, 60, 60, 0.4)" 
                   strokeWidth="3" 
                   strokeDasharray="8,8"
                   className="anim-intent"
                   style={{ animationDelay: `-${idx * 0.15}s` }}
                />
                <g transform={`translate(${end.x}, ${end.y})`}>
                   <polygon 
                     points="-12,-7 0,0 -12,7" 
                     fill="rgba(255, 60, 60, 0.8)"
                     transform={`rotate(${Math.atan2(end.y - cpY, end.x - cpX) * 180 / Math.PI})`}
                   />
                </g>
             </g>
           )
        })}
      </svg>
    );
});

const CharacterSlotWrapper = memo(({ 
    slotIdx, 
    isEnemy, 
    activeTurnId, 
    targetId, 
    setTargetId, 
    attackingId, 
    setAttackingId, 
    setSheetUnit 
}: { 
    slotIdx: number, 
    isEnemy: boolean, 
    activeTurnId: string | null, 
    targetId: string | null, 
    setTargetId: (id: string | null) => void,
    attackingId: string | null,
    setAttackingId: (id: string | null) => void,
    setSheetUnit: (unit: ActiveCharacter | null) => void
}) => {
    const pLog = createLog('CharacterSlotWrapper');
    // React optimally caches this lookup without deep compares as long as unit object reference is unchanged
    const unit = useCombatStore(s => isEnemy ? s.enemies[slotIdx] : s.allies[slotIdx]);
    pLog.check('unit fetch');
    
    const { targetingAbility, setTargetingAbility, setHoveredTargetId } = useCombatUIStore(
        useShallow(s => ({
            targetingAbility: s.targetingAbility,
            setTargetingAbility: s.setTargetingAbility,
            setHoveredTargetId: s.setHoveredTargetId
        }))
    );
    pLog.check('ui store setup');

    const handleMouseEnter = () => setHoveredTargetId(unit?.instanceId || null);
    const handleMouseLeave = () => setHoveredTargetId(null);
    const completeAttack = React.useCallback(() => setAttackingId(null), [setAttackingId]);
    const handleRightClick = (e: React.MouseEvent) => {
        if (unit && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            setSheetUnit(unit);
        }
    };

    const handleSlotSelect = () => {
        if (!unit || unit.isDead) return;
        const state = useCombatStore.getState();
        const sourceChar = [...state.allies, ...state.enemies].find(c => c.instanceId === activeTurnId);

        if (targetingAbility && sourceChar) {
            const isEnemyUnit = state.enemies.some(e => e.instanceId === unit.instanceId);
            let isValidTarget = 
              (targetingAbility.targeting === 'enemy' && isEnemyUnit) || 
              (targetingAbility.targeting === 'ally' && !isEnemyUnit) ||
              (targetingAbility.targeting === 'all_enemies' && isEnemyUnit) ||
              (targetingAbility.targeting === 'self' && unit.instanceId === sourceChar.instanceId);

            if (isValidTarget && targetingAbility.targeting === 'enemy' && isEnemyUnit && targetingAbility.vfxType === 'hit') {
                if (unit.combatRole === 'Backline') {
                    const hasFrontline = state.enemies.some(e => !e.isDead && (e.combatRole === 'Frontline' || e.combatRole === 'Boss'));
                    if (hasFrontline) isValidTarget = false;
                }
            }

            if (isValidTarget) {
                setAttackingId(sourceChar.instanceId);
                let processedTargetIds = [unit.instanceId];
                if (targetingAbility.targeting === 'all_enemies') {
                    processedTargetIds = state.enemies.filter(e => !e.isDead).map(e => e.instanceId);
                } else if (targetingAbility.targeting === 'all_allies') {
                    processedTargetIds = state.allies.filter(a => !a.isDead).map(a => a.instanceId);
                }
                
                state.processPayload({
                    sourceId: sourceChar.instanceId,
                    targetIds: processedTargetIds,
                    ability: targetingAbility
                });
                setTargetingAbility(null);
            } else {
                setTargetId(unit.instanceId);
            }
        } else {
            setTargetId(unit.instanceId);
        }
    };

    let projectedDamage = 0;
    let isTargeted = Boolean(unit?.instanceId === targetId);
    pLog.check('target evaluation');

    if (unit && !unit.isDead && targetingAbility) {
        const state = useCombatStore.getState();
        let isValidTarget = ((targetingAbility.targeting === 'enemy' && isEnemy) || (targetingAbility.targeting === 'ally' && !isEnemy) || (targetingAbility.targeting === 'all_enemies' && isEnemy) || (targetingAbility.targeting === 'self' && !isEnemy && unit.instanceId === activeTurnId));
        
        if (isValidTarget && targetingAbility.targeting === 'enemy' && isEnemy && targetingAbility.vfxType === 'hit') {
            if (unit.combatRole === 'Backline') {
                const hasFrontline = state.enemies.some(e => !e.isDead && (e.combatRole === 'Frontline' || e.combatRole === 'Boss'));
                if (hasFrontline) isValidTarget = false;
            }
        }
        
        if (isValidTarget) {
            isTargeted = true;
            const sourceChar = [...state.allies, ...state.enemies].find(c => c.instanceId === activeTurnId);
            if (sourceChar && targetingAbility.hits) {
                const mitigation = isEnemy ? Math.max(1, unit.stats.base.physicality || 1) : 1; 
                let sourcePotency = sourceChar.stats.current.physicality || 10;
                if (!isEnemy && sourcePotency > 0) {
                    if (targetingAbility.id.includes('_ULT')) sourcePotency *= 100;
                    const activeRelics = useGameStore.getState().runData?.activeRelics || [];
                    if (activeRelics.includes('REL_DEFAULT')) sourcePotency *= 1.2;
                }
                const baseHitDmg = Math.floor((sourcePotency * targetingAbility.hits.reduce((a: number, h: any)=>a+h.multiplier, 0)) / mitigation);
                projectedDamage = baseHitDmg;
            }
        }
    }
    pLog.check('damage evaluation');

    return (
        <CharacterSlot 
            unit={unit} 
            isEnemy={isEnemy} 
            isActive={unit?.instanceId === activeTurnId} 
            isTargeted={isTargeted} 
            isAttacking={unit?.instanceId === attackingId}
            onAttackComplete={completeAttack}
            onSelect={handleSlotSelect} 
            onRightClick={handleRightClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            projectedDamage={projectedDamage}
        />
    );
});

export const CombatGrid = ({ activeTurnId, targetId, setTargetId }: CombatGridProps) => {
  console.log('--- RENDER CombatGrid');
  
  // Minimal dependency bindings. We only need array lengths to know when to recalculate positions.
  const allyCount = useCombatStore(s => s.allies.length);
  const enemyCount = useCombatStore(s => s.enemies.length);

  const [attackingId, setAttackingId] = useState<string | null>(null);
  const [sheetUnit, setSheetUnit] = useState<ActiveCharacter | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [slotPositions, setSlotPositions] = useState<Record<string, {x: number, y: number}>>({});

  const updatePositions = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPositions: Record<string, {x: number, y: number}> = {};
      
      const slots = containerRef.current.querySelectorAll('[data-unit-id]');
      slots.forEach(slot => {
          const id = slot.getAttribute('data-unit-id');
          const rect = slot.getBoundingClientRect();
          if (id) {
              newPositions[id] = {
                  x: rect.left - containerRect.left + rect.width / 2,
                  y: rect.top - containerRect.top + 60 
              };
          }
      });
      setSlotPositions(newPositions);
  };

  useEffect(() => {
      updatePositions();
      const timeoutId = setTimeout(updatePositions, 100);
      window.addEventListener('resize', updatePositions);
      return () => {
          clearTimeout(timeoutId);
          window.removeEventListener('resize', updatePositions);
      };
  }, [allyCount, enemyCount]);

  return (
    <div ref={containerRef} className="flex justify-center items-end w-full gap-8 px-8 mt-auto mb-16 max-w-7xl mx-auto h-[350px] relative">
      
      <EnemyIntentsOverlay slotPositions={slotPositions} />

      {/* Ally Side (Left) */}
      <div className="flex gap-4 items-end h-full z-20">
         {CONST_SLOTS.map(slotIdx => {
             return (
                 <div key={`ally-slot-${slotIdx}`} className="flex flex-col items-center justify-end h-full">
                     <CharacterSlotWrapper 
                         slotIdx={slotIdx} 
                         isEnemy={false} 
                         activeTurnId={activeTurnId} 
                         targetId={targetId} 
                         setTargetId={setTargetId}
                         attackingId={attackingId}
                         setAttackingId={setAttackingId}
                         setSheetUnit={setSheetUnit}
                     />
                 </div>
             );
         })}
      </div>

      <div className="w-px h-64 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent mx-8 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)] shrink-0 z-20" />

      {/* Enemy Side (Right) */}
      <div className="flex gap-4 items-end h-full z-20">
         {CONST_SLOTS.map(slotIdx => {
             return (
                 <div key={`enemy-slot-${slotIdx}`} className="flex flex-col items-center justify-end h-full">
                     <CharacterSlotWrapper 
                         slotIdx={slotIdx} 
                         isEnemy={true} 
                         activeTurnId={activeTurnId} 
                         targetId={targetId} 
                         setTargetId={setTargetId}
                         attackingId={attackingId}
                         setAttackingId={setAttackingId}
                         setSheetUnit={setSheetUnit}
                     />
                 </div>
             );
         })}
      </div>
      
      {/* Character Sheet Overlay */}
      {sheetUnit && (
        <CharacterSheetOverlay unit={sheetUnit} onClose={() => setSheetUnit(null)} />
      )}

    </div>
  );
};
