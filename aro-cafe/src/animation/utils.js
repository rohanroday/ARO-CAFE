// Small helpers shared by every animation module.
export const ASSETS = `${import.meta.env.BASE_URL}assets`;
export const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
export const mixv = (a, b, t) => a + (b - a) * t;
// critically damped follow: no velocity jumps when the target moves (state = { v })
export function smoothDamp(cur, tgt, st, smoothTime, dt){
  const om = 2 / smoothTime, x = om * dt, e = 1 / (1 + x + .48 * x * x + .235 * x * x * x);
  const change = cur - tgt, tmp = (st.v + om * change) * dt;
  st.v = (st.v - om * tmp) * e;
  let out = tgt + (change + tmp) * e;
  if ((tgt - cur > 0) === (out > tgt)) { out = tgt; st.v = 0; }
  return out;
}
export function rng(seed){ let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
