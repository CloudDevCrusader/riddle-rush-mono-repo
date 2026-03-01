<template>
  <div class="scoring-page">
    <img src="~/assets/figma/background-1-8.png" class="scoring-bg" alt="background" />
    <header class="scoring-header">
      <img src="~/assets/figma/back-1.png" class="back-btn" alt="Back" @click="handleBack" />
      <div class="coin-bar">
        <img src="~/assets/figma/coin-bar-1.png" alt="Coin bar" />
        <span class="coin-bar-text">100</span>
      </div>
    </header>
    <div class="scoring-container">
      <img src="~/assets/figma/scoring-1.png" class="scoring-title" alt="Scoring" />
      <div class="player-list">
        <div v-for="player in players" :key="player.id" class="player-item">
          <img src="~/assets/figma/back-1-3.png" class="player-bg" alt="Player background" />
          <div class="player-info">
            <span class="player-name">{{ player.name }}</span>
            <div class="score-controls">
              <img
                src="~/assets/figma/add-back-16.png"
                class="score-btn"
                alt="Decrement"
                @click="decrementScore(player.id)"
              />
              <span class="score-value">{{ pendingScores.get(player.id) ?? 0 }}</span>
              <img
                src="~/assets/figma/add-2.png"
                class="score-btn"
                alt="Increment"
                @click="incrementScore(player.id)"
              />
            </div>
          </div>
        </div>
      </div>
      <img
        src="~/assets/figma/next-2.png"
        class="next-btn"
        alt="Next"
        @click="handleConfirmScores"
      />
    </div>
    <PlayerLeaderboard
      :visible="showLeaderboard"
      :players="leaderboard"
      :is-game-completed="false"
      :current-round="currentRound"
      @close="handleLeaderboardDismiss"
      @continue="handleLeaderboardDismiss"
    />
    <GameModal
      v-model="showDecisionModal"
      :title="t('scoring.round_complete', 'Round Complete!')"
      :close-on-backdrop="false"
      :close-on-escape="false"
    >
      <div class="decision-content">
        <p class="decision-content__text">
          {{ t('scoring.play_another_round', 'Would you like to play another round?') }}
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
            data-testid="finish-game"
            @click="handleFinishGame"
          >
            {{ t('scoring.finish_game', 'Finish Game') }}
          </GameButton>
        </div>
      </div>
    </GameModal>
  </div>
</template>

<script setup lang="ts">
import { SCORE_INCREMENT, RESULTS_DISPLAY_DURATION_MS } from '@riddle-rush/shared/constants'

const { t } = usePageSetup()
const { goHome } = useNavigation()
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

const handleBack = () => {
  goHome()
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

<style scoped>
.scoring-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.scoring-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scoring-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.back-btn {
  width: 64px;
  cursor: pointer;
}

.coin-bar {
  position: relative;
  width: 120px;
}

.coin-bar img {
  width: 100%;
}

.coin-bar-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.scoring-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.scoring-title {
  width: 100%;
  max-width: 300px;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  overflow-y: auto;
  padding: 1rem;
}

.player-item {
  position: relative;
  width: 100%;
}

.player-bg {
  width: 100%;
}

.player-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.score-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-btn {
  width: 80px;
  cursor: pointer;
}

.score-value {
  font-size: 1.5rem;
}

.next-btn {
  width: 100%;
  max-width: 300px;
  cursor: pointer;
  margin-top: auto;
}
</style>
