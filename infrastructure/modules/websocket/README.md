# WebSocket Module

Creates a WebSocket API Gateway with Lambda integrations for real-time
bidirectional communication. Handles `$connect`, `$disconnect`, and `$default`
routes with separate Lambda handlers and includes an IAM policy for managing
connections and DynamoDB access.

## Features

- WebSocket API Gateway with configurable route selection expression
- Three Lambda integrations: `$connect`, `$disconnect`, `$default` (message)
- Lambda invoke permissions for each route
- Automatic deployment with redeployment triggers
- Stage with configurable throttling and logging
- IAM policy for Lambda to post messages back to WebSocket clients
- DynamoDB permissions for connection tracking

## Usage

```hcl
module "websocket" {
  source = "./modules/websocket"

  project_name = "riddle-rush"
  environment  = "production"

  # Lambda integrations
  connect_lambda_arn    = module.lambda_connect.function_arn
  disconnect_lambda_arn = module.lambda_disconnect.function_arn
  message_lambda_arn    = module.lambda_message.function_arn

  # DynamoDB for connection tracking
  dynamodb_table_arn = module.dynamodb.connections_table_arn

  # Optional: custom route selection
  route_selection_expression = "$request.body.action"
}
```

## Variables

| Name                         | Description                             | Type     | Default                  | Required |
| ---------------------------- | --------------------------------------- | -------- | ------------------------ | -------- |
| `project_name`               | Project name for resource naming        | `string` | -                        | yes      |
| `environment`                | Environment (production, staging, dev)  | `string` | -                        | yes      |
| `connect_lambda_arn`         | Lambda ARN for $connect route           | `string` | -                        | yes      |
| `disconnect_lambda_arn`      | Lambda ARN for $disconnect route        | `string` | -                        | yes      |
| `message_lambda_arn`         | Lambda ARN for $default (message) route | `string` | -                        | yes      |
| `route_selection_expression` | Route selection expression              | `string` | `"$request.body.action"` | no       |
| `dynamodb_table_arn`         | DynamoDB table ARN for connections      | `string` | -                        | yes      |

## Outputs

| Name                            | Description                                          |
| ------------------------------- | ---------------------------------------------------- |
| `api_id`                        | WebSocket API ID                                     |
| `api_endpoint`                  | WebSocket API endpoint URL                           |
| `stage_name`                    | WebSocket API stage name                             |
| `invoke_url`                    | Full invoke URL (endpoint + stage)                   |
| `manage_connections_policy_arn` | IAM policy ARN for managing connections and DynamoDB |

## Architecture

```
Client (WebSocket)
    |
    v
API Gateway WebSocket API
    |-- $connect    --> Lambda (connect handler)
    |-- $disconnect --> Lambda (disconnect handler)
    |-- $default    --> Lambda (message handler)
    |
    v
DynamoDB (connection tracking)
```

## IAM Policy

The module creates an IAM policy (`manage_connections_policy_arn` output) that grants:

- `execute-api:ManageConnections` — Post messages back to connected WebSocket clients
- DynamoDB CRUD operations — Track active connections in a DynamoDB table

Attach this policy to any Lambda execution role that needs to send messages to WebSocket clients.

## Routes

| Route Key     | Purpose                            | Handler           |
| ------------- | ---------------------------------- | ----------------- |
| `$connect`    | Client connection established      | Connect Lambda    |
| `$disconnect` | Client disconnected                | Disconnect Lambda |
| `$default`    | All messages (routed by selection) | Message Lambda    |

## Stage Configuration

The stage includes:

- Throttling: 5,000 burst / 10,000 rate limit
- Logging level: INFO
- Data trace: Enabled in non-production environments
