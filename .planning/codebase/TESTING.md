# Testing Patterns

**Analysis Date:** 2026-02-06

## Test Framework

**Runner:**

- Vitest ^3.0.0
- Config: `apps/game/vitest.config.ts`

**Assertion Library:**

- Vitest built-in (Chai-compatible)
- Methods: `expect()`, `toBe()`, `toEqual()`, `toHaveLength()`, etc.

**Run Commands:**

```bash
pnpm run test:unit              # Run all unit tests once
pnpm run test:watch             # Watch mode
pnpm run test:unit:coverage     # With coverage report
pnpm run test                   # Root: runs game tests via Turbo
```

## Test File Organization

**Location:**

- Co-located pattern: `apps/game/tests/unit/` (separate directory)
- Test files: `apps/game/tests/unit/*.spec.ts`
- E2E tests: `apps/game/tests/e2e/*.spec.ts`

**Naming:**

- Unit tests: `{feature-name}.spec.ts` - e.g., `game-store.spec.ts`, `use-form.spec.ts`
- E2E tests: `{page-or-flow}.spec.ts` - e.g., `game-complete-flow.spec.ts`, `players.spec.ts`

**Structure:**

```
apps/game/tests/
├── e2e/                        # Playwright E2E tests
│   ├── game-complete-flow.spec.ts
│   ├── players.spec.ts
│   ├── leaderboard.spec.ts
│   └── helpers/
│       └── faker.ts
├── unit/                       # Vitest unit tests
│   ├── setup.ts               # Global test setup
│   ├── game-store.spec.ts
│   ├── use-form.spec.ts
│   └── factories.spec.ts
└── utils/
    ├── factories.ts           # Test data factories
    ├── global-setup.ts        # E2E global setup
    └── global-teardown.ts     # E2E global teardown
```

## Test Structure

**Suite Organization:**

```typescript
describe('Game Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const pinia = createPinia()
    setActivePinia(pinia)
    // Setup mocks
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

  describe('Category Fetching', () => {
    it('fetches categories', async () => {
      const store = useGameStore()
      await store.fetchCategories()
      expect(fetchMock).toHaveBeenCalled()
    })
  })
})
```

**Patterns:**

- Nested `describe()` blocks for logical grouping
- `beforeEach()` for setup - Pinia activation, mock resets
- `afterEach()` for cleanup - clear timers and mocks
- One assertion focus per test (but multiple expects allowed for context)
- Descriptive test names: `'should update field value'`, `'returns null for unknown id'`

## Mocking

**Framework:** Vitest `vi` API

**Patterns:**

**Mock modules:**

```typescript
vi.mock('~/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    saveGameSession: mockSaveGameSession,
    getGameSession: mockGetGameSession,
    getGameSessionById: mockGetGameSessionById,
  }),
}))
```

**Mock functions:**

```typescript
const mockSaveGameSession = vi.fn().mockResolvedValue(undefined)
const mockGetGameSession = vi.fn().mockResolvedValue(null)
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock as unknown as typeof $fetch)
```

**Mock Nuxt composables (in setup file):**

```typescript
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
})
```

**What to Mock:**

- External APIs and database calls (`$fetch`, IndexedDB composables)
- Nuxt runtime composables (`useRuntimeConfig`, `useRouter`, `useRoute`)
- Time-dependent functions (use `vi.useFakeTimers()` when needed)
- Browser APIs not available in test environment

**What NOT to Mock:**

- The code under test itself
- Simple utility functions (test them directly)
- Vue reactivity system (use real Vue in tests)

## Fixtures and Factories

**Test Data:**

```typescript
// From apps/game/tests/utils/factories.ts
export const createCategoryList = (count: number): Category[] => {
  const categories: Category[] = []
  for (let i = 0; i < count; i++) {
    categories.push({
      id: i + 1,
      name: `Category ${i + 1}`,
      terms: [`Term ${i}-1`, `Term ${i}-2`],
    })
  }
  return categories
}
```

**E2E Faker helpers:**

```typescript
// From apps/game/tests/e2e/helpers/faker.ts
import { faker } from '@faker-js/faker'

export function generatePlayerName(): string {
  return faker.person.firstName()
}

export function generateAnswer(): string {
  return faker.word.noun()
}
```

**Location:**

- Unit test factories: `apps/game/tests/utils/factories.ts`
- E2E helpers: `apps/game/tests/e2e/helpers/`
- Used to create consistent, realistic test data

## Coverage

**Requirements:** 80% threshold (currently disabled due to version conflicts)

**Configuration in `vitest.config.ts`:**

```typescript
coverage: {
  enabled: false, // Disabled due to version conflicts
  provider: 'v8',
  reporter: ['text', 'json-summary', 'lcov', 'cobertura'],
  reportsDirectory: './coverage',
  exclude: [
    'node_modules/',
    'tests/',
    '**/*.spec.ts',
    '**/*.test.ts',
    '.nuxt/',
    '.output/',
    '**/*.config.ts',
    '**/types.ts',
  ],
  all: true,
  skipFull: false,
}
```

**View Coverage:**

```bash
pnpm run test:unit:coverage
open coverage/index.html
```

## Test Types

**Unit Tests:**

- Scope: Individual composables, stores, utility functions
- Approach: Isolated testing with mocked dependencies
- Location: `apps/game/tests/unit/`
- Examples: `game-store.spec.ts`, `use-form.spec.ts`, `use-logger.spec.ts`
- Environment: `happy-dom` for DOM simulation

**Integration Tests:**

- Scope: Not formally separated - integrated into E2E tests
- Approach: Full user flows across multiple pages
- Examples: Complete game flow from menu → players → game → results → leaderboard

**E2E Tests:**

- Framework: Playwright ^1.49.1
- Config: `apps/game/playwright.config.ts`
- Scope: Full browser automation, multi-page flows
- Location: `apps/game/tests/e2e/`
- Examples: `game-complete-flow.spec.ts`, `players.spec.ts`, `offline.spec.ts`

**E2E Run Commands:**

```bash
pnpm run test:e2e               # Headless
pnpm run test:e2e:headed        # Show browser
pnpm run test:e2e:ui            # Interactive UI mode
pnpm run test:e2e:simple        # Simplified config
pnpm run test:bdd               # BDD tests (generate + run)
```

## Common Patterns

**Async Testing:**

```typescript
it('fetches categories', async () => {
  const store = useGameStore()
  await store.fetchCategories()
  expect(fetchMock).toHaveBeenCalled()
  expect(store.categories).toEqual(mockCategories)
})
```

**Error Testing:**

```typescript
it('should throw error when session not found', async () => {
  const store = useGameStore()
  mockGetGameSessionById.mockResolvedValue(null)

  await expect(store.loadSessionById('non-existent')).rejects.toThrow('Failed to load game session')
})
```

**Reactive State Testing:**

```typescript
it('makes form dirty', () => {
  const form = useForm({
    username: { initialValue: '' },
  })

  form.handleChange('username', 'alice')
  expect(form.isDirty.value).toBe(true)
})
```

**Pinia Store Testing (critical pattern):**

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  const pinia = createPinia()
  setActivePinia(pinia)
  // Force reset all stores
  // @ts-expect-error: Accessing internal Pinia API for test cleanup
  pinia._s.forEach((store: any) => store.$reset())
})
```

**Mock clearing:**

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  mockGetGameSession.mockResolvedValue(null)
  fetchMock.mockClear()
})
```

## Playwright E2E Patterns

**Wait for page ready:**

```typescript
async function waitForPageReady(page: Page, selector: string, timeout = 10000) {
  await page.waitForLoadState('networkidle')
  await page.waitForSelector(selector, { timeout })
}
```

**Handle dialogs:**

```typescript
page.once('dialog', async (dialog) => {
  expect(dialog.type()).toBe('prompt')
  await dialog.accept('Player Name')
})
await page.locator('.add-btn').click()
```

**Data-testid selectors (language-agnostic):**

```typescript
const nextBtn = page.locator('[data-testid="next-button"]')
await expect(nextBtn).toBeVisible()
await nextBtn.click()
```

**Multi-device testing:**

- Projects: `mobile-chrome-pixel5`, `mobile-safari-iphone15`, `tablet-ipad`, `mobile-chrome-galaxy`
- Configured in `playwright.config.ts` using Playwright device emulation

**Test tagging:**

```typescript
test('my test @smoke @critical', async ({ page }) => {
  // Run with: npx playwright test --grep @smoke
})
```

## Skipped Tests Pattern

**When tests need fixing (CI issues):**

```typescript
it.skip('does not refetch if already loaded', async () => {
  // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
  const store = useGameStore()
  await store.fetchCategories()
  await store.fetchCategories()
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
```

**Pattern:** Use `.skip()` with comment explaining why and what needs fixing

## Test Configuration

**Vitest:**

- Globals enabled: `globals: true`
- Environment: `happy-dom` (lightweight DOM simulation)
- Pool: `forks` (avoids localStorage warnings)
- Setup file: `tests/unit/setup.ts`
- Auto-imports: Vue, Vue Router, Pinia (via unplugin-auto-import)

**Playwright:**

- Parallel execution: `fullyParallel: true`
- Retries: 1 in CI, 0 locally
- Workers: Adaptive based on CPU (4-8 workers)
- Timeout: 60s-90s (longer for mobile/deployed tests)
- Reporters: HTML, list, JSON, JUnit, GitHub Actions annotations
- Screenshots: Full page on failure
- Video: On first retry
- Traces: On first retry

**Environment Variables:**

- `BASE_URL` - Test deployed sites (e.g., `https://riddlerush.de`)
- `CI` - Detect CI environment for different config
- `DISABLE_SECURITY` - Disable security headers for testing

## BDD Testing Support

**Framework:** Custom BDD generator + Playwright

**Commands:**

```bash
pnpm run test:bdd               # Generate + run BDD tests
pnpm run test:bdd:headed        # BDD with visible browser
pnpm run test:bdd:generate      # Only generate test files
```

**Pattern:** Generate JavaScript test files from feature specifications

---

_Testing analysis: 2026-02-06_
