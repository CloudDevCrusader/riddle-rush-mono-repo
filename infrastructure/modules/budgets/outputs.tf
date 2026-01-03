# ===================================
# Budget Module Outputs
# ===================================

output "monthly_budget_id" {
  description = "ID of the monthly cost budget"
  value       = aws_budgets_budget.monthly_cost.id
}

output "monthly_budget_name" {
  description = "Name of the monthly cost budget"
  value       = aws_budgets_budget.monthly_cost.name
}

output "free_tier_budget_id" {
  description = "ID of the free tier usage budget"
  value       = var.track_free_tier ? aws_budgets_budget.free_tier_usage[0].id : null
}

output "budget_console_url" {
  description = "URL to view budgets in AWS Console"
  value       = "https://console.aws.amazon.com/billing/home#/budgets"
}
