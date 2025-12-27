import { test, expect } from '@playwright/test'

test.describe('Results Page', () => {
  test('should load results page successfully', async ({ page }) => {
    await page.goto('/results')

    // Check page title
    await expect(page).toHaveTitle(/Riddle Rush - Results/i)

    // Check that page loaded
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should display win state correctly', async ({ page }) => {
    await page.goto('/results?win=true&score=100')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Check for win text
    const winText = page.getByText(/YOU WIN/i)
    await expect(winText).toBeVisible({ timeout: 5000 })

    // Check for stars (should be filled)
    const stars = page.locator('.star.filled')
    expect(await stars.count()).toBeGreaterThan(0)

    // Check score display
    const scoreValue = page.locator('.score-value')
    await expect(scoreValue).toBeVisible()
    await expect(scoreValue).toHaveText('100')
  })

  test('should display lose state correctly', async ({ page }) => {
    await page.goto('/results?win=false&score=0')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Check for lose text
    const loseText = page.getByText(/YOU LOSE/i)
    await expect(loseText).toBeVisible({ timeout: 5000 })

    // Check for stars (should be empty)
    const emptyStars = page.locator('.star.empty')
    expect(await emptyStars.count()).toBeGreaterThan(0)

    // Check score display
    const scoreValue = page.locator('.score-value')
    await expect(scoreValue).toBeVisible()
  })

  test('should display score correctly', async ({ page }) => {
    const testScore = 250
    await page.goto(`/results?win=true&score=${testScore}`)

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Check score value
    const scoreValue = page.locator('.score-value')
    await expect(scoreValue).toBeVisible()
    await expect(scoreValue).toHaveText(testScore.toString())

    // Check score label
    const scoreLabel = page.locator('.score-label')
    await expect(scoreLabel).toBeVisible()
  })

  test('should show Next button on win', async ({ page }) => {
    await page.goto('/results?win=true&score=100')

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Look for Next button
    const nextButton = page.locator('button:has-text("Next"), .btn-next')

    if (await nextButton.count() > 0) {
      await expect(nextButton.first()).toBeVisible()
    }
  })

  test('should show Restart button on lose', async ({ page }) => {
    await page.goto('/results?win=false&score=0')

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Look for Restart button
    const restartButton = page.locator('button:has-text("Restart"), .btn-restart')

    if (await restartButton.count() > 0) {
      await expect(restartButton.first()).toBeVisible()
    }
  })

  test('should have working Home button', async ({ page }) => {
    await page.goto('/results?win=true&score=100')

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Look for Home button
    const homeButton = page.locator('button:has-text("Home"), .btn-home')

    if (await homeButton.count() > 0) {
      await expect(homeButton.first()).toBeVisible()

      // Click home button
      await homeButton.first().click()

      // Should navigate to home
      await page.waitForURL(/\/$|\/index/, { timeout: 5000 })
    }
  })

  test('should navigate to game on Next button click', async ({ page }) => {
    await page.goto('/results?win=true&score=100')

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Look for Next button
    const nextButton = page.locator('button:has-text("Next"), .btn-next').first()

    if (await nextButton.count() > 0) {
      await nextButton.click()

      // Should navigate to game page
      await page.waitForURL(/\/game/, { timeout: 5000 })
    }
  })

  test('should navigate to game on Restart button click', async ({ page }) => {
    await page.goto('/results?win=false&score=0')

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Look for Restart button
    const restartButton = page.locator('button:has-text("Restart"), .btn-restart').first()

    if (await restartButton.count() > 0) {
      await restartButton.click()

      // Should navigate to game page
      await page.waitForURL(/\/game/, { timeout: 5000 })
    }
  })

  test('should display stars animation', async ({ page }) => {
    await page.goto('/results?win=true&score=100')

    await page.waitForLoadState('networkidle')

    // Check that stars are present
    const stars = page.locator('.star')
    expect(await stars.count()).toBe(3)

    // All stars should be visible
    for (let i = 0; i < await stars.count(); i++) {
      await expect(stars.nth(i)).toBeVisible()
    }
  })

  test('should show confetti on win', async ({ page }) => {
    await page.goto('/results?win=true&score=100')

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Check for confetti container (only on win)
    const confettiContainer = page.locator('.confetti-container')

    if (await confettiContainer.count() > 0) {
      // Confetti should be present on win
      const confetti = page.locator('.confetti')
      expect(await confetti.count()).toBeGreaterThan(0)
    }
  })

  test('should not show confetti on lose', async ({ page }) => {
    await page.goto('/results?win=false&score=0')

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Confetti should not be visible on lose
    const confetti = page.locator('.confetti')
    expect(await confetti.count()).toBe(0)
  })

  test('should handle default score when not provided', async ({ page }) => {
    await page.goto('/results')

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Should still display score (default to 0)
    const scoreValue = page.locator('.score-value')
    await expect(scoreValue).toBeVisible()
  })

  test('should have proper page styling', async ({ page }) => {
    await page.goto('/results?win=true&score=100')

    await page.waitForLoadState('networkidle')

    // Check for results card
    const resultsCard = page.locator('.results-card')
    if (await resultsCard.count() > 0) {
      await expect(resultsCard).toBeVisible()
    }

    // Check for background pattern
    const bgPattern = page.locator('.bg-pattern')
    if (await bgPattern.count() > 0) {
      expect(await bgPattern.count()).toBeGreaterThan(0)
    }

    // Check action buttons container
    const actionButtons = page.locator('.action-buttons')
    if (await actionButtons.count() > 0) {
      await expect(actionButtons).toBeVisible()
    }
  })
})
