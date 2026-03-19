variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
  default     = "riddle-rush-pwa"
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

variable "domain_names" {
  description = "List of custom domain names for CloudFront"
  type        = list(string)
  default     = []
}

variable "certificate_arn" {
  description = "ACM certificate ARN for custom domain (required if domain_names is set)"
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

# Bitwarden Secrets Management
variable "bitwarden_client_id" {
  description = "Bitwarden client ID for API access"
  type        = string
  sensitive   = true
  default     = ""
}

variable "bitwarden_client_secret" {
  description = "Bitwarden client secret for API access"
  type        = string
  sensitive   = true
  default     = ""
}

variable "bitwarden_email" {
  description = "Bitwarden account email"
  type        = string
  sensitive   = true
  default     = ""
}

variable "bitwarden_password" {
  description = "Bitwarden account password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "bitwarden_secret_ids" {
  description = "Map of secret names to Bitwarden secret IDs"
  type        = map(string)
  default     = {}
}
