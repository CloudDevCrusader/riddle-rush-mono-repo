import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const mobileRoot = join(__dirname, '../../..')
const defaultApk = join(mobileRoot, 'android/app/build/outputs/apk/play/debug/app-play-debug.apk')

export const config = {
  runner: 'local',
  specs: ['./specs/**/*.ts'],
  maxInstances: 1,

  hostname: '127.0.0.1',
  port: 4723,

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.APPIUM_DEVICE_NAME ?? 'Android Emulator',
      'appium:app': process.env.ANDROID_APP ?? defaultApk,
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
      'appium:waitForIdleTimeout': 100,
    },
  ],

  services: [
    [
      'appium',
      {
        command: 'appium',
        args: {
          allowInsecure: ['chromedriver_autodownload'],
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
