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
pnpm install

# Copy environment file
cp .env.example .env

# Run development server
pnpm run dev

# Build for production
pnpm run generate
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
|| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build for production (SSR) |
| `pnpm run generate` | Generate static site |
| `pnpm run preview` | Preview production build |
| `pnpm run test:unit` | Run unit tests |
| `pnpm run test:unit:coverage` | Run unit tests with coverage |
| `pnpm run test:e2e` | Run E2E tests |
| `pnpm run lint` | Check for linting errors |
| `pnpm run lint:fix` | Fix linting errors |
| `pnpm run format` | Format code with Prettier |
| `pnpm run typecheck` | Run TypeScript type checking |
| `npm run typecheck` | Run TypeScript type checking |

## Git Hooks

Husky is configured for monorepo-style git hooks:

- **pre-commit**: Runs `lint-staged` (ESLint + Prettier auto-fix)
- **pre-push**: Runs `typecheck` and `test:unit`

## Deployment & URLs

### Environments

- **Documentation**: https://djdiox.gitlab.io/riddle-rush-nuxt-pwa (GitLab Pages)
- **Development**: https://dvd66jaack4ue.cloudfront.net (AWS S3 + CloudFront)
- **Production**: https://d1mgifvomw928y.cloudfront.net (AWS S3 + CloudFront)

> **Note**: CloudFront domains are managed via Terraform. See `infrastructure/environments/` for configuration.

### GitLab CI/CD Pipeline

The pipeline runs on `main`, `development`, and merge requests:

1. **Test Stage**: Unit tests (Vitest) + E2E tests (Playwright)
2. **Quality Stage**: SonarCloud analysis (merge requests)
3. **Build Stage**: Generate static site
4. **Deploy Stage**: 
   - `main` → GitLab Pages (docs only)
   - `development` → AWS S3 + CloudFront
   - `main` → AWS S3 + CloudFront
   - Tags → AWS S3 + CloudFront

**Pipeline**: https://gitlab.com/djdiox/riddle-rush-nuxt-pwa/-/pipelines

### AWS Deployment

Deployments to AWS require CI/CD variables:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET` (or `AWS_S3_BUCKET_DEV`/`AWS_S3_BUCKET_PROD`)
- `AWS_CLOUDFRONT_ID` (or `AWS_CLOUDFRONT_ID_DEV`/`AWS_CLOUDFRONT_ID_PROD`)
- `AWS_REGION` (defaults to `eu-central-1`)

See `docs/AWS-DEPLOYMENT.md` for detailed setup.

## Project Structure

This is a **monorepo** using pnpm workspaces:

```
riddle-rush-nuxt-pwa/
├── apps/
│   ├── game/              # Main game application (Nuxt 4 PWA)
│   └── docs/              # Documentation site (Nuxt Content)
├── packages/
│   ├── shared/            # Shared utilities and constants
│   ├── types/             # Shared TypeScript types
│   └── config/            # Shared configuration (ESLint, Prettier, Vite)
├── infrastructure/        # Terraform IaC for AWS
├── scripts/              # Deployment and utility scripts
└── docs/                 # Documentation files
```

## Resources

- **Repository**: https://gitlab.com/djdiox/riddle-rush-nuxt-pwa
- **CI/CD Pipelines**: https://gitlab.com/djdiox/riddle-rush-nuxt-pwa/-/pipelines
- **Documentation**: https://djdiox.gitlab.io/riddle-rush-nuxt-pwa
- **Issues**: See `docs/MVP-TASKS.md` for current tasks

## Debug Mode

Press `Ctrl+Shift+D` to toggle the debug panel showing:
- Current game state
- Network/PWA status
- Settings configuration
- Statistics
- Export debug info as JSON

## Credits

Created by Tobias Wirl & Markus Wagner
