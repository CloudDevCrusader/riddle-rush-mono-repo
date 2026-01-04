import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForSplashScreen,
  waitForVisible,
  clickWithRetry,
  waitForNavigation,
} from '../utils/e2e-helpers'

test.describe('Main Menu Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/')
    await waitForSplashScreen(page)
    // Wait for menu buttons to be visible (they might be hidden initially)
    await page
      .waitForSelector('.play-btn, .menu-buttons', { state: 'visible', timeout: 10000 })
      .catch(() => {
        // If buttons aren't visible, wait a bit more for animations
      })
    await page.waitForTimeout(1000) // Additional wait for animations to complete
  })

  test('should display main menu with all elements', async ({ page }) => {
    // Check for background
    const background = page.locator('.page-bg')
    await waitForVisible(background)

    // Check for logo (use first() to handle splash + menu logos)
    const logo = page.locator('.logo-image').first()
    await waitForVisible(logo)

    // Coin bar, profile button, exit button, and menu icon intentionally hidden for MVP mobile optimization

    // Check for menu buttons
    const playBtn = page.locator('.play-btn')
    const optionsBtn = page.locator('.options-btn')
    const creditsBtn = page.locator('.credits-btn')

    await waitForVisible(playBtn)
    await waitForVisible(optionsBtn)
    await waitForVisible(creditsBtn)
  })

  test('should navigate to players page when clicking PLAY', async ({ page }) => {
    const playBtn = page.locator('.play-btn')
    await clickWithRetry(playBtn)
    await waitForNavigation(page, /\/players/)
  })

  test('should navigate to settings when clicking OPTIONS', async ({ page }) => {
    const optionsBtn = page.locator('.options-btn')
    await clickWithRetry(optionsBtn)
    await waitForNavigation(page, /\/settings/)
  })

  test('should navigate to credits when clicking CREDITS', async ({ page }) => {
    const creditsBtn = page.locator('.credits-btn')
    await clickWithRetry(creditsBtn)
    await waitForNavigation(page, /\/credits/)
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
    await waitForVisible(playBtn)

    // Hover over button
    await playBtn.hover()
    await page.waitForTimeout(300) // Wait for hover animation

    // Button should have hover state (image-hover should be visible)
    const hoverImage = playBtn.locator('.btn-image-hover')
    await waitForVisible(hoverImage)
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const logo = page.locator('.logo-image').first()
    const playBtn = page.locator('.play-btn')

    await waitForVisible(logo)
    await waitForVisible(playBtn)
  })
})
