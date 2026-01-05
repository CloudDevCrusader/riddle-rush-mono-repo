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
  retries: isCI ? 2 : 1,
  workers: isCI ? 2 : undefined,
  timeout: 60000,

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['line'], // Simple line reporter for CI
    ...(isCI ? [['junit', { outputFile: 'test-results/junit.xml' }] as const] : []),
    ...(isCI ? ([['github']] as const) : []), // GitHub Actions annotations
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

    // Longer timeout for deployed sites (network latency)
    ...(isDeployedTest && {
      navigationTimeout: 30000,
      actionTimeout: 15000,
    }),
  },

  // Web server - only start for local tests
  ...(!isDeployedTest && {
    webServer: {
      command: 'npm run preview',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  }),

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Mini'] },
    },
  ],

  // Output directories
  outputDir: 'test-results/',

  // Global setup and teardown
  globalSetup: './tests/utils/global-setup.ts',
  globalTeardown: './tests/utils/global-teardown.ts',

  // Custom snapshot directory
  snapshotDir: './tests/e2e/__snapshots__',

  // Custom test match
  testMatch: '**/*.spec.ts',

  // Custom expect matchers
  expect: {
    timeout: 5000,
    toMatchSnapshot: { threshold: 0.2 },
    toHaveScreenshot: { threshold: 0.2 },
  },
})
