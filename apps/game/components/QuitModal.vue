<template>
  <div v-if="isVisible" class="quit-modal-overlay">
    <div class="quit-modal">
      <img src="~/assets/figma/back-4.png" class="quit-modal-bg" alt="Quit modal background" />
      <div class="quit-content">
        <img src="~/assets/figma/quit-game-1.png" class="quit-title" alt="Quit Game?" />
        <p class="quit-message">Are you sure you want to quit game?</p>
        <div class="quit-actions">
          <img src="~/assets/figma/no-1.png" class="quit-btn" alt="No" @click="handleNo" />
          <img src="~/assets/figma/yes-1.png" class="quit-btn" alt="Yes" @click="handleYes" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
}
</script>

<style scoped>
.quit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.quit-modal {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.quit-modal-bg {
  width: 100%;
}

.quit-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 80%;
  text-align: center;
}

.quit-title {
  width: 100%;
  max-width: 200px;
}

.quit-message {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.quit-actions {
  display: flex;
  gap: 1rem;
}

.quit-btn {
  width: 100px;
  cursor: pointer;
}
</style>
