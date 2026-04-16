import { test, expect } from '@playwright/test'
import { startGameAndGoToResults } from './helpers/game-flow'

test.describe('scoring results flow', () => {
  test.describe('leaderboard overlay', () => {
    test('should show leaderboard overlay after confirming scores', async ({ page }) => {
      // Setup game and navigate to results
      await startGameAndGoToResults(page)

      // Increment score
      const incrementBtn = page.locator('[data-testid="score-increment"]').first()
      await incrementBtn.click()
      await expect(
        page.locator('[data-testid^="scoring-page-score-value-"]').first()
      ).toContainText('1')

      // Confirm scores
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await confirmBtn.click()

      // Leaderboard overlay should appear (same testid as results page; parent attr merges here)
      const leaderboardOverlay = page.locator('[data-testid="player-leaderboard"]')
      await expect(leaderboardOverlay).toBeVisible({ timeout: 5000 })
    })

    test('should auto-dismiss leaderboard and show decision modal', async ({ page }) => {
      // Setup game and navigate to results
      await startGameAndGoToResults(page)

      // Confirm scores
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await confirmBtn.click()

      // Wait for auto-dismiss (RESULTS_DISPLAY_DURATION_MS = 2000)
      await page.waitForTimeout(2500)

      // Decision modal should appear
      const promptText = page.locator('[data-testid="results-post-round-prompt"]')
      const nextRoundBtn = page.locator('[data-testid="next-round-button"]')
      const leaderboardBtn = page.locator('[data-testid="leaderboard-button"]')

      await expect(promptText).toBeVisible()
      await expect(nextRoundBtn).toBeVisible()
      await expect(leaderboardBtn).toBeVisible()
      await expect(leaderboardBtn).toHaveText(/Leaderboard|Bestenliste/i)
    })
  })

  test.describe('Decision Modal', () => {
    test.beforeEach(async ({ page }) => {
      // Setup game and get to decision modal
      await startGameAndGoToResults(page)

      // Confirm scores
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await confirmBtn.click()

      // Wait for leaderboard to auto-dismiss
      await page.waitForTimeout(2500)
    })

    test('should navigate to round-start when clicking Next Round', async ({ page }) => {
      const nextRoundBtn = page.locator('[data-testid="next-round-button"]')
      await nextRoundBtn.click()

      await expect(page).toHaveURL(/\/round-start/, { timeout: 5000 })
    })

    test('should navigate to leaderboard when clicking Finish Game', async ({ page }) => {
      const leaderboardBtn = page.locator('[data-testid="leaderboard-button"]')
      await expect(leaderboardBtn).toHaveText(/Leaderboard|Bestenliste/i)
      await leaderboardBtn.click()

      await expect(page).toHaveURL(/\/leaderboard/, { timeout: 5000 })
    })

    test('should remain open when pressing Escape', async ({ page }) => {
      const promptText = page.locator('[data-testid="results-post-round-prompt"]')
      await expect(promptText).toBeVisible()

      await page.keyboard.press('Escape')

      await expect(promptText).toBeVisible()
    })
  })
})
