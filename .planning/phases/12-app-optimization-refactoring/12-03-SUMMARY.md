---
phase: 12-app-optimization-refactoring
plan: 03
subsystem: testing
tags: [vitest, unit-tests, composables, fake-indexeddb, web-audio-api, vi-stubGlobal]

# Dependency graph
requires: [12-01]
provides:
  - 119 unit tests for useAudio (25), useIndexedDB (55), useStatistics (39)
  - Web Audio API mocking patterns with AudioParam methods
  - fake-indexeddb test isolation pattern (fresh IDBFactory per test)
  - vi.stubGlobal pattern for useIndexedDB as Nuxt auto-import
affects: [12-06, 12-07, 12-08, 12-09, 12-10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - fake-indexeddb with fresh IDBFactory per test to prevent data leaks
    - Web Audio API mock with AudioParam methods (setValueAtTime, exponentialRampToValueAtTime)
    - vi.stubGlobal for useIndexedDB (Nuxt auto-import global)
    - vi.resetModules with helper-based stub reinstallation

key-files:
  created:
    - apps/game/tests/unit/composables/useAudio.spec.ts
    - apps/game/tests/unit/composables/useIndexedDB.spec.ts
    - apps/game/tests/unit/composables/useStatistics.spec.ts

key-decisions:
  - 'vi.stubGlobal for useIndexedDB — called as bare global in useAudio.ts line 216'
  - 'Fresh IDBFactory per test — vi.resetModules does not reset fake-indexeddb data'
  - 'AudioParam mock objects — playClick/playError use setValueAtTime and exponentialRampToValueAtTime'
  - 'Helper functions for stub installation — vi.restoreAllMocks in afterEach removes stubGlobal stubs'

patterns-established:
  - 'Web Audio API testing: mock AudioContext with full AudioParam-like frequency objects'
  - 'IndexedDB isolation: globalThis.indexedDB = new IDBFactory() in beforeEach'
  - 'Stub reinstallation: extract stub setup into helper functions callable from beforeEach'

requirements-completed: []

# Metrics
duration: 20min
completed: 2026-02-16
---

# Phase 12 Plan 03: Critical Composable Unit Tests Summary

**119 unit tests for useAudio, useIndexedDB, and useStatistics composables**

## Performance

- **Duration:** 20 min
- **Started:** 2026-02-16T22:17:00Z
- **Completed:** 2026-02-16T22:37:00Z
- **Tasks:** 3
- **Files created:** 3

## Accomplishments

- Created useAudio.spec.ts (25 tests) covering Web Audio API, sound playback, error handling, webkit fallback
- Created useIndexedDB.spec.ts (55 tests) covering CRUD operations, migrations, error recovery, concurrent access
- Created useStatistics.spec.ts (39 tests) covering statistics tracking, calculations, persistence integration
- Established fake-indexeddb isolation pattern preventing data leaks between tests
- Established Web Audio API mocking pattern with full AudioParam method support

## Task Commits

All 3 test files committed atomically:

1. **Tasks 1-3: useAudio, useIndexedDB, useStatistics tests** - `9db8b761d` (test)

## Files Created

- `apps/game/tests/unit/composables/useAudio.spec.ts` (487 lines)
  - 25 tests across 5 describe blocks
  - Covers: AudioContext initialization, playClick, playError, webkit fallback, reuse, error handling
  - Mocks Web Audio API with full AudioParam objects (setValueAtTime, exponentialRampToValueAtTime)
  - Uses vi.stubGlobal for AudioContext and useIndexedDB

- `apps/game/tests/unit/composables/useIndexedDB.spec.ts` (838 lines)
  - 55 tests across 7 describe blocks
  - Covers: initialization, save/get/delete operations, getAll, clear, error handling, concurrent access
  - Uses fake-indexeddb with fresh IDBFactory per test for complete isolation
  - Tests database schema creation, version upgrades, transaction behavior

- `apps/game/tests/unit/composables/useStatistics.spec.ts` (641 lines)
  - 39 tests across 6 describe blocks
  - Covers: initialization, statistics calculations, game history tracking, leaderboard, edge cases
  - Tests aggregation logic with various dataset sizes
  - Verifies correct handling of empty/null/corrupt data

## Decisions Made

- **vi.stubGlobal for useIndexedDB**: `useAudio.ts` calls `useIndexedDB()` on line 216 without any import statement (Nuxt auto-import). Must use `vi.stubGlobal('useIndexedDB', ...)` not `vi.mock`.

- **Fresh IDBFactory per test**: `vi.resetModules()` resets JS module singletons but NOT the underlying fake-indexeddb data. Fix: `globalThis.indexedDB = new IDBFactory()` in beforeEach.

- **AudioParam mock objects**: `playClick` and `playError` use `oscillator.frequency.setValueAtTime()` and `exponentialRampToValueAtTime()`, not just `frequency.value =`. Mock oscillators need full AudioParam-like frequency objects.

- **Helper-based stub reinstallation**: `vi.restoreAllMocks()` in afterEach removes vi.stubGlobal stubs. Extracted stub installation into helper functions called in beforeEach.

## Deviations from Plan

- **ESLint fix required**: Initial commit attempt failed due to `@ts-expect-error` directive needing description >=10 chars (rule: `@typescript-eslint/ban-ts-comment`). Fixed by adding descriptive text.

## Issues Encountered

- Pre-commit hook rejected first commit attempt due to ESLint `@typescript-eslint/ban-ts-comment` rule requiring descriptions of at least 10 characters on `@ts-expect-error` directives. Resolved by adding descriptive comment text.

## User Setup Required

None.

## Next Phase Readiness

- Complete unit test coverage for 6 critical composables (useAnswerCheck, useGameActions, useGameState, useAudio, useIndexedDB, useStatistics)
- 162 total composable tests providing regression safety net for store refactoring (plans 12-06 through 12-08)
- Testing patterns documented for Web Audio API, IndexedDB, and Nuxt auto-import mocking

## Self-Check: PASSED

All 3 created files verified present. Commit hash verified in git log. All 119 tests pass.

---

_Phase: 12-app-optimization-refactoring_
_Completed: 2026-02-16_
