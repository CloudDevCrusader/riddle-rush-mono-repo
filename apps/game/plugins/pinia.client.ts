import { useGameStore } from '~/stores/gameStore';
import { useSettingsStore } from '~/stores/settingsStore';
import { useLoadingStore } from '~/stores/loadingStore';

type PiniaStoresWindow = Window & {
  __pinia_stores__?: {
    game: ReturnType<typeof useGameStore>;
    settings: ReturnType<typeof useSettingsStore>;
    loading: ReturnType<typeof useLoadingStore>;
  };
};

export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    const game = useGameStore();
    const settings = useSettingsStore();
    const loading = useLoadingStore();

    // pinia-plugin-unstorage hydrates in a microtask; defer migration until after it patches.
    await Promise.resolve();
    settings.migrateSettings();

    // Expose stores for E2E testing
    (window as PiniaStoresWindow).__pinia_stores__ = { game, settings, loading };
  }
});
