// Braavos — the Secret City of a hundred isles. Book anchors: lagoon city of islands and canals, the Titan fortress-statue guarding the
// entrance (eyes burn with fire), the Arsenal just inside, Purple Harbor (Braavosi ships, north), Ragman's Harbor (foreign ships, west),
// the Sealord's Palace, the Iron Bank, the House of Black and White (secret interior - no cutaway), Isle of the Gods, the Drowned Town.
// Everything else (plan, shapes, colours) is interpretation - see content/braavos.js.
import * as K from '../kit/index.js';
const { THREE, Batch, tri, flat, glow } = K;

// ---------------------------------------------------------------------------------------------------------- small helpers
const _hsl = {};
/** hex -> Color with hue / saturation / lightness jitter (harmonious per-building variation inside one colour family). */
function jit(hex, r, dh = 0.012, ds = 0.05, dl = 0.045) {
  const c = new THREE.Color(hex); c.getHSL(_hsl);
  return c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, K.clamp(_hsl.s + r.range(-ds, ds), 0, 1), K.clamp(_hsl.l + r.range(-dl, dl), 0, 1));
}
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
const _cyl = new Map(), _quad = new THREE.PlaneGeometry(1, 1), _sph = new THREE.SphereGeometry(1, 12, 8);
const unitCyl = (seg, top) => { const k = seg + '|' + top; let g = _cyl.get(k); if (!g) { g = new THREE.CylinderGeometry(top, 1, 1, seg, 1); g.translate(0, 0.5, 0); _cyl.set(k, g); } return g; };
/** elliptical frustum sitting on y (rx, rz bottom radii; top = top radius fraction, may be > 1) */
function frust(b, mat, x, y, z, rx, rz, h, { top = 1, seg = 10, color = 0xffffff, ry = 0 } = {}) {
  _e.set(0, ry, 0); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s.set(rx, h, rz)); b.addGeometry(mat, unitCyl(seg, top), _m, color);
}
/** tapered cylinder between two points (limbs, spikes, rails) */
function limb(b, mat, A, C, r0, r1, seg = 9, color = 0xffffff) {
  _a.set(A[0], A[1], A[2]); _b.set(C[0], C[1], C[2]).sub(_a); const len = _b.length(); _q.setFromUnitVectors(_up, _b.normalize());
  const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1); g.translate(0, len / 2, 0);
  _m.compose(_a, _q, _s.set(1, 1, 1)); b.addGeometry(mat, g, _m, color); g.dispose();
}
/** thin upright plane facing local +Z rotated by ry; (x,y,z) is its centre */
function quad(b, mat, x, y, z, w, h, ry, color = 0xffffff) {
  _e.set(0, ry, 0); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s.set(w, h, 1)); b.addGeometry(mat, _quad, _m, color);
}
const FAMILIES = [
  { wall: [0x8f9cab, 0xa3afbb, 0x7f8e9e], roof: [0x4f6f8c, 0x5a7b78, 0x6a7d92], trim: 0xd9d6ca },           // slate blue
  { wall: [0xd9cdb2, 0xcdbf9f, 0xe2d6bb], roof: [0xa4583f, 0x93503a, 0xb0694a], trim: 0xf0e9d8 },           // cream & terracotta
  { wall: [0xc9a972, 0xbd9c68, 0xd3b482], roof: [0x8f4a3a, 0x6f5a6e, 0x7d5546], trim: 0xe8dec6 },           // ochre
  { wall: [0xc4a193, 0xb7978b, 0xd0b2a4], roof: [0x5b8a85, 0x4a7a78, 0x6a948c], trim: 0xe9ded2 },           // dusty rose & verdigris
  { wall: [0xa1b1a7, 0x91a499, 0xb3c0b5], roof: [0x8a5a46, 0xa4583f, 0x7a5a50], trim: 0xe4e2d4 },           // sea-green
  { wall: [0xb2a9bb, 0xa497ae, 0xc1b7c9], roof: [0x6b5c7a, 0x4f6f8c, 0x7a6684], trim: 0xe6e0ea },           // lavender-grey
];

/** a Braavosi canal house: plinth, plaster body, cornice, string course, gabled/hipped roof, dormers, chimney, lit windows, water door, balcony. */
function villa(b, M, x, y, z, o, r, out) {
  const { w, d, h, ry } = o, c = Math.cos(ry), s = Math.sin(ry);
  const L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  b.box(M.plaster, x, y - 1.2, z, w, h + 1.2, d, ry, o.wall);
  b.box(M.stone, x, y - 0.5, z, w + 0.26, 1.5, d + 0.26, ry, o.base);
  b.box(M.stone, x, y + h - 0.1, z, w + 0.7, 0.5, d + 0.7, ry, o.trim);
  if (h > 8.4) b.box(M.stone, x, y + h * 0.5, z, w + 0.34, 0.3, d + 0.34, ry, o.trim);
  const rh = K.clamp(d * 0.4, 1.7, 3.3), ry0 = y + h + 0.4;
  if (o.hip) b.pyramid(M.tile, x, ry0, z, w + 1, rh * 1.15, d + 1, ry, o.roofC); else b.prism(M.tile, x, ry0, z, w + 0.9, rh, d + 0.9, ry, o.roofC);
  if (!o.hip && o.dormer && w > 5.4) for (const sx of [-1, 1]) {
    const lz = d * 0.2 + 0.65, lx = sx * w * 0.22, roofH = rh * (1 - Math.abs(lz) / ((d + 0.9) / 2));
    const [dx, dz] = L(lx, d * 0.2), [fx, fz] = L(lx, lz + 0.1);
    b.box(M.plaster, dx, ry0 + roofH - 0.55, dz, 1.4, 1.7, 1.3, ry, o.wall);
    b.prism(M.tile, dx, ry0 + roofH + 1.1, dz, 1.9, 1.0, 1.9, ry + Math.PI / 2, o.roofC);
    quad(b, M.glowA, fx, ry0 + roofH + 0.35, fz, 0.7, 0.95, ry, 0xffffff);
  }
  if (o.chimney) {
    const [cx, cz] = L(o.w * 0.3 * (r() < 0.5 ? -1 : 1), -d * 0.16);
    b.box(M.plaster, cx, y + h, cz, 0.95, rh + 1.9, 0.95, ry, o.brick); b.box(M.stone, cx, y + h + rh + 1.9, cz, 1.3, 0.28, 1.3, ry, o.trim);
    if (out) out.push([cx, y + h + rh + 2.5, cz]);
  }
  const nF = h > 8.6 ? 2 : 1, nW = Math.max(1, Math.round((w - 1.4) / 2.3)), sp = (w - 1.4) / nW;
  for (const side of [1, -1]) {
    const ang = ry + (side < 0 ? Math.PI : 0);
    for (let f = 0; f < nF; f++) for (let i = 0; i < nW; i++) {
      const lx = (i + 0.5) * sp - (w - 1.4) / 2, wy = y + (nF === 1 ? h * 0.55 : h * (0.3 + 0.4 * f)), [wx, wz] = L(lx, side * (d / 2 + 0.12));
      const u = r(); quad(b, u < 0.62 ? (u < 0.34 ? M.glowA : M.glowB) : M.shut, wx, wy, wz, 0.85, 1.45, ang);
    }
    if (side === 1 || r() < 0.3) { const [wx, wz] = L(0, side * (d / 2 + 0.17)); quad(b, M.shut, wx, y + 1.15, wz, 1.5, 2.3, ang, 0x6a7178); }
  }
  if (h > 8.6 && w > 5.4 && r() < 0.24) {
    const [bx, bz] = L(0, d / 2 + 0.7); b.box(M.stone, bx, y + h * 0.5 - 0.2, bz, w * 0.55, 0.24, 1.4, ry, o.trim);
    const [rx, rz] = L(0, d / 2 + 1.35); b.box(M.iron, rx, y + h * 0.5 + 0.04, rz, w * 0.55, 0.85, 0.1, ry, 0xffffff);
  }
  if (o.porch && !o.hip) { const [px, pz] = L(w * 0.25, d / 2 + 0.9); b.prism(M.tile, px, y + 2.7, pz, 2.6, 0.75, 1.9, ry, o.roofC); }
}

/** bell tower with arched belfry and pyramidal spire */
function campanile(b, M, x, y, z, h, o, r) {
  const w = 3.3;
  b.box(M.plaster, x, y - 1.2, z, w, h + 1.2, w, 0, o.wall); b.box(M.stone, x, y - 0.4, z, w + 0.5, 1.4, w + 0.5, 0, o.base);
  for (const f of [0.34, 0.68]) b.box(M.stone, x, y + h * f, z, w + 0.3, 0.3, w + 0.3, 0, o.trim);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; quad(b, M.shut, x + Math.sin(a) * (w / 2 + 0.1), y + h * 0.5, z + Math.cos(a) * (w / 2 + 0.1), 0.45, 2.0, a, 0x6a7178); }
  b.box(M.plaster, x, y + h, z, w + 0.7, 4.0, w + 0.7, 0, o.trim);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; quad(b, M.shut, x + Math.sin(a) * (w / 2 + 0.46), y + h + 2.1, z + Math.cos(a) * (w / 2 + 0.46), 1.4, 2.5, a, 0x30363f); }
  b.box(M.stone, x, y + h + 4.0, z, w + 1.2, 0.5, w + 1.2, 0, o.trim);
  b.pyramid(o.copper ? M.copper : M.tile, x, y + h + 4.5, z, w + 0.9, 6.4, w + 0.9, 0, o.roofC);
  b.cone(M.gold, x, y + h + 10.7, z, 0.16, 2.2, { seg: 5 }); b.sphere(M.gold, x, y + h + 10.7, z, 0.38, { seg: 6 });
}
/** domed chapel */
function chapel(b, M, x, y, z, o, r) {
  const ry = o.ry || 0;
  b.box(M.plaster, x, y - 1.2, z, 8, 7.6, 8, ry, o.wall); b.box(M.stone, x, y - 0.5, z, 8.4, 1.5, 8.4, ry, o.base); b.box(M.stone, x, y + 6.3, z, 8.7, 0.5, 8.7, ry, o.trim);
  const c = Math.cos(ry), s = Math.sin(ry);
  for (let k = 0; k < 4; k++) { const a = ry + k * Math.PI / 2; quad(b, M.shut, x + Math.sin(a) * 4.14, y + 3.4, z + Math.cos(a) * 4.14, 1.3, 3.0, a, 0x3a4048); quad(b, M.glowA, x + Math.sin(a) * 4.17, y + 3.2, z + Math.cos(a) * 4.17, 0.7, 1.9, a); }
  frust(b, M.plaster, x, y + 6.7, z, 3.4, 3.4, 3.2, { top: 0.96, seg: 12, color: o.trim });
  b.dome(M.copper, x, y + 9.9, z, 3.7, { seg: 14, sy: 1.1, color: 0xffffff });
  frust(b, M.stone, x, y + 13.8, z, 0.8, 0.8, 1.2, { seg: 8, color: o.trim }); b.cone(M.gold, x, y + 15, z, 0.4, 1.6, { seg: 5 });
}

const TOP = 1.3;           // island surface height (water at 0)
const CANAL = 7;           // canal width between islands
const SEABED = -4.6;
const rect = (cx, cz, w, d) => ({ cx, cz, w, d });
const overlap = (a, b, m = 0) => Math.abs(a.cx - b.cx) < (a.w + b.w) / 2 + m && Math.abs(a.cz - b.cz) < (a.d + b.d) / 2 + m;

// special islands (hand-placed); the rest of the grid fills around them
const SP = {
  palace: rect(0, -112, 78, 44),
  bank: rect(78, -34, 50, 40),
  gods: rect(-62, -50, 44, 36),
  bw: rect(-104, 24, 24, 20),
  arsenal: rect(-92, 148, 92, 40),
  chequy: rect(58, 158, 64, 22),
  purple: rect(0, -148, 120, 14),
};
const DROWN = rect(138, 92, 96, 76);
const GRAND = [[2, 178], [4, 120], [-6, 56], [8, 4], [0, -50], [0, -88]];
const grandX = (z) => { for (let k = 0; k < GRAND.length - 1; k++) { const [x0, z0] = GRAND[k], [x1, z1] = GRAND[k + 1]; if (z <= z0 && z >= z1) return K.lerp(x0, x1, (z0 - z) / (z0 - z1)); } return 0; };

const ROCKS = [ // [x,z,r,h]  seaward "mountainous" islands, distant ridges
  [-205, 262, 52, 44], [240, 300, 58, 46], [-300, 120, 64, 50], [345, 40, 70, 46], [-345, -40, 80, 40], [360, -170, 90, 40],
  [-230, -260, 110, 50], [0, -430, 150, 44], [260, -280, 100, 44], [-210, 380, 70, 34], [230, 390, 60, 32],
];
// rocky arms that run from the Titan's feet out to the flanking isles: the Titan bestrides the only gap
const ARMS = [[[-50, 192], [-100, 210], [-150, 236], [-205, 262]], [[50, 192], [105, 218], [170, 258], [240, 300]]];
const TZ = 190;
const TITAN_FEET = [[-38, TZ], [38, TZ]];

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rng = K.rng(21);
    // ---------------------------------------------------------------- terrain (seabed + rocky seaward islands)
    const heightAt = (x, z) => {
      let h = SEABED + (K.fbm(x * 0.02, z * 0.02, 2, 3) - 0.5) * 1.4;
      const n = K.fbm(x * 0.045, z * 0.045, 3, 7) - 0.5;
      for (const [rx, rz, r, rh] of ROCKS) {
        const d = Math.hypot(x - rx, z - rz) + n * r * 0.35;
        const t = 1 - K.smoothstep(r * 0.3, r, d);
        if (t > 0) { const cr = Math.abs(K.fbm(x * 0.03 + 4, z * 0.03, 3, 19) - 0.5) * 2; h = Math.max(h, SEABED + Math.pow(t, 0.75) * (rh + 6) * (0.75 + 0.45 * cr) + n * 10 * t); }
      }
      for (const arm of ARMS) {
        const a = K.distToPolyline(x, z, arm), d = a.d + n * 7, w = 17 + 5 * K.fbm(a.t * 3, 1.7, 2, 23);
        const t = 1 - K.smoothstep(w * 0.3, w, d), ht = 14 + 12 * K.fbm(x * 0.012, z * 0.012, 2, 29);
        if (t > 0) h = Math.max(h, SEABED + Math.pow(t, 0.8) * ht + n * 6 * t);
      }
      for (const [fx, fz] of TITAN_FEET) {
        const d = Math.hypot(x - fx, z - fz) + n * 2.5;
        const t = 1 - K.smoothstep(15, 26, d);
        if (t > 0) h = Math.max(h, SEABED + t * 24.6 + n * 2 * t * (1 - K.smoothstep(0.9, 1, t)));
      }
      return h;
    };
    const c = new THREE.Color(), seaDeep = new THREE.Color(0x24444f), seaSand = new THREE.Color(0x6f8a84), rockC = new THREE.Color(0x777c80), rockL = new THREE.Color(0xa0a199), rockD = new THREE.Color(0x4c545a);
    const moss = new THREE.Color(0x5f7552), grassC = new THREE.Color(0x71864f), sandC = new THREE.Color(0xb7ad94), wetC = new THREE.Color(0x3d5047);
    root.add(K.terrain({ size: 1500, seg: q.seg(135), heightAt, kind: 'rock', scale: 16, colorAt: (x, z, h, s) => {
      if (h < -0.5) return c.copy(seaDeep).lerp(seaSand, K.clamp((h + 3.6) / 3.2, 0, 1) * 0.8);
      const n = K.fbm(x * 0.07, z * 0.07, 3, 11), strata = 0.5 + 0.5 * Math.sin(h * 1.15 + n * 6);
      c.copy(rockC).lerp(rockL, strata * 0.45).lerp(rockD, K.clamp(s * 2.6, 0, 0.55) * 0.8);
      const veg = K.smoothstep(1.2, 7, h) * (1 - K.clamp(s * 3.4, 0, 1)) * K.smoothstep(0.38, 0.62, n);
      c.lerp(moss, veg * 0.85).lerp(grassC, veg * K.smoothstep(0.55, 0.75, n) * 0.5);
      c.lerp(sandC, K.smoothstep(1.4, -0.3, h) * 0.75).lerp(wetC, K.smoothstep(0.3, -0.5, h) * 0.5);
      return c;
    } }));
    // lagoon water (deep blue-green, pale over the shallows) + four skirts so the sea runs on beyond the terrain into the fog
    const wopt = { deep: 0x1d3f48, shallow: 0x5f948d, opacity: 0.94, choppy: 0.5, speed: 0.45 };
    const wat = K.water({ w: 1500, d: 1500, seg: q.seg(100), level: 0, heightAt, ...wopt });
    root.add(wat); ctx.registerWater(wat);
    for (const [cx, cz, w, d] of [[0, -2250, 8000, 3000], [0, 2250, 8000, 3000], [-2250, 0, 3000, 1500], [2250, 0, 3000, 1500]]) {
      const sk = K.water({ w, d, seg: 2, level: 0, heightAt: () => -8, center: [cx, cz], ...wopt }); root.add(sk); ctx.registerWater(sk);
    }

    // ---------------------------------------------------------------- materials
    const M = {
      stone: tri('stone', { color: 0xdfe3e8, scale: 8, snow: false }), cobble: tri('cobble', { color: 0xc4c9cd, scale: 7, snow: false }),
      plaster: tri('plaster', { color: 0xffffff, scale: 6, snow: false }), tile: tri('tile', { color: 0xffffff, scale: 6, snow: false }),
      marble: tri('marble', { color: 0xe8ecee, scale: 7, snow: false }), wood: tri('wood', { color: 0x7a6552, scale: 4, snow: false }),
      copper: flat(0x5aa196, { rough: 0.45, metal: 0.35 }), gold: flat(0xc79c46, { rough: 0.35, metal: 0.7 }), iron: flat(0x2a2e34, { rough: 0.6, metal: 0.5 }),
      glowA: glow(0xffbf62), glowB: glow(0xffd88c), lamp: glow(0xffb45a, 1.7), shut: flat(0x2b3440, { rough: 1 }),
    };
    const stoneD = tri('stone', { color: 0xcfd5dd, scale: 8, snow: false });
    const treeMat = flat(0xffffff, { rough: 1 }), trunkMat = flat(0x5e4a38, { rough: 1 });
    const b = new Batch();
    const lampSpots = [];   // pooled lantern glow
    const chims = [];

    // ---------------------------------------------------------------- the grid of islands
    const colE = [-205], rowE = [-160];
    while (colE[colE.length - 1] < 205) colE.push(colE[colE.length - 1] + rng.range(31, 40));
    while (rowE[rowE.length - 1] < 120) rowE.push(rowE[rowE.length - 1] + rng.range(29, 37));
    const islands = [], grid = {};
    const spList = Object.values(SP);
    // clip a block away from an obstacle along the axis of least penetration (keeps a canal between them) instead of dropping it
    const clip = (r, s, m) => {
      if (!overlap(r, s, m)) return r;
      const x0 = r.cx - r.w / 2, x1 = r.cx + r.w / 2, z0 = r.cz - r.d / 2, z1 = r.cz + r.d / 2;
      const sx0 = s.cx - s.w / 2 - m, sx1 = s.cx + s.w / 2 + m, sz0 = s.cz - s.d / 2 - m, sz1 = s.cz + s.d / 2 + m;
      const opts = [[x1 - sx0, () => rect((x0 + sx0) / 2, r.cz, sx0 - x0, r.d)], [sx1 - x0, () => rect((sx1 + x1) / 2, r.cz, x1 - sx1, r.d)],
        [z1 - sz0, () => rect(r.cx, (z0 + sz0) / 2, r.w, sz0 - z0)], [sz1 - z0, () => rect(r.cx, (sz1 + z1) / 2, r.w, z1 - sz1)]].sort((a, b) => a[0] - b[0]);
      const n = opts[0][1](); return n.w >= 14 && n.d >= 14 ? n : null;
    };
    for (let i = 0; i < colE.length - 1; i++) for (let j = 0; j < rowE.length - 1; j++) {
      let cx = (colE[i] + colE[i + 1]) / 2, cz = (rowE[j] + rowE[j + 1]) / 2;
      let w = colE[i + 1] - colE[i] - CANAL, d = rowE[j + 1] - rowE[j] - CANAL;
      if ((cx / 215) ** 2 + (cz / 152) ** 2 > 1) continue;
      let r = rect(cx, cz, w, d);
      for (const s of [...spList, DROWN]) { if (r) r = clip(r, s, CANAL); }
      if (r) { const gx = grandX(r.cz); if (r.cz > -100 && r.cz < 190) r = clip(r, rect(gx, r.cz, 4, r.d + 2), 9); }   // the Grand Canal, ~22 wide
      if (!r) continue;
      ({ cx, cz, w, d } = r);
      const isl = { i, j, cx, cz, hw: w / 2, hd: d / 2, th: rng.range(-0.05, 0.05), open: [], kind: 'town', fam: FAMILIES[Math.floor(K.noise2(cx * 0.018, cz * 0.018, 5) * 5.99) % FAMILIES.length] };
      if (rng() < 0.25) isl.fam = rng.pick(FAMILIES);
      islands.push(isl); grid[i + ',' + j] = isl;
    }
    // bridges between neighbouring islands (arched; recorded as openings in the house rows)
    const bridge = (A, B, horizontal) => {
      let ax, az, bx, bz;
      if (horizontal) {
        const lo = Math.max(A.cz - A.hd, B.cz - B.hd) + 5, hi = Math.min(A.cz + A.hd, B.cz + B.hd) - 5; if (hi <= lo) return;
        const z = rng.range(lo, hi); ax = A.cx + A.hw - 0.4; bx = B.cx - B.hw + 0.4; az = bz = z;
        A.open.push({ s: 'E', t: z - A.cz }); B.open.push({ s: 'W', t: z - B.cz });
      } else {
        const lo = Math.max(A.cx - A.hw, B.cx - B.hw) + 5, hi = Math.min(A.cx + A.hw, B.cx + B.hw) - 5; if (hi <= lo) return;
        const x = rng.range(lo, hi); az = A.cz + A.hd - 0.4; bz = B.cz - B.hd + 0.4; ax = bx = x;
        A.open.push({ s: 'S', t: x - A.cx }); B.open.push({ s: 'N', t: x - B.cx });
      }
      K.bridge(b, [ax, TOP + 0.15, az], [bx, TOP + 0.15, bz], { w: 3.6, rise: 1.9, mat: M.stone, color: jit(0xe4e6e8, rng, 0.01, 0.03, 0.05), thick: 1.1 });
      if (rng() < 0.45) for (const [x, z] of [[ax, az], [bx, bz]]) lampSpots.push([x + (horizontal ? 0 : 1.9), TOP + 2.9, z + (horizontal ? 1.9 : 0)]);
    };
    for (const A of islands) {
      const E = grid[(A.i + 1) + ',' + A.j], S = grid[A.i + ',' + (A.j + 1)];
      if (E && (E.cx - E.hw) - (A.cx + A.hw) < 26) { bridge(A, E, true); if (A.hd > 15 && rng() < 0.35) bridge(A, E, true); }
      if (S && (S.cz - S.hd) - (A.cz + A.hd) < 26) { bridge(A, S, false); if (A.hw > 15 && rng() < 0.35) bridge(A, S, false); }
    }
    // island bodies: weathered plinth, coping lip, cobbled cap, canal steps and mooring posts
    const poly = (cx, cz, hw, hd, th, ch = 2.2, inset = 0) => {
      const w = hw - inset, d = hd - inset, pts = [[-w + ch, -d], [w - ch, -d], [w, -d + ch], [w, d - ch], [w - ch, d], [-w + ch, d], [-w, d - ch], [-w, -d + ch]];
      const cs = Math.cos(th), sn = Math.sin(th); return pts.map(([x, z]) => [cx + x * cs + z * sn, cz - x * sn + z * cs]);
    };
    const slab = (cx, cz, w, d, { th = 0, top = TOP, capMat = M.cobble, capColor = 0xffffff, body = M.stone, bodyColor = 0xffffff, coping = 0xece8de } = {}) => {
      b.extrude(body, poly(cx, cz, w / 2, d / 2, th), SEABED + 0.3, top - SEABED - 0.8, bodyColor);
      b.extrude(body, poly(cx, cz, w / 2, d / 2, th, 2.2, -0.2), SEABED + 0.3, 0.45 - SEABED - 0.3, 0x5b6f66);   // algae / waterline stain, slightly proud
      b.extrude(body, poly(cx, cz, w / 2, d / 2, th, 2.2, -0.12), top - 0.5, 0.8, coping);
      b.extrude(capMat, poly(cx, cz, w / 2, d / 2, th, 2.2, 0.55), top, 0.14, capColor);
    };
    const edgeFurniture = (s, r) => {
      const cs = Math.cos(s.th), sn = Math.sin(s.th), W = (lx, lz) => [s.cx + lx * cs + lz * sn, s.cz - lx * sn + lz * cs];
      for (const [lx, lz] of [[-s.hw + 3, -s.hd - 0.55], [s.hw - 3, -s.hd - 0.55], [-s.hw + 3, s.hd + 0.55], [s.hw - 3, s.hd + 0.55], [-s.hw - 0.55, 0], [s.hw + 0.55, 0]]) {
        if (r() < 0.35) continue; const [x, z] = W(lx, lz);
        b.cyl(M.wood, x, -1.2, z, 0.24, 3.0, { seg: 4, top: 0.8, color: jit(0x6a5442, r, 0.01, 0.04, 0.05) });
        if (r() < 0.16) lampSpots.push([x, 2.25, z]);
      }
      for (let k = 0; k < 2; k++) { // water stairs
        if (r() < 0.5) continue; const sd = r() < 0.5 ? 1 : -1, lx = r.range(-s.hw * 0.5, s.hw * 0.5);
        for (let st = 0; st < 3; st++) { const [x, z] = W(lx, sd * (s.hd + 0.4 + st * 0.85)); b.box(M.stone, x, -1.5, z, 2.8, TOP - 0.3 - st * 0.55 + 1.5, 0.9, s.th, 0xe6e4da); }
      }
    };
    for (const s of islands) { slab(s.cx, s.cz, s.hw * 2, s.hd * 2, { th: s.th, bodyColor: jit(0xdfe3e8, rng, 0.01, 0.03, 0.06) }); edgeFurniture(s, rng); }

    // town houses: perimeter rows facing the canals, a landmark campanile / chapel in the middle of bigger islands
    let nHouses = 0; const courts = [];
    const L2W = (s, lx, lz) => { const cs = Math.cos(s.th), sn = Math.sin(s.th); return [s.cx + lx * cs + lz * sn, s.cz - lx * sn + lz * cs]; };
    const pickHouse = (s, w, d, h, ry) => {
      const f = s.fam, wall = jit(rng.pick(f.wall), rng, 0.012, 0.05, 0.05);
      return { w, d, h, ry, wall, base: jit(0x6d7480, rng, 0.02, 0.06, 0.05).lerp(wall, 0.18), trim: jit(f.trim, rng, 0.01, 0.03, 0.03), roofC: jit(rng.pick(f.roof), rng, 0.012, 0.05, 0.05), brick: jit(0x9a6a52, rng),
        hip: rng() < 0.2 && w < d * 1.3, dormer: rng() < 0.32, chimney: rng() < 0.3, porch: rng() < 0.2 };
    };
    // continuous terraces of tall, narrow canal houses along every side, water doors facing the canal; gaps only at bridge landings
    const placeRow = (s, side) => {
      const ns = side === 'N' || side === 'S', lo = ns ? -s.hw + 0.3 : -s.hd + 8.4, hi = ns ? s.hw - 0.3 : s.hd - 8.4;
      if (hi - lo < 5) return;
      const ops = s.open.filter((o) => o.s === side).map((o) => o.t);
      let t = lo;
      while (t < hi - 4) {
        const w = rng.range(4.4, 6.9); if (t + w > hi) break;
        const tc = t + w / 2;
        const blocked = ops.find((o) => Math.abs(o - tc) < w / 2 + 2.2);
        if (blocked !== undefined) { t = blocked + 2.3; continue; }
        t += w + 0.04;
        const dh = rng.range(6.2, 7.8), tall = rng() < 0.05, h = tall ? rng.range(17, 21) : rng.range(7.5, 14.5);
        let lx, lz, ry;
        if (side === 'N') { lx = tc; lz = -s.hd + dh / 2 + 0.25; ry = s.th + Math.PI; } else if (side === 'S') { lx = tc; lz = s.hd - dh / 2 - 0.25; ry = s.th; }
        else if (side === 'W') { lx = -s.hw + dh / 2 + 0.25; lz = tc; ry = s.th - Math.PI / 2; } else { lx = s.hw - dh / 2 - 0.25; lz = tc; ry = s.th + Math.PI / 2; }
        const [x, z] = L2W(s, lx, lz);
        villa(b, M, x, TOP + 0.14, z, { ...pickHouse(s, w, dh, h, ry), hip: tall }, rng, chims);
        nHouses++;
      }
    };
    for (const s of islands) {
      for (const side of ['N', 'S', 'W', 'E']) placeRow(s, side);
      const iw = s.hw - 8.6, id = s.hd - 8.6;          // inner court half-extents
      if (iw < 3 || id < 3) continue;
      const kind = rng(), f = s.fam;
      const o = { wall: jit(rng.pick(f.wall), rng), base: 0x707884, trim: jit(f.trim, rng), roofC: jit(rng.pick(f.roof), rng), ry: s.th, copper: rng() < 0.5 };
      if (kind < 0.36 || iw < 4.5 || id < 4.5) {                                         // garden court
        const n = Math.min(5, 1 + Math.floor(iw * id / 14));
        for (let k = 0; k < n; k++) courts.push(L2W(s, rng.range(-iw + 1, iw - 1), rng.range(-id + 1, id - 1)));
      } else if (kind < 0.58) campanile(b, M, ...((p) => [p[0], TOP + 0.14, p[1]])(L2W(s, rng.range(-iw + 2, iw - 2), rng.range(-id + 2, id - 2))), rng.range(20, 30), o, rng);
      else if (kind < 0.72 && iw > 4.6 && id > 4.6) { const [x, z] = L2W(s, 0, 0); chapel(b, M, x, TOP + 0.14, z, o, rng); }
      else { const [x, z] = L2W(s, 0, 0); villa(b, M, x, TOP + 0.14, z, { ...pickHouse(s, iw * 2 - 1, id * 2 - 1, rng.range(12, 17), s.th), hip: true, dormer: false }, rng, chims); nHouses++; }
    }
    for (const [x, z] of courts) { const k = rng.range(0.8, 1.1), g = jit(rng.pick([0x3a5a45, 0x45694b, 0x546f4a]), rng, 0.02, 0.05, 0.05); b.cyl(trunkMat, x, TOP, z, 0.28 * k, 1.5 * k, { seg: 5 }); b.cone(treeMat, x, TOP + 1.1 * k, z, 1.45 * k, 5.2 * k, { seg: 6, color: g }); b.cone(treeMat, x, TOP + 4.2 * k, z, 1.0 * k, 3.6 * k, { seg: 6, color: g.clone().offsetHSL(0, 0, 0.04) }); }

    // ---------------------------------------------------------------- Sealord's Palace
    const P = SP.palace, py = TOP + 0.14, mar = 0xe3e7e8, mtrim = 0xf3f1ea;
    slab(P.cx, P.cz, P.w, P.d, { capMat: M.marble, capColor: 0xe8ecee });
    b.box(M.marble, P.cx, py, P.cz + 1, 60, 0.7, 32, 0, 0xdadfe0); b.box(M.marble, P.cx, py + 0.7, P.cz + 1, 56, 0.6, 29, 0, 0xe2e6e6);   // podium steps
    const hy = py + 1.3;
    b.box(M.marble, P.cx, hy, P.cz, 46, 15, 22, 0, mar);                                     // central hall
    b.box(M.stone, P.cx, hy + 14.4, P.cz, 48.4, 0.9, 24.4, 0, mtrim);                         // cornice
    b.box(M.stone, P.cx, hy + 7.2, P.cz, 46.5, 0.4, 22.5, 0, mtrim);                          // string course
    for (const sx of [-1, 1]) {
      const wx = P.cx + sx * 31;
      b.box(M.marble, wx, hy, P.cz + 2, 16, 11, 20, 0, 0xdbe0e2); b.box(M.stone, wx, hy + 10.5, P.cz + 2, 17.4, 0.7, 21.4, 0, mtrim);
      b.prism(M.tile, wx, hy + 11.2, P.cz + 2, 17.6, 5.2, 21.6, 0, 0x4f8a86);
      for (let k = 0; k < 4; k++) for (const [fz, a] of [[12.1, 0], [-8.1, Math.PI]]) quad(b, M.glowA, wx - 5.2 + k * 3.5, hy + 5.2, P.cz + 2 + (a ? -1 : 1) * 10.1, 1.1, 3.0, a);
    }
    for (let k = -8; k <= 8; k++) { b.box(M.stone, P.cx + k * 2.7, hy + 15.3, P.cz + 11.2, 0.5, 1.2, 0.5, 0, mtrim); b.box(M.stone, P.cx + k * 2.7, hy + 15.3, P.cz - 11.2, 0.5, 1.2, 0.5, 0, mtrim); }
    b.box(M.stone, P.cx, hy + 15.0, P.cz + 11.2, 46, 0.35, 0.7, 0, mtrim); b.box(M.stone, P.cx, hy + 15.0, P.cz - 11.2, 46, 0.35, 0.7, 0, mtrim);
    for (let k = -8; k <= 8; k++) for (const [fz, a] of [[11.1, 0], [-11.1, Math.PI]]) { quad(b, M.glowA, P.cx + k * 2.6, hy + 11, P.cz + fz, 1.0, 2.3, a); quad(b, k % 2 ? M.glowB : M.glowA, P.cx + k * 2.6, hy + 4.2, P.cz + fz, 1.1, 3.4, a); }
    for (const [ox, oz] of [[-22, 10.6], [22, 10.6], [-22, -10.6], [22, -10.6]]) {   // corner towers with belfry rings and copper domes
      const tx = P.cx + ox, tz = P.cz + oz;
      frust(b, M.marble, tx, hy - 0.3, tz, 3.5, 3.5, 25, { top: 0.84, seg: 12, color: mar }); frust(b, M.stone, tx, hy + 9, tz, 3.6, 3.6, 0.5, { seg: 12, color: mtrim });
      frust(b, M.stone, tx, hy + 24.2, tz, 3.7, 3.7, 1.1, { top: 1.15, seg: 12, color: mtrim }); frust(b, M.marble, tx, hy + 25.2, tz, 3.1, 3.1, 4.2, { seg: 12, color: 0xdfe4e4 });
      for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; quad(b, M.glowA, tx + Math.cos(a) * 3.12, hy + 27.2, tz + Math.sin(a) * 3.12, 0.8, 2.0, Math.PI / 2 - a); }
      b.dome(M.copper, tx, hy + 29.4, tz, 3.5, { seg: 12, sy: 1.3 }); b.cone(M.gold, tx, hy + 33.8, tz, 0.15, 2.4, { seg: 5 });
    }
    frust(b, M.marble, P.cx, hy + 15, P.cz, 9.2, 9.2, 8.2, { top: 1.0, seg: 20, color: mar });                  // central drum
    for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283; quad(b, M.glowA, P.cx + Math.cos(a) * 9.22, hy + 19, P.cz + Math.sin(a) * 9.22, 1.1, 3.0, Math.PI / 2 - a); }
    frust(b, M.stone, P.cx, hy + 23, P.cz, 9.7, 9.7, 0.9, { top: 1.0, seg: 20, color: mtrim });
    b.dome(M.copper, P.cx, hy + 23.9, P.cz, 9.2, { seg: 22, sy: 1.0 });
    frust(b, M.marble, P.cx, hy + 33, P.cz, 1.9, 1.9, 3.2, { top: 0.9, seg: 10, color: mar }); b.dome(M.copper, P.cx, hy + 36.2, P.cz, 2.1, { seg: 10, sy: 1.2 }); b.cone(M.gold, P.cx, hy + 38.7, P.cz, 0.2, 3.4, { seg: 5 });
    for (let i = -9; i <= 9; i++) { frust(b, M.marble, P.cx + i * 2.4, py + 0.6, P.cz + 14.2, 0.52, 0.52, 7.6, { top: 0.86, seg: 8, color: 0xf0f2f0 }); b.box(M.stone, P.cx + i * 2.4, py + 8.2, P.cz + 14.2, 1.5, 0.5, 1.5, 0, mtrim); }
    b.box(M.stone, P.cx, py + 8.7, P.cz + 14.2, 46.5, 0.9, 2.3, 0, mtrim); b.box(M.stone, P.cx, py + 9.6, P.cz + 14.2, 47.5, 0.4, 2.8, 0, 0xe6e4da);
    for (let i = -8; i <= 8; i++) quad(b, M.shut, P.cx + i * 2.4 + 1.2, py + 4.3, P.cz + 12.15, 1.7, 5.2, 0, 0x3e4650);
    for (let st = 0; st < 4; st++) b.box(M.stone, P.cx, -1.5, P.cz + P.d / 2 + 0.5 + st * 0.9, 18, TOP - 0.2 - st * 0.55 + 1.5, 1.0, 0, 0xe9e6dc);     // grand water stair
    for (const sx of [-1, 1]) { b.box(M.stone, P.cx + sx * 10.5, py, P.cz + P.d / 2 - 0.4, 1.4, 1.8, 1.4, 0, mtrim); lampSpots.push([P.cx + sx * 10.5, py + 2.6, P.cz + P.d / 2 - 0.4]); }

    // ---------------------------------------------------------------- Iron Bank (heavy grey fortress-bank, bronze banded)
    const B = SP.bank; slab(B.cx, B.cz, B.w, B.d, { capMat: stoneD, capColor: 0xb8bcc2 });
    const bk = 0xbdbcb6, bkd = 0x96979a, bronze = 0x9a7d46;
    b.box(stoneD, B.cx, py, B.cz, 40, 3.2, 32, 0, 0x85878a);                                                   // battered plinth
    b.box(stoneD, B.cx, py + 3.2, B.cz, 36, 17, 28, 0, bk);
    b.box(stoneD, B.cx, py + 20.2, B.cz, 38.4, 1.4, 30.4, 0, bkd);
    for (let i = -8; i <= 8; i++) for (const sz of [-1, 1]) b.box(stoneD, B.cx + i * 2.2, py + 18.6, B.cz + sz * 14.9, 1.0, 1.6, 1.0, 0, bkd);   // corbels under the parapet
    for (let i = -8; i <= 8; i++) for (const sz of [-1, 1]) b.box(stoneD, B.cx + i * 2.2, py + 21.6, B.cz + sz * 15, 1.3, 1.1, 0.6, 0, bk);
    b.box(M.gold, B.cx, py + 17, B.cz + 14.08, 36.2, 0.4, 0.2, 0, bronze); b.box(M.gold, B.cx, py + 6.2, B.cz + 14.08, 36.2, 0.4, 0.2, 0, bronze);   // bronze bands
    for (const sx of [-1, 1]) for (let k = -2; k <= 2; k++) if (k) b.box(stoneD, B.cx + sx * 18.4, py + 3.2, B.cz + k * 6, 1.5, 17, 1.3, 0, bkd);      // buttresses
    for (const [ox, oz] of [[-19, -15], [19, -15], [-19, 15], [19, 15]]) K.tower(b, B.cx + ox, B.cz + oz, { r: 3.6, h: 27, y: py, mat: stoneD, roofMat: stoneD, roof: 'flat', seg: 12, windows: false, color: 0xa9aaa8, taper: 0.9 });
    K.squareTower(b, B.cx, B.cz, { w: 11, d: 11, h: 24, y: py + 21, mat: stoneD, roofMat: M.copper, roof: 'pyramid', roofH: 7, color: 0xa6a7a6, windows: false });
    for (let i = -6; i <= 6; i++) if (Math.abs(i) > 1) { quad(b, M.glowA, B.cx + i * 2.6, py + 11, B.cz + 14.06, 0.55, 4.8, 0); quad(b, M.glowA, B.cx + i * 2.6, py + 11, B.cz - 14.06, 0.55, 4.8, Math.PI); }
    for (let k = 0; k < 3; k++) for (const [a, ox, oz] of [[0, 0, 5.56], [Math.PI, 0, -5.56]]) quad(b, M.glowB, B.cx + (k - 1) * 3, py + 40, B.cz + oz, 0.7, 4.5, a);
    b.box(M.iron, B.cx, py, B.cz + 14.1, 6.4, 7.4, 0.5, 0); for (let i = -3; i <= 3; i++) b.box(M.gold, B.cx + i * 0.9, py + 0.8, B.cz + 14.4, 0.14, 6.2, 0.12, 0, bronze); b.box(M.gold, B.cx, py + 7.4, B.cz + 14.2, 7.4, 0.5, 0.8, 0, bronze);
    for (const sx of [-1, 1]) lampSpots.push([B.cx + sx * 4.4, py + 8.4, B.cz + 14.9]);

    // ---------------------------------------------------------------- Isle of the Gods: a cluster of small temples of many faiths
    const G0 = SP.gods; slab(G0.cx, G0.cz, G0.w, G0.d, { capMat: M.cobble });
    const temples = [[-12, -8, 'dome', 0xd9cdb4], [0, -10, 'spire', 0xe8e0cc], [12, -6, 'step', 0xc9a672], [-13, 7, 'tier', 0xcbd2d8], [-2, 4, 'dome', 0xe0d6c0], [11, 8, 'obelisk', 0xc9b48a], [3, 11, 'step', 0x9fb2c2]];
    temples.forEach(([ox, oz, kind, col], k) => {
      const x = G0.cx + ox, z = G0.cz + oz, h = 5.5 + (k % 3) * 2.2, cc = jit(col, rng, 0.01, 0.04, 0.04);
      if (kind === 'dome') {
        b.box(M.plaster, x, py - 1, z, 6.6, 2.6, 6.6, k * 0.5, cc); frust(b, M.plaster, x, py + 1.4, z, 3.3, 3.3, h - 1, { top: 0.96, seg: 12, color: cc });
        b.box(M.stone, x, py + h + 0.2, z, 7.2, 0.5, 7.2, k * 0.5, 0xeee8d8); b.dome(k % 2 ? M.copper : M.tile, x, py + h + 0.7, z, 3.5, { seg: 12, sy: 1.1, color: k % 2 ? 0xffffff : 0xc47b45 }); b.cone(M.gold, x, py + h + 4.4, z, 0.14, 1.6, { seg: 5 });
      } else if (kind === 'spire') {
        frust(b, M.plaster, x, py - 1, z, 2.8, 2.8, h + 3, { top: 0.82, seg: 8, color: cc }); frust(b, M.stone, x, py + h + 2, z, 3.3, 3.3, 0.6, { seg: 8, color: 0xeee8d8 }); b.cone(M.tile, x, py + h + 2.6, z, 3.0, 9.5, { seg: 8, color: 0x7e6a96 }); b.cone(M.gold, x, py + h + 11.8, z, 0.12, 1.3, { seg: 5 });
      } else if (kind === 'step') {
        for (let st = 0; st < 4; st++) b.box(M.plaster, x, py - 1 + st * 1.9 + (st ? 1 : 0), z, 7.2 - st * 1.4, st ? 1.9 : 2.9, 7.2 - st * 1.4, k * 0.5, st % 2 ? 0xe9e0c9 : cc);
        b.box(M.copper, x, py + 6.8, z, 2.6, 0.6, 2.6, 0, 0xffffff);
      } else if (kind === 'tier') {
        for (let st = 0; st < 3; st++) { b.box(M.plaster, x, py - 1 + st * 3.4 + (st ? 1 : 0), z, 4.6 - st * 0.9, st ? 2.4 : 3.4, 4.6 - st * 0.9, 0, cc); b.pyramid(M.tile, x, py + 2.2 + st * 3.4, z, 7 - st * 1.5, 1.5, 7 - st * 1.5, 0, 0x9a5a40); }
        b.cone(M.gold, x, py + 11.5, z, 0.14, 1.8, { seg: 5 });
      } else { frust(b, M.plaster, x, py - 1, z, 1.5, 1.5, h + 6, { top: 0.4, seg: 4, color: cc, ry: k }); b.pyramid(M.gold, x, py + h + 5, z, 1.0, 1.4, 1.0, k, 0xffffff); b.box(M.stone, x, py - 0.4, z, 3.4, 1.2, 3.4, k, 0xe8e0cc); }
      quad(b, M.glowA, x + 1.6, py + 1.9, z + 3.34, 0.9, 1.8, 0);
    });
    for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, x = G0.cx + Math.cos(a) * 17.5, z = G0.cz + Math.sin(a) * 14; lampSpots.push([x, py + 2.2, z]); b.cyl(M.stone, x, py, z, 0.18, 2.2, { seg: 5, color: 0x9a948a }); }
    const gt = [0x34523f, 0x3d5c45, 0x486a4c];
    for (const [x, z] of K.scatter({ rng: K.rng(5), count: 12, bounds: [G0.cx - 19, G0.cz - 15, G0.cx + 19, G0.cz + 15], minDist: 4, avoid: (x, z) => temples.some(([ox, oz]) => Math.hypot(x - G0.cx - ox, z - G0.cz - oz) < 6) || Math.hypot(x - G0.cx, z - G0.cz) > 17 })) {
      const k = 0.9 + rng() * 0.3, g = jit(rng.pick(gt), rng); b.cyl(trunkMat, x, py, z, 0.28, 1.5, { seg: 5 }); b.cone(treeMat, x, py + 1.1, z, 1.4 * k, 6 * k, { seg: 6, color: g }); b.cone(treeMat, x, py + 4.8 * k, z, 0.95 * k, 3.6 * k, { seg: 6, color: g.clone().offsetHSL(0, 0, 0.04) });
    }

    // ---------------------------------------------------------------- House of Black and White: small island, two doors, no windows facing out
    const W = SP.bw; slab(W.cx, W.cz, W.w, W.d, { capMat: stoneD, capColor: 0x9aa0a6 });
    const bwy = py + 3.4, wst = tri('stone', { color: 0xe0dfda, scale: 4, snow: false, bump: 0.5 }), bst = tri('stone', { color: 0x2a2a31, scale: 4, snow: false, bump: 0.5 }), slate = tri('slate', { color: 0x30323a, scale: 5, snow: false });
    const rockM = tri('rock', { color: 0x8a8f8c, scale: 6, snow: false });
    b.extrude(rockM, poly(W.cx, W.cz - 0.6, 10.6, 7.4, 0, 2.6), py - 0.2, 3.6, 0x7d8380);                                           // the temple sits on a rocky knoll
    for (let st = 0; st < 4; st++) b.box(M.stone, W.cx, py - 0.3, W.cz + 7.2 + st * 0.82, 7.4, 3.6 - st * 0.85, 0.84, 0, 0xc9c8c2);    // steep steps up from the canal
    b.box(wst, W.cx - 4.6, bwy, W.cz, 9.2, 11, 12, 0); b.box(bst, W.cx + 4.6, bwy, W.cz, 9.2, 11, 12, 0);
    b.box(bst, W.cx - 4.6, bwy + 11, W.cz, 9.6, 0.8, 12.4, 0); b.box(wst, W.cx + 4.6, bwy + 11, W.cz, 9.6, 0.8, 12.4, 0);                      // cornices in the opposite tone
    b.box(bst, W.cx - 4.6, bwy + 11.8, W.cz, 8.4, 4, 8, 0); b.box(wst, W.cx + 4.6, bwy + 11.8, W.cz, 8.4, 4, 8, 0);
    b.prism(slate, W.cx, bwy + 15.8, W.cz, 18.6, 3.2, 8.8, 0, 0xa2a4b0);
    for (const sx of [-1, 1]) for (const k of [-1, 1]) b.box(sx < 0 ? bst : wst, W.cx + sx * 4.6 + k * 4.1, bwy, W.cz + 6.12, 1.0, 11, 0.5, 0);   // corner pilasters in the opposite tone
    b.box(tri('wood', { color: 0xf0ece4, scale: 3, snow: false }), W.cx + 2.6, bwy, W.cz + 6.2, 2.5, 6.2, 0.4, 0);      // weirwood door (set in the black half)
    b.box(tri('wood', { color: 0x16130f, scale: 3, snow: false }), W.cx - 2.6, bwy, W.cz + 6.2, 2.5, 6.2, 0.4, 0);      // ebony door (set in the white half)
    for (const sx of [-1, 1]) b.cyl(M.stone, W.cx + sx * 4.4, py - 0.2, W.cz + 9.6, 0.42, 3.0, { seg: 6, color: sx < 0 ? 0xe6e4da : 0x34343a });

    // ---------------------------------------------------------------- Arsenal: walled shipyard just inside the Titan
    const A = SP.arsenal; slab(A.cx, A.cz, A.w, A.d, { capMat: M.cobble });
    // a walled yard on three sides; the seaward side is a row of open ship-sheds with slipways running down into the water
    const ax0 = A.cx - A.w / 2 + 1.2, ax1 = A.cx + A.w / 2 - 1.2, az0 = A.cz - A.d / 2 + 1.2, az1 = A.cz + A.d / 2 - 1.2;
    K.wall(b, [[ax0, az1], [ax0, az0], [ax1, az0], [ax1, az1]], { h: 8, t: 2.4, mat: stoneD, capMat: M.stone, heightAt: () => py, sink: 0.2, color: 0xb7bcc0 });
    for (const [x, z] of [[ax0, az0], [ax1, az0], [ax0, az1], [ax1, az1]]) K.tower(b, x, z, { r: 3.2, h: 13, y: py, mat: stoneD, roof: 'flat', seg: 12, windows: false, color: 0xb2b7bb, taper: 0.92 });
    const shedRoof = [0x6f4a3e, 0x7a5040, 0x664538];
    for (let i = 0; i < 7; i++) {
      const x = A.cx - 39 + i * 13, zc = A.cz + 1, L0 = 31, sc = jit(0xb9b2a4, rng, 0.01, 0.03, 0.04);
      for (const sd of [-1, 1]) for (let k = 0; k < 6; k++) b.box(stoneD, x + sd * 5.7, py, zc - L0 / 2 + 1 + k * 5.8, 1.2, 7.2, 1.3, 0, sc);   // arcade piers
      b.box(stoneD, x, py, zc - L0 / 2, 12.6, 7.2, 1.0, 0, sc);                                                                        // back wall
      for (const sd of [-1, 1]) b.box(stoneD, x + sd * 5.7, py + 7.2, zc, 1.4, 0.8, L0, 0, 0xd6d1c4);                                 // wall plates
      b.prism(M.tile, x, py + 8.0, zc, L0 + 1.2, 4.2, 12.4, Math.PI / 2, jit(shedRoof[i % 3], rng));
      b.box(M.wood, x, py - 0.02, zc + 2, 8.6, 0.2, L0 - 2, 0, 0x4e3e30);                                                              // timber slip floor
      b.box(M.wood, x, -2.6, A.cz + A.d / 2 + 3.2, 7.4, 3.2, 9, 0, 0x4a3a2c, 0.27);                                                     // slipway ramp into the lagoon
      if (i % 2 === 0) {                                                                                                                 // a galley on the stocks
        frust(b, M.wood, x, py + 0.9, zc + 2, 2.3, 11.5, 2.4, { top: 1.3, seg: 12, color: jit(0x6e5238, rng) });
        for (let k = -4; k <= 4; k++) for (const sd of [-1, 1]) limb(b, M.wood, [x + sd * 2.4, py + 3.2, zc + 2 + k * 2.3], [x + sd * 3.6, py + 5.2, zc + 2 + k * 2.3], 0.16, 0.12, 4, 0x8a6a48);   // bare ribs
      }
    }
    K.tower(b, A.cx - 40, A.cz - 10, { r: 2.8, h: 24, y: py, mat: stoneD, roofMat: M.copper, roof: 'cone', roofH: 6, seg: 10, windows: false, color: 0xbfc3c6, taper: 0.88 }); // signal tower
    for (const x of [A.cx - 26, A.cx + 26]) { b.box(M.wood, x, py, A.cz + 17, 1.0, 17, 1.0, 0, 0x5a4636); limb(b, M.wood, [x, py + 16, A.cz + 17], [x, py + 18, A.cz + 26], 0.4, 0.3, 4, 0x5a4636); b.box(M.iron, x, py + 11, A.cz + 25.4, 0.12, 6.5, 0.12, 0, 0x2a2a2a); }   // sheer-legs cranes over the slips
    for (let i = 0; i < 16; i++) b.box(M.wood, A.cx - 40 + rng() * 80, py, A.cz - 16.5 + rng() * 2, rng.range(1.5, 4), 0.7, 0.8, rng.range(-0.1, 0.1), jit(0x8a6a48, rng));   // seasoning timber stacks

    // Chequy Port quay (checkered pavement)
    const C = SP.chequy; slab(C.cx, C.cz, C.w, C.d, { capMat: M.stone, capColor: 0xc9cdd0 });
    for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) b.box(M.stone, C.cx - 29 + i * 5, py + 0.05, C.cz - 8 + j * 5, 5, 0.12, 5, 0, (i + j) % 2 ? 0x4c5662 : 0xd3cdbd);
    villa(b, M, C.cx + 20, py, C.cz - 4, { w: 12, d: 7, h: 7, ry: 0, wall: jit(0xc2b8a0, rng), base: 0x6d7480, trim: 0xefe8d6, roofC: jit(0x7a4a3a, rng), brick: 0x9a6a52, hip: false, dormer: false, chimney: true, porch: true }, rng, chims); // customs house (interpretation)

    // ---------------------------------------------------------------- Purple Harbor (north) & Ragman's Harbor (west)
    const U = SP.purple; slab(U.cx, U.cz, U.w, U.d, { capMat: M.marble, capColor: 0xd6d0e0 });
    for (let i = -4; i <= 4; i++) K.pier(b, U.cx + i * 12, py, U.cz - 6, { len: 26, w: 3.2, ry: Math.PI / 2, mat: M.wood, color: 0xa98fba });
    for (let i = -5; i <= 5; i++) villa(b, M, U.cx + i * 10, py, U.cz + 4, { w: 7, d: 4.6, h: 6, ry: Math.PI, wall: jit(0xb9a7cf, rng, 0.012, 0.05, 0.05), base: 0x7a7488, trim: 0xece6f0, roofC: jit(0x6b5c7a, rng), brick: 0x9a6a52, hip: false, dormer: false, chimney: false, porch: false }, rng, chims);
    const ragPiers = [-60, -30, 0, 36, 66, 96];
    ragPiers.forEach((z) => { K.pier(b, -196, py - 0.2, z, { len: 34, w: 3, ry: Math.PI, mat: M.wood, color: 0x9c8466 }); });
    for (let i = 0; i < 22; i++) { const z = -70 + i * 8.5 + rng.range(-1, 1), ww = rng.range(4, 6); K.house(b, -190 + rng.range(-1, 2), py, z, { w: ww, d: rng.range(4, 6), h: rng.range(3.5, 6), ry: 0, style: 'gable', wallMat: M.wood, roofMat: M.tile, wall: jit(rng.pick([0x8a7a66, 0x9a8a72, 0x7a6a58]), rng), roof: jit(rng.pick([0x8a5a3a, 0x6a4a3a, 0x5a6a5a]), rng), glowMat: M.glowA, chimney: true }); }
    b.extrude(M.stone, [[-204, -78], [-186, -78], [-186, 100], [-204, 100]], SEABED + 0.3, py - SEABED - 0.3 + 0, 0xcfcfcf); b.extrude(M.cobble, [[-203.4, -78], [-186.6, -78], [-186.6, 100], [-203.4, 100]], py, 0.14);

    // ---------------------------------------------------------------- The Drowned Town: oldest quarter, half-sunk towers and domes
    const rd = K.rng(77), drown = tri('stone', { color: 0x76867f, scale: 6, snow: false }), algae = tri('plaster', { color: 0x6f8a78, scale: 5, snow: false });
    for (let i = 0; i < q.dens(46); i++) {
      const x = DROWN.cx + rd.range(-DROWN.w / 2, DROWN.w / 2), z = DROWN.cz + rd.range(-DROWN.d / 2, DROWN.d / 2);
      if ((x - DROWN.cx) ** 2 / 2400 + (z - DROWN.cz) ** 2 / 1500 > 1) continue;
      const h = rd.range(6, 15), w = rd.range(3.5, 7), k = rd(), dc = jit(0xcfd8d2, rd, 0.02, 0.06, 0.07);
      if (k < 0.35) { b.cyl(drown, x, SEABED + 0.4, z, w * 0.5, h + 2.2, { seg: 9, top: 0.85, color: dc }); b.box(drown, x, SEABED + h + 2.4, z, w * 1.15, 0.5, w * 1.15, 0, dc); if (rd() < 0.7) b.dome(rd() < 0.5 ? M.copper : algae, x, SEABED + h + 2.9, z, w * 0.55, { seg: 9 }); }
      else if (k < 0.8) { b.box(drown, x, SEABED + 0.4, z, w, h + 2, w * rd.range(0.8, 1.3), rd(), dc); if (rd() < 0.5) b.pyramid(algae, x, SEABED + h + 2.4, z, w + 0.5, 2.6, w + 0.5, 0, 0x7a8a7a); }
      else { b.box(drown, x, SEABED + 0.4, z, 1.6, h * 0.9, 1.6, 0, dc); b.box(drown, x + 2, SEABED + 0.4, z, 1.4, h * 0.6, 1.6, 0.4, dc); }
    }

    // ---------------------------------------------------------------- vegetation on the seaward isles
    const vg = K.rng(33), vgreens = [0x2a4436, 0x30493a, 0x37503f, 0x3e5640];
    const slopeAt = (x, z) => Math.hypot(heightAt(x + 2, z) - heightAt(x - 2, z), heightAt(x, z + 2) - heightAt(x, z - 2)) / 4;
    for (const [rx, rz, r] of ROCKS) {
      const pts = K.scatter({ rng: vg, count: q.dens(Math.round(r * 0.75)), bounds: [rx - r, rz - r, rx + r, rz + r], minDist: 5, accept: (x, z) => { const h = heightAt(x, z); return h > 2.2 && slopeAt(x, z) < 0.6 && Math.hypot(x - 0, z - TZ) > 60 && K.fbm(x * 0.07, z * 0.07, 3, 11) > 0.42; } });
      for (const [x, z] of pts) { const k = vg.range(0.8, 1.5), y = heightAt(x, z), g = jit(vg.pick(vgreens), vg, 0.02, 0.05, 0.05); b.cone(treeMat, x, y - 0.4, z, 1.8 * k, 7.2 * k, { seg: 6, color: g }); b.cone(treeMat, x, y + 4.4 * k, z, 1.2 * k, 3.6 * k, { seg: 6, color: g.clone().offsetHSL(0, 0, 0.04) }); }
    }

    // ---------------------------------------------------------------- THE TITAN
    const TB = new Batch();
    const tS = tri('rock', { color: 0xd6cdc0, scale: 9, snow: false, bump: 0.55 }), tD = tri('marble', { color: 0x8eab9f, scale: 7, snow: false, bump: 0.3, rough: 0.62, metal: 0.22 });   // weathered granite body, verdigris armour
    const bronzeM = flat(0x8d7a4c, { rough: 0.5, metal: 0.45 }), blade = flat(0xc7d0d8, { rough: 0.28, metal: 0.65 });
    const rockY = SEABED + 24.6, fy = rockY + 0.15, tr = K.rng(404);
    const hip = fy + 52, TC = (hex) => jit(hex, tr, 0.01, 0.03, 0.035).multiplyScalar(1.45);
    for (const s of [-1, 1]) {
      const fx = s * 38;
      TB.box(tD, fx, fy, TZ - 1, 17, 3.0, 20, 0, TC(0x667069));                                         // sandal sole
      frust(TB, tS, fx, fy + 2.4, TZ + 5, 6.2, 8.4, 2.6, { top: 0.82, seg: 10, color: TC(0x8f9b93) });   // toe cap
      for (const k of [-1, 1]) TB.box(M.gold, fx + k * 5.5, fy + 2.2, TZ + 1.2, 0.8, 0.6, 14, 0, 0xffffff);                       // sandal straps
      const ankle = [fx, fy + 3.2, TZ - 1], knee = [s * 27.5, fy + 27, TZ + 3.5], hp = [s * 12.5, hip - 8, TZ];
      limb(TB, tS, ankle, knee, 5.4, 6.8, 10, TC(0x93a097));                                             // shin
      const lp = (a, b2, t) => [a[0] + (b2[0] - a[0]) * t, a[1] + (b2[1] - a[1]) * t, a[2] + (b2[2] - a[2]) * t];
      limb(TB, tD, lp(ankle, knee, 0.08), lp(ankle, knee, 0.34), 6.0, 6.5, 10, TC(0x5b6862));            // greave
      limb(TB, tD, lp(ankle, knee, 0.62), lp(ankle, knee, 0.74), 6.4, 6.7, 10, TC(0x5b6862));
      frust(TB, tD, knee[0], knee[1] - 4.2, knee[2] + 0.4, 6.7, 6.2, 7.4, { top: 0.82, seg: 12, color: TC(0x5b6862) }); TB.dome(tD, knee[0], knee[1] + 3.1, knee[2] + 0.4, 5.6, { seg: 12, sy: 0.55, color: TC(0x5b6862) });   // knee cop
      limb(TB, tS, knee, hp, 7.0, 8.8, 10, TC(0x94a198));                                                // thigh
      limb(TB, tD, lp(knee, hp, 0.34), lp(knee, hp, 0.46), 7.4, 7.8, 10, TC(0x5b6862));
      limb(TB, tD, lp(knee, hp, 0.7), lp(knee, hp, 0.8), 8.1, 8.5, 10, TC(0x5b6862));
      for (let k = -2; k <= 2; k++) quad(TB, M.glowA, s * 12.5 + k * 2.1 - s * 0, hip - 25 + (k % 2) * 3, TZ + 9.2, 0.6, 2.0, 0, 0xffffff);          // lit arrow slits on the thighs
    }
    // skirt of plates, belt, torso
    frust(TB, tS, 0, hip - 14, TZ, 19, 11.5, 12.5, { top: 0.78, seg: 16, color: TC(0x8a968e) });
    for (let i = -6; i <= 6; i++) { const a = i * 0.21; frust(TB, tD, Math.sin(a) * 18.2, hip - 15, TZ + Math.cos(a) * 10.8, 1.2, 0.9, 11, { top: 0.9, seg: 6, color: TC(0x4f5a55) }); }   // pleated tassets (ring segment)
    frust(TB, tD, 0, hip - 2.3, TZ, 15.8, 10.2, 4.0, { top: 1.0, seg: 16, color: TC(0x444e4b) });
    TB.box(bronzeM, 0, hip - 2.2, TZ + 10.3, 5.2, 3.6, 1.0, 0, 0xffffff);                                  // belt buckle
    frust(TB, tS, 0, hip + 1.6, TZ, 14.5, 9.2, 25, { top: 1.5, seg: 16, color: TC(0x94a097) });            // torso: waist to shoulders
    frust(TB, tD, 0, hip + 10.5, TZ, 17.8, 11.4, 12.5, { top: 1.2, seg: 16, color: TC(0x59645f) });        // breastplate
    frust(TB, tS, 0, hip + 20.6, TZ, 21.2, 12.8, 5.0, { top: 0.96, seg: 16, color: TC(0x8a958e) });        // shoulder yoke
    for (let i = -3; i <= 3; i++) quad(TB, M.glowA, i * 3.9, hip + 5.0, TZ + 10.1, 0.8, 2.4, 0, 0xffffff);      // hall windows (interpretation)
    for (let i = -4; i <= 4; i++) quad(TB, M.shut, i * 2.9, hip - 9, TZ + 11.2, 0.8, 1.6, 0, 0x30363a);        // murder-holes on the skirt
    TB.box(bronzeM, 0, hip + 16.4, TZ + 12.0, 8.5, 1.1, 0.9, 0, 0xffffff); TB.sphere(bronzeM, 0, hip + 15.4, TZ + 12.5, 1.5, { seg: 8, color: 0xffffff });   // chest roundel
    frust(TB, tD, 0, hip + 24.6, TZ, 9.8, 8.8, 4.0, { top: 0.92, seg: 14, color: TC(0x4f5a55) });         // gorget
    _m.compose(_p.set(0, hip + 13.5, TZ + 9.6), _q.identity(), _s.set(2.2, 9.5, 2.6)); TB.addGeometry(tD, _sph, _m, TC(0x59645f));   // medial ridge of the cuirass
    // arms: long enough to read as a man, not a machine (left hangs by the thigh, right holds the sword upright before him)
    frust(TB, tS, 0, hip + 25.4, TZ, 19.6, 11.6, 2.6, { top: 0.55, seg: 16, color: TC(0x8a958e) });                       // sloping shoulders
    for (const s of [-1, 1]) {
      for (let k = 0; k < 3; k++) TB.dome(tD, s * (25.2 + k * 0.8), hip + 18.2 - k * 2.5, TZ, 7.4 - k * 0.5, { seg: 14, sy: 0.55, color: TC(k % 2 ? 0x4d5853 : 0x59645f) });   // layered pauldron lames
      const S = [s * 24.5, hip + 16, TZ], E = s < 0 ? [-31, hip - 2, TZ + 3] : [34, hip + 0.5, TZ + 6], W = s < 0 ? [-30, hip - 19, TZ + 8] : [30, hip + 6.5, TZ + 17];
      const lp = (a, b2, t) => [a[0] + (b2[0] - a[0]) * t, a[1] + (b2[1] - a[1]) * t, a[2] + (b2[2] - a[2]) * t];
      limb(TB, tS, S, E, 5.0, 4.3, 10, TC(0x93a097)); TB.sphere(tS, E[0], E[1] - 3.8, E[2], 4.3, { seg: 10, color: TC(0x8f9b93) });
      limb(TB, tS, E, W, 4.2, 3.3, 10, TC(0x8f9b93));
      limb(TB, tD, lp(E, W, 0.3), lp(E, W, 0.85), 4.5, 3.8, 10, TC(0x4f5a55));                                             // vambrace
      TB.sphere(tS, W[0], W[1] - (s < 0 ? 3.0 : 1.5), W[2] + 0.4, 3.4, { seg: 10, color: TC(0x8f9b93) });                    // fist
    }
    { // the great sword held point-up in the right fist
      const x = 30, z = TZ + 17;
      limb(TB, M.iron, [x, hip + 1.5, z], [x, hip + 13, z], 0.9, 0.8, 6, 0xffffff); TB.sphere(bronzeM, x, hip + 0.4, z, 1.4, { seg: 8, color: 0xffffff });
      TB.box(bronzeM, x, hip + 13, z, 13.5, 1.5, 2.4, 0, 0xffffff); TB.sphere(bronzeM, x - 6.6, hip + 13.7, z, 1.1, { seg: 6, color: 0xffffff }); TB.sphere(bronzeM, x + 6.6, hip + 13.7, z, 1.1, { seg: 6, color: 0xffffff });
      TB.box(blade, x, hip + 14.5, z, 3.0, 56, 0.9, 0, 0xffffff); TB.box(blade, x, hip + 14.5, z, 0.5, 50, 1.1, 0, 0x8a949c); TB.pyramid(blade, x, hip + 70.5, z, 2.1, 7, 0.65, Math.PI / 4, 0xffffff);
    }
    // head: neck, helm, face-plate, beard, radiant crown
    frust(TB, tS, 0, hip + 26.6, TZ + 0.6, 5.0, 5.0, 4.5, { top: 0.95, seg: 10, color: TC(0x8f9b93) });
    frust(TB, tD, 0, hip + 29, TZ + 0.5, 7.4, 7.9, 14, { top: 0.9, seg: 14, color: TC(0x55605b) });                    // helm
    TB.box(tS, 0, hip + 28.6, TZ + 6.6, 9.0, 10.4, 2.2, 0, TC(0x8f9b93));                                               // face
    TB.box(tD, 0, hip + 37.0, TZ + 7.4, 12.0, 1.8, 2.4, 0, TC(0x5b6862));                                              // helm brow
    TB.box(tD, 0, hip + 30.4, TZ + 8.4, 1.6, 6.6, 1.9, 0, TC(0x5b6862));                  // nasal guard
    TB.box(M.iron, 0, hip + 29.4, TZ + 8.4, 4.4, 0.45, 0.4, 0, 0xffffff);                                                // mouth
    for (const s of [-1, 1]) { TB.box(tD, s * 2.9, hip + 35.2, TZ + 8.35, 3.6, 1.9, 0.5, 0, 0x1d2121); TB.box(M.glowA, s * 2.9, hip + 35.45, TZ + 8.7, 2.6, 1.15, 0.3, 0, 0xffffff); TB.box(tD, s * 7.0, hip + 31, TZ + 2.0, 1.6, 9, 9, 0, TC(0x4a5450)); }   // sockets + fire eyes + cheek guards
    frust(TB, tD, 0, hip + 21.6, TZ + 6.6, 4.8, 3.0, 8.8, { top: 0.55, seg: 8, color: TC(0x5b6560) });                   // beard
    TB.dome(tD, 0, hip + 42.6, TZ + 0.5, 7.6, { seg: 14, sy: 0.7, color: TC(0x4d5853) });
    frust(TB, bronzeM, 0, hip + 41.0, TZ + 0.5, 8.0, 8.4, 1.5, { seg: 14, color: 0xffffff });
    for (let i = 0; i < 13; i++) {                                                                                       // tall fan crest, front to back
      const a = (-80 + i * 13.3) * Math.PI / 180, rr = 15.5 - Math.abs(i - 6) * 0.35;
      limb(TB, tD, [0, hip + 42 + Math.cos(a) * 5.4, TZ + 0.5 + Math.sin(a) * 6.0], [0, hip + 42 + Math.cos(a) * rr, TZ + 0.5 + Math.sin(a) * rr * 1.05], 1.5, 0.7, 4, TC(0x4f5a55));
    }
    // foot towers (the fortress base)
    for (const s of [-1, 1]) {
      K.squareTower(TB, s * 38, TZ + 12, { w: 8, d: 7, h: 11, y: fy, mat: tS, roofMat: M.iron, roof: 'flat', windows: false, color: TC(0x6a746e) });
      K.tower(TB, s * 38 + s * 10.5, TZ - 7, { r: 3.0, h: 10, y: fy, mat: tS, roof: 'flat', seg: 10, windows: false, color: TC(0x6a746e) });
      for (let k = 0; k < 4; k++) quad(TB, M.glowA, s * 38 - 3 + k * 2, fy + 5, TZ + 15.55, 0.6, 1.6, 0, 0xffffff);
    }
    root.add(TB.build({}));
    const eyeY = hip + 36;
    const titanFires = [[-2.9, eyeY, TZ + 9.2], [2.9, eyeY, TZ + 9.2], [-38, fy + 13.4, TZ + 12], [38, fy + 13.4, TZ + 12], [-48.5, fy + 11.4, TZ - 7], [48.5, fy + 11.4, TZ - 7]];
    const eyes = K.fires(titanFires, { size: 34, light: 0, color: 0xff8a2a }); root.add(eyes); ctx.onUpdate((dt, t) => eyes.userData.update(t));

    // ---------------------------------------------------------------- lanterns (pooled glow spheres) + the single batch
    for (let i = -5; i <= 5; i++) lampSpots.push([i * 10, py + 3.6, U.cz + 4]);
    for (let i = -8; i <= 8; i += 2) lampSpots.push([P.cx + i * 2.6, py + 9.4, P.cz + 15.6]);
    for (const [x, y, z] of lampSpots) { b.sphere(M.lamp, x, y - 0.3, z, 0.34, { seg: 6 }); b.cyl(M.iron, x, y - 2.0, z, 0.1, 1.8, { seg: 4 }); }
    root.add(b.build({}));

    // ---------------------------------------------------------------- ships, boats, mist, gulls, people
    const ships = [];
    const sailPath = [[14, 340], [4, 250], [0, 205], [2, 178], [4, 130]];
    const mkShip = (type, len, hull, sail) => { const s = K.ship(type, { len, hull, sail }); root.add(s); return s; };
    const mover = [mkShip('galley', 16, 0x4b3a2b, 0xe3d9c2), mkShip('cog', 14, 0x5a4330, 0xd5cbb4), mkShip('galley', 15, 0x39485a, 0xc9d1d8)];
    const pl = K.polyLength(sailPath);
    mover.forEach((s, i) => ships.push({ s, kind: 'path', off: i / mover.length }));
    const purpleSails = [0x9e7fbd, 0xae8fc8, 0x8f72b0, 0xc3a8d8];
    for (let i = 0; i < 4; i++) { const s = mkShip(i % 2 ? 'cog' : 'galley', 14, 0x3d2f46, purpleSails[i]); s.position.set(-40 + i * 27, 0.2, -170); s.rotation.y = Math.PI / 2; ships.push({ s, kind: 'moored', ph: i * 1.7, base: s.rotation.y }); }
    for (let i = 0; i < 5; i++) { const s = mkShip(i % 3 ? 'cog' : 'barge', 11 + (i % 2) * 3, 0x5b4a38, 0xcdc1a6); s.position.set(-222 - (i % 2) * 8, 0.2, -50 + i * 30); s.rotation.y = Math.PI * 0.5 * (i % 2 ? 1 : -1) + Math.PI / 2; ships.push({ s, kind: 'moored', ph: i * 1.3, base: s.rotation.y }); }
    for (let i = 0; i < 3; i++) { const s = mkShip('galley', 15, 0x4a3828, 0xe5ddcd); s.position.set(-118 + i * 26, 0.2, 178); s.rotation.y = Math.PI / 2; ships.push({ s, kind: 'moored', ph: i * 0.9, base: s.rotation.y }); }
    ctx.onUpdate((dt, t) => {
      for (const o of ships) {
        if (o.kind === 'path') {
          const u = ((t * 0.016 + o.off) % 1) * pl, p = K.pointAlong(sailPath, u);
          o.s.position.set(p.x, 0.15, p.z); K.animateShip(o.s, t, o.off * 9); o.s.rotation.y = p.angle;
        } else { K.animateShip(o.s, t, o.ph); o.s.rotation.y = o.base; }
      }
    });
    // gondola-like canal craft with a bow lantern
    const hb = new Batch(), hullM = flat(0xffffff, { rough: 0.55 });
    hb.box(hullM, 0, 0, 0, 4.8, 0.42, 1.0, 0, 0xffffff); hb.box(hullM, -2.6, 0.12, 0, 1.3, 0.4, 0.8, 0, 0xffffff, 0, 0.7); hb.box(hullM, 2.6, 0.12, 0, 1.3, 0.4, 0.8, 0, 0xffffff, 0, -0.7);
    hb.box(hullM, 3.15, 0.55, 0, 0.14, 1.1, 0.5, 0, 0x9a9a9a); hb.box(hullM, -3.05, 0.4, 0, 0.14, 0.8, 0.4, 0, 0x9a9a9a);
    hb.box(hullM, -0.4, 0.42, 0, 1.8, 0.95, 0.85, 0, 0x4a4a52); hb.cyl(hullM, 2.0, 0.42, 0, 0.17, 1.6, { seg: 5, color: 0x6a6a72 }); hb.box(hullM, 2.0, 1.9, 0, 0.1, 0.1, 0.1, 0, 0x9a9a9a);
    const boatGeo = hb.build().children[0].geometry;
    const lampGeo = new THREE.SphereGeometry(0.2, 6, 4); lampGeo.translate(3.05, 1.45, 0); lampGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(lampGeo.attributes.position.count * 3).fill(1), 3));
    const lines = []; const inFree = (x, z) => !spList.some((s) => Math.abs(x - s.cx) < s.w / 2 && Math.abs(z - s.cz) < s.d / 2) && !(Math.abs(x - DROWN.cx) < DROWN.w / 2 && Math.abs(z - DROWN.cz) < DROWN.d / 2);
    const seg = (fixed, horizontal, lo, hi) => { // longest free run along a canal line
      let best = null, run = null; for (let u = lo; u <= hi; u += 3) { const ok = horizontal ? inFree(u, fixed) : inFree(fixed, u); if (ok) { if (!run) run = [u, u]; run[1] = u; if (!best || run[1] - run[0] > best[1] - best[0]) best = run; } else run = null; }
      return best && best[1] - best[0] > 30 ? best : null;
    };
    for (let j = 1; j < rowE.length - 1; j++) { const s = seg(rowE[j], true, -190, 190); if (s) lines.push({ pts: [[s[0], rowE[j]], [s[1], rowE[j]]] }); }
    for (let i = 1; i < colE.length - 1; i++) { const s = seg(colE[i], false, -140, 130); if (s) lines.push({ pts: [[colE[i], s[0]], [colE[i], s[1]]] }); }
    lines.push({ pts: GRAND }, { pts: GRAND });
    const nBoats = q.dens(34), boats = new THREE.InstancedMesh(boatGeo, hullM, nBoats), lamps = new THREE.InstancedMesh(lampGeo, M.lamp, nBoats), data = [], cols = [0x3a4350, 0x2e4a52, 0x5a3a36, 0x4a4a3a, 0x3f3a50, 0x30363c];
    const brng = K.rng(9);
    for (let i = 0; i < nBoats; i++) { const l = lines[i % lines.length]; data.push({ l, len: K.polyLength(l.pts), s: brng() * 400, v: brng.range(1.6, 3.2) * brng.sign(), off: brng.range(-1.2, 1.2) }); boats.setColorAt(i, new THREE.Color(brng.pick(cols))); }
    const ob = new THREE.Object3D();
    const updBoats = (t) => {
      for (let i = 0; i < nBoats; i++) {
        const d = data[i]; let s = (d.s + t * Math.abs(d.v)) % (d.len * 2); const rev = s > d.len, u = rev ? d.len * 2 - s : s; const p = K.pointAlong(d.l.pts, u); const lateral = d.off * (d.l.pts === GRAND ? 3.5 : 1.0);
        ob.position.set(p.x + Math.sin(p.angle) * lateral, 0.05 + Math.sin(t * 1.3 + i) * 0.03, p.z + Math.cos(p.angle) * lateral); ob.rotation.set(0, p.angle + (rev ? Math.PI : 0), Math.sin(t + i) * 0.03); ob.updateMatrix(); boats.setMatrixAt(i, ob.matrix); lamps.setMatrixAt(i, ob.matrix);
      }
      boats.instanceMatrix.needsUpdate = true; lamps.instanceMatrix.needsUpdate = true;
    };
    boats.frustumCulled = false; lamps.frustumCulled = false; boats.castShadow = true; updBoats(0); ctx.onUpdate((dt, t) => updBoats(t)); root.add(boats, lamps);
    // mist on the lagoon, chimney smoke, gulls, people
    // low fog banks lying on the lagoon: soft lit sheets (they darken with the light, unlike additive sprites), slowly drifting
    {
      const N = 64, data = new Uint8Array(N * N * 4);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const u = i / (N - 1) * 2 - 1, v = j / (N - 1) * 2 - 1, r = Math.hypot(u, v), nn = K.fbm(i * 0.09, j * 0.09, 3, 41);
        const a = K.clamp((1 - K.smoothstep(0.25, 1.0, r + (nn - 0.5) * 0.55)) * (0.55 + nn * 0.7), 0, 1);
        data.set([255, 255, 255, Math.round(a * 255)], (j * N + i) * 4);
      }
      const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat); tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
      const fogMat = new THREE.MeshLambertMaterial({ color: 0xe9eff1, map: tex, transparent: true, opacity: 0.27, depthWrite: false, side: THREE.DoubleSide, fog: true });
      const fb = new Batch(), fr = K.rng(71), plane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
      const banks = [];
      for (let i = 0; i < 44; i++) {        // drifts gather over the outer lagoon, the harbour mouth and the Drowned Town; thinner in the city
        const a = fr() * 6.283, rr = fr.range(150, 330), x = i < 10 ? fr.range(-160, 160) : Math.cos(a) * rr * 1.15, z = i < 10 ? fr.range(170, 240) : Math.sin(a) * rr * 0.95 + 20;
        banks.push([x, fr.range(0.6, 2.4), z, fr.range(80, 170), fr.range(45, 90), fr() * 3]);
      }
        for (const [x, y, z, w, d, ry] of banks) { _e.set(0, ry, 0); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s.set(w, 1, d)); fb.addGeometry(fogMat, plane, _m, 0xffffff); }
      const fogMesh = fb.build({ shadow: false, receive: false }); fogMesh.children[0].renderOrder = 3; root.add(fogMesh);
      ctx.onUpdate((dt, t) => { fogMesh.position.set(Math.sin(t * 0.03) * 14, 0, Math.cos(t * 0.021) * 9); });
    }
    const stacks = chims.filter((_, i) => i % 5 === 0).slice(0, 34);
    for (let i = 0; i < 6; i++) stacks.push([-188, 8, -60 + i * 28]);
    root.add(K.smoke(stacks, { size: 14, rise: 12, opacity: 0.2, color: 0xd8d6d0 }));
    const gulls = K.birds({ center: [0, 55, 120], radius: 110, count: q.dens(14), color: 0xf4f4f4, size: 1.3, spreadY: 25, seed: 4 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const g2 = K.birds({ center: [0, 40, -40], radius: 130, count: q.dens(10), color: 0xe8e8ea, size: 1.2, spreadY: 18, seed: 12 }); root.add(g2); ctx.onUpdate((dt, t) => g2.userData.update(t));
    const wk = K.walkers({ paths: [[[-50, -138], [50, -138]], [[28, 156], [90, 156]], [[-190, -60], [-190, 90]], [[-50, 112], [-130, 112]], [[-20, -92], [20, -92]]], heightAt: () => TOP + 0.14, count: q.dens(40), rng: K.rng(5), colors: [0x6a5a48, 0x4d5a6a, 0x7a4a42, 0x57603a, 0x5a5a62, 0x8a7a5a] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const bn = []; for (let i = -4; i <= 4; i++) bn.push({ x: i * 12, y: py + 11, z: U.cz + 4, w: 2.4, h: 5, color: 0x8a5aa6, ry: 0 });
    [[P.cx - 22, hy + 39, P.cz - 10.6], [P.cx + 22, hy + 39, P.cz - 10.6], [B.cx, py + 50, B.cz + 5.6], [C.cx - 26, py + 10, C.cz]].forEach(([x, y, z]) => bn.push({ x, y, z, w: 3, h: 7, color: 0x3c5a85, ry: 0 }));
    root.add(K.banners(bn));

    const lm = (x, z, r, y = TOP + 4) => ({ pos: [x, y, z], r });
    return {
      radius: 270, center: [0, 0, 20], minDistance: 20,
      hero: { pos: [150, 100, 480], target: [25, 36, 90] },
      climate: { atmos: 'day', weather: 'fog', snow: 0, tint: {
        dawn: { top: 0x5d78a6, horizon: 0xdcbab4, fog: 0xd0b6b2, fogD: 0.0007, sunC: 0xffc89c, sunI: 2.7, hemiSky: 0xa8b4d8, hemiGround: 0x5b5150, hemiI: 0.85 },
        day: { top: 0x5b86b0, horizon: 0xc9d6da, fog: 0xbccbd0, fogD: 0.00042, sunC: 0xfff1dc, sunI: 3.1, hemiSky: 0xb9d0e2, hemiGround: 0x5e6864, hemiI: 1.0 },
        dusk: { top: 0x2c3a72, horizon: 0xe0906a, fog: 0x9a7f8c, fogD: 0.00052, water: 0.5, sunC: 0xffa060, sunI: 2.9, hemiSky: 0x7a84bc, hemiGround: 0x3a3440, hemiI: 0.72 },
        night: { top: 0x0a1236, horizon: 0x243c5c, fog: 0x243c5c, fogD: 0.001, sunC: 0xa8bcee, sunI: 1.9, hemiSky: 0x6e80c0, hemiGround: 0x26343f, hemiI: 1.3 },
      } },
      landmarks: {
        'titan': { pos: [0, 134, TZ], r: 50, cam: { pos: [110, 75, 330], target: [0, 70, 190] } }, 'arsenal': { ...lm(A.cx, A.cz, 30, 24), cam: { pos: [-40, 86, 236], target: [A.cx, 2, A.cz + 6] } }, 'purple-harbor': lm(0, U.cz - 8, 36, 10), 'ragmans-harbor': lm(-212, 20, 36, 12),
        'sealords-palace': lm(P.cx, P.cz, 34, 40), 'iron-bank': { ...lm(B.cx, B.cz, 26, 62), cam: { pos: [B.cx - 60, 58, B.cz + 84], target: [B.cx, 22, B.cz] } }, 'house-black-white': { ...lm(W.cx, W.cz, 14, 22), cam: { pos: [W.cx + 8, 58, W.cz + 50], target: [W.cx, 7, W.cz + 2] } },
        'isle-of-gods': lm(G0.cx, G0.cz, 24, 18), 'drowned-town': lm(DROWN.cx, DROWN.cz, 44, 16), 'canals-and-bridges': lm(30, 30, 30, 12),
        'chequy-port': lm(C.cx, C.cz, 24, 14), 'seaward-isles': lm(300, 90, 60, 52),
      },
      cutaways: [],
    };
  },
};
