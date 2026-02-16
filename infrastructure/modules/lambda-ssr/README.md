# Lambda SSR Module

Deploys a Node.js Lambda function for SSR with IAM execution role, CloudWatch logging,
Lambda Function URL, API Gateway HTTP API, and optional custom domain support.

## Features

- AWS Lambda function with configurable runtime, memory, timeout
- IAM execution role with basic Lambda permissions
- Optional DynamoDB access policy (when `dynamodb_table_arns` provided)
- Configurable environment variables (merged with defaults)
- Lambda Function URL for direct access
- API Gateway HTTP API for custom domains and advanced features
- CloudWatch log groups for both Lambda and API Gateway
- Optional custom domain with TLS 1.2

## Usage

```hcl
module "lambda_ssr" {
  source = "./modules/lambda-ssr"

  project_name    = "riddle-rush"
  environment     = "production"
  lambda_code_path = "../../apps/game/lambda-deploy.zip"

  # Optional: customize runtime and resources
  runtime     = "nodejs22.x"
  memory_size = 512
  timeout     = 30
  handler     = "index.handler"

  # Optional: additional environment variables
  environment_variables = {
    APP_VERSION = "1.0.0"
    BASE_URL    = "https://riddlerush.de"
  }

  # Optional: DynamoDB access
  dynamodb_table_arns = [
    "arn:aws:dynamodb:eu-central-1:123456789:table/sessions"
  ]

  # Optional: custom domain
  domain_name     = "game.riddlerush.de"
  certificate_arn = "arn:aws:acm:eu-central-1:123456789:certificate/xxx"

  tags = {
    Application = "Riddle Rush"
  }
}
```

## Variables

| Name                    | Description                                    | Type           | Default           | Required |
| ----------------------- | ---------------------------------------------- | -------------- | ----------------- | -------- |
| `project_name`          | Project name for resource naming               | `string`       | -                 | yes      |
| `environment`           | Environment (production, staging, development) | `string`       | -                 | yes      |
| `lambda_code_path`      | Path to Lambda deployment package              | `string`       | -                 | yes      |
| `runtime`               | Lambda runtime                                 | `string`       | `"nodejs22.x"`    | no       |
| `handler`               | Lambda handler function                        | `string`       | `"index.handler"` | no       |
| `memory_size`           | Lambda memory size in MB                       | `number`       | `512`             | no       |
| `timeout`               | Lambda timeout in seconds                      | `number`       | `30`              | no       |
| `environment_variables` | Environment variables for Lambda               | `map(string)`  | `{}`              | no       |
| `dynamodb_table_arns`   | DynamoDB table ARNs for Lambda permissions     | `list(string)` | `[]`              | no       |
| `domain_name`           | Custom domain name for API Gateway             | `string`       | `""`              | no       |
| `certificate_arn`       | ACM certificate ARN for custom domain          | `string`       | `""`              | no       |
| `tags`                  | Additional tags for resources                  | `map(string)`  | `{}`              | no       |

## Outputs

| Name                   | Description                                   |
| ---------------------- | --------------------------------------------- |
| `function_name`        | Lambda function name                          |
| `function_arn`         | Lambda function ARN                           |
| `invoke_arn`           | Lambda invoke ARN for API Gateway integration |
| `role_arn`             | Lambda execution role ARN                     |
| `function_url`         | Lambda Function URL (direct access)           |
| `api_gateway_url`      | API Gateway endpoint URL                      |
| `api_gateway_id`       | API Gateway ID                                |
| `custom_domain_url`    | Custom domain URL (if configured)             |
| `custom_domain_target` | DNS target for custom domain                  |

## IAM Permissions

The Lambda execution role includes:

- `AWSLambdaBasicExecutionRole` -- CloudWatch Logs write access
- Optional DynamoDB CRUD permissions (when `dynamodb_table_arns` is non-empty)

## Architecture

```
Client Request
    |
    v
API Gateway HTTP API / Lambda Function URL
    |
    v
Lambda Function (Node.js)
    |
    v
SSR Rendering (Nuxt/Nitro)
    |
    v
HTML Response
```

## Deployment

1. Build the Nuxt app: `pnpm run build`
2. Package for Lambda: `cd apps/game/.output/server && zip -r ../../lambda-deploy.zip .`
3. Apply Terraform: `terraform apply`

## Cost Estimation (100k monthly visitors)

- Lambda: ~$0.10/month (free tier covers most)
- API Gateway HTTP API: ~$0.50/month
- CloudWatch Logs: ~$0.50/month
- Total: ~$1.10/month
