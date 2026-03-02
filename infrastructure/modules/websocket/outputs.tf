output "api_id" {
  description = "WebSocket API ID"
  value       = aws_apigatewayv2_api.websocket.id
}

output "api_endpoint" {
  description = "WebSocket API endpoint URL"
  value       = aws_apigatewayv2_api.websocket.api_endpoint
}

output "stage_name" {
  description = "WebSocket API stage name"
  value       = aws_apigatewayv2_stage.main.name
}

output "invoke_url" {
  description = "Full WebSocket API invoke URL including stage"
  value       = "${aws_apigatewayv2_api.websocket.api_endpoint}/${aws_apigatewayv2_stage.main.name}"
}

output "manage_connections_policy_arn" {
  description = "IAM policy ARN for managing WebSocket connections and DynamoDB access"
  value       = aws_iam_policy.websocket_manage_connections.arn
}
