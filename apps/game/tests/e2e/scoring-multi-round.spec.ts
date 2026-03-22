import { test, expect } from '@playwright/test'
import {
  setupMultiplayerGame,
  submitPlayerAnswers,
  navigateToResults,
  assignScores,
  confirmScoresAndWaitForModal,
  goToNextRound,
  finishGame,
  startGameAndGoToResults,
} from './helpers/game-flow'

test.describe('Scoring Workflow: Multi-Round and Edges', () => {
  test.describe('Multi-Round Score Accumulation', () => {
    test('should accumulate scores across multiple rounds', async ({ page }) => {
      await setupMultiplayerGame(page, ['Player 1', 'Player 2'])

      // Submit answers for round 1
      await submitPlayerAnswers(page, 2, ['', ''])
      await navigateToResults(page)

      // Assign scores: Player 1 = 2, Player 2 = 1
      await assignScores(page, [2, 1])
      await expect(page.locator('.scoring-page__score-value').nth(0)).toContainText('2')
      await expect(page.locator('.scoring-page__score-value').nth(1)).toContainText('1')

      // Confirm scores
      await confirmScoresAndWaitForModal(page)
      await goToNextRound(page)

      // Submit answers for round 2
      await submitPlayerAnswers(page, 2, ['', ''])
      await navigateToResults(page)

      // Assign scores: Player 1 = 1, Player 2 = 3
      await assignScores(page, [1, 3])
      await expect(page.locator('.scoring-page__score-value').nth(0)).toContainText('1')
      await expect(page.locator('.scoring-page__score-value').nth(1)).toContainText('3')

      // Confirm scores
      await confirmScoresAndWaitForModal(page)
      await finishGame(page)

      // Should be on leaderboard with accumulated scores
      await expect(page.locator('[data-testid="leaderboard-entry-0"]')).toBeVisible()
      await expect(page.locator('[data-testid="leaderboard-player-score-0"]')).toContainText('4')
    })
  })

  test.describe('Edge Cases', () => {
    test('should handle single player game', async ({ page }) => {
      await startGameAndGoToResults(page, 1)

      // Should show one player
      const incrementBtns = page.locator('[data-testid="score-increment"]')
      await expect(incrementBtns).toHaveCount(1)

      // Should be able to confirm
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await expect(confirmBtn).toBeVisible()
    })

    test('should handle zero scores confirmation', async ({ page }) => {
      await startGameAndGoToResults(page, 1)
      await confirmScoresAndWaitForModal(page)
      await expect(page.locator('[data-testid="leaderboard-button"]')).toBeVisible()
    })
  })
})
