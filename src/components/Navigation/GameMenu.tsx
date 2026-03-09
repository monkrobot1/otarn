import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export const GameMenu = () => {
    const { isMenuOpen, setMenuOpen, setScene, currentScene } = useGameStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMenuOpen(!isMenuOpen);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMenuOpen, setMenuOpen]);

    if (!isMenuOpen) return null;

    const navButtons = [
        {
            label: 'RESUME',
            action: () => setMenuOpen(false)
        },
        {
            label: 'SAVE GAME',
            action: () => {
                // Game automatically saves on state changes, so we just confirm it
                alert('Game progress has been synchronized to the local core.');
                setMenuOpen(false);
            }
        },
        {
            label: 'LOAD LAST SAVE',
            action: () => {
                 if (window.confirm("Reload the simulation from the last saved state? Unsaved progress will be lost.")) {
                     window.location.reload();
                 }
            }
        },
        {
            label: 'SETTINGS',
            action: () => {
                alert('Audio, Video, and Interface settings are not yet modular in this build.');
            }
        },
        {
            label: 'RETURN TO THRONE',
            action: () => {
                if (window.confirm("Abandon current run and return to Throne?")) {
                    setScene('throne');
                    setMenuOpen(false);
                }
            },
            hideOutofRun: true
        },
        {
            label: 'EXIT TO DESKTOP',
            action: () => {
                if (window.confirm("Terminate the application connection?")) {
                    window.location.href = 'about:blank';
                }
            },
            danger: true
        }
    ];

    const isRunActive = currentScene !== 'throne' && currentScene !== 'cinematic' && currentScene !== 'summary';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="w-[400px] border border-cyan-900/50 bg-[#0a111a]/90 shadow-[0_0_50px_rgba(0,255,255,0.05)] flex flex-col items-center p-8 relative overflow-hidden">
                {/* Decorative borders */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-800" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-800" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-800" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-800" />

                <h2 className="text-3xl font-light tracking-[0.3em] text-cyan-500 mb-8 border-b border-cyan-900/50 pb-4 w-full text-center">
                    SYSTEM MENU
                </h2>

                <div className="flex flex-col gap-4 w-full">
                    {navButtons.map((btn, idx) => {
                        if (btn.hideOutofRun && !isRunActive) return null;
                        return (
                            <button 
                                key={idx}
                                onClick={btn.action}
                                className={`
                                    w-full py-3 px-6 text-sm tracking-widest font-mono text-center transition-all bg-black/40 border border-t-white/10
                                    ${btn.danger 
                                        ? 'text-red-400 hover:bg-red-900/20 border-red-900/50 hover:text-red-300' 
                                        : 'text-gray-300 hover:bg-cyan-900/20 hover:text-white hover:border-cyan-500/50'}
                                    shadow-inner hover:scale-[1.02] active:scale-[0.98]
                                `}
                            >
                                {btn.label}
                            </button>
                        );
                    })}
                </div>
                
                <div className="mt-8 text-xs text-gray-600 font-mono tracking-widest">
                    P R O T O C O L  V 0.1a
                </div>
            </div>
        </div>
    );
};
