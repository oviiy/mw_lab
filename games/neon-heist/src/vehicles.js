import * as THREE from 'three';
import { G } from './state.js';
import { clamp, rand } from './util.js';
import { circRect, hit } from './city.js';
import { viaductSurface } from './viaduct.js';
import { mergeGeometries, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { beamTexture, glowTexture, blobShadowTexture } from './textures.js';

export const TYPES = {
  sedan: { n: 'Sedan', len: 4.6, wid: 1.9, max: 34, acc: 13, brake: 32, drag: 0.12, grip: 6.5, turn: 3.1, hp: 100, mass: 1, h: 1.5 },
  sport: { n: 'Sports Car', len: 4.4, wid: 1.95, max: 49, acc: 19, brake: 38, drag: 0.1, grip: 5.2, turn: 3.3, hp: 90, mass: 0.9, h: 1.2 },
  taxi: { n: 'Taxi', len: 4.6, wid: 1.9, max: 35, acc: 13.5, brake: 32, drag: 0.12, grip: 6.5, turn: 3.1, hp: 100, mass: 1, h: 1.5 },
  van: { n: 'Van', len: 5.4, wid: 2.05, max: 29, acc: 9, brake: 28, drag: 0.14, grip: 7, turn: 2.6, hp: 150, mass: 1.6, h: 2.1 },
  truck: { n: 'Truck', len: 9.2, wid: 2.6, max: 24, acc: 6.5, brake: 24, drag: 0.15, grip: 7.5, turn: 2.0, hp: 260, mass: 2.8, h: 3.4 },
  cop: { n: 'Police Cruiser', len: 4.8, wid: 1.95, max: 43, acc: 17, brake: 36, drag: 0.1, grip: 6, turn: 3.2, hp: 150, mass: 1.15, h: 1.5 },
};
export const CAR_COLORS = [0xc0392b, 0x2c6fbb, 0xe8e8e8, 0x1c1c20, 0x7a7f86, 0x2e8b57, 0xd98c1f, 0x7d3c98, 0xb0392f, 0x3a4a6b, 0xf0e6c8, 0x0f5f6f];

/* ---------- shared geometry / materials ---------- */
const gCache = {};
// Side profile -> extruded body, then "lofted": the plan view is rounded off at the nose and tail and the
// sides lean inward toward the top (tumblehome), so bodies read as sculpted rather than slab-sided.
function extrude(key, pts, depth, bevel = 0.07, loft = null) {
  if (gCache[key]) return gCache[key];
  const dense = [];
  for (let i = 0; i < pts.length; i++) { // resample edges so the loft has vertices to bend
    const a = pts[i], b = pts[(i + 1) % pts.length], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.3));
    for (let k = 0; k < n; k++) dense.push(new THREE.Vector2(a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n));
  }
  const s = new THREE.Shape(dense);
  let g = new THREE.ExtrudeGeometry(s, { depth: depth - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 1 });
  g.translate(0, 0, -(depth - bevel * 2) / 2);
  if (loft) {
    const p = g.attributes.position, L = loft.len / 2;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), nx = Math.min(1, Math.abs(x - (loft.cx || 0)) / L);
      const plan = 1 - loft.plan * Math.pow(nx, 5), tum = 1 - loft.tum * Math.min(1, Math.max(0, (y - loft.y0) / (loft.y1 - loft.y0)));
      p.setZ(i, p.getZ(i) * plan * tum);
    }
    g = toCreasedNormals(g, 0.75);
  }
  return (gCache[key] = g);
}
const boxG = (w, h, d) => { const k = `b${w},${h},${d}`; return gCache[k] || (gCache[k] = new THREE.BoxGeometry(w, h, d)); };
const M = {
  glass: new THREE.MeshPhysicalMaterial({ color: 0x05080b, roughness: 0.03, metalness: 0, ior: 1.5, envMapIntensity: 1.8 }),
  tire: new THREE.MeshStandardMaterial({ color: 0x131315, roughness: 0.92 }),
  hub: new THREE.MeshStandardMaterial({ color: 0xc4c8ce, roughness: 0.18, metalness: 1 }),
  rim: new THREE.MeshStandardMaterial({ color: 0x2a2d32, roughness: 0.35, metalness: 0.9 }),
  trim: new THREE.MeshStandardMaterial({ color: 0x17181b, roughness: 0.55, metalness: 0.2 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xdfe3e8, roughness: 0.12, metalness: 1 }),
  plate: new THREE.MeshStandardMaterial({ color: 0xe9e7da, roughness: 0.5 }),
  lens: new THREE.MeshPhysicalMaterial({ color: 0xdfe8f0, roughness: 0.05, metalness: 0.2, clearcoat: 1, emissive: 0xfff0b0, emissiveIntensity: 0.3 }),
  head: new THREE.MeshStandardMaterial({ color: 0xfff4cc, emissive: 0xfff0b0, emissiveIntensity: 0.4 }),
  tailDim: new THREE.MeshStandardMaterial({ color: 0x7a0f0f, emissive: 0xff1a1a, emissiveIntensity: 0.5 }),
  tailOn: new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff2020, emissiveIntensity: 3 }),
  burnt: new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9, metalness: 0.2 }),
  white: new THREE.MeshStandardMaterial({ color: 0xd9d6cc, roughness: 0.5 }),
  yellow: new THREE.MeshStandardMaterial({ color: 0xf2c200, emissive: 0xffe060, emissiveIntensity: 0.3 }),
};
let beamTex, glowTex, beamGeo, blobTex, blobGeo, blobMat, beamMat;

const SEDAN = (L) => [[-L / 2, 0.32], [-L / 2, 0.82], [-L * 0.34, 0.9], [L * 0.26, 0.92], [L / 2 - 0.15, 0.78], [L / 2, 0.5], [L / 2, 0.32]];
const SEDAN_CAB = (L) => [[-L * 0.28, 0.9], [-L * 0.18, 1.42], [L * 0.1, 1.42], [L * 0.25, 0.92]];

// Sentinel materials: swapped for the per-car paint / siren materials when a cached model is instantiated.
const PAINT = new THREE.MeshBasicMaterial(), SIR_R = new THREE.MeshBasicMaterial(), SIR_B = new THREE.MeshBasicMaterial();
const modelCache = {}, wheelCache = {};

function assemble(type) {
  const def = TYPES[type], L = def.len, Wd = def.wid, paint = PAINT, parts = [], wheelSpecs = [];
  const add = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parts.push(m); return m; };
  const wheel = (x, z, r, wd, front) => { wheelSpecs.push({ x, z, r, wd, front }); add(boxG(r * 2.5, r * 1.1, Wd + 0.02), M.trim, x, r + 0.2, 0); }; // + wheel-arch shadow
  let lightsX = L / 2, tailX = -L / 2, ly = 0.62, lz = Wd / 2 - 0.3;

  if (type === 'truck') {
    const cabL = 3.0, cx = L / 2 - cabL / 2;
    const cab = [[-cabL / 2, 0.55], [-cabL / 2, 2.9], [cabL * 0.22, 2.95], [cabL * 0.34, 2.0], [cabL / 2, 1.55], [cabL / 2, 0.55]];
    add(extrude('truckcab', cab, Wd, 0.1, { len: cabL, plan: 0.06, tum: 0.06, y0: 1.6, y1: 2.9 }), paint, cx, 0, 0);
    add(boxG(1.2, 0.8, Wd * 0.94), M.glass, cx + 0.55, 2.0, 0, false).scale.set(0.5, 1, 1);
    add(boxG(L - cabL, 0.3, Wd * 0.8), M.trim, -cabL / 2, 0.7, 0);
    const cargo = add(boxG(L - cabL - 0.3, 2.7, Wd), M.white, -cabL / 2 - 0.15, 2.2, 0); cargo.castShadow = true;
    const stripe = add(boxG(L - cabL - 0.28, 0.5, Wd + 0.02), paint, -cabL / 2 - 0.15, 1.5, 0, false);
    wheel(L / 2 - 1.3, Wd / 2 - 0.1, 0.5, 0.35, true); wheel(L / 2 - 1.3, -Wd / 2 + 0.1, 0.5, 0.35, true);
    for (const x of [-L / 2 + 1.1, -L / 2 + 2.5]) { wheel(x, Wd / 2 - 0.1, 0.5, 0.35); wheel(x, -Wd / 2 + 0.1, 0.5, 0.35); }
    ly = 1.0; lz = Wd / 2 - 0.35;
  } else if (type === 'van') {
    const vb = [[-L / 2, 0.35], [-L / 2, 2.0], [L * 0.22, 2.05], [L * 0.43, 1.25], [L / 2, 0.95], [L / 2, 0.35]];
    add(extrude('van', vb, Wd, 0.12, { len: L, plan: 0.08, tum: 0.07, y0: 1.0, y1: 2.05 }), paint);
    add(boxG(1.0, 0.7, Wd + 0.02), M.glass, L * 0.34, 1.5, 0, false).scale.set(0.8, 1, 1);
    add(boxG(1.3, 0.45, Wd + 0.03), M.glass, L * 0.05, 1.65, 0, false);
    for (const [x, z] of [[L * 0.3, Wd / 2 - 0.1], [-L * 0.3, Wd / 2 - 0.1], [L * 0.3, -Wd / 2 + 0.1], [-L * 0.3, -Wd / 2 + 0.1]]) wheel(x, z, 0.37, 0.26, x > 0);
    ly = 0.7;
  } else {
    const sport = type === 'sport';
    const pts = sport ? [[-L / 2, 0.3], [-L / 2, 0.74], [-L * 0.3, 0.82], [L * 0.2, 0.82], [L / 2 - 0.1, 0.6], [L / 2, 0.42], [L / 2, 0.3]] : SEDAN(L);
    add(extrude('body' + type, pts, Wd, 0.12, { len: L, plan: sport ? 0.16 : 0.11, tum: 0.07, y0: 0.45, y1: 0.95 }), paint);
    const cab = sport ? [[-L * 0.2, 0.82], [-L * 0.08, 1.22], [L * 0.1, 1.22], [L * 0.26, 0.85]] : SEDAN_CAB(L);
    add(extrude('cab' + type, cab, Wd * (sport ? 0.86 : 0.9), 0.07, { len: L * 0.6, cx: 0, plan: 0.05, tum: 0.24, y0: 0.9, y1: sport ? 1.22 : 1.42 }), M.glass, 0, 0, 0, false);
    const rx = sport ? [-L * 0.075, L * 0.09] : [-L * 0.155, L * 0.08];
    add(boxG(rx[1] - rx[0], 0.06, Wd * (sport ? 0.64 : 0.68)), paint, (rx[0] + rx[1]) / 2, sport ? 1.235 : 1.435, 0);
    for (const s of [-1, 1]) add(boxG(0.09, sport ? 0.34 : 0.5, 0.03), paint, -L * 0.035, sport ? 1.04 : 1.17, s * Wd * (sport ? 0.385 : 0.4), false); // B-pillars
    for (const [x, z] of [[L * 0.31, Wd / 2 - 0.12], [-L * 0.3, Wd / 2 - 0.12], [L * 0.31, -Wd / 2 + 0.12], [-L * 0.3, -Wd / 2 + 0.12]]) wheel(x, z, sport ? 0.34 : 0.33, sport ? 0.3 : 0.24, x > 0);
    if (sport) { add(boxG(0.5, 0.06, Wd * 0.95), paint, -L / 2 + 0.2, 1.08, 0); add(boxG(0.08, 0.3, 0.08), M.trim, -L / 2 + 0.2, 0.9, Wd * 0.35, false); add(boxG(0.08, 0.3, 0.08), M.trim, -L / 2 + 0.2, 0.9, -Wd * 0.35, false); add(boxG(L * 0.5, 0.02, 0.18), M.white, 0.2, 0.93, 0, false); }
    if (type === 'taxi') { add(boxG(0.7, 0.22, 0.34), M.yellow, -0.2, 1.57, 0, false); const st = add(boxG(L * 0.9, 0.1, Wd + 0.02), M.trim, 0, 0.62, 0, false); st.visible = true; }
    if (type === 'cop') {
      add(boxG(L * 0.46, 0.55, Wd + 0.02), M.trim, -0.1, 0.62, 0, false);
      add(boxG(0.28, 0.14, Wd * 0.4), SIR_R, -0.1, 1.5, Wd * 0.2); add(boxG(0.28, 0.14, Wd * 0.4), SIR_B, -0.1, 1.5, -Wd * 0.2);
    }
  }
  // bumpers, grille, mirrors, plates, door seams
  const hz = type === 'truck' ? 0.62 : 0.45;
  add(boxG(0.3, 0.26, Wd * 0.98), M.trim, L / 2 - 0.1, hz, 0); add(boxG(0.3, 0.26, Wd * 0.98), M.trim, -L / 2 + 0.1, hz, 0);
  add(boxG(0.05, 0.05, Wd * 0.78), M.chrome, L / 2 + 0.05, hz + 0.05, 0, false); add(boxG(0.05, 0.05, Wd * 0.78), M.chrome, -L / 2 - 0.05, hz + 0.05, 0, false);
  add(boxG(0.03, 0.13, 0.42), M.plate, L / 2 + 0.06, hz - 0.06, 0, false); add(boxG(0.03, 0.13, 0.42), M.plate, -L / 2 - 0.06, hz - 0.06, 0, false);
  if (type !== 'truck') add(boxG(0.05, 0.16, Wd * 0.46), M.trim, L / 2 + 0.01, hz + 0.28, 0, false);
  const my = type === 'van' ? 1.35 : type === 'truck' ? 2.0 : type === 'sport' ? 0.92 : 1.0, mx = type === 'truck' ? L / 2 - 1.1 : L * 0.16;
  for (const s of [-1, 1]) { add(boxG(0.16, 0.12, 0.2), paint, mx, my, s * (Wd / 2 + 0.12), false); add(boxG(0.03, 0.4, 0.015), M.trim, type === 'truck' ? L / 2 - 2.2 : L * 0.06, my - 0.4, s * (Wd / 2 + 0.005), false); if (type !== 'truck') add(boxG(0.03, 0.4, 0.015), M.trim, -L * 0.2, my - 0.4, s * (Wd / 2 + 0.005), false); add(boxG(L * 0.62, 0.05, 0.04), M.trim, 0, 0.3, s * (Wd / 2 - 0.02), false); }
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8).rotateZ(Math.PI / 2), M.chrome, -L / 2 - 0.12, 0.3, Wd * 0.3, false);
  // lights
  for (const s of [-1, 1]) {
    add(boxG(0.14, 0.2, 0.46), M.head, lightsX - 0.05, ly, s * lz); add(boxG(0.03, 0.22, 0.5), M.lens, lightsX + 0.03, ly, s * lz);
    add(boxG(0.1, 0.2, 0.42), M.tailDim, tailX + 0.04, ly + (type === 'sport' ? 0.05 : 0.08), s * lz);
  }
  return { parts, wheelSpecs };
}

// Collapse every part into one geometry per material -> a handful of draw calls per vehicle.
function bake(parts) {
  const buckets = new Map();
  for (const m of parts) {
    m.updateMatrix(); let g = m.geometry.clone(); if (g.index) g = g.toNonIndexed(); g.applyMatrix4(m.matrix);
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
    if (!buckets.has(m.material)) buckets.set(m.material, []); buckets.get(m.material).push(g);
  }
  return [...buckets].map(([mat, gs]) => ({ mat, geo: mergeGeometries(gs) }));
}
function wheelGeos(r, wd) {
  const k = `${r},${wd}`; if (wheelCache[k]) return wheelCache[k];
  const tire = [new THREE.CylinderGeometry(r, r, wd, 20).rotateX(Math.PI / 2).toNonIndexed()];
  for (let i = 0; i < 5; i++) tire.push(boxG(r * 1.2, r * 0.13, wd + 0.05).clone().rotateZ((i * Math.PI) / 5).toNonIndexed());
  const hub = [new THREE.CylinderGeometry(r * 0.68, r * 0.68, wd + 0.03, 20).rotateX(Math.PI / 2).toNonIndexed(), new THREE.CylinderGeometry(r * 0.16, r * 0.16, wd + 0.07, 10).rotateX(Math.PI / 2).toNonIndexed()];
  const strip = (gs) => gs.map((g) => { for (const n of Object.keys(g.attributes)) if (n !== 'position' && n !== 'normal' && n !== 'uv') g.deleteAttribute(n); return g; });
  return (wheelCache[k] = { tire: mergeGeometries(strip(tire)), hub: mergeGeometries(strip(hub)) });
}

export function buildCarModel(type, colorHex) {
  beamTex ||= beamTexture(); glowTex ||= glowTexture(); blobTex ||= blobShadowTexture();
  const def = TYPES[type], L = def.len, Wd = def.wid, root = new THREE.Group(), body = new THREE.Group();
  root.rotation.order = 'YZX'; root.add(body);
  const cached = modelCache[type] ||= (() => { const a = assemble(type); return { buckets: bake(a.parts), wheelSpecs: a.wheelSpecs }; })();
  const paint = new THREE.MeshPhysicalMaterial({ color: colorHex, metalness: 0.2, roughness: 0.45, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.0 });
  const mats = { paint, tails: [], sirens: [] };
  let rm = null, bm = null;
  if (type === 'cop') {
    rm = new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff0000, emissiveIntensity: 0.3 }); bm = new THREE.MeshStandardMaterial({ color: 0x2233ff, emissive: 0x2244ff, emissiveIntensity: 0.3 });
    mats.sirens = [rm, bm];
  }
  for (const bk of cached.buckets) {
    const mesh = new THREE.Mesh(bk.geo, bk.mat === PAINT ? paint : bk.mat === SIR_R ? rm : bk.mat === SIR_B ? bm : bk.mat);
    mesh.castShadow = bk.mat !== M.glass && bk.mat !== M.plate; body.add(mesh);
    if (bk.mat === M.tailDim) mats.tails.push(mesh);
  }
  const wheels = [], steer = [];
  for (const w of cached.wheelSpecs) {
    const grp = new THREE.Group(); grp.position.set(w.x, w.r, w.z);
    const g = wheelGeos(w.r, w.wd), spin = new THREE.Group(), tire = new THREE.Mesh(g.tire, M.tire);
    spin.add(tire, new THREE.Mesh(g.hub, M.hub)); grp.add(spin); body.add(grp); wheels.push({ spin, r: w.r }); if (w.front) steer.push(grp);
  }
  // contact shadow
  blobGeo ||= new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  blobMat ||= new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const blob = new THREE.Mesh(blobGeo, blobMat);
  blob.scale.set(L * 1.35, 1, Wd * 1.55); blob.position.y = 0.06; blob.userData.noAO = true; root.add(blob);
  // night beams
  beamMat ||= new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, polygonOffset: true, polygonOffsetFactor: -6 });
  const beam = new THREE.Mesh(beamGeo ||= new THREE.PlaneGeometry(9, 18).rotateZ(-Math.PI / 2).rotateX(-Math.PI / 2).translate(10.5, 0, 0), beamMat);
  beam.position.set(L / 2 - 0.5, 0.09, 0); beam.visible = false; beam.userData.noAO = true; root.add(beam);
  return { root, body, paint, mats, wheels, steer, beam, def };
}

/* ---------- vehicle entity ---------- */
let carId = 0;
export class Car {
  constructor(type, x, z, a, color) {
    const def = TYPES[type];
    this.id = ++carId; this.type = type; this.def = def; this.x = x; this.z = z; this.a = a; this.y = 0; this.vy = 0; this.vx = 0; this.vz = 0;
    this.hp = def.hp; this.ai = false; this.mode = 'cruise'; this.dir = 0; this.turnTo = null; this.corner = null; this.lastI = -1;
    this.dead = false; this.burn = 0; this.thr = 0; this.steer = 0; this.hb = false; this.drv = null; this.spd = rand(10, 16);
    this.blk = 0; this.stk = 0; this.rev = 0; this.fw = 0; this.los = true; this.losT = 0; this.direct = false; this.siren = false;
    this.steerVis = 0; this.accel = 0; this.horn = 0; this.braking = false; this.smokeT = 0;
    this.col = color ?? (type === 'taxi' ? 0xf2c200 : type === 'cop' ? 0xf2f2f2 : CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]);
    this.model = buildCarModel(type, this.col);
    this.obj = this.model.root;
    const r = def.wid / 2 + 0.1, n = Math.max(2, Math.ceil(def.len / (2 * r))), span = def.len / 2 - r;
    this.rad = r; this.offs = Array.from({ length: n }, (_, k) => -span + (2 * span * k) / (n - 1));
    this.obj.position.set(x, 0, z); this.obj.rotation.y = -a;
    G.scene.add(this.obj);
    for (const m of this.obj.children[0].children) m.matrixAutoUpdate = true;
  }
  dispose() {
    G.scene.remove(this.obj);
    this.model.paint.dispose();
    for (const m of this.model.mats.sirens) m.dispose();
  }
}

export function damageCar(c, d, by) {
  if (c.dead || d <= 0 || (G.cheats.god && c === G.player.car)) return;
  c.hp -= d;
  const f = clamp(c.hp / c.def.hp, 0, 1);
  c.model.paint.color.setHex(c.col).lerp(new THREE.Color(0x1a1a1a), (1 - f) * 0.55);
  if (c.hp <= 0) wreck(c, by);
}

export function wreck(c, by) {
  c.dead = true; c.burn = 0; c.hp = 0; c.ai = false; c.thr = 0; c.siren = false;
  if (by === 'p') G.stats.wrecks = (G.stats.wrecks || 0) + 1;
  if (c.drv === 'civ' && by === 'p') G.police.crime(1, c.x, c.z);
  if (c.type === 'cop' && by === 'p') G.police.crime(3, c.x, c.z, true);
  c.drv = null;
  c.model.paint.color.setHex(0x161616); c.model.paint.metalness = 0.2;
  c.vy = 5 + Math.random() * 3; c.tiltZ = rand(-0.25, 0.25); c.tiltX = rand(-0.3, 0.3);
  if (c.onWreck) c.onWreck(by);
  const wasP = G.player.car === c;
  G.combat.explode(c.x, c.y + 1.0, c.z, 9, 75, by);
  if (wasP) { G.player.exitCar(true); G.player.hurt(55); }
}

/* ---------- physics ---------- */
export function stepCar(c, dt) {
  const t = c.def, city = G.city, ca = Math.cos(c.a), sa = Math.sin(c.a);
  let fw = c.vx * ca + c.vz * sa, lat = -c.vx * sa + c.vz * ca;
  const prevFw = fw, thr = c.dead ? 0 : c.thr;
  if (thr > 0) { if (fw < t.max) fw += thr * t.acc * dt; }
  else if (thr < 0) { if (fw > 0.3) fw += thr * t.brake * dt; else if (fw > -t.max * 0.3) fw += thr * t.acc * 0.55 * dt; }
  fw -= fw * t.drag * dt;
  if (thr === 0) fw -= Math.sign(fw) * Math.min(Math.abs(fw), 5 * dt);
  lat -= lat * Math.min(1, (c.hb ? 1.1 : t.grip) * dt);
  if (c.hb) fw -= fw * 1.2 * dt;
  const sp = Math.abs(fw);
  if (!c.dead) {
    const ang = c.steer * Math.min(1, sp / 7) * (1 - Math.min(0.5, (sp / t.max) * 0.45)) * t.turn * (c.hb ? 1.5 : 1);
    c.a += ang * dt * (fw < -0.1 ? -1 : 1);
  }
  c.vx = ca * fw - sa * lat; c.vz = sa * fw + ca * lat;
  c.x += c.vx * dt; c.z += c.vz * dt;
  c.x = clamp(c.x, -31, 1231); c.z = clamp(c.z, -31, 1231);
  c.fw = c.vx * Math.cos(c.a) + c.vz * Math.sin(c.a);
  c.accel += ((c.fw - prevFw) / Math.max(dt, 1e-3) - c.accel) * Math.min(1, dt * 6);
  c.braking = thr < 0 && c.fw > 1;

  // walls & props
  for (let it = 0; it < 2; it++) for (const o of c.offs) {
    const cx = c.x + Math.cos(c.a) * o, cz = c.z + Math.sin(c.a) * o, rs = city.nearRects(cx, cz);
    for (let k = 0; k < rs.length; k++) {
      const r = rs[k];
      if (r.h < 0.4 || c.y + c.def.h <= (r.y0 || 0) || c.y >= r.h - 0.3 || !circRect(cx, cz, c.rad, r)) continue;
      if (r.brk && Math.abs(c.fw) > 4) { city.breakProp(r); c.vx *= 0.9; c.vz *= 0.9; continue; }
      c.x += hit.nx * hit.d; c.z += hit.nz * hit.d;
      const vn = c.vx * hit.nx + c.vz * hit.nz;
      if (vn < 0) {
        const imp = -vn;
        c.vx -= 1.3 * vn * hit.nx; c.vz -= 1.3 * vn * hit.nz; c.vx *= 0.93; c.vz *= 0.93;
        if (imp > 8.5) {
          damageCar(c, (imp - 8.5) * 2.1, c === G.player.car ? 'p' : 'w');
          G.audio.crash(c.x, c.z, imp);
          G.fx.spark(cx, c.y + 0.8, cz, 7);
          if (c === G.player.car) G.fx.shake = Math.min(1, G.fx.shake + imp / 30);
        }
      }
    }
  }
  // hop / gravity (explosions toss cars)
  const sy = city.surfaceY(c.x, c.z, c.y);
  if (c.y > sy + 0.02 && c.y - sy < 0.45 && c.vy <= 0.5) { c.y = sy; c.vy = 0; } // glide down ramps
  else if (c.y > sy + 0.02 || c.vy > 0) { c.vy -= 22 * dt; c.y += c.vy * dt; if (c.y <= sy) { c.y = sy; c.vy = Math.abs(c.vy) > 4 ? -c.vy * 0.3 : 0; } }
  else { c.y = sy; c.vy = 0; }

  // damage smoke/fire
  if (!c.dead && c.hp < c.def.hp * 0.4) {
    c.smokeT -= dt;
    if (c.smokeT <= 0) {
      c.smokeT = c.hp < c.def.hp * 0.2 ? 0.05 : 0.12;
      const fx = c.x + Math.cos(c.a) * c.def.len * 0.32, fz = c.z + Math.sin(c.a) * c.def.len * 0.32;
      if (c.hp < c.def.hp * 0.2) G.fx.fire(fx, c.y + 1.1, fz, 0.9);
      G.fx.smoke(fx, c.y + 1.2, fz, 1.0, 1.8, c.hp < c.def.hp * 0.2 ? 0.08 : 0.35);
    }
    if (c.hp < c.def.hp * 0.12) damageCar(c, dt * 6, 'w'); // burning engines eventually blow
  }
  if (c.dead) {
    c.burn += dt; c.smokeT -= dt;
    if (c.smokeT <= 0) { c.smokeT = 0.05; G.fx.fire(c.x + rand(-1, 1), c.y + 0.9, c.z + rand(-1, 1), 1.4); if (Math.random() < 0.5) G.fx.smoke(c.x, c.y + 1.6, c.z, 1.8, 2.8, 0.07); }
  }
  if (!c.dead && Math.abs(c.fw) > 3.5 && c.y < 1.5) G.peds.carSweep(c);
}

export function carPairs(cars) {
  for (let i = 0; i < cars.length; i++) {
    const a = cars[i];
    for (let j = i + 1; j < cars.length; j++) {
      const b = cars[j], rr = a.def.len / 2 + b.def.len / 2;
      if (Math.abs(a.x - b.x) > rr || Math.abs(a.z - b.z) > rr || Math.abs(a.y - b.y) > 3) continue;
      for (const oa of a.offs) for (const ob of b.offs) {
        const ax = a.x + Math.cos(a.a) * oa, az = a.z + Math.sin(a.a) * oa, bx = b.x + Math.cos(b.a) * ob, bz = b.z + Math.sin(b.a) * ob;
        const dx = ax - bx, dz = az - bz, d = Math.hypot(dx, dz), mn = a.rad + b.rad;
        if (d >= mn || d < 0.01) continue;
        const nx = dx / d, nz = dz / d, pen = mn - d, m1 = a.def.mass, m2 = b.def.mass, w1 = m2 / (m1 + m2);
        a.x += nx * pen * w1; a.z += nz * pen * w1; b.x -= nx * pen * (1 - w1); b.z -= nz * pen * (1 - w1);
        const rel = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
        if (rel < 0) {
          const j2 = (-1.25 * rel) / (1 / m1 + 1 / m2);
          a.vx += (j2 * nx) / m1; a.vz += (j2 * nz) / m1; b.vx -= (j2 * nx) / m2; b.vz -= (j2 * nz) / m2;
          if (-rel > 7.5) {
            const dm = (-rel - 7.5) * 1.7;
            damageCar(a, (dm * m2) / (m1 + m2) * 1.4, b === G.player.car ? 'p' : 'w');
            damageCar(b, (dm * m1) / (m1 + m2) * 1.4, a === G.player.car ? 'p' : 'w');
            G.audio.crash(a.x, a.z, -rel); G.fx.spark((ax + bx) / 2, 0.8, (az + bz) / 2, 6);
            if (a === G.player.car || b === G.player.car) G.fx.shake = Math.min(1, G.fx.shake + -rel / 28);
          }
        }
      }
    }
  }
}

// Push physics state into the Three.js object (called every frame).
export function syncCar(c, dt, night, time) {
  const o = c.obj, m = c.model;
  const pl = G.player, far = Math.abs(c.x - pl.x) > 270 || Math.abs(c.z - pl.z) > 270; o.visible = !far; if (far) return;
  o.position.set(c.x, c.y, c.z); o.rotation.y = -c.a;
  const ca = Math.cos(c.a), sa = Math.sin(c.a), lat = -c.vx * sa + c.vz * ca;
  if (c.dead) { o.rotation.z += (c.tiltZ - o.rotation.z) * Math.min(1, dt * 3); o.rotation.x += (c.tiltX - o.rotation.x) * Math.min(1, dt * 3); }
  else {
    const ca2 = Math.cos(c.a), sa2 = Math.sin(c.a), slope = c.y > 0.05 || c.x < 120 || c.x > 1080 ? Math.atan2(viaductSurface(c.x + ca2 * 2.2, c.z + sa2 * 2.2) - viaductSurface(c.x - ca2 * 2.2, c.z - sa2 * 2.2), 4.4) : 0;
    const pitch = clamp(c.accel * 0.0035, -0.05, 0.05) + (c.y > 0.05 || Math.abs(slope) < 0.2 ? slope : 0), roll = clamp(lat * 0.018, -0.1, 0.1) - c.steer * Math.min(1, Math.abs(c.fw) / 20) * 0.045;
    o.rotation.z += (pitch - o.rotation.z) * Math.min(1, dt * 8); o.rotation.x += (roll - o.rotation.x) * Math.min(1, dt * 8);
  }
  c.steerVis += (c.steer - c.steerVis) * Math.min(1, dt * 10);
  for (const s of m.steer) s.rotation.y = -c.steerVis * 0.5;
  for (const w of m.wheels) w.spin.rotation.z -= (c.fw * dt) / w.r;
  const braking = c.braking && !c.dead;
  for (const t of m.mats.tails) t.material = braking ? M.tailOn : M.tailDim;
  M.head.emissiveIntensity = 0.4 + night * 3;
  const lit = night > 0.15 && !c.dead && (c.drv != null);
  m.beam.visible = lit; if (lit) beamMat.opacity = night * 0.7;
  if (m.mats.sirens.length) {
    const on = c.siren && !c.dead, ph = Math.floor(time * 7) % 2;
    m.mats.sirens[0].emissiveIntensity = on ? (ph ? 5 : 0.2) : 0.3; m.mats.sirens[1].emissiveIntensity = on ? (ph ? 0.2 : 5) : 0.3;
  }
}
