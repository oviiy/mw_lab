import { TILE } from '../config.js';
import { Rng } from '../core/rng.js';
import { shade, mix, rgba } from '../core/color.js';
import { makeCanvas, vgrad, hgrad, rr, OUTLINE, grain } from './style.js';
// Architecture uses a soft, translucent line instead of the bold character ink.
const INK = 'rgba(22,14,30,0.5)';
function inkRect(g, x, y, w, h, fill, r = 2, lw = OUTLINE) { rr(g, x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } g.lineWidth = lw * 0.7; g.strokeStyle = INK; g.stroke(); }
function inkCircle(g, x, y, r, fill, lw = OUTLINE) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } g.lineWidth = lw * 0.7; g.strokeStyle = INK; g.stroke(); }
import { lantern, stripedAwning, windowPane, acUnit, waterTank, antenna, dish, cjkText, vertSign, boardSign, carSilhouette, ridgeTiles, CJK } from './artkit.js';

// Every building is baked once into three textures — south facade, side wall and
// roof — plus matching glow layers for lit windows / neon. The renderer extrudes
// them as a box whose roof leans away from the camera (GTA2-style perspective),
// mapping each wall texture onto its parallelogram with one affine transform.
const PAD = 14;

export class BuildingSprites {
  constructor() { this.cache = new Map(); }
  get(b) { let s = this.cache.get(b.id); if (!s) { s = this.make(b); this.cache.set(b.id, s); } return s; }
  invalidate(b) { this.cache.delete(b.id); }

  make(b) {
    const W = b.w * TILE, D = b.d * TILE, H = b.H, P = PAD;
    const ctx = (cw, ch, w) => { const cv = makeCanvas(cw + P * 2, ch + P * 2); return { cv, g: cv.getContext('2d'), b, W: w, D, H, pad: P, wx: P, wy: P, rx: P, ry: P, rng: new Rng(b.seed + cw * 7 + ch), lit: [], signs: [], arch: b.arch }; };
    // south facade (texture space: wall occupies [P, P+W] x [P, P+H])
    const f = ctx(W, H, W); f.rng = new Rng(b.seed);
    (FACADES[b.arch.facade] || facadeGeneric)(f); finish(f);
    // side wall (east / west share one texture, width = depth)
    const sd = ctx(D, H, D); sideWall(sd);
    // roof
    const r = ctx(W, D, W); r.rng = new Rng(b.seed * 3 + 1);
    (ROOFS[b.arch.roof] || roofFlat)(r);
    shadeRoof(r); shadeWall(f, 0); shadeWall(sd, 1);
    return { P, facade: f.cv, side: sd.cv, roof: r.cv, glowF: bakeGlow(f), glowS: bakeGlow(sd), lit: f.lit.length + sd.lit.length };
  }
}

/* ---------- material & light (applied once per texture at bake time) ---------- */
function overlayGrain(g, x, y, w, h, a) { g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = a * 3; g.fillStyle = g.createPattern(grain(), 'repeat'); g.fillRect(x, y, w, h); g.restore(); }
// Roof: grain, a broad NW→SE light falloff and a soft dark rim so roofs read as solid slabs of material.
function shadeRoof(c) {
  const { g, rx, ry, W, D } = c; g.save(); g.globalCompositeOperation = 'source-atop';
  overlayGrain(g, rx - 8, ry - 8, W + 16, D + 16, 0.22);
  g.globalCompositeOperation = 'source-atop';
  const gr = g.createLinearGradient(rx, ry, rx + W, ry + D); gr.addColorStop(0, 'rgba(255,240,215,0.16)'); gr.addColorStop(0.55, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(20,12,40,0.22)'); g.fillStyle = gr; g.fillRect(rx - 8, ry - 8, W + 16, D + 16);
  g.restore();
}
// Wall: grain, darkening toward the ground (bounce / occlusion), and the band of shadow under the eaves.
function shadeWall(c, side) {
  const { g, wx, wy, W, H } = c; g.save(); g.globalCompositeOperation = 'source-atop';
  overlayGrain(g, wx - 6, wy - 6, W + 12, H + 12, 0.18);
  g.globalCompositeOperation = 'source-atop';
  const gr = g.createLinearGradient(0, wy, 0, wy + H); gr.addColorStop(0, 'rgba(10,6,24,0.32)'); gr.addColorStop(0.12, 'rgba(10,6,24,0)'); gr.addColorStop(0.75, 'rgba(10,6,24,0)'); gr.addColorStop(1, 'rgba(10,6,24,0.28)');
  g.fillStyle = gr; g.fillRect(wx - 6, wy - 6, W + 12, H + 12);
  if (side) { const hg = g.createLinearGradient(wx, 0, wx + W, 0); hg.addColorStop(0, 'rgba(10,6,24,0.15)'); hg.addColorStop(1, 'rgba(10,6,24,0)'); g.fillStyle = hg; g.fillRect(wx, wy, W, H); }
  g.restore();
}

// Lit windows and neon signs baked (with their bloom) into an additive layer, so
// the night pass is one drawImage per wall instead of per-sign shadowBlur.
function bakeGlow(c) {
  if (!c.lit.length && !c.signs.length) return null;
  const cv = makeCanvas(c.cv.width, c.cv.height), g = cv.getContext('2d');
  g.fillStyle = 'rgba(255,205,120,0.6)';
  for (const w of c.lit) g.fillRect(w.x, w.y, w.w, w.h);
  for (const sg of c.signs) {
    g.save(); g.shadowColor = sg.color; g.shadowBlur = 9; g.globalAlpha = 0.6; g.fillStyle = sg.color; g.strokeStyle = sg.color; g.lineWidth = 1.2;
    const x = sg.x, y = sg.y;
    if (sg.vertical) { const ch = [...sg.text], sz = Math.min(sg.w - 3, (sg.h - 4) / Math.max(1, ch.length) * 0.95); g.font = `900 ${sz}px ${CJK}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeRect(x + 1.5, y + 1.5, sg.w - 3, sg.h - 3); ch.forEach((q, i) => g.fillText(q, x + sg.w / 2, y + sg.h / 2 + (i - (ch.length - 1) / 2) * sz * 1.05)); }
    else { g.strokeRect(x + 1.5, y + 1.5, sg.w - 3, sg.h - 3); g.font = `900 ${Math.min(sg.h - 3.5, (sg.w - 4) / Math.max(1, [...sg.text].length) * 0.92)}px ${CJK}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(sg.text, x + sg.w / 2, y + sg.h / 2 + 0.5); }
    g.restore();
  }
  return cv;
}

// Side walls: same material as the front, simpler composition.
function sideWall(c) {
  const { g, b, wx, wy, W, H } = c, fac = b.arch.facade;
  if (fac === 'container') return facadeContainer(c);
  if (fac === 'parking') { g.fillStyle = '#8b8b92'; g.fillRect(wx, wy, W, H); const rows = 4, rh = (H - 2) / rows; for (let r = 0; r < rows; r++) { const y = wy + 1 + r * rh; g.fillStyle = '#24242c'; g.fillRect(wx + 3, y + 2, W - 6, rh - 4); g.fillStyle = '#c9c9d0'; g.fillRect(wx, y, W, 1.6); } g.lineWidth = 1.8; g.strokeStyle = INK; g.strokeRect(wx, wy, W, H); return; }
  if (fac === 'stall') { g.fillStyle = shade(b.wall, -0.35); g.fillRect(wx, wy + 3, W, H - 3); g.lineWidth = 1.4; g.strokeStyle = INK; g.strokeRect(wx, wy + 3, W, H - 3); return; }
  if (fac === 'tower') {
    const base = mix('#2f4f6e', b.wall, 0.4);
    g.fillStyle = vgrad(g, wy, wy + H, shade(base, 0.15), shade(base, -0.35)); g.fillRect(wx, wy, W, H);
    g.strokeStyle = 'rgba(210,240,255,0.2)'; g.lineWidth = 0.8;
    for (let x = wx + 5; x < wx + W; x += 6) { g.beginPath(); g.moveTo(x, wy); g.lineTo(x, wy + H); g.stroke(); }
    for (let y = wy + 6; y < wy + H; y += 7) { g.beginPath(); g.moveTo(wx, y); g.lineTo(wx + W, y); g.stroke(); }
    for (let i = 0; i < Math.floor(W * H / 340); i++) { const x = wx + 3 + Math.floor(c.rng.range(0, W - 8) / 6) * 6, y = wy + 3 + Math.floor(c.rng.range(0, H - 10) / 7) * 7; if (c.rng.chance(0.35)) { g.fillStyle = 'rgba(255,225,150,0.45)'; g.fillRect(x, y, 5, 6); c.lit.push({ x, y, w: 5, h: 6 }); } }
    g.lineWidth = 1.8; g.strokeStyle = INK; g.strokeRect(wx, wy, W, H); return;
  }
  const red = fac === 'temple' || fac === 'teahouse' || fac === 'pavilion';
  wallBase(c, red ? '#b3342c' : fac === 'office' ? mix(b.wall, '#aab4bf', 0.5) : fac === 'police' ? '#2f4a8a' : b.wall);
  if (red) { const pil = Math.max(2, Math.floor(W / 22)); for (let i = 0; i <= pil; i++) { const x = wx + 3 + ((W - 6) / pil) * i; g.fillStyle = '#8a1a14'; g.fillRect(x - 2, wy + 1, 4, H - 3); g.strokeStyle = INK; g.lineWidth = 0.9; g.strokeRect(x - 2, wy + 1, 4, H - 3); } return; }
  if (H < 18) return;
  const rows = Math.max(1, b.floors - 1), gf = Math.min(12, H * 0.3);
  windowGrid(c, { y0: wy + 3, y1: wy + H - gf, cols: Math.max(1, Math.floor(W / 20)), rows, ww: 6, wh: 6, litChance: 0.3 });
  if (fac === 'tenement' || fac === 'shophouse') acRow(c, wx, wx + W, wy + 3, wy + H - gf, 0.25);
  if (fac === 'tenement' && H > 40 && c.rng.chance(0.5)) fireEscape(c, wx + W * 0.5 - 6, wy + 4, wy + H - gf);
}

/* ============================ helpers ============================ */
function wallBase(c, color = c.b.wall) {
  const { g, wx, wy, W, H, rng } = c;
  g.fillStyle = vgrad(g, wy, wy + H, shade(color, 0.1), shade(color, -0.2)); g.fillRect(wx, wy, W, H);
  for (let i = 0; i < Math.max(2, W / 18); i++) { g.fillStyle = `rgba(0,0,0,${0.03 + rng.next() * 0.05})`; g.fillRect(wx + rng.next() * W, wy + rng.next() * H * 0.4, 1 + rng.next() * 2, H * (0.3 + rng.next() * 0.7)); }
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(wx, wy + H - 2.5, W, 2.5);                 // ground contact shadow
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(wx, wy, W, 1.6);
  g.lineWidth = 1.8; g.strokeStyle = INK; g.strokeRect(wx, wy, W, H);
}

function windowGrid(c, { x0 = c.wx, x1 = c.wx + c.W, y0, y1, cols, rows, mx = 4, shutters = null, litChance = 0.42, ww = 7, wh = 7 }) {
  const { g, rng } = c;
  // ~40% fewer, slightly larger windows: reads as architecture rather than noise
  cols = Math.max(1, Math.round(cols * 0.62)); ww += 2; wh += 1;
  const cw = (x1 - x0) / cols, rh = (y1 - y0) / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const w = Math.min(ww, cw - mx), h = Math.min(wh, rh - 3);
    if (w < 3 || h < 3) continue;
    const x = x0 + k * cw + (cw - w) / 2, y = y0 + r * rh + (rh - h) / 2 + 0.5, lit = rng.chance(litChance);
    if (shutters) { g.fillStyle = shutters; g.fillRect(x - 2.5, y, 2.5, h); g.fillRect(x + w, y, 2.5, h); g.strokeStyle = INK; g.lineWidth = 0.8; g.strokeRect(x - 2.5, y, 2.5, h); g.strokeRect(x + w, y, 2.5, h); }
    windowPane(g, x, y, w, h, false, rng);
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x - 1, y + h, w + 2, 1.6);
    if (lit) c.lit.push({ x, y, w, h });
  }
}

function shopOpening(c, x, w, h, glassColor = '#2a2030') {
  const { g, rng, wy, H } = c, y = wy + H - h - 1;
  inkRect(g, x, y, w, h, glassColor, 1.5, 1.4);
  // warm interior seen through glass: a soft glow and a couple of silhouettes, no confetti
  const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, 'rgba(255,214,150,0.55)'); gl.addColorStop(1, 'rgba(120,70,40,0.25)'); g.fillStyle = gl; g.fillRect(x + 1, y + 1, w - 2, h - 2);
  g.fillStyle = 'rgba(40,24,30,0.45)'; for (let i = 0; i < Math.min(3, Math.floor(w / 14)); i++) g.fillRect(x + 4 + i * (w / 3) + rng.range(0, 4), y + h * 0.45, 4, h * 0.5);
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.moveTo(x + w * 0.1, y + h); g.lineTo(x + w * 0.3, y); g.lineTo(x + w * 0.4, y); g.lineTo(x + w * 0.2, y + h); g.fill();
}

function acRow(c, x0, x1, y0, y1, chance = 0.35) {
  const { g, rng } = c;
  for (let y = y0; y < y1 - 6; y += 12) for (let x = x0 + 4; x < x1 - 12; x += 16) if (rng.chance(chance * 0.3)) acUnit(g, x + rng.range(0, 3), y + 6 + rng.range(0, 2), 8, 6);
}

function laundry(c, y) {
  const { g, rng, wx, W } = c; const x0 = wx + 3, x1 = wx + W - 3;
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y + 4, x1, y); g.stroke();
  const n = Math.floor((x1 - x0) / 9);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, yy = y + Math.sin(t * Math.PI) * 4; g.fillStyle = ['#e8e0cc', '#c8453b', '#4a7fb0', '#e0a233', '#8fc08a'][rng.int(0, 4)]; g.fillRect(x - 2.5, yy, 5, rng.range(5, 9)); g.strokeStyle = INK; g.lineWidth = 0.7; g.strokeRect(x - 2.5, yy, 5, 6); }
}

function fireEscape(c, x, y0, y1) {
  const { g } = c; g.strokeStyle = '#1c1a22'; g.lineWidth = 1.2;
  const steps = Math.max(2, Math.floor((y1 - y0) / 11));
  for (let i = 0; i < steps; i++) { const y = y0 + i * 11; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 12, y); g.moveTo(x, y + 3); g.lineTo(x + 12, y + 3); g.moveTo(x + (i & 1 ? 12 : 0), y); g.lineTo(x + (i & 1 ? 0 : 12), y + 11); g.stroke(); g.fillStyle = 'rgba(30,26,40,0.5)'; g.fillRect(x, y, 12, 3); }
}

/* ============================ FACADES ============================ */
function facadeGeneric(c) {
  wallBase(c); const gf = Math.min(14, c.H * 0.4);
  windowGrid(c, { y0: c.wy + 3, y1: c.wy + c.H - gf, cols: Math.max(2, Math.floor(c.W / 18)), rows: Math.max(1, c.b.floors - 1) });
}

function facadeShophouse(c) {
  const { g, b, rng, wx, wy, W, H } = c;
  wallBase(c);
  const gf = Math.min(15, Math.max(11, H * 0.36)), upper = Math.max(1, b.floors - 1), board = H - gf >= 24;
  // upper floors
  windowGrid(c, { y0: wy + 3, y1: wy + H - gf - (board ? 15 : 0), cols: Math.max(2, Math.floor(W / 17)), rows: upper, shutters: rng.chance(0.55) ? '#2f7a5a' : '#8a3a2a', ww: 6, wh: 6 });
  if (H > 28 && rng.chance(0.7)) { // balcony rail
    const by = wy + H - gf - 4; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(wx + 3, by); g.lineTo(wx + W - 3, by); g.stroke();
    for (let x = wx + 4; x < wx + W - 3; x += 3.2) { g.beginPath(); g.moveTo(x, by); g.lineTo(x, by + 3); g.stroke(); }
    for (let x = wx + 8; x < wx + W - 6; x += 14) { g.fillStyle = '#3f8f4a'; g.beginPath(); g.arc(x, by - 1, 2.6, 0, 6.3); g.fill(); g.lineWidth = 0.9; g.stroke(); }
  }
  if (rng.chance(0.5)) acRow(c, wx, wx + W, wy + 3, wy + H - gf, 0.4);
  if (b.floors >= 3 && rng.chance(0.3)) laundry(c, wy + 6);
  // ground floor shop
  const doorW = Math.min(10, W * 0.25), openW = W - doorW - 10;
  const flipX = b.flip ? wx + 4 : wx + 6 + doorW;
  shopOpening(c, flipX, openW, gf - 3, '#241a28');
  const dx = b.flip ? wx + W - 4 - doorW : wx + 4; inkRect(g, dx, wy + H - gf + 1, doorW, gf - 2, '#6a2e22', 1, 1.3); g.fillStyle = '#e8c46a'; g.fillRect(dx + doorW - 3, wy + H - gf / 2, 1.6, 1.6);
  // awning
  stripedAwning(g, wx + 3, wy + H - gf - 1, W - 6, 6, rng.pick(['#c8453b', '#2f7a5a', '#2a5f8f', '#d9a441']), '#efe6cf');
  // big shop board over the awning
  if (board) { const bw = Math.min(W - 12, 58), bx = wx + (W - bw) / 2; boardSign(g, bx, wy + H - gf - 15, bw, 13, rng.pick(SHOP_WORDS), '#ffd23a'); }
  if (b.district === 'chinatown') { lantern(g, wx + W * 0.28, wy + H - gf + 6, 3.6); lantern(g, wx + W * 0.72, wy + H - gf + 6, 3.6); }
}
const SHOP_WORDS = ['金記', '茶餐廳', '海味', '藥材', '麵家', '燒臘', '珠寶', '當舖', '金行', '米舖', '餅家', '涼茶', '粥麵', '雜貨'];

function facadeRestaurant(c) {
  const { g, b, rng, wx, wy, W, H } = c;
  wallBase(c, mix(b.wall, '#b3342c', 0.35));
  const gf = Math.min(18, H * 0.5), pillars = Math.max(3, Math.floor(W / 24));
  windowGrid(c, { y0: wy + 3, y1: wy + H - gf - 17, cols: Math.max(3, Math.floor(W / 14)), rows: Math.max(1, b.floors - 1), shutters: null, ww: 7, wh: 7, litChance: 0.7 });
  // lattice lines
  g.strokeStyle = 'rgba(241,198,74,0.55)'; g.lineWidth = 0.8; for (let x = wx + 2; x < wx + W - 2; x += 6) { g.beginPath(); g.moveTo(x, wy + 2); g.lineTo(x, wy + H - gf - 16); g.stroke(); }
  // sign board band above the ground floor
  const sy = wy + H - gf - 15;
  boardSign(c.g, wx + 6, sy, W - 12, 14, b.sign ? b.sign.text : '酒家', b.sign ? b.sign.color : '#ffd23a');
  if (b.sign) c.signs.push({ x: wx + 6, y: sy, w: W - 12, h: 14, text: b.sign.text, color: b.sign.color, vertical: false });
  // doors
  const dw = W - 12; g.fillStyle = '#2a1018'; g.fillRect(wx + 6, wy + H - gf + 5, dw, gf - 6);
  for (let i = 0; i <= pillars; i++) { const x = wx + 6 + (dw / pillars) * i; g.fillStyle = '#9a1c16'; g.fillRect(x - 1.8, wy + H - gf + 4, 3.6, gf - 5); g.fillStyle = '#f1c64a'; g.fillRect(x - 2.2, wy + H - gf + 4, 4.4, 1.6); g.strokeStyle = INK; g.lineWidth = 0.8; g.strokeRect(x - 1.8, wy + H - gf + 4, 3.6, gf - 5); }
  for (let i = 0; i < pillars; i++) { const x = wx + 6 + (dw / pillars) * (i + 0.5); lantern(g, x, wy + H - gf + 9, 3.3, i & 1 ? '#e23b2e' : '#ffcc33'); g.fillStyle = 'rgba(255,200,110,0.2)'; g.fillRect(x - 8, wy + H - gf + 6, 16, gf - 7); }
  void rng;
}

function facadeTeahouse(c) {
  const { g, b, wx, wy, W, H } = c;
  wallBase(c, '#efe3c4');
  const pil = Math.max(3, Math.floor(W / 20));
  for (let i = 0; i <= pil; i++) { const x = wx + 3 + ((W - 6) / pil) * i; g.fillStyle = '#9a1c16'; g.fillRect(x - 2, wy + 1, 4, H - 3); g.strokeStyle = INK; g.lineWidth = 0.9; g.strokeRect(x - 2, wy + 1, 4, H - 3); g.fillStyle = '#f1c64a'; g.fillRect(x - 2.4, wy + 1, 4.8, 1.8); }
  // lattice screens between pillars
  for (let i = 0; i < pil; i++) {
    const x = wx + 3 + ((W - 6) / pil) * i + 3, w = (W - 6) / pil - 6;
    g.fillStyle = '#2b1d22'; g.fillRect(x, wy + 4, w, H - 8);
    g.strokeStyle = '#d9a441'; g.lineWidth = 0.8; for (let k = 0; k < w; k += 3.4) { g.beginPath(); g.moveTo(x + k, wy + 4); g.lineTo(x + k, wy + H - 4); g.stroke(); }
    for (let k = 4; k < H - 6; k += 4) { g.beginPath(); g.moveTo(x, wy + k); g.lineTo(x + w, wy + k); g.stroke(); }
    if (i % 2 === 0) c.lit.push({ x, y: wy + 4, w, h: H - 8 });
  }
  if (b.sign) { const sw = Math.min(60, W - 12), sx = wx + (W - sw) / 2; boardSign(g, sx, wy + 4, sw, 14, b.sign.text, b.sign.color); c.signs.push({ x: sx, y: wy + 4, w: sw, h: 14, text: b.sign.text, color: b.sign.color }); }
  lantern(g, wx + 10, wy + H - 12, 3.4); lantern(g, wx + W - 10, wy + H - 12, 3.4);
}

function facadeTenement(c) {
  const { g, b, rng, wx, wy, W, H } = c;
  wallBase(c, b.wall);
  const gf = Math.min(13, H * 0.2), rows = Math.max(2, b.floors - 1);
  windowGrid(c, { y0: wy + 3, y1: wy + H - gf, cols: Math.max(3, Math.floor(W / 15)), rows, mx: 4, litChance: 0.38, ww: 6, wh: 6 });
  acRow(c, wx, wx + W, wy + 3, wy + H - gf, 0.5);
  g.fillStyle = 'rgba(70,45,30,0.18)'; for (let i = 0; i < 4; i++) g.fillRect(wx + rng.range(4, W - 4), wy + 4, 2.5, H * rng.range(0.3, 0.8));
  if (b.arch.laundry && rng.chance(0.7)) { laundry(c, wy + H * 0.35); if (H > 50) laundry(c, wy + H * 0.62); }
  if (H > 40 && rng.chance(0.6)) fireEscape(c, wx + W - 18, wy + 4, wy + H - gf);
  // shuttered ground floor
  for (let x = wx + 3; x < wx + W - 8; x += 12) { inkRect(g, x, wy + H - gf + 1, 9, gf - 3, rng.pick(['#7a8a8a', '#8a5a44', '#5a6a7a']), 1, 1); for (let k = 0; k < gf - 4; k += 2.2) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x + 1, wy + H - gf + 2 + k, 7, 0.8); } }
  if (b.sign) { const sw = Math.min(48, W - 8), sy = wy + H - gf - 12; boardSign(g, wx + 4, sy, sw, 12, b.sign.text, b.sign.color); c.signs.push({ x: wx + 4, y: sy, w: sw, h: 12, text: b.sign.text, color: b.sign.color }); }
}

function facadeHouse(c) {
  const { g, b, rng, wx, wy, W, H } = c;
  wallBase(c);
  windowGrid(c, { y0: wy + 3, y1: wy + H - 11, cols: Math.max(1, Math.floor(W / 20)), rows: 1, shutters: '#3f7f6a', ww: 7, wh: 7 });
  inkRect(g, wx + W / 2 - 5, wy + H - 12, 10, 11, '#6a3a26', 1, 1.3); g.fillStyle = '#e8c46a'; g.fillRect(wx + W / 2 + 2, wy + H - 6, 1.6, 1.6);
  if (rng.chance(0.4)) lantern(g, wx + 8, wy + H - 9, 3);
  void b;
}

function facadeTower(c) {
  const { g, b, rng, wx, wy, W, H } = c;
  const base = mix('#2f4f6e', b.wall, 0.4);
  g.fillStyle = vgrad(g, wy, wy + H, shade(base, 0.25), shade(base, -0.3)); g.fillRect(wx, wy, W, H);
  g.strokeStyle = 'rgba(210,240,255,0.22)'; g.lineWidth = 0.8;
  for (let x = wx + 5; x < wx + W; x += 6) { g.beginPath(); g.moveTo(x, wy); g.lineTo(x, wy + H); g.stroke(); }
  for (let y = wy + 6; y < wy + H; y += 7) { g.beginPath(); g.moveTo(wx, y); g.lineTo(wx + W, y); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.09)'; g.beginPath(); g.moveTo(wx + W * 0.1, wy + H); g.lineTo(wx + W * 0.5, wy); g.lineTo(wx + W * 0.62, wy); g.lineTo(wx + W * 0.22, wy + H); g.closePath(); g.fill();
  for (let i = 0; i < Math.floor(W * H / 270); i++) { const x = wx + 3 + Math.floor(rng.range(0, W - 8) / 6) * 6, y = wy + 3 + Math.floor(rng.range(0, H - 14) / 7) * 7; if (rng.chance(0.4)) { g.fillStyle = 'rgba(255,225,150,0.5)'; g.fillRect(x, y, 5, 6); c.lit.push({ x, y, w: 5, h: 6 }); } }
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(wx, wy + H - 12, W, 12);
  g.fillStyle = 'rgba(255,230,160,0.55)'; g.fillRect(wx + W / 2 - 10, wy + H - 11, 20, 10);
  g.lineWidth = 1.8; g.strokeStyle = INK; g.strokeRect(wx, wy, W, H);
  if (b.sign && b.sign.text) { boardSign(g, wx + W / 2 - 28, wy + H - 24, 56, 11, b.sign.text, b.sign.color); c.signs.push({ x: wx + W / 2 - 28, y: wy + H - 24, w: 56, h: 11, text: b.sign.text, color: b.sign.color }); }
}

function facadeOffice(c) {
  const { g, b, wx, wy, W, H } = c;
  wallBase(c, mix(b.wall, '#aab4bf', 0.5));
  const rows = Math.max(2, b.floors - 1), gf = 11;
  const cols = Math.max(3, Math.floor(W / 11)), rh = (H - gf - 3) / rows;
  for (let r = 0; r < rows; r++) { const y = wy + 3 + r * rh + 1; g.fillStyle = vgrad(g, y, y + rh - 2, '#6f9bbf', '#2e4d6e'); g.fillRect(wx + 3, y, W - 6, rh - 2.5); g.strokeStyle = INK; g.lineWidth = 0.8; g.strokeRect(wx + 3, y, W - 6, rh - 2.5); for (let k = 1; k < cols; k++) { g.beginPath(); g.moveTo(wx + 3 + ((W - 6) / cols) * k, y); g.lineTo(wx + 3 + ((W - 6) / cols) * k, y + rh - 2.5); g.stroke(); } if (c.rng.chance(0.5)) c.lit.push({ x: wx + 5, y, w: W - 10, h: rh - 3 }); }
  g.fillStyle = 'rgba(40,60,80,0.8)'; g.fillRect(wx + W / 2 - 8, wy + H - gf + 1, 16, gf - 2);
  void b;
}

function facadeHotel(c) {
  const { g, b, rng, wx, wy, W, H } = c;
  wallBase(c, mix(b.wall, '#e8d7b0', 0.4));
  const rows = Math.max(3, b.floors - 1), gf = 14;
  windowGrid(c, { y0: wy + 3, y1: wy + H - gf, cols: Math.max(4, Math.floor(W / 11)), rows, ww: 6, wh: 6, litChance: 0.55 });
  for (let r = 0; r < rows; r++) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(wx, wy + 3 + r * ((H - gf - 3) / rows) + ((H - gf - 3) / rows) - 2, W, 1.5); }
  stripedAwning(g, wx + W / 2 - 18, wy + H - gf - 1, 36, 6, '#b3342c', '#f1d98a');
  g.fillStyle = 'rgba(255,220,150,0.5)'; g.fillRect(wx + W / 2 - 14, wy + H - gf + 5, 28, gf - 6);
  if (b.sign) { boardSign(g, wx + 6, wy + 3, W - 12, 12, b.sign.text, b.sign.color); c.signs.push({ x: wx + 6, y: wy + 3, w: W - 12, h: 12, text: b.sign.text, color: b.sign.color }); }
  void rng;
}

function facadeClinic(c) {
  const { g, b, wx, wy, W, H } = c;
  wallBase(c, '#e9eef0');
  windowGrid(c, { y0: wy + 3, y1: wy + H - 12, cols: Math.max(3, Math.floor(W / 14)), rows: Math.max(2, b.floors - 1), ww: 7, wh: 6 });
  g.fillStyle = '#e23b2e'; g.fillRect(wx + W / 2 - 2, wy + H - 26 > wy ? wy + H - 24 : wy + 4, 4, 12); g.fillRect(wx + W / 2 - 6, (wy + H - 24 > wy ? wy + H - 24 : wy + 4) + 4, 12, 4);
  g.fillStyle = '#4a9bd6'; g.fillRect(wx + W / 2 - 10, wy + H - 11, 20, 10); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(wx + W / 2 - 10, wy + H - 11, 20, 10);
}

function facadePolice(c) {
  const { g, b, wx, wy, W, H } = c;
  wallBase(c, '#2f4a8a');
  windowGrid(c, { y0: wy + 3, y1: wy + H - 12, cols: Math.max(3, Math.floor(W / 14)), rows: Math.max(2, b.floors - 1), ww: 7, wh: 6 });
  boardSign(g, wx + W / 2 - 24, wy + H - 16, 48, 11, 'POLICE', '#f4f4f4', '#1c3a8a'); c.signs.push({ x: wx + W / 2 - 24, y: wy + H - 16, w: 48, h: 11, text: 'POLICE', color: '#7fd8ff' });
  g.fillStyle = '#ff3b3b'; g.fillRect(wx + 4, wy + 2, 5, 3); g.fillStyle = '#3b6bff'; g.fillRect(wx + W - 9, wy + 2, 5, 3);
}

function facadeGunshop(c) {
  const { g, b, wx, wy, W, H } = c;
  wallBase(c, '#2b2630');
  windowGrid(c, { y0: wy + 3, y1: wy + H - 14, cols: 2, rows: 1, ww: 6, wh: 6, litChance: 0.3 });
  inkRect(g, wx + 5, wy + H - 14, W - 10, 12, '#3a3340', 1, 1.3);
  for (let x = wx + 7; x < wx + W - 7; x += 3) { g.fillStyle = 'rgba(255,255,255,0.1)'; g.fillRect(x, wy + H - 13, 1.2, 10); }
  if (b.sign) { boardSign(g, wx + 4, wy + H - 27, W - 8, 13, b.sign.text, b.sign.color); c.signs.push({ x: wx + 4, y: wy + H - 27, w: W - 8, h: 13, text: b.sign.text, color: b.sign.color }); }
}

function facadeGarage(c) {
  const { g, b, wx, wy, W, H } = c;
  wallBase(c, '#9aa4a8');
  const doors = Math.max(1, Math.floor(W / 40));
  for (let i = 0; i < doors; i++) {
    const w = (W - 8) / doors - 4, x = wx + 4 + i * ((W - 8) / doors) + 2;
    inkRect(g, x, wy + H - Math.min(16, H - 8), w, Math.min(15, H - 9), '#6a7a82', 1, 1.3);
    for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x + 1, wy + H - 16 + k * 2.6, w - 2, 0.9); }
  }
  if (b.sign) { boardSign(g, wx + 4, wy + 3, W - 8, 12, b.sign.text, b.sign.color); c.signs.push({ x: wx + 4, y: wy + 3, w: W - 8, h: 12, text: b.sign.text, color: b.sign.color }); }
}

function facadeWarehouse(c) {
  const { g, wx, wy, W, H, rng } = c;
  wallBase(c, c.b.wall);
  g.strokeStyle = 'rgba(0,0,0,0.2)'; g.lineWidth = 1; for (let x = wx + 4; x < wx + W; x += 5) { g.beginPath(); g.moveTo(x, wy + 1); g.lineTo(x, wy + H - 1); g.stroke(); }
  const doors = Math.max(1, Math.floor(W / 56));
  for (let i = 0; i < doors; i++) { const w = 26, x = wx + 12 + i * ((W - 24) / doors) + ((W - 24) / doors - w) / 2; inkRect(g, x, wy + H - 16, w, 15, rng.pick(['#7a4a3a', '#4a6a7a', '#6a6a52']), 1, 1.4); for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x + 1, wy + H - 15 + k * 2.4, w - 2, 0.9); } g.fillStyle = '#ffb347'; g.fillRect(x + w / 2 - 2, wy + H - 19, 4, 2); }
  windowGrid(c, { y0: wy + 3, y1: wy + 9, cols: Math.max(3, Math.floor(W / 24)), rows: 1, ww: 10, wh: 3, litChance: 0.2 });
}

function facadeFactory(c) {
  const { g, wx, wy, W, H } = c;
  wallBase(c, mix(c.b.wall, '#9a5a44', 0.55));
  g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 0.8; for (let y = wy + 4; y < wy + H; y += 4) { g.beginPath(); g.moveTo(wx, y); g.lineTo(wx + W, y); g.stroke(); }
  windowGrid(c, { y0: wy + 5, y1: wy + H - 12, cols: Math.max(4, Math.floor(W / 18)), rows: 1, ww: 9, wh: 9, litChance: 0.5 });
  inkRect(g, wx + W / 2 - 12, wy + H - 14, 24, 13, '#3a2f2a', 1, 1.4);
}

function facadeParking(c) {
  const { g, wx, wy, W, H, rng } = c;
  g.fillStyle = '#9b9ba2'; g.fillRect(wx, wy, W, H);
  const rows = 4, rh = (H - 2) / rows;
  for (let r = 0; r < rows; r++) { const y = wy + 1 + r * rh; g.fillStyle = '#26262e'; g.fillRect(wx + 3, y + 2, W - 6, rh - 4); for (let x = wx + 6; x < wx + W - 12; x += 13) if (rng.chance(0.6)) carSilhouette(g, x, y + 4, 10, rh - 8, rng.pick(['#c8453b', '#2a6fb0', '#d9d4c4', '#e0a233', '#3c8c6a'])); g.fillStyle = '#c9c9d0'; g.fillRect(wx, y, W, 1.6); }
  g.lineWidth = 1.8; g.strokeStyle = INK; g.strokeRect(wx, wy, W, H);
  boardSign(g, wx + W / 2 - 8, wy + H - 13, 16, 12, 'P', '#ffffff', '#2a5fb0');
}

function facadeStall(c) {
  const { g, b, rng, wx, wy, W, H } = c;
  g.fillStyle = shade(b.wall, -0.45); g.fillRect(wx + 2, wy + 3, W - 4, H - 3);
  // goods on a tilted counter: baskets of fruit / produce in saturated colours
  const GOODS = ['#ff5a2a', '#ffd23a', '#e8243a', '#4fc04a', '#ff8ab0', '#ffa21f', '#9a3ad0'];
  g.fillStyle = '#8a5a30'; g.fillRect(wx + 2, wy + H - 9, W - 4, 6);
  for (let x = wx + 4; x < wx + W - 9; x += 9) {
    inkRect(g, x, wy + H - 10, 8, 5, '#c8964a', 0.8, 0.9);
    const col = rng.pick(GOODS); g.fillStyle = col;
    for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x + 1.8 + k * 2.2, wy + H - 10.5 + (k & 1), 1.7, 0, 6.3); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x + 1.2, wy + H - 12, 1, 1);
  }
  // price tags
  for (let x = wx + 6; x < wx + W - 8; x += 14) { g.fillStyle = rng.chance(0.5) ? '#ffd23a' : '#ffffff'; g.fillRect(x, wy + H - 15, 5, 3.4); g.strokeStyle = INK; g.lineWidth = 0.6; g.strokeRect(x, wy + H - 15, 5, 3.4); g.fillStyle = '#c8202a'; g.fillRect(x + 1, wy + H - 14, 3, 1); }
  g.fillStyle = '#5a3a1e'; g.fillRect(wx + 2, wy + H - 3.5, W - 4, 3.5);
  g.lineWidth = 1.6; g.strokeStyle = INK; g.strokeRect(wx + 2, wy + 3, W - 4, H - 3);
  if (H > 22) lantern(g, wx + W / 2, wy + 8, 2.6, rng.chance(0.5) ? '#e23b2e' : '#ffcc33');
}

function facadeContainer(c) {
  const { g, b, wx, wy, W, H } = c;
  const per = 9, n = Math.max(1, Math.round(H / per));
  for (let i = 0; i < n; i++) {
    const y = wy + H - (i + 1) * (H / n), h = H / n, col = i % 2 ? shade(b.wall, -0.1) : b.wall;
    g.fillStyle = col; g.fillRect(wx, y, W, h); g.fillStyle = 'rgba(0,0,0,0.2)'; for (let x = wx + 4; x < wx + W; x += 5) g.fillRect(x, y + 1, 1.4, h - 2);
    g.lineWidth = 1.5; g.strokeStyle = INK; g.strokeRect(wx, y, W, h); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(wx, y, W, 1.4);
  }
}

function facadeBooth(c) { wallBase(c, c.b.wall); windowGrid(c, { y0: c.wy + 2, y1: c.wy + c.H - 3, cols: 2, rows: 1, ww: 8, wh: 6 }); }

function facadeTempleWall(c) {
  const { g, b, wx, wy, W, H } = c;
  wallBase(c, '#b3342c');
  g.fillStyle = '#f1c64a'; for (let x = wx + 6; x < wx + W - 4; x += 8) { g.beginPath(); g.arc(x, wy + H - 8, 1.1, 0, 6.3); g.fill(); }
  const pil = Math.max(2, Math.floor(W / 22));
  for (let i = 0; i <= pil; i++) { const x = wx + 3 + ((W - 6) / pil) * i; g.fillStyle = '#8a1a14'; g.fillRect(x - 2, wy + 1, 4, H - 3); g.strokeStyle = INK; g.lineWidth = 0.9; g.strokeRect(x - 2, wy + 1, 4, H - 3); }
  if (b.big) { inkRect(g, wx + W / 2 - 12, wy + H - 17, 24, 16, '#5a1410', 2, 1.6); g.fillStyle = '#f1c64a'; for (let i = 0; i < 3; i++) for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(wx + W / 2 - 7 + i * 7, wy + H - 13 + k * 3.4, 1, 0, 6.3); g.fill(); } }
  if (b.sign && b.big) { c.signs.push({ x: wx + W / 2 - 16, y: wy + 3, w: 32, h: 14, text: b.sign.text, color: b.sign.color }); boardSign(g, wx + W / 2 - 16, wy + 3, 32, 14, b.sign.text, '#ffd23a', '#7a1410'); }
}

const FACADES = {
  shophouse: facadeShophouse, restaurant: facadeRestaurant, teahouse: facadeTeahouse, tenement: facadeTenement, house: facadeHouse,
  tower: facadeTower, office: facadeOffice, hotel: facadeHotel, clinic: facadeClinic, police: facadePolice, gunshop: facadeGunshop, garage: facadeGarage,
  warehouse: facadeWarehouse, factory: facadeFactory, parking: facadeParking, stall: facadeStall, container: facadeContainer, booth: facadeBooth,
  temple: facadeTempleWall, pavilion: facadeTeahouse,
};

/* ============================ ROOFS ============================ */
function roofOutline(c, color, bevel = true) {
  const { g, rx, ry, W, D } = c;
  g.fillStyle = vgrad(g, ry, ry + D, shade(color, 0.1), shade(color, -0.1)); g.fillRect(rx, ry, W, D);
  if (bevel) {
    // parapet: bold raised rim + the hard shadow it casts onto the deck (sun from the NW)
    const t = 6;
    g.fillStyle = 'rgba(14,8,26,0.35)'; g.fillRect(rx + t, ry + t, W - t * 2, 3); g.fillRect(rx + t, ry + t + 3, 3, D - t * 2 - 3);
    g.fillStyle = shade(color, 0.35); g.fillRect(rx, ry, W, t); g.fillRect(rx, ry, t, D); g.fillRect(rx + W - t, ry, t, D); g.fillRect(rx, ry + D - t, W, t);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(rx, ry, W, 1.6); g.fillRect(rx, ry, 1.6, D);
    g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(rx + W - 2, ry, 2, D); g.fillRect(rx, ry + D - 2, W, 2);
    g.lineWidth = 1.6; g.strokeStyle = INK; g.strokeRect(rx + t + 0.5, ry + t + 0.5, W - t * 2 - 1, D - t * 2 - 1);
  }
  g.lineWidth = 2.2; g.strokeStyle = INK; g.strokeRect(rx, ry, W, D);
}

// Simple occupancy list so roof clutter never overlaps.
function placer(c, pad) {
  const { rx, ry, W, D, rng } = c, used = [];
  const x0 = rx + pad, y0 = ry + pad, x1 = rx + W - pad, y1 = ry + D - pad;
  const free = (x, y, w, h) => x >= x0 && y >= y0 && x + w <= x1 && y + h <= y1 && used.every((u) => x + w + 3 < u.x || u.x + u.w + 3 < x || y + h + 3 < u.y || u.y + u.h + 3 < y);
  return {
    x0, y0, x1, y1,
    take(x, y, w, h) { if (!free(x, y, w, h)) return null; const r = { x, y, w, h }; used.push(r); return r; },
    find(w, h, tries = 10) { for (let i = 0; i < tries; i++) { const x = x0 + rng.next() * Math.max(0, x1 - x0 - w), y = y0 + rng.next() * Math.max(0, y1 - y0 - h); const r = this.take(Math.round(x), Math.round(y), w, h); if (r) return r; } return null; },
  };
}

// Rooftop stair / lift housing: lit lid, a visible south wall with a door, hard shadow.
function stairwell(g, x, y, w, h, deck) {
  const wall = 6;
  g.fillStyle = 'rgba(14,8,26,0.35)'; g.fillRect(x + 3, y + 3, w, h);
  g.fillStyle = shade(deck, -0.32); g.fillRect(x, y + h - wall, w, wall);
  inkRect(g, x + w * 0.55, y + h - wall + 1, Math.min(6, w * 0.25), wall - 1, '#4a3a34', 0.5, 0.9);
  g.lineWidth = 1.4; g.strokeStyle = INK; g.strokeRect(x, y + h - wall, w, wall);
  inkRect(g, x, y, w, h - wall, shade(deck, 0.22), 1, 1.6);
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(x + 1, y + 1, w - 2, 1.4);
}

function acCluster(g, x, y, cols, rows) {
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const ax = x + k * 13, ay = y + r * 11;
    g.fillStyle = 'rgba(14,8,26,0.3)'; g.fillRect(ax + 2, ay + 2, 11, 8);
    acUnit(g, ax, ay, 11, 8);
  }
}

const DECKS = ['#b9ae9a', '#c2b6a0', '#9fa6ad', '#a8aeb4', '#c7b08a', '#bba37e'];

function roofFlat(c) {
  const { g, b, rng, rx, ry, W, D } = c;
  const deck = mix(rng.pick(DECKS), b.roof, 0.15);
  roofOutline(c, deck);
  // membrane panels in two tints + tar seams: mid-scale structure on big decks
  const pw = W > 120 ? Math.round((W - 12) / Math.ceil((W - 12) / 64)) : W, ph = D > 110 ? Math.round((D - 12) / Math.ceil((D - 12) / 56)) : D;
  for (let y = ry + 6, j = 0; y < ry + D - 6; y += ph, j++) for (let x = rx + 6, i = 0; x < rx + W - 6; x += pw, i++) {
    if ((i + j) & 1) { g.fillStyle = 'rgba(0,0,0,0.07)'; g.fillRect(x, y, Math.min(pw, rx + W - 6 - x), Math.min(ph, ry + D - 6 - y)); }
    g.fillStyle = 'rgba(40,30,40,0.28)'; if (i && !j) g.fillRect(x, ry + 6, 1.2, D - 12); if (j && !i) g.fillRect(rx + 6, y, W - 12, 1.2);
  }
  g.strokeStyle = 'rgba(40,30,30,0.1)'; g.lineWidth = 1;
  for (let x = rx + 6 + 22; x < rx + W - 8; x += 22) { g.beginPath(); g.moveTo(x + 0.5, ry + 8); g.lineTo(x + 0.5, ry + D - 8); g.stroke(); }
  for (let i = 0; i < 2; i++) { g.fillStyle = `rgba(${rng.chance(0.6) ? '20,10,20' : '255,255,255'},0.06)`; g.fillRect(rx + 8 + rng.next() * (W - 30), ry + 8 + rng.next() * (D - 26), 14 + rng.next() * 18, 8 + rng.next() * 12); }
  const P = placer(c, 9), iw = P.x1 - P.x0, id = P.y1 - P.y0;
  // ~30% of roofs carry a big painted / furnished element
  if (iw >= 60 && id >= 44 && rng.chance(0.12)) {
    const kind = rng.int(0, 3), ew = Math.min(iw - 4, Math.max(40, iw * 0.62)), eh = Math.min(id - 4, Math.max(30, id * 0.62));
    const ex = Math.round(P.x0 + (iw - ew) / 2), ey = Math.round(P.y0 + (id - eh) / 2), cx = ex + ew / 2, cy = ey + eh / 2;
    P.take(ex, ey, ew, eh);
    if (kind === 0) { // red disc with 龍
      const r = Math.min(ew, eh) / 2 - 1;
      g.beginPath(); g.arc(cx, cy, r, 0, 6.3); g.fillStyle = '#c8202a'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke();
      g.beginPath(); g.arc(cx, cy, r - 3, 0, 6.3); g.strokeStyle = '#f1c64a'; g.lineWidth = 1.4; g.stroke();
      cjkText(g, '龍', cx, cy + 1, r * 1.25, '#f1c64a', { weight: '900' });
    } else if (kind === 1) { // basketball court
      inkRect(g, ex, ey, ew, eh, '#2f7a6a', 0.5, 1.6); g.fillStyle = '#c4572e'; g.fillRect(ex + 3, ey + 3, ew - 6, eh - 6);
      g.strokeStyle = '#f4f4f4'; g.lineWidth = 1.2; g.strokeRect(ex + 5, ey + 5, ew - 10, eh - 10);
      g.beginPath(); g.moveTo(cx, ey + 5); g.lineTo(cx, ey + eh - 5); g.stroke(); g.beginPath(); g.arc(cx, cy, Math.min(ew, eh) * 0.14, 0, 6.3); g.stroke();
      const kr = (eh - 10) * 0.32; g.beginPath(); g.arc(ex + 5, cy, kr, -1.57, 1.57); g.stroke(); g.beginPath(); g.arc(ex + ew - 5, cy, kr, 1.57, 4.71); g.stroke();
      for (const hx of [ex + 7, ex + ew - 7]) inkCircle(g, hx, cy, 1.8, '#ff7a2a', 0.8);
    } else if (kind === 2) { // tarp over stored junk
      const col = rng.pick(['#2a6fd0', '#d23a30', '#2a6fd0']);
      g.fillStyle = 'rgba(14,8,26,0.35)'; g.fillRect(ex + 3, ey + 3, ew, eh);
      inkRect(g, ex, ey, ew, eh, col, 2, 1.8);
      g.strokeStyle = shade(col, -0.3); g.lineWidth = 1; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(ex + 2, ey + (eh * k) / 4 + rng.range(-2, 2)); g.quadraticCurveTo(cx, ey + (eh * k) / 4 + rng.range(-4, 4), ex + ew - 2, ey + (eh * k) / 4); g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(ex + 3, ey + 2, ew - 6, 2);
      g.strokeStyle = '#e8e0cc'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + ew, ey + eh); g.moveTo(ex + ew, ey); g.lineTo(ex, ey + eh); g.stroke();
      for (const [px, py] of [[ex, ey], [ex + ew, ey], [ex, ey + eh], [ex + ew, ey + eh]]) inkCircle(g, px, py, 1.6, '#f1c64a', 0.8);
    } else { // rooftop garden: grid of potted plants
      for (let y = ey + 5; y < ey + eh - 4; y += 11) for (let x = ex + 5; x < ex + ew - 4; x += 11) {
        g.fillStyle = 'rgba(14,8,26,0.3)'; g.beginPath(); g.arc(x + 2, y + 2, 4.2, 0, 6.3); g.fill();
        inkCircle(g, x, y, 4.2, '#b0583a', 1); inkCircle(g, x, y, 3.2, rng.pick(['#3f9a4a', '#4fae52', '#2f8a5a']), 0.8);
        if (rng.chance(0.35)) { g.fillStyle = rng.pick(['#ff5a7a', '#ffd23a', '#ffffff']); g.beginPath(); g.arc(x - 1, y - 1, 1.2, 0, 6.3); g.fill(); }
      }
    }
  }
  // 1-2 stairwell / lift housings
  const nStair = W * D > 9000 ? 2 : 1, big = Math.min(1.6, Math.max(1, Math.sqrt(W * D) / 90));
  for (let i = 0; i < nStair; i++) { const w = Math.round(rng.int(18, 24) * big), h = Math.round(rng.int(16, 20) * big), r = P.find(w + 3, h + 3, 14); if (r) stairwell(g, r.x, r.y, w, h, deck); }
  // AC cluster grid
  if (rng.chance(0.6)) { const cols = W > 150 ? 3 : 2, rows = D > 120 ? 2 : 1, r = P.find(cols * 13 + 2, rows * 11 + 2, 14); if (r) acCluster(g, r.x, r.y, cols, rows); }
  // a few loose items
  const n = Math.max(0, Math.floor(W * D / 9000));
  for (let i = 0; i < n; i++) {
    const k = rng.next();
    if (k < 0.35) { const r = P.find(20, 20); if (r) waterTank(g, r.x + 9, r.y + 9, 9); }
    else if (k < 0.6) { const r = P.find(11, 11); if (r) { g.fillStyle = 'rgba(14,8,26,0.3)'; g.fillRect(r.x + 2, r.y + 2, 9, 9); inkRect(g, r.x, r.y, 9, 9, '#3a3d45', 1, 1.2); g.fillStyle = 'rgba(150,220,255,0.6)'; g.fillRect(r.x + 1.5, r.y + 1.5, 6, 6); } }
    else if (k < 0.8) { const r = P.find(10, 10); if (r) dish(g, r.x + 5, r.y + 5, 4.5); }
    else { const r = P.find(14, 12); if (r) { acUnit(g, r.x, r.y, 12, 9); } }
  }
  if (b.H > 50 && rng.chance(0.6)) antenna(g, rx + W - 12, ry + 14, 12);
  if (b.key === 'clinic') { g.fillStyle = '#e23b2e'; g.fillRect(rx + W / 2 - 3, ry + D / 2 - 11, 6, 22); g.fillRect(rx + W / 2 - 11, ry + D / 2 - 3, 22, 6); g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(rx + W / 2 - 3, ry + D / 2 - 11, 6, 22); }
}

// Glazed tile slope: big 8-9px rows alternating light/dark, scalloped tile ends.
function tileSlope(g, x, y, w, h, color, dir, rng) {
  const rows = Math.max(2, Math.round(h / 8.5)), rh = h / rows;
  for (let r = 0; r < rows; r++) {
    const yy = y + r * rh, c = shade(color, r & 1 ? 0.18 : -0.18);
    g.fillStyle = c; g.fillRect(x, yy, w, rh + 0.5);
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x, yy + (dir > 0 ? 0 : rh - 1.2), w, 1.2);
    g.strokeStyle = shade(color, -0.5); g.lineWidth = 1;
    const ey = dir > 0 ? yy + rh : yy;
    for (let tx = x + ((r & 1) ? 4 : 0); tx < x + w; tx += 8) { g.beginPath(); g.arc(tx + 4, ey, 4, dir > 0 ? Math.PI : 0, dir > 0 ? Math.PI * 2 : Math.PI); g.stroke(); }
  }
  // a few missing / broken tile patches
  const miss = rng.int(0, 2) + (w * h > 4000 ? 1 : 0);
  for (let i = 0; i < miss; i++) { const mx = x + 4 + rng.next() * (w - 14), my = y + 2 + rng.next() * Math.max(1, h - 9); g.fillStyle = '#3a2a24'; g.fillRect(mx, my, 7, 5); g.strokeStyle = INK; g.lineWidth = 0.9; g.strokeRect(mx, my, 7, 5); g.fillStyle = 'rgba(160,110,80,0.6)'; g.fillRect(mx + 1, my + 3, 3, 1.4); }
}

function finial(g, x, y, s, col) {
  // curled dragon-tail finial at a ridge end; s = ±1 (which way it curls outward)
  g.lineCap = 'round';
  for (const [lw, cc] of [[3.6, INK], [1.8, col]]) {
    g.lineWidth = lw; g.strokeStyle = cc; g.beginPath(); g.moveTo(x - s * 3, y); g.quadraticCurveTo(x + s * 5, y + 1, x + s * 5, y - 4); if (s > 0) g.arc(x + 3, y - 4, 2, 0, -Math.PI * 1.3, true); else g.arc(x - 3, y - 4, 2, Math.PI, Math.PI * 2.3, false); g.stroke();
  }
  g.lineCap = 'butt';
}

function roofTile(c) {
  const { g, b, rx, ry, W, D, rng } = c;
  const col = b.roof, ridge = Math.round(D * 0.46), over = 3;
  g.fillStyle = shade(col, -0.45); g.fillRect(rx - over, ry - over, W + over * 2, D + over * 2);           // eaves shadow
  tileSlope(g, rx, ry, W, ridge, shade(col, -0.12), 1, rng);
  tileSlope(g, rx, ry + ridge, W, D - ridge, shade(col, 0.06), -1, rng);
  // vertical tile channels
  g.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = rx + 8; x < rx + W; x += 8) g.fillRect(x, ry, 1, D);
  // 6px ridge cap, gold or jade
  const cap = rng.chance(0.5) ? '#e2b23a' : '#2fa07a';
  g.fillStyle = 'rgba(14,8,26,0.35)'; g.fillRect(rx, ry + ridge + 3, W, 3);
  g.fillStyle = cap; g.fillRect(rx - 2, ry + ridge - 3, W + 4, 6);
  g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(rx - 2, ry + ridge - 3, W + 4, 1.4);
  g.fillStyle = 'rgba(0,0,0,0.18)'; for (let x = rx + 4; x < rx + W; x += 7) g.fillRect(x, ry + ridge - 2, 1, 4);
  g.lineWidth = 1.5; g.strokeStyle = INK; g.strokeRect(rx - 2, ry + ridge - 3, W + 4, 6);
  finial(g, rx - 2, ry + ridge, -1, cap === '#2fa07a' ? '#f1c64a' : '#2fa07a'); finial(g, rx + W + 2, ry + ridge, 1, cap === '#2fa07a' ? '#f1c64a' : '#2fa07a');
  g.lineWidth = 2.2; g.strokeStyle = INK; g.strokeRect(rx - over, ry - over, W + over * 2, D + over * 2);
  g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx, ry + D); g.moveTo(rx + W, ry); g.lineTo(rx + W, ry + D); g.stroke();
  if (rng.chance(0.4)) { const x = rx + W * rng.range(0.15, 0.7); g.fillStyle = 'rgba(14,8,26,0.35)'; g.fillRect(x + 3, ry + 7, 9, 10); inkRect(g, x, ry + 4, 9, 10, '#8a8076', 1, 1.4); }
}

function roofPagoda(c) {
  const { g, b, rx, ry, W, D } = c;
  const col = b.roof, over = 6;
  // wide lower eave
  g.fillStyle = shade(col, -0.35); g.fillRect(rx - over, ry - over, W + over * 2, D + over * 2);
  ridgeTiles(g, rx - over + 1, ry - over + 1, W + over * 2 - 2, D + over * 2 - 2, shade(col, -0.05), Math.max(4, Math.round(D / 6)), 1);
  g.lineWidth = 2; g.strokeStyle = INK; g.strokeRect(rx - over, ry - over, W + over * 2, D + over * 2);
  // upturned corners
  for (const [cx, cy, sx, sy] of [[rx - over, ry - over, -1, -1], [rx + W + over, ry - over, 1, -1], [rx - over, ry + D + over, -1, 1], [rx + W + over, ry + D + over, 1, 1]]) {
    g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + sx * 6, cy + sy * 1, cx + sx * 7, cy + sy * 6); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke(); g.lineWidth = 1; g.strokeStyle = '#f1c64a'; g.stroke();
  }
  // upper roof
  const iw = W * 0.58, id = D * 0.58, ix = rx + (W - iw) / 2, iy = ry + (D - id) / 2;
  g.fillStyle = shade(col, -0.3); g.fillRect(ix - 2, iy - 2, iw + 4, id + 4);
  ridgeTiles(g, ix, iy, iw, id / 2, shade(col, -0.15), 3, 1); ridgeTiles(g, ix, iy + id / 2, iw, id / 2, shade(col, 0.06), 3, -1);
  g.lineWidth = 1.8; g.strokeStyle = INK; g.strokeRect(ix - 2, iy - 2, iw + 4, id + 4);
  g.fillStyle = shade(col, 0.4); g.fillRect(ix - 2, iy + id / 2 - 2, iw + 4, 4); g.strokeRect(ix - 2, iy + id / 2 - 2, iw + 4, 4);
  g.fillStyle = '#f1c64a'; g.beginPath(); g.arc(rx + W / 2, ry + D / 2, 3.2, 0, 6.3); g.fill(); g.lineWidth = 1.2; g.strokeStyle = INK; g.stroke();
}

function roofTemple(c) { roofPagoda(c); const { g, rx, ry, W } = c; for (let i = 0; i < 5; i++) { g.fillStyle = '#f1c64a'; g.fillRect(rx + 8 + i * ((W - 16) / 4) - 1, ry - 7, 2, 4); } }

function roofMetal(c) {
  const { g, b, rx, ry, W, D, rng } = c;
  roofOutline(c, mix(b.roof, '#9aa0a8', 0.4));
  g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 1; for (let x = rx + 5; x < rx + W; x += 6) { g.beginPath(); g.moveTo(x, ry + 2); g.lineTo(x, ry + D - 2); g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,0.16)'; for (let x = rx + 8; x < rx + W; x += 6) { g.beginPath(); g.moveTo(x, ry + 2); g.lineTo(x, ry + D - 2); g.stroke(); }
  const n = Math.max(2, Math.floor(W / 40));
  for (let i = 0; i < n; i++) { const x = rx + 12 + i * ((W - 24) / n), y = ry + D * rng.range(0.2, 0.5); inkRect(g, x, y, 18, 12, 'rgba(150,215,240,0.8)', 1, 1.3); g.strokeStyle = INK; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x + 9, y); g.lineTo(x + 9, y + 12); g.stroke(); }
  for (let i = 0; i < 3; i++) { const x = rx + 10 + rng.next() * (W - 30), y = ry + 8 + rng.next() * (D - 24); if (i < 2) acUnit(g, x, y, 12, 9); else waterTank(g, x + 6, y + 6, 6); }
  if (c.arch.chimney) { for (let i = 0; i < 2; i++) { const x = rx + W * (0.3 + i * 0.35), y = ry + D * 0.3; g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x + 4, y + 5, 10, 8, 0, 0, 6.3); g.fill(); inkCircle(g, x, y, 9, '#9a5a44', 1.8); inkCircle(g, x, y, 5.5, '#2a2024', 1.2); } }
}

function roofGlass(c) {
  const { g, b, rx, ry, W, D, rng } = c;
  roofOutline(c, mix('#5a7a98', b.roof, 0.4));
  g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.strokeRect(rx + 4 + i * 4, ry + 4 + i * 4, W - 8 - i * 8, D - 8 - i * 8); }
  inkRect(g, rx + W * 0.3, ry + D * 0.3, W * 0.4, D * 0.4, '#8f9aa6', 2, 1.6);
  waterTank(g, rx + W * 0.5, ry + D * 0.5, Math.min(8, W * 0.12));
  antenna(g, rx + W * 0.8, ry + D * 0.25, 18); acUnit(g, rx + 8, ry + D - 18, 14, 10);
  if (rng.chance(0.5)) { g.strokeStyle = '#ffd23a'; g.lineWidth = 1.4; g.beginPath(); g.arc(rx + W * 0.5, ry + D * 0.5, Math.min(W, D) * 0.34, 0, 6.3); g.stroke(); g.fillStyle = '#ffd23a'; cjkText(g, 'H', rx + W * 0.5, ry + D * 0.5, 9, '#ffd23a'); }
  void b;
}

function roofDeck(c) {
  const { g, rx, ry, W, D, rng } = c;
  roofOutline(c, '#8a8a92');
  for (let x = rx + 14; x < rx + W - 8; x += 13) { g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x, ry + 6, 1.4, 16); g.fillRect(x, ry + D - 22, 1.4, 16); }
  for (let x = rx + 16; x < rx + W - 14; x += 13) { if (rng.chance(0.5)) carSilhouette(g, x - 3, ry + 8, 10, 13, rng.pick(['#c8453b', '#2a6fb0', '#d9d4c4', '#e0a233'])); if (rng.chance(0.5)) carSilhouette(g, x - 3, ry + D - 22, 10, 13, rng.pick(['#c8453b', '#2a6fb0', '#d9d4c4'])); }
}

function roofAwning(c) {
  const { g, b, rx, ry, W, D } = c;
  const c1 = mix(b.roof, shade(b.roof, -0.1), 0.5), c2 = b.roof === '#e8d7b0' ? '#c8202a' : '#fff6e0';
  g.fillStyle = 'rgba(14,8,26,0.35)'; g.fillRect(rx + 1, ry + 1, W + 4, D + 4);
  stripedAwning(g, rx - 2, ry - 2, W + 4, D + 4, c1, c2, false);
  // ridge fold: light north half, shaded south half
  g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(rx - 1, ry - 1, W + 2, D * 0.45);
  g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(rx - 1, ry + D * 0.48, W + 2, D * 0.52);
  g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(rx - 2, ry + D * 0.47); g.lineTo(rx + W + 2, ry + D * 0.47); g.stroke();
  // scalloped front valance
  const n = Math.max(3, Math.round(W / 7)), sw = (W + 4) / n;
  for (let i = 0; i < n; i++) { g.beginPath(); g.arc(rx - 2 + i * sw + sw / 2, ry + D + 2, sw / 2, 0, Math.PI); g.fillStyle = i & 1 ? c2 : c1; g.fill(); g.lineWidth = 1; g.strokeStyle = INK; g.stroke(); }
}

function roofContainer(c) {
  const { g, b, rx, ry, W, D } = c;
  g.fillStyle = b.roof; g.fillRect(rx, ry, W, D); g.fillStyle = 'rgba(0,0,0,0.22)'; for (let x = rx + 4; x < rx + W; x += 5) g.fillRect(x, ry + 1, 1.5, D - 2);
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(rx, ry, W, 2); g.lineWidth = 1.8; g.strokeStyle = INK; g.strokeRect(rx, ry, W, D);
}

const ROOFS = { flat: roofFlat, tile: roofTile, pagoda: roofPagoda, temple: roofTemple, metal: roofMetal, glass: roofGlass, deck: roofDeck, awning: roofAwning, container: roofContainer };

/* ============================ finishing touches ============================ */
function finish(c) {
  const { g, b, rx, ry, W, D, wx, wy, H } = c;
  // vertical hanging neon sign on shophouses (overlaps roof edge + wall)
  if (b.sign && b.sign.vertical && b.arch.facade === 'shophouse') {
    const sw = 13, sh = Math.min(H - 2, 15 + [...b.sign.text].length * 11), x = b.flip ? rx + W - sw + 3 : rx - 3, y = wy + H - sh - 4;
    vertSign(g, x, y, sw, sh, b.sign.text, b.sign.color);
    c.signs.push({ x, y, w: sw, h: sh, text: b.sign.text, color: b.sign.color, vertical: true, hang: true });
  } else if (b.sign && b.sign.vertical && b.arch.facade === 'tenement' && false) { void 0; }
  // building number plate / grime on the roof edge
  void ry; void D; void rr; void hgrad; void lantern; void rgba;
}
