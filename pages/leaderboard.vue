<template>
  <div class="leaderboard-page">
    <!-- Background (shared bg) -->
    <div class="page-bg" />

    <!-- Back Button -->
    <button
      class="back-btn tap-highlight no-select"
      @click="goBack"
    >
      <img
        :src="`${baseUrl}assets/leaderboard/back.png`"
        alt="Back"
      >
    </button>

    <!-- Coin Bar -->
    <div class="coin-bar">
      <img
        :src="`${baseUrl}assets/leaderboard/COIN BAR.png`"
        alt="Coin bar"
      >
    </div>

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

      <!-- Leaderboard List Container -->
      <div class="leaderboard-list-container animate-scale-in">
        <div class="leaderboard-list">
          <div
            v-for="(entry, index) in leaderboardEntries"
            :key="index"
            class="leaderboard-item"
            :class="`rank-${index + 1}`"
          >
            <!-- Rank Badge -->
            <div class="rank-badge">
              <img
                v-if="index < 5"
                :src="`${baseUrl}assets/leaderboard/${index + 1}.png`"
                alt="`Rank ${index + 1}`"
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
                alt="Score icon"
                class="score-icon"
              >
              <span class="score-value">{{ entry.score }}</span>
            </div>

            <!-- Group decoration -->
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

      <!-- Decorative Layer -->
      <div class="decorative-layer">
        <img
          :src="`${baseUrl}assets/leaderboard/Layer 12 copy 3.png`"
          alt="Decoration"
        >
      </div>

      <!-- OK Button -->
      <button
        class="ok-btn tap-highlight no-select animate-slide-up"
        @click="goToMenu"
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
const router = useRouter()
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl

// Mock leaderboard data - replace with actual game data
const leaderboardEntries = ref([
  { name: 'Player One', score: 1250 },
  { name: 'Player Two', score: 1100 },
  { name: 'Player Three', score: 950 },
  { name: 'Player Four', score: 850 },
  { name: 'Player Five', score: 720 },
  { name: 'Player Six', score: 650 },
  { name: 'Player Seven', score: 580 },
  { name: 'Player Eight', score: 500 },
])

const goBack = () => {
  router.back()
}

const goToMenu = () => {
  router.push('/menu')
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
  background: linear-gradient(180deg, #2c5f8d 0%, #1a3a5c 100%);
}

/* Page Background */
.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-image:
    radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
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

/* Coin Bar */
.coin-bar {
  position: absolute;
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: 3;
}

.coin-bar img {
  height: clamp(35px, 5vw, 55px);
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
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

/* Leaderboard List Container */
.leaderboard-list-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  display: flex;
  gap: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  backdrop-filter: blur(10px);
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

/* Leaderboard Item */
.leaderboard-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-lg);
  min-height: 70px;
  transition: transform var(--transition-base);
}

.leaderboard-item:hover {
  transform: translateX(4px);
}

.leaderboard-item.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.leaderboard-item.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  box-shadow: 0 4px 12px rgba(192, 192, 192, 0.4);
}

.leaderboard-item.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e6a867 100%);
  box-shadow: 0 4px 12px rgba(205, 127, 50, 0.4);
}

/* Rank Badge */
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

/* Player Info */
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

/* Score Display */
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

/* Decorative Layer */
.decorative-layer {
  position: absolute;
  bottom: var(--spacing-2xl);
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.1;
  pointer-events: none;
}

.decorative-layer img {
  width: clamp(300px, 50vw, 600px);
  height: auto;
}

/* OK Button */
.ok-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
  z-index: 3;
}

.ok-btn:hover {
  transform: translateY(-4px) scale(1.05);
}

.ok-btn:active {
  transform: translateY(-2px) scale(0.98);
}

.ok-btn img {
  width: clamp(180px, 30vw, 250px);
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4));
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
    width: 180px;
  }
}
</style>
