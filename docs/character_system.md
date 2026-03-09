# Character System & Progression: Awakening of Otaran

## 1. The Core Character Entity
Every character (Champion or Enemy) is constructed from the same underlying mathematical structure. This ensures the game scales consistently and allows for complex interactions like mind-control or cloning.

**Base Entity Components:**
- **Identity:** ID, Name, Race, Sector, Role.
- **StatBlock:** The 8 Core variables (Physicality, Authority, Grace, Acumen, Spirit, Fate, Capacity, Destiny).
- **Vitals:** HP (Health Points), MP (Mana/Energy Points), Level, Current XP.

## 2. The 8 Core Stats (Deep Dive)
- **Physicality:** Physical Damage (STR) & Armor (DEF). Affects melee/gun damage and reduces incoming physical hits.
- **Authority:** Spiritual Damage (INT/Magic) & Status Application. High Authority makes debuffs like Stun or Burn harder to resist.
- **Grace:** Physical Hit Chance (ACC) & Speed (AGI). The highest Grace characters act first and act often.
- **Acumen:** Spiritual Hit Chance & Critical Damage Multiplier. Magic accuracy and how hard criticals hit.
- **Spirit:** Spiritual Defense (RES) & Debuff Resistance. Defends against magic and status effects.
- **Fate:** Critical Strike Chance & Dodge. The RNG stat.
- **Capacity:** MP Pool & HP Growth Multiplier. Determines how often skills can be used, and scales HP heavily upon level up.
- **Destiny:** Meta-Stat (LUCK). Affects RNG outcomes in Node events and loot drops.

## 3. Leveling and Stat Growth System
Instead of gaining flat numbers on level up, "Awakening of Otaran" uses a growth curve multiplied by base racial/class proficiencies. 

### Experience Points (XP)
- Gained primarily by completing combat encounters. Elite and Boss nodes grant significantly more.
- Exploring non-combat event nodes may grant minor XP depending on choices.
- Level Cap during a run is typically 20 or 30 (scaled to the length of the macro-sectors).

### Level Up Mechanics
When a Champion hits an XP threshold and levels up:
1. **HP Expansion:** `New Max HP = Old Max HP + (Base Growth Modifier * Capacity)`. High `Capacity` units (like Sylvan/Love sector characters) gain massive HP pools over time.
2. **Stat Allocation:** Every level grants a fixed budget of "Stat Points" automatically distributed based on the Champion's **Class Growth Curve**.
   - *Example: Chrono Time-Paladin gets 40% into Grace, 30% into Spirit, 20% into Physicality, and 10% into Capacity per level.*
3. **Full Restore:** Leveling up fully restores HP and MP.

## 4. Derived Vitals
- **Max HP:** `Base HP + (Capacity * 5) + (Level * Capacity Multiplier)`.
- **Max MP:** `Base MP + (Capacity * 10)`.

## 5. Rarity / "Stars" (Meta-Progression)
Champions start at 1-Star. As the player spends "Divine Sparks" at the Diamond Throne, they can permanently upgrade the baseline rarity of Champions (e.g., upgrading the Void-Borg to 2-Stars).
- **Ascension / Star Level Up:** Permanently increases the base starting value of their 3 primary class stats by 20%, ensuring that late-game runs start with significantly stronger base units.

## 6. Equipment & Modifications
Champions do not use traditional "Swords/Shields" inventories. Their primary external modifiers are:
- **Relics:** Up to 4 Global party buffs.
- **Axiom Talents:** Passive skill-tree nods drafted at the start of the run that modify how abilities or stats interact.
- **Event Modifications:** Permanent buffs/debuffs acquired during text events (e.g., losing an arm for a cybernetic replacement alters base Grace and Physicality).
