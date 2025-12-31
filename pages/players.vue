<template>
  <div class="players-page">
    <!-- Background Image -->
    <img
      :src="`${baseUrl}assets/players/BACKGROUND.png`"
      alt="Background"
      class="page-bg"
    >

    <!-- Back Button -->
    <button
      class="back-btn tap-highlight no-select"
      @click="goBack"
    >
      <img
        :src="`${baseUrl}assets/players/back.png`"
        alt="Back"
      >
    </button>

    <!-- Main Container -->
    <div class="container">
      <!-- Title -->
      <div class="title-container animate-fade-in">
        <img
          :src="`${baseUrl}assets/players/players.png`"
          alt="Players"
          class="title-image"
        >
        <img
          :src="`${baseUrl}assets/players/top.png`"
          alt="Top decoration"
          class="top-decoration"
        >
      </div>

      <!-- Players List -->
      <div class="players-list-container animate-scale-in">
        <div class="players-list">
          <div
            v-for="(player, index) in players"
            :key="index"
            class="player-item"
          >
            <img
              :src="`${baseUrl}assets/players/Group 10.png`"
              alt="Player slot"
              class="player-slot-bg"
            >
            <span class="player-name">{{ player.name }}</span>
            <button
              class="remove-player-btn tap-highlight no-select"
              @click="removePlayer(index)"
            >
              <img
                :src="`${baseUrl}assets/players/minus.png`"
                alt="Remove"
              >
            </button>
          </div>

          <!-- Empty slots -->
          <div
            v-for="n in Math.max(0, maxPlayers - players.length)"
            :key="`empty-${n}`"
            class="player-item empty"
          >
            <img
              :src="`${baseUrl}assets/players/Group 10.png`"
              alt="Empty slot"
              class="player-slot-bg"
            >
            <span class="player-name empty-text">Empty Slot</span>
          </div>
        </div>

        <!-- Scroll Bar -->
        <div class="scroll-bar">
          <img
            :src="`${baseUrl}assets/players/scroll bar.png`"
            alt="Scroll bar"
            class="scroll-bg"
          >
          <img
            :src="`${baseUrl}assets/players/screoll.png`"
            alt="Scroll handle"
            class="scroll-handle"
          >
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons animate-slide-up">
        <!-- Add Player Button -->
        <button
          v-if="players.length < maxPlayers"
          class="action-btn add-btn tap-highlight no-select"
          @click="addPlayer"
        >
          <img
            :src="`${baseUrl}assets/players/add back.png`"
            alt="Add button bg"
            class="btn-bg"
          >
          <img
            :src="`${baseUrl}assets/players/add.png`"
            alt="Add"
            class="btn-icon"
          >
        </button>

        <!-- Start Button -->
        <button
          :disabled="players.length === 0"
          class="action-btn start-btn tap-highlight no-select"
          :class="{ disabled: players.length === 0 }"
          @click="startGame"
        >
          <img
            :src="`${baseUrl}assets/players/start.png`"
            alt="Start"
          >
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const router = useRouter()
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl
const gameStore = useGameStore()
const toast = useToast()
const { t } = useI18n()

const maxPlayers = 6
const players = ref([
  { name: 'Player 1' },
  { name: 'Player 2' },
])

const addPlayer = () => {
  if (players.value.length >= maxPlayers) {
    toast.warning(t('players.max_players', `Maximum ${maxPlayers} players allowed`))
    return
  }

  const defaultName = `Player ${players.value.length + 1}`
  const playerName = prompt('Enter player name:', defaultName)

  if (playerName && playerName.trim()) {
    players.value.push({ name: playerName.trim() })
    toast.success(t('players.added', `${playerName.trim()} added!`))
  } else if (playerName === '') {
    // User cleared the prompt, use default name
    players.value.push({ name: defaultName })
    toast.success(t('players.added', `${defaultName} added!`))
  }
}

const removePlayer = (index: number) => {
  const playerName = players.value[index]?.name
  players.value.splice(index, 1)
  if (playerName) {
    toast.info(t('players.removed', `${playerName} removed`))
  }
}

const startGame = async () => {
  if (players.value.length === 0) {
    toast.warning(t('players.need_players', 'Add at least one player to start'))
    return
  }

  try {
    const playerNames = players.value.map((p) => p.name)
    // Store player names temporarily, will setup game after both wheels spin
    gameStore.pendingPlayerNames = playerNames
    toast.success(t('players.ready', `${players.value.length} players ready!`))
    // Navigate to round start (dual wheel spin)
    router.push('/round-start')
  } catch (error) {
    console.error('Error starting game:', error)
    toast.error(t('players.error_start', 'Failed to start game. Please try again.'))
  }
}

const goBack = () => {
  router.back()
}

useHead({
  title: 'Players',
  meta: [
    {
      name: 'description',
      content: 'Select players for the game',
    },
  ],
})
</script>

<style scoped>
.players-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  background: #1a1a2e;
}

/* Background Image */
.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Back Button */
.back-btn {
  position: absolute;
  top: var(--spacing-xl);
  left: var(--spacing-xl);
  z-index: 3;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.back-btn img {
  width: clamp(40px, 5vw, 60px);
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.back-btn:hover {
  transform: scale(1.05);
}

.back-btn:active {
  transform: scale(0.95);
}

/* Container */
.container {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-md);
  gap: var(--spacing-2xl);
}

/* Title */
.title-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.title-image {
  width: clamp(200px, 30vw, 300px);
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

.top-decoration {
  width: clamp(150px, 25vw, 250px);
  height: auto;
}

/* Players List Container */
.players-list-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  display: flex;
  gap: var(--spacing-lg);
}

.players-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;
  padding: var(--spacing-md);
  scrollbar-width: none;
}

.players-list::-webkit-scrollbar {
  display: none;
}

/* Player Item */
.player-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  min-height: 70px;
}

.player-slot-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  z-index: 1;
}

.player-name {
  position: relative;
  z-index: 2;
  flex: 1;
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-lg), 2.5vw, var(--font-size-2xl));
  font-weight: var(--font-weight-bold);
  color: #2a1810;
  text-align: center;
}

.player-name.empty-text {
  color: rgba(42, 24, 16, 0.4);
  font-style: italic;
}

.remove-player-btn {
  position: relative;
  z-index: 2;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.remove-player-btn img {
  width: clamp(30px, 4vw, 40px);
  height: auto;
}

.remove-player-btn:hover {
  transform: scale(1.1);
}

.remove-player-btn:active {
  transform: scale(0.95);
}

/* Scroll Bar */
.scroll-bar {
  position: relative;
  width: 30px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md) 0;
}

.scroll-bg {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
  width: auto;
}

.scroll-handle {
  position: relative;
  z-index: 2;
  width: 20px;
  height: auto;
  margin-top: var(--spacing-lg);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: var(--spacing-xl);
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.action-btn:hover:not(.disabled) {
  transform: translateY(-4px) scale(1.05);
}

.action-btn:active:not(.disabled) {
  transform: translateY(-2px) scale(0.98);
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Add Button */
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(80px, 12vw, 120px);
  height: clamp(80px, 12vw, 120px);
}

.btn-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.btn-icon {
  position: relative;
  z-index: 2;
  width: 60%;
  height: auto;
}

/* Start Button */
.start-btn img {
  width: clamp(200px, 35vw, 300px);
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out 0.2s backwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out 0.4s backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .back-btn img {
    width: 40px;
  }

  .title-image {
    width: 200px;
  }

  .top-decoration {
    width: 150px;
  }

  .players-list {
    max-height: 350px;
  }

  .player-item {
    min-height: 60px;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .add-btn {
    width: 80px;
    height: 80px;
  }

  .start-btn img {
    width: 200px;
  }
}
</style>
