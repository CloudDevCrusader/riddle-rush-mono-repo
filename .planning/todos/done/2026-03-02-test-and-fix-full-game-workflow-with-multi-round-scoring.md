---
created: 2026-03-02T08:31:47.138Z
title: Test and fix full game workflow with multi-round scoring
area: ui
files:
  - apps/game/pages/results/[[gameId]].vue
  - apps/game/pages/game/[[gameId]].vue
  - apps/game/pages/round-start.vue
  - apps/game/components/PlayerLeaderboard.vue
---

## Problem

The full game workflow needs manual browser testing and fixes to ensure a smooth multi-round experience. Specific issues identified during explore session:

1. **Post-scoring modal needs 3 options** — currently has "Next Round" and "Leaderboard" but is missing "New Game". The modal should always appear after all players' points are confirmed.
2. **Multi-round play with 5 players** — needs verification that the turn-based answer input works correctly for all 5 players across multiple rounds.
3. **Score accumulation** — verify that scores persist and accumulate correctly across rounds (pending scores added via +/- buttons should be saved to the game store and reflected in subsequent rounds and the leaderboard).
4. **Predicted rank in scoring view** — show each player's projected rank in the scoring page as the host adjusts +/- points (live-updating computed property).
5. **Feature flag for answer input** — hide the text field input behind a simple runtimeConfig boolean (`featureAnswerInput`), also hiding any answer display in later views. When hidden, auto-submit empty answers so the flow still works.

## Solution

1. Launch game locally (`pnpm run dev`) and play through the full flow with 5 players
2. Fix the post-scoring modal to include 3 buttons: Next Round / New Game / Leaderboard
3. Add predicted rank display in `results/[[gameId]].vue` scoring view
4. Add `runtimeConfig.public.featureAnswerInput` boolean and wire it into `useFeatureFlags()` composable
5. Hide answer input section in `game/[[gameId]].vue` when flag is false, auto-submit empty answers
6. Verify score accumulation across multiple rounds via browser testing


---

## Completed 2026-04-11
- Post-round modal has Next / New Game / Leaderboard; predicted ranks on scoring page; `featureAnswerInput` in runtimeConfig + useFeatureFlags. Residual: manual soak + full E2E suite when CI stable.
