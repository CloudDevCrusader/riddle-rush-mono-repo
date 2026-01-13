output "bucket_name" {
  description = "Name of the outputs bucket"
  value       = aws_s3_bucket.outputs.id
}

output "bucket_arn" {
  description = "ARN of the outputs bucket"
  value       = aws_s3_bucket.outputs.arn
}

output "bucket_region" {
  description = "Region of the outputs bucket"
  value       = var.aws_region
}
