import { useState, useEffect } from 'react';
import characterData from '../../data/characters.json';
import enemyData from '../../data/enemies.json';
import relicData from '../../data/relics.json';
import backgroundData from '../../data/backgrounds.json';
import { SpriteAnimator } from '../UI/SpriteAnimator';
import type { SpriteManifest, SpriteAnimation } from '../../types/character';

type AssetType = 'characters' | 'enemies' | 'relics' | 'backgrounds';

export const AssetEditor = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<AssetType>('characters');
  
  const [characters, setCharacters] = useState<any[]>(characterData);
  const [enemies, setEnemies] = useState<any[]>(enemyData);
  const [relics, setRelics] = useState<any[]>(relicData);
  const [backgrounds, setBackgrounds] = useState<any[]>(backgroundData);

  const addNewAsset = () => {
    const newId = `NEW_${activeTab.toUpperCase()}_${Date.now()}`;
    const newName = `New ${activeTab.slice(0, -1)}`;
    let newAsset: any = { id: newId, name: newName };

    if (activeTab === 'characters' || activeTab === 'enemies') {
      newAsset = {
        ...newAsset,
        classRole: 'Frontline',
        race: 'Null-Forged',
        sector: 'Judgment',
        stats: { physicality: 10, authority: 10, grace: 10, acumen: 10, spirit: 10, fate: 10, capacity: 10, destiny: 10 },
        spriteManifest: { idle: { name: 'idle', url: '', cols: 1, rows: 1, totalFrames: 1, fps: 12, loop: true } }
      };
    } else if (activeTab === 'relics') {
      newAsset = {
        ...newAsset,
        sector: 'Universal',
        tier: 'Fractured',
        effect: 'New relic effect description...',
        color: '#9CA3AF'
      };
    } else if (activeTab === 'backgrounds') {
        newAsset = { ...newAsset, type: 'Environment', sector: 'Universal', url: '' };
    }

    setActiveCollection((prev: any[]) => [...prev, newAsset]);
    setSelectedId(newId);
  };
  
  const [selectedId, setSelectedId] = useState(characterData[0]?.id);
  const [activeAnimation, setActiveAnimation] = useState<keyof SpriteManifest>('idle');
  const [isPlaying, setIsPlaying] = useState(true);

  // Sync selectedId ONLY when changing tabs, not when data within the collection updates
  useEffect(() => {
    if (activeTab === 'characters') setSelectedId(characters[0]?.id);
    if (activeTab === 'enemies') setSelectedId(enemies[0]?.id);
    if (activeTab === 'relics') setSelectedId(relics[0]?.id);
    if (activeTab === 'backgrounds') setSelectedId(backgrounds[0]?.id);
  }, [activeTab]);

  const activeCollection = activeTab === 'characters' ? characters : activeTab === 'enemies' ? enemies : activeTab === 'relics' ? relics : backgrounds;
  const setActiveCollection = activeTab === 'characters' ? setCharacters : activeTab === 'enemies' ? setEnemies : activeTab === 'relics' ? setRelics : setBackgrounds;

  const selectedItem = activeCollection.find((c: any) => c.id === selectedId);

  const handleUpdate = (field: string, value: any) => {
    setActiveCollection((prev: any[]) => prev.map((item: any) => {
      if (item.id === selectedId) {
        if (field.includes('.')) {
          const parts = field.split('.');
          const lastPart = parts.pop()!;
          let currentLevel = { ...item };
          let pointer = currentLevel;
          
          for (const part of parts) {
            pointer[part] = { ...(pointer[part] || {}) };
            pointer = pointer[part];
          }
          
          pointer[lastPart] = value;
          return currentLevel;
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleManifestUpdate = (anim: keyof SpriteManifest, field: keyof SpriteAnimation, value: any) => {
    setActiveCollection((prev: any[]) => prev.map((item: any) => {
      if (item.id === selectedId) {
        const manifest = { ...(item.spriteManifest || {}) };
        const animation = { ...(manifest[anim] || { 
            name: anim, 
            url: '', 
            cols: 10, 
            rows: 10, 
            totalFrames: 100, 
            fps: 30, 
            loop: anim === 'idle' 
        }) };
        
        (animation as any)[field] = value;
        manifest[anim] = animation;
        
        return { ...item, spriteManifest: manifest };
      }
      return item;
    }));
  };

  const testAnimation = () => {
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 500);
  };

  const onFileUpload = async (anim: keyof SpriteManifest, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const originalName = file.name.toLowerCase();
    
    // Lazy Parser Logic: Try to find patterns in filename
    // 10x5 (cols x rows)
    const gridMatch = originalName.match(/(\d+)x(\d+)/);
    // 50f or 50frames
    const frameMatch = originalName.match(/(\d+)(?=f|frames)/);
    // 30fps
    const fpsMatch = originalName.match(/(\d+)(?=fps)/);

    const detectedCols = gridMatch ? parseInt(gridMatch[1]) : 10;
    const detectedRows = gridMatch ? parseInt(gridMatch[2]) : 1;
    const detectedFrames = frameMatch ? parseInt(frameMatch[1]) : (detectedCols * detectedRows);
    const detectedFps = fpsMatch ? parseInt(fpsMatch[1]) : 30;

    // Use a clean filename based on character ID and animation
    const ext = file.name.split('.').pop();
    const fileName = `${selectedId}_${anim}_${Date.now()}.${ext}`;

    const reader = new FileReader();
    reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        // Also get actual image dimensions for visual sanity
        const img = new Image();
        img.onload = () => {
            console.log(`[AssetEditor] Uploaded image: ${img.width}x${img.height}`);
        };
        img.src = reader.result as string;

        try {
            const res = await fetch('/api/uploadSprite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName, base64Data })
            });
            const result = await res.json();
            if (result.success) {
                // Bulk update the manifest with detected values
                setActiveCollection((prev: any[]) => prev.map((item: any) => {
                    if (item.id === selectedId) {
                        const manifest = { ...(item.spriteManifest || {}) };
                        // Prioritize ZIP meta if available, else use filename-detected values
                        const finalCols = result.meta?.cols ?? detectedCols;
                        const finalRows = result.meta?.rows ?? detectedRows;
                        const finalFrames = result.meta?.totalFrames ?? detectedFrames;
                        const finalFps = result.meta?.fps ?? detectedFps;

                        manifest[anim] = {
                            name: anim,
                            url: result.url,
                            cols: finalCols,
                            rows: finalRows,
                            totalFrames: finalFrames,
                            fps: finalFps,
                            loop: anim === 'idle'
                        };
                        return { ...item, spriteManifest: manifest };
                    }
                    return item;
                }));
                
                if (result.meta) {
                    alert(`ZIP EXTRACTED!\nManifest found: ${result.meta.cols}x${result.meta.rows} grid, ${result.meta.totalFrames} frames @ ${result.meta.fps}fps`);
                } else {
                    alert(`Lazy Parser Active!\nDetected: ${detectedCols}x${detectedRows} grid, ${detectedFrames} frames @ ${detectedFps}fps`);
                }
            } else {
                throw new Error(result.error);
            }
        } catch (err: any) {
            alert('Upload Error: ' + err.message);
        }
    };
    reader.readAsDataURL(file);
  };

  const onImageUpload = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop();
    const fileName = `${selectedId}_${field}_${Date.now()}.${ext}`;

    const reader = new FileReader();
    reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
            const res = await fetch('/api/uploadSprite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName, base64Data })
            });
            const result = await res.json();
            if (result.success) {
                handleUpdate(field, result.url);
            } else throw new Error(result.error);
        } catch (err: any) {
            alert('Upload Error: ' + err.message);
        }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const payloads = [
        { filePath: 'src/data/characters.json', data: characters },
        { filePath: 'src/data/enemies.json', data: enemies },
        { filePath: 'src/data/relics.json', data: relics },
        { filePath: 'src/data/backgrounds.json', data: backgrounds }
      ];

      for (const p of payloads) {
        const res = await fetch('/api/saveData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        });
        if (!res.ok) throw new Error(`Failed to save ${p.filePath}`);
      }
      alert('Saved Successfully to all JSON files!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/90 z-[100] p-8 flex flex-col font-mono text-xs text-white overflow-hidden backdrop-blur-md">
      <header className="flex justify-between items-center border-b border-cyan-500/50 pb-4 mb-4">
        <div className="flex items-center gap-8">
            <h1 className="text-xl text-cyan-400 tracking-widest leading-none">UNITY-STYLE ASSET INSPECTOR</h1>
            <div className="flex gap-2">
                {['characters', 'enemies', 'relics', 'backgrounds'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as AssetType)}
                        className={`px-4 py-1 border transition-colors ${activeTab === tab ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-gray-400 border-gray-700 hover:border-cyan-500'}`}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex gap-4">
          <button 
             onClick={handleSave}
             className="px-6 py-2 bg-cyan-900/50 hover:bg-cyan-500 hover:text-black border border-cyan-500 transition-colors"
          >
             SAVE TO DISK
          </button>
          <button 
             onClick={onClose}
             className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-colors"
          >
             CLOSE
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden gap-8">
        {/* Left Sidebar */}
        <div className="w-64 border border-cyan-900/50 h-full flex flex-col overflow-y-auto pr-2 custom-scrollbar shrink-0">
          {activeCollection.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`text-left px-4 py-3 border-b border-cyan-900/30 transition-colors ${
                selectedId === item.id ? 'bg-cyan-900/50 text-cyan-300 border-l-4 border-l-cyan-400' : 'hover:bg-cyan-900/20 text-gray-400'
              }`}
            >
              <div className="font-bold truncate">{item.name}</div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-cyan-600 truncate">{item.id}</div>
                {item.id.includes('BOSS') && (
                  <span className="text-[8px] bg-red-900/50 text-red-400 px-1 border border-red-500/50 leading-none py-0.5 rounded">BOSS</span>
                )}
              </div>
            </button>
          ))}
          <button
            onClick={addNewAsset}
            className="mt-4 mx-4 py-2 border border-dashed border-cyan-700 text-cyan-700 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
          >
            + ADD NEW {activeTab.slice(0, -1).toUpperCase()}
          </button>
        </div>

        {/* Right Editor Pane */}
        {selectedItem && (
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar">
            <div className="grid grid-cols-2 gap-6">
              
              {/* CORE IDENTITY */}
              <div className="space-y-4">
                <h2 className="text-gold-trim border-b border-gold-trim/30 pb-2 flex justify-between">
                    <span>CORE IDENTITY</span>
                    <span className="text-gray-500 text-[10px]">{activeTab.toUpperCase()}</span>
                </h2>
                
                {['id', 'name', 'classRole', 'tier', 'color', 'type', 'sector', 'race', 'description', 'effect', 'url'].map(key => {
                    if (selectedItem[key] === undefined && activeTab !== 'backgrounds') return null;
                    if (activeTab === 'relics' && ['tier', 'color', 'sector', 'effect'].includes(key)) return null;
                    if (activeTab === 'backgrounds' && !['id', 'name', 'type', 'sector', 'url'].includes(key)) return null;
                    return (
                        <div key={key} className="flex flex-col gap-1">
                          <label className="text-gray-500 capitalize">{key}</label>
                          {key === 'description' || key === 'effect' ? (
                              <textarea 
                                value={selectedItem[key]} 
                                onChange={e => handleUpdate(key, e.target.value)}
                                className="bg-black/50 border border-cyan-900 px-3 py-2 text-cyan-100 outline-none focus:border-cyan-400 min-h-[80px]"
                              />
                          ) : (
                              <input 
                                type="text" 
                                value={selectedItem[key]} 
                                onChange={e => handleUpdate(key, e.target.value)}
                                className="bg-black/50 border border-cyan-900 px-3 py-2 text-cyan-100 outline-none focus:border-cyan-400"
                              />
                          )}
                        </div>
                    );
                })}
              </div>

              {/* STATS (Dynamic based on Characters vs Enemies) */}
              {(selectedItem.stats || selectedItem.coreStats) && (
                  <div className="space-y-4">
                    <h2 className="text-emerald-400 border-b border-emerald-400/30 pb-2">BASE STATS</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {Object.entries(selectedItem.stats || selectedItem.coreStats).map(([statName, statValue]) => (
                        <div key={statName} className="flex flex-col gap-1">
                          <label className="text-gray-500 capitalize">{statName}</label>
                          <input 
                            type="number" 
                            value={statValue as number} 
                            onChange={e => handleUpdate(`${selectedItem.stats ? 'stats' : 'coreStats'}.${statName}`, parseInt(e.target.value) || 0)}
                            className="bg-black/50 border border-emerald-900 px-3 py-2 text-emerald-100 outline-none focus:border-emerald-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
               )}
            </div>

            {/* ANIMATION MANIFEST EDITOR */}
            {(activeTab === 'characters' || activeTab === 'enemies') && (
                <div className="space-y-6 mt-6 pb-20">
                    <h2 className="text-cyan-400 border-b border-cyan-400/30 pb-2 flex justify-between items-center">
                        <span>SPRITE MANIFEST INSPECTOR</span>
                        <div className="flex gap-2">
                            {['idle', 'default_attack', 'special_1', 'special_2', 'take_damage', 'death', 'dodge'].map(anim => (
                                <button 
                                    key={anim}
                                    onClick={() => { setActiveAnimation(anim as any); setIsPlaying(true); }}
                                    className={`px-3 py-1 text-[10px] border transition-colors ${activeAnimation === anim ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-gray-500 border-gray-800 hover:border-cyan-500'}`}
                                >
                                    {anim.replace('_', ' ').toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </h2>

                    <div className="flex gap-8 items-start">
                        {/* Animation Settings */}
                        <div className="w-1/2 grid grid-cols-2 gap-4">
                            {['url', 'cols', 'rows', 'totalFrames', 'fps'].map(field => (
                                <div key={field} className="flex flex-col gap-1">
                                    <label className="text-gray-500 capitalize">{field}</label>
                                    <input 
                                        type={field === 'url' ? 'text' : 'number'}
                                        value={(selectedItem.spriteManifest?.[activeAnimation] as any)?.[field] || ''}
                                        onChange={e => handleManifestUpdate(activeAnimation, field as any, field === 'url' ? e.target.value : parseInt(e.target.value) || 0)}
                                        className="bg-black/50 border border-cyan-900 px-3 py-2 text-cyan-100 outline-none focus:border-cyan-400"
                                        placeholder={`Enter ${field}...`}
                                    />
                                    {field === 'url' && (
                                        <div className="flex gap-2 mt-1">
                                            <label className="text-[10px] text-cyan-500 hover:text-cyan-300 cursor-pointer border border-cyan-900 px-2 py-0.5 bg-cyan-900/20 active:scale-95 transition-all">
                                                UPLOAD ASSET
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*,.zip"
                                                    onChange={(e) => onFileUpload(activeAnimation, e)}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="flex flex-col gap-1 justify-center">
                                <label className="text-gray-500">Looping</label>
                                <input 
                                    type="checkbox"
                                    checked={(selectedItem.spriteManifest?.[activeAnimation] as any)?.loop || false}
                                    onChange={e => handleManifestUpdate(activeAnimation, 'loop', e.target.checked)}
                                    className="w-4 h-4 accent-cyan-500"
                                />
                            </div>
                        </div>

                        {/* Real-time Preview */}
                        <div className="w-1/2 border border-cyan-900/30 bg-black/60 aspect-video flex flex-col items-center justify-center relative rounded overflow-hidden">
                            <div className="absolute top-2 left-2 text-[10px] text-cyan-500/50 uppercase tracking-widest px-2 py-1 border border-cyan-500/20 bg-black/40">
                                Live Preview: {activeAnimation.replace('_', ' ')}
                            </div>
                            
                            {(selectedItem.spriteManifest?.[activeAnimation] as any)?.url ? (
                                <div className="flex flex-col items-center gap-4">
                                  <SpriteAnimator 
                                    imageUrl={(selectedItem.spriteManifest[activeAnimation] as any).url}
                                    cols={(selectedItem.spriteManifest[activeAnimation] as any).cols}
                                    rows={(selectedItem.spriteManifest[activeAnimation] as any).rows}
                                    totalFrames={(selectedItem.spriteManifest[activeAnimation] as any).totalFrames}
                                    fps={(selectedItem.spriteManifest[activeAnimation] as any).fps}
                                    playing={isPlaying}
                                    loop={(selectedItem.spriteManifest[activeAnimation] as any).loop}
                                    onComplete={() => setIsPlaying(false)}
                                    className="h-[180px] w-auto"
                                    scale={1.5}
                                  />
                                  {!isPlaying && (
                                      <button 
                                        onClick={testAnimation}
                                        className="px-6 py-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all active:scale-95 cursor-pointer text-[10px] tracking-widest font-bold"
                                      >
                                          RE-TRIGGER ANIMATION
                                      </button>
                                  )}
                                </div>
                            ) : (
                                <div className="text-gray-600 flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 border-2 border-dashed border-gray-700 rounded-full animate-spin" />
                                    <span>NO ASSET URL DEFINED</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* BACKGROUND EDITOR - STATIC PREVIEW AND UPLOAD */}
            {activeTab === 'backgrounds' && (
                <div className="space-y-6 mt-6 pb-20">
                    <h2 className="text-pink-400 border-b border-pink-400/30 pb-2 flex justify-between items-center">
                        <span>BACKGROUND INSPECTOR & PREVIEW</span>
                        <label className="px-3 py-1 text-[10px] bg-pink-900/40 text-pink-400 border border-pink-500 hover:bg-pink-500 hover:text-black transition-colors cursor-pointer">
                            UPLOAD NEW BACKGROUND
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => onImageUpload('url', e)}
                            />
                        </label>
                    </h2>
                    
                    <div className="w-full border border-pink-900/50 bg-black/60 aspect-video flex items-center justify-center relative rounded overflow-hidden">
                        {selectedItem.url ? (
                            <img src={selectedItem.url} alt={selectedItem.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-600 flex flex-col items-center gap-2">
                                <span className="text-pink-900/50 text-6xl">∅</span>
                                <span>NO BACKGROUND SET</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* RELIC INSPECTOR */}
            {activeTab === 'relics' && (
                <div className="space-y-6 mt-6 pb-20">
                    <h2 className="text-yellow-400 border-b border-yellow-400/30 pb-2">RELIC INSPECTOR & PREVIEW</h2>
                    <div className="flex gap-8 items-start">
                        {/* Visual Preview */}
                        <div className="w-1/3 p-6 border border-cyan-900/50 bg-black/40 rounded-xl flex flex-col items-center gap-4 group">
                            <div 
                                className="w-32 h-32 rounded-lg flex items-center justify-center relative transition-transform group-hover:scale-105"
                                style={{ 
                                    backgroundColor: `${selectedItem.color}22`,
                                    border: `2px solid ${selectedItem.color}`,
                                    boxShadow: `0 0 20px ${selectedItem.color}33`
                                }}
                            >
                                <div 
                                    className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                    style={{ color: selectedItem.color }}
                                >
                                    {selectedItem.tier === 'Divine' ? '✦' : '✧'}
                                </div>
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                            </div>
                            <div className="text-center">
                                <span 
                                    className="px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
                                    style={{ backgroundColor: `${selectedItem.color}44`, color: selectedItem.color }}
                                >
                                    {selectedItem.tier}
                                </span>
                                <h3 className="mt-2 text-lg font-bold text-white">{selectedItem.name}</h3>
                                <p className="mt-1 text-gray-400 text-[10px] italic max-w-[200px] leading-relaxed">
                                    "{selectedItem.effect}"
                                </p>
                            </div>
                        </div>

                        {/* Detailed Fields */}
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-gray-500">Tier</label>
                                <select 
                                    value={selectedItem.tier}
                                    onChange={e => handleUpdate('tier', e.target.value)}
                                    className="bg-black/50 border border-cyan-900 px-3 py-2 text-cyan-100 outline-none focus:border-cyan-400"
                                >
                                    {['Fractured', 'Resonant', 'Exalted', 'Reliquary', 'Divine'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-gray-500">Sector</label>
                                <select 
                                    value={selectedItem.sector}
                                    onChange={e => handleUpdate('sector', e.target.value)}
                                    className="bg-black/50 border border-cyan-900 px-3 py-2 text-cyan-100 outline-none focus:border-cyan-400"
                                >
                                    {['Judgment', 'Order', 'Chaos', 'Love', 'Universal'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-gray-500">Color (Hex)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="color"
                                        value={selectedItem.color || '#9CA3AF'}
                                        onChange={e => handleUpdate('color', e.target.value)}
                                        className="h-9 w-12 bg-transparent border border-cyan-900 cursor-pointer p-0"
                                    />
                                    <input 
                                        type="text" 
                                        value={selectedItem.color || ''} 
                                        onChange={e => handleUpdate('color', e.target.value)}
                                        className="bg-black/50 border border-cyan-900 px-3 py-2 text-cyan-100 outline-none focus:border-cyan-400 flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
