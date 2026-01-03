# ===================================
# CloudWatch Monitoring Module
# ===================================
# Free Tier Compliant:
# - 10 custom metrics (free)
# - 10 alarms (free)
# - 5GB log ingestion (free)
# - 1M API requests (free)

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ===================================
# SNS Topics for Alerts
# ===================================

resource "aws_sns_topic" "alerts" {
  name         = "${var.project_name}-${var.environment}-alerts"
  display_name = "Riddle Rush ${title(var.environment)} Alerts"

  tags = {
    Name        = "${var.project_name}-${var.environment}-alerts"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_sns_topic_subscription" "email_alerts" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ===================================
# CloudWatch Alarms - S3
# ===================================

# Alarm: High 4xx error rate on S3
resource "aws_cloudwatch_metric_alarm" "s3_4xx_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-s3-high-4xx-errors"
  alarm_description   = "Alert when S3 4xx error rate is high (client errors)"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "4xxErrors"
  namespace           = "AWS/S3"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = 100 # Alert if more than 100 errors in 10 minutes
  treat_missing_data  = "notBreaching"

  dimensions = {
    BucketName = var.s3_bucket_name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Name        = "${var.project_name}-${var.environment}-s3-4xx-errors"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Alarm: High 5xx error rate on S3
resource "aws_cloudwatch_metric_alarm" "s3_5xx_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-s3-high-5xx-errors"
  alarm_description   = "Alert when S3 5xx error rate is high (server errors)"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5xxErrors"
  namespace           = "AWS/S3"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = 10 # Alert if any server errors
  treat_missing_data  = "notBreaching"

  dimensions = {
    BucketName = var.s3_bucket_name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Name        = "${var.project_name}-${var.environment}-s3-5xx-errors"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ===================================
# CloudWatch Alarms - CloudFront
# ===================================

# Alarm: High 4xx error rate on CloudFront
resource "aws_cloudwatch_metric_alarm" "cloudfront_4xx_errors" {
  count               = var.cloudfront_distribution_id != "" ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-cloudfront-high-4xx-errors"
  alarm_description   = "Alert when CloudFront 4xx error rate is high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "4xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300 # 5 minutes
  statistic           = "Average"
  threshold           = 10 # Alert if 4xx error rate > 10%
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = var.cloudfront_distribution_id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudfront-4xx-errors"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Alarm: High 5xx error rate on CloudFront
resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx_errors" {
  count               = var.cloudfront_distribution_id != "" ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-cloudfront-high-5xx-errors"
  alarm_description   = "Alert when CloudFront 5xx error rate is high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300 # 5 minutes
  statistic           = "Average"
  threshold           = 5 # Alert if 5xx error rate > 5%
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = var.cloudfront_distribution_id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudfront-5xx-errors"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Alarm: CloudFront Cache Hit Rate Too Low
resource "aws_cloudwatch_metric_alarm" "cloudfront_cache_hit_rate" {
  count               = var.cloudfront_distribution_id != "" ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-cloudfront-low-cache-hit-rate"
  alarm_description   = "Alert when CloudFront cache hit rate is low (< 80%)"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CacheHitRate"
  namespace           = "AWS/CloudFront"
  period              = 900 # 15 minutes
  statistic           = "Average"
  threshold           = 80 # Alert if cache hit rate < 80%
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = var.cloudfront_distribution_id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudfront-cache-hit-rate"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ===================================
# CloudWatch Dashboard
# ===================================

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = concat(
      [
        # S3 Request Metrics
        {
          type = "metric"
          properties = {
            metrics = [
              ["AWS/S3", "AllRequests", { stat = "Sum", label = "Total Requests" }],
              [".", "GetRequests", { stat = "Sum", label = "GET Requests" }],
              [".", "PutRequests", { stat = "Sum", label = "PUT Requests" }]
            ]
            period  = 300
            stat    = "Sum"
            region  = var.aws_region
            title   = "S3 Requests"
            yAxis   = { left = { min = 0 } }
            stacked = false
          }
          x      = 0
          y      = 0
          width  = 12
          height = 6
        },
        # S3 Error Metrics
        {
          type = "metric"
          properties = {
            metrics = [
              ["AWS/S3", "4xxErrors", { stat = "Sum", label = "4xx Errors" }],
              [".", "5xxErrors", { stat = "Sum", label = "5xx Errors" }]
            ]
            period = 300
            stat   = "Sum"
            region = var.aws_region
            title  = "S3 Errors"
            yAxis  = { left = { min = 0 } }
          }
          x      = 12
          y      = 0
          width  = 12
          height = 6
        }
      ],
      var.cloudfront_distribution_id != "" ? [
        # CloudFront Request Metrics
        {
          type = "metric"
          properties = {
            metrics = [
              ["AWS/CloudFront", "Requests", { stat = "Sum", label = "Total Requests" }]
            ]
            period = 300
            stat   = "Sum"
            region = "us-east-1" # CloudFront metrics are only in us-east-1
            title  = "CloudFront Requests"
            yAxis  = { left = { min = 0 } }
            dimensions = {
              DistributionId = var.cloudfront_distribution_id
            }
          }
          x      = 0
          y      = 6
          width  = 8
          height = 6
        },
        # CloudFront Error Rate
        {
          type = "metric"
          properties = {
            metrics = [
              ["AWS/CloudFront", "4xxErrorRate", { stat = "Average", label = "4xx Error Rate" }],
              [".", "5xxErrorRate", { stat = "Average", label = "5xx Error Rate" }]
            ]
            period = 300
            stat   = "Average"
            region = "us-east-1"
            title  = "CloudFront Error Rates (%)"
            yAxis  = { left = { min = 0, max = 100 } }
            dimensions = {
              DistributionId = var.cloudfront_distribution_id
            }
          }
          x      = 8
          y      = 6
          width  = 8
          height = 6
        },
        # CloudFront Cache Hit Rate
        {
          type = "metric"
          properties = {
            metrics = [
              ["AWS/CloudFront", "CacheHitRate", { stat = "Average", label = "Cache Hit Rate" }]
            ]
            period = 300
            stat   = "Average"
            region = "us-east-1"
            title  = "CloudFront Cache Hit Rate (%)"
            yAxis  = { left = { min = 0, max = 100 } }
            dimensions = {
              DistributionId = var.cloudfront_distribution_id
            }
          }
          x      = 16
          y      = 6
          width  = 8
          height = 6
        },
        # CloudFront Data Transfer
        {
          type = "metric"
          properties = {
            metrics = [
              ["AWS/CloudFront", "BytesDownloaded", { stat = "Sum", label = "Bytes Downloaded" }]
            ]
            period = 300
            stat   = "Sum"
            region = "us-east-1"
            title  = "CloudFront Data Transfer"
            yAxis  = { left = { min = 0 } }
            dimensions = {
              DistributionId = var.cloudfront_distribution_id
            }
          }
          x      = 0
          y      = 12
          width  = 24
          height = 6
        }
      ] : []
    )
  })
}

# ===================================
# CloudWatch Log Group (for future use)
# ===================================

resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/${var.project_name}/${var.environment}"
  retention_in_days = 7 # Keep logs for 7 days (free tier: 5GB)

  tags = {
    Name        = "${var.project_name}-${var.environment}-logs"
    Environment = var.environment
    Project     = var.project_name
  }
}
