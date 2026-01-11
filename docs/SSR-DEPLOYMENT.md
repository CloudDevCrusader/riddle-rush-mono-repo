# Server-Side Rendering (SSR) with AWS Lambda

This guide covers deploying Riddle Rush with server-side rendering using AWS Lambda.

## Overview

SSR provides:

- ✅ **Better SEO** - Search engines see fully rendered HTML
- ✅ **Faster First Paint** - Initial content renders server-side
- ✅ **Social Sharing** - Rich previews with Open Graph tags
- ✅ **Progressive Enhancement** - Works without JavaScript

## Architecture

```
User Request
    ↓
CloudFront (CDN) → Cache static assets
    ↓
API Gateway HTTP API
    ↓
Lambda Function (Node.js 22.x)
    ↓
Nuxt SSR Rendering
    ↓
HTML + Client Hydration
    ↓
PWA Service Worker
```

## Quick Start

### 1. Build Lambda Package

```bash
# Build Nuxt app with Lambda preset
./scripts/build-lambda.sh

# This creates: apps/game/lambda-deploy.zip
```

### 2. Deploy with Terraform

```bash
cd infrastructure

# Enable SSR in terraform.tfvars
echo 'enable_ssr_lambda = true' >> terraform.tfvars

# Deploy
terraform plan
terraform apply
```

### 3. Get SSR URL

```bash
# Direct Lambda URL (dev/test)
terraform output ssr_lambda_function_url

# API Gateway URL (production)
terraform output ssr_api_gateway_url
```

## Configuration

### Nuxt Config

SSR is enabled in `apps/game/nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  ssr: true,

  nitro: {
    preset: process.env.NITRO_PRESET || 'node-server',
    serveStatic: true,
    compressPublicAssets: true,
  },
})
```

### Build for Lambda

```bash
# Set preset via environment variable
NITRO_PRESET=aws-lambda pnpm run build
```

### Terraform Variables

```hcl
# infrastructure/terraform.tfvars
enable_ssr_lambda = true
ssr_domain_name   = "game.example.com"  # Optional
ssr_certificate_arn = "arn:aws:acm:..."  # Required for custom domain
```

## SSR Best Practices

### 1. Client-Only Components

Wrap browser-specific code:

```vue
<template>
  <ClientOnly>
    <AudioPlayer />
  </ClientOnly>
</template>
```

### 2. Browser API Guards

Always check for `window`:

```typescript
if (typeof window !== 'undefined') {
  localStorage.setItem('key', 'value')
}
```

### 3. Async Data Fetching

Use Nuxt's data fetching composables:

```typescript
// Auto-handles SSR + client hydration
const { data } = await useFetch('/api/data')
```

### 4. Client Plugins

Use `.client.ts` suffix for browser-only plugins:

```
plugins/
  gtag.client.ts        # Only runs on client
  error-sync.client.ts  # Only runs on client
  i18n.ts               # Runs on both
```

## Deployment Options

### Option 1: Lambda Function URL (Simple)

```
https://abc123.lambda-url.eu-central-1.on.aws
```

**Pros:**

- ✅ Simpler setup
- ✅ Lower cost
- ✅ Faster (no API Gateway hop)

**Cons:**

- ❌ No custom domains
- ❌ Limited throttling
- ❌ No WAF integration

**Use for:** Development, staging, internal apps

### Option 2: API Gateway (Production)

```
https://abc123.execute-api.eu-central-1.amazonaws.com
```

**Pros:**

- ✅ Custom domains
- ✅ Advanced throttling
- ✅ WAF integration
- ✅ Better monitoring

**Cons:**

- ❌ Higher cost ($1/million requests)
- ❌ Extra latency (~10ms)

**Use for:** Production with custom domain

### Option 3: CloudFront + Lambda (Recommended)

```
CloudFront → API Gateway → Lambda
```

**Pros:**

- ✅ Global CDN caching
- ✅ DDoS protection
- ✅ Custom SSL certificates
- ✅ Edge locations worldwide

**Implementation:**

```hcl
resource "aws_cloudfront_distribution" "ssr" {
  origin {
    domain_name = trimprefix(module.lambda_ssr.api_gateway_url, "https://")
    origin_id   = "lambda-ssr"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled = true

  default_cache_behavior {
    target_origin_id       = "lambda-ssr"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD", "OPTIONS"]

    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }
}
```

## Performance Optimization

### 1. Lambda Configuration

```hcl
lambda_runtime = "nodejs22.x"  # Latest Node.js
lambda_memory  = 512           # 512MB is sweet spot
lambda_timeout = 10            # 10 seconds max
```

### 2. Cold Start Reduction

```typescript
// Use Lambda provisioned concurrency
resource "aws_lambda_provisioned_concurrency_config" "ssr" {
  function_name                     = aws_lambda_function.ssr.function_name
  provisioned_concurrent_executions = 2
}
```

### 3. Static Asset Optimization

Serve static assets from S3/CloudFront, not Lambda:

```typescript
nitro: {
  serveStatic: false,  // Don't serve from Lambda
}
```

Upload to S3:

```bash
aws s3 sync apps/game/.output/public s3://bucket/_nuxt
```

## Cost Analysis

### Example: 100k monthly visitors

**Assumptions:**

- 500k page views (5 pages/visit)
- 100ms avg Lambda execution
- 512MB memory

**Costs:**

- Lambda: 500k × $0.20/million = **$0.10**
- API Gateway: 500k × $1.00/million = **$0.50**
- Data transfer: 50GB × $0.09/GB = **$4.50**
- **Total: ~$5/month**

**vs Static S3 + CloudFront:**

- S3: $0.023/GB × 50GB = **$1.15**
- CloudFront: $0.085/GB × 50GB = **$4.25**
- **Total: ~$5.40/month**

**Result:** SSR costs about the same as static hosting!

## Monitoring

### CloudWatch Metrics

Automatically tracked:

- Lambda invocations, errors, duration
- API Gateway requests, 4xx/5xx errors, latency
- Memory usage, throttles

### Custom Logs

```typescript
console.log('SSR render complete', {
  route: event.path,
  duration: Date.now() - start,
})
```

View in CloudWatch Logs:

```bash
aws logs tail /aws/lambda/riddle-rush-production-ssr --follow
```

## Troubleshooting

### "Cannot find module" Error

**Cause:** Missing dependency in Lambda package

**Fix:** Ensure all dependencies are in `dependencies`, not `devDependencies`:

```json
{
  "dependencies": {
    "nuxt": "^4.x",
    "@pinia/nuxt": "^x.x"
  }
}
```

### "Task timed out after 10.00 seconds"

**Cause:** SSR rendering too slow

**Fix 1:** Increase timeout:

```hcl
lambda_timeout = 30  # Increase to 30s
```

**Fix 2:** Optimize rendering:

```typescript
// Use lazy components
<LazyHeavyComponent />

// Defer non-critical data
const { data } = await useLazyFetch('/api/data')
```

### "Memory size exceeded"

**Cause:** Lambda out of memory

**Fix:** Increase memory:

```hcl
lambda_memory = 1024  # Increase to 1GB
```

### Cold Start Latency

**Symptom:** First request takes 2-3 seconds

**Fix:** Use provisioned concurrency:

```hcl
provisioned_concurrent_executions = 2  # Keep 2 warm
```

**Cost:** $0.015/hour = ~$22/month per instance

## Hybrid Deployment

Deploy both SSR and static:

```hcl
# SSR for SEO-critical pages
module "lambda_ssr" {
  source = "./modules/lambda-ssr"
  # ...
}

# Static CDN for assets
module "s3_static" {
  source = "./modules/s3-cloudfront"
  # ...
}
```

**Route traffic:**

- `/` → SSR (homepage, SEO important)
- `/game` → Static (interactive, no SEO)
- `/_nuxt/*` → Static S3 (assets)

## Migration from SPA to SSR

### Step 1: Enable SSR

```typescript
// nuxt.config.ts
ssr: true // Change from false
```

### Step 2: Fix Client-Only Code

```bash
# Find browser API usage
grep -r "window\." apps/game/composables
grep -r "localStorage" apps/game/stores

# Wrap with guards
if (typeof window !== 'undefined') { ... }
```

### Step 3: Test Locally

```bash
# Build SSR version
pnpm run build

# Test locally
node apps/game/.output/server/index.mjs
```

### Step 4: Deploy Gradually

```hcl
# Blue-Green deployment
enable_ssr_lambda = true      # New SSR version
active_environment = "blue"   # Keep SPA active

# Test SSR URL
# Switch when ready
active_environment = "green"  # Switch to SSR
```

## Next Steps

- [ ] Set up CloudFront distribution
- [ ] Configure custom domain
- [ ] Enable provisioned concurrency
- [ ] Add CloudWatch alarms
- [ ] Set up CI/CD pipeline
- [ ] Implement edge caching

## References

- [Nuxt SSR Guide](https://nuxt.com/docs/guide/concepts/rendering)
- [Nitro Presets](https://nitro.unjs.io/deploy)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
