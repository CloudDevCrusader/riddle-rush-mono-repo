---
phase: 15-visual-polish-animations-bug-fixes
plan: 01
subsystem: ui
tags: [css, design-system, scss, vue, nuxt, gamebackground, utility-class]

# Dependency graph
requires:
  - phase: 05-structural-components
    provides: GameBackground wrapper component
  - phase: 02-design-utilities
    provides: design-system.scss with global @keyframes and utility classes
provides:
  - round-start.vue uses GameBackground instead of BACKGROUND.png
  - .game-back-btn utility class with --red variant in design-system.scss
  - Back-button CSS deduplicated across game and settings pages
affects: [15-visual-polish-animations-bug-fixes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - '.game-back-btn utility class with CSS custom properties for size/color/border/shadow customization'
    - '--red modifier variant pattern for utility class color overrides'

key-files:
  created: []
  modified:
    - apps/game/pages/round-start.vue
    - apps/game/assets/scss/design-system.scss
    - apps/game/pages/settings.vue
    - apps/game/pages/game/[[gameId]].vue

key-decisions:
  - 'Task 1 was a verified NO-OP: SplashScreen.vue, SettingsModal.vue, and round-start.vue reference global keyframe names but do NOT define scoped duplicates'
  - 'Back buttons had different visual designs (orange vs red, arrow text vs back.png image) — utility class uses CSS custom properties for variant support'
  - 'Created --red modifier variant for game page back button to preserve its distinct red styling'

patterns-established:
  - '.game-back-btn utility class: circular back button with configurable --back-btn-size, --back-btn-bg, --back-btn-border, --back-btn-shadow-color'
  - 'CSS modifier pattern: .game-back-btn--red for color variants'

requirements-completed: [POLISH-04, POLISH-01]

# Metrics
duration: 15min
completed: 2026-03-23
---

# Phase 15 Plan 01: CSS Deduplication & GameBackground Migration Summary

**Migrated round-start.vue to GameBackground wrapper and extracted .game-back-btn utility class with --red variant into design-system.scss**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-23
- **Completed:** 2026-03-23
- **Tasks:** 3 (Task 1 was a verified no-op)
- **Files modified:** 4

## Accomplishments

- Verified that SplashScreen.vue, SettingsModal.vue, and round-start.vue do NOT have duplicate scoped @keyframes — they reference global animation names from design-system.scss (Task 1 no-op)
- Migrated round-start.vue from `<NuxtImg>` BACKGROUND.png to `<GameBackground>` wrapper component, removed `.page-bg` CSS rule
- Extracted `.game-back-btn` utility class into design-system.scss with CSS custom properties for customization and a `--red` modifier variant
- Replaced duplicate back-button CSS in game/[[gameId]].vue and settings.vue with the shared utility class

## Task Commits

All Phase 15 changes are currently uncommitted (pending batch commit after all plans complete):

1. **Task 1: Remove duplicate scoped @keyframes** - NO-OP (verified duplicates don't exist)
2. **Task 2: Migrate round-start.vue to GameBackground** - round-start.vue updated
3. **Task 3: Extract .game-back-btn utility class** - design-system.scss, settings.vue, game/[[gameId]].vue updated

## Files Created/Modified

- `apps/game/pages/round-start.vue` - Wrapped in `<GameBackground>`, removed BACKGROUND.png NuxtImg and `.page-bg` CSS
- `apps/game/assets/scss/design-system.scss` - Added `.game-back-btn` utility class with `--back-btn-size`, `--back-btn-bg`, `--back-btn-border`, `--back-btn-shadow-color` custom properties and `--red` modifier variant
- `apps/game/pages/settings.vue` - Back button now uses `game-back-btn` class, removed duplicate scoped CSS
- `apps/game/pages/game/[[gameId]].vue` - Back button now uses `game-back-btn game-back-btn--red`, removed duplicate scoped CSS

## Decisions Made

- **Task 1 no-op:** After auditing all three target files, confirmed that scoped `@keyframes` duplicating design-system.scss globals do not exist. The components use animation names (e.g., `fadeIn`, `scaleIn`) that resolve to the global definitions. No changes needed.
- **Utility class design:** Used CSS custom properties (`--back-btn-size`, `--back-btn-bg`, etc.) to allow per-page customization while sharing structural styles. The settings page uses the default orange style; the game page uses the `--red` variant.
- **Preserved visual identity:** The two back buttons had genuinely different visual designs (orange circular with arrow character vs red circular with back.png image), so a single-color utility class would have been insufficient.

## Deviations from Plan

### Auto-fixed Issues

**1. [Plan accuracy] Task 1 was a complete no-op**

- **Found during:** Task 1 (auditing scoped @keyframes)
- **Issue:** Plan assumed SplashScreen.vue, SettingsModal.vue, and round-start.vue had duplicate scoped @keyframes. None of them do — they reference global animation names.
- **Fix:** Documented as verified no-op. No file changes needed.
- **Verification:** `grep -n "@keyframes fadeIn\|@keyframes scaleIn\|@keyframes slideUp"` on all three files returned no matches

---

**Total deviations:** 1 (plan assumption was incorrect — no code change needed)
**Impact on plan:** No negative impact. One less change to make.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- round-start.vue now uses GameBackground — ready for Plan 04 to redesign FortuneWheel within that wrapper
- .game-back-btn utility class available for any future pages needing a back button
- workspace:check passes

---

_Phase: 15-visual-polish-animations-bug-fixes_
_Completed: 2026-03-23_
