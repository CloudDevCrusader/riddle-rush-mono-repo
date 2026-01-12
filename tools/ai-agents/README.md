# AI Agents & Tools for Riddle Rush Monorepo

This directory contains AI agents, tools, and extensions for the Riddle Rush monorepo.

## Available Tools

### 🤖 AI Agents

- **FastMCP Server** (`tools/python/main.py`) - Multi-agent coordination platform
- **LangChain Tools** (`tools/langchain/`) - AI-powered workflow automation
- **Trunk Integration** - Code quality and formatting automation

### 🧰 AI Extensions

- **Code Quality Agents** - Automated linting and formatting
- **Deployment Agents** - AWS and infrastructure automation
- **Testing Agents** - Automated test execution and analysis
- **Documentation Agents** - Documentation generation and management

### 🔧 AI Mods

- **Python Linting Mod** - Ruff, Black, isort, mypy, bandit
- **JavaScript Linting Mod** - ESLint, Prettier, Stylelint
- **Terraform Mod** - TFLint, Terraform docs
- **Security Mod** - Bandit, Trufflehog (disabled by default)

## Usage

### Running AI Agents

```bash
# Start FastMCP server
cd tools/python && python main.py

# Run LangChain tools
cd tools/langchain && pnpm start

# Run Trunk checks
./trunk check --all

# Run specific linters
./trunk check --filter=eslint
./trunk check --filter=prettier
```

### Agent Commands

```bash
# Quality checks
pnpm run workspace:check

# Python linting
pnpm run python:lint

# Auto-fix issues
pnpm run agent:fix

# Run tests
pnpm run test:unit
```

## Configuration

### Trunk Configuration

The `.trunk/trunk.yaml` file contains all linter and tool configurations:

- **JavaScript/TypeScript**: ESLint, Prettier, Stylelint
- **Python**: Ruff, Black, isort, mypy, Bandit
- **Markdown**: Markdownlint
- **YAML**: Yamllint
- **Shell**: Shellcheck, Shfmt
- **Terraform**: TFLint
- **Docker**: Hadolint

### Python Configuration

The `pyproject.toml` file contains Python-specific tool configurations:

- **Ruff**: Fast linting with comprehensive rules
- **Black**: Opinionated code formatting
- **isort**: Import sorting
- **mypy**: Type checking
- **Bandit**: Security scanning

## Adding New Agents

To add a new AI agent:

1. Create a new Python file in `tools/python/`
2. Define your agent functions with `@mcp.tool()` decorator
3. Add the agent to the main server
4. Update documentation

## Best Practices

1. **Small, Focused Agents**: Each agent should handle one specific task
2. **Clear Documentation**: Document all agent capabilities and parameters
3. **Error Handling**: Include proper error handling and timeout management
4. **Logging**: Use structured logging for debugging
5. **Testing**: Test agents thoroughly before deployment

## Available Commands

See `scripts/agent-commands.sh` for a complete list of agent workflow commands.
