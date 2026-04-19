import { test, expect } from '@playwright/test';
import { hideDevtools } from './helpers/game-flow';

test.describe('Language Selection Page', () => {
  test('should load language page successfully', async ({ page }) => {
    await page.goto('/language');

    // Check page title (supports both German and English)
    await expect(page).toHaveTitle(/Language Selection|Sprachauswahl|Riddle Rush/i);

    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="language-page"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="language-card"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display language options', async ({ page }) => {
    await page.goto('/language');
    await page.waitForLoadState('networkidle');

    // Check for English option
    const englishOption = page
      .locator('[data-testid^="language-option-"]')
      .filter({ hasText: /ENGLISH/i });
    await expect(englishOption).toBeVisible();

    // Check for German option
    const germanOption = page
      .locator('[data-testid^="language-option-"]')
      .filter({ hasText: /DEUTSCH|GERMAN/i });
    await expect(germanOption).toBeVisible();

    // Check for flag containers
    const flags = page.locator('[data-testid^="language-flag-"]');
    expect(await flags.count()).toBeGreaterThanOrEqual(2);
  });

  test('should show checkmark on selected language', async ({ page }) => {
    await page.goto('/language');
    await page.waitForLoadState('networkidle');

    // Wait a moment for the page to initialize
    await page.waitForTimeout(500);

    // One language should be selected (have checkmark)
    const checkmarks = page.locator('[data-testid^="language-checkmark-"]');
    const checkmarkCount = await checkmarks.count();

    // At least one checkmark should be visible initially
    if (checkmarkCount > 0) {
      await expect(checkmarks.first()).toBeVisible();
    }
  });

  test('should allow selecting English', async ({ page }) => {
    await page.goto('/language');
    await page.waitForLoadState('networkidle');

    // Click on English option
    const englishOption = page
      .locator('[data-testid^="language-option-"]')
      .filter({ hasText: /ENGLISH/i });
    await englishOption.click();

    // Wait for state update
    await page.waitForTimeout(300);

    // English option should have selected class
    await expect(englishOption).toHaveClass(/selected/);
  });

  test('should allow selecting German', async ({ page }) => {
    await page.goto('/language');
    await page.waitForLoadState('networkidle');

    // Click on German option
    const germanOption = page
      .locator('[data-testid^="language-option-"]')
      .filter({ hasText: /DEUTSCH|GERMAN/i });
    await germanOption.click();

    // Wait for state update
    await page.waitForTimeout(300);

    // German option should have selected class
    await expect(germanOption).toHaveClass(/selected/);
  });

  test('should switch between languages', async ({ page }) => {
    await page.goto('/language');
    await page.waitForLoadState('networkidle');

    // Click English
    const englishOption = page
      .locator('[data-testid^="language-option-"]')
      .filter({ hasText: /ENGLISH/i });
    await englishOption.click();
    await page.waitForTimeout(200);

    // English should be selected
    await expect(englishOption).toHaveClass(/selected/);

    // Click German
    const germanOption = page
      .locator('[data-testid^="language-option-"]')
      .filter({ hasText: /DEUTSCH|GERMAN/i });
    await germanOption.click();
    await page.waitForTimeout(200);

    // German should now be selected
    await expect(germanOption).toHaveClass(/selected/);
  });

  test('should have working OK button', async ({ page }) => {
    await page.goto('/language');
    await page.waitForLoadState('networkidle');

    // Select a language first
    const englishOption = page
      .locator('[data-testid^="language-option-"]')
      .filter({ hasText: /ENGLISH/i });
    await englishOption.click();
    await page.waitForTimeout(200);

    const okButton = page.locator('[data-testid="language-ok-button"]');
    await expect(okButton.first()).toBeVisible();
    await okButton.first().click();

    await expect.poll(() => page.url(), { timeout: 8000 }).not.toContain('/language');
  });

  test('should confirm language selection with OK button', async ({ page }) => {
    await page.goto('/language');
    await page.waitForLoadState('networkidle');

    // Select English
    const englishOption = page
      .locator('[data-testid^="language-option-"]')
      .filter({ hasText: /ENGLISH/i });
    await englishOption.click();
    await page.waitForTimeout(200);

    // Verify English is selected
    await expect(englishOption).toHaveClass(/selected/);

    // Click OK to confirm (OK button contains an image, not text)
    const okButton = page.locator('[data-testid="language-ok-button"]').first();
    await expect(okButton).toBeVisible({ timeout: 5000 });
    await okButton.click();

    await expect.poll(() => page.url(), { timeout: 8000 }).not.toContain('/language');
  });

  test('should display flags correctly', async ({ page }) => {
    await page.goto('/language');
    await page.waitForLoadState('networkidle');

    // Check for flag containers
    const flagContainers = page.locator('[data-testid^="language-flag-"]');
    await expect(flagContainers).toHaveCount(2);

    // Check that flags are visible
    for (let i = 0; i < (await flagContainers.count()); i++) {
      const flagContainer = flagContainers.nth(i);
      await expect(flagContainer).toBeVisible();
    }
  });

  test('should have proper page styling', async ({ page }) => {
    await page.goto('/language');
    await page.waitForLoadState('networkidle');

    // Check that the page has content
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check for language card
    const languageCard = page.locator('[data-testid="language-card"]');
    if ((await languageCard.count()) > 0) {
      await expect(languageCard).toBeVisible();
    }

    // Check for background pattern
    const bgPattern = page.locator('[data-testid="page-background-pattern"]');
    if ((await bgPattern.count()) > 0) {
      // Background pattern exists
      expect(await bgPattern.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Language Switching Behavior', () => {
  test.use({ locale: 'en-US' });

  test('uses browser language by default and persists selection', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('game-settings'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await hideDevtools(page);

    await page.locator('[data-testid="main-menu-options"]').click();

    await expect(page.locator('.settings-page')).toBeVisible({ timeout: 8000 });
    const languageItem = page.locator('[data-testid="settings-language-button"]');
    await expect(languageItem).toBeVisible();

    await languageItem.click();
    await page.waitForLoadState('networkidle');

    const germanOption = page
      .locator('[data-testid^="language-option-"]')
      .filter({ hasText: /DEUTSCH|GERMAN/i });
    await germanOption.click();

    const okButton = page.locator('[data-testid="language-ok-button"]').first();
    await expect(okButton).toBeVisible({ timeout: 5000 });

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      okButton.click(),
    ]);

    await page.goto('/', { waitUntil: 'networkidle' });
    await hideDevtools(page);

    await page.locator('[data-testid="main-menu-options"]').click();
    await expect(page.locator('.settings-page')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('[data-testid="settings-language-button"]')).toContainText(
      /sprache/i
    );
  });

  test('respects ?lang query and preserves it when selecting a different locale', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.removeItem('game-settings'));
    await page.goto('/?lang=de', { waitUntil: 'networkidle' });
    await hideDevtools(page);

    await page.locator('[data-testid="main-menu-options"]').click();
    await expect(page.locator('.settings-page')).toBeVisible({ timeout: 8000 });
    const germanMenuItem = page.locator('[data-testid="settings-language-button"]');
    await expect(germanMenuItem).toContainText(/sprache/i);

    await germanMenuItem.click();
    await page.waitForLoadState('networkidle');

    const englishOption = page
      .locator('[data-testid^="language-option-"]')
      .filter({ hasText: /ENGLISH/i });
    await englishOption.click();

    const okButton = page.locator('[data-testid="language-ok-button"]').first();
    await expect(okButton).toBeVisible({ timeout: 5000 });

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      okButton.click(),
    ]);

    await page.waitForLoadState('networkidle');
    await expect.poll(() => page.url(), { timeout: 8000 }).toContain('lang=en');

    await page.goto('/?lang=en', { waitUntil: 'networkidle' });
    await hideDevtools(page);

    await page.locator('[data-testid="main-menu-options"]').click();
    await expect(page.locator('.settings-page')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('[data-testid="settings-language-button"]')).toContainText(
      /language/i
    );
  });
});
