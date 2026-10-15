import { TILE } from '../config.js';
import { T } from './tiles.js';
import { DISTRICT_LIST } from './districts.js';

// same hash as render/ground.js decals so steam rises from the painted manholes
function hash2(x, y, s = 0) { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; h = h ^ (h >>> 16); return ((h >>> 0) % 100000) / 100000; }

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// Stage 3: street furniture, lantern lines, gates and alley clutter.
export function scatterProps(world, rng) {
  const { W, H } = world;
  const g = (x, y) => world.tileAt(x, y);
  const lampGrid = new Map();
  const lampOk = (px, py) => {
    const cx = Math.floor(px / 160), cy = Math.floor(py / 160);
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const a = lampGrid.get((cx + i) * 4096 + cy + j); if (a) for (const l of a) if (Math.hypot(l.x - px, l.y - py) < 150) return false; }
    return true;
  };
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const t = g(x, y);
    if (t === T.ROAD && hash2(x, y, 101) < 0.012 && (world.districtAt(x, y) === 0 || world.districtAt(x, y) === 3 || world.districtAt(x, y) === 2)) world.steam.push({ x: (x + 0.5) * TILE, y: (y + 0.5) * TILE });
    if (t === T.SIDEWALK) {
      let nx = 0, ny = 0;
      for (const [dx, dy] of N4) if (g(x + dx, y + dy) === T.ROAD) { nx += dx; ny += dy; }
      if (!nx && !ny) continue;
      const hash = (x * 73856093 ^ y * 19349663) >>> 0;
      const dKey = DISTRICT_LIST[world.districtAt(x, y)];
      if (hash % 9 === 0) {
        const px = (x + 0.5) * TILE + Math.sign(nx) * 9, py = (y + 0.5) * TILE + Math.sign(ny) * 9;
        if (lampOk(px, py)) {
          const l = { type: 'lamp', x: px, y: py, r: 3.5, dir: Math.atan2(ny, nx) };
          world.addProp(l); const k = Math.floor(px / 160) * 4096 + Math.floor(py / 160); (lampGrid.get(k) || lampGrid.set(k, []).get(k)).push(l);
        }
      } else if (hash % 23 === 1 && (dKey === 'downtown' || dKey === 'temple' || dKey === 'waterfront' || dKey === 'old')) {
        world.addProp({ type: dKey === 'downtown' ? 'planter' : 'tree', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, r: dKey === 'downtown' ? 8 : 6, size: 0.9 + (hash % 5) * 0.08, seed: hash % 997, hue: (hash % 7) / 7 });
      } else if (hash % 97 === 2) world.addProp({ type: 'hydrant', x: (x + 0.5) * TILE + Math.sign(nx) * 8, y: (y + 0.5) * TILE + Math.sign(ny) * 8, r: 0 });
      else if (hash % 47 === 4 && dKey === 'chinatown') { const cart = { type: 'cart', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, r: 11, seed: hash % 997 }; world.addProp(cart); world.steam.push({ x: cart.x, y: cart.y - 14, cart: true }); }
      else if (hash % 113 === 3) world.addProp({ type: 'bin', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, r: 6 });
    } else if (t === T.ALLEY) {
      const hash = (x * 2654435761 ^ y * 40503) >>> 0;
      let nearB = false; for (const [dx, dy] of N4) if (g(x + dx, y + dy) === T.BUILDING) nearB = true;
      if (nearB && hash % 14 === 0) {
        const kinds = ['dumpster', 'crate', 'barrel', 'bin', 'crate'], k = kinds[hash % kinds.length];
        world.addProp({ type: k, x: (x + 0.5) * TILE + ((hash >> 3) % 9) - 4, y: (y + 0.5) * TILE + ((hash >> 5) % 9) - 4, r: k === 'dumpster' ? 11 : 8, rot: (hash % 4) * Math.PI / 2, seed: hash % 997 });
      }
      if (nearB && hash % 29 === 5) world.spawns.dealers.push({ x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, d: world.districtAt(x, y) });
    } else if (t === T.DOCK) {
      const hash = (x * 1103515245 ^ y * 12345) >>> 0;
      let nearW = false; for (const [dx, dy] of N4) if (g(x + dx, y + dy) === T.WATER) nearW = true;
      if (nearW && hash % 5 === 0) world.addProp({ type: 'bollard', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, r: 4 });
      else if (!nearW && hash % 61 === 7) world.addProp({ type: 'crate', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, r: 8, rot: 0, seed: hash % 997 });
    }
  }

  // Moored boats beside the piers + a pair of container ships in the bay.
  const BOAT = ['#c8453b', '#2a6fb0', '#e0a233', '#3c8c6a', '#e8e4d8'];
  for (const b of world.boats) {
    const p = b.pier, side = rng.chance(0.5) ? 1 : -1, tx = side > 0 ? p.x + p.w + 2 : p.x - 3, ty = p.y + 1 + Math.floor(rng.range(0, p.len - 4));
    if (g(tx, ty) !== T.WATER) continue;
    world.addProp({ type: 'boat', x: (tx + 0.5) * TILE + side * 12, y: ty * TILE, r: 0, rot: Math.PI / 2 * (rng.chance(0.5) ? 1 : -1) * 0 + (rng.range(-0.25, 0.25)), seed: rng.int(1, 999), color: rng.pick(BOAT) });
  }
  for (let k = 0; k < 2; k++) { const x = (world.W * (0.28 + k * 0.42)) * TILE, y = (world.H - 5.5) * TILE; world.addProp({ type: 'ship', x, y, r: 0, len: 520 + k * 80, seed: 30 + k * 11 }); }

  // Lantern lines across narrow Chinatown streets.
  for (const r of world.roads) {
    if (r.w > 4 || r.level === 0) continue;
    const step = 10 * TILE;
    for (let s = r.a + step * 0.5; s < r.b - step * 0.3; s += step + rng.range(-32, 32)) {
      const x = r.axis === 'h' ? s : r.pos, y = r.axis === 'h' ? r.pos : s;
      if (world.districtAtPx(x, y) !== 0) continue;
      const half = (r.w * TILE) / 2 + 14;
      const l = r.axis === 'h' ? { x0: x, y0: y - half, x1: x, y1: y + half } : { x0: x - half, y0: y, x1: x + half, y1: y };
      // skip if it would span an intersection
      if (world.tileAtPx(x, y) !== T.ROAD) continue;
      l.n = Math.round((half * 2) / 26); l.seed = rng.int(1, 9999); l.color = rng.chance(0.75) ? '#e23b2e' : '#ffcc33';
      world.lanterns.push(l);
    }
  }

  // Paifang gates where major roads enter Dragon Gate.
  const gates = [];
  for (const r of world.roads) {
    if (r.level > 2) continue;
    let prev = -1;
    for (let s = r.a; s <= r.b; s += TILE) {
      const x = r.axis === 'h' ? s : r.pos, y = r.axis === 'h' ? r.pos : s;
      const d = world.districtAtPx(x, y);
      if (prev !== 0 && d === 0 && world.tileAtPx(x, y) === T.ROAD && gates.every((q) => Math.hypot(q.x - x, q.y - y) > 300)) gates.push({ type: 'paifang', x, y, axis: r.axis, span: r.w * TILE });
      prev = d;
    }
  }
  for (const g2 of gates.slice(0, 5)) {
    world.addProp(g2);
    const half = g2.span / 2 + 8;
    if (g2.axis === 'h') { world.addProp({ type: 'pillar', x: g2.x, y: g2.y - half, r: 8 }); world.addProp({ type: 'pillar', x: g2.x, y: g2.y + half, r: 8 }); }
    else { world.addProp({ type: 'pillar', x: g2.x - half, y: g2.y, r: 8 }); world.addProp({ type: 'pillar', x: g2.x + half, y: g2.y, r: 8 }); }
  }
  world.gates = gates;
}
