import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'
import { setupMultiplayerGame } from './helpers/game-flow'

test.setTimeout(120000)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Window with exposed Pinia stores for E2E testing. */
interface PiniaWindow extends Window {
  __pinia_stores__?: {
    game?: { clearSession?: () => void; pendingPlayerNames?: string[] }
    settings?: { fortuneWheelAllowRedraw: boolean }
  }
}

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
  await expect(page).toHaveURL(/\/round-start/, { timeout: 30000 })

  // Wait for any global loading overlay to clear (it blocks pointer events)
  await page
    .locator('.global-loading-overlay')
    .waitFor({ state: 'hidden', timeout: 15000 })
    .catch(() => {})
  await page.waitForLoadState('networkidle')
}

/** Set the fortuneWheelAllowRedraw setting via the Pinia settings store. */
async function setAllowRedraw(page: Page, value: boolean) {
  await page.evaluate((v) => {
    const settings = (window as PiniaWindow).__pinia_stores__?.settings
    if (settings) {
      settings.fortuneWheelAllowRedraw = v
    }
  }, value)
}

/**
 * Spin the wheel and navigate to /game using auto-advance mode.
 * Sets allowRedraw=false so the game starts automatically after the spin,
 * avoiding the unreliable confirm button interaction with the canvas component.
 */
async function spinToGame(page: Page) {
  await setAllowRedraw(page, false)

  const spinButton = page.locator('[data-testid="fortune-wheel-spin-button"]')
  await expect(spinButton).toBeVisible({ timeout: 10000 })
  await expect
    .poll(async () => spinButton.isDisabled().catch(() => true), { timeout: 10000 })
    .toBe(false)

  // Retry click if canvas absorbs the pointer event (common on larger viewports)
  const selectedLetter = page.locator('[data-testid="fortune-wheel-selected-letter"]')
  await expect
    .poll(
      async () => {
        await spinButton.click({ force: true }).catch(() => {})
        const letterText = (await selectedLetter.textContent().catch(() => ''))?.trim() ?? ''
        return /^[A-Z]$/.test(letterText)
      },
      { timeout: 30000, intervals: [500, 1000, 2000, 3000, 5000] }
    )
    .toBe(true)

  await expect(page).toHaveURL(/\/game/, { timeout: 45000 })
}

// ---------------------------------------------------------------------------
// Round-start page UI and back navigation
// ---------------------------------------------------------------------------

test.describe('round-start page', () => {
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

  test('shows wheel UI with correct initial state', async ({ page }) => {
    const wheelContainer = page.locator('[data-testid="fortune-wheel-container"]')

    await expect(wheelContainer).toBeVisible({ timeout: 8000 })
    await expect(page.locator('[data-testid="fortune-wheel-spin-button"]')).toBeVisible()

    // Category row in parent (round-start strip) shows placeholder
    const categoryRow = page.locator('[data-testid="round-start-category-row"]')
    await expect(categoryRow).toBeVisible({ timeout: 8000 })
    await expect(page.locator('[data-testid="fortune-wheel-selected-category"]')).toHaveText('-', {
      timeout: 8000,
    })

    // Inline category chip on wheel card shows placeholder emoji (*) and label (-)
    const inlineCategory = page.locator('[data-testid="fortune-wheel-inline-category"]')
    await expect(inlineCategory).toBeVisible()
    await expect(inlineCategory).toContainText('-')
    await expect(inlineCategory).toContainText('*')
  })
})

// ---------------------------------------------------------------------------
// Fortune wheel modes: respin (allowRedraw=true) vs auto-advance (allowRedraw=false)
// ---------------------------------------------------------------------------

test.describe('fortune wheel respin mode (allowRedraw=true)', () => {
  test.beforeEach(async ({ page }) => {
    await resetPersistedGameState(page)
    await startGameFromPlayers(page)
    await setAllowRedraw(page, true)
  })

  test('spin button and OK button are both visible', async ({ page }) => {
    await expect(page.locator('[data-testid="fortune-wheel-spin-button"]')).toBeVisible({
      timeout: 8000,
    })
    await expect(page.locator('[data-testid="fortune-wheel-confirm-button"]')).toBeVisible()
  })

  test('can respin and then OK navigates to game', async ({ page }) => {
    const spinButton = page.locator('[data-testid="fortune-wheel-spin-button"]')
    const confirmButton = page.locator('[data-testid="fortune-wheel-confirm-button"]')
    const selectedLetter = page.locator('[data-testid="fortune-wheel-selected-letter"]')

    await expect(spinButton).toBeVisible({ timeout: 8000 })

    // First spin — retry click if canvas absorbs the pointer event
    await expect
      .poll(async () => spinButton.isDisabled().catch(() => true), { timeout: 10000 })
      .toBe(false)

    await expect
      .poll(
        async () => {
          await spinButton.click({ force: true }).catch(() => {})
          const letterText = (await selectedLetter.textContent().catch(() => ''))?.trim() ?? ''
          return /^[A-Z]$/.test(letterText)
        },
        { timeout: 30000, intervals: [500, 1000, 2000, 3000, 5000] }
      )
      .toBe(true)

    // Wait for confirm button to become enabled
    await expect
      .poll(async () => confirmButton.isDisabled().catch(() => true), { timeout: 15000 })
      .toBe(false)

    // Verify we can respin: spin button should be enabled again
    await expect
      .poll(async () => spinButton.isDisabled().catch(() => true), { timeout: 10000 })
      .toBe(false)

    // Second spin (respin): click, then wait for confirm to go disabled (spin started)
    await spinButton.click({ force: true })
    await expect
      .poll(async () => confirmButton.isDisabled().catch(() => false), {
        timeout: 5000,
        intervals: [200, 300, 500],
      })
      .toBe(true)

    // Wait for respin to complete (confirm re-enabled)
    await expect
      .poll(async () => confirmButton.isDisabled().catch(() => true), { timeout: 30000 })
      .toBe(false)

    // Click OK → navigates to game
    await confirmButton.click()
    await expect(page).toHaveURL(/\/game/, { timeout: 35000 })
  })
})

test.describe('fortune wheel auto-advance mode (allowRedraw=false)', () => {
  test.beforeEach(async ({ page }) => {
    await resetPersistedGameState(page)
    await startGameFromPlayers(page)
    await setAllowRedraw(page, false)
  })

  test('confirm button is hidden when redraw is disabled', async ({ page }) => {
    await expect(page.locator('[data-testid="fortune-wheel-spin-button"]')).toBeVisible({
      timeout: 8000,
    })
    await expect(page.locator('[data-testid="fortune-wheel-confirm-button"]')).toHaveCount(0)
  })

  test('spin auto-navigates to game without confirm', async ({ page }) => {
    const spinButton = page.locator('[data-testid="fortune-wheel-spin-button"]')

    await expect(spinButton).toBeVisible({ timeout: 8000 })
    await expect
      .poll(async () => spinButton.isDisabled().catch(() => true), { timeout: 10000 })
      .toBe(false)

    await spinButton.click()

    // Should auto-advance to /game after spin completes (no confirm needed)
    await expect(page).toHaveURL(/\/game/, { timeout: 45000 })
  })
})

// ---------------------------------------------------------------------------
// Round counter logic
// ---------------------------------------------------------------------------

test.describe('Round Counter Logic', () => {
  test.beforeEach(async ({ page }) => {
    await resetPersistedGameState(page)
  })

  test('should display round 1 on game screen after first wheel completion', async ({ page }) => {
    await startGameFromPlayers(page)
    await spinToGame(page)
    await expect(page).toHaveURL(/\/game\//, { timeout: 35000 })
    await expect(page.locator('[data-testid="game-round-indicator"]')).toContainText('1')
  })

  test('page refresh should not increment round counter', async ({ page }) => {
    await startGameFromPlayers(page)

    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/round-start/)
    await spinToGame(page)
    await expect(page).toHaveURL(/\/game\//, { timeout: 35000 })
    await expect(page.locator('[data-testid="game-round-indicator"]')).toContainText('1')
  })

  test('navigating back to round-start during active game should not increment round', async ({
    page,
  }) => {
    await startGameFromPlayers(page)

    await spinToGame(page)
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
