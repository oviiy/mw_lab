import { TILE } from '../config.js';
import { T } from './tiles.js';

// Builds a directed graph from the road centre-lines: nodes sit at every
// crossing, edges join consecutive crossings along a road. Traffic AI walks it;
// the renderer uses `arms` to paint crosswalks.
export function buildRoadNet(world) {
  const nodes = [], byKey = new Map();
  const H = world.roads.filter((r) => r.axis === 'h'), V = world.roads.filter((r) => r.axis === 'v');
  const nodeAt = (x, y) => {
    const k = Math.round(x / 8) * 100000 + Math.round(y / 8);
    let n = byKey.get(k); if (!n) { n = { id: nodes.length, x, y, edges: [] }; nodes.push(n); byKey.set(k, n); } return n;
  };
  for (const h of H) for (const v of V) {
    const x = v.pos, y = h.pos;
    if (x < h.a || x > h.b || y < v.a || y > v.b) continue;
    if (world.tileAtPx(x, y) !== T.ROAD) continue;
    nodeAt(x, y);
  }
  const clear = (x0, y0, x1, y1) => {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 16);
    for (let i = 0; i <= n; i++) { const t = i / n; if (world.tileAtPx(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t) !== T.ROAD) return false; }
    return true;
  };
  const link = (a, b, road) => {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    if (len < 1 || !clear(a.x, a.y, b.x, b.y)) return;
    a.edges.push({ to: b.id, len, dx: dx / len, dy: dy / len, w: road.w, level: road.level });
    b.edges.push({ to: a.id, len, dx: -dx / len, dy: -dy / len, w: road.w, level: road.level });
  };
  for (const h of H) {
    const on = nodes.filter((n) => Math.abs(n.y - h.pos) < 2 && n.x >= h.a - 1 && n.x <= h.b + 1).sort((p, q) => p.x - q.x);
    for (let i = 0; i + 1 < on.length; i++) link(on[i], on[i + 1], h);
  }
  for (const v of V) {
    const on = nodes.filter((n) => Math.abs(n.x - v.pos) < 2 && n.y >= v.a - 1 && n.y <= v.b + 1).sort((p, q) => p.y - q.y);
    for (let i = 0; i + 1 < on.length; i++) link(on[i], on[i + 1], v);
  }
  // drop orphans and compact ids
  const kept = nodes.filter((n) => n.edges.length);
  const newId = new Map(kept.map((n, i) => [n.id, i]));
  for (const n of kept) for (const e of n.edges) e.to = newId.get(e.to);
  kept.forEach((n, i) => { n.id = i; });
  world.nodes = kept;
  return kept;
}

// Nearest graph node to a pixel position (linear scan: the graph is small).
export function nearestNode(world, x, y) {
  let best = null, bd = 1e18;
  for (const n of world.nodes) { const d = (n.x - x) ** 2 + (n.y - y) ** 2; if (d < bd) { bd = d; best = n; } }
  return best;
}

// Shortest path (by length) between two node ids. Returns the node id list incl. both ends, or [].
export function findPath(world, from, to) {
  if (from === to) return [from];
  const n = world.nodes.length, dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), done = new Uint8Array(n);
  dist[from] = 0;
  for (let it = 0; it < n; it++) {
    let u = -1, best = Infinity; for (let i = 0; i < n; i++) if (!done[i] && dist[i] < best) { best = dist[i]; u = i; }
    if (u < 0 || u === to) break; done[u] = 1;
    for (const e of world.nodes[u].edges) { const nd = dist[u] + e.len; if (nd < dist[e.to]) { dist[e.to] = nd; prev[e.to] = u; } }
  }
  if (prev[to] < 0) return [];
  const path = []; for (let v = to; v >= 0; v = prev[v]) path.push(v); return path.reverse();
}
