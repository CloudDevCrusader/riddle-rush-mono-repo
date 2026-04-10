import { i as S } from './C3e4t58V.js'
import { r as y } from './DBIYhhxi.js'
import { t as W } from './CiGF-E6V.js'
import './D0PfgovT.js'
import './nLWjQ9zq.js'
var h = function () {
    return y.Date.now()
  },
  R = 'Expected a function',
  A = Math.max,
  F = Math.min
function U(x, i, a) {
  var u,
    o,
    c,
    f,
    n,
    r,
    d = 0,
    p = !1,
    m = !1,
    g = !0
  if (typeof x != 'function') throw new TypeError(R)
  ;((i = W(i) || 0),
    S(a) &&
      ((p = !!a.leading),
      (m = 'maxWait' in a),
      (c = m ? A(W(a.maxWait) || 0, i) : c),
      (g = 'trailing' in a ? !!a.trailing : g)))
  function v(e) {
    var t = u,
      l = o
    return ((u = o = void 0), (d = e), (f = x.apply(l, t)), f)
  }
  function b(e) {
    return ((d = e), (n = setTimeout(s, i)), p ? v(e) : f)
  }
  function C(e) {
    var t = e - r,
      l = e - d,
      I = i - t
    return m ? F(I, c - l) : I
  }
  function E(e) {
    var t = e - r,
      l = e - d
    return r === void 0 || t >= i || t < 0 || (m && l >= c)
  }
  function s() {
    var e = h()
    if (E(e)) return k(e)
    n = setTimeout(s, C(e))
  }
  function k(e) {
    return ((n = void 0), g && u ? v(e) : ((u = o = void 0), f))
  }
  function L() {
    ;(n !== void 0 && clearTimeout(n), (d = 0), (u = r = o = n = void 0))
  }
  function M() {
    return n === void 0 ? f : k(h())
  }
  function T() {
    var e = h(),
      t = E(e)
    if (((u = arguments), (o = this), (r = e), t)) {
      if (n === void 0) return b(r)
      if (m) return (clearTimeout(n), (n = setTimeout(s, i)), v(r))
    }
    return (n === void 0 && (n = setTimeout(s, i)), f)
  }
  return ((T.cancel = L), (T.flush = M), T)
}
export { U as default }
