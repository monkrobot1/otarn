import enemiesData from '../data/enemies.json';
import { CharacterFactory } from './CharacterFactory';
import type { BaseCharacter, ActiveCharacter } from '../types/character';

const allEnemies = enemiesData as unknown as Array<BaseCharacter & { tier?: string }>;

export class EncounterManager {
    static generateEncounter(nodeType: 'combat' | 'elite' | 'boss', sector: string, encounterLevel: number): ActiveCharacter[] {
        const generatedParty: ActiveCharacter[] = [];
        
        // Find all enemies for the sector
        const sectorEnemies = allEnemies.filter(c => c.sector === sector);
        
        if (sectorEnemies.length === 0) {
            console.warn(`No enemies found for sector ${sector}. Spawning fallbacks.`);
            const fallbackId = allEnemies.find(c => c.id.includes('ENE_'))?.id || 'CHR_JUD_VOD_001';
            const fallback = CharacterFactory.createFromBaseId(fallbackId, encounterLevel);
            if(fallback) generatedParty.push(fallback);
            return generatedParty;
        }

        const bosses = sectorEnemies.filter(e => e.id.includes('BOSS'));
        const elites = sectorEnemies.filter(e => e.tier === 'elite');
        const grunts = sectorEnemies.filter(e => e.tier === 'grunt');

        // Helper to spawn
        const spawnFromList = (list: any[], levelModifier: number = 0) => {
            if (list.length === 0) return;
            const chosen = list[Math.floor(Math.random() * list.length)];
            const char = CharacterFactory.createFromBaseId(chosen.id, Math.max(1, encounterLevel + levelModifier));
            if (char) generatedParty.push(char);
        };

        if (nodeType === 'boss') {
            // 1 Boss
            if (bosses.length > 0) {
                // Random boss from the pool
                const boss = bosses[Math.floor(Math.random() * bosses.length)];
                const bossInst = CharacterFactory.createFromBaseId(boss.id, encounterLevel + 2);
                if(bossInst) generatedParty.push(bossInst);
            }
            // 2 Elite Minions for the boss
            spawnFromList(elites, 0);
            spawnFromList(elites, 0);
        } else if (nodeType === 'elite') {
            // Difficulty Budget
            // Elite Node standard: 1 Elite + 2 Grunts
            spawnFromList(elites, 1);
            spawnFromList(grunts, 0);
            spawnFromList(grunts, 0);
            
            // If high sector level, maybe add another grunt
            if (encounterLevel > 2 && Math.random() > 0.5) {
                spawnFromList(grunts, 0);
            }
        } else {
            // Standard Combat Node
            // Use Budget Points. Default budget 3.
            let budget = 3 + Math.floor(encounterLevel / 2);
            // Cap at 5 points to prevent overlapping UI or impossible logic
            budget = Math.min(budget, 5);
            
            // Randomly mix grunts (cost 1 point) and maybe 1 elite (cost 3 points) if budget >= 4
            while (budget > 0) {
                if (budget >= 3 && Math.random() < 0.2 && elites.length > 0) {
                    spawnFromList(elites, 0);
                    budget -= 3;
                } else if (grunts.length > 0) {
                    spawnFromList(grunts, 0);
                    budget -= 1;
                } else {
                    budget = 0; // safety
                }
            }
            
            if (generatedParty.length === 0 && grunts.length > 0) {
                 spawnFromList(grunts, 0);
            }
        }

        // Standardize positioning: Frontline in front
        generatedParty.sort((a, b) => {
             if (a.combatRole === 'Frontline' && b.combatRole !== 'Frontline') return -1;
             if (a.combatRole !== 'Frontline' && b.combatRole === 'Frontline') return 1;
             return 0;
        });

        // Ensure unique instance names to avoid React rendering key collisions
        generatedParty.forEach((char, index) => {
             char.instanceId = `${char.baseId}_${Date.now()}_${index}`;
        });

        return generatedParty;
    }
}
