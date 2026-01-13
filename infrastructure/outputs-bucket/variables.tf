variable "aws_region" {
  description = "AWS region for the outputs bucket"
  type        = string
  default     = "eu-central-1"
}

variable "bucket_name" {
  description = "S3 bucket name for Terraform outputs (leave empty for auto-generated)"
  type        = string
  default     = "tf-outputs-riddlerush"
}

variable "noncurrent_version_expiration_days" {
  description = "Days before noncurrent object versions expire"
  type        = number
  default     = 30
}
