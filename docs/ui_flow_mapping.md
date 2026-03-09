# Full Screen Mapping & UI Flow: Awakening of Otaran

To achieve a true "Playable Prototype," the application must fluidly transition through a structured state machine representing the lifecycle of a run, complete with cinematic interludes and meaningful decisions.

## 1. The Core State Machine (App-Level Routing)
The application fundamentally exists in one of three macro-states governed by `useGameStore`:
- **State A (Hub):** `The Diamond Throne`
- **State B (Interlude):** `Cinematic / Lore Transitions`
- **State C (Run):** `Active Sector Engagement`

---

## 2. Screen-by-Screen Flow Chart

### [SCENE 0]: The Boot Sequence (Startup)
* **Visuals:** A pitch-black screen. A single, blinking cursor. Line-by-line text prints out: *"SYSTEM REBOOT. DIVINE CORE: ONLINE. AWAKENING COMMENCED."*
* **Function:** Loads `characters.json`, `relics.json`, `events.json` into memory. Retrieves `GlobalSaveData` from `localStorage`.
* **Transition:** Fades into `[SCENE 1]`.

### [SCENE 1]: The Main Menu (The Diamond Throne - Hub)
* **Visuals:** Starfield background via Three.js. Clean glassmorphism UI.
* **Panels Available:**
  1.  **Roster Archive:** View unlocked Champions and their lore.
  2.  **Ascension Chamber:** Spend Divine Sparks for permanent stat/class upgrades.
  3.  **The Codex:** View discovered Lore, defeated enemies, and found Relics.
* **Action:** Player selects **"Initiate Run."**
* **Transition:** Moves to `[SCENE 2]`.

### [SCENE 2]: The Draft Protocol
* **Visuals:** A sterilized grid displaying available 1-Star Champions.
* **Action:** Player selects exactly 4 Champions. This creates a snapshot of the `BaseCharacter` data and uses `CharacterFactory` to instantiate 4 Level-1 `ActiveCharacter` objects.
* **Transition:** Player clicks "Engage." Moves to `[SCENE 3]`.

### [SCENE 3]: Cinematic Interlude (Sector Insertion)
* **Visuals:** The UI vanishes. The Three.js camera accelerates through the starfield (warp-speed effect). Text overlays appear: *"SECTOR: JUDGMENT. RULER: THE IRON JUDGE."*
* **Action:** A localized `RunStateData` object is created.
* **Transition:** After 3 seconds, UI fades back in to `[SCENE 4]`.

### [SCENE 4]: The Sector Map (Navigation)
* **Visuals:** Branching SVG nodes.
* **Action:** Player evaluates nodes using the "Destiny Hover Precognition" mechanic. Player clicks an available node.
* **Transition Logic:**
  * If Node == `Combat` / `Elite` / `Boss` -> Move to `[SCENE 5]`.
  * If Node == `Event` -> Move to `[SCENE 6]`.
  * If Node == `Sanctuary` (Rest) -> Move to `[SCENE 7]`.

### [SCENE 5]: The Combat Interface
* **Visuals:** The 4v4 Grid overlays the background. Timeline bar drops from the top. Command palette rises from the bottom.
* **Initial Generation:** Upon entering this scene, the game reads the Node difficulty/type and uses the `CharacterFactory` to pull random IDs from `enemies.json`, scaling their Level up to the current run's depth.
* **Action:** Turn-based combat executes until Win or Loss.
* **Transition:**
  * **Win:** Move to `[SCENE 8]` (Loot/Rewards).
  * **Loss:** The 4 Champions shatter. Run terminates. Move to `[SCENE 9]` (Run Summary).

### [SCENE 6]: Text Event Interface
* **Visuals:** A centralized glass panel resembling a visual novel. A static image/portrait on the left, descriptive lore text on the right.
* **Action:** Player reads the scenario and selects one of 2-3 choices (e.g., "Sacrifice 10 HP for a Relic").
* **Transition:** Rewards are granted. Returns to `[SCENE 4]` (Map) at the next node position.

### [SCENE 7]: Sanctuary (Rest)
* **Visuals:** A peaceful, gold-hued menu.
* **Action:** Player chooses to either: (A) Heal the party for 30%, or (B) Attempt to revive a dead champion.
* **Transition:** Returns to `[SCENE 4]` (Map).

### [SCENE 8]: Combat Rewards & Loot Draft
* **Visuals:** A modal celebrating victory.
* **Action:**
  1. XP is distributed. If XP thresholds are met, the UI displays a shiny level-up animation showing stat increases.
  2. A Relic or Talent is drafted (Pick 1 of 3 random pulls from the JSON databases).
* **Transition:** Returns to `[SCENE 4]` (Map).

### [SCENE 9]: Run Termination (Death or Victory)
* **Visuals:** A grand summary screen.
* **Action:** Converts all remaining Ephemeral Faith from the run into permanent Divine Sparks. Tracks highest node reached. Clears the localized `RunStateData` from storage.
* **Transition:** Returns to `[SCENE 1]` (The Diamond Throne).
