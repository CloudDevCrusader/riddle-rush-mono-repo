# Coding Conventions

**Analysis Date:** 2026-02-06

## Naming Patterns

**Files:**

- Vue components: PascalCase - `GameButton.vue`, `GameModal.vue`, `PlayerLeaderboard.vue`
- TypeScript files: kebab-case - `use-logger.ts`, `use-form.ts`, `game-store.spec.ts`
- Test files: `*.spec.ts` or `*.test.ts` suffix (e.g., `game-store.spec.ts`, `use-form.spec.ts`)
- Config files: kebab-case with extension - `vitest.config.ts`, `playwright.config.ts`

**Functions:**

- Composables: camelCase with `use` prefix - `useLogger()`, `usePageSetup()`, `useNavigation()`
- Store actions: camelCase - `startNewGame()`, `submitAttempt()`, `loadSessionById()`
- Event handlers: camelCase with `handle` or `wrapped` prefix - `handleClick()`, `wrappedGoToSettings()`
- Utility functions: camelCase - `randomLetter()`, `getRandomCategory()`, `cloneSessionForHistory()`

**Variables:**

- camelCase for local variables - `showMenu`, `currentRound`, `playerNames`
- UPPER_SNAKE_CASE for constants - `SCORE_PER_CORRECT_ANSWER`, `MAX_PLAYERS`, `DEFAULT_DISPLAYED_CATEGORIES`
- Reactive refs: descriptive camelCase - `isLoading`, `hasActiveSession`, `categoriesLoaded`

**Types:**

- PascalCase for interfaces/types - `GameSession`, `GameAttempt`, `Category`, `Player`, `PlayerWithRank`
- Props interfaces: `Props` within component script setup
- Event interfaces: inline type definitions - `{ click: [event: MouseEvent] }`

## Code Style

**Formatting:**

- Tool: Prettier 3.7.4
- No semicolons (`semi: false`)
- Single quotes (`singleQuote: true`)
- 2 space indentation (`tabWidth: 2`)
- Trailing commas ES5 style (`trailingComma: 'es5'`)
- 100 character line width (`printWidth: 100`)
- LF line endings (`endOfLine: 'lf'`)
- Arrow function parentheses always (`arrowParens: 'always'`)

**Linting:**

- Tool: ESLint 9 with flat config (`@nuxt/eslint-config/flat`)
- Key rules enforced:
  - `@stylistic/semi: never` - No semicolons
  - `@stylistic/quotes: single` - Single quotes only
  - `@stylistic/comma-dangle: always-multiline` - Always trailing commas in multiline
  - `@stylistic/brace-style: 1tbs` - One true brace style
  - `no-console: warn` (except `warn` and `error` allowed)
  - `@typescript-eslint/no-unused-vars: error` (except `_` prefixed variables)
  - `prefer-const: error` - Use const when variables aren't reassigned
  - `no-var: error` - No var keyword allowed
  - `eqeqeq: ['error', 'always']` - Strict equality only (except null)
  - `@typescript-eslint/no-explicit-any: warn` - Avoid `any` type

**Test-specific rules:**

- `no-console: off` in test files
- `@typescript-eslint/no-explicit-any: off` in test files
- Located in: `apps/game/tests/**/*.ts`

## Import Organization

**Order:**

1. External dependencies (Vue, Pinia, etc.)
2. Internal composables (`~/composables/`)
3. Shared packages (`@riddle-rush/types`, `@riddle-rush/shared`)
4. Type imports (using `import type`)

**Example from `apps/game/stores/game.ts`:**

```typescript
import { defineStore } from 'pinia'
import { useIndexedDB } from '../composables/useIndexedDB'
import { useStatistics } from '../composables/useStatistics'
import { useLogger } from '../composables/useLogger'
import { useCategoryEmoji } from '../composables/useCategoryEmoji'
import {
  ALPHABET,
  SCORE_PER_CORRECT_ANSWER,
  DEFAULT_DISPLAYED_CATEGORIES,
} from '@riddle-rush/shared/constants'
import type { GameSession, GameAttempt, GameState, Category, Player } from '@riddle-rush/types/game'
```

**Path Aliases:**

- `~` and `@` - Project root (configured in Nuxt/Vite)
- Workspace packages: `@riddle-rush/types`, `@riddle-rush/shared`, `@riddle-rush/config`

## Error Handling

**Patterns:**

- Use try-catch for async operations with IndexedDB
- Log errors via `useLogger().error()` composable
- Graceful degradation - don't throw, return null/default values when appropriate
- Error context includes: timestamp, environment, appVersion, URL, userAgent

**Example from `apps/game/composables/useLogger.ts`:**

```typescript
const error = (message: string, error?: unknown, context: Record<string, unknown> = {}) => {
  const errorContext = {
    timestamp: new Date().toISOString(),
    environment: runtimeConfig.public.environment,
    appVersion: runtimeConfig.public.appVersion,
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...context,
  }

  if (isDevelopment) {
    console.error(`[ERROR] ${message}`, error, errorContext)
  }

  syncErrorLog('error', message, error, errorContext)
}
```

**Store error handling:**

- Pinia actions return `Promise<void>` or specific types
- Database failures logged but don't crash app
- Example: `updateStatistics` failure in `endGame()` doesn't prevent session end

## Logging

**Framework:** Custom `useLogger()` composable

**Patterns:**

- Development: Full logging to console with prefixes `[LOG]`, `[WARN]`, `[ERROR]`, `[DEBUG]`, `[INFO]`
- Production: Only errors and warnings logged, synced to error tracking
- Methods: `log()`, `warn()`, `error()`, `debug()`, `info()`
- Errors include rich context automatically

**When to Log:**

- Development: Debug flow, state changes, API calls
- Production: Only errors, warnings, and critical events
- Never log in production: Regular info/debug messages (stripped for performance)

## Comments

**When to Comment:**

- Complex algorithms or business logic
- Workarounds or non-obvious solutions
- Type assertions with `@ts-expect-error` (explain why)
- Disabled tests with `.skip` (include TODO reason)

**Example from `apps/game/tests/unit/game-store.spec.ts`:**

```typescript
it.skip('does not refetch if already loaded', async () => {
  // TODO: Fix mock in CI environment (Node 20 vs 24 difference)
  const store = useGameStore()
  await store.fetchCategories()
  await store.fetchCategories()
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
```

**JSDoc/TSDoc:**

- Used sparingly - mainly for composables and utility functions
- Example from `apps/game/composables/useLogger.ts`:

```typescript
/**
 * Structured logging utility for the game application
 * Provides consistent logging with levels and context
 */
export const useLogger = () => { ... }
```

## Function Design

**Size:** Functions should be focused and concise - typically under 50 lines

**Parameters:**

- Use TypeScript interfaces for multiple parameters
- Destructure objects for readability
- Use optional parameters with default values via `withDefaults()` in Vue

**Example from `apps/game/components/game/GameButton.vue`:**

```typescript
interface Props {
  variant?: 'primary' | 'secondary' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
})
```

**Return Values:**

- Explicit return types for public APIs
- Use `null` for "no value" (not `undefined`)
- Return promises for async operations - `Promise<void>`, `Promise<GameSession>`, etc.
- Composables return object of methods/refs: `{ log, warn, error, debug, info }`

## Module Design

**Exports:**

- Named exports for composables: `export const useLogger = () => { ... }`
- Default exports for Vue components (implicit in SFC)
- Named exports for types: `export type { GameSession, Player }`
- Re-export from index files in workspace packages

**Barrel Files:**

- Used in `packages/types/src/index.ts` and `packages/shared/src/index.ts`
- Example from `packages/types/src/index.ts`:

```typescript
export * from './game'
export * from './settings'
```

## Vue Component Patterns

**Script Setup:**

- Use `<script setup lang="ts">` exclusively (Composition API)
- Define props with `defineProps<Props>()` and `withDefaults()`
- Define emits with `defineEmits<{ eventName: [args] }>()`
- Use `computed()` for derived state
- Use `ref()` and `reactive()` for local state

**Template:**

- Use `v-if` for conditional rendering
- Use `v-show` for toggle visibility without unmounting
- Use `v-for` with `:key` on unique identifiers
- Use `@click` shorthand for event listeners
- Data attributes: `data-testid` for E2E testing (language-agnostic)

**Style:**

- Scoped styles: `<style scoped lang="scss">`
- Use CSS custom properties (CSS variables) for theming
- BEM-style naming: `.game-button--primary`, `.game-button__spinner`
- SCSS mixins for reusable patterns (e.g., `@include glossy-button()`)

## Commit Conventions

**Format:** Conventional Commits (enforced by Husky hook)

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code restructuring
- `test:` - Test changes
- `chore:` - Maintenance
- `perf:` - Performance
- `style:` - Formatting
- `ci:` - CI/CD changes
- `build:` - Build system

**Scope:** Optional - `feat(game):`, `fix(store):`

**Requirements:**

- Minimum 10 characters
- Must match regex: `^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?:`

**Examples:**

```
feat: add color mode toggle
fix: resolve type error in useForm
docs: update agent workflow guide
refactor(store): simplify player state management
test: add coverage for multi-player flow
```

## Git Workflow

**Pre-commit Hook:**

1. Secret scanning (`scripts/check-secrets.sh`)
2. Lint-staged (ESLint + Prettier on staged files)
3. TypeScript typecheck across workspace

**Pre-push Hook:**

1. TypeScript checks
2. Unit tests
3. Syncpack version check

**Commit-msg Hook:**

- Validates Conventional Commits format
- Enforces minimum message length

---

_Convention analysis: 2026-02-06_
