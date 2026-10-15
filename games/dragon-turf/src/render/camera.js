import { VIEW } from '../config.js';
import { clamp, damp } from '../core/math.js';

// Follow camera with look-ahead, zoom easing and trauma-style screen shake.
export class Camera {
  constructor() {
    this.x = 0; this.y = 0; this.zoom = 1; this.targetZoom = 1; this.userZoom = 1;
    this.w = 1280; this.h = 720; this.dpr = 1; this.baseScale = 1;
    this.trauma = 0; this.shakeX = 0; this.shakeY = 0; this.kx = 0; this.ky = 0; this.rot = 0; this.time = 0;
  }
  resize(w, h, dpr) { w = Math.max(1, w); h = Math.max(1, h); this.w = w; this.h = h; this.dpr = dpr; this.baseScale = h / VIEW.baseHeight; }
  get scale() { return this.baseScale * this.zoom; }
  kick(x, y) { this.kx += x; this.ky += y; }
  addTrauma(t) { this.trauma = clamp(this.trauma + t, 0, 1); }
  snapTo(x, y) { this.x = x; this.y = y; }
  update(dt, tx, ty, lookX = 0, lookY = 0, speedZoom = 1) {
    this.time += dt;
    if (!Number.isFinite(lookX) || !Number.isFinite(lookY)) lookX = lookY = 0;
    this.x = damp(this.x, tx + lookX, 6.5, dt); this.y = damp(this.y, ty + lookY, 6.5, dt);
    if (!Number.isFinite(this.x) || !Number.isFinite(this.y)) { this.x = tx; this.y = ty; }
    this.targetZoom = clamp(this.userZoom * speedZoom, VIEW.minZoom, VIEW.maxZoom);
    this.zoom = damp(this.zoom, this.targetZoom, 2.4, dt);
    this.trauma = Math.max(0, this.trauma - dt * 2.2);
    const s = this.trauma * this.trauma * 22;
    this.kx = damp(this.kx, 0, 18, dt); this.ky = damp(this.ky, 0, 18, dt);
    this.shakeX = (Math.sin(this.time * 71) + Math.sin(this.time * 43)) * 0.5 * s + this.kx; this.shakeY = (Math.cos(this.time * 63) + Math.sin(this.time * 37)) * 0.5 * s + this.ky;
  }
  // world → screen (CSS px)
  sx(x) { return (x - this.x) * this.scale + this.w / 2 + this.shakeX; }
  sy(y) { return (y - this.y) * this.scale + this.h / 2 + this.shakeY; }
  wx(sx) { return (sx - this.w / 2 - this.shakeX) / this.scale + this.x; }
  wy(sy) { return (sy - this.h / 2 - this.shakeY) / this.scale + this.y; }
  apply(g) {
    const s = this.scale * this.dpr;
    g.setTransform(s, 0, 0, s, (this.w / 2 + this.shakeX) * this.dpr - this.x * s, (this.h / 2 + this.shakeY) * this.dpr - this.y * s);
  }
  // visible world rect, padded
  bounds(pad = 0) { const hw = this.w / 2 / this.scale + pad, hh = this.h / 2 / this.scale + pad; return { x0: this.x - hw, y0: this.y - hh, x1: this.x + hw, y1: this.y + hh }; }
}
