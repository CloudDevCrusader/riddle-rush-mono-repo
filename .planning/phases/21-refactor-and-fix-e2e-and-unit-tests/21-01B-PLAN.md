---
phase: 21-refactor-and-fix-e2e-and-unit-tests
plan: 01B
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/game/tests/unit/composables/useGameLifecycle.spec.ts
  - apps/game/tests/unit/composables/useAnalytics.spec.ts
autonomous: true
requirements:
  - TEST-01
user_setup: []

must_haves:
  truths:
    - useGameLifecycle unit tests verify game lifecycle operations
    - useAnalytics unit tests verify tracking behavior
    - All tests pass with deterministic inputs/outputs
  artifacts:
    - path: 'apps/game/tests/unit/composables/useGameLifecycle.spec.ts'
      provides: 'Unit tests for game lifecycle'
      contains: "describe('useGameLifecycle')"
    - path: 'apps/game/tests/unit/composables/useAnalytics.spec.ts'
      provides: 'Unit tests for analytics'
      contains: "describe('useAnalytics')"
  key_links:
    - from: 'useGameLifecycle.spec.ts'
      to: 'composables/useGameLifecycle.ts'
      via: 'import useGameLifecycle'
      pattern: 'from [''"]~/composables/useGameLifecycle[''"]'
    - from: 'useAnalytics.spec.ts'
      to: 'composables/useAnalytics.ts'
      via: 'import useAnalytics'
      pattern: 'from [''"]~/composables/useAnalytics[''"]'
---

<objective>
Add unit test coverage for 2 lifecycle composables: useGameLifecycle and useAnalytics. These handle game round lifecycle operations and Google Analytics event tracking.

Purpose: Achieve TEST-01 requirement (unit test coverage >75% for all composables) - Part 3 of 3
Output: 2 new unit test files with comprehensive coverage of lifecycle and analytics functions
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
@apps/game/tests/unit/composables/useIndexedDB.spec.ts (for async test patterns)
@apps/game/tests/unit/use-logger.spec.ts (for logger mocking patterns)
@apps/game/tests/unit/composables/use-feature-flags.spec.ts (for config mocking patterns)
</context>

<interfaces>
<!-- Composable exports that tests must verify -->

From composables/useGameLifecycle.ts:

```typescript
export function useGameLifecycle() {
  createAttempt(term, found): GameAttempt
  buildRoundResult(session): object
  updateStatisticsForSession(session): Promise<void>
}
```

From composables/useAnalytics.ts:

```typescript
export const useAnalytics = () => {
  isEnabled: ComputedRef<boolean>
  trackEvent(eventName, params?): void
  trackPageView(pagePath, pageTitle?): void
  trackGameEvent: {
    start(category?): void
    answerCorrect(category, itemName): void
    answerIncorrect(category, itemName): void
    gameComplete(category, score, duration): void
    categorySelect(category): void
    skipItem(category, itemName): void
  }
}
```

</interfaces>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create unit tests for useGameLifecycle composable</name>
  <files>apps/game/tests/unit/composables/useGameLifecycle.spec.ts</files>
  <behavior>
    - Test 1: createAttempt returns GameAttempt with correct structure
    - Test 2: createAttempt includes timestamp
    - Test 3: createAttempt stores term and found properties
    - Test 4: buildRoundResult returns object with roundNumber
    - Test 5: buildRoundResult includes category and letter
    - Test 6: buildRoundResult includes playerResults array
    - Test 7: buildRoundResult playerResults have correct structure
    - Test 8: updateStatisticsForSession calls useStatistics
    - Test 9: updateStatisticsForSession logs error on failure
  </behavior>
  <read_first>
    - apps/game/composables/useGameLifecycle.ts
    - apps/game/tests/unit/use-indexeddb.spec.ts (for async test patterns)
    - apps/game/tests/unit/use-logger.spec.ts (for logger mocking patterns)
  </read_first>
  <action>
    Create apps/game/tests/unit/composables/useGameLifecycle.spec.ts with the following structure:

    1. Import describe, it, expect, vi from 'vitest'
    2. Import useGameLifecycle from '~/composables/useGameLifecycle'
    3. Import GameAttempt, GameSession, Player types from '@riddle-rush/types/game'

    Test the following functions:

    a) createAttempt - Verifies:
       - Returns object with required GameAttempt properties
       - Has term property matching input
       - Has found property matching input
       - Has timestamp property as number (Date.now() format)
       - Timestamp is reasonable (close to current time)

    b) buildRoundResult - Verifies:
       - Returns object with roundNumber from session
       - Includes category.name from session
       - Includes letter from session
       - Has timestamp property
       - Has playerResults array matching session.players
       - Each player result has playerId, playerName, answer, score

    c) updateStatisticsForSession - Verifies:
       - Calls useStatistics().updateStatistics(session)
       - Logs error via useLogger when updateStatistics throws
       - Does not throw error (catches and logs only)
       - Mock useStatistics to verify call without hitting actual DB

  </action>
  <verify>
    <automated>cd apps/game && pnpm run test:unit -- composables/useGameLifecycle</automated>
  </verify>
  <done>
    - useGameLifecycle.spec.ts exists with 9+ test cases
    - Attempt creation and round result building verified
    - Statistics update integration tested with mocks
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Create unit tests for useAnalytics composable</name>
  <files>apps/game/tests/unit/composables/useAnalytics.spec.ts</files>
  <behavior>
    - Test 1: isEnabled returns true in production with gtagId
    - Test 2: isEnabled returns false in non-production
    - Test 3: isEnabled returns false without gtagId
    - Test 4: trackEvent calls gtag when enabled
    - Test 5: trackEvent doesn't call gtag when disabled
    - Test 6: trackPageView calls gtag with page_view event
    - Test 7: trackGameEvent.start calls trackEvent
    - Test 8: trackGameEvent.answerCorrect calls trackEvent
    - Test 9: trackGameEvent.gameComplete calls trackEvent
    - Test 10: trackGameEvent.categorySelect calls trackEvent
  </behavior>
  <read_first>
    - apps/game/composables/useAnalytics.ts
    - apps/game/tests/unit/composables/use-feature-flags.spec.ts (for config mocking patterns)
  </read_first>
  <action>
    Create apps/game/tests/unit/composables/useAnalytics.spec.ts with the following structure:

    1. Import describe, it, expect, vi, beforeEach from 'vitest'
    2. Import useAnalytics from '~/composables/useAnalytics'

    Test the following behavior (requires mocking Nuxt composables):

    a) isEnabled - Verifies:
       - Returns false when config.public.environment is not 'production'
       - Returns false when config.public.gtagId is falsy
       - Returns true when environment is production AND gtagId exists

    b) trackEvent - Verifies:
       - Calls gtag('event', eventName, params) when enabled
       - Does nothing when import.meta.client is false (SSR)
       - Does nothing when isEnabled.value is false
       - Passes eventName and params correctly

    c) trackPageView - Verifies:
       - Calls gtag('event', 'page_view', { page_path, page_title }) when enabled
       - Does nothing when disabled or SSR

    d) trackGameEvent.start - Verifies:
       - Calls trackEvent('game_start', { category }) when enabled

    e) trackGameEvent.answerCorrect - Verifies:
       - Calls trackEvent('answer_correct', { category, item_name }) when enabled

    f) trackGameEvent.answerIncorrect - Verifies:
       - Calls trackEvent('answer_incorrect', { category, item_name }) when enabled

    g) trackGameEvent.gameComplete - Verifies:
       - Calls trackEvent('game_complete', { category, score, duration_seconds }) when enabled

    h) trackGameEvent.categorySelect - Verifies:
       - Calls trackEvent('category_select', { category }) when enabled

    i) trackGameEvent.skipItem - Verifies:
       - Calls trackEvent('skip_item', { category, item_name }) when enabled

    Use vi.mock() or vi.stubGlobal to mock useNuxtApp, useRuntimeConfig, import.meta

  </action>
  <verify>
    <automated>cd apps/game && pnpm run test:unit -- composables/useAnalytics</automated>
  </verify>
  <done>
    - useAnalytics.spec.ts exists with 10+ test cases
    - All tracking functions tested with mocked Nuxt context
    - Production/non-production behavior differences verified
  </done>
</task>

</tasks>

<verification>
1. Run all new unit tests: `cd apps/game && pnpm run test:unit -- composables/useGameLifecycle composables/useAnalytics`
2. Verify total test count increases by ~19 tests (9 + 10)
3. Check that all tests pass with no failures
4. Run all composable unit tests: `cd apps/game && pnpm run test:unit -- composables`
5. Verify final test count is >75% coverage for all composables
</verification>

<success_criteria>

- 2 new unit test files created in composables/ directory
- GameLifecycle and Analytics composables have comprehensive test coverage
- All unit tests pass with 100% success rate
- TEST-01 achieved: composable test coverage >75%
  </success_criteria>

<output>
After completion, create `.planning/phases/21-refactor-and-fix-e2e-and-unit-tests/21-01B-SUMMARY.md`
</output>
