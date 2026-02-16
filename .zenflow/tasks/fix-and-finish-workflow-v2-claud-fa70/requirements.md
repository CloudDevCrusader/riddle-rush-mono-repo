# PRD: Fix and Finish End-of-Game Workflow

## 1. Overview

The multiplayer game "Riddle Rush" has an incomplete end-of-round and end-of-game workflow. After all players submit their answers during a round, the game navigates to a results/scoring page — but that page lacks the ability to **enter scores** for each player. Additionally, there is no way to **finish the game** and view the final leaderboard. This PRD defines the requirements to complete the workflow.

## 2. Problem Statement

The current flow after answer submission is:

```
game.vue (all players submit) → results/[[gameId]].vue → [dead end: only "Next Round"]
```

**What's broken / missing:**

1. **No score entry**: The results page shows player cards with names and answers, but there is no UI for entering each player's points. The store action `assignPlayerScore()` exists but is never called.
2. **No round completion**: `gameStore.completeRound()` is never called, so round history is never recorded.
3. **No "Finish Game" option**: The results page only has a "Next Round" button — there is no way to end the game and see the final leaderboard.
4. **No game completion**: `gameStore.completeGame()` is never called, so `isGameCompleted` is always `false` and the winner crown is never shown.
5. **Unused `PlayerLeaderboard` component**: A fully-styled overlay leaderboard component exists (`components/PlayerLeaderboard.vue`) with winner crowns, rank medals, and "Continue" / "Finish Game" buttons — but it is mounted nowhere.

## 3. Desired User Flow

After all players submit answers, the following flow should occur:

```
game.vue (all submit → NEXT)
    ↓
results/[[gameId]].vue  ← SCORE ENTRY (per player)
    ↓  (all scores entered → CONFIRM)
PlayerLeaderboard overlay  ← shows current standings
    ↓  (auto-dismiss or user-dismiss after a short display)
"Next Round or Finish?" modal
    ↓
    ├─ "Next Round" → round-start.vue (new round)
    └─ "Finish Game" → leaderboard.vue (final results with winner)
```

### 3.1 Step-by-step

1. **Score Entry (Results Page)**
   - After navigating to the results page, each player's card is shown with their name and submitted answer.
   - For each player, the current user (game master / person holding the device) enters the points that player earned in this round.
   - A score input control is displayed on each player card (e.g., increment/decrement buttons or a numeric input). The default score is `0`.
   - Points are awarded in increments of `SCORE_INCREMENT` (10 points), consistent with the existing `SCORE_PER_CORRECT_ANSWER` constant.
   - Negative scores are not needed for the initial implementation — scores should be ≥ 0.
   - Once all scores are entered, a "Confirm" / "Done" button becomes active.

2. **Round Completion**
   - When the user confirms scores, the system:
     - Calls `gameStore.assignPlayerScore(playerId, points)` for each player.
     - Calls `gameStore.completeRound()` to record the round in `roundHistory`.

3. **Current Standings Display (PlayerLeaderboard overlay)**
   - After round completion, the `PlayerLeaderboard` component is shown as an overlay.
   - It displays all players ranked by `totalScore`, showing rank medals (gold/silver/bronze), the round score delta, and total score.
   - This overlay auto-dismisses after a brief display period (e.g., `RESULTS_DISPLAY_DURATION_MS` = 2000ms) OR the user taps to dismiss — whichever comes first.

4. **"Next Round or Finish?" Decision Modal**
   - After the leaderboard overlay dismisses, a `GameModal` appears asking the user:
     - **"Next Round"** — Navigates to `round-start.vue` for another round.
     - **"Finish Game"** — Calls `gameStore.completeGame()`, then navigates to `leaderboard.vue` for the final results with winner highlight.

5. **Final Leaderboard (Existing Page)**
   - The existing `leaderboard.vue` page already displays the final standings.
   - Because `completeGame()` will now be called, `isGameCompleted` will be `true`, which:
     - Hides the "Next Round" button on the leaderboard page.
     - Enables the `isWinner` flag on the top-scoring player.
   - The "OK" / "Finish" button calls `gameStore.endGame()` and navigates home.

## 4. Functional Requirements

### FR-1: Score Entry on Results Page

- **FR-1.1**: Each player card on the results page must include a score input control.
- **FR-1.2**: The score input allows setting a point value in increments of `SCORE_INCREMENT` (10).
- **FR-1.3**: Minimum score is 0. No maximum limit is needed.
- **FR-1.4**: The default score for each player is 0.
- **FR-1.5**: A "Confirm" / "Done" button is shown at the bottom of the page.
- **FR-1.6**: The "Confirm" button replaces the current "Next Round" button.

### FR-2: Round Completion Logic

- **FR-2.1**: On confirm, `gameStore.assignPlayerScore(playerId, points)` is called for each player.
- **FR-2.2**: After all scores are assigned, `gameStore.completeRound()` is called to save the round to `roundHistory`.

### FR-3: Post-Round Leaderboard Overlay

- **FR-3.1**: After round completion, the existing `PlayerLeaderboard` component is displayed as an overlay on the results page.
- **FR-3.2**: The overlay shows players sorted by `totalScore` with rank medals.
- **FR-3.3**: The overlay auto-dismisses after `RESULTS_DISPLAY_DURATION_MS` (2000ms) OR on user tap/click — whichever comes first.
- **FR-3.4**: The `isGameCompleted` prop is passed as `false` at this stage (game not yet finished).

### FR-4: "Next Round or Finish?" Decision Modal

- **FR-4.1**: After the leaderboard overlay dismisses, a `GameModal` appears with two options.
- **FR-4.2**: **"Next Round"** button navigates to `/round-start`.
- **FR-4.3**: **"Finish Game"** button calls `gameStore.completeGame()` then navigates to `/leaderboard`.
- **FR-4.4**: The modal cannot be dismissed without choosing an option (no backdrop close, no ESC).

### FR-5: Final Game Completion

- **FR-5.1**: `gameStore.completeGame()` must be called before navigating to the final leaderboard.
- **FR-5.2**: On the leaderboard page, the "Next Round" button must be hidden when `isGameCompleted` is `true`.
- **FR-5.3**: The winning player (highest `totalScore`) must show the winner crown and badge.

## 5. Non-Functional Requirements

- **NFR-1**: All new UI elements must use the existing game design system components (`GameButton`, `GameModal`, `GamePlayerCard`, `GameHeader`, etc.).
- **NFR-2**: Score input controls must be touch-friendly (minimum 44px tap targets) for mobile play.
- **NFR-3**: All user-facing strings must be added to both `de.json` and `en.json` locale files.
- **NFR-4**: Animations/transitions should use the existing `v-motion` directive and design system transitions.
- **NFR-5**: The workflow must work offline (all state is in-memory / IndexedDB — no server calls needed).

## 6. UI/UX Design Decisions

### Score Input Control

- Use `GameButton` with `+` and `-` variants flanking a `GameDisplay` showing the current score — consistent with the game's existing "3D arcade button" aesthetic.
- Each player card gets its own inline score adjuster row below the answer.

### Decision Modal

- Reuse `GameModal` (default variant, not danger).
- Two `GameButton` options: "Next Round" (primary) and "Finish Game" (secondary).
- Header text: "Round Complete!" / "Runde abgeschlossen!"

### PlayerLeaderboard Overlay

- Already fully styled with crown animations, rank medals, and responsive layout.
- Mount it directly on the results page with `visible` bound to a reactive flag.

## 7. Scope & Assumptions

### In Scope

- Score entry UI on the results page
- Wiring `assignPlayerScore`, `completeRound`, `completeGame` into the page flow
- Post-round leaderboard overlay using existing `PlayerLeaderboard` component
- "Next Round or Finish?" decision modal
- i18n strings for both `de` and `en`

### Out of Scope

- Automatic scoring / answer validation (players manually judge each other's answers)
- Round limits / automatic game ending (the group decides when to finish)
- Per-round timer or time pressure
- Answer editing after submission
- Undo/redo for score entry
- Changes to the game page itself (`game.vue`)
- Changes to the fortune wheel or round-start page

### Assumptions

- Scoring is manual — the person holding the device (game master) enters points for each player based on group consensus.
- There is no maximum number of rounds — the game continues until players choose "Finish Game".
- The `SCORE_INCREMENT` of 10 is the standard unit, but direct numeric entry via the +/- buttons in steps of 10 is sufficient.
- The existing `PlayerLeaderboard` component can be used as-is (it already has all needed props/events).

## 8. Existing Assets to Leverage

| Asset                         | Location                             | Status                            |
| ----------------------------- | ------------------------------------ | --------------------------------- |
| `assignPlayerScore()`         | `stores/game.ts:458`                 | Implemented, unused               |
| `completeRound()`             | `stores/game.ts:493`                 | Implemented, unused               |
| `completeGame()`              | `stores/game.ts:278`                 | Implemented, unused               |
| `PlayerLeaderboard.vue`       | `components/PlayerLeaderboard.vue`   | Fully built, unmounted            |
| `GameModal.vue`               | `components/game/GameModal.vue`      | Reusable                          |
| `GameButton.vue`              | `components/game/GameButton.vue`     | Reusable                          |
| `GameDisplay.vue`             | `components/game/GameDisplay.vue`    | Reusable for score display        |
| `GamePlayerCard.vue`          | `components/game/GamePlayerCard.vue` | Needs enhancement for score input |
| `SCORE_INCREMENT`             | `packages/shared/src/constants.ts`   | = 10                              |
| `RESULTS_DISPLAY_DURATION_MS` | `packages/shared/src/constants.ts`   | = 2000                            |

## 9. Known Bugs to Fix as Part of This Work

- **Double `goHome()` in QuitModal**: `QuitModal.handleYes()` calls `goHome()` internally AND emits `@confirm` which triggers another `goHome()` in the parent. The parent handler should not duplicate the navigation.

## 10. Success Criteria

1. After a round, the user can enter points for each player on the results page.
2. Confirming scores records the round in `roundHistory` via `completeRound()`.
3. After scoring, the current standings are briefly shown via `PlayerLeaderboard`.
4. The user is presented with a choice to play another round or finish the game.
5. Choosing "Finish Game" navigates to the leaderboard page with the winner highlighted.
6. The leaderboard page shows only "OK" (no "Next Round") when the game is completed.
7. All text is available in both German and English.
