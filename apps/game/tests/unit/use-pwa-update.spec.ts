import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { mockPWA, mockToast } from './setup';
import { _resetPWAUpdateState } from '../../composables/usePWAUpdate';

describe('usePWAUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(globalThis, 'import', {
      value: { meta: { client: true } },
      configurable: true,
    });

    _resetPWAUpdateState();
    mockPWA.needRefresh.value = false;
    mockPWA.updateServiceWorker.mockClear();
    mockPWA.cancelPrompt.mockClear();
    mockToast.show.mockReturnValue('toast-1');
    mockToast.show.mockClear();
    mockToast.remove.mockClear();
  });

  describe('updateDetected', () => {
    it('should show toast when needRefresh is true and not already showing', async () => {
      mockPWA.needRefresh.value = true;

      const { usePWAUpdate } = await import('../../composables/usePWAUpdate');
      const pwaUpdate = usePWAUpdate();
      pwaUpdate.updateDetected();

      expect(mockToast.show).toHaveBeenCalledWith('pwa.update_available', 'pwa-update', 0);
      expect(pwaUpdate.showUpdateToast.value).toBe(true);
    });

    it('should not show toast if already showing', async () => {
      mockPWA.needRefresh.value = true;

      const { usePWAUpdate } = await import('../../composables/usePWAUpdate');
      const pwaUpdate = usePWAUpdate();
      pwaUpdate.updateDetected();
      mockToast.show.mockClear();

      pwaUpdate.updateDetected();

      expect(mockToast.show).not.toHaveBeenCalled();
    });

    it('should not show toast when needRefresh is false', async () => {
      mockPWA.needRefresh.value = false;

      const { usePWAUpdate } = await import('../../composables/usePWAUpdate');
      const pwaUpdate = usePWAUpdate();
      pwaUpdate.updateDetected();

      expect(mockToast.show).not.toHaveBeenCalled();
      expect(pwaUpdate.showUpdateToast.value).toBe(false);
    });
  });

  describe('reload', () => {
    it('should call $pwa.updateServiceWorker with reloadPage true', async () => {
      const { usePWAUpdate } = await import('../../composables/usePWAUpdate');
      const pwaUpdate = usePWAUpdate();

      await pwaUpdate.reload();

      expect(mockPWA.updateServiceWorker).toHaveBeenCalledWith(true);
    });
  });

  describe('dismiss', () => {
    it('should clear showUpdateToast flag', async () => {
      mockPWA.needRefresh.value = true;

      const { usePWAUpdate } = await import('../../composables/usePWAUpdate');
      const pwaUpdate = usePWAUpdate();
      pwaUpdate.updateDetected();
      expect(pwaUpdate.showUpdateToast.value).toBe(true);

      await pwaUpdate.dismiss();

      expect(pwaUpdate.showUpdateToast.value).toBe(false);
      expect(mockToast.remove).toHaveBeenCalledWith('toast-1');
    });

    it('should call $pwa.cancelPrompt', async () => {
      const { usePWAUpdate } = await import('../../composables/usePWAUpdate');
      const pwaUpdate = usePWAUpdate();

      await pwaUpdate.dismiss();

      expect(mockPWA.cancelPrompt).toHaveBeenCalled();
    });
  });

  describe('reactive detection', () => {
    it('should trigger updateDetected when needRefresh becomes true', async () => {
      mockPWA.needRefresh.value = false;

      const { usePWAUpdate } = await import('../../composables/usePWAUpdate');
      const pwaUpdate = usePWAUpdate();
      expect(pwaUpdate.showUpdateToast.value).toBe(false);

      mockPWA.needRefresh.value = true;
      await nextTick();
      await Promise.resolve();

      expect(mockToast.show).toHaveBeenCalled();
    });
  });

  describe('deduplication', () => {
    it('should only show one toast even with multiple composable calls', async () => {
      mockPWA.needRefresh.value = true;

      const { usePWAUpdate } = await import('../../composables/usePWAUpdate');
      const pwaUpdate1 = usePWAUpdate();
      const pwaUpdate2 = usePWAUpdate();

      pwaUpdate1.updateDetected();
      mockToast.show.mockClear();
      pwaUpdate2.updateDetected();

      expect(mockToast.show).not.toHaveBeenCalled();
    });
  });
});
