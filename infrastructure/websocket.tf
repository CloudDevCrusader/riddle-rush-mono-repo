# WebSocket API Gateway

resource "aws_apigatewayv2_api" "websocket" {
  name                       = "${var.project_name}-websocket-${var.environment}"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"

  tags = {
    Name = "${var.project_name}-websocket-api"
  }
}

# WebSocket API Stage
resource "aws_apigatewayv2_stage" "websocket" {
  api_id      = aws_apigatewayv2_api.websocket.id
  name        = var.environment
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 5000
    throttling_rate_limit  = 10000
  }

  tags = {
    Name = "${var.project_name}-websocket-stage"
  }
}

# CloudWatch Log Group for WebSocket API
resource "aws_cloudwatch_log_group" "websocket_api" {
  name              = "/aws/apigateway/${var.project_name}-websocket-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-websocket-logs"
  }
}

# IAM Role for Lambda Functions
resource "aws_iam_role" "websocket_lambda" {
  name = "${var.project_name}-websocket-lambda-${var.environment}"

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

  tags = {
    Name = "${var.project_name}-websocket-lambda-role"
  }
}

# IAM Policy for Lambda Functions
resource "aws_iam_role_policy" "websocket_lambda" {
  name = "${var.project_name}-websocket-lambda-policy"
  role = aws_iam_role.websocket_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.leaderboard.arn,
          aws_dynamodb_table.performance_metrics.arn,
          aws_dynamodb_table.websocket_connections.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          "${aws_dynamodb_table.leaderboard.arn}/index/*",
          "${aws_dynamodb_table.performance_metrics.arn}/index/*",
          "${aws_dynamodb_table.websocket_connections.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "execute-api:ManageConnections",
          "execute-api:Invoke"
        ]
        Resource = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_apigatewayv2_api.websocket.id}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
      }
    ]
  })
}

# CloudWatch Log Group for Lambda Functions
resource "aws_cloudwatch_log_group" "websocket_connect" {
  name              = "/aws/lambda/${var.project_name}-ws-connect-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-ws-connect-logs"
  }
}

resource "aws_cloudwatch_log_group" "websocket_disconnect" {
  name              = "/aws/lambda/${var.project_name}-ws-disconnect-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-ws-disconnect-logs"
  }
}

resource "aws_cloudwatch_log_group" "websocket_message" {
  name              = "/aws/lambda/${var.project_name}-ws-message-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-ws-message-logs"
  }
}

# Lambda Function - Connect
resource "aws_lambda_function" "websocket_connect" {
  filename         = "${path.module}/lambda/websocket/connect.zip"
  function_name    = "${var.project_name}-ws-connect-${var.environment}"
  role             = aws_iam_role.websocket_lambda.arn
  handler          = "index.handler"
  source_code_hash = fileexists("${path.module}/lambda/websocket/connect.zip") ? filebase64sha256("${path.module}/lambda/websocket/connect.zip") : ""
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      CONNECTIONS_TABLE = aws_dynamodb_table.websocket_connections.name
      ENVIRONMENT       = var.environment
    }
  }

  tags = {
    Name = "${var.project_name}-ws-connect"
  }

  depends_on = [
    aws_cloudwatch_log_group.websocket_connect,
    aws_iam_role_policy.websocket_lambda
  ]
}

# Lambda Function - Disconnect
resource "aws_lambda_function" "websocket_disconnect" {
  filename         = "${path.module}/lambda/websocket/disconnect.zip"
  function_name    = "${var.project_name}-ws-disconnect-${var.environment}"
  role             = aws_iam_role.websocket_lambda.arn
  handler          = "index.handler"
  source_code_hash = fileexists("${path.module}/lambda/websocket/disconnect.zip") ? filebase64sha256("${path.module}/lambda/websocket/disconnect.zip") : ""
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      CONNECTIONS_TABLE = aws_dynamodb_table.websocket_connections.name
      ENVIRONMENT       = var.environment
    }
  }

  tags = {
    Name = "${var.project_name}-ws-disconnect"
  }

  depends_on = [
    aws_cloudwatch_log_group.websocket_disconnect,
    aws_iam_role_policy.websocket_lambda
  ]
}

# Lambda Function - Message Handler
resource "aws_lambda_function" "websocket_message" {
  filename         = "${path.module}/lambda/websocket/message.zip"
  function_name    = "${var.project_name}-ws-message-${var.environment}"
  role             = aws_iam_role.websocket_lambda.arn
  handler          = "index.handler"
  source_code_hash = fileexists("${path.module}/lambda/websocket/message.zip") ? filebase64sha256("${path.module}/lambda/websocket/message.zip") : ""
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 512

  environment {
    variables = {
      CONNECTIONS_TABLE    = aws_dynamodb_table.websocket_connections.name
      USERS_TABLE          = aws_dynamodb_table.users.name
      LEADERBOARD_TABLE    = aws_dynamodb_table.leaderboard.name
      PERFORMANCE_TABLE    = aws_dynamodb_table.performance_metrics.name
      ENVIRONMENT          = var.environment
      CLOUDWATCH_NAMESPACE = "${var.project_name}-${var.environment}"
    }
  }

  tags = {
    Name = "${var.project_name}-ws-message"
  }

  depends_on = [
    aws_cloudwatch_log_group.websocket_message,
    aws_iam_role_policy.websocket_lambda
  ]
}

# Lambda Permissions for API Gateway
resource "aws_lambda_permission" "websocket_connect" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.websocket_connect.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket.execution_arn}/*"
}

resource "aws_lambda_permission" "websocket_disconnect" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.websocket_disconnect.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket.execution_arn}/*"
}

resource "aws_lambda_permission" "websocket_message" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.websocket_message.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket.execution_arn}/*"
}

# WebSocket Routes
resource "aws_apigatewayv2_integration" "connect" {
  api_id           = aws_apigatewayv2_api.websocket.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.websocket_connect.invoke_arn
}

resource "aws_apigatewayv2_integration" "disconnect" {
  api_id           = aws_apigatewayv2_api.websocket.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.websocket_disconnect.invoke_arn
}

resource "aws_apigatewayv2_integration" "message" {
  api_id           = aws_apigatewayv2_api.websocket.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.websocket_message.invoke_arn
}

resource "aws_apigatewayv2_route" "connect" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.connect.id}"
}

resource "aws_apigatewayv2_route" "disconnect" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.disconnect.id}"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.message.id}"
}
