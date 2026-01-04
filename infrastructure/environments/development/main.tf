# Development Environment
# New development infrastructure separate from production

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "riddle-rush-terraform-state-dev"
    key            = "development/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock-dev"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "development"
      ManagedBy   = "Terraform"
    }
  }
}

# Resolve account ID to stabilize the dev bucket name when not explicitly set.
data "aws_caller_identity" "current" {}

# S3 + CloudFront Module
module "website" {
  source = "../../modules/s3-cloudfront"

  project_name                        = var.project_name
  environment                         = "development"
  aws_region                          = var.aws_region
  bucket_name                         = var.bucket_name != "" ? var.bucket_name : "${var.project_name}-dev-${data.aws_caller_identity.current.account_id}"
  domain_name                         = var.domain_name
  certificate_arn                     = var.certificate_arn
  cloudfront_price_class              = var.cloudfront_price_class
  default_ttl                         = 3600   # 1 hour (shorter for dev)
  data_files_ttl                      = 1800   # 30 minutes (shorter for dev)
  noncurrent_version_expiration_days  = 7      # Shorter retention for dev
  error_caching_min_ttl               = 60    # 1 minute (shorter for dev)
}

# Preserve existing state after refactoring root resources into the module.
moved {
  from = aws_s3_bucket.website
  to   = module.website.aws_s3_bucket.website
}

moved {
  from = aws_s3_bucket_versioning.website
  to   = module.website.aws_s3_bucket_versioning.website
}

moved {
  from = aws_s3_bucket_lifecycle_configuration.website
  to   = module.website.aws_s3_bucket_lifecycle_configuration.website
}

moved {
  from = aws_s3_bucket_public_access_block.website
  to   = module.website.aws_s3_bucket_public_access_block.website
}

moved {
  from = aws_s3_bucket_website_configuration.website
  to   = module.website.aws_s3_bucket_website_configuration.website
}

moved {
  from = aws_cloudfront_origin_access_control.website
  to   = module.website.aws_cloudfront_origin_access_control.website
}

moved {
  from = aws_cloudfront_distribution.website
  to   = module.website.aws_cloudfront_distribution.website
}

moved {
  from = aws_s3_bucket_policy.website
  to   = module.website.aws_s3_bucket_policy.website
}
