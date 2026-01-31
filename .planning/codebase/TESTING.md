# Testing Patterns

**Analysis Date:** 2026-01-31

## Test Framework

**Unit Test Runner:**

- Framework: Vitest with happy-dom environment
- Config: `apps/game/vitest.config.ts`
- Globals: true (test functions auto-imported)

**E2E Test Framework:**

- Framework: Playwright (v1.57.0)
- Config: `apps/game/playwright.config.ts`
- Reporters: HTML, JSON, JUnit, list, GitHub annotations (in CI)

**Run Commands:**

```bash
# Unit tests
pnpm run test              # Watch mode
pnpm run test:unit         # Run once
pnpm run test:unit:coverage # Run with coverage (coverage disabled due to version conflicts)

# E2E tests
pnpm run test:e2e          # Headless against local build
pnpm run test:e2e:headed   # Show browser window
pnpm run test:e2e:ui       # Interactive UI mode
pnpm run test:e2e:local    # Full local build + test
pnpm run test:e2e:production  # Test production site
pnpm run test:e2e:staging     # Test staging site
pnpm run test:e2e:dev         # Test dev site
```

## Test File Organization

**Unit Tests:**

- Location: `tests/unit/` directory
- Naming: `*.spec.ts` or `*.test.ts` suffix
- Colocated pattern also supported: test file next to source
- Setup file: `tests/unit/setup.ts` runs before all unit tests

**E2E Tests:**

- Location: `tests/e2e/` directory
- Naming: `*.spec.ts` suffix
- Snapshot directory: `tests/e2e/__snapshots__/`
- Helpers: `tests/e2e/helpers/` (faker, diagnostics, waits, etc.)

**Test Utilities:**

- Factories: `tests/unit/factories.spec.ts` has `createCategoryList()` helper
- Global setup: `tests/utils/global-setup.ts`
- Global teardown: `tests/utils/global-teardown.ts`

**Structure:**

```
tests/
├── unit/
│   ├── setup.ts                    # Vitest setup
│   ├── use-logger.spec.ts
│   ├── game-store.spec.ts
│   ├── settings-store.spec.ts
│   └── ...
├── e2e/
│   ├── players.spec.ts
│   ├── game-complete-flow.spec.ts
│   ├── helpers/
│   │   ├── faker.ts
│   │   ├── waits.ts
│   │   └── ...
│   └── __snapshots__/
└── utils/
    ├── global-setup.ts
    └── global-teardown.ts
```

## Unit Test Structure

**Suite Organization:**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '~/stores/game'

describe('Game Store', () => {
  let mockCategories: Category[]

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()

    // Reset Pinia for store tests
    setActivePinia(createPinia())

    // Setup test data
    mockCategories = createCategoryList(10)
  })

  afterEach(() => {
    // Cleanup
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has null currentSession on init', () => {
      const store = useGameStore()
      expect(store.currentSession).toBeNull()
    })
  })

  describe('Actions', () => {
    it('should update state when called', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      expect(store.categories.length).toBeGreaterThan(0)
    })
  })
})
```

**Patterns:**

- Use nested `describe()` blocks for test grouping
- Each test should be isolated and independent
- Descriptive test names: "should [behavior] when [condition]"
- Use `beforeEach` for test setup, `afterEach` for cleanup
- Clear mocks between tests to prevent state leakage

## Mocking

**Framework:** Vitest `vi` module

**Mocking Composables:**

```typescript
vi.mock('~/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    saveGameSession: vi.fn().mockResolvedValue(undefined),
    getGameSession: vi.fn().mockResolvedValue(null),
    saveGameHistory: vi.fn().mockResolvedValue(undefined),
  }),
}))
```

**Mocking Global Functions:**

```typescript
const mockUseRuntimeConfig = vi.fn(() => ({
  public: {
    baseUrl: '/',
    environment: 'test',
    appVersion: '1.0.0-test',
  },
}))

vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)
// Or make globally available in setup
;(globalThis as any).useRuntimeConfig = mockUseRuntimeConfig
```

**Mocking Fetch:**

```typescript
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock as unknown as typeof $fetch)

// In test:
fetchMock.mockResolvedValue(mockData)
```

**Mocking localStorage:**

```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      Reflect.deleteProperty(store, key)
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })
```

**What to Mock:**

- External APIs (PetScan, Google Analytics)
- Database operations (IndexedDB)
- Browser APIs (localStorage, window location)
- Time-dependent functions (use `vi.useFakeTimers()`)
- Async operations that are tested elsewhere

**What NOT to Mock:**

- Vue's reactivity system
- Pinia store state/getters (test the real store)
- Utility functions (test the actual implementation)
- DOM elements in unit tests (use integration tests instead)

## Fixtures and Factories

**Test Data:**

```typescript
// Factory function for creating test data
const createCategoryList = (count: number): Category[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Category ${i + 1}`,
    letter: 'A',
    description: 'Test category',
  }))
}

// In test:
const mockCategories = createCategoryList(10)
fetchMock.mockResolvedValue(mockCategories)
```

**Location:**

- Factory functions in `tests/unit/factories.spec.ts` or as helpers
- Or defined inline in test file for simple cases
- Shared factories exported for use across multiple test files

**Faker Helpers:**

```typescript
// tests/e2e/helpers/faker.ts
export const generatePlayerName = (): string => {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana']
  return names[Math.floor(Math.random() * names.length)]
}
```

## Coverage

**Requirements:** No enforced minimum (coverage disabled due to version conflicts)

**View Coverage:**

```bash
pnpm run test:unit:coverage
# Output to coverage/ directory with LCOV report
```

**Configuration:** (`vitest.config.ts`)

- Provider: v8
- Reporters: text, json-summary, lcov, cobertura
- All files included except: node_modules, tests, configs, type files
- Currently disabled: `coverage: { enabled: false }`

## Test Types

**Unit Tests:**

- Scope: Individual functions, composables, stores
- Approach: Isolated testing with mocked dependencies
- Environment: happy-dom (lightweight DOM)
- Examples: `use-logger.spec.ts`, `settings-store.spec.ts`, `game-store.spec.ts`
- Speed: Fast (< 100ms per test)
- Database: Mock IndexedDB, use real Pinia stores
- Testing stores: Reset Pinia before each test, clear all mocks

**Integration Tests:**

- Scope: Component interactions, store + composable combinations
- Approach: Test how multiple units work together
- Not heavily used in this codebase; tests focus on unit or E2E
- Example: testing a component that uses both a store and composable

**E2E Tests:**

- Framework: Playwright
- Scope: Complete user workflows from UI perspective
- Approach: Test against real application build
- Examples: `game-complete-flow.spec.ts`, `players.spec.ts`, `offline.spec.ts`
- Speed: Slow (5-30 seconds per test)
- Devices: Multiple projects (desktop Chrome, Firefox, mobile phones, tablets)
- Running against deployed sites: Use `BASE_URL` env var
  ```bash
  BASE_URL=https://staging.example.com pnpm run test:e2e
  ```

## Common Patterns

**Async Testing:**

```typescript
it('should load game session', async () => {
  const store = useGameStore()
  await store.fetchCategories()

  expect(store.categories.length).toBeGreaterThan(0)
})

// With mocks:
it('should handle fetch errors', async () => {
  fetchMock.mockRejectedValueOnce(new Error('Network error'))

  const store = useGameStore()
  const categories = await store.fetchCategories()

  expect(categories).toEqual([]) // Or handles error gracefully
})
```

**Error Testing:**

```typescript
it('should log error with context', () => {
  const logger = useLogger()
  const testError = new Error('Test error')
  const context = { userId: '123', action: 'submit' }

  logger.error('Error occurred', testError, context)

  expect(consoleSpy.error).toHaveBeenCalledWith(
    '[ERROR] Error occurred',
    testError,
    expect.objectContaining({
      timestamp: expect.any(String),
      userId: '123',
      action: 'submit',
    })
  )
})
```

**State Mutations:**

```typescript
it('updates state correctly', () => {
  const store = useGameStore()

  // Initial state
  expect(store.isOnline).toBe(true)

  // Mutate via action
  store.setOnlineStatus(false)

  // Verify new state
  expect(store.isOnline).toBe(false)
})
```

**Spying on Calls:**

```typescript
it('calls save method after update', async () => {
  const mockSave = vi.fn().mockResolvedValue(undefined)

  vi.mock('~/composables/useIndexedDB', () => ({
    useIndexedDB: () => ({ saveGameSession: mockSave }),
  }))

  const store = useGameStore()
  await store.fetchCategories()

  expect(mockSave).toHaveBeenCalledWith(expect.any(Object))
})
```

## E2E Test Patterns

**Page Navigation:**

```typescript
test.beforeEach(async ({ page }) => {
  // Navigate to page and wait for content
  await page.goto('/players', { timeout: 30000 })

  // Wait for splash screen to finish
  await page
    .waitForSelector('.splash-screen', { state: 'detached', timeout: 10000 })
    .catch(() => {}) // Ignore if not present

  // Wait for page to be visible
  await page.waitForSelector('.players-page', { state: 'visible' })
})
```

**Element Interactions:**

```typescript
test('should add a player', async ({ page }) => {
  const addBtn = page.locator('.add-btn')
  await expect(addBtn).toBeVisible()

  await addBtn.click()

  const input = page.locator('.player-name-input')
  await input.fill('Alice')

  const confirmBtn = page.locator('.confirm-btn')
  await confirmBtn.click()

  await expect(page.locator('.player-item:not(.empty)')).toHaveCount(2)
})
```

**Waiting Strategies:**

```typescript
// Wait for element visibility
await page.waitForSelector('.splash-screen', { state: 'detached' })

// Wait for specific timeout
await page.waitForTimeout(300)

// Wait for network idle
await page.waitForLoadState('networkidle')

// Wait for condition
await expect(page.locator('.player-count')).toHaveCount(expectedCount)
```

**Using Test Helpers:**

```typescript
import { generatePlayerName } from './helpers/faker'
import { waitForGameLoad, waitForPageTransition } from './helpers/waits'

test('complete game flow', async ({ page }) => {
  const playerName = generatePlayerName()

  await waitForGameLoad(page)
  // Continue with test
})
```

**Screenshots and Traces:**

- Automatically captured on first retry (configured in `playwright.config.ts`)
- Screenshots: `mode: 'only-on-failure'`
- Traces: `trace: 'on-first-retry'`
- Video: `video: 'on-first-retry'`
- View failed test artifacts: Check `test-results/` and `playwright-report/`

**Multiple Devices:**

```typescript
// playwright.config.ts has projects for:
// - Desktop: Chrome, Firefox
// - Mobile: Pixel 5, iPhone 15, Galaxy S9+
// - Tablet: iPad Pro 11

// Run single project:
pnpm run test:e2e -- --project=mobile-chrome-pixel5

// Run only mobile tests:
pnpm run test:e2e -- --grep @mobile
```

## Test Tags for Organization

**Available tags** (used in E2E tests):

- `@smoke` - Quick sanity tests
- `@critical` - Essential user flows
- `@slow` - Long-running tests
- `@mobile` - Mobile-specific tests
- `@tablet` - Tablet-specific tests

**Usage:**

```typescript
test('complete game flow @smoke @critical', async ({ page }) => {
  // Test code
})
```

**Run with tags:**

```bash
# Run only critical tests
pnpm run test:e2e -- --grep @critical

# Run everything except slow tests
pnpm run test:e2e -- --grep-invert @slow
```

## Test Configuration Details

**Vitest Config** (`vitest.config.ts`):

- Environment: happy-dom (lightweight, sufficient for most tests)
- Pool: forks (avoids localStorage issues)
- Setup file: `tests/unit/setup.ts` (initializes Vue, Pinia, Nuxt mocks)
- Include: `tests/unit/**/*.{test,spec}.ts`
- Exclude: node_modules, .nuxt, .output, tests/e2e

**Playwright Config** (`playwright.config.ts`):

- Base URL: `process.env.BASE_URL || localhost:3000`
- Timeout: 60000ms (mobile), adaptive for deployed sites
- Retries: 1 in CI (0 locally)
- Workers: 4 in CI, adaptive locally (50% of CPU cores, max 8)
- Screenshot: Only on failure, full page
- Video: On first retry only
- Trace: On first retry only

## Known Testing Gaps

**Areas with limited coverage:**

- Error scenarios in game submission (see CONCERNS.md)
- Network failure recovery
- Edge cases: 0 players, empty inputs
- Input validation
- Pause/Quit modal interactions

## Best Practices

- Keep unit tests fast (< 100ms)
- Keep E2E tests focused on user workflows, not implementation details
- Use `data-testid` attributes in templates for stable element selection
- Clear mocks between tests to prevent state pollution
- Use factories/fixtures for test data consistency
- Test the behavior, not the implementation
- Group related tests with `describe()` blocks
- Make assertions specific: `toEqual`, `toBe` (not generic matchers)
- Reset Pinia stores before each test to prevent cross-contamination
- Use meaningful test names that describe the scenario

---

_Testing analysis: 2026-01-31_
