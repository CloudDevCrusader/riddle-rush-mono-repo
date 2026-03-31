# Phase 21: Refactor and Fix E2E and Unit Tests - Context

## Overview

This phase addresses accumulated technical debt in the test suite across multiple recent phases. Despite phases 12, 18, 19, and 20 touching test infrastructure, several critical test-related tasks remain unimplemented:

1. **Phase 12 Incomplete Plans** (marked as complete but actually unimplemented):
   - Unit tests for composables (12-02, 12-03, 12-06, 12-07, 12-08)
   - Integration tests covering WebSocket and IndexedDB flows
   - E2E test suite with 100% success rate (intermittent failures exist)

2. **Phase 18 Incomplete E2E Refactor**:
   - Plan 18-03: Refactor remaining E2E specs to use shared helpers (not completed)
   - Some E2E specs still use fragile CSS class selectors instead of data-testid

3. **STATE.md Pending Test-Related Todos**:
   - Test and fix full game workflow with multi-round scoring (modal 3 options, predicted rank, answer input feature flag)
   - Refactor game mode to single source of truth with documented state flow chart

## Current Test Suite State

**Unit Tests:**

- Phase 19 completed Zustand migration for unit tests
- All 734 unit tests passing, 7 skipped, 0 failures
- However, critical gaps remain from Phase 12 unimplemented plans

**E2E Tests:**

- Phase 18-02 created shared game-flow helpers (10 functions)
- Phase 18-02 refactored 4 high-priority specs (scoring-flow, scoring-ui, scoring-multi-round, leaderboard)
- Plan 18-03 (refactor remaining specs) not completed
- Some specs still use CSS class selectors (`.answer-input`, `.submit-answer-btn`, etc.)
- Multi-round scoring workflow not fully tested end-to-end
- Intermittent failures due to timing/race conditions

**Test Coverage Gaps:**

- Missing unit tests for key composables (useCategoryManager, useSessionManager, usePlayerManager, useScoringEngine)
- Missing integration tests for WebSocket and IndexedDB flows
- Missing E2E test for complete multi-round scoring workflow
- Inconsistent test infrastructure (some use shared helpers, some don't)

**Mobile Testing State:**

**Mobile E2E Tests:**

- Playwright config has mobile device profiles (Pixel 5, iPad Pro 11) with @mobile and @tablet tags
- Mobile timeouts configured (15-20s for action, 60-90s for test timeout)
- No actual mobile E2E test specs exist (infrastructure ready, tests missing)
- Responsive design not tested across different viewports
- Touch interactions not tested (swipe, pinch, tap)

**Native Mobile Tests:**

- No test files found in apps/mobile/
- NativeScript Vue app has zero unit or integration test coverage
- Mobile-specific features (native components, camera, file system) untested

**PWA Mobile Features:**

- PWA install prompt exists but no test for install flow
- Offline mode implemented but no E2E test verifies it works on mobile
- App shortcuts not tested
- Mobile-specific PWA behaviors (splash screen, theme color) untested

## Phase Goals

This phase aims to:

1. Complete all unimplemented Phase 12 unit test plans
2. Create integration tests for WebSocket and IndexedDB flows
3. Refactor all remaining E2E specs to use shared helpers and data-testid selectors
4. Fix multi-round scoring workflow E2E test
5. **CRITICAL**: Ensure E2E tests cover the COMPLETE game workflow including:
   - Playing multiple rounds in a single game session
   - Creating a NEW game after completing/ending a previous game
   - Full user journey from menu → players → game (multiple rounds) → results → new game creation
6. Achieve 100% E2E test pass rate with no intermittent failures
7. Document game mode state flow chart as single source of truth

## Mobile Enhancement Goals

This phase also aims to improve mobile testing and experience:

1. Add comprehensive mobile E2E tests covering responsive design and touch interactions
2. Create unit and integration tests for the NativeScript Vue mobile app (apps/mobile/)
3. Add PWA mobile feature tests (install prompt, offline mode, app shortcuts)
4. Fix mobile responsive design issues discovered during testing
5. Ensure all critical game flows work on mobile viewports (Pixel 5, iPad Pro 11)

## Success Criteria

After this phase, the following must be TRUE:

**Test Infrastructure:**

1. All Phase 12 unimplemented unit test plans are complete and passing
2. Integration tests exist for WebSocket and IndexedDB flows
3. **CRITICAL**: E2E test suite covers COMPLETE game workflow:
   - Tests verify playing multiple rounds in a single session
   - Tests verify creating a NEW game after completing a previous game
   - Full user journey: menu → players → game (multiple rounds) → results → new game creation
4. E2E test suite passes with 100% success rate
5. Multi-round scoring workflow E2E test passes consistently
6. Game mode state flow chart documented and referenced by tests
7. Zero CSS class selectors remain in E2E tests (all data-testid based)
8. All E2E specs use shared helpers from tests/e2e/helpers/game-flow.ts
9. Unit test coverage >75% for all composables

**Mobile Testing:** 9. Mobile E2E tests cover COMPLETE game workflow on mobile (menu, players, game with multiple rounds, results, new game creation) 10. Touch interactions tested (swipe gestures, tap, pinch-to-zoom if applicable) 11. Responsive design validated across Pixel 5 (mobile) and iPad Pro 11 (tablet) viewports 12. Native mobile app has unit tests for core components and utilities 13. Native mobile app has integration tests for key workflows 14. PWA install flow tested end-to-end on mobile 15. PWA offline mode verified to work on mobile 16. All mobile responsive design issues identified and fixed
