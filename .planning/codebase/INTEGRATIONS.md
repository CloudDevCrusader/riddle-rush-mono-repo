# External Integrations

**Analysis Date:** 2026-02-13

## APIs & External Services

**Analytics:**

- Google Analytics 4 (GA4) - Page view and event tracking in production
  - SDK/Client: Custom Nuxt plugin (no external dependency)
  - Config: `apps/game/plugins/gtag.client.ts`
  - Auth: `GTAG_ID` env var (GA4 measurement ID, e.g. `G-XXXXXXXXXX`)
  - Behavior: Only loads in production when `GTAG_ID` is set; tracks route changes via `router.afterEach`

**Feature Flags:**

- GitLab Feature Flags (Unleash Protocol) - Remote feature toggle management
  - SDK/Client: `unleash-proxy-client` ^3.7.8
  - Config: `apps/game/plugins/gitlab-feature-flags.client.ts`
  - Auth: `GITLAB_FEATURE_FLAGS_URL` (Unleash API URL), `GITLAB_FEATURE_FLAGS_TOKEN` (client key)
  - Behavior: Polls every 30 seconds; falls back to local settings store if not configured
  - Composable: `apps/game/composables/useFeatureFlags.ts` - wraps Unleash client with local fallback

**Translation Management:**

- Tolgee - Translation platform for i18n strings
  - SDK/Client: `@tolgee/vue` ^6.2.7 (devDependency)
  - Config: `.tolgeerc.json` (project ID: 27759, parser: vue, languages: de/en)
  - Auth: `VITE_APP_TOLGEE_API_URL`, `VITE_APP_TOLGEE_API_KEY`
  - CLI: Push/pull translations to/from `apps/game/i18n/locales/`

**Error Monitoring:**

- AWS CloudWatch (via custom API Gateway) - Client-side error log sync
  - SDK/Client: Custom fetch-based implementation
  - Config: `apps/game/composables/useErrorSync.ts`, `apps/game/plugins/error-sync.client.ts`
  - Auth: `CLOUDWATCH_ENDPOINT` (API Gateway URL), `CLOUDWATCH_API_KEY` (API key)
  - Behavior: Captures global errors, unhandled rejections, Vue errors, Pinia action errors; periodic batch sync
  - Backend: `infrastructure/cloudwatch-api.tf` - API Gateway REST API + Lambda handler (`infrastructure/lambda/error-logs/index.js`)

- Sentry (optional, not actively implemented) - Error tracking placeholder
  - Auth: `SENTRY_DSN` env var (defined in `.env.example` but not consumed in code)

- SonarCloud - Static code quality analysis
  - Config: `sonar-project.properties`
  - Auth: `SONAR_PROJECT_KEY`, `SONAR_ORGANIZATION` (CI/CD variables)
  - Pipeline: `.gitlab-ci.yml` `sonarcloud-check` job

**Real-time Communication:**

- WebSocket (Socket.IO) - Real-time multiplayer connectivity
  - SDK/Client: `socket.io-client` ^4.8.3
  - Config: `apps/game/composables/useWebSocket.ts`, `apps/game/plugins/websocket.client.ts`
  - Backend: AWS API Gateway WebSocket API + Lambda handlers (`infrastructure/websocket.tf`)
  - Behavior: Auto-connect on app mount (if feature flag enabled), connection monitoring, visibility change handling
  - Feature-gated: Controlled by `websocket` feature flag via `useFeatureFlags()`

**External Data:**

- PetScan (Wikimedia) - External data source
  - Endpoint: `https://petscan.wmflabs.org` (defined in `.env.example`)
  - Auth: None required (public API)

**AI Services (tooling, not game runtime):**

- OpenAI - LLM integration via `@langchain/openai`
  - Auth: `OPENAI_API_KEY`
  - Usage: AI tooling in `tools/langchain/`

- Anthropic - LLM integration
  - SDK/Client: `@anthropic-ai/claude-agent-sdk`
  - Auth: `ANTHROPIC_API_KEY`

- E2B - Code interpreter sandbox
  - SDK/Client: `@e2b/code-interpreter`
  - Auth: `E2B_API_KEY`

- Trigger.dev - Background job processing
  - SDK/Client: `@trigger.dev/sdk` ^4.3.2
  - Config: `trigger.config.ts` (project: `proj_syppnyiedgjpwlyuomro`, dirs: `./src/trigger`)
  - Max duration: 3600s, retries: 3 with exponential backoff

## Data Storage

**Client-Side (Primary):**

- IndexedDB - Main game data persistence (client-only SPA)
  - Client: `idb` ^8.0.3 (IndexedDB promise wrapper)
  - Implementation: `apps/game/composables/useIndexedDB.ts`
  - Database: `riddle-rush-db` (version 3)
  - Stores: `gameSession`, `gameSessionsById`, `gameHistory`, `statistics`, `leaderboard`, `settings`
  - Singleton pattern with cached `dbInstance`

- LocalStorage - Simple key-value persistence
  - Implementation: `apps/game/composables/useLocalStorage.ts`
  - Usage: Color mode preference (`riddle-rush-color-mode`), locale settings

**Server-Side (AWS, Terraform-managed):**

- AWS DynamoDB - NoSQL database for backend data
  - Tables defined in `infrastructure/dynamodb.tf`:
    - `{project}-users-{env}` - User profiles (hash: `userId`, GSIs: Email, CreatedAt, TTL enabled)
    - `{project}-leaderboard-{env}` - Leaderboard scores (hash: `gameMode`, range: `score`, GSIs: UserScores, Timestamp)
    - `{project}-performance-{env}` - Performance metrics (hash: `metricId`, range: `timestamp`, GSIs: UserMetrics, MetricName)
    - `{project}-ws-connections-{env}` - WebSocket connection tracking (hash: `connectionId`, GSI: UserConnections)
  - All tables: PAY_PER_REQUEST billing, DynamoDB Streams enabled, Point-in-Time Recovery, TTL

**File Storage:**

- AWS S3 - Static website hosting and asset storage
  - Config: `infrastructure/main.tf`
  - Buckets: Website bucket (versioned, intelligent tiering), CloudFront logs bucket
  - Transfer Acceleration enabled
  - Public access blocked (CloudFront OAC for access)

**Caching:**

- Redis - Server-side caching (dependency declared)
  - Client: `redis` ^5.10.0 (in `apps/game/package.json`)
  - Usage: Available for server-side caching but primarily a client-side SPA

- Workbox Service Worker - Client-side caching
  - Config: `apps/game/nuxt.config.ts` `pwa.workbox` section
  - Strategies: NetworkFirst (start URL), CacheFirst (images, fonts, Google Fonts)
  - Cache names: `start-url`, `images`, `fonts`, `google-fonts-stylesheets`, `google-fonts-webfonts`

- CloudFront CDN - Edge caching
  - Config: `infrastructure/main.tf` (custom cache policies for static assets vs HTML)
  - Static assets: 1 year TTL with Brotli+Gzip
  - HTML content: 5 min default TTL, 1 hour max
  - Service worker: No cache
  - Lambda@Edge for enhanced cache control headers

## Authentication & Identity

**Auth Provider:**

- None (client-side only) - No server-side authentication implemented
  - Implementation: Game sessions use locally-generated user IDs (`user-` + random string in `useWebSocket.ts`)
  - Data persistence: All game data stored in IndexedDB on the client
  - WebSocket auth: Connection tracked in DynamoDB but no authentication layer

## Monitoring & Observability

**Error Tracking:**

- CloudWatch (custom) - Client error sync via API Gateway
  - API: `infrastructure/cloudwatch-api.tf` (REST API with API key auth)
  - Lambda: `infrastructure/lambda/error-logs/index.js`
  - Dashboard: `{project}-error-logs` CloudWatch dashboard
  - Metrics: API request count, latency, 5XX errors, Lambda processing errors

**Infrastructure Monitoring:**

- CloudWatch Alarms - Automated alerting
  - Config: `infrastructure/monitoring.tf`
  - Alarms: CloudFront 5XX (>10%), 4XX (>20%), total error rate (>1% for 3 min), S3 bucket size (>1GB)
  - Notifications: SNS topic `{project}-cloudfront-alarms`

- CloudWatch Dashboards
  - `{project}-cloudfront-monitoring` - Traffic, error rates, cache hit rate
  - `{project}-error-logs` - API requests, latency, errors

- Route53 Health Check - Endpoint monitoring
  - Config: `infrastructure/monitoring.tf`
  - Type: HTTPS check on CloudFront domain, 30s interval, latency measurement

**Logs:**

- Client: `apps/game/composables/useLogger.ts` (custom composable wrapping console)
- Performance: `apps/game/composables/usePerformance.ts`, `apps/game/plugins/performance.client.ts`
- AWS: CloudWatch Log Groups for Lambda functions (7-30 day retention)

## CI/CD & Deployment

**Hosting (Multi-Platform):**

- Vercel - Primary hosting (GitHub-triggered)
  - Config: `vercel.json`, `.github/workflows/deploy.yml`
  - Preset: `vercel-static` (static site generation)
  - Output: `apps/game/.output/public`
  - Environments: production (main branch), development (development branch), preview (PRs)

- AWS S3 + CloudFront - Secondary hosting (GitLab-triggered)
  - Config: `infrastructure/main.tf`, `.gitlab-ci.yml`
  - Domain: `riddlerush.de` (production), `dev.riddlerush.de` (development)
  - DNS: Route53 (`infrastructure/route53.tf`)
  - WAF: AWS WAFv2 with managed rule sets (Common, KnownBadInputs)
  - SSL: ACM certificate, TLS 1.2+ minimum
  - HTTP/2 and HTTP/3 enabled

- Docker/nginx - Container deployment option
  - Config: `Dockerfile` (multi-stage), `docker-compose.yml`
  - Production: nginx serving static files on port 80
  - Development: Node.js dev server on port 3000

- GitLab Pages - Documentation site
  - Config: `.gitlab-ci.yml` `pages` job
  - URL: `https://djdiox.gitlab.io/riddle-rush-nuxt-pwa`

**CI Pipeline (GitLab CI):**

- Config: `.gitlab-ci.yml`
- Image: Custom CI image (`${CI_REGISTRY_IMAGE}/ci-build:latest`) or `node:20`
- Stages: test -> quality -> build -> deploy -> verify
- Jobs: `test` (unit), `sonarcloud-check`, `test:e2e` (manual), `build`, `build:docs`, `deploy:aws:production` (tags), `deploy:aws:dev`, `pages`, `verify:e2e:aws` (manual)
- E2E image: `mcr.microsoft.com/playwright:v1.57.0-noble`

**CI Pipeline (GitHub Actions):**

- `.github/workflows/deploy.yml` - Deploy to Vercel (quality checks -> build -> deploy -> optional E2E)
- `.github/workflows/tests.yml` - Test runner with flaky test detection (UnfoldCI)
- `.github/workflows/copilot-setup-steps.yml` - GitHub Copilot workspace setup
- `.github/workflows/cleanup-deployments.yml` - Deployment cleanup

**Infrastructure as Code:**

- Terraform >= 1.5.0 - AWS infrastructure provisioning
  - Config: `infrastructure/` directory
  - Provider: AWS ~> 5.0, region: `eu-central-1`
  - State: Local (`terraform.tfstate`), S3 backend available but commented out
  - Modules: `lambda-ssr`, `s3-website`, `cloudfront`, `cloudfront-enhanced`
  - Environments: `infrastructure/environments/{development,staging,production,docs}/`

**Dependency Automation:**

- Renovate - Automated dependency PRs
  - Config: `renovate.json`
  - Schedule: Weekly (Monday before 10am), minor/patch only, majors disabled
  - Groups: Nuxt ecosystem, Vue ecosystem, Testing dependencies
  - Limits: 3 concurrent PRs, 2 per hour

- Changesets - Version management
  - Config: `.changeset/config.json`
  - Scripts: `changeset`, `changeset:version`, `changeset:publish`

## Environment Configuration

**Required env vars (production):**

- `GTAG_ID` - Google Analytics measurement ID
- `AWS_S3_BUCKET` - S3 bucket name for deployment
- `AWS_REGION` - AWS region (default: `eu-central-1`)
- `AWS_CLOUDFRONT_ID` - CloudFront distribution ID
- `CLOUDWATCH_ENDPOINT` - Error logs API endpoint
- `CLOUDWATCH_API_KEY` - Error logs API key

**Optional env vars:**

- `GITLAB_FEATURE_FLAGS_URL` / `GITLAB_FEATURE_FLAGS_TOKEN` - Remote feature flags
- `SENTRY_DSN` - Error tracking (not actively used)
- `VITE_APP_TOLGEE_API_KEY` - Translation management CLI
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `E2B_API_KEY` - AI tooling
- `VERCEL_TOKEN` - Vercel deployment (GitHub Actions secret)

**Secrets location:**

- Local: `.env.local` (gitignored)
- GitLab CI: CI/CD variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SONAR_PROJECT_KEY`, etc.)
- GitHub Actions: Repository secrets (`VERCEL_TOKEN`, `TURBO_TOKEN`, `FLAKY_AUTOPILOT_KEY`)
- AWS: API Gateway API key for CloudWatch error logs (Terraform-managed, sensitive output)

## Webhooks & Callbacks

**Incoming:**

- CloudWatch Error Logs API - POST `{api-gateway-url}/logs`
  - Config: `infrastructure/cloudwatch-api.tf`
  - Auth: API key required
  - Lambda handler: `infrastructure/lambda/error-logs/index.js`

- WebSocket API Gateway - `$connect`, `$disconnect`, `$default` routes
  - Config: `infrastructure/websocket.tf`
  - Lambda handlers: `infrastructure/lambda/websocket/{connect,disconnect,message}/index.js`

**Outgoing:**

- SNS Notifications - CloudWatch alarm notifications
  - Topic: `{project}-cloudfront-alarms`
  - Triggers: 5XX errors, 4XX errors, high error rate, bucket size

- Renovate - Automated PRs for dependency updates
  - Schedule: Weekly Monday mornings

---

_Integration audit: 2026-02-13_
