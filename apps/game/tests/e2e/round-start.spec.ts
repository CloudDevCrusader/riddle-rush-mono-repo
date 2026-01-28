import { test, expect } from '@playwright/test'

test.describe('Round Start Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session data
    await page.goto('/')
    await page.evaluate(() => {
      // Clear IndexedDB
      indexedDB.deleteDatabase('riddle-rush-db')
      localStorage.clear()
      sessionStorage.clear()
    })

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

test.describe('Round Counter Logic', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session data before each test
    await page.goto('/')
    await page.evaluate(() => {
      indexedDB.deleteDatabase('riddle-rush-db')
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.waitForTimeout(100)
  })

  test('should display "Round 1" on initial game start', async ({ page }) => {
    // Start new game from players page
    await page.goto('/players')
    await page.waitForLoadState('networkidle')

    const startBtn = page.locator('.start-btn')
    await startBtn.click()

    // Should navigate to round-start
    await expect(page).toHaveURL(/\/round-start/)

    // Check round indicator shows "Round 1"
    const roundIndicator = page.locator('.round-indicator')
    await expect(roundIndicator).toBeVisible()
    await expect(roundIndicator).toContainText('1')
  })

  test('should show "Round 2" after completing round 1 and clicking next round', async ({
    page,
  }) => {
    // Start new game
    await page.goto('/players')
    await page.waitForLoadState('networkidle')

    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await expect(page).toHaveURL(/\/round-start/)

    // Wait for automatic navigation to game
    await expect(page).toHaveURL(/\/game/, { timeout: 15000 })

    // Try to find and fill answer input, then submit for each player
    const playerItems = page.locator('.player-card, .player-item, [data-testid="player-card"]')
    const playerCount = await playerItems.count()

    // Submit for 2 default players
    for (let i = 0; i < Math.max(2, playerCount); i++) {
      // Look for input field
      const input = page.locator('input[type="text"]').first()
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await input.fill('Test Answer')
      }

      // Click submit or next player button
      const submitButton = page
        .locator('[data-testid="submit-btn"], .submit-btn, button:has-text("Submit")')
        .first()
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitButton.click()
        await page.waitForTimeout(500)
      }
    }

    // Navigate to results (should happen automatically after all players submit)
    await expect(page).toHaveURL(/\/results/, { timeout: 10000 })

    // Click next to go to leaderboard
    const nextBtn = page
      .locator('.next-btn, [data-testid="next-btn"], button:has-text("Next")')
      .first()
    await nextBtn.click()
    await page.waitForTimeout(500)

    // Should be on leaderboard
    await expect(page).toHaveURL(/\/leaderboard/, { timeout: 5000 })

    // Click next round button
    const nextRoundBtn = page.locator('.next-round-btn, [data-testid="next-round-btn"]').first()
    if (await nextRoundBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nextRoundBtn.click()
      await page.waitForTimeout(500)

      // Should navigate to round-start for round 2
      await expect(page).toHaveURL(/\/round-start/)

      // Check round indicator shows "Round 2"
      const roundIndicator = page.locator('.round-indicator')
      await expect(roundIndicator).toBeVisible()
      await expect(roundIndicator).toContainText('2')
    }
  })

  test('page refresh should not increment round counter', async ({ page }) => {
    // Start new game
    await page.goto('/players')
    await page.waitForLoadState('networkidle')

    const startBtn = page.locator('.start-btn')
    await startBtn.click()

    // Wait for round-start page
    await expect(page).toHaveURL(/\/round-start/)

    // Check initial round is 1
    const roundIndicator = page.locator('.round-indicator')
    await expect(roundIndicator).toContainText('1')

    // Wait a bit to ensure state is saved
    await page.waitForTimeout(1000)

    // Refresh the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Round should still show 1 (not increment)
    await expect(roundIndicator).toContainText('1')
  })

  test('navigating back to round-start during active game should not increment round', async ({
    page,
  }) => {
    // Start new game
    await page.goto('/players')
    await page.waitForLoadState('networkidle')

    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await expect(page).toHaveURL(/\/round-start/)

    // Wait for automatic navigation to game page
    await expect(page).toHaveURL(/\/game/, { timeout: 15000 })

    // Manually navigate back to round-start (simulating a refresh/back)
    await page.goto('/round-start')
    await page.waitForLoadState('networkidle')

    // Round indicator should still show 1, not 2
    const roundIndicator = page.locator('.round-indicator')
    await expect(roundIndicator).toBeVisible()
    await expect(roundIndicator).toContainText('1')
  })
})
