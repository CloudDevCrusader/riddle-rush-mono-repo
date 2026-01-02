<template>
  <div
    class="spinner"
    :class="[`spinner--${size}`, { 'spinner--overlay': overlay }]"
  >
    <div class="spinner__circle"></div>
    <span
      v-if="label"
      class="spinner__label"
    >{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  label?: string
  overlay?: boolean
}>(), {
  size: 'md',
  overlay: false,
})
</script>

<style scoped>
.spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.spinner--overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal);
  justify-content: center;
}

.spinner__circle {
  border-radius: 50%;
  border: 3px solid var(--color-light);
  border-top-color: var(--color-primary);
  animation: spin 0.8s linear infinite;
}

.spinner--sm .spinner__circle {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner--md .spinner__circle {
  width: 32px;
  height: 32px;
}

.spinner--lg .spinner__circle {
  width: 48px;
  height: 48px;
  border-width: 4px;
}

.spinner__label {
  font-size: var(--font-size-sm);
  color: var(--color-gray);
}

.spinner--overlay .spinner__label {
  color: var(--color-white);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
