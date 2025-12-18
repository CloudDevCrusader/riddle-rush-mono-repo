# Testing Guide

This project uses Vitest for unit testing and Playwright for end-to-end testing.

## Quick Start

```bash
# Install dependencies
npm install

# Run all unit tests
npm run test:unit

# Run unit tests with coverage
npm run test:unit:coverage

# Run unit tests in watch mode (for development)
npm run test

# Run e2e tests
npm run test:e2e

# Run e2e tests in UI mode (interactive)
npm run test:e2e:ui

# View e2e test report
npm run test:e2e:report
```

## Unit Testing with Vitest

### Configuration

Unit tests are configured in `vitest.config.ts` with:
- **Environment**: happy-dom (lightweight DOM simulation)
- **Coverage Provider**: v8
- **Coverage Thresholds**: 80% for lines, functions, branches, statements
- **Test Location**: Any `*.spec.ts` or `*.test.ts` file except in `tests/e2e/`

### Writing Unit Tests

Create test files alongside your code or in `tests/unit/`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        title: 'Test Title'
      }
    })

    expect(wrapper.text()).toContain('Test Title')
  })

  it('handles user interaction', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('clicked')).toBeTruthy()
  })
})
```

### Testing Composables

```typescript
import { describe, it, expect } from 'vitest'
import { useMyComposable } from '@/composables/useMyComposable'

describe('useMyComposable', () => {
  it('returns expected values', () => {
    const { value, increment } = useMyComposable()

    expect(value.value).toBe(0)
    increment()
    expect(value.value).toBe(1)
  })
})
```

### Testing Pinia Stores

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '@/stores/game'

describe('Game Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with correct state', () => {
    const store = useGameStore()
    expect(store.score).toBe(0)
  })

  it('updates score correctly', () => {
    const store = useGameStore()
    store.incrementScore()
    expect(store.score).toBe(1)
  })
})
```

### Mocking

```typescript
import { vi } from 'vitest'

// Mock a function
const mockFn = vi.fn()
mockFn.mockReturnValue(42)

// Mock a module
vi.mock('@/services/api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'test' }))
}))

// Mock timers
vi.useFakeTimers()
vi.advanceTimersByTime(1000)
vi.useRealTimers()
```

## E2E Testing with Playwright

### Configuration

E2E tests are configured in `playwright.config.ts` with:
- **Test Directory**: `tests/e2e/`
- **Browsers**: Desktop Chrome and Mobile (Pixel 5)
- **Base URL**: http://localhost:3000 (configurable via BASE_URL env var)
- **Retries**: 2 retries in CI, 0 locally
- **Screenshots**: On failure only
- **Trace**: On first retry

### Writing E2E Tests

Create test files in `tests/e2e/`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load and display title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Guess Game/)
  })

  test('should navigate to game page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Start Game')
    await expect(page).toHaveURL(/.*game/)
  })
})
```

### Testing Forms

```typescript
test('should submit form correctly', async ({ page }) => {
  await page.goto('/form')

  await page.fill('input[name="username"]', 'testuser')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]')

  await expect(page.locator('.success-message')).toBeVisible()
})
```

### Testing PWA Features

```typescript
test('should register service worker', async ({ page, context }) => {
  await page.goto('/')

  // Wait for service worker to register
  await page.waitForFunction(() => {
    return navigator.serviceWorker.controller !== null
  })

  const serviceWorker = await context.serviceWorkers()[0]
  expect(serviceWorker).toBeTruthy()
})

test('should work offline', async ({ page, context }) => {
  await page.goto('/')

  // Go offline
  await context.setOffline(true)

  // Navigate to another page
  await page.goto('/game')

  // Should still load from cache
  await expect(page.locator('h1')).toBeVisible()
})
```

### Mobile Testing

Playwright automatically tests on mobile viewport (Pixel 5). You can also test specific mobile features:

```typescript
test('should be installable as PWA', async ({ page }) => {
  await page.goto('/')

  // Check for manifest
  const manifest = await page.evaluate(() => {
    const link = document.querySelector('link[rel="manifest"]')
    return link?.getAttribute('href')
  })

  expect(manifest).toBeTruthy()
})
```

## Coverage Reports

### Viewing Coverage Locally

After running `npm run test:unit:coverage`, open the coverage report:

```bash
# macOS
open coverage/index.html

# Linux
xdg-open coverage/index.html

# Windows
start coverage/index.html
```

The report shows:
- Overall coverage percentages
- Line-by-line coverage for each file
- Uncovered lines highlighted in red
- Branches not taken

### Coverage in CI

GitLab CI automatically:
1. Generates coverage reports
2. Displays coverage percentage in merge requests
3. Stores coverage artifacts for 30 days
4. Includes coverage report in deployed site at `/test-reports/coverage/`

## Best Practices

### Unit Tests
- Test one thing per test
- Use descriptive test names
- Keep tests simple and focused
- Mock external dependencies
- Test edge cases and error conditions
- Aim for 80%+ coverage

### E2E Tests
- Test critical user flows
- Keep tests independent
- Use data-testid attributes for stable selectors
- Test on multiple viewports
- Test offline/PWA functionality
- Avoid testing implementation details

### General
- Run tests before committing
- Keep tests fast
- Review coverage reports regularly
- Update tests when changing code
- Write tests for bug fixes

## CI/CD Integration

Tests run automatically in GitLab CI:
1. **Unit tests** run in parallel with e2e tests
2. **E2E tests** run against the production build
3. **Build stage** only runs if all tests pass
4. **Deploy stage** only runs if build succeeds

If tests fail:
- Check the CI logs for error details
- Review test artifacts (screenshots, traces)
- Run tests locally to reproduce
- Fix the issue and push again

## Troubleshooting

### Tests timing out
- Increase timeout in test file: `test.setTimeout(60000)`
- Check for missing awaits
- Ensure test server is running

### Flaky tests
- Add proper waits: `await page.waitForSelector()`
- Use retry logic for unstable operations
- Check for race conditions
- Use Playwright's auto-waiting features

### Coverage not updating
- Clear coverage directory: `rm -rf coverage`
- Ensure all source files are being tested
- Check vitest.config.ts coverage settings

### E2E tests failing in CI but passing locally
- Check browser versions
- Verify BASE_URL configuration
- Review CI-specific settings in playwright.config.ts
- Check for timing issues (CI is usually slower)
