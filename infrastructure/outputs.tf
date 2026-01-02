output "bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.website.id
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.website.arn
}

output "bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.website.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.website.arn
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "website_url" {
  description = "Website URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "s3_website_url" {
  description = "S3 website URL (if public access enabled)"
  value       = "http://${aws_s3_bucket.website.bucket}.s3-website-${var.aws_region}.amazonaws.com"
}

output "deploy_command" {
  description = "Command to deploy application updates"
  value       = "AWS_S3_BUCKET=${aws_s3_bucket.website.id} AWS_CLOUDFRONT_ID=${aws_cloudfront_distribution.website.id} AWS_REGION=${var.aws_region} ./aws-deploy.sh ${var.environment}"
}

output "terraform_state_info" {
  description = "Information about Terraform state"
  value = {
    bucket_name = aws_s3_bucket.website.id
    region      = var.aws_region
    environment = var.environment
  }
}

