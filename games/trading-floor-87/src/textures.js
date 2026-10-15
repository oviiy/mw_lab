// Canvas-generated textures. No image files anywhere.
import * as THREE from 'three';
import { mulberry32 } from './util.js';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, repeat = 1, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Exchange-floor vinyl tiles: institutional grey-beige, grimy grout, heel marks, chewing-gum
// spots and a traffic-worn sheen. Cooler than a hotel lobby; this floor gets stomped all day.
export function floorTexture() {
  const [c, g] = canvas(1024, 1024);
  const r = mulberry32(7);
  const T = 128;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const v = 128 + r() * 18, alt = (x + y) % 2 ? 6 : -4;
    g.fillStyle = `rgb(${v + alt + 4},${v + alt + 4},${v + alt - 2})`;
    g.fillRect(x * T, y * T, T, T);
    for (let i = 0; i < 300; i++) {
      const k = r();
      g.fillStyle = k < 0.55 ? `rgba(50,50,46,${0.12 + r() * 0.2})` : k < 0.85 ? `rgba(225,225,215,${0.12 + r() * 0.16})` : `rgba(110,98,84,${0.2 + r() * 0.2})`;
      const sz = 1 + r() * 3;
      g.fillRect(x * T + r() * T, y * T + r() * T, sz, sz * (0.6 + r()));
    }
    g.strokeStyle = 'rgba(28,26,22,0.6)'; g.lineWidth = 2.5;
    g.strokeRect(x * T + 1, y * T + 1, T - 2, T - 2);
  }
  // Heel scuffs, black rubber marks and grime.
  for (let i = 0; i < 1600; i++) {
    g.strokeStyle = `rgba(12,12,12,${r() * 0.16})`; g.lineWidth = 1 + r() * 2.5;
    const x = r() * 1024, y = r() * 1024, a = r() * 6.28, l = 6 + r() * 34;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.6, y + Math.sin(a + 0.6) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(30,30,28,${0.25 + r() * 0.3})`; g.beginPath(); g.arc(r() * 1024, r() * 1024, 1.5 + r() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 40; i++) {
    const gr = g.createRadialGradient(r() * 1024, r() * 1024, 0, r() * 1024, r() * 1024, 60 + r() * 180);
    gr.addColorStop(0, `rgba(25,24,20,${0.1 + r() * 0.1})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  }
  return tex(c, 10);
}

// Pit steps: hardwood treads gone grey-brown under ten years of shoe leather. Boards run along
// the step; the middle of each board is worn pale, edges and joints are black with grime.
// UVs are world metres; one tile covers 2 m.
export function stepTexture() {
  const [c, g] = canvas(512, 512);
  const r = mulberry32(3);
  const B = 64; // 8 boards across the tile, ~25 cm each
  for (let b = 0; b < 8; b++) {
    const v = 92 + r() * 26;
    g.fillStyle = `rgb(${v + 10},${v + 4},${v - 6})`;
    g.fillRect(0, b * B, 512, B);
    // Grain streaks along the board.
    for (let i = 0; i < 60; i++) {
      g.strokeStyle = `rgba(${r() < 0.5 ? '40,34,28' : '170,160,145'},${0.05 + r() * 0.08})`; g.lineWidth = 0.6 + r() * 1.6;
      const y = b * B + r() * B;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 1.5);
      g.stroke();
    }
    // Butt joints.
    let x = r() * 200;
    while (x < 512) { g.fillStyle = 'rgba(20,16,12,0.7)'; g.fillRect(x, b * B, 2, B); x += 140 + r() * 260; }
    g.fillStyle = 'rgba(14,12,10,0.75)'; g.fillRect(0, b * B, 512, 2);
  }
  // Foot-worn pale patches, dark heel crescents and grime.
  for (let i = 0; i < 70; i++) {
    const gr = g.createRadialGradient(r() * 512, r() * 512, 0, r() * 512, r() * 512, 20 + r() * 60);
    gr.addColorStop(0, `rgba(190,180,160,${0.06 + r() * 0.08})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  }
  for (let i = 0; i < 900; i++) {
    g.strokeStyle = `rgba(10,9,8,${r() * 0.22})`; g.lineWidth = 1 + r() * 2;
    const x = r() * 512, y = r() * 512, a = r() * 6.28, l = 4 + r() * 16;
    g.beginPath(); g.arc(x, y, l, a, a + 1 + r()); g.stroke();
  }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '210,200,180'},${r() * 0.08})`; g.fillRect(r() * 512, r() * 512, 1.5, 1.5); }
  return tex(c, 1);
}

// Riser kick plates: black-painted plywood, scuffed grey by a million toe-kicks.
export function riserTexture() {
  const [c, g] = canvas(512, 128);
  const r = mulberry32(13);
  g.fillStyle = '#26241f'; g.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 700; i++) {
    g.strokeStyle = `rgba(150,145,135,${r() * 0.16})`; g.lineWidth = 1 + r() * 3;
    const x = r() * 512, y = 20 + r() * 108;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 30, y + (r() - 0.5) * 8); g.stroke();
  }
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.2})`; g.fillRect(r() * 512, r() * 128, 2, 2); }
  return tex(c, 1);
}

// Upper walls: cool grey-green painted acoustic panels.
export function wallTexture() {
  const [c, g] = canvas(512, 512);
  const r = mulberry32(11);
  g.fillStyle = '#6e7068'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 20000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '240,245,235'},${r() * 0.06})`; g.fillRect(r() * 512, r() * 512, 2, 1); }
  for (let x = 0; x < 512; x += 128) {
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x, 0, 3, 512);
    g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x + 3, 0, 2, 512);
  }
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 254, 512, 3);
  return tex(c, 4);
}

// Floor litter: an atlas of 4 cells — trading card, pink order ticket, torn scrap, crumpled ball.
export function litterTexture() {
  const [c, g] = canvas(512, 128);
  const r = mulberry32(41);
  const cell = (i, bg, lines) => {
    const x = i * 128;
    g.fillStyle = bg; g.fillRect(x + 6, 14, 116, 100);
    if (lines) {
      g.fillStyle = 'rgba(40,80,160,0.35)';
      for (let y = 28; y < 110; y += 14) g.fillRect(x + 10, y, 108, 1.5);
      g.strokeStyle = 'rgba(30,30,40,0.8)'; g.lineWidth = 2;
      for (let row = 0; row < 3; row++) {
        g.beginPath(); let px = x + 14; const py = 40 + row * 22; g.moveTo(px, py);
        while (px < x + 110) { px += 3 + r() * 6; g.lineTo(px, py - r() * 8); }
        g.stroke();
      }
    }
  };
  g.clearRect(0, 0, 512, 128);
  cell(0, '#f4f0e2', true);
  cell(1, '#f6c8c0', true);
  // torn scrap
  g.fillStyle = '#efeadb'; g.beginPath(); g.moveTo(266, 30); for (let k = 0; k < 9; k++) g.lineTo(266 + k * 12, 24 + r() * 14); g.lineTo(366, 100); for (let k = 9; k > 0; k--) g.lineTo(266 + k * 11, 96 + r() * 14); g.closePath(); g.fill();
  // crumpled ball
  const gr = g.createRadialGradient(448, 64, 4, 448, 64, 44); gr.addColorStop(0, '#fbf8ee'); gr.addColorStop(0.7, '#cfc8b8'); gr.addColorStop(1, 'rgba(120,115,105,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(448, 64, 44, 0, 6.3); g.fill();
  g.strokeStyle = 'rgba(90,85,75,0.5)'; for (let k = 0; k < 12; k++) { g.beginPath(); g.moveTo(448 + (r() - 0.5) * 60, 64 + (r() - 0.5) * 60); g.lineTo(448 + (r() - 0.5) * 60, 64 + (r() - 0.5) * 60); g.stroke(); }
  return tex(c, 1);
}

// Walnut-stained wood with vertical grain, for wainscot, risers and booths.
export function woodTexture() {
  const [c, g] = canvas(256, 512);
  const r = mulberry32(17);
  g.fillStyle = '#5e3c22'; g.fillRect(0, 0, 256, 512);
  for (let x = 0; x < 256; x++) {
    const v = Math.sin(x * 0.21 + Math.sin(x * 0.05) * 3) * 0.5 + 0.5;
    g.fillStyle = `rgba(${v > 0.5 ? '30,16,8' : '150,100,60'},${0.05 + r() * 0.08})`;
    g.fillRect(x, 0, 1, 512);
  }
  for (let i = 0; i < 60; i++) {
    g.strokeStyle = `rgba(25,12,6,${0.08 + r() * 0.12})`; g.lineWidth = 0.5 + r() * 1.5;
    const x = r() * 256;
    g.beginPath(); g.moveTo(x, 0);
    for (let y = 0; y <= 512; y += 32) g.lineTo(x + Math.sin(y * 0.02 + i) * 4, y);
    g.stroke();
  }
  // Panel joints
  g.fillStyle = 'rgba(15,8,4,0.6)'; g.fillRect(0, 0, 256, 3); g.fillRect(126, 0, 3, 512);
  return tex(c, 1);
}

// Generic lit/painted sign. lines: [{ text, size, color, y }]
export function signTexture(w, h, bg, lines, border) {
  const [c, g] = canvas(w, h);
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (border) { g.strokeStyle = border; g.lineWidth = Math.max(2, h * 0.04); g.strokeRect(g.lineWidth, g.lineWidth, w - g.lineWidth * 2, h - g.lineWidth * 2); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const l of lines) {
    // Shrink the type until the line fits inside the sign with a margin.
    let size = l.size;
    const setFont = () => { g.font = `${l.weight || 'bold'} ${size}px ${l.font || 'Georgia, "Times New Roman", serif'}`; };
    const lineWidth = () => [...l.text].reduce((a, ch) => a + g.measureText(ch).width + (l.spacing || 0), 0);
    setFont();
    while (size > 8 && lineWidth() > w * 0.92) { size -= 2; setFont(); }
    g.fillStyle = l.color;
    if (l.spacing) {
      // Letter-spaced caps.
      const chars = [...l.text], widths = chars.map((ch) => g.measureText(ch).width + l.spacing);
      let x = w / 2 - widths.reduce((a, b) => a + b, 0) / 2;
      g.textAlign = 'left';
      chars.forEach((ch, i) => { g.fillText(ch, x, l.y); x += widths[i]; });
      g.textAlign = 'center';
    } else g.fillText(l.text, w / 2, l.y);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Green-phosphor quote screen for the booth CRTs (one atlas, 4 variants side by side).
export function crtTexture() {
  const [c, g] = canvas(512, 128);
  const r = mulberry32(5);
  g.fillStyle = '#02100a'; g.fillRect(0, 0, 512, 128);
  g.font = 'bold 11px "Courier New", monospace';
  for (let k = 0; k < 4; k++) {
    for (let row = 0; row < 9; row++) {
      g.fillStyle = r() < 0.15 ? '#ffb030' : '#46ff8a';
      const sym = ['SPZ7', 'SPH8', 'IBM', 'GM', 'XON', 'TBZ7', 'GCZ7', 'DMZ7', 'YEN'][(row + k * 3) % 9];
      g.fillText(`${sym.padEnd(5)} ${(200 + r() * 120).toFixed(2)} ${r() < 0.7 ? '-' : '+'}${(r() * 30).toFixed(2)}`, k * 128 + 6, 14 + row * 12.5);
    }
  }
  for (let y = 0; y < 128; y += 2) { g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, y, 512, 1); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Small LED month boards hung over the pit.
export function ledStripTexture(rows) {
  const [c, g] = canvas(512, 64 * rows.length);
  g.fillStyle = '#060403'; g.fillRect(0, 0, c.width, c.height);
  g.font = 'bold 40px "Courier New", monospace'; g.textBaseline = 'middle';
  rows.forEach((t, i) => {
    g.fillStyle = i % 3 === 0 ? '#ffb52e' : i % 3 === 1 ? '#ff4030' : '#3dff6e';
    g.fillText(t, 16, i * 64 + 34);
  });
  for (let y = 0; y < c.height; y += 4) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, y, c.width, 1); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Trading card: ruled lines, a scribbled price and quantity in pencil.
export function cardTexture() {
  const [c, g] = canvas(128, 84);
  const r = mulberry32(31);
  g.fillStyle = '#f6f2e4'; g.fillRect(0, 0, 128, 84);
  g.fillStyle = 'rgba(40,80,160,0.35)';
  for (let y = 14; y < 84; y += 12) g.fillRect(4, y, 120, 1);
  g.fillStyle = 'rgba(200,40,40,0.4)'; g.fillRect(40, 0, 1, 84); g.fillRect(84, 0, 1, 84);
  g.strokeStyle = 'rgba(40,40,50,0.75)'; g.lineWidth = 1.6;
  for (let row = 0; row < 4; row++) {
    g.beginPath();
    let x = 8 + r() * 6;
    const y = 22 + row * 12;
    g.moveTo(x, y);
    while (x < 118) { x += 2 + r() * 5; g.lineTo(x, y - r() * 6); }
    g.stroke();
  }
  return tex(c, 1);
}

// Twill weave for clothes. White-ish so vertex colours carry the hue; a matching normal map
// gives the cloth a visible weave up close. UVs on the people are in metres × 25.
export function fabricTexture() {
  const [c, g] = canvas(128, 128);
  const r = mulberry32(21);
  g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    const tw = ((x + y) % 4 < 2 ? 0.045 : 0) + r() * 0.025;
    g.fillStyle = `rgba(0,0,0,${tw.toFixed(3)})`;
    g.fillRect(x, y, 1, 1);
  }
  return tex(c, 1);
}

export function fabricNormal() {
  const N = 128;
  const [c, g] = canvas(N, N);
  const h = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const d = ((x + y) % 8) / 8; // diagonal twill ridges
    h[y * N + x] = Math.sin(d * Math.PI * 2) * 0.6 + Math.sin((x / N) * Math.PI * 64) * 0.25 + Math.sin((y / N) * Math.PI * 48) * 0.15;
  }
  const img = g.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = h[y * N + ((x + 1) % N)] - h[y * N + ((x + N - 1) % N)];
    const dy = h[((y + 1) % N) * N + x] - h[((y + N - 1) % N) * N + x];
    const nx = -dx * 0.5, ny = -dy * 0.5, nz = 1, l = Math.hypot(nx, ny, nz);
    const i = (y * N + x) * 4;
    img.data[i] = (nx / l * 0.5 + 0.5) * 255; img.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; img.data[i + 2] = (nz / l * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return tex(c, 1, false);
}

// One atlas for every badge: 8×8 cells of 128×64.
export function badgeAtlas(list) {
  const [c, g] = canvas(1024, 512);
  list.forEach((b, i) => {
    const x = (i % 8) * 128, y = Math.floor(i / 8) * 64;
    g.fillStyle = b.bg; g.fillRect(x + 2, y + 2, 124, 60);
    g.fillStyle = '#111'; g.fillRect(x + 2, y + 2, 124, 14);
    g.fillStyle = '#eee'; g.font = 'bold 10px Arial'; g.textAlign = 'center';
    g.fillText(b.firm, x + 64, y + 13);
    g.fillStyle = b.fg; g.font = 'bold 40px "Arial Black", Arial'; g.fillText(b.badge, x + 64, y + 56);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
export function badgeUV(i) { return { u: (i % 8) / 8, v: 1 - (Math.floor(i / 8) + 1) / 8, w: 1 / 8, h: 1 / 8 }; }

// Afternoon sky for the tall windows; repainted as the day goes on.
export class WindowSky {
  constructor() {
    [this.c, this.g] = canvas(64, 256);
    this.texture = new THREE.CanvasTexture(this.c);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.paint(0);
  }
  paint(t01) {
    const g = this.g;
    const top = mix([120, 160, 210], [70, 90, 140], t01);
    const bot = mix([220, 225, 230], [235, 170, 110], t01);
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, rgb(top)); grad.addColorStop(1, rgb(bot));
    g.fillStyle = grad; g.fillRect(0, 0, 64, 256);
    // Mullions
    g.fillStyle = '#2b2925';
    g.fillRect(0, 0, 64, 3); g.fillRect(0, 253, 64, 3); g.fillRect(30, 0, 4, 256);
    for (let y = 0; y < 256; y += 64) g.fillRect(0, y, 64, 3);
    this.texture.needsUpdate = true;
  }
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = (a) => `rgb(${a[0]},${a[1]},${a[2]})`;
