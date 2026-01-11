import { describe, it, expect, beforeEach } from 'vitest'
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
      expect(metrics?.last).toBeGreaterThanOrEqual(10)
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
})
