<template>
  <GameBackground>
    <div class="scoring-page">
      <GameHeader color="gold">
        {{ t('scoring.title', 'Scoring') }}
      </GameHeader>

      <div class="scoring-page__list">
        <GamePlayerCard
          v-for="(player, index) in players"
          :key="player.id"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: index * 50 } }"
          :player="player"
          :label="`${t('scoring.player', 'Player')} ${index + 1}`"
        />
      </div>

      <GameButton
        variant="primary"
        size="lg"
        full-width
        class="scoring-page__button"
        @click="handleNextRound"
      >
        {{ t('scoring.next_round', 'Next Round') }}
      </GameButton>
    </div>
  </GameBackground>
</template>

<script setup lang="ts">
const { t, router } = usePageSetup()
const { gameStore } = useGameState()

const players = computed(() => gameStore.players)

const handleNextRound = async () => {
  await router.push('/round-start')
}

useHead({
  title: t('scoring.title', 'Scoring'),
  meta: [
    {
      name: 'description',
      content: t('scoring.description', 'View round scoring results'),
    },
  ],
})
</script>

<style scoped lang="scss">
@use 'assets/scss/design-system' as *;

.scoring-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl) var(--spacing-md);
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
}

.scoring-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  max-width: 600px;
}

.scoring-page__button {
  max-width: 600px;
}

@media (max-width: 640px) {
  .scoring-page {
    padding: var(--spacing-xl) var(--spacing-sm);
    gap: var(--spacing-xl);
  }
}
</style>
