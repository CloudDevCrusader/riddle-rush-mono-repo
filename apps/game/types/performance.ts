/**
 * Shared performance / navigation timing types (game app).
 */

/** Legacy `performance.timing` summary from `usePerformance().getNavigationTiming()`. */
export interface NavigationTimingSummary {
  dns: number
  tcp: number
  request: number
  response: number
  domProcessing: number
  domContentLoaded: number
  loadComplete: number
  totalTime: number
}

/** One resource entry from `usePerformance().getResourceTiming()`. */
export interface PerformanceResourceSummary {
  name: string
  duration: number
  size: number
  type: string
}

/** Chrome-only `performance.memory` snapshot from `usePerformance().getMemoryUsage()`. */
export interface PerformanceMemorySummary {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  usedPercentage: string
}

/** Dev-only: `window.__performance__` helpers registered in `performance.client.ts`. */
export interface DevWindowPerformanceTools {
  mark: (name: string) => void
  measure: (name: string) => number | null
  measureFn: <T>(name: string, fn: () => T | Promise<T>) => Promise<T>
  logReport: () => void
}

/** Payload for `[slow-initial-load]` dev warning. */
export interface SlowInitialLoadLogContext {
  totalMs: number
  thresholdMs: number
  domProcessingMs: number
  requestMs: number
}

/** Payload for `[slow-page]` dev warning. */
export interface SlowPageTransitionLogContext {
  durationMs: number
  thresholdMs: number
  path: string
}
