# DynamoDB Tables Module
# Game data tables with PAY_PER_REQUEST billing and point-in-time recovery

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Users table - stores player profiles and game history
resource "aws_dynamodb_table" "users" {
  name         = "${var.project_name}-${var.environment}-users"
  billing_mode = var.billing_mode
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "EmailIndex"
    hash_key        = "email"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  deletion_protection_enabled = var.enable_deletion_protection

  dynamic "stream_specification" {
    for_each = var.enable_streams ? [1] : []
    content {
      stream_enabled   = true
      stream_view_type = var.stream_view_type
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-users"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Leaderboard table - stores game scores and rankings
resource "aws_dynamodb_table" "leaderboard" {
  name         = "${var.project_name}-${var.environment}-leaderboard"
  billing_mode = var.billing_mode
  hash_key     = "gameMode"
  range_key    = "score"

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

  global_secondary_index {
    name            = "UserScoresIndex"
    hash_key        = "userId"
    range_key       = "score"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  deletion_protection_enabled = var.enable_deletion_protection

  dynamic "stream_specification" {
    for_each = var.enable_streams ? [1] : []
    content {
      stream_enabled   = true
      stream_view_type = var.stream_view_type
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-leaderboard"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Performance metrics table - stores game performance and analytics data
resource "aws_dynamodb_table" "performance_metrics" {
  name         = "${var.project_name}-${var.environment}-performance-metrics"
  billing_mode = var.billing_mode
  hash_key     = "metricId"
  range_key    = "timestamp"

  attribute {
    name = "metricId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  attribute {
    name = "gameSessionId"
    type = "S"
  }

  global_secondary_index {
    name            = "GameSessionIndex"
    hash_key        = "gameSessionId"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  deletion_protection_enabled = var.enable_deletion_protection

  dynamic "stream_specification" {
    for_each = var.enable_streams ? [1] : []
    content {
      stream_enabled   = true
      stream_view_type = var.stream_view_type
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-performance-metrics"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# WebSocket connections table - tracks active WebSocket connections with TTL
resource "aws_dynamodb_table" "websocket_connections" {
  name         = "${var.project_name}-${var.environment}-websocket-connections"
  billing_mode = var.billing_mode
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

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  deletion_protection_enabled = var.enable_deletion_protection

  dynamic "stream_specification" {
    for_each = var.enable_streams ? [1] : []
    content {
      stream_enabled   = true
      stream_view_type = var.stream_view_type
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-websocket-connections"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
