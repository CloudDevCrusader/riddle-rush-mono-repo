# Refactor Game App — Simplify Code and Tests

## Configuration

- **Spec**: `.zenflow/tasks/new-task-5e27/spec.md`
- **Artifacts**: `.zenflow/tasks/new-task-5e27/`

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

<!-- chat-id: 0cd60ada-2741-4779-8380-058efbe7b208 -->

Assessed difficulty: **Medium-Hard**. See `spec.md` for full technical context, file inventory, implementation approach, and risk mitigations.

---

### [x] Step 1: Add missing unit tests for untested composables

<!-- chat-id: 2b806de9-9fd6-469a-b243-0a54a3b95016 -->

Add unit tests for the composables that currently have zero test coverage. This ensures a safety net exists before any refactoring touches these files.

Files to CREATE:

- `apps/game/tests/unit/use-game-state.spec.ts` — test `useGameState` composable
- `apps/game/tests/unit/use-game-actions.spec.ts` — test `useGameActions` composable
- `apps/game/tests/unit/use-statistics.spec.ts` — test `useStatistics` composable (mock IndexedDB)
- `apps/game/tests/unit/use-indexed-db.spec.ts` — test `useIndexedDB` (mock `idb` openDB)

Verification:

- `pnpm run test:unit` — all new tests pass
- `pnpm run workspace:check` — no type or lint errors

---

### [x] Step 2: Split oversized game-store unit test file

<!-- chat-id: 8606cdef-272e-4d72-a82c-83689c12f9cb -->

Split `tests/unit/game-store.spec.ts` (1,249 lines) into focused test files per concern:

Files to CREATE:

- `apps/game/tests/unit/game-store-session.spec.ts` — session lifecycle (start, end, resume, abandon)
- `apps/game/tests/unit/game-store-multiplayer.spec.ts` — multiplayer actions (setupPlayers, submitPlayerAnswer, completeRound)
- `apps/game/tests/unit/game-store-categories.spec.ts` — category loading, pagination, random selection

Files to DELETE:

- `apps/game/tests/unit/game-store.spec.ts` — replaced by the three above

Verification:

- Same test count passes as before the split
- `pnpm run workspace:check`

---

### [x] Step 3: Split useIndexedDB into domain composables

<!-- chat-id: bdb08c5f-e03d-4044-91a1-1f158d03ab05 -->

Extract the five DB concerns from `useIndexedDB.ts` into dedicated composables. Keep the original file as a thin re-exporter of the shared `getDB()` + store constants so existing call sites are unaffected.

Files to CREATE:

- `apps/game/composables/useGameSessionDB.ts` — save/load active game session
- `apps/game/composables/useGameHistoryDB.ts` — save/load/query history entries
- `apps/game/composables/useStatisticsDB.ts` — save/load statistics
- `apps/game/composables/useLeaderboardDB.ts` — save/load leaderboard entries

Files to MODIFY:

- `apps/game/composables/useIndexedDB.ts` — reduce to DB init + `getDB()` + re-exports of domain composables for backwards compatibility

Verification:

- `pnpm run typecheck` — no new errors
- `pnpm run test:unit` — existing tests still pass (especially `game-store.spec.ts` tests that touch DB)
- `pnpm run workspace:check`

---

### [x] Step 4: Extract validation utilities from useForm

<!-- chat-id: ef52a4d2-7c29-4b7d-b7d8-1ea27bab515e -->

Reduce `useForm.ts` (226 lines) by extracting reusable validation rules to a utility file.

Files to CREATE:

- `apps/game/utils/validators.ts` — pure validation functions (email, minLength, required, etc.)

Files to MODIFY:

- `apps/game/composables/useForm.ts` — import from `validators.ts`, target < 160 lines

Files to MODIFY (tests):

- `apps/game/tests/unit/use-form.spec.ts` — update imports if any validators are now testable in isolation

Verification:

- `pnpm run test:unit` — `use-form.spec.ts` still fully passes
- `pnpm run workspace:check`

---

### [x] Step 5: Extract animation constants from pages and components

<!-- chat-id: b96c602f-e524-4460-8b85-161bcb6d5a2c -->

Replace magic numbers (animation durations, delays) scattered across pages and components with named constants.

Files to CREATE:

- `apps/game/utils/animation-constants.ts` — `WHEEL_SPIN_DURATION_MS`, `PAGE_TRANSITION_MS`, etc.

Files to MODIFY (as needed, grep for magic numbers first):

- `pages/round-start.vue`
- `pages/game/[[gameId]].vue`
- `components/FortuneWheel.vue`
- `components/SplashScreen.vue`

Verification:

- `pnpm run typecheck && pnpm run lint`
- Visual smoke test: run `pnpm run dev`, navigate to round-start and game pages, verify animations still work

**Completed**: Created `animation-constants.ts` with 15 named constants. Updated:

- `FortuneWheel.vue` — uses `WHEEL_SPIN_DURATION_MS`, `WHEEL_SPIN_COMPLETE_DELAY_MS`
- `SplashScreen.vue` — uses `SPLASH_*` constants for loading simulation
- `round-start.vue` — uses `WHEEL_AUTO_SPIN_DELAY_MS`
- `useNavigation.ts` — uses `LOADING_*` and `NAVIGATION_DEBOUNCE_MS` constants
- `useModal.ts` — uses `MODAL_CLOSE_DATA_CLEAR_DELAY_MS`

All 590 unit tests pass. Workspace checks pass.

---

### [x] Step 6: Extract GameAnswerForm component from game page

<!-- chat-id: 508d34d0-1532-4b7f-a55a-86a19ca9c9c0 -->

Reduce `pages/game/[[gameId]].vue` (912 lines) by extracting the answer input form and submit logic into a dedicated component. Target: page < 650 lines.

Files to CREATE:

- `apps/game/components/game/GameAnswerForm.vue` — answer input, validation feedback, submit button. Emits `submit` event; receives props for current player.

Files to MODIFY:

- `pages/game/[[gameId]].vue` — replace inline form with `<GameAnswerForm>` component

Verification:

- `pnpm run typecheck`
- Manual: start a game and verify answer submission still works for both single and multiplayer flows
- `pnpm run workspace:check`

**Completed**: Created `GameAnswerForm.vue` component in `components/game/`. Updated game page to use it.

- Game page reduced from **912 → 776 lines** (-136 lines, -15%)
- Template reduced from ~97 lines to ~77 lines (form logic moved to component)
- Script reduced by ~40 lines (sanitizeInput, submitAnswer logic moved)
- CSS reduced by ~85 lines (form styles moved to component)
- Component uses existing `GameButton` for consistent design system styling
- All 590 unit tests pass. Workspace checks pass.

Note: The page is still 776 lines (vs 650 target) because the bulk is CSS for the complex visual design (3D letter display, category panel overlays, responsive breakpoints). The logic (template + script = 261 lines) is lean.

---

### [x] Step 7: Extract RoundSetupControls component from round-start page

<!-- chat-id: feb3a235-b264-49ac-9bbb-631512b9eeaf -->

Reduce `pages/round-start.vue` (627 lines) by extracting the category/letter selection controls. Target: page < 420 lines.

Files to CREATE:

- `apps/game/components/RoundSetupControls.vue` — category picker, letter display, confirm button. Receives props, emits `confirm` event.

Files to MODIFY:

- `pages/round-start.vue` — replace inline controls with `<RoundSetupControls>`

Verification:

- `pnpm run typecheck`
- Manual: complete a round-start flow, verify category/letter selection works
- `pnpm run workspace:check`

**Completed**: Created `RoundSetupControls.vue` component that encapsulates:

- Dual fortune wheel UI (category + letter wheels)
- Results display showing selected category/letter after wheels complete
- Category icon mapping logic
- `selectRandom()` method for non-wheel mode
- `startWheelSpins()` method for wheel mode

Updated round-start page to:

- Use the new `<RoundSetupControls>` component
- Handle `setup-complete` event to start the game
- Retain page layout (background, top bar, loading indicator)

Results:

- **round-start.vue**: 627 → 271 lines (-356 lines, **-57%**)
- **RoundSetupControls.vue**: 434 lines (new reusable component)
- Template reduced from ~100 lines to ~42 lines
- Script reduced from ~190 lines to ~100 lines (game start logic retained in page)
- All 590 unit tests pass. Workspace checks pass.

---

### [ ] Step 8: Remove legacy single-player shims from game store

Clean up `stores/game.ts` by removing getters marked `// Legacy support` (currentScore, currentAttempts) after verifying no template/component uses them directly.

Steps:

1. `grep -r "currentScore\|currentAttempts" apps/game --include="*.vue" --include="*.ts"` — find all call sites
2. Update any call sites to use the multiplayer equivalents
3. Remove legacy getters from the store
4. Target: store < 420 lines

Files to MODIFY:

- `apps/game/stores/game.ts`
- Any `.vue` or `.ts` files that reference the removed getters

Verification:

- `pnpm run typecheck` — no missing property errors
- `pnpm run test:unit` — game store tests pass
- `pnpm run workspace:check`

---

### [ ] Step 9: Write implementation report

After all steps are complete, write a summary report.

File to CREATE:

- `.zenflow/tasks/new-task-5e27/report.md`

Contents:

- What was refactored and why
- Lines of code reduced per file
- Test coverage improvements
- Any issues or deferred work
