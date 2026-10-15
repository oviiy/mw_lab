import { Entity } from './entity.js';
import { VEHICLES } from '../data/vehicles.js';
import { clamp, wrapAngle, damp, dampAngle } from '../core/math.js';
import { vehicleSprite, turretSprite } from '../render/vehicleSprites.js';
import { T, isWater } from '../world/tiles.js';
import { TILE } from '../config.js';
import { INK } from '../render/style.js';

const ALT_PX = 70;   // screen lift of an aircraft at full altitude

// Top-down arcade vehicle: heading + velocity vector with lateral grip, so
// handbraking produces real drifts. Controls are written by the driver (player
// input or an AI brain); physics never cares who is steering.
// Classes (def.cls): car (default) · tank (turret, crushes) · boat (water only)
// · heli (hovers, strafes, lands anywhere flat) · plane (needs speed to fly).
export class Vehicle extends Entity {
  constructor(type, x, y, angle, color) {
    super('vehicle');
    const def = VEHICLES[type];
    this.type = type; this.def = def; this.cls = def.cls || 'car'; this.color = color || def.colors[(Math.random() * def.colors.length) | 0];
    this.x = x; this.y = y; this.angle = angle; this.vx = 0; this.vy = 0; this.fw = 0; this.lat = 0; this.angVel = 0;
    this.hp = def.hp; this.maxHp = def.hp; this.mass = def.mass;
    this.controls = { thr: 0, steer: 0, brake: 0, hb: false, mx: 0, my: 0 };
    this.driver = null; this.passengers = []; this.driverInfo = null; this.ai = null;
    this.locked = false; this.parked = false; this.siren = false; this.sirenOn = false; this.horn = 0;
    this.dead = false; this.burn = 0; this.smokeT = 0; this.steerVis = 0; this.braking = false; this.owner = null; this.tag = null;
    this.r = def.wid / 2; this.rad = def.wid / 2 - 1.5;
    const n = Math.max(2, Math.ceil(def.len / (def.wid * 0.85)));
    this.offs = Array.from({ length: n }, (_, k) => -def.len / 2 + this.rad + 2 + ((def.len - 2 * this.rad - 4) * k) / (n - 1));
    this.alarm = 0; this.stolenFrom = null; this.lightsOn = false; this.skidT = 0; this.lastHitBy = null; this.honkT = 0;
    this.gripNow = def.grip;
    // special-class state
    this.alt = 0; this.rotor = 0; this.turret = angle; this.recoilT = 0; this.gunCool = 0; this.altCool = 0; this.tread = 0; this.wakeT = 0; this.bank = 0;
    this._tmp = { x: 0, y: 0 }; this._near = [];
  }

  get speed() { return Math.hypot(this.vx, this.vy); }
  get airborne() { return this.alt > 0.22; }
  get sortY() { return this.alt > 0.05 ? this.y + 100000 + this.alt * 10 : this.y + (this.def.bike ? 2 : 4); }
  get damageLevel() { const f = this.hp / this.maxHp; return f > 0.55 ? 0 : f > 0.2 ? 1 : 2; }
  get hasDriver() { return !!(this.driver || this.driverInfo); }
  get isAir() { return this.cls === 'heli' || this.cls === 'plane'; }

  update(dt, game) {
    if (this.dead) { this.controls.thr = 0; this.controls.steer = 0; this.controls.brake = 0; this.controls.mx = this.controls.my = 0; }
    else if (this.ai) this.ai.update(this, dt, game);
    this.horn = Math.max(0, this.horn - dt); this.recoilT = Math.max(0, this.recoilT - dt); this.gunCool -= dt; this.altCool -= dt;
    if (this.cls === 'heli') this.heliPhysics(dt, game);
    else if (this.cls === 'plane') this.planePhysics(dt, game);
    else this.physics(dt, game);
    this.effects(dt, game);
    if (this.driver) this.driver.x = this.x, this.driver.y = this.y;
    for (const p of this.passengers) { p.x = this.x; p.y = this.y; }
  }

  physics(dt, game) {
    const d = this.def, c = this.controls, ca = Math.cos(this.angle), sa = Math.sin(this.angle);
    let fw = this.vx * ca + this.vy * sa, lat = -this.vx * sa + this.vy * ca;
    const prevFw = fw;
    if (!this.dead) {
      const boost = this.driver && this.driver.role === 'player' ? (this.boost || 1) : 1;
      if (c.thr > 0) { if (fw < d.max * boost) fw += c.thr * d.accel * boost * dt; }
      else if (c.thr < 0) { if (fw > 14) fw += c.thr * d.brake * dt; else if (fw > -d.max * 0.38) fw += c.thr * d.accel * 0.62 * dt; }
      if (c.brake > 0) fw -= Math.sign(fw) * Math.min(Math.abs(fw), d.brake * c.brake * dt);
    }
    fw -= fw * (this.cls === 'boat' ? 0.55 : 0.3) * dt;
    if (c.thr === 0 && c.brake === 0) fw -= Math.sign(fw) * Math.min(Math.abs(fw), (this.cls === 'boat' ? 40 : 55) * dt);
    // grip eases back after a handbrake release so drifts flow instead of snapping
    const want = c.hb ? 1.3 : d.grip * (this.dead ? 0.6 : 1) * (c.thr > 0 && Math.abs(lat) > 60 ? 0.75 : 1);
    this.gripNow = c.hb ? want : damp(this.gripNow, want, 5, dt);
    lat -= lat * Math.min(1, this.gripNow * dt);
    if (c.hb) fw -= fw * 1.1 * dt;
    const sp = Math.abs(fw);
    if (!this.dead && !this.jumping) {
      // tanks pivot on the spot; everything else needs rolling speed to turn
      const authority = this.cls === 'tank' ? 1 : Math.min(1, sp / 95) * (1 - 0.25 * Math.min(1, sp / d.max));
      this.angle += c.steer * authority * d.turn * (c.hb ? 1.55 : 1) * (fw < -2 && this.cls !== 'tank' ? -1 : 1) * dt;
    }
    // spin from impacts
    this.angle += this.angVel * dt; this.angVel *= Math.max(0, 1 - dt * 4);
    this.angle = wrapAngle(this.angle);
    this.vx = ca * fw - sa * lat; this.vy = sa * fw + ca * lat;
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.fw = this.vx * Math.cos(this.angle) + this.vy * Math.sin(this.angle); this.lat = -this.vx * Math.sin(this.angle) + this.vy * Math.cos(this.angle);
    this.braking = c.thr < 0 && this.fw > 20 || c.brake > 0.2 && sp > 20;
    this.accelNow = (this.fw - prevFw) / Math.max(dt, 1e-3);
    this.steerVis += (c.steer - this.steerVis) * Math.min(1, dt * 12);
    if (this.cls === 'tank') this.tread += this.fw * dt + c.steer * 20 * dt;
    if (this.alt > 0.15) { this.clampWorld(game.world); return; }   // mid-jump
    this.collide(dt, game);
    if (!this.dead && Math.abs(this.fw) > (this.cls === 'tank' ? 12 : 40) && this.cls !== 'boat') game.vehicles.sweepPeds(this, dt);
  }

  // Helicopter: altitude follows "engine on" (a driver aboard); WASD strafes in screen
  // space, the nose follows the mouse. Lands wherever it is when the pilot leaves.
  heliPhysics(dt, game) {
    const d = this.def, c = this.controls, world = game.world;
    const pilot = !!this.driver && !this.dead;
    this.rotor += dt * (pilot ? 40 : this.alt > 0.02 ? 24 : Math.max(0, 6 - this.rotor * 0)) ;
    let targetAlt = pilot ? 1 : 0;
    if (!pilot && this.alt > 0) {
      // auto-descend; a heli can't settle on a roof — drift it to open ground first
      const solid = world.isSolidPx(this.x, this.y) || isWater(world.tileAtPx(this.x, this.y));
      if (solid && this.alt < 0.4) targetAlt = 0.4;
    }
    if (this.dead) targetAlt = -1;
    this.alt = clamp(this.alt + clamp(targetAlt - this.alt, -0.7 * dt, 0.55 * dt), 0, 1);
    const fly = this.alt > 0.3, want = fly ? d.max : 0;
    const mx = c.mx, my = c.my, m = Math.hypot(mx, my) || 1;
    const tvx = (mx / m) * want * Math.min(1, Math.hypot(mx, my)), tvy = (my / m) * want * Math.min(1, Math.hypot(mx, my));
    const k = Math.min(1, dt * (d.accel / Math.max(1, d.max)) * 1.4);
    this.vx += (tvx - this.vx) * k; this.vy += (tvy - this.vy) * k;
    if (!fly) { this.vx *= Math.max(0, 1 - dt * 3); this.vy *= Math.max(0, 1 - dt * 3); }
    if (c.aim !== undefined && pilot) this.angle = dampAngle(this.angle, c.aim, 5, dt);
    this.bank = damp(this.bank, clamp((-Math.sin(this.angle) * this.vx + Math.cos(this.angle) * this.vy) / d.max, -1, 1), 6, dt);
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.fw = this.vx * Math.cos(this.angle) + this.vy * Math.sin(this.angle); this.lat = 0;
    if (this.alt < 0.25) this.collide(dt, game); else this.clampWorld(world);
    if (this.dead && this.alt <= 0.01 && !this._crashed) { this._crashed = true; game.combat.explode(this.x, this.y, 90, 120, this.lastHitBy); }
  }

  // Plane: throttle along the nose, needs ~250 px/s to lift off, stalls and sinks
  // below ~190 airborne. Touching down too fast or onto a roof/water is a crash.
  planePhysics(dt, game) {
    const d = this.def, c = this.controls, world = game.world, pilot = !!this.driver && !this.dead;
    this.rotor += dt * (pilot ? 50 : 4) * Math.min(1, 0.2 + Math.abs(this.fw) / 200);
    const ca = Math.cos(this.angle), sa = Math.sin(this.angle);
    let fw = this.vx * ca + this.vy * sa, lat = -this.vx * sa + this.vy * ca;
    const air = this.alt > 0.05, maxNow = air ? d.max : d.max * 0.62;
    if (pilot) { if (c.thr > 0 && fw < maxNow) fw += c.thr * d.accel * dt; else if (c.thr < 0) fw -= d.brake * (air ? 0.45 : 1) * dt; }
    fw -= fw * (air ? 0.06 : 0.6) * dt; if (fw < 0) fw = air ? 0 : Math.max(fw, -40);
    lat -= lat * Math.min(1, d.grip * dt);
    const turn = (air ? d.turn : d.turn * Math.min(1, Math.abs(fw) / 80) * 0.7) * c.steer;
    if (!this.dead) this.angle = wrapAngle(this.angle + turn * dt);
    this.bank = damp(this.bank, air ? c.steer : 0, 4, dt);
    // lift
    const prevAlt = this.alt;
    if (pilot && fw > 250 && c.thr > 0) this.alt = Math.min(1, this.alt + dt * 0.55);
    else if (air && (fw < 190 || !pilot || this.dead)) this.alt = Math.max(0, this.alt - dt * (this.dead || !pilot ? 0.5 : 0.35));
    else if (air && c.thr < 0) this.alt = Math.max(0.0, this.alt - dt * 0.3);   // S descends to land
    if (prevAlt > 0.05 && this.alt <= 0.05) {
      this.alt = 0;
      const bad = world.isSolidPx(this.x, this.y) || isWater(world.tileAtPx(this.x, this.y));
      if (bad || fw > 330 || this.dead) { this.hp = 0; this.wreck(this.lastHitBy); }
      else game.camera.addTrauma(0.18);
    }
    this.vx = ca * fw - sa * lat; this.vy = sa * fw + ca * lat;
    this.x += this.vx * dt; this.y += this.vy * dt; this.fw = fw; this.lat = lat;
    this.braking = false;
    if (this.alt < 0.2) this.collide(dt, game); else this.clampWorld(world);
  }

  clampWorld(world) { this.x = clamp(this.x, 20, world.pxW - 20); this.y = clamp(this.y, 20, world.pxH - 20); }

  collide(dt, game) {
    const world = game.world, ca = Math.cos(this.angle), sa = Math.sin(this.angle), t = this._tmp;
    const opts = this.cls === 'boat' ? { land: true, props: false } : { props: true, water: true };
    for (let it = 0; it < 2; it++) for (const o of this.offs) {
      const cx = this.x + ca * o, cy = this.y + sa * o; t.x = cx; t.y = cy;
      const hit = world.resolveCircle(t, this.rad, opts);
      if (!hit) continue;
      this.x += t.x - cx; this.y += t.y - cy;
      const vn = this.vx * hit.nx + this.vy * hit.ny;
      if (vn < 0) {
        const imp = -vn;
        if (this.cls === 'tank' && hit.prop) { game.props && game.props.hit(hit.prop, 999, this); continue; }   // tanks flatten street furniture
        this.vx -= 1.28 * vn * hit.nx; this.vy -= 1.28 * vn * hit.ny; this.vx *= 0.94; this.vy *= 0.94;
        // off-centre hits spin the car
        this.angVel += clamp((o * (ca * hit.ny - sa * hit.nx)) * imp * 0.00045, -3, 3);
        if (imp > 70) game.vehicles.onCrash(this, imp, cx, cy, hit);
      }
    }
    this.clampWorld(world);
  }

  effects(dt, game) {
    const fx = game.fx, hpf = this.hp / this.maxHp;
    if (!this.dead && hpf < 0.4) {
      this.smokeT -= dt;
      if (this.smokeT <= 0) { this.smokeT = hpf < 0.2 ? 0.05 : 0.11; const ca = Math.cos(this.angle), sa = Math.sin(this.angle); const x = this.x + ca * this.def.len * 0.3, y = this.y + sa * this.def.len * 0.3 - this.alt * ALT_PX; fx.smoke(x, y, hpf < 0.2 ? 0.2 : 0.55); if (hpf < 0.2) fx.fire(x, y, 0.8); }
      if (hpf < 0.1) this.damage(dt * 7, null, 'fire');
    }
    if (this.dead) {
      this.burn += dt; this.smokeT -= dt;
      if (this.smokeT <= 0) { this.smokeT = 0.05; fx.fire(this.x + (Math.random() - 0.5) * this.def.len * 0.6, this.y - this.alt * ALT_PX + (Math.random() - 0.5) * this.def.wid, 1.3); if (Math.random() < 0.5) fx.smoke(this.x, this.y - this.alt * ALT_PX, 0.1, 1.4); }
      if (this.burn > 24) this.removed = true;
      if (this.cls === 'boat' && this.burn > 4) this.removed = true;   // sinks
    }
    const sp = this.speed;
    if (this.cls === 'boat' && sp > 40 && !this.dead) {
      this.wakeT -= dt;
      if (this.wakeT <= 0) { this.wakeT = 0.06; const ca = Math.cos(this.angle), sa = Math.sin(this.angle); fx.wake && fx.wake(this.x - ca * this.def.len * 0.45, this.y - sa * this.def.len * 0.45, this.angle, Math.min(1, sp / 300)); }
      return;
    }
    if (this.cls === 'heli' && this.alt > 0.02 && this.alt < 0.6 && Math.random() < dt * 30) fx.dust(this.x + (Math.random() - 0.5) * 60, this.y + (Math.random() - 0.5) * 60, 1);
    if (this.cls === 'plane' && this.alt > 0.6 && sp > 300 && Math.random() < dt * 20) { const ca = Math.cos(this.angle), sa = Math.sin(this.angle), s = this.def.span / 2; for (const k of [-1, 1]) fx.smoke(this.x - ca * 8 - sa * s * k, this.y - this.alt * ALT_PX - sa * 8 + ca * s * k, 0.05, 0.5); }
    // skid marks + tyre smoke while drifting hard
    if (!this.dead && !this.isAir && sp > 90 && Math.abs(this.lat) > 70) {
      this.skidT -= dt;
      if (this.skidT <= 0) { this.skidT = 0.03; game.fx.skid(this); if (Math.random() < 0.35) { const ca = Math.cos(this.angle), sa = Math.sin(this.angle); fx.smoke(this.x - ca * this.def.len * 0.35, this.y - sa * this.def.len * 0.35, 0.02, 0.7); } }
    }
  }

  damage(n, src = null, kind = 'hit') {
    if (this.dead || n <= 0 || (this.driver && this.driver.godMode)) return;
    if (this.crashMul && kind === 'crash') n *= this.crashMul;   // race cars shrug off fender-benders
    if (this.cls === 'tank' && (kind === 'bullet' || kind === 'crash')) n *= 0.15;
    this.hp -= n; if (src) this.lastHitBy = src;
    this.hitFlash = 0.08;
    if (this.hp <= 0) this.wreck(this.lastHitBy, kind);
  }

  wreck(src) { Vehicle.onWreck && Vehicle.onWreck(this, src); }

  /* ---------- drawing ---------- */
  draw(g, time, cam, game) {
    const d = this.def, spr = vehicleSprite(this.type, this.color, this.damageLevel), lift = this.alt * ALT_PX;
    const sc = 1 + this.alt * 0.28;
    // shadow: on the ground, drifting further from the body (and fainter) with altitude
    const sx = this.x + 4 + this.alt * 30, sy = this.y + 6 + this.alt * 22, sa = 0.32 - this.alt * 0.14;
    g.save(); g.translate(sx, sy); g.rotate(this.angle); g.fillStyle = `rgba(10,6,24,${sa})`;
    if (this.isAir) { g.drawImage(spr.shadow || spr.canvas, -spr.cx, -spr.cy, spr.w, spr.h); }
    else { g.beginPath(); g.roundRect(-d.len / 2, -d.wid / 2 + 1, d.len, d.wid - 2, this.cls === 'boat' ? 10 : 6); g.fill(); }
    g.restore();
    if (this.cls === 'boat') { g.save(); g.translate(this.x, this.y); g.rotate(this.angle); g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.ellipse(d.len * 0.1, 0, d.len * 0.55, d.wid * 0.62, 0, 0, 6.3); g.fill(); g.restore(); }
    g.save(); g.translate(this.x, this.y - lift); g.rotate(this.angle); if (sc !== 1) g.scale(sc, sc);
    if (this.cls === 'plane') g.scale(1, 1 - Math.abs(this.bank) * 0.22);
    g.translate(0, clamp(this.lat * 0.006, -1.6, 1.6));
    if (this.cls === 'tank') this.drawTreads(g);
    g.drawImage(spr.canvas, -spr.cx, -spr.cy, spr.w, spr.h);
    if (this.hitFlash > 0) { this.hitFlash -= 1 / 60; g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5; g.drawImage(spr.canvas, -spr.cx, -spr.cy, spr.w, spr.h); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    if (this.braking && !this.dead && !this.isAir && this.cls !== 'boat') { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,40,30,0.9)'; for (const s of [-1, 1]) g.fillRect(-d.len / 2 - 0.6, s * (d.wid / 2 - 4.6) - 1.9, 3.2, 3.8); g.globalCompositeOperation = 'source-over'; }
    if (this.siren && !this.dead) this.drawSiren(g, time);
    if (this.cls === 'heli') this.drawRotor(g, d.span / 2, 4);
    if (this.cls === 'plane') this.drawProp(g);
    g.restore();
    if (this.cls === 'tank') this.drawTurret(g);
    void cam; void game;
  }
  drawTreads(g) {
    const d = this.def, L = d.len, W = d.wid;
    for (const s of [-1, 1]) {
      const y0 = s * (W / 2) - (s > 0 ? 8 : 0);
      g.fillStyle = '#1e1c20'; g.fillRect(-L / 2 - 1, y0, L + 2, 8); g.strokeStyle = INK; g.lineWidth = 1.4; g.strokeRect(-L / 2 - 1, y0, L + 2, 8);
      g.strokeStyle = 'rgba(160,160,150,0.5)'; g.lineWidth = 1; const off = ((this.tread * (s > 0 ? 1 : 1)) % 5 + 5) % 5;
      for (let x = -L / 2 + off; x < L / 2; x += 5) { g.beginPath(); g.moveTo(x, y0 + 1); g.lineTo(x, y0 + 7); g.stroke(); }
    }
  }
  drawTurret(g) {
    const t = turretSprite(this.color, this.damageLevel), rec = this.recoilT > 0 ? -6 * (this.recoilT / 0.18) : 0;
    g.save(); g.translate(this.x - Math.cos(this.angle) * 4, this.y - Math.sin(this.angle) * 4); g.rotate(this.turret); g.translate(rec, 0);
    g.drawImage(t.canvas, -t.cx, -t.cy, t.w, t.h); g.restore();
  }
  drawRotor(g, R, x) {
    g.save(); g.translate(x, 0);
    g.fillStyle = 'rgba(30,30,40,0.14)'; g.beginPath(); g.arc(0, 0, R, 0, 6.3); g.fill();
    g.rotate(this.rotor); g.strokeStyle = 'rgba(20,20,28,0.75)'; g.lineWidth = 3.2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-R, 0); g.lineTo(R, 0); g.moveTo(0, -R); g.lineTo(0, R); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(0, 0, 3.4, 0, 6.3); g.fill(); g.restore();
  }
  drawProp(g) {
    const x = this.def.len / 2 + 1;
    g.save(); g.translate(x, 0); g.fillStyle = 'rgba(40,40,50,0.22)'; g.beginPath(); g.ellipse(0, 0, 2, 13, 0, 0, 6.3); g.fill();
    g.strokeStyle = 'rgba(20,20,28,0.8)'; g.lineWidth = 2; const k = Math.sin(this.rotor) * 13; g.beginPath(); g.moveTo(0, -k); g.lineTo(0, k); g.stroke(); g.restore();
  }
  drawSiren(g, time) {
    const d = this.def, ph = Math.floor(time * 7) & 1, w = d.wid;
    g.globalCompositeOperation = 'lighter';
    const l = (y, col, on) => { if (!on) return; const gr = g.createRadialGradient(-d.len * 0.06 + 2, y, 0, -d.len * 0.06 + 2, y, 15); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(-d.len * 0.06 - 14, y - 15, 30, 30); };
    l(-w * 0.2, 'rgba(255,50,50,0.95)', ph === 0); l(w * 0.2, 'rgba(70,110,255,0.95)', ph === 1);
    g.globalCompositeOperation = 'source-over';
  }
}
export { ALT_PX };
void T; void TILE;
