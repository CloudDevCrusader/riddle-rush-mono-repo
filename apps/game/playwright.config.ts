import { defineConfig, devices } from '@playwright/test'
import * as os from 'os'

const isCI = !!process.env.CI
// Allow testing against deployed sites via BASE_URL env var
const baseURL =
  process.env.BASE_URL || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
const isDeployedTest =
  (baseURL.startsWith('http://') || baseURL.startsWith('https://')) &&
  !baseURL.includes('localhost')

// Adaptive worker configuration
const getWorkerCount = () => {
  if (process.env.CI) {
    return process.env.WORKERS ? parseInt(process.env.WORKERS) : 4
  }
  const cpus = os.cpus().length
  return Math.max(4, Math.min(Math.floor(cpus / 2), 8))
}

// Mobile/tablet tests need longer timeouts
const getMobileTimeout = () => (isDeployedTest ? 90000 : 60000)

// Test tags for grouping
// Usage: test('my test @smoke @critical', ...)
// Run with: npx playwright test --grep @smoke
const testTags = {
  smoke: '@smoke',
  critical: '@critical',
  slow: '@slow',
  mobile: '@mobile',
  tablet: '@tablet',
}

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  // Smart retry logic: 1 retry in CI with exponential backoff
  retries: isCI ? 1 : 0,
  workers: getWorkerCount(),
  timeout: getMobileTimeout(),

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['line'], // Simple line reporter for CI
    ['junit', { outputFile: '../../junit.xml' }],
    ...(isCI ? ([['github']] as const) : []), // GitHub Actions annotations
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',

    // Screenshots - always on failure, full page
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },

    // Video on retry (helps debug flaky tests)
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
      command: 'DISABLE_SECURITY=true node .output/server/index.mjs',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 300000, // Increase timeout to 5 minutes
    },
  }),

  // Multiple mobile device profiles
  // Note: Remove grep/grepInvert to run all tests, or use CLI --grep for filtering
  projects: [
    {
      name: 'mobile-chrome-pixel5',
      use: { ...devices['Pixel 5'] },
      // Run all tests by default; use --grep @tablet to filter
      grepInvert: /@tablet/,
    },
    {
      name: 'mobile-safari-iphone15',
      use: { ...devices['iPhone 15'] },
      grepInvert: /@tablet/,
    },
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad Pro 11'],
        // Tablets may need extra time for rendering larger viewports
        actionTimeout: isDeployedTest ? 20000 : 10000,
      },
      grepInvert: /@mobile-only/,
    },
    {
      name: 'mobile-chrome-galaxy',
      use: { ...devices['Galaxy S9+'] },
      grepInvert: /@tablet/,
    },
  ],

  // Output directories
  outputDir: 'test-results/',

  // Global setup and teardown
  globalSetup: './tests/utils/global-setup.ts',
  globalTeardown: './tests/utils/global-teardown.ts',

  // Custom snapshot directory
  snapshotDir: './tests/e2e/__snapshots__',

  // Custom test match - include both TypeScript and JavaScript (for BDD generated tests)
  testMatch: '**/*.spec.{ts,js}',

  // Custom expect matchers with improved timeouts for mobile
  expect: {
    timeout: isDeployedTest ? 10000 : 5000,
    toMatchSnapshot: { threshold: 0.2 },
    toHaveScreenshot: { threshold: 0.2 },
  },
})

// Export test tags for use in test files
export { testTags }
