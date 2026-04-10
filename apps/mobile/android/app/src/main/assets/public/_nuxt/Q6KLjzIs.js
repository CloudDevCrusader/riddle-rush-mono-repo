import {
  d as u,
  ao as f,
  A as o,
  Y as k,
  F as L,
  l as s,
  B as e,
  C as a,
  a7 as w,
  D as _,
  S as n,
  Z as y,
  _ as p,
  H as $,
  ar as B,
  E as h,
  as as x,
  a5 as C,
  v as S,
  i as G,
} from './BI8BVXPj.js'
import { u as V } from './Ufk1xTYU.js'
const A = { key: 0, class: 'global-loading-overlay' },
  D = ['src'],
  I = { class: 'loading-container' },
  N = { class: 'logo-container animate-fade-in' },
  O = ['src'],
  E = { key: 0, class: 'loading-bar-container animate-slide-up' },
  F = ['src'],
  P = { class: 'loading-bar-wrapper' },
  j = ['src'],
  z = { class: 'loading-bar-track' },
  H = ['src'],
  M = { class: 'loading-percentage' },
  R = u({
    __name: 'GlobalLoading',
    setup(m) {
      const { getAssetPath: t } = f(),
        { isLoading: d, progress: i, showProgress: c } = V()
      return (g, l) => (
        o(),
        k(
          y,
          { name: 'fade-out' },
          {
            default: L(() => [
              s(d)
                ? (o(),
                  e('div', A, [
                    a(
                      'img',
                      {
                        src: s(t)('assets/splash/background.png'),
                        alt: 'Background',
                        class: 'splash-bg',
                        width: '1920',
                        height: '1080',
                      },
                      null,
                      8,
                      D
                    ),
                    a('div', I, [
                      a('div', N, [
                        a(
                          'img',
                          {
                            src: s(t)('assets/splash/LOGO.png'),
                            alt: 'Logo',
                            class: 'logo-image',
                            width: '512',
                            height: '512',
                          },
                          null,
                          8,
                          O
                        ),
                      ]),
                      s(c)
                        ? (o(),
                          e('div', E, [
                            a(
                              'img',
                              {
                                src: s(t)('assets/splash/LOADING_.png'),
                                alt: 'Loading',
                                class: 'loading-text',
                                width: '256',
                                height: '64',
                              },
                              null,
                              8,
                              F
                            ),
                            a('div', P, [
                              a(
                                'img',
                                {
                                  src: s(t)('assets/splash/loading-down.png'),
                                  alt: 'Loading bar background',
                                  class: 'loading-bar-bg-img',
                                  width: '512',
                                  height: '64',
                                },
                                null,
                                8,
                                j
                              ),
                              a('div', z, [
                                a(
                                  'img',
                                  {
                                    src: s(t)('assets/splash/loading-top.png'),
                                    alt: 'Loading bar fill',
                                    style: w({ clipPath: `inset(0 ${100 - s(i)}% 0 0)` }),
                                    class: 'loading-bar-fill-img',
                                    width: '512',
                                    height: '64',
                                  },
                                  null,
                                  12,
                                  H
                                ),
                              ]),
                            ]),
                            a('div', M, _(Math.round(s(i))) + '%', 1),
                          ]))
                        : n('', !0),
                    ]),
                  ]))
                : n('', !0),
            ]),
            _: 1,
          }
        )
      )
    },
  }),
  T = Object.assign(p(R, [['__scopeId', 'data-v-95284f49']]), { __name: 'GlobalLoading' }),
  W = { class: 'layout-container' },
  Y = { key: 0, class: 'connection-indicator' },
  Z = ['src'],
  q = { class: 'page-content' },
  J = { class: 'footer' },
  K = { key: 0, class: 'version-tag' },
  Q = u({
    __name: 'default',
    setup(m) {
      const t = S(),
        { isWebSocketEnabled: d } = $(),
        i = t.public.appVersion,
        c = t.public.environment,
        g = c === 'development',
        l = G(null)
      return (
        B('setBackground', (r) => {
          l.value = r
        }),
        (r, U) => {
          const v = x,
            b = T
          return (
            o(),
            e('div', W, [
              s(d) ? (o(), e('div', Y, [h(v)])) : n('', !0),
              s(l)
                ? (o(),
                  e(
                    'img',
                    {
                      key: 1,
                      src: s(l),
                      alt: 'Background',
                      class: 'page-bg',
                      width: '1920',
                      height: '1080',
                    },
                    null,
                    8,
                    Z
                  ))
                : n('', !0),
              a('div', q, [C(r.$slots, 'default', {}, void 0, !0)]),
              h(b),
              a('div', J, [
                g ? (o(), e('div', K, 'v' + _(s(i)) + ' (' + _(s(c)) + ')', 1)) : n('', !0),
              ]),
            ])
          )
        }
      )
    },
  }),
  as = p(Q, [['__scopeId', 'data-v-cca22409']])
export { as as default }
