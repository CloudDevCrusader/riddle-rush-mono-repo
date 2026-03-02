import { test, expect } from '@playwright/test'
import { generatePlayerName, generateAnswer } from './helpers/faker'

test.describe('Scoring Workflow: Multi-Round and Edges', () => {
  test.describe('Multi-Round Score Accumulation', () => {
    test('should accumulate scores across multiple rounds', async ({ page }) => {
      // Setup game with 2 players
      await page.goto('/players')
      await page.waitForLoadState('networkidle')

      const player2Name = generatePlayerName()
      page.once('dialog', async (dialog) => {
        await dialog.accept(player2Name)
      })
      const addBtn = page.locator('.add-btn')
      await addBtn.click()
      await page.waitForTimeout(300)

      const startBtn = page.locator('.start-btn')
      await startBtn.click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(2000)

      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

      // Submit answers for round 1
      const answerInput = page.locator('.answer-input')
      const submitBtn = page.locator('.submit-answer-btn')

      await answerInput.fill(generateAnswer())
      await submitBtn.click()
      await page.waitForTimeout(500)

      await answerInput.fill(generateAnswer())
      await submitBtn.click()
      await page.waitForTimeout(1000)

      // Navigate to results
      await page.locator('[data-testid="next-button"]').click()
      await expect(page).toHaveURL(/\/results/)

      // Assign scores: Player 1 = 2, Player 2 = 1
      const incrementBtns = page.locator('[data-testid="score-increment"]')
      await incrementBtns.nth(0).click()
      await incrementBtns.nth(0).click()
      await expect(page.locator('.scoring-page__score-value').nth(0)).toContainText('2')
      await incrementBtns.nth(1).click()
      await expect(page.locator('.scoring-page__score-value').nth(1)).toContainText('1')

      // Confirm scores
      await page.locator('[data-testid="confirm-scores"]').click()

      // Wait for modal and click Next Round
      await page.waitForTimeout(2500)
      await page.locator('[data-testid="next-round"]').click()

      // Wait for round 2 to start
      await expect(page).toHaveURL(/\/round-start/, { timeout: 5000 })
      await page.waitForTimeout(2000)
      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

      // Submit answers for round 2
      await answerInput.fill(generateAnswer())
      await submitBtn.click()
      await page.waitForTimeout(500)

      await answerInput.fill(generateAnswer())
      await submitBtn.click()
      await page.waitForTimeout(1000)

      // Navigate to results
      await page.locator('[data-testid="next-button"]').click()
      await expect(page).toHaveURL(/\/results/)

      // Assign scores: Player 1 = 1, Player 2 = 3
      const incrementBtns2 = page.locator('[data-testid="score-increment"]')
      await incrementBtns2.nth(0).click()
      await expect(page.locator('.scoring-page__score-value').nth(0)).toContainText('1')
      await incrementBtns2.nth(1).click()
      await incrementBtns2.nth(1).click()
      await incrementBtns2.nth(1).click()
      await expect(page.locator('.scoring-page__score-value').nth(1)).toContainText('3')

      // Confirm scores
      await page.locator('[data-testid="confirm-scores"]').click()

      // Wait for modal and click Finish Game
      await page.waitForTimeout(2500)
      await page.locator('[data-testid="leaderboard-button"]').click()

      // Should be on leaderboard with accumulated scores
      await expect(page).toHaveURL(/\/leaderboard/, { timeout: 5000 })

      // Verify scores: Player 1 = 3 total, Player 2 = 4 total
      const leaderboardItems = page.locator('.leaderboard-item')
      await expect(leaderboardItems).toHaveCount(2)

      // Player 2 should be first (4 > 3)
      const firstScore = leaderboardItems.first().locator('.player-total-score, .score-value')
      await expect(firstScore).toContainText('4')
    })
  })

  test.describe('Edge Cases', () => {
    test('should handle single player game', async ({ page }) => {
      await page.goto('/players')
      await page.waitForLoadState('networkidle')

      const startBtn = page.locator('.start-btn')
      await startBtn.click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(2000)

      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

      // Navigate directly to results
      await page.goto('/results')
      await page.waitForLoadState('networkidle')

      // Should show one player
      const incrementBtns = page.locator('[data-testid="score-increment"]')
      await expect(incrementBtns).toHaveCount(1)

      // Should be able to confirm
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await expect(confirmBtn).toBeVisible()
    })

    test('should handle zero scores confirmation', async ({ page }) => {
      await page.goto('/players')
      await page.waitForLoadState('networkidle')

      const startBtn = page.locator('.start-btn')
      await startBtn.click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(2000)

      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

      await page.goto('/results')
      await page.waitForLoadState('networkidle')

      // Confirm without changing scores (all zeros)
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await confirmBtn.click()

      // Should still show leaderboard overlay
      const leaderboardOverlay = page.locator('.player-leaderboard')
      await expect(leaderboardOverlay).toBeVisible({ timeout: 5000 })

      // Wait for decision modal
      await page.waitForTimeout(2500)

      const finishGameBtn = page.locator('[data-testid="leaderboard-button"]')
      await expect(finishGameBtn).toBeVisible()
    })
  })
})
