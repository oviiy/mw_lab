import { INK, inkRect, inkCircle } from './style.js';
import { lantern, lanternSprite, cjkText, stripedAwning } from './artkit.js';
import { hslToHex, shade } from '../core/color.js';

// Immediate-mode drawing for world props. `time` drives gentle sway/animation.
// Each function draws centred on (0,0) after the renderer translates to the prop.
// `tall` props return a height so they can be sorted and given roof-like offsets.

export const PROP_DRAW = {
  tree(g, p, time) {
    const s = p.size || 1, r = 14 * s, sway = Math.sin(time * 1.1 + p.seed) * 0.8;
    g.fillStyle = 'rgba(8,6,20,0.26)'; g.beginPath(); g.ellipse(r * 0.55, r * 0.45, r * 0.95, r * 0.7, 0, 0, 6.3); g.fill();
    g.fillStyle = '#4a3322'; g.fillRect(-2, -2, 4, 8); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(-2, -2, 4, 8);
    const base = p.hue < 0.33 ? '#3f8a45' : p.hue < 0.66 ? '#4c9a4a' : '#357a50';
    // canopy leans with the camera like building roofs (renderer sets p.lx / p.ly)
    const lift = -14 * s + (p.ly || 0) * 16 * s * 0.8, lean = (p.lx || 0) * 16 * s;
    if (lean) { g.strokeStyle = '#4a3322'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 2); g.lineTo(lean * 0.8, lift * 0.6); g.stroke(); }
    g.translate(lean, 0);
    for (const [dx, dy, rad, c] of [[-5 * s, 3, r * 0.7, shade(base, -0.2)], [5 * s, 2, r * 0.72, shade(base, -0.12)], [0, -2, r * 0.95, base]]) {
      g.beginPath(); g.arc(dx + sway, lift + dy, rad, 0, 6.3); g.fillStyle = c; g.fill(); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke();
    }
    g.fillStyle = 'rgba(210,255,170,0.3)'; g.beginPath(); g.arc(-r * 0.3 + sway, lift - r * 0.35, r * 0.38, 0, 6.3); g.fill();
    if (p.hue > 0.8) { g.fillStyle = '#ffb3c8'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(sway + Math.cos(i * 2.1 + p.seed) * r * 0.6, lift + Math.sin(i * 1.7 + p.seed) * r * 0.5, 1.6, 0, 6.3); g.fill(); } }
  },
  lamp(g, p) {
    g.fillStyle = 'rgba(8,6,20,0.22)'; g.beginPath(); g.ellipse(3, 3, 3.5, 2, 0, 0, 6.3); g.fill();
    inkCircle(g, 0, 0, 2.6, '#3a3d46', 1.2);
    const dx = Math.cos(p.dir || 0) * -5, dy = Math.sin(p.dir || 0) * -5;
    g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(dx, dy - 10); g.stroke();
    g.strokeStyle = '#3a3d46'; g.lineWidth = 1.2; g.stroke();
    inkRect(g, dx - 3, dy - 13, 6, 4, '#e8d9a0', 1, 1.2);
  },
  bench(g, p) { g.save(); g.rotate(p.rot || 0); inkRect(g, -9, -3, 18, 6, '#8a5a34', 1, 1.2); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(-8, -2.4, 16, 1.4); g.restore(); },
  planter(g) { inkCircle(g, 0, 0, 8, '#8a8d94', 1.4); inkCircle(g, 0, 0, 6, '#4c8a46', 1); g.fillStyle = '#f2a0b8'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(Math.cos(i * 1.3) * 3, Math.sin(i * 1.3) * 3, 1.3, 0, 6.3); g.fill(); } },
  fountain(g, p, time) {
    inkCircle(g, 0, 0, 30, '#9aa0a8', 1.8); inkCircle(g, 0, 0, 25, '#3f8fc0', 1.2);
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 1.2; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(0, 0, 8 + ((time * 14 + i * 6) % 17), 0, 6.3); g.stroke(); }
    inkCircle(g, 0, 0, 6, '#c9ced4', 1.4); g.fillStyle = 'rgba(180,230,255,0.8)'; g.beginPath(); g.arc(0, -3, 3, 0, 6.3); g.fill();
  },
  hydrant(g) { inkRect(g, -2.5, -2.5, 5, 5, '#d63a30', 1, 1.1); g.fillStyle = '#f1f1ea'; g.fillRect(-2.5, -0.4, 5, 0.9); },
  bin(g, p) { inkCircle(g, 0, 0, 5.2, '#4a5560', 1.2); inkCircle(g, 0, 0, 3.6, '#2a3038', 0.8); },
  dumpster(g, p) { g.save(); g.rotate(p.rot || 0); g.fillStyle = 'rgba(8,6,20,0.25)'; g.fillRect(-9, -5, 20, 14); inkRect(g, -11, -7, 22, 14, '#3a6a4a', 1.5, 1.4); g.fillStyle = '#2a4a34'; g.fillRect(-10, -6, 20, 4); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(-10, -6, 20, 1.2); g.restore(); },
  crate(g, p) { g.save(); g.rotate((p.rot || 0) * 0.3); g.fillStyle = 'rgba(8,6,20,0.25)'; g.fillRect(-6, -5, 15, 13); inkRect(g, -8, -8, 16, 16, '#a67a44', 1, 1.4); g.strokeStyle = 'rgba(60,35,10,0.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-8, -8); g.lineTo(8, 8); g.moveTo(8, -8); g.lineTo(-8, 8); g.stroke(); g.restore(); },
  barrel(g) { inkCircle(g, 0, 0, 6, '#b3453a', 1.4); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, 3.6, 0, 6.3); g.stroke(); },
  bollard(g) { inkCircle(g, 0, 0, 3.4, '#d9a441', 1.2); },
  pillar(g, p) { g.fillStyle = 'rgba(8,6,20,0.3)'; g.beginPath(); g.ellipse(4, 4, 9, 6, 0, 0, 6.3); g.fill(); inkCircle(g, 0, 0, 7, '#a8231d', 1.8); g.fillStyle = '#f1c64a'; g.beginPath(); g.arc(0, 0, 3, 0, 6.3); g.fill(); },
  incense(g, p, time) { inkCircle(g, 0, 0, 10, '#c9a24a', 1.6); inkCircle(g, 0, 0, 7, '#2a2024', 1); for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(220,60,40,0.9)'; g.fillRect(-4 + i * 2, -2, 1, 4); } g.fillStyle = 'rgba(230,230,235,0.25)'; g.beginPath(); g.arc(Math.sin(time * 1.3) * 3, -10 - ((time * 8) % 12), 3 + ((time * 8) % 12) * 0.3, 0, 6.3); g.fill(); },
  lion(g, p) { g.save(); if (p.flip) g.scale(-1, 1); g.fillStyle = 'rgba(8,6,20,0.25)'; g.beginPath(); g.ellipse(3, 4, 10, 7, 0, 0, 6.3); g.fill(); inkRect(g, -8, -8, 16, 16, '#a39a88', 3, 1.6); inkCircle(g, 0, -2, 5, '#b5ac98', 1.3); g.fillStyle = INK; g.fillRect(-3, -4, 2, 2); g.fillRect(2, -4, 2, 2); g.restore(); },
  lantern_post(g, p, time) { inkCircle(g, 0, 0, 3, '#3a3d46', 1.2); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -21); g.stroke(); hangLantern(g, 0, -21, 5, '#e23b2e', Math.sin(time * 1.5 + (p.seed || 0)) * 0.12); },
  boat(g, p, time) {
    const bob = Math.sin(time * 1.3 + p.seed) * 1.6, rot = Math.sin(time * 0.7 + p.seed) * 0.03; g.save(); g.translate(0, bob); g.rotate((p.rot || 0) + rot);
    g.fillStyle = 'rgba(0,10,30,0.3)'; g.beginPath(); g.ellipse(5, 8, 42, 15, 0, 0, 6.3); g.fill();
    g.beginPath(); g.moveTo(-44, -2); g.quadraticCurveTo(-40, -15, -6, -16); g.lineTo(34, -12); g.quadraticCurveTo(52, 0, 34, 12); g.lineTo(-6, 16); g.quadraticCurveTo(-40, 15, -44, 2); g.closePath();
    const gr = g.createLinearGradient(0, -16, 0, 16); gr.addColorStop(0, shade(p.color || '#c8453b', 0.2)); gr.addColorStop(1, shade(p.color || '#c8453b', -0.3)); g.fillStyle = gr; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-40, -1); g.quadraticCurveTo(0, -13, 40, 0); g.stroke();
    inkRect(g, -22, -8, 24, 16, '#d9c9a0', 3, 1.6); g.fillStyle = '#2c7a6b'; g.fillRect(-20, -6, 20, 12); g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1; for (let x = -18; x < -2; x += 4) { g.beginPath(); g.moveTo(x, -6); g.lineTo(x, 6); g.stroke(); }
    inkCircle(g, 20, 0, 3.4, '#6a4a2a', 1.2); g.restore();
  },
  ship(g, p, time) {
    const bob = Math.sin(time * 0.6 + p.seed) * 1.2; g.save(); g.translate(0, bob); const L = p.len || 520, W = 120;
    g.fillStyle = 'rgba(0,10,30,0.3)'; g.beginPath(); g.ellipse(10, 18, L / 2, W / 2.3, 0, 0, 6.3); g.fill();
    g.beginPath(); g.moveTo(-L / 2, -W / 2); g.lineTo(L / 2 - 70, -W / 2); g.quadraticCurveTo(L / 2 + 20, 0, L / 2 - 70, W / 2); g.lineTo(-L / 2, W / 2); g.closePath();
    const gr = g.createLinearGradient(0, -W / 2, 0, W / 2); gr.addColorStop(0, '#46525e'); gr.addColorStop(1, '#222a33'); g.fillStyle = gr; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    g.fillStyle = '#8a2a22'; g.fillRect(-L / 2 + 4, W / 2 - 14, L - 78, 8);
    const COL = ['#c8453b', '#2a6fb0', '#e0a233', '#3c8c6a', '#7a4a8a', '#d9d4c4']; let i = 0;
    for (let x = -L / 2 + 20; x < L / 2 - 150; x += 46) for (let y = -W / 2 + 12; y < W / 2 - 14; y += 26) { inkRect(g, x, y, 40, 22, COL[(i++ * 7 + p.seed) % COL.length], 1, 1.6); g.fillStyle = 'rgba(0,0,0,0.18)'; for (let k = 4; k < 38; k += 5) g.fillRect(x + k, y + 2, 1.2, 18); }
    inkRect(g, L / 2 - 140, -W / 2 + 14, 58, W - 28, '#e8e4d8', 3, 2); inkRect(g, L / 2 - 126, -W / 2 + 22, 30, W - 44, '#9fb4c4', 2, 1.6);
    g.restore();
  },
  cart(g, p) {
    g.fillStyle = 'rgba(8,6,20,0.3)'; g.beginPath(); g.ellipse(4, 6, 16, 8, 0, 0, 6.3); g.fill();
    inkCircle(g, -13, 7, 2.6, '#2a2a30', 1.1); inkCircle(g, 13, 7, 2.6, '#2a2a30', 1.1);
    inkRect(g, -13, -7, 26, 13, '#c8202a', 2, 1.8);
    g.fillStyle = '#f1c64a'; g.fillRect(-12, 3.5, 24, 1.6);
    g.fillStyle = '#fff2d0'; g.fillRect(-11, -5, 22, 5);
    // steamer baskets / skewers / fruit, in punchy colours
    const GOODS = [['#e8b04a', '#a8702a'], ['#ff5a2a', '#a82a10'], ['#4fc04a', '#2a7a2a'], ['#ffd23a', '#b08a10']];
    for (let i = 0; i < 4; i++) { const [c, d] = GOODS[(i + (p.seed || 0)) % 4]; inkCircle(g, -8 + i * 5.4, -2.4, 2.4, c, 0.9); g.fillStyle = d; g.beginPath(); g.arc(-8 + i * 5.4 + 0.6, -2, 1, 0, 6.3); g.fill(); }
    g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(13, -2); g.lineTo(19, -4); g.stroke();
    // umbrella: alternating saturated panels with an ink rim and a gold finial
    const cols = [['#e23b2e', '#ffd23a'], ['#2a8fd0', '#ffffff'], ['#1f8a5a', '#f1c64a'], ['#ff5a8a', '#ffffff']][(p.seed || 0) % 4];
    g.save(); g.translate(0, -17);
    for (let i = 0; i < 8; i++) { const a0 = i * Math.PI / 4; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 13.5, a0, a0 + Math.PI / 4); g.closePath(); g.fillStyle = cols[i & 1]; g.fill(); }
    g.beginPath(); g.arc(0, 0, 13.5, 0, 6.3); g.lineWidth = 1.8; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 0.8; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); g.arc(-4, -4, 5, 0, 6.3); g.fill();
    inkCircle(g, 0, 0, 1.8, '#f1c64a', 0.9); g.restore();
  },
  paifang() { /* drawn by the renderer as an overhead structure */ },
};

// Overhead gate across a road: two pillars (collidable props) + a tiled arch drawn "above" everything.
export function drawPaifang(g, p, time) {
  g.save();
  const horizontal = p.axis === 'h';           // road runs left-right
  const span = p.span + 32, lift = -46;
  g.translate(p.x, p.y + lift);
  if (horizontal) g.rotate(Math.PI / 2);
  const w = span, h = 22;
  // beam
  inkRect(g, -w / 2, -h / 2 + 6, w, 12, '#a8231d', 2, 1.8);
  g.fillStyle = '#f1c64a'; g.fillRect(-w / 2 + 3, -h / 2 + 8, w - 6, 2);
  // roof
  g.fillStyle = '#2c7a6b'; g.beginPath(); g.moveTo(-w / 2 - 8, -h / 2 + 7); g.lineTo(-w / 2 + 6, -h / 2 - 8); g.lineTo(w / 2 - 6, -h / 2 - 8); g.lineTo(w / 2 + 8, -h / 2 + 7); g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1; for (let x = -w / 2 + 6; x < w / 2 - 4; x += 5) { g.beginPath(); g.moveTo(x, -h / 2 - 8); g.lineTo(x - 2, -h / 2 + 7); g.stroke(); }
  g.fillStyle = '#f1c64a'; g.beginPath(); g.arc(-w / 2 - 8, -h / 2 + 7, 3, 0, 6.3); g.arc(w / 2 + 8, -h / 2 + 7, 3, 0, 6.3); g.fill();
  // plaque
  inkRect(g, -17, -h / 2 + 3, 34, 8, '#171019', 2, 1.4);
  g.save(); if (horizontal) g.rotate(-Math.PI / 2 * 0); cjkText(g, '龍門', 0, -h / 2 + 7.4, 8, '#ffd23a'); g.restore();
  g.restore();
  void time;
}

// Lantern hung from (x, y), rotated about its hanging point (cached sprite).
function hangLantern(g, x, y, r, color, ang) {
  const sp = lanternSprite(r, color);
  g.save(); g.translate(x, y); if (ang) g.rotate(ang); g.drawImage(sp, -sp.ax, -sp.ay, sp.w, sp.h); g.restore();
}

// Lantern strings that span a street, swaying gently with the wind.
export function drawLanternLine(g, l, time) {
  const n = l.n, wind = Math.sin(time * 0.7 + l.seed), sag = 10 + wind * 1.6;
  g.strokeStyle = INK; g.lineWidth = 1.3; g.beginPath(); g.moveTo(l.x0, l.y0 - 28);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = l.x0 + (l.x1 - l.x0) * t, y = l.y0 + (l.y1 - l.y0) * t - 28 + Math.sin(t * Math.PI) * sag;
    pts.push([x, y]); g.lineTo(x, y);
  }
  g.stroke();
  for (let i = 1; i < n; i++) {
    const [x, y] = pts[i], ang = Math.sin(time * 1.6 + l.seed + i * 0.9) * 0.14 + wind * 0.06;
    hangLantern(g, x, y, 5, i % 3 === 0 ? '#ffcc33' : l.color, ang);
  }
  void hslToHex; void stripedAwning; void lantern;
}
