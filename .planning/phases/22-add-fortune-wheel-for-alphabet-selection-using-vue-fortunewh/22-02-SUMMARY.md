---
phase: 22-add-fortune-wheel-for-alphabet-selection-using-vue-fortunewh
plan: 02
subsystem: ui
tags: [round-start, playwright, feature-flags, game-flow]
requires:
  - phase: 22-01
    provides: Typed wheel wrapper and selection adapter contract
provides:
  - Round-start wheel-first interaction flow with validated category resolution
  - Updated E2E helper flow for spin/confirm selectors and route-tolerant completion
affects: [22-03-PLAN, e2e-helpers, round-start-regression]
tech-stack:
  added: []
  patterns: [route-level-orchestration, helper-resilience, selector-based-e2e]
key-files:
  created: []
  modified:
    - apps/game/pages/round-start.vue
    - apps/game/components/game/FortuneAlphabetWheel.vue
    - apps/game/tests/e2e/helpers/game-flow.ts
    - apps/game/tests/e2e/round-start.spec.ts
    - apps/game/tests/e2e/translations-check.spec.ts
key-decisions:
  - 'Route-level controller owns start/navigation; wheel component remains emit-only.'
  - 'E2E helper now waits on user-visible states (wheel/loading/game) with bounded retries.'
patterns-established:
  - 'Wheel flow completion helper supports both round-start and already-at-game fast paths.'
  - 'Round-start fallback logic preserved via feature flag disabled branch.'
requirements-completed: [PAGE-04]
duration: 70m
completed: 2026-04-11
---

# Phase 22 Plan 02: Round-Start Integration Summary

**Round-start now starts rounds through explicit fortune-wheel spin/confirm interactions while preserving fallback and existing configured-round orchestration.**

## Performance

- **Duration:** 70 min
- **Started:** 2026-04-10T23:58:00Z
- **Completed:** 2026-04-11T01:20:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Replaced legacy flip-through UI in `round-start.vue` with `FortuneAlphabetWheel` integration.
- Enforced trusted category mapping before calling `startConfiguredRound(category, letter)`.
- Updated `completeFortuneWheel` helper to drive spin/confirm selectors with robust route-aware waits.
- Verified regression flow with round-start and scoring E2E specs plus typecheck.

## Task Commits

1. **Task 1: Integrate wheel path in round-start** - `ccf07d42a` (feat)
2. **Task 2: Align helpers/specs with wheel UX** - `02bcd0645` (test)

## Files Created/Modified

- `apps/game/pages/round-start.vue` - Wheel-first UI path + validated selection handoff.
- `apps/game/components/game/FortuneAlphabetWheel.vue` - Added spin fallback timer for event reliability.
- `apps/game/tests/e2e/helpers/game-flow.ts` - New wheel selector logic and bounded completion waits.
- `apps/game/tests/e2e/round-start.spec.ts` - Updated flow assertions and setup route handling.
- `apps/game/tests/e2e/translations-check.spec.ts` - Updated players->round-start progression with wheel completion.

## Decisions Made

- Preserve `useGameActions().startConfiguredRound` as the only route-level start orchestration API.
- Keep helper logic tolerant to direct `/game` transitions and loading-state short-circuits.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unstable wheel completion due to missing/misaligned third-party rotate end payloads**

- **Found during:** Task 2 E2E execution
- **Issue:** Confirm action stayed disabled intermittently because rotate-end payload did not always resolve a valid segment.
- **Fix:** Added pending-segment fallback + timer-based safety completion in `FortuneAlphabetWheel.vue`.
- **Files modified:** `apps/game/components/game/FortuneAlphabetWheel.vue`
- **Verification:** `pnpm --filter @riddle-rush/game test:e2e -- tests/e2e/round-start.spec.ts --project=chromium`
- **Committed in:** `ccf07d42a`

**2. [Rule 1 - Bug] Hardened E2E helper against transient button visibility/disabled races**

- **Found during:** Task 2 E2E execution
- **Issue:** Helper retries could fail when confirm button detached or remained temporarily disabled.
- **Fix:** Added visibility/disabled guards and non-fatal force-click retries in completion loop.
- **Files modified:** `apps/game/tests/e2e/helpers/game-flow.ts`
- **Verification:** `pnpm --filter @riddle-rush/game test:e2e -- tests/e2e/round-start.spec.ts tests/e2e/scoring-flow.spec.ts --project=chromium`
- **Committed in:** `02bcd0645`

## Issues Encountered

- Combined E2E suite contention increased flake probability; targeted commands remained stable.

## Auth Gates

None.

## Known Stubs

None.

## Next Phase Readiness

- E2E baseline for wheel flow is now stable enough for final verification/reporting.
- Remaining work is evidence packaging and final check alignment.

## Self-Check: PASSED

- Verified modified files exist and both plan task commits are present in git history.
