---
phase: 12-app-optimization-refactoring
plan: 07
subsystem: game-store
tags: [refactoring, composables, game-store, pinia, options-api, player-management, scoring]

# Dependency graph
requires: [12-06]
provides:
  - usePlayerManager composable extracting player CRUD and leaderboard logic from game store
  - useScoringEngine composable extracting scoring and ranking logic from game store
  - Game store reduced from 477 to 452 lines (-5%)
affects: [12-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Stateless player management composable with 11 functions
    - Stateless scoring engine composable with 4 functions

key-files:
  created:
    - apps/game/composables/usePlayerManager.ts
    - apps/game/composables/useScoringEngine.ts
  modified:
    - apps/game/stores/game.ts

key-decisions:
  - 'Player and scoring composables are stateless — accept data as parameters, return results'
  - 'Options API preserved — store delegates to composable functions, public API unchanged'
  - 'SCORE_PER_CORRECT_ANSWER import removed from store (delegated to useScoringEngine)'
  - 'Player and PlayerWithRank type imports retained in store for return type annotations'

patterns-established:
  - 'Continued stateless composable extraction pattern from 12-06'
  - 'Scoring engine encapsulates all point calculation and ranking logic'

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-02-16
---

# Phase 12 Plan 07: Extract usePlayerManager and useScoringEngine from Game Store Summary

**Extracted player management and scoring logic into focused composables, reducing game store from 477 to 452 lines while keeping Options API and all 711 tests passing unchanged**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-16T22:45:00Z
- **Completed:** 2026-02-16T22:49:00Z
- **Tasks:** 3 auto tasks completed
- **Files created:** 2, **Files modified:** 1

## Accomplishments

- Created `usePlayerManager` composable (181 lines) — 11 stateless functions: `createPlayers`, `findPlayerIndex`, `getPlayerById`, `submitPlayerAnswer`, `assignPlayerScore`, `updatePlayerAvatar`, `resetPlayerSubmissions`, `resetPlayerRoundState`, `buildLeaderboard`, `getCurrentPlayerTurn`, `allPlayersSubmitted`
- Created `useScoringEngine` composable (85 lines) — 4 stateless functions: `calculateAttemptScore`, `getRankSuffix`, `getScoreDisplay`, `determineWinners`
- Refactored game store to delegate to both composables in getters (`allPlayersSubmitted`, `currentPlayerTurn`, `leaderboard`) and actions (`setupPlayers`, `submitPlayerAnswer`, `assignPlayerScore`, `updatePlayerAvatar`, `startNextRound`, `resetPlayerSubmissions`, `getPlayerById`, `submitAttempt`)
- Removed `SCORE_PER_CORRECT_ANSWER` import from store (now encapsulated in useScoringEngine)
- All 711 tests pass unchanged (9 skipped) — zero test modifications required

## Line Count Impact

| File                                        | Before | After | Change                     |
| ------------------------------------------- | ------ | ----- | -------------------------- |
| `apps/game/stores/game.ts`                  | 477    | 452   | -25 (-5%)                  |
| `apps/game/composables/usePlayerManager.ts` | —      | 181   | +181 (new)                 |
| `apps/game/composables/useScoringEngine.ts` | —      | 85    | +85 (new)                  |
| **Net**                                     | 477    | 718   | +241 (logic redistributed) |

The store is 5% smaller. The extracted logic is now in focused, testable composables. Total code grew due to JSDoc documentation and explicit type annotations in the composables.

## Cumulative Store Reduction (Plans 12-06 + 12-07)

| Milestone   | Store Lines | Change from Original |
| ----------- | ----------- | -------------------- |
| Original    | 553         | —                    |
| After 12-06 | 477         | -76 (-14%)           |
| After 12-07 | 452         | -101 (-18%)          |

## Task Commits

Each task committed atomically:

1. **Tasks 1-3: Extract composables and refactor store** - `4cb8bfdd7` (refactor)

## Files Created

- `apps/game/composables/usePlayerManager.ts` — 181 lines. Player creation, lookup, answer submission, score assignment, avatar updates, round state resets, leaderboard building with rank sorting, current player turn calculation, all-players-submitted check.
- `apps/game/composables/useScoringEngine.ts` — 85 lines. Score calculation using SCORE_PER_CORRECT_ANSWER constant, rank suffix generation (1st/2nd/3rd/nth), score display formatting with rank, winner determination from player array.

## Files Modified

- `apps/game/stores/game.ts` — Removed inline player management and scoring logic. Added imports for usePlayerManager and useScoringEngine. Store getters now delegate to composable functions. Store actions delegate player mutations and scoring calculations. Removed SCORE_PER_CORRECT_ANSWER import (encapsulated in useScoringEngine).

## Decisions Made

- **Stateless composable pattern continued**: Same pattern as 12-06 — composables accept data parameters, store passes `this` or specific state properties.
- **Single commit for all tasks**: Tightly coupled extraction — composable creation and store delegation committed as one atomic unit.
- **SCORE_PER_CORRECT_ANSWER encapsulated**: Constant import moved from store to useScoringEngine, reducing store's dependency surface.
- **Type imports retained**: `Player` and `PlayerWithRank` types still imported in store for return type annotations on getters and actions.

## Deviations from Plan

None — plan executed exactly as written.

## Test Results

```
Test Files  26 passed (26)
      Tests  711 passed | 9 skipped (720)
   Duration  2.40s
```

All tests pass without any modifications — the store's public API is completely backward compatible.

## Self-Check: PASSED

All created files verified present. Commit hash `4cb8bfdd7` verified in git log.

---

_Phase: 12-app-optimization-refactoring_
_Completed: 2026-02-16_
