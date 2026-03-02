# Lambda SSR Module Variables
# All variables needed to deploy a Lambda function with API Gateway

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (production, staging, development)"
  type        = string
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs22.x"
}

variable "handler" {
  description = "Lambda handler function"
  type        = string
  default     = "index.handler"
}

variable "memory_size" {
  description = "Lambda memory size in MB"
  type        = number
  default     = 512
}

variable "timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "environment_variables" {
  description = "Environment variables for Lambda"
  type        = map(string)
  default     = {}
}

variable "lambda_code_path" {
  description = "Path to Lambda deployment package"
  type        = string
}

variable "dynamodb_table_arns" {
  description = "DynamoDB table ARNs for Lambda permissions"
  type        = list(string)
  default     = []
}

variable "domain_name" {
  description = "Custom domain name for API Gateway (optional)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for custom domain (required if domain_name is set)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}
