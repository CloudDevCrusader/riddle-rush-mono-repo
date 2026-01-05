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
output "error_logs_api_endpoint" {
  description = "Endpoint for error logs API"
  value       = "${aws_api_gateway_deployment.error_logs.invoke_url}logs"
}

output "error_logs_api_key" {
  description = "API key for error logs API"
  value       = aws_api_gateway_api_key.error_logs.value
  sensitive   = true
}

output "cloudwatch_log_group_name" {
  description = "CloudWatch log group name for error logs"
  value       = aws_cloudwatch_log_group.error_logs.name
}

output "error_logs_dashboard_url" {
  description = "URL of the CloudWatch dashboard for error logs"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.error_logs.dashboard_name}"
}

