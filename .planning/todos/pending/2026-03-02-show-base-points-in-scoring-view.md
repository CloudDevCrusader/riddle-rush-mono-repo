---
created: 2026-03-02T08:36:02.287Z
title: Show base points in scoring view
area: ui
files:
  - apps/game/pages/results/[[gameId]].vue
  - apps/game/composables/usePlayerManager.ts
---

## Problem

In the scoring view (`results/[[gameId]].vue`), when the host is assigning points with +/− buttons, the player's existing `totalScore` (accumulated from previous rounds) is not visible. The pending score counter starts at 0, giving no context for the player's standing.

The host should see each player's base points (total from prior rounds) so they know how the new points will affect rankings.

## Solution

Display `player.totalScore` alongside the pending score controls. Show projected rank that updates live as +/− are clicked.

Approach:

- Show `player.totalScore` as a base score label (e.g., "Score: 5")
- Add a computed `projectedLeaderboard` that sorts by `player.totalScore + pendingScores[id]`
- Display projected rank (#1, #2, etc.) next to each player entry
- Rank updates reactively on every +/− click
