import { G } from './state.js';
import { B, N, W, LANE, DIRS, clamp, rand, pick, wrapAngle, dist } from './util.js';
import { Car, stepCar, carPairs, syncCar } from './vehicles.js';
import { VD } from './viaduct.js';
import { signalState } from './signals.js';

const L = LANE;
const laneOf = (dir, I, J) => {
  const cx = I * B, cz = J * B;
  return dir === 0 ? { x: 0, z: cz + L } : dir === 2 ? { x: 0, z: cz - L } : dir === 1 ? { x: cx - L, z: 0 } : { x: cx + L, z: 0 };
};

// Distance to (and index of) the next junction centre along the car's lane direction.
function junctionAhead(c) {
  const d = c.dir;
  if (d === 0) { const cx = Math.ceil((c.x + 0.01) / B) * B; return { ds: cx - c.x, I: cx / B, J: Math.round(c.z / B) }; }
  if (d === 2) { const cx = Math.floor((c.x - 0.01) / B) * B; return { ds: c.x - cx, I: cx / B, J: Math.round(c.z / B) }; }
  if (d === 1) { const cz = Math.ceil((c.z + 0.01) / B) * B; return { ds: cz - c.z, J: cz / B, I: Math.round(c.x / B) }; }
  const cz = Math.floor((c.z - 0.01) / B) * B; return { ds: c.z - cz, J: cz / B, I: Math.round(c.x / B) };
}

export class Traffic {
  constructor() { this.cars = []; this.spawnT = 0; }

  create(type, x, z, a, color) { const c = new Car(type, x, z, a, color); this.cars.push(c); return c; }
  remove(i) { this.cars[i].dispose(); this.cars.splice(i, 1); }

  nearest(x, z, r = 5) {
    let best = null, bd = r;
    for (const c of this.cars) { if (c.dead || c.y > 1.5) continue; const d = dist(c.x, c.z, x, z) - c.def.len * 0.25; if (d < bd) { bd = d; best = c; } }
    return best;
  }

  /* ---- spawning on roads, outside the view ---- */
  spawn(kind, initial = false) {
    const p = G.player, near = initial ? 40 : 170;
    for (let tr = 0; tr < 16; tr++) {
      const ang = Math.random() * Math.PI * 2, d = initial ? rand(40, 330) : rand(near, 360);
      let x = p.x + Math.cos(ang) * d, z = p.z + Math.sin(ang) * d;
      if (x < 5 || x > W - 5 || z < 5 || z > W - 5) continue;
      if (dist(x, z, p.x, p.z) < (initial ? 25 : near)) continue;
      const horiz = Math.random() < 0.5; let dir;
      if (horiz) {
        const j = Math.round(z / B); if (j < 0 || j > N) continue;
        if (Math.abs(x - Math.round(x / B) * B) < 26) continue;
        dir = Math.random() < 0.5 ? 0 : 2; z = j * B + (kind === 'park' ? (Math.random() < 0.5 ? 8.6 : -8.6) : (dir === 0 ? L : -L));
      } else {
        const i = Math.round(x / B); if (i < 0 || i > N) continue;
        if (Math.abs(z - Math.round(z / B) * B) < 26) continue;
        dir = Math.random() < 0.5 ? 1 : 3; x = i * B + (kind === 'park' ? (Math.random() < 0.5 ? 8.6 : -8.6) : (dir === 1 ? -L : L));
      }
      if (this.cars.some((c) => Math.abs(c.x - x) < 11 && Math.abs(c.z - z) < 11)) continue;
      let type;
      if (kind === 'cop') type = 'cop';
      else { const r = Math.random(); type = r < 0.5 ? 'sedan' : r < 0.62 ? 'sport' : r < 0.72 ? 'taxi' : r < 0.85 ? 'van' : 'truck'; }
      const c = this.create(type, x, z, dir * Math.PI / 2);
      c.dir = dir;
      if (kind === 'park') c.a += Math.random() < 0.5 ? 0 : Math.PI;
      else {
        c.ai = true; c.drv = 'civ';
        const sp = type === 'cop' ? 14 : c.spd; c.vx = Math.cos(c.a) * sp * 0.7; c.vz = Math.sin(c.a) * sp * 0.7;
        if (kind === 'cop') { c.mode = G.wanted > 0 ? 'chase' : 'cruise'; c.spd = 15; }
      }
      return c;
    }
    return null;
  }

  /* ---- AI ---- */
  decide(c, I, J) {
    const opts = [];
    for (let nd = 0; nd < 4; nd++) {
      if (nd === (c.dir + 2) % 4) continue;
      const ni = I + DIRS[nd][0], nj = J + DIRS[nd][1];
      if (ni < 0 || nj < 0 || ni > N || nj > N) continue;
      opts.push({ nd, ni, nj });
    }
    if (!opts.length) return;
    let o;
    if (c.mode === 'chase') {
      let bd = 1e9;
      const tp = G.police.chasePoint();
      for (const q of opts) { const d = dist(q.ni * B, q.nj * B, tp.x, tp.z) - (q.nd === c.dir ? 12 : 0); if (d < bd) { bd = d; o = q; } }
    } else if (c.mode === 'flee') { // run toward Police HQ while keeping away from the player
      const hq = c.away ? { x: 2 * c.x - G.player.x, z: 2 * c.z - G.player.z } : G.city.pois.find((q) => q.kind === 'police') || { x: 0, z: 0 }; let bd = 1e9;
      for (const q of opts) { const d = dist(q.ni * B, q.nj * B, hq.x, hq.z) - Math.min(120, dist(q.ni * B, q.nj * B, G.player.x, G.player.z)) * 0.5; if (d < bd) { bd = d; o = q; } }
    } else { const st = opts.find((q) => q.nd === c.dir); o = st && Math.random() < 0.62 ? st : pick(opts); }
    if (o.nd === c.dir) return;
    const lin = laneOf(c.dir, I, J), lout = laneOf(o.nd, I, J);
    c.corner = c.dir % 2 === 0 ? { x: lout.x, z: lin.z } : { x: lin.x, z: lout.z };
    c.turnTo = o.nd;
  }

  ahead(c) {
    const ca = Math.cos(c.a), sa = Math.sin(c.a), range = 8 + Math.abs(c.fw) * 0.75;
    let best = 999;
    const chk = (x, z, w) => {
      const dx = x - c.x, dz = z - c.z; if (Math.abs(dx) > range + 8 || Math.abs(dz) > range + 8) return;
      const fx = dx * ca + dz * sa, fz = -dx * sa + dz * ca;
      if (fx > c.def.len * 0.4 && fx < range + c.def.len * 0.4 && Math.abs(fz) < w && fx < best) { best = fx - c.def.len * 0.4; this._blk = cur; }
    };
    let cur = null; this._blk = null;
    for (const o of this.cars) { if (o === c || Math.abs(o.y - c.y) > 3) continue; cur = o; chk(o.x, o.z, c.def.wid / 2 + o.def.wid / 2 + 0.5); }
    cur = null;
    if (c.y < 3) {
      for (const p of G.peds.list) if (p.state !== 'dead') chk(p.x, p.z, 1.6);
      if (!G.player.car && !G.player.dead && !G.player.inside) chk(G.player.x, G.player.z, 1.6);
    }
    return best;
  }

  ai(c, dt) {
    const p = G.player, chase = c.mode === 'chase' && G.wanted > 0 && !p.dead;
    let tgtSpd = c.spd, des = c.a, direct = false, stopLight = false;
    if (chase) {
      const tp = G.police.chasePoint(), high = G.police.playerY() > 3;
      c.losT -= dt; const d = dist(c.x, c.z, tp.x, tp.z);
      if (c.losT <= 0) { c.losT = 0.3; c.los = d < 150 && G.city.losClear(c.x, c.z, tp.x, tp.z, 1.2); }
      if (c.los && d < 150) {
        direct = true; const v = high ? {} : p.car || p;
        des = Math.atan2(tp.z + (v.vz || 0) * 0.4 - c.z, tp.x + (v.vx || 0) * 0.4 - c.x); tgtSpd = c.def.max * (high && d < 20 ? 0.5 : 0.98);
      } else tgtSpd = c.def.max * 0.72;
    } else if (c.mode === 'chase') c.mode = 'cruise';

    if (direct) { c.direct = true; c.turnTo = null; }
    else {
      if (c.direct) { c.direct = false; c.dir = ((Math.round(c.a / (Math.PI / 2)) % 4) + 4) % 4; c.lastI = -1; c.turnTo = null; }
      // traffic lights: brake smoothly to the stop line on red (and on amber if there's room to stop)
      if (c.mode !== 'flee' && c.y < 1.5) {
        const q = junctionAhead(c), gap = q.ds - 19 - c.def.len / 2;
        if (q.I >= 0 && q.J >= 0 && q.I <= N && q.J <= N) {
          const st = signalState(q.I, q.J, c.dir % 2, G.time);
          if ((st === 2 && gap > -1.5) || (st === 1 && gap > Math.max(4, c.fw * 0.7))) { tgtSpd = Math.min(tgtSpd, Math.sqrt(16 * Math.max(0, gap))); stopLight = gap < 6; }
        }
      }
      if (c.turnTo !== null) {
        des = Math.atan2(c.corner.z - c.z, c.corner.x - c.x); tgtSpd = Math.min(tgtSpd, 9);
        if (dist(c.x, c.z, c.corner.x, c.corner.z) < 6) { c.dir = c.turnTo; c.turnTo = null; }
      } else {
        const d = c.dir, [dx, dz] = DIRS[d]; let ds, I, J;
        if (d === 0) { const cx = Math.ceil((c.x + 0.01) / B) * B; ds = cx - c.x; I = cx / B; J = Math.round(c.z / B); }
        else if (d === 2) { const cx = Math.floor((c.x - 0.01) / B) * B; ds = c.x - cx; I = cx / B; J = Math.round(c.z / B); }
        else if (d === 1) { const cz = Math.ceil((c.z + 0.01) / B) * B; ds = cz - c.z; J = cz / B; I = Math.round(c.x / B); }
        else { const cz = Math.floor((c.z - 0.01) / B) * B; ds = c.z - cz; J = cz / B; I = Math.round(c.x / B); }
        if (ds < 26 && ds > 7 && c.lastI !== I * 100 + J) { c.lastI = I * 100 + J; this.decide(c, I, J); }
        if (c.turnTo === null) {
          const ln = laneOf(d, Math.round(c.x / B), Math.round(c.z / B));
          const e = d % 2 === 0 ? clamp(ln.z - c.z, -12, 12) : clamp(ln.x - c.x, -12, 12);
          des = Math.atan2(dz * 22 + (d % 2 === 0 ? e : 0), dx * 22 + (d % 2 === 1 ? e : 0));
        } else des = Math.atan2(c.corner.z - c.z, c.corner.x - c.x);
      }
    }
    let blockedAt = 999;
    if (!(direct && dist(c.x, c.z, p.x, p.z) < 25)) blockedAt = this.ahead(c);
    const queued = blockedAt < 999 && this._blk && this._blk.waiting; // stuck behind someone waiting at a light: be patient
    c.waiting = stopLight || (queued && blockedAt < 8);
    if (blockedAt < 999 && !queued) { c.blk += dt; if (c.blk > 3.2 && c.blk < 4.4) blockedAt = 999; if (c.blk > 5.5) c.blk = 0; } else c.blk = Math.max(0, c.blk - dt * 2);
    const sp = c.fw;
    if (blockedAt < 999) tgtSpd = blockedAt < 3.5 ? 0 : tgtSpd * clamp(blockedAt / 18, 0.1, 0.8);
    if (c.rev > 0) { c.rev -= dt; c.thr = -1; c.steer = -clamp(wrapAngle(des - c.a) * 2.5, -1, 1); }
    else {
      c.steer = clamp(wrapAngle(des - c.a) * 2.6, -1, 1);
      if (tgtSpd <= 0 && sp > 0.6) c.thr = -1; else if (sp < tgtSpd - 0.8) c.thr = 1; else if (sp > tgtSpd + 2.4) c.thr = -0.5; else c.thr = 0;
      if (tgtSpd <= 0 && sp <= 0.6) c.thr = 0;
      if (Math.abs(sp) < 2.2 && c.thr > 0 && blockedAt > 9 && !c.waiting) { c.stk += dt; if (c.stk > 1.1) { c.rev = 1; c.stk = 0; } } else c.stk = Math.max(0, c.stk - dt);
    }
    c.hb = false;
  }

  /* ---- skyway (elevated expressway) traffic: straight, fast, two directions ---- */
  spawnHighway(kind = 'civ') {
    const p = G.player, cop = kind === 'cop', onDeck = !!(p.car && p.car.y > 3);
    let x = Math.max(VD.xb + 10, Math.min(VD.xc - 10, p.x + rand(-380, 380)));
    if (cop) x = Math.max(VD.xb + 10, Math.min(VD.xc - 10, p.x + (Math.random() < 0.5 ? -1 : 1) * rand(170, 300)));
    const east = cop ? x < p.x : Math.random() < 0.5, z = VD.zc + (east ? 3.5 : -3.5);
    if (dist(x, z, p.x, p.z) < 160 && (onDeck || !cop)) { if (!cop || dist(x, z, p.x, p.z) < 120) return null; }
    if (this.cars.some((c) => c.hw && Math.abs(c.x - x) < 22 && Math.abs(c.z - z) < 4)) return null;
    const r = Math.random(), type = cop ? 'cop' : r < 0.45 ? 'sedan' : r < 0.6 ? 'sport' : r < 0.75 ? 'van' : r < 0.9 ? 'truck' : 'taxi';
    const c = this.create(type, x, z, east ? 0 : Math.PI); c.y = VD.y; c.hw = true; c.ai = true; c.drv = 'civ'; c.dir = east ? 0 : 2; c.spd = cop ? 38 : rand(22, 30);
    if (cop) c.mode = G.wanted > 0 ? 'chase' : 'cruise';
    c.vx = Math.cos(c.a) * 18; c.vz = 0; return c;
  }
  aiHighway(c, dt) {
    const pl = G.player, hunting = c.type === 'cop' && c.mode === 'chase' && G.wanted > 0 && pl.car && pl.car.y > 3 && Math.abs(pl.x - c.x) < 40;
    const laneZ = hunting ? clamp(pl.z, VD.zc - 5, VD.zc + 5) : VD.zc + (c.dir === 0 ? 3.5 : -3.5), e = clamp(laneZ - c.z, -6, 6);
    const des = Math.atan2(e * 0.9, 26) + (c.dir === 0 ? 0 : Math.PI);
    c.steer = clamp(wrapAngle(des - c.a) * 2.6, -1, 1);
    const blocked = hunting ? 999 : this.ahead(c), tgt = blocked < 999 ? (blocked < 5 ? 0 : c.spd * clamp(blocked / 30, 0.1, 0.8)) : c.spd, sp = c.fw;
    if (tgt <= 0 && sp > 0.6) c.thr = -1; else if (sp < tgt - 0.8) c.thr = 1; else if (sp > tgt + 2.5) c.thr = -0.5; else c.thr = 0;
    c.hb = false;
  }

  /* ---- designated parking spots (lots, driveways, police yard...) ---- */
  syncParked(dt) {
    this.parkT = (this.parkT || 0) - dt; if (this.parkT > 0) return; this.parkT = 0.8;
    const p = G.player, list = G.city.parked;
    for (const s of list) {
      if (s.car && !this.cars.includes(s.car)) { s.car = null; s.cool = 90; }
      if (s.cool > 0) { s.cool -= 0.8; continue; }
      const d = dist(s.x, s.z, p.x, p.z);
      if (!s.car && d < 240 && d > 90 && !this.cars.some((o) => Math.abs(o.x - s.x) < 4 && Math.abs(o.z - s.z) < 4)) { const c = this.create(s.type, s.x, s.z, s.a, s.color); c.slot = s; s.car = c; }
    }
  }

  update(dt) {
    const p = G.player;
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const c = this.cars[i];
      if (c.ai && !c.dead) { if (c.hw) this.aiHighway(c, dt); else this.ai(c, dt); }
      else if (c !== p.car) { c.thr = 0; c.steer = 0; c.hb = false; }
      stepCar(c, dt);
      if (c.type === 'cop') c.siren = (c.ai && c.mode === 'chase' && !c.dead) || (c === p.car && p.sirenOn);
      if (c.dead && c.burn > 16 && c !== p.car) { this.remove(i); continue; }
      if (c.hw && (c.x < VD.xa + 6 || c.x > VD.xd - 6)) { this.remove(i); continue; }
      if (c.slot && p.car === c) { c.slot.car = null; c.slot.cool = 120; c.slot = null; }
      if (c !== p.car && !c.keep && dist(c.x, c.z, p.x, p.z) > (c.ai || c.dead ? 440 : 380)) this.remove(i);
    }
    carPairs(this.cars);
    // keep the streets populated
    let civ = 0, park = 0;
    let hw = 0;
    for (const c of this.cars) { if (c.hw) hw++; else if (c.ai && c.type !== 'cop' && !c.dead) civ++; else if (!c.ai && !c.dead && c !== p.car && !c.slot) park++; }
    this.spawnT -= dt;
    if (this.spawnT <= 0) { this.spawnT = 0.15; if (civ < 30) this.spawn('civ'); else if (park < 24) this.spawn('park'); }
    if (hw < 8 && Math.random() < dt * 2) this.spawnHighway();
    this.syncParked(dt);
  }

  sync(dt) { for (const c of this.cars) syncCar(c, dt, G.night, G.time); }
}
