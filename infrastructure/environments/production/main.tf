# Production Environment
# Enhanced production infrastructure with optional domain

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to use remote state
  # backend "s3" {
  #   bucket         = "riddle-rush-terraform-state-prod"
  #   key            = "production/terraform.tfstate"
  #   region         = "eu-central-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "production"
      ManagedBy   = "Terraform"
      Optimized   = "EdgeCaching"
    }
  }
}

# Data source to get current AWS account ID
data "aws_caller_identity" "current" {}

# Data source to get current AWS region
data "aws_region" "current" {}

# Use the S3 module
module "s3_website" {
  source = "../../modules/s3-website"
  
  bucket_name                     = var.bucket_name != "" ? var.bucket_name : "${var.project_name}-prod-${data.aws_caller_identity.current.account_id}"
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
  domain_name                 = var.domain_name
  certificate_arn             = var.certificate_arn
  
  price_class                 = var.cloudfront_price_class
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
