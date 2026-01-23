# Riddle Rush FastMCP Subagents Server

FastMCP server providing specialized subagents for Riddle Rush monorepo automation.

## Python Version

This project requires Python 3.10 or higher. The recommended version is specified in `.python-version`.

### Using pyenv

If you use [pyenv](https://github.com/pyenv/pyenv) for Python version management:

```bash
# Install the required Python version (if not already installed)
pyenv install 3.10.13

# Set the local version for this directory
cd tools/python
pyenv local 3.10.13

# Or use the version specified in .python-version
pyenv install $(cat .python-version)
pyenv local $(cat .python-version)
```

### Using uv (Recommended)

This project uses [uv](https://github.com/astral-sh/uv) for dependency management:

```bash
# Install dependencies
cd tools/python
uv sync

# Run the MCP server
uv run python main.py

# Or use the wrapper script
./run-mcp-server.sh
```

## Development

### Install Dependencies

```bash
uv sync
# Or with dev dependencies
uv sync --extra dev
```

### Code Quality

```bash
# Format code
uv run black .
uv run isort .

# Lint
uv run ruff check .

# Type check
uv run mypy .

# Security scan
uv run bandit -r .
```

### Testing

```bash
# Run tests
uv run pytest

# With coverage
uv run pytest --cov=. --cov-report=html
```

## MCP Server Configuration

The server is configured as `riddle-rush-subagents` in:

- `.mcp.json` (canonical MCP list for agents like Codex/Mistral)
- `fastmcp.json` (FastMCP config for Claude Desktop)
- `.cursor/mcp.json` (Cursor MCP config)

To use it in Cursor:

1. Ensure the server is properly configured in `.cursor/mcp.json`
2. Restart Cursor to load the MCP server
3. The subagents will be available in Cursor's MCP tools

## Available Subagents

- **AWS Deployment**: Deploy to AWS, check status, get Terraform outputs
- **Terraform Management**: Plan, apply, and check infrastructure status
- **CI/CD Workflows**: Check pipeline health, run quality checks
- **Testing Automation**: Run unit and E2E tests
- **Project Management**: Get project status, build apps
- **Documentation**: List and access project documentation
- **Workspace Management**: Get monorepo workspace information
