import {
  d as i,
  A as l,
  B as s,
  Z as _,
  $ as m,
  C as a,
  D as d,
  R as g,
  X as p,
  a3 as u,
  a6 as v,
  l as f,
  m as h,
  _ as k,
} from './BRqkcXJS.js'
const w = { key: 0, class: 'game-scroll-list__rank' },
  y = {
    key: 0,
    class: 'game-scroll-list__crown game-scroll-list__crown--gold',
    viewBox: '0 0 24 24',
    'aria-label': '1st place',
  },
  L = {
    key: 1,
    class: 'game-scroll-list__crown game-scroll-list__crown--silver',
    viewBox: '0 0 24 24',
    'aria-label': '2nd place',
  },
  B = {
    key: 2,
    class: 'game-scroll-list__crown game-scroll-list__crown--bronze',
    viewBox: '0 0 24 24',
    'aria-label': '3rd place',
  },
  H = { key: 3, class: 'game-scroll-list__badge' },
  b = { class: 'game-scroll-list__content' },
  z = i({
    __name: 'GameScrollList',
    props: { showRanks: { type: Boolean, default: !1 }, maxHeight: { default: '400px' } },
    setup(o) {
      const n = o,
        c = h(() => ({ maxHeight: n.maxHeight }))
      return (r, e) => (
        l(),
        s(
          'div',
          { class: 'game-scroll-list', style: v(f(c)), tabindex: '0', role: 'list' },
          [
            (l(!0),
            s(
              _,
              null,
              m(
                r.$slots.default?.(),
                (C, t) => (
                  l(),
                  s('div', { key: t, class: 'game-scroll-list__row', role: 'listitem' }, [
                    o.showRanks
                      ? (l(),
                        s('div', w, [
                          t === 0
                            ? (l(),
                              s('svg', y, [
                                ...(e[0] ||
                                  (e[0] = [
                                    a(
                                      'path',
                                      {
                                        d: 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 4h14v2H5v-2z',
                                        fill: 'currentColor',
                                      },
                                      null,
                                      -1
                                    ),
                                  ])),
                              ]))
                            : t === 1
                              ? (l(),
                                s('svg', L, [
                                  ...(e[1] ||
                                    (e[1] = [
                                      a(
                                        'path',
                                        {
                                          d: 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 4h14v2H5v-2z',
                                          fill: 'currentColor',
                                        },
                                        null,
                                        -1
                                      ),
                                    ])),
                                ]))
                              : t === 2
                                ? (l(),
                                  s('svg', B, [
                                    ...(e[2] ||
                                      (e[2] = [
                                        a(
                                          'path',
                                          {
                                            d: 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 4h14v2H5v-2z',
                                            fill: 'currentColor',
                                          },
                                          null,
                                          -1
                                        ),
                                      ])),
                                  ]))
                                : (l(), s('div', H, d(Number(t) + 1), 1)),
                        ]))
                      : g('', !0),
                    a('div', b, [(l(), p(u(r.$slots.default?.()?.[t])))]),
                  ])
                )
              ),
              128
            )),
          ],
          4
        )
      )
    },
  }),
  S = Object.assign(k(z, [['__scopeId', 'data-v-788d54aa']]), { __name: 'GameScrollList' })
export { S as _ }
