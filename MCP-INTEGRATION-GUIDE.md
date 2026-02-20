# MCP Configuration Integration Guide

This guide explains how to integrate the Riddle Rush MCP configurations with OpenCode and Mistral Vibe platforms.

## Overview

The Riddle Rush monorepo contains multiple MCP (Model Context Protocol) configurations that have been exported to work with different AI agent platforms:

- **`.mcp.json`** - Primary MCP configuration (2 servers)
- **`fastmcp.json`** - Extended FastMCP configuration (12 servers)
- **`.cursor/mcp.json`** - Cursor-specific configuration (13 servers)

## Exported Configurations

### 1. OpenCode Configuration

**File:** `opencode-mcp-config.json`
**Format:** OpenCode v1.0
**Total Servers:** 27 (merged from all sources)

#### Categories:

- **Testing (5 servers):** Playwright, BrowserMCP
- **Frontend (6 servers):** Nuxt, Nuxt UI, Nuxt MCP Toolkit
- **Cloud (5 servers):** AWS Docs, Docker
- **DevOps (4 servers):** Git, GitLab
- **General (7 servers):** Filesystem, Context7, One-MCP

#### Integration Steps:

```bash
# Copy to OpenCode configuration directory
cp opencode-mcp-config.json ~/.config/opencode/mcp-config.json

# Or reference in OpenCode settings
{
  "mcp": {
    "configPath": "/path/to/riddle-rush-mono-repo/opencode-mcp-config.json"
  }
}
```

### 2. Mistral Vibe Configuration

**File:** `vibe-mcp-config.json`
**Format:** Mistral Vibe v2.0
**Total Servers:** 27 (merged from all sources)

#### Categories:

- **Testing Automation (5 servers):** Playwright, BrowserMCP
- **Frontend Framework (6 servers):** Nuxt, Nuxt UI, Nuxt MCP Toolkit
- **Cloud Infrastructure (5 servers):** AWS Docs, Docker
- **Version Control (4 servers):** Git, GitLab
- **File Operations (2 servers):** Filesystem
- **General Utilities (5 servers):** Context7, One-MCP

#### Integration Steps:

```bash
# Copy to Vibe configuration directory
cp vibe-mcp-config.json ~/.config/mistral/vibe/mcp-config.json

# Or reference in Vibe settings
{
  "mcp": {
    "configPath": "/path/to/riddle-rush-mono-repo/vibe-mcp-config.json"
  }
}
```

## Server List

### Primary Servers (from `.mcp.json`)

- `primary-playwright-test` - Playwright test server
- `primary-one-mcp` - One-MCP general purpose server

### FastMCP Servers (from `fastmcp.json`)

- `fastmcp-riddle-rush-subagents` - VoltAgent subagents
- `fastmcp-nuxt-ui` - Nuxt UI components
- `fastmcp-nuxt` - Nuxt framework documentation
- `fastmcp-playwright` - Playwright automation
- `fastmcp-aws-docs` - AWS documentation
- `fastmcp-docker` - Docker management
- `fastmcp-context7` - Library documentation
- `fastmcp-browsermcp` - Browser automation
- `fastmcp-nuxt-mcp-toolkit` - Nuxt toolkit
- `fastmcp-git` - Git operations
- `fastmcp-gitlab` - GitLab API
- `fastmcp-filesystem` - Filesystem operations

### Cursor Servers (from `.cursor/mcp.json`)

- `cursor-riddle-rush-subagents` - VoltAgent subagents
- `cursor-nuxt-ui` - Nuxt UI components
- `cursor-nuxt` - Nuxt framework documentation
- `cursor-playwright` - Playwright automation
- `cursor-aws-docs` - AWS documentation
- `cursor-mcp-server-aws-docs` - AWS docs alternative
- `cursor-docker` - Docker management
- `cursor-context7` - Library documentation
- `cursor-browsermcp` - Browser automation
- `cursor-nuxt-mcp-toolkit` - Nuxt toolkit
- `cursor-git` - Git operations
- `cursor-gitlab` - GitLab API
- `cursor-filesystem` - Filesystem operations

## Usage Examples

### OpenCode Usage

```javascript
// Import OpenCode client
import { OpenCodeClient } from '@opencode/client'

// Initialize with Riddle Rush configuration
const client = new OpenCodeClient({
  configPath: './opencode-mcp-config.json',
})

// Use a specific server
const nuxtServer = client.getServer('fastmcp-nuxt')
const result = await nuxtServer.query('How to create a Nuxt plugin?')
```

### Mistral Vibe Usage

```javascript
// Import Vibe client
import { VibeClient } from '@mistral/vibe'

// Initialize with Riddle Rush configuration
const client = new VibeClient({
  mcpConfig: './vibe-mcp-config.json',
})

// Use a specific server
const playwrightServer = client.getServer('cursor-playwright')
const result = await playwrightServer.runTest('login.spec.js')
```

## Export Scripts

The repository includes scripts to regenerate these configurations:

- `scripts/export-mcp-opencode.js` - Generates OpenCode configuration
- `scripts/export-mcp-vibe.js` - Generates Mistral Vibe configuration

### Regenerate Configurations

```bash
# Export to OpenCode format
node scripts/export-mcp-opencode.js

# Export to Mistral Vibe format
node scripts/export-mcp-vibe.js
```

## Configuration Details

### Priority System

- **Primary servers** (from `.mcp.json`): Highest priority (100 in Vibe, "high" in OpenCode)
- **FastMCP/Cursor servers**: Medium priority (50 in Vibe, "medium" in OpenCode)

### Naming Convention

All servers are prefixed with their source:

- `primary-*` - From `.mcp.json`
- `fastmcp-*` - From `fastmcp.json`
- `cursor-*` - From `.cursor/mcp.json`

### Environment Variables

Servers that require authentication (like GitLab) preserve their environment variable placeholders:

```json
{
  "env": {
    "GITLAB_PERSONAL_ACCESS_TOKEN": "${GITLAB_PERSONAL_ACCESS_TOKEN}"
  }
}
```

## Troubleshooting

### Missing Dependencies

Ensure all required npm packages are installed:

```bash
pnpm install
```

### File Permissions

Make export scripts executable:

```bash
chmod +x scripts/export-mcp-*.js
```

### Configuration Validation

Validate JSON syntax:

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('opencode-mcp-config.json')))"
```

## Platform-Specific Notes

### OpenCode

- Uses `opencode` field for platform-specific metadata
- Supports priority levels: "high", "medium", "low"
- Categories map to OpenCode's tool classification system

### Mistral Vibe

- Uses `vibe` field for platform-specific metadata
- Supports priority as numeric values (100 = highest)
- Includes capability definitions (streaming, concurrent requests)
- Compatibility array specifies supported model versions

## Updates and Maintenance

To update configurations when new MCP servers are added:

1. Add servers to the appropriate source file (`.mcp.json`, `fastmcp.json`, or `.cursor/mcp.json`)
2. Run the export scripts to regenerate platform-specific configurations
3. Test the new servers in your target platform
4. Update documentation as needed

## License

These configurations are provided under the same license as the Riddle Rush project (MIT).

## Support

For issues with MCP integration:

- Check the [Riddle Rush documentation](https://riddle-rush.com/docs)
- Open an issue in the [GitHub repository](https://github.com/riddle-rush/riddle-rush-mono-repo)
- Consult the platform-specific documentation for OpenCode or Mistral Vibe

## Examples

### Using Playwright Server in Vibe

```javascript
const vibe = new VibeClient()
const playwright = vibe.getServer('cursor-playwright')

// Run a test
const testResult = await playwright.runTest('auth.spec.js')

// Get browser automation help
const help = await playwright.query('How to handle iframes in Playwright?')
```

### Using Nuxt Server in OpenCode

```javascript
const opencode = new OpenCodeClient()
const nuxt = opencode.getServer('fastmcp-nuxt')

// Get framework documentation
const docs = await nuxt.query('Nuxt 4 module system explanation')

// Get component examples
const examples = await nuxt.getExamples('UButton usage')
```

## Performance Considerations

- Primary servers have higher priority and will be tried first
- STDIO servers (like `primary-one-mcp`) support only 1 concurrent request
- Other servers support up to 5 concurrent requests
- Streaming is enabled for all servers where supported

## Security Notes

- Environment variables are not included in the exported configs
- Sensitive data should be provided at runtime
- Review server descriptions before enabling in production
- Some servers may require internet access to function properly

## Future Enhancements

Potential improvements for future versions:

- Add server health checks
- Implement usage analytics
- Add server grouping/tagging
- Support for server aliases
- Priority override system
- Configuration validation tooling
