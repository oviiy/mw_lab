import { TILE } from '../config.js';
import { TRAFFIC_TABLE, VEHICLES } from '../data/vehicles.js';
import { civilianLook } from '../entities/pedLooks.js';
import { civBrain } from './ai/civBrain.js';
import { findPath } from '../world/roadnet.js';
import { clamp, wrapAngle, dist } from '../core/math.js';
import { rand } from '../core/rng.js';

const lanePt = (n, e, off) => ({ nx: -e.dy, ny: e.dx, off });

// Follows the road graph in the right-hand lane; also drives pursuits (mode 'chase')
// and panicked flight (mode 'flee'). Writes only `vehicle.controls`.
export class RoadDriver {
  constructor(world, edgeFrom, edge) {
    this.world = world; this.from = edgeFrom; this.edge = edge; this.next = null; this.mode = 'cruise'; this.target = null;
    this.cruise = rand.range(150, 215); this.blockT = 0; this.reverseT = 0; this.stuckT = 0; this.fleeT = 0; this.direct = false; this.losT = 0; this.ignoreT = 0; this.lastDecision = null; this.patience = rand.range(1.2, 3);
    this.reckless = false;
  }

  get to() { return this.world.nodes[this.edge.to]; }

  // After manual driving / being knocked off the road: find a sensible edge again.
  reacquire(v) {
    const w = this.world; let best = null, bd = 1e18;
    for (const n of w.nodes) {
      if ((n.x - v.x) ** 2 + (n.y - v.y) ** 2 > 420 * 420) continue;
      for (const e of n.edges) {
        const m = w.nodes[e.to], dx = m.x - n.x, dy = m.y - n.y, L = e.len, t = clamp(((v.x - n.x) * dx + (v.y - n.y) * dy) / (L * L), 0, 1);
        const px = n.x + dx * t, py = n.y + dy * t, d = (px - v.x) ** 2 + (py - v.y) ** 2;
        const align = Math.cos(v.angle) * e.dx + Math.sin(v.angle) * e.dy;
        const score = d + (align < 0 ? 4000 : 0) - align * 200;
        if (score < bd) { bd = score; best = { from: n, e }; }
      }
    }
    if (best) { this.from = best.from; this.edge = best.e; this.next = null; }
  }

  chooseNext(v, game) {
    const w = this.world, B = this.to, back = this.from.id, opts = B.edges.filter((e) => e.to !== back);
    if (!opts.length) return B.edges[0];
    if (this.route && this.route.length) {
      while (this.route.length && this.route[0] === B.id) this.route.shift();
      let want = this.route[0], e = B.edges.find((q) => q.to === want);
      if (!e) { // knocked off course: re-plan from here to the next waypoint
        const path = findPath(this.world, B.id, want); if (path.length > 1) { this.route = path.slice(1).concat(this.route.slice(1)); want = this.route[0]; e = B.edges.find((q) => q.to === want); }
      }
      if (e) return e;
    }
    if (this.mode === 'chase' && this.target) {
      let best = null, bd = 1e18;
      for (const e of opts) { const m = w.nodes[e.to], d = dist(m.x, m.y, this.target.x, this.target.y) - (e.dx * this.edge.dx + e.dy * this.edge.dy > 0.8 ? 30 : 0); if (d < bd) { bd = d; best = e; } }
      return best;
    }
    const straight = opts.find((e) => e.dx * this.edge.dx + e.dy * this.edge.dy > 0.9);
    if (this.mode === 'flee') return rand.pick(opts);
    return straight && rand.chance(0.58) ? straight : rand.pick(opts);
  }

  forwardBlock(v, game) {
    const sp = Math.max(0, v.fw), range = 34 + sp * 0.62 + v.def.len * 0.5, ca = Math.cos(v.angle), sa = Math.sin(v.angle), hw = v.def.wid / 2 + 6;
    let best = 999;
    const near = game.entities.near(v.x + ca * range * 0.5, v.y + sa * range * 0.5, range * 0.6 + 24, v._near2 || (v._near2 = []));
    for (const e of near) {
      if (e === v || e.removed || (e.kind === 'ped' && (e.dead || e.vehicle))) continue;
      const dx = e.x - v.x, dy = e.y - v.y, fx = dx * ca + dy * sa, fy = -dx * sa + dy * ca, r = e.kind === 'vehicle' ? e.def.wid / 2 : e.r + 2;
      if (fx > v.def.len * 0.3 && fx < range + v.def.len * 0.4 && Math.abs(fy) < hw + r - 3) best = Math.min(best, fx - v.def.len * 0.4);
    }
    return best;
  }

  update(v, dt, game) {
    const w = this.world, c = v.controls, e = this.edge, A = this.from, B = this.to; if (!e || !B) { this.reacquire(v); return; }
    this.ignoreT = Math.max(0, this.ignoreT - dt);
    if (this.mode === 'flee') { this.fleeT -= dt; if (this.fleeT <= 0) this.mode = 'cruise'; }
    // chase: cut across when the target is close and visible
    let direct = false, desired = 0, targetSpeed = this.mode === 'flee' ? v.def.max * 0.9 : this.mode === 'race' ? v.def.max * 0.88 * (this.speedMul || 1) : this.cruise;
    if (this.mode === 'chase' && this.target) {
      const t = this.target, d = dist(v.x, v.y, t.x, t.y);
      this.losT -= dt; if (this.losT <= 0) { this.losT = 0.25; this.los = d < 520 && game.world.lineClear(v.x, v.y, t.x, t.y); }
      targetSpeed = v.def.max * (this.aggressive ?? 0.82);
      if (this.los && d < 520) { direct = true; const tv = t.vehicle || t; desired = Math.atan2(t.y + (tv.vy || 0) * 0.45 - v.y, t.x + (tv.vx || 0) * 0.45 - v.x); targetSpeed = v.def.max * 0.97; }
    }
    if (direct) { this.direct = true; }
    else {
      if (this.direct) { this.direct = false; this.reacquire(v); }
      const dx = v.x - A.x, dy = v.y - A.y, s = dx * e.dx + dy * e.dy, lat = -dx * e.dy + dy * e.dx;
      const off = e.w * TILE * 0.25, remaining = e.len - s, L = 58 + Math.abs(v.fw) * 0.26;
      if (remaining < 120 && !this.next) this.next = this.chooseNext(v, game);
      let tx, ty;
      if (remaining > L || !this.next) {
        const sa = Math.min(s + L, e.len); tx = A.x + e.dx * sa + -e.dy * off; ty = A.y + e.dy * sa + e.dx * off;
      } else {
        const n2 = this.next, rest = L - remaining; tx = B.x + n2.dx * rest + -n2.dy * (n2.w * TILE * 0.25); ty = B.y + n2.dy * rest + n2.dx * (n2.w * TILE * 0.25);
        const turn = Math.abs(e.dx * n2.dy - e.dy * n2.dx) > 0.5; if (turn && remaining < 110) targetSpeed = Math.min(targetSpeed, 120);
      }
      desired = Math.atan2(ty - v.y, tx - v.x);
      if (remaining < 6 && this.next) { this.from = B; this.edge = this.next; this.next = null; }
      if (Math.abs(lat - off) > 95 && Math.abs(v.fw) > 20) { this.stuckT += dt; if (this.stuckT > 2.5) { this.reacquire(v); this.stuckT = 0; } } else this.stuckT = Math.max(0, this.stuckT - dt);
    }
    // obstacles
    let block = this.forwardBlock(v, game);
    if (block < 999 && !(direct && this.reckless)) {
      this.blockT += dt;
      if (this.blockT > this.patience + 2.4 && this.ignoreT <= 0) { this.ignoreT = 1.4; v.horn = 0.35; this.blockT = 0; }
      if (this.blockT > 5.5) { this.reverseT = 0.8; this.blockT = 0; }
    } else this.blockT = Math.max(0, this.blockT - dt * 2);
    if (this.ignoreT > 0 || (direct && this.reckless)) block = 999;
    if (this.mode === 'race' && block > 30 + Math.max(0, v.fw) * 0.2) block = 999;            // racers only brake for what they'd actually hit
    if (block < 999) targetSpeed = block < 18 ? 0 : targetSpeed * clamp(block / 130, 0.05, 0.7);
    // actuate
    const sp = v.fw, steer = clamp(wrapAngle(desired - v.angle) * 2.6, -1, 1);
    if (this.reverseT > 0) { this.reverseT -= dt; c.thr = -1; c.steer = -steer; c.brake = 0; c.hb = false; return; }
    c.steer = steer; c.hb = false; c.brake = 0;
    if (targetSpeed <= 0 && sp > 12) { c.thr = 0; c.brake = 1; } else if (sp < targetSpeed - 14) c.thr = 1; else if (sp > targetSpeed + 38) { c.thr = 0; c.brake = 0.5; } else c.thr = 0.12;
    if (targetSpeed <= 0 && sp <= 12) { c.thr = 0; c.brake = 0.6; }
    // stuck while trying to move → back up
    if (Math.abs(sp) < 14 && c.thr > 0 && block > 40) { this.stuckMove = (this.stuckMove || 0) + dt; if (this.stuckMove > 1.3) { this.reverseT = 0.9; this.stuckMove = 0; } } else this.stuckMove = 0;
  }

  onCrash(v, imp) { if (imp > 140 && this.mode === 'cruise' && v.driver && v.driver.role === 'civ') { this.mode = 'flee'; this.fleeT = 5; } }
  onShotAt(v, src) { if (v.driver && v.driver.role === 'civ') { this.mode = 'flee'; this.fleeT = 9; } }
  panic(sec = 8) { if (this.mode !== 'chase') { this.mode = 'flee'; this.fleeT = sec; } }
}

// Keeps the streets populated near the player.
export class TrafficSystem {
  constructor(game) { this.game = game; this.timer = 0; this.parkedTimer = 0; this.placed = false; }

  density() {
    const h = this.game.clock.hour, night = h < 5 || h > 23 ? 0.5 : h > 20 ? 0.8 : 1;
    return Math.round(13 * night);
  }

  pickEdge(px, py, min, max) {
    const w = this.game.world, nodes = w.nodes;
    for (let tr = 0; tr < 24; tr++) {
      const n = nodes[(rand.next() * nodes.length) | 0], d = dist(n.x, n.y, px, py); if (d > max + 200) continue;
      const e = n.edges[(rand.next() * n.edges.length) | 0], m = nodes[e.to], t = rand.range(0.1, 0.9);
      const x = n.x + (m.x - n.x) * t + -e.dy * e.w * TILE * 0.25, y = n.y + (m.y - n.y) * t + e.dx * e.w * TILE * 0.25, dd = dist(x, y, px, py);
      if (dd < min || dd > max) continue;
      if (this.game.entities.nearest(x, y, 56, (q) => q.kind === 'vehicle')) continue;
      return { n, e, x, y };
    }
    return null;
  }

  spawnCivilian(px, py, min, max) {
    const game = this.game, pick = this.pickEdge(px, py, min, max); if (!pick) return null;
    if (game.world.tileAtPx(pick.x, pick.y) !== 1) return null;
    const type = rand.weighted(TRAFFIC_TABLE), ang = Math.atan2(pick.e.dy, pick.e.dx);
    const drv = new RoadDriver(game.world, pick.n, pick.e);
    const v = game.vehicles.spawn(type, pick.x, pick.y, ang, { ai: drv, speed: 120 });
    game.vehicles.seatNew(v, { role: 'civ', look: civilianLook(type === 'taxi' ? 'biz' : 'walker'), brain: civBrain });
    if (type === 'minibus' || type === 'bus') drv.cruise *= 0.85;
    return v;
  }

  spawnParked(px, py, min, max) {
    const game = this.game, w = game.world;
    for (let tr = 0; tr < 18; tr++) {
      const a = rand.range(0, 6.28), d = rand.range(min, max), x = px + Math.cos(a) * d, y = py + Math.sin(a) * d;
      const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE); if (w.tileAt(tx, ty) !== 1) continue;
      // roadside: need sidewalk within 2 tiles perpendicular
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (w.tileAt(tx + dx, ty + dy) === 2 && w.tileAt(tx + dx * 2, ty + dy * 2) !== 1 === false) { /* no-op */ }
        if (w.tileAt(tx + dx, ty + dy) === 2) {
          const ang = Math.atan2(dy, dx) + Math.PI / 2 + (rand.chance(0.5) ? Math.PI : 0), px2 = (tx + 0.5 - dx * 0.0) * TILE + dx * 6, py2 = (ty + 0.5) * TILE + dy * 6;
          if (game.entities.nearest(px2, py2, 70, (q) => q.kind === 'vehicle')) continue;
          const type = rand.weighted(TRAFFIC_TABLE.filter(([k]) => !VEHICLES[k].bike || rand.chance(0.5)));
          return game.vehicles.spawn(type, px2, py2, ang, { parked: true, locked: rand.chance(0.7) });
        }
      }
    }
    return null;
  }

  update(dt) {
    const game = this.game, p = game.player; if (!p) return;
    const px = p.x, py = p.y;
    this.timer -= dt; this.parkedTimer -= dt;
    // despawn far / dead vehicles (keep mission cars)
    for (const v of game.entities.vehicles) {
      if (v.removed || v.tag || v === p.vehicle || v.owner === 'player') continue;
      const d = dist(v.x, v.y, px, py);
      if (d > 1250 || (v.dead && d > 700)) { if (v.driver) v.driver.removed = true; v.removed = true; }
    }
    if (this.timer <= 0) {
      this.timer = 0.25;
      let civ = 0, parked = 0;
      for (const v of game.entities.vehicles) { if (v.removed || v.dead) continue; if (v.ai && v.ai instanceof RoadDriver && v.driver && v.driver.role === 'civ') civ++; else if (v.parked && !v.tag) parked++; }
      const cap = this.density();
      if (civ < cap) this.spawnCivilian(px, py, game.viewRadius() + 60, 1050);
      if (this.parkedTimer <= 0 && parked < 14) { this.parkedTimer = 0.6; this.spawnParked(px, py, game.viewRadius() * 0.55, 1000); }
    }
  }

  // First fill: spawn lots immediately near the start point, including on-screen.
  prime() {
    const p = this.game.player;
    for (let i = 0; i < 9; i++) this.spawnCivilian(p.x, p.y, 260, 1000);
    for (let i = 0; i < 9; i++) this.spawnParked(p.x, p.y, 120, 900);
  }
}
void lanePt;
