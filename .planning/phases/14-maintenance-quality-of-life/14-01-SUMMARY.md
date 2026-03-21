---
phase: 14-maintenance-quality-of-life
plan: 01
subsystem: ui
tags: [i18n, vue-i18n, nuxt, json, localization]

# Dependency graph
requires:
  - phase: 10-settings-pages
    provides: Language selection page and settings i18n foundation
provides:
  - Complete i18n coverage for credits, splash, game, round-start, language, and index pages
  - Structurally sound de.json and en.json with no duplicate top-level keys
affects: [14-maintenance-quality-of-life]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Merged duplicate JSON top-level sections to prevent silent key shadowing'
    - 'Dynamic aria-label binding via :aria-label="t(''key'')" for accessibility'

key-files:
  created: []
  modified:
    - apps/game/translations/locales/de.json
    - apps/game/translations/locales/en.json
    - apps/game/pages/credits.vue
    - apps/game/pages/splash.vue
    - apps/game/pages/game/[[gameId]].vue
    - apps/game/pages/round-start.vue
    - apps/game/pages/language.vue
    - apps/game/pages/index.vue

key-decisions:
  - 'Merged de.json duplicate language, credits, and settings sections keeping all unique keys from both blocks'
  - 'Used home.page_title for main menu title (not menu.page_title) to match existing home namespace'
  - "credits.title kept as 'CREDITS' (original first block value) since it is the page header display text"

patterns-established:
  - 'All useHead titles must use t() calls, not hardcoded strings'
  - 'All aria-label and alt attributes with user-facing text must use :attr="t(''key'')" binding'

requirements-completed: [MAINT-I18N-01]

# Metrics
duration: 5min
completed: 2026-03-21
---

# Phase 14 Plan 01: i18n Completion Summary

**Replaced 13 hardcoded strings with t() calls across 6 Vue pages and fixed duplicate JSON sections in both locale files**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-21T22:15:08Z
- **Completed:** 2026-03-21T22:20:45Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Merged 3 duplicate top-level JSON sections (language, credits, settings) in de.json, preventing silent key shadowing
- Added 4 new translation keys (game.pause, game.round_start_title, game.round_start_description, home.page_title) to both locale files
- Replaced all 13 identified hardcoded strings in credits, splash, game, round-start, language, and index pages with i18n t() calls
- Fixed same duplicate section issues in en.json (language, credits, settings)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix de.json duplicate sections and add missing translation keys** - `ba6d39c77` (fix)
2. **Task 2: Update en.json with matching keys and wire hardcoded strings in Vue pages** - `5f069380e` (fix)

## Files Created/Modified

- `apps/game/translations/locales/de.json` - Merged duplicate language/credits/settings sections, added 4 new keys
- `apps/game/translations/locales/en.json` - Merged duplicate sections, added matching English keys
- `apps/game/pages/credits.vue` - Replaced Back button text, Game Design/Programming/Art headings with t() calls
- `apps/game/pages/splash.vue` - Replaced LOADING.... with t('common.loading'), added useI18n import
- `apps/game/pages/game/[[gameId]].vue` - Replaced aria-label, alt, loading fallback, and useHead title with t() calls
- `apps/game/pages/round-start.vue` - Replaced useHead title and description with t() calls
- `apps/game/pages/language.vue` - Replaced aria-label="Go back" with :aria-label="t('common.back')"
- `apps/game/pages/index.vue` - Replaced useHead title "Main Menu" with t('home.page_title')

## Decisions Made

- Merged all three duplicate JSON sections (language, credits, settings) keeping the union of keys from both occurrences
- For credits.title, kept "CREDITS" (uppercase display text) rather than "Riddle Rush - Credits" (moved the longer variant to description field which was already present)
- Used `home.page_title` key path for main menu title to match existing `home` namespace structure

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate credits and settings sections in en.json**

- **Found during:** Task 2
- **Issue:** en.json had the same duplicate top-level key issue as de.json (language, credits, settings sections appeared twice)
- **Fix:** Merged all duplicate sections in en.json to single blocks, same as de.json
- **Files modified:** apps/game/translations/locales/en.json
- **Verification:** JSON parses correctly, no duplicate top-level keys
- **Committed in:** 5f069380e (Task 2 commit)

**2. [Rule 2 - Missing Critical] Added useI18n import to splash.vue**

- **Found during:** Task 2
- **Issue:** splash.vue had no useI18n() call in script setup, needed for t() function
- **Fix:** Added `const { t } = useI18n()` to script setup
- **Files modified:** apps/game/pages/splash.vue
- **Verification:** TypeScript check passes
- **Committed in:** 5f069380e (Task 2 commit)

**3. [Rule 2 - Missing Critical] Replaced hardcoded meta description in game page and index page**

- **Found during:** Task 2
- **Issue:** game/[[gameId]].vue had hardcoded English meta description, index.vue had "Game main menu" description
- **Fix:** Replaced with t('game.meta_description') and t('app.description') respectively
- **Files modified:** apps/game/pages/game/[[gameId]].vue, apps/game/pages/index.vue
- **Verification:** workspace:check passes
- **Committed in:** 5f069380e (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 missing critical)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - all translation keys are wired to real values in both locale files.

## Next Phase Readiness

- i18n coverage is now complete for all identified pages
- Both locale files are structurally sound with no duplicate sections
- Ready for Phase 14 Plan 02

## Self-Check: PASSED

- All 8 modified files exist on disk
- Commit ba6d39c77 found in git log
- Commit 5f069380e found in git log

---

_Phase: 14-maintenance-quality-of-life_
_Completed: 2026-03-21_
