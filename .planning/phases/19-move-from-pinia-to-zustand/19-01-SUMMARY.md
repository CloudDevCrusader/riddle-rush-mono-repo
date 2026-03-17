---
phase: 19-move-from-pinia-to-zustand
plan: 01
subsystem: state-management
tags: [zustand, vue, reactivity, migration, localStorage]

# Dependency graph
requires: []
provides:
  - Zustand raw stores at stores/ root (gameStore, settingsStore, loadingStore)
  - Focused Vue wrapper hooks with subscribe+version reactivity (6 hooks)
  - localStorage migration utility from Pinia to Zustand persist format
  - Barrel exports for all stores and hooks
affects: [19-02, 19-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [subscribe+version Vue reactivity bridge for Zustand v5, focused hook splitting]

key-files:
  created:
    - apps/game/stores/gameStore.ts
    - apps/game/stores/settingsStore.ts
    - apps/game/stores/loadingStore.ts
    - apps/game/stores/migrate.ts
    - apps/game/stores/index.ts
    - apps/game/stores/hooks/useGameSession.ts
    - apps/game/stores/hooks/useCategories.ts
    - apps/game/stores/hooks/usePlayerActions.ts
    - apps/game/stores/hooks/useInstallPrompt.ts
    - apps/game/stores/hooks/useSettings.ts
    - apps/game/stores/hooks/useLoading.ts
    - apps/game/stores/hooks/index.ts
  modified:
    - apps/game/stores/zustand/gameStore.ts
    - apps/game/stores/zustand/vueGameStore.ts
    - apps/game/stores/zustand/vueSettingsStore.ts

key-decisions:
  - "Use #imports instead of 'vue' for computed/ref/onScopeDispose in Nuxt auto-import context"
  - 'Store exports use non-use prefix (gameStore not useGameStore) since raw Zustand stores are not Vue composables'
  - 'Settings store persist-only: removed loadSettings/saveSettings/hasStoredSettings, persist middleware handles all'
  - 'Fix pre-existing null-safety and Vue import errors in old zustand/ files to unblock typecheck CI'

patterns-established:
  - 'subscribe+version pattern: each Vue hook creates ref(0), subscribes to store, increments version, wraps state in computed(() => { void version.value; return store.getState().prop })'
  - 'Hook splitting by domain: session/lifecycle, categories, player actions, install prompt, settings, loading'
  - 'Actions exposed as stable references from getState() -- no computed wrapper needed'

requirements-completed: [MIGRATE-01, MIGRATE-02, MIGRATE-06]

# Metrics
duration: 9min
completed: 2026-03-17
---

# Phase 19 Plan 01: Zustand Store Foundation Summary

**Zustand raw stores moved to stores/ root with persist-only settings, 6 focused Vue hooks using subscribe+version reactivity, and Pinia localStorage migration utility**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-17T05:12:22Z
- **Completed:** 2026-03-17T05:21:45Z
- **Tasks:** 2
- **Files created:** 12
- **Files modified:** 3 (pre-existing bug fixes in old zustand/ files)

## Accomplishments

- Moved gameStore, settingsStore, loadingStore from stores/zustand/ to stores/ root with corrected import paths
- Cleaned settings store to persist-only (removed manual loadSettings/saveSettings)
- Created 6 focused Vue wrapper hooks with proper subscribe+version reactivity pattern
- Created localStorage migration utility for Pinia-to-Zustand format conversion
- Fixed pre-existing TypeScript errors in old zustand/ files (null safety, Vue import resolution)

## Task Commits

Each task was committed atomically:

1. **Task 1: Move raw Zustand stores, clean settings, create migration** - `c4e9ce087` (feat)
2. **Task 2: Create focused Vue wrapper hooks with subscribe+version reactivity** - `e4bf293ff` (feat)

## Files Created/Modified

- `apps/game/stores/gameStore.ts` - Raw Zustand game store (renamed export to gameStore)
- `apps/game/stores/settingsStore.ts` - Persist-only settings store (no manual load/save)
- `apps/game/stores/loadingStore.ts` - Loading state store (no inline useLoading)
- `apps/game/stores/migrate.ts` - migrateFromPinia() localStorage converter
- `apps/game/stores/index.ts` - Barrel exports for stores, hooks, migration
- `apps/game/stores/hooks/useGameSession.ts` - Session state, lifecycle, game getters
- `apps/game/stores/hooks/useCategories.ts` - Category management state and actions
- `apps/game/stores/hooks/usePlayerActions.ts` - Player operations (submit, score, round)
- `apps/game/stores/hooks/useInstallPrompt.ts` - PWA install prompt state
- `apps/game/stores/hooks/useSettings.ts` - All settings state, toggles, getters
- `apps/game/stores/hooks/useLoading.ts` - Loading state plus setOnlineStatus convenience
- `apps/game/stores/hooks/index.ts` - Hook barrel exports

## Decisions Made

- Used `#imports` instead of `'vue'` for Vue reactivity imports -- Nuxt auto-import resolution
- Raw store exports named without `use` prefix (gameStore, settingsStore, loadingStore) to distinguish from Vue composable hooks
- Settings store simplified to persist-only: removed loadSettings(), saveSettings(), hasStoredSettings(), and all get().saveSettings() calls from toggles
- setLanguage simplified to single argument (removed persist parameter) since persist middleware handles all persistence

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed pre-existing null-safety errors in zustand/gameStore.ts**

- **Found during:** Task 1 (typecheck verification)
- **Issue:** Pre-existing TS2531 errors in old zustand/gameStore.ts blocked commit via pre-commit hook
- **Fix:** Extracted nullable values to local variables before access (installPromptEvent, currentSession)
- **Files modified:** apps/game/stores/zustand/gameStore.ts
- **Verification:** nuxi typecheck passes with zero errors in new files
- **Committed in:** c4e9ce087 (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed Vue import resolution in old zustand vue wrappers**

- **Found during:** Task 1 (typecheck verification)
- **Issue:** `import { computed } from 'vue'` failed in Nuxt context -- TS2305 errors blocked commit
- **Fix:** Changed to `import { computed } from '#imports'` in vueGameStore.ts and vueSettingsStore.ts
- **Files modified:** apps/game/stores/zustand/vueGameStore.ts, apps/game/stores/zustand/vueSettingsStore.ts
- **Verification:** nuxi typecheck passes
- **Committed in:** c4e9ce087 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes addressed pre-existing issues that blocked the pre-commit hook. No scope creep.

## Issues Encountered

- Nuxt auto-import duplicate warnings for stores/index.ts barrel exports alongside individual file auto-imports -- warnings only, non-blocking. Will be resolved in Plan 02 when old files are removed and consumers switch to explicit imports.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All new store files and hooks ready for consumer import swap in Plan 02
- Old stores/zustand/ directory and Pinia stores remain untouched for Plan 02 big-bang cutover
- Barrel exports (stores/index.ts) ready for import statements

---

_Phase: 19-move-from-pinia-to-zustand_
_Completed: 2026-03-17_
