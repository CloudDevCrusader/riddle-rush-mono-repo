---
phase: 23-improve-performance-and-accessibility-find-out-why-there-are
plan: 02
subsystem: ui
tags: [nuxt-img, ipx, asset-path, ssr-false, static-deployment, image-rendering]

# Dependency graph
requires:
  - phase: 12-app-optimization
    provides: initial useAssets composable and getAssetPath pattern
provides:
  - canonical getAssetPath helper as single source of truth for all asset URLs
  - static-safe image rendering (no NuxtImg ipx runtime dependency)
  - source-contract tests preventing dead helper regression
affects: [23-improve-performance-and-accessibility]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'useAssets composable as single canonical asset path resolver'
    - 'plain <img> tags instead of <NuxtImg> for ssr:false static deployment'
    - 'source-contract tests (fs.readFileSync source assertions) to prevent regressions'

key-files:
  created: []
  modified:
    - apps/game/composables/useAssets.ts
    - apps/game/composables/usePageSetup.ts
    - apps/game/pages/round-start.vue
    - apps/game/components/Base/ImageButton.vue
    - apps/game/components/SettingsModal.vue
    - apps/game/pages/game/[[gameId]].vue
    - apps/game/layouts/menu.vue
    - apps/game/layouts/game.vue
    - apps/game/tests/unit/use-assets.spec.ts

key-decisions:
  - 'All plan success criteria were pre-satisfied — no code changes needed during execution'
  - 'Existing test suite already covers canonical helper behavior and source contract assertions'

patterns-established:
  - 'Source-contract testing: readFileSync + expect().not.toContain() to prevent dead helper re-introduction'
  - 'All image paths must go through useAssets().getAssetPath() — no raw template literals'

requirements-completed: [PERF-02]

# Metrics
duration: 1min
completed: 2026-04-11
---

# Phase 23 Plan 02: Fix Static Image Rendering / \_ipx URL Contracts Summary

**All asset paths canonicalized through useAssets().getAssetPath() with NuxtImg replaced by static-safe `<img>` tags — codebase already satisfied all criteria pre-execution**

## Performance

- **Duration:** 1 min (verification-only — no code changes needed)
- **Started:** 2026-04-11T04:27:12Z
- **Completed:** 2026-04-11T04:28:02Z
- **Tasks:** 2 (both pre-satisfied)
- **Files modified:** 0 (all changes were already in place)

## Accomplishments

- Verified useAssets.ts contains no dead helpers (no `assets/icons/` or `assets/game/` references)
- Verified usePageSetup.ts has no duplicate `getAssetPath` implementation — delegates to useAssets()
- Verified all 6 target Vue files use `getAssetPath()` from useAssets (no raw `${baseUrl}assets/` template literals)
- Verified round-start.vue and Base/ImageButton.vue use plain `<img>` tags (no NuxtImg/ipx dependency)
- Verified existing test suite (252 lines, 17 tests) covers all acceptance criteria including source contract assertions
- All 967 unit tests pass across 41 test files
- TypeScript typecheck passes clean

## Task Commits

Both tasks were pre-satisfied — no code changes were needed during this execution:

1. **Task 1: Normalize asset helper contracts** — Pre-satisfied (no commit)
2. **Task 2: Migrate raw/template image references** — Pre-satisfied (no commit)

All success criteria verified via:

- `pnpm --filter @riddle-rush/game test:unit -- tests/unit/use-assets.spec.ts` → 967 tests pass
- `pnpm --filter @riddle-rush/game typecheck` → clean
- Source grep verification: no dead helpers, no duplicate getAssetPath, no raw template literals, no NuxtImg

## Files Created/Modified

None — all target files already contained the correct implementations.

## Decisions Made

- **Pre-satisfied plan**: All success criteria (D-02 raw template migration, D-04 dead helper removal, NuxtImg → img replacement) were already implemented in the codebase prior to execution. Rather than making redundant changes, verified existing state comprehensively.
- **Existing tests sufficient**: The `use-assets.spec.ts` test file already contains source-contract tests (lines 142-157) that prevent regression of dead helpers and duplicate implementations.

## Deviations from Plan

None — plan executed exactly as written (verification-only since all criteria pre-satisfied).

## Issues Encountered

None — all verification commands passed on first run.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Asset path contracts are verified and locked with source-contract tests
- No NuxtImg ipx runtime dependencies remain in known files
- Ready for remaining Phase 23 plans (03 and 04)

## Self-Check: PASSED

All success criteria verified:

- ✅ useAssets.ts has no `assets/icons/` or `assets/game/` strings
- ✅ usePageSetup.ts has no local `const getAssetPath =` function body
- ✅ No `${baseUrl}assets/` template literals in target Vue files
- ✅ No `<NuxtImg` in round-start.vue or ImageButton.vue
- ✅ All target files use `useAssets` and `getAssetPath`
- ✅ 967 unit tests pass
- ✅ TypeScript typecheck clean

---

_Phase: 23-improve-performance-and-accessibility-find-out-why-there-are_
_Completed: 2026-04-11_
