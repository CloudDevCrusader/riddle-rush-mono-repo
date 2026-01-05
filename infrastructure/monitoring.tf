# CloudWatch Alarms for CloudFront Monitoring
resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx_errors" {
  alarm_name          = "${var.project_name}-cloudfront-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = "0.1"
  alarm_description   = "Alarm when CloudFront 5xx error rate exceeds 10%"
  alarm_actions       = [aws_sns_topic.cloudfront_alarms.arn]
  ok_actions          = [aws_sns_topic.cloudfront_alarms.arn]

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website.id
    Region         = "Global"
  }
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_4xx_errors" {
  alarm_name          = "${var.project_name}-cloudfront-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "4xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = "0.2"
  alarm_description   = "Alarm when CloudFront 4xx error rate exceeds 20%"
  alarm_actions       = [aws_sns_topic.cloudfront_alarms.arn]
  ok_actions          = [aws_sns_topic.cloudfront_alarms.arn]

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website.id
    Region         = "Global"
  }
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_latency" {
  alarm_name          = "${var.project_name}-cloudfront-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "3"
  metric_name         = "TotalErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "60"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "Alarm when CloudFront total error rate exceeds 1% for 3 consecutive minutes"
  alarm_actions       = [aws_sns_topic.cloudfront_alarms.arn]
  ok_actions          = [aws_sns_topic.cloudfront_alarms.arn]

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website.id
    Region         = "Global"
  }
}

# SNS Topic for CloudFront Alarms
resource "aws_sns_topic" "cloudfront_alarms" {
  name = "${var.project_name}-cloudfront-alarms"
}

# SNS Topic Policy for CloudFront Alarms
resource "aws_sns_topic_policy" "cloudfront_alarms" {
  arn    = aws_sns_topic.cloudfront_alarms.arn
  policy = data.aws_iam_policy_document.sns_topic_policy.json
}

# IAM Policy Document for SNS Topic
data "aws_iam_policy_document" "sns_topic_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudwatch.amazonaws.com"]
    }

    actions   = ["SNS:Publish"]
    resources = [aws_sns_topic.cloudfront_alarms.arn]
  }
}

# CloudWatch Dashboard for Monitoring
resource "aws_cloudwatch_dashboard" "cloudfront_monitoring" {
  dashboard_name = "${var.project_name}-cloudfront-monitoring"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        x = 0
        y = 0
        width = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", aws_cloudfront_distribution.website.id, "Region", "Global"],
            [".", "BytesDownloaded", ".", ".", ".", "."],
            [".", "BytesUploaded", ".", ".", ".", "."]
          ]
          view = "timeSeries"
          stacked = false
          title = "CloudFront Traffic"
          period = 300
          stat = "Sum"
        }
      },
      {
        type = "metric"
        x = 12
        y = 0
        width = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/CloudFront", "4xxErrorRate", "DistributionId", aws_cloudfront_distribution.website.id, "Region", "Global"],
            [".", "5xxErrorRate", ".", ".", ".", "."]
          ]
          view = "timeSeries"
          stacked = false
          title = "CloudFront Error Rates"
          period = 300
          stat = "Average"
        }
      },
      {
        type = "metric"
        x = 0
        y = 6
        width = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/CloudFront", "TotalErrorRate", "DistributionId", aws_cloudfront_distribution.website.id, "Region", "Global"]
          ]
          view = "timeSeries"
          stacked = false
          title = "CloudFront Total Error Rate"
          period = 60
          stat = "Average"
        }
      },
      {
        type = "metric"
        x = 12
        y = 6
        width = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/CloudFront", "CacheHitRate", "DistributionId", aws_cloudfront_distribution.website.id, "Region", "Global"]
          ]
          view = "timeSeries"
          stacked = false
          title = "CloudFront Cache Hit Rate"
          period = 300
          stat = "Average"
        }
      }
    ]
  })
}

# S3 Bucket Monitoring
resource "aws_cloudwatch_metric_alarm" "s3_bucket_size" {
  alarm_name          = "${var.project_name}-s3-bucket-size"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "BucketSizeBytes"
  namespace           = "AWS/S3"
  period              = "86400" # 24 hours
  statistic           = "Average"
  threshold           = "1073741824" # 1 GB
  alarm_description   = "Alarm when S3 bucket size exceeds 1 GB"
  alarm_actions       = [aws_sns_topic.cloudfront_alarms.arn]
  ok_actions          = [aws_sns_topic.cloudfront_alarms.arn]

  dimensions = {
    BucketName = aws_s3_bucket.website.id
    StorageType = "StandardStorage"
  }
}

# Lambda@Edge for enhanced caching control
resource "aws_lambda_function" "cache_control" {
  filename      = "lambda/cache-control.zip"
  function_name = "${var.project_name}-cache-control"
  role          = aws_iam_role.lambda_edge.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  publish       = true

  environment {
    variables = {
      CACHE_CONTROL_HEADER = "public, max-age=31536000, immutable"
    }
  }
}

resource "aws_iam_role" "lambda_edge" {
  name = "${var.project_name}-lambda-edge-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = ["lambda.amazonaws.com", "edgelambda.amazonaws.com"]
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_edge.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Add Route53 health check for monitoring
resource "aws_route53_health_check" "cloudfront" {
  fqdn              = aws_cloudfront_distribution.website.domain_name
  port              = 443
  type              = "HTTPS"
  resource_path     = "/"
  failure_threshold = 3
  request_interval  = 30

  measure_latency = true

  tags = {
    Name = "${var.project_name}-cloudfront-health-check"
  }
}

