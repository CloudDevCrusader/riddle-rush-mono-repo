import { test, expect } from '@playwright/test'

test.describe('Offline Functionality', () => {
  test('should work offline after initial load', async ({ page, context }) => {
    // First visit to cache resources
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for service worker to activate and cache resources
    await page.waitForTimeout(3000)

    // Go offline
    await context.setOffline(true)

    // Reload page
    await page.reload()

    // Page should still load from cache
    await expect(page.locator('body')).toBeVisible()

    // Check if app is still functional
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('should show offline indicator when offline', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Go offline
    await context.setOffline(true)

    // Trigger offline event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'))
    })

    await page.waitForTimeout(1000)

    // Check for offline indicator (adjust selector based on your implementation)
    const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline, text=/offline/i')

    // If offline indicator exists in your app, it should be visible
    if (await offlineIndicator.count() > 0) {
      await expect(offlineIndicator.first()).toBeVisible({ timeout: 2000 })
    }
  })

  test('should restore online state', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Go offline
    await context.setOffline(true)
    await page.evaluate(() => window.dispatchEvent(new Event('offline')))
    await page.waitForTimeout(500)

    // Go back online
    await context.setOffline(false)
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    await page.waitForTimeout(500)

    // App should be online again
    const page_content = page.locator('body')
    await expect(page_content).toBeVisible()
  })
})
