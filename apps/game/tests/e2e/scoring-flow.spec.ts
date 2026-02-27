import { test, expect } from '@playwright/test'

test.describe('Scoring Workflow: Flow', () => {
  test.describe('Leaderboard Overlay', () => {
    test('should show leaderboard overlay after confirming scores', async ({ page }) => {
      // Setup game
      await page.goto('/players')
      await page.waitForLoadState('networkidle')

      const startBtn = page.locator('.start-btn')
      await startBtn.click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(2000)

      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

      // Navigate directly to results (single player)
      await page.goto('/results')
      await page.waitForLoadState('networkidle')

      // Increment score
      const incrementBtn = page.locator('[data-testid="score-increment"]').first()
      await incrementBtn.click()
      await expect(page.locator('.scoring-page__score-value').first()).toContainText('1')

      // Confirm scores
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await confirmBtn.click()

      // Leaderboard overlay should appear
      const leaderboardOverlay = page.locator('.player-leaderboard')
      await expect(leaderboardOverlay).toBeVisible({ timeout: 5000 })
    })

    test('should auto-dismiss leaderboard and show decision modal', async ({ page }) => {
      // Setup game
      await page.goto('/players')
      await page.waitForLoadState('networkidle')

      const startBtn = page.locator('.start-btn')
      await startBtn.click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(2000)

      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

      // Navigate directly to results (single player)
      await page.goto('/results')
      await page.waitForLoadState('networkidle')

      // Confirm scores
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await confirmBtn.click()

      // Wait for auto-dismiss (RESULTS_DISPLAY_DURATION_MS = 2000)
      await page.waitForTimeout(2500)

      // Decision modal should appear
      const promptText = page.locator('[data-testid="results-post-round-prompt"]')
      const nextRoundBtn = page.locator('[data-testid="next-round"]')
      const finishGameBtn = page.locator('[data-testid="leaderboard-button"]')

      await expect(promptText).toHaveText(
        'Do you want to play another round, or go to the leaderboard?'
      )
      await expect(nextRoundBtn).toBeVisible()
      await expect(finishGameBtn).toBeVisible()
      await expect(finishGameBtn).toHaveText('Leaderboard')
    })
  })

  test.describe('Decision Modal', () => {
    test.beforeEach(async ({ page }) => {
      // Setup game and get to decision modal
      await page.goto('/players')
      await page.waitForLoadState('networkidle')

      const startBtn = page.locator('.start-btn')
      await startBtn.click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(2000)

      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

      await page.goto('/results')
      await page.waitForLoadState('networkidle')

      // Confirm scores
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await confirmBtn.click()

      // Wait for leaderboard to auto-dismiss
      await page.waitForTimeout(2500)
    })

    test('should navigate to round-start when clicking Next Round', async ({ page }) => {
      const nextRoundBtn = page.locator('[data-testid="next-round"]')
      await nextRoundBtn.click()

      await expect(page).toHaveURL(/\/round-start/, { timeout: 5000 })
    })

    test('should navigate to leaderboard when clicking Finish Game', async ({ page }) => {
      const finishGameBtn = page.locator('[data-testid="leaderboard-button"]')
      await expect(finishGameBtn).toHaveText('Leaderboard')
      await finishGameBtn.click()

      await expect(page).toHaveURL(/\/leaderboard/, { timeout: 5000 })
    })
  })
})
