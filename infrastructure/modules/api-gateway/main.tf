# API Gateway Module
# Creates a REST API Gateway with Lambda integration, CORS, throttling,
# API key authentication, and CloudWatch logging.

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# REST API
resource "aws_api_gateway_rest_api" "error_logging" {
  name        = "${var.project_name}-${var.environment}-api"
  description = "REST API for ${var.project_name} error logging and backend services"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-api"
    Environment = var.environment
    Project     = var.project_name
  }
}

# API resource for error logging endpoint
resource "aws_api_gateway_resource" "errors" {
  rest_api_id = aws_api_gateway_rest_api.error_logging.id
  parent_id   = aws_api_gateway_rest_api.error_logging.root_resource_id
  path_part   = "errors"
}

# POST method for error logging
resource "aws_api_gateway_method" "post_errors" {
  rest_api_id      = aws_api_gateway_rest_api.error_logging.id
  resource_id      = aws_api_gateway_resource.errors.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = var.enable_api_key
}

# Lambda integration for POST /errors
resource "aws_api_gateway_integration" "lambda" {
  rest_api_id             = aws_api_gateway_rest_api.error_logging.id
  resource_id             = aws_api_gateway_resource.errors.id
  http_method             = aws_api_gateway_method.post_errors.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_arn
}

# CORS: OPTIONS method for preflight requests
resource "aws_api_gateway_method" "options_errors" {
  count = var.enable_cors ? 1 : 0

  rest_api_id   = aws_api_gateway_rest_api.error_logging.id
  resource_id   = aws_api_gateway_resource.errors.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# CORS: Mock integration for OPTIONS
resource "aws_api_gateway_integration" "options" {
  count = var.enable_cors ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.error_logging.id
  resource_id = aws_api_gateway_resource.errors.id
  http_method = aws_api_gateway_method.options_errors[0].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# CORS: Method response for OPTIONS
resource "aws_api_gateway_method_response" "options_200" {
  count = var.enable_cors ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.error_logging.id
  resource_id = aws_api_gateway_resource.errors.id
  http_method = aws_api_gateway_method.options_errors[0].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# CORS: Integration response for OPTIONS
resource "aws_api_gateway_integration_response" "options" {
  count = var.enable_cors ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.error_logging.id
  resource_id = aws_api_gateway_resource.errors.id
  http_method = aws_api_gateway_method.options_errors[0].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Api-Key'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${join(",", var.cors_allowed_origins)}'"
  }

  depends_on = [aws_api_gateway_integration.options[0]]
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway-${var.project_name}-${var.environment}"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.error_logging.execution_arn}/*/*"
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.error_logging.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.errors.id,
      aws_api_gateway_method.post_errors.id,
      aws_api_gateway_integration.lambda.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_method.post_errors,
    aws_api_gateway_integration.lambda,
  ]
}

# API Gateway stage
resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.error_logging.id
  stage_name    = var.environment

  access_log_settings {
    destination_arn = var.cloudwatch_log_group_arn
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-stage"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Method settings for throttling and logging
resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.error_logging.id
  stage_name  = aws_api_gateway_stage.main.stage_name
  method_path = "*/*"

  settings {
    throttling_burst_limit = var.throttle_burst_limit
    throttling_rate_limit  = var.throttle_rate_limit
    logging_level          = "INFO"
    data_trace_enabled     = var.environment != "production"
    metrics_enabled        = true
  }
}

# API Key (optional)
resource "aws_api_gateway_api_key" "main" {
  count = var.enable_api_key ? 1 : 0

  name    = "${var.project_name}-${var.environment}-api-key"
  enabled = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-api-key"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Usage plan for API key
resource "aws_api_gateway_usage_plan" "main" {
  count = var.enable_api_key ? 1 : 0

  name = "${var.project_name}-${var.environment}-usage-plan"

  api_stages {
    api_id = aws_api_gateway_rest_api.error_logging.id
    stage  = aws_api_gateway_stage.main.stage_name
  }

  throttle_settings {
    burst_limit = var.throttle_burst_limit
    rate_limit  = var.throttle_rate_limit
  }
}

# Associate API key with usage plan
resource "aws_api_gateway_usage_plan_key" "main" {
  count = var.enable_api_key ? 1 : 0

  key_id        = aws_api_gateway_api_key.main[0].id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.main[0].id
}
