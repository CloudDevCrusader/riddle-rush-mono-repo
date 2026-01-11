/**
 * WebSocket auto-connect plugin
 * Automatically connects to WebSocket server on app mount (if feature is enabled)
 */

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  const { isWebSocketEnabled } = useFeatureFlags()
  const { connect, startConnectionMonitoring, disconnect, isConnected } = useWebSocket()

  // Auto-connect on client side if feature is enabled
  nuxtApp.hook('app:mounted', () => {
    if (isWebSocketEnabled.value) {
      console.log('🔌 Auto-connecting to WebSocket...')
      connect()
      startConnectionMonitoring()
    } else {
      console.log('🔌 WebSocket feature disabled - skipping auto-connect')
    }
  })

  // Handle page visibility changes
  if (import.meta.client) {
    document.addEventListener('visibilitychange', () => {
      if (!isWebSocketEnabled.value) return

      if (document.hidden) {
        console.log('📱 App hidden - pausing connection monitoring')
      } else {
        console.log('📱 App visible - resuming connection monitoring')
        if (!isConnected.value) {
          connect()
        }
      }
    })

    // Clean up on beforeunload
    window.addEventListener('beforeunload', () => {
      disconnect()
    })
  }
})
