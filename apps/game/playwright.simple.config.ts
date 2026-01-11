import { defineConfig, devices } from '@playwright/test'

// Simple configuration for critical E2E tests
// This config assumes the server is already running or uses a deployed URL

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Run tests sequentially for reliability
  forbidOnly: false, // Allow .only for debugging
  retries: 0, // No retries for simplicity
  workers: 1, // Single worker
  timeout: 60000,

  reporter: [
    ['list'], // Simple list reporter
    ['html', { open: 'never', outputFolder: 'playwright-report-simple' }],
  ],

  use: {
    // Use a deployed URL or assume local server is running
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',

    // More generous timeouts
    navigationTimeout: 30000,
    actionTimeout: 15000,

    // 📸 Screenshots - always on failure, full page
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
  },

  projects: [
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Run all tests by default
  // testMatch: [
  //   '**/menu.spec.ts',
  //   '**/players.spec.ts',
  //   '**/game-flow.spec.ts',
  // ],

  // Custom expect matchers
  expect: {
    timeout: 10000,
  },
})
