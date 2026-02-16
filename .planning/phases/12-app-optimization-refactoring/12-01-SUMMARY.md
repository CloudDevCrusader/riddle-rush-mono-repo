---
phase: 12-app-optimization-refactoring
plan: 01
subsystem: testing
tags: [playwright, e2e, data-testid, resilience, selectors]

# Dependency graph
requires: []
provides:
  - 41 data-testid attributes across 6 game pages
  - Resilient E2E test suite using data-testid selectors exclusively
  - Reusable test helper functions for multiplayer game setup
affects: [12-02, 12-03, 12-04, 12-05, 12-06, 12-07, 12-08, 12-09, 12-10]

# Tech tracking
tech-stack:
  added: []
  patterns: [data-testid naming convention {page}-{element}-{type}]

key-files:
  modified:
    - apps/game/pages/index.vue
    - apps/game/pages/players.vue
    - apps/game/pages/round-start.vue
    - apps/game/pages/game/[[gameId]].vue
    - apps/game/pages/results/[[gameId]].vue
    - apps/game/pages/leaderboard.vue
    - apps/game/tests/e2e/game-complete-flow.spec.ts
    - apps/game/tests/e2e/players.spec.ts
    - apps/game/tests/e2e/leaderboard.spec.ts

key-decisions:
  - "data-testid naming convention: {page}-{element}-{type} for consistency"
  - "Dynamic testids with template literals for indexed elements (e.g., players-name-input-${index})"
  - "Reusable helper functions in test files for common flows (navigateToGameWithDefaults, setupMultiplayerGame, etc.)"

patterns-established:
  - "data-testid naming: {page}-{element}-{type} (e.g., menu-start-button, game-answer-input)"
  - "Dynamic data-testid via v-bind for indexed elements: :data-testid=\"`prefix-${index}`\""
  - "E2E test helpers for multi-step game flows to reduce test duplication"

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-02-16
---

# Phase 12 Plan 01: E2E Test Resilience Summary

**41 data-testid attributes added across 6 pages with E2E tests fully converted to resilient selectors**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-16T20:16:20Z
- **Completed:** 2026-02-16T20:20:35Z
- **Tasks:** 7
- **Files modified:** 9

## Accomplishments

- Added data-testid attributes to all interactive elements across all 6 game pages (41 total)
- Converted all 3 target E2E test files to use data-testid selectors exclusively (132 references)
- Eliminated all CSS class-based and text-based selectors from test files
- Created reusable test helper functions reducing test code from 1019 lines to 459 lines
- Tests now resilient to i18n text changes and component refactoring

## Task Commits

Each task was committed atomically:

1. **Task 1: Add data-testid to main menu page** - `d7fc92c` (feat)
2. **Task 2: Add data-testid to players page** - `58b7c3d` (feat)
3. **Task 3: Add data-testid to round-start page** - `8e63867` (feat)
4. **Task 4: Add data-testid to game page** - `3198b6a` (feat)
5. **Task 5: Add data-testid to results page** - `678515f` (feat)
6. **Task 6: Add data-testid to leaderboard page** - `1ed6a34` (feat)
7. **Task 7: Update E2E tests to use data-testid selectors** - `2ee80fd` (test)

## Files Created/Modified

- `apps/game/pages/index.vue` - 6 data-testid attributes on menu buttons
- `apps/game/pages/players.vue` - 5 data-testid attributes on stepper, inputs, and start button
- `apps/game/pages/round-start.vue` - 6 data-testid attributes on wheel, results, and loading
- `apps/game/pages/game/[[gameId]].vue` - 11 data-testid attributes on all game controls and info displays
- `apps/game/pages/results/[[gameId]].vue` - 7 data-testid attributes on scores, controls, and modals
- `apps/game/pages/leaderboard.vue` - 6 data-testid attributes on entries and action buttons
- `apps/game/tests/e2e/game-complete-flow.spec.ts` - Full rewrite with data-testid selectors and helper functions
- `apps/game/tests/e2e/players.spec.ts` - Converted all selectors to data-testid
- `apps/game/tests/e2e/leaderboard.spec.ts` - Converted all selectors to data-testid

## Decisions Made

- Used `{page}-{element}-{type}` naming convention for data-testid attributes (e.g., `menu-start-button`, `game-answer-input`)
- Dynamic testids for indexed elements use template literals (e.g., `:data-testid="\`players-name-input-${index}\`"`)
- Extracted reusable helper functions in game-complete-flow.spec.ts for common multi-step flows

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused import in leaderboard.spec.ts**

- **Found during:** Task 7 (E2E test update)
- **Issue:** `generatePlayerName` was imported but not used, causing ESLint error and commit failure
- **Fix:** Removed unused import
- **Files modified:** apps/game/tests/e2e/leaderboard.spec.ts
- **Verification:** ESLint passes, commit succeeds
- **Committed in:** 2ee80fd (Task 7 commit)

**2. [Rule 2 - Missing Critical] Added data-testid to player turn name span**

- **Found during:** Task 7 (E2E test update)
- **Issue:** `.turn-name` CSS class selector was still used in tests; no data-testid on the span
- **Fix:** Added `data-testid="game-player-name"` to turn name span, updated test selectors
- **Files modified:** apps/game/pages/game/[[gameId]].vue, apps/game/tests/e2e/game-complete-flow.spec.ts
- **Verification:** No CSS class selectors remain in target test files
- **Committed in:** 2ee80fd (Task 7 commit)

**3. [Rule 2 - Missing Critical] Replaced .menu-page class selector in players.spec.ts**

- **Found during:** Task 7 (E2E test update)
- **Issue:** `waitForSelector('.menu-page')` used CSS class instead of data-testid
- **Fix:** Changed to `waitForSelector('[data-testid="menu-start-button"]')`
- **Files modified:** apps/game/tests/e2e/players.spec.ts
- **Verification:** No CSS class selectors remain in target test files
- **Committed in:** 2ee80fd (Task 7 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 missing critical)
**Impact on plan:** All auto-fixes necessary for correctness and test resilience. No scope creep.

## Issues Encountered

None - all tasks executed smoothly. Pre-commit ESLint caught the unused import which was fixed inline.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- E2E regression safety net established with 100% data-testid coverage
- Ready for component refactoring (Plan 02+) with confidence that tests will catch regressions
- Test helper functions can be reused in future E2E tests

## Self-Check: PASSED

All 9 files verified present. All 7 commit hashes verified in git log.

---

_Phase: 12-app-optimization-refactoring_
_Completed: 2026-02-16_
