import { expect, test } from '@playwright/test'

test.describe('performance smoke', () => {
  test('home route becomes interactive', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('[data-testid="main-menu-play"]')).toBeVisible()
    await expect(page.locator('[data-testid="main-menu-options"]')).toBeVisible()
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
  })
})
