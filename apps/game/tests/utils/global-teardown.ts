/**
 * Global teardown for Playwright tests
 * Performs cleanup after all tests complete
 */

import type { FullConfig } from '@playwright/test'

async function globalTeardown(_config: FullConfig) {
  // Cleanup logic would go here
  // For example: clear test data, close connections, etc.
}

export default globalTeardown
