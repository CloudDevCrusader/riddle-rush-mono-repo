/**
 * Test utilities for mocking Nuxt composables
 */

interface RuntimeConfig {
  environment?: string
  appVersion?: string
  cloudWatchEndpoint?: string
  cloudWatchApiKey?: string
  debugErrorSync?: boolean
  [key: string]: unknown
}

// Mock useRuntimeConfig
export const mockUseRuntimeConfig = (config: RuntimeConfig = {}) => {
  return () => ({
    useRuntimeConfig: () => ({
      public: {
        environment: 'test',
        appVersion: '1.0.0',
        cloudWatchEndpoint: 'https://test-api.example.com/logs',
        cloudWatchApiKey: 'test-api-key',
        debugErrorSync: true,
        ...config,
      },
    }),
  })
}

// Mock useErrorSync
export const mockUseErrorSync = (
  mockSyncErrorLog: (
    level: string,
    message: string,
    error?: unknown,
    context?: Record<string, unknown>
  ) => void = () => {}
) => {
  return () => ({
    useErrorSync: () => ({
      syncErrorLog: mockSyncErrorLog,
      syncErrorsToCloudWatch: () => {},
      setupPeriodicSync: () => {},
      formatError: (error: unknown) => {
        if (error instanceof Error) {
          return JSON.stringify({
            name: error.name,
            message: error.message,
            stack: error.stack,
          })
        }
        return String(error)
      },
    }),
  })
}

// Mock console methods
export const mockConsole = () => {
  global.console = {
    log: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
    info: () => {},
    assert: () => {},
    clear: () => {},
    count: () => {},
    countReset: () => {},
    dir: () => {},
    dirxml: () => {},
    group: () => {},
    groupCollapsed: () => {},
    groupEnd: () => {},
    table: () => {},
    time: () => {},
    timeEnd: () => {},
    timeLog: () => {},
    trace: () => {},
    profile: () => {},
    profileEnd: () => {},
    timeStamp: () => {},
  } as Console
}

// Mock global objects
export const mockGlobalObjects = () => {
  global.window = {
    location: {
      href: 'https://test.example.com/game',
    },
    navigator: {
      userAgent: 'Test Browser',
      onLine: true,
    },
    addEventListener: () => {},
  } as unknown as Window & typeof globalThis

  global.document = {
    visibilityState: 'visible',
    addEventListener: () => {},
  } as unknown as Document

  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  } as unknown as Storage

  global.fetch = (() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })) as unknown as typeof fetch
}
