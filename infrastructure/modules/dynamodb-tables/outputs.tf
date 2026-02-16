output "users_table_name" {
  description = "Users table name"
  value       = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  description = "Users table ARN"
  value       = aws_dynamodb_table.users.arn
}

output "leaderboard_table_name" {
  description = "Leaderboard table name"
  value       = aws_dynamodb_table.leaderboard.name
}

output "leaderboard_table_arn" {
  description = "Leaderboard table ARN"
  value       = aws_dynamodb_table.leaderboard.arn
}

output "performance_metrics_table_name" {
  description = "Performance metrics table name"
  value       = aws_dynamodb_table.performance_metrics.name
}

output "performance_metrics_table_arn" {
  description = "Performance metrics table ARN"
  value       = aws_dynamodb_table.performance_metrics.arn
}

output "websocket_connections_table_name" {
  description = "WebSocket connections table name"
  value       = aws_dynamodb_table.websocket_connections.name
}

output "websocket_connections_table_arn" {
  description = "WebSocket connections table ARN"
  value       = aws_dynamodb_table.websocket_connections.arn
}

output "all_table_arns" {
  description = "All DynamoDB table ARNs for IAM policy attachment"
  value = [
    aws_dynamodb_table.users.arn,
    aws_dynamodb_table.leaderboard.arn,
    aws_dynamodb_table.performance_metrics.arn,
    aws_dynamodb_table.websocket_connections.arn,
  ]
}
