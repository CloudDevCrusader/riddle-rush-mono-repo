# S3 Website Module
# Reusable module for creating S3 buckets configured for static website hosting
# Includes versioning, lifecycle rules, CORS, transfer acceleration, and public access blocking

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

locals {
  bucket_name = var.bucket_name != "" ? var.bucket_name : "${var.project_name}-${var.environment}"
}

# S3 Bucket
resource "aws_s3_bucket" "website" {
  bucket = local.bucket_name

  tags = {
    Name        = "${var.project_name}-website"
    Environment = var.environment
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
  bucket = aws_s3_bucket.website.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

# S3 Bucket Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "website" {
  count  = length(var.lifecycle_rules) > 0 ? 1 : 0
  bucket = aws_s3_bucket.website.id

  dynamic "rule" {
    for_each = var.lifecycle_rules
    content {
      id     = rule.value.id
      status = rule.value.enabled ? "Enabled" : "Disabled"

      filter {}

      noncurrent_version_expiration {
        noncurrent_days = rule.value.noncurrent_version_expiration_days
      }
    }
  }
}

# Default lifecycle rule when no custom rules provided
resource "aws_s3_bucket_lifecycle_configuration" "website_default" {
  count  = length(var.lifecycle_rules) == 0 ? 1 : 0
  bucket = aws_s3_bucket.website.id

  rule {
    id     = "DeleteOldVersions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# S3 Intelligent Tiering for cost optimization
resource "aws_s3_bucket_intelligent_tiering_configuration" "website" {
  count  = var.enable_intelligent_tiering ? 1 : 0
  bucket = aws_s3_bucket.website.id
  name   = "intelligent-tiering"

  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }

  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180
  }
}

# S3 Bucket Public Access Block (always block public access - use CloudFront OAC instead)
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
    suffix = var.index_document
  }

  error_document {
    key = var.error_document
  }
}

# S3 CORS Configuration
resource "aws_s3_bucket_cors_configuration" "website" {
  count  = length(var.cors_allowed_origins) > 0 ? 1 : 0
  bucket = aws_s3_bucket.website.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = var.cors_allowed_origins
    max_age_seconds = 3600
  }
}
