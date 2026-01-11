variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
  default     = "riddle-rush-pwa"
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be one of: production, staging, development"
  }
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-central-1"
}

variable "bucket_name" {
  description = "S3 bucket name (leave empty for auto-generated name)"
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "Custom domain name for CloudFront (optional)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for custom domain (required if domain_name is set)"
  type        = string
  default     = ""
}

variable "enable_versioning" {
  description = "Enable S3 bucket versioning"
  type        = bool
  default     = true
}

variable "enable_lifecycle" {
  description = "Enable S3 bucket lifecycle policies"
  type        = bool
  default     = true
}

variable "cloudfront_price_class" {
  description = "CloudFront price class (PriceClass_100, PriceClass_200, PriceClass_All)"
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "Price class must be one of: PriceClass_100, PriceClass_200, PriceClass_All"
  }
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}

# IAM variables
variable "create_additional_admin" {
  description = "Create an additional admin user"
  type        = bool
  default     = false
}

variable "additional_admin_username" {
  description = "Username for the additional admin user"
  type        = string
  default     = "admin2"
}

# SSR Lambda variables
variable "enable_ssr_lambda" {
  description = "Enable SSR deployment using AWS Lambda"
  type        = bool
  default     = false
}

variable "ssr_domain_name" {
  description = "Custom domain for SSR endpoint (optional)"
  type        = string
  default     = ""
}

variable "ssr_certificate_arn" {
  description = "ACM certificate ARN for SSR custom domain"
  type        = string
  default     = ""
}


