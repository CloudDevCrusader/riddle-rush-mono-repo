# Development Environment
# Single bucket deployment

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
  #   bucket         = "riddle-rush-terraform-state-dev"
  #   key            = "development/terraform.tfstate"
  #   region         = "eu-central-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region  = var.aws_region
  profile = "riddlerush" # Use the AWS CLI profile

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "development"
      ManagedBy   = "Terraform"
      Optimized   = "SingleBucket"
    }
  }
}

data "aws_caller_identity" "current" {}

locals {
  bucket_name = var.bucket_name != "" ? var.bucket_name : "${var.project_name}-development-${data.aws_caller_identity.current.account_id}"
}

module "s3_website" {
  source = "../../modules/s3-website"

  bucket_name                        = local.bucket_name
  environment                        = "development"
  enable_acceleration                = false
  versioning_enabled                 = true
  noncurrent_version_expiration_days = 7
}

module "cloudfront" {
  source = "../../modules/cloudfront-enhanced"

  bucket_regional_domain_name = module.s3_website.bucket_regional_domain_name
  bucket_arn                  = module.s3_website.bucket_arn
  environment                 = "development"
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
