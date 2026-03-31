import { r as b, b as y, f as g } from './DBIYhhxi.js'
import { i as j } from './BLd32nMJ.js'
import { i as d } from './nLWjQ9zq.js'
function T() {
  return !1
}
var p = typeof exports == 'object' && exports && !exports.nodeType && exports,
  s = p && typeof module == 'object' && module && !module.nodeType && module,
  l = s && s.exports === p,
  c = l ? b.Buffer : void 0,
  v = c ? c.isBuffer : void 0,
  tr = v || T,
  m = '[object Arguments]',
  A = '[object Array]',
  x = '[object Boolean]',
  O = '[object Date]',
  B = '[object Error]',
  h = '[object Function]',
  E = '[object Map]',
  I = '[object Number]',
  P = '[object Object]',
  U = '[object RegExp]',
  w = '[object Set]',
  M = '[object String]',
  F = '[object WeakMap]',
  $ = '[object ArrayBuffer]',
  C = '[object DataView]',
  k = '[object Float32Array]',
  q = '[object Float64Array]',
  D = '[object Int8Array]',
  G = '[object Int16Array]',
  K = '[object Int32Array]',
  L = '[object Uint8Array]',
  S = '[object Uint8ClampedArray]',
  V = '[object Uint16Array]',
  N = '[object Uint32Array]',
  r = {}
r[k] = r[q] = r[D] = r[G] = r[K] = r[L] = r[S] = r[V] = r[N] = !0
r[m] =
  r[A] =
  r[$] =
  r[x] =
  r[C] =
  r[O] =
  r[B] =
  r[h] =
  r[E] =
  r[I] =
  r[P] =
  r[U] =
  r[w] =
  r[M] =
  r[F] =
    !1
function R(e) {
  return d(e) && j(e.length) && !!r[y(e)]
}
function W(e) {
  return function (t) {
    return e(t)
  }
}
var f = typeof exports == 'object' && exports && !exports.nodeType && exports,
  a = f && typeof module == 'object' && module && !module.nodeType && module,
  z = a && a.exports === f,
  n = z && g.process,
  i = (function () {
    try {
      var e = a && a.require && a.require('util').types
      return e || (n && n.binding && n.binding('util'))
    } catch {}
  })(),
  u = i && i.isTypedArray,
  or = u ? W(u) : R,
  H = Object.prototype
function J(e) {
  var t = e && e.constructor,
    o = (typeof t == 'function' && t.prototype) || H
  return e === o
}
function Q(e, t) {
  return function (o) {
    return e(t(o))
  }
}
var X = Q(Object.keys, Object),
  Y = Object.prototype,
  Z = Y.hasOwnProperty
function ar(e) {
  if (!J(e)) return X(e)
  var t = []
  for (var o in Object(e)) Z.call(e, o) && o != 'constructor' && t.push(o)
  return t
}
export { or as a, W as b, J as c, ar as d, tr as i, i as n, Q as o }
