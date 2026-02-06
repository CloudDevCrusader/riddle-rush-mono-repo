import { VoltAgent, Agent, Memory } from '@voltagent/core'
import { LibSQLMemoryAdapter } from '@voltagent/libsql'
import { createPinoLogger } from '@voltagent/logger'
import { honoServer } from '@voltagent/server-hono'
import { openai } from '@ai-sdk/openai'
import { expenseApprovalWorkflow } from './workflows'
import { weatherTool } from './tools'

// Create a logger instance
const logger = createPinoLogger({
  name: 'Riddle Rushs ',
  level: 'info',
})

// Optional persistent memory (remove to use default in-memory)
const memory = new Memory({
  storage: new LibSQLMemoryAdapter({ url: 'file:./.voltagent/memory.db' }),
})

// A simple, general-purpose agent for the project.
const agent = new Agent({
  name: 'my-agent',
  instructions: 'A helpful assistant that can check weather and help with various tasks',
  model: openai('gpt-4o-mini'),
  tools: [weatherTool],
  memory,
})

// Initialize VoltAgent with your agent(s) and workflow(s)
new VoltAgent({
  agents: {
    agent,
  },
  workflows: {
    expenseApprovalWorkflow,
  },
  server: honoServer(),
  logger,
})
