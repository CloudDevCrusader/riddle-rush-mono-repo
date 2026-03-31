---
phase: 19-move-from-pinia-to-zustand
plan: 03
subsystem: testing
tags: [zustand, vitest, playwright, e2e, unit-tests, state-management, migration]

# Dependency graph
requires:
  - phase: 19-move-from-pinia-to-zustand
    provides: Zustand store implementations (gameStore, settingsStore, loadingStore) from plans 01-02
provides:
  - All unit tests verified with Zustand isolation patterns
  - All E2E tests using __zustand__ window accessor
  - Settings migration spec with proper typed mocks
  - Zero Pinia references remaining in test files
affects: [19-move-from-pinia-to-zustand]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Direct state mutation for beforeEach reset (preserves JS getter properties)'
    - 'setState() for stores without getter properties (settingsStore, loadingStore)'
    - 'Typed window interface (ZustandWindow) for E2E page.evaluate() calls'
    - 'MockStorage interface for properly typed localStorage mocks'

key-files:
  created: []
  modified:
    - apps/game/tests/unit/game-store.spec.ts
    - apps/game/tests/unit/settings-store.spec.ts
    - apps/game/tests/unit/current-player-index.spec.ts
    - apps/game/tests/unit/reactivity-improvements.spec.ts
    - apps/game/tests/unit/use-loading.spec.ts
    - apps/game/tests/unit/use-feature-flags.spec.ts
    - apps/game/tests/unit/settings-migration.spec.ts
    - apps/game/tests/e2e/full-game-workflow.spec.ts
    - apps/game/tests/e2e/game-complete-flow.spec.ts
    - apps/game/tests/e2e/scoring-flow.spec.ts
    - apps/game/tests/e2e/helpers/waits.ts
    - apps/game/plugins/zustand.ts

key-decisions:
  - 'Use direct state mutation (not setState) for gameStore reset in tests because setState spreads evaluate JS getter properties into static values'
  - 'Use setState() for settingsStore/loadingStore since they do not have getter property issues'
  - 'Define inline typed window interfaces in page.evaluate() callbacks rather than shared global types (browser context isolation)'

patterns-established:
  - 'gameStore test reset: mutate state.property directly to preserve getters'
  - 'settingsStore test reset: use setState(defaultSettingsState) for clean isolation'
  - 'E2E Zustand access: (window as unknown as { __zustand__?: ... }) pattern'

requirements-completed: []

# Metrics
duration: 15min
completed: 2025-03-22
---

# Phase 19 Plan 03: Test Suite Verification Summary

**Complete Zustand test isolation across 29 unit test files and 3 E2E spec files with zero Pinia references remaining**

## Performance

- **Duration:** 15 min
- **Started:** 2025-03-22T21:00:00Z
- **Completed:** 2025-03-22T21:15:00Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments

- Finalized Zustand test isolation in 7 unit test files (6 core + 1 migration spec)
- Replaced all **pinia** references with **zustand** in 3 E2E spec files and 1 helper
- Full test suite passes: 734 tests passing, 7 skipped, 0 failures
- All type safety issues resolved (no `any` types, proper unknown casts)

## Task Commits

Each task was committed atomically:

1. **Task 1: Unit test Zustand isolation** - `591164a0f` (test)
2. **Task 2: E2E **pinia** to **zustand** migration** - `6dd3fc0a2` (fix)
3. **Task 3: Full test suite verification** - No commit (verification only, all 734 tests pass)

**Plan metadata:** [pending] (docs: complete plan)

## Files Created/Modified

- `apps/game/tests/unit/game-store.spec.ts` - Updated beforeEach reset with documentation
- `apps/game/tests/unit/settings-store.spec.ts` - Switched to setState() with defaults
- `apps/game/tests/unit/current-player-index.spec.ts` - Updated beforeEach reset
- `apps/game/tests/unit/reactivity-improvements.spec.ts` - Updated beforeEach reset
- `apps/game/tests/unit/use-loading.spec.ts` - Already using proper setState pattern
- `apps/game/tests/unit/use-feature-flags.spec.ts` - Already using proper pattern
- `apps/game/tests/unit/settings-migration.spec.ts` - Rewritten with MockStorage interface
- `apps/game/tests/e2e/full-game-workflow.spec.ts` - **pinia** to **zustand**
- `apps/game/tests/e2e/game-complete-flow.spec.ts` - **pinia** to **zustand**
- `apps/game/tests/e2e/scoring-flow.spec.ts` - **pinia** to **zustand**
- `apps/game/tests/e2e/helpers/waits.ts` - Removed all `(window as any)` with typed interfaces
- `apps/game/plugins/zustand.ts` - Fixed window type cast

## Decisions Made

- Used direct state mutation for gameStore reset (not setState) because setState spread operation evaluates JS getter properties (`get displayedCategories()`) into static values, breaking lazy computation
- Used `setState()` for settingsStore and loadingStore since they work correctly with spread
- Defined inline typed window interfaces inside `page.evaluate()` callbacks rather than importing shared types (browser context cannot access Node.js module imports)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed catch(error: any) to catch(error: unknown)**

- **Found during:** Task 1 (game-store.spec.ts)
- **Issue:** Pre-existing `any` type in catch clause at line 1230
- **Fix:** Changed to `catch (error: unknown)` with `(error as Error).message`
- **Files modified:** apps/game/tests/unit/game-store.spec.ts
- **Verification:** TypeScript compiles, tests pass
- **Committed in:** 591164a0f

**2. [Rule 1 - Bug] Fixed @ts-ignore to @ts-expect-error in migration spec**

- **Found during:** Task 1 (settings-migration.spec.ts)
- **Issue:** @ts-ignore without description blocked by ESLint
- **Fix:** Replaced with @ts-expect-error + descriptive comment
- **Files modified:** apps/game/tests/unit/settings-migration.spec.ts
- **Verification:** ESLint passes
- **Committed in:** 591164a0f

**3. [Rule 2 - Missing Critical] Created MockStorage interface replacing `as any`**

- **Found during:** Task 1 (settings-migration.spec.ts)
- **Issue:** `globalThis.localStorage = mockLocalStorage as any` forbidden by hooks
- **Fix:** Defined `MockStorage` interface with proper Storage + Mock method types
- **Files modified:** apps/game/tests/unit/settings-migration.spec.ts
- **Verification:** TypeScript compiles, all 13 migration tests pass
- **Committed in:** 591164a0f

**4. [Rule 1 - Bug] Replaced all (window as any) in waits.ts**

- **Found during:** Task 2 (waits.ts)
- **Issue:** 20 occurrences of `(window as any)` blocked by hooks
- **Fix:** Defined `ZustandWindow` interface and inline typed casts throughout
- **Files modified:** apps/game/tests/e2e/helpers/waits.ts
- **Verification:** TypeScript compiles
- **Committed in:** 6dd3fc0a2

---

**Total deviations:** 4 auto-fixed (2 bugs, 1 missing critical type safety, 1 type cleanup)
**Impact on plan:** All fixes required for type safety and lint compliance. No scope creep.

## Issues Encountered

- setState() broke gameStore tests because Zustand's spread evaluates JS getter properties -- discovered during test run and documented in code comments for future developers

## Known Stubs

None - all test files are fully wired with Zustand stores.

## Next Phase Readiness

- All unit and E2E tests confirmed working with Zustand
- Zero Pinia references remain in any test file
- Ready for plan 04 (cleanup) or final verification

## Self-Check: PASSED

All files verified present, all commits verified in git log.

---

_Phase: 19-move-from-pinia-to-zustand_
_Completed: 2025-03-22_
