import { engage, findTarget, chase } from './engage.js';
import { moveToward, stop, pickWanderPoint, unstick } from './steering.js';
import { dist } from '../../core/math.js';
import { rand } from '../../core/rng.js';

// Gang members hold their turf: loiter near an anchor, spot enemies, fight, and call friends.
export const gangBrain = {
  update(p, dt, game) {
    const d = p.data; d.st = d.st || {};
    // threat scan a few times a second
    d.scanT = (d.scanT ?? rand.range(0, 0.3)) - dt;
    if (d.scanT <= 0) { d.scanT = 0.3; const t = findTarget(p, game, d.sight || 260); if (t) { if (p.state !== 'fight') { p.state = 'fight'; p.stateT = 0; d.engaged = 0; this.callFriends(p, t, game); } d.target = t; d.lost = 0; } }
    switch (p.state) {
      case 'fight': return this.fight(p, dt, game);
      case 'investigate': return this.investigate(p, dt, game);
      case 'flee': return this.flee(p, dt, game);
      default: return this.guard(p, dt, game);
    }
  },
  guard(p, dt, game) {
    const d = p.data, a = d.anchor || { x: p.x, y: p.y };
    if (p.state === 'idle' || !d.goal) {
      stop(p);
      if (p.stateT > (d.idleFor ?? 2)) { p.state = 'guard'; p.stateT = 0; d.goal = pickWanderPoint(game.world, { x: a.x, y: a.y }, 20, d.leash ?? 110, (x, y) => dist(x, y, a.x, a.y) < (d.leash ?? 110)) || { x: a.x, y: a.y }; }
      return;
    }
    if (moveToward(p, d.goal.x, d.goal.y, false, 10) || unstick(p, dt, d.st)) { p.state = 'idle'; p.stateT = 0; d.idleFor = rand.range(1.5, 6); d.goal = null; d.st.stuck = 0; }
  },
  fight(p, dt, game) {
    const d = p.data, t = d.target;
    if (!t || t.dead || t.removed) { p.state = 'guard'; p.stateT = 0; d.goal = null; d.target = null; stop(p); return; }
    if (p.hp < p.maxHp * 0.22 && !p.boss && rand.chance(dt * 0.6)) { p.state = 'flee'; p.stateT = 0; return; }
    const dd = engage(p, t, dt, game, { min: d.min ?? 90, max: d.max ?? 210, acc: d.sway ?? 0.14, reaction: d.reaction ?? 0.45 });
    d.lost = (d.lost || 0) + (d.los ? -dt : dt); if (d.lost < 0) d.lost = 0;
    if (dd > 520 || d.lost > 9) { p.state = 'guard'; p.stateT = 0; d.target = null; d.goal = null; }
  },
  investigate(p, dt, game) {
    const d = p.data, at = d.investigate; if (!at) { p.state = 'guard'; return; }
    if (moveToward(p, at.x, at.y, true, 18) || p.stateT > 9) { p.state = 'idle'; p.stateT = 0; d.idleFor = 1.5; }
  },
  flee(p, dt, game) {
    const t = p.data.target; if (!t) { p.state = 'guard'; return; }
    const ang = Math.atan2(p.y - t.y, p.x - t.x); p.intent.mx = Math.cos(ang); p.intent.my = Math.sin(ang); p.intent.run = true; p.intent.aim = null;
    if (p.stateT > 4 || dist(p.x, p.y, t.x, t.y) > 400) { p.state = 'guard'; p.stateT = 0; }
  },
  callFriends(p, t, game) {
    for (const q of game.entities.near(p.x, p.y, 320, [], (e) => e.kind === 'ped' && e.faction === p.faction && !e.dead && e !== p && (e.role === 'gang' || e.role === 'boss' || e.role === 'ally'))) {
      if (q.state === 'fight') continue; q.state = 'investigate'; q.stateT = 0; q.data.investigate = { x: t.x, y: t.y };
    }
  },
  // Gang drivers shoot out of the window at nearby enemies while their car does the chasing.
  updateInVehicle(p, dt, game) {
    const v = p.vehicle, d = p.data; d.scanT = (d.scanT ?? 0) - dt;
    if (d.scanT <= 0) { d.scanT = 0.3; d.target = findTarget(p, game, 330); }
    const t = d.target; if (!t || t.dead || !v || v.dead) { p.intent.aim = null; return; }
    const ang = Math.atan2(t.y - p.y, t.x - p.x); p.intent.aim = ang; p.angle = ang;
    if (p.weapon !== 'fists' && p.weapon !== 'cleaver' && Math.hypot(t.x - p.x, t.y - p.y) < 300) game.combat.fire(p);
  },
  onHit(p, src, amt) {
    if (!src) return; const s = src.vehicle && src.role === 'player' ? src : src;
    if (s.kind === 'ped' && s.role !== 'civ') { p.state = 'fight'; p.stateT = 0; p.data.target = s; p.data.engaged = 0.2; }
    else if (s.role === 'civ') { /* ignore */ }
  },
  onDeath(p, src, game) { game.events.emit('gangKilled', { ped: p, src }); },
};

export const allyBrain = gangBrain;
void chase;
