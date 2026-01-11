# Enhanced Production Environment with Optional Domain

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
      Environment = "production"
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
  
  bucket_name                     = "riddle-rush-prod-${data.aws_caller_identity.current.account_id}"
  environment                     = "production"
  enable_acceleration             = true  # Enable for production
  versioning_enabled              = true
  noncurrent_version_expiration_days = 30
}

# Use the Enhanced CloudFront module
module "cloudfront_enhanced" {
  source = "../../modules/cloudfront-enhanced"
  
  bucket_regional_domain_name = module.s3_website.bucket_regional_domain_name
  bucket_arn                  = module.s3_website.bucket_arn
  environment                 = "production"
  
  # Domain is optional - can be added later
  domain_name                 = "" # Optional: "your-domain.com"
  certificate_arn             = "" # Optional: ACM certificate ARN
  
  price_class                 = "PriceClass_100" # Can use PriceClass_200 for global
  default_cache_ttl           = 31536000 # 1 year for production
  html_cache_ttl              = 60       # 1 minute at edge
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
