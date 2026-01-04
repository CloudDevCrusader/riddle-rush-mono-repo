import { expect } from '@playwright/test'
import type { Page, Locator } from '@playwright/test'

/**
 * E2E Test Helpers
 *
 * Provides graceful, reusable utilities for E2E tests with proper waiting strategies,
 * error handling, and retry logic.
 */

// Timeout constants (in milliseconds)
const isCI = !!process.env.CI
const timeoutScale = isCI ? 0.75 : 1
const scaleTimeout = (value: number) => Math.round(value * timeoutScale)

export const TIMEOUTS = {
  SHORT: scaleTimeout(2000),
  MEDIUM: scaleTimeout(5000),
  LONG: scaleTimeout(15000),
  VERY_LONG: scaleTimeout(30000),
  NAVIGATION: scaleTimeout(20000),
  ANIMATION: scaleTimeout(2000),
  NETWORK: scaleTimeout(5000),
} as const

/**
 * Wait for page to be fully loaded and ready
 */
export async function waitForPageReady(
  page: Page,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout })
  // Wait for Vue app to mount (check for #__nuxt to have content or body to have interactive content)
  try {
    await page.waitForFunction(
      () => {
        const nuxt = document.getElementById('__nuxt')
        // Check if Nuxt container has content OR if body has interactive elements
        return (nuxt && nuxt.children.length > 0) || document.body.children.length > 1
      },
      { timeout: Math.min(timeout, 15000) }
    )
  } catch {
    // If Vue mounting check fails, wait a bit and continue - the page might still be loading
    await page.waitForTimeout(1000)
  }
  // Wait for network to be idle (but don't fail if it takes too long)
  try {
    await page.waitForLoadState('networkidle', { timeout: Math.min(timeout, 10000) })
  } catch {
    // Network might not be idle, that's okay for client-side apps
  }
}

/**
 * Wait for splash screen to disappear gracefully
 */
export async function waitForSplashScreen(
  page: Page,
  timeout: number = TIMEOUTS.LONG
): Promise<void> {
  const splashScreen = page.locator('.splash-screen')

  try {
    // First check if splash screen exists
    const exists = (await splashScreen.count()) > 0
    if (!exists) {
      return // Already gone
    }

    // Wait for it to be hidden
    await splashScreen.waitFor({ state: 'hidden', timeout })
  } catch {
    // Splash screen might already be gone or not present
    // This is fine, continue
  }
}

/**
 * Wait for element to be visible with retry logic
 */
export async function waitForVisible(
  locator: Locator,
  options: { timeout?: number; retries?: number } = {}
): Promise<Locator> {
  const { timeout = TIMEOUTS.MEDIUM, retries = 3 } = options

  for (let i = 0; i < retries; i++) {
    try {
      await expect(locator).toBeVisible({ timeout })
      return locator
    } catch (error) {
      if (i === retries - 1) {
        throw error
      }
      // Wait a bit before retrying
      await locator.page().waitForTimeout(500)
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error('Retry operation failed unexpectedly')
}

/**
 * Wait for element to be hidden
 */
export async function waitForHidden(
  locator: Locator,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  try {
    await locator.waitFor({ state: 'hidden', timeout })
  } catch (error) {
    // Element might not exist or already hidden, which is fine
    const count = await locator.count()
    if (count === 0) {
      return // Element doesn't exist, consider it hidden
    }
    throw error
  }
}

/**
 * Click element with retry and proper waiting
 */
export async function clickWithRetry(
  locator: Locator,
  options: { timeout?: number; retries?: number; waitAfter?: number } = {}
): Promise<void> {
  const { timeout = TIMEOUTS.MEDIUM, retries = 3, waitAfter = 300 } = options

  // Wait for element to be visible and enabled
  await waitForVisible(locator, { timeout, retries })
  await expect(locator).toBeEnabled({ timeout: timeout / 2 })

  // Click with retry
  for (let i = 0; i < retries; i++) {
    try {
      await locator.click({ timeout: timeout / 2 })
      await locator.page().waitForTimeout(waitAfter) // Wait for any animations/transitions
      return
    } catch (error) {
      if (i === retries - 1) {
        throw error
      }
      await locator.page().waitForTimeout(500)
    }
  }
}

/**
 * Fill input with retry and validation
 */
export async function fillInput(
  locator: Locator,
  value: string,
  options: { timeout?: number; retries?: number; clear?: boolean } = {}
): Promise<void> {
  const { timeout = TIMEOUTS.MEDIUM, retries = 3, clear = true } = options

  await waitForVisible(locator, { timeout, retries })
  await expect(locator).toBeEnabled({ timeout: timeout / 2 })

  for (let i = 0; i < retries; i++) {
    try {
      if (clear) {
        await locator.clear({ timeout: timeout / 2 })
      }
      await locator.fill(value, { timeout: timeout / 2 })

      // Verify the value was set
      const actualValue = await locator.inputValue()
      if (actualValue === value) {
        return
      }
    } catch (error) {
      if (i === retries - 1) {
        throw error
      }
      await locator.page().waitForTimeout(500)
    }
  }
}

/**
 * Navigate to a page and wait for it to be ready
 */
export async function navigateTo(
  page: Page,
  url: string,
  options: { waitForReady?: boolean; timeout?: number } = {}
): Promise<void> {
  const { waitForReady = true, timeout = TIMEOUTS.NAVIGATION } = options

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout })

  if (waitForReady) {
    await waitForPageReady(page, timeout)

    // Wait for splash screen if on home page
    if (url === '/' || url.endsWith('/')) {
      await waitForSplashScreen(page, timeout)
    }

    // Additional wait for Vue to fully render (especially for client-side rendering)
    await page.waitForTimeout(500)
  }
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: RegExp | string,
  options: { timeout?: number } | number = TIMEOUTS.NAVIGATION
): Promise<void> {
  const timeout = typeof options === 'number' ? options : (options.timeout ?? TIMEOUTS.NAVIGATION)
  await expect(page).toHaveURL(urlPattern, { timeout })
  await waitForPageReady(page, timeout)
}

/**
 * Wait for URL to match pattern with retry
 */
export async function waitForUrl(
  page: Page,
  urlPattern: RegExp | string,
  timeout: number = TIMEOUTS.NAVIGATION
): Promise<void> {
  try {
    await expect(page).toHaveURL(urlPattern, { timeout })
  } catch {
    // Sometimes navigation takes a moment, wait a bit and check again
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(urlPattern, { timeout: timeout / 2 })
  }
}

/**
 * Wait for element count to match expected value
 */
export async function waitForCount(
  locator: Locator,
  expectedCount: number,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await expect(locator).toHaveCount(expectedCount, { timeout })
}

/**
 * Wait for text content to appear
 */
export async function waitForText(
  locator: Locator,
  text: string | RegExp,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await expect(locator).toContainText(text, { timeout })
}

/**
 * Get element text content safely
 */
export async function getTextContent(
  locator: Locator,
  options: { timeout?: number; fallback?: string } = {}
): Promise<string> {
  const { timeout = TIMEOUTS.SHORT, fallback = '' } = options

  try {
    await waitForVisible(locator, { timeout })
    const text = await locator.textContent()
    return text?.trim() || fallback
  } catch {
    return fallback
  }
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(
  locator: Locator,
  timeout: number = TIMEOUTS.SHORT
): Promise<boolean> {
  try {
    await locator.waitFor({ state: 'attached', timeout })
    return (await locator.count()) > 0
  } catch {
    return false
  }
}

/**
 * Check if element is visible without throwing
 */
export async function isVisible(
  locator: Locator,
  timeout: number = TIMEOUTS.SHORT
): Promise<boolean> {
  try {
    await expect(locator).toBeVisible({ timeout })
    return true
  } catch {
    return false
  }
}

/**
 * Wait for spinner/loading indicator to disappear
 */
export async function waitForLoadingComplete(
  page: Page,
  timeout: number = TIMEOUTS.LONG
): Promise<void> {
  const spinnerSelectors = [
    '.spinner--overlay',
    '[data-testid="loading-spinner"]',
    '.loading',
    '.spinner',
  ]

  for (const selector of spinnerSelectors) {
    const spinner = page.locator(selector)
    if (await elementExists(spinner)) {
      await waitForHidden(spinner, timeout)
    }
  }
}

/**
 * Wait for animation to complete
 */
export async function waitForAnimation(
  locator: Locator,
  timeout: number = TIMEOUTS.ANIMATION
): Promise<void> {
  // Wait for CSS animations/transitions to complete
  await locator.page().waitForTimeout(timeout)

  // Also wait for any ongoing animations
  await locator.evaluate((el) => {
    return new Promise<void>((resolve) => {
      const handleAnimationEnd = () => {
        resolve()
        el.removeEventListener('animationend', handleAnimationEnd)
        el.removeEventListener('transitionend', handleAnimationEnd)
      }

      el.addEventListener('animationend', handleAnimationEnd, { once: true })
      el.addEventListener('transitionend', handleAnimationEnd, { once: true })

      // Fallback timeout
      setTimeout(resolve, 2000)
    })
  })
}

/**
 * Retry an operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    retries?: number
    delay?: number
    onError?: (error: Error, attempt: number) => void
  } = {}
): Promise<T> {
  const { retries = 3, delay = 500, onError } = options

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (onError) {
        onError(error as Error, attempt)
      }

      if (attempt === retries) {
        throw error
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  throw new Error('Retry operation failed')
}

/**
 * Wait for network requests to complete
 */
export async function waitForNetworkIdle(
  page: Page,
  timeout: number = TIMEOUTS.NETWORK
): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout })
}

/**
 * Safe navigation - handles errors gracefully
 */
export async function safeNavigate(
  page: Page,
  url: string,
  options: { timeout?: number; retries?: number } = {}
): Promise<boolean> {
  const { timeout = TIMEOUTS.NAVIGATION, retries = 2 } = options

  return retryOperation(
    async () => {
      await navigateTo(page, url, { waitForReady: true, timeout })
      return true
    },
    { retries, delay: 1000 }
  )
}

/**
 * Get element by data-testid with fallback to class selector
 */
export function getTestElement(page: Page, testId: string, fallbackSelector?: string): Locator {
  const testIdSelector = `[data-testid="${testId}"]`

  // Try testid first, fallback to provided selector or testid as class
  if (fallbackSelector) {
    return page.locator(`${testIdSelector}, ${fallbackSelector}`).first()
  }

  return page.locator(testIdSelector)
}

/**
 * Wait for element to be enabled
 */
export async function waitForEnabled(
  locator: Locator,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await expect(locator).toBeEnabled({ timeout })
}

/**
 * Wait for element to be disabled
 */
export async function waitForDisabled(
  locator: Locator,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await expect(locator).toBeDisabled({ timeout })
}
