# Codebase Structure

**Analysis Date:** 2026-02-13

## Directory Layout

```
riddle-rush-mono-repo/
├── apps/                          # Application workspaces
│   ├── game/                      # Primary Nuxt 4 SPA (the main product)
│   │   ├── app.vue                # Root Vue component (splash, layout, global overlays)
│   │   ├── assets/                # Static assets and SCSS
│   │   │   ├── data/              # Game data files
│   │   │   └── scss/              # Design system and effects
│   │   │       ├── design-system.scss  # Global CSS variables and base styles
│   │   │       └── effects/       # Animation/effect stylesheets
│   │   ├── components/            # Vue components (auto-imported)
│   │   │   ├── Base/              # Generic reusable components (Button, Modal, ImageButton)
│   │   │   ├── game/              # Game-specific components (GameButton, GameDisplay, etc.)
│   │   │   ├── layout/            # Layout components (GameBackground, GamePanel)
│   │   │   └── *.vue              # Top-level components (Toast, Spinner, SplashScreen, etc.)
│   │   ├── composables/           # Business logic composables (auto-imported)
│   │   ├── layouts/               # Nuxt layouts (default, game, menu)
│   │   ├── nuxt.config.ts         # Nuxt configuration (modules, Vite, PWA, i18n, etc.)
│   │   ├── pages/                 # File-based routing
│   │   │   ├── index.vue          # / (main menu)
│   │   │   ├── players.vue        # /players
│   │   │   ├── round-start.vue    # /round-start
│   │   │   ├── game/              # /game/:gameId?
│   │   │   │   └── [[gameId]].vue
│   │   │   ├── results/           # /results/:gameId?
│   │   │   │   └── [[gameId]].vue
│   │   │   ├── leaderboard.vue    # /leaderboard
│   │   │   ├── settings.vue       # /settings
│   │   │   ├── language.vue       # /language
│   │   │   ├── credits.vue        # /credits
│   │   │   └── *.vue              # Utility pages (component-test, websocket-demo, splash)
│   │   ├── plugins/               # Nuxt client-side plugins
│   │   ├── public/                # Static files served at root (images, PWA icons, JSON data)
│   │   ├── server/                # Nitro server plugins
│   │   │   └── plugins/
│   │   │       └── socket.ts      # Socket.IO server
│   │   ├── stores/                # Pinia state stores
│   │   ├── tests/                 # All tests for the game app
│   │   │   ├── e2e/               # Playwright E2E tests
│   │   │   ├── unit/              # Vitest unit tests
│   │   │   └── utils/             # Test utilities/helpers
│   │   ├── translations/          # i18n translation files
│   │   │   └── locales/           # de.json, en.json
│   │   ├── utils/                 # Utility functions (auto-imported)
│   │   ├── playwright.config.ts   # Playwright E2E config
│   │   ├── vitest.config.ts       # Vitest unit test config
│   │   └── uno.config.ts          # UnoCSS configuration
│   └── mobile/                    # NativeScript Vue mobile app (secondary, early stage)
│       ├── app/                   # NativeScript app code
│       ├── nativescript.config.ts
│       └── package.json
├── packages/                      # Shared workspace packages
│   ├── types/                     # @riddle-rush/types — TypeScript interfaces
│   │   └── src/
│   │       ├── game.ts            # Core game types (GameSession, Player, Category, etc.)
│   │       └── index.ts           # Re-exports
│   ├── shared/                    # @riddle-rush/shared — Constants, routes, utils
│   │   └── src/
│   │       ├── constants.ts       # Game config constants (scores, timing, alphabet)
│   │       ├── routes.ts          # Route path constants and helpers
│   │       ├── utils.ts           # Shared utilities (currently placeholder)
│   │       └── index.ts           # Re-exports
│   ├── config/                    # @riddle-rush/config — Build and lint config
│   │   ├── eslint.config.mjs      # Shared ESLint config
│   │   ├── prettier.config.js     # Shared Prettier config
│   │   ├── vite.config.ts         # Shared Vite plugin helpers
│   │   ├── scripts/               # Build utility scripts
│   │   └── index.ts               # Config exports
│   └── riddle-cli/                # @riddle-rush/cli — oclif CLI tool
│       ├── bin/                   # CLI binary entry
│       └── src/                   # CLI command implementations
├── services/                      # Standalone service classes (root-level, legacy)
│   ├── GameService.ts             # Game business logic (static methods)
│   └── StorageService.ts          # Storage abstractions (localStorage, IndexedDB)
├── infrastructure/                # AWS Terraform IaC
│   ├── main.tf                    # S3, CloudFront, WAF, cache policies
│   ├── iam.tf                     # IAM roles and policies
│   ├── route53.tf                 # DNS configuration
│   ├── dynamodb.tf                # DynamoDB tables
│   ├── websocket.tf               # WebSocket API Gateway
│   ├── ssr-lambda.tf              # SSR Lambda configuration
│   ├── monitoring.tf              # CloudWatch monitoring
│   ├── dashboard.tf               # CloudWatch dashboards
│   ├── cloudwatch-api.tf          # CloudWatch API endpoints
│   ├── variables.tf               # Terraform variables
│   ├── outputs.tf                 # Terraform outputs
│   ├── versions.tf                # Provider version constraints
│   ├── environments/              # Per-environment Terraform configs
│   ├── modules/                   # Reusable Terraform modules
│   ├── lambda/                    # Lambda function source code
│   ├── cloudfront-functions/      # CloudFront function code (request-rewrite.js)
│   └── scripts/                   # Infrastructure helper scripts
├── scripts/                       # Root-level scripts (65+ shell/JS scripts)
│   ├── aws-deploy.sh              # AWS deployment
│   ├── deploy-*.sh                # Environment-specific deploys
│   ├── ci-*.sh                    # CI pipeline scripts
│   ├── agent-*.sh                 # AI agent workflow scripts
│   ├── terraform-*.sh             # Terraform wrappers
│   └── ...
├── tools/                         # AI agent and tooling experiments
│   ├── ai-agents/                 # Agent tool integrations
│   ├── python/                    # Python tooling
│   ├── fastmcp/                   # FastMCP server
│   ├── langchain/                 # LangChain integrations
│   └── ...
├── docs/                          # Project documentation (50+ markdown files)
├── middleware/                     # Root-level Nuxt middleware (game-active guard)
├── .planning/                     # GSD planning documents
├── openspec/                      # OpenSpec change artifacts
├── specs/                         # Specification documents
├── templates/                     # Project templates
├── turbo.json                     # Turborepo task configuration
├── pnpm-workspace.yaml            # pnpm workspace definition
├── package.json                   # Root package.json
├── eslint.config.mjs              # Root ESLint config
├── vercel.json                    # Vercel deployment config
├── docker-compose.yml             # Docker Compose for local dev
├── Dockerfile                     # Docker build
└── AGENTS.md                      # Agent workflow guidelines
```

## Directory Purposes

**`apps/game/`:**

- Purpose: The primary Nuxt 4 SPA — a multiplayer party word game
- Contains: All Vue components, pages, composables, stores, plugins, styles, tests, and translations
- Key files: `nuxt.config.ts` (main config), `app.vue` (root component), `stores/game.ts` (core state)

**`apps/mobile/`:**

- Purpose: NativeScript Vue mobile app (early stage, not the primary focus)
- Contains: NativeScript app entry, webpack config, TypeScript types
- Key files: `app/app.ts`, `nativescript.config.ts`

**`packages/types/`:**

- Purpose: Shared TypeScript type definitions consumed by game app
- Contains: Interface definitions for game entities
- Key files: `src/game.ts` (all core game types)

**`packages/shared/`:**

- Purpose: Shared constants, route definitions, and utility functions
- Contains: Game configuration values, route path constants, helper functions
- Key files: `src/constants.ts`, `src/routes.ts`

**`packages/config/`:**

- Purpose: Shared build tooling configuration (ESLint, Prettier, Vite plugins)
- Contains: Config files and Vite plugin helper functions
- Key files: `eslint.config.mjs`, `vite.config.ts`, `prettier.config.js`

**`packages/riddle-cli/`:**

- Purpose: oclif-based CLI for project management and agent workflows
- Contains: CLI commands, binary entry point
- Key files: `bin/run.js`, `src/` (commands)

**`services/`:**

- Purpose: Root-level standalone service classes with static methods (legacy pattern)
- Contains: `GameService.ts` (game logic), `StorageService.ts` (storage abstractions)
- Note: Most of this logic is duplicated in composables. Consider migrating.

**`infrastructure/`:**

- Purpose: AWS infrastructure as code (Terraform)
- Contains: `.tf` files for S3, CloudFront, WAF, Route53, DynamoDB, Lambda, IAM, monitoring
- Key files: `main.tf` (core resources), `variables.tf`, `environments/`

**`scripts/`:**

- Purpose: Shell and JS scripts for CI/CD, deployment, agent workflows, and maintenance
- Contains: 65+ scripts covering aws, terraform, docker, playwright, agent tooling
- Key files: `aws-deploy.sh`, `ci-build.sh`, `agent-validate.sh`

**`tools/`:**

- Purpose: AI agent integrations and experimental tooling (LangChain, FastMCP, CrewAI, etc.)
- Contains: Python and JS tools for AI agent workflows
- Key files: `ai-agents/agent-tools.py`, `python/main.py`

**`docs/`:**

- Purpose: Comprehensive project documentation
- Contains: 50+ markdown files covering deployment, development, testing, performance, plugins, architecture
- Key files: `DEVELOPMENT.md`, `DEPLOYMENT.md`, `TESTING.md`, `PERFORMANCE.md`

## Key File Locations

**Entry Points:**

- `apps/game/app.vue`: Root Vue component — splash screen, layout wrapper, global state init
- `apps/game/nuxt.config.ts`: Nuxt configuration — modules, Vite, PWA, i18n, security
- `apps/game/pages/index.vue`: Main menu page (home route `/`)
- `infrastructure/main.tf`: AWS infrastructure entry point

**Configuration:**

- `turbo.json`: Turborepo task definitions and caching rules
- `pnpm-workspace.yaml`: Workspace package locations (`apps/*`, `packages/*`, `tools/*`)
- `package.json` (root): Scripts, devDependencies, engine requirements
- `vercel.json`: Vercel deployment and caching headers
- `apps/game/nuxt.config.ts`: Game app Nuxt/Vite/module configuration
- `apps/game/vitest.config.ts`: Vitest test runner configuration
- `apps/game/playwright.config.ts`: Playwright E2E configuration
- `apps/game/uno.config.ts`: UnoCSS (utility CSS) configuration
- `eslint.config.mjs` (root): Root ESLint configuration

**Core Logic:**

- `apps/game/stores/game.ts`: Central game state — sessions, players, rounds, history, categories
- `apps/game/stores/settings.ts`: User preferences — sound, language, debug mode, feature toggles
- `apps/game/composables/useGameActions.ts`: High-level game actions with error handling and UX feedback
- `apps/game/composables/useGameState.ts`: Computed wrappers for common store getters
- `apps/game/composables/useNavigation.ts`: Type-safe route navigation with loading indicators
- `apps/game/composables/useIndexedDB.ts`: IndexedDB persistence layer (game sessions, history, stats, leaderboard)
- `apps/game/composables/useAnswerCheck.ts`: Answer verification (PetScan API + offline data)
- `apps/game/composables/useFeatureFlags.ts`: Feature flag system (GitLab Unleash + local fallback)
- `apps/game/composables/useWebSocket.ts`: Socket.IO client for real-time features

**Type Definitions:**

- `packages/types/src/game.ts`: All core game interfaces (`GameSession`, `Player`, `Category`, `GameState`, `GameStatistics`, etc.)
- `packages/shared/src/constants.ts`: Game configuration constants
- `packages/shared/src/routes.ts`: Route path constants and helper functions

**Styling:**

- `apps/game/assets/scss/design-system.scss`: Global design system (CSS custom properties, base styles)
- `apps/game/uno.config.ts`: UnoCSS utility class configuration

**Testing:**

- `apps/game/tests/unit/`: Vitest unit tests (14 spec files)
- `apps/game/tests/e2e/`: Playwright E2E tests (7 spec files)
- `apps/game/tests/utils/`: Test helpers and utilities

**Translations:**

- `apps/game/translations/locales/de.json`: German translations (default locale)
- `apps/game/translations/locales/en.json`: English translations

## Naming Conventions

**Files:**

- Pages: `kebab-case.vue` (e.g., `round-start.vue`, `component-test.vue`)
- Components: `PascalCase.vue` (e.g., `GameButton.vue`, `SplashScreen.vue`, `Toast.vue`)
- Composables: `camelCase.ts` with `use` prefix (e.g., `useNavigation.ts`, `useGameState.ts`)
- Stores: `camelCase.ts` (e.g., `game.ts`, `settings.ts`)
- Plugins: `kebab-case.client.ts` with optional numeric prefix for ordering (e.g., `00.init-plugin-system.client.ts`, `gtag.client.ts`)
- Tests (unit): `kebab-case.spec.ts` matching composable name (e.g., `use-navigation.spec.ts`)
- Tests (e2e): `kebab-case.spec.ts` matching feature name (e.g., `game-complete-flow.spec.ts`)
- Shared packages: `camelCase.ts` for source files

**Directories:**

- Component subdirectories: `PascalCase` (e.g., `Base/`, but also `game/`, `layout/` in lowercase)
- Test subdirectories: `lowercase` (e.g., `unit/`, `e2e/`, `utils/`)
- Infrastructure: `lowercase-kebab` (e.g., `cloudfront-functions/`, `state-bucket/`)

**Package Names:**

- Scoped under `@riddle-rush/` (e.g., `@riddle-rush/game`, `@riddle-rush/types`, `@riddle-rush/shared`, `@riddle-rush/config`, `@riddle-rush/cli`)

**Route Parameters:**

- Optional catch-all: `[[paramName]].vue` (Nuxt double-bracket syntax)

## Where to Add New Code

**New Page:**

- Create: `apps/game/pages/{page-name}.vue`
- Add route constant to `packages/shared/src/routes.ts`
- Add navigation helper to `apps/game/composables/useNavigation.ts`
- Add E2E test: `apps/game/tests/e2e/{page-name}.spec.ts`

**New Composable:**

- Create: `apps/game/composables/use{Name}.ts`
- Export a function named `use{Name}` that returns reactive state and methods
- Auto-imported by Nuxt — no explicit import needed in pages/components
- Add unit test: `apps/game/tests/unit/use-{name}.spec.ts`

**New Component:**

- Base/reusable: `apps/game/components/Base/{Name}.vue`
- Game-specific: `apps/game/components/game/Game{Name}.vue`
- Layout: `apps/game/components/layout/Game{Name}.vue`
- Top-level: `apps/game/components/{Name}.vue`
- Auto-imported by Nuxt (`pathPrefix: false`) — use component name directly in templates

**New Pinia Store:**

- Create: `apps/game/stores/{name}.ts`
- Use `defineStore('{name}', { state, getters, actions })` pattern
- Auto-imported by Nuxt

**New Plugin:**

- Create: `apps/game/plugins/{name}.client.ts`
- Use numeric prefix for ordering if needed (e.g., `01.{name}.client.ts`)
- Use `defineNuxtPlugin()` pattern

**New Shared Type:**

- Add to: `packages/types/src/game.ts` (or create new file in `packages/types/src/`)
- Update `packages/types/package.json` exports if adding new file

**New Shared Constant:**

- Add to: `packages/shared/src/constants.ts`

**New Utility Function:**

- Game-specific: `apps/game/utils/{name}.ts` (auto-imported by Nuxt)
- Shared across apps: `packages/shared/src/utils.ts`

**New Infrastructure Resource:**

- Add Terraform resource to appropriate `.tf` file in `infrastructure/`
- Or create new `infrastructure/{resource-name}.tf`

**New Script:**

- Create: `scripts/{action-name}.sh` (or `.js`)
- Add npm script alias in root `package.json`

## Special Directories

**`apps/game/.nuxt/`:**

- Purpose: Nuxt build artifacts, auto-generated types, plugin stubs
- Generated: Yes (by `nuxt prepare` / `nuxt dev`)
- Committed: No (gitignored)

**`apps/game/.output/`:**

- Purpose: Production build output
- Generated: Yes (by `nuxt build`)
- Committed: No (gitignored)

**`node_modules/`:**

- Purpose: Installed dependencies (hoisted by pnpm)
- Generated: Yes (by `pnpm install`)
- Committed: No (gitignored)

**`.planning/`:**

- Purpose: GSD planning and codebase analysis documents
- Generated: By GSD mapping tools
- Committed: Yes

**`openspec/`:**

- Purpose: OpenSpec change artifacts for structured feature development
- Generated: By OpenSpec workflow
- Committed: Yes

**`infrastructure/environments/`:**

- Purpose: Per-environment Terraform variable overrides (development, production)
- Generated: No (manually maintained)
- Committed: Yes (but `.tfvars` with secrets are gitignored)

**`.turbo/`:**

- Purpose: Turborepo cache
- Generated: Yes
- Committed: No (gitignored)

---

_Structure analysis: 2026-02-13_
