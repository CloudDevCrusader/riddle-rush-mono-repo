---
phase: 21-refactor-and-fix-e2e-and-unit-tests
plan: 01A
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/game/tests/unit/composables/useSessionManager.spec.ts
  - apps/game/tests/unit/composables/usePersistence.spec.ts
autonomous: true
requirements:
  - TEST-01
user_setup: []

must_haves:
  truths:
    - useSessionManager unit tests verify session creation and lifecycle
    - usePersistence unit tests verify IndexedDB operations
    - All tests pass with deterministic inputs/outputs
  artifacts:
    - path: 'apps/game/tests/unit/composables/useSessionManager.spec.ts'
      provides: 'Unit tests for session management'
      contains: "describe('useSessionManager')"
    - path: 'apps/game/tests/unit/composables/usePersistence.spec.ts'
      provides: 'Unit tests for persistence layer'
      contains: "describe('usePersistence')"
  key_links:
    - from: 'useSessionManager.spec.ts'
      to: 'composables/useSessionManager.ts'
      via: 'import useSessionManager'
      pattern: 'from [''"]~/composables/useSessionManager[''"]'
    - from: 'usePersistence.spec.ts'
      to: 'composables/usePersistence.ts'
      via: 'import usePersistence'
      pattern: 'from [''"]~/composables/usePersistence[''"]'
---

<objective>
Add unit test coverage for 2 state management composables: useSessionManager and usePersistence. These handle game session creation, lifecycle management, and IndexedDB persistence.

Purpose: Achieve TEST-01 requirement (unit test coverage >75% for all composables) - Part 2 of 3
Output: 2 new unit test files with comprehensive coverage of session and persistence functions
</objective>

<execution_context>
@/Users/markuswagner/projects/riddle-rush-mono-repo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/markuswagner/projects/riddle-rush-mono-repo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/21-refactor-and-fix-e2e-and-unit-tests/21-CONTEXT.md
@.planning/phases/21-refactor-and-fix-e2e-and-unit-tests/21-RESEARCH.md

# Test infrastructure patterns from existing tests

@apps/game/tests/unit/composables/useGameState.spec.ts
@apps/game/tests/unit/use-indexeddb.spec.ts (for IndexedDB mocking)
@apps/game/tests/unit/use-logger.spec.ts (for logger mocking patterns)
</context>

<interfaces>
<!-- Composable exports that tests must verify -->

From composables/useSessionManager.ts:

```typescript
export function useSessionManager() {
  createSession(players, category, letter, gameName?): GameSession
  createSinglePlayerSession(category, letter): GameSession
  cloneSessionForHistory(session): GameSession
  isSessionActive(session): boolean
  getSessionDuration(session): number
}
```

From composables/usePersistence.ts:

```typescript
export function usePersistence() {
  loadSessionFromDB(): Promise<GameSession | null>
  loadHistoryFromDB(): Promise<GameSession[] | null>
  saveSessionToDB(session): Promise<void>
  saveHistoryToDB(history): Promise<void>
  loadSessionById(sessionId): Promise<GameSession>
}
```

</interfaces>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create unit tests for useSessionManager composable</name>
  <files>apps/game/tests/unit/composables/useSessionManager.spec.ts</files>
  <behavior>
    - Test 1: createSession returns GameSession with correct structure
    - Test 2: createSession generates unique session ID
    - Test 3: createSession includes players, category, letter
    - Test 4: createSinglePlayerSession returns session with userId
    - Test 5: createSinglePlayerSession has empty players array
    - Test 6: cloneSessionForHistory creates deep copy
    - Test 7: cloneSessionForHistory doesn't mutate original
    - Test 8: isSessionActive returns true for active session
    - Test 9: isSessionActive returns false for null or inactive session
    - Test 10: getSessionDuration calculates correct milliseconds
    - Test 11: getSessionDuration returns 0 for null session
  </behavior>
  <read_first>
    - apps/game/composables/useSessionManager.ts
    - apps/game/tests/unit/composables/useGameState.spec.ts (for testing patterns)
  </read_first>
  <action>
    Create apps/game/tests/unit/composables/useSessionManager.spec.ts with the following structure:

    1. Import describe, it, expect from 'vitest'
    2. Import useSessionManager from '~/composables/useSessionManager'
    3. Import GameSession, Category, Player types from '@riddle-rush/types/game'
    4. Mock generateUUID or import from utils/uuid

    Test the following pure functions (all stateless):

    a) createSession - Verifies:
       - Returns object with required GameSession properties
       - Has unique id property (UUID format)
       - Includes provided players array
       - Includes category with letter property merged
       - Has currentRound: 1, currentPlayerIndex: 0
       - Has startTime as number (timestamp)
       - Has status: 'active'
       - Includes optional gameName when provided

    b) createSinglePlayerSession - Verifies:
       - Returns object with required GameSession properties
       - Has userId: 'default-user'
       - Has empty players array
       - Has currentRound: 0 (single-player)
       - Has score: 0 (single-player legacy)
       - Has attempts: [] (single-player legacy)

    c) cloneSessionForHistory - Verifies:
       - Returns object identical to input
       - Creates deep copy (mutations don't affect original)
       - Preserves all properties including nested structures

    d) isSessionActive - Verifies:
       - Returns true when session exists and status is 'active'
       - Returns false when session is null
       - Returns false when session.status is not 'active'

    e) getSessionDuration - Verifies:
       - Returns difference between endTime and startTime
       - Uses Date.now() when endTime is undefined
       - Returns 0 when session is null
       - Returns correct duration in milliseconds

  </action>
  <verify>
    <automated>cd apps/game && pnpm run test:unit -- composables/useSessionManager</automated>
  </verify>
  <done>
    - useSessionManager.spec.ts exists with 11+ test cases
    - All pure functions tested with deterministic inputs/outputs
    - Deep cloning and session lifecycle behaviors verified
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Create unit tests for usePersistence composable</name>
  <files>apps/game/tests/unit/composables/usePersistence.spec.ts</files>
  <behavior>
    - Test 1: loadSessionFromDB returns session when IndexedDB succeeds
    - Test 2: loadSessionFromDB returns null on error
    - Test 3: loadSessionFromDB logs error on failure
    - Test 4: loadHistoryFromDB returns history when IndexedDB succeeds
    - Test 5: loadHistoryFromDB returns null on error
    - Test 6: saveSessionToDB calls IndexedDB save
    - Test 7: saveSessionToDB doesn't throw on error
    - Test 8: saveSessionToDB logs error on failure
    - Test 9: saveHistoryToDB calls IndexedDB save
    - Test 10: saveHistoryToDB doesn't throw on error
    - Test 11: loadSessionById returns session when found
    - Test 12: loadSessionById throws when session not found
  </behavior>
  <read_first>
    - apps/game/composables/usePersistence.ts
    - apps/game/tests/unit/use-indexeddb.spec.ts (for IndexedDB mocking patterns)
    - apps/game/tests/unit/use-logger.spec.ts (for logger mocking patterns)
  </read_first>
  <action>
    Create apps/game/tests/unit/composables/usePersistence.spec.ts with the following structure:

    1. Import describe, it, expect, vi, beforeEach, afterEach from 'vitest'
    2. Import usePersistence from '~/composables/usePersistence'
    3. Import GameSession type from '@riddle-rush/types/game'
    4. Import 'fake-indexeddb/auto' for IndexedDB mocking

    Test the following async functions:

    a) loadSessionFromDB - Verifies:
       - Calls useIndexedDB().getGameSession()
       - Returns session when IndexedDB succeeds
       - Returns null when IndexedDB throws error
       - Logs error when load fails (mock useLogger)

    b) loadHistoryFromDB - Verifies:
       - Calls useIndexedDB().getGameHistory()
       - Returns history array when IndexedDB succeeds
       - Returns null when IndexedDB throws error
       - Logs error when load fails (mock useLogger)

    c) saveSessionToDB - Verifies:
       - Calls useIndexedDB().saveGameSession(session)
       - Does not throw when IndexedDB throws error
       - Logs error when save fails (mock useLogger)
       - Continues execution even on error

    d) saveHistoryToDB - Verifies:
       - Calls useIndexedDB().saveGameHistory(history)
       - Does not throw when IndexedDB throws error
       - Logs error when save fails (mock useLogger)
       - Continues execution even on error

    e) loadSessionById - Verifies:
       - Calls useIndexedDB().getGameSessionById(sessionId)
       - Returns session when found in IndexedDB
       - Throws error with message when session not found
       - Throws error when IndexedDB lookup fails
       - Logs error when load fails (mock useLogger)

    Use vi.mock() for useIndexedDB and useLogger to verify calls without hitting actual DB

  </action>
  <verify>
    <automated>cd apps/game && pnpm run test:unit -- composables/usePersistence</automated>
  </verify>
  <done>
    - usePersistence.spec.ts exists with 12+ test cases
    - All async persistence functions tested with mocked dependencies
    - Error handling and logging behaviors verified
  </done>
</task>

</tasks>

<verification>
1. Run all new unit tests: `cd apps/game && pnpm run test:unit -- composables/useSessionManager composables/usePersistence`
2. Verify total test count increases by ~23 tests (11 + 12)
3. Check that all tests pass with no failures
</verification>

<success_criteria>

- 2 new unit test files created in composables/ directory
- SessionManager and Persistence composables have comprehensive test coverage
- All unit tests pass with 100% success rate
- Partial progress toward TEST-01: composable test coverage >75%
  </success_criteria>

<output>
After completion, create `.planning/phases/21-refactor-and-fix-e2e-and-unit-tests/21-01A-SUMMARY.md`
</output>
