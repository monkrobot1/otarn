export interface AxiomTalent {
    id: string;
    name: string;
    description: string;
    tier: number;
    cost: number;
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
                "tier": 1,
                "cost": 15,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_ORDER_T1_O2",
                "name": "Aegis Rescue Protocol",
                "description": "Unlocks a powerful new Order-aligned Champion for your roster.",
                "tier": 1,
                "cost": 15,
                "effectType": "unlock_character",
                "effectValue": "CHR_ORD_NEW_1"
            },
            {
                "id": "AXIOM_ORDER_T1_O3",
                "name": "Minor Order Resonance",
                "description": "Whenever you visit a Order sector, gain +2 Divine Sparks.",
                "tier": 1,
                "cost": 15,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_ORDER_T1_O4",
                "name": "Minor Blessing of Aegis",
                "description": "Rest nodes restore an additional 4% HP/MP for Order Champions.",
                "tier": 1,
                "cost": 15,
                "effectType": "passive",
                "effectValue": 5
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T2_O1",
                "name": "Lesser Aegis Conditioning",
                "description": "All Order Champions gain +10% base Physicality.",
                "tier": 2,
                "cost": 30,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_ORDER_T2_O2",
                "name": "Lesser Echo of Order",
                "description": "Start each run with an additional 20 Physicality for the first 3 battles.",
                "tier": 2,
                "cost": 30,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_ORDER_T2_O3",
                "name": "Reliquary of Aegis",
                "description": "Permanently adds the Exalted Relic 'Aegis Core' to the random drop pool.",
                "tier": 2,
                "cost": 30,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_ORDER_CORE_2"
            },
            {
                "id": "AXIOM_ORDER_T2_O4",
                "name": "Lesser Blessing of Aegis",
                "description": "Rest nodes restore an additional 8% HP/MP for Order Champions.",
                "tier": 2,
                "cost": 30,
                "effectType": "passive",
                "effectValue": 10
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T3_O1",
                "name": "Adept Aegis Conditioning",
                "description": "All Order Champions gain +15% base Physicality.",
                "tier": 3,
                "cost": 45,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_ORDER_T3_O2",
                "name": "Aegis Rescue Protocol",
                "description": "Unlocks a powerful new Order-aligned Champion for your roster.",
                "tier": 3,
                "cost": 45,
                "effectType": "unlock_character",
                "effectValue": "CHR_ORD_NEW_3"
            },
            {
                "id": "AXIOM_ORDER_T3_O3",
                "name": "Adept Order Resonance",
                "description": "Whenever you visit a Order sector, gain +6 Divine Sparks.",
                "tier": 3,
                "cost": 45,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_ORDER_T3_O4",
                "name": "Adept Blessing of Aegis",
                "description": "Rest nodes restore an additional 12% HP/MP for Order Champions.",
                "tier": 3,
                "cost": 45,
                "effectType": "passive",
                "effectValue": 15
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T4_O1",
                "name": "Greater Aegis Conditioning",
                "description": "All Order Champions gain +20% base Physicality.",
                "tier": 4,
                "cost": 60,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_ORDER_T4_O2",
                "name": "Greater Echo of Order",
                "description": "Start each run with an additional 40 Physicality for the first 3 battles.",
                "tier": 4,
                "cost": 60,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_ORDER_T4_O3",
                "name": "Reliquary of Aegis",
                "description": "Permanently adds the Exalted Relic 'Aegis Core' to the random drop pool.",
                "tier": 4,
                "cost": 60,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_ORDER_CORE_4"
            },
            {
                "id": "AXIOM_ORDER_T4_O4",
                "name": "Greater Blessing of Aegis",
                "description": "Rest nodes restore an additional 16% HP/MP for Order Champions.",
                "tier": 4,
                "cost": 60,
                "effectType": "passive",
                "effectValue": 20
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T5_O1",
                "name": "Grand Aegis Conditioning",
                "description": "All Order Champions gain +25% base Physicality.",
                "tier": 5,
                "cost": 75,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_ORDER_T5_O2",
                "name": "Aegis Rescue Protocol",
                "description": "Unlocks a powerful new Order-aligned Champion for your roster.",
                "tier": 5,
                "cost": 75,
                "effectType": "unlock_character",
                "effectValue": "CHR_ORD_NEW_5"
            },
            {
                "id": "AXIOM_ORDER_T5_O3",
                "name": "Grand Order Resonance",
                "description": "Whenever you visit a Order sector, gain +10 Divine Sparks.",
                "tier": 5,
                "cost": 75,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_ORDER_T5_O4",
                "name": "Grand Blessing of Aegis",
                "description": "Rest nodes restore an additional 20% HP/MP for Order Champions.",
                "tier": 5,
                "cost": 75,
                "effectType": "passive",
                "effectValue": 25
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T6_O1",
                "name": "Exalted Aegis Conditioning",
                "description": "All Order Champions gain +30% base Physicality.",
                "tier": 6,
                "cost": 90,
                "effectType": "passive",
                "effectValue": 30
            },
            {
                "id": "AXIOM_ORDER_T6_O2",
                "name": "Exalted Echo of Order",
                "description": "Start each run with an additional 60 Physicality for the first 3 battles.",
                "tier": 6,
                "cost": 90,
                "effectType": "passive",
                "effectValue": 30
            },
            {
                "id": "AXIOM_ORDER_T6_O3",
                "name": "Reliquary of Aegis",
                "description": "Permanently adds the Exalted Relic 'Aegis Core' to the random drop pool.",
                "tier": 6,
                "cost": 90,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_ORDER_CORE_6"
            },
            {
                "id": "AXIOM_ORDER_T6_O4",
                "name": "Exalted Blessing of Aegis",
                "description": "Rest nodes restore an additional 24% HP/MP for Order Champions.",
                "tier": 6,
                "cost": 90,
                "effectType": "passive",
                "effectValue": 30
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T7_O1",
                "name": "Divine Aegis Conditioning",
                "description": "All Order Champions gain +35% base Physicality.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_ORDER_T7_O2",
                "name": "Divine Echo of Order",
                "description": "Start each run with an additional 70 Physicality for the first 3 battles.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_ORDER_T7_O3",
                "name": "Divine Order Resonance",
                "description": "Whenever you visit a Order sector, gain +14 Divine Sparks.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_ORDER_T7_O4",
                "name": "Divine Blessing of Aegis",
                "description": "Rest nodes restore an additional 28% HP/MP for Order Champions.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            }
        ],
        [
            {
                "id": "AXIOM_ORDER_T8_O1",
                "name": "Avatar of Order",
                "description": "In Boss encounters, all Champions gain immense Physicality and apply Shielding on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_ORDER"
            },
            {
                "id": "AXIOM_ORDER_T8_O2",
                "name": "Avatar of Order",
                "description": "In Boss encounters, all Champions gain immense Physicality and apply Shielding on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_ORDER"
            },
            {
                "id": "AXIOM_ORDER_T8_O3",
                "name": "Avatar of Order",
                "description": "In Boss encounters, all Champions gain immense Physicality and apply Shielding on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_ORDER"
            },
            {
                "id": "AXIOM_ORDER_T8_O4",
                "name": "Avatar of Order",
                "description": "In Boss encounters, all Champions gain immense Physicality and apply Shielding on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_ORDER"
            }
        ]
    ],
    "Chaos": [
        [
            {
                "id": "AXIOM_CHAOS_T1_O1",
                "name": "Minor Maelstrom Conditioning",
                "description": "All Chaos Champions gain +5% base Speed.",
                "tier": 1,
                "cost": 15,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_CHAOS_T1_O2",
                "name": "Maelstrom Rescue Protocol",
                "description": "Unlocks a powerful new Chaos-aligned Champion for your roster.",
                "tier": 1,
                "cost": 15,
                "effectType": "unlock_character",
                "effectValue": "CHR_CHA_NEW_1"
            },
            {
                "id": "AXIOM_CHAOS_T1_O3",
                "name": "Minor Chaos Resonance",
                "description": "Whenever you visit a Chaos sector, gain +2 Divine Sparks.",
                "tier": 1,
                "cost": 15,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_CHAOS_T1_O4",
                "name": "Minor Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 4% HP/MP for Chaos Champions.",
                "tier": 1,
                "cost": 15,
                "effectType": "passive",
                "effectValue": 5
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T2_O1",
                "name": "Lesser Maelstrom Conditioning",
                "description": "All Chaos Champions gain +10% base Speed.",
                "tier": 2,
                "cost": 30,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_CHAOS_T2_O2",
                "name": "Lesser Echo of Chaos",
                "description": "Start each run with an additional 20 Speed for the first 3 battles.",
                "tier": 2,
                "cost": 30,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_CHAOS_T2_O3",
                "name": "Reliquary of Maelstrom",
                "description": "Permanently adds the Exalted Relic 'Maelstrom Core' to the random drop pool.",
                "tier": 2,
                "cost": 30,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_CHAOS_CORE_2"
            },
            {
                "id": "AXIOM_CHAOS_T2_O4",
                "name": "Lesser Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 8% HP/MP for Chaos Champions.",
                "tier": 2,
                "cost": 30,
                "effectType": "passive",
                "effectValue": 10
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T3_O1",
                "name": "Adept Maelstrom Conditioning",
                "description": "All Chaos Champions gain +15% base Speed.",
                "tier": 3,
                "cost": 45,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_CHAOS_T3_O2",
                "name": "Maelstrom Rescue Protocol",
                "description": "Unlocks a powerful new Chaos-aligned Champion for your roster.",
                "tier": 3,
                "cost": 45,
                "effectType": "unlock_character",
                "effectValue": "CHR_CHA_NEW_3"
            },
            {
                "id": "AXIOM_CHAOS_T3_O3",
                "name": "Adept Chaos Resonance",
                "description": "Whenever you visit a Chaos sector, gain +6 Divine Sparks.",
                "tier": 3,
                "cost": 45,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_CHAOS_T3_O4",
                "name": "Adept Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 12% HP/MP for Chaos Champions.",
                "tier": 3,
                "cost": 45,
                "effectType": "passive",
                "effectValue": 15
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T4_O1",
                "name": "Greater Maelstrom Conditioning",
                "description": "All Chaos Champions gain +20% base Speed.",
                "tier": 4,
                "cost": 60,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_CHAOS_T4_O2",
                "name": "Greater Echo of Chaos",
                "description": "Start each run with an additional 40 Speed for the first 3 battles.",
                "tier": 4,
                "cost": 60,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_CHAOS_T4_O3",
                "name": "Reliquary of Maelstrom",
                "description": "Permanently adds the Exalted Relic 'Maelstrom Core' to the random drop pool.",
                "tier": 4,
                "cost": 60,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_CHAOS_CORE_4"
            },
            {
                "id": "AXIOM_CHAOS_T4_O4",
                "name": "Greater Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 16% HP/MP for Chaos Champions.",
                "tier": 4,
                "cost": 60,
                "effectType": "passive",
                "effectValue": 20
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T5_O1",
                "name": "Grand Maelstrom Conditioning",
                "description": "All Chaos Champions gain +25% base Speed.",
                "tier": 5,
                "cost": 75,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_CHAOS_T5_O2",
                "name": "Maelstrom Rescue Protocol",
                "description": "Unlocks a powerful new Chaos-aligned Champion for your roster.",
                "tier": 5,
                "cost": 75,
                "effectType": "unlock_character",
                "effectValue": "CHR_CHA_NEW_5"
            },
            {
                "id": "AXIOM_CHAOS_T5_O3",
                "name": "Grand Chaos Resonance",
                "description": "Whenever you visit a Chaos sector, gain +10 Divine Sparks.",
                "tier": 5,
                "cost": 75,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_CHAOS_T5_O4",
                "name": "Grand Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 20% HP/MP for Chaos Champions.",
                "tier": 5,
                "cost": 75,
                "effectType": "passive",
                "effectValue": 25
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T6_O1",
                "name": "Exalted Maelstrom Conditioning",
                "description": "All Chaos Champions gain +30% base Speed.",
                "tier": 6,
                "cost": 90,
                "effectType": "passive",
                "effectValue": 30
            },
            {
                "id": "AXIOM_CHAOS_T6_O2",
                "name": "Exalted Echo of Chaos",
                "description": "Start each run with an additional 60 Speed for the first 3 battles.",
                "tier": 6,
                "cost": 90,
                "effectType": "passive",
                "effectValue": 30
            },
            {
                "id": "AXIOM_CHAOS_T6_O3",
                "name": "Reliquary of Maelstrom",
                "description": "Permanently adds the Exalted Relic 'Maelstrom Core' to the random drop pool.",
                "tier": 6,
                "cost": 90,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_CHAOS_CORE_6"
            },
            {
                "id": "AXIOM_CHAOS_T6_O4",
                "name": "Exalted Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 24% HP/MP for Chaos Champions.",
                "tier": 6,
                "cost": 90,
                "effectType": "passive",
                "effectValue": 30
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T7_O1",
                "name": "Divine Maelstrom Conditioning",
                "description": "All Chaos Champions gain +35% base Speed.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_CHAOS_T7_O2",
                "name": "Divine Echo of Chaos",
                "description": "Start each run with an additional 70 Speed for the first 3 battles.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_CHAOS_T7_O3",
                "name": "Divine Chaos Resonance",
                "description": "Whenever you visit a Chaos sector, gain +14 Divine Sparks.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_CHAOS_T7_O4",
                "name": "Divine Blessing of Maelstrom",
                "description": "Rest nodes restore an additional 28% HP/MP for Chaos Champions.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            }
        ],
        [
            {
                "id": "AXIOM_CHAOS_T8_O1",
                "name": "Avatar of Chaos",
                "description": "In Boss encounters, all Champions gain immense Speed and apply Burn on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_CHAOS"
            },
            {
                "id": "AXIOM_CHAOS_T8_O2",
                "name": "Avatar of Chaos",
                "description": "In Boss encounters, all Champions gain immense Speed and apply Burn on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_CHAOS"
            },
            {
                "id": "AXIOM_CHAOS_T8_O3",
                "name": "Avatar of Chaos",
                "description": "In Boss encounters, all Champions gain immense Speed and apply Burn on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_CHAOS"
            },
            {
                "id": "AXIOM_CHAOS_T8_O4",
                "name": "Avatar of Chaos",
                "description": "In Boss encounters, all Champions gain immense Speed and apply Burn on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_CHAOS"
            }
        ]
    ],
    "Judgment": [
        [
            {
                "id": "AXIOM_JUDGMENT_T1_O1",
                "name": "Minor Verdict Conditioning",
                "description": "All Judgment Champions gain +5% base Authority.",
                "tier": 1,
                "cost": 15,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_JUDGMENT_T1_O2",
                "name": "Verdict Rescue Protocol",
                "description": "Unlocks a powerful new Judgment-aligned Champion for your roster.",
                "tier": 1,
                "cost": 15,
                "effectType": "unlock_character",
                "effectValue": "CHR_JUD_NEW_1"
            },
            {
                "id": "AXIOM_JUDGMENT_T1_O3",
                "name": "Minor Judgment Resonance",
                "description": "Whenever you visit a Judgment sector, gain +2 Divine Sparks.",
                "tier": 1,
                "cost": 15,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_JUDGMENT_T1_O4",
                "name": "Minor Blessing of Verdict",
                "description": "Rest nodes restore an additional 4% HP/MP for Judgment Champions.",
                "tier": 1,
                "cost": 15,
                "effectType": "passive",
                "effectValue": 5
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T2_O1",
                "name": "Lesser Verdict Conditioning",
                "description": "All Judgment Champions gain +10% base Authority.",
                "tier": 2,
                "cost": 30,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_JUDGMENT_T2_O2",
                "name": "Lesser Echo of Judgment",
                "description": "Start each run with an additional 20 Authority for the first 3 battles.",
                "tier": 2,
                "cost": 30,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_JUDGMENT_T2_O3",
                "name": "Reliquary of Verdict",
                "description": "Permanently adds the Exalted Relic 'Verdict Core' to the random drop pool.",
                "tier": 2,
                "cost": 30,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_JUDGMENT_CORE_2"
            },
            {
                "id": "AXIOM_JUDGMENT_T2_O4",
                "name": "Lesser Blessing of Verdict",
                "description": "Rest nodes restore an additional 8% HP/MP for Judgment Champions.",
                "tier": 2,
                "cost": 30,
                "effectType": "passive",
                "effectValue": 10
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T3_O1",
                "name": "Adept Verdict Conditioning",
                "description": "All Judgment Champions gain +15% base Authority.",
                "tier": 3,
                "cost": 45,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_JUDGMENT_T3_O2",
                "name": "Verdict Rescue Protocol",
                "description": "Unlocks a powerful new Judgment-aligned Champion for your roster.",
                "tier": 3,
                "cost": 45,
                "effectType": "unlock_character",
                "effectValue": "CHR_JUD_NEW_3"
            },
            {
                "id": "AXIOM_JUDGMENT_T3_O3",
                "name": "Adept Judgment Resonance",
                "description": "Whenever you visit a Judgment sector, gain +6 Divine Sparks.",
                "tier": 3,
                "cost": 45,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_JUDGMENT_T3_O4",
                "name": "Adept Blessing of Verdict",
                "description": "Rest nodes restore an additional 12% HP/MP for Judgment Champions.",
                "tier": 3,
                "cost": 45,
                "effectType": "passive",
                "effectValue": 15
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T4_O1",
                "name": "Greater Verdict Conditioning",
                "description": "All Judgment Champions gain +20% base Authority.",
                "tier": 4,
                "cost": 60,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_JUDGMENT_T4_O2",
                "name": "Greater Echo of Judgment",
                "description": "Start each run with an additional 40 Authority for the first 3 battles.",
                "tier": 4,
                "cost": 60,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_JUDGMENT_T4_O3",
                "name": "Reliquary of Verdict",
                "description": "Permanently adds the Exalted Relic 'Verdict Core' to the random drop pool.",
                "tier": 4,
                "cost": 60,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_JUDGMENT_CORE_4"
            },
            {
                "id": "AXIOM_JUDGMENT_T4_O4",
                "name": "Greater Blessing of Verdict",
                "description": "Rest nodes restore an additional 16% HP/MP for Judgment Champions.",
                "tier": 4,
                "cost": 60,
                "effectType": "passive",
                "effectValue": 20
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T5_O1",
                "name": "Grand Verdict Conditioning",
                "description": "All Judgment Champions gain +25% base Authority.",
                "tier": 5,
                "cost": 75,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_JUDGMENT_T5_O2",
                "name": "Verdict Rescue Protocol",
                "description": "Unlocks a powerful new Judgment-aligned Champion for your roster.",
                "tier": 5,
                "cost": 75,
                "effectType": "unlock_character",
                "effectValue": "CHR_JUD_NEW_5"
            },
            {
                "id": "AXIOM_JUDGMENT_T5_O3",
                "name": "Grand Judgment Resonance",
                "description": "Whenever you visit a Judgment sector, gain +10 Divine Sparks.",
                "tier": 5,
                "cost": 75,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_JUDGMENT_T5_O4",
                "name": "Grand Blessing of Verdict",
                "description": "Rest nodes restore an additional 20% HP/MP for Judgment Champions.",
                "tier": 5,
                "cost": 75,
                "effectType": "passive",
                "effectValue": 25
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T6_O1",
                "name": "Exalted Verdict Conditioning",
                "description": "All Judgment Champions gain +30% base Authority.",
                "tier": 6,
                "cost": 90,
                "effectType": "passive",
                "effectValue": 30
            },
            {
                "id": "AXIOM_JUDGMENT_T6_O2",
                "name": "Exalted Echo of Judgment",
                "description": "Start each run with an additional 60 Authority for the first 3 battles.",
                "tier": 6,
                "cost": 90,
                "effectType": "passive",
                "effectValue": 30
            },
            {
                "id": "AXIOM_JUDGMENT_T6_O3",
                "name": "Reliquary of Verdict",
                "description": "Permanently adds the Exalted Relic 'Verdict Core' to the random drop pool.",
                "tier": 6,
                "cost": 90,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_JUDGMENT_CORE_6"
            },
            {
                "id": "AXIOM_JUDGMENT_T6_O4",
                "name": "Exalted Blessing of Verdict",
                "description": "Rest nodes restore an additional 24% HP/MP for Judgment Champions.",
                "tier": 6,
                "cost": 90,
                "effectType": "passive",
                "effectValue": 30
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T7_O1",
                "name": "Divine Verdict Conditioning",
                "description": "All Judgment Champions gain +35% base Authority.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_JUDGMENT_T7_O2",
                "name": "Divine Echo of Judgment",
                "description": "Start each run with an additional 70 Authority for the first 3 battles.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_JUDGMENT_T7_O3",
                "name": "Divine Judgment Resonance",
                "description": "Whenever you visit a Judgment sector, gain +14 Divine Sparks.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_JUDGMENT_T7_O4",
                "name": "Divine Blessing of Verdict",
                "description": "Rest nodes restore an additional 28% HP/MP for Judgment Champions.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            }
        ],
        [
            {
                "id": "AXIOM_JUDGMENT_T8_O1",
                "name": "Avatar of Judgment",
                "description": "In Boss encounters, all Champions gain immense Authority and apply Vulnerability on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_JUDGMENT"
            },
            {
                "id": "AXIOM_JUDGMENT_T8_O2",
                "name": "Avatar of Judgment",
                "description": "In Boss encounters, all Champions gain immense Authority and apply Vulnerability on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_JUDGMENT"
            },
            {
                "id": "AXIOM_JUDGMENT_T8_O3",
                "name": "Avatar of Judgment",
                "description": "In Boss encounters, all Champions gain immense Authority and apply Vulnerability on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_JUDGMENT"
            },
            {
                "id": "AXIOM_JUDGMENT_T8_O4",
                "name": "Avatar of Judgment",
                "description": "In Boss encounters, all Champions gain immense Authority and apply Vulnerability on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_JUDGMENT"
            }
        ]
    ],
    "Love": [
        [
            {
                "id": "AXIOM_LOVE_T1_O1",
                "name": "Minor Embrace Conditioning",
                "description": "All Love Champions gain +5% base Capacity.",
                "tier": 1,
                "cost": 15,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_LOVE_T1_O2",
                "name": "Embrace Rescue Protocol",
                "description": "Unlocks a powerful new Love-aligned Champion for your roster.",
                "tier": 1,
                "cost": 15,
                "effectType": "unlock_character",
                "effectValue": "CHR_LOV_NEW_1"
            },
            {
                "id": "AXIOM_LOVE_T1_O3",
                "name": "Minor Love Resonance",
                "description": "Whenever you visit a Love sector, gain +2 Divine Sparks.",
                "tier": 1,
                "cost": 15,
                "effectType": "passive",
                "effectValue": 5
            },
            {
                "id": "AXIOM_LOVE_T1_O4",
                "name": "Minor Blessing of Embrace",
                "description": "Rest nodes restore an additional 4% HP/MP for Love Champions.",
                "tier": 1,
                "cost": 15,
                "effectType": "passive",
                "effectValue": 5
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T2_O1",
                "name": "Lesser Embrace Conditioning",
                "description": "All Love Champions gain +10% base Capacity.",
                "tier": 2,
                "cost": 30,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_LOVE_T2_O2",
                "name": "Lesser Echo of Love",
                "description": "Start each run with an additional 20 Capacity for the first 3 battles.",
                "tier": 2,
                "cost": 30,
                "effectType": "passive",
                "effectValue": 10
            },
            {
                "id": "AXIOM_LOVE_T2_O3",
                "name": "Reliquary of Embrace",
                "description": "Permanently adds the Exalted Relic 'Embrace Core' to the random drop pool.",
                "tier": 2,
                "cost": 30,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_LOVE_CORE_2"
            },
            {
                "id": "AXIOM_LOVE_T2_O4",
                "name": "Lesser Blessing of Embrace",
                "description": "Rest nodes restore an additional 8% HP/MP for Love Champions.",
                "tier": 2,
                "cost": 30,
                "effectType": "passive",
                "effectValue": 10
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T3_O1",
                "name": "Adept Embrace Conditioning",
                "description": "All Love Champions gain +15% base Capacity.",
                "tier": 3,
                "cost": 45,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_LOVE_T3_O2",
                "name": "Embrace Rescue Protocol",
                "description": "Unlocks a powerful new Love-aligned Champion for your roster.",
                "tier": 3,
                "cost": 45,
                "effectType": "unlock_character",
                "effectValue": "CHR_LOV_NEW_3"
            },
            {
                "id": "AXIOM_LOVE_T3_O3",
                "name": "Adept Love Resonance",
                "description": "Whenever you visit a Love sector, gain +6 Divine Sparks.",
                "tier": 3,
                "cost": 45,
                "effectType": "passive",
                "effectValue": 15
            },
            {
                "id": "AXIOM_LOVE_T3_O4",
                "name": "Adept Blessing of Embrace",
                "description": "Rest nodes restore an additional 12% HP/MP for Love Champions.",
                "tier": 3,
                "cost": 45,
                "effectType": "passive",
                "effectValue": 15
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T4_O1",
                "name": "Greater Embrace Conditioning",
                "description": "All Love Champions gain +20% base Capacity.",
                "tier": 4,
                "cost": 60,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_LOVE_T4_O2",
                "name": "Greater Echo of Love",
                "description": "Start each run with an additional 40 Capacity for the first 3 battles.",
                "tier": 4,
                "cost": 60,
                "effectType": "passive",
                "effectValue": 20
            },
            {
                "id": "AXIOM_LOVE_T4_O3",
                "name": "Reliquary of Embrace",
                "description": "Permanently adds the Exalted Relic 'Embrace Core' to the random drop pool.",
                "tier": 4,
                "cost": 60,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_LOVE_CORE_4"
            },
            {
                "id": "AXIOM_LOVE_T4_O4",
                "name": "Greater Blessing of Embrace",
                "description": "Rest nodes restore an additional 16% HP/MP for Love Champions.",
                "tier": 4,
                "cost": 60,
                "effectType": "passive",
                "effectValue": 20
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T5_O1",
                "name": "Grand Embrace Conditioning",
                "description": "All Love Champions gain +25% base Capacity.",
                "tier": 5,
                "cost": 75,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_LOVE_T5_O2",
                "name": "Embrace Rescue Protocol",
                "description": "Unlocks a powerful new Love-aligned Champion for your roster.",
                "tier": 5,
                "cost": 75,
                "effectType": "unlock_character",
                "effectValue": "CHR_LOV_NEW_5"
            },
            {
                "id": "AXIOM_LOVE_T5_O3",
                "name": "Grand Love Resonance",
                "description": "Whenever you visit a Love sector, gain +10 Divine Sparks.",
                "tier": 5,
                "cost": 75,
                "effectType": "passive",
                "effectValue": 25
            },
            {
                "id": "AXIOM_LOVE_T5_O4",
                "name": "Grand Blessing of Embrace",
                "description": "Rest nodes restore an additional 20% HP/MP for Love Champions.",
                "tier": 5,
                "cost": 75,
                "effectType": "passive",
                "effectValue": 25
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T6_O1",
                "name": "Exalted Embrace Conditioning",
                "description": "All Love Champions gain +30% base Capacity.",
                "tier": 6,
                "cost": 90,
                "effectType": "passive",
                "effectValue": 30
            },
            {
                "id": "AXIOM_LOVE_T6_O2",
                "name": "Exalted Echo of Love",
                "description": "Start each run with an additional 60 Capacity for the first 3 battles.",
                "tier": 6,
                "cost": 90,
                "effectType": "passive",
                "effectValue": 30
            },
            {
                "id": "AXIOM_LOVE_T6_O3",
                "name": "Reliquary of Embrace",
                "description": "Permanently adds the Exalted Relic 'Embrace Core' to the random drop pool.",
                "tier": 6,
                "cost": 90,
                "effectType": "unlock_relic",
                "effectValue": "RELIC_LOVE_CORE_6"
            },
            {
                "id": "AXIOM_LOVE_T6_O4",
                "name": "Exalted Blessing of Embrace",
                "description": "Rest nodes restore an additional 24% HP/MP for Love Champions.",
                "tier": 6,
                "cost": 90,
                "effectType": "passive",
                "effectValue": 30
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T7_O1",
                "name": "Divine Embrace Conditioning",
                "description": "All Love Champions gain +35% base Capacity.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_LOVE_T7_O2",
                "name": "Divine Echo of Love",
                "description": "Start each run with an additional 70 Capacity for the first 3 battles.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_LOVE_T7_O3",
                "name": "Divine Love Resonance",
                "description": "Whenever you visit a Love sector, gain +14 Divine Sparks.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            },
            {
                "id": "AXIOM_LOVE_T7_O4",
                "name": "Divine Blessing of Embrace",
                "description": "Rest nodes restore an additional 28% HP/MP for Love Champions.",
                "tier": 7,
                "cost": 105,
                "effectType": "passive",
                "effectValue": 35
            }
        ],
        [
            {
                "id": "AXIOM_LOVE_T8_O1",
                "name": "Avatar of Love",
                "description": "In Boss encounters, all Champions gain immense Capacity and apply Regen on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_LOVE"
            },
            {
                "id": "AXIOM_LOVE_T8_O2",
                "name": "Avatar of Love",
                "description": "In Boss encounters, all Champions gain immense Capacity and apply Regen on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_LOVE"
            },
            {
                "id": "AXIOM_LOVE_T8_O3",
                "name": "Avatar of Love",
                "description": "In Boss encounters, all Champions gain immense Capacity and apply Regen on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_LOVE"
            },
            {
                "id": "AXIOM_LOVE_T8_O4",
                "name": "Avatar of Love",
                "description": "In Boss encounters, all Champions gain immense Capacity and apply Regen on hit for 3 turns.",
                "tier": 8,
                "cost": 120,
                "effectType": "combat_buff",
                "effectValue": "ULTIMATE_LOVE"
            }
        ]
    ]
};
