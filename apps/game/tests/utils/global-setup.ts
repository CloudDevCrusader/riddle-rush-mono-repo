/**
 * Global setup for Playwright tests
 * Performs one-time setup before all tests run
 */

import type { FullConfig } from '@playwright/test'

async function globalSetup(_config: FullConfig) {
  // Global setup logic would go here
  // Example: cache assets, set up test data, etc.
}

export default globalSetup
