<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div
        v-if="showDevOverlay.value"
        class="storyboard-overlay"
      >
        <div class="overlay-panel">
          <!-- Header -->
          <div class="overlay-header">
            <h3>📊 Storyboard Dev Tools</h3>
            <button
              class="close-btn"
              aria-label="Close overlay"
              @click="toggleDevOverlay"
            >
              ✕
            </button>
          </div>

          <!-- Stats -->
          <div class="overlay-section">
            <h4>Session Stats</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Duration:</span>
                <span class="stat-value">{{ formatDuration(getSessionDuration()) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Transitions:</span>
                <span class="stat-value">{{ flow.value.totalTransitions }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Avg Time/State:</span>
                <span class="stat-value">{{ getAverageTimePerState() }}s</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Flow Completion:</span>
                <span class="stat-value">{{ getFlowCompletion() }}%</span>
              </div>
            </div>
          </div>

          <!-- Current State -->
          <div class="overlay-section">
            <h4>Current State</h4>
            <div
              v-if="flow.value.currentState"
              class="current-state"
            >
              <div class="state-badge">
                {{ flow.value.currentState.name }}
              </div>
              <div class="state-path">
                {{ flow.value.currentState.path }}
              </div>
            </div>
            <div
              v-else
              class="no-state"
            >
              No state recorded yet
            </div>
          </div>

          <!-- Flow Visualization -->
          <div class="overlay-section">
            <h4>Game Flow Progress</h4>
            <div class="flow-progress">
              <div
                v-for="stateId in getGameFlowPath()"
                :key="stateId"
                class="flow-step"
                :class="{
                  visited: hasVisitedState(stateId),
                  current: flow.value.currentState?.id === stateId,
                }"
              >
                <div class="step-indicator">
                  <span v-if="hasVisitedState(stateId)">✓</span>
                  <span v-else>○</span>
                </div>
                <div class="step-name">
                  {{ getStateName(stateId) }}
                </div>
                <div
                  v-if="hasVisitedState(stateId)"
                  class="step-count"
                >
                  {{ getStateVisitCount(stateId) }}x
                </div>
              </div>
            </div>
          </div>

          <!-- History -->
          <div class="overlay-section">
            <div class="section-header">
              <h4>History (Last {{ Math.min(10, flow.value.history.length) }})</h4>
              <button
                class="action-btn"
                @click="clearHistory"
              >
                Clear
              </button>
            </div>
            <div class="history-list">
              <div
                v-for="(state, index) in recentHistory"
                :key="`${state.id}-${state.timestamp}`"
                class="history-item"
              >
                <span class="history-index">#{{ flow.value.history.length - index }}</span>
                <span class="history-name">{{ state.name }}</span>
                <span class="history-time">{{ formatTime(state.timestamp) }}</span>
              </div>
              <div
                v-if="flow.value.history.length === 0"
                class="no-history"
              >
                No history yet
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="overlay-section">
            <h4>Actions</h4>
            <div class="actions-grid">
              <button
                class="action-btn"
                @click="exportFlow"
              >
                📥 Export Flow
              </button>
              <button
                class="action-btn"
                @click="copyToClipboard"
              >
                📋 Copy Data
              </button>
              <button
                class="action-btn danger"
                @click="handleReset"
              >
                🔄 Reset Flow
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="overlay-footer">
            <small>Press <kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> to toggle</small>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { WorkflowStateId } from '../plugins/storyboard.client'

const {
  flow,
  showDevOverlay,
  toggleDevOverlay,
  getStateVisitCount,
  getGameFlowPath,
  hasVisitedState,
  getFlowCompletion,
  getSessionDuration,
  getAverageTimePerState,
  resetFlow,
  WORKFLOW_STATES,
} = useStoryboard()

const toastStore = useToast()

// Get recent history (last 10)
const recentHistory = computed(() => {
  return flow.value.history.slice(-10).reverse()
})

// Format duration from seconds
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

// Format timestamp
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour12: false })
}

// Get state name by ID
const getStateName = (stateId: WorkflowStateId): string => {
  const state = Object.values(WORKFLOW_STATES).find(
    (s): s is { id: string, name: string, path: string } =>
      typeof s === 'object' && s.id === stateId,
  )
  return state?.name || stateId
}

// Clear history
const clearHistory = () => {
  if (confirm('Are you sure you want to clear the history?')) {
    resetFlow()
    toastStore.success('History cleared')
  }
}

// Export flow data
const exportFlow = () => {
  try {
    const dataStr = JSON.stringify(flow.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `storyboard-flow-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toastStore.success('Flow exported')
  }
  catch (error) {
    console.error('Export error:', error)
    toastStore.error('Failed to export flow')
  }
}

// Copy to clipboard
const copyToClipboard = async () => {
  try {
    const dataStr = JSON.stringify(flow.value, null, 2)
    await navigator.clipboard.writeText(dataStr)
    toastStore.success('Flow data copied to clipboard')
  }
  catch (error) {
    console.error('Copy error:', error)
    toastStore.error('Failed to copy to clipboard')
  }
}

// Handle reset with confirmation
const handleReset = () => {
  if (confirm('Are you sure you want to reset the entire flow? This cannot be undone.')) {
    resetFlow()
    toastStore.success('Flow reset successfully')
  }
}
</script>

<style scoped>
.storyboard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  overflow-y: auto;
}

.overlay-panel {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 2px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-white);
  z-index: 1;
}

.overlay-header h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-dark);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-gray);
  transition: color var(--transition-base);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--color-dark);
}

.overlay-section {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.overlay-section:last-of-type {
  border-bottom: none;
}

.overlay-section h4 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-dark);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.section-header h4 {
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray);
  font-weight: var(--font-weight-medium);
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.current-state {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.state-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary);
  color: var(--color-white);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
  width: fit-content;
}

.state-path {
  font-family: 'Courier New', monospace;
  font-size: var(--font-size-sm);
  color: var(--color-gray);
}

.no-state {
  color: var(--color-gray);
  font-style: italic;
}

.flow-progress {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.flow-step {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background var(--transition-base);
}

.flow-step.visited {
  background: rgba(34, 197, 94, 0.1);
}

.flow-step.current {
  background: rgba(59, 130, 246, 0.2);
  border: 2px solid var(--color-primary);
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-border);
  font-size: var(--font-size-sm);
}

.flow-step.visited .step-indicator {
  background: #22c55e;
  color: white;
}

.flow-step.current .step-indicator {
  background: var(--color-primary);
  color: white;
}

.step-name {
  flex: 1;
  font-weight: var(--font-weight-medium);
}

.step-count {
  font-size: var(--font-size-sm);
  color: var(--color-gray);
  background: var(--color-border);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.history-index {
  color: var(--color-gray);
  font-family: 'Courier New', monospace;
  min-width: 32px;
}

.history-name {
  flex: 1;
  font-weight: var(--font-weight-medium);
}

.history-time {
  color: var(--color-gray);
  font-size: var(--font-size-xs);
  font-family: 'Courier New', monospace;
}

.no-history {
  color: var(--color-gray);
  font-style: italic;
  text-align: center;
  padding: var(--spacing-md);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.action-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: var(--font-size-sm);
}

.action-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.action-btn.danger {
  background: #ef4444;
}

.action-btn.danger:hover {
  background: #dc2626;
}

.overlay-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg);
  text-align: center;
  color: var(--color-gray);
}

.overlay-footer kbd {
  padding: 2px 6px;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: var(--font-size-xs);
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .overlay-panel {
    max-height: 95vh;
  }
}
</style>
