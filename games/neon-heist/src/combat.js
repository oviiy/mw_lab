import * as THREE from 'three';
import { G } from './state.js';
import { rand, dist } from './util.js';
import { damageCar } from './vehicles.js';
import { viaductSurface } from './viaduct.js';
const grenadeGeo = new THREE.SphereGeometry(0.1, 10, 8), grenadeMat = new THREE.MeshStandardMaterial({ color: 0x3a4a2a, roughness: 0.5, metalness: 0.4 });
const deckHit = (x, y, z) => { const s = viaductSurface(x, z); return s > 0.5 && y < s && y > s - 1.15; };

// Index order is fixed (police/heli code uses 0 = pistol, 1 = SMG); WHEEL_ORDER is the on-screen layout.
export const WEAPONS = [
  { id: 'pistol', name: 'Pistol', dmg: 26, rate: 0.26, spread: 0.012, pellets: 1, speed: 320, auto: false, price: 250, pack: 30, packPrice: 40 },
  { id: 'smg', name: 'Micro SMG', dmg: 13, rate: 0.075, spread: 0.035, pellets: 1, speed: 340, auto: true, price: 700, pack: 90, packPrice: 90 },
  { id: 'shotgun', name: 'Pump Shotgun', dmg: 15, rate: 0.85, spread: 0.075, pellets: 7, speed: 260, auto: false, price: 900, pack: 16, packPrice: 80 },
  { id: 'rpg', name: 'Rocket Launcher', dmg: 150, rate: 1.3, spread: 0.004, pellets: 1, speed: 62, auto: false, rocket: true, price: 3500, pack: 4, packPrice: 600 },
  { id: 'rifle', name: 'Assault Rifle', dmg: 20, rate: 0.1, spread: 0.02, pellets: 1, speed: 420, auto: true, price: 1800, pack: 90, packPrice: 150 },
  { id: 'sniper', name: 'Sniper Rifle', dmg: 130, rate: 1.4, spread: 0.0015, pellets: 1, speed: 650, auto: false, price: 2600, pack: 10, packPrice: 180 },
  { id: 'grenade', name: 'Grenades', dmg: 150, rate: 1.0, spread: 0, pellets: 1, speed: 0, auto: false, thrown: true, price: 300, pack: 4, packPrice: 160 },
  { id: 'bat', name: 'Baseball Bat', dmg: 38, rate: 0.55, spread: 0, pellets: 0, speed: 0, auto: false, melee: true, price: 0, pack: 0, packPrice: 0 },
];
export const WHEEL_ORDER = [7, 0, 1, 2, 4, 5, 3, 6];

const rocketGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.9, 8).rotateZ(Math.PI / 2);
const rocketMat = new THREE.MeshStandardMaterial({ color: 0x6b7a4a, metalness: 0.4, roughness: 0.5 });

export class Combat {
  constructor() { this.bullets = []; this.grenades = []; }

  shoot(owner, ox, oy, oz, tx, ty, tz, wid, spreadMul = 1, dmgMul = 1) {
    const w = WEAPONS[wid];
    let dx = tx - ox, dy = ty - oy, dz = tz - oz; const l = Math.hypot(dx, dy, dz) || 1; dx /= l; dy /= l; dz /= l;
    for (let i = 0; i < w.pellets; i++) {
      const s = w.spread * spreadMul;
      let ax = dx + rand(-s, s), ay = dy + rand(-s, s), az = dz + rand(-s, s); const k = Math.hypot(ax, ay, az); ax /= k; ay /= k; az /= k;
      const b = { sx: ox, sz: oz, x: ox, y: oy, z: oz, vx: ax * w.speed, vy: ay * w.speed, vz: az * w.speed, owner, dmg: w.dmg * dmgMul, rocket: !!w.rocket, life: w.rocket ? 4 : 1.1, mesh: null, trail: 0 };
      if (w.rocket) { b.mesh = new THREE.Mesh(rocketGeo, rocketMat); b.mesh.position.set(ox, oy, oz); b.mesh.lookAt(ox + ax, oy + ay, oz + az); b.mesh.rotateY(-Math.PI / 2); G.scene.add(b.mesh); }
      this.bullets.push(b);
    }
    G.fx.muzzle(ox + dx * 0.4, oy, oz + dz * 0.4, dx, dz);
    G.audio.shot(w.id, ox, oz);
    if (owner === 'p') { G.peds.scare(ox, oz, 55, ox, oz); if (!w.rocket) G.police.crime(1, ox, oz); }
  }

  throwGrenade(x, y, z, vx, vy, vz) {
    const mesh = new THREE.Mesh(grenadeGeo, grenadeMat);
    mesh.position.set(x, y, z); mesh.castShadow = true; G.scene.add(mesh);
    this.grenades.push({ x, y, z, vx, vy, vz, fuse: 2.3, mesh });
    G.audio.door();
  }

  // Ray-march from the camera to find what the crosshair is over.
  aimPoint(ox, oy, oz, dx, dy, dz, max = 160, ignoreCar = null) {
    const city = G.city;
    for (let t = 2; t < max; t += 0.9) {
      const x = ox + dx * t, y = oy + dy * t, z = oz + dz * t;
      if (y < 0.1) return [x, 0.1, z];
      if (y < city.heightAt(x, z) || deckHit(x, y, z)) return [x, y, z];
      for (const c of G.traffic.cars) { if (c === ignoreCar) continue; if (Math.abs(c.x - x) > c.def.len || Math.abs(c.z - z) > c.def.len) continue; if (this.inCar(c, x, y, z)) return [x, y, z]; }
      for (const p of G.peds.list) if (p.state !== 'dead' && Math.abs(p.x - x) < 0.6 && Math.abs(p.z - z) < 0.6 && y < 1.9) return [x, y, z];
    }
    return [ox + dx * max, oy + dy * max, oz + dz * max];
  }

  inCar(c, x, y, z) {
    if (y > c.def.h + c.y || y < c.y) return false;
    const dx = x - c.x, dz = z - c.z, ca = Math.cos(c.a), sa = Math.sin(c.a);
    return Math.abs(dx * ca + dz * sa) < c.def.len / 2 && Math.abs(-dx * sa + dz * ca) < c.def.wid / 2;
  }

  updateGrenades(dt) {
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i]; g.vy -= 20 * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.z += g.vz * dt; g.fuse -= dt;
      if (deckHit(g.x, g.y, g.z)) { g.y = viaductSurface(g.x, g.z) + 0.12; g.vy = Math.abs(g.vy) * 0.35; g.vx *= 0.7; g.vz *= 0.7; }
      if (g.y < 0.12) { g.y = 0.12; g.vy = Math.abs(g.vy) * 0.35; g.vx *= 0.7; g.vz *= 0.7; if (g.vy < 1) g.vy = 0; }
      const rs = G.city.nearRects(g.x, g.z);
      for (let k = 0; k < rs.length; k++) { const r = rs[k]; if (g.y < r.h && g.y > (r.y0 || 0) && g.x > r.x && g.x < r.x + r.w && g.z > r.z && g.z < r.z + r.d) { g.x -= g.vx * dt * 1.5; g.z -= g.vz * dt * 1.5; g.vx *= -0.35; g.vz *= -0.35; break; } }
      g.mesh.position.set(g.x, g.y, g.z); g.mesh.rotation.x += dt * 8;
      if (g.fuse < 0.9 && Math.random() < dt * 20) G.fx.spark(g.x, g.y + 0.1, g.z, 1);
      if (g.fuse <= 0) { G.scene.remove(g.mesh); this.grenades.splice(i, 1); this.explode(g.x, Math.max(0.8, g.y), g.z, 9.5, 150, 'p'); }
    }
  }

  update(dt) {
    this.updateGrenades(dt);
    const city = G.city, pl = G.player;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      const steps = Math.max(1, Math.ceil((Math.hypot(b.vx, b.vz) * dt) / 1.6)), sdt = dt / steps;
      let dead = false, hx = b.x, hy = b.y, hz = b.z;
      for (let s = 0; s < steps && !dead; s++) {
        b.x += b.vx * sdt; b.y += b.vy * sdt; b.z += b.vz * sdt; hx = b.x; hy = b.y; hz = b.z;
        if (b.y < 0.05) { dead = true; G.fx.dust(b.x, 0.1, b.z, 2); break; }
        if (deckHit(b.x, b.y, b.z)) { dead = true; G.fx.spark(b.x, b.y, b.z, 4); G.fx.dust(b.x, b.y, b.z, 2); break; }
        const rs = city.nearRects(b.x, b.z);
        for (let k = 0; k < rs.length; k++) {
          const r = rs[k];
          if (b.x > r.x && b.x < r.x + r.w && b.z > r.z && b.z < r.z + r.d && b.y < r.h && b.y > (r.y0 || 0) - 0.5) { dead = true; G.fx.spark(b.x, b.y, b.z, 4); G.fx.dust(b.x, b.y, b.z, 2); break; }
        }
        if (dead) break;
        for (const p of G.peds.list) {
          if (p.state === 'dead' || (b.owner === 'c' && p.type === 'cop')) continue;
          if (b.y < 1.85 && (p.x - b.x) ** 2 + (p.z - b.z) ** 2 < 0.28) { G.peds.hurt(p, b.dmg, b.owner); if (b.owner === 'p') G.hud.hitMarker(); G.audio.thud(p.x, p.z); dead = true; break; }
        }
        if (dead) break;
        for (const c of G.traffic.cars) {
          if (b.owner === 'p' && c === pl.car) continue;
          if (b.owner === 'c' && c.type === 'cop') continue;
          if (Math.abs(c.x - b.x) > c.def.len || Math.abs(c.z - b.z) > c.def.len) continue;
          if (this.inCar(c, b.x, b.y, b.z)) {
            damageCar(c, b.dmg * 0.75, b.owner); G.fx.spark(b.x, b.y, b.z, 5);
            if (c === pl.car && b.owner === 'c') pl.hurt(b.dmg * 0.3, b.sx, b.sz);
            if (b.owner === 'p') G.hud.hitMarker();
            dead = true; break;
          }
        }
        if (dead) break;
        if (b.owner === 'c' && !pl.dead && !pl.car && b.y < 1.8 && (pl.x - b.x) ** 2 + (pl.z - b.z) ** 2 < 0.4) { pl.hurt(b.dmg, b.sx, b.sz); dead = true; G.fx.bloodSplat(b.x, b.y, b.z, 4); break; }
        const h = G.police.heli;
        if (b.owner === 'p' && h && Math.hypot(h.x - b.x, h.y - b.y, h.z - b.z) < 3.6) { h.hp -= b.rocket ? 160 : b.dmg * 0.8; G.fx.spark(b.x, b.y, b.z, 4); dead = true; break; }
      }
      b.life -= dt;
      if (b.rocket) {
        b.trail -= dt;
        if (b.mesh) b.mesh.position.set(b.x, b.y, b.z);
        G.fx.smoke(b.x - b.vx * 0.02, b.y, b.z - b.vz * 0.02, 0.5, 1.2, 0.5); G.fx.fire(b.x, b.y, b.z, 0.5);
      }
      if (dead || b.life <= 0) {
        if (b.rocket) { this.explode(hx, Math.max(1, hy), hz, 12, b.dmg, b.owner); if (b.mesh) G.scene.remove(b.mesh); }
        this.bullets.splice(i, 1);
      }
    }
  }

  explode(x, y, z, rad, dmg, by) {
    G.fx.explosion(x, y, z, rad); G.audio.boom(x, z);
    for (const c of G.traffic.cars) {
      const d = Math.hypot(c.x - x, c.z - z, c.y + 0.8 - y);
      if (d < rad + 3) {
        const f = 1 - d / (rad + 3), a = Math.atan2(c.z - z, c.x - x);
        c.vx += (Math.cos(a) * 28 * f) / c.def.mass; c.vz += (Math.sin(a) * 28 * f) / c.def.mass; if (!c.dead) c.vy = Math.max(c.vy, 3 * f);
        damageCar(c, dmg * f, by);
      }
    }
    for (const p of G.peds.list) {
      const d = Math.hypot(p.x - x, p.z - z, 1 - y);
      if (d < rad && p.state !== 'dead') { const f = 1 - d / rad, a = Math.atan2(p.z - z, p.x - x); p.vx = Math.cos(a) * 14 * f; p.vz = Math.sin(a) * 14 * f; p.fly = 4; G.peds.hurt(p, dmg * f * 2, by); }
    }
    const pl = G.player;
    if (!pl.dead && !pl.car) { const d = Math.hypot(pl.x - x, pl.z - z, 1 - y); if (d < rad) { const f = 1 - d / rad; pl.hurt(dmg * f * 0.8); const a = Math.atan2(pl.z - z, pl.x - x); pl.vx += Math.cos(a) * 12 * f; pl.vz += Math.sin(a) * 12 * f; } }
    const h = G.police.heli; if (h && Math.hypot(h.x - x, h.y - y, h.z - z) < rad + 6) h.hp -= dmg * 1.5;
    G.peds.scare(x, z, 90, x, z);
    if (by === 'p') G.police.crime(1, x, z);
  }
}
