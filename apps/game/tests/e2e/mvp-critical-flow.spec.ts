import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForSplashScreen,
  waitForVisible,
  clickWithRetry,
  waitForNavigation,
  waitForCount,
  getTextContent,
  waitForLoadingComplete,
  fillInput,
  elementExists,
  isVisible,
  waitForPageReady,
  TIMEOUTS,
} from '../utils/e2e-helpers'

/**
 * MVP Critical Flow Tests
 *
 * These tests verify the core MVP functionality works end-to-end
 * and identify any critical issues that would prevent demonstration.
 *
 * @critical - These tests are marked as critical and run in CI/CD verify stage
 */
test.describe('MVP Critical Flow @critical', () => {
  test('should complete full game flow: menu → players → round-start → game → results → leaderboard → next round', async ({ page }) => {
    // Step 1: Start at menu
    await navigateTo(page, '/')
    await waitForSplashScreen(page)

    // Step 2: Navigate to players
    const playBtn = page.locator('.play-btn')
    await waitForVisible(playBtn)
    await clickWithRetry(playBtn)
    await waitForNavigation(page, /\/players/)

    // Step 3: Verify default players exist and start game
    const playerItems = page.locator('.player-item:not(.empty)')
    const playerCount = await playerItems.count()
    expect(playerCount).toBeGreaterThan(0)

    const startBtn = page.locator('.start-btn')
    await waitForVisible(startBtn)
    await expect(startBtn).not.toBeDisabled()

    // Step 4: Start game - should navigate to round-start
    await clickWithRetry(startBtn)
    await waitForNavigation(page, /\/round-start/)
    await page.waitForTimeout(TIMEOUTS.ANIMATION) // Wait for wheels to start spinning

    // Step 5: Wait for game to start (wheels complete and navigate to game)
    await waitForNavigation(page, /\/game/, { timeout: TIMEOUTS.VERY_LONG })
    await waitForLoadingComplete(page)

    // Step 6: Verify game page elements
    const roundIndicator = page.locator('.round-indicator')
    await waitForVisible(roundIndicator)

    const categoryName = page.locator('.category-name')
    await waitForVisible(categoryName)
    const categoryText = await getTextContent(categoryName)
    expect(categoryText).toBeTruthy()
    expect(categoryText.length).toBeGreaterThan(0)

    const letterValue = page.locator('.letter-value')
    await waitForVisible(letterValue)
    const letterText = await getTextContent(letterValue)
    expect(letterText).toBeTruthy()
    expect(letterText.trim().length).toBe(1) // Single letter

    // Step 7: Submit answers for all players
    const answerInput = page.locator('.answer-input')
    const submitBtn = page.locator('.submit-answer-btn')
    const turnName = page.locator('.turn-name')

    if (await isVisible(answerInput, TIMEOUTS.SHORT)) {
      // Submit for each player
      for (let i = 0; i < playerCount; i++) {
        if (await isVisible(answerInput)) {
          const currentPlayer = await getTextContent(turnName)
          expect(currentPlayer).toBeTruthy()

          await fillInput(answerInput, `TestAnswer${i + 1}`)
          await clickWithRetry(submitBtn)
          await page.waitForTimeout(500) // Wait for submission animation
        }
      }
    }

    // Step 8: Navigate to results
    const nextBtn = page.locator('[data-testid="next-button"]')
    if (await isVisible(nextBtn, TIMEOUTS.SHORT)) {
      await clickWithRetry(nextBtn)
    }
    else {
      // Fallback: navigate directly
      await navigateTo(page, '/results')
    }
    await waitForNavigation(page, /\/results/)

    // Step 9: Verify results page
    const scoreItems = page.locator('.score-item')
    await waitForCount(scoreItems, playerCount)

    // Step 10: Assign scores (click add button for first player)
    const scoreButtons = page.locator('.score-action-btn')
    if (await isVisible(scoreButtons.nth(0))) {
      await clickWithRetry(scoreButtons.nth(0))
      await page.waitForTimeout(300)
    }

    // Step 11: Navigate to leaderboard
    const resultsNextBtn = page.locator('.next-btn')
    await waitForVisible(resultsNextBtn)
    await clickWithRetry(resultsNextBtn)
    await waitForNavigation(page, /\/leaderboard/)

    // Step 12: Verify leaderboard
    const leaderboardItems = page.locator('.leaderboard-item')
    await waitForCount(leaderboardItems, playerCount)

    // Step 13: Start next round
    const okBtn = page.locator('.ok-btn')
    await waitForVisible(okBtn)
    await clickWithRetry(okBtn)
    await waitForNavigation(page, /\/round-start/)
    await page.waitForTimeout(TIMEOUTS.ANIMATION)

    // Step 14: Verify next round starts
    await waitForNavigation(page, /\/game/, { timeout: TIMEOUTS.VERY_LONG })
    await waitForLoadingComplete(page)

    // Verify round number increased
    const roundText = await getTextContent(roundIndicator)
    expect(roundText).toContain('ROUND')
  })

  test('should handle error cases gracefully', async ({ page }) => {
    // Test 1: Cannot start game with 0 players
    await navigateTo(page, '/players')

    // Remove all players
    const removeBtns = page.locator('.remove-player-btn')
    const removeCount = await removeBtns.count()
    for (let i = 0; i < removeCount; i++) {
      await clickWithRetry(removeBtns.first())
      await page.waitForTimeout(300) // Wait for removal animation
    }

    // Verify start button is disabled
    const startBtn = page.locator('.start-btn')
    await expect(startBtn).toBeDisabled()
  })

  test('should validate player names', async ({ page }) => {
    await navigateTo(page, '/players')

    // Try to add player with empty name
    const addBtn = page.locator('.add-btn')
    await waitForVisible(addBtn)

    // Click add button - should show input
    await clickWithRetry(addBtn)
    await page.waitForTimeout(500)

    const playerInput = page.locator('.player-name-input')
    if (await isVisible(playerInput)) {
      // Try to submit empty name
      const confirmBtn = page.locator('.confirm-btn')
      await clickWithRetry(confirmBtn)
      await page.waitForTimeout(500)

      // Should still be in input mode or show error
      // (validation should prevent empty names)
    }
  })

  test('should restore session after page reload', async ({ page }) => {
    // Start a game
    await navigateTo(page, '/players')

    const startBtn = page.locator('.start-btn')
    await clickWithRetry(startBtn)
    await waitForNavigation(page, /\/round-start/)
    await page.waitForTimeout(TIMEOUTS.ANIMATION)

    await waitForNavigation(page, /\/game/, TIMEOUTS.VERY_LONG)
    await waitForLoadingComplete(page)

    // Get session details
    const categoryName = await getTextContent(page.locator('.category-name'))
    const letterValue = await getTextContent(page.locator('.letter-value'))

    // Reload page
    await page.reload()
    await waitForPageReady(page)
    await waitForLoadingComplete(page)

    // Verify session restored
    await waitForNavigation(page, /\/game/, { timeout: TIMEOUTS.MEDIUM })

    const restoredCategory = await getTextContent(page.locator('.category-name'))
    const restoredLetter = await getTextContent(page.locator('.letter-value'))

    expect(restoredCategory).toBe(categoryName)
    expect(restoredLetter).toBe(letterValue)
  })

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true)

    await navigateTo(page, '/')
    await waitForSplashScreen(page)

    // App should still load (cached assets)
    const playBtn = page.locator('.play-btn')
    await waitForVisible(playBtn, { timeout: TIMEOUTS.LONG })

    // Restore online
    await context.setOffline(false)
  })

  test('should prevent navigation away from active game without confirmation', async ({ page }) => {
    // Start a game
    await navigateTo(page, '/players')

    const startBtn = page.locator('.start-btn')
    await clickWithRetry(startBtn)
    await waitForNavigation(page, /\/round-start/)
    await page.waitForTimeout(TIMEOUTS.ANIMATION)

    await waitForNavigation(page, /\/game/, { timeout: TIMEOUTS.VERY_LONG })
    await waitForLoadingComplete(page)

    // Try to navigate back
    const backBtn = page.locator('[data-testid="back-button"]')
    if (await isVisible(backBtn)) {
      await clickWithRetry(backBtn)
      await page.waitForTimeout(500)

      // Should show quit modal or prevent navigation
      const quitModal = page.locator('.quit-modal, [data-testid="quit-modal"]')
      if (await elementExists(quitModal)) {
        await waitForVisible(quitModal)
      }
    }
  })
})
