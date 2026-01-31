# Coding Conventions

**Analysis Date:** 2026-01-31

## Naming Patterns

**Files:**

- Vue components: PascalCase (e.g., `Button.vue`, `FortuneWheel.vue`) in `components/`
- Composables: camelCase prefixed with `use` (e.g., `useLogger.ts`, `useIndexedDB.ts`) in `composables/`
- Stores: camelCase (e.g., `game.ts`, `settings.ts`) in `stores/`, exported with `useStoreName()` convention
- Utilities: camelCase (e.g., `constants.ts`) in `utils/`
- Types: PascalCase interface names, plural for type collections (e.g., `GameSession`, `Player`) in `types/game.ts`
- Test files: match source with `.spec.ts` or `.test.ts` suffix (e.g., `use-logger.spec.ts`, `game-store.spec.ts`)

**Functions:**

- camelCase (e.g., `fetchCategories()`, `submitAttempt()`)
- Async functions use async/await, no callback patterns
- Private utility functions declared with underscore or within module scope
- Handler functions prefixed with `handle` (e.g., `handleClick()`, `handleChange()`)
- Getter methods prefixed with `get` or exposed as properties in stores

**Variables:**

- camelCase for all local variables (e.g., `currentSession`, `playerName`)
- Constants: UPPERCASE_SNAKE_CASE, centralized in `utils/constants.ts` and shared packages
- Boolean variables prefixed with `is`, `has`, `should`, `can` (e.g., `hasActiveSession`, `isOnline`, `canInstall`)
- Ref/reactive variables: use descriptive camelCase (e.g., `showMenu`, `isLoading`)

**Types:**

- Interface names: PascalCase (e.g., `GameSession`, `GameAttempt`, `Props`)
- Type names: PascalCase (e.g., `GameState`, `BeforeInstallPromptEvent`)
- Use interfaces for objects and props, type for unions and primitives
- Generics: single letter or descriptive (e.g., `T`, `K`, `GameSessionType`)

## Code Style

**Formatting:**

- Tool: Prettier with custom config in `.prettierrc`
- Tab width: 2 spaces
- Print width: 100 characters
- Single quotes: enforced
- Semicolons: never (statements don't end with semicolons)
- Trailing commas: es5 (arrays/objects but not function params)
- Bracket spacing: true (e.g., `{ foo: 'bar' }`)
- Arrow function parens: always (e.g., `(a) => a + 1`)
- Line endings: LF
- Vue template script/style: not indented

**Linting:**

- Tool: ESLint with Nuxt config in `eslint.config.mjs`
- Key rules enforced:
  - `no-console`: warn (only `console.warn` and `console.error` allowed) - use `useLogger()` instead
  - `prefer-const`: error (use const over let)
  - `no-var`: error (use const/let only)
  - `eqeqeq`: error always (use === not ==)
  - `@typescript-eslint/no-explicit-any`: warn (avoid `any`, use generics)
  - `@typescript-eslint/no-unused-vars`: error with pattern ignoring leading underscore (e.g., `_unused`)
  - `vue/multi-word-component-names`: off (single-word components allowed)
- Test files (tests/\*_/_.ts) have relaxed rules: no `no-console`, no `@typescript-eslint/no-explicit-any` restrictions

## Import Organization

**Order:**

1. Vue and framework imports (`vue`, `vue-router`, `pinia`, `@nuxtjs/i18n`)
2. External packages (`idb`, `date-fns`, etc.)
3. Internal imports from alias paths (`~`, `@`)
   - Composables: `import { useX } from '~/composables/useX'`
   - Stores: `import { useXStore } from '~/stores/x'`
   - Types: `import type { X, Y } from '@riddle-rush/types/game'`
   - Constants: `import { CONST_NAME } from '@riddle-rush/shared/constants'`
4. Relative imports only when necessary (prefer alias paths)

**Path Aliases:**

- `~` or `@`: root of `apps/game/` directory
- `@riddle-rush/shared/*`: shared package constants
- `@riddle-rush/types/*`: type definitions package

**Example:**

```typescript
import { defineStore } from 'pinia'
import { useIndexedDB } from '~/composables/useIndexedDB'
import { useLogger } from '~/composables/useLogger'
import type { GameSession, Player } from '@riddle-rush/types/game'
import { SCORE_PER_CORRECT_ANSWER } from '@riddle-rush/shared/constants'
```

## Error Handling

**Patterns:**

- Use `useLogger()` composable for all logging (in `composables/useLogger.ts`)
- Wrap async operations in try-catch blocks
- Log errors with context: `logger.error('Operation failed', error, { userId, action })`
- Return null or empty collections on error, don't throw unless critical
- For game-critical errors: use `toast` to show user-facing message
- IndexedDB failures: log but continue (database is non-critical for MVP)

**Example from game store:**

```typescript
async loadFromDB() {
  try {
    const { getGameSession } = useIndexedDB()
    const session = await getGameSession()
    if (session) {
      this.currentSession = session
    }
  } catch (error) {
    const logger = useLogger()
    logger.error('Error loading from IndexedDB:', error)
    // Continue without persisted data
  }
}
```

## Logging

**Framework:** `useLogger()` composable wraps console with structured logging

**Patterns:**

- Always use `const { log, warn, error, debug, info } = useLogger()`
- Messages must be prefixed with context: `[LOG]`, `[WARN]`, `[ERROR]`, `[DEBUG]`, `[INFO]`
- Log level defaults:
  - `log()`: development only
  - `warn()`: development only (also synced to error service in production)
  - `error()`: always synced with context (timestamp, environment, appVersion, URL, userAgent)
  - `debug()`: development only
  - `info()`: development only
- Error logs include context object with userId, action, etc.
- Production builds remove console statements automatically

**Example:**

```typescript
const { log, error } = useLogger()
log('Game started')
error('Category fetch failed', fetchError, {
  userId: 'player1',
  action: 'fetchCategories',
})
```

## Comments

**When to Comment:**

- Complex algorithms or business logic (e.g., player scoring calculation)
- Non-obvious workarounds (e.g., JSON clone instead of structural clone)
- Cross-cutting concerns that aren't obvious from reading code
- Do NOT comment obvious code (e.g., `// increment counter` above `i++`)

**JSDoc/TSDoc:**

- Used for composables, stores, and utility functions
- Function comments document: purpose, params, return type
- Include example usage for public APIs

**Example:**

```typescript
/**
 * Structured logging utility for the game application
 * Provides consistent logging with levels and context
 *
 * @example
 * const { log, error } = useLogger()
 * error('Failed to load', err, { userId: '123' })
 */
export const useLogger = () => { ... }
```

## Function Design

**Size:**

- Keep functions small (preferably under 30 lines)
- Extract complex logic to separate functions
- One responsibility per function

**Parameters:**

- Maximum 3 parameters, use object destructuring for more
- Use TypeScript interfaces for complex parameter objects
- Provide default values where appropriate

**Return Values:**

- Be explicit about return types (use type annotations)
- Async functions return `Promise<T>`
- Void functions for state mutations
- Use nullish returns for optional results (null/undefined, empty arrays/objects)

**Example:**

```typescript
async submitPlayerAnswer(
  playerId: string,
  answer: string
): Promise<void> {
  if (!this.currentSession) return
  // Implementation
}
```

## Module Design

**Exports:**

- Named exports preferred for functions and types
- Default exports for Vue components and stores
- Re-export types from shared packages

**Barrel Files:**

- `composables/index.ts` or similar may aggregate related exports
- Used when multiple related utilities need coordinated imports
- Keep barrel files shallow (2-3 levels max)

**Pinia Stores:**

- One store per file (e.g., `game.ts` defines `useGameStore()`)
- Stores include: state, getters, actions
- Actions handle side effects (IndexedDB saves, API calls)
- Getters compute derived state
- No business logic in components; delegate to stores

**Composables:**

- Encapsulate reusable logic (e.g., form handling, data fetching)
- Can be called multiple times to create independent instances
- Return object with methods and computed values
- Document with JSDoc

**Example composable:**

```typescript
export const usePageSetup = () => {
  const router = useRouter()
  const { t } = useI18n()
  const config = useRuntimeConfig()

  const goHome = () => router.push('/')

  return { router, t, goHome }
}
```

## Vue Component Patterns

**Script Setup:**

- Use `<script setup lang="ts">` for all components
- Define Props with `defineProps<Props>()` and interface
- Define emits with `defineEmits<Events>()`
- Use `withDefaults()` for prop defaults

**Template:**

- Use v-if/v-show appropriately (v-if removes from DOM, v-show hides with CSS)
- Bind event handlers with camelCase: `@click`, `@change`
- Use `:class` with computed classes for dynamic styling
- Prefer scoped styles for component isolation

**Props Interface:**

```typescript
interface Props {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
})
```

## Reactive Data Management

**Use Pinia stores for:**

- Game state (current session, players, scores)
- Settings and user preferences
- Global application state

**Use component-local reactive for:**

- Form inputs and UI state
- Component-specific animations
- Temporary UI flags (showMenu, isLoading)

**Example - component-local:**

```typescript
const showMenu = ref(false)
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}
```

**Example - store-managed:**

```typescript
const gameStore = useGameStore()
// gameStore.currentSession is reactive
// Update via actions: gameStore.submitAttempt()
```

## Best Practices Checklist

- Always use `const` (never `var`, prefer `const` over `let`)
- Use type annotations for function returns and complex variables
- Import types with `type` keyword: `import type { X } from 'module'`
- Use nullish coalescing (`??`) over logical OR for falsy values
- Use optional chaining (`?.`) to safely access nested properties
- Avoid nested ternaries; use if/else or switch statements
- Use descriptive variable names over single letters (except loop counters)
- Group related imports together
- Always handle promises with async/await, not `.then()`

---

_Convention analysis: 2026-01-31_
