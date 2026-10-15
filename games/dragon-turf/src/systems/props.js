import { segCircleT } from '../entities/projectile.js';
import { rand } from '../core/rng.js';

// Destructible street furniture: lamps, barrels, crates, bins, hydrants…
const HP = { barrel: 22, crate: 26, lamp: 50, bin: 18, planter: 40, hydrant: 40, lantern_post: 40 };
const CAR_BREAK = { barrel: 140, crate: 150, lamp: 230, bin: 110, planter: 170, hydrant: 190, lantern_post: 200 };

export class PropSystem {
  constructor(game) { this.game = game; this.geysers = []; }
  breakable(p) { return HP[p.type] !== undefined; }

  bulletTest(x0, y0, x1, y1, maxT) {
    const w = this.game.world; let best = null, bt = maxT;
    for (const p of w.propsNear((x0 + x1) / 2, (y0 + y1) / 2, Math.hypot(x1 - x0, y1 - y0) / 2 + 12)) {
      if (!p.r || HP[p.type] === undefined) continue;
      const t = segCircleT(x0, y0, x1, y1, p.x, p.y, p.r + 1); if (t >= 0 && t < bt) { bt = t; best = p; }
    }
    return best ? { t: bt, prop: best } : null;
  }

  hit(p, impulse, vehicle) {
    const need = CAR_BREAK[p.type]; if (need === undefined || impulse < need) return;
    this.damage(p, 999, vehicle && vehicle.driver);
    if (vehicle) { vehicle.vx *= 0.82; vehicle.vy *= 0.82; }
  }

  damage(p, dmg, src) {
    if (p.dead || HP[p.type] === undefined) return;
    if (p.hp === undefined) p.hp = HP[p.type];
    p.hp -= dmg; if (p.hp <= 0) this.destroy(p, src);
    else { this.game.fx.debris(p.x, p.y, p.type === 'barrel' ? '#b3453a' : '#a67a44', 3); }
  }

  destroy(p, src) {
    const g = this.game; p.dead = true;
    switch (p.type) {
      case 'barrel': g.combat.explode(p.x, p.y, 70, 85, src, { source: p }); break;
      case 'crate': g.fx.debris(p.x, p.y, '#a67a44', 10); g.audio.crash(p.x, p.y, 120); if (rand.chance(0.45)) g.pickups.drop(p.x, p.y, rand.chance(0.7) ? 'cash' : 'ammo', rand.int(20, 90)); break;
      case 'lamp': g.fx.spark(p.x, p.y, 0, 10, 3.2, 200); g.fx.debris(p.x, p.y, '#3a3d46', 5); g.audio.glass(p.x, p.y); g.events.emit('lampBroken', { prop: p, src }); break;
      case 'hydrant': g.fx.debris(p.x, p.y, '#d63a30', 5); this.geysers.push({ x: p.x, y: p.y, t: 7 }); break;
      case 'bin': g.fx.debris(p.x, p.y, '#4a5560', 6); g.fx.dust(p.x, p.y, 4); break;
      case 'planter': g.fx.debris(p.x, p.y, '#8a6a44', 6); g.fx.dust(p.x, p.y, 3); break;
      default: g.fx.debris(p.x, p.y, '#888', 4);
    }
    g.events.emit('propBroken', { prop: p, src });
  }

  explosion(x, y, r, dmg, src) {
    for (const p of this.game.world.propsNear(x, y, r)) { if (p.dead || HP[p.type] === undefined) continue; const d = Math.hypot(p.x - x, p.y - y); if (d <= r) this.damage(p, dmg * (1 - d / r) + 12, src); }
  }

  update(dt) {
    for (let i = this.geysers.length - 1; i >= 0; i--) {
      const s = this.geysers[i]; s.t -= dt; if (s.t <= 0) { this.geysers.splice(i, 1); continue; }
      if (Math.random() < dt * 50) this.game.fx.parts.push({ t: 'dust', x: s.x + rand.range(-3, 3), y: s.y + rand.range(-3, 3), vx: rand.range(-40, 40), vy: rand.range(-120, -60), life: 0.7, max: 0.7, s0: 3, s1: 12, a: 0.5 });
    }
  }
}
