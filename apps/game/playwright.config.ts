import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
// Allow testing against deployed sites via BASE_URL env var
const baseURL
  = process.env.BASE_URL || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
const isDeployedTest
  = (baseURL.startsWith('http://') || baseURL.startsWith('https://'))
    && !baseURL.includes('localhost')

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,

  // Global test timeout - increased for complex game flows
  timeout: isDeployedTest ? 60000 : 45000, // 60s for deployed, 45s for local

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ...(isCI ? [['junit', { outputFile: 'test-results/junit.xml' }] as const] : []),
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',

    // 📸 Screenshots - always on failure, full page
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },

    // 🎬 Video on retry (helps debug flaky tests)
    video: 'on-first-retry',

    // Timeout settings - more generous for better reliability
    navigationTimeout: isDeployedTest ? 30000 : 20000,
    actionTimeout: isDeployedTest ? 15000 : 10000,
  },

  // Web server - only start for local tests
  ...(!isDeployedTest && {
    webServer: {
      command: 'pnpm run preview',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 180000, // Increased to 3 minutes for slower builds
    },
  }),

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Output directories
  outputDir: 'test-results/',
})
