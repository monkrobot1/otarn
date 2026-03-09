export interface AxiomTalent {
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: number;
    cost: number;
    reqPoints: number;
    maxLevel: number;
    effectType: string;
    effectValue: any;
}

export const AXIOM_TREES: Record<string, AxiomTalent[][]> = {
    "Order": [
        [
            {
                "id": "AXIOM_ORDER_T1_O1",
                "name": "Minor Aegis Conditioning",
                "description": "All Order Champions gain +5% base Physicality.",
                "icon": "icon_order_conditioning.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_ORDER_T1_O2",
                "name": "Aegis Rescue Protocol",
                "description": "Unlocks a powerful new Order-aligned Champion for your roster.",
                "icon": "icon_order_rescue.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 1,
                "effectType": "unlock_character",
                "effectValue": "CHR_ORD_NEW_1"
            },
            {
                "id": "AXIOM_ORDER_T1_O3",
                "name": "Minor Order Resonance",
                "description": "Whenever you visit a Order sector, gain +2 Divine Sparks.",
                "icon": "icon_order_resonance.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_ORDER_T1_O4",
                "name": "Minor Blessing of Aegis",
                "description": "Rest nodes restore an additional 4% HP/MP for Order Champions.",
                "icon": "icon_order_blessing.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 5
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T2_O1",
                "name": "Lesser Aegis Conditioning",
                "description": "All Order Champions gain +10% base Physicality.",
                "icon": "icon_order_conditioning.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_ORDER_T2_O2",
                "name": "Lesser Echo of Order",
                "description": "Start each run with an additional 20 Physicality for the first 3 battles.",
                "icon": "icon_order_echo.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_ORDER_T2_O3",
                "name": "Reliquary of Aegis",
                "description": "Permanently adds the Exalted Relic 'Aegis Core' to the random drop pool.",
                "icon": "icon_order_reliquary.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 1,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_ORDER_CORE_2"
            },
            {
                "id": "AXIOM_ORDER_T2_O4",
                "name": "Lesser Blessing of Aegis",
                "description": "Rest nodes restore an additional 8% HP/MP for Order Champions.",
                "icon": "icon_order_blessing.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 10
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T3_O1",
                "name": "Adept Aegis Conditioning",
                "description": "All Order Champions gain +15% base Physicality.",
                "icon": "icon_order_conditioning.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_ORDER_T3_O2",
                "name": "The Grand Cathedral",
                "description": "Unlock a divine intervention to grant a Divine Shield (blocks 1 hit) to the entire party.",
                "icon": "icon_order_ultimate.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 1,
                "effectType": "unlock_god_ability",
                "effectValue": "GOD_CATHEDRAL"
            },
            {
                "id": "AXIOM_ORDER_T3_O3",
                "name": "Adept Order Resonance",
                "description": "Whenever you visit a Order sector, gain +6 Divine Sparks.",
                "icon": "icon_order_resonance.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_ORDER_T3_O4",
                "name": "Adept Blessing of Aegis",
                "description": "Rest nodes restore an additional 12% HP/MP for Order Champions.",
                "icon": "icon_order_blessing.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 15
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T4_O1",
                "name": "Greater Aegis Conditioning",
                "description": "All Order Champions gain +20% base Physicality.",
                "icon": "icon_order_conditioning.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_ORDER_T4_O2",
                "name": "Greater Echo of Order",
                "description": "Start each run with an additional 40 Physicality for the first 3 battles.",
                "icon": "icon_order_echo.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_ORDER_T4_O3",
                "name": "Reliquary of Aegis",
                "description": "Permanently adds the Exalted Relic 'Aegis Core' to the random drop pool.",
                "icon": "icon_order_reliquary.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 1,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_ORDER_CORE_4"
            },
            {
                "id": "AXIOM_ORDER_T4_O4",
                "name": "Greater Blessing of Aegis",
                "description": "Rest nodes restore an additional 16% HP/MP for Order Champions.",
                "icon": "icon_order_blessing.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 20
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T5_O1",
                "name": "Grand Aegis Conditioning",
                "description": "All Order Champions gain +25% base Physicality.",
                "icon": "icon_order_conditioning.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_ORDER_T5_O2",
                "name": "Aegis Rescue Protocol",
                "description": "Unlocks a powerful new Order-aligned Champion for your roster.",
                "icon": "icon_order_rescue.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 1,
                "effectType": "unlock_character",
                "effectValue": "CHR_ORD_NEW_5"
            },
            {
                "id": "AXIOM_ORDER_T5_O3",
                "name": "Grand Order Resonance",
                "description": "Whenever you visit a Order sector, gain +10 Divine Sparks.",
                "icon": "icon_order_resonance.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_ORDER_T5_O4",
                "name": "Grand Blessing of Aegis",
                "description": "Rest nodes restore an additional 20% HP/MP for Order Champions.",
                "icon": "icon_order_blessing.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 25
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T6_O1",
                "name": "Exalted Aegis Conditioning",
                "description": "All Order Champions gain +30% base Physicality.",
                "icon": "icon_order_conditioning.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 30
            },
            {
                "id": "AXIOM_ORDER_T6_O2",
                "name": "Absolute Decree",
                "description": "Unlock a divine intervention to strip all buffs from all enemies and all debuffs from all allies.",
                "icon": "icon_order_ultimate.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 1,
                "effectType": "unlock_god_ability",
                "effectValue": "GOD_DECREE"
            },
            {
                "id": "AXIOM_ORDER_T6_O3",
                "name": "Reliquary of Aegis",
                "description": "Permanently adds the Exalted Relic 'Aegis Core' to the random drop pool.",
                "icon": "icon_order_reliquary.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 1,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_ORDER_CORE_6"
            },
            {
                "id": "AXIOM_ORDER_T6_O4",
                "name": "Exalted Blessing of Aegis",
                "description": "Rest nodes restore an additional 24% HP/MP for Order Champions.",
                "icon": "icon_order_blessing.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 30
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T7_O1",
                "name": "Divine Aegis Conditioning",
                "description": "All Order Champions gain +35% base Physicality.",
                "icon": "icon_order_conditioning.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_ORDER_T7_O2",
                "name": "Divine Echo of Order",
                "description": "Start each run with an additional 70 Physicality for the first 3 battles.",
                "icon": "icon_order_echo.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_ORDER_T7_O3",
                "name": "Divine Order Resonance",
                "description": "Whenever you visit a Order sector, gain +14 Divine Sparks.",
                "icon": "icon_order_resonance.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_ORDER_T7_O4",
                "name": "Divine Blessing of Aegis",
                "description": "Rest nodes restore an additional 28% HP/MP for Order Champions.",
                "icon": "icon_order_blessing.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T8_O1",
                "name": "Temporal Rewind",
                "description": "Unlock a divine intervention to restore the entire party to their HP/MP states at the start of combat.",
                "icon": "icon_order_ultimate.png",
                "tier": 8,
                "cost": 160,
                "reqPoints": 560,
                "maxLevel": 1,
                "effectType": "unlock_god_ability",
                "effectValue": "GOD_REWIND"
            },
            {
                "id": "AXIOM_ORDER_T8_O2",
                "name": "Avatar of Order",
                "description": "In Boss encounters, all Champions gain immense Physicality and apply Shielding on hit for 3 turns.",
                "icon": "icon_order_avatar.png",
                "tier": 8,
                "cost": 160,
                "reqPoints": 560,
                "maxLevel": 1,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_ORDER"
            },
            {
                "id": "AXIOM_ORDER_T8_O3",
                "name": "Reliquary of the Throne",
                "description": "Unlocks the ability to bring one additional Relic into each run.",
                "icon": "icon_order_reliquary.png",
                "tier": 8,
                "cost": 200,
                "reqPoints": 600,
                "maxLevel": 1,
                "effectType": "meta_unlock",
                "effectValue": "EXTRA_RELIC_SLOT"
            }
        ]
    ],
    "Chaos": [
        [
            {
                "id": "AXIOM_CHAOS_T1_O1",
                "name": "Minor Maelstrom Conditioning",
                "description": "All Chaos Champions gain +5% base Speed.",
                "icon": "icon_chaos_conditioning.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_CHAOS_T1_O2",
                "name": "Maelstrom Rescue Protocol",
                "description": "Unlocks a powerful new Chaos-aligned Champion for your roster.",
                "icon": "icon_chaos_rescue.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 1,
                "effectType": "unlock_character",
                "effectValue": "CHR_CHA_NEW_1"
            },
            {
                "id": "AXIOM_CHAOS_T1_O3",
                "name": "Minor Chaos Resonance",
                "description": "Whenever you visit a Chaos sector, gain +2 Divine Sparks.",
                "icon": "icon_chaos_resonance.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_CHAOS_T1_O4",
                "name": "Minor Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 4% HP/MP for Chaos Champions.",
                "icon": "icon_chaos_blessing.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 5
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T2_O1",
                "name": "Lesser Maelstrom Conditioning",
                "description": "All Chaos Champions gain +10% base Speed.",
                "icon": "icon_chaos_conditioning.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_CHAOS_T2_O2",
                "name": "Lesser Echo of Chaos",
                "description": "Start each run with an additional 20 Speed for the first 3 battles.",
                "icon": "icon_chaos_echo.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_CHAOS_T2_O3",
                "name": "Reliquary of Maelstrom",
                "description": "Permanently adds the Exalted Relic 'Maelstrom Core' to the random drop pool.",
                "icon": "icon_chaos_reliquary.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 1,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_CHAOS_CORE_2"
            },
            {
                "id": "AXIOM_CHAOS_T2_O4",
                "name": "Lesser Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 8% HP/MP for Chaos Champions.",
                "icon": "icon_chaos_blessing.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 10
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T3_O1",
                "name": "Adept Maelstrom Conditioning",
                "description": "All Chaos Champions gain +15% base Speed.",
                "icon": "icon_chaos_conditioning.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_CHAOS_T3_O2",
                "name": "Maelstrom Unleashed",
                "description": "Unlock a divine intervention to guarantee that the next 3 multi-hit skills strike their maximum number of times.",
                "icon": "icon_chaos_ultimate.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 1,
                "effectType": "unlock_god_ability",
                "effectValue": "GOD_UNLEASHED"
            },
            {
                "id": "AXIOM_CHAOS_T3_O3",
                "name": "Adept Chaos Resonance",
                "description": "Whenever you visit a Chaos sector, gain +6 Divine Sparks.",
                "icon": "icon_chaos_resonance.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_CHAOS_T3_O4",
                "name": "Adept Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 12% HP/MP for Chaos Champions.",
                "icon": "icon_chaos_blessing.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 15
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T4_O1",
                "name": "Greater Maelstrom Conditioning",
                "description": "All Chaos Champions gain +20% base Speed.",
                "icon": "icon_chaos_conditioning.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_CHAOS_T4_O2",
                "name": "Greater Echo of Chaos",
                "description": "Start each run with an additional 40 Speed for the first 3 battles.",
                "icon": "icon_chaos_echo.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_CHAOS_T4_O3",
                "name": "Reliquary of Maelstrom",
                "description": "Permanently adds the Exalted Relic 'Maelstrom Core' to the random drop pool.",
                "icon": "icon_chaos_reliquary.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 1,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_CHAOS_CORE_4"
            },
            {
                "id": "AXIOM_CHAOS_T4_O4",
                "name": "Greater Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 16% HP/MP for Chaos Champions.",
                "icon": "icon_chaos_blessing.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 20
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T5_O1",
                "name": "Grand Maelstrom Conditioning",
                "description": "All Chaos Champions gain +25% base Speed.",
                "icon": "icon_chaos_conditioning.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_CHAOS_T5_O2",
                "name": "Maelstrom Rescue Protocol",
                "description": "Unlocks a powerful new Chaos-aligned Champion for your roster.",
                "icon": "icon_chaos_rescue.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 1,
                "effectType": "unlock_character",
                "effectValue": "CHR_CHA_NEW_5"
            },
            {
                "id": "AXIOM_CHAOS_T5_O3",
                "name": "Grand Chaos Resonance",
                "description": "Whenever you visit a Chaos sector, gain +10 Divine Sparks.",
                "icon": "icon_chaos_resonance.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_CHAOS_T5_O4",
                "name": "Grand Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 20% HP/MP for Chaos Champions.",
                "icon": "icon_chaos_blessing.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 25
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T6_O1",
                "name": "Exalted Maelstrom Conditioning",
                "description": "All Chaos Champions gain +30% base Speed.",
                "icon": "icon_chaos_conditioning.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 30
            },
            {
                "id": "AXIOM_CHAOS_T6_O2",
                "name": "Primal Big Bang",
                "description": "Unlock a divine intervention causing your next critical strike to deal 50% splash damage to all other enemies.",
                "icon": "icon_chaos_ultimate.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 1,
                "effectType": "unlock_god_ability",
                "effectValue": "GOD_BIG_BANG"
            },
            {
                "id": "AXIOM_CHAOS_T6_O3",
                "name": "Reliquary of Maelstrom",
                "description": "Permanently adds the Exalted Relic 'Maelstrom Core' to the random drop pool.",
                "icon": "icon_chaos_reliquary.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 1,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_CHAOS_CORE_6"
            },
            {
                "id": "AXIOM_CHAOS_T6_O4",
                "name": "Exalted Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 24% HP/MP for Chaos Champions.",
                "icon": "icon_chaos_blessing.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 30
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T7_O1",
                "name": "Divine Maelstrom Conditioning",
                "description": "All Chaos Champions gain +35% base Speed.",
                "icon": "icon_chaos_conditioning.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_CHAOS_T7_O2",
                "name": "Divine Echo of Chaos",
                "description": "Start each run with an additional 70 Speed for the first 3 battles.",
                "icon": "icon_chaos_echo.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_CHAOS_T7_O3",
                "name": "Divine Chaos Resonance",
                "description": "Whenever you visit a Chaos sector, gain +14 Divine Sparks.",
                "icon": "icon_chaos_resonance.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_CHAOS_T7_O4",
                "name": "Divine Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 28% HP/MP for Chaos Champions.",
                "icon": "icon_chaos_blessing.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T8_O1",
                "name": "World Breaker",
                "description": "Unlock a divine intervention to cause the next 3 Spiritual attacks to ignore 100% of enemy Spirit Resistance.",
                "icon": "icon_chaos_ultimate.png",
                "tier": 8,
                "cost": 160,
                "reqPoints": 560,
                "maxLevel": 1,
                "effectType": "unlock_god_ability",
                "effectValue": "GOD_WORLD_BREAKER"
            },
            {
                "id": "AXIOM_CHAOS_T8_O2",
                "name": "Avatar of Chaos",
                "description": "In Boss encounters, all Champions gain immense Speed and apply Burn on hit for 3 turns.",
                "icon": "icon_chaos_avatar.png",
                "tier": 8,
                "cost": 160,
                "reqPoints": 560,
                "maxLevel": 1,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_CHAOS"
            },
            {
                "id": "AXIOM_CHAOS_T8_O3",
                "name": "Maelstrom Core Synthesis",
                "description": "Unlocks the ability to start each run with one random Chaos-aligned Relic.",
                "icon": "icon_chaos_reliquary.png",
                "tier": 8,
                "cost": 200,
                "reqPoints": 600,
                "maxLevel": 1,
                "effectType": "meta_unlock",
                "effectValue": "STARTING_CHAOS_RELIC"
            }
        ]
    ],
    "Judgment": [
        [
            {
                "id": "AXIOM_JUDGMENT_T1_O1",
                "name": "Minor Verdict Conditioning",
                "description": "All Judgment Champions gain +5% base Authority.",
                "icon": "icon_judgment_conditioning.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_JUDGMENT_T1_O2",
                "name": "Verdict Rescue Protocol",
                "description": "Unlocks a powerful new Judgment-aligned Champion for your roster.",
                "icon": "icon_judgment_rescue.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 1,
                "effectType": "unlock_character",
                "effectValue": "CHR_JUD_NEW_1"
            },
            {
                "id": "AXIOM_JUDGMENT_T1_O3",
                "name": "Minor Judgment Resonance",
                "description": "Whenever you visit a Judgment sector, gain +2 Divine Sparks.",
                "icon": "icon_judgment_resonance.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_JUDGMENT_T1_O4",
                "name": "Minor Blessing of Verdict",
                "description": "Rest nodes restore an additional 4% HP/MP for Judgment Champions.",
                "icon": "icon_judgment_blessing.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 5
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T2_O1",
                "name": "Lesser Verdict Conditioning",
                "description": "All Judgment Champions gain +10% base Authority.",
                "icon": "icon_judgment_conditioning.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_JUDGMENT_T2_O2",
                "name": "Lesser Echo of Judgment",
                "description": "Start each run with an additional 20 Authority for the first 3 battles.",
                "icon": "icon_judgment_echo.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_JUDGMENT_T2_O3",
                "name": "Reliquary of Verdict",
                "description": "Permanently adds the Exalted Relic 'Verdict Core' to the random drop pool.",
                "icon": "icon_judgment_reliquary.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 1,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_JUDGMENT_CORE_2"
            },
            {
                "id": "AXIOM_JUDGMENT_T2_O4",
                "name": "Lesser Blessing of Verdict",
                "description": "Rest nodes restore an additional 8% HP/MP for Judgment Champions.",
                "icon": "icon_judgment_blessing.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 10
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T3_O1",
                "name": "Adept Verdict Conditioning",
                "description": "All Judgment Champions gain +15% base Authority.",
                "icon": "icon_judgment_conditioning.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_JUDGMENT_T3_O2",
                "name": "Heat Death",
                "description": "Unlock a divine intervention to instantly trigger all Damage-over-Time effects on all enemies twice.",
                "icon": "icon_judgment_ultimate.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 1,
                "effectType": "unlock_god_ability",
                "effectValue": "GOD_HEAT_DEATH"
            },
            {
                "id": "AXIOM_JUDGMENT_T3_O3",
                "name": "Adept Judgment Resonance",
                "description": "Whenever you visit a Judgment sector, gain +6 Divine Sparks.",
                "icon": "icon_judgment_resonance.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_JUDGMENT_T3_O4",
                "name": "Adept Blessing of Verdict",
                "description": "Rest nodes restore an additional 12% HP/MP for Judgment Champions.",
                "icon": "icon_judgment_blessing.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 15
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T4_O1",
                "name": "Greater Verdict Conditioning",
                "description": "All Judgment Champions gain +20% base Authority.",
                "icon": "icon_judgment_conditioning.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_JUDGMENT_T4_O2",
                "name": "Greater Echo of Judgment",
                "description": "Start each run with an additional 40 Authority for the first 3 battles.",
                "icon": "icon_judgment_echo.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_JUDGMENT_T4_O3",
                "name": "Reliquary of Verdict",
                "description": "Permanently adds the Exalted Relic 'Verdict Core' to the random drop pool.",
                "icon": "icon_judgment_reliquary.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 1,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_JUDGMENT_CORE_4"
            },
            {
                "id": "AXIOM_JUDGMENT_T4_O4",
                "name": "Greater Blessing of Verdict",
                "description": "Rest nodes restore an additional 16% HP/MP for Judgment Champions.",
                "icon": "icon_judgment_blessing.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 20
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T5_O1",
                "name": "Grand Verdict Conditioning",
                "description": "All Judgment Champions gain +25% base Authority.",
                "icon": "icon_judgment_conditioning.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_JUDGMENT_T5_O2",
                "name": "Verdict Rescue Protocol",
                "description": "Unlocks a powerful new Judgment-aligned Champion for your roster.",
                "icon": "icon_judgment_rescue.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 1,
                "effectType": "unlock_character",
                "effectValue": "CHR_JUD_NEW_5"
            },
            {
                "id": "AXIOM_JUDGMENT_T5_O3",
                "name": "Grand Judgment Resonance",
                "description": "Whenever you visit a Judgment sector, gain +10 Divine Sparks.",
                "icon": "icon_judgment_resonance.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_JUDGMENT_T5_O4",
                "name": "Grand Blessing of Verdict",
                "description": "Rest nodes restore an additional 20% HP/MP for Judgment Champions.",
                "icon": "icon_judgment_blessing.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 25
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T6_O1",
                "name": "Exalted Verdict Conditioning",
                "description": "All Judgment Champions gain +30% base Authority.",
                "icon": "icon_judgment_conditioning.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 30
            },
            {
                "id": "AXIOM_JUDGMENT_T6_O2",
                "name": "The Great Silence",
                "description": "Unlock a divine intervention that prevents all enemies from using Spiritual skills for the next 2 rounds.",
                "icon": "icon_judgment_ultimate.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 1,
                "effectType": "unlock_god_ability",
                "effectValue": "GOD_SILENCE"
            },
            {
                "id": "AXIOM_JUDGMENT_T6_O3",
                "name": "Reliquary of Verdict",
                "description": "Permanently adds the Exalted Relic 'Verdict Core' to the random drop pool.",
                "icon": "icon_judgment_reliquary.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 1,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_JUDGMENT_CORE_6"
            },
            {
                "id": "AXIOM_JUDGMENT_T6_O4",
                "name": "Exalted Blessing of Verdict",
                "description": "Rest nodes restore an additional 24% HP/MP for Judgment Champions.",
                "icon": "icon_judgment_blessing.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 30
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T7_O1",
                "name": "Divine Verdict Conditioning",
                "description": "All Judgment Champions gain +35% base Authority.",
                "icon": "icon_judgment_conditioning.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_JUDGMENT_T7_O2",
                "name": "Divine Echo of Judgment",
                "description": "Start each run with an additional 70 Authority for the first 3 battles.",
                "icon": "icon_judgment_echo.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_JUDGMENT_T7_O3",
                "name": "Divine Judgment Resonance",
                "description": "Whenever you visit a Judgment sector, gain +14 Divine Sparks.",
                "icon": "icon_judgment_resonance.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_JUDGMENT_T7_O4",
                "name": "Divine Blessing of Verdict",
                "description": "Rest nodes restore an additional 28% HP/MP for Judgment Champions.",
                "icon": "icon_judgment_blessing.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T8_O1",
                "name": "Absolute Zero",
                "description": "Unlock a divine intervention to instantly execute any non-boss enemy below 30% HP.",
                "icon": "icon_judgment_ultimate.png",
                "tier": 8,
                "cost": 160,
                "reqPoints": 560,
                "maxLevel": 1,
                "effectType": "unlock_god_ability",
                "effectValue": "GOD_ABS_ZERO"
            },
            {
                "id": "AXIOM_JUDGMENT_T8_O2",
                "name": "Avatar of Judgment",
                "description": "In Boss encounters, all Champions gain immense Authority and apply Vulnerability on hit for 3 turns.",
                "icon": "icon_judgment_avatar.png",
                "tier": 8,
                "cost": 160,
                "reqPoints": 560,
                "maxLevel": 1,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_JUDGMENT"
            },
            {
                "id": "AXIOM_JUDGMENT_T8_O3",
                "name": "Verdict Core Unification",
                "description": "Unlocks the ability to bring one additional Divine Spark fuel container (Start with +5 Sparks).",
                "icon": "icon_judgment_reliquary.png",
                "tier": 8,
                "cost": 200,
                "reqPoints": 600,
                "maxLevel": 1,
                "effectType": "meta_unlock",
                "effectValue": "EXTRA_FUEL"
            }
        ]
    ],
    "Love": [
        [
            {
                "id": "AXIOM_LOVE_T1_O1",
                "name": "Minor Embrace Conditioning",
                "description": "All Love Champions gain +5% base Capacity.",
                "icon": "icon_love_conditioning.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_LOVE_T1_O2",
                "name": "Embrace Rescue Protocol",
                "description": "Unlocks a powerful new Love-aligned Champion for your roster.",
                "icon": "icon_love_rescue.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 1,
                "effectType": "unlock_character",
                "effectValue": "CHR_LOV_NEW_1"
            },
            {
                "id": "AXIOM_LOVE_T1_O3",
                "name": "Minor Love Resonance",
                "description": "Whenever you visit a Love sector, gain +2 Divine Sparks.",
                "icon": "icon_love_resonance.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_LOVE_T1_O4",
                "name": "Minor Blessing of Embrace",
                "description": "Rest nodes restore an additional 4% HP/MP for Love Champions.",
                "icon": "icon_love_blessing.png",
                "tier": 1,
                "cost": 20,
                "reqPoints": 0,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 5
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T2_O1",
                "name": "Lesser Embrace Conditioning",
                "description": "All Love Champions gain +10% base Capacity.",
                "icon": "icon_love_conditioning.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_LOVE_T2_O2",
                "name": "Lesser Echo of Love",
                "description": "Start each run with an additional 20 Capacity for the first 3 battles.",
                "icon": "icon_love_echo.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_LOVE_T2_O3",
                "name": "Reliquary of Embrace",
                "description": "Permanently adds the Exalted Relic 'Embrace Core' to the random drop pool.",
                "icon": "icon_love_reliquary.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 1,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_LOVE_CORE_2"
            },
            {
                "id": "AXIOM_LOVE_T2_O4",
                "name": "Lesser Blessing of Embrace",
                "description": "Rest nodes restore an additional 8% HP/MP for Love Champions.",
                "icon": "icon_love_blessing.png",
                "tier": 2,
                "cost": 40,
                "reqPoints": 20,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 10
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T3_O1",
                "name": "Adept Embrace Conditioning",
                "description": "All Love Champions gain +15% base Capacity.",
                "icon": "icon_love_conditioning.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_LOVE_T3_O2",
                "name": "Hive Mind",
                "description": "Unlock a divine intervention that distributes all damage taken by any champion evenly across the party for 3 turns.",
                "icon": "icon_love_ultimate.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 1,
                "effectType": "unlock_god_ability",
                "effectValue": "GOD_HIVE_MIND"
            },
            {
                "id": "AXIOM_LOVE_T3_O3",
                "name": "Adept Love Resonance",
                "description": "Whenever you visit a Love sector, gain +6 Divine Sparks.",
                "icon": "icon_love_resonance.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_LOVE_T3_O4",
                "name": "Adept Blessing of Embrace",
                "description": "Rest nodes restore an additional 12% HP/MP for Love Champions.",
                "icon": "icon_love_blessing.png",
                "tier": 3,
                "cost": 60,
                "reqPoints": 60,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 15
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T4_O1",
                "name": "Greater Embrace Conditioning",
                "description": "All Love Champions gain +20% base Capacity.",
                "icon": "icon_love_conditioning.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_LOVE_T4_O2",
                "name": "Greater Echo of Love",
                "description": "Start each run with an additional 40 Capacity for the first 3 battles.",
                "icon": "icon_love_echo.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_LOVE_T4_O3",
                "name": "Reliquary of Embrace",
                "description": "Permanently adds the Exalted Relic 'Embrace Core' to the random drop pool.",
                "icon": "icon_love_reliquary.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 1,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_LOVE_CORE_4"
            },
            {
                "id": "AXIOM_LOVE_T4_O4",
                "name": "Greater Blessing of Embrace",
                "description": "Rest nodes restore an additional 16% HP/MP for Love Champions.",
                "icon": "icon_love_blessing.png",
                "tier": 4,
                "cost": 80,
                "reqPoints": 120,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 20
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T5_O1",
                "name": "Grand Embrace Conditioning",
                "description": "All Love Champions gain +25% base Capacity.",
                "icon": "icon_love_conditioning.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_LOVE_T5_O2",
                "name": "Embrace Rescue Protocol",
                "description": "Unlocks a powerful new Love-aligned Champion for your roster.",
                "icon": "icon_love_rescue.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 1,
                "effectType": "unlock_character",
                "effectValue": "CHR_LOV_NEW_5"
            },
            {
                "id": "AXIOM_LOVE_T5_O3",
                "name": "Grand Love Resonance",
                "description": "Whenever you visit a Love sector, gain +10 Divine Sparks.",
                "icon": "icon_love_resonance.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_LOVE_T5_O4",
                "name": "Grand Blessing of Embrace",
                "description": "Rest nodes restore an additional 20% HP/MP for Love Champions.",
                "icon": "icon_love_blessing.png",
                "tier": 5,
                "cost": 100,
                "reqPoints": 200,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 25
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T6_O1",
                "name": "Exalted Embrace Conditioning",
                "description": "All Love Champions gain +30% base Capacity.",
                "icon": "icon_love_conditioning.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 30
            },
            {
                "id": "AXIOM_LOVE_T6_O2",
                "name": "Genesis",
                "description": "Unlock a divine intervention that heals the party for 50% Max HP and permanently increases Max HP by 20% for this run.",
                "icon": "icon_love_ultimate.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 1,
                "effectType": "unlock_god_ability",
                "effectValue": "GOD_GENESIS"
            },
            {
                "id": "AXIOM_LOVE_T6_O3",
                "name": "Reliquary of Embrace",
                "description": "Permanently adds the Exalted Relic 'Embrace Core' to the random drop pool.",
                "icon": "icon_love_reliquary.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 1,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_LOVE_CORE_6"
            },
            {
                "id": "AXIOM_LOVE_T6_O4",
                "name": "Exalted Blessing of Embrace",
                "description": "Rest nodes restore an additional 24% HP/MP for Love Champions.",
                "icon": "icon_love_blessing.png",
                "tier": 6,
                "cost": 120,
                "reqPoints": 300,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 30
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T7_O1",
                "name": "Divine Embrace Conditioning",
                "description": "All Love Champions gain +35% base Capacity.",
                "icon": "icon_love_conditioning.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_LOVE_T7_O2",
                "name": "Divine Echo of Love",
                "description": "Start each run with an additional 70 Capacity for the first 3 battles.",
                "icon": "icon_love_echo.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_LOVE_T7_O3",
                "name": "Divine Love Resonance",
                "description": "Whenever you visit a Love sector, gain +14 Divine Sparks.",
                "icon": "icon_love_resonance.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_LOVE_T7_O4",
                "name": "Divine Blessing of Embrace",
                "description": "Rest nodes restore an additional 28% HP/MP for Love Champions.",
                "icon": "icon_love_blessing.png",
                "tier": 7,
                "cost": 140,
                "reqPoints": 420,
                "maxLevel": 3,
                "effectType": "passive",
                "effectValue": 35
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T8_O1",
                "name": "Unconditional Love",
                "description": "Unlock a divine intervention that prevents the next lethal hit on any champion, leaving them at 1 HP instead.",
                "icon": "icon_love_ultimate.png",
                "tier": 8,
                "cost": 160,
                "reqPoints": 560,
                "maxLevel": 1,
                "effectType": "unlock_god_ability",
                "effectValue": "GOD_LOVE"
            },
            {
                "id": "AXIOM_LOVE_T8_O2",
                "name": "Avatar of Love",
                "description": "In Boss encounters, all Champions gain immense Capacity and apply Regen on hit for 3 turns.",
                "icon": "icon_love_avatar.png",
                "tier": 8,
                "cost": 160,
                "reqPoints": 560,
                "maxLevel": 1,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_LOVE"
            },
            {
                "id": "AXIOM_LOVE_T8_O3",
                "name": "Embrace Core Synthesis",
                "description": "Unlocks the ability to bring one additional Restorative Item into each run.",
                "icon": "icon_love_reliquary.png",
                "tier": 8,
                "cost": 200,
                "reqPoints": 600,
                "maxLevel": 1,
                "effectType": "meta_unlock",
                "effectValue": "EXTRA_ITEM_SLOT"
            }
        ]
    ]
};
