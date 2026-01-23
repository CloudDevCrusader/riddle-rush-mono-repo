import type { Page, TestInfo } from '@playwright/test'

export interface GameStateSnapshot {
  timestamp: number
  url: string
  gameStore: unknown
  settingsStore: unknown
  route: string
  localStorage: Record<string, string>
  sessionStorage: Record<string, string>
}

export interface NetworkEntry {
  url: string
  method: string
  status: number
  duration: number
  size: number
  type: string
}

export interface BrowserMetrics {
  fcp: number | null
  lcp: number | null
  cls: number | null
  fid: number | null
  ttfb: number | null
  memory?: { usedJSHeapSize: number; totalJSHeapSize: number }
}

interface ConsoleCapture {
  start: () => void
  stop: () => string[]
  getLogs: () => string[]
}

interface NetworkCapture {
  start: () => void
  stop: () => NetworkEntry[]
  getEntries: () => NetworkEntry[]
}

interface DebugReport {
  gameState: GameStateSnapshot
  network: NetworkEntry[]
  metrics: BrowserMetrics
  console: string[]
  screenshot: string | null
}

interface StateDiff {
  changed: string[]
  added: string[]
  removed: string[]
}

/**
 * Capture complete game state snapshot for debugging
 */
export async function captureGameState(page: Page): Promise<GameStateSnapshot> {
  const timestamp = Date.now()
  const url = page.url()

  const stateData = await page.evaluate(() => {
    // Access Pinia stores from window (assumes stores are exposed for testing)
    const pinia = (window as unknown as { __pinia__?: { state: { value: Record<string, unknown> } } }).__pinia__
    let gameStore: unknown = null
    let settingsStore: unknown = null

    if (pinia?.state?.value) {
      gameStore = pinia.state.value.game ?? null
      settingsStore = pinia.state.value.settings ?? null
    }

    // Get current route from Vue Router if available
    const app = (window as unknown as { __app__?: { config: { globalProperties: { $router?: { currentRoute: { value: { fullPath: string } } } } } } }).__app__
    const route = app?.config?.globalProperties?.$router?.currentRoute?.value?.fullPath ?? window.location.pathname

    // Capture storage
    const localStorage: Record<string, string> = {}
    const sessionStorage: Record<string, string> = {}

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key) {
        localStorage[key] = window.localStorage.getItem(key) ?? ''
      }
    }

    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i)
      if (key) {
        sessionStorage[key] = window.sessionStorage.getItem(key) ?? ''
      }
    }

    return {
      gameStore,
      settingsStore,
      route,
      localStorage,
      sessionStorage,
    }
  })

  return {
    timestamp,
    url,
    ...stateData,
  }
}

/**
 * Capture network timeline during test execution
 */
export async function captureNetworkTimeline(page: Page): Promise<NetworkCapture> {
  const entries: NetworkEntry[] = []
  const requestTimings = new Map<string, number>()
  let isCapturing = false

  const onRequest = (request: { url: () => string }) => {
    if (!isCapturing) return
    requestTimings.set(request.url(), Date.now())
  }

  const onResponse = async (response: {
    url: () => string
    request: () => { method: () => string }
    status: () => number
    headers: () => Record<string, string>
  }) => {
    if (!isCapturing) return

    const url = response.url()
    const startTime = requestTimings.get(url)
    const duration = startTime ? Date.now() - startTime : 0

    // Determine response size from headers
    const headers = response.headers()
    const contentLength = headers['content-length']
    const size = contentLength ? parseInt(contentLength, 10) : 0

    // Determine resource type from content-type header
    const contentType = headers['content-type'] ?? ''
    let type = 'other'
    if (contentType.includes('application/json')) type = 'json'
    else if (contentType.includes('text/html')) type = 'document'
    else if (contentType.includes('text/css')) type = 'stylesheet'
    else if (contentType.includes('javascript')) type = 'script'
    else if (contentType.includes('image/')) type = 'image'
    else if (contentType.includes('font/')) type = 'font'

    entries.push({
      url,
      method: response.request().method(),
      status: response.status(),
      duration,
      size,
      type,
    })

    requestTimings.delete(url)
  }

  return {
    start: () => {
      isCapturing = true
      entries.length = 0
      requestTimings.clear()
      page.on('request', onRequest)
      page.on('response', onResponse)
    },
    stop: () => {
      isCapturing = false
      page.off('request', onRequest)
      page.off('response', onResponse)
      return [...entries]
    },
    getEntries: () => [...entries],
  }
}

/**
 * Get browser performance metrics (Core Web Vitals)
 */
export async function captureBrowserMetrics(page: Page): Promise<BrowserMetrics> {
  const metrics = await page.evaluate(() => {
    const result: BrowserMetrics = {
      fcp: null,
      lcp: null,
      cls: null,
      fid: null,
      ttfb: null,
    }

    // Get paint timing entries for FCP
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint')
    if (fcpEntry) {
      result.fcp = fcpEntry.startTime
    }

    // Get navigation timing for TTFB
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    const navTiming = navEntries[0]
    if (navTiming) {
      result.ttfb = navTiming.responseStart - navTiming.requestStart
    }

    // Get LCP from PerformanceObserver entries if available
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
    const lastLcp = lcpEntries[lcpEntries.length - 1]
    if (lastLcp) {
      result.lcp = lastLcp.startTime
    }

    // Get CLS from layout-shift entries
    const layoutShiftEntries = performance.getEntriesByType('layout-shift') as (PerformanceEntry & { hadRecentInput?: boolean; value?: number })[]
    let clsValue = 0
    for (const entry of layoutShiftEntries) {
      if (!entry.hadRecentInput && entry.value) {
        clsValue += entry.value
      }
    }
    result.cls = clsValue

    // Get memory info if available (Chrome only)
    const perfWithMemory = performance as Performance & {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number }
    }
    if (perfWithMemory.memory) {
      result.memory = {
        usedJSHeapSize: perfWithMemory.memory.usedJSHeapSize,
        totalJSHeapSize: perfWithMemory.memory.totalJSHeapSize,
      }
    }

    return result
  })

  // FID requires actual user interaction, try to get it from web-vitals if available
  const fidValue = await page.evaluate(() => {
    const fidEntries = performance.getEntriesByType('first-input') as (PerformanceEntry & { processingStart?: number })[]
    const fidEntry = fidEntries[0]
    if (fidEntry && fidEntry.processingStart !== undefined) {
      return fidEntry.processingStart - fidEntry.startTime
    }
    return null
  })

  metrics.fid = fidValue

  return metrics
}

/**
 * Capture console logs during test execution
 */
export async function captureConsoleLogs(page: Page): Promise<ConsoleCapture> {
  const logs: string[] = []
  let isCapturing = false

  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (!isCapturing) return
    const type = msg.type()
    const text = msg.text()
    const timestamp = new Date().toISOString()
    logs.push(`[${timestamp}] [${type.toUpperCase()}] ${text}`)
  }

  return {
    start: () => {
      isCapturing = true
      logs.length = 0
      page.on('console', onConsole)
    },
    stop: () => {
      isCapturing = false
      page.off('console', onConsole)
      return [...logs]
    },
    getLogs: () => [...logs],
  }
}

/**
 * Log data to test artifacts for CI integration
 */
export async function logToArtifacts(
  testInfo: TestInfo,
  name: string,
  data: unknown
): Promise<void> {
  const jsonContent = JSON.stringify(data, null, 2)

  await testInfo.attach(name, {
    body: jsonContent,
    contentType: 'application/json',
  })
}

/**
 * Generate comprehensive debug report on test failure
 */
export async function generateDebugReport(
  page: Page,
  testInfo: TestInfo,
  error?: Error
): Promise<DebugReport> {
  // Capture game state
  let gameState: GameStateSnapshot
  try {
    gameState = await captureGameState(page)
  } catch {
    gameState = {
      timestamp: Date.now(),
      url: page.url(),
      gameStore: null,
      settingsStore: null,
      route: '',
      localStorage: {},
      sessionStorage: {},
    }
  }

  // Capture browser metrics
  let metrics: BrowserMetrics
  try {
    metrics = await captureBrowserMetrics(page)
  } catch {
    metrics = {
      fcp: null,
      lcp: null,
      cls: null,
      fid: null,
      ttfb: null,
    }
  }

  // Capture screenshot
  let screenshot: string | null = null
  try {
    const screenshotBuffer = await page.screenshot({ fullPage: true })
    screenshot = screenshotBuffer.toString('base64')

    // Attach screenshot to test artifacts
    await testInfo.attach('failure-screenshot', {
      body: screenshotBuffer,
      contentType: 'image/png',
    })
  } catch {
    screenshot = null
  }

  // Build the report
  const report: DebugReport = {
    gameState,
    network: [], // Network entries should be captured separately via captureNetworkTimeline
    metrics,
    console: [], // Console logs should be captured separately via captureConsoleLogs
    screenshot,
  }

  // Add error info if provided
  const reportWithError = {
    ...report,
    error: error
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }
      : null,
    testInfo: {
      title: testInfo.title,
      titlePath: testInfo.titlePath,
      file: testInfo.file,
      line: testInfo.line,
      duration: testInfo.duration,
      status: testInfo.status,
      retry: testInfo.retry,
    },
  }

  // Attach the full report to test artifacts
  await logToArtifacts(testInfo, 'debug-report.json', reportWithError)

  return report
}

/**
 * Compare two game states and identify differences
 */
export function diffGameStates(
  state1: GameStateSnapshot,
  state2: GameStateSnapshot
): StateDiff {
  const changed: string[] = []
  const added: string[] = []
  const removed: string[] = []

  // Helper to flatten object for comparison
  const flattenObject = (
    obj: unknown,
    prefix = ''
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {}

    if (obj === null || obj === undefined) {
      return result
    }

    if (typeof obj !== 'object') {
      result[prefix] = obj
      return result
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const key = prefix ? `${prefix}[${index}]` : `[${index}]`
        Object.assign(result, flattenObject(item, key))
      })
      return result
    }

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      Object.assign(result, flattenObject(value, newKey))
    }

    return result
  }

  // Flatten both states for comparison
  const flat1 = flattenObject({
    gameStore: state1.gameStore,
    settingsStore: state1.settingsStore,
    route: state1.route,
    localStorage: state1.localStorage,
    sessionStorage: state1.sessionStorage,
  })

  const flat2 = flattenObject({
    gameStore: state2.gameStore,
    settingsStore: state2.settingsStore,
    route: state2.route,
    localStorage: state2.localStorage,
    sessionStorage: state2.sessionStorage,
  })

  const keys1 = Object.keys(flat1)
  const keys2 = Object.keys(flat2)
  const keys1Set = new Set(keys1)
  const keys2Set = new Set(keys2)

  // Find added keys (in state2 but not in state1)
  for (const key of keys2) {
    if (!keys1Set.has(key)) {
      added.push(key)
    }
  }

  // Find removed keys (in state1 but not in state2)
  for (const key of keys1) {
    if (!keys2Set.has(key)) {
      removed.push(key)
    }
  }

  // Find changed values
  for (const key of keys1) {
    if (keys2Set.has(key)) {
      const val1 = flat1[key]
      const val2 = flat2[key]

      // Deep comparison using JSON stringify for complex values
      const str1 = JSON.stringify(val1)
      const str2 = JSON.stringify(val2)

      if (str1 !== str2) {
        changed.push(key)
      }
    }
  }

  return {
    changed,
    added,
    removed,
  }
}
