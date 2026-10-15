// Owns every dynamic entity, sweeps removed ones and keeps a coarse spatial hash
// (peds + vehicles) for cheap proximity queries.
const CELL = 128;

export class EntityManager {
  constructor(game) {
    this.game = game; this.nextId = 1;
    this.peds = []; this.vehicles = []; this.projectiles = []; this.pickups = []; this.misc = [];
    this.hash = new Map();
  }
  list(kind) { return kind === 'ped' ? this.peds : kind === 'vehicle' ? this.vehicles : kind === 'proj' ? this.projectiles : kind === 'pickup' ? this.pickups : this.misc; }
  add(e) { e.id = this.nextId++; this.list(e.kind).push(e); return e; }
  remove(e) { e.removed = true; }

  update(dt) {
    for (const arr of [this.peds, this.vehicles, this.projectiles, this.pickups, this.misc]) {
      for (let i = 0; i < arr.length; i++) { const e = arr[i]; if (!e.removed) e.update(dt, this.game); }
      let w = 0; for (let i = 0; i < arr.length; i++) { const e = arr[i]; if (e.removed) { if (e.onRemove) e.onRemove(this.game); } else arr[w++] = e; } arr.length = w;
    }
    this.rebuildHash();
  }

  rebuildHash() {
    this.hash.clear();
    const put = (e) => { const k = Math.floor(e.x / CELL) * 8192 + Math.floor(e.y / CELL); let a = this.hash.get(k); if (!a) this.hash.set(k, (a = [])); a.push(e); };
    for (const p of this.peds) if (!p.removed && !p.vehicle) put(p);
    for (const v of this.vehicles) if (!v.removed) put(v);
  }

  // Entities (peds and/or vehicles) whose centre lies within r of (x,y).
  near(x, y, r, out = [], filter = null) {
    out.length = 0;
    const c0x = Math.floor((x - r) / CELL), c1x = Math.floor((x + r) / CELL), c0y = Math.floor((y - r) / CELL), c1y = Math.floor((y + r) / CELL), r2 = r * r;
    for (let cy = c0y; cy <= c1y; cy++) for (let cx = c0x; cx <= c1x; cx++) {
      const a = this.hash.get(cx * 8192 + cy); if (!a) continue;
      for (const e of a) { const dx = e.x - x, dy = e.y - y; if (dx * dx + dy * dy <= r2 && (!filter || filter(e))) out.push(e); }
    }
    return out;
  }
  nearest(x, y, r, filter) {
    let best = null, bd = r * r; const tmp = this.near(x, y, r, [], filter);
    for (const e of tmp) { const d = (e.x - x) ** 2 + (e.y - y) ** 2; if (d < bd) { bd = d; best = e; } }
    return best;
  }
  clear() { for (const arr of [this.peds, this.vehicles, this.projectiles, this.pickups, this.misc]) arr.length = 0; this.hash.clear(); }
}
