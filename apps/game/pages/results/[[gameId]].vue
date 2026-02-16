<template>
  <GameBackground>
    <div class="scoring-page">
      <GameHeader color="gold">
        {{ t('scoring.title', 'Scoring') }}
      </GameHeader>

      <div class="scoring-page__list">
        <div
          v-for="(player, index) in players"
          :key="player.id"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: index * 50 } }"
          class="scoring-page__player-entry"
        >
          <GamePlayerCard
            :player="player"
            :label="`${t('scoring.player', 'Player')} ${index + 1}`"
            :show-indicator="false"
          />

          <div class="scoring-page__score-controls">
            <GameButton
              variant="danger"
              size="sm"
              :disabled="(pendingScores.get(player.id) ?? 0) <= 0"
              data-testid="score-decrement"
              @click="decrementScore(player.id)"
            >
              −
            </GameButton>

            <GameDisplay size="sm" :glow="false" class="scoring-page__score-value">
              {{ pendingScores.get(player.id) ?? 0 }}
            </GameDisplay>

            <GameButton
              variant="primary"
              size="sm"
              data-testid="score-increment"
              @click="incrementScore(player.id)"
            >
              +
            </GameButton>
          </div>
        </div>
      </div>

      <GameButton
        variant="primary"
        size="lg"
        full-width
        :loading="isConfirming"
        class="scoring-page__button"
        data-testid="confirm-scores"
        @click="handleConfirmScores"
      >
        {{ t('scoring.confirm_scores', 'Confirm Scores') }}
      </GameButton>
    </div>
  </GameBackground>
</template>

<script setup lang="ts">
import { SCORE_INCREMENT } from '@riddle-rush/shared/constants'

const { t } = usePageSetup()
const { gameStore, players } = useGameState()
const { goToRoundStart } = useNavigation()
const { playClick, playScoreIncrease } = useAudio()

// Pending scores for each player (local state before confirming)
const pendingScores = reactive(new Map<string, number>())

// Initialize all player scores to 0 on mount
onMounted(() => {
  for (const player of players.value) {
    pendingScores.set(player.id, 0)
  }
})

const isConfirming = ref(false)

const incrementScore = (playerId: string) => {
  const current = pendingScores.get(playerId) ?? 0
  pendingScores.set(playerId, current + SCORE_INCREMENT)
  void playClick()
}

const decrementScore = (playerId: string) => {
  const current = pendingScores.get(playerId) ?? 0
  if (current > 0) {
    pendingScores.set(playerId, current - SCORE_INCREMENT)
    void playClick()
  }
}

const handleConfirmScores = async () => {
  if (isConfirming.value) return

  isConfirming.value = true
  try {
    // Assign scores for all players
    for (const [playerId, score] of pendingScores) {
      await gameStore.assignPlayerScore(playerId, score)
    }

    // Complete the round (records round history)
    await gameStore.completeRound()

    void playScoreIncrease()

    // Navigate to round start for the next round
    // (The next step will add leaderboard overlay + decision modal here)
    await goToRoundStart()
  } catch {
    // Score saving failed — allow the user to retry
    isConfirming.value = false
  }
}

useHead({
  title: t('scoring.title', 'Scoring'),
  meta: [
    {
      name: 'description',
      content: t('scoring.description', 'View round scoring results'),
    },
  ],
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/design-system' as *;

.scoring-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl) var(--spacing-md);
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
}

.scoring-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 600px;
}

.scoring-page__player-entry {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.scoring-page__score-controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.scoring-page__score-value {
  min-width: 60px;
  text-align: center;
}

.scoring-page__button {
  max-width: 600px;
}

@media (max-width: 640px) {
  .scoring-page {
    padding: var(--spacing-xl) var(--spacing-sm);
    gap: var(--spacing-xl);
  }
}
</style>
