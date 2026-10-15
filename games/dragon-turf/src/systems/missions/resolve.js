import { TILE } from '../../config.js';
import { T } from '../../world/tiles.js';
import { dist } from '../../core/math.js';
import { rand } from '../../core/rng.js';

// Turns mission-script position specs into world coordinates.
//   {x,y}                      literal
//   'poi:wei' | 'poi:chop'     contact id, or nearest POI of that type to the player
//   'turf:Lantern Alley'       the turf's hideout door
//   'gate:0'                   a paifang gate
//   'player'                   where the player is now
export function resolvePos(game, spec) {
  const w = game.world, p = game.player;
  if (!spec) return null;
  if (typeof spec === 'object') return { x: spec.x, y: spec.y };
  if (spec === 'player') return { x: p.x, y: p.y };
  const [kind, arg] = [spec.slice(0, spec.indexOf(':')), spec.slice(spec.indexOf(':') + 1)];
  if (kind === 'poi') {
    const byContact = w.pois.find((q) => q.contact === arg); if (byContact) return { x: byContact.x, y: byContact.y };
    let best = null, bd = 1e18; for (const q of w.pois) if (q.type === arg) { const d = dist(q.x, q.y, p.x, p.y); if (d < bd) { bd = d; best = q; } } return best ? { x: best.x, y: best.y } : null;
  }
  if (kind === 'building') { // nearest building of that archetype, at its door; 'hotel@Neon Heights' limits it to a turf
    const [key, turfName] = arg.split('@'), turf = turfName ? w.turfs.find((q) => q.name === turfName) : null;
    let best = null, bd = 1e18; for (const b of w.buildings) if (b.key === key && !b.tag && (!turf || w.turfMap[(b.y + (b.d >> 1)) * w.W + b.x + (b.w >> 1)] === turf.id)) { const d = dist((b.x + b.w / 2) * TILE, (b.y + b.d) * TILE, p.x, p.y); if (d < bd) { bd = d; best = b; } }
    if (!best && turf) return resolvePos(game, 'building:' + key);
    if (!best) { for (const b of w.buildings) if (b.key === key) { const d = dist((b.x + b.w / 2) * TILE, (b.y + b.d) * TILE, p.x, p.y); if (d < bd) { bd = d; best = b; } } }
    return best ? { x: (best.x + best.w / 2) * TILE, y: (best.y + best.d) * TILE + 20 } : null;
  }
  if (kind === 'turf') { const t = w.turfs.find((q) => q.name === arg); return t ? { x: t.hx ?? t.cx, y: t.hy ?? t.cy } : null; }
  if (kind === 'site') { // 'site:airfield' · 'site:depot' · 'site:marina:2' (n-th marina berth)
    const [k, i] = arg.split(':');
    if (i !== undefined) { const list = (w.vehicleSpawns || []).filter((q) => q.site === k); const q = list[(+i) % Math.max(1, list.length)]; if (q) return { x: q.x, y: q.y }; }
    const s = (w.sites || []).find((q) => q.kind === k); if (!s) return null;
    return s.runway ? { x: s.runway.x + s.runway.w / 2, y: s.runway.y + s.runway.h / 2 } : { x: s.pad.x, y: s.pad.y };
  }
  if (kind === 'gate') { const g = w.gates[+arg % w.gates.length]; return g ? { x: g.x, y: g.y } : null; }
  return null;
}

// A drivable spot (and heading) near a point — for spawning mission cars.
export function roadSpotNear(game, x, y, radius = 220) {
  const w = game.world; let best = null, bd = 1e18;
  for (const n of w.nodes) for (const e of n.edges) {
    const m = w.nodes[e.to]; if (n.id > m.id) continue;
    for (let t = 0.1; t < 0.9; t += 0.2) {
      const px = n.x + (m.x - n.x) * t + -e.dy * e.w * TILE * 0.25, py = n.y + (m.y - n.y) * t + e.dx * e.w * TILE * 0.25, d = dist(px, py, x, y);
      if (d < bd && d < radius && !game.entities.nearest(px, py, 60, (q) => q.kind === 'vehicle')) { bd = d; best = { x: px, y: py, angle: Math.atan2(e.dy, e.dx) }; }
    }
  }
  return best;
}

export function freeSpotNear(game, x, y, r = 120, walkable = true) {
  const w = game.world;
  for (let i = 0; i < 30; i++) {
    const a = rand.range(0, 6.283), d = rand.range(20, r), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d, t = w.tileAtPx(px, py);
    if (!walkable || (t !== T.WATER && t !== T.BUILDING && !w.isSolidPx(px, py))) return { x: px, y: py };
  }
  return { x, y };
}

// Distinct shop doors (shophouse buildings) inside the named turfs.
export function pickShops(game, n, turfNames) {
  const w = game.world, ids = new Set(w.turfs.filter((t) => turfNames.includes(t.name)).map((t) => t.id)), out = [];
  const list = w.buildings.filter((b) => (b.key === 'shophouse' || b.key === 'pawn' || b.key === 'restaurant') && ids.has(w.turfMap[(b.y + (b.d >> 1)) * w.W + b.x + (b.w >> 1)]) && !b.tag);
  rand.shuffle(list);
  for (const b of list) { const x = (b.x + b.w / 2) * TILE, y = (b.y + b.d) * TILE + 16; if (out.every((o) => dist(o.x, o.y, x, y) > 180)) out.push({ x, y, b }); if (out.length >= n) break; }
  return out;
}
