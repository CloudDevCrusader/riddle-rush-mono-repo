/**
 * Test utilities for mocking Nuxt composables
 */

// Mock useRuntimeConfig
export const mockUseRuntimeConfig = (config: any = {}) => {
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
export const mockUseErrorSync = (mockSyncErrorLog: any = () => {}) => {
  return () => ({
    useErrorSync: () => ({
      syncErrorLog: mockSyncErrorLog,
      syncErrorsToCloudWatch: () => {},
      setupPeriodicSync: () => {},
      // @ts-ignore - for testing
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
  }
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
  } as any

  global.document = {
    visibilityState: 'visible',
    addEventListener: () => {},
  } as any

  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  } as any

  global.fetch = () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
}

// Mock IndexedDB
export const mockIndexedDB = (mockErrors: any[] = []) => {
  return () => ({
    useIndexedDB: () => ({
      openDB: (name: string, version: number, upgrade?: any) => {
        return Promise.resolve({
          transaction: (storeName: string, mode: string) => ({
            objectStore: () => ({
              put: () => {},
              getAll: () => Promise.resolve(mockErrors),
              clear: () => Promise.resolve(),
            }),
            done: Promise.resolve(),
          }),
        })
      },
    }),
  })
}
