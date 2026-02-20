# Mistral Vibe MCP Configuration for Riddle Rush

This configuration file contains all MCP servers from the Riddle Rush monorepo, formatted for Mistral Vibe compatibility.

## Integration Instructions

1. **Copy to Vibe config directory:**

   ```bash
   cp vibe-mcp-config.json ~/.config/mistral/vibe/mcp-config.json
   ```

2. **Or reference directly in Vibe settings:**

   ```json
   {
     "mcp": {
       "configPath": "/path/to/riddle-rush-mono-repo/vibe-mcp-config.json"
     }
   }
   ```

3. **Restart Vibe agent** to load new configurations.

## Server Categories

- **Frontend Framework**: Nuxt.js, UI components
- **Testing Automation**: Playwright, BrowserMCP
- **Version Control**: Git, GitLab operations
- **Cloud Infrastructure**: AWS, Docker management
- **File Operations**: Filesystem access
- **General Utilities**: Various tools and helpers

## Server List

- **primary-playwright-test**: MCP server from primary: playwright-test
- **primary-one-mcp**: MCP server from primary: one-mcp
- **fastmcp-riddle-rush-subagents**: VoltAgent MCP subagents for repository automation
- **fastmcp-nuxt-ui**: Nuxt UI component documentation and examples
- **fastmcp-nuxt**: Nuxt framework documentation and guides
- **fastmcp-playwright**: Browser automation for E2E testing and debugging
- **fastmcp-aws-docs**: AWS documentation search and reference (S3, CloudFront, etc.)
- **fastmcp-docker**: Docker Hub search and container management for CI/CD
- **fastmcp-context7**: Library documentation (Vue, Nuxt, Vite, TypeScript, etc.)
- **fastmcp-browsermcp**: Browser automation and inspection via BrowserMCP
- **fastmcp-nuxt-mcp-toolkit**: Nuxt MCP Toolkit documentation and tooling context
- **fastmcp-git**: Git operations and repository management
- **fastmcp-gitlab**: GitLab API for CI/CD pipeline management and MRs
- **fastmcp-filesystem**: Safe filesystem operations within project directory
- **cursor-riddle-rush-subagents**: VoltAgent MCP subagents for repository automation
- **cursor-nuxt-ui**: Nuxt UI component documentation and examples
- **cursor-nuxt**: Nuxt framework documentation and guides
- **cursor-playwright**: Browser automation for E2E testing and debugging
- **cursor-aws-docs**: AWS documentation search and reference (S3, CloudFront, etc.)
- **cursor-mcp-server-aws-docs**: OpenAI API for AI-powered responses
- **cursor-docker**: Docker Hub search and container management for CI/CD
- **cursor-context7**: Library documentation (Vue, Nuxt, Vite, TypeScript, etc.)
- **cursor-browsermcp**: Browser automation and inspection via BrowserMCP
- **cursor-nuxt-mcp-toolkit**: Nuxt MCP Toolkit documentation and tooling context
- **cursor-git**: Git operations and repository management
- **cursor-gitlab**: GitLab API for CI/CD pipeline management and MRs
- **cursor-filesystem**: Safe filesystem operations within project directory

## Compatibility

- Mistral Vibe v2.0+
- Devstral-2 and Devstral-3 models
- Supports concurrent requests and streaming

## Notes

- All servers are prefixed with their source (primary/fastmcp/cursor)
- Priority is set based on source (primary=100, others=50)
- Environment variables are preserved from original configs
