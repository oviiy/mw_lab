import { INK, OUTLINE, rr, inkRect, inkCircle, vgrad, hash2 } from './style.js';
import { shade, mix, rgba } from '../core/color.js';

// Reusable "ink & flat colour" drawing primitives shared by buildings and props.
export const CJK = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC","WenQuanYi Micro Hei",sans-serif';

export function lantern(g, x, y, r, color = '#e23b2e') {
  // drawn ~30% larger than the nominal radius: fat body, gold caps, red/gold tassel
  const R = r * 1.3, rx = R * 0.88, cw = R * 1.05;
  g.save(); g.lineJoin = 'round';
  g.strokeStyle = INK; g.lineWidth = 1.1;
  g.beginPath(); g.moveTo(x, y - R - 4); g.lineTo(x, y - R); g.stroke();
  g.beginPath(); g.ellipse(x, y, rx, R, 0, 0, Math.PI * 2);
  const gr = g.createRadialGradient(x - R * 0.3, y - R * 0.35, 0.5, x, y, R * 1.1); gr.addColorStop(0, shade(color, 0.55)); gr.addColorStop(0.55, color); gr.addColorStop(1, shade(color, -0.25));
  g.fillStyle = gr; g.fill(); g.lineWidth = 1.4; g.strokeStyle = INK; g.stroke();
  // ribs
  g.strokeStyle = rgba('#000000', 0.3); g.lineWidth = 0.8; g.beginPath();
  g.moveTo(x - rx * 0.45, y - R * 0.88); g.quadraticCurveTo(x - rx * 0.12, y, x - rx * 0.45, y + R * 0.88);
  g.moveTo(x + rx * 0.45, y - R * 0.88); g.quadraticCurveTo(x + rx * 0.12, y, x + rx * 0.45, y + R * 0.88); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(x - rx * 0.35, y - R * 0.3, rx * 0.18, R * 0.35, 0, 0, Math.PI * 2); g.fill();
  // gold caps
  inkRect(g, x - cw / 2, y - R - 1.4, cw, 2.6, '#f1c64a', 0.8, 0.9);
  inkRect(g, x - cw / 2, y + R - 1.2, cw, 2.6, '#f1c64a', 0.8, 0.9);
  // tassel
  const ty = y + R + 1.4, tl = Math.max(3, R * 0.75);
  g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, ty); g.lineTo(x, ty + tl); g.stroke();
  g.strokeStyle = '#e8343a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, ty); g.lineTo(x, ty + tl); g.stroke();
  g.fillStyle = '#f1c64a'; g.fillRect(x - 0.9, ty, 1.8, 1.2);
  g.restore();
}

// Cached lantern sprite (2x resolution) for per-frame drawing: avoids a radial
// gradient + a dozen path ops per lantern per frame. Anchor = hanging point.
const _lanternCache = new Map();
export function lanternSprite(r, color) {
  const key = r + color; let c = _lanternCache.get(key);
  if (!c) {
    const R = r * 1.3, w = Math.ceil(R * 2 + 6), h = Math.ceil(R * 3.2 + 10), k = 2;
    c = document.createElement('canvas'); c.width = w * k; c.height = h * k;
    const q = c.getContext('2d'); q.scale(k, k); lantern(q, w / 2, 1 + 4 + R, r, color);
    c.ax = w / 2; c.ay = 1; c.w = w; c.h = h; _lanternCache.set(key, c);
  }
  return c;
}

export function stripedAwning(g, x, y, w, h, c1, c2, scallop = true) {
  const n = Math.max(2, Math.round(w / 6)), sw = w / n;
  g.save();
  for (let i = 0; i < n; i++) { g.fillStyle = i & 1 ? c2 : c1; g.fillRect(x + i * sw, y, sw + 0.4, h); }
  if (scallop) for (let i = 0; i < n; i++) { g.fillStyle = i & 1 ? c2 : c1; g.beginPath(); g.arc(x + i * sw + sw / 2, y + h, sw / 2, 0, Math.PI); g.fill(); g.lineWidth = 1; g.strokeStyle = INK; g.stroke(); }
  g.lineWidth = OUTLINE; g.strokeStyle = INK; g.strokeRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x, y, w, 1.5);
  g.restore();
}

export function windowPane(g, x, y, w, h, lit, rng) {
  const gr = vgrad(g, y, y + h, lit ? '#ffe9a8' : '#4b6a88', lit ? '#f3b95a' : '#1e2f44');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + w * 0.55, y); g.lineTo(x + w * 0.8, y); g.lineTo(x + w * 0.25, y + h); g.closePath(); g.fill();
  g.lineWidth = 1.2; g.strokeStyle = INK; g.strokeRect(x, y, w, h);
  g.fillStyle = INK; g.fillRect(x + w / 2 - 0.4, y, 0.8, h);
  void rng;
}

export function acUnit(g, x, y, w = 10, h = 7) {
  inkRect(g, x, y, w, h, '#cfd3d6', 1, 1.2);
  g.fillStyle = '#9aa0a6'; g.fillRect(x + 1, y + h - 2, w - 2, 1.5);
  inkCircle(g, x + w * 0.35, y + h * 0.42, h * 0.3, '#6e757c', 0.9);
}

export function waterTank(g, x, y, r) {
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x + 2, y + 3, r, r * 0.8, 0, 0, 6.3); g.fill();
  const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r); gr.addColorStop(0, '#d9a066'); gr.addColorStop(1, '#8a5a30');
  inkCircle(g, x, y, r, gr, 1.4);
  g.strokeStyle = 'rgba(40,20,5,0.55)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r * 0.6, 0, 6.3); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.22, 0, 6.3); g.fill();
}

export function antenna(g, x, y, len = 10) {
  g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - len); g.moveTo(x - 4, y - len * 0.7); g.lineTo(x + 4, y - len * 0.7); g.stroke();
  g.fillStyle = '#ff4a3a'; g.beginPath(); g.arc(x, y - len, 1.4, 0, 6.3); g.fill();
}

export function dish(g, x, y, r = 4) {
  inkCircle(g, x, y, r, '#e9ecef', 1.1); g.fillStyle = '#9aa0a6'; g.beginPath(); g.arc(x + 0.6, y + 0.6, r * 0.35, 0, 6.3); g.fill();
}

export function cjkText(g, text, x, y, size, color, opts = {}) {
  g.save();
  g.font = `${opts.weight || 'bold'} ${size}px ${CJK}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (opts.vertical) {
    const chars = [...text];
    chars.forEach((c, i) => { const cy = y + (i - (chars.length - 1) / 2) * size * 1.05; if (opts.stroke) { g.lineWidth = opts.stroke; g.strokeStyle = opts.strokeColor || INK; g.strokeText(c, x, cy); } g.fillStyle = color; g.fillText(c, x, cy); });
  } else { if (opts.stroke) { g.lineWidth = opts.stroke; g.strokeStyle = opts.strokeColor || INK; g.strokeText(text, x, y); } g.fillStyle = color; g.fillText(text, x, y); }
  g.restore();
}

// Saturated sign backgrounds (lacquer red / gold / jade) and their text colours.
export const SIGN_BG = [['#c8202a', '#ffe28a'], ['#f1c64a', '#b0141c'], ['#1f8a5a', '#fff0b0']];
export function signColors(text) { let h = 0; for (const ch of text) h = (h * 31 + ch.codePointAt(0)) | 0; return SIGN_BG[(h >>> 0) % SIGN_BG.length]; }

// Hanging vertical shop sign (red lacquer + gold edge), bold glyphs.
export function vertSign(g, x, y, w, h, text, neon) {
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x + 2, y + 2, w, h);
  inkRect(g, x, y, w, h, '#c8202a', 1.5, 1.8);
  g.strokeStyle = '#f1c64a'; g.lineWidth = 1.2; g.strokeRect(x + 1.6, y + 1.6, w - 3.2, h - 3.2);
  const n = Math.max(1, [...text].length), size = Math.min(w - 3, (h - 4) / n * 0.95);
  cjkText(g, text, x + w / 2, y + h / 2, size, '#ffe28a', { vertical: true, weight: '900', stroke: 1.6, strokeColor: '#5a0a0e' });
  g.fillStyle = INK; g.fillRect(x + w / 2 - 0.8, y - 4, 1.6, 4);
  void neon;
}

// Horizontal signboard: saturated lacquer/gold/jade panel, bold CJK, neon-ready rim.
// `bg` may still force a background; otherwise it is derived from the text.
export function boardSign(g, x, y, w, h, text, color, bg) {
  const [b0, fg] = bg ? [bg, color] : signColors(text);
  g.fillStyle = 'rgba(0,0,0,0.32)'; g.fillRect(x + 2, y + 2, w, h);
  inkRect(g, x, y, w, h, b0, 1.5, 1.8);
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x + 1.5, y + 1.2, w - 3, 1.4);
  g.strokeStyle = bg ? color : (b0 === '#f1c64a' ? '#b0141c' : '#f1c64a'); g.lineWidth = 1.1; rr(g, x + 1.8, y + 1.8, w - 3.6, h - 3.6, 1.5); g.stroke();
  const n = Math.max(1, [...text].length), size = Math.min(h - 3.5, (w - 4) / n * 0.92);
  cjkText(g, text, x + w / 2, y + h / 2 + 0.5, size, fg, { weight: '900', stroke: b0 === '#f1c64a' ? 0 : 1.4, strokeColor: shade(b0, -0.55) });
}

export function carSilhouette(g, x, y, w, h, color) {
  inkRect(g, x, y, w, h, color, 2, 1);
  g.fillStyle = 'rgba(20,30,50,0.8)'; g.fillRect(x + w * 0.28, y + 1.5, w * 0.4, h - 3);
}

export function ridgeTiles(g, x, y, w, h, color, rows, dir = 1) {
  // rows of overlapping scallops: reads as glazed roof tile
  const dark = shade(color, -0.28), light = shade(color, 0.22);
  const rh = h / rows;
  for (let r = 0; r < rows; r++) {
    const yy = y + r * rh;
    g.fillStyle = r & 1 ? color : shade(color, -0.07); g.fillRect(x, yy, w, rh + 0.5);
    g.strokeStyle = dark; g.lineWidth = 1;
    for (let tx = x + ((r & 1) ? 3 : 0); tx < x + w; tx += 6) { g.beginPath(); g.arc(tx + 3, yy + (dir > 0 ? 0 : rh), 3, dir > 0 ? 0 : Math.PI, dir > 0 ? Math.PI : Math.PI * 2); g.stroke(); }
    g.fillStyle = light; g.globalAlpha = 0.18; g.fillRect(x, yy, w, 1); g.globalAlpha = 1;
  }
}

export { mix, hash2 };
