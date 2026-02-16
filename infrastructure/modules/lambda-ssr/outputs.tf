# Lambda SSR Module Outputs

output "function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.ssr_handler.function_name
}

output "function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.ssr_handler.arn
}

output "invoke_arn" {
  description = "Lambda invoke ARN for API Gateway"
  value       = aws_lambda_function.ssr_handler.invoke_arn
}

output "role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_exec.arn
}

output "function_url" {
  description = "Lambda Function URL (direct access)"
  value       = aws_lambda_function_url.ssr.function_url
}

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.ssr.id
}

output "custom_domain_url" {
  description = "Custom domain URL (if configured)"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : ""
}

output "custom_domain_target" {
  description = "Custom domain target for DNS (Route53 alias or CNAME)"
  value       = var.domain_name != "" ? aws_apigatewayv2_domain_name.ssr[0].domain_name_configuration[0].target_domain_name : ""
}
