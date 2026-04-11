---
created: 2026-04-10T20:45:00.000Z
title: Fix remaining E2E failures in scoring-flow.spec.ts (~4 tests)
area: testing
files:
  - apps/game/tests/e2e/scoring-flow.spec.ts
---

## Problem

Approximately 4 E2E tests in `scoring-flow.spec.ts` are failing because tests reference testids that don't exist in the app:

- `data-testid="player-leaderboard-overlay"` — does not exist in the rendered DOM
- `data-testid="next-round"` — does not exist in the rendered DOM

These are pre-existing test/UI mismatches unrelated to the submit button fix.

## Solution

1. Identify what testids the app actually renders for the leaderboard overlay and next-round controls
2. Update the test locators to use the correct testids
3. Re-run `scoring-flow.spec.ts` to verify all tests pass


---

## Completed 2026-04-11
- Spec already uses `player-leaderboard`, `next-round-button`; no code change this session.
