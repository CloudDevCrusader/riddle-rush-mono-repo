import { test, expect } from '@playwright/test';
import {
  setupMultiplayerGame,
  submitPlayerAnswers,
  navigateToResults,
  assignScores,
  confirmScoresAndFinishToLeaderboard,
  goToNextRound,
  startGameAndGoToResults,
} from './helpers/game-flow';

/**
 * Multi-round scoring workflow — verifies:
 *   Round 1 → results → save & next round → …
 *   Round 2 → results → save & leaderboard
 */
test('multi-round scoring workflow', async ({ page }) => {
  await setupMultiplayerGame(page, ['Player 1', 'Player 2']);
  await submitPlayerAnswers(page, 2, ['', '']);
  await navigateToResults(page);

  await assignScores(page, [2, 1]);

  await expect(page.locator('[data-testid="predicted-rank-0"]')).toBeVisible();
  await expect(page.locator('[data-testid="predicted-rank-1"]')).toBeVisible();

  await expect(page.locator('[data-testid="save-and-next-round"]')).toBeVisible();
  await expect(page.locator('[data-testid="save-and-leaderboard"]')).toBeVisible();
  await expect(page.locator('[data-testid="results-toolbar-back"]')).toBeVisible();

  await goToNextRound(page);

  await submitPlayerAnswers(page, 2, ['', '']);
  await navigateToResults(page);

  await assignScores(page, [1, 3]);

  await expect(page.locator('[data-testid="save-and-next-round"]')).toBeVisible();
  await expect(page.locator('[data-testid="save-and-leaderboard"]')).toBeVisible();
  await expect(page.locator('[data-testid="results-toolbar-back"]')).toBeVisible();

  await confirmScoresAndFinishToLeaderboard(page);
  await expect(page).toHaveURL(/\/leaderboard/, { timeout: 10000 });
});

test.describe('multi round scoring workflow', () => {
  test.describe('multi round score accumulation', () => {
    test('should accumulate scores across multiple rounds', async ({ page }) => {
      await setupMultiplayerGame(page, ['Player 1', 'Player 2']);

      await submitPlayerAnswers(page, 2, ['', '']);
      await navigateToResults(page);

      await assignScores(page, [2, 1]);
      await expect(page.locator('[data-testid^="scoring-page-score-value-"]').nth(0)).toContainText(
        '2'
      );
      await expect(page.locator('[data-testid^="scoring-page-score-value-"]').nth(1)).toContainText(
        '1'
      );

      await goToNextRound(page);

      await submitPlayerAnswers(page, 2, ['', '']);
      await navigateToResults(page);

      await assignScores(page, [1, 3]);
      await expect(page.locator('[data-testid^="scoring-page-score-value-"]').nth(0)).toContainText(
        '1'
      );
      await expect(page.locator('[data-testid^="scoring-page-score-value-"]').nth(1)).toContainText(
        '3'
      );

      await confirmScoresAndFinishToLeaderboard(page);

      await expect(page.locator('[data-testid="leaderboard-entry-0"]')).toBeVisible();
      await expect(page.locator('[data-testid="leaderboard-player-score-0"]')).toContainText('4');
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle minimum 2-player game', async ({ page }) => {
      await startGameAndGoToResults(page, 2);

      const incrementBtns = page.locator('[data-testid="score-increment"]');
      await expect(incrementBtns).toHaveCount(2);

      await expect(page.locator('[data-testid="save-and-next-round"]')).toBeVisible();
    });

    test('should handle zero scores confirmation', async ({ page }) => {
      await startGameAndGoToResults(page, 2);
      await expect(page.locator('[data-testid="save-and-leaderboard"]')).toBeVisible();
    });
  });
});
