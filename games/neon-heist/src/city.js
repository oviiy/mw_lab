import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { B, R, N, W, makeRng } from './util.js';
import { G } from './state.js';
import * as D from './districts.js';
import { buildViaduct, viaductSurface, VD } from './viaduct.js';
import { patchMaterial, FX } from './shaderfx.js';
import { Signals } from './signals.js';
import { facadeSet, shopTexture, roadTextures, crosswalkTexture, sidewalkSet, grassSet, roofSet, leafTexture, barkSet, glowTexture } from './textures.js';

/* ---------- merged-geometry builder ---------- */
export class Geo {
  constructor() { this.p = []; this.n = []; this.u = []; this.c = []; this.i = []; }
  quad(a, b, c, d, n, uvs, col) {
    const o = this.p.length / 3;
    for (const v of [a, b, c, d]) { this.p.push(v[0], v[1], v[2]); this.n.push(n[0], n[1], n[2]); this.c.push(col.r, col.g, col.b); }
    this.u.push(...uvs);
    this.i.push(o, o + 1, o + 2, o, o + 2, o + 3);
  }
  // Axis-aligned box. Sides are UV-mapped in metres (su/sv per metre) so window
  // tiles keep a constant real-world size on every building.
  box(x0, y0, z0, x1, y1, z1, col, o = {}) {
    const su = o.su ?? 1 / 32, sv = o.sv ?? 1 / 28, uo = o.uo ?? 0, vo = o.vo ?? 0, tsu = o.tsu ?? su;
    const v0 = vo + y0 * sv, v1 = vo + y1 * sv;
    if (!o.noSides) {
      let L = o.snap ? Math.max(1, Math.round((z1 - z0) / 4)) / 8 : (z1 - z0) * su;
      this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], [uo, v0, uo + L, v0, uo + L, v1, uo, v1], col);
      this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], [uo, v0, uo + L, v0, uo + L, v1, uo, v1], col);
      L = o.snap ? Math.max(1, Math.round((x1 - x0) / 4)) / 8 : (x1 - x0) * su;
      this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], [uo, v0, uo + L, v0, uo + L, v1, uo, v1], col);
      this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], [uo, v0, uo + L, v0, uo + L, v1, uo, v1], col);
    }
    if (!o.noTop) this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], [x0 * tsu, z1 * tsu, x1 * tsu, z1 * tsu, x1 * tsu, z0 * tsu, x0 * tsu, z0 * tsu], col);
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setIndex(this.i);
    g.computeBoundingSphere();
    return g;
  }
}

/* ---------- collision primitives (circle vs axis-aligned rect, XZ plane) ---------- */
export const hit = { nx: 0, nz: 0, d: 0 };
export function circRect(x, z, rad, b) {
  const px = x < b.x ? b.x : x > b.x + b.w ? b.x + b.w : x, pz = z < b.z ? b.z : z > b.z + b.d ? b.z + b.d : z;
  const dx = x - px, dz = z - pz, d2 = dx * dx + dz * dz;
  if (d2 >= rad * rad) return false;
  if (d2 < 1e-9) {
    const l = x - b.x, r = b.x + b.w - x, t = z - b.z, bt = b.z + b.d - z, m = Math.min(l, r, t, bt);
    if (m === l) { hit.nx = -1; hit.nz = 0; hit.d = rad + l; } else if (m === r) { hit.nx = 1; hit.nz = 0; hit.d = rad + r; }
    else if (m === t) { hit.nx = 0; hit.nz = -1; hit.d = rad + t; } else { hit.nx = 0; hit.nz = 1; hit.d = rad + bt; }
    return true;
  }
  const d = Math.sqrt(d2);
  hit.nx = dx / d; hit.nz = dz / d; hit.d = rad - d;
  return true;
}

const EMPTY = [];
const SPECIAL = { '4,8': 'ramp', '2,3': 'hospital', '6,2': 'police', '3,6': 'gas', '7,3': 'gas', '1,6': 'sport', '5,6': 'plaza', '2,7': 'parking', '6,4': 'parking', '8,1': 'lake', '3,2': 'park', '6,7': 'park', '7,5': 'spray', '4,1': 'park' };
const SPECIAL_SHOPS = { '4,4': 'bar', '4,2': 'ammu', '5,3': 'burger', '3,4': 'clothes', '6,5': 'apartment', '4,7': 'store' };

// Crossed leaf quads scattered through a sphere, normals pointing outward for soft canopy shading.
function crownGeometry(rng) {
  const pos = [], nor = [], uv = [], idx = [], v = new THREE.Vector3(), t = new THREE.Vector3(), b = new THREE.Vector3(), n = new THREE.Vector3(), c = new THREE.Vector3(), o = new THREE.Vector3();
  for (let q = 0; q < 22; q++) {
    c.set(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1); if (c.length() > 1) { q--; continue; } c.multiply(new THREE.Vector3(0.85, 0.7, 0.85)).y += 0.15;
    n.set(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize(); t.set(rng() - 0.5, rng() - 0.5, rng() - 0.5).cross(n).normalize(); b.crossVectors(n, t);
    const s = 1.2 + rng() * 0.8, base = pos.length / 3;
    for (const [a, d] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      v.copy(c).addScaledVector(t, a * s).addScaledVector(b, d * s); pos.push(v.x, v.y, v.z);
      o.copy(v).sub(new THREE.Vector3(0, -0.1, 0)).normalize().multiplyScalar(0.85).addScaledVector(n, 0.15 * Math.sign(n.dot(o.copy(v)) || 1)).normalize(); nor.push(o.x, o.y, o.z);
      uv.push((a + 1) / 2, (d + 1) / 2);
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  return g;
}

export class City {
  constructor(scene, seed = 20260924) {
    this.scene = scene;
    this.blocks = [];
    this.lamps = [];
    this._nr = [];
    const rng = this.rng = makeRng(seed);
    this.billboards = [];
    this.fac = facadeSet(rng);
    this.shop = shopTexture(rng);
    this.rt = roadTextures(rng);
    this.sidewalk = sidewalkSet(rng);
    this.grass = grassSet(rng);
    this.roofT = roofSet(rng);
    this.generate(rng);
    this.build(rng);
    this.furniture(rng);
    this.signals = new Signals(scene, this);
    this.buildHash();
    this.buildMap();
  }

  /* ----- layout ----- */
  generate(rng) {
    const cEdge = (N - 1) / 2;
    for (let i = 0; i < N; i++) {
      this.blocks[i] = [];
      for (let j = 0; j < N; j++) {
        const x = i * B + R / 2, z = j * B + R / 2, s = B - R;
        const bk = { x, z, s, i, j, park: false, rects: [], blds: [], trees: [] };
        this.blocks[i][j] = bk;
        const dc = Math.hypot(i - cEdge, j - cEdge);
        bk.kind = this.kindFor(i, j, dc, rng); bk.park = bk.kind === 'park' || bk.kind === 'lake';
        if (bk.kind !== 'city') { if (bk.kind === 'house' || bk.kind === 'plaza') this.streetTrees(bk, rng); continue; }
        const ins = 5, ix = x + ins, iz = z + ins, is = s - 2 * ins, g = 5, lay = Math.floor(rng() * 5);
        const base = (13 + rng() * 22) * (1 + Math.max(0, 3.8 - dc) * 0.85);
        const add = (bx, bz, w, d) => {
          const h = 5.25 + Math.max(1, Math.round((Math.max(9, Math.min(165, base * (0.55 + rng() * 0.9))) - 5.25) / 3.5)) * 3.5; // whole floors
          const r = rng(), style = dc < 2.6 ? (r < 0.65 ? 0 : r < 0.9 ? 2 : 1) : dc < 4.5 ? (r < 0.35 ? 0 : r < 0.65 ? 2 : 1) : (r < 0.15 ? 0 : r < 0.45 ? 2 : 1);
          const col = style === 1 ? new THREE.Color().setHSL(0.04 + rng() * 0.06, 0.12, 0.8 + rng() * 0.2) : style === 0 ? new THREE.Color().setHSL(0.55, 0.12, 0.88 + rng() * 0.1) : new THREE.Color().setHSL(0.1, 0.05, 0.82 + rng() * 0.16);
          const b = { x: bx, z: bz, w, d, h, col, style, uo: Math.floor(rng() * 8), tiers: h > 46 && w > 26 && d > 26 };
          bk.blds.push(b); bk.rects.push({ x: bx, z: bz, w, d, h });
        };
        if (lay === 0) add(ix, iz, is, is);
        else if (lay === 1) { const w1 = is * (0.35 + rng() * 0.3); add(ix, iz, w1 - g / 2, is); add(ix + w1 + g / 2, iz, is - w1 - g / 2, is); }
        else if (lay === 2) { const d1 = is * (0.35 + rng() * 0.3); add(ix, iz, is, d1 - g / 2); add(ix, iz + d1 + g / 2, is, is - d1 - g / 2); }
        else if (lay === 3) { const a = is / 2 - g / 2; add(ix, iz, a, a); add(ix + a + g, iz, a, a); add(ix, iz + a + g, a, a); add(ix + a + g, iz + a + g, a, a); }
        else { const d1 = is * 0.58; add(ix, iz, is, d1 - g / 2); const a = is / 2 - g / 2; add(ix, iz + d1 + g / 2, a, is - d1 - g / 2); add(ix + a + g, iz + d1 + g / 2, a, is - d1 - g / 2); }
        const sp = SPECIAL_SHOPS[`${i},${j}`];
        if (sp && bk.blds.length) { // pick the lot closest to the street and turn it into an enterable shop
          let best = null, bd = 1e9;
          for (const b of bk.blds) { const d = Math.min(b.x - bk.x, bk.x + bk.s - (b.x + b.w), b.z - bk.z, bk.z + bk.s - (b.z + b.d)); if (d < bd) { bd = d; best = b; } }
          best.special = sp; best.style = 1; best.tiers = false; best.h = Math.min(best.h, sp === 'apartment' ? 42 : 22); best.col = new THREE.Color().setHSL(0.05, 0.12, 0.86);
          const r = bk.rects.find((q) => q.x === best.x && q.z === best.z); if (r) r.h = best.h;
        }
        this.streetTrees(bk, rng);
      }
    }
    // lamp posts at every intersection corner
    for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const x = i * B + sx * (R / 2 + 1), z = j * B + sz * (R / 2 + 1);
      const bi = Math.floor(x / B), bj = Math.floor(z / B);
      if (bi < 0 || bj < 0 || bi >= N || bj >= N) continue;
      this.lamps.push({ x, z });
      this.blocks[bi][bj].rects.push({ x: x - 0.3, z: z - 0.3, w: 0.6, d: 0.6, h: 8 });
    }
    // one more lamp per road segment, mid-block, alternating sides (skips the cross streets under the Skyway)
    for (let k = 0; k <= N; k++) for (let i = 0; i < N; i++) for (const horiz of [true, false]) {
      if (!horiz && i === 8) continue;
      const sd = (i + k) % 2 ? 1 : -1, along = i * B + 74, across = k * B + sd * (R / 2 + 1);
      if (across < 0 || across > W) continue;
      const x = horiz ? along : across, z = horiz ? across : along;
      this.lamps.push({ x, z, ang: horiz ? (sd > 0 ? -Math.PI / 2 : Math.PI / 2) : (sd > 0 ? Math.PI : 0) });
      this.blocks[Math.floor(x / B)][Math.floor(z / B)].rects.push({ x: x - 0.3, z: z - 0.3, w: 0.6, d: 0.6, h: 8 });
    }
  }

  kindFor(i, j, dc, rng) {
    const sp = SPECIAL[`${i},${j}`]; if (sp) return sp;
    if (j === 8) return i === 0 || i === 9 ? 'ramp' : 'under';
    if (i >= 7 && j >= 6) return 'industrial';
    if (i >= 8 && j <= 2) return 'park';
    if (i <= 1 || j <= 1) return 'house';
    const r = rng();
    if (dc > 2.6 && r < 0.07) return 'park';
    if (dc > 2.6 && r < 0.11) return 'parking';
    return 'city';
  }

  streetTrees(bk, rng) {
    const { x, z, s } = bk;
    for (let side = 0; side < 4; side++) for (const t of [0.22, 0.5, 0.78]) {
      if (rng() < 0.3) continue;
      const px = side === 0 ? x + s * t : side === 1 ? x + s - 1.4 : side === 2 ? x + s * t : x + 1.4;
      const pz = side === 0 ? z + 1.4 : side === 1 ? z + s * t : side === 2 ? z + s - 1.4 : z + s * t;
      bk.trees.push({ x: px, z: pz, r: 1.5 + rng() * 0.8, street: true });
    }
  }

  buildKind(bk, ctx) {
    const f = { house: D.houses, industrial: D.industrial, plaza: D.plaza, parking: D.parking, gas: D.gasStation, sport: D.sports, hospital: D.hospital, police: D.police, spray: D.spray };
    if (f[bk.kind]) f[bk.kind](bk, ctx);
    else if (bk.kind === 'under') D.parking(bk, ctx, 0.3);
    else if (bk.kind === 'park') D.park(bk, ctx, false);
    else if (bk.kind === 'lake') D.park(bk, ctx, true);
    else if (bk.kind === 'ramp') ctx.park.box(bk.x + 4, 0.25, bk.z + 4, bk.x + bk.s - 4, 0.3, bk.z + bk.s - 4, ctx.white, { noSides: true, tsu: 1 / 4 });
  }

  /* ----- meshes ----- */
  build(rng) {
    const scene = this.scene, SH = 4.8, TOP = SH + 0.45;
    const walls = [new Geo(), new Geo(), new Geo()], aoG = new Geo(), shops = new Geo(), roofs = new Geo(), slabs = new Geo(), park = new Geo(), roads = new Geo(), inter = new Geo(), cw = new Geo(), paint = new Geo();
    const white = new THREE.Color(1, 1, 1), conc = new THREE.Color(0.62, 0.61, 0.58);
    const RB = (x0, y0, z0, x1, y1, z1, col, o = {}) => roofs.box(x0, y0, z0, x1, y1, z1, col, { su: 0.25, sv: 0.25, tsu: 0.25, ...o });

    const ctx = {
      rng, scene, walls, shops, roofs, slabs, park, inter, roads, paint, water: new Geo(), white, RB, lamps: this.lamps,
      parked: [], pois: [], doors: [], markers: [], signMats: [], floods: [], benches: [], signs: [],
      bench(bk, x, z, ry) { this.benches.push({ x, z, ry }); bk.rects.push({ x: x - 0.9, z: z - 0.9, w: 1.8, d: 1.8, h: 1, y0: 0 }); },
      geoTank: new THREE.CylinderGeometry(5, 5, 10.6, 20), matTank: new THREE.MeshStandardMaterial({ color: 0xd7dadd, metalness: 0.6, roughness: 0.4 }),
      geoStack: new THREE.CylinderGeometry(1.1, 1.5, 30, 10), matStack: new THREE.MeshStandardMaterial({ color: 0xc8c8c4, roughness: 0.7 }),
    };
    this.ctx = ctx;
    for (const row of this.blocks) for (const bk of row) {
      slabs.box(bk.x, 0, bk.z, bk.x + bk.s, 0.25, bk.z + bk.s, white, { su: 1 / 3, sv: 1 / 3, tsu: 1 / 3 });
      if (bk.kind !== 'city') { this.buildKind(bk, ctx); continue; }
      for (const b of bk.blds) {
        const g = walls[b.style], y0 = 0.25;
        { // soft contact shadow on the pavement around the footprint (fake ambient occlusion)
          const e = 3.2, y = 0.27, X0 = b.x, X1 = b.x + b.w, Z0 = b.z, Z1 = b.z + b.d;
          aoG.quad([X1, y, Z0], [X1, y, Z1], [X1 + e, y, Z1], [X1 + e, y, Z0], [0, 1, 0], [0, 0, 0, 1, 1, 1, 1, 0], white);
          aoG.quad([X0, y, Z1], [X0, y, Z0], [X0 - e, y, Z0], [X0 - e, y, Z1], [0, 1, 0], [0, 0, 0, 1, 1, 1, 1, 0], white);
          aoG.quad([X1, y, Z1], [X0, y, Z1], [X0, y, Z1 + e], [X1, y, Z1 + e], [0, 1, 0], [0, 0, 0, 1, 1, 1, 1, 0], white);
          aoG.quad([X0, y, Z0], [X1, y, Z0], [X1, y, Z0 - e], [X0, y, Z0 - e], [0, 1, 0], [0, 0, 0, 1, 1, 1, 1, 0], white);
        }
        shops.box(b.x, y0, b.z, b.x + b.w, SH, b.z + b.d, white, { su: 1 / 16, sv: 1 / 4.55, vo: -y0 / 4.55, uo: b.uo / 8, noTop: true });
        RB(b.x - 0.3, SH, b.z - 0.3, b.x + b.w + 0.3, TOP, b.z + b.d + 0.3, conc);
        const h1 = b.tiers ? TOP + Math.round((b.h * 0.62 - TOP) / 3.5) * 3.5 : b.h, sv = 1 / 28, vo = -TOP * sv;
        g.box(b.x, TOP, b.z, b.x + b.w, h1, b.z + b.d, b.col, { uo: b.uo / 8, vo, noTop: b.tiers, snap: true });
        let top = h1, tx0 = b.x, tz0 = b.z, tx1 = b.x + b.w, tz1 = b.z + b.d;
        if (b.tiers) {
          const ins = 5 + rng() * 4; tx0 += ins; tz0 += ins; tx1 -= ins; tz1 -= ins;
          RB(b.x - 0.35, h1, b.z - 0.35, b.x + b.w + 0.35, h1 + 0.7, b.z + b.d + 0.35, conc);
          g.box(tx0, h1 + 0.7, tz0, tx1, b.h, tz1, b.col.clone().multiplyScalar(0.94), { uo: b.uo / 8 + 0.3, vo, snap: true });
          top = b.h;
        }
        const roofCol = new THREE.Color(0.55, 0.55, 0.56).lerp(b.col, 0.1);
        RB(tx0 - 0.4, top, tz0 - 0.4, tx1 + 0.4, top + 1.3, tz1 + 0.4, conc);                // parapet ring
        RB(tx0 + 0.3, top + 0.55, tz0 + 0.3, tx1 - 0.3, top + 0.95, tz1 - 0.3, roofCol, { noSides: true });
        const ac = 1 + Math.floor(rng() * 3);
        for (let k = 0; k < ac; k++) {
          const w = 2 + rng() * 3, d = 2 + rng() * 3, ax = tx0 + 2 + rng() * Math.max(1, tx1 - tx0 - w - 4), az = tz0 + 2 + rng() * Math.max(1, tz1 - tz0 - d - 4), hh = 1.4 + rng() * 1.6;
          RB(ax, top + 0.95, az, ax + w, top + 0.95 + hh, az + d, new THREE.Color(0.62, 0.64, 0.66));
          RB(ax + w * 0.2, top + 0.95 + hh, az + d * 0.2, ax + w * 0.8, top + 1.1 + hh, az + d * 0.8, new THREE.Color(0.2, 0.2, 0.22), { noSides: true });
        }
        if (b.h > 38 && rng() < 0.45) { const tx = tx0 + 2 + rng() * Math.max(1, tx1 - tx0 - 7), tz = tz0 + 2 + rng() * Math.max(1, tz1 - tz0 - 7); RB(tx, top + 0.95, tz, tx + 3.5, top + 4.5, tz + 3.5, new THREE.Color(0.35, 0.26, 0.2)); RB(tx - 0.2, top + 4.5, tz - 0.2, tx + 3.7, top + 5.3, tz + 3.7, new THREE.Color(0.3, 0.22, 0.17)); }
        if (b.h > 70) RB((tx0 + tx1) / 2 - 0.2, top + 0.95, (tz0 + tz1) / 2 - 0.2, (tx0 + tx1) / 2 + 0.2, top + 16, (tz0 + tz1) / 2 + 0.2, new THREE.Color(0.7, 0.18, 0.18));
        if (b.h > 55 && rng() < 0.3) this.billboards.push({ x: (tx0 + tx1) / 2, z: tz1 - 0.6, y: top + 0.95, w: Math.min(16, (tx1 - tx0) * 0.7) });
        if (b.special) D.addShop(ctx, bk, b, b.special);
      }
    }
    buildViaduct(this, ctx);
    // sea wall along the south and east edges of the city
    { const sw = new THREE.Color(0.6, 0.6, 0.58), e = W + R / 2 + 12;
      RB(-R / 2 - 12, -1, e, e + 3, 1.0, e + 3, sw); RB(e, -1, -R / 2 - 12, e + 3, 1.0, e, sw); }
    for (const row of this.blocks) for (const bk of row) for (const t of bk.trees) bk.rects.push({ x: t.x - 0.35, z: t.z - 0.35, w: 0.7, d: 0.7, h: 6, y0: 0 });

    // roads: asphalt strips, intersections, crosswalks, stop lines
    const strip = (x0, z0, x1, z1, horiz) => {
      if (horiz) roads.quad([x0, 0.02, z0], [x0, 0.02, z1], [x1, 0.02, z1], [x1, 0.02, z0], [0, 1, 0], [0, x0 / 22, 1, x0 / 22, 1, x1 / 22, 0, x1 / 22], white);
      else roads.quad([x0, 0.02, z0], [x0, 0.02, z1], [x1, 0.02, z1], [x1, 0.02, z0], [0, 1, 0], [0, z0 / 22, 0, z1 / 22, 1, z1 / 22, 1, z0 / 22], white);
    };
    for (let k = 0; k <= N; k++) for (let i = 0; i < N; i++) { // segments between junctions (junction squares are their own mesh)
      strip(i * B + R / 2, k * B - R / 2, (i + 1) * B - R / 2, k * B + R / 2, true); strip(k * B - R / 2, i * B + R / 2, k * B + R / 2, (i + 1) * B - R / 2, false);
    }
    const flat = (g, x0, z0, x1, z1, y, uv) => g.quad([x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0], [0, 1, 0], uv, white);
    for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
      const cx = i * B, cz = j * B, h = R / 2, y = 0.05;
      flat(inter, cx - h, cz - h, cx + h, cz + h, 0.035, [0, 0, 0, 1, 1, 1, 1, 0]);
      if (i > 0) { flat(cw, cx - h - 5.5, cz - h, cx - h - 1.5, cz + h, y, [0, 0, 1, 0, 1, 1, 0, 1]); flat(paint, cx - h - 7.4, cz + 0.8, cx - h - 6.6, cz + h - 0.5, y, [0, 0, 1, 0, 1, 1, 0, 1]); }
      if (i < N) { flat(cw, cx + h + 1.5, cz - h, cx + h + 5.5, cz + h, y, [0, 0, 1, 0, 1, 1, 0, 1]); flat(paint, cx + h + 6.6, cz - h + 0.5, cx + h + 7.4, cz - 0.8, y, [0, 0, 1, 0, 1, 1, 0, 1]); }
      if (j > 0) { flat(cw, cx - h, cz - h - 5.5, cx + h, cz - h - 1.5, y, [0, 0, 0, 1, 1, 1, 1, 0]); flat(paint, cx - h + 0.5, cz - h - 7.4, cx - 0.8, cz - h - 6.6, y, [0, 0, 0, 1, 1, 1, 1, 0]); }
      if (j < N) { flat(cw, cx - h, cz + h + 1.5, cx + h, cz + h + 5.5, y, [0, 0, 0, 1, 1, 1, 1, 0]); flat(paint, cx + 0.8, cz + h + 6.6, cx + h - 0.5, cz + h + 7.4, y, [0, 0, 0, 1, 1, 1, 1, 0]); }
    }

    const pbr = (t, o = {}) => new THREE.MeshStandardMaterial({ map: t.map, normalMap: t.normal, roughnessMap: t.orm, metalnessMap: t.orm, roughness: 1, metalness: 1, ...o });
    const mesh = (g, m, cast, recv) => { const o = new THREE.Mesh(g.geometry(), m); o.castShadow = cast; o.receiveShadow = recv; scene.add(o); return o; };
    this.litMats = [];
    const L = { lamps: true };
    walls.forEach((g, k) => { const m = patchMaterial(pbr(this.fac.variants[k], { vertexColors: true, envMapIntensity: 1.7, normalScale: new THREE.Vector2(1.1, 1.1) }), { lamps: true, windows: true }); mesh(g, m, true, true); });
    const shopM = patchMaterial(pbr(this.shop, { emissiveMap: this.shop.emissive, emissive: 0xffffff, emissiveIntensity: 0.15, normalScale: new THREE.Vector2(1, 1) }), L); this.shopMat = shopM; mesh(shops, shopM, true, true);
    mesh(roofs, new THREE.MeshStandardMaterial({ map: this.roofT.map, normalMap: this.roofT.normal, roughnessMap: this.roofT.orm, roughness: 1, vertexColors: true }), true, true);
    mesh(slabs, patchMaterial(pbr(this.sidewalk, { metalness: 0, envMapIntensity: 0.5, vertexColors: true }), L), false, true);
    mesh(park, patchMaterial(pbr(this.grass, { metalness: 0, vertexColors: true }), L), false, true);
    this.roadMat = patchMaterial(pbr(this.rt.road, { metalness: 0, envMapIntensity: 0.45, normalScale: new THREE.Vector2(1.4, 1.4) }), L); mesh(roads, this.roadMat, false, true);
    mesh(inter, patchMaterial(pbr(this.rt.plain, { metalness: 0, envMapIntensity: 0.45, normalScale: new THREE.Vector2(1.4, 1.4) }), L), false, true);
    mesh(cw, patchMaterial(new THREE.MeshStandardMaterial({ map: crosswalkTexture(rng), transparent: true, alphaTest: 0.3, polygonOffset: true, polygonOffsetFactor: -2, roughness: 0.7 }), L), false, true);
    mesh(paint, patchMaterial(new THREE.MeshStandardMaterial({ color: 0xdadad2, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -3 }), L), false, true);

    const aoC = document.createElement('canvas'); aoC.width = 64; aoC.height = 4; const ag2 = aoC.getContext('2d'), gr2 = ag2.createLinearGradient(0, 0, 64, 0);
    gr2.addColorStop(0, 'rgba(0,0,0,0.6)'); gr2.addColorStop(0.35, 'rgba(0,0,0,0.24)'); gr2.addColorStop(1, 'rgba(0,0,0,0)'); ag2.fillStyle = gr2; ag2.fillRect(0, 0, 64, 4);
    const aoT = new THREE.CanvasTexture(aoC); aoT.wrapS = aoT.wrapT = THREE.ClampToEdgeWrapping;
    mesh(aoG, new THREE.MeshBasicMaterial({ map: aoT, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }), false, false).userData.noAO = true;

    // water (ponds, pools, fountains)
    const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x1d6f8f, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.88, envMapIntensity: 1.8, clearcoat: 1 });
    mesh(ctx.water, waterMat, false, true).material.vertexColors = false;
    // benches (instanced)
    {
      const bg = new Geo(), bc = new THREE.Color(0.42, 0.28, 0.16), dk = new THREE.Color(0.18, 0.18, 0.2);
      bg.box(-0.85, 0.42, -0.25, 0.85, 0.5, 0.25, bc, { su: 0.5, sv: 0.5, tsu: 0.5 }); bg.box(-0.85, 0.5, -0.27, 0.85, 0.95, -0.2, bc, { su: 0.5, sv: 0.5, tsu: 0.5 });
      bg.box(-0.8, 0, -0.22, -0.7, 0.42, 0.22, dk, { su: 0.5, sv: 0.5, tsu: 0.5 }); bg.box(0.7, 0, -0.22, 0.8, 0.42, 0.22, dk, { su: 0.5, sv: 0.5, tsu: 0.5 });
      const im = new THREE.InstancedMesh(bg.geometry(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }), Math.max(1, ctx.benches.length)); im.castShadow = true;
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), ps = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1);
      ctx.benches.forEach((b, k) => { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -b.ry); ps.set(b.x, 0.3, b.z); m4.compose(ps, q, sc); im.setMatrixAt(k, m4); }); im.count = ctx.benches.length; scene.add(im);
    }
    for (const s of ctx.signs) D.signMesh(ctx, s.text, 13, 1.6, '#1d6b3a', '#ffffff', [s.x, s.y, s.z], s.ry, { font: 'bold 64px Arial Black', emis: 0.6 });
    this.parked = ctx.parked; this.doors = ctx.doors; this.pois = ctx.pois; this.markers = ctx.markers; this.signMats = ctx.signMats;
    if (ctx.floods.length) { // stadium floodlights
      const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(ctx.floods.flat(), 3));
      this.floodGlow = new THREE.Points(fg, new THREE.PointsMaterial({ map: glowTexture(), size: 40, color: 0xfff2cc, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); this.floodGlow.frustumCulled = false; this.floodGlow.userData.noAO = true; scene.add(this.floodGlow);
    }

    // the sea (south + east), with drifting ripples
    { const nT = this.rt.plain.normal.clone(); nT.wrapS = nT.wrapT = THREE.RepeatWrapping; nT.repeat.set(140, 70); nT.needsUpdate = true; this.seaNormal = nT;
      const seaMat = new THREE.MeshPhysicalMaterial({ color: 0x0f3d52, roughness: 0.12, metalness: 0, normalMap: nT, normalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 1.6, clearcoat: 0.6 });
      const e = W + R / 2 + 15;
      const s1 = new THREE.Mesh(new THREE.PlaneGeometry(6000, 3000).rotateX(-Math.PI / 2), seaMat); s1.position.set(W / 2, 0.05, e + 1500); s1.receiveShadow = true; scene.add(s1);
      const s2 = new THREE.Mesh(new THREE.PlaneGeometry(3000, 6000).rotateX(-Math.PI / 2), seaMat); s2.position.set(e + 1500, 0.04, W / 2 - 1500); s2.receiveShadow = true; scene.add(s2); }

    const gT = this.grass.map.clone(), gN = this.grass.normal.clone(); for (const t of [gT, gN]) { t.repeat.set(400, 400); t.needsUpdate = true; }
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshStandardMaterial({ map: gT, normalMap: gN, roughness: 1, color: 0xcfd8c0 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.1; ground.receiveShadow = true; scene.add(ground);

    // trees: bark trunk + crossed leaf-card crowns (alpha-tested, outward-facing normals)
    const trees = []; for (const row of this.blocks) for (const bk of row) for (const t of bk.trees) trees.push(t);
    const trunkG = new THREE.CylinderGeometry(0.14, 0.26, 1, 7).translate(0, 0.5, 0);
    const trunk = new THREE.InstancedMesh(trunkG, new THREE.MeshStandardMaterial({ map: barkSet(rng), roughness: 1 }), trees.length);
    const crownMat = new THREE.MeshStandardMaterial({ map: leafTexture(rng), alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.85, metalness: 0 });
    const crown = new THREE.InstancedMesh(crownGeometry(rng), crownMat, trees.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3(), col = new THREE.Color(), up = new THREE.Vector3(0, 1, 0);
    trees.forEach((t, k) => {
      const th = (t.street ? 2.6 : 3.4) * (0.85 + rng() * 0.4), cs = t.r / 1.9;
      ps.set(t.x, 0.25, t.z); sc.set(1, th, 1); q.identity(); m4.compose(ps, q, sc); trunk.setMatrixAt(k, m4);
      q.setFromAxisAngle(up, rng() * 6.28); ps.set(t.x, 0.25 + th + t.r * 0.45, t.z); sc.set(cs, cs * (0.85 + rng() * 0.3), cs); m4.compose(ps, q, sc); crown.setMatrixAt(k, m4);
      col.setHSL(0.22 + rng() * 0.1, 0.3, 0.55 + rng() * 0.28); crown.setColorAt(k, col);
    });
    crown.userData.noAO = true; trunk.castShadow = crown.castShadow = true; crown.receiveShadow = true; scene.add(trunk, crown);

    // lamp posts
    const poleG = new THREE.CylinderGeometry(0.08, 0.14, 8, 8).translate(0, 4, 0);
    const armG = new THREE.BoxGeometry(2.0, 0.1, 0.1).translate(0.9, 8, 0);
    const headG = new THREE.BoxGeometry(0.9, 0.16, 0.38).translate(1.7, 7.92, 0);
    const steel = new THREE.MeshStandardMaterial({ color: 0x3b3f45, metalness: 0.8, roughness: 0.4 });
    const poles = new THREE.InstancedMesh(poleG, steel, this.lamps.length), arms = new THREE.InstancedMesh(armG, steel, this.lamps.length);
    this.headMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, emissive: 0xffc77a, emissiveIntensity: 0, roughness: 0.4 });
    const heads = new THREE.InstancedMesh(headG, this.headMat, this.lamps.length);
    const lp = [], yAxis = new THREE.Vector3(0, 1, 0);
    this.lamps.forEach((l, k) => {
      const ang = l.ang ?? Math.atan2(Math.round(l.z / B) * B - l.z, Math.round(l.x / B) * B - l.x); // arm reaches toward the road
      q.setFromAxisAngle(yAxis, -ang); ps.set(l.x, l.y ?? 0.25, l.z); sc.set(1, 1, 1); m4.compose(ps, q, sc);
      poles.setMatrixAt(k, m4); arms.setMatrixAt(k, m4); heads.setMatrixAt(k, m4);
      lp.push(l.x + Math.cos(ang) * 1.7, (l.y ?? 0.25) + 7.9, l.z + Math.sin(ang) * 1.7);
    });
    poles.castShadow = true; scene.add(poles, arms, heads);
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    this.lampGlow = new THREE.Points(pg, new THREE.PointsMaterial({ map: glowTexture(), size: 15, color: 0xffc070, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    this.lampGlow.frustumCulled = false; this.lampGlow.userData.noAO = true; scene.add(this.lampGlow);

    // rooftop billboards (lit at night)
    const adC = document.createElement('canvas'); adC.width = 512; adC.height = 128; const ag = adC.getContext('2d');
    const ads = [['#ff3b6b', '#ffd23a', 'BURGER'], ['#1f8bff', '#e8f4ff', 'SANTITOS'], ['#12c27a', '#fff', 'FRESH'], ['#a24bff', '#ffe36a', 'NEON'], ['#ff8a2a', '#2a1a10', 'MOTORS'], ['#ffffff', '#d11', 'COLA']];
    ads.forEach(([a, b, txt], i) => { const x = (i % 2) * 256, y = Math.floor(i / 2) * 42; ag.fillStyle = a; ag.fillRect(x, y, 256, 42); ag.fillStyle = b; ag.font = 'bold 30px Arial Black, Arial'; ag.textAlign = 'center'; ag.textBaseline = 'middle'; ag.fillText(txt, x + 128, y + 22); });
    const adT = new THREE.CanvasTexture(adC); adT.colorSpace = THREE.SRGBColorSpace; this.adTex = adT;
    this.adMat = new THREE.MeshStandardMaterial({ map: adT, emissiveMap: adT, emissive: 0xffffff, emissiveIntensity: 0.05, roughness: 0.6 });
    const frameM = new THREE.MeshStandardMaterial({ color: 0x25272b, metalness: 0.6, roughness: 0.5 });
    this.billboards.slice(0, 22).forEach((bb, k) => {
      const w = bb.w, h = w * 0.3, i = k % 6, u0 = (i % 2) * 0.5, v0 = 1 - (Math.floor(i / 2) + 1) / 3;
      const g = new THREE.PlaneGeometry(w, h); const uv = g.attributes.uv; for (let n = 0; n < uv.count; n++) uv.setXY(n, u0 + uv.getX(n) * 0.5, v0 + uv.getY(n) / 3);
      const p = new THREE.Mesh(g, this.adMat); p.position.set(bb.x, bb.y + 2.2 + h / 2, bb.z); p.castShadow = true; scene.add(p);
      const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, h + 0.4, 0.3), frameM); back.position.set(bb.x, bb.y + 2.2 + h / 2, bb.z - 0.2); scene.add(back);
      for (const s of [-0.4, 0.4]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.4, 0.3), frameM); leg.position.set(bb.x + s * w, bb.y + 1.2, bb.z - 0.2); scene.add(leg); }
    });
  }


  /* ----- street furniture: hydrants, bins, bus shelters ----- */
  furniture(rng) {
    const hyd = [], bins = [], shelters = [], frame = new Geo(), glass = new Geo(), ads = new Geo(), dark = new THREE.Color(0.22, 0.23, 0.25), white = new THREE.Color(1, 1, 1);
    const ON = { city: 1, plaza: 1, house: 0.5 };
    for (const row of this.blocks) for (const bk of row) {
      if (!ON[bk.kind]) continue;
      for (let side = 0; side < 4; side++) {
        if (rng() > ON[bk.kind]) continue;
        const at = (t, off) => { const a = bk.s * t; return side === 0 ? [bk.x + a, bk.z + off] : side === 1 ? [bk.x + bk.s - off, bk.z + a] : side === 2 ? [bk.x + bk.s - a, bk.z + bk.s - off] : [bk.x + off, bk.z + bk.s - a]; };
        const ry = side * Math.PI / 2; // local +x runs along the kerb, local +z points into the block
        if (rng() < 0.6) { const [x, z] = at(rng() < 0.5 ? 0.1 : 0.9, 0.9); hyd.push({ x, z, ry }); }
        if (bk.kind !== 'house' && rng() < 0.55) { const [x, z] = at(0.64, 1.0); bins.push({ x, z, ry }); }
        if (bk.kind === 'city' && rng() < 0.3) { const [x, z] = at(0.36, 2.4); shelters.push({ x, z, ry }); }
      }
    }
    const props = (list, geo, mat, w, h, kind) => {
      const im = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
      list.forEach((o, k) => {
        q.setFromAxisAngle(up, -o.ry); m4.compose(new THREE.Vector3(o.x, 0.25, o.z), q, one); im.setMatrixAt(k, m4);
        const r = { x: o.x - w / 2, z: o.z - w / 2, w, d: w, h, y0: 0, brk: { im, k, kind } }; o.r = r;
        const bi = Math.floor(o.x / B), bj = Math.floor(o.z / B); if (bi >= 0 && bj >= 0 && bi < N && bj < N) this.blocks[bi][bj].rects.push(r);
      });
      im.count = list.length; im.castShadow = true; im.receiveShadow = true; this.scene.add(im); return im;
    };
    { // hydrant: barrel, bonnet, two side outlets, base flange
      const r = new THREE.Color(0.75, 0.1, 0.08), g = mergeGeometries([
        new THREE.CylinderGeometry(0.13, 0.15, 0.62, 10).translate(0, 0.36, 0), new THREE.SphereGeometry(0.14, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 0.67, 0),
        new THREE.CylinderGeometry(0.04, 0.04, 0.08, 6).translate(0, 0.84, 0), new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8).rotateZ(Math.PI / 2).translate(0, 0.5, 0),
        new THREE.CylinderGeometry(0.2, 0.2, 0.06, 10).translate(0, 0.05, 0)].map((q) => q.toNonIndexed()));
      this.props = [props(hyd, g, new THREE.MeshStandardMaterial({ color: r, roughness: 0.45, metalness: 0.3 }), 0.45, 0.9, 'hydrant')];
    }
    { // litter bin with lid
      const g = mergeGeometries([new THREE.CylinderGeometry(0.3, 0.26, 0.9, 12).translate(0, 0.45, 0), new THREE.CylinderGeometry(0.33, 0.33, 0.08, 12).translate(0, 0.94, 0)].map((q) => q.toNonIndexed()));
      this.props.push(props(bins, g, new THREE.MeshStandardMaterial({ color: 0x2f4a38, roughness: 0.55, metalness: 0.4 }), 0.66, 1, 'bin'));
    }
    // bus shelters: steel frame, glass back + side panels, lit advert panel, bench
    for (const o of shelters) {
      const ca = Math.cos(o.ry), sa = Math.sin(o.ry), P = (lx, lz) => [o.x + lx * ca - lz * sa, o.z + lx * sa + lz * ca];
      const box = (g, lx0, y0, lz0, lx1, y1, lz1, col) => { const [ax, az] = P(lx0, lz0), [bx, bz] = P(lx1, lz1); g.box(Math.min(ax, bx), y0, Math.min(az, bz), Math.max(ax, bx), y1, Math.max(az, bz), col, { su: 0.5, sv: 0.5, tsu: 0.5 }); };
      for (const lx of [-2, 2]) for (const lz of [-0.9, 0.9]) box(frame, lx - 0.05, 0.25, lz - 0.05, lx + 0.05, 2.75, lz + 0.05, dark);
      box(frame, -2.15, 2.75, -1.05, 2.15, 2.9, 1.05, dark);
      box(glass, -1.95, 0.45, 0.85, 1.95, 2.6, 0.9, white); box(glass, -2.02, 0.45, -0.8, -1.98, 2.6, 0.8, white); box(glass, 1.98, 0.45, -0.8, 2.02, 2.6, 0.8, white);
      box(ads, 2.05, 0.6, -0.7, 2.12, 2.4, 0.7, white);
      box(frame, -1.4, 0.68, 0.35, 1.4, 0.76, 0.8, new THREE.Color(0.45, 0.3, 0.18)); box(frame, -1.3, 0.25, 0.5, -1.2, 0.68, 0.7, dark); box(frame, 1.2, 0.25, 0.5, 1.3, 0.68, 0.7, dark);
      const [ax, az] = P(-2.1, 0.8), [bx, bz] = P(2.1, 1.0), bi = Math.floor(o.x / B), bj = Math.floor(o.z / B);
      this.blocks[bi][bj].rects.push({ x: Math.min(ax, bx), z: Math.min(az, bz), w: Math.abs(bx - ax) + 0.1, d: Math.abs(bz - az) + 0.1, h: 2.9, y0: 0 });
    }
    if (shelters.length) {
      const add = (g, m) => { const o = new THREE.Mesh(g.geometry(), m); o.castShadow = true; o.receiveShadow = true; this.scene.add(o); return o; };
      add(frame, new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.6, roughness: 0.4 }));
      add(glass, new THREE.MeshPhysicalMaterial({ color: 0xbfd6e0, transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0, envMapIntensity: 1.5, depthWrite: false })).castShadow = false;
      const adM = new THREE.MeshStandardMaterial({ map: this.adTex, emissiveMap: this.adTex, emissive: 0xffffff, emissiveIntensity: 0.2, roughness: 0.4 }); this.signMats.push({ m: adM, k: 0.8 }); add(ads, adM);
    }
    this.fountains = [];
  }
  // A car ploughed into a hydrant / bin: hide it, drop the collider, and (hydrants) start a water jet.
  breakProp(r) {
    const b = r.brk; if (!b || b.done) return; b.done = true;
    const m4 = new THREE.Matrix4(); b.im.getMatrixAt(b.k, m4); m4.scale(new THREE.Vector3(0, 0, 0)); b.im.setMatrixAt(b.k, m4); b.im.instanceMatrix.needsUpdate = true;
    const x = r.x + r.w / 2, z = r.z + r.d / 2; r.x = r.z = -1e5;
    if (b.kind === 'hydrant') { this.fountains.push({ x, z, t: 14 }); G.audio.crash(x, z, 9); } else G.fx.dust(x, 0.6, z, 5, 0.5);
  }
  updateFountains(dt) {
    for (let i = this.fountains.length - 1; i >= 0; i--) {
      const f = this.fountains[i]; f.t -= dt; if (f.t <= 0) { this.fountains.splice(i, 1); continue; }
      const k = Math.min(1, f.t / 4);
      for (let n = 0; n < 3; n++) G.fx.nrm.emit(f.x + (Math.random() - 0.5) * 0.2, 0.5, f.z + (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 2, 9 + Math.random() * 4 * k, (Math.random() - 0.5) * 2, 1.3, 0.3, 1.4, 0.82, 0.9, 0.98, 0.55, 0.3, 14);
    }
  }

  update(night, time = 0) {
    for (const sm of this.signMats) sm.m.emissiveIntensity = 0.12 + night * sm.k * 1.4;
    for (const m of this.markers) m.position.y = m.geometry.type === 'TorusGeometry' ? 0.35 + Math.sin(time * 3) * 0.08 : 0.3;
    if (this.floodGlow) this.floodGlow.material.opacity = night * 0.9;
    if (this.seaNormal) { this.seaNormal.offset.x = time * 0.004; this.seaNormal.offset.y = time * 0.0025; }
    FX.night.value = night; FX.time.value = time;
    this.shopMat.emissiveIntensity = 0.12 + night * 0.7;
    this.adMat.emissiveIntensity = 0.05 + night * 0.75;
    this.headMat.emissiveIntensity = night * 2.6;
    this.lampGlow.material.opacity = night * 0.55;
  }

  /* ----- queries ----- */
  // Static spatial hash of collider rects (30 m cells, rects padded by 2 m) — no per-call copying, reentrancy-safe.
  buildHash() {
    const CS = 30, O = 60, n = Math.ceil((W + 2 * O) / CS); this.hash = Array.from({ length: n * n }, () => []); this.hashN = n;
    for (const row of this.blocks) for (const bk of row) for (const r of bk.rects) {
      const i0 = Math.max(0, Math.floor((r.x - 2 + O) / CS)), i1 = Math.min(n - 1, Math.floor((r.x + r.w + 2 + O) / CS)), j0 = Math.max(0, Math.floor((r.z - 2 + O) / CS)), j1 = Math.min(n - 1, Math.floor((r.z + r.d + 2 + O) / CS));
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) this.hash[j * n + i].push(r);
    }
  }
  nearRects(x, z) {
    if (x < -500) return G.interiors ? G.interiors.rectsAt(x, z) : [];
    if (this.hash) { const n = this.hashN, i = Math.floor((x + 60) / 30), j = Math.floor((z + 60) / 30); return i < 0 || j < 0 || i >= n || j >= n ? EMPTY : this.hash[j * n + i]; }
    const out = this._nr; out.length = 0;
    const bi = Math.floor(x / B), bj = Math.floor(z / B);
    for (let i = bi - 1; i <= bi + 1; i++) {
      if (i < 0 || i >= N) continue;
      for (let j = bj - 1; j <= bj + 1; j++) {
        if (j < 0 || j >= N) continue;
        const r = this.blocks[i][j].rects;
        for (let k = 0; k < r.length; k++) out.push(r[k]);
      }
    }
    return out;
  }

  // Height of whatever solid occupies this XZ point (0 if open ground).
  heightAt(x, z) {
    const rs = this.nearRects(x, z);
    let h = 0;
    for (let k = 0; k < rs.length; k++) { const r = rs[k]; if ((r.y0 || 0) < 2 && x > r.x && x < r.x + r.w && z > r.z && z < r.z + r.d && r.h > h) h = r.h; }
    return h;
  }

  // Drivable surface height under (x, z) for something currently at height y (viaduct ramps/deck).
  surfaceY(x, z, y) { const s = viaductSurface(x, z); return s > 0 && s <= y + 1.7 ? s : 0; }

  // Slide a circle out of any solids. Returns true if it touched something.
  pushOut(o, rad) {
    const rs = this.nearRects(o.x, o.z); let bump = false;
    for (let k = 0; k < rs.length; k++) if ((rs[k].y0 || 0) < 2 && circRect(o.x, o.z, rad, rs[k])) { o.x += hit.nx * hit.d; o.z += hit.nz * hit.d; bump = true; }
    return bump;
  }

  moveCircle(o, rad, dt) {
    o.x += o.vx * dt; o.z += o.vz * dt;
    const bump = this.pushOut(o, rad);
    if (o.x > -500) { o.x = Math.max(-R / 2 - 20, Math.min(W + R / 2 + 20, o.x)); o.z = Math.max(-R / 2 - 20, Math.min(W + R / 2 + 20, o.z)); }
    return bump;
  }

  // Line of sight between two points at the given eye height (buildings above that block it).
  losClear(x1, z1, x2, z2, eye = 1.5) {
    const d = Math.hypot(x2 - x1, z2 - z1), n = Math.ceil(d / 4);
    for (let i = 1; i < n; i++) { const t = i / n; if (this.heightAt(x1 + (x2 - x1) * t, z1 + (z2 - z1) * t) > eye) return false; }
    return true;
  }

  /* ----- minimap texture ----- */
  buildMap() {
    const S = 0.5, size = Math.ceil((W + R) * S);
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d');
    g.scale(S, S); g.translate(R / 2, R / 2);
    g.fillStyle = '#16171a'; g.fillRect(-R, -R, W + 2 * R, W + 2 * R);
    g.fillStyle = '#3f4147'; g.fillRect(-R / 2, -R / 2, W + R, W + R);
    const KC = { city: '#74736d', house: '#7d8a68', industrial: '#5d5d62', park: '#2f5a2c', lake: '#2f5a2c', plaza: '#a39a80', parking: '#505055', under: '#4a4a50', ramp: '#566a4c', gas: '#57575c', sport: '#3a6a34', hospital: '#8e9096', police: '#6a7088', spray: '#6e6a62' };
    for (const row of this.blocks) for (const bk of row) {
      g.fillStyle = KC[bk.kind] || '#74736d'; g.fillRect(bk.x, bk.z, bk.s, bk.s);
      if (bk.kind === 'lake') { g.fillStyle = '#2d78a8'; g.fillRect(bk.x + bk.s / 2 - 25, bk.z + bk.s / 2 - 19, 50, 38); }
      for (const r of bk.rects) if (r.h > 5 && r.w > 2.5 && r.d > 2.5 && (r.y0 || 0) < 2) { g.fillStyle = bk.kind === 'city' ? '#8a8a86' : bk.kind === 'industrial' ? '#78787d' : '#8d8a80'; g.fillRect(r.x, r.z, r.w, r.d); }
    }
    g.fillStyle = 'rgba(210,150,70,0.9)'; g.fillRect(VD.xa, VD.zc - 5, VD.xd - VD.xa, 10); // skyway
    g.fillRect(VD.m.x0, VD.zc + VD.hw, VD.m.x2 - VD.m.x0, 7); g.fillRect(VD.m.x0, VD.zc - VD.hw - 7, VD.m.x2 - VD.m.x0, 7); // slip ramps
    const ICON = { bar: ['#c87a20', '#fff', '♪'], hospital: ['#fff', '#d11', '+'], police: ['#2a54c8', '#fff', 'P'], ammu: ['#b22', '#fff', 'A'], burger: ['#e8b020', '#000', 'B'], store: ['#1a8a4a', '#fff', '24'], clothes: ['#8a4ac8', '#fff', 'C'], apartment: ['#2a9ac8', '#fff', 'S'], spray: ['#e07a10', '#fff', 'Z'], gas: ['#d33', '#ffe', 'G'] };
    g.textAlign = 'center'; g.textBaseline = 'middle';
    this.icons = this.pois.filter((p) => ICON[p.kind]).map((p) => ({ x: p.x, z: p.z, ic: ICON[p.kind] })); // drawn upright by the HUD
    this.mapCanvas = c; this.mapScale = S;
  }
}
