# Combat System Design: Awakening of Otaran

## 1. Overview and Battlefield Layout
The combat in "Awakening of Otaran" revolves around a **4v4 Turn-Based system** mapped on a dynamic timeline.
- **Player Side (Left):** 4 Playable Proxies.
- **Enemy Side (Right):** Up to 4 Enemies (Regulars, Elites, or Bosses).

### Grid / Formation (Frontline vs Backline)
Each side consists of two rows:
- **Frontline (Slots 1 & 2):** Traditionally taking the brunt of direct physical attacks and protecting the rear. Certain abilities (like Cleave or Pierce) interact specifically with these slots.
- **Backline (Slots 3 & 4):** Typically reserved for magic users, healers, and squishy damage dealers. Often untargetable by standard melee attacks unless the Frontline is decimated or via specific "Snipe / Assassinate" skills.

## 2. Character Abilities (The 3+1 Structure)
Each Proxy (and complex enemy) possesses a fixed set of abilities that define their role:
1. **Basic Attack:** Costs 0 MP. Generates a small amount of MP. Often physical, but can be scaled by other stats based on class.
2. **Skill 1 (Core Utility):** Costs MP. Defines the class's primary loop (e.g., a strong heal, a taunt, applying a stacking DoT).
3. **Skill 2 (Strategic Nuke/Control):** Costs high MP. Examples include AoE damage, Stuns, massive single-target execution, or team-wide shielding.

## 3. "God" Abilities (The Player's Direct Influence)
Because the player acts as an awakened deity overseeing the battlefield from the Diamond Throne, they have direct intervention mechanics.
- **Divine Energy (or Ephemeral Faith):** The player has a separate resource pool that passively generates each turn or when proxies take damage/die.
- **God Spells (Interventions):** Available from a global UI bar above the combat area.
  - *Smite:* Deal fixed absolute damage to a specific enemy to assist in an execute.
  - *Aegis:* Grant a one-turn invulnerability shield to a specific proxy in danger of dying.
  - *Chronos Shift:* Manually advance one proxy's timeline position to the current turn to interrupt a boss.
  - *Purge:* Cleanse all debuffs from the entire party.
  *Note: These interventions cost significant amounts of meta-resource and have cooldowns, making them strategic trump cards rather than spammable skills.*

## 4. The Timeline (Turn Order)
Turn order is **not** round-robin. It operates on a dynamic, continuous timeline represented visually at the top of the screen (e.g., Final Fantasy X or Honkai Star Rail).
- **The Engine:** Each entity has a timeline position counting down from 100 to 0. 
- **Grace Stat Integration:** The speed at which an entity moves along the timeline is directly tied to their **Grace** stat. Higher Grace = faster turns.
- **Action Delay:** Using high-impact skills (Skill 2) may impose an "Action Delay" penalty, pushing the user further back on the timeline for their next turn than a Basic Attack would.

## 5. Damage Resolution Formula
Attacks fall into two main categories: Physical and Spiritual (Magic).
- **Physical Attack:** Output scaled by attacker's `Physicality`. Mitigated by defender's `Physicality` (Armor).
- **Spiritual Attack:** Output scaled by attacker's `Authority`. Mitigated by defender's `Spirit` (Resistance).
- **Hit vs Dodge:**
  - Physical Accuracy (`Grace`) vs Defender Dodge (`Fate`).
  - Spiritual Accuracy (`Acumen`) vs Defender Dodge (`Fate` or fixed resistance).
- **Critical Strikes:**
  - Crit Chance (`Fate`) vs base resistance.
  - Crit Damage Multiplier scaled by `Acumen`.

## 6. Combat Flow & Win/Loss Conditions
- **Win:** All enemies reach 0 HP. Rewards are distributed (Ephemeral Faith, Relic drafts, XP for Proxies).
- **Loss:** All 4 Proxies reach 0 HP. The run ends. The player is returned to the Diamond Throne with earned Divine Sparks to unlock permanent meta-progressions.
- **Death & Revives:** Dead Proxies are removed from the timeline. Some classes (e.g., Weaver of Life) or specific items can revive dead Proxies mid-combat. Otherwise, death persists until a Sanctuary node on the map.
