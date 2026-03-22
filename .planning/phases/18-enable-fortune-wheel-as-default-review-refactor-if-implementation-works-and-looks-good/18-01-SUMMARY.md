---
phase: 18-enable-fortune-wheel-as-default-review-refactor-if-implementation-works-and-looks-good
plan: 01
subsystem: state-management
tags: [zustand, nuxt-auto-imports, typecheck, warnings, vitest]

# Dependency graph
requires:
  - phase: 19-move-from-pinia-to-zustand
    provides: Zustand store/hook layout that replaced legacy Pinia store APIs
provides:
  - Removed store barrel exports that caused duplicated Nuxt auto-import symbols
  - Confirmed fortune-wheel default behavior in store defaults and feature-flag fallback
  - Warning inventory with fixed vs intentional-suppression rationale for phase scope
affects: [18-03, 18-04, build-hygiene, e2e-reliability]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Avoid store barrel exports when Nuxt imports.dirs already scans concrete files'
    - 'Track build/tooling warnings explicitly with fixed vs intentional suppression rationale'

key-files:
  created:
    - .planning/phases/18-enable-fortune-wheel-as-default-review-refactor-if-implementation-works-and-looks-good/18-01-warning-inventory.md
    - .planning/phases/18-enable-fortune-wheel-as-default-review-refactor-if-implementation-works-and-looks-good/18-01-SUMMARY.md
  modified:
    - apps/game/stores/hooks/useSettings.ts
  removed:
    - apps/game/stores/index.ts
    - apps/game/stores/hooks/index.ts

key-decisions:
  - 'Remove stores/index.ts and stores/hooks/index.ts instead of keeping empty barrels to stop Nuxt symbol collisions at source'
  - 'Scope Pinia residue audit to apps/packages/tools with explicit migration/planning allowlist to avoid documentation false positives'
  - 'Treat current fontaine/sourcemap/manualChunks build warnings as intentional tooling suppressions documented in warning inventory'

patterns-established:
  - 'Direct imports from concrete store files (~/stores/gameStore, ~/stores/settingsStore) remain the canonical path'
  - 'Plan-level warning inventory required whenever build emits non-fatal warnings'

# Metrics
duration: 7 min
completed: 2026-03-22
---

# Phase 18 Plan 01: Fortune Wheel Default + Warning Cleanup Summary

**Store barrel collision warnings were eliminated by removing overlapping Nuxt auto-import barrels while preserving fortune-wheel default behavior and documenting all remaining build warnings with explicit disposition.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-22T22:08:27Z
- **Completed:** 2026-03-22T22:15:33Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Deleted `apps/game/stores/index.ts` and `apps/game/stores/hooks/index.ts`, which removed duplicated auto-import collisions from `workspace:check`/typecheck output.
- Verified fortune wheel remains default through both local settings default (`fortuneWheelEnabled: true`) and feature-flag fallback (`isEnabled('fortune-wheel', true)`).
- Ran Pinia residue audit in source trees (`apps`, `packages`, `tools`) with migration/planning allowlist and confirmed no non-allowlisted source matches.
- Created `18-01-warning-inventory.md` with per-warning closure rationale (fixed vs intentional suppression).

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove store barrel files causing duplicated import warnings** - `231cdf9a3` (fix)
2. **Task 2: Verify fortune wheel is default and document cleanup** - `0f5b0ef11` (docs)
3. **Task 3: Create warning inventory and close every warning with rationale** - `1b02ee5e9` (docs)

## Files Created/Modified

- `apps/game/stores/index.ts` - removed barrel exports colliding with Nuxt auto-import scanning.
- `apps/game/stores/hooks/index.ts` - removed barrel exports colliding with Nuxt auto-import scanning.
- `apps/game/stores/hooks/useSettings.ts` - removed redundant `GameSettings` re-export that still produced duplicate symbol warnings.
- `.planning/phases/18-enable-fortune-wheel-as-default-review-refactor-if-implementation-works-and-looks-good/18-01-warning-inventory.md` - warning closure inventory with command origins, dispositions, and rationale.

## Decisions Made

- Removed conflicting barrel files rather than keeping empty placeholders to ensure Nuxt import scanner only sees concrete source files.
- Kept fortune-wheel default behavior unchanged (already correct), documenting verification instead of introducing unnecessary code churn.
- Treat existing upstream/toolchain warnings (`@nuxtjs/fontaine`, sourcemap plugin warnings, rollup input option warning) as intentional suppressions with explicit justification in inventory.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed duplicate `GameSettings` type export from `useSettings.ts`**

- **Found during:** Task 1 (post-barrel-removal verification)
- **Issue:** duplicated import warning persisted because `GameSettings` was still exported in both `settingsStore.ts` and `hooks/useSettings.ts`.
- **Fix:** removed `export type { GameSettings }` from `apps/game/stores/hooks/useSettings.ts`.
- **Files modified:** `apps/game/stores/hooks/useSettings.ts`
- **Verification:** `pnpm run workspace:check` no longer shows duplicated import warnings.
- **Committed in:** `231cdf9a3`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary fix to fully satisfy zero-duplicate-warning requirement; no scope creep.

## Authentication Gates

None.

## Issues Encountered

- Turbo cache replay initially showed stale pre-change build warnings from cached logs in `pnpm run test`; resolved by forcing a fresh run with `turbo run test --filter=@riddle-rush/game --force` to confirm current warning state.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 18 now has warning-closure baseline documented for the 18-01 scope.
- Source-store import surface is cleaner and ready for follow-up phase 18 plans.
- No blockers identified for continuing with 18-03.

---

_Phase: 18-enable-fortune-wheel-as-default-review-refactor-if-implementation-works-and-looks-good_
_Completed: 2026-03-22_

## Self-Check: PASSED
