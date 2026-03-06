# Talent Rarity & Category Specifications

This document outlines the standard rarities and categories used within the Level-Up Ascension interface.

### Rarity Tiers (1-5 Scale)

The game features a 5-tier loot/talent weighting logic to determine drop probability, visually keyed differently when players are leveling up.

| Level | Rarity Name | UI Color Class Override | Visual Signature | Drop Weight (Example) |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | Common | `text-gray-400` | Flat matte gray, standard font. | 50% |
| **Tier 2** | Uncommon | `text-green-400` | Soft green glow, distinct rendering. | 30% |
| **Tier 3** | Rare | `text-blue-400` | Blue ethereal shadow rendering. | 13% |
| **Tier 4** | Epic | `text-purple-400` | Purple aura, pulsating occasionally. | 5% |
| **Tier 5** | Divine | `text-orange-400` | Bold tracking, bright orange/gold glow. | 2% |

---

### UI Categorical Logos (Talent Themes)

Categorizing talents helps players distinguish at a sprint between mechanical variations while drafting. The Ascension cards dynamically append emojis/icons dependent on the analyzed effect.

1. **New Skills (✨)**
   * **Definition:** Actively adds a new selectable button to the Combat Palette.
   * **Tags:** `New Skill`
2. **Passive Buff Defensive (🛡️)**
   * **Definition:** Reduces incoming damage, modifies armor, or triggers defensive barriers automatically in battle.
   * **Tags:** `Passive Defensive`
3. **Passive Buff Offensive (⚔️)**
   * **Definition:** Increases potency conditionally, modifies crits, or enhances specific damage rules mid-turn.
   * **Tags:** `Passive Offensive`
4. **Stats Up (📈)**
   * **Definition:** Hard numerical scaling (e.g., +10% Physicality Base Scale pre-combat).
   * **Tags:** `Stats Up`
5. **Wildcard (🌀)**
   * **Definition:** Heavily randomized logic that applies status roulette, extreme risk/reward, or changes unpredictably.
   * **Tags:** `Wildcard`
6. **Unique (💎)**
   * **Definition:** Rule-breaking anomalies (e.g. revive mechanics, timeline halting) not easily defined via other pools.
   * **Tags:** `Unique`
