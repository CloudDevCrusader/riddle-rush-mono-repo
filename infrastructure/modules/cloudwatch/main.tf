# CloudWatch Module
# Creates CloudWatch log groups for Lambda functions and optional API Gateway
# with configurable retention periods and consistent tagging.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# --- Lambda Log Groups ---

resource "aws_cloudwatch_log_group" "lambda" {
  for_each = toset(var.lambda_function_names)

  name              = "/aws/lambda/${var.project_name}-${var.environment}-${each.value}"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-${each.value}-logs"
    Environment = var.environment
    Project     = var.project_name
    Service     = each.value
  }
}

# --- Optional API Gateway Log Group ---

resource "aws_cloudwatch_log_group" "api_gateway" {
  count = var.api_gateway_id != null ? 1 : 0

  name              = "/aws/apigateway/${var.project_name}-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-apigateway-logs"
    Environment = var.environment
    Project     = var.project_name
    Service     = "api-gateway"
  }
}
