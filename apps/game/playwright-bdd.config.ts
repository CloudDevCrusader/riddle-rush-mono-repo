import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

const isCI = !!process.env.CI
const baseURL =
  process.env.BASE_URL || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
const isDeployedTest =
  (baseURL.startsWith('http://') || baseURL.startsWith('https://')) &&
  !baseURL.includes('localhost')

// Define BDD configuration
const testDir = defineBddConfig({
  features: 'tests/features/**/*.feature',
  steps: 'tests/steps/**/*.ts',
})

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 0,
  workers: isCI ? 2 : undefined,
  timeout: 60000,

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report-bdd' }],
    ['list'],
    ['json', { outputFile: 'test-results/bdd-results.json' }],
    ['line'],
    ...(isCI ? ([['github']] as const) : []),
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    video: 'on-first-retry',
    ...(isDeployedTest && {
      navigationTimeout: 30000,
      actionTimeout: 15000,
    }),
  },

  ...(!isDeployedTest && {
    webServer: {
      command: 'node .output/server/index.mjs',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 300000,
    },
  }),

  projects: [
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  outputDir: 'test-results/bdd/',
})
