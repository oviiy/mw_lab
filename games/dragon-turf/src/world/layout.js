import { TILE } from '../config.js';
import { T } from './tiles.js';
import { DISTRICTS, DISTRICT_SEEDS, DISTRICT_LIST } from './districts.js';
import { makeNoise, fbm } from '../core/noise.js';

// Stage 1 of generation: coastline, districts, then a BSP carve of roads/blocks.
// Roads are recorded as centre-line segments (px) so the road graph and the
// renderer's lane markings share one source of truth.

export function carveCoast(world, rng, seed) {
  const noise = makeNoise(seed + 11), { W, H } = world;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const edge = Math.min(x - 5, W - 6 - x, y - 5, H - 19 - y);
    const n = (fbm(noise, x * 0.08, y * 0.08, 3) - 0.5) * 7;
    world.ground[y * W + x] = edge + n > 0 ? T.DOCK : T.WATER;
  }
}

export function assignDistricts(world) {
  const { W, H } = world;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let best = 0, bd = 1e9;
    for (let i = 0; i < DISTRICT_SEEDS.length; i++) {
      const s = DISTRICT_SEEDS[i], d = Math.hypot(x - s.x, y - s.y) / s.w;
      if (d < bd) { bd = d; best = i; }
    }
    world.district[y * W + x] = DISTRICTS[DISTRICT_SEEDS[best].key].id;
  }
}

function districtOfRect(world, r) {
  return DISTRICT_LIST[world.districtAt((r.x0 + r.x1) >> 1, (r.y0 + r.y1) >> 1)];
}

function addRoad(world, axis, c, a, b, w, level) {
  world.roads.push({ axis, pos: c * TILE, a: a * TILE, b: b * TILE, w, level });
}

// Paint a vertical/horizontal road strip; returns nothing.
function paintRoad(world, axis, start, w, a, b) {
  if (axis === 'v') world.fillRect(start, a, start + w, b, T.ROAD);
  else world.fillRect(a, start, b, start + w, T.ROAD);
}

export function carveRoads(world, rng) {
  const BSP = { x0: 18, y0: 18, x1: world.W - 18, y1: world.H - 32 };
  // ring road around the whole built-up area
  const R = 5;
  paintRoad(world, 'h', BSP.y0 - R, R, BSP.x0 - R, BSP.x1 + R); paintRoad(world, 'h', BSP.y1, R, BSP.x0 - R, BSP.x1 + R);
  paintRoad(world, 'v', BSP.x0 - R, R, BSP.y0 - R, BSP.y1 + R); paintRoad(world, 'v', BSP.x1, R, BSP.y0 - R, BSP.y1 + R);
  addRoad(world, 'h', BSP.y0 - R / 2, BSP.x0 - R / 2, BSP.x1 + R / 2, R, 0);
  addRoad(world, 'h', BSP.y1 + R / 2, BSP.x0 - R / 2, BSP.x1 + R / 2, R, 0);
  addRoad(world, 'v', BSP.x0 - R / 2, BSP.y0 - R / 2, BSP.y1 + R / 2, R, 0);
  addRoad(world, 'v', BSP.x1 + R / 2, BSP.y0 - R / 2, BSP.y1 + R / 2, R, 0);
  world.bspRect = BSP;

  const blocks = world.blocks;
  const split = (r, depth) => {
    const key = districtOfRect(world, r), cfg = DISTRICTS[key];
    const w = r.x1 - r.x0, h = r.y1 - r.y0, maxB = cfg.maxBlock, minB = cfg.minBlock;
    const wantSplit = (w > maxB * 1.28 || h > maxB * 1.28);
    if (!wantSplit || depth > 7) { blocks.push({ ...r, district: key }); return; }
    let vertical = w > h * 1.08 ? true : h > w * 1.08 ? false : rng.chance(0.5);
    const tryAxis = (vert) => {
      const len = vert ? w : h;
      const rw = depth <= 1 ? 7 : depth === 2 ? Math.max(5, rng.pick(cfg.roads)) : rng.pick(cfg.roads);
      if (len < minB * 2 + rw) return false;
      const lo = minB + rw / 2, hi = len - minB - rw / 2;
      const pos = lo + (hi - lo) * (0.5 + rng.gauss() * 0.28);
      const p = Math.round(clampN(pos, lo, hi));
      const start = (vert ? r.x0 : r.y0) + p - Math.floor(rw / 2);
      if (vert) {
        paintRoad(world, 'v', start, rw, r.y0, r.y1); addRoad(world, 'v', start + rw / 2, r.y0 - 3, r.y1 + 3, rw, depth + 1);
        split({ x0: r.x0, y0: r.y0, x1: start, y1: r.y1 }, depth + 1); split({ x0: start + rw, y0: r.y0, x1: r.x1, y1: r.y1 }, depth + 1);
      } else {
        paintRoad(world, 'h', start, rw, r.x0, r.x1); addRoad(world, 'h', start + rw / 2, r.x0 - 3, r.x1 + 3, rw, depth + 1);
        split({ x0: r.x0, y0: r.y0, x1: r.x1, y1: start }, depth + 1); split({ x0: r.x0, y0: start + rw, x1: r.x1, y1: r.y1 }, depth + 1);
      }
      return true;
    };
    if (!tryAxis(vertical) && !tryAxis(!vertical)) blocks.push({ ...r, district: key });
  };
  split({ x0: BSP.x0, y0: BSP.y0, x1: BSP.x1, y1: BSP.y1 }, 0);
}
const clampN = (v, a, b) => (v < a ? a : v > b ? b : v);

// Quay, piers and the harbour road at the bottom of the map.
export function carvePiers(world, rng) {
  const { W, H } = world, BSP = world.bspRect;
  // find the shoreline per column and push piers out from it
  const count = 9;
  for (let i = 0; i < count; i++) {
    const x = Math.round(BSP.x0 + 4 + (i + 0.5) * ((BSP.x1 - BSP.x0 - 8) / count)) + rng.int(-2, 2);
    let y = BSP.y1 + 6; while (y < H - 2 && world.ground[y * W + x] !== T.WATER) y++;
    const len = rng.int(9, 16), w = rng.chance(0.35) ? 5 : 4;
    world.fillRect(x, y - 2, x + w, y + len, T.PIER, (t) => t === T.WATER || t === T.DOCK);
    world.boats.push({ x: (x + w / 2) * TILE, y: (y + len * 0.5) * TILE, pier: { x, y, w, len } });
  }
}
