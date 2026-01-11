# AWS CloudFront CDN Optimization Guide

This guide covers CloudFront CDN configuration, caching strategies, and cost optimization for the Riddle Rush PWA deployed on AWS.

## Table of Contents

1. [Current Infrastructure](#current-infrastructure)
2. [Caching Strategies](#caching-strategies)
3. [Cost Optimization](#cost-optimization)
4. [Performance Tuning](#performance-tuning)
5. [Monitoring & Metrics](#monitoring--metrics)
6. [Troubleshooting](#troubleshooting)

---

## Current Infrastructure

### Architecture Overview

```
User Request
    ↓
CloudFront Edge Location (Global)
    ↓
Origin Shield (us-east-1) [Enhanced module only]
    ↓
S3 Bucket (eu-central-1 or configured region)
    ↓
Static PWA Assets
```

### Deployed Modules

**1. Basic CloudFront Module** (`infrastructure/modules/cloudfront/`)

- Standard caching (1 hour default)
- HTTP/2 and HTTP/3 support
- Basic compression (gzip)
- TLS 1.2+

**2. Enhanced CloudFront Module** (`infrastructure/modules/cloudfront-enhanced/`)

- Aggressive caching (1 year for static assets)
- Origin Shield enabled
- Brotli + gzip compression
- TLS 1.3
- Custom cache policies

### Current Configuration

**Production Environment:**

```hcl
# infrastructure/environments/production/main.tf
module "cloudfront" {
  source = "../../modules/cloudfront-enhanced"

  bucket_regional_domain_name = module.s3_website.bucket_regional_domain_name
  bucket_arn                  = module.s3_website.bucket_arn
  environment                 = "production"
  price_class                 = "PriceClass_100"  # US, Canada, Europe
  domain_name                 = var.domain_name
  certificate_arn             = var.certificate_arn
}
```

---

## Caching Strategies

### Overview of Cache Behaviors

CloudFront uses ordered cache behaviors to apply different caching rules based on URL patterns.

### 1. Static Assets (Versioned) - Immutable Cache

**Pattern:** `/_nuxt/*` (Nuxt build output with content hashes)

**Current Configuration:**

```hcl
# Enhanced module already implements this
resource "aws_cloudfront_cache_policy" "static_assets_aggressive" {
  name        = "${var.environment}-static-assets-aggressive"
  default_ttl = 31536000 # 1 year
  max_ttl     = 31536000 # 1 year
  min_ttl     = 1

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}
```

**Why this works:**

- Nuxt generates files like `entry.DssQRSOR.js` with content hashes
- Hash changes when content changes → new filename → no cache issues
- Can safely cache for 1 year (or forever)

**Cost Impact:**

- **Before:** 1,000,000 requests/month → CloudFront requests S3 every hour
- **After:** 1,000,000 requests/month → CloudFront requests S3 once, caches for 1 year
- **Savings:** ~99% reduction in S3 GET requests

### 2. HTML Files - Short TTL with Edge Caching

**Pattern:** `*.html`

**Recommended Configuration:**

```hcl
resource "aws_cloudfront_cache_policy" "html_edge_optimized" {
  name        = "${var.environment}-html-edge-optimized"
  default_ttl = 60   # 1 minute at edge (already in enhanced module)
  max_ttl     = 300  # 5 minutes
  min_ttl     = 0
}
```

**Rationale:**

- HTML may contain dynamic metadata or version markers
- 1-minute edge cache still reduces origin requests by 98%
- Users get updates within 1-5 minutes (acceptable for PWA)

**Alternative for Truly Dynamic HTML:**

```hcl
# If you need immediate updates
default_ttl = 10  # 10 seconds
max_ttl     = 60  # 1 minute
```

### 3. Service Worker - No Cache

**Pattern:** `sw.js`, `workbox-*.js`

```hcl
ordered_cache_behavior {
  path_pattern           = "sw.js"
  # ...
  min_ttl     = 0
  default_ttl = 0
  max_ttl     = 60  # Max 1 minute
}
```

**Critical:** Service workers **must** update immediately to:

- Trigger PWA updates
- Modify caching strategies
- Update precache manifest

**Cost Trade-off:**

- More frequent S3 requests for SW files
- Acceptable because SW files are small (<50KB total)

### 4. Data Files (JSON) - Medium Cache

**Pattern:** `data/*`

```hcl
ordered_cache_behavior {
  path_pattern           = "data/*"
  # ...
  default_ttl = 300  # 5 minutes (enhanced module)
  max_ttl     = 1800 # 30 minutes
}
```

**Use Case:**

- Game categories, terms, translations
- Data changes infrequently
- 5-minute cache balances freshness and performance

### 5. Images - Aggressive Cache

**Pattern:** `*.png`, `*.jpg`, `*.webp`, `*.svg`

```hcl
# In default cache behavior (catch-all)
default_cache_behavior {
  # ...
  min_ttl     = 0
  default_ttl = 31536000  # 1 year
  max_ttl     = 31536000
}
```

**Why:**

- Images rarely change
- Even if filename doesn't have hash, visual changes are acceptable after cache expiry
- Huge bandwidth savings

---

## Cost Optimization

### Understanding CloudFront Pricing

**Three cost components:**

1. **Data transfer out** (largest cost)
2. **HTTP/HTTPS requests**
3. **Invalidation requests** (first 1,000/month free)

### Current Cost Baseline (Estimated)

**Assumptions:**

- 100,000 monthly active users
- 5 page views per user
- 2MB average page size (unoptimized)

**Monthly Costs (Before Optimization):**

```
Data Transfer: 500,000 page views × 2MB = 1,000GB
  → $85/month (at $0.085/GB for first 10TB)

Requests: 500,000 × 20 requests/page = 10M requests
  → $10/month (at $0.0100 per 10,000 requests)

Total: ~$95/month
```

### Optimized Cost Projection

**After implementing optimizations:**

```
Data Transfer: 500,000 × 0.6MB (WebP + cache) = 300GB
  → $26/month (70% reduction!)

Requests to CloudFront: Same (10M requests)
  → $10/month

Requests to S3 (origin): 1M → 100K (90% cache hit rate)
  → Negligible (<$1/month)

Total: ~$36/month (62% savings!)
```

### Cost Optimization Strategies

#### 1. Maximize Cache Hit Rate

**Goal:** >90% cache hit rate

**Actions:**

- [x] Use enhanced CloudFront module (already done)
- [x] Enable Origin Shield (already done in enhanced)
- [ ] Set appropriate TTLs for each asset type
- [ ] Avoid query string variations (unless necessary)
- [ ] Use consistent URL patterns

**Monitor:**

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name CacheHitRate \
  --dimensions Name=DistributionId,Value=YOUR_DIST_ID \
  --start-time 2026-01-01T00:00:00Z \
  --end-time 2026-01-11T23:59:59Z \
  --period 86400 \
  --statistics Average
```

**Target:** Average >90%

#### 2. Use Origin Shield

**Already enabled in enhanced module:**

```hcl
origin_shield {
  enabled              = true
  origin_shield_region = "us-east-1"  # Closest to most edge locations
}
```

**Benefits:**

- Consolidates requests from all edge locations
- Reduces S3 GET requests by 50-70%
- **Cost:** $0.01 per 10,000 requests (pays for itself with S3 savings)

**When to use:**

- High traffic (>1M requests/month): Always
- Low traffic (<100K requests/month): Optional

#### 3. Optimize Data Transfer with Compression

**Brotli compression** (enhanced module):

```hcl
parameters_in_cache_key_and_forwarded_to_origin {
  enable_accept_encoding_brotli = true
  enable_accept_encoding_gzip   = true
}
```

**Compression Ratios:**

- Brotli: 20-30% better than gzip
- Text assets (JS/CSS/HTML): 70-80% size reduction
- Already compressed images (WebP): No additional benefit

**Savings Example:**

- 100KB JS file → 20KB (gzip) → 17KB (brotli)
- 1M downloads × (100KB - 17KB) = 83GB saved
- 83GB × $0.085 = **$7/month saved** from one file!

#### 4. Use Price Class PriceClass_100

**Current configuration:**

```hcl
price_class = "PriceClass_100"  # US, Canada, Europe
```

**Price Classes:**

- `PriceClass_All`: All edge locations (most expensive)
- `PriceClass_200`: US, Europe, Asia, Middle East
- `PriceClass_100`: US, Canada, Europe (cheapest)

**Trade-off:**

- PriceClass_100: Lower cost, higher latency for Asia/Australia users
- For game targeting EU/US audience: PriceClass_100 is optimal

**Savings:** ~40% compared to PriceClass_All

#### 5. Minimize Cache Invalidations

**Cost:**

- First 1,000 invalidation paths/month: Free
- After 1,000: $0.005 per path

**Best Practices:**

**❌ DON'T: Invalidate everything on every deploy**

```bash
aws cloudfront create-invalidation \
  --distribution-id E123 \
  --paths "/*"  # Counts as 1 invalidation, but not recommended
```

**✅ DO: Use versioned filenames (no invalidation needed)**

```bash
# Nuxt automatically generates:
# _nuxt/entry.DssQRSOR.js
# When content changes:
# _nuxt/entry.NEW_HASH.js

# No invalidation needed! Old cached files are irrelevant.
```

**✅ DO: Invalidate only what's necessary**

```bash
aws cloudfront create-invalidation \
  --distribution-id E123 \
  --paths "/index.html" "/sw.js"  # Only entry points
```

**Strategy:**

1. Use versioned assets (automatically handled by Nuxt)
2. Only invalidate HTML entry points and service worker
3. Set short TTL for files that can't be versioned

---

## Performance Tuning

### 1. Origin Shield Placement

**Current:** `us-east-1` (enhanced module)

**Best region selection:**

```
User Distribution → Best Origin Shield Region

- Primarily US East: us-east-1 (current)
- Primarily Europe: eu-central-1 or eu-west-1
- Global (balanced): us-east-1 (most central)
- Primarily Asia: ap-southeast-1
```

**Change if needed:**

```hcl
origin_shield {
  enabled              = true
  origin_shield_region = "eu-central-1"  # Match S3 bucket region
}
```

### 2. HTTP/3 and QUIC

**Already enabled:**

```hcl
http_version = "http2and3"
```

**Benefits:**

- Faster connection establishment
- Better performance on unstable networks
- 0-RTT resumption for repeat visitors

**Note:** HTTP/3 is automatically used when browser supports it.

### 3. TLS 1.3 for Custom Domains

**Enhanced module uses TLS 1.3:**

```hcl
minimum_protocol_version = "TLSv1.3_2021"
```

**Benefits:**

- 1-RTT handshake (vs 2-RTT in TLS 1.2)
- ~200ms faster initial connection
- Better security

**Compatibility:**

- Supported by all modern browsers (2020+)
- Falls back to TLS 1.2 if needed

### 4. Lambda@Edge for Response Headers

**Add performance headers dynamically:**

```javascript
// infrastructure/lambda/response-headers/index.mjs
export const handler = async (event) => {
  const response = event.Records[0].cf.response
  const request = event.Records[0].cf.request
  const headers = response.headers

  // Cache-Control for immutable assets
  if (request.uri.includes('/_nuxt/')) {
    headers['cache-control'] = [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ]
  }

  // Preload critical resources for HTML requests
  if (request.uri === '/' || request.uri.endsWith('.html')) {
    headers['link'] = [
      {
        key: 'Link',
        value: [
          '</assets/main-menu/BACKGROUND.webp>; rel=preload; as=image; type=image/webp',
          '</_nuxt/entry.js>; rel=modulepreload',
        ].join(', '),
      },
    ]
  }

  // Security headers
  headers['x-content-type-options'] = [{ key: 'X-Content-Type-Options', value: 'nosniff' }]
  headers['x-frame-options'] = [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }]
  headers['referrer-policy'] = [
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ]

  // Permissions Policy (formerly Feature-Policy)
  headers['permissions-policy'] = [
    {
      key: 'Permissions-Policy',
      value: 'geolocation=(), microphone=(), camera=()',
    },
  ]

  return response
}
```

**Deploy Lambda@Edge:**

```hcl
# infrastructure/modules/cloudfront-enhanced/lambda.tf
resource "aws_iam_role" "lambda_edge" {
  name = "${var.environment}-lambda-edge-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = [
          "lambda.amazonaws.com",
          "edgelambda.amazonaws.com"
        ]
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_edge_basic" {
  role       = aws_iam_role.lambda_edge.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "archive_file" "lambda_response_headers" {
  type        = "zip"
  source_file = "${path.module}/lambda/response-headers/index.mjs"
  output_path = "${path.module}/lambda/response-headers.zip"
}

resource "aws_lambda_function" "response_headers" {
  filename         = data.archive_file.lambda_response_headers.output_path
  function_name    = "${var.environment}-cloudfront-response-headers"
  role            = aws_iam_role.lambda_edge.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  publish         = true
  source_code_hash = data.archive_file.lambda_response_headers.output_base64sha256

  lifecycle {
    create_before_destroy = true
  }
}

# Add to CloudFront distribution
resource "aws_cloudfront_distribution" "website" {
  # ... existing config ...

  default_cache_behavior {
    # ... existing config ...

    lambda_function_association {
      event_type   = "origin-response"
      lambda_arn   = aws_lambda_function.response_headers.qualified_arn
      include_body = false
    }
  }
}
```

**Cost:** ~$0.60 per 1M requests (worth it for performance and security)

---

## Monitoring & Metrics

### Key CloudFront Metrics

**1. Cache Hit Rate**

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name CacheHitRate \
  --dimensions Name=DistributionId,Value=YOUR_DIST_ID \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average
```

**Target:** >90% average

**2. Origin Latency**

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name OriginLatency \
  --dimensions Name=DistributionId,Value=YOUR_DIST_ID \
  --start-time $(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

**Target:** <100ms average (S3 in same region)

**3. 4xx and 5xx Error Rates**

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name 4xxErrorRate \
  --dimensions Name=DistributionId,Value=YOUR_DIST_ID \
  --start-time $(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

**Target:** <1% error rate

### CloudWatch Dashboard

Create a monitoring dashboard:

```hcl
# infrastructure/monitoring.tf (already exists, enhance it)
resource "aws_cloudwatch_dashboard" "cloudfront" {
  dashboard_name = "${var.environment}-cloudfront-performance"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "CacheHitRate", { stat = "Average" }],
            [".", "Requests", { stat = "Sum" }],
          ]
          period = 300
          stat   = "Average"
          region = "us-east-1"  # CloudFront metrics are in us-east-1
          title  = "Cache Performance"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "BytesDownloaded", { stat = "Sum" }],
            [".", "BytesUploaded", { stat = "Sum" }],
          ]
          period = 300
          stat   = "Sum"
          region = "us-east-1"
          title  = "Data Transfer"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "4xxErrorRate", { stat = "Average" }],
            [".", "5xxErrorRate", { stat = "Average" }],
          ]
          period = 300
          stat   = "Average"
          region = "us-east-1"
          title  = "Error Rates"
        }
      }
    ]
  })
}
```

### Cost Monitoring

**Set up billing alerts:**

```hcl
resource "aws_cloudwatch_metric_alarm" "cloudfront_cost_alarm" {
  alarm_name          = "${var.environment}-cloudfront-cost-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = "86400"  # 1 day
  statistic           = "Maximum"
  threshold           = "50"  # Alert if costs exceed $50/day
  alarm_description   = "CloudFront costs exceeded threshold"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ServiceName = "AmazonCloudFront"
    Currency    = "USD"
  }
}
```

---

## Troubleshooting

### Issue: Low Cache Hit Rate (<80%)

**Diagnosis:**

```bash
aws cloudfront get-distribution-config \
  --id YOUR_DIST_ID \
  --output json > dist-config.json

# Check query strings in cache key
grep -A 5 "QueryString" dist-config.json
```

**Common Causes:**

1. Query string variations (e.g., `?v=123`, `?_ga=xyz`)
2. Cookie forwarding to origin
3. Different headers included in cache key

**Solutions:**

- Exclude unnecessary query strings from cache key
- Use `query_string_behavior = "none"` for static assets
- Don't forward cookies for static content

### Issue: Assets Not Updating After Deploy

**Diagnosis:**
Check if users are seeing old assets even after deployment.

**Cause:**
Assets cached at edge with long TTL, but filename didn't change.

**Solutions:**

**Option 1: Use versioned filenames (recommended)**

```typescript
// nuxt.config.ts - Already configured
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          // Ensure hashed filenames
          chunkFileNames: '_nuxt/[name]-[hash].js',
          assetFileNames: '_nuxt/[name]-[hash][extname]',
        },
      },
    },
  },
})
```

**Option 2: Invalidate cache (for HTML only)**

```bash
# After deployment
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/index.html" "/sw.js"
```

**Option 3: Lower TTL (not recommended)**
Reduces cache effectiveness and increases costs.

### Issue: Slow Initial Page Load

**Diagnosis:**
Use WebPageTest or Lighthouse to measure TTFB (Time to First Byte).

**Possible Causes:**

1. Cold cache (first request to edge location)
2. S3 bucket in distant region
3. Origin Shield in wrong region

**Solutions:**

- Enable Origin Shield (already done in enhanced module)
- Place Origin Shield closest to S3 bucket or most users
- Use CloudFront Functions for URL rewrites instead of Lambda@Edge

### Issue: High CloudFront Costs

**Diagnosis:**
Check AWS Cost Explorer → CloudFront breakdown.

**Identify cost driver:**

1. Data transfer: Optimize asset sizes (WebP, compression)
2. Requests: Improve cache hit rate
3. Invalidations: Use versioned filenames

**Solutions:**

- Review cache policies (ensure appropriate TTLs)
- Enable compression (Brotli + gzip)
- Optimize images (WebP/AVIF)
- Consider PriceClass_100 if audience is US/Europe

---

## Best Practices Checklist

### Deployment Checklist

Before deploying CloudFront changes:

- [ ] Test configuration in staging environment
- [ ] Verify cache behaviors are ordered correctly (most specific first)
- [ ] Confirm compression is enabled (Brotli + gzip)
- [ ] Set appropriate TTLs for each asset type
- [ ] Enable Origin Shield for high-traffic distributions
- [ ] Configure error pages (404, 403)
- [ ] Set up CloudWatch alarms
- [ ] Document any Lambda@Edge functions
- [ ] Test invalidation strategy
- [ ] Monitor cache hit rate after deployment

### Ongoing Maintenance

**Weekly:**

- Review cache hit rate (target: >90%)
- Check error rates (target: <1%)
- Monitor data transfer trends

**Monthly:**

- Review AWS CloudFront costs
- Analyze top requested URLs
- Check for unused edge locations (if using PriceClass_All)
- Validate SSL certificate expiration (60+ days remaining)

**Quarterly:**

- Review cache policies and TTLs
- Optimize Lambda@Edge functions
- Analyze user geographic distribution (adjust Price Class if needed)
- Update security headers

---

## Advanced Topics

### Regional Edge Caches

**CloudFront has two cache tiers:**

1. **Edge Locations** (~225 worldwide): Closest to users
2. **Regional Edge Caches** (~13 worldwide): Between edge and origin

**How it helps:**

- Cache hit at edge → Fastest (0ms to origin)
- Cache miss at edge, hit at regional → Fast (~50ms)
- Cache miss at both → Fetch from origin (~200ms)

**Already utilized automatically**, no configuration needed.

### CloudFront Functions vs Lambda@Edge

**CloudFront Functions:**

- Runs at edge locations (faster)
- Limited functionality (URL rewrites, headers)
- ~$0.10 per 1M invocations (cheaper)
- Max 1ms execution time

**Lambda@Edge:**

- Runs at regional edge caches
- Full Node.js/Python runtime
- ~$0.60 per 1M invocations
- Max 5 seconds execution time

**Use CloudFront Functions for:**

- URL normalization
- Adding security headers (simple)
- Redirects

**Use Lambda@Edge for:**

- Complex header manipulation
- A/B testing
- Authentication
- Image resizing (with external service)

### Real-Time Logs

Enable for debugging:

```hcl
resource "aws_kinesis_stream" "cloudfront_logs" {
  name             = "${var.environment}-cloudfront-realtime-logs"
  shard_count      = 1
  retention_period = 24
}

resource "aws_cloudfront_realtime_log_config" "main" {
  name          = "${var.environment}-realtime-logs"
  sampling_rate = 100  # 100% of requests (reduce for high traffic)

  endpoint {
    stream_type = "Kinesis"

    kinesis_stream_config {
      role_arn   = aws_iam_role.cloudfront_realtime_logs.arn
      stream_arn = aws_kinesis_stream.cloudfront_logs.arn
    }
  }

  fields = [
    "timestamp",
    "c-ip",
    "cs-method",
    "cs-uri-stem",
    "sc-status",
    "cs-protocol",
    "time-taken",
    "x-edge-location",
    "x-edge-result-type",
    "x-edge-response-result-type",
  ]
}
```

**Cost:** ~$0.015 per GB ingested + Kinesis costs
**Use case:** Debug cache issues, analyze performance in real-time

---

## Migration from Basic to Enhanced Module

If currently using basic CloudFront module:

```hcl
# Before: infrastructure/environments/production/main.tf
module "cloudfront" {
  source = "../../modules/cloudfront"
  # ...
}

# After:
module "cloudfront" {
  source = "../../modules/cloudfront-enhanced"
  # ...
  # Same variables, enhanced functionality
}
```

**Steps:**

1. Update module source in Terraform
2. Run `terraform plan` to review changes
3. Apply in staging first
4. Monitor cache hit rate and performance
5. Apply to production during low-traffic period
6. Invalidate cache if needed

**Breaking changes:** None (enhanced module is backward compatible)

---

## References

- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Cache Policy Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html)
- [Origin Shield](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/origin-shield.html)
- [Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)

---

**Last Updated:** 2026-01-11
**Next Review:** After Phase 1 CloudFront optimizations
