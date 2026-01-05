<template>
  <div ref="pageElement" class="players-page">
    <!-- Background Image -->
    <img :src="`${baseUrl}assets/players/BACKGROUND.png`" alt="Background" class="page-bg" />

    <!-- Back Button -->
    <button class="back-btn tap-highlight no-select" @click="goBack">
      <img :src="`${baseUrl}assets/players/back.png`" alt="Back" />
    </button>

    <!-- Main Container -->
    <div class="container">
      <!-- Title -->
      <div class="title-container animate-fade-in">
        <img :src="`${baseUrl}assets/players/players.png`" alt="Players" class="title-image" />
        <img
          :src="`${baseUrl}assets/players/top.png`"
          alt="Top decoration"
          class="top-decoration"
        />
      </div>

      <!-- Players List -->
      <div class="players-list-container animate-scale-in">
        <div class="players-list">
          <div v-for="(player, index) in players" :key="index" class="player-item">
            <img
              :src="`${baseUrl}assets/players/Group 10.png`"
              alt="Player slot"
              class="player-slot-bg"
            />
            <span class="player-name">{{ player.name }}</span>
            <button class="remove-player-btn tap-highlight no-select" @click="removePlayer(index)">
              <img :src="`${baseUrl}assets/players/minus.png`" alt="Remove" />
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
            />
            <span class="player-name empty-text">Empty Slot</span>
          </div>
        </div>

        <!-- Scroll Bar -->
        <div class="scroll-bar">
          <img
            :src="`${baseUrl}assets/players/scroll bar.png`"
            alt="Scroll bar"
            class="scroll-bg"
          />
          <img
            :src="`${baseUrl}assets/players/screoll.png`"
            alt="Scroll handle"
            class="scroll-handle"
          />
        </div>
      </div>

      <!-- Add Player Input (Mobile-Friendly) -->
      <div v-if="showPlayerInput" class="player-input-container animate-scale-in">
        <input
          ref="playerNameInput"
          v-model="newPlayerName"
          type="text"
          :placeholder="$t('players.enter_name', 'Enter player name')"
          class="player-name-input tap-highlight"
          maxlength="20"
          @keyup.enter="confirmAddPlayer"
          @keyup.esc="cancelAddPlayer"
          @input="sanitizePlayerName"
        />
        <div class="input-buttons">
          <button class="input-btn confirm-btn tap-highlight no-select" @click="confirmAddPlayer">
            ✓
          </button>
          <button class="input-btn cancel-btn tap-highlight no-select" @click="cancelAddPlayer">
            ✕
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons animate-slide-up">
        <!-- Add Player Button -->
        <button
          v-if="players.length < maxPlayers && !showPlayerInput"
          class="action-btn add-btn tap-highlight no-select"
          @click="showAddPlayerInput"
        >
          <img :src="`${baseUrl}assets/players/add back.png`" alt="Add button bg" class="btn-bg" />
          <img :src="`${baseUrl}assets/players/add.png`" alt="Add" class="btn-icon" />
        </button>

        <!-- Start Button -->
        <button
          :disabled="players.length === 0"
          class="action-btn start-btn tap-highlight no-select"
          :class="{ disabled: players.length === 0 }"
          @click="startGame"
        >
          <img :src="`${baseUrl}assets/players/start.png`" alt="Start" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MAX_PLAYERS } from '@riddle-rush/shared/constants'

const { baseUrl, toast, t, goBack: navigateBack } = usePageSetup()
const { goToRoundStart } = useNavigation()
const { gameStore } = useGameState()

const maxPlayers = MAX_PLAYERS
const players = ref([{ name: 'Player 1' }, { name: 'Player 2' }])
const showPlayerInput = ref(false)
const newPlayerName = ref('')
const playerNameInput = ref<HTMLInputElement | null>(null)

const showAddPlayerInput = () => {
  if (players.value.length >= maxPlayers) {
    toast.warning(t('players.max_players', `Maximum ${maxPlayers} players allowed`))
    return
  }

  newPlayerName.value = `Player ${players.value.length + 1}`
  showPlayerInput.value = true

  // Focus input after Vue updates DOM
  nextTick(() => {
    playerNameInput.value?.focus()
    playerNameInput.value?.select()
  })
}

// Validate player name
const isValidPlayerName = (name: string): { valid: boolean; error?: string } => {
  const trimmed = name.trim()

  if (!trimmed) {
    return { valid: false, error: t('players.name_required', 'Please enter a player name') }
  }

  if (trimmed.length < 1) {
    return {
      valid: false,
      error: t('players.name_too_short', 'Player name must be at least 1 character'),
    }
  }

  if (trimmed.length > 20) {
    return {
      valid: false,
      error: t('players.name_too_long', 'Player name must be 20 characters or less'),
    }
  }

  // Check for duplicate names - but allow the default "Player X" names
  const isDefaultName = trimmed.match(/^Player \d+$/i)
  if (!isDefaultName && players.value.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
    return {
      valid: false,
      error: t('players.duplicate_name', 'A player with this name already exists'),
    }
  }

  return { valid: true }
}

// Sanitize player name input
const sanitizePlayerName = () => {
  // Remove potentially dangerous characters
  newPlayerName.value = newPlayerName.value.replace(/[<>]/g, '')
  // Limit length
  if (newPlayerName.value.length > 20) {
    newPlayerName.value = newPlayerName.value.slice(0, 20)
  }
}

const confirmAddPlayer = () => {
  const trimmedName = newPlayerName.value.trim()

  const validation = isValidPlayerName(trimmedName)
  if (!validation.valid) {
    toast.warning(validation.error || t('players.name_required', 'Please enter a player name'))
    return
  }

  players.value.push({ name: trimmedName })
  toast.success(t('players.added', `${trimmedName} added!`))

  // Reset
  newPlayerName.value = ''
  showPlayerInput.value = false
}

const cancelAddPlayer = () => {
  newPlayerName.value = ''
  showPlayerInput.value = false
}

const removePlayer = (index: number) => {
  const playerName = players.value[index]?.name
  players.value.splice(index, 1)
  if (playerName) {
    toast.info(t('players.removed', `${playerName} removed`))
  }
}

const startGame = async () => {
  // Validate at least one player
  if (players.value.length === 0) {
    toast.warning(t('players.need_players', 'Add at least one player to start'))
    return
  }

  // Validate all player names are valid
  const invalidPlayers = players.value.filter((p) => {
    const validation = isValidPlayerName(p.name)
    return !validation.valid
  })

  if (invalidPlayers.length > 0) {
    toast.warning(t('players.invalid_names', 'Please fix invalid player names before starting'))
    return
  }

  try {
    const playerNames = players.value.map((p) => p.name)
    // Store player names temporarily, will setup game after both wheels spin
    gameStore.pendingPlayerNames = playerNames

    // Enhanced toast with random motivational messages
    const motivationalMessages = [
      t('players.ready', `${players.value.length} players ready!`),
      t('players.lets_start', "Let's start the show! 🎉"),
      t('players.good_luck', 'Good luck everyone! 🍀'),
      t('players.may_the_best_win', 'May the best win! 🏆'),
      t('players.game_on', 'Game on! 🎮'),
      t('players.lets_play', "Let's play! 😃"),
      t('players.showtime', 'Showtime! ⭐'),
      t('players.ready_set_go', 'Ready, set, go! 🚀'),
    ]

    const randomMessage =
      motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
    toast.success(randomMessage as string)

    // Navigate to round start (dual wheel spin)
    goToRoundStart()
  } catch (error) {
    const logger = useLogger()
    logger.error('Error starting game:', error)
    toast.error(t('players.error_start', 'Failed to start game. Please try again.'))
  }
}

const goBack = () => {
  navigateBack()
}

// Mobile swipe gesture: swipe right to go back
const { pageElement } = usePageSwipe({
  onSwipeRight: () => {
    goBack()
  },
  threshold: 80, // Require 80px swipe to trigger
})

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

.back-btn:active {
  opacity: 0.7;
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

.remove-player-btn:active {
  opacity: 0.7;
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

/* Player Input (Mobile-Friendly) */
.player-input-container {
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.player-name-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: #2a1810;
  background: var(--color-white);
  border: 3px solid var(--color-primary);
  border-radius: var(--radius-md);
  outline: none;
  transition: all var(--transition-base);
}

.player-name-input:focus {
  border-color: var(--color-primary-dark);
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.2);
}

.input-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.input-btn {
  flex: 1;
  max-width: 80px;
  min-height: 56px;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.confirm-btn {
  background: var(--color-accent-green);
  color: var(--color-white);
}

.cancel-btn {
  background: var(--color-accent-red);
  color: var(--color-white);
}

.input-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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

.action-btn:active:not(.disabled) {
  opacity: 0.8;
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

/* Animations - Optimized for mobile gaming */
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate3d(0, -15px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate-scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s backwards;
  will-change: transform, opacity;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale3d(0.95, 0.95, 1);
  }
  to {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}

.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards;
  will-change: transform, opacity;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate3d(0, 25px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-scale-in,
  .animate-slide-up {
    animation: none;
    opacity: 1;
    transform: none;
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
