output "bucket_name" {
  description = "S3 bucket name"
  value       = module.website.bucket_name
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = module.website.bucket_arn
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.website.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.website.cloudfront_domain_name
}

output "aws_region" {
  description = "AWS region where resources are deployed"
  value       = var.aws_region
}

output "website_url" {
  description = "Website URL"
  value       = module.website.website_url
}

output "deploy_command" {
  description = "Command to deploy application updates"
  value       = "AWS_S3_BUCKET=${module.website.bucket_name} AWS_CLOUDFRONT_ID=${module.website.cloudfront_distribution_id} AWS_REGION=${var.aws_region} ./aws-deploy.sh development"
}
