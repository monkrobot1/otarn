import { useCombatStore } from '../store/combatStore';
import { CharacterFactory } from '../core/CharacterFactory';

export class BattleSim {
  static runTestEncounter() {
    // 1. Create a Level 1 Void-Borg
    const proxy = CharacterFactory.createFromBaseId('CHR_JUD_VOD_001', 1);
    
    // 2. Create a Level 1 Iron Judge (Enemy)
    const enemy = CharacterFactory.createFromBaseId('CHR_JUD_BOSS_001', 1);

    if (!proxy || !enemy) {
      console.error("Test Encounter Failed: Characters not found.");
      return;
    }

    // 3. Initialize Combat State
    useCombatStore.getState().initializeCombat([proxy], [enemy]);
    
    // Dump initial stats to console
    console.log("=== BATTLE SIM START ===");
    console.log(`P1: ${proxy.name} (Grace: ${proxy.stats.base.grace}, HP: ${proxy.currentHp})`);
    console.log(`E1: ${enemy.name} (Grace: ${enemy.stats.base.grace}, HP: ${enemy.currentHp})`);

    // Let's run 5 mock "turns" to see the Timeline shift
    for (let i = 0; i < 5; i++) {
        const state = useCombatStore.getState();
        const activeInstanceId = state.activeTurnId;
        const activeChar = [...state.allies, ...state.enemies].find(c => c.instanceId === activeInstanceId);
        
        if (!activeChar) break;

        console.log(`\nTurn ${i+1}: It is ${activeChar.name}'s turn.`);

        // Determine target
        const target = activeChar.combatRole === 'Frontline' ? proxy : enemy; // If friend, hit enemy. And vice versa in 1v1

        // Execute basic physical attack (100 Time Units)
        const potency = activeChar.stats.base.physicality * 2; // Arbitrary 200% scaling for test

        state.processPayload({
            sourceId: activeChar.instanceId,
            targetIds: [target.instanceId],
            damage: potency
        });

        // The processPayload automatically advances to the next turn under the hood
    }

    console.log("\n=== LOGS ===");
    useCombatStore.getState().logs.forEach(log => console.log(`[${log.type.toUpperCase()}] ${log.message}`));
  }
}
