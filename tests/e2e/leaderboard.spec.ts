import { test, expect } from '@playwright/test'

test.describe('Leaderboard Page', () => {
  test.beforeEach(async ({ page }) => {
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

    // Check for back button
    const backBtn = page.locator('.back-btn')
    await expect(backBtn).toBeVisible()

    // Check for OK button
    const okBtn = page.locator('.ok-btn')
    await expect(okBtn).toBeVisible()
  })

  test('should display leaderboard entries', async ({ page }) => {
    const entries = page.locator('.leaderboard-item')
    const count = await entries.count()

    expect(count).toBeGreaterThan(0)
  })

  test('should display rank badges', async ({ page }) => {
    const firstEntry = page.locator('.leaderboard-item').first()
    const rankBadge = firstEntry.locator('.rank-badge')

    await expect(rankBadge).toBeVisible()
  })

  test('should have special styling for top 3', async ({ page }) => {
    const rank1 = page.locator('.leaderboard-item.rank-1')
    const rank2 = page.locator('.leaderboard-item.rank-2')
    const rank3 = page.locator('.leaderboard-item.rank-3')

    // Top 3 should exist
    if (await rank1.count() > 0) {
      await expect(rank1).toHaveCSS('background', /gradient/)
    }
    if (await rank2.count() > 0) {
      await expect(rank2).toHaveCSS('background', /gradient/)
    }
    if (await rank3.count() > 0) {
      await expect(rank3).toHaveCSS('background', /gradient/)
    }
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

  test('should display coin bar', async ({ page }) => {
    const coinBar = page.locator('.coin-bar')
    await expect(coinBar).toBeVisible()
  })

  test('should navigate to menu when clicking OK', async ({ page }) => {
    const okBtn = page.locator('.ok-btn')
    await okBtn.click()

    await expect(page).toHaveURL(/\/menu/)
    await page.waitForTimeout(500)
  })

  test('should navigate back when clicking back button', async ({ page }) => {
    const backBtn = page.locator('.back-btn')
    await backBtn.click()

    await page.waitForTimeout(500)
  })

  test('should have scroll bar decoration', async ({ page }) => {
    const scrollBar = page.locator('.scroll-bar')
    await expect(scrollBar).toBeVisible()
  })

  test('should have hover effect on entries', async ({ page }) => {
    const firstEntry = page.locator('.leaderboard-item').first()

    const initialTransform = await firstEntry.evaluate(el =>
      window.getComputedStyle(el).transform
    )

    await firstEntry.hover()
    await page.waitForTimeout(200)

    const hoverTransform = await firstEntry.evaluate(el =>
      window.getComputedStyle(el).transform
    )

    // Transform should be different on hover (translateX)
    expect(hoverTransform).not.toBe(initialTransform)
  })

  test('should display decorative layer', async ({ page }) => {
    const decorativeLayer = page.locator('.decorative-layer')
    await expect(decorativeLayer).toBeVisible()
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
    const scores = scoreValues.map(s => parseInt(s))

    // Check if scores are in descending order
    for (let i = 0; i < scores.length - 1; i++) {
      const currentScore = scores[i]
      const nextScore = scores[i + 1]
      if (currentScore !== undefined && nextScore !== undefined) {
        expect(currentScore).toBeGreaterThanOrEqual(nextScore)
      }
    }
  })
})
