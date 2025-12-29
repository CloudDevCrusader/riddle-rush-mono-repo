<template>
  <div class="homepage">
    <!-- Loading Spinner for Categories -->
    <Spinner
      v-if="categoriesLoading"
      overlay
      size="lg"
      :label="$t('home.loading_categories')"
    />

    <!-- Loading Spinner for Game Starting -->
    <Spinner
      v-if="gameStarting"
      overlay
      size="lg"
      :label="$t('home.starting_game')"
    />

    <!-- Background Pattern -->
    <div class="bg-pattern" />

    <!-- Main Container -->
    <div class="container">
      <!-- Header -->
      <header class="header animate-fade-in">
        <div class="logo-container">
          <div class="logo">
            <span class="logo-emoji">🎯</span>
          </div>
          <h1 class="title">
            {{ $t('app.title') }}
          </h1>
          <p class="subtitle">
            {{ $t('app.subtitle') }}
          </p>
        </div>

        <!-- Offline Badge -->
        <div class="offline-badge">
          <span class="offline-dot" />
          <span>{{ $t('home.offline_badge') }}</span>
        </div>
      </header>

      <!-- Quick Play Button -->
      <div class="quick-play animate-scale-in">
        <button
          data-testid="quick-start-button"
          class="btn btn-large btn-primary tap-highlight no-select touch-target"
          @click="startQuickGame"
        >
          <span class="btn-icon">⚡</span>
          <span>{{ $t('home.quick_start') }}</span>
        </button>
      </div>

      <!-- Categories Grid -->
      <div class="categories-section animate-slide-up">
        <h2 class="section-title">
          {{ $t('home.category_title') }}
        </h2>
        <p class="section-description">
          {{ $t('home.category_description') }}
        </p>

        <div
          class="categories-grid"
          data-testid="categories-grid"
        >
          <div
            v-for="category in displayedCategories"
            :key="category.id"
            :data-testid="`category-card-${category.id}`"
            class="category-card"
            :style="{ animationDelay: `${category.id * 50}ms` }"
          >
            <div class="category-icon">
              {{ getCategoryEmoji(category.name) }}
            </div>
            <h3 class="category-name">
              {{ category.name }}
            </h3>
          </div>
        </div>

        <!-- Load More Button -->
        <button
          v-if="hasMoreCategories"
          class="btn btn-outline load-more tap-highlight no-select"
          @click="loadMoreCategories"
        >
          <span>{{ $t('home.load_more') }}</span>
          <span class="btn-icon">↓</span>
        </button>
      </div>

      <!-- Features Section -->
      <div class="features-section animate-fade-in">
        <div class="feature-card">
          <div class="feature-icon">
            🎮
          </div>
          <h3>{{ $t('features.offline.title') }}</h3>
          <p>{{ $t('features.offline.description') }}</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            👥
          </div>
          <h3>{{ $t('features.multiplayer.title') }}</h3>
          <p>{{ $t('features.multiplayer.description') }}</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            📱
          </div>
          <h3>{{ $t('features.installable.title') }}</h3>
          <p>{{ $t('features.installable.description') }}</p>
        </div>
      </div>

      <!-- Footer -->
      <footer class="footer">
        <NuxtLink
          to="/about"
          class="footer-link"
        >{{ $t('home.about_link') }}</NuxtLink>
        <span class="footer-divider">•</span>
        <NuxtLink
          to="/leaderboard"
          class="footer-link"
        >{{ $t('leaderboard.title') }}</NuxtLink>
        <span class="footer-divider">•</span>
        <NuxtLink
          to="/language"
          class="footer-link"
        >{{ $t('language.title', 'Language') }}</NuxtLink>
        <span class="footer-divider">•</span>
        <NuxtLink
          to="/credits"
          class="footer-link"
        >{{ $t('credits.title', 'Credits') }}</NuxtLink>
        <span class="footer-divider">•</span>
        <a
          href="#"
          class="footer-link"
          @click.prevent="shareGame"
        >{{ $t('common.share') }}</a>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const router = useRouter()
const gameStore = useGameStore()

const displayedCategories = computed(() => gameStore.displayedCategories)
const hasMoreCategories = computed(() => gameStore.hasMoreCategories)

const categoriesLoading = ref(false)
const gameStarting = ref(false)

onMounted(async () => {
  if (!gameStore.categoriesLoaded) {
    categoriesLoading.value = true
    try {
      await gameStore.fetchCategories()
      gameStore.resetDisplayedCategories()
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      categoriesLoading.value = false
    }
  }
})

const loadMoreCategories = () => {
  gameStore.loadMoreCategories()
}

const startQuickGame = async () => {
  gameStarting.value = true
  try {
    await gameStore.startNewGame()
    await router.push('/game')
  } catch (error) {
    console.error('Error starting quick game:', error)
    gameStarting.value = false
  }
}

const { t } = useI18n()

const shareGame = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: t('share.game_title'),
        text: t('share.game_text'),
        url: window.location.href,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }
}

const getCategoryEmoji = (name: string): string => gameStore.categoryEmoji(name)

useHead({
  title: () => t('share.game_title'),
  meta: [
    {
      name: 'description',
      content: () => t('app.description'),
    },
  ],
})
</script>

<style scoped>
.homepage {
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
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
  padding-bottom: var(--spacing-3xl);
}

/* Header */
.header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  padding-top: var(--spacing-2xl);
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.logo {
  width: 120px;
  height: 120px;
  background: var(--color-white);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-xl);
  margin-bottom: var(--spacing-md);
}

.logo-emoji {
  font-size: 64px;
}

.title {
  font-family: var(--font-display);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin: 0;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: var(--font-size-lg);
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: var(--font-weight-medium);
}

.offline-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-full);
  color: var(--color-white);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin-top: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.offline-dot {
  width: 8px;
  height: 8px;
  background: var(--color-accent-green);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* Quick Play */
.quick-play {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-3xl);
}

.quick-play .btn {
  font-size: var(--font-size-2xl);
  padding: var(--spacing-xl) var(--spacing-3xl);
  min-height: 72px;
}

.btn-icon {
  font-size: 1.5em;
}

/* Categories Section */
.categories-section {
  margin-bottom: var(--spacing-3xl);
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

@media (max-width: 640px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
}

.category-card {
  position: relative;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
  animation: fadeIn var(--transition-slow) ease-out backwards;
  min-height: 100px;
}

.category-icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  background: var(--color-primary-gradient);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: var(--shadow-sm);
}

.category-name {
  flex: 1;
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-dark);
  margin: 0;
}

.section-description {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-base);
  margin: calc(var(--spacing-md) * -1) auto var(--spacing-xl);
  max-width: 600px;
}

.load-more {
  display: flex;
  margin: 0 auto;
  gap: var(--spacing-sm);
}

/* Features Section */
.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-3xl);
}

.feature-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-white);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.feature-card h3 {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-sm) 0;
}

.feature-card p {
  font-size: var(--font-size-base);
  margin: 0;
  opacity: 0.9;
}

/* Footer */
.footer {
  text-align: center;
  padding: var(--spacing-xl) 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--font-size-sm);
}

.footer-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: color var(--transition-base);
  font-weight: var(--font-weight-medium);
}

.footer-link:hover {
  color: var(--color-white);
  text-decoration: underline;
}

.footer-divider {
  margin: 0 var(--spacing-md);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
