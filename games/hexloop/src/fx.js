import * as THREE from 'three';

// GPU point particles with additive glow. Ring buffer, CPU integration.
export class Particles {
  constructor(scene, max = 1200) {
    this.max = max; this.cursor = 0;
    this.pos = new Float32Array(max * 3); this.vel = new Float32Array(max * 3); this.col = new Float32Array(max * 3);
    this.size = new Float32Array(max); this.alpha = new Float32Array(max); this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max); this.grav = new Float32Array(max); this.drag = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    this.uniforms = { uScale: { value: 400 } };
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: this.uniforms,
      vertexShader: `attribute vec3 aColor; attribute float aSize; attribute float aAlpha; uniform float uScale;
        varying vec3 vC; varying float vA;
        void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv;
          gl_PointSize = aSize*uScale/max(-mv.z,0.1); vC = aColor; vA = aAlpha; }`,
      fragmentShader: `varying vec3 vC; varying float vA;
        void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.0,d)*vA; if(a<0.004) discard; gl_FragColor = vec4(vC*(1.0+1.5*smoothstep(0.25,0.0,d)), a); }`,
    });
    this.points = new THREE.Points(g, m); this.points.frustumCulled = false; this.points.renderOrder = 10;
    scene.add(this.points);
  }
  emit(x, y, z, vx, vy, vz, color, size, life, grav = 0, drag = 1.5) {
    const i = this.cursor; this.cursor = (this.cursor + 1) % this.max;
    const k = i * 3;
    this.pos[k] = x; this.pos[k + 1] = y; this.pos[k + 2] = z;
    this.vel[k] = vx; this.vel[k + 1] = vy; this.vel[k + 2] = vz;
    this.col[k] = color.r; this.col[k + 1] = color.g; this.col[k + 2] = color.b;
    this.size[i] = size; this.life[i] = this.maxLife[i] = life; this.grav[i] = grav; this.drag[i] = drag;
  }
  burst(p, color, n = 24, speed = 3, size = 0.12, life = 0.7, up = 1.5, grav = 6) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = speed * (0.3 + Math.random() * 0.7), e = Math.random();
      this.emit(p.x, p.y, p.z, Math.cos(a) * s, up * (0.5 + e) * speed * 0.5, Math.sin(a) * s, color, size * (0.6 + Math.random() * 0.8), life * (0.6 + Math.random() * 0.6), grav);
    }
  }
  update(dt) {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { this.alpha[i] = 0; continue; }
      this.life[i] -= dt;
      const k = i * 3, d = Math.exp(-this.drag[i] * dt);
      this.vel[k] *= d; this.vel[k + 1] = this.vel[k + 1] * d - this.grav[i] * dt; this.vel[k + 2] *= d;
      this.pos[k] += this.vel[k] * dt; this.pos[k + 1] += this.vel[k + 1] * dt; this.pos[k + 2] += this.vel[k + 2] * dt;
      if (this.pos[k + 1] < 0.32 && this.vel[k + 1] < 0) { this.pos[k + 1] = 0.32; this.vel[k + 1] *= -0.35; }
      const f = this.life[i] / this.maxLife[i];
      this.alpha[i] = Math.min(1, f * 2);
    }
    const a = this.points.geometry.attributes;
    a.position.needsUpdate = a.aColor.needsUpdate = a.aSize.needsUpdate = a.aAlpha.needsUpdate = true;
  }
}

// Simple tween runner on game time.
export class Tweens {
  constructor() { this.list = []; }
  add(dur, fn, { delay = 0, done = null } = {}) { const t = { t: -delay, dur, fn, done }; this.list.push(t); return t; }
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const t = this.list[i]; t.t += dt;
      if (t.t < 0) continue;
      const k = Math.min(1, t.t / t.dur);
      t.fn(k);
      if (k >= 1) { this.list.splice(i, 1); if (t.done) t.done(); }
    }
  }
  clear() { this.list.length = 0; }
}
