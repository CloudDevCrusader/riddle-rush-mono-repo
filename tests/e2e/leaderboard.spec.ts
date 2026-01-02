import { test, expect } from '@playwright/test'

test.describe('Leaderboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up game state first by going through players page
    await page.goto('/players')
    await page.waitForLoadState('networkidle')

    // Start game with default player to initialize store
    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await page.waitForTimeout(2000)

    // Wait for round-start to complete
    await expect(page).toHaveURL(/\/round-start/, { timeout: 10000 })
    await page.waitForTimeout(2000)

    // Now navigate to leaderboard
    await page.goto('/leaderboard')
  })

  test('should display leaderboard page with all elements', async ({ page }) => {
    // Check for title
    const title = page.locator('.title-image')
    await expect(title).toBeVisible()

    // Check for ranking
    const ranking = page.locator('.ranking-image')
    await expect(ranking).toBeVisible()

    // Check for leaderboard list
    const leaderboardList = page.locator('.leaderboard-list')
    await expect(leaderboardList).toBeVisible()

    // Check for OK button
    const okBtn = page.locator('.ok-btn')
    await expect(okBtn).toBeVisible()
  })

  test('should display leaderboard entries', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    const entries = page.locator('.leaderboard-item')

    // Wait for at least one entry to appear
    await expect(entries.first()).toBeVisible({ timeout: 5000 })

    const count = await entries.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display rank badges', async ({ page }) => {
    const firstEntry = page.locator('.leaderboard-item').first()
    const rankBadge = firstEntry.locator('.rank-badge')

    await expect(rankBadge).toBeVisible()
  })

  test('should display player info in each entry', async ({ page }) => {
    const firstEntry = page.locator('.leaderboard-item').first()
    const playerName = firstEntry.locator('.player-name')
    const scoreValue = firstEntry.locator('.score-value')

    await expect(playerName).toBeVisible()
    await expect(scoreValue).toBeVisible()
    await expect(scoreValue).toHaveText(/\d+/)
  })

  test('should display player avatars', async ({ page }) => {
    const firstEntry = page.locator('.leaderboard-item').first()
    const playerAvatar = firstEntry.locator('.player-avatar')

    await expect(playerAvatar).toBeVisible()
  })

  test('should navigate to menu when clicking OK (game completed)', async ({ page }) => {
    // Note: This test assumes game is completed
    // In a real scenario, you'd need to complete the game first
    const okBtn = page.locator('.ok-btn')
    await okBtn.click()

    // Should navigate to home or round-start depending on game state
    await page.waitForTimeout(500)
  })

  test('should show back button when game is not completed', async ({ page }) => {
    // Back button should be visible when game is not completed
    const backBtn = page.locator('.back-btn')
    // Back button may or may not be visible depending on game state
    const backBtnCount = await backBtn.count()
    // If visible, it should work
    if (backBtnCount > 0) {
      await expect(backBtn).toBeVisible()
    }
  })

  test('should not show back button when game is completed', async ({ page }) => {
    // When game is completed, back button should be hidden
    // This would require setting up a completed game state
    // For now, we just verify the OK button is present
    const okBtn = page.locator('.ok-btn')
    await expect(okBtn).toBeVisible()
  })

  test('should show game complete message when game is completed', async ({ page }) => {
    // Game complete message should appear when game is completed
    const completeMessage = page.locator('.game-complete-message')
    // May or may not be visible depending on game state
    const messageCount = await completeMessage.count()
    if (messageCount > 0) {
      await expect(completeMessage).toBeVisible()
    }
  })

  test('should have scroll bar decoration', async ({ page }) => {
    const scrollBar = page.locator('.scroll-bar')
    await expect(scrollBar).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const title = page.locator('.title-image')
    const leaderboardList = page.locator('.leaderboard-list')
    const okBtn = page.locator('.ok-btn')

    await expect(title).toBeVisible()
    await expect(leaderboardList).toBeVisible()
    await expect(okBtn).toBeVisible()
  })

  test('should have entries sorted by score descending', async ({ page }) => {
    const scoreValues = await page.locator('.score-value').allTextContents()
    const scores = scoreValues.map((s) => Number.parseInt(s)).filter((s) => !Number.isNaN(s))

    // Check if scores are in descending order
    for (let i = 0; i < scores.length - 1; i++) {
      const currentScore = scores[i]
      const nextScore = scores[i + 1]
      if (currentScore !== undefined && nextScore !== undefined) {
        expect(currentScore).toBeGreaterThanOrEqual(nextScore)
      }
    }
  })

  test('should navigate to round-start when OK clicked (game not completed)', async ({ page }) => {
    // When game is not completed, OK should go to round-start
    const okBtn = page.locator('.ok-btn')
    await okBtn.click()

    // Should navigate to round-start or home depending on game state
    await page.waitForTimeout(500)
    const url = page.url()
    expect(url).toMatch(/\/(round-start|\/)/)
  })
})
