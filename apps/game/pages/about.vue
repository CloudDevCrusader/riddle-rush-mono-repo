<template>
  <div class="about-page">
    <!-- Background Image -->
    <img
      :src="`${baseUrl}assets/main-menu/BACKGROUND.png`"
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
        <h1>{{ $t('about.title', 'ABOUT') }}</h1>
      </div>

      <!-- About Panel -->
      <div class="about-panel animate-scale-in">
        <!-- Creators Section -->
        <div class="section">
          <p class="creators">
            {{ $t('about.creators', 'Created by Tobias Wirl and Markus Wagner') }}
          </p>
        </div>

        <!-- How It Works Section -->
        <div class="section">
          <h2 class="section-heading">
            {{ $t('about.how_it_works.title', 'How It Works') }}
          </h2>
          <p class="section-text">
            {{
              $t(
                'about.how_it_works.description',
                'Riddle Rush is a word guessing game that uses Wikipedia categories via PetScan API. Players guess terms from a selected category that start with a specific letter.',
              )
            }}
          </p>
        </div>

        <!-- Progressive Web App Section -->
        <div class="section">
          <h2 class="section-heading">
            {{ $t('about.pwa.title', 'Progressive Web App') }}
          </h2>
          <p class="section-text">
            {{
              $t(
                'about.pwa.description',
                'This game is built as a Progressive Web App (PWA) with full offline support. You can install it on your device and play without an internet connection.',
              )
            }}
          </p>
        </div>

        <!-- Technologies Used Section -->
        <div class="section">
          <h2 class="section-heading">
            {{ $t('about.technologies.title', 'Technologies Used') }}
          </h2>
          <ul class="tech-list">
            <li>Nuxt 4</li>
            <li>Vue 3</li>
            <li>Pinia</li>
            <li>IndexedDB</li>
            <li>TypeScript</li>
            <li>Playwright</li>
          </ul>
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
const { baseUrl, goBack, t } = usePageSetup()

useHead({
  title: `${t('about.title', 'ABOUT')} - Riddle Rush`,
  meta: [
    {
      name: 'description',
      content: t(
        'about.how_it_works.description',
        'Learn about Riddle Rush, a word guessing game built as a Progressive Web App',
      ),
    },
  ],
})
</script>

<style scoped>
.about-page {
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
  max-width: 800px;
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

.title-container h1 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: var(--font-weight-bold);
  color: #44c8ff;
  margin: 0;
  text-align: center;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* About Panel */
.about-panel {
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

/* Section */
.section {
  margin-bottom: var(--spacing-xl);
  background: rgba(10, 75, 199, 0.8);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 2px solid rgba(68, 200, 255, 0.5);
}

.section:last-child {
  margin-bottom: 0;
}

.section-heading {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  font-weight: var(--font-weight-bold);
  color: #44c8ff;
  margin: 0 0 var(--spacing-md) 0;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.section-text {
  font-family: var(--font-display);
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.6;
  color: var(--color-white);
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.creators {
  font-family: var(--font-display);
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
  text-align: center;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Technology List */
.tech-list {
  list-style: none;
  padding: 0;
  margin: var(--spacing-md) 0 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-sm);
}

.tech-list li {
  font-family: var(--font-display);
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(68, 200, 255, 0.3);
  border-radius: var(--radius-md);
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(68, 200, 255, 0.5);
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

  .about-panel {
    padding: var(--spacing-xl);
  }

  .tech-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .ok-btn img {
    width: 150px;
  }
}
</style>
