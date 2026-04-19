import { test, expect } from '@playwright/test';
import { generatePlayerName, generateAnswer } from './helpers/faker';
import {
  navigateToResults,
  setupMultiplayerGame,
  startGameWithDefaults,
  submitPlayerAnswers,
  hideDevtools,
} from './helpers/game-flow';

test.describe('results scoring page', () => {
  test.beforeEach(async ({ page }) => {
    await startGameWithDefaults(page);
    await submitPlayerAnswers(page, 2, [generateAnswer(), generateAnswer()]);
    await navigateToResults(page);
  });

  test('should display results page with all elements', async ({ page }) => {
    // Check for background (GameBackground)
    const background = page.locator('.game-background');
    await expect(background).toBeVisible();

    // Check for title (GameHeader)
    const header = page.locator('[data-testid="results-header"]');
    await expect(header).toBeVisible();

    // Wait for player entries to load (container may be zero-height until populated)
    const firstEntry = page.locator('[data-testid="results-player-entry-0"]');
    await expect(firstEntry).toBeVisible({ timeout: 10000 });

    // Check for player list container
    const playerList = page.locator('[data-testid="results-scores-container"]');
    await expect(playerList).toBeVisible();

    await expect(page.locator('[data-testid="save-and-next-round"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-and-leaderboard"]')).toBeVisible();
  });

  test('should display player entries with score controls', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    const playerEntries = page.locator('[data-testid^="results-player-entry-"]');

    // Wait for at least one entry to appear
    await expect(playerEntries.first()).toBeVisible({ timeout: 5000 });

    const count = await playerEntries.count();
    expect(count).toBeGreaterThan(0);

    // Each entry should have score controls
    const scoreControls = page.locator('[data-testid^="results-score-controls-"]');
    expect(await scoreControls.count()).toBe(count);
  });

  test('should display increment and decrement buttons for each player', async ({ page }) => {
    const firstEntry = page.locator('[data-testid="results-player-entry-0"]');
    const decrementBtn = firstEntry.locator('[data-testid="score-decrement"]');
    const incrementBtn = firstEntry.locator('[data-testid="score-increment"]');

    await expect(decrementBtn).toBeVisible();
    await expect(incrementBtn).toBeVisible();
  });

  test('should increase score when clicking increment button', async ({ page }) => {
    const firstEntry = page.locator('[data-testid="results-player-entry-0"]');
    const scoreDisplay = firstEntry.locator('[data-testid^="scoring-page-score-value-"]');
    const incrementBtn = firstEntry.locator('[data-testid="score-increment"]');

    // Get initial score
    const initialScore = Number.parseInt((await scoreDisplay.textContent()) || '0');

    // Click increment
    await incrementBtn.click();
    await page.waitForTimeout(200);

    // Check new score
    const newScore = Number.parseInt((await scoreDisplay.textContent()) || '0');
    expect(newScore).toBe(initialScore + 1);
  });

  test('should decrease score when clicking decrement button', async ({ page }) => {
    const firstEntry = page.locator('[data-testid="results-player-entry-0"]');
    const scoreDisplay = firstEntry.locator('[data-testid^="scoring-page-score-value-"]');
    const incrementBtn = firstEntry.locator('[data-testid="score-increment"]');
    const decrementBtn = firstEntry.locator('[data-testid="score-decrement"]');

    // First increment to have something to decrement
    await incrementBtn.click();
    await page.waitForTimeout(100);
    await incrementBtn.click();
    await page.waitForTimeout(100);

    const beforeScore = Number.parseInt((await scoreDisplay.textContent()) || '0');
    expect(beforeScore).toBe(2);

    // Now decrement
    await decrementBtn.click();
    await page.waitForTimeout(200);

    const afterScore = Number.parseInt((await scoreDisplay.textContent()) || '0');
    expect(afterScore).toBe(1);
  });

  test('should allow decrement button when score is 0 (negative scores allowed)', async ({
    page,
  }) => {
    const firstEntry = page.locator('[data-testid="results-player-entry-0"]');
    const decrementBtn = firstEntry.locator('[data-testid="score-decrement"]');

    // Decrement button is always enabled (app allows negative score adjustments)
    await expect(decrementBtn).toBeEnabled();
  });

  test('should navigate to round-start when choosing save & next round', async ({ page }) => {
    await page.locator('[data-testid="save-and-next-round"]').click();
    await expect.poll(() => /\/(round-start|game)/.test(page.url()), { timeout: 15000 }).toBe(true);
  });

  test('should navigate to leaderboard when choosing save & go to leaderboard', async ({
    page,
  }) => {
    await page.locator('[data-testid="save-and-leaderboard"]').click();
    await expect(page).toHaveURL(/\/leaderboard/, { timeout: 10000 });
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const header = page.locator('[data-testid="results-header"]');
    const playerList = page.locator('[data-testid="results-scores-container"]');
    await expect(header).toBeVisible();
    await expect(playerList).toBeVisible();
    await expect(page.locator('[data-testid="save-and-next-round"]')).toBeVisible();
  });
});

test.describe('results page multi-player', () => {
  test.beforeEach(async ({ page }) => {
    const player2Name = generatePlayerName();
    await setupMultiplayerGame(page, ['Player 1', player2Name]);
    await submitPlayerAnswers(page, 2, [generateAnswer(), generateAnswer()]);
    await navigateToResults(page);
  });

  test('should display all players in multi-player game', async ({ page }) => {
    const playerEntries = page.locator('[data-testid^="results-player-entry-"]');

    // Should have 2 players
    await expect(playerEntries).toHaveCount(2);
  });

  test('should allow independent score adjustment for each player', async ({ page }) => {
    const incrementBtns = page.locator('[data-testid="score-increment"]');
    const scoreDisplays = page.locator('[data-testid^="scoring-page-score-value-"]');

    // Increment player 1 three times
    await incrementBtns.nth(0).click();
    await page.waitForTimeout(50);
    await incrementBtns.nth(0).click();
    await page.waitForTimeout(50);
    await incrementBtns.nth(0).click();
    await page.waitForTimeout(50);

    // Increment player 2 once
    await incrementBtns.nth(1).click();
    await page.waitForTimeout(50);

    // Verify scores
    await expect(scoreDisplays.nth(0)).toContainText('3');
    await expect(scoreDisplays.nth(1)).toContainText('1');
  });
});
