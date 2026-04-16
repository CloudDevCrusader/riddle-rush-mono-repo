import { test, expect } from '@playwright/test';
import {
  setupMultiplayerGame,
  submitPlayerAnswers,
  navigateToResults,
  assignScores,
  confirmScoresAndWaitForModal,
  goToNextRound,
  finishGame,
  startGameAndGoToResults,
} from './helpers/game-flow';

/**
 * Multi-round scoring workflow — top-level test that verifies the complete flow:
 *   Round 1 → results → post-round modal (3 options + predicted ranks) → next round
 *   Round 2 → results → post-round modal → finish → leaderboard
 */
test('multi-round scoring workflow', async ({ page }) => {
  // ── Round 1 setup ──────────────────────────────────────────────────────────
  await setupMultiplayerGame(page, ['Player 1', 'Player 2']);
  await submitPlayerAnswers(page, 2, ['', '']);
  await navigateToResults(page);

  // Assign scores: Player 1 = 2pts, Player 2 = 1pt
  await assignScores(page, [2, 1]);

  // Verify predicted ranks are displayed on the scoring page before confirming
  await expect(page.locator('[data-testid="predicted-rank-0"]')).toBeVisible();
  await expect(page.locator('[data-testid="predicted-rank-1"]')).toBeVisible();

  // Confirm scores — leaderboard overlay auto-dismisses → decision modal appears
  await confirmScoresAndWaitForModal(page);

  // Verify post-round modal shows 3 options
  await expect(page.locator('[data-testid="next-round-button"]')).toBeVisible();
  await expect(page.locator('[data-testid="leaderboard-button"]')).toBeVisible();
  await expect(page.locator('[data-testid="new-game-button"]')).toBeVisible();

  // ── Round 2 ────────────────────────────────────────────────────────────────
  await goToNextRound(page);
  await submitPlayerAnswers(page, 2, ['', '']);
  await navigateToResults(page);

  // Assign scores: Player 1 = 1pt, Player 2 = 3pts (overtakes)
  await assignScores(page, [1, 3]);

  // Confirm round 2 scores
  await confirmScoresAndWaitForModal(page);

  // Verify modal appears again with all 3 options
  await expect(page.locator('[data-testid="next-round-button"]')).toBeVisible();
  await expect(page.locator('[data-testid="leaderboard-button"]')).toBeVisible();
  await expect(page.locator('[data-testid="new-game-button"]')).toBeVisible();

  // Finish game → navigate to leaderboard
  await finishGame(page);
  await expect(page).toHaveURL(/\/leaderboard/, { timeout: 10000 });
});

test.describe('multi round scoring workflow', () => {
  test.describe('multi round score accumulation', () => {
    test('should accumulate scores across multiple rounds', async ({ page }) => {
      await setupMultiplayerGame(page, ['Player 1', 'Player 2']);

      // Submit answers for round 1
      await submitPlayerAnswers(page, 2, ['', '']);
      await navigateToResults(page);

      // Assign scores: Player 1 = 2, Player 2 = 1
      await assignScores(page, [2, 1]);
      await expect(page.locator('[data-testid^="scoring-page-score-value-"]').nth(0)).toContainText(
        '2'
      );
      await expect(page.locator('[data-testid^="scoring-page-score-value-"]').nth(1)).toContainText(
        '1'
      );

      // Confirm scores
      await confirmScoresAndWaitForModal(page);
      await goToNextRound(page);

      // Submit answers for round 2
      await submitPlayerAnswers(page, 2, ['', '']);
      await navigateToResults(page);

      // Assign scores: Player 1 = 1, Player 2 = 3
      await assignScores(page, [1, 3]);
      await expect(page.locator('[data-testid^="scoring-page-score-value-"]').nth(0)).toContainText(
        '1'
      );
      await expect(page.locator('[data-testid^="scoring-page-score-value-"]').nth(1)).toContainText(
        '3'
      );

      // Confirm scores
      await confirmScoresAndWaitForModal(page);
      await finishGame(page);

      // Should be on leaderboard with accumulated scores
      await expect(page.locator('[data-testid="leaderboard-entry-0"]')).toBeVisible();
      await expect(page.locator('[data-testid="leaderboard-player-score-0"]')).toContainText('4');
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle minimum 2-player game', async ({ page }) => {
      await startGameAndGoToResults(page, 2);

      // Should show two players
      const incrementBtns = page.locator('[data-testid="score-increment"]');
      await expect(incrementBtns).toHaveCount(2);

      // Should be able to confirm
      const confirmBtn = page.locator('[data-testid="confirm-scores"]');
      await expect(confirmBtn).toBeVisible();
    });

    test('should handle zero scores confirmation', async ({ page }) => {
      await startGameAndGoToResults(page, 2);
      await confirmScoresAndWaitForModal(page);
      await expect(page.locator('[data-testid="leaderboard-button"]')).toBeVisible();
    });
  });
});
