import { computed, ref, unref, watchEffect } from 'vue';
import type { Ref } from 'vue';
import { useNuxtApp, useI18n, useToast } from '#imports';

const DISMISSED_KEY = 'pwa-update-dismissed';
const E2E_PENDING_KEY = 'pwa-e2e-update-pending';

const showUpdateToast = ref(false);
const toastId = ref<string | null>(null);
/** Suppress re-open while `needRefresh` stays true after user dismisses (watchEffect would otherwise immediately re-show).
 *  Persisted to sessionStorage so a full page reload within the same session still respects the dismissal. */
const userDismissedThisUpdate = ref(
  typeof window !== 'undefined' ? sessionStorage.getItem(DISMISSED_KEY) === 'true' : false
);

function pwaNeedsRefresh($pwa: ReturnType<typeof useNuxtApp>['$pwa']): boolean {
  if (!$pwa?.needRefresh) return false;
  return Boolean(unref($pwa.needRefresh as boolean | Ref<boolean>));
}

/** Playwright sets this so a full reload still behaves like “update waiting” without a real SW bump. */
function e2eUpdatePending(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(E2E_PENDING_KEY) === 'true';
}

function isPwaClient(): boolean {
  return typeof window !== 'undefined';
}

export function usePWAUpdate() {
  const { $pwa } = useNuxtApp();
  const { t } = useI18n();

  const updateDetected = (options?: { force?: boolean }) => {
    if (!isPwaClient()) return;

    const refreshSignals = options?.force === true || pwaNeedsRefresh($pwa) || e2eUpdatePending();

    if (options?.force === true) {
      userDismissedThisUpdate.value = false;
      sessionStorage.removeItem(DISMISSED_KEY);
    }

    if (refreshSignals && !showUpdateToast.value && !userDismissedThisUpdate.value) {
      const toast = useToast();
      const id = toast.show(t('pwa.update_available'), 'pwa-update', 0);
      toastId.value = id;
      showUpdateToast.value = true;
    }
  };

  const reload = async () => {
    if (!isPwaClient()) return;
    sessionStorage.removeItem(DISMISSED_KEY);
    await $pwa?.updateServiceWorker(true);
  };

  const dismiss = async () => {
    userDismissedThisUpdate.value = true;
    showUpdateToast.value = false;
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    if (toastId.value) {
      const toast = useToast();
      toast.remove(toastId.value);
      toastId.value = null;
    }
    await $pwa?.cancelPrompt();
  };

  if (isPwaClient()) {
    watchEffect(() => {
      const needsRefresh = pwaNeedsRefresh($pwa) || e2eUpdatePending();

      if (!needsRefresh) {
        userDismissedThisUpdate.value = false;
        sessionStorage.removeItem(DISMISSED_KEY);
        return;
      }
      updateDetected();
    });
  }

  return {
    showUpdateToast: computed(() => showUpdateToast.value),
    updateDetected,
    reload,
    dismiss,
  };
}

// Reset function for testing
export function _resetPWAUpdateState() {
  showUpdateToast.value = false;
  toastId.value = null;
  userDismissedThisUpdate.value = false;
  sessionStorage.removeItem(DISMISSED_KEY);
  sessionStorage.removeItem(E2E_PENDING_KEY);
}
