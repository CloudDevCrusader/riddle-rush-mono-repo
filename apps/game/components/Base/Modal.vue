<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click.self="handleOverlayClick"
      >
        <div
          class="modal-container"
          :class="modalClasses"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? 'modal-title' : undefined"
        >
          <!-- Close Button -->
          <button
            v-if="showClose"
            class="modal-close"
            type="button"
            aria-label="Close"
            @click="close"
          >
            ✕
          </button>

          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="modal-header"
          >
            <slot name="header">
              <h2
                id="modal-title"
                class="modal-title"
              >
                {{ title }}
              </h2>
            </slot>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="modal-footer"
          >
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showClose?: boolean
  closeOnOverlay?: boolean
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  size: 'md',
  showClose: true,
  closeOnOverlay: true,
  persistent: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

const modalClasses = computed(() => [`modal-container--${props.size}`])

const close = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue && !props.persistent) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

// Lock body scroll when modal is open
watch(
  () => props.modelValue,
  (isOpen: boolean) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    else {
      document.body.style.overflow = ''
    }
  },
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal-container {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  border: 4px solid var(--color-primary);
  box-shadow: var(--shadow-2xl);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
}

/* Sizes */
.modal-container--sm {
  max-width: 400px;
}

.modal-container--md {
  max-width: 600px;
}

.modal-container--lg {
  max-width: 800px;
}

.modal-container--xl {
  max-width: 1200px;
}

.modal-close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: var(--color-light);
  border: 2px solid var(--color-gray);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  color: var(--color-dark);
  transition: all var(--transition-base);
  z-index: 1;
}

.modal-close:hover {
  background: var(--color-danger);
  color: var(--color-white);
  border-color: var(--color-danger-dark);
  transform: scale(1.1);
}

.modal-header {
  padding: var(--spacing-xl);
  border-bottom: 2px solid var(--color-light);
}

.modal-title {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-dark);
  margin: 0;
}

.modal-body {
  padding: var(--spacing-xl);
}

.modal-footer {
  padding: var(--spacing-xl);
  border-top: 2px solid var(--color-light);
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}

@media (max-width: 640px) {
  .modal-container {
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--spacing-md);
  }
}
</style>
