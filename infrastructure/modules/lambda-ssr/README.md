# Lambda SSR Module

This Terraform module deploys a Nuxt SSR application using AWS Lambda + API Gateway (HTTP API).

## Features

- ✅ **AWS Lambda** - Serverless SSR execution
- ✅ **Lambda Function URL** - Direct access (simpler, faster)
- ✅ **API Gateway HTTP API** - Better for custom domains, logging, and throttling
- ✅ **CloudWatch Logs** - Automatic logging for Lambda and API Gateway
- ✅ **Custom Domain Support** - Optional custom domain configuration
- ✅ **CORS Configuration** - Pre-configured CORS for web applications

## Usage

### 1. Build your Nuxt app with Nitro

```bash
cd apps/game
pnpm run build
```

This creates `.output/server/` with Lambda-ready code.

### 2. Package for Lambda

Create a deployment zip:

```bash
cd apps/game/.output/server
zip -r ../../lambda-deploy.zip .
```

### 3. Use in Terraform

```hcl
module "lambda_ssr" {
  source = "./modules/lambda-ssr"

  project_name    = "riddle-rush"
  environment     = "production"
  lambda_zip_path = "../../apps/game/lambda-deploy.zip"

  # Optional: Custom domain
  domain_name     = "game.example.com"
  certificate_arn = "arn:aws:acm:region:account:certificate/xxx"

  tags = {
    Application = "Riddle Rush"
    ManagedBy   = "Terraform"
  }
}
```

### 4. Outputs

After deployment:

```bash
# Lambda Function URL (direct access)
terraform output lambda_function_url

# API Gateway URL
terraform output api_gateway_url

# Custom domain URL
terraform output custom_domain_url
```

## Architecture

```
User Request
    ↓
API Gateway HTTP API / Lambda Function URL
    ↓
Lambda Function (Node.js 22.x)
    ↓
Nuxt SSR Rendering
    ↓
HTML Response + Client Hydration
    ↓
Service Worker (PWA)
```

## Comparison: Lambda Function URL vs API Gateway

### Lambda Function URL

- ✅ **Simpler** - Direct Lambda invocation
- ✅ **Cheaper** - No API Gateway costs
- ✅ **Faster** - One less hop
- ❌ **No custom domains** - Must use Lambda URL
- ❌ **Limited features** - No throttling, WAF, etc.

### API Gateway HTTP API

- ✅ **Custom domains** - Use your own domain
- ✅ **Advanced features** - Throttling, WAF, caching
- ✅ **Better monitoring** - Detailed CloudWatch metrics
- ❌ **More expensive** - \$1/million requests + \$0.90/million
- ❌ **Slightly slower** - Extra hop

**Recommendation:** Use Lambda Function URL for development, API Gateway for production.

## Cost Estimation

### Lambda

- **Free tier**: 1M requests/month, 400,000 GB-seconds
- **After free tier**: \$0.20 per 1M requests + \$0.0000166667/GB-second

### API Gateway HTTP API (if used)

- \$1.00 per million requests
- \$0.09 per GB data transfer (first 10 TB)

### Example: 100k monthly visitors

- 500k page views (5 pages/visit)
- Lambda: ~\$0.10
- API Gateway: ~\$0.50
- **Total: ~\$0.60/month**

## CloudFront Integration

To add CDN caching:

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

    allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods  = ["GET", "HEAD", "OPTIONS"]

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }
  }
}
```

## Environment Variables

The Lambda function receives:

- `NODE_ENV` - Set to `production` or `development`

To add more:

```hcl
environment {
  variables = {
    NODE_ENV = "production"
    CUSTOM_VAR = "value"
  }
}
```

## Monitoring

CloudWatch dashboards are automatically created with:

- Lambda invocations, errors, duration
- API Gateway requests, 4xx/5xx errors, latency

## Troubleshooting

### "Cannot find module"

- Ensure all dependencies are bundled in the zip
- Nitro should handle this automatically

### "Task timed out"

- Increase `lambda_timeout` (default: 10s)
- Optimize SSR performance

### "Memory exceeded"

- Increase `lambda_memory` (default: 512MB)

### CORS errors

- CORS is pre-configured for `*` origins
- Customize in `main.tf` if needed
