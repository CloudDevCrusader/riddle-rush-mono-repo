import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForSplashScreen,
  waitForVisible,
  clickWithRetry,
  waitForNavigation,
  waitForLoadingComplete,
  getTextContent,
  TIMEOUTS,
} from '../utils/e2e-helpers'

test.describe('Complete Game Flow', () => {
  test('should complete full game flow from menu to leaderboard', async ({ page }) => {
    // 1. Start at menu
    await navigateTo(page, '/')
    await waitForSplashScreen(page)

    const playBtn = page.locator('.play-btn')
    await waitForVisible(playBtn)

    // 2. Navigate to players page
    await clickWithRetry(playBtn)
    await waitForNavigation(page, /\/players/)

    // Verify we're on players page
    const playersList = page.locator('.players-list')
    await waitForVisible(playersList)

    // 3. Ensure we have at least one player
    const startBtn = page.locator('.start-btn')
    await waitForVisible(startBtn)
    await expect(startBtn).not.toBeDisabled()

    // 4. Start game - navigates to round-start
    await clickWithRetry(startBtn)
    await waitForNavigation(page, /\/round-start/)
    await page.waitForTimeout(TIMEOUTS.ANIMATION) // Wait for wheels to spin

    // 5. Wait for game to start automatically after wheels complete
    await waitForNavigation(page, /\/game/, { timeout: TIMEOUTS.LONG })
    await waitForLoadingComplete(page)

    // Verify we're on game page
    const roundIndicator = page.locator('.round-indicator')
    await waitForVisible(roundIndicator)
  })

  test('should navigate through scoring to leaderboard', async ({ page }) => {
    // Set up game state by going through players page first
    await navigateTo(page, '/players')

    // Start game with default player to initialize store
    const startBtn = page.locator('.start-btn')
    await clickWithRetry(startBtn)
    await page.waitForTimeout(TIMEOUTS.ANIMATION)

    // Wait for round-start to complete and navigate to game
    await waitForNavigation(page, /\/game/, { timeout: TIMEOUTS.LONG })
    await waitForLoadingComplete(page)

    // Navigate to results (simulating game completion)
    await navigateTo(page, '/results')

    // Verify we're on results page
    const scoresList = page.locator('.scores-list')
    await waitForVisible(scoresList)

    // Verify player scores are displayed
    const scoreItems = page.locator('.score-item')
    expect(await scoreItems.count()).toBeGreaterThan(0)

    // Navigate to leaderboard
    const nextBtn = page.locator('.next-btn')
    await waitForVisible(nextBtn)
    await clickWithRetry(nextBtn)
    await waitForNavigation(page, /\/leaderboard/)

    // Verify we're on leaderboard
    const leaderboardList = page.locator('.leaderboard-list')
    await waitForVisible(leaderboardList)
  })

  test('should return to menu from leaderboard when game completed', async ({ page }) => {
    // Start at leaderboard
    await navigateTo(page, '/leaderboard')

    // Verify we're on leaderboard
    const leaderboardList = page.locator('.leaderboard-list')
    await waitForVisible(leaderboardList)

    // Click OK button (should return to menu when game completed)
    const okBtn = page.locator('.ok-btn')
    await waitForVisible(okBtn)
    await clickWithRetry(okBtn)
    await waitForNavigation(page, /\/$/)

    // Verify we're back at menu
    const playBtn = page.locator('.play-btn')
    await waitForVisible(playBtn)
  })

  test('should allow adding multiple players and continuing flow', async ({ page }) => {
    // Start at menu
    await navigateTo(page, '/')
    await waitForSplashScreen(page)

    // Navigate to players
    const playBtn = page.locator('.play-btn')
    await clickWithRetry(playBtn)
    await waitForNavigation(page, /\/players/)

    // Add a new player
    const addBtn = page.locator('.add-btn')
    if ((await addBtn.count()) > 0) {
      page.on('dialog', async (dialog) => {
        await dialog.accept('Player 2')
      })

      await clickWithRetry(addBtn)
      await page.waitForTimeout(500)

      // Verify player was added
      const playerItems = page.locator('.player-item:not(.empty)')
      expect(await playerItems.count()).toBeGreaterThanOrEqual(2)
    }

    // Continue to round-start
    const startBtn = page.locator('.start-btn')
    await clickWithRetry(startBtn)
    await waitForNavigation(page, /\/round-start/)
  })

  test('should allow navigation back through the flow', async ({ page }) => {
    // Start at game page
    await navigateTo(page, '/game')
    await waitForLoadingComplete(page)

    // Go back
    const backBtn = page.locator('.back-btn')
    if ((await backBtn.count()) > 0) {
      await clickWithRetry(backBtn)
      await page.waitForTimeout(500)
    }

    // Should be back at previous page (navigation history dependent)
  })

  test('should maintain score changes through navigation', async ({ page }) => {
    // Set up game state first
    await navigateTo(page, '/players')

    const startBtn = page.locator('.start-btn')
    await clickWithRetry(startBtn)
    await page.waitForTimeout(TIMEOUTS.ANIMATION)

    // Wait for game to start
    await waitForNavigation(page, /\/game/, { timeout: TIMEOUTS.LONG })
    await waitForLoadingComplete(page)

    // Navigate to results page
    await navigateTo(page, '/results')

    const firstItem = page.locator('.score-item').first()
    const playerScore = firstItem.locator('.player-score')
    const addBtn = firstItem.locator('.score-action-btn').first()

    // Get initial score
    const initialScore = Number.parseInt((await getTextContent(playerScore)) || '0')

    // Increase score
    await clickWithRetry(addBtn)
    await page.waitForTimeout(300)

    const newScore = Number.parseInt((await getTextContent(playerScore)) || '0')
    expect(newScore).toBeGreaterThan(initialScore)

    // Navigate to leaderboard
    const nextBtn = page.locator('.next-btn')
    await clickWithRetry(nextBtn)
    await waitForNavigation(page, /\/leaderboard/)

    // Verify leaderboard displays
    const leaderboardList = page.locator('.leaderboard-list')
    await waitForVisible(leaderboardList)
  })

  test('should handle back button navigation consistently', async ({ page }) => {
    // Build up navigation history: menu -> players -> round-start
    await navigateTo(page, '/')
    await waitForSplashScreen(page)

    const playBtn = page.locator('.play-btn')
    await clickWithRetry(playBtn)
    await waitForNavigation(page, /\/players/)

    const startBtn = page.locator('.start-btn')
    await clickWithRetry(startBtn)
    await waitForNavigation(page, /\/round-start/)

    // Use browser back button
    await page.goBack()
    await page.waitForTimeout(500)
    await waitForNavigation(page, /\/players/)

    await page.goBack()
    await page.waitForTimeout(500)
    await waitForNavigation(page, /\/$/)
  })
})
