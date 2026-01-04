# Production Environment
# This imports and manages the existing production infrastructure

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
  #   key            = "prod/terraform.tfstate"
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
    }
  }
}

# S3 + CloudFront Module
module "website" {
  source = "../../modules/s3-cloudfront"

  project_name                        = var.project_name
  environment                         = "production"
  aws_region                          = var.aws_region
  bucket_name                         = var.bucket_name
  domain_name                         = var.domain_name
  certificate_arn                     = var.certificate_arn
  cloudfront_price_class              = var.cloudfront_price_class
  default_ttl                         = 86400  # 1 day
  data_files_ttl                      = 3600   # 1 hour
  noncurrent_version_expiration_days  = 30
  error_caching_min_ttl               = 300    # 5 minutes
}
