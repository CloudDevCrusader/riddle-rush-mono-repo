// Basic test setup for Vue/Nuxt applications
import { beforeEach, afterEach, vi } from 'vitest'

// Nuxt composable mocks
const mockUseRuntimeConfig = vi.fn(() => ({
  public: {
    baseUrl: '/',
    environment: 'test',
    appVersion: '1.0.0-test',
    debugErrorSync: false,
  },
}))

const mockUseRoute = vi.fn(() => ({
  path: '/',
  params: {},
  query: {},
}))

const mockUseRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
}))

const mockUseNuxtApp = vi.fn(() => ({
  $i18n: {
    t: (key: string) => key,
  },
}))

const mockUseI18n = vi.fn(() => ({
  t: (key: string, fallback?: string | Record<string, unknown>) =>
    typeof fallback === 'string' ? fallback : key,
}))

const localStorageMock = (() => {
  const store = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => (store.has(key) ? store.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key)
    }),
    clear: vi.fn(() => {
      store.clear()
    }),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    get length() {
      return store.size
    },
  }
})()

// Global mock setup
Object.assign(globalThis, {
  useRuntimeConfig: mockUseRuntimeConfig,
  useRoute: mockUseRoute,
  useRouter: mockUseRouter,
  useNuxtApp: mockUseNuxtApp,
  useI18n: mockUseI18n,
  localStorage: localStorageMock,
})

beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.clearAllMocks()
})

export default { createTestContext: () => ({}) }
