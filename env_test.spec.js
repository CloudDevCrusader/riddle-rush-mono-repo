// Dummy test to understand the environment 
import { test } from 'node:test';

test('check environment', async () => {
  // Import the check script
  await import('./check_config.mjs');
});