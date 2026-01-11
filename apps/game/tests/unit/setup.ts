// Test setup file to ensure Vue reactivity system is properly initialized
import { createApp } from 'vue'
import { beforeEach, afterEach } from 'vitest'

// Ensure Vue reactivity system is properly initialized before each test
beforeEach(() => {
  // Create a minimal Vue app to ensure proper reactivity context
  const app = createApp({})
  app.unmount()
})

// Clean up after each test
afterEach(() => {
  // Any cleanup can go here
})
