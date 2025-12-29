import { test, expect } from '@playwright/test'

test.describe('Players Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/players')
  })

  test('should display players page with all elements', async ({ page }) => {
    // Check for background
    const background = page.locator('.page-bg')
    await expect(background).toBeVisible()

    // Check for title
    const title = page.locator('.title-image')
    await expect(title).toBeVisible()

    // Check for back button
    const backBtn = page.locator('.back-btn')
    await expect(backBtn).toBeVisible()

    // Check for players list
    const playersList = page.locator('.players-list')
    await expect(playersList).toBeVisible()

    // Check for start button
    const startBtn = page.locator('.start-btn')
    await expect(startBtn).toBeVisible()
  })

  test('should display initial player', async ({ page }) => {
    const playerItems = page.locator('.player-item:not(.empty)')
    await expect(playerItems).toHaveCount(1)

    const playerName = playerItems.first().locator('.player-name')
    await expect(playerName).toHaveText('Player 1')
  })

  test('should show empty slots for remaining players', async ({ page }) => {
    const emptySlots = page.locator('.player-item.empty')
    await expect(emptySlots).toHaveCount(5) // 6 max - 1 existing = 5 empty
  })

  test('should add a player when clicking add button', async ({ page }) => {
    const addBtn = page.locator('.add-btn')
    await expect(addBtn).toBeVisible()

    // Mock the prompt to return a player name
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt')
      await dialog.accept('Test Player')
    })

    await addBtn.click()
    await page.waitForTimeout(300)

    const playerItems = page.locator('.player-item:not(.empty)')
    await expect(playerItems).toHaveCount(2)
  })

  test('should remove a player when clicking remove button', async ({ page }) => {
    const removeBtn = page.locator('.remove-player-btn').first()
    await removeBtn.click()
    await page.waitForTimeout(300)

    const playerItems = page.locator('.player-item:not(.empty)')
    await expect(playerItems).toHaveCount(0)

    // Start button should be disabled when no players
    const startBtn = page.locator('.start-btn')
    await expect(startBtn).toBeDisabled()
  })

  test('should enable start button when players exist', async ({ page }) => {
    const startBtn = page.locator('.start-btn')
    await expect(startBtn).not.toBeDisabled()
  })

  test('should navigate to game when clicking start', async ({ page }) => {
    const startBtn = page.locator('.start-btn')
    await startBtn.click()

    await expect(page).toHaveURL(/\/game/)
    await page.waitForTimeout(500)
  })

  test('should navigate back when clicking back button', async ({ page }) => {
    const backBtn = page.locator('.back-btn')
    await backBtn.click()

    // Should go back to previous page (likely menu)
    await page.waitForTimeout(500)
  })

  test('should have scroll bar decoration', async ({ page }) => {
    const scrollBar = page.locator('.scroll-bar')
    await expect(scrollBar).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const title = page.locator('.title-image')
    const startBtn = page.locator('.start-btn')

    await expect(title).toBeVisible()
    await expect(startBtn).toBeVisible()
  })
})
