import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'
import { completeFortuneWheel } from './helpers/game-flow'

test.describe.configure({ mode: 'serial' })

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
  await page.goto('/players')
  await expect(page).toHaveURL(/\/players/)
  const startButton = page.locator('[data-testid="players-start-button"]').first()
  await expect(startButton).toBeVisible({ timeout: 15000 })
  await startButton
    .click({ timeout: 5000 })
    .catch(() => startButton.click({ force: true, timeout: 5000 }))

  await expect(page).toHaveURL(/\/round-start/, { timeout: 30000 })
}

test.describe('round-start page round-start', () => {
  test.beforeEach(async ({ page }) => {
    await resetPersistedGameState(page)
    await startGameFromPlayers(page)
  })

  test('shows wheel-default flow with auto-spin before transitioning to game', async ({ page }) => {
    const roundIndicator = page.locator('[data-testid="round-indicator"]')
    const wheelsContainer = page.locator('[data-testid="round-wheels-container"]')

    await expect(roundIndicator).toBeVisible()
    await expect(roundIndicator).toContainText('1')

    // Contract: default path shows wheel UI first on /round-start
    await expect(wheelsContainer).toBeVisible({ timeout: 8000 })

    // Drive the interactive flow to /game using stable route/test-id signals.
    await completeFortuneWheel(page)
    await expect(page).toHaveURL(/\/game/, { timeout: 35000 })
  })
})

test.describe('Round Counter Logic', () => {
  test.beforeEach(async ({ page }) => {
    await resetPersistedGameState(page)
  })

  test('should display "Round 1" on initial game start', async ({ page }) => {
    await startGameFromPlayers(page)

    // Check round indicator shows "Round 1"
    const roundIndicator = page.locator('[data-testid="round-indicator"]')
    await expect(roundIndicator).toBeVisible()
    await expect(roundIndicator).toContainText('1')
  })

  test('page refresh should not increment round counter', async ({ page }) => {
    await startGameFromPlayers(page)

    // Check initial round is 1
    const roundIndicator = page.locator('[data-testid="round-indicator"]')
    await expect(roundIndicator).toContainText('1')

    // Refresh the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Round should still show 1 (not increment)
    await expect(page).toHaveURL(/\/round-start/)
    await expect(page.locator('[data-testid="round-indicator"]')).toContainText('1')
  })

  test('navigating back to round-start during active game should not increment round', async ({
    page,
  }) => {
    await startGameFromPlayers(page)

    await completeFortuneWheel(page)
    await expect(page).toHaveURL(/\/game/, { timeout: 35000 })

    // Manually navigate back to round-start (simulating a refresh/back)
    await page.goto('/round-start')
    await page.waitForLoadState('networkidle')

    // Round indicator should still show 1, not 2
    const roundIndicator = page.locator('[data-testid="round-indicator"]')
    await expect(roundIndicator).toBeVisible()
    await expect(roundIndicator).toContainText('1')
  })
})
