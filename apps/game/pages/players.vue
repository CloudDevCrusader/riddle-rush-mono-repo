<template>
  <div class="players-page">
    <img src="~/assets/figma/background-1-7.png" class="players-bg" alt="background" />
    <header class="players-header">
      <img src="~/assets/figma/back-1-2.png" class="back-btn" alt="Back" @click="goBack" />
      <div class="coin-bar">
        <img src="~/assets/figma/coin-bar-1-3.png" alt="Coin bar" />
        <span class="coin-bar-text">100</span>
      </div>
    </header>
    <div class="players-container">
      <img src="~/assets/figma/top-1.png" class="players-title-bg" alt="Players title background" />
      <div class="players-title-text">
        <img src="~/assets/figma/group-10-1.png" alt="Players" />
      </div>
      <div class="player-controls">
        <img
          src="~/assets/figma/minus-2.png"
          class="control-btn"
          alt="Remove player"
          @click="changePlayerCount(-1)"
        />
        <span class="player-count">{{ playerCount }}</span>
        <img
          src="~/assets/figma/add-2.png"
          class="control-btn"
          alt="Add player"
          @click="changePlayerCount(1)"
        />
      </div>
      <div class="player-list">
        <div v-for="(_, index) in playerCount" :key="`player-${index}`" class="player-item">
          <img
            src="~/assets/figma/add-back-9.png"
            class="player-input-bg"
            alt="Player input background"
          />
          <input
            :id="`player-${index}`"
            v-model="playerNames[index]"
            type="text"
            class="player-input"
            :placeholder="placeholderForIndex(index)"
            maxlength="20"
            autocomplete="off"
          />
        </div>
      </div>
      <img src="~/assets/figma/start-1.png" class="start-btn" alt="Start game" @click="startGame" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, goBack, toast } = usePageSetup()
const { goToRoundStart } = useNavigation()
const { gameStore } = useGameState()
const runtimeConfig = useRuntimeConfig()

const minPlayers = runtimeConfig.public.minPlayers as number
const playerCount = ref(runtimeConfig.public.defaultPlayers as number)
const playerNames = ref<string[]>([])
const maxPlayers = computed(() => runtimeConfig.public.maxPlayers as number)

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

  const names = playerNames.value.slice(0, playerCount.value).map((name, index) => {
    const trimmed = name.trim()
    return trimmed || placeholderForIndex(index)
  })

  if (!names.length) {
    toast.warning(t('players.need_players'))
    return
  }

  const lowerCaseNames = names.map((name) => name.toLowerCase())
  const hasDuplicateNames = new Set(lowerCaseNames).size !== lowerCaseNames.length

  if (hasDuplicateNames) {
    toast.warning(t('players.duplicate_name'))
    return
  }

  gameStore.pendingPlayerNames = names
  toast.success(t('players.ready', { 0: names.length }))
  goToRoundStart()
}

useHead({
  title: t('players.title'),
  meta: [
    {
      name: 'description',
      content: t('players.description', 'Select players for the game'),
    },
  ],
})

syncPlayerList(playerCount.value)
</script>

<style scoped>
.players-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.players-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.players-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.back-btn {
  width: 64px;
  cursor: pointer;
}

.coin-bar {
  position: relative;
  width: 120px;
}

.coin-bar img {
  width: 100%;
}

.coin-bar-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.players-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.players-title-bg {
  width: 100%;
  max-width: 400px;
}

.players-title-text {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
}

.players-title-text img {
  width: 100%;
  max-width: 300px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.control-btn {
  width: 48px;
  cursor: pointer;
}

.player-count {
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  overflow-y: auto;
  padding: 1rem;
}

.player-item {
  position: relative;
  width: 100%;
}

.player-input-bg {
  width: 100%;
}

.player-input {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
}

.start-btn {
  width: 100%;
  max-width: 300px;
  cursor: pointer;
  margin-top: auto;
}
</style>
