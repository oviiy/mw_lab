// The trading floor, 1987: a packed octagonal pit of worn steps under cool fluorescent haze,
// walls of quote boards, world clocks, phone banks ringing the pit, alarm beacons.
// Static architecture is merged by material so the whole hall costs a few dozen draw calls.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { floorTexture, stepTexture, riserTexture, wallTexture, woodTexture, signTexture, crtTexture, ledStripTexture, litterTexture, WindowSky } from './textures.js';
import { toPx } from './market/orderbook.js';
import { PREV_SETTLE, PREV_CASH } from './market/calibration.js';
import { dowOf, DOW_PREV } from './outcry.js';
import { FIRMS } from './market/agents.js';
import { pitClock, mulberry32, clamp } from './util.js';

export const TIER_H = 0.38;
export const TIER_R = [10.6, 8.7, 6.9, 5.1, 3.3];
export const HALL = { w: 64, d: 48, h: 17 };
export const PLAYER_ANGLE = Math.PI / 2; // +z side of the pit, facing the board on −z

export const tierTop = (k) => -k * TIER_H;

// Corner points [x, z] of an octagon matching the tier cylinders exactly.
export function octagon(r) {
  const g = new THREE.CylinderGeometry(r, r, 1, 8, 1);
  g.rotateY(Math.PI / 8);
  const p = g.attributes.position, out = [];
  for (let i = 0; i < 8; i++) out.push([p.getX(i), p.getZ(i)]);
  g.dispose();
  return out;
}

// Geometry bucket: collect boxes etc. in world space, merge once per material.
class Bucket {
  constructor() { this.g = []; }
  add(g) {
    if (g.index) g = g.toNonIndexed();
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    this.g.push(g);
    return g;
  }
  box(w, h, d, x, y, z, ry = 0, uvs = 0) {
    const g = new THREE.BoxGeometry(w, h, d);
    if (uvs) worldUV(g, uvs, w, h, d);
    if (ry) g.rotateY(ry);
    g.translate(x, y, z);
    return this.add(g);
  }
  mesh(mat, o = {}) {
    if (!this.g.length) return null;
    const m = new THREE.Mesh(mergeGeometries(this.g), mat);
    m.castShadow = !!o.cast; m.receiveShadow = o.receive ?? true;
    return m;
  }
}
// Box UVs proportional to size so wood/fabric textures don't stretch.
function worldUV(g, s, w, h, d) {
  const uv = g.attributes.uv, n = g.attributes.normal;
  for (let i = 0; i < uv.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    const sx = ax > 0.5 ? d : w, sy = ay > 0.5 ? d : h;
    uv.setXY(i, uv.getX(i) * sx * s, uv.getY(i) * sy * s);
  }
}

// Booth placement helper: local x along the counter, y up, z toward the room.
function at(g, x, z, ry, lx, ly, lz) {
  g.translate(lx, ly, lz);
  g.rotateY(ry);
  g.translate(x, 0, z);
  return g;
}

// ── Phone banks ──────────────────────────────────────────────────────────────────
// Booth centres; local +z faces the pit. `clerks` is how many instanced clerks stand there.
const WALL_X = HALL.w / 2 - 1.2;
export const BOOTHS = [];
for (let i = 0; i < 9; i++) {
  BOOTHS.push({ x: -WALL_X, z: -15 + i * 3.6, ry: Math.PI / 2, clerks: 0 });
  BOOTHS.push({ x: WALL_X, z: -15 + i * 3.6, ry: -Math.PI / 2, clerks: 0 });
  BOOTHS.push({ x: -14 + i * 3.6, z: HALL.d / 2 - 1.2, ry: Math.PI, clerks: 1 });
}
for (let i = 0; i < 8; i++) BOOTHS.push({ x: -12.6 + i * 3.6, z: -15.4, ry: 0, clerks: 2, inner: true });
for (let i = 0; i < 5; i++) {
  BOOTHS.push({ x: -16.2, z: -10.5 + i * 3.6, ry: Math.PI / 2, clerks: 2, inner: true });
  BOOTHS.push({ x: 16.2, z: -10.5 + i * 3.6, ry: -Math.PI / 2, clerks: 2, inner: true });
}
for (const x of [-12.6, -9, 9, 12.6]) BOOTHS.push({ x, z: 16.2, ry: Math.PI, clerks: 2, inner: true });
// Runners shuttle between the phone banks and the rim of the pit.
export const RUNNER_PATHS = [
  [[-13.5, -13.1], [-6, -13.3]], [[6.5, -13.3], [13.8, -12.6]], [[-14.3, -8], [-13.7, 2]],
  [[14.2, -9], [13.5, 1.5]], [[-2.5, -13.6], [3, -13.4]], [[-12.8, 6.5], [-9.5, 11.5]], [[12.8, 6], [10, 11.2]],
];

export class Pit {
  constructor(scene, quality) {
    this.scene = scene;
    this.quality = quality;
    this.group = new THREE.Group();
    scene.add(this.group);
    // Cool, smoky fluorescent hall: grey-green haze swallows the far walls.
    this.fogColor = new THREE.Color(0x5e665e);
    scene.background = this.fogColor.clone();
    scene.fog = new THREE.FogExp2(this.fogColor.clone(), 0.022);
    this.steel = new THREE.MeshStandardMaterial({ color: 0x6d7174, metalness: 0.7, roughness: 0.38 });
    this.brass = this.steel; // legacy name used by the board trims
    this.wood = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.6, color: 0x9a8a7c });
    this.power = 1; this.alarmLevel = 0; this._alarmSet = false;
    this._hall();
    this._tiers();
    this._rails();
    this._booths();
    this.board = new PriceBoard(this.group, this.steel);
    this.quotes = new QuoteBoards(this.group);
    this.clock = new WorldClocks(this.group);
    this.dow = new DowStrip(this.group);
    this._windows();
    this._signs();
    this._hangingBoards();
    this._litter();
    this._beacons();
    this._lights(quality);
    this._env();
  }

  _hall() {
    const { w, d, h } = HALL;
    const shape = new THREE.Shape([new THREE.Vector2(-w / 2, -d / 2), new THREE.Vector2(w / 2, -d / 2), new THREE.Vector2(w / 2, d / 2), new THREE.Vector2(-w / 2, d / 2)]);
    shape.holes.push(new THREE.Path(octagon(TIER_R[0]).map(([x, z]) => new THREE.Vector2(x, -z)).reverse()));
    const ft = floorTexture(); ft.repeat.set(0.2, 0.2);
    const floor = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.55, color: 0xd6d8d0 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Walls: dark laminate dado, painted panels above, pilasters, cornice.
    const wainscot = new Bucket(), upper = new Bucket(), trim = new Bucket();
    const H0 = 2.6;
    const wall = (W, x, z, ry) => {
      const lo = new THREE.PlaneGeometry(W, H0); worldUVPlane(lo, W, H0, 0.5);
      lo.translate(0, H0 / 2, 0); lo.rotateY(ry); lo.translate(x, 0, z); wainscot.add(lo);
      const hi = new THREE.PlaneGeometry(W, h - H0); worldUVPlane(hi, W, h - H0, 0.12);
      hi.translate(0, H0 + (h - H0) / 2, 0); hi.rotateY(ry); hi.translate(x, 0, z); upper.add(hi);
      for (const [yy, hh, dd] of [[H0, 0.12, 0.1], [0.1, 0.2, 0.06], [h - 0.35, 0.5, 0.35]]) {
        const b = new THREE.BoxGeometry(W, hh, dd); b.translate(0, yy, dd / 2); b.rotateY(ry); b.translate(x, 0, z); trim.add(b);
      }
    };
    wall(w, 0, -d / 2, 0);
    wall(w, 0, d / 2, Math.PI);
    wall(d, -w / 2, 0, Math.PI / 2);
    wall(d, w / 2, 0, -Math.PI / 2);
    const pil = (x, z, ry) => { const b = new THREE.BoxGeometry(0.8, h, 0.24); b.translate(0, h / 2, 0.12); b.rotateY(ry); b.translate(x, 0, z); trim.add(b); };
    for (const x of [-8, 0, 8, 16, 24, -16, -24]) pil(x, d / 2, Math.PI);
    for (const z of [-16, 16]) { pil(-w / 2, z, Math.PI / 2); pil(w / 2, z, -Math.PI / 2); }
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture(), roughness: 0.95, color: 0xc8ccc4 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x2c2d2b, roughness: 0.6 });
    const dado = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.6, color: 0x5a524c });
    this.group.add(wainscot.mesh(dado), upper.mesh(wallMat), trim.mesh(trimMat));

    // Ceiling grid packed with 4-tube fluorescent troffers, plus long rows of suspended strip
    // fixtures hanging over the floor on rods.
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: 0x4a4d4a, roughness: 1 }));
    ceil.rotation.x = Math.PI / 2; ceil.position.y = h;
    this.group.add(ceil);
    const beams = new Bucket(), lamps = new Bucket(), housings = new Bucket(), rods = new Bucket();
    for (let x = -28; x <= 28; x += 8) beams.box(0.5, 0.9, d, x, h - 0.45, 0);
    for (let z = -21; z <= 21; z += 6) beams.box(w, 0.7, 0.4, 0, h - 0.35, z);
    for (let x = -26; x <= 26; x += 4) for (let z = -19.5; z <= 19.5; z += 3) {
      housings.box(1.3, 0.06, 2.5, x, h - 0.05, z);
      for (const o of [-0.45, -0.15, 0.15, 0.45]) { const g = new THREE.PlaneGeometry(0.12, 2.35); g.rotateX(Math.PI / 2); g.translate(x + o, h - 0.085, z); lamps.add(g); }
    }
    // Suspended rows (y ≈ 10.4) running across the hall; kept out of the board's sightline.
    const LY = 10.4;
    for (let z = -20; z <= 20; z += 4) for (let x = -27; x <= 27; x += 4.5) {
      if (Math.abs(x) < 14 && z < 2) continue;
      housings.box(3.8, 0.14, 0.42, x, LY, z);
      for (const o of [-0.1, 0.1]) { const g = new THREE.PlaneGeometry(3.6, 0.07); g.rotateX(Math.PI / 2); g.translate(x, LY - 0.075, z + o); lamps.add(g); }
      for (const o of [-1.5, 1.5]) rods.box(0.02, h - LY, 0.02, x + o, LY + (h - LY) / 2, z);
    }
    this.group.add(beams.mesh(new THREE.MeshStandardMaterial({ color: 0x3e403e, roughness: 0.9 })), housings.mesh(new THREE.MeshStandardMaterial({ color: 0xa8aca6, roughness: 0.6 })), rods.mesh(this.steel));
    this.lampBase = new THREE.Color(0xeefff2).multiplyScalar(2.2);
    this.lampMat = new THREE.MeshBasicMaterial({ color: this.lampBase.clone(), fog: false });
    this.group.add(lamps.mesh(this.lampMat, { receive: false }));
  }

  _tiers() {
    // Worn hardwood treads; black kick-plate risers; thin aluminium nosing strips.
    const st = stepTexture();
    const tread = new THREE.MeshStandardMaterial({ map: st, roughness: 0.78, color: 0xc4bcb0 });
    tread.map.repeat.set(0.5, 0.5);
    const rt = riserTexture();
    const riser = new THREE.MeshStandardMaterial({ map: rt, roughness: 0.75, color: 0xb0aca4 });
    const treads = [], risers = [], nosing = new Bucket();
    for (let k = 0; k < TIER_R.length; k++) {
      const rOut = TIER_R[k], rIn = TIER_R[k + 1] ?? 0, y = tierTop(k);
      treads.push(octRing(rOut, rIn, y));
      if (k > 0) {
        risers.push(octBand(rOut, tierTop(k - 1), y));
        const c = octagon(rOut + 0.03);
        for (let i = 0; i < 8; i++) {
          const [x0, z0] = c[i], [x1, z1] = c[(i + 1) % 8];
          const len = Math.hypot(x1 - x0, z1 - z0);
          nosing.box(len + 0.04, 0.025, 0.07, (x0 + x1) / 2, tierTop(k - 1) - 0.005, (z0 + z1) / 2, -Math.atan2(z1 - z0, x1 - x0));
        }
      }
    }
    const tm = new THREE.Mesh(mergeGeometries(treads), tread);
    tm.receiveShadow = true;
    const rm = new THREE.Mesh(mergeGeometries(risers), riser);
    rm.receiveShadow = true;
    this.group.add(tm, rm, nosing.mesh(new THREE.MeshStandardMaterial({ color: 0x4a4b48, metalness: 0.5, roughness: 0.6 })));
  }

  _rails() {
    // A plain, thin steel rail around the top of the pit (open on the player's side).
    const r = TIER_R[0] + 0.35;
    const b = new Bucket();
    const c = octagon(r);
    for (let i = 0; i < 8; i++) {
      const [x0, z0] = c[i], [x1, z1] = c[(i + 1) % 8];
      const mid = Math.atan2((z0 + z1) / 2, (x0 + x1) / 2);
      if (Math.abs(Math.atan2(Math.sin(mid - PLAYER_ANGLE), Math.cos(mid - PLAYER_ANGLE))) < 0.5) continue;
      const len = Math.hypot(x1 - x0, z1 - z0), ang = -Math.atan2(z1 - z0, x1 - x0);
      const g = new THREE.CylinderGeometry(0.022, 0.022, len, 6);
      g.rotateZ(Math.PI / 2); g.rotateY(ang); g.translate((x0 + x1) / 2, 0.98, (z0 + z1) / 2);
      b.add(g);
      for (const t of [0, 0.5]) {
        const post = new THREE.CylinderGeometry(0.018, 0.018, 0.98, 6); post.translate(x0 + (x1 - x0) * t, 0.49, z0 + (z1 - z0) * t); b.add(post);
      }
    }
    this.group.add(b.mesh(new THREE.MeshStandardMaterial({ color: 0x3a3c3c, metalness: 0.5, roughness: 0.5 })));
  }

  _booths() {
    const rand = mulberry32(99);
    const desk = new Bucket(), top = new Bucket(), dark = new Bucket(), beige = new Bucket(), screens = new Bucket(), paper = [], signs = new Bucket();
    const firmNames = FIRMS.map((f) => f.name);
    const signTex = signTexture(1024, 512, '#121314', firmNames.slice(0, 8).map((n, i) => ({ text: n, size: 44, color: '#e8e4d0', y: 32 + i * 64, font: 'Arial, sans-serif', spacing: 6 })));
    BOOTHS.forEach((b, booth) => {
      const { x, z, ry } = b;
      const B = (bucket, w, h, d, lx, ly, lz) => { const g = new THREE.BoxGeometry(w, h, d); worldUV(g, 0.5, w, h, d); bucket.add(at(g, x, z, ry, lx, ly, lz)); };
      B(desk, 3.2, 1.0, 0.92, 0, 0.55, 0);
      B(dark, 3.1, 0.1, 0.86, 0, 0.05, -0.02);
      B(top, 3.32, 0.05, 1.04, 0, 1.075, 0.02);
      B(desk, 3.2, 1.1, 0.08, 0, 1.65, -0.42);
      B(top, 3.2, 0.04, 0.42, 0, 1.75, -0.2);
      B(desk, 0.06, 1.1, 0.5, -1.57, 1.65, -0.2); B(desk, 0.06, 1.1, 0.5, 1.57, 1.65, -0.2);
      B(dark, 3.24, 0.06, 0.5, 0, 2.21, -0.2);
      // Banks of multi-line phones with handsets.
      for (const p of [-1.25, -0.6, 0.05, 0.7, 1.3]) {
        const bucket = rand() < 0.5 ? dark : beige;
        B(bucket, 0.26, 0.07, 0.22, p, 1.135, 0.12);
        B(bucket, 0.24, 0.04, 0.1, p, 1.18, 0.06);
        if (rand() < 0.6) B(bucket, 0.06, 0.05, 0.24, p - 0.08, 1.215, 0.06);
        for (let k = 0; k < 6; k++) B(beige, 0.025, 0.012, 0.02, p - 0.08 + k * 0.032, 1.175, 0.2);
      }
      // CRT quote monitors on the hutch shelf (and a second tier on the inner ring).
      const mons = b.inner ? [-1.1, 0, 1.1] : rand() < 0.5 ? [-0.8] : [-0.8, 0.8];
      for (const m of mons) {
        B(beige, 0.46, 0.38, 0.42, m, 1.97, -0.22);
        B(beige, 0.36, 0.3, 0.2, m, 1.95, -0.38);
        const s = new THREE.PlaneGeometry(0.36, 0.27);
        const v = Math.floor(rand() * 4);
        const uv = s.attributes.uv;
        for (let k = 0; k < uv.count; k++) uv.setXY(k, (v + uv.getX(k)) / 4, uv.getY(k));
        screens.add(at(s, x, z, ry, m, 1.98, -0.005));
      }
      // Paper: stacks of order tickets, deck sheets, a coffee cup; drifts of it on the floor.
      for (let k = 0; k < 5 + Math.floor(rand() * 5); k++) {
        const w = 0.2 + rand() * 0.1, h = 0.01 + rand() * 0.1, d = 0.28;
        const g = new THREE.BoxGeometry(w, h, d);
        g.rotateY((rand() - 0.5) * 0.6);
        at(g, x, z, ry, -1.45 + rand() * 2.9, 1.1 + h / 2, 0.25 + rand() * 0.2);
        paper.push(colorize(g, [0xf6f2e6, 0xf6f2e6, 0xfff2a0, 0xffd8d0, 0xd8ecff][Math.floor(rand() * 5)]));
      }
      for (let k = 0; k < 3; k++) {
        const g = new THREE.BoxGeometry(0.3 + rand() * 0.2, 0.04 + rand() * 0.2, 0.3);
        g.rotateY(rand() * 3);
        at(g, x, z, ry, -1.4 + rand() * 2.8, 0.06, 0.6 + rand() * 0.25);
        paper.push(colorize(g, rand() < 0.5 ? 0xe8e2d2 : 0xc8b898));
      }
      if (rand() < 0.6) { const cup = new THREE.CylinderGeometry(0.04, 0.035, 0.1, 8); at(cup, x, z, ry, -1.3 + rand() * 2.6, 1.15, 0.38); paper.push(colorize(cup, 0xf0ece0)); }
      const sg = new THREE.PlaneGeometry(2.4, 0.26);
      const f = booth % 8, uvs = sg.attributes.uv;
      for (let k = 0; k < uvs.count; k++) uvs.setXY(k, uvs.getX(k), 1 - (f + 1 - uvs.getY(k)) / 8);
      signs.add(at(sg, x, z, ry, 0, 2.21, 0.034));
    });
    this.group.add(desk.mesh(new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.55, color: 0x6e645c }), { cast: true }));
    this.group.add(top.mesh(new THREE.MeshStandardMaterial({ color: 0xc8c8bc, roughness: 0.45 })));
    this.group.add(dark.mesh(new THREE.MeshStandardMaterial({ color: 0x1c1c1b, roughness: 0.35 })));
    this.group.add(beige.mesh(new THREE.MeshStandardMaterial({ color: 0xc4beac, roughness: 0.5 })));
    this.screenMat = new THREE.MeshBasicMaterial({ map: crtTexture(), color: new THREE.Color(1.6, 1.6, 1.6), toneMapped: false });
    this.group.add(screens.mesh(this.screenMat, { receive: false }));
    this.group.add(new THREE.Mesh(mergeGeometries(paper), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 })));
    this.group.add(signs.mesh(new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5, emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: 0.25 })));
    this.boothSpots = BOOTHS.filter((b) => !b.inner && Math.abs(b.ry) === Math.PI / 2).map((b) => ({ x: b.x + Math.sign(b.ry) * 1.3, z: b.z, ry: -b.ry }));
  }

  _windows() {
    this.sky = new WindowSky();
    const mat = new THREE.MeshBasicMaterial({ map: this.sky.texture, fog: false });
    const frames = new Bucket();
    this.shafts = [];
    this.shaftMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0xffe2b0) }, uI: { value: 0.11 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec2 vUv; uniform vec3 uColor; uniform float uI;
        void main(){
          float across = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
          float along = pow(1.0 - vUv.y, 1.6) * smoothstep(0.0, 0.04, vUv.y);
          float streak = 0.75 + 0.25 * sin(vUv.x * 40.0 + vUv.y * 6.0);
          gl_FragColor = vec4(uColor * uI * across * along * streak, 1.0);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    });
    for (let i = 0; i < 4; i++) {
      const z = -12 + i * 8;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(4, 10), mat);
      m.position.set(-HALL.w / 2 + 0.05, 9.5, z);
      m.rotation.y = Math.PI / 2;
      this.group.add(m);
      const X = -HALL.w / 2;
      frames.box(0.5, 0.25, 4.6, X + 0.2, 4.4, z); frames.box(0.5, 0.25, 4.6, X + 0.2, 14.6, z);
      frames.box(0.5, 10.4, 0.25, X + 0.2, 9.5, z - 2.15); frames.box(0.5, 10.4, 0.25, X + 0.2, 9.5, z + 2.15);
      frames.box(0.12, 10, 0.1, X + 0.1, 9.5, z);
      for (let y = 5.5; y < 14.5; y += 2.5) frames.box(0.12, 0.08, 4, X + 0.1, y, z);
      const g = new THREE.BufferGeometry();
      const pos = [], uv = [], idx = [];
      const quad = (ax, ay, az, bx, by, bz) => {
        const o = pos.length / 3;
        pos.push(ax, ay, az, bx, by, bz, ax, ay, az, bx, by, bz);
        uv.push(0, 0, 1, 0, 0, 1, 1, 1);
        idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
      };
      quad(X + 0.3, 9.5, z - 1.9, X + 0.3, 9.5, z + 1.9);
      quad(X + 0.3, 4.6, z, X + 0.3, 14.4, z);
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      const shaft = new THREE.Mesh(g, this.shaftMat);
      shaft.frustumCulled = false;
      shaft.renderOrder = 2;
      this.shafts.push(shaft);
      this.group.add(shaft);
    }
    this.group.add(frames.mesh(new THREE.MeshStandardMaterial({ color: 0x2e302e, roughness: 0.6 })));
  }

  _signs() {
    const main = signTexture(2048, 256, '#101112', [{ text: 'MERCANTILE EXCHANGE  ·  INDEX AND OPTION MARKET', size: 104, color: '#e6e2d2', y: 132, spacing: 10, font: 'Arial, sans-serif' }], '#55585a');
    const m = new THREE.Mesh(new THREE.PlaneGeometry(26, 3.25), new THREE.MeshStandardMaterial({ map: main, roughness: 0.4, emissive: 0xffffff, emissiveMap: main, emissiveIntensity: 0.35 }));
    m.position.set(0, 15.1, -HALL.d / 2 + 0.32);
    m.material.depthTest = false; m.renderOrder = 6; // nothing at this height should hide the lettering
    this.group.add(m);
    const side = signTexture(1024, 256, '#141516', [{ text: 'S&P 500 STOCK INDEX FUTURES', size: 64, color: '#e0e0d6', y: 96, spacing: 4, font: 'Arial, sans-serif' }, { text: 'PIT 4  ·  MEMBERS AND CLERKS ONLY', size: 40, color: '#e0b030', y: 180, font: 'Arial, sans-serif', spacing: 3 }], '#55585a');
    const sm = new THREE.MeshStandardMaterial({ map: side, roughness: 0.5 });
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), sm);
      p.position.set(s * (HALL.w / 2 - 0.08), 3.6, s < 0 ? 18.5 : 12);
      p.rotation.y = -s * Math.PI / 2;
      this.group.add(p);
    }
  }

  _hangingBoards() {
    const rows = ['MAR 88  264.10', 'JUN 88  266.40', 'SEP 88  268.75', 'S&P CASH 282.70', 'NYSE TICK -1120', 'MMI DEC 452.50', 'VALUE LINE 241', 'DJIA 2246.74'];
    const tex = ledStripTexture(rows);
    const faces = [], frame = new Bucket(), rods = new Bucket();
    const R = 7.2, Y = 11.6;
    const c = octagon(R);
    for (let i = 0; i < 8; i++) {
      const [x0, z0] = c[i], [x1, z1] = c[(i + 1) % 8];
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ang = Math.atan2(mx, mz);
      const p = new THREE.PlaneGeometry(4.4, 0.55);
      const uv = p.attributes.uv;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k), 1 - (i + 1 - uv.getY(k)) / 8);
      const q = p.clone();
      p.rotateY(ang); p.translate(mx + Math.sin(ang) * 0.12, Y, mz + Math.cos(ang) * 0.12);
      q.rotateY(ang + Math.PI); q.translate(mx - Math.sin(ang) * 0.12, Y, mz - Math.cos(ang) * 0.12);
      faces.push(p, q);
      frame.box(4.7, 0.75, 0.22, mx, Y, mz, ang);
      for (const o of [-1.8, 1.8]) {
        const ox = Math.cos(ang) * o, oz = -Math.sin(ang) * o;
        rods.box(0.04, HALL.h - Y, 0.04, mx + ox, Y + (HALL.h - Y) / 2, mz + oz);
      }
    }
    this.group.add(new THREE.Mesh(mergeGeometries(faces), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })));
    this.group.add(frame.mesh(new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.5 })));
    this.group.add(rods.mesh(this.steel));
  }

  // Paper everywhere: trading cards, order tickets and scraps trodden into the steps and floor.
  _litter() {
    const rand = mulberry32(123);
    const N = this.quality && this.quality.name === 'low' ? 900 : 1800;
    const geo = new THREE.PlaneGeometry(0.11, 0.075);
    geo.rotateX(-Math.PI / 2);
    const uv = geo.attributes.uv;
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ map: litterTexture(), alphaTest: 0.5, roughness: 0.9, side: THREE.DoubleSide }), N);
    // Each instance picks an atlas cell through a per-instance UV offset.
    const cellAttr = new Float32Array(N);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(), c = new THREE.Color();
    const tints = [0xffffff, 0xffffff, 0xfff2a8, 0xd9ecff, 0xe6ffe0, 0xffffff];
    for (let i = 0; i < N; i++) {
      // Biased toward the pit and the part of the floor in front of the player.
      const r = rand() < 0.8 ? Math.sqrt(rand()) * (TIER_R[0] + 2.5) : TIER_R[0] + 2.5 + rand() * 6;
      const a = rand() * Math.PI * 2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const y = groundAt(x, z) + 0.004 + rand() * 0.004;
      p.set(x, y, z);
      e.set((rand() - 0.5) * 0.15, rand() * 6.28, (rand() - 0.5) * 0.15);
      const sc = 0.8 + rand() * 0.8;
      m4.compose(p, q.setFromEuler(e), s.set(sc, 1, sc));
      mesh.setMatrixAt(i, m4);
      mesh.setColorAt(i, c.set(tints[i % tints.length]).multiplyScalar(0.85 + rand() * 0.15));
      cellAttr[i] = Math.floor(rand() * 4);
    }
    geo.setAttribute('aCell', new THREE.InstancedBufferAttribute(cellAttr, 1));
    mesh.material.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aCell;')
        .replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_MAP\n vMapUv = vec2((uv.x + aCell) * 0.25, uv.y);\n#endif');
    };
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    this.group.add(mesh);
  }

  // Red rotating alarm beacons around the hall (driven by setAlarm).
  _beacons() {
    const spots = [[-15.25, 9.2, -23.4], [15.25, 9.2, -23.4], [-31.4, 6, -6, 1], [31.4, 6, -6, -1], [-31.4, 6, 8, 1], [31.4, 6, 8, -1]];
    for (const b of BOOTHS) if (b.inner && b.ry === 0 && Math.abs(b.x) > 3) spots.push([b.x, 2.42, b.z - 0.2]);
    const domes = [], halos = [], bases = new Bucket();
    const eye = new THREE.Vector3(0, 1.85, 10.3);
    spots.forEach(([x, y, z], i) => {
      const ph = i * 1.37;
      const d = new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
      d.translate(x, y + 0.08, z); domes.push(withPhase(d, ph));
      bases.box(0.34, 0.1, 0.34, x, y + 0.03, z);
      const h = new THREE.PlaneGeometry(1.6, 1.6);
      h.lookAt(new THREE.Vector3().subVectors(eye, new THREE.Vector3(x, y, z)));
      h.translate(x, y + 0.14, z); halos.push(withPhase(h, ph));
    });
    this.beaconU = { uTime: { value: 0 }, uLevel: { value: 0 } };
    const vs = `attribute float aPh; varying float vPh; varying vec2 vUv; void main(){ vPh = aPh; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
    const pulse = 'float pulse = pow(0.5 + 0.5 * cos(uTime * 7.5 + vPh), 6.0) * uLevel;';
    const dome = new THREE.Mesh(mergeGeometries(domes), new THREE.ShaderMaterial({
      uniforms: this.beaconU, vertexShader: vs,
      fragmentShader: `uniform float uTime, uLevel; varying float vPh; varying vec2 vUv; void main(){ ${pulse} gl_FragColor = vec4(vec3(0.35, 0.03, 0.02) + vec3(6.0, 0.5, 0.25) * pulse, 1.0); }`,
      toneMapped: false,
    }));
    const halo = new THREE.Mesh(mergeGeometries(halos), new THREE.ShaderMaterial({
      uniforms: this.beaconU, vertexShader: vs,
      fragmentShader: `uniform float uTime, uLevel; varying float vPh; varying vec2 vUv; void main(){ ${pulse} float d = length(vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 2.2); gl_FragColor = vec4(vec3(1.0, 0.12, 0.06) * a * pulse * 2.2, 1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false,
    }));
    halo.renderOrder = 3; halo.frustumCulled = false;
    this.group.add(dome, halo, bases.mesh(new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 })));
  }

  _lights(quality) {
    // Fluorescent wash: a cool, faintly green sky light, an overhead key that casts the soft
    // shadows under everyone, and a little low fill. Window sun is a weak accent from the west.
    this.hemi = new THREE.HemisphereLight(0xe4f2e8, 0x3a3c36, 1.15);
    this.scene.add(this.hemi);
    this.key = new THREE.DirectionalLight(0xeefff2, 1.55);
    this.key.position.set(3, 30, 8);
    this.key.castShadow = quality.shadows;
    const s = this.key.shadow;
    s.mapSize.set(quality.shadowSize, quality.shadowSize);
    s.camera.left = -17; s.camera.right = 17; s.camera.top = 17; s.camera.bottom = -17;
    s.camera.near = 10; s.camera.far = 50;
    s.bias = -0.0006; s.normalBias = 0.03;
    this.scene.add(this.key);
    this.sun = new THREE.DirectionalLight(0xffe2b0, 0.5);
    this.sun.position.set(-40, 26, 6);
    this.scene.add(this.sun);
    this.fill = new THREE.PointLight(0xdff0ff, 16, 30, 1.6);
    this.fill.position.set(0, 7, 4);
    this.scene.add(this.fill);
    this.alarm = new THREE.PointLight(0xff2a1a, 0, 60, 1.2);
    this.alarm.position.set(0, 9, -HALL.d / 2 + 3);
    this.alarm2 = new THREE.PointLight(0xff2a1a, 0, 40, 1.2);
    this.alarm2.position.set(0, 4, 4);
    this.scene.add(this.alarm, this.alarm2);
    this.base = { hemi: this.hemi.intensity, key: this.key.intensity, fill: this.fill.intensity };
  }

  _env() {
    const prev = this.scene.onBeforeRender;
    this.scene.onBeforeRender = (renderer, ...rest) => {
      if (!this._renderer) this._renderer = renderer;
      prev.call(this.scene, renderer, ...rest);
    };
  }
  _buildEnv() {
    this.envDone = true;
    const r = this._renderer;
    const env = new THREE.Scene();
    const room = new THREE.Mesh(new THREE.BoxGeometry(64, 17, 48), new THREE.MeshBasicMaterial({ color: 0x3e4440, side: THREE.BackSide }));
    room.position.y = 8.5;
    env.add(room);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(64, 48), new THREE.MeshBasicMaterial({ color: 0x55544e }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01;
    env.add(floor);
    const lamp = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xeefff2).multiplyScalar(5) });
    for (let x = -24; x <= 24; x += 4) for (let z = -18; z <= 18; z += 3) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.4), lamp);
      p.rotation.x = Math.PI / 2; p.position.set(x, 16.9, z);
      env.add(p);
    }
    const win = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xdde6ee).multiplyScalar(3) });
    for (let i = 0; i < 4; i++) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(4, 10), win);
      p.rotation.y = Math.PI / 2; p.position.set(-31.9, 9.5, -12 + i * 8);
      env.add(p);
    }
    const board = new THREE.Mesh(new THREE.PlaneGeometry(28, 8.75), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff4020).multiplyScalar(1.2) }));
    board.position.set(0, 9.2, -23.7);
    env.add(board);
    const pm = new THREE.PMREMGenerator(r);
    const rt = pm.fromScene(env, 0.04, 0.1, 100, { position: new THREE.Vector3(0, 3, 6) });
    pm.dispose();
    this.scene.environment = rt.texture;
    this.scene.environmentIntensity = 0.5;
  }

  // level 1 = normal; < 1 browns out the fluorescents (call every frame with flicker values).
  setPower(level) { this.power = clamp(Number.isFinite(level) ? level : 1, 0, 1.2); }
  // 0..1: red beacons spin up and the hall takes on a red wash.
  setAlarm(level) { this._alarmSet = true; this.alarmLevel = clamp(Number.isFinite(level) ? level : 0, 0, 1); }

  // t01: session progress (afternoon sun lowers and warms). Boards update a few times a second.
  update(dt, t01, sim, panic) {
    if (this._renderer && !this.envDone) this._buildEnv();
    this._t = (this._t || 0) + dt;
    this.sky.paint(t01);
    this.sun.position.set(-40, 30 - t01 * 16, 6 + t01 * 10);
    this.sun.color.setHSL(0.1 - t01 * 0.04, 0.6 + t01 * 0.3, 0.75 - t01 * 0.1);
    this.sun.intensity = 0.4 + t01 * 0.35;
    // Power: fluorescents and the light they throw; haze darkens with them.
    const pw = this.power;
    this.lampMat.color.copy(this.lampBase).multiplyScalar(pw);
    this.hemi.intensity = this.base.hemi * (0.12 + 0.88 * pw);
    this.key.intensity = this.base.key * pw;
    this.fill.intensity = this.base.fill * (0.2 + 0.8 * pw);
    if (this.scene.environmentIntensity !== undefined && this.envDone) this.scene.environmentIntensity = 0.5 * (0.2 + 0.8 * pw);
    // Alarm (falls back to panic if nobody drives it).
    const al = this._alarmSet ? this.alarmLevel : clamp((panic - 0.6) * 2.5, 0, 1);
    this.beaconU.uTime.value = this._t;
    this.beaconU.uLevel.value = al;
    const strobe = Math.pow(0.5 + 0.5 * Math.cos(this._t * 7.5), 4);
    this.alarm.intensity = al * 40 * (0.3 + 0.7 * strobe);
    this.alarm2.intensity = al * 14 * (0.3 + 0.7 * strobe);
    const fc = this.scene.fog && this.scene.fog.color;
    if (fc) {
      fc.copy(this.fogColor).multiplyScalar(0.25 + 0.75 * pw);
      fc.r += al * 0.06 * strobe;
      if (this.scene.background && this.scene.background.isColor) this.scene.background.copy(fc);
    }
    if (sim) {
      this.clock.set(sim.t, dt);
      this.quotes.update(dt, sim, panic);
      this.dow.update(dt, sim);
    }
    const d = this._sd || (this._sd = new THREE.Vector3());
    d.copy(this.sun.position).negate().normalize();
    const L = 30;
    for (const sh of this.shafts) {
      const p = sh.geometry.attributes.position;
      for (const o of [0, 4]) for (const k of [0, 1]) p.setXYZ(o + 2 + k, p.getX(o + k) + d.x * L, p.getY(o + k) + d.y * L, p.getZ(o + k) + d.z * L);
      p.needsUpdate = true;
    }
    this.shaftMat.uniforms.uColor.value.copy(this.sun.color);
    this.shaftMat.uniforms.uI.value = 0.05 + t01 * 0.06;
  }
}

function groundAt(x, z) {
  const r = Math.hypot(x, z);
  if (r >= TIER_R[1]) return 0;
  for (let k = 1; k < TIER_R.length; k++) if (r >= (TIER_R[k + 1] ?? 0)) return tierTop(k);
  return tierTop(TIER_R.length - 1);
}
function withPhase(g, ph) {
  if (g.index) g = g.toNonIndexed();
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'uv') g.deleteAttribute(k);
  g.setAttribute('aPh', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(ph), 1));
  return g;
}

function worldUVPlane(g, w, h, s) {
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * s, uv.getY(i) * h * s);
}
function colorize(g, hex) {
  if (g.index) g = g.toNonIndexed();
  g.deleteAttribute('uv');
  const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
}
// Flat octagonal ring (tread), facing up, UVs in world metres.
function octRing(rOut, rIn, y) {
  const o = octagon(rOut), i = rIn > 0 ? octagon(rIn) : null;
  const pos = [], uv = [], idx = [];
  for (let k = 0; k < 8; k++) {
    pos.push(o[k][0], y, o[k][1]); uv.push(o[k][0], o[k][1]);
    const ip = i ? i[k] : [0, 0];
    pos.push(ip[0], y, ip[1]); uv.push(ip[0], ip[1]);
  }
  for (let k = 0; k < 8; k++) {
    const a = k * 2, b = ((k + 1) % 8) * 2;
    idx.push(a, a + 1, b, a + 1, b + 1, b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  if (g.attributes.normal.getY(0) < 0) { const ix = g.index.array; for (let k = 0; k < ix.length; k += 3) { const t = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = t; } g.computeVertexNormals(); }
  return g.toNonIndexed();
}
// Vertical octagonal band facing the pit centre (riser).
function octBand(r, yTop, yBot) {
  const c = octagon(r), pos = [], uv = [];
  for (let k = 0; k < 8; k++) {
    const [x0, z0] = c[k], [x1, z1] = c[(k + 1) % 8];
    const len = Math.hypot(x1 - x0, z1 - z0) * 0.5;
    const quad = [[x0, yTop, z0, 0, 1], [x1, yTop, z1, len, 1], [x0, yBot, z0, 0, 0], [x1, yTop, z1, len, 1], [x1, yBot, z1, len, 0], [x0, yBot, z0, 0, 0]];
    for (const q of quad) { pos.push(q[0], q[1], q[2]); uv.push(q[3], q[4] * 0.4); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  // Face inward (toward the centre).
  const n = g.attributes.normal;
  if (n.getX(0) * pos[0] + n.getZ(0) * pos[2] > 0) {
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k += 3) {
      for (const attr of [p, g.attributes.uv]) {
        const sz = attr.itemSize;
        for (let j = 0; j < sz; j++) { const t = attr.array[(k + 1) * sz + j]; attr.array[(k + 1) * sz + j] = attr.array[(k + 2) * sz + j]; attr.array[(k + 2) * sz + j] = t; }
      }
    }
    g.computeVertexNormals();
  }
  return g;
}

// The big LED quote board on the north wall.
export class PriceBoard {
  constructor(parent, brass) {
    this.c = document.createElement('canvas');
    this.c.width = 2048; this.c.height = 640;
    this.g = this.c.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.c);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
    const W = 28, H = 8.75, Y = 9.2, Z = -HALL.d / 2;
    const cab = new Bucket(), trim = new Bucket();
    // Cabinet: deep box, a stepped bezel, brass trim lines, mounting brackets.
    cab.box(W + 1.4, H + 1.4, 0.7, 0, Y, Z + 0.35);
    cab.box(W + 0.5, 0.35, 0.2, 0, Y + H / 2 + 0.2, Z + 0.76); cab.box(W + 0.5, 0.35, 0.2, 0, Y - H / 2 - 0.2, Z + 0.76);
    cab.box(0.35, H + 0.75, 0.2, -W / 2 - 0.2, Y, Z + 0.76); cab.box(0.35, H + 0.75, 0.2, W / 2 + 0.2, Y, Z + 0.76);
    cab.box(W, 0.12, 0.08, 0, Y - H / 2 + 1.0, Z + 0.72); // tape divider
    for (const x of [-W / 3, 0, W / 3]) cab.box(0.5, 1.2, 0.5, x, Y + H / 2 + 1.2, Z + 0.25);
    for (const [w, h, x, y] of [[W + 1.0, 0.06, 0, Y + H / 2 + 0.38], [W + 1.0, 0.06, 0, Y - H / 2 - 0.38], [0.06, H + 0.82, -W / 2 - 0.38, Y], [0.06, H + 0.82, W / 2 + 0.38, Y]]) trim.box(w, h, 0.06, x, y, Z + 0.88);
    const frame = cab.mesh(new THREE.MeshStandardMaterial({ color: 0x17140f, roughness: 0.45, metalness: 0.3 }));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: this.texture, toneMapped: false, fog: false }));
    face.position.set(0, Y, Z + 0.72);
    parent.add(frame, trim.mesh(brass), face);
    this.tape = [];
    this.flash = 0;
    this.lastDraw = -1;
  }

  pushPrint(px, qty, dir) {
    this.tape.unshift({ px, qty, dir });
    if (this.tape.length > 14) this.tape.length = 14;
  }

  draw(sim, dt) {
    this.flash = Math.max(0, this.flash - dt);
    const g = this.g, W = 2048, H = 640;
    g.fillStyle = '#050403'; g.fillRect(0, 0, W, H);
    // LED dot texture
    g.fillStyle = 'rgba(255,255,255,0.025)';
    for (let y = 0; y < H; y += 6) g.fillRect(0, y, W, 2);
    const last = sim.lastPx, chg = last - PREV_SETTLE;
    const up = chg >= 0;
    const col = up ? '#3dff6e' : '#ff3b2f';
    const amber = '#ffb52e';
    g.textBaseline = 'alphabetic';
    g.font = 'bold 44px "Courier New", monospace';
    g.fillStyle = amber;
    g.fillText('S&P 500  DEC 87  FUTURES  ·  CME', 40, 70);
    g.textAlign = 'right';
    g.fillText(`MON OCT 19 1987   ${pitClock(sim.t)} CT`, W - 40, 70);
    g.textAlign = 'left';
    g.font = 'bold 230px "Courier New", monospace';
    g.fillStyle = this.flash > 0 && Math.floor(this.flash * 12) % 2 ? '#ffffff' : col;
    g.fillText(last.toFixed(2), 30, 300);
    g.font = 'bold 96px "Courier New", monospace';
    g.fillStyle = col;
    g.fillText(`${up ? '▲' : '▼'} ${Math.abs(chg).toFixed(2)}  ${(chg / PREV_SETTLE * 100).toFixed(2)}%`, 40, 410);

    const col2 = 1180;
    g.font = 'bold 54px "Courier New", monospace';
    const row = (label, val, y, c = amber) => { g.fillStyle = '#9c7a3c'; g.fillText(label, col2, y); g.fillStyle = c; g.fillText(val, col2 + 300, y); };
    row('OPEN', toPx(sim.open).toFixed(2), 140);
    row('HIGH', toPx(sim.high).toFixed(2), 200);
    row('LOW', toPx(sim.low).toFixed(2), 260);
    row('PREV', PREV_SETTLE.toFixed(2), 320);
    row('VOLUME', sim.volume.toLocaleString('en-US'), 380);
    const basis = sim.basis;
    row('NYSE CASH', sim.cash.toFixed(2), 440, '#e8e8e8');
    row('BASIS', `${basis >= 0 ? '+' : ''}${basis.toFixed(2)}`, 500, basis < -3 ? '#ff3b2f' : '#e8e8e8');
    g.fillStyle = '#9c7a3c'; g.font = 'bold 34px "Courier New", monospace';
    g.fillText(sim.phase.name, 40, 500);

    // Tape
    g.fillStyle = '#0d0b08'; g.fillRect(0, 548, W, 92);
    g.font = 'bold 50px "Courier New", monospace';
    let x = 30;
    for (const p of this.tape) {
      g.fillStyle = p.dir > 0 ? '#3dff6e' : p.dir < 0 ? '#ff3b2f' : amber;
      const s = `${p.px.toFixed(2)}×${p.qty}`;
      g.fillText(s, x, 612);
      x += g.measureText(s).width + 50;
      if (x > W) break;
    }
    this.texture.needsUpdate = true;
  }
}


// ── Quote boards for the rest of the exchange ────────────────────────────────────
// Twelve 1987 contracts on wall-to-wall LED panels. They react to the S&P: index products
// crash with it, bonds and eurodollars rally (flight to quality), gold firms, currencies are
// mixed, meats and crude get liquidated. One canvas atlas, redrawn ~2.5×/s.
const CONTRACTS = [
  { sym: 'T-BONDS', mo: 'DEC', prev: 79.75, tick: 1 / 32, fmt: '32', flight: 0.032, vol: 0.0025 },
  { sym: 'EURODOLLAR', mo: 'DEC', prev: 91.25, tick: 0.01, add: 0.62, vol: 0.0006 },
  { sym: 'D-MARK', mo: 'DEC', prev: 0.5592, tick: 0.0001, dp: 4, flight: 0.007, vol: 0.0015 },
  { sym: 'JAPANESE YEN', mo: 'DEC', prev: 0.7006, tick: 0.0001, dp: 4, flight: 0.013, vol: 0.0015 },
  { sym: 'SWISS FRANC', mo: 'DEC', prev: 0.6719, tick: 0.0001, dp: 4, flight: 0.009, vol: 0.0015 },
  { sym: 'BRITISH POUND', mo: 'DEC', prev: 1.6545, tick: 0.0005, dp: 4, flight: -0.007, vol: 0.0015 },
  { sym: 'GOLD', mo: 'DEC', prev: 464.8, tick: 0.1, dp: 1, flight: 0.028, vol: 0.003 },
  { sym: 'LIVE CATTLE', mo: 'DEC', prev: 64.52, tick: 0.025, dp: 2, flight: -0.022, vol: 0.003 },
  { sym: 'PORK BELLIES', mo: 'FEB', prev: 61.4, tick: 0.025, dp: 2, flight: -0.035, vol: 0.005 },
  { sym: 'CRUDE OIL', mo: 'DEC', prev: 19.95, tick: 0.01, dp: 2, flight: -0.045, vol: 0.004 },
  { sym: 'VALUE LINE', mo: 'DEC', prev: 262.8, tick: 0.05, dp: 2, beta: 0.93, vol: 0.002 },
  { sym: 'MAJOR MKT INDEX', mo: 'NOV', prev: 472.3, tick: 0.05, dp: 2, beta: 1.06, vol: 0.002 },
];
const fmt32 = (v) => { const s = v < 0 ? '-' : ''; v = Math.abs(v); let w = Math.floor(v), n = Math.round((v - w) * 32); if (n === 32) { w++; n = 0; } return `${s}${w}-${String(n).padStart(2, '0')}`; };

export function contractQuotes(sim, panic = 0) {
  const s = sim.lastPx / PREV_SETTLE - 1;
  const k = clamp(-s / 0.29, -0.3, 1.3);
  const t = sim.t;
  return CONTRACTS.map((c, i) => {
    const wig = (Math.sin(t * 0.9 + i * 3.1) * 0.6 + Math.sin(t * 2.3 + i * 1.7) * 0.4 + Math.sin(t * 5.1 + i) * 0.2) * c.vol * (0.4 + panic);
    let px = c.beta ? c.prev * (1 + c.beta * s) : c.add ? c.prev + c.add * k : c.prev * (1 + c.flight * k);
    px += c.prev * wig;
    px = Math.round(px / c.tick) * c.tick;
    const chg = px - c.prev;
    const show = (v, sign) => (c.fmt === '32' ? fmt32(v) : v.toFixed(c.dp ?? 2)).replace(/^(?=\d)/, sign && v >= 0 ? '+' : '');
    return { name: `${c.sym}  ${c.mo}`, px, chg, last: show(px), change: show(chg, true), pct: (chg / c.prev) * 100 };
  });
}

class QuoteBoards {
  constructor(parent) {
    this.c = document.createElement('canvas');
    this.c.width = 2048; this.c.height = 640;
    this.g = this.c.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.c);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
    this.prev = [];
    this.flash = new Float32Array(16);
    const faces = [], cab = new Bucket();
    const Z = -HALL.d / 2;
    const cellUV = (g, cell) => {
      const u0 = (cell % 4) / 4, v0 = 1 - (Math.floor(cell / 4) + 1) / 4, uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) / 4, v0 + uv.getY(i) / 4);
    };
    const panel = (cell, x, y, z, ry, w = 7.2, h = 2.2) => {
      const p = new THREE.PlaneGeometry(w, h); cellUV(p, cell);
      p.rotateY(ry); p.translate(x + Math.sin(ry) * 0.24, y, z + Math.cos(ry) * 0.24);
      faces.push(p);
      cab.box(w + 0.3, h + 0.3, 0.3, x + Math.sin(ry) * 0.04, y, z + Math.cos(ry) * 0.04, ry);
    };
    // North wall, either side of the big board: three rows of two.
    const rows = [8.75, 6.3, 3.85];
    for (const side of [-1, 1]) {
      for (let r = 0; r < 3; r++) for (let col = 0; col < 2; col++) {
        const cell = (side < 0 ? 0 : 6) + r * 2 + col;
        panel(cell, side * (19.4 + col * 7.7) * 1, rows[r], Z, 0);
      }
    }
    // Right top: S&P cash and NYSE tick. (Left top holds the world clocks.)
    panel(12, 19.4, 11.2, Z, 0); panel(13, 27.1, 11.2, Z, 0);
    // East wall (seen when you look round): the rest of the index info and a repeat of the pits.
    const XE = HALL.w / 2;
    [14, 15, 0, 6, 9, 3].forEach((cell, i) => panel(cell, XE, 8.6 - Math.floor(i / 2) * 2.5, -19.5 + (i % 2) * 7.7, -Math.PI / 2));
    [10, 11, 1, 7].forEach((cell, i) => panel(cell, -XE, 2.2 + Math.floor(i / 2) * 0, -20 + i * 7.7, Math.PI / 2, 7.2, 1.6));
    const face = new THREE.Mesh(mergeGeometries(faces), new THREE.MeshBasicMaterial({ map: this.texture, toneMapped: false, fog: false, color: new THREE.Color(0.95, 0.95, 0.95) }));
    parent.add(face, cab.mesh(new THREE.MeshStandardMaterial({ color: 0x141515, roughness: 0.5, metalness: 0.3 })));
    this.acc = 1;
    this.draw(null, 0);
  }

  update(dt, sim, panic) {
    this.acc += dt;
    for (let i = 0; i < 16; i++) this.flash[i] = Math.max(0, this.flash[i] - dt);
    if (this.acc < 0.4) return;
    this.acc = 0;
    this.draw(sim, panic);
  }

  draw(sim, panic) {
    const g = this.g, CW = 512, CH = 160;
    g.fillStyle = '#040404'; g.fillRect(0, 0, 2048, 640);
    const quotes = sim ? contractQuotes(sim, panic) : CONTRACTS.map((c) => ({ name: `${c.sym}  ${c.mo}`, chg: 0, last: c.fmt === '32' ? fmt32(c.prev) : c.prev.toFixed(c.dp ?? 2), change: 'UNCH', px: c.prev }));
    // Index info cells.
    if (sim) {
      const s = sim.lastPx / PREV_SETTLE - 1, k = clamp(-s / 0.29, 0, 1.3), t01 = clamp(sim.t / 405, 0, 1);
      const tick = Math.round(-250 - 900 * k + Math.sin(sim.t * 1.7) * 220 * (0.4 + panic));
      quotes.push(
        { name: 'S&P 500 CASH INDEX', px: sim.cash, chg: sim.cash - PREV_CASH, last: sim.cash.toFixed(2), change: `${sim.cash - PREV_CASH >= 0 ? '+' : ''}${(sim.cash - PREV_CASH).toFixed(2)}` },
        { name: 'NYSE TICK', px: tick, chg: tick, last: `${tick > 0 ? '+' : ''}${tick}`, change: tick < -600 ? 'PROGRAMS' : '' },
        { name: 'S&P 500  MAR 88', px: sim.lastPx + 2.4, chg: sim.lastPx + 2.4 - (PREV_SETTLE + 2.6), last: (sim.lastPx + 2.4).toFixed(2), change: `${(sim.lastPx - PREV_SETTLE - 0.2).toFixed(2)}` },
        { name: 'NYSE VOLUME (SHS)', px: 1, chg: 0, last: `${Math.round(604 * Math.pow(t01, 0.85) * (0.55 + 0.45 * k))}M`, change: 'RECORD' },
      );
    } else quotes.push(...['S&P 500 CASH INDEX', 'NYSE TICK', 'S&P 500  MAR 88', 'NYSE VOLUME (SHS)'].map((name) => ({ name, chg: 0, last: '—', change: '' })));
    quotes.forEach((q, i) => {
      const x = (i % 4) * CW, y = Math.floor(i / 4) * CH;
      if (this.prev[i] !== undefined && q.px !== this.prev[i]) this.flash[i] = 0.35;
      this.prev[i] = q.px;
      const up = q.chg > 0, dn = q.chg < 0;
      const col = up ? '#3dff6e' : dn ? '#ff3b2f' : '#ffb52e';
      g.fillStyle = '#0b0a08'; g.fillRect(x + 6, y + 6, CW - 12, CH - 12);
      g.textBaseline = 'alphabetic';
      g.textAlign = 'left';
      g.font = 'bold 40px "Courier New", monospace';
      g.fillStyle = '#ffb52e';
      g.fillText(q.name, x + 16, y + 44);
      g.font = 'bold 84px "Courier New", monospace';
      g.fillStyle = this.flash[i] > 0 ? '#ffffff' : col;
      g.fillText(q.last, x + 18, y + 128);
      g.textAlign = 'right';
      g.font = 'bold 40px "Courier New", monospace';
      g.fillStyle = col;
      g.fillText(`${up ? '▲' : dn ? '▼' : ''}${q.change.replace(/^[+-]/, '')}`, x + CW - 20, y + 128);
      if (q.pct !== undefined) { g.font = 'bold 30px "Courier New", monospace'; g.fillText(`${q.pct >= 0 ? '+' : ''}${q.pct.toFixed(2)}%`, x + CW - 20, y + 86); }
    });
    g.fillStyle = 'rgba(0,0,0,0.22)';
    for (let y = 0; y < 640; y += 4) g.fillRect(0, y, 2048, 1);
    this.texture.needsUpdate = true;
  }
}

// ── World clocks ─────────────────────────────────────────────────────────────────
// CHICAGO · NEW YORK · LONDON · TOKYO on the north wall, set from pit time.
const ZONES = [['CHICAGO', 0], ['NEW YORK', 60], ['LONDON', 360], ['TOKYO', 900]];
const DAYS = ['MON', 'TUE', 'WED'];
class WorldClocks {
  constructor(parent) {
    this.c = document.createElement('canvas');
    this.c.width = 1536; this.c.height = 256;
    this.g = this.c.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.c);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
    const W = 15.0, H = W / 6;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: this.texture, toneMapped: false, fog: false, color: new THREE.Color(0.92, 0.92, 0.92) }));
    const x = -(19.4 + 3.85), y = 11.25, z = -HALL.d / 2 + 0.22;
    face.position.set(x, y, z);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(W + 0.3, H + 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0x141515, roughness: 0.5 }));
    cab.position.set(x, y, z - 0.17);
    parent.add(cab, face);
    this.last = -1;
    this.draw(0);
  }
  set(tMin) {
    const m = Math.floor(tMin * 4) / 4;
    if (m === this.last) return;
    this.last = m;
    this.draw(tMin);
  }
  draw(tMin) {
    const g = this.g;
    g.fillStyle = '#0a0b0b'; g.fillRect(0, 0, 1536, 256);
    ZONES.forEach(([name, off], i) => {
      const cx = i * 384 + 120, cy = 128, R = 104;
      const total = 8 * 60 + 30 + tMin + off;
      const day = DAYS[Math.floor(total / 1440)] || 'TUE', hm = total % 1440;
      // Face
      g.fillStyle = '#ecebe2'; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
      g.lineWidth = 8; g.strokeStyle = '#5c5f60'; g.stroke();
      g.fillStyle = '#111';
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        g.save(); g.translate(cx, cy); g.rotate(a); g.fillRect(-3, -R + 10, 6, k % 3 ? 14 : 24); g.restore();
      }
      const hand = (a, len, w, col) => { g.save(); g.translate(cx, cy); g.rotate(a); g.fillStyle = col; g.fillRect(-w / 2, -len, w, len + 12); g.restore(); };
      hand(((hm / 60) % 12) / 12 * Math.PI * 2, R * 0.55, 10, '#111');
      hand(((hm % 60) / 60) * Math.PI * 2, R * 0.82, 6, '#111');
      g.fillStyle = '#b01a12'; g.beginPath(); g.arc(cx, cy, 7, 0, Math.PI * 2); g.fill();
      // Label + digital readout
      g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillStyle = '#e8e4d6'; g.font = 'bold 34px Arial, sans-serif';
      g.fillText(name, cx + R + 18, cy - 40);
      g.fillStyle = '#ffb52e'; g.font = 'bold 44px "Courier New", monospace';
      g.fillText(`${String(Math.floor(hm / 60)).padStart(2, '0')}:${String(Math.floor(hm % 60)).padStart(2, '0')}`, cx + R + 16, cy + 10);
      g.fillStyle = day === 'MON' ? '#9a9a90' : '#ff6a3a'; g.font = 'bold 26px Arial, sans-serif';
      g.fillText(day, cx + R + 18, cy + 54);
    });
    this.texture.needsUpdate = true;
  }
}

// ── Dow Jones strip ──────────────────────────────────────────────────────────────
// A scrolling LED news strip under the big board.
class DowStrip {
  constructor(parent) {
    this.c = document.createElement('canvas');
    this.c.width = 4096; this.c.height = 96;
    this.g = this.c.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.c);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.repeat.set(0.5, 1);
    this.texture.anisotropy = 8;
    const W = 28, H = 0.66, Y = 3.55, Z = -HALL.d / 2 + 0.35;
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: this.texture, toneMapped: false, fog: false }));
    strip.position.set(0, Y, Z + 0.21);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, H + 0.3, 0.35), new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.5 }));
    cab.position.set(0, Y, Z);
    parent.add(cab, strip);
    this.acc = 1;
    this.draw(null);
  }
  update(dt, sim) {
    this.texture.offset.x = (this.texture.offset.x + dt * 0.022) % 1;
    this.acc += dt;
    const moved = sim && Math.abs(sim.cash - (this.lastCash ?? 0)) > 0.05;
    if (this.acc >= 1 || (moved && this.acc >= 0.2)) { this.acc = 0; this.lastCash = sim ? sim.cash : 0; this.draw(sim); }
  }
  draw(sim) {
    const g = this.g;
    g.fillStyle = '#050403'; g.fillRect(0, 0, 4096, 96);
    const cash = sim ? sim.cash : PREV_CASH;
    const dow = dowOf(cash), chg = dow - DOW_PREV;
    const spx = cash - PREV_CASH;
    const items = [
      ['DOW JONES INDUSTRIALS', '#ffb52e'], [dow.toFixed(2), '#f0f0e8'], [`${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg).toFixed(2)}  (${(chg / DOW_PREV * 100).toFixed(1)}%)`, chg >= 0 ? '#3dff6e' : '#ff3b2f'],
      ['  ◆  S&P 500', '#ffb52e'], [cash.toFixed(2), '#f0f0e8'], [`${spx >= 0 ? '▲' : '▼'} ${Math.abs(spx).toFixed(2)}`, spx >= 0 ? '#3dff6e' : '#ff3b2f'],
      ['  ◆  DEC S&P FUTURES', '#ffb52e'], [(sim ? sim.lastPx : PREV_SETTLE).toFixed(2), '#f0f0e8'],
      ['  ◆  NYSE: SPECIALISTS REPORT ORDER IMBALANCES  ◆  ', '#ffb52e'],
    ];
    g.font = 'bold 62px "Courier New", monospace'; g.textBaseline = 'middle';
    let x = 20;
    while (x < 4096) {
      for (const [t, c] of items) { g.fillStyle = c; g.fillText(t, x, 50); x += g.measureText(t).width + 24; }
    }
    g.fillStyle = 'rgba(0,0,0,0.4)';
    for (let y = 0; y < 96; y += 4) g.fillRect(0, y, 4096, 1);
    for (let xx = 0; xx < 4096; xx += 4) g.fillRect(xx, 0, 1, 96);
    this.texture.needsUpdate = true;
  }
}
