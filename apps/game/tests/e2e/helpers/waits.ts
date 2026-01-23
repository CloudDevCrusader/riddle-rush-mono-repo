import type { Page } from '@playwright/test'

// Default timeout values
const DEFAULT_TIMEOUT = 30000
const DEFAULT_IDLE_TIME = 500
const POLL_INTERVAL = 100

/**
 * Debug helper - logs current game state for troubleshooting
 */
async function logGameDebugInfo(page: Page, context: string): Promise<void> {
  try {
    const debugInfo = await page.evaluate(() => {
      const pinia = (window as any).__pinia__
      if (!pinia) {
        return { error: 'Pinia store not found' }
      }

      const gameStore = pinia._s?.get('game') || pinia.state?.value?.game
      const roundStore = pinia._s?.get('round') || pinia.state?.value?.round

      return {
        gameState: gameStore?.state || gameStore?.gameState || 'unknown',
        currentRound: roundStore?.currentRound || gameStore?.currentRound || 0,
        players: roundStore?.players?.length || gameStore?.players?.length || 0,
        roundState: roundStore?.state || roundStore?.roundState || 'unknown',
        timestamp: Date.now(),
      }
    })

    console.log(`[${context}] Game Debug Info:`, JSON.stringify(debugInfo, null, 2))
  } catch (error) {
    console.log(`[${context}] Failed to get debug info:`, error)
  }
}

/**
 * Exponential backoff delay calculator
 */
function getBackoffDelay(attempt: number, baseDelay: number = 100, maxDelay: number = 2000): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
  return delay + Math.random() * 50 // Add jitter
}

/**
 * Wait for specific game state in Pinia store
 */
export async function waitForGameState(
  page: Page,
  targetState: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  const startTime = Date.now()

  console.log(`[waitForGameState] Waiting for state: ${targetState}`)

  try {
    await page.waitForFunction(
      (state: string) => {
        const pinia = (window as any).__pinia__
        if (!pinia) return false

        // Try multiple ways to access the game store
        const gameStore = pinia._s?.get('game') || pinia.state?.value?.game
        if (!gameStore) return false

        const currentState = gameStore.state || gameStore.gameState
        return currentState === state
      },
      targetState,
      { timeout, polling: POLL_INTERVAL }
    )

    console.log(`[waitForGameState] Reached state: ${targetState} in ${Date.now() - startTime}ms`)
  } catch (error) {
    await logGameDebugInfo(page, 'waitForGameState:timeout')
    throw new Error(`Timeout waiting for game state "${targetState}" after ${timeout}ms. ${(error as Error).message}`)
  }
}

/**
 * Wait for round transition (current round ends, new round begins)
 */
export async function waitForRoundTransition(
  page: Page,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  const startTime = Date.now()

  console.log('[waitForRoundTransition] Waiting for round transition...')

  try {
    // First, capture the current round number
    const initialRound = await page.evaluate(() => {
      const pinia = (window as any).__pinia__
      if (!pinia) return 0

      const gameStore = pinia._s?.get('game') || pinia.state?.value?.game
      const roundStore = pinia._s?.get('round') || pinia.state?.value?.round

      return roundStore?.currentRound || gameStore?.currentRound || 0
    })

    console.log(`[waitForRoundTransition] Current round: ${initialRound}`)

    // Wait for round number to change
    await page.waitForFunction(
      (prevRound: number) => {
        const pinia = (window as any).__pinia__
        if (!pinia) return false

        const gameStore = pinia._s?.get('game') || pinia.state?.value?.game
        const roundStore = pinia._s?.get('round') || pinia.state?.value?.round

        const currentRound = roundStore?.currentRound || gameStore?.currentRound || 0
        return currentRound > prevRound
      },
      initialRound,
      { timeout, polling: POLL_INTERVAL }
    )

    const newRound = await page.evaluate(() => {
      const pinia = (window as any).__pinia__
      const gameStore = pinia?._s?.get('game') || pinia?.state?.value?.game
      const roundStore = pinia?._s?.get('round') || pinia?.state?.value?.round
      return roundStore?.currentRound || gameStore?.currentRound || 0
    })

    console.log(`[waitForRoundTransition] Transitioned to round ${newRound} in ${Date.now() - startTime}ms`)
  } catch (error) {
    await logGameDebugInfo(page, 'waitForRoundTransition:timeout')
    throw new Error(`Timeout waiting for round transition after ${timeout}ms. ${(error as Error).message}`)
  }
}

/**
 * Wait for CSS/JS animation to complete on element
 */
export async function waitForAnimationComplete(
  page: Page,
  selector: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  const startTime = Date.now()

  console.log(`[waitForAnimationComplete] Waiting for animation on: ${selector}`)

  try {
    // First ensure element exists
    await page.waitForSelector(selector, { timeout, state: 'attached' })

    // Wait for all animations to complete
    await page.waitForFunction(
      (sel: string) => {
        const element = document.querySelector(sel)
        if (!element) return false

        // Check CSS animations
        const animations = element.getAnimations()
        if (animations.length > 0) {
          return animations.every(anim => anim.playState === 'finished' || anim.playState === 'idle')
        }

        // Check for transition by monitoring computed styles
        const computedStyle = getComputedStyle(element)
        const transitionDuration = computedStyle.transitionDuration
        const animationDuration = computedStyle.animationDuration

        // If no transitions or animations defined, consider complete
        if (transitionDuration === '0s' && animationDuration === '0s') {
          return true
        }

        // Check if element has animating class patterns
        const hasAnimatingClass = element.classList.toString().match(/animat|transit|fade|slide/i)
        if (!hasAnimatingClass) {
          return true
        }

        return false
      },
      selector,
      { timeout, polling: POLL_INTERVAL }
    )

    console.log(`[waitForAnimationComplete] Animation complete in ${Date.now() - startTime}ms`)
  } catch (error) {
    console.log(`[waitForAnimationComplete] Timeout or error for selector: ${selector}`)
    throw new Error(`Timeout waiting for animation on "${selector}" after ${timeout}ms. ${(error as Error).message}`)
  }
}

/**
 * Wait for network idle with configurable threshold
 */
export async function waitForNetworkIdle(
  page: Page,
  options: { timeout?: number; idleTime?: number } = {}
): Promise<void> {
  const { timeout = DEFAULT_TIMEOUT, idleTime = DEFAULT_IDLE_TIME } = options
  const startTime = Date.now()

  console.log(`[waitForNetworkIdle] Waiting for network idle (${idleTime}ms threshold)...`)

  let pendingRequests = 0
  let lastActivityTime = Date.now()
  let resolvePromise: () => void
  let rejectPromise: (error: Error) => void

  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  const onRequest = () => {
    pendingRequests++
    lastActivityTime = Date.now()
  }

  const onRequestFinished = () => {
    pendingRequests = Math.max(0, pendingRequests - 1)
    lastActivityTime = Date.now()
  }

  const onRequestFailed = () => {
    pendingRequests = Math.max(0, pendingRequests - 1)
    lastActivityTime = Date.now()
  }

  page.on('request', onRequest)
  page.on('requestfinished', onRequestFinished)
  page.on('requestfailed', onRequestFailed)

  const checkInterval = setInterval(() => {
    const now = Date.now()
    const elapsed = now - startTime

    if (elapsed > timeout) {
      clearInterval(checkInterval)
      cleanup()
      rejectPromise(new Error(`Network idle timeout after ${timeout}ms. Pending requests: ${pendingRequests}`))
      return
    }

    if (pendingRequests === 0 && now - lastActivityTime >= idleTime) {
      clearInterval(checkInterval)
      cleanup()
      console.log(`[waitForNetworkIdle] Network idle achieved in ${elapsed}ms`)
      resolvePromise()
    }
  }, 50)

  const cleanup = () => {
    page.off('request', onRequest)
    page.off('requestfinished', onRequestFinished)
    page.off('requestfailed', onRequestFailed)
  }

  return promise
}

/**
 * Wait for specific asset to load
 */
export async function waitForAssetLoad(
  page: Page,
  assetSrc: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  const startTime = Date.now()

  console.log(`[waitForAssetLoad] Waiting for asset: ${assetSrc}`)

  let attempt = 0
  const maxAttempts = Math.ceil(timeout / POLL_INTERVAL)

  while (attempt < maxAttempts) {
    try {
      const loaded = await page.evaluate((src: string) => {
        // Check for images
        const images = Array.from(document.querySelectorAll('img'))
        const matchingImage = images.find(img => img.src.includes(src) || img.dataset.src?.includes(src))
        if (matchingImage) {
          return matchingImage.complete && matchingImage.naturalHeight > 0
        }

        // Check for audio/video
        const media = Array.from(document.querySelectorAll('audio, video'))
        const matchingMedia = media.find(m => (m as HTMLMediaElement).src.includes(src))
        if (matchingMedia) {
          return (matchingMedia as HTMLMediaElement).readyState >= 2 // HAVE_CURRENT_DATA
        }

        // Check for loaded scripts
        const scripts = Array.from(document.querySelectorAll('script'))
        const matchingScript = scripts.find(s => s.src.includes(src))
        if (matchingScript) {
          return true // Scripts are loaded if they exist in DOM
        }

        // Check for stylesheets
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        const matchingLink = links.find(l => (l as HTMLLinkElement).href.includes(src))
        if (matchingLink) {
          const sheet = (matchingLink as HTMLLinkElement).sheet
          return sheet !== null
        }

        // Check performance entries for any resource
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
        return entries.some(entry => entry.name.includes(src) && entry.responseEnd > 0)
      }, assetSrc)

      if (loaded) {
        console.log(`[waitForAssetLoad] Asset loaded in ${Date.now() - startTime}ms`)
        return
      }
    } catch {
      // Continue polling
    }

    await page.waitForTimeout(getBackoffDelay(attempt, 50, 500))
    attempt++
  }

  throw new Error(`Timeout waiting for asset "${assetSrc}" to load after ${timeout}ms`)
}

/**
 * Wait for page to be fully ready (hydration + network + assets)
 */
export async function waitForPageReady(
  page: Page,
  selector: string,
  options: { timeout?: number; checkAssets?: boolean } = {}
): Promise<void> {
  const { timeout = DEFAULT_TIMEOUT, checkAssets = true } = options
  const startTime = Date.now()

  console.log(`[waitForPageReady] Waiting for page ready with selector: ${selector}`)

  try {
    // 1. Wait for the main selector to be visible
    await page.waitForSelector(selector, { state: 'visible', timeout })

    // 2. Wait for Vue/Nuxt hydration to complete
    await page.waitForFunction(
      () => {
        // Check for Vue hydration
        const vueApp = (window as any).__vue_app__ || (window as any).__VUE_APP__
        if (vueApp) {
          return true
        }

        // Check for Nuxt hydration
        const nuxtApp = (window as any).__NUXT__ || (window as any).$nuxt
        if (nuxtApp) {
          // Check if Nuxt is fully hydrated
          if (nuxtApp.isHydrating === false || nuxtApp._hydrated === true) {
            return true
          }
        }

        // Check for Pinia being ready
        const pinia = (window as any).__pinia__
        if (pinia && pinia._s && pinia._s.size > 0) {
          return true
        }

        // Fallback: check if document is ready and no pending Vue transitions
        return document.readyState === 'complete'
      },
      { timeout: timeout - (Date.now() - startTime), polling: POLL_INTERVAL }
    )

    // 3. Wait for network to settle
    const remainingTimeout = timeout - (Date.now() - startTime)
    if (remainingTimeout > 0) {
      await waitForNetworkIdle(page, { timeout: Math.min(remainingTimeout, 5000), idleTime: 200 }).catch(() => {
        console.log('[waitForPageReady] Network idle timeout, continuing...')
      })
    }

    // 4. Optionally wait for critical assets
    if (checkAssets) {
      const remainingTimeout2 = timeout - (Date.now() - startTime)
      if (remainingTimeout2 > 0) {
        await page.waitForFunction(
          () => {
            const images = Array.from(document.querySelectorAll('img[src]:not([loading="lazy"])'))
            return images.every(img => (img as HTMLImageElement).complete)
          },
          { timeout: Math.min(remainingTimeout2, 3000), polling: POLL_INTERVAL }
        ).catch(() => {
          console.log('[waitForPageReady] Asset load timeout, continuing...')
        })
      }
    }

    console.log(`[waitForPageReady] Page ready in ${Date.now() - startTime}ms`)
  } catch (error) {
    await logGameDebugInfo(page, 'waitForPageReady:timeout')
    throw new Error(`Timeout waiting for page ready with selector "${selector}" after ${timeout}ms. ${(error as Error).message}`)
  }
}

/**
 * Wait for game round to complete (all answers submitted)
 */
export async function waitForRoundComplete(
  page: Page,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  const startTime = Date.now()

  console.log('[waitForRoundComplete] Waiting for round to complete...')

  try {
    await page.waitForFunction(
      () => {
        const pinia = (window as any).__pinia__
        if (!pinia) return false

        const gameStore = pinia._s?.get('game') || pinia.state?.value?.game
        const roundStore = pinia._s?.get('round') || pinia.state?.value?.round

        // Check various round completion indicators
        const roundState = roundStore?.state || roundStore?.roundState || gameStore?.roundState
        if (roundState === 'complete' || roundState === 'completed' || roundState === 'ended') {
          return true
        }

        // Check if all players have submitted
        const players = roundStore?.players || gameStore?.players || []
        const submissions = roundStore?.submissions || gameStore?.submissions || []

        if (players.length > 0 && submissions.length >= players.length) {
          return true
        }

        // Check for round complete DOM indicator
        const completeIndicator = document.querySelector('[data-round-complete]')
        if (completeIndicator) {
          return true
        }

        // Check for results display
        const resultsElement = document.querySelector('.round-results, [data-testid="round-results"]')
        if (resultsElement) {
          return true
        }

        return false
      },
      { timeout, polling: POLL_INTERVAL }
    )

    console.log(`[waitForRoundComplete] Round completed in ${Date.now() - startTime}ms`)
  } catch (error) {
    await logGameDebugInfo(page, 'waitForRoundComplete:timeout')
    throw new Error(`Timeout waiting for round completion after ${timeout}ms. ${(error as Error).message}`)
  }
}

/**
 * Wait for results page to be fully rendered
 */
export async function waitForResultsRendered(
  page: Page,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  const startTime = Date.now()

  console.log('[waitForResultsRendered] Waiting for results to render...')

  try {
    // Wait for results container
    await page.waitForFunction(
      () => {
        // Check for results page indicators
        const resultsSelectors = [
          '[data-testid="results-page"]',
          '[data-testid="game-results"]',
          '.results-container',
          '.game-results',
          '#results',
        ]

        const resultsElement = resultsSelectors
          .map(sel => document.querySelector(sel))
          .find(el => el !== null)

        if (!resultsElement) return false

        // Check if scores are displayed
        const scoreElements = document.querySelectorAll('[data-testid="player-score"], .player-score, .score')
        if (scoreElements.length === 0) return false

        // Check Pinia state
        const pinia = (window as any).__pinia__
        if (pinia) {
          const gameStore = pinia._s?.get('game') || pinia.state?.value?.game
          const state = gameStore?.state || gameStore?.gameState
          if (state === 'results' || state === 'finished' || state === 'ended') {
            return true
          }
        }

        // Fallback: results element visible and has content
        return resultsElement.children.length > 0
      },
      { timeout, polling: POLL_INTERVAL }
    )

    // Wait for any result animations to complete
    const remainingTimeout = timeout - (Date.now() - startTime)
    if (remainingTimeout > 500) {
      try {
        await page.waitForFunction(
          () => {
            const animatingElements = document.querySelectorAll('.animating, [data-animating="true"]')
            return animatingElements.length === 0
          },
          { timeout: Math.min(remainingTimeout, 2000), polling: 100 }
        )
      } catch {
        console.log('[waitForResultsRendered] Animation wait timeout, continuing...')
      }
    }

    console.log(`[waitForResultsRendered] Results rendered in ${Date.now() - startTime}ms`)
  } catch (error) {
    await logGameDebugInfo(page, 'waitForResultsRendered:timeout')
    throw new Error(`Timeout waiting for results to render after ${timeout}ms. ${(error as Error).message}`)
  }
}

/**
 * Debug helper - get current round state
 */
export async function getRoundState(
  page: Page
): Promise<{ round: number; state: string; players: number }> {
  const result = await page.evaluate(() => {
    const pinia = (window as any).__pinia__

    if (!pinia) {
      return { round: 0, state: 'unknown', players: 0, error: 'Pinia not found' }
    }

    const gameStore = pinia._s?.get('game') || pinia.state?.value?.game
    const roundStore = pinia._s?.get('round') || pinia.state?.value?.round

    const round = roundStore?.currentRound || gameStore?.currentRound || 0
    const state = roundStore?.state || roundStore?.roundState || gameStore?.state || gameStore?.gameState || 'unknown'
    const players = roundStore?.players?.length || gameStore?.players?.length || 0

    return { round, state, players }
  })

  console.log('[getRoundState]', JSON.stringify(result))

  return result
}

/**
 * Wait for WebSocket connection to be established
 */
export async function waitForWebSocketConnection(
  page: Page,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  const startTime = Date.now()

  console.log('[waitForWebSocketConnection] Waiting for WebSocket connection...')

  try {
    await page.waitForFunction(
      () => {
        // Check for common WebSocket state indicators
        const pinia = (window as any).__pinia__
        if (pinia) {
          const socketStore = pinia._s?.get('socket') || pinia._s?.get('websocket') || pinia.state?.value?.socket
          if (socketStore) {
            const connected = socketStore.connected || socketStore.isConnected || socketStore.status === 'connected'
            if (connected) return true
          }
        }

        // Check for global socket instance
        const socket = (window as any).$socket || (window as any).__socket__
        if (socket && (socket.connected || socket.readyState === 1)) {
          return true
        }

        // Check for socket.io
        const io = (window as any).io
        if (io && io.connected) {
          return true
        }

        return false
      },
      { timeout, polling: POLL_INTERVAL }
    )

    console.log(`[waitForWebSocketConnection] Connected in ${Date.now() - startTime}ms`)
  } catch (error) {
    await logGameDebugInfo(page, 'waitForWebSocketConnection:timeout')
    throw new Error(`Timeout waiting for WebSocket connection after ${timeout}ms. ${(error as Error).message}`)
  }
}

/**
 * Wait for a specific game event via WebSocket
 */
export async function waitForGameEvent(
  page: Page,
  eventName: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  const startTime = Date.now()

  console.log(`[waitForGameEvent] Waiting for event: ${eventName}`)

  // Inject event listener
  await page.evaluate((event: string) => {
    (window as any).__gameEventReceived__ = (window as any).__gameEventReceived__ || {}
    ;(window as any).__gameEventReceived__[event] = false

    // Try to hook into socket events
    const socket = (window as any).$socket || (window as any).__socket__
    if (socket && socket.on) {
      socket.on(event, () => {
        (window as any).__gameEventReceived__[event] = true
      })
    }
  }, eventName)

  try {
    await page.waitForFunction(
      (event: string) => {
        return (window as any).__gameEventReceived__?.[event] === true
      },
      eventName,
      { timeout, polling: POLL_INTERVAL }
    )

    console.log(`[waitForGameEvent] Event "${eventName}" received in ${Date.now() - startTime}ms`)
  } catch (error) {
    await logGameDebugInfo(page, `waitForGameEvent:${eventName}:timeout`)
    throw new Error(`Timeout waiting for game event "${eventName}" after ${timeout}ms. ${(error as Error).message}`)
  }
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number; maxDelay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 100, maxDelay = 2000 } = options

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      console.log(`[withRetry] Attempt ${attempt + 1} failed: ${lastError.message}`)

      if (attempt < maxRetries) {
        const delay = getBackoffDelay(attempt, baseDelay, maxDelay)
        console.log(`[withRetry] Retrying in ${Math.round(delay)}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`All ${maxRetries + 1} attempts failed. Last error: ${lastError?.message}`)
}
