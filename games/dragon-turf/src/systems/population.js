import { TILE } from '../config.js';
import { Ped } from '../entities/ped.js';
import { civilianLook } from '../entities/pedLooks.js';
import { civBrain } from './ai/civBrain.js';
import { T, isSidewalkish } from '../world/tiles.js';
import { dist } from '../core/math.js';
import { rand } from '../core/rng.js';

// District-aware crowd: dense in Dragon Gate and the night market, thin in the yards.
const DENSITY = [1.15, 0.8, 0.8, 0.7, 0.35, 0.5];            // by district id
export class PopulationSystem {
  constructor(game) {
    this.game = game; this.timer = 0;
    game.events.on('noise', (e) => this.onNoise(e));
    game.events.on('pedDied', (e) => this.onDeath(e));
  }

  cap() {
    const h = this.game.clock.hour, night = h > 23 || h < 5 ? 0.45 : h > 20 || h < 7 ? 0.75 : 1;
    return Math.round(34 * night);
  }

  makeCivilian(x, y, kind = null) {
    const game = this.game, d = game.world.districtAtPx(x, y);
    kind = kind || (rand.chance(0.1) ? 'elder' : d === 3 && rand.chance(0.45) ? 'biz' : d === 4 && rand.chance(0.4) ? 'worker' : 'walker');
    const p = new Ped({ x, y, role: 'civ', look: civilianLook(kind), hp: 40, walk: rand.range(46, 70), brain: civBrain, cash: rand.int(5, 70) });
    p.state = 'idle'; p.data.idleFor = rand.range(0.2, 3); p.data.kind = kind; p.data.brave = rand.chance(0.12);
    game.entities.add(p); return p;
  }

  spawnOne(min, max) {
    const game = this.game, w = game.world, pl = game.player;
    for (let tr = 0; tr < 14; tr++) {
      const a = rand.range(0, 6.283), d = rand.range(min, max), x = pl.x + Math.cos(a) * d, y = pl.y + Math.sin(a) * d;
      const t = w.tileAtPx(x, y); if (!isSidewalkish(t) || t === T.PIER || t === T.LOT) continue;
      if (rand.next() > DENSITY[w.districtAtPx(x, y)] ) continue;
      if (game.entities.nearest(x, y, 30, (e) => e.kind === 'ped')) continue;
      return this.makeCivilian(x, y);
    }
    return null;
  }

  prime() {
    const game = this.game, w = game.world, pl = game.player;
    for (let i = 0; i < 12; i++) this.spawnOne(90, 420);
    for (let i = 0; i < 16; i++) this.spawnOne(380, 900);
    // tai chi groups and market vendors give the city its stage dressing
    for (const s of w.spawns.tai || []) for (let i = 0; i < 3; i++) { const p = this.makeCivilian(s.x + rand.range(-22, 22), s.y + rand.range(-22, 22), 'elder'); p.state = 'tai'; p.data.tai = { x: p.x, y: p.y, ph: rand.range(0, 6) }; }
    for (const c of w.spawns.crowd || []) for (let i = 0; i < 3; i++) { const p = this.makeCivilian(c.x + rand.range(-c.r, c.r) * 0.7, c.y + rand.range(-c.r, c.r) * 0.7); if (!isSidewalkish(w.tileAtPx(p.x, p.y))) p.removed = true; }
    void pl;
  }

  update(dt) {
    const game = this.game, pl = game.player; if (!pl) return;
    this.timer -= dt;
    // tai chi: slow-motion forms
    for (const p of game.entities.peds) if (p.state === 'tai' && !p.dead) { const t = p.data.tai; t.ph += dt * 0.6; p.intent.mx = p.intent.my = 0; p.intent.aim = Math.sin(t.ph) * 1.1 + 1.5; p.walkPhase = 0.7 + Math.sin(t.ph * 2) * 0.7; }
    if (this.timer <= 0) {
      this.timer = 0.35;
      let n = 0; for (const p of game.entities.peds) if (p.role === 'civ' && !p.dead) n++;
      if (n < this.cap()) this.spawnOne(game.viewRadius() + 40, 820);
    }
    for (const p of game.entities.peds) {
      if (p.removed || p.role !== 'civ' || p.persistent || p.dead || p.state === 'tai' && dist(p.x, p.y, pl.x, pl.y) < 1200) continue;
      if (dist(p.x, p.y, pl.x, pl.y) > 1000) p.removed = true;
    }
  }

  onNoise(e) {
    if (!(e.kind === 'gunshot' || e.kind === 'explosion' || e.kind === 'fire' || e.kind === 'throw')) return;
    const game = this.game, near = game.entities.near(e.x, e.y, e.r, [], (q) => q.kind === 'ped' && q.role === 'civ' && !q.dead && !q.vehicle);
    for (const p of near) {
      if (p.state === 'flee') continue;
      if (p.data.brave && rand.chance(0.6)) { p.state = 'watch'; p.stateT = 0; p.data.watchAt = { x: e.x, y: e.y }; continue; }
      p.state = 'flee'; p.stateT = 0; p.data.fleeFrom = { x: e.x, y: e.y }; p.data.panic = e.kind === 'explosion' ? 3 : 0;
    }
  }
  onDeath(e) {
    const p = e.ped, game = this.game;
    if (p.role === 'civ' && e.src && e.src.role === 'player') game.stats.kills++;
    if (p.cash && !p.noDrop && p.role !== 'player' && rand.chance(p.role === 'civ' ? 0.55 : 0.8)) game.pickups.drop(p.x, p.y, 'cash', p.cash);
    // nearby civilians panic when someone drops
    for (const q of game.entities.near(p.x, p.y, 260, [], (z) => z.kind === 'ped' && z.role === 'civ' && !z.dead)) if (q !== p && q.state !== 'flee') { q.state = 'flee'; q.stateT = 0; q.data.fleeFrom = { x: p.x, y: p.y }; }
  }
}
void TILE;
