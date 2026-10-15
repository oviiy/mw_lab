// Thrown trading cards that flutter down and pile up as litter through the day.
import * as THREE from 'three';
import { TIER_R, tierTop } from './pit.js';
import { cardTexture } from './textures.js';

const MAX_AIR = 320;
const MAX_LITTER = 3000;
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);

export function groundY(x, z) {
  const r = Math.hypot(x, z);
  if (r >= TIER_R[1]) return 0;
  for (let k = 1; k < TIER_R.length; k++) if (r >= (TIER_R[k + 1] ?? 0)) return tierTop(k);
  return tierTop(TIER_R.length - 1);
}

export class Effects {
  constructor(scene) {
    const geo = new THREE.PlaneGeometry(0.1, 0.065);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: cardTexture(), side: THREE.DoubleSide, roughness: 0.85 });
    this.air = new THREE.InstancedMesh(geo, mat, MAX_AIR);
    this.air.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.air.count = 0;
    this.air.frustumCulled = false;
    this.litter = new THREE.InstancedMesh(geo, mat, MAX_LITTER);
    this.litter.count = 0;
    this.litter.frustumCulled = false;
    this.litter.receiveShadow = true;
    const tints = [0xf6f2e4, 0xfff3a8, 0xd9ecff, 0xffd8d0, 0xe9ffe0];
    const c = new THREE.Color();
    for (let i = 0; i < MAX_AIR; i++) this.air.setColorAt(i, c.set(tints[i % tints.length]));
    for (let i = 0; i < MAX_LITTER; i++) this.litter.setColorAt(i, c.set(tints[(i * 7) % tints.length]));
    scene.add(this.air, this.litter);
    this.parts = [];
    this.nextLitter = 0;
  }

  // Throw `n` cards from a point.
  burst(pos, n = 4, power = 1) {
    for (let i = 0; i < n && this.parts.length < MAX_AIR; i++) {
      this.parts.push({
        p: new THREE.Vector3(pos.x, pos.y, pos.z),
        v: new THREE.Vector3((Math.random() - 0.5) * 2.4 * power, 1.5 + Math.random() * 2.2 * power, (Math.random() - 0.5) * 2.4 * power),
        r: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6),
        w: new THREE.Vector3((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9),
        ph: Math.random() * 10,
      });
    }
  }

  // Seed the floor with litter in proportion to traded volume.
  scatter(n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * (TIER_R[0] + 1.5);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      this._land(x, groundY(x, z), z, Math.random() * 6);
    }
  }

  _land(x, y, z, yaw) {
    const i = this.nextLitter % MAX_LITTER;
    this.nextLitter++;
    _e.set(-Math.PI / 2, 0, yaw);
    _q.setFromEuler(_e);
    _m.compose(_p.set(x, y + 0.006 + (i % 7) * 0.0006, z), _q, _s);
    this.litter.setMatrixAt(i, _m);
    this.litter.count = Math.min(MAX_LITTER, this.nextLitter);
    this.litter.instanceMatrix.needsUpdate = true;
  }

  update(dt) {
    const parts = this.parts;
    for (let i = parts.length - 1; i >= 0; i--) {
      const q = parts[i];
      q.ph += dt * 6;
      q.v.y -= 6 * dt;
      q.v.multiplyScalar(Math.exp(-2.2 * dt));
      q.v.x += Math.sin(q.ph) * 0.6 * dt; q.v.z += Math.cos(q.ph * 1.3) * 0.6 * dt;
      q.p.addScaledVector(q.v, dt);
      q.r.addScaledVector(q.w, dt);
      const gy = groundY(q.p.x, q.p.z);
      if (q.p.y <= gy + 0.01) { this._land(q.p.x, gy, q.p.z, q.r.y); parts.splice(i, 1); }
    }
    for (let i = 0; i < parts.length; i++) {
      const q = parts[i];
      _e.set(q.r.x, q.r.y, q.r.z);
      _q.setFromEuler(_e);
      _m.compose(q.p, _q, _s);
      this.air.setMatrixAt(i, _m);
    }
    this.air.count = parts.length;
    this.air.instanceMatrix.needsUpdate = true;
  }
}
