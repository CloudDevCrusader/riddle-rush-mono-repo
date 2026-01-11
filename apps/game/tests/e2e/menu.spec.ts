import { test, expect } from '@playwright/test'

test.describe('Main Menu Page', () => {
  test.beforeEach(async ({ page }) => {
    // Use full URL to avoid baseURL issues
    await page.goto('http://localhost:3000/', { timeout: 30000 })
    await page.waitForLoadState('networkidle', { timeout: 30000 })

    // Wait for client-side JavaScript to be ready
    await page.waitForFunction(() => window.__NUXT__ !== undefined, { timeout: 30000 })

    // Wait for splash screen animation to complete
    await page.waitForTimeout(2000) // Splash screen fade-out duration

    // Alternative: Wait for splash screen to be hidden
    const splashScreen = page.locator('.splash-screen')
    try {
      await splashScreen.waitFor({ state: 'hidden', timeout: 10000 })
    } catch {
      // Splash screen might already be gone, ignore error
      console.warn('Splash screen already hidden or not found')
    }
  })

  test('should display main menu with all elements', async ({ page }) => {
    // Check for background
    const background = page.locator('.page-bg')
    await expect(background).toBeVisible({ timeout: 10000 })

    // Check for logo (use first() to handle splash + menu logos)
    const logo = page.locator('.logo-image').first()
    await expect(logo).toBeVisible({ timeout: 10000 })

    // Coin bar, profile button, exit button, and menu icon intentionally hidden for MVP mobile optimization

    // Check for menu buttons
    const playBtn = page.locator('.play-btn')
    const optionsBtn = page.locator('.options-btn')
    const creditsBtn = page.locator('.credits-btn')

    await expect(playBtn).toBeVisible({ timeout: 10000 })
    await expect(optionsBtn).toBeVisible({ timeout: 10000 })
    await expect(creditsBtn).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to players page when clicking PLAY', async ({ page }) => {
    const playBtn = page.locator('.play-btn')
    await playBtn.click()

    await expect(page).toHaveURL(/\/players/)
    await page.waitForTimeout(500) // Wait for page transition
  })

  test('should navigate to settings when clicking OPTIONS', async ({ page }) => {
    const optionsBtn = page.locator('.options-btn')
    await optionsBtn.click()

    await expect(page).toHaveURL(/\/settings/)
  })

  test('should navigate to credits when clicking CREDITS', async ({ page }) => {
    const creditsBtn = page.locator('.credits-btn')
    await creditsBtn.click()

    await expect(page).toHaveURL(/\/credits/)
  })

  test.skip('should navigate to profile when clicking profile icon', async ({ page }) => {
    // Profile button intentionally hidden for MVP mobile optimization
    const profileBtn = page.locator('.profile-btn')
    await profileBtn.click()

    await expect(page).toHaveURL(/\/profile/)
  })

  test.skip('should show coin amount', async ({ page }) => {
    // Coin amount intentionally hidden for MVP mobile optimization
    const coinAmount = page.locator('.coin-amount')
    await expect(coinAmount).toBeVisible()
    await expect(coinAmount).toHaveText(/\d+/)
  })

  test('should have hover effects on buttons', async ({ page }) => {
    const playBtn = page.locator('.play-btn')

    // Hover over button
    await playBtn.hover()
    await page.waitForTimeout(500)

    // Button should have hover state (image-hover should be visible)
    const hoverImage = playBtn.locator('.btn-image-hover')
    await expect(hoverImage).toBeVisible()
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const logo = page.locator('.logo-image').first()
    const playBtn = page.locator('.play-btn')

    await expect(logo).toBeVisible()
    await expect(playBtn).toBeVisible()
  })
})
