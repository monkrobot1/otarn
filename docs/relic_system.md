# Relic System: Awakening of Otaran

## 1. Overview
Relics are the primary meta-progression and run-specific modifiers in Otaran. Unlike Axiom Talents (which are character-specific), Relics affect the entire party or global rules.

## 2. Relic Tiers & Identification
Relics are classified into five distinct power tiers. Higher-tier relics have more complex logic and are rarer in reward nodes.

| Tier | Designation | Hex Color | UI Class |
| :--- | :--- | :--- | :--- |
| Tier 1 | **Fractured** | `#9CA3AF` | Common |
| Tier 2 | **Resonant** | `#22C55E` | Uncommon |
| Tier 3 | **Exalted** | `#3B82F6` | Rare |
| Tier 4 | **Reliquary** | `#A855F7` | Epic |
| Tier 5 | **Divine** | `#EAB308` | Divine |

## 3. Core Mechanics
Relics interact with the game via several hooks:

### A. Static Stat Modifiers (Passive)
Many Tier 1 (Fractured) relics provide flat bonuses to the 8 Core Stats (e.g., `REL_UNI_001` providing +20% Physicality). These are calculated at the start of a run or upon acquisition.

### B. Combat Logic Triggers (Reactive)
Higher-tier relics (Exalted and above) often hook into combat events:
- **OnHit:** Triggered every time a proxy deals damage.
- **OnKill:** Triggered when an enemy dies (e.g., `REL_JUD_009` granting timeline boost).
- **OnTakeDamage:** Reflect damage or mitigate hits (e.g., `REL_CHA_006` capping damage at 10% Max HP).

### C. Multi-Hit Synergies
With the expanded attack system, Specific Relics now modify "Hit Counts":
- **Multi-Strike Lens (`REL_ADV_003`):** Adds an additional instance of damage to any multi-hit ability.
- **Blade Echo (`REL_ADV_001`):** Appends a smaller secondary hit to all physical attacks.

## 4. Rarity Balancing
The pool currently contains **120 unique relics**.
- **Fractured:** ~40% of the pool. Basic efficiency.
- **Resonant:** ~25% of the pool. Specific synergies.
- **Exalted:** ~20% of the pool. Strategy-defining.
- **Reliquary:** ~10% of the pool. High power.
- **Divine:** ~5% of the pool. Game-changing artifacts.

## 5. Loot Association
When a Relic is discovered (e.g., in a Reward Node), the UI must use the `color` property from the JSON to theme the discovery animation and the item card border.

---
*Documentation updated: 2026-03-05*
