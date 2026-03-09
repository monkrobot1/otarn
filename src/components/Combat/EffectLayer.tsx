import { useEffect, useState } from 'react';
import { useCombatUIStore } from '../../store/combatUIStore';
import { SpriteAnimator } from '../UI/SpriteAnimator';
import type { ActiveVfx } from '../../store/combatUIStore';

const VfxRenderer = ({ vfx }: { vfx: ActiveVfx }) => {
    const removeVfx = useCombatUIStore(s => s.removeVfx);
    const [style, setStyle] = useState<React.CSSProperties>({ display: 'none' });
    
    useEffect(() => {
        // Calculate geometries upon mount
        const targetNode = document.querySelector(`[data-unit-id="${vfx.targetId}"]`);
        const sourceNode = vfx.sourceId ? document.querySelector(`[data-unit-id="${vfx.sourceId}"]`) : null;
        
        if (!targetNode) {
            removeVfx(vfx.id);
            return;
        }

        const targetRect = targetNode.getBoundingClientRect();
        const effectLayer = document.getElementById('effect-layer-container');
        if (!effectLayer) return;
        const layerRect = effectLayer.getBoundingClientRect();

        const tX = targetRect.left - layerRect.left + (targetRect.width / 2);
        const tY = targetRect.top - layerRect.top + (targetRect.height / 2);

        const finalStyle: React.CSSProperties = {
            position: 'absolute',
            zIndex: 50,
            pointerEvents: 'none'
        };

        if (vfx.type === 'buff' || vfx.type === 'hit') {
            finalStyle.left = `${tX}px`;
            finalStyle.top = `${tY}px`;
            finalStyle.transform = `translate(-50%, -50%) scale(2)`;
        } 
        else if ((vfx.type === 'projectile' || vfx.type === 'beam') && sourceNode) {
            const sourceRect = sourceNode.getBoundingClientRect();
            const sX = sourceRect.left - layerRect.left + (sourceRect.width / 2);
            const sY = sourceRect.top - layerRect.top + (sourceRect.height / 2);

            const distance = Math.hypot(tX - sX, tY - sY);
            const angle = Math.atan2(tY - sY, tX - sX) * (180 / Math.PI);

            if (vfx.type === 'projectile') {
                // Animate from S to T
                finalStyle.left = `${sX}px`;
                finalStyle.top = `${sY}px`;
                finalStyle.transformOrigin = 'center';
                finalStyle.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(2)`;
                finalStyle.transition = `left ${vfx.durationMs}ms linear, top ${vfx.durationMs}ms linear`;
                
                // Trigger CSS transition
                setTimeout(() => {
                    setStyle(prev => ({
                        ...prev,
                        left: `${tX}px`,
                        top: `${tY}px`
                    }));
                }, 50);
            } else if (vfx.type === 'beam') {
                // Stretch to match distance
                finalStyle.left = `${sX}px`;
                finalStyle.top = `${sY}px`;
                finalStyle.width = `${distance}px`;
                finalStyle.height = `100px`;
                finalStyle.transformOrigin = 'center left';
                finalStyle.transform = `translateY(-50%) rotate(${angle}deg)`;
            }
        }

        setStyle(finalStyle);

        const timer = setTimeout(() => {
            removeVfx(vfx.id);
        }, vfx.durationMs + 100);

        return () => clearTimeout(timer);
    }, [vfx]);

    if (style.display === 'none') return null;

    return (
        <div style={style}>
            <div className={vfx.type === 'beam' ? 'w-full h-full' : 'w-48 h-48'}>
                <SpriteAnimator 
                    imageUrl={vfx.spriteUrl}
                    cols={vfx.cols}
                    rows={vfx.rows}
                    totalFrames={vfx.totalFrames}
                    fps={vfx.fps}
                    playing={true}
                    loop={vfx.type === 'beam'}
                    className="w-full h-full"
                    scale={1}
                />
            </div>
        </div>
    );
};

export const EffectLayer = () => {
    const activeVfx = useCombatUIStore(s => s.activeVfx);

    return (
        <div id="effect-layer-container" className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {activeVfx.map(vfx => (
                <VfxRenderer key={vfx.id} vfx={vfx} />
            ))}
        </div>
    );
};
