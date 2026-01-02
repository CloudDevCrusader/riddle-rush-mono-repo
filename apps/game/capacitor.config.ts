import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.riddlerush.game',
  appName: 'Riddle Rush',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      keystorePath: process.env.ANDROID_KEYSTORE_PATH || undefined,
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD || undefined,
      keystoreAlias: process.env.ANDROID_KEYSTORE_ALIAS || undefined,
      keystoreAliasPassword: process.env.ANDROID_KEYSTORE_ALIAS_PASSWORD || undefined,
    },
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV !== 'production',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#667eea',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#667eea',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
}

export default config
