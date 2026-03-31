---
phase: 20-revert-zustand-to-pinia
plan: 01
status: completed
commit: 76563b558
duration: ~45min
files_changed: 10
---

# 20-01 Summary: Core Store Conversion to Pinia

## Objective

Revert all three stores (gameStore, settingsStore, loadingStore) from Zustand singleton pattern back to Pinia `defineStore` options API. Remove Zustand plugin and migration helper. Add Pinia client plugin.

## What Was Done

### Stores converted

- **`gameStore.ts`** — Converted from `create<GameStore>()` Zustand pattern to `defineStore('game', { state, getters, actions })`. Preserved unified `GameFlowState` and all flow transition helpers (`flowState`, `transitionToRoundComplete`, `isCurrentRoundCompleted`). All Phase 19 architectural improvements retained.
- **`settingsStore.ts`** — Converted to Pinia options API with `pinia-plugin-persistedstate` for localStorage persistence (replaces Zustand persist middleware).
- **`loadingStore.ts`** — Converted to Pinia options API with simple loading/message state.

### New/removed files

- **Added** `apps/game/plugins/pinia.client.ts` — Explicit Pinia registration with `pinia-plugin-persistedstate` for settings store persistence.
- **Removed** `apps/game/plugins/zustand.ts` — Zustand window bridge no longer needed.
- **Removed** `apps/game/stores/migrate.ts` — Migration helper no longer needed.
- **Removed** `zustand` from `package.json` dependencies; `pinia` and `pinia-plugin-persistedstate` restored.

### Consumers updated

- `apps/game/components/DebugPanel.vue` — Updated to `useGameStore()` / `useSettingsStore()` composable calls.
- `apps/game/composables/useFeatureFlags.ts` — Updated to use Pinia `useSettingsStore()`.
- `apps/game/middleware/session-guard.global.ts` — Updated to use `useGameStore()`.
- `apps/game/plugins/i18n.client.ts` — Updated to use `useSettingsStore()`.
- `packages/types/src/game.ts` — Updated GameFlowState type references to match Pinia store shape.

## Key Decisions

- Options API style (`defineStore('id', { state, getters, actions })`) chosen over setup store for consistency with existing codebase patterns.
- `export const gameStore = useGameStore` backward-compat alias preserved in production code — composables call `useXxxStore()` inside Vue component context.
- `pinia-plugin-persistedstate` handles settings persistence automatically — no manual `loadSettings`/`saveSettings` calls needed.

## Verification

- TypeScript: ✅ clean (Turbo typecheck passes)
- ESLint: ✅ clean (lint-staged passes)
- Pre-commit hooks: ✅ pass
