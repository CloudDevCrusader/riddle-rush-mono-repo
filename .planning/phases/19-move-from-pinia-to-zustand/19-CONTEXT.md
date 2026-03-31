# Phase 19: Move from Pinia to Zustand - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace Pinia state management with Zustand across the game app. Complete the migration that's already been started — parallel Zustand stores exist in `stores/zustand/` with Vue wrapper layers. This phase does the cutover, cleanup, and test migration. No new features or state management changes.

</domain>

<decisions>
## Implementation Decisions

### Migration Strategy

- Big-bang swap — all 6 consumer files updated in one go (not gradual per-store)
- Full Pinia removal — uninstall packages, remove from nuxt.config.ts modules, delete old store files
- Move Zustand files from `stores/zustand/` up to `stores/` (remove nesting after Pinia is gone)
- Vue wrappers are the public API — consumers never import raw Zustand stores directly

### Reactivity Bridge

- Keep explicit computed() wrapping pattern in Vue wrappers (no zustand-vue adapter library)
- Replace single monolithic useGameStore() wrapper with curated focused hooks (e.g., useGameSession(), useCategories(), usePlayerActions())
- No backward-compatible useGameStore() — replace entirely with focused hooks
- All reactivity flows through Vue computed() bridge — no Zustand subscribe() for side effects
- Keep everything idiomatic Vue (use Vue watch() on computed values when side effects needed)

### Persistence

- Settings store: use zustand/persist middleware only — remove redundant manual loadSettings()/saveSettings() methods
- Game store: keep usePersistence() composable for IndexedDB (follows Phase 12 stateless composable pattern)
- Auto-migrate old Pinia localStorage data on first load — check for old key, migrate to new key, delete old key

### Test Migration

- Rewrite 4 test files for Zustand — remove setActivePinia(createPinia()) setup
- Use store.setState(initialState) in beforeEach for test isolation (reset between tests)
- Keep current test file organization (tests/unit/ with flat naming)
- Add one migration test for localStorage old-to-new data migration logic

### Claude's Discretion

- Exact naming of curated focused hooks (useGameSession vs useSession, etc.)
- How to structure the localStorage migration utility (inline vs separate file)
- Whether to consolidate the Nuxt plugin (plugins/zustand.ts) or remove it

</decisions>

<code_context>

## Existing Code Insights

### Reusable Assets

- `stores/zustand/gameStore.ts` (396 lines): Complete Zustand game store, mirrors Pinia store 1:1
- `stores/zustand/settingsStore.ts`: Full settings store with zustand/persist middleware
- `stores/zustand/loadingStore.ts`: Loading state store, already Zustand-native
- `stores/zustand/vueGameStore.ts`: Vue wrapper with computed() for all state/getters
- `stores/zustand/vueSettingsStore.ts`: Vue wrapper with computed() for all settings
- `stores/zustand/index.ts`: Barrel exports (useGameStore, useSettingsStore, useLoadingStore)
- `plugins/zustand.ts`: Nuxt plugin that initializes and provides Zustand stores

### Established Patterns

- Stateless composable pattern (Phase 12): composables receive mutable state, return pure functions — usePersistence(), usePlayerManager(), useCategoryManager(), etc.
- IndexedDB persistence via useIndexedDB() composable — stores for gameSession, gameHistory, statistics, leaderboard, settings
- Vue computed() wrapping pattern already implemented in vueGameStore.ts and vueSettingsStore.ts

### Integration Points

- **6 consumer files to update:** useGameState.ts, useGameActions.ts, useFeatureFlags.ts, SettingsModal.vue, DebugPanel.vue, settings.vue
- **4 test files to rewrite:** game-store.spec.ts, settings-store.spec.ts, current-player-index.spec.ts, reactivity-improvements.spec.ts
- **2 additional test files:** useGameActions.spec.ts, useGameState.spec.ts (use stores indirectly via composables)
- **nuxt.config.ts:** Remove @pinia/nuxt from modules array
- **package.json:** Remove pinia and @pinia/nuxt dependencies
- **app.vue:** May reference Pinia store initialization

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 19-move-from-pinia-to-zustand_
_Context gathered: 2026-03-17_
