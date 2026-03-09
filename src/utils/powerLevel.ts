import type { ActiveCharacter } from '../types/character';
import type { RunStateData } from '../types/save';
import type { StatBlock } from '../types/stats';
import relicsData from '../data/relics.json';

export interface PowerProfile {
    damageScore: number;       // Raw offensive output
    survivabilityScore: number; // Defensive bulk and sustainability
    supportScore: number;      // Healing, buffs, and crowd control
    totalScore: number;
}



/**
 * Calculates a 3-pillar power profile for a character:
 * 1) Damage
 * 2) Survivability
 * 3) Support
 */
export const calculateCharacterPowerProfile = (character: ActiveCharacter, runData?: RunStateData | null): PowerProfile => {
    
    // Core Stats
    const stats: StatBlock = character.stats?.current || {
        physicality: 1, authority: 1, grace: 1, acumen: 1, 
        spirit: 1, fate: 1, capacity: 1, destiny: 1
    };

    // Vitals
    const maxHp = 10 + ((stats.capacity || 1) * 5) + ((character.level || 1) * (stats.capacity || 1) * 1);

    // Relic Overrides (Extremely basic proxy values based on Tier or known meta logic)
    let globalRelicDamageBonus = 1.0;
    let globalRelicSurvBonus = 1.0;
    let globalRelicSupportBonus = 1.0;

    if (runData && runData.activeRelics && runData.activeRelics.length > 0) {
        runData.activeRelics.forEach(relicId => {
            const relic = (relicsData as { id: string, effect: string }[]).find(r => r.id === relicId);
            if (relic) {
                // Approximate impact based on descriptive wording or Tier
                // E.g. True integration would read specific flags on the relic
                if (relic.effect.toLowerCase().includes('damage') || relic.effect.toLowerCase().includes('power')) {
                    globalRelicDamageBonus += 0.15; // +15% per offensive relic roughly
                }
                if (relic.effect.toLowerCase().includes('health') || relic.effect.toLowerCase().includes('shield') || relic.effect.toLowerCase().includes('defense')) {
                    globalRelicSurvBonus += 0.15;
                }
                if (relic.effect.toLowerCase().includes('heal') || relic.effect.toLowerCase().includes('status')) {
                    globalRelicSupportBonus += 0.15;
                }
            }
        });
    }

    // --- 1. DAMAGE SCORE ---
    let dmgScore = 0;
    
    // Baseline offensive stat averages
    const physicalPotency = stats.physicality || 1;
    const spiritualPotency = stats.authority || 1;
    
    // Crit/Hit scaling
    const critRate = (stats.destiny || 1) * 0.5; // roughly 0.5% crit per destiny
    const critMult = 1.5 + ((stats.acumen || 1) * 0.01); 

    // Look at maximum damage potential from standard attacks/abilities
    let maxAbilityDamage = 0;
    if (character.abilities && character.abilities.length > 0) {
        character.abilities.forEach(abil => {
            let abilPotential = 0;
            if (abil.hits) {
                const totalMult = abil.hits.reduce((acc, h) => acc + h.multiplier, 0);
                // Assume the best scaling stat is used based on damage type roughly
                const isPhysical = abil.hits.some(h => h.damageType === 'Physical');
                const basePotency = isPhysical ? physicalPotency : spiritualPotency;
                abilPotential = basePotency * totalMult;
            } else if (abil.baseDamage) {
                abilPotential = (physicalPotency * abil.baseDamage); 
            }
            if (abilPotential > maxAbilityDamage) maxAbilityDamage = abilPotential;
        });
    } else {
        // Unarmed base attack fallback
        maxAbilityDamage = physicalPotency * 1.0;
    }

    // Combine raw damage potential with hit rate and crit mult for expected value
    dmgScore = (maxAbilityDamage * (1 + (critRate/100 * critMult))) * globalRelicDamageBonus;


    // --- 2. SURVIVABILITY SCORE ---
    let survScore = 0;
    // How much effective HP do they have?
    const physicalMitigation = (stats.physicality || 1) * 2; // e.g. 2% damage reduction per phys
    const spiritualMitigation = (stats.spirit || 1) * 2;
    const evasion = (stats.fate || 1) * 1.5; // Dodge chance %
    
    // Avg mitigation
    const avgMitigation = Math.min(85, (physicalMitigation + spiritualMitigation) / 2);
    // Effective HP Formula: HP / (1 - mitigation%) 
    let effectiveHp = maxHp / (1 - (avgMitigation/100));
    
    // Dodge increases effective survival
    effectiveHp *= (1 + (Math.min(50, evasion)/100));

    survScore = effectiveHp * globalRelicSurvBonus;


    // --- 3. SUPPORT SCORE ---
    let supportScore = 0;
    
    // Support is tricky. We scale it off healing abilities, status effects, and utility.
    let healingPotential = 0;
    let statusPotential = 0;

    if (character.abilities && character.abilities.length > 0) {
        character.abilities.forEach(abil => {
            if (abil.baseHeal) {
                healingPotential += (spiritualPotency * abil.baseHeal);
            }
            if (abil.statusEffects) {
                statusPotential += abil.statusEffects.length * 10;
            }
            if (abil.hits) {
                abil.hits.forEach(h => {
                    if (h.statusEffect) statusPotential += 5;
                });
            }
            if (abil.targeting === 'all_allies') {
                healingPotential *= 1.5; // AoE buffs are better
            }
        });
    }

    // Add speed/turn order to support (grace/fate)
    const tacticalSpeed = (stats.fate + stats.grace) * 2;
    
    supportScore = (healingPotential + statusPotential + tacticalSpeed) * globalRelicSupportBonus;


    // --- RETURN PROFILE ---
    return {
        damageScore: Math.floor(dmgScore),
        survivabilityScore: Math.floor(survScore),
        supportScore: Math.floor(supportScore),
        totalScore: Math.floor(dmgScore + survScore + supportScore)
    };
};

/**
 * Maps the power profile of an entire squad to easily compare 
 * total offensive vs defensive lines of two opposing teams.
 */
export const calculatePartyPowerProfile = (party: ActiveCharacter[], runData?: RunStateData | null): PowerProfile => {
    return party.reduce((acc, char) => {
        const profile = calculateCharacterPowerProfile(char, runData);
        return {
            damageScore: acc.damageScore + profile.damageScore,
            survivabilityScore: acc.survivabilityScore + profile.survivabilityScore,
            supportScore: acc.supportScore + profile.supportScore,
            totalScore: acc.totalScore + profile.totalScore
        };
    }, { damageScore: 0, survivabilityScore: 0, supportScore: 0, totalScore: 0 });
};

export const evaluateCombatBalanceProfiles = (allies: ActiveCharacter[], enemies: ActiveCharacter[], runData?: RunStateData | null) => {
    const allyProfile = calculatePartyPowerProfile(allies, runData);
    const enemyProfile = calculatePartyPowerProfile(enemies);

    return {
        allyProfile,
        enemyProfile,
        damageRatio: enemyProfile.damageScore > 0 ? (allyProfile.damageScore / enemyProfile.damageScore).toFixed(2) : 'Infinity',
        survivabilityRatio: enemyProfile.survivabilityScore > 0 ? (allyProfile.survivabilityScore / enemyProfile.survivabilityScore).toFixed(2) : 'Infinity',
        supportRatio: enemyProfile.supportScore > 0 ? (allyProfile.supportScore / enemyProfile.supportScore).toFixed(2) : 'Infinity',
        totalRatio: enemyProfile.totalScore > 0 ? (allyProfile.totalScore / enemyProfile.totalScore).toFixed(2) : 'Infinity'
    };
};
