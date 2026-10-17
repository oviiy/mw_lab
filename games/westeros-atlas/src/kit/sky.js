// Sky dome + atmosphere presets (dawn / day / dusk / night / interior). The host applies a preset by
// tweening lights, fog, sky and the shared night-glow uniform.
import * as THREE from 'three';
import { setNight } from './materials.js';

export const PRESETS = {
  dawn:  { top: 0x4b5f98, horizon: 0xeeb08c, sunC: 0xffb878, sunI: 2.9, elev: 0.14, az: 1.2, hemiSky: 0x9aa6d4, hemiGround: 0x55443f, hemiI: 0.7, fog: 0xdcae96, fogD: 0.0017, exposure: 1.0, night: 0.35, water: 0.72, stars: 0.15 },
  day:   { top: 0x3b74be, horizon: 0xbcd6ec, sunC: 0xffecc8, sunI: 3.7, elev: 0.62, az: 0.7, hemiSky: 0xa9c9ee, hemiGround: 0x6a5f48, hemiI: 0.8, fog: 0xaecbe3, fogD: 0.0012, exposure: 1.0, night: 0, water: 1, stars: 0 },
  dusk:  { top: 0x25346a, horizon: 0xe4825a, sunC: 0xff8a48, sunI: 2.8, elev: 0.12, az: 3.9, hemiSky: 0x7c82bc, hemiGround: 0x453636, hemiI: 0.62, fog: 0xc47c6c, fogD: 0.0018, exposure: 1.0, night: 0.55, water: 0.6, stars: 0.35 },
  night: { top: 0x0a1030, horizon: 0x25365e, sunC: 0x9fb4e8, sunI: 1.1, elev: 0.55, az: 2.2, hemiSky: 0x5a6ca8, hemiGround: 0x1c2030, hemiI: 1.0, fog: 0x1b2640, fogD: 0.0022, exposure: 1.15, night: 1, water: 0.2, stars: 1 },
  interior: { top: 0x15110e, horizon: 0x2a2018, sunC: 0xffb36a, sunI: 0.0, elev: 0.5, az: 0.5, hemiSky: 0x6a5648, hemiGround: 0x1c1510, hemiI: 0.9, fog: 0x1a1410, fogD: 0.004, exposure: 1.05, night: 1, water: 0.5, stars: 0 },
};
export const PRESET_NAMES = ['dawn', 'day', 'dusk', 'night'];

export function createSky() {
  const geo = new THREE.SphereGeometry(2500, 32, 20);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3(0, 1, 0) }, uSunC: { value: new THREE.Color() }, uStars: { value: 0 }, uTime: { value: 0 } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }',
    fragmentShader: `
      uniform vec3 uTop, uHorizon, uSun, uSunC; uniform float uStars, uTime; varying vec3 vD;
      float hash(vec3 p){ p = fract(p*0.3183099+.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
      void main(){
        vec3 d = normalize(vD);
        float t = pow(clamp(d.y, 0.0, 1.0), 0.55);
        vec3 col = mix(uHorizon, uTop, t);
        if (d.y < 0.0) col = mix(uHorizon, uHorizon*0.55, clamp(-d.y*3.0,0.0,1.0));
        float sd = max(dot(d, normalize(uSun)), 0.0);
        col += uSunC * (pow(sd, 900.0) * 3.0 + pow(sd, 18.0) * 0.35 + pow(sd, 4.0) * 0.12);
        if (uStars > 0.01) {
          vec3 g = floor(d * 420.0); float s = step(0.9985, hash(g)); float tw = 0.6 + 0.4 * sin(uTime*2.0 + hash(g+3.0)*30.0);
          col += vec3(s * tw) * uStars * smoothstep(0.0, 0.25, d.y);
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false; mesh.renderOrder = -10;
  return mesh;
}

const _c = new THREE.Color();
/** Interpolating atmosphere controller. */
export class Atmosphere {
  constructor(scene, renderer) {
    this.scene = scene; this.renderer = renderer;
    this.sky = createSky(); scene.add(this.sky);
    this.sun = new THREE.DirectionalLight(0xffffff, 2); this.sun.castShadow = false; scene.add(this.sun); scene.add(this.sun.target);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1); scene.add(this.hemi);
    this.fog = new THREE.FogExp2(0xffffff, 0.002); scene.fog = this.fog;
    this.cur = null; this.from = null; this.to = null; this.t = 1; this.dur = 1.2;
    this.waters = []; this.radius = 300; this.tint = null;
    this.state = {};
    this.name = 'day';
  }
  setRadius(r) { this.radius = r; const c = this.sun.shadow.camera; c.left = -r; c.right = r; c.top = r; c.bottom = -r; c.near = 1; c.far = r * 6; c.updateProjectionMatrix(); }
  enableShadows(on, size = 2048) {
    this.sun.castShadow = on;
    if (on) { this.sun.shadow.mapSize.set(size, size); this.sun.shadow.bias = -0.0006; this.sun.shadow.normalBias = 0.6; this.setRadius(this.radius); }
  }
  registerWater(m) { this.waters.push(m); }
  clearWater() { this.waters.length = 0; }
  _state(p) {
    return { top: new THREE.Color(p.top), horizon: new THREE.Color(p.horizon), sunC: new THREE.Color(p.sunC), sunI: p.sunI, elev: p.elev, az: p.az, hemiSky: new THREE.Color(p.hemiSky), hemiGround: new THREE.Color(p.hemiGround), hemiI: p.hemiI, fog: new THREE.Color(p.fog), fogD: p.fogD, night: p.night, water: p.water, stars: p.stars, exposure: p.exposure };
  }
  set(name, { instant = false, tint } = {}) {
    const p = PRESETS[name] || PRESETS.day;
    this.name = name; if (tint !== undefined) this.tint = tint;
    const next = this._state(p);
    if (this.tint && this.tint[name]) Object.assign(next, this._state({ ...p, ...this.tint[name] }));
    if (instant || !this.cur) { this.cur = next; this.from = this.to = null; this.t = 1; this._apply(next); return; }
    this.from = this._clone(this.cur); this.to = next; this.t = 0;
  }
  _clone(s) { const o = { ...s }; for (const k of ['top', 'horizon', 'sunC', 'hemiSky', 'hemiGround', 'fog']) o[k] = s[k].clone(); return o; }
  update(dt, time) {
    this.sky.material.uniforms.uTime.value = time;
    if (this.t < 1 && this.from) {
      this.t = Math.min(1, this.t + dt / this.dur);
      const k = this.t * this.t * (3 - 2 * this.t), a = this.from, b = this.to, o = this.cur;
      for (const key of ['top', 'horizon', 'sunC', 'hemiSky', 'hemiGround', 'fog']) o[key].copy(a[key]).lerp(b[key], k);
      for (const key of ['sunI', 'elev', 'hemiI', 'fogD', 'night', 'water', 'stars', 'exposure']) o[key] = a[key] + (b[key] - a[key]) * k;
      o.az = a.az + (b.az - a.az) * k;
      this._apply(o);
    }
  }
  _apply(s) {
    const u = this.sky.material.uniforms;
    u.uTop.value.copy(s.top); u.uHorizon.value.copy(s.horizon); u.uSunC.value.copy(s.sunC); u.uStars.value = s.stars;
    const ce = Math.cos(Math.asin(Math.min(1, s.elev)));
    const dir = new THREE.Vector3(Math.cos(s.az) * ce, s.elev, Math.sin(s.az) * ce).normalize();
    u.uSun.value.copy(dir);
    this.sun.color.copy(s.sunC); this.sun.intensity = s.sunI;
    this.sun.position.copy(dir).multiplyScalar(this.radius * 2.5).add(this.sun.target.position);
    this.hemi.color.copy(s.hemiSky); this.hemi.groundColor.copy(s.hemiGround); this.hemi.intensity = s.hemiI;
    this.fog.color.copy(s.fog); this.fog.density = s.fogD * (this.fogScale ?? 1);
    this.renderer.toneMappingExposure = s.exposure;
    setNight(s.night);
    for (const w of this.waters) {
      const wu = w.material.uniforms; wu.uSky.value.copy(s.horizon); wu.uSun.value.copy(dir);
      wu.uFogColor.value.copy(s.fog); wu.uFogDensity.value = this.fog.density; wu.uLight.value = s.water;
    }
    this.state = s; this.onApply?.(s);
  }
  setFogScale(k) { this.fogScale = k; if (this.cur) this.fog.density = this.cur.fogD * k; for (const w of this.waters) w.material.uniforms.uFogDensity.value = this.fog.density; }
  followTarget(v) { this.sun.target.position.copy(v); }
}
