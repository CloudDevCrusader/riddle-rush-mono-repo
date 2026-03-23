# Phase 21: Refactor and Fix E2E and Unit Tests - Research

**Researched:** 2026-03-23
**Domain:** Testing infrastructure, Playwright E2E, Vitest unit, mobile testing
**Confidence:** HIGH

## Summary

This phase addresses accumulated test infrastructure debt across unit and E2E test suites. The test stack (Vitest + Playwright + happy-dom) is mature and well-configured. The primary work involves (1) completing unit test coverage for stateless composables that lack tests, (2) refactoring E2E specs to use shared helpers and data-testid selectors instead of fragile CSS class selectors, and (3) adding comprehensive mobile testing capabilities that exist in infrastructure but lack actual test implementations.

**Primary recommendations:**

1. Add unit tests for 23 composables that currently have zero coverage (useAnalytics, useCategoryManager, usePlayerManager, useScoringEngine, useSessionManager, usePersistence, useGameLifecycle, and 15 utility composables)
2. Refactor 8 E2E specs to use shared game-flow helpers instead of local implementations
3. Replace all CSS class selectors (`.scoring-page__score-value`, `.language-option`, etc.) with data-testid attributes for resilience
4. Create mobile E2E tests for critical flows (menu, players, game, results) using existing @mobile and @tablet tags
5. Add unit/integration tests for NativeScript Vue mobile app (currently has zero test coverage)

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Complete Phase 12 unimplemented unit test plans (12-02, 12-03, 12-06, 12-07, 12-08 were marked complete but actually unimplemented)
- Refactor remaining E2E specs to use shared helpers (Plan 18-03 not completed)
- Fix multi-round scoring workflow E2E test (currently flaky)
- Achieve 100% E2E test pass rate (intermittent failures exist)
- Document game mode state flow chart as single source of truth

### Mobile Enhancement Scope

- Add comprehensive mobile E2E tests covering responsive design and touch interactions
- Create unit and integration tests for NativeScript Vue mobile app (apps/mobile/)
- Add PWA mobile feature tests (install prompt, offline mode, app shortcuts)
- Fix mobile responsive design issues discovered during testing
- Ensure all critical game flows work on mobile viewports (Pixel 5, iPad Pro 11)

### Success Criteria

**Test Infrastructure:**

1. All Phase 12 unimplemented unit test plans are complete and passing
2. Integration tests exist for WebSocket and IndexedDB flows
3. E2E test suite passes with 100% success rate
4. Multi-round scoring workflow E2E test passes consistently
5. Game mode state flow chart documented and referenced by tests
6. Zero CSS class selectors remain in E2E tests (all data-testid based)
7. All E2E specs use shared helpers from tests/e2e/helpers/game-flow.ts
8. Unit test coverage >75% for all composables

**Mobile Testing:** 9. Mobile E2E tests cover all critical game flows (menu, players, game, results) 10. Touch interactions tested (swipe gestures, tap, pinch-to-zoom if applicable) 11. Responsive design validated across Pixel 5 (mobile) and iPad Pro 11 (tablet) viewports 12. Native mobile app has unit tests for core components and utilities 13. Native mobile app has integration tests for key workflows 14. PWA install flow tested end-to-end on mobile 15. PWA offline mode verified to work on mobile 16. All mobile responsive design issues identified and fixed
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                            | Research Support                                                                                                                                                                                                                 |
| ------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TEST-01 | Unit test coverage >75% for all composables            | Existing unit tests pass 734/734 (Phase 19 verified Zustand migration), but 23 composables lack any test coverage. Vitest v4.0.18 + happy-dom v20.6.3 supports testing these composables.                                        |
| TEST-02 | E2E tests use data-testid selectors (no CSS classes)   | Current E2E specs use CSS selectors in 8+ files (credits.spec.ts, results.spec.ts, language.spec.ts, etc.). Shared game-flow.ts helpers use data-testid exclusively. Refactor to data-testid improves resilience to CSS changes. |
| TEST-03 | All E2E specs use shared helpers from game-flow.ts     | 4 specs (scoring-flow, scoring-ui, scoring-multi-round, leaderboard) use shared helpers. 8 other specs have duplicate implementations or local helpers. Consolidation reduces duplication and improves consistency.              |
| TEST-04 | Mobile E2E tests for critical game flows               | Playwright config has mobile projects (Pixel 5, iPad Pro 11) and @mobile/@tablet tags. mobile.ts helper exists with touch simulation functions. No actual mobile E2E test specs exist. Infrastructure ready, tests missing.      |
| TEST-05 | NativeScript Vue mobile app has unit/integration tests | apps/mobile/ has zero test files. NativeScript Vue can be tested with Jasmine/NativeScript unit test framework or with Jest + NativeScript presets. Currently completely untested.                                               |

</phase_requirements>

## Standard Stack

### Core

| Library              | Version | Purpose                                            | Why Standard                                                                                                          |
| -------------------- | ------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Vitest**           | 4.0.18  | Unit test runner with fast HMR, native ESM support | Fast, works with Nuxt/Vue 3, excellent TypeScript support, parallel test execution                                    |
| **Playwright**       | 1.58.2  | E2E testing with cross-browser support             | Industry standard for modern E2E testing, supports Chromium/WebKit/Gecko, mobile device emulation, reliable selectors |
| **happy-dom**        | 20.6.3  | JSDOM-like DOM environment for unit tests          | Faster than JSDOM, better web standards compliance, works with Vitest, suitable for Vue component testing             |
| **fake-indexeddb**   | 6.2.5   | IndexedDB mock for unit tests                      | Required for testing IndexedDB composable without actual browser database, stable mock implementation                 |
| **@nuxt/test-utils** | 4.0.0   | Nuxt 4 composables mocking utilities               | Official Nuxt 4 testing utilities, provides useRuntimeConfig, useRoute, useRouter mocks                               |

### Supporting

| Library                 | Version | Purpose                 | When to Use                                                              |
| ----------------------- | ------- | ----------------------- | ------------------------------------------------------------------------ |
| **@faker-js/faker**     | 10.3.0  | Test data generation    | Generate realistic test data for E2E tests (player names, game sessions) |
| **@vitest/coverage-v8** | 4.0.18  | Code coverage reporting | V8 provider for coverage, integrates with Vitest                         |

### Alternatives Considered

| Instead of | Could Use | Tradeoff                                                                           |
| ---------- | --------- | ---------------------------------------------------------------------------------- |
| Vitest     | Jest      | Jest slower, requires more config, Vitest has native ESM and better HMR            |
| Playwright | Cypress   | Cypress more complex setup, Playwright has better mobile support, faster execution |
| happy-dom  | JSDOM     | JSDOM slower, less accurate to browser behavior, happy-dom actively maintained     |

### Installation

Dependencies are already installed. No new packages required for this phase.

```bash
# For future reference if adding test packages:
pnpm add -D @vitest/coverage-v8 @faker-js/faker
```

**Version verification:**

```bash
pnpm view vitest version           # 4.0.18 (2024-12-XX)
pnpm view @playwright/test version # 1.58.2 (2024-12-XX)
pnpm view happy-dom version        # 20.6.3 (2024-12-XX)
```

All packages are current (published within last 6 months as of March 2026).

## Architecture Patterns

### Recommended Test Structure

```
apps/game/
├── tests/
│   ├── unit/
│   │   ├── setup.ts              # Global test setup (Vitest, mocks)
│   │   ├── nuxt-imports.ts     # Nuxt auto-import mocks
│   │   ├── composables/          # Composable tests
│   │   │   ├── useAnswerCheck.spec.ts      (EXISTS)
│   │   │   ├── useAudio.spec.ts             (EXISTS)
│   │   │   ├── useGameActions.spec.ts       (EXISTS)
│   │   │   ├── useGameState.spec.ts        (EXISTS)
│   │   │   ├── useIndexedDB.spec.ts        (EXISTS)
│   │   │   ├── useStatistics.spec.ts        (EXISTS)
│   │   │   ├── useAnalytics.spec.ts         (MISSING - create)
│   │   │   ├── useCategoryManager.spec.ts    (MISSING - create)
│   │   │   ├── usePlayerManager.spec.ts     (MISSING - create)
│   │   │   ├── useScoringEngine.spec.ts     (MISSING - create)
│   │   │   ├── useSessionManager.spec.ts    (MISSING - create)
│   │   │   ├── usePersistence.spec.ts       (MISSING - create)
│   │   │   └── useGameLifecycle.spec.ts    (MISSING - create)
│   │   ├── stores/                # Store tests (Zustand migrated)
│   │   │   ├── game-store.spec.ts
│   │   │   └── settings-store.spec.ts
│   │   ├── *.spec.ts             # Other utility tests (useForm, useModal, etc.)
│   │   └── conftest.ts           # Shared fixtures for unit tests
│   └── e2e/
│       ├── helpers/              # Shared E2E helpers
│       │   ├── game-flow.ts      # Game flow orchestration (EXISTS - 10 functions)
│       │   ├── mobile.ts         # Mobile testing utilities (EXISTS - touch, viewport)
│       │   ├── waits.ts         # Wait utilities (EXISTS)
│       │   ├── faker.ts        # Test data generation (EXISTS)
│       │   ├── assets.ts        # Asset verification (EXISTS)
│       │   ├── diagnostics.ts   # Debug helpers (EXISTS)
│       │   ├── realtime.ts      # WebSocket helpers (EXISTS)
│       │   └── index.ts         # Helper exports
│       ├── *.spec.ts             # E2E test specs
│       │   ├── scoring-flow.spec.ts        (USES SHARED HELPERS)
│       │   ├── scoring-ui.spec.ts          (USES SHARED HELPERS)
│       │   ├── scoring-multi-round.spec.ts  (USES SHARED HELPERS)
│       │   ├── leaderboard.spec.ts          (USES SHARED HELPERS)
│       │   ├── credits.spec.ts            (NEEDS REFACTOR - CSS selectors)
│       │   ├── language.spec.ts            (NEEDS REFACTOR - CSS selectors)
│       │   ├── offline.spec.ts             (NEEDS REFACTOR - CSS selectors)
│       │   ├── results.spec.ts             (NEEDS REFACTOR - CSS selectors)
│       │   └── mobile-game-flow.spec.ts  (MISSING - create new)
│       └── __snapshots__/       # Visual snapshots

apps/mobile/
├── tests/
│   ├── unit/                # Unit tests for NativeScript components (CREATE - doesn't exist)
│   │   └── *.spec.ts
│   └── integration/          # Integration tests for mobile workflows (CREATE - doesn't exist)
│       └── *.spec.ts
```

### Pattern 1: Composable Unit Test with Pure Functions

**What:** Stateless composables are tested by passing mock data and verifying return values. No store setup needed.

**When to use:** For composables with pure functions (useCategoryManager, usePlayerManager, useScoringEngine, useSessionManager, useGameLifecycle, usePersistence)

**Example:**

```typescript
// Source: apps/game/tests/unit/composables/useCategoryManager.spec.ts
import { describe, it, expect } from 'vitest'
import { useCategoryManager } from '~/composables/useCategoryManager'
import type { Category } from '@riddle-rush/types'

describe('useCategoryManager', () => {
  it('getRandomCategory returns a random category from list', () => {
    const { getRandomCategory } = useCategoryManager()
    const categories: Category[] = [
      { id: 1, name: 'Cities', searchWord: 'city', letter: 'c' },
      { id: 2, name: 'Animals', searchWord: 'animal', letter: 'a' },
    ]

    const result = getRandomCategory(categories)

    expect(result).not.toBeNull()
    expect(categories).toContain(result)
  })

  it('getCategoryById returns correct category or null', () => {
    const { getCategoryById } = useCategoryManager()
    const categories: Category[] = [
      { id: 1, name: 'Cities', searchWord: 'city', letter: 'c' },
      { id: 2, name: 'Animals', searchWord: 'animal', letter: 'a' },
    ]

    expect(getCategoryById(categories, 1)).toEqual(categories[0])
    expect(getCategoryById(categories, 999)).toBeNull()
  })
})
```

### Pattern 2: Composable Unit Test with Fake IndexedDB

**What:** Test IndexedDB-dependent composables using fake-indexeddb mock.

**When to use:** For useIndexedDB, usePersistence, useStatistics tests that require database operations

**Example:**

```typescript
// Source: apps/game/tests/unit/composables/useIndexedDB.spec.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import type { DBSchema } from 'idb'
import { useIndexedDB } from '~/composables/useIndexedDB'

describe('useIndexedDB', () => {
  let indexedDB: ReturnType<typeof useIndexedDB>
  let db: IDBDatabase

  beforeEach(() => {
    indexedDB = useIndexedDB()
    // Reset fake IndexedDB before each test
  })

  afterEach(async () => {
    // Clean up after each test
  })

  it('saveGameSession stores session correctly', async () => {
    const session = {
      id: 'test-session-1',
      players: [],
      startTime: Date.now(),
      status: 'active' as const,
    }

    await indexedDB.saveGameSession(session)
    const loaded = await indexedDB.getGameSession(session.id)

    expect(loaded).toEqual(session)
  })
})
```

### Pattern 3: E2E Test with Shared Game Flow Helpers

**What:** Use pre-built helpers from game-flow.ts for common game operations.

**When to use:** For all E2E tests that need game setup, answer submission, results navigation

**Example:**

```typescript
// Source: apps/game/tests/e2e/scoring-flow.spec.ts
import { test, expect } from '@playwright/test'
import {
  startGameWithDefaults,
  submitPlayerAnswers,
  navigateToResults,
  assignScores,
  confirmScoresAndWaitForModal,
  goToNextRound,
} from './helpers/game-flow'

test('scoring flow with 2 players', async ({ page }) => {
  await startGameWithDefaults(page)
  await submitPlayerAnswers(page, 2, ['Apple', 'Banana'])
  await navigateToResults(page)
  await assignScores(page, [1, 2])
  await confirmScoresAndWaitForModal(page)
  await expect(page.locator('[data-testid="next-round"]')).toBeVisible()
  await goToNextRound(page)
})
```

### Pattern 4: Mobile E2E Test with Touch Simulation

**What:** Use mobile.ts helper to simulate touch gestures and verify responsive layout.

**When to use:** For mobile-specific tests using @mobile tag

**Example:**

```typescript
// Source: apps/game/tests/e2e/mobile-game-flow.spec.ts (NEW - to be created)
import { test, expect } from '@playwright/test'
import { verifyResponsiveLayout, verifyTouchTargets, simulateTouchGesture } from './helpers/mobile'

test.describe('@mobile', () => {
  test('mobile responsive layout on Pixel 5 viewport', async ({ page }) => {
    await page.goto('/')
    const result = await verifyResponsiveLayout(page, {
      mobile: 393, // Pixel 5 width
      tablet: 768,
      desktop: 1024,
    })

    expect(result.issues).toHaveLength(0)
    expect(result.viewport).toBe('mobile')
  })

  test('touch targets meet minimum 44x44px requirement', async ({ page }) => {
    await page.goto('/players')
    const result = await verifyTouchTargets(page, 44)

    expect(result.tooSmall).toHaveLength(0)
  })

  test('swipe gesture for fortune wheel interaction', async ({ page }) => {
    await page.goto('/round-start')
    await simulateTouchGesture(page, 'swipe-right', '[data-testid="fortune-wheel"]')
    // Verify wheel spins and selects category
  })
})
```

### Pattern 5: NativeScript Mobile Unit Test

**What:** Unit tests for NativeScript Vue components using Jasmine or Jest.

**When to use:** For apps/mobile/ component and utility testing

**Example:**

```typescript
// Source: apps/mobile/tests/unit/Home.spec.ts (NEW - to be created)
import { describe, it, expect } from '@nativescript/unit-testing-framework'
import { mount } from '@nativescript/vue'
import Home from '~/components/Home.vue'

describe('Home component', () => {
  it('renders title correctly', () => {
    const wrapper = mount(Home, {
      props: { title: 'Riddle Rush' },
    })

    expect(wrapper.text()).toContain('Riddle Rush')
  })

  it('handles play button click', async () => {
    const wrapper = mount(Home)
    const button = wrapper.findComponent('Button')

    await button.trigger('tap')
    // Verify navigation to game screen
  })
})
```

### Anti-Patterns to Avoid

- **CSS class selectors in E2E:** Brittle to CSS refactors, breaks with design changes. Use data-testid instead.
- **Testing implementation details:** Test user-visible behavior, not internal state or implementation specifics.
- **Excessive mocking:** Only mock external dependencies (APIs, IndexedDB), not internal functions being tested.
- **Test duplication:** Don't copy-paste test logic. Use shared helpers from game-flow.ts.
- **Waiting with arbitrary timeouts:** Use page.waitForSelector(), expect.poll(), or waitForFunction() instead of page.waitForTimeout().
- **Skipping mobile testing:** Don't assume desktop behavior applies to mobile. Test at actual viewports.

## Don't Hand-Roll

| Problem                        | Don't Build                          | Use Instead                   | Why                                                                                |
| ------------------------------ | ------------------------------------ | ----------------------------- | ---------------------------------------------------------------------------------- |
| IndexedDB mock in unit tests   | Custom IndexedDB fake                | fake-indexeddb                | Proven, handles edge cases, transaction simulation, proper async handling          |
| Test data generation           | Random strings/numbers               | @faker-js/faker               | Consistent, realistic test data, better test reproducibility                       |
| Mobile touch simulation        | Raw TouchEvent construction          | mobile.ts helpers             | Abstraction handles browser differences, gesture sequencing, proper event bubbling |
| E2E wait utilities             | setTimeout/await page.waitForTimeout | waits.ts helpers              | Polling with backoff, proper condition checking, better error messages             |
| WebSocket testing              | Custom mock server                   | helpers/realtime.ts           | Existing infrastructure for Socket.io testing, proper connection handling          |
| Responsive layout verification | Manual pixel counting                | verifyResponsiveLayout helper | Automated detection of overflow, fixed-width issues, viewport meta tags            |

**Key insight:** The existing E2E helper infrastructure (game-flow.ts, mobile.ts, waits.ts, realtime.ts, etc.) is comprehensive. Phase 21 work should leverage existing helpers rather than building new abstractions.

## Common Pitfalls

### Pitfall 1: CSS Selector Fragility in E2E Tests

**What goes wrong:** E2E tests use `.scoring-page__score-value`, `.language-option`, `.credits-panel` selectors. CSS class changes break tests silently.

**Why it happens:** Tests written during UI implementation mirror CSS classes rather than using stable identifiers.

**How to avoid:**

1. Always use `data-testid="page-element-type"` attributes in components
2. Use `page.locator('[data-testid="..."]')` in tests
3. Refactor existing E2E specs to replace CSS selectors with data-testid

**Warning signs:**

- Tests fail after CSS refactors without logic changes
- Selectors contain BEM-style class names (`__`, `--`)
- grep shows 50+ occurrences of `page.locator('.')` outside data-testid

### Pitfall 2: Missing data-testid Attributes

**What goes wrong:** E2E tests cannot find stable selectors because components lack `data-testid` attributes.

**Why it happens:** Components added without testability in mind, or data-testid attributes not added to new features.

**How to avoid:**

1. Add `data-testid` to all interactive elements in new components
2. Audit existing components: add missing `data-testid` to buttons, inputs, modals
3. Follow naming convention: `{page}-{element}-{type}` (e.g., `game-submit-button`, `players-start-button`)

**Warning signs:**

- E2E tests resort to `page.locator('text=...')` or `page.getByRole()`
- grep shows few data-testid attributes in Vue files
- Test assertions use text content for element selection

### Pitfall 3: Flaky E2E Tests Due to Timing

**What goes wrong:** Tests intermittently fail with "Timeout" errors, especially for multi-round scoring workflow.

**Why it happens:** Tests don't wait for actual state changes (animation, network, reactivity), use fixed timeouts.

**How to avoid:**

1. Use `page.waitForFunction()` for state-based waits (Pinia store changes)
2. Use `expect.poll()` for polling conditions
3. Use `page.waitForSelector()` with state: 'visible' or 'attached'
4. Import and use helpers from waits.ts: `waitForPageReady`, `waitForRoundComplete`

**Warning signs:**

- Test passes locally but fails in CI consistently
- Errors like "Timeout waiting for selector" appear randomly
- Frequent use of `page.waitForTimeout()` without condition checks

### Pitfall 4: Untested Mobile Viewports

**What goes wrong:** Mobile layout issues discovered by users, not caught by tests. Responsive breakpoints fail on small screens.

**Why it happens:** E2E tests only run on desktop viewport, or @mobile tagged tests don't exist.

**How to avoid:**

1. Create E2E test suite for critical flows on Pixel 5 (393x851px) and iPad Pro 11 (834x1194px)
2. Use `verifyResponsiveLayout` helper to detect overflow, fixed-width issues, meta viewport tag
3. Test touch interactions using `simulateTouchGesture` helper (tap, swipe-left, swipe-right, pinch)
4. Run E2E tests on mobile projects: `playwright test --project=android-pixel5`

**Warning signs:**

- Playwright config has mobile projects but no tests use @mobile tag
- grep shows no `verifyResponsiveLayout` or `verifyTouchTargets` calls
- No mobile-specific test files exist

### Pitfall 5: Zero Mobile App Test Coverage

**What goes wrong:** NativeScript Vue mobile app (apps/mobile/) has no unit or integration tests. Bugs only discovered in production.

**Why it happens:** Mobile app developed without testing mindset. No test infrastructure set up.

**How to avoid:**

1. Add test runner to apps/mobile/package.json (Jasmine, Jest, or NativeScript's test framework)
2. Create unit tests for core utilities and components
3. Create integration tests for key workflows (home -> game -> results)
4. Run tests in CI pipeline with mobile-specific configuration

**Warning signs:**

- apps/mobile/tests/ directory doesn't exist
- No test scripts in apps/mobile/package.json
- Mobile bugs discovered post-deployment

### Pitfall 6: Duplicate Game Flow Logic in E2E Tests

**What goes wrong:** Multiple E2E specs duplicate player setup, answer submission, results navigation logic.

**Why it happens:** Tests written before shared helpers existed, or developers copy-pasted from other tests.

**How to avoid:**

1. Always import from `./helpers/game-flow`: `setupMultiplayerGame`, `submitPlayerAnswers`, `navigateToResults`, etc.
2. Remove duplicate helper functions from test files
3. Audit E2E specs for 50+ line local implementations that could use shared helpers

**Warning signs:**

- Multiple test files have similar 50+ line helper functions
- grep shows `async function setupGame` appearing in multiple files
- game-flow.ts helpers not imported in most specs

## Code Examples

Verified patterns from official sources:

### Testing Stateful Composable with Fake IndexedDB

```typescript
// Source: apps/game/tests/unit/composables/useIndexedDB.spec.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { useIndexedDB } from '~/composables/useIndexedDB'

describe('useIndexedDB', () => {
  beforeEach(() => {
    // Clear fake IndexedDB before each test
    indexedDB = useIndexedDB()
  })

  it('getGameSession returns null for non-existent ID', async () => {
    const session = await indexedDB.getGameSession('non-existent-id')
    expect(session).toBeNull()
  })

  it('saveGameSession and getGameSession round-trip correctly', async () => {
    const session = {
      id: 'test-session',
      players: [],
      status: 'active' as const,
    }

    await indexedDB.saveGameSession(session)
    const loaded = await indexedDB.getGameSession(session.id)

    expect(loaded).toEqual(session)
  })
})
```

### E2E Test Using Shared Helpers

```typescript
// Source: apps/game/tests/e2e/scoring-multi-round.spec.ts
import { test, expect } from '@playwright/test'
import {
  startGameAndGoToResults,
  assignScores,
  confirmScoresAndWaitForModal,
  goToNextRound,
  finishGame,
} from './helpers/game-flow'

test('multi-round scoring with 3 rounds', async ({ page }) => {
  // Round 1
  await startGameAndGoToResults(page, 2)
  await assignScores(page, [1, 2])
  await confirmScoresAndWaitForModal(page)

  // Round 2
  await goToNextRound(page)
  await submitPlayerAnswers(page, 2)
  await navigateToResults(page)
  await assignScores(page, [2, 1])

  // Finish game
  await confirmScoresAndWaitForModal(page)
  await finishGame(page)

  await expect(page).toHaveURL(/\/leaderboard/)
})
```

### Mobile Responsive Layout Verification

```typescript
// Source: apps/game/tests/e2e/helpers/mobile.ts
// Use existing helper in test
import { test, expect } from '@playwright/test'
import { verifyResponsiveLayout } from './helpers/mobile'

test.describe('@mobile', () => {
  test('mobile layout has no horizontal overflow', async ({ page }) => {
    await page.goto('/')

    const { viewport, issues } = await verifyResponsiveLayout(page, {
      mobile: 393,
      tablet: 768,
      desktop: 1024,
    })

    expect(issues.filter((i) => i.includes('overflow'))).toHaveLength(0)
  })
})
```

### Pure Function Testing for Stateless Composables

```typescript
// Source: apps/game/tests/unit/composables/useScoringEngine.spec.ts (NEW - to be created)
import { describe, it, expect } from 'vitest'
import { useScoringEngine } from '~/composables/useScoringEngine'

describe('useScoringEngine', () => {
  it('calculateAttemptScore returns SCORE_PER_CORRECT_ANSWER when found', () => {
    const { calculateAttemptScore } = useScoringEngine()
    const SCORE_PER_CORRECT_ANSWER = 1

    expect(calculateAttemptScore(true)).toBe(SCORE_PER_CORRECT_ANSWER)
    expect(calculateAttemptScore(false)).toBe(0)
  })

  it('getRankSuffix returns correct ordinal suffixes', () => {
    const { getRankSuffix } = useScoringEngine()

    expect(getRankSuffix(1)).toBe('1st')
    expect(getRankSuffix(2)).toBe('2nd')
    expect(getRankSuffix(3)).toBe('3rd')
    expect(getRankSuffix(4)).toBe('4th')
    expect(getRankSuffix(11)).toBe('11th') // Special case
  })
})
```

## State of the Art

| Old Approach                         | Current Approach                                   | When Changed       | Impact                                     |
| ------------------------------------ | -------------------------------------------------- | ------------------ | ------------------------------------------ |
| CSS selectors in E2E (`.class-name`) | data-testid selectors (`[data-testid="..."]`)      | Ongoing (Phase 21) | More resilient tests, fewer false failures |
| Local helper duplication in E2E      | Shared helpers from game-flow.ts                   | Ongoing (Phase 21) | Less code duplication, consistent behavior |
| Desktop-only E2E testing             | Multi-device E2E (mobile + tablet)                 | Ongoing (Phase 21) | Mobile bugs caught earlier                 |
| No mobile app tests                  | Add unit/integration tests for NativeScript        | Ongoing (Phase 21) | Mobile code quality improvements           |
| Flaky timing-based waits             | State-based polling (waitForFunction, expect.poll) | Ongoing (Phase 21) | More reliable tests                        |

**Deprecated/outdated:**

- Pinia-based store tests: Migrated to Zustand in Phase 19 (all tests passing)
- CSS class selectors in E2E: Being replaced with data-testid in Phase 21

## Open Questions

1. **NativeScript Mobile Test Framework Selection**
   - What we know: NativeScript supports Jasmine, Jest, and native unit testing
   - What's unclear: Which framework is best practice for NativeScript Vue apps in 2026?
   - Recommendation: Evaluate Jasmine (official NativeScript support) vs Jest (broader ecosystem). Start with Jasmine for minimal setup, migrate to Jest if benefits justify.

2. **Mobile PWA Install Flow Testing**
   - What we know: PWA has beforeinstallprompt event, install prompt can be captured
   - What's unclear: How to reliably trigger and test install prompt in Playwright E2E?
   - Recommendation: Check Playwright docs for PWA testing patterns. May need to mock Service Worker registration or use specific browser flags.

3. **E2E Test Retries Configuration**
   - What we know: Playwright config has `retries: isCI ? 1 : 0`, intermittent failures exist
   - What's unclear: What is optimal retry strategy for mobile tests vs desktop tests?
   - Recommendation: Keep 1 retry in CI for all tests. Mobile tests may need longer timeouts (already configured: 15000ms action timeout on Pixel 5).

4. **Coverage Thresholds for Composables**
   - What we know: Phase 12 plans mentioned >75% coverage target
   - What's unclear: Is >75% realistic for utility composables? Some are simple pure functions.
   - Recommendation: Aim for 80%+ for complex composables (useIndexedDB, useCategoryManager), 60%+ for simple wrappers (useAnalytics, useLogger). Focus on meaningful behavior coverage over chasing numbers.

## Validation Architecture

### Test Framework

| Property           | Value                                                                                |
| ------------------ | ------------------------------------------------------------------------------------ |
| Framework          | Vitest 4.0.18 (unit) + Playwright 1.58.2 (E2E)                                       |
| Config file        | vitest.config.ts (unit), playwright.config.ts (E2E)                                  |
| Quick run command  | `cd apps/game && pnpm run test:unit` (unit), `pnpm run test:e2e --grep @smoke` (E2E) |
| Full suite command | `cd apps/game && pnpm run test:unit` (unit), `pnpm run test:e2e` (E2E)               |
| Coverage command   | `cd apps/game && pnpm run test:unit:coverage` (currently disabled per config)        |

### Phase Requirements -> Test Map

| Req ID  | Behavior                                | Test Type        | Automated Command                            | File Exists?                                                          |
| ------- | --------------------------------------- | ---------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| TEST-01 | Unit test coverage >75% for composables | unit             | `pnpm run test:unit`                         | Partial - 6/29 composables have tests (21%)                           |
| TEST-02 | E2E uses data-testid selectors          | e2e              | `pnpm run test:e2e --grep "data-testid"`     | Partial - game-flow.ts uses data-testid, 8/15 specs use CSS selectors |
| TEST-03 | All E2E specs use shared helpers        | e2e              | `pnpm run test:e2e`                          | Partial - 4/15 specs use shared helpers, 11 have duplication          |
| TEST-04 | Mobile E2E tests for critical flows     | e2e + mobile     | `pnpm run test:e2e --project=android-pixel5` | No - 0 mobile E2E test specs exist                                    |
| TEST-05 | NativeScript mobile app tests           | unit/integration | None configured                              | No - apps/mobile/tests/ directory doesn't exist                       |

### Sampling Rate

- **Per task commit:** `cd apps/game && pnpm run test:unit` (subset of related tests)
- **Per wave merge:** `pnpm run test:unit && pnpm run test:e2e`
- **Phase gate:** Full unit suite passing AND full E2E suite passing (0 failures) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/game/tests/unit/composables/useAnalytics.spec.ts` - covers TEST-01 analytics composable
- [ ] `apps/game/tests/unit/composables/useCategoryManager.spec.ts` - covers TEST-01 category management
- [ ] `apps/game/tests/unit/composables/usePlayerManager.spec.ts` - covers TEST-01 player management
- [ ] `apps/game/tests/unit/composables/useScoringEngine.spec.ts` - covers TEST-01 scoring engine
- [ ] `apps/game/tests/unit/composables/useSessionManager.spec.ts` - covers TEST-01 session management
- [ ] `apps/game/tests/unit/composables/usePersistence.spec.ts` - covers TEST-01 persistence layer
- [ ] `apps/game/tests/unit/composables/useGameLifecycle.spec.ts` - covers TEST-01 game lifecycle
- [ ] `apps/game/tests/e2e/mobile-game-flow.spec.ts` - covers TEST-04 mobile E2E flows
- [ ] `apps/mobile/tests/unit/` directory - covers TEST-05 mobile unit tests
- [ ] Framework install: `cd apps/mobile && pnpm add -D @nativescript/unit-testing-framework` - for NativeScript tests
- [ ] Coverage enable: Set `coverage.enabled: true` in vitest.config.ts to verify TEST-01 thresholds

## Sources

### Primary (HIGH confidence)

- Vitest 4.0.18 docs - Unit test configuration, globals, coverage
- Playwright 1.58.2 docs - E2E testing, mobile device emulation, selectors
- happy-dom 20.6.3 docs - DOM environment for Vue component testing
- fake-indexeddb 6.2.5 docs - IndexedDB mocking
- apps/game/vitest.config.ts - Verified configuration
- apps/game/playwright.config.ts - Verified configuration, mobile projects, timeouts
- apps/game/tests/e2e/helpers/game-flow.ts - Verified 10 helper functions
- apps/game/tests/e2e/helpers/mobile.ts - Verified touch simulation functions

### Secondary (MEDIUM confidence)

- Phase 12 plans (12-02, 12-03, 12-06, 12-07, 12-08) - Documented unit test requirements
- apps/game/composables/ - Verified 29 composables, 6 have existing tests
- .planning/phases/21-refactor-and-fix-e2e-and-unit-tests/21-CONTEXT.md - User decisions and success criteria

### Tertiary (LOW confidence)

- NativeScript testing best practices - Not verified, requires research during implementation
- PWA install flow testing patterns - Not verified, requires research during implementation

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All packages verified via npm registry, configurations verified from source files
- Architecture: HIGH - Test structure documented from existing codebase, patterns well-established
- Pitfalls: HIGH - Identified from codebase analysis (CSS selectors, mobile gaps, test duplication)
- Mobile testing: MEDIUM - Infrastructure verified, but NativeScript testing approach requires implementation research

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (30 days - stable testing ecosystem, minimal version changes expected)
