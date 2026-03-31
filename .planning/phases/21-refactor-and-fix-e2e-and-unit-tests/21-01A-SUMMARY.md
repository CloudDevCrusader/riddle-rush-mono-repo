---
phase: 21-refactor-and-fix-e2e-and-unit-tests
plan: 01A
subsystem: testing
tags: [unit-tests, composables, vitest, session-management, persistence]
dependency_graph:
  requires: []
  provides: [unit-test-coverage-for-useSessionManager, unit-test-coverage-for-usePersistence]
  affects: [TEST-01-composable-coverage]
tech_stack:
  added: []
  patterns: [vi.mock, mockResolvedValueOnce, mockRejectedValueOnce, UUID-mocking]
key_files:
  created:
    - apps/game/tests/unit/composables/useSessionManager.spec.ts
    - apps/game/tests/unit/composables/usePersistence.spec.ts
  modified: []
decisions:
  - Mock generateUUID via vi.mock('~/utils/uuid') for deterministic session ID tests
  - Mock both useIndexedDB and useLogger via vi.mock() before importing usePersistence
  - loadSessionById always throws 'Failed to load game session' (not found triggers catch block)
metrics:
  duration: ~10 minutes
  completed: 2026-03-24
  tasks_completed: 2
  files_created: 2
---

# Phase 21 Plan 01A: Session Manager and Persistence Unit Tests Summary

**One-liner:** Unit tests for useSessionManager (23 tests, pure functions) and usePersistence (22 tests, mocked IndexedDB/Logger) composables.

## What Was Built

Added two new unit test files providing comprehensive coverage for the session management and persistence composables:

### useSessionManager.spec.ts (23 tests)

Tests all 5 pure functions exported from `useSessionManager`:

- **createSession**: 7 tests — structure, unique IDs, players/category/letter inclusion, gameName handling, startTime timestamp
- **createSinglePlayerSession**: 5 tests — required properties, userId, empty players, currentRound: 0, legacy score/attempts fields
- **cloneSessionForHistory**: 3 tests — equality check, deep copy isolation (mutation does not affect original), property preservation
- **isSessionActive**: 3 tests — active/null/non-active status
- **getSessionDuration**: 4 tests — null session returns 0, endTime calculation, Date.now() fallback, millisecond precision
- **return value**: 1 test — all 5 functions present

### usePersistence.spec.ts (22 tests)

Tests all 5 async functions exported from `usePersistence` with fully mocked dependencies:

- **loadSessionFromDB**: 4 tests — success path, null on error, error logging, resolves null (doesn't throw)
- **loadHistoryFromDB**: 4 tests — success path, null on error, error logging, resolves null (doesn't throw)
- **saveSessionToDB**: 4 tests — calls saveGameSession, doesn't throw, logs error, continues execution
- **saveHistoryToDB**: 4 tests — calls saveGameHistory, doesn't throw, logs error, continues execution
- **loadSessionById**: 5 tests — success path, throws when not found, throws on DB error, logs error (both paths)
- **return value**: 1 test — all 5 functions present

## Decisions Made

1. **UUID mocking approach**: Used `vi.mock('~/utils/uuid')` with `vi.mocked(generateUUID).mockReturnValue()` for deterministic ID assertions. The `~` alias resolves correctly per vitest.config.ts.

2. **loadSessionById error behavior**: The composable wraps the `throw new Error('Game session with ID ... not found')` in a try/catch, so the outer catch always re-throws as `'Failed to load game session'`. Tests assert this final message, not the inner one.

3. **useLogger mock scope**: The `mockLoggerError` function is defined outside `vi.mock()` factory and captured via closure, matching the patterns used by `use-logger.spec.ts` in the test suite.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

Both test suites run successfully:

```
✓ tests/unit/composables/useSessionManager.spec.ts (23 tests)
✓ tests/unit/composables/usePersistence.spec.ts (22 tests)
```

Total: 45 new tests added (vs. ~23 estimated in plan — exceeded by 22 tests due to thorough coverage).

## Self-Check: PASSED

- [x] `apps/game/tests/unit/composables/useSessionManager.spec.ts` exists
- [x] `apps/game/tests/unit/composables/usePersistence.spec.ts` exists
- [x] Commit `99fc5276c` exists (useSessionManager)
- [x] Commit `c1d691018` exists (usePersistence)
- [x] All tests pass (34 test files, 887 passed)
