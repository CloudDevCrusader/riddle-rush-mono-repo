---
phase: quick-260331-vtk
plan: 01
subsystem: game-flow
tags: [bugfix, round-start, fortune-wheel, ux]
dependency_graph:
  requires: []
  provides: [working-round-start-redirect, inline-wheel-results]
  affects: [apps/game/pages/round-start.vue]
tech_stack:
  added: []
  patterns: [inline-results-on-spin-complete, delegated-store-method]
key_files:
  created: []
  modified:
    - apps/game/pages/round-start.vue
decisions:
  - Replaced duplicated session/round logic in startGame() with single advanceToConfiguredRound() call
  - Inline results appear below each wheel instead of a separate full-screen results phase
  - Wheels remain visible until navigation starts (startingGame flag) instead of hiding on wheelsComplete
metrics:
  duration: 4min
  completed: '2026-03-31T21:06:34Z'
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
---

# Quick Task 260331-vtk: Fix Round-Start Redirect and Inline Results

Fixed broken round-start redirect by replacing non-existent startConfiguredRound with advanceToConfiguredRound, and improved UX by showing wheel results inline as each wheel completes.

## Changes Made

### Task 1: Fix redirect -- replace startConfiguredRound with advanceToConfiguredRound

- **Problem:** `startGame()` called `gameStore.startConfiguredRound()` which does not exist, causing a silent error that broke navigation and made the spinner disappear
- **Fix:** Replaced the entire 60-line `startGame()` function with a simplified version that delegates to `gameStore.advanceToConfiguredRound()` -- the method that already handles all session/player/round logic
- **Commit:** `80bfccd41`

### Task 2: Show results inline under each wheel as it completes

- **Problem:** After both wheels finished spinning, results were shown in a separate full-screen display phase, requiring an extra transition step
- **Fix:** Added inline result labels directly below each wheel that appear via `result-pop` transition as soon as each wheel's `spin-complete` event fires
- Category wheel shows icon + translated name; letter wheel shows the selected letter
- Removed the entire `<!-- Selected Values Display Phase -->` template section and all its CSS (`.results-display`, `.result-item`, `.result-label`, `.result-value`, `.result-icon`, `.result-text`, `.result-letter`, `.divider`, `.results-fade-*`, `.animate-scale-in`, `@keyframes scaleIn`)
- Changed wheels container visibility from `!wheelsComplete` to `!startingGame` so wheels stay visible with inline results until navigation begins
- Simplified `checkBothComplete()` to remove nested setTimeout (no more WHEEL_FADE_DELAY_MS wait)
- Removed unused `WHEEL_FADE_DELAY_MS` import
- **Commit:** `6d07d69b7`

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None.

## Commits

| #   | Hash      | Message                                                                                  |
| --- | --------- | ---------------------------------------------------------------------------------------- |
| 1   | 80bfccd41 | fix(260331-vtk): replace non-existent startConfiguredRound with advanceToConfiguredRound |
| 2   | 6d07d69b7 | feat(260331-vtk): show wheel results inline and remove separate results display          |

## Verification Results

1. `advanceToConfiguredRound` present in round-start.vue -- PASS
2. `startConfiguredRound` absent from round-start.vue -- PASS
3. `inline-result` elements present in round-start.vue -- PASS
4. `results-display` absent from round-start.vue -- PASS
5. `pnpm run workspace:check` (syncpack + typecheck + eslint) -- PASS

## Self-Check: PASSED

- apps/game/pages/round-start.vue: FOUND
- 260331-vtk-SUMMARY.md: FOUND
- Commit 80bfccd41: FOUND
- Commit 6d07d69b7: FOUND
