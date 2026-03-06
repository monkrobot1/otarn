import type { ActiveCharacter } from '../types/character';
import { InternalLogger } from '../store/debugStore';

export class TalentManager {
    /**
     * Applies all pre-combat static modifiers and base stat adjustments
     * based on the active talents equipped by the party.
     * This creates a self-contained closed-loop system for applying dynamic boosts.
     */
    static applyPreCombatModifiers(party: ActiveCharacter[], activeTalentsFromRun: string[]): ActiveCharacter[] {
        if (!activeTalentsFromRun || activeTalentsFromRun.length === 0) return party;

        InternalLogger.info('combat', `TalentManager evaluating ${activeTalentsFromRun.length} active global talents.`);

        return party.map(character => {
            // Create a Deep copy of the character to modify
            const c = { ...character, stats: { base: { ...character.stats.base }, current: { ...character.stats.current } } };
            
            // Gather all talents the character specifically drafted (personal level ups) + any global run talents.
            // Right now, activeTalentsFromRun tracks all drafted talents across the party. Let's merge both just in case.
            const personalTalents = (c.talents || []).map(t => t.id);
            const allApplicableTalents = Array.from(new Set([...activeTalentsFromRun, ...personalTalents]));

            let hpModifier = 1.0;

            allApplicableTalents.forEach(talentId => {
                // Judgment
                if (talentId === 'TAL_JUD_001' && c.race === 'Null-Forged') {
                    c.stats.current.physicality = Math.floor(c.stats.current.physicality * 1.10);
                }
                if (talentId === 'TAL_JUD_002' && c.combatRole === 'Backline') {
                    c.stats.current.authority = Math.floor(c.stats.current.authority * 1.05);
                }
                if (talentId === 'TAL_JUD_004' && c.combatRole === 'Frontline') {
                    c.stats.current.physicality = Math.floor(c.stats.current.physicality * 1.05);
                }
                if (talentId === 'TAL_JUD_005') {
                    c.stats.current.acumen = Math.floor(c.stats.current.acumen * 1.05);
                }
                if (talentId === 'TAL_JUD_006' && c.race === 'Null-Forged') {
                    c.stats.current.capacity = Math.floor(c.stats.current.capacity * 1.10);
                }
                
                // Order
                if (talentId === 'TAL_ORD_001' && c.race === 'Lumina') {
                    c.stats.current.spirit = Math.floor(c.stats.current.spirit * 1.10);
                }
                if (talentId === 'TAL_ORD_002') {
                    c.stats.current.grace = Math.floor(c.stats.current.grace * 1.05);
                }
                if (talentId === 'TAL_ORD_004' && c.combatRole === 'Frontline') {
                    c.stats.current.physicality = Math.floor(c.stats.current.physicality * 1.10);
                }
                
                // Chaos
                if (talentId === 'TAL_CHA_001' && c.race === 'Espers') {
                    c.stats.current.acumen = Math.floor(c.stats.current.acumen * 1.10);
                }
                if (talentId === 'TAL_CHA_002') {
                    c.stats.current.fate = Math.floor(c.stats.current.fate * 1.05);
                }
                if (talentId === 'TAL_CHA_003') {
                    c.stats.current.authority = Math.floor(c.stats.current.authority * 1.05);
                }

                // Love
                if (talentId === 'TAL_LOV_001' && c.race === 'Sylvan') {
                    hpModifier += 0.10;
                }
                if (talentId === 'TAL_LOV_005' && c.baseId === 'CHR_LOV_BLD_001') {
                    c.stats.current.physicality = Math.floor(c.stats.current.physicality * 1.05);
                }
                if (talentId === 'TAL_LOV_007') {
                    hpModifier += 0.05;
                }
                if (talentId === 'TAL_LOV_009' && c.race === 'Sylvan') {
                    c.stats.current.spirit = Math.floor(c.stats.current.spirit * 1.05);
                }
                
                // T4 Genesis - Double max HP but lower damage done (Damage handled via a buff or explicitly calculated in combatStore later)
                if (talentId === 'TAL_LOV_029') {
                    hpModifier += 1.0;
                }
            });

            // Apply calculated Max HP Modifiers
            if (hpModifier !== 1.0) {
                // Assumes we haven't taken damage yet - combat start!
                const origMax = c.currentHp; 
                c.currentHp = Math.floor(c.currentHp * hpModifier);
                InternalLogger.debug('combat', `Talent applied HP mod to ${c.name}. ${origMax} -> ${c.currentHp}`);
            }

            return c;
        });
    }

    /**
     * Hook that can be injected into combatStore payload processor to manipulate damage
     * values or status effects right before they are dealt to the target.
     * Making this extensible so we can easily add logic for tier 3/4 complicated talents later.
     */
    static onDamageDealt(_source: ActiveCharacter, target: ActiveCharacter, initialDamage: number, _damageType: string, allTalents: string[]): number {
        let modifiedDamage = initialDamage;

        // Example: "Honor Bound" Proxies deal +5% damage to full health enemies
        if (allTalents.includes('TAL_ORD_007')) {
             // Let's assume maxHp is stored somewhere, for now we will cheat a bit or you'll need the combat store reference
             // This is an extensible hook demonstrating how we will wire it up.
             if (target.currentHp >= 100) { // Rough pseudo-check
                 modifiedDamage *= 1.05;
             }
        }

        // Tier 4 Genesis - reduce damage output by 20%
        if (allTalents.includes('TAL_LOV_029')) {
             modifiedDamage *= 0.8;
        }

        return Math.floor(modifiedDamage);
    }
}
