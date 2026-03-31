import { test, expect } from '@playwright/test'
import { generatePlayerName } from './helpers/faker'

test.describe('Players Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/players', { timeout: 30000 })
    // Wait for page content to be visible via data-testid
    const startBtn = page.locator('[data-testid="players-start-button"]')
    await expect(startBtn).toBeVisible({ timeout: 15000 })
  })

  test('should display players page with all core elements', async ({ page }) => {
    // Back button
    const backBtn = page.locator('[data-testid="players-back-button"]')
    await expect(backBtn).toBeVisible()

    // Stepper controls
    const decreaseBtn = page.locator('[data-testid="players-decrease-button"]')
    const increaseBtn = page.locator('[data-testid="players-increase-button"]')
    await expect(decreaseBtn).toBeVisible()
    await expect(increaseBtn).toBeVisible()

    // Start button
    const startBtn = page.locator('[data-testid="players-start-button"]')
    await expect(startBtn).toBeVisible()
  })

  test('should display default player count with name inputs', async ({ page }) => {
    // Default is 2 players
    const nameInput0 = page.locator('[data-testid="players-name-input-0"]')
    const nameInput1 = page.locator('[data-testid="players-name-input-1"]')
    await expect(nameInput0).toBeVisible()
    await expect(nameInput1).toBeVisible()
  })

  test('should increase player count when clicking plus button', async ({ page }) => {
    // Default is 2 players — increase to 3
    const increaseBtn = page.locator('[data-testid="players-increase-button"]')
    await increaseBtn.click()
    await page.waitForTimeout(200)

    // Third player input should appear
    const nameInput2 = page.locator('[data-testid="players-name-input-2"]')
    await expect(nameInput2).toBeVisible()
  })

  test('should decrease player count when clicking minus button', async ({ page }) => {
    // Increase to 3 first, then decrease back to 2
    const increaseBtn = page.locator('[data-testid="players-increase-button"]')
    const decreaseBtn = page.locator('[data-testid="players-decrease-button"]')

    await increaseBtn.click()
    await page.waitForTimeout(200)

    // Verify 3 inputs exist
    const nameInput2 = page.locator('[data-testid="players-name-input-2"]')
    await expect(nameInput2).toBeVisible()

    // Decrease back to 2
    await decreaseBtn.click()
    await page.waitForTimeout(200)

    // Third input should be gone
    await expect(nameInput2).not.toBeVisible()
  })

  test('should disable decrease button at minimum player count', async ({ page }) => {
    // Default is 2 (minimum) — decrease button should be disabled
    const decreaseBtn = page.locator('[data-testid="players-decrease-button"]')
    await expect(decreaseBtn).toBeDisabled()
  })

  test('should allow entering custom player names', async ({ page }) => {
    const playerName = generatePlayerName()
    const nameInput0 = page.locator('[data-testid="players-name-input-0"]')

    await nameInput0.fill(playerName)
    await expect(nameInput0).toHaveValue(playerName)
  })

  test('should navigate away from players when clicking start', async ({ page }) => {
    const startBtn = page.locator('[data-testid="players-start-button"]')
    await startBtn.click()

    // After clicking start, navigates through /round-start → /game
    // The round-start transition may be too fast to catch
    await expect(page).toHaveURL(/\/(round-start|game)/, { timeout: 20000 })
  })

  test('should navigate back when clicking back button', async ({ page }) => {
    // Navigate from menu to players first, so there's a history entry
    await page.goto('/', { timeout: 30000 })
    await page.waitForSelector('[data-testid="main-menu-play"]', {
      state: 'visible',
      timeout: 10000,
    })

    const playBtn = page.locator('[data-testid="main-menu-play"]')
    await playBtn.click()
    await expect(page).toHaveURL(/\/players/)

    const backBtn = page.locator('[data-testid="players-back-button"]')
    await backBtn.click()

    // Should go back to menu
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 })
  })
})
