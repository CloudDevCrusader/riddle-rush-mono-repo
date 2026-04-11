const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './U7uEtiGX.js',
      './D9TZGafa.js',
      './BI8BVXPj.js',
      './entry.B-y2DWH2.css',
      './GameButton.yKV7kv47.css',
      './D3QXmhki.js',
      './GameModal.AeKJw7gS.css',
      './CbjeSZOE.js',
      './CFwlYHw3.js',
      './Ufk1xTYU.js',
      './QhPvbTN-.js',
      './PauseModal.B5X3myC8.css',
      './CYm3Tuw5.js',
      './QuitModal.BsI4MwJ7.css',
    ])
) => i.map((i) => d[i])
import {
  d as ae,
  H as U,
  I as se,
  J as oe,
  K as ne,
  o as le,
  L as R,
  M as ie,
  z as re,
  A as u,
  B as c,
  C as t,
  l as e,
  D as l,
  N as de,
  O as ue,
  P as ce,
  Q as me,
  R as A,
  S as f,
  E as $,
  m as E,
  i as T,
  T as F,
  U as N,
  _ as ge,
} from './BI8BVXPj.js'
import { u as pe } from './CbjeSZOE.js'
import { u as _e } from './CFwlYHw3.js'
import { u as he, a as ve } from './QhPvbTN-.js'
import './Ufk1xTYU.js'
const ye = F(() =>
    N(
      () => import('./U7uEtiGX.js'),
      __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
      import.meta.url
    ).then((m) => m.default || m)
  ),
  be = F(() =>
    N(
      () => import('./CYm3Tuw5.js'),
      __vite__mapDeps([12, 1, 2, 3, 4, 5, 6, 7, 10, 13]),
      import.meta.url
    ).then((m) => m.default || m)
  ),
  fe = { class: 'game-page' },
  we = { class: 'game-header' },
  ke = ['src', 'alt'],
  xe = { class: 'round-indicator', 'data-testid': 'game-round-indicator' },
  Se = { class: 'round-text' },
  Ce = ['aria-label'],
  Ie = { class: 'game-container' },
  Pe = { class: 'category-panel', 'data-testid': 'game-category-info' },
  Re = ['src', 'alt'],
  Ae = { class: 'category-label' },
  Ee = { class: 'category-name' },
  Te = { class: 'letter-display', 'data-testid': 'game-letter-info' },
  Ve = { class: 'letter-value' },
  He = { key: 0, class: 'answer-input-section' },
  Le = { class: 'player-turn-indicator', 'data-testid': 'game-player-turn' },
  Me = { class: 'turn-label' },
  ze = { class: 'turn-name', 'data-testid': 'game-player-name' },
  Be = ['placeholder'],
  Ue = {
    type: 'submit',
    class: 'submit-answer-btn',
    'data-testid': 'game-submit-button',
    disabled: !1,
  },
  $e = { key: 1, class: 'skip-actions' },
  Fe = ['disabled'],
  Ne = { key: 1, class: 'all-submitted-message', 'data-testid': 'game-all-submitted' },
  De = { class: 'bottom-nav' },
  Ge = ['src', 'alt'],
  Ke = { class: 'next-text' },
  Oe = ae({
    __name: '[[gameId]]',
    setup(m) {
      const { baseUrl: w, toast: i, t: a, goHome: D } = pe(),
        { goToResults: V, goToPlayers: b, goToRoundStart: G } = _e(),
        {
          gameStore: r,
          currentCategory: k,
          currentLetter: H,
          currentRound: K,
          flowState: h,
          players: x,
          currentPlayerTurn: S,
          allPlayersSubmitted: v,
          hasActiveSession: L,
        } = he(),
        { isAnswerInputEnabled: C } = U(),
        I = se()
      ve()
      const { isInputFieldEnabled: O } = U(),
        Q = oe(),
        y = E(() => Q.params.gameId),
        n = T(''),
        g = T(!1),
        p = T(!1),
        M = (o) => {
          o.key === 'Escape' && !g.value && (g.value = !0)
        }
      ne(C, (o) => {
        o || (n.value = '')
      })
      const z = E(() => (K.value || 1).toString().padStart(2, '0')),
        B = () => {
          D()
        },
        Y = () => {
          L.value ? (p.value = !0) : B()
        },
        j = () => {
          ;((p.value = !1), B())
        },
        J = () => {
          ;((n.value = n.value.replace(/[<>]/g, '')),
            n.value.length > 50 && (n.value = n.value.slice(0, 50)))
        },
        P = async () => {
          const o = S.value
          if (o)
            try {
              const s = n.value.trim() || ''
              ;(await r.submitPlayerAnswer(o.id, s),
                s
                  ? i.success(a('game.answer_submitted', [o.name]))
                  : i.info(a('game.answer_skipped', [o.name])),
                (n.value = ''),
                v.value && i.info(a('game.all_submitted', 'All players have submitted!')))
            } catch (s) {
              ;(I.error('Error submitting answer:', s),
                i.error(a('game.error_submitting', 'Failed to submit answer')))
            }
        },
        W = async () => {
          const o = h.value
          if (x.value.length > 0 && !v.value && o !== 'round-complete' && o !== 'decision') {
            i.warning(a('game.wait_for_players', 'Please wait for all players to submit'))
            return
          }
          o === 'in-round' && v.value && r.transitionToRoundComplete()
          const _ = r.currentSession.value?.id ?? y.value
          _ ? V(_) : V()
        },
        q = () => {},
        X = () => {
          b()
        },
        Z = () => {}
      ;(le(async () => {
        if (y.value)
          try {
            let o = await r.loadSessionById(y.value)
            if (!o)
              for (
                let s = 0;
                s < 4 && (await r.loadFromDB(), (o = await r.loadSessionById(y.value)), !o);
                s++
              )
                await new Promise((_) => setTimeout(_, 150))
            if (!o) {
              ;(I.warn('No matching session for game route, redirecting to players setup', {
                gameId: y.value,
              }),
                i.error(a('game.error_loading', 'Failed to load game session')),
                R().forceHide(),
                b())
              return
            }
          } catch (o) {
            ;(I.error('Failed to load game session:', o),
              i.error(a('game.error_loading', 'Failed to load game session')),
              R().forceHide(),
              b())
            return
          }
        else if (!L.value) {
          ;(R().forceHide(), r.pendingPlayerNames.value.length > 0 ? await G() : await b())
          return
        }
        window.addEventListener('keydown', M)
      }),
        ie(() => {
          window.removeEventListener('keydown', M)
        }))
      const ee = E(() => `${a('game.page_title')} · ${a('game.round')} ${z.value}`)
      return (
        re({ title: ee, meta: [{ name: 'description', content: a('game.meta_description') }] }),
        (o, s) => {
          const _ = ye,
            te = be
          return (
            u(),
            c('div', fe, [
              s[6] || (s[6] = t('div', { class: 'game-bg' }, null, -1)),
              t('header', we, [
                t(
                  'button',
                  {
                    'data-testid': 'back-button',
                    class: 'game-back-btn game-back-btn--red tap-highlight no-select',
                    onClick: Y,
                  },
                  [
                    t(
                      'img',
                      {
                        src: `${e(w)}assets/alphabets/back.png`,
                        alt: e(a)('common.back'),
                        class: 'back-icon',
                        loading: 'eager',
                        width: '32',
                        height: '32',
                      },
                      null,
                      8,
                      ke
                    ),
                  ]
                ),
                t('div', xe, [t('span', Se, l(e(a)('game.round')) + ' ' + l(e(z)), 1)]),
                t(
                  'button',
                  {
                    class: 'pause-btn tap-highlight no-select',
                    'aria-label': e(a)('game.pause'),
                    'data-testid': 'game-pause-button',
                    onClick: s[0] || (s[0] = (d) => (g.value = !0)),
                  },
                  [
                    ...(s[5] ||
                      (s[5] = [
                        t(
                          'svg',
                          {
                            width: '32',
                            height: '32',
                            viewBox: '0 0 24 24',
                            fill: 'none',
                            stroke: 'currentColor',
                            'stroke-width': '3',
                            'stroke-linecap': 'round',
                            'stroke-linejoin': 'round',
                          },
                          [
                            t('rect', { x: '6', y: '4', width: '4', height: '16' }),
                            t('rect', { x: '14', y: '4', width: '4', height: '16' }),
                          ],
                          -1
                        ),
                      ])),
                  ],
                  8,
                  Ce
                ),
              ]),
              t('div', Ie, [
                t('div', Pe, [
                  t(
                    'img',
                    {
                      src: `${e(w)}assets/alphabets/CATEGORY.png`,
                      alt: e(a)('common.category'),
                      class: 'category-label-image',
                      loading: 'lazy',
                      width: '200',
                      height: '50',
                    },
                    null,
                    8,
                    Re
                  ),
                  t('div', Ae, l(e(a)('common.category').toUpperCase()), 1),
                  t(
                    'div',
                    Ee,
                    l(
                      e(k)
                        ? e(a)(`categories.${e(k).searchWord}`, e(k).name).toUpperCase()
                        : e(a)('common.loading')
                    ),
                    1
                  ),
                ]),
                t('div', Te, [t('span', Ve, l(e(H) ? e(H).toUpperCase() : 'A'), 1)]),
                e(x).length > 0 && e(S) && !e(v)
                  ? (u(),
                    c('div', He, [
                      t('div', Le, [
                        t('span', Me, l(e(a)('game.current_turn', 'Current Turn')) + ':', 1),
                        t('span', ze, l(e(S).name), 1),
                      ]),
                      e(O)
                        ? (u(),
                          c(
                            'form',
                            { key: 0, class: 'answer-form', onSubmit: de(P, ['prevent']) },
                            [
                              e(C)
                                ? ue(
                                    (u(),
                                    c(
                                      'input',
                                      {
                                        key: 0,
                                        'onUpdate:modelValue':
                                          s[1] || (s[1] = (d) => (A(n) ? (n.value = d) : null)),
                                        type: 'text',
                                        class: 'answer-input',
                                        'data-testid': 'game-answer-input',
                                        placeholder: e(a)('game.your_answer', 'Your answer…'),
                                        autocomplete: 'off',
                                        autocapitalize: 'words',
                                        maxlength: '50',
                                        inputmode: 'search',
                                        enterkeyhint: 'done',
                                        onInput: J,
                                        onKeyup: me(P, ['enter']),
                                      },
                                      null,
                                      40,
                                      Be
                                    )),
                                    [[ce, e(n)]]
                                  )
                                : f('', !0),
                              t(
                                'button',
                                Ue,
                                l(e(C) ? e(a)('game.submit', 'Submit') : e(a)('common.confirm')),
                                1
                              ),
                            ],
                            32
                          ))
                        : (u(),
                          c('div', $e, [
                            t(
                              'button',
                              {
                                class: 'skip-player-btn',
                                'data-testid': 'game-skip-button',
                                disabled: o.isSubmitting,
                                onClick: P,
                              },
                              l(e(a)('game.skip', 'Skip')),
                              9,
                              Fe
                            ),
                          ])),
                    ]))
                  : f('', !0),
                e(h) === 'round-complete' || e(h) === 'decision' || e(v)
                  ? (u(),
                    c('div', Ne, [
                      t('p', null, l(e(a)('game.all_submitted', 'All players have submitted!')), 1),
                    ]))
                  : f('', !0),
              ]),
              $(
                _,
                {
                  modelValue: e(g),
                  'onUpdate:modelValue': s[2] || (s[2] = (d) => (A(g) ? (g.value = d) : null)),
                  onResume: q,
                  onRestart: X,
                  onHome: Z,
                },
                null,
                8,
                ['modelValue']
              ),
              $(
                te,
                {
                  modelValue: e(p),
                  'onUpdate:modelValue': s[3] || (s[3] = (d) => (A(p) ? (p.value = d) : null)),
                  onConfirm: j,
                  onCancel: s[4] || (s[4] = (d) => (p.value = !1)),
                },
                null,
                8,
                ['modelValue']
              ),
              t('div', De, [
                e(h) === 'round-complete' || e(h) === 'decision' || e(x).length === 0
                  ? (u(),
                    c(
                      'button',
                      {
                        key: 0,
                        'data-testid': 'next-button',
                        class: 'next-btn btn-primary tap-highlight no-select',
                        onClick: W,
                      },
                      [
                        t(
                          'img',
                          {
                            src: `${e(w)}assets/alphabets/next.png`,
                            alt: e(a)('common.next'),
                            class: 'next-icon',
                            loading: 'lazy',
                          },
                          null,
                          8,
                          Ge
                        ),
                        t('span', Ke, l(e(a)('common.next')), 1),
                      ]
                    ))
                  : f('', !0),
              ]),
            ])
          )
        }
      )
    },
  }),
  qe = ge(Oe, [['__scopeId', 'data-v-20c5881b']])
export { qe as default }
