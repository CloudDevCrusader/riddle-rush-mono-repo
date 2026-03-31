---
phase: 13-post-round-next-step-modal
verified: 2026-02-27T17:43:19Z
status: human_needed
score: 3/3 must-haves verified
human_verification:
  - test: 'Run the game, complete a round to reach the results screen. Confirm scores, wait for the leaderboard overlay to auto-dismiss.'
    expected: 'The decision modal appears with the question “Do you want to play another round, or go to the leaderboard?” Try clicking the backdrop or pressing Escape; the modal should remain open. Clicking Next Round should navigate to /round-start. Clicking Leaderboard should navigate to /leaderboard.'
    why_human: "To confirm the visual flow and timing feel correct, and to manually test the non-dismissible behavior which isn't explicitly covered by the E2E test."
---

# Phase 13: Post-Round Next Step Modal Verification Report

**Phase Goal:** Ensure a modal appears after all players are scored, asking whether to start another round or go to the leaderboard.
**Verified:** 2026-02-27T17:43:19Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

All automated checks passed, but the visual flow and a specific user interaction (non-dismissibility) require manual confirmation.

### Observable Truths

| #   | Truth                                                                                                         | Status     | Evidence                                                                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | After confirming scores for all players, the leaderboard overlay appears and then the decision modal appears. | ✓ VERIFIED | `apps/game/pages/results/[[gameId]].vue` shows `showLeaderboard` becomes true, then a timer calls `handleLeaderboardDismiss` which sets `showDecisionModal` to true. This flow is covered in `apps/game/tests/e2e/scoring-flow.spec.ts`.      |
| 2   | The decision modal cannot be dismissed via backdrop or Escape and forces a choice.                            | ✓ VERIFIED | `apps/game/pages/results/[[gameId]].vue` explicitly sets `:close-on-backdrop="false"` and `:close-on-escape="false"` on the `GameModal` component. (Note: This is not explicitly covered by the E2E test, hence the human verification step). |
| 3   | Choosing Next Round starts the next round flow; choosing Leaderboard navigates to the leaderboard screen.     | ✓ VERIFIED | The `handleNextRound` and `handleFinishGame` methods in `[[gameId]].vue` call the correct navigation functions (`goToRoundStart` and `goToLeaderboard`). This is covered in `apps/game/tests/e2e/scoring-flow.spec.ts`.                       |

**Score:** 3/3 truths verified

### Required Artifacts

| Artifact                                       | Expected                                             | Status     | Details                                                                                                                                  |
| ---------------------------------------------- | ---------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/game/pages/results/[[gameId]].vue`       | Scoring confirmation flow with leaderboard and modal | ✓ VERIFIED | Exists (282 lines), is substantive, and all key links are wired correctly.                                                               |
| `apps/game/translations/locales/en.json`       | Post-round prompt and button copy                    | ✓ VERIFIED | Exists and contains the necessary keys (`scoring.post_round_prompt`, `scoring.next_round`, `scoring.leaderboard`) with correct text.     |
| `apps/game/tests/e2e/scoring-workflow.spec.ts` | E2E coverage for decision modal flow                 | ✓ VERIFIED | Misnamed in plan as `-workflow`, but exists as `scoring-flow.spec.ts`. It is substantive and covers the core modal logic and navigation. |

### Key Link Verification

| From                 | To                                             | Via                                | Status  | Details                                                                                                  |
| -------------------- | ---------------------------------------------- | ---------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `.../[[gameId]].vue` | `gameStore.completeRound`                      | `handleConfirmScores`              | ✓ WIRED | Call to `completeRound()` correctly occurs before showing the leaderboard overlay.                       |
| `.../[[gameId]].vue` | `useNavigation.goToRoundStart/goToLeaderboard` | `handleNextRound/handleFinishGame` | ✓ WIRED | Handlers call the correct navigation functions from `useNavigation`.                                     |
| `.../[[gameId]].vue` | `GameModal close-on-backdrop/escape`           | decision modal props               | ✓ WIRED | `:close-on-backdrop="false"` and `:close-on-escape="false"` are correctly passed to the modal component. |

### Requirements Coverage

| Requirement | Status      | Blocking Issue |
| ----------- | ----------- | -------------- |
| MODAL-03    | ✓ SATISFIED | None           |

### Anti-Patterns Found

No blocker or warning anti-patterns were found in the modified files.

### Human Verification Required

The following manual check is required to fully verify goal achievement.

- **Test:** Run the game, complete a round to reach the results screen. Confirm scores, wait for the leaderboard overlay to auto-dismiss.
- **Expected:** The decision modal appears with the question “Do you want to play another round, or go to the leaderboard?” Try clicking the backdrop or pressing Escape; the modal should remain open. Clicking Next Round should navigate to /round-start. Clicking Leaderboard should navigate to /leaderboard.
- **Why human:** To confirm the visual flow and timing feel correct, and to manually test the non-dismissible behavior which isn't explicitly covered by the E2E test.

### Gaps Summary

No major gaps were found. A minor discrepancy was noted where the E2E test was misnamed in the plan document (`scoring-workflow.spec.ts` vs the actual `scoring-flow.spec.ts`), but the required test exists and provides coverage. The E2E test suite could be improved by adding a specific assertion for the non-dismissible modal behavior.

---

_Verified: 2026-02-27T17:43:19Z_
_Verifier: Claude (gsd-verifier)_
