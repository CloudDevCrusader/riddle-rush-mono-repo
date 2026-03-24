---
phase: 21
plan: "07"
subsystem: e2e-testing
tags: [e2e, playwright, scoring, multi-round, test-fix]
dependency_graph:
  requires: ['21-02', '21-03']
  provides: ['multi-round-scoring-e2e']
  affects: ['apps/game/tests/e2e/scoring-multi-round.spec.ts']
tech_stack:
  added: []
  patterns: ['data-testid selectors', 'Playwright helpers', 'multi-round game flow']
key_files:
  created: []
  modified:
    - apps/game/tests/e2e/scoring-multi-round.spec.ts
    - apps/game/pages/results/[[gameId]].vue
    - apps/game/tests/e2e/helpers/game-flow.ts
decisions:
  - "Renamed data-testid next-round → next-round-button to match plan spec and updated helpers consistently"
  - "Added per-player predicted-rank-{index} selectors replacing static projected-rank"
  - "Kept existing describe-based tests alongside new top-level test for backward compatibility"
metrics:
  duration: "15m"
  completed: "2025-01-31"
  tasks_completed: 4
  files_modified: 3
---

# Phase 21 Plan 07: Multi-Round Scoring E2E Workflow Test Summary

## One-liner
Rewrote multi-round scoring E2E test with `test('multi-round scoring workflow')` verifying 3-option post-round modal, per-player predicted ranks, and 2-round complete navigation flow.

## What Was Done

### Task 1: Post-round modal with 3 options
- Verified `results/[[gameId]].vue` already had all 3 buttons in the decision modal
- Added `data-testid="post-round-modal"` to the `<GameModal>` component wrapper
- Renamed `data-testid="next-round"` → `data-testid="next-round-button"` (plan requirement)

### Task 2: Predicted rank display
- Changed `data-testid="projected-rank"` (static, single) to `:data-testid="'predicted-rank-' + index"` (dynamic, per-player)
- Ranks show projected position based on `totalScore + pendingScores` before confirmation

### Task 3: Answer input feature flag
- `isAnswerInputEnabled` from `useFeatureFlags()` already conditionally controls `:show-answer` on `GamePlayerCard`
- Existing implementation functionally equivalent to `enableAnswerInputInResults`; no code change needed

### Task 4: Fix intermittent failures / write proper test
- Added top-level `test('multi-round scoring workflow', ...)` with complete 2-round flow
- Flow: setup → submit → navigate to results → assign scores → verify predicted ranks → confirm → verify 3 modal options → next round → repeat → finish → leaderboard
- Updated `game-flow.ts` helpers: `goToNextRound` and `confirmScoresAndWaitForModal` now use `next-round-button`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing data-testid] Added post-round-modal data-testid to GameModal**
- **Found during:** Task 1
- **Issue:** GameModal had no data-testid for test targeting
- **Fix:** Added `data-testid="post-round-modal"` attribute
- **Files modified:** `apps/game/pages/results/[[gameId]].vue`
- **Commit:** 55b9dd9a6

**2. [Rule 1 - Bug] game-flow.ts helpers used old data-testid**
- **Found during:** Task 4
- **Issue:** `goToNextRound` and `confirmScoresAndWaitForModal` used `data-testid="next-round"` which was renamed to `next-round-button`
- **Fix:** Updated both helper functions to use `data-testid="next-round-button"`
- **Files modified:** `apps/game/tests/e2e/helpers/game-flow.ts`
- **Commit:** 55b9dd9a6

## Commits

| Hash | Message |
|------|---------|
| `55b9dd9a6` | test(21-07): fix multi-round scoring E2E workflow test |

## Self-Check: PASSED

- `apps/game/tests/e2e/scoring-multi-round.spec.ts` contains `test('multi-round scoring workflow'` ✓
- `apps/game/pages/results/[[gameId]].vue` contains `data-testid="next-round-button"` ✓
- Playwright `--list` confirms 8 tests (4 per browser project) with correct names ✓
- Commit `55b9dd9a6` exists in git log ✓
