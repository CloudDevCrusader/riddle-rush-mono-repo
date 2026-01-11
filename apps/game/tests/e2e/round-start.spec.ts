import { test, expect } from '@playwright/test'

test.describe('Round Start Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up game state first
    await page.goto('/players')
    await page.waitForLoadState('networkidle')

    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await page.waitForTimeout(500)

    // Should navigate to round-start
    await expect(page).toHaveURL(/\/round-start/)
  })

  test('should display round-start page with all elements', async ({ page }) => {
    // Check for background
    const background = page.locator('.page-bg')
    await expect(background).toBeVisible()

    // Check for fortune wheels
    const wheelsContainer = page.locator('.wheels-container')
    await expect(wheelsContainer).toBeVisible()

    // Check for category wheel
    const categoryWheel = page.locator('.wheel-wrapper').first()
    await expect(categoryWheel).toBeVisible()

    // Check for letter wheel
    const letterWheel = page.locator('.wheel-wrapper').last()
    await expect(letterWheel).toBeVisible()
  })

  test('should spin both wheels automatically', async ({ page }) => {
    // Wheels should start spinning automatically
    const wheelsContainer = page.locator('.wheels-container')
    await expect(wheelsContainer).toBeVisible()

    // Wait for wheels to complete spinning
    await page.waitForTimeout(3000)

    // After spinning, should show results display
    const resultsDisplay = page.locator('.results-display')
    await expect(resultsDisplay).toBeVisible({ timeout: 5000 })
  })

  test('should display selected category and letter after spinning', async ({ page }) => {
    // Wait for wheels to complete
    await page.waitForTimeout(3000)

    // Should show results with category and letter
    const resultsDisplay = page.locator('.results-display')
    await expect(resultsDisplay).toBeVisible({ timeout: 5000 })

    const resultValue = page.locator('.result-value')
    await expect(resultValue.first()).toBeVisible()
    await expect(resultValue.last()).toBeVisible()
  })

  test('should automatically navigate to game after selection', async ({ page }) => {
    // Wait for wheels to spin and game to start
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Verify we're on game page
    const roundIndicator = page.locator('.round-indicator')
    await expect(roundIndicator).toBeVisible()
  })

  test('should display round indicator', async ({ page }) => {
    const roundIndicator = page.locator('.round-indicator')
    await expect(roundIndicator).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const wheelsContainer = page.locator('.wheels-container')
    await expect(wheelsContainer).toBeVisible()
  })
})
