# Asset Pipeline & Playability Plan

To transition the current structural framework into a "Theoretical Playable Build" that feels like a game, we need to bridge the gap between our raw mathematics (`CharacterFactory`, `CombatStore`) and visual feedback.

Here is the plan for handling character generation, testing, and asset mapping.

## 1. Character & Enemy Generation on Startup
Currently, we rely on static `characters.json` files. To make the game truly playable, we need dynamic scaling.

### What exists:
- `CharacterFactory` can spin up a Level 1 character.

### What needs to be built:
- **`EncounterGenerator.ts`:** A class that reads the current Node Level and Sector type.
  - *Example:* If we are on Node 5 of the "Void Sector", it pulls 2 "Void Grunts" and 1 "Void Captain", and tells the `CharacterFactory` to instantiate them at Level 3.
  - It must pull from a newly created `enemies.json` separate from the playable `characters.json`.
- **Boss Data Sets:** The `characters.json` needs specific boss entities with massively inflated Capacity multipliers to serve as Sector end-goals.

## 2. Asset Integration (The "Dummy" Phase)
Until bespoke animations and high-fidelity art are created, we must use a robust "Dummy Asset" system to allow playtesting without visual confusion.

### **Phase 2A: Static Portrait Dummies**
We need a standard format for character portraits.
- **Requirement:** A `512x512` PNG for every ID in the game.
- **Proxy Protocol:** Use AI image generators or simple colored silhouettes (e.g., a Blue Knight for Frontline, Red Mage for Backline) stored in `public/assets/portraits/`.
- **Implementation:** The `ActiveCharacter` interface gains a property `portraitUrl`. The UI components (`CombatGrid`, `RosterView`) will pull `<img src={unit.portraitUrl} />`.

### **Phase 2B: Combat Sprites & Visual States**
In the 4v4 Grid, the boxes currently just hold names. To test combat clarity:
- **Idle State:** A floating dummy image (e.g., a colored card or stylized icon).
- **Taking Damage:** Apply a CSS `shake` animation and flash the sprite red via CSS `filter: brightness(2) hue-rotate(...)`.
- **Attacking:** Translate the sprite horizontally towards the enemy side via CSS transitions for 0.2s before returning.
- **Dead:** CSS `grayscale(100%) opacity(0.3)`.

*Crucially: We can achieve 90% of the "game feel" just using CSS transitions on static dummy PNGs before we ever need Sprite Sheets or Unity-style animators.*

## 3. VFX and Game Feel (The "Juice")
A playable build isn't fun unless it has "Juice". 

### What needs to be built:
- **Floating Combat Text (FCT):** When `processPayload` runs, we must spawn dynamic HTML `div`s over the target's head showing `"-45"` in red, fading upward, and unmounting after 1 second.
- **Screen Shake:** A global Zustand store trigger that shakes the overarching `<main>` container when a Critical Hit or "God Smite" occurs.
- **Three.js Dynamics:** When speed or intensity increases (e.g., Boss battles), increase the particle velocity of the `<Stars />` background component to simulate heightened energy.

## 4. The Immediate Testing Plan (Next Steps)
To physically 'play' the game from start to finish as a test:

1. **Build `enemies.json`:** Spend 1 hour designing 10 basic enemy archetypes and 1 Boss archetype.
2. **Build `EncounterManager`:** Write the logic to spawn these enemies when a Map Node is clicked.
3. **Connect Map to Combat:** Remove the prototype buttons. Clicking a 'Combat Node' must natively load the `EncounterManager`'s generated enemies into the `CombatStore` and swap the UI view.
4. **Implement Win/Loss Routing:** Complete the `endCombat(victory)` function.
   - If Victory: Show a temporary "You Win" screen, give 100 XP, return to Map.
   - If Loss: Show a temporary "You Died" screen, return to Diamond Throne.
5. **Dummy Art Hunt:** Populate `public/assets/portraits` with 15-20 simple representative images to replace the colored boxes.

*Once those 5 steps are complete, we can sit down and literally "play" a 10-node run, validating whether the mathematics of the Turn Timeline and Stat Mitigations actually feel fun or if they just look good on paper.*
