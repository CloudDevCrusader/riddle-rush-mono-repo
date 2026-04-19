<template>
  <GameBackground>
    <div class="scoring-page-root">
      <GameSessionTopBar
        back-test-id="results-toolbar-back"
        pause-test-id="results-pause-button"
        :pause-disabled="isConfirming"
        :back-disabled="isConfirming"
        @back="handleScoringToolbarBack"
        @pause="openPauseModal"
      >
        <span class="scoring-page__toolbar-title">{{ scoringPageHeading }}</span>
      </GameSessionTopBar>

      <div
        v-if="!sessionViewReady"
        class="scoring-page scoring-page--loading"
        data-testid="results-session-loading"
        aria-busy="true"
      >
        <p class="scoring-page__loading-text">{{ t('common.loading') }}</p>
      </div>

      <div v-else class="scoring-page" data-testid="results-header">
        <h1 class="scoring-page__sr-only">{{ scoringPageHeading }}</h1>

        <p
          v-if="!isAnswerInputEnabled"
          class="scoring-page__verbal-hint"
          data-testid="scoring-verbal-hint"
        >
          {{ t('scoring.verbal_hint') }}
        </p>

        <div
          v-if="players.length === 0"
          class="scoring-page__column"
          data-testid="results-empty-state"
        >
          <p class="scoring-page__empty-text">
            {{ t('game.no_active_session', 'No active game session.') }}
          </p>
          <GameButton
            variant="primary"
            size="lg"
            full-width
            data-testid="results-go-players"
            @click="goToPlayers"
          >
            {{ t('players.title', 'Players') }}
          </GameButton>
        </div>

        <div v-else class="scoring-page__column scoring-page__column--scrollable">
          <div class="scoring-page__list-scroll" data-testid="results-scores-container">
            <div class="scoring-page__list">
              <div
                v-for="(player, index) in players"
                :key="player.id"
                class="scoring-page__player-card scoring-page__player-card--enter"
                :style="{ '--scoring-card-enter-delay': `${index * 50}ms` }"
                :data-testid="`results-player-entry-${index}`"
              >
                <div class="scoring-page__player-header">
                  <span class="scoring-page__rank" :data-testid="`predicted-rank-${index}`">
                    #{{ projectedRanks.get(player.id) ?? Number(index) + 1 }}
                  </span>
                  <div class="scoring-page__player-main">
                    <GamePlayerCard
                      :player="player"
                      :show-indicator="false"
                      :show-answer="isAnswerInputEnabled"
                      embedded
                      class="scoring-page__player-card-inner scoring-page__player-card-inner--name-only"
                    />
                    <p class="scoring-page__base-score" data-testid="base-score">
                      <span class="scoring-page__base-score-label">{{
                        t('scoring.base_score', 'Score')
                      }}</span>
                      <span class="scoring-page__base-score-value"
                        >{{ projectedTotalScore(player) }} {{ t('scoring.points', 'pts') }}</span
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

                  <div
                    class="scoring-page__round-score"
                    aria-live="polite"
                    :aria-label="t('scoring.round_points', 'This round')"
                  >
                    <span class="scoring-page__round-score-value">
                      <span
                        class="scoring-page__round-score-num"
                        :data-testid="`scoring-page-score-value-${index}`"
                        >{{ pendingScores.get(player.id) ?? 0 }}</span
                      >
                      <span class="scoring-page__round-score-unit">{{
                        t('scoring.points', 'pts')
                      }}</span>
                    </span>
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
          </div>

          <footer class="scoring-page__save-bar" data-testid="results-save-bar">
            <p
              v-if="canConfirmRoundScores && !hasConfirmedRound"
              class="scoring-page__save-hint"
              data-testid="results-save-actions-hint"
            >
              {{ t('scoring.save_actions_hint') }}
            </p>

            <GameButtonGroup layout="stack" pill relaxed class="scoring-page__save-actions">
              <GameButton
                variant="primary"
                size="lg"
                full-width
                :loading="isConfirming && pendingSaveAction === 'next'"
                :disabled="!canConfirmRoundScores || hasConfirmedRound || isConfirming"
                class="scoring-page__button"
                data-testid="save-and-next-round"
                @click="handleSaveAndNextRound"
              >
                {{ t('scoring.next_round') }}
              </GameButton>
              <GameButton
                variant="secondary"
                size="lg"
                full-width
                :loading="isConfirming && pendingSaveAction === 'leaderboard'"
                :disabled="!canConfirmRoundScores || hasConfirmedRound || isConfirming"
                class="scoring-page__button"
                data-testid="save-and-leaderboard"
                @click="handleSaveAndLeaderboard"
              >
                {{ t('scoring.go_to_leaderboard') }}
              </GameButton>
            </GameButtonGroup>
          </footer>
        </div>
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
import { SCORE_INCREMENT } from '@riddle-rush/shared/constants';
import type { Player } from '@riddle-rush/types/game';
import orderBy from 'lodash-es/orderBy';

const { t } = usePageSetup();
const { gameStore, players, currentRound, flowState, canConfirmRoundScores } = useGameState();
const { goToRoundStart, goToLeaderboard, goToPlayers, goToGame, goBack } = useNavigation();
const { playClick, playScoreIncrease } = useAudio();
const { isAnswerInputEnabled } = useFeatureFlags();
const route = useRoute();
const logger = useLogger();

type PendingSaveAction = 'next' | 'leaderboard' | null;

// Pending scores for each player (local state before confirming)
const pendingScores = reactive(new Map<string, number>());

const syncPendingScores = (nextPlayers: Player[]) => {
  pendingScores.clear();
  for (const player of nextPlayers) {
    pendingScores.set(player.id, player.currentRoundScore ?? 0);
  }
};

/** Total score if pending round points were applied now (matches assignPlayerScore deltas). */
const projectedTotalScore = (player: Player) =>
  player.totalScore - player.currentRoundScore + (pendingScores.get(player.id) ?? 0);

const gameId = computed(() => route.params.gameId as string | undefined);

const isConfirming = ref(false);
const pendingSaveAction = ref<PendingSaveAction>(null);
const showPauseModal = ref(false);

/** False until session is loaded from DB for this route (avoids empty v-for flash on cold navigation). */
const sessionViewReady = ref(false);

const hasConfirmedRound = ref(false);

/** Toolbar, SR heading, and document title — includes current round number. */
const scoringPageHeading = computed(
  () => `${t('scoring.title')} · ${t('game.round')} ${currentRound.value || 1}`
);

// Projected ranks use same total as on-card display (totalScore includes currentRoundScore until adjusted)
const projectedRanks = computed(() => {
  const ranked = orderBy(
    players.value.map((p) => ({
      id: p.id,
      projected: projectedTotalScore(p),
    })),
    ['projected'],
    ['desc']
  );

  const ranks = new Map<string, number>();
  ranked.forEach((p, i) => ranks.set(p.id, i + 1));
  return ranks;
});

const incrementScore = (playerId: string) => {
  const current = pendingScores.get(playerId) ?? 0;
  pendingScores.set(playerId, current + SCORE_INCREMENT);
  void playClick();
};

const decrementScore = (playerId: string) => {
  const current = pendingScores.get(playerId) ?? 0;
  // Allow negative adjustments to reflect point deductions
  pendingScores.set(playerId, current - SCORE_INCREMENT);
  void playClick();
};

/**
 * Persist pending round points and finalize the round in the store.
 * Returns false if the round could not be completed (wrong state or validation).
 */
const persistRoundScores = async (): Promise<boolean> => {
  if (flowState.value !== 'round-complete' || hasConfirmedRound.value) {
    return false;
  }

  try {
    for (const [playerId, score] of pendingScores) {
      await gameStore.assignPlayerScore(playerId, score);
    }
    await gameStore.completeRound();
    hasConfirmedRound.value = true;
    void playScoreIncrease();
    return true;
  } catch (error) {
    logger.error('Failed to save round scores:', error);
    return false;
  }
};

const handleSaveAndNextRound = async () => {
  if (isConfirming.value) return;
  isConfirming.value = true;
  pendingSaveAction.value = 'next';
  try {
    const ok = await persistRoundScores();
    if (!ok) return;
    await goToRoundStart();
  } finally {
    pendingSaveAction.value = null;
    isConfirming.value = false;
  }
};

const handleSaveAndLeaderboard = async () => {
  if (isConfirming.value) return;
  isConfirming.value = true;
  pendingSaveAction.value = 'leaderboard';
  try {
    const ok = await persistRoundScores();
    if (!ok) return;
    await gameStore.completeGame();
    await goToLeaderboard();
  } finally {
    pendingSaveAction.value = null;
    isConfirming.value = false;
  }
};

const openPauseModal = () => {
  void playClick();
  showPauseModal.value = true;
};

const handleScoringToolbarBack = () => {
  if (isConfirming.value) return;
  void playClick();
  const id = gameId.value;
  if (id) {
    void goToGame(id);
  } else {
    goBack();
  }
};

const handlePauseResume = () => {
  // Modal closes via v-model
};

const handlePauseRestart = () => {
  void goToPlayers();
};

const handlePauseHome = () => {
  // PauseModal navigates home after abandon
};

const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && !showPauseModal.value) {
    showPauseModal.value = true;
  }
};

watch(
  players,
  (nextPlayers: Player[]) => {
    syncPendingScores(nextPlayers);
  },
  { immediate: true }
);

watch(flowState, (newFlow: string, oldFlow: string) => {
  if (newFlow === 'round-complete' && oldFlow !== 'round-complete') {
    hasConfirmedRound.value = false;
  }
  if (newFlow === 'in-round' && oldFlow === 'decision') {
    hasConfirmedRound.value = false;
  }
});

onMounted(async () => {
  const id = gameId.value;
  const sessionMatchesRoute = Boolean(id && gameStore.currentSession.value?.id === id);

  if (!sessionMatchesRoute) {
    sessionViewReady.value = false;
    if (id && gameStore.currentSession.value?.id !== id) {
      try {
        await gameStore.loadSessionById(id);
      } catch {
        await gameStore.loadFromDB();
      }
    } else if (!gameStore.currentSession.value) {
      await gameStore.loadFromDB();
    }
  }

  sessionViewReady.value = true;

  if (flowState.value === 'decision') {
    hasConfirmedRound.value = true;
  }

  window.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscapeKey);
});

useLocalizedPageSeo({
  title: () => scoringPageHeading.value,
  description: () => t('scoring.description'),
});
</script>

<style scoped lang="scss">
@use 'assets/scss/design-system' as *;

.scoring-page-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  box-sizing: border-box;
}

.scoring-page__toolbar-title {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 3.5vw, 1.65rem);
  font-weight: var(--font-weight-black);
  color: #ffd700;
  -webkit-text-stroke: clamp(1px, 0.25vw, 2px) #8b4513;
  paint-order: stroke fill;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 0 10px rgba(255, 215, 0, 0.25);
  letter-spacing: 0.06em;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(100%, 22rem);
}

.scoring-page {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-2xl);
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
}

.scoring-page--loading {
  justify-content: center;
}

.scoring-page__loading-text {
  margin: 0;
  font-family: var(--font-display);
  font-size: mockup-clamp(18px);
  color: var(--color-text-white);
  text-align: center;
}

.scoring-page__empty-text {
  margin: 0;
  text-align: center;
  font-family: var(--font-sans);
  font-size: mockup-clamp(16px);
  color: var(--color-text-white);
}

.scoring-page__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.scoring-page__verbal-hint {
  max-width: 36rem;
  margin: 0;
  padding: mockup-clamp(12px) mockup-clamp(20px);
  font-family: var(--font-display);
  font-size: mockup-clamp(15px);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-white);
  text-align: center;
  line-height: 1.4;
  border-radius: var(--radius-full);
  background: rgba(8, 42, 108, 0.45);
  border: 2px solid rgba(255, 255, 255, 0.28);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 mockup-clamp(4px) mockup-clamp(12px) rgba(0, 0, 0, 0.15);
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

.scoring-page__column--scrollable {
  flex: 1 1 auto;
  min-height: 0;
  gap: var(--spacing-md);
}

.scoring-page__list-scroll {
  --scoring-visible-rows: 3;
  /* Name + totals + round score controls */
  --scoring-row-estimate: #{mockup-clamp(200px)};
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  max-height: min(
    62dvh,
    calc(
      var(--scoring-visible-rows) * var(--scoring-row-estimate) +
        (var(--scoring-visible-rows) - 1) * var(--spacing-xl)
    )
  );
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  /* Room around cards so the list does not sit flush to the scrollbar / edges */
  scrollbar-gutter: stable;
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-md);
  box-sizing: border-box;
}

.scoring-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: 100%;
}

.scoring-page__save-bar {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  margin-top: auto;
  padding-top: var(--spacing-sm);
  padding-bottom: max(var(--spacing-sm), env(safe-area-inset-bottom, 0px));
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: linear-gradient(
    180deg,
    rgba(8, 28, 72, 0) 0%,
    rgba(8, 28, 72, 0.82) 22%,
    rgba(6, 22, 58, 0.97) 100%
  );
}

.scoring-page__player-card--enter {
  animation: scoring-page-card-enter 0.3s ease both;
  animation-delay: var(--scoring-card-enter-delay, 0ms);
}

@keyframes scoring-page-card-enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .scoring-page__player-card--enter {
    animation: none;
  }
}

.scoring-page__player-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(
    165deg,
    rgba(44, 152, 255, 0.42) 0%,
    rgba(13, 90, 180, 0.72) 45%,
    rgba(8, 42, 108, 0.88) 100%
  );
  border: mockup-clamp(4px) solid var(--color-border-gold-dark);
  border-radius: mockup-clamp(32px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.38),
    inset 0 -2px 6px rgba(0, 0, 0, 0.12),
    0 mockup-clamp(6px) 0 rgba(166, 126, 47, 0.55),
    0 12px 28px rgba(0, 0, 0, 0.22);
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

.scoring-page__player-card-inner--name-only :deep(.game-player-card__name) {
  font-size: mockup-clamp(20px);
  font-weight: var(--font-weight-black);
  color: #fff8dc;
  letter-spacing: 0.02em;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.35),
    0 mockup-clamp(3px) mockup-clamp(8px) rgba(0, 0, 0, 0.45);
}

.scoring-page__rank {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: mockup-clamp(52px);
  padding: mockup-clamp(8px) mockup-clamp(12px);
  font-family: var(--font-display);
  font-size: mockup-clamp(18px);
  font-weight: var(--font-weight-black);
  color: var(--color-text-yellow);
  text-align: center;
  line-height: 1.1;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 213, 79, 0.45);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
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
  padding: mockup-clamp(8px) mockup-clamp(16px);
  font-family: var(--font-display);
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.18);
  border: 2px solid rgba(255, 255, 255, 0.22);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.scoring-page__base-score-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: rgba(255, 255, 255, 0.92);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.scoring-page__base-score-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-black);
  color: var(--color-text-yellow);
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.25),
    0 2px 4px rgba(0, 0, 0, 0.35);
}

.scoring-page__score-controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-xs) 0;
  background: transparent;
  border: none;
  border-radius: 0;
}

.scoring-page__score-controls :deep(.scoring-page__delta-btn) {
  flex: 0 0 auto;
  width: mockup-clamp(52px);
  height: mockup-clamp(52px);
  min-width: mockup-clamp(52px);
  min-height: mockup-clamp(52px);
  padding: 0;
  border-radius: var(--radius-full);
  font-size: mockup-clamp(28px);
  font-weight: var(--font-weight-black);
  line-height: 1;
  border-width: mockup-clamp(3px);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.35),
    0 mockup-clamp(4px) 0 rgba(0, 0, 0, 0.2);

  &:active:not(:disabled) {
    transform: translateY(2px);
  }
}

.scoring-page__round-score {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: mockup-clamp(4px);
  min-width: 0;
  padding: mockup-clamp(12px) var(--spacing-md);
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, rgba(12, 48, 102, 0.92) 0%, rgba(5, 28, 72, 0.96) 100%);
  border: mockup-clamp(3px) solid rgba(255, 213, 79, 0.65);
  box-shadow:
    inset 0 2px 8px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 2px 6px rgba(0, 0, 0, 0.2);
}

.scoring-page__round-score-value {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: mockup-clamp(4px);
  font-family: var(--font-display);
  line-height: 1.05;
}

.scoring-page__round-score-num {
  font-size: mockup-clamp(28px);
  font-weight: var(--font-weight-black);
  color: #ffffff;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.25),
    0 mockup-clamp(3px) mockup-clamp(6px) rgba(0, 0, 0, 0.55);
}

.scoring-page__round-score-unit {
  font-size: mockup-clamp(17px);
  font-weight: var(--font-weight-bold);
  color: #ffffff;
  text-shadow: 0 mockup-clamp(2px) mockup-clamp(4px) rgba(0, 0, 0, 0.45);
  opacity: 0.98;
}

.scoring-page__save-hint {
  margin: 0;
  max-width: 36rem;
  text-align: center;
  font-family: var(--font-sans);
  font-size: mockup-clamp(15px);
  font-weight: var(--font-weight-semibold);
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.45;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.scoring-page__save-actions :deep(.scoring-page__button) {
  width: 100%;
}

.scoring-page__button--tertiary {
  opacity: 0.95;
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
    border-radius: mockup-clamp(26px);
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

  .scoring-page__score-controls :deep(.scoring-page__delta-btn) {
    width: mockup-clamp(46px);
    height: mockup-clamp(46px);
    min-width: mockup-clamp(46px);
    min-height: mockup-clamp(46px);
    font-size: mockup-clamp(24px);
  }

  .scoring-page__round-score-num {
    font-size: mockup-clamp(24px);
  }

  .scoring-page__round-score-unit {
    font-size: mockup-clamp(15px);
  }

  .scoring-page__save-hint {
    font-size: mockup-clamp(14px);
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

  .scoring-page__score-controls :deep(.scoring-page__delta-btn) {
    width: mockup-clamp(42px);
    height: mockup-clamp(42px);
    min-width: mockup-clamp(42px);
    min-height: mockup-clamp(42px);
    font-size: mockup-clamp(22px);
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
