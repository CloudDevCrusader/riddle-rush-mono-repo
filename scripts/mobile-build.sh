#!/usr/bin/env bash
# -------------------------------------------------------------------
# mobile-build.sh — Build the Riddle Rush mobile app (Android/iOS)
#
# Usage:
#   ./scripts/mobile-build.sh <platform> [debug|release] [--apk|--aab]
#
# Examples:
#   ./scripts/mobile-build.sh android                # debug APK (default)
#   ./scripts/mobile-build.sh android debug          # debug APK
#   ./scripts/mobile-build.sh android release        # release AAB (signed)
#   ./scripts/mobile-build.sh android release --apk  # release APK (signed)
#   ./scripts/mobile-build.sh ios                    # debug build
#   ./scripts/mobile-build.sh ios release            # release build
#
# Environment:
#   ANDROID_HOME        — Android SDK path (default: ~/Library/Android/sdk)
#   JAVA_HOME           — JDK path (auto-detected via SDKMAN if available)
#   ANDROID_KEYSTORE_PATH     — Keystore for Android release signing
#   ANDROID_KEYSTORE_PASSWORD — Keystore password
#   ANDROID_KEYSTORE_ALIAS    — Key alias
#   ANDROID_KEYSTORE_ALIAS_PASSWORD — Key alias password
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
BUILD_TYPE="${2:-debug}"
OUTPUT_FORMAT="${3:---apk}"

if [[ -z $PLATFORM ]]; then
	die "Platform required. Usage: $0 <android|ios> [debug|release]"
fi

if [[ $PLATFORM != "android" && $PLATFORM != "ios" ]]; then
	die "Unknown platform: $PLATFORM (expected 'android' or 'ios')"
fi

if [[ $BUILD_TYPE != "debug" && $BUILD_TYPE != "release" ]]; then
	die "Unknown build type: $BUILD_TYPE (expected 'debug' or 'release')"
fi

# Release defaults to AAB (Google Play format) for Android, debug defaults to APK
if [[ $PLATFORM == "android" && $BUILD_TYPE == "release" && $OUTPUT_FORMAT != "--apk" ]]; then
	OUTPUT_FORMAT="--aab"
fi

# --- Environment setup ---

# SDKMAN Java (if available)
if [[ -f "$HOME/.sdkman/bin/sdkman-init.sh" ]]; then
	set +u
	source "$HOME/.sdkman/bin/sdkman-init.sh"
	set -u
fi

# Java (required for Android)
if [[ $PLATFORM == "android" ]]; then
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
info "Checking prerequisites..."

command -v pnpm &>/dev/null || die "pnpm not found"
[[ -d $GAME_DIR ]] || die "Game app not found at $GAME_DIR"
[[ -d $MOBILE_DIR ]] || die "Mobile app not found at $MOBILE_DIR"

PLATFORM_DIR="$MOBILE_DIR/$PLATFORM"
if [[ ! -d $PLATFORM_DIR ]]; then
	die "$PLATFORM platform not found. Run: cd apps/mobile && npx cap add $PLATFORM"
fi

if [[ $PLATFORM == "android" && $BUILD_TYPE == "release" ]]; then
	if [[ -z ${ANDROID_KEYSTORE_PATH-} ]]; then
		warn "No ANDROID_KEYSTORE_PATH set — release build will be unsigned"
	fi
fi

ok "Prerequisites OK"

# --- Step 1: Generate static Nuxt app ---
# Must use 'generate' (not 'build') — Capacitor needs a static index.html in webDir.
info "Generating static Nuxt app..."
cd "$GAME_DIR"
pnpm generate
ok "Nuxt generate complete"

# --- Step 2: Sync to native platform ---
info "Syncing web assets to $PLATFORM..."
cd "$MOBILE_DIR"
npx cap sync "$PLATFORM"
ok "Capacitor sync complete"

# --- Step 2.5: Remove pre-compressed files (Android only) ---
# Nuxt/Vite generates .gz and .br variants for web server optimization.
# Android's asset merger treats file.js and file.js.gz as duplicates, causing build failure.
# These files are useless in a WebView — strip them before Gradle/Xcode runs.
if [[ $PLATFORM == "android" ]]; then
	ASSETS_DIR="$PLATFORM_DIR/app/src/main/assets/public"
else
	ASSETS_DIR="$PLATFORM_DIR/App/App/public"
fi
if [[ -d $ASSETS_DIR ]]; then
	GZ_COUNT=$(find "$ASSETS_DIR" -name "*.gz" -o -name "*.br" | wc -l | tr -d ' ')
	if [[ $GZ_COUNT -gt 0 ]]; then
		find "$ASSETS_DIR" -name "*.gz" -delete
		find "$ASSETS_DIR" -name "*.br" -delete
		ok "Removed $GZ_COUNT pre-compressed files (.gz/.br)"
	fi
fi

# --- Step 3: Platform-specific build ---
if [[ $PLATFORM == "android" ]]; then
	info "Building Android $BUILD_TYPE ($OUTPUT_FORMAT)..."
	cd "$PLATFORM_DIR"

	# Determine Gradle task
	if [[ $BUILD_TYPE == "debug" ]]; then
		GRADLE_TASK="assembleDebug"
	elif [[ $OUTPUT_FORMAT == "--aab" ]]; then
		GRADLE_TASK="bundleRelease"
	else
		GRADLE_TASK="assembleRelease"
	fi

	GRADLE_ARGS=(--no-daemon)
	if [[ -n ${CI-} ]]; then
		GRADLE_ARGS+=(--stacktrace --warning-mode all)
	fi

	./gradlew "$GRADLE_TASK" "${GRADLE_ARGS[@]}"

	# --- Locate output ---
	echo ""
	ok "Build complete!"
	echo ""

	if [[ $BUILD_TYPE == "debug" ]]; then
		APK_PATH="$PLATFORM_DIR/app/build/outputs/apk/debug/app-debug.apk"
		if [[ -f $APK_PATH ]]; then
			SIZE=$(du -h "$APK_PATH" | cut -f1)
			ok "APK: $APK_PATH ($SIZE)"
		fi
	elif [[ $OUTPUT_FORMAT == "--aab" ]]; then
		AAB_PATH="$PLATFORM_DIR/app/build/outputs/bundle/release/app-release.aab"
		if [[ -f $AAB_PATH ]]; then
			SIZE=$(du -h "$AAB_PATH" | cut -f1)
			ok "AAB: $AAB_PATH ($SIZE)"
		fi
	else
		APK_PATH="$PLATFORM_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
		if [[ -f $APK_PATH ]]; then
			SIZE=$(du -h "$APK_PATH" | cut -f1)
			ok "APK: $APK_PATH ($SIZE)"
		fi
	fi

	# --- Install hint ---
	if [[ $BUILD_TYPE == "debug" ]]; then
		echo ""
		info "To install on a connected device:"
		echo "  adb install -r $APK_PATH"
		echo "  — or —"
		echo "  cd apps/mobile && npx cap run android"
	fi

elif [[ $PLATFORM == "ios" ]]; then
	info "Building iOS $BUILD_TYPE..."

	if ! command -v xcodebuild &>/dev/null; then
		die "Xcode Command Line Tools not found. Install Xcode from the App Store."
	fi

	cd "$PLATFORM_DIR/App"

	if [[ $BUILD_TYPE == "debug" ]]; then
		xcodebuild -project App.xcodeproj \
			-scheme App \
			-configuration Debug \
			-destination 'generic/platform=iOS Simulator' \
			-derivedDataPath build \
			build
	else
		xcodebuild -project App.xcodeproj \
			-scheme App \
			-configuration Release \
			-destination 'generic/platform=iOS' \
			-derivedDataPath build \
			-allowProvisioningUpdates \
			build
	fi

	echo ""
	ok "iOS build complete!"
	echo ""
	info "To run on simulator:"
	echo "  cd apps/mobile && npx cap run ios"
	echo "  — or —"
	echo "  cd apps/mobile && npx cap open ios  (opens Xcode)"
fi
