import { k as h } from './BBGyBqoE.js'
import { i as b } from './Cqt4AUNF.js'
function g(n) {
  return function (e, r, f) {
    for (var i = -1, a = Object(e), t = f(e), u = t.length; u--; ) {
      var s = t[++i]
      if (r(a[s], s, a) === !1) break
    }
    return e
  }
}
var m = g()
function p(n, e) {
  return n && m(n, e, h)
}
function v(n, e) {
  return function (r, f) {
    if (r == null) return r
    if (!b(r)) return n(r, f)
    for (var i = r.length, a = -1, t = Object(r); ++a < i && f(t[a], a, t) !== !1; );
    return r
  }
}
var x = v(p)
export { x as b }
