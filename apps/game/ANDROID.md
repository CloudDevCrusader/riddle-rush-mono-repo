# Android App Setup Guide

This guide explains how to build and deploy the Riddle Rush game as a native Android app using Capacitor.

## Prerequisites

1. **Node.js and pnpm**: Already set up in the monorepo
2. **Android Studio**: Download and install [Android Studio](https://developer.android.com/studio)
3. **Java Development Kit (JDK)**: Android Studio includes JDK 11+
4. **Android SDK**: Install via Android Studio's SDK Manager
   - Tools > SDK Manager
   - Install Android SDK Platform (API 34 or higher recommended)
   - Install Android SDK Build-Tools
   - Install Android SDK Command-line Tools

## Initial Setup

The Capacitor configuration is already set up. To initialize the Android platform:

**First, ensure you have built the app at least once:**

```bash
# From the monorepo root
cd apps/game
pnpm build
```

**Then add the Android platform** (first time only):

```bash
# From apps/game directory
npx cap add android
```

This creates the Android project. After that, you can use:

```bash
# From the monorepo root
pnpm android:sync
```

Or from the game app directory:

```bash
cd apps/game
pnpm android:sync
```

This will:

1. Build the Nuxt app
2. Sync the web assets to the Android project

## Building the Android App

### Development Build

1. **Build and sync the app**:

   ```bash
   pnpm android:sync
   ```

2. **Open in Android Studio**:

   ```bash
   pnpm android:open
   ```

3. **Run on device/emulator**:
   - In Android Studio, select a device/emulator
   - Click the "Run" button (▶️)
   - Or use the command line:
     ```bash
     pnpm android:run
     ```

### Production Build (APK/AAB)

1. **Create a keystore** (first time only):

   ```bash
   keytool -genkey -v -keystore riddlerush-release.keystore -alias riddlerush -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Set environment variables** (optional, for automated signing):

   ```bash
   export ANDROID_KEYSTORE_PATH=/path/to/riddlerush-release.keystore
   export ANDROID_KEYSTORE_PASSWORD=your_keystore_password
   export ANDROID_KEYSTORE_ALIAS=riddlerush
   export ANDROID_KEYSTORE_ALIAS_PASSWORD=your_alias_password
   ```

3. **Build the app**:

   ```bash
   pnpm android:sync
   pnpm android:open
   ```

4. **In Android Studio**:
   - Build > Generate Signed Bundle / APK
   - Select "Android App Bundle" (recommended for Play Store) or "APK"
   - Choose your keystore and enter credentials
   - Select release build variant
   - Click "Create"

   The signed APK/AAB will be generated in:
   - APK: `apps/game/android/app/release/app-release.apk`
   - AAB: `apps/game/android/app/release/app-release.aab`

## Available Scripts

### From Monorepo Root

- `pnpm android:sync` - Build the app and sync with Android project
- `pnpm android:open` - Open Android project in Android Studio
- `pnpm android:run` - Run the app on connected device/emulator

### From `apps/game` Directory

- `pnpm android:sync` - Build and sync
- `pnpm android:open` - Open in Android Studio
- `pnpm android:run` - Run on device
- `pnpm android:build` - Build, copy, and sync (for production)
- `pnpm capacitor:sync` - Sync all platforms
- `pnpm capacitor:copy` - Copy web assets to native projects

## Configuration

### App Information

Edit `apps/game/capacitor.config.ts` to customize:

- **App ID**: `com.riddlerush.game` (change package name in Android Studio)
- **App Name**: `Riddle Rush`
- **Web Directory**: `.output/public` (Nuxt output directory)

### Android-Specific Settings

The configuration includes:

- **Status Bar**: Dark style, purple background (#667eea)
- **Keyboard**: Auto-resize, dark style
- **Splash Screen**: 2-second display, purple background
- **Debugging**: Enabled in development, disabled in production

### Native Plugins

The following Capacitor plugins are included:

- **@capacitor/app**: App lifecycle events
- **@capacitor/haptics**: Vibration/haptic feedback
- **@capacitor/keyboard**: Keyboard management
- **@capacitor/status-bar**: Status bar styling

## Development Workflow

1. **Make changes to the web app** in `apps/game/`

2. **Rebuild and sync**:

   ```bash
   pnpm android:sync
   ```

3. **Test in Android Studio** or on a connected device

4. **For hot reload during development**, you can use:

   ```bash
   # Terminal 1: Start Nuxt dev server
   pnpm dev

   # Terminal 2: Run Capacitor with live reload
   npx cap run android -l --external
   ```

## Troubleshooting

### Build Errors

- **Gradle sync failed**: Make sure Android Studio is up to date and SDK is installed
- **Build tools not found**: Install Android SDK Build-Tools via SDK Manager
- **Java version mismatch**: Use JDK 11+ (included with Android Studio)

### App Not Updating

- Always run `pnpm android:sync` after making web app changes
- Clear Android Studio cache: File > Invalidate Caches / Restart
- Clean build: Build > Clean Project, then Build > Rebuild Project

### Device Not Detected

- Enable USB debugging on your Android device
- Install device drivers (usually auto-installed)
- Verify connection: `adb devices`

### Web Assets Not Loading

- Check that `webDir` in `capacitor.config.ts` points to `.output/public`
- Verify the Nuxt build completed successfully
- Check Android logcat for errors: View > Tool Windows > Logcat

## Publishing to Google Play Store

1. **Build a signed release bundle** (AAB format) as described above

2. **Test the release build** thoroughly on multiple devices

3. **Prepare store listing**:
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (at least 2, various device sizes)
   - App description and metadata

4. **Upload to Play Console**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app or select existing
   - Upload the AAB file
   - Complete store listing
   - Submit for review

5. **Update version** in:
   - `apps/game/package.json` (version field)
   - `apps/game/android/app/build.gradle` (versionCode, versionName)

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Android Developer Guide](https://developer.android.com/guide)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

## Notes

- The Android project is generated in `apps/game/android/` (ignored by git)
- Keystore files (`.keystore`, `.jks`) should never be committed to git
- Always test on real devices before publishing
- Keep Android Studio and SDK tools updated
