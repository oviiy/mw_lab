import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { makeRng, lerp, TAU } from './util.js';
import { glowTexture } from './textures.js';
import { G } from './state.js';

const C = (h) => new THREE.Color(h);
// Colour keyframes across the day (t: 0 = dawn, .25 = noon, .5 = dusk, .75 = midnight)
const KEYS = [
  { t: 0.00, top: C(0x3d5f94), hor: C(0xffb07a), sun: C(0xffb878), amb: 0.5, sunI: 2.2 },
  { t: 0.08, top: C(0x2f78d0), hor: C(0xb9d4ee), sun: C(0xffeacb), amb: 0.9, sunI: 4.4 },
  { t: 0.25, top: C(0x2672d8), hor: C(0xa4cdf0), sun: C(0xfffaf0), amb: 1.0, sunI: 5.0 },
  { t: 0.42, top: C(0x356fbd), hor: C(0xf0c394), sun: C(0xffd09a), amb: 0.85, sunI: 4.0 },
  { t: 0.50, top: C(0x34377a), hor: C(0xff6f3d), sun: C(0xff8a4a), amb: 0.5, sunI: 1.6 },
  { t: 0.57, top: C(0x0b0f2c), hor: C(0x352c52), sun: C(0x7f8fd8), amb: 0.28, sunI: 0.5 },
  { t: 0.75, top: C(0x03050e), hor: C(0x0c1326), sun: C(0x8fa4ee), amb: 0.22, sunI: 0.55 },
  { t: 0.93, top: C(0x0b0f2c), hor: C(0x38385f), sun: C(0x7f8fd8), amb: 0.3, sunI: 0.5 },
  { t: 1.00, top: C(0x3d5f94), hor: C(0xffb07a), sun: C(0xffb878), amb: 0.5, sunI: 2.2 },
];

const DOME_FS = `
varying vec3 vD; uniform vec3 top; uniform vec3 hor; uniform vec3 sunDir; uniform vec3 sunCol; uniform float amb; uniform float time;
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
float fbm(vec2 p){ float a=0.5,s=0.0; for(int i=0;i<5;i++){ s+=a*vnoise(p); p=p*2.03+17.1; a*=0.5; } return s; }
void main(){
  vec3 d=normalize(vD); float h=clamp(d.y,0.0,1.0);
  vec3 c=mix(hor,top,pow(h,0.5));
  float s=max(dot(d,sunDir),0.0);
  c+=sunCol*(pow(s,900.0)*14.0+pow(s,64.0)*0.5+pow(s,6.0)*0.22);
  if(d.y>0.0){
    vec2 uv=d.xz/(h+0.16)*0.7+vec2(time*0.012,time*0.004);
    float cl=smoothstep(0.5,0.82,fbm(uv*1.5))*smoothstep(0.0,0.22,h);
    float lit=0.45+0.55*pow(max(dot(normalize(vec3(d.xz,0.0).xzy*0.0+d),sunDir)*0.5+0.5,0.0),1.5);
    vec3 cc=mix(hor*0.9,vec3(1.0),0.55)*(0.25+amb*0.85)*lit+sunCol*pow(s,3.0)*0.35;
    c=mix(c,cc,cl*0.92);
  }
  c=mix(c,hor*0.75,smoothstep(0.0,-0.3,d.y));
  gl_FragColor=vec4(c,1.0);
}`;

export class Sky {
  constructor(scene, renderer) {
    this.scene = scene; this.renderer = renderer;
    const rng = makeRng(5);
    scene.fog = new THREE.Fog(0xa9d0f2, 140, 800);

    this.uni = {
      top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() },
      amb: { value: 1 }, time: { value: 0 },
    };
    const domeMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false, uniforms: this.uni,
      vertexShader: 'varying vec3 vD; void main(){ vD=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: DOME_FS,
    });
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), domeMat);
    this.dome.renderOrder = -10; this.dome.userData.noAO = true; scene.add(this.dome);

    // far mountain ring that dissolves into the horizon haze
    const seg = 160, pos = [], idx = [], noise = (a) => Math.sin(a * 3 + 1) * 0.5 + Math.sin(a * 7.3 + 2) * 0.3 + Math.sin(a * 17 + 5) * 0.2 + Math.sin(a * 41) * 0.08;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * TAU, h = 90 + (noise(a) * 0.5 + 0.5) * 230 * (0.5 + 0.5 * Math.sin(a * 2.3 + 0.7) ** 2);
      pos.push(Math.cos(a) * 1250, -20, Math.sin(a) * 1250, Math.cos(a) * 1250, h, Math.sin(a) * 1250);
      if (i < seg) { const k = i * 2; idx.push(k, k + 1, k + 3, k, k + 3, k + 2); }
    }
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); mg.setIndex(idx);
    this.mtn = new THREE.Mesh(mg, new THREE.ShaderMaterial({
      side: THREE.DoubleSide, fog: false, depthWrite: false, transparent: true,
      uniforms: { hor: this.uni.hor, amb: this.uni.amb },
      vertexShader: 'varying float vH; varying vec3 vP; void main(){ vH=position.y; vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `varying float vH; varying vec3 vP; uniform vec3 hor; uniform float amb;
        void main(){ float t=clamp(vH/240.0,0.0,1.0); vec3 base=vec3(0.16,0.2,0.24)*(0.25+amb*0.9);
          vec3 c=mix(hor*0.9,base,pow(t,0.7)*0.8); float a=smoothstep(-20.0,45.0,vH); gl_FragColor=vec4(c,a); }`,
    }));
    this.mtn.renderOrder = -9; this.mtn.userData.noAO = true; scene.add(this.mtn);

    // stars + moon
    const sp = []; for (let i = 0; i < 900; i++) { const a = rng() * TAU, y = 0.05 + rng() * 0.95, r = Math.sqrt(1 - y * y); sp.push(Math.cos(a) * r * 1400, y * 1400, Math.sin(a) * r * 1400); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    this.stars.userData.noAO = true; scene.add(this.stars);
    this.moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xdfe8ff, fog: false, depthWrite: false, transparent: true }));
    this.moon.scale.set(120, 120, 1); this.moon.userData.noAO = true; scene.add(this.moon);

    this.hemi = new THREE.HemisphereLight(0xbfd8ff, 0x4a4a40, 1.0); scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffffff, 3); this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera; sc.left = -80; sc.right = 80; sc.top = 80; sc.bottom = -80; sc.near = 10; sc.far = 600;
    this.sun.shadow.bias = -0.0005; this.sun.shadow.normalBias = 0.05; this.sun.shadow.radius = 3;
    scene.add(this.sun, this.sun.target);

    // image-based lighting captured from the live sky, so car paint and glass reflect the real sky/sun
    this.envScene = new THREE.Scene();
    this.envScene.add(new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), domeMat));
    // dark ground disc so reflections from below are asphalt, not bright horizon
    const gd = new THREE.Mesh(new THREE.CircleGeometry(480, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x0b0b0c })); gd.position.y = -2; this.envScene.add(gd);
    this.pmrem = new THREE.PMREMGenerator(renderer); this.envRT = null; this.envTod = -1;
    this.roomEnv = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture; // indoor reflections
    this.night = 0; this.tod = 0.12; this.amb = 1;
    this._v = new THREE.Vector3();
  }

  refreshEnv() {
    const rt = this.pmrem.fromScene(this.envScene, 0, 1, 1000);
    if (this.envRT) this.envRT.dispose();
    this.envRT = rt; if (!G.indoor) this.scene.environment = rt.texture;
  }

  update(dt, focus) {
    this.tod = (this.tod + dt / 480) % 1; // 8 real minutes per day
    const t = this.tod;
    let a = KEYS[0], b = KEYS[1];
    for (let i = 0; i < KEYS.length - 1; i++) if (t >= KEYS[i].t && t <= KEYS[i + 1].t) { a = KEYS[i]; b = KEYS[i + 1]; break; }
    const k = (t - a.t) / Math.max(1e-6, b.t - a.t);
    this.uni.top.value.copy(a.top).lerp(b.top, k);
    this.uni.hor.value.copy(a.hor).lerp(b.hor, k);
    this.uni.sunCol.value.copy(a.sun).lerp(b.sun, k);
    const amb = this.amb = lerp(a.amb, b.amb, k), sunI = lerp(a.sunI, b.sunI, k);
    this.uni.amb.value = amb; this.uni.time.value += dt;
    this.night = THREE.MathUtils.clamp((0.55 - amb) / 0.25, 0, 1);
    this.scene.fog.color.copy(this.uni.hor.value).multiplyScalar(0.92);
    this.scene.fog.near = lerp(170, 60, this.night); this.scene.fog.far = lerp(950, 560, this.night);

    const ang = (t % 0.5) / 0.5 * Math.PI, isDay = t < 0.5;
    const dir = this._v.set(Math.cos(ang), Math.sin(ang), 0.35).normalize();
    const sd = this.uni.sunDir.value.copy(dir); if (!isDay) sd.negate().setY(-0.2);
    const ind = G.indoor;
    this.sun.color.copy(this.uni.sunCol.value); this.sun.intensity = ind ? 0 : sunI;
    const q = 160 / 2048 * 2; this.sun.target.position.set(Math.round(focus.x / q) * q, 0, Math.round(focus.z / q) * q);
    const ly = Math.max(0.12, dir.y), ll = Math.hypot(dir.x, ly, dir.z); // light follows the visible sun (long golden-hour shadows)
    this.sun.position.set(this.sun.target.position.x + (dir.x / ll) * 300, (ly / ll) * 300, this.sun.target.position.z + (dir.z / ll) * 300);
    this.hemi.intensity = ind ? 0.08 : 0.08 + amb * 0.22;
    this.hemi.color.copy(this.uni.top.value).lerp(new THREE.Color(1, 1, 1), 0.4);
    this.hemi.groundColor.copy(this.uni.hor.value).multiplyScalar(0.3);
    this.scene.environment = ind ? this.roomEnv : this.envRT ? this.envRT.texture : null;
    this.scene.environmentIntensity = ind ? 0.45 : 0.22 + amb * 0.8;
    this.stars.material.opacity = this.night; this.stars.position.copy(focus).setY(0);
    this.dome.position.copy(focus); this.mtn.position.set(focus.x, 0, focus.z);
    this.moon.position.copy(focus).addScaledVector(dir, isDay ? -1300 : 1300); this.moon.position.y = Math.max(80, this.moon.position.y);
    this.moon.material.opacity = this.night;
    if (Math.abs(this.tod - this.envTod) > 0.012 || this.envTod < 0) { this.envTod = this.tod; this.refreshEnv(); }
    return this.night;
  }
}
