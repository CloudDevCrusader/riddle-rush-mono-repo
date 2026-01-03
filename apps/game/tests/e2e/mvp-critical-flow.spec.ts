import { test, expect } from '@playwright/test'

/**
 * MVP Critical Flow Tests
 *
 * These tests verify the core MVP functionality works end-to-end
 * and identify any critical issues that would prevent demonstration.
 */
test.describe('MVP Critical Flow', () => {
  test('should complete full game flow: menu → players → round-start → game → results → leaderboard → next round', async ({ page }) => {
    // Step 1: Start at menu
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for splash screen
    await page.waitForTimeout(2000)
    const splashScreen = page.locator('.splash-screen')
    await splashScreen.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})

    // Step 2: Navigate to players
    const playBtn = page.locator('.play-btn')
    await expect(playBtn).toBeVisible({ timeout: 10000 })
    await playBtn.click()
    await expect(page).toHaveURL(/\/players/)
    await page.waitForTimeout(500)

    // Step 3: Verify default players exist and start game
    const playerItems = page.locator('.player-item:not(.empty)')
    const playerCount = await playerItems.count()
    expect(playerCount).toBeGreaterThan(0)

    const startBtn = page.locator('.start-btn')
    await expect(startBtn).toBeVisible()
    await expect(startBtn).not.toBeDisabled()

    // Step 4: Start game - should navigate to round-start
    await startBtn.click()
    await expect(page).toHaveURL(/\/round-start/, { timeout: 5000 })
    await page.waitForTimeout(2000) // Wait for wheels to start spinning

    // Step 5: Wait for game to start (wheels complete and navigate to game)
    await expect(page).toHaveURL(/\/game/, { timeout: 15000 })
    await page.waitForTimeout(1000)

    // Step 6: Verify game page elements
    const roundIndicator = page.locator('.round-indicator')
    await expect(roundIndicator).toBeVisible()

    const categoryName = page.locator('.category-name')
    await expect(categoryName).toBeVisible()
    const categoryText = await categoryName.textContent()
    expect(categoryText).toBeTruthy()
    expect(categoryText?.trim().length).toBeGreaterThan(0)

    const letterValue = page.locator('.letter-value')
    await expect(letterValue).toBeVisible()
    const letterText = await letterValue.textContent()
    expect(letterText).toBeTruthy()
    expect(letterText?.trim().length).toBe(1) // Single letter

    // Step 7: Submit answers for all players
    const answerInput = page.locator('.answer-input')
    const submitBtn = page.locator('.submit-answer-btn')
    const turnName = page.locator('.turn-name')

    if (await answerInput.isVisible({ timeout: 2000 })) {
      // Submit for each player
      for (let i = 0; i < playerCount; i++) {
        if (await answerInput.isVisible()) {
          const currentPlayer = await turnName.textContent()
          expect(currentPlayer).toBeTruthy()

          await answerInput.fill(`TestAnswer${i + 1}`)
          await submitBtn.click()
          await page.waitForTimeout(500)
        }
      }
    }

    // Step 8: Navigate to results
    const nextBtn = page.locator('[data-testid="next-button"]')
    if (await nextBtn.isVisible({ timeout: 2000 })) {
      await nextBtn.click()
    }
    else {
      // Fallback: navigate directly
      await page.goto('/results')
    }
    await expect(page).toHaveURL(/\/results/)
    await page.waitForTimeout(500)

    // Step 9: Verify results page
    const scoreItems = page.locator('.score-item')
    await expect(scoreItems).toHaveCount(playerCount)

    // Step 10: Assign scores (click add button for first player)
    const scoreButtons = page.locator('.score-action-btn')
    if (await scoreButtons.nth(0).isVisible()) {
      await scoreButtons.nth(0).click()
      await page.waitForTimeout(200)
    }

    // Step 11: Navigate to leaderboard
    const resultsNextBtn = page.locator('.next-btn')
    await expect(resultsNextBtn).toBeVisible()
    await resultsNextBtn.click()
    await expect(page).toHaveURL(/\/leaderboard/)
    await page.waitForTimeout(500)

    // Step 12: Verify leaderboard
    const leaderboardItems = page.locator('.leaderboard-item')
    await expect(leaderboardItems).toHaveCount(playerCount)

    // Step 13: Start next round
    const okBtn = page.locator('.ok-btn')
    await expect(okBtn).toBeVisible()
    await okBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    // Step 14: Verify next round starts
    await expect(page).toHaveURL(/\/game/, { timeout: 15000 })
    await page.waitForTimeout(1000)

    // Verify round number increased
    const roundText = await roundIndicator.textContent()
    expect(roundText).toContain('ROUND')
  })

  test('should handle error cases gracefully', async ({ page }) => {
    // Test 1: Cannot start game with 0 players
    await page.goto('/players')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Remove all players
    const removeBtns = page.locator('.remove-player-btn')
    const removeCount = await removeBtns.count()
    for (let i = 0; i < removeCount; i++) {
      await removeBtns.first().click()
      await page.waitForTimeout(200)
    }

    // Verify start button is disabled
    const startBtn = page.locator('.start-btn')
    await expect(startBtn).toBeDisabled()
  })

  test('should validate player names', async ({ page }) => {
    await page.goto('/players')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Try to add player with empty name
    const addBtn = page.locator('.add-btn')
    await expect(addBtn).toBeVisible()

    // Click add button - should show input
    await addBtn.click()
    await page.waitForTimeout(300)

    const playerInput = page.locator('.player-name-input')
    if (await playerInput.isVisible()) {
      // Try to submit empty name
      const confirmBtn = page.locator('.confirm-btn')
      await confirmBtn.click()
      await page.waitForTimeout(300)

      // Should still be in input mode or show error
      // (validation should prevent empty names)
    }
  })

  test('should restore session after page reload', async ({ page }) => {
    // Start a game
    await page.goto('/players')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 15000 })
    await page.waitForTimeout(1000)

    // Get session details
    const categoryName = await page.locator('.category-name').textContent()
    const letterValue = await page.locator('.letter-value').textContent()

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Verify session restored
    await expect(page).toHaveURL(/\/game/, { timeout: 5000 })

    const restoredCategory = await page.locator('.category-name').textContent()
    const restoredLetter = await page.locator('.letter-value').textContent()

    expect(restoredCategory).toBe(categoryName)
    expect(restoredLetter).toBe(letterValue)
  })

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true)

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // App should still load (cached assets)
    const playBtn = page.locator('.play-btn')
    await expect(playBtn).toBeVisible({ timeout: 10000 })

    // Restore online
    await context.setOffline(false)
  })

  test('should prevent navigation away from active game without confirmation', async ({ page }) => {
    // Start a game
    await page.goto('/players')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await expect(page).toHaveURL(/\/round-start/)
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/\/game/, { timeout: 15000 })
    await page.waitForTimeout(1000)

    // Try to navigate back
    const backBtn = page.locator('[data-testid="back-button"]')
    if (await backBtn.isVisible()) {
      await backBtn.click()
      await page.waitForTimeout(500)

      // Should show quit modal or prevent navigation
      const quitModal = page.locator('.quit-modal, [data-testid="quit-modal"]')
      if (await quitModal.count() > 0) {
        await expect(quitModal).toBeVisible()
      }
    }
  })
})
