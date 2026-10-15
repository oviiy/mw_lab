export const TAU = Math.PI * 2;
// World layout: an (N+1)x(N+1) lattice of road centre-lines, B metres apart.
export const B = 120, R = 22, N = 10, W = B * N, LANE = 5.5;

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (cur, target, lambda, dt) => lerp(cur, target, 1 - Math.exp(-lambda * dt));
export const wrapAngle = (a) => a - TAU * Math.round(a / TAU);
export const angleDiff = (a, b) => wrapAngle(b - a);
export const dampAngle = (cur, target, lambda, dt) => cur + wrapAngle(target - cur) * (1 - Math.exp(-lambda * dt));
export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const dist = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

// Mulberry32 seeded PRNG — keeps the city identical between runs.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Heading convention used everywhere: direction = (cos a, sin a) in (x, z).
// Model meshes face +X, so mesh.rotation.y = -a.
export const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
