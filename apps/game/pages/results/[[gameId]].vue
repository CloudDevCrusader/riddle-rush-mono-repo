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
          :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: Number(index) * 50 } }"
          class="scoring-page__player-entry"
          :data-testid="`results-player-entry-${index}`"
        >
          <div class="scoring-page__player-header">
            <span class="scoring-page__rank" data-testid="projected-rank">
              #{{ projectedRanks.get(player.id) ?? Number(index) + 1 }}
            </span>
            <GamePlayerCard
              :player="player"
              :label="`${t('scoring.player', 'Player')} ${Number(index) + 1}`"
              :show-indicator="false"
              :show-answer="isAnswerInputEnabled"
            />
            <span class="scoring-page__base-score" data-testid="base-score">
              {{ t('scoring.base_score', 'Score') }}: {{ player.totalScore }}
              {{ t('scoring.points', 'pts') }}
            </span>
          </div>

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
            data-testid="new-game-button"
            @click="handleNewGame"
          >
            {{ t('scoring.new_game', 'New Game') }}
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
import type { Player } from '@riddle-rush/types/game'

const { t } = usePageSetup()
const { gameStore, players, leaderboard, currentRound, flowState, canConfirmRoundScores } =
  useGameState()
const { goToRoundStart, goToLeaderboard, goToPlayers } = useNavigation()
const { playClick, playScoreIncrease } = useAudio()
const { isAnswerInputEnabled } = useFeatureFlags()
const route = useRoute()
const logger = useLogger()

// Pending scores for each player (local state before confirming)
const pendingScores = reactive(new Map<string, number>())

const syncPendingScores = (nextPlayers: Player[]) => {
  pendingScores.clear()
  for (const player of nextPlayers) {
    pendingScores.set(player.id, player.currentRoundScore ?? 0)
  }
}

const gameId = computed(() => route.params.gameId as string | undefined)

const isConfirming = ref(false)

// Post-confirm overlay/modal state
const showLeaderboard = ref(false)
const showDecisionModal = ref(false)
let dismissTimer: ReturnType<typeof setTimeout> | null = null
const hasConfirmedRound = ref(false)

const isDecisionFlow = computed(() => flowState.value === 'decision')

// Projected ranks based on totalScore + pending scores
const projectedRanks = computed(() => {
  const ranked = [...players.value]
    .map((p) => ({
      id: p.id,
      projected: p.totalScore + (pendingScores.get(p.id) ?? 0),
    }))
    .sort((a, b) => b.projected - a.projected)

  const ranks = new Map<string, number>()
  ranked.forEach((p, i) => ranks.set(p.id, i + 1))
  return ranks
})

const incrementScore = (playerId: string) => {
  const current = pendingScores.get(playerId) ?? 0
  pendingScores.set(playerId, current + SCORE_INCREMENT)
  void playClick()
}

const decrementScore = (playerId: string) => {
  const current = pendingScores.get(playerId) ?? 0
  // Allow negative adjustments to reflect point deductions
  pendingScores.set(playerId, current - SCORE_INCREMENT)
  void playClick()
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
  if (!canConfirmRoundScores.value || isDecisionFlow.value || hasConfirmedRound.value) {
    showDecisionModal.value = true
    return
  }

  isConfirming.value = true
  try {
    // Assign scores for all players
    for (const [playerId, score] of pendingScores) {
      await gameStore.assignPlayerScore(playerId, score)
    }

    // Complete the round (records round history)
    await gameStore.completeRound()
    hasConfirmedRound.value = true

    void playScoreIncrease()

    // Show leaderboard overlay (auto-dismisses after timeout)
    showLeaderboard.value = true
    dismissTimer = setTimeout(handleLeaderboardDismiss, RESULTS_DISPLAY_DURATION_MS)
  } catch (error) {
    // Score saving failed — allow the user to retry
    logger.error('Failed to confirm scores:', error)
  } finally {
    isConfirming.value = false
  }
}

const handleNextRound = async () => {
  showDecisionModal.value = false
  await goToRoundStart()
}

const handleNewGame = async () => {
  showDecisionModal.value = false
  await gameStore.completeGame()
  await goToPlayers()
}

const handleFinishGame = async () => {
  showDecisionModal.value = false
  await gameStore.completeGame()
  await goToLeaderboard()
}

watch(
  players,
  (nextPlayers: Player[]) => {
    syncPendingScores(nextPlayers)
  },
  { immediate: true }
)

watch(isDecisionFlow, (isDecision: boolean) => {
  if (isDecision) {
    hasConfirmedRound.value = true
    showDecisionModal.value = true
    if (dismissTimer) {
      clearTimeout(dismissTimer)
      dismissTimer = null
    }
    showLeaderboard.value = false
  }
})

onMounted(async () => {
  const id = gameId.value
  if (id && gameStore.currentSession?.value?.id !== id) {
    try {
      await gameStore.loadSessionById(id)
    } catch {
      await gameStore.loadFromDB()
    }
  }

  if (flowState.value === 'decision') {
    hasConfirmedRound.value = true
    showDecisionModal.value = true
  }
})

onUnmounted(() => {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
})

const pageTitle = computed(
  () => `${t('scoring.title', 'Scoring')} · ${t('game.round')} ${currentRound.value || 1}`
)

useHead({
  title: pageTitle,
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

.scoring-page__player-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.scoring-page__rank {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--color-gold, #ffd700);
  min-width: 2.5rem;
  text-align: center;
}

.scoring-page__base-score {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted, #aaa);
  white-space: nowrap;
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
