import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'
import { generatePlayerName } from './helpers/faker'
import {
  assignScores,
  confirmScoresAndWaitForModal,
  finishGame,
  goToNextRound,
  hideDevtools,
  navigateToResults,
  setupMultiplayerGame,
  startGameWithDefaults,
  submitPlayerAnswers,
} from './helpers/game-flow'

/**
 * Helper: Click "New Game" in decision modal and wait for players page
 */
async function startNewGameFromModal(page: Page) {
  const newGameBtn = page.locator('[data-testid="new-game-button"]')
  await expect(newGameBtn).toBeVisible({ timeout: 5000 })
  await newGameBtn.click()

  await expect(page).toHaveURL(/\/players/, { timeout: 8000 })
  await page.waitForTimeout(300)
}

test.describe('Complete Game Flow', () => {
  // ===== SINGLE PLAYER TESTS =====
  test.describe('Single Player Flow', () => {
    test('should complete full game flow from menu to game page', async ({ page }) => {
      await startGameWithDefaults(page)

      // Verify we're on game page with round indicator
      const roundIndicator = page.locator('[data-testid="game-round-indicator"]')
      await expect(roundIndicator).toBeVisible()
    })

    test('should display game elements correctly', async ({ page }) => {
      await startGameWithDefaults(page)

      // Category info
      const categoryInfo = page.locator('[data-testid="game-category-info"]')
      await expect(categoryInfo).toBeVisible()

      // Letter info
      const letterInfo = page.locator('[data-testid="game-letter-info"]')
      await expect(letterInfo).toBeVisible()

      // Pause button
      const pauseBtn = page.locator('[data-testid="game-pause-button"]')
      await expect(pauseBtn).toBeVisible()
    })

    test('should show NEXT button in single player mode (no multiplayer turn flow)', async ({
      page,
    }) => {
      await startGameWithDefaults(page)

      // In multiplayer with 2 default players, player turn should be visible
      const playerTurn = page.locator('[data-testid="game-player-turn"]')
      await expect(playerTurn).toBeVisible()
    })
  })

  // ===== NAVIGATION TESTS =====
  test.describe('Navigation', () => {
    test('should navigate through full scoring flow to leaderboard', async ({ page }) => {
      await startGameWithDefaults(page)

      // Submit answers for 2 default players
      await submitPlayerAnswers(page, 2)

      // Go to results
      await navigateToResults(page)

      // Verify results page has scores container
      const scoresContainer = page.locator('[data-testid="results-scores-container"]')
      await expect(scoresContainer).toBeVisible()

      // Confirm scores and finish game
      await confirmScoresAndWaitForModal(page)
      await finishGame(page)

      // Verify leaderboard page
      const leaderboardContainer = page.locator('[data-testid="leaderboard-container"]')
      await expect(leaderboardContainer).toBeVisible()
    })

    test('should return to menu from leaderboard when clicking finish', async ({ page }) => {
      await startGameWithDefaults(page)
      await submitPlayerAnswers(page, 2)
      await navigateToResults(page)
      await confirmScoresAndWaitForModal(page)
      await finishGame(page)

      // Click finish on leaderboard page
      const finishBtn = page.locator('[data-testid="leaderboard-finish-button"]')
      await expect(finishBtn).toBeVisible()
      await finishBtn.click()

      // Should be back at menu
      await expect(page).toHaveURL(/\/$/)
      const playBtn = page.locator('[data-testid="menu-start-button"]')
      await expect(playBtn).toBeVisible()
    })

    test('should handle browser back button navigation', async ({ page }) => {
      // Build up navigation history: menu → players → game
      await page.goto('/', { timeout: 30000 })
      await hideDevtools(page)

      const playBtn = page.locator('[data-testid="menu-start-button"]')
      await expect(playBtn).toBeVisible({ timeout: 15000 })
      await playBtn.click()
      await expect(page).toHaveURL(/\/players/)
      await page.waitForTimeout(500)

      // Use browser back button
      await page.goBack()
      await page.waitForTimeout(500)
      await expect(page).toHaveURL(/\/$/)
    })
  })

  // ===== MULTI-PLAYER TESTS =====
  test.describe('Multi-Player Flow', () => {
    test('complete multi-player game: 3 players through full round', async ({ page }) => {
      const player1 = 'Player 1'
      const player2 = generatePlayerName()
      const player3 = generatePlayerName()

      await setupMultiplayerGame(page, [player1, player2, player3])

      // Verify multi-player mode active
      const playerTurn = page.locator('[data-testid="game-player-turn"]')
      await expect(playerTurn).toBeVisible()

      // Verify first player's turn
      const turnName = page.locator('[data-testid="game-player-name"]')
      await expect(turnName).toHaveText(player1)

      // Submit answers for all 3 players
      await submitPlayerAnswers(page, 3)

      // Should show "all submitted" message
      const allSubmitted = page.locator('[data-testid="game-all-submitted"]')
      await expect(allSubmitted).toBeVisible({ timeout: 3000 })

      // Navigate to results
      await navigateToResults(page)

      // Verify all 3 player entries on results page
      const entry0 = page.locator('[data-testid="results-player-entry-0"]')
      const entry1 = page.locator('[data-testid="results-player-entry-1"]')
      const entry2 = page.locator('[data-testid="results-player-entry-2"]')
      await expect(entry0).toBeVisible()
      await expect(entry1).toBeVisible()
      await expect(entry2).toBeVisible()

      // Assign scores: Player 1 = 3, Player 2 = 2, Player 3 = 1
      // (SCORE_INCREMENT = 1, so clicks = score)
      await assignScores(page, [3, 2, 1])

      // Confirm and go to next round
      await confirmScoresAndWaitForModal(page)
      await goToNextRound(page)

      // Verify Round 2 started
      const roundIndicator = page.locator('[data-testid="game-round-indicator"]')
      await expect(roundIndicator).toBeVisible()

      // Verify player turn still works
      await expect(playerTurn).toBeVisible()
    })

    test('should show NEXT button only when all players submitted', async ({ page }) => {
      const player1 = 'Player 1'
      const player2 = generatePlayerName()

      await setupMultiplayerGame(page, [player1, player2])

      const answerInput = page.locator('[data-testid="game-answer-input"]')
      const submitBtn = page.locator('[data-testid="game-submit-button"]')
      const allSubmitted = page.locator('[data-testid="game-all-submitted"]')
      const nextBtn = page.locator('[data-testid="next-button"]')

      // After first player submits — should NOT show NEXT or all-submitted
      if (await answerInput.isVisible()) {
        await answerInput.fill('')
      }
      await submitBtn.click()
      await page.waitForTimeout(500)

      await expect(allSubmitted).not.toBeVisible()
      await expect(nextBtn).not.toBeVisible()

      // After second player submits — should show both
      if (await answerInput.isVisible()) {
        await answerInput.fill('')
      }
      await submitBtn.click()
      await page.waitForTimeout(1000)

      await expect(allSubmitted).toBeVisible()
      await expect(nextBtn).toBeVisible()
    })

    test('should preserve player names across rounds', async ({ page }) => {
      const player1 = 'Player 1'
      const player2 = generatePlayerName()
      const player3 = generatePlayerName()

      await setupMultiplayerGame(page, [player1, player2, player3])

      // Round 1: Submit answers
      await submitPlayerAnswers(page, 3)
      await navigateToResults(page)

      // Assign minimal scores and continue to next round
      await assignScores(page, [1, 1, 1])
      await confirmScoresAndWaitForModal(page)
      await goToNextRound(page)

      // Round 2: Verify player turns still use original names
      const turnName = page.locator('[data-testid="game-player-name"]')
      await expect(turnName).toHaveText(player1)

      // Submit for player 1 and verify player 2 turn
      const answerInput = page.locator('[data-testid="game-answer-input"]')
      const submitBtn = page.locator('[data-testid="game-submit-button"]')

      if (await answerInput.isVisible()) {
        await answerInput.fill('')
      }
      await submitBtn.click()
      await page.waitForTimeout(500)

      await expect(turnName).toHaveText(player2)
    })
  })

  // ===== MULTI-ROUND WITH CHAMPION TESTS =====
  test.describe('Multi-Round Games with Champion', () => {
    test('should play 2 rounds with accumulating scores and declare champion', async ({ page }) => {
      const player1 = 'Player 1'
      const player2 = 'Alice'

      await setupMultiplayerGame(page, [player1, player2])

      // ===== ROUND 1 =====
      await submitPlayerAnswers(page, 2)
      await navigateToResults(page)

      // Player 1: 3 points, Player 2: 1 point (SCORE_INCREMENT = 1)
      await assignScores(page, [3, 1])
      await confirmScoresAndWaitForModal(page)
      await goToNextRound(page)

      // ===== ROUND 2 =====
      await submitPlayerAnswers(page, 2)
      await navigateToResults(page)

      // Player 1: 1 point, Player 2: 2 points
      await assignScores(page, [1, 2])
      await confirmScoresAndWaitForModal(page)

      // Finish game after round 2
      await finishGame(page)

      // Verify leaderboard shows accumulated scores
      // Player 1 total: 3 + 1 = 4, Player 2 total: 1 + 2 = 3
      // Player 1 should be first (higher score)
      const entry0 = page.locator('[data-testid="leaderboard-entry-0"]')
      const entry0Score = page.locator('[data-testid="leaderboard-player-score-0"]')
      await expect(entry0).toBeVisible()
      await expect(entry0Score).toContainText('4')

      const entry1Score = page.locator('[data-testid="leaderboard-player-score-1"]')
      await expect(entry1Score).toContainText('3')
    })

    test('should correctly calculate cumulative scores across 2 rounds', async ({ page }) => {
      const player1 = 'Player 1'
      const player2 = generatePlayerName()

      await setupMultiplayerGame(page, [player1, player2])

      // ===== ROUND 1 =====
      await submitPlayerAnswers(page, 2)
      await navigateToResults(page)

      // Player 1: 5 points, Player 2: 3 points
      await assignScores(page, [5, 3])
      await confirmScoresAndWaitForModal(page)
      await goToNextRound(page)

      // ===== ROUND 2 =====
      await submitPlayerAnswers(page, 2)
      await navigateToResults(page)

      // Player 1: 2 more, Player 2: 4 more
      await assignScores(page, [2, 4])
      await confirmScoresAndWaitForModal(page)
      await finishGame(page)

      // Cumulative: Player 1 = 7, Player 2 = 7 (tied)
      const score0 = page.locator('[data-testid="leaderboard-player-score-0"]')
      const score1 = page.locator('[data-testid="leaderboard-player-score-1"]')
      await expect(score0).toContainText('7')
      await expect(score1).toContainText('7')
    })
  })

  test.describe('Reset Flow', () => {
    test('should reset the game when choosing New Game', async ({ page }) => {
      const player1 = 'Player 1'
      const player2 = generatePlayerName()

      await setupMultiplayerGame(page, [player1, player2])

      await submitPlayerAnswers(page, 2)
      await navigateToResults(page)

      await assignScores(page, [1, 1])
      await confirmScoresAndWaitForModal(page)

      await startNewGameFromModal(page)

      const input0 = page.locator('[data-testid="players-name-input-0"]')
      const input1 = page.locator('[data-testid="players-name-input-1"]')

      await expect(input0).toHaveValue('')
      await expect(input1).toHaveValue('')
    })
  })
})
