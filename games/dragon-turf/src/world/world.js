import { TILE } from '../config.js';
import { T, isWater } from './tiles.js';
import { clamp } from '../core/math.js';

// Static world data + spatial queries. Generation fills it (see generate.js);
// everything dynamic (people, cars, bullets) lives in the entity manager.
export class World {
  constructor(W, H) {
    this.W = W; this.H = H; this.pxW = W * TILE; this.pxH = H * TILE;
    this.ground = new Uint8Array(W * H);          // T.* codes
    this.district = new Uint8Array(W * H);        // district id per tile
    this.turfMap = new Int8Array(W * H).fill(-1); // turf id per tile (-1: none)
    this.solid = new Uint8Array(W * H);           // 1 = impassable static geometry
    this.buildings = []; this.roads = []; this.blocks = []; this.props = [];
    this.nodes = []; this.pois = []; this.turfs = []; this.lanterns = []; this.lights = [];
    this.boats = []; this.steam = []; this.spawns = { parked: [], dealers: [], tai: [] };
    this.propHash = new Map();
    this.seed = 0;
  }

  idx(tx, ty) { return ty * this.W + tx; }
  inBounds(tx, ty) { return tx >= 0 && ty >= 0 && tx < this.W && ty < this.H; }
  tileAt(tx, ty) { return this.inBounds(tx, ty) ? this.ground[ty * this.W + tx] : T.WATER; }
  tileAtPx(x, y) { return this.tileAt(Math.floor(x / TILE), Math.floor(y / TILE)); }
  districtAt(tx, ty) { return this.inBounds(tx, ty) ? this.district[ty * this.W + tx] : 0; }
  districtAtPx(x, y) { return this.districtAt(Math.floor(x / TILE), Math.floor(y / TILE)); }
  turfAtPx(x, y) { const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE); return this.inBounds(tx, ty) ? this.turfMap[ty * this.W + tx] : -1; }
  isSolidTile(tx, ty) { return !this.inBounds(tx, ty) || this.solid[ty * this.W + tx] === 1; }
  isSolidPx(x, y) { return this.isSolidTile(Math.floor(x / TILE), Math.floor(y / TILE)); }

  setGround(tx, ty, t) { if (this.inBounds(tx, ty)) this.ground[ty * this.W + tx] = t; }
  fillRect(x0, y0, x1, y1, t, onlyIf) {
    for (let y = Math.max(0, y0); y < Math.min(this.H, y1); y++) for (let x = Math.max(0, x0); x < Math.min(this.W, x1); x++) {
      const i = y * this.W + x; if (!onlyIf || onlyIf(this.ground[i])) this.ground[i] = t;
    }
  }
  solidRect(x0, y0, x1, y1, v = 1) {
    for (let y = Math.max(0, y0); y < Math.min(this.H, y1); y++) for (let x = Math.max(0, x0); x < Math.min(this.W, x1); x++) this.solid[y * this.W + x] = v;
  }

  /* ---------- props with circle colliders ---------- */
  addProp(p) {
    this.props.push(p);
    if (p.r) { const k = this._key(Math.floor(p.x / 64), Math.floor(p.y / 64)); let a = this.propHash.get(k); if (!a) this.propHash.set(k, (a = [])); a.push(p); }
    return p;
  }
  _key(cx, cy) { return cx * 4096 + cy; }
  rebuildPropHash() { this.propHash.clear(); for (const p of this.props) if (p.r) { const k = this._key(Math.floor(p.x / 64), Math.floor(p.y / 64)); let a = this.propHash.get(k); if (!a) this.propHash.set(k, (a = [])); a.push(p); } }
  propsNear(x, y, r) {
    const out = [], c0x = Math.floor((x - r) / 64), c1x = Math.floor((x + r) / 64), c0y = Math.floor((y - r) / 64), c1y = Math.floor((y + r) / 64);
    for (let cy = c0y; cy <= c1y; cy++) for (let cx = c0x; cx <= c1x; cx++) { const a = this.propHash.get(this._key(cx, cy)); if (a) for (const p of a) if (!p.dead) out.push(p); }
    return out;
  }

  /* ---------- collision ---------- */
  // Pushes a circle out of solid tiles (and optionally props / water). Returns a
  // collision descriptor {nx, ny, depth} for the strongest contact, or null.
  resolveCircle(e, r, opts = {}) {
    let best = null;
    const tx0 = Math.floor((e.x - r) / TILE), tx1 = Math.floor((e.x + r) / TILE), ty0 = Math.floor((e.y - r) / TILE), ty1 = Math.floor((e.y + r) / TILE);
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const solid = opts.land ? !isWater(this.tileAt(tx, ty)) : this.isSolidTile(tx, ty) || (opts.water && isWater(this.tileAt(tx, ty)) && !this.nearPier(tx, ty));
      if (!solid) continue;
      const rx0 = tx * TILE, ry0 = ty * TILE, px = clamp(e.x, rx0, rx0 + TILE), py = clamp(e.y, ry0, ry0 + TILE);
      let dx = e.x - px, dy = e.y - py, d2 = dx * dx + dy * dy;
      if (d2 >= r * r) continue;
      let nx, ny, depth;
      if (d2 < 1e-6) { // centre inside the tile: push along the shortest axis
        const l = e.x - rx0, rr = rx0 + TILE - e.x, t = e.y - ry0, b = ry0 + TILE - e.y, m = Math.min(l, rr, t, b);
        if (m === l) { nx = -1; ny = 0; depth = r + l; } else if (m === rr) { nx = 1; ny = 0; depth = r + rr; } else if (m === t) { nx = 0; ny = -1; depth = r + t; } else { nx = 0; ny = 1; depth = r + b; }
      } else { const d = Math.sqrt(d2); nx = dx / d; ny = dy / d; depth = r - d; }
      e.x += nx * depth; e.y += ny * depth;
      if (!best || depth > best.depth) best = { nx, ny, depth };
    }
    if (opts.props !== false) {
      for (const p of this.propsNear(e.x, e.y, r + 24)) {
        const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy), m = r + p.r;
        if (d < m && d > 1e-4) { const nx = dx / d, ny = dy / d, depth = m - d; e.x += nx * depth; e.y += ny * depth; if (!best || depth > best.depth) best = { nx, ny, depth, prop: p }; }
      }
    }
    e.x = clamp(e.x, r, this.pxW - r); e.y = clamp(e.y, r, this.pxH - r);
    return best;
  }
  nearPier(tx, ty) { return this.ground[ty * this.W + tx] === T.PIER; }

  // Sampled line-of-sight against solid tiles.
  lineClear(x0, y0, x1, y1) {
    const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / (TILE * 0.5));
    for (let i = 1; i < n; i++) { const t = i / n; if (this.isSolidPx(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false; }
    return true;
  }

  // First solid tile hit along a segment (DDA over tiles). Returns {x, y, t} or null.
  raycastSolid(x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy); if (len < 1e-6) return null;
    let tx = Math.floor(x0 / TILE), ty = Math.floor(y0 / TILE);
    if (this.isSolidTile(tx, ty)) return { x: x0, y: y0, t: 0 };
    const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1;
    const tDx = dx !== 0 ? Math.abs(TILE / dx) : Infinity, tDy = dy !== 0 ? Math.abs(TILE / dy) : Infinity;
    let tMx = dx !== 0 ? ((dx > 0 ? (tx + 1) * TILE - x0 : x0 - tx * TILE) / Math.abs(dx)) : Infinity;
    let tMy = dy !== 0 ? ((dy > 0 ? (ty + 1) * TILE - y0 : y0 - ty * TILE) / Math.abs(dy)) : Infinity;
    for (let i = 0; i < 400; i++) {
      let t; if (tMx < tMy) { t = tMx; tMx += tDx; tx += sx; } else { t = tMy; tMy += tDy; ty += sy; }
      if (t > 1) return null;
      if (this.isSolidTile(tx, ty)) return { x: x0 + dx * t, y: y0 + dy * t, t };
    }
    return null;
  }

  randomTileOf(rng, pred, tries = 200) {
    for (let i = 0; i < tries; i++) { const tx = rng.int(1, this.W - 2), ty = rng.int(1, this.H - 2); if (pred(this.ground[ty * this.W + tx], tx, ty)) return { tx, ty }; }
    return null;
  }
}
