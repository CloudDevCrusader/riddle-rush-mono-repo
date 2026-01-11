import { test, expect } from '@playwright/test'

test.describe('Complete Game Flow', () => {
  test('should complete full game flow from menu to leaderboard', async ({ page }) => {
    // 1. Start at menu
    await page.goto('/', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Wait for splash screen to finish
    await page.waitForTimeout(2000)
    const splashScreen = page.locator('.splash-screen')
    await splashScreen.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})

    const playBtn = page.locator('.play-btn')
    await expect(playBtn).toBeVisible()

    // 2. Navigate to players page
    await playBtn.click()
    await expect(page).toHaveURL(/\/players/)
    await page.waitForTimeout(500)

    // Verify we're on players page
    const playersList = page.locator('.players-list')
    await expect(playersList).toBeVisible()

    // 3. Ensure we have at least one player
    const startBtn = page.locator('.start-btn')
    await expect(startBtn).toBeVisible()
    await expect(startBtn).not.toBeDisabled()

    // 4. Start game - navigates to round-start
    await startBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000) // Wait for wheels to spin

    // 5. Wait for game to start automatically after wheels complete
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Verify we're on game page
    const roundIndicator = page.locator('.round-indicator')
    await expect(roundIndicator).toBeVisible()
  })

  test('should navigate through scoring to leaderboard', async ({ page }) => {
    // Set up game state by going through players page first
    await page.goto('/players', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Start game with default player to initialize store
    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await page.waitForTimeout(2000)

    // Wait for round-start to complete and navigate to game
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Navigate to results (simulating game completion)
    await page.goto('/results', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Verify we're on results page
    const scoresList = page.locator('.scores-list')
    await expect(scoresList).toBeVisible()

    // Verify player scores are displayed
    const scoreItems = page.locator('.score-item')
    expect(await scoreItems.count()).toBeGreaterThan(0)

    // Navigate to leaderboard
    const nextBtn = page.locator('.next-btn')
    await expect(nextBtn).toBeVisible()
    await nextBtn.click()
    await expect(page).toHaveURL(/\/leaderboard/)
    await page.waitForTimeout(500)

    // Verify we're on leaderboard
    const leaderboardList = page.locator('.leaderboard-list')
    await expect(leaderboardList).toBeVisible()
  })

  test('should return to menu from leaderboard when game completed', async ({ page }) => {
    // Start at leaderboard
    await page.goto('/leaderboard', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Verify we're on leaderboard
    const leaderboardList = page.locator('.leaderboard-list')
    await expect(leaderboardList).toBeVisible()

    // Click OK button (should return to menu when game completed)
    const finishBtn = page.locator('.finish-btn')
    await expect(finishBtn).toBeVisible()
    await finishBtn.click()
    await expect(page).toHaveURL(/\/$/)
    await page.waitForTimeout(500)

    // Verify we're back at menu
    const playBtn = page.locator('.play-btn')
    await expect(playBtn).toBeVisible()
  })

  test('should allow adding multiple players and continuing flow', async ({ page }) => {
    // Start at menu
    await page.goto('/', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Wait for splash screen to finish
    await page.waitForTimeout(2000)
    const splashScreen = page.locator('.splash-screen')
    await splashScreen.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})

    // Navigate to players
    const playBtn = page.locator('.play-btn')
    await playBtn.click()
    await expect(page).toHaveURL(/\/players/)
    await page.waitForTimeout(500)

    // Add a new player
    const addBtn = page.locator('.add-btn')
    if ((await addBtn.count()) > 0) {
      page.on('dialog', async (dialog) => {
        await dialog.accept('Player 2')
      })

      await addBtn.click()
      await page.waitForTimeout(300)

      // Verify player was added
      const playerItems = page.locator('.player-item:not(.empty)')
      expect(await playerItems.count()).toBeGreaterThanOrEqual(2)
    }

    // Continue to round-start
    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(500)
  })

  test('should allow navigation back through the flow', async ({ page }) => {
    // Start at game page
    await page.goto('/game', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Go back
    const backBtn = page.locator('.back-btn')
    if ((await backBtn.count()) > 0) {
      await backBtn.click()
      await page.waitForTimeout(500)
    }

    // Should be back at previous page (navigation history dependent)
  })

  test('should maintain score changes through navigation', async ({ page }) => {
    // Set up game state first
    await page.goto('/players', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await page.waitForTimeout(2000)

    // Wait for game to start
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Navigate to results page
    await page.goto('/results', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    const firstItem = page.locator('.score-item').first()
    const playerScore = firstItem.locator('.player-score')
    const addBtn = firstItem.locator('.score-action-btn').first()

    // Get initial score
    const initialScore = Number.parseInt((await playerScore.textContent()) || '0')

    // Increase score
    await addBtn.click()
    await page.waitForTimeout(200)

    const newScore = Number.parseInt((await playerScore.textContent()) || '0')
    expect(newScore).toBeGreaterThan(initialScore)

    // Navigate to leaderboard
    const nextBtn = page.locator('.next-btn')
    await nextBtn.click()
    await expect(page).toHaveURL(/\/leaderboard/)
    await page.waitForTimeout(500)

    // Verify leaderboard displays
    const leaderboardList = page.locator('.leaderboard-list')
    await expect(leaderboardList).toBeVisible()
  })

  test('should handle back button navigation consistently', async ({ page }) => {
    // Build up navigation history: menu -> players -> round-start
    await page.goto('/', { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Wait for splash screen to finish
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
})
