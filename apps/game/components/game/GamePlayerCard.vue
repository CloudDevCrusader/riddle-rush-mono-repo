<template>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  <div class="game-player-card">
=======
=======
>>>>>>> Stashed changes
  <div
    class="game-player-card"
    :class="{ 'game-player-card--embedded': embedded }"
  >
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    <div class="game-player-card__info">
      <div
        v-if="label"
        class="game-player-card__label"
      >
        {{ label }}
      </div>
      <div class="game-player-card__name">
        {{ player.name }}
      </div>
      <div v-if="showAnswer && player.currentRoundAnswer" class="game-player-card__answer">
        {{ player.currentRoundAnswer }}
      </div>
    </div>

    <div
      v-if="showIndicator && player.currentRoundScore !== 0"
      v-motion
      :initial="{ opacity: 0, scale: 0.9, x: -10 }"
      :enter="{ opacity: 1, scale: 1, x: 0, transition: { duration: 350 } }"
      class="game-player-card__indicator"
      :class="indicatorVariant"
    >
      {{ formatScore(player.currentRoundScore) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '@riddle-rush/types/game'

interface Props {
  /** Player object with score and name */
  player: Player
  /** Optional label (e.g., "Player 1") */
  label?: string
  /** Whether to show score indicator */
  showIndicator?: boolean
  /** Whether to show the player's answer */
  showAnswer?: boolean
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
  /** Flat layout + mockup colors for scoring on blue gradient cards */
  embedded?: boolean
>>>>>>> Stashed changes
=======
  /** Flat layout + mockup colors for scoring on blue gradient cards */
  embedded?: boolean
>>>>>>> Stashed changes
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  showIndicator: true,
  showAnswer: true,
})

const indicatorVariant = computed(() => {
  return props.player.currentRoundScore > 0
    ? 'game-player-card__indicator--positive'
    : 'game-player-card__indicator--negative'
})

const formatScore = (score: number): string => {
  if (score > 0) {
    return `+${score}pts`
  }
  return `${score}pts`
}
</script>

<style scoped lang="scss">
@use 'assets/scss/design-system' as *;

.game-player-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-panel);
  border: 3px solid var(--color-border-gold);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.18);
  }
}

.game-player-card__info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
  min-width: 0; // Allow text truncation
}

.game-player-card__label {
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.game-player-card__name {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.game-player-card__answer {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.game-player-card__indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-md);
  min-width: 70px;
  border-radius: var(--radius-md);
  border: 2px solid;
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  white-space: nowrap;

  &--positive {
    background: linear-gradient(180deg, var(--color-btn-green-light), var(--color-btn-green-dark));
    color: #2d5016;
    border-color: var(--color-btn-green-shadow);
  }

  &--negative {
    background: linear-gradient(180deg, var(--color-btn-red-light), var(--color-btn-red-dark));
    color: white;
    border-color: var(--color-btn-red-shadow);
  }
}

// Small phone adjustments
@include small-mobile {
  .game-player-card {
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .game-player-card__name {
    font-size: var(--font-size-base);
  }

  .game-player-card__answer {
    font-size: var(--font-size-sm);
  }

  .game-player-card__indicator {
    min-width: 60px;
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
}

@include tiny-mobile {
  .game-player-card {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-width: 2px;
  }

  .game-player-card__indicator {
    min-width: 52px;
  }
}
</style>
