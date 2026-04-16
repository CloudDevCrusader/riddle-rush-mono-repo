/**
 * Performance measurement utility using Web Performance API
 * Provides built-in performance monitoring for the application
 */

interface PerformanceMeasure {
  name: string
  duration: number
  startTime: number
  entryType: string
}

interface PerformanceMetrics {
  [key: string]: {
    count: number
    total: number
    average: number
    min: number
    max: number
    last: number
  }
}

export const usePerformance = () => {
  // Make logger optional for testing
  const logger
    = typeof useLogger !== 'undefined'
      ? useLogger()
      : {
          log: () => {},
          warn: () => {},
        }
  const { log, warn } = logger
  const metrics = ref<PerformanceMetrics>({})

  // Check if Performance API is available
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const isSupported =
    typeof window !== 'undefined' &&
    'performance' in window &&
    'mark' in window.performance &&
    'measure' in window.performance
=======
=======
>>>>>>> Stashed changes
  const isSupported
    = typeof window !== 'undefined'
      && 'performance' in window
      && 'mark' in window.performance
      && 'measure' in window.performance;
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

  /**
   * Start a performance measurement
   */
  const mark = (name: string): void => {
    if (!isSupported) return

    try {
      performance.mark(`${name}-start`)
      log(`Performance mark: ${name}-start`)
    } catch (error) {
      warn(`Failed to create performance mark: ${name}`, error)
    }
  }

  /**
   * End a performance measurement and calculate duration
   */
  const measure = (name: string): number | null => {
    if (!isSupported) return null

    try {
      const startMark = `${name}-start`
      const endMark = `${name}-end`

      performance.mark(endMark)
      performance.measure(name, startMark, endMark)

      const measure = performance.getEntriesByName(name, 'measure')[0] as PerformanceMeasure
      const duration = measure?.duration || 0

      // Update metrics
      updateMetrics(name, duration)

      // Clean up marks and measures
      performance.clearMarks(startMark)
      performance.clearMarks(endMark)
      performance.clearMeasures(name)

      log(`Performance measure: ${name} = ${duration.toFixed(2)}ms`)
      return duration
    } catch (error) {
      warn(`Failed to measure performance: ${name}`, error)
      return null
    }
  }

  /**
   * Update performance metrics for a measurement
   */
  const updateMetrics = (name: string, duration: number): void => {
    if (!metrics.value[name]) {
      metrics.value[name] = {
        count: 0,
        total: 0,
        average: 0,
        min: Infinity,
        max: -Infinity,
        last: 0,
      }
    }

    const metric = metrics.value[name]
    metric.count += 1
    metric.total += duration
    metric.average = metric.total / metric.count
    metric.min = Math.min(metric.min, duration)
    metric.max = Math.max(metric.max, duration)
    metric.last = duration
  }

  /**
   * Measure a function execution time
   */
  const measureFn = async <T>(name: string, fn: () => T | Promise<T>): Promise<T> => {
    mark(name)
    try {
      const result = await fn()
      measure(name)
      return result
    } catch (error) {
      measure(name)
      throw error
    }
  }

  /**
   * Get metrics for a specific measurement
   */
  const getMetrics = (name: string) => {
    return metrics.value[name] || null
  }

  /**
   * Get all metrics
   */
  const getAllMetrics = () => {
    return { ...metrics.value }
  }

  /**
   * Clear all metrics
   */
  const clearMetrics = () => {
    metrics.value = {}
    if (isSupported) {
      performance.clearMarks()
      performance.clearMeasures()
    }
  }

  /**
   * Get navigation timing metrics
   */
  const getNavigationTiming = () => {
    if (!isSupported || !performance.timing) return null

    const timing = performance.timing
    return {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      domProcessing: timing.domComplete - timing.domLoading,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      loadComplete: timing.loadEventEnd - timing.loadEventStart,
      totalTime: timing.loadEventEnd - timing.navigationStart,
    }
  }

  /**
   * Get resource timing metrics
   */
  const getResourceTiming = (resourceName?: string) => {
    if (!isSupported) return []

    const resources = resourceName
      ? performance.getEntriesByName(resourceName, 'resource')
      : performance.getEntriesByType('resource')

    return resources.map((resource) => {
      const r = resource as PerformanceResourceTiming
      return {
        name: r.name,
        duration: r.duration,
        size: r.transferSize || 0,
        type: r.initiatorType,
      }
    })
  }

  /**
   * Log performance report to console
   */
  const logReport = () => {
    if (process.env.NODE_ENV !== 'development') return

    const allMetrics = getAllMetrics()

    console.group('Performance Report')
    ;(Object.entries(allMetrics) as [string, PerformanceMetrics[string]][]).forEach(
      ([name, metric]) => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        console.log(
          `${name}: count=${metric.count}, avg=${metric.average.toFixed(2)}ms, min=${metric.min.toFixed(2)}ms, max=${metric.max.toFixed(2)}ms, last=${metric.last.toFixed(2)}ms, total=${metric.total.toFixed(2)}ms`
        )
      }
    )
=======
=======
>>>>>>> Stashed changes
        debug(
          `${name}: count=${metric.count}, avg=${metric.average.toFixed(2)}ms, min=${metric.min.toFixed(2)}ms, max=${metric.max.toFixed(2)}ms, last=${metric.last.toFixed(2)}ms, total=${metric.total.toFixed(2)}ms`,
        );
      },
    );
>>>>>>> Stashed changes

    const navTiming = getNavigationTiming()
    if (navTiming) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      console.log(
        `Navigation Timing: DNS=${navTiming.dns.toFixed(2)}ms, TCP=${navTiming.tcp.toFixed(2)}ms, Request=${navTiming.request.toFixed(2)}ms, Response=${navTiming.response.toFixed(2)}ms, DOM=${navTiming.domProcessing.toFixed(2)}ms, DCL=${navTiming.domContentLoaded.toFixed(2)}ms, Total=${navTiming.totalTime.toFixed(2)}ms`
      )
=======
=======
>>>>>>> Stashed changes
      debug(
        `Navigation Timing: DNS=${navTiming.dns.toFixed(2)}ms, TCP=${navTiming.tcp.toFixed(2)}ms, Request=${navTiming.request.toFixed(2)}ms, Response=${navTiming.response.toFixed(2)}ms, DOM=${navTiming.domProcessing.toFixed(2)}ms, DCL=${navTiming.domContentLoaded.toFixed(2)}ms, Total=${navTiming.totalTime.toFixed(2)}ms`,
      );
>>>>>>> Stashed changes
    }

    console.groupEnd()
  }

  /**
   * Get memory usage (if available)
   */
  const getMemoryUsage = () => {
    if (typeof window === 'undefined') return null

    const memory = (
      performance as unknown as {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number }
=======
        memory?: { usedJSHeapSize: number, totalJSHeapSize: number, jsHeapSizeLimit: number }
>>>>>>> Stashed changes
=======
        memory?: { usedJSHeapSize: number, totalJSHeapSize: number, jsHeapSizeLimit: number }
>>>>>>> Stashed changes
      }
    ).memory
    if (!memory) return null

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercentage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2),
    }
  }

  return {
    mark,
    measure,
    measureFn,
    getMetrics,
    getAllMetrics,
    clearMetrics,
    getNavigationTiming,
    getResourceTiming,
    getMemoryUsage,
    logReport,
    isSupported,
  }
}
