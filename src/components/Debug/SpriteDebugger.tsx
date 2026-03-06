import { useState, useRef, useEffect, useMemo } from 'react';
import characterData from '../../data/characters.json';
import enemyData from '../../data/enemies.json';

export const SpriteDebugger = ({ onClose }: { onClose: () => void }) => {
    const [imageUrl, setImageUrl] = useState('/assets/death_knight_attack_two_handed_death_knight_melee_attack.webp');
    const [cols, setCols] = useState(10);
    const [rows, setRows] = useState(8);
    const [totalFrames, setTotalFrames] = useState(76);
    const [fps, setFps] = useState(12);
    
    // Fine-tuning offsets (in percentages of the container)
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);

    // Zoom and Scale
    const [scale, setScale] = useState(1);
    
    // Animation State
    const [playing, setPlaying] = useState(true);
    const [currentFrame, setCurrentFrame] = useState(0);
    const intervalRef = useRef<number | null>(null);

    const allSprites = useMemo(() => {
        return [...(characterData as any[]), ...(enemyData as any[])].flatMap(entity => {
            if (!entity.spriteManifest) return [];
            return Object.entries(entity.spriteManifest).map(([animName, animData]: [string, any]) => {
                if (!animData || !animData.url) return null;
                return {
                    id: `${entity.id}_${animName}`,
                    label: `${entity.name} - ${animName.replace('_', ' ').toUpperCase()}`,
                    url: animData.url,
                    cols: animData.cols,
                    rows: animData.rows,
                    totalFrames: animData.totalFrames,
                    fps: animData.fps
                };
            }).filter(Boolean);
        });
    }, []);

    const handleSelectSprite = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = allSprites.find(s => s && s.id === e.target.value);
        if (selected) {
            setImageUrl(selected.url);
            setCols(selected.cols || 10);
            setRows(selected.rows || 10);
            setTotalFrames(selected.totalFrames || 100);
            setFps(selected.fps || 12);
            setCurrentFrame(0);
        }
    };

    useEffect(() => {
        if (!playing) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        const intervalTime = 1000 / fps;
        intervalRef.current = window.setInterval(() => {
            setCurrentFrame(prev => (prev + 1) % totalFrames);
        }, intervalTime);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [playing, fps, totalFrames]);

    const col = currentFrame % cols;
    const row = Math.floor(currentFrame / cols);

    return (
        <div className="w-full h-full bg-slate-900/90 flex p-6 gap-6 absolute inset-0 z-50 overflow-y-auto backdrop-blur-md text-white font-mono">
            {/* Left Panel: Controls */}
            <div className="w-96 flex flex-col gap-4 border-r border-slate-700 pr-6 shrink-0">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <h2 className="text-xl text-cyan-400">Sprite Debugger</h2>
                    <button onClick={onClose} className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded">Close</button>
                </div>

                <div className="flex flex-col gap-2 mb-2">
                    <label className="text-xs text-cyan-400">Quick Select Character Sprite</label>
                    <select 
                        onChange={handleSelectSprite}
                        className="bg-black/50 border border-cyan-800 focus:border-cyan-500 px-2 py-2 text-sm rounded text-white outline-none cursor-pointer"
                        defaultValue=""
                    >
                        <option value="" disabled>-- Choose an uploaded sprite --</option>
                        {allSprites.map(sprite => sprite && (
                            <option key={sprite.id} value={sprite.id}>
                                {sprite.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400">Image URL (Manual Override)</label>
                    <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="bg-black/50 border border-slate-600 px-2 py-1 text-sm rounded" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-400">Columns</label>
                        <input type="number" value={cols} onChange={e => setCols(Number(e.target.value))} className="bg-black/50 border border-slate-600 px-2 py-1 text-sm rounded" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-400">Rows</label>
                        <input type="number" value={rows} onChange={e => setRows(Number(e.target.value))} className="bg-black/50 border border-slate-600 px-2 py-1 text-sm rounded" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-400">Total Frames</label>
                        <input type="number" value={totalFrames} onChange={e => setTotalFrames(Number(e.target.value))} className="bg-black/50 border border-slate-600 px-2 py-1 text-sm rounded" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-400">FPS</label>
                        <input type="number" value={fps} onChange={e => setFps(Number(e.target.value))} className="bg-black/50 border border-slate-600 px-2 py-1 text-sm rounded" />
                    </div>
                </div>

                <div className="border-t border-slate-700 pt-4 mt-2 flex flex-col gap-4">
                    <h3 className="text-sm text-gold-trim">Fine-Tuning Offsets</h3>
                    <p className="text-xs text-slate-400 leading-tight">Adjust if the frame doesn't map perfectly to the grid edges due to sheet margins.</p>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-400">Offset X (%) - moves camera left/right</label>
                        <input type="range" min="-10" max="10" step="0.1" value={offsetX} onChange={e => setOffsetX(Number(e.target.value))} className="w-full" />
                        <div className="text-xs text-right">{offsetX}%</div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-400">Offset Y (%) - moves camera up/down</label>
                        <input type="range" min="-10" max="10" step="0.1" value={offsetY} onChange={e => setOffsetY(Number(e.target.value))} className="w-full" />
                        <div className="text-xs text-right">{offsetY}%</div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-400">Zoom Scale</label>
                        <input type="range" min="0.5" max="3" step="0.1" value={scale} onChange={e => setScale(Number(e.target.value))} className="w-full" />
                        <div className="text-xs text-right">{scale}x</div>
                    </div>
                </div>

                <div className="border-t border-slate-700 pt-4 mt-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Playback</span>
                        <button onClick={() => setPlaying(!playing)} className="px-4 py-1 bg-cyan-600/30 border border-cyan-500 rounded hover:bg-cyan-500/50">
                            {playing ? 'Pause' : 'Play'}
                        </button>
                    </div>
                    <div className="text-xs text-slate-400">
                        Frame: {currentFrame} / {totalFrames - 1} <br/>
                        Grid Pos: {col}, {row}
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                        <label className="text-xs text-slate-400">Manual Seek</label>
                        <input type="range" min="0" max={totalFrames - 1} value={currentFrame} onChange={e => { setPlaying(false); setCurrentFrame(Number(e.target.value)); }} className="w-full" />
                    </div>
                </div>
            </div>

            {/* Right Panel: Visualization */}
            <div className="flex-1 flex flex-col gap-6">
                
                {/* Visualizer Row 1: The isolated frame */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm text-slate-400">Isolated Frame Output</h3>
                    <div className="bg-black w-64 h-64 border border-slate-600 relative overflow-hidden flex items-center justify-center checkerboard-bg">
                        {/* The actual isolation logic mirroring SpriteAnimator but expanded with offsets */}
                        <div 
                            className="w-full h-full relative"
                            style={{
                                transform: `scale(${scale})`,
                            }}
                        >
                            <img 
                                src={imageUrl}
                                className="absolute pointer-events-none"
                                style={{
                                    top: 0,
                                    left: 0,
                                    width: `${cols * 100}%`,
                                    height: `${rows * 100}%`,
                                    maxWidth: 'none',
                                    // Base translation based on grid + manual fine tuning offset
                                    transform: `translate(calc(-${(col / cols) * 100}% + ${offsetX}%), calc(-${(row / rows) * 100}% + ${offsetY}%))`,
                                    mixBlendMode: 'screen', // Removing the black background for testing
                                }}
                            />
                        </div>
                        {/* Crosshair Overlay */}
                        <div className="absolute inset-x-0 top-1/2 h-px bg-red-500/50 pointer-events-none border-dashed border-red-500" />
                        <div className="absolute inset-y-0 left-1/2 w-px bg-red-500/50 pointer-events-none border-dashed border-red-500" />
                    </div>
                </div>

                {/* Visualizer Row 2: The Raw Sheet Grid */}
                <div className="flex flex-col gap-2 flex-1">
                    <h3 className="text-sm text-slate-400">Raw Sheet Grid Overlay</h3>
                    <div className="relative overflow-auto border border-slate-700 bg-black flex-1 items-start justify-start flex">
                        <div className="relative inline-block" style={{ width: '800px' }}>
                            <img src={imageUrl} className="w-full block" alt="Raw Sheet" />
                            
                            {/* Grid Overlay */}
                            <div className="absolute inset-0 pointer-events-none flex flex-wrap">
                                {Array.from({ length: rows * cols }).map((_, i) => {
                                    const isCurrent = i === currentFrame;
                                    return (
                                        <div 
                                            key={i} 
                                            className={`border border-white/20 relative ${isCurrent ? 'bg-cyan-500/30 border-cyan-400 z-10' : ''}`}
                                            style={{
                                                width: `${100 / cols}%`,
                                                height: `${100 / rows}%`,
                                            }}
                                        >
                                            <span className="absolute top-1 left-1 text-[8px] bg-black/50 px-1">{i}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                .checkerboard-bg {
                    background-image: linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                }
            `}</style>
        </div>
    );
};
