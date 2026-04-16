import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useLoadingStore } from '../../stores/loadingStore';
import { useLoading } from '../../stores/hooks/useLoading';

let loadingStore: ReturnType<typeof useLoadingStore>;

describe('loadingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Fresh Pinia instance starts with default state - no manual reset needed
    loadingStore = useLoadingStore();
  });

  describe('initial state', () => {
    it('should start with loading disabled', () => {
      const store = loadingStore;
      expect(store.isLoading).toBe(false);
    });

    it('should start with zero loading count', () => {
      const store = loadingStore;
      expect(store.loadingCount).toBe(0);
    });

    it('should start with zero progress', () => {
      const store = loadingStore;
      expect(store.progress).toBe(0);
    });

    it('should start with progress hidden', () => {
      const store = loadingStore;
      expect(store.showProgress).toBe(false);
    });
  });

  describe('showLoading', () => {
    it('should enable loading', () => {
      loadingStore.showLoading();
      expect(loadingStore.isLoading).toBe(true);
    });

    it('should increment loading count', () => {
      loadingStore.showLoading();
      expect(loadingStore.loadingCount).toBe(1);
      loadingStore.showLoading();
      expect(loadingStore.loadingCount).toBe(2);
    });

    it('should reset progress', () => {
      loadingStore.setProgress(50);
      loadingStore.showLoading();
      expect(loadingStore.progress).toBe(0);
    });

    it('should hide progress indicator', () => {
      loadingStore.setProgress(50);
      loadingStore.showLoading();
      expect(loadingStore.showProgress).toBe(false);
    });
  });

  describe('hideLoading', () => {
    it('should decrement loading count', () => {
      loadingStore.showLoading();
      loadingStore.showLoading();
      expect(loadingStore.loadingCount).toBe(2);

      loadingStore.hideLoading();
      expect(loadingStore.loadingCount).toBe(1);
    });

    it('should disable loading when count reaches zero', () => {
      loadingStore.showLoading();
      loadingStore.hideLoading();
      expect(loadingStore.isLoading).toBe(false);
    });

    it('should not go below zero', () => {
      loadingStore.hideLoading();
      expect(loadingStore.loadingCount).toBe(0);
    });

    it('should keep loading enabled for nested calls', () => {
      loadingStore.showLoading();
      loadingStore.showLoading();
      loadingStore.hideLoading();
      expect(loadingStore.isLoading).toBe(true);
      expect(loadingStore.loadingCount).toBe(1);
    });

    it('should reset progress when fully hidden', () => {
      loadingStore.showLoading();
      loadingStore.setProgress(75);
      loadingStore.hideLoading();
      expect(loadingStore.progress).toBe(0);
    });

    it('should hide progress indicator when fully hidden', () => {
      loadingStore.showLoading();
      loadingStore.setProgress(75);
      loadingStore.hideLoading();
      expect(loadingStore.showProgress).toBe(false);
    });
  });

  describe('setProgress', () => {
    it('should set progress value', () => {
      loadingStore.setProgress(50);
      expect(loadingStore.progress).toBe(50);
    });

    it('should show progress indicator', () => {
      loadingStore.setProgress(50);
      expect(loadingStore.showProgress).toBe(true);
    });

    it('should clamp progress to 0-100 range', () => {
      loadingStore.setProgress(-10);
      expect(loadingStore.progress).toBe(0);

      loadingStore.setProgress(150);
      expect(loadingStore.progress).toBe(100);
    });

    it('should accept boundary values', () => {
      loadingStore.setProgress(0);
      expect(loadingStore.progress).toBe(0);

      loadingStore.setProgress(100);
      expect(loadingStore.progress).toBe(100);
    });

    it('should accept fractional values', () => {
      loadingStore.setProgress(33.33);
      expect(loadingStore.progress).toBe(33.33);
    });
  });

  describe('nested loading calls', () => {
    it('should handle multiple show/hide correctly', () => {
      loadingStore.showLoading(); // count: 1
      expect(loadingStore.isLoading).toBe(true);

      loadingStore.showLoading(); // count: 2
      expect(loadingStore.isLoading).toBe(true);

      loadingStore.showLoading(); // count: 3
      expect(loadingStore.isLoading).toBe(true);

      loadingStore.hideLoading(); // count: 2
      expect(loadingStore.isLoading).toBe(true);

      loadingStore.hideLoading(); // count: 1
      expect(loadingStore.isLoading).toBe(true);

      loadingStore.hideLoading(); // count: 0
      expect(loadingStore.isLoading).toBe(false);
    });
  });

  describe('forceHide', () => {
    it('should reset all state regardless of loading count', () => {
      loadingStore.showLoading();
      loadingStore.showLoading();
      loadingStore.showLoading();
      loadingStore.setProgress(75);
      expect(loadingStore.loadingCount).toBe(3);

      loadingStore.forceHide();
      expect(loadingStore.isLoading).toBe(false);
      expect(loadingStore.loadingCount).toBe(0);
      expect(loadingStore.progress).toBe(0);
      expect(loadingStore.showProgress).toBe(false);
    });

    it('should work when nothing is loading', () => {
      loadingStore.forceHide();
      expect(loadingStore.isLoading).toBe(false);
      expect(loadingStore.loadingCount).toBe(0);
    });
  });

  describe('getState', () => {
    it('should return full state object', () => {
      const state = loadingStore.getState();
      expect(state).toHaveProperty('isLoading', false);
      expect(state).toHaveProperty('loadingCount', 0);
      expect(state).toHaveProperty('progress', 0);
      expect(state).toHaveProperty('showProgress', false);
    });

    it('should reflect current mutations', () => {
      loadingStore.showLoading();
      loadingStore.setProgress(60);
      const state = loadingStore.getState();
      expect(state.isLoading).toBe(true);
      expect(state.loadingCount).toBe(1);
      expect(state.progress).toBe(60);
      expect(state.showProgress).toBe(true);
    });
  });

  describe('safety timer', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should force-hide after 10s timeout', () => {
      loadingStore.showLoading();
      expect(loadingStore.isLoading).toBe(true);

      vi.advanceTimersByTime(10_000);

      expect(loadingStore.isLoading).toBe(false);
      expect(loadingStore.loadingCount).toBe(0);
    });

    it('should not force-hide before timeout', () => {
      loadingStore.showLoading();
      vi.advanceTimersByTime(9_999);
      expect(loadingStore.isLoading).toBe(true);
    });

    it('should clear timer on hide', () => {
      loadingStore.showLoading();
      loadingStore.hideLoading();
      vi.advanceTimersByTime(10_000);
      // No error — timer was cleared
      expect(loadingStore.isLoading).toBe(false);
    });

    it('should reset timer on subsequent showLoading', () => {
      loadingStore.showLoading();
      vi.advanceTimersByTime(8_000);
      // Still loading, show again (resets timer)
      loadingStore.showLoading();
      vi.advanceTimersByTime(8_000);
      // 8s after second show — still within 10s window
      expect(loadingStore.isLoading).toBe(true);

      vi.advanceTimersByTime(2_000);
      // 10s after second show — force hide triggers
      expect(loadingStore.isLoading).toBe(false);
    });
  });
});

describe('useLoading', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // useLoading() internally calls useLoadingStore() and useGameStore() - both need active Pinia
    loadingStore = useLoadingStore();
  });

  describe('composable wrapper', () => {
    it('should expose computed isLoading', () => {
      const { isLoading, showLoading } = useLoading();
      expect(isLoading.value).toBe(false);

      showLoading();
      expect(isLoading.value).toBe(true);
    });

    it('should expose computed progress', () => {
      const { progress, setProgress } = useLoading();
      expect(progress.value).toBe(0);

      setProgress(60);
      expect(progress.value).toBe(60);
    });

    it('should expose computed showProgress', () => {
      const { showProgress, setProgress } = useLoading();
      expect(showProgress.value).toBe(false);

      setProgress(30);
      expect(showProgress.value).toBe(true);
    });

    it('should expose showLoading method', () => {
      const { isLoading, showLoading } = useLoading();
      showLoading();
      expect(isLoading.value).toBe(true);
    });

    it('should expose hideLoading method', () => {
      const { isLoading, showLoading, hideLoading } = useLoading();
      showLoading();
      hideLoading();
      expect(isLoading.value).toBe(false);
    });

    it('should expose setProgress method', () => {
      const { progress, setProgress } = useLoading();
      setProgress(45);
      expect(progress.value).toBe(45);
    });

    it('should share state across multiple instances', () => {
      const loading1 = useLoading();
      const loading2 = useLoading();

      loading1.showLoading();
      expect(loading2.isLoading.value).toBe(true);

      loading1.setProgress(80);
      expect(loading2.progress.value).toBe(80);
    });
  });
});
