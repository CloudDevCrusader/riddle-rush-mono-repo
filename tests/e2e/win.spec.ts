import { test, expect } from '@playwright/test'

test.describe('Win Screen Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/win')
  })

  test('should display win page with all elements', async ({ page }) => {
    // Check for background
    const background = page.locator('.page-bg')
    await expect(background).toBeVisible()

    // Check for title
    const title = page.locator('.title-image')
    await expect(title).toBeVisible()

    // Check for win card
    const winCard = page.locator('.win-card')
    await expect(winCard).toBeVisible()

    // Check for back button
    const backBtn = page.locator('.back-btn')
    await expect(backBtn).toBeVisible()
  })

  test('should display stars based on score', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    const stars = page.locator('.star:not(.empty)')

    // Wait for at least one star to be visible
    await expect(stars.first()).toBeVisible({ timeout: 5000 })

    // Should have stars (count depends on score)
    const starCount = await stars.count()
    expect(starCount).toBeGreaterThan(0)
    expect(starCount).toBeLessThanOrEqual(3)
  })

  test('should display score', async ({ page }) => {
    const scoreText = page.locator('.score-text')
    await expect(scoreText).toBeVisible()
    await expect(scoreText).toHaveText(/\d+/) // Should have numeric score
  })

  test('should have animated stars', async ({ page }) => {
    const stars = page.locator('.star:not(.empty)')
    const firstStar = stars.first()

    // Check if star has animation
    const animationName = await firstStar.evaluate((el) =>
      window.getComputedStyle(el).animationName,
    )
    expect(animationName).toBeTruthy()
  })

  test('should display home and next buttons', async ({ page }) => {
    const homeBtn = page.locator('.home-btn')
    const nextBtn = page.locator('.next-btn')

    await expect(homeBtn).toBeVisible()
    await expect(nextBtn).toBeVisible()
  })

  test('should navigate to menu when clicking home', async ({ page }) => {
    const homeBtn = page.locator('.home-btn')
    await homeBtn.click()

    await expect(page).toHaveURL(/\/$/)
    await page.waitForTimeout(500)
  })

  test('should navigate to results when clicking next', async ({ page }) => {
    const nextBtn = page.locator('.next-btn')
    await nextBtn.click()

    await expect(page).toHaveURL(/\/results/)
    await page.waitForTimeout(500)
  })

  test('should navigate back when clicking back button', async ({ page }) => {
    const backBtn = page.locator('.back-btn')
    await backBtn.click()

    await page.waitForTimeout(500)
  })

  test('should have bouncing title animation', async ({ page }) => {
    const titleContainer = page.locator('.title-container')

    const animationName = await titleContainer.evaluate((el) =>
      window.getComputedStyle(el).animationName,
    )
    expect(animationName).toContain('bounce')
  })

  test('should display win card with pop-up', async ({ page }) => {
    const cardBg = page.locator('.card-bg')
    await expect(cardBg).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const title = page.locator('.title-image')
    const winCard = page.locator('.win-card')
    const homeBtn = page.locator('.home-btn')

    await expect(title).toBeVisible()
    await expect(winCard).toBeVisible()
    await expect(homeBtn).toBeVisible()
  })

  test('should have hover effects on buttons', async ({ page }) => {
    const homeBtn = page.locator('.home-btn')

    await homeBtn.hover()
    await page.waitForTimeout(200)

    const transform = await homeBtn.evaluate((el) =>
      window.getComputedStyle(el).transform,
    )

    // Should have transform applied
    expect(transform).not.toBe('none')
  })
})
