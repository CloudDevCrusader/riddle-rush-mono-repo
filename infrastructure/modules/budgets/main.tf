# ===================================
# AWS Budgets Module
# ===================================
# Free Tier: 2 budgets (free)
# Simple cost tracking to stay within free tier

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ===================================
# Budget for Monthly Costs
# ===================================

resource "aws_budgets_budget" "monthly_cost" {
  name         = "${var.project_name}-${var.environment}-monthly-budget"
  budget_type  = "COST"
  limit_amount = var.monthly_budget_limit
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  # Alert at 80% of budget
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = var.alert_emails
  }

  # Alert at 100% of budget
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = var.alert_emails
  }

  # Forecast alert at 100%
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = var.alert_emails
  }

  cost_filter {
    name   = "TagKeyValue"
    values = ["user:Environment$${var.environment}"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-monthly-budget"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# ===================================
# Budget for Free Tier Usage
# ===================================

resource "aws_budgets_budget" "free_tier_usage" {
  count        = var.track_free_tier ? 1 : 0
  name         = "${var.project_name}-${var.environment}-free-tier-budget"
  budget_type  = "USAGE"
  limit_amount = "1"
  limit_unit   = "Percent"
  time_unit    = "MONTHLY"

  # Alert when approaching free tier limits
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = var.alert_emails
  }

  cost_types {
    include_credit             = false
    include_discount           = false
    include_other_subscription = false
    include_recurring          = false
    include_refund             = false
    include_subscription       = false
    include_support            = false
    include_tax                = false
    include_upfront            = false
    use_blended                = false
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-free-tier-budget"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}
