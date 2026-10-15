import { Rng } from './rng.js';
import { lerp } from './math.js';

// Value noise with smoothstep interpolation: cheap, good enough for coastlines and grime.
export function makeNoise(seed) {
  const r = new Rng(seed), S = 256, grid = new Float32Array(S * S);
  for (let i = 0; i < grid.length; i++) grid[i] = r.next();
  const at = (x, y) => grid[(y & 255) * S + (x & 255)];
  return function noise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return lerp(lerp(at(xi, yi), at(xi + 1, yi), u), lerp(at(xi, yi + 1), at(xi + 1, yi + 1), u), v);
  };
}
export function fbm(noise, x, y, oct = 3) {
  let s = 0, a = 0.5, f = 1, t = 0;
  for (let i = 0; i < oct; i++) { s += noise(x * f, y * f) * a; t += a; a *= 0.5; f *= 2; }
  return s / t;
}
