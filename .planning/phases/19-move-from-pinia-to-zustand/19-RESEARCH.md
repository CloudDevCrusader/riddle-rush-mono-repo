# Phase 19: Move from Pinia to Zustand - Research

**Researched:** 2026-03-17
**Domain:** State management migration (Pinia -> Zustand) in Nuxt 4 SPA
**Confidence:** HIGH

## Summary

This phase completes a migration that is already 80% done. Parallel Zustand stores exist in `stores/zustand/` that mirror the Pinia stores 1:1. Vue wrapper layers (`vueGameStore.ts`, `vueSettingsStore.ts`) provide computed() reactivity bridges. The remaining work is: (1) swap consumer imports to Zustand wrappers, (2) remove Pinia entirely, (3) flatten the `stores/zustand/` directory, (4) rewrite tests, and (5) add localStorage migration for settings.

The migration is low-risk because the Zustand stores are already written and the Vue wrapper pattern isolates consumers from the underlying store library. Consumers use Nuxt auto-imports, so the cutover is primarily about replacing which files live at `stores/game.ts` and `stores/settings.ts`.

**Primary recommendation:** Delete old Pinia store files, move Zustand files up to `stores/`, split the monolithic `vueGameStore.ts` wrapper into focused hooks, remove `@pinia/nuxt` from nuxt.config.ts and package.json, and rewrite the 5 Pinia-dependent test files to use `store.setState()` for isolation.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Big-bang swap -- all 6 consumer files updated in one go (not gradual per-store)
- Full Pinia removal -- uninstall packages, remove from nuxt.config.ts modules, delete old store files
- Move Zustand files from `stores/zustand/` up to `stores/` (remove nesting after Pinia is gone)
- Vue wrappers are the public API -- consumers never import raw Zustand stores directly
- Keep explicit computed() wrapping pattern in Vue wrappers (no zustand-vue adapter library)
- Replace single monolithic useGameStore() wrapper with curated focused hooks (e.g., useGameSession(), useCategories(), usePlayerActions())
- No backward-compatible useGameStore() -- replace entirely with focused hooks
- All reactivity flows through Vue computed() bridge -- no Zustand subscribe() for side effects
- Keep everything idiomatic Vue (use Vue watch() on computed values when side effects needed)
- Settings store: use zustand/persist middleware only -- remove redundant manual loadSettings()/saveSettings() methods
- Game store: keep usePersistence() composable for IndexedDB (follows Phase 12 stateless composable pattern)
- Auto-migrate old Pinia localStorage data on first load -- check for old key, migrate to new key, delete old key
- Rewrite 4 test files for Zustand -- remove setActivePinia(createPinia()) setup
- Use store.setState(initialState) in beforeEach for test isolation (reset between tests)
- Keep current test file organization (tests/unit/ with flat naming)
- Add one migration test for localStorage old-to-new data migration logic

### Claude's Discretion

- Exact naming of curated focused hooks (useGameSession vs useSession, etc.)
- How to structure the localStorage migration utility (inline vs separate file)
- Whether to consolidate the Nuxt plugin (plugins/zustand.ts) or remove it

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core

| Library            | Version   | Purpose                          | Why Standard                                                  |
| ------------------ | --------- | -------------------------------- | ------------------------------------------------------------- |
| zustand            | ^5.0.12   | State management                 | Already installed in project, framework-agnostic, tiny bundle |
| zustand/middleware | (bundled) | persist middleware for settings  | Built-in, handles localStorage serialization                  |
| vue                | 3.x       | Reactivity bridge via computed() | Already the framework                                         |

### Supporting

| Library             | Version   | Purpose                                            | When to Use                |
| ------------------- | --------- | -------------------------------------------------- | -------------------------- |
| @riddle-rush/types  | workspace | Type definitions for GameState, GameSession, etc.  | All store type annotations |
| @riddle-rush/shared | workspace | Constants (ALPHABET, DEFAULT_DISPLAYED_CATEGORIES) | Store initial state        |

### Packages to REMOVE

| Package       | Where                        | Why                 |
| ------------- | ---------------------------- | ------------------- |
| `@pinia/nuxt` | `apps/game/package.json`     | Replaced by Zustand |
| `pinia`       | transitive via `@pinia/nuxt` | No longer needed    |

**Note:** `pinia` is not listed as a direct dependency -- it comes through `@pinia/nuxt`. Removing `@pinia/nuxt` removes both.

**Uninstall command:**

```bash
cd apps/game && pnpm remove @pinia/nuxt
```

## Architecture Patterns

### Current File Layout (Before)

```
stores/
  game.ts              # Pinia game store (344 lines) -- DELETE
  settings.ts          # Pinia settings store (138 lines) -- DELETE
  zustand/
    gameStore.ts       # Zustand raw game store (396 lines) -- MOVE UP
    settingsStore.ts   # Zustand raw settings store (220 lines) -- MOVE UP
    loadingStore.ts    # Zustand loading store (62 lines) -- MOVE UP
    vueGameStore.ts    # Vue wrapper (65 lines) -- SPLIT into focused hooks
    vueSettingsStore.ts # Vue wrapper (48 lines) -- MOVE UP
    index.ts           # Barrel exports -- REWRITE
composables/
  useLoading.ts        # Pinia loading store + composable -- DELETE (replaced by zustand/loadingStore.ts)
plugins/
  zustand.ts           # Zustand init plugin -- EVALUATE (keep or remove)
  error-sync.client.ts # Has Pinia error handler -- CLEAN UP
```

### Target File Layout (After)

```
stores/
  gameStore.ts         # Zustand raw game store
  settingsStore.ts     # Zustand raw settings store (with persist middleware ONLY)
  loadingStore.ts      # Zustand loading store + useLoading() composable
  hooks/
    useGameSession.ts  # Vue wrapper: session state + lifecycle actions
    useCategories.ts   # Vue wrapper: category state + actions
    usePlayerActions.ts # Vue wrapper: player state + multiplayer actions
    useInstallPrompt.ts # Vue wrapper: PWA install prompt state
    useSettings.ts     # Vue wrapper: all settings state + actions
    useLoading.ts      # Vue wrapper: loading state (or keep in loadingStore.ts)
  index.ts             # Barrel exports for all hooks
  migrate.ts           # One-time localStorage migration utility
```

### Pattern 1: Focused Vue Wrapper Hook

**What:** Each hook wraps a subset of the raw Zustand store with Vue computed() reactivity.
**When to use:** Every consumer that needs reactive store state in Vue templates.
**Example:**

```typescript
// stores/hooks/useGameSession.ts
import { gameStore } from '../gameStore'
import { computed } from 'vue'

export function useGameSession() {
  const store = gameStore

  return {
    // Reactive state
    currentSession: computed(() => store.getState().currentSession),
    hasActiveSession: computed(() => store.getState().currentSession !== null),
    isGameCompleted: computed(() => store.getState().currentSession?.status === 'completed'),
    gameStatus: computed(() => store.getState().currentSession?.status ?? 'active'),
    currentRound: computed(() => store.getState().currentSession?.currentRound ?? 0),

    // Actions (not wrapped in computed -- they're stable references)
    resumeOrStartNewGame: store.getState().resumeOrStartNewGame,
    startNewGame: store.getState().startNewGame,
    endGame: store.getState().endGame,
    completeGame: store.getState().completeGame,
    abandonGame: store.getState().abandonGame,
    clearSession: store.getState().clearSession,
    loadFromDB: store.getState().loadFromDB,
    saveSessionToDB: store.getState().saveSessionToDB,
    loadSessionById: store.getState().loadSessionById,
  }
}
```

### Pattern 2: Zustand + Vue Reactivity Bridge

**What:** Zustand stores are not reactive in Vue by default. The bridge uses `computed()` that calls `store.getState()` to read current state. For reactivity to work, the computed must be triggered to re-evaluate.
**Critical insight:** The existing `vueGameStore.ts` calls `useZustandGameStore()` which in Zustand v5 returns the CURRENT state snapshot (not a reactive proxy). This means the current Vue wrappers may NOT be reactive -- computed values would capture a stale snapshot.

**Correct pattern for Zustand v5 + Vue reactivity:**

```typescript
import { computed, ref, onScopeDispose } from 'vue'
import { gameStore } from '../gameStore'

// Option A: Subscribe to store changes and trigger Vue reactivity
export function useGameSession() {
  const version = ref(0)

  // Subscribe to ALL store changes
  const unsubscribe = gameStore.subscribe(() => {
    version.value++
  })

  // Cleanup on scope disposal
  onScopeDispose(() => unsubscribe())

  return {
    currentSession: computed(() => {
      void version.value // reactive dependency
      return gameStore.getState().currentSession
    }),
    // ... more computed properties
  }
}
```

**This is the MOST IMPORTANT technical detail for this migration.** The existing `vueGameStore.ts` pattern of `const store = useZustandGameStore()` followed by `computed(() => store.currentSession)` will NOT update reactively because `store` is a plain object snapshot, not a reactive proxy.

### Pattern 3: Settings Store with persist-only Middleware

**What:** Use `zustand/persist` as the sole persistence mechanism -- remove manual `loadSettings()`/`saveSettings()`.
**Example:**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const settingsStore = create<GameSettings>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      // Actions just set() -- persist middleware handles storage automatically
      updateSetting: (key, value) => set({ [key]: value }),
      toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),
      resetToDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'game-settings', // localStorage key
      partialize: (state) => {
        // Exclude actions from serialization
        const { updateSetting, toggleDebugMode, ...data } = state
        return data
      },
    }
  )
)
```

### Pattern 4: Test Isolation with setState

**What:** Zustand stores are singletons. Tests must reset state between runs.
**Example:**

```typescript
import { beforeEach } from 'vitest'
import { gameStore } from '../../stores/gameStore'

const initialState = gameStore.getState()

beforeEach(() => {
  // Reset to initial state (preserves action functions)
  gameStore.setState(initialState, true) // true = replace (not merge)
})
```

### Anti-Patterns to Avoid

- **Importing raw Zustand stores in Vue components:** Always use the Vue wrapper hooks. Raw stores return plain objects that are not Vue-reactive.
- **Using Zustand subscribe() for side effects in components:** Use Vue `watch()` on the computed values from hooks instead. Keeps everything in Vue's reactivity system.
- **Wrapping actions in computed():** Actions are stable function references -- wrapping them in computed() adds unnecessary overhead.
- **Calling useZustandStore() inside computed():** This creates a new subscription on every evaluation. Call it once, subscribe, and use getState().

## Don't Hand-Roll

| Problem                  | Don't Build              | Use Instead                       | Why                                                              |
| ------------------------ | ------------------------ | --------------------------------- | ---------------------------------------------------------------- |
| localStorage persistence | Manual save/load methods | zustand/persist middleware        | Handles serialization, rehydration, key management automatically |
| State reset for tests    | Custom reset functions   | store.setState(initial, true)     | Built into Zustand, replaces Pinia's $reset()                    |
| Zustand-Vue reactivity   | Custom reactive proxy    | subscribe() + ref version counter | Simple, proven pattern; avoids complex proxy wrapping            |

## Common Pitfalls

### Pitfall 1: Stale State in Vue Computed

**What goes wrong:** `computed(() => store.someProperty)` never updates because `store` is a snapshot, not reactive.
**Why it happens:** Zustand's `useStore()` hook is designed for React. In Vue, `store.getState()` returns a plain object -- Vue has no way to know it changed.
**How to avoid:** Use the subscribe+version pattern: subscribe to the Zustand store, increment a Vue ref, and reference that ref inside every computed.
**Warning signs:** UI does not update after store actions execute.

### Pitfall 2: Pinia Auto-Import Conflicts

**What goes wrong:** After moving files, Nuxt auto-imports resolve to the wrong `useGameStore`.
**Why it happens:** Nuxt scans `stores/` and `composables/` directories. If both export `useGameStore`, the resolution is ambiguous.
**How to avoid:** After deleting Pinia stores, ensure only one export of each name exists. The focused hooks (useGameSession, useCategories, etc.) avoid this entirely since they have unique names.
**Warning signs:** TypeScript errors about mismatched types, or runtime errors about Pinia not being initialized.

### Pitfall 3: Settings Data Loss During Migration

**What goes wrong:** Users lose their settings when Zustand persist uses a different localStorage key format.
**Why it happens:** Zustand persist wraps the data in a `{ state: ..., version: 0 }` envelope. Old Pinia data is stored as a flat JSON object under key `game-settings`.
**How to avoid:** Implement one-time migration: on app load, check for old-format data, convert it, store in new format, delete old key. The zustand/persist middleware stores data as `{"state":{...},"version":0}` under the same key name.
**Warning signs:** Settings reset to defaults after migration.

**IMPORTANT:** Both old Pinia store and new Zustand store use the SAME localStorage key: `game-settings`. The difference is the data envelope format. Pinia stores flat `{maxPlayersPerGame: 4, ...}`. Zustand persist stores `{state: {maxPlayersPerGame: 4, ...}, version: 0}`. Since the existing Zustand settingsStore ALREADY has both manual `loadSettings()` AND persist middleware, there may already be a conflict. The migration needs to handle this carefully.

### Pitfall 4: Nuxt Plugin Order After Removing @pinia/nuxt

**What goes wrong:** Other plugins that depended on Pinia being available fail.
**Why it happens:** `@pinia/nuxt` module registered Pinia as a Nuxt plugin. The `error-sync.client.ts` plugin accesses `nuxtApp.$pinia`.
**How to avoid:** Remove the Pinia error handler from `error-sync.client.ts`. The `plugins/zustand.ts` plugin handles Zustand initialization.
**Warning signs:** Runtime errors about `$pinia` being undefined.

### Pitfall 5: Test Files Still Importing from Old Paths

**What goes wrong:** Tests import from `../../stores/game` which no longer exports a Pinia store.
**Why it happens:** The 4 test files have explicit imports pointing to the old Pinia store files.
**How to avoid:** Update all test imports to point to the new Zustand store files. Use `store.setState()` instead of `setActivePinia(createPinia())`.
**Warning signs:** Import errors or "defineStore is not a function" errors in tests.

### Pitfall 6: composables/useLoading.ts Pinia Store Conflict

**What goes wrong:** There are TWO loading stores: `composables/useLoading.ts` (Pinia) and `stores/zustand/loadingStore.ts` (Zustand). Both export `useLoadingStore` and `useLoading`.
**Why it happens:** The Zustand loading store was added alongside the Pinia one.
**How to avoid:** Delete `composables/useLoading.ts` entirely. Move the Zustand version to `stores/loadingStore.ts`. Update any imports.
**Warning signs:** Auto-import ambiguity, tests importing wrong store.

## Code Examples

### Consumer Migration: useGameState.ts (Before -> After)

**Before (using Pinia auto-import):**

```typescript
export function useGameState() {
  const gameStore = useGameStore() // Pinia auto-import
  const settingsStore = useSettingsStore() // Pinia auto-import

  const currentCategory = computed(() => gameStore.currentCategory)
  // ...
}
```

**After (using focused Zustand hooks):**

```typescript
export function useGameState() {
  const {
    currentSession,
    currentCategory,
    currentLetter,
    currentRound,
    players,
    currentPlayerTurn,
    allPlayersSubmitted,
    isGameCompleted,
    leaderboard,
    hasActiveSession,
    gameStatus,
  } = useGameSession()
  const settings = useSettings()

  return {
    settings,
    currentSession,
    currentCategory,
    currentLetter,
    currentRound,
    players,
    currentPlayerTurn,
    allPlayersSubmitted,
    isGameCompleted,
    leaderboard,
    hasActiveSession,
    gameStatus,
  }
}
```

### Test Migration Pattern (Before -> After)

**Before (Pinia):**

```typescript
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../stores/game'

beforeEach(() => {
  setActivePinia(createPinia())
  const store = useGameStore()
  // ...
})
```

**After (Zustand):**

```typescript
import { gameStore } from '../../stores/gameStore'

const initialState = gameStore.getInitialState()

beforeEach(() => {
  gameStore.setState(initialState, true)
})
```

### localStorage Migration Utility

```typescript
// stores/migrate.ts
const OLD_SETTINGS_KEY = 'game-settings'

export function migrateFromPinia(): void {
  if (typeof window === 'undefined') return

  try {
    const raw = localStorage.getItem(OLD_SETTINGS_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw)

    // Zustand persist format has { state: ..., version: ... }
    // Old Pinia format is flat { maxPlayersPerGame: 4, ... }
    if (parsed && !('state' in parsed && 'version' in parsed)) {
      // Old format detected -- wrap in Zustand persist envelope
      const zustandFormat = { state: parsed, version: 0 }
      localStorage.setItem(OLD_SETTINGS_KEY, JSON.stringify(zustandFormat))
    }
  } catch {
    // If migration fails, zustand/persist will use defaults
    localStorage.removeItem(OLD_SETTINGS_KEY)
  }
}
```

### nuxt.config.ts Cleanup

```typescript
// REMOVE from modules array:
// '@pinia/nuxt',

// REMOVE from typescript.tsConfig.compilerOptions.types:
// '@pinia/nuxt'

// UPDATE module comment:
modules: [
  '@nuxtjs/i18n', // Load i18n early
  '@unocss/nuxt', // UnoCSS
  '@vite-pwa/nuxt',
  // ... rest unchanged
]
```

## Inventory of All Changes Required

### Files to DELETE

| File                        | Reason                                |
| --------------------------- | ------------------------------------- |
| `stores/game.ts`            | Replaced by `stores/gameStore.ts`     |
| `stores/settings.ts`        | Replaced by `stores/settingsStore.ts` |
| `composables/useLoading.ts` | Replaced by `stores/loadingStore.ts`  |

### Files to MOVE (from stores/zustand/ to stores/)

| Source                            | Destination               |
| --------------------------------- | ------------------------- |
| `stores/zustand/gameStore.ts`     | `stores/gameStore.ts`     |
| `stores/zustand/settingsStore.ts` | `stores/settingsStore.ts` |
| `stores/zustand/loadingStore.ts`  | `stores/loadingStore.ts`  |

### Files to SPLIT/REWRITE

| File                                 | Action                                      |
| ------------------------------------ | ------------------------------------------- |
| `stores/zustand/vueGameStore.ts`     | Split into focused hooks in `stores/hooks/` |
| `stores/zustand/vueSettingsStore.ts` | Rewrite as `stores/hooks/useSettings.ts`    |
| `stores/zustand/index.ts`            | Rewrite barrel exports                      |

### Files to MODIFY

| File                             | Changes                                                             |
| -------------------------------- | ------------------------------------------------------------------- |
| `nuxt.config.ts`                 | Remove `@pinia/nuxt` from modules and types                         |
| `package.json`                   | Remove `@pinia/nuxt` dependency                                     |
| `plugins/error-sync.client.ts`   | Remove Pinia error handler (lines 75-94), remove Pinia type import  |
| `plugins/zustand.ts`             | Evaluate: keep for migration init, or inline into app.vue           |
| `plugins/i18n.client.ts`         | Update `useSettingsStore()` to use new hook (e.g., `useSettings()`) |
| `app.vue`                        | Update from `useGameStore()`/`useSettingsStore()` to focused hooks  |
| `composables/useGameState.ts`    | Update to use focused hooks                                         |
| `composables/useGameActions.ts`  | Update to use focused hooks                                         |
| `composables/useFeatureFlags.ts` | Update `useSettingsStore()` to new hook                             |
| `components/SettingsModal.vue`   | Update `useSettingsStore()` to new hook                             |
| `components/DebugPanel.vue`      | Update both store imports to new hooks                              |
| `pages/settings.vue`             | Update `useSettingsStore()` to new hook                             |
| `components/GlobalLoading.vue`   | Verify `useLoading()` resolves to Zustand version                   |

### Files to CREATE

| File                               | Purpose                            |
| ---------------------------------- | ---------------------------------- |
| `stores/hooks/useGameSession.ts`   | Session state + lifecycle actions  |
| `stores/hooks/useCategories.ts`    | Category state + actions           |
| `stores/hooks/usePlayerActions.ts` | Player state + multiplayer actions |
| `stores/hooks/useInstallPrompt.ts` | PWA install prompt state           |
| `stores/hooks/useSettings.ts`      | All settings state + actions       |
| `stores/hooks/index.ts`            | Barrel exports                     |
| `stores/migrate.ts`                | One-time localStorage migration    |

### Test Files to REWRITE

| File                                          | Changes                                                 |
| --------------------------------------------- | ------------------------------------------------------- |
| `tests/unit/game-store.spec.ts`               | Import from Zustand, use setState(), remove Pinia setup |
| `tests/unit/settings-store.spec.ts`           | Import from Zustand, use setState(), remove Pinia setup |
| `tests/unit/current-player-index.spec.ts`     | Import from Zustand, use setState(), remove Pinia setup |
| `tests/unit/reactivity-improvements.spec.ts`  | Import from Zustand, use setState(), remove Pinia setup |
| `tests/unit/use-loading.spec.ts`              | Import from Zustand loadingStore, remove Pinia setup    |
| `tests/unit/use-feature-flags.spec.ts`        | Update mock to match new hook API                       |
| (NEW) `tests/unit/settings-migration.spec.ts` | Test localStorage migration logic                       |

## State of the Art

| Old Approach                      | Current Approach                          | When Changed                 | Impact                              |
| --------------------------------- | ----------------------------------------- | ---------------------------- | ----------------------------------- |
| Pinia Options API stores          | Zustand create() with slices              | Already done in this project | Simpler, no framework coupling      |
| Pinia $reset() for test isolation | Zustand setState(initial, true)           | Zustand v4+                  | Cleaner test setup                  |
| Pinia getters (auto-reactive)     | Zustand getState() + Vue subscribe bridge | Migration-specific           | Requires explicit reactivity bridge |
| Manual loadSettings/saveSettings  | zustand/persist middleware                | Zustand built-in             | Less code, automatic rehydration    |

## Open Questions

1. **Zustand subscribe() reactivity pattern verification**
   - What we know: The existing `vueGameStore.ts` pattern (`const store = useZustandGameStore()` then `computed(() => store.currentSession)`) may not be reactive because `store` is a snapshot.
   - What's unclear: Whether Zustand v5's `useStore()` hook actually returns a reactive proxy in a non-React context, or always returns a plain snapshot.
   - Recommendation: Test the existing pattern first. If reactivity works (it may due to JavaScript property access on the store object being proxied), keep it simple. If not, implement the subscribe+version pattern. **Priority: verify this before writing all hooks.**

2. **Nuxt auto-import resolution after file moves**
   - What we know: Nuxt auto-imports from `stores/` and `composables/` directories. The focused hooks in `stores/hooks/` may or may not be auto-imported.
   - What's unclear: Whether Nuxt scans subdirectories of `stores/` for auto-imports.
   - Recommendation: If `stores/hooks/` is not auto-imported, either configure it in nuxt.config.ts `imports.dirs` or place hooks directly in `composables/` directory.

3. **Zustand plugin necessity**
   - What we know: `plugins/zustand.ts` currently initializes stores and loads settings.
   - What's unclear: Whether this is needed once zustand/persist handles settings auto-rehydration.
   - Recommendation: The persist middleware auto-rehydrates on first `getState()` call, so the plugin may be unnecessary. However, keep it if we need the migration utility to run before any store access.

## Validation Architecture

### Test Framework

| Property           | Value                                |
| ------------------ | ------------------------------------ |
| Framework          | Vitest 3.x with happy-dom            |
| Config file        | `apps/game/vitest.config.ts`         |
| Quick run command  | `cd apps/game && pnpm run test:unit` |
| Full suite command | `pnpm run test:unit` (via Turbo)     |

### Phase Requirements -> Test Map

| Req ID     | Behavior                                      | Test Type | Automated Command                                                            | File Exists?   |
| ---------- | --------------------------------------------- | --------- | ---------------------------------------------------------------------------- | -------------- |
| MIGRATE-01 | Game store state/actions work via Zustand     | unit      | `cd apps/game && pnpm vitest run tests/unit/game-store.spec.ts`              | Rewrite needed |
| MIGRATE-02 | Settings store state/actions work via Zustand | unit      | `cd apps/game && pnpm vitest run tests/unit/settings-store.spec.ts`          | Rewrite needed |
| MIGRATE-03 | Current player index logic works              | unit      | `cd apps/game && pnpm vitest run tests/unit/current-player-index.spec.ts`    | Rewrite needed |
| MIGRATE-04 | Reactivity improvements preserved             | unit      | `cd apps/game && pnpm vitest run tests/unit/reactivity-improvements.spec.ts` | Rewrite needed |
| MIGRATE-05 | Loading store works via Zustand               | unit      | `cd apps/game && pnpm vitest run tests/unit/use-loading.spec.ts`             | Rewrite needed |
| MIGRATE-06 | localStorage migration from Pinia format      | unit      | `cd apps/game && pnpm vitest run tests/unit/settings-migration.spec.ts`      | Wave 0         |
| MIGRATE-07 | Feature flags work with new settings hook     | unit      | `cd apps/game && pnpm vitest run tests/unit/use-feature-flags.spec.ts`       | Update needed  |

### Sampling Rate

- **Per task commit:** `cd apps/game && pnpm run test:unit`
- **Per wave merge:** `pnpm run workspace:check && pnpm run test:unit`
- **Phase gate:** Full suite green + `pnpm run workspace:check` before verify

### Wave 0 Gaps

- [ ] `tests/unit/settings-migration.spec.ts` -- covers MIGRATE-06 (new file)
- All other test files exist but need rewriting (not Wave 0 gaps)

## Sources

### Primary (HIGH confidence)

- Project codebase inspection: `stores/`, `stores/zustand/`, `composables/`, `plugins/`, `tests/unit/`, `nuxt.config.ts`, `package.json`, `app.vue`
- CONTEXT.md: User decisions and locked implementation strategy

### Secondary (MEDIUM confidence)

- Zustand v5 API: `create()`, `getState()`, `setState()`, `subscribe()`, `persist` middleware -- based on Zustand v5 docs and training data
- Nuxt auto-import behavior for `stores/` subdirectories -- based on Nuxt 4 conventions

### Tertiary (LOW confidence)

- Zustand v5 `useStore()` behavior outside React (whether it returns reactive proxy or snapshot) -- needs runtime verification

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - all libraries already installed and in use
- Architecture: HIGH - existing Zustand stores provide clear migration target
- Pitfalls: HIGH - identified through direct code inspection of both old and new stores
- Reactivity bridge: MEDIUM - the subscribe+version pattern is well-known but the existing wrapper's actual behavior in Zustand v5 + Vue needs verification

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable domain, no fast-moving dependencies)
