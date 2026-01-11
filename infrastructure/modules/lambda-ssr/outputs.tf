output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.ssr.arn
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.ssr.function_name
}

output "lambda_function_url" {
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
