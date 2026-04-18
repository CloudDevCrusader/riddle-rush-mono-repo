/**
 * Debug session 0f751a — dev.riddlerush.de investigation (remove after confirmed fix).
 */
const DEBUG_HOSTS = new Set(['dev.riddlerush.de', 'localhost', '127.0.0.1']);

const STORAGE_KEY = 'debug-0f751a-ndjson';

function ingest(payload: Record<string, unknown>) {
  const body = {
    sessionId: '0f751a',
    timestamp: Date.now(),
    ...payload,
  };
  try {
    const prev = sessionStorage.getItem(STORAGE_KEY) ?? '';
    sessionStorage.setItem(STORAGE_KEY, `${prev}${JSON.stringify(body)}\n`);
  } catch {
    /* quota / private mode */
  }
  // #region agent log
  fetch('http://127.0.0.1:7389/ingest/13351822-2867-4ac8-a364-1e2043955fa6', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '0f751a',
    },
    body: JSON.stringify(body),
  }).catch(() => {});
  // #endregion
}

export default defineNuxtPlugin({
  name: '01-agent-debug-session',
  enforce: 'pre',
  setup(nuxtApp) {
    if (!import.meta.client) return;

    const host = window.location.hostname;
    if (!DEBUG_HOSTS.has(host)) return;

    const cfg = useRuntimeConfig().public;

    // Hypothesis A: stale service worker / precache serves wrong shell or chunks
    void (async () => {
      let sw: { hasController: boolean; scriptURL: string | null; scope: string | null } = {
        hasController: !!navigator.serviceWorker?.controller,
        scriptURL: navigator.serviceWorker?.controller?.scriptURL ?? null,
        scope: null,
      };
      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        sw = {
          ...sw,
          scope: reg?.scope ?? null,
          scriptURL: reg?.active?.scriptURL ?? sw.scriptURL,
        };
      } catch {
        /* ignore */
      }
      // #region agent log
      ingest({
        hypothesisId: 'A',
        location: '01.agent-debug-session.client.ts:sw',
        message: 'service worker state',
        data: { host, path: window.location.pathname, ...sw },
        runId: 'pre-fix',
      });
      // #endregion
    })();

    // Hypothesis B: runtime public config differs on dev (missing keys, wrong baseUrl)
    // #region agent log
    ingest({
      hypothesisId: 'B',
      location: '01.agent-debug-session.client.ts:config',
      message: 'runtime public config snapshot',
      data: {
        host,
        baseUrl: cfg?.baseUrl,
        keys:
          cfg && typeof cfg === 'object' ? Object.keys(cfg as Record<string, unknown>).sort() : [],
        hasGitlabUrl: cfg && 'gitlabFeatureFlagsUrl' in (cfg as object),
        hasGitlabToken: cfg && 'gitlabFeatureFlagsToken' in (cfg as object),
      },
      runId: 'pre-fix',
    });
    // #endregion

    // Hypothesis C: CSP meta blocks a resource on dev
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    // #region agent log
    ingest({
      hypothesisId: 'C',
      location: '01.agent-debug-session.client.ts:csp',
      message: 'CSP meta presence',
      data: {
        host,
        hasCspMeta: !!cspMeta,
        cspLen: cspMeta?.getAttribute('content')?.length ?? 0,
      },
      runId: 'pre-fix',
    });
    // #endregion

    // Hypothesis D: uncaught exception / rejection during boot
    window.addEventListener(
      'error',
      (ev) => {
        // #region agent log
        ingest({
          hypothesisId: 'D',
          location: '01.agent-debug-session.client.ts:window.error',
          message: 'window error',
          data: {
            host,
            msg: ev.message,
            filename: ev.filename,
            lineno: ev.lineno,
            colno: ev.colno,
          },
          runId: 'pre-fix',
        });
        // #endregion
      },
      true
    );
    window.addEventListener('unhandledrejection', (ev) => {
      const reason = ev.reason;
      // #region agent log
      ingest({
        hypothesisId: 'D',
        location: '01.agent-debug-session.client.ts:unhandledrejection',
        message: 'unhandled rejection',
        data: {
          host,
          reason:
            reason instanceof Error
              ? { name: reason.name, message: reason.message, stack: reason.stack?.slice(0, 500) }
              : String(reason).slice(0, 500),
        },
        runId: 'pre-fix',
      });
      // #endregion
    });

    // Hypothesis E: /api/flags or bootstrap fetch fails differently on dev
    void (async () => {
      const base = (cfg?.baseUrl as string | undefined) || '/';
      const normalized = base.endsWith('/') ? base : `${base}/`;
      const url = `${normalized}api/flags`;
      let status: number | null = null;
      let ok = false;
      try {
        const res = await fetch(url, { cache: 'no-store' });
        status = res.status;
        ok = res.ok;
      } catch (e) {
        // #region agent log
        ingest({
          hypothesisId: 'E',
          location: '01.agent-debug-session.client.ts:flags-fetch',
          message: 'api/flags fetch threw',
          data: {
            host,
            url,
            err: e instanceof Error ? e.message : String(e),
          },
          runId: 'pre-fix',
        });
        // #endregion
        return;
      }
      // #region agent log
      ingest({
        hypothesisId: 'E',
        location: '01.agent-debug-session.client.ts:flags-fetch',
        message: 'api/flags response',
        data: { host, url, status, ok },
        runId: 'pre-fix',
      });
      // #endregion
    })();

    nuxtApp.hook('app:mounted', () => {
      // #region agent log
      ingest({
        hypothesisId: 'B',
        location: '01.agent-debug-session.client.ts:mounted',
        message: 'app mounted',
        data: {
          host,
          nuxtInnerHTML: (document.getElementById('__nuxt')?.innerHTML?.length ?? 0) > 0,
        },
        runId: 'pre-fix',
      });
      // #endregion
    });
  },
});
