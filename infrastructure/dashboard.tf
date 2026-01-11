# CloudWatch Dashboard for Performance Monitoring

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-dashboard-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      # Performance Metrics Overview
      {
        type = "metric"
        properties = {
          metrics = [
            ["${var.project_name}-${var.environment}", "app-init", { stat = "Average" }],
            [".", "page-transition", { stat = "Average" }],
            [".", "vue-setup", { stat = "Average" }],
            [".", "data-fetch", { stat = "Average" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Performance Metrics - Average Duration"
          period  = 300
          yAxis = {
            left = {
              min = 0
            }
          }
        }
        width  = 12
        height = 6
        x      = 0
        y      = 0
      },
      # P99 Performance
      {
        type = "metric"
        properties = {
          metrics = [
            ["${var.project_name}-${var.environment}", "app-init", { stat = "p99" }],
            [".", "page-transition", { stat = "p99" }],
            [".", "vue-setup", { stat = "p99" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Performance Metrics - P99"
          period  = 300
          yAxis = {
            left = {
              min = 0
            }
          }
        }
        width  = 12
        height = 6
        x      = 12
        y      = 0
      },
      # Game Scores by Mode
      {
        type = "metric"
        properties = {
          metrics = [
            ["${var.project_name}-${var.environment}", "GameScore", { stat = "Average", dimensions = { GameMode = "classic" } }],
            ["...", { dimensions = { GameMode = "timed" } }],
            ["...", { dimensions = { GameMode = "endless" } }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Average Game Scores by Mode"
          period  = 300
        }
        width  = 12
        height = 6
        x      = 0
        y      = 6
      },
      # WebSocket Connections
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", { stat = "Sum", dimensions = { FunctionName = aws_lambda_function.websocket_connect.function_name } }],
            ["...", { dimensions = { FunctionName = aws_lambda_function.websocket_disconnect.function_name } }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "WebSocket Connections"
          period  = 300
        }
        width  = 12
        height = 6
        x      = 12
        y      = 6
      },
      # Lambda Function Errors
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Lambda", "Errors", { stat = "Sum", dimensions = { FunctionName = aws_lambda_function.websocket_connect.function_name } }],
            ["...", { dimensions = { FunctionName = aws_lambda_function.websocket_disconnect.function_name } }],
            ["...", { dimensions = { FunctionName = aws_lambda_function.websocket_message.function_name } }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Lambda Function Errors"
          period  = 300
        }
        width  = 12
        height = 6
        x      = 0
        y      = 12
      },
      # Lambda Duration
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", { stat = "Average", dimensions = { FunctionName = aws_lambda_function.websocket_connect.function_name } }],
            ["...", { dimensions = { FunctionName = aws_lambda_function.websocket_disconnect.function_name } }],
            ["...", { dimensions = { FunctionName = aws_lambda_function.websocket_message.function_name } }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Lambda Function Duration"
          period  = 300
          yAxis = {
            left = {
              min = 0
            }
          }
        }
        width  = 12
        height = 6
        x      = 12
        y      = 12
      },
      # DynamoDB Read/Write Capacity
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", { stat = "Sum", dimensions = { TableName = aws_dynamodb_table.performance_metrics.name } }],
            [".", "ConsumedWriteCapacityUnits", { stat = "Sum", dimensions = { TableName = aws_dynamodb_table.performance_metrics.name } }],
            [".", "ConsumedReadCapacityUnits", { stat = "Sum", dimensions = { TableName = aws_dynamodb_table.leaderboard.name } }],
            [".", "ConsumedWriteCapacityUnits", { stat = "Sum", dimensions = { TableName = aws_dynamodb_table.leaderboard.name } }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "DynamoDB Capacity Units"
          period  = 300
        }
        width  = 12
        height = 6
        x      = 0
        y      = 18
      },
      # DynamoDB User Operations
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/DynamoDB", "UserErrors", { stat = "Sum", dimensions = { TableName = aws_dynamodb_table.users.name } }],
            [".", "SystemErrors", { stat = "Sum", dimensions = { TableName = aws_dynamodb_table.users.name } }],
            [".", "UserErrors", { stat = "Sum", dimensions = { TableName = aws_dynamodb_table.leaderboard.name } }],
            [".", "SystemErrors", { stat = "Sum", dimensions = { TableName = aws_dynamodb_table.leaderboard.name } }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "DynamoDB Errors"
          period  = 300
        }
        width  = 12
        height = 6
        x      = 12
        y      = 18
      },
      # Performance Metrics Count
      {
        type = "log"
        properties = {
          query  = <<-EOT
            SOURCE '${aws_cloudwatch_log_group.websocket_message.name}'
            | fields @timestamp, @message
            | filter @message like /Performance logged/
            | stats count() as MetricsLogged by bin(5m)
          EOT
          region = var.aws_region
          title  = "Performance Metrics Logged (Last 24h)"
        }
        width  = 12
        height = 6
        x      = 0
        y      = 24
      },
      # Recent User Activities
      {
        type = "log"
        properties = {
          query  = <<-EOT
            SOURCE '${aws_cloudwatch_log_group.websocket_message.name}'
            | fields @timestamp, @message
            | filter @message like /Leaderboard updated/
            | stats count() as LeaderboardUpdates by bin(5m)
          EOT
          region = var.aws_region
          title  = "Leaderboard Updates (Last 24h)"
        }
        width  = 12
        height = 6
        x      = 12
        y      = 24
      },
      # API Gateway Metrics
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", { stat = "Sum", dimensions = { ApiId = aws_apigatewayv2_api.websocket.id } }],
            [".", "IntegrationLatency", { stat = "Average", dimensions = { ApiId = aws_apigatewayv2_api.websocket.id } }],
            [".", "4xx", { stat = "Sum", dimensions = { ApiId = aws_apigatewayv2_api.websocket.id } }],
            [".", "5xx", { stat = "Sum", dimensions = { ApiId = aws_apigatewayv2_api.websocket.id } }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "WebSocket API Gateway Metrics"
          period  = 300
        }
        width  = 24
        height = 6
        x      = 0
        y      = 30
      }
    ]
  })
}

# CloudWatch Alarms

# High Error Rate Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Lambda function error rate is too high"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.websocket_message.function_name
  }

  tags = {
    Name = "${var.project_name}-lambda-errors-alarm"
  }
}

# High Duration Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "${var.project_name}-lambda-duration-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Average"
  threshold           = 5000
  alarm_description   = "Lambda function duration is too high"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.websocket_message.function_name
  }

  tags = {
    Name = "${var.project_name}-lambda-duration-alarm"
  }
}

# DynamoDB Throttle Alarm
resource "aws_cloudwatch_metric_alarm" "dynamodb_throttles" {
  alarm_name          = "${var.project_name}-dynamodb-throttles-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UserErrors"
  namespace           = "AWS/DynamoDB"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "DynamoDB is being throttled"
  treat_missing_data  = "notBreaching"

  dimensions = {
    TableName = aws_dynamodb_table.performance_metrics.name
  }

  tags = {
    Name = "${var.project_name}-dynamodb-throttles-alarm"
  }
}
