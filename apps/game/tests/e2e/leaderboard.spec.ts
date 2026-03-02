import { test, expect } from '@playwright/test'

test.describe('Leaderboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up game state by going through the full flow:
    // players → round-start → game → results → confirm → leaderboard
    await page.goto('/players', { timeout: 30000 })

    // Wait for players page to load
    const playerStartBtn = page.locator('[data-testid="players-start-button"]')
    await expect(playerStartBtn).toBeVisible({ timeout: 15000 })
    await playerStartBtn.click()

    // Wait for game page (goes through /round-start → /game)
    await expect(page).toHaveURL(/\/game/, { timeout: 20000 })
    await page.waitForTimeout(500)

    // Submit answers for both players
    const answerInput = page.locator('[data-testid="game-answer-input"]')
    const submitBtn = page.locator('[data-testid="game-submit-button"]')

    // Player 1
    await expect(answerInput).toBeVisible({ timeout: 5000 })
    await answerInput.fill('TestAnswer1')
    await submitBtn.click()
    await page.waitForTimeout(500)

    // Player 2
    await expect(answerInput).toBeVisible({ timeout: 5000 })
    await answerInput.fill('TestAnswer2')
    await submitBtn.click()
    await page.waitForTimeout(1000)

    // Click NEXT to go to results
    const nextBtn = page.locator('[data-testid="next-button"]')
    await expect(nextBtn).toBeVisible({ timeout: 10000 })
    await nextBtn.click()
    await expect(page).toHaveURL(/\/results/, { timeout: 5000 })

    // Confirm scores (default 0 for all) to trigger leaderboard overlay
    const confirmBtn = page.locator('[data-testid="confirm-scores"]')
    await expect(confirmBtn).toBeVisible({ timeout: 5000 })
    await confirmBtn.click()

    // Wait for leaderboard overlay to auto-dismiss (2s) and decision modal to appear
    const finishGameBtn = page.locator('[data-testid="finish-game"]')
    await expect(finishGameBtn).toBeVisible({ timeout: 15000 })
    await finishGameBtn.click()

    // Now we should be on the leaderboard page
    await expect(page).toHaveURL(/\/leaderboard/, { timeout: 5000 })
    await page.waitForTimeout(500)
  })

  test('should display leaderboard container', async ({ page }) => {
    const container = page.locator('[data-testid="leaderboard-container"]')
    await expect(container).toBeVisible()
  })

  test('should display leaderboard entries', async ({ page }) => {
    // Should have entries for both default players
    const entry0 = page.locator('[data-testid="leaderboard-entry-0"]')
    await expect(entry0).toBeVisible()

    const entry1 = page.locator('[data-testid="leaderboard-entry-1"]')
    await expect(entry1).toBeVisible()
  })

  test('should display player names in entries', async ({ page }) => {
    const playerName0 = page.locator('[data-testid="leaderboard-player-name-0"]')
    await expect(playerName0).toBeVisible()

    const playerName1 = page.locator('[data-testid="leaderboard-player-name-1"]')
    await expect(playerName1).toBeVisible()
  })

  test('should display player scores in entries', async ({ page }) => {
    const playerScore0 = page.locator('[data-testid="leaderboard-player-score-0"]')
    await expect(playerScore0).toBeVisible()

    const playerScore1 = page.locator('[data-testid="leaderboard-player-score-1"]')
    await expect(playerScore1).toBeVisible()
  })

  test('should display finish button (game is completed)', async ({ page }) => {
    // Game was completed via "Finish Game" — so only finish button should show
    const finishBtn = page.locator('[data-testid="leaderboard-finish-button"]')
    await expect(finishBtn).toBeVisible()
  })

  test('should not display next round button when game is completed', async ({ page }) => {
    // Game was completed — next round button should NOT be visible
    const nextRoundBtn = page.locator('[data-testid="leaderboard-next-round-button"]')
    await expect(nextRoundBtn).not.toBeVisible()
  })

  test('should navigate to menu when clicking finish', async ({ page }) => {
    const finishBtn = page.locator('[data-testid="leaderboard-finish-button"]')
    await finishBtn.click()

    await expect(page).toHaveURL(/\/$/)
  })
})
