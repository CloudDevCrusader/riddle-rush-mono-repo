<template>
  <div class="game-page">
    <!-- Background -->
    <div class="game-bg" />

    <!-- Top Bar -->
    <GameSessionTopBar
      back-test-id="back-button"
      pause-test-id="game-pause-button"
      @back="handleBack"
      @pause="openPauseModal"
    >
      <div class="round-indicator" data-testid="game-round-indicator">
        <span :key="formattedRound" class="round-text"
          >{{ t('game.round') }} {{ formattedRound }}</span
        >
      </div>
    </GameSessionTopBar>

    <!-- Main Game Area -->
    <div class="game-container">
      <Transition name="round-reveal" appear>
        <div v-if="currentCategory" :key="roundRevealKey" class="round-reveal-stack">
          <div class="category-panel" data-testid="game-category-info">
            <div class="category-panel__orange">
              <div class="category-label">{{ t('common.category').toUpperCase() }}</div>
            </div>
            <div class="category-panel__cream">
              <div class="category-name">
                <span
                  class="category-name__emoji"
                  data-testid="game-category-emoji"
                  aria-hidden="true"
                  >{{ currentCategoryEmoji }}</span
                >
                <span class="category-name__text">{{
                  t(`categories.${currentCategory.searchWord}`, currentCategory.name).toUpperCase()
                }}</span>
              </div>
            </div>
          </div>
          <div class="letter-display" data-testid="game-letter-info">
            <span
              class="letter-value"
              :data-letter="currentLetter ? currentLetter.toUpperCase() : 'A'"
            >
              {{ currentLetter ? currentLetter.toUpperCase() : 'A' }}
            </span>
          </div>
        </div>
      </Transition>

      <!-- Player Turn Section (for multiplayer) -->
      <Transition name="answer-panel" appear>
        <div
          v-if="
            !skipRoundsEnabled && players.length > 0 && currentPlayerTurn && !allPlayersSubmitted
          "
          :key="`${currentPlayerTurn.id}-${roundRevealKey}`"
          class="answer-input-section"
        >
          <div class="player-turn-indicator" data-testid="game-player-turn">
            <span class="turn-label">{{ t('game.current_turn', 'Current Turn') }}:</span>
            <span class="turn-name" data-testid="game-player-name">{{
              currentPlayerTurn.name
            }}</span>
          </div>
          <!-- verbal-mode-hint removed — instructions now live on the results page -->
          <form v-if="isAnswerInputEnabled" class="answer-form" @submit.prevent="submitAnswer">
            <div class="answer-input-wrapper">
              <input
                v-model="playerAnswer"
                type="text"
                class="answer-input"
                data-testid="game-answer-input"
                :placeholder="t('game.your_answer', 'Your answer…')"
                autocomplete="off"
                autocapitalize="words"
                maxlength="50"
                inputmode="search"
                enterkeyhint="done"
                @input="sanitizeInput"
                @keyup.enter="submitAnswer"
              />
              <button
                v-if="isSpeechSupported"
                type="button"
                class="mic-btn"
                :class="{ 'mic-btn--listening': isListening }"
                :aria-label="isListening ? t('game.mic_stop') : t('game.mic_start')"
                :title="isListening ? t('game.mic_stop') : t('game.mic_start')"
                :aria-pressed="isListening ? 'true' : 'false'"
                data-testid="game-mic-button"
                @click="toggleDictation"
              >
                <span class="mic-icon" aria-hidden="true">{{ isListening ? '⏹' : '🎤' }}</span>
              </button>
            </div>
            <button
              type="submit"
              class="submit-answer-btn"
              data-testid="game-submit-button"
              :disabled="isSubmitting"
            >
              {{ isAnswerInputEnabled ? t('game.submit', 'Submit') : t('common.confirm') }}
            </button>
          </form>
          <div v-else class="verbal-turn-actions">
            <button
              type="button"
              class="verbal-turn-done-btn"
              data-testid="game-verbal-turn-done"
              :disabled="isSubmitting"
              @click="submitAnswer"
            >
              {{ t('game.verbal_turn_done') }}
            </button>
          </div>
        </div>
      </Transition>

      <!-- All Players Submitted Message -->
      <Transition name="banner-pop" appear>
        <div
          v-if="flowState === 'round-complete' || flowState === 'decision' || allPlayersSubmitted"
          :key="`submitted-${roundRevealKey}`"
          class="all-submitted-message"
          data-testid="game-all-submitted"
        >
          <p>
            {{ isAnswerInputEnabled ? t('game.all_submitted') : t('game.all_submitted_verbal') }}
          </p>
        </div>
      </Transition>
    </div>

    <!-- Pause Modal (Lazy Loaded) -->
    <LazyPauseModal
      v-model="showPauseModal"
      @resume="handleResume"
      @restart="handleRestart"
      @home="handleHome"
    />

    <!-- Quit Modal (Lazy Loaded) -->
    <LazyQuitModal
      v-model="showQuitModal"
      @confirm="handleQuitConfirmed"
      @cancel="showQuitModal = false"
    />

    <!-- Bottom Navigation -->
    <div class="bottom-nav">
      <Transition name="next-pop" appear>
        <button
          v-if="canShowNext"
          data-testid="next-button"
          class="next-btn btn-primary tap-highlight no-select"
          @click="handleNext"
        >
          <img
            :src="getAssetPath('assets/alphabets/next.png')"
            :alt="nextButtonLabel"
            class="next-icon"
            loading="lazy"
          />
          <span class="next-text">{{ nextButtonLabel }}</span>
        </button>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'slide-left' } });

const { toast, t, locale, goHome: navigateToHome } = usePageSetup();
const { getAssetPath } = useAssets();
const { goToResults, goToPlayers, goToRoundStart } = useNavigation();
const {
  gameStore,
  currentCategory,
  currentLetter,
  currentRound,
  canProceedToResults,
  flowState,
  players,
  currentPlayerTurn,
  allPlayersSubmitted,
  hasActiveSession,
} = useGameState();
const { isAnswerInputEnabled } = useFeatureFlags();
const { skipRoundsEnabled } = useSettings();
const logger = useLogger();
const gameActions = useGameActions();
const audio = useAudio();
const route = useRoute();

const SPEECH_LOCALE_MAP: Record<string, string> = { de: 'de-DE', en: 'en-US' };
const speechLang = computed(() => SPEECH_LOCALE_MAP[locale.value] ?? 'en-US');

const {
  isSupported: isSpeechSupported,
  isListening,
  result: speechResult,
  start: startDictation,
  stop: stopDictation,
} = useSpeechRecognition({
  lang: speechLang,
  continuous: false,
  interimResults: false,
});

watch(speechResult, (transcript) => {
  if (!isAnswerInputEnabled.value || !transcript) return;
  playerAnswer.value = transcript;
  sanitizeInput();
});

/** Skip stop SFX when listening ends due to user stop or locale change (not recognizer `onend`). */
const suppressDictationStopSfx = ref(false);
const isStartingDictation = ref(false);

watch(isListening, (listening, wasListening) => {
  if (listening) {
    isStartingDictation.value = false;
    return;
  }
  if (wasListening && !listening) {
    if (suppressDictationStopSfx.value) {
      suppressDictationStopSfx.value = false;
      return;
    }
    void audio.playClick();
  }
});

watch(locale, () => {
  if (!isSpeechSupported.value || !isListening.value) return;
  suppressDictationStopSfx.value = true;
  stopDictation();
});

const toggleDictation = () => {
  if (isListening.value) {
    suppressDictationStopSfx.value = true;
    stopDictation();
    return;
  }
  if (isStartingDictation.value) return;
  isStartingDictation.value = true;
  playerAnswer.value = '';
  try {
    startDictation();
  } catch {
    isStartingDictation.value = false;
    return;
  }
  void audio.playClick();
  void nextTick(() => {
    if (!isListening.value) {
      window.setTimeout(() => {
        if (!isListening.value) isStartingDictation.value = false;
      }, 1500);
    }
  });
};

// Handle game ID from route parameter
const gameId = computed(() => route.params.gameId as string | undefined);

const playerAnswer = ref('');
const showPauseModal = ref(false);
const showQuitModal = ref(false);
const isSubmitting = ref(false);

const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && !showPauseModal.value) {
    showPauseModal.value = true;
  }
};

// Clear stale input when flag toggles off mid-session
watch(isAnswerInputEnabled, (enabled: boolean) => {
  if (!enabled) {
    playerAnswer.value = '';
  }
});

const formattedRound = computed(() => {
  const round = currentRound.value || 1;
  return round.toString().padStart(2, '0');
});

const roundRevealKey = computed(
  () =>
    `${currentCategory.value?.id ?? '0'}-${(currentLetter.value ?? '').toString().toUpperCase()}`
);

const gameViewReady = ref(false);

const canShowNext = computed(
  () =>
    flowState.value === 'round-complete' ||
    flowState.value === 'decision' ||
    players.value.length === 0 ||
    (skipRoundsEnabled.value &&
      players.value.length > 0 &&
      flowState.value === 'in-round' &&
      !allPlayersSubmitted.value)
);

const nextButtonLabel = computed(() =>
  skipRoundsEnabled.value && players.value.length > 0
    ? t('game.set_points', 'Set points')
    : t('common.next')
);

const answerPanelVisible = computed(
  () =>
    !skipRoundsEnabled.value &&
    players.value.length > 0 &&
    !!currentPlayerTurn.value &&
    !allPlayersSubmitted.value
);

const allSubmittedVisible = computed(
  () =>
    flowState.value === 'round-complete' ||
    flowState.value === 'decision' ||
    allPlayersSubmitted.value
);

watch(
  [gameViewReady, roundRevealKey],
  () => {
    if (!gameViewReady.value || !currentCategory.value) return;
    void audio.playRoundReveal();
  },
  { flush: 'post' }
);

watch(formattedRound, (r, prev) => {
  if (!gameViewReady.value || prev === undefined) return;
  if (r !== prev) void audio.playRoundTick();
});

watch(answerPanelVisible, (show, prev) => {
  if (!gameViewReady.value) return;
  if (show && prev === false) void audio.playAnswerPanelIn();
});

watch(allSubmittedVisible, (show, prev) => {
  if (!gameViewReady.value) return;
  if (show && prev === false) void audio.playAllSubmittedBanner();
});

watch(canShowNext, (show, prev) => {
  if (!gameViewReady.value) return;
  if (show === true && prev === false) void audio.playNextAppears();
});

const currentCategoryEmoji = computed(() =>
  currentCategory.value ? gameStore.categoryEmoji(currentCategory.value.name) : ''
);

const goHome = () => {
  navigateToHome();
};

const handleBack = () => {
  void audio.playClick();
  if (hasActiveSession.value) {
    showQuitModal.value = true;
  } else {
    goHome();
  }
};

const openPauseModal = () => {
  void audio.playClick();
  showPauseModal.value = true;
};

const handleQuitConfirmed = () => {
  showQuitModal.value = false;
  goHome();
};

// Sanitize input to prevent XSS and limit special characters
// Optimized: Direct mutation is faster than debouncing for simple sanitization
const sanitizeInput = () => {
  // Remove potentially dangerous characters
  playerAnswer.value = playerAnswer.value.replace(/[<>]/g, '');
  // Limit length
  if (playerAnswer.value.length > 50) {
    playerAnswer.value = playerAnswer.value.slice(0, 50);
  }
};

const submitAnswer = async () => {
  const player = currentPlayerTurn.value;
  if (!player) {
    return;
  }

  isSubmitting.value = true;
  try {
    // Typed mode: empty = skipped turn. Verbal mode: answer is always spoken — nothing is typed.
    const answer = playerAnswer.value.trim() || '';
    await gameStore.submitPlayerAnswer(player.id, answer);

    if (answer) {
      void audio.playTada();
      toast.success(t('game.answer_submitted', [player.name]));
    } else if (isAnswerInputEnabled.value) {
      void audio.playClick();
      toast.info(t('game.answer_skipped', [player.name]));
    } else {
      void audio.playClick();
      toast.success(t('game.verbal_turn_recorded', [player.name]));
    }

    playerAnswer.value = '';

    if (allPlayersSubmitted.value) {
      toast.info(
        isAnswerInputEnabled.value ? t('game.all_submitted') : t('game.all_submitted_verbal')
      );
    }
  } catch (error) {
    logger.error('Error submitting answer:', error);
    toast.error(t('game.error_submitting', 'Failed to submit answer'));
  } finally {
    isSubmitting.value = false;
  }
};

const handleNext = async () => {
  // In round-based flow, NEXT goes to results/scoring screen
  // Use unified flow state to determine readiness
  const hasMultiplayerPlayers = players.value.length > 0;

  if (
    skipRoundsEnabled.value &&
    hasMultiplayerPlayers &&
    !allPlayersSubmitted.value &&
    flowState.value === 'in-round'
  ) {
    let guard = 0;
    while (!allPlayersSubmitted.value && currentPlayerTurn.value && guard < 24) {
      await gameStore.submitPlayerAnswer(currentPlayerTurn.value.id, '');
      guard += 1;
    }
  }

  if (
    hasMultiplayerPlayers &&
    !allPlayersSubmitted.value &&
    flowState.value !== 'round-complete' &&
    flowState.value !== 'decision'
  ) {
    void audio.playClick();
    // Dedicated rounds: players must confirm/submit each turn. Skip-rounds: rare stuck state (auto-advance failed).
    toast.warning(
      skipRoundsEnabled.value ? t('game.wait_for_round_ready') : t('game.wait_for_players')
    );
    return;
  }

  // Ensure proper flow transition before navigation
  if (flowState.value === 'in-round' && allPlayersSubmitted.value) {
    // Transition to round-complete state to trigger results flow
    gameStore.transitionToRoundComplete();
  }

  void audio.playClick();

  // Navigate to results with game ID
  const currentGameId = gameStore.currentSession.value?.id ?? gameId.value;
  if (currentGameId) {
    goToResults(currentGameId);
  } else {
    goToResults();
  }
};

const handleResume = () => {
  // Modal already sets showPauseModal to false via v-model
  // No additional logic needed - game continues
};

const handleRestart = () => {
  // Modal already handles abandonGame and sets showPauseModal to false
  // Navigate to players page to start new game
  goToPlayers();
};

const handleHome = () => {
  // Modal already handles abandonGame, navigation, and sets showPauseModal to false
  // No additional logic needed
};

// Handle ESC key to pause
onMounted(async () => {
  // Load game session based on route parameter
  if (gameId.value) {
    try {
      let loadedSession = await gameStore.loadSessionById(gameId.value);

      // Route transitions can arrive before storage hydration; retry briefly before failing.
      if (!loadedSession) {
        for (let attempt = 0; attempt < 4; attempt++) {
          await gameStore.loadFromDB();
          loadedSession = await gameStore.loadSessionById(gameId.value);
          if (loadedSession) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }

      if (!loadedSession) {
        logger.warn('No matching session for game route, redirecting to players setup', {
          gameId: gameId.value,
        });
        toast.error(t('game.error_loading', 'Failed to load game session'));
        useLoadingStore().forceHide();
        goToPlayers();
        return;
      }
    } catch (error) {
      logger.error('Failed to load game session:', error);
      toast.error(t('game.error_loading', 'Failed to load game session'));
      useLoadingStore().forceHide();
      goToPlayers();
      return;
    }
  } else if (!hasActiveSession.value) {
    // Multiplayer flow contract: /game without active session should not create
    // an implicit single-player session. Resume setup flow instead.
    useLoadingStore().forceHide();
    if (gameStore.pendingPlayerNames.value.length > 0) {
      await goToRoundStart();
    } else {
      await goToPlayers();
    }
    return;
  }

  gameViewReady.value = true;
  // Add ESC key listener for pause
  window.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscapeKey);
});

const pageTitle = computed(
  () => `${t('game.page_title')} · ${t('game.round')} ${formattedRound.value}`
);

useLocalizedPageSeo({
  title: () => pageTitle.value,
  description: () => t('game.meta_description'),
});
</script>

<style scoped>
.game-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-gradient-main);
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.game-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* Background image optimized via Nuxt Image in template */
  /* background-image: url('/assets/alphabets/background.png'); */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 1;
  pointer-events: none;
  z-index: 0;
}

.round-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Gold text with brown outline matching mockup */
.round-text {
  position: relative;
  z-index: 2;
  display: inline-block;
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 4vw, 2.5rem);
  font-weight: var(--font-weight-black);
  color: #ffd700;
  /* Brown/dark outline using text-stroke */
  -webkit-text-stroke: clamp(1px, 0.3vw, 2px) #8b4513;
  paint-order: stroke fill;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 0 10px rgba(255, 215, 0, 0.3);
  letter-spacing: 3px;
  animation: round-badge-pop 0.45s cubic-bezier(0.34, 1.45, 0.64, 1) both;
}

@keyframes round-badge-pop {
  0% {
    opacity: 0.75;
    transform: scale(0.88);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Game Container */
.game-container {
  flex: 1;
  position: relative;
  padding: var(--spacing-xl) var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3xl);
  z-index: var(--z-base);
  min-height: 0; /* Allow flex shrinking */
}

.round-reveal-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  min-height: 0;
  gap: var(--spacing-xl);
}

.round-reveal-enter-active {
  transition: opacity 0.4s ease;
}

.round-reveal-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.round-reveal-enter-from {
  opacity: 0;
}

.round-reveal-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.round-reveal-stack .category-panel {
  animation:
    category-pop-in 0.52s cubic-bezier(0.34, 1.45, 0.64, 1) both,
    category-glow-pulse 2.5s ease-in-out 0.55s infinite;
}

/* Category name row: centered in cream band, continuous gentle motion */
.round-reveal-stack .category-name {
  animation: category-name-float 2.4s ease-in-out 0.4s infinite;
}

.round-reveal-stack .category-name__emoji {
  animation: emoji-wiggle 0.62s cubic-bezier(0.34, 1.45, 0.64, 1) 0.1s both;
}

.round-reveal-stack .letter-display {
  animation: letter-float-below 2.1s ease-in-out 0.55s infinite;
}

.round-reveal-stack .letter-display .letter-value {
  animation: letter-pop-in 0.55s cubic-bezier(0.34, 1.45, 0.64, 1) 0.14s both;
}

@keyframes category-name-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.02);
  }
}

@keyframes category-pop-in {
  0% {
    opacity: 0;
    transform: translateY(-16px) scale(0.93);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes category-glow-pulse {
  0%,
  100% {
    box-shadow:
      0 8px 0 rgba(0, 0, 0, 0.15),
      var(--shadow-lg);
  }
  50% {
    box-shadow:
      0 8px 0 rgba(0, 0, 0, 0.15),
      var(--shadow-lg),
      0 0 26px rgba(232, 149, 32, 0.38);
  }
}

@keyframes emoji-wiggle {
  0% {
    transform: rotate(-10deg) scale(0.88);
  }
  55% {
    transform: rotate(5deg) scale(1.06);
  }
  100% {
    transform: rotate(0) scale(1);
  }
}

@keyframes letter-pop-in {
  0% {
    opacity: 0;
    transform: translateY(24px) scale(0.8);
  }
  70% {
    transform: translateY(-10px) scale(1.07);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes letter-float-below {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-18px);
  }
}

.answer-panel-enter-active {
  transition:
    opacity 0.42s cubic-bezier(0.34, 1.45, 0.64, 1),
    transform 0.42s cubic-bezier(0.34, 1.45, 0.64, 1);
}

.answer-panel-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.answer-panel-enter-from {
  opacity: 0;
  transform: translateY(22px) scale(0.95);
}

.answer-panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

.answer-panel-enter-active .submit-answer-btn {
  animation: submit-glimmer 0.55s ease-out 0.14s both;
}

@keyframes submit-glimmer {
  0% {
    filter: brightness(1);
  }
  45% {
    filter: brightness(1.15);
  }
  100% {
    filter: brightness(1);
  }
}

.banner-pop-enter-active {
  transition:
    opacity 0.4s cubic-bezier(0.34, 1.45, 0.64, 1),
    transform 0.4s cubic-bezier(0.34, 1.45, 0.64, 1);
}

.banner-pop-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(16px);
}

.banner-pop-leave-active {
  transition: opacity 0.26s ease;
}

.banner-pop-leave-to {
  opacity: 0;
}

.next-pop-enter-active {
  transition:
    opacity 0.4s cubic-bezier(0.34, 1.45, 0.64, 1),
    transform 0.4s cubic-bezier(0.34, 1.45, 0.64, 1);
}

.next-pop-enter-from {
  opacity: 0;
  transform: translateY(32px) scale(0.88);
}

.next-pop-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.next-pop-leave-to {
  opacity: 0;
  transform: translateY(18px) scale(0.94);
}

/* Category card: orange band (static label) + cream band (animating category) — letter sits below */
.category-panel {
  width: 100%;
  max-width: min(560px, calc(100% - var(--spacing-md) * 2));
  margin-inline: auto;
  padding: 0;
  border: 5px solid #e89520;
  border-radius: var(--radius-xl);
  box-shadow:
    0 8px 0 rgba(0, 0, 0, 0.15),
    var(--shadow-lg);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.category-panel__orange {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(180deg, #ffb347 0%, #e89520 100%);
}

.category-panel__cream {
  flex: 1;
  position: relative;
  z-index: 1;
  min-height: 5.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(180deg, #fff5e0 0%, #ffe6b8 100%);
}

.category-label {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3.5vw, 2rem);
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow:
    -1px -1px 0 #8b4513,
    1px -1px 0 #8b4513,
    -1px 1px 0 #8b4513,
    1px 1px 0 #8b4513,
    0 2px 4px rgba(0, 0, 0, 0.3);
  text-align: center;
  letter-spacing: 2px;
  margin: 0;
}

.category-name {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  text-align: center;
  margin: 0;
}

.category-name__emoji {
  font-size: clamp(2rem, 6vw, 3.25rem);
  line-height: 1;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.category-name__text {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 6vw, 3.5rem);
  font-weight: var(--font-weight-black);
  color: #d4a017;
  text-shadow:
    -2px -2px 0 #8b6914,
    2px -2px 0 #8b6914,
    -2px 2px 0 #8b6914,
    2px 2px 0 #8b6914,
    0 4px 0 #7a5c12,
    0 6px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 3px;
}

/* Letter — below the category card, stronger idle motion via letter-float-below */
.letter-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: min(560px, calc(100% - var(--spacing-md) * 2));
  position: relative;
  z-index: 2;
  padding: 0 var(--spacing-sm);
  margin: 0;
}

/* Cyan glow underneath the letter */
.letter-display::before {
  content: '';
  position: absolute;
  bottom: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 30%;
  background: radial-gradient(ellipse at center, rgba(100, 200, 255, 0.4) 0%, transparent 70%);
  pointer-events: none;
  filter: blur(20px);
}

.letter-value {
  font-family: var(--font-display);
  font-size: clamp(12rem, 38vw, 26rem);
  font-weight: var(--font-weight-black);
  /* Light blue fill color matching mockup */
  color: #7ec8e3;
  /* Dark blue outline using text-stroke + 3D shadow */
  -webkit-text-stroke: clamp(4px, 1vw, 8px) #2b5b84;
  paint-order: stroke fill;
  text-shadow:
    /* 3D depth shadow - offset down-right */
    6px 6px 0 #1a3d5c,
    8px 8px 0 #153250,
    10px 10px 0 #102844,
    /* Soft blur shadow for depth */ 12px 12px 20px rgba(0, 0, 0, 0.4);
  line-height: 1;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

/* Inner highlight for 3D effect */
.letter-value::before {
  content: attr(data-letter);
  position: absolute;
  top: -2px;
  left: -2px;
  color: #a8dff0;
  -webkit-text-stroke: 0;
  z-index: -1;
  opacity: 0.5;
}

/* Answer Input Section */
.answer-input-section {
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  border: 4px solid #ffaa00;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow:
    0 8px 0 rgba(0, 0, 0, 0.15),
    var(--shadow-lg);
}

.player-turn-indicator {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.turn-label {
  font-family: var(--font-display);
  font-size: clamp(0.9rem, 2vw, 1.2rem);
  font-weight: var(--font-weight-semibold);
  /* Light panel: use text token that is not inverted by dark-mode :root overrides */
  color: var(--color-text-dark);
  display: block;
  margin-bottom: var(--spacing-sm);
}

.turn-name {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  display: block;
}

.answer-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.answer-input-wrapper {
  position: relative;
  width: 100%;
}

.answer-input-wrapper .answer-input {
  padding-right: calc(var(--spacing-lg) + 3rem);
}

.mic-btn {
  position: absolute;
  top: 50%;
  right: var(--spacing-sm);
  transform: translateY(-50%);
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  background: var(--color-white);
  color: var(--color-primary);
  font-size: 1.25rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color var(--transition-base),
    color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-base);
}

.mic-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 170, 0, 0.35);
}

.mic-btn--listening {
  background: #e53935;
  border-color: #e53935;
  color: var(--color-white);
  animation: mic-pulse 1.2s ease-in-out infinite;
}

@keyframes mic-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.55);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(229, 57, 53, 0);
  }
}

.answer-input {
  width: 100%;
  padding: var(--spacing-lg);
  font-family: var(--font-display);
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  font-weight: var(--font-weight-semibold);
  border: 3px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-text-dark);
  text-align: center;
  transition:
    transform var(--transition-base),
    opacity var(--transition-base),
    background-color var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}

.answer-input:focus {
  outline: none;
  border-color: #ffaa00;
  box-shadow: 0 0 0 4px rgba(255, 170, 0, 0.2);
}

.submit-answer-btn {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--bg-gradient-success);
  border: 3px solid #ffaa00;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  cursor: pointer;
  transition:
    transform var(--transition-base),
    opacity var(--transition-base),
    background-color var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base);
  box-shadow: 0 6px 0 rgba(58, 140, 20, 0.3);
}

.submit-answer-btn:not(:disabled):active {
  transform: translateY(2px);
  box-shadow: 0 3px 0 rgba(58, 140, 20, 0.3);
}

.submit-answer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.verbal-mode-hint {
  margin: 0 0 var(--spacing-md);
  padding: 0 var(--spacing-sm);
  font-family: var(--font-display);
  font-size: clamp(0.9rem, 2.4vw, 1.05rem);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-dark);
  text-align: center;
  line-height: 1.35;
}

.verbal-turn-actions {
  display: flex;
  justify-content: center;
}

.verbal-turn-done-btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  background-color: #ff9800;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.2s;
}

.verbal-turn-done-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.all-submitted-message {
  width: 100%;
  max-width: 500px;
  background: var(--bg-gradient-success);
  border: 4px solid #ffaa00;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.all-submitted-message p {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}

/* Bottom Navigation */
.bottom-nav {
  position: relative;
  padding: var(--spacing-xl) var(--spacing-md)
    calc(var(--spacing-xl) + var(--spacing-md) + env(safe-area-inset-bottom, 0px));
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
  z-index: var(--z-base);
}

/* NEXT Button - Bright green glossy gradient with gold border */
.next-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  min-width: 220px;
  padding: var(--spacing-lg) var(--spacing-3xl);
  /* Bright green glossy gradient matching mockup */
  background: linear-gradient(180deg, #9dff4d 0%, #5fc423 50%, #4aab18 100%);
  border: 4px solid #e89520;
  border-radius: var(--radius-xl);
  box-shadow:
    0 8px 0 #3a8c14,
    0 12px 20px rgba(0, 0, 0, 0.25),
    inset 0 2px 4px rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition:
    transform var(--transition-base),
    opacity var(--transition-base),
    background-color var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base);
  position: relative;
  overflow: hidden;
}

/* Glossy highlight on top half */
.next-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.1) 100%);
  pointer-events: none;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

/* 3D press effect */
.next-btn:active {
  transform: translateY(4px);
  box-shadow:
    0 4px 0 #3a8c14,
    0 6px 12px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.next-icon {
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}

.next-text {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3.5vw, 2rem);
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  /* White text with shadow for contrast */
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 8px rgba(0, 0, 0, 0.2);
  letter-spacing: 3px;
}

/* Responsive */
@media (max-width: 768px) {
  .round-text {
    font-size: clamp(1.3rem, 3vw, 1.8rem);
  }

  .category-panel {
    max-width: calc(100% - var(--spacing-md) * 2);
  }

  .category-panel__orange {
    padding: var(--spacing-sm) var(--spacing-lg);
  }

  .category-panel__cream {
    padding: var(--spacing-md) var(--spacing-lg);
    min-height: 5rem;
  }

  .category-label {
    font-size: clamp(1.1rem, 3vw, 1.5rem);
  }

  .category-name {
    gap: var(--spacing-xs);
  }

  .category-name__emoji {
    font-size: clamp(1.6rem, 5vw, 2.5rem);
  }

  .category-name__text {
    font-size: clamp(1.8rem, 5vw, 2.5rem);
  }

  .letter-value {
    font-size: clamp(9.5rem, 30vw, 20rem);
    -webkit-text-stroke: clamp(3px, 0.85vw, 7px) #2b5b84;
  }

  .answer-input-section {
    max-width: calc(100% - var(--spacing-md) * 2);
  }

  .game-container {
    gap: var(--spacing-2xl);
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .bottom-nav {
    padding: var(--spacing-lg) var(--spacing-md)
      calc(var(--spacing-lg) + var(--spacing-sm) + env(safe-area-inset-bottom, 0px));
    margin-bottom: var(--spacing-md);
  }

  .next-btn {
    min-width: 180px;
    padding: var(--spacing-md) var(--spacing-2xl);
  }

  .next-text {
    font-size: clamp(1.2rem, 3vw, 1.6rem);
  }
}

@media (max-width: 480px) {
  .round-text {
    font-size: clamp(1.1rem, 2.8vw, 1.4rem);
  }

  .category-panel {
    max-width: calc(100% - var(--spacing-sm) * 2);
    border-width: 4px;
  }

  .category-panel__orange {
    padding: var(--spacing-xs) var(--spacing-md);
  }

  .category-panel__cream {
    padding: var(--spacing-sm) var(--spacing-md);
    min-height: 4.5rem;
  }

  .category-label {
    font-size: clamp(1rem, 2.5vw, 1.3rem);
  }

  .category-name {
    gap: var(--spacing-xs);
  }

  .category-name__emoji {
    font-size: clamp(1.35rem, 4vw, 1.85rem);
  }

  .category-name__text {
    font-size: clamp(1.5rem, 4vw, 2rem);
  }

  .letter-value {
    font-size: clamp(7.5rem, 24vw, 14rem);
    -webkit-text-stroke: clamp(2px, 0.65vw, 5px) #2b5b84;
  }

  .answer-input-section {
    max-width: calc(100% - var(--spacing-sm) * 2);
    padding: var(--spacing-md);
  }

  .answer-input {
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    padding: var(--spacing-md);
  }

  .game-container {
    gap: var(--spacing-xl);
    padding: var(--spacing-md) var(--spacing-sm);
  }

  .bottom-nav {
    padding: var(--spacing-md) var(--spacing-sm)
      calc(var(--spacing-md) + var(--spacing-xs) + env(safe-area-inset-bottom, 0px));
    margin-bottom: var(--spacing-md);
  }

  .next-btn {
    min-width: 160px;
    padding: var(--spacing-sm) var(--spacing-xl);
    border-width: 3px;
  }

  .next-text {
    font-size: clamp(1rem, 2.5vw, 1.3rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .round-reveal-stack .category-name,
  .round-reveal-stack .letter-display {
    animation: none;
  }

  .round-reveal-stack .category-panel {
    animation: category-pop-in 0.52s cubic-bezier(0.34, 1.45, 0.64, 1) both;
  }
}

/* Hover feedback only where hover is meaningful (mouse / fine pointer), not primary touch. */
@media (hover: hover) and (pointer: fine) {
  .mic-btn:hover:not(.mic-btn--listening) {
    background: var(--color-primary);
    color: var(--color-white);
  }

  .verbal-turn-done-btn:hover {
    background-color: #f57c00;
  }
}
</style>
