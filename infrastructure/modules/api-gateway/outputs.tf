# API Gateway Module Outputs

output "api_id" {
  description = "API Gateway REST API ID"
  value       = aws_api_gateway_rest_api.error_logging.id
}

output "api_arn" {
  description = "API Gateway REST API ARN"
  value       = aws_api_gateway_rest_api.error_logging.arn
}

output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_api_gateway_deployment.main.invoke_url
}

output "api_stage_name" {
  description = "API Gateway stage name"
  value       = aws_api_gateway_stage.main.stage_name
}

output "api_key_id" {
  description = "API key ID (if enabled)"
  value       = var.enable_api_key ? aws_api_gateway_api_key.main[0].id : ""
}

output "api_key_value" {
  description = "API key value (if enabled)"
  value       = var.enable_api_key ? aws_api_gateway_api_key.main[0].value : ""
  sensitive   = true
}

output "execution_arn" {
  description = "API Gateway execution ARN for Lambda permissions"
  value       = aws_api_gateway_rest_api.error_logging.execution_arn
}
