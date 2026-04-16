import { test, expect } from '@playwright/test';
import { hideDevtools } from './helpers/game-flow';

test.describe('PWA Update Notification', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { playwrightTest?: boolean }).playwrightTest = true;
    });
  });

  test('shows toast and reload control when E2E hook triggers update', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await hideDevtools(page);

    await page.waitForFunction(
      () =>
        Boolean(
          (window as Window & { __pwaUpdateE2E?: { trigger: () => void } }).__pwaUpdateE2E?.trigger
        ),
      { timeout: 20000 }
    );

    await page.evaluate(() => {
      (window as Window & { __pwaUpdateE2E?: { trigger: () => void } }).__pwaUpdateE2E?.trigger();
    });

    const toast = page.getByTestId('toast-pwa-update');
    await expect(toast).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /reload|neu laden/i })).toBeVisible();
  });

  test('close button dismisses PWA update toast', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await hideDevtools(page);

    await page.waitForFunction(
      () =>
        Boolean(
          (window as Window & { __pwaUpdateE2E?: { trigger: () => void } }).__pwaUpdateE2E?.trigger
        ),
      { timeout: 20000 }
    );

    await page.evaluate(() => {
      (window as Window & { __pwaUpdateE2E?: { trigger: () => void } }).__pwaUpdateE2E?.trigger();
    });

    await expect(page.getByTestId('toast-pwa-update')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /close|schließen/i }).click();

    await expect(page.getByTestId('toast-pwa-update')).toHaveCount(0);
  });

  test('mobile viewport loads with toast hook available @mobile-only', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await hideDevtools(page);

    await expect(page.locator('body')).toBeVisible();

    const viewport = page.viewportSize();
    expect(viewport?.width).toBeDefined();
    if (viewport?.width != null) {
      expect(viewport.width).toBeLessThanOrEqual(500);
    }

    await page.waitForFunction(
      () =>
        Boolean(
          (window as Window & { __pwaUpdateE2E?: { trigger: () => void } }).__pwaUpdateE2E?.trigger
        ),
      { timeout: 20000 }
    );
  });
});
