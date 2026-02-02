<template>
  <GameModal
    v-model="isVisible"
    variant="danger"
    :title="t('game.quitGame')"
    :close-on-backdrop="false"
    :close-on-escape="false"
  >
    <div class="quit-content">
      <p class="quit-message">{{ t('game.quitConfirmation') }}</p>

      <div class="quit-actions">
        <GameButton variant="danger" @click="handleNo">
          {{ t('common.no') }}
        </GameButton>
        <GameButton variant="primary" @click="handleYes">
          {{ t('common.yes') }}
        </GameButton>
      </div>
    </div>
  </GameModal>
</template>

<script setup lang="ts">
const { t } = usePageSetup()
const { goHome } = useNavigation()
const { gameStore } = useGameState()
const audio = useAudio()

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const isVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const handleNo = () => {
  audio.playClick()
  emit('cancel')
  isVisible.value = false
}

const handleYes = async () => {
  audio.playClick()
  if (gameStore.hasActiveSession) {
    await gameStore.abandonGame()
  }
  emit('confirm')
  isVisible.value = false
  goHome()
}
</script>

<style scoped lang="scss">
.quit-content {
  text-align: center;
}

.quit-message {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  color: var(--color-text-dark);
  margin: 0 0 var(--spacing-xl);
  line-height: 1.4;
}

.quit-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

// Ensure buttons have equal width
.quit-actions :deep(.game-button) {
  flex: 1;
  max-width: 140px;
}

@media (max-width: 480px) {
  .quit-message {
    font-size: var(--font-size-md);
  }

  .quit-actions {
    gap: var(--spacing-sm);
  }

  .quit-actions :deep(.game-button) {
    max-width: 120px;
  }
}
</style>
