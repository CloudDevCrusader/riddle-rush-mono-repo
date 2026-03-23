import { expect, type Page } from '@playwright/test'

/**
 * Hide Nuxt devtools overlay so it cannot intercept clicks during E2E.
 */
export async function hideDevtools(page: Page): Promise<void> {
  await page.addStyleTag({
    content:
      '#nuxt-devtools-container, nuxt-devtools-frame, #nuxt-devtools-container *, .nuxt-devtools-panel, .nuxt-devtools-toggle, [data-v-inspector], [data-inspector] { display: none !important; pointer-events: none !important; opacity: 0 !important; visibility: hidden !important; }',
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

  for (let i = 0; i < count; i++) {
    await expect(submitBtn).toBeVisible({ timeout: 10000 })

    const beforeState = await page.evaluate(() => {
      const zustand = (window as unknown as Record<string, unknown>).__zustand__ as
        | {
            game?: {
              getState: () => Record<string, unknown>
            }
          }
        | undefined

      const gameState = zustand?.game?.getState() as
        | {
            currentSession?: {
              currentPlayerIndex?: number
              players?: Array<{ hasSubmitted?: boolean }>
            }
          }
        | undefined

      const players = gameState?.currentSession?.players ?? []
      return {
        currentPlayerIndex: gameState?.currentSession?.currentPlayerIndex ?? 0,
        submittedCount: players.filter((player) => Boolean(player.hasSubmitted)).length,
      }
    })

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

            const afterState = await page.evaluate(() => {
              const zustand = (window as unknown as Record<string, unknown>).__zustand__ as
                | {
                    game?: {
                      getState: () => Record<string, unknown>
                    }
                  }
                | undefined

              const gameState = zustand?.game?.getState() as
                | {
                    currentSession?: {
                      currentPlayerIndex?: number
                      players?: Array<{ hasSubmitted?: boolean }>
                    }
                  }
                | undefined

              const players = gameState?.currentSession?.players ?? []
              return {
                currentPlayerIndex: gameState?.currentSession?.currentPlayerIndex ?? 0,
                submittedCount: players.filter((player) => Boolean(player.hasSubmitted)).length,
              }
            })

            if (
              afterState.currentPlayerIndex > beforeState.currentPlayerIndex ||
              afterState.submittedCount > beforeState.submittedCount
            ) {
              return 'state-advanced'
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
  await expect
    .poll(async () => confirmBtn.isDisabled().catch(() => true), { timeout: 8000 })
    .toBe(false)

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await confirmBtn.evaluate((element) => {
        ;(element as HTMLButtonElement).click()
      })
      break
    } catch {
      if (attempt === 3) {
        throw new Error('Failed to click confirm scores button')
      }
      await page.waitForTimeout(300)
    }
  }

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

  await page.evaluate(async () => {
    const clearStores = async () => {
      await new Promise<void>((resolve) => {
        try {
          const request = indexedDB.open('riddle-rush-db', 3)

          request.onerror = () => resolve()
          request.onupgradeneeded = () => {
            request.transaction?.abort()
            resolve()
          }
          request.onsuccess = () => {
            const db = request.result
            const storeNames = ['gameSession', 'gameSessionsById', 'gameHistory'].filter((name) =>
              db.objectStoreNames.contains(name)
            )

            if (storeNames.length === 0) {
              db.close()
              resolve()
              return
            }

            const tx = db.transaction(storeNames, 'readwrite')
            for (const store of storeNames) {
              tx.objectStore(store).clear()
            }
            tx.oncomplete = () => {
              db.close()
              resolve()
            }
            tx.onerror = () => {
              db.close()
              resolve()
            }
          }
        } catch {
          resolve()
        }
      })
    }

    await clearStores()

    const zustand = (window as unknown as Record<string, unknown>).__zustand__ as
      | {
          game?: {
            getState: () => Record<string, unknown>
          }
        }
      | undefined

    ;(zustand?.game?.getState() as { clearSession?: () => void } | undefined)?.clearSession?.()

    localStorage.clear()
    sessionStorage.clear()
  })

  await page.reload({ waitUntil: 'networkidle' })

  // Use UI flow for deterministic behavior across browser projects.
  await hideDevtools(page)

  const targetCount = playerNames.length
  const decreaseBtn = page.locator('[data-testid="players-decrease-button"]')
  const increaseBtn = page.locator('[data-testid="players-increase-button"]')
  const playerInputLocator = page.locator('[data-testid^="players-name-input-"]')
  let currentCount = await playerInputLocator.count()
  while (currentCount > targetCount) {
    await decreaseBtn.click()
    await expect
      .poll(async () => playerInputLocator.count(), { timeout: 5000 })
      .toBeLessThan(currentCount)
    currentCount = await playerInputLocator.count()
  }
  while (currentCount < targetCount) {
    await increaseBtn.click()
    await expect
      .poll(async () => playerInputLocator.count(), { timeout: 5000 })
      .toBeGreaterThan(currentCount)
    currentCount = await playerInputLocator.count()
  }

  for (let i = 0; i < playerNames.length; i++) {
    const nameInput = page.locator(`[data-testid="players-name-input-${i}"]`)
    await expect(nameInput).toBeVisible({ timeout: 5000 })
    await nameInput.fill(playerNames[i] ?? '')
  }

  const startBtn = page.locator('[data-testid="players-start-button"]')
  for (let attempt = 0; attempt < 8; attempt++) {
    await expect(startBtn).toBeVisible({ timeout: 5000 })
    try {
      await startBtn.evaluate((element) => {
        ;(element as HTMLButtonElement).click()
      })
    } catch {
      // Reactivity transitions can detach/recreate the button; retry.
    }
    await page.waitForTimeout(250)
    if (/\/(round-start|game)/.test(page.url())) {
      break
    }
  }

  // Round start may appear first (fortune wheel path) before game route.
  await expect.poll(() => /\/(round-start|game)/.test(page.url()), { timeout: 45000 }).toBe(true)

  if (page.url().includes('/round-start')) {
    await expect.poll(() => /\/game/.test(page.url()), { timeout: 45000 }).toBe(true)
  }

  if (!/\/game/.test(page.url())) {
    await page.goto('/round-start', { timeout: 30000 })
    await expect.poll(() => /\/game/.test(page.url()), { timeout: 45000 }).toBe(true)
  }

  const gameIdMatch = page.url().match(/\/game\/([^/?#]+)/)
  const currentGameId = gameIdMatch?.[1] ?? null
  if (currentGameId) {
    await page.goto(`/game/${currentGameId}`, { timeout: 30000 })
    await page.waitForLoadState('networkidle')
  }

  await expect
    .poll(
      async () => {
        const visible = await page
          .locator('[data-testid="game-player-name"]')
          .isVisible()
          .catch(() => false)
        if (visible) {
          return 'ok'
        }

        const snapshot = await page.evaluate(() => {
          const zustand = (window as unknown as Record<string, unknown>).__zustand__ as
            | {
                game?: {
                  getState: () => Record<string, unknown>
                }
              }
            | undefined

          const gameState = zustand?.game?.getState() as
            | {
                currentSession?: {
                  id?: string
                  players?: Array<{ id: string }>
                  category?: { name?: string; searchWord?: string }
                  letter?: string
                }
                pendingPlayerNames?: string[]
              }
            | undefined

          return {
            href: window.location.pathname,
            sessionId: gameState?.currentSession?.id ?? null,
            playerCount: gameState?.currentSession?.players?.length ?? 0,
            currentPlayerIndex:
              (gameState?.currentSession as { currentPlayerIndex?: number } | undefined)
                ?.currentPlayerIndex ?? null,
            allSubmitted:
              (gameState?.currentSession?.players?.length ?? 0) > 0
                ? (gameState?.currentSession?.players?.every((player) =>
                    Boolean((player as { hasSubmitted?: boolean }).hasSubmitted)
                  ) ?? false)
                : false,
            currentPlayerTurnName:
              (gameState as { currentPlayerTurn?: { name?: string } } | undefined)
                ?.currentPlayerTurn?.name ?? null,
            pendingCount: gameState?.pendingPlayerNames?.length ?? 0,
            letter: gameState?.currentSession?.letter ?? null,
            category: gameState?.currentSession?.category?.searchWord ?? null,
          }
        })

        return JSON.stringify(snapshot)
      },
      { timeout: 30000 }
    )
    .toBe('ok')
}

/**
 * Start a game with the default players setup.
 */
export async function startGameWithDefaults(page: Page): Promise<void> {
  await setupMultiplayerGame(page, ['Player 1', 'Player 2'])
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
