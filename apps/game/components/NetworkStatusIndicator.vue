<template>
  <div
    class="connection-status"
    data-testid="offline-indicator"
  >
    <div
      class="status-indicator"
      :class="connectionStatus"
      :style="{ backgroundColor: statusColor }"
      :title="statusText"
    >
      <div
        v-if="connectionStatus === 'online'"
        class="pulse"
      />
    </div>
    <span
      v-if="showText"
      class="status-text"
    >{{ statusText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  showText?: boolean
}>();

const { t } = useI18n();

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

@media (prefers-color-scheme: dark) {
  .status-text {
    color: #d1d5db;
  }
}
</style>
