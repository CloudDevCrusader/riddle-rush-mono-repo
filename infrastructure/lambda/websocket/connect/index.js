const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

exports.handler = async (event) => {
  console.log('WebSocket Connect Event:', JSON.stringify(event, null, 2))

  const connectionId = event.requestContext.connectionId
  const timestamp = Date.now()

  // Extract user info from query parameters
  const queryParams = event.queryStringParameters || {}
  const userId = queryParams.userId || 'anonymous'

  try {
    // Store connection in DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Item: {
          connectionId,
          userId,
          connectedAt: timestamp,
          ttl: Math.floor(Date.now() / 1000) + 7200, // 2 hours TTL
        },
      })
    )

    console.log(`Connection stored: ${connectionId} for user: ${userId}`)

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Connected successfully', connectionId }),
    }
  } catch (error) {
    console.error('Error storing connection:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to connect', error: error.message }),
    }
  }
}
