# Technical Specification: Refactor Game App & Simplify Code and Tests

## Difficulty Assessment

**Hard** — This is a wide-scope refactoring task spanning stores, composables, components, pages, and tests. While individual changes are medium complexity, the breadth and the risk of regressions from touching core game logic (store, game page, answer checking) elevate it to hard. The dual legacy/multiplayer code paths are entangled across multiple layers, making safe removal the highest-risk area.

---

## Technical Context

- **Framework**: Nuxt 4 (SPA, `ssr: false`)
- **State Management**: Pinia (game store + settings store)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Styling**: UnoCSS + scoped SCSS
- **Language**: TypeScript (strict)
- **Package Manager**: pnpm 10.28.2
- **Key Dependencies**: `@nuxtjs/i18n`, `@nuxt/image`, `socket.io-client`, `vite-plugin-pwa`

---

## Scope: What Will Be Refactored

The following issues were identified and prioritized by impact vs. risk:

### HIGH Priority (significant complexity reduction, lower risk)

1. **Remove dead utility file** — `utils/sessionValidationDemo.ts` is a misplaced dev/test utility
2. **Unify `endGame()`/`completeGame()`** in `stores/game.ts` — near-duplicate functions
3. **Fix `redis` dependency placement** — move from `dependencies` to `devDependencies`
4. **Remove stub composable or implement it** — `useOptimizedImage.ts` does nothing but pretend to
5. **Standardize `console.log`** → `useLogger()` in `useWebSocket.ts`
6. **Add missing unit tests** for untested composables (`useAnswerCheck`, `useStatistics`, `useGameActions`)

### MEDIUM Priority (meaningful simplification, moderate risk)

7. **Consolidate dual modal implementations** — `GameModal.vue` wraps `Base/Modal.vue` but both are large; clarify the abstraction boundary
8. **Standardize asset/baseUrl usage** across all pages to `useAssets()` composable
9. **Extract sub-components from `pages/game/[[gameId]].vue`** — specifically the player answer form and player status list
10. **Split `SettingsModal.vue`** into audio settings + category filter sub-components

### LOW Priority (nice-to-have, higher risk if touching core logic)

11. **Remove legacy single-player code paths** from `stores/game.ts` — the `score`/`attempts` fields, `submitAttempt()`, `endGame()` (post-unification), and corresponding test cleanup
12. **Fix `filterProblematicPlugins` hack** in `nuxt.config.ts` — resolve the i18n circular dependency at source
13. **`useErrorSync.ts` IDB alignment** — make it use `useIndexedDB.ts` instead of its own `openDB` call

> **Note**: Items 11–13 are scoped OUT of this refactor unless explicitly approved. They carry architectural risk and may require dedicated investigation sessions. This spec focuses on items 1–10.

---

## Implementation Approach

### Guiding Principles

- **No behavior changes** — all refactoring must preserve existing runtime behavior exactly
- **Test alongside changes** — each step adds/updates tests; no step ends with reduced coverage
- **Run `pnpm run workspace:check` after every step**
- **Small, focused commits** — one logical change per commit

### Step Breakdown

The implementation is broken into 7 concrete, independently verifiable steps:

---

### Step 1: Quick Wins — Dead Code, Dependencies, Logging

**Files changed:**

- `apps/game/utils/sessionValidationDemo.ts` — **DELETE**
- `apps/game/package.json` — move `redis` to `devDependencies`
- `apps/game/composables/useWebSocket.ts` — replace `console.log` with `useLogger()`

**No interface changes.** No tests needed (deletion + config). Run `workspace:check` to verify no imports break.

---

### Step 2: Remove or Replace `useOptimizedImage.ts`

**Decision to make before implementing**: Does the project actually need image optimization via `@nuxt/image`?

- **Option A (Remove)**: Delete `composables/useOptimizedImage.ts`, audit all callers (likely 0 since it just returns the path unchanged), and remove the pretend optimization abstraction. Images continue to load as-is.
- **Option B (Implement)**: Replace the stub body with a real implementation using `useImage()` from `@nuxt/image`, leveraging the presets already configured in `nuxt.config.ts`.

**Recommended**: Option A (Remove). The `@nuxt/image` module is configured with presets, but none of the pages use `<NuxtImg>` or the composable in a meaningful way. Removing the stub eliminates false impression without changing runtime behavior.

**Files changed:**

- `apps/game/composables/useOptimizedImage.ts` — **DELETE**
- Any callers — audit and update (expected: 0–2 callers, all passthrough)

**Verification**: `grep -r "useOptimizedImage" apps/game/` before and after to confirm no dangling references.

---

### Step 3: Unify `endGame()` / `completeGame()` in Game Store

**Current state** (`stores/game.ts`):

```ts
// endGame() — lines ~257-276
async endGame() {
  if (!this.currentSession) return
  this.currentSession.status = 'ended'
  await this.saveSessionToDB()
  await this.saveHistoryToDB()
  await updateStatistics(this.currentSession)
  this.currentSession = null  // ← only difference
}

// completeGame() — lines ~278-299
async completeGame() {
  if (!this.currentSession) return
  this.currentSession.status = 'completed'
  await this.saveSessionToDB()
  await this.saveHistoryToDB()
  await updateStatistics(this.currentSession)
  // currentSession NOT cleared
}
```

**Target state**:

```ts
async finalizeGame(options: { status: 'ended' | 'completed'; clearSession?: boolean }) {
  if (!this.currentSession) return
  this.currentSession.status = options.status
  await this.saveSessionToDB()
  await this.saveHistoryToDB()
  await updateStatistics(this.currentSession)
  if (options.clearSession) this.currentSession = null
}
```

Keep `endGame()` and `completeGame()` as thin wrappers calling `finalizeGame()` to avoid breaking callsites across pages.

**Files changed:**

- `apps/game/stores/game.ts`
- `apps/game/tests/unit/game-store.spec.ts` — update tests to cover `finalizeGame` directly, keep wrapper tests

---

### Step 4: Standardize BaseUrl / Asset Usage

**Current state**: 3 competing patterns to get `baseUrl`:

1. `useRuntimeConfig().public.baseUrl` direct (in `pages/credits.vue`, `pages/players.vue`)
2. `usePageSetup().baseUrl` (in `pages/index.vue`, `pages/round-start.vue`)
3. `${runtimeConfig.public.baseUrl}` in template literals (in `pages/game/[[gameId]].vue`)

**Target state**: All pages that need asset URLs should use `useAssets()` composable which already handles baseUrl normalization correctly. Pages that just need navigation use `usePageSetup()`.

**Files changed:**

- `apps/game/pages/credits.vue` — switch to `useAssets()`
- `apps/game/pages/players.vue` — switch to `useAssets()` for any asset refs
- `apps/game/pages/game/[[gameId]].vue` — switch to `useAssets()` for asset refs
- `apps/game/composables/useAssets.ts` — add any missing helpers if needed

**Verification**: Visual/E2E test to confirm images still load (no broken asset paths).

---

### Step 5: Extract Sub-components from `pages/game/[[gameId]].vue`

The 912-line game page is the largest file. The script section has:

- Player answer submission form logic (~80 lines)
- Player status/score display list (~60 lines)
- Modal state for pause and quit

**Extract:**

1. **`components/game/PlayerAnswerInput.vue`** — the input field + submit button + answer state for the current player's turn. Props: `playerName`, `isDisabled`. Emits: `submit(answer: string)`.

2. **`components/game/PlayerStatusList.vue`** — the list of players showing who has answered, current score, and turn indicator. Props: `players: Player[]`, `currentPlayerIndex: number`.

**Files changed:**

- `apps/game/pages/game/[[gameId]].vue` — replace inline markup with new components
- `apps/game/components/game/PlayerAnswerInput.vue` — **CREATE**
- `apps/game/components/game/PlayerStatusList.vue` — **CREATE**

**Verification**: E2E test `game-complete-flow.spec.ts` must still pass.

---

### Step 6: Split `SettingsModal.vue`

The 511-line `SettingsModal.vue` mixes two distinct concerns:

- Audio controls (volume sliders for music/sound)
- Category filter toggles (which Wikipedia categories to include)

**Extract:**

1. **`components/settings/AudioSettings.vue`** — sliders only, emits volume changes
2. **`components/settings/CategoryFilter.vue`** — category toggle checkboxes

`SettingsModal.vue` becomes a thin orchestrator combining both sub-components via tabs or sections.

**Files changed:**

- `apps/game/components/SettingsModal.vue` — refactor to use sub-components
- `apps/game/components/settings/AudioSettings.vue` — **CREATE**
- `apps/game/components/settings/CategoryFilter.vue` — **CREATE**

---

### Step 7: Add Missing Unit Tests for Key Composables

The following composables have zero unit test coverage despite being core to game logic:

| Composable          | Lines | Why it matters                                                                      |
| ------------------- | ----- | ----------------------------------------------------------------------------------- |
| `useAnswerCheck.ts` | 157   | Core game logic — validates player answers, offline fallback                        |
| `useStatistics.ts`  | 225   | Saves leaderboard data, aggregates stats — currently has dead code for multi-player |
| `useGameActions.ts` | 142   | Wraps store + toast + audio — used throughout game page                             |

**New test files:**

- `apps/game/tests/unit/use-answer-check.spec.ts`
- `apps/game/tests/unit/use-statistics.spec.ts`
- `apps/game/tests/unit/use-game-actions.spec.ts`

Each test file should mock external dependencies (PetScan API, IndexedDB, audio) and focus on behavioral correctness.

---

## Data Model / API / Interface Changes

| Change                                                                           | Impact                                      |
| -------------------------------------------------------------------------------- | ------------------------------------------- |
| `finalizeGame()` added to game store                                             | Internal — no external interface change     |
| `useOptimizedImage` removed                                                      | Remove from exports/auto-imports if present |
| `PlayerAnswerInput`, `PlayerStatusList`, `AudioSettings`, `CategoryFilter` added | New components auto-imported by Nuxt        |
| `redis` moved to devDeps                                                         | Build/bundle only, no runtime change        |

---

## Verification Approach

After each step:

```bash
pnpm run workspace:check   # syncpack + typecheck + lint
pnpm run test:unit         # unit tests (apps/game)
```

After Steps 5 and 6 (component extraction):

```bash
pnpm run test:e2e          # Playwright E2E — game-complete-flow.spec.ts is the key test
```

Final full verification:

```bash
pnpm run workspace:check
pnpm run test:unit
pnpm run test:e2e
```

Coverage should not decrease — `pnpm run test:unit:coverage` threshold is 80% across all metrics.

---

## Files Summary

| Action | File                                                              |
| ------ | ----------------------------------------------------------------- |
| DELETE | `apps/game/utils/sessionValidationDemo.ts`                        |
| DELETE | `apps/game/composables/useOptimizedImage.ts`                      |
| MODIFY | `apps/game/package.json` (redis → devDeps)                        |
| MODIFY | `apps/game/composables/useWebSocket.ts` (console.log → useLogger) |
| MODIFY | `apps/game/stores/game.ts` (unify endGame/completeGame)           |
| MODIFY | `apps/game/tests/unit/game-store.spec.ts`                         |
| MODIFY | `apps/game/pages/credits.vue`                                     |
| MODIFY | `apps/game/pages/players.vue`                                     |
| MODIFY | `apps/game/pages/game/[[gameId]].vue`                             |
| MODIFY | `apps/game/composables/useAssets.ts` (if needed)                  |
| MODIFY | `apps/game/components/SettingsModal.vue`                          |
| CREATE | `apps/game/components/game/PlayerAnswerInput.vue`                 |
| CREATE | `apps/game/components/game/PlayerStatusList.vue`                  |
| CREATE | `apps/game/components/settings/AudioSettings.vue`                 |
| CREATE | `apps/game/components/settings/CategoryFilter.vue`                |
| CREATE | `apps/game/tests/unit/use-answer-check.spec.ts`                   |
| CREATE | `apps/game/tests/unit/use-statistics.spec.ts`                     |
| CREATE | `apps/game/tests/unit/use-game-actions.spec.ts`                   |
