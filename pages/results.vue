<template>
  <div class="results-page">
    <!-- Background Image -->
    <img
      :src="`${baseUrl}assets/scoring/BACKGROUND.png`"
      alt="Background"
      class="page-bg"
    >

    <!-- Back Button -->
    <button
      class="back-btn tap-highlight no-select"
      @click="goBack"
    >
      <img
        :src="`${baseUrl}assets/scoring/back.png`"
        alt="Back"
      >
    </button>

    <!-- Main Container -->
    <div class="container">
      <!-- Title -->
      <div class="title-container animate-fade-in">
        <img
          :src="`${baseUrl}assets/scoring/scoring.png`"
          alt="Scoring"
          class="title-image"
        >
      </div>

      <!-- Scores List Container -->
      <div class="scores-list-container animate-scale-in">
        <div class="scores-list">
          <div
            v-for="(player, index) in playerScores"
            :key="index"
            class="score-item"
          >
            <img
              :src="`${baseUrl}assets/scoring/Shape 2.png`"
              alt="Score slot"
              class="score-slot-bg"
            >
            <div class="player-info">
              <img
                :src="`${baseUrl}assets/scoring/xyz.png`"
                alt="Player avatar"
                class="player-avatar"
              >
              <div class="player-details">
                <span class="player-name">{{ player.name }}</span>
                <span class="player-answer">"{{ player.answer }}"</span>
              </div>
            </div>
            <span class="player-score">{{ player.score }}</span>
            <div class="score-actions">
              <button
                class="score-action-btn tap-highlight no-select"
                @click="increaseScore(index)"
              >
                <img
                  :src="`${baseUrl}assets/scoring/add.png`"
                  alt="Add"
                >
              </button>
              <button
                class="score-action-btn tap-highlight no-select"
                @click="decreaseScore(index)"
              >
                <img
                  :src="`${baseUrl}assets/scoring/minus.png`"
                  alt="Minus"
                >
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
          >
          <img
            :src="`${baseUrl}assets/scoring/screoll.png`"
            alt="Scroll handle"
            class="scroll-handle"
          >
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons animate-slide-up">
        <!-- Back Button -->
        <button
          class="action-btn back-large-btn tap-highlight no-select"
          @click="goToPrevious"
        >
          <img
            :src="`${baseUrl}assets/scoring/back-1.png`"
            alt="Back"
          >
        </button>

        <!-- Next Button -->
        <button
          class="action-btn next-btn tap-highlight no-select"
          @click="goToLeaderboard"
        >
          <img
            :src="`${baseUrl}assets/scoring/next.png`"
            alt="Next"
          >
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const router = useRouter()
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl
const gameStore = useGameStore()
const toast = useToast()
const { t } = useI18n()

// Get players from store
const players = computed(() => gameStore.players)

// Local state for scores (will be saved on navigation)
const playerScores = ref(
  players.value.map((p) => ({
    id: p.id,
    name: p.name,
    answer: p.currentRoundAnswer || '',
    score: p.currentRoundScore,
  })),
)

const increaseScore = (index: number) => {
  const player = playerScores.value[index]
  if (player) {
    player.score += 10
  }
}

const decreaseScore = (index: number) => {
  const player = playerScores.value[index]
  if (player && player.score > 0) {
    player.score -= 10
  }
}

const goToPrevious = () => {
  router.push('/game')
}

const goToLeaderboard = async () => {
  try {
    // Save all scores to the store
    for (const playerScore of playerScores.value) {
      await gameStore.assignPlayerScore(playerScore.id, playerScore.score)
    }

    // Complete the round
    await gameStore.completeRound()

    toast.success(t('results.scores_saved', 'Scores saved successfully!'))

    // Navigate to leaderboard
    setTimeout(() => {
      router.push('/leaderboard')
    }, 500)
  } catch (error) {
    console.error('Error saving scores:', error)
    toast.error(t('results.error_saving', 'Failed to save scores. Please try again.'))
  }
}

const goBack = () => {
  router.back()
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

.action-btn:active {
  transform: translateY(-2px) scale(0.98);
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
@media (max-width: 640px) {
  .back-btn img {
    width: 40px;
  }

  .title-image {
    width: 200px;
  }

  .scores-list {
    max-height: 350px;
  }

  .score-item {
    min-height: 70px;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .back-large-btn img,
  .next-btn img {
    width: 140px;
  }

  .add-score-btn {
    width: 70px;
    height: 70px;
  }
}
</style>
