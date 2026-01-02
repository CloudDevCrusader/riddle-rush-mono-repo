import { test, expect } from '@playwright/test'

test.describe('Results/Scoring Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up game state first by going through players page
    await page.goto('/players')
    await page.waitForLoadState('networkidle')

    // Start game with default player to initialize store
    const startBtn = page.locator('.start-btn')
    await startBtn.click()
    await page.waitForTimeout(500)

    // Now navigate to results
    await page.goto('/results')
  })

  test('should display results page with all elements', async ({ page }) => {
    // Check for background
    const background = page.locator('.page-bg')
    await expect(background).toBeVisible()

    // Check for title
    const title = page.locator('.title-image')
    await expect(title).toBeVisible()

    // Check for scores list
    const scoresList = page.locator('.scores-list')
    await expect(scoresList).toBeVisible()

    // Check for back button
    const backBtn = page.locator('.back-btn')
    await expect(backBtn).toBeVisible()

    // Check for action buttons
    const backLargeBtn = page.locator('.back-large-btn')
    const nextBtn = page.locator('.next-btn')

    await expect(backLargeBtn).toBeVisible()
    await expect(nextBtn).toBeVisible()
  })

  test.skip('should display player score items', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    const scoreItems = page.locator('.score-item')

    // Wait for at least one score item to appear
    await expect(scoreItems.first()).toBeVisible({ timeout: 5000 })

    const count = await scoreItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test.skip('should display player info in each score item', async ({ page }) => {
    const firstItem = page.locator('.score-item').first()
    const playerAvatar = firstItem.locator('.player-avatar')
    const playerName = firstItem.locator('.player-name')
    const playerScore = firstItem.locator('.player-score')

    await expect(playerAvatar).toBeVisible()
    await expect(playerName).toBeVisible()
    await expect(playerScore).toBeVisible()
    await expect(playerScore).toHaveText(/\d+/)
  })

  test.skip('should display add and minus buttons for each player', async ({ page }) => {
    const firstItem = page.locator('.score-item').first()
    const scoreActions = firstItem.locator('.score-actions')
    const actionButtons = scoreActions.locator('.score-action-btn')

    await expect(actionButtons).toHaveCount(2)
  })

  test.skip('should increase score when clicking add button', async ({ page }) => {
    const firstItem = page.locator('.score-item').first()
    const playerScore = firstItem.locator('.player-score')
    const addBtn = firstItem.locator('.score-action-btn').first()

    const initialScore = Number.parseInt(await playerScore.textContent() || '0')
    await addBtn.click()
    await page.waitForTimeout(200)

    const newScore = Number.parseInt(await playerScore.textContent() || '0')
    expect(newScore).toBeGreaterThan(initialScore)
  })

  test.skip('should decrease score when clicking minus button', async ({ page }) => {
    const firstItem = page.locator('.score-item').first()
    const playerScore = firstItem.locator('.player-score')
    const minusBtn = firstItem.locator('.score-action-btn').nth(1)

    const initialScore = Number.parseInt(await playerScore.textContent() || '0')

    if (initialScore > 0) {
      await minusBtn.click()
      await page.waitForTimeout(200)

      const newScore = Number.parseInt(await playerScore.textContent() || '0')
      expect(newScore).toBeLessThan(initialScore)
    }
  })

  test('should navigate to leaderboard when clicking next', async ({ page }) => {
    const nextBtn = page.locator('.next-btn')
    await nextBtn.click()

    await expect(page).toHaveURL(/\/leaderboard/)
    await page.waitForTimeout(500)
  })

  test('should navigate to game when clicking back large button', async ({ page }) => {
    const backLargeBtn = page.locator('.back-large-btn')
    await backLargeBtn.click()

    await expect(page).toHaveURL(/\/game/)
    await page.waitForTimeout(500)
  })

  test('should navigate back when clicking back button', async ({ page }) => {
    const backBtn = page.locator('.back-btn')
    await backBtn.click()

    await page.waitForTimeout(500)
  })

  test('should display scroll bar decoration', async ({ page }) => {
    const scrollBar = page.locator('.scroll-bar')
    await expect(scrollBar).toBeVisible()
  })

  test('should have scrollable scores list', async ({ page }) => {
    const scoresList = page.locator('.scores-list')

    // Check if the list is scrollable (overflow-y: auto)
    const overflowY = await scoresList.evaluate(el =>
      window.getComputedStyle(el).overflowY,
    )
    expect(overflowY).toBe('auto')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const title = page.locator('.title-image')
    const scoresList = page.locator('.scores-list')
    const nextBtn = page.locator('.next-btn')

    await expect(title).toBeVisible()
    await expect(scoresList).toBeVisible()
    await expect(nextBtn).toBeVisible()
  })

  test('should have hover effects on action buttons', async ({ page }) => {
    const nextBtn = page.locator('.next-btn')

    await nextBtn.hover()
    await page.waitForTimeout(200)

    const transform = await nextBtn.evaluate(el =>
      window.getComputedStyle(el).transform,
    )

    // Should have transform applied
    expect(transform).not.toBe('none')
  })

  test.skip('should have hover effects on score action buttons', async ({ page }) => {
    const firstItem = page.locator('.score-item').first()
    const addBtn = firstItem.locator('.score-action-btn').first()

    await addBtn.hover()
    await page.waitForTimeout(200)

    const transform = await addBtn.evaluate(el =>
      window.getComputedStyle(el).transform,
    )

    // Should have transform applied
    expect(transform).not.toBe('none')
  })

  test('should have fade-in animation on title', async ({ page }) => {
    const titleContainer = page.locator('.title-container')

    const animationName = await titleContainer.evaluate(el =>
      window.getComputedStyle(el).animationName,
    )
    expect(animationName).toContain('fadeIn')
  })

  test('should have scale-in animation on scores list', async ({ page }) => {
    const scoresContainer = page.locator('.scores-list-container')

    const animationName = await scoresContainer.evaluate(el =>
      window.getComputedStyle(el).animationName,
    )
    expect(animationName).toContain('scaleIn')
  })

  test('should have slide-up animation on action buttons', async ({ page }) => {
    const actionButtons = page.locator('.action-buttons')

    const animationName = await actionButtons.evaluate(el =>
      window.getComputedStyle(el).animationName,
    )
    expect(animationName).toContain('slideUp')
  })
})
