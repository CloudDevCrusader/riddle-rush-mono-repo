# Example: Using Bitwarden secrets in Terraform configuration
# This file demonstrates how to use secrets retrieved from Bitwarden

# Example 1: Using secrets in locals
locals {
  # Access secrets from the bitwarden_secret data source
  db_credentials = {
    username = "admin"
    password = local.secrets["database_password"]
    host     = "${var.project_name}-db.${data.aws_caller_identity.current.account_id}.${var.aws_region}.rds.amazonaws.com"
    port     = 5432
  }

  # Example of building a connection string
  db_connection_string = "postgresql://${local.db_credentials.username}:${local.db_credentials.password}@${local.db_credentials.host}:${local.db_credentials.port}/maindb"
}

# Example 2: Using secrets in AWS resources
# resource "aws_db_instance" "main" {
#   identifier             = "${var.project_name}-db"
#   engine                 = "postgres"
#   engine_version         = "15.4"
#   instance_class         = "db.t3.micro"
#   allocated_storage      = 20
#   username               = local.db_credentials.username
#   password               = local.secrets["database_password"]
#   db_name                = "maindb"
#   skip_final_snapshot    = true
#   publicly_accessible    = false
#   vpc_security_group_ids = [aws_security_group.db.id]
# }

# Example 3: Using secrets for API keys
# resource "aws_api_gateway_api_key" "external_service" {
#   name = "external-service-key"
#   value = local.secrets["api_key"]
# }

# Example 4: Using secrets in Lambda environment variables
# resource "aws_lambda_function" "api_handler" {
#   function_name = "${var.project_name}-api-handler"
#   role          = aws_iam_role.lambda.arn
#   runtime       = "nodejs18.x"
#   handler       = "index.handler"
#   filename      = "lambda.zip"
#
#   environment {
#     variables = {
#       DB_PASSWORD    = local.secrets["database_password"]
#       API_KEY        = local.secrets["api_key"]
#       SMTP_PASSWORD  = local.secrets["smtp_password"]
#     }
#   }
# }

# Example 5: Using secrets in SNS topics
# resource "aws_sns_topic_subscription" "email_alerts" {
#   topic_arn = aws_sns_topic.alerts.arn
#   protocol   = "email"
#   endpoint   = "admin@example.com"
# }

# Example 6: Output sensitive information (will be masked)
# output "database_connection" {
#   description = "Database connection string"
#   value       = local.db_connection_string
#   sensitive   = true
# }

# Note: The examples above are commented out because they require additional
# AWS resources to be defined. Uncomment and adapt them for your use case.
