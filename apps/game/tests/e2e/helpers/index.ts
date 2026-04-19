/**
 * E2E Test Helpers Index
 *
 * Centralized exports for all e2e test utilities
 */

// Wait strategies for game state and async operations
export {
  waitForGameState,
  waitForRoundTransition,
  waitForAnimationComplete,
  waitForNetworkIdle,
  waitForAssetLoad,
  waitForPageReady,
  waitForRoundComplete,
  waitForResultsRendered,
  getRoundState,
  waitForWebSocketConnection,
  waitForGameEvent,
  withRetry,
} from './waits';

// Asset and image loading verification
export {
  verifyImagesLoaded,
  waitForImageLoaded,
  verifyFontLoaded,
  getLoadingMetrics,
  waitForCriticalAssets,
  retryFailedImages,
  getAssetDiagnostics,
} from './assets';

// Mobile device testing utilities
export {
  isMobileDevice,
  waitForMobileTouchReady,
  simulateMobileNetwork,
  verifyResponsiveLayout,
  verifyTouchTargets,
  verifyNoMouseOnlyInteractions,
  getDeviceInfo,
  simulateTouchGesture,
} from './mobile';

// Diagnostics and debugging
export {
  captureGameState,
  captureNetworkTimeline,
  captureBrowserMetrics,
  captureConsoleLogs,
  generateDebugReport,
  logToArtifacts,
  diffGameStates,
} from './diagnostics';

// Test data generation (existing)
export { generatePlayerName, generateAnswer } from './faker';

// Game flow helpers (shared across E2E specs)
export {
  hideDevtools,
  applyE2EGameSettings,
  submitPlayerAnswers,
  navigateToResults,
  assignScores,
  confirmScoresAndFinishToLeaderboard,
  confirmScoresAndPlayNextRound,
  confirmScoresAndWaitForModal,
  goToNextRound,
  finishGame,
  setupMultiplayerGame,
  startGameWithDefaults,
  startGameAndGoToResults,
} from './game-flow';

// Types
export type { GameStateSnapshot, NetworkEntry, BrowserMetrics } from './diagnostics';
export type { E2EGameSettingsPatch, MultiplayerGameOptions } from './game-flow';
