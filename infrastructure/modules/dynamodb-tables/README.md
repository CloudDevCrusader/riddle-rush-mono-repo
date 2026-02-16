# DynamoDB Tables Module

Reusable Terraform module for creating DynamoDB tables used by the Riddle Rush game. All tables use PAY_PER_REQUEST billing, point-in-time recovery, and deletion protection by default.

## Purpose

Creates four DynamoDB tables for game data:

- **Users** — Player profiles and game history
- **Leaderboard** — Game scores and rankings by game mode
- **Performance Metrics** — Game performance analytics and telemetry
- **WebSocket Connections** — Active WebSocket connections with automatic TTL cleanup

## Usage

### Basic

```hcl
module "dynamodb" {
  source = "./modules/dynamodb-tables"

  project_name = "riddle-rush"
  environment  = "production"
}
```

### With Custom Configuration

```hcl
module "dynamodb" {
  source = "./modules/dynamodb-tables"

  project_name                  = "riddle-rush"
  environment                   = "staging"
  enable_streams                = false
  enable_deletion_protection    = false
  enable_point_in_time_recovery = false
  websocket_ttl_days            = 7
}
```

## Inputs

| Name                            | Description                               | Type     | Default                | Required |
| ------------------------------- | ----------------------------------------- | -------- | ---------------------- | -------- |
| `project_name`                  | Project name for resource naming          | `string` | -                      | yes      |
| `environment`                   | Environment (production/staging/dev)      | `string` | -                      | yes      |
| `billing_mode`                  | DynamoDB billing mode                     | `string` | `"PAY_PER_REQUEST"`    | no       |
| `enable_streams`                | Enable DynamoDB streams on all tables     | `bool`   | `true`                 | no       |
| `stream_view_type`              | Stream view type when streams enabled     | `string` | `"NEW_AND_OLD_IMAGES"` | no       |
| `enable_point_in_time_recovery` | Enable point-in-time recovery             | `bool`   | `true`                 | no       |
| `enable_deletion_protection`    | Enable deletion protection                | `bool`   | `true`                 | no       |
| `websocket_ttl_days`            | TTL for WebSocket connections (1-30 days) | `number` | `1`                    | no       |

## Outputs

| Name                               | Description                      |
| ---------------------------------- | -------------------------------- |
| `users_table_name`                 | Users table name                 |
| `users_table_arn`                  | Users table ARN                  |
| `leaderboard_table_name`           | Leaderboard table name           |
| `leaderboard_table_arn`            | Leaderboard table ARN            |
| `performance_metrics_table_name`   | Performance metrics table name   |
| `performance_metrics_table_arn`    | Performance metrics table ARN    |
| `websocket_connections_table_name` | WebSocket connections table name |
| `websocket_connections_table_arn`  | WebSocket connections table ARN  |
| `all_table_arns`                   | All table ARNs for IAM policies  |

## Table Structures

### Users Table

| Attribute | Type   | Key  |
| --------- | ------ | ---- |
| `userId`  | String | Hash |
| `email`   | String | GSI  |

**GSI:** `EmailIndex` (hash: email)

### Leaderboard Table

| Attribute  | Type   | Key   |
| ---------- | ------ | ----- |
| `gameMode` | String | Hash  |
| `score`    | Number | Range |
| `userId`   | String | GSI   |

**GSI:** `UserScoresIndex` (hash: userId, range: score)

### Performance Metrics Table

| Attribute       | Type   | Key   |
| --------------- | ------ | ----- |
| `metricId`      | String | Hash  |
| `timestamp`     | Number | Range |
| `gameSessionId` | String | GSI   |

**GSI:** `GameSessionIndex` (hash: gameSessionId, range: timestamp)

### WebSocket Connections Table

| Attribute      | Type   | Key  |
| -------------- | ------ | ---- |
| `connectionId` | String | Hash |
| `userId`       | String | GSI  |
| `ttl`          | Number | TTL  |

**GSI:** `UserConnectionsIndex` (hash: userId)
**TTL:** Enabled on `ttl` attribute (default: 1 day)
