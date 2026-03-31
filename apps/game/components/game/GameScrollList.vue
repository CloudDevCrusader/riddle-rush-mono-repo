<script setup lang="ts">
/**
 * GameScrollList Component
 *
 * Scrollable list with optional rank display (crowns 1-3, numbered badges 4+).
 * Used for leaderboards, player lists, and other ranked content.
 *
 * Usage:
 * - Simple list: <GameScrollList><div>Item</div><div>Item</div></GameScrollList>
 * - With ranks: <GameScrollList :show-ranks="true"><div>Player 1</div><div>Player 2</div></GameScrollList>
 * - Custom height: <GameScrollList max-height="600px">...</GameScrollList>
 */

interface Props {
  /** Display rank indicators (crowns 1-3, numbered 4+) */
  showRanks?: boolean
  /** Maximum height before scrolling */
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  showRanks: false,
  maxHeight: '400px',
})

const listStyles = computed(() => ({
  maxHeight: props.maxHeight,
}))
</script>

<template>
  <div class="game-scroll-list" :style="listStyles" tabindex="0" role="list">
    <div
      v-for="(_, index) in $slots.default?.()"
      :key="index"
      class="game-scroll-list__row"
      role="listitem"
    >
      <!-- Rank indicator (crowns 1-3, numbers 4+) -->
      <div v-if="showRanks" class="game-scroll-list__rank">
        <!-- Crown for ranks 1-3 -->
        <svg
          v-if="index === 0"
          class="game-scroll-list__crown game-scroll-list__crown--gold"
          viewBox="0 0 24 24"
          aria-label="1st place"
        >
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 4h14v2H5v-2z" fill="currentColor" />
        </svg>

        <svg
          v-else-if="index === 1"
          class="game-scroll-list__crown game-scroll-list__crown--silver"
          viewBox="0 0 24 24"
          aria-label="2nd place"
        >
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 4h14v2H5v-2z" fill="currentColor" />
        </svg>

        <svg
          v-else-if="index === 2"
          class="game-scroll-list__crown game-scroll-list__crown--bronze"
          viewBox="0 0 24 24"
          aria-label="3rd place"
        >
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 4h14v2H5v-2z" fill="currentColor" />
        </svg>

        <!-- Numbered badge for ranks 4+ -->
        <div v-else class="game-scroll-list__badge">
          {{ Number(index) + 1 }}
        </div>
      </div>

      <!-- Content slot -->
      <div class="game-scroll-list__content">
        <component :is="$slots.default?.()?.[index]" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.game-scroll-list {
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  border-radius: var(--radius-md);

  // Custom scrollbar styling (WebKit)
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    transition: background var(--transition-base);

    &:hover {
      background: rgba(255, 255, 255, 0.4);
    }
  }

  // Firefox scrollbar styling
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.1);

  // Smooth scrolling
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  // Rows
  &__row {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 239, 194, 0.95) 100%
    );
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-sm);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: transform var(--transition-base);

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }
  }

  // Rank indicator container
  &__rank {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  // Crown icons (SVG)
  &__crown {
    width: 28px;
    height: 28px;

    &--gold {
      color: var(--color-text-yellow);
      filter: drop-shadow(0 2px 4px rgba(255, 213, 79, 0.5));
    }

    &--silver {
      color: #c0c0c0;
      filter: drop-shadow(0 2px 4px rgba(192, 192, 192, 0.5));
    }

    &--bronze {
      color: #cd7f32;
      filter: drop-shadow(0 2px 4px rgba(205, 127, 50, 0.5));
    }
  }

  // Numbered badge (ranks 4+)
  &__badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--color-border-gold);
    border-radius: 50%;
    font-family: var(--font-display);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-dark);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  // Content area
  &__content {
    flex: 1;
    min-width: 0; // Allow text truncation
  }
}

// Small phone adjustments
@media (max-width: 480px) {
  .game-scroll-list {
    &__row {
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
    }

    &__rank {
      width: 28px;
      height: 28px;
    }

    &__crown {
      width: 24px;
      height: 24px;
    }

    &__badge {
      width: 24px;
      height: 24px;
      font-size: var(--font-size-sm);
    }
  }
}

@media (max-width: 360px) {
  .game-scroll-list {
    &__row {
      gap: var(--spacing-xs);
      padding: var(--spacing-xs);
      margin-bottom: var(--spacing-xs);
    }
  }
}
</style>
