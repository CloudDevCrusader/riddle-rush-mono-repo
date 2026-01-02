<template>
  <div class="credits-page">
    <!-- Background Image -->
    <img
      :src="`${baseUrl}assets/credits/BACKGROUND.png`"
      alt="Background"
      class="page-bg"
    />

    <!-- Back Button -->
    <button
      class="back-btn tap-highlight no-select"
      @click="goBack"
    >
      <img
        :src="`${baseUrl}assets/credits/back.png`"
        alt="Back"
      />
    </button>

    <!-- Main Container -->
    <div class="container">
      <!-- Title -->
      <div class="title-container animate-fade-in">
        <img
          :src="`${baseUrl}assets/credits/CREDITS.png`"
          alt="CREDITS"
          class="title-image"
        />
      </div>

      <!-- Credits Panel -->
      <div class="credits-panel animate-scale-in">
        <!-- Game Design -->
        <div class="credit-section">
          <h2 class="section-heading">
            Game Design
          </h2>
          <div class="credit-box">
            <span class="credit-name">Tobi</span>
            <span class="credit-divider"></span>
            <span class="credit-name">Sophia</span>
          </div>
        </div>

        <!-- Programming -->
        <div class="credit-section">
          <h2 class="section-heading">
            Programming
          </h2>
          <div class="credit-box">
            <span class="credit-name">Markus</span>
          </div>
        </div>

        <!-- Art -->
        <div class="credit-section">
          <h2 class="section-heading">
            Art
          </h2>
          <div class="credit-box">
            <span class="credit-name">Sarmad Ali</span>
          </div>
        </div>
      </div>

      <!-- OK Button -->
      <button
        class="ok-btn tap-highlight no-select animate-slide-up"
        @click="goBack"
      >
        <img
          :src="`${baseUrl}assets/credits/ok.png`"
          alt="OK"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { baseUrl, goBack } = usePageSetup()

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
  overflow-x: hidden;
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
  transform: scale(0.95);
}

/* Container */
.container {
  position: relative;
  z-index: 2;
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  padding: var(--spacing-3xl) var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3xl);
}

/* Title */
.title-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-2xl);
}

.title-image {
  width: clamp(250px, 35vw, 400px);
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

/* Credits Panel */
.credits-panel {
  width: 100%;
  background: linear-gradient(180deg, rgba(68, 200, 255, 0.95) 0%, rgba(10, 107, 194, 0.95) 100%);
  border: 6px solid #ff8800;
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow:
    0 12px 0 rgba(0, 0, 0, 0.2),
    inset 0 2px 10px rgba(255, 255, 255, 0.3),
    var(--shadow-xl);
}

.credit-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  background: rgba(10, 75, 199, 0.8);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 2px solid rgba(68, 200, 255, 0.5);
}

.credit-section:last-child {
  margin-bottom: 0;
}

.section-heading {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  font-weight: var(--font-weight-bold);
  color: #44c8ff;
  margin: 0;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.credit-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
  padding: var(--spacing-md);
}

.credit-name {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.credit-divider {
  width: 2px;
  height: 24px;
  background: rgba(255, 255, 255, 0.3);
}

/* OK Button */
.ok-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.ok-btn img {
  width: clamp(150px, 25vw, 200px);
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

.ok-btn:active {
  transform: scale(0.95);
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
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
    width: 250px;
  }

  .credits-panel {
    padding: var(--spacing-xl);
  }

  .ok-btn img {
    width: 150px;
  }
}
</style>
