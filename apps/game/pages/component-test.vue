<template>
  <GameBackground>
    <div class="test-container">
      <!-- Test GameHeader -->
      <section class="test-section">
        <h2 class="section-title">GameHeader Component</h2>
        <div class="header-tests">
          <GameHeader color="white">WHITE HEADER</GameHeader>
          <GameHeader color="gold">GOLD HEADER</GameHeader>
          <GameHeader color="green">
            <template #left>
              <button class="back-btn">←</button>
            </template>
            GREEN WITH BACK
          </GameHeader>
          <GameHeader color="blue">BLUE HEADER</GameHeader>
          <GameHeader color="orange">ORANGE HEADER</GameHeader>
        </div>
      </section>

      <!-- Test GameModal -->
      <section class="test-section">
        <h2 class="section-title">GameModal Component</h2>
        <div class="modal-buttons">
          <GameButton @click="showModal = true">Open Default Modal</GameButton>
          <GameButton variant="warning" @click="showDangerModal = true">
            Open Danger Modal
          </GameButton>
        </div>

        <GameModal v-model="showModal" title="Settings">
          <p class="modal-text">This is a default modal with blue header.</p>
          <p class="modal-text">Try pressing Tab, Escape, or clicking backdrop.</p>
          <GameButton full-width @click="showModal = false"> Close Modal </GameButton>
        </GameModal>

        <GameModal v-model="showDangerModal" variant="danger" title="Quit Game">
          <p class="modal-text">Are you sure you want to quit?</p>
          <div class="modal-actions">
            <GameButton variant="warning" @click="showDangerModal = false"> YES </GameButton>
            <GameButton variant="primary" @click="showDangerModal = false"> NO </GameButton>
          </div>
        </GameModal>
      </section>

      <!-- Test GameScrollList -->
      <section class="test-section">
        <h2 class="section-title">GameScrollList Component</h2>
        <GamePanel class="list-panel">
          <GameScrollList :items="testPlayers" show-ranks max-height="300px">
            <template #default="{ item }">
              <div class="player-row">
                <span class="player-name">{{ item.name }}</span>
                <GameDisplay size="sm">{{ item.score }}</GameDisplay>
              </div>
            </template>
          </GameScrollList>
        </GamePanel>
      </section>
    </div>
  </GameBackground>
</template>

<script setup lang="ts">
const showModal = ref(false)
const showDangerModal = ref(false)

const testPlayers = ref([
  { id: 1, name: 'Alice', score: 1500 },
  { id: 2, name: 'Bob', score: 1200 },
  { id: 3, name: 'Charlie', score: 950 },
  { id: 4, name: 'Diana', score: 800 },
  { id: 5, name: 'Eve', score: 600 },
  { id: 6, name: 'Frank', score: 450 },
])
</script>

<style scoped lang="scss">
.test-container {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  max-width: 600px;
  margin: 0 auto;
}

.test-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-title {
  color: white;
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-tests {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: var(--font-size-xl);
  cursor: pointer;
}

.modal-buttons {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.modal-text {
  color: var(--color-text-dark);
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.list-panel {
  max-width: 400px;
}

.player-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.player-name {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-dark);
}
</style>
