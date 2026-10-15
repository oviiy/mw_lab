import { engage, chase } from './engage.js';
import { moveToward, stop, pickWanderPoint, unstick } from './steering.js';
import { dist } from '../../core/math.js';
import { rand } from '../../core/rng.js';

// Officers: patrol quietly at level 0, hunt the player when wanted, cuff when close.
export const copBrain = {
  update(p, dt, game) {
    const w = game.wanted, pl = game.player, d = p.data; d.st = d.st || {};
    const level = game.wantedLevel | 0;
    if (!pl || pl.dead) { stop(p); return; }
    if (level === 0 && p.state !== 'respond') return this.patrol(p, dt, game);
    if (p.state === 'respond' && level === 0) return this.respond(p, dt, game);
    // hunting
    const dd = dist(p.x, p.y, pl.x, pl.y);
    p.state = 'hunt';
    const heavy = level >= 3 || p.role === 'swat';
    const armedOk = level >= 2 || pl.isArmed && game.wanted && game.wanted.playerShot;
    if (pl.vehicle && dd < 40 && Math.abs(pl.vehicle.fw) < 60) { /* box the player in */ }
    if (armedOk) engage(p, pl, dt, game, { min: heavy ? 110 : 80, max: heavy ? 260 : 190, acc: p.role === 'swat' ? 0.09 : 0.16, reaction: 0.55, fire: p.weaponDef.range * 0.8 });
    else { chase(p, pl, game, dt, true); p.intent.aim = Math.atan2(pl.y - p.y, pl.x - p.x); }   // 1★: no guns, just run you down
    // arrest
    if (!pl.vehicle && dd < 24 && !pl.dead) { d.arrestT = (d.arrestT || 0) + dt; if (d.arrestT > 1.4 && game.wanted) game.wanted.bust(p); } else d.arrestT = Math.max(0, (d.arrestT || 0) - dt * 2);
    // melee swing when adjacent and unarmed intent
    if (dd < 28 && p.weapon === 'fists') game.combat.fire(p);
  },
  patrol(p, dt, game) {
    const d = p.data;
    if (!d.goal || p.stateT > 25) { d.goal = pickWanderPoint(game.world, p, 120, 360); p.stateT = 0; if (!d.goal) { stop(p); return; } }
    if (moveToward(p, d.goal.x, d.goal.y, false, 10) || unstick(p, dt, d.st)) { d.goal = null; d.st.stuck = 0; stop(p); }
  },
  respond(p, dt, game) {
    const at = p.data.respondAt; if (!at) { p.state = 'idle'; return; }
    if (moveToward(p, at.x, at.y, true, 30) || p.stateT > 14) { p.state = 'idle'; p.stateT = 0; p.data.goal = null; }
  },
  onDeath(p, src, game) { game.events.emit('copKilled', { ped: p, src }); },
};
