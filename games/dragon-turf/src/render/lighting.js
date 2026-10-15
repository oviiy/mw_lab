import { makeCanvas } from './style.js';
import { hexToRgb } from '../core/color.js';

// Night lighting: a half-resolution light map starts as the ambient colour,
// lights are added on top, then the map is multiplied over the finished scene.
const LM_SCALE = 0.36;

export class Lighting {
  constructor() {
    this.cv = makeCanvas(8, 8); this.g = this.cv.getContext('2d');
    this.sprites = new Map(); this.count = 0; this.active = false;
  }
  sprite(color) {
    let s = this.sprites.get(color);
    if (!s) {
      s = makeCanvas(96, 96); const g = s.getContext('2d'), [r, gg, b] = hexToRgb(color);
      const gr = g.createRadialGradient(48, 48, 0, 48, 48, 48);
      gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(0.35, `rgba(${r},${gg},${b},0.55)`); gr.addColorStop(0.7, `rgba(${r},${gg},${b},0.16)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, 96, 96); this.sprites.set(color, s);
    }
    return s;
  }
  // Cached per-colour wet-street reflection sprite (soft vertical streaks fading
  // downward). Used by the renderer's emissive pass — baked once, drawImage per frame.
  reflect(color) {
    const m = this.refl || (this.refl = new Map()); let c = m.get(color);
    if (!c) {
      c = makeCanvas(32, 64); const q = c.getContext('2d'), [r, gg, b] = hexToRgb(color);
      const gr = q.createRadialGradient(16, 4, 1, 16, 4, 30); gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(0.45, `rgba(${r},${gg},${b},0.45)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      q.setTransform(1, 0, 0, 2, 0, 0); q.fillStyle = gr; q.fillRect(0, 0, 32, 32); q.setTransform(1, 0, 0, 1, 0, 0);
      q.globalCompositeOperation = 'destination-out';
      for (let x = 0; x < 32; x += 4) { q.fillStyle = `rgba(0,0,0,${0.15 + ((x * 7) % 5) * 0.08})`; q.fillRect(x, 0, 2, 64); }
      m.set(color, c);
    }
    return c;
  }
  begin(cam, ambient) {
    const w = Math.ceil(cam.w * LM_SCALE), h = Math.ceil(cam.h * LM_SCALE);
    if (this.cv.width !== w || this.cv.height !== h) { this.cv.width = w; this.cv.height = h; }
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.fillStyle = `rgb(${ambient.r | 0},${ambient.g | 0},${ambient.b | 0})`; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter'; this.cam = cam; this.count = 0;
  }
  add(x, y, r, color = '#ffd9a0', intensity = 1) {
    const cam = this.cam, lx = cam.sx(x) * LM_SCALE, ly = cam.sy(y) * LM_SCALE, lr = r * cam.scale * LM_SCALE;
    if (lx < -lr || ly < -lr || lx > this.cv.width + lr || ly > this.cv.height + lr) return;
    const g = this.g; g.globalAlpha = Math.min(1, intensity);
    g.drawImage(this.sprite(color), lx - lr, ly - lr, lr * 2, lr * 2); this.count++;
  }
  cone(x, y, ang, len, spread, color = '#fff2c0', intensity = 0.9) {
    const cam = this.cam, lx = cam.sx(x) * LM_SCALE, ly = cam.sy(y) * LM_SCALE, L = len * cam.scale * LM_SCALE, s = spread * cam.scale * LM_SCALE;
    if (lx < -L || ly < -L || lx > this.cv.width + L || ly > this.cv.height + L) return;
    const g = this.g, [r, gg, b] = hexToRgb(color); g.save(); g.translate(lx, ly); g.rotate(ang);
    const gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, `rgba(${r},${gg},${b},${intensity})`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    g.fillStyle = gr; g.globalAlpha = 1; g.beginPath(); g.moveTo(0, -s * 0.12); g.lineTo(L, -s); g.lineTo(L, s); g.lineTo(0, s * 0.12); g.closePath(); g.fill(); g.restore(); this.count++;
  }
  finish(g, cam, vignette) {
    if (vignette) { const q = this.g; q.globalCompositeOperation = 'multiply'; q.globalAlpha = 1; q.drawImage(vignette, 0, 0, this.cv.width, this.cv.height); }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(this.cv, 0, 0, cam.w * cam.dpr, cam.h * cam.dpr); g.restore();
  }
}
