import { test, expect } from '@playwright/test'

test('basic browser test', async ({ page }) => {
  // Simple test to verify playwright is working
  await page.goto('https://example.com');
  
  // Check that the page loads
  await expect(page).toHaveTitle('Example Domain');
  
  // Verify basic page content
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
});