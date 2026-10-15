import { INK, makeCanvas, rr } from './style.js';
import { shade, mix } from '../core/color.js';
import { VEHICLES } from '../data/vehicles.js';

// Vehicles are drawn top-down facing +X into cached canvases (per kind × colour × damage).
const RES = 2, PADV = 8;
const cache = new Map();

export function vehicleSprite(type, color, dmg = 0) {
  const key = type + color + dmg;
  let s = cache.get(key);
  if (!s) { s = make(type, color, dmg); cache.set(key, s); }
  return s;
}

function make(type, color, dmg) {
  const def = VEHICLES[type], L = def.len, W = def.span || def.wid;
  const cv = makeCanvas((L + PADV * 2) * RES, (W + PADV * 2) * RES), g = cv.getContext('2d');
  g.scale(RES, RES); g.translate(L / 2 + PADV, W / 2 + PADV); g.lineJoin = 'round';
  const body = dmg >= 2 ? '#1c1a1e' : dmg === 1 ? mix(color, '#2a2428', 0.28) : color;
  (PAINT[def.kind] || paintCar)(g, L, W, body, def, dmg);
  if (dmg >= 1 && !def.span) scorch(g, L, W, dmg);
  const out = { canvas: cv, w: L + PADV * 2, h: W + PADV * 2, cx: L / 2 + PADV, cy: W / 2 + PADV };
  if (def.span) { // aircraft cast a silhouette shadow, not a box
    const sh = makeCanvas(cv.width, cv.height), q = sh.getContext('2d'); q.drawImage(cv, 0, 0); q.globalCompositeOperation = 'source-in'; q.fillStyle = 'rgba(10,6,24,1)'; q.fillRect(0, 0, sh.width, sh.height); out.shadow = sh;
  }
  return out;
}

// Tank turret: separate sprite so it can track the mouse independently of the hull.
const tcache = new Map();
export function turretSprite(color, dmg = 0) {
  const key = color + dmg; let s = tcache.get(key); if (s) return s;
  const S = 76, cv = makeCanvas(S * RES, 40 * RES), g = cv.getContext('2d'); g.scale(RES, RES); g.translate(26, 20); g.lineJoin = 'round';
  const body = dmg >= 2 ? '#1c1a1e' : dmg === 1 ? mix(color, '#2a2428', 0.3) : color;
  g.fillStyle = '#2a2c24'; g.fillRect(8, -3, 38, 6); g.lineWidth = 1.6; g.strokeStyle = INK; g.strokeRect(8, -3, 38, 6);       // barrel
  g.fillStyle = '#3a3c32'; g.fillRect(40, -4, 8, 8); g.strokeRect(40, -4, 8, 8);                                                  // muzzle brake
  rr(g, -16, -13, 30, 26, 7); const gr = g.createLinearGradient(0, -13, 0, 13); gr.addColorStop(0, shade(body, 0.3)); gr.addColorStop(1, shade(body, -0.25)); g.fillStyle = gr; g.fill(); g.lineWidth = 2; g.stroke();
  g.beginPath(); g.arc(-5, -4, 5, 0, 6.3); g.fillStyle = shade(body, -0.15); g.fill(); g.lineWidth = 1.2; g.stroke();                 // hatch
  g.fillStyle = '#e8c34a'; star(g, 4, 5, 4); g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(-14, -11, 24, 2);
  s = { canvas: cv, w: S, h: 40, cx: 26, cy: 20 }; tcache.set(key, s); return s;
}
function star(g, x, y, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i & 1 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); g.fill(); }

/* ---- shared bits ---- */
const wheels = (g, L, W, r = 4.2, inset = 0.28) => {
  g.fillStyle = '#17141a';
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { g.beginPath(); g.roundRect(sx * L * inset - 4.6, sy * (W / 2) - (sy > 0 ? 1.2 : 2.2), 9.2, 3.4, 1.4); g.fill(); }
  void r;
};
const lights = (g, L, W, head = '#fff2b0', tail = '#e22') => {
  for (const sy of [-1, 1]) {
    g.fillStyle = head; g.fillRect(L / 2 - 2.6, sy * (W / 2 - 4.6) - 1.7, 2.6, 3.4); g.lineWidth = 0.9; g.strokeStyle = INK; g.strokeRect(L / 2 - 2.6, sy * (W / 2 - 4.6) - 1.7, 2.6, 3.4);
    g.fillStyle = tail; g.fillRect(-L / 2, sy * (W / 2 - 4.6) - 1.7, 2.2, 3.4); g.strokeRect(-L / 2, sy * (W / 2 - 4.6) - 1.7, 2.2, 3.4);
  }
};
const glass = (g, x, y, w, h, r = 2) => {
  rr(g, x, y, w, h, r); const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#6f9cc0'); gr.addColorStop(1, '#233a56'); g.fillStyle = gr; g.fill(); g.lineWidth = 1.2; g.strokeStyle = INK; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); g.moveTo(x + w * 0.1, y + h * 0.9); g.lineTo(x + w * 0.5, y + h * 0.1); g.lineTo(x + w * 0.7, y + h * 0.1); g.lineTo(x + w * 0.3, y + h * 0.9); g.fill();
};
const bodyShape = (g, L, W, color, rad = 7) => {
  const gr = g.createLinearGradient(0, -W / 2, 0, W / 2); gr.addColorStop(0, shade(color, 0.28)); gr.addColorStop(0.5, color); gr.addColorStop(1, shade(color, -0.3));
  rr(g, -L / 2, -W / 2, L, W, rad); g.fillStyle = gr; g.fill(); g.lineWidth = 1.9; g.strokeStyle = INK; g.stroke();
};
const mirrors = (g, L, W) => { g.fillStyle = INK; for (const sy of [-1, 1]) g.fillRect(L * 0.12, sy * (W / 2 + 0.2) - 1, 2.6, 2); };

function scorch(g, L, W, dmg) {
  g.save(); rr(g, -L / 2, -W / 2, L, W, 7); g.clip();
  g.fillStyle = `rgba(0,0,0,${dmg >= 2 ? 0.5 : 0.22})`;
  for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(((i * 37) % L) - L / 2, ((i * 53) % W) - W / 2, 6, 4, i, 0, 6.3); g.fill(); }
  g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-L / 2 + i * 14, -W / 2); g.lineTo(-L / 2 + i * 14 + 8, W / 2); g.stroke(); }
  g.restore();
}

/* ---- painters ---- */
function paintCar(g, L, W, color, def) {
  wheels(g, L, W);
  bodyShape(g, L, W, color);
  // hood + trunk lines
  g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1; g.beginPath(); g.moveTo(L * 0.18, -W / 2 + 3); g.lineTo(L * 0.18, W / 2 - 3); g.moveTo(-L * 0.3, -W / 2 + 3); g.lineTo(-L * 0.3, W / 2 - 3); g.stroke();
  glass(g, L * 0.06, -W / 2 + 3, L * 0.14, W - 6, 3);            // windshield
  glass(g, -L * 0.36, -W / 2 + 3.5, L * 0.1, W - 7, 3);          // rear glass
  // roof
  rr(g, -L * 0.24, -W / 2 + 3, L * 0.3, W - 6, 4); const gr = g.createLinearGradient(0, -W / 2, 0, W / 2); gr.addColorStop(0, shade(color, 0.38)); gr.addColorStop(1, shade(color, -0.05)); g.fillStyle = gr; g.fill(); g.lineWidth = 1.3; g.strokeStyle = INK; g.stroke();
  mirrors(g, L, W); lights(g, L, W);
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(L * 0.2, -W / 2 + 1.6, L * 0.26, 1.6);
}

function paintSports(g, L, W, color) {
  wheels(g, L, W, 4.2, 0.3);
  bodyShape(g, L, W, color, 9);
  g.fillStyle = 'rgba(255,255,255,0.88)'; g.fillRect(-L / 2 + 3, -2.2, L - 6, 1.6); g.fillRect(-L / 2 + 3, 0.8, L - 6, 1.6);       // racing stripes
  glass(g, L * 0.02, -W / 2 + 3.4, L * 0.16, W - 6.8, 4); glass(g, -L * 0.3, -W / 2 + 3.8, L * 0.1, W - 7.6, 3);
  rr(g, -L * 0.22, -W / 2 + 4, L * 0.22, W - 8, 4); g.fillStyle = shade(color, 0.1); g.fill(); g.lineWidth = 1.2; g.strokeStyle = INK; g.stroke();
  g.fillStyle = INK; g.fillRect(-L / 2 - 1, -W / 2 + 1.6, 3, W - 3.2);                                                              // spoiler
  g.fillStyle = shade(color, -0.1); g.fillRect(-L / 2 - 0.4, -W / 2 + 2, 2, W - 4);
  mirrors(g, L, W); lights(g, L, W);
}

function paintTaxi(g, L, W, color) {
  paintCar(g, L, W, color);
  rr(g, -L * 0.24, -W / 2 + 3, L * 0.3, W - 6, 4); g.fillStyle = '#d7dadf'; g.fill(); g.lineWidth = 1.3; g.strokeStyle = INK; g.stroke();         // silver roof (HK style)
  g.fillStyle = '#ffd23a'; g.fillRect(-L * 0.12, -4, 7, 8); g.lineWidth = 1; g.strokeRect(-L * 0.12, -4, 7, 8);
  g.fillStyle = '#e8e4d8'; for (let i = 0; i < 6; i++) g.fillRect(-L / 2 + 6 + i * 4, -W / 2 + 0.6, 2, 2);
}

function paintPolice(g, L, W) {
  paintCar(g, L, W, '#eef0f4');
  g.fillStyle = '#1d3f8a'; g.fillRect(L * 0.18, -W / 2 + 1, L * 0.22, W - 2); g.fillRect(-L * 0.45, -W / 2 + 1, L * 0.13, W - 2);
  glass(g, L * 0.06, -W / 2 + 3, L * 0.12, W - 6, 3);
  g.fillStyle = '#20242c'; g.fillRect(-L * 0.06, -W / 2 + 3, 5, W - 6); g.lineWidth = 1; g.strokeStyle = INK; g.strokeRect(-L * 0.06, -W / 2 + 3, 5, W - 6);  // light bar base
  g.fillStyle = '#1d3f8a'; g.font = 'bold 6px sans-serif'; g.textAlign = 'center'; g.save(); g.translate(-L * 0.18, 0); g.rotate(Math.PI / 2); g.fillText('POLICE', 0, 2); g.restore();
}

function paintSwat(g, L, W, color) {
  wheels(g, L, W, 4.6, 0.3); bodyShape(g, L, W, color, 6);
  glass(g, L * 0.2, -W / 2 + 3.5, L * 0.12, W - 7, 2);
  g.fillStyle = '#2a3140'; g.fillRect(-L * 0.4, -W / 2 + 4, L * 0.56, W - 8); g.strokeStyle = INK; g.lineWidth = 1.2; g.strokeRect(-L * 0.4, -W / 2 + 4, L * 0.56, W - 8);
  g.fillStyle = '#e8e4d8'; g.font = 'bold 7px sans-serif'; g.textAlign = 'center'; g.save(); g.translate(-L * 0.1, 0); g.rotate(Math.PI / 2); g.fillText('SWAT', 0, 2.5); g.restore();
  lights(g, L, W);
}

function paintArmored(g, L, W, color) {
  wheels(g, L, W, 5, 0.3); bodyShape(g, L, W, color, 4);
  g.fillStyle = shade(color, -0.2); g.fillRect(-L * 0.42, -W / 2 + 3, L * 0.5, W - 6); g.lineWidth = 1.4; g.strokeStyle = INK; g.strokeRect(-L * 0.42, -W / 2 + 3, L * 0.5, W - 6);
  g.beginPath(); g.arc(-L * 0.05, 0, W * 0.28, 0, 6.3); g.fillStyle = '#556655'; g.fill(); g.stroke();
  g.fillStyle = INK; g.fillRect(-L * 0.05, -1.5, L * 0.36, 3);
  glass(g, L * 0.3, -W / 2 + 4, L * 0.08, W - 8, 1.5); lights(g, L, W);
}

function paintVan(g, L, W, color) {
  wheels(g, L, W, 4.4, 0.3); bodyShape(g, L, W, color, 6);
  g.fillStyle = shade(color, 0.2); rr(g, -L / 2 + 2, -W / 2 + 2.5, L * 0.66, W - 5, 3); g.fill(); g.lineWidth = 1.3; g.strokeStyle = INK; g.stroke();     // roof box
  g.strokeStyle = 'rgba(0,0,0,0.2)'; g.lineWidth = 1; for (let x = -L / 2 + 8; x < L * 0.14; x += 7) { g.beginPath(); g.moveTo(x, -W / 2 + 4); g.lineTo(x, W / 2 - 4); g.stroke(); }
  glass(g, L * 0.2, -W / 2 + 3, L * 0.14, W - 6, 3);
  mirrors(g, L, W); lights(g, L, W);
}

function paintMinibus(g, L, W, color) {
  wheels(g, L, W, 4.4, 0.3); bodyShape(g, L, W, color, 6);
  g.fillStyle = '#2f8f5a'; g.fillRect(-L / 2 + 1.2, -W / 2 + 1, L - 2.4, 3.2); g.fillRect(-L / 2 + 1.2, W / 2 - 4.2, L - 2.4, 3.2);                   // HK green belts
  g.fillStyle = '#d63a30'; g.fillRect(-L / 2 + 2, -0.9, L - 4, 1.8);
  rr(g, -L / 2 + 4, -W / 2 + 5, L * 0.58, W - 10, 3); g.fillStyle = '#f2efe4'; g.fill(); g.lineWidth = 1.2; g.strokeStyle = INK; g.stroke();
  glass(g, L * 0.2, -W / 2 + 3.4, L * 0.15, W - 6.8, 3);
  g.fillStyle = '#ffd23a'; g.fillRect(L * 0.38, -5, 3, 10); mirrors(g, L, W); lights(g, L, W);
}

function paintTruck(g, L, W, color) {
  wheels(g, L, W, 5, 0.36);
  const cabL = L * 0.26, cargoL = L - cabL - 2;
  rr(g, -L / 2, -W / 2 + 1, cargoL, W - 2, 3); g.fillStyle = '#d9d4c4'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = INK; g.stroke();
  g.fillStyle = 'rgba(0,0,0,0.14)'; for (let x = -L / 2 + 5; x < -L / 2 + cargoL - 3; x += 6) g.fillRect(x, -W / 2 + 3, 1.5, W - 6);
  g.fillStyle = color; g.fillRect(-L / 2 + 2, -3, cargoL - 4, 6); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(-L / 2 + 2, -3, cargoL - 4, 6);
  g.save(); g.translate(L / 2 - cabL, 0); bodyShape(g, cabL + 2, W - 2, color, 5); g.translate(0, 0); g.restore();
  g.save(); g.translate(L / 2 - cabL / 2 - 1, 0); bodyShape(g, cabL + 2, W - 2, color, 5); glass(g, cabL * 0.05, -W / 2 + 4, cabL * 0.32, W - 8, 2); g.restore();
  lights(g, L, W);
}

function paintBus(g, L, W, color) {
  wheels(g, L, W, 5, 0.34); bodyShape(g, L, W, color, 6);
  g.fillStyle = shade(color, 0.22); rr(g, -L / 2 + 3, -W / 2 + 3, L - 14, W - 6, 3); g.fill(); g.lineWidth = 1.3; g.strokeStyle = INK; g.stroke();
  for (let x = -L / 2 + 10; x < L / 2 - 20; x += 22) { g.fillStyle = '#c9ced4'; g.fillRect(x, -5, 12, 10); g.strokeRect(x, -5, 12, 10); }
  g.fillStyle = '#d63a30'; g.fillRect(-L / 2 + 3, -W / 2 + 3, L - 14, 2.2);
  glass(g, L / 2 - 11, -W / 2 + 3, 8, W - 6, 2); lights(g, L, W);
}

function paintLimo(g, L, W, color) {
  wheels(g, L, W, 4.4, 0.32); bodyShape(g, L, W, color, 8);
  glass(g, L * 0.22, -W / 2 + 3.4, L * 0.1, W - 6.8, 3); glass(g, -L * 0.34, -W / 2 + 3.6, L * 0.5, W - 7.2, 4);
  g.fillStyle = shade(color, 0.22); g.fillRect(-L * 0.05, -W / 2 + 4, 3, W - 8);
  g.strokeStyle = '#d9a441'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-L / 2 + 4, -W / 2 + 1.4); g.lineTo(L / 2 - 4, -W / 2 + 1.4); g.moveTo(-L / 2 + 4, W / 2 - 1.4); g.lineTo(L / 2 - 4, W / 2 - 1.4); g.stroke();
  mirrors(g, L, W); lights(g, L, W);
}

function paintBike(g, L, W, color, def) {
  const scooter = def.kind === 'scooter';
  g.fillStyle = '#17141a'; g.beginPath(); g.roundRect(L * 0.3 - 6, -2, 12, 4, 2); g.fill(); g.beginPath(); g.roundRect(-L * 0.4 - 6, -2, 12, 4, 2); g.fill();
  rr(g, -L / 2 + 3, -W / 2 + 3, L - 8, W - 6, 4); g.fillStyle = color; g.fill(); g.lineWidth = 1.7; g.strokeStyle = INK; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(-L / 2 + 5, -W / 2 + 3.6, L - 14, 1.4);
  g.fillStyle = '#d9d9de'; g.fillRect(L * 0.22, -W / 2 - 2, 2.4, W + 4); g.lineWidth = 1; g.strokeRect(L * 0.22, -W / 2 - 2, 2.4, W + 4);          // handlebars
  // rider silhouette
  g.beginPath(); g.ellipse(-L * 0.06, 0, 4.6, 7.4, 0, 0, 6.3); g.fillStyle = '#25252d'; g.fill(); g.lineWidth = 1.5; g.stroke();
  g.beginPath(); g.arc(-L * 0.02, 0, 4.6, 0, 6.3); g.fillStyle = scooter ? '#e8e4d8' : '#e23b2e'; g.fill(); g.stroke();
  g.fillStyle = '#fff2b0'; g.fillRect(L / 2 - 4, -1.5, 2.4, 3);
  g.fillStyle = '#e22'; g.fillRect(-L / 2 + 1.4, -1.5, 2, 3);
}


function paintTank(g, L, W, color) {
  // hull between the treads (treads are drawn live so they can scroll)
  rr(g, -L / 2 + 2, -W / 2 + 6, L - 4, W - 12, 4); const gr = g.createLinearGradient(0, -W / 2, 0, W / 2); gr.addColorStop(0, shade(color, 0.3)); gr.addColorStop(1, shade(color, -0.3)); g.fillStyle = gr; g.fill(); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke();
  g.fillStyle = shade(color, -0.12); g.fillRect(L / 2 - 14, -W / 2 + 8, 10, W - 16); g.lineWidth = 1; g.strokeRect(L / 2 - 14, -W / 2 + 8, 10, W - 16);   // glacis
  g.fillStyle = '#2a2c24'; for (let i = 0; i < 3; i++) g.fillRect(-L / 2 + 6 + i * 6, -W / 2 + 9, 3, W - 18);                                 // engine grille
  g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(-L / 2 + 4, -W / 2 + 7, L - 8, 2);
  g.fillStyle = '#8a6a3f'; g.fillRect(-L / 2 + 2, W / 2 - 13, 10, 5); g.fillRect(-L / 2 + 2, -W / 2 + 8, 10, 5); g.lineWidth = 0.9; g.strokeRect(-L / 2 + 2, W / 2 - 13, 10, 5); g.strokeRect(-L / 2 + 2, -W / 2 + 8, 10, 5);   // jerry cans
}

function paintHeli(g, L, W, color) {
  // tail boom + tail rotor + skids, then the cabin pod
  g.fillStyle = '#20252f'; g.fillRect(-L / 2, -2.5, L * 0.55, 5); g.lineWidth = 1.3; g.strokeStyle = INK; g.strokeRect(-L / 2, -2.5, L * 0.55, 5);
  g.fillStyle = color; g.fillRect(-L / 2 - 1, -8, 5, 16); g.strokeRect(-L / 2 - 1, -8, 5, 16);
  g.strokeStyle = '#2a2c34'; g.lineWidth = 2; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(-L * 0.12, s * 12); g.lineTo(L * 0.34, s * 12); g.stroke(); }
  g.beginPath(); g.ellipse(L * 0.12, 0, L * 0.3, 11.5, 0, 0, 6.3); const gr = g.createLinearGradient(0, -12, 0, 12); gr.addColorStop(0, shade(color, 0.32)); gr.addColorStop(1, shade(color, -0.3)); g.fillStyle = gr; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
  g.fillStyle = '#f1c64a'; g.fillRect(-L * 0.12, -1.2, L * 0.36, 2.4);                                                    // gold stripe
  g.beginPath(); g.ellipse(L * 0.3, 0, 8.5, 8, 0, 0, 6.3); g.fillStyle = '#1c2a36'; g.fill(); g.lineWidth = 1.4; g.stroke(); // tinted canopy
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(L * 0.32, -3, 4, 2, -0.3, 0, 6.3); g.fill();
}

function paintPlane(g, L, W, color) {
  const span = W, accent = color === '#c8202a' ? '#efe6cf' : '#c8202a';
  // tailplane, wings, fuselage, cowling
  rr(g, -L / 2, -span * 0.2, 10, span * 0.4, 3); g.fillStyle = color; g.fill(); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke();
  rr(g, -4, -span / 2, 20, span, 5); const gw = g.createLinearGradient(-4, 0, 16, 0); gw.addColorStop(0, shade(color, -0.2)); gw.addColorStop(1, shade(color, 0.2)); g.fillStyle = gw; g.fill(); g.lineWidth = 2; g.stroke();
  g.fillStyle = accent; g.fillRect(-4, -span / 2 + 2, 20, 4); g.fillRect(-4, span / 2 - 6, 20, 4);
  for (const s of [-1, 1]) { g.beginPath(); g.arc(6, s * span * 0.32, 4.5, 0, 6.3); g.fillStyle = '#c8202a'; g.fill(); g.lineWidth = 1; g.stroke(); g.beginPath(); g.arc(6, s * span * 0.32, 2, 0, 6.3); g.fillStyle = '#f1c64a'; g.fill(); }
  rr(g, -L / 2 + 2, -5.5, L - 4, 11, 5.5); const gf = g.createLinearGradient(0, -6, 0, 6); gf.addColorStop(0, shade(color, 0.3)); gf.addColorStop(1, shade(color, -0.25)); g.fillStyle = gf; g.fill(); g.lineWidth = 1.8; g.stroke();
  g.fillStyle = accent; g.fillRect(-L / 2 + 6, -1, L - 18, 2);
  rr(g, L / 2 - 9, -5, 8, 10, 3); g.fillStyle = '#2a2c34'; g.fill(); g.stroke();
  g.beginPath(); g.ellipse(4, 0, 6, 3.6, 0, 0, 6.3); g.fillStyle = '#2a4a6a'; g.fill(); g.lineWidth = 1.1; g.stroke();
}

function paintBoat(g, L, W, color, def) {
  const junk = def.kind === 'junk';
  g.beginPath(); g.moveTo(L / 2, 0); g.quadraticCurveTo(L * 0.2, -W / 2 - 1, -L / 2, -W / 2 + 2); g.lineTo(-L / 2, W / 2 - 2); g.quadraticCurveTo(L * 0.2, W / 2 + 1, L / 2, 0); g.closePath();
  const gr = g.createLinearGradient(0, -W / 2, 0, W / 2); gr.addColorStop(0, shade(color, 0.25)); gr.addColorStop(1, shade(color, -0.3)); g.fillStyle = gr; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke();
  if (junk) {
    g.fillStyle = '#6a4a2e'; g.fillRect(-L / 2 + 4, -W / 2 + 5, L * 0.7, W - 10);
    for (const [x, w] of [[-L * 0.28, 14], [L * 0.05, 18]]) { g.save(); g.translate(x, 0); g.fillStyle = '#d9b56a'; g.beginPath(); g.moveTo(-w / 2, -W * 0.62); g.lineTo(w / 2, -W * 0.5); g.lineTo(w / 2, W * 0.5); g.lineTo(-w / 2, W * 0.62); g.closePath(); g.fill(); g.lineWidth = 1.5; g.strokeStyle = INK; g.stroke(); g.strokeStyle = 'rgba(90,60,30,0.6)'; g.lineWidth = 1; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(-w / 2, k * W * 0.3); g.lineTo(w / 2, k * W * 0.26); g.stroke(); } g.restore(); }
  } else {
    rr(g, -L * 0.3, -W / 2 + 5, L * 0.38, W - 10, 4); g.fillStyle = '#e8e4d8'; g.fill(); g.lineWidth = 1.3; g.strokeStyle = INK; g.stroke();
    glass(g, L * 0.04, -W / 2 + 5, 6, W - 10, 2);
    g.fillStyle = color === '#f4f4f4' ? '#1f6f8b' : '#f4f4f4'; g.fillRect(-L / 2 + 3, -W / 2 + 2.5, L * 0.72, 2); g.fillRect(-L / 2 + 3, W / 2 - 4.5, L * 0.72, 2);
    g.fillStyle = '#2a2c34'; g.fillRect(-L / 2 - 3, -4, 5, 8); g.lineWidth = 1; g.strokeRect(-L / 2 - 3, -4, 5, 8);   // outboard
  }
}

const PAINT = { sedan: paintCar, taxi: paintTaxi, sports: paintSports, police: paintPolice, swat: paintSwat, armored: paintArmored, van: paintVan, minibus: paintMinibus, truck: paintTruck, bus: paintBus, limo: paintLimo, scooter: paintBike, bike: paintBike, tank: paintTank, heli: paintHeli, plane: paintPlane, speedboat: paintBoat, junk: paintBoat };
