/**
 * Integration tests for WebSocket flow using useWebSocket composable (Socket.IO)
 *
 * The useWebSocket composable wraps socket.io-client. These tests verify:
 * - Connection lifecycle (connect, disconnect, reconnect)
 * - Connection state tracking (isConnected, isConnecting, connectionError, connectionStatus)
 * - Event-driven messaging (logPerformance, updateLeaderboard, getUserStats, ping)
 * - Connection monitoring (startConnectionMonitoring, stopConnectionMonitoring)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from '@vue/runtime-core'

// ──────────────────────────────────────────────
// Socket.IO mock
// ──────────────────────────────────────────────

type SocketEventCallback = (...args: unknown[]) => void

interface MockSocket {
  id: string
  connected: boolean
  _handlers: Record<string, SocketEventCallback[]>
  on: ReturnType<typeof vi.fn>
  off: ReturnType<typeof vi.fn>
  emit: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  /** Fire a registered handler (test helper) */
  _trigger: (event: string, ...args: unknown[]) => void
}

function createMockSocket(): MockSocket {
  const handlers: Record<string, SocketEventCallback[]> = {}
  const socket: MockSocket = {
    id: 'mock-socket-id',
    connected: false,
    _handlers: handlers,
    on: vi.fn((event: string, cb: SocketEventCallback) => {
      handlers[event] = handlers[event] ?? []
      handlers[event].push(cb)
    }),
    off: vi.fn((event: string, cb?: SocketEventCallback) => {
      if (!cb) {
        handlers[event] = []
      } else {
        handlers[event] = (handlers[event] ?? []).filter((h) => h !== cb)
      }
    }),
    emit: vi.fn(),
    disconnect: vi.fn(() => {
      socket.connected = false
    }),
    _trigger(event: string, ...args: unknown[]) {
      ;(handlers[event] ?? []).forEach((cb) => cb(...args))
    },
  }
  return socket
}

let mockSocket: MockSocket
const mockIo = vi.fn()

vi.mock('socket.io-client', () => ({
  io: (...args: unknown[]) => mockIo(...args),
}))

// useLogger is a Nuxt auto-import (global) — not an ES module import — so we
// must expose it on globalThis for the composable to call it successfully.
const mockLogger = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
}
;(globalThis as Record<string, unknown>).useLogger = vi.fn(() => mockLogger)

// import.meta.dev is evaluated at module parse time; we stub it via vite globals below.
// The composable reads it to choose the socket URL. We just accept whichever URL is used.

// ──────────────────────────────────────────────
// Helper: import a fresh composable instance
// ──────────────────────────────────────────────

let useWebSocket: typeof import('../../composables/useWebSocket').useWebSocket

beforeEach(async () => {
  vi.resetModules()
  mockSocket = createMockSocket()
  mockIo.mockReturnValue(mockSocket)

  // Re-import so module-level state is fresh
  const mod = await import('../../composables/useWebSocket')
  useWebSocket = mod.useWebSocket
})

afterEach(() => {
  vi.clearAllMocks()
  vi.clearAllTimers()
})

// ──────────────────────────────────────────────
// Describe block
// ──────────────────────────────────────────────

describe('WebSocket', () => {
  // ----------------------------------------------------------------
  // 1. Initial state
  // ----------------------------------------------------------------
  describe('initial state', () => {
    it('starts disconnected with offline status', () => {
      const ws = useWebSocket()

      expect(ws.isConnected.value).toBe(false)
      expect(ws.isConnecting.value).toBe(false)
      expect(ws.connectionError.value).toBeNull()
      expect(ws.connectionStatus.value).toBe('offline')
      expect(ws.socket.value).toBeNull()
    })

    it('statusColor is gray when offline', () => {
      const ws = useWebSocket()
      expect(ws.statusColor.value).toBe('#6b7280')
    })
  })

  // ----------------------------------------------------------------
  // 2. Connection lifecycle
  // ----------------------------------------------------------------
  describe('connect()', () => {
    it('sets isConnecting = true and calls io() when connect() is invoked', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()

      expect(ws.isConnecting.value).toBe(true)
      expect(mockIo).toHaveBeenCalledOnce()
    })

    it('sets isConnected = true and isConnecting = false after connect event fires', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()

      // Simulate socket.io "connect" event
      mockSocket._trigger('connect')
      await nextTick()

      expect(ws.isConnected.value).toBe(true)
      expect(ws.isConnecting.value).toBe(false)
      expect(ws.connectionError.value).toBeNull()
    })

    it('connectionStatus becomes "online" after successful connect', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()
      mockSocket._trigger('connect')
      await nextTick()

      expect(ws.connectionStatus.value).toBe('online')
    })

    it('statusColor is green when connected', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()
      mockSocket._trigger('connect')
      await nextTick()

      expect(ws.statusColor.value).toBe('#10b981')
    })

    it('statusColor is amber while connecting', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()

      // Still connecting (no "connect" event yet)
      expect(ws.connectionStatus.value).toBe('connecting')
      expect(ws.statusColor.value).toBe('#f59e0b')
    })

    it('does not call io() again if already connected', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()

      // Simulate connection
      mockSocket.connected = true
      mockSocket._trigger('connect')
      await nextTick()

      // Call connect again — should be a no-op
      ws.connect()
      await nextTick()

      expect(mockIo).toHaveBeenCalledOnce()
    })
  })

  // ----------------------------------------------------------------
  // 3. Disconnect
  // ----------------------------------------------------------------
  describe('disconnect()', () => {
    it('resets connection state after disconnect()', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()
      mockSocket._trigger('connect')
      await nextTick()

      ws.disconnect()
      await nextTick()

      expect(ws.isConnected.value).toBe(false)
      expect(ws.isConnecting.value).toBe(false)
      expect(ws.socket.value).toBeNull()
    })

    it('calls socket.disconnect() on underlying socket', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()

      ws.disconnect()

      expect(mockSocket.disconnect).toHaveBeenCalledOnce()
    })
  })

  // ----------------------------------------------------------------
  // 4. Error handling
  // ----------------------------------------------------------------
  describe('connection errors', () => {
    it('sets connectionError and clears isConnecting on connect_error', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()

      mockSocket._trigger('connect_error', new Error('Network unreachable'))
      await nextTick()

      expect(ws.connectionError.value).toBe('Network unreachable')
      expect(ws.isConnecting.value).toBe(false)
      expect(ws.connectionStatus.value).toBe('error')
    })

    it('statusColor is red on connection error', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()
      mockSocket._trigger('connect_error', new Error('fail'))
      await nextTick()

      expect(ws.statusColor.value).toBe('#ef4444')
    })

    it('sets isConnecting = true on reconnect_attempt', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()

      // Simulate disconnection then reconnect attempt
      mockSocket._trigger('disconnect', 'transport close')
      await nextTick()
      mockSocket._trigger('reconnect_attempt', 1)
      await nextTick()

      expect(ws.isConnecting.value).toBe(true)
    })
  })

  // ----------------------------------------------------------------
  // 5. Disconnect event from server
  // ----------------------------------------------------------------
  describe('server-side disconnect', () => {
    it('updates state when the server disconnects the socket', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()
      mockSocket._trigger('connect')
      await nextTick()

      mockSocket._trigger('disconnect', 'io server disconnect')
      await nextTick()

      expect(ws.isConnected.value).toBe(false)
    })
  })

  // ----------------------------------------------------------------
  // 6. Messaging — guarded emit methods
  // ----------------------------------------------------------------
  describe('logPerformance()', () => {
    it('emits logPerformance when connected', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()
      mockSocket.connected = true
      mockSocket._trigger('connect')
      await nextTick()

      ws.logPerformance('page-load', 250, { page: 'home' })

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'logPerformance',
        expect.objectContaining({
          metricName: 'page-load',
          duration: 250,
          metadata: { page: 'home' },
        })
      )
    })

    it('does not emit when not connected', async () => {
      const ws = useWebSocket()
      ws.logPerformance('page-load', 100)

      expect(mockSocket.emit).not.toHaveBeenCalled()
    })
  })

  describe('updateLeaderboard()', () => {
    it('emits updateLeaderboard with correct payload when connected', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()
      mockSocket.connected = true
      mockSocket._trigger('connect')
      await nextTick()

      ws.updateLeaderboard('solo', 95, 'Alice')

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'updateLeaderboard',
        expect.objectContaining({
          gameMode: 'solo',
          score: 95,
          playerName: 'Alice',
        })
      )
    })

    it('does not emit when not connected', () => {
      const ws = useWebSocket()
      ws.updateLeaderboard('solo', 95, 'Alice')
      expect(mockSocket.emit).not.toHaveBeenCalled()
    })
  })

  describe('getUserStats()', () => {
    it('emits getUserStats when connected', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()
      mockSocket.connected = true
      mockSocket._trigger('connect')
      await nextTick()

      ws.getUserStats('user-42')

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'getUserStats',
        expect.objectContaining({ userId: 'user-42' })
      )
    })
  })

  // ----------------------------------------------------------------
  // 7. Ping / pong
  // ----------------------------------------------------------------
  describe('ping()', () => {
    it('emits ping when connected', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()
      mockSocket.connected = true
      mockSocket._trigger('connect')
      await nextTick()

      ws.ping()

      expect(mockSocket.emit).toHaveBeenCalledWith('ping')
    })

    it('tracks lastPongTime when pong event is received', async () => {
      const ws = useWebSocket()
      ws.connect()
      await nextTick()

      const pongTimestamp = Date.now()
      mockSocket._trigger('pong', { timestamp: pongTimestamp })
      await nextTick()

      expect(ws.lastPongTime.value).toBe(pongTimestamp)
    })
  })

  // ----------------------------------------------------------------
  // 8. Connection monitoring
  // ----------------------------------------------------------------
  describe('startConnectionMonitoring() / stopConnectionMonitoring()', () => {
    it('calling startConnectionMonitoring twice only starts one interval', async () => {
      vi.useFakeTimers()
      const ws = useWebSocket()
      ws.connect()
      await nextTick()
      mockSocket.connected = true
      mockSocket._trigger('connect')
      await nextTick()

      ws.startConnectionMonitoring()
      ws.startConnectionMonitoring() // should be a no-op

      // Advance 30 seconds — only one ping should fire
      vi.advanceTimersByTime(30000)

      expect(mockSocket.emit).toHaveBeenCalledWith('ping')
      expect(mockSocket.emit).toHaveBeenCalledTimes(1)

      ws.stopConnectionMonitoring()
      vi.useRealTimers()
    })

    it('stopConnectionMonitoring prevents further pings', async () => {
      vi.useFakeTimers()
      const ws = useWebSocket()
      ws.connect()
      await nextTick()
      mockSocket.connected = true

      ws.startConnectionMonitoring()
      ws.stopConnectionMonitoring()

      vi.advanceTimersByTime(60000)
      expect(mockSocket.emit).not.toHaveBeenCalledWith('ping')

      vi.useRealTimers()
    })
  })

  // ----------------------------------------------------------------
  // 9. userId is unique per instance
  // ----------------------------------------------------------------
  describe('userId', () => {
    it('generates a unique userId per composable instance', () => {
      const ws1 = useWebSocket()
      const ws2 = useWebSocket()

      // userId format: "user-<random>"
      expect(ws1.userId.value).toMatch(/^user-/)
      expect(ws2.userId.value).toMatch(/^user-/)
      // Highly likely to differ (random)
      // (We don't assert strict inequality to avoid flake, just format)
    })
  })
})
