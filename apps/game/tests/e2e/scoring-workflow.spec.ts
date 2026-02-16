import { test, expect } from '@playwright/test'
import { generatePlayerName, generateAnswer } from './helpers/faker'

/**
 * E2E tests for the scoring workflow feature.
 *
 * Tests the complete flow:
 * - Score entry UI on results page (+/- buttons)
 * - Confirm scores button
 * - Leaderboard overlay auto-dismiss
 * - Decision modal (Next Round / Finish Game)
 * - Multi-round score accumulation
 */
test.describe('Scoring Workflow', () => {
  test.describe('Score Entry UI', () => {
    test.beforeEach(async ({ page }) => {
      // Set up a game with multiple players
      await page.goto('/players')
      await page.waitForLoadState('networkidle')

      // Add a second player
      const player2Name = generatePlayerName()
      page.once('dialog', async (dialog) => {
        await dialog.accept(player2Name)
      })
      const addBtn = page.locator('.add-btn')
      await addBtn.click()
      await page.waitForTimeout(300)

      // Start game
      const startBtn = page.locator('.start-btn')
      await startBtn.click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(2000)

      // Wait for game to start
      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
      await page.waitForTimeout(500)

      // Submit answers for both players
      const answerInput = page.locator('.answer-input')
      const submitBtn = page.locator('.submit-answer-btn')

      await answerInput.fill(generateAnswer())
      await submitBtn.click()
      await page.waitForTimeout(500)

      await answerInput.fill(generateAnswer())
      await submitBtn.click()
      await page.waitForTimeout(1000)

      // Navigate to results page
      const nextBtn = page.locator('[data-testid="next-button"]')
      await nextBtn.click()
      await expect(page).toHaveURL(/\/results/)
    })

    test('should display score controls for each player', async ({ page }) => {
      // Check that score controls exist
      const decrementBtns = page.locator('[data-testid="score-decrement"]')
      const incrementBtns = page.locator('[data-testid="score-increment"]')

      await expect(decrementBtns).toHaveCount(2)
      await expect(incrementBtns).toHaveCount(2)
    })

    test('should display confirm scores button', async ({ page }) => {
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await expect(confirmBtn).toBeVisible()
    })

    test('should increment score when clicking +', async ({ page }) => {
      const firstIncrement = page.locator('[data-testid="score-increment"]').first()

      // Click increment 3 times
      await firstIncrement.click()
      await page.waitForTimeout(100)
      await firstIncrement.click()
      await page.waitForTimeout(100)
      await firstIncrement.click()
      await page.waitForTimeout(100)

      // Score should be 3 (3 * 1)
      const scoreDisplays = page.locator('.scoring-page__score-value')
      await expect(scoreDisplays.first()).toContainText('3')
    })

    test('should decrement score when clicking -', async ({ page }) => {
      const firstIncrement = page.locator('[data-testid="score-increment"]').first()
      const firstDecrement = page.locator('[data-testid="score-decrement"]').first()

      // Increment first
      await firstIncrement.click()
      await page.waitForTimeout(100)
      await firstIncrement.click()
      await page.waitForTimeout(100)

      // Then decrement
      await firstDecrement.click()
      await page.waitForTimeout(100)

      // Score should be 1 (2 * 1 - 1 * 1)
      const scoreDisplays = page.locator('.scoring-page__score-value')
      await expect(scoreDisplays.first()).toContainText('1')
    })

    test('should disable decrement button when score is 0', async ({ page }) => {
      const firstDecrement = page.locator('[data-testid="score-decrement"]').first()

      // Should be disabled initially (score = 0)
      await expect(firstDecrement).toBeDisabled()
    })

    test('should enable decrement button when score > 0', async ({ page }) => {
      const firstIncrement = page.locator('[data-testid="score-increment"]').first()
      const firstDecrement = page.locator('[data-testid="score-decrement"]').first()

      // Increment
      await firstIncrement.click()
      await page.waitForTimeout(100)

      // Should now be enabled
      await expect(firstDecrement).toBeEnabled()
    })
  })

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
      await page.waitForTimeout(100)

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
      const nextRoundBtn = page.locator('[data-testid="next-round"]')
      const finishGameBtn = page.locator('[data-testid="finish-game"]')

      await expect(nextRoundBtn).toBeVisible()
      await expect(finishGameBtn).toBeVisible()
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
      const finishGameBtn = page.locator('[data-testid="finish-game"]')
      await finishGameBtn.click()

      await expect(page).toHaveURL(/\/leaderboard/, { timeout: 5000 })
    })
  })

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

      // Assign scores: Player 1 = 20, Player 2 = 10
      const incrementBtns = page.locator('[data-testid="score-increment"]')
      await incrementBtns.nth(0).click()
      await page.waitForTimeout(50)
      await incrementBtns.nth(0).click()
      await page.waitForTimeout(50)
      await incrementBtns.nth(1).click()
      await page.waitForTimeout(50)

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

      // Assign scores: Player 1 = 10, Player 2 = 30
      const incrementBtns2 = page.locator('[data-testid="score-increment"]')
      await incrementBtns2.nth(0).click()
      await page.waitForTimeout(50)
      await incrementBtns2.nth(1).click()
      await page.waitForTimeout(50)
      await incrementBtns2.nth(1).click()
      await page.waitForTimeout(50)
      await incrementBtns2.nth(1).click()
      await page.waitForTimeout(50)

      // Confirm scores
      await page.locator('[data-testid="confirm-scores"]').click()

      // Wait for modal and click Finish Game
      await page.waitForTimeout(2500)
      await page.locator('[data-testid="finish-game"]').click()

      // Should be on leaderboard with accumulated scores
      await expect(page).toHaveURL(/\/leaderboard/, { timeout: 5000 })

      // Verify scores: Player 1 = 30 total, Player 2 = 40 total
      const leaderboardItems = page.locator('.leaderboard-item')
      await expect(leaderboardItems).toHaveCount(2)

      // Player 2 should be first (40 > 30)
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

      const finishGameBtn = page.locator('[data-testid="finish-game"]')
      await expect(finishGameBtn).toBeVisible()
    })
  })
})
