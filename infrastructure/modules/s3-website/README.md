# S3 Website Module

Reusable Terraform module for creating S3 buckets configured for static website hosting with CloudFront integration.

## Purpose

Creates an S3 bucket with:

- Static website hosting configuration
- Versioning support
- Lifecycle rules for old version cleanup
- Transfer acceleration (optional)
- Intelligent tiering for cost optimization (optional)
- CORS configuration (optional)
- Public access blocking (enforced - use CloudFront OAC for access)

## Usage

### Basic

```hcl
module "s3_website" {
  source = "./modules/s3-website"

  project_name      = "riddle-rush"
  environment       = "production"
  enable_versioning = true
}
```

### With Custom Lifecycle Rules and CORS

```hcl
module "s3_website" {
  source = "./modules/s3-website"

  project_name        = "riddle-rush"
  environment         = "production"
  enable_versioning   = true
  enable_acceleration = true

  lifecycle_rules = [
    {
      id                                = "DeleteOldVersions"
      enabled                           = true
      noncurrent_version_expiration_days = 30
    }
  ]

  cors_allowed_origins = ["https://riddlerush.de", "https://www.riddlerush.de"]
}
```

## Inputs

| Name                         | Description                                    | Type           | Default        | Required |
| ---------------------------- | ---------------------------------------------- | -------------- | -------------- | -------- |
| `project_name`               | Project name for resource naming               | `string`       | -              | yes      |
| `environment`                | Environment (production, staging, development) | `string`       | -              | yes      |
| `bucket_name`                | Custom bucket name (auto-generated if empty)   | `string`       | `""`           | no       |
| `enable_versioning`          | Enable versioning on S3 bucket                 | `bool`         | `true`         | no       |
| `enable_acceleration`        | Enable S3 Transfer Acceleration                | `bool`         | `false`        | no       |
| `enable_intelligent_tiering` | Enable Intelligent Tiering                     | `bool`         | `false`        | no       |
| `lifecycle_rules`            | S3 lifecycle rules                             | `list(object)` | `[]`           | no       |
| `cors_allowed_origins`       | CORS allowed origins                           | `list(string)` | `[]`           | no       |
| `index_document`             | Index document suffix                          | `string`       | `"index.html"` | no       |
| `error_document`             | Error document key                             | `string`       | `"404.html"`   | no       |

## Outputs

| Name                          | Description                    |
| ----------------------------- | ------------------------------ |
| `bucket_id`                   | S3 bucket ID                   |
| `bucket_arn`                  | S3 bucket ARN                  |
| `bucket_domain_name`          | S3 bucket domain name          |
| `bucket_regional_domain_name` | S3 bucket regional domain name |
| `website_endpoint`            | S3 website endpoint URL        |
