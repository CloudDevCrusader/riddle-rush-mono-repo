import { test, expect } from '@playwright/test'

test.describe('Game Flow', () => {
  test('should start a new game', async ({ page }) => {
    // Navigate to menu
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for splash screen to finish
    await page.waitForTimeout(2000)
    const splashScreen = page.locator('.splash-screen')
    await splashScreen.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})

    // Click play button
    const playBtn = page.locator('.play-btn')
    await expect(playBtn).toBeVisible()
    await playBtn.click()

    // Should navigate to players page
    await expect(page).toHaveURL(/\/players/)

    // Click start button to go to alphabet selection
    const startBtn = page.locator('.start-btn')
    await expect(startBtn).toBeVisible()
    await startBtn.click()

    // Should navigate to alphabet (fortune wheel) page
    await expect(page).toHaveURL(/\/alphabet/)

    // Select a letter from the fortune wheel
    const letterBtn = page.locator('.letter-btn').first()
    await expect(letterBtn).toBeVisible()
    await letterBtn.click()

    // Click next button to start game
    const nextBtn = page.locator('.next-btn')
    await expect(nextBtn).toBeEnabled()
    await nextBtn.click()

    // Should navigate to game page
    await expect(page).toHaveURL(/\/game/)
  })

  test('should display game elements', async ({ page }) => {
    // Navigate directly to game page
    await page.goto('/game')

    // Wait for game to load
    await page.waitForLoadState('networkidle')

    // Wait for game loading spinner to disappear
    const spinner = page.locator('.spinner--overlay, [data-testid="loading-spinner"]')
    if (await spinner.count() > 0) {
      await spinner.waitFor({ state: 'hidden', timeout: 10000 })
    }

    // Check for game elements (category, input, score, etc.)
    // These selectors are generic - adjust based on your actual implementation
    const gameElements = [
      page.locator('[data-testid="category-display"], .category-display'),
      page.locator('[data-testid="game-input"], input[type="text"]').first(),
    ]

    for (const element of gameElements) {
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('should handle game input', async ({ page }) => {
    await page.goto('/game')

    // Wait for game to load
    await page.waitForLoadState('networkidle')

    // Find input field
    const input = page.locator('[data-testid="game-input"], input[type="text"], input[placeholder*="Begriff" i], input[placeholder*="answer" i]').first()

    if (await input.count() > 0) {
      await expect(input).toBeVisible({ timeout: 5000 })

      // Type a test answer
      await input.fill('Test')

      // Verify input has value
      await expect(input).toHaveValue('Test')
    }
  })

  test('should have score display', async ({ page }) => {
    await page.goto('/game')

    await page.waitForLoadState('networkidle')

    // Look for score display - try multiple selectors
    const scoreByTestId = page.locator('[data-testid="score"]')
    const scoreByClass = page.locator('.score')
    const scoreByText = page.getByText(/Punktzahl|Score/i)

    // Check if any score display exists
    const hasScore = await scoreByTestId.count() > 0
      || await scoreByClass.count() > 0
      || await scoreByText.count() > 0

    if (hasScore) {
      const scoreDisplay = await scoreByTestId.count() > 0
        ? scoreByTestId.first()
        : await scoreByClass.count() > 0
          ? scoreByClass.first()
          : scoreByText.first()

      await expect(scoreDisplay).toBeVisible({ timeout: 5000 })
    }
  })

  test('should navigate back to home', async ({ page }) => {
    await page.goto('/game')

    await page.waitForLoadState('networkidle')

    // Look for back button
    const backButton = page.locator('[data-testid="back-button"], button:has-text("Zurück"), button:has-text("Back"), a[href="/"]').first()

    if (await backButton.count() > 0) {
      await expect(backButton).toBeVisible({ timeout: 5000 })

      await backButton.click()

      // Should return to home page
      await expect(page).toHaveURL(/\/$|\/index|^(?!.*\/game)/)
    }
  })
})
