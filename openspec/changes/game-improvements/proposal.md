## Why

The game is playable but the scoring flow lacks context (no base scores visible, no predicted rank), the post-round modal is missing a "New Game" option, and the answer text input needs to be toggleable for different play modes (e.g., verbal-only rounds). These are all quick wins that improve the core gameplay loop before tackling larger refactors.

## What Changes

- **Hide answer text input behind a feature flag** — add `runtimeConfig.public.featureAnswerInput` boolean. When `false`, hide the text input and auto-submit empty answers so the turn flow still works. Also hide any answer display in later views.
- **3-option post-scoring modal** — replace the current 2-button modal (Next Round / Leaderboard) with 3 buttons: Next Round / New Game / Leaderboard. "New Game" resets the session and navigates to the players page.
- **Show base points in scoring view** — display each player's `totalScore` (accumulated from prior rounds) alongside the +/- controls, so the host has context when assigning points.
- **Predicted rank in scoring view** — show a live-updating projected rank (#1, #2, etc.) next to each player that recalculates as the host clicks +/-.
- **Game state documentation** — create a state flow chart documenting the game state machine (states, transitions, data ownership) so the flow can be verified visually.

## Capabilities

### New Capabilities

- `answer-input-flag`: Feature flag to hide/show the answer text input field and its display in results. Uses `runtimeConfig.public` boolean with `useFeatureFlags()` composable integration.
- `scoring-context`: Base points display and live predicted rank in the scoring view. Provides the host with ranking context while assigning round scores.
- `game-state-docs`: Documented state machine chart covering all game states, transitions, and data ownership across stores/composables/pages.

### Modified Capabilities

- `post-round-modal`: Add "New Game" as a third option to the existing post-scoring decision modal. Requires new handler to reset session and navigate to players page.

## Impact

- **Files modified**: `apps/game/pages/results/[[gameId]].vue` (scoring view + modal), `apps/game/pages/game/[[gameId]].vue` (answer input toggle), `apps/game/nuxt.config.ts` (runtimeConfig flag), `apps/game/composables/useFeatureFlags.ts` (new flag), `apps/game/composables/useNavigation.ts` (new game navigation)
- **Translation keys**: New keys needed in `de.json` and `en.json` for "New Game" button text and any new UI labels
- **No breaking changes**: All additions are backward-compatible. Feature flag defaults to `true` (answer input shown).
- **Tests**: Unit tests for predicted rank computation, feature flag composable. At least 1 E2E test for the full scoring flow.
