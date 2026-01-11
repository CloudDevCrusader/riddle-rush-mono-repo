# CloudWatch Logs API Gateway for error logging

# API Gateway REST API for receiving error logs
resource "aws_api_gateway_rest_api" "error_logs" {
  name        = "${var.project_name}-error-logs-api"
  description = "API for receiving error logs from client applications"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# API Gateway Resource
resource "aws_api_gateway_resource" "logs" {
  rest_api_id = aws_api_gateway_rest_api.error_logs.id
  parent_id   = aws_api_gateway_rest_api.error_logs.root_resource_id
  path_part   = "logs"
}

# API Gateway Method
resource "aws_api_gateway_method" "logs_post" {
  rest_api_id      = aws_api_gateway_rest_api.error_logs.id
  resource_id      = aws_api_gateway_resource.logs.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

# API Gateway Integration with Lambda
resource "aws_api_gateway_integration" "logs_lambda" {
  rest_api_id = aws_api_gateway_rest_api.error_logs.id
  resource_id = aws_api_gateway_resource.logs.id
  http_method = aws_api_gateway_method.logs_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.error_logs_handler.invoke_arn
}

# Lambda Function for processing error logs
resource "aws_lambda_function" "error_logs_handler" {
  filename      = "lambda/error-logs-handler.zip"
  function_name = "${var.project_name}-error-logs-handler"
  role          = aws_iam_role.error_logs_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  memory_size   = 256
  timeout       = 30

  environment {
    variables = {
      LOG_GROUP_NAME = "/aws/lambda/${var.project_name}-error-logs-handler"
      ENVIRONMENT    = var.environment
      APP_NAME       = var.project_name
    }
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "error_logs_lambda" {
  name = "${var.project_name}-error-logs-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "error_logs_lambda" {
  name = "${var.project_name}-error-logs-lambda-policy"
  role = aws_iam_role.error_logs_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.error_logs_handler.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.error_logs.execution_arn}/*/*/*"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "error_logs" {
  depends_on = [aws_api_gateway_integration.logs_lambda]

  rest_api_id = aws_api_gateway_rest_api.error_logs.id
  stage_name  = var.environment
}

# API Gateway API Key
resource "aws_api_gateway_api_key" "error_logs" {
  name = "${var.project_name}-error-logs-api-key"
}

# API Gateway Usage Plan
resource "aws_api_gateway_usage_plan" "error_logs" {
  name        = "${var.project_name}-error-logs-usage-plan"
  description = "Usage plan for error logs API"
  api_stages {
    api_id = aws_api_gateway_rest_api.error_logs.id
    stage  = aws_api_gateway_deployment.error_logs.stage_name
  }
}

# API Gateway Usage Plan Key
resource "aws_api_gateway_usage_plan_key" "error_logs" {
  key_id        = aws_api_gateway_api_key.error_logs.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.error_logs.id
}

# CloudWatch Log Group for error logs
resource "aws_cloudwatch_log_group" "error_logs" {
  name              = "/aws/lambda/${aws_lambda_function.error_logs_handler.function_name}"
  retention_in_days = 30
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.error_logs.id}/${var.environment}"
  retention_in_days = 30
}

# CloudWatch Dashboard for Error Logs
resource "aws_cloudwatch_dashboard" "error_logs" {
  dashboard_name = "${var.project_name}-error-logs"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", "ApiName", aws_api_gateway_rest_api.error_logs.name, "Stage", var.environment, "Resource", "logs", "Method", "POST"]
          ]
          view    = "timeSeries"
          stacked = false
          title   = "Error Log API Requests"
          period  = 300
          stat    = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Latency", "ApiName", aws_api_gateway_rest_api.error_logs.name, "Stage", var.environment, "Resource", "logs", "Method", "POST"]
          ]
          view    = "timeSeries"
          stacked = false
          title   = "Error Log API Latency"
          period  = 300
          stat    = "Average"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "5XXError", "ApiName", aws_api_gateway_rest_api.error_logs.name, "Stage", var.environment, "Resource", "logs", "Method", "POST"]
          ]
          view    = "timeSeries"
          stacked = false
          title   = "Error Log API 5XX Errors"
          period  = 300
          stat    = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Errors", "FunctionName", aws_lambda_function.error_logs_handler.function_name]
          ]
          view    = "timeSeries"
          stacked = false
          title   = "Lambda Error Processing Errors"
          period  = 300
          stat    = "Sum"
        }
      }
    ]
  })
}

# Outputs for the API
output "error_logs_api_endpoint" {
  description = "Endpoint for error logs API"
  value       = "${aws_api_gateway_deployment.error_logs.invoke_url}logs"
}

output "error_logs_api_key" {
  description = "API key for error logs API"
  value       = aws_api_gateway_api_key.error_logs.value
  sensitive   = true
}

output "cloudwatch_log_group_name" {
  description = "CloudWatch log group name for error logs"
  value       = aws_cloudwatch_log_group.error_logs.name
}