import { moveToward, stop } from './steering.js';
import { dist, wrapAngle } from '../../core/math.js';
import { rand } from '../../core/rng.js';
import { isEnemy } from '../../data/factions.js';
import { WEAPONS } from '../../data/weapons.js';

// Shared combat behaviour for armed NPCs (gangsters, cops, SWAT).
export function relation(p, t) {
  // returns true if p wants to hurt t
  if (!t || t.dead || t.removed || t === p) return false;
  if (p.data && p.data.enemy && t === p.data.enemy) return true;
  if (p.role === 'gang' || p.role === 'boss') {
    if (t.role === 'player') return isEnemy(p.faction, 'jade') || p.hostileToPlayer;
    if (t.role === 'gang' || t.role === 'boss') return isEnemy(p.faction, t.faction);
    return false;
  }
  if (p.role === 'ally') return t.role === 'gang' || t.role === 'boss' ? isEnemy('jade', t.faction) : false;
  return false;
}

export function findTarget(p, game, range = 240) {
  let best = null, bd = range * range;
  const near = game.entities.near(p.x, p.y, range, p._tg || (p._tg = []), (e) => e.kind === 'ped' && !e.dead && !e.vehicle);
  for (const e of near) {
    if (!relation(p, e)) continue;
    const d = (e.x - p.x) ** 2 + (e.y - p.y) ** 2; if (d >= bd) continue;
    if (!game.world.lineClear(p.x, p.y, e.x, e.y)) continue;
    bd = d; best = e;
  }
  const pl = game.player;
  if (pl && pl.vehicle && relation(p, pl) && dist(p.x, p.y, pl.x, pl.y) < range && game.world.lineClear(p.x, p.y, pl.x, pl.y) && (pl.x - p.x) ** 2 + (pl.y - p.y) ** 2 < bd) best = pl;
  return best;
}

// Move/aim/fire at a target. cfg: { min, max, fire, acc, reaction, speed }
export function engage(p, t, dt, game, cfg) {
  const w = WEAPONS[p.weapon], it = p.intent, d = dist(p.x, p.y, t.x, t.y), ang = Math.atan2(t.y - p.y, t.x - p.x);
  p.data.losT = (p.data.losT ?? 0) - dt; if (p.data.losT <= 0) { p.data.losT = 0.18; p.data.los = game.world.lineClear(p.x, p.y, t.x, t.y); }
  const los = p.data.los;
  const sway = Math.sin(game.time * 3 + p.id * 1.7) * (cfg.acc ?? 0.12);
  it.aim = ang + sway; it.run = d > (cfg.max ?? 200) + 60;
  if (w.type === 'melee' || p.weapon === 'fists') {
    if (d > 26) { chase(p, t, game, dt, true); } else { stop(p); it.aim = ang; if (p.stateT > (cfg.reaction ?? 0.3)) game.combat.fire(p); }
    return d;
  }
  if (!los) chase(p, t, game, dt, d > 120);
  else if (d > (cfg.max ?? 200)) moveToward(p, t.x, t.y, true, 4);
  else if (d < (cfg.min ?? 90)) { it.mx = -Math.cos(ang); it.my = -Math.sin(ang); it.run = false; }
  else {
    p.data.strafeT = (p.data.strafeT ?? 0) - dt; if (p.data.strafeT <= 0) { p.data.strafeT = rand.range(0.8, 2.2); p.data.strafe = rand.chance(0.5) ? 1 : -1; if (rand.chance(0.25)) p.data.strafe = 0; }
    const s = p.data.strafe || 0; it.mx = -Math.sin(ang) * s * 0.7; it.my = Math.cos(ang) * s * 0.7; it.run = false;
  }
  if (los && d < (cfg.fire ?? w.range * 0.85) && p.data.engaged > (cfg.reaction ?? 0.35)) game.combat.fire(p);
  p.data.engaged = (p.data.engaged || 0) + dt;
  return d;
}

// Route toward a target around buildings. Uses the shared flow field when the target is the player.
export function chase(p, t, game, dt, run = true) {
  const nav = game.nav, it = p.intent;
  if (t === game.player && nav && nav.foot.age < 1.2) {
    const d = nav.foot.dir(p.x, p.y);
    if (d && (d.x || d.y)) { it.mx = d.x; it.my = d.y; it.run = run; return; }
  }
  if (game.world.lineClear(p.x, p.y, t.x, t.y)) moveToward(p, t.x, t.y, run, 4);
  else moveToward(p, t.x, t.y, run, 4);
}

export const faceAway = (a, b) => wrapAngle(Math.atan2(a.y - b.y, a.x - b.x));
