import { test, expect } from '@playwright/test';
import { startGameAndGoToResults, confirmScoresAndPlayNextRound } from './helpers/game-flow';

test.describe('scoring results flow', () => {
  test('should show save actions on results after a round', async ({ page }) => {
    await startGameAndGoToResults(page);

    const incrementBtn = page.locator('[data-testid="score-increment"]').first();
    await incrementBtn.click();
    await expect(page.locator('[data-testid^="scoring-page-score-value-"]').first()).toContainText(
      '1'
    );

    await expect(page.locator('[data-testid="results-save-actions-hint"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-and-next-round"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-and-leaderboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="results-toolbar-back"]')).toBeVisible();
  });

  test('should navigate to round-start when choosing save & next round', async ({ page }) => {
    await startGameAndGoToResults(page);
    await confirmScoresAndPlayNextRound(page);
    await expect.poll(() => /\/(round-start|game)/.test(page.url()), { timeout: 15000 }).toBe(true);
  });

  test('should navigate to leaderboard when choosing save & go to leaderboard', async ({
    page,
  }) => {
    await startGameAndGoToResults(page);
    await page.locator('[data-testid="save-and-leaderboard"]').click();
    await expect(page).toHaveURL(/\/leaderboard/, { timeout: 10000 });
  });
});
