import { test, expect } from '@playwright/test'

test.describe('Multi-Player Game Flow', () => {
  test('complete multi-player game flow: players → round-start → game → results → leaderboard → next round', async ({
    page,
  }) => {
    // 1. Navigate to players page
    await page.goto('/players')
    await expect(page).toHaveURL(/\/players/)

    // 2. Add players
    const addBtn = page.locator('.add-btn')

    // Add Player 2
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt')
      await dialog.accept('Alice')
    })
    await addBtn.click()
    await page.waitForTimeout(300)

    // Add Player 3
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt')
      await dialog.accept('Bob')
    })
    await addBtn.click()
    await page.waitForTimeout(300)

    // Verify 3 players
    const playerItems = page.locator('.player-item:not(.empty)')
    await expect(playerItems).toHaveCount(3)

    // 3. Start game - navigates to round-start
    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000) // Wait for wheels to spin

    // 4. Wait for game to start automatically
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // 5. Verify multi-player mode active
    // Should show round number
    const roundText = page.locator('.round-text')
    await expect(roundText).toBeVisible()

    // Should show player turn indicator
    const playerTurnIndicator = page.locator('.player-turn-indicator')
    await expect(playerTurnIndicator).toBeVisible()

    const turnName = page.locator('.turn-name')
    await expect(turnName).toHaveText('Player 1')

    // 6. Each player submits answer
    const answerInput = page.locator('.answer-input')
    const submitBtn = page.locator('.submit-answer-btn')

    // Player 1 submits
    await answerInput.fill('Answer1')
    await submitBtn.click()
    await page.waitForTimeout(500)

    // Should show Player 2's turn now
    await expect(turnName).toHaveText('Alice')

    // Player 2 submits
    await answerInput.fill('Answer2')
    await submitBtn.click()
    await page.waitForTimeout(500)

    // Should show Player 3's turn now
    await expect(turnName).toHaveText('Bob')

    // Player 3 submits
    await answerInput.fill('Answer3')
    await submitBtn.click()
    await page.waitForTimeout(1000)

    // 7. Should show "all submitted" message and NEXT button
    const allSubmittedMessage = page.locator('.all-submitted-message')
    await expect(allSubmittedMessage).toBeVisible()

    const nextBtn = page.locator('[data-testid="next-button"]')
    await expect(nextBtn).toBeVisible()

    // 8. Navigate to results
    await nextBtn.click()
    await expect(page).toHaveURL(/\/results/)

    // 9. Verify results page shows all players and their answers
    const scoreItems = page.locator('.score-item')
    await expect(scoreItems).toHaveCount(3)

    // Check player answers are shown
    const playerAnswers = page.locator('.player-answer')
    await expect(playerAnswers.nth(0)).toContainText('Answer1')
    await expect(playerAnswers.nth(1)).toContainText('Answer2')
    await expect(playerAnswers.nth(2)).toContainText('Answer3')

    // 10. Assign scores using +/- buttons
    const allScoreButtons = page.locator('.score-action-btn')

    // Give Player 1: 30 points (click + 3 times)
    for (let i = 0; i < 3; i++) {
      await allScoreButtons.nth(0).click()
      await page.waitForTimeout(100)
    }

    // Give Player 2: 20 points (click + 2 times)
    for (let i = 0; i < 2; i++) {
      await allScoreButtons.nth(2).click()
      await page.waitForTimeout(100)
    }

    // Give Player 3: 10 points (click + 1 time)
    await allScoreButtons.nth(4).click()
    await page.waitForTimeout(100)

    // 11. Navigate to leaderboard
    const resultsNextBtn = page.locator('.next-btn')
    await resultsNextBtn.click()
    await expect(page).toHaveURL(/\/leaderboard/)

    // 12. Verify leaderboard shows correct rankings
    const leaderboardItems = page.locator('.leaderboard-item')
    await expect(leaderboardItems).toHaveCount(3)

    // Should be sorted by score (Player 1: 30, Alice: 20, Bob: 10)
    const firstPlace = leaderboardItems.nth(0)
    await expect(firstPlace).toContainText('Player 1')
    await expect(firstPlace).toContainText('30')

    const secondPlace = leaderboardItems.nth(1)
    await expect(secondPlace).toContainText('Alice')
    await expect(secondPlace).toContainText('20')

    const thirdPlace = leaderboardItems.nth(2)
    await expect(thirdPlace).toContainText('Bob')
    await expect(thirdPlace).toContainText('10')

    // 13. Start next round (next-round button navigates to round-start when game not completed)
    const nextRoundBtn = page.locator('.next-round-btn')
    await expect(nextRoundBtn).toBeVisible()
    await nextRoundBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    // 14. Wait for round 2 to start
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // 15. Verify Round 2 started - players should need to submit again
    await expect(playerTurnIndicator).toBeVisible()
    await expect(turnName).toHaveText('Player 1')

    // Submit answers for round 2
    await answerInput.fill('Round2Answer1')
    await submitBtn.click()
    await page.waitForTimeout(500)

    await answerInput.fill('Round2Answer2')
    await submitBtn.click()
    await page.waitForTimeout(500)

    await answerInput.fill('Round2Answer3')
    await submitBtn.click()
    await page.waitForTimeout(1000)

    // Navigate to results again
    await nextBtn.click()
    await expect(page).toHaveURL(/\/results/)

    // Give more points for round 2
    const allScoreButtons2 = page.locator('.score-action-btn')
    await allScoreButtons2.nth(0).click() // Player 1: +10 = 40 total
    await page.waitForTimeout(100)
    await allScoreButtons2.nth(2).click() // Alice: +10 = 30 total
    await page.waitForTimeout(100)
    await allScoreButtons2.nth(4).click() // Bob: +10 = 20 total
    await page.waitForTimeout(100)

    // Go to leaderboard
    const nextBtn2 = page.locator('.next-btn')
    await nextBtn2.click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/leaderboard/)

    // Verify cumulative scores after round 2
    // Scores should be cumulative
    await expect(leaderboardItems.nth(0)).toContainText('40') // Player 1
    await expect(leaderboardItems.nth(1)).toContainText('30') // Alice
    await expect(leaderboardItems.nth(2)).toContainText('20') // Bob
  })

  test('should handle single player game flow correctly', async ({ page }) => {
    // Navigate directly to game page (bypassing players setup)
    await page.goto('/game')
    await page.waitForTimeout(1000)

    // Should be in single-player mode
    // Should NOT show player turn indicator
    const playerTurnIndicator = page.locator('.player-turn-indicator')
    await expect(playerTurnIndicator).not.toBeVisible()
  })

  test('should show NEXT button only when all players submitted', async ({ page }) => {
    // Setup 2 players
    await page.goto('/players')

    page.once('dialog', async (dialog) => {
      await dialog.accept('Player 2')
    })
    const addBtn = page.locator('.add-btn')
    await addBtn.click()
    await page.waitForTimeout(300)

    // Start game - navigates to round-start first
    await page.locator('.start-btn').click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    // Wait for game to start
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    const answerInput = page.locator('.answer-input')
    const submitBtn = page.locator('.submit-answer-btn')
    const allSubmittedMessage = page.locator('.all-submitted-message')
    const nextBtn = page.locator('[data-testid="next-button"]')

    // After first player submits, should NOT show button
    await answerInput.fill('Answer1')
    await submitBtn.click()
    await page.waitForTimeout(500)

    await expect(allSubmittedMessage).not.toBeVisible()
    await expect(nextBtn).not.toBeVisible()

    // After second player submits, should show button
    await answerInput.fill('Answer2')
    await submitBtn.click()
    await page.waitForTimeout(1000)

    await expect(allSubmittedMessage).toBeVisible()
    await expect(nextBtn).toBeVisible()
  })

  test('should preserve player names across rounds', async ({ page }) => {
    // Setup players with custom names
    await page.goto('/players')

    page.once('dialog', async (dialog) => {
      await dialog.accept('Custom Alice')
    })
    await page.locator('.add-btn').click()
    await page.waitForTimeout(300)

    page.once('dialog', async (dialog) => {
      await dialog.accept('Custom Bob')
    })
    await page.locator('.add-btn').click()
    await page.waitForTimeout(300)

    // Start and complete first round
    await page.locator('.start-btn').click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Submit all answers
    const answerInput = page.locator('.answer-input')
    const submitBtn = page.locator('.submit-answer-btn')

    for (let i = 0; i < 3; i++) {
      await answerInput.fill(`Answer${i}`)
      await submitBtn.click()
      await page.waitForTimeout(300)
    }

    await page.waitForTimeout(500)
    const nextBtn = page.locator('[data-testid="next-button"]')
    await nextBtn.click()

    // Check names in results
    const playerNames = page.locator('.player-name')
    await expect(playerNames.nth(0)).toContainText('Player 1')
    await expect(playerNames.nth(1)).toContainText('Custom Alice')
    await expect(playerNames.nth(2)).toContainText('Custom Bob')

    // Go to leaderboard and start next round
    await page.locator('.next-btn').click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/leaderboard/)

    await page.locator('.next-round-btn').click()
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Submit answers in round 2
    for (let i = 0; i < 3; i++) {
      await answerInput.fill(`R2Answer${i}`)
      await submitBtn.click()
      await page.waitForTimeout(300)
    }

    await page.waitForTimeout(1000)
    await nextBtn.click()

    // Verify names preserved in round 2
    await expect(playerNames.nth(0)).toContainText('Player 1')
    await expect(playerNames.nth(1)).toContainText('Custom Alice')
    await expect(playerNames.nth(2)).toContainText('Custom Bob')
  })

  test('should correctly calculate and display cumulative scores', async ({ page }) => {
    // Setup 2 players for faster test
    await page.goto('/players')

    page.once('dialog', async (dialog) => {
      await dialog.accept('Player 2')
    })
    await page.locator('.add-btn').click()
    await page.waitForTimeout(300)

    await page.locator('.start-btn').click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    const answerInput = page.locator('.answer-input')
    const submitBtn = page.locator('.submit-answer-btn')

    // Round 1
    await answerInput.fill('Answer1')
    await submitBtn.click()
    await page.waitForTimeout(300)

    await answerInput.fill('Answer2')
    await submitBtn.click()
    await page.waitForTimeout(1000)

    await page.locator('[data-testid="next-button"]').click()

    // Give Player 1: 50 points, Player 2: 30 points
    const allScoreButtons = page.locator('.score-action-btn')
    for (let i = 0; i < 5; i++) {
      await allScoreButtons.nth(0).click() // Player 1's add button
      await page.waitForTimeout(50)
    }
    for (let i = 0; i < 3; i++) {
      await allScoreButtons.nth(2).click() // Player 2's add button
      await page.waitForTimeout(50)
    }

    await page.locator('.next-btn').click()

    // Check round 1 scores
    const leaderboardItems = page.locator('.leaderboard-item')
    await expect(leaderboardItems.nth(0)).toContainText('50')
    await expect(leaderboardItems.nth(1)).toContainText('30')

    // Round 2
    await page.locator('.next-round-btn').click()
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    await answerInput.fill('R2Answer1')
    await submitBtn.click()
    await page.waitForTimeout(300)

    await answerInput.fill('R2Answer2')
    await submitBtn.click()
    await page.waitForTimeout(1000)

    await page.locator('[data-testid="next-button"]').click()

    // Give Player 1: 20 more points, Player 2: 40 more points
    const allScoreButtons3 = page.locator('.score-action-btn')
    for (let i = 0; i < 2; i++) {
      await allScoreButtons3.nth(0).click() // Player 1's add button
      await page.waitForTimeout(50)
    }
    for (let i = 0; i < 4; i++) {
      await allScoreButtons3.nth(2).click() // Player 2's add button
      await page.waitForTimeout(50)
    }

    await page.locator('.next-btn').click()

    // Check cumulative scores: Player 1: 70, Player 2: 70 (tied!)
    await expect(leaderboardItems.nth(0)).toContainText('70')
    await expect(leaderboardItems.nth(1)).toContainText('70')
  })
})
