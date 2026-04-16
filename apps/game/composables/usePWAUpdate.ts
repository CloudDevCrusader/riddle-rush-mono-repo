import { computed, ref, unref, watchEffect } from 'vue';
import type { Ref } from 'vue';
import { useNuxtApp, useI18n, useToast } from '#imports';

const showUpdateToast = ref(false);
const toastId = ref<string | null>(null);
/** Suppress re-open while `needRefresh` stays true after user dismisses (watchEffect would otherwise immediately re-show). */
const userDismissedThisUpdate = ref(false);

function pwaNeedsRefresh($pwa: ReturnType<typeof useNuxtApp>['$pwa']): boolean {
  if (!$pwa?.needRefresh) return false;
  return Boolean(unref($pwa.needRefresh as boolean | Ref<boolean>));
}

function isPwaClient(): boolean {
  return typeof window !== 'undefined';
}

export function usePWAUpdate() {
  const { $pwa } = useNuxtApp();
  const { t } = useI18n();

  const updateDetected = (options?: { force?: boolean }) => {
    if (!isPwaClient()) return;

    const refreshSignals = options?.force === true || pwaNeedsRefresh($pwa);

    if (refreshSignals && !showUpdateToast.value && !userDismissedThisUpdate.value) {
      const toast = useToast();
      const id = toast.show(t('pwa.update_available'), 'pwa-update', 0);
      toastId.value = id;
      showUpdateToast.value = true;
    }
  };

  const reload = async () => {
    if (!isPwaClient()) return;
    await $pwa?.updateServiceWorker(true);
  };

  const dismiss = async () => {
    userDismissedThisUpdate.value = true;
    showUpdateToast.value = false;
    if (toastId.value) {
      const toast = useToast();
      toast.remove(toastId.value);
      toastId.value = null;
    }
    await $pwa?.cancelPrompt();
  };

  if (isPwaClient()) {
    watchEffect(() => {
      if (!pwaNeedsRefresh($pwa)) {
        userDismissedThisUpdate.value = false;
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
}
