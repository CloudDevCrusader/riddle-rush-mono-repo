---
phase: 07-player-setup
plan: 01
subsystem: ui
tags: [nuxt, vue, scss, i18n, pinia]

# Dependency graph
requires:
  - phase: 05-structural-components
    provides: Page scaffolding components (GameBackground, GamePanel, GameHeader)
provides:
  - Player setup page with stepper-driven inputs and start flow wired to game store
affects: [07-player-setup, 08-core-gameplay]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Count-driven player form clamped to MAX_PLAYERS with reactive array sync
    - CSS-first panel styling using mockup-clamp spacing and embossed gold borders

key-files:
  created: []
  modified:
    - apps/game/pages/players.vue
    - apps/game/i18n/locales/en.json
    - apps/game/i18n/locales/de.json

key-decisions:
  - 'None - followed plan as specified'

patterns-established:
  - 'Stepper controls reuse design tokens with embossed gradients and centered count'
  - 'Player name placeholders localized per index for consistent defaults'

# Metrics
duration: 6 min
completed: 2026-02-01
---

# Phase 7 Plan 01: Player Setup Summary

**Player setup page rebuilt with localized stepper-driven inputs and gold-styled panel layout**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-01T05:57:00Z
- **Completed:** 2026-02-01T06:03:41Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Replaced image-based layout with GameBackground/GamePanel/GameHeader scaffold and reactive player count stepper clamped to MAX_PLAYERS.
- Synced player name inputs to the stepper, added localized placeholders with fallback names, and preserved start flow through pendingPlayerNames + goToRoundStart.
- Styled stepper, list rows, inputs, and START GAME button using design tokens, embossed gradients, and responsive mockup-clamp spacing; removed all coin/image UI.
- Ran `pnpm --filter @riddle-rush/game lint` to confirm lint passes after template/style changes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Rebuild players page structure and state** - `ba8a3b1` (feat)
2. **Task 2: Style players layout to match mockup** - `b8c3099` (style)

## Files Created/Modified

- `apps/game/pages/players.vue` - Rebuilt player setup UI with stepper, localized inputs, start flow, and mockup-aligned styling.
- `apps/game/i18n/locales/en.json` - Added player setup labels/placeholders/start text.
- `apps/game/i18n/locales/de.json` - Added German translations for player setup labels/placeholders/start text.

## Decisions Made

None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Ready for 07-02 verification of the rebuilt players page against mockup requirements.
- No blockers; lint and typecheck hooks passed during commits.
