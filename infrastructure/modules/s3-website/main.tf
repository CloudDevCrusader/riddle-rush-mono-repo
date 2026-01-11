# S3 Website Module
# Reusable module for creating S3 buckets for static websites

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "environment" {
  description = "Environment (development, staging, production)"
  type        = string
  default     = "development"
}

variable "enable_acceleration" {
  description = "Enable S3 Transfer Acceleration"
  type        = bool
  default     = false
}

variable "versioning_enabled" {
  description = "Enable S3 bucket versioning"
  type        = bool
  default     = true
}

variable "noncurrent_version_expiration_days" {
  description = "Days before noncurrent versions are expired"
  type        = number
  default     = 30
}

# S3 Bucket
resource "aws_s3_bucket" "website" {
  bucket = var.bucket_name

  tags = {
    Name        = "${var.bucket_name}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# S3 Transfer Acceleration
resource "aws_s3_bucket_accelerate_configuration" "website" {
  count  = var.enable_acceleration ? 1 : 0
  bucket = aws_s3_bucket.website.id
  status = "Enabled"
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "website" {
  count  = var.versioning_enabled ? 1 : 0
  bucket = aws_s3_bucket.website.id

  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    id     = "DeleteOldVersions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_expiration_days
    }
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Website Configuration
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

# Outputs
output "bucket_id" {
  description = "ID of the S3 bucket"
  value       = aws_s3_bucket.website.id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.website.arn
}

output "bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.website.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}
