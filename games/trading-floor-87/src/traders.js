// Procedural pit traders. Each person is ONE skinned mesh (vertex colours + a per-vertex
// material channel) driven by a small skeleton, plus a badge plane: 2–3 draw calls a person.
//
//  detail 'hero'  — close-up shouters: dense meshes, five two-bone fingers per hand, eyelids
//                   that blink, teeth, nostrils, buttons, pencils.
//  detail 'crowd' — same silhouette and style at roughly a fifth of the triangles; fingers are
//                   baked into a relaxed curl.
//
// The geometry is sculpted from lofted superellipse rings (torso, jacket, limbs, shoes) and a
// deformed head shape that every face feature, hair shell and decal is projected onto.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FIRMS } from './market/agents.js';
import { TIER_R, tierTop, PLAYER_ANGLE, octagon, BOOTHS, RUNNER_PATHS } from './pit.js';
import { badgeAtlas, badgeUV, fabricTexture, fabricNormal } from './textures.js';
import { clamp, damp, lerp, Rng } from './util.js';

const TAU = Math.PI * 2;
const V3 = THREE.Vector3;
const SKIN = [0xf0bca4, 0xe1a68c, 0xcd8d72, 0xb07056, 0x87533c, 0x623f2d, 0xf4c8b4, 0xc6866c];
const HAIR = [0x2a1c13, 0x3d2817, 0x14110f, 0x6b4a2b, 0x8c8c88, 0x5b3920, 0xb89a6a, 0x7a4a2a, 0xb0aca4];
const TROUSER = [0x2b2b31, 0x3b3429, 0x1f2535, 0x464646, 0x2e2a26, 0x4a4238];
const TIE = [0x8b1a1a, 0x1a3a8b, 0xc8a040, 0x2a5a2a, 0x5a1a5a, 0x1d1d2a, 0xa0522d, 0x6a7a9a];
const SHIRT = [0xf3f1ea, 0xf3f1ea, 0xeef2f7, 0xdfe8f3, 0xf5efdc, 0xe9e4f0];
const SHOE = [0x16110d, 0x2b1a10, 0x3a1612, 0x121212];
const EYES = [0x4a2e1a, 0x3a2414, 0x5a7aa0, 0x5e6e48, 0x6a5232, 0x2a1a10, 0x7890a0];
const STYLES = ['side', 'side', 'slick', 'bald', 'curly', 'mullet', 'crop', 'feather', 'feather'];

const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const sp = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), 2 / p);
const gauss = (d, s) => Math.exp(-(d * d) / (s * s));

// ── Bones ────────────────────────────────────────────────────────────────────────
const BODY = 0, HIPS = 1, SPINE = 2, CHEST = 3, HEAD = 4, JAW = 5, EYE_L = 6, EYE_R = 7, LIDS = 8;
const SHOULDER = [9, 12], ELBOW = [10, 13], WRIST = [11, 14];
const FINGER = (side, f, seg) => 15 + side * 10 + f * 2 + seg; // side 0 = left (−x), 1 = right
const NECK = new V3(0, 1.5, 0);

// ── Geometry kit ─────────────────────────────────────────────────────────────────
// Everything a person is made of goes through Kit.add: it tags vertices with colour, material
// channel (roughness, hand-glow mask, face mask, fabric mask) and skin weights, then merges.
class Kit {
  constructor() { this.parts = []; this.c = new THREE.Color(); }
  add(geo, o) {
    if (!geo.index) {
      const n = geo.attributes.position.count, ix = new Uint32Array(n);
      for (let i = 0; i < n; i++) ix[i] = i;
      geo.setIndex(new THREE.BufferAttribute(ix, 1));
    }
    if (o.m) geo.applyMatrix4(o.m);
    if (!geo.attributes.normal) geo.computeVertexNormals();
    const pos = geo.attributes.position, nor = geo.attributes.normal, n = pos.count;
    const col = new Float32Array(n * 3), mat = new Float32Array(n * 4), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
    const base = new THREE.Color(o.color), c = this.c, p = new V3(), q = new V3(), nn = new V3();
    const off = o.offset;
    for (let i = 0; i < n; i++) {
      p.fromBufferAttribute(pos, i); nn.fromBufferAttribute(nor, i);
      c.copy(base);
      if (o.shade) o.shade(p, nn, c);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      mat[i * 4] = o.rough ?? 0.8; mat[i * 4 + 1] = o.hand ? 1 : 0; mat[i * 4 + 2] = o.face ? 1 : 0; mat[i * 4 + 3] = o.fabric ?? 0;
      let w = o.bone !== undefined ? [[o.bone, 1]] : o.w(p, q);
      if (w.length > 4) w = w.sort((a, b) => b[1] - a[1]).slice(0, 4);
      let tot = 0;
      for (const e of w) tot += e[1];
      for (let k = 0; k < 4; k++) {
        si[i * 4 + k] = w[k] ? w[k][0] : 0;
        sw[i * 4 + k] = w[k] ? w[k][1] / (tot || 1) : 0;
      }
    }
    if (off) geo.translate(off.x, off.y, off.z);
    const g = new THREE.BufferGeometry();
    g.setIndex(geo.index);
    g.setAttribute('position', geo.attributes.position);
    g.setAttribute('normal', geo.attributes.normal);
    g.setAttribute('uv', geo.attributes.uv || new THREE.BufferAttribute(new Float32Array(n * 2), 2));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aMat', new THREE.BufferAttribute(mat, 4));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
    g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
    this.parts.push(g);
  }
  build() { return mergeGeometries(this.parts); }
}

// Lofted tube along +y through superellipse rings {y, x, z, w, d, db, p, t0, t1}.
// θ = 0 is the front (+z), increasing toward +x.
function loft(rings, seg, o = {}) {
  const cols = seg + 1, pos = [], uv = [], idx = [];
  const uvs = o.uvScale ?? 25;
  const closed = o.closed ?? !rings.some((r) => r.t0 !== undefined);
  for (const r of rings) {
    const t0 = r.t0 ?? 0, t1 = r.t1 ?? TAU, p = r.p || o.p || 2;
    let arc = 0, px = 0, pz = 0;
    for (let i = 0; i < cols; i++) {
      const th = t0 + ((t1 - t0) * i) / seg;
      const s = Math.sin(th), c = Math.cos(th);
      const x = (r.x || 0) + r.w * sp(s, p);
      const z = (r.z || 0) + (c >= 0 ? r.d : r.db ?? r.d) * sp(c, p);
      if (i) arc += Math.hypot(x - px, z - pz);
      px = x; pz = z;
      pos.push(x, r.y, z); uv.push(arc * uvs, r.y * uvs);
    }
  }
  const flip = rings[rings.length - 1].y < rings[0].y;
  for (let j = 0; j < rings.length - 1; j++) for (let i = 0; i < seg; i++) {
    const a = j * cols + i, b = a + 1, c = a + cols, d = c + 1;
    if (flip) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  if (closed) {
    const nr = g.attributes.normal, v = new V3(), w = new V3();
    for (let j = 0; j < rings.length; j++) {
      const a = j * cols, b = a + seg;
      v.fromBufferAttribute(nr, a).add(w.fromBufferAttribute(nr, b)).normalize();
      nr.setXYZ(a, v.x, v.y, v.z); nr.setXYZ(b, v.x, v.y, v.z);
    }
  }
  return g;
}

// A smooth sphere (seams welded) whose unit-vector vertices are remapped by fn(u, out).
function sphere(ws, hs, fn, o = {}) {
  let g = new THREE.SphereGeometry(1, ws, hs, o.phi0 ?? 0, o.phiLen ?? TAU, o.th0 ?? 0, o.thLen ?? Math.PI);
  g.deleteAttribute('uv'); g.deleteAttribute('normal');
  g = mergeVertices(g, 1e-5);
  const p = g.attributes.position, u = new V3(), out = new V3();
  for (let i = 0; i < p.count; i++) {
    u.fromBufferAttribute(p, i);
    if (fn) fn(u, out); else out.copy(u);
    p.setXYZ(i, out.x, out.y, out.z);
  }
  g.computeVertexNormals();
  return g;
}
const ellipsoid = (rx, ry, rz, ws = 10, hs = 8) => sphere(ws, hs, (u, o) => o.set(u.x * rx, u.y * ry, u.z * rz));

function flipped(g) {
  const ix = g.index.array;
  for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
  const n = g.attributes.normal;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
  return g;
}
// Two copies with opposite winding, for thin cloth edges seen from either side.
function twoSided(g) {
  const b = g.clone();
  const ix = b.index.array;
  for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
  const n = b.attributes.normal;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
  return mergeGeometries([g, b]);
}

// Grid surface from a point function f(i/nx, j/ny) → V3 (writes into out).
function grid(nx, ny, f, uvScale = 25) {
  const pos = [], uv = [], idx = [], v = new V3();
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    f(i / nx, j / ny, v);
    pos.push(v.x, v.y, v.z); uv.push(v.x * uvScale, v.y * uvScale);
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
// Make a grid face along `dir` (flip winding if its first normal points the other way).
function facing(g, dir) {
  const n = g.attributes.normal, v = new V3();
  let s = 0;
  for (let i = 0; i < n.count; i++) s += v.fromBufferAttribute(n, i).dot(dir);
  if (s < 0) {
    const ix = g.index.array;
    for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
    for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
  }
  return g;
}

function capsule(r, len, from, to, cap = 3, rad = 8) {
  const g = new THREE.CapsuleGeometry(r, Math.max(0.001, len), cap, rad);
  g.deleteAttribute('uv');
  const dir = new V3().subVectors(to, from).normalize();
  const m = new THREE.Matrix4().compose(new V3().addVectors(from, to).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), dir), new V3(1, 1, 1));
  g.applyMatrix4(m);
  return g;
}

// ── Body profiles ────────────────────────────────────────────────────────────────
// A stack of superellipse rings that can be sampled anywhere (for decals, ties, lapels…).
class Prof {
  constructor(rings, p) { this.r = rings; this.p = p; }
  at(y) {
    const r = this.r;
    if (y <= r[0].y) return r[0];
    for (let i = 1; i < r.length; i++) if (y <= r[i].y) {
      const a = r[i - 1], b = r[i], t = (y - a.y) / (b.y - a.y);
      return { y, w: lerp(a.w, b.w, t), d: lerp(a.d, b.d, t), db: lerp(a.db, b.db, t), z: lerp(a.z || 0, b.z || 0, t) };
    }
    return r[r.length - 1];
  }
  pt(y, th, off, out) {
    const r = this.at(y), p = this.p, s = Math.sin(th), c = Math.cos(th);
    return out.set((r.w + off) * sp(s, p), y, (r.z || 0) + (c >= 0 ? r.d + off : r.db + off) * sp(c, p));
  }
  // θ on the front that lands on x.
  th(y, x) {
    const r = this.at(y), s = Math.sign(x) * Math.pow(clamp(Math.abs(x) / r.w, 0, 0.999), this.p / 2);
    return Math.asin(s);
  }
  zAt(y, x, off) { return this.pt(y, this.th(y, x), off, new V3()).z; }
}

// ── Head shape ───────────────────────────────────────────────────────────────────
// Head-local space: origin at the neck joint, +z forward. S(u) maps a unit direction to the
// skin surface; every face part is placed with it so features sit flush on the skull.
class HeadShape {
  constructor(rng) {
    this.C = new V3(0, 0.105, 0.012);
    const k = rng.float(0.97, 1.04);
    this.R = new V3(0.083 * rng.float(0.96, 1.05) * k, 0.112 * k, 0.1 * k);
    this.jaw = rng.float(0.15, 0.32);   // jaw taper
    this.chin = rng.float(0.4, 1.2);
    this.cheek = rng.float(0.5, 1.3);
    this.brow = rng.float(0.6, 1.4);
  }
  S(u, out) {
    const { C, R } = this;
    const x = u.x, y = u.y, z = u.z;
    const low = smooth(0.15, -0.9, y);
    const front = Math.max(0, z);
    let X = R.x * x * (1 - this.jaw * low - 0.22 * low * front * front);
    X *= 1 - 0.05 * smooth(0.2, 0.8, y) * front; // flatter temples
    let Y = R.y * y * (y > 0 ? 0.97 : 1);
    let Z;
    if (z < 0) Z = R.z * z * (1 + 0.06 * smooth(-0.2, 0.6, y) - 0.32 * smooth(-0.15, -0.95, y));
    else Z = R.z * z * (0.93 - 0.08 * low);
    let bump = 0;
    bump += 0.006 * this.brow * gauss(y - 0.27, 0.11) * smooth(0.55, 0.95, z) * (1 - 0.4 * Math.abs(x));
    bump += 0.012 * this.chin * gauss(y + 0.86, 0.16) * smooth(0.45, 0.95, z);
    bump += 0.0045 * this.cheek * (gauss(Math.hypot(Math.abs(x) - 0.56, y + 0.08), 0.2)) * smooth(0.2, 0.7, z);
    bump -= 0.006 * gauss(Math.hypot(Math.abs(x) - 0.36, y - 0.09), 0.13) * smooth(0.6, 0.9, z);
    bump += 0.004 * gauss(y + 0.48, 0.12) * gauss(x, 0.3) * smooth(0.7, 0.95, z); // muzzle
    out.set(C.x + X + x * bump, C.y + Y + y * bump, C.z + Z + z * bump);
    return out;
  }
  dir(x, y) { return new V3(x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y))); }
  normal(u, out) {
    const e = 0.01, a = this.S(u, new V3());
    const t1 = new V3(u.x + e, u.y, u.z).normalize(), t2 = new V3(u.x, u.y + e, u.z).normalize();
    const b = this.S(t1, new V3()).sub(a), c = this.S(t2, new V3()).sub(a);
    out.crossVectors(b, c).normalize();
    if (out.dot(a.sub(this.C)) < 0) out.negate();
    return out;
  }
  // Front-face surface point with the given head-local x, y.
  front(x, y, outP, outN) {
    const { C, R } = this;
    const u = this.dir(clamp((x - C.x) / R.x, -0.95, 0.95), clamp((y - C.y) / R.y, -0.95, 0.95));
    const p = new V3();
    for (let i = 0; i < 8; i++) {
      this.S(u, p);
      u.x = clamp(u.x + (x - p.x) / R.x, -0.97, 0.97); u.y = clamp(u.y + (y - p.y) / R.y, -0.97, 0.97);
      u.z = Math.sqrt(Math.max(0.02, 1 - u.x * u.x - u.y * u.y));
      u.normalize();
    }
    this.S(u, outP);
    if (outN) this.normal(u, outN);
    return u;
  }
  // Grid laid on the face: f(s, t) → [x, y, offset].
  decal(nx, ny, f) {
    const P = new V3(), N = new V3();
    return grid(nx, ny, (s, t, out) => {
      const [x, y, off] = f(s, t);
      this.front(x, y, P, N);
      out.copy(P).addScaledVector(N, off);
    });
  }
}

// Hairline height (unit-sphere y) as a function of |azimuth| from the front.
const HAIRLINE = [[0, 0.7], [0.5, 0.63], [0.9, 0.48], [1.1, 0.2], [1.19, -0.28], [1.31, -0.28], [1.4, 0.18], [1.85, 0.12], [2.2, -0.32], [2.6, -0.52], [Math.PI, -0.56]];
function hairline(a, recede, burns) {
  let y = HAIRLINE[HAIRLINE.length - 1][1];
  for (let i = 1; i < HAIRLINE.length; i++) if (a <= HAIRLINE[i][0]) {
    const [a0, y0] = HAIRLINE[i - 1], [a1, y1] = HAIRLINE[i];
    y = y0 + ((y1 - y0) * (a - a0)) / (a1 - a0);
    break;
  }
  y += recede * gauss(a - 0.7, 0.3) * 0.3 + recede * 0.08 * gauss(a, 0.6);
  if (a > 1.1 && a < 1.4) y = lerp(y, 0.12, 1 - burns);
  return y;
}

// ── Person builder ───────────────────────────────────────────────────────────────
function buildPerson(rng, o) {
  const hero = o.detail === 'hero', lite = o.detail === 'lite';
  const kit = new Kit();
  const L = hero
    ? { seg: 30, ring: 1, head: [48, 34], hair: [52, 36], eye: [14, 20], limb: 16, finger: [2, 7], decal: 2, jacket: 40 }
    : lite
      ? { seg: 6, ring: 0, head: [10, 7], hair: [10, 8], eye: [4, 3], limb: 4, finger: [1, 3], decal: 1, jacket: 8 }
      : { seg: 12, ring: 0, head: [18, 13], hair: [20, 14], eye: [8, 8], limb: 8, finger: [1, 5], decal: 1, jacket: 14 };
  const skin = new THREE.Color(rng.pick(SKIN)).offsetHSL(rng.float(-0.01, 0.01), rng.float(-0.04, 0.04), rng.float(-0.03, 0.03));
  const skinHex = skin.getHex();
  const darkSkin = skin.getHSL({}).l < 0.4;
  const age = rng.next();
  let hairHex = darkSkin ? rng.pick([0x14110f, 0x1f1712, 0x2a1c13, 0x8c8c88]) : rng.pick(HAIR);
  if (age > 0.82) hairHex = rng.pick([0x9a9a96, 0xb8b5ae, 0x6e6c68]);
  const style = darkSkin && rng.chance(0.6) ? rng.pick(['crop', 'curly', 'bald']) : rng.pick(STYLES);
  const jacket = new THREE.Color(o.jacket);
  const shirtHex = rng.pick(SHIRT), tieHex = rng.pick(TIE), trouserHex = rng.pick(TROUSER), shoeHex = rng.pick(SHOE);
  const belly = rng.chance(0.35) ? rng.float(0.4, 1) : rng.float(0, 0.3);
  const sw = rng.float(0.94, 1.08);
  const B = belly * 0.032;
  const glasses = rng.chance(0.24) ? rng.int(0, 2) : -1;
  const stache = rng.chance(0.28) ? rng.int(0, 1) : -1;
  const stubble = rng.chance(0.35) ? rng.float(0.3, 0.7) : 0;
  const cards = rng.chance(0.55);
  const pencils = rng.int(0, 3);
  const eyeHex = darkSkin ? rng.pick([0x2a1a10, 0x3a2414]) : rng.pick(EYES);

  const wBody = () => [[BODY, 1]];
  const wTorso = (p) => {
    const y = p.y;
    if (y < 0.98) return [[HIPS, 1]];
    if (y < 1.13) { const t = smooth(0.98, 1.13, y); return [[HIPS, 1 - t], [SPINE, t]]; }
    const t = smooth(1.13, 1.32, y);
    return [[SPINE, 1 - t], [CHEST, t]];
  };
  const wLeg = (p) => { const t = smooth(0.55, 0.92, p.y); return [[BODY, 1 - t], [HIPS, t]]; };

  // Ambient-occlusion-ish shading helpers baked into vertex colours.
  const noise = hero ? (p) => Math.sin(p.x * 91 + p.y * 37) * Math.sin(p.z * 73 - p.y * 51) : () => 0;

  // ── Legs, pelvis, shoes ─────────────────────────────────────────────────────────
  const legRings = [[0.03, 0.064, 0.071], [0.12, 0.062, 0.068], [0.3, 0.062, 0.066], [0.48, 0.066, 0.07], [0.64, 0.074, 0.08], [0.8, 0.079, 0.086], [0.93, 0.076, 0.086]];
  const trouserShade = (p, n, c) => c.multiplyScalar(0.72 + 0.28 * smooth(0.0, 0.7, p.y) + noise(p) * 0.02);
  for (const s of [-1, 1]) {
    const lx = s * 0.093;
    kit.add(loft(legRings.map(([y, w, d]) => ({ y, x: lx + s * (y - 0.5) * 0.008, w, d, db: d * 1.02 })), L.seg >= 20 ? 20 : lite ? 6 : 10, { p: 2.1 }), { color: trouserHex, rough: 0.78, fabric: 1, w: wLeg, shade: trouserShade });
    // Shoe: lofted along its length (y), then laid flat pointing +z.
    const sr = [[-0.082, 0.016, 0.03, 0.012], [-0.074, 0.034, 0.04, 0.03], [-0.04, 0.041, 0.045, 0.042], [0.02, 0.044, 0.042, 0.034], [0.09, 0.048, 0.031, 0.024], [0.15, 0.045, 0.024, 0.02], [0.19, 0.037, 0.019, 0.016], [0.212, 0.022, 0.016, 0.012], [0.22, 0.004, 0.012, 0.004]];
    const shoe = loft(sr.map(([l, w, h, up]) => ({ y: l, z: -h, w, d: h, db: up, p: 3 })), L.seg >= 20 ? 18 : lite ? 5 : 8);
    shoe.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    shoe.rotateY(s * 0.08);
    shoe.translate(lx + s * 0.012, 0, 0.012);
    kit.add(shoe, { color: shoeHex, rough: 0.32, bone: BODY, shade: (p, n, c) => { if (p.y < 0.013) c.multiplyScalar(0.45); else c.multiplyScalar(0.9 + 0.25 * Math.max(0, n.y)); } });
  }
  const pelvis = [[0.76, 0.15, 0.1, 0.11], [0.84, 0.168, 0.11, 0.124], [0.92, 0.172, 0.113 + B * 0.4, 0.127], [0.99, 0.166, 0.11 + B * 0.6, 0.12], [1.02, 0.162, 0.107 + B * 0.6, 0.116]];
  kit.add(loft(pelvis.map(([y, w, d, db]) => ({ y, w, d, db })), L.seg, { p: 2.2 }), { color: trouserHex, rough: 0.78, fabric: 1, w: wTorso, shade: trouserShade });
  // Belt + buckle
  kit.add(loft([{ y: 0.982, w: 0.17, d: 0.112 + B * 0.6, db: 0.124 }, { y: 1.018, w: 0.166, d: 0.11 + B * 0.6, db: 0.12 }], L.seg, { p: 2.2 }), { color: 0x1c130d, rough: 0.4, w: wTorso });
  if (hero) {
    const bk = new THREE.BoxGeometry(0.034, 0.028, 0.008);
    bk.translate(0, 1.0, 0.114 + B * 0.6);
    kit.add(bk, { color: 0xb89548, rough: 0.25, w: wTorso });
  }

  // ── Shirt, tie, collar ─────────────────────────────────────────────────────────
  const shirt = new Prof([
    { y: 0.95, w: 0.158, d: 0.104 + B * 0.6, db: 0.113 },
    { y: 1.03, w: 0.156, d: 0.108 + B * 0.85, db: 0.11 },
    { y: 1.13, w: 0.158, d: 0.114 + B, db: 0.106 },
    { y: 1.23, w: 0.163 * sw, d: 0.118 + B * 0.6, db: 0.104 },
    { y: 1.31, w: 0.17 * sw, d: 0.118 + B * 0.2, db: 0.1 },
    { y: 1.38, w: 0.172 * sw, d: 0.108, db: 0.095 },
    { y: 1.43, w: 0.158 * sw, d: 0.09, db: 0.085 },
    { y: 1.465, w: 0.125, d: 0.07, db: 0.07 },
    { y: 1.49, w: 0.07, d: 0.058, db: 0.056 },
  ], 2.3);
  const shirtYs = hero ? [0.95, 0.99, 1.03, 1.08, 1.13, 1.18, 1.23, 1.27, 1.31, 1.345, 1.38, 1.41, 1.43, 1.45, 1.465, 1.49] : [0.95, 1.03, 1.13, 1.23, 1.31, 1.38, 1.43, 1.465, 1.49];
  kit.add(loft(shirtYs.map((y) => shirt.at(y)), L.seg, { p: 2.3 }), {
    color: shirtHex, rough: 0.7, fabric: 0.6, w: wTorso,
    shade: (p, n, c) => { const th = Math.abs(Math.atan2(p.x, p.z)); c.multiplyScalar(0.62 + 0.38 * smooth(0.75, 0.15, th)); },
  });
  // Tie: knot + blade lying on the shirt front.
  const tieW = (t) => lerp(0.017, 0.037, smooth(0, 0.85, t));
  const tieBlade = grid(2, hero ? 22 : 7, (s, t, out) => {
    const y = lerp(1.452, 1.016, t);
    const tip = t > 0.93 ? (1 - t) / 0.07 : 1;
    const x = (s - 0.5) * 2 * tieW(t) * (s === 0.5 ? 1 : tip);
    const yy = s === 0.5 ? y - (t > 0.93 ? 0.012 * (t - 0.93) / 0.07 : 0) : y;
    return out.set(x, yy, shirt.zAt(yy, x, 0.006 + (s === 0.5 ? 0.0015 : 0)));
  });
  const tieShade = (p, n, c) => { if (hero) { const st = Math.sin((p.y * 0.8 + p.x) * 120); if (st > 0.55) c.lerp(new THREE.Color(0xd8cfa8), 0.35); } };
  kit.add(facing(tieBlade, new V3(0, 0, 1)), { color: tieHex, rough: 0.45, fabric: 0.3, w: wTorso, shade: tieShade });
  kit.add(twoSided(grid(hero ? 22 : 7, 1, (t, s, out) => {
    const y = lerp(1.452, 1.016, t), side = t > 0.93 ? (1 - t) / 0.07 : 1;
    const x = tieW(t) * side;
    return out.set(x, y, shirt.zAt(y, x, s ? 0.006 : 0.001));
  })), { color: tieHex, rough: 0.5, w: wTorso, shade: (p, n, c) => c.multiplyScalar(0.7) });
  kit.add(twoSided(grid(hero ? 22 : 7, 1, (t, s, out) => {
    const y = lerp(1.452, 1.016, t), side = t > 0.93 ? (1 - t) / 0.07 : 1;
    const x = -tieW(t) * side;
    return out.set(x, y, shirt.zAt(y, x, s ? 0.006 : 0.001));
  })), { color: tieHex, rough: 0.5, w: wTorso, shade: (p, n, c) => c.multiplyScalar(0.7) });
  const knotZ = shirt.zAt(1.462, 0, 0.012);
  kit.add(loft([{ y: 1.444, z: knotZ - 0.004, w: 0.013, d: 0.009, db: 0.008 }, { y: 1.455, z: knotZ, w: 0.019, d: 0.012, db: 0.01 }, { y: 1.47, z: knotZ, w: 0.021, d: 0.012, db: 0.01 }, { y: 1.478, z: knotZ - 0.004, w: 0.012, d: 0.006, db: 0.006 }], L.limb, { p: 2.6 }), { color: tieHex, rough: 0.45, bone: CHEST });
  // Shirt collar band + points.
  kit.add(loft([{ y: 1.455, w: 0.067, d: 0.066, db: 0.062, t0: 0.32, t1: TAU - 0.32 }, { y: 1.5, w: 0.062, d: 0.06, db: 0.058, t0: 0.36, t1: TAU - 0.36 }, { y: 1.535, w: 0.06, d: 0.058, db: 0.057, t0: 0.4, t1: TAU - 0.4 }], L.seg, { p: 2 }), { color: shirtHex, rough: 0.65, fabric: 0.5, bone: CHEST });
  for (const s of [-1, 1]) {
    const pts = [new V3(s * 0.014, 1.468, 0), new V3(s * 0.06, 1.47, 0), new V3(s * 0.034, 1.405, 0)];
    const g = grid(hero ? 4 : 2, hero ? 4 : 2, (a, b, out) => {
      const A = pts[0], Bv = pts[1], Cv = pts[2];
      const x = A.x + (Bv.x - A.x) * a * (1 - b) + (Cv.x - A.x) * b, y = A.y + (Bv.y - A.y) * a * (1 - b) + (Cv.y - A.y) * b;
      return out.set(x, y, shirt.zAt(y, x, 0.009 + 0.003 * (1 - b)));
    });
    kit.add(twoSided(g), { color: shirtHex, rough: 0.65, bone: CHEST, shade: (p, n, c) => c.multiplyScalar(0.85 + 0.15 * Math.max(0, n.z)) });
  }

  // ── Jacket ──────────────────────────────────────────────────────────────────────
  const J = 0.014;
  const jacketProf = new Prof([
    { y: 0.775, w: 0.19, d: 0.132 + B * 0.5, db: 0.142 },
    { y: 0.86, w: 0.186, d: 0.127 + B * 0.5, db: 0.14 },
    { y: 0.95, w: 0.178, d: 0.12 + B * 0.6, db: 0.128 },
    ...shirt.r.slice(1, 7).map((r) => ({ y: r.y, w: r.w + J + (r.y > 1.36 ? 0.006 : 0), d: r.d + J, db: r.db + J })),
    { y: 1.465, w: 0.14, d: 0.082, db: 0.085 },
    { y: 1.495, w: 0.088, d: 0.072, db: 0.074 },
    { y: 1.535, w: 0.068, d: 0.064, db: 0.066 },
  ], 2.3);
  const gap = (y) => {
    if (y >= 1.47) return lerp(0.95, 1.35, smooth(1.47, 1.535, y));
    if (y >= 1.08) return lerp(0.24, 0.9, smooth(1.08, 1.47, y));
    return lerp(0.24, 0.55, smooth(1.08, 0.775, y));
  };
  const jYs = hero ? [0.775, 0.8, 0.86, 0.91, 0.95, 1.0, 1.04, 1.08, 1.13, 1.18, 1.23, 1.27, 1.31, 1.345, 1.38, 1.41, 1.43, 1.45, 1.465, 1.48, 1.495, 1.515, 1.535] : [0.775, 0.86, 0.95, 1.03, 1.08, 1.13, 1.23, 1.31, 1.38, 1.43, 1.465, 1.495, 1.535];
  const jShade = (p, n, c) => {
    const ax = Math.abs(p.x);
    let k = 0.86 + 0.14 * smooth(0.78, 1.0, p.y);
    k *= 1 - 0.22 * gauss(ax - 0.17, 0.035) * gauss(p.y - 1.27, 0.09); // under-arm
    k *= 1 - 0.1 * gauss(p.y - 1.5, 0.03); // collar crease
    c.multiplyScalar(k * (1 + noise(p) * 0.025));
  };
  const jacketRings = jYs.map((y) => { const r = jacketProf.at(y), g = gap(y); return { ...r, t0: g, t1: TAU - g }; });
  kit.add(loft(jacketRings, L.jacket, { p: 2.3 }), { color: jacket, rough: 0.82, fabric: 1, w: wTorso, shade: jShade });
  // Lining: the inside of the jacket, seen through the open front and between the legs.
  kit.add(flipped(loft(jacketRings.map((r) => ({ ...r, w: r.w - 0.008, d: r.d - 0.008, db: r.db - 0.008 })), L.jacket, { p: 2.3 })), { color: jacket.clone().multiplyScalar(0.42).lerp(new THREE.Color(0x3a3430), 0.3), rough: 0.6, w: wTorso });
  // Jacket front edges + hem: a band of thickness so the open front reads as cloth.
  for (const s of [-1, 1]) {
    const g = grid(1, jYs.length - 1, (a, t, out) => {
      const y = jYs[Math.round(t * (jYs.length - 1))];
      const th = s > 0 ? gap(y) : TAU - gap(y);
      return jacketProf.pt(y, th, a ? 0 : -0.011, out);
    });
    kit.add(twoSided(g), { color: jacket.clone().multiplyScalar(0.62), rough: 0.85, w: wTorso });
  }
  kit.add(twoSided(grid(hero ? 40 : 14, 1, (t, a, out) => {
    const g0 = gap(0.775), th = g0 + (TAU - 2 * g0) * t;
    return jacketProf.pt(0.775, th, a ? 0 : -0.011, out);
  })), { color: jacket.clone().multiplyScalar(0.55), rough: 0.85, w: wTorso });
  // Lapels: flaps folded back along the opening from the collar down to the button.
  const lapW = (y) => (y < 1.1 ? 0 : y < 1.36 ? 0.062 * smooth(1.1, 1.36, y) : y < 1.395 ? 0.062 : y < 1.41 ? lerp(0.062, 0.032, (y - 1.395) / 0.015) : lerp(0.042, 0.024, smooth(1.41, 1.47, y)));
  for (const s of [-1, 1]) {
    const ny = hero ? 18 : 6;
    const surf = (a, t, off, out) => {
      const y = lerp(1.1, 1.47, t), r = jacketProf.at(y);
      const g = gap(y), th = g + (a * lapW(y)) / Math.max(0.05, r.w);
      return jacketProf.pt(y, s > 0 ? th : TAU - th, off, out);
    };
    const top = grid(hero ? 4 : 2, ny, (a, t, out) => surf(a, t, 0.005 + 0.002 * (1 - a), out));
    kit.add(facing(top, new V3(0, 0.2, 1)), { color: jacket.clone().multiplyScalar(0.93), rough: 0.7, fabric: 1, w: wTorso, shade: (p, n, c) => c.multiplyScalar(0.85 + 0.2 * Math.max(0, n.z)) });
    kit.add(twoSided(grid(ny, 1, (t, a, out) => surf(1, t, a ? 0.005 : 0, out))), { color: jacket.clone().multiplyScalar(0.6), rough: 0.85, w: wTorso });
  }
  // Pockets: two hip flaps and a chest welt.
  // Pocket flaps: thin raised panels whose lower edge is shaded like a fold.
  const slab = (x0, x1, y0, y1, off, nx, col) => {
    const g = grid(nx, 2, (a, b, out) => { const x = lerp(Math.min(x0, x1), Math.max(x0, x1), a), y = lerp(y0, y1, b); return jacketProf.pt(y, jacketProf.th(y, x), b === 0 ? off * 0.3 : off, out); });
    kit.add(facing(g, new V3(0, 0, 1)), { color: col, rough: 0.8, fabric: 1, w: wTorso, shade: (p, n, c) => c.multiplyScalar(p.y < y0 + (y1 - y0) * 0.3 ? 0.6 : 1) });
  };
  if (hero) for (const s of [-1, 1]) slab(s * 0.1, s * 0.165, 0.905, 0.945, 0.004, 6, jacket.clone().multiplyScalar(0.97));
  slab(0.055, 0.135, 1.262, 1.276, 0.003, hero ? 5 : 2, jacket.clone().multiplyScalar(0.9));
  if (hero) {
    for (let i = 0; i < pencils; i++) {
      const x = 0.07 + i * 0.016, z = jacketProf.zAt(1.3, x, 0.0);
      const pg = new THREE.CylinderGeometry(0.0035, 0.0035, 0.085, 6);
      pg.translate(x, 1.29 + i * 0.008, z - 0.002);
      kit.add(pg, { color: [0xe8b820, 0xd84a3a, 0x2a4a8a][i], rough: 0.5, bone: CHEST });
      const tip = new THREE.CylinderGeometry(0.0038, 0.0038, 0.008, 6); tip.translate(x, 1.336 + i * 0.008, z - 0.002);
      kit.add(tip, { color: 0xb0b0a8, rough: 0.3, bone: CHEST });
    }
    for (const y of [1.08, 0.965]) {
      const th = gap(y) + 0.06;
      const bp = jacketProf.pt(y, -th, 0.003, new V3());
      const bt = ellipsoid(0.008, 0.008, 0.003, 10, 6); bt.translate(bp.x, bp.y, bp.z);
      kit.add(bt, { color: jacket.clone().multiplyScalar(0.4), rough: 0.35, w: wTorso });
    }
  }

  // ── Arms + hands ────────────────────────────────────────────────────────────────
  const SH_Y = 1.415, EL_Y = 1.125, WR_Y = 0.87, AX = 0.206;
  for (const [side, s] of [[0, -1], [1, 1]]) {
    const ax = s * AX;
    const wArm = (p) => {
      const t = smooth(1.165, 1.085, p.y);
      return [[SHOULDER[side], 1 - t], [ELBOW[side], t]];
    };
    const sleeve = [[0.885, 0.045, 0.046], [0.9, 0.044, 0.045], [0.96, 0.043, 0.044], [1.05, 0.046, 0.047], [1.1, 0.048, 0.049], [1.125, 0.049, 0.05], [1.15, 0.05, 0.051], [1.22, 0.053, 0.054], [1.3, 0.055, 0.057], [1.37, 0.057, 0.058], [1.43, 0.052, 0.053], [1.465, 0.03, 0.03]];
    kit.add(loft(sleeve.filter((_, i) => hero || i % 2 === 0 || i === sleeve.length - 1).map(([y, w, d]) => ({ y, x: ax, z: 0.004, w, d })), L.limb + 2, { p: 2 }), {
      color: jacket, rough: 0.82, fabric: 1, w: wArm,
      shade: (p, n, c) => c.multiplyScalar((0.82 + 0.18 * smooth(0.88, 1.3, p.y)) * (1 - 0.18 * Math.max(0, -n.x * s))),
    });
    const cap = ellipsoid(0.056, 0.045, 0.058, L.limb + 2, hero ? 10 : 6); cap.translate(s * (AX - 0.01), SH_Y - 0.004, 0.0);
    kit.add(cap, { color: jacket, rough: 0.82, fabric: 1, bone: SHOULDER[side], shade: (p, n, c) => c.multiplyScalar(0.92) });
    // Shirt cuff peeking out of the sleeve.
    kit.add(loft([{ y: 0.855, x: ax, w: 0.038, d: 0.04 }, { y: 0.86, x: ax, w: 0.041, d: 0.043 }, { y: 0.895, x: ax, w: 0.043, d: 0.044 }], L.limb, { p: 2.2 }), { color: shirtHex, rough: 0.65, bone: ELBOW[side] });
    // Hand: palm (lofted), fingers (capsules), thumb. Palm faces the thigh (−s·x).
    const handO = { color: skinHex, rough: 0.55, hand: true, face: false };
    const hx = s * (AX + 0.001);
    const palm = [[0.882, 0.016, 0.022], [0.865, 0.018, 0.03], [0.835, 0.02, 0.039], [0.805, 0.019, 0.042], [0.788, 0.016, 0.04], [0.779, 0.009, 0.03]];
    kit.add(loft(palm.map(([y, w, d]) => ({ y, x: hx, z: 0.003, w, d })), L.limb, { p: 2.4 }), { ...handO, bone: WRIST[side], shade: (p, n, c) => { if (n.x * -s > 0.4) c.lerp(new THREE.Color(0xe8a890), 0.12); } });
    const FZ = [0.027, 0.009, -0.009, -0.026], FR = [0.0093, 0.0097, 0.009, 0.0078], F1 = [0.039, 0.043, 0.04, 0.032], F2 = [0.033, 0.036, 0.034, 0.028];
    const crowdCurl = cards && side === 0 ? 0.9 : 0.55;
    for (let f = 0; f < 4; f++) {
      const k0 = new V3(hx - s * 0.002, 0.792, FZ[f] + 0.003);
      if (hero) {
        const k1 = k0.clone().add(new V3(0, -F1[f], 0)), k2 = k1.clone().add(new V3(0, -F2[f], 0));
        kit.add(capsule(FR[f], F1[f], k0, k1, L.finger[0], L.finger[1]), { ...handO, bone: FINGER(side, f, 0) });
        kit.add(capsule(FR[f] * 0.92, F2[f] - FR[f] * 0.3, k1, k2.clone().add(new V3(0, FR[f] * 0.6, 0)), L.finger[0], L.finger[1]), { ...handO, bone: FINGER(side, f, 1) });
        // Fingernail
        const nail = ellipsoid(FR[f] * 0.7, FR[f] * 0.9, FR[f] * 0.3, 6, 4);
        nail.translate(k2.x + s * FR[f] * 0.75, k2.y + FR[f] * 1.4, k2.z);
        nail.rotateZ(0);
        kit.add(nail, { color: new THREE.Color(skinHex).lerp(new THREE.Color(0xf4d8cc), 0.5).getHex(), rough: 0.3, hand: true, bone: FINGER(side, f, 1) });
      } else if (f === 0) {
        // One curled finger block (all four fingers) for the crowd: baked curl toward the palm.
        const a1 = crowdCurl * 0.9, a2 = crowdCurl * 1.1;
        const d1 = new V3(-s * Math.sin(a1), -Math.cos(a1), 0), d2 = new V3(-s * Math.sin(a1 + a2), -Math.cos(a1 + a2), 0);
        const k = new V3(hx - s * 0.002, 0.792, 0.003), k1 = k.clone().addScaledVector(d1, 0.045), k2 = k1.clone().addScaledVector(d2, 0.038);
        for (const [a, b, r] of [[k, k1, 0.0105], [k1, k2, 0.0095]]) {
          const g = capsule(r, a.distanceTo(b), a, b, 1, 6);
          g.translate(-a.x, -a.y, -a.z); g.scale(1, 1, 3.3); g.translate(a.x, a.y, a.z);
          kit.add(g, { ...handO, bone: WRIST[side] });
        }
      }
    }
    const t0 = new V3(hx - s * 0.008, 0.862, 0.03), td = new V3(-s * 0.32, -0.72, 0.6).normalize();
    const t1 = t0.clone().addScaledVector(td, 0.042), t2 = t1.clone().addScaledVector(new V3(-s * 0.45, -0.7, 0.55).normalize(), 0.036);
    kit.add(capsule(0.0115, 0.042, t0, t1, L.finger[0], L.finger[1]), { ...handO, bone: hero ? FINGER(side, 4, 0) : WRIST[side] });
    kit.add(capsule(0.0098, 0.03, t1, t2, L.finger[0], L.finger[1]), { ...handO, bone: hero ? FINGER(side, 4, 1) : WRIST[side] });
    // A fistful of trading cards in the left hand.
    if (cards && side === 0) {
      const cg = new THREE.BoxGeometry(0.008, 0.075, 0.05);
      cg.rotateX(0.35); cg.translate(hx - s * 0.026, 0.79, 0.022);
      kit.add(cg, { color: 0xf4efdc, rough: 0.8, bone: WRIST[side], shade: (p, n, c) => { if (Math.abs(n.x) < 0.5) c.multiplyScalar(0.8); } });
    }
  }

  // ── Neck + head ─────────────────────────────────────────────────────────────────
  const H = new HeadShape(rng);
  const u = (x, y) => H.dir(x, y);
  const P = new V3(), N = new V3();
  // Landmarks
  H.front(0, H.C.y - H.R.y * 0.49, P); const MY = P.y + 0.002;
  const eyeU = [u(-0.37, 0.09), u(0.37, 0.09)];
  const eyeR = 0.0128;
  const eyeC = eyeU.map((uu) => { H.S(uu, P); H.normal(uu, N); return P.clone().addScaledVector(N, 0.0028 - eyeR); });
  const EY = eyeC[0].y;
  const jawPivot = new V3(0, MY + 0.004, -0.01);
  const jawW = (p) => {
    const yt = MY + Math.max(0, 0.05 - p.z) * 0.45;
    return smooth(yt + 0.004, yt - 0.012, p.y) * smooth(-0.045, 0.005, p.z);
  };
  const wHead = (p) => { const hp = p; const w = jawW(hp); return w > 0.001 ? [[HEAD, 1 - w], [JAW, w]] : [[HEAD, 1]]; };
  const headO = (extra) => ({ rough: 0.55, face: true, w: wHead, offset: NECK, ...extra });

  kit.add(loft([
    { y: 1.38, z: -0.005, w: 0.054, d: 0.05, db: 0.056 },
    { y: 1.45, z: -0.003, w: 0.051, d: 0.05, db: 0.054 },
    { y: 1.52, z: 0.0, w: 0.049, d: 0.05, db: 0.052 },
    { y: 1.565, z: 0.004, w: 0.048, d: 0.048, db: 0.05 },
  ], L.limb + 2), {
    color: skinHex, rough: 0.6, face: true,
    w: (p) => { const t = smooth(1.46, 1.545, p.y); const j = jawW(new V3(p.x, p.y - NECK.y, p.z)) * t; return [[CHEST, 1 - t], [HEAD, t - j], [JAW, j]]; },
    shade: (p, n, c) => c.multiplyScalar(0.82 + 0.18 * smooth(1.42, 1.55, p.y)),
  });

  const red = new THREE.Color(0xd06050);
  const stubC = new THREE.Color(0x3a3a44);
  const skinShade = (p, n, c) => {
    const x = p.x, y = p.y, z = p.z, ax = Math.abs(x);
    c.lerp(red, 0.09 * gauss(Math.hypot(ax - 0.045, y - (MY + 0.03)), 0.025) * smooth(0.04, 0.09, z)); // cheeks
    c.lerp(red, 0.08 * gauss(y - (EY + 0.02), 0.05) * smooth(0.06, 0.1, z)); // brow warmth
    if (stubble) c.lerp(stubC, stubble * 0.33 * smooth(MY + 0.025, MY - 0.005, y) * smooth(-0.02, 0.03, z) * smooth(H.C.y - 0.13, MY - 0.03, y + 0.02));
    if (stubble) c.lerp(stubC, stubble * 0.25 * gauss(y - (MY + 0.012), 0.008) * gauss(x, 0.03) * smooth(0.05, 0.09, z));
    c.multiplyScalar(0.84 + 0.16 * smooth(H.C.y - 0.11, H.C.y - 0.02, y)); // darker under the jaw
    c.multiplyScalar(1 - 0.12 * gauss(Math.hypot(ax - 0.032, y - (EY - 0.015)), 0.012)); // under-eye
  };
  kit.add(sphere(L.head[0], L.head[1], (uu, o) => H.S(uu, o)), headO({ color: skinHex, shade: skinShade }));

  // Ears
  for (const s of [-1, 1]) {
    const eu = new V3(s * 0.985, -0.04, -0.12).normalize();
    H.S(eu, P);
    const ear = sphere(hero ? 14 : lite ? 5 : 8, hero ? 12 : lite ? 4 : 6, (uu, o) => {
      o.set(uu.x * 0.011, uu.y * 0.031, uu.z * 0.02);
      if (uu.x * s > 0) o.x -= s * 0.007 * Math.max(0, 1 - (uu.y * uu.y + uu.z * uu.z) * 1.3);
      o.y += Math.abs(uu.z) * 0.002;
    });
    ear.rotateY(s * -0.25);
    ear.translate(P.x + s * 0.006, P.y, P.z - 0.004);
    kit.add(ear, headO({ color: skinHex, shade: (p, n, c) => { c.lerp(red, 0.15); if (n.x * s < 0.3) c.multiplyScalar(0.85); } }));
  }

  // Nose: rings down the centre line of the face, projecting forward, closed underneath.
  {
    const nScale = rng.float(0.85, 1.25), nW = rng.float(0.9, 1.2);
    const yTop = EY + 0.006, yTip = MY + 0.024;
    const n = hero ? 9 : 5, rings = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, y = lerp(yTop, yTip, t);
      H.front(0, y, P);
      const prot = (0.004 + 0.017 * Math.pow(t, 1.3)) * nScale;
      const w = (0.0075 + 0.0035 * t + 0.006 * smooth(0.6, 1, t)) * nW;
      rings.push({ y, z: P.z - 0.006, w, d: prot + 0.006, db: 0.006, p: 2.2 });
    }
    const last = rings[rings.length - 1];
    rings.push({ ...last, y: last.y - 0.006, w: last.w * 0.8, d: last.d * 0.85, z: last.z - 0.001 });
    rings.push({ ...last, y: last.y - 0.0085, w: last.w * 0.25, d: last.d * 0.4, db: 0.002, z: last.z + last.d * 0.3 });
    rings.reverse();
    kit.add(loft(rings, hero ? 14 : lite ? 4 : 6), headO({ color: skinHex, shade: (p, nn, c) => { c.lerp(red, 0.1 * smooth(yTop, yTip, p.y)); if (nn.y < -0.6) c.multiplyScalar(0.7); } }));
    if (hero) for (const s of [-1, 1]) {
      const al = ellipsoid(0.0075, 0.0065, 0.009, 10, 8);
      al.translate(s * 0.0105 * nW, yTip - 0.004, last.z + last.d * 0.35);
      kit.add(al, headO({ color: skinHex, shade: (p, nn, c) => { c.lerp(red, 0.12); if (nn.y < -0.5) c.multiplyScalar(0.6); } }));
    }
  }

  // Eyes: lat-long spheres turned to face forward so iris/pupil are clean concentric rings.
  const eyeCol = new THREE.Color(eyeHex), white = new THREE.Color(0xf2ede4), pupil = new THREE.Color(0x0a0807);
  eyeC.forEach((c, i) => {
    const g = sphere(L.eye[0], L.eye[1], (uu, o) => o.copy(uu).multiplyScalar(eyeR));
    g.rotateX(Math.PI / 2);
    g.translate(c.x, c.y, c.z);
    kit.add(g, {
      color: 0xffffff, rough: 0.12, offset: NECK, bone: i ? EYE_R : EYE_L,
      shade: (p, n, col) => {
        const a = Math.acos(clamp(n.z, -1, 1));
        if (a < 0.2) col.copy(pupil); else if (a < 0.44) col.copy(eyeCol).multiplyScalar(a > 0.38 ? 0.55 : 1); else col.copy(white).multiplyScalar(a > 1.3 ? 0.75 : 1);
      },
    });
    if (hero) {
      // Upper lid (blinks via the LIDS bone) and a fixed lower lid.
      const up = new THREE.SphereGeometry(eyeR * 1.13, 16, 7, 0, TAU, 0, 1.2);
      up.deleteAttribute('uv'); up.rotateX(-0.12); up.translate(c.x, c.y, c.z);
      kit.add(up, { color: skinHex, rough: 0.5, face: true, offset: NECK, bone: LIDS, shade: (p, n, col) => { const a = Math.acos(clamp((p.y - c.y) / (eyeR * 1.13), -1, 1)); if (a > 1.05) col.setHex(0x1e1410); else col.multiplyScalar(0.92); } });
      const lo = new THREE.SphereGeometry(eyeR * 1.08, 16, 4, 0, TAU, Math.PI - 0.85, 0.85);
      lo.deleteAttribute('uv'); lo.translate(c.x, c.y, c.z);
      kit.add(lo, { color: skinHex, rough: 0.5, face: true, offset: NECK, bone: HEAD, shade: (p, n, col) => col.multiplyScalar(0.9) });
    } else {
      const up = new THREE.SphereGeometry(eyeR * 1.1, lite ? 5 : 8, lite ? 2 : 3, 0, TAU, 0, 1.0);
      up.deleteAttribute('uv'); up.translate(c.x, c.y, c.z);
      kit.add(up, { color: skinHex, rough: 0.5, face: true, offset: NECK, bone: HEAD, shade: (p, n, col) => col.multiplyScalar(0.85) });
    }
  });

  // Brows: a chain of small ellipsoids along the brow ridge.
  const browArch = rng.float(0.6, 1.4), browTh = rng.float(0.8, 1.35), browTilt = rng.float(-0.004, 0.004);
  for (const s of [-1, 1]) {
    const n = hero ? 10 : 2;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const x = s * (0.012 + (hero ? 0.04 : 0.03) * t + (hero ? 0 : 0.008)), y = EY + 0.021 + 0.005 * Math.sin(Math.PI * (0.2 + 0.8 * t)) * browArch - 0.003 * t + browTilt * (1 - t);
      H.front(x, y, P, N);
      const e = ellipsoid(hero ? 0.0075 : 0.016, 0.0034 * browTh * (1.15 - 0.45 * t), 0.0032, hero ? 8 : lite ? 4 : 5, hero ? 6 : lite ? 2 : 3);
      e.rotateZ(s * (-0.15 + 0.3 * t));
      e.translate(P.x + N.x * 0.0015, P.y + N.y * 0.0015, P.z + N.z * 0.0015);
      kit.add(e, headO({ color: hairHex, rough: 0.75, face: false, shade: (p, nn, c) => c.multiplyScalar(0.8) }));
    }
  }

  // Mouth: dark cavity, teeth and lips laid on the face; the jaw bone opens it.
  {
    const W = 0.022 * rng.float(0.92, 1.12), lipC = new THREE.Color(skinHex).lerp(new THREE.Color(0xa0524a), darkSkin ? 0.25 : 0.4);
    const nd = hero ? [10, 4] : [6, 2];
    kit.add(H.decal(nd[0], nd[1], (s, t) => {
      const x = (s - 0.5) * 2 * W * 0.95, h = Math.sqrt(Math.max(0, 1 - (x / W) ** 2));
      return [x, MY + lerp(-0.01, 0.004, t) * h, 0.0016];
    }), { color: 0x4a1a15, rough: 0.6, offset: NECK, w: (p) => { const w = smooth(MY + 0.003, MY - 0.008, p.y); return [[HEAD, 1 - w], [JAW, w]]; } });
    if (hero) {
      kit.add(H.decal(8, 1, (s, t) => [(s - 0.5) * 0.03, MY + lerp(-0.0068, 0.003, t), 0.0026]), { color: 0xe4dac6, rough: 0.3, offset: NECK, bone: HEAD });
      kit.add(H.decal(8, 1, (s, t) => [(s - 0.5) * 0.026, MY + lerp(-0.009, -0.004, t), 0.0024]), { color: 0xd8ccb6, rough: 0.3, offset: NECK, bone: JAW });
    }
    const lipShade = (p, n, c) => c.multiplyScalar(0.85 + 0.25 * Math.max(0, n.y));
    kit.add(H.decal(nd[0] + 2, hero ? 4 : 2, (s, t) => {
      const x = (s - 0.5) * 2 * W, ax = Math.abs(x) / W;
      const top = 0.0075 * (1 - ax ** 2.2) * (1 - 0.18 * gauss(x, 0.004)) + 0.0006;
      return [x, MY + top * t, 0.0011 + 0.0034 * Math.sin(Math.PI * (0.38 + 0.62 * t)) * (1 - ax ** 4)];
    }), { color: lipC, rough: 0.42, face: true, offset: NECK, bone: HEAD, shade: lipShade });
    kit.add(H.decal(nd[0] + 2, hero ? 4 : 2, (s, t) => {
      const x = (s - 0.5) * 2 * W * 0.93, ax = Math.abs(x) / (W * 0.93);
      const bot = 0.0088 * (1 - ax ** 2) + 0.0006;
      return [x, MY + 0.0007 - bot * (1 - t), 0.0011 + 0.0042 * Math.sin(Math.PI * 0.62 * t) * (1 - ax ** 4)];
    }), { color: lipC.clone().multiplyScalar(1.05), rough: 0.4, face: true, offset: NECK, bone: JAW, shade: lipShade });
    if (stache >= 0) {
      const SW = 0.03 + stache * 0.004;
      kit.add(H.decal(hero ? 12 : 6, hero ? 4 : 2, (s, t) => {
        const x = (s - 0.5) * 2 * SW, ax = Math.abs(x) / SW;
        const bot = MY + 0.0035 - (stache ? 0.012 : 0.004) * ax ** 2, top = MY + 0.0175 - 0.007 * ax ** 2;
        return [x, lerp(bot, top, t), 0.0012 + 0.0062 * Math.sin(Math.PI * (0.15 + 0.85 * t)) * (1 - ax ** 3)];
      }), { color: hairHex, rough: 0.7, offset: NECK, w: wHead, shade: (p, n, c) => c.multiplyScalar(0.75 + 0.2 * noise(p.clone().multiplyScalar(3))) });
    }
  }

  // Glasses: wire aviators, black frames or tortoiseshell.
  if (glasses >= 0) {
    const gCol = [0x111111, 0xb89548, 0x4a2a16][glasses];
    const rx = glasses === 1 ? 0.024 : 0.021, ry = glasses === 1 ? 0.02 : 0.016, tube = glasses === 1 ? 0.0013 : 0.0024;
    for (const c of eyeC) {
      const ring = new THREE.TorusGeometry(1, tube, hero ? 5 : 3, hero ? 24 : 10);
      ring.deleteAttribute('uv');
      const p = ring.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), r = Math.hypot(x, y) || 1, nx = x / r, ny = y / r;
        const drop = glasses === 1 && ny < 0 ? 1.15 : 1;
        p.setXYZ(i, nx * rx + (x - nx) * 1, ny * ry * drop + (y - ny), p.getZ(i));
      }
      ring.computeVertexNormals();
      ring.translate(c.x, c.y - 0.001, c.z + eyeR + 0.008);
      kit.add(ring, { color: gCol, rough: 0.3, offset: NECK, bone: HEAD });
    }
    const z = eyeC[0].z + eyeR + 0.008;
    kit.add(capsule(tube, 0.012, new V3(-0.009, EY + 0.004, z), new V3(0.009, EY + 0.004, z), 1, 4), { color: gCol, rough: 0.3, offset: NECK, bone: HEAD });
    for (const s of [-1, 1]) {
      const e0 = new V3(s * (Math.abs(eyeC[0].x) + rx), EY + 0.002, z - 0.002);
      const eu = new V3(s * 0.985, 0.05, -0.12).normalize(); H.S(eu, P);
      kit.add(capsule(tube, e0.distanceTo(P), e0, new V3(P.x + s * 0.004, P.y + 0.012, P.z), 1, 4), { color: gCol, rough: 0.3, offset: NECK, bone: HEAD });
    }
  }

  // Hair: a shell over the scalp whose thickness falls below the skin outside the hairline.
  {
    const recede = style === 'bald' ? 0.5 : age > 0.6 ? rng.float(0, 0.7) : rng.float(0, 0.25);
    const burns = style === 'mullet' || style === 'feather' ? 1 : rng.float(0.2, 1);
    const part = rng.chance(0.5) ? 1 : -1;
    const hc = new THREE.Color(hairHex), skc = new THREE.Color(skinHex);
    const salt = age > 0.65 && hairHex !== 0x9a9a96 && rng.chance(0.5);
    const T = (uu) => {
      const a = Math.abs(Math.atan2(uu.x, uu.z)), y = uu.y;
      let line = hairline(a, recede, burns);
      if (style === 'mullet' && a > 2.1) line = lerp(line, -1.0, smooth(2.1, 2.6, a));
      if (style === 'feather' && a > 1.38 && a < 1.9) line = -0.12;
      let m = smooth(line, line + 0.09, y);
      let t;
      switch (style) {
        case 'slick': t = 0.006 + 0.003 * smooth(0, 0.8, y); break;
        case 'bald': m *= 1 - smooth(0.12, 0.36, y + 0.45 * Math.max(0, uu.z)); t = 0.005; break;
        case 'curly': t = 0.013 + 0.005 * smooth(0, 0.9, y) + 0.004 * (Math.sin(uu.x * 47) * Math.sin(uu.y * 43) * Math.sin(uu.z * 51)); break;
        case 'mullet': t = 0.009 + 0.005 * smooth(0, 0.9, y) + 0.016 * smooth(-0.3, -0.9, y) * smooth(1.9, 2.6, a); break;
        case 'crop': t = 0.0055 + 0.0012 * Math.sin(uu.x * 60) * Math.sin(uu.y * 55); break;
        case 'feather': t = 0.01 + 0.007 * smooth(-0.1, 0.6, y) + 0.005 * smooth(1.0, 1.6, a) + 0.004 * gauss(y - 0.7, 0.15) * Math.max(0, uu.z); break;
        default: { // side part
          const pa = Math.atan2(uu.x, uu.z) * part;
          t = 0.008 + 0.006 * smooth(0.1, 0.8, y) + 0.006 * gauss(y - 0.72, 0.16) * Math.max(0, uu.z) * (pa < 0.35 ? 1 : 0.5);
          t *= 1 - 0.3 * gauss(pa - 0.38, 0.04) * smooth(0.5, 0.75, y) * smooth(-0.6, 0.0, uu.z);
        }
      }
      return [t * m - 0.0035, m];
    };
    const nrm = new V3();
    const g = sphere(L.hair[0], L.hair[1], (uu, o) => {
      const [t] = T(uu);
      H.S(uu, o);
      nrm.set(uu.x / H.R.x, uu.y / H.R.y, uu.z / H.R.z).normalize();
      o.addScaledVector(nrm, t);
      if (style === 'mullet') o.y -= 0.03 * smooth(-0.55, -1.0, uu.y) * smooth(-0.2, -0.8, uu.z);
    }, { th0: 0, thLen: style === 'mullet' ? Math.PI : Math.PI * 0.85 });
    // Drop triangles that are entirely under the skin.
    const pos = g.attributes.position, ix = g.index.array, keep = [], uu = new V3(), hidden = new Uint8Array(pos.count);
    const inner = new V3();
    for (let i = 0; i < pos.count; i++) {
      uu.copy(inner.fromBufferAttribute(pos, i)).sub(H.C);
      uu.set(uu.x / H.R.x, uu.y / H.R.y, uu.z / H.R.z).normalize();
      hidden[i] = T(uu)[0] <= -0.0034 ? 1 : 0;
    }
    for (let i = 0; i < ix.length; i += 3) if (!(hidden[ix[i]] && hidden[ix[i + 1]] && hidden[ix[i + 2]])) keep.push(ix[i], ix[i + 1], ix[i + 2]);
    g.setIndex(keep);
    const cc = new THREE.Color();
    kit.add(g, {
      color: hairHex, rough: style === 'slick' ? 0.32 : 0.6, offset: NECK, w: wHead,
      shade: (p, n, c) => {
        uu.copy(p).sub(H.C); uu.set(uu.x / H.R.x, uu.y / H.R.y, uu.z / H.R.z).normalize();
        const [, m] = T(uu);
        const streak = Math.sin(p.x * 260 + p.z * 40) * Math.sin(p.y * 90 + p.x * 30);
        c.copy(hc).multiplyScalar(0.82 + 0.2 * streak + 0.12 * Math.max(0, n.y));
        if (salt) c.lerp(cc.setHex(0xb8b5ae), 0.35 + 0.3 * streak);
        c.lerp(skc, 0.65 * (1 - smooth(0.0, 0.7, m)));
      },
    });
  }

  // ── Skeleton ───────────────────────────────────────────────────────────────────
  const abs = [];
  const bones = [];
  const mk = (i, parent, pos) => {
    const b = new THREE.Bone();
    abs[i] = pos.clone();
    if (parent >= 0) { b.position.copy(pos).sub(abs[parent]); bones[parent].add(b); } else b.position.copy(pos);
    bones[i] = b;
    return b;
  };
  mk(BODY, -1, new V3(0, 0, 0));
  mk(HIPS, BODY, new V3(0, 0.95, 0));
  mk(SPINE, HIPS, new V3(0, 1.05, 0));
  mk(CHEST, SPINE, new V3(0, 1.28, 0));
  mk(HEAD, CHEST, NECK.clone());
  mk(JAW, HEAD, jawPivot.clone().add(NECK));
  mk(EYE_L, HEAD, eyeC[0].clone().add(NECK));
  mk(EYE_R, HEAD, eyeC[1].clone().add(NECK));
  mk(LIDS, HEAD, new V3(0, eyeC[0].y, eyeC[0].z).add(NECK));
  for (const [side, s] of [[0, -1], [1, 1]]) {
    mk(SHOULDER[side], CHEST, new V3(s * (AX - 0.016), SH_Y, 0));
    mk(ELBOW[side], SHOULDER[side], new V3(s * AX, EL_Y, 0.004));
    mk(WRIST[side], ELBOW[side], new V3(s * (AX + 0.001), WR_Y, 0.003));
    if (hero) {
      const FZ = [0.027, 0.009, -0.009, -0.026], F1 = [0.039, 0.043, 0.04, 0.032];
      for (let f = 0; f < 4; f++) {
        mk(FINGER(side, f, 0), WRIST[side], new V3(s * (AX - 0.001), 0.792, FZ[f] + 0.003));
        mk(FINGER(side, f, 1), FINGER(side, f, 0), new V3(s * (AX - 0.001), 0.792 - F1[f], FZ[f] + 0.003));
      }
      const t0 = new V3(s * (AX + 0.001) - s * 0.008, 0.862, 0.03);
      mk(FINGER(side, 4, 0), WRIST[side], t0);
      mk(FINGER(side, 4, 1), FINGER(side, 4, 0), t0.clone().addScaledVector(new V3(-s * 0.32, -0.72, 0.6).normalize(), 0.042));
    }
  }
  const geo = kit.build();
  return { geo, bones, hero, info: { skinHex, cards, MY, style }, jz: (y, x) => jacketProf.zAt(y, x, 0.0045) };
}

// ── Material ─────────────────────────────────────────────────────────────────────
// MeshStandardMaterial reading the per-vertex channel: x roughness, y hand-glow mask,
// z face mask (eye-contact warmth), w fabric mask (weave map + normal map).
let FABRIC = null, FABRIC_N = null;
function personMaterial() {
  if (!FABRIC) { FABRIC = fabricTexture(); FABRIC_N = fabricNormal(); }
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, map: FABRIC, normalMap: FABRIC_N, normalScale: new THREE.Vector2(0.55, 0.55) });
  const U = { uHand: { value: new THREE.Color(0) }, uFace: { value: new THREE.Color(0) } };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uHand = U.uHand; sh.uniforms.uFace = U.uFace;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 aMat;\nvarying vec4 vMat;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMat = aMat;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec4 vMat;\nuniform vec3 uHand;\nuniform vec3 uFace;')
      .replace('#include <map_fragment>', '#ifdef USE_MAP\n diffuseColor *= mix(vec4(1.0), texture2D(map, vMapUv), vMat.w);\n#endif')
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = roughness * vMat.x;')
      .replace('#include <normal_fragment_maps>', ShaderChunkNormal())
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance = totalEmissiveRadiance * max(0.0, 1.0 - vMat.y - vMat.z) + uHand * vMat.y * 0.8 + uFace * vMat.z;\n float rimF = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);\n totalEmissiveRadiance += rimF * vec3(0.16, 0.13, 0.1) + diffuseColor.rgb * vec3(0.09, 0.025, 0.012) * (vMat.y + vMat.z);');
  };
  m.customProgramCacheKey = () => 'oo-person-1';
  m.userData.U = U;
  return m;
}
function ShaderChunkNormal() {
  return THREE.ShaderChunk.normal_fragment_maps.replace('mapN.xy *= normalScale;', 'mapN.xy *= normalScale * vMat.w;');
}

let badgeTexture = null, badgeMaterial = null;

// ── Trader ───────────────────────────────────────────────────────────────────────
export class Trader {
  constructor(opts) {
    const { rng, jacket, badgeIndex = -1, interactive = false } = opts;
    // Shouters are created without a shared fabric; treat them as close-up heroes unless told.
    this.detail = opts.detail ?? (opts.fabric ? 'crowd' : 'hero');
    this.interactive = interactive;
    this.rng = rng;
    this.root = new THREE.Group();
    const scale = rng.float(0.95, 1.06);
    this.scale = scale;
    const person = buildPerson(rng, { jacket, detail: this.detail });
    person.geo.scale(scale, scale, scale);
    this.info = person.info;

    this.bodyMat = personMaterial();
    const mesh = new THREE.SkinnedMesh(person.geo, this.bodyMat);
    const B = person.bones;
    for (const b of B) b.position.multiplyScalar(scale);
    mesh.add(B[BODY]);
    B[BODY].updateMatrixWorld(true);
    mesh.bind(new THREE.Skeleton(B), new THREE.Matrix4());
    mesh.castShadow = this.detail === 'hero';
    mesh.receiveShadow = false; // self-shadowing skinned cloth acnes at these shadow-map sizes
    mesh.boundingSphere = new THREE.Sphere(new V3(0, 1.1 * scale, 0), 1.45 * scale);
    this.mesh = mesh;
    this.root.add(mesh);
    this.bones = B;
    this.body = B[BODY]; this.hips = B[HIPS]; this.spine = B[SPINE]; this.chest = B[CHEST];
    this.head = B[HEAD]; this.jaw = B[JAW]; this.eyes = [B[EYE_L], B[EYE_R]]; this.lids = B[LIDS];
    this.hipsY = B[HIPS].position.y;
    // External code drives these like materials: .emissive is the live shader uniform.
    this.handMat = { emissive: this.bodyMat.userData.U.uHand.value };
    this.headMat = { emissive: this.bodyMat.userData.U.uFace.value };

    if (badgeIndex >= 0 && badgeTexture) {
      if (!badgeMaterial) badgeMaterial = new THREE.MeshStandardMaterial({ map: badgeTexture, roughness: 0.45 });
      const uv = badgeUV(badgeIndex);
      const g = new THREE.PlaneGeometry(0.12, 0.06, 6, 1);
      const a = g.attributes.uv, p = g.attributes.position;
      for (let i = 0; i < a.count; i++) a.setXY(i, uv.u + a.getX(i) * uv.w, uv.v + a.getY(i) * uv.h);
      // Curve it onto the chest (right breast, the viewer's left).
      for (let i = 0; i < p.count; i++) {
        const x = -0.105 + p.getX(i), y = 1.305 + p.getY(i);
        const z = person.jz(y, x);
        p.setXYZ(i, x * scale, y * scale - B[CHEST].position.y - B[SPINE].position.y - B[HIPS].position.y, z * scale);
      }
      g.computeVertexNormals();
      const badge = new THREE.Mesh(g, badgeMaterial);
      B[CHEST].add(badge);
    }
    this.tag = null; // floating price tags were retired; bubbles live in the HUD
    this.arms = [0, 1].map((side) => ({
      side: side ? 1 : -1, shoulder: B[SHOULDER[side]], elbow: B[ELBOW[side]], wrist: B[WRIST[side]],
      fingers: this.detail === 'hero' ? [0, 1, 2, 3, 4].map((f) => [B[FINGER(side, f, 0)], B[FINGER(side, f, 1)]]) : null,
      raise: 0, bend: 0.2, palm: 0, curl: 0.4, wave: rng.float(0, 6),
    }));

    this.phase = rng.float(0, 10);
    this.lean = 0;
    this.headYaw = 0; this.headPitch = 0;
    this.scanYaw = 0; this.scanAt = 0;
    this.shove = new THREE.Vector3();
    this.glow = 0; this.glowColor = new THREE.Color();
    this.highlight = 0;
    this.nod = 0;
    this.jawOpen = 0; this.talk = rng.float(0, 10);
    this.blinkAt = rng.float(0.5, 4); this.blink = 0;
    this.saccade = new THREE.Vector2(); this.saccadeAt = 0;
  }

  place(x, y, z, faceAngle) {
    this.home = new THREE.Vector3(x, y, z);
    this.root.position.copy(this.home);
    this.root.rotation.y = faceAngle;
    this.baseYaw = faceAngle;
  }

  // s: { intent: {kind, bid, ask, urgency}, looking, panic, targeted, inRange, toPlayer: {yaw, pitch} }
  update(dt, t, s) {
    const urg = s.intent ? s.intent.urgency || 0 : 0;
    const active = !!(s.intent && s.intent.kind !== 'idle');
    const panic = s.panic || 0;
    const speed = 1 + panic * 1.6 + urg;
    this.phase += dt * speed;
    const ph = this.phase, sc = this.scale;

    // Posture: weight shift through the hips, lean into the shout from the spine, breathing.
    this.lean = damp(this.lean, active ? 0.08 + urg * 0.16 : 0.02, 4, dt);
    const shift = Math.sin(ph * 0.45);
    this.hips.position.x = shift * 0.014 * sc;
    this.hips.position.y = this.hipsY - Math.abs(shift) * 0.006 * sc;
    this.hips.rotation.z = shift * 0.03;
    this.hips.rotation.y = Math.sin(ph * 0.31) * 0.05;
    const breath = Math.sin(t * (1.6 + urg * 1.5) + this.phase * 0.2);
    this.spine.rotation.x = this.lean * 0.6 + breath * 0.008;
    this.spine.rotation.z = -shift * 0.035 + Math.sin(ph * 0.7) * 0.02 * (1 + panic);
    this.chest.rotation.x = this.lean * 0.4 + breath * 0.012;
    this.chest.position.y = (1.28 - 1.05) * sc + breath * 0.0025 * sc;
    this.body.position.y = Math.max(0, Math.sin(ph * 5.5)) * 0.03 * (panic + urg * 0.5);
    this.body.rotation.z = 0;

    // Crowd shoves settle back home.
    this.shove.multiplyScalar(Math.exp(-3 * dt));
    if (this.home) this.root.position.set(this.home.x + this.shove.x, this.home.y, this.home.z + this.shove.z);

    // Head: meet the player's eyes when looking, otherwise scan the pit.
    if (t > this.scanAt) { this.scanYaw = this.rng.float(-0.9, 0.9); this.scanAt = t + this.rng.float(0.8, 2.6); }
    const wantYaw = s.looking && s.toPlayer ? clamp(s.toPlayer.yaw, -1.3, 1.3) : this.scanYaw;
    const wantPitch = s.looking && s.toPlayer ? clamp(s.toPlayer.pitch, -0.5, 0.5) : 0.05;
    this.headYaw = damp(this.headYaw, wantYaw, 7, dt);
    this.headPitch = damp(this.headPitch, wantPitch, 7, dt);
    this.nod = Math.max(0, this.nod - dt * 2.5);
    const shoutBob = active ? Math.sin(this.talk * 1.3) * 0.04 * urg : 0;
    this.head.rotation.set(-this.headPitch - this.lean + Math.sin(this.nod * 12) * this.nod * 0.25 - shoutBob, this.headYaw - this.hips.rotation.y, -this.spine.rotation.z * 0.6);

    // Mouth: syllable-like flapping while shouting, the odd word otherwise.
    this.talk += dt * (active ? 11 + urg * 6 : 6);
    let want = 0;
    if (active) {
      const syl = Math.max(0, Math.sin(this.talk) * 0.6 + Math.sin(this.talk * 0.37 + 1) * 0.5 + 0.25);
      want = clamp(syl, 0, 1) * (0.22 + 0.2 * urg + 0.08 * panic);
    } else if (Math.sin(this.talk * 0.13 + this.phase) > 0.75) want = Math.max(0, Math.sin(this.talk)) * 0.08;
    this.jawOpen = damp(this.jawOpen, want, 22, dt);
    this.jaw.rotation.x = this.jawOpen;

    // Eyes: tiny saccades, a blink every few seconds.
    if (t > this.saccadeAt) { this.saccade.set(this.rng.float(-0.12, 0.12), this.rng.float(-0.06, 0.06)); this.saccadeAt = t + this.rng.float(0.3, 1.6); }
    const lookE = s.looking ? 0.25 : 1;
    for (const e of this.eyes) e.rotation.set(-this.saccade.y * lookE - 0.04, this.saccade.x * lookE, 0);
    if (t > this.blinkAt) { this.blink = 1; this.blinkAt = t + this.rng.float(1.8, 5); }
    this.blink = Math.max(0, this.blink - dt * 7);
    this.lids.rotation.x = Math.sin(this.blink * Math.PI) * 1.05 + (active ? -0.08 * urg : 0.06);

    // Arms: signal the side(s) being worked. Palm out = selling, palm in = buying.
    const sides = [];
    if (s.intent?.bid) sides.push('buy');
    if (s.intent?.ask) sides.push('sell');
    for (const arm of this.arms) {
      const sideIdx = arm.side < 0 ? 0 : 1;
      const which = sides.length === 2 ? (sideIdx === 0 ? 'buy' : 'sell') : sides.length === 1 && (sideIdx === 1 || urg > 0.6) ? sides[0] : null;
      const up = which ? 1 : 0;
      arm.raise = damp(arm.raise, up, 6, dt);
      arm.palm = damp(arm.palm, which === 'sell' ? 1 : 0, 8, dt);
      arm.wave += dt * (3 + urg * 6 + panic * 4);
      const waveAmt = up * (0.08 + urg * 0.22 + panic * 0.1);
      const r = arm.raise, sd = arm.side;
      const reach = 2.55 - arm.palm * 0.65;
      const bend = 1.35 - arm.palm * 1.1;
      const idleSwing = Math.sin(ph * 0.9 + sideIdx * 2) * 0.03;
      arm.shoulder.rotation.x = 0.05 + idleSwing - r * (reach + Math.sin(arm.wave) * waveAmt);
      arm.shoulder.rotation.y = 0;
      arm.shoulder.rotation.z = sd * (0.09 + r * (0.28 - arm.palm * 0.12));
      arm.elbow.rotation.x = -(0.22 + r * (bend + Math.sin(arm.wave * 0.5 + 1) * waveAmt));
      arm.elbow.rotation.z = 0;
      // Twist the hand so the palm faces the player (sell) or the trader himself (buy).
      arm.wrist.rotation.y = sd * (Math.PI / 2) * r * (1 - 2 * arm.palm);
      arm.wrist.rotation.x = r * (arm.palm * -0.35 + 0.15);
      arm.wrist.rotation.z = -sd * (1 - r) * 0.1;
      const holding = sideIdx === 0 && this.info.cards;
      arm.curl = damp(arm.curl, up ? 0.06 + (1 - arm.palm) * 0.12 : holding ? 0.85 : 0.3, 10, dt);
      if (arm.fingers) {
        for (let f = 0; f < 4; f++) {
          const [a, b] = arm.fingers[f];
          const c = arm.curl * (1 + f * 0.08);
          a.rotation.set((f - 1.5) * -0.07 * up, 0, -sd * c * 0.95);
          b.rotation.set(0, 0, -sd * c * 1.15);
        }
        const [ta, tb] = arm.fingers[4];
        ta.rotation.set(0, 0, sd * (0.15 - arm.curl * 0.3));
        tb.rotation.set(0, 0, -sd * arm.curl * 0.5);
      }
    }

    // Signal glow on the hands; target highlight on the body.
    const gc = 0xffc040;
    this.glow = damp(this.glow, active && !this.noGlow ? 1.2 + urg * 1.3 : 0, 6, dt);
    this.glowColor.set(gc).multiplyScalar(this.glow);
    this.handMat.emissive.copy(this.glowColor);
    this.active = active;
    // Eye contact you can see across the pit: their face warms up when they're looking at you.
    this.eyeGlow = damp(this.eyeGlow || 0, s.looking && s.inRange ? 1 : 0, 8, dt);
    this.headMat.emissive.setRGB(0.22 * this.eyeGlow, 0.16 * this.eyeGlow, 0.06 * this.eyeGlow);
    this.highlight = damp(this.highlight, s.targeted ? 1 : 0, 10, dt);
    this.bodyMat.emissive.setRGB(0.1 * this.highlight, 0.09 * this.highlight, 0.05 * this.highlight);
  }

  // Price tags were replaced by HUD bubbles; kept for API compatibility.
  setTag() {}

  push(dx, dz) { this.shove.x += dx; this.shove.z += dz; }
  chestWorld(out) { return this.root.localToWorld(out.set(0, 1.35 * this.scale, 0)); }
}

// A desk phone handset for the clerks.
let handsetGeo = null, handsetMat = null;
function handset() {
  if (!handsetGeo) {
    const parts = [new THREE.BoxGeometry(0.03, 0.17, 0.035), new THREE.BoxGeometry(0.045, 0.04, 0.05).translate(0, 0.08, 0.012), new THREE.BoxGeometry(0.045, 0.04, 0.05).translate(0, -0.08, 0.012)];
    handsetGeo = mergeGeometries(parts.map((g) => { g.deleteAttribute('uv'); return g; }));
    handsetMat = new THREE.MeshStandardMaterial({ color: 0x1a1816, roughness: 0.35 });
  }
  return new THREE.Mesh(handsetGeo, handsetMat);
}

// ── Where the player stands ──────────────────────────────────────────────────────
// The camera sits on the pit rim on the PLAYER_ANGLE side, looking at the pit centre. The
// crowd keeps a wedge in front of it clear so the shouters (placed by main.js about 3–4.6 m
// ahead) are never blocked, but packs in on both sides of them and behind them.
export const VIEW = { r: 10.3, clear: 5.3, cone: 0.72 };
const CAM = new V3(Math.cos(PLAYER_ANGLE) * VIEW.r, 0, Math.sin(PLAYER_ANGLE) * VIEW.r);
const FWD = new V3(-CAM.x, 0, -CAM.z).normalize();
function viewAngle(x, z) {
  const dx = x - CAM.x, dz = z - CAM.z, d = Math.hypot(dx, dz) || 1e-6;
  return { d, a: Math.acos(clamp((dx * FWD.x + dz * FWD.z) / d, -1, 1)) };
}
export function inCameraWedge(x, z) {
  const { d, a } = viewAngle(x, z);
  return d < 2.8 || (d < VIEW.clear && a < VIEW.cone);
}

// Every standing spot in the pit: two shoulder-to-shoulder rows per step, the floor of the pit,
// and a double row around the rim. Spots out of the player's view are thinned out.
export function crowdLayout(rng, target = 300) {
  const spots = [];
  const along = (R, y, spacing, tier) => {
    const c = octagon(R);
    let carry = rng.float(0, spacing);
    for (let i = 0; i < 8; i++) {
      const [x0, z0] = c[i], [x1, z1] = c[(i + 1) % 8];
      const len = Math.hypot(x1 - x0, z1 - z0);
      for (let s = carry; s < len; s += spacing * rng.float(0.92, 1.1)) {
        const t = s / len;
        let x = lerp(x0, x1, t), z = lerp(z0, z1, t);
        const rr = Math.hypot(x, z) || 1, j = rng.float(-0.1, 0.1);
        x += (x / rr) * j; z += (z / rr) * j;
        carry = s;
        if (inCameraWedge(x, z)) continue;
        spots.push({ x, y, z, tier, face: Math.atan2(-x, -z) + rng.float(-0.45, 0.45) });
      }
      carry = Math.max(0, carry - len + spacing);
    }
  };
  // Rim: two rows on the hall floor behind the top step.
  along(TIER_R[0] + 0.75, 0, 0.64, -1);
  along(TIER_R[0] + 1.5, 0, 0.7, -1);
  // Steps: two rows per tread (outer row sits on the higher part of the tread).
  for (let k = 0; k < TIER_R.length - 1; k++) {
    const rOut = TIER_R[k], rIn = TIER_R[k + 1], y = tierTop(k);
    along(lerp(rIn, rOut, 0.74), y, 0.6, k);
    along(lerp(rIn, rOut, 0.27), y, 0.62, k);
  }
  // Pit floor: concentric rings down to the middle.
  const yb = tierTop(TIER_R.length - 1);
  along(2.55, yb, 0.62, 4);
  along(1.75, yb, 0.62, 4);
  along(0.95, yb, 0.62, 4);
  spots.push({ x: 0.1, y: yb, z: -0.1, tier: 4, face: rng.float(0, TAU) });
  // Drop near-duplicates at octagon corners.
  const all = [];
  for (const s of spots) if (!all.some((o) => Math.abs(o.y - s.y) < 0.01 && Math.hypot(o.x - s.x, o.z - s.z) < 0.5)) all.push(s);
  // Thin to the budget, keeping the crush where the player looks: full density close in and to
  // the sides of the shouters, lighter far away (where heads overlap anyway) and out of view.
  const weight = (s) => {
    const { d, a } = viewAngle(s.x, s.z);
    return (a > 1.05 ? 0.12 : 1) * (d < 8.5 ? 0.7 : d < 13 ? 0.65 : 0.45); // room to breathe around the shouters
  };
  let sum = 0;
  for (const s of all) sum += (s.w = weight(s));
  const f = Math.min(4, target / sum);
  const out = all.filter((s) => rng.next() < Math.min(1, s.w * f));
  // A few people turn to argue with a neighbour instead of facing the middle.
  for (const s of out) if (rng.chance(0.12)) s.face += rng.float(-1.6, 1.6);
  return out;
}

// Slots for the agent traders: spread through the part of the pit the player sees well.
export function pitSlots(n, rng, layout = crowdLayout(rng)) {
  const good = layout.filter((s) => { const { d, a } = viewAngle(s.x, s.z); return a < 0.95 && d > 5.6 && d < 19 && s.tier >= 0; });
  for (let i = good.length - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); [good[i], good[j]] = [good[j], good[i]]; }
  return good.slice(0, n);
}

// ── Crowdlite: the dense background crowd ───────────────────────────────────────
// A handful of 'lite' people (same builder, about 2k triangles) drawn as InstancedMeshes.
// The skeleton is baked away: per-vertex arm and upper-body weights let the vertex shader
// raise arms, bob, lean and sway every instance on its own phase. Jacket colour is
// per-instance (instanceColor) through a baked tint channel, so one variant serves every firm.
const LITE_SEEDS = [3101, 4703, 5807, 7309];
const PIV = {
  S: [new V3(-(0.206 - 0.016), 1.415, 0), new V3(0.206 - 0.016, 1.415, 0)],
  E: [new V3(-0.206, 1.125, 0.004), new V3(0.206, 1.125, 0.004)],
};
function liteGeometry(seed) {
  const a = buildPerson(new Rng(seed), { jacket: 0x000000, detail: 'lite' });
  const b = buildPerson(new Rng(seed), { jacket: 0xffffff, detail: 'lite' });
  const g = a.geo, n = g.attributes.position.count;
  const ca = g.attributes.color.array, cb = b.geo.attributes.color.array;
  const tint = new Float32Array(n * 3);
  if (cb.length === ca.length) for (let i = 0; i < ca.length; i++) tint[i] = Math.max(0, cb[i] - ca[i]);
  b.geo.dispose();
  const si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const arm = new Float32Array(n * 4), lean = new Float32Array(n);
  const UPPER = new Set([CHEST, HEAD, JAW, EYE_L, EYE_R, LIDS, ...SHOULDER, ...ELBOW, ...WRIST]);
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 4; k++) {
      const idx = si.getComponent(i, k), w = sw.getComponent(i, k);
      if (!w) continue;
      for (let s = 0; s < 2; s++) {
        if (idx === SHOULDER[s] || idx === ELBOW[s] || idx === WRIST[s]) arm[i * 4 + s * 2] += w;
        if (idx === ELBOW[s] || idx === WRIST[s]) arm[i * 4 + s * 2 + 1] += w;
      }
      if (UPPER.has(idx)) lean[i] += w; else if (idx === SPINE) lean[i] += w * 0.5;
    }
  }
  g.setAttribute('aTint', new THREE.BufferAttribute(tint, 3));
  g.setAttribute('aArm', new THREE.BufferAttribute(arm, 4));
  g.setAttribute('aLean', new THREE.BufferAttribute(lean, 1));
  g.deleteAttribute('skinIndex'); g.deleteAttribute('skinWeight');
  g.computeBoundingSphere();
  return { geo: g, info: a.info };
}

const v3 = (v) => `vec3(${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)})`;
function crowdMaterial(U) {
  const m = personMaterial();
  const base = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    base(sh, r);
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
attribute vec3 aTint; attribute vec4 aArm; attribute float aLean; attribute vec4 aSeed;
uniform float uTime, uPanic, uSurge, uSurgeT; uniform vec2 uSurgeDir;
mat3 rX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }
void armPose(inout vec3 p, inout vec3 n, float up, float fore, vec3 S, vec3 E, vec2 sh, float el) {
  if (up < 0.001) return;
  mat3 Re = rX(el);
  vec3 p1 = mix(p, E + Re * (p - E), fore), n1 = mix(n, Re * n, fore);
  mat3 Rs = rX(sh.x) * rZ(sh.y);
  p = mix(p, S + Rs * (p1 - S), up); n = normalize(mix(n, Rs * n1, up));
}`)
      .replace('#include <color_vertex>', `vColor = vec4(color + aTint * instanceColor, 1.0);`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
vec3 cPos = position;
vec3 ip = vec3(instanceMatrix[3]);
float ph = aSeed.x * 6.2832, mode = aSeed.w;
float sT = uSurgeT - (dot(ip.xz, uSurgeDir) * 0.045 + 0.55);
float env = uSurge * ((sT > 0.0 && sT < 1.7) ? sin(3.14159 * sT / 1.7) * (1.0 + 0.25 * sin(sT * 9.0)) : 0.0);
float spd = 1.0 + uPanic * 1.5 + env;
float act = clamp(0.16 + uPanic * 0.85 + env * 0.9, 0.0, 1.0);
float wvR = 0.5 + 0.5 * sin(uTime * (0.42 + 0.35 * aSeed.y) * spd + ph);
float wvL = 0.5 + 0.5 * sin(uTime * (0.33 + 0.3 * aSeed.z) * spd + ph * 1.7 + 2.0);
float thR = 1.0 - act * (0.3 + 0.7 * aSeed.z), thL = 1.0 - act * (0.15 + 0.6 * aSeed.y);
float rR = smoothstep(thR - 0.07, thR + 0.07, wvR), rL = smoothstep(thL - 0.07, thL + 0.07, wvL);
float wav = sin(uTime * (5.0 + 5.0 * uPanic) + ph * 3.0);
vec2 shR = vec2(0.05 - rR * (2.5 + wav * 0.18), 0.09 + rR * (0.22 + 0.1 * aSeed.y));
vec2 shL = vec2(0.05 - rL * (2.5 - wav * 0.18), -(0.09 + rL * (0.22 + 0.1 * aSeed.z)));
float elR = -(0.22 + rR * (0.35 + 0.45 * (0.5 + 0.5 * wav)) * (0.4 + aSeed.y));
float elL = -(0.22 + rL * (0.35 + 0.45 * (0.5 - 0.5 * wav)) * (0.4 + aSeed.z));
float bobF = 2.2 + 3.2 * uPanic, bobA = 0.008 + 0.03 * uPanic + 0.05 * env;
float leanA = 0.03 + uPanic * 0.07 + env * 0.18 + (rR + rL) * 0.03;
if (mode > 0.5 && mode < 1.5) { // clerk on the phone, the other hand flashing at the pit now and then
  shR = vec2(-2.2, 0.6); elR = -2.3; rR = 1.0;
  bobA = 0.004 + 0.01 * uPanic; leanA = 0.02;
}
if (mode > 1.5) { // runner: brisk walk
  float w = sin(uTime * 7.0 + ph);
  shR = vec2(w * 0.45, 0.09); shL = vec2(-w * 0.45, -0.09); elR = -0.6; elL = -0.6;
  bobF = 7.0; bobA = 0.035; leanA = 0.1;
}
armPose(cPos, objectNormal, aArm.z, aArm.w, ${v3(PIV.S[1])}, ${v3(PIV.E[1])}, shR, elR);
armPose(cPos, objectNormal, aArm.x, aArm.y, ${v3(PIV.S[0])}, ${v3(PIV.E[0])}, shL, elL);
vec3 HP = vec3(0.0, 0.98, 0.0);
mat3 Rl = rX(leanA) * rZ(sin(uTime * 0.7 * spd + ph) * (0.015 + 0.04 * uPanic));
cPos = mix(cPos, HP + Rl * (cPos - HP), aLean);
objectNormal = normalize(mix(objectNormal, Rl * objectNormal, aLean));
cPos.y += abs(sin(uTime * bobF + ph)) * bobA;
vec3 cOff = vec3(uSurgeDir.x, 0.0, uSurgeDir.y) * env * (0.1 + 0.2 * clamp(position.y / 1.8, 0.0, 1.0));
cOff += vec3(sin(uTime * 2.3 + ph), 0.0, cos(uTime * 1.9 + ph * 1.3)) * (0.012 + 0.045 * uPanic) * step(mode, 0.5);`)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed = cPos;')
      .replace('#include <project_vertex>', `vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
mvPosition.xyz += cOff;
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`);
  };
  m.customProgramCacheKey = () => 'oo-crowdlite-1';
  return m;
}

// Pose helper on the CPU (for the clerks' handsets): same maths as the shader.
function armPoint(p, side, sh, el) {
  const S = PIV.S[side], E = PIV.E[side];
  const Re = new THREE.Matrix4().makeRotationX(el);
  const q = p.clone().sub(E).applyMatrix4(Re).add(E);
  const Rs = new THREE.Matrix4().makeRotationX(sh[0]).multiply(new THREE.Matrix4().makeRotationZ(sh[1]));
  return q.sub(S).applyMatrix4(Rs).add(S);
}

export class CrowdLite {
  // people: [{ x, y, z, face, jacket, mode (0 pit, 1 phone clerk), scale }]
  constructor(scene, people, runners = []) {
    this.U = {
      uTime: { value: 0 }, uPanic: { value: 0 }, uSurge: { value: 0 }, uSurgeT: { value: 99 },
      uSurgeDir: { value: new THREE.Vector2(1, 0) },
    };
    this.material = crowdMaterial(this.U);
    this.variants = LITE_SEEDS.map(liteGeometry);
    this.meshes = [];
    this.panic = 0; this.target = 0;
    this.surgeT = 99; this.surgeAmt = 0;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new V3(), c = new THREE.Color(), up = new V3(0, 1, 0);
    const rng = new Rng(77);
    const buckets = this.variants.map(() => []);
    people.forEach((p, i) => buckets[(i * 7 + (i >> 2)) % buckets.length].push(p));
    const handsets = [];
    buckets.forEach((list, vi) => {
      if (!list.length) return;
      const geo = this.variants[vi].geo.clone();
      const seed = new Float32Array(list.length * 4);
      const mesh = new THREE.InstancedMesh(geo, this.material, list.length);
      list.forEach((p, i) => {
        const sc = p.scale ?? rng.float(0.94, 1.07);
        q.setFromAxisAngle(up, p.face);
        m4.compose(new V3(p.x, p.y, p.z), q, s.set(sc, sc * rng.float(0.97, 1.04), sc));
        mesh.setMatrixAt(i, m4);
        mesh.setColorAt(i, c.set(p.jacket).offsetHSL(0, rng.float(-0.05, 0.03), rng.float(-0.04, 0.02)));
        seed[i * 4] = rng.next(); seed[i * 4 + 1] = rng.next(); seed[i * 4 + 2] = rng.next(); seed[i * 4 + 3] = p.mode || 0;
        if (p.mode === 1) {
          const hand = armPoint(new V3(0.207, 0.8, 0.02), 1, [-2.2, 0.6], -2.3);
          handsets.push(hand.applyMatrix4(m4.clone()), p.face);
        }
      });
      geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 4));
      mesh.frustumCulled = false;
      mesh.castShadow = false; mesh.receiveShadow = true;
      mesh.userData.full = list.length;
      this.meshes.push(mesh);
      scene.add(mesh);
    });
    // Handsets at the clerks' ears.
    if (handsets.length) {
      const hg = mergeGeometries([new THREE.BoxGeometry(0.035, 0.2, 0.045), new THREE.BoxGeometry(0.05, 0.05, 0.06).translate(0, 0.09, 0.015), new THREE.BoxGeometry(0.05, 0.05, 0.06).translate(0, -0.09, 0.015)].map((g) => { g.deleteAttribute('uv'); return g; }));
      const hm = new THREE.InstancedMesh(hg, new THREE.MeshStandardMaterial({ color: 0x1c1a18, roughness: 0.35 }), handsets.length / 2);
      for (let i = 0; i < handsets.length; i += 2) {
        q.setFromEuler(new THREE.Euler(0.25, handsets[i + 1], 0.35, 'YXZ'));
        hm.setMatrixAt(i / 2, m4.compose(handsets[i], q, s.set(1, 1, 1)));
      }
      scene.add(hm);
      this.handsets = hm;
    }
    // Runners: yellow jackets threading between the phone banks and the rim.
    this.runners = runners.map((r) => ({ ...r, t: rng.float(0, 1), dir: 1, speed: rng.float(1.3, 1.9) }));
    if (this.runners.length) {
      const geo = this.variants[1].geo.clone();
      const seed = new Float32Array(this.runners.length * 4);
      for (let i = 0; i < this.runners.length; i++) { seed[i * 4] = rng.next(); seed[i * 4 + 3] = 2; }
      geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 4));
      this.runMesh = new THREE.InstancedMesh(geo, this.material, this.runners.length);
      this.runMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.runners.forEach((r, i) => this.runMesh.setColorAt(i, c.set(r.jacket ?? 0xf2c230)));
      this.runMesh.frustumCulled = false;
      scene.add(this.runMesh);
      this._placeRunners(0);
    }
    // Self-driven clock: ticks whenever the crowd is drawn, so main.js needs no update call.
    this._last = performance.now();
    this.meshes[0].onBeforeRender = () => {
      const now = performance.now(), dt = Math.min(0.1, (now - this._last) / 1000);
      this._last = now;
      this.update(dt);
    };
  }

  update(dt) {
    this.panic = damp(this.panic, this.target, 2, dt);
    this.U.uTime.value += dt;
    this.U.uPanic.value = this.panic;
    this.surgeT += dt;
    this.U.uSurgeT.value = this.surgeT;
    this.U.uSurge.value = this.surgeAmt;
    if (this.runners.length) this._placeRunners(dt);
  }

  _placeRunners(dt) {
    const m4 = this._m4 || (this._m4 = new THREE.Matrix4()), q = this._q || (this._q = new THREE.Quaternion()), one = new V3(1, 1, 1), p = new V3(), up = new V3(0, 1, 0);
    this.runners.forEach((r, i) => {
      const [a, b] = r.path;
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      r.t += (dt * r.speed * (1 + this.panic * 0.6) * r.dir) / len;
      if (r.t > 1 || r.t < 0) { r.dir *= -1; r.t = clamp(r.t, 0, 1); }
      p.set(lerp(a[0], b[0], r.t), 0, lerp(a[1], b[1], r.t));
      q.setFromAxisAngle(up, Math.atan2((b[0] - a[0]) * r.dir, (b[1] - a[1]) * r.dir));
      this.runMesh.setMatrixAt(i, m4.compose(p, q, one));
    });
    this.runMesh.instanceMatrix.needsUpdate = true;
  }

  setPanic(p) { this.target = clamp(p || 0, 0, 1); }
  // The whole crowd lurches one way and rocks back over ~1.5 s.
  surge(strength = 1, angle) {
    const a = angle ?? Math.random() * TAU;
    this.U.uSurgeDir.value.set(Math.cos(a), Math.sin(a));
    this.surgeAmt = clamp(strength, 0, 1.6);
    this.surgeT = 0;
    return a;
  }
  // 0..1 fraction of the crowd drawn (low quality preset).
  setDensity(f) { for (const m of this.meshes) m.count = Math.max(1, Math.round(m.userData.full * clamp(f, 0.1, 1))); }
  get count() { return this.meshes.reduce((n, m) => n + m.count, 0) + (this.runMesh ? this.runMesh.count : 0); }
}

// Builds every person on the floor and places them.
export class Crowd {
  // opts.people: how many in the pit (quality budget).
  constructor(scene, sim, rng, opts = {}) {
    this.scene = scene;
    badgeTexture = badgeAtlas(sim.agents.map((a) => {
      const f = FIRMS[a.firm];
      const light = ((f.color >> 16) & 255) * 0.3 + ((f.color >> 8) & 255) * 0.59 + (f.color & 255) * 0.11 > 150;
      return { badge: a.badge, firm: f.name, bg: light ? '#f4f0e0' : '#fffbe8', fg: '#' + f.color.toString(16).padStart(6, '0').replace('e0e0e0', '222222') };
    }));
    badgeMaterial = null;
    const fabric = true;
    this.traders = [];
    const layout = crowdLayout(new Rng(0x9e3779), opts.people ?? 160);
    const slots = pitSlots(sim.agents.length, rng, layout);
    const taken = new Set(slots);
    sim.agents.forEach((a, i) => {
      const tr = new Trader({ rng: new Rng(1000 + i), jacket: FIRMS[a.firm].color, badgeIndex: i, interactive: true, fabric, detail: 'crowd' });
      const sl = slots[i];
      tr.place(sl.x, sl.y, sl.z, sl.face);
      tr.agentId = a.id;
      this.traders.push(tr);
      scene.add(tr.root);
    });
    // Background people: full clerks at the wall desks...
    this.extras = [];
    this.fillers = [];
    const clerkJackets = [0xe8d27a, 0xd8d8d8, 0x9ab0c8];
    for (let i = 0; i < 12; i++) {
      const tr = new Trader({ rng: new Rng(5000 + i), jacket: rng.pick(clerkJackets), fabric, detail: 'crowd' });
      const side = i % 2 ? 1 : -1;
      const z = -15 + Math.floor(i / 2) * 3.6 * 1.5;
      tr.place(side * (32 - 2.4), 0, z, side > 0 ? -Math.PI / 2 : Math.PI / 2);
      tr.phoneArm = rng.chance(0.6);
      if (tr.phoneArm) {
        const h = handset();
        h.position.set(-0.03 * tr.scale, -0.07 * tr.scale, 0.02);
        h.rotation.set(0.2, 0, 0.3);
        tr.arms[1].wrist.add(h);
      }
      this.extras.push(tr);
      scene.add(tr.root);
    }
    // ...and the dense instanced crowd: every other spot in the pit, plus clerks at the phone
    // banks ringing it and runners in yellow jackets.
    const lrng = new Rng(0x51ab);
    const jackets = FIRMS.map((f) => f.color);
    const people = layout.filter((s) => !taken.has(s)).map((s) => ({
      ...s, mode: 0,
      jacket: lrng.chance(0.12) ? lrng.pick([0xf2c230, 0x2a2f3a, 0xe9e6dc, 0x6a2a2a]) : lrng.pick(jackets),
    }));
    for (const b of BOOTHS) {
      const n = b.clerks ?? 2;
      for (let k = 0; k < n; k++) {
        const lx = (k - (n - 1) / 2) * 1.2 + lrng.float(-0.15, 0.15), lz = 0.95 + lrng.float(0, 0.25);
        const x = b.x + Math.cos(b.ry) * lx + Math.sin(b.ry) * lz, z = b.z - Math.sin(b.ry) * lx + Math.cos(b.ry) * lz;
        people.push({ x, y: 0, z, face: b.ry + lrng.float(-0.4, 0.4), mode: lrng.chance(0.65) ? 1 : 0, jacket: lrng.pick([0xe8d27a, 0xd8d8d8, 0x9ab0c8, 0xb8c8a0, 0xe0a050]) });
      }
    }
    const runners = RUNNER_PATHS.map((path) => ({ path, jacket: 0xf2c230 }));
    this.lite = new CrowdLite(scene, people, runners);
    this.layout = layout;
  }

  // Panic 0..1: more arms up, faster bobbing, jostling. Call every frame (cheap).
  setPanic(p) { this.lite.setPanic(p); }
  // Crash moment: the whole floor lurches for ~1.5 s. strength ≈ 0.3 (shove) … 1 (crash).
  surge(strength = 1) {
    const a = this.lite.surge(strength);
    const dx = Math.cos(a) * 0.35 * strength, dz = Math.sin(a) * 0.35 * strength;
    for (const tr of this.traders) tr.push(dx, dz);
  }
  // Kept for API compatibility: the instanced crowd replaced the skinned fillers. n === 0
  // (the 'low' preset) thins the instanced crowd instead.
  addFillers(scene, rng, n) { if (n === 0) this.lite.setDensity(0.6); }

  get all() { return this.traders.concat(this.extras, this.fillers); }
}
