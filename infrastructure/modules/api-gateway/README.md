# API Gateway Module

Creates a REST API Gateway with Lambda integration, CORS support, throttling,
optional API key authentication, and CloudWatch logging.

## Features

- REST API Gateway with regional endpoint
- Lambda proxy integration for error logging
- CORS preflight (OPTIONS) handling
- Configurable throttle burst and rate limits
- Optional API key authentication with usage plan
- CloudWatch access logging via stage configuration
- Deployment with automatic redeployment triggers

## Usage

```hcl
module "api_gateway" {
  source = "./modules/api-gateway"

  project_name    = "riddle-rush"
  environment     = "production"

  # Lambda integration
  lambda_invoke_arn    = module.lambda_ssr.invoke_arn
  lambda_function_name = module.lambda_ssr.function_name

  # CloudWatch logging
  cloudwatch_log_group_arn = module.cloudwatch.log_group_arns[0]

  # Optional: API key
  enable_api_key = true

  # Optional: throttling
  throttle_burst_limit = 5000
  throttle_rate_limit  = 10000

  # Optional: CORS
  enable_cors          = true
  cors_allowed_origins = ["https://riddlerush.de"]
}
```

## Variables

| Name                       | Description                            | Type           | Default | Required |
| -------------------------- | -------------------------------------- | -------------- | ------- | -------- |
| `project_name`             | Project name for resource naming       | `string`       | -       | yes      |
| `environment`              | Environment (production, staging, dev) | `string`       | -       | yes      |
| `lambda_invoke_arn`        | Lambda function invoke ARN             | `string`       | -       | yes      |
| `lambda_function_name`     | Lambda function name                   | `string`       | -       | yes      |
| `cloudwatch_log_group_arn` | CloudWatch log group ARN for logs      | `string`       | -       | yes      |
| `enable_api_key`           | Enable API key authentication          | `bool`         | `true`  | no       |
| `throttle_burst_limit`     | API Gateway throttle burst limit       | `number`       | `5000`  | no       |
| `throttle_rate_limit`      | API Gateway throttle rate limit        | `number`       | `10000` | no       |
| `enable_cors`              | Enable CORS                            | `bool`         | `true`  | no       |
| `cors_allowed_origins`     | CORS allowed origins                   | `list(string)` | `["*"]` | no       |

## Outputs

| Name             | Description                                |
| ---------------- | ------------------------------------------ |
| `api_id`         | API Gateway REST API ID                    |
| `api_arn`        | API Gateway REST API ARN                   |
| `api_endpoint`   | API Gateway endpoint URL                   |
| `api_stage_name` | API Gateway stage name                     |
| `api_key_id`     | API key ID (if enabled)                    |
| `api_key_value`  | API key value (if enabled, sensitive)      |
| `execution_arn`  | API Gateway execution ARN for Lambda perms |

## Architecture

```
Client (POST /errors)
    |
    v
API Gateway REST API
    |-- API Key validation (optional)
    |-- Throttle check (burst/rate)
    |-- CORS preflight (OPTIONS)
    |
    v
Lambda Integration (AWS_PROXY)
    |
    v
Lambda Function
    |
    v
CloudWatch Logs
```

## CORS Configuration

When `enable_cors = true`, the module creates an OPTIONS method with mock integration
that returns the appropriate CORS headers. The `cors_allowed_origins` variable controls
which origins are permitted.

## API Key Authentication

When `enable_api_key = true`:

1. An API key is created
2. A usage plan with throttle settings is created
3. The key is associated with the usage plan
4. Clients must include `x-api-key` header in requests
