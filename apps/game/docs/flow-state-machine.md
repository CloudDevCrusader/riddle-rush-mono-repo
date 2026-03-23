# Game Flow State Machine

Single source of truth for the game's flow state transitions.
Implemented in `stores/gameStore.ts` via the `flowState()` getter.

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> setup

    setup --> in_round : setupPlayers / advanceToConfiguredRound
    in_round --> round_complete : completeRound (all players submitted)
    round_complete --> decision : completeRound sets postRoundDecisionPending
    decision --> in_round : startNextRound (next round chosen)
    decision --> completed : completeGame (finish/new game chosen)
    completed --> [*] : endGame / clearSession (return to menu)

    state setup {
        note left of setup
            No active session.
            Players page or initial state.
        end note
    }

    state in_round {
        note left of in_round
            Active session with ongoing round.
            Game page: players submitting answers.
        end note
    }

    state decision {
        note left of decision
            Post-round modal active.
            Results page: next round / new game / leaderboard.
        end note
    }

    state completed {
        note left of completed
            Session status is 'completed'.
            Game is over, leaderboard shown.
        end note
    }
```

## States

| State            | Description                          | Active Pages            |
| ---------------- | ------------------------------------ | ----------------------- |
| `setup`          | No active session                    | `/players`              |
| `in-round`       | Players are submitting answers       | `/round-start`, `/game` |
| `round-complete` | Round data recorded (internal, auto) | (transient)             |
| `decision`       | Post-round decision modal shown      | `/results`              |
| `completed`      | Game finished                        | `/leaderboard`          |

## Transitions

| From             | To               | Trigger                        | Key Action                                      |
| ---------------- | ---------------- | ------------------------------ | ----------------------------------------------- |
| `setup`          | `in-round`       | Player setup complete          | `setupPlayers()` / `advanceToConfiguredRound()` |
| `in-round`       | `round-complete` | All players submitted + scored | `completeRound()`                               |
| `round-complete` | `decision`       | Auto (same action as above)    | `postRoundDecisionPending = true`               |
| `decision`       | `in-round`       | User taps "Next Round"         | `startNextRound()`                              |
| `decision`       | `completed`      | User taps "Leaderboard"/"New"  | `completeGame()`                                |
| `completed`      | `setup`          | User returns to menu           | `endGame()` / `clearSession()`                  |

## Guards (Derived Getters)

| Guard                     | True When                                                  | Used By              |
| ------------------------- | ---------------------------------------------------------- | -------------------- |
| `canConfirmRoundScores`   | `flowState === 'in-round'`                                 | Results page confirm |
| `canProceedToResults`     | `flowState in [round-complete, decision]` or single-player | Game page "Next"     |
| `isCurrentRoundCompleted` | `roundHistory.length >= currentRound`                      | Internal flow logic  |
| `isGameCompleted`         | `session.status === 'completed'`                           | Leaderboard, results |

## Composable Responsibilities

- **`useGameState()`** -- Reactive computed refs for flow state and guards (pages read these)
- **`useGameActions()`** -- Fire-and-forget side-effectful actions with error handling and toasts
- **`useGameSession()`** -- Low-level Zustand hook bridge (computed refs wrapping store selectors)
- **`usePlayerActions()`** -- Player-specific actions (submit, score, complete round)
