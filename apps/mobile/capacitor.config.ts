import type { CapacitorConfig } from '@capacitor/cli'

/** Matches PWA `theme_color` / game shell (`apps/game/nuxt.config.ts`). */
const BRAND_ORANGE = '#ff6b35'

const config: CapacitorConfig = {
  appId: 'com.riddlerush.game',
  appName: 'Riddle Rush',
  webDir: '../game/.output/public',
  /** Logs in debug builds only; avoids noisy native logs in release APK/AAB. */
  loggingBehavior: 'debug',
  backgroundColor: BRAND_ORANGE,
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  android: {
    /** Default Gradle product flavor (`play` = ARM-only; use `universal` for all ABIs). */
    flavor: 'play',
    buildOptions: {
      keystorePath: process.env.ANDROID_KEYSTORE_PATH || undefined,
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD || undefined,
      keystoreAlias: process.env.ANDROID_KEYSTORE_ALIAS || undefined,
      keystoreAliasPassword: process.env.ANDROID_KEYSTORE_ALIAS_PASSWORD || undefined,
      releaseType: 'AAB',
    },
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV !== 'production',
    backgroundColor: BRAND_ORANGE,
    /** Keep service worker / PWA routing on the Capacitor bridge (default). */
    resolveServiceWorkerRequests: true,
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: false,
    webContentsDebuggingEnabled: process.env.NODE_ENV !== 'production',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: BRAND_ORANGE,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: BRAND_ORANGE,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
}

export default config
