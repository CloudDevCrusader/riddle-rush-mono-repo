<template>
  <GameModal
    v-model="isVisible"
    variant="default"
    :title="t('pause.title')"
    :close-on-backdrop="false"
    :close-on-escape="false"
  >
    <div class="pause-content">
      <p class="pause-message">{{ t('pause.message') }}</p>

      <div class="pause-actions">
        <GameButton variant="primary" size="lg" full-width @click="handleResume">
          <svg class="button-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          {{ t('pause.resume') }}
        </GameButton>

        <GameButton variant="secondary" size="lg" full-width @click="handleRestart">
          <svg class="button-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
            />
          </svg>
          {{ t('pause.restart') }}
        </GameButton>

        <GameButton variant="warning" size="lg" full-width @click="handleHome">
          <svg class="button-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          {{ t('pause.home') }}
        </GameButton>
      </div>
    </div>
  </GameModal>
</template>

<script setup lang="ts">
const { t } = usePageSetup()
const { goHome } = useNavigation()
const { gameSession } = useGameState()

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  resume: []
  restart: []
  home: []
}>()

const isVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const handleResume = () => {
  emit('resume')
  isVisible.value = false
}

const handleRestart = async () => {
  if (gameSession.hasActiveSession.value) {
    await gameSession.abandonGame()
  }
  emit('restart')
  isVisible.value = false
}

const handleHome = async () => {
  if (gameSession.hasActiveSession.value) {
    await gameSession.abandonGame()
  }
  emit('home')
  isVisible.value = false
  goHome()
}
</script>

<style scoped lang="scss">
.pause-content {
  text-align: center;
}

.pause-message {
  font-family: var(--font-display);
  font-size: var(--font-size-md);
  color: white;
  margin: 0 0 var(--spacing-xl);
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.pause-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.button-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

// Override GameModal body background for blue theme
:deep(.game-modal-body) {
  background: var(--gradient-bg);
}

@media (max-width: 480px) {
  .pause-message {
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-lg);
  }

  .pause-actions {
    gap: var(--spacing-sm);
  }

  .button-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
