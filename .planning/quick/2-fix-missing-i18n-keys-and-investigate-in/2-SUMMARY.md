---
phase: quick
plan: 2
subsystem: i18n
tags: [nuxtjs-i18n, vue-i18n, pwa, workbox, translations, locale]

# Dependency graph
requires: []
provides:
  - Single canonical scoring block in de.json and en.json with all 9 required keys
  - Static-bundle-only i18n loading (no runtime lazy-load race condition)
  - PWA precache covers JSON locale files
affects: [i18n, scoring-page, pwa, translations]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Static bundle only: messages loaded via vueI18n/i18n.config.ts; no file: property on locale entries'
    - 'No langDir in i18n config when using static bundling — prevents dual-load conflict'
    - 'NuxtPlugin/NuxtAppSchema from @nuxt/schema for typed Nuxt hook callbacks'

key-files:
  created: []
  modified:
    - apps/game/translations/locales/de.json
    - apps/game/translations/locales/en.json
    - apps/game/nuxt.config.ts

key-decisions:
  - 'Remove file: property from locale entries — static bundle via i18n.config.ts makes it redundant and harmful (dual-load race)'
  - 'Remove langDir — only needed for file-based lazy-loading which is now disabled'
  - 'Add json to PWA globPatterns for offline resilience'
  - 'build:manifest hook replaced with no-op comment — it receives Vite bundle manifest (asset map), not app plugin list; plugin filtering belongs in app:resolve only'
  - 'Replace any types in Nuxt hook callbacks with NuxtAppSchema/NuxtPlugin from @nuxt/schema and ViteBundleManifest from vue-bundle-renderer'

patterns-established:
  - 'i18n static bundling: use vueI18n + i18n.config.ts only; never combine with file: lazy-loading'

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-02-19
---

# Quick Task 2: Fix Missing i18n Keys and Investigate Loading Race Summary

**Eliminated silent duplicate-key data loss in de.json/en.json and removed the lazy-load/static-bundle race condition that caused intermittent missing scoring translations on hard refresh and PWA reinstall**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-19T18:39:55Z
- **Completed:** 2026-02-19T18:43:36Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Both locale files now have exactly one `scoring` block with all 9 required keys (title, player, description, confirm_scores, next_round, finish_game, play_another_round, round_complete, error_saving)
- Eliminated the dual-loading conflict: `file:` property and `langDir` removed from i18n config so @nuxtjs/i18n no longer issues runtime fetch requests that overwrite already-bundled messages
- Added `json` to PWA `globPatterns` for offline resilience
- Fixed all pre-existing `any` types in Nuxt hook callbacks (Rule 1 auto-fix triggered by hook)

## Task Commits

1. **Task 1: Fix duplicate scoring keys in both locale files** - `206e75ca3` (fix)
2. **Task 2: Fix intermittent loading by disabling runtime lazy-loading** - `f993344ae` (fix)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `apps/game/translations/locales/de.json` — removed orphaned first `scoring` block (4 keys); kept complete second block (9 keys)
- `apps/game/translations/locales/en.json` — removed orphaned first `scoring` block (4 keys); kept complete second block (9 keys)
- `apps/game/nuxt.config.ts` — removed `file:` from locale entries, removed `langDir`, added `json` to globPatterns, typed Nuxt hook callbacks with proper types

## Decisions Made

- **Static bundle only:** `i18n.config.ts` statically imports and bundles both locale files. The `file:` property on locale entries caused @nuxtjs/i18n to also lazy-load them at runtime, creating a race condition where the network fetch could overwrite bundled messages with partial/empty results. Removing `file:` and `langDir` eliminates the conflict entirely.
- **build:manifest hook simplified:** The existing hook attempted to filter plugins on `manifest.app.plugins` but `build:manifest` receives a Vite bundle manifest (asset entry map from `vue-bundle-renderer`), not an app object. This hook was a no-op in practice; plugin filtering was already handled by `app:resolve`. Replaced with a comment explaining the distinction.
- **German remains default locale:** `defaultLocale: 'de'` is unchanged in `nuxt.config.ts`. Verified explicitly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Replaced any types with proper Nuxt types in hook callbacks**

- **Found during:** Task 2 (modifying nuxt.config.ts)
- **Issue:** Pre-commit hook (`claudekit-hooks run check-any-changed`) blocked the edit because the file contained 4 `any` type annotations in `filterProblematicPlugins` and the `app:resolve`/`build:manifest` hooks
- **Fix:** Imported `NuxtApp as NuxtAppSchema` and `NuxtPlugin` from `@nuxt/schema`, and `Manifest as ViteBundleManifest` from `vue-bundle-renderer`. Updated function signature and hook parameter types accordingly. Also discovered `build:manifest` hook had incorrect assumptions about its parameter shape — simplified to no-op with explanatory comment
- **Files modified:** `apps/game/nuxt.config.ts`
- **Verification:** TypeScript passes cleanly; `grep ": any"` returns no results
- **Committed in:** `f993344ae` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug — pre-existing `any` types blocking edit)
**Impact on plan:** Auto-fix necessary to unblock the edit; improved type safety as a side effect. No scope creep.

## Issues Encountered

The pre-commit hook enforcing no-`any` types fired when the file was touched, requiring all four pre-existing `any` annotations to be resolved before the commit could proceed. This led to the discovery that the `build:manifest` hook was conceptually incorrect (accessing `.app.plugins` on a Vite bundle manifest that has no such shape). The hook was simplified to a no-op placeholder.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Scoring page translations will now reliably load on first visit, hard refresh, and PWA reinstall
- No further i18n action required unless new translation keys are added
- Both locale files are now duplicate-free and structurally correct

---

_Phase: quick-2_
_Completed: 2026-02-19_
