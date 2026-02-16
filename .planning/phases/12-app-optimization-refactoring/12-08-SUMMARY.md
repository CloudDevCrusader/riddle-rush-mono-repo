---
phase: 12-app-optimization-refactoring
plan: 08
subsystem: game-store
tags: [refactoring, composables, game-store, pinia, options-api, persistence, indexeddb, lifecycle]

# Dependency graph
requires: [12-06, 12-07]
provides:
  - usePersistence composable extracting IndexedDB persistence logic from game store
  - useGameLifecycle composable extracting game lifecycle orchestration from game store
  - Game store reduced from 452 to 352 lines (-22%)
affects: [12-09, 12-10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Stateless persistence composable wrapping IndexedDB with error handling (5 functions)
    - Stateless lifecycle composable for attempt creation and round result building (3 functions)

key-files:
  created:
    - apps/game/composables/usePersistence.ts
    - apps/game/composables/useGameLifecycle.ts
  modified:
    - apps/game/stores/game.ts

key-decisions:
  - 'Persistence and lifecycle composables are stateless - accept data as parameters, return results'
  - 'Options API preserved - store delegates to composable functions, public API unchanged'
  - 'useIndexedDB called internally by usePersistence (not passed as parameter) for test mock compatibility'
  - 'useStatistics called internally by useGameLifecycle for same mock compatibility reason'
  - 'Direct useIndexedDB, useStatistics, useLogger imports removed from store'

patterns-established:
  - 'Continued stateless composable extraction pattern from 12-06/12-07'
  - 'Persistence layer encapsulates all IndexedDB interaction with graceful error handling'
  - 'Lifecycle composable encapsulates attempt creation, round results, and statistics updates'

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-02-16
---

# Phase 12 Plan 08: Extract usePersistence and useGameLifecycle from Game Store Summary

**Extracted persistence and lifecycle logic into focused composables, reducing game store from 452 to 352 lines (-22%) while keeping Options API and all 711 tests passing unchanged**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-16T21:55:00Z
- **Completed:** 2026-02-16T21:58:00Z
- **Tasks:** 3 auto tasks completed
- **Files created:** 2, **Files modified:** 1

## Accomplishments

- Created `usePersistence` composable (123 lines) -- 5 stateless functions: `loadSessionFromDB`, `loadHistoryFromDB`, `saveSessionToDB`, `saveHistoryToDB`, `loadSessionById`. Each wraps `useIndexedDB()` calls with error handling and logging. Save operations swallow errors gracefully (game continues). Load operations return null on error. `loadSessionById` throws on missing session.
- Created `useGameLifecycle` composable (85 lines) -- 3 stateless functions: `createAttempt`, `buildRoundResult`, `updateStatisticsForSession`. Creates attempt objects with timestamps, builds round results from session state, wraps statistics updates with error handling.
- Refactored game store to delegate persistence and lifecycle logic to new composables. Removed direct imports of `useIndexedDB`, `useStatistics`, and `useLogger` from the store.
- All 711 tests pass unchanged (9 skipped) -- zero test modifications required.

## Line Count Impact

| File                                        | Before | After | Change                     |
| ------------------------------------------- | ------ | ----- | -------------------------- |
| `apps/game/stores/game.ts`                  | 452    | 352   | -100 (-22%)                |
| `apps/game/composables/usePersistence.ts`   | --     | 123   | +123 (new)                 |
| `apps/game/composables/useGameLifecycle.ts` | --     | 85    | +85 (new)                  |
| **Net**                                     | 452    | 560   | +108 (logic redistributed) |

The store is 22% smaller. The extracted logic is now in focused, testable composables with comprehensive JSDoc documentation.

## Cumulative Store Reduction (Plans 12-06 + 12-07 + 12-08)

| Milestone   | Store Lines | Change from Original |
| ----------- | ----------- | -------------------- |
| Original    | 553         | --                   |
| After 12-06 | 477         | -76 (-14%)           |
| After 12-07 | 452         | -101 (-18%)          |
| After 12-08 | 352         | -201 (-36%)          |

## Task Commits

Each task committed atomically:

1. **Tasks 1-3: Extract composables and refactor store** - `1d18b9dbc` (refactor)

## Files Created

- `apps/game/composables/usePersistence.ts` -- 123 lines. IndexedDB persistence wrapper with 5 functions: load session, load history, save session, save history, load session by ID. Error handling logs failures and returns null/throws as appropriate. Graceful degradation on save failures.
- `apps/game/composables/useGameLifecycle.ts` -- 85 lines. Game lifecycle orchestration with 3 functions: create attempt with timestamp, build round result from session state (capturing round number, category, letter, player results), update statistics with error handling.

## Files Modified

- `apps/game/stores/game.ts` -- Removed inline persistence and lifecycle logic. Added imports for usePersistence and useGameLifecycle. Store actions now delegate IndexedDB operations (loadSession, saveSession, loadHistory, saveHistory, loadGameSession) to usePersistence. Store actions delegate attempt creation, round result building, and statistics updates to useGameLifecycle. Removed direct imports of useIndexedDB, useStatistics, and useLogger.

## Decisions Made

- **Internal composable instantiation**: `usePersistence` calls `useIndexedDB()` internally (not as parameter) because test mocks intercept at `~/composables/useIndexedDB` module level. Same pattern for `useGameLifecycle` calling `useStatistics()` internally.
- **Single commit for all tasks**: Tightly coupled extraction -- composable creation and store delegation committed as one atomic unit.
- **Logger removed from store imports**: All error logging now handled within the extracted composables, further simplifying the store's dependency surface.

## Deviations from Plan

None -- plan executed exactly as written.

## Test Results

```
Test Files  26 passed (26)
      Tests  711 passed | 9 skipped (720)
   Duration  6.10s
```

All tests pass without any modifications -- the store's public API is completely backward compatible.

## Self-Check: PASSED
