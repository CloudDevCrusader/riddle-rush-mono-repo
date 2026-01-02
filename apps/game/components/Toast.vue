<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="[`toast-${toast.type}`]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-icon">
          {{ getIcon(toast.type) }}
        </div>
        <div class="toast-message">
          {{ toast.message }}
        </div>
        <button
          class="toast-close"
          aria-label="Close"
          @click.stop="removeToast(toast.id)"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { ToastType } from '~/composables/useToast'

const { toasts, remove } = useToast()

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✗'
    case 'warning':
      return '⚠'
    case 'info':
    default:
      return 'ℹ'
  }
}

const removeToast = (id: string) => {
  remove(id)
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--spacing-xl);
  right: var(--spacing-md);
  z-index: var(--z-toast, 9999);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 400px;
  width: calc(100% - var(--spacing-md) * 2);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  cursor: pointer;
  pointer-events: auto;
  min-height: 60px;
  transition: all var(--transition-base);
  border-left: 4px solid transparent;
}

.toast:hover {
  transform: translateX(-4px);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.15),
    0 6px 12px rgba(0, 0, 0, 0.1);
}

.toast-icon {
  font-size: 24px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  font-weight: var(--font-weight-bold);
}

.toast-message {
  flex: 1;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
  color: var(--color-dark);
}

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--color-gray);
  cursor: pointer;
  padding: var(--spacing-xs);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: all var(--transition-base);
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-dark);
}

/* Success Toast */
.toast-success {
  border-left-color: var(--color-accent-green, #2ecc71);
}

.toast-success .toast-icon {
  background: rgba(46, 204, 113, 0.1);
  color: var(--color-accent-green, #2ecc71);
}

/* Error Toast */
.toast-error {
  border-left-color: var(--color-accent-red, #e74c3c);
}

.toast-error .toast-icon {
  background: rgba(231, 76, 60, 0.1);
  color: var(--color-accent-red, #e74c3c);
}

/* Warning Toast */
.toast-warning {
  border-left-color: var(--color-accent-yellow, #f39c12);
}

.toast-warning .toast-icon {
  background: rgba(243, 156, 18, 0.1);
  color: var(--color-accent-yellow, #f39c12);
}

/* Info Toast */
.toast-info {
  border-left-color: var(--color-primary, #ff6b35);
}

.toast-info .toast-icon {
  background: rgba(255, 107, 53, 0.1);
  color: var(--color-primary, #ff6b35);
}

/* Animations */
.toast-enter-active {
  animation: slideInRight 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOutRight 0.3s ease-in;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* Mobile Responsive - Optimized for Pixel 7 Pro (412px width) */
@media (max-width: 640px) {
  .toast-container {
    top: max(var(--spacing-md), env(safe-area-inset-top, 0px));
    right: max(var(--spacing-sm), env(safe-area-inset-right, 0px));
    left: max(var(--spacing-sm), env(safe-area-inset-left, 0px));
    width: auto;
    max-width: calc(100% - max(var(--spacing-sm), env(safe-area-inset-right, 0px)) * 2);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .toast {
    padding: var(--spacing-md) var(--spacing-lg);
    min-height: 56px;
    max-width: 100%;
    box-sizing: border-box;
  }

  .toast-icon {
    font-size: 20px;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .toast-message {
    font-size: clamp(0.875rem, 2.5vw, 1rem);
    line-height: 1.4;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .toast-close {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    flex-shrink: 0;
  }
}

/* Pixel 7 Pro specific optimizations (412px width, 19.5:9 aspect) */
@media (max-width: 450px) and (min-height: 800px) {
  .toast-container {
    top: max(var(--spacing-lg), env(safe-area-inset-top, 0px) + var(--spacing-sm));
    right: max(var(--spacing-md), env(safe-area-inset-right, 0px));
    left: max(var(--spacing-md), env(safe-area-inset-left, 0px));
  }

  .toast {
    padding: var(--spacing-md) var(--spacing-lg);
    min-height: 60px;
    border-radius: var(--radius-md);
  }

  .toast-message {
    font-size: clamp(0.9rem, 2.8vw, 1.05rem);
  }
}
</style>
