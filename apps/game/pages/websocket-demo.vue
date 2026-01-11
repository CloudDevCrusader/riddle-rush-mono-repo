<template>
  <div class="websocket-demo">
    <div class="demo-header">
      <h1>WebSocket Connection Demo</h1>
      <ConnectionStatus :show-text="true" />
    </div>

    <div class="demo-content">
      <div class="info-card">
        <h2>Connection Info</h2>
        <dl>
          <dt>Status:</dt>
          <dd :class="connectionStatus">{{ connectionStatus }}</dd>

          <dt>User ID:</dt>
          <dd>{{ userId }}</dd>

          <dt>Socket ID:</dt>
          <dd>{{ socket?.id || 'Not connected' }}</dd>

          <dt>Last Pong:</dt>
          <dd>{{ lastPongTime ? new Date(lastPongTime).toLocaleTimeString() : 'N/A' }}</dd>

          <dt>Error:</dt>
          <dd class="error">{{ connectionError || 'None' }}</dd>
        </dl>
      </div>

      <div class="controls-card">
        <h2>Controls</h2>
        <div class="button-group">
          <button :disabled="isConnected" class="btn btn-primary" @click="handleConnect">
            Connect
          </button>
          <button :disabled="!isConnected" class="btn btn-danger" @click="handleDisconnect">
            Disconnect
          </button>
          <button :disabled="!isConnected" class="btn btn-secondary" @click="handlePing">
            Ping Server
          </button>
        </div>
      </div>

      <div class="actions-card">
        <h2>Actions</h2>
        <div class="action-buttons">
          <button :disabled="!isConnected" class="btn btn-info" @click="testPerformanceLog">
            📊 Log Performance
          </button>
          <button :disabled="!isConnected" class="btn btn-success" @click="testLeaderboardUpdate">
            🏆 Update Leaderboard
          </button>
          <button :disabled="!isConnected" class="btn btn-warning" @click="testGetStats">
            📈 Get User Stats
          </button>
        </div>
      </div>

      <div class="logs-card">
        <h2>Activity Log</h2>
        <div ref="logsContainer" class="logs">
          <div v-for="(log, index) in logs" :key="index" class="log-entry" :class="log.type">
            <span class="timestamp">{{ formatTime(log.timestamp) }}</span>
            <span class="message">{{ log.message }}</span>
          </div>
        </div>
        <button class="btn btn-sm" @click="clearLogs">Clear Logs</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useWebSocket } from '~/composables/useWebSocket'

const {
  socket,
  isConnected,
  connectionStatus,
  userId,
  lastPongTime,
  connectionError,
  connect,
  disconnect,
  logPerformance,
  updateLeaderboard,
  getUserStats,
  ping,
} = useWebSocket()

// Activity logs
const logs = ref<Array<{ type: string; message: string; timestamp: number }>>([])
const logsContainer = ref<HTMLElement | null>(null)

const addLog = (type: string, message: string) => {
  logs.value.push({
    type,
    message,
    timestamp: Date.now(),
  })
  // Auto-scroll to bottom
  nextTick(() => {
    if (logsContainer.value) {
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight
    }
  })
}

const clearLogs = () => {
  logs.value = []
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Control handlers
const handleConnect = () => {
  addLog('info', 'Attempting to connect...')
  connect()
}

const handleDisconnect = () => {
  addLog('info', 'Disconnecting...')
  disconnect()
}

const handlePing = () => {
  addLog('info', 'Sending ping...')
  ping()
}

// Action test handlers
const testPerformanceLog = () => {
  const duration = Math.random() * 1000 + 100
  addLog('success', `Logging performance: page-load = ${duration.toFixed(2)}ms`)
  logPerformance('page-load', duration, {
    browser: navigator.userAgent,
    test: true,
  })
}

const testLeaderboardUpdate = () => {
  const score = Math.floor(Math.random() * 10000)
  addLog('success', `Updating leaderboard: score = ${score}`)
  updateLeaderboard('classic', score, 'Test Player')
}

const testGetStats = () => {
  addLog('info', 'Requesting user stats...')
  getUserStats()
}

// Initial log
addLog('info', 'WebSocket demo page loaded')
</script>

<style scoped>
.websocket-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.demo-header h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
}

.demo-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-card,
.controls-card,
.actions-card,
.logs-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logs-card {
  grid-column: 1 / -1;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
}

dt {
  font-weight: 600;
  color: #6b7280;
}

dd {
  color: #111827;
  font-family: monospace;
}

dd.online {
  color: #10b981;
  font-weight: 600;
}

dd.connecting {
  color: #f59e0b;
  font-weight: 600;
}

dd.offline,
dd.error {
  color: #ef4444;
  font-weight: 600;
}

.button-group,
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-info {
  background: #0ea5e9;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #0284c7;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: #e5e7eb;
  color: #374151;
}

.btn-sm:hover {
  background: #d1d5db;
}

.logs {
  max-height: 400px;
  overflow-y: auto;
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.log-entry {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  display: flex;
  gap: 0.75rem;
}

.log-entry.info {
  background: #dbeafe;
  color: #1e40af;
}

.log-entry.success {
  background: #d1fae5;
  color: #065f46;
}

.log-entry.error {
  background: #fee2e2;
  color: #991b1b;
}

.timestamp {
  font-weight: 600;
  white-space: nowrap;
}

.message {
  flex: 1;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .demo-header h1,
  h2,
  dd,
  dt {
    color: #f9fafb;
  }

  .demo-header {
    border-bottom-color: #374151;
  }

  .info-card,
  .controls-card,
  .actions-card,
  .logs-card {
    background: #1f2937;
  }

  .logs {
    background: #111827;
  }
}
</style>
