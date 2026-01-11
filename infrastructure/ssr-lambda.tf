# SSR Lambda Deployment
# This enables server-side rendering using AWS Lambda + API Gateway

# Only create SSR resources when enabled
locals {
  ssr_enabled = var.enable_ssr_lambda
}

# Lambda SSR Module
module "lambda_ssr" {
  source = "./modules/lambda-ssr"
  count  = local.ssr_enabled ? 1 : 0

  project_name    = var.project_name
  environment     = var.environment
  lambda_zip_path = "${path.root}/../apps/game/lambda-deploy.zip"

  # Optional: Custom domain for SSR
  domain_name     = var.ssr_domain_name
  certificate_arn = var.ssr_certificate_arn

  # Lambda configuration
  lambda_runtime = "nodejs22.x"
  lambda_memory  = 512
  lambda_timeout = 10

  tags = merge(
    var.tags,
    {
      Component = "SSR"
      Type      = "Lambda"
    }
  )
}

# Outputs for SSR endpoints
output "ssr_lambda_function_url" {
  description = "Direct Lambda Function URL for SSR"
  value       = local.ssr_enabled ? module.lambda_ssr[0].lambda_function_url : null
}

output "ssr_api_gateway_url" {
  description = "API Gateway URL for SSR (better for production)"
  value       = local.ssr_enabled ? module.lambda_ssr[0].api_gateway_url : null
}

output "ssr_custom_domain_url" {
  description = "Custom domain URL for SSR (if configured)"
  value       = local.ssr_enabled && var.ssr_domain_name != "" ? "https://${var.ssr_domain_name}" : null
}
