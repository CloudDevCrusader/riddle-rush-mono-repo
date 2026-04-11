/**
 * Dev-only: measure GameButton layout vs parents for alignment debugging (session 157a4d).
 */
export default defineNuxtPlugin((nuxtApp) => {
  // #region agent log
  if (!import.meta.dev) return

  const ENDPOINT = 'http://127.0.0.1:7415/ingest/610fa15c-6243-4b1c-b501-22abb9c42dd5'
  const SESSION = '157a4d'
  const router = useRouter()

  const send = (payload: Record<string, unknown>) => {
    fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': SESSION,
      },
      body: JSON.stringify({
        sessionId: SESSION,
        timestamp: Date.now(),
        runId: 'align-responsive-320',
        ...payload,
      }),
    }).catch(() => {})
  }

  const measureButtons = () => {
    const root = document.querySelector('#__nuxt') ?? document.body
    const buttons = root.querySelectorAll<HTMLElement>('.game-button')
    const entries: Record<string, unknown>[] = []

    buttons.forEach((el, index) => {
      const r = el.getBoundingClientRect()
      const parent = el.parentElement
      const pr = parent?.getBoundingClientRect()
      const testId = el.getAttribute('data-testid') ?? ''
      entries.push({
        hypothesisId: 'H1-H5',
        index,
        testId,
        w: Math.round(r.width),
        h: Math.round(r.height),
        parentTag: parent?.tagName ?? '',
        parentClass: parent?.className?.toString?.().slice(0, 120) ?? '',
        parentW: pr ? Math.round(pr.width) : null,
        deltaParentMinusBtn: pr ? Math.round(pr.width - r.width) : null,
        fullWidth: el.classList.contains('game-button--full-width'),
      })
    })

    const groupSelectors = [
      '.leaderboard-page__actions',
      '.leaderboard-action-shelf',
      '.decision-content__actions',
      '.menu-buttons',
      '.menu-panel',
      '.menu-shelf',
      '.players-action-shelf',
      '.quit-actions',
      '.pause-actions',
      '.scoring-page__column',
      '.scoring-page__list',
    ]

    const groups: Record<string, unknown>[] = []
    for (const sel of groupSelectors) {
      const el = root.querySelector<HTMLElement>(sel)
      if (!el) continue
      const gr = el.getBoundingClientRect()
      const childBtns = el.querySelectorAll<HTMLElement>('.game-button')
      const widths: number[] = []
      childBtns.forEach((b) => widths.push(Math.round(b.getBoundingClientRect().width)))
      groups.push({
        hypothesisId: 'H1-H5',
        selector: sel,
        containerW: Math.round(gr.width),
        buttonCount: childBtns.length,
        buttonWidths: widths,
        widthSpread: widths.length > 1 ? Math.max(...widths) - Math.min(...widths) : 0,
      })
    }

    const scoringCompare: Record<string, unknown> = {}
    const sp = root.querySelector<HTMLElement>('.scoring-page')
    const spl = root.querySelector<HTMLElement>('.scoring-page__list')
    const scol = root.querySelector<HTMLElement>('.scoring-page__column')
    const confirmEl = root.querySelector<HTMLElement>('[data-testid="confirm-scores"]')
    if (sp && spl && confirmEl) {
      scoringCompare.hypothesisId = 'H2-H3'
      scoringCompare.viewportW = typeof window !== 'undefined' ? window.innerWidth : null
      scoringCompare.scoringPageW = Math.round(sp.getBoundingClientRect().width)
      scoringCompare.scoringColumnW = scol ? Math.round(scol.getBoundingClientRect().width) : null
      scoringCompare.scoringListW = Math.round(spl.getBoundingClientRect().width)
      scoringCompare.confirmBtnW = Math.round(confirmEl.getBoundingClientRect().width)
      scoringCompare.listMinusConfirm = Math.round(
        spl.getBoundingClientRect().width - confirmEl.getBoundingClientRect().width
      )
    }

    send({
      hypothesisId: 'H1-H5',
      location: 'plugins/debug-button-align.client.ts:measureButtons',
      message: 'button-align-snapshot',
      data: {
        path: router.currentRoute.value.path,
        viewportW: typeof window !== 'undefined' ? window.innerWidth : null,
        buttonCount: entries.length,
        buttons: entries,
        groups,
        scoringCompare: Object.keys(scoringCompare).length > 0 ? scoringCompare : null,
      },
    })
  }

  const schedule = () => {
    nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(measureButtons)
      })
    })
  }

  nuxtApp.hook('page:finish', schedule)
  // #endregion
})
