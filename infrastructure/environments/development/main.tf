# Development Environment
# Blue-Green deployment with zero downtime

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
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "development"
      ManagedBy   = "Terraform"
      Optimized   = "BlueGreen"
    }
  }
}

# Use Blue-Green deployment module
module "blue_green" {
  source = "../../modules/blue-green-deployment"
  
  project_name    = var.project_name
  environment     = "development"
  aws_region      = var.aws_region
  domain_name     = var.domain_name
  certificate_arn = var.certificate_arn
  price_class     = var.cloudfront_price_class
  use_green       = var.use_green  # Default: false (uses blue)
}

# Outputs
output "blue_bucket_name" {
  value = module.blue_green.blue_bucket_name
}

output "green_bucket_name" {
  value = module.blue_green.green_bucket_name
}

output "active_bucket_name" {
  value = module.blue_green.active_bucket_name
}

output "cloudfront_distribution_id" {
  value = module.blue_green.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  value = module.blue_green.cloudfront_domain_name
}

output "switch_to_green_command" {
  value = module.blue_green.switch_to_green_command
}

output "switch_to_blue_command" {
  value = module.blue_green.switch_to_blue_command
}
