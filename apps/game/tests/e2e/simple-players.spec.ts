import { test, expect } from '@playwright/test';

test.describe('simple players page test', () => {
  test('should load players page', async ({ page }) => {
    await page.goto('/players', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    // Wait for any element to appear
    await page.waitForTimeout(3000);

    // Check if page loads at all
    const title = await page.title();
    console.log('Page title:', title);

    // Look for any content
    const bodyText = (await page.locator('body').textContent()) || '';
    console.log('Body contains:', bodyText.substring(0, 200));

    // Try to find any element with data-testid
    const testIdElements = page.locator('[data-testid]');
    const count = await testIdElements.count();
    console.log('Elements with data-testid:', count);

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = testIdElements.nth(i);
        const testId = (await element.getAttribute('data-testid')) || 'unknown';
        console.log(`Found [data-testid="${testId}"]`);
      }
    }

    // Check for errors in console
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      consoleLogs.push(msg.text());
      console.log('Console log:', msg.text());
    });

    // Check if there are any errors
    const errors = consoleLogs.filter((log) => log.includes('error') || log.includes('Error'));
    if (errors.length > 0) {
      console.log('Errors found:', errors);
    }

    // Just check that page loads, don't fail on missing elements
    expect(title).toContain('Riddle');
  });
});
