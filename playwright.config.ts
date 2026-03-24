import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Focus on just the e2e tests in a single directory
  testDir: './apps/game/tests/e2e',
  
  // Configure for the available environment
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  timeout: 30000,
  
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  
  use: {
    // Use a publicly available test page instead of localhost
    baseURL: 'https://example.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  // Don't try to start a web server since we can't control the environment
  // webServer: undefined
});