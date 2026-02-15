# Technical Specification: Refactor Game App — Simplify Code and Tests

## Difficulty Assessment

**Medium-Hard**

This task spans multiple layers (pages, components, composables, stores, tests) with 120+ source files and 18+ unit test files. The risk is regression: many composables lack tests, so any refactoring must be paired with test coverage. Changes are primarily additive refinements (extract, simplify, deduplicate) rather than architectural rewrites, keeping risk manageable when done incrementally.

---

## Technical Context

| Item            | Detail                                       |
| --------------- | -------------------------------------------- |
| Framework       | Nuxt 4, SSR disabled (SPA)                   |
| Language        | TypeScript 5.x                               |
| State           | Pinia 2.x + IndexedDB (via `idb`)            |
| Component model | Vue 3 Composition API (`<script setup>`)     |
| Tests (unit)    | Vitest + happy-dom                           |
| Tests (e2e)     | Playwright (Desktop Chrome, Firefox, Mobile) |
| Linting         | ESLint 9 flat config, Prettier               |
| Build           | Turbo + Vite                                 |
| Package manager | pnpm 10.28.2                                 |

---

## Current State — Problems to Address

### 1. Oversized Pages (High Priority)

| File                        | Lines | Issue                                                             |
| --------------------------- | ----- | ----------------------------------------------------------------- |
| `pages/game/[[gameId]].vue` | 912   | Game loop, multiplayer state, modals, form handling all mixed     |
| `pages/round-start.vue`     | 627   | Fortune wheel, category/letter selection, player order all in one |
| `pages/players.vue`         | 432   | Player form, avatar selection, game setup in one file             |

### 2. Oversized Components (High Priority)

| File                                  | Lines | Issue                                          |
| ------------------------------------- | ----- | ---------------------------------------------- |
| `components/StoryboardDevOverlay.vue` | 529   | Dev-only overlay with mixed concerns           |
| `components/FortuneWheel.vue`         | 512   | Animation + rendering + business logic coupled |
| `components/SettingsModal.vue`        | 511   | All settings in one flat component             |
| `components/GameHistory.vue`          | 449   | History list + filtering + details             |
| `components/PlayerLeaderboard.vue`    | 446   | Leaderboard + animations + score calculation   |

### 3. Monolithic Composables (High Priority)

| File                            | Lines | Issue                                                                             |
| ------------------------------- | ----- | --------------------------------------------------------------------------------- |
| `composables/useIndexedDB.ts`   | 295   | Handles 5 unrelated DB concerns (sessions, history, stats, leaderboard, settings) |
| `composables/usePerformance.ts` | 258   | Metric aggregation + navigation timing + resource timing                          |
| `composables/useWebSocket.ts`   | 245   | Connection + events + data sync                                                   |
| `composables/useAudio.ts`       | 237   | Context init + tone gen + volume management                                       |
| `composables/useErrorSync.ts`   | 230   | Error format + CloudWatch + queue                                                 |
| `composables/useForm.ts`        | 226   | Validation rules + field state + error handling                                   |

### 4. Game Store God-Object (Medium Priority)

| File             | Lines | Issue                                                                               |
| ---------------- | ----- | ----------------------------------------------------------------------------------- |
| `stores/game.ts` | 555   | Dual-mode (single-player legacy + multiplayer) in one store, 22 actions, 19 getters |

### 5. Missing Test Coverage (High Priority)

Composables with **zero unit tests**:

- `useIndexedDB`, `usePerformance`, `useWebSocket`, `useAudio`, `useErrorSync`
- `useStatistics`, `useAnalytics`, `useGameState`, `useGameActions`

Oversized unit test files that are hard to navigate:

- `game-store.spec.ts` (1,249 lines)
- `use-lodash.spec.ts` (563 lines)
- `use-form.spec.ts` (544 lines)

### 6. Code Quality Issues (Medium Priority)

- Magic numbers for animation durations scattered through pages/components
- Repeated error handling patterns across composables
- Direct `localStorage` access in some stores (should use `useLocalStorage` composable)
- `setTimeout`/`setInterval` calls without guaranteed cleanup (memory leak risk)

---

## Implementation Approach

The refactoring follows the **strangler fig pattern**: rather than rewriting from scratch, we extract sub-units and replace in place. Each step must leave the app in a working, lint-passing, type-safe state.

**Key principles:**

1. **Tests first for untested composables** — add tests before touching the code
2. **Extract, don't rewrite** — prefer moving code to new files over rewriting logic
3. **One concern per step** — each implementation step targets a single file or logical unit
4. **Verify after each step** — `pnpm run workspace:check` after every logical change

---

## Source Code Changes

### Files to CREATE (new extractions)

#### Composable Splits

- `composables/useGameSessionDB.ts` — extracted from `useIndexedDB.ts` (session CRUD)
- `composables/useGameHistoryDB.ts` — extracted from `useIndexedDB.ts` (history CRUD)
- `composables/useStatisticsDB.ts` — extracted from `useIndexedDB.ts` (statistics CRUD)
- `composables/useLeaderboardDB.ts` — extracted from `useIndexedDB.ts` (leaderboard CRUD)

#### New Constants

- `apps/game/utils/animation-constants.ts` — extract magic animation durations

#### New Tests (for currently untested composables)

- `tests/unit/use-indexed-db.spec.ts`
- `tests/unit/use-game-state.spec.ts`
- `tests/unit/use-game-actions.spec.ts`
- `tests/unit/use-statistics.spec.ts`

### Files to MODIFY (simplifications)

#### Composables

- `composables/useIndexedDB.ts` — reduce to DB init + shared `getDB()` only; delegate to domain composables
- `composables/useForm.ts` — extract validation rules to a `validators.ts` utility; reduce to ~150 lines
- `composables/useGameActions.ts` — remove any direct store mutations that duplicate store actions

#### Stores

- `stores/game.ts` — remove legacy single-player shims (getters marked `// Legacy support`), reduce to ~400 lines

#### Pages (extract sub-components)

- `pages/game/[[gameId]].vue` — extract `GameAnswerForm.vue` component; target < 600 lines
- `pages/round-start.vue` — extract `RoundSetupControls.vue`; target < 400 lines

#### Test Files (split)

- `tests/unit/game-store.spec.ts` — split into `game-store-session.spec.ts`, `game-store-multiplayer.spec.ts`, `game-store-categories.spec.ts`

### Files to KEEP AS-IS

- `stores/settings.ts` — already clean at 130 lines
- `composables/useLogger.ts` — clean, simple
- `composables/useNavigation.ts` — acceptable size
- All `packages/` — out of scope
- E2E test files — not in refactor scope (unless a helper is clearly redundant)

---

## Data Model / API / Interface Changes

**No breaking changes to public interfaces.**

- The `useIndexedDB` composable will maintain its current exported API (`saveSessionToDB`, `loadSessionFromDB`, etc.) — it will internally delegate to the new domain composables. This preserves all existing call sites in `stores/game.ts`.
- Removing legacy getters from the game store (`currentScore`, `currentAttempts`) requires a search for all call sites first. If used in template or component code, they will be kept as simple aliases pointing to the multiplayer equivalent.
- `GameAnswerForm.vue` and `RoundSetupControls.vue` will receive props from their parent pages via clearly typed interfaces — no new store dependencies introduced.

---

## Verification Approach

After each implementation step:

```bash
# Type safety
pnpm run typecheck

# Linting
pnpm run lint

# Unit tests
pnpm run test:unit

# Full workspace check (combines the above via Turbo)
pnpm run workspace:check
```

Before marking the task complete:

```bash
# Full end-to-end check
pnpm run test:e2e
```

Coverage thresholds (must stay above):

- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

---

## Risk Considerations

| Risk                                                | Mitigation                                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Breaking call sites when splitting `useIndexedDB`   | Keep original export shape; delegate internally                                    |
| Legacy single-player getters still used somewhere   | `grep` all call sites before removing                                              |
| New component extractions break template reactivity | Keep extracted components as thin presentation wrappers; don't move reactive state |
| Test splits miss edge cases                         | Each split test file must cover all scenarios from the original                    |
| Animation magic numbers differ from actual values   | Extract constants from existing code, don't guess                                  |
