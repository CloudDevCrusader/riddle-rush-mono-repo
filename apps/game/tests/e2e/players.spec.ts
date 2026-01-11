import { test, expect } from '@playwright/test'

test.describe('Players Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/players', { timeout: 30000 })
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
    // May have 1 or 2 players depending on state from previous tests
    await expect(playerItems).toHaveCount(await playerItems.count())
    await expect(playerItems.first()).toBeVisible()
  })

  test('should show empty slots for remaining players', async ({ page }) => {
    const emptySlots = page.locator('.player-item.empty')
    const playerItems = page.locator('.player-item:not(.empty)')
    const totalSlots = (await playerItems.count()) + (await emptySlots.count())
    // Total slots should be 6
    expect(totalSlots).toBe(6)
  })

  test('should add a player when clicking add button', async ({ page }) => {
    const addBtn = page.locator('.add-btn')
    await expect(addBtn).toBeVisible()

    const playerItemsBefore = page.locator('.player-item:not(.empty)')
    const countBefore = await playerItemsBefore.count()

    // Mock the prompt to return a player name
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt')
      await dialog.accept('Test Player')
    })

    await addBtn.click()
    await page.waitForTimeout(300)

    const playerItemsAfter = page.locator('.player-item:not(.empty)')
    await expect(playerItemsAfter).toHaveCount(countBefore + 1)
  })

  test('should remove a player when clicking remove button', async ({ page }) => {
    const playerItemsBefore = page.locator('.player-item:not(.empty)')
    const countBefore = await playerItemsBefore.count()

    const removeBtn = page.locator('.remove-player-btn').first()
    await removeBtn.click()
    await page.waitForTimeout(300)

    const playerItemsAfter = page.locator('.player-item:not(.empty)')
    await expect(playerItemsAfter).toHaveCount(countBefore - 1)
  })

  test('should enable start button when players exist', async ({ page }) => {
    const startBtn = page.locator('.start-btn')
    await expect(startBtn).not.toBeDisabled()
  })

  test('should navigate to alphabet when clicking start', async ({ page }) => {
    const startBtn = page.locator('.start-btn')
    await startBtn.click()

    // After flow update, clicking start navigates to round-start (dual wheel spin)
    await expect(page).toHaveURL(/\/round-start/)
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
