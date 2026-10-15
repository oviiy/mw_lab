import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { G } from './state.js';
import { B, N, clamp, rand, pick, dist, damp } from './util.js';
import { line } from './speech.js';

/* ---------- low-poly humanoid ---------- */
const matCache = new Map();
const mat = (c) => { let m = matCache.get(c); if (!m) { m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.78, metalness: 0.02 }); matCache.set(c, m); } return m; };
const GEO = {
  torso: new THREE.CapsuleGeometry(0.17, 0.3, 4, 12).scale(0.85, 1, 1.55).translate(0, 0.3, 0),
  hips: new THREE.SphereGeometry(0.17, 10, 8).scale(0.9, 0.75, 1.45).translate(0, 0, 0),
  thigh: new THREE.CapsuleGeometry(0.1, 0.3, 4, 8).translate(0, -0.22, 0),
  shin: new THREE.CapsuleGeometry(0.083, 0.3, 4, 8).translate(0, -0.2, 0),
  shoe: new THREE.BoxGeometry(0.29, 0.09, 0.14).translate(0.07, -0.42, 0),
  nose: new THREE.BoxGeometry(0.04, 0.05, 0.034),
  mouth: new THREE.BoxGeometry(0.01, 0.012, 0.055),
  brow: new THREE.BoxGeometry(0.014, 0.013, 0.045),
  ear: new THREE.SphereGeometry(0.03, 6, 5).scale(0.5, 1, 0.45),
  belt: new THREE.CylinderGeometry(0.165, 0.165, 0.045, 12).scale(0.92, 1, 1.5),
  longHair: new THREE.CapsuleGeometry(0.1, 0.22, 4, 8).scale(0.8, 1, 1.35),
  skirt: new THREE.CylinderGeometry(0.19, 0.3, 0.42, 12).scale(1, 1, 1.35),
  arm: new THREE.CapsuleGeometry(0.058, 0.4, 4, 8).translate(0, -0.3, 0),
  hand: new THREE.SphereGeometry(0.062, 8, 6),
  neck: new THREE.CylinderGeometry(0.05, 0.06, 0.1, 8),
  head: new THREE.SphereGeometry(0.125, 12, 10).scale(0.95, 1.12, 0.95),
  eye: new THREE.SphereGeometry(0.014, 6, 5),
  hair: new THREE.SphereGeometry(0.135, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58),
  bun: new THREE.SphereGeometry(0.06, 8, 6),
  cap: new THREE.CylinderGeometry(0.13, 0.14, 0.09, 12),
  brim: new THREE.BoxGeometry(0.17, 0.02, 0.2).translate(0.1, 0, 0),
  gun: new THREE.BoxGeometry(0.1, 0.42, 0.07),
};
const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0e, roughness: 0.3 }), shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.6 });
const PED_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.02 });
// Merge parts (each with a flat colour) into a single vertex-coloured geometry: one draw call per limb.
function bakeColored(list) {
  const gs = list.map((p) => {
    let g = p.geo.clone(); if (g.index) g = g.toNonIndexed(); g.translate(p.x || 0, p.y || 0, p.z || 0);
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    const c = new THREE.Color(p.color), n = g.attributes.position.count, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3)); return g;
  });
  const g = mergeGeometries(gs); g.userData.own = true; return g;
}
export function disposePed(model) { model.root.traverse((o) => { if (o.geometry && o.geometry.userData.own) o.geometry.dispose(); }); }

export function makePedModel({ shirt, pants, skin, hair, cop = false, gun = false, fem = false, skirt = false, build = 1, height = 1 }) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  root.scale.set(build, height, build);
  const mk = (list) => { const m = new THREE.Mesh(bakeColored(list), PED_MAT); m.castShadow = true; return m; };
  const lip = new THREE.Color(skin).multiplyScalar(0.62).getHex(), nose = new THREE.Color(skin).multiplyScalar(0.9).getHex();
  const torso = [
    { geo: GEO.torso, color: shirt, y: 0.86 }, { geo: GEO.hips, color: skirt ? skin : pants, y: 0.9 }, { geo: GEO.neck, color: skin, y: 1.5 },
    { geo: GEO.head, color: skin, x: 0.015, y: 1.66 }, { geo: GEO.eye, color: 0x0b0b0e, x: 0.112, y: 1.68, z: 0.045 }, { geo: GEO.eye, color: 0x0b0b0e, x: 0.112, y: 1.68, z: -0.045 },
    { geo: GEO.nose, color: nose, x: 0.13, y: 1.645 }, { geo: GEO.mouth, color: lip, x: 0.122, y: 1.6 }, { geo: GEO.ear, color: skin, x: 0.0, y: 1.66, z: 0.118 }, { geo: GEO.ear, color: skin, x: 0.0, y: 1.66, z: -0.118 },
    { geo: GEO.brow, color: hair, x: 0.117, y: 1.712, z: 0.046 }, { geo: GEO.brow, color: hair, x: 0.117, y: 1.712, z: -0.046 },
  ];
  if (skirt) torso.push({ geo: GEO.skirt, color: pants, y: 0.8 }); else torso.push({ geo: GEO.belt, color: 0x1a1612, y: 1.0 });
  if (cop) { torso.push({ geo: GEO.cap, color: 0x0d1a40, x: 0.02, y: 1.76 }, { geo: GEO.brim, color: 0x0a1230, x: 0.02, y: 1.72 }); }
  else {
    torso.push({ geo: GEO.hair, color: hair, x: -0.008, y: 1.68 });
    if (fem) torso.push({ geo: GEO.longHair, color: hair, x: -0.07, y: 1.52 }); else if (Math.random() < 0.15) torso.push({ geo: GEO.bun, color: hair, x: -0.1, y: 1.76 });
  }
  body.add(mk(torso));
  const limb = (parts, y, z) => { const g = new THREE.Group(); g.position.set(0, y, z); g.add(mk(parts)); body.add(g); return g; };
  const legCol = skirt ? skin : pants;
  const leg = (z) => { const g = limb([{ geo: GEO.thigh, color: legCol }], 0.88, z), sh = new THREE.Group(); sh.position.y = -0.44; sh.add(mk([{ geo: GEO.shin, color: legCol }, { geo: GEO.shoe, color: 0x1a1a1c }])); g.add(sh); g.userData.shin = sh; return g; };
  const arm = [{ geo: GEO.arm, color: shirt }, { geo: GEO.hand, color: skin, y: -0.58 }];
  const legL = leg(0.1), legR = leg(-0.1), armL = limb(arm, 1.42, 0.3), armR = limb(arm, 1.42, -0.3);
  let gunMesh = null;
  if (gun || cop) { gunMesh = new THREE.Mesh(GEO.gun, mat(0x181818)); gunMesh.position.set(0.03, -0.75, 0); gunMesh.castShadow = true; gunMesh.visible = !!cop; armR.add(gunMesh); }
  return { root, body, legL, legR, shinL: legL.userData.shin, shinR: legR.userData.shin, armL, armR, head: body, gunMesh, phase: Math.random() * 6, lie: 0 };
}
export function animateWalker(m, speed, dt, aim = false, hands = false) {
  m.phase += dt * speed * 1.7;
  const k = Math.min(1, speed / 2.5), s = Math.sin(m.phase) * 0.85 * k;
  m.legL.rotation.z = s; m.legR.rotation.z = -s;
  const c = Math.cos(m.phase); m.shinL.rotation.z = -(Math.max(0, c) * 1.05 + 0.08) * k; m.shinR.rotation.z = -(Math.max(0, -c) * 1.05 + 0.08) * k; // knees fold on the swing
  m.armL.rotation.z = -s * 0.8; m.armR.rotation.z = aim ? 1.45 : s * 0.8;
  if (hands) { m.armL.rotation.z = 2.85; m.armR.rotation.z = 2.85; }
  m.body.position.y = Math.abs(Math.sin(m.phase)) * 0.04 * k;
}

const SHIRTS = [0xc0392b, 0x2c6fbb, 0xe8e8e8, 0x222222, 0xd98c1f, 0x2e8b57, 0x8e44ad, 0xe67e22, 0x16a085, 0xf1c40f];
const PANTS = [0x2b3a55, 0x222222, 0x4a4036, 0x6b6b6b, 0x1f2f1f];
const SKINS = [0xf1c9a5, 0xd9a47c, 0xa9724d, 0x6f4a33, 0xe8b894];
const HAIRS = [0x222222, 0x4a3320, 0xc9a24b, 0x777777, 0x8a2f1f];

export function cornerPt(bi, bj, c) {
  const bk = G.city.blocks[bi][bj], m = 2.6, x0 = bk.x + m, z0 = bk.z + m, x1 = bk.x + bk.s - m, z1 = bk.z + bk.s - m;
  return c === 0 ? { x: x0, z: z0 } : c === 1 ? { x: x1, z: z0 } : c === 2 ? { x: x1, z: z1 } : { x: x0, z: z1 };
}

export class Peds {
  constructor() { this.list = []; this.t = 0; }

  create(x, z, type = 'civ', override = null) {
    const fem = Math.random() < 0.45;
    const look = { shirt: pick(SHIRTS), pants: pick(PANTS), skin: pick(SKINS), hair: pick(HAIRS), fem, skirt: fem && Math.random() < 0.4, build: fem ? rand(0.86, 0.96) : rand(0.94, 1.12), height: fem ? rand(0.92, 1.0) : rand(0.96, 1.07), ...(override || {}) };
    if (type === 'cop') { look.shirt = 0x1c3f94; look.pants = 0x14203a; look.cop = true; look.skirt = false; look.fem = false; }
    const model = makePedModel(look);
    const p = {
      x, z, vx: 0, vz: 0, a: Math.random() * 6.28, hp: type === 'cop' ? 70 : 40, type, state: 'walk', model,
      bi: 0, bj: 0, c: 0, dir: Math.random() < 0.5 ? 1 : -1, sp: rand(1.2, 1.9), fear: 0, fx: 0, fz: 0, t: 0, cool: rand(0.3, 1), life: 0, fall: 0, talkCd: rand(1, 5), talkT: 0, handsT: 0, aimedT: 0,
    };
    model.root.position.set(x, 0, z); G.scene.add(model.root);
    this.list.push(p); return p;
  }

  spawn(initial = false) {
    const pl = G.player, near = initial ? 12 : 55;
    for (let tr = 0; tr < 10; tr++) {
      const a = Math.random() * 6.28, d = initial ? rand(12, 200) : rand(near, 220);
      const x = pl.x + Math.cos(a) * d, z = pl.z + Math.sin(a) * d;
      const bi = clamp(Math.floor(x / B), 0, N - 1), bj = clamp(Math.floor(z / B), 0, N - 1), c = Math.floor(Math.random() * 4), q = cornerPt(bi, bj, c);
      if (dist(q.x, q.z, pl.x, pl.z) < near) continue;
      const p = this.create(q.x, q.z); p.bi = bi; p.bj = bj; p.c = c; return p;
    }
    return null;
  }

  say(p, cat, force = false) {
    if (!force && p.talkCd > 0) return;
    p.talkCd = rand(5, 10); G.speech.say(p, line(cat), { cls: p.type === 'cop' ? 'cop' : '' });
  }

  scare(x, z, r, fx = x, fz = z) {
    for (const p of this.list) if (p.type === 'civ' && p.state !== 'dead' && dist(p.x, p.z, x, z) < r) { p.state = 'flee'; p.fear = rand(5, 9); p.fx = fx; p.fz = fz; }
  }

  hurt(p, d, by) {
    if (p.state === 'dead') return;
    p.hp -= d; G.fx.bloodSplat(p.x, 1.3, p.z, 5);
    if (p.type === 'cop' && by === 'p') G.police.crime(2, p.x, p.z, true);
    if (p.type === 'civ' && p.hp > 0) { p.state = 'flee'; p.fear = 8; p.fx = G.player.x; p.fz = G.player.z; }
    if (p.hp <= 0) this.kill(p, by);
  }

  kill(p, by) {
    const wasCop = p.type === 'cop';
    p.state = 'dead'; p.t = 0; p.fall = 0; p.model.gunMesh && (p.model.gunMesh.visible = false);
    G.fx.decal('blood', p.x, p.z, rand(2.2, 3.4)); G.fx.bloodSplat(p.x, 1, p.z, 9);
    if (!wasCop) { // bystanders react
      let n = 0;
      for (const q of this.list) if (q !== p && q.type === 'civ' && q.state !== 'dead' && dist(q.x, q.z, p.x, p.z) < 26 && n < 2) { this.say(q, 'witness', true); q.state = 'flee'; q.fear = 8; q.fx = p.x; q.fz = p.z; n++; }
    }
    if (by === 'p') {
      if (wasCop) { G.police.crime(3, p.x, p.z, true); G.pickups.dropCash(p.x, p.z, 60); G.police.onCopKilled(); }
      else { G.police.crime(1, p.x, p.z); G.pickups.dropCash(p.x, p.z, Math.floor(rand(8, 75))); G.stats.kills++; }
    }
  }

  // Cars run peds over / shove them aside.
  carSweep(c) {
    const ca = Math.cos(c.a), sa = Math.sin(c.a), hl = c.def.len / 2 + 0.3, hw = c.def.wid / 2 + 0.45, by = c === G.player.car ? 'p' : 'w';
    for (const p of this.list) {
      if (p.state === 'dead') continue;
      const dx = p.x - c.x, dz = p.z - c.z; if (Math.abs(dx) > 8 || Math.abs(dz) > 8) continue;
      const fx = dx * ca + dz * sa, fz = -dx * sa + dz * ca;
      if (Math.abs(fx) < hl && Math.abs(fz) < hw) {
        if (Math.abs(c.fw) > 9) { p.vx = c.vx * 0.9; p.vz = c.vz * 0.9; p.fly = 5; G.audio.thud(p.x, p.z); this.hurt(p, 200, by); }
        else { p.state = 'flee'; p.fear = 6; p.fx = c.x; p.fz = c.z; p.x += -sa * Math.sign(fz || 1) * 0.15; p.z += ca * Math.sign(fz || 1) * 0.15; this.say(p, 'hit'); }
      } else if (Math.abs(c.fw) > 9 && Math.abs(fx) < hl + 2.5 && Math.abs(fz) < hw + 1.8 && p.talkCd <= 0) { this.say(p, 'near'); p.state = 'flee'; p.fear = 3; p.fx = c.x; p.fz = c.z; }
    }
    // player on foot
    const pl = G.player;
    if (!pl.car && !pl.dead && c !== pl.car) {
      const dx = pl.x - c.x, dz = pl.z - c.z; if (Math.abs(dx) > 8 || Math.abs(dz) > 8) return;
      const fx = dx * ca + dz * sa, fz = -dx * sa + dz * ca;
      if (Math.abs(fx) < hl && Math.abs(fz) < hw && Math.abs(c.fw) > 6) { pl.hurt(Math.abs(c.fw) * 1.6); pl.vx = c.vx * 0.8; pl.vz = c.vz * 0.8; G.audio.thud(pl.x, pl.z); }
    }
  }

  update(dt) {
    const pl = G.player; this.t += dt;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      if (p.state === 'dead') {
        p.t += dt; p.fall = Math.min(1, p.fall + dt * 3);
        if (p.fly > 0) { p.fly -= dt * 6; p.vx *= 0.92; p.vz *= 0.92; G.city.moveCircle(p, 0.3, dt); }
        const m = p.model; m.root.rotation.z = damp(m.root.rotation.z, Math.PI / 2, 14, dt); m.root.position.set(p.x, 0.18 * p.fall, p.z);
        if (p.t > 30 || dist(p.x, p.z, pl.x, pl.z) > 300) this.removeAt(i);
        continue;
      }
      p.talkCd = Math.max(0, p.talkCd - dt);
      if (p.type === 'cop') G.police.footCop(p, dt);
      else this.civ(p, dt);
      if (dist(p.x, p.z, pl.x, pl.z) > (p.type === 'cop' ? 520 : 280)) { this.removeAt(i); continue; }
      const m = p.model; m.root.position.set(p.x, 0, p.z); m.root.rotation.y = -p.a;
      animateWalker(m, Math.hypot(p.vx, p.vz), dt, p.type === 'cop' && p.aiming, p.state === 'hands');
    }
    if (this.civCount() < 52 && !G.player.inside) this.spawn();
  }
  civCount() { let n = 0; for (const p of this.list) if (p.type === 'civ' && p.state !== 'dead') n++; return n; }
  resync(p) {
    p.bi = clamp(Math.floor(p.x / B), 0, N - 1); p.bj = clamp(Math.floor(p.z / B), 0, N - 1);
    let bd = 1e9; for (let c = 0; c < 4; c++) { const q = cornerPt(p.bi, p.bj, c), d = dist(q.x, q.z, p.x, p.z); if (d < bd) { bd = d; p.c = c; } }
  }
  removeAt(i) { const p = this.list[i]; G.scene.remove(p.model.root); disposePed(p.model); this.list.splice(i, 1); }
  clearCops() { for (const p of this.list) if (p.type === 'cop' && p.state !== 'dead') p.life = 99; }

  civ(p, dt) {
    const pl = G.player;
    if (p.state === 'static') { p.vx = p.vz = 0; p.a = Math.atan2(pl.z - p.z, pl.x - p.x); p.model.root.rotation.y = -p.a; return; }
    if (p.state === 'hands') {
      p.handsT -= dt; p.vx = p.vz = 0; p.a = Math.atan2(pl.z - p.z, pl.x - p.x);
      if (p.handsT <= 0 || pl.dead || pl.car) { p.state = 'walk'; p.aimedT = 0; this.resync(p); }
      return;
    }
    if (p.talkT > 0) { p.talkT -= dt; p.vx = p.vz = 0; p.a = Math.atan2(pl.z - p.z, pl.x - p.x); return; }
    if (p.state === 'walk' && p.talkCd <= 0 && !pl.dead) { // small talk with the neighbourhood
      const d = dist(p.x, p.z, pl.x, pl.z);
      if (d < 9 && Math.random() < dt * 0.35) {
        const armed = WEAPONS_FIRE(pl);
        if (armed) { this.say(p, 'armed'); if (Math.random() < 0.5) { p.state = 'flee'; p.fear = 5; p.fx = pl.x; p.fz = pl.z; } }
        else if (pl.hp < 35) this.say(p, 'hurt');
        else if (pl.car && (pl.car.type === 'sport' || pl.car.type === 'cop') && Math.abs(pl.car.fw) < 12) this.say(p, 'nice');
        else if (G.night > 0.6 && Math.random() < 0.5) this.say(p, 'night');
        else this.say(p, 'greet');
      } else if (d < 30 && Math.random() < dt * 0.025) this.say(p, 'chat');
    }
    if (p.state === 'flee') {
      p.fear -= dt; const a = Math.atan2(p.z - p.fz, p.x - p.fx) + Math.sin(this.t * 5 + p.x) * 0.5;
      p.vx = Math.cos(a) * 5.4; p.vz = Math.sin(a) * 5.4; p.a = a; G.city.moveCircle(p, 0.35, dt);
      if (p.fear <= 0) {
        p.state = 'walk'; p.bi = clamp(Math.floor(p.x / B), 0, N - 1); p.bj = clamp(Math.floor(p.z / B), 0, N - 1);
        let bd = 1e9; for (let c = 0; c < 4; c++) { const q = cornerPt(p.bi, p.bj, c), d = dist(q.x, q.z, p.x, p.z); if (d < bd) { bd = d; p.c = c; } }
      }
      return;
    }
    const q = cornerPt(p.bi, p.bj, p.c), dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz);
    if (d < 1) {
      if (Math.random() < 0.3) {
        const hz = Math.random() < 0.5, c = p.c;
        const nbi = p.bi + (hz ? (c === 1 || c === 2 ? 1 : -1) : 0), nbj = p.bj + (hz ? 0 : c === 0 || c === 1 ? -1 : 1);
        if (nbi >= 0 && nbi < N && nbj >= 0 && nbj < N) { p.c = hz ? [1, 0, 3, 2][c] : [3, 2, 1, 0][c]; p.bi = nbi; p.bj = nbj; p.dir = Math.random() < 0.5 ? 1 : -1; }
        else p.c = (p.c + p.dir + 4) % 4;
      } else p.c = (p.c + p.dir + 4) % 4;
      p.vx = p.vz = 0; return;
    }
    p.a = Math.atan2(dz, dx); p.vx = (dx / d) * p.sp; p.vz = (dz / d) * p.sp;
    if (G.city.moveCircle(p, 0.35, dt) && Math.random() < dt * 2) p.c = (p.c + p.dir + 4) % 4;
  }
}

const WEAPONS_FIRE = (pl) => !pl.car && pl.w !== 7 && pl.w !== 6 && (G.input.mouse[2] || pl.aimT > 0);
