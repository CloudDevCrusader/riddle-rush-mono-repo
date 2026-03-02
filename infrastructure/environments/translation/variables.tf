variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-central-1"
}

variable "instance_type" {
  description = "EC2 instance type for the Tolgee server"
  type        = string
  default     = "t4g.small"
}

variable "domain_name" {
  description = "The domain name for the Tolgee UI"
  type        = string
  default     = "translation.riddlerush.de"
}

variable "ssh_public_key" {
  description = "Public key for SSH access to the EC2 instance"
  type        = string
  sensitive   = true
}

variable "ssh_allowed_cidr" {
  description = "CIDR block allowed for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "tolgee_admin_password" {
  description = "Initial admin password for the Tolgee UI"
  type        = string
  sensitive   = true
}

variable "volume_size" {
  description = "Size of the EBS root volume in GB"
  type        = number
  default     = 20
}
