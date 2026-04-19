<template>
  <GameBackground>
    <div class="leaderboard-page-root">
      <GameSessionTopBar
        back-test-id="leaderboard-back-button"
        pause-test-id="leaderboard-pause-button"
        :back-disabled="isFinishing || isRestarting"
        :pause-disabled="isFinishing || isRestarting"
        @back="handleLeaderboardBack"
        @pause="openPauseModal"
      >
        <span class="leaderboard-page__toolbar-title">{{
          t('leaderboard.title', 'Leaderboard')
        }}</span>
      </GameSessionTopBar>

      <div class="leaderboard-page" data-testid="leaderboard-container">
        <div class="leaderboard-page__hero">
          <p class="leaderboard-page__ranking-pill" data-testid="leaderboard-ranking-pill">
            {{ t('leaderboard.ranking', 'Ranking') }}
          </p>
        </div>

        <div class="leaderboard-page__list-panel">
          <GameScrollList
            :show-ranks="false"
            class="leaderboard-page__scroll-list"
            :max-height="leaderboardListMaxHeight"
          >
            <div
              v-for="(entry, index) in leaderboard"
              :key="entry.id"
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{
                opacity: 1,
                y: 0,
                transition: { duration: 300, delay: Number(index) * 80 },
              }"
              class="leaderboard-row"
              :data-testid="`leaderboard-entry-${index}`"
            >
              <span
                class="leaderboard-place"
                :data-testid="`leaderboard-place-${index}`"
                :aria-label="`${t('leaderboard.place')} ${entry.rank}`"
              >
                {{ entry.rank }}
              </span>
              <span
                class="leaderboard-row__name"
                :data-testid="`leaderboard-player-name-${index}`"
                >{{ entry.name }}</span
              >
              <GameDisplay
                size="md"
                :glow="true"
                :data-testid="`leaderboard-player-score-${index}`"
              >
                {{ entry.totalScore }}
              </GameDisplay>
            </div>
          </GameScrollList>
        </div>

        <footer class="leaderboard-page__action-bar">
          <div class="leaderboard-action-shelf">
            <GameButtonGroup layout="responsive" pill relaxed>
              <GameButton
                v-if="!isGameCompleted"
                variant="secondary"
                size="lg"
                full-width
                :disabled="isFinishing || isRestarting"
                data-testid="leaderboard-next-round-button"
                @click="handleNextRound"
              >
                {{ t('leaderboard.next_round', 'Next Round') }}
              </GameButton>
              <GameButton
                variant="warning"
                size="lg"
                full-width
                :loading="isRestarting"
                :disabled="isFinishing || isRestarting"
                data-testid="leaderboard-restart-button"
                @click="handleRestart"
              >
                {{ t('pause.restart') }}
              </GameButton>
              <GameButton
                variant="primary"
                size="lg"
                full-width
                :loading="isFinishing"
                :disabled="isRestarting || isFinishing"
                data-testid="leaderboard-finish-button"
                @click="handleFinish"
              >
                {{ t('leaderboard.finish') }}
              </GameButton>
            </GameButtonGroup>
          </div>
        </footer>
      </div>
    </div>

    <LazyPauseModal
      v-model="showPauseModal"
      @resume="handlePauseResume"
      @restart="handlePauseRestart"
      @home="handlePauseHome"
    />
  </GameBackground>
</template>

<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'slide-left', mode: 'out-in' } });

const { t, toast } = usePageSetup();
const { goHome, goToRoundStart, goToPlayers, goBack } = useNavigation();
const { playClick } = useAudio();
const { gameStore, leaderboard, isGameCompleted } = useGameState();

const isFinishing = ref(false);
const isRestarting = ref(false);
const showPauseModal = ref(false);

/** Scroll area height tuned to ~3 ranking rows (mockup-style list). */
const leaderboardListMaxHeight = 'min(56dvh, 24rem)';

const handleLeaderboardBack = () => {
  if (isFinishing.value || isRestarting.value) return;
  goBack();
};

const handleFinish = async () => {
  if (isFinishing.value || isRestarting.value) return;

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

const openPauseModal = () => {
  void playClick();
  showPauseModal.value = true;
};

const handlePauseResume = () => {};

const handlePauseRestart = async () => {
  await handleRestart();
};

const handlePauseHome = () => {};

const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && !showPauseModal.value && !isFinishing.value && !isRestarting.value) {
    showPauseModal.value = true;
  }
};

const handleRestart = async () => {
  if (isRestarting.value || isFinishing.value) return;

  isRestarting.value = true;
  try {
    await gameStore.clearSessionForNewGame();
    await goToPlayers();
  } catch (error) {
    const logger = useLogger();
    logger.error('Error restarting from leaderboard:', error);
    toast.error(t('leaderboard.restart_error'));
  } finally {
    isRestarting.value = false;
  }
};

useLocalizedPageSeo({
  title: () => t('leaderboard.title'),
  description: () => t('leaderboard.description'),
});

onMounted(() => {
  window.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscapeKey);
});
</script>

<style scoped lang="scss">
@use 'assets/scss/design-system' as *;

.leaderboard-page-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  box-sizing: border-box;
}

.leaderboard-page__toolbar-title {
  font-family: var(--font-display);
  font-size: clamp(1rem, 3vw, 1.5rem);
  font-weight: var(--font-weight-black);
  color: #ffd700;
  -webkit-text-stroke: clamp(1px, 0.25vw, 2px) #8b4513;
  paint-order: stroke fill;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 0 10px rgba(255, 215, 0, 0.25);
  letter-spacing: 0.04em;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(100%, 14rem);
}

.leaderboard-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  flex: 1 1 auto;
  padding: 0 var(--spacing-lg) max(var(--spacing-md), env(safe-area-inset-bottom, 0px));
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
}

.leaderboard-page__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  width: min(100%, 640px);
}

.leaderboard-page__ranking-pill {
  margin: 0;
  padding: mockup-clamp(8px) mockup-clamp(28px);
  font-family: var(--font-display);
  font-size: mockup-clamp(17px);
  font-weight: var(--font-weight-black);
  letter-spacing: 0.02em;
  color: #c8f4ff;
  text-align: center;
  line-height: 1.2;
  border-radius: var(--radius-full);
  border: mockup-clamp(3px) solid #c9a961;
  box-shadow:
    0 mockup-clamp(4px) mockup-clamp(10px) rgba(0, 0, 0, 0.28),
    inset 0 2px 0 rgba(255, 255, 255, 0.35),
    inset 0 -2px 6px rgba(0, 20, 60, 0.35);
  background: linear-gradient(180deg, #4eb8ff 0%, #1a6fd4 42%, #0d4a9e 100%);
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.35),
    0 mockup-clamp(2px) 0 #0a2a66,
    0 mockup-clamp(3px) mockup-clamp(6px) rgba(0, 0, 0, 0.45);
}

.leaderboard-page__list-panel {
  width: min(100%, 640px);
  margin-inline: auto;
  box-sizing: border-box;
  min-width: 0;
  flex: 1 1 auto;
  padding: var(--spacing-lg);
  border-radius: mockup-clamp(24px);
  background: rgba(8, 42, 108, 0.35);
  border: 2px solid rgba(255, 255, 255, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 mockup-clamp(8px) mockup-clamp(20px) rgba(0, 0, 0, 0.2);
}

.leaderboard-page :deep(.leaderboard-page__scroll-list.game-scroll-list) {
  border-radius: mockup-clamp(18px);
  background: rgba(0, 20, 55, 0.2);
  padding: var(--spacing-md);
}

.leaderboard-page :deep(.game-scroll-list__row) {
  align-items: center;
  gap: var(--spacing-lg);
  padding: mockup-clamp(16px) mockup-clamp(18px);
  margin-bottom: var(--spacing-xl);
  background: linear-gradient(180deg, #ffffff 0%, #f3f8ff 100%);
  border-radius: mockup-clamp(22px);
  border: mockup-clamp(3px) solid rgba(201, 169, 97, 0.55);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 mockup-clamp(4px) 0 rgba(166, 126, 47, 0.35),
    0 mockup-clamp(8px) mockup-clamp(18px) rgba(0, 0, 0, 0.18);

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    transform: none;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.95),
      0 mockup-clamp(4px) 0 rgba(166, 126, 47, 0.35),
      0 mockup-clamp(8px) mockup-clamp(18px) rgba(0, 0, 0, 0.18);
  }
}

.leaderboard-page :deep(.game-scroll-list__content) {
  min-width: 0;
}

.leaderboard-action-shelf {
  width: 100%;
  max-width: min(100%, 640px);
  margin-inline: auto;
  box-sizing: border-box;
  min-width: 0;
}

.leaderboard-page__action-bar {
  flex-shrink: 0;
  width: 100%;
  max-width: min(100%, 640px);
  margin-top: auto;
  padding-top: var(--spacing-xl);
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: rgb(6 22 58 / 0.88);
  border-top: 1px solid rgb(255 255 255 / 0.14);
  box-shadow: 0 -8px 24px rgb(0 0 0 / 0.12);
  margin-inline: calc(-1 * var(--spacing-lg));
  padding-inline: var(--spacing-lg);
  padding-bottom: max(var(--spacing-sm), env(safe-area-inset-bottom, 0px));
  border-radius: mockup-clamp(20px) mockup-clamp(20px) 0 0;
}

.leaderboard-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  width: 100%;
  min-width: 0;
}

.leaderboard-place {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: mockup-clamp(40px);
  height: mockup-clamp(40px);
  padding-inline: mockup-clamp(8px);
  font-family: var(--font-display);
  font-size: mockup-clamp(18px);
  font-weight: var(--font-weight-black);
  line-height: 1;
  color: #0a2f7a;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
  background: linear-gradient(180deg, #e8f2ff 0%, #c8dcff 100%);
  border-radius: var(--radius-full);
  border: mockup-clamp(2px) solid rgba(10, 47, 122, 0.25);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 mockup-clamp(2px) mockup-clamp(4px) rgba(0, 0, 0, 0.12);
}

.leaderboard-row__name {
  flex: 1;
  min-width: 0;
  font-family: var(--font-display);
  font-size: mockup-clamp(17px);
  font-weight: var(--font-weight-bold);
  color: #0a2f7a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}

.leaderboard-row :deep(.game-display) {
  flex-shrink: 0;
  min-width: mockup-clamp(52px);
  text-align: right;
}

@media (max-width: 480px) {
  .leaderboard-page {
    gap: var(--spacing-xl);
    padding-inline: var(--spacing-md);
  }

  .leaderboard-page__action-bar {
    margin-inline: calc(-1 * var(--spacing-md));
    padding-inline: var(--spacing-md);
  }

  .leaderboard-page__ranking-pill {
    font-size: mockup-clamp(15px);
    padding: mockup-clamp(6px) mockup-clamp(22px);
  }

  .leaderboard-row__name {
    font-size: mockup-clamp(15px);
  }
}

@media (max-width: 360px) {
  .leaderboard-page {
    gap: var(--spacing-lg);
    padding-inline: var(--spacing-sm);
  }

  .leaderboard-page__action-bar {
    margin-inline: calc(-1 * var(--spacing-sm));
    padding-inline: var(--spacing-sm);
  }

  .leaderboard-page :deep(.game-scroll-list__row) {
    gap: var(--spacing-md);
    padding: mockup-clamp(12px) mockup-clamp(12px);
  }
}
</style>
