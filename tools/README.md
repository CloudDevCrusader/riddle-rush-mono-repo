# Development Tools

This directory contains development tools and utilities for the Riddle Rush monorepo.

## 📁 Directory Structure

```
tools/
├── python/          # Python tools and scripts
├── trunk/           # Trunk.io CLI for linting and code quality
├── langchain/       # LangChain tools for AI/ML workflows
└── .venv/          # Python virtual environment
```

## 🛠️ Available Tools

### Trunk

Trunk is a universal code quality tool that provides:

- **Linting**: Multiple linters (ESLint, Prettier, shellcheck, etc.)
- **Formatting**: Consistent code formatting
- **Security**: Secret scanning and vulnerability detection

**Usage:**

```bash
# Check all files
pnpm run trunk:check

# Format files
pnpm run trunk:fmt

# View flaky tests
pnpm run trunk:flaky-tests
```

### Python Tools

Python-based development utilities for code generation, validation, and automation.

**Setup:**

```bash
# Create virtual environment
python3 -m venv tools/.venv

# Activate
source tools/.venv/bin/activate

# Install dependencies
pip install -r tools/python/requirements.txt
```

**Usage:**

```bash
# Lint Python code
pnpm run python:lint

# Format Python code
pnpm run python:format

# Run Python checks
pnpm run python:check
```

### LangChain

AI/ML tools for intelligent code analysis and generation.

**Features:**

- Code analysis and suggestions
- Documentation generation
- Test case generation
- Refactoring assistance

---

## 🤖 MCP Server Integration

The monorepo includes Model Context Protocol (MCP) server configurations for AI agents.

### Available MCP Servers

Configured in `.mcp.json` and `fastmcp.json`:

1. **Nuxt UI** - Component documentation
2. **Playwright** - Browser automation for E2E testing
3. **AWS Docs** - AWS service documentation
4. **Docker** - Container management
5. **Context7** - Library documentation (Vue, Nuxt, Vite, TypeScript)
6. **Git** - Git operations
7. **GitLab** - CI/CD pipeline management
8. **Filesystem** - Safe file operations

### Using MCP Servers

**With Claude Desktop / Copilot:**

MCP servers are automatically loaded from `.mcp.json` when using GitHub Copilot CLI or Claude Desktop.

**Manual Connection:**

```bash
# Connect to specific server
npx mcp-remote https://ui.nuxt.com/mcp

# List available tools
npx mcp-remote list
```

---

## 📋 Quick Reference

### Code Quality Checks

```bash
# Run all checks
pnpm run workspace:check

# Individual checks
pnpm run typecheck      # TypeScript
pnpm run lint           # ESLint
pnpm run python:lint    # Python linting
pnpm run trunk:check    # Trunk linting
```

### Formatting

```bash
# Format all code
pnpm run format

# Python formatting
pnpm run python:format

# Trunk formatting
pnpm run trunk:fmt
```

### Testing

```bash
# Unit tests
pnpm run test:unit

# E2E tests
pnpm run test:e2e

# Run specific test
pnpm --filter @riddle-rush/game test:unit -- composables
```

---

## 🔧 Adding New Tools

### 1. Add Tool Script

Create tool in `tools/<category>/`:

```bash
tools/
  custom-tool/
    ├── bin/
    │   └── tool.js
    ├── lib/
    │   └── utils.js
    └── package.json
```

### 2. Add npm Script

Add to root `package.json`:

```json
{
  "scripts": {
    "tool:run": "node tools/custom-tool/bin/tool.js"
  }
}
```

### 3. Document Usage

Update this README with tool usage instructions.

---

## 🌐 External Tools

Tools installed globally or used via npx:

- **Turbo** - Monorepo build system (`pnpm run build`)
- **Changesets** - Version management (`pnpm changeset`)
- **Syncpack** - Dependency synchronization (`pnpm syncpack:check`)

---

## 📚 Documentation

- [Agent Workflow Guide](../AGENTS.md)
- [Development Scripts](../scripts/README.md)
- [CI/CD Pipeline](../.github/workflows/README.md)
- [Testing Guide](../docs/development/TESTING.md)

---

**Last Updated:** January 2026
