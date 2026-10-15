import { rand } from '../core/rng.js';
import { damp } from '../core/math.js';

// Intermittent rain with ripples on the streets and the occasional thunderclap.
export class WeatherSystem {
  constructor(game) { this.game = game; this.rain = 0; this.target = 0; this.timer = rand.range(150, 260); this.ripples = []; this.drops = []; this.flash = 0; this.thunderT = 0; this.t = 0; this.wind = 0.18;
    for (let i = 0; i < 260; i++) this.drops.push({ x: Math.random(), y: Math.random(), s: rand.range(0.7, 1.4), l: rand.range(12, 26) }); }

  update(dt) {
    const g = this.game; this.t += dt;
    if (!g.settings.weather) this.target = 0;
    else { this.timer -= dt; if (this.timer <= 0) { if (this.target > 0) { this.target = 0; this.timer = rand.range(200, 380); } else { this.target = rand.range(0.5, 1); this.timer = rand.range(90, 200); } } }
    this.rain = damp(this.rain, this.target, 0.35, dt);
    g.clock.dim = this.rain * 0.22;
    if (this.rain > 0.5) { this.thunderT -= dt; if (this.thunderT <= 0) { this.thunderT = rand.range(9, 26); this.flash = 1; setTimeout(() => g.audio.noise(2.6, 300, 0.7, 'lowpass', 1, undefined, 60), 400 + Math.random() * 1200); } }
    this.flash = Math.max(0, this.flash - dt * 2.4);
    if (this.rain > 0.05) {
      const cam = g.camera, n = Math.floor(this.rain * 40 * dt * 60 / 60 + Math.random());
      for (let i = 0; i < n; i++) this.ripples.push({ x: cam.x + rand.range(-700, 700), y: cam.y + rand.range(-460, 460), t: 0 });
    }
    for (let i = this.ripples.length - 1; i >= 0; i--) { const r = this.ripples[i]; r.t += dt; if (r.t > 0.7) this.ripples.splice(i, 1); }
    if (this.ripples.length > 220) this.ripples.splice(0, this.ripples.length - 220);
  }

  drawWorld(g) {
    if (this.rain < 0.05) return; const w = this.game.world;
    g.save(); g.lineWidth = 1.2;
    for (const r of this.ripples) { const t = this.game.world.tileAtPx(r.x, r.y); if (t === 0 || t === 8) continue; const k = r.t / 0.7; g.globalAlpha = (1 - k) * 0.5 * this.rain; g.strokeStyle = '#cfe6ff'; g.beginPath(); g.ellipse(r.x, r.y, 2 + k * 9, 1 + k * 4.5, 0, 0, 6.283); g.stroke(); }
    g.restore(); void w;
  }
  drawScreen(g, cam) {
    if (this.rain < 0.05) return;
    g.save(); g.setTransform(cam.dpr, 0, 0, cam.dpr, 0, 0); g.strokeStyle = 'rgba(190,215,255,0.55)'; g.lineWidth = 1.2; g.globalAlpha = Math.min(1, this.rain * 1.1);
    const W = cam.w, H = cam.h, n = Math.floor(this.drops.length * this.rain), sp = 1400; g.beginPath();
    for (let i = 0; i < n; i++) { const d = this.drops[i], y = ((d.y * H + this.t * sp * d.s) % (H + 40)) - 20, x = ((d.x * W - y * this.wind + this.t * 40 * d.s) % (W + 60) + W + 60) % (W + 60) - 30; g.moveTo(x, y); g.lineTo(x - d.l * this.wind, y - d.l); }
    g.stroke();
    if (this.flash > 0.02) { g.globalAlpha = this.flash * 0.55; g.fillStyle = '#dfe9ff'; g.fillRect(0, 0, W, H); }
    g.restore();
  }
  drawLightning() {}
}
