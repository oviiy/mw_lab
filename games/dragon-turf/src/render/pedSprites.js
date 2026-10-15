import { INK, makeCanvas } from './style.js';
import { shade, hexToRgb, rgbToHsl, hslToHex } from '../core/color.js';

// Pedestrians are drawn top-down facing +X into small cached canvases
// (per look × walk phase × held item) and then rotated at draw time.
const S = 60, C = S / 2, RES = 2;   // roomy canvas so long guns are not clipped
const cache = new Map();

export function pedSprite(look, phase, hold) {
  const key = look.id + '|' + phase + '|' + hold;
  let c = cache.get(key);
  if (!c) { c = make(look, phase, hold); cache.set(key, c); }
  return c;
}
export const PED_SPRITE_SIZE = S;
const FIG = 1.2;          // figure drawn 20% larger inside the same canvas
const RIM = 1.5;          // silhouette ink rim, sprite px

// Punchier clothing: push saturation up (and lift very dark saturated colours
// a touch) so faction suits read against dark asphalt. Neutrals stay neutral.
const popCache = new Map();
function pop(hex) {
  if (!hex || hex[0] !== '#') return hex;
  let c = popCache.get(hex); if (c) return c;
  const [r, g, b] = hexToRgb(hex), [h, sat, l] = rgbToHsl(r, g, b);
  c = sat < 0.12 ? hex : hslToHex(h, Math.min(1, sat * 1.35 + 0.08), l < 0.32 ? l + (0.32 - l) * 0.55 : Math.min(0.62, l));
  popCache.set(hex, c); return c;
}
function vivid(look) {
  return { ...look, top: pop(look.top), bottom: pop(look.bottom), vest: pop(look.vest), trim: look.trim && pop(look.trim), scarf: look.scarf && pop(look.scarf), tattoo: look.tattoo, hatColor: look.hatColor && pop(look.hatColor) };
}

// Ink rim around the whole silhouette: stamp an INK-tinted copy of the figure at
// 8 offsets underneath it. Done once per cached sprite, so it costs nothing per frame.
function rimmed(fig) {
  const w = fig.width, h = fig.height, ink = makeCanvas(w, h), q = ink.getContext('2d');
  q.drawImage(fig, 0, 0); q.globalCompositeOperation = 'source-in'; q.fillStyle = INK; q.fillRect(0, 0, w, h);
  const out = makeCanvas(w, h), o = out.getContext('2d'), d = RIM * RES;
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o.drawImage(ink, Math.round(Math.cos(a) * d), Math.round(Math.sin(a) * d)); }
  o.drawImage(fig, 0, 0);
  return out;
}

function make(look0, phase, hold) {
  const look = vivid(look0);
  const cv = makeCanvas(S * RES, S * RES), g = cv.getContext('2d');
  g.scale(RES, RES); g.translate(C, C); g.scale(FIG, FIG); g.lineJoin = 'round';
  const step = [0, 3.4, 0, -3.4][phase & 3];
  const ln = 1.5;
  const ell = (x, y, rx, ry, fill, w = ln) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.3); g.fillStyle = fill; g.fill(); g.lineWidth = w; g.strokeStyle = INK; g.stroke(); };
  // legs / shoes
  ell(step, -3, 3.6, 2.4, look.bottom); ell(-step, 3, 3.6, 2.4, look.bottom);
  ell(step + 1.8, -3, 1.6, 1.6, look.shoes, 1); ell(-step + 1.8, 3, 1.6, 1.6, look.shoes, 1);
  // back arm (left)
  const armSwing = hold === 'none' ? -step * 0.6 : 1;
  ell(armSwing, -7.6, 2.6, 2.3, look.top, 1.2);
  // torso
  g.beginPath(); g.ellipse(0, 0, 5.3 + look.build * 0.8, 8.3 + look.build * 1.1, 0, 0, 6.3);
  const gr = g.createLinearGradient(-6, -8, 6, 8); gr.addColorStop(0, shade(look.top, 0.2)); gr.addColorStop(1, shade(look.top, -0.2));
  g.fillStyle = gr; g.fill(); g.lineWidth = 1.7; g.strokeStyle = INK; g.stroke();
  if (look.vest) { g.fillStyle = look.vest; g.beginPath(); g.ellipse(0, 0, 3.8, 6, 0, 0, 6.3); g.fill(); g.lineWidth = 1; g.stroke(); }
  if (look.trim) { g.fillStyle = look.trim; g.fillRect(-1.4, -8, 2.8, 16); g.beginPath(); g.ellipse(0, -7.2, 2.6, 1.9, 0, 0, 6.3); g.ellipse(0, 7.2, 2.6, 1.9, 0, 0, 6.3); g.fill(); g.lineWidth = 0.8; g.strokeStyle = INK; g.stroke(); }
  if (look.scarf) { g.strokeStyle = look.scarf; g.lineWidth = 2.6; g.beginPath(); g.moveTo(2.5, -6); g.quadraticCurveTo(5, 0, 2.5, 6); g.stroke(); g.lineWidth = 1; g.strokeStyle = INK; g.beginPath(); g.moveTo(2.5, -6); g.quadraticCurveTo(5, 0, 2.5, 6); g.stroke(); }
  if (look.tattoo) { g.strokeStyle = look.tattoo; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-3, -3); g.bezierCurveTo(-5, -1, -1, 1, -3, 3); g.stroke(); }
  // front arm (right) + held item
  const hx = 6.6 + (hold === 'none' ? armSwing * 0.0 : 0), hy = 7;
  if (hold === 'none') ell(-armSwing + 1, hy, 2.6, 2.3, look.top, 1.2);
  else { ell(hx + 2, hy - 3.6, 2.5, 2.3, look.top, 1.2); drawHeld(g, hold, hx + 4, hy - 3.6); ell(hx + 2.5, hy - 3.6, 1.7, 1.7, look.skin, 1); }
  // head
  ell(0.6, 0, 5.4, 5.6, look.skin, 1.5);
  g.fillStyle = look.hair; g.beginPath(); g.ellipse(-0.6, 0, 4.7, 5.2, 0, Math.PI * 0.45, Math.PI * 1.55); g.fill();
  if (look.hairStyle === 'spiky') { g.fillStyle = look.hair; for (let i = 0; i < 6; i++) { const a = 1.7 + i * 0.5; g.beginPath(); g.moveTo(Math.cos(a) * 3.8, Math.sin(a) * 3.8); g.lineTo(Math.cos(a) * 7.8, Math.sin(a) * 7.8); g.lineTo(Math.cos(a + 0.35) * 3.8, Math.sin(a + 0.35) * 3.8); g.fill(); } }
  if (look.hairStyle === 'bun') { ell(-5, 0, 2.6, 2.6, look.hair, 1.2); }
  if (look.hairStyle === 'long') { g.fillStyle = look.hair; g.beginPath(); g.ellipse(-3.4, 0, 4, 5.6, 0, 0, 6.3); g.fill(); }
  if (look.shades) { g.fillStyle = '#0a0a10'; g.fillRect(3.2, -3.3, 2.4, 6.6); }
  // hats
  if (look.hat === 'straw') { g.beginPath(); g.arc(0, 0, 10.5, 0, 6.3); g.fillStyle = '#e8cf86'; g.fill(); g.lineWidth = 1.7; g.strokeStyle = INK; g.stroke(); g.strokeStyle = 'rgba(120,80,20,0.45)'; g.lineWidth = 0.9; for (const r of [3, 6, 8.6]) { g.beginPath(); g.arc(0, 0, r, 0, 6.3); g.stroke(); } g.fillStyle = '#c8453b'; g.beginPath(); g.arc(0, 0, 1.6, 0, 6.3); g.fill(); }
  else if (look.hat === 'cap') { g.beginPath(); g.ellipse(0, 0, 5.8, 6.2, 0, 0, 6.3); g.fillStyle = look.hatColor || '#1c2a5a'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = INK; g.stroke(); g.fillStyle = shade(look.hatColor || '#1c2a5a', -0.25); g.beginPath(); g.ellipse(5.4, 0, 2.6, 4.4, 0, -1.5, 1.5); g.fill(); g.stroke(); g.fillStyle = '#f1c64a'; g.fillRect(-1, -1, 2, 2); }
  else if (look.hat === 'helmet') { g.beginPath(); g.ellipse(0, 0, 6.4, 6.8, 0, 0, 6.3); g.fillStyle = '#20242c'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.ellipse(-1.2, -1.5, 3, 2.2, 0, 0, 6.3); g.fill(); g.fillStyle = '#7fd8ff'; g.fillRect(3.4, -4, 2.6, 8); }
  else if (look.hat === 'bandana') { g.fillStyle = look.hatColor; g.beginPath(); g.ellipse(0.2, 0, 5.8, 6, 0, -1.9, 1.9); g.fill(); g.lineWidth = 1.4; g.strokeStyle = INK; g.stroke(); g.fillRect(-7.8, -1.2, 3, 2.4); }
  else if (look.hat === 'fedora') { g.beginPath(); g.ellipse(0, 0, 8, 8.2, 0, 0, 6.3); g.fillStyle = look.hatColor || '#2a2428'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.ellipse(0, 0, 4.4, 4.6, 0, 0, 6.3); g.fillStyle = shade(look.hatColor || '#2a2428', 0.15); g.fill(); g.stroke(); g.strokeStyle = '#c8453b'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, 0, 4.4, 4.6, 0, 0, 6.3); g.stroke(); }
  else if (look.hat === 'beanie') { g.beginPath(); g.ellipse(0, 0, 5.6, 6, 0, 0, 6.3); g.fillStyle = look.hatColor; g.fill(); g.lineWidth = 1.5; g.strokeStyle = INK; g.stroke(); }
  return rimmed(cv);
}

function drawHeld(g, hold, x, y) {
  g.save(); g.translate(x, y); g.lineWidth = 1.2; g.strokeStyle = INK;
  const rect = (x0, y0, w, h, f) => { g.fillStyle = f; g.fillRect(x0, y0, w, h); g.strokeRect(x0, y0, w, h); };
  if (hold === 'pistol') { rect(0, -1.4, 8, 2.8, '#3a3d46'); rect(0, 0.6, 3, 2.6, '#2a2d34'); }
  else if (hold === 'smg') { rect(-1, -1.5, 11, 3, '#30333a'); rect(2, 1, 2.6, 4.2, '#222'); rect(8, -0.8, 3.5, 1.6, '#555'); }
  else if (hold === 'shotgun') { rect(-2, -1.6, 18, 3.2, '#4a3a2a'); rect(5, -1.2, 11, 2.4, '#2a2a30'); }
  else if (hold === 'rifle') { rect(-3, -1.6, 20, 3.2, '#2a2a30'); rect(-3, -1.8, 7, 3.6, '#5a3d24'); rect(5, 0.8, 2.6, 4.4, '#222'); }
  else if (hold === 'blade') { rect(0, -1, 4, 2, '#5a3d24'); g.beginPath(); g.moveTo(4, -2.4); g.lineTo(12, -2.4); g.lineTo(13, 1.4); g.lineTo(4, 1.4); g.closePath(); g.fillStyle = '#d4d8de'; g.fill(); g.stroke(); }
  else if (hold === 'bottle') { rect(0, -1.6, 6, 3.2, '#4a8a5a'); g.fillStyle = '#ffb347'; g.fillRect(6, -0.8, 2, 1.6); }
  else if (hold === 'grenade') { g.beginPath(); g.arc(1.5, 0, 2.8, 0, 6.3); g.fillStyle = '#4a5a3a'; g.fill(); g.stroke(); }
  g.restore();
}

// Fallen body, drawn as a flattened version of the same look.
const corpseCache = new Map();
export function corpseSprite(look) {
  let c = corpseCache.get(look.id);
  if (c) return c;
  c = makeCanvas(S * RES, S * RES); const g = c.getContext('2d');
  g.scale(RES, RES); g.translate(C, C); g.scale(FIG, FIG); g.lineJoin = 'round';
  const ell = (x, y, rx, ry, fill, w = 1.5, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 6.3); g.fillStyle = fill; g.fill(); g.lineWidth = w; g.strokeStyle = INK; g.stroke(); };
  ell(-6, -4, 4.6, 2.4, look.bottom, 1.3, 0.3); ell(-6.5, 4, 4.6, 2.4, look.bottom, 1.3, -0.35);
  ell(-1, -8.5, 2.8, 2.4, look.top, 1.2, -0.5); ell(0, 8.5, 2.8, 2.4, look.top, 1.2, 0.5);
  ell(0, 0, 8.4, 5.6, look.top, 1.7);
  ell(7.5, 0, 4.8, 5, look.skin, 1.5);
  g.fillStyle = look.hair; g.beginPath(); g.ellipse(6.4, 0, 4.2, 4.6, 0, Math.PI * 0.45, Math.PI * 1.55); g.fill();
  c = rimmed(c); corpseCache.set(look.id, c); return c;
}
