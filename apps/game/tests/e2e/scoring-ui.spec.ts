import { test, expect } from '@playwright/test';
import { startGameAndGoToResults } from './helpers/game-flow';

test.describe('Scoring Workflow: Score Entry UI', () => {
  test.beforeEach(async ({ page }) => {
    await startGameAndGoToResults(page, 2);
  });

  test('should handle score entry correctly', async ({ page }) => {
    // Check that score controls exist
    const decrementBtns = page.locator('[data-testid="score-decrement"]');
    const incrementBtns = page.locator('[data-testid="score-increment"]');
    await expect(decrementBtns).toHaveCount(2);
    await expect(incrementBtns).toHaveCount(2);

    // Check that confirm scores button exists
    const confirmBtn = page.locator('[data-testid="confirm-scores"]');
    await expect(confirmBtn).toBeVisible();

    const firstIncrement = incrementBtns.first();
    const firstDecrement = decrementBtns.first();
    const firstScoreDisplay = page.locator('[data-testid^="scoring-page-score-value-"]').first();

    // Score starts at 0
    await expect(firstScoreDisplay).toContainText('0');

    // Increment score
    await firstIncrement.click();
    await firstIncrement.click();
    await firstIncrement.click();
    await expect(firstScoreDisplay).toContainText('3');

    // Decrement button should be enabled (app allows negative scores)
    await expect(firstDecrement).toBeEnabled();

    // Decrement score
    await firstDecrement.click();
    await expect(firstScoreDisplay).toContainText('2');
  });
});
