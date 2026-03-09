# Otarn: Classes & Abilities Design Document

Below are the currently defined classes spread across the four Sectors. 

Each class utilizes a **4-Ability Structure**:
- **Default Attack**: Basic action, typically low cost or generates resources/timeline advancement.
- **Special 1**: Class-dependent tactical skill.
- **Special 2**: Class-dependent tactical skill (utility, buff/debuff, or alternate damage profile).
- **Ultimate**: An extremely powerful ability that costs **0 MP/TU** but requires the **Revelation Meter** to be fully charged. Revelation acts as a champion for "Faith", charging up as characters perform specific class actions—like dealing damage, winning battles, landing critical hits, or synergizing with their role (e.g., healing or inflicting debuffs).

---

## 🛡️ Judgment Sector (Race: Null-Forged)

### 1. Siege Cannoneer *(NEW)*
**Role**: Heavy Artillery / Giant Cannons
**Stats Profile**: High Physicality and Capacity. Low Grace.
*Wields massive reality-tearing cannons to devastate the battlefield from afar.*
- **Default**: **Shatter-Shot** - Fires a solid slug at a single target. Delays their timeline slightly.
- **Special 1**: **Artillery Bombardment** - Targets an entire zone. The strike is delayed (fires automatically at the start of next turn), dealing massive Physical AoE damage when it lands.
- **Special 2**: **Overcharge Reactor** - Self-Buff. Drains 15% of their own Max HP to grant "Overcharged," doubling the damage of their next attack.
- **Ultimate**: **God-Killer Ordinance** - Fires a giant concentrated beam that obliterates a single target, ignoring all armor and physical mitigation. *(Revelation Charge: Rapidly charges when landing Critical Hits and dealing massive damage instances.)*

### 2. Entropy Engine *(EXPANDED)*
**Role**: DoT (Damage over Time) / Debuffs
**Stats Profile**: High Authority and Capacity.
*Harnesses the decaying nature of the universe. Expanded to be more dominant in applying and manipulating DoTs.*
- **Default**: **Corrosive Beam** - A piercing spiritual beam that deals low damage but adds 1 stack of "Decay" (DoT) to the target.
- **Special 1**: **Catalyst Outbreak** - Spreads all current Decay stacks from one primary target to all other enemies, refreshing the debuff duration globally.
- **Special 2**: **Accelerated Entropy** - Forces a target's timeline forward rapidly but instantly triggers all remaining damage from their Decay stacks in one burst. Strips enemy buffs upon cast.
- **Ultimate**: **Heat Death** - Unleashes a wave of absolute zero across all enemies. Deals true damage to the entire enemy side. If an enemy dies, they explode to inflict huge Decay stacks on survivors. *(Revelation Charge: Charges incrementally whenever enemies take DoT damage at the start of their turn.)*

### 3. Void-Borg
**Role**: Banishment / Space Control
- **Default**: **Phase Strike** - Standard melee hit that occasionally teleports the user randomly on the timeline.
- **Special 1**: **Warp Prison** - Banishes a target enemy, completely removing them from the timeline for 2 turns. (Bosses instead suffer massive speed loss).
- **Special 2**: **Singularity** - Pulls all enemies to the back of the timeline (heavy delay).
- **Ultimate**: **Absolute Vacuum** - Deals heavy physical damage to a single target and permanently steals a portion of their core stats. *(Revelation Charge: Charges when enemies miss attacks or are banished/delayed).*

### 4. Stealth-Operative
**Role**: Evasion / Burst Assassin
- **Default**: **Shadow Dagger** - Quick attack. If attacking from Stealth, it automatically Critical Hits.
- **Special 1**: **Cloak & Dagger** - Enters "Stealth" state (cannot be directly targeted) and increases speed.
- **Special 2**: **Nerve Slice** - Poisons the target, reducing their damage output.
- **Ultimate**: **Thousand Cuts** - Unleashes 10 rapid strikes on random enemies. If all strikes hit the same target, the final hit deals true damage. *(Revelation Charge: Charges heavily upon dodging attacks and killing enemies).*

### 5. Necro-Mechanic
**Role**: Execute / Reanimation
- **Default**: **Bone-Wrench** - Physical hit that heals the Mechanic for a portion of damage dealt.
- **Special 1**: **Reassemble** - Revives a fallen ally with 25% HP, or heals a living ally and grants them an absorption shield.
- **Special 2**: **Execution Protocol** - If target is below 20% HP, this instantly kills them. Otherwise, deals moderate damage.
- **Ultimate**: **Machine Graveyard** - Summons 3 temporary "Scrap-Drones" to the frontline that absorb hits and explode upon death. *(Revelation Charge: Charges whenever an ally or enemy drops below 50% HP).*

---

## ⚖️ Order Sector (Race: Lumina)

### 6. Time-Paladin
**Role**: Initiative Manipulation / Haste
- **Default**: **Luminous Strike** - Smite an enemy, slightly advancing an ally's timeline position.
- **Special 1**: **Chrono-Aura** - Grants "Haste" to all allies, speeding up their timeline generation.
- **Special 2**: **Temporal Rewind** - Reverses time for one ally, restoring their HP to what it was at the start of their last turn.
- **Ultimate**: **Stasis Field** - Halts the timeline generation for all enemies for 1 full round, effectively granting the party free turns. *(Revelation Charge: Charges passively over time, faster if allies act before enemies).*

### 7. Grav-Lancer
**Role**: Heavy Crowd Control / Positioning
- **Default**: **Grav-Thrust** - Pierces frontline and damages the enemy immediately behind them.
- **Special 1**: **Crush Sphere** - Roots an enemy in place so their position (front/backline) cannot be changed and they can't dodge.
- **Special 2**: **Event Horizon** - Swaps the position of an ally and an enemy, forcing squishy enemies to the front.
- **Ultimate**: **Planetary Collapse** - Drops a localized gravity well on the enemy team, halving current HP for all enemies caught in it. *(Revelation Charge: Charges when mitigating damage or repositioning units).*

### 8. Mag-Sentinel
**Role**: Tanks / Shields / Taunts
- **Default**: **Magnetic Bash** - Low damage, high threat generation to draw aggro safely.
- **Special 1**: **Iron Maiden Protocol** - Taunts all enemies, forcing them to attack the Sentinel, and increases personal defense.
- **Special 2**: **Polarity Shield** - Grants an ally a shield that reflects 50% of incoming damage back to attackers.
- **Ultimate**: **Aegis of the Maker** - Sentinel becomes completely invincible and intercepts all damage meant for allies for a duration. *(Revelation Charge: Rapidly charges when taking direct hit damage).*

### 9. Inquisitor
**Role**: Buff Dispel / Absolute Damage
- **Default**: **Verdict** - Holy damage that strikes harder if the enemy has buffs.
- **Special 1**: **Purge** - Strips all positive buffs from an enemy target.
- **Special 2**: **Chain of Binding** - Silence effect. Target cannot use their Special abilities or Ultimate for 1 turn.
- **Ultimate**: **Final Judgment** - Summons a celestial sword that inflicts massive Absolute Damage (cannot be mitigated, blocked, or dodged). *(Revelation Charge: Charges every time a buff/debuff is cleansed or dispelled).*

---

## 🌪️ Chaos Sector (Race: Espers)

### 10. Pyromancer
**Role**: Raw AoE Damage / Burn Status
- **Default**: **Firebolt** - Moderate damage, 25% chance to Burn.
- **Special 1**: **Inferno Wave** - AoE fire attack. Doubles duration of existing Burns.
- **Special 2**: **Cinder Cage** - Traps an enemy. They take Burn damage every time they take an action.
- **Ultimate**: **Supernova** - Extreme AoE damage that melts enemy armor permanently. *(Revelation Charge: Charges heavily when applying burns and hitting multiple targets at once).*

### 11. Geomancer
**Role**: Physical Mitigation / Terrain Traps
- **Default**: **Rock Toss** - Low damage, applies a "Brittle" stack reducing target DEF.
- **Special 1**: **Tectonic Fault** - Creates a hazard zone. Any enemy that steps into it (or is pushed into it) takes severe damage.
- **Special 2**: **Fossilize** - Turns an ally to stone for 1 turn. They cannot act but become 100% immune to damage and heal.
- **Ultimate**: **Earthshatter** - Destroys all shields and barriers on the enemy team and stuns them. *(Revelation Charge: Charges whenever allies use terrain/traps to their advantage).*

### 12. Tidecaller
**Role**: Fluid Healing / Cleansing
- **Default**: **Water Whip** - Moderate damage. Pushes target back on the timeline.
- **Special 1**: **Healing Rain** - Applies a regeneration effect (HoT) to all allies.
- **Special 2**: **Wash Away** - Cleanses all debuffs and DoTs from a single ally.
- **Ultimate**: **Tsunami** - Heals party to Max HP and resurrects all fallen allies. Drowns all enemies, reducing their attack drastically. *(Revelation Charge: Charges smoothly through consistent healing and cleansing of negative effects).*

### 13. Zephyr-Sprite
**Role**: High Dodge / Multi-strike
- **Default**: **Wind Blade** - Extremely fast attack that hits twice.
- **Special 1**: **Tailwind** - Self-buff improving Dodge rate to 75%.
- **Special 2**: **Cyclone Dash** - Attacks the enemy backline directly, bypassing frontline tanks.
- **Ultimate**: **Hurricane Flurry** - Strikes random enemies 15 times for low but unavoidable damage. Each hit delays the target's turn. *(Revelation Charge: Charges when the Sprite successfully Dodges, or executes multi-hits).*

---

## ❤️ Love Sector (Race: Sylvan)

### 14. Weaver of Life
**Role**: Pure Healer / Revive
- **Default**: **Spirit Mend** - Small, targeted heal.
- **Special 1**: **Web of Hearts** - Links two allies. If one takes damage, it's shared between them, but incoming healing is doubled.
- **Special 2**: **Cocoon** - Wraps a dying ally in a protective cocoon ensuring they survive at 1 HP from any lethal hit next turn.
- **Ultimate**: **Genesis Spore** - Applies a buff to the whole team: the next time they would die, they instead revive instantly with 50% HP. *(Revelation Charge: Charges purely by restoring lost HP).*

### 15. Blood-Druid
**Role**: HP Sacrifice / Leech / Vampirism
- **Default**: **Vampiric Touch** - Deals damage and returns 50% as health.
- **Special 1**: **Blood Pact** - Spend 20% of own HP to deal massive dark damage with a 100% Lifesteal to an ally.
- **Special 2**: **Sanguine Pool** - AoE lifesteal from all enemies.
- **Ultimate**: **Crimson Harvest** - Steals exactly 25% of every enemy's current HP and distributes it evenly among the party. *(Revelation Charge: Charges dynamically from health fluctuating—taking damage and stealing life back).*

### 16. Growth-Warden
**Role**: Stacking Buffs / Over-healing
- **Default**: **Briar Patch** - Physical attack that also provides the Warden with a small shield.
- **Special 1**: **Nurture** - Heals an ally. If they are already at full HP, the excess heals convert into a permanent Max HP boost for the battle.
- **Special 2**: **Barkskin** - Increases physical and spiritual resist of the frontline.
- **Ultimate**: **World Tree's Embrace** - Turns all active shields and over-heals into permanent offensive stats for the rest of the encounter. *(Revelation Charge: Charges whenever the Warden provides over-healing or shields).*

### 17. Dream-Walker
**Role**: Sleep Status / Psychic Damage
- **Default**: **Mind Spike** - Spiritual damage that ignores standard physical defenses.
- **Special 1**: **Lullaby** - Puts an enemy to "Sleep." They cannot act until they take damage.
- **Special 2**: **Nightmare Weaver** - If an enemy is asleep, deals massive damage without waking them, turning the sleep buff into a DoT.
- **Ultimate**: **Lucid Reality** - Traps all enemies in a collective dream. For the next round, any damage the party takes is entirely negated and reflected back. *(Revelation Charge: Charges heavily when enemies miss turns due to Sleep/Crowd Control effects).*
