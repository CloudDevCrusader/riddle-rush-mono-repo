# CloudFront Enhanced Module

Reusable Terraform module for creating CloudFront distributions optimized for PWA/SPA hosting with edge caching, custom cache policies, and optional SPA routing.

## Purpose

Creates a CloudFront distribution with:

- Origin Access Control (OAC) for secure S3 access
- Aggressive caching for static assets (1-year TTL)
- Short-TTL edge caching for HTML files (1-minute)
- No-cache behavior for service workers (immediate updates)
- Separate cache behaviors for workbox files, data, and API routes
- Optional CloudFront Function for SPA route rewriting
- HTTP/2 and HTTP/3 support
- TLS 1.2 minimum with SNI
- Origin Shield for better cache hit ratio
- Custom domain and ACM certificate support

## Usage

### Basic (CloudFront default domain)

```hcl
module "cloudfront" {
  source = "./modules/cloudfront-enhanced"

  bucket_regional_domain_name = module.s3_website.bucket_regional_domain_name
  bucket_arn                  = module.s3_website.bucket_arn
  environment                 = "production"
}
```

### With Custom Domain and SPA Routing

```hcl
module "cloudfront" {
  source = "./modules/cloudfront-enhanced"

  bucket_regional_domain_name  = module.s3_website.bucket_regional_domain_name
  bucket_arn                   = module.s3_website.bucket_arn
  environment                  = "production"
  domain_names                 = ["riddlerush.de", "www.riddlerush.de"]
  certificate_arn              = "arn:aws:acm:us-east-1:123456789:certificate/abc-123"
  price_class                  = "PriceClass_200"
  enable_spa_rewrite_function  = true
}
```

## Inputs

| Name                          | Description                                    | Type           | Default            | Required |
| ----------------------------- | ---------------------------------------------- | -------------- | ------------------ | -------- |
| `bucket_regional_domain_name` | Regional domain name of the S3 bucket          | `string`       | -                  | yes      |
| `bucket_arn`                  | ARN of the S3 bucket                           | `string`       | -                  | yes      |
| `environment`                 | Environment (development, staging, production) | `string`       | `"development"`    | no       |
| `domain_name`                 | Custom domain (deprecated, use domain_names)   | `string`       | `""`               | no       |
| `domain_names`                | List of custom domain names                    | `list(string)` | `[]`               | no       |
| `certificate_arn`             | ACM certificate ARN for custom domain          | `string`       | `""`               | no       |
| `price_class`                 | CloudFront price class                         | `string`       | `"PriceClass_100"` | no       |
| `enable_spa_rewrite_function` | Enable CloudFront function for SPA routing     | `bool`         | `false`            | no       |

## Outputs

| Name                          | Description                                |
| ----------------------------- | ------------------------------------------ |
| `distribution_id`             | ID of the CloudFront distribution          |
| `distribution_arn`            | ARN of the CloudFront distribution         |
| `distribution_domain_name`    | Domain name of the CloudFront distribution |
| `distribution_hosted_zone_id` | Hosted zone ID for Route53 alias records   |

## Cache Behaviors

| Path Pattern   | Default TTL | Max TTL   | Purpose                    |
| -------------- | ----------- | --------- | -------------------------- |
| `*` (default)  | 1 year      | 1 year    | Static assets (JS, CSS)    |
| `*.html`       | 1 minute    | 5 minutes | HTML pages (quick updates) |
| `sw.js`        | 0           | 1 minute  | Service worker (immediate) |
| `workbox-*.js` | 1 minute    | 5 minutes | Workbox runtime            |
| `data/*`       | 5 minutes   | 30 min    | Data/JSON files            |
| `api/*`        | 10 seconds  | 1 minute  | API routes                 |
