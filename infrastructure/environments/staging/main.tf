# Staging Environment
# Staging infrastructure for pre-production testing

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
  #   bucket         = "riddle-rush-terraform-state-staging"
  #   key            = "staging/terraform.tfstate"
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
      Environment = "staging"
      ManagedBy   = "Terraform"
    }
  }
}

# S3 + CloudFront Module
module "website" {
  source = "../../modules/s3-cloudfront"

  project_name                        = var.project_name
  environment                         = "staging"
  aws_region                          = var.aws_region
  bucket_name                         = var.bucket_name
  domain_name                         = var.domain_name
  certificate_arn                     = var.certificate_arn
  cloudfront_price_class              = var.cloudfront_price_class
  default_ttl                         = 7200   # 2 hours (between dev and prod)
  data_files_ttl                      = 1800   # 30 minutes
  noncurrent_version_expiration_days  = 14     # 2 weeks
  error_caching_min_ttl               = 120    # 2 minutes
}
