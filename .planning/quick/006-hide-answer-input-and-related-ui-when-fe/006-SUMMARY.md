---
phase: quick-006
plan: 01
subsystem: ui
tags: [feature-flag, answer-display, results-page, conditional-rendering]

# Dependency graph
requires: []
provides:
  - Answer text conditionally displayed based on isAnswerInputEnabled feature flag
  - GamePlayerCard showAnswer prop for controlling answer visibility
affects: [any future results/scoring pages displaying player answers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Feature flag prop-drilling pattern: composable → page → component prop'

key-files:
  created: []
  modified:
    - apps/game/components/game/GamePlayerCard.vue
    - apps/game/pages/results.vue
    - apps/game/pages/results/[[gameId]].vue

key-decisions:
  - 'Add showAnswer prop to GamePlayerCard (default: true) rather than reading feature flag inside component — keeps component reusable'
  - 'Gate answer display only, not answer input field or submit button (answers remain optional)'

patterns-established:
  - 'showAnswer prop on GamePlayerCard for controlling answer text visibility from parent pages'

# Metrics
duration: 3min
completed: 2026-03-04
---

# Quick Task 006: Hide Answer Display When Feature Flag Disabled Summary

**Gate answer text display on both results pages with isAnswerInputEnabled feature flag via GamePlayerCard showAnswer prop, keeping answer input field and buttons visible**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-04T19:00:00Z
- **Completed:** 2026-03-04T19:03:00Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- Added `showAnswer` boolean prop to `GamePlayerCard.vue` (default: `true`) and gated the answer `div` with `v-if="showAnswer && player.currentRoundAnswer"`
- In `results/[[gameId]].vue`: imported `isAnswerInputEnabled` from `useFeatureFlags()` and passed `:show-answer="isAnswerInputEnabled"` to `<GamePlayerCard>`
- In legacy `results.vue`: imported `isAnswerInputEnabled` from `useFeatureFlags()` and added `v-if="isAnswerInputEnabled"` to the answer `<span>`
- Answer input field and submit button on game page remain unaffected

## Task Commits

Each task was committed atomically:

1. **Task 1: Gate answer display on both results pages** - `7cc79e5a2` (feat)

## Files Created/Modified

- `apps/game/components/game/GamePlayerCard.vue` - Added `showAnswer` prop (default: true), gated answer div
- `apps/game/pages/results/[[gameId]].vue` - Added `isAnswerInputEnabled` feature flag, passed as `show-answer` prop
- `apps/game/pages/results.vue` - Added `isAnswerInputEnabled` feature flag, gated answer span with `v-if`

## Decisions Made

- Used prop-drilling pattern (feature flag read in page, passed as prop to component) instead of reading feature flag directly inside GamePlayerCard — keeps the component reusable and testable
- Default `showAnswer: true` ensures no visual regression for existing behavior
- Only answer _display_ is hidden, not the answer input field or submit button (per user requirement)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - uses existing `NUXT_PUBLIC_FEATURE_ANSWER_INPUT` feature flag.

## Next Phase Readiness

- Any future results/scoring pages should use the `showAnswer` prop on `GamePlayerCard` to respect the feature flag
- The legacy `results.vue` page gates its own answer span directly since it doesn't use `GamePlayerCard`

---

_Quick Task: 006-hide-answer-input-and-related-ui-when-fe_
_Completed: 2026-03-04_

## Self-Check: PASSED
