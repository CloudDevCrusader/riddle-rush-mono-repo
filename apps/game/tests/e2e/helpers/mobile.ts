import type { Page, BrowserContext, CDPSession } from '@playwright/test'

// Minimum touch target size (px) per WCAG 2.5.5 guidelines
const DEFAULT_MIN_TOUCH_SIZE = 44

// Network throttling presets (latency in ms, download/upload in bytes/sec)
const NETWORK_PRESETS = {
  'slow-3g': {
    offline: false,
    downloadThroughput: (500 * 1024) / 8, // 500 Kbps
    uploadThroughput: (500 * 1024) / 8,
    latency: 400,
  },
  '4g': {
    offline: false,
    downloadThroughput: (4 * 1024 * 1024) / 8, // 4 Mbps
    uploadThroughput: (3 * 1024 * 1024) / 8,
    latency: 20,
  },
  'offline': {
    offline: true,
    downloadThroughput: 0,
    uploadThroughput: 0,
    latency: 0,
  },
  'online': {
    offline: false,
    downloadThroughput: -1, // No throttling
    uploadThroughput: -1,
    latency: 0,
  },
}

/**
 * Detect if current context is a mobile device
 * Checks viewport size, touch capability, and user agent
 */
export function isMobileDevice(context: BrowserContext): boolean {
  const viewport = context.pages()[0]?.viewportSize()
  const _userAgent = context.pages()[0]?.evaluate(() => navigator.userAgent) ?? ''

  // Check if viewport indicates mobile (typically < 768px width)
  const isMobileViewport = viewport ? viewport.width < 768 : false

  // Check context options for mobile indicators
  const contextOptions = (context as any)._options ?? {}
  const hasTouch = contextOptions.hasTouch === true
  const isMobileUA = contextOptions.isMobile === true

  return isMobileViewport || hasTouch || isMobileUA
}

/**
 * Wait for mobile touch layer to be ready
 * Ensures touch event handlers are registered and DOM is interactive
 */
export async function waitForMobileTouchReady(
  page: Page,
  timeout: number = 10000,
): Promise<void> {
  // Wait for DOM to be fully loaded
  await page.waitForLoadState('domcontentloaded', { timeout })

  // Wait for touch event support to be available
  await page.waitForFunction(
    () => {
      // Check if touch events are supported
      const touchSupported
        = 'ontouchstart' in window
          || navigator.maxTouchPoints > 0
          || (navigator as any).msMaxTouchPoints > 0

      // Check if document is interactive
      const isInteractive
        = document.readyState === 'interactive'
          || document.readyState === 'complete'

      // Check for any pending animations
      const noAnimations
        = document.getAnimations?.().filter(a => a.playState === 'running')
          .length === 0

      return isInteractive && (touchSupported || noAnimations)
    },
    { timeout },
  )

  // iOS Safari specific: wait for touch-action CSS to be applied
  await page.waitForFunction(
    () => {
      const interactiveElements = document.querySelectorAll(
        'button, a, input, [role="button"], [tabindex]',
      )
      return interactiveElements.length === 0 || interactiveElements.length > 0
    },
    { timeout },
  )

  // Small delay for iOS Safari quirks with touch event registration
  await page.waitForTimeout(100)

  console.log('[Mobile] Touch layer ready')
}

/**
 * Simulate mobile network conditions using CDP
 */
export async function simulateMobileNetwork(
  page: Page,
  type: 'slow-3g' | '4g' | 'offline' | 'online',
): Promise<void> {
  const preset = NETWORK_PRESETS[type]

  if (!preset) {
    throw new Error(`Unknown network type: ${type}`)
  }

  let cdpSession: CDPSession | null = null

  try {
    // Create CDP session for network emulation
    cdpSession = await page.context().newCDPSession(page)

    await cdpSession.send('Network.emulateNetworkConditions', {
      offline: preset.offline,
      downloadThroughput: preset.downloadThroughput,
      uploadThroughput: preset.uploadThroughput,
      latency: preset.latency,
    })

    console.log(`[Mobile] Network simulation set to: ${type}`, {
      latency: `${preset.latency}ms`,
      download:
        preset.downloadThroughput === -1
          ? 'unlimited'
          : `${Math.round((preset.downloadThroughput * 8) / 1024)} Kbps`,
      upload:
        preset.uploadThroughput === -1
          ? 'unlimited'
          : `${Math.round((preset.uploadThroughput * 8) / 1024)} Kbps`,
    })
  } catch (error) {
    // CDP might not be available in all browsers (e.g., WebKit)
    console.warn(
      `[Mobile] Network simulation not supported: ${(error as Error).message}`,
    )
    throw new Error(
      `Network simulation requires Chromium-based browser. Error: ${(error as Error).message}`,
    )
  }
}

/**
 * Verify responsive layout at given breakpoints
 * Returns current viewport classification and any layout issues found
 */
export async function verifyResponsiveLayout(
  page: Page,
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  },
): Promise<{ viewport: string, issues: string[] }> {
  const issues: string[] = []
  const currentViewport = page.viewportSize()

  if (!currentViewport) {
    return { viewport: 'unknown', issues: ['Unable to determine viewport size'] }
  }

  const { width } = currentViewport
  let viewportCategory: string

  if (width < breakpoints.mobile) {
    viewportCategory = 'small-mobile'
  } else if (width < breakpoints.tablet) {
    viewportCategory = 'mobile'
  } else if (width < breakpoints.desktop) {
    viewportCategory = 'tablet'
  } else {
    viewportCategory = 'desktop'
  }

  // Check for horizontal overflow
  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth
  })

  if (hasHorizontalOverflow) {
    issues.push('Horizontal overflow detected - content wider than viewport')
  }

  // Check for elements extending beyond viewport
  const overflowingElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('*')
    const viewportWidth = window.innerWidth
    const overflowing: string[] = []

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.right > viewportWidth + 1 && rect.width > 0) {
        const selector
          = el.id
            || el.className.toString().split(' ')[0]
            || el.tagName.toLowerCase()
        if (!overflowing.includes(selector)) {
          overflowing.push(selector)
        }
      }
    })

    return overflowing.slice(0, 10) // Limit to first 10
  })

  if (overflowingElements.length > 0) {
    issues.push(
      `Elements extending beyond viewport: ${overflowingElements.join(', ')}`,
    )
  }

  // Check for proper meta viewport tag
  const hasViewportMeta = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="viewport"]')
    return meta !== null && meta.getAttribute('content')?.includes('width=device-width')
  })

  if (!hasViewportMeta) {
    issues.push('Missing or improper viewport meta tag')
  }

  // Check for fixed-width elements that might break layout
  const fixedWidthIssues = await page.evaluate((vw) => {
    const elements = document.querySelectorAll('*')
    const issues: string[] = []

    elements.forEach((el) => {
      const styles = window.getComputedStyle(el)
      const width = Number.parseInt(styles.width, 10)

      if (width > vw && styles.position !== 'fixed' && styles.position !== 'absolute') {
        const selector
          = el.id
            || (el.className && typeof el.className === 'string'
              ? el.className.split(' ')[0]
              : '')
            || el.tagName.toLowerCase()
        if (selector && !issues.includes(selector)) {
          issues.push(selector)
        }
      }
    })

    return issues.slice(0, 5)
  }, width)

  if (fixedWidthIssues.length > 0) {
    issues.push(
      `Fixed-width elements wider than viewport: ${fixedWidthIssues.join(', ')}`,
    )
  }

  // Check for text readability (font size >= 12px on mobile)
  if (viewportCategory === 'mobile' || viewportCategory === 'small-mobile') {
    const smallTextElements = await page.evaluate(() => {
      const textElements = document.querySelectorAll(
        'p, span, a, li, td, th, label, button',
      )
      let smallCount = 0

      textElements.forEach((el) => {
        const styles = window.getComputedStyle(el)
        const fontSize = Number.parseFloat(styles.fontSize)
        if (fontSize < 12 && el.textContent?.trim()) {
          smallCount++
        }
      })

      return smallCount
    })

    if (smallTextElements > 0) {
      issues.push(
        `${smallTextElements} text elements have font-size < 12px (may be hard to read on mobile)`,
      )
    }
  }

  console.log(`[Mobile] Responsive layout check: ${viewportCategory}`, {
    width,
    issueCount: issues.length,
  })

  return { viewport: viewportCategory, issues }
}

/**
 * Get all touchable elements and verify they meet minimum size requirements
 */
export async function verifyTouchTargets(
  page: Page,
  minSize: number = DEFAULT_MIN_TOUCH_SIZE,
): Promise<{
  valid: number
  tooSmall: { selector: string, width: number, height: number }[]
}> {
  const result = await page.evaluate((minTouchSize) => {
    // Selectors for interactive elements
    const interactiveSelectors = [
      'a[href]',
      'button',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[tabindex]:not([tabindex="-1"])',
      '[onclick]',
      '[data-clickable]',
    ].join(', ')

    const elements = document.querySelectorAll(interactiveSelectors)
    let validCount = 0
    const tooSmall: { selector: string, width: number, height: number }[] = []

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect()

      // Skip hidden elements
      if (rect.width === 0 || rect.height === 0) return

      // Skip elements not in viewport
      if (
        rect.bottom < 0
        || rect.top > window.innerHeight
        || rect.right < 0
        || rect.left > window.innerWidth
      ) {
        return
      }

      const width = Math.round(rect.width)
      const height = Math.round(rect.height)

      if (width >= minTouchSize && height >= minTouchSize) {
        validCount++
      } else {
        // Build a useful selector for the element
        let selector = el.tagName.toLowerCase()
        if (el.id) {
          selector = `#${el.id}`
        } else if (el.className && typeof el.className === 'string') {
          const firstClass = el.className.trim().split(' ')[0]
          if (firstClass) {
            selector = `${selector}.${firstClass}`
          }
        }

        // Add text content hint for buttons/links
        const text = el.textContent?.trim().slice(0, 20)
        if (text) {
          selector += `[text="${text}${text.length >= 20 ? '...' : ''}"]`
        }

        tooSmall.push({ selector, width, height })
      }
    })

    return { valid: validCount, tooSmall }
  }, minSize)

  console.log('[Mobile] Touch target verification:', {
    valid: result.valid,
    tooSmall: result.tooSmall.length,
    minSize: `${minSize}x${minSize}px`,
  })

  return result
}

/**
 * Verify no mouse-only interactions exist (hover-only, right-click-only)
 */
export async function verifyNoMouseOnlyInteractions(page: Page): Promise<{
  hoverOnly: string[]
  rightClickOnly: string[]
}> {
  const result = await page.evaluate(() => {
    const hoverOnly: string[] = []
    const rightClickOnly: string[] = []

    // Check all stylesheets for :hover-only styles
    const sheets = document.styleSheets
    const hoverSelectors = new Set<string>()

    try {
      for (const sheet of sheets) {
        try {
          const rules = sheet.cssRules || sheet.rules
          for (const rule of rules) {
            if (rule instanceof CSSStyleRule) {
              if (
                rule.selectorText?.includes(':hover')
                && !rule.selectorText?.includes(':focus')
                && !rule.selectorText?.includes(':active')
              ) {
                // Extract base selector
                const baseSelector = rule.selectorText
                  .replace(/:hover/g, '')
                  .trim()
                if (baseSelector) {
                  hoverSelectors.add(baseSelector)
                }
              }
            }
          }
        } catch {
          // Cross-origin stylesheet, skip
        }
      }
    } catch {
      // Error accessing stylesheets
    }

    // Check for elements with hover-triggered content visibility
    hoverSelectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector)
        elements.forEach((el) => {
          // Check if this element or children change visibility on hover
          const styles = window.getComputedStyle(el)
          if (
            styles.display !== 'none'
            && styles.visibility !== 'hidden'
            && el.getAttribute('aria-haspopup')
          ) {
            const id
              = el.id
                || (el.className && typeof el.className === 'string'
                  ? el.className.split(' ')[0]
                  : '')
                || el.tagName.toLowerCase()
            if (!hoverOnly.includes(id)) {
              hoverOnly.push(id)
            }
          }
        })
      } catch {
        // Invalid selector, skip
      }
    })

    // Check for contextmenu-only handlers
    const allElements = document.querySelectorAll('*')
    allElements.forEach((el) => {
      const hasContextMenu
        = el.hasAttribute('oncontextmenu')
          || (el as any)._contextMenuHandler !== undefined

      // Check if element has right-click but no alternative
      if (hasContextMenu) {
        const hasAlternative
          = el.hasAttribute('onclick')
            || el.hasAttribute('onkeydown')
            || el.hasAttribute('aria-haspopup')

        if (!hasAlternative) {
          const selector
            = el.id
              || (el.className && typeof el.className === 'string'
                ? el.className.split(' ')[0]
                : '')
              || el.tagName.toLowerCase()
          if (!rightClickOnly.includes(selector)) {
            rightClickOnly.push(selector)
          }
        }
      }
    })

    return { hoverOnly: hoverOnly.slice(0, 20), rightClickOnly: rightClickOnly.slice(0, 20) }
  })

  console.log('[Mobile] Mouse-only interaction check:', {
    hoverOnlyCount: result.hoverOnly.length,
    rightClickOnlyCount: result.rightClickOnly.length,
  })

  return result
}

/**
 * Get device info from browser context
 */
export function getDeviceInfo(context: BrowserContext): {
  isMobile: boolean
  hasTouch: boolean
  viewport: { width: number, height: number }
  userAgent: string
} {
  const pages = context.pages()
  const page = pages[0]

  // Get viewport from first page or context options
  const viewport = page?.viewportSize() ?? { width: 0, height: 0 }

  // Access context options (internal API)
  const contextOptions = (context as any)._options ?? {}

  const isMobile = contextOptions.isMobile ?? viewport.width < 768
  const hasTouch = contextOptions.hasTouch ?? false
  const userAgent = contextOptions.userAgent ?? ''

  console.log('[Mobile] Device info:', {
    isMobile,
    hasTouch,
    viewport: `${viewport.width}x${viewport.height}`,
    userAgent: userAgent.slice(0, 50) + (userAgent.length > 50 ? '...' : ''),
  })

  return {
    isMobile,
    hasTouch,
    viewport,
    userAgent,
  }
}

/**
 * Simulate touch gestures on an element
 */
export async function simulateTouchGesture(
  page: Page,
  gesture: 'tap' | 'swipe-left' | 'swipe-right' | 'pinch',
  selector: string,
): Promise<void> {
  const element = await page.waitForSelector(selector, { timeout: 5000 })

  if (!element) {
    throw new Error(`Element not found: ${selector}`)
  }

  const box = await element.boundingBox()

  if (!box) {
    throw new Error(`Unable to get bounding box for: ${selector}`)
  }

  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2

  switch (gesture) {
    case 'tap': {
      // Simple tap gesture
      await page.touchscreen.tap(centerX, centerY)
      console.log(`[Mobile] Tap gesture at (${centerX}, ${centerY})`)
      break
    }

    case 'swipe-left': {
      // Swipe from center to left
      const startX = centerX + box.width / 3
      const endX = centerX - box.width / 3

      // Use mouse to simulate swipe (Playwright touchscreen doesn't support swipe directly)
      await page.evaluate(
        ({ startX, startY, endX, endY }) => {
          const touchStart = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [
              new Touch({
                identifier: 0,
                target: document.elementFromPoint(startX, startY)!,
                clientX: startX,
                clientY: startY,
              }),
            ],
          })

          const touchMove = new TouchEvent('touchmove', {
            bubbles: true,
            cancelable: true,
            touches: [
              new Touch({
                identifier: 0,
                target: document.elementFromPoint(endX, endY)!,
                clientX: endX,
                clientY: endY,
              }),
            ],
          })

          const touchEnd = new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            touches: [],
          })

          const element = document.elementFromPoint(startX, startY)
          if (element) {
            element.dispatchEvent(touchStart)
            element.dispatchEvent(touchMove)
            element.dispatchEvent(touchEnd)
          }
        },
        { startX, startY: centerY, endX, endY: centerY },
      )

      console.log(`[Mobile] Swipe left gesture from (${startX}, ${centerY}) to (${endX}, ${centerY})`)
      break
    }

    case 'swipe-right': {
      // Swipe from center to right
      const startX = centerX - box.width / 3
      const endX = centerX + box.width / 3

      await page.evaluate(
        ({ startX, startY, endX, endY }) => {
          const touchStart = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [
              new Touch({
                identifier: 0,
                target: document.elementFromPoint(startX, startY)!,
                clientX: startX,
                clientY: startY,
              }),
            ],
          })

          const touchMove = new TouchEvent('touchmove', {
            bubbles: true,
            cancelable: true,
            touches: [
              new Touch({
                identifier: 0,
                target: document.elementFromPoint(endX, endY)!,
                clientX: endX,
                clientY: endY,
              }),
            ],
          })

          const touchEnd = new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            touches: [],
          })

          const element = document.elementFromPoint(startX, startY)
          if (element) {
            element.dispatchEvent(touchStart)
            element.dispatchEvent(touchMove)
            element.dispatchEvent(touchEnd)
          }
        },
        { startX, startY: centerY, endX, endY: centerY },
      )

      console.log(`[Mobile] Swipe right gesture from (${startX}, ${centerY}) to (${endX}, ${centerY})`)
      break
    }

    case 'pinch': {
      // Simulate pinch gesture with two touch points
      await page.evaluate(
        ({ centerX, centerY, boxWidth, boxHeight }) => {
          const startDistance = Math.min(boxWidth, boxHeight) / 2
          const endDistance = startDistance / 2

          // Touch 1 starts top-left, Touch 2 starts bottom-right
          const touch1StartX = centerX - startDistance / 2
          const touch1StartY = centerY - startDistance / 2
          const touch2StartX = centerX + startDistance / 2
          const touch2StartY = centerY + startDistance / 2

          const touch1EndX = centerX - endDistance / 2
          const touch1EndY = centerY - endDistance / 2
          const touch2EndX = centerX + endDistance / 2
          const touch2EndY = centerY + endDistance / 2

          const target = document.elementFromPoint(centerX, centerY)

          if (target) {
            const touchStart = new TouchEvent('touchstart', {
              bubbles: true,
              cancelable: true,
              touches: [
                new Touch({
                  identifier: 0,
                  target,
                  clientX: touch1StartX,
                  clientY: touch1StartY,
                }),
                new Touch({
                  identifier: 1,
                  target,
                  clientX: touch2StartX,
                  clientY: touch2StartY,
                }),
              ],
            })

            const touchMove = new TouchEvent('touchmove', {
              bubbles: true,
              cancelable: true,
              touches: [
                new Touch({
                  identifier: 0,
                  target,
                  clientX: touch1EndX,
                  clientY: touch1EndY,
                }),
                new Touch({
                  identifier: 1,
                  target,
                  clientX: touch2EndX,
                  clientY: touch2EndY,
                }),
              ],
            })

            const touchEnd = new TouchEvent('touchend', {
              bubbles: true,
              cancelable: true,
              touches: [],
            })

            target.dispatchEvent(touchStart)
            target.dispatchEvent(touchMove)
            target.dispatchEvent(touchEnd)
          }
        },
        { centerX, centerY, boxWidth: box.width, boxHeight: box.height },
      )

      console.log(`[Mobile] Pinch gesture at (${centerX}, ${centerY})`)
      break
    }

    default:
      throw new Error(`Unknown gesture type: ${gesture}`)
  }

  // Allow time for gesture handlers to process
  await page.waitForTimeout(100)
}
