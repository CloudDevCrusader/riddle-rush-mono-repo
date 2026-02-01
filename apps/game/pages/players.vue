<template>
  <GameBackground>
    <div ref="pageElement" class="players-page">
      <GamePanel class="players-panel">
        <GameHeader color="gold">
          <template #left>
            <button
              class="back-button"
              type="button"
              :aria-label="t('common.back', 'Back')"
              @click="goBack"
            >
              ‹
            </button>
          </template>
          {{ t('players.title') }}
        </GameHeader>

        <div class="players-body">
          <div class="stepper" role="group" :aria-label="t('players.count_label')">
            <div class="stepper__label">{{ t('players.count_label') }}</div>
            <div class="stepper__controls">
              <button
                class="stepper__button"
                type="button"
                :aria-label="t('players.decrease')"
                :disabled="playerCount <= minPlayers"
                @click="changePlayerCount(-1)"
              >
                –
              </button>
              <div class="stepper__count" aria-live="polite">
                <span class="stepper__count-number">{{ playerCount }}</span>
                <span class="stepper__count-max">/ {{ MAX_PLAYERS }}</span>
              </div>
              <button
                class="stepper__button"
                type="button"
                :aria-label="t('players.increase')"
                :disabled="playerCount >= MAX_PLAYERS"
                @click="changePlayerCount(1)"
              >
                +
              </button>
            </div>
          </div>

          <GameScrollList class="players-list" max-height="420px">
            <div v-for="(_, index) in playerCount" :key="`player-${index}`" class="player-row">
              <label class="player-row__label" :for="`player-${index}`">
                {{ placeholderForIndex(index) }}
              </label>
              <input
                :id="`player-${index}`"
                v-model="playerNames[index]"
                type="text"
                class="player-row__input"
                :placeholder="placeholderForIndex(index)"
                maxlength="20"
                autocomplete="off"
              />
            </div>
          </GameScrollList>

          <GameButton
            class="start-button"
            variant="primary"
            size="lg"
            full-width
            @click="startGame"
          >
            {{ t('players.start') }}
          </GameButton>
        </div>
      </GamePanel>
    </div>
  </GameBackground>
</template>

<script setup lang="ts">
import { MAX_PLAYERS } from '@riddle-rush/shared/constants'

const { t, goBack, toast } = usePageSetup()
const { goToRoundStart } = useNavigation()
const { gameStore } = useGameState()

const minPlayers = 1
const playerCount = ref(2)
const playerNames = ref<string[]>([])

const clampPlayerCount = (value: number) => Math.min(MAX_PLAYERS, Math.max(minPlayers, value))

const syncPlayerList = (targetCount?: number) => {
  const nextCount = clampPlayerCount(targetCount ?? playerCount.value)
  const next = playerNames.value.slice(0, nextCount)

  while (next.length < nextCount) {
    next.push('')
  }

  playerCount.value = nextCount
  playerNames.value = next
}

const changePlayerCount = (delta: number) => {
  const nextCount = clampPlayerCount(playerCount.value + delta)

  if (nextCount === playerCount.value) {
    if (delta > 0) {
      toast.info(t('players.max_players', [MAX_PLAYERS]))
    }
    return
  }

  syncPlayerList(nextCount)
}

const placeholderForIndex = (index: number) =>
  (t('players.placeholder', { number: index + 1 }) as string) || `Player ${index + 1}`

const startGame = () => {
  if (playerCount.value < minPlayers) {
    toast.warning(t('players.need_players'))
    return
  }

  const names = playerNames.value.slice(0, playerCount.value).map((name, index) => {
    const trimmed = name.trim()
    return trimmed || placeholderForIndex(index)
  })

  if (!names.length) {
    toast.warning(t('players.need_players'))
    return
  }

  const lowerCaseNames = names.map((name) => name.toLowerCase())
  const hasDuplicateNames = new Set(lowerCaseNames).size !== lowerCaseNames.length

  if (hasDuplicateNames) {
    toast.warning(t('players.duplicate_name'))
    return
  }

  gameStore.pendingPlayerNames = names
  toast.success(t('players.ready', { 0: names.length }))
  goToRoundStart()
}

const { pageElement } = usePageSwipe({
  onSwipeRight: () => goBack(),
  threshold: 80,
})

useHead({
  title: t('players.title'),
  meta: [
    {
      name: 'description',
      content: t('players.description', 'Select players for the game'),
    },
  ],
})

syncPlayerList(playerCount.value)
</script>

<style scoped lang="scss">
@use 'assets/scss/effects/scaling' as *;

.players-page {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
}

.players-panel {
  width: 100%;
  max-width: mockup-clamp(720px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--color-border-gold);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(0, 0, 0, 0.24));
  color: var(--color-text-yellow);
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  cursor: pointer;
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base);

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: translateY(2px);
  }
}

.players-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--color-border-gold);
  border-radius: var(--radius-xl);
  background: linear-gradient(180deg, rgba(255, 230, 168, 0.16), rgba(255, 230, 168, 0.06));
}

.stepper__label {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  color: var(--color-text-yellow);
  letter-spacing: 0.4px;
}

.stepper__controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stepper__button {
  width: mockup-clamp(64px);
  height: mockup-clamp(64px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 3px solid var(--color-border-gold);
  background: linear-gradient(180deg, #f9d77a, #f0b647);
  color: var(--color-text-dark);
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base),
    filter var(--transition-base);

  &:hover:not(:disabled) {
    filter: brightness(1.05);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.stepper__count {
  display: inline-flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-text-white);
  font-family: var(--font-display);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.stepper__count-number {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.stepper__count-max {
  font-size: var(--font-size-base);
  color: rgba(255, 255, 255, 0.75);
}

.players-list {
  width: 100%;
}

:deep(.players-list .game-scroll-list__row) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 239, 194, 0.95));
  border: 2px solid var(--color-border-gold);
  border-radius: var(--radius-lg);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
}

.player-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.player-row__label {
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  color: var(--color-text-dark);
  letter-spacing: 0.4px;
}

.player-row__input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 3px solid var(--color-border-gold);
  background: rgba(255, 255, 255, 0.96);
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  color: var(--color-text-dark);
  outline: none;
  transition:
    box-shadow var(--transition-base),
    border-color var(--transition-base);

  &:focus {
    border-color: var(--color-text-yellow);
    box-shadow: 0 0 0 4px rgba(255, 223, 128, 0.4);
  }
}

.start-button {
  margin-top: var(--spacing-md);
}

@media (max-width: 640px) {
  .players-page {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }

  .stepper {
    flex-direction: column;
    align-items: stretch;
  }

  .stepper__controls {
    width: 100%;
    justify-content: space-between;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stepper__button,
  .back-button {
    transition: none;
  }
}
</style>
