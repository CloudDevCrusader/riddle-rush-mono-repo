<template>
  <div class="results-page">
    <!-- Background Image -->
    <img :src="`${baseUrl}assets/scoring/BACKGROUND.png`" alt="Background" class="page-bg" />

    <!-- Back Button -->
    <button class="back-btn tap-highlight no-select" @click="goBack">
      <img :src="`${baseUrl}assets/scoring/back.png`" alt="Back" />
    </button>

    <!-- Main Container -->
    <div class="container">
      <!-- Title -->
      <div class="title-container animate-fade-in">
        <img :src="`${baseUrl}assets/scoring/scoring.png`" alt="Scoring" class="title-image" />
      </div>

      <!-- Scores List Container -->
      <div class="scores-list-container animate-scale-in">
        <div class="scores-list">
          <div v-for="(player, index) in playerScores" :key="player.id" class="score-item">
            <img
              :src="`${baseUrl}assets/scoring/Shape 2.png`"
              alt="Score slot"
              class="score-slot-bg"
            />
            <div class="player-info">
              <img
                :src="`${baseUrl}assets/scoring/xyz.png`"
                alt="Player avatar"
                class="player-avatar"
              />
              <div class="player-details">
                <span class="player-name">{{ player.name }}</span>
                <span class="player-answer">"{{ player.answer }}"</span>
              </div>
            </div>
            <span class="player-score">{{ player.score }}</span>
            <div class="score-actions">
              <button
                class="score-action-btn tap-highlight no-select"
                :aria-label="`Increase score for ${player.name}`"
                @click="increaseScore(index)"
              >
                <img :src="`${baseUrl}assets/scoring/add.png`" alt="Add" />
              </button>
              <button
                class="score-action-btn tap-highlight no-select"
                :aria-label="`Decrease score for ${player.name}`"
                @click="decreaseScore(index)"
              >
                <img :src="`${baseUrl}assets/scoring/minus.png`" alt="Minus" />
              </button>
            </div>
          </div>
        </div>

        <!-- Scroll Bar -->
        <div class="scroll-bar">
          <img
            :src="`${baseUrl}assets/scoring/scroll bar.png`"
            alt="Scroll bar"
            class="scroll-bg"
          />
          <img
            :src="`${baseUrl}assets/scoring/screoll.png`"
            alt="Scroll handle"
            class="scroll-handle"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons animate-slide-up">
        <!-- Back Button -->
        <button
          class="action-btn back-large-btn tap-highlight no-select"
          aria-label="Go back to game"
          @click="goToPrevious"
        >
          <img :src="`${baseUrl}assets/scoring/back-1.png`" alt="Back" />
        </button>

        <!-- Next Button -->
        <button
          class="action-btn next-btn tap-highlight no-select"
          :class="{ disabled: isLoading }"
          :disabled="isLoading"
          aria-label="Continue to leaderboard"
          @click="goToLeaderboard"
        >
          <img :src="`${baseUrl}assets/scoring/next.png`" alt="Next" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SCORE_INCREMENT, NAVIGATION_DELAY_MS } from '@riddle-rush/shared/constants'

const { baseUrl, toast, t, goBack } = usePageSetup()
const { goToGame, goToLeaderboard: navigateToLeaderboard } = useNavigation()
const { gameStore, players } = useGameState()
const route = useRoute()

// Handle game ID from route parameter
const gameId = computed(() => route.params.gameId as string | undefined)

// Loading state for save operation
const isLoading = ref(false)

// Local state for scores (will be saved on navigation)
const playerScores = ref<Array<{ id: string; name: string; answer: string; score: number }>>([])

const audio = useAudio()

const increaseScore = (index: number) => {
  const player = playerScores.value[index]
  if (player) {
    player.score += SCORE_INCREMENT
    audio.playScoreIncrease()
  }
}

const decreaseScore = (index: number) => {
  const player = playerScores.value[index]
  if (player && player.score > 0) {
    player.score -= SCORE_INCREMENT
  }
}

// Memoize player scores to prevent unnecessary recalculations
watch(
  players,
  (newPlayers) => {
    playerScores.value = newPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      answer: p.currentRoundAnswer || '',
      score: p.currentRoundScore,
    }))
  },
  { immediate: true, deep: false }
)

const goToPrevious = () => {
  if (gameId.value) {
    goToGame(gameId.value)
  } else {
    goToGame()
  }
}

const goToLeaderboard = async () => {
  if (isLoading.value) return

  isLoading.value = true
  try {
    // Save all scores to the store
    for (const playerScore of playerScores.value) {
      await gameStore.assignPlayerScore(playerScore.id, playerScore.score)
    }

    // Complete the round
    await gameStore.completeRound()

    // Play round complete sound
    const audio = useAudio()
    audio.playRoundComplete()

    toast.success(t('results.scores_saved', 'Scores saved successfully!'))

    // Navigate to leaderboard
    setTimeout(() => {
      navigateToLeaderboard()
    }, NAVIGATION_DELAY_MS)
  } catch (error) {
    const logger = useLogger()
    logger.error('Error saving scores:', error)
    toast.error(t('results.error_saving', 'Failed to save scores. Please try again.'))
    isLoading.value = false
  }
}

useHead({
  title: 'Scoring',
  meta: [
    {
      name: 'description',
      content: 'Game scoring',
    },
  ],
})
</script>

<style scoped>
.results-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  background: #1a1a2e;
}

/* Background Image */
.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Back Button */
.back-btn {
  position: absolute;
  top: var(--spacing-xl);
  left: var(--spacing-xl);
  z-index: 3;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.back-btn img {
  width: clamp(40px, 5vw, 60px);
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.back-btn:hover {
  transform: scale(1.05);
}

.back-btn:active {
  transform: scale(0.95);
}

/* Container */
.container {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-md);
  gap: var(--spacing-2xl);
}

/* Title */
.title-container {
  display: flex;
  justify-content: center;
}

.title-image {
  width: clamp(200px, 30vw, 300px);
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

/* Scores List Container */
.scores-list-container {
  position: relative;
  width: 100%;
  max-width: 700px;
  display: flex;
  gap: var(--spacing-lg);
}

.scores-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-height: 450px;
  overflow-y: auto;
  padding: var(--spacing-md);
  scrollbar-width: none;
}

.scores-list::-webkit-scrollbar {
  display: none;
}

/* Score Item */
.score-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  min-height: 80px;
}

.score-slot-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  z-index: 1;
}

.player-info {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.player-avatar {
  width: clamp(40px, 5vw, 50px);
  height: auto;
  flex-shrink: 0;
}

.player-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
  min-width: 0;
}

.player-name {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-base), 2vw, var(--font-size-lg));
  font-weight: var(--font-weight-bold);
  color: #2a1810;
}

.player-answer {
  font-size: clamp(var(--font-size-sm), 1.5vw, var(--font-size-base));
  color: #5a3a25;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-score {
  position: relative;
  z-index: 2;
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-xl), 3vw, var(--font-size-3xl));
  font-weight: var(--font-weight-black);
  color: #2a1810;
  min-width: 80px;
  text-align: center;
}

.score-actions {
  position: relative;
  z-index: 2;
  display: flex;
  gap: var(--spacing-sm);
}

.score-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.score-action-btn img {
  width: clamp(30px, 4vw, 40px);
  height: auto;
}

.score-action-btn:hover {
  transform: scale(1.1);
}

.score-action-btn:active {
  transform: scale(0.95);
}

/* Scroll Bar */
.scroll-bar {
  position: relative;
  width: 30px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md) 0;
}

.scroll-bg {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
  width: auto;
}

.scroll-handle {
  position: relative;
  z-index: 2;
  width: 20px;
  height: auto;
  margin-top: var(--spacing-lg);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.action-btn:hover {
  transform: translateY(-4px) scale(1.05);
}

.action-btn:active:not(:disabled) {
  transform: translateY(-2px) scale(0.98);
}

.action-btn:disabled,
.action-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.back-large-btn img,
.next-btn img {
  width: clamp(140px, 22vw, 200px);
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

.add-score-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(70px, 10vw, 100px);
  height: clamp(70px, 10vw, 100px);
}

.add-score-btn img {
  width: 100%;
  height: auto;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out 0.2s backwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out 0.4s backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-2xl) var(--spacing-md);
  }

  .back-btn img {
    width: clamp(40px, 5vw, 50px);
  }

  .title-image {
    width: clamp(150px, 35vw, 300px);
  }

  .scores-list-container {
    max-width: calc(100% - var(--spacing-md) * 2);
  }

  .scores-list {
    max-height: 350px;
  }

  .score-item {
    min-height: 70px;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .player-avatar {
    width: clamp(36px, 5vw, 45px);
  }

  .player-name {
    font-size: clamp(var(--font-size-sm), 1.8vw, var(--font-size-base));
  }

  .action-buttons {
    width: 100%;
    max-width: 400px;
    gap: var(--spacing-md);
  }

  .back-large-btn img,
  .next-btn img {
    width: clamp(120px, 30vw, 200px);
  }
}

@media (max-width: 480px) {
  .container {
    padding: var(--spacing-xl) var(--spacing-sm);
    gap: var(--spacing-lg);
  }

  .title-image {
    width: clamp(120px, 30vw, 180px);
  }

  .scores-list {
    max-height: 300px;
  }

  .score-item {
    min-height: 60px;
    padding: var(--spacing-xs) var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .player-info {
    gap: var(--spacing-sm);
  }

  .player-avatar {
    width: clamp(32px, 4vw, 40px);
  }

  .player-name {
    font-size: clamp(var(--font-size-xs), 1.5vw, var(--font-size-sm));
  }

  .player-answer {
    font-size: clamp(var(--font-size-xs), 1.2vw, var(--font-size-sm));
  }

  .player-score {
    font-size: clamp(var(--font-size-xl), 2.5vw, var(--font-size-2xl));
    min-width: 60px;
  }

  .score-action-btn {
    min-width: 40px;
    min-height: 40px;
  }

  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .back-large-btn img,
  .next-btn img {
    width: clamp(100px, 25vw, 140px);
  }
}
</style>
