import type { ActiveCharacter } from '../types/character';
import type { Talent, Relic } from '../types/save';
import { useCombatStore } from '../store/combatStore';

export class AbilitySystem {
  // Parses a static JSON Talent/Relic effect and applies strictly configured math
  // For the prototype, we implement hardcoded switch cases or a lightweight parser 
  // until a fully robust JSON logic runner is needed.
  
  static applyTalent(talent: Talent, _source: ActiveCharacter, targets: ActiveCharacter[]) {
    switch(talent.id) {
      case 'TAL_JUD_001': // Cold Logic: +10% base Physicality to all Null-Forged
        // Handled passively at character load usually, but as an example
        break;
      case 'TAL_JUD_027': // Absolute Zero: execute non-boss below 30% HP
        targets.forEach(t => {
          if (!t.baseId.includes('BOSS')) {
            const hpPercent = t.currentHp / t.stats.base.capacity; // Capacity dictates base HP
            if (hpPercent < 0.3) {
              useCombatStore.getState().processPayload({
                sourceId: _source.instanceId,
                targetIds: [t.instanceId],
                damage: 9999
              });
            }
          }
        });
        break;
      // ... more logic
      default:
        console.log(`Unimplemented Talent ID: ${talent.id}`);
    }
  }

  static onCombatStart(activeRelics: Relic[], activeParty: ActiveCharacter[]) {
    activeRelics.forEach(relic => {
      switch(relic.id) {
        case 'REL_JUD_005': // Dark Matter Battery
          activeParty.forEach(p => p.currentMp = p.stats.base.capacity);
          break;
        case 'REL_ORD_004': // Aegis Shield
          activeParty.forEach(p => p.buffs.push({ id: 'buff_aegis', type: 'Shield', duration: 1, value: 1 }));
          break;
        default:
          console.log(`Unimplemented Relic ID: ${relic.id}`);
      }
    });
  }
}
