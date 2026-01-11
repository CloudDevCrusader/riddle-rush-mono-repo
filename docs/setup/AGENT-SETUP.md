# AI Agent Setup

Setup and configuration locations for AI agents used with the Riddle Rush monorepo.

## Supported Agents

- Claude Code
- Cursor (IDE + Cursor Agent)
- GitHub Copilot
- OpenCode
- Kilo Code
- Mistral Vibe

## Repository Configuration Locations

| Agent          | Repo files                                                                                                           | Notes                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Claude Code    | `CLAUDE.md`                                                                                                          | Primary instructions for Claude Code usage |
| Cursor         | `.cursorrules`, `.cursor/mcp.json`, `.cursor/mcp.json.example`, `.cursor/environment.json`, `.cursor/worktrees.json` | Cursor workspace and MCP settings          |
| Cursor Agent   | `.cursor/mcp.json`                                                                                                   | MCP servers for agent tooling              |
| GitHub Copilot | `AGENTS.md`                                                                                                          | Workflow guidance only                     |
| OpenCode       | `.git/opencode`, `docs/setup/agent-configs/opencode.perplexity.json`                                                 | Git marker plus Perplexity template        |
| Kilo Code      | `docs/setup/agent-configs/kilocode.perplexity.json`                                                                  | Perplexity template                        |
| Mistral Vibe   | None                                                                                                                 | No repo config stored yet                  |

## Configuration Templates

Templates are stored in `docs/setup/agent-configs/` and use environment variables for secrets.

- `docs/setup/agent-configs/opencode.perplexity.json` - Perplexity provider template for OpenCode
- `docs/setup/agent-configs/kilocode.perplexity.json` - Perplexity provider template for Kilo Code

## Helper Script

Use `scripts/setup-agent-configs.sh` to install templates into global agent configs.

Environment variables used by the script:

- `OPENCODE_PERPLEXITY_CONFIG` - destination path for OpenCode Perplexity config
- `KILOCODE_PERPLEXITY_CONFIG` - destination path for Kilo Code Perplexity config

## Setup Steps

1. Install the agent tool using vendor instructions.
2. Set the `PERPLEXITY_API_KEY` environment variable.
3. Copy the relevant template into the tool-specific config directory.
4. Verify the connection with a simple prompt in the tool UI/CLI.

## Examples

```bash
# Copy OpenCode template into a local config directory
cp docs/setup/agent-configs/opencode.perplexity.json <agent-config-dir>/perplexity.json

# Copy Kilo Code template into a local config directory
cp docs/setup/agent-configs/kilocode.perplexity.json <agent-config-dir>/perplexity.json

# Use the helper script for OpenCode
OPENCODE_PERPLEXITY_CONFIG="$HOME/.config/opencode/perplexity.json" \
  scripts/setup-agent-configs.sh opencode

# Use the helper script for Kilo Code
KILOCODE_PERPLEXITY_CONFIG="$HOME/.config/kilocode/perplexity.json" \
  scripts/setup-agent-configs.sh kilocode
```

## Troubleshooting

- Missing provider key: confirm `PERPLEXITY_API_KEY` is set in the shell or agent runtime.
- Authentication failures: verify the API key scope in Perplexity.
- Model errors: update the `model` field in the template to a supported Perplexity model.
- MCP errors in Cursor Agent: validate `.cursor/mcp.json` against `.cursor/mcp.json.example`.

## Related Docs

- `AGENTS.md`
- `CLAUDE.md`
- `.cursorrules`
- `.cursor/mcp.json.example`

---

**Last Updated:** 2025-01-05  
**Status:** Active
