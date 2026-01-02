# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Nuxt 4 Progressive Web App (PWA)** - "Riddle Rush" - a word guessing game where players guess terms from Wikipedia categories starting with a specific letter. The app works offline, stores data locally using IndexedDB, and is deployed to GitLab Pages with multiple environments.

**Key Features:**

- PWA with offline support and installable on devices
- IndexedDB persistence for game sessions and history
- Multi-player support (up to 6 players)
- i18n support (German default, English available)
- Comprehensive testing (Vitest unit tests + Playwright E2E tests)
- GitLab CI/CD with automated deployment
- AWS deployment support (S3 + CloudFront)

## Essential Commands

### Development

```bash
pnpm install          # Install dependencies (required after clone)
pnpm run dev          # Start development server at localhost:3000
pnpm run generate     # Generate static site for production
pnpm run preview      # Preview production build locally
pnpm run postinstall  # Generate Nuxt types (run after install)
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
pnpm run typecheck    # TypeScript type checking
pnpm run lint         # ESLint check
pnpm run lint:fix     # Auto-fix linting issues
pnpm run format       # Format with Prettier
pnpm run format:check # Check formatting
```

### Deployment

#### GitLab Pages (Default)

```bash
./scripts/deploy-prod.sh     # Deploy to production (main branch)
./scripts/deploy-staging.sh  # Deploy to staging
./scripts/deploy-dev.sh      # Deploy to development
```

#### AWS (S3 + CloudFront)

```bash
# Quick deployment (S3 only)
export AWS_S3_BUCKET=your-unique-bucket-name
export AWS_REGION=eu-central-1
./aws-deploy.sh production

# With CloudFront CDN
export AWS_S3_BUCKET=your-bucket-name
export AWS_CLOUDFRONT_ID=E1234567890ABC
export AWS_REGION=eu-central-1
./aws-deploy.sh production

# Test against AWS deployment
BASE_URL=https://your-domain.com pnpm run test:e2e
```

See [AWS Deployment Guide](docs/AWS-DEPLOYMENT.md) for detailed setup instructions.

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

**PWA Icons**: Located in `public/` directory (pwa-\*.png, favicon.ico, apple-touch-icon.png)

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

- Production: `/riddle-rush-nuxt-pwa/`
- Local dev: `/`

This is configured via `app.baseURL` and `runtimeConfig.public.baseUrl` in `nuxt.config.ts`.

### Game Flow

**Current Flow** (MVP):

1. Main Menu (`pages/index.vue`) → Players (`pages/players.vue`)
2. Round Start (`pages/round-start.vue`) - Fortune wheel selects category/letter
3. Game (`pages/game.vue`) - Players submit answers
4. Results (`pages/results.vue`) - Score display
5. Leaderboard (`pages/leaderboard.vue`) - Final rankings

**Removed for MVP**: Win page, coin system, alphabet selection page (replaced by round-start)

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
- Tests use `data-testid` attributes for language-agnostic testing

**Critical E2E Pattern**: Tests detect if running against deployed site via URL and adjust timeouts accordingly (see `playwright.config.ts`).

## GitLab CI/CD Pipeline

**Stages**: test → quality → build → deploy → verify

**Custom Docker Image**: The CI pipeline uses a custom Docker image (`ci-build`) with pre-installed dependencies for faster builds (~40-50% speed improvement). See `docs/DOCKER-CI-IMAGE.md` for details.

**Workflow Rules**: Pipeline runs on:

- Merge requests
- Manual triggers (web UI/API)
- Version tags (for AWS deployment)
- Main/staging/development branches (not auto-run on push)

**Branch Strategy**:

- `main` → production (`https://djdiox.gitlab.io/riddle-rush-nuxt-pwa`)
- `staging` → staging environment (`/staging` path)
- `development` → dev environment (`/dev` path)
- `tags` → AWS deployment (S3 + CloudFront)

**Key Jobs**:

1. `test` - Unit tests (gates build)
2. `sonarcloud-check` - Code quality analysis (merge requests, main branches)
3. `build` - Generates static site via `nuxt generate`
4. `pages`/`deploy:staging`/`deploy:dev` - Deploy to GitLab Pages
5. `deploy:aws` - Deploy to AWS (tags only)
6. `verify:e2e:*` - E2E tests against deployed sites (manual, `allow_failure: true`)

**E2E in CI**: Uses `mcr.microsoft.com/playwright:v1.57.0-noble` Docker image. Waits 30s after deployment for propagation before testing.

## Code Quality & Best Practices

### Logging System

**Centralized Logging** (`composables/useLogger.ts`):

- All console statements replaced with logger utility
- Only logs in development mode
- Production builds have console statements removed
- Use `useLogger()` composable for all logging needs

### Constants Management

**Shared Constants** (`utils/constants.ts`):

- All magic numbers extracted to centralized file
- Includes: scores, timing, API configs, limits
- Examples: `SCORE_PER_CORRECT_ANSWER`, `MAX_PLAYERS`, `NAVIGATION_DELAY_MS`

### Common Patterns

**Page Setup Composable** (`composables/usePageSetup.ts`):

- Reduces boilerplate in page components
- Provides: `router`, `t`, `baseUrl`, `toast`
- Use in all page components for consistency

### Error Handling

**Current State**: Basic error handling with logger
**Needed Improvements** (see `docs/MVP-TASKS.md`):

- Try-catch blocks in game submission
- Network error recovery
- IndexedDB fallback to localStorage
- User-facing error messages/toasts

## Common Patterns & Conventions

### Composables Usage

- `useIndexedDB()`: All database operations
- `useStatistics()`: Aggregate stats from game sessions
- `useAnalytics()`: Google Analytics tracking
- `useAudio()`: Sound effects management
- `useAnswerCheck()`: Validate player answers against category terms (with 5-minute caching)
- `usePageSetup()`: Common page utilities
- `useLogger()`: Centralized logging

### Type Safety

- `types/game.ts`: Core game types (`GameSession`, `GameAttempt`, `Category`, etc.)
- `experimental.typedPages: true` - Auto-generated route types
- Strict mode enabled: `typescript.strict: true`

### Component Patterns

- `components/DebugPanel.vue`: Press `Ctrl+Shift+D` to toggle. Shows game state, IndexedDB data, network status. Useful for debugging.
- `components/Spinner.vue`: Loading indicator used during async operations
- `components/Base/*`: Base components (Button, Modal, ImageButton)
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
   - Use Debug Panel (`Ctrl+Shift+D`) to inspect state

2. **Before committing**:
   - Pre-commit hook auto-fixes linting
   - If TypeScript errors exist, pre-push will fail
   - Run `pnpm run typecheck` and `pnpm run test:unit` locally to catch issues early

3. **Testing changes**:
   - Unit test new logic in `tests/unit/`
   - E2E test critical user flows in `tests/e2e/`
   - Use `pnpm run test:e2e:ui` for interactive debugging
   - Use `data-testid` attributes for testable elements

4. **Deployment**:
   - Merge to target branch (`main`, `staging`, `development`)
   - CI pipeline automatically builds and deploys
   - E2E tests can be manually triggered against deployed site
   - For AWS: Create version tag to trigger deployment

## Environment Variables

### Development

Create `.env` file:

```bash
NODE_ENV=development
APP_VERSION=1.0.0
BASE_URL=/
GOOGLE_ANALYTICS_ID=    # Optional
```

### GitLab CI/CD Variables

Set in GitLab: Settings → CI/CD → Variables

- `GOOGLE_ANALYTICS_ID` (optional, masked)
- `BASE_URL` (optional, for custom base paths)
- `SONAR_TOKEN` (for SonarCloud, masked, protected)
- `SONAR_PROJECT_KEY` (for SonarCloud)
- `SONAR_ORGANIZATION` (for SonarCloud)
- `AWS_ACCESS_KEY_ID` (for AWS deployment, masked, protected)
- `AWS_SECRET_ACCESS_KEY` (for AWS deployment, masked, protected)
- `AWS_S3_BUCKET` (for AWS deployment)
- `AWS_CLOUDFRONT_ID` (for AWS deployment, optional)
- `AWS_REGION` (for AWS deployment, default: us-east-1)

## Debugging Tips

- **IndexedDB inspection**: Use browser DevTools → Application → IndexedDB → `riddle-rush-db`
- **Debug Panel**: `Ctrl+Shift+D` shows live state, export as JSON
- **Service Worker**: DevTools → Application → Service Workers. Can unregister for testing.
- **E2E debugging**: Use `npx playwright show-trace test-results/.../trace.zip` for failed test analysis
- **PWA testing**: Use browser's "Application" DevTools to simulate offline mode
- **Network debugging**: Check PetScan API calls in Network tab, verify caching behavior

## Important Constraints

- **No Server**: This is a static site. No server API routes exist in production.
- **Client-only**: Code assuming `window`, `localStorage`, IndexedDB available must be wrapped in `onMounted` or client-only components.
- **Base URL**: Always use `useRuntimeConfig().public.baseUrl` for absolute paths, not hardcoded URLs.
- **Package Manager**: Must use `pnpm`, not `npm` or `yarn`. Version managed via `packageManager` field (10.26.2).
- **Nuxt Version**: Nuxt 4 (not Nuxt 3)
- **Node Version**: Node 20 (specified in CI/CD)

## Known Issues & Technical Debt

### Critical Issues (see `docs/MVP-TASKS.md`)

- Error handling missing in game submission (`pages/game.vue`)
- Pause functionality not implemented (design assets exist)
- Quit confirmation modal not implemented
- Input validation needed for player names
- Edge cases: 0 players, empty inputs, network failures

### Completed Optimizations

- ✅ Centralized logging system
- ✅ Shared constants file
- ✅ Common page setup composable
- ✅ Category caching (5-minute cache)
- ✅ Console statements removed from production
- ✅ Type safety improvements

### Remaining Work

- Error handling improvements
- Pause/Quit modals
- Input validation
- E2E test coverage for error scenarios
- Performance optimizations (image compression, lazy loading)

## Project Structure

```
riddle-rush-nuxt-pwa/
├── components/          # Vue components (auto-imported)
│   ├── Base/          # Base components (Button, Modal, etc.)
│   └── *.vue          # Feature components
├── composables/        # Vue composables (auto-imported)
├── layouts/           # Nuxt layouts
├── pages/             # Nuxt pages (file-based routing)
├── stores/            # Pinia stores
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and constants
├── locales/           # i18n translation files
├── public/            # Static assets (images, icons, data)
├── tests/
│   ├── unit/          # Vitest unit tests
│   ├── e2e/           # Playwright E2E tests
│   └── utils/         # Test utilities
├── scripts/           # Deployment and CI scripts
└── docs/              # Documentation
```

## Infrastructure as Code

**Terraform Infrastructure** (`infrastructure/`):

- Terraform configurations for AWS (S3 + CloudFront)
- Uses `tfenv` for Terraform version management
- Supports `terraformer` for importing existing resources
- Environment-specific configurations (production/staging/development)

**Quick Commands:**

```bash
# Setup Terraform
pnpm run infra:setup

# Initialize
pnpm run infra:init

# Plan changes
pnpm run infra:plan

# Apply changes
pnpm run infra:apply

# Import existing resources
pnpm run infra:import
```

See `infrastructure/README.md` and `docs/TERRAFORM-SETUP.md` for detailed setup and usage.

## Additional Resources

- **AWS Deployment**: See `docs/AWS-DEPLOYMENT.md` for comprehensive AWS setup
- **Terraform Setup**: See `docs/TERRAFORM-SETUP.md` for Terraform infrastructure guide
- **Useful Packages**: See `docs/USEFUL-PACKAGES.md` for recommended Nuxt packages and plugins
- **Asset Optimization**: See `docs/ASSET-OPTIMIZATION.md` for asset loading strategies and image optimization
- **AWS Asset Optimization**: See `docs/AWS-ASSET-OPTIMIZATION.md` for CloudFront CDN integration and cost optimization
- **Build Optimization**: See `docs/BUILD-OPTIMIZATION.md` for build performance optimizations
- **Dependency Management**: See `docs/DEPENDENCY-MANAGEMENT.md` for dependency upgrade workflows
- **Testing Guide**: See `docs/TESTING.md` for detailed testing documentation
- **Development Guide**: See `docs/DEVELOPMENT.md` for refactoring history and optimizations
- **Project History**: See `docs/PROJECT-HISTORY.md` for consolidated history of completed work
- **Game Workflow**: See `docs/WORKFLOW.md` for complete game flow documentation
- **MVP Tasks**: See `docs/MVP-TASKS.md` for critical tasks and known issues
- **TODO**: See `docs/TODO.md` for future enhancements

## Quick Reference

### Common Tasks

**Add a new page:**

1. Create `pages/new-page.vue`
2. Use `usePageSetup()` composable
3. Add translations to `locales/de.json` and `locales/en.json`
4. Add E2E test in `tests/e2e/`

**Add a new composable:**

1. Create `composables/useNewFeature.ts`
2. Use `useLogger()` for logging
3. Add unit tests in `tests/unit/`

**Deploy to production:**

1. Merge to `main` branch
2. CI automatically builds and deploys to GitLab Pages
3. Manually trigger `verify:e2e:production` to test

**Deploy to AWS:**

1. Create version tag: `git tag v1.0.0 && git push --tags`
2. CI automatically deploys to AWS
3. Manually trigger `verify:e2e:aws` to test

**Debug a failing test:**

1. Run `pnpm run test:e2e:ui` for interactive mode
2. Or `pnpm run test:e2e:headed` to see browser
3. Check `test-results/` for screenshots and traces
