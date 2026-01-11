/**
 * WebSocket auto-connect plugin
 * Automatically connects to WebSocket server on app mount
 */

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  const { connect, startConnectionMonitoring, disconnect } = useWebSocket()

  // Auto-connect on client side
  nuxtApp.hook('app:mounted', () => {
    console.log('🔌 Auto-connecting to WebSocket...')
    connect()
    startConnectionMonitoring()
  })

  // Handle page visibility changes
  if (process.client) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('📱 App hidden - pausing connection monitoring')
      } else {
        console.log('📱 App visible - resuming connection monitoring')
        const { isConnected, connect: reconnect } = useWebSocket()
        if (!isConnected.value) {
          reconnect()
        }
      }
    })

    // Clean up on beforeunload
    window.addEventListener('beforeunload', () => {
      disconnect()
    })
  }
})
