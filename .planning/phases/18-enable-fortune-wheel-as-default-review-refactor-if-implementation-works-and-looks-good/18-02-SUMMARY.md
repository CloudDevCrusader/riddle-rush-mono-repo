---
phase: 18-enable-fortune-wheel-as-default-review-refactor-if-implementation-works-and-looks-good
plan: 02
subsystem: testing
tags: [playwright, e2e, helpers, data-testid, zustand, feature-flags]

# Dependency graph
requires:
  - phase: 18-enable-fortune-wheel-as-default-review-refactor-if-implementation-works-and-looks-good
    provides: Fortune-wheel default behavior and feature-flag precedence contract from 18-01
provides:
  - Shared E2E game-flow helper module with 10 reusable functions
  - Refactored high-priority scoring/leaderboard specs using centralized helpers
  - Feature-flag-aware answer submission behavior in E2E flows
affects: [18-03, e2e-reliability, test-maintenance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Centralized Playwright game-flow helpers under tests/e2e/helpers'
    - 'Feature-flag-aware input handling via visibility checks before fill'
    - 'Data-testid-first selector strategy for resilient E2E tests'

key-files:
  created:
    - apps/game/tests/e2e/helpers/game-flow.ts
  modified:
    - apps/game/tests/e2e/helpers/index.ts
    - apps/game/tests/e2e/scoring-flow.spec.ts
    - apps/game/tests/e2e/scoring-ui.spec.ts
    - apps/game/tests/e2e/scoring-multi-round.spec.ts
    - apps/game/tests/e2e/leaderboard.spec.ts

key-decisions:
  - 'Refactor only HIGH-priority scoring/leaderboard specs in this plan and defer remaining specs to 18-03'
  - 'Use submitPlayerAnswers() as the canonical feature-flag-aware submission path'

patterns-established:
  - 'E2E setup flow: start game -> submit player answers -> navigateToResults helper chain'
  - 'Decision modal flow helper chain: confirmScoresAndWaitForModal -> goToNextRound|finishGame'

# Metrics
duration: 1 min
completed: 2026-03-22
---

# Phase 18 Plan 02: Shared E2E Game Flow Helpers Summary

**Shared Playwright game-flow helpers now drive high-priority scoring and leaderboard specs with feature-flag-aware answer submission and stable selector usage.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-22T22:12:06Z
- **Completed:** 2026-03-22T22:13:57Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added `apps/game/tests/e2e/helpers/game-flow.ts` with 10 exported helpers (`hideDevtools`, `submitPlayerAnswers`, `navigateToResults`, `assignScores`, `confirmScoresAndWaitForModal`, `goToNextRound`, `finishGame`, `setupMultiplayerGame`, `startGameWithDefaults`, `startGameAndGoToResults`).
- Updated helper barrel exports in `helpers/index.ts` so specs can import shared flows consistently.
- Refactored high-priority specs (`scoring-flow`, `scoring-ui`, `scoring-multi-round`, `leaderboard`) to use shared helpers and remove local setup/navigation duplication.
- Verified repository checks pass via `pnpm run workspace:check`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared E2E game-flow helpers module** - `2fead49e0` (feat)
2. **Task 2: Refactor HIGH priority E2E specs to use shared helpers** - `8cb89baec` (refactor)

## Files Created/Modified

- `apps/game/tests/e2e/helpers/game-flow.ts` - Shared cross-spec game setup, turn submission, result navigation, scoring, and round-decision helpers.
- `apps/game/tests/e2e/helpers/index.ts` - Re-exported all new game-flow helpers from the E2E helper barrel.
- `apps/game/tests/e2e/scoring-flow.spec.ts` - Removed local duplicated helpers and switched to shared `startGameAndGoToResults`.
- `apps/game/tests/e2e/scoring-ui.spec.ts` - Replaced legacy setup path with shared helper-driven setup.
- `apps/game/tests/e2e/scoring-multi-round.spec.ts` - Migrated setup/submission/results/modal flows to shared helpers and data-testid-driven paths.
- `apps/game/tests/e2e/leaderboard.spec.ts` - Replaced manual setup/submit/results/finish sequence with shared helper chain.

## Decisions Made

- Kept this plan focused on high-priority scoring/leaderboard specs and helper extraction only; remaining suite migration stays in follow-up plan 18-03.
- Standardized feature-flag-aware answer handling in `submitPlayerAnswers()` so tests no longer assume answer input visibility.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Hardened helper URL and turn-transition assumptions for single-player and route variants**

- **Found during:** Task 2 (spec refactor + helper validation)
- **Issue:** Initial helper draft required `/game/` and `/results/` path variants and always assumed turn-name presence; this could fail on route forms without trailing segments and single-player runs.
- **Fix:** Relaxed URL assertions to `/game/` and `/results/` regex-compatible forms and guarded turn-name transition logic when no turn-name element exists.
- **Files modified:** `apps/game/tests/e2e/helpers/game-flow.ts`
- **Verification:** `pnpm run workspace:check` and TypeScript checks pass.
- **Committed in:** `8cb89baec`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Deviation was required to make shared helpers robust across route and player-count variants; no scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- High-priority E2E scoring/leaderboard specs now share a single helper foundation.
- Remaining E2E specs can be migrated in 18-03 with lower duplication risk and consistent feature-flag behavior.

---

_Phase: 18-enable-fortune-wheel-as-default-review-refactor-if-implementation-works-and-looks-good_
_Completed: 2026-03-22_

## Self-Check: PASSED
