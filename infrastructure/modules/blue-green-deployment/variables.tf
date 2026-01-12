# Blue-Green Deployment Module Variables

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment (development, production)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "domain_name" {
  description = "Custom domain name (deprecated, use domain_names)"
  type        = string
  default     = ""
}

variable "domain_names" {
  description = "List of custom domain names for CloudFront"
  type        = list(string)
  default     = []
}

variable "certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
  default     = ""
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "use_green" {
  description = "Use green bucket (true) or blue bucket (false)"
  type        = bool
  default     = false
}