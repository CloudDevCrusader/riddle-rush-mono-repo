---
phase: quick-007
plan: 01
subsystem: game-state
tags: [bug-fix, player-turn, game-session, indexeddb]
dependency-graph:
  requires: []
  provides: [currentPlayerIndex-field, index-based-player-turn]
  affects: [game-store, player-manager, session-manager]
tech-stack:
  added: []
  patterns: [index-based-lookup, deterministic-state]
key-files:
  created:
    - apps/game/tests/unit/current-player-index.spec.ts
  modified:
    - packages/types/src/game.ts
    - apps/game/composables/usePlayerManager.ts
    - apps/game/composables/useSessionManager.ts
    - apps/game/stores/game.ts
    - apps/game/tests/utils/factories.ts
    - apps/game/tests/unit/composables/useStatistics.spec.ts
    - apps/game/tests/unit/composables/useIndexedDB.spec.ts
    - apps/game/utils/sessionValidationDemo.ts
decisions:
  - Index-based player turn lookup replaces hasSubmitted scanning for deterministic behavior
  - advancePlayerIndex does not wrap (returns index beyond length to signal all turns done)
metrics:
  duration: 4min
  completed: 2026-03-08
  tasks: 1/1
---

# Quick Task 7: Fix Page Reload on Game Start Causing Wrong Player Selection

Index-based currentPlayerIndex on GameSession replaces hasSubmitted scanning for deterministic player turn tracking that persists across page reloads.

## What Changed

### packages/types/src/game.ts

Added `currentPlayerIndex: number` field to the `GameSession` interface, positioned after `currentRound`. This field is persisted to IndexedDB with the session.

### apps/game/composables/usePlayerManager.ts

- Changed `getCurrentPlayerTurn(players)` to `getCurrentPlayerTurn(players, currentPlayerIndex)` -- simple index lookup (`players[currentPlayerIndex] ?? null`) instead of `players.find(p => !p.hasSubmitted)`.
- Added `advancePlayerIndex(currentIndex, playerCount)` utility that returns `currentIndex + 1` (no wrapping -- when index >= playerCount, getter returns null meaning all turns done).

### apps/game/composables/useSessionManager.ts

Added `currentPlayerIndex: 0` initialization to both `createSession()` and `createSinglePlayerSession()`.

### apps/game/stores/game.ts

- `currentPlayerTurn` getter now passes `state.currentSession?.currentPlayerIndex ?? 0` to `getCurrentPlayerTurn`.
- `submitPlayerAnswer` action increments `currentPlayerIndex` via `advancePlayerIndex` after marking the player as submitted.
- `startNextRound` and `resetPlayerSubmissions` actions reset `currentPlayerIndex` to 0.

### Test and mock updates

- Created `apps/game/tests/unit/current-player-index.spec.ts` with 9 tests covering composable functions and store integration.
- Updated mock session factories and inline session literals in 4 files to include `currentPlayerIndex: 0`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed missing currentPlayerIndex in sessionValidationDemo.ts**

- **Found during:** Task 1 (workspace:check)
- **Issue:** `utils/sessionValidationDemo.ts` creates 4 inline `GameSession` objects that were missing the new required field.
- **Fix:** Added `currentPlayerIndex: 0` to all 5 session literals in the file.
- **Files modified:** apps/game/utils/sessionValidationDemo.ts
- **Commit:** f205f0de3

**2. [Rule 3 - Blocking] Fixed missing currentPlayerIndex in test mock sessions**

- **Found during:** Task 1 (workspace:check)
- **Issue:** Test files `useStatistics.spec.ts`, `useIndexedDB.spec.ts`, and `factories.ts` create `GameSession` objects missing the new field.
- **Fix:** Added `currentPlayerIndex: 0` to all affected mock session creators.
- **Files modified:** apps/game/tests/utils/factories.ts, apps/game/tests/unit/composables/useStatistics.spec.ts, apps/game/tests/unit/composables/useIndexedDB.spec.ts
- **Commit:** f205f0de3

## Verification Results

- `pnpm run workspace:check` -- PASSED (Syncpack + TypeScript + ESLint)
- `pnpm run test:unit -- --run` -- 722 passed, 9 skipped, 0 failed (28 test files)

## Commits

| Task | Commit    | Description                                            |
| ---- | --------- | ------------------------------------------------------ |
| 1    | f205f0de3 | feat(quick-007): add currentPlayerIndex to GameSession |
