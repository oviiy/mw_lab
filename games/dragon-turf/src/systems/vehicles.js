import { Vehicle } from '../entities/vehicle.js';
import { Ped } from '../entities/ped.js';
import { civilianLook } from '../entities/pedLooks.js';
import { clamp } from '../core/math.js';
import { rand } from '../core/rng.js';

// Vehicle lifecycle + interactions: spawning, entering/ejecting, running people
// over, crashes, vehicle-vs-vehicle collisions and wrecks.
export class VehicleSystem {
  constructor(game) {
    this.game = game; this.pairT = 0;
    Vehicle.onWreck = (v, src) => this.wreck(v, src);
  }

  spawn(type, x, y, angle, o = {}) {
    const v = new Vehicle(type, x, y, angle, o.color);
    v.parked = !!o.parked; v.locked = o.locked ?? v.parked; v.tag = o.tag || null; v.owner = o.owner || null;
    if (o.ai) v.ai = o.ai;
    this.game.entities.add(v);
    if (o.driver) this.seatNew(v, o.driver);
    if (o.speed) { v.vx = Math.cos(angle) * o.speed; v.vy = Math.sin(angle) * o.speed; }
    return v;
  }

  // Put a freshly-made ped behind the wheel.
  seatNew(v, opts) {
    const p = new Ped({ x: v.x, y: v.y, angle: v.angle, role: opts.role || 'civ', faction: opts.faction || 'none', look: opts.look || civilianLook(), hp: opts.hp ?? 40, weapon: opts.weapon || 'fists', cash: rand.int(8, 60), hostile: opts.hostile });
    p.brain = opts.brain || null; this.game.entities.add(p); this.enter(p, v); return p;
  }

  enter(ped, v) {
    if (v.dead) return false;
    if (v.driver && v.driver !== ped) return false;
    ped.vehicle = v; ped.seat = 'driver'; v.driver = ped; v.parked = false; v.locked = false; ped.intent.mx = ped.intent.my = 0;
    if (ped.role === 'player') { v.ai = null; v.owner = 'player'; this.game.events.emit('enterVehicle', { ped, vehicle: v }); }
    return true;
  }

  eject(ped, forced = false) {
    const v = ped.vehicle; if (!v) return;
    ped.vehicle = null; ped.seat = null; if (v.driver === ped) v.driver = null;
    const side = -Math.PI / 2, off = v.def.wid / 2 + ped.r + 5;
    let placed = false;
    for (const s of [side, -side, Math.PI, 0]) {
      const a = v.angle + s, px = v.x + Math.cos(a) * (s === Math.PI || s === 0 ? v.def.len / 2 + ped.r + 4 : off), py = v.y + Math.sin(a) * (s === Math.PI || s === 0 ? v.def.len / 2 + ped.r + 4 : off);
      const t = { x: px, y: py }; if (!this.game.world.resolveCircle(t, ped.r, { water: true })) { ped.x = px; ped.y = py; placed = true; break; }
    }
    if (!placed) { ped.x = v.x; ped.y = v.y; }
    ped.vx = v.vx * 0.2; ped.vy = v.vy * 0.2; ped.angle = v.angle + side;
    v.controls.thr = 0; v.controls.steer = 0; v.controls.hb = false; v.controls.brake = 0.4;
    if (ped.role === 'player') this.game.events.emit('exitVehicle', { ped, vehicle: v, forced });
    if (!v.ai || ped.role === 'player') { v.ai = null; v.parked = true; }
  }

  // Nearest walkable spot next to a boat (pier / quay), or null.
  shoreNear(v) {
    const w = this.game.world, t = { x: 0, y: 0 };
    for (let r = 20; r <= 70; r += 10) for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2, x = v.x + Math.cos(a) * r, y = v.y + Math.sin(a) * r; t.x = x; t.y = y;
      if (!w.resolveCircle(t, 9, { water: true, props: false }) && Math.abs(t.x - x) < 0.5) return { x, y };
    }
    return null;
  }

  // Throw the driver out and take their seat.
  carjack(player, v) {
    const old = v.driver;
    if (old) {
      this.eject(old, true);
      old.state = 'flee'; old.stateT = 0; old.stun = 0.6;
      if (old.brain && old.brain.onJacked) old.brain.onJacked(old, player, this.game);
      this.game.events.emit('carjack', { player, vehicle: v, victim: old });
    }
    v.ai = null; return this.enter(player, v);
  }

  /* ---------- people under wheels ---------- */
  sweepPeds(v, dt) {
    const game = this.game, ca = Math.cos(v.angle), sa = Math.sin(v.angle), hl = v.def.len / 2 + 3, hw = v.def.wid / 2 + 3;
    const near = game.entities.near(v.x, v.y, v.def.len * 0.75 + 12, v._near, (e) => e.kind === 'ped');
    for (const p of near) {
      if (p.dead || p.vehicle) continue;
      const dx = p.x - v.x, dy = p.y - v.y, fx = dx * ca + dy * sa, fy = -dx * sa + dy * ca;
      if (Math.abs(fx) > hl + p.r || Math.abs(fy) > hw + p.r) continue;
      const sp = Math.abs(v.fw);
      if (sp > 150 || (v.cls === 'tank' && sp > 12)) {
        const by = v.driver || null, dmg = v.cls === 'tank' ? 999 : 18 + sp * 0.16 * Math.sqrt(v.mass);
        game.combat.damagePed(p, dmg, by, { kind: 'vehicle', kx: v.vx * 0.6, ky: v.vy * 0.6, stun: 0.7, vehicle: v });
        v.vx *= 0.985; v.vy *= 0.985; game.audio.thud(p.x, p.y); if (by && by.role === 'player') { game.freeze(0.04); game.camera.addTrauma(0.12); }
      } else {
        const push = fy >= 0 ? 1 : -1; p.x += -sa * push * 70 * dt; p.y += ca * push * 70 * dt;
        if (p.role === 'civ') { p.state = 'flee'; p.stateT = 0; p.data.fleeFrom = { x: v.x, y: v.y }; }
      }
    }
  }

  onCrash(v, imp, x, y, hit) {
    const game = this.game, isPlayer = v.driver && v.driver.role === 'player';
    const dmg = (imp - 70) * 0.2 * (hit.prop ? 0.45 : 1);
    v.damage(dmg, v.driver, 'crash');
    game.fx.spark(x, y, Math.atan2(hit.ny, hit.nx), Math.min(10, 3 + imp / 60), 1.2, 180); game.fx.dust(x, y, 2);
    game.audio.crash(x, y, imp);
    if (isPlayer) game.camera.addTrauma(clamp(imp / 700, 0.1, 0.55));
    if (hit.prop && game.props) game.props.hit(hit.prop, imp, v);
    if (v.ai && v.ai.onCrash) v.ai.onCrash(v, imp);
  }

  /* ---------- vehicle vs vehicle ---------- */
  collideAll() {
    const vs = this.game.entities.vehicles;
    for (let i = 0; i < vs.length; i++) {
      const a = vs[i]; if (a.removed) continue;
      for (let j = i + 1; j < vs.length; j++) {
        const b = vs[j]; if (b.removed || (a.alt > 0.22) !== (b.alt > 0.22)) continue;
        const rr = (a.def.len + b.def.len) / 2 + 2; if (Math.abs(a.x - b.x) > rr || Math.abs(a.y - b.y) > rr) continue;
        this.collidePair(a, b);
      }
    }
  }
  collidePair(a, b) {
    const game = this.game, ca = Math.cos(a.angle), sa = Math.sin(a.angle), cb = Math.cos(b.angle), sb = Math.sin(b.angle);
    for (const oa of a.offs) for (const ob of b.offs) {
      const ax = a.x + ca * oa, ay = a.y + sa * oa, bx = b.x + cb * ob, by = b.y + sb * ob, dx = ax - bx, dy = ay - by, d = Math.hypot(dx, dy), mn = a.rad + b.rad;
      if (d >= mn || d < 0.01) continue;
      const nx = dx / d, ny = dy / d, pen = mn - d, m1 = a.mass, m2 = b.mass, w1 = m2 / (m1 + m2);
      a.x += nx * pen * w1; a.y += ny * pen * w1; b.x -= nx * pen * (1 - w1); b.y -= ny * pen * (1 - w1);
      const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
      if (rel < 0) {
        const j = (-1.2 * rel) / (1 / m1 + 1 / m2);
        a.vx += (j * nx) / m1; a.vy += (j * ny) / m1; b.vx -= (j * nx) / m2; b.vy -= (j * ny) / m2;
        const imp = -rel;
        if (imp > 25) for (const [t, o] of [[a, b], [b, a]]) if (t.cls === 'tank' && o.cls !== 'tank' && !o.dead && this.limitCrush(o)) { o.damage(60 + imp * 1.2, t.driver, 'crush'); game.fx.debris && game.fx.debris(o.x, o.y, o.color, 6); game.audio.crash(o.x, o.y, 300); }
        if (imp > 80) {
          const dm = (imp - 80) * 0.16;
          a.damage(dm * (m2 / (m1 + m2)) * 1.3, b.driver, 'crash'); b.damage(dm * (m1 / (m1 + m2)) * 1.3, a.driver, 'crash');
          game.fx.spark((ax + bx) / 2, (ay + by) / 2, Math.atan2(ny, nx), 5, 1.4, 160); game.audio.crash(ax, ay, imp);
          if ((a.driver && a.driver.role === 'player') || (b.driver && b.driver.role === 'player')) game.camera.addTrauma(clamp(imp / 800, 0.08, 0.5));
          if (a.ai && a.ai.onCrash) a.ai.onCrash(a, imp, b); if (b.ai && b.ai.onCrash) b.ai.onCrash(b, imp, a);
          game.events.emit('vehicleCollision', { a, b, imp });
        }
      }
    }
  }

  limitCrush(o) { const t = this.game.time; if (o._crushT && t - o._crushT < 0.25) return false; o._crushT = t; return true; }

  /* ---------- wrecks ---------- */
  wreck(v, src) {
    if (v.dead) return;
    const game = this.game; v.dead = true; v.hp = 0; v.siren = false; v.ai = null; v.lightsOn = false; v.burn = 0;
    const d = v.driver;
    game.combat.explode(v.x, v.y, 62 + v.def.len * 0.25, 90, src || d, { source: v, skipVehicle: v });
    if (src && src.role === 'player') game.freeze(0.08);
    game.fx.debris(v.x, v.y, v.color, 12);
    v.vx += rand.range(-60, 60); v.vy += rand.range(-60, 60);
    if (d) { this.eject(d, true); d.intent.mx = d.intent.my = 0; if (d.role === 'player') { game.combat.damagePed(d, 55, null, { kind: 'explosion' }); } else game.combat.damagePed(d, 999, src, { kind: 'explosion' }); }
    game.events.emit('vehicleDestroyed', { vehicle: v, src });
  }

  update(dt) {
    this.pairT += dt; this.collideAll();
  }
}
