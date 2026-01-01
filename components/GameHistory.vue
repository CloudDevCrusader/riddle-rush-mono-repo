<template>
  <Transition name="game-history">
    <div
      v-if="visible"
      class="game-history-overlay"
      @click.self="$emit('close')"
    >
      <div class="game-history-panel">
        <header class="history-header">
          <h2>📜 {{ $t('history.title', 'Game History') }}</h2>
          <button
            class="close-btn tap-highlight"
            @click="$emit('close')"
          >
            ✕
          </button>
        </header>

        <div class="history-content">
          <div
            v-if="games.length === 0"
            class="empty-state"
          >
            <span class="empty-icon">🎮</span>
            <p>{{ $t('history.no_games', 'No games played yet') }}</p>
          </div>

          <div
            v-else
            class="games-list"
          >
            <div
              v-for="game in sortedGames"
              :key="game.id"
              class="game-card"
              :class="{ completed: game.status === 'completed' }"
            >
              <div class="game-header-row">
                <div class="game-title">
                  <span
                    v-if="game.status === 'completed'"
                    class="status-icon"
                  >🏆</span>
                  <span
                    v-else-if="game.status === 'abandoned'"
                    class="status-icon"
                  >⏸️</span>
                  <span
                    v-else
                    class="status-icon"
                  >✓</span>
                  {{ game.gameName || $t('history.game', 'Game') }}
                </div>
                <div class="game-date">
                  {{ formatDate(game.startTime) }}
                </div>
              </div>

              <div class="game-info">
                <div class="info-row">
                  <span class="info-label">{{ $t('history.category', 'Category') }}:</span>
                  <span class="info-value">{{ game.category.name }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">{{ $t('history.letter', 'Letter') }}:</span>
                  <span class="info-value">{{ game.letter.toUpperCase() }}</span>
                </div>
                <div
                  v-if="game.players && game.players.length > 0"
                  class="info-row"
                >
                  <span class="info-label">{{ $t('history.rounds', 'Rounds') }}:</span>
                  <span class="info-value">{{ game.currentRound }}</span>
                </div>
              </div>

              <!-- Multi-player scores -->
              <div
                v-if="game.players && game.players.length > 0"
                class="players-scores"
              >
                <div
                  v-for="(player, index) in getSortedPlayers(game)"
                  :key="player.id"
                  class="player-score-row"
                  :class="{ winner: index === 0 && game.status === 'completed' }"
                >
                  <span class="player-rank">{{ index === 0 && game.status === 'completed' ? '👑' : `#${index + 1}` }}</span>
                  <span class="player-name">{{ player.name }}</span>
                  <span class="player-points">{{ player.totalScore }} pts</span>
                </div>
              </div>

              <!-- Single-player score -->
              <div
                v-else-if="game.score !== undefined"
                class="single-score"
              >
                <span class="score-label">{{ $t('history.score', 'Score') }}:</span>
                <span class="score-value">{{ game.score }} pts</span>
                <span class="attempts-info">({{ game.attempts?.length || 0 }} {{ $t('history.attempts', 'attempts') }})</span>
              </div>
            </div>
          </div>
        </div>

        <footer class="history-footer">
          <button
            class="btn btn-primary"
            @click="$emit('close')"
          >
            {{ $t('common.close', 'Close') }}
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { GameSession, Player } from '~/types/game'

const props = defineProps<{
  visible: boolean
  games: GameSession[]
}>()

defineEmits<{
  close: []
}>()

const sortedGames = computed(() => {
  return [...(props.games || [])].sort((a, b) => {
    const timeA = a.endTime || a.startTime
    const timeB = b.endTime || b.startTime
    return timeB - timeA // Most recent first
  })
})

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

const getSortedPlayers = (game: GameSession): Player[] => {
  if (!game.players) return []
  return [...game.players].sort((a, b) => b.totalScore - a.totalScore)
}
</script>

<style scoped>
.game-history-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.game-history-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 3px solid var(--color-primary);
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl);
  border-bottom: 2px solid var(--color-light);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.history-header h2 {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-black);
  margin: 0;
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.close-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-white);
  font-size: 24px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:active {
  background: rgba(255, 255, 255, 0.3);
}

.history-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-gray);
}

.empty-icon {
  font-size: 72px;
  display: block;
  margin-bottom: var(--spacing-md);
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.game-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--color-light);
  transition: all var(--transition-base);
}

.game-card.completed {
  border-color: rgba(255, 215, 0, 0.3);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 215, 0, 0.02) 100%);
}

.game-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-light);
}

.game-title {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-dark);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.status-icon {
  font-size: 20px;
}

.game-date {
  font-size: var(--font-size-sm);
  color: var(--color-gray);
  font-weight: var(--font-weight-medium);
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.info-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray);
  font-weight: var(--font-weight-medium);
}

.info-value {
  font-size: var(--font-size-sm);
  color: var(--color-dark);
  font-weight: var(--font-weight-semibold);
}

.players-scores {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  background: var(--color-light);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

.player-score-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--color-white);
  border-radius: var(--radius-sm);
}

.player-score-row.winner {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.player-rank {
  width: 32px;
  text-align: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.player-name {
  flex: 1;
  font-weight: var(--font-weight-medium);
  color: var(--color-dark);
}

.player-points {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.single-score {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-light);
  border-radius: var(--radius-md);
}

.score-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray);
  font-weight: var(--font-weight-medium);
}

.score-value {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.attempts-info {
  font-size: var(--font-size-sm);
  color: var(--color-gray);
}

.history-footer {
  padding: var(--spacing-xl);
  border-top: 2px solid var(--color-light);
}

.history-footer .btn {
  width: 100%;
  min-height: 56px;
}

/* Transitions */
.game-history-enter-active,
.game-history-leave-active {
  transition: all var(--transition-base);
}

.game-history-enter-from,
.game-history-leave-to {
  opacity: 0;
}

.game-history-enter-from .game-history-panel,
.game-history-leave-to .game-history-panel {
  transform: scale(0.9) translateY(30px);
}

/* Responsive */
@media (max-width: 640px) {
  .game-history-panel {
    max-width: 95vw;
  }

  .game-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>
