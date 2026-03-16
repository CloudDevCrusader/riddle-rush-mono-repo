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

// Global mock setup
Object.assign(globalThis, {
  useRuntimeConfig: mockUseRuntimeConfig,
  useRoute: mockUseRoute,
  useRouter: mockUseRouter,
  useNuxtApp: mockUseNuxtApp,
})

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.clearAllMocks()
})

export default { createTestContext: () => ({}) }
