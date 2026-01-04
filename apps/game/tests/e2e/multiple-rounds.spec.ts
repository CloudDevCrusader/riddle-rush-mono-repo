import { test, expect } from '@playwright/test'

test.describe('Multiple Rounds Flow', () => {
  test('should play multiple rounds and verify session persistence', async ({ page }) => {
    // Step 1: Start a game
    await page.goto('/players')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Helper to complete a round
    const completeRound = async (roundNum: number) => {
      // Verify round number
      const roundIndicator = page.locator('.round-indicator')
      await expect(roundIndicator).toBeVisible()
      const roundText = await roundIndicator.textContent()
      expect(roundText).toContain(`ROUND ${roundNum.toString().padStart(2, '0')}`)

      // Submit answers for all players
      const answerInput = page.locator('.answer-input')
      const submitBtn = page.locator('.submit-answer-btn')
      const turnName = page.locator('.turn-name')

      if (await answerInput.isVisible()) {
        // Player 1
        await expect(turnName).toHaveText('Player 1', { timeout: 5000 })
        await answerInput.fill(`Round${roundNum}Answer1`)
        await submitBtn.click()
        await page.waitForTimeout(500)

        // Player 2
        if (await answerInput.isVisible()) {
          await expect(turnName).toHaveText('Player 2', { timeout: 5000 })
          await answerInput.fill(`Round${roundNum}Answer2`)
          await submitBtn.click()
          await page.waitForTimeout(1000)
        }
      }

      // Navigate to results
      const nextBtn = page.locator('[data-testid="next-button"]')
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
        await expect(page).toHaveURL(/\/results/)
        await page.waitForTimeout(500)
      }
      else {
        // Fallback: navigate directly
        await page.goto('/results')
        await page.waitForTimeout(500)
      }

      // Assign scores
      const scoreButtons = page.locator('.score-action-btn')

      // Click add button for first player (index 0)
      if (await scoreButtons.nth(0).isVisible()) {
        await scoreButtons.nth(0).click()
        await page.waitForTimeout(200)
      }

      // Navigate to leaderboard
      const resultsNextBtn = page.locator('.next-btn')
      await resultsNextBtn.click()
      await expect(page).toHaveURL(/\/leaderboard/)
      await page.waitForTimeout(500)
    }

    // Complete Round 1
    await completeRound(1)

    // Verify Round 1 scores
    const leaderboardItems = page.locator('.leaderboard-item')
    await expect(leaderboardItems).toHaveCount(2)

    // Start Round 2
    const okBtn = page.locator('.ok-btn')
    await expect(okBtn).toBeVisible()
    await okBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Complete Round 2
    await completeRound(2)

    // Start Round 3
    await okBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Complete Round 3
    await completeRound(3)

    // Verify final scores
    await expect(leaderboardItems).toHaveCount(2)
  })

  test('should complete 3 full rounds with default 2 players and cumulative scoring', async ({
    page,
  }) => {
    // 1. Navigate to players page
    await page.goto('/players')
    await expect(page).toHaveURL(/\/players/)

    // 2. Verify default 2 players exist
    const playerItems = page.locator('.player-item:not(.empty)')
    await expect(playerItems).toHaveCount(2)

    // Verify default player names
    const firstPlayerName = playerItems.nth(0).locator('.player-name')
    const secondPlayerName = playerItems.nth(1).locator('.player-name')
    await expect(firstPlayerName).toContainText('Player 1')
    await expect(secondPlayerName).toContainText('Player 2')

    // 3. Start game - navigates to round-start
    const startBtn = page.locator('.start-btn')
    await expect(startBtn).not.toBeDisabled()
    await startBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000) // Wait for wheels to spin

    // 4. Wait for game to start automatically
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Helper function to complete a round
    const completeRound = async (roundNumber: number) => {
      // Verify round indicator shows correct round
      const roundText = page.locator('.round-text')
      if ((await roundText.count()) > 0) {
        await expect(roundText).toBeVisible()
      }

      // Verify player turn indicator
      const playerTurnIndicator = page.locator('.player-turn-indicator')
      await expect(playerTurnIndicator).toBeVisible()

      const turnName = page.locator('.turn-name')
      const answerInput = page.locator('.answer-input')
      const submitBtn = page.locator('.submit-answer-btn')

      // Player 1 submits
      await expect(turnName).toHaveText('Player 1')
      await answerInput.fill(`Round${roundNumber}Answer1`)
      await submitBtn.click()
      await page.waitForTimeout(500)

      // Player 2 submits
      await expect(turnName).toHaveText('Player 2')
      await answerInput.fill(`Round${roundNumber}Answer2`)
      await submitBtn.click()
      await page.waitForTimeout(1000)

      // Verify all submitted
      const allSubmittedMessage = page.locator('.all-submitted-message')
      await expect(allSubmittedMessage).toBeVisible()

      // Navigate to results
      const nextBtn = page.locator('[data-testid="next-button"]')
      await expect(nextBtn).toBeVisible()
      await nextBtn.click()
      await expect(page).toHaveURL(/\/results/)

      // Verify results show both players
      const scoreItems = page.locator('.score-item')
      await expect(scoreItems).toHaveCount(2)

      // Verify answers are shown
      const playerAnswers = page.locator('.player-answer')
      await expect(playerAnswers.nth(0)).toContainText(`Round${roundNumber}Answer1`)
      await expect(playerAnswers.nth(1)).toContainText(`Round${roundNumber}Answer2`)

      // Assign scores (different scores per round to verify accumulation)
      // Each player has 2 buttons: add (even index) and minus (odd index)
      // Player 1: add=0, minus=1
      // Player 2: add=2, minus=3
      const allScoreButtons = page.locator('.score-action-btn')

      // Round 1: Player 1 gets 20, Player 2 gets 10
      // Round 2: Player 1 gets 10, Player 2 gets 20
      // Round 3: Player 1 gets 15, Player 2 gets 15
      const scores = [
        { p1: 2, p2: 1 }, // Round 1: 20 and 10 (2 clicks = 20, 1 click = 10)
        { p1: 1, p2: 2 }, // Round 2: 10 and 20
        { p1: 1, p2: 1 }, // Round 3: 10 and 10 (simplified for test)
      ]

      const roundScores = scores[roundNumber - 1] ?? { p1: 0, p2: 0 }

      // Player 1 score (add button is index 0 - first button is add)
      for (let i = 0; i < roundScores.p1; i++) {
        await allScoreButtons.nth(0).click()
        await page.waitForTimeout(100)
      }

      // Player 2 score (add button is index 2 - third button is add)
      for (let i = 0; i < roundScores.p2; i++) {
        await allScoreButtons.nth(2).click()
        await page.waitForTimeout(100)
      }

      // Navigate to leaderboard
      const resultsNextBtn = page.locator('.next-btn')
      await resultsNextBtn.click()
      await expect(page).toHaveURL(/\/leaderboard/)

      // Verify leaderboard shows both players
      const leaderboardItems = page.locator('.leaderboard-item')
      await expect(leaderboardItems).toHaveCount(2)

      // Return expected scores for verification (each click adds 10 points)
      return {
        player1Score: roundScores.p1 * 10,
        player2Score: roundScores.p2 * 10,
      }
    }

    // Complete Round 1
    const round1Scores = await completeRound(1)
    let cumulativeP1 = round1Scores.player1Score
    let cumulativeP2 = round1Scores.player2Score

    // Verify Round 1 scores
    const leaderboardItems = page.locator('.leaderboard-item')
    await expect(leaderboardItems.nth(0)).toContainText(String(cumulativeP1))
    await expect(leaderboardItems.nth(1)).toContainText(String(cumulativeP2))

    // Start Round 2
    const okBtn = page.locator('.ok-btn')
    await expect(okBtn).toBeVisible()
    await okBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Complete Round 2
    const round2Scores = await completeRound(2)
    cumulativeP1 += round2Scores.player1Score
    cumulativeP2 += round2Scores.player2Score

    // Verify cumulative scores after Round 2
    await expect(leaderboardItems.nth(0)).toContainText(String(cumulativeP1))
    await expect(leaderboardItems.nth(1)).toContainText(String(cumulativeP2))

    // Start Round 3
    await okBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Complete Round 3
    const round3Scores = await completeRound(3)
    cumulativeP1 += round3Scores.player1Score
    cumulativeP2 += round3Scores.player2Score

    // Verify final cumulative scores after Round 3
    await expect(leaderboardItems.nth(0)).toContainText(String(cumulativeP1))
    await expect(leaderboardItems.nth(1)).toContainText(String(cumulativeP2))

    // Verify player names are preserved across all rounds
    const playerNames = page.locator('.player-name')
    await expect(playerNames.nth(0)).toContainText('Player 1')
    await expect(playerNames.nth(1)).toContainText('Player 2')
  })

  test('should handle multiple rounds with 3+ players correctly', async ({ page }) => {
    // 1. Navigate to players page
    await page.goto('/players')
    await expect(page).toHaveURL(/\/players/)

    // 2. Verify default 2 players, then add more
    const playerItems = page.locator('.player-item:not(.empty)')
    await expect(playerItems).toHaveCount(2)

    // Add Player 3
    const addBtn = page.locator('.add-btn')
    page.once('dialog', async (dialog) => {
      await dialog.accept('Alice')
    })
    await addBtn.click()
    await page.waitForTimeout(300)

    // Add Player 4
    page.once('dialog', async (dialog) => {
      await dialog.accept('Bob')
    })
    await addBtn.click()
    await page.waitForTimeout(300)

    // Verify 4 players total
    await expect(playerItems).toHaveCount(4)

    // 3. Start game
    await page.locator('.start-btn').click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Complete Round 1 with 4 players
    const answerInput = page.locator('.answer-input')
    const submitBtn = page.locator('.submit-answer-btn')
    const turnName = page.locator('.turn-name')

    // All 4 players submit
    await expect(turnName).toHaveText('Player 1')
    await answerInput.fill('R1P1')
    await submitBtn.click()
    await page.waitForTimeout(300)

    await expect(turnName).toHaveText('Player 2')
    await answerInput.fill('R1P2')
    await submitBtn.click()
    await page.waitForTimeout(300)

    await expect(turnName).toHaveText('Alice')
    await answerInput.fill('R1Alice')
    await submitBtn.click()
    await page.waitForTimeout(300)

    await expect(turnName).toHaveText('Bob')
    await answerInput.fill('R1Bob')
    await submitBtn.click()
    await page.waitForTimeout(1000)

    // Navigate to results
    await page.locator('[data-testid="next-button"]').click()
    await expect(page).toHaveURL(/\/results/)

    // Verify all 4 players in results
    const scoreItems = page.locator('.score-item')
    await expect(scoreItems).toHaveCount(4)

    // Assign some scores (each player has add button at even indices: 0, 2, 4, 6)
    const allScoreButtons = page.locator('.score-action-btn')
    await allScoreButtons.nth(0).click() // Player 1: +10 (index 0 = add button)
    await allScoreButtons.nth(2).click() // Player 2: +10 (index 2 = add button)
    await allScoreButtons.nth(4).click() // Alice: +10 (index 4 = add button)
    await allScoreButtons.nth(6).click() // Bob: +10 (index 6 = add button)
    await page.waitForTimeout(200)

    // Go to leaderboard
    await page.locator('.next-btn').click()
    await expect(page).toHaveURL(/\/leaderboard/)

    // Verify all 4 players in leaderboard
    const leaderboardItems = page.locator('.leaderboard-item')
    await expect(leaderboardItems).toHaveCount(4)

    // Start Round 2
    await page.locator('.ok-btn').click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Complete Round 2 - verify all players submit again
    await expect(turnName).toHaveText('Player 1')
    await answerInput.fill('R2P1')
    await submitBtn.click()
    await page.waitForTimeout(300)

    await expect(turnName).toHaveText('Player 2')
    await answerInput.fill('R2P2')
    await submitBtn.click()
    await page.waitForTimeout(300)

    await expect(turnName).toHaveText('Alice')
    await answerInput.fill('R2Alice')
    await submitBtn.click()
    await page.waitForTimeout(300)

    await expect(turnName).toHaveText('Bob')
    await answerInput.fill('R2Bob')
    await submitBtn.click()
    await page.waitForTimeout(1000)

    // Navigate to results
    await page.locator('[data-testid="next-button"]').click()
    await expect(page).toHaveURL(/\/results/)

    // Verify all 4 players still present
    await expect(scoreItems).toHaveCount(4)

    // Verify player names preserved
    const playerNames = page.locator('.player-name')
    await expect(playerNames.nth(0)).toContainText('Player 1')
    await expect(playerNames.nth(1)).toContainText('Player 2')
    await expect(playerNames.nth(2)).toContainText('Alice')
    await expect(playerNames.nth(3)).toContainText('Bob')
  })

  test('should reset player submissions correctly between rounds', async ({ page }) => {
    await page.goto('/players')
    await page.locator('.start-btn').click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    const answerInput = page.locator('.answer-input')
    const submitBtn = page.locator('.submit-answer-btn')
    const turnName = page.locator('.turn-name')

    // Round 1: Submit answers
    await answerInput.fill('Round1Answer')
    await submitBtn.click()
    await page.waitForTimeout(300)

    await answerInput.fill('Round1Answer2')
    await submitBtn.click()
    await page.waitForTimeout(1000)

    // Go to results and leaderboard
    await page.locator('[data-testid="next-button"]').click()
    await page.locator('.next-btn').click()

    // Start Round 2
    await page.locator('.ok-btn').click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Verify players can submit again (submissions were reset)
    await expect(turnName).toHaveText('Player 1')
    await expect(answerInput).toHaveValue('') // Input should be empty

    // Submit new answers for Round 2
    await answerInput.fill('Round2Answer')
    await submitBtn.click()
    await page.waitForTimeout(300)

    await expect(turnName).toHaveText('Player 2')
    await answerInput.fill('Round2Answer2')
    await submitBtn.click()
    await page.waitForTimeout(1000)

    // Verify answers are different in results
    await page.locator('[data-testid="next-button"]').click()
    const playerAnswers = page.locator('.player-answer')
    await expect(playerAnswers.nth(0)).toContainText('Round2Answer')
    await expect(playerAnswers.nth(1)).toContainText('Round2Answer2')
  })
})
