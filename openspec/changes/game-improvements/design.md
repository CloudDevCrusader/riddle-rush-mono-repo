## Context

The game already has all the building blocks: `GameModal` for dialogs, `GameButton` for actions, `useFeatureFlags()` for flag checks, `runtimeConfig.public` for env-based config, and a working scoring page with `pendingScores` reactive map. All changes follow existing patterns — no new architecture needed.

## Goals / Non-Goals

**Goals:**

- Add feature flag, modal option, scoring context, and state docs using existing patterns
- Keep changes minimal and backward-compatible

**Non-Goals:**

- No new dependencies or libraries
- No refactoring of the game store or composable architecture (separate todo)
- No remote feature flag integration (just local runtimeConfig boolean)

## Decisions

1. **Feature flag via `runtimeConfig.public.featureAnswerInput`** — not a Nuxt module or OpenFeature SDK. Reason: one boolean doesn't justify a dependency. Can override per env with `NUXT_PUBLIC_FEATURE_ANSWER_INPUT=false`.

2. **"New Game" handler reuses existing navigation** — calls `gameStore.completeGame()` then navigates to players page via `useNavigation()`. Same pattern as "Leaderboard" button but different destination.

3. **Predicted rank is a local computed** — `projectedLeaderboard` computed in the scoring page sorts by `player.totalScore + pendingScores[id]`. No store changes needed. Reactivity comes from `pendingScores` being reactive.

4. **State flow chart goes in `docs/`** — Mermaid diagram documenting the game state machine. Not in CLAUDE.md (too long), not in a component (not code).

## Risks / Trade-offs

- **Feature flag default `true`** — answer input stays visible unless explicitly disabled. Zero risk of breaking existing behavior.
- **"New Game" mid-session** — completes the current game (saves to history) before resetting. Alternative was to discard without saving, but saving is safer and matches what "Leaderboard" already does.
