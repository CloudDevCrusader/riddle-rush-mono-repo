# AI Agent Workflow Guide

This document defines the standard workflow for AI agents working on the Riddle Rush codebase to ensure code quality, regular commits, and smooth collaboration.

## Table of Contents

- [Core Principles](#core-principles)
- [Project Overview](#project-overview)
- [Essential Commands](#essential-commands)
- [Development Workflow](#development-workflow)
- [Code Organization & Patterns](#code-organization--patterns)
- [Testing Strategy](#testing-strategy)
- [Code Quality & Validation](#code-quality--validation)
- [Commit Guidelines](#commit-guidelines)
- [Deployment](#deployment)
- [Important Gotchas](#important-gotchas)
- [Tooling & Integrations](#tooling--integrations)
- [Troubleshooting](#troubleshooting)

---

## Core Principles

### 1. **Validate After Every Change**

After **ANY** code change, always run quality checks:

```bash
pnpm run workspace:check  # Syncpack + TypeScript + ESLint
```

Or run individually:

```bash
pnpm run typecheck    # TypeScript validation
pnpm run lint:fix     # Auto-fix linting
pnpm run format       # Format code
```

### 2. **Commit Frequently**

- Commit after each logical unit of work (not at the end of session)
- Use Conventional Commits format: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Aim for commits every 10-20 minutes of work

### 3. **Test Before Commit**

Always run relevant tests before committing:

```bash
pnpm run test:unit    # For logic/composable/store changes
pnpm run test:e2e     # For UI/flow changes
```

### 4. **Read Before Writing**

- Read `.cursorrules` for code style guidelines
- Read CLAUDE.md for architecture overview
- Check existing files for patterns before creating new ones

---

## Project Overview

This is a **pnpm monorepo** orchestrated by **Turborepo** containing "Riddle Rush" — a word guessing game.

### Workspace Structure

```
riddle-rush-mono-repo/
├── apps/
│   ├── game/           # Nuxt 4 PWA (main game)
│   ├── mobile/         # NativeScript Vue app
│   ├── docs/           # Documentation (Nuxt Content)
│   └── tolgee/         # Translation management
├── packages/
│   ├── config/         # Shared Vite/build configs
│   ├── shared/         # Utilities, constants, routes
│   ├── types/          # Shared TypeScript types
│   └── riddle-cli/     # oclif-based CLI tool
├── tools/              # AI agents, Python tools, integrations
├── infrastructure/     # Terraform (AWS S3 + CloudFront)
└── scripts/            # CI/CD, deployment, agent scripts
```

### Technology Stack

- **Framework**: Nuxt 4 (client-side SPA with `ssr: false`)
- **Package Manager**: pnpm 10.28.1 (enforced)
- **Task Runner**: Turborepo
- **Language**: TypeScript (strict mode)
- **Styling**: UnoCSS, Flowbite, Tailwind CSS
- **Testing**: Vitest (unit), Playwright (E2E)
- **Database**: IndexedDB (client-side persistence)
- **State Management**: Pinia

---

## Essential Commands

### Development

```bash
# Development (root)
pnpm run dev              # Start game dev server (via Turbo)
pnpm run dev:all          # Start all apps in parallel

# Game app specific (from apps/game/)
pnpm run dev              # Nuxt dev at localhost:3000
pnpm run dev:mobile       # Dev with --host 0.0.0.0 (mobile access)
pnpm run dev:mobile-https # Dev with HTTPS for mobile testing
pnpm run dev:debug        # Debug mode
```

### Build & Generate

```bash
# Root commands (via Turbo)
pnpm run build            # Build all projects
pnpm run generate         # Generate static site for game
pnpm run generate:debug   # Generate with debug mode

# Game app specific
pnpm run build            # Build game app
pnpm run build:debug      # Build with debug mode
pnpm run preview          # Preview production build
```

### Testing

```bash
# Unit tests (Vitest) - via Turbo
pnpm run test             # Run all tests
pnpm run test:unit        # Run all unit tests
pnpm run test:watch       # Watch mode
pnpm run test:unit:coverage # With coverage report

# From apps/game/
pnpm run test:unit              # Run once
pnpm run test:unit:coverage     # With coverage
pnpm run test:watch             # Watch mode

# E2E tests (Playwright) - via Turbo
pnpm run test:e2e               # Headless
pnpm run test:e2e:headed        # Show browser
pnpm run test:e2e:ui            # Interactive UI
pnpm run test:e2e:simple        # Simplified config
pnpm run test:bdd               # BDD tests (generate + run)
pnpm run test:bdd:headed        # BDD with visible browser
pnpm run test:bdd:generate      # Generate BDD tests
```

### Code Quality

```bash
# All checks (recommended)
pnpm run workspace:check  # Syncpack + TypeScript + ESLint

# Auto-fix everything
pnpm run workspace:fix    # Syncpack fix + lint fix + format

# Individual checks
pnpm run typecheck        # TypeScript across all packages (Turbo)
pnpm run lint             # ESLint across all packages (Turbo)
pnpm run lint:fix         # Auto-fix linting (Turbo)
pnpm run format           # Prettier format (Turbo)
pnpm run format:check     # Check formatting (Turbo)
pnpm run syncpack:check   # Check dependency version consistency
pnpm run syncpack:fix     # Fix version mismatches

# Python checks (if needed)
pnpm run python:lint
pnpm run python:format
pnpm run python:check
```

### Mobile (Capacitor/Android)

```bash
# From apps/game/
pnpm run android:sync     # Build game + sync to Android
pnpm run android:run      # Run on Android device/emulator
pnpm run android:open     # Open in Android Studio
```

### Deployment

#### AWS (S3 + CloudFront)

```bash
# Full deployment workflows
pnpm run deploy:prod              # Deploy to production
pnpm run deploy:dev               # Deploy to development

# Infrastructure (Terraform)
pnpm run infra:prod:init          # Init production Terraform
pnpm run infra:prod:plan          # Plan production changes
pnpm run infra:prod:apply         # Apply production changes
pnpm run infra:dev:init           # Init development Terraform
pnpm run infra:dev:plan           # Plan development changes
pnpm run infra:dev:apply          # Apply development changes

# Other
pnpm run deploy:infrastructure    # Deploy app using existing infra
pnpm run deploy:aws               # Direct AWS deployment (needs env vars)
```

#### Manual AWS Deployment

```bash
export AWS_S3_BUCKET=your-bucket-name
export AWS_CLOUDFRONT_ID=E1234567890ABC
export AWS_REGION=eu-central-1
./scripts/aws-deploy.sh production
```

#### Vercel

```bash
# Via scripts
./scripts/setup-vercel.sh

# Or with env vars
VERCEL_TOKEN=xxx VERCEL_ORG_ID=xxx VERCEL_PROJECT_ID=xxx npx vercel --prod
```

---

## Development Workflow

### Pre-Work Checklist

```bash
# 1. Pull latest changes
git pull origin main

# 2. Ensure dependencies are up to date
pnpm install

# 3. Verify baseline
pnpm run workspace:check
```

### Standard Workflow

```bash
# 1. Plan the change
git status
git log --oneline -5

# 2. Make small, focused changes (one logical change at a time)

# 3. Validate after each change
pnpm run workspace:check  # Or run individually:
                           # pnpm run typecheck && pnpm run lint:fix

# 4. Fix any issues immediately
pnpm run lint:fix && pnpm run format

# 5. Stage changes
git add .

# 6. Commit with conventional message
git commit -m "feat: descriptive message"

# 7. Push regularly
git push origin <branch-name>
```

### Agent Workflow Template

```bash
# 1. Make changes to code
# 2. Run quality checks
pnpm run workspace:check  # Or: pnpm run typecheck && pnpm run lint

# 3. If checks pass, commit immediately
git add .
git commit -m "feat: description of change"

# 4. Continue with next task
```

### Quick Commands for Agents

```bash
# After any code change:
pnpm run workspace:check  # Runs syncpack + typecheck + lint

# Or individually:
pnpm run typecheck        # TypeScript checks
pnpm run lint:fix          # Auto-fix linting issues
pnpm run format            # Format code

# Test changes:
pnpm run test:unit         # Run unit tests
pnpm --filter @riddle-rush/game test:unit  # Game tests only

# Commit frequently with conventional commits:
git add .
git commit -m "feat: add new feature"
git commit -m "fix: resolve type error"
git commit -m "chore: update dependencies"
```

---

## Code Organization & Patterns

### Monorepo Structure

```bash
apps/           # Application code
  game/         # Nuxt 4 PWA game
  mobile/       # NativeScript Vue mobile
  docs/         # Nuxt Content documentation
  tolgee/       # Translation management

packages/       # Shared packages
  config/       # Shared Vite/build configs
  shared/       # Utilities, constants, routes
  types/        # Shared TypeScript types
  riddle-cli/   # oclif CLI tool

tools/          # AI agents, Python tools, integrations
infrastructure/ # Terraform configs (AWS)
scripts/        # Deployment and utility scripts
```

### Workspace Packages

| Package               | Scope        | Purpose                                |
| --------------------- | ------------ | -------------------------------------- |
| `@riddle-rush/game`   | @riddle-rush | Nuxt 4 PWA — the main game application |
| `@riddle-rush/shared` | @riddle-rush | Shared utilities, constants, routes    |
| `@riddle-rush/types`  | @riddle-rush | Shared TypeScript types                |
| `@riddle-rush/config` | @riddle-rush | Shared Vite/build configurations       |

### Import Patterns

```typescript
// Shared types
import type { GameSession, Player } from '@riddle-rush/types'

// Shared utilities
import { SCORE_PER_CORRECT_ANSWER, MAX_PLAYERS } from '@riddle-rush/shared'

// Shared config
import { viteConfig } from '@riddle-rush/config/vite'

// Internal workspace packages
import { useIndexedDB } from '~/composables/useIndexedDB' // Auto-imported
```

### Vue/Nuxt Code Style

```vue
<script setup lang="ts">
// Use Composition API with <script setup>
// Composables are auto-imported (no need to import)

const { t } = useI18n()
const { $logger } = useNuxtApp()

// Use Pinia stores for state management
const gameStore = useGameStore()

// Auto-import components from components/
const GameButton = defineAsyncComponent(() => import('~/components/game/GameButton.vue'))
</script>

<template>
  <div>
    <!-- Template -->
  </div>
</template>
```

**Key Patterns:**

- Use `usePageSetup()` composable in page components
- Components are auto-imported from `components/` directory
- No explicit imports needed for composables (auto-imported)
- Always use `useRuntimeConfig().public.baseUrl` — never hardcode URLs

### TypeScript Code Style

```typescript
// Use strict mode (enabled by default)
// Prefer type inference where possible

// Use interfaces for object shapes, types for unions/intersections
interface Player {
  id: string
  name: string
  score: number
}

type GameStatus = 'active' | 'completed' | 'error'

// Export types from packages/types
export type { GameSession } from '@riddle-rush/types'

// Use workspace packages for shared code
import { myUtil } from '@riddle-rush/shared'
import type { MyType } from '@riddle-rush/types'
```

### File Organization

**Within apps/game/:**

```
apps/game/
├── assets/              # Static assets
├── components/          # Vue components (auto-imported)
│   ├── game/            # Game design components
│   ├── layout/          # Layout components
│   └── Base/            # Base UI components
├── composables/         # Vue composables (auto-imported)
├── layouts/             # Layout templates
├── pages/               # Nuxt pages (auto-routed)
├── plugins/             # Nuxt plugins
├── public/              # Static public files
├── scripts/             # Utility scripts
├── stores/              # Pinia stores
├── tests/               # Test files
│   ├── unit/            # Unit tests
│   └── e2e/             # E2E tests
├── translations/        # i18n translations
├── utils/               # Utility functions
└── nuxt.config.ts       # Nuxt config
```

### Pinia Store Pattern

```typescript
import { defineStore } from 'pinia'
import type { GameState } from '@riddle-rush/types/game'

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    // Initialize state
  }),

  getters: {
    // Computed properties
    hasActiveSession: (state) => state.currentSession !== null,
  },

  actions: {
    // Methods that mutate state
    async loadCategories() {
      // Implementation
    },

    // Must save to IndexedDB after mutations
    async saveToDB() {
      await useIndexedDB().saveGameSession(this.currentSession!)
    },
  },
})
```

### Component Pattern

```vue
<script setup lang="ts">
// Use defineProps with TypeScript interfaces
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
})

// Use defineEmits for events
interface Emits {
  (e: 'update', value: string): void
  (e: 'submit'): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <!-- Use auto-imported components -->
  <GameButton @click="emit('submit')">Submit</GameButton>
</template>
```

---

## Testing Strategy

### Unit Tests (Vitest)

**Location:** `apps/game/tests/unit/` or `*.spec.ts` in source files

**Key Patterns:**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '~/stores/game'

describe('useGameStore', () => {
  beforeEach(() => {
    // Initialize Pinia before each test
    setActivePinia(createPinia())
    // Reset store
    const store = useGameStore()
    store.$reset()
  })

  it('should have correct initial state', () => {
    const store = useGameStore()
    expect(store.currentSession).toBeNull()
  })

  it('should load categories', async () => {
    const store = useGameStore()
    await store.loadCategories()
    expect(store.categories.length).toBeGreaterThan(0)
  })
})
```

**Coverage Thresholds:** 80% (lines, functions, branches, statements)

### E2E Tests (Playwright)

**Location:** `apps/game/tests/e2e/`

**Key Patterns:**

```typescript
import { test, expect } from '@playwright/test'

test('should complete a game round', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="start-game-btn"]')

  // Use data-testid for language-agnostic testing
  await expect(page.locator('[data-testid="category-display"]')).toBeVisible()
  await page.fill('[data-testid="answer-input"]', 'Test Answer')
  await page.click('[data-testid="submit-btn"]')

  await expect(page.locator('[data-testid="score-display"]')).toBeVisible()
})
```

**Test Projects:**

- Desktop Chrome, Firefox
- Mobile Chrome (Pixel 5)

**Run Tests:**

```bash
pnpm run test:e2e           # Headless
pnpm run test:e2e:headed    # Show browser
pnpm run test:e2e:ui        # Interactive UI
pnpm run test:e2e:simple    # Simplified config
```

### Testing Tips

- Use `data-testid` attributes for testable elements
- Test workspace packages independently
- Run tests after each change before committing
- Use `pnpm run test:unit` for fast feedback
- Use `pnpm run test:e2e` for critical user flows

---

## Code Quality & Validation

### Quality Gates

Before **every commit**, ensure:

```bash
# All checks (recommended)
pnpm run workspace:check

# Individual checks
pnpm run typecheck        # TypeScript compiles without errors
pnpm run lint             # ESLint passes
pnpm run format           # Code is formatted with Prettier
pnpm run test:unit        # Unit tests pass (if relevant)
```

### Pre-Commit Hooks (Husky)

Already configured in `.husky/pre-commit`:

- Runs lint-staged on modified files
- Validates commit message format
- Prevents committing with errors

### Lint-Staged Configuration

See `.lintstagedrc.json`:

```json
{
  "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml}": ["prettier --write"]
}
```

### Syncpack Configuration

See `.syncpackrc.json`:

- Exact versions for workspace packages (`@riddle-rush/**`)
- Caret ranges (`^`) for external dependencies
- Enforces consistent versions across all workspace `package.json` files

### ESLint 9 (Flat Config)

Root `eslint.config.mjs` using `@nuxt/eslint-config/flat`:

- `@stylistic/semi`: no semicolons
- `@stylistic/quotes`: single quotes
- `@stylistic/comma-dangle`: always-multiline
- `no-console`: warn (except `warn`, `error`)
- `@typescript-eslint/no-unused-vars`: error (except `_`-prefixed)
- Tests have relaxed rules (`no-console: off`, `no-explicit-any: off`)

### TypeScript Configuration

- Strict mode enabled (`strict: true`)
- Path mappings from root `tsconfig.json`
- Workspace packages have proper type exports
- Use workspace aliases: `@riddle-rush/shared`, `@riddle-rush/types`, `@riddle-rush/config`

---

## Commit Guidelines

### Conventional Commits Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Commit Types

| Type       | Description                | Example                                        |
| ---------- | -------------------------- | ---------------------------------------------- |
| `feat`     | New feature                | `feat: add fortune wheel animation`            |
| `fix`      | Bug fix                    | `fix: resolve IndexedDB race condition`        |
| `docs`     | Documentation only         | `docs: update plugin configuration guide`      |
| `style`    | Formatting, no code change | `style: format composables with prettier`      |
| `refactor` | Code restructuring         | `refactor: extract validation logic to helper` |
| `test`     | Adding/updating tests      | `test: add unit tests for useLodash`           |
| `chore`    | Maintenance tasks          | `chore: update dependencies`                   |
| `perf`     | Performance improvement    | `perf: optimize image caching strategy`        |
| `ci`       | CI/CD changes              | `ci: add typecheck to workflow`                |
| `build`    | Build system changes       | `build: configure vite manual chunks`          |
| `wip`      | Work in progress           | `wip: add new feature (in progress)`           |

### Commit Scope (Optional)

Indicates the area affected:

- `game` - Game app changes
- `docs` - Documentation app
- `config` - Shared config package
- `types` - Type definitions
- `ci` - CI/CD pipeline
- `deps` - Dependencies
- `mobile` - Mobile app changes

**Examples:**

```bash
git commit -m "feat(game): add dark mode support"
git commit -m "fix(types): correct GameSession interface"
git commit -m "docs(plugins): document lodash composable"
git commit -m "chore(deps): update vite to 7.3.0"
```

### Good Commit Messages

✅ **Good:**

```
feat: add lodash composable with tree-shaking
fix: prevent duplicate game sessions in IndexedDB
docs: create agent workflow guidelines
refactor: simplify analytics event tracking
test: add unit tests for useLodash composable
```

❌ **Bad:**

```
update stuff
fix bug
wip
changes
```

### When to Commit

**Commit after:**

- ✅ Completing a single feature/fix
- ✅ Adding a new file/component
- ✅ Refactoring one module
- ✅ Fixing linting/type errors
- ✅ Updating documentation

**Commit frequency:**

- 🎯 **Small task**: 1-2 commits
- 🎯 **Medium task**: 3-5 commits
- 🎯 **Large task**: 5-10 commits

---

## Deployment

### GitLab CI/CD Pipeline

**Stages**: test → quality → build → deploy → verify

- Custom Docker image (`ci-build`) for faster builds (~40-50% speed improvement)
- **Monorepo change detection** — only runs jobs for affected apps/packages
- Pipeline runs on merge requests, manual triggers, version tags, and main/staging/development branches

**Branch Strategy:**

- `main` → production (`https://riddlerush.de`)
- `staging` → staging environment
- `development` → dev environment
- `tags` → AWS deployment (S3 + CloudFront)

### Deployment Workflow

#### Production (AWS S3 + CloudFront)

```bash
# Via scripts
./scripts/deploy-prod.sh

# Or with env vars
export AWS_S3_BUCKET=your-bucket-name
export AWS_CLOUDFRONT_ID=E1234567890ABC
export AWS_REGION=eu-central-1
pnpm run deploy:prod
```

#### Development/Staging

```bash
# Via scripts
./scripts/deploy-dev.sh

# Or with env vars
export AWS_S3_BUCKET=dev-bucket
export AWS_CLOUDFRONT_ID=DEV1234567890ABC
export AWS_REGION=eu-central-1
pnpm run deploy:dev
```

#### Vercel

```bash
# Setup
./scripts/setup-vercel.sh

# Deploy to staging
vercel --env NODE_ENV=staging

# Deploy to production
vercel --env NODE_ENV=production --prod
```

### Post-Deployment

After deployment, verify:

1. ✅ Tests pass on deployed site (use `BASE_URL` env var)
2. ✅ Lighthouse scores are good
3. ✅ Performance metrics are acceptable
4. ✅ Check deployment logs in GitLab CI/CD

---

## Important Gotchas

### PWA & Service Worker

- Service Worker configured in `nuxt.config.ts` with `registerType: 'autoUpdate'`
- Cache strategies:
  - `CacheFirst` for game data (`/data/*.json`), fonts
  - `NetworkFirst` for external APIs (PetScan) with 10s timeout
- PWA icons in `public/` directory
- Install prompt captured in game store via `beforeinstallprompt` event

### IndexedDB Persistence

All store mutations affecting game state must call corresponding `save*ToDB()` methods in stores:

```typescript
// In store/game.ts
export const useGameStore = defineStore('game', {
  actions: {
    async startNewSession(category: Category) {
      this.currentSession = {
        /* ... */
      }

      // IMPORTANT: Must save to IndexedDB
      await useIndexedDB().saveGameSession(this.currentSession!)
    },
  },
})
```

### Client-Only Code

Code using `window`, `localStorage`, IndexedDB must be wrapped in `onMounted` or client-only components:

```typescript
// Wrong - throws error on server
const windowWidth = window.innerWidth

// Correct
import { onMounted, ref } from 'vue'

const windowWidth = ref(0)

onMounted(() => {
  windowWidth.value = window.innerWidth
})
```

### Base URL Configuration

Always use `useRuntimeConfig().public.baseUrl` — never hardcode URLs:

```typescript
// Wrong
const url = 'https://riddlerush.de'

// Correct
const {
  public: { baseUrl },
} = useRuntimeConfig()
const url = `${baseUrl}/game`
```

### Monorepo Package Imports

- Use workspace aliases: `@riddle-rush/shared`, `@riddle-rush/types`, `@riddle-rush/config`
- Don't use relative paths for shared code
- Workspace packages must be independent (no circular dependencies)

### Turbo & Caching

- Turbo uses smart caching - unchanged tasks are skipped
- Clear cache with `pnpm run clean` or `turbo run clean`
- Inspect plugin available at `/__inspect/` during dev
- Bundle visualization at `.vite/stats.html`

### Zenflow Worktrees

This project uses **Zenflow** for task orchestration. Each task runs in an isolated git worktree:

- **No `node_modules/`** — Dependencies are not installed. Run `pnpm install` first.
- **No `.env` files** — Environment files are gitignored and must be copied from main worktree.
- **No build artifacts** — `.nuxt/`, `.output/`, `dist/` do not exist until you build.
- **Verification script runs automatically** after each agent turn — keep it passing.
- Git hooks (husky) work in worktrees — commits are validated automatically.
- Use `pnpm` (not `npm` or `yarn`) — enforced by `packageManager` field.
- The worktree shares the same git history but has an independent working directory.

### i18n Configuration

- Default locale: `de` (German), available: `de`, `en`
- Strategy: `no_prefix` (no locale in URL path)
- `detectBrowserLanguage: false` — explicit selection only
- Translation files: `locales/de.json`, `locales/en.json`
- Use `useI18n().t()` for translations

### Node Version

Minimum Node version: **20**

### Package Manager

Must use **pnpm 10.28.1** (enforced via `packageManager` field in package.json). Use `pnpm` (not `npm` or `yarn`).

---

## Tooling & Integrations

### Vite Plugins

Located in `packages/config/vite.config.ts`:

- Vite plugin checker (type-checking in browser)
- Vite plugin inspect (debug panel)
- Vite plugin dynamic prefetch
- Vite plugin compression (gzip/brotli)
- Rollup visualizer (bundle size)

### MCP Servers

Available servers (configured in `.mcp.json`):

- `docker` (Docker Hub search + container management)
- `nuxt-ui`, `nuxt` (Nuxt tooling)
- `playwright` (Playwright automation)
- `aws-docs` (AWS documentation)
- `context7`, `browsermcp`, `nuxt-mcp-toolkit`
- `git`, `gitlab` (Git integration)
- `filesystem`

### Python Tools

Located in `tools/python/`:

- Python MCP server for file operations
- Ruff linting, Black formatting
- Manages Python virtual environments

### AI Agents

Located in `tools/ai-agents/` and `.agents/`:

- AI agent tooling and utilities
- Skill system for Cursor (nuxt, pinia, vue, turborepo, etc.)

### Asset Optimization

Located in `tools/ai-agents/python/`:

- Sharp-based image optimization
- Automatic asset optimization for Nuxt 4

---

## Troubleshooting

### Issue: "Module not found" or "Module alias not found"

**Solution:** Ensure you're using workspace package imports:

```typescript
import { foo } from '@riddle-rush/shared'
import type { Bar } from '@riddle-rush/types'
```

Don't use relative paths for shared code.

### Issue: "Cannot find module" during build

**Solution:** Clear cache and rebuild:

```bash
pnpm run clean
pnpm run build
```

Or clear Turbo cache:

```bash
rm -rf .turbo/cache
pnpm run build
```

### Issue: Tests failing with "activePinia is not a function"

**Solution:** Initialize Pinia in test setup:

```typescript
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  setActivePinia(createPinia())
})
```

### Issue: TypeScript errors in stores but not in components

**Solution:** Run typecheck with full cache cleared:

```bash
rm -rf node_modules/.vite .nuxt
pnpm run typecheck
```

### Issue: CI/CD failing with dependency version mismatches

**Solution:** Run syncpack check:

```bash
pnpm run syncpack:check
pnpm run syncpack:fix
```

### Issue: Zenflow worktree has no dependencies

**Solution:** Dependencies should be auto-installed by Zenflow. If needed:

```bash
pnpm install
```

### Issue: "window is not defined" error

**Solution:** Use `onMounted` or `onClientOnly` for client-side code:

```typescript
import { onMounted } from 'vue'

onMounted(() => {
  // Client-side code here
})
```

### Issue: Build taking too long

**Solution:** Use Turbo caching:

```bash
pnpm run build  # Uses cache if nothing changed
```

Or skip unchanged tasks:

```bash
turbo run build --filter=@riddle-rush/game
```

### Issue: E2E tests failing on deployed site

**Solution:** Set `BASE_URL` environment variable:

```bash
BASE_URL=https://riddlerush.de pnpm run test:e2e
```

Or modify Playwright config to use a custom base URL.

### Issue: Service Worker not updating

**Solution:** Force update by deleting service worker:

```typescript
// In browser console
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach((name) => caches.delete(name))
  })
}
```

Or wait for `autoUpdate` registration (usually takes a few minutes).

### Issue: PWA not installable

**Solution:** Ensure:

- PWA icons exist in `public/` directory
- Service Worker is properly registered
- Game store captures `beforeinstallprompt` event
- App is served over HTTPS (or localhost)

---

## Quick Reference Card

```bash
# 📝 Standard Flow
git pull                      # 1. Pull latest
# Make changes                # 2. Edit files
pnpm run workspace:check      # 3. Verify quality
git add .                     # 4. Stage changes
git commit -m "feat: ..."     # 5. Commit
git push                      # 6. Push

# 🔍 Quality Checks
pnpm run typecheck           # Type safety
pnpm run lint                # Code quality
pnpm run lint:fix            # Auto-fix lint
pnpm run format              # Format code
pnpm run test:unit           # Run tests
pnpm run test:e2e            # E2E tests

# 📦 Commit Types
feat:     New feature
fix:      Bug fix
docs:     Documentation
refactor: Code restructuring
test:     Test changes
chore:    Maintenance
perf:     Performance
style:    Formatting

# 🎯 Commit Frequency
Small task:   1-2 commits
Medium task:  3-5 commits
Large task:   5-10 commits

# 🚀 Dev Commands
pnpm run dev              # Start game
pnpm run build            # Build all
pnpm run test             # Run tests
pnpm run workspace:check  # Full validation

# 📱 Mobile
pnpm run android:sync     # Sync to Android
pnpm run android:run      # Run on device

# 🌍 Deployment
pnpm run deploy:prod      # Deploy to production
pnpm run deploy:dev       # Deploy to development
```

---

## Checklist for Agents

Before claiming a task is complete:

- [ ] All changes tested locally
- [ ] TypeScript passes (`pnpm run typecheck`)
- [ ] ESLint passes (`pnpm run lint`)
- [ ] Code formatted (`pnpm run format`)
- [ ] Relevant tests updated
- [ ] Documentation updated
- [ ] Multiple focused commits made
- [ ] All commits pushed
- [ ] No broken code committed
- [ ] Conventional commit messages used
- [ ] IndexedDB persistence handled (if relevant)
- [ ] Client-only code wrapped correctly
- [ ] Base URL used instead of hardcoded URLs
- [ ] No console.log statements (use useLogger)

---

**Remember:** Quality > Speed. Take time to verify each change!

---

**Last Updated:** February 2026
