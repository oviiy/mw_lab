import * as THREE from 'three';
import { G } from './state.js';
import { clamp, dist, damp, dampAngle, rand, pick, wrapAngle } from './util.js';
import { makePedModel, animateWalker, disposePed } from './peds.js';
import { WEAPONS, WHEEL_ORDER } from './combat.js';
import { circRect, hit } from './city.js';
import { line } from './speech.js';

const dark = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.5, metalness: 0.6 });
const wood = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.8 });
const olive = new THREE.MeshStandardMaterial({ color: 0x5b6b3d, roughness: 0.6, metalness: 0.3 });

function weaponMeshes() {
  const mk = (parts) => { const g = new THREE.Group(); for (const [geo, mat, x, y, z] of parts) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); } g.visible = false; return g; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  return [
    mk([[B(0.28, 0.12, 0.05), dark, 0.18, 0.02, 0], [B(0.07, 0.16, 0.05), dark, 0.07, -0.08, 0]]),
    mk([[B(0.4, 0.12, 0.06), dark, 0.2, 0.02, 0], [B(0.07, 0.22, 0.05), dark, 0.1, -0.12, 0], [B(0.18, 0.04, 0.04), dark, 0.38, 0.04, 0]]),
    mk([[B(0.75, 0.08, 0.07), dark, 0.38, 0.03, 0], [B(0.3, 0.1, 0.08), wood, 0.05, 0, 0], [B(0.3, 0.06, 0.06), dark, 0.45, -0.04, 0]]),
    mk([[new THREE.CylinderGeometry(0.1, 0.1, 1.0, 10).rotateZ(Math.PI / 2), olive, 0.3, 0.1, 0], [new THREE.CylinderGeometry(0.15, 0.1, 0.2, 10).rotateZ(Math.PI / 2), olive, 0.85, 0.1, 0], [B(0.08, 0.22, 0.06), dark, 0.2, -0.08, 0]]),
    mk([[B(0.72, 0.1, 0.06), dark, 0.36, 0.03, 0], [B(0.26, 0.09, 0.07), wood, 0.0, -0.01, 0], [B(0.07, 0.2, 0.05), dark, 0.2, -0.12, 0], [B(0.1, 0.18, 0.05), dark, 0.32, -0.12, 0], [B(0.3, 0.03, 0.03), dark, 0.62, 0.04, 0]]),
    mk([[B(1.0, 0.07, 0.06), dark, 0.5, 0.03, 0], [B(0.3, 0.1, 0.07), wood, 0.02, -0.01, 0], [new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8).rotateZ(Math.PI / 2), dark, 0.38, 0.1, 0], [B(0.06, 0.14, 0.05), dark, 0.25, -0.1, 0]]),
    mk([[new THREE.SphereGeometry(0.075, 10, 8), olive, 0.1, 0, 0], [B(0.03, 0.05, 0.08), dark, 0.1, 0.075, 0]]),
    mk([[new THREE.CylinderGeometry(0.03, 0.05, 0.85, 8).rotateZ(Math.PI / 2), wood, 0.4, 0, 0], [new THREE.CylinderGeometry(0.05, 0.05, 0.12, 8).rotateZ(Math.PI / 2), wood, 0.82, 0, 0]]),
  ];
}

export class Player {
  constructor() {
    this.x = 0; this.z = 0; this.vx = 0; this.vz = 0; this.a = 0; this.hp = 100; this.car = null; this.w = 0;
    this.owned = [true, false, false, false, false, false, false, true]; this.ammo = [60, 0, 0, 0, 0, 0, 0, Infinity]; this.swingT = 0; this.inside = null; this.armor = 0; this.calm = 0; this.cool = 0; this.dead = false; this.dt = 0; this.hurtT = 0; this.bust = 0; this.kind = 'WASTED';
    this.aimT = 0; this.sirenOn = false; this.sprint = false; this.jumpY = 0; this.jumpV = 0; this.gunKick = 0;
    this.model = makePedModel({ shirt: 0xe8a317, pants: 0x1f2a3d, skin: 0xe0b090, hair: 0x2a1a10 });
    this.weapons = weaponMeshes();
    for (const w of this.weapons) { w.position.set(0.02, -0.5, 0); w.rotation.z = -Math.PI / 2; this.model.armR.add(w); }
    this.weapons[0].visible = true; this.zoom = false;
    G.scene.add(this.model.root);
  }

  get speed() { return this.car ? this.car.fw : Math.hypot(this.vx, this.vz); }

  canUse(i) { return this.owned[i] && (this.ammo[i] > 0 || WEAPONS[i].melee); }
  setWeapon(i, quiet) { if (i < 0 || i >= WEAPONS.length || !this.canUse(i)) return false; this.w = i; this.weapons.forEach((m, k) => (m.visible = k === i)); if (!quiet) G.hud.toast(WEAPONS[i].name, 1.2); return true; }
  giveWeapon(i, ammo) { this.owned[i] = true; this.ammo[i] = Math.min((this.ammo[i] === Infinity ? 0 : this.ammo[i]) + ammo, 999); }
  cycleWeapon(dir) { const o = WHEEL_ORDER; let k = o.indexOf(this.w); for (let n = 0; n < o.length; n++) { k = (k + dir + o.length) % o.length; if (this.canUse(o[k])) { this.setWeapon(o[k]); return; } } }

  hurt(d, fromX, fromZ) {
    if (this.dead || d <= 0 || G.cheats.god) return;
    if (this.armor > 0) { const a = Math.min(this.armor, d * 0.7); this.armor -= a; d -= a; }
    this.hp -= d; this.hurtT = 0.4; this.calm = 0; if (d > 5) G.audio.hurt();
    if (fromX !== undefined) G.hud.damageFrom(fromX, fromZ);
    G.fx.bloodSplat(this.x, 1.3, this.z, 3);
    if (this.hp <= 0) this.die('WASTED');
  }
  die(kind) {
    if (this.dead) return;
    if (this.car) this.exitCar(true);
    this.dead = true; this.dt = 0; this.kind = kind; this.vx = this.vz = 0;
    G.hud.big(kind, 3.6, kind === 'BUSTED' ? '#4a8cff' : '#c21');
    G.audio.sting();
  }

  /* ---- vehicles ---- */
  nearestCar() { return G.traffic.nearest(this.x, this.z, 4.6); }
  nearestPed(r = 2.9) {
    let best = null, bd = r;
    for (const p of G.peds.list) { if (p.type !== 'civ' || p.state === 'dead') continue; const d = dist(p.x, p.z, this.x, this.z); if (d < bd) { bd = d; best = p; } }
    return best;
  }
  interactPed(p) {
    const peds = G.peds;
    if (p.state === 'hands') { // stick-up
      const cash = Math.floor(rand(30, 170)); G.money += cash; G.audio.cash(); G.hud.toast(`Mugged for $${cash}`, 1.8); G.stats.mugged++;
      peds.say(p, 'mug', true); p.state = 'flee'; p.fear = 10; p.fx = this.x; p.fz = this.z; G.police.crime(1, p.x, p.z);
      G.speech.say(this, 'Nice doing business.', { cls: 'me', h: 2.1, secs: 2 });
    } else {
      p.talkT = 3; p.a = Math.atan2(this.z - p.z, this.x - p.x); peds.say(p, 'talk', true);
      G.speech.say(this, line('greet'), { cls: 'me', h: 2.1, secs: 1.8 });
    }
  }
  useVehicle() {
    if (this.dead) return;
    if (this.car) { this.exitCar(false); return; }
    if (this.inside) { if (G.spot && G.spot.act) G.spot.act(); return; }
    const c = this.nearestCar();
    if (c && c.drv && Math.abs(c.fw) > 5) { G.hud.toast('Too fast to jump in', 1.2); return; }
    if (!c) { if (G.nearDoor) { G.interiors.enter(G.nearDoor); return; } const ped = this.nearestPed(); if (ped) this.interactPed(ped); return; }
    if (c.drv === 'civ') {
      const a = c.a - Math.PI / 2, ex = c.x + Math.cos(a) * 2.2, ez = c.z + Math.sin(a) * 2.2;
      const p = G.peds.create(ex, ez); p.state = 'flee'; p.fear = 9; p.fx = this.x; p.fz = this.z;
      G.police.crime(c.type === 'cop' ? 3 : 1, c.x, c.z, c.type === 'cop');
      G.stats.jacked++;
    }
    c.ai = false; c.drv = 'player'; c.mode = null; c.siren = false; this.car = c; c.thr = 0; c.steer = 0;
    this.model.root.visible = false;
    G.hud.toast(c.def.n, 1.6); G.audio.door();
  }
  exitCar(forced) {
    const c = this.car; if (!c) return;
    if (!forced && c.y > 1.5) { G.hud.toast("You can't get out up here", 1.5); return; }
    let placed = false;
    for (const s of [-Math.PI / 2, Math.PI / 2, Math.PI, 0]) {
      const a = c.a + s, x = c.x + Math.cos(a) * (c.def.wid / 2 + 1.1), z = c.z + Math.sin(a) * (c.def.wid / 2 + 1.1), o = { x, z };
      if (!G.city.pushOut(o, 0.5) || (o.x === x && o.z === z)) { this.x = x; this.z = z; placed = true; break; }
    }
    if (!placed) { this.x = c.x; this.z = c.z; }
    if (forced) { const a = rand(0, 6.28); this.vx = Math.cos(a) * 6; this.vz = Math.sin(a) * 6; } else { this.vx = c.vx * 0.3; this.vz = c.vz * 0.3; if (Math.abs(c.fw) > 12) { this.hurt(Math.abs(c.fw) * 0.8); G.hud.toast('Bailed out!', 1.2); } }
    c.drv = null; c.thr = 0; c.steer = 0; c.hb = false; this.car = null; this.sirenOn = false;
    this.model.root.visible = true; this.a = c.a; if (!forced) G.audio.door();
  }

  /* ---- per-frame ---- */
  update(dt) {
    const inp = G.input, k = inp.keys;
    this.hurtT = Math.max(0, this.hurtT - dt); this.cool -= dt;
    this.calm += dt; if (!this.dead && this.calm > 6 && this.hp < 50) this.hp = Math.min(50, this.hp + dt * 4); // slow regen to half health this.aimT = Math.max(0, this.aimT - dt); this.gunKick = Math.max(0, this.gunKick - dt * 8);
    if (this.dead) { this.dt += dt; return; }
    if (this.car) {
      const c = this.car;
      c.thr = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
      c.steer = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
      if (G.drunk > 0) c.steer += Math.sin(G.time * 1.9) * 0.35 * Math.min(1, G.drunk / 8);
      c.hb = k.has('Space');
      if (c.horn > 0) c.horn -= dt;
      this.x = c.x; this.z = c.z; this.vx = c.vx; this.vz = c.vz; this.a = c.a;
      // drive-by: pistol or SMG out of the window, aimed with the camera
      const dbw = this.ammo[1] > 0 && this.owned[1] ? 1 : this.ammo[0] > 0 ? 0 : -1;
      if (inp.mouse[0] && dbw >= 0 && this.cool <= 0 && G.state === 'play' && !G.wheelOpen && (dbw === 1 || !this._fired)) {
        const w2 = WEAPONS[dbw], cam = G.camRig, o = cam.camera.position, d = cam.forward();
        const t = G.combat.aimPoint(o.x, o.y, o.z, d.x, d.y, d.z, 140, c);
        this.cool = w2.rate * 1.3; this.ammo[dbw]--;
        G.combat.shoot('p', c.x + d.x * 1.6, c.y + 1.35, c.z + d.z * 1.6, t[0], t[1], t[2], dbw, 2.5);
      }
      this._fired = inp.mouse[0];
      return;
    }
    if (G.shop && G.shop.open) { this.vx = this.vz = 0; return; }
    // on foot — move relative to the camera
    const yaw = G.camRig.yaw, fx = Math.cos(yaw), fz = Math.sin(yaw), rx = -Math.sin(yaw), rz = Math.cos(yaw);
    let f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    let s = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    let mx = fx * f + rx * s, mz = fz * f + rz * s; const l = Math.hypot(mx, mz);
    if (l > 0) { mx /= l; mz /= l; }
    this.sprint = (k.has('ShiftLeft') || k.has('ShiftRight')) && l > 0;
    const sp = this.sprint ? 8.2 : 4.6;
    this.vx = damp(this.vx, mx * sp, 12, dt); this.vz = damp(this.vz, mz * sp, 12, dt);
    G.city.moveCircle(this, 0.45, dt);
    // keep out of cars' bodies
    for (const c of G.traffic.cars) {
      if (c.y > 1.5 || Math.abs(c.x - this.x) > c.def.len || Math.abs(c.z - this.z) > c.def.len) continue;
      for (const o of c.offs) { const cx = c.x + Math.cos(c.a) * o, cz = c.z + Math.sin(c.a) * o, dx = this.x - cx, dz = this.z - cz, d = Math.hypot(dx, dz), mn = c.rad + 0.45; if (d < mn && d > 0.001) { this.x += (dx / d) * (mn - d); this.z += (dz / d) * (mn - d); } }
    }
    if (k.has('Space') && this.jumpY <= 0.001 && !this._jumpHeld) { this.jumpV = 5.2; }
    this._jumpHeld = k.has('Space');
    if (this.jumpY > 0 || this.jumpV > 0) { this.jumpV -= 16 * dt; this.jumpY = Math.max(0, this.jumpY + this.jumpV * dt); if (this.jumpY === 0) this.jumpV = 0; }
    // facing
    const aiming = inp.mouse[0] || inp.mouse[2] || this.aimT > 0;
    if (aiming) this.a = dampAngle(this.a, yaw, 18, dt);
    else if (l > 0) this.a = dampAngle(this.a, Math.atan2(mz, mx), 12, dt);
    // shooting
    const w = WEAPONS[this.w];
    if (inp.mouse[0] && this.cool <= 0 && G.state === 'play' && !G.wheelOpen && !this.inside && (w.auto || !this._fired)) {
      if (this.canUse(this.w)) this.fire();
    }
    this._fired = inp.mouse[0];
    if (!this.canUse(this.w)) { if (!this.setWeapon(0, true)) this.setWeapon(7, true); G.hud.toast('Out of ammo', 1.2); }
    this.zoom = w.id === 'sniper' && inp.mouse[2];
    if ((inp.mouse[2] || this.aimT > 0) && !w.melee && !w.thrown && !this.inside) this.holdUp(dt); // pointing a gun at someone
    this.swingT = Math.max(0, this.swingT - dt);
    // melee-free "bust" from cops handled in police.js
  }

  setOutfit(shirt, pants) {
    const old = this.model, nm = makePedModel({ shirt, pants, skin: 0xe0b090, hair: 0x2a1a10 });
    for (const w of this.weapons) { w.removeFromParent(); nm.armR.add(w); }
    G.scene.remove(old.root); disposePed(old); G.scene.add(nm.root); this.model = nm; nm.root.visible = !this.car; return true;
  }

  holdUp(dt) {
    const cam = G.camRig, o = cam.camera.position, d = cam.forward();
    for (const p of G.peds.list) {
      if (p.type !== 'civ' || p.state === 'dead' || p.state === 'static') continue;
      const dx = p.x - o.x, dy = 1.3 - o.y, dz = p.z - o.z, along = dx * d.x + dy * d.y + dz * d.z;
      const px = dx - d.x * along, py = dy - d.y * along, pz = dz - d.z * along, perp = Math.hypot(px, py, pz); // distance of the ped from the aim ray
      if (along < 1.5 || along > 18) { p.aimedT = Math.max(0, p.aimedT - dt); continue; }
      if (perp < 1.0 && G.city.losClear(this.x, this.z, p.x, p.z, 1.3)) {
        p.aimedT += dt;
        if (p.aimedT > 0.4 && p.state !== 'flee' && p.state !== 'hands') { p.state = 'hands'; p.handsT = 10; G.peds.say(p, 'hands', true); }
      } else p.aimedT = Math.max(0, p.aimedT - dt);
    }
  }

  fire() {
    const w = WEAPONS[this.w], cam = G.camRig;
    this.cool = w.rate; this.aimT = 0.7; this.gunKick = 1;
    const o = cam.camera.position, d = cam.forward();
    if (w.melee) {
      this.swingT = 0.32; G.audio.thud(this.x, this.z);
      const fx = Math.cos(this.a), fz = Math.sin(this.a);
      for (const p of G.peds.list) {
        if (p.state === 'dead') continue;
        const dx = p.x - this.x, dz = p.z - this.z, d2 = Math.hypot(dx, dz);
        if (d2 < 2.7 && (dx * fx + dz * fz) / (d2 || 1) > 0.25) { p.vx = fx * 6; p.vz = fz * 6; p.fly = 2; G.peds.hurt(p, w.dmg, 'p'); G.peds.say(p, 'hit'); }
      }
      return;
    }
    if (w.thrown) {
      this.ammo[this.w]--; this.swingT = 0.3;
      G.combat.throwGrenade(this.x + Math.cos(this.a) * 0.6, 1.5, this.z + Math.sin(this.a) * 0.6, d.x * 17, 5.5 + d.y * 15, d.z * 17);
      G.hud.toast(`Grenades: ${this.ammo[this.w]}`, 1); return;
    }
    const t = G.combat.aimPoint(o.x, o.y, o.z, d.x, d.y, d.z, 160, null);
    const mx = this.x + Math.cos(this.a) * 0.8 - Math.sin(this.a) * -0.1, mz = this.z + Math.sin(this.a) * 0.8 + Math.cos(this.a) * -0.1, my = 1.35 + this.jumpY;
    let tx = t[0], ty = t[1], tz = t[2];
    if (Math.hypot(tx - mx, tz - mz) < 1.2) { tx = mx + d.x * 20; ty = my + d.y * 20; tz = mz + d.z * 20; }
    const moving = Math.hypot(this.vx, this.vz) > 1 ? 1.8 : 1;
    G.combat.shoot('p', mx, my, mz, tx, ty, tz, this.w, moving);
    this.ammo[this.w]--;
    if (w.id === 'rpg') G.hud.toast(`Rockets: ${this.ammo[3]}`, 1);
    G.camRig.kick(w.id === 'rpg' ? 0.05 : w.id === 'shotgun' ? 0.035 : w.id === 'sniper' ? 0.04 : 0.012);
  }

  sync(dt) {
    const m = this.model;
    m.root.position.set(this.x, this.jumpY, this.z); m.root.rotation.y = -this.a;
    if (this.dead) { m.root.visible = true; m.root.rotation.z = damp(m.root.rotation.z, Math.PI / 2, 10, dt); m.root.position.y = 0.18; return; }
    m.root.rotation.z = 0;
    const aiming = G.input.mouse[0] || G.input.mouse[2] || this.aimT > 0;
    animateWalker(m, Math.hypot(this.vx, this.vz) * (this.sprint ? 0.9 : 1), dt, aiming);
    const wd = WEAPONS[this.w];
    if (this.swingT > 0) { const k = 1 - this.swingT / 0.32; m.armR.rotation.z = 2.6 - k * 3.0; m.body.rotation.y = (k - 0.5) * (wd.melee ? 0.9 : 0.3); }
    else { m.body.rotation.y *= 0.7; if (aiming && !wd.melee) m.armR.rotation.z = 1.5 + this.gunKick * 0.12; else m.armR.rotation.z = m.armR.rotation.z * 0.4 + (wd.melee ? 0.9 : 0.2); }
    if (this.hurtT > 0) m.root.position.y += Math.sin(G.time * 50) * 0.02;
  }
}
