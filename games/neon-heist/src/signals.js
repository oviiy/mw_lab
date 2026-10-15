import * as THREE from 'three';
import { B, N, R, DIRS } from './util.js';

// Two-phase junctions: traffic along X gets green, then traffic along Z. Each junction is offset
// so the city doesn't switch in lock-step.
const CYCLE = 24, GREEN = 10, AMBER = 2.2;
// 0 = green, 1 = amber, 2 = red for traffic moving along `axis` (0: x, 1: z) at junction (i, j).
export function signalState(i, j, axis, t) {
  let p = (t + ((i * 7 + j * 11) % CYCLE)) % CYCLE;
  if (axis === 1) p = (p + CYCLE / 2) % CYCLE;
  return p < GREEN ? 0 : p < GREEN + AMBER ? 1 : 2;
}

const COLS = [[0.15, 3.2, 0.9], [3.4, 1.9, 0.1], [3.6, 0.15, 0.1]]; // green, amber, red (HDR so they bloom)
const DIM = 0.07;

export class Signals {
  // c: city (for collider rects)
  constructor(scene, city) {
    this.heads = [];
    const h = R / 2, armY = 6;
    for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) for (let d = 0; d < 4; d++) {
      const [dx, dz] = DIRS[d];
      if (i - dx < 0 || i - dx > N || j - dz < 0 || j - dz > N) continue; // nobody approaches from outside the city
      const rx = -dz, rz = dx, cx = i * B, cz = j * B;
      const px = cx - dx * (h + 1.5) + rx * (h + 4), pz = cz - dz * (h + 1.5) + rz * (h + 4);
      this.heads.push({ i, j, axis: d % 2, d, px, pz, ax: -rx, az: -rz, len: h + 4 - 5.5, state: -1 });
      const bi = Math.floor(px / B), bj = Math.floor(pz / B);
      if (bi >= 0 && bj >= 0 && bi < N && bj < N) city.blocks[bi][bj].rects.push({ x: px - 0.25, z: pz - 0.25, w: 0.5, d: 0.5, h: armY, y0: 0 });
    }
    const n = this.heads.length;
    const steel = new THREE.MeshStandardMaterial({ color: 0x2f3236, metalness: 0.7, roughness: 0.45 });
    const housing = new THREE.MeshStandardMaterial({ color: 0x1a1b1d, roughness: 0.6 });
    const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.14, armY + 0.3, 8).translate(0, (armY + 0.3) / 2, 0), steel, n);
    const arm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.12, 0.12).translate(0.5, armY, 0), steel, n);
    const head = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 1.15, 0.42), housing, n);
    this.lampMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.lamps = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 8, 6), this.lampMat, n * 3);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0), I = new THREE.Quaternion();
    this.heads.forEach((hd, k) => {
      q.setFromAxisAngle(up, -Math.atan2(hd.az, hd.ax));
      p.set(hd.px, 0.25, hd.pz); m4.compose(p, q, s); pole.setMatrixAt(k, m4);
      s.set(hd.len, 1, 1); m4.compose(p, q, s); arm.setMatrixAt(k, m4); s.set(1, 1, 1);
      const hx = hd.px + hd.ax * hd.len, hz = hd.pz + hd.az * hd.len;
      p.set(hx, 0.25 + armY - 0.7, hz); m4.compose(p, q, s); head.setMatrixAt(k, m4);
      for (let c = 0; c < 3; c++) { // red on top, amber, green at the bottom, facing the approaching cars
        p.set(hx - DIRS[hd.d][0] * 0.2, 0.25 + armY - 0.7 + (c - 1) * 0.34, hz - DIRS[hd.d][1] * 0.2); m4.compose(p, I, s); this.lamps.setMatrixAt(k * 3 + c, m4);
        this.lamps.setColorAt(k * 3 + c, new THREE.Color(COLS[c][0] * DIM, COLS[c][1] * DIM, COLS[c][2] * DIM));
      }
    });
    pole.castShadow = arm.castShadow = head.castShadow = true;
    for (const o of [pole, arm, head, this.lamps]) { o.frustumCulled = false; scene.add(o); }
    this.lamps.userData.noAO = true;
    this.t = 0; this._c = new THREE.Color();
  }

  update(dt, time) {
    this.t -= dt; if (this.t > 0) return; this.t = 0.2;
    let dirty = false;
    for (let k = 0; k < this.heads.length; k++) {
      const hd = this.heads[k], st = signalState(hd.i, hd.j, hd.axis, time);
      if (st === hd.state) continue;
      hd.state = st; dirty = true;
      for (let c = 0; c < 3; c++) { const on = c === st, f = on ? 1 : DIM; this._c.setRGB(COLS[c][0] * f, COLS[c][1] * f, COLS[c][2] * f); this.lamps.setColorAt(k * 3 + c, this._c); }
    }
    if (dirty) this.lamps.instanceColor.needsUpdate = true;
  }
}
