import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useSettingsStore } from '../../stores/settingsStore';

const localStorageMock = globalThis.localStorage as Storage & {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
};

let settingsStore: ReturnType<typeof useSettingsStore>;

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorageMock.clear();
    // Fresh Pinia instance starts with default state - no manual reset needed
    settingsStore = useSettingsStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('has default maxPlayersPerGame of 4', () => {
      const store = settingsStore;
      expect(store.maxPlayersPerGame).toBe(4);
    });

    it('has showLeaderboardAfterRound enabled', () => {
      const store = settingsStore;
      expect(store.showLeaderboardAfterRound).toBe(true);
    });

    it('has leaderboard enabled', () => {
      const store = settingsStore;
      expect(store.leaderboardEnabled).toBe(true);
    });

    it('has debug mode disabled', () => {
      const store = settingsStore;
      expect(store.debugMode).toBe(false);
    });

    it('has sound enabled', () => {
      const store = settingsStore;
      expect(store.soundEnabled).toBe(true);
    });

    it('has offline mode disabled', () => {
      const store = settingsStore;
      expect(store.offlineMode).toBe(false);
    });

    it('has fortune wheel enabled by default', () => {
      const store = settingsStore;
      expect(store.fortuneWheelEnabled).toBe(true);
    });

    it('disables fortune wheel redraw (auto-advance after spin) by default', () => {
      const store = settingsStore;
      expect(store.fortuneWheelAllowRedraw).toBe(false);
    });

    it('has skip rounds enabled by default (verbal Set points flow)', () => {
      const store = settingsStore;
      expect(store.skipRoundsEnabled).toBe(true);
    });
  });

  describe('Getters', () => {
    it('isDebugMode returns debugMode state', () => {
      expect(settingsStore.isDebugMode).toBe(false);
      settingsStore.updateSetting('debugMode', true);
      expect(settingsStore.isDebugMode).toBe(true);
    });

    it('isLeaderboardEnabled returns leaderboardEnabled state', () => {
      expect(settingsStore.isLeaderboardEnabled).toBe(true);
      settingsStore.updateSetting('leaderboardEnabled', false);
      expect(settingsStore.isLeaderboardEnabled).toBe(false);
    });

    it('shouldShowLeaderboard returns true when both flags enabled', () => {
      expect(settingsStore.shouldShowLeaderboard).toBe(true);
    });

    it('shouldShowLeaderboard returns false when leaderboard disabled', () => {
      settingsStore.updateSetting('leaderboardEnabled', false);
      expect(settingsStore.shouldShowLeaderboard).toBe(false);
    });

    it('shouldShowLeaderboard returns false when showAfterRound disabled', () => {
      settingsStore.updateSetting('showLeaderboardAfterRound', false);
      expect(settingsStore.shouldShowLeaderboard).toBe(false);
    });

    it('shouldShowLeaderboard returns false when both disabled', () => {
      settingsStore.updateSetting('leaderboardEnabled', false);
      settingsStore.updateSetting('showLeaderboardAfterRound', false);
      expect(settingsStore.shouldShowLeaderboard).toBe(false);
    });

    it('isFortuneWheelEnabled returns fortuneWheelEnabled state', () => {
      expect(settingsStore.isFortuneWheelEnabled).toBe(true);
      settingsStore.updateSetting('fortuneWheelEnabled', false);
      expect(settingsStore.isFortuneWheelEnabled).toBe(false);
    });

    it('isAnswerInputEnabled returns answerInputEnabled state', () => {
      expect(settingsStore.isAnswerInputEnabled).toBe(false);
      settingsStore.updateSetting('answerInputEnabled', true);
      expect(settingsStore.isAnswerInputEnabled).toBe(true);
    });

    it('isInputFieldEnabled returns inputFieldEnabled state', () => {
      expect(settingsStore.isInputFieldEnabled).toBe(true);
      settingsStore.updateSetting('inputFieldEnabled', false);
      expect(settingsStore.isInputFieldEnabled).toBe(false);
    });

    it('toggleFortuneWheelAllowRedraw flips redraw flag', () => {
      expect(settingsStore.fortuneWheelAllowRedraw).toBe(false);
      settingsStore.toggleFortuneWheelAllowRedraw();
      expect(settingsStore.fortuneWheelAllowRedraw).toBe(true);
      settingsStore.toggleFortuneWheelAllowRedraw();
      expect(settingsStore.fortuneWheelAllowRedraw).toBe(false);
    });
  });

  // Note: Load/Save Settings tests removed - Pinia persist middleware handles this automatically

  describe('Update Setting', () => {
    it('updates specific setting', () => {
      settingsStore.updateSetting('maxPlayersPerGame', 8);
      expect(settingsStore.maxPlayersPerGame).toBe(8);
    });

    it.skip('saves after update (requires persist plugin in test env)', () => {
      settingsStore.updateSetting('debugMode', true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('Toggle Actions', () => {
    it('toggleDebugMode flips state', () => {
      expect(settingsStore.debugMode).toBe(false);
      settingsStore.toggleDebugMode();
      expect(settingsStore.debugMode).toBe(true);
      settingsStore.toggleDebugMode();
      expect(settingsStore.debugMode).toBe(false);
    });

    it('toggleLeaderboard flips state', () => {
      expect(settingsStore.leaderboardEnabled).toBe(true);
      settingsStore.toggleLeaderboard();
      expect(settingsStore.leaderboardEnabled).toBe(false);
    });

    it('toggleSound flips state', () => {
      expect(settingsStore.soundEnabled).toBe(true);
      settingsStore.toggleSound();
      expect(settingsStore.soundEnabled).toBe(false);
    });

    it('setOfflineMode sets specific value', () => {
      settingsStore.setOfflineMode(true);
      expect(settingsStore.offlineMode).toBe(true);
      settingsStore.setOfflineMode(false);
      expect(settingsStore.offlineMode).toBe(false);
    });

    it('toggleFortuneWheel flips state', () => {
      expect(settingsStore.fortuneWheelEnabled).toBe(true);
      settingsStore.toggleFortuneWheel();
      expect(settingsStore.fortuneWheelEnabled).toBe(false);
      settingsStore.toggleFortuneWheel();
      expect(settingsStore.fortuneWheelEnabled).toBe(true);
    });

    it('toggleAnswerInput flips state', () => {
      expect(settingsStore.answerInputEnabled).toBe(false);
      settingsStore.toggleAnswerInput();
      expect(settingsStore.answerInputEnabled).toBe(true);
      settingsStore.toggleAnswerInput();
      expect(settingsStore.answerInputEnabled).toBe(false);
    });

    it('toggleInputField flips state', () => {
      expect(settingsStore.inputFieldEnabled).toBe(true);
      settingsStore.toggleInputField();
      expect(settingsStore.inputFieldEnabled).toBe(false);
      settingsStore.toggleInputField();
      expect(settingsStore.inputFieldEnabled).toBe(true);
    });

    it('toggleDedicatedPlayerRounds flips skipRoundsEnabled', () => {
      expect(settingsStore.skipRoundsEnabled).toBe(true);
      settingsStore.toggleDedicatedPlayerRounds();
      expect(settingsStore.skipRoundsEnabled).toBe(false);
      settingsStore.toggleDedicatedPlayerRounds();
      expect(settingsStore.skipRoundsEnabled).toBe(true);
    });
  });

  describe('Language Actions', () => {
    it('setLanguage updates language', () => {
      expect(settingsStore.language).toBe('de');
      settingsStore.setLanguage('en');
      expect(settingsStore.language).toBe('en');
    });

    it('getLanguage returns current language', () => {
      expect(settingsStore.getLanguage()).toBe('de');
      settingsStore.setLanguage('en');
      expect(settingsStore.getLanguage()).toBe('en');
    });
  });

  describe('State Access', () => {
    it('getState returns full state object', () => {
      const state = settingsStore.getState();
      expect(state).toHaveProperty('maxPlayersPerGame', 4);
      expect(state).toHaveProperty('soundEnabled', true);
      expect(state).toHaveProperty('language', 'de');
      expect(state).toHaveProperty('fortuneWheelEnabled', true);
      expect(state).toHaveProperty('skipRoundsEnabled', true);
    });

    it('getState reflects mutations', () => {
      settingsStore.updateSetting('debugMode', true);
      settingsStore.setLanguage('en');
      const state = settingsStore.getState();
      expect(state.debugMode).toBe(true);
      expect(state.language).toBe('en');
    });
  });

  describe('Reset to Defaults', () => {
    it('resets all settings', () => {
      settingsStore.updateSetting('debugMode', true);
      settingsStore.updateSetting('soundEnabled', false);
      settingsStore.updateSetting('maxPlayersPerGame', 10);

      settingsStore.resetToDefaults();

      expect(settingsStore.debugMode).toBe(false);
      expect(settingsStore.soundEnabled).toBe(true);
      expect(settingsStore.maxPlayersPerGame).toBe(4);
    });

    it.skip('saves after reset (requires persist plugin in test env)', () => {
      settingsStore.updateSetting('debugMode', true);
      vi.clearAllMocks();

      settingsStore.resetToDefaults();

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});
