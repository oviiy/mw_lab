import { TIME } from '../config.js';
import { lerp, clamp, pad2 } from '../core/math.js';

// In-game time of day + the ambient light colour derived from it.
const KEYS = [          // hour, r, g, b (multiply colour), neon strength
  [0,   38,  34,  72, 1],     // deep indigo night: neon + lamps carry the scene
  [5,   48,  44,  88, 1],
  [6.2, 210, 140, 150, 0.7],
  [7.8, 255, 238, 220, 0.1],
  [12,  255, 255, 255, 0],
  [16.5, 255, 246, 230, 0],
  [18.2, 255, 160, 120, 0.5],
  [19.4, 112, 74, 150, 0.95],
  [21,  44,  38,  82, 1],
  [24,  38,  34,  72, 1],
];

export class Clock {
  constructor() { this.hour = TIME.startHour; this.day = 1; this.paused = false; this.scale = 1; this.dim = 0; }
  update(dt) {
    if (this.paused) return;
    this.hour += (dt / TIME.secondsPerHour) * this.scale;
    if (this.hour >= 24) { this.hour -= 24; this.day++; }
  }
  setHour(h) { this.hour = ((h % 24) + 24) % 24; }
  ambient() {
    const h = this.hour; let a = KEYS[0], b = KEYS[1];
    for (let i = 0; i < KEYS.length - 1; i++) if (h >= KEYS[i][0] && h <= KEYS[i + 1][0]) { a = KEYS[i]; b = KEYS[i + 1]; break; }
    const t = clamp((h - a[0]) / (b[0] - a[0] || 1), 0, 1);
    const k = 1 - this.dim; return { r: lerp(a[1], b[1], t) * k, g: lerp(a[2], b[2], t) * k, b: lerp(a[3], b[3], t) * (1 - this.dim * 0.5), neon: Math.min(1, Math.max(lerp(a[4], b[4], t), this.dim * 2.2)) };
  }
  get isNight() { return this.hour < 5.6 || this.hour > 19.6; }
  get dark() { const a = this.ambient(); return 1 - (a.r + a.g + a.b) / 765; }
  label() { const h = Math.floor(this.hour), m = Math.floor((this.hour % 1) * 60 / 5) * 5; return `${pad2(h)}:${pad2(m)}`; }
  serialize() { return { hour: this.hour, day: this.day }; }
  restore(d) { if (d) { this.hour = d.hour; this.day = d.day; } }
}
