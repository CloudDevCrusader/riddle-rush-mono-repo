variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (production, staging, development)"
  type        = string
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
}

variable "lambda_function_names" {
  description = "Lambda function names for log group creation"
  type        = list(string)
  default     = []
}

variable "api_gateway_id" {
  description = "API Gateway ID for optional log group (set to null to skip)"
  type        = string
  default     = null
}

variable "enable_log_insights" {
  description = "Enable CloudWatch Logs Insights (reserved for future use)"
  type        = bool
  default     = false
}
