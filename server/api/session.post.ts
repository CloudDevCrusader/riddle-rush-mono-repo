export default defineEventHandler((event) => {
  const query = getQuery(event)
  const userId = (query.userId as string) || 'default-user'

  return {
    sessionId: crypto.randomUUID(),
    userId,
    createdAt: Date.now(),
  }
})
