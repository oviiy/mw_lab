import { TILE } from '../config.js';
import { T } from './tiles.js';
import { ARCH } from './archetypes.js';

// Turf = a named patch of the city a crew controls. Defined by seeds; every land
// tile belongs to the nearest seed. Ownership is mutable game state (see systems/turf.js).
const TURF_DEFS = [
  // name, seed tile x/y, starting owner
  ['Lantern Alley',      72, 60, 'dragon'],
  ['Night Market',       92, 76, 'lotus'],
  ['Jade Teahouse Row',  80, 98, 'jade'],
  ['Dragon Gate',       100, 56, 'dragon'],
  ['Neon Heights',       66, 28, 'tiger'],
  ['Glass District',     96, 24, 'dragon'],
  ['Westside Tenements', 36, 66, 'jade'],
  ['Tenement Row',       30, 98, 'none'],
  ['Harbor Row',         66, 120, 'lotus'],
  ['Smuggler\'s Pier',  104, 118, 'tiger'],
  ['Smokestack Yards',  138, 80, 'lotus'],
  ['Rust Lane',         134, 108, 'tiger'],
  ['Jade Hill',         138, 30, 'none'],
  ['Blossom Garden',     30, 30, 'none'],
];

export function placeTurfs(world, rng) {
  const { W, H } = world;
  world.turfs = TURF_DEFS.map(([name, x, y, owner], id) => ({
    id, name, sx: x, sy: y, cx: x * TILE, cy: y * TILE, owner, startOwner: owner, hideout: null, income: 0, defense: 0,
    district: world.districtAt(x, y), cleared: false, underAttack: false,
  }));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (world.ground[y * W + x] === T.WATER) continue;
    let best = -1, bd = 1e9;
    for (const t of world.turfs) { const d = Math.hypot(x - t.sx, y - t.sy); if (d < bd) { bd = d; best = t.id; } }
    world.turfMap[y * W + x] = best;
  }
  // choose a hideout building in every turf: biggest suitable footprint near the seed
  const suit = new Set(['warehouse', 'factory', 'tenement', 'tenement_cn', 'hotel', 'dojo', 'restaurant', 'office', 'seafood', 'garage']);
  for (const t of world.turfs) {
    let best = null, bs = -1;
    for (const b of world.buildings) {
      if (!suit.has(b.key) || b.tag) continue;
      if (world.turfMap[(b.y + (b.d >> 1)) * W + b.x + (b.w >> 1)] !== t.id) continue;
      const score = b.w * b.d - Math.hypot(b.x - t.sx, b.y - t.sy) * 0.8;
      if (score > bs) { bs = score; best = b; }
    }
    if (!best) { // no preferred archetype here: take the biggest ordinary building in the turf
      for (const b of world.buildings) {
        if (b.tag || ['stall', 'container', 'booth', 'hall', 'temple', 'pavilion'].includes(b.key) || b.w * b.d < 16) continue;
        if (world.turfMap[(b.y + (b.d >> 1)) * W + b.x + (b.w >> 1)] !== t.id) continue;
        const score = b.w * b.d - Math.hypot(b.x - t.sx, b.y - t.sy) * 0.8; if (score > bs) { bs = score; best = b; }
      }
    }
    if (best) {
      best.tag = 'hideout'; best.turfId = t.id; t.hideout = best.id; t.hx = (best.x + best.w / 2) * TILE; t.hy = (best.y + best.d) * TILE + 30; t.cx = t.hx; t.cy = t.hy;
    }
  }
  // spawn a few defenders' anchor points around each hideout
  for (const t of world.turfs) { t.anchors = []; if (t.hideout != null) for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; t.anchors.push({ x: t.hx + Math.cos(a) * 80, y: t.hy + 20 + Math.sin(a) * 50 }); } }
  void ARCH;
}
