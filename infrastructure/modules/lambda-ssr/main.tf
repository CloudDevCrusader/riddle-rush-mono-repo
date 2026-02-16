# Lambda SSR Module
# Deploys a Node.js Lambda function with IAM role, Function URL, API Gateway HTTP API,
# CloudWatch logging, and optional custom domain support.

# IAM Role for Lambda function
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-${var.environment}-ssr-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-ssr-lambda-role"
    }
  )
}

# Attach basic Lambda execution policy (CloudWatch Logs access)
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB access policy (optional, when dynamodb_table_arns is provided)
resource "aws_iam_role_policy" "dynamodb_access" {
  count = length(var.dynamodb_table_arns) > 0 ? 1 : 0

  name = "${var.project_name}-${var.environment}-dynamodb-access"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
      ]
      Resource = var.dynamodb_table_arns
    }]
  })
}

# Lambda function
resource "aws_lambda_function" "ssr_handler" {
  filename         = var.lambda_code_path
  function_name    = "${var.project_name}-${var.environment}-ssr"
  role             = aws_iam_role.lambda_exec.arn
  handler          = var.handler
  source_code_hash = filebase64sha256(var.lambda_code_path)
  runtime          = var.runtime
  memory_size      = var.memory_size
  timeout          = var.timeout

  environment {
    variables = merge(
      {
        NODE_ENV = var.environment == "production" ? "production" : "development"
      },
      var.environment_variables
    )
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-ssr-lambda"
    }
  )
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.ssr_handler.function_name}"
  retention_in_days = var.environment == "production" ? 30 : 7

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-ssr-logs"
    }
  )
}

# Lambda Function URL (simpler than API Gateway for SSR)
resource "aws_lambda_function_url" "ssr" {
  function_name      = aws_lambda_function.ssr_handler.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    max_age           = 86400
  }
}

# API Gateway HTTP API (better for custom domains, logging, throttling)
resource "aws_apigatewayv2_api" "ssr" {
  name          = "${var.project_name}-${var.environment}-ssr-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
    max_age       = 300
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-ssr-api"
    }
  )
}

# API Gateway Integration with Lambda
resource "aws_apigatewayv2_integration" "ssr" {
  api_id                 = aws_apigatewayv2_api.ssr.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.ssr_handler.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# API Gateway Route (catch-all)
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.ssr.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.ssr.id}"
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.ssr.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId               = "$context.requestId"
      ip                      = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      httpMethod              = "$context.httpMethod"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      protocol                = "$context.protocol"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-ssr-stage"
    }
  )
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}-${var.environment}-ssr"
  retention_in_days = var.environment == "production" ? 30 : 7

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-api-gateway-logs"
    }
  )
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ssr_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.ssr.execution_arn}/*/*"
}

# Custom domain (optional)
resource "aws_apigatewayv2_domain_name" "ssr" {
  count = var.domain_name != "" ? 1 : 0

  domain_name = var.domain_name

  domain_name_configuration {
    certificate_arn = var.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-ssr-domain"
    }
  )
}

# API mapping for custom domain
resource "aws_apigatewayv2_api_mapping" "ssr" {
  count = var.domain_name != "" ? 1 : 0

  api_id      = aws_apigatewayv2_api.ssr.id
  domain_name = aws_apigatewayv2_domain_name.ssr[0].id
  stage       = aws_apigatewayv2_stage.default.id
}
