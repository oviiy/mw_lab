// Axial hex grid (pointy-top). Pure helpers, no DOM.
export const R = 4;
export const SQ3 = Math.sqrt(3);
export const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]; // E NE NW W SW SE
export const K = (q, r) => q + ',' + r;
export const P = (k) => k.split(',').map(Number);
export const inB = (q, r, rad = R) => Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= rad;
export const hd = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - bq - br)) / 2;

export function makeGrid(rad = R) {
  const keys = [], nb = {};
  for (let q = -rad; q <= rad; q++) for (let r = -rad; r <= rad; r++) if (inB(q, r, rad)) keys.push(K(q, r));
  for (const k of keys) {
    const [q, r] = P(k);
    nb[k] = DIRS.map(([dq, dr]) => [q + dq, r + dr]).filter(([a, b]) => inB(a, b, rad)).map(([a, b]) => K(a, b));
  }
  return { rad, keys, nb };
}

// world-space centre of a hex (x right, z down the screen), unit hex radius
export const hexXZ = (q, r) => [SQ3 * (q + r / 2), 1.5 * r];

export function mulberry(seed) {
  let s = seed | 0;
  const f = () => { s = (s + 0x6D2B79F5) | 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  f.state = () => s; f.set = (v) => { s = v | 0; };
  return f;
}
export function hashStr(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h | 0; }
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
