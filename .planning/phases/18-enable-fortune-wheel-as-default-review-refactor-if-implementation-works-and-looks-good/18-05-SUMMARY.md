# 18-05 Summary — Single-Source Game Flow Refactor

**Status**: Complete
**Date**: 2026-03-23

## Goal

Consolidate the game round flow into a single source of truth with clearly documented state transitions, eliminating duplicate flow guards and fixing a critical flow state bug.

## Changes

### Task 1 — Store-layer consolidation (gameStore.ts)

| Edit                                | Description                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `transitionToRoundComplete()`       | Removed `postRoundDecisionPending = true` — flow must pass through `round-complete` before `decision`. Added INVARIANT comment. |
| `completeRound()` idempotency guard | Changed from direct `postRoundDecisionPending = true` to `this.transitionToDecision()` for consistent state transitions.        |
| `getState()` return type            | Fixed `any` → `ReturnType<typeof useGameStore>`.                                                                                |

### Task 2 — Composable + page alignment

| File                     | Edit                                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `useGameState.ts`        | `canConfirmRoundScores` changed from `flowState === 'in-round'` to `flowState === 'round-complete'`.                                            |
| `useGameActions.ts`      | Removed duplicate `canConfirmRoundScores()` and `canProceedToResults()` functions. Updated doc comment directing consumers to `useGameState()`. |
| `results/[[gameId]].vue` | `handleConfirmScores` guard changed from `flow !== 'in-round'` to `flow !== 'round-complete'`.                                                  |
| `results/[[gameId]].vue` | Removed auto-transition `setTimeout` that jumped from `round-complete` to decision after 1s.                                                    |

### Task 2 — Test updates

| File                             | Edit                                                                                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `multiplayer-round-flow.spec.ts` | Updated 3 assertions: `flowState` expectations changed from `'decision'` to `'round-complete'` after `transitionToRoundComplete()`. Added explicit `completeRound()` call before `startNextRound()`. |
| `useGameActions.spec.ts`         | Removed `canConfirmRoundScores`/`canProceedToResults` property checks and `flow guard helpers` describe block.                                                                                       |
| `useGameState.spec.ts`           | Updated flow guard expectations to match new `round-complete` semantics.                                                                                                                             |

### Task 3 — Hygiene review

All 3 flow pages reviewed (`results/[[gameId]].vue`, `round-start.vue`, `game/[[gameId]].vue`):

- Logger consistency: all use `useLogger()` ✅
- Lifecycle cleanup: all timers/listeners cleaned in `onUnmounted` ✅
- i18n hardcoded copy: all template strings use `t()` ✅
- useHead i18n: all use i18n-backed titles/descriptions ✅

No edits needed.

### Deliverable — State flow documentation

Created `18-05-state-flow.md` documenting the 3 flow states (`in-round`, `round-complete`, `decision`), their transitions, triggering methods, consumer files, and full round lifecycle.

## Bug Fixed

**Critical flow state skip**: `transitionToRoundComplete()` was setting `postRoundDecisionPending = true`, causing `flowState` to jump directly from `in-round` → `decision` (skipping `round-complete`). This broke score confirmation on the results page because `handleConfirmScores` required `round-complete` but never saw it.

## Verification

- TypeScript: 0 errors across all 4 packages
- Unit tests: 757 passed, 10 skipped, 0 failures (29/29 files)

## Files Changed

- `apps/game/stores/gameStore.ts` (3 edits)
- `apps/game/composables/useGameState.ts` (1 edit)
- `apps/game/composables/useGameActions.ts` (1 edit)
- `apps/game/pages/results/[[gameId]].vue` (2 edits)
- `apps/game/tests/unit/multiplayer-round-flow.spec.ts` (3 edits)
- `apps/game/tests/unit/composables/useGameActions.spec.ts` (1 edit)
- `apps/game/tests/unit/composables/useGameState.spec.ts` (1 edit)
