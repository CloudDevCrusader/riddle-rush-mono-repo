// Lambda function for processing error logs and sending to CloudWatch
const AWS = require('aws-sdk')

const { CloudWatchLogs } = AWS

const cloudwatch = new CloudWatchLogs({ region: process.env.AWS_REGION })
const logGroupName = process.env.LOG_GROUP_NAME || '/aws/lambda/error-logs'

const ERROR_TYPES = {
  error: 'ERROR',
  warning: 'WARNING',
  info: 'INFO',
}

exports.handler = async (event) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2))

    // Parse the incoming request
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body

    if (!body || !body.logs || !Array.isArray(body.logs)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request format. Expected logs array.' }),
      }
    }

    const { app, environment, version, logs } = body

    // Process each log entry
    const logEvents = logs.map((log) => ({
      timestamp: new Date(log.timestamp || Date.now()).getTime(),
      message: formatLogMessage(log, app, environment, version),
    }))

    // Create log stream name based on current date
    const logStreamName = `error-logs-${new Date().toISOString().split('T')[0]}`

    // Create log stream if it doesn't exist
    try {
      await cloudwatch.createLogStream({
        logGroupName,
        logStreamName,
      }).promise()
    } catch (error) {
      // Ignore if log stream already exists
      if (error.code !== 'ResourceAlreadyExistsException') {
        throw error
      }
    }

    // Send logs to CloudWatch
    await cloudwatch.putLogEvents({
      logGroupName,
      logStreamName,
      logEvents,
    }).promise()

    // Also send metrics to CloudWatch
    await sendMetrics(logs, app, environment)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        processedLogs: logs.length,
        message: 'Error logs processed successfully',
      }),
    }
  } catch (error) {
    console.error('Error processing logs:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process error logs',
        details: error.message,
      }),
    }
  }
}

function formatLogMessage(log, app, environment, version) {
  const errorType = ERROR_TYPES[log.level] || log.level.toUpperCase()
  const context = log.context ? JSON.stringify(log.context) : '{}'
  const error = log.error ? `\nError: ${log.error}` : ''

  return `[${errorType}] [${app}] [${environment}] [${version}] ${log.message} - Context: ${context}${error}`
}

async function sendMetrics(logs, app, environment) {
  const cloudwatchMetrics = new AWS.CloudWatch({ region: process.env.AWS_REGION })

  // Count metrics by type
  const metrics = {
    error: 0,
    warning: 0,
    info: 0,
  }

  logs.forEach((log) => {
    if (log.level in metrics) {
      metrics[log.level]++
    }
  })

  // Send metrics
  const params = {
    Namespace: `${app}/ErrorLogs`,
    MetricData: [
      {
        MetricName: 'TotalErrors',
        Dimensions: [
          { Name: 'Environment', Value: environment },
          { Name: 'App', Value: app },
        ],
        Value: metrics.error,
        Unit: 'Count',
      },
      {
        MetricName: 'TotalWarnings',
        Dimensions: [
          { Name: 'Environment', Value: environment },
          { Name: 'App', Value: app },
        ],
        Value: metrics.warning,
        Unit: 'Count',
      },
      {
        MetricName: 'TotalInfo',
        Dimensions: [
          { Name: 'Environment', Value: environment },
          { Name: 'App', Value: app },
        ],
        Value: metrics.info,
        Unit: 'Count',
      },
      {
        MetricName: 'TotalLogs',
        Dimensions: [
          { Name: 'Environment', Value: environment },
          { Name: 'App', Value: app },
        ],
        Value: logs.length,
        Unit: 'Count',
      },
    ],
  }

  await cloudwatchMetrics.putMetricData(params).promise()
}
