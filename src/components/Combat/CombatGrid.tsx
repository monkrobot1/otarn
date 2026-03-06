import { useEffect, useState, useRef } from 'react';
import type { ActiveCharacter } from '../../types/character';
import { useCombatStore } from '../../store/combatStore';
import { CharacterFactory } from '../../core/CharacterFactory';

interface CombatGridProps {
  activeTurnId: string | null;
  targetId: string | null;
  setTargetId: (id: string | null) => void;
}

import { SpriteAnimator } from '../UI/SpriteAnimator';
import { CharacterSheetOverlay } from '../Shared/CharacterSheetOverlay';

const CharacterSlot = ({ 
    unit, 
    isEnemy, 
    isActive, 
    isTargeted, 
    isAttacking,
    onAttackComplete,
    onSelect,
    onRightClick
}: { 
    unit: ActiveCharacter | undefined, 
    isEnemy: boolean, 
    isActive: boolean, 
    isTargeted: boolean, 
    isAttacking: boolean,
    onAttackComplete: () => void,
    onSelect: () => void,
    onRightClick: (e: React.MouseEvent) => void
}) => {
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

    const healthPercent = (unit.currentHp / CharacterFactory.calculateMaxHp(unit.stats.base, unit.level)) * 100;
    const isDead = unit.isDead || unit.currentHp <= 0;

    return (
      <div 
        onClick={() => !isDead && onSelect()}
        onContextMenu={onRightClick}
        className={`w-32 flex flex-col items-center transition-all cursor-pointer group relative
          ${isDead ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:-translate-y-2'}
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
                let playing = true;
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
                    <img 
                        src={unit.portraitUrl} 
                        alt={unit.name} 
                        className={`w-full h-full object-contain object-bottom relative z-10 
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
               <div className="flex flex-col gap-[2px] w-[66%] mx-auto mt-1 opacity-90 drop-shadow-md">
                   {/* HP Bar */}
                   <div className="h-[4px] w-full bg-black/80 overflow-hidden border border-white/20" title={`HP: ${unit.currentHp}`}>
                     <div 
                       className={`h-full ${isEnemy ? 'bg-red-500' : 'bg-green-400'} transition-all duration-300`}
                       style={{ width: `${Math.max(0, Math.min(100, healthPercent))}%` }}
                     />
                   </div>
                   
                   {/* MP Bar */}
                   <div className="h-[2px] w-full bg-black/80 overflow-hidden border border-white/20" title={`MP: ${unit.currentMp}`}>
                     <div 
                       className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_4px_rgba(59,130,246,0.6)]"
                       style={{ width: `${Math.max(0, Math.min(100, (unit.currentMp / (unit.stats.base.capacity * 10 + 5)) * 100))}%` }} 
                     />
                   </div>

                   {/* Revelation Bar (Limit Break Equivalent) */}
                   <div className="h-[2px] w-full bg-black/80 overflow-hidden border border-white/20" title={`Revelation: ${unit.currentRevelation || 0}%`}>
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
};

// We define exact deployment slots 
// Later when saving/loading rosters, units will be bound to exact slot IDs.
const CONST_SLOTS = [0, 1, 2, 3];

export const CombatGrid = ({ activeTurnId, targetId, setTargetId }: CombatGridProps) => {
  const { allies, enemies, targetingAbility, processPayload, setTargetingAbility } = useCombatStore();
  const [attackingId, setAttackingId] = useState<string | null>(null);
  const [sheetUnit, setSheetUnit] = useState<ActiveCharacter | null>(null);

  const handleSlotSelect = (unit: ActiveCharacter) => {
      if (unit.isDead) return;
      
      const sourceChar = [...allies, ...enemies].find(c => c.instanceId === activeTurnId);

      if (targetingAbility && sourceChar) {
          const isEnemy = enemies.some(e => e.instanceId === unit.instanceId);
          const isValidTarget = 
              (targetingAbility.targeting === 'enemy' && isEnemy) || 
              (targetingAbility.targeting === 'ally' && !isEnemy) ||
              (targetingAbility.targeting === 'self' && unit.instanceId === sourceChar.instanceId);

          if (isValidTarget) {
              setAttackingId(sourceChar.instanceId);
              processPayload({
                  sourceId: sourceChar.instanceId,
                  targetIds: [unit.instanceId],
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

  const renderSlot = (unit: ActiveCharacter | undefined, isEnemy: boolean) => {
    return (
        <CharacterSlot 
            unit={unit} 
            isEnemy={isEnemy} 
            isActive={unit?.instanceId === activeTurnId} 
            isTargeted={Boolean(unit?.instanceId === targetId || (targetingAbility && unit && !unit.isDead && ((targetingAbility.targeting === 'enemy' && isEnemy) || (targetingAbility.targeting === 'ally' && !isEnemy))))} 
            isAttacking={unit?.instanceId === attackingId}
            onAttackComplete={() => setAttackingId(null)}
            onSelect={() => {
                if (unit) handleSlotSelect(unit);
            }} 
            onRightClick={(e) => {
                if (e.metaKey || e.ctrlKey) {
                    e.preventDefault();
                    if (unit) setSheetUnit(unit);
                }
            }}
        />
    );
  };

  return (
    <div className="flex justify-center items-end w-full gap-8 px-8 mt-auto mb-16 max-w-7xl mx-auto h-[350px]">
      
      {/* Ally Side (Left) */}
      <div className="flex gap-4 items-end h-full">
         {CONST_SLOTS.map(slotIdx => {
             const ally = allies[slotIdx];
             return (
                 <div key={`ally-slot-${slotIdx}`} className="flex flex-col items-center justify-end h-full">
                     {renderSlot(ally, false)}
                 </div>
             );
         })}
      </div>

      <div className="w-px h-64 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent mx-8 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)] shrink-0" />

      {/* Enemy Side (Right) */}
      <div className="flex gap-4 items-end h-full">
         {CONST_SLOTS.map(slotIdx => {
             const enemy = enemies[slotIdx];
             return (
                 <div key={`enemy-slot-${slotIdx}`} className="flex flex-col items-center justify-end h-full">
                     {renderSlot(enemy, true)}
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
