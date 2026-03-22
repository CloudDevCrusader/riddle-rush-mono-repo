import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

async function startGameAndGoToResults(page: Page) {
  await page.goto('/players')
  await page.waitForLoadState('networkidle')

  await hideDevtools(page)

  const nameInput0 = page.locator('[data-testid="players-name-input-0"]')
  const nameInput1 = page.locator('[data-testid="players-name-input-1"]')
  await expect(nameInput0).toBeVisible({ timeout: 5000 })
  await nameInput0.fill('Player 1')
  await expect(nameInput1).toBeVisible({ timeout: 5000 })
  await nameInput1.fill('Player 2')

  const startBtn = page.locator('[data-testid="players-start-button"]')
  await startBtn.click()
  await expect(page).toHaveURL(/\/round-start/)
  await page.waitForTimeout(2000)

  await expect(page).toHaveURL(/\/game/, { timeout: 10000 })

  const answerInput = page.locator('[data-testid="game-answer-input"]')
  const submitBtn = page.locator('[data-testid="game-submit-button"]')

  for (let i = 0; i < 2; i++) {
    await expect(answerInput).toBeVisible({ timeout: 5000 })
    await answerInput.fill('')
    await submitBtn.click()
    await page.waitForTimeout(300)
  }

  const allSubmitted = page.locator('[data-testid="game-all-submitted"]')
  await expect(allSubmitted).toBeVisible({ timeout: 8000 })

  const nextBtn = page.locator('[data-testid="next-button"]')
  await expect(nextBtn).toBeVisible({ timeout: 5000 })

  const gameMatch = page.url().match(/\/game\/([^/?#]+)/)
  const gameId = gameMatch?.[1] ?? null

  await page.evaluate(() => {
    const button = document.querySelector('[data-testid="next-button"]')
    if (button instanceof HTMLButtonElement) {
      button.click()
    }
  })

  await page.waitForLoadState('networkidle')

  await expect(page).toHaveURL(/\/results/, { timeout: 5000 })

  const resolvedGameId = await page.evaluate(async (id) => {
    const zustand = (window as unknown as Record<string, unknown>).__zustand__ as
      | { game?: { getState: () => Record<string, unknown> } }
      | undefined
    const gameState = zustand?.game?.getState() as
      | {
          loadFromDB?: () => Promise<void>
          loadSessionById?: (id: string) => Promise<void>
          currentSession?: { id?: string }
        }
      | undefined
    if (gameState?.loadFromDB) {
      await gameState.loadFromDB()
    }
    if (id && gameState?.loadSessionById) {
      await gameState.loadSessionById(id)
      return id
    }
    return gameState?.currentSession?.id ?? null
  }, gameId)

  if (resolvedGameId && !page.url().includes(`/results/${resolvedGameId}`)) {
    await page.goto(`/results/${resolvedGameId}`)
    await page.waitForLoadState('networkidle')
  }

  const scoresContainer = page.locator('[data-testid="results-scores-container"]')
  await expect(scoresContainer).toBeVisible({ timeout: 15000 })

  const firstEntry = page.locator('[data-testid="results-player-entry-0"]')
  await expect(firstEntry).toBeVisible({ timeout: 15000 })
}

async function hideDevtools(page: Page) {
  await page.addStyleTag({
    content:
      '#nuxt-devtools-container, nuxt-devtools-frame { display: none !important; pointer-events: none !important; }',
  })
}

test.describe('Scoring Workflow: Flow', () => {
  test.describe('Leaderboard Overlay', () => {
    test('should show leaderboard overlay after confirming scores', async ({ page }) => {
      // Setup game and navigate to results
      await startGameAndGoToResults(page)

      // Increment score
      const incrementBtn = page.locator('[data-testid="score-increment"]').first()
      await incrementBtn.click()
      await expect(page.locator('.scoring-page__score-value').first()).toContainText('1')

      // Confirm scores
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await confirmBtn.click()

      // Leaderboard overlay should appear
      const leaderboardOverlay = page.locator('.player-leaderboard-overlay')
      await expect(leaderboardOverlay).toBeVisible({ timeout: 5000 })
    })

    test('should auto-dismiss leaderboard and show decision modal', async ({ page }) => {
      // Setup game and navigate to results
      await startGameAndGoToResults(page)

      // Confirm scores
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await confirmBtn.click()

      // Wait for auto-dismiss (RESULTS_DISPLAY_DURATION_MS = 2000)
      await page.waitForTimeout(2500)

      // Decision modal should appear
      const promptText = page.locator('[data-testid="results-post-round-prompt"]')
      const nextRoundBtn = page.locator('[data-testid="next-round"]')
      const leaderboardBtn = page.locator('[data-testid="leaderboard-button"]')

      await expect(promptText).toBeVisible()
      await expect(nextRoundBtn).toBeVisible()
      await expect(leaderboardBtn).toBeVisible()
      await expect(leaderboardBtn).toHaveText('Leaderboard')
    })
  })

  test.describe('Decision Modal', () => {
    test.beforeEach(async ({ page }) => {
      // Setup game and get to decision modal
      await startGameAndGoToResults(page)

      // Confirm scores
      const confirmBtn = page.locator('[data-testid="confirm-scores"]')
      await confirmBtn.click()

      // Wait for leaderboard to auto-dismiss
      await page.waitForTimeout(2500)
    })

    test('should navigate to round-start when clicking Next Round', async ({ page }) => {
      const nextRoundBtn = page.locator('[data-testid="next-round"]')
      await nextRoundBtn.click()

      await expect(page).toHaveURL(/\/round-start/, { timeout: 5000 })
    })

    test('should navigate to leaderboard when clicking Finish Game', async ({ page }) => {
      const leaderboardBtn = page.locator('[data-testid="leaderboard-button"]')
      await expect(leaderboardBtn).toHaveText('Leaderboard')
      await leaderboardBtn.click()

      await expect(page).toHaveURL(/\/leaderboard/, { timeout: 5000 })
    })

    test('should remain open when pressing Escape', async ({ page }) => {
      const promptText = page.locator('[data-testid="results-post-round-prompt"]')
      await expect(promptText).toBeVisible()

      await page.keyboard.press('Escape')

      await expect(promptText).toBeVisible()
    })
  })
})
