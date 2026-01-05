<template>
  <button :class="buttonClasses" :type="type" :disabled="disabled || loading" @click="handleClick">
    <span v-if="loading" class="button-spinner" />
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'base-button',
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  {
    'base-button--disabled': props.disabled || props.loading,
    'base-button--loading': props.loading,
    'base-button--full-width': props.fullWidth,
  },
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
  outline: none;
  position: relative;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Sizes */
.base-button--sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  min-height: 32px;
}

.base-button--md {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-md);
  min-height: 44px;
}

.base-button--lg {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-lg);
  min-height: 56px;
}

/* Variants */
.base-button--primary {
  background: var(--color-primary);
  color: var(--color-white);
  border: 3px solid var(--color-primary-dark);
  box-shadow: 0 4px 0 var(--color-primary-dark);
}

.base-button--primary:hover:not(.base-button--disabled) {
  background: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: 0 6px 0 var(--color-primary-dark);
}

.base-button--primary:active:not(.base-button--disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--color-primary-dark);
}

.base-button--secondary {
  background: var(--color-light);
  color: var(--color-dark);
  border: 3px solid var(--color-gray);
  box-shadow: 0 4px 0 var(--color-gray);
}

.base-button--secondary:hover:not(.base-button--disabled) {
  background: var(--color-white);
  transform: translateY(-2px);
  box-shadow: 0 6px 0 var(--color-gray);
}

.base-button--secondary:active:not(.base-button--disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--color-gray);
}

.base-button--danger {
  background: var(--color-danger);
  color: var(--color-white);
  border: 3px solid var(--color-danger-dark);
  box-shadow: 0 4px 0 var(--color-danger-dark);
}

.base-button--danger:hover:not(.base-button--disabled) {
  background: var(--color-danger-light);
  transform: translateY(-2px);
  box-shadow: 0 6px 0 var(--color-danger-dark);
}

.base-button--danger:active:not(.base-button--disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--color-danger-dark);
}

.base-button--ghost {
  background: transparent;
  color: var(--color-dark);
  border: none;
  box-shadow: none;
}

.base-button--ghost:hover:not(.base-button--disabled) {
  background: rgba(0, 0, 0, 0.05);
}

/* States */
.base-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.base-button--full-width {
  width: 100%;
}

.button-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
