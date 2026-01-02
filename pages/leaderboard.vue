<template>
  <div class="leaderboard-page">
    <!-- Background Image -->
    <img
      :src="`${baseUrl}assets/leaderboard/BACKGROUND.png`"
      alt="Background"
      class="page-bg"
    >

    <!-- Back Button - Only show if game is not completed -->
    <button
      v-if="!isGameCompleted"
      class="back-btn tap-highlight no-select"
      @click="goBack"
    >
      <img
        :src="`${baseUrl}assets/leaderboard/back.png`"
        alt="Back"
      >
    </button>

    <!-- Main Container -->
    <div class="container">
      <!-- Title -->
      <div class="title-container animate-fade-in">
        <img
          :src="`${baseUrl}assets/leaderboard/leaderbpard.png`"
          alt="Leaderboard"
          class="title-image"
        >
        <img
          :src="`${baseUrl}assets/leaderboard/ranking.png`"
          alt="Ranking"
          class="ranking-image"
        >
      </div>

      <!-- Leaderboard List -->
      <div class="leaderboard-list-container animate-scale-in">
        <div class="leaderboard-list">
          <div
            v-for="(entry, index) in leaderboardEntries"
            :key="entry.id"
            class="leaderboard-item"
          >
            <!-- Rank Badge -->
            <div class="rank-badge">
              <img
                v-if="index < 5"
                :src="`${baseUrl}assets/leaderboard/${index + 1}.png`"
                :alt="`Rank ${index + 1}`"
                class="rank-image"
              >
              <img
                v-else
                :src="`${baseUrl}assets/leaderboard/s.png`"
                alt="Rank"
                class="rank-image"
              >
              <span
                v-if="index >= 5"
                class="rank-number"
              >{{ index + 1 }}</span>
            </div>

            <!-- Player Info -->
            <div class="player-info">
              <img
                :src="`${baseUrl}assets/leaderboard/tobi.png`"
                alt="Player"
                class="player-avatar"
              >
              <span class="player-name">{{ entry.name }}</span>
            </div>

            <!-- Score -->
            <div class="score-display">
              <img
                :src="`${baseUrl}assets/leaderboard/500.png`"
                alt="Score"
                class="score-icon"
              >
              <span class="score-value">{{ entry.totalScore }}</span>
            </div>

            <!-- Decoration -->
            <img
              :src="`${baseUrl}assets/leaderboard/Group 8.png`"
              alt="Decoration"
              class="item-decoration"
            >
          </div>
        </div>

        <!-- Scroll Bar -->
        <div class="scroll-bar">
          <img
            :src="`${baseUrl}assets/leaderboard/scroll bar.png`"
            alt="Scroll bar"
            class="scroll-bg"
          >
          <img
            :src="`${baseUrl}assets/leaderboard/screoll.png`"
            alt="Scroll handle"
            class="scroll-handle"
          >
        </div>
      </div>

      <!-- Game Complete Message (if game is completed) -->
      <div
        v-if="isGameCompleted"
        class="game-complete-message animate-fade-in"
      >
        <p class="complete-text">
          {{ $t('leaderboard.game_complete', 'Game Complete!') }}
        </p>
      </div>

      <!-- OK Button -->
      <button
        class="ok-btn tap-highlight no-select animate-slide-up"
        @click="handleOk"
      >
        <img
          :src="`${baseUrl}assets/leaderboard/ok.png`"
          alt="OK"
        >
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const router = useRouter()
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl
const gameStore = useGameStore()

const leaderboardEntries = computed(() => gameStore.leaderboard)
const isGameCompleted = computed(() => gameStore.isGameCompleted)

const goBack = () => {
  router.push('/')
}

const handleOk = async () => {
  if (isGameCompleted.value) {
    // Leaderboard is the final screen - end game and return to home
    await gameStore.endGame()
    router.push('/')
  } else {
    // Continue to next round
    router.push('/round-start')
  }
}

useHead({
  title: 'Leaderboard',
  meta: [
    {
      name: 'description',
      content: 'Game leaderboard',
    },
  ],
})
</script>

<style scoped>
.leaderboard-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  background: #1a1a2e;
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

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

.back-btn:active {
  transform: scale(0.95);
}

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

.title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.title-image {
  width: clamp(200px, 30vw, 300px);
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
}

.ranking-image {
  width: clamp(180px, 28vw, 280px);
  height: auto;
}

.leaderboard-list-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  display: flex;
  gap: var(--spacing-lg);
}

.leaderboard-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-height: 500px;
  overflow-y: auto;
  padding: var(--spacing-sm);
  scrollbar-width: none;
}

.leaderboard-list::-webkit-scrollbar {
  display: none;
}

.leaderboard-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-lg);
  min-height: 70px;
}

.rank-badge {
  position: relative;
  flex-shrink: 0;
  width: clamp(40px, 6vw, 60px);
  height: clamp(40px, 6vw, 60px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-image {
  width: 100%;
  height: auto;
}

.rank-number {
  position: absolute;
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-lg), 2.5vw, var(--font-size-2xl));
  font-weight: var(--font-weight-black);
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.player-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.player-avatar {
  width: clamp(35px, 5vw, 50px);
  height: auto;
  border-radius: 50%;
}

.player-name {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-base), 2vw, var(--font-size-xl));
  font-weight: var(--font-weight-semibold);
  color: #2a1810;
}

.score-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.score-icon {
  width: clamp(20px, 3vw, 30px);
  height: auto;
}

.score-value {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-lg), 2.5vw, var(--font-size-2xl));
  font-weight: var(--font-weight-black);
  color: #2a1810;
  min-width: 80px;
  text-align: right;
}

.item-decoration {
  position: absolute;
  right: 0;
  top: 0;
  width: clamp(30px, 4vw, 40px);
  height: auto;
  opacity: 0.3;
}

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

.ok-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.ok-btn img {
  width: clamp(150px, 25vw, 200px);
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

.ok-btn:active {
  transform: scale(0.95);
}

.game-complete-message {
  text-align: center;
  z-index: 3;
  margin-bottom: var(--spacing-lg);
}

.complete-text {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-2xl), 5vw, var(--font-size-4xl));
  font-weight: var(--font-weight-black);
  color: var(--color-secondary);
  text-shadow:
    0 0 20px rgba(249, 196, 60, 0.6),
    0 4px 12px rgba(0, 0, 0, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
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

@media (max-width: 640px) {
  .back-btn img {
    width: 40px;
  }

  .title-image {
    width: 200px;
  }

  .ranking-image {
    width: 180px;
  }

  .leaderboard-list {
    max-height: 400px;
  }

  .leaderboard-item {
    min-height: 60px;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .ok-btn img {
    width: 150px;
  }
}
</style>
