# Guess Game - Nuxt 4 PWA

A fully-featured Progressive Web App (PWA) built with Nuxt 4, featuring offline support, IndexedDB storage, comprehensive testing, and analytics.

## Features

- **PWA** - Installable, offline-capable with service worker and smart caching
- **Nuxt 4** - Latest Vue 3 framework with auto-imports
- **Pinia** - Modern state management with persistence
- **IndexedDB** - Local data persistence with `idb` wrapper
- **Server API Routes** - Integrated REST API
- **TypeScript** - Full type safety with strict mode
- **Testing** - Unit tests (Vitest) + E2E tests (Playwright) + Chaos tests
- **ESLint + Prettier** - Code quality with auto-fix on commit
- **Husky** - Git hooks for pre-commit linting and pre-push testing
- **GitLab CI/CD** - Automated lint, test, build, deploy pipeline
- **i18n** - Internationalization support (German)
- **Debug Mode** - Press `Ctrl+Shift+D` to toggle debug panel

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run generate
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
NODE_ENV=development
APP_VERSION=1.0.0
BASE_URL=/
GOOGLE_ANALYTICS_ID=    # Optional
API_SECRET=             # Server-side only
```

Access in code via `useRuntimeConfig()`:
```typescript
const config = useRuntimeConfig()
console.log(config.public.appVersion)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (SSR) |
| `npm run generate` | Generate static site |
| `npm run preview` | Preview production build |
| `npm run test:unit` | Run unit tests |
| `npm run test:unit:coverage` | Run unit tests with coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Fix linting errors |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |

## Git Hooks

Husky is configured for monorepo-style git hooks:

- **pre-commit**: Runs `lint-staged` (ESLint + Prettier auto-fix)
- **pre-push**: Runs `typecheck` and `test:unit`

## GitLab CI/CD Pipeline

The pipeline runs on `main`, `master`, and merge requests:

1. **Lint Stage**: ESLint + Prettier checks, TypeScript type checking
2. **Test Stage**: Unit tests with coverage, E2E tests (headless Playwright)
3. **Build Stage**: Generate static site
4. **Deploy Stage**: Deploy to GitLab Pages

E2E tests use the official Playwright Docker image for headless browser testing.

## Project Structure

```
guess-game-nuxt-pwa/
├── app/                    # Nuxt app directory
│   ├── app.vue            # Root component
│   ├── assets/            # CSS and static assets
│   └── locales/           # i18n translation files
├── components/            # Vue components
│   ├── DebugPanel.vue     # Debug overlay (Ctrl+Shift+D)
│   ├── FeedbackWidget.vue # User feedback component
│   ├── Leaderboard.vue    # Score leaderboard
│   └── Spinner.vue        # Loading indicator
├── composables/           # Vue composables
├── layouts/               # Nuxt layouts
├── pages/                 # Nuxt pages (file-based routing)
├── server/                # Nitro server
│   ├── api/              # API routes
│   └── utils/            # Server utilities
├── stores/                # Pinia stores
│   ├── game.ts           # Game state management
│   └── settings.ts       # User settings
├── tests/
│   ├── unit/             # Vitest unit tests
│   ├── e2e/              # Playwright E2E tests
│   └── utils/            # Test utilities
├── types/                 # TypeScript types
├── .husky/               # Git hooks
├── nuxt.config.ts        # Nuxt configuration
└── vitest.config.ts      # Vitest configuration
```

## Debug Mode

Press `Ctrl+Shift+D` to toggle the debug panel showing:
- Current game state
- Network/PWA status
- Settings configuration
- Statistics
- Export debug info as JSON

## Credits

Created by Tobias Wirl & Markus Wagner
