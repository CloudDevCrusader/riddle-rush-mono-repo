<template>
  <NuxtLayout>
    <NuxtPage />
    <FeedbackWidget />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const gameStore = useGameStore()

onMounted(() => {
  gameStore.loadFromDB()

  window.addEventListener('online', () => gameStore.setOnlineStatus(true))
  window.addEventListener('offline', () => gameStore.setOnlineStatus(false))

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    gameStore.setInstallPrompt(e)
  })
})
</script>

<style>
@import '~/assets/css/design-system.css';
</style>
