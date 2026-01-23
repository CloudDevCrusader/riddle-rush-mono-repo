# AI Agent Setup

Setup and configuration locations for AI agents used with the Riddle Rush monorepo.

## Supported Agents

- Claude Code
- Codex
- Cursor (IDE + Cursor Agent)
- GitHub Copilot
- Gemini CLI
- OpenCode
- Kilo Code
- Mistral Vibe

## Repository Configuration Locations

| Agent          | Repo files                                                                                                           | Notes                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Claude Code    | `CLAUDE.md`                                                                                                          | Primary instructions for Claude Code usage |
| Codex          | `AGENTS.md`, `.mcp.json` (optional)                                                                                  | Workflow guidance plus MCP servers         |
| Cursor         | `.cursorrules`, `.cursor/mcp.json`, `.cursor/mcp.json.example`, `.cursor/environment.json`, `.cursor/worktrees.json` | Cursor workspace and MCP settings          |
| Cursor Agent   | `.cursor/mcp.json`                                                                                                   | MCP servers for agent tooling              |
| GitHub Copilot | `AGENTS.md`                                                                                                          | Workflow guidance only                     |
| Gemini CLI     | `.mcp.json` (optional)                                                                                               | MCP servers configuration (if supported)   |
| OpenCode       | `.git/opencode`, `docs/setup/agent-configs/opencode.perplexity.json`                                                 | Git marker plus Perplexity template        |
| Kilo Code      | `docs/setup/agent-configs/kilocode.perplexity.json`                                                                  | Perplexity template                        |
| Mistral Vibe   | `.mcp.json` (optional)                                                                                               | Point MCP settings at the repo config      |

## Configuration Templates

Templates are stored in `docs/setup/agent-configs/` and use environment variables for secrets.

- `docs/setup/agent-configs/opencode.perplexity.json` - Perplexity provider template for OpenCode
- `docs/setup/agent-configs/kilocode.perplexity.json` - Perplexity provider template for Kilo Code

## Helper Script

Use `scripts/setup-agent-configs.sh` to install templates into global agent configs.

Environment variables used by the script:

- `OPENCODE_PERPLEXITY_CONFIG` - destination path for OpenCode Perplexity config
- `KILOCODE_PERPLEXITY_CONFIG` - destination path for Kilo Code Perplexity config

### Install multiple agents at once

Use `scripts/agent-install.sh` to install configs for all detected agents:

```bash
scripts/agent-install.sh
```

Defaults:

- Copies `fastmcp.json` to `~/.config/claude/fastmcp.json` when FastMCP is detected.
- Override with `FASTMCP_CONFIG` or `CLAUDE_FASTMCP_CONFIG`.
- For Gemini CLI, set `GEMINI_CLI_MCP_CONFIG` to copy `.mcp.json`.

Interactive mode:

```bash
scripts/agent-install.sh --interactive
```

This will:

- Prompt for API keys and save them to `~/.config/riddle-rush/agent-secrets.env`
- Collect a snapshot at `~/.config/riddle-rush/agent-settings.json`
- Offer `gh auth login` if Copilot is detected

Flags:

- `--no-input` to skip prompts
- `--no-collect` to skip the settings snapshot
- `--no-animations` to disable the loading animation
- `--logos` to print ASCII logos for detected tools

Common keys:

- `PERPLEXITY_API_KEY` (OpenCode, Kilo Code)
- `OPENAI_API_KEY` (Codex)
- `ANTHROPIC_API_KEY` (Claude Code)
- `GEMINI_API_KEY` (Gemini CLI)
- `MISTRAL_API_KEY` (Mistral Vibe)
- `GITLAB_PERSONAL_ACCESS_TOKEN` (GitLab MCP)

## Setup Steps

1. Install the agent tool using vendor instructions.
2. Set the relevant API keys (Perplexity plus any LLMs you use).
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
