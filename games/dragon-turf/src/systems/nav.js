import { TILE } from '../config.js';
import { T } from '../world/tiles.js';

// Flow fields: breadth-first distance maps seeded at a target so any number of
// chasers can find a route around buildings by walking "downhill".
const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];

export class FlowField {
  constructor(world, mode = 'foot') {
    this.world = world; this.mode = mode; const n = world.W * world.H;
    this.dist = new Uint16Array(n); this.stamp = new Uint32Array(n); this.cur = 0; this.queue = new Int32Array(n);
    this.ox = -1; this.oy = -1; this.age = 99;
  }
  passable(tx, ty) {
    const w = this.world; if (!w.inBounds(tx, ty)) return false;
    const t = w.ground[ty * w.W + tx];
    return this.mode === 'car' ? t === T.ROAD : (t !== T.WATER && t !== T.BUILDING && !w.solid[ty * w.W + tx]);
  }
  compute(x, y, maxSteps = 110) {
    const w = this.world; let tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
    if (!this.passable(tx, ty)) { // snap to nearest passable tile
      let found = false;
      for (let r = 1; r < 8 && !found; r++) for (let dy = -r; dy <= r && !found; dy++) for (let dx = -r; dx <= r; dx++) if (this.passable(tx + dx, ty + dy)) { tx += dx; ty += dy; found = true; break; }
      if (!found) return false;
    }
    this.cur++; this.ox = tx; this.oy = ty; this.age = 0;
    let head = 0, tail = 0; const q = this.queue, st = this.stamp, d = this.dist, W = w.W;
    const start = ty * W + tx; st[start] = this.cur; d[start] = 0; q[tail++] = start;
    while (head < tail) {
      const i = q[head++], cx = i % W, cy = (i / W) | 0, cd = d[i]; if (cd >= maxSteps) continue;
      for (const [dx, dy] of N8) {
        const nx = cx + dx, ny = cy + dy; if (!this.passable(nx, ny)) continue;
        if (dx && dy && (!this.passable(cx + dx, cy) || !this.passable(cx, cy + dy))) continue;
        const ni = ny * W + nx; if (st[ni] === this.cur) continue; st[ni] = this.cur; d[ni] = cd + 1; q[tail++] = ni;
      }
    }
    return true;
  }
  at(tx, ty) { const w = this.world; if (!w.inBounds(tx, ty)) return 65535; const i = ty * w.W + tx; return this.stamp[i] === this.cur ? this.dist[i] : 65535; }
  // Unit direction from (x,y) toward the target by descending the field; null if off-field.
  dir(x, y) {
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE), here = this.at(tx, ty); let best = here, bx = 0, by = 0;
    for (const [dx, dy] of N8) {
      if (!this.passable(tx + dx, ty + dy)) continue; if (dx && dy && (!this.passable(tx + dx, ty) || !this.passable(tx, ty + dy))) continue;
      const v = this.at(tx + dx, ty + dy) + (dx && dy ? 0.4 : 0); if (v < best) { best = v; bx = dx; by = dy; }
    }
    if (!bx && !by) return here === 65535 ? null : { x: 0, y: 0, d: here };
    // aim for the centre of the chosen tile for smooth movement
    const cx = (tx + bx + 0.5) * TILE - x, cy = (ty + by + 0.5) * TILE - y, l = Math.hypot(cx, cy) || 1;
    return { x: cx / l, y: cy / l, d: here };
  }
}

// Shared fields toward the player (foot + road). Refreshed a few times a second.
export class NavSystem {
  constructor(game) { this.game = game; this.foot = new FlowField(game.world, 'foot'); this.car = new FlowField(game.world, 'car'); this.t = 0; this.wanted = false; }
  update(dt) {
    const p = this.game.player; if (!p || p.dead) return;
    this.t -= dt; this.foot.age += dt;
    if (this.t <= 0) { this.t = 0.35; this.foot.compute(p.x, p.y, 120); if (this.wanted) this.car.compute(p.x, p.y, 160); }
  }
}
