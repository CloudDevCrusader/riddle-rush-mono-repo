<template>
  <Teleport to="body">
    <Transition
      name="game-modal"
      @after-enter="activateFocusTrap"
      @after-leave="deactivateFocusTrap"
    >
      <div
        v-if="modelValue"
        ref="overlayRef"
        class="game-modal-overlay"
        @click.self="handleBackdropClick"
      >
        <div
          ref="modalRef"
          class="game-modal"
          :class="modalClasses"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? 'game-modal-title' : undefined"
        >
          <!-- Optional Header -->
          <div
            v-if="title"
            class="game-modal-header"
          >
            <h2
              id="game-modal-title"
              class="game-modal-title"
            >
              {{ title }}
            </h2>
          </div>

          <!-- Body -->
          <div class="game-modal-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { createFocusTrap, type FocusTrap } from 'focus-trap'

interface Props {
  modelValue: boolean
  variant?: 'default' | 'danger'
  title?: string
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  title: undefined,
  closeOnBackdrop: true,
  closeOnEscape: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
<<<<<<< Updated upstream
<<<<<<< Updated upstream
}>()
=======
=======
>>>>>>> Stashed changes
}>();
>>>>>>> Stashed changes

const modalRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)
let focusTrap: FocusTrap | null = null

const modalClasses = computed(() => [`game-modal--${props.variant}`])

const close = () => {
  emit('update:modelValue', false)
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

// Handle Escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue && props.closeOnEscape) {
    close()
  }
}

// Focus trap activation
const activateFocusTrap = () => {
  if (modalRef.value) {
    focusTrap = createFocusTrap(modalRef.value as HTMLElement, {
      escapeDeactivates: false, // We handle Escape manually
      clickOutsideDeactivates: false, // We handle backdrop clicks manually
      allowOutsideClick: true,
      initialFocus: false, // Let content determine initial focus
      fallbackFocus: modalRef.value as HTMLElement,
    })
    focusTrap.activate()
  }
}

// Focus trap deactivation
const deactivateFocusTrap = () => {
  if (focusTrap) {
    focusTrap.deactivate()
    focusTrap = null
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  deactivateFocusTrap()
})

// Lock body scroll when modal is open
watch(
  () => props.modelValue,
  (isOpen: boolean) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  }
)
=======
=======
>>>>>>> Stashed changes
  },
);
>>>>>>> Stashed changes
</script>

<style scoped lang="scss">
@use 'assets/scss/effects/glossy' as *;

.game-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.game-modal {
  background: var(--gradient-panel);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  max-width: 600px;
  border: 4px solid;

  // Focus visible for keyboard navigation
  &:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.8);
    outline-offset: 4px;
  }
}

// Variant-specific border colors
.game-modal--default {
  border-color: var(--color-btn-blue-light);
}

.game-modal--danger {
  border-color: var(--color-btn-red-light);
}

.game-modal-header {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  position: relative;
  overflow: hidden;

  // Glossy effect for header
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    pointer-events: none;
  }
}

// Variant-specific header backgrounds
.game-modal--default .game-modal-header {
  background: linear-gradient(
    180deg,
    var(--color-btn-blue-light) 0%,
    var(--color-btn-blue-dark) 100%
  );
}

.game-modal--danger .game-modal-header {
  background: linear-gradient(
    180deg,
    var(--color-btn-red-light) 0%,
    var(--color-btn-red-dark) 100%
  );
}

.game-modal-title {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: white;
  margin: 0;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.game-modal-body {
  padding: var(--spacing-xl);
}

// Transitions (250ms fade + scale)
.game-modal-enter-active,
.game-modal-leave-active {
  transition: opacity 250ms ease;
}

.game-modal-enter-active .game-modal,
.game-modal-leave-active .game-modal {
  transition: transform 250ms ease;
}

.game-modal-enter-from,
.game-modal-leave-to {
  opacity: 0;
}

.game-modal-enter-from .game-modal,
.game-modal-leave-to .game-modal {
  transform: scale(0.9);
}

// Responsive adjustments
@media (max-width: 768px) {
  .game-modal-overlay {
    padding: var(--spacing-md);
  }

  .game-modal {
    max-width: 100%;
    max-height: 95vh;
  }

  .game-modal-header,
  .game-modal-body {
    padding: var(--spacing-lg);
  }

  .game-modal-title {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 480px) {
  .game-modal-overlay {
    padding: var(--spacing-sm);
  }

  .game-modal {
    border-radius: var(--radius-xl);
    border-width: 3px;
  }

  .game-modal-header {
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }

  .game-modal-header,
  .game-modal-body {
    padding: var(--spacing-md);
  }

  .game-modal-title {
    font-size: clamp(var(--font-size-lg), 4vw, var(--font-size-xl));
  }
}

@media (max-width: 360px) {
  .game-modal-overlay {
    padding: var(--spacing-xs);
  }

  .game-modal {
    border-radius: var(--radius-lg);
    border-width: 2px;
    max-height: 92vh;
  }

  .game-modal-header {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .game-modal-body {
    padding: var(--spacing-sm);
  }

  .game-modal-title {
    font-size: var(--font-size-lg);
  }
}
</style>
