<template>
  <Transition name="debug">
    <div
      v-if="settingsStore.isDebugMode"
      class="debug-panel"
    >
      <header class="debug-header">
        <span>🔧 Debug Mode</span>
        <button
          class="minimize-btn"
          @click="minimized = !minimized"
        >
          {{ minimized ? '▲' : '▼' }}
        </button>
      </header>

      <div
        v-if="!minimized"
        class="debug-content"
      >
        <section class="debug-section">
          <h4>Game State</h4>
          <div class="stat-row">
            <span>Session Active:</span>
            <span :class="gameStore.hasActiveSession ? 'status-ok' : 'status-off'">
              {{ gameStore.hasActiveSession ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="stat-row">
            <span>Current Score:</span>
            <span>{{ gameStore.currentScore }}</span>
          </div>
          <div class="stat-row">
            <span>Attempts:</span>
            <span>{{ gameStore.currentAttempts.length }}</span>
          </div>
          <div class="stat-row">
            <span>Categories Loaded:</span>
            <span>{{ gameStore.categoriesLoaded ? gameStore.categories.length : 0 }}</span>
          </div>
        </section>

        <section class="debug-section">
          <h4>Network</h4>
          <div class="stat-row">
            <span>Online:</span>
            <span :class="gameStore.isOnline ? 'status-ok' : 'status-error'">
              {{ gameStore.isOnline ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="stat-row">
            <span>Offline Mode:</span>
            <span>{{ settingsStore.offlineMode ? 'Forced' : 'Auto' }}</span>
          </div>
        </section>

        <section class="debug-section">
          <h4>Settings</h4>
          <div class="stat-row">
            <span>Leaderboard:</span>
            <span>{{ settingsStore.leaderboardEnabled ? 'On' : 'Off' }}</span>
          </div>
          <div class="stat-row">
            <span>Sound:</span>
            <span>{{ settingsStore.soundEnabled ? 'On' : 'Off' }}</span>
          </div>
          <div class="stat-row">
            <span>Max Players:</span>
            <span>{{ settingsStore.maxPlayersPerGame }}</span>
          </div>
        </section>

        <section class="debug-section">
          <h4>Statistics</h4>
          <div class="stat-row">
            <span>History Games:</span>
            <span>{{ gameStore.history.length }}</span>
          </div>
          <div
            v-if="stats"
            class="stat-row"
          >
            <span>Total Score:</span>
            <span>{{ stats.totalScore }}</span>
          </div>
          <div
            v-if="stats"
            class="stat-row"
          >
            <span>Best Score:</span>
            <span>{{ stats.bestScore }}</span>
          </div>
          <div
            v-if="stats"
            class="stat-row"
          >
            <span>Accuracy:</span>
            <span>{{ accuracy }}%</span>
          </div>
        </section>

        <section class="debug-section">
          <h4>PWA</h4>
          <div class="stat-row">
            <span>SW Registered:</span>
            <span :class="swRegistered ? 'status-ok' : 'status-off'">
              {{ swRegistered ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="stat-row">
            <span>Installable:</span>
            <span>{{ gameStore.canInstall ? 'Yes' : 'No' }}</span>
          </div>
        </section>

        <div class="debug-actions">
          <button
            class="action-btn"
            @click="refreshStats"
          >
            ↻ Refresh
          </button>
          <button
            class="action-btn"
            @click="clearStorage"
          >
            🗑️ Clear Data
          </button>
          <button
            class="action-btn"
            @click="exportDebugInfo"
          >
            📋 Export
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { GameStatistics } from '~/types/game'
import { useGameStore } from '~/stores/game'
import { useSettingsStore } from '~/stores/settings'
import { useIndexedDB } from '~/composables/useIndexedDB'

const gameStore = useGameStore()
const settingsStore = useSettingsStore()

const minimized = ref(false)
const stats = ref<GameStatistics | null>(null)
const swRegistered = ref(false)

const accuracy = computed(() => {
  if (!stats.value || stats.value.totalAttempts === 0) return 0
  return Math.round((stats.value.correctAttempts / stats.value.totalAttempts) * 100)
})

const checkServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    swRegistered.value = registrations.length > 0
  }
}

const refreshStats = async () => {
  const { getStatistics } = useIndexedDB()
  stats.value = await getStatistics()
  await checkServiceWorker()
}

const clearStorage = async () => {
  if (confirm('Clear all game data? This cannot be undone.')) {
    localStorage.clear()
    const dbs = await indexedDB.databases()
    for (const db of dbs) {
      if (db.name) indexedDB.deleteDatabase(db.name)
    }
    window.location.reload()
  }
}

const exportDebugInfo = () => {
  const info = {
    timestamp: new Date().toISOString(),
    gameState: {
      hasSession: gameStore.hasActiveSession,
      score: gameStore.currentScore,
      attempts: gameStore.currentAttempts.length,
      categories: gameStore.categories.length,
      history: gameStore.history.length,
    },
    settings: settingsStore.$state,
    stats: stats.value,
    pwa: {
      swRegistered: swRegistered.value,
      installable: gameStore.canInstall,
      online: gameStore.isOnline,
    },
    userAgent: navigator.userAgent,
  }

  const blob = new Blob([JSON.stringify(info, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `debug-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  refreshStats()
})
</script>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: var(--spacing-md);
  left: var(--spacing-md);
  width: 280px;
  background: rgba(0, 0, 0, 0.9);
  color: #00ff00;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px;
  border-radius: var(--radius-md);
  z-index: var(--z-tooltip);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(0, 255, 0, 0.1);
  border-bottom: 1px solid rgba(0, 255, 0, 0.2);
}

.minimize-btn {
  background: none;
  border: none;
  color: #00ff00;
  cursor: pointer;
  padding: 4px 8px;
}

.debug-content {
  padding: var(--spacing-sm);
  max-height: 400px;
  overflow-y: auto;
}

.debug-section {
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid rgba(0, 255, 0, 0.1);
}

.debug-section:last-of-type {
  border-bottom: none;
}

.debug-section h4 {
  margin: 0 0 var(--spacing-xs) 0;
  color: #00cc00;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
}

.status-ok {
  color: #00ff00;
}

.status-off {
  color: #888;
}

.status-error {
  color: #ff4444;
}

.debug-actions {
  display: flex;
  gap: var(--spacing-xs);
  padding-top: var(--spacing-sm);
  border-top: 1px solid rgba(0, 255, 0, 0.1);
}

.action-btn {
  flex: 1;
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.3);
  color: #00ff00;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  font-family: inherit;
}

.action-btn:hover {
  background: rgba(0, 255, 0, 0.2);
}

.debug-enter-active,
.debug-leave-active {
  transition: all var(--transition-base);
}

.debug-enter-from,
.debug-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
