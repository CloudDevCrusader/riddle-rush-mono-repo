# ===================================
# Monitoring Module Outputs
# ===================================

output "sns_topic_arn" {
  description = "ARN of the SNS topic for alerts"
  value       = aws_sns_topic.alerts.arn
}

output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}

output "dashboard_url" {
  description = "URL to access the CloudWatch dashboard"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.app_logs.name
}

output "alarm_names" {
  description = "List of all CloudWatch alarm names"
  value = concat(
    [
      aws_cloudwatch_metric_alarm.s3_4xx_errors.alarm_name,
      aws_cloudwatch_metric_alarm.s3_5xx_errors.alarm_name
    ],
    var.cloudfront_distribution_id != "" ? [
      aws_cloudwatch_metric_alarm.cloudfront_4xx_errors[0].alarm_name,
      aws_cloudwatch_metric_alarm.cloudfront_5xx_errors[0].alarm_name,
      aws_cloudwatch_metric_alarm.cloudfront_cache_hit_rate[0].alarm_name
    ] : []
  )
}
