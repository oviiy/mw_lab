import { Entity } from './entity.js';
import { INK, inkRect } from '../render/style.js';

// Things on the ground you can grab by walking over them.
export class Pickup extends Entity {
  constructor(type, x, y, amount, o = {}) {
    super('pickup'); this.type = type; this.x = x; this.y = y; this.amount = amount; this.r = 11; this.t = Math.random() * 6; this.life = o.life ?? 90; this.weapon = o.weapon || null; this.ammoType = o.ammoType || null; this.persist = !!o.persist; this.label = o.label || null;
  }
  get sortY() { return this.y - 2; }
  update(dt) { this.t += dt; if (!this.persist) { this.life -= dt; if (this.life <= 0) this.removed = true; } }
  draw(g, time) {
    const bob = Math.sin(this.t * 4) * 1.6; const blink = !this.persist && this.life < 6 && Math.floor(this.t * 6) % 2 === 0; if (blink) return;
    g.fillStyle = 'rgba(10,6,24,0.28)'; g.beginPath(); g.ellipse(this.x + 2, this.y + 5, 7, 3, 0, 0, 6.3); g.fill();
    g.save(); g.translate(this.x, this.y - 4 + bob);
    if (this.type === 'cash') { inkRect(g, -7, -4, 14, 8, '#3fa65a', 1.5, 1.4); g.fillStyle = '#c8f2cf'; g.font = 'bold 8px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, 0.5); }
    else if (this.type === 'health') { inkRect(g, -6, -6, 12, 12, '#f4f4ee', 2, 1.5); g.fillStyle = '#e23b2e'; g.fillRect(-1.6, -4.4, 3.2, 8.8); g.fillRect(-4.4, -1.6, 8.8, 3.2); }
    else if (this.type === 'armor') { g.beginPath(); g.moveTo(0, -7); g.lineTo(6.5, -4); g.lineTo(5, 4); g.lineTo(0, 7.5); g.lineTo(-5, 4); g.lineTo(-6.5, -4); g.closePath(); g.fillStyle = '#4a9bd6'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = INK; g.stroke(); }
    else if (this.type === 'ammo') { inkRect(g, -7, -4, 14, 8, '#7a6a3a', 1.5, 1.4); g.fillStyle = '#e0b94a'; for (let i = 0; i < 4; i++) g.fillRect(-5 + i * 3, -2.5, 1.8, 5); }
    else if (this.type === 'weapon') { inkRect(g, -9, -4, 18, 8, '#2a2d34', 2, 1.4); g.fillStyle = '#ffd23a'; g.fillRect(-6, -1.4, 12, 2.8); }
    else if (this.type === 'drop') { inkRect(g, -8, -6, 16, 12, '#a8231d', 2, 1.5); g.fillStyle = '#f1c64a'; g.fillRect(-8, -1, 16, 2); }
    g.restore();
    // glint
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.22 + Math.sin(time * 5 + this.t) * 0.08; g.fillStyle = this.type === 'cash' ? '#6dff98' : this.type === 'health' ? '#ff8a8a' : '#ffe28a'; g.beginPath(); g.arc(this.x, this.y - 4, 12, 0, 6.3); g.fill(); g.restore();
  }
}
