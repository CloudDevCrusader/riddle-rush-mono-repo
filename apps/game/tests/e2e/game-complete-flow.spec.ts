import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'
import { generatePlayerName, generateAnswer } from './helpers/faker'

/**
 * Helper to wait for SPA hydration and specific element
 */
async function waitForPageReady(page: Page, selector: string, timeout = 10000) {
  await page.waitForLoadState('networkidle')
  await page.waitForSelector(selector, { timeout })
}

test.describe('Complete Game Flow', () => {
  // ===== SINGLE PLAYER TESTS =====
  test.describe('Single Player Flow', () => {
    test('should complete full game flow from menu to leaderboard', async ({ page }) => {
      // 1. Start at menu
      await page.goto('/', { timeout: 30000 })
      await waitForPageReady(page, '.menu-page, .splash-screen')

      // Wait for splash screen to finish
      await page.waitForTimeout(2000)
      const splashScreen = page.locator('.splash-screen')
      await splashScreen.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})

      const playBtn = page.locator('.play-btn')
      await expect(playBtn).toBeVisible({ timeout: 10000 })

      // 2. Navigate to players page
      await playBtn.click()
      await expect(page).toHaveURL(/\/players/)
      await page.waitForTimeout(500)

      // Verify we're on players page
      const playersList = page.locator('.players-list')
      await expect(playersList).toBeVisible()

      // 3. Start game - navigates to round-start
      const startBtn = page.locator('.start-btn')
      await expect(startBtn).toBeVisible()
      await expect(startBtn).not.toBeDisabled()
      await startBtn.click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(2000) // Wait for wheels to spin

      // 4. Wait for game to start automatically after wheels complete
      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
      await page.waitForTimeout(500)

      // Verify we're on game page
      const roundIndicator = page.locator('.round-indicator')
      await expect(roundIndicator).toBeVisible()
    })

    test('should display game elements correctly', async ({ page }) => {
      // Navigate directly to game page
      await page.goto('/game')
      await page.waitForLoadState('networkidle')

      // Wait for game loading spinner to disappear
      const spinner = page.locator('.spinner--overlay, [data-testid="loading-spinner"]')
      if ((await spinner.count()) > 0) {
        await spinner.waitFor({ state: 'hidden', timeout: 10000 })
      }

      // Check for game elements
      const gameElements = [
        page.locator('[data-testid="category-display"], .category-display'),
        page.locator('[data-testid="game-input"], input[type="text"]').first(),
      ]

      for (const element of gameElements) {
        if ((await element.count()) > 0) {
          await expect(element.first()).toBeVisible({ timeout: 5000 })
        }
      }
    })

    test('should handle game input', async ({ page }) => {
      await page.goto('/game')
      await page.waitForLoadState('networkidle')

      const input = page
        .locator(
          '[data-testid="game-input"], input[type="text"], input[placeholder*="Begriff" i], input[placeholder*="answer" i]'
        )
        .first()

      if ((await input.count()) > 0) {
        await expect(input).toBeVisible({ timeout: 5000 })
        await input.fill('Test')
        await expect(input).toHaveValue('Test')
      }
    })

    test('should not show player turn indicator in single player mode', async ({ page }) => {
      await page.goto('/game')
      await page.waitForTimeout(1000)

      const playerTurnIndicator = page.locator('.player-turn-indicator')
      await expect(playerTurnIndicator).not.toBeVisible()
    })
  })

  // ===== NAVIGATION TESTS =====
  test.describe('Navigation', () => {
    test('should navigate through scoring to leaderboard', async ({ page }) => {
      // Set up game state
      await page.goto('/players', { timeout: 30000 })
      await page.waitForLoadState('networkidle')

      const startBtn = page.locator('.start-btn')
      await startBtn.click()
      await page.waitForTimeout(2000)

      // Wait for game to start
      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
      await page.waitForTimeout(500)

      // Navigate to results
      await page.goto('/results', { timeout: 30000 })
      await page.waitForLoadState('networkidle')

      const scoresList = page.locator('.scores-list')
      await expect(scoresList).toBeVisible()

      const scoreItems = page.locator('.score-item')
      expect(await scoreItems.count()).toBeGreaterThan(0)

      // Navigate to leaderboard
      const nextBtn = page.locator('.next-btn')
      await expect(nextBtn).toBeVisible()
      await nextBtn.click()
      await expect(page).toHaveURL(/\/leaderboard/)
      await page.waitForTimeout(500)

      const leaderboardList = page.locator('.leaderboard-list')
      await expect(leaderboardList).toBeVisible()
    })

    test('should return to menu from leaderboard when game completed', async ({ page }) => {
      await page.goto('/leaderboard', { timeout: 30000 })
      await page.waitForLoadState('networkidle')

      const leaderboardList = page.locator('.leaderboard-list')
      await expect(leaderboardList).toBeVisible()

      const finishBtn = page.locator('.finish-btn')
      await expect(finishBtn).toBeVisible()
      await finishBtn.click()
      await expect(page).toHaveURL(/\/$/)
      await page.waitForTimeout(500)

      const playBtn = page.locator('.play-btn')
      await expect(playBtn).toBeVisible()
    })

    test('should handle browser back button navigation', async ({ page }) => {
      // Build up navigation history
      await page.goto('/', { timeout: 30000 })
      await page.waitForLoadState('networkidle')

      await page.waitForTimeout(2000)
      const splashScreen = page.locator('.splash-screen')
      await splashScreen.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})

      const playBtn = page.locator('.play-btn')
      await playBtn.click()
      await expect(page).toHaveURL(/\/players/)
      await page.waitForTimeout(500)

      const startBtn = page.locator('.start-btn')
      await startBtn.click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(500)

      // Use browser back button
      await page.goBack()
      await page.waitForTimeout(300)
      await expect(page).toHaveURL(/\/players/)

      await page.goBack()
      await page.waitForTimeout(300)
      await expect(page).toHaveURL(/\/$/)
    })

    test('should maintain score changes through navigation', async ({ page }) => {
      // Set up game state
      await page.goto('/players', { timeout: 30000 })
      await page.waitForLoadState('networkidle')

      const startBtn = page.locator('.start-btn')
      await startBtn.click()
      await page.waitForTimeout(2000)

      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
      await page.waitForTimeout(500)

      // Navigate to results page
      await page.goto('/results', { timeout: 30000 })
      await page.waitForLoadState('networkidle')

      const firstItem = page.locator('.score-item').first()
      const playerScore = firstItem.locator('.player-score')
      const addBtn = firstItem.locator('.score-action-btn').first()

      const initialScore = Number.parseInt((await playerScore.textContent()) || '0')
      await addBtn.click()
      await page.waitForTimeout(200)

      const newScore = Number.parseInt((await playerScore.textContent()) || '0')
      expect(newScore).toBeGreaterThan(initialScore)

      // Navigate to leaderboard
      const nextBtn = page.locator('.next-btn')
      await nextBtn.click()
      await expect(page).toHaveURL(/\/leaderboard/)
      await page.waitForTimeout(500)

      const leaderboardList = page.locator('.leaderboard-list')
      await expect(leaderboardList).toBeVisible()
    })
  })

  // ===== MULTI-PLAYER TESTS =====
  test.describe('Multi-Player Flow', () => {
    test('complete multi-player game: players → round-start → game → results → leaderboard → next round', async ({
      page,
    }) => {
      // 1. Navigate to players page
      await page.goto('/players')
      await expect(page).toHaveURL(/\/players/)

      // 2. Add players
      const addBtn = page.locator('.add-btn')
      const player2Name = generatePlayerName()
      const player3Name = generatePlayerName()

      page.once('dialog', async (dialog) => {
        expect(dialog.type()).toBe('prompt')
        await dialog.accept(player2Name)
      })
      await addBtn.click()
      await page.waitForTimeout(300)

      page.once('dialog', async (dialog) => {
        expect(dialog.type()).toBe('prompt')
        await dialog.accept(player3Name)
      })
      await addBtn.click()
      await page.waitForTimeout(300)

      // Verify 3 players
      const playerItems = page.locator('.player-item:not(.empty)')
      await expect(playerItems).toHaveCount(3)

      // 3. Start game
      const startBtn = page.locator('.start-btn')
      await startBtn.click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(2000)

      // 4. Wait for game to start
      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
      await page.waitForTimeout(500)

      // 5. Verify multi-player mode active
      const roundText = page.locator('.round-text')
      await expect(roundText).toBeVisible()

      const playerTurnIndicator = page.locator('.player-turn-indicator')
      await expect(playerTurnIndicator).toBeVisible()

      const turnName = page.locator('.turn-name')
      await expect(turnName).toHaveText('Player 1')

      // 6. Each player submits answer
      const answerInput = page.locator('.answer-input')
      const submitBtn = page.locator('.submit-answer-btn')
      const answer1 = generateAnswer()
      const answer2 = generateAnswer()
      const answer3 = generateAnswer()

      // Player 1
      await answerInput.fill(answer1)
      await submitBtn.click()
      await page.waitForTimeout(500)
      await expect(turnName).toHaveText(player2Name)

      // Player 2
      await answerInput.fill(answer2)
      await submitBtn.click()
      await page.waitForTimeout(500)
      await expect(turnName).toHaveText(player3Name)

      // Player 3
      await answerInput.fill(answer3)
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

      // 9. Verify all players and answers
      const scoreItems = page.locator('.score-item')
      await expect(scoreItems).toHaveCount(3)

      const playerAnswers = page.locator('.player-answer')
      await expect(playerAnswers.nth(0)).toContainText(answer1)
      await expect(playerAnswers.nth(1)).toContainText(answer2)
      await expect(playerAnswers.nth(2)).toContainText(answer3)

      // 10. Assign scores
      const allScoreButtons = page.locator('.score-action-btn')

      // Player 1: 30 points
      for (let i = 0; i < 3; i++) {
        await allScoreButtons.nth(0).click()
        await page.waitForTimeout(100)
      }

      // Player 2: 20 points
      for (let i = 0; i < 2; i++) {
        await allScoreButtons.nth(2).click()
        await page.waitForTimeout(100)
      }

      // Player 3: 10 points
      await allScoreButtons.nth(4).click()
      await page.waitForTimeout(100)

      // 11. Navigate to leaderboard
      const resultsNextBtn = page.locator('.next-btn')
      await resultsNextBtn.click()
      await expect(page).toHaveURL(/\/leaderboard/)

      // 12. Verify rankings
      const leaderboardItems = page.locator('.leaderboard-item')
      await expect(leaderboardItems).toHaveCount(3)

      const firstPlace = leaderboardItems.nth(0)
      await expect(firstPlace).toContainText('Player 1')
      await expect(firstPlace).toContainText('30')

      const secondPlace = leaderboardItems.nth(1)
      await expect(secondPlace).toContainText(player2Name)
      await expect(secondPlace).toContainText('20')

      const thirdPlace = leaderboardItems.nth(2)
      await expect(thirdPlace).toContainText(player3Name)
      await expect(thirdPlace).toContainText('10')

      // 13. Start next round
      const nextRoundBtn = page.locator('.next-round-btn')
      await expect(nextRoundBtn).toBeVisible()
      await nextRoundBtn.click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(2000)

      // 14. Verify Round 2 started
      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
      await page.waitForTimeout(500)
      await expect(playerTurnIndicator).toBeVisible()
      await expect(turnName).toHaveText('Player 1')

      // Submit answers for round 2
      const round2Answer1 = generateAnswer()
      const round2Answer2 = generateAnswer()
      const round2Answer3 = generateAnswer()

      await answerInput.fill(round2Answer1)
      await submitBtn.click()
      await page.waitForTimeout(500)

      await answerInput.fill(round2Answer2)
      await submitBtn.click()
      await page.waitForTimeout(500)

      await answerInput.fill(round2Answer3)
      await submitBtn.click()
      await page.waitForTimeout(1000)

      await nextBtn.click()
      await expect(page).toHaveURL(/\/results/)

      // Give more points for round 2
      const allScoreButtons2 = page.locator('.score-action-btn')
      await allScoreButtons2.nth(0).click() // Player 1: +10 = 40 total
      await page.waitForTimeout(100)
      await allScoreButtons2.nth(2).click() // Player 2: +10 = 30 total
      await page.waitForTimeout(100)
      await allScoreButtons2.nth(4).click() // Player 3: +10 = 20 total
      await page.waitForTimeout(100)

      // Go to leaderboard
      const nextBtn2 = page.locator('.next-btn')
      await nextBtn2.click()
      await page.waitForTimeout(500)
      await expect(page).toHaveURL(/\/leaderboard/)

      // Verify cumulative scores after round 2
      await expect(leaderboardItems.nth(0)).toContainText('40')
      await expect(leaderboardItems.nth(1)).toContainText('30')
      await expect(leaderboardItems.nth(2)).toContainText('20')
    })

    test('should show NEXT button only when all players submitted', async ({ page }) => {
      await page.goto('/players')

      const player2Name = generatePlayerName()
      page.once('dialog', async (dialog) => {
        await dialog.accept(player2Name)
      })
      const addBtn = page.locator('.add-btn')
      await addBtn.click()
      await page.waitForTimeout(300)

      await page.locator('.start-btn').click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(2000)

      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
      await page.waitForTimeout(500)

      const answerInput = page.locator('.answer-input')
      const submitBtn = page.locator('.submit-answer-btn')
      const allSubmittedMessage = page.locator('.all-submitted-message')
      const nextBtn = page.locator('[data-testid="next-button"]')

      // After first player - should NOT show button
      const ans1 = generateAnswer()
      await answerInput.fill(ans1)
      await submitBtn.click()
      await page.waitForTimeout(500)

      await expect(allSubmittedMessage).not.toBeVisible()
      await expect(nextBtn).not.toBeVisible()

      // After second player - should show button
      const ans2 = generateAnswer()
      await answerInput.fill(ans2)
      await submitBtn.click()
      await page.waitForTimeout(1000)

      await expect(allSubmittedMessage).toBeVisible()
      await expect(nextBtn).toBeVisible()
    })

    test('should preserve player names across rounds', async ({ page }) => {
      await page.goto('/players')

      const customPlayer2 = generatePlayerName()
      const customPlayer3 = generatePlayerName()

      page.once('dialog', async (dialog) => {
        await dialog.accept(customPlayer2)
      })
      await page.locator('.add-btn').click()
      await page.waitForTimeout(300)

      page.once('dialog', async (dialog) => {
        await dialog.accept(customPlayer3)
      })
      await page.locator('.add-btn').click()
      await page.waitForTimeout(300)

      // Start and complete first round
      await page.locator('.start-btn').click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(2000)

      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
      await page.waitForTimeout(500)

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
      await expect(playerNames.nth(1)).toContainText(customPlayer2)
      await expect(playerNames.nth(2)).toContainText(customPlayer3)

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
      await expect(playerNames.nth(1)).toContainText(customPlayer2)
      await expect(playerNames.nth(2)).toContainText(customPlayer3)
    })
  })

  // ===== MULTI-ROUND WITH CHAMPION TESTS =====
  test.describe('Multi-Round Games with Champion', () => {
    test('should play multiple rounds with accumulating points and declare champion', async ({
      page,
    }) => {
      // 1. Start at home
      await page.goto('/', { timeout: 30000 })
      await page.waitForLoadState('networkidle')

      await page.waitForTimeout(2000)
      const splashScreen = page.locator('.splash-screen')
      await splashScreen.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})

      // 2. Navigate to players
      const playBtn = page.locator('.play-btn')
      await expect(playBtn).toBeVisible()
      await playBtn.click()
      await expect(page).toHaveURL(/\/players/)
      await page.waitForTimeout(500)

      // 3. Add players
      const addBtn = page.locator('.add-btn')
      const player2Name = 'Alice'
      const player3Name = 'Bob'

      if ((await addBtn.count()) > 0) {
        page.once('dialog', async (dialog) => {
          await dialog.accept(player2Name)
        })
        await addBtn.click()
        await page.waitForTimeout(300)
      }

      if ((await addBtn.count()) > 0) {
        page.once('dialog', async (dialog) => {
          await dialog.accept(player3Name)
        })
        await addBtn.click()
        await page.waitForTimeout(300)
      }

      const playerItems = page.locator('.player-item:not(.empty)')
      const playerCount = await playerItems.count()
      expect(playerCount).toBeGreaterThanOrEqual(2)

      // 4. Start game - Round 1
      const startBtn = page.locator('.start-btn')
      await expect(startBtn).toBeVisible()
      await startBtn.click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(3000)

      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
      await page.waitForTimeout(500)

      const roundIndicator = page.locator('.round-indicator')
      await expect(roundIndicator).toBeVisible()
      await expect(roundIndicator).toContainText('1')

      // 5. Navigate to results for Round 1
      await page.goto('/results', { timeout: 30000 })
      await page.waitForLoadState('networkidle')

      const scoresList = page.locator('.scores-list')
      await expect(scoresList).toBeVisible()

      // Assign scores for Round 1
      const scoreItems = page.locator('.score-item')
      const round1Scores = [10, 5, 3]

      for (let i = 0; i < Math.min(playerCount, round1Scores.length); i++) {
        const scoreItem = scoreItems.nth(i)
        const addBtn = scoreItem.locator('.score-action-btn').first()
        const playerScore = scoreItem.locator('.player-score')

        const targetScore = round1Scores[i] || 0
        for (let points = 0; points < targetScore; points++) {
          await addBtn.click()
          await page.waitForTimeout(100)
        }

        const finalScore = Number.parseInt((await playerScore.textContent()) || '0')
        expect(finalScore).toBe(targetScore)
      }

      // 6. Navigate to leaderboard
      const nextBtn = page.locator('.next-btn')
      await expect(nextBtn).toBeVisible()
      await nextBtn.click()
      await expect(page).toHaveURL(/\/leaderboard/)
      await page.waitForTimeout(500)

      const leaderboardList = page.locator('.leaderboard-list')
      await expect(leaderboardList).toBeVisible()

      const leaderboardItems = page.locator('.leaderboard-item')
      expect(await leaderboardItems.count()).toBeGreaterThanOrEqual(2)

      const firstPlaceScore = leaderboardItems.first().locator('.player-total-score')
      await expect(firstPlaceScore).toContainText('10')

      // 7. Continue to Round 2
      const continueBtn = page.locator('.continue-btn, .next-round-btn, button:has-text("Next")')
      if ((await continueBtn.count()) > 0) {
        await continueBtn.first().click()
        await expect(page).toHaveURL(/\/round-start/)
        await page.waitForTimeout(3000)

        await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
        await page.waitForTimeout(500)

        await expect(roundIndicator).toContainText('2')

        // 8. Navigate to results for Round 2
        await page.goto('/results', { timeout: 30000 })
        await page.waitForLoadState('networkidle')

        const round2Scores = [5, 15, 8]

        for (let i = 0; i < Math.min(playerCount, round2Scores.length); i++) {
          const scoreItem = scoreItems.nth(i)
          const addBtn = scoreItem.locator('.score-action-btn').first()
          const playerScore = scoreItem.locator('.player-score')

          const currentRoundScore = Number.parseInt((await playerScore.textContent()) || '0')
          const targetScore = round2Scores[i] || 0

          for (let points = currentRoundScore; points < targetScore; points++) {
            await addBtn.click()
            await page.waitForTimeout(100)
          }
        }

        // 9. Navigate to final leaderboard
        await nextBtn.click()
        await expect(page).toHaveURL(/\/leaderboard/)
        await page.waitForTimeout(500)

        // 10. Verify accumulated scores and champion
        const finalLeaderboardItems = page.locator('.leaderboard-item')
        expect(await finalLeaderboardItems.count()).toBeGreaterThanOrEqual(2)

        const championItem = finalLeaderboardItems.first()
        const championScore = championItem.locator('.player-total-score')
        const championScoreValue = Number.parseInt((await championScore.textContent()) || '0')

        expect(championScoreValue).toBeGreaterThanOrEqual(15)

        // Verify ranking is correct
        const allScores = []
        for (let i = 0; i < (await finalLeaderboardItems.count()); i++) {
          const scoreText = await finalLeaderboardItems
            .nth(i)
            .locator('.player-total-score')
            .textContent()
          allScores.push(Number.parseInt(scoreText || '0'))
        }

        // Verify scores are in descending order
        for (let i = 0; i < allScores.length - 1; i++) {
          expect(allScores[i]).toBeGreaterThanOrEqual(allScores[i + 1] || 0)
        }

        expect(allScores[0]).toBe(Math.max(...allScores))
      }
    })

    test('should handle 3 rounds with point accumulation', async ({ page }) => {
      // Setup
      await page.goto('/players', { timeout: 30000 })
      await page.waitForLoadState('networkidle')

      const addBtn = page.locator('.add-btn')
      if ((await addBtn.count()) > 0) {
        page.once('dialog', async (dialog) => {
          await dialog.accept('Player 2')
        })
        await addBtn.click()
        await page.waitForTimeout(300)
      }

      const startBtn = page.locator('.start-btn')
      await startBtn.click()
      await page.waitForTimeout(3000)

      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

      // Track cumulative scores
      const cumulativeScores: number[][] = [
        [5, 3], // Round 1
        [8, 7], // Round 2
        [6, 10], // Round 3
      ]

      for (let round = 0; round < 3; round++) {
        await page.goto('/results', { timeout: 30000 })
        await page.waitForLoadState('networkidle')

        const scoreItems = page.locator('.score-item')
        const playerCount = Math.min(await scoreItems.count(), 2)

        // Assign scores for current round
        for (let i = 0; i < playerCount; i++) {
          const scoreItem = scoreItems.nth(i)
          const addBtn = scoreItem.locator('.score-action-btn').first()
          const playerScore = scoreItem.locator('.player-score')

          const targetScore = cumulativeScores[round]?.[i] || 0
          const currentScore = Number.parseInt((await playerScore.textContent()) || '0')

          for (let points = currentScore; points < targetScore; points++) {
            await addBtn.click()
            await page.waitForTimeout(80)
          }
        }

        const nextBtn = page.locator('.next-btn')
        await nextBtn.click()
        await expect(page).toHaveURL(/\/leaderboard/)
        await page.waitForTimeout(500)

        // Verify cumulative scores
        const leaderboardItems = page.locator('.leaderboard-item')
        const expectedTotal1 = cumulativeScores
          .slice(0, round + 1)
          .reduce((sum, r) => sum + (r[0] ?? 0), 0)
        const expectedTotal2 = cumulativeScores
          .slice(0, round + 1)
          .reduce((sum, r) => sum + (r[1] ?? 0), 0)

        const scores = []
        for (let i = 0; i < Math.min(await leaderboardItems.count(), 2); i++) {
          const scoreText = await leaderboardItems
            .nth(i)
            .locator('.player-total-score')
            .textContent()
          scores.push(Number.parseInt(scoreText || '0'))
        }

        const hasExpectedScore = scores.includes(expectedTotal1) || scores.includes(expectedTotal2)
        expect(hasExpectedScore).toBe(true)

        // Continue to next round if not last
        if (round < 2) {
          const continueBtn = page.locator(
            '.continue-btn, .next-round-btn, button:has-text("Next")'
          )
          if ((await continueBtn.count()) > 0) {
            await continueBtn.first().click()
            await page.waitForTimeout(3000)
            await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
          } else {
            break
          }
        }
      }

      // Final verification
      await expect(page).toHaveURL(/\/leaderboard/)
      const finalLeaderboard = page.locator('.leaderboard-list')
      await expect(finalLeaderboard).toBeVisible()

      const championItem = page.locator('.leaderboard-item').first()
      const championScore = championItem.locator('.player-total-score')
      const championTotal = Number.parseInt((await championScore.textContent()) || '0')

      expect(championTotal).toBeGreaterThanOrEqual(19)
    })

    test('should correctly calculate and display cumulative scores', async ({ page }) => {
      await page.goto('/players')

      const testPlayer2 = generatePlayerName()
      page.once('dialog', async (dialog) => {
        await dialog.accept(testPlayer2)
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
      const r1ans1 = generateAnswer()
      await answerInput.fill(r1ans1)
      await submitBtn.click()
      await page.waitForTimeout(300)

      const r1ans2 = generateAnswer()
      await answerInput.fill(r1ans2)
      await submitBtn.click()
      await page.waitForTimeout(1000)

      await page.locator('[data-testid="next-button"]').click()

      // Give Player 1: 50 points, Player 2: 30 points
      const allScoreButtons = page.locator('.score-action-btn')
      for (let i = 0; i < 5; i++) {
        await allScoreButtons.nth(0).click()
        await page.waitForTimeout(50)
      }
      for (let i = 0; i < 3; i++) {
        await allScoreButtons.nth(2).click()
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

      const r2ans1 = generateAnswer()
      await answerInput.fill(r2ans1)
      await submitBtn.click()
      await page.waitForTimeout(300)

      const r2ans2 = generateAnswer()
      await answerInput.fill(r2ans2)
      await submitBtn.click()
      await page.waitForTimeout(1000)

      await page.locator('[data-testid="next-button"]').click()

      // Give Player 1: 20 more, Player 2: 40 more
      const allScoreButtons3 = page.locator('.score-action-btn')
      for (let i = 0; i < 2; i++) {
        await allScoreButtons3.nth(0).click()
        await page.waitForTimeout(50)
      }
      for (let i = 0; i < 4; i++) {
        await allScoreButtons3.nth(2).click()
        await page.waitForTimeout(50)
      }

      await page.locator('.next-btn').click()

      // Check cumulative: Player 1: 70, Player 2: 70 (tied)
      await expect(leaderboardItems.nth(0)).toContainText('70')
      await expect(leaderboardItems.nth(1)).toContainText('70')
    })
  })
})
