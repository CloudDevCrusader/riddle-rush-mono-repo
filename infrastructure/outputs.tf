output "bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.website.id
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.website.arn
}

output "bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.website.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.website.arn
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "website_url" {
  description = "Website URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "s3_website_url" {
  description = "S3 website URL (if public access enabled)"
  value       = "http://${aws_s3_bucket.website.bucket}.s3-website-${var.aws_region}.amazonaws.com"
}

output "deploy_command" {
  description = "Command to deploy application updates"
  value       = "AWS_S3_BUCKET=${aws_s3_bucket.website.id} AWS_CLOUDFRONT_ID=${aws_cloudfront_distribution.website.id} AWS_REGION=${var.aws_region} ./scripts/aws-deploy.sh ${var.environment}"
}

output "terraform_state_info" {
  description = "Information about Terraform state"
  value = {
    bucket_name = aws_s3_bucket.website.id
    region      = var.aws_region
    environment = var.environment
  }
}

output "cloudfront_alarms_topic_arn" {
  description = "ARN of the SNS topic for CloudFront alarms"
  value       = aws_sns_topic.cloudfront_alarms.arn
}

output "cloudwatch_dashboard_url" {
  description = "URL of the CloudWatch dashboard for monitoring"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.cloudfront_monitoring.dashboard_name}"
}

output "lambda_edge_function_arn" {
  description = "ARN of the Lambda@Edge function for cache control"
  value       = aws_lambda_function.cache_control.qualified_arn
}

output "cloudfront_function_arn" {
  description = "ARN of the CloudFront function for request rewriting"
  value       = aws_cloudfront_function.request_rewrite.arn
}

output "waf_arn" {
  description = "ARN of the WAF for CloudFront distribution"
  value       = aws_wafv2_web_acl.cloudfront_waf.arn
}

output "health_check_id" {
  description = "ID of the Route53 health check for CloudFront"
  value       = aws_route53_health_check.cloudfront.id
}

output "s3_acceleration_domain_name" {
  description = "S3 transfer acceleration domain name"
  value       = "${aws_s3_bucket.website.bucket}.s3-accelerate.amazonaws.com"
}

# CloudWatch Error Logs API outputs


output "error_logs_dashboard_url" {
  description = "URL of the CloudWatch dashboard for error logs"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.error_logs.dashboard_name}"
}


# WebSocket Outputs
output "websocket_api_id" {
  description = "WebSocket API Gateway ID"
  value       = aws_apigatewayv2_api.websocket.id
}

output "websocket_api_endpoint" {
  description = "WebSocket API Gateway Endpoint"
  value       = aws_apigatewayv2_api.websocket.api_endpoint
}

output "websocket_url" {
  description = "WebSocket Connection URL"
  value       = aws_apigatewayv2_stage.websocket.invoke_url
}

# DynamoDB Outputs
output "users_table_name" {
  description = "Users DynamoDB Table Name"
  value       = aws_dynamodb_table.users.name
}

output "leaderboard_table_name" {
  description = "Leaderboard DynamoDB Table Name"
  value       = aws_dynamodb_table.leaderboard.name
}

output "performance_table_name" {
  description = "Performance Metrics DynamoDB Table Name"
  value       = aws_dynamodb_table.performance_metrics.name
}

output "websocket_connections_table_name" {
  description = "WebSocket Connections Table Name"
  value       = aws_dynamodb_table.websocket_connections.name
}

# Lambda Outputs
output "websocket_connect_function_name" {
  description = "WebSocket Connect Lambda Function Name"
  value       = aws_lambda_function.websocket_connect.function_name
}

output "websocket_message_function_name" {
  description = "WebSocket Message Lambda Function Name"
  value       = aws_lambda_function.websocket_message.function_name
}

# Dashboard Output
output "performance_dashboard_name" {
  description = "Performance CloudWatch Dashboard Name"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}

output "performance_dashboard_url" {
  description = "Performance CloudWatch Dashboard URL"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

# Route53 Outputs
output "route53_zone_id" {
  description = "Route53 Hosted Zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "route53_name_servers" {
  description = "Route53 Name Servers"
  value       = aws_route53_zone.main.name_servers
}
