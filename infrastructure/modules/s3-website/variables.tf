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

variable "bucket_name" {
  description = "Custom S3 bucket name (leave empty for auto-generated: project_name-environment)"
  type        = string
  default     = ""
}

variable "enable_versioning" {
  description = "Enable versioning on S3 bucket"
  type        = bool
  default     = true
}

variable "enable_acceleration" {
  description = "Enable S3 Transfer Acceleration for faster uploads/downloads"
  type        = bool
  default     = false
}

variable "enable_intelligent_tiering" {
  description = "Enable S3 Intelligent Tiering for cost optimization"
  type        = bool
  default     = false
}

variable "lifecycle_rules" {
  description = "S3 lifecycle rules for version management"
  type = list(object({
    id                                 = string
    enabled                            = bool
    noncurrent_version_expiration_days = number
  }))
  default = []
}

variable "cors_allowed_origins" {
  description = "CORS allowed origins (empty list disables CORS)"
  type        = list(string)
  default     = []
}

variable "index_document" {
  description = "Index document for website configuration"
  type        = string
  default     = "index.html"
}

variable "error_document" {
  description = "Error document for website configuration"
  type        = string
  default     = "404.html"
}
