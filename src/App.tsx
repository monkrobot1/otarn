import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { useGameStore } from './store/gameStore';

const SpaceCanvas = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 50] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[100, 100, 100]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
      </Canvas>
    </div>
  );
};
import { RosterView } from './components/DiamondThrone/RosterView';
import { AscensionPanel } from './components/DiamondThrone/AscensionPanel';
import { AxiomPedestal } from './components/DiamondThrone/AxiomPedestal';
import { RunInitiation } from './components/DiamondThrone/RunInitiation';
import { SectorMap } from './components/NodeMap/SectorMap';
import { ActiveCombatView } from './components/Combat/ActiveCombatView';
import { useCombatStore } from './store/combatStore';
import { CharacterFactory } from './core/CharacterFactory';
import { EncounterManager } from './core/EncounterManager';
import { useDebugStore } from './store/debugStore';

import { SpriteDebugger } from './components/Debug/SpriteDebugger';
import { AssetEditor } from './components/Debug/AssetEditor';

const DiamondThroneUI = () => {
  const { globalData } = useGameStore();
  const [activeTab, setActiveTab] = React.useState<'main' | 'roster' | 'ascension' | 'initiation' | 'axiom'>('main');
  const [showDebugger, setShowDebugger] = React.useState(false);
  const [showAssetEditor, setShowAssetEditor] = React.useState(false);

  if (activeTab === 'roster') {
    return (
      <div className="w-full h-full p-8 flex flex-col justify-between relative">
        <button 
          onClick={() => setActiveTab('main')}
          className="absolute top-8 left-8 text-gold-trim hover:text-white transition-all active:scale-95 cursor-pointer tracking-widest text-sm font-mono border border-gold-trim/50 px-4 py-1"
        >
          &lt; RETURN TO THRONE
        </button>
        <div className="mt-16 w-full h-[calc(100%-4rem)]">
          <RosterView />
        </div>
      </div>
    );
  }

  if (activeTab === 'ascension') {
    return (
      <div className="w-full h-full p-8 flex flex-col justify-between relative">
        <button 
          onClick={() => setActiveTab('main')}
          className="absolute top-8 left-8 text-gold-trim hover:text-white transition-all active:scale-95 cursor-pointer tracking-widest text-sm font-mono border border-gold-trim/50 px-4 py-1"
        >
          &lt; RETURN TO THRONE
        </button>
        <div className="mt-16 w-full h-[calc(100%-4rem)]">
          <AscensionPanel />
        </div>
      </div>
    );
  }
  
  if (activeTab === 'axiom') {
    return (
      <div className="w-full h-full p-8 flex flex-col justify-between relative">
        <button 
          onClick={() => setActiveTab('main')}
          className="absolute top-8 left-8 text-gold-trim hover:text-white transition-all active:scale-95 cursor-pointer tracking-widest text-sm font-mono border border-gold-trim/50 px-4 py-1 z-50 bg-black/50 backdrop-blur-md"
        >
          &lt; RETURN TO THRONE
        </button>
        <div className="w-full h-full absolute inset-0 pt-24 pb-8">
          <AxiomPedestal />
        </div>
      </div>
    );
  }

  if (activeTab === 'initiation') {
    return (
      <div className="w-full h-full p-8 flex flex-col justify-between relative">
        <button 
          onClick={() => setActiveTab('main')}
          className="absolute top-8 left-8 text-gold-trim hover:text-white transition-all active:scale-95 cursor-pointer tracking-widest text-sm font-mono border border-gold-trim/50 px-4 py-1"
        >
          &lt; RETURN TO THRONE
        </button>
        <div className="mt-16 w-full h-[calc(100%-4rem)]">
          <RunInitiation />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-8 flex flex-col justify-between">
      {showDebugger && <SpriteDebugger onClose={() => setShowDebugger(false)} />}
      {showAssetEditor && <AssetEditor onClose={() => setShowAssetEditor(false)} />}
      <header className="flex justify-between items-center w-full">
        <h1 className="text-3xl font-light tracking-widest text-white border-b border-gold-trim pb-2">
          THE DIAMOND THRONE
        </h1>
        <div className="flex gap-4">
          <button 
             onClick={() => setActiveTab('roster')}
             className="glass-panel px-6 py-2 text-sm text-gold-trim hover:bg-white/10 transition-all active:scale-95 cursor-pointer tracking-widest"
          >
            VIEW ROSTER
          </button>
          <button 
             onClick={() => setActiveTab('ascension')}
             className="glass-panel px-6 py-2 text-sm text-gold-trim hover:bg-white/10 transition-all active:scale-95 cursor-pointer tracking-widest"
          >
            ASCENSION
          </button>
          <button 
             onClick={() => setActiveTab('axiom')}
             className="glass-panel px-6 py-2 text-sm text-gold-trim hover:bg-white/10 transition-all active:scale-95 cursor-pointer tracking-widest"
          >
            AXIOM PEDESTAL
          </button>
          <div className="glass-panel px-6 py-2 rounded">
            <span className="text-sm text-gray-400 mr-2">Divine Sparks:</span>
            <span className="text-xl text-gold-trim font-mono">{globalData.divineSparks}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-6">
        <button 
          onClick={() => setActiveTab('initiation')}
          className="glass-panel px-12 py-6 text-2xl tracking-widest hover:bg-white/10 transition-all active:scale-95 cursor-pointer border-2 border-gold-trim text-gold-trim relative group overflow-hidden w-96 text-center"
        >
          <div className="absolute inset-0 w-full h-full bg-gold-trim/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
          <span className="relative z-10">AWAKEN PROXIES</span>
        </button>
        
        <div className="flex gap-4 w-[40rem] justify-center">
            <button 
               onClick={() => {
                  // Quick Start Setup
                  const P1 = CharacterFactory.createFromBaseId('CHR_LOV_BLD_001', 1); // Blood-Druid
                  const P2 = CharacterFactory.createFromBaseId('BOSS_LOV_002', 1); // The Dream-Weaver
                  const P3 = CharacterFactory.createFromBaseId('CHR_ORD_GRV_001', 1); // Grav-Lancer
                  const P4 = CharacterFactory.createFromBaseId('CHR_JUD_VOD_001', 1); // Void-Borg (extra)
                  if (P1 && P2 && P3 && P4) {
                     useGameStore.getState().startNewRun();
                     useGameStore.getState().updateRunData({
                        activeParty: [P1, P2, P3, P4],
                        ephemeralFaith: 100
                     });
                     const enemies = EncounterManager.generateEncounter('combat', 'Judgment', 1);
                     useCombatStore.getState().initializeCombat([P1, P2, P3, P4], enemies);
                     useGameStore.getState().setScene('combat');
                  }
               }}
               className="glass-panel px-4 py-3 text-xs tracking-widest hover:bg-cyan-900/30 transition-all active:scale-95 cursor-pointer border border-cyan-400 text-cyan-400 relative group overflow-hidden flex-1 text-center"
            >
               <span className="relative z-10">TEST COMBAT</span>
            </button>
            <button 
               onClick={() => {
                  // Quick Start Event Map Setup
                  const P1 = CharacterFactory.createFromBaseId('CHR_LOV_BLD_001', 1); // Blood-Druid
                  const P2 = CharacterFactory.createFromBaseId('BOSS_LOV_002', 1); // The Dream-Weaver
                  const P3 = CharacterFactory.createFromBaseId('CHR_ORD_GRV_001', 1); // Grav-Lancer
                  const P4 = CharacterFactory.createFromBaseId('CHR_JUD_VOD_001', 1); // Void-Borg (extra)
                  if (P1 && P2 && P3 && P4) {
                     useGameStore.getState().startNewRun();
                     useGameStore.getState().updateRunData({
                        activeParty: [P1, P2, P3, P4],
                        ephemeralFaith: 100,
                        currentNodeId: 'START',
                        visitedNodes: [],
                        _debugMode: 'events'
                     } as any);
                     useGameStore.getState().setScene('sector-map');
                  }
               }}
               className="glass-panel px-4 py-3 text-xs tracking-widest hover:bg-green-900/30 transition-all active:scale-95 cursor-pointer border border-green-400 text-green-400 relative group overflow-hidden flex-1 text-center"
            >
               <span className="relative z-10">TEST EVENTS</span>
            </button>
        </div>

        <div className="flex gap-4 w-[40rem] justify-center mt-4">
            <button 
               onClick={() => setShowDebugger(true)}
               className="glass-panel px-4 py-3 text-sm tracking-widest hover:bg-purple-900/30 transition-all active:scale-95 cursor-pointer border border-purple-400 text-purple-400 relative group overflow-hidden flex-1 text-center"
            >
               <span className="relative z-10">SPRITE DEBUGGER</span>
            </button>
            <button 
               onClick={() => setShowAssetEditor(true)}
               className="glass-panel px-4 py-3 text-sm tracking-widest hover:bg-cyan-900/30 transition-all active:scale-95 cursor-pointer border border-cyan-400 text-cyan-400 relative group overflow-hidden flex-1 text-center"
            >
               <span className="relative z-10">ASSET INSPECTOR</span>
            </button>
        </div>
        
        {/* Debug Console Display Toggle */}
        <div className="absolute top-4 right-4 z-50">
            <button 
                onClick={() => useDebugStore.getState().toggleDebug()}
                className="text-xs text-gray-500 font-mono tracking-widest hover:text-white"
            >
                [TOGGLE CONSOLE]
            </button>
        </div>
      </main>
      
      <footer className="w-full flex justify-end text-xs text-gray-500 tracking-wider">
        AWAITING COMMAND OVERRIDE // SECTOR ALL
      </footer>
    </div>
  );
};

import { GlobalMap } from './components/NodeMap/GlobalMap';
import { PostBattleScreen } from './components/Combat/PostBattleScreen';
import { EventScene } from './components/Events/EventScene';
import { RestScene } from './components/Rest/RestScene';
import { ShopScene } from './components/Shop/ShopScene';
import { LevelUpScreen } from './components/Combat/LevelUpScreen';

const CinematicInterlude = () => {
    const { setScene } = useGameStore();
    React.useEffect(() => {
        const timer = setTimeout(() => setScene('global-map'), 3000);
        return () => clearTimeout(timer);
    }, [setScene]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black/50 z-50 absolute inset-0 pt-32 backdrop-blur-sm">
            <h1 className="text-4xl text-cyan-400 font-mono tracking-widest animate-pulse drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]">
                ASTRAL PROJECTION INITIATED...
            </h1>
            <p className="text-gold-trim font-mono tracking-widest mt-8">SEEK THE DIAMOND PEDESTAL</p>
        </div>
    );
};

const RunSummary = () => {
    const { setScene } = useGameStore();
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-8 bg-black/80 z-50 absolute inset-0 backdrop-blur-md">
            <h1 className="text-5xl text-red-500 font-mono tracking-widest animate-pulse border-b border-red-500 pb-4">
                RUN TERMINATED
            </h1>
            <p className="text-gray-400 font-mono max-w-lg text-center leading-loose">
                The connection to your Proxies has been severed. They have returned to the void, but the Faith they gathered will empower your next Covenant.
            </p>
            <button 
                onClick={() => setScene('throne')} 
                className="mt-8 px-8 py-4 border border-gold-trim text-gold-trim hover:bg-gold-trim/20 tracking-widest font-bold transition-all active:scale-95 cursor-pointer"
            >
                RETURN TO THE DIAMOND THRONE
            </button>
        </div>
    );
};

function App() {
  const { currentScene, setScene } = useGameStore();
  const [encounterType, setEncounterType] = React.useState<'combat' | 'elite' | 'boss'>('combat');

  const renderScene = () => {
      switch(currentScene) {
          case 'throne': 
             return <DiamondThroneUI />;
          case 'cinematic': 
             return <CinematicInterlude />;
          case 'global-map':
             return <GlobalMap />;
          case 'sector-map': 
             return (
                 <div className="w-full h-full p-8 flex flex-col justify-between">
                     <SectorMap onNodeSelect={(type, _id) => {
                         if (['combat', 'elite', 'boss'].includes(type || '')) {
                             setEncounterType(type as any);
                             const runData = useGameStore.getState().runData;
                             if (runData) {
                                const generatedEnemies = EncounterManager.generateEncounter(type as any, 'Judgment', 1);
                                useCombatStore.getState().initializeCombat(runData.activeParty, generatedEnemies);
                             }
                             setScene('combat');
                         } else if (type === 'event') {
                             setScene('event');
                         } else if (type === 'rest') {
                             setScene('rest');
                         } else if (type === 'shop') {
                             setScene('shop');
                         } else {
                             alert(`UI state for ${type} nodes not yet implemented!`);
                         }
                     }} />
                 </div>
             );
          case 'combat': 
             return (
                 <div className="w-full h-full p-4 relative">
                     <ActiveCombatView encounterType={encounterType} />
                     <button 
                        onClick={() => useGameStore.getState().endRun(false)}
                        className="absolute bottom-4 right-4 px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/20 z-50 transition-all active:scale-95 cursor-pointer text-xs tracking-widest"
                     >
                         FLEE (PROTOTYPE END RUN)
                     </button>
                 </div>
             );
          case 'event':
             return <EventScene />;
          case 'rest':
             return <RestScene />;
          case 'shop':
             return <ShopScene />;
          case 'reward':
             return <PostBattleScreen />;
          case 'level-up':
             return <LevelUpScreen />;
          case 'summary':
             return <RunSummary />;
          default: 
             return <div className="text-white">SCENE NOT IMPLEMENTED: {currentScene}</div>;
      }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-space-dark text-white font-sans selection:bg-gold-trim/30">
      <SpaceCanvas />
      
      {/* HUD Lines for aesthetic */}
      <div className="geometric-line top-10 left-0 w-full h-[1px] pointer-events-none" />
      <div className="geometric-line top-0 left-10 w-[1px] h-full pointer-events-none" />
      <div className="geometric-line bottom-10 left-0 w-full h-[1px] pointer-events-none" />
      <div className="geometric-line top-0 right-10 w-[1px] h-full pointer-events-none" />
      
      {/* UI Layer */}
      <div className="z-10 relative w-full h-full p-10">
        {renderScene()}
      </div>
      
      <DebugOverlay />
    </div>
  );
}

const DebugOverlay = () => {
    const { enabled, logs, clearLogs } = useDebugStore();
    const [isOpen, setIsOpen] = useState(false);

    if (!enabled) return null;

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="absolute bottom-4 left-4 z-50 bg-black/80 border border-green-500/50 text-green-400 font-mono text-xs px-2 py-1 hover:bg-green-900/50"
            >
                &gt;_ SYSTEM LOGS ({logs.length})
            </button>
        );
    }

    return (
        <div className="absolute bottom-4 left-4 z-50 w-[500px] max-h-[400px] bg-black/90 border border-green-500/50 font-mono text-[10px] flex flex-col shadow-[0_0_20px_rgba(0,255,0,0.1)]">
            <div className="flex justify-between items-center border-b border-green-500/50 p-2 bg-green-900/20">
                <span className="text-green-400 tracking-widest">OTARAN DEBUG CONSOLE</span>
                <div className="flex gap-2">
                    <button onClick={clearLogs} className="text-gray-400 hover:text-white">CLEAR</button>
                    <button onClick={() => setIsOpen(false)} className="text-red-400 hover:text-red-300">CLOSE</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1" style={{ height: '300px' }}>
                {logs.length === 0 && <span className="text-gray-600">Awaiting input...</span>}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-2">
                        <span className="text-gray-500 whitespace-nowrap">
                            [{new Date(log.timestamp).toISOString().split('T')[1].slice(0, 8)}]
                        </span>
                        <span className={`whitespace-nowrap ${
                            log.level === 'error' ? 'text-red-500' :
                            log.level === 'warn' ? 'text-yellow-500' :
                            log.level === 'debug' ? 'text-purple-400' :
                            'text-cyan-400'
                        }`}>
                            [{log.system.toUpperCase()}]
                        </span>
                        <span className="text-gray-300 whitespace-pre-wrap">{log.message}</span>
                        {log.data && (
                            <button 
                                onClick={() => console.log('Data Dump:', log.data)}
                                className="text-gray-600 hover:text-white ml-2 underline"
                            >
                                (data)
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
