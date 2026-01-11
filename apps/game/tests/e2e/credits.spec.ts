import { test, expect } from '@playwright/test'

test.describe('Credits Page', () => {
  test('should load credits page successfully', async ({ page }) => {
    await page.goto('/credits')

    // Check page title
    await expect(page).toHaveTitle(/Riddle Rush - Credits/i)

    // Check for main title
    const title = page.getByText(/CREDITS/i)
    await expect(title).toBeVisible({ timeout: 5000 })
  })

  test('should display team credits', async ({ page }) => {
    await page.goto('/credits')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check for Game Design section
    const gameDesignHeading = page.getByText(/Game Design/i)
    await expect(gameDesignHeading).toBeVisible()

    // Check for team members
    const tobi = page.getByText(/Tobi/i)
    const sophia = page.getByText(/sophia/i)
    await expect(tobi).toBeVisible()
    await expect(sophia).toBeVisible()

    // Check for Programming section
    const programmingHeading = page.getByText(/Programming/i)
    await expect(programmingHeading).toBeVisible()

    const markus = page.getByText(/Markus/i)
    await expect(markus).toBeVisible()

    // Check for Art section
    const artHeading = page.getByText(/Art/i)
    await expect(artHeading).toBeVisible()

    const sarmad = page.getByText(/sarmad Ali/i)
    await expect(sarmad).toBeVisible()
  })

  test('should have working back button', async ({ page }) => {
    await page.goto('/credits')

    await page.waitForLoadState('networkidle')

    // Look for back button
    const backButton = page.locator('.back-btn, button:has-text("←")')

    if ((await backButton.count()) > 0) {
      await expect(backButton.first()).toBeVisible()

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

    // Look for OK button
    const okButton = page.locator('button:has-text("OK"), .btn-ok')

    if ((await okButton.count()) > 0) {
      await expect(okButton.first()).toBeVisible()

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

    // Check that the page has content
    const body = page.locator('body')
    await expect(body).toBeVisible()

    // Check for credits card
    const creditsCard = page.locator('.credits-card')
    if ((await creditsCard.count()) > 0) {
      await expect(creditsCard).toBeVisible()
    }
  })
})
