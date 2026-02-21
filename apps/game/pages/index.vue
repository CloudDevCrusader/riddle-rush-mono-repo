<template>
  <div class="menu-page">
    <img src="~/assets/figma/background-1-9.png" class="menu-bg" alt="background" />
    <div class="container">
      <img src="~/assets/figma/logo-1.png" class="logo-image" alt="Logo" />
      <div class="menu-buttons">
        <img src="~/assets/figma/play-1-1.png" alt="Play" @click="handlePlay" />
        <img src="~/assets/figma/options-1.png" alt="Options" @click="wrappedGoToSettings" />
        <img src="~/assets/figma/credits-1.png" alt="Credits" @click="wrappedGoToCredits" />
        <img src="~/assets/figma/exit-1.png" alt="Exit" @click="handleExit" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { router, baseUrl, toast, t } = usePageSetup()
const { goToPlayers, goToSettings, goToCredits, goToLanguage } = useNavigation()
const route = useRoute()

onMounted(() => {
  if (route.query.needsGame === 'true') {
    toast.warning(t('game.no_active_session', 'Please start a game first'))
    router.replace({ query: {} })
  }
})

const handlePlay = () => {
  goToPlayers()
}

const wrappedGoToSettings = () => {
  goToSettings()
}

const wrappedGoToCredits = () => {
  goToCredits()
}

const handleExit = () => {
  // This is a bit tricky in a web environment.
  // We can try to close the window, but it might not work in all browsers.
  // A better approach would be to show a "Thanks for playing" message.
  // For now, let's just log a message.
  console.log('Exit button clicked')
}

useHead({
  title: 'Main Menu',
  meta: [
    {
      name: 'description',
      content: 'Game main menu',
    },
  ],
})
</script>

<style scoped>
.menu-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.menu-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  gap: 2rem;
}

.logo-image {
  width: clamp(250px, 40vw, 450px);
  height: auto;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.menu-buttons img {
  width: clamp(200px, 30vw, 350px);
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.menu-buttons img:hover {
  transform: scale(1.05);
}
</style>
