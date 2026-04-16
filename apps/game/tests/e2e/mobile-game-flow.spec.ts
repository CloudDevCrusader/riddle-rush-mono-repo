import { test, expect } from '@playwright/test';
import { verifyResponsiveLayout, verifyTouchTargets, simulateTouchGesture } from './helpers/mobile';
import {
  startGameWithDefaults,
  submitPlayerAnswers,
  navigateToResults,
  assignScores,
  confirmScoresAndWaitForModal,
  goToNextRound,
  finishGame,
} from './helpers/game-flow';

// ---------------------------------------------------------------------------
// Mobile tests – Pixel 5 (393x851px)
// Playwright project: android-pixel5 (uses devices['Pixel 5'])
// ---------------------------------------------------------------------------

test.describe('@mobile Mobile Game Flow', () => {
  // Pixel 5 viewport is applied by the android-pixel5 project in playwright.config.ts.
  // Override here to allow running these tests standalone as well.
  test.use({ viewport: { width: 393, height: 851 } });

  // ── Responsive layout ────────────────────────────────────────────────────

  test('mobile responsive layout on main menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await verifyResponsiveLayout(page, {
      mobile: 393,
      tablet: 768,
      desktop: 1024,
    });

    expect(result.viewport).toBe('mobile');
    expect(result.issues.filter((i) => i.toLowerCase().includes('overflow'))).toHaveLength(0);
  });

  test('mobile responsive layout on players page', async ({ page }) => {
    await page.goto('/players');
    await page.waitForLoadState('networkidle');

    const result = await verifyResponsiveLayout(page, {
      mobile: 393,
      tablet: 768,
      desktop: 1024,
    });

    expect(result.viewport).toBe('mobile');
    // Layout should have no overflow on mobile
    expect(result.issues.filter((i) => i.toLowerCase().includes('overflow'))).toHaveLength(0);
  });

  test('mobile responsive layout on game page', async ({ page }) => {
    await startGameWithDefaults(page);

    const result = await verifyResponsiveLayout(page, {
      mobile: 393,
      tablet: 768,
      desktop: 1024,
    });

    expect(result.viewport).toBe('mobile');
    expect(result.issues.filter((i) => i.toLowerCase().includes('overflow'))).toHaveLength(0);

    // Key game elements must be visible on mobile
    await expect(page.locator('[data-testid="game-player-name"]')).toBeVisible();
    await expect(
      page
        .locator('[data-testid="game-submit-button"], [data-testid="game-verbal-turn-done"]')
        .first()
    ).toBeVisible();
  });

  test('mobile responsive layout on results page', async ({ page }) => {
    await startGameWithDefaults(page);
    await submitPlayerAnswers(page, 2);
    await navigateToResults(page);

    const result = await verifyResponsiveLayout(page, {
      mobile: 393,
      tablet: 768,
      desktop: 1024,
    });

    expect(result.viewport).toBe('mobile');
    expect(result.issues.filter((i) => i.toLowerCase().includes('overflow'))).toHaveLength(0);

    await expect(page.locator('[data-testid="results-scores-container"]')).toBeVisible();
  });

  // ── Touch interactions ───────────────────────────────────────────────────

  test('touch targets meet minimum 44x44px requirement on players page', async ({ page }) => {
    await page.goto('/players');
    await page.waitForLoadState('networkidle');
    // Wait for splash screen to finish and actual page content to render
    await expect(page.locator('[data-testid="players-start-button"]')).toBeVisible({
      timeout: 15000,
    });

    const result = await verifyTouchTargets(page, 44);

    expect(result.valid).toBeGreaterThan(0);
    expect(
      result.tooSmall,
      `Interactive controls below 44x44px: ${JSON.stringify(result.tooSmall)}`
    ).toHaveLength(0);
  });

  test('tap interaction navigates from main menu to players page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the play button exists before tapping
    const playButton = page.locator('[data-testid="main-menu-play"]');
    await expect(playButton).toBeVisible({ timeout: 8000 });

    await simulateTouchGesture(page, 'tap', '[data-testid="main-menu-play"]');

    // Should navigate to players page
    await expect(page).toHaveURL(/\/players/, { timeout: 10000 });
  });

  test('touch targets meet minimum 44x44px on main menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Wait for splash screen to finish and actual page content to render
    await expect(page.locator('[data-testid="main-menu-play"]')).toBeVisible({ timeout: 15000 });

    const result = await verifyTouchTargets(page, 44);

    expect(result.valid).toBeGreaterThan(0);
    expect(
      result.tooSmall,
      `Interactive controls below 44x44px on main menu: ${JSON.stringify(result.tooSmall)}`
    ).toHaveLength(0);
  });

  // ── Complete game flows ──────────────────────────────────────────────────

  test('complete 2-player game flow on mobile viewport', async ({ page }) => {
    // 1. Navigate to main menu and verify mobile layout
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const menuLayout = await verifyResponsiveLayout(page, {
      mobile: 393,
      tablet: 768,
      desktop: 1024,
    });
    expect(menuLayout.viewport).toBe('mobile');

    // 2. Start game with 2 players
    await startGameWithDefaults(page);

    // 3. Verify game page is mobile-responsive
    const gameLayout = await verifyResponsiveLayout(page, {
      mobile: 393,
      tablet: 768,
      desktop: 1024,
    });
    expect(gameLayout.viewport).toBe('mobile');

    // 4. Submit answers for both players
    await submitPlayerAnswers(page, 2, ['Apple', 'Banana']);

    // 5. Navigate to results
    await navigateToResults(page);

    // 6. Assign scores
    await assignScores(page, [1, 2]);

    // 7. Confirm scores and wait for decision modal
    await confirmScoresAndWaitForModal(page);

    // 8. Finish game
    await finishGame(page);

    await expect(page).toHaveURL(/\/leaderboard/);
  });

  test('multi-round game works on mobile viewport', async ({ page }) => {
    // Start game and play round 1
    await startGameWithDefaults(page);
    await submitPlayerAnswers(page, 2, ['Apple', 'Banana']);
    await navigateToResults(page);
    await assignScores(page, [1, 2]);
    await confirmScoresAndWaitForModal(page);

    // Go to next round
    await goToNextRound(page);

    // Verify URL is back on game page
    await expect(page).toHaveURL(/\/game/);

    // Verify mobile layout maintained in round 2
    const layout = await verifyResponsiveLayout(page, {
      mobile: 393,
      tablet: 768,
      desktop: 1024,
    });
    expect(layout.viewport).toBe('mobile');

    // Play round 2
    await submitPlayerAnswers(page, 2, ['Car', 'Dog']);
    await navigateToResults(page);
    await assignScores(page, [2, 1]);
    await confirmScoresAndWaitForModal(page);

    // Finish game
    await finishGame(page);

    await expect(page).toHaveURL(/\/leaderboard/);
  });
});

// ---------------------------------------------------------------------------
// Tablet tests – iPad Pro 11 (834x1194px)
// Playwright project: ios-ipad-pro (uses devices['iPad Pro 11'])
// ---------------------------------------------------------------------------

test.describe('@tablet Tablet Game Flow', () => {
  // iPad Pro 11 viewport applied by the ios-ipad-pro project; also set here for standalone runs.
  test.use({ viewport: { width: 834, height: 1194 } });

  // ── Responsive layout ────────────────────────────────────────────────────

  test('tablet responsive layout on main menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await verifyResponsiveLayout(page, {
      mobile: 393,
      tablet: 768,
      desktop: 1024,
    });

    expect(result.viewport).toBe('tablet');
    expect(result.issues.filter((i) => i.toLowerCase().includes('overflow'))).toHaveLength(0);
  });

  test('tablet responsive layout on players page', async ({ page }) => {
    await page.goto('/players');
    await page.waitForLoadState('networkidle');

    const result = await verifyResponsiveLayout(page, {
      mobile: 393,
      tablet: 768,
      desktop: 1024,
    });

    expect(result.viewport).toBe('tablet');
    expect(result.issues.filter((i) => i.toLowerCase().includes('overflow'))).toHaveLength(0);
  });

  test('touch targets work correctly on tablet (players page)', async ({ page }) => {
    await page.goto('/players');
    await page.waitForLoadState('networkidle');
    // Wait for splash screen to finish and actual page content to render
    await expect(page.locator('[data-testid="players-start-button"]')).toBeVisible({
      timeout: 15000,
    });

    const result = await verifyTouchTargets(page, 44);
    expect(result.valid).toBeGreaterThan(0);
    expect(
      result.tooSmall,
      `Interactive controls below 44x44px on tablet: ${JSON.stringify(result.tooSmall)}`
    ).toHaveLength(0);
  });

  test('complete game flow works on tablet viewport', async ({ page }) => {
    // Start game and verify tablet layout
    await startGameWithDefaults(page);

    const gameLayout = await verifyResponsiveLayout(page, {
      mobile: 393,
      tablet: 768,
      desktop: 1024,
    });
    expect(gameLayout.viewport).toBe('tablet');

    // Play through game
    await submitPlayerAnswers(page, 2);
    await navigateToResults(page);

    // Verify results page is tablet-responsive
    const resultsLayout = await verifyResponsiveLayout(page, {
      mobile: 393,
      tablet: 768,
      desktop: 1024,
    });
    expect(resultsLayout.viewport).toBe('tablet');

    await assignScores(page, [1, 2]);
    await confirmScoresAndWaitForModal(page);

    // Finish game
    await finishGame(page);

    await expect(page).toHaveURL(/\/leaderboard/);
  });

  test('tap interaction works on tablet', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const playButton = page.locator('[data-testid="main-menu-play"]');
    await expect(playButton).toBeVisible({ timeout: 8000 });

    await simulateTouchGesture(page, 'tap', '[data-testid="main-menu-play"]');

    await expect(page).toHaveURL(/\/players/, { timeout: 10000 });
  });
});
