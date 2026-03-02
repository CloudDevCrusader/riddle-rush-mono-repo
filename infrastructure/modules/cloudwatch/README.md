# CloudWatch Module

Creates CloudWatch log groups for Lambda functions and API Gateway with
configurable retention periods and consistent tagging. Uses dynamic
`for_each` to create log groups from a list of Lambda function names.

## Features

- Dynamic log group creation from Lambda function names
- Configurable retention period (default: 14 days)
- Optional API Gateway log group
- Consistent tagging across all log groups
- Output mapping for easy reference by function name

## Usage

```hcl
module "cloudwatch" {
  source = "./modules/cloudwatch"

  project_name = "riddle-rush"
  environment  = "production"

  # Lambda log groups
  lambda_function_names = ["ssr-handler", "ws-connect", "ws-disconnect", "ws-message"]

  # Optional: API Gateway logging
  api_gateway_id = module.api_gateway.api_id

  # Optional: retention period
  log_retention_days = 30
}
```

## Variables

| Name                    | Description                              | Type           | Default | Required |
| ----------------------- | ---------------------------------------- | -------------- | ------- | -------- |
| `project_name`          | Project name for resource naming         | `string`       | -       | yes      |
| `environment`           | Environment (production, staging, dev)   | `string`       | -       | yes      |
| `log_retention_days`    | CloudWatch log retention in days         | `number`       | `14`    | no       |
| `lambda_function_names` | Lambda function names for log groups     | `list(string)` | `[]`    | no       |
| `api_gateway_id`        | API Gateway ID for optional log group    | `string`       | `null`  | no       |
| `enable_log_insights`   | Enable CloudWatch Logs Insights (future) | `bool`         | `false` | no       |

## Outputs

| Name                         | Description                                     |
| ---------------------------- | ----------------------------------------------- |
| `log_group_names`            | CloudWatch log group names for Lambda functions |
| `log_group_arns`             | CloudWatch log group ARNs for Lambda functions  |
| `lambda_log_groups`          | Lambda log group names mapped by function name  |
| `api_gateway_log_group_arn`  | API Gateway log group ARN (if created)          |
| `api_gateway_log_group_name` | API Gateway log group name (if created)         |

## Log Group Naming Convention

Log groups follow AWS naming conventions:

- Lambda: `/aws/lambda/{project}-{environment}-{function-name}`
- API Gateway: `/aws/apigateway/{project}-{environment}`

## Retention Policies

Common retention values:

| Days | Use Case                       |
| ---- | ------------------------------ |
| 1    | Development (minimal storage)  |
| 7    | Staging (short-term debugging) |
| 14   | Production default             |
| 30   | Production with audit needs    |
| 90   | Compliance requirements        |

## Integration with Other Modules

```hcl
# Pass CloudWatch outputs to API Gateway module
module "api_gateway" {
  source = "./modules/api-gateway"

  cloudwatch_log_group_arn = module.cloudwatch.api_gateway_log_group_arn
  # ...
}

# Reference Lambda log groups by function name
locals {
  ssr_log_group = module.cloudwatch.lambda_log_groups["ssr-handler"]
}
```
