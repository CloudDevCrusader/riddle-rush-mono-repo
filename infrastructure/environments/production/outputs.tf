output "website_url" {
  description = "Website URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${module.blue_green.cloudfront_domain_name}"
}

output "deploy_command" {
  description = "Command to deploy application updates"
  value       = "AWS_S3_BUCKET=${module.blue_green.active_bucket_name} AWS_CLOUDFRONT_ID=${module.blue_green.cloudfront_distribution_id} AWS_REGION=${var.aws_region} ./scripts/aws-deploy.sh production"
}

