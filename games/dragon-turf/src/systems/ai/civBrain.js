import { moveToward, stop, pickWanderPoint, unstick } from './steering.js';
import { dist } from '../../core/math.js';
import { rand } from '../../core/rng.js';

// Everyday pedestrians: wander, idle, dodge cars, panic, phone the cops.
export const civBrain = {
  update(p, dt, game) {
    const world = game.world, d = p.data;
    d.st = d.st || {};
    switch (p.state) {
      case 'flee': return this.flee(p, dt, game);
      case 'phone': return this.phone(p, dt, game);
      case 'watch': return this.watch(p, dt, game);
      case 'idle': {
        stop(p); if (p.stateT > d.idleFor) { p.state = 'wander'; p.stateT = 0; d.goal = null; } break;
      }
      default: { // wander
        if (!d.goal || p.stateT > 22) { d.goal = pickWanderPoint(world, p, 100, 360); p.stateT = 0; if (!d.goal) { p.state = 'idle'; d.idleFor = rand.range(1, 3); return; } }
        const arrived = moveToward(p, d.goal.x, d.goal.y, false, 10);
        if (arrived || unstick(p, dt, d.st)) { p.state = rand.chance(0.22) ? 'idle' : 'wander'; p.stateT = 0; d.idleFor = rand.range(1.5, 4.5); d.goal = null; d.st.stuck = 0; }
        this.dodge(p, game);
      }
    }
  },
  dodge(p, game) {
    const v = game.entities.nearest(p.x, p.y, 70, (e) => e.kind === 'vehicle' && !e.dead && Math.abs(e.fw) > 120);
    if (!v) return;
    const dx = p.x - v.x, dy = p.y - v.y, ahead = dx * Math.cos(v.angle) + dy * Math.sin(v.angle);
    if (ahead > -10 && ahead < 120) { const side = -dx * Math.sin(v.angle) + dy * Math.cos(v.angle) >= 0 ? 1 : -1; p.intent.mx += -Math.sin(v.angle) * side * 2; p.intent.my += Math.cos(v.angle) * side * 2; p.intent.run = true; }
  },
  flee(p, dt, game) {
    const d = p.data, from = d.fleeFrom || { x: p.x - 1, y: p.y }; p.intent.run = true;
    let ax = p.x - from.x, ay = p.y - from.y, l = Math.hypot(ax, ay) || 1; ax /= l; ay /= l;
    // veer along walls
    const ang = Math.atan2(ay, ax) + Math.sin(p.stateT * 3 + p.id) * 0.5;
    p.intent.mx = Math.cos(ang); p.intent.my = Math.sin(ang);
    const st = d.st || (d.st = {}); if (unstick(p, dt, st)) { d.fleeFrom = { x: p.x + rand.range(-50, 50), y: p.y + rand.range(-50, 50) }; st.stuck = 0; }
    if (p.stateT > rand.range(5, 8) + (d.panic || 0) && dist(p.x, p.y, from.x, from.y) > 220) { p.state = 'idle'; p.stateT = 0; d.idleFor = 1; p.intent.run = false; }
  },
  phone(p, dt, game) {
    stop(p); const d = p.data; d.phoneT = (d.phoneT ?? 3) - dt;
    if (d.phoneT <= 0) { game.events.emit('witnessReport', { witness: p, crime: d.crime }); p.state = 'idle'; p.stateT = 0; d.idleFor = 2; d.phoneT = undefined; }
  },
  watch(p, dt, game) {
    stop(p); const t = p.data.watchAt; if (t) p.intent.aim = Math.atan2(t.y - p.y, t.x - p.x);
    if (p.stateT > 6) { p.state = 'idle'; p.stateT = 0; p.data.idleFor = 1; p.intent.aim = null; }
  },
  onHit(p, src, amt) { p.state = 'flee'; p.stateT = 0; p.data.fleeFrom = src ? { x: src.x, y: src.y } : { x: p.x, y: p.y + 1 }; },
  onDeath() {},
  // Reaction to loud events handled centrally by PopulationSystem.
};
