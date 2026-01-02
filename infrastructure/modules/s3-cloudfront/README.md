# S3 + CloudFront Module

Reusable Terraform module for S3 + CloudFront static website hosting.

## Usage

```hcl
module "website" {
  source = "./modules/s3-cloudfront"

  project_name = "my-project"
  environment  = "production"
  aws_region   = "eu-central-1"
}
```

## Variables

See `variables.tf` for all available variables.

## Outputs

See `outputs.tf` for all available outputs.

