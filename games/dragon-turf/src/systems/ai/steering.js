import { TILE } from '../../config.js';
import { T, isSidewalkish } from '../../world/tiles.js';
import { dist, wrapAngle } from '../../core/math.js';
import { rand } from '../../core/rng.js';

// Shared on-foot movement helpers for every brain.
export function moveToward(p, tx, ty, run = false, stopDist = 6) {
  const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
  if (d < stopDist) { p.intent.mx = p.intent.my = 0; return true; }
  p.intent.mx = dx / d; p.intent.my = dy / d; p.intent.run = run; return false;
}
export function stop(p) { p.intent.mx = p.intent.my = 0; p.intent.run = false; p.intent.fire = false; p.intent.aim = null; }

// Pick a random walkable point reachable in a straight line.
export function pickWanderPoint(world, p, minD = 120, maxD = 380, pred = null) {
  for (let i = 0; i < 12; i++) {
    const a = rand.range(0, 6.283), d = rand.range(minD, maxD), x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d;
    const t = world.tileAtPx(x, y);
    if (!isSidewalkish(t) || t === T.PIER || t === T.LOT && rand.chance(0.7)) continue;
    if (pred && !pred(x, y)) continue;
    if (!world.lineClear(p.x, p.y, x, y)) continue;
    return { x, y };
  }
  return null;
}

// Local obstacle nudge so walkers slide around corners instead of pinning.
export function unstick(p, dt, st) {
  const moved = dist(p.x, p.y, st.lx ?? p.x, st.ly ?? p.y); st.lt = (st.lt || 0) + dt;
  if (st.lt > 0.5) { st.stuck = (p.intent.mx || p.intent.my) && moved < 4 ? (st.stuck || 0) + 1 : 0; st.lx = p.x; st.ly = p.y; st.lt = 0; }
  return (st.stuck || 0) >= 3;
}

export const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
export const angDiff = (a, b) => wrapAngle(b - a);
export { TILE };
