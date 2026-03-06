import charactersData from '../data/characters.json';
import { CharacterFactory } from './CharacterFactory';
import type { BaseCharacter, ActiveCharacter } from '../types/character';

const allCharacters = charactersData as unknown as BaseCharacter[];

export class EncounterManager {
    static generateEncounter(nodeType: 'combat' | 'elite' | 'boss', sector: string, currentSectorLevel: number): ActiveCharacter[] {
        const generatedParty: ActiveCharacter[] = [];
        
        // Find all characters matching the sector that are NOT allied classes
        const sectorEnemies = allCharacters.filter(c => c.sector === sector && c.id.includes('JUD')); // For prototype, JUD = Enemy
        
        if (sectorEnemies.length === 0) {
            console.warn(`No enemies found for sector ${sector}. Spawning default Grunts.`);
            const fallbackId = allCharacters.find(c => c.id.includes('JUD'))?.id || 'CHR_JUD_VOD_001';
            const fallback = CharacterFactory.createFromBaseId(fallbackId, currentSectorLevel);
            if(fallback) generatedParty.push(fallback);
            return generatedParty;
        }

        // characters.json uses BOSS prefix for bosses
        const bosses = sectorEnemies.filter(e => e.id.includes('BOSS'));
        const elites = sectorEnemies.slice(0, 2); // Prototype mock elites
        const grunts = sectorEnemies; // All others can be grunts

        if (nodeType === 'boss') {
            // Spawn 1 Boss and 2 Elite minions
            if (bosses.length > 0) {
                const boss = CharacterFactory.createFromBaseId(bosses[0].id, currentSectorLevel + 2); // Bosses are +2 levels
                if(boss) generatedParty.push(boss);
            }
            // Add 1-2 elites if available
            if (elites.length > 0) {
                const elite1 = CharacterFactory.createFromBaseId(elites[0].id, currentSectorLevel);
                const elite2 = CharacterFactory.createFromBaseId(elites[0].id, currentSectorLevel);
                if(elite1) generatedParty.push(elite1);
                if(elite2) generatedParty.push(elite2);
            }
        } else if (nodeType === 'elite') {
            // Spawn 1 Elite and 2 Grunts
            if (elites.length > 0) {
                const elite = CharacterFactory.createFromBaseId(elites[0].id, currentSectorLevel + 1);
                if (elite) generatedParty.push(elite);
            }
            if (grunts.length > 0) {
                const g1 = CharacterFactory.createFromBaseId(grunts[Math.floor(Math.random() * grunts.length)].id, currentSectorLevel);
                const g2 = CharacterFactory.createFromBaseId(grunts[Math.floor(Math.random() * grunts.length)].id, currentSectorLevel);
                if(g1) generatedParty.push(g1);
                if(g2) generatedParty.push(g2);
            }
        } else {
            // Standard combat: 2-3 Grunts
            const numGrunts = Math.floor(Math.random() * 2) + 2; // 2 or 3
            for(let i=0; i<numGrunts; i++) {
                if (grunts.length > 0) {
                    const g = CharacterFactory.createFromBaseId(grunts[Math.floor(Math.random() * grunts.length)].id, currentSectorLevel);
                    if (g) generatedParty.push(g);
                }
            }
        }

        return generatedParty;
    }
}
