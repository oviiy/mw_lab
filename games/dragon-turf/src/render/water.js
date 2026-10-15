import { Rng } from '../core/rng.js';
import { makeCanvas } from './style.js';

// Two scrolling tileable layers form the harbour: deep colour + animated glints.
export class Water {
  constructor() {
    const rng = new Rng(77), S = 256;
    this.base = makeCanvas(S, S); this.waves = makeCanvas(S, S); this.glint = makeCanvas(S, S);
    let g = this.base.getContext('2d');
    const gr = g.createLinearGradient(0, 0, S, S); gr.addColorStop(0, '#0f3b5c'); gr.addColorStop(1, '#155073');
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${rng.int(10, 40)},${rng.int(70, 120)},${rng.int(110, 160)},0.12)`; g.beginPath(); g.ellipse(rng.range(0, S), rng.range(0, S), rng.range(10, 40), rng.range(4, 12), 0, 0, 6.3); g.fill(); }
    g = this.waves.getContext('2d'); g.strokeStyle = 'rgba(160,225,250,0.28)'; g.lineWidth = 1.6; g.lineCap = 'round';
    for (let i = 0; i < 46; i++) { const x = rng.range(0, S), y = rng.range(0, S), l = rng.range(10, 26); for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { g.beginPath(); g.moveTo(x + ox, y + oy); g.quadraticCurveTo(x + ox + l / 2, y + oy - 4, x + ox + l, y + oy); g.stroke(); } }
    g = this.glint.getContext('2d');
    for (let i = 0; i < 38; i++) { const x = rng.range(0, S), y = rng.range(0, S); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x, y, rng.range(2, 5), 1.4); }
    this.pBase = null;
  }
  // Fills only the given world rects (chunks that contain water).
  draw(g, rects, time, ambientNight) {
    if (!rects.length) return;
    if (!this.pBase) { this.pBase = g.createPattern(this.base, 'repeat'); this.pWave = g.createPattern(this.waves, 'repeat'); this.pGlint = g.createPattern(this.glint, 'repeat'); }
    g.save();
    g.beginPath(); for (const r of rects) g.rect(r.x, r.y, r.w, r.h);
    g.fillStyle = this.pBase; g.fill();
    const lay = (pat, vx, vy, a) => { g.globalAlpha = a; g.save(); const ox = (time * vx) % 256, oy = (time * vy + Math.sin(time * 0.8) * 3) % 256; g.translate(ox, oy); g.beginPath(); for (const r of rects) g.rect(r.x - ox, r.y - oy, r.w, r.h); g.fillStyle = pat; g.fill(); g.restore(); };
    lay(this.pWave, 6, 2, 0.85); lay(this.pGlint, 9, -3, 0.55 + ambientNight * 0.3);
    g.restore();
  }
}
