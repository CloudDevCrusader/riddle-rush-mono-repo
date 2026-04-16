import { defineConfig, devices } from '@playwright/test'
import * as os from 'node:os'

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
    return process.env.WORKERS ? Number.parseInt(process.env.WORKERS) : 4
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
  // Retry once on failure — catches transient server crashes under parallel load
  retries: 1,
  workers: getWorkerCount(),
  timeout: getMobileTimeout(),

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
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
      // Use dev server for local tests to avoid build bundling issues
      // In CI, use pre-built server (assumes build was run beforehand)
      command: isCI
        ? 'DISABLE_SECURITY=true node .output/server/index.mjs'
        : 'DISABLE_SECURITY=true NUXT_DEVTOOLS=false pnpm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 300000, // Increase timeout to 5 minutes
    },
  }),

  // Streamlined device profiles for faster CI/CD
  // 1 Android device + 1 iOS tablet for comprehensive coverage
  projects: [
    {
      name: 'android-pixel5',
      use: {
        ...devices['Pixel 5'],
        // Mobile devices may need extra time for complex interactions
        actionTimeout: isDeployedTest ? 15000 : 8000,
      },
      grepInvert: /@tablet/,
    },
    {
      name: 'ios-ipad-pro',
      use: {
        ...devices['iPad Pro 11'],
        // Keep iPad viewport/UA emulation but run on Chromium for local/dev
        // stability. WebKit can upgrade localhost assets to HTTPS while the
        // local Nuxt dev server is HTTP, causing blank pages and false E2E
        // failures unrelated to app behavior.
        browserName: 'chromium',
        // Tablets may need extra time for rendering larger viewports
        actionTimeout: isDeployedTest ? 20000 : 10000,
      },
      grepInvert: /@mobile-only/,
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
