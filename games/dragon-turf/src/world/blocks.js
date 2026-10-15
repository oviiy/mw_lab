import { TILE } from '../config.js';
import { T } from './tiles.js';
import { ARCH, LOT_MIX, BLOCK_MIX } from './archetypes.js';
import { DISTRICTS } from './districts.js';
import { placeBuilding } from './buildings.js';

// Stage 2: turn every BSP block into sidewalks + a district-flavoured interior.

export function fillBlocks(world, rng) {
  for (const b of world.blocks) {
    const { x0, y0, x1, y1, district } = b;
    world.fillRect(x0, y0, x1, y1, T.SIDEWALK);
    const core = { x: x0 + 1, y: y0 + 1, w: x1 - x0 - 2, h: y1 - y0 - 2 };
    if (core.w < 4 || core.h < 4) continue;
    b.core = core;
    const kind = rng.weighted(BLOCK_MIX[district]);
    // A block already hosting a temple elsewhere shouldn't get a second one nearby — keep them rare.
    const k = kind === 'temple' && (core.w < 13 || core.h < 14 || world.templeCount >= 4) ? 'lots' : kind;
    b.kind = k;
    ({ lots: genLots, market: genMarket, park: genPark, temple: genTemple, court: genCourt, plaza: genPlaza, lot: genParkingLot, containers: genContainers })[k](world, rng, core, district, b);
  }
}

/* ---------------- row-of-lots layout (the default) ---------------- */
function genLots(world, rng, core, district) {
  world.fillRect(core.x, core.y, core.x + core.w, core.y + core.h, T.ALLEY);
  const alleyW = district === 'chinatown' ? 2 : 1;
  let bands;
  if (core.h >= 13) { const d1 = Math.floor((core.h - alleyW) / 2); bands = [{ x: core.x, y: core.y, w: core.w, h: d1 }, { x: core.x, y: core.y + d1 + alleyW, w: core.w, h: core.h - d1 - alleyW }]; }
  else bands = [{ ...core }];
  for (const band of bands) lotRow(world, rng, band, district);
}

function lotRow(world, rng, band, district) {
  const mix = LOT_MIX[district];
  let cx = band.x; const end = band.x + band.w;
  let guard = 0, prevColor = null;
  while (end - cx >= 3 && guard++ < 40) {
    // only archetypes that actually fit what's left of this band (depth may squeeze by 2)
    const fit = mix.filter(([k]) => ARCH[k].w[0] <= end - cx && ARCH[k].d[0] - 2 <= band.h);
    if (!fit.length) { cx++; continue; }
    const key = rng.weighted(fit), a = ARCH[key];
    let w = rng.int(a.w[0], Math.min(a.w[1], end - cx));
    const rest = end - cx - w - a.gap;
    if (rest > 0 && rest < 3) w = Math.min(a.w[1] + 2, end - cx);   // don't leave slivers
    const dMax = Math.min(a.d[1], band.h), dMin = Math.min(Math.max(2, a.d[0] - 2), dMax);
    const d = rng.int(dMin, dMax);
    const b = placeBuilding(world, rng, key, cx, band.y + band.h - d, w, d, district);
    if (prevColor && b.wall === prevColor) b.wall = DISTRICTS[district].walls[(Math.random() * DISTRICTS[district].walls.length) | 0];
    prevColor = b.wall;
    cx += w + a.gap;
  }
}

/* ---------------- special blocks ---------------- */
function genMarket(world, rng, core, district) {
  world.fillRect(core.x, core.y, core.x + core.w, core.y + core.h, T.PLAZA);
  world.marketBlocks = (world.marketBlocks || []).concat([core]);
  // two-wide stalls in rows with two-tile aisles
  for (let y = core.y + 1; y + 2 <= core.y + core.h - 1; y += 4) {
    for (let x = core.x + 1; x + 2 <= core.x + core.w - 1; x += 3) {
      if (rng.chance(0.18)) continue;
      const b = placeBuilding(world, rng, 'stall', x, y, 2, 2, district, { wall: rng.pick(['#e2a93b', '#c8453b', '#4a9b6e', '#3f7fbf', '#d6577a']), roof: rng.pick(['#e8d7b0', '#c8453b', '#e2a93b', '#4a9b6e', '#3f7fbf']) });
      b.stall = true;
    }
  }
  world.spawns.crowd = (world.spawns.crowd || []).concat([{ x: (core.x + core.w / 2) * TILE, y: (core.y + core.h / 2) * TILE, r: Math.min(core.w, core.h) * TILE * 0.5 }]);
}

function genPark(world, rng, core, district) {
  world.fillRect(core.x, core.y, core.x + core.w, core.y + core.h, T.PARK);
  const cx = core.x + core.w / 2, cy = core.y + core.h / 2;
  // cross paths
  world.fillRect(core.x, Math.floor(cy) - 1, core.x + core.w, Math.floor(cy) + 1, T.PLAZA);
  world.fillRect(Math.floor(cx) - 1, core.y, Math.floor(cx) + 1, core.y + core.h, T.PLAZA);
  // pond (water tiles are impassable) in one quadrant
  if (core.w >= 8 && core.h >= 8) {
    const pw = Math.min(5, core.w / 3 | 0), ph = Math.min(4, core.h / 3 | 0), px = core.x + 2, py = core.y + 2;
    world.fillRect(px, py, px + pw, py + ph, T.WATER); world.solidRect(px, py, px + pw, py + ph, 0);
    world.ponds = (world.ponds || []).concat([{ x: px, y: py, w: pw, h: ph }]);
  }
  const n = Math.floor(core.w * core.h / 11);
  for (let i = 0; i < n; i++) {
    const tx = rng.range(core.x + 1, core.x + core.w - 1), ty = rng.range(core.y + 1, core.y + core.h - 1);
    if (Math.abs(tx - cx) < 1.6 || Math.abs(ty - cy) < 1.6) continue;
    if (world.tileAt(Math.floor(tx), Math.floor(ty)) !== T.PARK) continue;
    world.addProp({ type: 'tree', x: tx * TILE, y: ty * TILE, r: 6, size: rng.range(0.85, 1.35), seed: rng.int(1, 9999), hue: rng.range(0, 1) });
  }
  if (core.w >= 9 && core.h >= 9) {
    world.addProp({ type: 'bench', x: cx * TILE + 28, y: cy * TILE - 22, r: 0, rot: 0 }); world.addProp({ type: 'bench', x: cx * TILE - 28, y: cy * TILE + 22, r: 0, rot: Math.PI });
    world.spawns.tai.push({ x: (core.x + core.w - 3) * TILE, y: (core.y + core.h - 3) * TILE });
  }
  if (core.w >= 11 && core.h >= 11 && rng.chance(0.6)) {
    placeBuilding(world, rng, 'pavilion', core.x + core.w - 6, core.y + 2, 4, 4, district);
  }
}

function genTemple(world, rng, core, district) {
  world.templeCount = (world.templeCount || 0) + 1;
  world.fillRect(core.x, core.y, core.x + core.w, core.y + core.h, T.COURT);
  const cx = core.x + (core.w >> 1);
  const hall = placeBuilding(world, rng, 'temple', core.x + 2, core.y, core.w - 4, 5, district, { wall: '#c8453b', roof: '#2c7a6b', floors: 3, tag: 'temple' });
  hall.sign = { text: '廟', color: '#ffd23a', vertical: true }; hall.neon = '#ffd23a'; hall.big = true;
  placeBuilding(world, rng, 'hall', core.x, core.y + 4, 3, 6, district, { wall: '#c8453b', roof: '#2c7a6b', floors: 2 });
  placeBuilding(world, rng, 'hall', core.x + core.w - 3, core.y + 4, 3, 6, district, { wall: '#c8453b', roof: '#2c7a6b', floors: 2 });
  const y0 = (core.y + 6) * TILE;
  world.addProp({ type: 'incense', x: (cx + 0.5) * TILE, y: y0 + 40, r: 10 });
  world.addProp({ type: 'lion', x: (cx - 2) * TILE, y: (core.y + core.h - 1.5) * TILE, r: 9 }); world.addProp({ type: 'lion', x: (cx + 3) * TILE, y: (core.y + core.h - 1.5) * TILE, r: 9, flip: true });
  world.addProp({ type: 'lantern_post', x: (cx - 3) * TILE, y: (core.y + core.h - 3) * TILE, r: 4 }); world.addProp({ type: 'lantern_post', x: (cx + 4) * TILE, y: (core.y + core.h - 3) * TILE, r: 4 });
  world.addProp({ type: 'tree', x: (core.x + 2) * TILE, y: (core.y + core.h - 3) * TILE, r: 6, size: 1.2, seed: rng.int(1, 999), hue: 0.2 });
  world.addProp({ type: 'tree', x: (core.x + core.w - 2) * TILE, y: (core.y + core.h - 3) * TILE, r: 6, size: 1.2, seed: rng.int(1, 999), hue: 0.4 });
  world.spawns.temple = (world.spawns.temple || []).concat([{ x: (cx + 0.5) * TILE, y: (core.y + 9) * TILE }]);
}

function genCourt(world, rng, core) {
  world.fillRect(core.x, core.y, core.x + core.w, core.y + core.h, T.COURT);
  const cx = (core.x + core.w / 2) * TILE, cy = (core.y + core.h / 2) * TILE;
  world.addProp({ type: 'tree', x: cx, y: cy, r: 7, size: 1.5, seed: rng.int(1, 999), hue: rng.range(0, 1) });
  world.addProp({ type: 'bench', x: cx - 40, y: cy + 20, rot: 0, r: 0 }); world.addProp({ type: 'bench', x: cx + 40, y: cy + 20, rot: 0, r: 0 });
  for (let i = 0; i < 3; i++) world.addProp({ type: 'planter', x: (core.x + rng.range(1, core.w - 1)) * TILE, y: (core.y + rng.range(1, core.h - 1)) * TILE, r: 8 });
  world.spawns.crowd = (world.spawns.crowd || []).concat([{ x: cx, y: cy, r: 90 }]);
}

function genPlaza(world, rng, core) {
  world.fillRect(core.x, core.y, core.x + core.w, core.y + core.h, T.PLAZA);
  const cx = (core.x + core.w / 2) * TILE, cy = (core.y + core.h / 2) * TILE;
  world.addProp({ type: 'fountain', x: cx, y: cy, r: 30 });
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; world.addProp({ type: 'planter', x: cx + Math.cos(a) * 80, y: cy + Math.sin(a) * 80, r: 8 }); }
  world.spawns.crowd = (world.spawns.crowd || []).concat([{ x: cx, y: cy, r: 110 }]);
}

function genParkingLot(world, rng, core) {
  world.fillRect(core.x, core.y, core.x + core.w, core.y + core.h, T.LOT);
  // parked cars in bays (stored as spawn points)
  for (let x = core.x + 1; x + 2 <= core.x + core.w - 1; x += 3) for (const row of [core.y + 1, core.y + core.h - 3]) {
    if (rng.chance(0.55)) world.spawns.parked.push({ x: (x + 1) * TILE, y: (row + 1) * TILE, a: Math.PI / 2 * (row === core.y + 1 ? 1 : 3) });
  }
}

function genContainers(world, rng, core, district) {
  world.fillRect(core.x, core.y, core.x + core.w, core.y + core.h, T.DOCK);
  const COL = ['#c8453b', '#2a6fb0', '#e0a233', '#3c8c6a', '#7a4a8a', '#d9d4c4', '#b86a2a'];
  for (let y = core.y + 1; y + 2 <= core.y + core.h - 1; y += 4) {
    for (let x = core.x + 1; x + 4 <= core.x + core.w - 1; x += 6) {
      if (rng.chance(0.25)) continue;
      const stack = rng.int(1, 3);
      placeBuilding(world, rng, 'container', x, y, 4, 2, district, { wall: rng.pick(COL), roof: rng.pick(COL), floors: stack, px: stack * 9 });
    }
  }
  world.spawns.crates = (world.spawns.crates || []).concat([{ x: (core.x + core.w / 2) * TILE, y: (core.y + core.h / 2) * TILE }]);
}
