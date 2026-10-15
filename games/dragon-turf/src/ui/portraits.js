import { INK } from '../render/style.js';
import { shade } from '../core/color.js';

// Hand-built comic portraits (vector, drawn on demand into a canvas).
export const CAST = {
  kai:    { name: 'Kai Lin',       color: '#ff5a4a', skin: '#f1c9a5', hair: '#15121a', hairStyle: 'spiky', cloth: '#1c1c24', collar: '#e23b2e', scarf: '#e23b2e', brow: 0 },
  wei:    { name: 'Uncle Wei',     color: '#2fd07a', skin: '#e3b88c', hair: '#d8d8de', hairStyle: 'bald', cloth: '#2a6a4a', collar: '#f1c64a', beard: '#d8d8de', glasses: true, brow: 1 },
  lin:    { name: 'Madam Lin',     color: '#ff3d6e', skin: '#f3d2b4', hair: '#15121a', hairStyle: 'updo', cloth: '#8a1d3a', collar: '#f1c64a', lips: '#c01844', brow: -1, earrings: true },
  hu:     { name: 'Brother Hu',    color: '#ff4a3a', skin: '#d9a47c', hair: '#15121a', hairStyle: 'slick', cloth: '#7a1414', collar: '#15121a', scar: true, shades: true, brow: 2 },
  orchid: { name: 'Madam Orchid',  color: '#b06cff', skin: '#f3d2b4', hair: '#2a1a3a', hairStyle: 'long', cloth: '#3a2a52', collar: '#b06cff', lips: '#7a2aa8', brow: 0 },
  mo:     { name: 'Big Tiger Mo',  color: '#ffa93a', skin: '#c48a5e', hair: '#15121a', hairStyle: 'buzz', cloth: '#7a4a1a', collar: '#ffa93a', beard: '#15121a', brow: 2, bulk: 1 },
  cop:    { name: 'Officer',       color: '#4a7cff', skin: '#e8b88a', hair: '#2a2a30', hairStyle: 'cap', cloth: '#2a4f9a', collar: '#f1c64a', brow: 1 },
  radio:  { name: 'Radio',         color: '#37e6ff', skin: '#37e6ff', hair: '#37e6ff', hairStyle: 'none', cloth: '#14202a', collar: '#37e6ff', brow: 0, signal: true },
  stranger: { name: '???',         color: '#9a9aa8', skin: '#6a6a78', hair: '#2a2a30', hairStyle: 'none', cloth: '#22222a', collar: '#6a6a78', brow: 0, shades: true },
};

export function drawPortrait(canvas, who, mood = 'neutral', t = 0) {
  const c = CAST[who] || CAST.stranger, W = canvas.width, H = canvas.height, g = canvas.getContext('2d');
  g.clearRect(0, 0, W, H); g.save(); g.translate(W / 2, H * 0.6); const s = W / 300; g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
  const ink = (w = 5) => { g.lineWidth = w; g.strokeStyle = INK; g.stroke(); };
  const bob = Math.sin(t * 2.2) * 2;
  if (c.signal) { drawRadio(g, c, t); g.restore(); return; }
  // shoulders / clothes
  const bulk = c.bulk ? 1.18 : 1;
  g.beginPath(); g.moveTo(-150 * bulk, 230); g.quadraticCurveTo(-150 * bulk, 80, -70, 74 + bob); g.lineTo(70, 74 + bob); g.quadraticCurveTo(150 * bulk, 80, 150 * bulk, 230); g.closePath();
  const gr = g.createLinearGradient(0, 70, 0, 230); gr.addColorStop(0, shade(c.cloth, 0.12)); gr.addColorStop(1, shade(c.cloth, -0.3)); g.fillStyle = gr; g.fill(); ink(6);
  // collar / scarf
  g.beginPath(); g.moveTo(-58, 74 + bob); g.lineTo(0, 140); g.lineTo(58, 74 + bob); g.lineTo(34, 72 + bob); g.lineTo(0, 100); g.lineTo(-34, 72 + bob); g.closePath(); g.fillStyle = c.collar; g.fill(); ink(5);
  if (c.scarf) { g.beginPath(); g.moveTo(-60, 78 + bob); g.quadraticCurveTo(0, 120, 60, 78 + bob); g.lineTo(54, 100); g.quadraticCurveTo(0, 150, -54, 100); g.closePath(); g.fillStyle = c.scarf; g.fill(); ink(5); }
  // neck
  g.beginPath(); g.rect(-30, 28 + bob, 60, 56); g.fillStyle = shade(c.skin, -0.14); g.fill(); ink(4);
  // head
  g.save(); g.translate(0, bob);
  g.beginPath(); g.ellipse(0, -28, 74, 88, 0, 0, 6.3); g.fillStyle = c.skin; g.fill(); ink(6);
  g.beginPath(); g.ellipse(-76, -18, 11, 18, 0, 0, 6.3); g.ellipse(76, -18, 11, 18, 0, 0, 6.3); g.fillStyle = shade(c.skin, -0.06); g.fill(); ink(4);
  if (c.earrings) { g.fillStyle = '#f1c64a'; g.beginPath(); g.arc(-77, 2, 5, 0, 6.3); g.arc(77, 2, 5, 0, 6.3); g.fill(); }
  // hair (back layer)
  hair(g, c, false);
  // eyes
  const eyeY = -34, blink = (t % 4.2) > 4.05 ? 0.15 : 1;
  for (const sx of [-1, 1]) {
    g.save(); g.translate(sx * 30, eyeY);
    if (c.shades) { g.beginPath(); g.roundRect(-24, -12, 48, 24, 8); g.fillStyle = '#0c0a10'; g.fill(); ink(4); g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(-18, -8, 14, 4); }
    else { g.beginPath(); g.ellipse(0, 0, 17, 11 * blink, 0, 0, 6.3); g.fillStyle = '#fff'; g.fill(); ink(4); g.beginPath(); g.arc(sx * -1 + (mood === 'angry' ? 0 : sx * 1), 0, 7 * blink, 0, 6.3); g.fillStyle = '#1a1018'; g.fill(); g.fillStyle = '#fff'; g.fillRect(-2, -4, 3, 3); }
    if (c.glasses) { g.beginPath(); g.roundRect(-22, -15, 44, 30, 9); g.strokeStyle = INK; g.lineWidth = 3.5; g.stroke(); g.fillStyle = 'rgba(180,230,255,0.15)'; g.fill(); }
    g.restore();
  }
  if (c.glasses) { g.beginPath(); g.moveTo(-8, eyeY); g.lineTo(8, eyeY); g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke(); }
  // brows
  const bw = mood === 'angry' ? 1 : mood === 'sad' ? -1 : c.brow > 1 ? 1 : c.brow;
  for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 12, eyeY - 24 - bw * -2); g.lineTo(sx * 50, eyeY - 26 - bw * 7 + (bw > 0 ? 0 : 0)); g.lineWidth = c.brow > 1 ? 11 : 7; g.strokeStyle = c.hair === '#d8d8de' ? '#aaa' : INK; g.stroke(); }
  // nose
  g.beginPath(); g.moveTo(0, -22); g.quadraticCurveTo(-9, 6, 4, 10); g.lineWidth = 4; g.strokeStyle = shade(c.skin, -0.35); g.stroke();
  // mouth
  const talk = mood === 'talk' ? Math.abs(Math.sin(t * 14)) : 0;
  g.beginPath();
  if (mood === 'angry') { g.moveTo(-22, 42); g.quadraticCurveTo(0, 30 + talk * 10, 22, 42); } else if (mood === 'smile') { g.moveTo(-24, 34); g.quadraticCurveTo(0, 56, 24, 34); } else { g.moveTo(-20, 40); g.quadraticCurveTo(0, 40 + talk * 14 + (mood === 'sad' ? -6 : 4), 20, 40); }
  g.lineWidth = 5; g.strokeStyle = c.lips || '#5a2a2a'; g.stroke(); if (c.lips) { g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); }
  if (c.beard) { g.beginPath(); g.moveTo(-50, 24); g.quadraticCurveTo(-30, 58, 0, 60); g.quadraticCurveTo(30, 58, 50, 24); g.quadraticCurveTo(26, 78, 0, 100); g.quadraticCurveTo(-26, 78, -50, 24); g.fillStyle = c.beard; g.fill(); ink(5); g.beginPath(); g.moveTo(-24, 30); g.quadraticCurveTo(0, 18, 24, 30); g.lineWidth = 9; g.strokeStyle = c.beard; g.stroke(); }
  if (c.scar) { g.beginPath(); g.moveTo(40, -70); g.lineTo(26, 20); g.lineWidth = 5; g.strokeStyle = '#b3453a'; g.stroke(); for (const y of [-50, -28, -6]) { g.beginPath(); g.moveTo(32, y); g.lineTo(46, y + 4); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); } }
  hair(g, c, true);
  g.restore(); g.restore();
}

function hair(g, c, front) {
  const col = c.hair, dk = shade(col, -0.35), ink = (w = 5) => { g.lineWidth = w; g.strokeStyle = INK; g.stroke(); };
  g.fillStyle = col;
  switch (c.hairStyle) {
    case 'spiky':
      if (!front) { g.beginPath(); g.moveTo(-78, -40); for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI, r = i % 2 ? 128 : 100; g.lineTo(Math.cos(a) * r, -50 + Math.sin(a) * (r + 6)); } g.lineTo(78, -40); g.closePath(); g.fill(); ink(6); }
      else { g.beginPath(); g.moveTo(-70, -66); g.quadraticCurveTo(-20, -84, 6, -62); g.quadraticCurveTo(30, -90, 72, -64); g.lineTo(72, -78); g.quadraticCurveTo(0, -112, -72, -78); g.closePath(); g.fill(); ink(5); }
      break;
    case 'slick': if (!front) { g.beginPath(); g.ellipse(0, -52, 82, 70, 0, Math.PI, 0); g.fill(); ink(6); g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 3; g.beginPath(); g.arc(-10, -52, 56, 3.7, 5.2); g.stroke(); } break;
    case 'long': if (!front) { g.beginPath(); g.moveTo(-86, -30); g.quadraticCurveTo(-100, 120, -60, 180); g.lineTo(60, 180); g.quadraticCurveTo(100, 120, 86, -30); g.quadraticCurveTo(0, -150, -86, -30); g.fill(); ink(6); } else { g.beginPath(); g.moveTo(-76, -50); g.quadraticCurveTo(0, -120, 76, -50); g.quadraticCurveTo(30, -82, 0, -50); g.quadraticCurveTo(-30, -82, -76, -50); g.fill(); ink(5); } break;
    case 'updo': if (!front) { g.beginPath(); g.arc(0, -138, 38, 0, 6.3); g.fill(); ink(6); g.beginPath(); g.ellipse(0, -52, 80, 66, 0, Math.PI, 0); g.fill(); ink(6); g.fillStyle = '#f1c64a'; g.fillRect(-4, -170, 8, 60); } break;
    case 'buzz': if (!front) { g.beginPath(); g.ellipse(0, -48, 76, 62, 0, Math.PI, 0); g.fillStyle = dk; g.fill(); ink(5); } break;
    case 'cap': if (front) { g.beginPath(); g.ellipse(0, -62, 84, 30, 0, Math.PI, 0); g.fillStyle = '#1c2a5a'; g.fill(); ink(6); g.fillStyle = '#1c2a5a'; g.fillRect(-84, -66, 168, 16); ink(5); g.fillStyle = '#f1c64a'; g.beginPath(); g.arc(0, -78, 9, 0, 6.3); g.fill(); ink(3); } break;
    case 'bald': if (!front) { g.beginPath(); g.ellipse(-72, -26, 14, 40, 0, 0, 6.3); g.ellipse(72, -26, 14, 40, 0, 0, 6.3); g.fill(); ink(4); } break;
    default: break;
  }
}

function drawRadio(g, c, t) {
  g.fillStyle = '#10161e'; g.beginPath(); g.roundRect(-90, -100, 180, 200, 20); g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  g.strokeStyle = c.color; g.lineWidth = 5; for (let i = 0; i < 5; i++) { const h = 20 + Math.abs(Math.sin(t * 5 + i)) * 50; g.beginPath(); g.moveTo(-60 + i * 30, h); g.lineTo(-60 + i * 30, -h); g.stroke(); }
}
