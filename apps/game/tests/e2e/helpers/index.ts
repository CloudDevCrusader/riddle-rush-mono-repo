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
} from './waits'

// Asset and image loading verification
export {
  verifyImagesLoaded,
  waitForImageLoaded,
  verifyFontLoaded,
  getLoadingMetrics,
  waitForCriticalAssets,
  retryFailedImages,
  getAssetDiagnostics,
} from './assets'

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
} from './mobile'

// WebSocket and realtime testing
export {
  waitForGameMessage,
  verifyMessageOrder,
  captureWebSocketTraffic,
  simulateNetworkJitter,
  waitForMultiplayerSync,
  verifyGameStateConsistency,
  monitorGameEvents,
  waitForReconnection,
  sendGameMessage,
  disconnectWebSocket,
  getWebSocketState,
} from './realtime'

// Diagnostics and debugging
export {
  captureGameState,
  captureNetworkTimeline,
  captureBrowserMetrics,
  captureConsoleLogs,
  generateDebugReport,
  logToArtifacts,
  diffGameStates,
} from './diagnostics'

// Test data generation (existing)
export { generatePlayerName, generateAnswer } from './faker'

// Types
export type { GameMessage } from './realtime'
export type { GameStateSnapshot, NetworkEntry, BrowserMetrics } from './diagnostics'
