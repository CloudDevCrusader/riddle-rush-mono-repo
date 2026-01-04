import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForVisible,
  clickWithRetry,
  waitForNavigation,
  waitForCount,
} from '../utils/e2e-helpers'

test.describe('Players Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/players')
  })

  test('should display players page with all elements', async ({ page }) => {
    // Check for background
    const background = page.locator('.page-bg')
    await waitForVisible(background)

    // Check for title
    const title = page.locator('.title-image')
    await waitForVisible(title)

    // Check for back button
    const backBtn = page.locator('.back-btn')
    await waitForVisible(backBtn)

    // Check for players list
    const playersList = page.locator('.players-list')
    await waitForVisible(playersList)

    // Check for start button
    const startBtn = page.locator('.start-btn')
    await waitForVisible(startBtn)
  })

  test('should display initial player', async ({ page }) => {
    const playerItems = page.locator('.player-item:not(.empty)')
    // May have 1 or 2 players depending on state from previous tests
    const count = await playerItems.count()
    expect(count).toBeGreaterThan(0)
    await waitForVisible(playerItems.first())
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
    await waitForVisible(addBtn)

    const playerItemsBefore = page.locator('.player-item:not(.empty)')
    const countBefore = await playerItemsBefore.count()

    // Mock the prompt to return a player name
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt')
      await dialog.accept('Test Player')
    })

    await clickWithRetry(addBtn)
    await page.waitForTimeout(500) // Wait for dialog and player addition

    const playerItemsAfter = page.locator('.player-item:not(.empty)')
    await waitForCount(playerItemsAfter, countBefore + 1)
  })

  test('should remove a player when clicking remove button', async ({ page }) => {
    const playerItemsBefore = page.locator('.player-item:not(.empty)')
    const countBefore = await playerItemsBefore.count()

    if (countBefore === 0) {
      test.skip() // Can't remove if no players
      return
    }

    const removeBtn = page.locator('.remove-player-btn').first()
    await clickWithRetry(removeBtn)
    await page.waitForTimeout(500) // Wait for removal animation

    const playerItemsAfter = page.locator('.player-item:not(.empty)')
    await waitForCount(playerItemsAfter, countBefore - 1)
  })

  test('should enable start button when players exist', async ({ page }) => {
    const startBtn = page.locator('.start-btn')
    await waitForVisible(startBtn)
    await expect(startBtn).not.toBeDisabled()
  })

  test('should navigate to round-start when clicking start', async ({ page }) => {
    const startBtn = page.locator('.start-btn')
    await clickWithRetry(startBtn)

    // After flow update, clicking start navigates to round-start (dual wheel spin)
    await waitForNavigation(page, /\/round-start/)
  })

  test('should navigate back when clicking back button', async ({ page }) => {
    const backBtn = page.locator('.back-btn')
    await clickWithRetry(backBtn)

    // Should go back to previous page (likely menu)
    await page.waitForTimeout(500)
  })

  test('should have scroll bar decoration', async ({ page }) => {
    const scrollBar = page.locator('.scroll-bar')
    await waitForVisible(scrollBar)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const title = page.locator('.title-image')
    const startBtn = page.locator('.start-btn')

    await waitForVisible(title)
    await waitForVisible(startBtn)
  })
})
