import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from './rng.js';
import { DIRS, toWorld } from './hex.js';

// Each tile is a hexagonal basalt column rising out of the sea; its top is split
// into six wedges, one per side, each dressed for its terrain.

export const TOP_R = 0.93;
const LIP_R = 0.965;
const COLUMN_BOTTOM = -4.2;
export const SEA_Y = -0.75;

const GROUND = {
  meadow: ['#8fb55a', '#86ad52', '#9cbf63', '#94b85c'],
  forest: ['#557d40', '#4c7439', '#5d8646', '#527a3d'],
  field: ['#d9a948', '#d0a041', '#e1b456', '#d6a54a'],
  village: ['#a8a888', '#9f9f80', '#b0af90', '#a5a385'],
  water: ['#46605a', '#425b55', '#4b665f', '#455e58'],
};
const BASALT = ['#3e3b39', '#46423f', '#373432', '#4c4845', '#41403f'];

// Window light that comes up as the day turns to night (opacity driven by the world's night factor).
export const glowMat = new THREE.MeshBasicMaterial({ color: '#ffc76a', transparent: true, opacity: 0, depthWrite: false });

export const landMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, metalness: 0 });

export const waterUniforms = { uTime: { value: 0 } };
export const waterMat = new THREE.MeshStandardMaterial({ color: '#3e8695', roughness: 0.16, metalness: 0.05 });
waterMat.onBeforeCompile = (sh) => {
  sh.uniforms.uTime = waterUniforms.uTime;
  sh.vertexShader = 'varying vec3 vWp;\n' + sh.vertexShader.replace(
    '#include <begin_vertex>',
    '#include <begin_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;'
  );
  sh.fragmentShader = 'uniform float uTime;\nvarying vec3 vWp;\n' + sh.fragmentShader.replace(
    '#include <color_fragment>',
    `#include <color_fragment>
    float rip = sin(vWp.x * 7.0 + uTime * 1.6) * sin(vWp.z * 6.0 - uTime * 1.3 + vWp.x * 2.0);
    diffuseColor.rgb += vec3(0.10, 0.13, 0.13) * smoothstep(0.55, 1.0, rip);`
  );
};

const tmpC = new THREE.Color();
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const corner = (i, r, y) => V(Math.cos((i * Math.PI) / 3) * r, y, Math.sin((i * Math.PI) / 3) * r);

// Deterministic height jitter so wedges that share a vertex never crack apart.
function jit(x, z) {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return (s - Math.floor(s) - 0.5) * 0.035;
}

class Mesher {
  constructor() { this.pos = []; this.col = []; }
  face(a, b, c, color, out) {
    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    if (n.dot(out) < 0) [b, c] = [c, b];
    for (const p of [a, b, c]) { this.pos.push(p.x, p.y, p.z); this.col.push(color.r, color.g, color.b); }
  }
  quad(a, b, c, d, color, out) { this.face(a, b, c, color, out); this.face(a, c, d, color, out); }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeVertexNormals();
    return g;
  }
}

function prep(g) {
  const n = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal') n.deleteAttribute(k);
  return n;
}

const roof = (() => {
  const m = new Mesher(), w = new THREE.Color(1, 1, 1);
  const r1 = V(-0.5, 1, 0), r2 = V(0.5, 1, 0), e1 = V(-0.5, 0, -0.5), e2 = V(0.5, 0, -0.5), e3 = V(-0.5, 0, 0.5), e4 = V(0.5, 0, 0.5);
  m.quad(r1, r2, e2, e1, w, V(0, 1, -1));
  m.quad(r1, r2, e4, e3, w, V(0, 1, 1));
  m.face(r1, e1, e3, w, V(-1, 0, 0));
  m.face(r2, e2, e4, w, V(1, 0, 0));
  return prep(m.build());
})();

const BASE = {
  cone: prep(new THREE.ConeGeometry(1, 1, 6, 1).translate(0, 0.5, 0)),
  cone4: prep(new THREE.ConeGeometry(1, 1, 4, 1).translate(0, 0.5, 0)),
  cyl: prep(new THREE.CylinderGeometry(1, 1, 1, 7).translate(0, 0.5, 0)),
  box: prep(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0)),
  rock: prep(new THREE.DodecahedronGeometry(1, 0)),
  ball: prep(new THREE.IcosahedronGeometry(1, 0)),
  roof,
};

const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
function mk(px, py, pz, sx, sy, sz, ry = 0, rx = 0, rz = 0) {
  _e.set(rx, ry, rz);
  _q.setFromEuler(_e);
  return new THREE.Matrix4().compose(_p.set(px, py, pz), _q, _s.set(sx, sy, sz));
}

// While a placed tile is built, decorations are laid out on a flat, level hex and then
// carried onto the real ground: each piece (or whole house) moves with its anchor point.
let shiftAt = null;
const _t = new THREE.Matrix4();

class Decor {
  constructor() { this.list = []; }
  add(name, color, matrix, parent) {
    const g = BASE[name].clone();
    const M = parent ? parent.clone().multiply(matrix) : matrix.clone();
    if (shiftAt) {
      const a = (parent || matrix).elements;
      const s = shiftAt(a[12], a[14]);
      M.premultiply(_t.makeTranslation(s.x, s.y, s.z));
    }
    g.applyMatrix4(M);
    const c = tmpC.set(color);
    const arr = new Float32Array(g.attributes.position.count * 3);
    for (let i = 0; i < arr.length; i += 3) { arr[i] = c.r; arr[i + 1] = c.g; arr[i + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    this.list.push(g);
  }
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

// Random point inside wedge i, kept away from the centre and the rim.
function wedgePoint(rng, i, lo = 0.28, hi = 0.82) {
  let a, b;
  do { a = rng(); b = rng(); } while (a + b < lo || a + b > hi);
  const A = corner(i, TOP_R, 0), B = corner(i + 1, TOP_R, 0);
  return { x: A.x * a + B.x * b, z: A.z * a + B.z * b };
}

function tree(d, rng, x, y, z) {
  const s = 0.75 + rng() * 0.55;
  const kind = rng();
  if (kind < 0.45) {
    // spruce: three tiers, darkest at the bottom
    d.add('cyl', '#5a4433', mk(x, y, z, 0.022 * s, 0.07 * s, 0.022 * s));
    d.add('cone', pick(rng, ['#2b553a', '#285037']), mk(x, y + 0.04 * s, z, 0.12 * s, 0.22 * s, 0.12 * s, rng() * 6));
    d.add('cone', pick(rng, ['#336440', '#2f5c3c']), mk(x, y + 0.13 * s, z, 0.095 * s, 0.2 * s, 0.095 * s, rng() * 6));
    d.add('cone', pick(rng, ['#3c7146', '#3a6d45']), mk(x, y + 0.22 * s, z, 0.065 * s, 0.17 * s, 0.065 * s, rng() * 6));
  } else if (kind < 0.8) {
    d.add('cyl', '#5a4433', mk(x, y, z, 0.022 * s, 0.07 * s, 0.022 * s));
    d.add('cone', pick(rng, ['#2f5c3c', '#2b553a', '#356341']), mk(x, y + 0.05 * s, z, 0.115 * s, 0.25 * s, 0.115 * s, rng() * 6));
    d.add('cone', pick(rng, ['#386b43', '#3c7146', '#336440']), mk(x, y + 0.16 * s, z, 0.085 * s, 0.22 * s, 0.085 * s, rng() * 6));
  } else {
    // birch: pale trunk, a lumpy crown that sometimes turns gold
    d.add('cyl', '#d9d3c4', mk(x, y, z, 0.016 * s, 0.13 * s, 0.016 * s));
    d.add('box', '#3a3634', mk(x, y + 0.05 * s, z, 0.018 * s, 0.008, 0.018 * s));
    const crown = pick(rng, ['#6f9a45', '#7da64c', '#c99a3a', '#86ad52']);
    d.add('ball', crown, mk(x, y + 0.16 * s, z, 0.075 * s, 0.085 * s, 0.075 * s, rng() * 6));
    d.add('ball', crown, mk(x + 0.035 * s, y + 0.2 * s, z - 0.02 * s, 0.05 * s, 0.055 * s, 0.05 * s, rng() * 6));
  }
}

function bush(d, rng, x, y, z) {
  const s = 0.6 + rng() * 0.6;
  d.add('ball', pick(rng, ['#3f6b38', '#46743c', '#355f33']), mk(x, y + 0.02 * s, z, 0.05 * s, 0.035 * s, 0.05 * s, rng() * 6));
}

function tuft(d, rng, x, y, z, colors) {
  const c = pick(rng, colors);
  for (let k = 0; k < 3; k++) {
    const a = rng() * 6.28;
    d.add('cone4', c, mk(x + Math.cos(a) * 0.012, y, z + Math.sin(a) * 0.012, 0.008, 0.035 + rng() * 0.025, 0.008, a, Math.cos(a) * 0.35, Math.sin(a) * 0.35));
  }
}

let glow = null; // collects lit windows for the tile being built
let chimneys = null; // where smoke rises from, in tile space

function house(d, rng, x, y, z) {
  const ry = rng() * Math.PI * 2;
  const P = mk(x, y, z, 1, 1, 1, ry);
  const r = rng();
  const wall = r < 0.5 ? '#2c2a29' : r < 0.75 ? '#8b3a2f' : '#e9e5da';
  const turf = wall === '#e9e5da' && rng() < 0.5 ? '#3b3735' : pick(rng, ['#7ea64e', '#86ad54', '#78a04a']);
  const L = 0.17 + rng() * 0.07;
  // a stone footing, then walls, turf roof with a darker ridge, chimney, door, windows
  d.add('box', '#7d7a73', mk(0, -0.004, 0, L + 0.016, 0.018, 0.136), P);
  d.add('box', wall, mk(0, 0, 0, L, 0.11, 0.12), P);
  d.add('roof', turf, mk(0, 0.11, 0, L + 0.03, 0.085, 0.16), P);
  if (turf !== '#3b3735') d.add('box', '#5f8a3e', mk(0, 0.193, 0, L + 0.03, 0.006, 0.012), P);
  d.add('box', '#efece4', mk(L * 0.25, 0.15, 0.02, 0.022, 0.06, 0.022), P);
  d.add('box', '#3a3634', mk(L * 0.25, 0.21, 0.02, 0.026, 0.008, 0.026), P);
  d.add('box', wall === '#e9e5da' ? '#2c2a29' : '#efece4', mk(-L * 0.18, 0.045, 0.061, 0.03, 0.03, 0.004), P);
  d.add('box', '#e9e5da', mk(L * 0.12, 0, 0.061, 0.026, 0.058, 0.004), P);
  d.add('box', '#5a4433', mk(L * 0.12, 0, 0.0625, 0.018, 0.05, 0.004), P);
  glow.add('box', '#ffffff', mk(-L * 0.18, 0.042, 0.064, 0.036, 0.036, 0.006), P);
  glow.add('box', '#ffffff', mk(L * 0.2, 0.042, -0.064, 0.036, 0.036, 0.006), P);
  const c = new THREE.Vector3(L * 0.25, 0.22, 0.02).applyMatrix4(P);
  if (shiftAt) c.add(shiftAt(x, z));
  chimneys.push(c);
}

function church(d, rng, x, y, z) {
  const P = mk(x, y, z, 1, 1, 1, rng() * Math.PI * 2);
  d.add('box', '#7d7a73', mk(0, -0.004, 0, 0.38, 0.018, 0.16), P);
  d.add('box', '#ece8de', mk(0.02, 0, 0, 0.24, 0.13, 0.14), P);
  d.add('roof', '#3a3634', mk(0.02, 0.13, 0, 0.27, 0.09, 0.18), P);
  d.add('box', '#ece8de', mk(-0.13, 0, 0, 0.08, 0.24, 0.08), P);
  d.add('cone4', '#3a3634', mk(-0.13, 0.24, 0, 0.065, 0.11, 0.065, Math.PI / 4), P);
  d.add('box', '#d9b45a', mk(-0.13, 0.35, 0, 0.006, 0.05, 0.006), P);
  for (const wx of [-0.03, 0.05, 0.11]) glow.add('box', '#ffffff', mk(wx, 0.05, 0.073, 0.022, 0.04, 0.004), P);
}

const FLEECE = ['#f1efe6', '#f1efe6', '#f1efe6', '#e2d6bf', '#6b5a4c', '#2f2b29'];
function sheep(d, rng, x, y, z) {
  const P = mk(x, y, z, 1, 1, 1, rng() * Math.PI * 2);
  for (const [lx, lz] of [[-0.025, -0.018], [-0.025, 0.018], [0.025, -0.018], [0.025, 0.018]]) d.add('box', '#2b2826', mk(lx, 0, lz, 0.01, 0.03, 0.01), P);
  d.add('rock', pick(rng, FLEECE), mk(0, 0.05, 0, 0.055, 0.04, 0.04), P);
  d.add('box', '#2b2826', mk(0.058, 0.04, 0, 0.03, 0.032, 0.024), P);
  d.add('box', '#2b2826', mk(0.05, 0.068, 0, 0.008, 0.008, 0.042), P);
}

// A low dry-stone wall from near the centre out toward a corner.
function wall(d, rng, i, y) {
  const C = corner(i, TOP_R, 0);
  for (let t = 0.3; t < 0.86; t += 0.07) {
    d.add('rock', pick(rng, ['#8d8a84', '#7f7c76', '#9a968e']), mk(C.x * t, y + 0.012, C.z * t, 0.032, 0.026, 0.026, rng() * 6, rng(), rng()));
  }
}

function decorate(d, rng, terrain, i, y) {
  const th = ((i * 60 + 30) * Math.PI) / 180;
  const ux = Math.cos(th), uz = Math.sin(th);
  if (terrain === 'forest') {
    const n = 4 + Math.floor(rng() * 4);
    for (let k = 0; k < n; k++) { const p = wedgePoint(rng, i, 0.2, 0.9); tree(d, rng, p.x, y, p.z); }
    for (let k = 0; k < 3; k++) { const p = wedgePoint(rng, i, 0.25, 0.92); bush(d, rng, p.x, y, p.z); }
    if (rng() < 0.25) {
      const p = wedgePoint(rng, i, 0.4, 0.85);
      d.add('cyl', '#efe6d2', mk(p.x, y, p.z, 0.006, 0.018, 0.006));
      d.add('cone', '#b8432f', mk(p.x, y + 0.016, p.z, 0.016, 0.012, 0.016));
    }
  } else if (terrain === 'village') {
    // a cobbled lane out to the shore
    d.add('box', '#c9c1aa', mk(ux * 0.5, y - 0.004, uz * 0.5, 0.62, 0.012, 0.075, -th));
    for (let k = 0; k < 5; k++) d.add('box', '#b5ad97', mk(ux * (0.25 + k * 0.12), y + 0.002, uz * (0.25 + k * 0.12), 0.03, 0.008, 0.06, -th + rng() * 0.3));
    const side = rng() < 0.5 ? 1 : -1, px = -uz * side, pz = ux * side;
    const hx = ux * 0.5 + px * 0.17, hz = uz * 0.5 + pz * 0.17;
    if (rng() < 0.12) church(d, rng, hx, y, hz); else house(d, rng, hx, y, hz);
    if (rng() < 0.45) house(d, rng, ux * 0.7 - px * 0.16, y, uz * 0.7 - pz * 0.16);
    else if (rng() < 0.6) {
      // a kitchen garden with a picket fence
      const gx = ux * 0.62 - px * 0.15, gz = uz * 0.62 - pz * 0.15;
      d.add('box', '#5f8a3e', mk(gx, y - 0.002, gz, 0.16, 0.012, 0.12, -th));
      for (const o of [-0.06, -0.02, 0.02, 0.06]) d.add('box', '#7aa64a', mk(gx + ux * o, y + 0.008, gz + uz * o, 0.012, 0.016, 0.1, -th));
      for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.28; d.add('box', '#efece4', mk(gx + Math.cos(a) * 0.1, y, gz + Math.sin(a) * 0.08, 0.008, 0.035, 0.008)); }
    } else {
      // stacked peat drying by the door
      const sx = ux * 0.68 - px * 0.14, sz = uz * 0.68 - pz * 0.14;
      for (let k = 0; k < 3; k++) d.add('box', pick(rng, ['#4a3a2e', '#54412f']), mk(sx, y + k * 0.022, sz, 0.08 - k * 0.018, 0.022, 0.05, -th));
    }
  } else if (terrain === 'field') {
    // ridges that follow the shore, wheat most often, sometimes turnips or fresh ploughing
    const r = rng();
    const crop = r < 0.6 ? ['#ecc865', '#e4bd58'] : r < 0.82 ? ['#7aa046', '#6c9440'] : ['#9a6c33', '#8a6030'];
    for (let k = 0; k < 5; k++) {
      const dist = 0.3 + k * 0.105, len = 1.155 * dist * 0.78;
      d.add('box', crop[k % 2], mk(ux * dist, y, uz * dist, 0.034, 0.03, len, -th));
    }
    if (rng() < 0.45) {
      const p = wedgePoint(rng, i, 0.5, 0.8);
      const R = mk(p.x, y + 0.04, p.z, 1, 1, 1, rng() * 3);
      d.add('cyl', '#e8cf7a', mk(0, 0, -0.035, 0.04, 0.07, 0.04, 0, Math.PI / 2), R);
      d.add('cyl', '#d4b55e', mk(0, 0, -0.037, 0.03, 0.074, 0.03, 0, Math.PI / 2), R);
    } else if (rng() < 0.12) {
      // a scarecrow
      const p = wedgePoint(rng, i, 0.4, 0.7);
      d.add('box', '#5a4433', mk(p.x, y, p.z, 0.01, 0.16, 0.01));
      d.add('box', '#5a4433', mk(p.x, y + 0.11, p.z, 0.1, 0.01, 0.01, -th));
      d.add('box', '#8b3a2f', mk(p.x, y + 0.08, p.z, 0.04, 0.05, 0.03, -th));
      d.add('cone', '#d9b45a', mk(p.x, y + 0.155, p.z, 0.035, 0.035, 0.035));
    }
  } else if (terrain === 'meadow') {
    const tufts = 3 + Math.floor(rng() * 4);
    for (let k = 0; k < tufts; k++) { const p = wedgePoint(rng, i, 0.15, 0.92); tuft(d, rng, p.x, y, p.z, ['#6f9a45', '#a5c76a', '#7ea64e']); }
    const flowers = Math.floor(rng() * 6);
    for (let k = 0; k < flowers; k++) {
      const p = wedgePoint(rng, i, 0.2, 0.9);
      const c = pick(rng, ['#a978b5', '#9b6fa3', '#e9cf54', '#f3f0e8']);
      for (let f = 0; f < 3; f++) d.add('box', c, mk(p.x + (rng() - 0.5) * 0.05, y, p.z + (rng() - 0.5) * 0.05, 0.016, 0.02, 0.016));
    }
    if (rng() < 0.55) { const p = wedgePoint(rng, i); sheep(d, rng, p.x, y, p.z); }
    if (rng() < 0.18) wall(d, rng, i, y);
    else if (rng() < 0.3) { const p = wedgePoint(rng, i); d.add('rock', '#8d8a84', mk(p.x, y + 0.01, p.z, 0.05, 0.035, 0.045, rng() * 6)); }
  } else if (terrain === 'water') {
    if (rng() < 0.18) {
      const p = wedgePoint(rng, i, 0.4, 0.7);
      const P = mk(p.x, y + 0.03, p.z, 1, 1, 1, rng() * 6);
      d.add('box', '#e9e5da', mk(0, 0, 0, 0.13, 0.025, 0.05), P);
      d.add('box', '#8b3a2f', mk(0, 0.025, 0, 0.11, 0.012, 0.044), P);
    } else if (rng() < 0.45) {
      // lily pads, one in flower
      const p = wedgePoint(rng, i, 0.35, 0.75);
      const n = 2 + Math.floor(rng() * 3);
      for (let k = 0; k < n; k++) {
        const x = p.x + (rng() - 0.5) * 0.14, z = p.z + (rng() - 0.5) * 0.14;
        d.add('cyl', pick(rng, ['#5f8f45', '#6f9a4a']), mk(x, y + 0.03, z, 0.035, 0.006, 0.035));
        if (k === 0) d.add('ball', '#f1d6e4', mk(x, y + 0.04, z, 0.014, 0.012, 0.014));
      }
    } else if (rng() < 0.4) {
      const p = wedgePoint(rng, i, 0.3, 0.8);
      d.add('rock', '#6f6c67', mk(p.x, y + 0.02, p.z, 0.04, 0.03, 0.04, rng() * 6));
    }
    // reeds where the lake meets the rim
    if (rng() < 0.6) {
      const p = wedgePoint(rng, i, 0.78, 0.9);
      for (let k = 0; k < 5; k++) d.add('cone4', pick(rng, ['#8a9a52', '#a1ab5e', '#7a8a48']), mk(p.x + (rng() - 0.5) * 0.08, y, p.z + (rng() - 0.5) * 0.08, 0.008, 0.09 + rng() * 0.06, 0.008, rng() * 6, (rng() - 0.5) * 0.3));
    }
  }
}

// Build a tile's meshes. `short` makes a thin slab for the floating preview.
export function buildTileMesh(tile, { short = false } = {}) {
  const rng = mulberry32(tile.seed || 1);
  const edges = tile.edges;
  const lift = { forest: 0.15, village: 0.08, meadow: 0, field: -0.03, water: -0.06 };
  const top = short ? 0 : rng() * 0.05 + edges.reduce((a, e) => a + lift[e], 0) / 6 + 0.03;
  const m = new Mesher();
  const up = V(0, 1, 0);

  for (let i = 0; i < 6; i++) {
    const pal = GROUND[edges[i]];
    const A = corner(i, TOP_R, top), B = corner(i + 1, TOP_R, top);
    // a 4x4 grid of little facets per wedge, gently rumpled, lighter toward the middle
    const N = 4;
    const pt = (a, b) => {
      const v = V(A.x * a / N + B.x * b / N, top, A.z * a / N + B.z * b / N);
      if (a + b < N) v.y += jit(v.x, v.z) * (edges[i] === 'water' ? 0.3 : 1.2); // the rim stays level to meet the lip
      return v;
    };
    const shade = (p, q, r) => {
      const d = (Math.hypot(p.x, p.z) + Math.hypot(q.x, q.z) + Math.hypot(r.x, r.z)) / 3;
      return tmpC.set(pick(rng, pal)).multiplyScalar(1.06 - d * 0.12).clone();
    };
    for (let a = 0; a < N; a++) {
      for (let b = 0; a + b < N; b++) {
        const p = pt(a, b), q = pt(a + 1, b), r = pt(a, b + 1);
        m.face(p, q, r, shade(p, q, r), up);
        if (a + b + 2 <= N) { const s2 = pt(a + 1, b + 1); m.face(q, s2, r, shade(q, s2, r), up); }
      }
    }

    // bevelled lip, then banded basalt sides
    const out = V(Math.cos(((i * 60 + 30) * Math.PI) / 180), 0, Math.sin(((i * 60 + 30) * Math.PI) / 180));
    const lipY = top - 0.06;
    const lipColor = tmpC.set(pal[0]).multiplyScalar(0.72).clone();
    m.quad(A, B, corner(i + 1, LIP_R, lipY), corner(i, LIP_R, lipY), lipColor, V(out.x, 0.7, out.z));
    const bands = short ? [lipY, -0.22] : [lipY, top - 0.32, -0.55, -1.05, -1.8, -2.8, COLUMN_BOTTOM];
    for (let b = 0; b < bands.length - 1; b++) {
      const col = tmpC.set(BASALT[(b + i * 2 + Math.floor(rng() * 2)) % BASALT.length]).clone();
      if (b === 0) col.lerp(tmpC.set(pal[1]), 0.12);
      // two narrower columns per side, one a shade darker, so the basalt reads as clustered pillars
      const M0 = corner(i, LIP_R, bands[b]).lerp(corner(i + 1, LIP_R, bands[b]), 0.5), M1 = corner(i, LIP_R, bands[b + 1]).lerp(corner(i + 1, LIP_R, bands[b + 1]), 0.5);
      m.quad(corner(i, LIP_R, bands[b]), M0, M1, corner(i, LIP_R, bands[b + 1]), col, out);
      m.quad(M0, corner(i + 1, LIP_R, bands[b]), corner(i + 1, LIP_R, bands[b + 1]), M1, col.clone().multiplyScalar(0.88), out);
    }
    if (short) {
      const by = bands[bands.length - 1];
      m.face(V(0, by, 0), corner(i, LIP_R, by), corner(i + 1, LIP_R, by), tmpC.set(BASALT[2]).clone(), V(0, -1, 0));
    }
  }

  const d = new Decor();
  glow = new Decor();
  chimneys = [];
  for (let i = 0; i < 6; i++) decorate(d, rng, edges[i], i, top);

  const land = new THREE.Mesh(mergeGeometries([m.build(), ...d.list]), landMat);
  land.castShadow = true;
  land.receiveShadow = true;
  for (const g of d.list) g.dispose();

  const group = new THREE.Group();
  group.add(land);
  if (glow.list.length) {
    const lit = new THREE.Mesh(mergeGeometries(glow.list), glowMat);
    for (const g of glow.list) g.dispose();
    lit.renderOrder = 1;
    group.add(lit);
  }
  glow = null;
  group.userData.chimneys = chimneys;
  chimneys = null;

  const wpos = [];
  for (let i = 0; i < 6; i++) {
    if (edges[i] !== 'water') continue;
    const y = top + 0.03;
    const A = corner(i, TOP_R * 0.985, y), B = corner(i + 1, TOP_R * 0.985, y);
    wpos.push(0, y, 0, B.x, y, B.z, A.x, y, A.z);
  }
  if (wpos.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(wpos, 3));
    g.computeVertexNormals();
    const water = new THREE.Mesh(g, waterMat);
    water.receiveShadow = true;
    group.add(water);
  }
  group.userData.top = top;
  return group;
}

export function disposeTile(group) {
  group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
}

// ---------------------------------------------------------------- placed land

// A placed tile is not a separate column: it is built knowing which of its sides have
// neighbours, so the island reads as one landmass. Shared sides run to the full hex edge
// with ground heights taken from one smooth field over the whole sea, so neighbours meet
// without a seam. Hex corners are moved by the land around them: a lone point is worn back,
// a notch between two tiles fills in. Only open sides get cliffs, along a wavering coast.

const SHORE = ['#a7a877', '#9da16f', '#b0ad7f', '#a29e72'];
const LAKE_DEEP = new THREE.Color('#2d6878'), LAKE_SHALLOW = new THREE.Color('#79b9b1');
// lakes on placed land: shaded from pale shallows at the shore to deep water in the middle
const lakeMat = new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.12, metalness: 0.05 });
lakeMat.onBeforeCompile = waterMat.onBeforeCompile;
const DROP = 0.13; // how far the ground dips toward the cliff edge
const LIFT = { forest: 0.12, village: 0.04, meadow: 0.02, field: -0.01, water: -0.12 };
const N = 5; // facets along each side

function hField(x, z) {
  return 0.07 + Math.sin(x * 0.83 + z * 0.37) * Math.cos(z * 0.71 - x * 0.29) * 0.045 + Math.sin(x * 2.3 + 1.7) * Math.sin(z * 2.1 + 0.4) * 0.015;
}
function wobble(x, z) { return Math.sin(x * 3.1 + z * 1.7) * 0.5 + Math.sin(x * 1.3 - z * 2.9 + 1.1) * 0.5; }

export const foamMat = new THREE.MeshBasicMaterial({ color: '#f4f7f6', transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide });
foamMat.onBeforeCompile = (sh) => {
  sh.uniforms.uTime = waterUniforms.uTime;
  sh.vertexShader = 'varying float vR;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvR = uv.y;');
  sh.fragmentShader = 'uniform float uTime;\nvarying float vR;\n' + sh.fragmentShader.replace(
    '#include <color_fragment>',
    `#include <color_fragment>
    float band = 1.0 - smoothstep(0.0, 1.0, vR);
    float pulse = 0.6 + 0.4 * sin(uTime * 1.4 - vR * 5.0);
    diffuseColor.a *= band * pulse;`
  );
};
// Shallows: a pale turquoise apron off the coast. Max blending keeps the overlaps of
// neighbouring tiles from stacking up; main.js dims it as night falls.
export const shallowMat = new THREE.MeshBasicMaterial({ color: '#4f9c9a', transparent: true, depthWrite: false, fog: false, blending: THREE.CustomBlending, blendEquation: THREE.MaxEquation });
shallowMat.onBeforeCompile = (sh) => {
  sh.vertexShader = 'varying float vR;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvR = uv.y;');
  sh.fragmentShader = 'varying float vR;\n' + sh.fragmentShader.replace(
    '#include <color_fragment>',
    `#include <color_fragment>
    diffuseColor.rgb *= pow(1.0 - vR, 2.2);`
  );
};

// A ribbon on the water from a run of coast points, each pushed out along its own direction.
function ribbon(pts, width, y) {
  const pos = [], uv = [];
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k], b = pts[k + 1];
    const ai = [a.x, y, a.z], bi = [b.x, y, b.z], ao = [a.x + a.dx * width, y, a.z + a.dz * width], bo = [b.x + b.dx * width, y, b.z + b.dz * width];
    pos.push(...ai, ...bi, ...bo, ...ai, ...bo, ...ao);
    uv.push(0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return g;
}

// cell: placed cell (edges already turned); wx, wz: its centre; land[i]: is there a neighbour on side i.
export function buildLand(cell, wx, wz, land) {
  const edges = cell.edges;
  const rng = mulberry32(cell.tile.seed || 1);
  const open = land.map((l) => !l);

  // corner i is shared with the neighbours on sides i-1 and i
  const C = [];
  for (let i = 0; i < 6; i++) {
    const base = corner(i, 1, 0);
    const prev = (i + 5) % 6;
    const n = 1 + (land[prev] ? 1 : 0) + (land[i] ? 1 : 0);
    const g = wobble(wx + base.x, wz + base.z) * 0.5 + 0.5;
    const d = V(0, 0, 0);
    if (n === 1) d.copy(base).multiplyScalar(-(0.2 + 0.16 * g));
    else if (n === 2) {
      const e = toWorld(...DIRS[land[i] ? prev : i]);
      d.set(e.x - base.x, 0, e.z - base.z).normalize().multiplyScalar(0.28 + 0.16 * g);
    }
    C.push({ p: base.add(d), drop: n < 3 ? DROP : 0 });
  }

  // a point on wedge i, by its weights toward corners i (a) and i+1 (b)
  const surf = (i, a, b) => {
    const f = a + b, t = f > 0 ? b / f : 0;
    const A = C[i], B = C[(i + 1) % 6];
    let rx = A.p.x + (B.p.x - A.p.x) * t, rz = A.p.z + (B.p.z - A.p.z) * t;
    let drop = A.drop + (B.drop - A.drop) * t;
    if (open[i]) {
      const th = ((i * 60 + 30) * Math.PI) / 180;
      const k = Math.sin(Math.PI * t) * wobble((wx + rx) * 1.7, (wz + rz) * 1.7) * 0.12;
      rx += Math.cos(th) * k; rz += Math.sin(th) * k;
      drop = DROP;
    }
    const x = rx * f, z = rz * f;
    const w = 27 * a * b * Math.max(0, 1 - f); // 0 along every wedge border, so neighbours always agree
    return { x, z, w, y: hField(wx + x, wz + z) + LIFT[edges[i]] * w - drop * f * f };
  };
  shiftAt = (x, z) => {
    const i = ((Math.floor(Math.atan2(z, x) / (Math.PI / 3)) % 6) + 6) % 6;
    const A = corner(i, 1, 0), B = corner(i + 1, 1, 0);
    const det = A.x * B.z - A.z * B.x;
    let a = (x * B.z - z * B.x) / det, b = (A.x * z - A.z * x) / det;
    a = Math.max(0, a); b = Math.max(0, b);
    if (a + b > 0.97) { const k = 0.97 / (a + b); a *= k; b *= k; }
    const s = surf(i, a, b);
    return V(s.x - x, s.y - 0.006, s.z - z);
  };

  const m = new Mesher();
  const up = V(0, 1, 0);
  const water = [], waterCol = [];
  for (let i = 0; i < 6; i++) {
    const isLake = edges[i] === 'water';
    const pal = isLake ? SHORE : GROUND[edges[i]];
    const P = [];
    for (let a = 0; a <= N; a++) { P[a] = []; for (let b = 0; a + b <= N; b++) { const s = surf(i, a / N, b / N); s.ia = a; s.ib = b; P[a][b] = s; } }
    // Where a lake wedge meets land inside the tile, its water draws back from the straight
    // border toward the middle of the wedge, leaving a wavering beach of sand and pebbles.
    const landL = edges[(i + 5) % 6] !== 'water', landR = edges[(i + 1) % 6] !== 'water';
    const K = surf(i, 0.45, 0.45);
    const lake = (s) => {
      const near = Math.max(landL ? 1 - s.ib / N / 0.42 : 0, landR ? 1 - s.ia / N / 0.42 : 0);
      const t = near > 0 ? Math.min(0.6, near * (0.38 + 0.14 * (wobble((wx + s.x) * 2, (wz + s.z) * 2) + 1) * 0.5)) : 0;
      return { x: s.x + (K.x - s.x) * t, z: s.z + (K.z - s.z) * t, y: s.y + 0.012 + 0.05 * s.w, t };
    };
    const v = (s, lift = 0) => V(s.x, s.y + lift, s.z);
    const shade = (p, q, r) => {
      const d = (Math.hypot(p.x, p.z) + Math.hypot(q.x, q.z) + Math.hypot(r.x, r.z)) / 3;
      return tmpC.set(pick(rng, pal)).multiplyScalar(1.06 - d * 0.12).clone();
    };
    const tri = (p, q, r) => {
      m.face(v(p), v(q), v(r), shade(p, q, r), up);
      if (isLake) {
        for (const s of [p, r, q]) {
          const o = lake(s);
          water.push(o.x, o.y, o.z);
          const c = tmpC.copy(LAKE_DEEP).lerp(LAKE_SHALLOW, Math.min(1, o.t * 1.6 + (1 - Math.min(1, s.w * 2.5)) * 0.25));
          waterCol.push(c.r, c.g, c.b);
        }
      }
    };
    for (let a = 0; a < N; a++) {
      for (let b = 0; a + b < N; b++) {
        tri(P[a][b], P[a + 1][b], P[a][b + 1]);
        if (a + b + 2 <= N) tri(P[a + 1][b], P[a + 1][b + 1], P[a][b + 1]);
      }
    }
    if (!open[i]) continue;
    // cliffs: one narrow basalt column per facet, in bands down into the sea
    const th = ((i * 60 + 30) * Math.PI) / 180;
    const out = V(Math.cos(th), 0, Math.sin(th));
    const rim = [];
    for (let k = 0; k <= N; k++) rim.push(P[N - k][k]);
    const ys = [null, -0.32, -0.62, -1.1, -1.8, COLUMN_BOTTOM];
    for (let k = 0; k < N; k++) {
      const p = rim[k], q = rim[k + 1];
      for (let b = 0; b < ys.length - 1; b++) {
        const col = tmpC.set(BASALT[(k * 3 + b + i) % BASALT.length]).clone();
        if (b === 0) col.lerp(tmpC.set(pal[1]), 0.18);
        if (k % 2) col.multiplyScalar(0.88);
        const y0 = b === 0 ? [p.y, q.y] : [ys[b], ys[b]];
        m.quad(V(p.x, y0[0], p.z), V(q.x, y0[1], q.z), V(q.x, ys[b + 1], q.z), V(p.x, ys[b + 1], p.z), col, out);
      }
    }
  }

  const d = new Decor();
  glow = new Decor();
  chimneys = [];
  for (let i = 0; i < 6; i++) decorate(d, rng, edges[i], i, 0);
  shiftAt = null;

  const group = new THREE.Group();
  const landMesh = new THREE.Mesh(mergeGeometries([m.build(), ...d.list]), landMat);
  landMesh.castShadow = true;
  landMesh.receiveShadow = true;
  for (const g of d.list) g.dispose();
  group.add(landMesh);
  if (glow.list.length) {
    const lit = new THREE.Mesh(mergeGeometries(glow.list), glowMat);
    for (const g of glow.list) g.dispose();
    lit.renderOrder = 1;
    group.add(lit);
  }
  glow = null;
  group.userData.chimneys = chimneys;
  chimneys = null;
  if (water.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(water, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(waterCol, 3));
    g.computeVertexNormals();
    const w = new THREE.Mesh(g, lakeMat);
    w.receiveShadow = true;
    group.add(w);
  }

  // foam and shallows follow the coast, turning the corner where two open sides meet
  const foam = [];
  const coast = [];
  for (let i = 0; i < 6; i++) {
    if (!open[i]) continue;
    const th = ((i * 60 + 30) * Math.PI) / 180;
    const pts = [];
    for (let k = 0; k <= N; k++) { const s = surf(i, 1 - k / N, k / N); pts.push({ x: s.x, z: s.z, dx: Math.cos(th), dz: Math.sin(th) }); }
    if (open[(i + 1) % 6]) {
      const end = pts[N];
      for (let s = 1; s <= 3; s++) { const a = th + (s / 3) * (Math.PI / 3); pts.push({ x: end.x, z: end.z, dx: Math.cos(a), dz: Math.sin(a) }); }
    }
    const f = new THREE.Mesh(ribbon(pts, 0.24, SEA_Y + 0.2), foamMat);
    f.renderOrder = 2;
    const sh = new THREE.Mesh(ribbon(pts, 1.1, SEA_Y + 0.17), shallowMat);
    sh.renderOrder = 1;
    group.add(f, sh);
    foam.push(f, sh);
    const mid = surf(i, 0.5, 0.5);
    coast[i] = { x: mid.x * 0.9, y: mid.y, z: mid.z * 0.9 };
  }
  group.userData.foam = foam;
  group.userData.coast = coast;
  group.userData.top = hField(wx, wz);
  return group;
}
