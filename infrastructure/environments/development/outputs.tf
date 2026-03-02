output "bucket_name" {
  description = "S3 bucket name"
  value       = module.s3_website.bucket_id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = module.cloudfront.distribution_domain_name
}

output "website_url" {
  description = "Website URL"
  value       = length(var.domain_names) > 0 ? "https://${var.domain_names[0]}" : "https://${module.cloudfront.distribution_domain_name}"
}

output "deploy_command" {
  description = "Command to deploy application updates"
  value       = "AWS_S3_BUCKET=${module.s3_website.bucket_id} AWS_CLOUDFRONT_ID=${module.cloudfront.distribution_id} AWS_REGION=${var.aws_region} ./scripts/aws-deploy.sh development"
}
