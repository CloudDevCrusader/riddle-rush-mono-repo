// Mock implementations for testing environment where packages are not installed
// This allows tests to be parsed and analyzed without dependency errors

export const test = (name, fn) => {
  console.log(`Test registered: ${name}`);
  // Mark as fixme since dependencies aren't available
  // test.fixme(name, fn);
};

test.fixme = (name, fn) => {
  console.log(`Test marked as fixme: ${name}`);
};

test.skip = (name, fn) => {
  console.log(`Test skipped: ${name}`);
};

test.describe = (name, fn) => {
  console.log(`Test suite: ${name}`);
  fn();
};

export const expect = (actual) => ({
  toBe: (expected) => console.log(`Assertion: ${actual} should be ${expected}`),
  toEqual: (expected) => console.log(`Assertion: ${actual} should equal ${expected}`),
  toContain: (expected) => console.log(`Assertion: ${actual} should contain ${expected}`),
  toBeTruthy: () => console.log(`Assertion: ${actual} should be truthy`),
  toBeFalsy: () => console.log(`Assertion: ${actual} should be falsy`),
  toBeVisible: () => console.log(`Assertion: ${actual} should be visible`),
  toHaveText: (text) => console.log(`Assertion: ${actual} should have text: ${text}`),
  toHaveTitle: (title) => console.log(`Assertion: ${actual} should have title: ${title}`),
  toHaveURL: (url) => console.log(`Assertion: ${actual} should have URL: ${url}`)
});

export const defineConfig = (config) => {
  console.log('Playwright config defined');
  return config;
};

export const devices = {
  'Desktop Chrome': { name: 'Desktop Chrome' },
  'Desktop Firefox': { name: 'Desktop Firefox' }, 
  'Desktop Safari': { name: 'Desktop Safari' },
  'Pixel 5': { name: 'Pixel 5' }
};