# Codebase Structure

**Analysis Date:** 2026-02-06

## Directory Layout

```
riddle-rush-mono-repo/
├── apps/                        # Application packages
│   ├── game/                    # Main Nuxt 4 PWA (primary app)
│   └── mobile/                  # NativeScript Vue mobile app
├── packages/                    # Shared workspace packages
│   ├── config/                  # Shared Vite/build configurations
│   ├── shared/                  # Shared utilities, constants, routes
│   ├── types/                   # Shared TypeScript types
│   └── riddle-cli/              # CLI tool (oclif-based)
├── infrastructure/              # Terraform IaC (AWS S3 + CloudFront)
│   ├── environments/            # Environment-specific configs
│   ├── modules/                 # Reusable Terraform modules
│   ├── lambda/                  # Lambda function code
│   └── scripts/                 # Infrastructure automation scripts
├── scripts/                     # Build, deploy, CI/CD scripts
│   ├── agent-*.sh               # AI agent automation scripts
│   ├── aws-deploy.sh            # AWS deployment script
│   ├── ci-*.sh                  # CI/CD pipeline scripts
│   ├── deploy-*.sh              # Environment-specific deploy
│   └── terraform-*.sh           # Terraform wrapper scripts
├── docs/                        # Documentation
│   ├── development/             # Developer guides
│   ├── deployment/              # Deployment guides
│   ├── setup/                   # Setup instructions
│   └── archive/                 # Historical documentation
├── tools/                       # AI agents, Python tools, integrations
│   ├── python/                  # Python MCP server
│   ├── ai-agents/               # AI agent tooling
│   ├── fastmcp/                 # FastMCP integration
│   ├── voltagent/               # VoltAgent integration
│   └── composio/                # Composio integration
├── .husky/                      # Git hooks (pre-commit, pre-push, commit-msg)
├── .opencode/                   # OpenCode/GSD agent configuration
│   ├── agents/                  # Agent definitions
│   ├── command/                 # Custom commands
│   └── get-shit-done/           # GSD workflow templates
├── .planning/                   # Project planning artifacts
│   └── phases/                  # Phase-specific plans
├── turbo.json                   # Turborepo task configuration
├── pnpm-workspace.yaml          # Workspace package definitions
├── package.json                 # Root package with workspace scripts
├── .syncpackrc.json             # Dependency version sync rules
├── eslint.config.mjs            # ESLint 9 flat config (root)
├── .changeset/                  # Changeset version management
├── CLAUDE.md                    # Claude Code instructions
├── AGENTS.md                    # Agent workflow guide
└── README.md                    # Project overview
```

## Directory Purposes

**apps/game/**

- Purpose: Main Nuxt 4 PWA application - the core game
- Contains: Pages, components, composables, stores, tests, assets, i18n files
- Key files: `nuxt.config.ts`, `app.vue`, `package.json`

**apps/game/pages/**

- Purpose: Nuxt file-based routing pages
- Contains: Vue SFC pages for each route
- Key files: `index.vue` (main menu), `players.vue` (player setup), `round-start.vue` (fortune wheel), `game/[[gameId]].vue` (gameplay), `results/[[gameId]].vue` (scores), `leaderboard.vue` (final rankings), `settings.vue`, `language.vue`, `credits.vue`, `splash.vue`

**apps/game/components/**

- Purpose: Reusable Vue components organized by purpose
- Contains: `game/` (design system components), `layout/` (layout components), `Base/` (base components), standalone components
- Key files: `game/GameButton.vue`, `game/GameModal.vue`, `game/GamePlayerCard.vue`, `FortuneWheel.vue`, `Toast.vue`, `DebugPanel.vue`

**apps/game/composables/**

- Purpose: Vue composables for reusable reactive logic
- Contains: 26+ composables for game state, actions, validation, audio, analytics, etc.
- Key files: `useIndexedDB.ts`, `useGameState.ts`, `useGameActions.ts`, `useAnswerCheck.ts`, `usePageSetup.ts`, `useNavigation.ts`, `useAudio.ts`, `useToast.ts`, `useLogger.ts`, `useStatistics.ts`

**apps/game/stores/**

- Purpose: Pinia state management stores
- Contains: Game store and settings store
- Key files: `game.ts` (game session state + persistence), `settings.ts` (user preferences)

**apps/game/tests/**

- Purpose: Test files for unit and E2E testing
- Contains: `unit/` (Vitest tests), `e2e/` (Playwright tests), `utils/` (test helpers)
- Key files: `vitest.config.ts`, `playwright.config.ts`

**apps/game/public/**

- Purpose: Static assets served at root
- Contains: `assets/` (images by category), `data/` (JSON data), PWA icons, manifest
- Key files: `manifest.webmanifest`, `robots.txt`, `data/offlineAnswers.json`

**apps/game/i18n/locales/**

- Purpose: i18n translation files
- Contains: `de.json` (German - default), `en.json` (English)
- Key files: `de.json`, `en.json`

**apps/game/plugins/**

- Purpose: Nuxt plugins for app initialization
- Contains: Client-only plugins for analytics, i18n, WebSocket, feature flags, error sync
- Key files: `00.init-plugin-system.client.ts`, `gtag.client.ts`, `i18n.client.ts`, `websocket.client.ts`, `gitlab-feature-flags.client.ts`

**apps/game/layouts/**

- Purpose: Nuxt layouts for page templates
- Contains: `default.vue` (basic layout), `game.vue` (game page layout), `menu.vue` (menu page layout)
- Key files: `default.vue`, `game.vue`

**apps/game/assets/**

- Purpose: Processed assets (SCSS, data files)
- Contains: `scss/` (global styles), `data/` (categories)
- Key files: `assets/scss/design-system.scss`, `assets/data/categories.json`

**packages/types/**

- Purpose: Shared TypeScript type definitions
- Contains: `src/game.ts` (GameSession, Player, Category, etc.)
- Key files: `src/game.ts`, `src/index.ts`

**packages/shared/**

- Purpose: Shared utilities, constants, route definitions
- Contains: `src/constants.ts`, `src/utils.ts`, `src/routes.ts`
- Key files: `src/constants.ts` (SCORE_PER_CORRECT_ANSWER, MAX_PLAYERS, etc.)

**packages/config/**

- Purpose: Shared Vite/build configurations
- Contains: Vite plugin configurations for build and dev
- Key files: `vite.ts`

**infrastructure/**

- Purpose: Terraform infrastructure as code for AWS deployment
- Contains: Terraform modules, environment configs, Lambda functions
- Key files: `main.tf`, `variables.tf`, `outputs.tf`, `environments/production/`, `environments/development/`

**scripts/**

- Purpose: Automation scripts for build, deploy, testing, maintenance
- Contains: Bash scripts for CI/CD, agent workflows, Terraform operations
- Key files: `aws-deploy.sh`, `ci-build.sh`, `ci-deploy.sh`, `agent-validate.sh`, `workspace:check`

**docs/**

- Purpose: Comprehensive project documentation
- Contains: Developer guides, deployment instructions, setup guides
- Key files: `development/AGENT-WORKFLOW.md`, `deployment/AWS-DEPLOYMENT.md`, `setup/MONOREPO_ENVIRONMENT_GUIDE.md`

**tools/**

- Purpose: AI agent integrations and Python tooling
- Contains: Python MCP server, AI agent tools, various integrations
- Key files: `python/main.py`, `ai-agents/agent-tools.py`

**.husky/**

- Purpose: Git hooks for code quality enforcement
- Contains: `pre-commit` (lint-staged, secret scan), `pre-push` (typecheck, test), `commit-msg` (conventional commits)
- Key files: `pre-commit`, `pre-push`, `commit-msg`

**.opencode/get-shit-done/**

- Purpose: GSD agent system configuration
- Contains: Workflow templates, agent definitions, reference documentation
- Key files: `workflows/`, `templates/`, `references/`, `agents/`

## Key File Locations

**Entry Points:**

- `apps/game/app.vue`: Application root component
- `apps/game/pages/index.vue`: Main menu entry point
- `apps/game/nuxt.config.ts`: Build configuration

**Configuration:**

- `turbo.json`: Turborepo task orchestration
- `pnpm-workspace.yaml`: Workspace package definitions
- `package.json`: Root workspace scripts
- `.syncpackrc.json`: Dependency version sync rules
- `eslint.config.mjs`: ESLint flat config
- `apps/game/nuxt.config.ts`: Nuxt app configuration
- `apps/game/uno.config.ts`: UnoCSS utility configuration
- `apps/game/tsconfig.json`: TypeScript configuration

**Core Logic:**

- `apps/game/stores/game.ts`: Game state management
- `apps/game/composables/useIndexedDB.ts`: Data persistence
- `apps/game/composables/useAnswerCheck.ts`: Answer validation
- `apps/game/composables/useGameActions.ts`: Game action orchestration
- `packages/shared/src/constants.ts`: Shared constants

**Testing:**

- `apps/game/vitest.config.ts`: Vitest unit test config
- `apps/game/playwright.config.ts`: Playwright E2E test config
- `apps/game/tests/unit/`: Unit test files
- `apps/game/tests/e2e/`: E2E test files

## Naming Conventions

**Files:**

- Vue components: PascalCase (`GameButton.vue`, `FortuneWheel.vue`)
- Composables: camelCase with `use` prefix (`useGameState.ts`, `useAudio.ts`)
- Stores: camelCase (`game.ts`, `settings.ts`)
- Pages: kebab-case or lowercase (`index.vue`, `round-start.vue`, `leaderboard.vue`)
- Scripts: kebab-case with `.sh` extension (`aws-deploy.sh`, `agent-validate.sh`)
- Config files: kebab-case with extension (`nuxt.config.ts`, `playwright.config.ts`)

**Directories:**

- Workspace packages: lowercase (`apps`, `packages`, `infrastructure`)
- Component categories: lowercase or PascalCase (`game/`, `layout/`, `Base/`)
- Shared packages: kebab-case (`@riddle-rush/game`, `@riddle-rush/types`)

**Variables:**

- camelCase for variables and functions
- PascalCase for types, interfaces, components
- UPPER_SNAKE_CASE for constants (`SCORE_PER_CORRECT_ANSWER`, `MAX_PLAYERS`)

**Git Branches:**

- `main`: production branch
- `staging`: staging environment
- `development`: development environment
- Feature branches: `feature/*`, `fix/*`, `chore/*`, `docs/*`

## Where to Add New Code

**New Feature:**

- Primary code: `apps/game/pages/feature-name.vue` or `apps/game/components/FeatureName.vue`
- Business logic: `apps/game/composables/useFeature.ts`
- State management: Add to existing store or create new store in `apps/game/stores/feature.ts`
- Tests: `apps/game/tests/unit/composables/useFeature.test.ts`, `apps/game/tests/e2e/feature.spec.ts`
- i18n: Add keys to `apps/game/i18n/locales/de.json` and `apps/game/i18n/locales/en.json`

**New Component/Module:**

- Game design components: `apps/game/components/game/GameComponentName.vue`
- Layout components: `apps/game/components/layout/LayoutName.vue`
- Standalone components: `apps/game/components/ComponentName.vue`
- Base components: `apps/game/components/Base/ComponentName.vue`

**Utilities:**

- Shared helpers (cross-app): `packages/shared/src/utils.ts`
- Game-specific helpers: `apps/game/utils/helperName.ts`
- Composables (reactive logic): `apps/game/composables/useHelperName.ts`

**Types:**

- Shared types (cross-app): `packages/types/src/typeName.ts`, export from `packages/types/src/index.ts`
- Game-specific types: Define in component/composable file or `apps/game/types/` (if needed)

**Constants:**

- Shared constants (cross-app): `packages/shared/src/constants.ts`
- Game-specific constants: Add to `packages/shared/src/constants.ts` or define in relevant file

**Pages:**

- New page: `apps/game/pages/page-name.vue`
- Nested page: `apps/game/pages/section/page-name.vue`
- Dynamic route: `apps/game/pages/section/[param].vue` or `apps/game/pages/section/[[param]].vue` (optional)

**Tests:**

- Unit tests: `apps/game/tests/unit/` matching source structure (e.g., `tests/unit/composables/useFeature.test.ts`)
- E2E tests: `apps/game/tests/e2e/feature.spec.ts`
- Test helpers: `apps/game/tests/utils/helperName.ts`

**Documentation:**

- Developer docs: `docs/development/TOPIC.md`
- Setup docs: `docs/setup/TOPIC.md`
- Deployment docs: `docs/deployment/TOPIC.md`
- Component docs: Inline JSDoc comments in component files

**Scripts:**

- Build scripts: `scripts/build-*.sh`
- Deploy scripts: `scripts/deploy-*.sh`
- CI scripts: `scripts/ci-*.sh`
- Agent scripts: `scripts/agent-*.sh`

## Special Directories

**node_modules/**

- Purpose: Installed npm dependencies
- Generated: Yes (by pnpm install)
- Committed: No (gitignored)

**.nuxt/**

- Purpose: Nuxt build cache and generated files
- Generated: Yes (by nuxt build/dev)
- Committed: No (gitignored)

**.output/**

- Purpose: Nuxt production build output
- Generated: Yes (by nuxt build)
- Committed: No (gitignored)

**dist/**

- Purpose: Production build artifacts
- Generated: Yes (by build process)
- Committed: No (gitignored)

**.turbo/**

- Purpose: Turborepo cache
- Generated: Yes (by turbo commands)
- Committed: No (gitignored)

**coverage/**

- Purpose: Test coverage reports
- Generated: Yes (by vitest --coverage)
- Committed: No (gitignored)

**test-results/**

- Purpose: Playwright test results and traces
- Generated: Yes (by playwright test)
- Committed: No (gitignored)

**playwright-report/**

- Purpose: Playwright HTML reports
- Generated: Yes (by playwright test)
- Committed: No (gitignored)

**.planning/**

- Purpose: Project planning artifacts (phases, milestones)
- Generated: Yes (by GSD agent system)
- Committed: Yes

**.changeset/**

- Purpose: Changeset version management files
- Generated: Yes (by changeset add)
- Committed: Yes

**.husky/\_/**

- Purpose: Husky internal files
- Generated: Yes (by husky install)
- Committed: Yes

**public/**

- Purpose: Static assets served at root (images, data, PWA manifest)
- Generated: No (manually created assets)
- Committed: Yes

**infrastructure/environments/\*/terraform.tfstate**

- Purpose: Terraform state files
- Generated: Yes (by terraform apply)
- Committed: No (stored remotely in S3)

---

_Structure analysis: 2026-02-06_
