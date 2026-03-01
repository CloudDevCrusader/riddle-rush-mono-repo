<template>
  <div v-if="isVisible" class="pause-modal-overlay">
    <div class="pause-modal">
      <img src="~/assets/figma/back-3.png" class="pause-modal-bg" alt="Pause modal background" />
      <div class="pause-content">
        <img src="~/assets/figma/game-paused-1.png" class="pause-title" alt="Game Paused" />
        <p class="pause-message">Game is paused, press resume to continue</p>
        <div class="pause-actions">
          <img
            src="~/assets/figma/resume-1.png"
            class="pause-btn"
            alt="Resume"
            @click="handleResume"
          />
          <img
            src="~/assets/figma/restart-1.png"
            class="pause-btn"
            alt="Restart"
            @click="handleRestart"
          />
          <img src="~/assets/figma/home-1.png" class="pause-btn" alt="Home" @click="handleHome" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { goHome } = useNavigation()
const { gameStore } = useGameState()

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
  if (gameStore.hasActiveSession) {
    await gameStore.abandonGame()
  }
  emit('restart')
  isVisible.value = false
}

const handleHome = async () => {
  if (gameStore.hasActiveSession) {
    await gameStore.abandonGame()
  }
  emit('home')
  isVisible.value = false
  goHome()
}
</script>

<style scoped>
.pause-modal-overlay {
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

.pause-modal {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.pause-modal-bg {
  width: 100%;
}

.pause-content {
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

.pause-title {
  width: 100%;
  max-width: 200px;
}

.pause-message {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.pause-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pause-btn {
  width: 200px;
  cursor: pointer;
}
</style>
