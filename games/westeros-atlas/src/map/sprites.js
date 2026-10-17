// Hand-painted look: procedurally "inked" sprites (mountains, hills, trees, reeds, dunes, ships) painted once onto small canvases
// with wash + hatching + wobbly sepia outlines, then stamped thousands of times with drawImage (fast, textured, not vector-clean).
import { rng } from '../kit/util.js';

const INK = 'rgba(58,38,20,0.88)', INK_SOFT = 'rgba(70,48,26,0.5)';
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function wob(r, a = 1) { return (r() - 0.5) * a; }
function wobblyLine(g, pts, r, amp = 0.8) { g.beginPath(); pts.forEach(([x, y], i) => { const px = x + wob(r, amp), py = y + wob(r, amp); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke(); }

/** One mountain cluster. snow: 0 none, 1 snowcapped. Anchored bottom-centre. */
function mountain(seed, snow, W = 150, H = 130) {
  const r = rng(seed), c = mk(W, H), g = c.getContext('2d'); g.lineJoin = 'round'; g.lineCap = 'round';
  const peaks = r() < 0.5 ? 1 : 2 + (r() < 0.4 ? 1 : 0);
  const base = H - 8;
  const list = [];
  for (let i = 0; i < peaks; i++) list.push({ x: W * (peaks === 1 ? 0.5 : 0.25 + (0.5 * i) / (peaks - 1)) + wob(r, 8), h: (peaks === 1 ? 0.62 : 0.42 + r() * 0.28) * (H - 16), w: (peaks === 1 ? 0.44 : 0.3) * W * (0.85 + r() * 0.3) });
  list.sort((a, b) => a.h - b.h); // small first (behind), tallest last
  for (const p of list) {
    const top = [p.x + wob(r, 6), base - p.h];
    // silhouette with ridge notches
    const L = [[p.x - p.w, base], [p.x - p.w * 0.55, base - p.h * 0.45 + wob(r, 6)], [p.x - p.w * 0.22, base - p.h * 0.78], top, [p.x + p.w * 0.18, base - p.h * 0.7 + wob(r, 4)], [p.x + p.w * 0.5, base - p.h * 0.38 + wob(r, 5)], [p.x + p.w, base]];
    // lit face (left) and shaded face (right) split along a jagged crest line
    const crest = [top, [p.x + wob(r, 4), base - p.h * 0.62], [p.x + wob(r, 8), base - p.h * 0.3], [p.x + wob(r, 4), base]];
    g.beginPath(); L.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
    const gr = g.createLinearGradient(p.x - p.w, base - p.h, p.x + p.w, base);
    if (snow) { gr.addColorStop(0, '#f4f2ea'); gr.addColorStop(0.55, '#dfe0d8'); gr.addColorStop(1, '#bfb8a3'); } else { gr.addColorStop(0, '#e9d9ad'); gr.addColorStop(0.5, '#cdb381'); gr.addColorStop(1, '#a88955'); }
    g.fillStyle = gr; g.fill();
    // shaded right face
    g.beginPath(); g.moveTo(top[0], top[1]); crest.slice(1).forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(p.x + p.w, base); L.slice(4).reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath();
    g.fillStyle = snow ? 'rgba(96,108,128,0.42)' : 'rgba(86,58,30,0.42)'; g.fill();
    // hatching on shade
    g.strokeStyle = INK_SOFT; g.lineWidth = 0.7;
    for (let k = 0; k < 11; k++) { const t = 0.12 + k * 0.075, x0 = top[0] + (p.w * 0.9) * t + wob(r, 2), y0 = top[1] + p.h * (t * 1.05); wobblyLine(g, [[x0, y0], [x0 - p.w * 0.16 + wob(r, 2), y0 + p.h * 0.17]], r, 0.5); }
    // snow cap
    if (snow) { g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(top[0] - p.w * 0.3, top[1] + p.h * 0.26); g.lineTo(top[0] - p.w * 0.1, top[1] + p.h * 0.2); g.lineTo(top[0] + p.w * 0.02, top[1] + p.h * 0.32); g.lineTo(top[0] + p.w * 0.14, top[1] + p.h * 0.2); g.lineTo(top[0] + p.w * 0.28, top[1] + p.h * 0.3); g.closePath(); g.fillStyle = 'rgba(255,255,255,0.9)'; g.fill(); }
    // outline
    g.strokeStyle = INK; g.lineWidth = 1.15; wobblyLine(g, L, r, 1.0); wobblyLine(g, crest, r, 0.8);
  }
  // soft ground shadow
  g.globalCompositeOperation = 'destination-over'; const sh = g.createRadialGradient(W / 2, base, 2, W / 2, base, W * 0.42); sh.addColorStop(0, 'rgba(60,40,20,0.25)'); sh.addColorStop(1, 'rgba(60,40,20,0)'); g.fillStyle = sh; g.save(); g.translate(0, base); g.scale(1, 0.18); g.translate(0, -base); g.fillRect(0, 0, W, H * 6); g.restore();
  return c;
}
function hill(seed, W = 80, H = 50) {
  const r = rng(seed), c = mk(W, H), g = c.getContext('2d'); g.lineCap = 'round';
  const n = 1 + (r() < 0.45 ? 1 : 0) + (r() < 0.2 ? 1 : 0), base = H - 6;
  for (let i = 0; i < n; i++) {
    const cx = W * (n === 1 ? 0.5 : 0.28 + 0.44 * (i / Math.max(1, n - 1))) + wob(r, 6), w = (n === 1 ? 0.36 : 0.26) * W * (0.9 + r() * 0.3), h = (0.5 + r() * 0.3) * (H - 12);
    g.beginPath(); g.moveTo(cx - w, base); g.bezierCurveTo(cx - w * 0.6, base - h * 1.25, cx + w * 0.6, base - h * 1.25, cx + w, base); g.closePath();
    const gr = g.createLinearGradient(cx - w, base - h, cx + w, base); gr.addColorStop(0, '#d9e0a8'); gr.addColorStop(1, '#a9a468'); g.fillStyle = gr; g.fill();
    g.beginPath(); g.moveTo(cx + w * 0.1, base - h * 0.95); g.bezierCurveTo(cx + w * 0.5, base - h * 0.9, cx + w * 0.85, base - h * 0.4, cx + w, base); g.lineTo(cx + w * 0.1, base); g.closePath(); g.fillStyle = 'rgba(80,60,28,0.28)'; g.fill();
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - w, base); g.bezierCurveTo(cx - w * 0.6, base - h * 1.25, cx + w * 0.6, base - h * 1.25, cx + w, base); g.stroke();
    g.strokeStyle = INK_SOFT; g.lineWidth = 0.6; for (let k = 0; k < 4; k++) { const x = cx + w * (0.15 + k * 0.17); wobblyLine(g, [[x, base - h * (0.9 - k * 0.15)], [x - 3, base - 2]], r, 0.4); }
  }
  return c;
}
function tree(kind, seed, S = 40) {
  const r = rng(seed), c = mk(S, S), g = c.getContext('2d'); g.lineJoin = 'round'; g.lineCap = 'round';
  const cx = S / 2, base = S - 4;
  if (kind === 'pine') {
    g.fillStyle = '#4c3a22'; g.fillRect(cx - 1, base - 6, 2, 6);
    for (let i = 0; i < 3; i++) { const y = base - 6 - i * 8, w = 11 - i * 2.6; g.beginPath(); g.moveTo(cx, y - 11); g.lineTo(cx + w, y + 2); g.lineTo(cx - w, y + 2); g.closePath(); g.fillStyle = ['#355c3f', '#2d5039', '#3f6a47'][i]; g.fill(); g.strokeStyle = INK; g.lineWidth = 0.9; g.stroke(); }
  } else if (kind === 'oak') {
    g.fillStyle = '#4c3a22'; g.fillRect(cx - 1.4, base - 9, 2.8, 9);
    for (const [dx, dy, rad] of [[-6, -17, 8], [6, -17, 8], [0, -24, 9], [0, -14, 9]]) { g.beginPath(); g.arc(cx + dx + wob(r, 2), base + dy + wob(r, 2), rad, 0, 7); g.fillStyle = ['#5f8a45', '#6d9a4c', '#547e3d'][(r() * 3) | 0]; g.fill(); g.strokeStyle = INK; g.lineWidth = 0.9; g.stroke(); }
    g.fillStyle = 'rgba(30,50,20,0.25)'; g.beginPath(); g.arc(cx + 4, base - 12, 7, 0, 7); g.fill();
  } else if (kind === 'palm') {
    g.strokeStyle = '#6b5130'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, base); g.quadraticCurveTo(cx + 3, base - 14, cx + 1, base - 24); g.stroke();
    g.strokeStyle = '#3f7a3a'; g.lineWidth = 2.2; for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.283; g.beginPath(); g.moveTo(cx + 1, base - 24); g.quadraticCurveTo(cx + 1 + Math.cos(a) * 8, base - 28 + Math.sin(a) * 3, cx + 1 + Math.cos(a) * 12, base - 21 + Math.sin(a) * 5); g.stroke(); }
  }
  return c;
}
function reeds(seed, S = 44) { const r = rng(seed), c = mk(S, S * 0.7), g = c.getContext('2d'); g.strokeStyle = 'rgba(60,84,60,0.9)'; g.lineWidth = 1.1; g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const x = 5 + r() * (S - 10), y = S * 0.62; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + wob(r, 6), y - 9, x + wob(r, 8), y - 16 - r() * 5); g.stroke(); } g.strokeStyle = 'rgba(70,110,130,0.7)'; g.beginPath(); g.moveTo(3, S * 0.66); g.lineTo(S - 3, S * 0.66); g.stroke(); return c; }
function dune(seed, S = 44) { const r = rng(seed), c = mk(S, 22), g = c.getContext('2d'); g.strokeStyle = 'rgba(120,84,40,0.65)'; g.lineWidth = 1; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const y = 6 + i * 6; g.beginPath(); g.moveTo(3 + r() * 6, y); g.quadraticCurveTo(S / 2, y - 6 - r() * 3, S - 4, y + 1); g.stroke(); } return c; }
function galleon() { const c = mk(60, 56), g = c.getContext('2d'); g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(8, 36); g.lineTo(52, 36); g.lineTo(46, 46); g.lineTo(14, 46); g.closePath(); g.fillStyle = '#6d4a28'; g.fill(); g.stroke();
  for (const [x, w, h] of [[22, 15, 26], [38, 13, 22]]) { g.beginPath(); g.moveTo(x, 36 - h); g.quadraticCurveTo(x + w + 3, 36 - h / 2, x + w, 34); g.lineTo(x, 34); g.closePath(); g.fillStyle = '#f1e6c6'; g.fill(); g.stroke(); g.beginPath(); g.moveTo(x, 8); g.lineTo(x, 36); g.stroke(); }
  g.strokeStyle = 'rgba(60,90,100,0.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(4, 50); g.quadraticCurveTo(14, 46, 24, 50); g.quadraticCurveTo(36, 54, 50, 49); g.stroke(); return c; }

export function buildSprites() {
  const S = { mountain: [], snow: [], hill: [], pine: [], oak: [], palm: [], reeds: [], dune: [] };
  for (let i = 0; i < 9; i++) S.mountain.push(mountain(100 + i, 0));
  for (let i = 0; i < 6; i++) S.snow.push(mountain(200 + i, 1));
  for (let i = 0; i < 7; i++) S.hill.push(hill(300 + i));
  for (let i = 0; i < 4; i++) { S.pine.push(tree('pine', 400 + i)); S.oak.push(tree('oak', 500 + i)); S.palm.push(tree('palm', 600 + i)); }
  for (let i = 0; i < 3; i++) { S.reeds.push(reeds(700 + i)); S.dune.push(dune(800 + i)); }
  S.galleon = galleon();
  return S;
}
// sprite world-size (height in map units) at scale 1
export const SPRITE_H = { mountain: 16, snow: 18, hill: 8.5, pine: 4.6, oak: 4.2, palm: 5, reeds: 4.5, dune: 3.2 };
