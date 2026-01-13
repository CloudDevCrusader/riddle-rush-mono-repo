variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "riddle-rush-docs"
}

variable "aws_region" {
  description = "AWS region for regional resources"
  type        = string
  default     = "eu-central-1"
}

variable "bucket_name" {
  description = "S3 bucket name for docs"
  type        = string
  default     = "riddlerush-docs"
}

variable "domain_name" {
  description = "Docs domain name"
  type        = string
  default     = "docs.riddlerush.de"
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}
