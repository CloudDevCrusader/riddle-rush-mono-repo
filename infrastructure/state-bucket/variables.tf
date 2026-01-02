variable "aws_region" {
  description = "AWS region for state bucket"
  type        = string
  default     = "eu-central-1"
}

variable "state_bucket_name" {
  description = "S3 bucket name for Terraform state (leave empty for auto-generated)"
  type        = string
  default     = ""
}

variable "dynamodb_table_name" {
  description = "DynamoDB table name for state locking (leave empty for auto-generated)"
  type        = string
  default     = ""
}

