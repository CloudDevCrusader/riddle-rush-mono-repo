---
phase: 12-app-optimization-refactoring
plan: 02
subsystem: testing
tags: [vitest, unit-tests, composables, auto-imports, vi-stubGlobal, reactive-mocks]

# Dependency graph
requires: [12-01]
provides:
  - 43 unit tests for useGameActions (18) and useGameState (25)
  - vi.stubGlobal pattern for Nuxt auto-imported composables in tests
  - Reactive mock store pattern for computed property testing
affects: [12-03, 12-04, 12-05, 12-06, 12-07, 12-08, 12-09, 12-10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - vi.stubGlobal for Nuxt auto-imported composables (useGameStore, useRouter, useToast, useAudio, useI18n)
    - vi.mock for explicitly imported modules (useLogger)
    - Vue reactive() for mock stores enabling computed reactivity in tests

key-files:
  created:
    - apps/game/tests/unit/composables/useGameActions.spec.ts
    - apps/game/tests/unit/composables/useGameState.spec.ts

key-decisions:
  - 'vi.stubGlobal over vi.mock for Nuxt auto-imports (source uses bare globals, not module paths)'
  - 'Vue reactive() for mock store state to enable proper computed() tracking in tests'
  - "vi.stubGlobal('computed', computed) to provide Vue computed as global in test context"

patterns-established:
  - "Nuxt auto-import testing: vi.stubGlobal('composableName', mockFn) for globals like useGameStore, useRouter"
  - "Explicitly imported modules still use vi.mock('~/path/to/module')"
  - 'Reactive mock stores: use reactive({}) for store mocks when testing composables that wrap computed()'

requirements-completed: []

# Metrics
duration: 5min
completed: 2026-02-16
---

# Phase 12 Plan 02: Composable Unit Tests Summary

**43 unit tests for useGameActions and useGameState with vi.stubGlobal pattern for Nuxt auto-imports**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-16T22:10:00Z
- **Completed:** 2026-02-16T22:17:00Z
- **Tasks:** 2 (Task 1 useAnswerCheck was pre-completed)
- **Files created:** 2

## Accomplishments

- Created useGameActions.spec.ts (382 lines, 18 tests) covering all 6 exported action functions
- Created useGameState.spec.ts (265 lines, 25 tests) covering all 10 computed properties and 2 store refs
- Established vi.stubGlobal pattern for Nuxt auto-imported composables (fixes ReferenceError with vi.mock)
- Verified all tests pass (43/43 green) across both files

## Task Commits

Each task was committed atomically:

1. **Task 2: Create useGameActions unit tests** - `f7827184a` (test)
2. **Task 3: Create useGameState unit tests** - `b9796f372` (test)

Note: Task 1 (useAnswerCheck.spec.ts) was completed in a prior session and is already committed.

## Files Created

- `apps/game/tests/unit/composables/useGameActions.spec.ts` (382 lines)
  - 18 tests across 7 describe blocks
  - Covers: startNewGame, resumeOrStartGame, endGame, shareScore, setupMultiplayerGame, startNextRound
  - Tests success/error paths, navigator.share availability, AbortError suppression, parameter forwarding
  - Uses vi.stubGlobal for useGameStore, useRouter, useToast, useAudio, useI18n
  - Uses vi.mock for useLogger (explicitly imported)

- `apps/game/tests/unit/composables/useGameState.spec.ts` (265 lines)
  - 25 tests across 5 describe blocks
  - Covers: store references, default values, data reflection, return shape, reactivity
  - Tests all 10 computed properties with both null/default and populated states
  - Uses Vue reactive() for mock stores enabling proper computed tracking
  - Validates exact return shape (12 properties: 2 stores + 10 computeds)

## Decisions Made

- **vi.stubGlobal over vi.mock**: Nuxt auto-imported composables (useGameStore, useRouter, etc.) are bare globals in source code, not imported from module paths. `vi.mock('~/stores/game')` fails with `ReferenceError: useGameStore is not defined`. `vi.stubGlobal('useGameStore', mockFn)` puts the mock on `globalThis` where the source code expects it.

- **useLogger is the exception**: It uses `import { useLogger } from './useLogger'` (explicit import), so it correctly uses `vi.mock('~/composables/useLogger')`.

- **Vue reactive() for mock stores**: Plain object mocks don't trigger Vue `computed()` re-evaluation. Using `reactive({})` for mock store state allows computed properties to properly track changes and re-evaluate on mutation.

- **vi.stubGlobal('computed', computed)**: The auto-import plugin transforms `computed` in source files, but when tests bypass the plugin pipeline, `computed` is undefined. Explicitly stubbing it as a global from Vue resolves this.

## Deviations from Plan

None — plan executed as written. The useAnswerCheck task (Task 1) was pre-completed in a prior session.

## Pre-existing Issues (Not Related to This Plan)

- **15 failing useStatistics tests**: Pre-existing failures in `useStatistics.spec.ts` (assertion mismatches). Not related to this plan.
- **24 failing useAudio tests**: Pre-existing failures in `useAudio.spec.ts` (useIndexedDB not defined). Not related to this plan.
- **vitest.config.ts LSP error**: Pre-existing vite v5/v7 version mismatch. Does not affect test execution.

## Issues Encountered

None — both test files pass on first verified run after applying the vi.stubGlobal and reactive() patterns.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Unit test coverage established for 3 critical composables (useAnswerCheck, useGameActions, useGameState)
- Testing patterns documented for Nuxt auto-import testing (vi.stubGlobal vs vi.mock)
- Ready for composable refactoring plans with regression test safety net

## Self-Check: PASSED

All 2 created files verified present. All 2 commit hashes verified in git log.

---

_Phase: 12-app-optimization-refactoring_
_Completed: 2026-02-16_
