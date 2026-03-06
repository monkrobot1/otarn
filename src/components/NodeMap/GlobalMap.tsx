import { useGameStore } from '../../store/gameStore';

export const GlobalMap = () => {
    const { setScene } = useGameStore();

    const handleSectorClick = (_sector: string) => {
        // In full game, this would lock you to a sector or confirm entry.
        setScene('sector-map');
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-12 z-20">
            <h1 className="text-4xl text-cyan-400 tracking-widest font-light border-b border-cyan-400/50 pb-4 mb-16 drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
                THE ASTRAL PLANE
            </h1>
            
            <div className="relative w-full max-w-3xl aspect-square flex items-center justify-center mt-8">
                
                {/* Center Pedestal */}
                <button 
                    className="absolute z-20 w-48 h-48 rounded-full border-4 border-gold-trim bg-black/80 flex flex-col items-center justify-center hover:scale-105 transition-all hover:bg-gold-trim/20 shadow-[0_0_50px_rgba(225,193,110,0.4)] group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gold-trim/10 animate-pulse pointer-events-none" />
                    <span className="text-xl text-gold-trim tracking-widest font-bold group-hover:text-white drop-shadow-md z-10">PEDESTAL</span>
                    <span className="text-xs text-gold-trim/70 tracking-widest z-10">OF OTARAN</span>
                    <span className="text-[10px] text-red-500 mt-4 tracking-widest animate-pulse z-10 font-bold bg-black/50 px-2 rounded">[ 4 SEALS REMAIN ]</span>
                </button>

                {/* Top: Love */}
                <button 
                    onClick={() => handleSectorClick('Love')}
                    className="absolute top-0 w-40 h-40 rounded-full border-2 border-pink-400/50 bg-black/60 flex flex-col items-center justify-center hover:scale-110 transition-all hover:border-pink-400 shadow-[0_0_30px_rgba(255,105,180,0.2)] group"
                >
                    <span className="text-lg text-pink-400 tracking-widest font-bold group-hover:text-white drop-shadow-md">LOVE</span>
                    <span className="text-[10px] text-gray-400 mt-1 tracking-widest group-hover:text-pink-200">SECTOR ALPHA</span>
                </button>

                {/* Right: Chaos */}
                <button 
                    onClick={() => handleSectorClick('Chaos')}
                    className="absolute right-0 w-40 h-40 rounded-full border-2 border-red-500/50 bg-black/60 flex flex-col items-center justify-center hover:scale-110 transition-all hover:border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.2)] group"
                >
                    <span className="text-lg text-red-500 tracking-widest font-bold group-hover:text-white drop-shadow-md">CHAOS</span>
                    <span className="text-[10px] text-gray-400 mt-1 tracking-widest group-hover:text-red-200">SECTOR BETA</span>
                </button>

                {/* Bottom: Judgment */}
                <button 
                    onClick={() => handleSectorClick('Judgment')}
                    className="absolute bottom-0 w-40 h-40 rounded-full border-2 border-purple-500/50 bg-black/60 flex flex-col items-center justify-center hover:scale-110 transition-all hover:border-purple-500 shadow-[0_0_30px_rgba(128,0,128,0.2)] group hover:bg-purple-900/30"
                >
                    <span className="text-lg text-purple-500 tracking-widest font-bold group-hover:text-white drop-shadow-md">JUDGMENT</span>
                    <span className="text-[10px] text-gray-400 mt-1 tracking-widest group-hover:text-purple-200">SECTOR GAMMA</span>
                </button>

                {/* Left: Order */}
                <button 
                    onClick={() => handleSectorClick('Order')}
                    className="absolute left-0 w-40 h-40 rounded-full border-2 border-blue-400/50 bg-black/60 flex flex-col items-center justify-center hover:scale-110 transition-all hover:border-blue-400 shadow-[0_0_30px_rgba(0,191,255,0.2)] group"
                >
                    <span className="text-lg text-blue-400 tracking-widest font-bold group-hover:text-white drop-shadow-md">ORDER</span>
                    <span className="text-[10px] text-gray-400 mt-1 tracking-widest group-hover:text-blue-200">SECTOR DELTA</span>
                </button>

                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 -z-10 rotate-45 transform origin-center">
                    <circle cx="50%" cy="50%" r="35%" fill="none" className="stroke-gold-trim/20 stroke-[0.5] stroke-dasharray-[5_10] animate-[spin_60s_linear_infinite]" />
                </svg>
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 -z-10">
                    <line x1="50%" y1="50%" x2="50%" y2="20%" strokeDasharray="4 4" className="stroke-pink-400 stroke-2" />
                    <line x1="50%" y1="50%" x2="80%" y2="50%" strokeDasharray="4 4" className="stroke-red-500 stroke-2" />
                    <line x1="50%" y1="50%" x2="50%" y2="80%" strokeDasharray="4 4" className="stroke-purple-500 stroke-2" />
                    <line x1="50%" y1="50%" x2="20%" y2="50%" strokeDasharray="4 4" className="stroke-blue-400 stroke-2" />
                </svg>

            </div>
        </div>
    );
};
