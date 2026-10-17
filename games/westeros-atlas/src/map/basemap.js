// Procedural base map (v2, aged-parchment look): land mask -> elevation -> washes -> paper. The raster covers the WHOLE padded world
// (sea included) so there is never a visible edge. Terrain glyphs are placed from the elevation field, not hand-listed.
import { WORLD } from '../data/regions.js';
import { LAND, MOUNTAINS, BIOMES, FORESTS, SWAMPS, DESERTS, PLAINS } from './geo.js';
import { smoothPath, noise2, fbm, clamp, rng } from '../kit/util.js';

export const SCALE = 0.44, OFF = 340; // raster px per world unit, world padding on every side
export const RW = Math.round((WORLD.w + OFF * 2) * SCALE), RH = Math.round((WORLD.h + OFF * 2) * SCALE);

/** Smooth + roughen a polygon (world units). Deterministic. */
export function roughen(poly, seed = 1, closed = true) {
  const base = smoothPath(poly, 10, closed);
  let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
  for (const [x, y] of base) { minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
  const size = Math.max(maxx - minx, maxy - miny), amp = clamp(size * 0.012, 0.2, 2.6), big = size > 300 ? 1 : 0;
  const out = [], N = base.length;
  for (let i = 0; i < N; i++) {
    const a = base[i], b = base[(i + 1) % N], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const steps = Math.max(1, Math.ceil(len / 1.4)), nx = -dy / len, ny = dx / len;
    for (let s = 0; s < steps; s++) {
      const t = s / steps, x = a[0] + dx * t, y = a[1] + dy * t;
      const d = big * (noise2(x * 0.022, y * 0.022, seed + 2) - 0.5) * 2 * amp * 1.6 + (noise2(x * 0.07, y * 0.07, seed) - 0.5) * 2 * amp + (noise2(x * 0.31, y * 0.31, seed + 5) - 0.5) * amp * 0.8 + (noise2(x * 1.3, y * 1.3, seed + 9) - 0.5) * amp * 0.3;
      out.push([x + nx * d, y + ny * d]);
    }
  }
  return out;
}
export function buildLandPaths() {
  const polys = []; let seed = 3;
  for (const [name, v] of Object.entries(LAND)) { const list = Array.isArray(v[0][0]) ? v : [v]; for (const p of list) polys.push({ name, pts: roughen(p, seed++), raw: p }); }
  const path = new Path2D();
  for (const { pts } of polys) { path.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) path.lineTo(pts[i][0], pts[i][1]); path.closePath(); }
  return { polys, path };
}
const hex = (n) => [(n >> 16) & 255, (n >> 8) & 255, n & 255];
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const ix = (wx) => (wx + OFF) * SCALE, iy = (wy) => (wy + OFF) * SCALE;

export async function buildBasemap(landPath) {
  const W = RW, H = RH, mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const maskC = mk(W, H), mg = maskC.getContext('2d'); mg.setTransform(SCALE, 0, 0, SCALE, OFF * SCALE, OFF * SCALE); mg.fillStyle = '#fff'; mg.fill(landPath);
  const mask = mg.getImageData(0, 0, W, H).data;
  const soft = (div) => { const s = mk(Math.max(8, Math.round(W / div)), Math.max(8, Math.round(H / div))); const g = s.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(maskC, 0, 0, s.width, s.height); const o = mk(W, H), og = o.getContext('2d'); og.imageSmoothingQuality = 'high'; og.drawImage(s, 0, 0, W, H); return og.getImageData(0, 0, W, H).data; };
  const s1 = soft(10), s2 = soft(34), s3 = soft(90);
  // biome washes
  const bw = Math.round(W / 4), bh = Math.round(H / 4), bioC = mk(bw, bh), bg = bioC.getContext('2d');
  for (const [cx, cy, rx, ry, col, str] of BIOMES) {
    if (!str) continue; const [r, g, b] = hex(col);
    bg.save(); bg.translate(ix(cx) / 4, iy(cy) / 4); bg.scale(rx * SCALE / 4, ry * SCALE / 4);
    const gr = bg.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, `rgba(${r},${g},${b},${str})`); gr.addColorStop(0.6, `rgba(${r},${g},${b},${str * 0.55})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    bg.fillStyle = gr; bg.beginPath(); bg.arc(0, 0, 1, 0, 7); bg.fill(); bg.restore();
  }
  const bigBio = mk(W, H), bbg = bigBio.getContext('2d'); bbg.imageSmoothingQuality = 'high'; bbg.drawImage(bioC, 0, 0, W, H);
  const bio = bbg.getImageData(0, 0, W, H).data;
  // elevation
  const h = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, wx = x / SCALE - OFF, wy = y / SCALE - OFF, land = mask[i * 4 + 3] > 8;
    const inl = clamp((s2[i * 4 + 3] / 255 - 0.5) * 2.2, 0, 1);
    h[i] = land ? (0.16 * inl + 0.55 * fbm(wx * 0.006, wy * 0.006, 4, 11) * (0.35 + 0.65 * inl) + 0.16 * fbm(wx * 0.03, wy * 0.03, 2, 2)) : 0;
  }
  // flatten named lowlands (grass seas, swamps, deserts, farmland) so random relief does not sprout hills there
  for (const f of [...PLAINS, ...SWAMPS, ...DESERTS]) {
    const k = f.flat ?? 0.55, x0 = Math.max(0, Math.floor(ix(f.c[0] - f.rx))), x1 = Math.min(W, Math.ceil(ix(f.c[0] + f.rx))), y0 = Math.max(0, Math.floor(iy(f.c[1] - f.ry))), y1 = Math.min(H, Math.ceil(iy(f.c[1] + f.ry)));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const dx = (x / SCALE - OFF - f.c[0]) / f.rx, dy = (y / SCALE - OFF - f.c[1]) / f.ry, d = dx * dx + dy * dy; if (d < 1) h[y * W + x] *= 1 - k * (1 - d); }
  }
  for (const m of MOUNTAINS) for (let k = 0; k < m.pts.length - 1; k++) {
    const [ax, ay] = m.pts[k], [bx, by] = m.pts[k + 1], len = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.ceil(len / 2)), norm = Math.min(1, 32 / (m.w * 1.8)) * (m.k || 1);   // wide ranges: same peak height, not taller
    for (let s = 0; s <= n; s++) {
      const cx = ix(ax + (bx - ax) * s / n), cy = iy(ay + (by - ay) * s / n), R = m.w * 1.8 * SCALE;
      for (let y = Math.max(0, Math.floor(cy - R)); y < Math.min(H, Math.ceil(cy + R)); y++) for (let x = Math.max(0, Math.floor(cx - R)); x < Math.min(W, Math.ceil(cx + R)); x++) {
        const d = Math.hypot(x - cx, y - cy) / R; if (d > 1) continue; const i = y * W + x; if (mask[i * 4 + 3] < 8) continue;
        const rid = 1 - Math.abs(noise2(x * 0.22, y * 0.22, 7) * 2 - 1); h[i] += (1 - d) * (1 - d) * (0.3 + 0.45 * rid) * 0.62 * norm;
      }
    }
  }
  // colour
  const out = new ImageData(W, H), od = out.data;
  const vell = hex(0xeadcb6), rim = hex(0xcfae74), rock = hex(0xb7a889), snow = hex(0xf2f1e8);
  const seaShelf = hex(0xc9d6c4), seaMid = hex(0xa9c2bb), seaDeep = hex(0x86a6a6), paper = hex(0xe3d3a8);
  const L = [-0.62, -0.62, 0.48];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, a = mask[i * 4 + 3], wx = x / SCALE - OFF, wy = y / SCALE - OFF;
    let c;
    const stain = (noise2(x * 0.012, y * 0.012, 41) - 0.5) * 34 + (noise2(x * 0.04, y * 0.04, 43) - 0.5) * 14;
    if (a < 3) {
      // sea: parchment-blue wash, lighter shelf near the coast, deeper offshore
      const near = clamp((s1[i * 4 + 3] / 255) * 2.2, 0, 1), mid = clamp(s2[i * 4 + 3] / 255 * 2.6, 0, 1), far = clamp(s3[i * 4 + 3] / 255 * 3.5, 0, 1);
      c = mix(seaDeep, seaMid, clamp(mid * 1.1, 0, 1)); c = mix(c, seaShelf, clamp(near * 1.0, 0, 1) * 0.85); c = mix(c, hex(0xd5d7bd), far * 0.25);
      const ripple = Math.sin((s1[i * 4 + 3] / 255) * 40 + noise2(x * 0.05, y * 0.05, 5) * 3) * 6 * near;
      od[i * 4] = clamp(c[0] + stain * 0.7 + ripple, 0, 255); od[i * 4 + 1] = clamp(c[1] + stain * 0.7 + ripple, 0, 255); od[i * 4 + 2] = clamp(c[2] + stain * 0.5 + ripple, 0, 255); od[i * 4 + 3] = 255; continue;
    }
    const gx = (h[i + (x < W - 1 ? 1 : 0)] - h[i - (x > 0 ? 1 : 0)]) * 15, gy = (h[i + (y < H - 1 ? W : 0)] - h[i - (y > 0 ? W : 0)]) * 15;
    const nl = Math.hypot(gx, gy, 1), dot = (-gx * L[0] - gy * L[1] + L[2]) / nl, shade = clamp(0.8 + dot * 0.34, 0.6, 1.1);
    c = vell; const ba = bio[i * 4 + 3] / 255; if (ba > 0.01) c = mix(c, [bio[i * 4], bio[i * 4 + 1], bio[i * 4 + 2]], clamp(ba * 1.25, 0, 0.9));
    const el = clamp((h[i] - 0.42) * 2.2, 0, 1); c = mix(c, rock, el * 0.5);
    if (wy < 330) c = mix(c, snow, clamp((330 - wy) / 180, 0, 0.85) * 0.55);
    const inl = clamp((s2[i * 4 + 3] / 255 - 0.5) * 2.2, 0, 1), rimK = 1 - clamp(inl / 0.22, 0, 1);
    c = mix(c, rim, rimK * 0.5);
    const fibre = (noise2(x * 1.7, y * 0.35, 9) - 0.5) * 10;
    od[i * 4] = clamp(c[0] * shade + stain + fibre, 0, 255); od[i * 4 + 1] = clamp(c[1] * shade + stain + fibre, 0, 255); od[i * 4 + 2] = clamp(c[2] * shade + stain * 0.8 + fibre, 0, 255); od[i * 4 + 3] = 255;
  }
  const outC = mk(W, H); outC.getContext('2d').putImageData(out, 0, 0);
  const hAt = (wx, wy) => { const x = Math.round(ix(wx)), y = Math.round(iy(wy)); return x >= 0 && y >= 0 && x < W && y < H ? h[y * W + x] : 0; };
  const isLand = (wx, wy) => { const x = Math.round(ix(wx)), y = Math.round(iy(wy)); return x >= 0 && y >= 0 && x < W && y < H && mask[(y * W + x) * 4 + 3] > 8; };
  return { canvas: outC, heightAt: hAt, isLand };
}

/** Terrain glyphs (mountains, hills, trees, reeds, dunes) placed from the elevation field. Sorted back-to-front. */
export function placeGlyphs(heightAt, isLand) {
  const r = rng(2024), out = [], taken = [];
  const free = (x, y, d) => !taken.some((q) => Math.abs(q[0] - x) < d && Math.abs(q[1] - y) < d);
  // mountains & hills from elevation
  for (let y = -120; y < WORLD.h + 120; y += 7) for (let x = -120; x < WORLD.w + 120; x += 7) {
    const wx = x + r.range(-3, 3), wy = y + r.range(-3, 3); if (!isLand(wx, wy)) continue;
    const e = heightAt(wx, wy), north = wy < 320 || (wy < 470 && wx < 650 && noise2(wx * 0.05, wy * 0.05, 3) > 0.62);
    if (e > 0.66 && r() < 0.42 && free(wx, wy, 11) && taken.push([wx, wy])) out.push({ t: (wx < 700 && north) || (wy < 360) || (wx > 2000 && wx < 2200 && wy < 640) || (wx > 2900 && wy < 1100) ? 'snow' : 'mountain', v: (r() * 8) | 0, x: wx, y: wy, s: 0.7 + Math.min(e - 0.62, 0.85) * 1.8 + r() * 0.35 });
    else if (e > 0.42 && r() < (e - 0.4) * 1.1 && free(wx, wy, 8) && taken.push([wx, wy])) out.push({ t: 'hill', v: (r() * 7) | 0, x: wx, y: wy, s: 0.8 + r() * 0.5 });
  }
  // forests
  for (const f of FORESTS) for (const [cx, cy, fr, fn] of f.parts) for (let i = 0; i < fn * 2.2; i++) {
    const a = r() * 6.283, d = Math.sqrt(r()) * fr * 1.1, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8; if (!isLand(x, y) || heightAt(x, y) > 0.7) continue;
    out.push({ t: f.k === 'palm' ? 'palm' : f.k === 'pine' ? 'pine' : 'oak', v: (r() * 4) | 0, x, y, s: 0.85 + r() * 0.5 });
  }
  // swamps (reeds) and deserts (dunes), from geo.js SWAMPS / DESERTS
  const inEll = (f, x, y) => ((x - f.c[0]) / f.rx) ** 2 + ((y - f.c[1]) / f.ry) ** 2 < 1;
  for (const f of SWAMPS) for (let i = 0; i < f.n; i++) { const x = f.c[0] + (r() - 0.5) * 2 * f.rx, y = f.c[1] + (r() - 0.5) * 2 * f.ry; if (inEll(f, x, y) && isLand(x, y)) out.push({ t: 'reeds', v: (r() * 3) | 0, x, y, s: 0.8 + r() * 0.4 }); }
  for (const f of DESERTS) for (let i = 0; i < f.n; i++) { const x = f.c[0] + (r() - 0.5) * 2 * f.rx, y = f.c[1] + (r() - 0.5) * 2 * f.ry; if (inEll(f, x, y) && isLand(x, y)) out.push({ t: 'dune', v: (r() * 3) | 0, x, y, s: 0.8 + r() * 0.5 }); }
  out.sort((a, b) => a.y - b.y);
  return out;
}
