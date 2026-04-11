---
phase: 23-improve-performance-and-accessibility-find-out-why-there-are
plan: 03
subsystem: ui
tags: [webp, sharp, asset-optimization, lazy-loading, image-pipeline, kebab-case]

# Dependency graph
requires:
  - phase: 23-02
    provides: canonical getAssetPath helper for all asset references
  - phase: 12-app-optimization
    provides: initial asset composable and image rendering patterns
provides:
  - pruned asset tree with only referenced, normalized filenames
  - reproducible WebP optimization pipeline (optimize-assets.mjs + assets:optimize script)
  - lazy-loading policy (eager for splash/loading, lazy for non-critical images)
affects: [23-improve-performance-and-accessibility]

# Tech tracking
tech-stack:
  added: [sharp]
  patterns:
    - 'lowercase-kebab-case asset filenames only'
    - 'WebP alongside PNG with sharp quality 80'
    - 'loading="eager" + fetchpriority="high" for critical images, loading="lazy" for non-critical'

key-files:
  created: []
  modified: []

key-decisions:
  - 'All plan criteria were pre-satisfied — no code changes needed during execution'
  - 'Asset cleanup, filename normalization, WebP pipeline, and lazy-loading policy already in place'

patterns-established:
  - 'Asset optimization pipeline: pnpm run assets:optimize generates WebP from all PNGs in public/assets/'
  - 'Critical image policy: splash/loading use eager+high priority, all others use lazy loading'

requirements-completed: [PERF-03]

# Metrics
duration: 2min
completed: 2026-04-11
---

# Phase 23 Plan 03: Remove Dead Assets, Normalize Filenames, WebP Pipeline Summary

**Asset tree pruned to 34 files (17 PNG + 17 WebP), all lowercase-kebab-case, with sharp-based WebP pipeline achieving 91.1% size reduction and lazy-loading policy applied across all image components**

## Performance

- **Duration:** 2 min (verification-only — no code changes needed)
- **Started:** 2026-04-11T04:31:22Z
- **Completed:** 2026-04-11T04:33:07Z
- **Tasks:** 2 (both pre-satisfied)
- **Files modified:** 0 (all changes were already in place)

## Accomplishments

- Verified all unreferenced legacy assets already removed — only 5 directories remain (alphabets/, main-menu/, players/, settings/, splash/) with 34 total files
- Verified all filenames are lowercase-kebab-case (no uppercase or spaced filenames) via automated verification script
- Verified SplashScreen.vue and GlobalLoading.vue reference normalized filenames through `getAssetPath('assets/splash/...')`
- Verified `optimize-assets.mjs` exists (64 lines, sharp quality 80) and runs successfully — 17 PNGs converted to WebP with 91.1% total size reduction
- Verified `assets:optimize` and `assets:verify` scripts exist in package.json
- Verified lazy-loading policy correctly applied: eager+high for splash/loading, lazy for settings/game/image-button
- TypeScript typecheck passes clean

## Task Commits

Both tasks were pre-satisfied — no code changes were needed during this execution:

1. **Task 1: Remove unreferenced assets and normalize filenames** — Pre-satisfied (no commit)
2. **Task 2: WebP optimization pipeline and lazy-loading policy** — Pre-satisfied (no commit)

All success criteria verified via:

- Filename verification script: `node -e "..." ` — no uppercase/spaced filenames found
- `pnpm --filter @riddle-rush/game run assets:optimize` — 17 WebP files generated successfully
- `pnpm --filter @riddle-rush/game typecheck` — clean
- Manual review of all 9 image-rendering components confirmed correct loading attributes

## Files Created/Modified

None — all target files already contained the correct implementations.

## Decisions Made

- **Pre-satisfied plan**: All success criteria (D-01 unreferenced removal, D-03 filename normalization, D-05 WebP pipeline, D-07 lazy-loading) were already implemented in the codebase prior to execution. Verified existing state comprehensively instead of making redundant changes.
- **Asset inventory**: 34 files across 5 directories is the correct minimal set — all are referenced by Vue components.

## Deviations from Plan

None — plan executed exactly as written (verification-only since all criteria pre-satisfied).

## Issues Encountered

None — all verification commands passed on first run.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Asset tree is clean and optimized with WebP variants
- Lazy-loading policy is in place for all image components
- Ready for Plan 23-04 (final Lighthouse verification)

## Self-Check: PASSED

All success criteria verified:

- No uppercase or spaced filenames in `apps/game/public/assets/`
- No unreferenced legacy directories (coins, profiles, designer exports removed)
- SplashScreen.vue and GlobalLoading.vue reference normalized filenames only
- `apps/game/scripts/optimize-assets.mjs` exists and writes `.webp` outputs
- `apps/game/package.json` contains `assets:optimize` script
- Critical splash/loading images remain eager/high priority
- Non-critical images in touched components are `loading="lazy"`

---

_Phase: 23-improve-performance-and-accessibility-find-out-why-there-are_
_Completed: 2026-04-11_
