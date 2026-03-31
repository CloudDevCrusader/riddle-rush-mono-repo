import { U as m, g as D, S as E } from './Bzf9XPV7.js'
import { S as q, c as F, s as H } from './BPYkuyjI.js'
import { S as I } from './DBIYhhxi.js'
import { e as K } from './DPGIUuQ3.js'
import { g as M } from './B39m6GhF.js'
import { i as $ } from './Dxzbedgu.js'
import { i as x, a as J } from './CA2VU3DF.js'
import { i as G } from './nLWjQ9zq.js'
function Q(n, r) {
  for (var a = -1, f = n == null ? 0 : n.length; ++a < f; ) if (r(n[a], a, n)) return !0
  return !1
}
var X = 1,
  Y = 2
function C(n, r, a, f, g, e) {
  var s = a & X,
    u = n.length,
    l = r.length
  if (u != l && !(s && l > u)) return !1
  var v = e.get(n),
    t = e.get(r)
  if (v && t) return v == r && t == n
  var A = -1,
    i = !0,
    O = a & Y ? new q() : void 0
  for (e.set(n, r), e.set(r, n); ++A < u; ) {
    var p = n[A],
      T = r[A]
    if (f) var d = s ? f(T, p, A, r, n, e) : f(p, T, A, n, r, e)
    if (d !== void 0) {
      if (d) continue
      i = !1
      break
    }
    if (O) {
      if (
        !Q(r, function (P, _) {
          if (!F(O, _) && (p === P || g(p, P, a, f, e))) return O.push(_)
        })
      ) {
        i = !1
        break
      }
    } else if (!(p === T || g(p, T, a, f, e))) {
      i = !1
      break
    }
  }
  return (e.delete(n), e.delete(r), i)
}
function Z(n) {
  var r = -1,
    a = Array(n.size)
  return (
    n.forEach(function (f, g) {
      a[++r] = [g, f]
    }),
    a
  )
}
var W = 1,
  z = 2,
  c = '[object Boolean]',
  j = '[object Date]',
  V = '[object Error]',
  o = '[object Map]',
  h = '[object Number]',
  k = '[object RegExp]',
  nn = '[object Set]',
  rn = '[object String]',
  en = '[object Symbol]',
  fn = '[object ArrayBuffer]',
  an = '[object DataView]',
  B = I ? I.prototype : void 0,
  R = B ? B.valueOf : void 0
function sn(n, r, a, f, g, e, s) {
  switch (a) {
    case an:
      if (n.byteLength != r.byteLength || n.byteOffset != r.byteOffset) return !1
      ;((n = n.buffer), (r = r.buffer))
    case fn:
      return !(n.byteLength != r.byteLength || !e(new m(n), new m(r)))
    case c:
    case j:
    case h:
      return K(+n, +r)
    case V:
      return n.name == r.name && n.message == r.message
    case k:
    case rn:
      return n == r + ''
    case o:
      var u = Z
    case nn:
      var l = f & W
      if ((u || (u = H), n.size != r.size && !l)) return !1
      var v = s.get(n)
      if (v) return v == r
      ;((f |= z), s.set(n, r))
      var t = C(u(n), u(r), f, g, e, s)
      return (s.delete(n), t)
    case en:
      if (R) return R.call(n) == R.call(r)
  }
  return !1
}
var gn = 1,
  ln = Object.prototype,
  un = ln.hasOwnProperty
function vn(n, r, a, f, g, e) {
  var s = a & gn,
    u = D(n),
    l = u.length,
    v = D(r),
    t = v.length
  if (l != t && !s) return !1
  for (var A = l; A--; ) {
    var i = u[A]
    if (!(s ? i in r : un.call(r, i))) return !1
  }
  var O = e.get(n),
    p = e.get(r)
  if (O && p) return O == r && p == n
  var T = !0
  ;(e.set(n, r), e.set(r, n))
  for (var d = s; ++A < l; ) {
    i = u[A]
    var P = n[i],
      _ = r[i]
    if (f) var S = s ? f(_, P, i, r, n, e) : f(P, _, i, n, r, e)
    if (!(S === void 0 ? P === _ || g(P, _, a, f, e) : S)) {
      T = !1
      break
    }
    d || (d = i == 'constructor')
  }
  if (T && !d) {
    var w = n.constructor,
      L = r.constructor
    w != L &&
      'constructor' in n &&
      'constructor' in r &&
      !(typeof w == 'function' && w instanceof w && typeof L == 'function' && L instanceof L) &&
      (T = !1)
  }
  return (e.delete(n), e.delete(r), T)
}
var An = 1,
  U = '[object Arguments]',
  N = '[object Array]',
  y = '[object Object]',
  pn = Object.prototype,
  b = pn.hasOwnProperty
function Tn(n, r, a, f, g, e) {
  var s = $(n),
    u = $(r),
    l = s ? N : M(n),
    v = u ? N : M(r)
  ;((l = l == U ? y : l), (v = v == U ? y : v))
  var t = l == y,
    A = v == y,
    i = l == v
  if (i && x(n)) {
    if (!x(r)) return !1
    ;((s = !0), (t = !1))
  }
  if (i && !t)
    return (e || (e = new E()), s || J(n) ? C(n, r, a, f, g, e) : sn(n, r, l, a, f, g, e))
  if (!(a & An)) {
    var O = t && b.call(n, '__wrapped__'),
      p = A && b.call(r, '__wrapped__')
    if (O || p) {
      var T = O ? n.value() : n,
        d = p ? r.value() : r
      return (e || (e = new E()), g(T, d, a, f, e))
    }
  }
  return i ? (e || (e = new E()), vn(n, r, a, f, g, e)) : !1
}
function tn(n, r, a, f, g) {
  return n === r
    ? !0
    : n == null || r == null || (!G(n) && !G(r))
      ? n !== n && r !== r
      : Tn(n, r, a, f, tn, g)
}
export { tn as b }
