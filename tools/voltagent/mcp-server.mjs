import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { MCPServer } from '@voltagent/mcp-server'
import { z } from 'zod'

const execFileAsync = promisify(execFile)
const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '../..')

const COMMANDS = {
  'git:status': { command: 'git', args: ['status', '-sb'] },
  'workspace:check': { command: 'pnpm', args: ['run', 'workspace:check'] },
  typecheck: { command: 'pnpm', args: ['run', 'typecheck'] },
  lint: { command: 'pnpm', args: ['run', 'lint'] },
  'test:unit': { command: 'pnpm', args: ['run', 'test:unit'] },
}

const runRepoCommand = {
  id: 'run-repo-command',
  name: 'run-repo-command',
  description: 'Run a vetted repository command for checks and status.',
  parameters: z.object({
    task: z.enum(Object.keys(COMMANDS)),
  }),
  async execute({ task }) {
    const entry = COMMANDS[task]
    const { stdout, stderr } = await execFileAsync(entry.command, entry.args, {
      cwd: repoRoot,
      env: process.env,
    })
    const output = [stdout, stderr].filter(Boolean).join('\n').trim()
    return {
      task,
      output: output.slice(0, 12000),
    }
  },
}

const mcpServer = new MCPServer({
  name: 'riddle-rush-subagents',
  version: '1.0.0',
  description: 'VoltAgent MCP subagents for Riddle Rush automation.',
  protocols: {
    stdio: true,
    http: false,
    sse: false,
  },
  tools: {
    runRepoCommand,
  },
})

await mcpServer.startConfiguredTransports()
await new Promise(() => {})
