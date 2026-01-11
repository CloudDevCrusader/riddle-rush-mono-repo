# Terraform version and provider constraints are in versions.tf
# Uncomment below to use remote state (recommended for production)
# terraform {
#   backend "s3" {
#     bucket         = "riddle-rush-terraform-state"
#     key            = "infrastructure/terraform.tfstate"
#     region         = "eu-central-1"
#     encrypt        = true
#     dynamodb_table = "terraform-state-lock"
#   }
# }

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data source to get current AWS account ID
data "aws_caller_identity" "current" {}

# Data source to get current AWS region
data "aws_region" "current" {}

# S3 Bucket for static website hosting
resource "aws_s3_bucket" "website" {
  bucket = var.bucket_name != "" ? var.bucket_name : "${var.project_name}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "${var.project_name}-website"
  }
}

# Enable S3 Transfer Acceleration for faster uploads/downloads
resource "aws_s3_bucket_accelerate_configuration" "website" {
  bucket = aws_s3_bucket.website.id
  status = "Enabled"
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "website" {
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

    filter {
      prefix = ""
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# Add S3 Intelligent Tiering for cost optimization
resource "aws_s3_bucket_intelligent_tiering_configuration" "website" {
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

# CloudFront Origin Access Control (replaces OAI)
resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${var.project_name}-oac"
  description                       = "OAC for ${var.project_name} S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# S3 Bucket Policy for CloudFront
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.website.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
          }
        }
      }
    ]
  })

  depends_on = [aws_cloudfront_distribution.website]
}

# Custom cache policy for static assets with aggressive caching
resource "aws_cloudfront_cache_policy" "static_assets" {
  name        = "${var.project_name}-static-assets-cache-policy"
  comment     = "Cache policy for static assets with aggressive caching"
  default_ttl = 31536000 # 1 year
  max_ttl     = 31536000 # 1 year
  min_ttl     = 1

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# Custom cache policy for HTML content with shorter TTL
resource "aws_cloudfront_cache_policy" "html_content" {
  name        = "${var.project_name}-html-content-cache-policy"
  comment     = "Cache policy for HTML content with shorter TTL"
  default_ttl = 300  # 5 minutes
  max_ttl     = 3600 # 1 hour
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# CloudFront Response Headers Policy for security
resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "${var.project_name}-security-headers-policy"

  security_headers_config {
    content_security_policy {
      content_security_policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google-analytics.com https://*.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com; font-src 'self'; connect-src 'self' https://*.google-analytics.com https://*.googletagmanager.com; frame-src 'self' https://*.google-analytics.com https://*.googletagmanager.com; object-src 'none'; base-uri 'self'; form-action 'self';"
      override                = true
    }

    strict_transport_security {
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    content_type_options {
      override = true
    }
  }
}

# S3 Bucket for CloudFront logs
resource "aws_s3_bucket" "logs" {
  bucket = "${var.project_name}-cloudfront-logs-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "${var.project_name}-cloudfront-logs"
  }
}

# S3 Bucket Lifecycle for logs
resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "DeleteOldLogs"
    status = "Enabled"

    filter {
      prefix = ""
    }

    expiration {
      days = 90
    }
  }
}

# S3 Bucket Policy for logs
resource "aws_s3_bucket_policy" "logs" {
  bucket = aws_s3_bucket.logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontLogging"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.logs.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}

# CloudFront Function for simple request transformations
resource "aws_cloudfront_function" "request_rewrite" {
  name    = "${var.project_name}-request-rewrite"
  runtime = "cloudfront-js-1.0"
  comment = "Function to rewrite requests for SPA routing"
  publish = true

  code = file("${path.module}/cloudfront-functions/request-rewrite.js")
}

# Add WAF for basic protection
resource "aws_wafv2_web_acl" "cloudfront_waf" {
  name        = "${var.project_name}-cloudfront-waf"
  scope       = "CLOUDFRONT"
  description = "WAF for CloudFront distribution"

  default_action {
    allow {}
  }

  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 0

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-AWSManagedRulesCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-cloudfront-waf"
    sampled_requests_enabled   = true
  }
}

# CloudFront Distribution with enhanced caching and security
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  comment             = "${var.project_name} PWA Distribution"
  default_root_object = "index.html"
  http_version        = "http2and3"
  price_class         = var.cloudfront_price_class

  aliases = var.domain_name != "" ? [var.domain_name] : []

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "S3Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id

    # Origin shield for better cache hit ratio
    origin_shield {
      enabled              = true
      origin_shield_region = var.aws_region
    }
  }

  # WAF association for security
  web_acl_id = aws_wafv2_web_acl.cloudfront_waf.arn

  default_cache_behavior {
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = aws_cloudfront_cache_policy.static_assets.id

    min_ttl     = 0
    default_ttl = 86400    # 1 day
    max_ttl     = 31536000 # 1 year

    # Response headers policy for security
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    # Lambda@Edge for enhanced caching control
    lambda_function_association {
      event_type   = "origin-response"
      lambda_arn   = aws_lambda_function.cache_control.qualified_arn
      include_body = false
    }

    # CloudFront Function for request rewriting
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.request_rewrite.arn
    }
  }

  # HTML files - short cache for dynamic content
  ordered_cache_behavior {
    path_pattern           = "*.html"
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = aws_cloudfront_cache_policy.html_content.id

    min_ttl     = 0
    default_ttl = 300  # 5 minutes
    max_ttl     = 3600 # 1 hour

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id
  }

  # Service Worker - no cache
  ordered_cache_behavior {
    path_pattern           = "sw.js"
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 86400

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id
  }

  # Workbox files - short cache
  ordered_cache_behavior {
    path_pattern           = "workbox-*.js"
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 86400

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id
  }

  # Data files - medium cache
  ordered_cache_behavior {
    path_pattern           = "data/*"
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    min_ttl     = 0
    default_ttl = 3600  # 1 hour
    max_ttl     = 86400 # 1 day

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id
  }

  # Custom error responses for SPA routing
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/404.html"
    error_caching_min_ttl = 300
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 300
  }

  # Viewer certificate
  dynamic "viewer_certificate" {
    for_each = var.certificate_arn != "" ? [1] : []
    content {
      acm_certificate_arn      = var.certificate_arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1.2_2021"
    }
  }

  dynamic "viewer_certificate" {
    for_each = var.certificate_arn == "" ? [1] : []
    content {
      cloudfront_default_certificate = true
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Enable logging
  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.logs.bucket_domain_name
    prefix          = "cloudfront-logs/"
  }

  tags = {
    Name = "${var.project_name}-distribution"
  }
}

