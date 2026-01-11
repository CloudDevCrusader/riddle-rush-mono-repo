// Test setup file to ensure Vue reactivity system is properly initialized
import { createApp } from 'vue'
import { beforeEach, afterEach, vi } from 'vitest'
import * as VueExports from 'vue'
import * as VueRouterExports from 'vue-router'
import * as PiniaExports from 'pinia'

// Make Vue, VueRouter, and Pinia exports globally available
Object.assign(globalThis, VueExports, VueRouterExports, PiniaExports)

// Mock common Nuxt composables
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
  $i18n: {},
}))

// Make Nuxt composables globally available
Object.assign(globalThis, {
  useRuntimeConfig: mockUseRuntimeConfig,
  useRoute: mockUseRoute,
  useRouter: mockUseRouter,
  useNuxtApp: mockUseNuxtApp,
})

// Ensure Vue reactivity system is properly initialized before each test
beforeEach(() => {
  // Create a minimal Vue app to ensure proper reactivity context
  const app = createApp({})
  app.unmount()
  
  // Reset mocks
  vi.clearAllMocks()
})

// Clean up after each test
afterEach(() => {
  // Any cleanup can go here
})
