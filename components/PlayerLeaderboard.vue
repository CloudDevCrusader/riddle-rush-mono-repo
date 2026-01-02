<template>
  <Transition name="player-leaderboard">
    <div
      v-if="visible"
      class="player-leaderboard-overlay"
      @click.self="$emit('close')"
    >
      <div class="player-leaderboard-panel">
        <header class="leaderboard-header">
          <h2>
            <span v-if="isGameCompleted">🏆 {{ $t('leaderboard.winner_title', 'Final Standings') }}</span>
            <span v-else>📊 {{ $t('leaderboard.current_standings', 'Current Standings') }}</span>
          </h2>
          <button
            class="close-btn tap-highlight"
            @click="$emit('close')"
          >
            ✕
          </button>
        </header>

        <div class="leaderboard-content">
          <div
            v-if="players.length === 0"
            class="empty-state"
          >
            <span class="empty-icon">🎮</span>
            <p>{{ $t('leaderboard.no_players', 'No players yet') }}</p>
          </div>

          <div
            v-else
            class="players-list"
          >
            <div
              v-for="(player, index) in players"
              :key="player.id"
              class="player-row"
              :class="{
                'winner': player.isWinner,
                'top-three': index < 3,
                [`rank-${index + 1}`]: index < 3,
              }"
            >
              <div class="rank">
                <span
                  v-if="player.isWinner"
                  class="crown"
                >👑</span>
                <span v-else-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span
                  v-else
                  class="rank-number"
                >{{ index + 1 }}</span>
              </div>

              <div class="player-info">
                <div class="player-name">
                  {{ player.name }}
                  <span
                    v-if="player.isWinner"
                    class="winner-badge"
                  >Winner!</span>
                </div>
                <div class="player-meta">
                  Round {{ currentRound }}
                  <span v-if="player.currentRoundScore > 0">
                    · +{{ player.currentRoundScore }} pts this round
                  </span>
                </div>
              </div>

              <div class="player-score">
                {{ player.totalScore }}
                <span class="score-label">pts</span>
              </div>
            </div>
          </div>
        </div>

        <footer class="leaderboard-footer">
          <button
            v-if="!isGameCompleted"
            class="btn btn-primary"
            @click="$emit('continue')"
          >
            {{ $t('common.continue', 'Continue') }}
          </button>
          <button
            v-else
            class="btn btn-primary"
            @click="$emit('finish')"
          >
            {{ $t('common.finish', 'Finish Game') }}
          </button>
          <button
            class="btn btn-outline"
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
import type { PlayerWithRank } from '~/types/game'

defineProps<{
  visible: boolean
  players: PlayerWithRank[]
  isGameCompleted: boolean
  currentRound: number
}>()

defineEmits<{
  close: []
  continue: []
  finish: []
}>()
</script>

<style scoped>
.player-leaderboard-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(var(--spacing-md), env(safe-area-inset-top, 0px))
           max(var(--spacing-md), env(safe-area-inset-right, 0px))
           max(var(--spacing-md), env(safe-area-inset-bottom, 0px))
           max(var(--spacing-md), env(safe-area-inset-left, 0px));
}

.player-leaderboard-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 3px solid var(--color-primary);
}

.leaderboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl);
  border-bottom: 2px solid var(--color-light);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.leaderboard-header h2 {
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

.leaderboard-content {
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

.players-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.player-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  border: 2px solid transparent;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.player-row.winner {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-color: #FFD700;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.3);
  transform: scale3d(1.02, 1.02, 1);
  animation: winnerPulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  will-change: box-shadow;
}

@keyframes winnerPulse {
  0%, 100% {
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow: 0 8px 32px rgba(255, 215, 0, 0.6), 0 0 50px rgba(255, 215, 0, 0.5);
  }
}

.player-row.rank-1:not(.winner) {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%);
  border-color: rgba(255, 215, 0, 0.3);
}

.player-row.rank-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%);
  border-color: rgba(192, 192, 192, 0.3);
}

.player-row.rank-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(205, 127, 50, 0.05) 100%);
  border-color: rgba(205, 127, 50, 0.3);
}

.rank {
  width: 50px;
  text-align: center;
  font-size: 32px;
  flex-shrink: 0;
}

.crown {
  font-size: 48px;
  animation: crownBounce 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  will-change: transform;
}

@keyframes crownBounce {
  0%, 100% {
    transform: translate3d(0, 0, 0) rotate(-10deg);
  }
  50% {
    transform: translate3d(0, -8px, 0) rotate(10deg);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .player-row.winner {
    animation: none;
  }

  .crown {
    animation: none;
    transform: none;
  }
}

.rank-number {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  font-size: 24px;
  color: var(--color-gray);
}

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.player-name {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-dark);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.player-row.winner .player-name {
  color: #7a4800;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.winner-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.player-meta {
  font-size: var(--font-size-sm);
  color: var(--color-gray);
}

.player-row.winner .player-meta {
  color: #8b5a00;
}

.player-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: var(--font-display);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-black);
  color: var(--color-primary);
  flex-shrink: 0;
}

.player-row.winner .player-score {
  color: #7a4800;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
}

.score-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.player-row.winner .score-label {
  color: #8b5a00;
}

.leaderboard-footer {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-top: 2px solid var(--color-light);
}

.leaderboard-footer .btn {
  flex: 1;
  min-height: 56px;
}

/* Transitions */
.player-leaderboard-enter-active,
.player-leaderboard-leave-active {
  transition: all var(--transition-base);
}

.player-leaderboard-enter-from,
.player-leaderboard-leave-to {
  opacity: 0;
}

.player-leaderboard-enter-from .player-leaderboard-panel,
.player-leaderboard-leave-to .player-leaderboard-panel {
  transform: scale(0.9) translateY(30px);
}

/* Responsive - Optimized for Pixel 7 Pro */
@media (max-width: 640px) {
  .player-leaderboard-overlay {
    padding: max(var(--spacing-md), env(safe-area-inset-top, 0px))
             max(var(--spacing-md), env(safe-area-inset-right, 0px))
             max(var(--spacing-md), env(safe-area-inset-bottom, 0px))
             max(var(--spacing-md), env(safe-area-inset-left, 0px));
  }

  .player-leaderboard-panel {
    max-width: calc(100vw - max(var(--spacing-md), env(safe-area-inset-right, 0px)) * 2);
    max-height: calc(100vh - max(var(--spacing-md), env(safe-area-inset-top, 0px)) - max(var(--spacing-md), env(safe-area-inset-bottom, 0px)));
    width: 100%;
    box-sizing: border-box;
  }

  .player-row {
    padding: var(--spacing-md);
  }

  .rank {
    width: clamp(36px, 8vw, 44px);
    min-width: 36px;
    font-size: clamp(20px, 5vw, 28px);
  }

  .crown {
    font-size: clamp(32px, 7vw, 40px);
  }

  .player-name {
    font-size: clamp(0.9rem, 2.5vw, 1.05rem);
  }

  .player-score {
    font-size: clamp(1.5rem, 4vw, 2rem);
  }

  .leaderboard-footer {
    flex-direction: column;
    padding: var(--spacing-lg);
  }

  .close-btn {
    width: clamp(40px, 9vw, 48px);
    height: clamp(40px, 9vw, 48px);
    min-width: 40px;
    min-height: 40px;
  }
}

/* Pixel 7 Pro specific (412px width, tall screen) */
@media (max-width: 450px) and (min-height: 800px) {
  .player-leaderboard-panel {
    max-width: calc(100vw - max(var(--spacing-lg), env(safe-area-inset-right, 0px)) * 2);
    max-height: calc(100vh - max(var(--spacing-lg), env(safe-area-inset-top, 0px)) - max(var(--spacing-lg), env(safe-area-inset-bottom, 0px)));
  }

  .player-row {
    padding: var(--spacing-lg);
  }
}
</style>
