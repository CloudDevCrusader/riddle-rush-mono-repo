---
phase: 20-revert-zustand-to-pinia
plan: 03
status: completed
commit: f4cbfbe38
duration: ~20min
files_changed: 5
---

# 20-03 Summary: E2E Helper Migration and Cleanup

## Objective

Update E2E test helpers to use `window.__pinia_stores__` (exposed by `pinia.client.ts`) instead of the removed `window.__zustand__` bridge. Remove debug spec files created during troubleshooting.

## What Was Done

### `apps/game/tests/e2e/helpers/game-flow.ts`

All `window.__zustand__` accesses replaced with `window.__pinia_stores__`:

| Location                              | Old pattern                                                | New pattern                                      |
| ------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `submitPlayerAnswers` beforeState     | `__zustand__.game.getState().currentSession`               | `__pinia_stores__.game.currentSession`           |
| `submitPlayerAnswers` afterState poll | same                                                       | same                                             |
| `navigateToResults` resolvedGameId    | `getState().loadFromDB()` / `getState().currentSession.id` | `store.loadFromDB()` / `store.currentSession.id` |
| `setupMultiplayerGame` clearSession   | `getState().clearSession()`                                | `store.clearSession()`                           |
| `setupMultiplayerGame` snapshot poll  | `getState().currentSession.*`                              | `store.currentSession.*`                         |

Added typed window interfaces to eliminate all `any` casts:

- `NuxtWindow` — window with optional `__NUXT_DEVTOOLS__` and `__NUXT__` properties
- `PiniaWindow` — window with `__pinia_stores__?: { game?: E2EPiniaGameStore }`
- `E2EPlayer`, `E2EGameSession`, `E2EPiniaGameStore` — typed shapes for browser-context store access

Also fixed `hideDevtools` to use `NuxtWindow` cast instead of `as any`.

### Deleted debug spec files

- `apps/game/tests/e2e/debug-console.spec.ts`
- `apps/game/tests/e2e/debug-flow-state.spec.ts`
- `apps/game/tests/e2e/debug-game-flow.spec.ts`
- `apps/game/tests/e2e/debug-players.spec.ts`

These were created during Phase 19-20 troubleshooting and are no longer needed.

## Key Decisions

- Pinia stores expose state as direct reactive properties (no `.getState()` call needed), simplifying all evaluate callbacks significantly.
- `__pinia_stores__` is set in `pinia.client.ts` — this bridge is intentional for E2E testing only, not used in production paths.
- `NuxtWindow.__NUXT_DEVTOOLS__` made optional (`?`) to satisfy TypeScript's cast overlap requirement.

## Verification

- TypeScript: ✅ clean
- ESLint: ✅ clean (no `any` types)
- Pre-commit hooks: ✅ pass
- E2E tests: pending (requires Playwright run against dev server)
