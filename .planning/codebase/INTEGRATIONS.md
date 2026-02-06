# External Integrations

**Analysis Date:** 2026-02-06

## APIs & External Services

**Wikipedia/PetScan:**

- **Purpose**: Answer validation for game categories
- **Implementation**: Direct fetch to `https://petscan.wmflabs.org/`
- **Client**: Native fetch API in `apps/game/composables/useAnswerCheck.ts`
- **Caching**: 5-minute in-memory cache for category data
- **Auth**: None (public API)
- **Offline Fallback**: Static JSON at `public/data/offlineAnswers.json`

**Google Analytics 4:**

- **Purpose**: User behavior tracking and page analytics
- **Implementation**: Custom plugin at `apps/game/plugins/gtag.client.ts`
- **SDK**: Google Tag Manager script (loaded dynamically)
- **Auth**: `GTAG_ID` environment variable
- **Enabled**: Production only with valid GTAG_ID
- **Privacy**: Anonymized IP, SameSite=None;Secure cookies
- **Route Tracking**: Automatic via router.afterEach hook

**GitLab Feature Flags (Unleash Protocol):**

- **Purpose**: Remote feature flag management
- **Implementation**: Plugin at `apps/game/plugins/gitlab-feature-flags.client.ts`
- **SDK**: `unleash-proxy-client` 3.7.8
- **Auth**:
  - URL: `GITLAB_FEATURE_FLAGS_URL` (format: `https://gitlab.com/api/v4/feature_flags/unleash/:project_id`)
  - Token: `GITLAB_FEATURE_FLAGS_TOKEN`
- **Refresh**: Every 30 seconds
- **Fallback**: Local settings store if not configured
- **Flags**: `fortune-wheel`, `websocket`

## Data Storage

**Databases:**

- **IndexedDB** (Client-side)
  - Database: `riddle-rush-db`
  - Client: `idb` 8.0.3
  - Stores: `gameSession`, `gameHistory`, `statistics`, `leaderboard`, `settings`
  - Managed by: `apps/game/composables/useIndexedDB.ts`

- **IndexedDB** (Error Logs)
  - Database: `ErrorLogs`
  - Purpose: Offline error queue for CloudWatch sync
  - Managed by: `apps/game/composables/useErrorSync.ts`
  - Fallback: localStorage if IndexedDB unavailable

- **DynamoDB** (AWS Infrastructure - defined but not actively used by client)
  - Tables defined in `infrastructure/dynamodb.tf`:
    - `users` (hash: userId)
    - `leaderboard` (hash: gameMode, range: score)
    - `performance_metrics` (hash: metricId, range: timestamp)
    - `websocket_connections` (hash: connectionId)
  - Billing: Pay-per-request
  - Features: Streams enabled, point-in-time recovery, TTL

**File Storage:**

- **Local filesystem only** - Static JSON files at `/data/categories.json`, `/data/offlineAnswers.json`
- **S3** (deployment target, not runtime storage)
  - Bucket: `${project_name}-production-${account_id}`
  - Module: `infrastructure/modules/s3-website`
  - Acceleration: Enabled
  - Versioning: Enabled (30-day retention)

**Caching:**

- Service Worker cache (Workbox)
  - Images: CacheFirst, 30 days, 60 entries
  - Fonts: CacheFirst, 1 year, 10 entries
  - Start URL: NetworkFirst, 3s timeout
  - Google Fonts: CacheFirst with separate stylesheets/webfonts caches
- In-memory cache for PetScan category data (5 minutes)

## Authentication & Identity

**Auth Provider:**

- **None** - No authentication system implemented
- User identification via randomly generated IDs in WebSocket composable
- Format: `user-${Math.random().toString(36).substring(7)}`
- Stored in: `apps/game/composables/useWebSocket.ts`

## Monitoring & Observability

**Error Tracking:**

- **AWS CloudWatch** (via API Gateway + Lambda)
  - Endpoint: `CLOUDWATCH_ENDPOINT` environment variable
  - Auth: `CLOUDWATCH_API_KEY` via X-API-Key header
  - Implementation: `apps/game/composables/useErrorSync.ts`
  - Infrastructure: `infrastructure/cloudwatch-api.tf`
  - Lambda: Node.js 24.x handler for log processing
  - Sync: Every 5 minutes, on visibility change, on online event
  - Offline Queue: IndexedDB with localStorage fallback
  - Enabled: Production only (or `DEBUG_ERROR_SYNC=true`)

**Logs:**

- Development: Console logging via `apps/game/composables/useLogger.ts` (stripped in production)
- Production: CloudWatch via error sync composable
- Infrastructure: CloudWatch Log Groups with 7-30 day retention

**Performance Monitoring:**

- WebSocket-based performance logging (infrastructure defined but client-optional)
- Metrics sent to Socket.IO server: `apps/game/server/plugins/socket.ts`
- Can be forwarded to CloudWatch via Lambda integration

**Dashboards:**

- CloudWatch Dashboard for error logs API
- Terraform-defined: `infrastructure/dashboard.tf`, `infrastructure/cloudwatch-api.tf`

## CI/CD & Deployment

**Hosting:**

- **Production**: AWS S3 + CloudFront
  - Distribution: Enhanced CloudFront with custom domain support
  - Module: `infrastructure/modules/cloudfront-enhanced`
  - Price Class: Configurable (default: all edge locations)
  - SSL: ACM certificate support via `certificate_arn` variable

**CI Pipeline:**

- **GitLab CI/CD**
  - Custom Docker image for builds (40-50% speed improvement)
  - Monorepo change detection (40-60% CI time savings)
  - Stages: test → quality → build → deploy → verify
  - Branches: main (production), staging, development

**Deployment Scripts:**

- `scripts/deploy-prod.sh` - Production deployment
- `scripts/deploy-dev.sh` - Development deployment
- `scripts/aws-deploy.sh` - Direct AWS S3 + CloudFront sync
- `scripts/terraform-apply.sh` - Infrastructure provisioning

**Infrastructure as Code:**

- Terraform for all AWS resources
- Modules: `s3-website`, `cloudfront-enhanced`, `lambda-ssr`
- Environments: `production`, `staging`, `development`, `docs`
- State management: S3 backend with DynamoDB locking (commented in configs)

## Environment Configuration

**Required env vars (Development):**

- `NODE_ENV` - Environment mode (development/production)
- `BASE_URL` - Application base path
- `APP_VERSION` - Version string from package.json

**Required env vars (Production):**

- `GOOGLE_ANALYTICS_ID` / `GTAG_ID` - Analytics tracking ID
- `AWS_ACCESS_KEY_ID` - AWS deployment credentials
- `AWS_SECRET_ACCESS_KEY` - AWS deployment credentials
- `AWS_S3_BUCKET` - Deployment bucket name
- `AWS_CLOUDFRONT_ID` - CloudFront distribution ID for cache invalidation
- `AWS_REGION` - AWS region (default: eu-central-1)

**Optional env vars:**

- `GITLAB_FEATURE_FLAGS_URL` - GitLab feature flags endpoint
- `GITLAB_FEATURE_FLAGS_TOKEN` - GitLab API token
- `CLOUDWATCH_ENDPOINT` - Error logging API endpoint
- `CLOUDWATCH_API_KEY` - CloudWatch API authentication key
- `DEBUG_ERROR_SYNC` - Enable error sync in development
- `CLOUDFRONT_DOMAIN` - Custom CloudFront domain
- `WEBSITE_URL` - Primary website URL
- `CDN_URL` - CDN base URL for assets

**Mobile build env vars:**

- `ANDROID_KEYSTORE_PATH` - Path to Android signing keystore
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEYSTORE_ALIAS` - Key alias
- `ANDROID_KEYSTORE_ALIAS_PASSWORD` - Key password

**Secrets location:**

- `.env` files (not committed)
- GitLab CI/CD variables (for pipeline)
- AWS Secrets Manager (not currently used but infrastructure ready)

## Webhooks & Callbacks

**Incoming:**

- None currently implemented
- Infrastructure ready: API Gateway REST API at `infrastructure/cloudwatch-api.tf`

**Outgoing:**

- CloudWatch error logging via API Gateway POST to `/logs`
- WebSocket messages to server (if WebSocket feature enabled)

## WebSocket Integration (Optional Feature)

**Server:**

- **Socket.IO** server in Nuxt dev mode
- Implementation: `apps/game/server/plugins/socket.ts`
- Transports: WebSocket, polling
- CORS: All origins (development mode)
- Events: `logPerformance`, `updateLeaderboard`, `getUserStats`, `ping`

**AWS WebSocket API (Infrastructure Defined):**

- API Gateway V2 WebSocket API
- Lambda handlers: connect, disconnect, message
- Runtime: Node.js 20.x
- Infrastructure: `infrastructure/websocket.tf`
- Routes: `$connect`, `$disconnect`, `$default`
- Integration: DynamoDB for connection tracking, user data, leaderboard
- Throttling: 5000 burst, 10000 rate limit

**Client:**

- Composable: `apps/game/composables/useWebSocket.ts`
- Connection: localhost:3000 (dev), origin (prod)
- Auto-reconnection with exponential backoff
- Connection monitoring via ping/pong every 30 seconds

## Service Worker (PWA)

**Implementation:**

- Vite PWA plugin with Workbox
- Strategy: `autoUpdate` with skipWaiting
- Max file size: 2MB production, 5MB debug builds
- Runtime caching strategies configured per resource type
- Offline navigation fallback to `/`

**Manifest:**

- Name: "Riddle Rush"
- Display: standalone
- Orientation: portrait
- Theme: #ff6b35
- Icons: 192x192, 512x512, Apple Touch Icon

---

_Integration audit: 2026-02-06_
