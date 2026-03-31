---
phase: 21-refactor-and-fix-e2e-and-unit-tests
plan: '03'
subsystem: frontend
tags: [e2e, data-testid, accessibility, testing]
dependency_graph:
  requires: []
  provides: [stable-data-testid-selectors]
  affects:
    [
      tests/e2e/credits.spec.ts,
      tests/e2e/language.spec.ts,
      tests/e2e/results.spec.ts,
      tests/e2e/offline.spec.ts,
    ]
tech_stack:
  added: []
  patterns: [data-testid naming convention, stable selector strategy]
key_files:
  created: []
  modified:
    - apps/game/pages/credits.vue
    - apps/game/pages/language.vue
    - apps/game/pages/results/[[gameId]].vue
    - apps/game/app.vue
    - apps/game/pages/index.vue
decisions:
  - Updated index.vue data-testid values from menu-* to main-menu-* for consistent naming; E2E refactoring in 21-02 depends on main-menu-* selectors
  - Added ConnectionStatus component to app.vue template so offline-indicator can be targeted by E2E tests; component already existed but was not rendered in app root
metrics:
  duration: '~10 minutes'
  completed: '2025-01-31'
  tasks: 5
  files: 5
---

# Phase 21 Plan 03: Add data-testid Attributes to Page Components Summary

**One-liner:** Added 56 total data-testid attributes across 5 page/component files using consistent `{page}-{element}` naming convention to enable stable E2E test selectors.

## Tasks Completed

| Task | Name                                      | Status  | Commit  |
| ---- | ----------------------------------------- | ------- | ------- |
| 1    | Add data-testid to credits.vue            | ✅ Done | e5ca99c |
| 2    | Add data-testid to language.vue           | ✅ Done | e5ca99c |
| 3    | Add data-testid to results/[[gameId]].vue | ✅ Done | e5ca99c |
| 4    | Add offline-indicator to app.vue          | ✅ Done | e5ca99c |
| 5    | Add main-menu-\* data-testid to index.vue | ✅ Done | e5ca99c |

## Changes Summary

### credits.vue (15 data-testid attributes)

- `credits-page` — main page container
- `credits-header` — GameHeader component
- `credits-back-button` — back navigation button
- `credits-panel` — GamePanel content panel
- `credits-section-0/1/2` — three credit sections (Game Design, Programming, Art)
- `credits-section-heading-0/1/2` — section headings
- `credits-name-0/1/2/3` — individual credit names (Tobi, Sophia, Markus, Sarmad Ali)
- `credits-ok-button` — OK/back navigation button

### language.vue (10 data-testid attributes)

- `language-page` — main page container
- `language-back-button` — back navigation button
- `language-card` — GamePanel selection panel
- `language-option-english` / `language-option-german` — language selection buttons
- `language-flag-en` / `language-flag-de` — flag containers
- `language-checkmark-en` / `language-checkmark-de` — checkbox/checkmark elements
- `language-ok-button` — confirm selection button

### results/[[gameId]].vue (15 data-testid attributes)

Preserved all 11 existing attributes; added 4 new:

- `results-header` — page header (GameHeader)
- `results-score-controls-{index}` — per-player score controls container
- `results-score-display-{index}` — per-player score value display
- `player-leaderboard` — PlayerLeaderboard overlay component

### app.vue (1 data-testid attribute)

- Added `<ConnectionStatus data-testid="offline-indicator" />` to main-content template
- ConnectionStatus was already built but not included in app root template
- Enables offline.spec.ts to find the offline status indicator

### index.vue (6 data-testid attributes)

Updated from `menu-*` naming to `main-menu-*` naming for consistency:

- `main-menu-play` (was `menu-start-button`)
- `main-menu-menu` (was `menu-menu-button`)
- `main-menu-options` (was `menu-settings-button`)
- `main-menu-credits` (was `menu-credits-button`)
- `main-menu-language` (was `menu-language-button`)
- `main-menu-settings` (was `menu-panel-settings-button`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] Added ConnectionStatus to app.vue template**

- **Found during:** Task 4
- **Issue:** app.vue tracked offline state via event listeners but never rendered the ConnectionStatus component in the template — no element existed for E2E tests to find
- **Fix:** Added `<ConnectionStatus data-testid="offline-indicator" />` inside the `main-content` div
- **Files modified:** `apps/game/app.vue`
- **Commit:** e5ca99c

**2. [Rule 1 - Naming consistency] Updated index.vue data-testid from menu-_ to main-menu-_**

- **Found during:** Task 5
- **Issue:** Existing data-testids used `menu-*` prefix but plan and E2E tests require `main-menu-*` prefix. An element can only have one data-testid attribute, so could not add alongside existing.
- **Fix:** Replaced `menu-start-button`, `menu-menu-button`, `menu-settings-button`, `menu-credits-button`, `menu-language-button`, `menu-panel-settings-button` with corresponding `main-menu-*` names
- **Files modified:** `apps/game/pages/index.vue`
- **Commit:** e5ca99c

## Known Stubs

None — all data-testid attributes target real rendered elements.

## Self-Check: PASSED

- ✅ `apps/game/pages/credits.vue` exists with 15 data-testid attributes
- ✅ `apps/game/pages/language.vue` exists with 10 data-testid attributes
- ✅ `apps/game/pages/results/[[gameId]].vue` exists with 15 data-testid attributes
- ✅ `apps/game/app.vue` contains `data-testid="offline-indicator"`
- ✅ `apps/game/pages/index.vue` contains 6 `data-testid="main-menu-*"` attributes
- ✅ Commit e5ca99c exists
