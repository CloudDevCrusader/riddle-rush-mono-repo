# Phase 13: Post-Round Next Step Modal - Research

**Researched:** 2026-02-27
**Domain:** Nuxt 4 / Vue 3 modal UX + post-round scoring flow
**Confidence:** HIGH

## User Constraints

No CONTEXT.md found for this phase. No locked decisions or deferred ideas provided.

## Summary

This phase is already implemented in the scoring/results page flow. The results page (`apps/game/pages/results/[[gameId]].vue`) shows a leaderboard overlay after score confirmation, then displays a decision modal asking whether to start another round or finish and go to the leaderboard. This is wired through `GameModal` (modal framework), `PlayerLeaderboard` (overlay), and `useNavigation` plus `gameStore` actions. The implementation already uses shared constants for timing and i18n keys for text.

Planning should focus on verifying the existing flow and ensuring the modal is triggered after all players are scored (i.e., after `assignPlayerScore` for each player and `completeRound`). It should also confirm that the modal cannot be dismissed via backdrop or escape, and that the correct navigation happens for each choice. Tests for the decision modal already exist in the E2E suite.

**Primary recommendation:** Reuse the existing results flow in `apps/game/pages/results/[[gameId]].vue` and `components/game/GameModal.vue`; only adjust behavior or copy patterns if new screens are introduced.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library                 | Version           | Purpose                   | Why Standard                        |
| ----------------------- | ----------------- | ------------------------- | ----------------------------------- |
| Nuxt                    | ^4.3.1            | App framework and routing | Primary app runtime for `apps/game` |
| Vue                     | ^3.5.28           | UI framework              | SFCs and composables                |
| Pinia (@pinia/nuxt)     | ^0.11.3           | State management          | Game session state and actions      |
| @nuxtjs/i18n / vue-i18n | ^10.2.3 / ^11.2.8 | Localization              | All UI strings via `t()`            |
| focus-trap              | ^8.0.0            | Modal focus management    | Used in `GameModal`                 |

### Supporting

| Library        | Version | Purpose               | When to Use                          |
| -------------- | ------- | --------------------- | ------------------------------------ |
| @vueuse/motion | ^3.0.3  | `v-motion` animations | Per-player scoring list animation    |
| Playwright     | ^1.58.2 | E2E tests             | Modal flow tests in scoring workflow |

### Alternatives Considered

| Instead of                  | Could Use           | Tradeoff                                                                   |
| --------------------------- | ------------------- | -------------------------------------------------------------------------- |
| Custom modal implementation | New modal component | Not needed; `GameModal` already provides focus trap, scroll lock, teleport |

## Architecture Patterns

### Recommended Project Structure

```
apps/game/
├── pages/results/[[gameId]].vue  # Scoring + post-round modal flow
├── components/game/GameModal.vue # Modal framework (teleport + focus trap)
├── components/PlayerLeaderboard.vue # Post-score overlay
├── composables/useNavigation.ts  # Route helpers
├── composables/useGameState.ts   # Store accessors
├── stores/game.ts                # Session + round lifecycle
└── translations/locales/*.json   # i18n strings
```

### Pattern 1: Post-score flow gate with overlay then decision modal

**What:** Confirm scores -> record round -> show leaderboard overlay -> auto-dismiss -> decision modal.
**When to use:** After all players are scored and `completeRound()` has been called.
**Example:**

```ts
// Source: apps/game/pages/results/[[gameId]].vue
const handleConfirmScores = async () => {
  for (const [playerId, score] of pendingScores) {
    await gameStore.assignPlayerScore(playerId, score)
  }
  await gameStore.completeRound()
  showLeaderboard.value = true
  dismissTimer = setTimeout(handleLeaderboardDismiss, RESULTS_DISPLAY_DURATION_MS)
}

const handleLeaderboardDismiss = () => {
  showLeaderboard.value = false
  showDecisionModal.value = true
}
```

### Pattern 2: Modal usage with `GameModal`

**What:** Use `GameModal` with `v-model` and disable backdrop/escape when choice is required.
**When to use:** Decision points that must be explicit (e.g., next round vs leaderboard).
**Example:**

```vue
<!-- Source: apps/game/pages/results/[[gameId]].vue -->
<GameModal
  v-model="showDecisionModal"
  :title="t('scoring.round_complete', 'Round Complete!')"
  :close-on-backdrop="false"
  :close-on-escape="false"
>
  ...
</GameModal>
```

### Anti-Patterns to Avoid

- **Skipping `completeRound()` before navigation:** `round-start` uses round history to decide whether to increment rounds.
- **Creating a new modal system:** duplicates focus trap, scroll lock, and transitions already handled by `GameModal`.
- **Leaving timers active on unmount:** must clear `dismissTimer` to avoid stale state changes.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                          | Don't Build                             | Use Instead                        | Why                                               |
| -------------------------------- | --------------------------------------- | ---------------------------------- | ------------------------------------------------- |
| Modal overlay + focus management | Custom dialog markup                    | `components/game/GameModal.vue`    | Includes focus trap, scroll lock, transitions     |
| Leaderboard overlay              | New overlay component                   | `components/PlayerLeaderboard.vue` | Existing UX and styling, emits `close`/`continue` |
| Navigation logic                 | Direct `router.push` in multiple places | `composables/useNavigation.ts`     | Centralized loading UX and consistent routes      |

**Key insight:** The modal decision is part of the scoring flow; it should be wired into the results page flow rather than a standalone modal controller.

## Common Pitfalls

### Pitfall 1: Round never advances

**What goes wrong:** User chooses Next Round but round number does not increment.
**Why it happens:** `completeRound()` was not called before navigating to `/round-start`.
**How to avoid:** Ensure score confirmation calls `gameStore.completeRound()` before showing the decision modal.
**Warning signs:** Round indicator stays the same and round history is unchanged.

### Pitfall 2: Modal can be dismissed without a decision

**What goes wrong:** User closes modal via backdrop or Escape, leaving flow in limbo.
**Why it happens:** Default `GameModal` props allow backdrop/escape close.
**How to avoid:** Set `:close-on-backdrop="false"` and `:close-on-escape="false"` for the decision modal.
**Warning signs:** Score confirmation leaves the user stuck on results without a next step.

### Pitfall 3: Auto-dismiss timer fires after navigation

**What goes wrong:** Timer triggers state updates on a destroyed component.
**Why it happens:** `dismissTimer` not cleared in `onUnmounted`.
**How to avoid:** Clear timeout in `onUnmounted` (already present).
**Warning signs:** Console errors or unexpected modal display after leaving results page.

## Code Examples

Verified patterns from the codebase:

### Decision Modal in Results Flow

```vue
<!-- Source: apps/game/pages/results/[[gameId]].vue -->
<GameModal
  v-model="showDecisionModal"
  :title="t('scoring.round_complete', 'Round Complete!')"
  :close-on-backdrop="false"
  :close-on-escape="false"
>
  <GameButton data-testid="next-round" @click="handleNextRound">
    {{ t('scoring.next_round', 'Next Round') }}
  </GameButton>
  <GameButton data-testid="finish-game" @click="handleFinishGame">
    {{ t('scoring.finish_game', 'Finish Game') }}
  </GameButton>
</GameModal>
```

### Navigation Targets

```ts
// Source: apps/game/composables/useNavigation.ts
return {
  goToRoundStart: () => queueNavigation(ROUTES.ROUND_START, true),
  goToLeaderboard: () => queueNavigation(ROUTES.LEADERBOARD, true),
}
```

## State of the Art

| Old Approach                          | Current Approach                             | When Changed            | Impact                                                  |
| ------------------------------------- | -------------------------------------------- | ----------------------- | ------------------------------------------------------- |
| Direct navigation after score confirm | Show leaderboard overlay then decision modal | Already in results page | Gives users a post-round summary and explicit next step |

## Open Questions

None identified; the flow is already implemented and covered by E2E tests.

## Sources

### Primary (HIGH confidence)

- `apps/game/pages/results/[[gameId]].vue` - scoring flow, leaderboard overlay, decision modal
- `apps/game/components/game/GameModal.vue` - modal behavior, focus trap, scroll lock
- `apps/game/components/PlayerLeaderboard.vue` - overlay display and actions
- `apps/game/composables/useNavigation.ts` - route helpers for next round/leaderboard
- `apps/game/stores/game.ts` - `completeRound`, `completeGame`, `startNextRound`
- `apps/game/tests/e2e/scoring-workflow.spec.ts` - decision modal tests
- `packages/shared/src/constants.ts` - `RESULTS_DISPLAY_DURATION_MS`, `SCORE_INCREMENT`
- `apps/game/translations/locales/en.json` - `scoring.*` i18n keys

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - confirmed via `apps/game/package.json`
- Architecture: HIGH - confirmed in `apps/game/pages/results/[[gameId]].vue`
- Pitfalls: MEDIUM - derived from current flow and typical modal timing issues

**Research date:** 2026-02-27
**Valid until:** 2026-03-29
