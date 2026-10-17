// Meereen — the greatest of the Slaver cities. Book anchors: multi-coloured brick; the Great Pyramid with a bronze harpy on its apex and a garden
// terrace/apartments below it; many stepped pyramids of the old families (Hazkar, Loraq...); Daznak's Pit (largest of the fighting pits, west of the
// Great Pyramid); the Temple of the Graces with golden domes; a Plaza of Purification with a harpy; a brick-walled city on the Skahazadhan at the bay.
// Everything else (plan, sizes, positions) is interpretation — see content/meereen.js.
// Polish pass: muted polychrome brick palette with per-building jitter, battered plinths / cornices / parapets, real stairs, terrace gardens,
// warm dusty-gold lighting, lantern glow for dusk/night.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const CX = -25, CZ = 5, RX = 138, RZ = 120;
// Ghiscari brick families (muted, sun-bleached): terracotta, ochre, sage, cream, dusty blue, oxblood, amber
const DUST = 0xa88f74, dusty = (hex, k = 0.2) => new THREE.Color(hex).lerp(new THREE.Color(DUST), k).getHex();
const PAL = [0xc46a4c, 0xd6a95c, 0x7c9d7a, 0xd9ceb2, 0x6f93a6, 0xa65644, 0xcf8b58].map((h) => dusty(h, 0.14));
const CREAM = 0xeadcb8, SAND = 0xd8c397;
const RIVER = [[262, 300], [215, 190], [172, 85], [150, 0], [133, -60], [124, -112], [120, -150]];

const _hsl = {};
/** hue / saturation / lightness jitter of a hex colour -> THREE.Color (multiplies the material tint). */
function jit(hex, r, dh = 0.012, ds = 0.07, dl = 0.055) {
  const c = new THREE.Color(hex); c.getHSL(_hsl);
  return c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, K.clamp(_hsl.s + r.range(-ds, ds), 0, 1), K.clamp(_hsl.l + r.range(-dl, dl), 0, 1));
}
const shade = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const rot = (dx, dz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return [dx * c + dz * s, -dx * s + dz * c]; };

/** Solid stair from outer edge point P0 (ground level y0) climbing toward direction (dx,dz) over `run`; width across. */
function stair(b, mat, x0, y0, z0, dx, dz, { run, rise, width, steps = 8, color = 0xffffff }) {
  const ang = Math.atan2(-dz, dx);
  for (let k = 0; k < steps; k++) {
    const u = (k + 0.5) * run / steps;
    b.box(mat, x0 + dx * u, y0 - 0.3, z0 + dz * u, run / steps + 0.05, (k + 1) * rise / steps + 0.3, width, ang, color);
  }
}

// The Ghiscari harpy: a woman's torso, raised bat wings with scalloped trailing edges, eagle's legs gripping the perch and a
// curled scorpion tail. Built from a few real shapes (extruded wing membranes) so the silhouette reads at a distance.
const _wingGeo = new Map();
function wingGeo(sd) {
  if (_wingGeo.has(sd)) return _wingGeo.get(sd);
  // (u = outward span, v = up); leading edge sweeps up to the tip, trailing edge is a run of finger-bone scallops
  const P = [[0, 0.35], [0.55, 1.75], [1.45, 2.95], [2.65, 3.85], [3.9, 4.4], [5.0, 4.65], [4.25, 3.55], [4.5, 2.3], [3.55, 2.15], [3.4, 1.05], [2.5, 1.3], [2.1, 0.3], [1.3, 0.62], [0.4, -0.15]];
  const sh = new THREE.Shape(P.map(([u, v]) => new THREE.Vector2(u * sd, v)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.22, bevelEnabled: false }); g.translate(0, 0, -0.11);
  _wingGeo.set(sd, g); return g;
}
const WING_BONES = [[[0, 0.35], [1.45, 2.95]], [[1.45, 2.95], [2.9, 3.95]], [[2.9, 3.95], [5.0, 4.65]], [[2.9, 3.95], [4.5, 2.3]], [[2.9, 3.95], [3.4, 1.05]], [[2.9, 3.95], [2.1, 0.3]]];
const _boxC = new THREE.BoxGeometry(1, 1, 1), _bm = new THREE.Matrix4();
const _hm = new THREE.Matrix4(), _hq = new THREE.Quaternion(), _he = new THREE.Euler(), _hv = new THREE.Vector3(), _hs = new THREE.Vector3();
function harpy(b, mat, x, y, z, s, ry = 0, color = 0xffffff) {
  const L = (lx, lz) => rot(lx * s, lz * s, ry); // local (x right, z forward) -> world offset
  const P = (lx, ly, lz) => { const [ox, oz] = L(lx, lz); return [x + ox, y + ly * s, z + oz]; };
  b.cyl(mat, x, y, z, 0.95 * s, 0.45 * s, { top: 0.9, seg: 10, color }); // perch
  for (const sd of [-1, 1]) { // eagle legs + talons
    const [lx, ly, lz] = P(sd * 0.32, 0.4, 0.1); b.cyl(mat, lx, ly, lz, 0.17 * s, 1.1 * s, { top: 1.6, seg: 6, color });
    for (const k of [-1, 0, 1]) { const [tx, ty, tz] = P(sd * 0.32 + k * 0.16, 0.42, 0.42); b.box(mat, tx, ty, tz, 0.09 * s, 0.12 * s, 0.5 * s, ry + k * 0.3, color); }
  }
  { const [hx, hy, hz] = P(0, 1.35, 0); b.cyl(mat, hx, hy, hz, 0.42 * s, 0.6 * s, { top: 1.0, seg: 8, color }); } // hips
  { const [tx, ty, tz] = P(0, 1.9, 0.02); b.cyl(mat, tx, ty, tz, 0.36 * s, 1.35 * s, { top: 1.35, seg: 8, color }); } // waist -> ribcage
  { const [cx, cy, cz] = P(0, 3.15, 0.04); b.sphere(mat, cx, cy, cz, 0.52 * s, { seg: 8, sy: 0.7, color }); } // shoulders
  { const [nx, ny, nz] = P(0, 3.45, 0.06); b.cyl(mat, nx, ny, nz, 0.15 * s, 0.35 * s, { seg: 6, color }); }
  { const [hx, hy, hz] = P(0, 3.95, 0.1); b.sphere(mat, hx, hy, hz, 0.3 * s, { seg: 8, sy: 1.2, color }); } // head
  { const [hx, hy, hz] = P(0, 3.85, -0.12); b.sphere(mat, hx, hy, hz, 0.33 * s, { seg: 7, sy: 1.25, color }); } // swept hair
  for (const sd of [-1, 1]) { // arms raised with the wings
    const [ax, ay, az] = P(sd * 0.55, 3.0, 0.05); b.box(mat, ax, ay, az, 0.18 * s, 1.0 * s, 0.18 * s, ry, color, 0, -sd * 0.9);
  }
  // scorpion tail: a segmented curl rising behind the body and over the back
  for (let i = 0; i < 9; i++) { const t = i / 8, a = t * Math.PI * 1.15, r = 1.25 - 0.35 * t;
    const [px, py, pz] = P(0, 0.55 + Math.sin(a) * r * 1.15, -0.35 - (1 - Math.cos(a)) * r * 0.6 + t * 0.4); b.sphere(mat, px, py, pz, (0.26 - 0.12 * t) * s, { seg: 6, color }); }
  { const [px, py, pz] = P(0, 1.85, -0.9); b.cone(mat, px, py, pz, 0.12 * s, 0.55 * s, { seg: 5, color }); } // sting
  // wings: membranes swept slightly back, rooted at the shoulder blades
  for (const sd of [-1, 1]) {
    const [wx, wy, wz] = P(sd * 0.3, 2.75, -0.25);
    _he.set(0.12, ry + sd * 0.38, 0); _hq.setFromEuler(_he); _hv.set(wx, wy, wz); _hs.set(s, s, s);
    _hm.compose(_hv, _hq, _hs); b.addGeometry(mat, wingGeo(sd), _hm, color);
    for (const [a, c] of WING_BONES) { // arm and finger bones give the membrane relief
      const ax = a[0] * sd, cx = c[0] * sd, len = Math.hypot(cx - ax, c[1] - a[1]);
      _bm.compose(_hv.set((ax + cx) / 2, (a[1] + c[1]) / 2, 0.05), _hq.setFromEuler(_he.set(0, 0, Math.atan2(c[1] - a[1], cx - ax))), _hs.set(len, 0.2, 0.34));
      b.addGeometry(mat, _boxC, _bm.premultiply(_hm), color);
    }
  }
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(51);
    const coastZ = (x) => -130 + Math.sin(x * 0.02) * 5 + (K.fbm(x * 0.03, 5, 2, 7) - 0.5) * 6;
    const ell = (x, z) => Math.hypot((x - CX) / RX, (z - CZ) / RZ);
    const rivD = (x, z) => K.distToPolyline(x, z, RIVER).d;
    const heightAt = (x, z) => {
      const d = z - coastZ(x), outer = K.smoothstep(1.12, 1.9, ell(x, z));
      let land = 2.4 + outer * ((K.fbm(x * 0.012, z * 0.012, 3, 3) - 0.35) * 12 + (K.fbm(x * 0.04, z * 0.04, 2, 5) - 0.5) * 2);
      land += K.smoothstep(280, 460, Math.hypot(x, z)) * 24 * K.fbm(x * 0.005, z * 0.005, 3, 9);
      land = Math.max(land, 1.1);
      const rd = rivD(x, z); land -= (1 - K.smoothstep(7, 17, rd)) * 6.6; // Skahazadhan channel
      return K.lerp(-9, land, K.smoothstep(-30, 3, d));
    };
    const H = heightAt;

    // ---- terrain: dusty strata, irrigated green/wheat fields along the river, wet sand at the shore
    const sand = new THREE.Color(0xdccfae), dust = new THREE.Color(0xc7b48c), ochre = new THREE.Color(0xc4a06e), rockC = new THREE.Color(0x8d765a), paved = new THREE.Color(0xd2bd92);
    const greenA = new THREE.Color(0x7f9a4c), greenB = new THREE.Color(0xa6a455), wheat = new THREE.Color(0xc9b36a), wet = new THREE.Color(0x7d725a), c = new THREE.Color();
    root.add(K.terrain({ size: 1100, seg: q.seg(190), heightAt, kind: 'sand', scale: 16, colorAt: (x, z, h, s) => {
      const n1 = K.fbm(x * 0.02, z * 0.02, 2, 1), n2 = K.fbm(x * 0.09, z * 0.09, 2, 11), n3 = K.fbm(x * 0.004, z * 0.004, 2, 3);
      c.copy(sand).lerp(dust, K.clamp(n1 * 1.3, 0, 1)).lerp(ochre, K.clamp((n3 - 0.45) * 2.2, 0, 0.55)).multiplyScalar(0.93 + 0.14 * n2);
      if (s > 0.02) c.lerp(rockC, K.clamp(s * 5, 0, 0.65) * (0.55 + 0.45 * Math.sin(h * 1.7 + n2 * 7)));
      const e = ell(x, z);
      if (e > 1.06) {
        const rd = rivD(x, z), fert = (1 - K.smoothstep(14, 96, rd + (n2 - 0.5) * 34));
        const f = K.fbm(x * 0.035, z * 0.035, 2, 21);
        const field = f > 0.52 ? greenA : f > 0.42 ? wheat : greenB;
        c.lerp(field, fert * 0.82 * K.smoothstep(1.06, 1.25, e));
      } else c.lerp(paved, 0.55 * (1 - K.smoothstep(0.9, 1.06, e)));
      if (h < 1.7) c.lerp(wet, K.clamp((1.7 - h) / 1.7, 0, 0.75));
      return c;
    } }));
    const wat = K.water({ w: 1300, d: 980, seg: q.seg(118), center: [0, -60], level: 0, heightAt, deep: 0x1f5a68, shallow: 0x78ad9c, opacity: 0.93, choppy: 0.45, speed: 0.5 });
    root.add(wat); ctx.registerWater(wat);
    const farSea = K.water({ w: 3000, d: 1500, seg: 20, center: [0, -1240], level: -0.06, heightAt: () => -30, deep: 0x1f5a68, shallow: 0x1f5a68, opacity: 1, choppy: 0.3, speed: 0.5 }); root.add(farSea); ctx.registerWater(farSea);

    // ---- materials
    const brick = tri('brick', { color: 0xffffff, scale: 11, snow: false, bump: 0.42 }), plaster = tri('plaster', { color: 0xf0e2c2, scale: 6, snow: false });
    const paving = tri('cobble', { color: 0xd3b88c, scale: 7, snow: false }), wood = tri('wood', { color: 0x6b4d33, scale: 4, snow: false }), roadMat = tri('sand', { color: 0xc4a574, scale: 8, snow: false });
    const stone = tri('stone', { color: 0xdbd2bb, scale: 6, snow: false });
    const bronze = flat(0xc29a4c, { rough: 0.38, metal: 0.3, flatShading: false }), goldM = flat(0xe6b838, { rough: 0.3, metal: 0.5, flatShading: false }), dark = flat(0x1b120e);
    const leaf = flat(0xffffff, { rough: 1, flatShading: false }), cloth = flat(0xffffff, { rough: 1, side: THREE.DoubleSide, flatShading: false });
    const windowG = glow(0xffb85a), lantern = glow(0xffa24a, 1.3), instMat = new THREE.MeshStandardMaterial({ roughness: 1 }); // kit Inst + tri/flat renders black; plain material instead
    const b = new Batch();
    const clothC = [0xb5472f, 0xd9a43a, 0x4f8a8a, 0xe4d8bc, 0x7a3a5a];

    // ---- walls: massive, banded polychrome brick with battered plinth, string course, cornice and merlons
    const N = 36, ring = Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2, k = 1 + K.rng(i + 3)() * 0.06 - 0.03; return [CX + Math.cos(a) * RX * k, CZ + Math.sin(a) * RZ * k]; });
    // Disciplined polychromy: one warm terracotta body for the whole circuit (slight per-segment drift), with continuous
    // horizontal courses of ochre, dusty blue and cream brick running round the city - reads as "many-coloured" without patchwork.
    const WH = 17, WBODY = 0xb8664a, BANDS = [[3.2, 1.5, 0x5f8597], [6.6, 0.9, 0xd6a95c], [10.4, 1.6, 0x7a3b30], [12.9, 0.8, 0xd6a95c]];
    for (let i = 0; i < N; i++) {
      const A = ring[i], B = ring[(i + 1) % N], col = jit(WBODY, rr, 0.008, 0.04, 0.03);
      K.wall(b, [A, B], { h: WH, t: 7, mat: brick, heightAt, sink: 3, color: col, crenel: false });
      const dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz), ry = K.headingX ? K.headingX(dx, dz) : Math.atan2(-dz, dx), mx = (A[0] + B[0]) / 2, mz = (A[1] + B[1]) / 2;
      const g = Math.min(H(A[0], A[1]), H(B[0], B[1]), H(mx, mz)), top = Math.max(H(A[0], A[1]), H(B[0], B[1])) + WH;
      b.box(brick, mx, g - 3, mz, len + 0.8, 6.0, 8.6, ry, shade(WBODY, 0.62)); // battered plinth
      for (const [by, bh, bc] of BANDS) b.box(brick, mx, g + by, mz, len + 0.35, bh, 7.25, ry, jit(bc, rr, 0.006, 0.03, 0.02)); // coloured courses
      b.box(brick, mx, top - 1.5, mz, len + 0.6, 1.7, 8.0, ry, jit(CREAM, rr, 0.01, 0.03, 0.02)); // cornice
      const nx = -dz / len, nz = dx / len, cnt = Math.max(2, Math.round(len / 3.2));
      for (let k = 0; k < cnt; k++) { const u = (k + 0.5) / cnt - 0.5; // stepped (Ghiscari) merlons on the outer edge, low parapet inside
        b.box(brick, mx + dx / len * u * len - nx * 3.3, top + 0.2, mz + dz / len * u * len - nz * 3.3, len / cnt * 0.5, 1.7, 0.9, ry, col);
        b.box(brick, mx + dx / len * u * len - nx * 3.3, top + 1.9, mz + dz / len * u * len - nz * 3.3, len / cnt * 0.26, 0.7, 0.9, ry, col); }
      b.box(brick, mx + nx * 3.3, top + 0.2, mz + nz * 3.3, len + 0.4, 1.1, 0.8, ry, shade(WBODY, 0.9));
    }
    // towers: battered base, banded body, cornice, merlons, slit windows
    const gTower = (x, z, { w = 10, d = w, h = 30, y, ry = 0, col, lanterns = false }) => {
      b.box(brick, x, y - 3, z, w + 2.4, 8, d + 2.4, ry, shade(col, 0.7));
      b.box(brick, x, y + 4, z, w, h - 4, d, ry, col);
      for (const [by, bh, bc] of BANDS) b.box(brick, x, y + by, z, w + 0.35, bh, d + 0.35, ry, jit(bc, rr, 0.006, 0.03, 0.02)); // courses continue from the curtain
      b.box(brick, x, y + h * 0.72, z, w + 0.5, 1.2, d + 0.5, ry, jit(CREAM, rr, 0.01, 0.04, 0.03));
      b.box(brick, x, y + h - 1.6, z, w + 1.8, 1.8, d + 1.8, ry, jit(CREAM, rr, 0.01, 0.04, 0.03));
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, ox = Math.cos(a) * (w / 2 + 0.6) * (k % 2 ? 0.72 : 1), oz = Math.sin(a) * (d / 2 + 0.6) * (k % 2 ? 0.72 : 1), [px, pz] = rot(ox, oz, ry);
        b.box(brick, x + px, y + h, z + pz, 1.7, 1.3, 1.7, ry, shade(col, 0.96)); }
      for (const sd of [-1, 1]) { const [px, pz] = rot(0, sd * (d / 2 + 0.06), ry); b.box(windowG, x + px, y + h * 0.7, z + pz, 0.8, 2.6, 0.14, ry); b.box(windowG, x + px, y + h * 0.36, z + pz, 0.8, 2.6, 0.14, ry); }
      if (lanterns) for (const [ox, oz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const [px, pz] = rot(ox * (w / 2 + 0.6), oz * (d / 2 + 0.6), ry); b.sphere(lantern, x + px, y + h + 1.7, z + pz, 0.55, { seg: 5 }); }
    };
    ring.forEach(([x, z], i) => { if (i % 3 && ![0, 9, 18, 27].includes(i)) return; gTower(x, z, { w: 10, h: 25, y: H(x, z), col: jit(i % 2 ? 0x9a4636 : WBODY, rr, 0.008, 0.04, 0.03), ry: (i / N) * 6.28 }); });
    const gate = (i, ry) => { const [x, z] = ring[i], y = H(x, z), c2 = Math.cos(ry), s = Math.sin(ry);
      for (const sg of [-1, 1]) gTower(x + sg * 14 * c2, z - sg * 14 * s, { w: 12, d: 16, h: 32, y, ry, col: jit(0x9a4636, rr, 0.008, 0.04, 0.03), lanterns: true });
      b.box(brick, x, y + 8, z, 20, 15, 14, ry, jit(0xd9a870, rr)); b.box(dark, x, y, z, 8, 9, 14.3, ry);
      b.box(stone, x, y + 9, z, 10.6, 1.0, 14.6, ry, 0xe6d9bc); b.box(stone, x, y + 9.9, z, 9.2, 0.7, 14.8, ry, 0xcdbf9e); // carved lintel
      for (const sg of [-1, 1]) { const [px, pz] = rot(sg * 4.6, 0, ry); b.box(stone, x + px, y, z + pz, 1.2, 9.2, 14.5, ry, 0xd8cba8); }
      b.box(brick, x, y + 22, z, 30, 1.4, 15.4, ry, jit(CREAM, rr, 0.01, 0.04, 0.03));
      for (const o of [-6, -2, 2, 6]) { const [px, pz] = rot(o, 7.35, ry); b.box(flat(0xffffff), x + px, y + 14, z + pz, 2.6, 5.5, 0.3, ry, jit(0x7a3a2a, rr)); b.box(flat(0xffffff), x + px, y + 15.2, z + pz + 0.0, 1.4, 1.6, 0.4, ry, 0xd9b068); } // relief panels
      harpy(b, bronze, x, y + 23.4, z, 1.6, Math.PI / 2 - (i / N) * Math.PI * 2); // faces out across the plain
      return [x, z]; };
    const gN = gate(27, 0), gS = gate(9, 0), gE = gate(0, Math.PI / 2), gW = gate(18, Math.PI / 2);

    // ---- stepped pyramid builder: battered tiers, cream cornices, parapets, central stairs, terrace gardens
    const pyrs = [];
    const garden = (x, z, y, sL, sU, n, ry, avoidHalf) => { // hedges + shrubs in the terrace band between a tier's edge (sL) and the next tier's face (sU)
      const mid = (sL + sU) / 4, bandW = (sL - sU) / 2 - 1.8; if (bandW < 1.4) return;
      for (const [ox, oz, bw, bd] of [[0, -mid, sU + bandW, 1.2], [mid, 0, 1.2, sU], [-mid, 0, 1.2, sU]]) { const [px, pz] = rot(ox, oz, ry); b.box(leaf, x + px, y, z + pz, bw, 0.8, bd, ry, jit(0x3f5a30, rr, 0.02, 0.05, 0.04)); }
      for (let k = 0; k < n; k++) { const side = rr.int(0, 3), along = rr.range(-sU / 2, sU / 2); if (side === 2 && Math.abs(along) < avoidHalf) continue;
        const off = mid + rr.range(-bandW / 2 + 0.6, bandW / 2 - 0.6), [lx, lz] = side === 0 ? [along, -off] : side === 1 ? [off, along] : side === 2 ? [along, off] : [-off, along], [px, pz] = rot(lx, lz, ry);
        b.sphere(leaf, x + px, y, z + pz, rr.range(0.9, 1.7), { seg: 5, sy: 0.85, color: jit(0x3f6034, rr, 0.03, 0.07, 0.05) }); }
    };
    function pyramid(x, z, { base, steps, stepH, shrink = 0.84, ry = 0, cols, first = stepH, topDome = true, gardenFrom = 99, stairW = 0.3 }) {
      let s = base, y = H(x, z), top = y;
      const y0 = y;
      for (let i = 0; i < steps; i++) {
        const sh = i === 0 ? first : stepH, col = jit(dusty(cols[i % cols.length], 0.18), rr, 0.01, 0.05, 0.04).multiplyScalar(0.86 + 0.2 * i / Math.max(1, steps - 1)), ns = s * shrink;
        b.box(brick, x, y - (i ? 0 : 3), z, s, sh + (i ? 0 : 3), s, ry, col);
        if (i === 0) b.box(brick, x, y - 3, z, s + 2.2, 4.4, s + 2.2, ry, shade(cols[0], 0.7)); // battered footing
        b.box(brick, x, y + sh - 0.3, z, s + 1.0, 1.0, s + 1.0, ry, jit(CREAM, rr, 0.01, 0.04, 0.03)); // cornice lip
        for (const [ox, oz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const [px, pz] = rot(ox * (s / 2 - 0.3), oz * (s / 2 - 0.3), ry); b.sphere(lantern, x + px, y + sh + 1.9, z + pz, 0.5, { seg: 5 }); }
        for (const [fx, fz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) for (const k of [-1, 1]) { const [px, pz] = rot(fx * (s / 2 + 0.05) + fz * k * s * 0.28, fz * (s / 2 + 0.05) + fx * k * s * 0.28, ry); b.box(windowG, x + px, y + sh * 0.35, z + pz, fz ? 0.9 : 0.12, sh * 0.42, fx ? 0.9 : 0.12, ry); }
        // parapet around the terrace
        const ty = y + sh + 0.7;
        for (const [ox, oz, bw, bd] of [[0, s / 2 - 0.3, s - 0.6, 0.7], [0, -s / 2 + 0.3, s - 0.6, 0.7], [s / 2 - 0.3, 0, 0.7, s - 1.8], [-s / 2 + 0.3, 0, 0.7, s - 1.8]]) { const [px, pz] = rot(ox, oz, ry); b.box(brick, x + px, ty - 0.1, z + pz, bw, 0.9, bd, ry, shade(cols[i % cols.length], 0.9)); }
        if (i < steps - 1) {
          if (i >= gardenFrom) garden(x, z, ty, s, ns, 3 + (i % 3), ry, s * stairW * 0.25 + 2.5);
          // stair up from this terrace to the next tier (south / +z side in local frame)
          const run = (s - ns) / 2 - 1.0, [px, pz] = rot(0, s / 2 - 0.5, ry), [ix, iz] = rot(0, -1, ry);
          if (run > 1) stair(b, stone, x + px, ty - 0.2, z + pz, ix, iz, { run, rise: stepH + 0.2, width: s * stairW * 0.5, steps: 6, color: 0xd9ccaa });
        }
        y += sh + 0.7; s = ns; top = y;
      }
      // ground stair on the south face
      const run0 = Math.max(10, base * 0.2), [gpx, gpz] = rot(0, base / 2 + run0 - 0.2, ry), [gix, giz] = rot(0, -1, ry);
      stair(b, stone, x + gpx, y0, z + gpz, gix, giz, { run: run0, rise: first + 0.7, width: base * stairW * 0.65, steps: Math.round(first * 0.9 + 2), color: 0xd9ccaa });
      // crown: plaster pavilion with a gilded dome
      b.box(plaster, x, y, z, s, 2.4, s, ry, jit(CREAM, rr, 0.01, 0.04, 0.03));
      if (topDome) { b.box(brick, x, y + 2.4, z, s * 0.75, 0.6, s * 0.75, ry, shade(cols[0], 0.85)); b.dome(goldM, x, y + 3, z, s * 0.34, { seg: 12, sy: 0.85 }); b.sphere(goldM, x, y + 3 + s * 0.34 * 0.85, z, 0.55, { seg: 6 }); }
      pyrs.push({ x, z, r: base * 0.74 });
      return { top: y + 6, y };
    }

    // ---- Great Pyramid with harpy on top (9 tiers, central stair, hanging gardens on the upper terraces)
    const GP = [0, -6], gy0 = H(...GP);
    const GPC = [0xc87052, 0xd8ab62, 0xb3593f, 0x83a081, 0xd9ceb2, 0xc27a52, 0x7096a8, 0xc9984c, 0xcf8f66];
    const gp = pyramid(GP[0], GP[1], { base: 88, steps: 9, stepH: 8, shrink: 0.87, first: 11, cols: GPC, topDome: false, gardenFrom: 3, stairW: 0.3, ry: Math.PI }); // grand stair faces the bay
    const gpY = gp.y + 2.4; // top plane of the summit slab
    const gpTop = gpY + 6;
    {
      const s9 = 88 * Math.pow(0.87, 9), x = GP[0], z = GP[1];
      // summit terrace: paving, planted beds and a pool around the queen's apartments; the bronze harpy crowns the apartments' roof
      b.box(stone, x, gpY, z, s9 - 1.2, 0.3, s9 - 1.2, 0, 0xd9ccaa);
      for (const [ox, oz, bw, bd] of [[0, s9 / 2 - 2.4, s9 - 5, 1.8], [0, -s9 / 2 + 2.4, s9 - 5, 1.8], [s9 / 2 - 2.4, 0, 1.8, s9 - 8.6], [-s9 / 2 + 2.4, 0, 1.8, s9 - 8.6]]) { b.box(brick, x + ox, gpY + 0.3, z + oz, bw, 0.7, bd, 0, 0x8a5a40); b.box(leaf, x + ox, gpY + 1.0, z + oz, bw - 0.4, 0.5, bd - 0.4, 0, jit(0x4a6a36, rr)); }
      for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, rx = Math.cos(a) * (s9 / 2 - 2.4), rz = Math.sin(a) * (s9 / 2 - 2.4); b.sphere(leaf, x + K.clamp(rx * 1.3, -s9 / 2 + 2.4, s9 / 2 - 2.4), gpY + 1.2, z + K.clamp(rz * 1.3, -s9 / 2 + 2.4, s9 / 2 - 2.4), rr.range(0.9, 1.5), { seg: 6, sy: 0.9, color: jit(0x3f5f32, rr, 0.03, 0.06, 0.05) }); }
      const pw = s9 * 0.4, pd = s9 * 0.36; // apartments
      b.box(plaster, x, gpY + 0.3, z + 1.5, pw, 5.6, pd, 0, 0xeee2c6); b.box(stone, x, gpY + 5.9, z + 1.5, pw + 1.2, 0.6, pd + 1.2, 0, 0xe6d9bc); b.box(goldM, x, gpY + 6.5, z + 1.5, pw + 0.4, 0.35, pd + 0.4);
      for (let k = -1; k <= 1; k++) { b.box(dark, x + k * pw * 0.3, gpY + 0.3, z + 1.5 - pd / 2 - 0.05, 1.5, 3.6, 0.2); b.box(goldM, x + k * pw * 0.3, gpY + 3.9, z + 1.5 - pd / 2 - 0.1, 1.9, 0.3, 0.3); }
      for (let k = -2; k <= 2; k++) b.cyl(stone, x + k * pw * 0.22, gpY + 0.3, z + 1.5 - pd / 2 - 1.6, 0.35, 5.6, { seg: 8, color: 0xeee2c6 }); // loggia
      b.box(stone, x, gpY + 6.85, z + 1.5, 6.4, 1.2, 6.4, 0, 0xd8ccae); b.box(stone, x, gpY + 8.05, z + 1.5, 4.6, 1.6, 4.6, 0, 0xe3d8bd); // stepped plinth
      harpy(b, bronze, x, gpY + 9.65, z + 1.5, 3.1, 2.55); // faces the bay
      // great doors at the flanks of the central stair
      for (const sg of [-1, 1]) { b.box(dark, x + sg * 26, gy0, z - 44.1, 8, 10, 0.5); b.box(bronze, x + sg * 26, gy0, z - 44.3, 9.6, 1, 0.6); b.box(stone, x + sg * 26, gy0 + 10, z - 44.3, 10.4, 1.2, 1.0, 0, 0xe6d9bc); }
    }
    // ---- other pyramids (the great houses)
    pyrs.length = 0; pyrs.push({ x: GP[0], z: GP[1], r: 66 });
    const hazTop = pyramid(52, 52, { base: 46, steps: 7, stepH: 6.5, shrink: 0.82, ry: 0.1 + Math.PI, cols: [0xcf5f43, 0xe3b04e, 0xcf5f43, 0x5f9a72], gardenFrom: 2 }).top;
    const loraqTop = pyramid(-52, 74, { base: 42, steps: 7, stepH: 6, shrink: 0.82, ry: -0.1 + Math.PI, cols: [0x4a86ac, 0xdcd4bc, 0x4a86ac, 0xe3b04e], gardenFrom: 2 }).top;
    pyramid(-120, -40, { base: 30, steps: 5, stepH: 5.6, ry: 0.3 + Math.PI, cols: PAL }); pyramid(70, -52, { base: 34, steps: 5, stepH: 5.6, ry: -0.2 + Math.PI, cols: [0xb8473a, 0xe3b04e] }); pyramid(-120, 60, { base: 28, steps: 4, stepH: 5.4, ry: Math.PI, cols: [0x5f9a72, 0xdcd4bc] });
    pyramid(10, 88, { base: 30, steps: 5, stepH: 5.4, ry: 0.2 + Math.PI, cols: [0xe0834a, 0x4a86ac] }); pyramid(100, 20, { base: 26, steps: 4, stepH: 5.4, ry: Math.PI, cols: [0xe3b04e, 0xb8473a] });

    // ---- Daznak's Pit (west of the Great Pyramid): ringed brick bowl with arched galleries
    const PIT = [-92, 6], pitR = 30, py = H(...PIT);
    { // stepped bowl as lathe profiles: tread + riser per tier, tiers descending toward the sand floor
      const lathe = (pts) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 40), M4 = new THREE.Matrix4().makeTranslation(PIT[0], py, PIT[1]);
      const pitBrick = tri('brick', { color: 0xffffff, scale: 5, snow: false, side: THREE.DoubleSide });
      b.addGeometry(pitBrick, lathe([[pitR, -3], [pitR, 12]]), M4, jit(0xb87a52, rr));
      for (let i = 0; i < 6; i++) { const rO = pitR - 2.6 * i, top = 12 - 1.6 * i, pts = [[rO, top], [rO - 2.6, top]]; if (i < 5) pts.push([rO - 2.6, top - 1.6]);
        b.addGeometry(pitBrick, lathe(pts), M4, jit(i % 2 ? 0xd9a870 : PAL[(i * 2) % PAL.length], rr)); }
      b.addGeometry(pitBrick, lathe([[pitR + 0.7, 11.4], [pitR + 0.7, 12.7], [pitR - 0.9, 12.7], [pitR - 0.9, 11.4]]), M4, jit(CREAM, rr)); // rim cornice (ring)
      b.cyl(flat(0xe2c791, { rough: 1 }), PIT[0], py + 3.7, PIT[1], 14.6, 0.35, { seg: 36 });
    }
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.28; b.box(dark, PIT[0] + Math.cos(a) * (pitR + 0.2), py, PIT[1] + Math.sin(a) * (pitR + 0.2), 4, 6.2, 1.4, -a + 1.57); b.box(stone, PIT[0] + Math.cos(a) * (pitR + 0.3), py + 6.2, PIT[1] + Math.sin(a) * (pitR + 0.3), 5.4, 0.9, 1.9, -a + 1.57, 0xe4d8b8); }
    for (let i = 0; i < 16; i++) { const a = (i / 16) * 6.28 + 0.2; b.sphere(lantern, PIT[0] + Math.cos(a) * (pitR + 0.2), py + 13.2, PIT[1] + Math.sin(a) * (pitR + 0.2), 0.5, { seg: 5 }); }
    // ---- Temple of the Graces: broad court with colonnade and golden domes, west of the Great Pyramid
    const TP = [-62, -74]; { const [x, z] = TP, y = H(x, z), top = y + 5; // podium, full peristyle, flat roof, cella with golden domes
      b.box(stone, x, y - 1, z, 44, 6, 34, 0, 0xd2c8ad); b.box(stone, x, y + 4.4, z, 46, 1.1, 36, 0, 0xe8dcc0);
      stair(b, stone, x, y, z + 17 + 6, 0, -1, { run: 6, rise: 5.6, width: 16, steps: 7, color: 0xe0d3b4 });
      const col = (cx, cz) => { b.cyl(stone, cx, top + 0.5, cz, 0.85, 8.4, { top: 0.86, seg: 10, color: 0xe9e0c8 }); b.box(stone, cx, top + 8.9, cz, 2.0, 0.55, 2.0, 0, 0xe6dcc2); };
      for (let i = 0; i < 9; i++) for (const sg of [-1, 1]) col(x - 19 + i * 4.75, z + sg * 14.5);
      for (let i = 1; i < 6; i++) for (const sg of [-1, 1]) col(x + sg * 19, z - 14.5 + i * 4.83);
      b.box(plaster, x, top + 9.45, z, 41.4, 1.3, 31.4, 0, 0xeee4c8); b.box(goldM, x, top + 10.75, z, 42, 0.35, 32); b.box(stone, x, top + 11.1, z, 40, 0.7, 30, 0, 0xddd2b6); // entablature + roof
      b.box(stone, x, top + 0.5, z, 22, 13.5, 16, 0, 0xe0d5b8); b.box(stone, x, top + 14, z, 23, 0.8, 17, 0, 0xcfc3a2); // cella
      b.cyl(stone, x, top + 14.8, z, 6.4, 2.6, { seg: 18, color: 0xe6dcc2 }); b.dome(goldM, x, top + 17.4, z, 6.6, { seg: 18, sy: 0.92 }); b.cyl(goldM, x, top + 17.4 + 6.1, z, 0.3, 2.4, { seg: 6 }); b.sphere(goldM, x, top + 17.4 + 8.4, z, 0.5, { seg: 6 });
      for (const [ox, oz] of [[-8, -5], [8, -5], [-8, 5], [8, 5]]) { b.cyl(stone, x + ox, top + 14.8, z + oz, 2.3, 1.2, { seg: 12, color: 0xe6dcc2 }); b.dome(goldM, x + ox, top + 16, z + oz, 2.4, { seg: 12 }); }
      for (const [ox, oz] of [[-19.6, -15], [19.6, -15], [-19.6, 15], [19.6, 15]]) { b.dome(goldM, x + ox, top + 11.8, z + oz, 1.6, { seg: 10 }); }
      b.box(dark, x - 0, top + 0.5, z + 8.1, 4, 7, 0.3); b.box(goldM, x, top + 7.5, z + 8.15, 5, 0.5, 0.4); }
    // ---- Plaza of Purification with a bronze harpy
    const PP = [78, -14]; { const [x, z] = PP, y = H(x, z); b.box(paving, x, y - 0.1, z, 34, 0.4, 34, 0, 0xe0c9a0); b.box(stone, x, y + 0.2, z, 30, 0.2, 30, 0, 0xc9b184);
      b.cyl(stone, x, y, z, 5.4, 0.9, { seg: 20, color: 0xe4d8bc }); b.cyl(stone, x, y + 0.9, z, 4.4, 0.7, { seg: 20, color: 0xd9ccaa }); b.cyl(stone, x, y + 1.6, z, 1.4, 3, { seg: 10, color: 0xe4d8bc }); harpy(b, bronze, x, y + 4.6, z, 2.4, 0);
      for (const [ox, oz] of [[-15, -15], [15, 15], [-15, 15], [15, -15]]) { b.cyl(stone, x + ox, y, z + oz, 0.8, 4.4, { top: 0.85, seg: 8, color: 0xe4d8bc }); b.sphere(lantern, x + ox, y + 5.1, z + oz, 0.55, { seg: 5 }); } }

    // ---- streets
    const gNk = gN, streets = [[gNk, [0, -44], [0, 40], gS], [gW, [-50, 6], [50, 6], gE], [[-80, -75], [0, -44]], [[85, -60], [0, -44]], [[-60, 90], [0, 40]], [[60, 90], [0, 40]]];
    streets.forEach((s, i) => b.ribbon(roadMat, K.smoothPath(s, 4), i < 2 ? 11 : 7, heightAt, 0.12, 0xe6cfa0));

    // ---- houses (muted multi-coloured brick, varied massing)
    const poly = ring.map(([x, z]) => [CX + (x - CX) * 0.93, CZ + (z - CZ) * 0.93]);
    const dist = (x, z) => Math.min(...streets.map((s) => K.distToPolyline(x, z, s).d));
    const clear = (x, z) => dist(x, z) < 7.5 || pyrs.some((p) => Math.hypot(x - p.x, z - p.z) < p.r + 4) || Math.hypot(x - PIT[0], z - PIT[1]) < pitR + 5 || (Math.abs(x - TP[0]) < 30 && Math.abs(z - TP[1]) < 25) || (Math.abs(x - PP[0]) < 22 && Math.abs(z - PP[1]) < 22);
    const pts = K.scatter({ rng: K.rng(31), count: q.dens(430), bounds: [-170, -120, 120, 130], poly, minDist: 8, avoid: clear });
    const placed = [];
    for (const [x, z] of pts) {
      const w = rr.range(6, 10), d = rr.range(6, 10) * rr.range(1, 1.3), h = rr.range(4.5, 11), ry = Math.round(rr() * 2) * Math.PI / 2 + rr.range(-0.06, 0.06), y = H(x, z);
      const fam = rr.pick(PAL), col = jit(fam, rr, 0.014, 0.08, 0.06), sn = Math.sin(ry), cs = Math.cos(ry), kind = rr();
      b.box(brick, x, y - 1.4, z, w + 0.6, 2.6, d + 0.6, ry, shade(fam, 0.7)); // weathered footing
      b.box(brick, x, y + 1.2, z, w, h - 1.2, d, ry, col);
      b.box(brick, x, y + h - 0.5, z, w + 0.8, 1.0, d + 0.8, ry, jit(CREAM, rr, 0.01, 0.05, 0.04)); // cornice
      if (kind < 0.28) { const w2 = w * 0.6, d2 = d * 0.6, h2 = rr.range(2.6, 4.4), c2 = jit(rr.pick(PAL), rr); b.box(brick, x + rr.range(-1, 1), y + h + 0.5, z, w2, h2, d2, ry, c2); b.box(brick, x, y + h + 0.5 + h2 - 0.4, z, w2 + 0.6, 0.8, d2 + 0.6, ry, CREAM); if (rr() < 0.5) b.box(windowG, x + sn * (d2 / 2 + 0.06), y + h + 2, z + cs * (d2 / 2 + 0.06), 0.9, 1.3, 0.12, ry); }
      else if (kind < 0.33) { const big = rr() < 0.25; b.dome(big ? goldM : plaster, x, y + h + 0.5, z, Math.min(w, d) * 0.4, { seg: 10, sy: 0.85, color: big ? 0xffffff : jit(CREAM, rr) }); }
      else if (kind < 0.62) { const ac = rr.pick(clothC), [px, pz] = rot(0, d / 2 + 1.0, ry); b.box(cloth, x + px, y + h * 0.58, z + pz, w * 0.8, 0.2, 2.2, ry, jit(ac, rr), -0.28, 0); }
      else if (kind < 0.76) { b.box(brick, x + w * 0.25, y + h + 0.5, z - d * 0.2, 2.2, 2.4, 2.2, ry, shade(fam, 0.85)); } // stair-head / vent
      const [dpx, dpz] = rot(0, d / 2 + 0.06, ry);
      b.box(dark, x + dpx, y, z + dpz, 1.5, 2.5, 0.2, ry); b.box(stone, x + dpx, y + 2.5, z + dpz, 2.3, 0.4, 0.4, ry, 0xe0d4b6);
      for (const sd of [-1, 1]) { const [wx, wz] = rot(sd * w * 0.28, d / 2 + 0.06, ry); b.box(windowG, x + wx, y + h * 0.55, z + wz, 0.9, 1.3, 0.12, ry); }
      placed.push({ x, z, h });
    }

    // ---- harbour and the river quay
    b.box(brick, -20, -3, coastZ(-20) + 3, 190, 5.8, 4, 0, 0xb0805a); b.box(stone, -20, 2.4, coastZ(-20) + 3, 191, 0.7, 4.8, 0, 0xe0d2b0);
    for (const px of [-90, -60, -30, 0, 30, 60, 90]) { K.pier(b, px, 1.7, coastZ(px) + 2, { len: 30, w: 4.5, ry: Math.PI / 2, mat: wood }); b.sphere(lantern, px, 3.4, coastZ(px) + 4.6, 0.45, { seg: 5 }); }
    for (const sg of [-1, 1]) { b.box(brick, -20 + sg * 100, -3, coastZ(-20) - 14, 4, 6, 28, 0, 0xc97a52); }
    // Skahazadhan city bank: a continuous brick embankment with a cream coping, washing steps and short timber jetties
    const RLn = K.polyLength(RIVER), bank = (sv, o) => { const p = K.pointAlong(RIVER, sv); return { x: p.x + Math.cos(p.angle) * o, z: p.z - Math.sin(p.angle) * o, a: p.angle }; };
    const sAtZ = (z) => { let best = 0, bd = 1e9; for (let sv = 0; sv <= RLn; sv += 2) { const d = Math.abs(K.pointAlong(RIVER, sv).z - z); if (d < bd) { bd = d; best = sv; } } return best; };
    const rv = (z) => { const p = bank(sAtZ(z), 0); return [p.x, z]; };
    { const s0 = sAtZ(78), s1 = sAtZ(-122);
      for (let sv = s0; sv < s1; sv += 6) { const p = bank(sv + 3, 13.2), ry = p.a - Math.PI / 2;
        b.box(brick, p.x, -3.5, p.z, 6.4, 6.1, 2.6, ry, jit(0x9a5a40, rr, 0.008, 0.04, 0.04)); b.box(stone, p.x, 2.6, p.z, 6.5, 0.45, 3.0, ry, 0xe2d4b2); }
      for (let k = 0; k < 6; k++) { const sv = s0 + (s1 - s0) * (k + 0.5) / 6, p = bank(sv, 9.6), ry = p.a - Math.PI / 2; // jetty
        b.box(wood, p.x, 1.5, p.z, 3.0, 0.45, 8.0, ry, 0x8a6a48); const e = bank(sv, 5.8); b.cyl(wood, e.x, -2, e.z, 0.25, 4.6, { seg: 5 }); b.sphere(lantern, e.x, 2.8, e.z, 0.35, { seg: 5 }); }
      for (const k of [1, 3, 5]) { const sv = s0 + (s1 - s0) * k / 6, p = bank(sv, 11.4), ry = p.a - Math.PI / 2; for (let j = 0; j < 4; j++) { const q2 = bank(sv, 13.2 - j * 1.1); b.box(stone, q2.x, -2.5, q2.z, 5, 5 - j * 0.75, 1.15, ry, 0xd9caa6); } } }
    // brick sewer outfalls (arched mouths in the embankment) into the Skahazadhan
    for (const z of [-20, 24, 60]) { const sv = sAtZ(z), p = bank(sv, 12.0), ry = p.a - Math.PI / 2; b.box(brick, p.x, -1.2, p.z, 5.2, 3.9, 1.6, ry, 0x7a3a2a); const m = bank(sv, 11.15); b.box(dark, m.x, -0.6, m.z, 2.6, 2.4, 0.3, ry); b.box(stone, m.x, 1.8, m.z, 3.4, 0.5, 0.6, ry, 0xd9caa6); }
    { const built = b.build({}), noShadow = new Set([windowG, lantern, dark, cloth]); built.children.forEach((m) => { if (noShadow.has(m.material)) m.castShadow = false; }); root.add(built); }

    // ---- apex terrace trees, river trees (instanced palms), farmland trees
    const pbt = new Batch(), trunkM = flat(0xffffff, { rough: 1, flatShading: false }), greens = [0x4f8a3c, 0x5c9340, 0x437a37, 0x6c9a45];
    const palm = (x, y, z, k) => { const lean = rr.range(-0.2, 0.2), gc = rr.pick(greens), th = 6.8 * k;
      pbt.cyl(trunkM, x, y, z, 0.34 * k, th, { top: 0.6, seg: 5, color: 0x9a7e58 });
      for (let i = 0; i < 7; i++) { const a = i * 0.9 + rr() * 0.3; pbt.box(leaf, x + Math.cos(a) * 1.5 * k, y + th - 0.3 * k, z + Math.sin(a) * 1.5 * k, 3.4 * k, 0.16, 1.0 * k, -a, jit(gc, rr, 0.02, 0.05, 0.05), 0, 0.42); }
      pbt.sphere(leaf, x, y + th, z, 0.5 * k, { seg: 5, color: 0x6a5a38 }); };
    for (let i = 0; i < 12; i++) palm(GP[0] + rr.range(-10, 4) - 4, gpY + 0.35, GP[1] + rr.range(2, 10), 0.8);
    for (let i = 0; i < q.dens(80); i++) { const p = K.pointAlong(RIVER, rr() * K.polyLength(RIVER)); const o = rr.range(-34, 34); if (Math.abs(o) < 12) continue; const x = p.x + Math.cos(p.angle) * o, z = p.z - Math.sin(p.angle) * o; if (ell(x, z) < 1.12 || z < coastZ(x) + 8) continue; palm(x, H(x, z), z, rr.range(0.9, 1.3)); }
    root.add(pbt.build({}));
    // dry scrub
    { const sc = new K.Inst(G.cone(6), instMat), rs = K.rng(70); for (let i = 0; i < q.dens(80); i++) { const x = rs.range(-340, 340), z = rs.range(-250, 300); if (ell(x, z) < 1.25 || z < coastZ(x) + 6 || rivD(x, z) < 20) continue; const k = rs.range(1.2, 2.4); sc.add(x, H(x, z), z, k, k * 1.2, k, rs() * 3, [0x7f8a4a, 0x6b7a40, 0x8f9556][i % 3]); } root.add(sc.build()); }
    // market stalls in the lower city near the east gate road
    { const awn = new K.Inst(G.box(), instMat), post = new K.Inst(G.cyl(5, 1), instMat);
      for (let i = 0; i < 20; i++) { const x = 62 + (i % 5) * 8.2, z = 14 + Math.floor(i / 5) * 8; if (dist(x, z) < 6.5 || pyrs.some((p) => Math.hypot(x - p.x, z - p.z) < p.r + 3) || Math.abs(x - PP[0]) < 22 && Math.abs(z - PP[1]) < 22) continue; const y = H(x, z); awn.add(x, y + 2.8, z, 6, 0.25, 4.2, 0.04 * i, clothC[i % 5]); for (const [dx, dz] of [[-2.7, -1.8], [2.7, -1.8], [-2.7, 1.8], [2.7, 1.8]]) post.add(x + dx, y, z + dz, 0.12, 2.8, 0.12, 0, 0x5a3f2a); }
      root.add(awn.build(), post.build()); }

    // ---- ships and river barges
    const ships = [], defs = [['cog', 20, -60, -150, 0.1], ['galley', 26, -10, -165, -0.2], ['cog', 18, 40, -148, 0.5], ['dhow', 15, 100, -190, 1.2], ['galley', 24, -120, -200, 2.0], ['cog', 20, 20, -220, 0.8]];
    defs.forEach(([type, len, x, z, ph], i) => { const s = K.ship(type, { len, hull: 0x6a4a30, sail: [0xe9dcc0, 0xc9694a, 0xdcb25a][i % 3] }); s.position.set(x, 0.2, z); s.rotation.y = ph; root.add(s); ships.push({ s, x, z, ph, i }); });
    const barges = [0, 1, 2].map((i) => { const s = K.ship('barge', { len: 12, hull: 0x7a5a38, sail: 0xe0d0a8 }); root.add(s); return s; }), RL = K.polyLength(RIVER);
    ctx.onUpdate((dt, t) => {
      for (const o of ships) { K.animateShip(o.s, t, o.ph); if (o.i >= 3) { o.s.position.x = o.x + Math.sin(t * 0.04 + o.ph) * 40; o.s.rotation.y = Math.PI / 2 - Math.cos(t * 0.04 + o.ph) * 0.4 + (o.i === 3 ? 0 : 3); } }
      barges.forEach((s, i) => { const u = ((t * 2.2 + i * RL / 3) % RL), p = K.pointAlong(RIVER, RL - u), p2 = K.pointAlong(RIVER, Math.max(0, RL - u - 3)); s.position.set(p.x, 0.15, p.z); s.rotation.y = Math.atan2(-(p2.z - p.z), p2.x - p.x); K.animateShip(s, t, i); });
    });

    // ---- life
    root.add(K.smoke(placed.filter((_, i) => i % 7 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 3, p.z]), { color: 0xb9ada0, size: 20, rise: 15, opacity: 0.2 }));
    root.add(K.smoke(Array.from({ length: 22 }, () => { const a = rr() * 6.28, r = rr.range(170, 330); const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.8 + 20; return [x, H(x, z) + 1, z]; }), { color: 0xdcc08a, size: 70, rise: 7, opacity: 0.12, spread: 14, perStack: 5 }));
    root.add(K.banners(PAL.map((col, i) => { const [x, z] = ring[(i * 5) % N]; return { x: x + 2, y: H(x, z) + 36, z, w: 3.4, h: 9, color: col, ry: 0.4 }; })));
    const fire = K.fires([[PP[0] + 8, H(...PP) + 2.5, PP[1] + 8], [PP[0] - 8, H(...PP) + 2.5, PP[1] - 8], [PIT[0] + pitR - 1, py + 13.5, PIT[1]], [-24, 3.5, -44], [24, 3.5, -44], [GP[0] + 30, gy0 + 13, GP[1] - 50], [GP[0] - 30, gy0 + 13, GP[1] - 50]], { size: 9, light: q.low ? 0 : 3, intensity: 55 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const wk = K.walkers({ paths: [[gN, [0, -44], [0, 40], gS], [gW, [-50, 6], [50, 6], gE], [[-80, -75], [0, -44], [85, -60]], [PP, [20, 6], [-60, 6], PIT]], heightAt, count: q.dens(70), rng: K.rng(5), colors: [0xc86a4a, 0xd9a85a, 0x6f9a74, 0xe0d4b4, 0x5f8fb0, 0x8a6a3a] });
    root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const gulls = K.birds({ center: [0, 55, -120], radius: 100, count: q.dens(12), color: 0xf4f0e6, size: 1.3, spreadY: 16, seed: 4 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const kites = K.birds({ center: [0, 150, 0], radius: 60, count: q.dens(5), color: 0x2a2018, size: 2.4, spreadY: 10, seed: 9 }); root.add(kites); ctx.onUpdate((dt, t) => kites.userData.update(t));
    const cl = K.clouds({ y: 280, extent: 900, count: 9, opacity: 0.24, color: 0xf3e6d0 }); root.add(cl); ctx.onUpdate((dt, t) => cl.userData.update(dt));
    const pool = K.waterPatch({ w: 10, d: 7, level: gpY + 0.5, center: [GP[0] - 5, GP[1] + 6], depth: 0.8, deep: 0x2e6a78, shallow: 0x5a9a98, opacity: 0.9, seg: 2 }); root.add(pool); ctx.registerWater(pool);

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 270, center: [0, 0, -10], minDistance: 20,
      hero: { pos: [168, 96, -184], target: [0, 24, -8] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        day: { top: 0x4a86c4, horizon: 0xf1d9a8, fog: 0xe6cfa2, fogD: 0.00105, sunC: 0xffe4b4, sunI: 3.5, az: 4.3, elev: 0.55, hemiSky: 0xb8cfe8, hemiGround: 0x8a6a4a, hemiI: 0.85 },
        dawn: { top: 0x5b6aa4, horizon: 0xf4b48a, fog: 0xe2b392, fogD: 0.0014, sunC: 0xffb070, az: 4.5, hemiGround: 0x6a4a3e },
        dusk: { top: 0x3a4280, horizon: 0xf2a066, fog: 0xd89a7a, fogD: 0.0013, sunC: 0xffa060, sunI: 3.3, az: 4.2, hemiSky: 0x9a98c8, hemiGround: 0x7a5a4c, hemiI: 0.95 },
        night: { top: 0x0c1236, horizon: 0x2c3c66, fog: 0x1e2a48, fogD: 0.0018, sunC: 0xa8c0f8, sunI: 2.0, hemiSky: 0x6a7cc0, hemiGround: 0x3a3a50, hemiI: 1.55 },
      } },
      landmarks: {
        'great-pyramid': { pos: [GP[0], gy0 + 40, GP[1] - 44], r: 46 }, 'harpy-statue': { pos: [GP[0], gpTop + 14, GP[1] + 1.5], r: 10 }, 'apex-garden': { pos: [GP[0] - 6, gpTop - 4, GP[1] - 6], r: 14 },
        'pyramid-of-hazkar': lm(52, 52, 26, hazTop), 'pyramid-of-loraq': lm(-52, 74, 24, loraqTop), 'daznak-pit': lm(PIT[0], PIT[1], 30, 14), 'temple-of-graces': lm(TP[0], TP[1], 26, 26),
        'plaza-of-purification': lm(PP[0], PP[1], 20, 12), 'city-walls': lm(ring[22][0], ring[22][1], 16, 32), 'harbour': lm(10, coastZ(10) - 6, 34, 8), 'skahazadhan': lm(150, 0, 30, 6), 'lower-city': lm(20, 70, 36, 12), 'sewer-outfalls': lm(bank(sAtZ(24), 15).x, bank(sAtZ(24), 15).z, 8, 4),
      },
      cutaways: [{ id: 'daznak-pit', name: { en: 'Daznak\'s Pit (cutaway)', zh: '达兹纳克竞技场（剖面）' }, build: buildPit }],
    };
  },
};

function buildPit(ctx) {
  // Museum-style section through Daznak's Pit: the back half of the stepped brick bowl stands complete; the front half is sliced
  // away at ground level so the sand floor, the arena wall with its gates and the vaulted substructure under the seats all read.
  const g = ctx.root, b = new Batch(), rr = K.rng(17);
  const brick = tri('brick', { color: 0xffffff, scale: 10, snow: false, bump: 0.5, side: THREE.DoubleSide }), stone = tri('stone', { color: 0xe6dcc4, scale: 6, snow: false });
  const wood = tri('wood', { color: 0x6b4a2e, scale: 3, snow: false }), sandM = tri('sand', { color: 0xe0c48e, scale: 7, snow: false, bump: 0.4 });
  const cutM = flat(0xc79c76, { rough: 1 }), dark = flat(0x1a100c), cloth = flat(0xffffff, { rough: 1, side: THREE.DoubleSide, flatShading: false });
  const goldM = flat(0xe0b030, { rough: 0.35, metal: 0.6, flatShading: false }), instMat = new THREE.MeshStandardMaterial({ roughness: 0.95 });
  const R0 = 17, tiers = 11, TW = 2.7, TH = 1.45, PAL2 = [0xb8664a, 0xd6a95c, 0xd9ceb2, 0x5f8597, 0x9a4636];
  const latheB = (pts, a0 = Math.PI / 2, al = Math.PI, seg = 40) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, a0, al);
  const I = new THREE.Matrix4();
  // ground: paved precinct around the pit, sand floor, raked rings
  b.cyl(tri('sand', { color: 0xc9a47a, scale: 9, snow: false, bump: 0.3 }), 0, -1.2, 0, 95, 1.2, { seg: 48 });
  b.cyl(sandM, 0, -0.9, 0, R0, 1.0, { seg: 48 });
  for (const rr2 of [6, 11, 15]) b.addGeometry(flat(0xc9a874, { rough: 1 }), new THREE.RingGeometry(rr2 - 0.25, rr2, 48).rotateX(-Math.PI / 2), new THREE.Matrix4().makeTranslation(0, 0.13, 0));
  // arena wall (full circle - it is low), with a cream coping and four dark gates
  b.addGeometry(brick, latheB([[R0, -0.9], [R0, 3.4], [R0 + 1.1, 3.4], [R0 + 1.1, -0.9]], 0, Math.PI * 2, 56), I, 0x8e4a34);
  b.addGeometry(stone, latheB([[R0 - 0.25, 3.4], [R0 - 0.25, 3.85], [R0 + 1.35, 3.85], [R0 + 1.35, 3.4]], 0, Math.PI * 2, 56), I, 0xe8dcc0);
  for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) { const x = Math.sin(a) * (R0 + 0.55), z = Math.cos(a) * (R0 + 0.55); b.box(dark, x, -0.1, z, 3.4, 2.9, 1.4, a, 0xffffff); b.box(wood, x, -0.1, z, 3.2, 2.7, 0.3, a); b.box(stone, x, 2.8, z, 4.4, 0.6, 1.6, a, 0xe8dcc0); }
  // stepped seating: continuous banded tiers (back half)
  for (let i = 0; i < tiers; i++) {
    const r0 = R0 + 1.1 + i * TW, y0 = 3.4 + i * TH;
    b.addGeometry(brick, latheB([[r0, y0 - TH - 0.2], [r0, y0 + TH], [r0 + TW, y0 + TH], [r0 + TW, y0 - TH - 0.2]]), I, jit(PAL2[i % PAL2.length], rr, 0.008, 0.04, 0.03));
    b.addGeometry(stone, latheB([[r0 - 0.08, y0 + TH], [r0 - 0.08, y0 + TH + 0.22], [r0 + 0.7, y0 + TH + 0.22], [r0 + 0.7, y0 + TH]]), I, 0xe6dac0); // seat lip
  }
  const Rin = R0 + 1.1 + tiers * TW, topY = 3.4 + tiers * TH + TH;
  // outer arcade wall: two storeys of arches on the inner face, parapet with stepped merlons
  b.addGeometry(brick, latheB([[Rin, -0.9], [Rin, topY + 6], [Rin + 2.4, topY + 6], [Rin + 2.4, -0.9]], Math.PI / 2, Math.PI, 48), I, 0xa65644);
  b.addGeometry(stone, latheB([[Rin - 0.3, topY + 6], [Rin - 0.3, topY + 6.7], [Rin + 2.7, topY + 6.7], [Rin + 2.7, topY + 6]], Math.PI / 2, Math.PI, 48), I, 0xe8dcc0);
  for (let k = 0; k < 24; k++) { const a = Math.PI / 2 + (k + 0.5) / 24 * Math.PI, x = Math.sin(a) * (Rin - 0.05), z = Math.cos(a) * (Rin - 0.05);
    b.box(dark, x, topY + 0.6, z, 2.0, 4.0, 0.2, a);
    const mx = Math.sin(a) * (Rin + 2.2), mz = Math.cos(a) * (Rin + 2.2); b.box(brick, mx, topY + 6.7, mz, 2.2, 1.4, 0.8, a, 0xa65644); b.box(brick, mx, topY + 8.1, mz, 1.1, 0.6, 0.8, a, 0xa65644); }
  // section faces at the cut (x-axis): pale "cut" fill with the vaults under the seats exposed
  for (const sd of [-1, 1]) {
    const prof = [[R0, -0.9], [R0, 3.4]]; for (let i = 0; i < tiers; i++) { const r0 = R0 + 1.1 + i * TW, y0 = 3.4 + i * TH + TH; prof.push([r0, y0], [r0 + TW, y0]); }
    prof.push([Rin, topY + 6], [Rin + 2.4, topY + 6], [Rin + 2.4, -0.9]);
    const sh = new THREE.Shape(prof.map(([r, y]) => new THREE.Vector2(r * sd, y)));
    for (let v = 0; v < 4; v++) { const cx = (R0 + 5 + v * 7.2) * sd, top = 2.2 + v * 3.6; const hole = new THREE.Path(); hole.moveTo(cx - 2.2, 0); hole.lineTo(cx + 2.2, 0); hole.lineTo(cx + 2.2, top); hole.absarc(cx, top, 2.2, 0, Math.PI, false); hole.lineTo(cx - 2.2, 0); sh.holes.push(hole); }
    const sg = new THREE.ShapeGeometry(sh); b.addGeometry(cutM, sg, new THREE.Matrix4().makeTranslation(0, 0, 0.02 * sd), 0xffffff);
    for (let v = 0; v < 4; v++) { const cx = (R0 + 5 + v * 7.2) * sd; b.box(dark, cx, -0.9, -1.6, 4.4, 2.2 + v * 3.6 + 2.0, 3.0, 0); } // vault depth
  }
  // royal box (Hizdahr's pit box) at the back with a striped awning, and a lesser box beside it
  const bz = -(R0 + 1.1 + 4.5 * TW), by = 3.4 + 5 * TH + TH;
  b.box(brick, 0, 3.4, bz, 13, by - 3.4, 7, 0, 0x7a3b30); b.box(stone, 0, by, bz, 13.4, 1.0, 7.4, 0, 0xe6dac0); b.box(wood, 0, by + 1, bz - 2.6, 12, 1.2, 1.2, 0, 0x5a3a22);
  for (const sx of [-6, 6]) for (const sz of [-3.2, 3.2]) b.cyl(goldM, sx, by + 1, bz + sz, 0.22, 5.0, { seg: 6 });
  for (let k = 0; k < 7; k++) b.box(cloth, -6 + k * 2, by + 6, bz, 2.0, 0.25, 7.6, 0, k % 2 ? 0xe8dcc0 : 0x7a2a3a, 0.06, 0);
  for (let k = -2; k <= 2; k++) b.box(wood, k * 1.9, by + 1, bz + 1.2, 1.2, 1.6, 1.2, 0, 0x7a2a3a);
  // sand-floor props: a few posts and a weapon rack by the east gate; no gore
  for (const [x, z] of [[-5, 3], [6, -4], [1, 8]]) b.cyl(wood, x, 0, z, 0.22, 1.9, { seg: 5 });
  b.box(wood, R0 - 2.4, 0, -3, 0.3, 1.8, 3.4); for (let k = 0; k < 4; k++) b.cyl(flat(0x8a8a90, { metal: 0.6, rough: 0.4 }), R0 - 2.2, 0.1, -4.4 + k * 0.9, 0.06, 2.4, { seg: 4 });
  g.add(b.build({}));
  // crowd (back half) - muted robes, heads
  const crowd = new K.Inst(G.cyl(6, 0.75), instMat), head = new K.Inst(G.sphere(6), instMat), skin = [0x6b4a34, 0x8a6a4a, 0x5a3a28, 0xa07a56];
  const robes = [0x9a4a36, 0xb08a4a, 0xc9bca0, 0x4f6f80, 0x6a7a52, 0x7a3a4a];
  for (let i = 0; i < tiers; i++) { const r = R0 + 1.1 + i * TW + 1.0, y = 3.4 + i * TH + TH, n = Math.round(Math.PI * r / 1.15);
    for (let k = 0; k < n; k++) { if (rr() > 0.62) continue; const a = Math.PI / 2 + (k + rr.range(0.1, 0.9)) / n * Math.PI; if (Math.abs(Math.sin(a)) > 0.985) continue; const x = Math.sin(a) * r, z = Math.cos(a) * r;
      crowd.add(x, y, z, 0.36, 1.15, 0.36, 0, jit(rr.pick(robes), rr, 0.01, 0.05, 0.05)); head.add(x, y + 1.18, z, 0.2, 0.22, 0.2, 0, rr.pick(skin)); } }
  g.add(crowd.build(), head.build());
  // open evening sky over the bowl, and the Great Pyramid's silhouette beyond the rim
  { const sg = new THREE.SphereGeometry(400, 24, 12), col = [], top = new THREE.Color(0x1d2550), hor = new THREE.Color(0xd9825a), tmp = new THREE.Color();
    for (let i = 0; i < sg.attributes.position.count; i++) { const y = sg.attributes.position.getY(i) / 400; tmp.copy(hor).lerp(top, K.smoothstep(-0.02, 0.5, y)); if (y < 0) tmp.copy(hor).multiplyScalar(0.35); col.push(tmp.r, tmp.g, tmp.b); }
    sg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const sky = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -5; g.add(sky);
    const sil = new Batch(), sm = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, vertexColors: true });
    const stepPyr = (x, z, base, n, sh, k, col) => { let s = base, y = -2; for (let i = 0; i < n; i++) { sil.box(sm, x, y, z, s, sh, s, 0.2, col); y += sh; s *= k; } return y; };
    const gy = stepPyr(-30, -300, 150, 9, 16, 0.86, 0x5e403c); // the Great Pyramid, hazed by distance
    sil.box(sm, -30, gy, -300, 8, 9, 3, 0.2, 0x5e403c); for (const sd of [-1, 1]) sil.box(sm, -30 + sd * 7, gy + 6, -300, 9, 4, 1.2, 0.2 + sd * 0.5, 0x5e403c); // harpy
    stepPyr(150, -260, 60, 6, 9, 0.8, 0x74504a); stepPyr(-190, -250, 54, 5, 9, 0.8, 0x74504a);
    g.add(sil.build({ shadow: false, receive: false })); }
  // light: torches on the arena wall, warm key from the low sun side, cool sky fill
  const torches = []; for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i + 0.5) / 10 * Math.PI; torches.push([Math.sin(a) * (R0 + 0.6), 4.8, Math.cos(a) * (R0 + 0.6)]); }
  const fire = K.fires(torches, { size: 6, light: 3, intensity: 28, color: 0xff9a3c }); g.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
  const key = new THREE.DirectionalLight(0xffc890, 1.6); key.position.set(60, 50, 40); g.add(key); g.add(key.target);
  const fill = new THREE.HemisphereLight(0x8a9ad0, 0x4a3020, 0.9); g.add(fill);
  g.add(K.banners([-3, -1, 1, 3].map((k) => ({ x: Math.sin(Math.PI + k * 0.28) * (Rin + 1.2), y: topY + 9, z: Math.cos(Math.PI + k * 0.28) * (Rin + 1.2), w: 2.6, h: 7, color: [0xb8664a, 0xd6a95c][k > 0 ? 0 : 1], ry: 0 }))));
  return { center: [0, 6, -8], hero: { pos: [0, 30, 66], target: [0, 7, -10] }, minDistance: 8, maxDistance: 110 };
}
