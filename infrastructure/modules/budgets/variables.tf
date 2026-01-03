# ===================================
# Budget Module Variables
# ===================================

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "riddle-rush"
}

variable "environment" {
  description = "Environment (prod, staging, dev)"
  type        = string

  validation {
    condition     = contains(["prod", "staging", "dev"], var.environment)
    error_message = "Environment must be prod, staging, or dev."
  }
}

variable "monthly_budget_limit" {
  description = "Monthly budget limit in USD"
  type        = string
  default     = "5.00" # Conservative limit for free tier

  validation {
    condition     = can(tonumber(var.monthly_budget_limit)) && tonumber(var.monthly_budget_limit) >= 0
    error_message = "Monthly budget limit must be a positive number."
  }
}

variable "alert_emails" {
  description = "List of email addresses to receive budget alerts"
  type        = list(string)
  default     = []
}

variable "track_free_tier" {
  description = "Enable free tier usage tracking"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}
