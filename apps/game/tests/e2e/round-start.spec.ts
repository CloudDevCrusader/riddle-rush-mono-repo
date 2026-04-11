import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'
import { completeFortuneWheel, setupMultiplayerGame } from './helpers/game-flow'

test.describe.configure({ mode: 'serial' })
test.setTimeout(120000)

async function resetPersistedGameState(page: Page) {
  await page.goto('/players')
  await expect(page).toHaveURL(/\/players/)
  await page.evaluate(() => {
    indexedDB.deleteDatabase('riddle-rush-db')
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
  await expect(page).toHaveURL(/\/players/)
}

async function startGameFromPlayers(page: Page) {
  await setupMultiplayerGame(page, ['Player 1', 'Player 2'], false)

  await page.goto('/round-start')
  await expect(page).toHaveURL(/\/round-start/, { timeout: 30000 })
}

test.describe('round-start page round-start', () => {
  test.beforeEach(async ({ page }) => {
    await resetPersistedGameState(page)
    await startGameFromPlayers(page)
  })

  test('back button returns to players to fix names', async ({ page }) => {
    await expect(page.locator('[data-testid="round-start-back-button"]')).toBeVisible({
      timeout: 8000,
    })
    await page.locator('[data-testid="round-start-back-button"]').click()
    await expect(page).toHaveURL(/\/players/, { timeout: 10000 })
  })

  test('shows wheel interaction before transitioning to game', async ({ page }) => {
    const wheelContainer = page.locator('[data-testid="fortune-wheel-container"]')
    const legacyFlipContainer = page.locator('[data-testid="flip-container"]')

    await expect(wheelContainer).toBeVisible({ timeout: 8000 })
    await expect(legacyFlipContainer).toHaveCount(0)
    await expect(page.locator('[data-testid="fortune-wheel-spin-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="fortune-wheel-confirm-button"]')).toBeVisible()

    const categoryRow = page.locator('[data-testid="round-start-category-row"]')
    await expect(categoryRow).toBeVisible({ timeout: 8000 })
    await expect(page.locator('[data-testid="fortune-wheel-selected-category"]')).toHaveText('-', {
      timeout: 8000,
    })
    const inlineCategory = page.locator('[data-testid="fortune-wheel-inline-category"]')
    await expect(inlineCategory).toBeVisible()
    await expect(inlineCategory).toContainText('-')
    await expect(inlineCategory).toContainText('*')

    await completeFortuneWheel(page)
    await expect(page).toHaveURL(/\/game/, { timeout: 35000 })
  })
})

test.describe('Round Counter Logic', () => {
  test.beforeEach(async ({ page }) => {
    await resetPersistedGameState(page)
  })

  test('should display round 1 on game screen after first wheel completion', async ({ page }) => {
    await startGameFromPlayers(page)
    await completeFortuneWheel(page)
    await expect(page).toHaveURL(/\/game\//, { timeout: 35000 })
    await expect(page.locator('[data-testid="game-round-indicator"]')).toContainText('1')
  })

  test('page refresh should not increment round counter', async ({ page }) => {
    await startGameFromPlayers(page)

    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/round-start/)
    await completeFortuneWheel(page)
    await expect(page).toHaveURL(/\/game\//, { timeout: 35000 })
    await expect(page.locator('[data-testid="game-round-indicator"]')).toContainText('1')
  })

  test('navigating back to round-start during active game should not increment round', async ({
    page,
  }) => {
    await startGameFromPlayers(page)

    await completeFortuneWheel(page)
    await expect(page).toHaveURL(/\/game\//, { timeout: 35000 })

    const gameUrl = page.url()

    await page.goto('/round-start')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/round-start/)

    await page.goto(gameUrl)
    await expect(page).toHaveURL(new RegExp(gameUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    await expect(page.locator('[data-testid="game-round-indicator"]')).toContainText('1')
  })
})
