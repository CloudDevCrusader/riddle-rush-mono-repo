# WebSocket Module
# Creates a WebSocket API Gateway with Lambda integrations for
# $connect, $disconnect, and $default routes.

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# WebSocket API
resource "aws_apigatewayv2_api" "websocket" {
  name                       = "${var.project_name}-${var.environment}-websocket"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = var.route_selection_expression

  tags = {
    Name        = "${var.project_name}-${var.environment}-websocket"
    Environment = var.environment
    Project     = var.project_name
  }
}

# --- $connect route ---

resource "aws_apigatewayv2_integration" "connect" {
  api_id                    = aws_apigatewayv2_api.websocket.id
  integration_type          = "AWS_PROXY"
  integration_uri           = var.connect_lambda_arn
  integration_method        = "POST"
  content_handling_strategy = "CONVERT_TO_TEXT"
}

resource "aws_apigatewayv2_route" "connect" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.connect.id}"
}

resource "aws_lambda_permission" "connect" {
  statement_id  = "AllowWebSocketConnect-${var.project_name}-${var.environment}"
  action        = "lambda:InvokeFunction"
  function_name = var.connect_lambda_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket.execution_arn}/*/$connect"
}

# --- $disconnect route ---

resource "aws_apigatewayv2_integration" "disconnect" {
  api_id                    = aws_apigatewayv2_api.websocket.id
  integration_type          = "AWS_PROXY"
  integration_uri           = var.disconnect_lambda_arn
  integration_method        = "POST"
  content_handling_strategy = "CONVERT_TO_TEXT"
}

resource "aws_apigatewayv2_route" "disconnect" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.disconnect.id}"
}

resource "aws_lambda_permission" "disconnect" {
  statement_id  = "AllowWebSocketDisconnect-${var.project_name}-${var.environment}"
  action        = "lambda:InvokeFunction"
  function_name = var.disconnect_lambda_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket.execution_arn}/*/$disconnect"
}

# --- $default route (message handler) ---

resource "aws_apigatewayv2_integration" "message" {
  api_id                    = aws_apigatewayv2_api.websocket.id
  integration_type          = "AWS_PROXY"
  integration_uri           = var.message_lambda_arn
  integration_method        = "POST"
  content_handling_strategy = "CONVERT_TO_TEXT"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.message.id}"
}

resource "aws_lambda_permission" "message" {
  statement_id  = "AllowWebSocketDefault-${var.project_name}-${var.environment}"
  action        = "lambda:InvokeFunction"
  function_name = var.message_lambda_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket.execution_arn}/*/$default"
}

# --- Deployment and Stage ---

resource "aws_apigatewayv2_deployment" "websocket" {
  api_id = aws_apigatewayv2_api.websocket.id

  triggers = {
    redeployment = sha1(join(",", [
      aws_apigatewayv2_route.connect.id,
      aws_apigatewayv2_route.disconnect.id,
      aws_apigatewayv2_route.default.id,
      aws_apigatewayv2_integration.connect.id,
      aws_apigatewayv2_integration.disconnect.id,
      aws_apigatewayv2_integration.message.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_apigatewayv2_route.connect,
    aws_apigatewayv2_route.disconnect,
    aws_apigatewayv2_route.default,
  ]
}

resource "aws_apigatewayv2_stage" "main" {
  api_id        = aws_apigatewayv2_api.websocket.id
  name          = var.environment
  deployment_id = aws_apigatewayv2_deployment.websocket.id

  default_route_settings {
    throttling_burst_limit = 5000
    throttling_rate_limit  = 10000
    logging_level          = "INFO"
    data_trace_enabled     = var.environment != "production"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-websocket-stage"
    Environment = var.environment
    Project     = var.project_name
  }
}

# --- IAM policy for Lambda to manage WebSocket connections ---

resource "aws_iam_policy" "websocket_manage_connections" {
  name        = "${var.project_name}-${var.environment}-ws-manage-connections"
  description = "Allow Lambda to post messages back to WebSocket clients"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "execute-api:ManageConnections",
        ]
        Resource = "${aws_apigatewayv2_api.websocket.execution_arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan",
          "dynamodb:Query",
        ]
        Resource = var.dynamodb_table_arn
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-ws-manage-connections"
    Environment = var.environment
    Project     = var.project_name
  }
}
