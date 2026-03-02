variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (production, staging, development)"
  type        = string

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be one of: production, staging, development."
  }
}

variable "billing_mode" {
  description = "DynamoDB billing mode (PAY_PER_REQUEST or PROVISIONED)"
  type        = string
  default     = "PAY_PER_REQUEST"

  validation {
    condition     = contains(["PAY_PER_REQUEST", "PROVISIONED"], var.billing_mode)
    error_message = "Billing mode must be PAY_PER_REQUEST or PROVISIONED."
  }
}

variable "enable_streams" {
  description = "Enable DynamoDB streams on all tables"
  type        = bool
  default     = true
}

variable "stream_view_type" {
  description = "DynamoDB stream view type when streams are enabled"
  type        = string
  default     = "NEW_AND_OLD_IMAGES"

  validation {
    condition     = contains(["KEYS_ONLY", "NEW_IMAGE", "OLD_IMAGE", "NEW_AND_OLD_IMAGES"], var.stream_view_type)
    error_message = "Stream view type must be one of: KEYS_ONLY, NEW_IMAGE, OLD_IMAGE, NEW_AND_OLD_IMAGES."
  }
}

variable "enable_point_in_time_recovery" {
  description = "Enable point-in-time recovery for all tables"
  type        = bool
  default     = true
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for all tables"
  type        = bool
  default     = true
}

variable "websocket_ttl_days" {
  description = "TTL for WebSocket connections in days"
  type        = number
  default     = 1

  validation {
    condition     = var.websocket_ttl_days >= 1 && var.websocket_ttl_days <= 30
    error_message = "WebSocket TTL must be between 1 and 30 days."
  }
}
