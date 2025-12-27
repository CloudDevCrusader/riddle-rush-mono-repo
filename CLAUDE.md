# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 4 Progressive Web App (PWA) - a word guessing game where players guess terms from Wikipedia categories starting with a specific letter. The app works offline, stores data locally using IndexedDB, and is deployed to GitLab Pages with multiple environments.

## Essential Commands

### Development
```bash
pnpm install          # Install dependencies (required after clone)
pnpm run dev          # Start development server at localhost:3000
pnpm run generate     # Generate static site for production
pnpm run preview      # Preview production build locally
```

### Testing
```bash
# Unit tests (Vitest)
pnpm run test              # Run in watch mode
pnpm run test:unit         # Run once
pnpm run test:unit:coverage # Run with coverage report

# E2E tests (Playwright)
pnpm run test:e2e          # Headless against local build
pnpm run test:e2e:headed   # Show browser
pnpm run test:e2e:ui       # Interactive UI mode
pnpm run test:e2e:local    # Full local build + test (./scripts/e2e-local.sh)

# Test deployed environments
pnpm run test:e2e:production  # Test production site
pnpm run test:e2e:staging     # Test staging site
pnpm run test:e2e:dev         # Test dev site
```

### Code Quality
```bash
pnpm run typecheck    # TypeScript type checking (also: npm run typecheck)
pnpm run lint         # ESLint check
pnpm run lint:fix     # Auto-fix linting issues
pnpm run format       # Format with Prettier
pnpm run format:check # Check formatting
```

### Deployment
```bash
./scripts/deploy-prod.sh     # Deploy to production (main branch)
./scripts/deploy-staging.sh  # Deploy to staging
./scripts/deploy-dev.sh      # Deploy to development
```

## Architecture Overview

### Core State Management Pattern

The app uses Pinia stores with IndexedDB persistence:
- **Game Store** (`stores/game.ts`): Manages game sessions, categories, score, attempts. Persists current session to IndexedDB automatically.
- **Settings Store** (`stores/settings.ts`): User preferences, audio settings, category filters.

Key pattern: Store actions save to IndexedDB after mutations, ensuring data persists across sessions and works offline.

### Data Persistence Architecture

**IndexedDB Structure** (`composables/useIndexedDB.ts`):
- `gameSession` store: Current active session
- `gameHistory` store: Completed sessions with indexes on `startTime`
- `statistics` store: Aggregated player stats
- `leaderboard` store: High scores indexed by `score` and `timestamp`
- `settings` store: User preferences

**Critical**: All store mutations that affect game state must call corresponding `save*ToDB()` methods in `stores/game.ts` to maintain persistence.

### PWA Implementation

**Service Worker** (configured in `nuxt.config.ts`):
- `registerType: 'autoUpdate'` - Auto-updates when new version detected
- Runtime caching strategies:
  - `CacheFirst` for game data (`/data/*.json`), fonts
  - `NetworkFirst` for external APIs (PetScan) with 10s timeout
- Critical files cached via `globPatterns` for offline-first experience

**Install Prompt** managed in `stores/game.ts`:
- Captures `beforeinstallprompt` event in store state
- `showInstallPrompt()` action triggers native install dialog

### i18n Configuration

Configured with `@nuxtjs/i18n` in `nuxt.config.ts`:
- Default locale: `de` (German)
- Available: `de`, `en`
- Strategy: `no_prefix` (no locale in URL path)
- `detectBrowserLanguage: false` - Explicit language selection only
- Translation files: `locales/de.json`, `locales/en.json`

### Routing & SSR

**Important**: `ssr: false` in `nuxt.config.ts` - This is a pure client-side SPA. No server-side rendering occurs. All pages are statically generated.

**Base URL Handling**: The app uses different base URLs per environment:
- Production: `/guess-game-nuxt-pwa/`
- Local dev: `/`

This is configured via `app.baseURL` and `runtimeConfig.public.baseUrl` in `nuxt.config.ts`.

### Testing Architecture

**Unit Tests** (Vitest with happy-dom):
- Located in `tests/unit/` or colocated as `*.spec.ts`
- Coverage thresholds: 80% (lines, functions, branches, statements)
- Key patterns:
  - Pinia stores require `setActivePinia(createPinia())` in `beforeEach`
  - Composables should be tested in isolation
  - Use `vi.mock()` for external dependencies

**E2E Tests** (Playwright):
- Located in `tests/e2e/`
- Projects: Desktop Chrome, Firefox, Mobile Chrome (Pixel 5)
- Can test local builds OR deployed sites via `BASE_URL` env var
- Retries: 2 in CI, 0 locally
- Screenshots/traces captured on failure

**Critical E2E Pattern**: Tests detect if running against deployed site via URL and adjust timeouts accordingly (see `playwright.config.ts`).

## GitLab CI/CD Pipeline

**Stages**: test → build → deploy → verify

**Branch Strategy**:
- `main` → production (`https://djdiox.gitlab.io/guess-game-nuxt-pwa`)
- `staging` → staging environment (`/staging` path)
- `development` → dev environment (`/dev` path)

**Key Jobs**:
1. `test` - Unit tests (gates build)
2. `build` - Generates static site via `nuxt generate`
3. `pages`/`deploy:staging`/`deploy:dev` - Deploy to GitLab Pages
4. `verify:e2e:*` - E2E tests against deployed sites (automatic, `allow_failure: true`)

**E2E in CI**: Uses `mcr.microsoft.com/playwright:v1.57.0-noble` Docker image. Waits 30s after deployment for propagation before testing.

## Common Patterns & Conventions

### Composables Usage
- `useIndexedDB()`: All database operations
- `useStatistics()`: Aggregate stats from game sessions
- `useAnalytics()`: Google Analytics tracking
- `useAudio()`: Sound effects management
- `useAnswerCheck()`: Validate player answers against category terms

### Type Safety
- `types/game.ts`: Core game types (`GameSession`, `GameAttempt`, `Category`, etc.)
- `experimental.typedPages: true` - Auto-generated route types
- Strict mode enabled: `typescript.strict: true`

### Component Patterns
- `components/DebugPanel.vue`: Press `Ctrl+Shift+D` to toggle. Shows game state, IndexedDB data, network status. Useful for debugging.
- `components/Spinner.vue`: Loading indicator used during async operations
- Auto-imported components (Nuxt convention) - no explicit imports needed

### Git Hooks (Husky)
- **pre-commit**: `lint-staged` runs ESLint + Prettier auto-fix on staged files
- **pre-push**: Runs `typecheck` and `test:unit`
- Skipped in CI via `prepare` script check

## Development Workflow

1. **Starting new features**:
   - Read relevant stores, composables, and types first
   - Check existing patterns in similar components
   - Run `pnpm run dev` for hot-reload development

2. **Before committing**:
   - Pre-commit hook auto-fixes linting
   - If TypeScript errors exist, pre-push will fail
   - Run `pnpm run typecheck` and `pnpm run test:unit` locally to catch issues early

3. **Testing changes**:
   - Unit test new logic in `tests/unit/`
   - E2E test critical user flows in `tests/e2e/`
   - Use `pnpm run test:e2e:ui` for interactive debugging

4. **Deployment**:
   - Merge to target branch (`main`, `staging`, `development`)
   - CI pipeline automatically builds and deploys
   - E2E tests run automatically against deployed site (can fail without blocking)

## Debugging Tips

- **IndexedDB inspection**: Use browser DevTools → Application → IndexedDB → `guess-game-db`
- **Debug Panel**: `Ctrl+Shift+D` shows live state, export as JSON
- **Service Worker**: DevTools → Application → Service Workers. Can unregister for testing.
- **E2E debugging**: Use `npx playwright show-trace test-results/.../trace.zip` for failed test analysis
- **PWA testing**: Use browser's "Application" DevTools to simulate offline mode

## Important Constraints

- **No Server**: This is a static site. No server API routes exist in production.
- **Client-only**: Code assuming `window`, `localStorage`, IndexedDB available must be wrapped in `onMounted` or client-only components.
- **Base URL**: Always use `useRuntimeConfig().public.baseUrl` for absolute paths, not hardcoded URLs.
- **Package Manager**: Must use `pnpm`, not `npm` or `yarn`. Version managed via `packageManager` field.
