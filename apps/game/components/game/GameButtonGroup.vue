<template>
  <div class="game-button-group" :class="rootClass" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

type Layout = 'stack' | 'row' | 'responsive';
type Justify = 'stretch' | 'center' | 'start' | 'end' | 'between';

interface Props {
  /** Vertical stack, horizontal row, or column on narrow screens / row from 481px up */
  layout?: Layout;
  /** Larger gaps between buttons (recommended for primary action stacks) */
  relaxed?: boolean;
  /** Pill-shaped child buttons (matches leaderboard / scoring footers) */
  pill?: boolean;
  /** Allow wrapping (e.g. fortune wheel actions) */
  wrap?: boolean;
  /** Main-axis alignment for row layouts */
  justify?: Justify;
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'responsive',
  relaxed: true,
  pill: false,
  wrap: false,
  justify: 'stretch',
});

const rootClass = computed(() => [
  `game-button-group--layout-${props.layout}`,
  `game-button-group--justify-${props.justify}`,
  {
    'game-button-group--relaxed': props.relaxed,
    'game-button-group--pill': props.pill,
    'game-button-group--wrap': props.wrap,
  },
]);
</script>

<style scoped lang="scss">
.game-button-group {
  display: flex;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  align-items: stretch;
}

.game-button-group--layout-stack {
  flex-direction: column;
}

.game-button-group--layout-row {
  flex-direction: row;
  flex-wrap: nowrap;
}

.game-button-group--wrap {
  flex-wrap: wrap;
}

.game-button-group--layout-responsive {
  flex-direction: column;
}

.game-button-group--justify-stretch {
  justify-content: flex-start;
}

.game-button-group--justify-center {
  justify-content: center;
}

.game-button-group--justify-start {
  justify-content: flex-start;
}

.game-button-group--justify-end {
  justify-content: flex-end;
}

.game-button-group--justify-between {
  justify-content: space-between;
}

/* Spacing: relaxed = roomier stacks (2–3 full-width CTAs) */
.game-button-group--relaxed.game-button-group--layout-stack,
.game-button-group--relaxed.game-button-group--layout-responsive {
  gap: var(--spacing-xl);
}

.game-button-group--relaxed.game-button-group--layout-row {
  gap: var(--spacing-lg);
}

.game-button-group:not(.game-button-group--relaxed).game-button-group--layout-stack,
.game-button-group:not(.game-button-group--relaxed).game-button-group--layout-responsive {
  gap: var(--spacing-md);
}

.game-button-group:not(.game-button-group--relaxed).game-button-group--layout-row {
  gap: var(--spacing-md);
}

@media (max-width: 480px) {
  .game-button-group--relaxed.game-button-group--layout-stack,
  .game-button-group--relaxed.game-button-group--layout-responsive {
    gap: var(--spacing-lg);
  }
}

@media (min-width: 481px) {
  .game-button-group--layout-responsive {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
  }

  .game-button-group--layout-responsive.game-button-group--justify-stretch :deep(.game-button) {
    flex: 1 1 0;
    min-width: 0;
  }
}

/* Equal-width row when parent stretches along main axis */
.game-button-group--layout-row.game-button-group--justify-stretch:not(.game-button-group--wrap)
  :deep(.game-button) {
  flex: 1 1 0;
  min-width: 0;
}

.game-button-group--pill :deep(.game-button) {
  border-radius: var(--radius-full);
}
</style>
