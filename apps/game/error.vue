<script setup lang="ts">
import type { NuxtError } from '#app';
import { clearError } from '#app';

const props = defineProps<{
  error: NuxtError;
}>();

const { t } = useI18n();

const isDev = import.meta.dev;

const statusCode = computed(() => props.error.statusCode ?? props.error.status ?? 500);

const headline = computed(
  () => props.error.statusMessage || (props.error as { message?: string }).message || ''
);

function serializeError(err: NuxtError): string {
  try {
    return JSON.stringify(
      err,
      (_key, value) => {
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
            ...(value.cause !== undefined ? { cause: value.cause } : {}),
          };
        }
        return value;
      },
      2
    );
  } catch {
    return String(err);
  }
}

const devPayload = computed(() => serializeError(props.error));

const goHome = async () => {
  await clearError({ redirect: '/' });
};

const retry = () => clearError();
</script>

<template>
  <div class="error-page">
    <div class="error-card">
      <p v-if="isDev" class="error-dev-badge">Development</p>
      <h1 class="error-code">{{ statusCode }}</h1>
      <p class="error-msg">
        {{ headline || t('errors.unexpected', 'Something went wrong.') }}
      </p>
      <div class="error-actions">
        <button type="button" class="error-btn error-btn--primary" @click="goHome">
          {{ t('errors.back_home', 'Back to home') }}
        </button>
        <button v-if="!error.fatal" type="button" class="error-btn error-btn--ghost" @click="retry">
          {{ t('errors.try_again', 'Try again') }}
        </button>
      </div>
      <details v-if="isDev" class="error-dev-details">
        <summary>{{ t('errors.dev_details', 'Technical details (dev only)') }}</summary>
        <pre class="error-pre" tabindex="0">{{ devPayload }}</pre>
        <p class="error-hint">
          {{ t('errors.dev_console_hint', 'Full stack traces are also in the browser console.') }}
        </p>
      </details>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100dvh;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(165deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #f5f5f5;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    sans-serif;
}

.error-card {
  width: 100%;
  max-width: 40rem;
  padding: 1.75rem 1.5rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.error-dev-badge {
  display: inline-block;
  margin: 0 0 0.75rem;
  padding: 0.2rem 0.55rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #1a1a2e;
  background: #ffc107;
  border-radius: 0.25rem;
}

.error-code {
  margin: 0;
  font-size: clamp(2.5rem, 8vw, 3.5rem);
  font-weight: 800;
  line-height: 1;
  color: #ff6b6b;
}

.error-msg {
  margin: 1rem 0 1.25rem;
  font-size: 1.05rem;
  line-height: 1.45;
  opacity: 0.95;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.error-btn {
  cursor: pointer;
  padding: 0.65rem 1.15rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: 2px solid transparent;
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
}

.error-btn:active {
  transform: scale(0.98);
}

.error-btn--primary {
  color: #1a1a2e;
  background: #4ade80;
  border-color: #22c55e;
}

.error-btn--primary:hover {
  filter: brightness(1.06);
}

.error-btn--ghost {
  color: #f5f5f5;
  background: transparent;
  border-color: rgba(255, 255, 255, 0.35);
}

.error-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.08);
}

.error-dev-details {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.error-dev-details summary {
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 0.75rem;
  user-select: none;
}

.error-pre {
  margin: 0;
  padding: 1rem;
  max-height: 45vh;
  overflow: auto;
  font-size: 0.72rem;
  line-height: 1.4;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
  color: #e2e8f0;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.error-hint {
  margin: 0.75rem 0 0;
  font-size: 0.8rem;
  opacity: 0.75;
}
</style>
