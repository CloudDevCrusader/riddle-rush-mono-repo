import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const mobileRoot = join(__dirname, '../../..')
const defaultApp = join(mobileRoot, 'ios/App/build/Build/Products/Debug-iphonesimulator/App.app')

export const config = {
  runner: 'local',
  specs: ['./specs/**/*.ts'],
  maxInstances: 1,

  hostname: '127.0.0.1',
  port: 4723,

  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': process.env.APPIUM_IOS_DEVICE ?? 'iPhone 16',
      'appium:platformVersion': process.env.IOS_PLATFORM_VERSION ?? '18.2',
      'appium:app': process.env.IOS_APP ?? defaultApp,
      'appium:autoAcceptAlerts': true,
      'appium:noReset': false,
    },
  ],

  services: [
    [
      'appium',
      {
        command: 'appium',
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
