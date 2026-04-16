# @riddle-rush/cli

> **Riddle Rush agent workflow & project-management CLI** — a small [oclif](https://oclif.io/) utility that wraps the repo's quality gates (TypeScript, ESLint, Syncpack), inspects installed AI agents / MCP servers, and reports Git state.

[![Node](https://img.shields.io/badge/Node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![oclif](https://img.shields.io/badge/built%20with-oclif-795548)](https://oclif.io/)
[![License](https://img.shields.io/badge/License-MIT-5c6bc0.svg)](../../LICENSE)

The CLI lives inside the [Riddle Rush monorepo](../../README.md). It is designed to run **from the repo root** — many commands shell out to root-level pnpm scripts (`pnpm run syncpack:check`, `pnpm run lint`, etc.).

---

## Install

### Inside the monorepo (recommended)

The CLI is wired up as a workspace package, so no separate install is needed:

```bash
pnpm install            # from the repo root
pnpm --filter @riddle-rush/cli build
```

Then run it directly from the package bin:

```bash
./packages/riddle-cli/bin/run.js --help
```

### Global install (optional)

```bash
cd packages/riddle-cli
pnpm run build
pnpm link --global
# now available everywhere as:
riddle --help
```

To unlink: `pnpm unlink --global @riddle-rush/cli`.

### Prebuilt binary (no Node required)

Every semver release publishes self-contained tarballs with a bundled Node runtime to the [Releases page](https://github.com/CloudDevCrusader/riddle-rush-mono-repo/releases/latest):

| File                                            | Platform            |
| ----------------------------------------------- | ------------------- |
| `riddle-rush-cli-<version>-linux-x64.tar.gz`    | Linux x86-64        |
| `riddle-rush-cli-<version>-linux-arm64.tar.gz`  | Linux ARM64         |
| `riddle-rush-cli-<version>-darwin-x64.tar.gz`   | macOS Intel         |
| `riddle-rush-cli-<version>-darwin-arm64.tar.gz` | macOS Apple Silicon |
| `riddle-rush-cli-<version>-win32-x64.tar.gz`    | Windows x86-64      |

```bash
# Linux / macOS — example for macOS Apple Silicon
curl -fsSL -o riddle.tgz \
  https://github.com/CloudDevCrusader/riddle-rush-mono-repo/releases/latest/download/riddle-rush-cli-<version>-darwin-arm64.tar.gz
tar xzf riddle.tgz
./riddle/bin/riddle --help

# Optionally put it on PATH
sudo mv riddle /usr/local/lib/riddle
sudo ln -s /usr/local/lib/riddle/bin/riddle /usr/local/bin/riddle
```

```powershell
# Windows PowerShell
Invoke-WebRequest -Uri "https://github.com/CloudDevCrusader/riddle-rush-mono-repo/releases/latest/download/riddle-rush-cli-<version>-win32-x64.tar.gz" -OutFile riddle.tgz
tar -xzf riddle.tgz
.\riddle\bin\riddle.cmd --help
```

These tarballs embed the exact Node version the CLI was built against, so they work without a separate Node install. Note that commands that shell out to repo scripts (`riddle agent:validate`, `riddle agent:fix`) still need `pnpm` + the repo checked out — the tarball only ships the CLI itself.

---

## Command overview

| Command                   | Purpose                                                                  |
| ------------------------- | ------------------------------------------------------------------------ |
| `riddle stats`            | Dashboard of installed AI agents, their configs, API keys, and Git state |
| `riddle agent:validate`   | Pre-commit quality gate (Syncpack + TypeScript + ESLint)                 |
| `riddle agent:fix`        | Auto-fix: Syncpack, ESLint, Prettier                                     |
| `riddle agent:status`     | Git status, unpushed commits, and recommended next steps                 |
| `riddle agent:mcp-config` | Validate MCP config files (`.mcp.json`, `fastmcp.json`, Claude Desktop)  |
| `riddle agent:mcp-health` | Smoke-test common MCP servers (Chrome DevTools, Git, Filesystem, Docker) |
| `riddle --help`           | oclif-generated help                                                     |
| `riddle <cmd> --help`     | Per-command help                                                         |

Everything uses oclif's `topicSeparator: ':'` — `riddle agent:fix` is the `fix` command under the `agent` topic.

---

## Commands

### `riddle stats`

Renders a boxed dashboard summarising which AI agents are installed, whether their MCP/CLI configs exist, which API keys are present, and a quick Git snapshot.

**Example**

```bash
riddle stats
```

**What it checks**

- **Agents** — `claude`, `codex`, `gh` (Copilot), `cursor-agent`, `fastmcp`, `gemini`, `kilocode`, `mistral`, `opencode`
- **Configs** — `~/.config/opencode/perplexity.json`, `~/.config/kilocode/perplexity.json`, `~/.config/claude/`, `~/.config/gemini-cli/mcp.json`, `.cursor/mcp.json`, `~/.config/claude/fastmcp.json`
- **API keys** — `PERPLEXITY_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `MISTRAL_API_KEY`, `GH_TOKEN`, `GITLAB_PERSONAL_ACCESS_TOKEN` (checked in `process.env` and `~/.config/riddle-rush/agent-secrets.env`)
- **Repository** — current branch, uncommitted files, unpushed commits

Exits with code `0` even if things are missing — it's informational.

---

### `riddle agent:validate`

Runs the full pre-commit gate. Equivalent to `pnpm run workspace:check` but with friendlier output and an actionable failure summary.

```bash
riddle agent:validate
```

**Steps (in order)**

1. `pnpm run syncpack:check` — dependency version consistency across the workspace
2. `pnpm run typecheck` — TypeScript across every package (via Turbo)
3. `pnpm run lint` — ESLint across every package (via Turbo)

On failure the command exits with code `1` and suggests `riddle agent:fix` as the next step.

---

### `riddle agent:fix`

Auto-fix equivalent of `pnpm run workspace:fix`. Continues on individual failures so you always get the full run.

```bash
riddle agent:fix
```

**Steps**

1. `pnpm run syncpack:fix` — align dependency versions
2. `pnpm run lint:fix` — ESLint auto-fix
3. `pnpm run format` — Prettier

Run `riddle agent:validate` afterwards to confirm the repo is green.

---

### `riddle agent:status`

Human-readable Git status with opinionated "next step" suggestions — useful during an agent-driven coding session when you want to know whether to validate, stage, or push.

```bash
riddle agent:status
```

Outputs:

- Current branch
- `git status --short`
- Count of unpushed commits + short log of the first 5
- Last 3 commits (coloured)
- Suggested next steps based on whether the working tree is dirty / has unpushed commits

---

### `riddle agent:mcp-config`

Validates the project's MCP configuration files so your agents actually pick up the servers you expect.

```bash
riddle agent:mcp-config
```

**Checks**

| File                                                              | Purpose                     |
| ----------------------------------------------------------------- | --------------------------- |
| `./.mcp.json`                                                     | Generic MCP clients         |
| `./fastmcp.json`                                                  | FastMCP (Claude Desktop)    |
| `./apps/game/.mcp.json`                                           | App-scoped MCP servers      |
| `~/Library/Application Support/Claude/claude_desktop_config.json` | macOS Claude Desktop config |

For each file it parses JSON, verifies there is a non-empty `mcpServers` object, and reports the server count. Exits `1` if any config is invalid.

---

### `riddle agent:mcp-health`

Smoke-tests that popular MCP server packages are resolvable via `npx`:

```bash
riddle agent:mcp-health
```

Currently probes: **Chrome DevTools MCP**, **Git MCP**, **Filesystem MCP**, **Docker MCP**. Each server is invoked with `--help` and a 5 s timeout.

Exits `1` if any server fails so the command is safe to wire into CI.

---

## Development

All commands below run from `packages/riddle-cli/`.

```bash
pnpm install
pnpm run build      # tsc -b → dist/
pnpm run lint
pnpm run lint:fix
pnpm run test       # mocha test/**/*.test.ts
```

### Adding a new command

1. Create `src/commands/<topic>/<name>.ts` (or `src/commands/<name>.ts` for a top-level command).
2. Extend `@oclif/core`'s `Command` class. Set `static override description` and `static override examples`.
3. Rebuild (`pnpm run build`).
4. Run `pnpm run prepack` to regenerate `oclif.manifest.json` and refresh the auto-generated section of this README.

### File layout

```text
packages/riddle-cli/
├── bin/
│   └── run.js              # oclif entry point (chmod +x)
├── src/
│   ├── index.ts
│   └── commands/
│       ├── stats.ts
│       └── agent/
│           ├── fix.ts
│           ├── mcp-config.ts
│           ├── mcp-health.ts
│           ├── status.ts
│           └── validate.ts
├── dist/                   # build output (generated)
├── package.json
└── tsconfig.json
```

---

## Troubleshooting

| Symptom                                    | Likely cause / fix                                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `riddle: command not found`                | Not linked globally — run `pnpm link --global` from this package, or use `./bin/run.js`.                        |
| `agent:validate` fails on a clean checkout | Forgot `pnpm install` at the repo root.                                                                         |
| `stats` shows everything as `❌ No`        | Run from the **repo root** — `stats` expects to find `.cursor/`, `.mcp.json`, etc. relative to `process.cwd()`. |
| `agent:mcp-health` times out               | First `npx` download can be slow — rerun, or pre-warm with `npx -y <pkg> --help`.                               |

---

## Related

- [AGENTS.md](../../AGENTS.md) — complete agent workflow guide
- [CLAUDE.md](../../CLAUDE.md) — Claude Code notes and architecture overview
- [README.md](../../README.md) — repo-level overview

## License

[MIT](../../LICENSE)
