# Codebase Structure

**Analysis Date:** 2026-01-31

## Directory Layout

```
riddle-rush-mono-repo/
├── apps/                        # Monorepo applications
│   ├── game/                    # Main Riddle Rush game (Nuxt 4 PWA)
│   ├── docs/                    # Documentation site (Nuxt 4)
│   └── mobile/                  # Mobile app (Capacitor)
├── packages/                    # Shared packages
│   ├── types/                   # TypeScript type definitions
│   ├── shared/                  # Constants, routes, utilities
│   ├── config/                  # Vite/Nuxt configuration
│   └── riddle-cli/              # Command-line tools
├── infrastructure/              # Terraform AWS infrastructure
│   ├── environments/            # Environment-specific configs
│   ├── modules/                 # Terraform modules (S3, CloudFront)
│   ├── cloudfront-functions/    # Lambda@Edge functions
│   └── scripts/                 # Infrastructure helper scripts
├── docs/                        # Project documentation (markdown)
│   ├── setup/                   # Setup guides
│   ├── deployment/              # Deployment documentation
│   └── development/             # Development guides
└── scripts/                     # Project-level scripts
```

## Directory Purposes

**apps/game/:**

- Purpose: Main game application - Nuxt 4 PWA with offline support
- Contains: Vue pages, components, stores, composables, tests
- Key files: `nuxt.config.ts`, `app.vue`, `package.json`

**apps/game/pages/:**

- Purpose: File-based route definitions (Nuxt convention)
- Contains: 9 page components for game flow
- Key files:
  - `index.vue` - Main menu
  - `players.vue` - Player setup
  - `round-start.vue` - Category/letter selection
  - `game/[[gameId]].vue` - Game page (optional gameId parameter)
  - `results/[[gameId]].vue` - Results page
  - `leaderboard.vue` - Leaderboard rankings
  - `language.vue` - Language selection
  - `settings.vue` - Game settings
  - `credits.vue` - Credits page

**apps/game/components/:**

- Purpose: Reusable Vue components
- Contains: 18 components for UI elements and features
- Subdirectories:
  - `Base/` - Base components (Button, ImageButton, Modal)
  - Root level: Feature components (Spinner, Toast, DebugPanel, FortuneWheel, etc.)

**apps/game/composables/:**

- Purpose: Reusable composition functions (Vue 3 composables)
- Contains: 26 composables for game logic, data access, UI utilities
- Key groupings:
  - Game State: `useGameState.ts`, `useGameActions.ts`
  - Data Persistence: `useIndexedDB.ts`, `useAnswerCheck.ts`
  - Navigation: `useNavigation.ts`
  - UI: `useToast.ts`, `useModal.ts`, `useLoading.ts`
  - Settings: `useLocalStorage.ts`
  - Analytics: `useAnalytics.ts`
  - Audio: `useAudio.ts`

**apps/game/stores/:**

- Purpose: Pinia state management stores
- Contains: 2 stores for game and settings management
- Key files:
  - `game.ts` - Game sessions, players, categories, leaderboard
  - `settings.ts` - User preferences, audio/music settings, language

**apps/game/layouts/:**

- Purpose: Nuxt layout components for page structure
- Contains: 3 layouts
- Key files:
  - `default.vue` - Standard page layout with background, global loading
  - `game.vue` - Game-specific layout
  - `menu.vue` - Menu-specific layout

**apps/game/plugins/:**

- Purpose: Nuxt plugins for initialization
- Contains: 1 critical initialization plugin
- Key files: `00.init-plugin-system.client.ts` - Fixes plugin initialization order

**apps/game/utils/:**

- Purpose: Utility functions and helpers
- Contains: 2 utility files
- Key files:
  - `constants.ts` - App-wide constants (scores, timing, API configs)
  - `filter-ssr-plugins.ts` - SSR plugin filtering logic

**apps/game/public/:**

- Purpose: Static assets
- Contains: Images, audio, game data JSON files
- Key subdirectories:
  - `assets/` - Images for menu, game UI, alphabet
  - `data/` - Game data (categories.json, offlineAnswers.json)

**apps/game/tests/:**

- Purpose: Test files
- Contains: Unit tests and E2E tests
- Subdirectories:
  - `unit/` - Vitest unit tests
  - `e2e/` - Playwright E2E tests
  - `utils/` - Test utilities and fixtures

**apps/game/i18n/locales/:**

- Purpose: Translation files
- Contains: JSON translation files for supported languages
- Key files: `de.json`, `en.json`

**packages/types/src/:**

- Purpose: Shared TypeScript type definitions
- Contains: Core game types used across apps
- Key files: `game.ts` - GameSession, Player, Category, GameState types

**packages/shared/src/:**

- Purpose: Shared constants and utilities
- Contains: Constants, route definitions, shared functions
- Key files:
  - `routes.ts` - Route path constants
  - `constants.ts` - Game constants (scores, timing, API params)
  - `utils.ts` - Utility functions

**packages/config/:**

- Purpose: Build and dev configuration
- Contains: Vite plugin configuration, build settings

**infrastructure/:**

- Purpose: Infrastructure as Code (Terraform)
- Contains: AWS infrastructure definitions
- Subdirectories:
  - `environments/` - Environment-specific variables
  - `modules/` - Reusable Terraform modules
  - `scripts/` - Helper scripts for Terraform

## Key File Locations

**Entry Points:**

- `apps/game/app.vue` - Application root, initializes stores and listeners
- `apps/game/nuxt.config.ts` - Nuxt configuration, module setup, build config
- `apps/game/pages/index.vue` - Main menu, first user-facing page

**Configuration:**

- `apps/game/nuxt.config.ts` - Nuxt framework configuration
- `apps/game/tsconfig.json` - TypeScript configuration
- `apps/game/vitest.config.ts` - Unit test configuration
- `apps/game/playwright.config.ts` - E2E test configuration
- `package.json` - Dependencies and scripts

**Core Logic:**

- `apps/game/stores/game.ts` - Game state, session management (500+ lines)
- `apps/game/stores/settings.ts` - Settings persistence
- `apps/game/composables/useGameState.ts` - State proxy
- `apps/game/composables/useGameActions.ts` - High-level game actions
- `apps/game/composables/useIndexedDB.ts` - Database operations (300+ lines)
- `apps/game/composables/useAnswerCheck.ts` - Answer validation (200+ lines)

**Testing:**

- `apps/game/tests/unit/` - Vitest unit tests
- `apps/game/tests/e2e/` - Playwright E2E tests
- `apps/game/tests/utils/` - Test helper functions

**Game Pages:**

- `apps/game/pages/index.vue` - Main menu
- `apps/game/pages/players.vue` - Player setup
- `apps/game/pages/round-start.vue` - Category selection
- `apps/game/pages/game/[[gameId]].vue` - Game play (core gameplay)
- `apps/game/pages/results/[[gameId]].vue` - Round results

## Naming Conventions

**Files:**

- Page components: PascalCase without prefix (e.g., `players.vue`, `leaderboard.vue`)
- Composables: `use` prefix + camelCase (e.g., `useGameState.ts`, `useAnswerCheck.ts`)
- Stores: camelCase without prefix (e.g., `game.ts`, `settings.ts`)
- Components: PascalCase (e.g., `FortuneWheel.vue`, `DebugPanel.vue`)
- Utilities: camelCase with purpose (e.g., `filter-ssr-plugins.ts`)
- Layouts: camelCase (e.g., `default.vue`, `game.vue`, `menu.vue`)

**Directories:**

- Composables: `composables/` (Nuxt auto-import convention)
- Stores: `stores/` (Pinia auto-import convention)
- Components: `components/` (Nuxt auto-import convention)
- Pages: `pages/` (Nuxt file-based routing convention)
- Layouts: `layouts/` (Nuxt auto-import convention)
- Type definitions: `types/` for app-specific, `packages/types/` for shared

**Variables & Functions:**

- Functions: camelCase (e.g., `saveGameSessionToDB()`, `startNewGame()`)
- Constants: UPPER_SNAKE_CASE (e.g., `SCORE_PER_CORRECT_ANSWER`, `MAX_PLAYERS`)
- Boolean flags: `is` or `has` prefix (e.g., `isGameCompleted`, `hasActiveSession`)
- Refs/computed: camelCase (e.g., `currentScore`, `leaderboard`)

## Where to Add New Code

**New Game Feature (e.g., pause button):**

- Component: `apps/game/components/PauseModal.vue` (or feature-specific component)
- Store action: Add method to `apps/game/stores/game.ts`
- Page integration: Add to relevant game page (e.g., `apps/game/pages/game/[[gameId]].vue`)
- Composable: Create `apps/game/composables/usePause.ts` if complex logic
- Tests: Add `apps/game/tests/unit/usePause.spec.ts` and `apps/game/tests/e2e/pause.spec.ts`
- Translations: Add to `apps/game/i18n/locales/de.json` and `en.json`

**New Composable/Helper:**

- Location: `apps/game/composables/useNewFeature.ts`
- Import: Auto-imported by Nuxt convention
- Usage: Available in all components/pages via `useNewFeature()`
- Tests: Add `apps/game/tests/unit/useNewFeature.spec.ts`
- Type safety: Define return types explicitly

**New Utility Function:**

- Shared across app: `apps/game/utils/newUtil.ts`
- Shared across monorepo: `packages/shared/src/newUtil.ts`
- Import: Manual import needed (not auto-imported)
- Constants: Add to `packages/shared/src/constants.ts` if app-wide

**New Game Session Data:**

- IndexedDB schema change: Modify `useIndexedDB.ts` - increment `DB_VERSION`
- Object store creation: Add to `getDB()` upgrade handler
- Type definition: Update `packages/types/src/game.ts` - `GameSession` interface
- Persistence: Ensure mutations call `saveGameSessionToDB()` in store

**New Translation:**

- Files: `apps/game/i18n/locales/de.json` and `en.json`
- Usage: `{{ $t('key.path', 'fallback text') }}` in templates
- Key naming: Use dot notation for hierarchy (e.g., `game.score_updated`)

**New Route:**

- Page file: Create in `apps/game/pages/newPage.vue`
- Route constant: Add to `packages/shared/src/routes.ts` - `ROUTES` object
- Navigation helper: Add method to `useNavigation()` composable
- Typing: Use `getGameRoute()` or `getResultsRoute()` for dynamic routes

## Special Directories

**apps/game/.nuxt/:**

- Purpose: Nuxt build artifacts
- Generated: Yes (auto-generated by Nuxt)
- Committed: No (in .gitignore)
- Contains: Generated types, compiled files

**apps/game/.output/:**

- Purpose: Production build output
- Generated: Yes (by `pnpm run generate`)
- Committed: No (in .gitignore)
- Contains: Static HTML files for deployment

**apps/game/test-results/:**

- Purpose: Playwright E2E test results
- Generated: Yes (by E2E tests)
- Committed: No (in .gitignore)
- Contains: Screenshots, traces, reports

**infrastructure/outputs-bucket/:**

- Purpose: Terraform state outputs storage
- Generated: Yes (by Terraform)
- Committed: No (in .gitignore)
- Contains: Environment-specific infrastructure outputs

**public/data/:**

- Purpose: Static game data served to client
- Generated: Partially (some files generated by scripts)
- Committed: Yes (version controlled)
- Contains: `categories.json` (game categories), `offlineAnswers.json` (answer data)

---

_Structure analysis: 2026-01-31_
