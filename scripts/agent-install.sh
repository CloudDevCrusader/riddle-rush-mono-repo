#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SETUP_SCRIPT="${ROOT_DIR}/scripts/setup-agent-configs.sh"
CONFIG_DIR_DEFAULT="${HOME}/.config/riddle-rush"
SECRETS_FILE_DEFAULT="${CONFIG_DIR_DEFAULT}/agent-secrets.env"
SETTINGS_FILE_DEFAULT="${CONFIG_DIR_DEFAULT}/agent-settings.json"

interactive=0
if [[ -t 0 ]]; then
  interactive=1
fi

collect_settings=0
if [[ "$interactive" -eq 1 ]]; then
  collect_settings=1
fi

animations=0
if [[ "$interactive" -eq 1 ]]; then
  animations=1
fi
if [[ "${RR_AGENT_NO_ANIMATION:-}" == "1" ]]; then
  animations=0
fi

SECRETS_FILE="${SECRETS_FILE_DEFAULT}"
SETTINGS_FILE="${SETTINGS_FILE_DEFAULT}"
save_secrets=0
show_logos=0

DEFAULT_AGENTS=(
  opencode
  kilocode
  codex
  claude-code
  copilot
  fastmcp
  gemini-cli
  mistral-vibe
  cursor-agent
)

usage() {
  cat <<'EOF'
Usage:
  scripts/agent-install.sh [options]

Options:
  --agents <list>     Comma-separated agent list (overrides defaults)
  --extra <list>      Comma-separated agent list appended to defaults
  --all               Install for listed agents without detection
  --installed         Only install when the agent appears installed (default)
  --interactive       Prompt for API keys/logins and save settings
  --no-input          Disable prompts
  --collect           Collect settings snapshot
  --no-collect         Skip settings snapshot
  --secrets-file <p>  Path for saved API keys (env file)
  --settings-file <p> Path for settings snapshot (json)
  --no-animations     Disable loading animation
  --logos             Show ASCII logos for detected tools and exit
  --dry-run           Print actions without making changes
  --list              Show known agent keys
  -h, --help          Show this help

Known agents:
  opencode, kilocode, codex, claude-code, copilot, fastmcp, gemini-cli, mistral-vibe, cursor-agent

Environment overrides:
  OPENCODE_PERPLEXITY_CONFIG   Destination path for OpenCode config
  KILOCODE_PERPLEXITY_CONFIG   Destination path for Kilo Code config
  FASTMCP_CONFIG               Destination path for fastmcp.json
  CLAUDE_FASTMCP_CONFIG        Alternate destination path for fastmcp.json
  GEMINI_CLI_MCP_CONFIG        Destination path for .mcp.json
  GEMINI_CLI_CONFIG            Alternate destination path for .mcp.json
  RR_AGENT_NO_ANIMATION        Disable animations when set to 1
  EXTRA_AGENTS                 Extra agents to append (comma-separated)

Examples:
  scripts/agent-install.sh
  scripts/agent-install.sh --agents "opencode,kilocode,cursor-agent"
  EXTRA_AGENTS="foo-agent,bar-agent" scripts/agent-install.sh --all
EOF
}

agents_arg=""
extra_arg=""
mode="installed"
dry_run=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agents)
      agents_arg="${2:-}"
      shift 2
      ;;
    --extra)
      extra_arg="${2:-}"
      shift 2
      ;;
    --interactive)
      interactive=1
      shift
      ;;
    --no-input|--non-interactive)
      interactive=0
      shift
      ;;
    --collect)
      collect_settings=1
      shift
      ;;
    --no-collect)
      collect_settings=0
      shift
      ;;
    --secrets-file)
      SECRETS_FILE="${2:-}"
      shift 2
      ;;
    --settings-file)
      SETTINGS_FILE="${2:-}"
      shift 2
      ;;
    --no-animations)
      animations=0
      shift
      ;;
    --logos)
      show_logos=1
      shift
      ;;
    --all)
      mode="all"
      shift
      ;;
    --installed)
      mode="installed"
      shift
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    --list)
      echo "Known agents: ${DEFAULT_AGENTS[*]}"
      exit 0
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ "$collect_settings" -eq 1 && -z "$SETTINGS_FILE" ]]; then
  echo "Settings file path is required when --collect is enabled." >&2
  exit 1
fi

if [[ "$interactive" -eq 1 && -z "$SECRETS_FILE" ]]; then
  echo "Secrets file path is required for interactive setup." >&2
  exit 1
fi

if [[ "$interactive" -eq 0 ]]; then
  animations=0
fi

if [[ "$show_logos" -eq 1 ]]; then
  show_installed_logos
  exit 0
fi

print_banner() {
  cat <<'EOF'
========================================
Riddle Rush Agent Setup
========================================
EOF
}

loading_screen() {
  if [[ "$animations" -eq 0 ]]; then
    return
  fi

  local lines=(
    "Aligning prompt goggles"
    "Polishing syntax wrenches"
    "Untangling agent cables"
    "Rehearsing robot jokes"
  )
  local index=$((RANDOM % ${#lines[@]}))

  printf "Loading"
  for _ in 1 2 3; do
    printf "."
    sleep 0.2
  done
  printf "\n"

  printf "Booting agents: ["
  for ((i=0; i<24; i++)); do
    printf "#"
    sleep 0.02
  done
  printf "]\n"

  printf "%s\n" "${lines[$index]}..."
}

print_logo() {
  local tag="$1"
  printf ".----------------------------.\n"
  printf "| 0x1 %-20s 0x0 |\n" "$tag"
  printf "|    .-.(o_o).-.\n"
  printf "'----------------------------'\n"
  printf "  [::] [::] [::] [::]\n"
  printf "\n"
}

show_installed_logos() {
  local found=0

  for agent in "${DEFAULT_AGENTS[@]}"; do
    if is_installed "$agent"; then
      found=1
      case "$agent" in
        opencode)
          print_logo "OPENCODE"
          ;;
        kilocode)
          print_logo "KILO CODE"
          ;;
        codex)
          print_logo "CODEX"
          ;;
        claude-code)
          print_logo "CLAUDE CODE"
          ;;
        copilot)
          print_logo "COPILOT"
          ;;
        fastmcp)
          print_logo "FASTMCP"
          ;;
        gemini-cli)
          print_logo "GEMINI CLI"
          ;;
        mistral-vibe)
          print_logo "MISTRAL VIBE"
          ;;
        cursor-agent)
          print_logo "CURSOR AGENT"
          ;;
      esac
    fi
  done

  if [[ "$found" -eq 0 ]]; then
    echo "No installed agents detected."
  fi
}

prompt_yes_no() {
  local prompt="$1"
  local default="${2:-N}"
  local reply=""

  if [[ "$interactive" -eq 0 ]]; then
    return 1
  fi

  while true; do
    read -r -p "$prompt " reply
    if [[ -z "$reply" ]]; then
      reply="$default"
    fi
    case "${reply,,}" in
      y|yes)
        return 0
        ;;
      n|no)
        return 1
        ;;
    esac
  done
}

ensure_parent_dir() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
}

escape_env_value() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf "%s" "$value"
}

write_secret() {
  local key="$1"
  local value="$2"
  local escaped
  escaped="$(escape_env_value "$value")"

  ensure_parent_dir "$SECRETS_FILE"

  if [[ -f "$SECRETS_FILE" ]]; then
    if grep -q "^${key}=" "$SECRETS_FILE"; then
      local tmp
      tmp="$(mktemp)"
      awk -v k="$key" -v v="$escaped" '
        $0 ~ "^"k"=" { print k"=\""v"\""; next }
        { print }
      ' "$SECRETS_FILE" > "$tmp"
      mv "$tmp" "$SECRETS_FILE"
    else
      printf "%s=\"%s\"\n" "$key" "$escaped" >> "$SECRETS_FILE"
    fi
  else
    printf "%s=\"%s\"\n" "$key" "$escaped" >> "$SECRETS_FILE"
  fi

  chmod 600 "$SECRETS_FILE"
}

prompt_secret() {
  local key="$1"
  local label="$2"
  local value=""

  if [[ -n "${!key:-}" ]]; then
    return
  fi

  if [[ "$interactive" -eq 0 ]]; then
    return
  fi

  read -r -s -p "Enter ${label} (${key}) or leave blank to skip: " value
  printf "\n"

  if [[ -z "$value" ]]; then
    return
  fi

  export "$key"="$value"

  if [[ "$save_secrets" -eq 1 ]]; then
    write_secret "$key" "$value"
  fi
}

resolve_opencode_dest() {
  if [[ -n "${OPENCODE_PERPLEXITY_CONFIG:-}" ]]; then
    printf "%s" "$OPENCODE_PERPLEXITY_CONFIG"
  else
    printf "%s" "${HOME}/.config/opencode/perplexity.json"
  fi
}

resolve_kilocode_dest() {
  if [[ -n "${KILOCODE_PERPLEXITY_CONFIG:-}" ]]; then
    printf "%s" "$KILOCODE_PERPLEXITY_CONFIG"
  else
    printf "%s" "${HOME}/.config/kilocode/perplexity.json"
  fi
}

resolve_fastmcp_dest() {
  printf "%s" "${FASTMCP_CONFIG:-${CLAUDE_FASTMCP_CONFIG:-${HOME}/.config/claude/fastmcp.json}}"
}

resolve_gemini_dest() {
  if [[ -n "${GEMINI_CLI_MCP_CONFIG:-}" ]]; then
    printf "%s" "$GEMINI_CLI_MCP_CONFIG"
    return
  fi
  if [[ -n "${GEMINI_CLI_CONFIG:-}" ]]; then
    printf "%s" "$GEMINI_CLI_CONFIG"
    return
  fi
  if [[ -d "${HOME}/.config/gemini-cli" ]]; then
    printf "%s" "${HOME}/.config/gemini-cli/mcp.json"
    return
  fi
  if [[ -d "${HOME}/.config/gemini" ]]; then
    printf "%s" "${HOME}/.config/gemini/mcp.json"
    return
  fi
  printf "%s" ""
}

prompt_for_secrets() {
  if [[ "$interactive" -eq 0 ]]; then
    return
  fi

  save_secrets=0
  if prompt_yes_no "Save API keys to ${SECRETS_FILE}? [Y/n]" "Y"; then
    save_secrets=1
  fi

  prompt_secret "PERPLEXITY_API_KEY" "Perplexity (OpenCode/Kilo Code)"
  prompt_secret "OPENAI_API_KEY" "OpenAI (Codex)"
  prompt_secret "ANTHROPIC_API_KEY" "Anthropic (Claude Code)"
  prompt_secret "GEMINI_API_KEY" "Gemini CLI"
  prompt_secret "MISTRAL_API_KEY" "Mistral Vibe"
  prompt_secret "GITLAB_PERSONAL_ACCESS_TOKEN" "GitLab MCP"
}

prompt_for_logins() {
  if [[ "$interactive" -eq 0 ]]; then
    return
  fi

  if command -v gh >/dev/null 2>&1; then
    if ! gh auth status >/dev/null 2>&1; then
      if prompt_yes_no "Run 'gh auth login' for Copilot? [y/N]" "N"; then
        gh auth login
      fi
    fi
  fi
}

collect_settings_snapshot() {
  local opencode_dest
  local kilocode_dest
  local fastmcp_dest
  local gemini_dest
  local timestamp
  local gh_hosts

  opencode_dest="$(resolve_opencode_dest)"
  kilocode_dest="$(resolve_kilocode_dest)"
  fastmcp_dest="$(resolve_fastmcp_dest)"
  gemini_dest="$(resolve_gemini_dest)"
  timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  gh_hosts="${HOME}/.config/gh/hosts.yml"

  ensure_parent_dir "$SETTINGS_FILE"

  cat > "$SETTINGS_FILE" <<EOF
{
  "timestamp": "${timestamp}",
  "agents": {
    "opencode": {
      "installed": $(is_installed opencode && echo "true" || echo "false"),
      "configPath": "${opencode_dest}",
      "configExists": $( [[ -f "$opencode_dest" ]] && echo "true" || echo "false" )
    },
    "kilocode": {
      "installed": $(is_installed kilocode && echo "true" || echo "false"),
      "configPath": "${kilocode_dest}",
      "configExists": $( [[ -f "$kilocode_dest" ]] && echo "true" || echo "false" )
    },
    "codex": {
      "installed": $(is_installed codex && echo "true" || echo "false")
    },
    "claude-code": {
      "installed": $(is_installed claude-code && echo "true" || echo "false"),
      "configPath": "${HOME}/.config/claude"
    },
    "copilot": {
      "installed": $(is_installed copilot && echo "true" || echo "false"),
      "configPath": "${gh_hosts}",
      "configExists": $( [[ -f "$gh_hosts" ]] && echo "true" || echo "false" )
    },
    "fastmcp": {
      "installed": $(is_installed fastmcp && echo "true" || echo "false"),
      "configPath": "${fastmcp_dest}",
      "configExists": $( [[ -f "$fastmcp_dest" ]] && echo "true" || echo "false" )
    },
    "gemini-cli": {
      "installed": $(is_installed gemini-cli && echo "true" || echo "false"),
      "configPath": "${gemini_dest}",
      "configExists": $( [[ -n "$gemini_dest" && -f "$gemini_dest" ]] && echo "true" || echo "false" )
    },
    "mistral-vibe": {
      "installed": $(is_installed mistral-vibe && echo "true" || echo "false")
    },
    "cursor-agent": {
      "installed": $(is_installed cursor-agent && echo "true" || echo "false"),
      "configPath": "${ROOT_DIR}/.cursor/mcp.json",
      "configExists": $( [[ -f "${ROOT_DIR}/.cursor/mcp.json" ]] && echo "true" || echo "false" )
    }
  },
  "env": {
    "PERPLEXITY_API_KEY": "$( [[ -n "${PERPLEXITY_API_KEY:-}" ]] && echo "set" || echo "unset" )",
    "OPENAI_API_KEY": "$( [[ -n "${OPENAI_API_KEY:-}" ]] && echo "set" || echo "unset" )",
    "ANTHROPIC_API_KEY": "$( [[ -n "${ANTHROPIC_API_KEY:-}" ]] && echo "set" || echo "unset" )",
    "GEMINI_API_KEY": "$( [[ -n "${GEMINI_API_KEY:-}" ]] && echo "set" || echo "unset" )",
    "MISTRAL_API_KEY": "$( [[ -n "${MISTRAL_API_KEY:-}" ]] && echo "set" || echo "unset" )",
    "GITLAB_PERSONAL_ACCESS_TOKEN": "$( [[ -n "${GITLAB_PERSONAL_ACCESS_TOKEN:-}" ]] && echo "set" || echo "unset" )"
  }
}
EOF

  echo "Saved settings snapshot to ${SETTINGS_FILE}"
}

normalize_agent() {
  local raw="$1"
  local key="${raw,,}"
  key="${key// /-}"
  key="${key//_/-}"

  case "$key" in
    opencode|open-code)
      echo "opencode"
      ;;
    kilocode|kilo-code)
      echo "kilocode"
      ;;
    codex)
      echo "codex"
      ;;
    claude|claude-code|claudecode)
      echo "claude-code"
      ;;
    copilot|github-copilot|gh-copilot)
      echo "copilot"
      ;;
    fastmcp|fast-mcp|fastmcps|fast-mcps)
      echo "fastmcp"
      ;;
    gemini|gemini-cli|gemin-cli)
      echo "gemini-cli"
      ;;
    mistral|mistral-vibe|mistralvibe)
      echo "mistral-vibe"
      ;;
    cursor|cursor-agent|cursoragent)
      echo "cursor-agent"
      ;;
    *)
      echo "$key"
      ;;
  esac
}

is_installed() {
  case "$1" in
    opencode)
      command -v opencode >/dev/null 2>&1
      ;;
    kilocode)
      command -v kilocode >/dev/null 2>&1
      ;;
    codex)
      command -v codex >/dev/null 2>&1
      ;;
    claude-code)
      command -v claude >/dev/null 2>&1 || command -v claude-code >/dev/null 2>&1
      ;;
    copilot)
      command -v copilot >/dev/null 2>&1 || command -v gh >/dev/null 2>&1
      ;;
    fastmcp)
      if command -v fastmcp >/dev/null 2>&1; then
        return 0
      fi
      if command -v python >/dev/null 2>&1; then
        python -c "import fastmcp" >/dev/null 2>&1 && return 0
      fi
      if command -v python3 >/dev/null 2>&1; then
        python3 -c "import fastmcp" >/dev/null 2>&1 && return 0
      fi
      return 1
      ;;
    gemini-cli)
      command -v gemini-cli >/dev/null 2>&1 || command -v gemini >/dev/null 2>&1
      ;;
    mistral-vibe)
      command -v mistral-vibe >/dev/null 2>&1 || command -v mistral >/dev/null 2>&1
      ;;
    cursor-agent)
      [[ -d "${ROOT_DIR}/.cursor" ]]
      ;;
    *)
      return 1
      ;;
  esac
}

run_setup() {
  local agent="$1"
  shift
  local args=("$@")

  if [[ "$dry_run" -eq 1 ]]; then
    args+=(--dry-run)
  fi

  "$SETUP_SCRIPT" "$agent" "${args[@]}"
}

ensure_repo_file() {
  local file_path="$1"
  local agent="$2"

  if [[ -f "$file_path" ]]; then
    echo "OK: ${agent} uses ${file_path}"
    return 0
  fi

  echo "Missing ${file_path} for ${agent}" >&2
  return 1
}

install_opencode() {
  local dest
  dest="$(resolve_opencode_dest)"
  run_setup opencode --dest "$dest"
}

install_kilocode() {
  local dest
  dest="$(resolve_kilocode_dest)"
  run_setup kilocode --dest "$dest"
}

install_cursor_agent() {
  local cursor_dir="${ROOT_DIR}/.cursor"
  local cursor_config="${cursor_dir}/mcp.json"
  local cursor_example="${cursor_dir}/mcp.json.example"

  if [[ "$dry_run" -eq 1 ]]; then
    if [[ ! -f "$cursor_config" && -f "$cursor_example" ]]; then
      echo "Dry run: would copy ${cursor_example} -> ${cursor_config}"
    else
      echo "Dry run: cursor-agent config already present"
    fi
    return 0
  fi

  if [[ -f "$cursor_config" ]]; then
    echo "OK: cursor-agent config already present (${cursor_config})"
    return 0
  fi

  if [[ ! -f "$cursor_example" ]]; then
    echo "Missing cursor-agent example config: ${cursor_example}" >&2
    return 1
  fi

  mkdir -p "$cursor_dir"
  cp "$cursor_example" "$cursor_config"
  echo "Copied ${cursor_example} -> ${cursor_config}"
}

install_fastmcp() {
  local source="${ROOT_DIR}/fastmcp.json"
  local dest
  dest="$(resolve_fastmcp_dest)"

  if [[ ! -f "$source" ]]; then
    echo "Missing fastmcp config: ${source}" >&2
    return 1
  fi

  if [[ "$dry_run" -eq 1 ]]; then
    echo "Dry run: would copy ${source} -> ${dest}"
    return 0
  fi

  mkdir -p "$(dirname "$dest")"
  cp "$source" "$dest"
  echo "Copied ${source} -> ${dest}"
}

install_gemini_cli() {
  local source="${ROOT_DIR}/.mcp.json"
  local dest
  dest="$(resolve_gemini_dest)"

  if [[ -z "$dest" ]]; then
    if [[ "$interactive" -eq 1 ]]; then
      read -r -p "Gemini CLI config path (blank to skip): " dest
    fi
  fi

  if [[ -z "$dest" ]]; then
    echo "Skipping gemini-cli config: set GEMINI_CLI_MCP_CONFIG to install .mcp.json"
    return 0
  fi

  if [[ ! -f "$source" ]]; then
    echo "Missing MCP config: ${source}" >&2
    return 1
  fi

  if [[ "$dry_run" -eq 1 ]]; then
    echo "Dry run: would copy ${source} -> ${dest}"
    return 0
  fi

  mkdir -p "$(dirname "$dest")"
  cp "$source" "$dest"
  echo "Copied ${source} -> ${dest}"
}

install_agent() {
  case "$1" in
    opencode)
      install_opencode
      ;;
    kilocode)
      install_kilocode
      ;;
    codex)
      ensure_repo_file "${ROOT_DIR}/AGENTS.md" "codex"
      ;;
    claude-code)
      ensure_repo_file "${ROOT_DIR}/CLAUDE.md" "claude-code"
      ;;
    copilot)
      ensure_repo_file "${ROOT_DIR}/AGENTS.md" "copilot"
      ;;
    fastmcp)
      install_fastmcp
      ;;
    gemini-cli)
      install_gemini_cli
      ;;
    mistral-vibe)
      echo "OK: mistral-vibe has no repo config to install"
      ;;
    cursor-agent)
      install_cursor_agent
      ;;
    *)
      echo "No installer for agent: $1" >&2
      return 1
      ;;
  esac
}

declare -A selected=()
declare -a agent_list=()

if [[ -n "$agents_arg" ]]; then
  IFS=',' read -r -a agent_list <<<"$agents_arg"
else
  agent_list=("${DEFAULT_AGENTS[@]}")
fi

if [[ -n "${EXTRA_AGENTS:-}" ]]; then
  IFS=',' read -r -a extra_list <<<"${EXTRA_AGENTS}"
  agent_list+=("${extra_list[@]}")
fi

if [[ -n "$extra_arg" ]]; then
  IFS=',' read -r -a extra_list <<<"$extra_arg"
  agent_list+=("${extra_list[@]}")
fi

if [[ "$interactive" -eq 1 ]]; then
  print_banner
  loading_screen
  prompt_for_secrets
  prompt_for_logins
fi

errors=0
skipped=0

for raw_agent in "${agent_list[@]}"; do
  agent="$(normalize_agent "$raw_agent")"

  if [[ -z "$agent" ]]; then
    continue
  fi

  if [[ -n "${selected[$agent]:-}" ]]; then
    continue
  fi

  selected["$agent"]=1

  if [[ "$mode" == "installed" ]] && ! is_installed "$agent"; then
    echo "Skipping ${agent}: not detected"
    skipped=$((skipped + 1))
    continue
  fi

  if ! install_agent "$agent"; then
    errors=$((errors + 1))
  fi
done

if [[ "$errors" -gt 0 ]]; then
  echo "Completed with ${errors} error(s), ${skipped} skipped." >&2
  exit 1
fi

if [[ "$collect_settings" -eq 1 ]]; then
  collect_settings_snapshot
fi

echo "Completed with ${skipped} skipped."
