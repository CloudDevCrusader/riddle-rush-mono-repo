<template>
  <div class="leaderboard-page">
    <img src="~/assets/figma/background-1-5.png" class="leaderboard-bg" alt="background" />
    <header class="leaderboard-header">
      <img src="~/assets/figma/back-6.png" class="back-btn" alt="Back" @click="handleBack" />
      <div class="coin-bar">
        <img src="~/assets/figma/coin-bar-1-2.png" alt="Coin bar" />
        <span class="coin-bar-text">100</span>
      </div>
    </header>
    <div class="leaderboard-container">
      <img src="~/assets/figma/you-win-1.png" class="leaderboard-title" alt="Leaderboard" />
      <div class="player-list">
        <div v-for="(player, index) in leaderboard" :key="player.id" class="player-item">
          <img src="~/assets/figma/back-1-3.png" class="player-bg" alt="Player background" />
          <div class="player-info">
            <div class="player-rank">
              <img src="~/assets/figma/1-1.png" class="player-rank-bg" alt="Rank background" />
              <span class="player-rank-text">{{ Number(index) + 1 }}</span>
            </div>
            <span class="player-name">{{ player.name }}</span>
            <span class="player-score">{{ player.totalScore }}</span>
          </div>
        </div>
      </div>
      <img src="~/assets/figma/ok-2.png" class="ok-btn" alt="OK" @click="handleFinish" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, toast } = usePageSetup()
const { goHome, goToRoundStart } = useNavigation()
const { gameStore, leaderboard, isGameCompleted } = useGameState()

const isFinishing = ref(false)

const handleFinish = async () => {
  if (isFinishing.value) return

  isFinishing.value = true
  try {
    await gameStore.endGame()
    await goHome()
  } catch (error) {
    const logger = useLogger()
    logger.error('Error finishing game:', error)
    toast.error(t('leaderboard.finish_error', 'Failed to finish game. Please try again.'))
    isFinishing.value = false
  }
}

const handleNextRound = async () => {
  // Continue to next round
  await goToRoundStart()
}

const handleBack = () => {
  goHome()
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
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.leaderboard-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.leaderboard-header {
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

.leaderboard-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.leaderboard-title {
  width: 100%;
  max-width: 400px;
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

.player-rank {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.player-rank-bg {
  position: absolute;
  width: 100%;
  height: 100%;
}

.player-rank-text {
  position: relative;
  z-index: 1;
  font-size: 1.5rem;
  color: #a5261f;
}

.ok-btn {
  width: 100%;
  max-width: 300px;
  cursor: pointer;
  margin-top: auto;
}
</style>
