// Seeded, serializable RNG (mulberry32). State lives in a plain object so runs can be saved and replayed.
export interface Rng {
  s: number;
}

export function makeRng(seed: number): Rng {
  return { s: seed >>> 0 };
}

export function next(r: Rng): number {
  r.s = (r.s + 0x6d2b79f5) >>> 0;
  let t = r.s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Inclusive integer in [lo, hi]. */
export function int(r: Rng, lo: number, hi: number): number {
  return lo + Math.floor(next(r) * (hi - lo + 1));
}

export function pick<T>(r: Rng, arr: readonly T[]): T {
  return arr[Math.floor(next(r) * arr.length)];
}

export function shuffle<T>(r: Rng, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(next(r) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function weighted<T>(r: Rng, entries: readonly [T, number][]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let x = next(r) * total;
  for (const [v, w] of entries) {
    x -= w;
    if (x < 0) return v;
  }
  return entries[entries.length - 1][0];
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
