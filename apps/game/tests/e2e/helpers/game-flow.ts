import { expect, type Page } from '@playwright/test'

/**
 * Hide Nuxt devtools overlay so it cannot intercept clicks during E2E.
 */
export async function hideDevtools(page: Page): Promise<void> {
  await page.addStyleTag({
    content:
      '#nuxt-devtools-container, nuxt-devtools-frame { display: none !important; pointer-events: none !important; }',
  })
}

/**
 * Submit answers for the given number of players.
 *
 * Feature-flag aware: if answer input is hidden, only submit clicks are executed.
 */
export async function submitPlayerAnswers(
  page: Page,
  count: number,
  answers: string[] = []
): Promise<void> {
  if (count <= 0) {
    return
  }

  const answerInput = page.locator('[data-testid="game-answer-input"]')
  const submitBtn = page.locator('[data-testid="game-submit-button"]')
  const allSubmitted = page.locator('[data-testid="game-all-submitted"]')
  const turnName = page.locator('[data-testid="game-player-name"]')
  const hasTurnName = (await turnName.count()) > 0

  for (let i = 0; i < count; i++) {
    await expect(submitBtn).toBeVisible({ timeout: 10000 })

    const previousTurnName = hasTurnName ? ((await turnName.textContent())?.trim() ?? null) : null
    const answerInputVisible = await answerInput.isVisible()
    const answer = answers[i]

    if (answerInputVisible && answer !== undefined) {
      await answerInput.fill(answer)
    }

    await submitBtn.click()

    if (i < count - 1) {
      await expect
        .poll(
          async () => {
            if (await allSubmitted.isVisible().catch(() => false)) {
              return 'all-submitted'
            }

            const currentTurnName = hasTurnName
              ? ((await turnName.textContent())?.trim() ?? null)
              : null
            if (
              previousTurnName !== null &&
              currentTurnName !== null &&
              currentTurnName.length > 0 &&
              currentTurnName !== previousTurnName
            ) {
              return 'turn-changed'
            }

            return 'waiting'
          },
          { timeout: 8000 }
        )
        .not.toBe('waiting')
    }
  }

  await expect(allSubmitted).toBeVisible({ timeout: 10000 })
}

/**
 * Navigate from game page to results and ensure session state is loaded.
 */
export async function navigateToResults(page: Page): Promise<void> {
  const nextBtn = page.locator('[data-testid="next-button"]')
  await expect(nextBtn).toBeVisible({ timeout: 10000 })

  const gameMatch = page.url().match(/\/game\/([^/?#]+)/)
  const gameId = gameMatch?.[1] ?? null

  await nextBtn.click()
  await expect(page).toHaveURL(/\/results/, { timeout: 10000 })
  await page.waitForLoadState('networkidle')

  const resolvedGameId = await page.evaluate(async (id) => {
    const zustand = (window as unknown as Record<string, unknown>).__zustand__ as
      | { game?: { getState: () => Record<string, unknown> } }
      | undefined
    const gameState = zustand?.game?.getState() as
      | {
          loadFromDB?: () => Promise<void>
          loadSessionById?: (sessionId: string) => Promise<void>
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

  await expect(page.locator('[data-testid="results-scores-container"]')).toBeVisible({
    timeout: 15000,
  })
  await expect(page.locator('[data-testid="results-player-entry-0"]')).toBeVisible({
    timeout: 15000,
  })
}

/**
 * Assign score increments per player on the results page.
 */
export async function assignScores(page: Page, scores: number[]): Promise<void> {
  for (let i = 0; i < scores.length; i++) {
    const playerEntry = page.locator(`[data-testid="results-player-entry-${i}"]`)
    const incrementBtn = playerEntry.locator('[data-testid="score-increment"]')
    const clickCount = Math.max(0, scores[i] ?? 0)

    for (let c = 0; c < clickCount; c++) {
      await incrementBtn.click()
      await page.waitForTimeout(90)
    }
  }
}

/**
 * Confirm scores and wait until decision actions become available.
 */
export async function confirmScoresAndWaitForModal(page: Page): Promise<void> {
  const confirmBtn = page.locator('[data-testid="confirm-scores"]')
  await expect(confirmBtn).toBeVisible({ timeout: 8000 })
  await confirmBtn.click()

  const nextRoundBtn = page.locator('[data-testid="next-round"]')
  const leaderboardBtn = page.locator('[data-testid="leaderboard-button"]')

  await expect(nextRoundBtn.or(leaderboardBtn).first()).toBeVisible({ timeout: 15000 })
}

/**
 * Continue to the next round from the post-round decision modal.
 */
export async function goToNextRound(page: Page): Promise<void> {
  const nextRoundBtn = page.locator('[data-testid="next-round"]')
  await expect(nextRoundBtn).toBeVisible({ timeout: 8000 })
  await nextRoundBtn.click()
  await expect(page).toHaveURL(/\/game/, { timeout: 20000 })
}

/**
 * Finish the game from the post-round decision modal.
 */
export async function finishGame(page: Page): Promise<void> {
  const leaderboardBtn = page.locator('[data-testid="leaderboard-button"]')
  await expect(leaderboardBtn).toBeVisible({ timeout: 8000 })
  await leaderboardBtn.click()
  await expect(page).toHaveURL(/\/leaderboard/, { timeout: 10000 })
}

/**
 * Start a multiplayer game from players page with explicit player names.
 */
export async function setupMultiplayerGame(page: Page, playerNames: string[]): Promise<void> {
  await page.goto('/players', { timeout: 30000 })
  await page.waitForLoadState('networkidle')
  await hideDevtools(page)

  const targetCount = playerNames.length
  const increaseBtn = page.locator('[data-testid="players-increase-button"]')
  const decreaseBtn = page.locator('[data-testid="players-decrease-button"]')

  let currentCount = await page.locator('[data-testid^="players-name-input-"]').count()

  while (currentCount < targetCount) {
    await increaseBtn.click()
    currentCount++
  }

  while (currentCount > targetCount) {
    await decreaseBtn.click()
    currentCount--
  }

  for (let i = 0; i < playerNames.length; i++) {
    const nameInput = page.locator(`[data-testid="players-name-input-${i}"]`)
    await expect(nameInput).toBeVisible({ timeout: 5000 })
    await nameInput.fill(playerNames[i] ?? '')
  }

  const startBtn = page.locator('[data-testid="players-start-button"]')
  await expect(startBtn).toBeVisible({ timeout: 8000 })
  await startBtn.click()
  await expect(page).toHaveURL(/\/game/, { timeout: 20000 })
}

/**
 * Start a game with the default players setup.
 */
export async function startGameWithDefaults(page: Page): Promise<void> {
  await page.goto('/players', { timeout: 30000 })
  await page.waitForLoadState('networkidle')
  await hideDevtools(page)

  const startBtn = page.locator('[data-testid="players-start-button"]')
  await expect(startBtn).toBeVisible({ timeout: 10000 })
  await startBtn.click()
  await expect(page).toHaveURL(/\/game/, { timeout: 20000 })
}

/**
 * Convenience setup: start game, submit player turns, then open results.
 *
 * Ensures at least one player turn is processed for edge cases (e.g. count <= 0).
 */
export async function startGameAndGoToResults(page: Page, playerCount = 2): Promise<void> {
  const normalizedPlayerCount = Math.max(1, Math.floor(playerCount))

  if (normalizedPlayerCount === 2) {
    await startGameWithDefaults(page)
  } else {
    const players = Array.from({ length: normalizedPlayerCount }, (_, i) => `Player ${i + 1}`)
    await setupMultiplayerGame(page, players)
  }

  await submitPlayerAnswers(page, normalizedPlayerCount)
  await navigateToResults(page)
}
