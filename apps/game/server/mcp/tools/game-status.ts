import { z } from 'zod'

export default defineMcpTool({
  description: 'Return basic build info for the Riddle Rush game.',
  inputSchema: {
    verbose: z.boolean().optional(),
  },
  handler: async ({ verbose }) => {
    const version = process.env.npm_package_version || '1.0.0'
    const env = process.env.NODE_ENV || 'development'
    const details = verbose ? `Version: ${version}\nEnvironment: ${env}` : version
    return {
      content: [
        {
          type: 'text',
          text: details,
        },
      ],
    }
  },
})
