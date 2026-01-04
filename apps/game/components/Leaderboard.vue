<template>
  <Transition name="leaderboard">
    <div v-if="visible" class="leaderboard-overlay" @click.self="$emit('close')">
      <div class="leaderboard-panel">
        <header class="leaderboard-header">
          <h2>{{ t('leaderboard.title') }}</h2>
          <button class="close-btn tap-highlight" @click="$emit('close')">✕</button>
        </header>

        <div class="leaderboard-content">
          <div v-if="entries.length === 0" class="empty-state">
            <span class="empty-icon">🏆</span>
            <p>{{ t('leaderboard.empty') }}</p>
          </div>

          <div v-else class="entries-list">
            <div
              v-for="(entry, index) in entries"
              :key="entry.sessionId"
              class="entry-row"
              :class="{ 'top-three': index < 3, [`rank-${index + 1}`]: index < 3 }"
            >
              <div class="rank">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else class="rank-number">{{ index + 1 }}</span>
              </div>
              <div class="entry-info">
                <span class="category">{{ entry.category }}</span>
                <span class="meta"
                  >{{ formatDuration(entry.duration) }} · {{ entry.correctAttempts }}/{{
                    entry.attempts
                  }}</span
                >
              </div>
              <div class="score">
                {{ entry.score }}
              </div>
            </div>
          </div>
        </div>

        <footer class="leaderboard-footer">
          <button class="btn btn-outline" @click="$emit('close')">
            {{ t('common.close') }}
          </button>
          <button v-if="entries.length > 0" class="btn btn-secondary" @click="clearLeaderboard">
            {{ t('leaderboard.clear') }}
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { LeaderboardEntry } from '@riddle-rush/types/game'

const { t } = useI18n()

defineProps<{
  visible: boolean
  entries: LeaderboardEntry[]
}>()

const emit = defineEmits<{
  close: []
  clear: []
}>()

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const clearLeaderboard = () => {
  emit('clear')
}
</script>

<style scoped>
.leaderboard-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(var(--spacing-md), env(safe-area-inset-top, 0px))
    max(var(--spacing-md), env(safe-area-inset-right, 0px))
    max(var(--spacing-md), env(safe-area-inset-bottom, 0px))
    max(var(--spacing-md), env(safe-area-inset-left, 0px));
}

.leaderboard-panel {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
}

.leaderboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-light);
}

.leaderboard-header h2 {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-dark);
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-light);
  font-size: 18px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--color-gray-light);
}

.leaderboard-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-gray);
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: var(--spacing-md);
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.entry-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-light);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.entry-row.top-three {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
}

.entry-row.rank-1 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
}

.entry-row.rank-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.2) 0%, rgba(192, 192, 192, 0.1) 100%);
}

.entry-row.rank-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(205, 127, 50, 0.1) 100%);
}

.rank {
  width: 40px;
  text-align: center;
  font-size: 24px;
}

.rank-number {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray);
}

.entry-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category {
  font-weight: var(--font-weight-semibold);
  color: var(--color-dark);
  font-size: var(--font-size-sm);
}

.meta {
  font-size: var(--font-size-xs);
  color: var(--color-gray);
}

.score {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.leaderboard-footer {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-light);
}

.leaderboard-footer .btn {
  flex: 1;
}

.leaderboard-enter-active,
.leaderboard-leave-active {
  transition: all var(--transition-base);
}

.leaderboard-enter-from,
.leaderboard-leave-to {
  opacity: 0;
}

.leaderboard-enter-from .leaderboard-panel,
.leaderboard-leave-to .leaderboard-panel {
  transform: scale(0.9) translateY(20px);
}

/* Responsive - Optimized for Pixel 7 Pro */
@media (max-width: 640px) {
  .leaderboard-overlay {
    padding: max(var(--spacing-md), env(safe-area-inset-top, 0px))
      max(var(--spacing-md), env(safe-area-inset-right, 0px))
      max(var(--spacing-md), env(safe-area-inset-bottom, 0px))
      max(var(--spacing-md), env(safe-area-inset-left, 0px));
  }

  .leaderboard-panel {
    max-width: calc(100vw - max(var(--spacing-md), env(safe-area-inset-right, 0px)) * 2);
    max-height: calc(
      100vh - max(var(--spacing-md), env(safe-area-inset-top, 0px)) -
        max(var(--spacing-md), env(safe-area-inset-bottom, 0px))
    );
    width: 100%;
    box-sizing: border-box;
  }

  .close-btn {
    width: clamp(36px, 8vw, 44px);
    height: clamp(36px, 8vw, 44px);
    min-width: 36px;
    min-height: 36px;
    font-size: clamp(16px, 4vw, 20px);
  }

  .leaderboard-header {
    padding: var(--spacing-lg);
  }

  .leaderboard-content {
    padding: var(--spacing-md);
  }

  .leaderboard-footer {
    padding: var(--spacing-lg);
    flex-direction: column;
  }

  .leaderboard-footer .btn {
    width: 100%;
  }
}

/* Pixel 7 Pro specific (412px width, tall screen) */
@media (max-width: 450px) and (min-height: 800px) {
  .leaderboard-panel {
    max-width: calc(100vw - max(var(--spacing-lg), env(safe-area-inset-right, 0px)) * 2);
    max-height: calc(
      100vh - max(var(--spacing-lg), env(safe-area-inset-top, 0px)) -
        max(var(--spacing-lg), env(safe-area-inset-bottom, 0px))
    );
  }
}
</style>
