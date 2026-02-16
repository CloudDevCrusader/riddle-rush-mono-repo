# Full SDD workflow

## Configuration

- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Workflow Steps

### [x] Step: Requirements

<!-- chat-id: 80bb8d69-8cfe-47b9-9b2b-7b94394b60d7 -->

Create a Product Requirements Document (PRD) based on the feature description.

1. Review existing codebase to understand current architecture and patterns
2. Analyze the feature definition and identify unclear aspects
3. Ask the user for clarifications on aspects that significantly impact scope or user experience
4. Make reasonable decisions for minor details based on context and conventions
5. If user can't clarify, make a decision, state the assumption, and continue

Save the PRD to `{@artifacts_path}/requirements.md`.

### [x] Step: Technical Specification

<!-- chat-id: 8f87ea94-0e81-48d0-a005-553850f2402d -->

Create a technical specification based on the PRD in `{@artifacts_path}/requirements.md`.

1. Review existing codebase architecture and identify reusable components
2. Define the implementation approach

Save to `{@artifacts_path}/spec.md` with:

- Technical context (language, dependencies)
- Implementation approach referencing existing code patterns
- Source code structure changes
- Data model / API / interface changes
- Delivery phases (incremental, testable milestones)
- Verification approach using project lint/test commands

### [x] Step: Planning

<!-- chat-id: a5c17a00-95b3-4b1c-888a-340b43624899 -->

Create a detailed implementation plan based on `{@artifacts_path}/spec.md`.

Plan created below — the Implementation step has been replaced with 5 concrete tasks.

---

### [x] Step: Fix store bug and QuitModal double-navigation

<!-- chat-id: 68154ee1-3e25-4adf-bdfd-c5345403cf4f -->

**Goal:** Fix two bugs that must be resolved before any new scoring logic is wired up.

**Files to modify:**

1. **`apps/game/stores/game.ts`** (line ~458–477) — Fix `assignPlayerScore()` delta calculation bug
   - Replace the `if (points !== player.currentRoundScore)` guard with a proper delta:
     ```ts
     const delta = points - player.currentRoundScore
     player.totalScore += delta
     player.currentRoundScore = points
     ```
   - This ensures idempotent score assignment (calling it multiple times with the same value is safe)

2. **`apps/game/components/QuitModal.vue`** (line 60) — Remove duplicate `goHome()` call
   - Remove the `goHome()` call from `handleYes()` — the parent already navigates on `@confirm`
   - The parent `game/[[gameId]].vue` has `handleQuitConfirmed()` which calls `goHome()`

**Unit tests:**

- Update or add unit tests for `assignPlayerScore()` in the game store test file to verify:
  - 0→10: totalScore increases by 10
  - 10→20: totalScore increases by 10 (not 20)
  - 20→10: totalScore decreases by 10
  - 10→10: totalScore unchanged (delta = 0)

**Verification:**

- [ ] `pnpm run workspace:check` passes
- [ ] `pnpm run test:unit` passes (existing + new tests)
- [ ] Commit: `fix(game): correct assignPlayerScore delta calculation and QuitModal double-navigation`

---

### [x] Step: Add i18n scoring translations

<!-- chat-id: 836c01ce-6804-44cc-ac47-512b2e9e2a45 -->

**Goal:** Add all user-facing strings for the scoring workflow to both locale files.

**Files to modify:**

1. **`apps/game/i18n/locales/de.json`** — Add `scoring` namespace:

   ```json
   "scoring": {
     "title": "Punktevergabe",
     "player": "Spieler",
     "confirm_scores": "Punkte bestätigen",
     "round_complete": "Runde abgeschlossen!",
     "play_another_round": "Möchtet ihr noch eine Runde spielen?",
     "next_round": "Nächste Runde",
     "finish_game": "Spiel beenden",
     "description": "Rundenergebnisse ansehen",
     "error_saving": "Fehler beim Speichern der Punkte. Bitte erneut versuchen."
   }
   ```

2. **`apps/game/i18n/locales/en.json`** — Add `scoring` namespace:
   ```json
   "scoring": {
     "title": "Scoring",
     "player": "Player",
     "confirm_scores": "Confirm Scores",
     "round_complete": "Round Complete!",
     "play_another_round": "Would you like to play another round?",
     "next_round": "Next Round",
     "finish_game": "Finish Game",
     "description": "View round scoring results",
     "error_saving": "Failed to save scores. Please try again."
   }
   ```

**Note:** The results page already references `t('scoring.title', 'Scoring')` etc. with inline fallbacks — these keys will now resolve properly.

**Verification:**

- [ ] `pnpm run workspace:check` passes
- [ ] `pnpm run validate:locales` passes (if applicable)
- [ ] Commit: `feat(i18n): add scoring workflow translations for de and en`

---

### [x] Step: Implement score entry UI on results page

<!-- chat-id: ccb3b8db-fade-4e51-b6dc-43855fe43411 -->

**Goal:** Add per-player score controls (+/- buttons + score display) and a "Confirm Scores" button to the results page, wiring them to `assignPlayerScore()` and `completeRound()`.

**Files to modify:**

1. **`apps/game/pages/results/[[gameId]].vue`** — Major rewrite of both template and script:

   **Script changes:**
   - Import `SCORE_INCREMENT` from `@riddle-rush/shared/constants`
   - Add `useNavigation()` for `goToRoundStart` and `goToLeaderboard`
   - Add `useAudio()` for button click sounds
   - Add local reactive state: `pendingScores = reactive(new Map<string, number>())`
   - Initialize all player scores to 0 on mount
   - Add `incrementScore(playerId)` and `decrementScore(playerId)` functions (step by `SCORE_INCREMENT`)
   - Add `isConfirming` ref for loading state
   - Add `handleConfirmScores()`:
     - For each player: `await gameStore.assignPlayerScore(playerId, score)`
     - Then: `await gameStore.completeRound()`
     - Then: transition to leaderboard overlay phase (next step)
   - Remove old `handleNextRound` that just did `router.push('/round-start')`

   **Template changes:**
   - Keep `GameBackground`, `GameHeader`, and `v-motion` animations
   - Wrap each `GamePlayerCard` in a container div (`.scoring-page__player-entry`)
   - Below each card, add a `.scoring-page__score-controls` row:
     - `GameButton` variant="danger" size="sm" for `−` (disabled when score ≤ 0)
     - `GameDisplay` size="sm" :glow="false" showing the pending score
     - `GameButton` variant="primary" size="sm" for `+`
   - Replace the "Next Round" button with "Confirm Scores" button (`variant="primary"`, `size="lg"`, `full-width`, `:loading="isConfirming"`)

   **Style changes:**
   - Add `.scoring-page__player-entry` (flex column, gap)
   - Add `.scoring-page__score-controls` (flex row, centered, gap)

**Verification:**

- [ ] `pnpm run workspace:check` passes
- [ ] Manual test: navigate through game → results page → see +/- controls → adjust scores → confirm
- [ ] Commit: `feat(game): add score entry controls to results page`

---

### [ ] Step: Add leaderboard overlay and decision modal to results page

<!-- chat-id: ca6b452f-9a42-4807-9db7-e70df48e02fb -->

**Goal:** After scores are confirmed, show the `PlayerLeaderboard` overlay briefly, then present a "Next Round or Finish?" modal.

**Files to modify:**

1. **`apps/game/pages/results/[[gameId]].vue`** — Add overlay + modal (extends previous step):

   **Script additions:**
   - Import `RESULTS_DISPLAY_DURATION_MS` from `@riddle-rush/shared/constants`
   - Add `showLeaderboard = ref(false)` and `showDecisionModal = ref(false)`
   - Update `handleConfirmScores()` to set `showLeaderboard = true` after `completeRound()`
   - Add `handleLeaderboardDismiss()`:
     - Clear auto-dismiss timer
     - Set `showLeaderboard = false`, `showDecisionModal = true`
   - Add auto-dismiss watcher: when `showLeaderboard` becomes `true`, start `setTimeout(handleLeaderboardDismiss, RESULTS_DISPLAY_DURATION_MS)`
   - Add `onUnmounted` cleanup for the timer
   - Add `handleNextRound()`: close modal, `await goToRoundStart()`
   - Add `handleFinishGame()`: close modal, `await gameStore.completeGame()`, `await goToLeaderboard()`

   **Template additions:**
   - Add `<PlayerLeaderboard>` component:
     - `:visible="showLeaderboard"`
     - `:players="leaderboard"` (from `useGameState()`)
     - `:is-game-completed="false"`
     - `:current-round="currentRound"` (from `useGameState()`)
     - `@close="handleLeaderboardDismiss"`
     - `@continue="handleLeaderboardDismiss"`
   - Add `<GameModal>` for decision:
     - `v-model="showDecisionModal"`
     - `:title="t('scoring.round_complete')"`
     - `:close-on-backdrop="false"` `:close-on-escape="false"`
     - Two `GameButton`s inside: "Next Round" (primary) and "Finish Game" (secondary)

   **Style additions:**
   - `.decision-content` text alignment + spacing
   - `.decision-actions` flex row with gap

**Verification:**

- [ ] `pnpm run workspace:check` passes
- [ ] Manual test: full flow — game → results → score → confirm → leaderboard appears → auto-dismiss after 2s → decision modal → choose option
- [ ] Test "Next Round": navigates to round-start, new round begins with reset scores
- [ ] Test "Finish Game": navigates to leaderboard, winner highlighted, "Next Round" button hidden
- [ ] Commit: `feat(game): add post-scoring leaderboard overlay and round decision modal`

---

### [ ] Step: E2E and unit tests

**Goal:** Write comprehensive tests for the new scoring workflow.

**Unit tests** (`apps/game/tests/unit/`):

- [ ] `assignPlayerScore` delta logic (if not already added in step 1)
- [ ] `completeRound()` records round history correctly
- [ ] `completeGame()` sets status to `'completed'`
- [ ] `leaderboard` getter sorts by `totalScore` and marks winner correctly

**E2E tests** (`apps/game/tests/e2e/`):

- [ ] Score entry flow: start game → play round → reach results → adjust scores → confirm
- [ ] Leaderboard overlay appears after confirm and auto-dismisses
- [ ] Decision modal: "Next Round" navigates to round-start
- [ ] Decision modal: "Finish Game" navigates to leaderboard with winner
- [ ] Multi-round: scores accumulate correctly across 2+ rounds
- [ ] QuitModal: only one navigation on quit (no double goHome)

**Verification:**

- [ ] `pnpm run test:unit` — all pass
- [ ] `pnpm run test:e2e` — all pass
- [ ] `pnpm run workspace:check` passes
- [ ] Commit: `test(game): add unit and E2E tests for scoring workflow`

---

### [ ] Step: PR prepare

**Goal:** Prepare branch for pull request.

- [ ] Ensure all commits are pushed
- [ ] Run final `pnpm run workspace:check`
- [ ] Run `pnpm run test:unit` and `pnpm run test:e2e`
- [ ] Review all changes with `git diff main...HEAD`
- [ ] Create PR with summary of changes, test plan, and screenshots/recordings if applicable

---

### [ ] Step: Review all changes and push all pending changes

- [ ] Final review of all modified files
- [ ] Ensure no debug code, console.log, or TODO comments left behind
- [ ] Push all commits to remote
- [ ] Verify CI pipeline passes
