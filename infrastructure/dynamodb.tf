# DynamoDB Tables for Users, Leaderboard, and Performance

# Users Table
resource "aws_dynamodb_table" "users" {
  name             = "${var.project_name}-users-${var.environment}"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "userId"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "N"
  }

  global_secondary_index {
    name            = "EmailIndex"
    hash_key        = "email"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "CreatedAtIndex"
    hash_key        = "userId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "${var.project_name}-users"
  }
}

# Leaderboard Table
resource "aws_dynamodb_table" "leaderboard" {
  name             = "${var.project_name}-leaderboard-${var.environment}"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "gameMode"
  range_key        = "score"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "gameMode"
    type = "S"
  }

  attribute {
    name = "score"
    type = "N"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  global_secondary_index {
    name            = "UserScoresIndex"
    hash_key        = "userId"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "TimestampIndex"
    hash_key        = "gameMode"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "${var.project_name}-leaderboard"
  }
}

# Performance Metrics Table
resource "aws_dynamodb_table" "performance_metrics" {
  name             = "${var.project_name}-performance-${var.environment}"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "metricId"
  range_key        = "timestamp"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "metricId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "metricName"
    type = "S"
  }

  global_secondary_index {
    name            = "UserMetricsIndex"
    hash_key        = "userId"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "MetricNameIndex"
    hash_key        = "metricName"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "${var.project_name}-performance-metrics"
  }
}

# WebSocket Connection Table
resource "aws_dynamodb_table" "websocket_connections" {
  name         = "${var.project_name}-ws-connections-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "connectionId"

  attribute {
    name = "connectionId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "UserConnectionsIndex"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name = "${var.project_name}-websocket-connections"
  }
}
