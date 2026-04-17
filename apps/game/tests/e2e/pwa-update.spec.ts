import { test, expect } from '@playwright/test';
import { hideDevtools } from './helpers/game-flow';

interface PwaUpdateE2EWindow extends Window {
  __pwaUpdateE2E?: { trigger: () => void; dismiss: () => Promise<void> };
  __NUXT__?: { config?: { devtools?: boolean } };
}

async function waitForE2EHook(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(
    () => Boolean((window as PwaUpdateE2EWindow).__pwaUpdateE2E?.trigger),
    { timeout: 20000 }
  );
}

async function triggerUpdateViaHook(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    (window as PwaUpdateE2EWindow).__pwaUpdateE2E?.trigger();
  });
}

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

    await waitForE2EHook(page);
    await triggerUpdateViaHook(page);

    const toast = page.getByTestId('toast-pwa-update');
    await expect(toast).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /reload|neu laden/i })).toBeVisible();
  });

  test('close button dismisses PWA update toast', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await hideDevtools(page);

    await waitForE2EHook(page);
    await triggerUpdateViaHook(page);

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

    await waitForE2EHook(page);
  });
});

test.describe('PWA Update — simulated deployment flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { playwrightTest?: boolean }).playwrightTest = true;
    });
  });

  test('shows update notification after simulated new version deployment', async ({
    page,
    context,
  }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await hideDevtools(page);

    await waitForE2EHook(page);

    const toastBefore = page.getByTestId('toast-pwa-update');
    await expect(toastBefore).toHaveCount(0);

    await triggerUpdateViaHook(page);

    await expect(page.getByTestId('toast-pwa-update')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('toast-pwa-update')).toContainText(
      /update|neue version|aktualisierung/i
    );

    const reloadBtn = page.getByRole('button', { name: /reload|neu laden/i });
    await expect(reloadBtn).toBeVisible();

    const closeBtn = page.locator('.toast-pwa-update .toast-close');
    await expect(closeBtn).toBeVisible();
  });

  test('update notification persists across page navigation until dismissed', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await hideDevtools(page);

    await waitForE2EHook(page);
    await triggerUpdateViaHook(page);

    await expect(page.getByTestId('toast-pwa-update')).toBeVisible({ timeout: 10000 });

    await page.goto('/players', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByTestId('toast-pwa-update')).toBeVisible({ timeout: 10000 });
  });

  test('dismissed notification does not reappear on navigation', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await hideDevtools(page);

    await waitForE2EHook(page);
    await triggerUpdateViaHook(page);

    await expect(page.getByTestId('toast-pwa-update')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /close|schließen/i }).click();

    await expect(page.getByTestId('toast-pwa-update')).toHaveCount(0);

    await page.goto('/players', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByTestId('toast-pwa-update')).toHaveCount(0);
  });

  test('notification reappears when a new update is triggered after dismissal', async ({
    page,
  }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await hideDevtools(page);

    await waitForE2EHook(page);
    await triggerUpdateViaHook(page);

    await expect(page.getByTestId('toast-pwa-update')).toBeVisible({ timeout: 10000 });

    await page.evaluate(() => {
      (window as PwaUpdateE2EWindow).__pwaUpdateE2E?.dismiss();
    });

    await expect(page.getByTestId('toast-pwa-update')).toHaveCount(0);

    await page.evaluate(() => {
      (window as PwaUpdateE2EWindow).__pwaUpdateE2E?.trigger();
    });

    await expect(page.getByTestId('toast-pwa-update')).toBeVisible({ timeout: 10000 });
  });

  test('only one notification shown even with multiple trigger calls', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await hideDevtools(page);

    await waitForE2EHook(page);

    await triggerUpdateViaHook(page);
    await triggerUpdateViaHook(page);
    await triggerUpdateViaHook(page);

    await expect(page.getByTestId('toast-pwa-update')).toHaveCount(1);
  });

  test('toast icon and styling indicate update type', async ({ page }) => {
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await hideDevtools(page);

    await waitForE2EHook(page);
    await triggerUpdateViaHook(page);

    const toast = page.getByTestId('toast-pwa-update');
    await expect(toast).toBeVisible({ timeout: 10000 });

    await expect(toast).toHaveClass(/toast-pwa-update/);

    const icon = toast.locator('.toast-icon');
    await expect(icon).toBeVisible();
    await expect(icon).toContainText('↻');

    const message = toast.locator('.toast-message');
    await expect(message).toBeVisible();
  });
});
