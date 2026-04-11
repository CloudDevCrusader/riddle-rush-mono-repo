import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

function resolveAndroidSdkRoot(): string | undefined {
  const fromEnv = process.env.ANDROID_HOME?.trim() || process.env.ANDROID_SDK_ROOT?.trim()
  if (fromEnv) {
    return fromEnv
  }
  const home = homedir()
  const candidates = [join(home, 'Library/Android/sdk'), join(home, 'Android/Sdk')]
  for (const root of candidates) {
    if (existsSync(join(root, 'platform-tools', 'adb'))) {
      return root
    }
  }
  return undefined
}

/**
 * UiAutomator2 needs ANDROID_HOME / ANDROID_SDK_ROOT. IDE and non-login shells
 * often omit them; default install locations cover most local dev setups.
 */
function ensureAndroidSdkEnv(): void {
  if (process.env.ANDROID_HOME?.trim() || process.env.ANDROID_SDK_ROOT?.trim()) {
    return
  }
  const root = resolveAndroidSdkRoot()
  if (root) {
    process.env.ANDROID_HOME = root
    process.env.ANDROID_SDK_ROOT = root
  }
}

/**
 * Fail fast with a clear message instead of long Appium session retries.
 * Set APPIUM_SKIP_DEVICE_CHECK=1 to skip (e.g. remote cloud sessions).
 */
function assertAndroidDeviceConnected(): void {
  if (process.env.APPIUM_SKIP_DEVICE_CHECK === '1') {
    return
  }
  const root =
    process.env.ANDROID_HOME?.trim() ||
    process.env.ANDROID_SDK_ROOT?.trim() ||
    resolveAndroidSdkRoot()
  if (!root) {
    throw new Error(
      'Android SDK not found. Set ANDROID_HOME or install the SDK (e.g. via Android Studio). ' +
        'See https://developer.android.com/studio/command-line/variables'
    )
  }
  const adb = join(root, 'platform-tools', 'adb')
  let out: string
  try {
    out = execFileSync(adb, ['devices'], { encoding: 'utf8' })
  } catch {
    throw new Error(
      `Failed to run "${adb} devices". Check that Android SDK platform-tools is installed.`
    )
  }
  const hasDevice = out.split('\n').some((line) => /\tdevice\s*$/.test(line))
  if (!hasDevice) {
    throw new Error(
      'No Android device or emulator in the "device" state. Start an emulator (Device Manager) ' +
        'or connect a device with USB debugging, then check `adb devices`.'
    )
  }
}

ensureAndroidSdkEnv()

const __dirname = dirname(fileURLToPath(import.meta.url))
const mobileRoot = join(__dirname, '../../..')
/** Emulator / x86 AVDs need the universal flavor; `play` is ARM-only (real devices). */
const defaultApk = join(
  mobileRoot,
  'android/app/build/outputs/apk/universal/debug/app-universal-debug.apk'
)

function assertApkExists(apkPath: string): void {
  if (existsSync(apkPath)) {
    return
  }
  throw new Error(
    `APK not found: ${apkPath}\n` +
      'Build a universal debug APK for the emulator (x86/x86_64), then retry:\n' +
      '  pnpm android:build:universal\n' +
      '  — or —\n' +
      '  ./scripts/mobile-build.sh android debug --universal'
  )
}

function androidCapabilities(): Record<string, string | boolean | number> {
  const cap: Record<string, string | boolean | number> = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.APPIUM_DEVICE_NAME ?? 'Android Emulator',
    'appium:app': process.env.ANDROID_APP ?? defaultApk,
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:waitForIdleTimeout': 100,
  }
  const udid = process.env.APPIUM_UDID?.trim() || process.env.ANDROID_SERIAL?.trim()
  if (udid) {
    cap['appium:udid'] = udid
  }
  const platformVersion = process.env.ANDROID_PLATFORM_VERSION?.trim()
  if (platformVersion) {
    cap['appium:platformVersion'] = platformVersion
  }
  return cap
}

export const config = {
  runner: 'local',
  specs: ['./specs/**/*.ts'],
  maxInstances: 1,

  hostname: '127.0.0.1',
  port: 4723,

  onPrepare: () => {
    assertAndroidDeviceConnected()
    assertApkExists(process.env.ANDROID_APP?.trim() || defaultApk)
  },

  capabilities: [androidCapabilities()],

  services: [
    [
      'appium',
      {
        command: 'appium',
        args: {
          allowInsecure: 'uiautomator2:chromedriver_autodownload',
        },
        logPath: join(mobileRoot, 'logs/appium'),
      },
    ],
  ],

  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 180_000,
  },

  autoCompileOpts: {
    autoCompile: true,
  },
}
