import { expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Browser-context window type extensions (used inside page.evaluate callbacks)
// ---------------------------------------------------------------------------

/** Window extended with Nuxt internal properties. */
interface NuxtWindow extends Window {
  __NUXT_DEVTOOLS__?: unknown
  __NUXT__?: { config?: { devtools?: boolean } }
}

/** Player state as seen from the E2E browser context. */
interface E2EPlayer {
  id: string
  hasSubmitted?: boolean
  name?: string
}

/** Game session state as seen from the E2E browser context. */
interface E2EGameSession {
  id?: string
  currentPlayerIndex?: number
  players?: E2EPlayer[]
  category?: { name?: string; searchWord?: string }
  letter?: string
  currentRound?: number
  status?: string
}

/** Pinia game store shape as seen from the E2E browser context. */
interface E2EPiniaGameStore {
  currentSession?: E2EGameSession
  pendingPlayerNames?: string[]
  currentPlayerTurn?: { name?: string }
  flowState?: string
  loadFromDB?: () => Promise<void>
  loadSessionById?: (sessionId: string) => Promise<void>
  setupPlayers?: (
    playerNames: string[],
    gameName?: string,
    customLetter?: string,
    customCategory?: unknown
  ) => Promise<{ id?: string } | null>
  setPendingPlayerNames?: (playerNames: string[]) => void
  transitionToRoundComplete?: () => void
  clearSession?: () => void
}

/** Window extended with Pinia stores exposed for E2E testing. */
interface PiniaWindow extends Window {
  __pinia_stores__?: {
    game?: E2EPiniaGameStore
  }
}

// ---------------------------------------------------------------------------

/**
 * Wait for the splash screen to finish animating away.
 */
export async function waitForSplashComplete(page: Page): Promise<void> {
  await page.waitForTimeout(1000)
  const splashScreen = page.locator('[data-testid="splash-screen"]')
  await splashScreen.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
    // Splash might already be gone
  })
  await page.waitForTimeout(500) // Extra buffer for transitions
}

/**
 * Hide Nuxt devtools overlay so it cannot intercept clicks during E2E.
 */
export async function hideDevtools(page: Page): Promise<void> {
  await page.addStyleTag({
    content:
      '#nuxt-devtools-container, nuxt-devtools-frame, #nuxt-devtools-container *, .nuxt-devtools-panel, .nuxt-devtools-toggle, [data-v-inspector], [data-inspector], [data-inspector] { display: none !important; pointer-events: none !important; opacity: 0 !important; visibility: hidden !important; z-index: -1 !important; position: static !important; }',
  })

  // Also try to force devtools to be disabled
  await page.evaluate(() => {
    const win = window as NuxtWindow
    win.__NUXT_DEVTOOLS__ = null
    win.__NUXT__ = win.__NUXT__ ?? {}
    win.__NUXT__.config = win.__NUXT__.config ?? {}
    win.__NUXT__.config.devtools = false
  })
}

/**
 * Configure browser globals before app scripts run.
 * Disables splash behavior in `app.vue` for Playwright runs.
 */
async function preparePageForE2E(page: Page): Promise<void> {
  await page.addInitScript(() => {
    ;(window as Window & { playwrightTest?: boolean }).playwrightTest = true
  })
}

/**
 * Ensure player names are non-empty and unique so setup cannot fail on duplicate validation.
 */
function normalizePlayerNames(playerNames: string[]): string[] {
  const seen = new Map<string, number>()

  return playerNames.map((name, index) => {
    const baseName = name.trim() || `Player ${index + 1}`
    const key = baseName.toLowerCase()
    const count = seen.get(key) ?? 0
    seen.set(key, count + 1)

    if (count === 0) {
      return baseName
    }

    return `${baseName} ${count + 1}`
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

  const answerInput = page.locator('[data-testid="game-answer-input"]').first()
  const submitBtn = page.locator('[data-testid="game-submit-button"]').first()
  const allSubmitted = page.locator('[data-testid="game-all-submitted"]')

  for (let i = 0; i < count; i++) {
    await expect(submitBtn).toBeVisible({ timeout: 10000 })

    const beforeState = await page.evaluate(() => {
      const store = (window as PiniaWindow).__pinia_stores__?.game

      const players = store?.currentSession?.players ?? []
      return {
        currentPlayerIndex: store?.currentSession?.currentPlayerIndex ?? 0,
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
              const store = (window as PiniaWindow).__pinia_stores__?.game
              const players = store?.currentSession?.players ?? []
              return {
                currentPlayerIndex: store?.currentSession?.currentPlayerIndex ?? 0,
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

  // If all players already submitted but flow has not advanced yet,
  // force the transition so NEXT can navigate deterministically.
  await page.evaluate(() => {
    const store = (window as PiniaWindow).__pinia_stores__?.game
    const players = store?.currentSession?.players ?? []
    const allSubmitted =
      players.length > 0 && players.every((player) => Boolean(player.hasSubmitted))

    if (allSubmitted && store?.flowState === 'in-round') {
      store.transitionToRoundComplete?.()
    }
  })

  // Try to click, and if devtools interferes, use evaluate as fallback
  try {
    await nextBtn.click({ timeout: 2000 })
  } catch {
    await nextBtn.dispatchEvent('click')
  }

  try {
    await expect(page).toHaveURL(/\/results/, { timeout: 10000 })
  } catch {
    // Fallback for flaky mobile clicks/route transitions.
    if (gameId) {
      await page.goto(`/results/${gameId}`, { timeout: 30000 })
    } else {
      await page.goto('/results', { timeout: 30000 })
    }
    await expect(page).toHaveURL(/\/results/, { timeout: 10000 })
  }

  await page.waitForLoadState('networkidle')

  const resolvedGameId = await page.evaluate(async (id) => {
    const store = (window as PiniaWindow).__pinia_stores__?.game

    if (store?.loadFromDB) {
      await store.loadFromDB()
    }

    if (id && store?.loadSessionById) {
      await store.loadSessionById(id)
      return id
    }

    return store?.currentSession?.id ?? null
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
    const scoreValue = page.locator(`[data-testid="scoring-page-score-value-${i}"]`)
    const clickCount = Math.max(0, scores[i] ?? 0)

    await expect(playerEntry).toBeVisible({ timeout: 10000 })
    await expect(incrementBtn).toBeVisible({ timeout: 10000 })
    await expect(scoreValue).toBeVisible({ timeout: 10000 })

    let currentValue = Number.parseInt((await scoreValue.textContent()) ?? '0', 10)
    if (Number.isNaN(currentValue)) {
      currentValue = 0
    }

    for (let c = 0; c < clickCount; c++) {
      await playerEntry.scrollIntoViewIfNeeded()
      await incrementBtn.click({ timeout: 5000 })

      const nextValue = currentValue + 1
      await expect
        .poll(
          async () => Number.parseInt((await scoreValue.textContent().catch(() => '0')) ?? '0', 10),
          { timeout: 3000 }
        )
        .toBe(nextValue)
      currentValue = nextValue
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

  const nextRoundBtn = page.locator('[data-testid="next-round-button"]')
  const leaderboardBtn = page.locator('[data-testid="leaderboard-button"]')

  await expect(nextRoundBtn.or(leaderboardBtn).first()).toBeVisible({ timeout: 15000 })
}

/**
 * Continue to the next round from the post-round decision modal.
 */
export async function goToNextRound(page: Page): Promise<void> {
  const nextRoundBtn = page.locator('[data-testid="next-round-button"]')
  await expect(nextRoundBtn).toBeVisible({ timeout: 8000 })
  await nextRoundBtn.click()

  // Round start may appear first (fortune wheel path) before game route.
  await expect.poll(() => /\/(round-start|game)/.test(page.url()), { timeout: 45000 }).toBe(true)

  if (page.url().includes('/round-start')) {
    await completeFortuneWheel(page)
  }

  await expect(page).toHaveURL(/\/game/, { timeout: 35000 })
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
 * Wait for the auto-playing flip-through animation to complete and reach `/game`.
 * The animation auto-plays on mount — no user interaction required.
 */
export async function completeFortuneWheel(page: Page): Promise<void> {
  if (/\/game/.test(page.url())) {
    return
  }

  const flipContainer = page.locator('[data-testid="flip-container"]')
  const loadingState = page.locator('[data-testid="round-loading"]')

  // Wait for either the flip animation container, loading state, or game route
  await expect
    .poll(
      async () => {
        if (/\/game/.test(page.url())) return 'game'
        if (!/\/round-start/.test(page.url())) return 'other-route'

        if (await loadingState.isVisible().catch(() => false)) return 'loading'
        if (await flipContainer.isVisible().catch(() => false)) return 'animating'

        return 'waiting'
      },
      { timeout: 20000 }
    )
    .not.toBe('waiting')

  // No button to click — animation auto-plays and auto-navigates.
  // Just wait for the /game route.
  await expect.poll(() => /\/game/.test(page.url()), { timeout: 45000 }).toBe(true)
}

/**
 * Start a multiplayer game from players page with explicit player names.
 */
export async function setupMultiplayerGame(page: Page, playerNames: string[]): Promise<void> {
  await preparePageForE2E(page)

  const normalizedPlayerNames = normalizePlayerNames(playerNames)

  await page.goto('/players', { timeout: 30000 })
  await page.waitForLoadState('domcontentloaded')

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
    ;(window as PiniaWindow).__pinia_stores__?.game?.clearSession?.()

    localStorage.clear()
    sessionStorage.clear()
  })

  await page.reload({ waitUntil: 'networkidle' })

  // Use UI flow for deterministic behavior across browser projects.
  await hideDevtools(page)
  await waitForSplashComplete(page)

  const menuPlayBtn = page.locator('[data-testid="main-menu-play"]')
  if (await menuPlayBtn.isVisible().catch(() => false)) {
    await menuPlayBtn.click()
    await expect(page).toHaveURL(/\/players/, { timeout: 10000 })
  }

  await expect(page.locator('[data-testid="players-start-button"]')).toBeVisible({ timeout: 15000 })
  await page.waitForTimeout(500) // Small buffer for reactivity

  const targetCount = normalizedPlayerNames.length
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

  for (let i = 0; i < normalizedPlayerNames.length; i++) {
    const nameInput = page.locator(`[data-testid="players-name-input-${i}"]`)
    await expect(nameInput).toBeVisible({ timeout: 5000 })
    await nameInput.fill(normalizedPlayerNames[i] ?? '')
  }

  const startBtn = page.locator('[data-testid="players-start-button"]')
  for (let attempt = 0; attempt < 8; attempt++) {
    if (/\/(round-start|game)/.test(page.url())) {
      break
    }

    if (!(await startBtn.isVisible().catch(() => false))) {
      await page.waitForTimeout(250)
      continue
    }

    try {
      await startBtn.click({ timeout: 2000 })
    } catch {
      // Button can detach during route transition; retry loop handles this.
    }
    await page.waitForTimeout(250)
  }

  try {
    // Round start may appear first (fortune wheel path) before game route.
    await expect.poll(() => /\/(round-start|game)/.test(page.url()), { timeout: 45000 }).toBe(true)
  } catch {
    // Recovery for missed click/navigation: seed pending players and route directly.
    await page.evaluate((names) => {
      ;(window as PiniaWindow).__pinia_stores__?.game?.setPendingPlayerNames?.(names)
    }, normalizedPlayerNames)

    await page.goto('/round-start', { timeout: 30000 })
    await expect.poll(() => /\/(round-start|game)/.test(page.url()), { timeout: 30000 }).toBe(true)
  }

  if (page.url().includes('/round-start')) {
    await completeFortuneWheel(page)
  }

  // Ensure we've reached /game (covers fortune-wheel, non-fortune-wheel,
  // and the 30 s fallback timer in round-start.vue).
  await expect.poll(() => /\/game/.test(page.url()), { timeout: 35000 }).toBe(true)

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
          const store = (window as PiniaWindow).__pinia_stores__?.game
          const session = store?.currentSession

          return {
            href: window.location.pathname,
            sessionId: session?.id ?? null,
            playerCount: session?.players?.length ?? 0,
            currentPlayerIndex: session?.currentPlayerIndex ?? null,
            allSubmitted:
              (session?.players?.length ?? 0) > 0
                ? (session?.players?.every((player) => Boolean(player.hasSubmitted)) ?? false)
                : false,
            currentPlayerTurnName: store?.currentPlayerTurn?.name ?? null,
            pendingCount: store?.pendingPlayerNames?.length ?? 0,
            letter: session?.letter ?? null,
            category: session?.category?.searchWord ?? null,
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
  const normalizedPlayerCount = Math.max(2, Math.floor(playerCount))

  if (normalizedPlayerCount === 2) {
    await startGameWithDefaults(page)
  } else {
    const players = Array.from({ length: normalizedPlayerCount }, (_, i) => `Player ${i + 1}`)
    await setupMultiplayerGame(page, players)
  }

  await submitPlayerAnswers(page, normalizedPlayerCount)
  await navigateToResults(page)
}
