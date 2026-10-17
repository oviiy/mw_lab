// Original, procedurally painted tileable textures (no external assets, nothing traced or downloaded).
import * as THREE from 'three';
import { rng, noise2, fbm } from './util.js';

const cache = new Map();
const S = 256;

function canvas() {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  return c;
}
const grey = (v) => { v = Math.max(0, Math.min(255, v | 0)); return `rgb(${v},${v},${v})`; };

// Fill with tileable-ish noise (wraps by sampling periodic coordinates).
function noiseFill(ctx, base, amp, freq, seed, oct = 3) {
  const img = ctx.getImageData(0, 0, S, S);
  const d = img.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    // periodic mapping via blending of shifted samples
    const u = x / S * freq, v = y / S * freq;
    const a = fbm(u, v, oct, seed), b = fbm(u - freq, v, oct, seed), c = fbm(u, v - freq, oct, seed), e = fbm(u - freq, v - freq, oct, seed);
    const fx = x / S, fy = y / S;
    const n = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + e * fx) * fy;
    const val = base + (n - 0.5) * amp;
    const i = (y * S + x) * 4;
    d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, val)); d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

const painters = {
  stone(ctx) {
    // irregular ashlar: rows of varying height, blocks of varying width, soft mortar — tileable, reads as cut stone not brick
    const r = rng(11);
    noiseFill(ctx, 196, 46, 6, 3);
    const heights = []; let tot = 0; while (tot < S) { const hgt = Math.min(S - tot, r.int(26, 46)); heights.push(hgt); tot += hgt; }
    let y = 0;
    for (const rh of heights) {
      let x = -r.range(0, 60);
      while (x < S) {
        const bw = r.range(38, 96), tone = 188 + r.range(-34, 30);
        for (const ox of [0, -S, S]) {
          ctx.globalAlpha = 0.42; ctx.fillStyle = grey(tone); ctx.fillRect(x + ox + 1.5, y + 1.5, bw - 3, rh - 3);
          ctx.globalAlpha = 0.18; ctx.fillStyle = grey(tone + 30); ctx.fillRect(x + ox + 2, y + 2, bw - 4, 3);   // lit top edge
          ctx.globalAlpha = 0.16; ctx.fillStyle = grey(tone - 50); ctx.fillRect(x + ox + 2, y + rh - 5, bw - 4, 3); // shaded lower edge
          ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(55,52,48,0.32)'; ctx.lineWidth = 1.6; ctx.strokeRect(x + ox + 0.8, y + 0.8, bw - 1.6, rh - 1.6);
        }
        x += bw;
      }
      y += rh;
    }
    speckle(ctx, 1400, 26);
  },
  rock(ctx) { noiseFill(ctx, 175, 110, 5, 7, 5); speckle(ctx, 1200, 30); },
  plaster(ctx) { noiseFill(ctx, 225, 24, 4, 21, 4); speckle(ctx, 700, 14); },
  wood(ctx) {
    const r = rng(5);
    ctx.fillStyle = grey(190); ctx.fillRect(0, 0, S, S);
    const pl = 8, w = S / pl;
    for (let i = 0; i < pl; i++) {
      ctx.fillStyle = grey(175 + r.range(-25, 25)); ctx.fillRect(i * w, 0, w, S);
      ctx.strokeStyle = 'rgba(40,30,20,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(i * w, 0); ctx.lineTo(i * w, S); ctx.stroke();
      for (let g = 0; g < 14; g++) {
        ctx.strokeStyle = `rgba(60,45,30,${r.range(0.08, 0.22)})`; ctx.lineWidth = r.range(0.6, 1.6);
        const gx = i * w + r.range(2, w - 2); ctx.beginPath(); ctx.moveTo(gx, 0);
        ctx.bezierCurveTo(gx + r.range(-3, 3), S * 0.3, gx + r.range(-3, 3), S * 0.7, gx + r.range(-2, 2), S); ctx.stroke();
      }
    }
  },
  tile(ctx) {
    const r = rng(9);
    ctx.fillStyle = grey(200); ctx.fillRect(0, 0, S, S);
    const rows = 8, rh = S / rows, cols = 8, cw = S / cols;
    for (let row = 0; row < rows; row++) for (let c = -1; c < cols; c++) {
      const x = c * cw + (row % 2) * cw / 2, y = row * rh;
      ctx.fillStyle = grey(205 + r.range(-30, 25)); ctx.beginPath();
      ctx.roundRect(x + 1, y, cw - 2, rh + 3, [0, 0, cw * 0.4, cw * 0.4]); ctx.fill();
      ctx.strokeStyle = 'rgba(30,20,20,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
  },
  thatch(ctx) {
    const r = rng(3);
    noiseFill(ctx, 190, 50, 5, 13, 3);
    for (let i = 0; i < 700; i++) {
      ctx.strokeStyle = `rgba(${r() < 0.5 ? '30,24,10' : '255,240,200'},${r.range(0.06, 0.2)})`;
      ctx.lineWidth = r.range(0.6, 1.4);
      const x = r.range(0, S), y = r.range(0, S); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r.range(-3, 3), y + r.range(10, 34)); ctx.stroke();
    }
  },
  grass(ctx) {
    const r = rng(17);
    noiseFill(ctx, 190, 70, 6, 29, 4);
    for (let i = 0; i < 1400; i++) {
      ctx.strokeStyle = `rgba(${r() < 0.5 ? '20,40,10' : '230,255,200'},${r.range(0.05, 0.16)})`; ctx.lineWidth = 1;
      const x = r.range(0, S), y = r.range(0, S); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r.range(-2, 2), y - r.range(2, 7)); ctx.stroke();
    }
  },
  sand(ctx) {
    noiseFill(ctx, 215, 40, 7, 41, 3);
    const r = rng(2);
    for (let i = 0; i < 40; i++) { ctx.strokeStyle = `rgba(120,90,50,${r.range(0.03, 0.08)})`; ctx.lineWidth = r.range(1, 3); ctx.beginPath(); const y = r.range(0, S); ctx.moveTo(0, y); ctx.bezierCurveTo(S * 0.3, y + r.range(-8, 8), S * 0.6, y + r.range(-8, 8), S, y); ctx.stroke(); }
  },
  snow(ctx) { noiseFill(ctx, 240, 22, 5, 51, 3); speckle(ctx, 300, 8); },
  brick(ctx) {
    const r = rng(23);
    ctx.fillStyle = grey(150); ctx.fillRect(0, 0, S, S);
    const rows = 16, rh = S / rows, cols = 8, cw = S / cols;
    for (let row = 0; row < rows; row++) for (let c = -1; c < cols; c++) {
      const x = c * cw + (row % 2) * cw / 2, y = row * rh;
      ctx.fillStyle = grey(200 + r.range(-35, 25)); ctx.fillRect(x + 1.5, y + 1.5, cw - 3, rh - 3);
    }
    speckle(ctx, 600, 20);
  },
  marble(ctx) {
    noiseFill(ctx, 235, 20, 3, 61, 3);
    const r = rng(8);
    for (let i = 0; i < 9; i++) {
      ctx.strokeStyle = `rgba(90,100,120,${r.range(0.08, 0.2)})`; ctx.lineWidth = r.range(0.6, 2); ctx.beginPath();
      let x = r.range(0, S), y = 0; ctx.moveTo(x, y);
      for (let k = 0; k < 8; k++) { x += r.range(-26, 26); y += S / 8; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  },
  slate(ctx) {
    const r = rng(31);
    noiseFill(ctx, 170, 40, 5, 71, 3);
    const rows = 8, rh = S / rows;
    for (let row = 0; row < rows; row++) {
      ctx.strokeStyle = 'rgba(20,20,30,0.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, row * rh); ctx.lineTo(S, row * rh); ctx.stroke();
      for (let c = 0; c < 6; c++) { const x = c * S / 6 + (row % 2) * S / 12 + r.range(-3, 3); ctx.beginPath(); ctx.moveTo(x, row * rh); ctx.lineTo(x, (row + 1) * rh); ctx.stroke(); }
    }
  },
  cobble(ctx) {
    const r = rng(77);
    ctx.fillStyle = grey(120); ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 90; i++) {
      const x = r.range(0, S), y = r.range(0, S), rad = r.range(9, 15);
      ctx.fillStyle = grey(165 + r.range(-35, 35));
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { ctx.beginPath(); ctx.ellipse(x + ox, y + oy, rad, rad * 0.8, r(), 0, 7); ctx.fill(); }
    }
    speckle(ctx, 500, 20);
  },
  water(ctx) { noiseFill(ctx, 128, 255, 8, 91, 4); },
};

function speckle(ctx, n, amp) {
  const r = rng(n);
  for (let i = 0; i < n; i++) {
    const v = r() < 0.5 ? 0 : 255;
    ctx.fillStyle = `rgba(${v},${v},${v},${r.range(0.02, amp / 255)})`;
    ctx.fillRect(r.range(0, S), r.range(0, S), r.range(1, 3), r.range(1, 3));
  }
}

export function texture(kind) {
  if (cache.has(kind)) return cache.get(kind);
  const c = canvas(); const ctx = c.getContext('2d');
  (painters[kind] || painters.stone)(ctx);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.generateMipmaps = true;
  cache.set(kind, t);
  return t;
}
export const TEXTURE_KINDS = Object.keys(painters);

/** Soft radial sprite texture used by fire, smoke, glows. */
export function spriteTexture(kind = 'soft') {
  const key = 'sprite:' + kind;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  if (kind === 'fire') { grad.addColorStop(0, 'rgba(255,250,200,1)'); grad.addColorStop(0.3, 'rgba(255,170,60,0.85)'); grad.addColorStop(1, 'rgba(255,60,0,0)'); }
  else { grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.5, 'rgba(255,255,255,0.45)'); grad.addColorStop(1, 'rgba(255,255,255,0)'); }
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); cache.set(key, t); return t;
}
export { noise2 };
