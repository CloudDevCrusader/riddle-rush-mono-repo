<template>
  <div class="feedback-widget">
    <button
      class="feedback-trigger tap-highlight"
      :class="{ 'feedback-trigger--open': isOpen }"
      :aria-label="$t('feedback.button')"
      @click="toggleOpen"
    >
      <span class="feedback-icon">{{ isOpen ? '✕' : '💬' }}</span>
    </button>

    <Transition name="feedback-panel">
      <div
        v-if="isOpen"
        class="feedback-panel"
      >
        <h3 class="feedback-title">
          {{ $t('feedback.title') }}
        </h3>

        <div
          v-if="!submitted"
          class="feedback-form"
        >
          <div class="feedback-rating">
            <button
              v-for="emoji in ratings"
              :key="emoji.value"
              class="rating-btn tap-highlight"
              :class="{ active: selectedRating === emoji.value }"
              @click="selectedRating = emoji.value"
            >
              {{ emoji.icon }}
            </button>
          </div>

          <textarea
            v-model="message"
            class="feedback-textarea"
            :placeholder="$t('feedback.placeholder')"
            rows="3"
          />

          <button
            class="btn btn-primary feedback-submit"
            :disabled="!selectedRating"
            @click="submitFeedback"
          >
            {{ $t('feedback.submit') }}
          </button>
        </div>

        <div
          v-else
          class="feedback-success"
        >
          <span class="success-icon">🎉</span>
          <p>{{ $t('feedback.thanks') }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false)
const selectedRating = ref<number | null>(null)
const message = ref('')
const submitted = ref(false)

const ratings = [
  { value: 1, icon: '😞' },
  { value: 2, icon: '😐' },
  { value: 3, icon: '🙂' },
  { value: 4, icon: '😊' },
  { value: 5, icon: '🤩' },
]

const toggleOpen = () => {
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    resetForm()
  }
}

const resetForm = () => {
  selectedRating.value = null
  message.value = ''
  submitted.value = false
}

const submitFeedback = () => {
  if (!selectedRating.value) return

  // Store feedback locally (could be sent to server)
  const feedback = {
    rating: selectedRating.value,
    message: message.value,
    timestamp: Date.now(),
    url: window.location.href,
  }

  // Save to localStorage for now
  const existing = JSON.parse(localStorage.getItem('app-feedback') || '[]')
  existing.push(feedback)
  localStorage.setItem('app-feedback', JSON.stringify(existing))

  submitted.value = true

  setTimeout(() => {
    isOpen.value = false
    resetForm()
  }, 2000)
}
</script>

<style scoped>
.feedback-widget {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: var(--z-fixed);
}

.feedback-trigger {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary-gradient);
  color: var(--color-white);
  font-size: 24px;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-trigger:hover {
  transform: scale(1.1);
}

.feedback-trigger--open {
  background: var(--color-gray);
}

.feedback-icon {
  transition: transform var(--transition-base);
}

.feedback-panel {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 300px;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-xl);
}

.feedback-title {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
  color: var(--color-dark);
}

.feedback-rating {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.rating-btn {
  width: 44px;
  height: 44px;
  border: 2px solid var(--color-light);
  border-radius: var(--radius-md);
  background: var(--color-white);
  font-size: 24px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.rating-btn:hover,
.rating-btn.active {
  border-color: var(--color-primary);
  background: rgba(255, 107, 53, 0.1);
  transform: scale(1.1);
}

.feedback-textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--color-light);
  border-radius: var(--radius-md);
  font-family: var(--font-primary);
  font-size: var(--font-size-sm);
  resize: none;
  margin-bottom: var(--spacing-md);
  transition: border-color var(--transition-fast);
}

.feedback-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.feedback-submit {
  width: 100%;
  min-height: 44px;
}

.feedback-success {
  text-align: center;
  padding: var(--spacing-lg);
}

.success-icon {
  font-size: 48px;
  display: block;
  margin-bottom: var(--spacing-sm);
}

.feedback-panel-enter-active,
.feedback-panel-leave-active {
  transition: all var(--transition-base);
}

.feedback-panel-enter-from,
.feedback-panel-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

@media (max-width: 640px) {
  .feedback-widget {
    bottom: var(--spacing-md);
    right: var(--spacing-md);
  }

  .feedback-panel {
    width: calc(100vw - var(--spacing-xl) * 2);
    right: calc(-1 * var(--spacing-md));
  }
}
</style>
