import { Server } from 'socket.io'
import type { NitroApp } from 'nitropack'

let io: Server | null = null

export default defineNitroPlugin((nitroApp: NitroApp) => {
  if (io) return

  // Initialize Socket.IO server
  io = new Server({
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  })

  // Connection handler
  io.on('connection', (socket) => {
    const userId = (socket.handshake.query.userId as string) || 'anonymous'

    console.log(`✅ User connected: ${userId} (${socket.id})`)

    // Join user to their own room
    socket.join(`user:${userId}`)

    // Send connection confirmation
    socket.emit('connected', {
      socketId: socket.id,
      userId,
      timestamp: Date.now(),
    })

    // Handle performance log
    socket.on('logPerformance', (data) => {
      console.log('📊 Performance logged:', data)

      // Here you can send to CloudWatch or store in database
      // For now, just echo back
      socket.emit('performanceLogged', {
        success: true,
        data,
      })
    })

    // Handle leaderboard update
    socket.on('updateLeaderboard', (data) => {
      console.log('🏆 Leaderboard update:', data)

      // Broadcast to all clients
      io?.emit('leaderboardUpdated', data)

      socket.emit('leaderboardUpdateConfirm', {
        success: true,
        data,
      })
    })

    // Handle user stats request
    socket.on('getUserStats', (data) => {
      console.log('📈 User stats requested:', data)

      // Mock response - replace with actual database query
      socket.emit('userStats', {
        userId: data.userId,
        performanceMetrics: [],
        leaderboardEntries: [],
      })
    })

    // Handle ping for connection monitoring
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() })
    })

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${userId} (${socket.id}) - Reason: ${reason}`)
    })
  })

  // Attach Socket.IO to Nitro app
  nitroApp.hooks.hook('request', (event) => {
    event.context.$io = io
  })

  console.log('🔌 Socket.IO server initialized')
})
