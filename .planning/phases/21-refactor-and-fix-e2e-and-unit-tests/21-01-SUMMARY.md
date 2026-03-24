---
phase: 21-refactor-and-fix-e2e-and-unit-tests
plan: "01"
subsystem: testing
tags: [unit-tests, composables, vitest, coverage]
dependency_graph:
  requires: []
  provides: [unit-test-coverage-composables]
  affects: [test-coverage-metrics]
tech_stack:
  added: []
  patterns: [pure-function-testing, vi-mock-module, factory-helpers]
key_files:
  created:
    - apps/game/tests/unit/composables/useCategoryManager.spec.ts
    - apps/game/tests/unit/composables/usePlayerManager.spec.ts
    - apps/game/tests/unit/composables/useScoringEngine.spec.ts
  modified: []
decisions:
  - Mock `useLodashSync` with deterministic reverse-shuffle to keep `getRandomCategory` tests predictable
  - Mock `generateUUID` with counter-based IDs to verify uniqueness without crypto dependency
  - Test pure/stateless functions only — skip `fetchCategories` (async, $fetch dependency)
metrics:
  duration: "~10 minutes"
  completed: "2025-01-25"
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 0
---

# Phase 21 Plan 01: Unit Tests for Core Composables Summary

**One-liner:** Added 85 deterministic unit tests for `useCategoryManager`, `usePlayerManager`, and `useScoringEngine` pure functions — all passing with zero failures.

## What Was Built

Three unit test files covering the three stateless composables extracted from the game store in a prior refactor:

| Test File | Tests | Functions Covered |
|-----------|-------|-------------------|
| `useCategoryManager.spec.ts` | 19 | `loadMoreCategories`, `resetDisplayedCategories`, `getCategoryById`, `getRandomCategory`, `getCategoryEmoji` |
| `usePlayerManager.spec.ts` | 40 | `createPlayers`, `findPlayerIndex`, `getPlayerById`, `submitPlayerAnswer`, `assignPlayerScore`, `updatePlayerAvatar`, `resetPlayerSubmissions`, `resetPlayerRoundState`, `buildLeaderboard`, `getCurrentPlayerTurn`, `advancePlayerIndex`, `allPlayersSubmitted` |
| `useScoringEngine.spec.ts` | 26 | `calculateAttemptScore`, `getRankSuffix`, `getScoreDisplay`, `determineWinners` |

**Total: 85 new tests — all passing**

## Decisions Made

1. **Deterministic shuffle mock** — `useLodashSync` was mocked to reverse the array instead of random shuffle. This makes `getRandomCategory` tests fully deterministic without losing coverage value.

2. **UUID counter mock** — `generateUUID` from `~/utils/uuid` was mocked with a counter (`test-uuid-${n}`) to verify IDs are unique across players while avoiding crypto dependency.

3. **Skipped `fetchCategories`** — This function uses `$fetch` (Nuxt global), has loading guards with `setTimeout`, and async behavior. It was intentionally excluded per plan guidance to test pure functions only. The existing `useAnswerCheck.spec.ts` already covers `$fetch`-based patterns.

4. **Factory helpers** — Both `createPlayer()` and `createCategory()` helpers defined locally in each test file for readable test setup without shared fixture complexity.

## Test Coverage Details

### useCategoryManager (19 tests)
- `loadMoreCategories`: increments by step, caps at array length, no-ops when at cap
- `resetDisplayedCategories`: resets to count, respects array length ceiling, defaults to 9
- `getCategoryById`: returns match, returns null for missing/empty
- `getRandomCategory`: returns item from array, returns null for empty, single-item case
- `getCategoryEmoji`: maps known names, returns `🎯` for null/undefined/unknown

### usePlayerManager (40 tests)
- `createPlayers`: structure, unique IDs, default names, zeroed scores
- `findPlayerIndex`: correct index, -1 for missing/empty
- `getPlayerById`: returns match, null for missing/empty
- `submitPlayerAnswer`: sets answer + hasSubmitted, mutates in place
- `assignPlayerScore`: delta calculation, idempotency, overwrites correctly
- `updatePlayerAvatar`: sets URL, overwrites
- `resetPlayerSubmissions`: clears hasSubmitted/answer/roundScore for all, handles empty
- `resetPlayerRoundState`: same as above, preserves totalScore
- `buildLeaderboard`: sort descending, 1-based rank, isWinner logic, empty array
- `getCurrentPlayerTurn`: index access, out-of-bounds → null, empty → null
- `advancePlayerIndex`: returns +1, no wrap
- `allPlayersSubmitted`: all true, empty false, any false

### useScoringEngine (26 tests)
- `calculateAttemptScore`: true → 10, false → 0
- `getRankSuffix`: 1st/2nd/3rd/4th, 11th/12th/13th special cases, 21st-24th
- `getScoreDisplay`: +N, -N, 0 formatting
- `determineWinners`: single winner, ties, empty, all-zero, all-negative

## Deviations from Plan

None — plan executed exactly as written. All tasks completed in sequence as TDD (write test → verify pass → commit).

## Self-Check

### Files Exist
- [x] `apps/game/tests/unit/composables/useCategoryManager.spec.ts`
- [x] `apps/game/tests/unit/composables/usePlayerManager.spec.ts`
- [x] `apps/game/tests/unit/composables/useScoringEngine.spec.ts`

### Commits Exist
- [x] `fbe1cf359` — test(21-01): add unit tests for useCategoryManager
- [x] `860afd5b8` — test(21-01): add unit tests for usePlayerManager
- [x] `d51379a97` — test(21-01): add unit tests for useScoringEngine

## Self-Check: PASSED
