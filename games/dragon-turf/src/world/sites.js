import { TILE } from '../config.js';
import { T, isWater } from './tiles.js';
import { placeBuilding } from './buildings.js';

// Special sites carved out of whole city blocks after the blocks are filled:
//   airfield (runway + hangar + plane + heli) · army depot (tank, armour)
//   downtown helipad · marina boats beside the piers.
// Each site records its vehicles in world.vehicleSpawns for the SiteSystem.

function clearBlock(world, core) {
  const keep = [];
  for (const b of world.buildings) {
    const hit = b.x < core.x + core.w && b.x + b.w > core.x && b.y < core.y + core.h && b.y + b.d > core.y;
    if (hit) world.solidRect(b.x, b.y, b.x + b.w, b.y + b.d, 0); else keep.push(b);
  }
  keep.forEach((b, i) => { b.id = i; }); world.buildings = keep;
  world.fillRect(core.x, core.y, core.x + core.w, core.y + core.h, T.LOT);
  world.solidRect(core.x, core.y, core.x + core.w, core.y + core.h, 0);
}

export function placeSites(world, rng) {
  world.sites = []; world.vehicleSpawns = [];
  const px = (t) => t * TILE;
  const blocks = world.blocks.filter((b) => b.core);
  const used = new Set();
  const pick = (pred, score) => { let best = null, bs = -Infinity; for (const b of blocks) { if (used.has(b) || !pred(b)) continue; const s = score(b); if (s > bs) { bs = s; best = b; } } if (best) used.add(best); return best; };
  const DISTRICT = (b) => b.district;

  // ---- airfield: the longest industrial / waterfront block ----
  const af = pick((b) => (DISTRICT(b) === 'industrial' || DISTRICT(b) === 'waterfront') && Math.max(b.core.w, b.core.h) >= 16 && Math.min(b.core.w, b.core.h) >= 9, (b) => (DISTRICT(b) === 'waterfront' ? 40 : 0) - Math.abs(Math.max(b.core.w, b.core.h) - 22) - Math.min(b.core.w, b.core.h) * 0.5);
  if (af) {
    const c = af.core; clearBlock(world, c); af.kind = 'airfield';
    const horiz = c.w >= c.h, run = horiz ? { x: c.x + 1, y: c.y + 1, w: c.w - 2, h: 4 } : { x: c.x + 1, y: c.y + 1, w: 4, h: c.h - 2 };
    const site = { kind: 'airfield', name: 'Fort Jade Airbase', rect: { x: px(c.x), y: px(c.y), w: px(c.w), h: px(c.h) }, runway: { x: px(run.x), y: px(run.y), w: px(run.w), h: px(run.h), horiz } };
    // hangar in the leftover strip
    const rest = horiz ? { x: c.x + 1, y: c.y + 6, w: c.w - 2, h: c.h - 7 } : { x: c.x + 6, y: c.y + 1, w: c.w - 7, h: c.h - 2 };
    if (rest.w >= 8 && rest.h >= 6) {
      const hw = Math.min(12, rest.w - 6), hd = Math.min(7, rest.h);
      const hx = horiz ? rest.x + rest.w - hw : rest.x, hy = horiz ? rest.y + rest.h - hd : rest.y + rest.h - hd;
      const b = placeBuilding(world, rng, 'warehouse', hx, hy, hw, hd, af.district, { floors: 2, wall: '#c9c2b0', roof: '#7f8a94' });
      b.sign = { text: 'AIR 航空', color: '#37e6ff', vertical: false }; b.neon = '#37e6ff';
      site.pad = horiz ? { x: px(rest.x + 4), y: px(rest.y + Math.min(rest.h, 6) / 2) } : { x: px(rest.x + Math.min(rest.w, 6) / 2), y: px(rest.y + 4) };
    } else site.pad = horiz ? { x: px(c.x + c.w - 4), y: px(c.y + c.h - 2) } : { x: px(c.x + c.w - 2), y: px(c.y + c.h - 4) };
    world.sites.push(site);
    const a = horiz ? 0 : Math.PI / 2;
    world.vehicleSpawns.push({ type: 'plane', x: site.runway.x + (horiz ? 70 : site.runway.w / 2), y: site.runway.y + (horiz ? site.runway.h / 2 : 70), angle: a, site: 'airfield', heat: 1 });
    world.vehicleSpawns.push({ type: 'heli', x: site.pad.x, y: site.pad.y, angle: a, site: 'airfield', heat: 1 });
  }

  // ---- army depot: tank yard inside the airbase (keeps the industrial district intact) ----
  if (af) {
    const site = world.sites.find((q) => q.kind === 'airfield'), r = site.runway, horiz = r.horiz;
    const ty = horiz ? { x: r.x + r.w * 0.45, y: r.y + r.h + 140 } : { x: r.x + r.w + 140, y: r.y + r.h * 0.45 };
    world.vehicleSpawns.push({ type: 'tank', x: ty.x, y: ty.y, angle: horiz ? 0 : Math.PI / 2, site: 'depot', heat: 2 });
    world.vehicleSpawns.push({ type: 'armored', x: ty.x + (horiz ? 110 : 0), y: ty.y + (horiz ? 0 : 110), angle: horiz ? 0 : Math.PI / 2, site: 'depot', heat: 1 });
    site.crates = [];
    for (let i = 0; i < 4; i++) site.crates.push({ x: ty.x - 40 + (i % 2) * 22, y: ty.y + 60 + Math.floor(i / 2) * 22 });
    world.sites.push({ kind: 'depot', name: 'Tank Yard', pad: ty });
  }

  // ---- downtown helipad (a plaza or the biggest downtown block's corner) ----
  const hp = pick((b) => DISTRICT(b) === 'downtown' && b.kind === 'plaza', (b) => b.core.w * b.core.h);
  if (hp) {
    const c = hp.core, site = { kind: 'helipad', name: 'Neon Heights Helipad', pad: { x: px(c.x + c.w / 2), y: px(c.y + c.h / 2) } };
    world.sites.push(site); world.vehicleSpawns.push({ type: 'heli', x: site.pad.x, y: site.pad.y, angle: -Math.PI / 2, site: 'helipad', heat: 1, color: '#1f1f28' });
  }
}

// Boats beside piers (needs piers, runs after carvePiers + scatter).
export function placeMarina(world) {
  let n = 0;
  for (const bt of world.boats) {
    if (n >= 4) break;
    const p = bt.pier; if (!p) continue;
    for (const side of [1, -1]) {
      const tx = side > 0 ? p.x + p.w + 1 : p.x - 2, ty = p.y + Math.floor(p.len * 0.55);
      let ok = true; for (let dy = -2; dy <= 2; dy++) for (let dx = -1; dx <= 1; dx++) if (!isWater(world.tileAt(tx + dx, ty + dy))) ok = false;
      if (!ok) continue;
      world.vehicleSpawns.push({ type: n % 3 === 2 ? 'junk' : 'speedboat', x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE, angle: Math.PI / 2, site: 'marina', heat: 0 });
      n++; bt.taken = true; break;
    }
  }
  if (n) world.sites.push({ kind: 'marina', name: 'Harbor Marina', pad: { x: world.vehicleSpawns.find((s) => s.site === 'marina').x, y: world.vehicleSpawns.find((s) => s.site === 'marina').y } });
}

// Props scattered into a site would block the runway / tank.
export function purgeSiteProps(world) {
  const rects = world.sites.filter((s) => s.rect).map((s) => s.rect);
  if (!rects.length) return;
  const inside = (p) => rects.some((r) => p.x > r.x - 8 && p.x < r.x + r.w + 8 && p.y > r.y - 8 && p.y < r.y + r.h + 8);
  world.props = world.props.filter((p) => !inside(p) || p.type === 'lamp');
  world.lanterns = world.lanterns.filter((l) => !inside({ x: (l.x0 + l.x1) / 2, y: (l.y0 + l.y1) / 2 }));
  world.rebuildPropHash();
  // depot dressing: crates are breakable loot boxes
  for (const s of world.sites) if (s.crates) for (const c of s.crates) world.addProp({ type: 'crate', x: c.x, y: c.y, r: 8, rot: 0.2, seed: 7 });
}
