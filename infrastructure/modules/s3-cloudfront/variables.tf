variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
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

variable "cloudfront_price_class" {
  description = "CloudFront price class (PriceClass_100, PriceClass_200, PriceClass_All)"
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "Price class must be one of: PriceClass_100, PriceClass_200, PriceClass_All"
  }
}

variable "default_ttl" {
  description = "Default TTL for CloudFront cache (in seconds)"
  type        = number
  default     = 86400 # 1 day
}

variable "data_files_ttl" {
  description = "TTL for data files cache (in seconds)"
  type        = number
  default     = 3600 # 1 hour
}

variable "noncurrent_version_expiration_days" {
  description = "Number of days before noncurrent S3 versions expire"
  type        = number
  default     = 30
}

variable "error_caching_min_ttl" {
  description = "Minimum TTL for error responses (in seconds)"
  type        = number
  default     = 300 # 5 minutes
}
