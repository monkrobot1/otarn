import { useCombatStore } from '../src/store/combatStore';
import { CharacterFactory } from '../src/core/CharacterFactory';
import { EncounterManager } from '../src/core/EncounterManager';

async function runSim() {
    console.log("===================================");
    console.log("   OTARAN PROXY BATTLE SIMULATOR   ");
    console.log("===================================");

    // 1. Setup Allies
    const proxyIds = ['CHR_JUD_VOD_001', 'CHR_ORD_CHR_001', 'CHR_CHA_FIR_001', 'CHR_LOV_LIF_001'];
    const party = proxyIds.map(id => CharacterFactory.createFromBaseId(id, 1)).filter(Boolean) as any[];

    // 2. Setup Enemies
    const enemies = EncounterManager.generateEncounter('combat', 'Judgment', 1);

    console.log(`\n[+] Deploying ${party.length} Proxies vs ${enemies.length} Judgment Forces...`);

    // 3. Init Combat
    useCombatStore.getState().initializeCombat(party, enemies);

    console.log(`[+] Initialized Timeline. First actor: ${useCombatStore.getState().timeline[0].name}`);

    // 4. Combat Loop
    let turnCount = 0;
    while(turnCount < 100) {
        const state = useCombatStore.getState();
        const activeAllies = state.allies.filter(a => !a.isDead);
        const activeEnemies = state.enemies.filter(e => !e.isDead);

        if (activeAllies.length === 0) {
            console.log("\n[-] DEFEAT. The Proxies were wiped out.");
            break;
        }
        if (activeEnemies.length === 0) {
            console.log("\n[+] VICTORY. The Sector has been purged.");
            break;
        }

        const activeId = state.activeTurnId;
        if (!activeId) {
            state.advanceTimeline();
            continue;
        }

        const logSnapshot = state.logs.length;

        // Find who is acting
        const activeUnit = [...state.allies, ...state.enemies].find(c => c.instanceId === activeId);
        
        if (!activeUnit) {
            state.advanceTimeline();
            continue;
        }

        const isAlly = state.allies.some(a => a.instanceId === activeId);

        // Auto-select target
        let targetId = '';
        if (isAlly) {
             const r = Math.floor(Math.random() * activeEnemies.length);
             targetId = activeEnemies[r].instanceId;
        } else {
             const r = Math.floor(Math.random() * activeAllies.length);
             targetId = activeAllies[r].instanceId;
        }

        const targetUnit = [...state.allies, ...state.enemies].find(c => c.instanceId === targetId);

        // Execute "STRIKE"
        let damageVal = activeUnit.stats.current.physicality * 2;
        if (damageVal < 1) damageVal = 5;

        state.processPayload({
             sourceId: activeUnit.instanceId,
             targetIds: [targetId],
             damage: damageVal,
             timeUnitsCost: 100
        });

        const latestLogs = useCombatStore.getState().logs;
        if (latestLogs.length > logSnapshot) {
            const lastLog = latestLogs[latestLogs.length - 1];
            // Format log nicely
            const actionStr = isAlly ? '🟢 ALLY STRIKE' : '🔴 MOB STRIKE';
            console.log(`[TURN ${turnCount}] ${actionStr} | ${activeUnit.name} hit ${targetUnit?.name} for ${lastLog.message.replace(/[^0-9]/g, '')} dmg.`);
        }

        turnCount++;
    }

    console.log("===================================");
    console.log("          SIMULATION ENDED         ");
    console.log("===================================");
}

runSim();
