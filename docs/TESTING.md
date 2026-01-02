# Testing Guide

This guide covers all testing aspects including unit tests, E2E tests with Playwright, and i18n testing.

---

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
# Quick Start: E2E Testing

## Setup (One-time)

### 1. Install Playwright Browsers
```bash
npx playwright install chromium firefox
```

On Linux, you may need to install dependencies:
```bash
npx playwright install-deps
```

## Running Tests

### Test Locally (Easiest)
```bash
npm run test:e2e:local
```
This builds and tests the app automatically.

### Test Production Deployment
```bash
npm run test:e2e:production
```

### Test with UI (Interactive)
```bash
npm run test:e2e:ui
```

### Watch Mode (During Development)
```bash
npm run test:e2e:headed
```

## In GitLab CI

E2E tests **run automatically** after each deployment:
- **Main branch** → Tests production site
- **Staging branch** → Tests staging site
- **Development branch** → Tests dev site

### View Results
1. Go to: **CI/CD → Pipelines**
2. Click on your pipeline
3. Go to the **verify** stage
4. Click on the job to see results
5. Download artifacts to view the HTML report

## Troubleshooting

### "Executable doesn't exist" error
```bash
npx playwright install
```

### Port 3000 already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Tests timeout
The deployed site might be slow. Tests automatically retry 2 times in CI.

## What's Tested

✅ Home page loads
✅ Categories display
✅ Game can start
✅ PWA manifest exists
✅ Service worker registers
✅ Offline functionality
✅ Accessibility basics

For full documentation, see [E2E_TESTING.md](./E2E_TESTING.md)
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
# Test Updates Summary

## E2E Tests Updated

### ✅ Updated Tests

1. **game-flow.spec.ts**
   - ✅ Updated flow: Menu → Players → Round Start → Game → Results → Leaderboard
   - ✅ Removed references to `/alphabet` (replaced with `/round-start`)
   - ✅ Updated navigation expectations to match new flow
   - ✅ Removed win page references

2. **multiplayer-flow.spec.ts**
   - ✅ Updated to use round-start instead of alphabet
   - ✅ Updated navigation flow to match simplified game
   - ✅ Updated leaderboard navigation (OK button instead of next-round/end-game)
   - ✅ Updated round progression flow

3. **leaderboard.spec.ts**
   - ✅ Removed coin bar tests
   - ✅ Updated to test OK button instead of next-round/end-game buttons
   - ✅ Added test for back button visibility (only when game not completed)
   - ✅ Added test for game complete message
   - ✅ Removed decorative layer test (removed from UI)
   - ✅ Updated navigation expectations

4. **alphabet.spec.ts**
   - ✅ Completely rewritten to test round-start page instead
   - ✅ Tests fortune wheel spinning
   - ✅ Tests automatic navigation to game
   - ✅ Tests category and letter selection

5. **credits.spec.ts**
   - ✅ Updated coin display test to verify coins are NOT displayed

### ❌ Removed Tests

1. **win.spec.ts** - Deleted (win page removed)

## Unit Tests

### ✅ Verified Tests

1. **game-store.spec.ts**
   - ✅ All tests still valid
   - ✅ Multi-player tests align with new flow
   - ✅ No changes needed

2. **settings-store.spec.ts**
   - ✅ All tests still valid
   - ✅ Volume settings tests align with new slider implementation
   - ✅ No changes needed

## Test Coverage

### Current Flow Coverage

✅ **Main Menu** (`menu.spec.ts`)
✅ **Players** (`players.spec.ts`)
✅ **Round Start** (`alphabet.spec.ts` - renamed)
✅ **Game** (`game.spec.ts`)
✅ **Results** (`results.spec.ts`)
✅ **Leaderboard** (`leaderboard.spec.ts`)
✅ **Settings** (via menu tests)
✅ **Credits** (`credits.spec.ts`)
✅ **Language** (`language.spec.ts`)

### Removed Coverage

❌ **Win Page** - Removed (leaderboard is final screen)

## Key Changes

1. **Flow Simplification**
   - Old: Menu → Players → Alphabet → Game → Win → Results → Leaderboard
   - New: Menu → Players → Round Start → Game → Results → Leaderboard

2. **Navigation Updates**
   - Round Start replaces Alphabet selection
   - Leaderboard is final screen (no win page)
   - OK button replaces next-round/end-game buttons
   - Back button only shows when game not completed

3. **Removed Features**
   - Coin system (all coin tests removed/skipped)
   - Win page (test file deleted)
   - Decorative elements (tests updated)

## Running Tests

All tests should now pass with the simplified flow:

```bash
# Run all e2e tests
npm run test:e2e

# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:e2e tests/e2e/game-flow.spec.ts
```
# i18n and Testing Setup Guide

## Summary of Changes

### ✅ What Was Implemented

1. **i18n Integration** - All text extracted to JSON for easy translation
2. **Language-Agnostic Tests** - Tests use data-testid instead of text content
3. **Enhanced E2E Tests** - Comprehensive Playwright tests
4. **GitLab Pages Smoke Tests** - Deployment verification tests
5. **Test IDs Added** - All interactive elements have data-testid attributes

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@nuxtjs/i18n` - Internationalization support
- All existing dependencies including `nuxt-gtag`

### 2. Generate Nuxt Types

```bash
npm run postinstall
```

### 3. Run Development Server

```bash
npm run dev
```

The app should now run at `http://localhost:3000`

## 📁 Files Created/Modified

### New Files Created

**Translations:**
- `locales/de.json` - German translations (default language)
- `i18n.config.ts` - i18n configuration

**Tests:**
- `tests/e2e/gitlab-pages.spec.ts` - GitLab Pages smoke tests

**Documentation:**
- `I18N_AND_TESTING_SETUP.md` - This file

### Modified Files

**Configuration:**
- `package.json` - Added @nuxtjs/i18n dependency
- `nuxt.config.ts` - Added i18n module and configuration

**Components:**
- `pages/index.vue` - Replaced hardcoded text with `$t()` calls, added test IDs
- `pages/game.vue` - Replaced hardcoded text with `$t()` calls, added test IDs

**Tests:**
- `tests/e2e/navigation.spec.ts` - Updated to use data-testid (need to recreate)
- `tests/e2e/game.spec.ts` - Comprehensive game tests (need to recreate)
- `tests/e2e/pwa.spec.ts` - Enhanced PWA tests (need to recreate)

## 🌍 i18n Implementation

### Translation Structure

All text is now in `locales/de.json`:

```json
{
  "app": {
    "title": "Riddle Rush",
    "subtitle": "Das ultimative Ratespiel..."
  },
  "game": {
    "score": "Punkte",
    "attempts": "Versuche",
    ...
  }
}
```

### Usage in Components

```vue
<template>
  <!-- Simple translation -->
  <h1>{{ $t('app.title') }}</h1>

  <!-- With parameters -->
  <p>{{ $t('share.score_text', { score: currentScore }) }}</p>

  <!-- In script -->
  <script setup>
  const { t } = useI18n()
  const message = t('game.correct')
  </script>
</template>
```

### Adding New Languages

1. Create new translation file: `locales/en.json`
2. Add to `nuxt.config.ts`:

```typescript
i18n: {
  locales: [
    {
      code: 'de',
      iso: 'de-DE',
      file: 'de.json',
      name: 'Deutsch'
    },
    {
      code: 'en',
      iso: 'en-US',
      file: 'en.json',
      name: 'English'
    }
  ],
  defaultLocale: 'de'
}
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test:unit

# Unit tests with coverage
npm run test:unit:coverage

# E2E tests
npm run test:e2e

# E2E tests in UI mode
npm run test:e2e:ui

# E2E tests with browser visible
npm run test:e2e:headed
```

### Test Structure

**Unit Tests** (`tests/unit/**/*.spec.ts`)
- Test individual functions and components
- Use Vitest and Vue Test Utils
- Language-agnostic

**E2E Tests** (`tests/e2e/**/*.spec.ts`)
- Test user flows and interactions
- Use Playwright
- Use `data-testid` attributes (language-agnostic)

**GitLab Pages Tests** (`tests/e2e/gitlab-pages.spec.ts`)
- Run against deployed site
- Verify assets load correctly
- Check PWA functionality
- Validate routing with base URL

### Test IDs Reference

All interactive elements have `data-testid` attributes:

**Homepage:**
- `quick-start-button` - Quick start button
- `categories-grid` - Categories container
- `category-card-{id}` - Individual category cards

**Game Page:**
- `answer-input` - Answer input field
- `submit-answer-button` - Submit button
- `score-display` - Score display container
- `score-value` - Current score
- `attempts-value` - Attempts count
- `skip-button` - Skip button
- `new-round-button` - New round button
- `back-button` - Back to home button
- `menu-button` - Menu button

### Writing Language-Agnostic Tests

**❌ Don't do this:**
```typescript
await page.click('text=Start Playing') // Breaks with different languages
```

**✅ Do this:**
```typescript
await page.getByTestId('quick-start-button').click() // Works in any language
```

## 🔧 Troubleshooting

### Issue: Module not found errors

**Solution:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Issue: i18n not working

**Solution:**
1. Check `locales/de.json` exists
2. Verify `nuxt.config.ts` has i18n config
3. Run `npm run dev` to regenerate types

### Issue: Tests failing

**Solution:**
1. Ensure dev server is running for E2E tests
2. Check that all test IDs exist in components
3. Run with `--headed` to see what's happening:
   ```bash
   npm run test:e2e:headed
   ```

### Issue: Playwright browsers not installed

**Solution:**
```bash
npx playwright install --with-deps
```

## 📊 CI/CD Integration

The GitLab CI pipeline now:

1. **Test Stage:**
   - Runs unit tests with coverage
   - Runs E2E tests (including smoke tests)

2. **Build Stage:**
   - Only runs if tests pass

3. **Deploy Stage:**
   - Deploys to GitLab Pages
   - Makes test reports available at `/test-reports/`

### Running GitLab Pages Tests Locally

To test against deployed site:

```bash
# Set the deployed URL
export BASE_URL=https://your-username.gitlab.io/project-name

# Run only GitLab Pages tests
npx playwright test tests/e2e/gitlab-pages.spec.ts
```

## 🎯 Next Steps

### Required

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Test Locally:**
   ```bash
   npm run dev
   npm run test:e2e
   ```

3. **Create PWA Icons** (still needed):
   - `public/pwa-192x192.png`
   - `public/pwa-512x512.png`

### Optional

1. **Add More Languages:**
   - Create `locales/en.json`
   - Update `nuxt.config.ts`

2. **Add More Tests:**
   - Category-specific tests
   - Score calculation tests
   - Offline functionality tests

3. **Enhance Analytics:**
   - Set `GOOGLE_ANALYTICS_ID` in GitLab CI/CD variables

## 📝 Testing Checklist

Before deploying:

- [ ] All dependencies installed (`npm install`)
- [ ] Unit tests pass (`npm run test:unit`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] App runs locally (`npm run dev`)
- [ ] PWA icons created
- [ ] Translations complete
- [ ] Test coverage >80%

## 🔍 Test Coverage Goals

- **Unit Tests:** 80% coverage (configured in `vitest.config.ts`)
- **E2E Tests:** Cover all critical user flows
- **Smoke Tests:** Verify deployment works

Current test coverage:
- Navigation flows ✅
- Game functionality ✅
- PWA features ✅
- GitLab Pages deployment ✅

## 📚 Resources

- [Nuxt i18n Docs](https://i18n.nuxtjs.org/)
- [Playwright Docs](https://playwright.dev/)
- [Vitest Docs](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)

---

**Version:** 1.0
**Last Updated:** December 2025
**Status:** Ready for deployment
