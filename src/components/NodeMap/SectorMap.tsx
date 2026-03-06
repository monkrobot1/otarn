import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

import { generateMap } from '../../core/MapGenerator';
import type { MapNode, NodeType } from '../../types/map';
import backgroundData from '../../data/backgrounds.json';

interface SectorMapProps {
    onNodeSelect?: (type: string, id: string) => void;
}

export const SectorMap = ({ onNodeSelect }: SectorMapProps) => {
  const { runData, updateRunData, consumeSpark } = useGameStore();
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);

  const currentNodeId = runData?.currentNodeId || 'START';
  const visitedNodes = runData?.visitedNodes || [];

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

    const current = nodes.find(n => n.id === currentNodeId);
    if ((current && current.connections.includes(id)) || (currentNodeId === 'START' && id.includes('_c0'))) {
        const targetNode = nodes.find(n => n.id === id);
        if (targetNode) {
            setSelectedNode(targetNode);
        }
    } else {
        alert("Node locked. You must travel a connected path.");
    }
  };

  const confirmNodeSelect = () => {
      if (!selectedNode) return;
      
      if (!consumeSpark()) {
          alert("Insufficient Divine Sparks. You are stalled in the void.");
          return;
      }

      const id = selectedNode.id;
      updateRunData({ currentNodeId: id, visitedNodes: [...visitedNodes, id] });
      
      if (selectedNode.type === 'event' || selectedNode.type === 'rest' || selectedNode.type === 'shop') {
          if (onNodeSelect) onNodeSelect(selectedNode.type, selectedNode.id);
      } else if (['combat', 'elite', 'boss'].includes(selectedNode.type)) {
          if (onNodeSelect) onNodeSelect(selectedNode.type, selectedNode.id);
      } else {
          updateRunData({ visitedNodes: [...visitedNodes, id] });
      }
      setSelectedNode(null);
  };

  const getNodeColor = (type: NodeType) => {
    switch(type) {
      case 'combat': return 'fill-red-500/80 stroke-red-500';
      case 'elite': return 'fill-purple-500/80 stroke-purple-500';
      case 'event': return 'fill-blue-400/80 stroke-blue-500';
      case 'rest': return 'fill-green-400/80 stroke-green-500';
      case 'boss': return 'fill-yellow-500/80 stroke-yellow-500';
      case 'shop': return 'fill-orange-400/80 stroke-orange-500';
      default: return 'fill-gray-500 stroke-gray-500';
    }
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
        </div>
      </header>
      
      {/* SVG Map Container */}
      <div className="flex-1 glass-panel relative overflow-hidden flex items-center justify-center bg-black/40">
        <svg viewBox="0 0 200 100" className="w-full h-full p-8 drop-shadow-[0_0_15px_rgba(0,255,255,0.2)]">
           {/* Render Lines First */}
           {nodes.map(node => (
             node.connections.map(targetId => {
               const targetNode = nodes.find(n => n.id === targetId);
               if (!targetNode) return null;
               
               const isActivePath = currentNodeId === node.id || visitedNodes.includes(targetId);
               
               return (
                 <line 
                   key={`${node.id}-${targetId}`}
                   x1={node.x} y1={node.y} 
                   x2={targetNode.x} y2={targetNode.y}
                   className={`stroke-[0.5] transition-colors duration-500 ${isActivePath ? 'stroke-cyan-400/80 z-10' : 'stroke-white/10'}`}
                   strokeDasharray={isActivePath ? "1, 1" : "none"}
                 />
               );
             })
           ))}

           {/* Render Nodes */}
           {nodes.map(node => {
               const isCurrent = node.id === currentNodeId;
               const isAvailable = (currentNodeId === 'START' && node.id.includes('_c0')) || nodes.find(n => n.id === currentNodeId)?.connections.includes(node.id);
               const isCompleted = visitedNodes.includes(node.id) || (isCurrent && !['combat', 'elite', 'boss'].includes(node.type));
               const isHovered = hoveredNode === node.id;
               
               const displayType = (node.type === 'event' && isHovered) ? 'elite' : node.type;

               return (
                 <g 
                    key={node.id} 
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => handleNodeClick(node.id)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`cursor-pointer active:scale-95 transition-all duration-300 ${isAvailable && !isCompleted ? 'hover:stroke-white hover:stroke-[1]' : ''} ${isCompleted ? 'opacity-30 cursor-not-allowed active:scale-100' : (!isAvailable ? 'opacity-50 cursor-not-allowed active:scale-100' : '')}`}
                 >
                    {/* Pulsing ring for current node */}
                    {isCurrent && (
                        <circle r="4" className="fill-none stroke-cyan-400 stroke-[0.5] animate-ping opacity-75" />
                    )}
                    
                    {/* Node Shape */}
                    <circle 
                        r="2.5" 
                        className={`${getNodeColor(displayType)} stroke-[0.5] ${isCurrent ? 'filter brightness-150' : ''}`} 
                    />
                    
                    {/* Precognition Label */}
                    {isHovered && isAvailable && !isCompleted && (
                       <text x="4" y="1" className="text-[3px] fill-gold-trim font-mono tracking-widest drop-shadow-md">
                         [ PRECOG: {displayType.toUpperCase()} ]
                       </text>
                    )}

                    {/* Iconography placeholder */}
                    {node.type === 'boss' && (
                        <path d="M-1,-1 L1,-1 L0,1 Z" className="fill-black transform scale-[0.8]" />
                    )}
                 </g>
               )
           })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-panel p-4 text-xs font-mono flex flex-col gap-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500/80 rounded-full"></div> Combat</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500/80 rounded-full"></div> Elite</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400/80 rounded-full"></div> Event</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400/80 rounded-full"></div> Sanctuary</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-400/80 rounded-full"></div> Shop</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500/80 rounded-full"></div> Sector Boss</div>
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
                        {selectedNode.type} SCANNED
                    </h3>
                    
                    <p className="text-gray-400 font-mono text-center text-sm mb-8 px-4 border-l-2 border-cyan-400/30">
                        {selectedNode.type === 'combat' && "Pre-cognitive sweeps detect minor hostile signatures ahead. Prepare for standard engagement."}
                        {selectedNode.type === 'elite' && "WARNING: High-density threat detected. Exceptional combat capabilities required. Valuable artifacts likely."}
                        {selectedNode.type === 'event' && "Anomalous readings. The timeline is fractured here. A choice must be made."}
                        {selectedNode.type === 'rest' && "A pocket of stillness in the void. A safe place for your Proxies to mend or focus their Faith."}
                        {selectedNode.type === 'shop' && "A wandering merchant vessel. They trade artifacts of power for Ephemeral Faith."}
                        {selectedNode.type === 'boss' && "EXTREME DANGER: The Sector Sovereign awaits. There is no turning back."}
                    </p>

                    <div className="flex gap-4 w-full">
                        <button 
                            onClick={() => setSelectedNode(null)}
                            className="flex-1 py-3 text-xs font-bold tracking-widest text-gray-400 border border-gray-600 hover:bg-gray-800 transition-colors active:scale-95 cursor-pointer"
                        >
                            CANCEL SCRUTINY
                        </button>
                        <button 
                            onClick={confirmNodeSelect}
                            className="flex-1 py-3 text-xs font-bold tracking-widest text-cyan-400 border border-cyan-400 hover:bg-cyan-900/50 transition-colors active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                        >
                            INITIATE TRANSLATION
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
