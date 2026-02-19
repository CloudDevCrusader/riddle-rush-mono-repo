# Enhanced CloudFront Module
# Optimized for maximum performance with edge caching

# CloudFront Function for SPA routing (rewrite non-file paths to index.html)
resource "aws_cloudfront_function" "request_rewrite" {
  count   = var.enable_spa_rewrite_function ? 1 : 0
  name    = "${var.environment}-request-rewrite"
  runtime = "cloudfront-js-1.0"
  comment = "Rewrite non-file requests to index.html for SPA routing"
  publish = true

  code = file("${path.module}/../../cloudfront-functions/request-rewrite.js")
}

# Enhanced CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${var.environment}-oac-enhanced"
  description                       = "Enhanced OAC for ${var.environment} S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# S3 Bucket Policy for CloudFront
resource "aws_s3_bucket_policy" "website" {
  bucket = replace(var.bucket_arn, "arn:aws:s3:::", "")

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
        Resource = "${var.bucket_arn}/*"
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

# Custom Cache Policy for Static Assets - Aggressive Caching
resource "aws_cloudfront_cache_policy" "static_assets_aggressive" {
  name        = "${var.environment}-static-assets-aggressive"
  comment     = "Aggressive caching for static assets with edge optimization"
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

# Custom Cache Policy for HTML - Short TTL with Edge Optimization
resource "aws_cloudfront_cache_policy" "html_edge_optimized" {
  name        = "${var.environment}-html-edge-optimized"
  comment     = "Edge-optimized caching for HTML with short TTL"
  default_ttl = 60  # 1 minute for edge caching
  max_ttl     = 300 # 5 minutes max
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

# Enhanced CloudFront Distribution with Edge Optimization
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  comment             = "${var.environment} PWA Distribution - Edge Optimized"
  default_root_object = "index.html"
  http_version        = "http2and3"
  price_class         = var.price_class
  is_ipv6_enabled     = true

  # WAF Web ACL - set via variable for CloudFront scope WAFs
  web_acl_id = var.web_acl_arn

  # Support both domain_name (backward compatibility) and domain_names
  aliases = length(var.domain_names) > 0 ? var.domain_names : (var.domain_name != "" ? [var.domain_name] : [])

  origin {
    domain_name              = var.bucket_regional_domain_name
    origin_id                = "S3Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id

    # Origin shield for better cache hit ratio
    origin_shield {
      enabled              = true
      origin_shield_region = "us-east-1" # Best for global performance
    }
  }

  # Default cache behavior - Aggressive caching for static assets
  default_cache_behavior {
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # Use our aggressive cache policy
    cache_policy_id = aws_cloudfront_cache_policy.static_assets_aggressive.id

    # Rewrite SPA routes before origin fetch (optional)
    dynamic "function_association" {
      for_each = var.enable_spa_rewrite_function ? [1] : []
      content {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.request_rewrite[0].arn
      }
    }
  }

  # HTML files - Short TTL for dynamic content with edge optimization
  ordered_cache_behavior {
    path_pattern           = "*.html"
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = aws_cloudfront_cache_policy.html_edge_optimized.id
  }

  # Service Worker - No cache for immediate updates
  ordered_cache_behavior {
    path_pattern           = "sw.js"
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingOptimized
  }

  # Workbox files - Short cache
  ordered_cache_behavior {
    path_pattern           = "workbox-*.js"
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  }

  # Data files - Medium cache with edge optimization
  ordered_cache_behavior {
    path_pattern           = "data/*"
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  }

  # API routes - Short cache for dynamic content
  ordered_cache_behavior {
    path_pattern           = "api/*"
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  }

  # Custom error responses for SPA routing - Edge optimized
  dynamic "custom_error_response" {
    for_each = length(var.custom_error_responses) > 0 ? var.custom_error_responses : [
      {
        error_code            = 404
        response_code         = 200
        response_page_path    = "/404.html"
        error_caching_min_ttl = 10
      }
    ]
    content {
      error_code            = custom_error_response.value.error_code
      response_code         = custom_error_response.value.response_code
      response_page_path    = custom_error_response.value.response_page_path
      error_caching_min_ttl = custom_error_response.value.error_caching_min_ttl
    }
  }

  # Viewer certificate with enhanced security
  dynamic "viewer_certificate" {
    for_each = var.certificate_arn != "" ? [1] : []
    content {
      acm_certificate_arn      = var.certificate_arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1.2_2021" # Most secure available
    }
  }

  dynamic "viewer_certificate" {
    for_each = var.certificate_arn == "" ? [1] : []
    content {
      cloudfront_default_certificate = true
      minimum_protocol_version       = "TLSv1.2_2021"
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Logging disabled for now - can be enabled by adding a logging bucket parameter
  # logging_config {
  #   include_cookies = false
  #   bucket          = var.logging_bucket_domain_name
  #   prefix          = "cloudfront-logs/"
  # }

  # Enable origin failover for resilience
  # origin_group configuration removed - needs proper setup with multiple origins

  tags = {
    Name        = "${var.environment}-distribution-enhanced"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Optimized   = "EdgeCaching"
  }
}
