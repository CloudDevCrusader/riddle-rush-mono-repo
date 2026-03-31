---
created: 2026-03-02T08:41:36.777Z
title: Refactor game mode to single source of truth with documented state flow
area: ui
files:
  - apps/game/stores/game.ts
  - apps/game/composables/useGameState.ts
  - apps/game/composables/useGameActions.ts
  - apps/game/composables/usePlayerManager.ts
  - apps/game/pages/game/[[gameId]].vue
  - apps/game/pages/results/[[gameId]].vue
  - apps/game/pages/round-start.vue
---

## Problem

The in-game mode state is currently spread across multiple layers:

- **Game store** (`stores/game.ts`) — session, players, round, scores, categories
- **useGameState** — computed wrappers around the store
- **useGameActions** — action dispatchers (toast + navigation + store calls)
- **usePlayerManager** — player mutations (score, turn, leaderboard)
- **Page components** — local state like `pendingScores`, `showLeaderboard`, `showDecisionModal`

There's no single place to look at to understand "what is the current game state and what can transition to what." This makes it hard to:

1. Verify the game flow is correct
2. Debug multi-round issues (e.g., score accumulation, player turn tracking)
3. Know which layer owns which piece of state

## Solution

1. **Audit and consolidate** — map every piece of game mode state to its owner. Ensure there is exactly one source of truth for each piece (no duplicated or shadowed state).

2. **Document the state machine** — create a visual chart (Mermaid or ASCII) showing:
   - All game states (menu → players → round-start → game → scoring → leaderboard)
   - State transitions and what triggers them
   - Which data flows between each state
   - Where each piece of state lives (store vs. local)

3. **Create a verification artifact** — a state flow diagram that can be reviewed to confirm the game works correctly across rounds, with multiple players, and with score accumulation.

4. **Update CLAUDE.md or docs/** with the documented game flow so future changes can be verified against it.

### Potential chart format

```
[Menu] --start--> [Players] --ready--> [RoundStart]
   |                                        |
   |                                   (wheel spin)
   |                                        |
   |                                        v
   |                                    [Game]
   |                                        |
   |                                  (all submitted)
   |                                        |
   |                                        v
   |                                   [Scoring]
   |                                        |
   |                                  (confirm scores)
   |                                        |
   |                              ┌─────────┼─────────┐
   |                              v         v         v
   |                         [NextRound] [NewGame] [Leaderboard]
   |                              |         |         |
   |                              v         |         v
   |                         [RoundStart]   |    [FinalRanking]
   |                                        |
   └────────────────────────────────────────┘
```
