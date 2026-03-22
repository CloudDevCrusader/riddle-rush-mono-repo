---
phase: 18-enable-fortune-wheel-as-default-review-refactor-if-implementation-works-and-looks-good
plan: 03
subsystem: testing
tags: [playwright, e2e, helpers, data-testid, feature-flags, audit]

# Dependency graph
requires:
  - phase: 18-enable-fortune-wheel-as-default-review-refactor-if-implementation-works-and-looks-good
    provides: Shared game-flow helper foundation and high-priority spec migration from 18-02
provides:
  - Full migration of remaining game-flow E2E specs to shared helper architecture
  - Suite-wide removal of legacy game-flow CSS selector patterns and dialog-based player setup
  - Final audit proving zero duplicate game-flow helper definitions in spec files
affects: [18-05, e2e-reliability, test-maintenance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Shared helper-first game-flow tests across all 7 relevant specs'
    - 'Feature-flag-aware answer submission in workflow and results setup paths'
    - 'Audit-driven grep checks as E2E refactor completion gate'

key-files:
  created: []
  modified:
    - apps/game/tests/e2e/game-complete-flow.spec.ts
    - apps/game/tests/e2e/full-game-workflow.spec.ts
    - apps/game/tests/e2e/results.spec.ts
    - apps/game/tests/e2e/helpers/game-flow.ts

key-decisions:
  - 'Keep test-specific orchestration helpers local, but centralize all reusable game-flow actions in helpers/game-flow.ts'
  - 'Use helper-level input-visibility branching as the canonical feature-flag-safe answer submission strategy'

patterns-established:
  - 'Remaining game-flow specs now import ./helpers/game-flow directly'
  - 'Final suite audit uses explicit grep checks for forbidden helper/function/selector patterns'

# Metrics
duration: 4 min
completed: 2026-03-22
---

# Phase 18 Plan 03: Remaining E2E Game-Flow Refactor Summary

**All remaining gameplay E2E specs now run on shared game-flow helpers with zero duplicate local flow helpers and zero legacy fragile setup selectors.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-22T22:21:58Z
- **Completed:** 2026-03-22T22:25:35Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Refactored `game-complete-flow.spec.ts` to remove duplicated local flow helpers and consume shared `./helpers/game-flow` utilities.
- Refactored `full-game-workflow.spec.ts` and `results.spec.ts` to shared helpers, replacing legacy setup paths and dialog-driven multi-player setup.
- Completed final suite audit: no duplicate `hideDevtools`/`navigateToResults` definitions in spec files, no `.answer-input`/`.submit-answer-btn`/`.start-btn`/`.add-btn` selectors in spec files, and no `page.once('dialog'` usage.
- Verified `pnpm run workspace:check` and `pnpm run test` pass after refactor.

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor game-complete-flow.spec.ts to use shared helpers** - `f76b8bd45` (refactor)
2. **Task 2: Refactor full-game-workflow.spec.ts and results.spec.ts** - `0eada76ca` (refactor)
3. **Task 3: Final E2E suite audit and verification** - `e6f0eab5a` (refactor)

Additional deviation fix commit:

- `761e6d6f6` (fix) - reverted unrelated unit-test file churn introduced by pre-commit/lint-staged side effects

## Files Created/Modified

- `apps/game/tests/e2e/game-complete-flow.spec.ts` - Replaced local duplicated game-flow helpers with shared helper imports; retained only file-specific new-game modal helper.
- `apps/game/tests/e2e/full-game-workflow.spec.ts` - Migrated setup/round/result/decision helper usage to shared module; preserved test-specific leaderboard/menu assertions.
- `apps/game/tests/e2e/results.spec.ts` - Reworked setup to shared helper chain and removed legacy CSS-selector + dialog-based player-add flow.
- `apps/game/tests/e2e/helpers/game-flow.ts` - Hardened helper edge handling for non-positive/invalid player-count inputs during audit closure.

## Decisions Made

- Kept local helpers only when they are test-specific assertions or orchestration (e.g., leaderboard verification/menu return), and migrated reusable interaction helpers to `game-flow.ts`.
- Standardized answer-input behavior on feature-flag-aware checks in shared helper flow and updated manual fill steps to guard on input visibility.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pre-commit hook modified unrelated unit-test file and broke verification isolation**

- **Found during:** Task 1 and Task 3 verification/commit cycle
- **Issue:** `lint-staged`/formatting side effects repeatedly altered `apps/game/tests/unit/use-feature-flags.spec.ts`, creating unrelated diffs and a transient unit-test failure path.
- **Fix:** Reverted unrelated unit-test changes before subsequent task verification/commits and added explicit isolation checks prior to commits.
- **Files modified:** `apps/game/tests/unit/use-feature-flags.spec.ts` (reverted to baseline), commit stream only retained E2E task scope changes.
- **Verification:** Re-ran `pnpm run workspace:check` and `pnpm run test` after reset; both passed.
- **Committed in:** `761e6d6f6`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Isolation fix was necessary to preserve atomic task scope and keep final verification valid; no scope creep.

## Issues Encountered

- Pre-commit automation repeatedly touched an unrelated unit test file, requiring explicit resets to maintain per-task commit boundaries.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- E2E helper consolidation is now complete for all 7 targeted game-flow specs.
- Phase 18 is ready to continue with remaining contract/finalization work in 18-04 and dependent cleanup in 18-05.

---

_Phase: 18-enable-fortune-wheel-as-default-review-refactor-if-implementation-works-and-looks-good_
_Completed: 2026-03-22_

## Self-Check: PASSED
