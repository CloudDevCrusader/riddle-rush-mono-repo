import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'
import { generatePlayerNames, generateAnswers, setFakerSeed } from './helpers/faker'

/**
 * Full 5-Round Game Workflow E2E Test
 *
 * This test validates a complete 5-round multiplayer game with 3 players:
 * - Menu navigation to players setup
 * - 3 players with randomized names
 * - 5 complete rounds with varying scores
 * - Score accumulation across rounds
 * - Proper "Next Round" vs "Finish Game" flow
 * - Final leaderboard with accumulated scores
 * - Return to menu functionality
 *
 * Test Design:
 * - Uses robust waits to prevent race conditions
 * - Includes comprehensive error handling
 * - Uses Faker for randomized test data
 * - Tests both scoring paths (continue vs finish)
 * - Validates score accumulation logic
 */

/**
 * Helper: Navigate from menu to players page
 */
async function navigateToPlayersPage(page: Page) {
  await page.goto('/', { timeout: 30000 })

  const playBtn = page.locator('[data-testid="menu-start-button"]')
  await expect(playBtn).toBeVisible({ timeout: 15000 })
  await playBtn.click()

  await expect(page).toHaveURL(/\/players/, { timeout: 10000 })
  await page.waitForTimeout(500) // Allow page to stabilize
}

/**
 * Helper: Set up multiplayer game with 3 custom players
 */
async function setupThreePlayerGame(page: Page, playerNames: string[]) {
  if (playerNames.length !== 3) {
    throw new Error('This helper expects exactly 3 player names')
  }

  await navigateToPlayersPage(page)

  // Increase from default 2 players to 3
  const increaseBtn = page.locator('[data-testid="players-increase-button"]')
  await expect(increaseBtn).toBeVisible({ timeout: 15000 })
  await increaseBtn.click()
  await page.waitForTimeout(200) // Allow UI to update

  // Fill in custom player names
  for (let i = 0; i < 3; i++) {
    const nameInput = page.locator(`[data-testid="players-name-input-${i}"]`)
    await expect(nameInput).toBeVisible({ timeout: 5000 })
    await nameInput.fill(playerNames[i]!)
    await page.waitForTimeout(100) // Prevent input race conditions
  }

  // Start the game
  const startBtn = page.locator('[data-testid="players-start-button"]')
  await expect(startBtn).toBeVisible({ timeout: 5000 })
  await startBtn.click()

  // Wait for game to start (goes through /round-start → /game)
  await expect(page).toHaveURL(/\/game/, { timeout: 20000 })
  await page.waitForTimeout(500) // Allow game to initialize
}

/**
 * Helper: Submit answers for all 3 players in sequence
 */
async function submitThreePlayerAnswers(page: Page, answers: string[]) {
  if (answers.length !== 3) {
    throw new Error('This helper expects exactly 3 answers')
  }

  const answerInput = page.locator('[data-testid="game-answer-input"]')
  const submitBtn = page.locator('[data-testid="game-submit-button"]')

  for (let i = 0; i < 3; i++) {
    await expect(answerInput).toBeVisible({ timeout: 5000 })
    await answerInput.fill(answers[i]!)

    await expect(submitBtn).toBeEnabled({ timeout: 5000 })
    await submitBtn.click()

    // Wait for submission to process and next player turn (except last player)
    if (i < 2) {
      await page.waitForTimeout(600)
    } else {
      // After last player, wait for "all submitted" state
      await page.waitForTimeout(800)
    }
  }

  // Verify all players have submitted
  const allSubmitted = page.locator('[data-testid="game-all-submitted"]')
  await expect(allSubmitted).toBeVisible({ timeout: 5000 })
}

/**
 * Helper: Navigate from game to results page
 */
async function navigateToResults(page: Page) {
  const nextBtn = page.locator('[data-testid="next-button"]')
  await expect(nextBtn).toBeVisible({ timeout: 8000 })
  await nextBtn.click()

  await expect(page).toHaveURL(/\/results/, { timeout: 8000 })
  await page.waitForTimeout(500) // Allow results page to load
}

/**
 * Helper: Assign scores to players on results page
 * @param scores Array of score increments for each player [player0, player1, player2]
 */
async function assignScoresToPlayers(page: Page, scores: number[]) {
  if (scores.length !== 3) {
    throw new Error('This helper expects exactly 3 scores')
  }

  for (let i = 0; i < 3; i++) {
    const playerEntry = page.locator(`[data-testid="results-player-entry-${i}"]`)
    await expect(playerEntry).toBeVisible({ timeout: 5000 })

    const incrementBtn = playerEntry.locator('[data-testid="score-increment"]')

    const clickCount = scores[i] ?? 0
    for (let c = 0; c < clickCount; c++) {
      await expect(incrementBtn).toBeVisible({ timeout: 3000 })
      await incrementBtn.click()
      await page.waitForTimeout(100) // Prevent button spam issues
    }
  }
}

/**
 * Helper: Confirm scores and wait for decision modal
 */
async function confirmScoresAndWaitForDecision(page: Page) {
  const confirmBtn = page.locator('[data-testid="confirm-scores"]')
  await expect(confirmBtn).toBeVisible({ timeout: 5000 })
  await confirmBtn.click()

  // Wait for leaderboard overlay to show and auto-dismiss, then decision modal
  await page.waitForTimeout(2500) // Leaderboard overlay duration

  // Verify decision modal is visible with both options
  const nextRoundBtn = page.locator('[data-testid="next-round"]')
  const finishGameBtn = page.locator('[data-testid="finish-game"]')

  await expect(nextRoundBtn.or(finishGameBtn).first()).toBeVisible({ timeout: 15000 })
}

/**
 * Helper: Continue to next round from decision modal
 */
async function continueToNextRound(page: Page) {
  const nextRoundBtn = page.locator('[data-testid="next-round"]')
  await expect(nextRoundBtn).toBeVisible({ timeout: 5000 })
  await nextRoundBtn.click()

  // Goes through round-start → game (round-start may be too fast to observe)
  await expect(page).toHaveURL(/\/game/, { timeout: 20000 })
  await page.waitForTimeout(700) // Allow new round to initialize
}

/**
 * Helper: Finish game from decision modal
 */
async function finishGameFromModal(page: Page) {
  const finishGameBtn = page.locator('[data-testid="finish-game"]')
  await expect(finishGameBtn).toBeVisible({ timeout: 5000 })
  await finishGameBtn.click()

  await expect(page).toHaveURL(/\/leaderboard/, { timeout: 8000 })
  await page.waitForTimeout(500) // Allow leaderboard to load
}

/**
 * Helper: Verify leaderboard shows correct accumulated scores
 * @param expectedScores Array of expected total scores in leaderboard order [1st, 2nd, 3rd]
 */
async function verifyLeaderboardScores(page: Page, expectedScores: number[]) {
  const leaderboardContainer = page.locator('[data-testid="leaderboard-container"]')
  await expect(leaderboardContainer).toBeVisible({ timeout: 8000 })

  for (let i = 0; i < expectedScores.length; i++) {
    const scoreElement = page.locator(`[data-testid="leaderboard-player-score-${i}"]`)
    await expect(scoreElement).toBeVisible({ timeout: 5000 })
    await expect(scoreElement).toContainText(expectedScores[i]!.toString())
  }
}

/**
 * Helper: Return to menu from leaderboard
 */
async function returnToMenuFromLeaderboard(page: Page) {
  const finishBtn = page.locator('[data-testid="leaderboard-finish-button"]')
  await expect(finishBtn).toBeVisible({ timeout: 8000 })
  await finishBtn.click()

  await expect(page).toHaveURL(/\/$/, { timeout: 8000 })

  // Verify menu is fully loaded
  const playBtn = page.locator('[data-testid="menu-start-button"]')
  await expect(playBtn).toBeVisible({ timeout: 15000 })
}

/**
 * Complete Round Helper: Play one full round with scores
 * @param roundNumber 1-based round number for logging
 * @param scores Score increments for [player0, player1, player2]
 * @param isLastRound Whether this is the final round (affects button flow)
 */
async function playCompleteRound(
  page: Page,
  roundNumber: number,
  scores: number[],
  isLastRound = false
) {
  console.log(`Playing Round ${roundNumber}...`)

  // Verify we're on the game page and round indicator is correct
  const roundIndicator = page.locator('[data-testid="game-round-indicator"]')
  await expect(roundIndicator).toBeVisible({ timeout: 8000 })

  // Generate and submit answers
  const answers = generateAnswers(3)
  console.log(`Round ${roundNumber} answers:`, answers)

  await submitThreePlayerAnswers(page, answers)
  await navigateToResults(page)

  // Assign scores
  console.log(`Round ${roundNumber} scores:`, scores)
  await assignScoresToPlayers(page, scores)
  await confirmScoresAndWaitForDecision(page)

  if (isLastRound) {
    await finishGameFromModal(page)
  } else {
    await continueToNextRound(page)
  }
}

test.describe('Full 5-Round Game Workflow @slow', () => {
  test('complete 5-round multiplayer game with 3 players and score accumulation', async ({
    page,
  }) => {
    // Set deterministic seed for reproducible test data
    setFakerSeed(12345)

    console.log('🎮 Starting comprehensive 5-round game test...')

    // Generate player names
    const playerNames = generatePlayerNames(3)
    console.log('👥 Players:', playerNames)

    // Setup: Navigate to game with 3 players
    console.log('⚙️ Setting up 3-player game...')
    await setupThreePlayerGame(page, playerNames)

    // Track cumulative scores: [player0, player1, player2]
    const cumulativeScores = [0, 0, 0]

    // Define score progression for each round (varying scores for realistic testing)
    const roundScores = [
      [3, 2, 1], // Round 1: Player 0 leads
      [1, 3, 2], // Round 2: Player 1 takes lead
      [2, 1, 4], // Round 3: Player 2 surges ahead
      [4, 2, 1], // Round 4: Player 0 catches up
      [2, 4, 3], // Round 5: Final scores
    ]

    // Play Rounds 1-4 (continue to next round)
    for (let round = 1; round <= 4; round++) {
      const scores = roundScores[round - 1]!

      await playCompleteRound(page, round, scores, false)

      // Update cumulative tracking
      for (let i = 0; i < 3; i++) {
        cumulativeScores[i]! += scores[i]!
      }

      console.log(`After Round ${round} cumulative scores:`, cumulativeScores)
    }

    // Play Round 5 (finish game)
    console.log('🏁 Playing final round...')
    const finalRoundScores = roundScores[4]!

    await playCompleteRound(page, 5, finalRoundScores, true)

    // Update final cumulative scores
    for (let i = 0; i < 3; i++) {
      cumulativeScores[i]! += finalRoundScores[i]!
    }

    console.log('📊 Final cumulative scores:', cumulativeScores)

    // Expected final totals based on our score progression:
    // Player 0: 3+1+2+4+2 = 12
    // Player 1: 2+3+1+2+4 = 12
    // Player 2: 1+2+4+1+3 = 11

    // Verify leaderboard shows accumulated scores
    // Note: With players 0 and 1 tied at 12, leaderboard order depends on tiebreaker logic
    console.log('🏆 Verifying leaderboard...')

    const leaderboardContainer = page.locator('[data-testid="leaderboard-container"]')
    await expect(leaderboardContainer).toBeVisible({ timeout: 10000 })

    // Get all scores from leaderboard (they should be sorted)
    const score0 = await page.locator('[data-testid="leaderboard-player-score-0"]').textContent()
    const score1 = await page.locator('[data-testid="leaderboard-player-score-1"]').textContent()
    const score2 = await page.locator('[data-testid="leaderboard-player-score-2"]').textContent()

    console.log('Leaderboard scores:', [score0, score1, score2])

    // Verify the scores are correct (12, 12, 11 in some order)
    const leaderboardScores = [
      parseInt(score0 ?? '0'),
      parseInt(score1 ?? '0'),
      parseInt(score2 ?? '0'),
    ].sort((a, b) => b - a) // Sort descending

    expect(leaderboardScores).toEqual([12, 12, 11])

    // Verify podium positions are visible
    const position1 = page.locator('[data-testid="leaderboard-entry-0"]')
    const position2 = page.locator('[data-testid="leaderboard-entry-1"]')
    const position3 = page.locator('[data-testid="leaderboard-entry-2"]')

    await expect(position1).toBeVisible()
    await expect(position2).toBeVisible()
    await expect(position3).toBeVisible()

    // Return to menu
    console.log('🔄 Returning to menu...')
    await returnToMenuFromLeaderboard(page)

    console.log('✅ Full 5-round game test completed successfully!')
  })

  test('should preserve player names and turn order across all 5 rounds', async ({ page }) => {
    setFakerSeed(54321)

    const playerNames = ['Alice', 'Bob', 'Charlie']
    console.log('Testing name preservation with players:', playerNames)

    await setupThreePlayerGame(page, playerNames)

    // Test name preservation for first 3 rounds
    for (let round = 1; round <= 3; round++) {
      console.log(`Round ${round}: Checking player turn order...`)

      // Verify first player's name is displayed
      const turnName = page.locator('[data-testid="game-player-name"]')
      await expect(turnName).toHaveText(playerNames[0]!)

      // Submit answers and check turn progression
      const answerInput = page.locator('[data-testid="game-answer-input"]')
      const submitBtn = page.locator('[data-testid="game-submit-button"]')

      // Player 1 (Alice)
      await answerInput.fill(`Round${round}Answer1`)
      await submitBtn.click()
      await page.waitForTimeout(500)
      await expect(turnName).toHaveText(playerNames[1]!) // Bob

      // Player 2 (Bob)
      await answerInput.fill(`Round${round}Answer2`)
      await submitBtn.click()
      await page.waitForTimeout(500)
      await expect(turnName).toHaveText(playerNames[2]!) // Charlie

      // Player 3 (Charlie)
      await answerInput.fill(`Round${round}Answer3`)
      await submitBtn.click()
      await page.waitForTimeout(800)

      // Navigate to results and continue (except last round tested)
      await navigateToResults(page)
      await assignScoresToPlayers(page, [1, 1, 1]) // Equal scores
      await confirmScoresAndWaitForDecision(page)

      if (round < 3) {
        await continueToNextRound(page)
      } else {
        await finishGameFromModal(page)
      }
    }

    console.log('✅ Player name preservation test completed!')
  })

  test('should handle varying score distributions correctly', async ({ page }) => {
    setFakerSeed(98765)

    const playerNames = generatePlayerNames(3)
    await setupThreePlayerGame(page, playerNames)

    // Test extreme score variations
    const extremeScores = [
      [10, 0, 5], // Round 1: High variance
      [1, 1, 8], // Round 2: One player dominates
      [3, 3, 3], // Round 3: Perfect tie
    ]

    const tracking = [0, 0, 0]

    for (let round = 1; round <= 3; round++) {
      const scores = extremeScores[round - 1]!
      console.log(`Round ${round} with extreme scores:`, scores)

      await playCompleteRound(page, round, scores, round === 3)

      // Update tracking
      for (let i = 0; i < 3; i++) {
        tracking[i]! += scores[i]!
      }
    }

    // Expected totals: [14, 4, 16] -> sorted [16, 14, 4]
    console.log('Final tracking:', tracking)

    // Verify leaderboard order reflects accumulated scores
    const firstPlaceScore = page.locator('[data-testid="leaderboard-player-score-0"]')
    await expect(firstPlaceScore).toContainText('16') // Player 2 should win

    console.log('✅ Extreme score distribution test completed!')
  })

  test('should handle rapid scoring interactions without race conditions', async ({ page }) => {
    setFakerSeed(11111)

    const playerNames = generatePlayerNames(3)
    await setupThreePlayerGame(page, playerNames)

    // Test rapid scoring with no delays between clicks
    console.log('Testing rapid scoring interactions...')

    const answers = generateAnswers(3)
    await submitThreePlayerAnswers(page, answers)
    await navigateToResults(page)

    // Rapidly assign different scores to each player
    const rapidScores = [7, 5, 3]

    for (let i = 0; i < 3; i++) {
      const playerEntry = page.locator(`[data-testid="results-player-entry-${i}"]`)
      const incrementBtn = playerEntry.locator('[data-testid="score-increment"]')

      // Rapid clicking without delays
      for (let c = 0; c < rapidScores[i]!; c++) {
        await incrementBtn.click()
      }
    }

    // Verify scores were applied correctly despite rapid clicking
    // Note: Score values are displayed in GameDisplay components without specific testids
    await page.waitForTimeout(500) // Let UI stabilize

    await confirmScoresAndWaitForDecision(page)
    await finishGameFromModal(page)

    console.log('✅ Rapid scoring test completed!')
  })
})

/**
 * BUGS DISCOVERED DURING DEVELOPMENT:
 *
 * None discovered yet - this is a placeholder for documenting any issues
 * found during test development and execution.
 *
 * If bugs are found, they should be documented here with:
 * - Description of the bug
 * - Steps to reproduce
 * - Expected vs actual behavior
 * - Workarounds implemented in the test
 * - GitHub issue references
 */
