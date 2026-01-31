# External Integrations

**Analysis Date:** 2026-01-31

## APIs & External Services

**Wikipedia Category Data:**

- PetScan API - Wikipedia category term extraction
  - SDK/Client: Direct HTTP fetch
  - URL: Configurable via `PETSCAN_API_URL` environment variable (default: https://petscan.wmflabs.org)
  - Usage: `composables/useAnswerCheck.ts` - 5-minute cache for category terms
  - Caching: Workbox runtime caching strategy (NetworkFirst with 10s timeout)

**Real-time Communication:**

- Socket.IO 4.8.3 - WebSocket/polling for multiplayer features
  - Client: `socket.io-client` 4.8.3
  - Implementation: `composables/useWebSocket.ts`
  - Connection URL: `http://localhost:3000` (dev) or `window.location.origin` (production)
  - Transports: WebSocket and polling fallback
  - Reconnection: Enabled with exponential backoff (1s-5s delay, max 5 attempts)

**Feature Flags:**

- GitLab Feature Flags (Unleash Protocol)
  - Client: `unleash-proxy-client` 3.7.8
  - Configuration: `plugins/gitlab-feature-flags.client.ts`
  - URL: `GITLAB_FEATURE_FLAGS_URL` (format: https://gitlab.com/api/v4/feature_flags/unleash/:project_id)
  - Auth: `GITLAB_FEATURE_FLAGS_TOKEN`
  - Refresh interval: 30 seconds
  - Fallback: Local settings store if not configured
  - Composable: `composables/useFeatureFlags.ts`
  - Tracked flags: `fortune-wheel`, `websocket`

## Data Storage

**Databases:**

- IndexedDB (Client-side, offline-first)
  - Connection: Direct browser IndexedDB API
  - Client: `idb` 8.0.3 (wrapper library)
  - Implementation: `composables/useIndexedDB.ts`
  - Database name: `riddle-rush-db` (version 3)
  - Stores:
    - `gameSession` - Current active game session
    - `gameSessionsById` - Sessions indexed by ID
    - `gameHistory` - Completed sessions (indexed on `startTime`)
    - `statistics` - Aggregated player statistics
    - `leaderboard` - High scores (indexed on `score` and `timestamp`)
    - `settings` - User preferences
  - Purpose: Offline-first data persistence, local game state

**File Storage:**

- Local filesystem only (Static assets via public directory)
  - Public assets: `/public/` directory
  - Game data: `/assets/data/` (JSON files for categories, questions, etc.)
  - Icons/Images: PWA icons (pwa-192x192.png, pwa-512x512.png, etc.)

**Caching:**

- Service Worker + Workbox (via @vite-pwa/nuxt)
  - Purpose: Offline support and performance
  - Strategies:
    - **CacheFirst**: Images, fonts, Google Fonts
    - **NetworkFirst**: Start URL, external APIs (10s timeout)
  - Cache expiration: 30 days for images, 1 year for fonts
  - Max file size for caching: 2MB (5MB in debug builds)

## Authentication & Identity

**Auth Provider:**

- Custom client-side (No central auth)
  - Implementation: Player-based (no user accounts in MVP)
  - Session ID: Auto-generated per game
  - Player identification: Client-side only (no server persistence)

**WebSocket User Identification:**

- Auto-generated anonymous user IDs via Socket.IO
  - Format: `user-` + 7-char random string
  - Implementation: `composables/useWebSocket.ts`
  - Purpose: Multiplayer real-time tracking

## Monitoring & Observability

**Error Tracking:**

- CloudWatch (optional, AWS-native)
  - Endpoint: `CLOUDWATCH_ENDPOINT` environment variable
  - Auth: `CLOUDWATCH_API_KEY`
  - Implementation: `composables/useErrorSync.ts`
  - Sync interval: Periodic (every 30 seconds or on accumulation)
  - Error types captured: Unhandled exceptions, promise rejections, custom errors
  - Debug mode: `DEBUG_ERROR_SYNC` flag

**Logs:**

- Centralized logging composable
  - Implementation: `composables/useLogger.ts`
  - Output: Console (production builds have console statements removed via build step)
  - Logging only in development mode
  - Integration with error sync for CloudWatch

**Analytics:**

- Google Analytics 4 (GA4)
  - ID: `GTAG_ID` (Google Analytics measurement ID)
  - Implementation: `plugins/gtag.client.ts`
  - Activation: Production environment only when GTAG_ID is configured
  - Script: `https://www.googletagmanager.com/gtag/js?id=${gtagId}`
  - Features:
    - Page view tracking (on route changes)
    - Custom event tracking via `composables/useAnalytics.ts`
    - Anonymized IP tracking
    - SameSite=None;Secure cookies
  - Composable: `composables/useAnalytics.ts` for custom events
  - Events: `game_start`, `answer_correct`, `answer_incorrect`, `round_complete`, etc.

## CI/CD & Deployment

**Hosting:**

- AWS (Production)
  - S3 bucket for static site hosting
  - CloudFront CDN for global distribution
  - Configuration via Terraform in `infrastructure/environments/production/`
  - Environment variable: `AWS_S3_BUCKET`

- GitLab Pages (Staging/Dev)
  - Used for staging and development deployments
  - Triggered via GitLab CI/CD pipeline
  - `.gitlab-ci.yml` configuration

**CI Pipeline:**

- GitLab CI/CD
  - Stages: test → quality → build → deploy → verify
  - Change detection: Selective job runs based on file changes
  - Docker image: Custom CI image (`ci-build`) for faster builds
  - Jobs: Unit tests, SonarCloud analysis, builds, deployment, E2E verification
  - Monorepo optimization: Only affected workspaces are tested/built

**Docker:**

- Custom Docker image: `ci-build`
  - Purpose: Pre-installed dependencies for faster CI builds
  - Usage: GitLab CI/CD pipeline
  - Location: Not in source repo (built separately)

- Playwright Docker: `mcr.microsoft.com/playwright:v1.57.0-noble`
  - Purpose: E2E testing in CI
  - Usage: `scripts/e2e-docker.sh`

## Environment Configuration

**Required env vars:**

- `NODE_ENV` - Application environment (development/production)
- `BASE_URL` - Base path for asset loading
- `GOOGLE_ANALYTICS_ID` - GA4 measurement ID (production only)
- `AWS_S3_BUCKET` - S3 bucket name (production deployment)
- `AWS_REGION` - AWS region (default: eu-central-1)
- `AWS_CLOUDFRONT_ID` - CloudFront distribution ID (optional)

**Optional env vars:**

- `CLOUDWATCH_ENDPOINT` - CloudWatch API endpoint
- `CLOUDWATCH_API_KEY` - CloudWatch authentication key
- `DEBUG_ERROR_SYNC` - Enable error sync debugging
- `GITLAB_FEATURE_FLAGS_URL` - GitLab Feature Flags Unleash URL
- `GITLAB_FEATURE_FLAGS_TOKEN` - GitLab Feature Flags auth token
- `PETSCAN_API_URL` - PetScan Wikipedia API URL (default: https://petscan.wmflabs.org)

**Secrets location:**

- GitLab CI/CD variables (protected, masked)
- .env file (local development only, not committed)
- Terraform outputs (for AWS deployment)

## Webhooks & Callbacks

**Incoming:**

- None (Static SPA, no server webhooks)

**Outgoing:**

- None (Client-side only, uses polling/WebSocket for real-time)

---

_Integration audit: 2026-01-31_
