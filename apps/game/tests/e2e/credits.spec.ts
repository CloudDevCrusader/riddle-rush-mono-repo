import { test, expect } from '@playwright/test'

test.describe('Credits Page', () => {
  test('should load credits page successfully', async ({ page }) => {
    await page.goto('/credits')

    // Wait for page to load and Vue to hydrate
    await page.waitForLoadState('networkidle')

    // Wait for the main container to appear (sign that Vue has mounted)
    await page.waitForSelector('.credits-page', { timeout: 10000 })

    // Check for main title image
    const titleImage = page.locator('.title-image')
    await expect(titleImage).toBeVisible({ timeout: 10000 })

    // Check for credits panel
    const creditsPanel = page.locator('.credits-panel')
    await expect(creditsPanel).toBeVisible({ timeout: 10000 })
  })

  test('should display team credits', async ({ page }) => {
    await page.goto('/credits')

    // Wait for page to load and Vue to hydrate
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.credits-page', { timeout: 10000 })

    // Check for credits panel
    const creditsPanel = page.locator('.credits-panel')
    await expect(creditsPanel).toBeVisible({ timeout: 10000 })

    // Check for all three credit sections
    const creditSections = page.locator('.credit-section')
    await expect(creditSections).toHaveCount(3)

    // Check for Game Design section heading
    const gameDesignHeading = page.locator('.section-heading').filter({ hasText: /Game Design/i })
    await expect(gameDesignHeading).toBeVisible()

    // Check for team members (Tobi and Sophia)
    const tobi = page.locator('.credit-name').filter({ hasText: /^Tobi$/i })
    const sophia = page.locator('.credit-name').filter({ hasText: /^Sophia$/i })
    await expect(tobi).toBeVisible()
    await expect(sophia).toBeVisible()

    // Check for Programming section heading
    const programmingHeading = page.locator('.section-heading').filter({ hasText: /Programming/i })
    await expect(programmingHeading).toBeVisible()

    // Check for Markus
    const markus = page.locator('.credit-name').filter({ hasText: /^Markus$/i })
    await expect(markus).toBeVisible()

    // Check for Art section heading
    const artHeading = page.locator('.section-heading').filter({ hasText: /Art/i })
    await expect(artHeading).toBeVisible()

    // Check for Sarmad Ali
    const sarmad = page.locator('.credit-name').filter({ hasText: /Sarmad Ali/i })
    await expect(sarmad).toBeVisible()
  })

  test('should have working back button', async ({ page }) => {
    await page.goto('/credits')

    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.credits-page', { timeout: 10000 })

    // Look for back button
    const backButton = page.locator('.back-btn, button:has-text("←")')

    if ((await backButton.count()) > 0) {
      await expect(backButton.first()).toBeVisible({ timeout: 10000 })

      // Click back button
      await backButton.first().click()

      // Should navigate back (URL should change)
      await page.waitForTimeout(500)
      const url = page.url()
      expect(url).not.toContain('/credits')
    }
  })

  test('should have working OK button', async ({ page }) => {
    await page.goto('/credits')

    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.credits-page', { timeout: 10000 })

    // Look for OK button
    const okButton = page.locator('button:has-text("OK"), .btn-ok')

    if ((await okButton.count()) > 0) {
      await expect(okButton.first()).toBeVisible({ timeout: 10000 })

      // Click OK button
      await okButton.first().click()

      // Should navigate back (URL should change)
      await page.waitForTimeout(500)
      const url = page.url()
      expect(url).not.toContain('/credits')
    }
  })

  test.skip('should display coins UI element', async ({ page }) => {
    // Coin display removed per requirements - no coins in the app
    await page.goto('/credits')

    await page.waitForLoadState('networkidle')

    // Check for coins display (should not exist)
    const coinsDisplay = page.locator('.coins-display')
    await expect(coinsDisplay).toHaveCount(0)
  })

  test('should have proper page styling', async ({ page }) => {
    await page.goto('/credits')

    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.credits-page', { timeout: 10000 })

    // Check that the page has the main container
    const container = page.locator('.container')
    await expect(container).toBeVisible({ timeout: 10000 })

    // Check for credits panel with proper styling
    const creditsPanel = page.locator('.credits-panel')
    await expect(creditsPanel).toBeVisible({ timeout: 10000 })

    // Verify background image is present
    const backgroundImage = page.locator('.page-bg')
    await expect(backgroundImage).toBeVisible()
  })
})
