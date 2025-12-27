<template>
  <div class="credits-page">
    <!-- Background Pattern -->
    <div class="bg-pattern" />

    <!-- Header -->
    <header class="credits-header">
      <button
        class="back-btn tap-highlight no-select"
        @click="goBack"
      >
        <span>←</span>
      </button>

      <div class="spacer" />

      <div class="coins-display">
        <span class="coin-icon">🪙</span>
        <span class="coin-value">100</span>
        <button class="add-btn tap-highlight no-select">
          <span>+</span>
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <div class="container">
      <!-- Title -->
      <h1 class="title animate-scale-in">
        {{ $t('credits.title', 'CREDITS') }}
      </h1>

      <!-- Credits Card -->
      <div class="credits-card animate-slide-up">
        <div class="credits-content">
          <!-- Game Design -->
          <div class="credit-section">
            <h2 class="section-heading">
              {{ $t('credits.game_design', 'Game Design') }}
            </h2>
            <div class="credit-box">
              <span class="credit-name">Tobi</span>
              <span class="credit-divider" />
              <span class="credit-name">sophia</span>
            </div>
          </div>

          <!-- Programming -->
          <div class="credit-section">
            <h2 class="section-heading">
              {{ $t('credits.programming', 'Programming') }}
            </h2>
            <div class="credit-box">
              <span class="credit-name">Markus</span>
            </div>
          </div>

          <!-- Art -->
          <div class="credit-section">
            <h2 class="section-heading">
              {{ $t('credits.art', 'Art') }}
            </h2>
            <div class="credit-box">
              <span class="credit-name">sarmad Ali</span>
            </div>
          </div>
        </div>
      </div>

      <!-- OK Button -->
      <button
        class="btn btn-large btn-ok tap-highlight no-select"
        @click="goBack"
      >
        <span>{{ $t('common.ok', 'OK') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const goBack = () => {
  router.back()
}

useHead({
  title: 'Riddle Rush - Credits',
  meta: [
    {
      name: 'description',
      content: 'Meet the team behind Riddle Rush',
    },
  ],
})
</script>

<style scoped>
.credits-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  background: var(--bg-gradient-main);
  overflow-x: hidden;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* Header */
.credits-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-md);
}

.back-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-accent-red);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--color-white);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-lg);
}

.back-btn:active {
  transform: scale(0.95);
}

.spacer {
  flex: 1;
}

.coins-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.9);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
}

.coin-icon {
  font-size: 24px;
}

.coin-value {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-dark);
}

.add-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-accent-green);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--color-white);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.add-btn:active {
  transform: scale(0.9);
}

/* Container */
.container {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
}

/* Title */
.title {
  font-family: var(--font-display);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-black);
  color: #FFD700;
  text-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2),
    -2px -2px 0 #FF8C00,
    2px 2px 0 #FF8C00;
  margin: 0;
  text-align: center;
  letter-spacing: 0.05em;
}

/* Credits Card */
.credits-card {
  width: 100%;
  background: linear-gradient(180deg, #E0F7FF 0%, #B3E5FC 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow:
    var(--shadow-xl),
    inset 0 2px 0 rgba(255, 255, 255, 0.5);
  border: 4px solid rgba(255, 255, 255, 0.5);
}

.credits-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.credit-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-heading {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: #4A90E2;
  margin: 0;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.credit-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  background: #2C5F8D;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  min-height: 60px;
}

.credit-name {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.credit-divider {
  width: 2px;
  height: 24px;
  background: rgba(255, 255, 255, 0.3);
}

/* OK Button */
.btn-ok {
  width: 100%;
  max-width: 400px;
  background: linear-gradient(180deg, #7ED321 0%, #5FB31F 100%);
  color: var(--color-white);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-black);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    var(--shadow-xl),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
}

.btn-ok:hover {
  transform: translateY(-2px);
  box-shadow:
    0 20px 52px rgba(0, 0, 0, 0.25),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
}

.btn-ok:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 640px) {
  .title {
    font-size: var(--font-size-3xl);
  }

  .credits-card {
    padding: var(--spacing-xl);
  }

  .section-heading {
    font-size: var(--font-size-lg);
  }

  .credit-name {
    font-size: var(--font-size-lg);
  }
}
</style>
