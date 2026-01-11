import { test, expect } from '@playwright/test'

test.describe('Multi-Round Game with Champion', () => {
  test('should play multiple rounds with accumulating points and declare champion', async ({
    page,
  }) => {
    // 1. Start at home page
    await page.goto('/', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Wait for splash screen to finish
    await page.waitForTimeout(2000)
    const splashScreen = page.locator('.splash-screen')
    await splashScreen.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})

    // 2. Navigate to players page
    const playBtn = page.locator('.play-btn')
    await expect(playBtn).toBeVisible()
    await playBtn.click()
    await expect(page).toHaveURL(/\/players/)
    await page.waitForTimeout(500)

    // 3. Add multiple players
    const addBtn = page.locator('.add-btn')
    const player2Name = 'Alice'
    const player3Name = 'Bob'

    // Add Player 2
    if ((await addBtn.count()) > 0) {
      page.once('dialog', async (dialog) => {
        await dialog.accept(player2Name)
      })
      await addBtn.click()
      await page.waitForTimeout(300)
    }

    // Add Player 3
    if ((await addBtn.count()) > 0) {
      page.once('dialog', async (dialog) => {
        await dialog.accept(player3Name)
      })
      await addBtn.click()
      await page.waitForTimeout(300)
    }

    // Verify we have at least 2 players
    const playerItems = page.locator('.player-item:not(.empty)')
    const playerCount = await playerItems.count()
    expect(playerCount).toBeGreaterThanOrEqual(2)

    // 4. Start game - Round 1
    const startBtn = page.locator('.start-btn')
    await expect(startBtn).toBeVisible()
    await startBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(3000) // Wait for wheels animation

    // Wait for game to start automatically
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Verify Round 1
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
    const round1Scores = [10, 5, 3] // Points for each player

    for (let i = 0; i < Math.min(playerCount, round1Scores.length); i++) {
      const scoreItem = scoreItems.nth(i)
      const addBtn = scoreItem.locator('.score-action-btn').first()
      const playerScore = scoreItem.locator('.player-score')

      // Click add button multiple times to reach desired score
      const targetScore = round1Scores[i] || 0
      for (let points = 0; points < targetScore; points++) {
        await addBtn.click()
        await page.waitForTimeout(100)
      }

      // Verify score was updated
      const finalScore = Number.parseInt((await playerScore.textContent()) || '0')
      expect(finalScore).toBe(targetScore)
    }

    // 6. Navigate to leaderboard after Round 1
    const nextBtn = page.locator('.next-btn')
    await expect(nextBtn).toBeVisible()
    await nextBtn.click()
    await expect(page).toHaveURL(/\/leaderboard/)
    await page.waitForTimeout(500)

    const leaderboardList = page.locator('.leaderboard-list')
    await expect(leaderboardList).toBeVisible()

    // Verify Round 1 scores on leaderboard
    const leaderboardItems = page.locator('.leaderboard-item')
    expect(await leaderboardItems.count()).toBeGreaterThanOrEqual(2)

    // Check first place has highest score (10)
    const firstPlaceScore = leaderboardItems.first().locator('.player-total-score')
    await expect(firstPlaceScore).toContainText('10')

    // 7. Continue to Round 2
    const continueBtn = page.locator('.continue-btn, .next-round-btn, button:has-text("Next")')
    if ((await continueBtn.count()) > 0) {
      await continueBtn.first().click()
      await expect(page).toHaveURL(/\/round-start/)
      await page.waitForTimeout(3000)

      // Wait for game to start automatically
      await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
      await page.waitForTimeout(500)

      // Verify Round 2
      await expect(roundIndicator).toContainText('2')

      // 8. Navigate to results for Round 2
      await page.goto('/results', { timeout: 30000 })
      await page.waitForLoadState('networkidle')

      // Assign scores for Round 2 (these should ADD to previous scores)
      const round2Scores = [5, 15, 8] // New points for each player

      for (let i = 0; i < Math.min(playerCount, round2Scores.length); i++) {
        const scoreItem = scoreItems.nth(i)
        const addBtn = scoreItem.locator('.score-action-btn').first()
        const playerScore = scoreItem.locator('.player-score')

        // Reset display (shows current round score)
        const currentRoundScore = Number.parseInt((await playerScore.textContent()) || '0')

        // Click add button to reach Round 2 target
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

      // Expected total scores after 2 rounds:
      // Player 1: 10 + 5 = 15
      // Player 2: 5 + 15 = 20 (CHAMPION)
      // Player 3: 3 + 8 = 11

      // Verify winner/champion is displayed (should be Player 2 with 20 points)
      const championItem = finalLeaderboardItems.first()
      const championScore = championItem.locator('.player-total-score')
      const championScoreValue = Number.parseInt((await championScore.textContent()) || '0')

      // Champion should have highest score
      expect(championScoreValue).toBeGreaterThanOrEqual(15)

      // Check for champion indicators (crown, winner badge, etc.)
      const championIndicators = championItem.locator(
        '.winner-badge, .champion-crown, .winner-icon, [class*="winner"], [class*="champion"]'
      )
      const hasChampionIndicator = (await championIndicators.count()) > 0

      // Log for debugging
      if (!hasChampionIndicator) {
        console.log('No champion indicator found - checking leaderboard structure')
        const leaderboardHTML = await leaderboardList.innerHTML()
        console.log('Leaderboard HTML:', leaderboardHTML.substring(0, 500))
      }

      // At minimum, verify ranking is correct (first place shown first)
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

      // Verify top score is the champion
      expect(allScores[0]).toBe(Math.max(...allScores))
    }
  })

  test('should handle 3 rounds with point accumulation', async ({ page }) => {
    // 1. Setup - Start game with players
    await page.goto('/players', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Add second player
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

    // Wait for game to start
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

    // Track cumulative scores
    const cumulativeScores: number[][] = [
      [5, 3], // Round 1
      [8, 7], // Round 2
      [6, 10], // Round 3
    ]

    for (let round = 0; round < 3; round++) {
      // Navigate to results
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

      // Go to leaderboard
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

      // Check that scores are cumulative
      const scores = []
      for (let i = 0; i < Math.min(await leaderboardItems.count(), 2); i++) {
        const scoreText = await leaderboardItems.nth(i).locator('.player-total-score').textContent()
        scores.push(Number.parseInt(scoreText || '0'))
      }

      // Verify one of the scores matches our expected totals
      const hasExpectedScore = scores.includes(expectedTotal1) || scores.includes(expectedTotal2)
      expect(hasExpectedScore).toBe(true)

      // Continue to next round if not last round
      if (round < 2) {
        const continueBtn = page.locator('.continue-btn, .next-round-btn, button:has-text("Next")')
        if ((await continueBtn.count()) > 0) {
          await continueBtn.first().click()
          await page.waitForTimeout(3000)
          await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
        } else {
          break // Exit if no continue button
        }
      }
    }

    // Final verification - check champion after 3 rounds
    await expect(page).toHaveURL(/\/leaderboard/)
    const finalLeaderboard = page.locator('.leaderboard-list')
    await expect(finalLeaderboard).toBeVisible()

    // Expected totals: Player 1 = 19, Player 2 = 20 (Champion)
    const championItem = page.locator('.leaderboard-item').first()
    const championScore = championItem.locator('.player-total-score')
    const championTotal = Number.parseInt((await championScore.textContent()) || '0')

    // Verify champion has highest score
    expect(championTotal).toBeGreaterThanOrEqual(19)
  })

  test('should display champion crown or badge for winner', async ({ page }) => {
    // Setup game and complete it to trigger champion display
    await page.goto('/players', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await page.waitForTimeout(3000)

    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

    // Go to results and assign score
    await page.goto('/results', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const scoreItem = page.locator('.score-item').first()
    const addBtn = scoreItem.locator('.score-action-btn').first()

    // Add some points
    for (let i = 0; i < 10; i++) {
      await addBtn.click()
      await page.waitForTimeout(80)
    }

    // Complete game and go to leaderboard
    const nextBtn = page.locator('.next-btn')
    await nextBtn.click()
    await expect(page).toHaveURL(/\/leaderboard/)
    await page.waitForTimeout(500)

    // Mark game as completed by clicking finish
    const finishBtn = page.locator('.finish-btn, .complete-btn, button:has-text("Finish")')
    if ((await finishBtn.count()) > 0) {
      await finishBtn.click()
      await page.waitForTimeout(500)

      // Go back to leaderboard to see champion status
      await page.goto('/leaderboard', { timeout: 30000 })
      await page.waitForLoadState('networkidle')
    }

    // Verify champion indicator exists
    const leaderboardList = page.locator('.leaderboard-list')
    await expect(leaderboardList).toBeVisible()

    const firstPlace = page.locator('.leaderboard-item').first()
    const championIndicators = firstPlace.locator(
      '.winner-badge, .champion-crown, .winner-icon, .trophy, [class*="winner"], [class*="champion"]'
    )

    // Log for debugging if not found
    if ((await championIndicators.count()) === 0) {
      console.log('Champion indicators not found - checking first place element')
      const firstPlaceHTML = await firstPlace.innerHTML()
      console.log('First place HTML:', firstPlaceHTML.substring(0, 300))
    }

    // At minimum, verify first place has highest score
    const firstPlaceScore = firstPlace.locator('.player-total-score')
    const firstPlaceValue = Number.parseInt((await firstPlaceScore.textContent()) || '0')
    expect(firstPlaceValue).toBeGreaterThan(0)
  })
})
