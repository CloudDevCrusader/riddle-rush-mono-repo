import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log'),
  warn: vi.spyOn(console, 'warn'),
  error: vi.spyOn(console, 'error'),
  debug: vi.spyOn(console, 'debug'),
  info: vi.spyOn(console, 'info'),
}

// Mock useErrorSync
const mockSyncErrorLog = vi.fn()
vi.mock('../../composables/useErrorSync', () => ({
  useErrorSync: () => ({
    syncErrorLog: mockSyncErrorLog,
  }),
}))

// Mock useRuntimeConfig
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      environment: 'test',
      appVersion: '1.0.0-test',
      debugErrorSync: false,
    },
  }),
}))

const { useLogger } = await import('../../composables/useLogger')

describe('useLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    consoleSpy.log.mockImplementation(() => {})
    consoleSpy.warn.mockImplementation(() => {})
    consoleSpy.error.mockImplementation(() => {})
    consoleSpy.debug.mockImplementation(() => {})
    consoleSpy.info.mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('log', () => {
    it('should log messages in development', () => {
      const logger = useLogger()
      logger.log('Test message', { foo: 'bar' })

      expect(consoleSpy.log).toHaveBeenCalledWith('[LOG] Test message', { foo: 'bar' })
    })

    it('should handle multiple arguments', () => {
      const logger = useLogger()
      logger.log('Test', 'arg1', 'arg2', { data: 'test' })

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[LOG] Test',
        'arg1',
        'arg2',
        { data: 'test' }
      )
    })
  })

  describe('warn', () => {
    it('should log warnings in development', () => {
      const logger = useLogger()
      logger.warn('Warning message', { issue: 'something' })

      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Warning message', { issue: 'something' })
    })

    it('should handle warnings without additional args', () => {
      const logger = useLogger()
      logger.warn('Simple warning')

      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Simple warning')
    })
  })

  describe('error', () => {
    it('should log errors with context', () => {
      const logger = useLogger()
      const testError = new Error('Test error')
      const context = { userId: '123', action: 'submit' }

      logger.error('Error occurred', testError, context)

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[ERROR] Error occurred',
        testError,
        expect.objectContaining({
          timestamp: expect.any(String),
          environment: 'test',
          appVersion: '1.0.0-test',
          userId: '123',
          action: 'submit',
        })
      )
    })

    it('should sync errors', () => {
      const logger = useLogger()
      const testError = new Error('Sync test')

      logger.error('Sync error', testError)

      expect(mockSyncErrorLog).toHaveBeenCalledWith(
        'error',
        'Sync error',
        testError,
        expect.objectContaining({
          timestamp: expect.any(String),
          environment: 'test',
        })
      )
    })

    it('should handle errors without error object', () => {
      const logger = useLogger()

      logger.error('Error without object')

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[ERROR] Error without object',
        undefined,
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      )
    })

    it('should include window location and user agent', () => {
      const logger = useLogger()

      logger.error('Location test')

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[ERROR] Location test',
        undefined,
        expect.objectContaining({
          url: expect.any(String),
          userAgent: expect.any(String),
        })
      )
    })
  })

  describe('debug', () => {
    it('should log debug messages in development', () => {
      const logger = useLogger()
      logger.debug('Debug info', { data: 'test' })

      expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] Debug info', { data: 'test' })
    })

    it('should handle debug with no args', () => {
      const logger = useLogger()
      logger.debug('Simple debug')

      expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] Simple debug')
    })
  })

  describe('info', () => {
    it('should log info messages in development', () => {
      const logger = useLogger()
      logger.info('Info message', { status: 'ok' })

      expect(consoleSpy.info).toHaveBeenCalledWith('[INFO] Info message', { status: 'ok' })
    })

    it('should handle info with multiple args', () => {
      const logger = useLogger()
      logger.info('Info', 1, 2, 3)

      expect(consoleSpy.info).toHaveBeenCalledWith('[INFO] Info', 1, 2, 3)
    })
  })

  describe('return value', () => {
    it('should return all logging methods', () => {
      const logger = useLogger()

      expect(logger).toHaveProperty('log')
      expect(logger).toHaveProperty('warn')
      expect(logger).toHaveProperty('error')
      expect(logger).toHaveProperty('debug')
      expect(logger).toHaveProperty('info')
      expect(typeof logger.log).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.info).toBe('function')
    })
  })
})
