output "bucket_name" {
  description = "Docs S3 bucket name"
  value       = module.s3_website.bucket_id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront_enhanced.distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = module.cloudfront_enhanced.distribution_domain_name
}

output "website_url" {
  description = "Docs website URL"
  value       = "https://${var.domain_name}"
}

output "deploy_command" {
  description = "Command to deploy docs updates"
  value       = "DOCS_S3_BUCKET=${module.s3_website.bucket_id} DOCS_CLOUDFRONT_ID=${module.cloudfront_enhanced.distribution_id} ./scripts/deploy-docs.sh"
}
