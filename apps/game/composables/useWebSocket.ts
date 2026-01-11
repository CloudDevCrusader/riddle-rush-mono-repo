/**
 * WebSocket connection composable using Socket.IO
 * Provides real-time connection with online/offline status
 */

import { io, type Socket } from 'socket.io-client'
import { ref, computed, onUnmounted } from 'vue'

export const useWebSocket = () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref<string | null>(null)
  const lastPongTime = ref<number>(0)

  const userId = ref<string>('user-' + Math.random().toString(36).substring(7))

  // Connection status indicator
  const connectionStatus = computed(() => {
    if (isConnected.value) return 'online'
    if (isConnecting.value) return 'connecting'
    if (connectionError.value) return 'error'
    return 'offline'
  })

  // Status color for UI
  const statusColor = computed(() => {
    switch (connectionStatus.value) {
      case 'online':
        return '#10b981' // green
      case 'connecting':
        return '#f59e0b' // amber
      case 'error':
        return '#ef4444' // red
      default:
        return '#6b7280' // gray
    }
  })

  // Connect to WebSocket server
  const connect = () => {
    if (socket.value?.connected) {
      console.log('Already connected')
      return
    }

    isConnecting.value = true
    connectionError.value = null

    try {
      const socketUrl = import.meta.dev ? 'http://localhost:3000' : window.location.origin

      socket.value = io(socketUrl, {
        query: { userId: userId.value },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      })

      // Connection events
      socket.value.on('connect', () => {
        console.log('✅ WebSocket connected:', socket.value?.id)
        isConnected.value = true
        isConnecting.value = false
        connectionError.value = null
      })

      socket.value.on('connected', (data) => {
        console.log('📡 Connection confirmed:', data)
      })

      socket.value.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason)
        isConnected.value = false
        isConnecting.value = false
      })

      socket.value.on('connect_error', (error) => {
        console.error('🔴 Connection error:', error)
        isConnecting.value = false
        connectionError.value = error.message
      })

      socket.value.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`)
      })

      socket.value.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Reconnecting... (attempt ${attemptNumber})`)
        isConnecting.value = true
      })

      socket.value.on('reconnect_error', (error) => {
        console.error('🔴 Reconnection error:', error)
      })

      socket.value.on('reconnect_failed', () => {
        console.error('🔴 Reconnection failed')
        connectionError.value = 'Failed to reconnect'
        isConnecting.value = false
      })

      // Pong handler for connection monitoring
      socket.value.on('pong', (data) => {
        lastPongTime.value = data.timestamp
      })

      // Performance logged confirmation
      socket.value.on('performanceLogged', (data) => {
        console.log('📊 Performance logged:', data)
      })

      // Leaderboard update confirmation
      socket.value.on('leaderboardUpdateConfirm', (data) => {
        console.log('🏆 Leaderboard updated:', data)
      })

      // Leaderboard updates from other users
      socket.value.on('leaderboardUpdated', (data) => {
        console.log('🏆 Leaderboard change:', data)
      })

      // User stats response
      socket.value.on('userStats', (data) => {
        console.log('📈 User stats:', data)
      })
    } catch (error) {
      console.error('Failed to initialize socket:', error)
      isConnecting.value = false
      connectionError.value = error instanceof Error ? error.message : 'Connection failed'
    }
  }

  // Disconnect from WebSocket server
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
      isConnecting.value = false
    }
  }

  // Log performance metric
  const logPerformance = (
    metricName: string,
    duration: number,
    metadata: Record<string, unknown> = {}
  ) => {
    if (!socket.value?.connected) {
      console.warn('Cannot log performance: not connected')
      return
    }

    socket.value.emit('logPerformance', {
      userId: userId.value,
      metricName,
      duration,
      timestamp: Date.now(),
      metadata,
    })
  }

  // Update leaderboard
  const updateLeaderboard = (gameMode: string, score: number, playerName: string) => {
    if (!socket.value?.connected) {
      console.warn('Cannot update leaderboard: not connected')
      return
    }

    socket.value.emit('updateLeaderboard', {
      userId: userId.value,
      gameMode,
      score,
      playerName,
      timestamp: Date.now(),
    })
  }

  // Get user stats
  const getUserStats = (targetUserId?: string) => {
    if (!socket.value?.connected) {
      console.warn('Cannot get user stats: not connected')
      return
    }

    socket.value.emit('getUserStats', {
      userId: targetUserId || userId.value,
    })
  }

  // Ping server to check connection
  const ping = () => {
    if (socket.value?.connected) {
      socket.value.emit('ping')
    }
  }

  // Start connection monitoring (ping every 30 seconds)
  let pingInterval: NodeJS.Timeout | null = null
  const startConnectionMonitoring = () => {
    if (pingInterval) return

    pingInterval = setInterval(() => {
      ping()
    }, 30000)
  }

  const stopConnectionMonitoring = () => {
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
  }

  // Clean up on unmount
  onUnmounted(() => {
    stopConnectionMonitoring()
    disconnect()
  })

  return {
    // State
    socket,
    isConnected,
    isConnecting,
    connectionError,
    connectionStatus,
    statusColor,
    userId,
    lastPongTime,

    // Methods
    connect,
    disconnect,
    logPerformance,
    updateLeaderboard,
    getUserStats,
    ping,
    startConnectionMonitoring,
    stopConnectionMonitoring,
  }
}
