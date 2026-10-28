import * as THREE from 'three';

const N = 700;

// Splashes when a column breaks the surface, glints for perfect placements.
export class Particles {
  constructor(scene) {
    this.pos = new Float32Array(N * 3);
    this.col = new Float32Array(N * 3);
    this.vel = new Float32Array(N * 3);
    this.life = new Float32Array(N);
    this.max = new Float32Array(N);
    this.base = new Float32Array(N * 3);
    this.grav = new Float32Array(N);
    this.next = 0;
    for (let i = 0; i < N; i++) this.pos[i * 3 + 1] = -999;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.geo = g;
    this.points = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.11, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  emit(x, y, z, vx, vy, vz, life, color, grav) {
    const i = this.next; this.next = (this.next + 1) % N;
    this.pos.set([x, y, z], i * 3);
    this.vel.set([vx, vy, vz], i * 3);
    this.life[i] = this.max[i] = life;
    this.base.set([color.r, color.g, color.b], i * 3);
    this.grav[i] = grav;
  }

  splash(x, y, z) {
    const c = new THREE.Color('#e9f2f1');
    for (let k = 0; k < 36; k++) {
      const a = Math.random() * Math.PI * 2, r = 0.8 + Math.random() * 0.35, s = 0.6 + Math.random() * 1.4;
      this.emit(x + Math.cos(a) * r, y, z + Math.sin(a) * r, Math.cos(a) * s, 1.5 + Math.random() * 2.4, Math.sin(a) * s, 0.7 + Math.random() * 0.5, c, 7);
    }
  }

  spout(x, y, z) {
    const c = new THREE.Color('#dfeef0');
    for (let k = 0; k < 40; k++) {
      this.emit(x + (Math.random() - 0.5) * 0.2, y, z + (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.5, 2.5 + Math.random() * 1.5, (Math.random() - 0.5) * 0.5, 0.9 + Math.random() * 0.4, c, 3.5);
    }
  }

  sparkle(x, y, z, color = '#ffd77a', n = 46) {
    const c = new THREE.Color(color);
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * 0.9;
      this.emit(x + Math.cos(a) * r, y + 0.1, z + Math.sin(a) * r, (Math.random() - 0.5) * 0.4, 0.8 + Math.random() * 1.6, (Math.random() - 0.5) * 0.4, 1 + Math.random() * 0.8, c, -0.3);
    }
  }

  update(dt) {
    for (let i = 0; i < N; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      const o = i * 3;
      if (this.life[i] <= 0) { this.pos[o + 1] = -999; this.col.fill(0, o, o + 3); continue; }
      this.vel[o + 1] -= this.grav[i] * dt;
      this.pos[o] += this.vel[o] * dt;
      this.pos[o + 1] += this.vel[o + 1] * dt;
      this.pos[o + 2] += this.vel[o + 2] * dt;
      const f = Math.min(1, (this.life[i] / this.max[i]) * 1.5);
      this.col[o] = this.base[o] * f; this.col[o + 1] = this.base[o + 1] * f; this.col[o + 2] = this.base[o + 2] * f;
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.color.needsUpdate = true;
  }
}
