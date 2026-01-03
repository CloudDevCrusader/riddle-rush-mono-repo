# ===================================
# Monitoring Module Variables
# ===================================

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "riddle-rush"
}

variable "environment" {
  description = "Environment (prod, staging, dev)"
  type        = string

  validation {
    condition     = contains(["prod", "staging", "dev"], var.environment)
    error_message = "Environment must be prod, staging, or dev."
  }
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-central-1"
}

variable "s3_bucket_name" {
  description = "S3 bucket name to monitor"
  type        = string
}

variable "cloudfront_distribution_id" {
  description = "CloudFront distribution ID to monitor (optional)"
  type        = string
  default     = ""
}

variable "alert_email" {
  description = "Email address for CloudWatch alerts"
  type        = string
  default     = ""

  validation {
    condition     = can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.alert_email)) || var.alert_email == ""
    error_message = "Must be a valid email address or empty string."
  }
}

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}
