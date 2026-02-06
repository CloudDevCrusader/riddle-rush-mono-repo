# Task Breakdown for v1.0.3 Production Deployment

## Overview

This document outlines all tasks required to prepare, test, and deploy version 1.0.3 to production with properly refactored/optimized Terraform infrastructure.

**Version:** 1.0.3  
**Target:** Production deployment  
**Focus:** Testing completeness, Terraform optimization, production readiness

---

## Phase 1: Version & Documentation (High Priority)

### Task 1.1: Update Version Numbers

**Estimated Time:** 5 minutes  
**Dependencies:** None

**Files to update:**

- `apps/game/package.json`: version "1.0.0" → "1.0.3"
- `package.json` (root): update if versioned

**Verification:**

```bash
grep -r "\"version\":" apps/game/package.json
```

**Done when:** All version numbers show 1.0.3

---

### Task 1.2: Create CHANGELOG Entry

**Estimated Time:** 15 minutes  
**Dependencies:** None

**Action:**
Create or update `CHANGELOG.md` with v1.0.3 changes:

- Modal dialog system improvements
- PWA enhancements
- Infrastructure optimizations
- Test coverage improvements

**Template:**

```markdown
## [1.0.3] - 2026-02-06

### Added

- Comprehensive modal dialog system with accessibility
- Enhanced PWA caching strategies
- GSD workflow orchestration system

### Changed

- Upgraded Nuxt from 4.2.2 to 4.3
- Optimized Terraform infrastructure
- Improved test coverage

### Fixed

- Missing i18n translation keys
- TypeScript build configurations
```

**Done when:** CHANGELOG.md updated and committed

---

## Phase 2: Unit Test Coverage (High Priority)

**Current Status:**

- ✅ 19 unit test files exist
- ❌ ~7 composables lack unit tests
- ✅ Tests passing: use-assets, use-local-storage, use-page-swipe, use-form, use-feature-flags, settings-store, use-toast, use-loading, use-logger

**Missing Test Coverage:**

1. `composables/useAnalytics.ts`
2. `composables/useGameSession.ts`
3. `composables/useWebSocket.ts`
4. `composables/useSound.ts`
5. `composables/usePWA.ts`
6. `composables/useI18n.ts`
7. `composables/useRouter.ts`

---

### Task 2.1: Unit Tests for useAnalytics

**Estimated Time:** 30 minutes  
**Dependencies:** None

**File:** `tests/unit/use-analytics.spec.ts`

**Test Cases:**

```typescript
describe('useAnalytics', () => {
  it('should initialize analytics', () => {})
  it('should track page views', () => {})
  it('should track custom events with properties', () => {})
  it('should track game events (start, complete, round)', () => {})
  it('should handle analytics disabled state', () => {})
  it('should sanitize sensitive data from event properties', () => {})
  it('should batch events when offline', () => {})
  it('should flush batched events when online', () => {})
})
```

**Verification:**

```bash
pnpm --filter @riddle-rush/game test:unit use-analytics
```

**Done when:** All tests pass with >80% coverage

---

### Task 2.2: Unit Tests for useGameSession

**Estimated Time:** 45 minutes  
**Dependencies:** None

**File:** `tests/unit/use-game-session.spec.ts`

**Test Cases:**

```typescript
describe('useGameSession', () => {
  it('should create new game session', () => {})
  it('should restore session from IndexedDB', () => {})
  it('should update session state', () => {})
  it('should save session to IndexedDB on changes', () => {})
  it('should handle session expiration', () => {})
  it('should clear session data', () => {})
  it('should manage player list', () => {})
  it('should track round progress', () => {})
  it('should calculate scores correctly', () => {})
  it('should handle concurrent session updates', () => {})
})
```

**Verification:**

```bash
pnpm --filter @riddle-rush/game test:unit use-game-session
```

**Done when:** All tests pass with >85% coverage

---

### Task 2.3: Unit Tests for useWebSocket

**Estimated Time:** 45 minutes  
**Dependencies:** None

**File:** `tests/unit/use-websocket.spec.ts`

**Test Cases:**

```typescript
describe('useWebSocket', () => {
  it('should establish WebSocket connection', () => {})
  it('should handle connection errors', () => {})
  it('should reconnect on disconnect', () => {})
  it('should implement exponential backoff', () => {})
  it('should send messages', () => {})
  it('should receive messages', () => {})
  it('should emit typed events', () => {})
  it('should handle heartbeat/ping-pong', () => {})
  it('should clean up on unmount', () => {})
  it('should queue messages when disconnected', () => {})
  it('should flush message queue on reconnect', () => {})
})
```

**Verification:**

```bash
pnpm --filter @riddle-rush/game test:unit use-websocket
```

**Done when:** All tests pass with >80% coverage

---

### Task 2.4: Unit Tests for useSound

**Estimated Time:** 30 minutes  
**Dependencies:** None

**File:** `tests/unit/use-sound.spec.ts`

**Test Cases:**

```typescript
describe('useSound', () => {
  it('should load sound assets', () => {})
  it('should play sound with volume control', () => {})
  it('should pause/resume sounds', () => {})
  it('should stop all sounds', () => {})
  it('should respect mute setting', () => {})
  it('should handle missing sound files gracefully', () => {})
  it('should manage sound pool for effects', () => {})
  it('should fade in/out sounds', () => {})
})
```

**Verification:**

```bash
pnpm --filter @riddle-rush/game test:unit use-sound
```

**Done when:** All tests pass with >75% coverage

---

### Task 2.5: Unit Tests for usePWA

**Estimated Time:** 30 minutes  
**Dependencies:** None

**File:** `tests/unit/use-pwa.spec.ts`

**Test Cases:**

```typescript
describe('usePWA', () => {
  it('should detect PWA install capability', () => {})
  it('should trigger install prompt', () => {})
  it('should track install events', () => {})
  it('should detect standalone mode', () => {})
  it('should handle service worker updates', () => {})
  it('should prompt user for updates', () => {})
  it('should skip waiting on user confirmation', () => {})
  it('should cache assets for offline use', () => {})
})
```

**Verification:**

```bash
pnpm --filter @riddle-rush/game test:unit use-pwa
```

**Done when:** All tests pass with >75% coverage

---

### Task 2.6: Unit Tests for useI18n

**Estimated Time:** 20 minutes  
**Dependencies:** None

**File:** `tests/unit/use-i18n.spec.ts`

**Test Cases:**

```typescript
describe('useI18n', () => {
  it('should load default locale', () => {})
  it('should switch locales', () => {})
  it('should translate keys', () => {})
  it('should handle missing translations', () => {})
  it('should interpolate variables', () => {})
  it('should pluralize correctly', () => {})
  it('should persist locale preference', () => {})
})
```

**Verification:**

```bash
pnpm --filter @riddle-rush/game test:unit use-i18n
```

**Done when:** All tests pass with >80% coverage

---

### Task 2.7: Unit Tests for useRouter

**Estimated Time:** 20 minutes  
**Dependencies:** None

**File:** `tests/unit/use-router.spec.ts`

**Test Cases:**

```typescript
describe('useRouter', () => {
  it('should navigate to route', () => {})
  it('should navigate with params', () => {})
  it('should navigate with query', () => {})
  it('should handle back navigation', () => {})
  it('should prevent navigation when guard fails', () => {})
  it('should track current route', () => {})
  it('should generate route paths', () => {})
})
```

**Verification:**

```bash
pnpm --filter @riddle-rush/game test:unit use-router
```

**Done when:** All tests pass with >75% coverage

---

### Task 2.8: Run Complete Unit Test Suite

**Estimated Time:** 10 minutes  
**Dependencies:** Tasks 2.1-2.7

**Action:**

```bash
pnpm --filter @riddle-rush/game test:unit
pnpm --filter @riddle-rush/game test:unit:coverage
```

**Success Criteria:**

- ✅ All unit tests pass (100% pass rate)
- ✅ Overall coverage >70%
- ✅ No skipped tests (except feature flags)
- ✅ No console warnings/errors

**Done when:** Coverage report shows improved metrics

---

## Phase 3: Integration & E2E Tests (Medium Priority)

### Task 3.1: Integration Test - WebSocket Flow

**Estimated Time:** 45 minutes  
**Dependencies:** Task 2.3

**File:** `tests/integration/websocket-flow.spec.ts`

**Test Scenarios:**

```typescript
describe('WebSocket Integration', () => {
  it('should connect to game server', async () => {})
  it('should join game room', async () => {})
  it('should receive game state updates', async () => {})
  it('should send player actions', async () => {})
  it('should handle server disconnection gracefully', async () => {})
  it('should reconnect and restore session', async () => {})
})
```

**Verification:**

```bash
pnpm --filter @riddle-rush/game test tests/integration/websocket-flow.spec.ts
```

**Done when:** All integration tests pass

---

### Task 3.2: Integration Test - IndexedDB Persistence

**Estimated Time:** 30 minutes  
**Dependencies:** Task 2.2

**File:** `tests/integration/persistence-flow.spec.ts`

**Test Scenarios:**

```typescript
describe('IndexedDB Persistence', () => {
  it('should save game session to IndexedDB', async () => {})
  it('should restore session after page reload', async () => {})
  it('should handle multiple sessions', async () => {})
  it('should clean up old sessions', async () => {})
  it('should migrate data on schema changes', async () => {})
})
```

**Verification:**

```bash
pnpm --filter @riddle-rush/game test tests/integration/persistence-flow.spec.ts
```

**Done when:** All persistence tests pass

---

### Task 3.3: Run Full E2E Test Suite

**Estimated Time:** 20 minutes  
**Dependencies:** None

**Action:**

```bash
pnpm --filter @riddle-rush/game test:e2e
```

**Verify These Tests Pass:**

- ✅ credits.spec.ts
- ✅ debug-console.spec.ts
- ✅ game-complete-flow.spec.ts
- ✅ language.spec.ts
- ✅ leaderboard.spec.ts
- ✅ offline.spec.ts
- ✅ players.spec.ts
- ✅ results.spec.ts
- ✅ round-start.spec.ts

**Success Criteria:**

- All E2E tests pass in headless mode
- No visual regression detected
- No console errors during test runs

**Done when:** E2E suite completes with 100% pass rate

---

## Phase 4: Terraform Refactoring & Optimization (Medium Priority)

**Current Issues:**

- ❌ Repeated cache policy definitions
- ❌ No variable validation rules
- ❌ Output descriptions missing
- ❌ Module structure could be improved
- ❌ Hardcoded values scattered across files

---

### Task 4.1: Extract CloudFront Cache Policies to Module

**Estimated Time:** 45 minutes  
**Dependencies:** None

**Create:** `infrastructure/modules/cloudfront-cache-policies/`

**Files:**

- `main.tf` - Define reusable cache policies
- `variables.tf` - Configuration options
- `outputs.tf` - Export policy IDs

**Cache Policies to Extract:**

```hcl
# 1. Static Assets Aggressive (1 year)
# 2. HTML Edge Optimized (1 minute)
# 3. Service Worker No Cache (0s)
# 4. Dynamic Content Short Cache (10s)
# 5. API Short Cache (10-60s)
```

**Module Structure:**

```hcl
# infrastructure/modules/cloudfront-cache-policies/main.tf
variable "environment" { type = string }

resource "aws_cloudfront_cache_policy" "static_assets_aggressive" {
  name        = "${var.environment}-static-assets-aggressive"
  default_ttl = 31536000
  # ... rest of config
}

output "static_assets_aggressive_id" {
  value = aws_cloudfront_cache_policy.static_assets_aggressive.id
}
```

**Update References:**

- `infrastructure/modules/cloudfront-enhanced/main.tf`
- `infrastructure/environments/production/main.tf`
- `infrastructure/environments/development/main.tf`

**Verification:**

```bash
cd infrastructure/environments/production
terraform init
terraform validate
terraform plan
```

**Done when:**

- ✅ terraform plan shows no changes (refactor only)
- ✅ All references updated
- ✅ Module properly structured

---

### Task 4.2: Create Common Variables Module

**Estimated Time:** 30 minutes  
**Dependencies:** None

**Create:** `infrastructure/modules/common-variables/`

**Files:**

- `variables.tf` - Common variable definitions with validation
- `outputs.tf` - Pass-through outputs

**Variables to Centralize:**

```hcl
variable "environment" {
  type        = string
  description = "Environment name (development, staging, production)"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "aws_region" {
  type        = string
  description = "AWS region for resources"
  default     = "eu-central-1"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]{1}$", var.aws_region))
    error_message = "Invalid AWS region format."
  }
}

variable "project_name" {
  type        = string
  description = "Project name for resource naming"
  default     = "riddle-rush"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must be lowercase alphanumeric with hyphens."
  }
}

variable "cloudfront_price_class" {
  type        = string
  description = "CloudFront price class for edge locations"
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "Invalid CloudFront price class."
  }
}
```

**Done when:** Module created with validation rules

---

### Task 4.3: Add Variable Validation to Existing Modules

**Estimated Time:** 30 minutes  
**Dependencies:** Task 4.2

**Files to Update:**

- `infrastructure/environments/production/variables.tf`
- `infrastructure/environments/development/variables.tf`
- `infrastructure/modules/s3-website/variables.tf`
- `infrastructure/modules/lambda-ssr/variables.tf`

**Validation Examples:**

```hcl
variable "bucket_name" {
  type        = string
  description = "S3 bucket name"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]$", var.bucket_name))
    error_message = "Bucket name must be lowercase alphanumeric with hyphens."
  }

  validation {
    condition     = length(var.bucket_name) >= 3 && length(var.bucket_name) <= 63
    error_message = "Bucket name must be between 3 and 63 characters."
  }
}

variable "domain_name" {
  type        = string
  description = "Custom domain name"
  default     = ""

  validation {
    condition     = var.domain_name == "" || can(regex("^[a-z0-9][a-z0-9-\\.]*[a-z0-9]$", var.domain_name))
    error_message = "Invalid domain name format."
  }
}

variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN"
  default     = ""

  validation {
    condition     = var.certificate_arn == "" || can(regex("^arn:aws:acm:", var.certificate_arn))
    error_message = "Invalid ACM certificate ARN format."
  }
}
```

**Verification:**

```bash
cd infrastructure/environments/production
terraform validate
```

**Done when:** All variables have validation rules

---

### Task 4.4: Optimize S3 Bucket Module with Lifecycle Rules

**Estimated Time:** 30 minutes  
**Dependencies:** None

**File:** `infrastructure/modules/s3-website/main.tf`

**Add Lifecycle Rules:**

```hcl
resource "aws_s3_bucket_lifecycle_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_expiration_days
    }
  }

  rule {
    id     = "cleanup-incomplete-uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  rule {
    id     = "transition-old-versions"
    status = "Enabled"

    noncurrent_version_transition {
      noncurrent_days = 90
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_transition {
      noncurrent_days = 180
      storage_class   = "GLACIER"
    }
  }
}
```

**Add Intelligence Tiering:**

```hcl
resource "aws_s3_bucket_intelligent_tiering_configuration" "website" {
  count  = var.enable_intelligent_tiering ? 1 : 0
  bucket = aws_s3_bucket.website.id
  name   = "EntireBucket"

  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }

  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180
  }
}
```

**Verification:**

```bash
cd infrastructure/environments/production
terraform plan | grep lifecycle
```

**Done when:** Lifecycle rules configured and tested

---

### Task 4.5: Organize and Document Outputs

**Estimated Time:** 20 minutes  
**Dependencies:** None

**Files to Update:**

- `infrastructure/environments/production/outputs.tf`
- `infrastructure/modules/cloudfront-enhanced/outputs.tf`
- `infrastructure/modules/s3-website/outputs.tf`

**Improvements:**

```hcl
# Group outputs logically
# S3 Outputs
output "bucket_name" {
  description = "Name of the S3 bucket hosting the website"
  value       = module.s3_website.bucket_id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = module.s3_website.bucket_arn
}

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution (used for invalidation)"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution (CNAME target)"
  value       = module.cloudfront.distribution_domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "Route53 hosted zone ID for CloudFront (for alias records)"
  value       = module.cloudfront.distribution_hosted_zone_id
}

# URLs
output "website_url" {
  description = "Full URL to access the website"
  value       = "https://${module.cloudfront.distribution_domain_name}"
}
```

**Add Sensitive Flags:**

```hcl
output "api_key" {
  description = "API key for backend access"
  value       = var.api_key
  sensitive   = true
}
```

**Verification:**

```bash
cd infrastructure/environments/production
terraform output
```

**Done when:** All outputs have descriptions and are organized

---

### Task 4.6: Add Comments and Documentation

**Estimated Time:** 20 minutes  
**Dependencies:** Tasks 4.1-4.5

**Files to Document:**

- `infrastructure/environments/production/main.tf`
- `infrastructure/modules/cloudfront-enhanced/main.tf`
- `infrastructure/modules/s3-website/main.tf`

**Documentation Standards:**

```hcl
# ==============================================================================
# CloudFront Distribution - Production Environment
# ==============================================================================
# Purpose: Global CDN for static assets with edge caching
# Features:
#   - HTTP/3 support for improved performance
#   - Origin Shield for better cache hit ratio
#   - Custom cache policies for optimal TTLs
#   - TLS 1.2+ for security
# ==============================================================================

module "cloudfront" {
  source = "../../modules/cloudfront-enhanced"

  # S3 Origin Configuration
  bucket_regional_domain_name = module.s3_website.bucket_regional_domain_name
  bucket_arn                  = module.s3_website.bucket_arn

  # Environment & Custom Domain
  environment     = "production"
  domain_names    = var.domain_names
  certificate_arn = var.certificate_arn

  # Performance Optimization
  price_class = var.cloudfront_price_class # Default: PriceClass_100 (US, EU)
}
```

**Done when:** All major resources have clear comments

---

### Task 4.7: Terraform Validation & Planning

**Estimated Time:** 15 minutes  
**Dependencies:** Tasks 4.1-4.6

**Commands:**

```bash
cd infrastructure/environments/production

# Format code
terraform fmt -recursive

# Initialize with latest providers
terraform init -upgrade

# Validate configuration
terraform validate

# Run plan and save to file
terraform plan -out=tfplan-v1.0.3

# Review plan output
terraform show tfplan-v1.0.3
```

**Review Checklist:**

- [ ] No unexpected resource deletions
- [ ] No unexpected resource recreations
- [ ] Only expected attribute changes
- [ ] No hardcoded sensitive values
- [ ] All variables properly referenced

**Done when:**

- ✅ terraform validate passes
- ✅ terraform plan completes successfully
- ✅ Plan review shows only intended changes

---

## Phase 5: Production Build & Deployment (High Priority)

### Task 5.1: Build Production Bundle

**Estimated Time:** 10 minutes  
**Dependencies:** Tasks 2.8, 3.3

**Commands:**

```bash
cd apps/game

# Clean previous builds
pnpm run clean

# Build production bundle
pnpm run build

# Verify build output
ls -lh .output/public/
```

**Success Criteria:**

- ✅ Build completes without errors
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Bundle size <5MB total
- ✅ Critical CSS inlined
- ✅ Assets properly hashed

**Verification:**

```bash
# Check bundle size
du -sh .output/public/

# Check for source maps (should not exist in prod)
find .output/public/ -name "*.map"

# Verify index.html exists
cat .output/public/index.html | head -20
```

**Done when:** Production bundle ready in `.output/public/`

---

### Task 5.2: Apply Terraform Changes

**Estimated Time:** 10 minutes  
**Dependencies:** Task 4.7

**Commands:**

```bash
cd infrastructure/environments/production

# Apply the saved plan
terraform apply tfplan-v1.0.3

# Verify outputs
terraform output
```

**Monitor:**

- CloudFront distribution status
- S3 bucket creation/updates
- IAM policy attachments

**Success Criteria:**

- ✅ terraform apply completes successfully
- ✅ All outputs are correct
- ✅ No errors or warnings

**Done when:** Infrastructure updated in AWS

---

### Task 5.3: Deploy to S3 + Invalidate CloudFront

**Estimated Time:** 10 minutes  
**Dependencies:** Tasks 5.1, 5.2

**Commands:**

```bash
cd apps/game

# Get bucket name and distribution ID from Terraform
BUCKET_NAME=$(cd ../../infrastructure/environments/production && terraform output -raw bucket_name)
DISTRIBUTION_ID=$(cd ../../infrastructure/environments/production && terraform output -raw cloudfront_distribution_id)

# Sync files to S3
aws s3 sync .output/public/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --exclude "sw.js" \
  --exclude "workbox-*.js"

# Upload HTML files with short cache
aws s3 sync .output/public/ s3://$BUCKET_NAME/ \
  --cache-control "public, max-age=60" \
  --exclude "*" \
  --include "*.html"

# Upload service worker with no cache
aws s3 cp .output/public/sw.js s3://$BUCKET_NAME/sw.js \
  --cache-control "public, max-age=0, must-revalidate"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

**Success Criteria:**

- ✅ All files uploaded to S3
- ✅ Cache headers set correctly
- ✅ CloudFront invalidation created
- ✅ No 403/404 errors

**Done when:** Files deployed and CloudFront cache invalidated

---

### Task 5.4: Run Production Smoke Tests

**Estimated Time:** 15 minutes  
**Dependencies:** Task 5.3

**Get Production URL:**

```bash
cd infrastructure/environments/production
PROD_URL=$(terraform output -raw cloudfront_domain_name)
echo "Production URL: https://$PROD_URL"
```

**Manual Checks:**

1. **Homepage loads:** `https://$PROD_URL`
2. **PWA installable:** Check install prompt
3. **Service worker registered:** DevTools > Application > Service Workers
4. **Assets load from CDN:** Check Network tab, verify CloudFront headers
5. **All routes work:** Test navigation
6. **Game flow works:** Start game, play round, see results
7. **Mobile responsive:** Test on mobile device
8. **Offline mode:** Disable network, reload page
9. **i18n works:** Switch languages
10. **No console errors:** Check browser console

**Automated Checks:**

```bash
# Test homepage
curl -I https://$PROD_URL | grep "200 OK"

# Test service worker
curl -I https://$PROD_URL/sw.js | grep "200 OK"

# Test assets
curl -I https://$PROD_URL/_nuxt/entry.js | grep "200 OK"

# Check CloudFront headers
curl -I https://$PROD_URL | grep "x-amz-cf-id"

# Test HTTPS redirect
curl -I http://$PROD_URL | grep "301"
```

**Success Criteria:**

- ✅ All pages load successfully
- ✅ No 404 errors
- ✅ No console errors
- ✅ PWA features work
- ✅ Game functionality intact

**Done when:** All smoke tests pass

---

### Task 5.5: Performance Verification

**Estimated Time:** 10 minutes  
**Dependencies:** Task 5.4

**Tools:**

- Lighthouse CI
- WebPageTest
- Chrome DevTools

**Commands:**

```bash
cd apps/game

# Run Lighthouse
npx lighthouse https://$PROD_URL \
  --output html \
  --output-path ./lighthouse-report.html \
  --chrome-flags="--headless"

# Open report
open lighthouse-report.html
```

**Target Metrics:**

- **Performance:** >90
- **Accessibility:** >90
- **Best Practices:** >90
- **SEO:** >85
- **PWA:** ✅ Installable

**Network Performance:**

- **TTFB:** <200ms (CloudFront)
- **FCP:** <1.5s
- **LCP:** <2.5s
- **TTI:** <3.5s

**Done when:** Performance meets targets

---

## Phase 6: Tagging & Release (High Priority)

### Task 6.1: Create Git Tag

**Estimated Time:** 5 minutes  
**Dependencies:** Tasks 5.4, 5.5

**Commands:**

```bash
# Ensure we're on main branch
git checkout main
git pull origin main

# Create annotated tag
git tag -a v1.0.3 -m "Release v1.0.3

- Modal dialog system with accessibility
- Enhanced PWA caching strategies
- Terraform infrastructure optimizations
- Improved test coverage (unit + integration)
- Production deployment with CloudFront edge optimization

Lighthouse Score: Performance 95+, Accessibility 95+
Test Coverage: Unit 75%+, E2E 100% pass rate"

# Push tag to remote
git push origin v1.0.3

# Verify tag
git tag -l -n9 v1.0.3
```

**Done when:** Tag v1.0.3 created and pushed

---

### Task 6.2: Create GitHub Release

**Estimated Time:** 10 minutes  
**Dependencies:** Task 6.1

**Action:**

1. Go to GitHub: https://github.com/CloudDevCrusader/riddle-rush-mono-repo/releases/new
2. Select tag: v1.0.3
3. Title: "Release v1.0.3 - Production Ready"
4. Description:

```markdown
## 🎉 Riddle Rush v1.0.3

**Production deployment with enhanced infrastructure and testing.**

### ✨ Features

- Comprehensive modal dialog system with ARIA compliance
- Enhanced PWA caching strategies for offline performance
- GSD workflow orchestration for development efficiency

### 🏗️ Infrastructure

- Optimized Terraform modules with reusable cache policies
- CloudFront edge optimization with Origin Shield
- S3 lifecycle rules for cost optimization
- Comprehensive variable validation

### 🧪 Testing

- Added 7 new unit test suites (useAnalytics, useGameSession, useWebSocket, etc.)
- Integration tests for WebSocket and IndexedDB flows
- 100% E2E test pass rate
- Unit test coverage >75%

### 📦 Bundle Optimization

- Total bundle size: ~4.2MB (gzipped)
- Critical CSS inlined
- Service worker for offline support
- Aggressive asset caching (1 year TTL)

### 📊 Performance

- Lighthouse Performance: 95+
- Lighthouse Accessibility: 95+
- TTFB: <200ms (CloudFront)
- LCP: <2.5s

### 🔧 Changed

- Upgraded Nuxt from 4.2.2 to 4.3
- Improved TypeScript configuration
- Enhanced i18n setup

### 🐛 Fixed

- Missing translation keys
- TypeScript build configurations
- Modal dialog focus trapping

### 📚 Documentation

- Comprehensive TASKS_V1.0.3.md
- Updated agent workflow guidelines
- Terraform module documentation

---

**Deployment URL:** https://<distribution-domain>.cloudfront.net
**CDN:** CloudFront with PriceClass_100 (US, EU)
```

5. Upload `lighthouse-report.html` as asset
6. Publish release

**Done when:** GitHub release published

---

### Task 6.3: Update Project Documentation

**Estimated Time:** 15 minutes  
**Dependencies:** Task 6.2

**Files to Update:**

1. **README.md** - Update version badge

```markdown
![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)
```

2. **docs/DEPLOYMENT.md** - Add v1.0.3 deployment notes

```markdown
## v1.0.3 Deployment (2026-02-06)

- Infrastructure: Terraform with CloudFront + S3
- CDN: CloudFront PriceClass_100
- Region: eu-central-1
- Performance: Lighthouse 95+
```

3. **apps/game/README.md** - Update features list

**Commit Changes:**

```bash
git add README.md docs/DEPLOYMENT.md apps/game/README.md
git commit -m "docs: update documentation for v1.0.3 release"
git push origin main
```

**Done when:** Documentation updated and committed

---

## Phase 7: Monitoring & Validation (Post-Deployment)

### Task 7.1: Set Up CloudWatch Alarms

**Estimated Time:** 20 minutes  
**Dependencies:** Task 5.2

**Alarms to Create:**

```hcl
# infrastructure/environments/production/monitoring.tf

resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "production-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "4xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = 5
  alarm_description   = "Alert when 4xx error rate exceeds 5%"

  dimensions = {
    DistributionId = module.cloudfront.distribution_id
  }
}

resource "aws_cloudwatch_metric_alarm" "high_latency" {
  alarm_name          = "production-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "OriginLatency"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = 1000 # 1 second
  alarm_description   = "Alert when origin latency exceeds 1s"

  dimensions = {
    DistributionId = module.cloudfront.distribution_id
  }
}
```

**Apply:**

```bash
cd infrastructure/environments/production
terraform apply -target=aws_cloudwatch_metric_alarm.high_error_rate
terraform apply -target=aws_cloudwatch_metric_alarm.high_latency
```

**Done when:** CloudWatch alarms configured

---

### Task 7.2: Monitor First 24 Hours

**Estimated Time:** 5 minutes (periodic checks)  
**Dependencies:** Task 7.1

**Metrics to Watch:**

- CloudFront cache hit ratio (target: >85%)
- 4xx error rate (target: <1%)
- 5xx error rate (target: <0.1%)
- Origin latency (target: <500ms)
- Requests per minute

**Tools:**

- AWS CloudWatch Dashboard
- CloudFront Real-Time Logs
- Browser Analytics (if configured)

**Check Every:**

- 1 hour for first 6 hours
- 3 hours for next 18 hours

**Done when:** 24 hours of stable operation

---

## Summary Checklist

### Pre-Deployment ✅

- [ ] Task 1.1: Version updated to 1.0.3
- [ ] Task 1.2: CHANGELOG.md created
- [ ] Task 2.1-2.7: Unit tests for all composables
- [ ] Task 2.8: Full unit test suite passes
- [ ] Task 3.1-3.2: Integration tests pass
- [ ] Task 3.3: E2E tests pass (100%)
- [ ] Task 4.1-4.6: Terraform refactored
- [ ] Task 4.7: Terraform validated and planned

### Deployment ✅

- [ ] Task 5.1: Production bundle built
- [ ] Task 5.2: Terraform changes applied
- [ ] Task 5.3: Files deployed to S3 + CloudFront
- [ ] Task 5.4: Smoke tests pass
- [ ] Task 5.5: Performance verified (Lighthouse 90+)

### Post-Deployment ✅

- [ ] Task 6.1: Git tag v1.0.3 created
- [ ] Task 6.2: GitHub release published
- [ ] Task 6.3: Documentation updated
- [ ] Task 7.1: CloudWatch alarms configured
- [ ] Task 7.2: 24-hour monitoring complete

---

## Rollback Plan

If critical issues are discovered:

### Immediate Rollback (< 5 minutes)

```bash
# Revert to previous CloudFront distribution
cd infrastructure/environments/production
git checkout HEAD~1
terraform apply -auto-approve

# Or simply promote old S3 version
aws s3 sync s3://$BUCKET_NAME/.versions/v1.0.2/ s3://$BUCKET_NAME/
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

### Rollback Git Tag

```bash
git tag -d v1.0.3
git push origin :refs/tags/v1.0.3
```

---

## Success Criteria

**Version 1.0.3 is successfully deployed when:**

1. ✅ All unit tests pass (>75% coverage)
2. ✅ All integration tests pass
3. ✅ All E2E tests pass (100% pass rate)
4. ✅ Terraform infrastructure optimized and deployed
5. ✅ Production bundle deployed to CloudFront
6. ✅ Lighthouse score >90 (all categories)
7. ✅ No console errors in production
8. ✅ PWA features working (offline, install)
9. ✅ Git tag v1.0.3 created and pushed
10. ✅ GitHub release published
11. ✅ CloudWatch alarms configured
12. ✅ 24-hour monitoring shows stability

---

**Estimated Total Time:** ~10-12 hours of focused work
**Priority Order:** Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
