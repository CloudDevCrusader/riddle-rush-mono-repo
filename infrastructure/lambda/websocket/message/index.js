const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')
const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch')
const { v4: uuidv4 } = require('uuid')

const dynamoClient = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(dynamoClient)
const cloudwatchClient = new CloudWatchClient({})

const NAMESPACE = process.env.CLOUDWATCH_NAMESPACE || 'RiddleRush'

exports.handler = async (event) => {
  console.log('WebSocket Message Event:', JSON.stringify(event, null, 2))

  const connectionId = event.requestContext.connectionId
  let body

  try {
    body = JSON.parse(event.body)
  } catch (error) {
    console.error('Invalid JSON body:', error)
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { action, data } = body

  try {
    switch (action) {
      case 'logPerformance':
        return await handlePerformanceLog(data, connectionId)
      case 'updateLeaderboard':
        return await handleLeaderboardUpdate(data, connectionId)
      case 'getUserStats':
        return await handleGetUserStats(data)
      default:
        return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) }
    }
  } catch (error) {
    console.error('Error handling message:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    }
  }
}

async function handlePerformanceLog(data, connectionId) {
  const { userId, metricName, duration, timestamp, metadata = {} } = data

  if (!userId || !metricName || duration === undefined) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) }
  }

  const metricId = uuidv4()
  const now = timestamp || Date.now()

  // Store performance metric in DynamoDB
  await docClient.send(
    new PutCommand({
      TableName: process.env.PERFORMANCE_TABLE,
      Item: {
        metricId,
        userId,
        metricName,
        duration,
        timestamp: now,
        connectionId,
        metadata,
        ttl: Math.floor(Date.now() / 1000) + 2592000, // 30 days TTL
      },
    })
  )

  // Send metric to CloudWatch
  await cloudwatchClient.send(
    new PutMetricDataCommand({
      Namespace: NAMESPACE,
      MetricData: [
        {
          MetricName: metricName,
          Value: duration,
          Unit: 'Milliseconds',
          Timestamp: new Date(now),
          Dimensions: [
            { Name: 'UserId', Value: userId },
            { Name: 'Environment', Value: process.env.ENVIRONMENT || 'dev' },
          ],
        },
      ],
    })
  )

  console.log(`Performance logged: ${metricName} = ${duration}ms for user ${userId}`)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Performance metric logged',
      metricId,
    }),
  }
}

async function handleLeaderboardUpdate(data, connectionId) {
  const { userId, gameMode, score, playerName, timestamp } = data

  if (!userId || !gameMode || score === undefined) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) }
  }

  const now = timestamp || Date.now()

  // Store leaderboard entry in DynamoDB
  await docClient.send(
    new PutCommand({
      TableName: process.env.LEADERBOARD_TABLE,
      Item: {
        gameMode,
        score,
        userId,
        playerName: playerName || 'Anonymous',
        timestamp: now,
        connectionId,
        ttl: Math.floor(Date.now() / 1000) + 7776000, // 90 days TTL
      },
    })
  )

  // Send custom metric to CloudWatch
  await cloudwatchClient.send(
    new PutMetricDataCommand({
      Namespace: NAMESPACE,
      MetricData: [
        {
          MetricName: 'GameScore',
          Value: score,
          Unit: 'Count',
          Timestamp: new Date(now),
          Dimensions: [
            { Name: 'GameMode', Value: gameMode },
            { Name: 'Environment', Value: process.env.ENVIRONMENT || 'dev' },
          ],
        },
      ],
    })
  )

  console.log(`Leaderboard updated: ${gameMode} - ${score} points for user ${userId}`)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Leaderboard updated',
      gameMode,
      score,
    }),
  }
}

async function handleGetUserStats(data) {
  const { userId } = data

  if (!userId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing userId' }) }
  }

  try {
    // Get user's performance metrics
    const performanceResult = await docClient.send(
      new QueryCommand({
        TableName: process.env.PERFORMANCE_TABLE,
        IndexName: 'UserMetricsIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        Limit: 100,
        ScanIndexForward: false, // Get latest first
      })
    )

    // Get user's leaderboard entries
    const leaderboardResult = await docClient.send(
      new QueryCommand({
        TableName: process.env.LEADERBOARD_TABLE,
        IndexName: 'UserScoresIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        Limit: 50,
        ScanIndexForward: false,
      })
    )

    return {
      statusCode: 200,
      body: JSON.stringify({
        userId,
        performanceMetrics: performanceResult.Items || [],
        leaderboardEntries: leaderboardResult.Items || [],
      }),
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    throw error
  }
}
