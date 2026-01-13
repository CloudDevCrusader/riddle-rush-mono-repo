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
  # profile = "riddlerush" # Commented out - uses default AWS credentials

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "production"
      ManagedBy   = "Terraform"
      Optimized   = "SingleBucket"
    }
  }
}

# Data source to get current AWS account ID
data "aws_caller_identity" "current" {}

locals {
  bucket_name = var.bucket_name != "" ? var.bucket_name : "${var.project_name}-production-${data.aws_caller_identity.current.account_id}"
}

# Use single S3 bucket + CloudFront
module "s3_website" {
  source = "../../modules/s3-website"

  bucket_name                        = local.bucket_name
  environment                        = "production"
  enable_acceleration                = true
  versioning_enabled                 = true
  noncurrent_version_expiration_days = 30
}

module "cloudfront" {
  source = "../../modules/cloudfront-enhanced"

  bucket_regional_domain_name = module.s3_website.bucket_regional_domain_name
  bucket_arn                  = module.s3_website.bucket_arn
  environment                 = "production"
  domain_name                 = var.domain_name
  domain_names                = var.domain_names
  certificate_arn             = var.certificate_arn
  price_class                 = var.cloudfront_price_class
}

# Outputs
output "bucket_name" {
  value = module.s3_website.bucket_id
}

output "cloudfront_distribution_id" {
  value = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  value = module.cloudfront.distribution_domain_name
}

output "cloudfront_hosted_zone_id" {
  value = module.cloudfront.distribution_hosted_zone_id
}
