<template>
<<<<<<< Updated upstream:apps/game/components/ConnectionStatus.vue
  <div class="connection-status">
=======
  <div
    class="connection-status"
    data-testid="offline-indicator"
  >
>>>>>>> Stashed changes:apps/game/components/NetworkStatusIndicator.vue
    <div
      class="status-indicator"
      :class="connectionStatus"
      :style="{ backgroundColor: statusColor }"
      :title="statusText"
    >
<<<<<<< Updated upstream:apps/game/components/ConnectionStatus.vue
      <div class="pulse" v-if="connectionStatus === 'online'" />
    </div>
    <span class="status-text" v-if="showText">{{ statusText }}</span>
=======
      <div
        v-if="connectionStatus === 'online'"
        class="pulse"
      />
    </div>
    <span
      v-if="showText"
      class="status-text"
    >{{ statusText }}</span>
>>>>>>> Stashed changes:apps/game/components/NetworkStatusIndicator.vue
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWebSocket } from '~/composables/useWebSocket'
import { useI18n } from 'vue-i18n'

defineProps<{
  showText?: boolean
<<<<<<< Updated upstream:apps/game/components/ConnectionStatus.vue
}>()
=======
}>();
>>>>>>> Stashed changes:apps/game/components/NetworkStatusIndicator.vue

const { connectionStatus, statusColor } = useWebSocket()
const { t } = useI18n()

<<<<<<< Updated upstream:apps/game/components/ConnectionStatus.vue
const statusText = computed(() => {
  switch (connectionStatus.value) {
    case 'online':
      return t('connection.online')
    case 'connecting':
      return t('connection.connecting')
    case 'error':
      return t('connection.error')
    default:
      return t('connection.offline')
  }
})
=======
const online = ref(true);

const syncOnline = () => {
  online.value = typeof navigator !== 'undefined' && navigator.onLine;
};

onMounted(() => {
  syncOnline();
  window.addEventListener('online', syncOnline);
  window.addEventListener('offline', syncOnline);
});

onUnmounted(() => {
  window.removeEventListener('online', syncOnline);
  window.removeEventListener('offline', syncOnline);
});

const connectionStatus = computed(() => (online.value ? 'online' : 'offline'));

const statusColor = computed(() => (online.value ? '#10b981' : '#6b7280'));

const statusText = computed(() =>
  online.value ? t('connection.online') : t('connection.offline'),
);
>>>>>>> Stashed changes:apps/game/components/NetworkStatusIndicator.vue
</script>

<style scoped>
.connection-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  position: relative;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease,
    background-color 0.3s ease;
}

.status-indicator.online {
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.status-indicator.connecting {
  animation: pulse-amber 1.5s ease-in-out infinite;
}

.status-indicator.error {
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
  animation: pulse-red 1s ease-in-out infinite;
}

.pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: inherit;
  animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color, #374151);
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes pulse-amber {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes pulse-red {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .status-text {
    color: #d1d5db;
  }
}
</style>
