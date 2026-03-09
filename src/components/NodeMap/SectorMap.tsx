import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';

import { generateMap } from '../../core/MapGenerator';
import type { MapNode, NodeType } from '../../types/map';
import backgroundData from '../../data/backgrounds.json';
import { Swords, Skull, MessageCircleQuestion, Tent, Coins, Crown, HelpCircle } from 'lucide-react';

interface SectorMapProps {
    onNodeSelect?: (type: string, id: string, level?: number) => void | Promise<void>;
}

export const SectorMap = ({ onNodeSelect }: SectorMapProps) => {
  const { runData, updateRunData, consumeSpark } = useGameStore();
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const currentNodeId = runData?.currentNodeId || 'START';
  const visitedNodes = runData?.visitedNodes || [];

  const visionRange = runData?.visionRange || 3;

  // Calculate reachable nodes (possible futures) to prune "the others"
  const reachableIds = useMemo(() => {
    if (!nodes.length) return [];
    
    const distances = new Map<string, number>();
    const queue: {id: string, dist: number}[] = [];
    
    if (currentNodeId === 'START') {
      nodes.filter(n => n.id.includes('_c0_')).forEach(n => {
        distances.set(n.id, 1);
        queue.push({id: n.id, dist: 1});
      });
    } else {
      distances.set(currentNodeId, 0);
      queue.push({id: currentNodeId, dist: 0});
    }
    
    while (queue.length > 0) {
      const {id, dist} = queue.shift()!;
      if (dist >= visionRange) continue;
      
      const node = nodes.find(n => n.id === id);
      node?.connections.forEach(tid => {
        if (!distances.has(tid) || distances.get(tid)! > dist + 1) {
          distances.set(tid, dist + 1);
          queue.push({id: tid, dist: dist + 1});
        }
      });
    }
    
    const reachable = Array.from(distances.keys());
    
    // Always include boss nodes
    nodes.filter(n => n.type === 'boss').forEach(n => {
        if (!reachable.includes(n.id)) {
            reachable.push(n.id);
        }
    });

    return reachable;
  }, [currentNodeId, nodes, visionRange]);

  // Generate or load procedural map
  useEffect(() => {
     if (runData?.generatedMap && runData.generatedMap.length > 0) {
         setNodes(runData.generatedMap);
     } else {
         const isDebugEvents = (runData as any)?._debugMode === 'events';
         const newMap = generateMap(isDebugEvents);
         setNodes(newMap);
         
         // Only save it to runData if we actually have an active run session 
         // so we don't accidentally write to null state
         if (runData) {
             updateRunData({ generatedMap: newMap });
         }
     }
  }, [runData?.generatedMap]);

  const handleNodeClick = (id: string) => {
    if (visitedNodes.includes(id)) return;

    let canSelect = false;
    if (currentNodeId === 'START') {
        const targetNode = nodes.find(n => n.id === id);
        canSelect = targetNode?.id.includes('_c0_') || false;
    } else {
        const current = nodes.find(n => n.id === currentNodeId);
        canSelect = current?.connections.includes(id) || false;
    }

    if (canSelect) {
        const targetNode = nodes.find(n => n.id === id);
        if (targetNode) {
            setSelectedNode(targetNode);
        }
    } else {
        alert("Node locked. You must follow a scanned path (left to right).");
    }
  };

  const confirmNodeSelect = async () => {
      if (!selectedNode || isTranslating) return;
      
      if (!consumeSpark()) {
          alert("Insufficient Divine Sparks. You are stalled in the void.");
          return;
      }

      setIsTranslating(true);
      const id = selectedNode.id;
      
      // Allow visual update for the "Translating..." state to take hold, then mock a small delay
      await new Promise(r => setTimeout(r, 600));

      updateRunData({ currentNodeId: id, visitedNodes: [...visitedNodes, id] });
      
      if (selectedNode.type === 'event' || selectedNode.type === 'rest' || selectedNode.type === 'shop') {
          if (onNodeSelect) await onNodeSelect(selectedNode.type, selectedNode.id, selectedNode.level);
      } else if (['combat', 'elite', 'boss'].includes(selectedNode.type)) {
          if (onNodeSelect) await onNodeSelect(selectedNode.type, selectedNode.id, selectedNode.level);
      } else {
          updateRunData({ visitedNodes: [...visitedNodes, id] });
      }
      setIsTranslating(false);
      setSelectedNode(null);
  };

  const getNodeColor = (type: string) => {
    switch(type) {
      case 'combat': return 'fill-red-800/80 stroke-red-400';
      case 'elite': return 'fill-purple-800/80 stroke-purple-400';
      case 'event': return 'fill-blue-800/80 stroke-blue-400';
      case 'rest': return 'fill-green-800/80 stroke-green-400';
      case 'boss': return 'fill-yellow-800/80 stroke-yellow-400';
      case 'shop': return 'fill-orange-800/80 stroke-orange-400';
      case 'unknown': return 'fill-gray-900/80 stroke-gray-500';
      default: return 'fill-gray-800 stroke-gray-400';
    }
  };

  const NodeIcon = ({ type, isHovered, isCurrent }: { type: string, isHovered?: boolean, isCurrent?: boolean }) => {
    const color = getNodeColor(type as NodeType).split(' ')[1].replace('stroke-', '');
    const size = type === 'boss' ? 7 : 5;
    const offset = -(size / 2);
    
    const props = {
       x: offset,
       y: offset,
       width: size,
       height: size,
       className: `stroke-${color} fill-black/60 ${isHovered || isCurrent ? 'animate-pulse filter brightness-150' : ''}`,
       strokeWidth: 2
    };

    return (
       <>
          {type === 'combat' && <Swords {...props} />}
          {type === 'elite' && <Skull {...props} />}
          {type === 'event' && <MessageCircleQuestion {...props} />}
          {type === 'rest' && <Tent {...props} />}
          {type === 'shop' && <Coins {...props} />}
          {type === 'boss' && <Crown {...props} />}
          {type === 'unknown' && <HelpCircle {...props} />}
       </>
    );
  };

  const activeBg = backgroundData.filter(bg => bg.url && bg.url.trim() !== '' && bg.type === 'Orbit')[0]?.url || '/assets/default_galaxy.jpg';

  return (
    <div 
        className="w-full h-full p-8 flex flex-col relative bg-cover bg-center"
        style={{ backgroundImage: `url(${activeBg})` }}
    >
       <header className="flex justify-between items-center w-full z-10 mb-8">
        <h2 className="text-2xl font-light tracking-widest text-cyan-400 border-b border-cyan-400/50 pb-2">
          SECTOR MAPPING: ONLINE
        </h2>
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-1 flex flex-col items-center border-gold-trim/30">
            <span className="text-[10px] text-gold-trim tracking-tighter uppercase">Divine Sparks (Fuel)</span>
            <span className="text-lg font-mono text-gold-trim flex items-center gap-2">
                <span className="w-2 h-2 bg-gold-trim rounded-full animate-pulse"></span>
                {runData?.divineSparks || 0}
            </span>
          </div>
          <div className="glass-panel px-4 py-1 flex flex-col items-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Ephemeral Faith</span>
            <span className="text-lg font-mono text-cyan-300">{runData?.ephemeralFaith || 0}</span>
          </div>
          <div className="glass-panel px-4 py-1 flex flex-col items-center border-blue-400/30">
            <span className="text-[10px] text-blue-400 uppercase tracking-tighter">Sector Vision</span>
            <span className="text-lg font-mono text-blue-300 flex items-center gap-1">
                {visionRange} <span className="text-[10px] text-blue-500">JUMPS</span>
            </span>
          </div>
        </div>
      </header>
      
      {/* SVG Map Container */}
      <div className="flex-1 glass-panel relative overflow-hidden flex items-center justify-center bg-black/10">
        <svg viewBox="0 0 200 100" className="w-full h-full p-8 drop-shadow-[0_0_15px_rgba(0,255,255,0.2)]">
           {/* Render Lines First */}
           {nodes.map(node => {
             const currentCol = parseInt(node.id.split('_c')[1] || '0');
             
             return node.connections.map(targetId => {
               const targetNode = nodes.find(n => n.id === targetId);
               if (!targetNode) return null;
               
               const targetCol = parseInt(targetId.split('_c')[1] || '0');
               
               // STRICT FILTER: No backward or horizontal lines
               if (targetCol <= currentCol) return null;

               // Calculate if this link is part of the ACTUAL traveled history
               let isHistoryPath = false;
               if (visitedNodes.includes(node.id) && visitedNodes.includes(targetId)) {
                  // Ensure they are sequential
                  const idx1 = visitedNodes.indexOf(node.id);
                  const idx2 = visitedNodes.indexOf(targetId);
                  if (idx1 !== -1 && idx2 !== -1 && idx2 === idx1 + 1) {
                      isHistoryPath = true;
                  }
               }
               
               const isFuturePath = currentNodeId === node.id;
               const isLineReachable = reachableIds.includes(node.id) && reachableIds.includes(targetId);
               
               if (isHistoryPath) {
                 return (
                   <line 
                     key={`${node.id}-${targetId}`}
                     x1={node.x} y1={node.y} 
                     x2={targetNode.x} y2={targetNode.y}
                     className="stroke-black stroke-[0.8] z-20 pointer-events-none"
                   />
                 );
               }

               return (
                 <line 
                   key={`${node.id}-${targetId}`}
                   x1={node.x} y1={node.y} 
                   x2={targetNode.x} y2={targetNode.y}
                   className={`transition-colors duration-500 ${isFuturePath ? 'stroke-cyan-400 stroke-[0.5] opacity-60 z-10' : (!isHistoryPath && !isLineReachable ? 'stroke-white/5 stroke-[0.1]' : 'stroke-white/10 stroke-[0.1]')}`}
                   strokeDasharray={isFuturePath ? "1, 1" : (!isHistoryPath && !isLineReachable ? "0.5, 2" : "none")}
                 />
               );
             })
           })}

           {/* Render Nodes */}
           {nodes.map(node => {
               const isCurrent = node.id === currentNodeId;
               const isVisited = visitedNodes.includes(node.id);
               const isTraveling = isCurrent || isVisited;
               
               const isReachable = reachableIds.includes(node.id);
               const displayType = (!isTraveling && !isReachable && node.type !== 'boss') ? 'unknown' : node.type;

               let isAvailable = false;
               if (currentNodeId === 'START') {
                   isAvailable = node.id.includes('_c0_');
               } else {
                   const current = nodes.find(n => n.id === currentNodeId);
                   isAvailable = current?.connections.includes(node.id) || false;
               }
               
               const isHovered = hoveredNode === node.id;

               return (
                 <g 
                    key={node.id} 
                    style={{
                        transform: `translate(${node.x}px, ${node.y}px) scale(${isHovered && isAvailable && !isTraveling ? 1.25 : 1})`,
                        transformOrigin: 'center',
                        transition: 'transform 0.2s ease-out, opacity 0.3s ease-out'
                    }}
                    onClick={() => !isTraveling ? handleNodeClick(node.id) : undefined}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`${isAvailable ? 'cursor-pointer' : 'cursor-default'} ${isTraveling ? 'opacity-90' : ''}`}
                 >
                    {isTraveling && node.id !== 'START' ? (
                        <circle r="1" className="fill-black stroke-cyan-400/30 stroke-[0.15]" />
                    ) : (
                        <NodeIcon type={displayType} isHovered={isHovered} isCurrent={isCurrent} />
                    )}

                    {/* Selection cursor for current position */}
                    {isCurrent && (
                        <circle r="3.5" className="fill-none stroke-cyan-400 stroke-[0.3] animate-ping opacity-75" />
                    )}
                 </g>
               )
           })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-panel p-4 text-xs font-mono flex flex-col gap-2 bg-black/80">
            <div className="flex items-center gap-2"><Swords className="w-4 h-4 text-red-400" /> <span className="text-gray-300">Combat</span></div>
            <div className="flex items-center gap-2"><Skull className="w-4 h-4 text-purple-400" /> <span className="text-gray-300">Elite</span></div>
            <div className="flex items-center gap-2"><MessageCircleQuestion className="w-4 h-4 text-blue-400" /> <span className="text-gray-300">Event</span></div>
            <div className="flex items-center gap-2"><Tent className="w-4 h-4 text-green-400" /> <span className="text-gray-300">Sanctuary</span></div>
            <div className="flex items-center gap-2"><Coins className="w-4 h-4 text-orange-400" /> <span className="text-gray-300">Shop</span></div>
            <div className="flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-400" /> <span className="text-gray-300">Sector Boss</span></div>
            <div className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-gray-500" /> <span className="text-gray-400">Unknown</span></div>
        </div>

        {/* Confirmation Modal */}
        {selectedNode && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="glass-panel border-cyan-400/50 p-8 max-w-md w-full flex flex-col items-center animate-[fade-in_0.2s_ease-out]">
                    <div className="w-16 h-16 rounded-full mb-6 border-2 flex items-center justify-center bg-black/50" 
                         style={{ borderColor: getNodeColor(selectedNode.type).split(' ')[1].replace('stroke-', '') }}>
                        {selectedNode.type === 'boss' ? (
                            <path d="M-1,-1 L1,-1 L0,1 Z" className="fill-yellow-500 transform scale-[1.5]" />
                        ) : (
                            <div className={`w-8 h-8 rounded-full ${getNodeColor(selectedNode.type).split(' ')[0]}`} />
                        )}
                    </div>
                    
                    <h3 className="text-2xl font-light tracking-widest text-white mb-2 uppercase">
                        {isTranslating ? 'TRANSLATING SPACE...' : `${selectedNode.type} SCANNED`}
                    </h3>
                    
                    <p className={`text-gray-400 font-mono text-center text-sm mb-8 px-4 border-l-2 border-cyan-400/30 ${isTranslating ? 'animate-pulse' : ''}`}>
                        {isTranslating ? 'Calibrating phase anchors and pre-loading material boundaries...' : (
                            <>
                                {selectedNode.type === 'combat' && "Pre-cognitive sweeps detect minor hostile signatures ahead. Prepare for standard engagement."}
                                {selectedNode.type === 'elite' && "WARNING: High-density threat detected. Exceptional combat capabilities required. Valuable artifacts likely."}
                                {selectedNode.type === 'event' && "Anomalous readings. The timeline is fractured here. A choice must be made."}
                                {selectedNode.type === 'rest' && "A pocket of stillness in the void. A safe place for your Champions to mend or focus their Faith."}
                                {selectedNode.type === 'shop' && "A wandering merchant vessel. They trade artifacts of power for Ephemeral Faith."}
                                {selectedNode.type === 'boss' && "EXTREME DANGER: The Sector Sovereign awaits. There is no turning back."}
                            </>
                        )}
                    </p>

                    <div className="flex gap-4 w-full">
                        <button 
                            onClick={() => !isTranslating && setSelectedNode(null)}
                            disabled={isTranslating}
                            className={`flex-1 py-3 text-xs font-bold tracking-widest text-gray-400 border border-gray-600 transition-colors ${isTranslating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 active:scale-95 cursor-pointer'}`}
                        >
                            CANCEL SCRUTINY
                        </button>
                        <button 
                            onClick={confirmNodeSelect}
                            disabled={isTranslating}
                            className={`flex-1 py-3 text-xs font-bold tracking-widest text-cyan-400 border border-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.2)] ${isTranslating ? 'opacity-50 cursor-wait bg-cyan-900/50' : 'hover:bg-cyan-900/50 active:scale-95 cursor-pointer'}`}
                        >
                            {isTranslating ? 'SYNCHRONIZING...' : 'INITIATE TRANSLATION'}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
