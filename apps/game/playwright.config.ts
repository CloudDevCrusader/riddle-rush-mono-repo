import { defineConfig, devices } from '@playwright/test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const isCI = !!process.env.CI
const timeoutScale = isCI ? 0.75 : 1
// Allow testing against deployed sites via BASE_URL env var
const baseURL =
  process.env.BASE_URL || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
const isDeployedTest =
  (baseURL.startsWith('http://') || baseURL.startsWith('https://')) &&
  !baseURL.includes('localhost')
const configDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(configDir, '../..')

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,

  // Global test timeout - increased for complex game flows
  timeout: Math.round((isDeployedTest ? 60000 : 45000) * timeoutScale), // 60s for deployed, 45s for local

  reporter: [
    ['html', { open: 'never', outputFolder: resolve(repoRoot, 'playwright-report') }],
    ['list'],
    ['json', { outputFile: resolve(repoRoot, 'test-results/results.json') }],
    ...(isCI
      ? [['junit', { outputFile: resolve(repoRoot, 'test-results/junit.xml') }] as const]
      : []),
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
    navigationTimeout: Math.round((isDeployedTest ? 30000 : 20000) * timeoutScale),
    actionTimeout: Math.round((isDeployedTest ? 15000 : 10000) * timeoutScale),
  },

  // Web server - only start for local tests
  ...(!isDeployedTest && {
    webServer: {
      command: `node ${resolve(
        repoRoot,
        'node_modules/serve/build/main.js'
      )} ${resolve(repoRoot, 'apps/game/.output/public')} -l 3000`,
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 180000, // Increased to 3 minutes for slower builds
      stdout: 'pipe',
      stderr: 'pipe',
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
  outputDir: resolve(repoRoot, 'test-results'),
})
