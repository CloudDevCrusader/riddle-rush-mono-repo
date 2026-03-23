# Phase 21: Refactor and Fix E2E and Unit Tests - Validation

## Phase Overview

Phase 21 addresses accumulated technical debt in the test suite across multiple recent phases. This phase completes unimplemented test plans, refactors E2E tests to use stable selectors, adds missing integration tests, and achieves 100% E2E test pass rate.

## Success Criteria

Per ROADMAP.md, the following must be TRUE after phase 21 completion:

1. **[TEST-01]** All Phase 12 unimplemented unit test plans are complete (12-02, 12-03, 12-06, 12-07, 12-08)
2. **[TEST-02]** Integration tests cover WebSocket and IndexedDB flows
3. **[TEST-03]** E2E test suite passes with 100% success rate (no intermittent failures)
4. **[TEST-04]** Multi-round scoring workflow test passes (modal 3 options, predicted rank, answer input feature flag)
5. **[TEST-05]** Game mode refactored to single source of truth with documented state flow chart
6. **[ADDITIONAL]** All remaining E2E specs use shared helpers from tests/e2e/helpers/game-flow.ts
7. **[ADDITIONAL]** Zero CSS class selectors remain in E2E tests (all data-testid based)
8. **[ADDITIONAL]** All unit tests pass and workspace:check succeeds

## Plan Structure

### Wave 1 (Foundation - Parallel)

| Plan   | Objective                                                    | Dependencies | Tasks | Files             |
| ------ | ------------------------------------------------------------ | ------------ | ----- | ----------------- |
| 21-01  | Unit tests for CategoryManager, PlayerManager, ScoringEngine | None         | 3     | composables tests |
| 21-01A | Unit tests for SessionManager, Persistence                   | None         | 2     | composables tests |
| 21-01B | Unit tests for GameLifecycle, Analytics                      | None         | 2     | composables tests |
| 21-02  | Refactor E2E specs to data-testid                            | None         | 5     | E2E test files    |
| 21-03  | Add missing data-testid attributes                           | None         | 5     | Page components   |

### Wave 2 (Integration & Expansion - Parallel)

| Plan  | Objective                                      | Dependencies | Tasks | Files             |
| ----- | ---------------------------------------------- | ------------ | ----- | ----------------- |
| 21-04 | Mobile E2E tests for critical flows            | 02, 03       | 5     | Mobile E2E file   |
| 21-05 | NativeScript mobile app unit/integration tests | None         | 4     | Mobile test files |
| 21-06 | Integration tests for WebSocket and IndexedDB  | 01, 01A, 01B | 2     | Integration tests |

### Wave 3 (Fix & Documentation - Parallel)

| Plan  | Objective                                 | Dependencies | Tasks | Files        |
| ----- | ----------------------------------------- | ------------ | ----- | ------------ |
| 21-07 | Fix multi-round scoring workflow E2E test | 01-09        | 4     | E2E + pages  |
| 21-08 | Game mode refactor and state flow chart   | None         | 3     | Store + docs |

### Wave 4 (Final Verification - Sequential)

| Plan  | Objective                 | Dependencies | Tasks | Files               |
| ----- | ------------------------- | ------------ | ----- | ------------------- |
| 21-09 | Verify 100% E2E pass rate | All previous | 4     | Verification report |

## Verification Checklist

### Before Phase Execution

- [ ] STATE.md read and decisions honored
- [ ] All plans reviewed for completeness
- [ ] Dependencies validated (no circular deps)
- [ ] Waves computed correctly (maximize parallelism)
- [ ] Roadmap success criteria mapped to plans

### After Plan 01, 01A, 01B (Unit Tests)

- [ ] 7 unit test files created (useCategoryManager, usePlayerManager, useScoringEngine, useSessionManager, usePersistence, useGameLifecycle, useAnalytics)
- [ ] All unit tests pass: `cd apps/game && pnpm run test:unit`
- [ ] Composable coverage >75%
- [ ] Workspace check passes: `pnpm run workspace:check`

### After Plan 02, 03 (E2E Refactor)

- [ ] All CSS selectors replaced with data-testid in 5 test files
- [ ] All interactive elements have data-testid in 5 page files
- [ ] E2E tests pass: `cd apps/game && pnpm run test:e2e`

### After Plan 04 (Mobile E2E)

- [ ] Mobile E2E tests created: `test -f apps/game/tests/e2e/mobile-game-flow.spec.ts`
- [ ] Responsive layout tests pass for Pixel 5 and iPad Pro 11
- [ ] Touch interaction tests pass

### After Plan 05 (Mobile Tests)

- [ ] Mobile test directories created: `test -d apps/mobile/tests/unit && test -d apps/mobile/tests/integration`
- [ ] Mobile tests pass: `cd apps/mobile && npm run test`

### After Plan 06 (Integration Tests)

- [ ] WebSocket integration tests created and pass
- [ ] IndexedDB integration tests created and pass
- [ ] All integration tests pass

### After Plan 07 (Multi-round Fix)

- [ ] Post-round modal has 3 options verified
- [ ] Predicted rank display verified
- [ ] Answer input feature flag behavior tested
- [ ] Multi-round scoring test passes consistently

### After Plan 08 (Game Mode Refactor)

- [ ] State flow chart document created: `test -f .planning/phases/21-*/21-GAME-MODE-FLOW.md`
- [ ] Single source of truth established
- [ ] No duplicate game mode state definitions

### After Plan 09 (E2E Verification)

- [ ] E2E suite run 3 times
- [ ] 100% pass rate achieved
- [ ] Verification report created
- [ ] No intermittent failures

## Exit Criteria

Phase 21 is COMPLETE when:

1. **[ ]** All 9 plans (01, 01A, 01B, 02, 03, 04, 05, 06, 07, 08, 09) have SUMMARIES created
2. **[ ]** All unit tests pass with 100% success rate
3. **[ ]** All E2E tests pass with 100% success rate
4. **[ ]** Integration tests for WebSocket and IndexedDB exist and pass
5. **[ ]** Multi-round scoring workflow E2E test passes consistently
6. **[ ]** Game mode state flow chart documented
7. **[ ]** Zero CSS class selectors remain in E2E tests
8. **[ ]** workspace:check passes with no errors
9. **[ ]** ROADMAP Success Criteria 1-5 all achieved

## Blocked Issues

None (as of planning phase).

## Risks and Mitigations

| Risk                                             | Impact | Mitigation                                                |
| ------------------------------------------------ | ------ | --------------------------------------------------------- |
| E2E tests have intermittent failures             | HIGH   | Run tests 3 times to verify consistency, add proper waits |
| Mobile E2E tests may not have required helpers   | MEDIUM | Plan includes helper creation as first task               |
| Integration tests may require WebSocket server   | LOW    | Use fake/mock implementations for testing                 |
| Game mode refactoring may affect many components | HIGH   | Document carefully, create migration guide                |
