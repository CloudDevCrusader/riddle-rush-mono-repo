import { LatitudeTelemetry } from '@latitude-data/telemetry'
import * as LangchainCallbacks from '@langchain/core/callbacks/manager'
import { createAgent } from 'langchain'

const telemetry = new LatitudeTelemetry(
  process.env.LATITUDE_API_KEY,
  {
    instrumentations: {
      langchain: { callbackManagerModule: LangchainCallbacks }, // This enables automatic tracing for the LangChain SDK
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
      const agent = createAgent({ model: 'claude-sonnet-4-5' });
      const result = await agent.invoke({});
      return result
    }
  )
}