# VoltAgent MCP Subagents

This directory contains the VoltAgent-backed MCP server used as the default
`riddle-rush-subagents` configuration.

## Entry Point

- `tools/voltagent/mcp-server.mjs`

## Notes

- Runs in stdio mode for MCP clients.
- Exposes vetted repo commands via a single MCP tool.
- Set `VOLTAGENT_MODEL` to override the default model for the agents.
