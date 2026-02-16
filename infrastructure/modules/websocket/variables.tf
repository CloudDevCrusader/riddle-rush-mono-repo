variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (production, staging, development)"
  type        = string
}

variable "connect_lambda_arn" {
  description = "Lambda ARN for $connect route"
  type        = string
}

variable "disconnect_lambda_arn" {
  description = "Lambda ARN for $disconnect route"
  type        = string
}

variable "message_lambda_arn" {
  description = "Lambda ARN for $default (message) route"
  type        = string
}

variable "route_selection_expression" {
  description = "Route selection expression for WebSocket API"
  type        = string
  default     = "$request.body.action"
}

variable "dynamodb_table_arn" {
  description = "DynamoDB table ARN for WebSocket connection tracking"
  type        = string
}
