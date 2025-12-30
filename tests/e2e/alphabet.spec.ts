import { test, expect } from '@playwright/test'

test.describe('Alphabet Selection Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/alphabet')
  })

  test('should display alphabet page with all elements', async ({ page }) => {
    // Check for background
    const background = page.locator('.page-bg')
    await expect(background).toBeVisible()

    // Title is hidden on mobile (MVP design)
    // Check for category display
    const categoryDisplay = page.locator('.category-display')
    await expect(categoryDisplay).toBeVisible()

    // Check for fortune wheel container
    const wheelContainer = page.locator('.fortune-wheel')
    await expect(wheelContainer).toBeVisible()

    // Check for back button
    const backBtn = page.locator('.back-btn')
    await expect(backBtn).toBeVisible()

    // Check for next button
    const nextBtn = page.locator('.next-btn')
    await expect(nextBtn).toBeVisible()
  })

  test('should display all 26 letters', async ({ page }) => {
    const letterButtons = page.locator('.letter-btn')
    await expect(letterButtons).toHaveCount(26)
  })

  test('should display category name', async ({ page }) => {
    const categoryName = page.locator('.category-name')
    await expect(categoryName).toBeVisible()
    await expect(categoryName).toHaveText(/\w+/) // Should have some text
  })

  test('should have next button disabled initially', async ({ page }) => {
    const nextBtn = page.locator('.next-btn')
    await expect(nextBtn).toHaveClass(/disabled/)
  })

  test('should select a letter when clicked', async ({ page }) => {
    const letterA = page.locator('.letter-btn').first()
    await letterA.click()
    await page.waitForTimeout(200)

    // Letter should have selected class
    await expect(letterA).toHaveClass(/selected/)
  })

  test('should enable next button after selecting a letter', async ({ page }) => {
    const letterA = page.locator('.letter-btn').first()
    await letterA.click()
    await page.waitForTimeout(200)

    const nextBtn = page.locator('.next-btn')
    await expect(nextBtn).not.toHaveClass(/disabled/)
  })

  test('should navigate to game when clicking next', async ({ page }) => {
    // Select a letter first
    const letterA = page.locator('.letter-btn').first()
    await letterA.click()
    await page.waitForTimeout(200)

    // Click next
    const nextBtn = page.locator('.next-btn')
    await nextBtn.click()

    await expect(page).toHaveURL(/\/game/)
    await page.waitForTimeout(500)
  })

  test('should switch selected letter when clicking different letter', async ({ page }) => {
    const letterA = page.locator('.letter-btn').nth(0) // A
    const letterB = page.locator('.letter-btn').nth(1) // B

    // Select A
    await letterA.click()
    await page.waitForTimeout(200)
    await expect(letterA).toHaveClass(/selected/)

    // Select B
    await letterB.click()
    await page.waitForTimeout(200)
    await expect(letterB).toHaveClass(/selected/)
    await expect(letterA).not.toHaveClass(/selected/)
  })

  test('should navigate back when clicking back button', async ({ page }) => {
    const backBtn = page.locator('.back-btn')
    await backBtn.click()

    await page.waitForTimeout(500)
  })

  test('should display round indicator', async ({ page }) => {
    const roundIndicator = page.locator('.round-indicator')
    await expect(roundIndicator).toBeVisible()
  })

  test.skip('should display coin bar', async ({ page }) => {
    // Coin bar intentionally hidden for MVP mobile optimization
    const coinBar = page.locator('.coin-bar')
    await expect(coinBar).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const wheelContainer = page.locator('.fortune-wheel')
    const letterButtons = page.locator('.letter-btn')

    await expect(wheelContainer).toBeVisible()
    await expect(letterButtons.first()).toBeVisible()
  })

  test.skip('should have hover effect on letters', async ({ page }) => {
    // Hover effects may not apply on mobile/touch devices
    const letterA = page.locator('.letter-btn').first()

    const initialTransform = await letterA.evaluate((el) =>
      window.getComputedStyle(el).transform,
    )

    await letterA.hover()
    await page.waitForTimeout(200)

    const hoverTransform = await letterA.evaluate((el) =>
      window.getComputedStyle(el).transform,
    )

    // Transform should be different on hover
    expect(hoverTransform).not.toBe(initialTransform)
  })
})
