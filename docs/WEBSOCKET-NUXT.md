# WebSocket Integration with Nuxt

Real-time WebSocket connection using Socket.IO integrated directly into the Nuxt application.

## Features

- ✅ Built-in Socket.IO server in Nuxt
- ✅ Auto-connect on app mount
- ✅ Real-time connection status indicator (green/red/amber)
- ✅ Automatic reconnection with exponential backoff
- ✅ Connection monitoring with ping/pong
- ✅ Performance metric logging
- ✅ Leaderboard updates
- ✅ User statistics retrieval

## Architecture

```
┌──────────────┐         Socket.IO         ┌──────────────┐
│   Browser    │ ◄────────────────────────► │  Nuxt Server │
│   Client     │      WebSocket/Polling     │  (Nitro)     │
└──────────────┘                            └──────────────┘
       │                                            │
       │                                            │
   useWebSocket()                         socket.ts plugin
   composable                              (Server-side)
```

## Installation

Already installed! The following packages are included:

```json
{
  "dependencies": {
    "socket.io-client": "^4.8.3"
  },
  "devDependencies": {
    "socket.io": "^4.8.3"
  }
}
```

## Usage

### 1. Connection Status Indicator

The connection status is automatically shown in the top-right corner of the default layout.

**Status Colors:**
- 🟢 **Green** - Connected  
- 🟡 **Amber** - Connecting  
- 🔴 **Red** - Disconnected/Error  
- ⚫ **Gray** - Offline

### 2. Using the WebSocket Composable

```vue
<script setup lang="ts">
import { useWebSocket } from '~/composables/useWebSocket'

const {
  isConnected,
  connectionStatus,
  statusColor,
  logPerformance,
  updateLeaderboard,
  getUserStats,
} = useWebSocket()
</script>

<template>
  <div>
    <p>Status: {{ connectionStatus }}</p>
    <div :style="{ backgroundColor: statusColor }" />
  </div>
</template>
```

### 3. Log Performance Metrics

```typescript
const { logPerformance } = useWebSocket()

// Log a performance metric
logPerformance('page-load', 1234, {
  browser: 'Chrome',
  version: '120.0',
})
```

### 4. Update Leaderboard

```typescript
const { updateLeaderboard } = useWebSocket()

// Update the leaderboard
updateLeaderboard('classic', 5000, 'Player Name')
```

### 5. Get User Stats

```typescript
const { getUserStats } = useWebSocket()

// Get stats for current user
getUserStats()

// Get stats for specific user
getUserStats('user-123')
```

## API Events

### Client → Server

**1. logPerformance**
```typescript
socket.emit('logPerformance', {
  userId: string,
  metricName: string,
  duration: number,
  timestamp: number,
  metadata: Record<string, any>
})
```

**2. updateLeaderboard**
```typescript
socket.emit('updateLeaderboard', {
  userId: string,
  gameMode: string,
  score: number,
  playerName: string,
  timestamp: number
})
```

**3. getUserStats**
```typescript
socket.emit('getUserStats', {
  userId: string
})
```

**4. ping**
```typescript
socket.emit('ping')
```

### Server → Client

**1. connected**
```typescript
socket.on('connected', (data) => {
  // { socketId, userId, timestamp }
})
```

**2. performanceLogged**
```typescript
socket.on('performanceLogged', (data) => {
  // { success: true, data: {...} }
})
```

**3. leaderboardUpdateConfirm**
```typescript
socket.on('leaderboardUpdateConfirm', (data) => {
  // { success: true, data: {...} }
})
```

**4. leaderboardUpdated** (broadcast)
```typescript
socket.on('leaderboardUpdated', (data) => {
  // Received when any user updates leaderboard
})
```

**5. userStats**
```typescript
socket.on('userStats', (data) => {
  // { userId, performanceMetrics: [], leaderboardEntries: [] }
})
```

**6. pong**
```typescript
socket.on('pong', (data) => {
  // { timestamp }
})
```

## Component: ConnectionStatus

Display connection status anywhere in your app:

```vue
<template>
  <ConnectionStatus :show-text="true" />
</template>
```

**Props:**
- `showText` (boolean) - Show status text alongside indicator

## Demo Page

Visit `/websocket-demo` to see the WebSocket connection in action:

```bash
npm run dev
# Navigate to http://localhost:3000/websocket-demo
```

Features on demo page:
- Real-time connection status
- Manual connect/disconnect controls
- Test performance logging
- Test leaderboard updates
- Test user stats retrieval
- Activity log viewer

## Server Configuration

The Socket.IO server is configured in `server/plugins/socket.ts`:

```typescript
import { Server } from 'socket.io'

export default defineNitroPlugin((nitroApp) => {
  const io = new Server({
    cors: { origin: '*' },
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket) => {
    // Handle connections
  })
})
```

## Auto-Connect Plugin

The app automatically connects on mount via `plugins/websocket.client.ts`:

```typescript
export default defineNuxtPlugin((nuxtApp) => {
  const { connect, startConnectionMonitoring } = useWebSocket()

  nuxtApp.hook('app:mounted', () => {
    connect()
    startConnectionMonitoring()
  })
})
```

## Connection Monitoring

The composable includes built-in connection monitoring:

- Sends ping every 30 seconds
- Tracks last pong timestamp
- Auto-reconnects on disconnect
- Handles page visibility changes

## Integration with Performance Composable

Combine with `usePerformance` for automatic logging:

```vue
<script setup lang="ts">
import { usePerformance } from '~/composables/usePerformance'
import { useWebSocket } from '~/composables/useWebSocket'

const { measureFn } = usePerformance()
const { logPerformance } = useWebSocket()

const loadData = async () => {
  await measureFn('data-load', async () => {
    const data = await fetchData()
    
    // Automatically log to WebSocket
    logPerformance('data-load', performance.now())
    
    return data
  })
}
</script>
```

## Environment Variables

No additional environment variables needed! Socket.IO uses the same Nuxt server.

## Production Deployment

### Option 1: Nitro Server (Recommended)

Deploy as a regular Nuxt app with SSR:

```bash
npm run build
node .output/server/index.mjs
```

Socket.IO will work automatically.

### Option 2: AWS Lambda

For Lambda deployment, you'll need API Gateway WebSocket support.  
See `docs/WEBSOCKET-MONITORING.md` for AWS Lambda integration.

### Option 3: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY .output .
CMD ["node", "server/index.mjs"]
```

## Troubleshooting

### Connection Not Established

1. Check browser console for errors
2. Verify Socket.IO server is running
3. Check CORS settings

```typescript
// In server/plugins/socket.ts
const io = new Server({
  cors: {
    origin: ['http://localhost:3000', 'https://your-domain.com'],
    methods: ['GET', 'POST'],
  },
})
```

### Frequent Disconnections

1. Check network stability
2. Adjust ping interval
3. Review server logs

```typescript
// Increase ping timeout
socket.value = io(socketUrl, {
  reconnectionDelay: 2000,
  reconnectionAttempts: 10,
})
```

### Performance Issues

1. Limit event frequency
2. Batch updates
3. Use debouncing

```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedLog = useDebounceFn((name, duration) => {
  logPerformance(name, duration)
}, 1000)
```

## Best Practices

1. **Always check connection before emitting:**
   ```typescript
   if (isConnected.value) {
     logPerformance('metric', 100)
   }
   ```

2. **Handle reconnection gracefully:**
   ```typescript
   socket.on('connect', () => {
     // Re-subscribe to rooms
     // Re-fetch data if needed
   })
   ```

3. **Clean up listeners:**
   ```typescript
   onUnmounted(() => {
     socket.off('eventName')
   })
   ```

4. **Use rooms for targeted messages:**
   ```typescript
   // Server-side
   socket.join(`user:${userId}`)
   io.to(`user:${userId}`).emit('notification', data)
   ```

## Security Considerations

1. **Validate user identity:**
   ```typescript
   const userId = verifyToken(socket.handshake.query.token)
   ```

2. **Rate limiting:**
   ```typescript
   // Implement rate limiting on server
   const rateLimiter = new Map()
   ```

3. **Input validation:**
   ```typescript
   // Validate all incoming data
   const schema = z.object({ ... })
   schema.parse(data)
   ```

## References

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Nuxt Server Documentation](https://nuxt.com/docs/guide/directory-structure/server)
- [Nitro Documentation](https://nitro.unjs.io/)
