# Enhanced Development Environment with Optional Domain

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"

  default_tags {
    tags = {
      Project     = "riddle-rush"
      Environment = "development"
      ManagedBy   = "Terraform"
      Optimized   = "EdgeCaching"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Use the S3 module
module "s3_website" {
  source = "../../modules/s3-website"

  bucket_name                        = "riddle-rush-dev-${data.aws_caller_identity.current.account_id}"
  environment                        = "development"
  enable_acceleration                = false
  versioning_enabled                 = true
  noncurrent_version_expiration_days = 7
}

# Use the Enhanced CloudFront module
module "cloudfront_enhanced" {
  source = "../../modules/cloudfront-enhanced"

  bucket_regional_domain_name = module.s3_website.bucket_regional_domain_name
  bucket_arn                  = module.s3_website.bucket_arn
  environment                 = "development"

  # Domain is optional - leave empty for development
  domain_name     = "" # Optional: "dev.your-domain.com"
  certificate_arn = "" # Optional: ACM certificate ARN

  price_class       = "PriceClass_100"
  default_cache_ttl = 3600 # 1 hour for dev
  html_cache_ttl    = 60   # 1 minute for dev
}

# Outputs
output "bucket_name" {
  value = module.s3_website.bucket_id
}

output "cloudfront_distribution_id" {
  value = module.cloudfront_enhanced.distribution_id
}

output "cloudfront_domain_name" {
  value = module.cloudfront_enhanced.distribution_domain_name
}

output "s3_bucket_arn" {
  value = module.s3_website.bucket_arn
}

output "cloudfront_arn" {
  value = module.cloudfront_enhanced.distribution_arn
}
