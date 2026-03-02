# Architecture

**Analysis Date:** 2026-02-13

## Pattern Overview

**Overall:** Monorepo with a Nuxt 4 SPA as the primary application, shared packages for types/constants/config, and AWS infrastructure-as-code.

**Key Characteristics:**

- Client-only SPA (SSR disabled) — all game logic runs in the browser
- Composable-centric architecture — business logic lives in Vue composables, not services
- IndexedDB for persistence — no backend database; all game state is stored client-side
- Pinia stores as the central state layer — composables read/write through stores
- Shared packages provide types, constants, and routes consumed by the game app
- Infrastructure managed separately via Terraform (AWS S3 + CloudFront)

## Layers

**Presentation Layer (Pages + Components):**

- Purpose: Render UI, handle user interactions, define page routes
- Location: `apps/game/pages/`, `apps/game/components/`
- Contains: Vue SFCs with `<template>`, `<script setup>`, `<style scoped>`
- Depends on: Composables, Stores, Layouts
- Used by: Nuxt router (file-based routing)

**Layout Layer:**

- Purpose: Provide consistent page structure (backgrounds, back buttons, global overlays)
- Location: `apps/game/layouts/`
- Contains: `default.vue` (standard pages), `game.vue` (in-game pages), `menu.vue`
- Depends on: Components (ConnectionStatus, GlobalLoading), Composables (useFeatureFlags)
- Used by: Pages via `definePageMeta({ layout: 'game' })`

**Composables Layer (Business Logic):**

- Purpose: Encapsulate reusable logic, side effects, and API integrations
- Location: `apps/game/composables/`
- Contains: 26 composable files covering navigation, game state, persistence, analytics, audio, form handling, feature flags, WebSocket, etc.
- Depends on: Stores, shared packages (`@riddle-rush/types`, `@riddle-rush/shared`), browser APIs (IndexedDB, localStorage, Web Share, PetScan API)
- Used by: Pages, Components, other Composables

**State Management Layer (Pinia Stores):**

- Purpose: Centralized reactive state for game sessions and settings
- Location: `apps/game/stores/`
- Contains: `game.ts` (game session, players, rounds, history), `settings.ts` (user preferences)
- Depends on: Composables (useIndexedDB, useStatistics, useLogger, useLodash), shared packages
- Used by: Composables, Pages, Components (auto-imported by Nuxt)

**Plugin Layer:**

- Purpose: Initialize client-side services on app startup
- Location: `apps/game/plugins/`
- Contains: 8 client-only plugins (`.client.ts` suffix) for init ordering, error sync, feature flags, analytics, i18n, performance monitoring, storyboard, WebSocket
- Depends on: External SDKs (Unleash, Socket.IO, gtag)
- Used by: Nuxt app lifecycle (auto-loaded)

**Server Layer:**

- Purpose: Nitro server plugins for WebSocket support
- Location: `apps/game/server/plugins/`
- Contains: `socket.ts` — Socket.IO server attached to Nitro
- Depends on: Socket.IO
- Used by: Nitro runtime (when running with SSR/node-server preset)

**Shared Packages Layer:**

- Purpose: Cross-app type safety, constants, routing, and build configuration
- Location: `packages/`
- Contains:
  - `packages/types/` — TypeScript interfaces (`GameSession`, `Player`, `Category`, etc.)
  - `packages/shared/` — Constants (`ALPHABET`, `SCORE_PER_CORRECT_ANSWER`), route definitions (`ROUTES`), utilities
  - `packages/config/` — Shared ESLint, Prettier, and Vite plugin configurations
  - `packages/riddle-cli/` — oclif-based CLI for project management
- Depends on: Nothing (leaf dependencies)
- Used by: `apps/game` via `workspace:*` dependencies

**Service Layer (Legacy/Supplementary):**

- Purpose: Pure business logic classes (static methods, no Vue dependencies)
- Location: `services/`
- Contains: `GameService.ts` (session creation, scoring, validation, fuzzy matching), `StorageService.ts` (localStorage/IndexedDB wrappers)
- Depends on: Game types
- Used by: Potentially consumed by game app, but most logic is duplicated in composables/stores

**Infrastructure Layer:**

- Purpose: AWS infrastructure provisioning (S3, CloudFront, WAF, Route53, DynamoDB, Lambda, IAM)
- Location: `infrastructure/`
- Contains: Terraform `.tf` files, CloudFront functions, Lambda handlers, environment configs
- Depends on: AWS provider
- Used by: CI/CD deployment scripts

## Data Flow

**Game Session Lifecycle:**

1. User navigates to `/players` and enters player names
2. `useGameStore.setupPlayers()` creates a `GameSession` with players, random category (from `/data/categories.json`), and random letter
3. Session is persisted to IndexedDB via `useIndexedDB.saveGameSession()`
4. During gameplay at `/game/[gameId]`, players submit answers — `submitPlayerAnswer()` updates player state
5. Host assigns scores via `assignPlayerScore()` — each mutation triggers IndexedDB save
6. `completeRound()` records round history; `startNextRound()` resets player state and picks new category/letter
7. `completeGame()` marks session as completed, updates statistics
8. Results displayed at `/results/[gameId]` using `leaderboard` getter (sorted by `totalScore`)

**Answer Verification Flow:**

1. `useAnswerCheck.checkAnswer()` receives `searchWord`, `letter`, and `term`
2. Looks up category to determine `searchProvider` ('petscan', 'offline', or 'wikipedia')
3. For 'petscan': fetches from `https://petscan.wmflabs.org/` API (Wikipedia category search)
4. For 'offline': loads `/data/offlineAnswers.json` static file
5. Filters results by starting letter, returns `{ found: boolean, other: string[] }`

**Persistence Strategy:**

1. Game sessions and history → IndexedDB (`riddle-rush-db`, version 3, using `idb` library)
2. User settings (sound, language, debug mode) → localStorage (`game-settings` key)
3. Categories → Fetched from static JSON (`/data/categories.json`), cached in Pinia store
4. No backend database — fully client-side storage

**State Management:**

- Pinia stores (`game`, `settings`) are the single source of truth
- `useGameState()` composable provides computed wrappers for common store getters
- `useGameActions()` composable provides action wrappers with error handling, toast notifications, and audio feedback
- Stores are auto-imported by Nuxt — no explicit import needed in pages/components

## Key Abstractions

**Composables (use\* pattern):**

- Purpose: Encapsulate related logic and expose reactive state/methods
- Examples: `apps/game/composables/useNavigation.ts`, `apps/game/composables/useGameState.ts`, `apps/game/composables/useIndexedDB.ts`
- Pattern: Function that returns reactive refs, computed values, and methods. Named with `use` prefix. Used via Nuxt auto-import.

**Pinia Stores:**

- Purpose: Centralized state with getters and actions
- Examples: `apps/game/stores/game.ts`, `apps/game/stores/settings.ts`
- Pattern: `defineStore('name', { state, getters, actions })` (Options API style). Actions handle async persistence.

**Shared Package Exports:**

- Purpose: Type-safe cross-package contracts
- Examples: `packages/types/src/game.ts` exports `GameSession`, `Player`, `Category`; `packages/shared/src/routes.ts` exports `ROUTES` constant and helper functions
- Pattern: Packages use `exports` field in `package.json` for subpath exports (e.g., `@riddle-rush/shared/constants`)

**Layouts:**

- Purpose: Page structure templates with provide/inject customization
- Examples: `apps/game/layouts/game.vue` provides `setBackground` and `setBackButton` via Vue `provide()`
- Pattern: Layouts provide configuration methods; pages inject and call them

**Client Plugins:**

- Purpose: Initialize services before app renders
- Examples: `apps/game/plugins/00.init-plugin-system.client.ts`, `apps/game/plugins/gtag.client.ts`
- Pattern: `defineNuxtPlugin()` with naming convention — numeric prefix controls load order, `.client.ts` suffix restricts to browser

## Entry Points

**App Entry:**

- Location: `apps/game/app.vue`
- Triggers: Nuxt app initialization
- Responsibilities: Shows splash screen, loads persisted state from IndexedDB and localStorage, sets up online/offline listeners, PWA install prompt handler, debug mode keyboard shortcut (Ctrl+Shift+D)

**Page Router (File-Based):**

- Location: `apps/game/pages/`
- Triggers: URL navigation
- Responsibilities: Each `.vue` file maps to a route:
  - `index.vue` → `/` (main menu)
  - `players.vue` → `/players` (player setup)
  - `round-start.vue` → `/round-start` (round intro)
  - `game/[[gameId]].vue` → `/game/:gameId?` (gameplay)
  - `results/[[gameId]].vue` → `/results/:gameId?` (results/leaderboard)
  - `leaderboard.vue` → `/leaderboard`
  - `settings.vue` → `/settings`
  - `language.vue` → `/language`
  - `credits.vue` → `/credits`

**Nitro Server:**

- Location: `apps/game/server/plugins/socket.ts`
- Triggers: Server startup (when using node-server preset)
- Responsibilities: Initializes Socket.IO server for real-time features (performance logging, leaderboard broadcasts, connection monitoring)

**Build Entry:**

- Location: `apps/game/nuxt.config.ts`
- Triggers: `nuxt build` / `nuxt dev`
- Responsibilities: Configures modules (Pinia, i18n, UnoCSS, PWA, VueUse, etc.), Vite plugins, Nitro preset, security headers, caching strategies

**Infrastructure Entry:**

- Location: `infrastructure/main.tf`
- Triggers: `terraform apply`
- Responsibilities: Provisions AWS S3 bucket, CloudFront distribution (with WAF, Lambda@Edge, cache policies), Route53, DynamoDB, monitoring

## Error Handling

**Strategy:** Graceful degradation with user-facing toast notifications and structured logging

**Patterns:**

- **Try/catch in actions:** All store actions and composable methods wrap async operations in try/catch. Errors are logged via `useLogger()` and user-friendly messages shown via `useToast()`. See `apps/game/composables/useGameActions.ts` for the canonical pattern.
- **Non-blocking persistence:** IndexedDB save failures are logged but never thrown — the game continues even if persistence fails. See `apps/game/stores/game.ts` methods like `saveSessionToDB()`.
- **Fallback chains:** Feature flags fall back from GitLab/Unleash → local settings store → default values. See `apps/game/composables/useFeatureFlags.ts`.
- **Error sync to remote:** `useErrorSync` composable sends errors to a CloudWatch endpoint in production. `useLogger.error()` automatically triggers sync. See `apps/game/composables/useLogger.ts`.
- **Plugin error isolation:** Each plugin is independently loaded; failures in one plugin don't prevent app startup.

## Cross-Cutting Concerns

**Logging:** `useLogger()` composable at `apps/game/composables/useLogger.ts`. Provides `log`, `warn`, `error`, `debug`, `info` methods. Development mode logs to console; production syncs errors to CloudWatch via `useErrorSync`. Use `useLogger()` instead of raw `console.*`.

**Validation:** No centralized validation layer. `useForm()` composable at `apps/game/composables/useForm.ts` handles form-level validation. `GameService.validatePlayerName()` at `services/GameService.ts` provides player name validation. Answer validation uses PetScan API or offline data via `useAnswerCheck()`.

**Authentication:** No authentication — the app is a client-side party game with no user accounts. Player identity is session-scoped via `crypto.randomUUID()`.

**Internationalization:** `@nuxtjs/i18n` module with `vue-i18n`. Two locales: German (`de`, default) and English (`en`). Translation files at `apps/game/translations/locales/`. Strategy: `no_prefix` (no locale in URL). Language preference persisted in settings store.

**Analytics:** Google Analytics 4 via custom `gtag.client.ts` plugin. `useAnalytics()` composable provides `trackEvent()`, `trackPageView()`, and game-specific event helpers. Only active in production when `GTAG_ID` is set.

**Feature Flags:** GitLab Feature Flags via Unleash protocol. `useFeatureFlags()` composable checks remote flags with local settings fallback. Currently gates: fortune wheel and WebSocket features.

**Performance Monitoring:** `usePerformance()` composable and `performance.client.ts` plugin track metrics. WebSocket-based reporting when connected.

**PWA/Offline:** `@vite-pwa/nuxt` module with Workbox. Service worker with CacheFirst strategy for assets/fonts, NetworkFirst for start URL. Full offline gameplay supported via IndexedDB persistence.

---

_Architecture analysis: 2026-02-13_
