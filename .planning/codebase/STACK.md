# Technology Stack

**Analysis Date:** 2026-02-06

## Languages

**Primary:**

- TypeScript 5.9.3 - All application code, shared packages, tests
- JavaScript (ES2020+) - Build configuration, scripts, tooling

**Secondary:**

- Python 3.14 - AI agent tooling (`tools/python/`, MCP servers)
- Bash - Deployment scripts, CI/CD automation, agent workflows
- HCL (Terraform) - Infrastructure as code for AWS resources

## Runtime

**Environment:**

- Node.js ≥ 20.0.0 (enforced via `engines` field)
- Browser environments (client-side SPA, no SSR in production)

**Package Manager:**

- pnpm 10.28.2 (enforced via `packageManager` field)
- Lockfile: `pnpm-lock.yaml` (present)
- Workspace configuration: `pnpm-workspace.yaml`

## Frameworks

**Core:**

- Nuxt 4.3.0 - Meta-framework, client-only SPA mode (`ssr: false`)
- Vue 3.5.26 - UI framework
- Pinia 0.11.3 - State management with IndexedDB persistence
- Vite 5.x - Build tool and dev server (via Nuxt)

**Testing:**

- Vitest 3.0.0 - Unit testing with happy-dom
- Playwright 1.49.1 - E2E testing across desktop and mobile
- @nuxt/test-utils 3.23.0 - Nuxt-specific testing utilities
- @faker-js/faker 9.0.0 - Test data generation

**Build/Dev:**

- Turborepo 2.7.3 - Monorepo task orchestration with smart caching
- ESLint 9.39.2 - Linting (flat config)
- Prettier 3.7.4 - Code formatting
- TypeScript 5.9.3 - Type checking
- Syncpack 13.0.4 - Dependency version consistency
- UnoCSS 66.6.0 - Utility-first CSS
- sharp 0.34.5 - Image optimization

## Key Dependencies

**Critical:**

- `@vite-pwa/nuxt` 1.1.0 - PWA support with service worker generation
- `idb` 8.0.3 - IndexedDB wrapper for data persistence
- `@nuxtjs/i18n` 10.2.1 - Internationalization (de/en locales)
- `@vueuse/core` 14.1.0 - Vue composition utilities
- `socket.io-client` 4.8.3 - WebSocket real-time communication
- `focus-trap` 8.0.0 - Accessibility for modals

**Infrastructure:**

- `@capacitor/android` 8.0.0 - Android mobile builds
- `@capacitor/app` 8.0.0 - Capacitor app lifecycle
- `@capacitor/haptics` 8.0.0 - Mobile haptic feedback
- `@capacitor/keyboard` 8.0.0 - Mobile keyboard control
- `redis` 5.10.0 - Redis client (server-side feature flags)
- `unleash-proxy-client` 3.7.8 - GitLab Feature Flags integration
- `lodash-es` 4.17.22 - Utility functions (tree-shaken)

**AI/Automation:**

- `@anthropic-ai/claude-agent-sdk` 0.2.27 - Claude agent integration
- `@composio/core` 0.6.2 - Composio API integration
- `@trigger.dev/sdk` 4.3.2 - Task automation
- `@voltagent/core` 2.2.0 - Voltage agent framework
- `@e2b/code-interpreter` 2.3.3 - Code execution sandbox
- `langchain` 1.2.11 - LLM orchestration
- `zod` 4.3.5 - Schema validation

## Configuration

**Environment:**

- `.env` files at root and `apps/game/` (existence noted - not version controlled)
- Runtime config via `nuxt.config.ts` with Terraform output integration
- Environment variables tracked in Turbo cache invalidation
- Key configs:
  - `BASE_URL` - Application base path
  - `GOOGLE_ANALYTICS_ID` / `GTAG_ID` - Analytics tracking
  - `GITLAB_FEATURE_FLAGS_URL` / `GITLAB_FEATURE_FLAGS_TOKEN` - Feature flags
  - `CLOUDWATCH_ENDPOINT` / `CLOUDWATCH_API_KEY` - Error logging
  - `AWS_*` variables - Deployment credentials (noted - never committed)
  - `ANDROID_KEYSTORE_*` - Mobile build signing (noted - never committed)

**Build:**

- `turbo.json` - Turborepo task pipeline and caching rules
- `nuxt.config.ts` - Nuxt application configuration
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration
- `eslint.config.mjs` - ESLint 9 flat config
- `.syncpackrc.json` - Dependency version rules
- `tsconfig.json` - TypeScript compiler options
- `.changeset/config.json` - Version management
- `capacitor.config.ts` - Mobile app configuration
- `.husky/` - Git hooks for pre-commit, commit-msg, pre-push

**Infrastructure:**

- Terraform 1.5.0+ for AWS provisioning
- tfenv for Terraform version management
- State stored in S3 with DynamoDB locking (commented out in config)

## Platform Requirements

**Development:**

- Node.js ≥ 20.0.0
- pnpm ≥ 10.0.0 (preferably 10.28.2)
- Python 3.14 (for AI agent tools)
- Git with Husky hooks enabled
- Android Studio (for mobile development)
- Terraform 1.5.0+ (for infrastructure)

**Production:**

- AWS S3 + CloudFront (static site hosting)
- Browser support: ES2020+ (Chrome, Firefox, Safari, Edge)
- Mobile: Android via Capacitor
- PWA-capable browsers for offline support
- IndexedDB support required

**CI/CD:**

- GitLab CI/CD with custom Docker image
- Docker for Playwright E2E tests
- Monorepo change detection for selective builds
- Deployment targets: production, staging, development

---

_Stack analysis: 2026-02-06_
