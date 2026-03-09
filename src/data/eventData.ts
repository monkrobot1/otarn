import rawEvents from './events.json';
import rawRelics from './relics.json';

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  condition?: (gameState: any) => boolean; // Optional condition to show/enable
  onSelect: (gameState: any) => void;
  resultText?: string; // Text to show after selecting
}

export interface GameEvent {
  id: string;
  title: string;
  description: string[];
  image?: string; // assigned image url
  imagePrompt?: string; // for future AI image insertion
  choices: EventChoice[];
}

export const GAME_EVENTS: Record<string, GameEvent> = {
  mystic_shrine: {
    id: 'mystic_shrine',
    title: 'THE SHATTERED SHRINE',
    description: [
      "In the middle of the desolate astral wastes, you encounter a floating structure of jagged obsidian and glowing gold trim. It vibrates with leftover divine energy.",
      "A whisper echoes in your mind, offering power in exchange for your hard-earned faith."
    ],
    choices: [
      {
        id: 'pray',
        label: '[ Pray ] Lose 20 Ephemeral Faith. Gain a random blessing.',
        description: 'Offer some of your current run\'s faith to the shrine, hoping for a boon in return.',
        onSelect: (state: any) => {
          // In a real implementation this would grant a random relic or stat boost.
          state.setEventResult("You kneel before the shrine. The obsidian glows brighter, and you feel a surge of power course through your champions. (Received: Minor Blessing)");
          state.updateRunData({ ephemeralFaith: Math.max(0, (state.runData?.ephemeralFaith || 0) - 20) });
        }
      },
      {
        id: 'desecrate',
        label: '[ Desecrate ] Gain 50 Ephemeral Faith. Take 10 damage to all champions.',
        description: 'Smash the remaining crystals to harvest the raw faith inside, disregarding the backlash.',
        onSelect: (state: any) => {
          state.setEventResult("You shatter the crystals. Pure, unrefined faith explodes outward, searing your champions but filling your reserves. (Gained 50 Faith, Party took 10 damage)");
          state.updateRunData({ ephemeralFaith: (state.runData?.ephemeralFaith || 0) + 50 });
          
          // Apply some damage to party members
          if (state.runData?.activeParty) {
            const updatedParty = state.runData.activeParty.map((champion: any) => ({
              ...champion,
              currentHp: Math.max(1, champion.currentHp - 10)
            }));
            state.updateRunData({ activeParty: updatedParty });
          }
        }
      },
      {
        id: 'leave',
        label: '[ Leave ] Ignore the shrine.',
        description: 'It is too risky to interact with remnants of the ancient ones.',
        onSelect: (state: any) => {
          state.setEventResult("You walk away, leaving the shrine to hum quietly in the void.");
        }
      }
    ]
  },
  wandering_merchant: {
    id: 'wandering_merchant',
    title: 'THE VOID MERCHANT',
    description: [
      "A strange figure cloaked in shifting starlight waves you down. Their face is obscured by a mask made of fractured diamond.",
      "They open their cloak to reveal an assortment of artifacts that shouldn't exist in this plane."
    ],
    choices: [
      {
        id: 'buy_artifact',
        label: '[ Trade ] Spend 30 Faith for a random Relic.',
        description: 'Their wares are bizarre, but they pulse with power.',
        condition: (state: any) => (state.runData?.ephemeralFaith || 0) >= 30,
        onSelect: (state: any) => {
          state.setEventResult("You hand over the faith. The merchant tosses you a strange, glowing orb before vanishing into the stardust. (Received: Generic Relic)");
          state.updateRunData({ ephemeralFaith: (state.runData?.ephemeralFaith || 0) - 30 });
        }
      },
      {
        id: 'rob',
        label: '[ Rob ] Attempt to take an artifact by force.',
        description: 'Why pay when you have weapons?',
        onSelect: (state: any) => {
          state.setEventResult("As you draw your weapons, the merchant laughs—a sound like breaking glass. They vanish instantly, leaving behind a trap that scorches your party! (Took 15 damage)");
          if (state.runData?.activeParty) {
            const updatedParty = state.runData.activeParty.map((champion: any) => ({
              ...champion,
              currentHp: Math.max(1, champion.currentHp - 15)
            }));
            state.updateRunData({ activeParty: updatedParty });
          }
        }
      },
      {
        id: 'leave',
        label: '[ Leave ] Decline politely.',
        description: 'You have no need for their trinkets today.',
        onSelect: (state: any) => {
          state.setEventResult("The merchant shrugs and folds back into the darkness of the astral plane.");
        }
      }
    ]
  },
  chaotic_rift: {
    id: 'chaotic_rift',
    title: 'THE TEAR IN REALITY',
    description: [
      "A jagged tear in the astral plane slowly spins before you, bleeding impossible colors into the void.",
      "The chaotic energy radiating from it makes your champions tremble, but also whispers of boundless potential."
    ],
    choices: [
      {
        id: 'embrace',
        label: '[ Embrace Chaos ] A random champion gains max HP, another loses max HP.',
        description: 'Subject your party to the raw whims of the rift.',
        onSelect: (state: any) => {
          if (!state.runData?.activeParty || state.runData.activeParty.length < 2) {
             state.setEventResult("The rift flickers and spits you back out. You need more champions to truly embrace the chaos.");
             return;
          }
          const party = [...state.runData.activeParty];
          
          // Pick two unique random indices
          const idx1 = Math.floor(Math.random() * party.length);
          let idx2 = Math.floor(Math.random() * party.length);
          while (idx1 === idx2) idx2 = Math.floor(Math.random() * party.length);

          // Apply changes to base stats or maxHp directly (since we calculate maxHp off capacity, we will just buff capacity here to be pure)
          party[idx1] = { ...party[idx1], stats: { ...party[idx1].stats, base: { ...party[idx1].stats.base, capacity: party[idx1].stats.base.capacity + 2 } } };
          party[idx2] = { ...party[idx2], stats: { ...party[idx2].stats, base: { ...party[idx2].stats.base, capacity: Math.max(1, party[idx2].stats.base.capacity - 1) } } };

          state.updateRunData({ activeParty: party });
          state.setEventResult(`${party[idx1].name} is infused with vital energy, while ${party[idx2].name} violently withers! (Stats altered)`);
        }
      },
      {
        id: 'channel',
        label: '[ Anchor Reality ] Lose 40 Faith. Fully Heal Party.',
        description: 'Use your accumulated faith to stabilize the rift temporarily, bathing in its restorative light.',
        condition: (state: any) => (state.runData?.ephemeralFaith || 0) >= 40,
        onSelect: (state: any) => {
          const party = state.runData.activeParty.map((p: any) => ({ ...p, currentHp: 9999, currentMp: 9999 })); // Simplified to full heal; logic in UI caps it
          state.updateRunData({ 
            ephemeralFaith: (state.runData?.ephemeralFaith || 0) - 40,
            activeParty: party
          });
          state.setEventResult("You channel your faith, forcing the rift into a perfect circle. A soothing light washes over the party, restoring them completely.");
        }
      },
      {
        id: 'skirt',
        label: '[ Skirt the Edge ] Take 5 damage to all. Gain 20 Faith.',
        description: 'Carefully harvest the loose faith crystallizing around the edges of the tear.',
        onSelect: (state: any) => {
          const party = state.runData.activeParty.map((p: any) => ({ ...p, currentHp: Math.max(1, p.currentHp - 5) }));
          state.updateRunData({ 
            ephemeralFaith: (state.runData?.ephemeralFaith || 0) + 20,
            activeParty: party
          });
          state.setEventResult("You gather the crystals, cutting your hands on the sharp reality-shards. (Gained 20 Faith, Party took 5 damage)");
        }
      }
    ]
  },
  weeping_angel: {
    id: 'weeping_angel',
    title: 'THE WEEPING STATUE',
    description: [
      "In a pocket of eerie silence, you find a massive statue of a weeping celestial being. It is carved from pale stone and cries tears of liquid starlight.",
      "The liquid pools at the statue's base, humming with life-giving properties and sorrow alike."
    ],
    choices: [
      {
        id: 'drink',
        label: '[ Drink Deeply ] Lose 25 Faith. Party Recovers 50% HP.',
        description: 'The sorrow threatens to sever your connection to the champions, but the starlight heals their wounds.',
        condition: (state: any) => (state.runData?.ephemeralFaith || 0) >= 25,
        onSelect: (state: any) => {
           state.updateRunData({ ephemeralFaith: (state.runData?.ephemeralFaith || 0) - 25 });
           // In actual StS fashion, we should calculate 50% based on max. We'll do a big flat heal or 50% max logic here.
           const party = state.runData.activeParty.map((p: any) => {
              // Hacky way to do it since we don't have maxHp directly on the object here, we'll heal a large flat amount.
              return { ...p, currentHp: p.currentHp + 50 }; 
           });
           state.updateRunData({ activeParty: party });
           state.setEventResult("The liquid tastes like ash and honey. Your champions' wounds knit together, but a profound sadness drains your Faith.");
        }
      },
      {
        id: 'bottle',
        label: '[ Bottle the Tears ] Party takes 15 damage. Gain a random buff later (Not implemented).',
        description: 'Extract the starlight. The sorrow immediately lashes out at you.',
        onSelect: (state: any) => {
           const party = state.runData.activeParty.map((p: any) => ({ ...p, currentHp: Math.max(1, p.currentHp - 15) }));
           state.updateRunData({ activeParty: party });
           state.setEventResult("As you seal the vial, the statue's wails echo in your mind, causing physical pain to your champions. But you secured the prize.");
        }
      },
      {
        id: 'leave',
        label: '[ Leave ] Step away in silence.',
        description: 'Some sorrows are better left alone.',
        onSelect: (state: any) => {
           state.setEventResult("You respectfully back away. The weeping continues into the void.");
        }
      }
    ]
  }
};

export const getRandomEvent = (currentSector: string = 'Universal', currentSectorLevel: number = 1) => {
    const validEvents = rawEvents.filter((e: any) => 
        (e.sector === currentSector || e.sector === 'Universal') &&
        (!e.min_sector_level || e.min_sector_level <= currentSectorLevel)
    );

    let blueprint = rawEvents[Math.floor(Math.random() * rawEvents.length)]; // Fallback
    
    if (validEvents.length > 0) {
        const rarityWeights: Record<string, number> = {
            'Common': 70,
            'Uncommon': 25,
            'Rare': 5
        };
        
        let totalWeight = 0;
        validEvents.forEach((e: any) => {
            totalWeight += rarityWeights[e.rarity || 'Common'] || 70;
        });

        const roll = Math.random() * totalWeight;
        let cumulative = 0;
        for (const e of validEvents) {
            cumulative += rarityWeights[e.rarity || 'Common'] || 70;
            if (roll <= cumulative) {
                blueprint = e;
                break;
            }
        }
    }

    let image = '/assets/events/event_generic_1.svg';
    const lowerTitle = blueprint.title.toLowerCase();
    
    if (blueprint.sector === 'Judgment') image = '/assets/events/event_judgment.svg';
    else if (blueprint.sector === 'Order') image = '/assets/events/event_order.svg';
    else if (blueprint.sector === 'Chaos') image = '/assets/events/event_chaos.svg';
    else if (blueprint.sector === 'Love') image = '/assets/events/event_love.svg';
    
    if (lowerTitle.includes('shrine')) image = '/assets/events/event_shatter.svg';
    else if (lowerTitle.includes('merchant')) image = '/assets/events/event_merchant.svg';
    else if (lowerTitle.includes('anomaly') || lowerTitle.includes('rift') || lowerTitle.includes('storm')) image = '/assets/events/event_generic_2.svg';

    return {
        id: blueprint.event_id,
        title: blueprint.title,
        image,
        description: [blueprint.description],
        choices: blueprint.choices.map((c: any, index: number) => ({
            id: `choice_${index}`,
            label: c.choice_text,
            description: '',
            rawOutcomes: c.outcomes,
            condition: c.requirements ? (state: any) => {
                if (c.requirements.faith_min && (state.runData?.ephemeralFaith || 0) < c.requirements.faith_min) return false;
                if (c.requirements.class_id_present) {
                    return state.runData?.activeParty?.some((p: any) => p.id === c.requirements.class_id_present);
                }
                return true;
            } : undefined,
            onSelect: (state: any) => {
                const roll = Math.random() * 100;
                let sum = 0;
                let pickedOutcome = c.outcomes[0];
                for (const out of c.outcomes) {
                    sum += out.weight;
                    if (roll <= sum) {
                        pickedOutcome = out;
                        break;
                    }
                }

                // Send debug info to the scene
                state.setDebugLog?.({
                    roll,
                    outcomes: c.outcomes,
                    picked: pickedOutcome
                });

                let eventText = pickedOutcome.text;
                
                if (pickedOutcome.result === 'gain_faith') {
                    state.updateRunData({ ephemeralFaith: (state.runData?.ephemeralFaith || 0) + (pickedOutcome.value || 0) });
                } else if (pickedOutcome.result === 'lose_faith') {
                    state.updateRunData({ ephemeralFaith: Math.max(0, (state.runData?.ephemeralFaith || 0) - (pickedOutcome.value || 0)) });
                } else if (pickedOutcome.result === 'sacrifice_hp') {
                    state.setPendingOutcome?.({ type: 'take_damage', payload: { amount: pickedOutcome.value || 15 } });
                } else if (pickedOutcome.result === 'damage_party') {
                    const party = state.runData?.activeParty?.map((p: any) => {
                        state.triggerFloatingEffect?.(p.instanceId, `-${pickedOutcome.value || 0} HP`, 'negative');
                        return { ...p, currentHp: Math.max(1, p.currentHp - (pickedOutcome.value || 0)) };
                    }) || [];
                    state.updateRunData({ activeParty: party });
                } else if (pickedOutcome.result === 'heal_party') {
                    const party = state.runData?.activeParty?.map((p: any) => {
                        state.triggerFloatingEffect?.(p.instanceId, `+${pickedOutcome.value || 0} HP`, 'positive');
                        return { ...p, currentHp: p.currentHp + (pickedOutcome.value || 0) };
                    }) || [];
                    state.updateRunData({ activeParty: party });
                } else if (pickedOutcome.result === 'gain_relic') {
                    // Pick a random relic matching the tier roughly, or any if not found
                    const validRelics = rawRelics.filter((r: any) => {
                        if (!pickedOutcome.tier) return true;
                        if (pickedOutcome.tier === 1 && r.tier === 'Common') return true;
                        if (pickedOutcome.tier === 2 && r.tier === 'Uncommon') return true;
                        if (pickedOutcome.tier === 3 && r.tier === 'Rare') return true;
                        if (pickedOutcome.tier === 4 && r.tier === 'Epic') return true;
                        if (pickedOutcome.tier === 5 && r.tier === 'Divine') return true;
                        return false;
                    });
                    const relicList = validRelics.length > 0 ? validRelics : rawRelics;
                    const randomRelic = relicList[Math.floor(Math.random() * relicList.length)];
                    
                    const currentRelics = state.runData?.activeRelics || [];
                    if (currentRelics.length < 4 && randomRelic) {
                        state.updateRunData({ activeRelics: [...currentRelics, randomRelic.id] });
                    }
                    
                    eventText += ` [Gained Relic: ${randomRelic.name}]`;
                    state.setPendingOutcome?.({ type: 'view_relic', payload: { relic: randomRelic } });
                } else if (pickedOutcome.result === 'gain_talent') {
                    state.setPendingOutcome?.({ type: 'gain_talent', payload: { talentName: pickedOutcome.talent_id || 'Astral Echo' } });
                } else if (pickedOutcome.result === 'gain_max_hp' || pickedOutcome.result === 'gain_max_mp') {
                    const type = pickedOutcome.result === 'gain_max_hp' ? 'CAPACITY' : 'AETHER';
                    state.runData?.activeParty?.forEach((p: any) => {
                        state.triggerFloatingEffect?.(p.instanceId, `++ ${type}`, 'positive');
                    });
                    eventText += " [Max Stats Increased!]";
                } else if (pickedOutcome.result === 'modify_stats') {
                    state.runData?.activeParty?.forEach((p: any) => {
                        state.triggerFloatingEffect?.(p.instanceId, "+ STATS", 'positive');
                    });
                    eventText += " [Stats Modified!]";
                } else if (pickedOutcome.result === 'gain_xp') {
                    state.runData?.activeParty?.forEach((p: any) => {
                        state.triggerFloatingEffect?.(p.instanceId, "+ XP", 'positive');
                    });
                    eventText += " [Experience Gained!]";
                } else if (pickedOutcome.result === 'level_up') {
                    state.runData?.activeParty?.forEach((p: any) => {
                        state.triggerFloatingEffect?.(p.instanceId, "LEVEL UP!", 'positive');
                    });
                    eventText += " [Level Up!]";
                } else if (pickedOutcome.result === 'combat_encounter') {
                    eventText += ` [Combat Approaching - ${pickedOutcome.difficulty || 'combat'}]`;
                    state.setPendingOutcome?.({ type: 'start_combat', payload: { difficulty: pickedOutcome.difficulty || 'combat' } });
                }

                state.setEventResult(eventText);
            }
        }))
    } as GameEvent;
};
