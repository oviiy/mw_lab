import * as THREE from 'three';

/* -------------------------------------------------------------------------
   Procedural PBR texture kit. Everything is painted into canvases at start-up:
   albedo + height (-> normal map) + packed ORM (R=ao, G=roughness, B=metal) +
   emissive. No image files are shipped.
   ------------------------------------------------------------------------- */

const mk = (w, h = w) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
function tex(c, { repeat = true, srgb = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = aniso;
  return t;
}
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/* ---------- tileable value noise ---------- */
function latticeNoise(rng, period) {
  const g = new Float32Array(period * period); for (let i = 0; i < g.length; i++) g[i] = rng();
  return (x, y) => {
    const fx = x * period, fy = y * period, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const i0 = x0 % period, i1 = (x0 + 1) % period, j0 = (y0 % period) * period, j1 = ((y0 + 1) % period) * period;
    const a = g[j0 + i0] + (g[j0 + i1] - g[j0 + i0]) * sx, b = g[j1 + i0] + (g[j1 + i1] - g[j1 + i0]) * sx;
    return a + (b - a) * sy;
  };
}
function fbmField(S, rng, periods, weights) {
  const fns = periods.map((p) => latticeNoise(rng, p)), out = new Float32Array(S * S); let tot = 0; weights.forEach((w) => (tot += w));
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { let v = 0; for (let k = 0; k < fns.length; k++) v += fns[k](x / S, y / S) * weights[k]; out[y * S + x] = v / tot; }
  return out;
}

// Height (0..1 Float32 or gray canvas) -> tangent-space normal map (seamless).
function normalFromField(H, S, strength) {
  const [c, g] = mk(S), img = g.createImageData(S, S), d = img.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const xl = (x - 1 + S) % S, xr = (x + 1) % S, yu = (y - 1 + S) % S, yd = (y + 1) % S;
    const dx = (H[y * S + xr] - H[y * S + xl]) * strength, dy = (H[yd * S + x] - H[yu * S + x]) * strength;
    const l = Math.hypot(dx, dy, 1), i = (y * S + x) * 4;
    d[i] = (-dx / l * 0.5 + 0.5) * 255; d[i + 1] = (dy / l * 0.5 + 0.5) * 255; d[i + 2] = (1 / l * 0.5 + 0.5) * 255; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); return c;
}
function fieldFromCanvas(c) {
  const S = c.width, d = c.getContext('2d').getImageData(0, 0, S, S).data, H = new Float32Array(S * S);
  for (let i = 0; i < H.length; i++) H[i] = d[i * 4] / 255; return H;
}

// Four aligned canvases that get painted together.
class Layers {
  constructor(S, hBase = 128) {
    this.S = S;
    [this.a, this.ga] = mk(S); [this.h, this.gh] = mk(S); [this.o, this.go] = mk(S); [this.e, this.ge] = mk(S);
    this.gh.fillStyle = `rgb(${hBase},${hBase},${hBase})`; this.gh.fillRect(0, 0, S, S);
    this.go.fillStyle = 'rgb(255,200,0)'; this.go.fillRect(0, 0, S, S);
    this.ge.fillStyle = '#000'; this.ge.fillRect(0, 0, S, S);
  }
  rect(x, y, w, h, col, hv = 128, rough = 0.8, metal = 0, emit = null) {
    this.ga.fillStyle = col; this.ga.fillRect(x, y, w, h);
    this.gh.fillStyle = `rgb(${hv | 0},${hv | 0},${hv | 0})`; this.gh.fillRect(x, y, w, h);
    this.go.fillStyle = `rgb(255,${(rough * 255) | 0},${(metal * 255) | 0})`; this.go.fillRect(x, y, w, h);
    if (emit) { this.ge.fillStyle = emit; this.ge.fillRect(x, y, w, h); }
  }
  emit(x, y, w, h, col) { this.ge.fillStyle = col; this.ge.fillRect(x, y, w, h); }
  // multiply-style dirt/noise over albedo only
  grime(rng, n, a0 = 0.04, size = 6) { for (let i = 0; i < n; i++) { this.ga.fillStyle = `rgba(0,0,0,${rng() * a0})`; this.ga.fillRect(rng() * this.S, rng() * this.S, 1 + rng() * size, 1 + rng() * size); } }
  streaks(rng, n, a0 = 0.08) { for (let i = 0; i < n; i++) { const x = rng() * this.S, w = 1 + rng() * 5, y = rng() * this.S, l = 20 + rng() * 140; const gr = this.ga.createLinearGradient(0, y, 0, y + l); gr.addColorStop(0, `rgba(30,25,20,${rng() * a0})`); gr.addColorStop(1, 'rgba(30,25,20,0)'); this.ga.fillStyle = gr; this.ga.fillRect(x, y, w, l); } }
  finish(strength = 3, normalBlur = true) {
    const H = fieldFromCanvas(this.h);
    return { map: tex(this.a), normal: tex(normalFromField(H, this.S, strength), { srgb: false }), orm: tex(this.o, { srgb: false }), emissive: tex(this.e) };
  }
}

/* ---------- building facades: 3 architectural styles ---------- */
export function facadeSet(rng) {
  const S = 1024, n = 8, c = S / n;
  const hsl = (h, s, l) => `hsl(${h},${s}%,${l}%)`;

  // A: glass curtain wall
  const A = new Layers(S, 150);
  A.rect(0, 0, S, S, '#8c949c', 150, 0.4, 0.75);
  for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) {
    const x = q * c, y = r * c;
    A.rect(x, y + c * 0.7, c, c * 0.3, '#39434d', 140, 0.45, 0.55); // spandrel
    const gx = x + 5, gy = y + 5, gw = c - 10, gh = c * 0.7 - 7, b = 24 + rng() * 22;
    A.rect(gx, gy, gw, gh, `rgb(${b - 8},${b + 8},${b + 16})`, 95, 0.04, 0.12);
    if (rng() < 0.28) { for (let k = 0; k < 9; k++) A.rect(gx, gy + k * (gh / 9), gw, gh / 18, 'rgba(185,180,168,0.9)', 120, 0.7, 0); }
    if (rng() < 0.38) { const w = gw * (0.4 + rng() * 0.6), warm = rng() < 0.78; A.emit(gx + (gw - w) / 2, gy + gh * 0.15, w, gh * 0.85, warm ? `rgb(255,${185 + rng() * 40 | 0},${105 + rng() * 40 | 0})` : `rgb(170,${205 + rng() * 30 | 0},255)`); }
    A.rect(x, y, c, 4, '#5c646c', 175, 0.4, 0.7);
  }
  for (let q = 0; q < n; q += 2) A.rect(q * c - 3, 0, 8, S, '#6a727a', 190, 0.35, 0.8);
  A.grime(rng, 800, 0.05); A.streaks(rng, 70, 0.07);

  // B: brick apartments with punched windows & balconies
  const Bk = new Layers(S, 130);
  Bk.rect(0, 0, S, S, '#9b968c', 90, 0.95, 0);
  const bh = 16, bw = 42;
  for (let y = 0, row = 0; y < S; y += bh, row++) for (let x = -(row % 2) * (bw / 2); x < S; x += bw) {
    const l = 30 + rng() * 14, hue = 8 + rng() * 14;
    Bk.rect(x + 1.5, y + 1.5, bw - 3, bh - 3, hsl(hue, 42 + rng() * 14, l), 150 + rng() * 40, 0.92, 0);
  }
  for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) {
    const x = q * c, y = r * c, wx = x + c * 0.2, wy = y + c * 0.14, ww = c * 0.6, wh = c * 0.62;
    Bk.rect(wx - 7, wy - 14, ww + 14, 14, '#bcb7aa', 205, 0.8, 0); // lintel
    Bk.rect(wx - 6, wy - 3, ww + 12, wh + 12, '#e6e2d6', 200, 0.55, 0); // frame
    const b = 22 + rng() * 22;
    Bk.rect(wx + 5, wy + 5, ww - 10, wh - 10, `rgb(${b - 6},${b + 6},${b + 14})`, 80, 0.05, 0.1);
    Bk.rect(wx + ww / 2 - 2, wy + 5, 4, wh - 10, '#e6e2d6', 210, 0.55, 0); Bk.rect(wx + 5, wy + wh * 0.4, ww - 10, 4, '#e6e2d6', 210, 0.55, 0);
    if (rng() < 0.4) { Bk.ga.fillStyle = `hsla(${rng() * 360 | 0},30%,70%,0.55)`; Bk.ga.fillRect(wx + 5, wy + 5, (ww - 10) * (0.3 + rng() * 0.4), wh - 10); }
    Bk.rect(wx - 12, wy + wh + 9, ww + 24, 9, '#b8b3a6', 225, 0.8, 0); // sill
    if (rng() < 0.38) { const w = ww - 10; Bk.emit(wx + 5, wy + 5, w, wh - 10, rng() < 0.8 ? `rgb(255,${180 + rng() * 40 | 0},${100 + rng() * 40 | 0})` : 'rgb(180,210,255)'); }
    if (rng() < 0.13 && r > 0) { Bk.rect(x + c * 0.06, y + c * 0.85, c * 0.88, 10, '#a09c92', 240, 0.8, 0); for (let k = 0; k < 9; k++) Bk.rect(x + c * 0.08 + k * (c * 0.84 / 8), y + c * 0.66, 3, c * 0.2, '#202226', 200, 0.4, 0.7); Bk.rect(x + c * 0.06, y + c * 0.64, c * 0.88, 4, '#202226', 205, 0.4, 0.7); }
  }
  Bk.grime(rng, 1400, 0.07); Bk.streaks(rng, 90, 0.12);

  // C: concrete / stone with ribbon windows and fins
  const Cc = new Layers(S, 128);
  Cc.rect(0, 0, S, S, '#b8b5ac', 130, 0.88, 0);
  for (let i = 0; i < 2600; i++) { Cc.ga.fillStyle = `rgba(${rng() < 0.5 ? '255,255,255' : '0,0,0'},${rng() * 0.05})`; Cc.ga.fillRect(rng() * S, rng() * S, 2 + rng() * 14, 2 + rng() * 6); }
  for (let r = 0; r < n; r++) {
    const y = r * c, wy = y + c * 0.2, wh = c * 0.52;
    Cc.rect(0, wy - 6, S, 8, '#a8a59c', 190, 0.85, 0);
    for (let q = 0; q < n * 2; q++) {
      const x = q * (c / 2), b = 26 + rng() * 24;
      Cc.rect(x + 3, wy, c / 2 - 6, wh, `rgb(${b - 8},${b + 6},${b + 14})`, 85, 0.05, 0.1);
      if (rng() < 0.34) Cc.emit(x + 3, wy, c / 2 - 6, wh, rng() < 0.78 ? `rgb(255,${185 + rng() * 40 | 0},${110 + rng() * 40 | 0})` : 'rgb(175,208,255)');
      Cc.rect(x - 1, wy, 3, wh, '#3a3d42', 170, 0.4, 0.7);
    }
    Cc.rect(0, wy + wh + 2, S, 7, '#9a978e', 175, 0.85, 0);
    for (let q = 0; q < n; q += 2) Cc.rect(q * c - 7, y, 16, c, '#cbc8bf', 205, 0.85, 0);
  }
  Cc.grime(rng, 1000, 0.06); Cc.streaks(rng, 130, 0.13);

  return { variants: [A.finish(2.4), Bk.finish(3.2), Cc.finish(2.6)] };
}

/* ---------- ground-floor shop fronts (16 m x 5 m tile) ---------- */
export function shopTexture(rng) {
  const W = 1024, H = 320, [a, ga] = mk(W, H), [hc, gh] = mk(W, H), [o, go] = mk(W, H), [e, ge] = mk(W, H);
  const rect = (x, y, w, h, col, hv, ro, me, em) => { ga.fillStyle = col; ga.fillRect(x, y, w, h); gh.fillStyle = `rgb(${hv},${hv},${hv})`; gh.fillRect(x, y, w, h); go.fillStyle = `rgb(255,${ro * 255 | 0},${me * 255 | 0})`; go.fillRect(x, y, w, h); if (em) { ge.fillStyle = em; ge.fillRect(x, y, w, h); } };
  ga.fillStyle = '#2d2f34'; ga.fillRect(0, 0, W, H); gh.fillStyle = 'rgb(128,128,128)'; gh.fillRect(0, 0, W, H); go.fillStyle = 'rgb(255,215,0)'; go.fillRect(0, 0, W, H); ge.fillStyle = '#000'; ge.fillRect(0, 0, W, H);
  const SIGNS = ['#ff3b6b', '#35e0ff', '#ffd23a', '#7cff6a', '#ff8a2a', '#c07bff', '#ffffff'];
  for (let s = 0; s < 4; s++) {
    const x = s * 256, kind = rng(), wall = `hsl(${rng() * 360 | 0},${12 + rng() * 25 | 0}%,${22 + rng() * 22 | 0}%)`;
    rect(x, 0, 256, H, wall, 128, 0.85, 0);
    // sign band
    const sc = SIGNS[Math.floor(rng() * SIGNS.length)];
    rect(x + 14, 14, 228, 54, '#15161a', 150, 0.4, 0.4);
    for (let g = 0; g < 5; g++) { const gx = x + 26 + g * 42; if (rng() < 0.85) { ga.fillStyle = sc; ga.fillRect(gx, 28, 30 + rng() * 6, 26); gh.fillStyle = 'rgb(210,210,210)'; gh.fillRect(gx, 28, 30, 26); ge.fillStyle = sc; ge.fillRect(gx, 28, 30 + rng() * 6, 26); } }
    // awning
    const ac = `hsl(${rng() * 360 | 0},60%,38%)`;
    for (let k = 0; k < 8; k++) rect(x + 10 + k * 29, 78, 29, 26, k % 2 ? ac : '#e6e2d6', 175, 0.85, 0);
    if (kind < 0.68) { // shop window
      rect(x + 12, 118, 232, 150, '#7d838b', 190, 0.4, 0.7);
      rect(x + 20, 126, 216, 134, 'rgb(18,26,34)', 100, 0.04, 0.92);
      const warm = rng() < 0.8 ? `rgb(255,${190 + rng() * 40 | 0},${120 + rng() * 40 | 0})` : 'rgb(185,215,255)';
      ge.fillStyle = warm; ge.fillRect(x + 22, 128, 212, 130);
      for (let sh = 0; sh < 3; sh++) { ga.fillStyle = 'rgba(60,45,30,0.9)'; ga.fillRect(x + 22, 160 + sh * 38, 212, 5); ge.fillStyle = 'rgba(0,0,0,0.6)'; ge.fillRect(x + 22, 160 + sh * 38, 212, 5); for (let it = 0; it < 6; it++) { ga.fillStyle = `hsl(${rng() * 360 | 0},60%,55%)`; ga.fillRect(x + 30 + it * 34, 142 + sh * 38, 22, 16); } }
      rect(x + 12, 268, 232, 40, wall, 160, 0.85, 0);
    } else if (kind < 0.88) { // door
      rect(x + 70, 100, 116, 220, '#6d737a', 190, 0.4, 0.7);
      rect(x + 80, 112, 96, 208, 'rgb(16,24,32)', 100, 0.05, 0.9); ge.fillStyle = 'rgb(255,200,130)'; ge.fillRect(x + 82, 114, 92, 160);
      rect(x + 126, 112, 4, 208, '#6d737a', 190, 0.4, 0.7); rect(x + 112, 200, 6, 26, '#c9ced4', 220, 0.2, 1); rect(x + 138, 200, 6, 26, '#c9ced4', 220, 0.2, 1);
    } else { // roller shutter
      rect(x + 12, 112, 232, 200, '#7c8087', 150, 0.5, 0.6);
      for (let k = 0; k < 20; k++) rect(x + 12, 112 + k * 10, 232, 2, '#4f5359', 100, 0.55, 0.6);
    }
  }
  const H1 = fieldFromCanvas2(hc, W, H);
  const nm = normalFromRect(H1, W, H, 3);
  return { map: tex(a), normal: tex(nm, { srgb: false }), orm: tex(o, { srgb: false }), emissive: tex(e) };
}
function fieldFromCanvas2(c, W, H) { const d = c.getContext('2d').getImageData(0, 0, W, H).data, f = new Float32Array(W * H); for (let i = 0; i < f.length; i++) f[i] = d[i * 4] / 255; return f; }
function normalFromRect(F, W, H, k) {
  const [c, g] = mk(W, H), img = g.createImageData(W, H), d = img.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (F[y * W + Math.min(W - 1, x + 1)] - F[y * W + Math.max(0, x - 1)]) * k, dy = (F[Math.min(H - 1, y + 1) * W + x] - F[Math.max(0, y - 1) * W + x]) * k, l = Math.hypot(dx, dy, 1), i = (y * W + x) * 4;
    d[i] = (-dx / l * 0.5 + 0.5) * 255; d[i + 1] = (dy / l * 0.5 + 0.5) * 255; d[i + 2] = (1 / l * 0.5 + 0.5) * 255; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); return c;
}

/* ---------- asphalt (with and without painted markings) ---------- */
export function roadTextures(rng) {
  const S = 512, h = fbmField(S, rng, [8, 16, 32, 64, 128], [1, 0.8, 0.6, 0.5, 0.35]), pud = fbmField(S, rng, [3, 6, 12], [1, 0.5, 0.25]);
  const make = (markings) => {
    const [ca, ga] = mk(S), [co, go] = mk(S), ia = ga.createImageData(S, S), io = go.createImageData(S, S), Hf = new Float32Array(S * S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x, u = x / S, hv = h[i];
      const tr = Math.exp(-(((u - 0.25) / 0.05) ** 2)) + Math.exp(-(((u - 0.75) / 0.05) ** 2));
      const p = smooth(0.66, 0.74, pud[i]);
      let base = 52 + hv * 46 + (rng() > 0.985 ? 28 : 0) - (rng() > 0.99 ? 22 : 0) - tr * 12;
      base *= 1 - p * 0.45;
      let r = base, g = base * 1.0, b = base * 1.03, rough = 0.93 - tr * 0.14 - p * 0.6, hh = hv * 0.55;
      if (markings) {
        const du = Math.abs(u - 0.5);
        const yellow = (du > 0.012 && du < 0.02), white = (u > 0.035 && u < 0.046) || (u > 0.954 && u < 0.965);
        const wear = rng() > 0.14 + smooth(0.45, 0.8, h[(i + 997) % h.length]) * 0.35;
        if ((yellow || white) && wear) { if (yellow) { r = 205; g = 168; b = 40; } else { r = 214; g = 214; b = 206; } rough = 0.6; hh += 0.12; }
      }
      Hf[i] = hh;
      const q = i * 4; ia.data[q] = r; ia.data[q + 1] = g; ia.data[q + 2] = b; ia.data[q + 3] = 255;
      io.data[q] = 255; io.data[q + 1] = Math.max(20, rough * 255); io.data[q + 2] = 0; io.data[q + 3] = 255;
    }
    ga.putImageData(ia, 0, 0); go.putImageData(io, 0, 0);
    return { map: tex(ca), normal: tex(normalFromField(Hf, S, 5), { srgb: false }), orm: tex(co, { srgb: false }) };
  };
  return { road: make(true), plain: make(false) };
}

export function crosswalkTexture(rng = Math.random) {
  const [c, g] = mk(256, 64);
  g.fillStyle = '#e8e8e0'; for (let i = 0; i < 18; i++) g.fillRect(i * 14.2 + 2, 0, 7.4, 64);
  const img = g.getImageData(0, 0, 256, 64);
  for (let i = 0; i < img.data.length; i += 4) if (img.data[i + 3] > 0 && rng() < 0.22) img.data[i + 3] = 40 + rng() * 120;
  g.putImageData(img, 0, 0);
  return tex(c, { repeat: false });
}

/* ---------- sidewalk paving / concrete ---------- */
export function sidewalkSet(rng) {
  const S = 256, L = new Layers(S, 120);
  const nz = fbmField(S, rng, [8, 16, 32], [1, 0.6, 0.4]);
  L.rect(0, 0, S, S, '#a7a59f', 120, 0.85, 0);
  const slab = S / 4;
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const v = 150 + rng() * 40; L.ga.fillStyle = `rgb(${v},${v - 2},${v - 6})`; L.ga.fillRect(x * slab + 2, y * slab + 2, slab - 4, slab - 4); L.gh.fillStyle = 'rgb(150,150,150)'; L.gh.fillRect(x * slab + 2, y * slab + 2, slab - 4, slab - 4); }
  L.ga.fillStyle = 'rgba(30,28,24,0.55)'; for (let i = 0; i <= 4; i++) { L.ga.fillRect(i * slab - 1, 0, 3, S); L.ga.fillRect(0, i * slab - 1, S, 3); }
  const img = L.ga.getImageData(0, 0, S, S);
  for (let i = 0; i < S * S; i++) { const k = (nz[i] - 0.5) * 36; img.data[i * 4] += k; img.data[i * 4 + 1] += k; img.data[i * 4 + 2] += k; }
  L.ga.putImageData(img, 0, 0);
  for (let i = 0; i < 90; i++) { L.ga.fillStyle = `rgba(50,45,38,${0.2 + rng() * 0.3})`; L.ga.beginPath(); L.ga.arc(rng() * S, rng() * S, 1 + rng() * 2.5, 0, 7); L.ga.fill(); }
  return L.finish(3);
}

export function grassSet(rng) {
  const S = 256, h = fbmField(S, rng, [8, 16, 32, 64], [1, 0.7, 0.5, 0.4]), [ca, ga] = mk(S), ia = ga.createImageData(S, S), [co, go] = mk(S);
  for (let i = 0; i < S * S; i++) {
    const v = h[i], dry = smooth(0.55, 0.75, v), q = i * 4;
    ia.data[q] = 58 + dry * 55 + rng() * 22; ia.data[q + 1] = 96 + (1 - dry) * 28 + rng() * 26; ia.data[q + 2] = 40 + rng() * 14; ia.data[q + 3] = 255;
  }
  ga.putImageData(ia, 0, 0); go.fillStyle = 'rgb(255,225,0)'; go.fillRect(0, 0, S, S);
  return { map: tex(ca), normal: tex(normalFromField(h, S, 5), { srgb: false }), orm: tex(co, { srgb: false }) };
}

export function roofSet(rng) {
  const S = 256, h = fbmField(S, rng, [16, 32, 64], [1, 0.8, 0.6]), [ca, ga] = mk(S), ia = ga.createImageData(S, S), [co, go] = mk(S);
  for (let i = 0; i < S * S; i++) { const v = 150 + h[i] * 56 + (rng() > 0.93 ? 22 : 0), q = i * 4; ia.data[q] = v; ia.data[q + 1] = v; ia.data[q + 2] = v + 2; ia.data[q + 3] = 255; }
  ga.putImageData(ia, 0, 0); go.fillStyle = 'rgb(255,240,0)'; go.fillRect(0, 0, S, S);
  return { map: tex(ca), normal: tex(normalFromField(h, S, 4), { srgb: false }), orm: tex(co, { srgb: false }) };
}

/* ---------- vegetation ---------- */
export function leafTexture(rng) {
  const S = 256, [c, g] = mk(S);
  const blob = (n, rad, cols, size) => {
    for (let i = 0; i < n; i++) {
      const a = rng() * 6.283, d = Math.sqrt(rng()) * rad, x = S / 2 + Math.cos(a) * d, y = S / 2 + Math.sin(a) * d;
      g.save(); g.translate(x, y); g.rotate(rng() * 6.283); g.fillStyle = cols[Math.floor(rng() * cols.length)];
      g.beginPath(); g.ellipse(0, 0, size * (0.6 + rng() * 0.7), size * 0.4, 0, 0, 7); g.fill(); g.restore();
    }
  };
  blob(420, S * 0.44, ['#1f4a1c', '#245522', '#1b4019'], 15);
  blob(520, S * 0.42, ['#2e6a2a', '#38792f', '#2b6226', '#437f33'], 12);
  blob(260, S * 0.36, ['#5a9a3d', '#6aa845', '#4d8d38'], 9);
  return tex(c, { repeat: false, aniso: 4 });
}
export function barkSet(rng) {
  const W = 64, H = 128, [ca, ga] = mk(W, H);
  ga.fillStyle = '#4b3a2c'; ga.fillRect(0, 0, W, H);
  for (let i = 0; i < 220; i++) { ga.fillStyle = `rgba(${rng() < 0.5 ? '20,14,10' : '110,88,66'},${0.15 + rng() * 0.35})`; ga.fillRect(rng() * W, rng() * H, 1 + rng() * 3, 8 + rng() * 40); }
  return tex(ca, { aniso: 4 });
}

/* ---------- sprites, decals, light beams ---------- */
function radial(size, stops) {
  const [c, g] = mk(size), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) gr.addColorStop(o, col);
  g.fillStyle = gr; g.fillRect(0, 0, size, size); return c;
}
export const glowTexture = () => tex(radial(64, [[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0)']]), { repeat: false });
export const puffTexture = () => tex(radial(64, [[0, 'rgba(255,255,255,0.9)'], [0.5, 'rgba(255,255,255,0.4)'], [1, 'rgba(255,255,255,0)']]), { repeat: false });
export const blobShadowTexture = () => tex(radial(64, [[0, 'rgba(0,0,0,0.75)'], [0.55, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)']]), { repeat: false });

export function decalTexture(color, rng) {
  const [c, g] = mk(128);
  for (let i = 0; i < 14; i++) {
    const a = rng() * 6.28, d = rng() * 30, r = 8 + rng() * 22, x = 64 + Math.cos(a) * d, y = 64 + Math.sin(a) * d;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  }
  return tex(c, { repeat: false });
}

export function beamTexture() {
  const W = 64, H = 128, [c, g] = mk(W, H), img = g.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const tt = 1 - y / (H - 1), u = (x - 31.5) / 32, w = 0.16 + 0.8 * tt, a = Math.exp(-((u / w) ** 2) * 2.4) * (1 - tt) ** 1.5 * smooth(0, 0.05, tt), i = (y * W + x) * 4;
    img.data[i] = 255; img.data[i + 1] = 238; img.data[i + 2] = 190; img.data[i + 3] = a * 255;
  }
  g.putImageData(img, 0, 0);
  return tex(c, { repeat: false });
}
