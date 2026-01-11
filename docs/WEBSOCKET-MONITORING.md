# WebSocket Performance Monitoring Infrastructure

This infrastructure provides real-time performance monitoring and leaderboard tracking using WebSocket connections, DynamoDB, Lambda, and CloudWatch.

## Architecture Overview

```
┌─────────────┐         WebSocket          ┌──────────────────┐
│   Browser   │ ◄────────────────────────► │  API Gateway WS  │
│   Client    │                             │                  │
└─────────────┘                             └──────────────────┘
                                                     │
                                    ┌────────────────┼────────────────┐
                                    │                │                │
                            ┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼────────┐
                            │  Connect λ   │ │ Disconnect λ│ │  Message λ    │
                            └───────┬──────┘ └──────┬──────┘ └──────┬────────┘
                                    │                │                │
                                    └────────────────┼────────────────┘
                                                     │
                                    ┌────────────────┼────────────────┐
                                    │                │                │
                            ┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼────────┐
                            │   DynamoDB   │ │  DynamoDB   │ │   CloudWatch  │
                            │   Tables     │ │  Streams    │ │   Metrics     │
                            └──────────────┘ └─────────────┘ └───────────────┘
                                    │
                            ┌───────▼──────────────────────────┐
                            │   CloudWatch Dashboard           │
                            │   - Performance Metrics          │
                            │   - Leaderboards                 │
                            │   - User Activity                │
                            │   - System Health                │
                            └──────────────────────────────────┘
```

## Components

### 1. DynamoDB Tables

#### Users Table

- **Name**: `riddle-rush-users-{environment}`
- **Keys**: userId (Hash)
- **Indexes**: EmailIndex, CreatedAtIndex
- **Features**: Streams, Point-in-Time Recovery, TTL

#### Leaderboard Table

- **Name**: `riddle-rush-leaderboard-{environment}`
- **Keys**: gameMode (Hash), score (Range)
- **Indexes**: UserScoresIndex, TimestampIndex
- **TTL**: 90 days

#### Performance Metrics Table

- **Name**: `riddle-rush-performance-{environment}`
- **Keys**: metricId (Hash), timestamp (Range)
- **Indexes**: UserMetricsIndex, MetricNameIndex
- **TTL**: 30 days

#### WebSocket Connections Table

- **Name**: `riddle-rush-ws-connections-{environment}`
- **Keys**: connectionId (Hash)
- **Indexes**: UserConnectionsIndex
- **TTL**: 2 hours

### 2. WebSocket API

**Endpoint**: `wss://[api-id].execute-api.[region].amazonaws.com/[stage]`

**Routes**:

- `$connect` - Establishes WebSocket connection
- `$disconnect` - Closes WebSocket connection
- `$default` - Handles all messages

### 3. Lambda Functions

#### Connect Handler

- Stores connection info in DynamoDB
- Associates connection with userId
- Sets TTL for automatic cleanup

#### Disconnect Handler

- Removes connection from DynamoDB
- Cleans up resources

#### Message Handler

Handles three message types:

**1. Log Performance**

```json
{
  "action": "logPerformance",
  "data": {
    "userId": "user123",
    "metricName": "page-load",
    "duration": 1234,
    "timestamp": 1234567890,
    "metadata": {}
  }
}
```

**2. Update Leaderboard**

```json
{
  "action": "updateLeaderboard",
  "data": {
    "userId": "user123",
    "gameMode": "classic",
    "score": 5000,
    "playerName": "John Doe",
    "timestamp": 1234567890
  }
}
```

**3. Get User Stats**

```json
{
  "action": "getUserStats",
  "data": {
    "userId": "user123"
  }
}
```

### 4. CloudWatch Dashboard

**Dashboard Name**: `riddle-rush-dashboard-{environment}`

**Widgets**:

- Performance Metrics (Average & P99)
- Game Scores by Mode
- WebSocket Connections
- Lambda Function Errors & Duration
- DynamoDB Capacity & Errors
- API Gateway Metrics
- Log Insights Queries

### 5. CloudWatch Alarms

- **Lambda Errors**: Triggers when error count > 10
- **Lambda Duration**: Triggers when duration > 5000ms
- **DynamoDB Throttles**: Triggers when throttled

## Deployment

### Prerequisites

```bash
# Install dependencies
npm install -g aws-cdk
```

### 1. Build Lambda Functions

```bash
./scripts/build-websocket-lambdas.sh
```

This will:

- Install npm dependencies for each Lambda
- Create deployment packages (`.zip` files)
- Display package sizes

### 2. Deploy Infrastructure

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### 3. Get Outputs

```bash
terraform output websocket_url
terraform output performance_dashboard_url
```

## Client Integration

### 1. Install WebSocket Client

```bash
npm install ws
```

### 2. Connect to WebSocket

```typescript
// apps/game/composables/useWebSocket.ts
import { ref } from 'vue'

export const useWebSocket = () => {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)

  const connect = (userId: string) => {
    const wsUrl = `${process.env.WEBSOCKET_URL}?userId=${userId}`

    ws.value = new WebSocket(wsUrl)

    ws.value.onopen = () => {
      connected.value = true
      console.log('WebSocket connected')
    }

    ws.value.onclose = () => {
      connected.value = false
      console.log('WebSocket disconnected')
    }

    ws.value.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.value.onmessage = (event) => {
      const message = JSON.parse(event.data)
      console.log('Message received:', message)
    }
  }

  const sendMessage = (action: string, data: any) => {
    if (ws.value && connected.value) {
      ws.value.send(JSON.stringify({ action, data }))
    }
  }

  const logPerformance = (metricName: string, duration: number, metadata = {}) => {
    sendMessage('logPerformance', {
      userId: 'current-user-id', // Get from auth
      metricName,
      duration,
      timestamp: Date.now(),
      metadata,
    })
  }

  const updateLeaderboard = (gameMode: string, score: number, playerName: string) => {
    sendMessage('updateLeaderboard', {
      userId: 'current-user-id',
      gameMode,
      score,
      playerName,
      timestamp: Date.now(),
    })
  }

  const getUserStats = (userId: string) => {
    sendMessage('getUserStats', { userId })
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
    }
  }

  return {
    connected,
    connect,
    disconnect,
    logPerformance,
    updateLeaderboard,
    getUserStats,
  }
}
```

### 3. Use in Components

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useWebSocket } from '~/composables/useWebSocket'
import { usePerformance } from '~/composables/usePerformance'

const { connect, disconnect, logPerformance, updateLeaderboard } = useWebSocket()
const { measureFn } = usePerformance()

onMounted(() => {
  connect('user123')
})

onUnmounted(() => {
  disconnect()
})

const handleGameComplete = async (score: number) => {
  // Log performance
  await measureFn('game-complete', async () => {
    logPerformance('game-duration', performance.now())

    // Update leaderboard
    updateLeaderboard('classic', score, 'Player Name')
  })
}
</script>
```

## Monitoring

### CloudWatch Dashboard

Access your dashboard:

```bash
terraform output performance_dashboard_url
```

### CloudWatch Logs Insights

**Query 1: Top Performance Metrics**

```
fields @timestamp, metricName, duration
| filter @message like /Performance logged/
| stats avg(duration) as avg_duration by metricName
| sort avg_duration desc
| limit 20
```

**Query 2: Leaderboard Activity**

```
fields @timestamp, gameMode, score
| filter @message like /Leaderboard updated/
| stats count() as games, max(score) as high_score by gameMode
```

**Query 3: Error Tracking**

```
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() as error_count by bin(5m)
```

### Metrics

Custom CloudWatch Metrics:

- `app-init` - App initialization time
- `page-transition` - Page transition time
- `GameScore` - Game scores by mode
- All performance metrics from `usePerformance`

## Cost Estimation

### Pay-Per-Request Pricing

**DynamoDB**:

- $1.25 per million write requests
- $0.25 per million read requests
- Storage: $0.25 per GB-month

**API Gateway WebSocket**:

- $1.00 per million messages
- $0.25 per million connection minutes

**Lambda**:

- $0.20 per 1M requests
- $0.0000166667 per GB-second

**CloudWatch**:

- $0.30 per GB ingested
- $0.03 per GB archived

### Example Monthly Cost (1000 active users)

| Service         | Usage          | Cost             |
| --------------- | -------------- | ---------------- |
| DynamoDB Writes | 1M             | $1.25            |
| DynamoDB Reads  | 500K           | $0.13            |
| API Gateway     | 500K messages  | $0.50            |
| Lambda          | 1M invocations | $0.20            |
| CloudWatch      | 5 GB logs      | $1.50            |
| **Total**       |                | **~$3.58/month** |

## Security

- All Lambda functions use IAM roles with least privilege
- DynamoDB tables have encryption at rest enabled
- Point-in-time recovery enabled
- CloudWatch logs retention set to 7 days
- TTL configured for automatic data cleanup

## Troubleshooting

### WebSocket Connection Issues

```bash
# Test WebSocket connection
wscat -c "wss://[api-id].execute-api.[region].amazonaws.com/[stage]?userId=test"
```

### Check Lambda Logs

```bash
aws logs tail /aws/lambda/riddle-rush-ws-message-prod --follow
```

### Query DynamoDB

```bash
aws dynamodb scan --table-name riddle-rush-performance-prod --limit 10
```

### Test CloudWatch Metrics

```bash
aws cloudwatch list-metrics --namespace "riddle-rush-prod"
```

## Maintenance

### Update Lambda Functions

```bash
./scripts/build-websocket-lambdas.sh
cd infrastructure
terraform apply
```

### Backup DynamoDB Tables

```bash
aws dynamodb create-backup \
  --table-name riddle-rush-users-prod \
  --backup-name users-backup-$(date +%Y%m%d)
```

### Clean Old Logs

```bash
aws logs delete-log-group --log-group-name /aws/lambda/old-function
```

## References

- [AWS WebSocket API Documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [CloudWatch Dashboard Guide](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html)
