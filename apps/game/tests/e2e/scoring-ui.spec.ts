import { test, expect } from '@playwright/test'
import { generatePlayerName, generateAnswer } from './helpers/faker'

test.describe('Scoring Workflow: Score Entry UI', () => {
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
    await expect(page.locator('[data-testid="player-name-input-1"]')).toBeVisible()

    // Start game
    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    // Wait for game to start
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    const answerInput = page.locator('.answer-input')
    await expect(answerInput).toBeVisible()

    // Submit answers for both players
    const submitBtn = page.locator('.submit-answer-btn')

    await answerInput.fill(generateAnswer())
    await submitBtn.click()
    await expect(page.getByText(/Answer submitted for/)).toBeVisible()

    await answerInput.fill(generateAnswer())
    await submitBtn.click()
    await expect(page.getByText('All players have submitted!')).toBeVisible()

    // Navigate to results page
    const nextBtn = page.locator('[data-testid="next-button"]')
    await nextBtn.click()
    await expect(page).toHaveURL(/\/results/)
  })

  test('should handle score entry correctly', async ({ page }) => {
    // Check that score controls exist
    const decrementBtns = page.locator('[data-testid="score-decrement"]')
    const incrementBtns = page.locator('[data-testid="score-increment"]')
    await expect(decrementBtns).toHaveCount(2)
    await expect(incrementBtns).toHaveCount(2)

    // Check that confirm scores button exists
    const confirmBtn = page.locator('[data-testid="confirm-scores"]')
    await expect(confirmBtn).toBeVisible()

    const firstIncrement = incrementBtns.first()
    const firstDecrement = decrementBtns.first()
    const firstScoreDisplay = page.locator('.scoring-page__score-value').first()

    // Decrement button should be disabled initially
    await expect(firstDecrement).toBeDisabled()

    // Increment score
    await firstIncrement.click()
    await firstIncrement.click()
    await firstIncrement.click()
    await expect(firstScoreDisplay).toContainText('3')

    // Decrement button should be enabled now
    await expect(firstDecrement).toBeEnabled()

    // Decrement score
    await firstDecrement.click()
    await expect(firstScoreDisplay).toContainText('2')
  })
})
