<template>
  <GameBackground>
    <div class="leaderboard-page" data-testid="leaderboard-container">
      <!-- Header -->
      <GameHeader variant="gold">
        {{ t('leaderboard.title', 'Leaderboard') }}
      </GameHeader>

      <!-- Ranked player list -->
      <GameScrollList :show-ranks="true" max-height="500px">
        <div
          v-for="(entry, index) in leaderboard"
          :key="entry.id"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: Number(index) * 80 } }"
          class="leaderboard-row"
          :data-testid="`leaderboard-entry-${index}`"
        >
          <span class="leaderboard-row__name" :data-testid="`leaderboard-player-name-${index}`">{{
            entry.name
          }}</span>
          <GameDisplay size="md" :glow="false" :data-testid="`leaderboard-player-score-${index}`">
            {{ entry.totalScore }}
          </GameDisplay>
        </div>
      </GameScrollList>

      <!-- Navigation buttons -->
      <div class="leaderboard-page__actions leaderboard-action-shelf">
        <GameButton
          v-if="!isGameCompleted"
          variant="primary"
          size="lg"
          data-testid="leaderboard-next-round-button"
          @click="handleNextRound"
        >
          {{ t('leaderboard.next_round', 'Next Round') }}
        </GameButton>
        <GameButton
          variant="secondary"
          size="lg"
          data-testid="leaderboard-finish-button"
          @click="handleFinish"
        >
          {{ t('leaderboard.finish', 'OK') }}
        </GameButton>
      </div>
    </div>
  </GameBackground>
</template>

<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'slide-left', mode: 'out-in' } });

const { t, toast } = usePageSetup();
const { goHome, goToRoundStart } = useNavigation();
const { gameStore, leaderboard, isGameCompleted } = useGameState();

const isFinishing = ref(false);

const handleFinish = async () => {
  if (isFinishing.value) return;

  isFinishing.value = true;
  try {
    await gameStore.endGame();
    await goHome();
  } catch (error) {
    const logger = useLogger();
    logger.error('Error finishing game:', error);
    toast.error(t('leaderboard.finish_error', 'Failed to finish game. Please try again.'));
    isFinishing.value = false;
  }
};

const handleNextRound = async () => {
  await goToRoundStart();
};

useLocalizedPageSeo({
  title: () => t('leaderboard.title'),
  description: () => t('leaderboard.description'),
});
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

.leaderboard-action-shelf {
  width: min(100%, 640px);
  margin-inline: auto;
  box-sizing: border-box;
  min-width: 0;
}

.leaderboard-page__actions {
  display: flex;
  gap: var(--spacing-lg);
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
}

@media (min-width: 481px) {
  .leaderboard-page__actions {
    flex-wrap: nowrap;
  }

  .leaderboard-page__actions :deep(.game-button) {
    flex: 1 1 0;
    min-width: 0;
  }
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

// Small phone adjustments
@media (max-width: 480px) {
  .leaderboard-page {
    gap: var(--spacing-lg);
    padding: var(--spacing-xl) var(--spacing-sm);
  }

  .leaderboard-page__subtitle {
    font-size: var(--font-size-lg);
    letter-spacing: 0.5px;
  }

  .leaderboard-page__actions {
    gap: var(--spacing-md);
    flex-direction: column;
  }

  .leaderboard-row__name {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 360px) {
  .leaderboard-page {
    gap: var(--spacing-md);
    padding: var(--spacing-lg) var(--spacing-xs);
  }

  .leaderboard-page__actions {
    gap: var(--spacing-sm);
  }
}

@media (max-width: 320px) {
  .leaderboard-page {
    padding: var(--spacing-md) var(--spacing-xs);
    gap: var(--spacing-md);
  }
}
</style>
