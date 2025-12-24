# E2E Testing Guide

This guide explains how to run end-to-end (E2E) tests for the Guess Game PWA using Playwright.

## Overview

The project includes comprehensive E2E tests that can run against:
- **Local builds** - Test before deploying
- **Deployed sites** - Verify production, staging, and development environments

## Test Coverage

The E2E test suite includes:

### 1. Home Page Tests (`tests/e2e/home.spec.ts`)
- Page loads successfully
- Categories display correctly
- Navigation works
- PWA manifest is present
- Service worker registration

### 2. Game Flow Tests (`tests/e2e/game.spec.ts`)
- Starting a new game
- Game interface elements
- Input handling
- Score display
- Navigation back to home

### 3. Offline Functionality (`tests/e2e/offline.spec.ts`)
- App works offline after initial load
- Offline indicator shows when offline
- Online state restoration

### 4. Accessibility Tests (`tests/e2e/accessibility.spec.ts`)
- Proper page structure
- Keyboard navigation
- Accessible forms
- Color contrast

## Running Tests Locally

### Option 1: Quick Local Test
```bash
npm run test:e2e
```
This runs tests against a local build (http://localhost:3000).

### Option 2: Full Local Build Test
```bash
npm run test:e2e:local
# or
./scripts/e2e-local.sh
```
This generates a production build and tests it locally.

### Option 3: Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Option 4: UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

## Testing Deployed Sites

### Test Production Deployment
```bash
npm run test:e2e:production
# or
./scripts/e2e-deployed.sh production
```
Tests: https://djdiox.gitlab.io/guess-game-nuxt-pwa

### Test Staging Deployment
```bash
npm run test:e2e:staging
# or
./scripts/e2e-deployed.sh staging
```
Tests: https://djdiox.gitlab.io/guess-game-nuxt-pwa/staging

### Test Development Deployment
```bash
npm run test:e2e:dev
# or
./scripts/e2e-deployed.sh dev
```
Tests: https://djdiox.gitlab.io/guess-game-nuxt-pwa/dev

### Custom URL
```bash
BASE_URL=https://your-custom-url.com npm run test:e2e
```

## GitLab CI Integration

The GitLab CI pipeline includes E2E tests in the `verify` stage:

### Manual E2E Tests (After Deployment)
After deploying to any environment, you can manually trigger E2E tests:

1. Go to your GitLab project → CI/CD → Pipelines
2. Find the pipeline for your branch
3. In the `verify` stage, click the play button on:
   - `verify:e2e:production` (for main branch)
   - `verify:e2e:staging` (for staging branch)
   - `verify:e2e:dev` (for development branch)

### Test Results
Test results are available as artifacts:
- HTML report: `playwright-report/`
- JSON results: `test-results/results.json`
- JUnit XML: `test-results/junit.xml`
- Screenshots (on failure): `test-results/`

Artifacts expire after 7 days.

## Configuration

### Playwright Configuration
The main configuration is in `playwright.config.ts`:

- **Base URL**: Controlled via `BASE_URL` or `PLAYWRIGHT_TEST_BASE_URL` environment variable
- **Browsers**: Chromium, Firefox, Mobile Chrome
- **Retries**: 2 retries in CI, 0 locally
- **Timeouts**: Extended for deployed sites (network latency)

### Environment Variables
- `BASE_URL`: Override the base URL for testing
- `CI`: Detected automatically in CI environments
- `PLAYWRIGHT_TEST_BASE_URL`: Alternative to BASE_URL

## Debugging Failed Tests

### 1. View HTML Report
```bash
npx playwright show-report
```

### 2. Run Specific Test
```bash
npx playwright test tests/e2e/home.spec.ts
```

### 3. Run in Debug Mode
```bash
npx playwright test --debug
```

### 4. View Trace
After a test failure with retries, traces are captured:
```bash
npx playwright show-trace test-results/.../trace.zip
```

### 5. Screenshots
Screenshots are automatically captured on failure in `test-results/`

## Writing New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/')
    // Your test code
  })
})
```

### Best Practices
1. **Use data-testid attributes** for reliable selectors
2. **Wait for elements** before interacting
3. **Use soft assertions** for multiple checks
4. **Keep tests independent** - each test should work standalone
5. **Use descriptive test names** - explain what you're testing

### Common Patterns
```typescript
// Wait for navigation
await page.waitForURL(/game/)

// Wait for network to be idle
await page.waitForLoadState('networkidle')

// Check visibility with timeout
await expect(element).toBeVisible({ timeout: 5000 })

// Handle optional elements
if (await element.count() > 0) {
  await expect(element).toBeVisible()
}
```

## Troubleshooting

### Tests Fail Locally
- Ensure dependencies are installed: `npm ci`
- Build the app first: `npm run generate`
- Check if port 3000 is available

### Tests Fail on Deployed Site
- Verify the site is accessible: `curl -I <URL>`
- Check for CORS issues
- Ensure service worker has time to register (add delays if needed)

### Playwright Not Found
```bash
npx playwright install
```

### Timeout Errors
Increase timeouts in `playwright.config.ts` or use:
```typescript
await expect(element).toBeVisible({ timeout: 10000 })
```

## CI Pipeline Workflow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────────┐
│  Test   │ --> │  Build  │ --> │  Deploy │ --> │   Verify    │
│ (unit)  │     │ (nuxt)  │     │ (pages) │     │   (e2e)     │
└─────────┘     └─────────┘     └─────────┘     └─────────────┘
                                                  Manual trigger
```

1. **Test stage**: Unit tests run automatically
2. **Build stage**: Nuxt generates static build
3. **Deploy stage**: Deploy to GitLab Pages
4. **Verify stage**: E2E tests run against deployed site (manual)

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Nuxt Testing Guide](https://nuxt.com/docs/getting-started/testing)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)

## Support

For issues or questions:
1. Check the [Playwright documentation](https://playwright.dev/docs/intro)
2. Review existing test examples in `tests/e2e/`
3. Check GitLab CI logs for detailed error messages
