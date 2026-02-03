<template>
  <GameBackground>
    <div class="leaderboard-page">
      <!-- Header -->
      <GameHeader variant="gold">
        {{ t('leaderboard.title') }}
      </GameHeader>

      <!-- Ranking subtitle panel -->
      <GamePanel variant="blue" padding="sm">
        <h2 class="leaderboard-page__subtitle">
          {{ t('leaderboard.ranking') }}
        </h2>
      </GamePanel>

      <!-- Ranked player list -->
      <GameScrollList :show-ranks="true" max-height="500px">
        <div v-for="entry in leaderboard" :key="entry.id" class="leaderboard-row">
          <span class="leaderboard-row__name">{{ entry.name }}</span>
          <GameDisplay size="md" :glow="false">
            {{ entry.totalScore }}
          </GameDisplay>
        </div>
      </GameScrollList>

      <!-- Navigation buttons -->
      <div class="leaderboard-page__actions">
        <GameButton v-if="!isGameCompleted" variant="primary" size="lg" @click="handleNextRound">
          {{ t('leaderboard.next_round') }}
        </GameButton>
        <GameButton variant="secondary" size="lg" @click="handleFinish">
          {{ t('leaderboard.finish') }}
        </GameButton>
      </div>
    </div>
  </GameBackground>
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
    toast.error(t('leaderboard.finish_error'))
    isFinishing.value = false
  }
}

const handleNextRound = async () => {
  // Continue to next round
  await goToRoundStart()
}

useHead({
  title: t('leaderboard.title'),
  meta: [
    {
      name: 'description',
      content: 'Game leaderboard',
    },
  ],
})
</script>

<style scoped lang="scss">
.leaderboard-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl) var(--spacing-md);
  min-height: 100vh;
  min-height: 100dvh;
}

.leaderboard-page__subtitle {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: white;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.leaderboard-page__actions {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

// Leaderboard row styling (slot content for GameScrollList)
.leaderboard-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  width: 100%;
}

.leaderboard-row__name {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-dark);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
