#!/usr/bin/env bash
# -------------------------------------------------------------------
# android-run.sh — Run the Riddle Rush app on an Android device/emulator
#
# Usage:
#   ./scripts/android-run.sh [--target <device-id>]
#
# This script sets up JAVA_HOME and ANDROID_HOME (via SDKMAN if
# available), then delegates to `npx cap run android`.
#
# Environment:
#   ANDROID_HOME  — Android SDK path (default: ~/Library/Android/sdk)
#   JAVA_HOME     — JDK path (auto-detected via SDKMAN if available)
# -------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GAME_DIR="$PROJECT_ROOT/apps/game"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[info]${NC}  $*"; }
ok()    { echo -e "${GREEN}[ok]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[warn]${NC}  $*"; }
error() { echo -e "${RED}[error]${NC} $*" >&2; }
die()   { error "$@"; exit 1; }

# --- Environment setup ---

# SDKMAN Java (if available)
if [[ -f "$HOME/.sdkman/bin/sdkman-init.sh" ]]; then
  set +u
  source "$HOME/.sdkman/bin/sdkman-init.sh"
  set -u
fi

# Java
if [[ -z "${JAVA_HOME:-}" ]]; then
  if command -v java &>/dev/null; then
    JAVA_HOME="$(/usr/libexec/java_home 2>/dev/null || true)"
  fi
fi
[[ -n "${JAVA_HOME:-}" ]] || die "JAVA_HOME not set and no JDK found. Install via: sdk install java 21.0.6-zulu"
export JAVA_HOME
info "JAVA_HOME=$JAVA_HOME"

# Android SDK
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
[[ -d "$ANDROID_HOME" ]] || die "Android SDK not found at $ANDROID_HOME"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
info "ANDROID_HOME=$ANDROID_HOME"

# --- Preflight checks ---
command -v pnpm &>/dev/null || die "pnpm not found"
[[ -d "$GAME_DIR" ]] || die "Game app not found at $GAME_DIR"
[[ -d "$GAME_DIR/android" ]] || die "Android platform not found. Run: cd apps/game && npx cap add android"

ok "Environment ready"

# --- Sync web assets ---
cd "$GAME_DIR"
info "Syncing web assets to Android..."
npx cap copy android
npx cap update android
ok "Capacitor sync complete"

# --- Remove pre-compressed files ---
# Nuxt/Vite generates .gz and .br variants for web servers.
# Android's asset merger treats file.js and file.js.gz as duplicates — build fails.
# These are useless in a WebView, so strip them before Gradle runs.
ASSETS_DIR="$GAME_DIR/android/app/src/main/assets/public"
if [[ -d "$ASSETS_DIR" ]]; then
  GZ_COUNT=$(find "$ASSETS_DIR" \( -name "*.gz" -o -name "*.br" \) | wc -l | tr -d ' ')
  if [[ "$GZ_COUNT" -gt 0 ]]; then
    find "$ASSETS_DIR" -name "*.gz" -delete
    find "$ASSETS_DIR" -name "*.br" -delete
    ok "Removed $GZ_COUNT pre-compressed files (.gz/.br)"
  fi
fi

# --- Run (skip sync since we already did it above) ---
info "Running on Android device/emulator..."
npx cap run android --no-sync "$@"
