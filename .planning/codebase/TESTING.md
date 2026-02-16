# Testing Patterns

**Analysis Date:** 2026-02-13

## Test Framework

**Unit Test Runner:**

- Vitest 3.x with `happy-dom` environment
- Config: `apps/game/vitest.config.ts`
- Pool: `forks` (avoids `--localstorage-file` warning with happy-dom)
- Globals: enabled (`describe`, `it`, `expect`, `vi` available without imports)

**E2E Test Runner:**

- Playwright (latest) with multi-device mobile profiles
- Config: `apps/game/playwright.config.ts`
- Fully parallel execution with smart retry (1 retry in CI)

**Assertion Library:**

- Vitest built-in `expect` (Chai-compatible)
- Playwright `expect` with custom timeouts

**Run Commands:**

```bash
pnpm run test:unit              # Run all unit tests
pnpm run test:unit -- --watch   # Watch mode (in apps/game)
pnpm run test:e2e               # Run all E2E tests
pnpm run test:e2e -- --grep @smoke  # Run tagged E2E tests
```

## Test File Organization

**Location:**

- Unit tests: `apps/game/tests/unit/` — flat directory, NOT co-located with source
- E2E tests: `apps/game/tests/e2e/` — flat directory
- E2E helpers: `apps/game/tests/e2e/helpers/` — shared utilities (barrel file at `index.ts`)
- Test utilities: `apps/game/tests/utils/` — factories, global setup/teardown
- Test setup: `apps/game/tests/unit/setup.ts` — Vitest setup file

**Naming:**

- Unit tests: `{kebab-case-name}.spec.ts` — matches source file name in kebab-case
  - Composable tests: `use-{name}.spec.ts` (e.g., `use-toast.spec.ts`, `use-form.spec.ts`)
  - Store tests: `{name}-store.spec.ts` (e.g., `game-store.spec.ts`, `settings-store.spec.ts`)
  - Utility tests: `{name}.spec.ts` (e.g., `factories.spec.ts`, `routes.spec.ts`)
- E2E tests: `{feature-name}.spec.ts` (e.g., `credits.spec.ts`, `round-start.spec.ts`, `game-complete-flow.spec.ts`)

**Structure:**

```
apps/game/
├── tests/
│   ├── unit/
│   │   ├── setup.ts                    # Global test setup (mocks, Vue init)
│   │   ├── use-toast.spec.ts           # Composable test
│   │   ├── use-form.spec.ts            # Composable test
│   │   ├── use-logger.spec.ts          # Composable test
│   │   ├── use-navigation.spec.ts      # Composable test
│   │   ├── use-local-storage.spec.ts   # Composable test
│   │   ├── use-loading.spec.ts         # Composable test
│   │   ├── use-modal.spec.ts           # Composable test
│   │   ├── use-lodash.spec.ts          # Composable test
│   │   ├── use-feature-flags.spec.ts   # Composable test
│   │   ├── use-performance.spec.ts     # Composable test
│   │   ├── use-page-swipe.spec.ts      # Composable test
│   │   ├── use-category-emoji.spec.ts  # Composable test
│   │   ├── use-assets.spec.ts          # Composable test
│   │   ├── use-menu.spec.ts            # Composable test
│   │   ├── game-store.spec.ts          # Store test
│   │   ├── settings-store.spec.ts      # Store test
│   │   ├── reactivity-improvements.spec.ts  # Feature test
│   │   ├── routes.spec.ts              # Shared package test
│   │   └── factories.spec.ts           # Factory test
│   ├── e2e/
│   │   ├── credits.spec.ts             # Page test
│   │   ├── language.spec.ts            # Feature test
│   │   ├── leaderboard.spec.ts         # Feature test
│   │   ├── players.spec.ts             # Feature test
│   │   ├── results.spec.ts             # Feature test
│   │   ├── round-start.spec.ts         # Feature test
│   │   ├── game-complete-flow.spec.ts  # End-to-end flow
│   │   ├── offline.spec.ts             # PWA/offline test
│   │   ├── debug-console.spec.ts       # Dev tools test
│   │   └── helpers/
│   │       ├── index.ts                # Barrel file
│   │       ├── waits.ts                # Game state wait utilities
│   │       ├── assets.ts               # Asset loading verification
│   │       ├── mobile.ts               # Mobile device utilities
│   │       ├── realtime.ts             # WebSocket test utilities
│   │       ├── diagnostics.ts          # Debug and reporting
│   │       └── faker.ts               # Test data generation
│   └── utils/
│       ├── factories.ts                # Test data factories
│       ├── test-utils.ts               # Shared test utilities
│       ├── global-setup.ts             # Playwright global setup
│       └── global-teardown.ts          # Playwright global teardown
```

## Test Structure

**Suite Organization (Composable Test):**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useToast } from '../../composables/useToast'

describe('useToast', () => {
  let toast: ReturnType<typeof useToast>

  beforeEach(() => {
    toast = useToast()
    toast.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('show', () => {
    it('should add a toast to the list', () => {
      toast.show('Test message', 'info', 3000)
      expect(toast.toasts.value).toHaveLength(1)
      expect(toast.toasts.value[0]!.message).toBe('Test message')
    })
  })
})
```

**Suite Organization (Store Test):**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../stores/game'
import { createCategoryList } from '../utils/factories'
import type { Category } from '@riddle-rush/types/game'

// Module-level mocks BEFORE describe blocks
const mockSaveGameSession = vi.fn().mockResolvedValue(undefined)
vi.mock('~/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    saveGameSession: mockSaveGameSession,
  }),
}))

describe('Game Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has null currentSession on init', () => {
      const store = useGameStore()
      expect(store.currentSession).toBeNull()
    })
  })
})
```

**Patterns:**

- Setup: `beforeEach` initializes composable/store instance and clears mocks
- Teardown: `afterEach` restores real timers and clears mocks
- Grouping: Nested `describe` blocks per feature/method (e.g., `describe('show', () => { ... })`)
- Assertions: Descriptive `it` statements starting with "should" or present tense verb (e.g., `'should add a toast to the list'`, `'has null currentSession on init'`)
- Non-null assertion: Use `!` on array access in tests when index is guaranteed (e.g., `toast.toasts.value[0]!.message`)

## Mocking

**Framework:** Vitest `vi` built-in mocking

**Module Mocking Pattern:**

```typescript
// Mock composable modules at top of file (before describe)
const mockSaveGameSession = vi.fn().mockResolvedValue(undefined)
const mockGetGameSession = vi.fn().mockResolvedValue(null)

vi.mock('~/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    saveGameSession: mockSaveGameSession,
    getGameSession: mockGetGameSession,
  }),
}))
```

**Global Stub Pattern:**

```typescript
// Stub global $fetch
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock as unknown as typeof $fetch)
```

**Nuxt Composable Mocking (setup.ts):**

```typescript
// Global mocks for Nuxt composables (in tests/unit/setup.ts)
const mockUseRuntimeConfig = vi.fn(() => ({
  public: {
    baseUrl: '/',
    environment: 'test',
    appVersion: '1.0.0-test',
  },
}))

Object.assign(globalThis, {
  useRuntimeConfig: mockUseRuntimeConfig,
  useRoute: mockUseRoute,
  useRouter: mockUseRouter,
  useNuxtApp: mockUseNuxtApp,
})
```

**Timer Mocking:**

```typescript
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// In test:
vi.advanceTimersByTime(1000)
```

**Console Spy:**

```typescript
const consoleSpy = vi.spyOn(console, 'warn')
// ... trigger action ...
expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('warning'))
```

**What to Mock:**

- External composables used by the unit under test (`useIndexedDB`, `useStatistics`, `useErrorSync`)
- Nuxt auto-imported composables (`useRuntimeConfig`, `useRoute`, `useRouter`, `useNuxtApp`)
- Browser APIs (`$fetch`, `localStorage`, `window.location`)
- Timer functions (when testing timeout/debounce behavior)

**What NOT to Mock:**

- Vue reactivity system (`ref`, `reactive`, `computed`) — use real implementations
- The unit under test itself
- Simple utility functions with no side effects
- Pinia store internals — use `setActivePinia(createPinia())` for real store instances

## Fixtures and Factories

**Test Data Factories (`apps/game/tests/utils/factories.ts`):**

```typescript
import { faker } from '@faker-js/faker'
import type { Category, GameSession, Player } from '@riddle-rush/types/game'

// Factory with Partial<T> override pattern
export const createCategory = (overrides: Partial<Category> = {}): Category => {
  return {
    id: overrides.id ?? randomInt(1, 10_000),
    name: overrides.name ?? faker.person.firstName(),
    searchWord: overrides.searchWord ?? 'default',
    key: overrides.key ?? `key_${overrides.id ?? 1}`,
    searchProvider: overrides.searchProvider ?? 'offline',
    letter: overrides.letter ?? randomLetter(),
  }
}

// List factory with per-item overrides
export const createCategoryList = (
  count: number,
  overrides: Array<Partial<Category> | undefined> = []
): Category[] =>
  Array.from({ length: count }, (_, index) => {
    const override = overrides[index] ?? {}
    return createCategory({ id: index + 1, ...override })
  })

// Player factory
export const createPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: overrides.id ?? faker.string.uuid(),
  name: overrides.name ?? faker.person.firstName(),
  totalScore: overrides.totalScore ?? randomInt(0, 100),
  currentRoundScore: overrides.currentRoundScore ?? randomInt(0, 20),
  hasSubmitted: overrides.hasSubmitted ?? Math.random() > 0.5,
})
```

**Factory Design Rules:**

- Every factory accepts `Partial<T>` overrides as the last parameter
- Use `??` (nullish coalescing) for applying defaults — allows `0` and `false` as valid overrides
- Use `@faker-js/faker` for realistic data generation
- Provide list factories (`createCategoryList`, `createPlayerList`) for bulk data
- Export specialized helpers: `createValidAnswer(letter)`, `createInvalidAnswer(letter)`

**Location:**

- Shared factories: `apps/game/tests/utils/factories.ts`
- E2E data helpers: `apps/game/tests/e2e/helpers/faker.ts`

## Coverage

**Requirements:** No enforced thresholds (coverage is disabled due to version conflicts)

**Configuration (`apps/game/vitest.config.ts`):**

```typescript
coverage: {
  enabled: false,  // Disabled due to version conflicts
  provider: 'v8',
  reporter: ['text', 'json-summary', 'lcov', 'cobertura'],
  reportsDirectory: './coverage',
  exclude: ['node_modules/', 'tests/', '**/*.spec.ts', '.nuxt/', '.output/', '**/*.config.ts', '**/types.ts'],
  all: true,
}
```

**View Coverage (when enabled):**

```bash
pnpm --filter @riddle-rush/game test:unit -- --coverage
```

## Test Types

**Unit Tests:**

- Scope: Individual composables, stores, and utility functions
- 19 spec files in `apps/game/tests/unit/`
- Tests composable return values, reactive behavior, store state/getters/actions
- Uses real Vue reactivity (initialized in `setup.ts` via `createApp()`)
- Uses real Pinia stores (via `setActivePinia(createPinia())`)
- Mocks external dependencies (IndexedDB, network, Nuxt composables)

**E2E Tests:**

- Scope: Full user flows through the browser
- 9 spec files in `apps/game/tests/e2e/`
- Framework: Playwright with multi-device profiles
- Mobile-first: Tests run on Pixel 5, iPhone 15, iPad Pro 11, Galaxy S9+
- Targets: Credits page, language selection, leaderboard, players, results, round start, complete game flow, offline/PWA, debug console
- Uses CSS class selectors for element location (e.g., `.credits-page`, `.splash-screen`, `.credit-name`)

**Integration Tests:**

- Not a separate category — store tests serve as integration tests (stores orchestrate composables + IndexedDB)

## Common Patterns

**Store Testing Setup:**

```typescript
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  vi.clearAllMocks()
  const pinia = createPinia()
  setActivePinia(pinia)
  // Reset all stores
  // @ts-expect-error: Accessing internal Pinia API for test cleanup
  pinia._s.forEach((store: any) => store.$reset())
})
```

**Async Testing:**

```typescript
it('fetches categories', async () => {
  const store = useGameStore()
  await store.fetchCategories()
  expect(fetchMock).toHaveBeenCalled()
  expect(store.categories).toEqual(mockCategories)
})

it('handles async errors gracefully', async () => {
  mockUpdateStatistics.mockRejectedValueOnce(new Error('stats failed'))
  await expect(store.endGame()).resolves.toBeUndefined()
})
```

**Error Testing:**

```typescript
it('should throw error when session not found', async () => {
  const store = useGameStore()
  mockGetGameSessionById.mockResolvedValue(null)
  await expect(store.loadSessionById('non-existent')).rejects.toThrow('Failed to load game session')
})

it('should return false on error', async () => {
  const result = await form.handleSubmit(async () => {
    throw new Error('Submission failed')
  })
  expect(result).toBe(false)
})
```

**Timer Testing:**

```typescript
it('should auto-remove toast after duration', () => {
  toast.show('Test message', 'info', 1000)
  expect(toast.toasts.value).toHaveLength(1)
  vi.advanceTimersByTime(1000)
  expect(toast.toasts.value).toHaveLength(0)
})
```

**Skipped Tests:**

```typescript
// Use it.skip with TODO comment explaining why
it.skip('does not refetch if already loaded', async () => {
  // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
  const store = useGameStore()
  await store.fetchCategories()
  await store.fetchCategories()
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
```

**E2E Page Navigation Pattern:**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Credits Page', () => {
  test('should load credits page successfully', async ({ page }) => {
    await page.goto('/credits')
    await page.waitForLoadState('networkidle')
    await waitForSplashComplete(page)
    await page.waitForSelector('.credits-page', { timeout: 10000 })

    const titleImage = page.locator('.title-image')
    await expect(titleImage).toBeVisible({ timeout: 10000 })
  })
})
```

**E2E Splash Screen Wait:**

```typescript
async function waitForSplashComplete(page: Page) {
  await page.waitForTimeout(1000)
  const splashScreen = page.locator('.splash-screen')
  await splashScreen.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
    // Splash might already be gone
  })
  await page.waitForTimeout(500)
}
```

## E2E Test Infrastructure

**Device Profiles (`apps/game/playwright.config.ts`):**

| Project Name             | Device      | Excluded Tags  |
| ------------------------ | ----------- | -------------- |
| `mobile-chrome-pixel5`   | Pixel 5     | `@tablet`      |
| `mobile-safari-iphone15` | iPhone 15   | `@tablet`      |
| `tablet-ipad`            | iPad Pro 11 | `@mobile-only` |
| `mobile-chrome-galaxy`   | Galaxy S9+  | `@tablet`      |

**Test Tags:**

- `@smoke` — Core smoke tests
- `@critical` — Critical path tests
- `@slow` — Long-running tests
- `@mobile` — Mobile-specific tests
- `@tablet` — Tablet-specific tests
- `@mobile-only` — Tests excluded from tablet

**Timeouts:**

- Default: 60s (local), 90s (deployed)
- Navigation: 30s (deployed)
- Action: 15s (deployed), 10s (tablet local)
- Expect: 5s (local), 10s (deployed)
- Snapshot threshold: 0.2

**Reporting:**

- HTML report (auto-open: never) at `playwright-report/`
- List reporter (console)
- JSON results at `test-results/results.json`
- JUnit XML at `junit.xml`
- GitHub Actions annotations (CI only)

**Artifacts:**

- Screenshots: on failure (full page)
- Video: on first retry
- Trace: on first retry
- Output directory: `test-results/`
- Snapshot directory: `tests/e2e/__snapshots__/`

**E2E Helpers Library:**

- `waitForGameState(page, state)` — Wait for Pinia game state via `page.waitForFunction`
- `waitForRoundTransition(page)` — Wait for round number to increment
- `waitForPageReady(page, selector)` — Wait for Vue hydration + network idle + assets
- `waitForNetworkIdle(page, options)` — Custom network idle with configurable threshold
- `waitForAnimationComplete(page, selector)` — Wait for CSS/JS animations to finish
- `waitForWebSocketConnection(page)` — Wait for WebSocket to connect
- `withRetry(fn, options)` — Exponential backoff retry wrapper
- `verifyImagesLoaded(page)` — Verify all non-lazy images loaded
- `verifyResponsiveLayout(page)` — Check responsive design
- `verifyTouchTargets(page)` — Validate touch target sizes (44px minimum)
- `captureGameState(page)` — Capture Pinia state snapshot for debugging

## Test Setup File

**`apps/game/tests/unit/setup.ts`:**

1. Makes Vue, VueRouter, and Pinia exports globally available via `Object.assign(globalThis, ...)`
2. Creates global mocks for Nuxt composables: `useRuntimeConfig`, `useRoute`, `useRouter`, `useNuxtApp`
3. Initializes Vue reactivity context in `beforeEach` by creating and unmounting a minimal Vue app
4. Clears all mocks in `beforeEach` via `vi.clearAllMocks()`

**Auto-Import Plugin (vitest config):**

```typescript
AutoImport({
  imports: ['vue', 'vue-router', 'pinia'],
  dts: false,
})
```

This makes `ref`, `reactive`, `computed`, `watch`, `defineStore`, `storeToRefs`, etc. available in test files without explicit imports, matching the Nuxt auto-import behavior.

---

_Testing analysis: 2026-02-13_
