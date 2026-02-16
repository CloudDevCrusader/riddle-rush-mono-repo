output "log_group_names" {
  description = "CloudWatch log group names for Lambda functions"
  value       = [for lg in aws_cloudwatch_log_group.lambda : lg.name]
}

output "log_group_arns" {
  description = "CloudWatch log group ARNs for Lambda functions"
  value       = [for lg in aws_cloudwatch_log_group.lambda : lg.arn]
}

output "lambda_log_groups" {
  description = "Lambda log group names mapped by function name"
  value = {
    for fn in var.lambda_function_names :
    fn => "/aws/lambda/${var.project_name}-${var.environment}-${fn}"
  }
}

output "api_gateway_log_group_arn" {
  description = "API Gateway log group ARN (empty string if not created)"
  value       = length(aws_cloudwatch_log_group.api_gateway) > 0 ? aws_cloudwatch_log_group.api_gateway[0].arn : ""
}

output "api_gateway_log_group_name" {
  description = "API Gateway log group name (empty string if not created)"
  value       = length(aws_cloudwatch_log_group.api_gateway) > 0 ? aws_cloudwatch_log_group.api_gateway[0].name : ""
}
