import { test, expect } from '@playwright/test'
import {
  startGameWithDefaults,
  submitPlayerAnswers,
  navigateToResults,
  confirmScoresAndWaitForModal,
  finishGame,
} from './helpers/game-flow'

test.describe('Leaderboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await startGameWithDefaults(page)
    await submitPlayerAnswers(page, 2, ['TestAnswer1', 'TestAnswer2'])
    await navigateToResults(page)
    await confirmScoresAndWaitForModal(page)
    await finishGame(page)
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
