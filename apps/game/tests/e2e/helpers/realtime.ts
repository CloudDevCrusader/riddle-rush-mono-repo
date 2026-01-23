import type { Page } from '@playwright/test'

export interface GameMessage {
  type: string
  player?: string
  answer?: string
  score?: number
  timestamp: number
  [key: string]: unknown
}

interface CapturedMessage extends GameMessage {
  direction: 'sent' | 'received'
  rawData: string
}

interface WebSocketFrame {
  opcode: number
  mask: boolean
  payloadData: string
}

interface WebSocketFramePayload {
  requestId: string
  timestamp: number
  response: WebSocketFrame
}

const DEFAULT_TIMEOUT = 30000
const SYNC_CHECK_INTERVAL = 100

/**
 * Parse WebSocket payload data into a GameMessage
 */
function parseWebSocketPayload(payloadData: string): GameMessage | null {
  try {
    const parsed = JSON.parse(payloadData)
    return {
      ...parsed,
      timestamp: parsed.timestamp ?? Date.now(),
    }
  } catch {
    // Not JSON data, might be binary or plain text
    return null
  }
}

/**
 * Wait for a specific game message type to arrive via WebSocket
 */
export async function waitForGameMessage(
  page: Page,
  messageType: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<GameMessage | null> {
  const cdpSession = await page.context().newCDPSession(page)

  try {
    await cdpSession.send('Network.enable')

    return await new Promise<GameMessage | null>((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn(`[waitForGameMessage] Timeout waiting for message type: ${messageType}`)
        resolve(null)
      }, timeout)

      const handler = (params: WebSocketFramePayload) => {
        const message = parseWebSocketPayload(params.response.payloadData)
        if (message && message.type === messageType) {
          clearTimeout(timeoutId)
          cdpSession.off('Network.webSocketFrameReceived', handler)
          console.log(`[waitForGameMessage] Received message type: ${messageType}`, message)
          resolve(message)
        }
      }

      cdpSession.on('Network.webSocketFrameReceived', handler)
    })
  } finally {
    await cdpSession.detach().catch(() => {})
  }
}

/**
 * Verify that messages arrived in the expected order based on their types
 */
export async function verifyMessageOrder(
  messages: GameMessage[],
  expectedOrder: string[]
): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = []

  if (messages.length === 0 && expectedOrder.length > 0) {
    return {
      valid: false,
      issues: ['No messages received but expected order was specified'],
    }
  }

  // Extract message types in order
  const actualTypes = messages.map((m) => m.type)

  // Filter actual types to only include expected types (ignore extras)
  const relevantTypes = actualTypes.filter((t) => expectedOrder.includes(t))

  // Check if timestamps are monotonically increasing
  let lastTimestamp = 0
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (msg && msg.timestamp < lastTimestamp) {
      issues.push(
        `Message at index ${i} (type: ${msg.type}) has timestamp ${msg.timestamp} ` +
          `which is earlier than previous message timestamp ${lastTimestamp}`
      )
    }
    if (msg) {
      lastTimestamp = msg.timestamp
    }
  }

  // Check order matches expected
  let expectedIndex = 0
  for (const type of relevantTypes) {
    if (expectedIndex >= expectedOrder.length) {
      break
    }
    if (type === expectedOrder[expectedIndex]) {
      expectedIndex++
    } else {
      // Check if this type appears later in expected order (out of order)
      const laterIndex = expectedOrder.indexOf(type, expectedIndex)
      if (laterIndex !== -1) {
        issues.push(
          `Message type "${type}" arrived before expected. ` +
            `Expected "${expectedOrder[expectedIndex]}" first.`
        )
      }
    }
  }

  // Check if all expected types were found
  if (expectedIndex < expectedOrder.length) {
    const missing = expectedOrder.slice(expectedIndex)
    issues.push(`Missing expected message types: ${missing.join(', ')}`)
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Capture WebSocket traffic during a test
 */
export async function captureWebSocketTraffic(page: Page): Promise<{
  start: () => void
  stop: () => CapturedMessage[]
  getMessages: () => CapturedMessage[]
}> {
  const cdpSession = await page.context().newCDPSession(page)
  const messages: CapturedMessage[] = []
  let isCapturing = false

  const receivedHandler = (params: WebSocketFramePayload) => {
    if (!isCapturing) return
    const message = parseWebSocketPayload(params.response.payloadData)
    if (message) {
      const captured: CapturedMessage = {
        ...message,
        direction: 'received',
        rawData: params.response.payloadData,
      }
      messages.push(captured)
      console.log('[captureWebSocketTraffic] Received:', captured.type)
    }
  }

  const sentHandler = (params: WebSocketFramePayload) => {
    if (!isCapturing) return
    const message = parseWebSocketPayload(params.response.payloadData)
    if (message) {
      const captured: CapturedMessage = {
        ...message,
        direction: 'sent',
        rawData: params.response.payloadData,
      }
      messages.push(captured)
      console.log('[captureWebSocketTraffic] Sent:', captured.type)
    }
  }

  await cdpSession.send('Network.enable')
  cdpSession.on('Network.webSocketFrameReceived', receivedHandler)
  cdpSession.on('Network.webSocketFrameSent', sentHandler)

  return {
    start: () => {
      isCapturing = true
      console.log('[captureWebSocketTraffic] Started capturing')
    },
    stop: () => {
      isCapturing = false
      console.log(`[captureWebSocketTraffic] Stopped. Captured ${messages.length} messages`)
      cdpSession.off('Network.webSocketFrameReceived', receivedHandler)
      cdpSession.off('Network.webSocketFrameSent', sentHandler)
      cdpSession.detach().catch(() => {})
      return [...messages]
    },
    getMessages: () => [...messages],
  }
}

/**
 * Simulate network jitter by adding variable latency to WebSocket messages
 */
export async function simulateNetworkJitter(
  page: Page,
  options: {
    minLatency?: number
    maxLatency?: number
    packetLoss?: number
  } = {}
): Promise<void> {
  const { minLatency = 50, maxLatency = 200, packetLoss = 0 } = options

  const cdpSession = await page.context().newCDPSession(page)

  // Enable network emulation
  await cdpSession.send('Network.enable')

  // Calculate average latency and jitter for network emulation
  const averageLatency = (minLatency + maxLatency) / 2

  // Emulate network conditions
  await cdpSession.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: averageLatency,
    downloadThroughput: -1, // No limit
    uploadThroughput: -1, // No limit
  })

  console.log(
    `[simulateNetworkJitter] Enabled with latency: ${minLatency}-${maxLatency}ms, packet loss: ${packetLoss}%`
  )

  // For more precise jitter simulation, inject script to delay WebSocket messages
  await page.evaluate(
    ({ minLat, maxLat, pLoss }) => {
      const originalSend = WebSocket.prototype.send

      WebSocket.prototype.send = function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView
      ) {
        const delay = Math.random() * (maxLat - minLat) + minLat
        const shouldDrop = Math.random() * 100 < pLoss

        if (shouldDrop) {
          console.log('[Jitter] Packet dropped')
          return
        }

        setTimeout(() => {
          originalSend.call(this, data)
        }, delay)
      }

      // Store original for potential cleanup
      const win = window as Window & { __originalWsSend?: typeof originalSend }
      win.__originalWsSend = originalSend
    },
    { minLat: minLatency, maxLat: maxLatency, pLoss: packetLoss }
  )
}

/**
 * Wait for multiple players/pages to reach a synchronized state
 */
export async function waitForMultiplayerSync(
  pages: Page[],
  timeout: number = DEFAULT_TIMEOUT
): Promise<{
  synced: boolean
  states: { page: number; state: unknown }[]
}> {
  const startTime = Date.now()
  const states: { page: number; state: unknown }[] = []

  while (Date.now() - startTime < timeout) {
    states.length = 0

    // Collect current game state from all pages
    const statePromises = pages.map(async (page, index) => {
      try {
        const state = await page.evaluate(() => {
          // Try to get game state from common locations
          const win = window as Window & {
            __GAME_STATE__?: unknown
            gameState?: unknown
            store?: { getState?: () => unknown }
          }
          return win.__GAME_STATE__ || win.gameState || win.store?.getState?.() || null
        })
        return { page: index, state }
      } catch {
        return { page: index, state: null }
      }
    })

    const collectedStates = await Promise.all(statePromises)
    states.push(...collectedStates)

    // Check if all states are non-null and equivalent
    const validStates = states.filter((s) => s.state !== null)

    if (validStates.length === pages.length && validStates.length > 0) {
      const firstValidState = validStates[0]
      const firstState = firstValidState ? JSON.stringify(firstValidState.state) : null
      const allSynced = validStates.every((s) => JSON.stringify(s.state) === firstState)

      if (allSynced) {
        console.log('[waitForMultiplayerSync] All players synced')
        return { synced: true, states }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, SYNC_CHECK_INTERVAL))
  }

  console.warn('[waitForMultiplayerSync] Timeout - players not synced')
  return { synced: false, states }
}

/**
 * Verify game state consistency across multiple players/pages
 */
export async function verifyGameStateConsistency(pages: Page[]): Promise<{
  consistent: boolean
  differences: { field: string; values: unknown[] }[]
}> {
  const differences: { field: string; values: unknown[] }[] = []

  // Collect game states from all pages
  const states = await Promise.all(
    pages.map(async (page) => {
      try {
        return await page.evaluate(() => {
          const win = window as Window & {
            __GAME_STATE__?: Record<string, unknown>
            gameState?: Record<string, unknown>
            store?: { getState?: () => Record<string, unknown> }
          }
          return win.__GAME_STATE__ || win.gameState || win.store?.getState?.() || {}
        })
      } catch {
        return {}
      }
    })
  )

  if (states.length < 2) {
    return { consistent: true, differences: [] }
  }

  // Collect all unique keys across all states
  const allKeys = new Set<string>()
  for (const state of states) {
    if (state && typeof state === 'object') {
      Object.keys(state).forEach((key) => allKeys.add(key))
    }
  }

  // Compare each field across all states
  Array.from(allKeys).forEach((key) => {
    const values = states.map((state) =>
      state && typeof state === 'object' ? (state as Record<string, unknown>)[key] : undefined
    )
    const serializedValues = values.map((v) => JSON.stringify(v))
    const uniqueValues = new Set(serializedValues)

    if (uniqueValues.size > 1) {
      differences.push({ field: key, values })
    }
  })

  const consistent = differences.length === 0

  if (!consistent) {
    console.warn('[verifyGameStateConsistency] Found differences:', differences)
  } else {
    console.log('[verifyGameStateConsistency] All states consistent')
  }

  return { consistent, differences }
}

/**
 * Monitor game events stream and invoke callback for each event
 * Returns a cleanup function to stop monitoring
 */
export async function monitorGameEvents(
  page: Page,
  callback: (event: GameMessage) => void
): Promise<() => void> {
  const cdpSession = await page.context().newCDPSession(page)
  let isMonitoring = true

  await cdpSession.send('Network.enable')

  const handler = (params: WebSocketFramePayload) => {
    if (!isMonitoring) return
    const message = parseWebSocketPayload(params.response.payloadData)
    if (message) {
      console.log('[monitorGameEvents] Event:', message.type)
      callback(message)
    }
  }

  cdpSession.on('Network.webSocketFrameReceived', handler)

  console.log('[monitorGameEvents] Started monitoring')

  // Return cleanup function
  return () => {
    isMonitoring = false
    cdpSession.off('Network.webSocketFrameReceived', handler)
    cdpSession.detach().catch(() => {})
    console.log('[monitorGameEvents] Stopped monitoring')
  }
}

/**
 * Wait for a game event that matches a predicate function
 */
export async function waitForGameEvent(
  page: Page,
  predicate: (event: GameMessage) => boolean,
  timeout: number = DEFAULT_TIMEOUT
): Promise<GameMessage | null> {
  const cdpSession = await page.context().newCDPSession(page)

  try {
    await cdpSession.send('Network.enable')

    return await new Promise<GameMessage | null>((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn('[waitForGameEvent] Timeout waiting for matching event')
        resolve(null)
      }, timeout)

      const handler = (params: WebSocketFramePayload) => {
        const message = parseWebSocketPayload(params.response.payloadData)
        if (message) {
          try {
            if (predicate(message)) {
              clearTimeout(timeoutId)
              cdpSession.off('Network.webSocketFrameReceived', handler)
              console.log('[waitForGameEvent] Found matching event:', message.type)
              resolve(message)
            }
          } catch (err) {
            console.error('[waitForGameEvent] Predicate error:', err)
          }
        }
      }

      cdpSession.on('Network.webSocketFrameReceived', handler)
    })
  } finally {
    await cdpSession.detach().catch(() => {})
  }
}

/**
 * Wait for WebSocket connection to be established
 */
export async function waitForWebSocketConnection(
  page: Page,
  urlPattern?: string | RegExp,
  timeout: number = DEFAULT_TIMEOUT
): Promise<boolean> {
  const cdpSession = await page.context().newCDPSession(page)

  try {
    await cdpSession.send('Network.enable')

    return await new Promise<boolean>((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn('[waitForWebSocketConnection] Timeout waiting for connection')
        resolve(false)
      }, timeout)

      const handler = (params: { requestId: string; url: string }) => {
        const matches =
          !urlPattern ||
          (typeof urlPattern === 'string'
            ? params.url.includes(urlPattern)
            : urlPattern.test(params.url))

        if (matches) {
          clearTimeout(timeoutId)
          cdpSession.off('Network.webSocketCreated', handler)
          console.log('[waitForWebSocketConnection] Connected:', params.url)
          resolve(true)
        }
      }

      cdpSession.on('Network.webSocketCreated', handler)
    })
  } finally {
    await cdpSession.detach().catch(() => {})
  }
}

/**
 * Wait for WebSocket reconnection after disconnect
 */
export async function waitForReconnection(
  page: Page,
  timeout: number = DEFAULT_TIMEOUT
): Promise<boolean> {
  const cdpSession = await page.context().newCDPSession(page)
  let disconnected = false

  try {
    await cdpSession.send('Network.enable')

    return await new Promise<boolean>((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn('[waitForReconnection] Timeout waiting for reconnection')
        resolve(false)
      }, timeout)

      const closedHandler = () => {
        disconnected = true
        console.log('[waitForReconnection] WebSocket disconnected')
      }

      const createdHandler = () => {
        if (disconnected) {
          clearTimeout(timeoutId)
          cdpSession.off('Network.webSocketClosed', closedHandler)
          cdpSession.off('Network.webSocketCreated', createdHandler)
          console.log('[waitForReconnection] Reconnected successfully')
          resolve(true)
        }
      }

      cdpSession.on('Network.webSocketClosed', closedHandler)
      cdpSession.on('Network.webSocketCreated', createdHandler)
    })
  } finally {
    await cdpSession.detach().catch(() => {})
  }
}

/**
 * Send a game message through WebSocket (for testing)
 */
export async function sendGameMessage(page: Page, message: Partial<GameMessage>): Promise<void> {
  const fullMessage: GameMessage = {
    type: 'unknown',
    timestamp: Date.now(),
    ...message,
  }

  await page.evaluate((msg) => {
    const win = window as Window & { __gameSocket?: WebSocket }
    const socket = win.__gameSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(msg))
      console.log('[sendGameMessage] Sent:', msg.type)
    } else {
      console.error('[sendGameMessage] WebSocket not available or not open')
    }
  }, fullMessage)
}

/**
 * Disconnect WebSocket connection (for testing reconnection)
 */
export async function disconnectWebSocket(page: Page): Promise<void> {
  await page.evaluate(() => {
    const win = window as Window & { __gameSocket?: WebSocket }
    const socket = win.__gameSocket
    if (socket) {
      socket.close()
      console.log('[disconnectWebSocket] Connection closed')
    }
  })
}

/**
 * Get WebSocket connection state
 */
export async function getWebSocketState(page: Page): Promise<{
  connected: boolean
  readyState: number
  url: string | null
}> {
  return await page.evaluate(() => {
    const win = window as Window & { __gameSocket?: WebSocket }
    const socket = win.__gameSocket
    if (socket) {
      return {
        connected: socket.readyState === WebSocket.OPEN,
        readyState: socket.readyState,
        url: socket.url,
      }
    }
    return {
      connected: false,
      readyState: -1,
      url: null,
    }
  })
}
