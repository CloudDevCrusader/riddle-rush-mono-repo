# Development Environment
# S3 + CloudFront static website hosting for dev.riddlerush.de
#
# This config manages all live development AWS resources.
# State is stored in S3 with DynamoDB locking.

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

locals {
  bucket_name = var.bucket_name != "" ? var.bucket_name : "${var.project_name}-development"
}

# =============================================================================
# S3 Website (via module)
# =============================================================================
module "s3_website" {
  source = "../../modules/s3-website"

  project_name        = var.project_name
  bucket_name         = local.bucket_name
  environment         = "development"
  enable_acceleration = false
  enable_versioning   = true
}

# =============================================================================
# CloudFront Distribution (via module)
# =============================================================================
module "cloudfront" {
  source = "../../modules/cloudfront-enhanced"

  bucket_regional_domain_name = module.s3_website.bucket_regional_domain_name
  bucket_arn                  = module.s3_website.bucket_arn
  environment                 = "development"
  domain_names                = var.domain_names
  certificate_arn             = var.certificate_arn
  price_class                 = var.cloudfront_price_class

  custom_error_responses = [
    {
      error_code            = 403
      response_code         = 200
      response_page_path    = "/index.html"
      error_caching_min_ttl = 0
    },
    {
      error_code            = 404
      response_code         = 200
      response_page_path    = "/index.html"
      error_caching_min_ttl = 0
    }
  ]
}
