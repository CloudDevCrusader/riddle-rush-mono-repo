# Spec and build

## Configuration

- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:

- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification

<!-- chat-id: b9a69e4f-9de9-4271-a7d4-80337f2518c7 -->

Spec saved to `.zenflow/tasks/new-task-claude-code-eb74/spec.md`.

**Difficulty**: Hard (wide scope, entangled legacy code paths, risk of regressions)

**Summary of findings**:

- `pages/game/[[gameId]].vue` at 912 lines is the largest file (500 lines are CSS/template, extractable)
- Legacy single-player code paths coexist with multiplayer in `stores/game.ts`
- `useOptimizedImage.ts` is a 141-line stub that does nothing
- `utils/sessionValidationDemo.ts` is a dev utility in the wrong directory
- `endGame()`/`completeGame()` are near-duplicate functions in the game store
- 3 competing patterns for baseUrl/asset resolution across pages
- `SettingsModal.vue` (511 lines) mixes audio controls and category filters
- Key composables (`useAnswerCheck`, `useStatistics`, `useGameActions`) have zero unit tests
- `redis` listed as production dependency in a client-side SPA

---

### [ ] Step 1: Quick Wins — Dead Code, Dependencies, Logging

Remove misplaced utility file, fix redis dependency placement, standardize logging.

- Delete `apps/game/utils/sessionValidationDemo.ts`
- Move `redis` from `dependencies` to `devDependencies` in `apps/game/package.json`
- Replace `console.log('Already connected')` in `apps/game/composables/useWebSocket.ts` with `logger.info()`
- Run `pnpm run workspace:check` to verify nothing breaks

---

### [ ] Step 2: Remove `useOptimizedImage.ts` Stub

The composable accepts optimization parameters but returns the path unchanged — it's a non-functional stub.

- Audit callers: `grep -r "useOptimizedImage" apps/game/`
- Delete `apps/game/composables/useOptimizedImage.ts`
- Update any callers to use the image path directly (expected: 0–2 callers)
- Run `pnpm run workspace:check`

---

### [ ] Step 3: Unify `endGame()` / `completeGame()` in Game Store

Two near-identical functions differ only in `status` value and whether `currentSession` is cleared.

- Add `finalizeGame(options: { status: 'ended' | 'completed'; clearSession?: boolean })` to `stores/game.ts`
- Refactor `endGame()` and `completeGame()` to call `finalizeGame()` (keep as thin wrappers to avoid breaking callsites)
- Update `apps/game/tests/unit/game-store.spec.ts` to test `finalizeGame` directly
- Run `pnpm run workspace:check && pnpm run test:unit`

---

### [ ] Step 4: Standardize BaseUrl / Asset Usage

Three competing patterns for resolving asset URLs. Standardize on `useAssets()` composable.

- Audit all pages for direct `useRuntimeConfig().public.baseUrl` usage for asset paths
- Update `apps/game/pages/credits.vue` to use `useAssets()`
- Update `apps/game/pages/players.vue` to use `useAssets()` for asset refs
- Update `apps/game/pages/game/[[gameId]].vue` to use `useAssets()` for asset refs
- Extend `apps/game/composables/useAssets.ts` with any missing helpers if needed
- Run `pnpm run workspace:check && pnpm run test:e2e` to verify images still load

---

### [ ] Step 5: Extract Sub-components from Game Page

`pages/game/[[gameId]].vue` at 912 lines — extract the player answer form and player status list.

- Create `apps/game/components/game/PlayerAnswerInput.vue`
  - Props: `playerName: string`, `isDisabled: boolean`
  - Emits: `submit(answer: string)`
  - Contains: input field, submit button, answer state for current player's turn
- Create `apps/game/components/game/PlayerStatusList.vue`
  - Props: `players: Player[]`, `currentPlayerIndex: number`
  - Contains: list of players showing who has answered, score, turn indicator
- Refactor `apps/game/pages/game/[[gameId]].vue` to use new components
- Run `pnpm run workspace:check && pnpm run test:e2e` (game-complete-flow.spec.ts must pass)

---

### [ ] Step 6: Split `SettingsModal.vue`

511-line component mixing two unrelated concerns: audio controls and category filters.

- Create `apps/game/components/settings/AudioSettings.vue` — volume sliders for music/sound
- Create `apps/game/components/settings/CategoryFilter.vue` — category toggle checkboxes
- Refactor `apps/game/components/SettingsModal.vue` to orchestrate both sub-components
- Run `pnpm run workspace:check && pnpm run test:e2e`

---

### [ ] Step 7: Add Missing Unit Tests for Key Composables

Three composables with zero test coverage handle core game logic.

- Create `apps/game/tests/unit/use-answer-check.spec.ts`
  - Mock PetScan API responses
  - Test online answer validation, offline fallback, 5-minute cache behavior
- Create `apps/game/tests/unit/use-statistics.spec.ts`
  - Mock IndexedDB via `useIndexedDB`
  - Test statistics aggregation, leaderboard entry creation
  - Verify/document the multi-player dead code path
- Create `apps/game/tests/unit/use-game-actions.spec.ts`
  - Mock game store, toast, audio
  - Test high-level action dispatch and side effects
- Run `pnpm run test:unit:coverage` — coverage must not drop below 80% thresholds

---

### [ ] Step: Implementation Report

After all steps above are complete, write a report to `.zenflow/tasks/new-task-claude-code-eb74/report.md` describing:

- What was implemented
- How the solution was tested
- The biggest issues or challenges encountered
