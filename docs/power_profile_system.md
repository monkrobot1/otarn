# Power Profile System (Tri-Factor Balance)

Instead of relying on a monolithic Combat Power (CP) metric, the combat balance architecture measures a character's capabilities across three distinct pillars: **Damage**, **Survivability**, and **Support**. This allows for a much more textured understanding of combat dynamics, where a low-damage tank naturally counters glass cannons but needs support to survive high-attrition battles.

This system is implemented in `src/utils/powerLevel.ts`.

## 1. Damage Score (Offensive Output)
*How lethal is this character?*

The damage score analyzes a character's absolute peak offensive potential during a "standard turn." 
- **Core Loop**: It scans all equipped abilities and finds the one with the highest theoretical magnitude (Summing its `hits` array * `hit/crit multipliers`). 
- **Base Scaling**: It grounds this multiplier by multiplying it by the governing stat logic (using `Physicality` for Physical damage types or `Authority` for Spiritual). 
- **Critical Weight**: It factors in the Expected Value (EV) by adding the average `Critical Hit Rate` % * the character's `Critical Damage Multiplier`.
- **Relic Boosts**: Offensive-oriented global Relics directly inflate this baseline.

## 2. Survivability Score (Effective HP)
*How much punishment can this character endure before dying?*

Survivability isn't just about hit points. It calculates the theoretical "Effective HP" (EHP).
- **Vitals Baseline**: Derives maximum HP from the `Capacity` stat and character `Level`.
- **Mitigation Averaging**: Approximates average incoming damage reduction using `Physicality` (Armor) and `Spirit` (Resistance), capped aggressively at 85%.
- **Effective HP (EHP)**: `Total HP / (1.0 - Average Mitigation %)`. For instance, 100 HP with 50% passive mitigation equals 200 EHP.
- **Evasion Loop**: Further multiplies EHP organically by factoring in the percentage chance to `Dodge` attacks altogether (driven heavily by `Fate`).

## 3. Support Score (Tactical Utility)
*How well does this character change the flow of battle or assist allies?*

- **Healing Payload**: Sums up the base healing modifiers attached to abilities and multiplies them by the character's governing attribute (e.g., `Authority` or `Spirit`).
- **Crowd Control and Buffs**: Tallies the total density of Status Effects the unit can inflict or apply. Bleeds, Stuns, Hastes, and Shields all artificially alter the combat grid's pace.
- **Speed & Action Economy**: Factors in `Fate` and `Grace` attributes as base tactical advantages—faster units command the turn queue and therefore project more "Support" control over the encounter's flow.
- **AoE Synergy**: Healing abilities flagged as `all_allies` provide a massive artificial 1.5x multiplier to the raw EHP injected across the team.

---

## Example Squad Evaluation Output

Running `evaluateCombatBalanceProfiles(allies, enemies, runData)` outputs deeply specific ratios logic for combat tuning.

```json
{
  "allyProfile": {
      "damageScore": 1250,
      "survivabilityScore": 8400,
      "supportScore": 800,
      "totalScore": 10450
  },
  "enemyProfile": {
      "damageScore": 3400,
      "survivabilityScore": 3000,
      "supportScore": 200,
      "totalScore": 6600
  },
  "damageRatio": "0.36",         // Allies lack damage.
  "survivabilityRatio": "2.80",  // But Allies are extremely durable tanks.
  "supportRatio": "4.00"         // Allies will out-sustain the enemy.
}
```

This specific JSON tells us that the enemy hits incredibly hard but is brittle (`Damage 3400 vs Survivability 3000`). The player squad doesn't deal much damage (`0.36 ratio`) but their survivability and healing (`2.80 ratio / 4.0 ratio`) suggests they will win this prolonged fight of attrition cleanly.

## Usage Guide (Codebase)
Whenever analyzing stat balancing or tuning a new encounter (e.g., replacing standard enemies with an Elite variant):
1. Run `evaluateCombatBalanceProfiles` in your encounter boot logic.
2. If `survivabilityRatio` dips below 0.3 for the allies against massive enemy `damageScores`, the encounter is likely an unwinnable "one-shot" fight.
3. Use this API within Dev Tools to tweak Base Stats in `data/enemies.json` until the three pillars sit within your desired margins.
