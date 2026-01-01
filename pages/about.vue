<template>
  <div
    ref="pageElement"
    class="about-page"
  >
    <!-- Background Image -->
    <img
      :src="`${baseUrl}assets/credits/BACKGROUND.png`"
      alt="Background"
      class="page-bg"
    >

    <!-- Back Button -->
    <button
      class="back-btn tap-highlight no-select"
      @click="goBack"
    >
      <img
        :src="`${baseUrl}assets/credits/back.png`"
        alt="Back"
      >
    </button>

    <!-- Main Container -->
    <div class="container">
      <!-- Title -->
      <div class="title-container animate-fade-in">
        <h1 class="page-title">
          📖 {{ $t('about.title', 'About') }}
        </h1>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs-container animate-scale-in">
        <div class="tab-buttons">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-btn tap-highlight no-select"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-label">{{ $t(tab.label, tab.default) }}</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Tutorial Tab -->
          <div
            v-if="activeTab === 'tutorial'"
            class="content-section"
          >
            <h2>{{ $t('about.tutorial_title', 'How to Play') }}</h2>

            <div class="tutorial-steps">
              <div
                v-for="(step, index) in tutorialSteps"
                :key="index"
                class="tutorial-step"
              >
                <div class="step-number">
                  {{ index + 1 }}
                </div>
                <div class="step-content">
                  <h3>{{ $t(step.title, step.defaultTitle) }}</h3>
                  <p>{{ $t(step.description, step.defaultDescription) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Rules Tab -->
          <div
            v-if="activeTab === 'rules'"
            class="content-section"
          >
            <h2>{{ $t('about.rules_title', 'Game Rules') }}</h2>

            <div class="rules-list">
              <div
                v-for="(rule, index) in gameRules"
                :key="index"
                class="rule-item"
              >
                <div class="rule-icon">
                  {{ rule.icon }}
                </div>
                <div class="rule-content">
                  <h3>{{ $t(rule.title, rule.defaultTitle) }}</h3>
                  <p>{{ $t(rule.description, rule.defaultDescription) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Credits Tab -->
          <div
            v-if="activeTab === 'credits'"
            class="content-section"
          >
            <h2>{{ $t('about.credits_title', 'Credits') }}</h2>

            <div class="credits-list">
              <div class="credit-category">
                <h3>🎮 {{ $t('credits.game_design', 'Game Design') }}</h3>
                <p class="credit-names">
                  Tobi, sophia
                </p>
              </div>

              <div class="credit-category">
                <h3>💻 {{ $t('credits.programming', 'Programming') }}</h3>
                <p class="credit-names">
                  Markus
                </p>
              </div>

              <div class="credit-category">
                <h3>🎨 {{ $t('credits.art', 'Art & Design') }}</h3>
                <p class="credit-names">
                  sarmad Ali
                </p>
              </div>
            </div>

            <div class="tech-info">
              <h3>⚙️ {{ $t('about.technologies', 'Technologies Used') }}</h3>
              <ul class="tech-list">
                <li>Nuxt 4.2.2</li>
                <li>Vue 3.5.26 Composition API</li>
                <li>Pinia State Management</li>
                <li>IndexedDB for Local Storage</li>
                <li>Vite PWA Plugin</li>
                <li>TypeScript</li>
                <li>Playwright E2E Testing</li>
              </ul>
            </div>

            <div class="version-info">
              <p>{{ $t('about.version', 'Version') }}: 1.0.0</p>
              <p>{{ $t('about.pwa', 'Progressive Web App') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Close Button -->
      <div class="action-buttons animate-slide-up">
        <button
          class="action-btn close-btn-large tap-highlight no-select"
          @click="goBack"
        >
          <img
            :src="`${baseUrl}assets/credits/close.png`"
            alt="Close"
          >
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl

const activeTab = ref('tutorial')

const tabs = [
  { id: 'tutorial', icon: '📖', label: 'about.tab_tutorial', default: 'Tutorial' },
  { id: 'rules', icon: '📋', label: 'about.tab_rules', default: 'Rules' },
  { id: 'credits', icon: '👥', label: 'about.tab_credits', default: 'Credits' },
]

const tutorialSteps = [
  {
    title: 'about.step1_title',
    defaultTitle: '1. Setup Players',
    description: 'about.step1_desc',
    defaultDescription: 'Start by adding player names. You can have 2-6 players. The game comes with 2 default players so you can start playing immediately!',
  },
  {
    title: 'about.step2_title',
    defaultTitle: '2. Spin the Wheels',
    description: 'about.step2_desc',
    defaultDescription: 'The dual spinning wheels will randomly select a category and a letter for the round. Watch them spin and see what challenge awaits!',
  },
  {
    title: 'about.step3_title',
    defaultTitle: '3. Submit Answers',
    description: 'about.step3_desc',
    defaultDescription: 'Each player takes turns submitting a word that matches the category and starts with the selected letter. The game validates answers against Wikipedia.',
  },
  {
    title: 'about.step4_title',
    defaultTitle: '4. Score & Win',
    description: 'about.step4_desc',
    defaultDescription: 'Correct answers earn points! After all players submit, view the leaderboard. The player with the highest total score at the end wins the crown! 👑',
  },
]

const gameRules = [
  {
    icon: '🎯',
    title: 'about.rule1_title',
    defaultTitle: 'Objective',
    description: 'about.rule1_desc',
    defaultDescription: 'Find valid terms from the selected Wikipedia category that start with the chosen letter.',
  },
  {
    icon: '🔄',
    title: 'about.rule2_title',
    defaultTitle: 'Taking Turns',
    description: 'about.rule2_desc',
    defaultDescription: 'Players take turns submitting answers. All players must submit before proceeding to scoring.',
  },
  {
    icon: '⭐',
    title: 'about.rule3_title',
    defaultTitle: 'Scoring',
    description: 'about.rule3_desc',
    defaultDescription: 'Each correct answer earns points. The game validates answers using real Wikipedia data.',
  },
  {
    icon: '🏆',
    title: 'about.rule4_title',
    defaultTitle: 'Winning',
    description: 'about.rule4_desc',
    defaultDescription: 'The player with the highest total score when the game ends receives the winner\'s crown!',
  },
  {
    icon: '🔁',
    title: 'about.rule5_title',
    defaultTitle: 'Multiple Rounds',
    description: 'about.rule5_desc',
    defaultDescription: 'Play as many rounds as you like! Each round has a new category and letter combination.',
  },
]

const goBack = () => {
  router.back()
}

// Mobile swipe gesture: swipe right to go back
const { pageElement } = usePageSwipe({
  onSwipeRight: () => {
    goBack()
  },
  threshold: 80,
})

useHead({
  title: 'About',
  meta: [
    {
      name: 'description',
      content: 'Learn how to play Guess Game and view credits',
    },
  ],
})
</script>

<style scoped>
.about-page {
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
  gap: var(--spacing-xl);
}

/* Title */
.title-container {
  text-align: center;
}

.page-title {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-2xl), 5vw, var(--font-size-4xl));
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  margin: 0;
}

/* Tabs Container */
.tabs-container {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.tab-buttons {
  display: flex;
  background: var(--color-primary);
  border-bottom: 3px solid var(--color-primary-dark);
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-md);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
  color: rgba(255, 255, 255, 0.7);
  position: relative;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-white);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-white);
}

.tab-icon {
  font-size: 24px;
}

.tab-label {
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tab-btn:active {
  opacity: 0.8;
}

/* Tab Content */
.tab-content {
  padding: var(--spacing-2xl);
  max-height: 60vh;
  overflow-y: auto;
}

.content-section h2 {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-black);
  color: var(--color-primary);
  margin: 0 0 var(--spacing-xl) 0;
  text-align: center;
}

/* Tutorial Steps */
.tutorial-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.tutorial-step {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-light);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--color-primary);
}

.step-number {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-white);
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-black);
  border-radius: 50%;
}

.step-content h3 {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-dark);
  margin: 0 0 var(--spacing-sm) 0;
}

.step-content p {
  font-size: var(--font-size-base);
  color: var(--color-gray);
  line-height: 1.6;
  margin: 0;
}

/* Rules List */
.rules-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.rule-item {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-light);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.rule-item:hover {
  background: rgba(255, 107, 53, 0.1);
}

.rule-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: var(--color-white);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rule-content h3 {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-dark);
  margin: 0 0 var(--spacing-sm) 0;
}

.rule-content p {
  font-size: var(--font-size-base);
  color: var(--color-gray);
  line-height: 1.6;
  margin: 0;
}

/* Credits List */
.credits-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.credit-category {
  padding: var(--spacing-lg);
  background: var(--color-light);
  border-radius: var(--radius-lg);
  text-align: center;
}

.credit-category h3 {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-dark);
  margin: 0 0 var(--spacing-sm) 0;
}

.credit-names {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.tech-info {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-light);
  border-radius: var(--radius-lg);
}

.tech-info h3 {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-dark);
  margin: 0 0 var(--spacing-md) 0;
  text-align: center;
}

.tech-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-sm);
}

.tech-list li {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-white);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-gray);
  text-align: center;
}

.version-info {
  text-align: center;
  padding: var(--spacing-lg);
  background: rgba(255, 107, 53, 0.1);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-primary);
}

.version-info p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-dark);
  font-weight: var(--font-weight-semibold);
}

.version-info p + p {
  margin-top: var(--spacing-xs);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-btn-large {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}

.close-btn-large img {
  width: clamp(150px, 25vw, 250px);
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

.close-btn-large:active {
  opacity: 0.8;
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

  .tab-content {
    padding: var(--spacing-lg);
    max-height: 55vh;
  }

  .tutorial-step,
  .rule-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .step-number,
  .rule-icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-lg);
  }

  .rule-icon {
    font-size: 24px;
  }

  .tech-list {
    grid-template-columns: 1fr;
  }

  .close-btn-large img {
    width: 150px;
  }
}
</style>
