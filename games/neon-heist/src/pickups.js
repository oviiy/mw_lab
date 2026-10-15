import * as THREE from 'three';
import { G } from './state.js';
import { B, N, W, rand, dist } from './util.js';
import { glowTexture } from './textures.js';
import { WEAPONS } from './combat.js';

const glowMat = (c) => new THREE.SpriteMaterial({ map: glowTexture(), color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 });
const mats = {
  cash: new THREE.MeshStandardMaterial({ color: 0x2e9c45, emissive: 0x0a4a18, roughness: 0.5 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5, emissive: 0x333333 }),
  red: new THREE.MeshStandardMaterial({ color: 0xe02020, emissive: 0x801010 }),
  olive: new THREE.MeshStandardMaterial({ color: 0x5b6b3d, roughness: 0.6 }),
};
const glows = { cash: glowMat(0x55ff88), hp: glowMat(0xff5555), rpg: glowMat(0xffb040), gun: glowMat(0x58a6ff) };

function makeItem(k) {
  const g = new THREE.Group(), add = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  if (k === 'cash') { add(new THREE.BoxGeometry(0.7, 0.14, 0.36), mats.cash, 0, 0, 0); add(new THREE.BoxGeometry(0.7, 0.14, 0.36), mats.cash, 0.04, 0.15, 0.02).rotation.y = 0.3; add(new THREE.BoxGeometry(0.2, 0.3, 0.38), mats.white, 0, 0.08, 0); }
  else if (k === 'hp') { add(new THREE.BoxGeometry(0.55, 0.55, 0.55), mats.white); add(new THREE.BoxGeometry(0.14, 0.58, 0.58), mats.red); add(new THREE.BoxGeometry(0.58, 0.14, 0.58), mats.red); }
  else if (k === 'gun') { add(new THREE.BoxGeometry(1.0, 0.18, 0.4), mats.olive); add(new THREE.BoxGeometry(0.5, 0.2, 0.3), mats.white, -0.1, 0.19); add(new THREE.BoxGeometry(0.12, 0.3, 0.12), mats.olive, 0.3, -0.2); }
  else { add(new THREE.BoxGeometry(0.9, 0.45, 0.45), mats.olive); add(new THREE.BoxGeometry(0.18, 0.47, 0.47), mats.red, 0.25); }
  const s = new THREE.Sprite(glows[k]); s.scale.set(2.2, 2.2, 1); g.add(s);
  return g;
}

export class Pickups {
  constructor() {
    this.items = [];
    for (let n = 0; n < 60; n++) {
      const bk = G.city.blocks[Math.floor(Math.random() * N)][Math.floor(Math.random() * N)], side = Math.floor(Math.random() * 4), t = rand(10, bk.s - 10), m = 2.6;
      const x = side === 0 ? bk.x + t : side === 1 ? bk.x + bk.s - m : side === 2 ? bk.x + t : bk.x + m, z = side === 0 ? bk.z + m : side === 1 ? bk.z + t : side === 2 ? bk.z + bk.s - m : bk.z + t;
      const r = Math.random(); const it = this.add(x, z, r < 0.62 ? 'cash' : r < 0.9 ? 'hp' : r < 0.95 ? 'rpg' : 'gun', Math.floor(rand(20, 120)), 0); it.once = it.k === 'rpg' || it.k === 'gun'; // weapons are rare, one-off finds
    }
  }
  add(x, z, k, amt, ttl, y = 0) {
    const mesh = makeItem(k); mesh.position.set(x, y + 0.9, z); G.scene.add(mesh);
    const it = { x, z, y, k, amt, ttl, t: 0, mesh, ph: Math.random() * 6 }; this.items.push(it); return it;
  }
  dropCash(x, z, amt) { this.add(x + rand(-0.8, 0.8), z + rand(-0.8, 0.8), 'cash', amt, 60); }

  update(dt) {
    const pl = G.player;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if (it.ttl > 0) { it.ttl -= dt; if (it.ttl <= 0) { G.scene.remove(it.mesh); this.items.splice(i, 1); continue; } }
      if (it.t > 0) { it.t -= dt; it.mesh.visible = false; continue; }
      const d = dist(it.x, it.z, pl.x, pl.z);
      it.mesh.visible = d < 170;
      if (!it.mesh.visible) continue;
      it.mesh.rotation.y += dt * 2; it.mesh.position.y = it.y + 0.9 + Math.sin(G.time * 3 + it.ph) * 0.15;
      if (pl.dead || d > (pl.car ? 3.2 : 1.7) || Math.abs((pl.car ? pl.car.y : 0) - it.y) > 3) continue;
      if (it.k === 'cash') { G.money += it.amt; G.audio.cash(); G.hud.toast('+$' + it.amt, 1.2); }
      else if (it.k === 'hp') { if (pl.hp >= 100) continue; pl.hp = Math.min(100, pl.hp + 50); G.hud.toast('Health +50', 1.2); G.audio.cash(); }
      else if (it.k === 'gun') { const g = [1, 2, 4, 6][Math.floor(Math.random() * 4)], w = WEAPONS[g]; pl.giveWeapon(g, w.pack); G.hud.toast(`${w.name} (+${w.pack})`, 2); G.audio.cash(); if (!pl.canUse(pl.w)) pl.setWeapon(g, true); }
      else { pl.giveWeapon(3, 4); G.hud.toast('Rocket Launcher (+4 rockets)', 1.8); G.audio.cash(); }
      if (it.ttl > 0 || it.once) { G.scene.remove(it.mesh); this.items.splice(i, 1); } else it.t = it.k === 'cash' ? 150 : 60;
    }
  }
}

/* ---------- courier jobs ---------- */
const markerGeo = new THREE.CylinderGeometry(3, 3, 60, 20, 1, true).translate(0, 30, 0);
const ringGeo = new THREE.TorusGeometry(3.2, 0.18, 8, 36).rotateX(Math.PI / 2);
function makeMarker(color) {
  const g = new THREE.Group();
  const beam = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color })); ring.position.y = 0.4;
  g.add(beam, ring); g.userData.noAO = true; g.visible = false; G.scene.add(g); g.userData.ring = ring; return g;
}

export class Missions {
  constructor() {
    this.st = 'idle'; this.t = 8; this.x = 0; this.z = 0; this.tx = 0; this.tz = 0; this.time = 0; this.pay = 0;
    this.offer = makeMarker(0xffd23a); this.dest = makeMarker(0x40e0ff);
  }
  roadPoint(cx, cz, mn, mx) {
    for (let i = 0; i < 30; i++) {
      const a = rand(0, 6.28), d = rand(mn, mx); let x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (Math.random() < 0.5) z = Math.round(z / B) * B; else x = Math.round(x / B) * B;
      if (x > 20 && x < W - 20 && z > 20 && z < W - 20) return { x, z };
    }
    return { x: W / 2, z: W / 2 };
  }
  update(dt) {
    const pl = G.player;
    if (pl.dead) { if (this.st === 'run') { this.st = 'idle'; this.t = 8; } }
    else if (this.st === 'idle') { this.t -= dt; if (this.t <= 0) { const p = this.roadPoint(pl.x, pl.z, 180, 450); this.x = p.x; this.z = p.z; this.st = 'offer'; G.hud.toast('New courier job — find the yellow marker', 3); } }
    else if (this.st === 'offer') {
      if (dist(pl.x, pl.z, this.x, this.z) < 5) {
        if (pl.car) {
          const p = this.roadPoint(this.x, this.z, 450, 950), d = dist(p.x, p.z, this.x, this.z);
          this.tx = p.x; this.tz = p.z; this.pay = Math.round((200 + d * 1.1) / 10) * 10; this.time = d / 22 + 25; this.st = 'run'; G.hud.toast('Package loaded — deliver it fast!', 3); G.audio.cash();
        } else G.hud.toast('You need a vehicle for this job.', 1.2);
      }
    } else if (this.st === 'run') {
      this.time -= dt;
      if (pl.car && dist(pl.x, pl.z, this.tx, this.tz) < 6) { G.money += this.pay; G.stats.jobs++; G.audio.cash(); G.hud.big(`JOB DONE  +$${this.pay}`, 2.4, '#7ed957'); this.st = 'idle'; this.t = 10; }
      else if (this.time <= 0) { G.hud.toast('Delivery failed — too slow.', 3); this.st = 'idle'; this.t = 8; }
    }
    this.offer.visible = this.st === 'offer'; this.dest.visible = this.st === 'run';
    this.offer.position.set(this.x, 0, this.z); this.dest.position.set(this.tx, 0, this.tz);
    for (const m of [this.offer, this.dest]) if (m.visible) m.userData.ring.scale.setScalar(1 + Math.sin(G.time * 5) * 0.1);
  }
}
