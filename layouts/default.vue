<template>
  <div>
    <nav>
      <NuxtLink to="/">Home</NuxtLink> |
      <NuxtLink to="/game">Game</NuxtLink> |
      <NuxtLink to="/about">About</NuxtLink>
      <button
        v-if="gameStore.canInstall"
        class="install-btn"
        @click="installPWA"
      >
        Install App
      </button>
      <span
        class="online-status"
        :class="{ offline: !gameStore.isOnline }"
      >
        {{ gameStore.isOnline ? '🟢 Online' : '🔴 Offline' }}
      </span>
    </nav>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const gameStore = useGameStore()

const installPWA = async () => {
  await gameStore.showInstallPrompt()
}
</script>

<style scoped>
nav {
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.install-btn {
  margin-left: 20px;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.install-btn:hover {
  background-color: #35a372;
}

.online-status {
  margin-left: auto;
  font-size: 14px;
}

.online-status.offline {
  color: #e74c3c;
}

/* Hide navbar on mobile to maximize game space */
@media (max-width: 640px) {
  nav {
    display: none;
  }
}
</style>
