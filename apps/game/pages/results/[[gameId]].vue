<template>
  <GameBackground>
    <div class="scoring-page">
      <GameHeader color="gold">
        {{ t('scoring.title', 'Scoring') }}
      </GameHeader>

      <div class="scoring-page__list" data-testid="results-scores-container">
        <div
          v-for="(player, index) in players"
          :key="player.id"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: index * 50 } }"
          class="scoring-page__player-entry"
          :data-testid="`results-player-entry-${index}`"
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

    <!-- Leaderboard overlay (shown briefly after confirming scores) -->
    <PlayerLeaderboard
      :visible="showLeaderboard"
      :players="leaderboard"
      :is-game-completed="false"
      :current-round="currentRound"
      @close="handleLeaderboardDismiss"
      @continue="handleLeaderboardDismiss"
    />

    <!-- Decision modal: next round or finish game -->
    <GameModal
      v-model="showDecisionModal"
      :title="t('scoring.round_complete', 'Round Complete!')"
      :close-on-backdrop="false"
      :close-on-escape="false"
    >
      <div class="decision-content">
        <p class="decision-content__text" data-testid="results-post-round-prompt">
          {{
            t(
              'scoring.post_round_prompt',
              'Do you want to play another round, or go to the leaderboard?'
            )
          }}
        </p>
        <div class="decision-content__actions">
          <GameButton
            variant="primary"
            size="lg"
            full-width
            data-testid="next-round"
            @click="handleNextRound"
          >
            {{ t('scoring.next_round', 'Next Round') }}
          </GameButton>
          <GameButton
            variant="secondary"
            size="lg"
            full-width
            data-testid="leaderboard-button"
            @click="handleFinishGame"
          >
            {{ t('scoring.leaderboard', 'Leaderboard') }}
          </GameButton>
        </div>
      </div>
    </GameModal>
  </GameBackground>
</template>

<script setup lang="ts">
import { SCORE_INCREMENT, RESULTS_DISPLAY_DURATION_MS } from '@riddle-rush/shared/constants'

const { t } = usePageSetup()
const { gameStore, players, leaderboard, currentRound } = useGameState()
const { goToRoundStart, goToLeaderboard } = useNavigation()
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

// Post-confirm overlay/modal state
const showLeaderboard = ref(false)
const showDecisionModal = ref(false)
let dismissTimer: ReturnType<typeof setTimeout> | null = null

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

const handleLeaderboardDismiss = () => {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
  showLeaderboard.value = false
  showDecisionModal.value = true
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

    // Show leaderboard overlay (auto-dismisses after timeout)
    showLeaderboard.value = true
    dismissTimer = setTimeout(handleLeaderboardDismiss, RESULTS_DISPLAY_DURATION_MS)
  } catch {
    // Score saving failed — allow the user to retry
    isConfirming.value = false
  }
}

const handleNextRound = async () => {
  showDecisionModal.value = false
  await goToRoundStart()
}

const handleFinishGame = async () => {
  showDecisionModal.value = false
  await gameStore.completeGame()
  await goToLeaderboard()
}

onUnmounted(() => {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
})

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
@use 'assets/scss/design-system' as *;

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

.decision-content {
  text-align: center;
}

.decision-content__text {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xl);
}

.decision-content__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

@media (max-width: 640px) {
  .scoring-page {
    padding: var(--spacing-xl) var(--spacing-sm);
    gap: var(--spacing-xl);
  }
}
</style>
