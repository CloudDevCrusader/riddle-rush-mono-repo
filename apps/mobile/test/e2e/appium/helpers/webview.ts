import type { Browser } from 'webdriverio'

function appiumContextId(c: unknown): string {
  if (typeof c === 'string') return c
  if (
    c !== null &&
    typeof c === 'object' &&
    'id' in c &&
    typeof (c as { id: unknown }).id === 'string'
  ) {
    return (c as { id: string }).id
  }
  return ''
}

/**
 * Capacitor loads the Nuxt app in a system WebView. Native context is `NATIVE_APP`;
 * DOM selectors work only after switching to a `WEBVIEW_*` context.
 */
export async function switchToCapacitorWebView(browser: Browser): Promise<void> {
  await browser.waitUntil(
    async () => {
      const contexts = await browser.getAppiumContexts()
      return contexts.some((c) => appiumContextId(c).includes('WEBVIEW'))
    },
    {
      timeout: 120_000,
      timeoutMsg: 'Timed out waiting for a WEBVIEW context (Capacitor WebView)',
    }
  )

  const contexts = await browser.getAppiumContexts()
  const webview = contexts.find((c) => appiumContextId(c).includes('WEBVIEW'))
  if (webview === undefined) {
    const labels = contexts.map((c) => appiumContextId(c)).join(', ')
    throw new Error(`No WEBVIEW in contexts: ${labels}`)
  }

  await browser.switchContext(appiumContextId(webview))
}
