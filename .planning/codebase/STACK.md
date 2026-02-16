# Technology Stack

**Analysis Date:** 2026-02-13

## Languages

**Primary:**

- TypeScript 5.9.x - Application code, game logic, composables, stores, infrastructure lambdas, shared packages
- Vue 3.5.x (SFC with `<script setup lang="ts">`) - UI components in `apps/game/`

**Secondary:**

- JavaScript (ES Modules) - Lambda functions in `infrastructure/lambda/`, CloudFront functions
- HCL (Terraform) - Infrastructure as Code in `infrastructure/`
- SCSS - Design system tokens in `apps/game/assets/scss/design-system.scss`
- Python 3.14 - AI tooling scripts in `tools/` (see `.python-version`)

## Runtime

**Environment:**

- Node.js >= 20.0.0 (enforced via `engines` in `package.json`)
- Docker: `node:22-alpine` for builds, `nginx:1.27-alpine` for production serving
- AWS Lambda: `nodejs20.x` (WebSocket handlers), `nodejs24.x` (error logs, cache control)

**Package Manager:**

- pnpm 10.28.2 (enforced via `packageManager` field in root `package.json`)
- Lockfile: `pnpm-lock.yaml` (present)
- Workspace config: `pnpm-workspace.yaml`
- `.npmrc` settings: `shamefully-hoist=true`, public hoisting for eslint/prettier/typescript

## Frameworks

**Core:**

- Nuxt 4.3.x - Full-stack Vue framework, SPA mode (`ssr: false`), compatibility version 4
- Vue 3.5.x - Reactive UI framework
- Pinia 0.11.x (`@pinia/nuxt`) - State management
- UnoCSS 66.x (`@unocss/nuxt`) - Atomic CSS engine with Tailwind Wind preset (`apps/game/uno.config.ts`)
- Vite-PWA (`@vite-pwa/nuxt`) - Progressive Web App with Workbox service worker

**Testing:**

- Vitest 3.x - Unit testing (`apps/game/vitest.config.ts`)
- Playwright 1.49.x - E2E testing, mobile-first (`apps/game/playwright.config.ts`)
- happy-dom 15.x - DOM environment for unit tests
- `@faker-js/faker` 9.x - Test data generation
- `@nuxt/test-utils` 3.x - Nuxt-specific testing utilities

**Build/Dev:**

- Turbo 2.7.x - Monorepo task orchestration (`turbo.json`)
- Vite 5.4.x - Build tool (via Nuxt)
- esbuild - Minification in production
- sharp 0.34.x - Image optimization at build time
- Rollup - Bundle output (via Vite)

## Key Dependencies

**Critical:**

- `nuxt` ^4.3.0 - Core application framework (`apps/game/package.json`)
- `vue` ^3.5.26 - UI reactivity and component system
- `@pinia/nuxt` ^0.11.3 - Store management, deeply integrated
- `idb` ^8.0.3 - IndexedDB wrapper for client-side persistence (`apps/game/composables/useIndexedDB.ts`)
- `socket.io-client` ^4.8.3 - WebSocket real-time communication (`apps/game/composables/useWebSocket.ts`)
- `unleash-proxy-client` ^3.7.8 - GitLab Feature Flags via Unleash protocol (`apps/game/plugins/gitlab-feature-flags.client.ts`)

**Infrastructure:**

- `@vueuse/nuxt` ^14.1.0 - Vue composition utilities
- `@vueuse/motion` ^3.0.3 - Animation directives
- `@nuxtjs/i18n` ^10.2.1 - Internationalization (de/en, `strategy: 'no_prefix'`)
- `@nuxtjs/color-mode` ^4.0.0 - Light/dark theme switching
- `@nuxtjs/device` ^4.0.0 - Device detection
- `@nuxtjs/fontaine` ^0.5.0 - Font fallback optimization
- `@nuxt/image` ^1.9.0 - Image optimization with sharp
- `nuxt-security` ^2.5.0 - Security headers and CSP
- `lodash-es` ^4.17.22 - Utility functions (tree-shaken via `apps/game/composables/useLodash.ts`)
- `focus-trap` ^8.0.0 - Accessibility focus management
- `redis` ^5.10.0 - Redis client (dependency declared, used for caching)

**Mobile:**

- `@capacitor/app` ^8.0.0 - Native app shell (`apps/game/capacitor.config.ts`)
- `@capacitor/haptics` ^8.0.0 - Haptic feedback
- `@capacitor/keyboard` ^8.0.0 - Keyboard management
- `@capacitor/status-bar` ^8.0.0 - Status bar customization
- `@nativescript/core` ^9.0.0 - Alternative mobile runtime (`apps/mobile/`)

**AI/Tooling (root-level):**

- `@langchain/openai` ^1.2.1 - LLM integration
- `langchain` ^1.2.11 - LLM orchestration
- `@trigger.dev/sdk` ^4.3.2 - Background job processing (`trigger.config.ts`)
- `@e2b/code-interpreter` ^2.3.3 - Code sandbox execution
- `@voltagent/core` ^2.2.0 - AI agent framework
- `zod` ^4.3.5 - Runtime schema validation

**CLI:**

- `@oclif/core` ^4 - CLI framework (`packages/riddle-cli/`)

## Monorepo Structure

**Workspace Packages:**

| Package               | Path                   | Purpose                              |
| --------------------- | ---------------------- | ------------------------------------ |
| `@riddle-rush/game`   | `apps/game/`           | Main Nuxt PWA game application       |
| `mobile`              | `apps/mobile/`         | NativeScript mobile app              |
| `@riddle-rush/shared` | `packages/shared/`     | Shared constants, utils, routes      |
| `@riddle-rush/types`  | `packages/types/`      | Shared TypeScript type definitions   |
| `@riddle-rush/config` | `packages/config/`     | Shared ESLint, Vite, Prettier config |
| `@riddle-rush/cli`    | `packages/riddle-cli/` | CLI tool (oclif)                     |
| `infrastructure`      | `infrastructure/`      | Terraform IaC for AWS                |

**Path Aliases (root `tsconfig.json`):**

- `@riddle-rush/shared` -> `./packages/shared/src`
- `@riddle-rush/types` -> `./packages/types/src`
- `@riddle-rush/config` -> `./packages/config`

**Nuxt aliases (auto-configured):**

- `~/` and `@/` -> `apps/game/`

## Configuration

**Environment:**

- `.env.example` (root) - Consolidated env var template (132 lines)
- `.env.local` - Local development overrides (present, gitignored)
- `apps/game/.env.example` - Game-specific env var template
- `.env.aws.example` - AWS deployment-specific vars
- Nuxt `runtimeConfig` in `apps/game/nuxt.config.ts` maps env vars to `config.public.*`

**Key env var categories:**

- Application: `NODE_ENV`, `APP_VERSION`, `BASE_URL`
- Analytics: `GOOGLE_ANALYTICS_ID`, `GTAG_ID`
- Monitoring: `CLOUDWATCH_ENDPOINT`, `CLOUDWATCH_API_KEY`, `SENTRY_DSN`
- Feature Flags: `GITLAB_FEATURE_FLAGS_URL`, `GITLAB_FEATURE_FLAGS_TOKEN`
- Translation: `VITE_APP_TOLGEE_API_URL`, `VITE_APP_TOLGEE_API_KEY`
- AWS: `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_CLOUDFRONT_ID`
- AI Services: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `E2B_API_KEY`

**Build:**

- `turbo.json` - Task pipeline (build, dev, lint, typecheck, test)
- `apps/game/nuxt.config.ts` - Main app build config (599 lines)
- `apps/game/uno.config.ts` - UnoCSS/Tailwind utility config
- `packages/config/vite.config.ts` - Shared Vite plugins (dev vs. build)
- `apps/game/vitest.config.ts` - Unit test config
- `apps/game/playwright.config.ts` - E2E test config (mobile-first: Pixel 5, iPhone 15, iPad Pro, Galaxy S9+)

**Code Quality:**

- `eslint.config.mjs` - Root ESLint flat config (Nuxt preset, strict rules)
- `.prettierrc` - Prettier: no semi, single quotes, 100 print width, trailing comma es5
- `.syncpackrc.json` - Dependency version sync across workspace
- `.lintstagedrc.json` - Pre-commit linting (eslint + prettier on staged files)
- `.husky/` - Git hooks (pre-commit via lint-staged)
- `sonar-project.properties` - SonarCloud analysis config

**Dependency Management:**

- `renovate.json` - Automated dependency updates (minor/patch weekly, majors disabled)
- `.changeset/config.json` - Version management with Changesets

## Platform Requirements

**Development:**

- Node.js >= 20
- pnpm >= 10.0.0
- Git with Husky hooks
- Optional: Terraform >= 1.5 (for infrastructure changes)
- Optional: Python 3.14 (for AI tooling scripts)
- Optional: Android SDK (for Capacitor mobile builds)

**Production:**

- Primary: Vercel (static hosting via `vercel.json`, GitHub Actions deploy)
- Secondary: AWS S3 + CloudFront (via GitLab CI, Terraform-managed)
- Tertiary: Docker/nginx container (`Dockerfile`, `docker-compose.yml`)
- Domain: `riddlerush.de` (AWS Route53 + CloudFront)

---

_Stack analysis: 2026-02-13_
