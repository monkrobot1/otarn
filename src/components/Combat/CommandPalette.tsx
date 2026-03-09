import { useCombatStore } from '../../store/combatStore';
import { useCombatUIStore } from '../../store/combatUIStore';
import { useGameStore } from '../../store/gameStore';
import { Tooltip } from '../UI/Tooltip';
import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Ability } from '../../types/character';
import { AbilitySprite } from '../UI/AbilitySprite';
import { Droplet } from 'lucide-react';
import { createLog } from './perfTestUtils';

const CombatTelemetryHUD = React.memo(({ 
    activeChar, 
    targetingAbility, 
    runData 
}: { 
    activeChar?: import('../../types/character').ActiveCharacter;
    targetingAbility: import('../../types/character').Ability | null;
    runData: any;
}) => {
    const pLog = createLog('CombatTelemetryHUD');
    const { hoveredTargetId } = useCombatUIStore(useShallow(s => ({ hoveredTargetId: s.hoveredTargetId })));
    pLog.check('target id store');
    
    // Default to the active casting character to keep layout active in memory
    const displayId = hoveredTargetId || activeChar?.instanceId;
    const hChar = useCombatStore(s => {
        if (!displayId) return undefined;
        const char = s.allies.find(a => a.instanceId === displayId);
        if (char) return char;
    });
    pLog.check('hChar store');
    
    const isEnemy = useCombatStore(s => s.enemies.some(e => e.instanceId === displayId));
    pLog.check('isEnemy store');

    if (!displayId) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center h-full">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full border border-dashed border-cyan-500/30 animate-[spin_4s_linear_infinite] mx-auto mb-2 flex items-center justify-center">
                        <div className="w-2 h-2 bg-cyan-500/50 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-[10px] text-cyan-600 font-mono tracking-widest opacity-70 animate-pulse">
                        SCANNING TIMELINE...
                    </span>
                </div>
            </div>
        );
    }

    if (!hChar) return null;
    
    // Only show targeted math if we are actually hovering an enemy that is viable
    const tAbility = hoveredTargetId ? targetingAbility : null;
    const isTargetingThem = tAbility && hoveredTargetId && ((tAbility.targeting === 'enemy' && isEnemy) || (tAbility.targeting === 'ally' && !isEnemy) || (tAbility.targeting === 'all_enemies' && isEnemy));
    
    if (isTargetingThem && tAbility) {
        const hitChance = '85%';
        const mitigationPct = isEnemy ? Math.min(85, (hChar.stats.current.physicality || 1) * 2) : 0;
        const critChance = Math.min(100, Math.floor((activeChar?.stats.current.destiny || 1) * 5));
        
        let estimatedFinalDmgStr = '--';
        if (tAbility.hits && tAbility.hits.length > 0) {
            const activeRelics = runData?.activeRelics || [];
            const relicMult = (!isEnemy && activeRelics.includes('REL_DEFAULT')) ? 1.2 : 1;
            const ultMult = (!isEnemy && tAbility.id.includes('_ULT')) ? 100 : 1;
            
            const sourcePotency = (activeChar?.stats.current.physicality || 10) * ultMult * relicMult;
            const hitsNum = tAbility.hits.length;
            const totalMult = tAbility.hits.reduce((acc: number, h: any) => acc + h.multiplier, 0);
            
            // Factor in mitigation
            const mitigatedMult = (1 - (mitigationPct / 100));
            const maxDmg = Math.floor((sourcePotency * totalMult) * mitigatedMult);
            
            if (hitsNum > 1) {
                const perHitRange = Math.floor((sourcePotency * tAbility.hits[0].multiplier) * mitigatedMult);
                estimatedFinalDmgStr = `~${perHitRange}x${hitsNum} [${maxDmg}]`;
            } else {
                estimatedFinalDmgStr = `~${maxDmg}`;
            }
        }

        // Collect status effects
        const potentialStatuses = new Set<string>();
        if (tAbility.statusEffects) tAbility.statusEffects.forEach(s => potentialStatuses.add(s));
        if (tAbility.hits) tAbility.hits.forEach(h => { if (h.statusEffect) potentialStatuses.add(h.statusEffect); });

        // Vitals math
        const maxHp = hChar.stats.base.capacity ? 10 + (hChar.stats.base.capacity * 5) + (hChar.level * hChar.stats.base.capacity * 1) : 100;
        const hpPct = Math.max(0, Math.min(100, (hChar.currentHp / maxHp) * 100));
        const maxMp = 5 + (hChar.stats.base.capacity * 10);
        const mpPct = Math.max(0, Math.min(100, (hChar.currentMp / maxMp) * 100));

        return (
            <div className="flex-1 flex flex-col justify-center items-center h-full w-full">
            <div className="w-full flex flex-col gap-2 relative pointer-events-auto">
                <div className={`text-xl font-[family-name:var(--font-cinzel-dec)] font-bold tracking-widest uppercase mb-0.5 ${isEnemy ? 'text-red-400' : 'text-green-400'}`}>
                    &gt; {hChar.name}
                </div>
                
                <div className="bg-black/30 p-1.5 rounded border border-white/5 flex flex-col gap-1 w-full font-mono tracking-widest uppercase mb-1">
                    <div className="flex justify-between text-gray-400 text-[8px]"><span>HULL INTEGRITY</span> <span>{Math.floor(hChar.currentHp)}</span></div>
                    <div className="h-1 w-full bg-red-900 overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${hpPct}%` }} /></div>
                    <div className="flex justify-between text-gray-400 text-[8px] mt-0.5"><span>AETHER CURRENT</span> <span>{Math.floor(hChar.currentMp)}</span></div>
                    <div className="h-1 w-full bg-blue-900 overflow-hidden shadow-[0_0_5px_rgba(59,130,246,0.3)]"><div className="h-full bg-blue-400" style={{ width: `${mpPct}%` }} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono w-full">
                    <div className="bg-black/40 p-2 rounded border border-white/10 flex flex-col items-center justify-center shadow-inner">
                        <div className="flex justify-between w-full px-2 mb-1 opacity-70">
                            <span>CRIT CHA.</span>
                            <span className="text-green-400">{critChance}%</span>
                        </div>
                        <span className="text-gray-500 mb-1 tracking-widest text-[8px]">FINAL HIT RATE</span>
                        <span className="text-2xl font-bold text-yellow-400 drop-shadow-md">{hitChance}</span>
                    </div>
                    <div className="bg-black/40 p-2 rounded border border-white/10 flex flex-col items-center justify-center shadow-inner">
                        <div className="flex justify-between w-full px-2 mb-1 opacity-70">
                            <span>RESIST</span>
                            <span className="text-blue-400">{mitigationPct}%</span>
                        </div>
                        <span className="text-gray-500 mb-1 tracking-widest text-[8px]">ESTIMATED DAMAGE</span>
                        <span className="text-2xl font-bold text-red-400 drop-shadow-md">{estimatedFinalDmgStr}</span>
                    </div>
                </div>
                
                {potentialStatuses.size > 0 && (
                    <div className="w-full bg-purple-900/20 border border-purple-500/30 rounded p-1.5 flex flex-col items-center justify-center mt-1">
                        <span className="text-[9px] text-purple-300 font-mono tracking-widest">STATUS EFFECT PROJECTED</span>
                        {Array.from(potentialStatuses).map(status => (
                            <span key={status} className="text-sm text-purple-400 font-bold uppercase tracking-wider">{Math.max(10, activeChar?.stats.current.authority || 0 * 5)}% {status}</span>
                        ))}
                    </div>
                )}
            </div>
            </div>
        );
    } else {
        // Regular hover inspect Mode
        const maxHp = hChar.stats.base.capacity ? 10 + (hChar.stats.base.capacity * 5) + (hChar.level * hChar.stats.base.capacity * 1) : 100;
        const hpPct = Math.max(0, Math.min(100, (hChar.currentHp / maxHp) * 100));
        const maxMp = 5 + (hChar.stats.base.capacity * 10);
        const mpPct = Math.max(0, Math.min(100, (hChar.currentMp / maxMp) * 100));

        return (
            <div className="flex-1 flex flex-col justify-center items-center h-full w-full">
            <div className="w-full flex flex-col gap-2 text-[10px] font-mono tracking-widest uppercase">
                <div className={`text-lg font-[family-name:var(--font-cinzel-dec)] font-bold ${isEnemy ? 'text-red-400' : 'text-green-400'}`}>
                    &gt; {hChar.name}
                    <div className="text-[9px] font-sans tracking-widest text-gray-400 mt-1">{hChar.combatRole} - Lv {hChar.level}</div>
                </div>
                
                <div className="bg-black/30 p-2 rounded border border-white/5 flex flex-col gap-1 w-full">
                    <div className="flex justify-between text-gray-400 text-[9px]"><span>HULL INTEGRITY</span> <span>{Math.floor(hChar.currentHp)}</span></div>
                    <div className="h-1.5 w-full bg-red-900 overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${hpPct}%` }} /></div>
                    
                    <div className="flex justify-between text-gray-400 text-[9px] mt-1"><span>AETHER CURRENT</span> <span>{Math.floor(hChar.currentMp)}</span></div>
                    <div className="h-1.5 w-full bg-blue-900 overflow-hidden shadow-[0_0_5px_rgba(59,130,246,0.3)]"><div className="h-full bg-blue-400" style={{ width: `${mpPct}%` }} /></div>
                </div>
            </div>
            </div>
        );
    }
});

const AbilityHoverHUD = () => {
    const pLog = createLog('AbilityHoverHUD');
    const { hoveredAbility } = useCombatUIStore(useShallow(s => ({ hoveredAbility: s.hoveredAbility })));
    pLog.check('store selectors');

    // Keep the DOM node alive in memory at 0 opacity to stop reflow lag!
    return (
        <div className={`absolute -top-[160px] left-0 w-[280px] bg-black/90 border border-cyan-500/40 rounded-lg p-3 pt-2 shadow-[0_0_20px_rgba(0,0,0,0.8)] z-50 pointer-events-none transition-opacity duration-150 ${hoveredAbility ? 'opacity-100' : 'opacity-0'}`}>
            {hoveredAbility ? (
                <>
                <div className="flex justify-between items-start mb-2 border-b border-white/10 pb-2">
                    <span className="text-sm text-cyan-400 font-bold uppercase tracking-wider">{hoveredAbility.name}</span>
                    <span className="bg-gray-800 text-[9px] px-1.5 py-0.5 rounded text-gray-300 uppercase shrink-0 ml-2">{hoveredAbility.targeting.replace('_', ' ')}</span>
                </div>
                
                <p className="text-[10px] text-gray-300 italic mb-3 opacity-90 leading-snug whitespace-normal">"{hoveredAbility.description}"</p>
                
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono tracking-widest mt-auto">
                    <div className="bg-gray-900/50 p-1.5 border border-white/5 rounded">
                        <span className="text-gray-500 block mb-0.5">COST</span>
                        <div className="flex gap-2">
                            {hoveredAbility.costMP > 0 ? <span className="text-blue-400">{hoveredAbility.costMP} MP</span> : null}
                            {hoveredAbility.costRevelation && hoveredAbility.costRevelation > 0 ? <span className="text-purple-400">{hoveredAbility.costRevelation} ZEAL</span> : null}
                            {hoveredAbility.costMP === 0 && (!hoveredAbility.costRevelation || hoveredAbility.costRevelation === 0) ? <span className="text-gray-400">FREE</span> : null}
                        </div>
                    </div>
                    <div className="bg-gray-900/50 p-1.5 border border-white/5 rounded">
                        <span className="text-gray-500 block mb-0.5">POWER ESTIMATE</span>
                        <span className="text-gray-300">
                            {hoveredAbility.hits ? hoveredAbility.hits.map(h => `${h.multiplier}x`).join(', ') : hoveredAbility.baseHeal ? `Heal ${hoveredAbility.baseHeal}` : '--'}
                        </span>
                    </div>
                    {hoveredAbility.statusEffects && hoveredAbility.statusEffects.length > 0 && (
                        <div className="col-span-2 bg-purple-900/20 p-1.5 border border-purple-500/20 rounded mt-0.5">
                            <span className="text-purple-500/80 block mb-0.5">STATUS EFFECT</span>
                            <span className="text-purple-300 whitespace-normal">{hoveredAbility.statusEffects.join(', ')}</span>
                        </div>
                    )}
                </div>
                {/* Decorative triangle point down */}
                <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-cyan-500/40 opacity-80" />
                </>
            ) : null}
        </div>
    );
};

export const CommandPalette = () => {
    const pLog = createLog('CommandPalette');
    const { runData } = useGameStore(useShallow(s => ({ runData: s.runData })));
    pLog.check('game store');
    
    // Instead of subscribing to full arrays, we ONLY subscribe to the activeChar that is currently taking a turn.
    const activeChar = useCombatStore(s => {
        if (!s.activeTurnId) return undefined;
        const char = s.allies.find(a => a.instanceId === s.activeTurnId);
        if (char) return char;
        return s.enemies.find(e => e.instanceId === s.activeTurnId);
    });
    pLog.check('activeChar store');
    
    const isAllyTurn = useCombatStore(s => !!s.activeTurnId && s.allies.some(a => a.instanceId === s.activeTurnId));
    pLog.check('isAllyTurn store');
    const { targetingAbility, setTargetingAbility, setHoveredAbility } = useCombatUIStore(
        useShallow(s => ({
            targetingAbility: s.targetingAbility,
            setTargetingAbility: s.setTargetingAbility,
            setHoveredAbility: s.setHoveredAbility
        }))
    );
    pLog.check('combatUI store');
    const [activeTab, setActiveTab] = useState<'abilities' | 'god'>('abilities');
  
    // Helper to render ability visual
    const renderAbilityIcon = (abil: Ability, className: string = "w-full h-full") => {
        if (abil.iconUrl) {
            // Some fallback or old abilities
        }
        return <AbilitySprite abilityId={abil.id} className={className} />;
    };

    const renderCenterPanel = () => {
        if (targetingAbility) {
            const hitsDesc = targetingAbility.hits ? targetingAbility.hits.map(h => `${h.multiplier}x ${h.damageType}`).join(', ') : targetingAbility.baseDamage ? `Base Dmg: ${targetingAbility.baseDamage}` : targetingAbility.baseHeal ? `Base Heal: ${targetingAbility.baseHeal}` : 'Utility';
            const statusDesc = targetingAbility.statusEffects?.length ? targetingAbility.statusEffects.join(', ') : targetingAbility.hits?.map(h => h.statusEffect).filter(Boolean).join(', ') || 'None';

            return (
                <div className="flex-[1.5] bg-[#1a2c3a]/80 backdrop-blur-md rounded-xl border border-yellow-400/50 p-4 shadow-[0_0_15px_rgba(255,200,0,0.2)] flex relative overflow-hidden pointer-events-auto">
                    {/* Left Details Panel */}
                    <div className="flex-[2] flex flex-col justify-center pr-4 border-r border-yellow-500/20 z-10 w-2/3">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center border border-gray-600 shadow-inner overflow-hidden shrink-0">
                                {renderAbilityIcon(targetingAbility)}
                             </div>
                             <div className="overflow-hidden">
                                 <h3 className="text-lg text-yellow-400 font-bold uppercase tracking-widest leading-tight truncate">{targetingAbility.name}</h3>
                                 <div className="flex gap-2 text-[10px] font-mono text-gray-400 mt-1">
                                     {targetingAbility.costMP > 0 && <span className="bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded flex items-center leading-none shadow-[0_0_4px_rgba(59,130,246,0.5)] border border-blue-500/30">� {targetingAbility.costMP} MP</span>}
                                     {targetingAbility.costRevelation && targetingAbility.costRevelation > 0 && <span className="bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded flex items-center leading-none shadow-[0_0_4px_rgba(168,85,247,0.5)] border border-purple-500/30">🔮 {targetingAbility.costRevelation} ZEAL</span>}
                                     <span className="bg-gray-700/50 px-1.5 py-0.5 rounded uppercase leading-none border border-gray-600">{targetingAbility.targeting.replace('_', ' ')}</span>
                                 </div>
                             </div>
                        </div>
                        <p className="text-xs text-gray-300 mt-1 mb-2 italic opacity-80 h-[36px] overflow-y-auto no-scrollbar">"{targetingAbility.description}"</p>
                        
                        <div className="flex flex-col gap-1 text-[10px] font-mono mt-auto">
                            <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="text-gray-500 tracking-widest">POWER ESTIMATE:</span>
                                <span className="text-gray-300 tracking-wider">{hitsDesc}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="text-gray-500 tracking-widest">STATUS EFFECT:</span>
                                <span className="text-purple-300 tracking-wider">{statusDesc}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Targeting Prompt */}
                    <div className="flex-1 flex flex-col justify-center items-center pl-4 relative z-10 w-1/3">
                        <div className="w-12 h-12 mb-2 rounded-full border border-dashed border-yellow-400/50 animate-[spin_4s_linear_infinite] flex items-center justify-center">
                            <div className="w-2 h-2 bg-yellow-400/80 rounded-full animate-ping"></div>
                        </div>
                        <h3 className="text-sm text-yellow-400 tracking-widest text-center animate-pulse font-bold">
                            SELECT TARGET
                        </h3>
                        <p className="text-[9px] text-yellow-500/50 mt-1 font-mono text-center">
                            {targetingAbility.targeting === 'enemy' ? 'Select an enemy champion.' 
                             : targetingAbility.targeting === 'ally' ? 'Select an allied champion.' 
                             : targetingAbility.targeting === 'all_enemies' ? 'Confirm AoE attack.'
                             : 'Select valid target.'}
                        </p>
                        <button 
                            onClick={() => setTargetingAbility(null)} 
                            className="text-gray-300 hover:text-white text-[10px] font-mono tracking-widest uppercase mt-3 border border-gray-600 px-4 py-1.5 hover:bg-red-900/40 hover:border-red-500/50 transition-colors rounded"
                        >
                            [ Cancel ]
                        </button>
                    </div>

                    {/* Visual warning border pulses */}
                    <div className="absolute inset-0 border-[2px] border-yellow-500/20 rounded-xl pointer-events-none animate-pulse z-0"></div>
                </div>
            );
        }

        return (
            <div className="flex-[1.5] bg-[#1a2c3a]/80 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col relative overflow-visible">
                {/* Tabs */}
                <div className="flex gap-6 border-b border-white/10 mb-3 pb-2 text-xs tracking-wider font-mono font-bold">
                    <button 
                        onClick={() => setActiveTab('abilities')}
                        className={`${activeTab === 'abilities' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'} pb-1 transition-colors`}
                    >
                        ABILITIES
                    </button>
                    <button 
                        onClick={() => setActiveTab('god')}
                        className={`${activeTab === 'god' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-gray-300'} pb-1 transition-colors`}
                    >
                        GOD ABILITIES
                    </button>
                </div>

                <div className="flex items-center gap-4 overflow-visible no-scrollbar flex-1 relative">
                    
                    <AbilityHoverHUD />

                    {activeTab === 'abilities' && (
                        <>
                            {activeChar && activeChar.abilities?.map(abil => {
                                const hasMP = activeChar.currentMp >= abil.costMP;
                                const hasZeal = abil.costRevelation ? (activeChar.currentRevelation || 0) >= abil.costRevelation : true;
                                const canCast = hasMP && hasZeal;

                                return (
                                <button 
                                key={abil.id}
                                disabled={!canCast}
                                onMouseEnter={() => setHoveredAbility(abil)}
                                onMouseLeave={() => setHoveredAbility(null)}
                                onClick={() => {
                                    if (!canCast) return;
                                    setTargetingAbility(abil);
                                    setHoveredAbility(null);
                                }}
                                className={`min-w-[80px] h-[100px] bg-gray-800/40 border border-t-white/30 border-b-black/80 border-x-black/30 rounded-lg flex flex-col items-center justify-between p-1.5 shadow-inner group relative shrink-0 transition-colors ${
                                    canCast ? 'hover:border-cyan-400 hover:bg-cyan-900/60 cursor-pointer' : 'opacity-40 grayscale cursor-not-allowed'
                                }`}
                                >
                                <div className="w-full h-[60px] flex justify-center mb-1 overflow-hidden rounded bg-gray-900/50 shadow-inner group-hover:bg-cyan-900/40 transition-colors">
                                    <div className="w-full h-full opacity-90 transition-transform flex items-center justify-center">
                                        {renderAbilityIcon(abil, "w-full h-full object-cover")}
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-300 font-sans font-medium text-center leading-tight truncate w-full px-1">
                                    {abil.name}
                                </div>
                                {(abil.costMP > 0 || (abil.costRevelation && abil.costRevelation > 0)) && (
                                  <div className="flex justify-center items-center gap-1.5 mt-0.5 text-[10px] font-mono text-cyan-200/70 h-3">
                                      {abil.costMP > 0 ? (
                                        <div className="flex items-center gap-0.5">
                                            <span className={hasMP ? "text-blue-400 font-bold" : "text-red-500 font-bold"}>{abil.costMP}</span>
                                            <Droplet className="w-3 h-3 text-blue-400 fill-blue-400/50" />
                                        </div>
                                      ) : null}
                                      {abil.costRevelation && abil.costRevelation > 0 ? (
                                        <div className="flex items-center gap-0.5">
                                            <span className={hasZeal ? "text-purple-400 font-bold" : "text-red-500 font-bold"}>{abil.costRevelation}</span>
                                            <span className="text-[10px]">🔮</span>
                                        </div>
                                      ) : null}
                                  </div>
                                )}
                                </button>
                            )})}
                            
                            {/* Use Item */}
                            <button className="min-w-[80px] h-[100px] bg-gray-800/40 border border-t-white/30 border-b-black/80 border-x-black/30 rounded-lg hover:border-cyan-400 hover:bg-cyan-900/60 flex flex-col justify-between p-2 shadow-inner group relative shrink-0 ml-auto opacity-50 cursor-not-allowed">
                                <div className="w-full flex justify-center mb-1">
                                    <div className="w-10 h-10 bg-gray-600/50 rounded flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform">
                                        <span className="text-white font-serif opacity-50">🍱</span>
                                    </div>
                                </div>
                                <div className="text-[9px] text-gray-300 font-sans font-medium text-center">Use Item</div>
                                <div className="flex justify-center items-center gap-1 mt-1 text-[8px] font-mono text-cyan-200/70"></div>
                            </button>
                        </>
                    )}
                    
                    {activeTab === 'god' && (
                        <>
                            {/* Dummy Smite Ability */}
                            <button 
                                onClick={() => {
                                    const smiteAbility: Ability = {
                                        id: 'GOD_SMITE_1',
                                        name: 'Smite Lv.1',
                                        costMP: 0,
                                        costTU: 0,
                                        description: 'A divine strike using faith.',
                                        targeting: 'enemy',
                                        hits: [{ multiplier: 2.0, damageType: 'True' }],
                                        vfxType: 'beam'
                                    };
                                    setTargetingAbility(smiteAbility);
                                }}
                                className="min-w-[80px] h-[100px] bg-yellow-900/30 border border-yellow-500/50 rounded-lg hover:border-yellow-300 hover:bg-yellow-800/50 flex flex-col justify-between p-2 shadow-[0_0_10px_rgba(255,200,0,0.1)] group relative shrink-0"
                            >
                                <div className="w-full flex justify-center mb-1">
                                    <div className="w-10 h-10 bg-yellow-600/30 rounded flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden border border-yellow-500/30">
                                        <span className="text-yellow-400 text-xl drop-shadow-md">⚡</span>
                                    </div>
                                </div>
                                <div className="text-[9px] text-yellow-300 font-sans font-bold text-center leading-tight truncate w-full uppercase">
                                    Smite Lv.1
                                </div>
                                <div className="flex justify-center items-center gap-1 mt-1 text-[8px] font-mono text-yellow-200/70">
                                    <span className="text-yellow-400 font-bold">1</span><span className="text-[10px] grayscale">✨</span> {/* Dummy faith cost visually */}
                                </div>
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    // Auto-skip or simple AI for enemies in this prototype wrapper
    if (!isAllyTurn && activeChar) {
       return (
         <div className="w-full h-56 flex items-center justify-center mt-auto pb-4 relative z-20">
           <div className="glass-panel w-2/3 max-w-2xl p-4 flex items-center justify-center opacity-70 animate-pulse bg-red-900/20">
              <span className="text-red-500 tracking-widest font-mono text-shadow">ENEMY FORMULATING ATTACK...</span>
           </div>
         </div>
       )
    }
  
    if (!activeChar) return <div className="w-full h-56 mt-auto pb-4 relative z-20" />;

    return (
      <div className="w-full h-56 flex justify-between gap-4 mt-auto relative z-20 pb-4">
         
         {/* Left Panel: Stats */}
         {!targetingAbility && activeChar && (
         <div className="flex-1 bg-[#1a2c3a]/80 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
            {/* Header: Name and Class */}
             <div className="border-b border-white/10 pb-2 mb-2">
              <div className="text-lg text-cyan-400 font-[family-name:var(--font-cinzel-dec)] font-bold tracking-widest truncate">{activeChar.name.toUpperCase()}</div>
              <div className="flex gap-2 items-center">
                  <Tooltip content={activeChar.combatRole === 'Frontline' ? 'Melee combatants built for absorbing damage and holding the line.' : 'Ranged specialists focused on dealing damage or supporting allies.'}>
                     <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase inline-block">{activeChar.combatRole}</div>
                  </Tooltip>
                  <Tooltip content={
                      activeChar.sector === 'Order' ? 'Order < Chaos < Judgment < Love < Order. Strong vs Love, Weak vs Chaos.' :
                      activeChar.sector === 'Chaos' ? 'Order < Chaos < Judgment < Love < Order. Strong vs Order, Weak vs Judgment.' :
                      activeChar.sector === 'Judgment' ? 'Order < Chaos < Judgment < Love < Order. Strong vs Chaos, Weak vs Love.' :
                      'Order < Chaos < Judgment < Love < Order. Strong vs Judgment, Weak vs Order.'
                  }>
                     <div className="text-[10px] px-1 bg-white/10 rounded font-mono tracking-widest uppercase inline-block text-white cursor-help">
                         [{activeChar.sector}]
                     </div>
                  </Tooltip>
              </div>
            </div>
            
            {/* Context: Level, HP, MP */}
            <div className="flex justify-between items-center bg-black/30 rounded px-2 py-1 mb-3">
               <span className="text-[10px] font-mono text-gray-300">LVL <span className="text-white font-bold">{activeChar.level}</span></span>
               <div className="flex gap-3 text-[10px] font-mono">
                  <Tooltip content="Health Points: Champion is destroyed if this reaches 0."><span className="text-green-400 font-bold">HP {Math.max(0, activeChar.currentHp)}</span></Tooltip>
                  <Tooltip content="Mana Points: Required to cast powerful Spells and Skills."><span className="text-blue-400 font-bold">MP {Math.max(0, activeChar.currentMp)}</span></Tooltip>
               </div>
            </div>

            {/* 8 Stats Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-mono tracking-wider mt-auto">
                <Tooltip content="Physical damage scaling and basic damage mitigation.">
                   <div className="flex justify-between text-gray-400 w-full"><span>PHYSICALITY:</span><span className="text-white">{activeChar.stats.current.physicality}</span></div>
                </Tooltip>
                <Tooltip content="Determines maximum Health Points (HP) and Mana Points (MP).">
                   <div className="flex justify-between text-gray-400 w-full"><span>CAPACITY:</span><span className="text-white">{activeChar.stats.current.capacity}</span></div>
                </Tooltip>
                
                <Tooltip content="Magic damage scaling and debuff application chance.">
                   <div className="flex justify-between text-gray-400 w-full"><span>AUTHORITY:</span><span className="text-white">{activeChar.stats.current.authority}</span></div>
                </Tooltip>
                <Tooltip content="Critical hit chance, dodge rate, and overall luck in encounters.">
                   <div className="flex justify-between text-gray-400 w-full"><span>DESTINY:</span><span className="text-white">{activeChar.stats.current.destiny}</span></div>
                </Tooltip>
                
                <Tooltip content="Healing power and magic resistance.">
                   <div className="flex justify-between text-gray-400 w-full"><span>SPIRIT:</span><span className="text-white">{activeChar.stats.current.spirit}</span></div>
                </Tooltip>
                <Tooltip content="Determines turn order speed and action recovery time.">
                   <div className="flex justify-between text-gray-400 w-full"><span>FATE:</span><span className="text-white">{activeChar.stats.current.fate}</span></div>
                </Tooltip>
                
                <Tooltip content="Accuracy, piercing resistance, and tactical advantage in events.">
                   <div className="flex justify-between text-gray-400 w-full"><span>ACUMEN:</span><span className="text-white">{activeChar.stats.current.acumen}</span></div>
                </Tooltip>
                <Tooltip content="Agility, movement, and evasion.">
                   <div className="flex justify-between text-gray-400 w-full"><span>GRACE:</span><span className="text-white">{activeChar.stats.current.grace}</span></div> // wait logic
                </Tooltip>
            </div>
         </div>
         )}
  
         {/* Center Panel: Abilities or Targeting Prompt */}
         {renderCenterPanel()}
  
         {/* Right Panel: Target HUD */}
         <div className="flex-1 bg-[#1a2c3a]/80 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
            <div className="flex gap-4 border-b border-white/10 mb-3 pb-2 text-xs tracking-wider font-mono text-gray-400 font-bold">
                 COMBAT TELEMETRY
            </div>
            
            <CombatTelemetryHUD 
                activeChar={activeChar}
                targetingAbility={targetingAbility}
                runData={runData}
            />
         </div>
         
      </div>
    );
  };
