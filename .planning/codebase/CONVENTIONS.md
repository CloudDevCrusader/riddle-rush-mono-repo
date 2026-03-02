# Coding Conventions

**Analysis Date:** 2026-02-13

## Naming Patterns

**Files:**

- Composables: `use{Feature}.ts` — camelCase with `use` prefix (e.g., `useToast.ts`, `useLocalStorage.ts`, `usePageSwipe.ts`)
- Stores: `{name}.ts` — lowercase (e.g., `game.ts`, `settings.ts`)
- Vue components: PascalCase `.vue` files (e.g., `GameHeader.vue`, `FortuneWheel.vue`, `SplashScreen.vue`)
- Base components: `Base/{Name}.vue` — reusable primitives (e.g., `Base/Button.vue`, `Base/Modal.vue`, `Base/ImageButton.vue`)
- Plugins: `{NN}.{name}.client.ts` — numbered prefix for load ordering, `.client.ts` suffix for client-only (e.g., `00.init-plugin-system.client.ts`)
- Test files: `{use-feature}.spec.ts` — kebab-case matching the composable name (e.g., `use-toast.spec.ts`, `game-store.spec.ts`)
- Type definitions: `{domain}.ts` — lowercase (e.g., `game.ts` in `packages/types/src/`)
- Constants: `constants.ts` — single file in shared package
- Routes: `routes.ts` — single file in shared package

**Functions:**

- Composables: `use{Feature}` — camelCase with `use` prefix (e.g., `useToast()`, `useLogger()`, `useForm()`)
- Store definitions: `use{Name}Store` — follows Pinia convention (e.g., `useGameStore`)
- Event handlers: `handle{Action}` — camelCase with `handle` prefix (e.g., `handleClick`, `handleChange`, `handleBlur`, `handleSubmit`)
- Validation rules: `{ruleName}` — camelCase (e.g., `required`, `minLength`, `maxLength`, `email`)
- Utility functions: camelCase (e.g., `randomLetter()`, `cloneSessionForHistory()`, `getRandomCategory()`)

**Variables:**

- Reactive state: camelCase (e.g., `isSubmitting`, `toasts`, `currentSession`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `ALPHABET`, `SCORE_PER_CORRECT_ANSWER`, `DEFAULT_DISPLAYED_CATEGORIES`)
- Mock variables in tests: `mock{Name}` prefix (e.g., `mockSaveGameSession`, `mockGetGameHistory`, `fetchMock`)
- Private/internal: `_` prefix in unused parameters via eslint config (`argsIgnorePattern: '^_'`)
- Booleans: `is{State}` or `has{State}` prefix (e.g., `isOnline`, `isSubmitting`, `hasActiveSession`, `categoriesLoaded`)

**Types:**

- Interfaces: PascalCase with `interface` keyword — no `I` prefix (e.g., `interface Category`, `interface GameSession`, `interface Player`)
- Type aliases: PascalCase with `type` keyword (e.g., `type ToastType = 'success' | 'error' | 'info' | 'warning'`)
- Props interfaces: `Props` — local to component (defined inline in `<script setup>`)
- Generic type params: single uppercase letter (e.g., `<T>`, `<T extends Record<string, unknown>>`)

## Code Style

**Formatting (Prettier):**

- Tool: Prettier (`.prettierrc` at root)
- No semicolons (`"semi": false`)
- Single quotes (`"singleQuote": true`)
- 2-space indentation (`"tabWidth": 2`)
- Trailing commas ES5 (`"trailingComma": "es5"`)
- 100 char print width (`"printWidth": 100`)
- Bracket spacing enabled (`"bracketSpacing": true`)
- Always arrow parens (`"arrowParens": "always"`)
- LF line endings (`"endOfLine": "lf"`)
- No Vue script/style indentation (`"vueIndentScriptAndStyle": false`)

**Linting (ESLint):**

- Tool: `@nuxt/eslint-config/flat` with stylistic and tooling features
- Config files: `eslint.config.mjs` (root), `apps/game/eslint.config.mjs` (app-level overrides)
- Key root rules:
  - `@typescript-eslint/no-explicit-any`: `warn`
  - `@typescript-eslint/no-unused-vars`: `error` (ignores `^_` patterns)
  - `no-console`: `warn` (allows `console.warn` and `console.error`)
  - `prefer-const`: `error`
  - `no-var`: `error`
  - `eqeqeq`: `error` (strict equality, except null comparisons)
  - `@stylistic/semi`: `error` (never)
  - `@stylistic/quotes`: `error` (single)
  - `@stylistic/comma-dangle`: `error` (always-multiline)
  - `@stylistic/brace-style`: `error` (1tbs)
- Game app overrides (`apps/game/eslint.config.mjs`): Disables most `@stylistic/*` and `vue/*` formatting rules — Prettier handles formatting instead
- Test file overrides: `no-console: 'off'`, `@typescript-eslint/no-explicit-any: 'off'`

**Pre-commit Hooks:**

- Husky + lint-staged (`.lintstagedrc.json`)
- `*.{ts,tsx,vue}` → `eslint --fix` + `prettier --write`
- `*.{js,jsx}` → `eslint --fix` + `prettier --write`
- `*.{json,md,yml,yaml}` → `prettier --write`
- `*.{css,scss}` → `prettier --write`

**Dependency Management:**

- Syncpack (`.syncpackrc.json`) enforces version consistency:
  - Workspace packages (`@riddle-rush/**`): exact versions (no range)
  - Other dependencies: caret range (`^`)
- All workspace packages referenced as `workspace:*` in package.json

## Import Organization

**Order:**

1. Node built-ins (`import { fileURLToPath, URL } from 'node:url'`)
2. External packages (`import { defineStore } from 'pinia'`, `import { faker } from '@faker-js/faker'`)
3. Workspace packages (`import { ALPHABET } from '@riddle-rush/shared/constants'`, `import type { Category } from '@riddle-rush/types/game'`)
4. Local/relative imports (`import { useIndexedDB } from '../composables/useIndexedDB'`, `import { createCategoryList } from '../utils/factories'`)

**Path Aliases:**

- `~` → project root (used in composable imports: `~/composables/useIndexedDB`)
- `@` → project root (alternative alias, same target)
- `@riddle-rush/shared` → `packages/shared` workspace package
- `@riddle-rush/types` → `packages/types` workspace package
- `@riddle-rush/config` → `packages/config` workspace package

**Type Imports:**

- Use `import type { ... }` for type-only imports (e.g., `import type { Category, GameSession } from '@riddle-rush/types/game'`)
- Separate type imports from value imports

**Auto-imports:**

- Vue (`ref`, `reactive`, `computed`, `watch`, etc.) — auto-imported via `unplugin-auto-import`
- Vue Router (`useRoute`, `useRouter`) — auto-imported
- Pinia (`defineStore`, `storeToRefs`) — auto-imported
- Nuxt composables (`useRuntimeConfig`, `useNuxtApp`, `navigateTo`, `defineNuxtPlugin`) — auto-imported by Nuxt

## Error Handling

**Patterns:**

- Try/catch with graceful fallbacks — never let errors crash the UI:
  ```typescript
  try {
    await onSubmit(values as T)
    return true
  } catch {
    return false
  } finally {
    isSubmitting.value = false
  }
  ```
- Null/undefined guards with optional chaining: `store.currentSession?.category.name`
- Non-null assertion (`!`) used sparingly and only when state is guaranteed (e.g., `store.currentSession!`)
- Return `null` for "not found" cases (e.g., `getCategoryById` returns `null`, not `undefined`)
- Throw descriptive `Error` objects for truly exceptional cases: `throw new Error('Failed to load game session')`
- Async error boundaries: wrap async store actions in try/catch, log with `useLogger`, continue gracefully
- IndexedDB errors: caught and logged, never propagated to UI

**Structured Logging:**

- Use `useLogger()` composable instead of `console.log` in production code
- Logger provides `log`, `warn`, `error`, `debug`, `info` methods
- Errors include context: timestamp, environment, appVersion, URL, userAgent
- Development: all levels output to console
- Production: only `warn` and `error` are tracked; sync to external monitoring

## Logging

**Framework:** `useLogger` composable (`apps/game/composables/useLogger.ts`)

**Patterns:**

- Import and destructure: `const { log, warn, error, debug } = useLogger()`
- Error logging with context: `error('Failed to load', err, { component: 'GameStore' })`
- Use `console.warn`/`console.error` directly only where `useLogger` is unavailable (e.g., setup files)
- ESLint enforces: `no-console: warn` with `allow: ['warn', 'error']` — use `useLogger` for `log`/`debug`/`info`

## Comments

**When to Comment:**

- JSDoc block comments (`/** */`) on exported functions and composables describing purpose
- Inline comments for non-obvious logic or workarounds
- `// TODO:` for known issues to fix later (especially CI-related test skips)
- `@ts-expect-error` with explanation when accessing internal APIs in tests

**JSDoc/TSDoc:**

- Used on composable entry points and exported utility functions:
  ```typescript
  /**
   * Composable for form handling with Vue 3 Composition API
   * Provides validation, submission, and error handling
   */
  export function useForm<T extends Record<string, unknown>>(...) { }
  ```
- Used on individual methods within composables:
  ```typescript
  /**
   * Validate a single field
   */
  const validateField = (fieldName: keyof T): boolean => {}
  ```
- Used on factory functions in tests:
  ```typescript
  /**
   * Creates realistic player data for testing
   */
  export const createPlayer = (overrides: Partial<Player> = {}): Player => ({})
  ```

## Function Design

**Size:** Composables are typically 30–100 lines. Store definitions can be longer (200–400 lines) but are broken into logical sections (state, getters, actions).

**Parameters:**

- Use options objects for 3+ parameters: `options: { timeout?: number; checkAssets?: boolean }`
- Use `Partial<T>` overrides pattern for factory functions: `createCategory(overrides: Partial<Category> = {})`
- Default parameters via `=` in function signature (e.g., `duration = 3000`)

**Return Values:**

- Composables return an object of reactive refs and functions: `return { toasts, show, remove, clear }`
- Use `readonly()` to prevent external mutation of state: `return { values: readonly(values), errors: readonly(errors) }`
- Use `computed()` for derived state in return values: `isValid: computed(() => ...)`
- Boolean returns for validation: `validateField() → boolean`
- Store actions return `void` or the entity they created

## Module Design

**Exports:**

- Named exports only — no default exports (except Vue components and config files)
- Composables: `export function useToast()` or `export const useLogger = () =>`
- Types: `export interface Category`, `export type ToastType`
- Constants: `export const ALPHABET = ...`
- Factories: `export const createCategory = (...) => ...`

**Barrel Files:**

- Used in E2E helpers: `tests/e2e/helpers/index.ts` re-exports all helpers
- Used in shared packages: `packages/types/src/index.ts`, `packages/shared/src/index.ts`
- NOT used in composables directory — each composable is imported directly by path

## Vue Component Conventions

**Script Setup:**

- Always use `<script setup lang="ts">`
- Define props with `interface Props` + `withDefaults(defineProps<Props>(), { ... })`
- Define emits with typed `defineEmits<{ eventName: [payload: Type] }>()`
- Use `computed()` for derived template values (e.g., CSS class bindings)

**Template:**

- Use CSS class selectors, not inline styles
- BEM-like class naming: `base-button`, `base-button--primary`, `base-button--disabled`
- Slot-based composition for flexible components

**Styles:**

- Always `<style scoped>` — scoped CSS by default
- Use CSS custom properties (design tokens) for all values:
  - Spacing: `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`, `var(--spacing-xl)`
  - Colors: `var(--color-primary)`, `var(--color-danger)`, `var(--color-white)`
  - Typography: `var(--font-display)`, `var(--font-size-md)`, `var(--font-weight-bold)`
  - Layout: `var(--radius-md)`, `var(--transition-base)`
- Mobile-responsive with min-touch-target of 44px (`min-height: 44px` on interactive elements)
- `-webkit-tap-highlight-color: transparent` on buttons for mobile
- `user-select: none` on interactive elements

## Pinia Store Conventions

**Definition:**

- Use Options API pattern with `defineStore('name', { state, getters, actions })`:
  ```typescript
  export const useGameStore = defineStore('game', {
    state: (): GameState => ({ ... }),
    getters: { ... },
    actions: { ... },
  })
  ```
- State typed via explicit return type on state function: `state: (): GameState => ({...})`
- Import composables at top of store file for use in actions

**State Initialization:**

- `null` for optional references (e.g., `currentSession: null`)
- Empty arrays for collections (e.g., `history: []`, `categories: []`)
- Sensible defaults for primitives (e.g., `isOnline: true`, `displayedCategoryCount: 9`)

## Workspace Package Conventions

**Shared Constants (`packages/shared/src/constants.ts`):**

- `UPPER_SNAKE_CASE` naming
- Exported individually as named exports
- Imported as: `import { ALPHABET, SCORE_PER_CORRECT_ANSWER } from '@riddle-rush/shared/constants'`

**Shared Types (`packages/types/src/game.ts`):**

- All game-related interfaces in one file
- Import as: `import type { Category, GameSession } from '@riddle-rush/types/game'`
- No implementation code — types only

**Shared Routes (`packages/shared/src/routes.ts`):**

- Type-safe route constants
- Import as: `import { ROUTES } from '@riddle-rush/shared/routes'`

---

_Convention analysis: 2026-02-13_
