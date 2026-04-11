<template>
  <GameBackground>
    <div ref="pageElement" class="players-page" :class="{ 'players-page--legacy': isLegacyStyle }">
      <GamePanel class="players-panel">
        <GameHeader color="gold">
          <template #left>
            <button
              class="back-button"
              type="button"
              data-testid="players-back-button"
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
            <div class="stepper__pill">
              <button
                class="stepper__button stepper__button--minus"
                type="button"
                data-testid="players-decrease-button"
                :aria-label="t('players.decrease')"
                :disabled="playerCount <= minPlayers"
                @click="changePlayerCount(-1)"
              >
                –
              </button>
              <div class="stepper__count" aria-live="polite">
                <span class="stepper__label">{{ t('players.count_label') }}:</span>
                <Transition name="count-pop" mode="out-in">
                  <span :key="playerCount" class="stepper__number">{{ playerCount }}</span>
                </Transition>
                <span class="stepper__separator">/ {{ maxPlayers }}</span>
              </div>
              <button
                class="stepper__button stepper__button--plus"
                type="button"
                data-testid="players-increase-button"
                :aria-label="t('players.increase')"
                :disabled="playerCount >= maxPlayers"
                @click="changePlayerCount(1)"
              >
                +
              </button>
            </div>
          </div>

          <GameScrollList class="players-list" max-height="420px">
            <div
              v-for="(_, index) in playerCount"
              :key="`player-${index}`"
              v-motion
              :initial="{ opacity: 0, x: -20 }"
              :enter="{
                opacity: 1,
                x: 0,
                transition: { duration: 300, delay: Number(index) * 80 },
              }"
              class="player-row"
            >
              <label class="player-row__label" :for="`player-${index}`">
                {{ placeholderForIndex(index) }}
              </label>
              <input
                :id="`player-${index}`"
                v-model="playerNames[index]"
                type="text"
                class="player-row__input"
                :data-testid="`players-name-input-${index}`"
                :placeholder="placeholderForIndex(index)"
                maxlength="20"
                autocomplete="off"
                inputmode="search"
              />
            </div>
          </GameScrollList>

          <GameButton
            class="start-button"
            variant="primary"
            size="lg"
            full-width
            data-testid="players-start-button"
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
definePageMeta({ pageTransition: { name: 'slide-left', mode: 'out-in' } })

const { t, goBack, toast } = usePageSetup()
const { goToRoundStart } = useNavigation()
const { gameStore } = useGameState()
const runtimeConfig = useRuntimeConfig()

const minPlayers = runtimeConfig.public.minPlayers as number
const playerCount = ref(runtimeConfig.public.defaultPlayers as number)
const playerNames = ref<string[]>([])
const maxPlayers = computed(() => runtimeConfig.public.maxPlayers as number)
const isLegacyStyle = computed(() => runtimeConfig.public?.playersMockupStyle === 'legacy')

const clampPlayerCount = (value: number) => Math.min(maxPlayers.value, Math.max(minPlayers, value))

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
      toast.info(t('players.max_players', [maxPlayers.value]))
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

  const names = playerNames.value.slice(0, playerCount.value).map((name: string, index: number) => {
    const trimmed = name.trim()
    return trimmed || placeholderForIndex(index)
  })

  if (!names.length) {
    toast.warning(t('players.need_players'))
    return
  }

  const lowerCaseNames = names.map((name: string) => name.toLowerCase())
  const hasDuplicateNames = new Set(lowerCaseNames).size !== lowerCaseNames.length

  if (hasDuplicateNames) {
    toast.warning(t('players.duplicate_name'))
    return
  }

  gameStore.setPendingPlayerNames(names)
  toast.success(t('players.ready', { 0: names.length }))
  void goToRoundStart()
}

const { pageElement } = usePageSwipe({
  onSwipeRight: () => goBack(),
  threshold: 80,
})

useLocalizedPageSeo({
  title: () => t('players.title'),
  description: () => t('players.description'),
})

syncPlayerList(playerCount.value)
</script>

<style scoped lang="scss">
@use 'assets/scss/design-system' as *;

.players-page {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: mockup-clamp(48px) var(--spacing-xl);
  background:
    radial-gradient(circle at 50% 20%, rgba(28, 198, 255, 0.35), transparent 35%),
    radial-gradient(circle at 20% 40%, rgba(12, 140, 222, 0.25), transparent 30%),
    var(--bg-gradient-main);
}

.players-panel {
  width: 100%;
  max-width: mockup-clamp(760px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: mockup-clamp(36px);
  background: linear-gradient(180deg, rgba(16, 46, 104, 0.94) 0%, rgba(10, 28, 68, 0.96) 100%);
  border: 3px solid var(--color-border-gold);
  border-radius: mockup-clamp(26px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -6px 18px rgba(0, 0, 0, 0.3);
  animation: panelFade var(--transition-slow) ease;
}

.players-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 3px solid var(--color-border-orange);
  background: linear-gradient(180deg, #ff7864 0%, #d63a2f 100%);
  color: #fff;
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 10px 0 #a5261f,
    0 16px 28px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  touch-action: manipulation;
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base);

  &:hover {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      0 10px 0 #a5261f,
      0 18px 32px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(2px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      0 8px 0 #a5261f,
      0 14px 24px rgba(0, 0, 0, 0.24);
  }
}

.stepper {
  display: flex;
  justify-content: center;
}

.stepper__pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-xl);
  width: min(100%, 640px);
  border-radius: mockup-clamp(26px);
  border: 4px solid var(--color-border-orange);
  background: linear-gradient(180deg, #3c98e2 0%, #0a7bda 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -2px 8px rgba(0, 0, 0, 0.24),
    0 12px 22px rgba(0, 0, 0, 0.25);
}

.stepper__button {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid var(--color-border-gold);
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  color: #fff;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base),
    opacity var(--transition-base);

  &--minus {
    background: linear-gradient(180deg, #ff8c6f 0%, #d8452d 100%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      0 10px 0 #a62b1e,
      0 14px 24px rgba(0, 0, 0, 0.25);
  }

  &--plus {
    background: linear-gradient(180deg, #7fe165 0%, #36b02a 100%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      0 10px 0 #2c7f22,
      0 14px 24px rgba(0, 0, 0, 0.25);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(2px);
  }
}

.stepper__count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  color: #e7f4ff;
  text-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
  letter-spacing: 0.6px;
  white-space: nowrap;
}

.stepper__number {
  display: inline-block;
  min-width: 1.2em;
  text-align: center;
}

.stepper__separator {
  opacity: 0.7;
}

/* Count change animation */
.count-pop-enter-active {
  animation: countIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.count-pop-leave-active {
  animation: countOut 0.15s ease-in;
}

@keyframes countIn {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(8px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes countOut {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) translateY(-8px);
  }
}

.players-list {
  width: 100%;
  padding: 0 var(--spacing-xs);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.player-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
}

.player-row__label {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  color: #d5edff;
  text-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
}

.player-row__input {
  width: 100%;
  border: 3px solid var(--color-border-gold);
  border-radius: mockup-clamp(22px);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-xl);
  font-family: var(--font-display);
  color: #0b3b76;
  background: linear-gradient(180deg, #ffffff 0%, #eef1f7 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 10px 16px rgba(0, 0, 0, 0.18),
    0 4px 0 rgba(0, 0, 0, 0.08);
  transition:
    box-shadow var(--transition-base),
    border-color var(--transition-base);

  &::placeholder {
    color: rgba(11, 59, 118, 0.75);
  }

  &:focus {
    outline: none;
    border-color: var(--color-border-orange);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.7),
      0 10px 16px rgba(0, 0, 0, 0.22),
      0 0 0 3px rgba(255, 213, 79, 0.35);
  }
}

.start-button {
  margin-top: var(--spacing-md);
  width: 100%;
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  min-height: mockup-clamp(72px);
  border-radius: mockup-clamp(24px);
  background: linear-gradient(180deg, #9eff70 0%, #53c734 100%);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.65),
    0 12px 0 #2f8f23,
    0 20px 32px rgba(0, 0, 0, 0.28);
}

@keyframes panelFade {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.players-page--legacy {
  background: var(--bg-gradient-main);

  .players-panel {
    background: linear-gradient(180deg, rgba(12, 30, 64, 0.92) 0%, rgba(10, 20, 44, 0.94) 100%);
  }

  .stepper__pill {
    background: linear-gradient(180deg, rgba(255, 230, 168, 0.18), rgba(255, 230, 168, 0.08));
    border-color: var(--color-border-gold);
  }
}

@media (max-width: 640px) {
  .player-row {
    grid-template-columns: 1fr;
  }

  .players-panel {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .stepper__button {
    width: 48px;
    height: 48px;
    font-size: var(--font-size-xl);
  }

  .stepper__count {
    font-size: var(--font-size-lg);
  }

  .stepper__label {
    display: none;
  }

  .stepper__pill {
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-lg);
  }

  .player-row__label {
    font-size: var(--font-size-lg);
  }

  .player-row__input {
    font-size: var(--font-size-lg);
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .start-button {
    font-size: var(--font-size-lg);
    min-height: mockup-clamp(60px);
  }
}

@media (max-width: 360px) {
  .stepper__button {
    width: 44px;
    height: 44px;
  }

  .stepper__pill {
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-md);
    border-width: 3px;
  }

  .player-row {
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .player-row__input {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-width: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stepper__button,
  .back-button {
    transition: none;
  }

  .players-panel {
    animation: none;
  }

  .count-pop-enter-active,
  .count-pop-leave-active {
    animation: none;
  }
}
</style>
