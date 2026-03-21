---
phase: 14-maintenance-quality-of-life
plan: 03
subsystem: ui, testing
tags: [typecheck, nuxt, vite-pwa, multiplayer, zustand, player-management]

# Dependency graph
requires:
  - phase: 12-app-optimization
    provides: Stateless composable extraction pattern for game store delegation
provides:
  - Clean stable typecheck with no intermittent failures
  - Confirmed multiplayer round-skip bug fixed (by quick task #007)
  - Game store structural assessment (406 lines, 5 composable delegates, sound architecture)
affects: [19-pinia-to-zustand]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Index-based player turn tracking (currentPlayerIndex) for deterministic multiplayer turns'

key-files:
  created: []
  modified:
    - apps/game/nuxt.config.ts

key-decisions:
  - 'Removed unused ViteBundleManifest import and no-op build:manifest hook from nuxt.config.ts (dead code removal)'
  - 'Multiplayer round-skip bug confirmed fixed by quick task #007 (index-based currentPlayerIndex tracking)'
  - 'Game store assessed as well-structured at 406 lines with 5 composable delegates; defer deep refactor to Phase 19 Zustand migration'

patterns-established: []

requirements-completed: [MAINT-MULTI-01, MAINT-TS-01, MAINT-STORE-01]

# Metrics
duration: 4min
completed: 2026-03-21
---

# Phase 14 Plan 03: Bug Fixes and Store Assessment Summary

**Stable typecheck via dead code removal, multiplayer round-skip confirmed fixed by #007 index-based tracking, game store assessed as sound (406 lines, 5 composable delegates)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-21T22:15:02Z
- **Completed:** 2026-03-21T22:19:22Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Typecheck passes cleanly and consistently on 3+ consecutive runs after removing dead `ViteBundleManifest` import and no-op `build:manifest` hook
- Multiplayer round-skip bug confirmed fixed by quick task #007 (commit f205f0de3) which introduced `currentPlayerIndex` field for deterministic index-based turn tracking
- Game store (Zustand, 406 lines) assessed as well-structured with delegation to 5 composables; no changes needed, defer deep refactor to Phase 19

## Task Commits

Each task was committed atomically:

1. **Task 1: Investigate and fix intermittent nuxi typecheck error** - `9d957d6dd` (fix)

Task 2 produced no code changes (investigation-only, findings documented below).

**Plan metadata:** `21a4b06c1` (docs: complete plan)

## Files Created/Modified

- `apps/game/nuxt.config.ts` - Removed unused `ViteBundleManifest` type import from `vue-bundle-renderer` and no-op `build:manifest` hook

## Decisions Made

1. **Removed dead code instead of adding @ts-expect-error:** The typecheck already passes cleanly thanks to three existing mitigations (skipLibCheck in tsconfig, pwa-icons-plugin exclusion, typecheck.sh @ts-nocheck injection). The `ViteBundleManifest` import and `build:manifest` no-op hook were dead code that could cause future type conflicts. Removing them is cleaner than suppressing errors.

2. **Multiplayer round-skip: confirmed fixed, no new code needed:** Quick task #007 (f205f0de3) fundamentally fixed the root cause by:
   - Adding `currentPlayerIndex` to `GameSession` type
   - Switching `getCurrentPlayerTurn` from `find-by-hasSubmitted` to `players[currentPlayerIndex]`
   - Resetting `currentPlayerIndex = 0` in `startNextRound` and `resetPlayerSubmissions`
   - Persisting `currentPlayerIndex` to IndexedDB, surviving page reload

3. **Game store deferred to Phase 19:** At 406 lines with 5 composable delegates, the store is lean enough. Phase 19 (Pinia to Zustand) will rewrite it.

## Game Store Assessment (MAINT-STORE-01)

The active game store is `apps/game/stores/zustand/gameStore.ts`:

- **Line count:** 406 lines (down from ~352 in Pinia era due to Zustand's more compact syntax)
- **Delegate composables (5):**
  1. `useCategoryManager` - Category fetching, filtering, random selection
  2. `useSessionManager` - Session creation, cloning, lifecycle checks
  3. `usePlayerManager` - Player creation, turn management, scoring, leaderboard
  4. `usePersistence` - IndexedDB load/save for sessions and history
  5. `useGameLifecycle` - Round result building, statistics updates
- **Vue bridge:** `stores/zustand/vueGameStore.ts` wraps Zustand store with Vue `computed()` refs
- **Architecture:** Store owns reactive state, composables provide stateless utility functions
- **Assessment:** Well-structured, no obvious issues. Duplication exists between `stores/gameStore.ts` and `stores/zustand/gameStore.ts` from Phase 19 migration (expected, will be cleaned up when Pinia is fully removed)
- **Recommendation:** Defer any deep refactor to Phase 19 Zustand migration completion

## Multiplayer Round-Skip Analysis

**Root cause:** Before quick task #007, `getCurrentPlayerTurn` used `players.find(p => !p.hasSubmitted)` which was non-deterministic after page reload because `hasSubmitted` flags could be inconsistent with actual turn order.

**Fix by #007 (f205f0de3):**

- Added `currentPlayerIndex: number` to `GameSession` type
- `advancePlayerIndex(currentIndex, _playerCount)` returns `currentIndex + 1` (non-wrapping)
- `getCurrentPlayerTurn(players, currentPlayerIndex)` returns `players[currentPlayerIndex] ?? null`
- `startNextRound` resets `currentPlayerIndex = 0` BEFORE `saveSessionToDB()`
- `resetPlayerSubmissions` also resets `currentPlayerIndex = 0`
- Session creation initializes `currentPlayerIndex = 0`

**Why the fix is complete:**

- The index is persisted to IndexedDB with the session, surviving page reload
- On `loadSessionById`, the restored session has the correct `currentPlayerIndex`
- When `currentPlayerIndex >= players.length`, `getCurrentPlayerTurn` returns `null`, hiding the input form and showing the NEXT button
- The game page template correctly guards: `v-if="players.length > 0 && currentPlayerTurn && !allPlayersSubmitted"`

**Verification:** 727 unit tests pass, including comprehensive index-based tracking tests from #007.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Typecheck is stable and reliable
- Multiplayer game flow is deterministic
- Game store is well-structured and ready for Phase 19 continuation

## Self-Check: PASSED

- FOUND: 14-03-SUMMARY.md
- FOUND: nuxt.config.ts (modified)
- FOUND: commit 9d957d6dd (Task 1)

---

_Phase: 14-maintenance-quality-of-life_
_Completed: 2026-03-21_
