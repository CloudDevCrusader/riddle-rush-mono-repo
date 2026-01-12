#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE_DIR="${ROOT_DIR}/docs/setup/agent-configs"

usage() {
  cat <<'EOF'
Usage:
  scripts/setup-agent-configs.sh <agent> [--dest <path>] [--dry-run]

Agents:
  opencode
  kilocode

Environment variables (used when --dest is not provided):
  OPENCODE_PERPLEXITY_CONFIG
  KILOCODE_PERPLEXITY_CONFIG

Examples:
  scripts/setup-agent-configs.sh opencode --dest "$HOME/.config/opencode/perplexity.json"
  OPENCODE_PERPLEXITY_CONFIG="$HOME/.config/opencode/perplexity.json" \
    scripts/setup-agent-configs.sh opencode
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

agent="$1"
shift

dest=""
dry_run=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dest)
      dest="${2:-}"
      shift 2
      ;;
    --dry-run)
      dry_run=1
      shift
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

case "$agent" in
  opencode)
    template="${TEMPLATE_DIR}/opencode.perplexity.json"
    default_env="${OPENCODE_PERPLEXITY_CONFIG:-}"
    ;;
  kilocode)
    template="${TEMPLATE_DIR}/kilocode.perplexity.json"
    default_env="${KILOCODE_PERPLEXITY_CONFIG:-}"
    ;;
  *)
    echo "Unknown agent: ${agent}" >&2
    usage
    exit 1
    ;;
esac

if [[ ! -f "$template" ]]; then
  echo "Missing template: ${template}" >&2
  exit 1
fi

if [[ -z "$dest" ]]; then
  dest="$default_env"
fi

if [[ -z "$dest" ]]; then
  echo "Destination path is required. Use --dest or set the agent env var." >&2
  exit 1
fi

if [[ -z "${PERPLEXITY_API_KEY:-}" ]]; then
  echo "Warning: PERPLEXITY_API_KEY is not set in the environment." >&2
fi

if [[ "$dry_run" -eq 1 ]]; then
  echo "Dry run: would copy ${template} -> ${dest}"
  exit 0
fi

mkdir -p "$(dirname "$dest")"
cp "$template" "$dest"
echo "Copied ${template} -> ${dest}"
