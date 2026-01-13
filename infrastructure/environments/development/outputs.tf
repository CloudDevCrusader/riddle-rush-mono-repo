output "website_url" {
  description = "Website URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${module.cloudfront.distribution_domain_name}"
}

output "deploy_command" {
  description = "Command to deploy application updates"
  value       = "AWS_S3_BUCKET=${module.s3_website.bucket_id} AWS_CLOUDFRONT_ID=${module.cloudfront.distribution_id} AWS_REGION=${var.aws_region} ./scripts/aws-deploy.sh development"
}
