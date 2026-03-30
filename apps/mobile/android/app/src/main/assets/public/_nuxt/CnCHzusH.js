import {
  d as Oe,
  o as Re,
  L as Ie,
  K as Pe,
  A as oe,
  X as Ce,
  an as De,
  E as _e,
  F as je,
  B as fe,
  C as ue,
  D as Be,
  R as de,
  a4 as Le,
  V as xe,
  l as Ge,
  M as Ke,
  Y as Me,
  i as ve,
  m as Ve,
  _ as qe,
} from './BRqkcXJS.js'
var Te = [
    'input:not([inert]):not([inert] *)',
    'select:not([inert]):not([inert] *)',
    'textarea:not([inert]):not([inert] *)',
    'a[href]:not([inert]):not([inert] *)',
    'button:not([inert]):not([inert] *)',
    '[tabindex]:not(slot):not([inert]):not([inert] *)',
    'audio[controls]:not([inert]):not([inert] *)',
    'video[controls]:not([inert]):not([inert] *)',
    '[contenteditable]:not([contenteditable="false"]):not([inert]):not([inert] *)',
    'details>summary:first-of-type:not([inert]):not([inert] *)',
    'details:not([inert]):not([inert] *)',
  ],
  J = Te.join(','),
  Se = typeof Element > 'u',
  G = Se
    ? function () {}
    : Element.prototype.matches ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector,
  Q =
    !Se && Element.prototype.getRootNode
      ? function (r) {
          var e
          return r == null || (e = r.getRootNode) === null || e === void 0 ? void 0 : e.call(r)
        }
      : function (r) {
          return r?.ownerDocument
        },
  ee = function (e, t) {
    var n
    t === void 0 && (t = !0)
    var u =
        e == null || (n = e.getAttribute) === null || n === void 0 ? void 0 : n.call(e, 'inert'),
      l = u === '' || u === 'true',
      a =
        l || (t && e && (typeof e.closest == 'function' ? e.closest('[inert]') : ee(e.parentNode)))
    return a
  },
  Ue = function (e) {
    var t,
      n =
        e == null || (t = e.getAttribute) === null || t === void 0
          ? void 0
          : t.call(e, 'contenteditable')
    return n === '' || n === 'true'
  },
  Ne = function (e, t, n) {
    if (ee(e)) return []
    var u = Array.prototype.slice.apply(e.querySelectorAll(J))
    return (t && G.call(e, J) && u.unshift(e), (u = u.filter(n)), u)
  },
  te = function (e, t, n) {
    for (var u = [], l = Array.from(e); l.length; ) {
      var a = l.shift()
      if (!ee(a, !1))
        if (a.tagName === 'SLOT') {
          var f = a.assignedElements(),
            d = f.length ? f : a.children,
            h = te(d, !0, n)
          n.flatten ? u.push.apply(u, h) : u.push({ scopeParent: a, candidates: h })
        } else {
          var T = G.call(a, J)
          T && n.filter(a) && (t || !e.includes(a)) && u.push(a)
          var w = a.shadowRoot || (typeof n.getShadowRoot == 'function' && n.getShadowRoot(a)),
            O = !ee(w, !1) && (!n.shadowRootFilter || n.shadowRootFilter(a))
          if (w && O) {
            var N = te(w === !0 ? a.children : w.children, !0, n)
            n.flatten ? u.push.apply(u, N) : u.push({ scopeParent: a, candidates: N })
          } else l.unshift.apply(l, a.children)
        }
    }
    return u
  },
  Ee = function (e) {
    return !isNaN(parseInt(e.getAttribute('tabindex'), 10))
  },
  x = function (e) {
    if (!e) throw new Error('No node provided')
    return e.tabIndex < 0 && (/^(AUDIO|VIDEO|DETAILS)$/.test(e.tagName) || Ue(e)) && !Ee(e)
      ? 0
      : e.tabIndex
  },
  Ye = function (e, t) {
    var n = x(e)
    return n < 0 && t && !Ee(e) ? 0 : n
  },
  We = function (e, t) {
    return e.tabIndex === t.tabIndex ? e.documentOrder - t.documentOrder : e.tabIndex - t.tabIndex
  },
  ke = function (e) {
    return e.tagName === 'INPUT'
  },
  $e = function (e) {
    return ke(e) && e.type === 'hidden'
  },
  ze = function (e) {
    var t =
      e.tagName === 'DETAILS' &&
      Array.prototype.slice.apply(e.children).some(function (n) {
        return n.tagName === 'SUMMARY'
      })
    return t
  },
  He = function (e, t) {
    for (var n = 0; n < e.length; n++) if (e[n].checked && e[n].form === t) return e[n]
  },
  Xe = function (e) {
    if (!e.name) return !0
    var t = e.form || Q(e),
      n = function (f) {
        return t.querySelectorAll('input[type="radio"][name="' + f + '"]')
      },
      u
    if (typeof window < 'u' && typeof window.CSS < 'u' && typeof window.CSS.escape == 'function')
      u = n(window.CSS.escape(e.name))
    else
      try {
        u = n(e.name)
      } catch {
        return !1
      }
    var l = He(u, e.form)
    return !l || l === e
  },
  Ze = function (e) {
    return ke(e) && e.type === 'radio'
  },
  Je = function (e) {
    return Ze(e) && !Xe(e)
  },
  Qe = function (e) {
    var t,
      n = e && Q(e),
      u = (t = n) === null || t === void 0 ? void 0 : t.host,
      l = !1
    if (n && n !== e) {
      var a, f, d
      for (
        l = !!(
          ((a = u) !== null &&
            a !== void 0 &&
            (f = a.ownerDocument) !== null &&
            f !== void 0 &&
            f.contains(u)) ||
          (e != null && (d = e.ownerDocument) !== null && d !== void 0 && d.contains(e))
        );
        !l && u;
      ) {
        var h, T, w
        ;((n = Q(u)),
          (u = (h = n) === null || h === void 0 ? void 0 : h.host),
          (l = !!(
            (T = u) !== null &&
            T !== void 0 &&
            (w = T.ownerDocument) !== null &&
            w !== void 0 &&
            w.contains(u)
          )))
      }
    }
    return l
  },
  be = function (e) {
    var t = e.getBoundingClientRect(),
      n = t.width,
      u = t.height
    return n === 0 && u === 0
  },
  et = function (e, t) {
    var n = t.displayCheck,
      u = t.getShadowRoot
    if (n === 'full-native' && 'checkVisibility' in e) {
      var l = e.checkVisibility({
        checkOpacity: !1,
        opacityProperty: !1,
        contentVisibilityAuto: !0,
        visibilityProperty: !0,
        checkVisibilityCSS: !0,
      })
      return !l
    }
    if (getComputedStyle(e).visibility === 'hidden') return !0
    var a = G.call(e, 'details>summary:first-of-type'),
      f = a ? e.parentElement : e
    if (G.call(f, 'details:not([open]) *')) return !0
    if (!n || n === 'full' || n === 'full-native' || n === 'legacy-full') {
      if (typeof u == 'function') {
        for (var d = e; e; ) {
          var h = e.parentElement,
            T = Q(e)
          if (h && !h.shadowRoot && u(h) === !0) return be(e)
          e.assignedSlot
            ? (e = e.assignedSlot)
            : !h && T !== e.ownerDocument
              ? (e = T.host)
              : (e = h)
        }
        e = d
      }
      if (Qe(e)) return !e.getClientRects().length
      if (n !== 'legacy-full') return !0
    } else if (n === 'non-zero-area') return be(e)
    return !1
  },
  tt = function (e) {
    if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName))
      for (var t = e.parentElement; t; ) {
        if (t.tagName === 'FIELDSET' && t.disabled) {
          for (var n = 0; n < t.children.length; n++) {
            var u = t.children.item(n)
            if (u.tagName === 'LEGEND')
              return G.call(t, 'fieldset[disabled] *') ? !0 : !u.contains(e)
          }
          return !0
        }
        t = t.parentElement
      }
    return !1
  },
  ae = function (e, t) {
    return !(t.disabled || $e(t) || et(t, e) || ze(t) || tt(t))
  },
  se = function (e, t) {
    return !(Je(t) || x(t) < 0 || !ae(e, t))
  },
  at = function (e) {
    var t = parseInt(e.getAttribute('tabindex'), 10)
    return !!(isNaN(t) || t >= 0)
  },
  Fe = function (e) {
    var t = [],
      n = []
    return (
      e.forEach(function (u, l) {
        var a = !!u.scopeParent,
          f = a ? u.scopeParent : u,
          d = Ye(f, a),
          h = a ? Fe(u.candidates) : f
        d === 0
          ? a
            ? t.push.apply(t, h)
            : t.push(f)
          : n.push({ documentOrder: l, tabIndex: d, item: u, isScope: a, content: h })
      }),
      n
        .sort(We)
        .reduce(function (u, l) {
          return (l.isScope ? u.push.apply(u, l.content) : u.push(l.content), u)
        }, [])
        .concat(t)
    )
  },
  rt = function (e, t) {
    t = t || {}
    var n
    return (
      t.getShadowRoot
        ? (n = te([e], t.includeContainer, {
            filter: se.bind(null, t),
            flatten: !1,
            getShadowRoot: t.getShadowRoot,
            shadowRootFilter: at,
          }))
        : (n = Ne(e, t.includeContainer, se.bind(null, t))),
      Fe(n)
    )
  },
  nt = function (e, t) {
    t = t || {}
    var n
    return (
      t.getShadowRoot
        ? (n = te([e], t.includeContainer, {
            filter: ae.bind(null, t),
            flatten: !0,
            getShadowRoot: t.getShadowRoot,
          }))
        : (n = Ne(e, t.includeContainer, ae.bind(null, t))),
      n
    )
  },
  M = function (e, t) {
    if (((t = t || {}), !e)) throw new Error('No node provided')
    return G.call(e, J) === !1 ? !1 : se(t, e)
  },
  it = Te.concat('iframe:not([inert]):not([inert] *)').join(','),
  le = function (e, t) {
    if (((t = t || {}), !e)) throw new Error('No node provided')
    return G.call(e, it) === !1 ? !1 : ae(t, e)
  }
function ce(r, e) {
  ;(e == null || e > r.length) && (e = r.length)
  for (var t = 0, n = Array(e); t < e; t++) n[t] = r[t]
  return n
}
function ot(r) {
  if (Array.isArray(r)) return ce(r)
}
function he(r, e, t, n, u, l, a) {
  try {
    var f = r[l](a),
      d = f.value
  } catch (h) {
    return void t(h)
  }
  f.done ? e(d) : Promise.resolve(d).then(n, u)
}
function pe(r) {
  return function () {
    var e = this,
      t = arguments
    return new Promise(function (n, u) {
      var l = r.apply(e, t)
      function a(d) {
        he(l, n, u, a, f, 'next', d)
      }
      function f(d) {
        he(l, n, u, a, f, 'throw', d)
      }
      a(void 0)
    })
  }
}
function ye(r, e) {
  var t = (typeof Symbol < 'u' && r[Symbol.iterator]) || r['@@iterator']
  if (!t) {
    if (Array.isArray(r) || (t = Ae(r)) || e) {
      t && (r = t)
      var n = 0,
        u = function () {}
      return {
        s: u,
        n: function () {
          return n >= r.length ? { done: !0 } : { done: !1, value: r[n++] }
        },
        e: function (d) {
          throw d
        },
        f: u,
      }
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
  }
  var l,
    a = !0,
    f = !1
  return {
    s: function () {
      t = t.call(r)
    },
    n: function () {
      var d = t.next()
      return ((a = d.done), d)
    },
    e: function (d) {
      ;((f = !0), (l = d))
    },
    f: function () {
      try {
        a || t.return == null || t.return()
      } finally {
        if (f) throw l
      }
    },
  }
}
function ut(r, e, t) {
  return (
    (e = dt(e)) in r
      ? Object.defineProperty(r, e, { value: t, enumerable: !0, configurable: !0, writable: !0 })
      : (r[e] = t),
    r
  )
}
function lt(r) {
  if ((typeof Symbol < 'u' && r[Symbol.iterator] != null) || r['@@iterator'] != null)
    return Array.from(r)
}
function st() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function me(r, e) {
  var t = Object.keys(r)
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(r)
    ;(e &&
      (n = n.filter(function (u) {
        return Object.getOwnPropertyDescriptor(r, u).enumerable
      })),
      t.push.apply(t, n))
  }
  return t
}
function ge(r) {
  for (var e = 1; e < arguments.length; e++) {
    var t = arguments[e] != null ? arguments[e] : {}
    e % 2
      ? me(Object(t), !0).forEach(function (n) {
          ut(r, n, t[n])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(t))
        : me(Object(t)).forEach(function (n) {
            Object.defineProperty(r, n, Object.getOwnPropertyDescriptor(t, n))
          })
  }
  return r
}
function U() {
  var r,
    e,
    t = typeof Symbol == 'function' ? Symbol : {},
    n = t.iterator || '@@iterator',
    u = t.toStringTag || '@@toStringTag'
  function l(N, R, W, $) {
    var K = R && R.prototype instanceof f ? R : f,
      V = Object.create(K.prototype)
    return (
      P(
        V,
        '_invoke',
        (function (re, z, H) {
          var C,
            S,
            F,
            B = 0,
            X = H || [],
            D = !1,
            k = {
              p: 0,
              n: 0,
              v: r,
              a: y,
              f: y.bind(r, 4),
              d: function (i, o) {
                return ((C = i), (S = 0), (F = r), (k.n = o), a)
              },
            }
          function y(i, o) {
            for (S = i, F = o, e = 0; !D && B && !s && e < X.length; e++) {
              var s,
                c = X[e],
                b = k.p,
                p = c[2]
              i > 3
                ? (s = p === o) && ((F = c[(S = c[4]) ? 5 : ((S = 3), 3)]), (c[4] = c[5] = r))
                : c[0] <= b &&
                  ((s = i < 2 && b < c[1])
                    ? ((S = 0), (k.v = o), (k.n = c[1]))
                    : b < p &&
                      (s = i < 3 || c[0] > o || o > p) &&
                      ((c[4] = i), (c[5] = o), (k.n = p), (S = 0)))
            }
            if (s || i > 1) return a
            throw ((D = !0), o)
          }
          return function (i, o, s) {
            if (B > 1) throw TypeError('Generator is already running')
            for (D && o === 1 && y(o, s), S = o, F = s; (e = S < 2 ? r : F) || !D; ) {
              C || (S ? (S < 3 ? (S > 1 && (k.n = -1), y(S, F)) : (k.n = F)) : (k.v = F))
              try {
                if (((B = 2), C)) {
                  if ((S || (i = 'next'), (e = C[i]))) {
                    if (!(e = e.call(C, F))) throw TypeError('iterator result is not an object')
                    if (!e.done) return e
                    ;((F = e.value), S < 2 && (S = 0))
                  } else
                    (S === 1 && (e = C.return) && e.call(C),
                      S < 2 &&
                        ((F = TypeError("The iterator does not provide a '" + i + "' method")),
                        (S = 1)))
                  C = r
                } else if ((e = (D = k.n < 0) ? F : re.call(z, k)) !== a) break
              } catch (c) {
                ;((C = r), (S = 1), (F = c))
              } finally {
                B = 1
              }
            }
            return { value: e, done: D }
          }
        })(N, W, $),
        !0
      ),
      V
    )
  }
  var a = {}
  function f() {}
  function d() {}
  function h() {}
  e = Object.getPrototypeOf
  var T = [][n]
      ? e(e([][n]()))
      : (P((e = {}), n, function () {
          return this
        }),
        e),
    w = (h.prototype = f.prototype = Object.create(T))
  function O(N) {
    return (
      Object.setPrototypeOf
        ? Object.setPrototypeOf(N, h)
        : ((N.__proto__ = h), P(N, u, 'GeneratorFunction')),
      (N.prototype = Object.create(w)),
      N
    )
  }
  return (
    (d.prototype = h),
    P(w, 'constructor', h),
    P(h, 'constructor', d),
    (d.displayName = 'GeneratorFunction'),
    P(h, u, 'GeneratorFunction'),
    P(w),
    P(w, u, 'Generator'),
    P(w, n, function () {
      return this
    }),
    P(w, 'toString', function () {
      return '[object Generator]'
    }),
    (U = function () {
      return { w: l, m: O }
    })()
  )
}
function P(r, e, t, n) {
  var u = Object.defineProperty
  try {
    u({}, '', {})
  } catch {
    u = 0
  }
  ;((P = function (l, a, f, d) {
    function h(T, w) {
      P(l, T, function (O) {
        return this._invoke(T, w, O)
      })
    }
    a
      ? u
        ? u(l, a, { value: f, enumerable: !d, configurable: !d, writable: !d })
        : (l[a] = f)
      : (h('next', 0), h('throw', 1), h('return', 2))
  }),
    P(r, e, t, n))
}
function ct(r) {
  return ot(r) || lt(r) || Ae(r) || st()
}
function ft(r, e) {
  if (typeof r != 'object' || !r) return r
  var t = r[Symbol.toPrimitive]
  if (t !== void 0) {
    var n = t.call(r, e)
    if (typeof n != 'object') return n
    throw new TypeError('@@toPrimitive must return a primitive value.')
  }
  return (e === 'string' ? String : Number)(r)
}
function dt(r) {
  var e = ft(r, 'string')
  return typeof e == 'symbol' ? e : e + ''
}
function Ae(r, e) {
  if (r) {
    if (typeof r == 'string') return ce(r, e)
    var t = {}.toString.call(r).slice(8, -1)
    return (
      t === 'Object' && r.constructor && (t = r.constructor.name),
      t === 'Map' || t === 'Set'
        ? Array.from(r)
        : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
          ? ce(r, e)
          : void 0
    )
  }
}
var _ = {
    getActiveTrap: function (e) {
      return e?.length > 0 ? e[e.length - 1] : null
    },
    activateTrap: function (e, t) {
      var n = _.getActiveTrap(e)
      t !== n && _.pauseTrap(e)
      var u = e.indexOf(t)
      ;(u === -1 || e.splice(u, 1), e.push(t))
    },
    deactivateTrap: function (e, t) {
      var n = e.indexOf(t)
      ;(n !== -1 && e.splice(n, 1), _.unpauseTrap(e))
    },
    pauseTrap: function (e) {
      var t = _.getActiveTrap(e)
      t?._setPausedState(!0)
    },
    unpauseTrap: function (e) {
      var t = _.getActiveTrap(e)
      t && !t._isManuallyPaused() && t._setPausedState(!1)
    },
  },
  vt = function (e) {
    return e.tagName && e.tagName.toLowerCase() === 'input' && typeof e.select == 'function'
  },
  bt = function (e) {
    return e?.key === 'Escape' || e?.key === 'Esc' || e?.keyCode === 27
  },
  Y = function (e) {
    return e?.key === 'Tab' || e?.keyCode === 9
  },
  ht = function (e) {
    return Y(e) && !e.shiftKey
  },
  pt = function (e) {
    return Y(e) && e.shiftKey
  },
  we = function (e) {
    return setTimeout(e, 0)
  },
  q = function (e) {
    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), u = 1; u < t; u++)
      n[u - 1] = arguments[u]
    return typeof e == 'function' ? e.apply(void 0, n) : e
  },
  Z = function (e) {
    return e.target.shadowRoot && typeof e.composedPath == 'function'
      ? e.composedPath()[0]
      : e.target
  },
  yt = [],
  mt = function (e, t) {
    var n = t?.document || document,
      u = t?.trapStack || yt,
      l = ge(
        {
          returnFocusOnDeactivate: !0,
          escapeDeactivates: !0,
          delayInitialFocus: !0,
          isolateSubtrees: !1,
          isKeyForward: ht,
          isKeyBackward: pt,
        },
        t
      ),
      a = {
        containers: [],
        containerGroups: [],
        tabbableGroups: [],
        adjacentElements: new Set(),
        alreadySilent: new Set(),
        nodeFocusedBeforeActivation: null,
        mostRecentlyFocusedNode: null,
        active: !1,
        paused: !1,
        manuallyPaused: !1,
        delayInitialFocusTimer: void 0,
        recentNavEvent: void 0,
      },
      f,
      d = function (i, o, s) {
        return i && i[o] !== void 0 ? i[o] : l[s || o]
      },
      h = function (i, o) {
        var s = typeof o?.composedPath == 'function' ? o.composedPath() : void 0
        return a.containerGroups.findIndex(function (c) {
          var b = c.container,
            p = c.tabbableNodes
          return (
            b.contains(i) ||
            s?.includes(b) ||
            p.find(function (v) {
              return v === i
            })
          )
        })
      },
      T = function (i) {
        var o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
          s = o.hasFallback,
          c = s === void 0 ? !1 : s,
          b = o.params,
          p = b === void 0 ? [] : b,
          v = l[i]
        if (
          (typeof v == 'function' && (v = v.apply(void 0, ct(p))), v === !0 && (v = void 0), !v)
        ) {
          if (v === void 0 || v === !1) return v
          throw new Error(
            '`'.concat(i, '` was specified but was not a node, or did not return a node')
          )
        }
        var m = v
        if (typeof v == 'string') {
          try {
            m = n.querySelector(v)
          } catch (g) {
            throw new Error(
              '`'.concat(i, '` appears to be an invalid selector; error="').concat(g.message, '"')
            )
          }
          if (!m && !c) throw new Error('`'.concat(i, '` as selector refers to no known node'))
        }
        return m
      },
      w = function () {
        var i = T('initialFocus', { hasFallback: !0 })
        if (i === !1) return !1
        if (i === void 0 || (i && !le(i, l.tabbableOptions)))
          if (h(n.activeElement) >= 0) i = n.activeElement
          else {
            var o = a.tabbableGroups[0],
              s = o && o.firstTabbableNode
            i = s || T('fallbackFocus')
          }
        else i === null && (i = T('fallbackFocus'))
        if (!i) throw new Error('Your focus-trap needs to have at least one focusable element')
        return i
      },
      O = function () {
        if (
          ((a.containerGroups = a.containers.map(function (i) {
            var o = rt(i, l.tabbableOptions),
              s = nt(i, l.tabbableOptions),
              c = o.length > 0 ? o[0] : void 0,
              b = o.length > 0 ? o[o.length - 1] : void 0,
              p = s.find(function (g) {
                return M(g)
              }),
              v = s
                .slice()
                .reverse()
                .find(function (g) {
                  return M(g)
                }),
              m = !!o.find(function (g) {
                return x(g) > 0
              })
            return {
              container: i,
              tabbableNodes: o,
              focusableNodes: s,
              posTabIndexesFound: m,
              firstTabbableNode: c,
              lastTabbableNode: b,
              firstDomTabbableNode: p,
              lastDomTabbableNode: v,
              nextTabbableNode: function (E) {
                var I = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0,
                  A = o.indexOf(E)
                return A < 0
                  ? I
                    ? s.slice(s.indexOf(E) + 1).find(function (L) {
                        return M(L)
                      })
                    : s
                        .slice(0, s.indexOf(E))
                        .reverse()
                        .find(function (L) {
                          return M(L)
                        })
                  : o[A + (I ? 1 : -1)]
              },
            }
          })),
          (a.tabbableGroups = a.containerGroups.filter(function (i) {
            return i.tabbableNodes.length > 0
          })),
          a.tabbableGroups.length <= 0 && !T('fallbackFocus'))
        )
          throw new Error(
            'Your focus-trap must have at least one container with at least one tabbable node in it at all times'
          )
        if (
          a.containerGroups.find(function (i) {
            return i.posTabIndexesFound
          }) &&
          a.containerGroups.length > 1
        )
          throw new Error(
            "At least one node with a positive tabindex was found in one of your focus-trap's multiple containers. Positive tabindexes are only supported in single-container focus-traps."
          )
      },
      N = function (i) {
        var o = i.activeElement
        if (o) return o.shadowRoot && o.shadowRoot.activeElement !== null ? N(o.shadowRoot) : o
      },
      R = function (i) {
        if (i !== !1 && i !== N(document)) {
          if (!i || !i.focus) {
            R(w())
            return
          }
          ;(i.focus({ preventScroll: !!l.preventScroll }),
            (a.mostRecentlyFocusedNode = i),
            vt(i) && i.select())
        }
      },
      W = function (i) {
        var o = T('setReturnFocus', { params: [i] })
        return o || (o === !1 ? !1 : i)
      },
      $ = function (i) {
        var o = i.target,
          s = i.event,
          c = i.isBackward,
          b = c === void 0 ? !1 : c
        ;((o = o || Z(s)), O())
        var p = null
        if (a.tabbableGroups.length > 0) {
          var v = h(o, s),
            m = v >= 0 ? a.containerGroups[v] : void 0
          if (v < 0)
            b
              ? (p = a.tabbableGroups[a.tabbableGroups.length - 1].lastTabbableNode)
              : (p = a.tabbableGroups[0].firstTabbableNode)
          else if (b) {
            var g = a.tabbableGroups.findIndex(function (ne) {
              var ie = ne.firstTabbableNode
              return o === ie
            })
            if (
              (g < 0 &&
                (m.container === o ||
                  (le(o, l.tabbableOptions) &&
                    !M(o, l.tabbableOptions) &&
                    !m.nextTabbableNode(o, !1))) &&
                (g = v),
              g >= 0)
            ) {
              var E = g === 0 ? a.tabbableGroups.length - 1 : g - 1,
                I = a.tabbableGroups[E]
              p = x(o) >= 0 ? I.lastTabbableNode : I.lastDomTabbableNode
            } else Y(s) || (p = m.nextTabbableNode(o, !1))
          } else {
            var A = a.tabbableGroups.findIndex(function (ne) {
              var ie = ne.lastTabbableNode
              return o === ie
            })
            if (
              (A < 0 &&
                (m.container === o ||
                  (le(o, l.tabbableOptions) &&
                    !M(o, l.tabbableOptions) &&
                    !m.nextTabbableNode(o))) &&
                (A = v),
              A >= 0)
            ) {
              var L = A === a.tabbableGroups.length - 1 ? 0 : A + 1,
                j = a.tabbableGroups[L]
              p = x(o) >= 0 ? j.firstTabbableNode : j.firstDomTabbableNode
            } else Y(s) || (p = m.nextTabbableNode(o))
          }
        } else p = T('fallbackFocus')
        return p
      },
      K = function (i) {
        var o = Z(i)
        if (!(h(o, i) >= 0)) {
          if (q(l.clickOutsideDeactivates, i)) {
            f.deactivate({ returnFocus: l.returnFocusOnDeactivate })
            return
          }
          q(l.allowOutsideClick, i) || i.preventDefault()
        }
      },
      V = function (i) {
        var o = Z(i),
          s = h(o, i) >= 0
        if (s || o instanceof Document) s && (a.mostRecentlyFocusedNode = o)
        else {
          i.stopImmediatePropagation()
          var c,
            b = !0
          if (a.mostRecentlyFocusedNode)
            if (x(a.mostRecentlyFocusedNode) > 0) {
              var p = h(a.mostRecentlyFocusedNode),
                v = a.containerGroups[p].tabbableNodes
              if (v.length > 0) {
                var m = v.findIndex(function (g) {
                  return g === a.mostRecentlyFocusedNode
                })
                m >= 0 &&
                  (l.isKeyForward(a.recentNavEvent)
                    ? m + 1 < v.length && ((c = v[m + 1]), (b = !1))
                    : m - 1 >= 0 && ((c = v[m - 1]), (b = !1)))
              }
            } else
              a.containerGroups.some(function (g) {
                return g.tabbableNodes.some(function (E) {
                  return x(E) > 0
                })
              }) || (b = !1)
          else b = !1
          ;(b &&
            (c = $({
              target: a.mostRecentlyFocusedNode,
              isBackward: l.isKeyBackward(a.recentNavEvent),
            })),
            R(c || a.mostRecentlyFocusedNode || w()))
        }
        a.recentNavEvent = void 0
      },
      re = function (i) {
        var o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1
        a.recentNavEvent = i
        var s = $({ event: i, isBackward: o })
        s && (Y(i) && i.preventDefault(), R(s))
      },
      z = function (i) {
        ;(l.isKeyForward(i) || l.isKeyBackward(i)) && re(i, l.isKeyBackward(i))
      },
      H = function (i) {
        bt(i) && q(l.escapeDeactivates, i) !== !1 && (i.preventDefault(), f.deactivate())
      },
      C = function (i) {
        var o = Z(i)
        h(o, i) >= 0 ||
          q(l.clickOutsideDeactivates, i) ||
          q(l.allowOutsideClick, i) ||
          (i.preventDefault(), i.stopImmediatePropagation())
      },
      S = function () {
        if (!a.active) return Promise.resolve()
        _.activateTrap(u, f)
        var i
        return (
          l.delayInitialFocus
            ? (i = new Promise(function (o) {
                a.delayInitialFocusTimer = we(function () {
                  ;(R(w()), o())
                })
              }))
            : ((i = Promise.resolve()), R(w())),
          n.addEventListener('focusin', V, !0),
          n.addEventListener('mousedown', K, { capture: !0, passive: !1 }),
          n.addEventListener('touchstart', K, { capture: !0, passive: !1 }),
          n.addEventListener('click', C, { capture: !0, passive: !1 }),
          n.addEventListener('keydown', z, { capture: !0, passive: !1 }),
          n.addEventListener('keydown', H),
          i
        )
      },
      F = function (i) {
        ;(a.active && !a.paused && f._setSubtreeIsolation(!1),
          a.adjacentElements.clear(),
          a.alreadySilent.clear())
        var o = new Set(),
          s = new Set(),
          c = ye(i),
          b
        try {
          for (c.s(); !(b = c.n()).done; ) {
            var p = b.value
            o.add(p)
            for (
              var v = typeof ShadowRoot < 'u' && p.getRootNode() instanceof ShadowRoot, m = p;
              m;
            ) {
              o.add(m)
              var g = m.parentElement,
                E = []
              g
                ? (E = g.children)
                : !g &&
                  v &&
                  ((E = m.getRootNode().children),
                  (g = m.getRootNode().host),
                  (v = typeof ShadowRoot < 'u' && g.getRootNode() instanceof ShadowRoot))
              var I = ye(E),
                A
              try {
                for (I.s(); !(A = I.n()).done; ) {
                  var L = A.value
                  s.add(L)
                }
              } catch (j) {
                I.e(j)
              } finally {
                I.f()
              }
              m = g
            }
          }
        } catch (j) {
          c.e(j)
        } finally {
          c.f()
        }
        ;(o.forEach(function (j) {
          s.delete(j)
        }),
          (a.adjacentElements = s))
      },
      B = function () {
        if (a.active)
          return (
            n.removeEventListener('focusin', V, !0),
            n.removeEventListener('mousedown', K, !0),
            n.removeEventListener('touchstart', K, !0),
            n.removeEventListener('click', C, !0),
            n.removeEventListener('keydown', z, !0),
            n.removeEventListener('keydown', H),
            f
          )
      },
      X = function (i) {
        var o = i.some(function (s) {
          var c = Array.from(s.removedNodes)
          return c.some(function (b) {
            return b === a.mostRecentlyFocusedNode
          })
        })
        o && R(w())
      },
      D = typeof window < 'u' && 'MutationObserver' in window ? new MutationObserver(X) : void 0,
      k = function () {
        D &&
          (D.disconnect(),
          a.active &&
            !a.paused &&
            a.containers.map(function (i) {
              D.observe(i, { subtree: !0, childList: !0 })
            }))
      }
    return (
      (f = {
        get active() {
          return a.active
        },
        get paused() {
          return a.paused
        },
        activate: function (i) {
          if (a.active) return this
          var o = d(i, 'onActivate'),
            s = d(i, 'onPostActivate'),
            c = d(i, 'checkCanFocusTrap'),
            b = _.getActiveTrap(u),
            p = !1
          if (b && !b.paused) {
            var v
            ;((v = b._setSubtreeIsolation) === null || v === void 0 || v.call(b, !1), (p = !0))
          }
          try {
            ;(c || O(),
              (a.active = !0),
              (a.paused = !1),
              (a.nodeFocusedBeforeActivation = N(n)),
              o?.())
            var m = (function () {
              var E = pe(
                U().m(function I() {
                  return U().w(function (A) {
                    for (;;)
                      switch (A.n) {
                        case 0:
                          return (c && O(), (A.n = 1), S())
                        case 1:
                          ;(f._setSubtreeIsolation(!0), k(), s?.())
                        case 2:
                          return A.a(2)
                      }
                  }, I)
                })
              )
              return function () {
                return E.apply(this, arguments)
              }
            })()
            if (c) return (c(a.containers.concat()).then(m, m), this)
            m()
          } catch (E) {
            if (b === _.getActiveTrap(u) && p) {
              var g
              ;(g = b._setSubtreeIsolation) === null || g === void 0 || g.call(b, !0)
            }
            throw E
          }
          return this
        },
        deactivate: function (i) {
          if (!a.active) return this
          var o = ge(
            {
              onDeactivate: l.onDeactivate,
              onPostDeactivate: l.onPostDeactivate,
              checkCanReturnFocus: l.checkCanReturnFocus,
            },
            i
          )
          ;(clearTimeout(a.delayInitialFocusTimer),
            (a.delayInitialFocusTimer = void 0),
            a.paused || f._setSubtreeIsolation(!1),
            a.alreadySilent.clear(),
            B(),
            (a.active = !1),
            (a.paused = !1),
            k(),
            _.deactivateTrap(u, f))
          var s = d(o, 'onDeactivate'),
            c = d(o, 'onPostDeactivate'),
            b = d(o, 'checkCanReturnFocus'),
            p = d(o, 'returnFocus', 'returnFocusOnDeactivate')
          s?.()
          var v = function () {
            we(function () {
              ;(p && R(W(a.nodeFocusedBeforeActivation)), c?.())
            })
          }
          return p && b ? (b(W(a.nodeFocusedBeforeActivation)).then(v, v), this) : (v(), this)
        },
        pause: function (i) {
          return a.active ? ((a.manuallyPaused = !0), this._setPausedState(!0, i)) : this
        },
        unpause: function (i) {
          return a.active
            ? ((a.manuallyPaused = !1),
              u[u.length - 1] !== this ? this : this._setPausedState(!1, i))
            : this
        },
        updateContainerElements: function (i) {
          var o = [].concat(i).filter(Boolean)
          return (
            (a.containers = o.map(function (s) {
              return typeof s == 'string' ? n.querySelector(s) : s
            })),
            l.isolateSubtrees && F(a.containers),
            a.active && (O(), a.paused || f._setSubtreeIsolation(!0)),
            k(),
            this
          )
        },
      }),
      Object.defineProperties(f, {
        _isManuallyPaused: {
          value: function () {
            return a.manuallyPaused
          },
        },
        _setPausedState: {
          value: function (i, o) {
            if (a.paused === i) return this
            if (((a.paused = i), i)) {
              var s = d(o, 'onPause'),
                c = d(o, 'onPostPause')
              ;(s?.(), B(), f._setSubtreeIsolation(!1), k(), c?.())
            } else {
              var b = d(o, 'onUnpause'),
                p = d(o, 'onPostUnpause')
              b?.()
              var v = (function () {
                var m = pe(
                  U().m(function g() {
                    return U().w(function (E) {
                      for (;;)
                        switch (E.n) {
                          case 0:
                            return (O(), (E.n = 1), S())
                          case 1:
                            ;(f._setSubtreeIsolation(!0), k(), p?.())
                          case 2:
                            return E.a(2)
                        }
                    }, g)
                  })
                )
                return function () {
                  return m.apply(this, arguments)
                }
              })()
              v()
            }
            return this
          },
        },
        _setSubtreeIsolation: {
          value: function (i) {
            l.isolateSubtrees &&
              a.adjacentElements.forEach(function (o) {
                var s
                i
                  ? l.isolateSubtrees === 'aria-hidden'
                    ? ((o.ariaHidden === 'true' ||
                        ((s = o.getAttribute('aria-hidden')) === null || s === void 0
                          ? void 0
                          : s.toLowerCase()) === 'true') &&
                        a.alreadySilent.add(o),
                      o.setAttribute('aria-hidden', 'true'))
                    : ((o.inert || o.hasAttribute('inert')) && a.alreadySilent.add(o),
                      o.setAttribute('inert', !0))
                  : a.alreadySilent.has(o) ||
                    (l.isolateSubtrees === 'aria-hidden'
                      ? o.removeAttribute('aria-hidden')
                      : o.removeAttribute('inert'))
              })
          },
        },
      }),
      f.updateContainerElements(e),
      f
    )
  }
const gt = ['aria-labelledby'],
  wt = { key: 0, class: 'game-modal-header' },
  Tt = { id: 'game-modal-title', class: 'game-modal-title' },
  St = { class: 'game-modal-body' },
  Nt = Oe({
    __name: 'GameModal',
    props: {
      modelValue: { type: Boolean },
      variant: { default: 'default' },
      title: { default: void 0 },
      closeOnBackdrop: { type: Boolean, default: !0 },
      closeOnEscape: { type: Boolean, default: !0 },
    },
    emits: ['update:modelValue'],
    setup(r, { emit: e }) {
      const t = r,
        n = e,
        u = ve(null),
        l = ve(null)
      let a = null
      const f = Ve(() => [`game-modal--${t.variant}`]),
        d = () => {
          n('update:modelValue', !1)
        },
        h = () => {
          t.closeOnBackdrop && d()
        },
        T = (N) => {
          N.key === 'Escape' && t.modelValue && t.closeOnEscape && d()
        },
        w = () => {
          u.value &&
            ((a = mt(u.value, {
              escapeDeactivates: !1,
              clickOutsideDeactivates: !1,
              allowOutsideClick: !0,
              initialFocus: !1,
              fallbackFocus: u.value,
            })),
            a.activate())
        },
        O = () => {
          a && (a.deactivate(), (a = null))
        }
      return (
        Re(() => {
          document.addEventListener('keydown', T)
        }),
        Ie(() => {
          ;(document.removeEventListener('keydown', T), O())
        }),
        Pe(
          () => t.modelValue,
          (N) => {
            N ? (document.body.style.overflow = 'hidden') : (document.body.style.overflow = '')
          }
        ),
        (N, R) => (
          oe(),
          Ce(De, { to: 'body' }, [
            _e(
              Me,
              { name: 'game-modal', onAfterEnter: w, onAfterLeave: O },
              {
                default: je(() => [
                  r.modelValue
                    ? (oe(),
                      fe(
                        'div',
                        {
                          key: 0,
                          ref_key: 'overlayRef',
                          ref: l,
                          class: 'game-modal-overlay',
                          onClick: Ke(h, ['self']),
                        },
                        [
                          ue(
                            'div',
                            {
                              ref_key: 'modalRef',
                              ref: u,
                              class: xe(['game-modal', Ge(f)]),
                              role: 'dialog',
                              'aria-modal': 'true',
                              'aria-labelledby': r.title ? 'game-modal-title' : void 0,
                            },
                            [
                              r.title
                                ? (oe(), fe('div', wt, [ue('h2', Tt, Be(r.title), 1)]))
                                : de('', !0),
                              ue('div', St, [Le(N.$slots, 'default', {}, void 0, !0)]),
                            ],
                            10,
                            gt
                          ),
                        ],
                        512
                      ))
                    : de('', !0),
                ]),
                _: 3,
              }
            ),
          ])
        )
      )
    },
  }),
  kt = Object.assign(qe(Nt, [['__scopeId', 'data-v-b09619a6']]), { __name: 'GameModal' })
export { kt as _ }
