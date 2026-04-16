<template>
  <GameBackground>
    <div
      class="credits-page page-shell"
      data-testid="credits-page"
    >
      <GameHeader
        color="gold"
        class="credits-header"
        data-testid="credits-header"
      >
        <template #left>
          <GameButton
            class="back-btn"
            variant="secondary"
            size="sm"
            :aria-label="t('common.back')"
            data-testid="credits-back-button"
            @click="goBack"
          >
            {{ t('common.back') }}
          </GameButton>
        </template>
        {{ t('credits.title', 'Credits') }}
      </GameHeader>

      <GamePanel
        class="credits-panel animate-scale-in"
        data-testid="credits-panel"
      >
        <!-- Game Design -->
        <div
          class="credit-section"
          data-testid="credits-section-0"
        >
          <h2
            class="section-heading"
            data-testid="credits-section-heading-0"
          >
            {{ t('credits.game_design') }}
          </h2>
          <div class="credit-box">
            <span
              class="credit-name"
              data-testid="credits-name-0"
            >Tobi</span>
            <span class="credit-divider" />
            <span
              class="credit-name"
              data-testid="credits-name-1"
            >Sophia</span>
          </div>
        </div>

        <!-- Programming -->
        <div
          class="credit-section"
          data-testid="credits-section-1"
        >
          <h2
            class="section-heading"
            data-testid="credits-section-heading-1"
          >
            {{ t('credits.programming') }}
          </h2>
          <div class="credit-box">
            <span
              class="credit-name"
              data-testid="credits-name-2"
            >Markus</span>
          </div>
        </div>

        <!-- Art -->
        <div
          class="credit-section"
          data-testid="credits-section-2"
        >
          <h2
            class="section-heading"
            data-testid="credits-section-heading-2"
          >
            {{ t('credits.art') }}
          </h2>
          <div class="credit-box">
            <span
              class="credit-name"
              data-testid="credits-name-3"
            >Sarmad Ali</span>
          </div>
        </div>

        <!-- Version -->
        <div class="version-info">v{{ appVersion }}</div>
      </GamePanel>

      <GameButton
        class="ok-btn animate-slide-up"
        variant="primary"
        size="lg"
        data-testid="credits-ok-button"
        @click="goBack"
      >
        {{ t('common.ok', 'OK') }}
      </GameButton>
    </div>
  </GameBackground>
</template>

<script setup lang="ts">
const { goBack } = usePageSetup()
const runtimeConfig = useRuntimeConfig()
const appVersion = runtimeConfig.public.appVersion
const { t } = useI18n()

useHead({
  title: t('credits.title'),
  meta: [
    {
      name: 'description',
      content: t('credits.description'),
    },
  ],
})
</script>

<style scoped>
.credits-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl) var(--spacing-md);
}

.credits-header {
  width: 100%;
  max-width: 700px;
}

.back-btn {
  min-width: 44px;
  min-height: 44px;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
  font-size: var(--font-size-xl);
  line-height: 1;
}

.credits-panel {
  width: 100%;
  max-width: 700px;
  background: linear-gradient(180deg, rgba(68, 200, 255, 0.95) 0%, rgba(10, 107, 194, 0.95) 100%);
  border: 4px solid #ff8800;
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

/* Version Info */
.version-info {
  text-align: center;
  font-family: var(--font-display);
  font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  color: rgba(255, 255, 255, 0.7);
  margin-top: var(--spacing-lg);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.ok-btn {
  width: min(260px, 70%);
}

/* Responsive */
@media (max-width: 768px) {
  .credits-panel {
    padding: var(--spacing-xl);
    max-height: 400px;
  }
}

@media (max-width: 480px) {
  .credits-page {
    padding: var(--spacing-xl) var(--spacing-sm);
    gap: var(--spacing-lg);
  }

  .credits-panel {
    padding: var(--spacing-lg);
    max-height: 300px;
    margin: 0 var(--spacing-sm);
  }

  .credit-section {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .ok-btn {
    width: min(220px, 80%);
  }
}

@media (max-width: 360px) {
  .credits-page {
    padding: var(--spacing-lg) var(--spacing-xs);
    gap: var(--spacing-md);
  }

  .credits-panel {
    padding: var(--spacing-md);
    max-height: 260px;
    border-width: 3px;
    margin: 0;
  }

  .credit-section {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .credit-box {
    gap: var(--spacing-md);
    padding: var(--spacing-sm);
  }

  .ok-btn {
    width: min(200px, 85%);
  }
}
</style>
