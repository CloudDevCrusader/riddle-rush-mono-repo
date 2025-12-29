import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/')

    // Check page title (supports both German "Ratefix" and English "Riddle Rush")
    await expect(page).toHaveTitle(/Ratefix|Riddle Rush|Guess Game/i)

    // Check for main heading or app title
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('should display categories', async ({ page }) => {
    await page.goto('/')

    // Wait for categories to load
    await page.waitForLoadState('networkidle')

    // Wait for loading spinner to disappear if present
    const spinner = page.locator('.spinner--overlay, [data-testid="loading-spinner"]')
    if (await spinner.count() > 0) {
      await spinner.waitFor({ state: 'hidden', timeout: 10000 })
    }

    // Check if category cards are visible
    const categoryCards = page.locator('[data-testid="category-card"], .category-card')
    await expect(categoryCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Check if navigation elements exist (use first() to avoid strict mode violation)
    const navigation = page.locator('nav, header').first()
    await expect(navigation).toBeVisible()
  })

  test('should be a PWA with manifest', async ({ page }) => {
    await page.goto('/')

    // Check for PWA manifest
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', /manifest/)
  })

  test('should have service worker registered', async ({ page }) => {
    await page.goto('/')

    // Wait for service worker to register
    await page.waitForTimeout(2000)

    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        return registration !== undefined
      }
      return false
    })

    expect(swRegistered).toBe(true)
  })

  test('should share functionality exist', async ({ page }) => {
    await page.goto('/')

    // Skip if not supported (some browsers don't support share API)
    const hasShareAPI = await page.evaluate(() => 'share' in navigator)

    if (hasShareAPI) {
      // Look for share button
      const shareButton = page.locator('button:has-text("Teilen"), button:has-text("Share"), [aria-label*="share" i]')
      if (await shareButton.count() > 0) {
        await expect(shareButton.first()).toBeVisible()
      }
    }
  })
})
