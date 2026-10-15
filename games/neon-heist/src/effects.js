import * as THREE from 'three';
import { makeRng, rand, TAU } from './util.js';
import { puffTexture, decalTexture } from './textures.js';

// Single draw-call point-sprite particle pool. Per-particle size/colour/alpha
// are animated on the CPU into typed arrays; the shader just draws them.
class ParticlePool {
  constructor(scene, max, additive, map, uniforms) {
    this.max = max; this.n = 0;
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 4); this.size = new Float32Array(max);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max); this.maxLife = new Float32Array(max);
    this.s0 = new Float32Array(max); this.s1 = new Float32Array(max); this.a0 = new Float32Array(max);
    this.rgb = new Float32Array(max * 3); this.drag = new Float32Array(max); this.grav = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    this.pa = new THREE.BufferAttribute(this.pos, 3); this.ca = new THREE.BufferAttribute(this.col, 4); this.sa = new THREE.BufferAttribute(this.size, 1);
    this.pa.setUsage(THREE.DynamicDrawUsage); this.ca.setUsage(THREE.DynamicDrawUsage); this.sa.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.pa); g.setAttribute('color', this.ca); g.setAttribute('size', this.sa);
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: map }, scale: uniforms.scale, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog) }, fog: true,
      // colours are authored in sRGB -> linearised here; sprites fade out right in front of the lens
      vertexShader: `attribute float size; attribute vec4 color; varying vec4 vC; uniform float scale;
        #include <fog_pars_vertex>
        void main(){ vC=color; vec4 mvPosition=modelViewMatrix*vec4(position,1.0);
          vC.a*=clamp((-mvPosition.z-1.2)/3.5,0.0,1.0); gl_PointSize=size*scale/max(0.5,-mvPosition.z); gl_Position=projectionMatrix*mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `uniform sampler2D map; varying vec4 vC;
        #include <fog_pars_fragment>
        void main(){ vec4 t=texture2D(map,gl_PointCoord); gl_FragColor=vec4(pow(vC.rgb,vec3(2.2)),vC.a*t.a); if(gl_FragColor.a<0.004) discard;
          ${additive ? 'gl_FragColor.a*=1.0-smoothstep(fogNear,fogFar,vFogDepth);' : '#include <fog_fragment>'}
        }`,
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(g, mat); this.points.frustumCulled = false; scene.add(this.points);
  }
  emit(x, y, z, vx, vy, vz, life, s0, s1, r, g, b, a, drag = 1.5, grav = 0) {
    if (this.n >= this.max) return;
    const i = this.n++, i3 = i * 3;
    this.pos[i3] = x; this.pos[i3 + 1] = y; this.pos[i3 + 2] = z;
    this.vel[i3] = vx; this.vel[i3 + 1] = vy; this.vel[i3 + 2] = vz;
    this.life[i] = this.maxLife[i] = life; this.s0[i] = s0; this.s1[i] = s1; this.a0[i] = a;
    this.rgb[i3] = r; this.rgb[i3 + 1] = g; this.rgb[i3 + 2] = b; this.drag[i] = drag; this.grav[i] = grav;
  }
  update(dt) {
    for (let i = 0; i < this.n; i++) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this._copy(this.n - 1, i); this.n--; i--; continue; }
      const i3 = i * 3, k = Math.exp(-this.drag[i] * dt);
      this.vel[i3] *= k; this.vel[i3 + 1] = this.vel[i3 + 1] * k - this.grav[i] * dt; this.vel[i3 + 2] *= k;
      this.pos[i3] += this.vel[i3] * dt; this.pos[i3 + 1] = Math.max(0.05, this.pos[i3 + 1] + this.vel[i3 + 1] * dt); this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
      const t = 1 - this.life[i] / this.maxLife[i];
      this.size[i] = this.s0[i] + (this.s1[i] - this.s0[i]) * t;
      const c = i * 4; this.col[c] = this.rgb[i3]; this.col[c + 1] = this.rgb[i3 + 1]; this.col[c + 2] = this.rgb[i3 + 2];
      this.col[c + 3] = this.a0[i] * (1 - t) * Math.min(1, t * 12);
    }
    for (let i = this.n; i < Math.min(this.max, this.n + 1); i++) this.size[i] = 0;
    this.pa.needsUpdate = this.ca.needsUpdate = this.sa.needsUpdate = true;
    this.points.geometry.setDrawRange(0, this.n);
  }
  _copy(from, to) {
    if (from === to) return;
    const f3 = from * 3, t3 = to * 3, f4 = from * 4, t4 = to * 4;
    for (let k = 0; k < 3; k++) { this.pos[t3 + k] = this.pos[f3 + k]; this.vel[t3 + k] = this.vel[f3 + k]; this.rgb[t3 + k] = this.rgb[f3 + k]; }
    for (let k = 0; k < 4; k++) this.col[t4 + k] = this.col[f4 + k];
    for (const a of ['life', 'maxLife', 's0', 's1', 'a0', 'drag', 'grav', 'size']) this[a][to] = this[a][from];
  }
}

export class Effects {
  constructor(scene) {
    this.scene = scene;
    const rng = makeRng(77);
    this.uniforms = { scale: { value: 600 } };
    const puff = puffTexture();
    this.add = new ParticlePool(scene, 1400, true, puff, this.uniforms);
    this.nrm = new ParticlePool(scene, 1800, false, puff, this.uniforms);
    this.shake = 0;
    this.light = new THREE.PointLight(0xffb060, 0, 60, 1.6); scene.add(this.light); this.lightT = 0;
    // decal rings
    const mkDecals = (color, n, y) => {
      const t = decalTexture(color, rng), arr = [];
      for (let i = 0; i < n; i++) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
        m.rotation.x = -Math.PI / 2; m.position.y = y; m.visible = false; m.userData.noAO = true; scene.add(m); arr.push(m);
      }
      return { arr, k: 0 };
    };
    this.blood = mkDecals('rgba(120,0,0,0.95)', 40, 0.07);
    this.scorch = mkDecals('rgba(0,0,0,0.85)', 24, 0.065);
    // tracers
    this.tmax = 160;
    this.tpos = new Float32Array(this.tmax * 6); this.tcol = new Float32Array(this.tmax * 6);
    const tg = new THREE.BufferGeometry();
    this.tpa = new THREE.BufferAttribute(this.tpos, 3); this.tca = new THREE.BufferAttribute(this.tcol, 3);
    tg.setAttribute('position', this.tpa); tg.setAttribute('color', this.tca); tg.setDrawRange(0, 0);
    this.tracers = new THREE.LineSegments(tg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.tracers.frustumCulled = false; scene.add(this.tracers);
  }

  setViewport(height, fovDeg) { this.uniforms.scale.value = height / (2 * Math.tan(fovDeg * Math.PI / 360)); }

  setTracers(list) {
    let n = 0;
    for (const b of list) {
      if (n >= this.tmax) break;
      const i = n * 6, len = b.rocket ? 0 : 0.045;
      this.tpos[i] = b.x; this.tpos[i + 1] = b.y; this.tpos[i + 2] = b.z;
      this.tpos[i + 3] = b.x - b.vx * len; this.tpos[i + 4] = b.y - b.vy * len; this.tpos[i + 5] = b.z - b.vz * len;
      const c = b.owner === 'p' ? [1, 0.85, 0.4] : [1, 0.45, 0.35];
      this.tcol[i] = c[0]; this.tcol[i + 1] = c[1]; this.tcol[i + 2] = c[2]; this.tcol[i + 3] = c[0] * 0.2; this.tcol[i + 4] = c[1] * 0.2; this.tcol[i + 5] = c[2] * 0.2;
      n++;
    }
    this.tracers.geometry.setDrawRange(0, n * 2);
    this.tpa.needsUpdate = this.tca.needsUpdate = true;
  }

  update(dt) {
    this.add.update(dt); this.nrm.update(dt);
    this.shake = Math.max(0, this.shake - dt * 9);
    if (this.lightT > 0) { this.lightT -= dt; this.light.intensity = Math.max(0, this.lightT * this.lightK); } else this.light.intensity = 0;
    this.light.visible = this.light.intensity > 0;
  }

  flash(x, y, z, color, power, t) { this.light.position.set(x, y, z); this.light.color.setHex(color); this.lightK = power / t; this.lightT = t; this.light.intensity = power; }

  muzzle(x, y, z, dx, dz) {
    this.add.emit(x, y, z, dx * 4, 0, dz * 4, 0.07, 0.9, 0.3, 1, 0.85, 0.5, 1, 4);
    this.add.emit(x, y, z, dx * 8, 0.3, dz * 8, 0.05, 0.5, 0.2, 1, 0.95, 0.7, 1, 4);
    this.flash(x, y, z, 0xffcc88, 6, 0.06);
  }
  spark(x, y, z, n = 5) {
    for (let i = 0; i < n; i++) this.add.emit(x, y, z, rand(-5, 5), rand(0, 5), rand(-5, 5), rand(0.15, 0.4), 0.18, 0.05, 1, 0.8, 0.35, 1, 1, 14);
  }
  dust(x, y, z, n = 4, col = 0.7) {
    for (let i = 0; i < n; i++) this.nrm.emit(x, y, z, rand(-1.5, 1.5), rand(0.3, 1.5), rand(-1.5, 1.5), rand(0.6, 1.2), 0.6, 2.6, col, col, col * 0.95, 0.45, 2);
  }
  smoke(x, y, z, size = 1.2, life = 1.8, dark = 0.15) {
    this.nrm.emit(x + rand(-.2, .2), y, z + rand(-.2, .2), rand(-0.6, 0.6), rand(1.2, 2.6), rand(-0.6, 0.6), life, size * 0.6, size * 3, dark, dark, dark, 0.5, 0.8);
  }
  fire(x, y, z, size = 1) {
    this.add.emit(x + rand(-.3, .3), y, z + rand(-.3, .3), rand(-0.5, 0.5), rand(1.5, 3.5), rand(-0.5, 0.5), rand(0.35, 0.7), size * 1.1, size * 0.2, 1, rand(0.35, 0.65), 0.12, 0.9, 1);
  }
  bloodSplat(x, y, z, n = 6) {
    for (let i = 0; i < n; i++) this.nrm.emit(x, y, z, rand(-3, 3), rand(0.5, 3), rand(-3, 3), rand(0.3, 0.7), 0.25, 0.1, 0.55, 0.02, 0.02, 0.9, 1, 12);
  }
  decal(kind, x, z, size) {
    const d = kind === 'blood' ? this.blood : this.scorch, m = d.arr[d.k++ % d.arr.length];
    m.position.x = x; m.position.z = z; m.scale.set(size, size, 1); m.rotation.z = Math.random() * TAU; m.visible = true;
  }
  explosion(x, y, z, rad) {
    this.shake = Math.min(1.4, this.shake + rad / 12);
    for (let i = 0; i < 26; i++) {
      const a = rand(0, TAU), s = rand(2, rad * 1.2);
      this.add.emit(x, y + 0.5, z, Math.cos(a) * s, rand(2, rad * 0.8), Math.sin(a) * s, rand(0.45, 1.0), rad * 0.45, rad * 0.12, 1, rand(0.45, 0.8), 0.12, 1, 1.8, 3);
    }
    this.add.emit(x, y + 1, z, 0, 0.5, 0, 0.35, rad * 1.8, rad * 2.8, 1, 0.85, 0.5, 0.9, 0);
    for (let i = 0; i < 20; i++) {
      const a = rand(0, TAU), s = rand(1, rad * 0.6);
      this.nrm.emit(x, y + 1, z, Math.cos(a) * s, rand(2, 9), Math.sin(a) * s, rand(1.5, 3.2), rad * 0.35, rad * 1.1, 0.12, 0.12, 0.12, 0.7, 1.2);
    }
    for (let i = 0; i < 14; i++) this.spark(x, y + 1, z, 1);
    this.flash(x, y + 3, z, 0xffa850, 90, 0.5);
    this.decal('scorch', x, z, rad * 1.4);
  }
}
