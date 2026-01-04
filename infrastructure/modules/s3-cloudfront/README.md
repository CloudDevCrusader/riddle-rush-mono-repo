# S3 + CloudFront Module

Reusable Terraform module for S3 + CloudFront static website hosting with PWA support.

## Features

- S3 bucket with versioning and lifecycle management
- CloudFront distribution with optimized caching
- Origin Access Control (OAC) for secure S3 access
- Custom cache behaviors for service workers, workbox files, and data files
- SPA routing support with custom error responses
- Optional custom domain with ACM certificate
- Configurable TTL values per environment

## Usage

```hcl
module "website" {
  source = "../../modules/s3-cloudfront"

  project_name                        = "my-project"
  environment                         = "production"
  aws_region                          = "eu-central-1"
  bucket_name                         = ""  # Auto-generated if empty
  domain_name                         = ""  # Optional
  certificate_arn                     = ""  # Required if domain_name is set
  cloudfront_price_class              = "PriceClass_100"
  default_ttl                         = 86400  # 1 day
  data_files_ttl                      = 3600   # 1 hour
  noncurrent_version_expiration_days  = 30
  error_caching_min_ttl               = 300
}
```

## Variables

| Name                               | Description                                         | Type     | Default            | Required |
| ---------------------------------- | --------------------------------------------------- | -------- | ------------------ | -------- |
| project_name                       | Name of the project (used for resource naming)      | `string` | -                  | yes      |
| environment                        | Environment name (production, staging, development) | `string` | -                  | yes      |
| aws_region                         | AWS region for resources                            | `string` | `"eu-central-1"`   | no       |
| bucket_name                        | S3 bucket name (leave empty for auto-generated)     | `string` | `""`               | no       |
| domain_name                        | Custom domain name for CloudFront                   | `string` | `""`               | no       |
| certificate_arn                    | ACM certificate ARN for custom domain               | `string` | `""`               | no       |
| cloudfront_price_class             | CloudFront price class                              | `string` | `"PriceClass_100"` | no       |
| default_ttl                        | Default TTL for CloudFront cache (seconds)          | `number` | `86400`            | no       |
| data_files_ttl                     | TTL for data files cache (seconds)                  | `number` | `3600`             | no       |
| noncurrent_version_expiration_days | Days before noncurrent S3 versions expire           | `number` | `30`               | no       |
| error_caching_min_ttl              | Minimum TTL for error responses (seconds)           | `number` | `300`              | no       |

## Outputs

| Name                        | Description                                      |
| --------------------------- | ------------------------------------------------ |
| bucket_name                 | S3 bucket name                                   |
| bucket_arn                  | S3 bucket ARN                                    |
| cloudfront_distribution_id  | CloudFront distribution ID                       |
| cloudfront_domain_name      | CloudFront distribution domain name              |
| cloudfront_distribution_arn | CloudFront distribution ARN                      |
| website_url                 | Website URL (custom domain or CloudFront domain) |

## Cache Behaviors

The module configures optimized cache behaviors:

- **Default**: 1 day TTL (configurable)
- **Service Worker** (`sw.js`): No cache (always fresh)
- **Workbox files** (`workbox-*.js`): No cache (always fresh)
- **Data files** (`data/*`): Configurable TTL (default: 1 hour)

## Examples

### Production Environment

```hcl
module "website" {
  source = "../../modules/s3-cloudfront"

  project_name                        = "riddle-rush-pwa"
  environment                         = "production"
  default_ttl                         = 86400  # 1 day
  data_files_ttl                      = 3600   # 1 hour
  noncurrent_version_expiration_days  = 30
  error_caching_min_ttl               = 300
}
```

### Development Environment

```hcl
module "website" {
  source = "../../modules/s3-cloudfront"

  project_name                        = "riddle-rush-pwa"
  environment                         = "development"
  default_ttl                         = 3600   # 1 hour (shorter for dev)
  data_files_ttl                      = 1800   # 30 minutes
  noncurrent_version_expiration_days  = 7      # Shorter retention
  error_caching_min_ttl               = 60     # 1 minute
}
```

## Requirements

- Terraform >= 1.5.0
- AWS Provider >= 5.0
