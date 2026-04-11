<template>
  <GameBackground>
    <div class="scoring-page">
      <GameHeader color="gold" data-testid="results-header">
        {{ t('scoring.title', 'Scoring') }}
      </GameHeader>

      <p
        v-if="!isAnswerInputEnabled"
        class="scoring-page__verbal-hint"
        data-testid="scoring-verbal-hint"
      >
        {{ t('scoring.verbal_hint') }}
      </p>

      <div class="scoring-page__column">
        <div class="scoring-page__list" data-testid="results-scores-container">
          <div
            v-for="(player, index) in players"
            :key="player.id"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: Number(index) * 50 } }"
            class="scoring-page__player-card"
            :data-testid="`results-player-entry-${index}`"
          >
            <div class="scoring-page__player-header">
              <span class="scoring-page__rank" :data-testid="`predicted-rank-${index}`">
                #{{ projectedRanks.get(player.id) ?? Number(index) + 1 }}
              </span>
              <div class="scoring-page__player-main">
                <GamePlayerCard
                  :player="player"
                  :label="`${t('scoring.player', 'Player')} ${Number(index) + 1}`"
                  :show-indicator="false"
                  :show-answer="isAnswerInputEnabled"
                  class="scoring-page__player-card-inner"
                />
                <p class="scoring-page__base-score" data-testid="base-score">
                  <span class="scoring-page__base-score-label">{{
                    t('scoring.base_score', 'Score')
                  }}</span>
                  <span class="scoring-page__base-score-value"
                    >{{ player.totalScore }} {{ t('scoring.points', 'pts') }}</span
                  >
                </p>
              </div>
            </div>

            <div
              class="scoring-page__score-controls"
              :data-testid="`results-score-controls-${index}`"
            >
              <GameButton
                variant="danger"
                size="sm"
                class="scoring-page__delta-btn"
                :sound-on-click="false"
                data-testid="score-decrement"
                @click="decrementScore(player.id)"
              >
                −
              </GameButton>

              <div class="scoring-page__round-score" aria-live="polite">
                <span class="scoring-page__round-score-label">{{
                  t('scoring.round_points', 'Round')
                }}</span>
                <span
                  class="scoring-page__round-score-value"
                  :data-testid="`scoring-page-score-value-${index}`"
                  >{{ pendingScores.get(player.id) ?? 0 }}</span
                >
              </div>

              <GameButton
                variant="primary"
                size="sm"
                class="scoring-page__delta-btn"
                :sound-on-click="false"
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
    </div>

    <!-- Leaderboard overlay (shown briefly after confirming scores) -->
    <PlayerLeaderboard
      data-testid="player-leaderboard"
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
      data-testid="post-round-modal"
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
            data-testid="next-round-button"
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
import orderBy from 'lodash-es/orderBy'

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
  const ranked = orderBy(
    players.value.map((p) => ({
      id: p.id,
      projected: p.totalScore + (pendingScores.get(p.id) ?? 0),
    })),
    ['projected'],
    ['desc']
  )

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

  // Use unified flow state for validation
  const flow = flowState.value
  if (flow !== 'round-complete' || isDecisionFlow.value || hasConfirmedRound.value) {
    // If not in correct flow state, show decision modal directly
    showDecisionModal.value = true
    return
  }

  isConfirming.value = true
  try {
    // Assign scores for all players
    for (const [playerId, score] of pendingScores) {
      await gameStore.assignPlayerScore(playerId, score)
    }

    // Complete the round (records round history and transitions to decision)
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

watch(flowState, (newFlow: string, oldFlow: string) => {
  // When flow transitions to decision, ensure modal appears
  if (newFlow === 'decision' && oldFlow !== 'decision') {
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
  if (id && gameStore.currentSession.value?.id !== id) {
    try {
      await gameStore.loadSessionById(id)
    } catch {
      await gameStore.loadFromDB()
    }
  }

  // Check flow state and initialize accordingly
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

useLocalizedPageSeo({
  title: () => pageTitle.value,
  description: () => t('scoring.description'),
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

.scoring-page__verbal-hint {
  max-width: 36rem;
  margin: calc(var(--spacing-xl) * -1) 0 0;
  padding: 0 var(--spacing-md);
  font-family: var(--font-display);
  font-size: mockup-clamp(15px);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-white);
  text-align: center;
  line-height: 1.4;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.45),
    0 0 12px rgba(13, 61, 122, 0.35);
}

.scoring-page__column {
  width: min(100%, 600px);
  margin-inline: auto;
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.scoring-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: 100%;
}

.scoring-page__player-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-panel-cream);
  border: 3px solid var(--color-border-gold);
  border-radius: var(--radius-xl);
  box-shadow:
    0 8px 0 rgba(0, 0, 0, 0.12),
    0 12px 28px rgba(0, 0, 0, 0.18);
}

.scoring-page__player-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.scoring-page__player-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.scoring-page__player-card-inner {
  width: 100%;
}

.scoring-page__player-card-inner :deep(.game-player-card) {
  box-shadow: none;
  border-width: 2px;
  background: rgba(255, 255, 255, 0.92);
}

.scoring-page__rank {
  flex-shrink: 0;
  font-family: var(--font-display);
  font-size: mockup-clamp(20px);
  font-weight: var(--font-weight-black);
  color: var(--color-text-yellow);
  min-width: 2.75rem;
  text-align: center;
  line-height: 1.1;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.35),
    0 0 12px rgba(255, 213, 79, 0.35);
}

.scoring-page__base-score {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--spacing-xs) var(--spacing-sm);
  font-family: var(--font-display);
}

.scoring-page__base-score-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-dark);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.scoring-page__base-score-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-black);
  color: var(--color-text-dark);
}

.scoring-page__score-controls {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.65);
  border: 2px solid rgba(200, 162, 67, 0.45);
  border-radius: var(--radius-lg);
}

.scoring-page__delta-btn {
  flex: 0 0 auto;
  min-width: 3.25rem;
  min-height: 3.25rem;
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-black);
  line-height: 1;
  border-width: 3px;
}

.scoring-page__round-score {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, #0d3d7a 0%, #082a58 100%);
  border: 3px solid var(--color-border-gold);
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.35),
    0 2px 0 rgba(255, 255, 255, 0.12);
}

.scoring-page__round-score-label {
  font-family: var(--font-display);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: rgba(255, 255, 255, 0.88);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.scoring-page__round-score-value {
  font-family: var(--font-display);
  font-size: mockup-clamp(26px);
  font-weight: var(--font-weight-black);
  color: var(--color-text-white);
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);
}

.scoring-page__button {
  width: 100%;
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

@include small-mobile {
  .scoring-page {
    padding: var(--spacing-lg) var(--spacing-xs);
    gap: var(--spacing-lg);
  }

  .scoring-page__list {
    gap: var(--spacing-lg);
  }

  .scoring-page__player-card {
    padding: var(--spacing-md);
  }

  .scoring-page__player-header {
    flex-wrap: nowrap;
  }

  .scoring-page__rank {
    font-size: var(--font-size-lg);
    min-width: 2.25rem;
  }

  .scoring-page__base-score {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
  }

  .scoring-page__score-controls {
    gap: var(--spacing-sm);
    padding: var(--spacing-xs);
  }

  .scoring-page__delta-btn {
    min-width: 2.85rem;
    min-height: 2.85rem;
    font-size: var(--font-size-xl);
  }

  .scoring-page__round-score-value {
    font-size: mockup-clamp(22px);
  }

  .decision-content__text {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-lg);
  }

  .decision-content__actions {
    gap: var(--spacing-sm);
  }
}

@include tiny-mobile {
  .scoring-page {
    padding: var(--spacing-md) var(--spacing-xs);
    gap: var(--spacing-md);
  }

  .scoring-page__column {
    gap: var(--spacing-lg);
  }

  .scoring-page__score-controls {
    gap: var(--spacing-xs);
  }

  .scoring-page__delta-btn {
    min-width: 2.6rem;
    min-height: 2.6rem;
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }
}

@media (max-width: 320px) {
  .scoring-page {
    padding: var(--spacing-sm) var(--spacing-xs);
  }

  .scoring-page__column {
    gap: var(--spacing-md);
  }
}
</style>
