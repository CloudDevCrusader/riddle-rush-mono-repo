# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 IMPORTANT: Agent Workflow (February 2026)

**Before making ANY changes, read this:**

1. **Read [AGENTS.md](AGENTS.md)** - Complete workflow guide for AI agents
2. **After EVERY change, run:** `pnpm run workspace:check`
3. **Commit frequently** (every 10-20 minutes) with Conventional Commits
4. **Quick help:** `pnpm run agent:help`

### Required Workflow

```bash
# 1. Make changes (small, focused)
# 2. Validate IMMEDIATELY
pnpm run workspace:check  # Syncpack + TypeScript + ESLint (via Turbo)

# 3. Commit right away (don't wait!)
git add .
git commit -m "feat: description"  # Conventional Commits enforced by hooks

# 4. Continue with next change
```

### Git Hooks (Automatic via Husky)

- ✅ **Pre-commit**: Secret scanning, lint-staged (ESLint + Prettier), TypeScript validation
- ✅ **Commit-msg**: Conventional Commits format enforced (minimum 10 chars)
- ✅ **Pre-push**: TypeScript checks, unit tests, syncpack version check

### Commit Format (Required)

```
feat:     New feature        fix:      Bug fix
docs:     Documentation      refactor: Code restructuring
test:     Test changes       chore:    Maintenance
perf:     Performance        style:    Formatting
ci:       CI/CD changes      build:    Build system
```

Optional scope: `feat(game): add dark mode support`

### Agent Commands

```bash
pnpm run agent:help     # Show command reference
pnpm run agent:check    # Run all quality checks (= workspace:check)
pnpm run agent:fix      # Auto-fix all issues
pnpm run agent:status   # Show status
pnpm run agent:validate # Validate changes
pnpm run agent:commit   # Validate + stage + ready to commit
```

## MCP Servers for Claude Code

- Config files: `fastmcp.json` (Claude Desktop) and `.mcp.json` (generic MCP clients). Copy with `scripts/agent-install.sh` or `cp fastmcp.json ~/.config/claude/fastmcp.json`, then restart Claude Code.
- Available servers: `docker` (Docker Hub search + container management), `riddle-rush-subagents` (VoltAgent repo tools), `nuxt-ui`, `nuxt`, `playwright`, `aws-docs`, `context7`, `browsermcp`, `nuxt-mcp-toolkit`, `git`, `gitlab` (needs `GITLAB_PERSONAL_ACCESS_TOKEN`), `filesystem`.
- Docker MCP notes: requires local Docker daemon; supports searching/pulling images and basic container ops for CI/CD checks.
- If a server is missing in Claude Code, verify the config path and rerun `scripts/agent-install.sh --interactive` to refresh secrets and env vars.

---

## Project Overview

This is a **pnpm monorepo** orchestrated by **Turborepo** containing "Riddle Rush" — a word guessing game where players guess terms from Wikipedia categories starting with a specific letter.

**Key Features:**

- PWA with offline support and installable on devices
- IndexedDB persistence for game sessions and history
- Multi-player support (2-10 players, configurable)
- i18n support (German default, English available)
- Comprehensive testing (Vitest unit tests + Playwright E2E tests)
- GitHub Actions CI/CD with automated deployment
- AWS deployment support (S3 + CloudFront)
- Android mobile builds via Capacitor
- Game design system with themed components

### Monorepo Structure

```
riddle-rush-mono-repo/
├── apps/
│   ├── game/              # 🎮 Main Nuxt 4 PWA (core gameplay)
│   ├── mobile/            # 📱 NativeScript Vue mobile app
│   └── tolgee/            # 🌐 Tolgee localization service
├── packages/
│   ├── config/            # ⚙️  Shared Vite/build configurations
│   ├── shared/            # 🔧 Shared utilities, constants, routes
│   ├── types/             # 📝 Shared TypeScript type definitions
│   └── riddle-cli/        # 🖥️  CLI tool package
├── tools/                 # 🤖 AI agents, Python tools, integrations
├── docs/                  # 📚 Documentation and guides
├── infrastructure/        # 🏗️  Terraform (AWS S3 + CloudFront)
├── scripts/               # 🔨 CI/CD, deployment, and utility scripts
├── .planning/             # 📋 Phased planning state and summaries
├── specs/                 # 📐 Specifications and design docs
└── openspec/              # 🧩 OpenSpec artifacts
```

### Workspace Packages

| Package               | Name                  | Description                                    |
| --------------------- | --------------------- | ---------------------------------------------- |
| `apps/game`           | `@riddle-rush/game`   | Nuxt 4 PWA — the main game application         |
| `apps/mobile`         | —                     | NativeScript Vue mobile app                    |
| `packages/config`     | `@riddle-rush/config` | Shared Vite/build configurations               |
| `packages/shared`     | `@riddle-rush/shared` | Shared utilities, constants, route definitions |
| `packages/types`      | `@riddle-rush/types`  | Shared TypeScript types (`GameSession`, etc.)  |
| `packages/riddle-cli` | —                     | oclif-based CLI tool                           |

### Key Technologies

- **Nuxt 4** (not Nuxt 3) — client-side SPA with `ssr: false`
- **Turborepo** — task orchestration with smart caching
- **pnpm 10.30.3** — package manager (enforced via `packageManager` field)
- **Node ≥ 20** — runtime requirement
- **ESLint 9** — flat config with `@nuxt/eslint-config/flat`
- **Syncpack** — dependency version consistency across workspace
- **Changesets** — versioning and changelog management
- **Capacitor** — Android mobile builds from the game app
- **UnoCSS** — utility-first CSS in game app
- **Husky** — git hooks for quality gates

---

## Essential Commands

### Development

```bash
pnpm install              # Install all workspace dependencies
pnpm run dev              # Start game dev server (via Turbo)
pnpm run dev:all          # Start all apps in parallel
pnpm run build            # Build game app (via Turbo)
pnpm run build:all        # Build all apps
pnpm run generate         # Generate static site for game
```

#### Game App Specific (run from `apps/game/`)

```bash
pnpm run dev              # Nuxt dev at localhost:3000
pnpm run dev:mobile       # Dev with --host 0.0.0.0 (mobile access)
pnpm run dev:mobile-https # Dev with HTTPS for mobile testing
pnpm run preview          # Preview production build
pnpm run postinstall      # Generate Nuxt types
```

### Testing

```bash
# Unit tests (Vitest) — via Turbo
pnpm run test             # Run game tests
pnpm run test:unit        # Run all workspace unit tests

# From apps/game/:
pnpm run test:unit              # Run once
pnpm run test:unit:coverage     # With coverage report
pnpm run test:watch             # Watch mode

# E2E tests (Playwright)
pnpm run test:e2e               # Headless via Turbo
pnpm run test:e2e:ui            # Interactive UI mode

# From apps/game/:
pnpm run test:e2e               # Headless
pnpm run test:e2e:headed        # Show browser
pnpm run test:e2e:ui            # Interactive UI
pnpm run test:e2e:simple        # Simplified config
pnpm run test:bdd               # BDD tests (generate + run)
pnpm run test:bdd:headed        # BDD with visible browser
```

### Code Quality (REQUIRED before commit)

```bash
# Run ALL checks via Turbo (recommended)
pnpm run workspace:check  # Syncpack + TypeScript + ESLint

# Auto-fix everything
pnpm run workspace:fix    # Syncpack fix + lint fix + format

# Individual checks
pnpm run typecheck        # TypeScript across all packages (Turbo)
pnpm run lint             # ESLint across all packages (Turbo)
pnpm run lint:fix         # Auto-fix linting (Turbo)
pnpm run format           # Prettier format (Turbo)
pnpm run format:check     # Check formatting (Turbo)
pnpm run syncpack:check   # Dependency version mismatches
pnpm run syncpack:fix     # Fix version mismatches
```

### Mobile Development (Capacitor / Android)

```bash
pnpm run android:sync     # Build game + sync to Android
pnpm run android:run      # Run on Android device/emulator
pnpm run android:open     # Open in Android Studio
```

### Dependency Management

```bash
pnpm run maintain         # Update deps + syncpack fix + workspace check
pnpm run syncpack:check   # Check dependency version consistency
pnpm run syncpack:fix     # Fix version mismatches
pnpm run syncpack:format  # Format package.json files

# Changesets
pnpm run changeset            # Create a new changeset
pnpm run changeset:version    # Apply changesets (bump versions)
pnpm run changeset:publish    # Publish packages
```

### Deployment

#### AWS (S3 + CloudFront) — Recommended

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
pnpm run infra:setup              # Setup tfenv

# Other
pnpm run deploy:infrastructure    # Deploy app using existing infra
pnpm run deploy:aws               # Direct AWS deployment (needs env vars)
pnpm run terraform:plan           # Plan via script
pnpm run terraform:apply          # Apply via script
```

#### Manual AWS Deployment

```bash
export AWS_S3_BUCKET=your-bucket-name
export AWS_CLOUDFRONT_ID=E1234567890ABC
export AWS_REGION=eu-central-1
./scripts/aws-deploy.sh production
```

### Python & AI Tools

```bash
pnpm run python:lint      # Ruff linting
pnpm run python:format    # Black formatting
pnpm run python:check     # Python checks
pnpm run ai:status        # AI agent status
pnpm run ai:agents        # Run AI agents
pnpm run ai:tools         # AI agent tools
```

### Locale Validation

```bash
pnpm run validate:locales  # Validate i18n translation files
```

---

## Architecture Overview

### Game App (`apps/game/`)

The main game is a **Nuxt 4 PWA** — a client-side SPA deployed as static files.

#### Core State Management (Pinia + IndexedDB)

- **Game Store** (`stores/game.ts`): Game sessions, categories, score, attempts. Auto-persists to IndexedDB.
- **Settings Store** (`stores/settings.ts`): User preferences, audio settings, category filters.

Key pattern: Store actions save to IndexedDB after mutations, ensuring data persists across sessions and works offline.

#### Data Persistence — IndexedDB

Managed via `composables/useIndexedDB.ts`:

| Store         | Purpose                 | Indexes              |
| ------------- | ----------------------- | -------------------- |
| `gameSession` | Current active session  | —                    |
| `gameHistory` | Completed sessions      | `startTime`          |
| `statistics`  | Aggregated player stats | —                    |
| `leaderboard` | High scores             | `score`, `timestamp` |
| `settings`    | User preferences        | —                    |

**Critical**: All store mutations affecting game state must call corresponding `save*ToDB()` methods in `stores/game.ts`.

#### PWA Implementation

Service Worker configured in `nuxt.config.ts`:

- `registerType: 'autoUpdate'`
- `CacheFirst` for game data (`/data/*.json`), fonts
- `NetworkFirst` for external APIs (PetScan) with 10s timeout
- Install prompt captured in game store via `beforeinstallprompt` event
- PWA icons in `public/` directory

#### i18n Configuration

- Default locale: `de` (German), available: `de`, `en`
- Strategy: `no_prefix` (no locale in URL path)
- `detectBrowserLanguage: false` — explicit selection only
- Translation files: `locales/de.json`, `locales/en.json`

#### Routing & SSR

- **`ssr: false`** — pure client-side SPA, statically generated
- Base URL varies by environment (production: `/riddle-rush-nuxt-pwa/`, local: `/`)
- Configured via `app.baseURL` and `runtimeConfig.public.baseUrl`

### Game Flow

1. **Main Menu** (`pages/index.vue`) → **Players** (`pages/players.vue`)
2. **Round Start** (`pages/round-start.vue`) — Fortune wheel selects category/letter
3. **Game** (`pages/game.vue`) — Players submit answers
4. **Results** (`pages/results/`) — Score display
5. **Leaderboard** (`pages/leaderboard.vue`) — Final rankings

Additional pages: `settings.vue`, `language.vue`, `credits.vue`, `splash.vue`

### Game Design System (Component Architecture)

The app uses a **phased game design system** with dedicated component categories:

#### `components/game/` — Game Design Components

| Component            | Purpose                            |
| -------------------- | ---------------------------------- |
| `GameButton.vue`     | 3D press effect button variants    |
| `GameDisplay.vue`    | Display/readout component          |
| `GameHeader.vue`     | 3D text effect headers             |
| `GameModal.vue`      | Focus-trapped modal dialogs        |
| `GamePlayerCard.vue` | Player cards with score indicators |
| `GameScrollList.vue` | Scrollable rank displays           |
| `GameSlider.vue`     | Volume/settings slider controls    |

#### `components/layout/` — Layout Components

| Component            | Purpose            |
| -------------------- | ------------------ |
| `GameBackground.vue` | Themed backgrounds |
| `GamePanel.vue`      | Content panels     |

#### `components/Base/` — Base Components

`Button.vue`, `Modal.vue`, `ImageButton.vue`

#### Other Components

`DebugPanel.vue` (Ctrl+Shift+D), `FortuneWheel.vue`, `Spinner.vue`, `Toast.vue`, `PauseModal.vue`, `QuitModal.vue`, `SplashScreen.vue`, `NetworkStatusIndicator.vue`, `GameHistory.vue`, `Leaderboard.vue`, `PlayerLeaderboard.vue`, `PageTransition.vue`, `SettingsModal.vue`, `GlobalLoading.vue`, `StoryboardDevOverlay.vue`

### Composables

| Composable             | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| `useIndexedDB()`       | All database operations                               |
| `useStatistics()`      | Aggregate stats from game sessions                    |
| `useAnalytics()`       | Google Analytics tracking                             |
| `useAudio()`           | Sound effects management                              |
| `useAnswerCheck()`     | Validate answers against category terms (5-min cache) |
| `usePageSetup()`       | Common page utilities (router, t, baseUrl, toast)     |
| `useLogger()`          | Centralized logging (dev-only, stripped in prod)      |
| `useNavigation()`      | Page navigation helpers                               |
| `useGameState()`       | Game state management                                 |
| `useGameActions()`     | Game action dispatchers                               |
| `useForm()`            | Form handling utilities                               |
| `useModal()`           | Modal state management                                |
| `useToast()`           | Toast notification system                             |
| `useLoading()`         | Loading state management                              |
| `useAssets()`          | Asset URL resolution                                  |
| `useOptimizedImage()`  | Image optimization helpers                            |
| `useLodash()`          | Tree-shaken Lodash utilities                          |
| `useFeatureFlags()`    | Unleash feature flag client                           |
| `usePerformance()`     | Performance monitoring                                |
| `useLocalStorage()`    | LocalStorage wrapper                                  |
| `usePageSwipe()`       | Swipe gesture handling                                |
| `useMenu()`            | Menu state management                                 |
| `useCategoryEmoji()`   | Category-to-emoji mapping                             |
| `useErrorSync()`       | Error synchronization                                 |
| `useStoryboard()`      | Storyboard development overlay                        |
| `useCategoryManager()` | Category selection and round category orchestration   |
| `useGameLifecycle()`   | Start/end/reset game lifecycle orchestration          |
| `usePersistence()`     | Session/history persistence orchestration             |
| `usePlayerManager()`   | Player ordering, turn progression, and selection      |
| `useScoringEngine()`   | Scoring rules and score calculation helpers           |
| `useSessionManager()`  | Active session creation and transition handling       |

### Shared Packages

#### `packages/types` (`@riddle-rush/types`)

Core game types: `GameSession`, `GameAttempt`, `Category`, etc. Imported as:

```ts
import type { GameSession } from '@riddle-rush/types';
```

#### `packages/shared` (`@riddle-rush/shared`)

Shared constants (`SCORE_PER_CORRECT_ANSWER`, `MAX_PLAYERS`, `NAVIGATION_DELAY_MS`), route definitions, and utility functions.

#### `packages/config` (`@riddle-rush/config`)

Shared Vite/build configurations used across workspace apps.

---

## Code Quality & Configuration

### ESLint 9 (Flat Config)

Root `eslint.config.mjs` using `@nuxt/eslint-config/flat`:

- `@stylistic/semi`: no semicolons
- `@stylistic/quotes`: single quotes
- `@stylistic/comma-dangle`: always-multiline
- `no-console`: warn (except `warn`, `error`)
- `@typescript-eslint/no-unused-vars`: error (except `_`-prefixed)
- Tests have relaxed rules (`no-console: off`, `no-explicit-any: off`)

### Syncpack (Dependency Consistency)

Configured in `.syncpackrc.json`:

- Exact versions for workspace packages (`@riddle-rush/**`)
- Caret ranges (`^`) for external dependencies
- Enforces consistent versions across all workspace `package.json` files

### Changesets (Version Management)

Configured in `.changeset/config.json`:

- Base branch: `main`
- Access: `restricted`
- Internal dependency updates: `patch`
- Ignored packages: `@riddle-rush/config`, `@riddle-rush/shared`, `@riddle-rush/types`

### Turborepo (Task Orchestration)

Configured in `turbo.json`:

- **Smart caching** for builds, lint, typecheck, tests
- **Dependency graph** awareness (`dependsOn: ["^build"]`)
- **Parallel execution** for independent tasks
- **Environment variables** tracked for cache invalidation
- Remote cache disabled (can be enabled)

Key tasks: `build`, `dev`, `lint`, `typecheck`, `test:unit`, `test:e2e`, `format`, `clean`

Root-only tasks (prefixed `//`): `workspace:check`, `workspace:fix`, `syncpack:check`, `agent:check`, `python:lint`

---

## Testing Architecture

### Unit Tests (Vitest with happy-dom)

- Located in `apps/game/tests/unit/` or colocated as `*.spec.ts`
- Coverage thresholds: 80% (lines, functions, branches, statements)
- Key patterns:
  - Pinia stores require `setActivePinia(createPinia())` in `beforeEach`
  - Use `vi.mock()` for external dependencies

### E2E Tests (Playwright)

- Located in `apps/game/tests/e2e/`
- Projects: Desktop Chrome, Firefox, Mobile Chrome (Pixel 5)
- Supports local builds and deployed sites via `BASE_URL` env var
- BDD testing available via `test:bdd` scripts
- Uses `data-testid` attributes for language-agnostic testing
- Screenshots/traces captured on failure

---

## GitHub Actions CI/CD

**Stages**: test → quality → build → deploy → verify

- Custom Docker image (`ci-build`) for faster builds (~40-50% speed improvement)
- **Monorepo change detection** — only runs jobs for affected apps/packages (40-60% CI time savings)
- Workflow runs on pull requests and pushes to key branches

**Branch Strategy**:

- `main` → production (`https://riddlerush.de`)
- `staging` → staging environment
- `development` → dev environment
- `tags` → AWS deployment (S3 + CloudFront)

---

## Development Workflow

### Starting New Features

1. Read relevant stores, composables, and types first
2. Check existing patterns in similar components
3. Run `pnpm run dev` for hot-reload development
4. Use Debug Panel (`Ctrl+Shift+D`) to inspect state

### Before Committing

- Pre-commit hook auto-fixes linting and scans for secrets
- If TypeScript errors exist, pre-push will fail
- Run `pnpm run workspace:check` locally to catch issues early

### Testing Changes

- Unit test new logic in `apps/game/tests/unit/`
- E2E test critical user flows in `apps/game/tests/e2e/`
- Use `pnpm run test:e2e:ui` for interactive debugging
- Use `data-testid` attributes for testable elements

---

## Environment Variables

### Development

Create `.env` at project root and `apps/game/.env`:

```bash
NODE_ENV=development
APP_VERSION=1.0.0
BASE_URL=/
NUXT_PUBLIC_GOOGLE_ANALYTICS_ID=    # Optional (legacy `GOOGLE_ANALYTICS_ID` / `GTAG_ID` still work)
```

### CI/CD Variables

- `NUXT_PUBLIC_GOOGLE_ANALYTICS_ID`, `BASE_URL` — App config (legacy GA env names still work)
- `SONAR_TOKEN`, `SONAR_PROJECT_KEY`, `SONAR_ORGANIZATION` — SonarCloud
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_CLOUDFRONT_ID`, `AWS_REGION` — AWS deployment

---

## Debugging Tips

- **IndexedDB**: DevTools → Application → IndexedDB → `riddle-rush-db`
- **Debug Panel**: `Ctrl+Shift+D` — live state, export as JSON
- **Service Worker**: DevTools → Application → Service Workers (unregister for testing)
- **E2E traces**: `npx playwright show-trace test-results/.../trace.zip`
- **PWA offline**: DevTools Application tab → simulate offline
- **Turbo cache**: `turbo run build --dry` to see what would run

---

## Important Constraints

- **No Server**: Static site only — no server API routes in production
- **Client-only**: Code using `window`, `localStorage`, IndexedDB must be wrapped in `onMounted` or client-only components
- **Base URL**: Always use `useRuntimeConfig().public.baseUrl` — never hardcode URLs
- **Package Manager**: Must use `pnpm` (not npm/yarn). Version: `pnpm@10.30.3`
- **Nuxt Version**: Nuxt 4 (not Nuxt 3)
- **Node Version**: Node ≥ 20
- **Workspace packages**: Import shared code via `@riddle-rush/types`, `@riddle-rush/shared`, `@riddle-rush/config`

---

## Quick Reference

### Common Tasks

**Add a new page:**

1. Create `apps/game/pages/new-page.vue`
2. Use `usePageSetup()` composable
3. Add translations to `apps/game/locales/de.json` and `en.json`
4. Add E2E test in `apps/game/tests/e2e/`

**Add a new composable:**

1. Create `apps/game/composables/useNewFeature.ts`
2. Use `useLogger()` for logging
3. Add unit tests in `apps/game/tests/unit/`

**Add a shared type:**

1. Add to `packages/types/src/game.ts` (or new file)
2. Export from `packages/types/src/index.ts`
3. Import via `import type { MyType } from '@riddle-rush/types'`

**Add a shared utility:**

1. Add to `packages/shared/src/`
2. Export from `packages/shared/src/index.ts`
3. Import via `import { myUtil } from '@riddle-rush/shared'`

**Deploy to production:**

1. Merge to `main` branch — CI auto-deploys
2. Or create version tag: `git tag v1.0.0 && git push --tags` for AWS

**Debug a failing test:**

1. `pnpm run test:e2e:ui` for interactive mode
2. Or `pnpm run test:e2e:headed` to see browser
3. Check `test-results/` for screenshots and traces

---

## 📚 Documentation Structure

### Root Level

- **[README.md](README.md)** — Project overview and quick start
- **[AGENTS.md](AGENTS.md)** — Complete agent workflow guide (START HERE for AI agents)
- **[CLAUDE.md](CLAUDE.md)** — This file (Claude Code specific)

### docs/ Directory

| Category        | Path                | Key Files                                                                         |
| --------------- | ------------------- | --------------------------------------------------------------------------------- |
| **Development** | `docs/development/` | `AGENT-WORKFLOW.md`, `TOOLS-AND-AGENTS.md`                                        |
| **Deployment**  | `docs/deployment/`  | `AWS-DEPLOYMENT.md`, `DOCKER-CI-IMAGE.md`, `DOCKER-DEPLOYMENT.md`                 |
| **Setup**       | `docs/setup/`       | `MONOREPO_ENVIRONMENT_GUIDE.md`, `HUSKY-TURBOREPO-SETUP.md`, `TERRAFORM-SETUP.md` |
| **Monorepo**    | `docs/`             | `MONOREPO.md`, `MONOREPO-REFACTOR.md`, `MONOREPO-ENHANCEMENTS.md`                 |
| **Testing**     | `docs/`             | `TESTING-GUIDE.md`, `TESTING.md`                                                  |
| **Performance** | `docs/`             | `ASSET-OPTIMIZATION.md`, `BUILD-OPTIMIZATION.md`, `PERFORMANCE.md`                |
| **Archive**     | `docs/archive/`     | Historical documents                                                              |

---

## 🔄 Zenflow Worktree Environment

This project uses **Zenflow** for task orchestration. Each task runs in an isolated git worktree with no installed dependencies or local config files. See `.zenflow/settings.json` for automation config.

**Key points:**

- `pnpm install` runs automatically on setup
- `.env` and `apps/game/.env` are copied from your main worktree
- `pnpm run workspace:check` runs as the verification script after each agent turn

---

## 🔄 Workflow Summary for Claude Code

1. **Read AGENTS.md first** — complete workflow documentation
2. **Make small changes** — one logical change at a time
3. **Validate immediately** — `pnpm run workspace:check`
4. **Commit frequently** — every 10-20 minutes with conventional format
5. **Use git hooks** — they automatically validate your commits

### Example Session

```bash
# Start work
pnpm install
pnpm run workspace:check  # Verify baseline

# Make change #1
# Edit: apps/game/composables/useColorMode.ts
pnpm run workspace:check
git add apps/game/composables/useColorMode.ts
git commit -m "feat: add color mode toggle"

# Make change #2
# Edit: apps/game/components/ColorModeButton.vue
pnpm run workspace:check
git add apps/game/components/ColorModeButton.vue
git commit -m "feat: add color mode button component"

# Push
git push
```

**Remember:** Git hooks will automatically run TypeScript checks, linting, secret scanning, and validate your commit message!

<!-- AICODE:START -->

@.claude/aicode-instructions.md

<!-- AICODE:END -->
