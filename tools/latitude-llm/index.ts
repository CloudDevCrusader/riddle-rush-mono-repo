import { LatitudeTelemetry } from '@latitude-data/telemetry'
import * as Anthropic from '@anthropic-ai/sdk'
import Anthropic from '@anthropic-ai/sdk'

const telemetry = new LatitudeTelemetry(
  process.env.LATITUDE_API_KEY,
  {
    instrumentations: {
      anthropic: Anthropic, // This enables automatic tracing for the Anthropic SDK
    },
  }
)

async function generateSupportReply(input: string) {
  return telemetry.capture(
    {
      projectId: process.env.LATITUDE_PROJECT_ID,
      path: 'generate-support-reply', // Add a path to identify this prompt in Latitude
    },
    async () => {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({});
      return response
    }
  )
}
