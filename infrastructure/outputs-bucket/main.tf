# Terraform Outputs Bucket
# Stores JSON exports of Terraform outputs for environments.

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "terraform-outputs"
      ManagedBy = "Terraform"
      Purpose   = "Terraform Outputs Storage"
    }
  }
}

data "aws_caller_identity" "current" {}

locals {
  bucket_name = var.bucket_name != "" ? var.bucket_name : "tf-outputs-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket" "outputs" {
  bucket = local.bucket_name

  tags = {
    Name        = "terraform-outputs-bucket"
    Description = "Stores Terraform outputs JSON files"
  }
}

resource "aws_s3_bucket_versioning" "outputs" {
  bucket = aws_s3_bucket.outputs.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "outputs" {
  bucket = aws_s3_bucket.outputs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "outputs" {
  bucket = aws_s3_bucket.outputs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "outputs" {
  bucket = aws_s3_bucket.outputs.id

  rule {
    id     = "ExpireOldVersions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_expiration_days
    }
  }
}
