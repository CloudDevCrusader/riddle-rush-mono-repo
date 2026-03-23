# Game Flow State Machine

## States

```
┌───────────┐    transitionToRoundComplete()    ┌────────────────┐    transitionToDecision()    ┌──────────┐
│  in-round  │ ──────────────────────────────► │  round-complete  │ ──────────────────────────► │  decision  │
└───────────┘                                   └────────────────┘                              └──────────┘
      ▲                                                                                              │
      │                                          startNextRound()                                    │
      └──────────────────────────────────────────────────────────────────────────────────────────────┘
```

## State Derivation

`flowState` is a **computed getter** in `gameStore.ts`, derived from two booleans:

```
postRoundDecisionPending  →  'decision'      (highest priority)
isCurrentRoundCompleted   →  'round-complete'
else                      →  'in-round'
```

Priority order: `decision` > `round-complete` > `in-round`.

## Transitions

| From             | To               | Trigger                              | Method                                       | File           |
| ---------------- | ---------------- | ------------------------------------ | -------------------------------------------- | -------------- |
| `in-round`       | `round-complete` | All players submitted answers        | `transitionToRoundComplete()`                | `gameStore.ts` |
| `round-complete` | `decision`       | Host confirms scores on results page | `completeRound()` → `transitionToDecision()` | `gameStore.ts` |
| `decision`       | `in-round`       | Host starts next round               | `startNextRound()`                           | `gameStore.ts` |
| `decision`       | _(game ends)_    | Host ends game                       | `endGame()`                                  | `gameStore.ts` |

## Transition Methods

### `transitionToRoundComplete()`

- Sets `isCurrentRoundCompleted = true`
- Pushes current round to `roundHistory`
- **INVARIANT**: Does NOT set `postRoundDecisionPending` — flow must pass through `round-complete` before reaching `decision`

### `transitionToDecision()`

- Sets `postRoundDecisionPending = true`

### `completeRound()`

- Idempotency guard: if already completed, calls `transitionToDecision()` and returns
- Otherwise: finalizes round scoring, then calls `transitionToDecision()`

### `startNextRound()`

- Resets `postRoundDecisionPending = false`
- Resets `isCurrentRoundCompleted = false`
- Advances `currentRoundIndex`
- Flow returns to `in-round`

## Consumer Files

| File                            | Reads                                                       | Purpose                                                                          |
| ------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `composables/useGameState.ts`   | `flowState`, `canConfirmRoundScores`, `canProceedToResults` | Single source of truth for flow guard computeds                                  |
| `composables/useGameActions.ts` | _(delegates to useGameState)_                               | Action methods; no longer duplicates flow guards                                 |
| `pages/results/[[gameId]].vue`  | `flowState` via `useGameState()`                            | `handleConfirmScores` checks `flow === 'round-complete'` before assigning scores |
| `pages/round-start.vue`         | `flowState` via `useGameState()`                            | Controls round setup UI                                                          |
| `pages/game/[[gameId]].vue`     | `flowState` via `useGameState()`                            | In-round gameplay page                                                           |

## Flow Guards (useGameState.ts)

| Guard                   | True when                        | Used by                            |
| ----------------------- | -------------------------------- | ---------------------------------- |
| `canConfirmRoundScores` | `flowState === 'round-complete'` | Results page score confirmation    |
| `canProceedToResults`   | `flowState === 'decision'`       | Navigation to leaderboard/decision |

## Full Round Lifecycle

```
1. Round starts           → flowState = 'in-round'
2. All players submit     → transitionToRoundComplete()  → flowState = 'round-complete'
3. Navigate to results    → handleConfirmScores() checks flow = 'round-complete', assigns scores
4. completeRound()        → transitionToDecision()       → flowState = 'decision'
5. Leaderboard shown      → decision modal appears
6a. startNextRound()      → resets flags                 → flowState = 'in-round'  (loop to 1)
6b. endGame()             → game session ends
```
