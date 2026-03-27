#!/usr/bin/env bash
# -------------------------------------------------------------------
# mobile-run.sh — Run the Riddle Rush app on a device/emulator
#
# Usage:
#   ./scripts/mobile-run.sh <platform> [--target <device-id>]
#
# Examples:
#   ./scripts/mobile-run.sh android
#   ./scripts/mobile-run.sh ios
#   ./scripts/mobile-run.sh android --target emulator-5554
#
# Environment:
#   ANDROID_HOME  — Android SDK path (default: ~/Library/Android/sdk)
#   JAVA_HOME     — JDK path (auto-detected via SDKMAN if available)
# -------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GAME_DIR="$PROJECT_ROOT/apps/game"
MOBILE_DIR="$PROJECT_ROOT/apps/mobile"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[info]${NC}  $*"; }
ok() { echo -e "${GREEN}[ok]${NC}    $*"; }
warn() { echo -e "${YELLOW}[warn]${NC}  $*"; }
error() { echo -e "${RED}[error]${NC} $*" >&2; }
die() {
	error "$@"
	exit 1
}

# --- Parse arguments ---
PLATFORM="${1:-}"
shift || true

if [[ -z $PLATFORM ]]; then
	die "Platform required. Usage: $0 <android|ios> [--target <device-id>]"
fi

if [[ $PLATFORM != "android" && $PLATFORM != "ios" ]]; then
	die "Unknown platform: $PLATFORM (expected 'android' or 'ios')"
fi

# --- Environment setup ---

# SDKMAN Java (if available)
if [[ -f "$HOME/.sdkman/bin/sdkman-init.sh" ]]; then
	set +u
	source "$HOME/.sdkman/bin/sdkman-init.sh"
	set -u
fi

if [[ $PLATFORM == "android" ]]; then
	# Java
	if [[ -z ${JAVA_HOME-} ]]; then
		if command -v java &>/dev/null; then
			JAVA_HOME="$(/usr/libexec/java_home 2>/dev/null || true)"
		fi
	fi
	[[ -n ${JAVA_HOME-} ]] || die "JAVA_HOME not set and no JDK found. Install via: sdk install java 21.0.6-zulu"
	export JAVA_HOME
	info "JAVA_HOME=$JAVA_HOME"

	# Android SDK
	export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
	[[ -d $ANDROID_HOME ]] || die "Android SDK not found at $ANDROID_HOME"
	export ANDROID_SDK_ROOT="$ANDROID_HOME"
	info "ANDROID_HOME=$ANDROID_HOME"
fi

# --- Preflight checks ---
command -v pnpm &>/dev/null || die "pnpm not found"
[[ -d $GAME_DIR ]] || die "Game app not found at $GAME_DIR"
[[ -d $MOBILE_DIR ]] || die "Mobile app not found at $MOBILE_DIR"

PLATFORM_DIR="$MOBILE_DIR/$PLATFORM"
[[ -d $PLATFORM_DIR ]] || die "$PLATFORM platform not found. Run: cd apps/mobile && npx cap add $PLATFORM"

ok "Environment ready"

# --- Sync web assets ---
cd "$MOBILE_DIR"
info "Syncing web assets to $PLATFORM..."
npx cap copy "$PLATFORM"
npx cap update "$PLATFORM"
ok "Capacitor sync complete"

# --- Remove pre-compressed files ---
# Nuxt/Vite generates .gz and .br variants for web servers.
# Android's asset merger treats file.js and file.js.gz as duplicates — build fails.
# These are useless in a WebView, so strip them before native build runs.
if [[ $PLATFORM == "android" ]]; then
	ASSETS_DIR="$PLATFORM_DIR/app/src/main/assets/public"
else
	ASSETS_DIR="$PLATFORM_DIR/App/App/public"
fi
if [[ -d $ASSETS_DIR ]]; then
	GZ_COUNT=$(find "$ASSETS_DIR" \( -name "*.gz" -o -name "*.br" \) | wc -l | tr -d ' ')
	if [[ $GZ_COUNT -gt 0 ]]; then
		find "$ASSETS_DIR" -name "*.gz" -delete
		find "$ASSETS_DIR" -name "*.br" -delete
		ok "Removed $GZ_COUNT pre-compressed files (.gz/.br)"
	fi
fi

# --- Run (skip sync since we already did it above) ---
info "Running on $PLATFORM device/emulator..."
npx cap run "$PLATFORM" --no-sync "$@"
