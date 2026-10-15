import { Entity } from './entity.js';
import { INK } from '../render/style.js';

// Segment/circle intersection → t in [0,1] along the segment, or -1.
export function segCircleT(x0, y0, x1, y1, cx, cy, r) {
  const dx = x1 - x0, dy = y1 - y0, fx = x0 - cx, fy = y0 - cy;
  const a = dx * dx + dy * dy; if (a < 1e-9) return Math.hypot(fx, fy) <= r ? 0 : -1;
  const b = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - r * r;
  let disc = b * b - 4 * a * c; if (disc < 0) return -1;
  disc = Math.sqrt(disc); const t1 = (-b - disc) / (2 * a), t2 = (-b + disc) / (2 * a);
  if (t1 >= 0 && t1 <= 1) return t1; if (t2 >= 0 && t2 <= 1) return 0; return -1;
}

// Bullets are fast swept segments; thrown items follow a short arc and burst.
export class Projectile extends Entity {
  constructor(o) {
    super('proj');
    this.type = o.type; this.x = o.x; this.y = o.y; this.vx = o.vx; this.vy = o.vy; this.owner = o.owner || null; this.faction = o.faction || 'none';
    this.dmg = o.dmg; this.life = o.life ?? 1; this.maxLife = this.life; this.weapon = o.weapon; this.knock = o.knock ?? 60; this.r = 2;
    this.fuse = o.fuse ?? 0; this.air = !!o.air; this.blast = o.blast || 0; this.target = o.target || null; this.spin = 0; this.px = this.x; this.py = this.y; this.dist = 0; this.tint = o.tint || '#ffe9a0';
  }
  get sortY() { return this.y + 1; }

  update(dt, game) {
    this.px = this.x; this.py = this.y;
    if (this.type === 'grenade' || this.type === 'molotov') return this.updateThrown(dt, game);
    if (this.type === 'bomb') { // falls from the plane: drifts forward, then detonates on the ground
      this.x += this.vx * dt; this.y += this.vy * dt; this.vx *= 1 - dt * 1.4; this.vy *= 1 - dt * 1.4; this.life -= dt;
      if (this.life <= 0) { game.combat.explode(this.x, this.y, this.blast || 100, this.dmg, this.owner, { source: this }); game.camera.addTrauma(0.3); this.removed = true; }
      return;
    }
    if ((this.type === 'rocket' || this.type === 'shell') && Math.random() < dt * 60) game.fx.smoke(this.x, this.y, 0.05, 0.45);
    if (this.type === 'flame' && Math.random() < dt * 40) game.fx.fire(this.x, this.y, 0.7 + (1 - this.life / this.maxLife) * 0.8);
    const step = Math.hypot(this.vx, this.vy) * dt, n = Math.max(1, Math.ceil(step / 22)), sdt = dt / n;
    for (let i = 0; i < n && !this.removed; i++) {
      const x0 = this.x, y0 = this.y; this.x += this.vx * sdt; this.y += this.vy * sdt; this.dist += Math.hypot(this.x - x0, this.y - y0);
      if (game.combat.bulletStep(this, x0, y0, this.x, this.y)) { this.removed = true; break; }
    }
    this.life -= dt; if (this.life <= 0) this.removed = true;
    if (this.removed && this.blast) game.combat.explode(this.x, this.y, this.blast, this.dmg * 0.9, this.owner, { source: this });
  }

  updateThrown(dt, game) {
    this.x += this.vx * dt; this.y += this.vy * dt; this.spin += dt * 14; this.life -= dt; this.fuse -= dt;
    this.vx *= 1 - dt * 0.8; this.vy *= 1 - dt * 0.8;
    const hitWall = game.world.isSolidPx(this.x, this.y);
    if (hitWall) { this.x = this.px; this.y = this.py; this.vx *= -0.35; this.vy *= -0.35; }
    if (this.type === 'molotov') {
      let burst = this.life <= 0 || hitWall;
      if (!burst) { const e = game.entities.nearest(this.x, this.y, 14, (q) => q !== this.owner && !q.dead && !(q.kind === 'ped' && q.vehicle)); if (e) burst = true; }
      if (burst) { game.combat.molotovBurst(this); this.removed = true; }
    } else if (this.fuse <= 0) { game.combat.explode(this.x, this.y, 74, this.dmg, this.owner, { source: this }); this.removed = true; }
  }

  draw(g, time) {
    if (this.type === 'grenade' || this.type === 'molotov') {
      g.fillStyle = 'rgba(10,6,24,0.3)'; g.beginPath(); g.ellipse(this.x + 3, this.y + 5, 4, 2.4, 0, 0, 6.3); g.fill();
      g.save(); g.translate(this.x, this.y - 6); g.rotate(this.spin);
      if (this.type === 'grenade') { g.beginPath(); g.arc(0, 0, 3.4, 0, 6.3); g.fillStyle = '#4a5a3a'; g.fill(); g.lineWidth = 1.3; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#d4d8de'; g.fillRect(-1, -4.6, 2, 2); }
      else { g.fillStyle = '#4a8a5a'; g.fillRect(-3, -1.8, 6, 3.6); g.lineWidth = 1.2; g.strokeStyle = INK; g.strokeRect(-3, -1.8, 6, 3.6); g.fillStyle = '#ffb347'; g.beginPath(); g.arc(3.5, 0, 1.8 + Math.sin(time * 40) * 0.4, 0, 6.3); g.fill(); }
      g.restore(); return;
    }
    if (this.type === 'bomb') { const k = Math.max(0.35, this.life / this.maxLife); g.fillStyle = 'rgba(10,6,24,0.3)'; g.beginPath(); g.ellipse(this.x, this.y, 4, 2.5, 0, 0, 6.3); g.fill(); g.save(); g.translate(this.x, this.y - 60 * k); g.rotate(Math.atan2(this.vy, this.vx)); g.scale(0.7 + k * 0.5, 0.7 + k * 0.5); g.fillStyle = '#3a3d34'; g.beginPath(); g.ellipse(0, 0, 7, 3.2, 0, 0, 6.3); g.fill(); g.lineWidth = 1.2; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#c8202a'; g.fillRect(-8, -3, 2, 6); g.restore(); return; }
    if (this.type === 'flame') { const k = 1 - this.life / this.maxLife; g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,${(170 - k * 90) | 0},40,${0.7 - k * 0.4})`; g.beginPath(); g.arc(this.x, this.y, 4 + k * 12, 0, 6.3); g.fill(); g.restore(); return; }
    if (this.type === 'rocket' || this.type === 'shell') { const a = Math.atan2(this.vy, this.vx); g.save(); g.translate(this.x, this.y); g.rotate(a); g.fillStyle = this.type === 'shell' ? '#e8c34a' : '#d8dce0'; g.fillRect(-7, -2, 12, 4); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(-7, -2, 12, 4); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,170,60,0.9)'; g.beginPath(); g.ellipse(-10, 0, 5 + Math.random() * 3, 2.5, 0, 0, 6.3); g.fill(); g.restore(); return; }
    // bullet tracer
    g.save(); g.globalCompositeOperation = 'lighter';
    const len = Math.min(34, Math.hypot(this.vx, this.vy) * 0.03), a = Math.atan2(this.vy, this.vx), t = Math.min(1, this.dist / 40);
    g.strokeStyle = this.tint; g.lineWidth = 2.2; g.globalAlpha = 0.9 * t; g.lineCap = 'round';
    g.beginPath(); g.moveTo(this.x, this.y); g.lineTo(this.x - Math.cos(a) * len * t, this.y - Math.sin(a) * len * t); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 1; g.beginPath(); g.moveTo(this.x, this.y); g.lineTo(this.x - Math.cos(a) * len * 0.5 * t, this.y - Math.sin(a) * len * 0.5 * t); g.stroke();
    g.restore();
  }
}
