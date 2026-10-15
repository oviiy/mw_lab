import { Entity } from './entity.js';
import { INK } from '../render/style.js';
import { dampAngle } from '../core/math.js';

// Police helicopter: orbits the player, rakes the street with a searchlight and fires.
export class Heli extends Entity {
  constructor(x, y) {
    super('misc'); this.x = x; this.y = y; this.hp = 420; this.maxHp = 420; this.angle = 0; this.vx = 0; this.vy = 0; this.rot = 0; this.orbit = Math.random() * 6.28; this.cool = 1.5; this.r = 22;
    this.role = 'cop'; this.faction = 'none'; this.data = {}; this.heli = true; this.dead = false; this.fall = 0; this.faceAng = 0; this.light = { x: x, y: y };
  }
  get sortY() { return this.y + 400; }       // always above everything
  update(dt, game) {
    const p = game.player; this.rot += dt * 36;
    if (this.dead) { this.fall += dt; this.y += 90 * dt; this.x += this.vx * dt * 0.4; if (this.fall > 1.2) { game.combat.explode(this.x, this.y, 80, 100, null); game.wanted.onHeliDown(this); this.removed = true; } return; }
    const tx = p.x + Math.cos(this.orbit) * 150, ty = p.y + Math.sin(this.orbit) * 110; this.orbit += dt * 0.35;
    const dx = tx - this.x, dy = ty - this.y, d = Math.hypot(dx, dy) || 1, sp = Math.min(280, d * 1.6);
    this.vx += (dx / d * sp - this.vx) * Math.min(1, dt * 1.6); this.vy += (dy / d * sp - this.vy) * Math.min(1, dt * 1.6);
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.faceAng = dampAngle(this.faceAng, Math.atan2(p.y - this.y, p.x - this.x), 2.4, dt); this.angle = this.faceAng;
    // searchlight eases onto the player
    const k = Math.min(1, dt * 3.2); this.light.x += (p.x - this.light.x) * k; this.light.y += (p.y - this.light.y) * k;
    this.cool -= dt;
    if (this.cool <= 0 && !p.dead && game.wantedLevel >= 4) { this.cool = 0.14; this.fireAt(p, game); }
  }
  fireAt(p, game) {
    const a = Math.atan2(p.y - this.y, p.x - this.x) + (Math.random() - 0.5) * 0.28;
    game.combat.fireProjectile && game.combat.fireProjectile(this, this.x, this.y, a, 780, 7, 0.7);
  }
  damage(n, src) { if (this.dead) return; this.hp -= n; if (this.hp <= 0) { this.dead = true; this.fall = 0; } }
  draw(g, time, cam, game) {
    const h = 34; // altitude shown as a shadow offset
    g.fillStyle = 'rgba(10,6,24,0.26)'; g.save(); g.translate(this.x + 40, this.y + 70); g.rotate(this.angle); g.beginPath(); g.ellipse(0, 0, 26, 9, 0, 0, 6.3); g.fill(); g.restore();
    g.save(); g.translate(this.x, this.y - h); g.rotate(this.angle);
    g.fillStyle = '#20252f'; g.fillRect(-46, -2, 34, 4); g.fillRect(-48, -7, 4, 14); g.strokeStyle = INK; g.lineWidth = 1.2; g.strokeRect(-46, -2, 34, 4);
    g.beginPath(); g.ellipse(0, 0, 20, 11, 0, 0, 6.3); g.fillStyle = '#1d3f8a'; g.fill(); g.lineWidth = 2; g.stroke();
    g.beginPath(); g.ellipse(9, 0, 8, 7, 0, 0, 6.3); g.fillStyle = '#8cd0ee'; g.fill(); g.lineWidth = 1.4; g.stroke();
    g.fillStyle = '#eef0f4'; g.fillRect(-8, -3, 12, 6);
    g.rotate(this.rot); g.strokeStyle = 'rgba(20,20,28,0.7)'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(-52, 0); g.lineTo(52, 0); g.moveTo(0, -52); g.lineTo(0, 52); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(0, 0, 3.2, 0, 6.3); g.fill();
    g.restore();
    const ph = Math.floor(time * 6) & 1; g.fillStyle = ph ? '#ff3030' : '#3a5cff'; g.beginPath(); g.arc(this.x, this.y - h, 3, 0, 6.3); g.fill();
    void cam; void game;
  }
}
