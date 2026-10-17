// Small deterministic helpers shared by the kit and every scene.
export function rng(seed = 1) {
  let a = seed >>> 0;
  const f = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.range = (lo, hi) => lo + (hi - lo) * f();
  f.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * f());
  f.pick = (arr) => arr[Math.floor(f() * arr.length) % arr.length];
  f.sign = () => (f() < 0.5 ? -1 : 1);
  return f;
}

function hash2(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
/** Smooth value noise in [0,1]. */
export function noise2(x, y, seed = 0) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = fade(x - x0), fy = fade(y - y0);
  const a = hash2(x0, y0, seed), b = hash2(x0 + 1, y0, seed);
  const c = hash2(x0, y0 + 1, seed), d = hash2(x0 + 1, y0 + 1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}
/** Fractal noise, roughly in [0,1]. */
export function fbm(x, y, oct = 4, seed = 0) {
  let v = 0, amp = 0.5, f = 1, tot = 0;
  for (let i = 0; i < oct; i++) {
    v += noise2(x * f, y * f, seed + i * 17) * amp;
    tot += amp; amp *= 0.5; f *= 2.03;
  }
  return v / tot;
}
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
/** Distance from point to polyline [[x,z],...]; returns {d, t(index frac), x, z}. */
export function distToPolyline(px, pz, pts) {
  let best = Infinity, bx = 0, bz = 0, bi = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [cx, cz] = pts[i + 1];
    const dx = cx - ax, dz = cz - az;
    const l2 = dx * dx + dz * dz || 1;
    const t = clamp(((px - ax) * dx + (pz - az) * dz) / l2, 0, 1);
    const qx = ax + dx * t, qz = az + dz * t;
    const d = Math.hypot(px - qx, pz - qz);
    if (d < best) { best = d; bx = qx; bz = qz; bi = i + t; }
  }
  return { d: best, x: bx, z: bz, t: bi };
}
export function pointInPoly(x, z, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
/** Sample a Catmull-Rom path through pts ([[x,z]...]) -> denser array. */
export function smoothPath(pts, perSeg = 8, closed = false) {
  const out = [];
  const n = pts.length;
  const get = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let s = 0; s < perSeg; s++) {
      const t = s / perSeg, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out;
}
export function polyLength(pts) { let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return l; }
/** Point at arclength s along polyline -> {x,z,angle}. */
export function pointAlong(pts, s) {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0], dz = pts[i][1] - pts[i - 1][1];
    const l = Math.hypot(dx, dz);
    if (acc + l >= s || i === pts.length - 1) {
      const t = l ? Math.min(1, (s - acc) / l) : 0;
      return { x: pts[i - 1][0] + dx * t, z: pts[i - 1][1] + dz * t, angle: Math.atan2(dx, dz) };
    }
    acc += l;
  }
  return { x: pts[0][0], z: pts[0][1], angle: 0 };
}
