# Blue-Green Deployment Module
# Eliminates 404 errors during deployment by using two buckets

# Data sources
data "aws_caller_identity" "current" {}

# Create two S3 buckets (blue and green)
module "s3_blue" {
  source = "../s3-website"
  
  bucket_name                     = "${var.project_name}-${var.environment}-blue-${data.aws_caller_identity.current.account_id}"
  environment                     = "${var.environment}-blue"
  enable_acceleration             = var.environment == "production"
  versioning_enabled              = true
  noncurrent_version_expiration_days = 30
}

module "s3_green" {
  source = "../s3-website"
  
  bucket_name                     = "${var.project_name}-${var.environment}-green-${data.aws_caller_identity.current.account_id}"
  environment                     = "${var.environment}-green"
  enable_acceleration             = var.environment == "production"
  versioning_enabled              = true
  noncurrent_version_expiration_days = 30
}

# CloudFront distribution with switchable origin
module "cloudfront" {
  source = "../cloudfront-enhanced"
  
  bucket_regional_domain_name = var.use_green ? module.s3_green.bucket_regional_domain_name : module.s3_blue.bucket_regional_domain_name
  bucket_arn                  = var.use_green ? module.s3_green.bucket_arn : module.s3_blue.bucket_arn
  environment                 = var.environment
  domain_name                 = var.domain_name
  certificate_arn             = var.certificate_arn
  price_class                 = var.price_class
}

# Outputs
output "blue_bucket_name" {
  value = module.s3_blue.bucket_id
}

output "green_bucket_name" {
  value = module.s3_green.bucket_id
}

output "active_bucket_name" {
  value = var.use_green ? module.s3_green.bucket_id : module.s3_blue.bucket_id
}

output "cloudfront_distribution_id" {
  value = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  value = module.cloudfront.distribution_domain_name
}

output "switch_to_green_command" {
  value = "terraform apply -var=use_green=true"
}

output "switch_to_blue_command" {
  value = "terraform apply -var=use_green=false"
}
