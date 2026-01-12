#!/usr/bin/env bash

# Agent Stats - Overview of agent usage and configuration
# Displays ASCII dashboard with agent status, configs, and activity

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_DIR="${HOME}/.config/riddle-rush"
SECRETS_FILE="${CONFIG_DIR}/agent-secrets.env"
SETTINGS_FILE="${CONFIG_DIR}/agent-settings.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Box drawing characters
BOX_TL="╔"
BOX_TR="╗"
BOX_BL="╚"
BOX_BR="╝"
BOX_H="═"
BOX_V="║"
BOX_VR="╠"
BOX_VL="╣"
BOX_HB="╦"
BOX_HT="╩"
BOX_PLUS="╬"

# Agent detection
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
      command -v gh >/dev/null 2>&1
      ;;
    fastmcp)
      if command -v fastmcp >/dev/null 2>&1; then
        return 0
      fi
      if command -v python3 >/dev/null 2>&1; then
        python3 -c "import fastmcp" >/dev/null 2>&1 && return 0
      fi
      return 1
      ;;
    gemini-cli)
      command -v gemini >/dev/null 2>&1 || command -v gemini-cli >/dev/null 2>&1
      ;;
    mistral-vibe)
      command -v mistral >/dev/null 2>&1 || command -v mistral-vibe >/dev/null 2>&1
      ;;
    cursor-agent)
      [[ -d "${ROOT_DIR}/.cursor" ]]
      ;;
    *)
      return 1
      ;;
  esac
}

# Configuration check
has_config() {
  local agent="$1"
  case "$agent" in
    opencode)
      [[ -f "${HOME}/.config/opencode/perplexity.json" ]]
      ;;
    kilocode)
      [[ -f "${HOME}/.config/kilocode/perplexity.json" ]]
      ;;
    claude-code)
      [[ -d "${HOME}/.config/claude" ]]
      ;;
    copilot)
      gh auth status >/dev/null 2>&1
      ;;
    fastmcp)
      [[ -f "${HOME}/.config/claude/fastmcp.json" ]]
      ;;
    gemini-cli)
      [[ -f "${HOME}/.config/gemini-cli/mcp.json" ]] || [[ -f "${HOME}/.config/gemini/mcp.json" ]]
      ;;
    cursor-agent)
      [[ -f "${ROOT_DIR}/.cursor/mcp.json" ]]
      ;;
    *)
      return 1
      ;;
  esac
}

# API key check
has_api_key() {
  local key="$1"
  [[ -n "${!key:-}" ]] && return 0
  if [[ -f "$SECRETS_FILE" ]]; then
    grep -q "^${key}=" "$SECRETS_FILE" && return 0
  fi
  return 1
}

# Load secrets if available
if [[ -f "$SECRETS_FILE" ]]; then
  set -a
  source "$SECRETS_FILE" 2>/dev/null || true
  set +a
fi

# Print box line
print_box_line() {
  local left="$1"
  local middle="$2"
  local right="$3"
  local width="${4:-76}"

  echo -en "${CYAN}${left}"
  for ((i=0; i<width; i++)); do
    echo -n "${BOX_H}"
  done
  echo -e "${right}${NC}"
}

# Print centered text
print_centered() {
  local text="$1"
  local width="${2:-76}"
  local color="${3:-${CYAN}}"
  local padding=$(( (width - ${#text}) / 2 ))

  echo -en "${CYAN}${BOX_V}${color}"
  printf "%*s" $padding ""
  echo -n "$text"
  printf "%*s" $((width - padding - ${#text})) ""
  echo -e "${CYAN}${BOX_V}${NC}"
}

# Print left-aligned text
print_left() {
  local text="$1"
  local width="${2:-76}"
  local color="${3:-${NC}}"

  echo -en "${CYAN}${BOX_V}${color} "
  printf "%-$((width-2))s" "$text"
  echo -e " ${CYAN}${BOX_V}${NC}"
}

# Print key-value pair
print_kv() {
  local key="$1"
  local value="$2"
  local width="${3:-76}"
  local key_color="${4:-${YELLOW}}"
  local val_color="${5:-${GREEN}}"

  local key_len=${#key}
  local val_len=${#value}
  local dots=$((width - key_len - val_len - 6))

  echo -en "${CYAN}${BOX_V}${key_color} ${key} ${NC}"
  for ((i=0; i<dots; i++)); do
    echo -n "."
  done
  echo -e " ${val_color}${value} ${CYAN}${BOX_V}${NC}"
}

# Count installed agents
count_installed=0
count_configured=0
agents=(opencode kilocode codex claude-code copilot fastmcp gemini-cli mistral-vibe cursor-agent)

for agent in "${agents[@]}"; do
  if is_installed "$agent"; then
    ((count_installed++))
  fi
  if has_config "$agent"; then
    ((count_configured++))
  fi
done

# Header
clear
print_box_line "$BOX_TL" "$BOX_H" "$BOX_TR"
print_centered "🤖 RIDDLE RUSH AGENT STATISTICS 🤖" 76 "${BOLD}${MAGENTA}"
print_box_line "$BOX_VR" "$BOX_H" "$BOX_VL"

# Summary
print_left "" 76
print_kv "Total Agents Detected" "${count_installed}/9" 76 "${CYAN}" "${GREEN}"
print_kv "Configured Agents" "${count_configured}/9" 76 "${CYAN}" "${YELLOW}"
print_left "" 76

# Agent status table header
print_box_line "$BOX_VR" "$BOX_H" "$BOX_VL"
print_centered "AGENT STATUS" 76 "${BOLD}${BLUE}"
print_box_line "$BOX_VR" "$BOX_H" "$BOX_VL"

echo -en "${CYAN}${BOX_V}${BOLD} %-18s ${NC}${CYAN}${BOX_V}${BOLD} %-12s ${NC}${CYAN}${BOX_V}${BOLD} %-12s ${NC}${CYAN}${BOX_V}${BOLD} %-24s ${NC}${CYAN}${BOX_V}${NC}\n" \
  "Agent" "Installed" "Configured" "API Key"

print_box_line "$BOX_VR" "$BOX_H" "$BOX_VL"

# Agent details
declare -A agent_keys=(
  [opencode]="PERPLEXITY_API_KEY"
  [kilocode]="PERPLEXITY_API_KEY"
  [codex]="OPENAI_API_KEY"
  [claude-code]="ANTHROPIC_API_KEY"
  [copilot]="GH_TOKEN"
  [fastmcp]=""
  [gemini-cli]="GEMINI_API_KEY"
  [mistral-vibe]="MISTRAL_API_KEY"
  [cursor-agent]=""
)

declare -A agent_names=(
  [opencode]="OpenCode"
  [kilocode]="Kilo Code"
  [codex]="Codex"
  [claude-code]="Claude Code"
  [copilot]="GitHub Copilot"
  [fastmcp]="FastMCP"
  [gemini-cli]="Gemini CLI"
  [mistral-vibe]="Mistral Vibe"
  [cursor-agent]="Cursor Agent"
)

for agent in "${agents[@]}"; do
  local name="${agent_names[$agent]}"
  local installed="❌ No"
  local installed_color="${RED}"
  local configured="❌ No"
  local configured_color="${RED}"
  local api_key="N/A"
  local api_color="${NC}"

  if is_installed "$agent"; then
    installed="✅ Yes"
    installed_color="${GREEN}"
  fi

  if has_config "$agent"; then
    configured="✅ Yes"
    configured_color="${GREEN}"
  fi

  local key_name="${agent_keys[$agent]}"
  if [[ -n "$key_name" ]]; then
    if has_api_key "$key_name"; then
      api_key="✅ Set"
      api_color="${GREEN}"
    else
      api_key="❌ Missing"
      api_color="${RED}"
    fi
  else
    api_key="Not Required"
    api_color="${CYAN}"
  fi

  echo -en "${CYAN}${BOX_V}${NC} %-18s ${CYAN}${BOX_V}${installed_color} %-12s ${CYAN}${BOX_V}${configured_color} %-12s ${CYAN}${BOX_V}${api_color} %-24s ${CYAN}${BOX_V}${NC}\n" \
    "$name" "$installed" "$configured" "$api_key"
done

# API Keys section
print_box_line "$BOX_VR" "$BOX_H" "$BOX_VL"
print_centered "API KEYS & SECRETS" 76 "${BOLD}${BLUE}"
print_box_line "$BOX_VR" "$BOX_H" "$BOX_VL"

api_keys=(
  "PERPLEXITY_API_KEY:Perplexity (OpenCode/Kilo)"
  "OPENAI_API_KEY:OpenAI (Codex)"
  "ANTHROPIC_API_KEY:Anthropic (Claude)"
  "GEMINI_API_KEY:Google Gemini"
  "MISTRAL_API_KEY:Mistral AI"
  "GITLAB_PERSONAL_ACCESS_TOKEN:GitLab MCP"
)

for entry in "${api_keys[@]}"; do
  IFS=':' read -r key label <<< "$entry"
  local status="❌ Missing"
  local color="${RED}"

  if has_api_key "$key"; then
    status="✅ Set"
    color="${GREEN}"
  fi

  print_kv "$label" "$status" 76 "${CYAN}" "$color"
done

# Configuration files
print_box_line "$BOX_VR" "$BOX_H" "$BOX_VL"
print_centered "CONFIGURATION FILES" 76 "${BOLD}${BLUE}"
print_box_line "$BOX_VR" "$BOX_H" "$BOX_VL"

config_files=(
  "${SECRETS_FILE}:Agent Secrets"
  "${SETTINGS_FILE}:Agent Settings"
  "${ROOT_DIR}/.cursor/mcp.json:Cursor MCP"
  "${HOME}/.config/claude/fastmcp.json:FastMCP Config"
  "${ROOT_DIR}/CLAUDE.md:Claude Instructions"
  "${ROOT_DIR}/AGENTS.md:Agent Workflow"
)

for entry in "${config_files[@]}"; do
  IFS=':' read -r file label <<< "$entry"
  local status="❌ Missing"
  local color="${RED}"

  if [[ -f "$file" ]] || [[ -d "$file" ]]; then
    status="✅ Exists"
    color="${GREEN}"
  fi

  print_kv "$label" "$status" 76 "${CYAN}" "$color"
done

# Git stats
print_box_line "$BOX_VR" "$BOX_H" "$BOX_VL"
print_centered "REPOSITORY STATUS" 76 "${BOLD}${BLUE}"
print_box_line "$BOX_VR" "$BOX_H" "$BOX_VL"

cd "$ROOT_DIR"
branch=$(git branch --show-current)
uncommitted=$(git status --porcelain | wc -l)
unpushed=$(git log @{u}.. --oneline 2>/dev/null | wc -l || echo "0")

print_kv "Current Branch" "$branch" 76 "${CYAN}" "${MAGENTA}"
print_kv "Uncommitted Changes" "$uncommitted files" 76 "${CYAN}" "${YELLOW}"
print_kv "Unpushed Commits" "$unpushed commits" 76 "${CYAN}" "${YELLOW}"

# Recent activity (last 5 commits)
print_box_line "$BOX_VR" "$BOX_H" "$BOX_VL"
print_centered "RECENT COMMITS (Last 5)" 76 "${BOLD}${BLUE}"
print_box_line "$BOX_VR" "$BOX_H" "$BOX_VL"

git log -5 --pretty=format:"${CYAN}${BOX_V}${NC} %h %s ${CYAN}${BOX_V}${NC}" | while IFS= read -r line; do
  echo -e "$line"
done

# Footer
print_box_line "$BOX_BL" "$BOX_H" "$BOX_BR"
echo ""
echo -e "${CYAN}💡 Quick Commands:${NC}"
echo -e "  ${YELLOW}pnpm run agent:validate${NC}  - Validate all checks"
echo -e "  ${YELLOW}pnpm run agent:fix${NC}      - Auto-fix issues"
echo -e "  ${YELLOW}pnpm run agent:check${NC}    - Full workspace check"
echo -e "  ${YELLOW}./scripts/agent-install.sh${NC} - Install agent configs"
echo ""
