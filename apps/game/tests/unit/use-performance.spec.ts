import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePerformance } from '../../composables/usePerformance'

describe('usePerformance', () => {
  beforeEach(() => {
    // Clear performance entries before each test
    if (typeof performance !== 'undefined') {
      performance.clearMarks()
      performance.clearMeasures()
    }
  })

  it('should check if Performance API is supported', () => {
    const { isSupported } = usePerformance()
    expect(typeof isSupported).toBe('boolean')
  })

  it('should create performance marks', () => {
    const { mark, isSupported } = usePerformance()

    if (isSupported) {
      mark('test-operation')
      const marks = performance.getEntriesByName('test-operation-start', 'mark')
      expect(marks.length).toBeGreaterThan(0)
    }
  })

  it('should measure performance duration', () => {
    const { mark, measure, isSupported } = usePerformance()

    if (isSupported) {
      mark('test-measure')
      const duration = measure('test-measure')

      expect(duration).toBeGreaterThanOrEqual(0)
    }
  })

  it('should track metrics for measurements', () => {
    const { mark, measure, getMetrics, isSupported } = usePerformance()

    if (isSupported) {
      mark('metric-test')
      measure('metric-test')

      const metrics = getMetrics('metric-test')
      expect(metrics).toBeDefined()
      expect(metrics?.count).toBe(1)
      expect(metrics?.average).toBeGreaterThanOrEqual(0)
    }
  })

  it('should measure function execution time', async () => {
    const { measureFn, getMetrics, isSupported } = usePerformance()

    if (isSupported) {
      const testFn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return 'result'
      }

      const result = await measureFn('fn-test', testFn)
      expect(result).toBe('result')

      const metrics = getMetrics('fn-test')
      expect(metrics).toBeDefined()
      // Allow generous timing variation to avoid flaky tests on CI runners
      expect(metrics?.last).toBeGreaterThanOrEqual(5)
    }
  })

  it('should get all metrics', () => {
    const { mark, measure, getAllMetrics, isSupported } = usePerformance()

    if (isSupported) {
      mark('op1')
      measure('op1')
      mark('op2')
      measure('op2')

      const allMetrics = getAllMetrics()
      expect(Object.keys(allMetrics).length).toBe(2)
      expect(allMetrics.op1).toBeDefined()
      expect(allMetrics.op2).toBeDefined()
    }
  })

  it('should clear all metrics', () => {
    const { mark, measure, clearMetrics, getAllMetrics, isSupported } = usePerformance()

    if (isSupported) {
      mark('clear-test')
      measure('clear-test')

      clearMetrics()
      const allMetrics = getAllMetrics()
      expect(Object.keys(allMetrics).length).toBe(0)
    }
  })

  it('should handle errors gracefully in measureFn', async () => {
    const { measureFn, isSupported } = usePerformance()

    if (isSupported) {
      const errorFn = async () => {
        throw new Error('Test error')
      }

      await expect(measureFn('error-test', errorFn)).rejects.toThrow('Test error')
    }
  })

  it('should calculate min, max, and average correctly', () => {
    const { mark, measure, getMetrics, isSupported } = usePerformance()

    if (isSupported) {
      // Perform multiple measurements
      for (let i = 0; i < 3; i++) {
        mark('multi-test')
        measure('multi-test')
      }

      const metrics = getMetrics('multi-test')
      expect(metrics).toBeDefined()
      expect(metrics?.count).toBe(3)
      expect(metrics?.min).toBeLessThanOrEqual(metrics?.max || 0)
      expect(metrics?.average).toBeGreaterThanOrEqual(0)
    }
  })

  it('should return null for non-existent metrics', () => {
    const { getMetrics } = usePerformance()
    expect(getMetrics('does-not-exist')).toBeNull()
  })

  it('getNavigationTiming returns timing data or null', () => {
    const { getNavigationTiming } = usePerformance()
    const timing = getNavigationTiming()
    // happy-dom may or may not have performance.timing
    if (timing) {
      expect(timing).toHaveProperty('dns')
      expect(timing).toHaveProperty('tcp')
      expect(timing).toHaveProperty('totalTime')
    } else {
      expect(timing).toBeNull()
    }
  })

  it('getResourceTiming returns array', () => {
    const { getResourceTiming, isSupported } = usePerformance()
    if (isSupported) {
      const resources = getResourceTiming()
      expect(Array.isArray(resources)).toBe(true)
    }
  })

  it('getResourceTiming filters by name', () => {
    const { getResourceTiming, isSupported } = usePerformance()
    if (isSupported) {
      const resources = getResourceTiming('nonexistent-resource')
      expect(resources).toEqual([])
    }
  })

  it('getMemoryUsage returns object or null', () => {
    const { getMemoryUsage } = usePerformance()
    const memory = getMemoryUsage()
    // Chrome has performance.memory, happy-dom may not
    if (memory) {
      expect(memory).toHaveProperty('usedJSHeapSize')
      expect(memory).toHaveProperty('usedPercentage')
    } else {
      expect(memory).toBeNull()
    }
  })

  it('logReport does not throw in non-development', () => {
    const { logReport } = usePerformance()
    expect(() => logReport()).not.toThrow()
  })

  it('logReport with metrics does not throw', () => {
    const { mark, measure, logReport, isSupported } = usePerformance()
    if (isSupported) {
      mark('report-test')
      measure('report-test')
    }
    expect(() => logReport()).not.toThrow()
  })

  it('mark handles errors gracefully', () => {
    const { isSupported } = usePerformance()
    if (isSupported) {
      // Spy on performance.mark to force error
      const spy = vi.spyOn(performance, 'mark').mockImplementationOnce(() => {
        throw new Error('mark error')
      })
      const { mark } = usePerformance()
      expect(() => mark('error-mark')).not.toThrow()
      spy.mockRestore()
    }
  })

  it('measure handles errors gracefully', () => {
    const { isSupported } = usePerformance()
    if (isSupported) {
      const spy = vi.spyOn(performance, 'measure').mockImplementationOnce(() => {
        throw new Error('measure error')
      })
      const { mark, measure } = usePerformance()
      mark('error-measure')
      const result = measure('error-measure')
      expect(result).toBeNull()
      spy.mockRestore()
    }
  })
})
