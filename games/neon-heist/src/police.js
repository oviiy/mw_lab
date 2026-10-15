import * as THREE from 'three';
import { G } from './state.js';
import { dist, rand, clamp, TAU, B, N } from './util.js';
import { cornerPt } from './peds.js';
import { VD } from './viaduct.js';

const SEEN_R = 85;
const HEAT = [1, 4, 10, 18, 30]; // heat needed for 1..5 stars

function buildHeli() {
  const g = new THREE.Group(), add = (geo, m, x, y, z, p = g) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o; };
  const body = new THREE.MeshStandardMaterial({ color: 0x1b2f66, metalness: 0.5, roughness: 0.35 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x8cd0ee, metalness: 0.9, roughness: 0.05 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x151518, roughness: 0.6 });
  add(new THREE.SphereGeometry(1.5, 14, 10).scale(1.5, 1, 1), body, 0, 0, 0);
  add(new THREE.SphereGeometry(1.05, 12, 8).scale(1, 0.85, 0.95), glass, 1.35, 0.15, 0);
  add(new THREE.BoxGeometry(5.2, 0.35, 0.35), body, -3.6, 0.25, 0);
  add(new THREE.BoxGeometry(0.9, 1.2, 0.12), body, -6.1, 0.8, 0);
  for (const z of [-1, 1]) { add(new THREE.BoxGeometry(3.4, 0.1, 0.1), dark, 0, -1.55, z * 1.0); add(new THREE.BoxGeometry(0.1, 0.8, 0.1), dark, 0.9, -1.15, z * 1.0); add(new THREE.BoxGeometry(0.1, 0.8, 0.1), dark, -0.9, -1.15, z * 1.0); }
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.5), dark, 0, 1.3, 0);
  const rotor = new THREE.Group(); rotor.position.y = 1.6; g.add(rotor);
  for (let i = 0; i < 4; i++) { const b = add(new THREE.BoxGeometry(7.5, 0.04, 0.35), dark, 0, 0, 0, rotor); b.position.x = 0; b.rotation.y = (i * Math.PI) / 2; b.scale.x = 1; }
  const tail = new THREE.Group(); tail.position.set(-6.1, 0.9, 0.15); g.add(tail); add(new THREE.BoxGeometry(0.08, 1.3, 0.1), dark, 0, 0, 0, tail);
  const red = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2222 })); red.position.set(0, 1.0, 0); g.add(red);
  const blue = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0x3344ff })); blue.position.set(0, -1.1, 0); g.add(blue);
  return { group: g, rotor, tail, red, blue };
}

export class Police {
  constructor() {
    this.heli = null; this.heliModel = null; this.copT = 0;
    this.light = new THREE.SpotLight(0xfff3d0, 0, 140, 0.13, 0.5, 1.2); this.light.target = new THREE.Object3D();
    G.scene.add(this.light, this.light.target);
    this.cone = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 24, 1, true).translate(0, -0.5, 0), new THREE.MeshBasicMaterial({ color: 0xfff3d0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    this.cone.visible = false; this.cone.userData.noAO = true; G.scene.add(this.cone);
  }

  // A crime only counts if a cop (or the heli) can see it, unless forced.
  // Crimes add "heat"; heat thresholds escalate the star level (so 4-5 stars and the heli are reachable).
  crime(n, x, z, force = false) {
    if (G.cheats.cops) return;
    if (!force && !this.witness(x, z, 70)) return;
    G.heat = (G.heat || 0) + [0, 1, 2.5, 5, 8, 12][n];
    const lvl = HEAT.reduce((l, t, i) => (G.heat >= t ? i + 1 : l), 0);
    const nw = Math.min(5, Math.max(G.wanted, n, lvl));
    if (nw > G.wanted) { G.wanted = nw; G.hud.toast(nw >= 4 ? 'WANTED — they are sending everything!' : nw >= 3 ? 'WANTED' : 'Cops are on your tail!', 1.8); }
    G.wantedT = 0;
  }
  witness(x, z, r) {
    const py = this.playerY();
    for (const c of G.traffic.cars) if (c.type === 'cop' && !c.dead && Math.abs(c.y - py) < 3 && dist(c.x, c.z, x, z) < r) return true;
    for (const p of G.peds.list) if (p.type === 'cop' && p.state !== 'dead' && py < 2 && dist(p.x, p.z, x, z) < r) return true;
    return !!this.heli && dist(this.heli.x, this.heli.z, x, z) < r * 1.5;
  }
  playerY() { const pl = G.player; return pl.car ? pl.car.y : 0; }
  // Can any cop actually see the player right now? (distance, height and line of sight)
  seen() {
    const pl = G.player, py = this.playerY();
    for (const c of G.traffic.cars) if (c.type === 'cop' && !c.dead && Math.abs(c.y - py) < 3 && dist(c.x, c.z, pl.x, pl.z) < SEEN_R && (c.y > 3 || G.city.losClear(c.x, c.z, pl.x, pl.z, 2.5))) return true;
    if (py < 2) for (const p of G.peds.list) if (p.type === 'cop' && p.state !== 'dead' && dist(p.x, p.z, pl.x, pl.z) < SEEN_R * 0.8 && G.city.losClear(p.x, p.z, pl.x, pl.z, 2.5)) return true;
    return !!this.heli && !this.heli.leave && dist(this.heli.x, this.heli.z, pl.x, pl.z) < SEEN_R * 1.4;
  }
  // Where chasing cars should drive to: the player, or the nearest Skyway ramp mouth when the player is up on the deck.
  chasePoint() {
    const pl = G.player;
    if (this.playerY() > 3) { // the nearest way up: end ramps or the mid-city slip ramps
      let best = null, bd = 1e9;
      for (const [x, z] of [[VD.xa - 6, VD.zc], [VD.xd + 6, VD.zc], ...VD.mid]) { const d = Math.abs(x - pl.x); if (d < bd) { bd = d; best = { x, z }; } }
      return best;
    }
    return { x: pl.x, z: pl.z };
  }
  onCopKilled() { G.stats.cops++; }

  reset() {
    G.wanted = 0; G.wantedT = 0; G.heat = 0;
    if (this.heli) this.removeHeli();
    G.peds.clearCops();
    for (const c of G.traffic.cars) if (c.mode === 'chase') c.mode = 'cruise';
  }

  footCop(p, dt) {
    const pl = G.player; p.life += dt; p.cool -= dt;
    const dx = pl.x - p.x, dz = pl.z - p.z, d = Math.hypot(dx, dz), a = Math.atan2(dz, dx);
    if (G.wanted === 0 || pl.dead) { // stand down: walk away and despawn out of sight
      p.aiming = false; p.a = a + Math.PI; p.vx = -Math.cos(a) * 1.6; p.vz = -Math.sin(a) * 1.6; G.city.moveCircle(p, 0.4, dt);
      if (d > 45 || p.life > 40) { p.state = 'dead'; p.t = 99; p.model.root.visible = false; }
      return;
    }
    p.a = a;
    const playerArmed = !pl.car && pl.w !== 7 && (G.input.mouse[2] || pl.aimT > 0);
    const arrest = !pl.car && G.wanted <= 2 && !playerArmed && this.playerY() < 2; // close in and cuff
    let sp = 0;
    if (arrest) sp = d > 1.2 ? (d > 12 ? 6.4 : 3.8) : 0;
    else if (d > 16) sp = 6.4; else if (d < 7) sp = -2.5;
    p.vx = Math.cos(a) * sp; p.vz = Math.sin(a) * sp;
    G.city.moveCircle(p, 0.4, dt);
    const was = p.aiming; p.aiming = d < 70;
    if (p.aiming && !was) G.peds.say(p, pl.car ? 'copShots' : 'copFreeze', true);
    const shoot = G.wanted >= 3 || playerArmed || pl.car || (G.heat || 0) >= 3;
    if (shoot && !pl.dead && d < 70 && p.cool <= 0 && G.city.losClear(p.x, p.z, pl.x, pl.z, 1.3)) {
      p.cool = rand(0.55, 1.05); if (Math.random() < 0.12) G.peds.say(p, 'copDrop');
      G.combat.shoot('c', p.x + Math.cos(a) * 0.8, 1.3, p.z + Math.sin(a) * 0.8, pl.x, this.playerY() + 1.1, pl.z, 0, 2.6, 0.35);
    }
    if (!pl.car && !pl.dead && d < 1.9) {
      pl.bust += dt; G.peds.say(p, 'copArrest');
      if (pl.bust > 1.6) pl.die('BUSTED');
    } else if (d > 4) pl.bust = Math.max(0, pl.bust - dt * 0.5);
  }

  update(dt) {
    const pl = G.player, cars = G.traffic.cars, py = this.playerY();
    if (G.wanted > 0 && !pl.dead) {
      if (this.seen()) { G.wantedT = 0; this.lastSeen = { x: pl.x, z: pl.z }; }
      else {
        G.wantedT += dt;
        if (G.wantedT > 8 + G.wanted * 2) { G.wantedT = 0; G.wanted--; G.heat = G.wanted ? HEAT[G.wanted - 1] : 0; G.hud.toast(G.wanted ? 'Wanted level decreased' : 'You lost the cops', 2.5); }
      }
    }
    let nCops = 0; for (const c of cars) if (c.type === 'cop' && !c.dead) nCops++;
    const want = G.wanted > 0 ? G.wanted * 2 + 1 : 2;
    if (nCops < want && Math.random() < dt * (G.wanted ? 1.6 : 0.3)) {
      const c = py > 3 && Math.random() < 0.6 ? G.traffic.spawnHighway('cop') : G.traffic.spawn('cop');
      if (c && G.wanted > 0) c.mode = 'chase';
    }
    if (G.wanted > 0) for (const c of cars) if (c.type === 'cop' && c.ai && c.mode !== 'chase') c.mode = 'chase';
    // cops pile out when they catch up (only at street level)
    if (G.wanted > 0 && !pl.dead && py < 2) {
      let foot = 0; for (const p of G.peds.list) if (p.type === 'cop' && p.state !== 'dead') foot++;
      if (foot < G.wanted * 2 + 1) for (const c of cars) {
        if (c.type !== 'cop' || !c.ai || c.dead || c.y > 1) continue;
        if (dist(c.x, c.z, pl.x, pl.z) < 26 && (pl.car ? Math.abs(pl.car.fw) < 6 : true) && Math.abs(c.fw) < 11 && Math.random() < dt * 0.9) {
          const a = c.a - Math.PI / 2, p = G.peds.create(c.x + Math.cos(a) * 2.4, c.z + Math.sin(a) * 2.4, 'cop'); p.life = 0; break;
        }
      }
    }
    this.updateHeli(dt);
  }

  updateHeli(dt) {
    const pl = G.player;
    if (G.wanted >= 4 && !this.heli && !pl.dead) {
      const a = rand(0, TAU);
      this.heli = { x: pl.x + Math.cos(a) * 300, y: 34, z: pl.z + Math.sin(a) * 300, vx: 0, vz: 0, hp: 320, cool: 1, leave: false, a: 0 };
      this.heliModel ||= buildHeli(); G.scene.add(this.heliModel.group); this.heli.burst = 0; G.hud.toast('Police helicopter inbound!', 2.5);
    }
    const h = this.heli; if (!h) { this.light.intensity = 0; this.cone.visible = false; return; }
    if (G.wanted < 4 || pl.dead) h.leave = true;
    const tx = h.leave ? h.x + (h.x - pl.x) : pl.x, tz = h.leave ? h.z + (h.z - pl.z) : pl.z, d = dist(h.x, h.z, tx, tz), a = Math.atan2(tz - h.z, tx - h.x);
    const want = h.leave ? 36 : d > 55 ? 40 : d < 28 ? -14 : 0;
    h.vx += (Math.cos(a) * want - h.vx) * dt * 1.2; h.vz += (Math.sin(a) * want - h.vz) * dt * 1.2; h.x += h.vx * dt; h.z += h.vz * dt;
    h.a = Math.atan2(pl.z - h.z, pl.x - h.x); h.cool -= dt;
    if (!h.leave && d < 110 && h.cool <= 0 && !pl.dead) { // bursts of ~6 rounds, then a pause
      h.burst = (h.burst || 0) + 1; h.cool = h.burst % 6 === 0 ? 2.4 : 0.12;
      G.combat.shoot('c', h.x, h.y - 1, h.z, pl.x, this.playerY() + 1.2, pl.z, 1, 4, 0.5);
    }
    if (h.hp <= 0) {
      G.combat.explode(h.x, h.y, h.z, 14, 60, 'p'); G.money += 500; G.hud.toast('Helicopter down!  +$500', 3);
      this.removeHeli(); this.crime(5, pl.x, pl.z, true); return;
    }
    if (h.leave && dist(h.x, h.z, pl.x, pl.z) > 420) { this.removeHeli(); return; }
    const m = this.heliModel; m.group.position.set(h.x, h.y + Math.sin(G.time * 1.4) * 0.5, h.z); m.group.rotation.y = -h.a; m.group.rotation.z = clamp(Math.hypot(h.vx, h.vz) * -0.01, -0.3, 0); m.rotor.rotation.y += dt * 40; m.tail.rotation.z += dt * 50;
    const ph = Math.floor(G.time * 6) % 2; m.red.visible = !!ph; m.blue.visible = !ph;
    // searchlight
    const n = G.night;
    this.light.position.set(h.x, h.y - 1, h.z); this.light.target.position.set(pl.x, 0, pl.z); this.light.intensity = 600 + n * 6000;
    const len = Math.hypot(pl.x - h.x, h.y - 1, pl.z - h.z);
    this.cone.visible = n > 0.1; this.cone.material.opacity = 0.09 * n;
    this.cone.position.set(h.x, h.y - 1, h.z); this.cone.scale.set(len * 0.13, len, len * 0.13);
    this.cone.lookAt(pl.x, 0, pl.z); this.cone.rotateX(-Math.PI / 2);
  }
  removeHeli() { if (this.heliModel) G.scene.remove(this.heliModel.group); this.heli = null; this.light.intensity = 0; this.cone.visible = false; }
}
