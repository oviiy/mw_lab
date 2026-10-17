// Volantis — flagship. Book anchors: oldest/proudest Free City at the Rhoyne mouth; the Black Walls (fused black Valyrian stone, a huge oval
// around Old Volantis, wide enough on top for six chariots abreast); the Long Bridge joining the two halves, lined with shops (a Wonder Made by Man);
// the red Temple of the Lord of Light (Fiery Hand, Benerro); the Merchant's House on the western waterfront looking back across the bridge;
// heavy slave trade; many ships on a natural harbour. Everything else (plan, positions, building forms) is interpretation — see content/volantis.js.
// Art direction: hot, humid, hazy river mouth. A seamless, battered, glossy-black fused-stone ring (swept profile: plinth, batter, corbelled
// cornice, double parapet around a broad chariot-way) with drum towers and a monumental west gate; inside, pale Valyrian palaces with courts,
// colonnades, blue-glazed domes and slender towers; outside, dense ochre/brick street blocks; silty water, mist banks, palms, reeds and real hulls.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, tri, flat, glow } = K;

const TAU = Math.PI * 2;
const OC = [150, -20], ORX = 96, ORZ = 86;               // Black Walls oval (east bank)
const BZ = -22;                                           // Long Bridge line
const cx = (z) => Math.sin(z * 0.012) * 6;                // river centreline
const half = (z) => 30 + K.smoothstep(20, 230, z) * 130;  // river half-width widening to the bay
const ell = (x, z) => Math.hypot((x - OC[0]) / ORX, (z - OC[1]) / ORZ); // <1 inside the walls

// ------------------------------------------------------------------------------------------------ helpers
const _hsl = {};
function jit(hex, r, dh = 0.012, ds = 0.07, dl = 0.05) {
  const c = new THREE.Color(hex); c.getHSL(_hsl);
  return c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, K.clamp(_hsl.s + r.range(-ds, ds), 0, 1), K.clamp(_hsl.l + r.range(-dl, dl), 0, 1));
}
const shade = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const rot = (dx, dz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return [dx * c + dz * s, -dx * s + dz * c]; };
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
const _quad = new THREE.PlaneGeometry(1, 1), _I = new THREE.Matrix4();
/** upright plane facing local +Z rotated by ry, centred at (x,y,z) */
function quad(b, mat, x, y, z, w, h, ry, color = 0xffffff) { _e.set(0, ry, 0); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s.set(w, h, 1)); b.addGeometry(mat, _quad, _m, color); }
/** tapered cylinder between two points */
function limb(b, mat, A, C, r0, r1, seg = 6, color = 0xffffff, open = false) {
  _a.set(A[0], A[1], A[2]); _b.set(C[0], C[1], C[2]).sub(_a); const len = _b.length(); _q.setFromUnitVectors(_up, _b.normalize());
  const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1, open || r1 < 0.02); g.translate(0, len / 2, 0);
  _m.compose(_a, _q, _s.set(1, 1, 1)); b.addGeometry(mat, g, _m, color); g.dispose();
}
/** parametric sheet (u,v in [0,1]) -> indexed geometry with smooth normals */
function sheet(fn, nu, nv) {
  const pos = [], idx = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) pos.push(...fn(i / nu, j / nv));
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, c = a + nu + 1; idx.push(a, c, a + 1, a + 1, c, c + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
/** drooping V-folded leaf strip from A to C, width w */
function leaf(b, mat, A, C, w, droop, color) {
  const dx = C[0] - A[0], dz = C[2] - A[2], l = Math.hypot(dx, dz) || 1, sx = -dz / l * w / 2, sz = dx / l * w / 2;
  const p = [A, C, [A[0] + sx, A[1] - droop, A[2] + sz], [C[0] + sx, C[1] - droop, C[2] + sz], [A[0] - sx, A[1] - droop, A[2] - sz], [C[0] - sx, C[1] - droop, C[2] - sz]];
  const arr = [...p[0], ...p[1], ...p[3], ...p[0], ...p[3], ...p[2], ...p[0], ...p[5], ...p[1], ...p[0], ...p[4], ...p[5]];
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); g.computeVertexNormals();
  b.addGeometry(mat, g, _I, color); g.dispose();
}
const geoOf = (batch) => batch.build({}).children[0].geometry;

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(91);
    // -------------------------------------------------------------------------------------------- landform
    const hills = (x, z) => {
      const r = Math.hypot((x - 60) * 0.85, z + 30), river = Math.abs(x - cx(z)) - half(z);
      const k = K.smoothstep(300, 640, r) * (1 - K.smoothstep(170, 320, z)) * K.smoothstep(10, 140, river);
      return k * (10 + 62 * K.fbm(x * 0.0055, z * 0.0055, 4, 3)) + K.smoothstep(150, 420, r) * 4 * K.fbm(x * 0.02, z * 0.02, 2, 8);
    };
    const heightAt = (x, z) => {
      const d = Math.abs(x - cx(z)) - half(z);
      const t = Math.max(1 - K.smoothstep(-6, 5, d), K.smoothstep(235, 290, z));
      let land = 2.2 + (K.fbm(x * 0.02, z * 0.02, 3, 6) - 0.5) * 1.2;
      land += 3.0 * (1 - K.smoothstep(0.82, 1.12, ell(x, z)));          // old city plateau
      land += hills(x, z);
      return K.lerp(land, -6, t);
    };
    const H = heightAt;
    const bankW = (z) => cx(z) - half(z), bankE = (z) => cx(z) + half(z);

    // -------------------------------------------------------------------------------------------- materials
    const black = tri('rock', { color: 0xffffff, scale: 11, rough: 0.34, metal: 0, snow: false, bump: 0.5 });
    const blackB = tri('rock', { color: 0x2b2c36, scale: 9, rough: 0.4, snow: false, bump: 0.45 });
    const plaster = tri('plaster', { color: 0xffffff, scale: 6, snow: false }), tile = tri('tile', { color: 0xffffff, scale: 4, snow: false, rough: 0.7 });
    const brick = tri('brick', { color: 0xffffff, scale: 5, snow: false, bump: 0.8 }), mud = tri('plaster', { color: 0xffffff, scale: 4, snow: false, bump: 1.1 });
    const redStone = tri('plaster', { color: 0xffffff, scale: 5, snow: false, bump: 0.35, rough: 0.75 }), marble = tri('marble', { color: 0xf0e8d8, scale: 6, snow: false, rough: 0.45 });
    const glaze = tri('tile', { color: 0xffffff, scale: 3, snow: false, rough: 0.3, bump: 0.4 });
    const wood = tri('wood', { color: 0x7a5a3a, scale: 4, snow: false }), cobble = tri('cobble', { color: 0xffffff, scale: 7, snow: false });
    const cloth = flat(0xffffff, { rough: 1, side: THREE.DoubleSide, flatShading: false });
    const gold = flat(0xd8a640, { rough: 0.32, metal: 0.55, flatShading: false }), bronze = flat(0xa8743a, { rough: 0.4, metal: 0.5, flatShading: false });
    const win = glow(0xffc46b), win2 = glow(0xffa95a, 1.15), lan = glow(0xffa84a, 1.5), dark = flat(0x16120f, { rough: 1, flatShading: false }), shut = flat(0x5a4632, { rough: 1, flatShading: false });
    const archM = tri('stone', { color: 0xd8cfba, scale: 6, snow: false, side: THREE.DoubleSide });
    const b = new Batch();
    const clothC = [0xa8503a, 0xc8a050, 0x4a7f80, 0xd8ccb0, 0x84464e, 0xb8703e];
    const palms = [], lamps = [], stacks = [], built = new Set(); let TEMPLE = null;
    const mark = (x, z, r = 1) => { for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) built.add((Math.floor(x / 8) + i) * 4096 + Math.floor(z / 8) + j); };
    const isBuilt = (x, z) => built.has(Math.floor(x / 8) * 4096 + Math.floor(z / 8));

    // ============================================================================================ OLD VOLANTIS (inside the walls)
    // avenue: west gate -> temple forecourt -> east palaces
    const GATE = [OC[0] - ORX, OC[1]];
    const av1 = K.smoothPath([[GATE[0] - 21, -21], [GATE[0] + 2, -20], [82, -17], [106, -9], [128, -2]], 5), av2 = K.smoothPath([[128, -2], [160, -5], [200, -7], [236, -13]], 5);
    const TX = 128, TZ = 34;                                                      // red temple
    const HX = 100, HZ = -48;                                                     // triarchs' hall
    const PAL = [[182, -60, 30, 24, 0], [212, -40, 22, 24, 0.05], [192, 22, 26, 20, -0.04], [152, -82, 26, 20, 0], [170, -24, 22, 20, 0]];
    const VT = [[76, -40, 34], [140, -30, 40], [198, -2, 46], [206, -76, 32], [176, 40, 38]];
    const oldFoot = (x, z, m) => PAL.some(([px, pz, w, d]) => Math.abs(x - px) < w / 2 + m && Math.abs(z - pz) < d / 2 + m) || Math.abs(x - TX) < 36 + m && Math.abs(z - TZ) < 29 + m ||
      Math.abs(x - HX) < 22 + m && Math.abs(z - HZ) < 19 + m || VT.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 5 + m) || Math.hypot(x - 128, z + 6) < 15 + m ||
      K.distToPolyline(x, z, av1).d < 5 + m || K.distToPolyline(x, z, av2).d < 5 + m;

    // ---- villas: plastered, tile hip roofs, roof terraces with pergolas, blue domes, tower-houses
    const OLDW = [0xeadbb8, 0xdccaa2, 0xf1e6cc, 0xe0c48e, 0xf0e0c6, 0xe6d2b0, 0xe8cfb8], OLDR = [0xb8582f, 0xa84a2a, 0xc8683a, 0xa8432e, 0x9a4a32];
    const villa = (x, z, o) => {
      const y = H(x, z), { w, d, h, ry, st } = o, wc = jit(o.wall, rr, 0.012, 0.06, 0.05), tr = jit(0xf6eedc, rr, 0.01, 0.03, 0.03), L = (lx, lz) => { const [a, c] = rot(lx, lz, ry); return [x + a, z + c]; };
      b.box(plaster, x, y - 1.6, z, w, h + 1.6, d, ry, wc);
      b.box(marble, x, y - 0.4, z, w + 0.3, 1.0, d + 0.3, ry, shade(o.wall, 0.82));                  // plinth
      if (h > 9) b.box(marble, x, y + h * 0.48, z, w + 0.25, 0.3, d + 0.25, ry, tr);               // string course
      b.box(marble, x, y + h - 0.2, z, w + 0.6, 0.6, d + 0.6, ry, tr);                                // cornice
      const rc = jit(o.roof, rr, 0.012, 0.08, 0.06);
      if (st === 'hip') b.pyramid(tile, x, y + h + 0.3, z, w + 0.8, Math.min(w, d) * 0.42 + 0.6, d + 0.8, ry, rc);
      else if (st === 'dome') { b.cyl(plaster, x, y + h + 0.4, z, Math.min(w, d) * 0.34, 1.6, { seg: 12, color: tr }); b.dome(glaze, x, y + h + 2, z, Math.min(w, d) * 0.37, { seg: 14, sy: 1.15, color: jit(rr() < 0.75 ? 0x2c7fa0 : 0x3a9a8c, rr, 0.02, 0.06, 0.06) }); b.cone(gold, x, y + h + 2 + Math.min(w, d) * 0.42, z, 0.18, 1.6, { seg: 5 }); }
      else if (st === 'tower') {                                                                         // tower-house with an open loggia and a small dome
        const tw = Math.min(w, d) * 0.55, [tx, tz] = L(w * 0.18, -d * 0.15);
        b.box(plaster, tx, y + h, tz, tw, 6, tw, ry, wc); b.box(marble, tx, y + h + 6, tz, tw + 0.5, 0.4, tw + 0.5, ry, tr);
        for (const [ox, oz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const [px, pz] = rot(ox * (tw / 2 - 0.3), oz * (tw / 2 - 0.3), ry); b.box(marble, tx + px, y + h + 6.4, tz + pz, 0.5, 2.6, 0.5, ry, tr); }
        b.box(marble, tx, y + h + 9, tz, tw + 0.6, 0.5, tw + 0.6, ry, tr); b.dome(glaze, tx, y + h + 9.5, tz, tw * 0.46, { seg: 10, sy: 1.2, color: jit(0x2c7fa0, rr, 0.02, 0.06, 0.06) });
        b.box(plaster, x, y + h, z, w + 0.1, 0.9, d + 0.1, ry, tr);
      } else {                                                                                           // flat roof terrace: parapet + pergola with an awning
        b.box(marble, x, y + h + 0.3, z, w - 0.5, 0.1, d - 0.5, ry, 0xc8b490);
        for (const [ox, oz, sw, sd] of [[0, d / 2 - 0.15, w, 0.3], [0, -d / 2 + 0.15, w, 0.3], [w / 2 - 0.15, 0, 0.3, d], [-w / 2 + 0.15, 0, 0.3, d]]) { const [px, pz] = rot(ox, oz, ry); b.box(plaster, x + px, y + h + 0.3, z + pz, sw, 0.9, sd, ry, tr); }
        if (rr() < 0.6) { const [px, pz] = rot(-w * 0.15, d * 0.1, ry); b.box(cloth, x + px, y + h + 2.6, z + pz, w * 0.5, 0.12, d * 0.45, ry, jit(rr.pick(clothC), rr)); for (const k of [-1, 1]) { const [qx, qz] = rot(-w * 0.15 + k * w * 0.22, d * 0.1 + d * 0.2, ry); b.cyl(wood, x + qx, y + h + 0.4, z + qz, 0.1, 2.2, { seg: 4 }); } }
        else palms.push([L(w * 0.2, 0)[0], y + h + 0.4, L(w * 0.2, 0)[1], 0.45]);
      }
      // windows: arched lights (glow + dark shutters) on the long faces
      const nW = Math.max(1, Math.floor(w / 2.6)), nF = h > 9 ? 2 : 1;
      for (const side of [1, -1]) for (let f = 0; f < nF; f++) for (let i = 0; i < nW; i++) {
        const lx = (i + 0.5) * (w / nW) - w / 2, [wx, wz] = L(lx, side * (d / 2 + 0.06)), wy = y + (nF === 1 ? h * 0.55 : h * (0.28 + f * 0.42));
        quad(b, rr() < 0.4 ? win : shut, wx, wy, wz, 0.8, 1.5, ry + (side < 0 ? Math.PI : 0));
      }
      const [dx, dz] = L(0, d / 2 + 0.07); quad(b, dark, dx, y + 1.1, dz, 1.5, 2.4, ry);
      mark(x, z, 0); if (rr() < 0.18) stacks.push([x, y + h + 2, z]);
    };
    for (const [x, z] of K.scatter({ rng: K.rng(21), count: q.dens(200), bounds: [OC[0] - ORX, OC[1] - ORZ, OC[0] + ORX, OC[1] + ORZ], minDist: 9, accept: (x, z) => ell(x, z) < 0.84, avoid: (x, z) => oldFoot(x, z, 4.5) })) {
      const st = rr.pick(['hip', 'hip', 'terrace', 'terrace', 'dome', 'tower']), w = rr.range(5.5, 8.5);
      villa(x, z, { w, d: w * rr.range(0.9, 1.3), h: st === 'tower' ? rr.range(8, 11) : rr.range(6.5, 12), ry: Math.round(rr() * 4) * Math.PI / 2 + rr.range(-0.08, 0.08), st, wall: rr.pick(OLDW), roof: rr.pick(OLDR) });
    }
    // gardens of palms between the villas
    for (const [x, z] of K.scatter({ rng: K.rng(24), count: q.dens(50), bounds: [OC[0] - ORX, OC[1] - ORZ, OC[0] + ORX, OC[1] + ORZ], minDist: 6, accept: (x, z) => ell(x, z) < 0.85 && !isBuilt(x, z), avoid: (x, z) => oldFoot(x, z, 2) })) palms.push([x, H(x, z), z, rr.range(0.8, 1.15)]);

    // ---- courtyard palaces of the old blood: four wings, tiled roofs, an inner colonnade round a palm court, a portico and a dome or tower
    const palace = ([x, z, w, d, ry], i) => {
      const y = H(x, z) + 0.6, t = 6.5, h = 11 + (i % 3) * 2, wc = jit(OLDW[(i * 3) % OLDW.length], rr, 0.01, 0.05, 0.03), tr = 0xf6eedc, rc = jit(OLDR[i % OLDR.length], rr), L = (lx, lz) => { const [a, c] = rot(lx, lz, ry); return [x + a, z + c]; };
      b.box(marble, x, y - 2.4, z, w + 3, 2.4, d + 3, ry, 0xe4dac4);
      const wings = [[0, -d / 2 + t / 2, w, t, 0], [0, d / 2 - t / 2, w, t, 0], [-w / 2 + t / 2, 0, d - 2 * t, t, 1], [w / 2 - t / 2, 0, d - 2 * t, t, 1]];
      for (const [lx, lz, len, dep, turn] of wings) {
        const [px, pz] = L(lx, lz), r2 = ry + (turn ? Math.PI / 2 : 0);
        b.box(plaster, px, y - 0.2, pz, len, h + 0.2, dep, r2, wc); b.box(marble, px, y + h - 0.3, pz, len + 0.6, 0.7, dep + 0.6, r2, tr); b.box(marble, px, y + h * 0.5, pz, len + 0.2, 0.3, dep + 0.2, r2, tr);
        b.prism(tile, px, y + h + 0.4, pz, len + (turn ? -0.2 : 0.7), 3.2, dep + 0.8, r2, rc);
        const n = Math.floor(len / 3);                                                                     // two storeys of windows, outer face
        for (let k = 0; k < n; k++) for (const f of [0.3, 0.72]) { const off = (k + 0.5) * (len / n) - len / 2, [wx, wz] = rot(off, (lz < 0 || lx < 0 ? -1 : 1) * (dep / 2 + 0.07), r2); quad(b, (k + i) % 3 ? shut : win, px + wx, y + h * f, pz + wz, 0.9, 1.9, r2 + ((lz < 0 || lx < 0) ? Math.PI : 0)); }
      }
      // inner colonnade (arcaded court) and the garden
      const iw = w / 2 - t - 1.2, id = d / 2 - t - 1.2, cols = [];
      for (let k = -iw; k <= iw + 0.01; k += (2 * iw) / Math.max(1, Math.round(iw / 1.6))) cols.push([k, -id], [k, id]);
      for (let k = -id + (2 * id) / Math.max(1, Math.round(id / 1.6)); k < id - 0.01; k += (2 * id) / Math.max(1, Math.round(id / 1.6))) cols.push([-iw, k], [iw, k]);
      for (const [lx, lz] of cols) { const [px, pz] = L(lx, lz); b.cyl(marble, px, y, pz, 0.32, 4.6, { seg: 6, top: 0.85, color: 0xf2ece0 }); }
      for (const [lx, lz, len, dep, turn] of [[0, -id, 2 * iw + 1, 1.4, 0], [0, id, 2 * iw + 1, 1.4, 0], [-iw, 0, 2 * id + 1, 1.4, 1], [iw, 0, 2 * id + 1, 1.4, 1]]) { const [px, pz] = L(lx, lz); b.box(marble, px, y + 4.6, pz, len, 0.8, dep, ry + (turn ? Math.PI / 2 : 0), tr); }
      b.box(cobble, x, y - 0.05, z, 2 * iw + 2, 0.1, 2 * id + 2, ry, 0xe0d2b0);
      b.cyl(marble, x, y, z, 1.6, 0.7, { seg: 10, color: 0xece4d2 }); b.cyl(glaze, x, y + 0.65, z, 1.3, 0.06, { seg: 10, color: 0x3a8a9a });
      for (const [lx, lz] of [[-iw * 0.55, -id * 0.5], [iw * 0.55, id * 0.5], [iw * 0.5, -id * 0.55], [-iw * 0.5, id * 0.5]]) { const [px, pz] = L(lx, lz); palms.push([px, y, pz, rr.range(0.75, 0.95)]); }
      // portico on the front wing
      { const [px, pz] = L(0, d / 2 + 2.6); for (let k = -2; k <= 2; k++) { const [cx2, cz2] = L(k * 2.3, d / 2 + 4.4); b.cyl(marble, cx2, y, cz2, 0.45, h * 0.62, { seg: 8, top: 0.86, color: 0xf6f0e4 }); }
        b.box(marble, px, y + h * 0.62, pz, 11.4, 0.9, 5.4, ry, tr); b.prism(marble, px, y + h * 0.62 + 0.9, pz, 5.6, 2.2, 11.8, ry + Math.PI / 2, 0xf0e8d8); b.box(marble, px, y - 0.6, pz, 12, 0.6, 6, ry, 0xe8e0cc); }
      // dome on the rear wing or a corner tower
      if (i % 2 === 0) { const [px, pz] = L(0, -d / 2 + t / 2); b.cyl(plaster, px, y + h, pz, 4.2, 3.4, { seg: 16, color: tr }); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; quad(b, win, px + Math.cos(a) * 4.22, y + h + 1.7, pz + Math.sin(a) * 4.22, 0.8, 1.8, Math.PI / 2 - a); } b.dome(glaze, px, y + h + 3.4, pz, 4.5, { seg: 18, sy: 1.12, color: 0x2a7c9e }); b.cyl(gold, px, y + h + 8.4, pz, 0.15, 2.4, { seg: 5 }); b.sphere(gold, px, y + h + 10.6, pz, 0.45, { seg: 6 }); }
      else { const [px, pz] = L(w / 2 - t / 2, -d / 2 + t / 2); b.box(plaster, px, y + h, pz, t + 0.6, 9, t + 0.6, ry, wc); b.box(marble, px, y + h + 9, pz, t + 1.4, 0.6, t + 1.4, ry, tr); b.pyramid(tile, px, y + h + 9.6, pz, t + 1.6, 4.4, t + 1.6, ry, rc); for (const s of [1, -1]) { const [wx, wz] = rot(0, s * (t / 2 + 0.36), ry); quad(b, win, px + wx, y + h + 5, pz + wz, 1.1, 2.4, ry + (s < 0 ? Math.PI : 0)); } }
      mark(x, z, 2); stacks.push([x + 3, y + h + 4, z]);
    };
    PAL.forEach(palace);

    // ---- slender Valyrian towers: square base, octagonal shaft, balconies, a lantern storey and an elongated glazed dome
    for (const [x, z, h] of VT) {
      const y = H(x, z), c = jit(0xece0c4, rr, 0.01, 0.04, 0.03);
      b.box(marble, x, y - 1, z, 7.4, 9, 7.4, 0, shade(0xe4d8c0, 0.95)); b.box(marble, x, y + 8, z, 8, 0.6, 8, 0, 0xf6eedc);
      b.cyl(plaster, x, y + 8.6, z, 3.4, h - 8.6, { seg: 8, top: 0.86, color: c });
      for (const k of [0.45, 0.78]) { b.cyl(marble, x, y + h * k, z, 3.4 * (1 - 0.14 * k) + 1.0, 0.5, { seg: 8, color: 0xf6eedc }); }
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.39, r0 = 3.4 * 0.9; quad(b, win, x + Math.cos(a) * r0, y + h * 0.3, z + Math.sin(a) * r0, 0.6, 1.8, Math.PI / 2 - a); quad(b, win, x + Math.cos(a) * r0 * 0.95, y + h * 0.62, z + Math.sin(a) * r0 * 0.95, 0.6, 1.8, Math.PI / 2 - a); }
      const tr2 = 3.4 * 0.86; b.cyl(marble, x, y + h, z, tr2 + 0.8, 0.6, { seg: 8, color: 0xf6eedc });
      for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; b.box(marble, x + Math.cos(a) * tr2 * 0.95, y + h + 0.6, z + Math.sin(a) * tr2 * 0.95, 0.45, 3.4, 0.45, -a, 0xf6eedc); }
      b.cyl(dark, x, y + h + 0.6, z, tr2 * 0.7, 3.4, { seg: 8, color: 0x2a2018 }); b.sphere(lan, x, y + h + 1.6, z, 0.9, { seg: 6 });
      b.cyl(marble, x, y + h + 4, z, tr2 + 0.5, 0.5, { seg: 8, color: 0xf6eedc });
      b.dome(glaze, x, y + h + 4.5, z, tr2 + 0.2, { seg: 14, sy: 1.6, color: jit(0x2a7c9e, rr, 0.015, 0.05, 0.04) }); b.cyl(gold, x, y + h + 4.5 + (tr2 + 0.2) * 1.6, z, 0.12, 2.6, { seg: 5 });
      mark(x, z, 0);
    }

    // ---- Temple of the Lord of Light (red; interpretive form): terraced podium, pilastered hall, a tiered central tower and seven flame-tipped spires
    { const x = TX, z = TZ, y = H(x, z) + 0.4, red = 0xbe422e, redD = 0x8e3024, redL = 0xd65e40, gild = 0xfff0c8;
      b.box(marble, x, y - 2.4, z, 72, 2.6, 58, 0, 0xe2d8c4); b.box(redStone, x, y, z, 64, 2.6, 50, 0, redD); b.box(marble, x, y + 2.4, z, 65, 0.5, 51, 0, 0xe8dcc6);
      for (let k = 0; k < 7; k++) b.box(marble, x, y - 2.4, z - 26 - 0.9 * (7 - k), 32, 0.5 + k * 0.72, 1.0, 0, 0xece3d0);           // grand stair to the north forecourt
      b.box(redStone, x, y + 2.9, z, 50, 19, 36, 0, red); b.box(redStone, x, y + 2.9, z, 51, 2.2, 37, 0, redD);
      for (let i = -4; i <= 4; i++) for (const s of [-1, 1]) { b.box(redStone, x + i * 5.6, y + 2.9, z + s * 18.3, 1.5, 19, 1.0, 0, redL); if (i < 4) quad(b, win2, x + i * 5.6 + 2.8, y + 11, z + s * 18.06, 1.9, 9.5, s < 0 ? Math.PI : 0); }
      for (let i = -2; i <= 2; i++) for (const s of [-1, 1]) { b.box(redStone, x + s * 25.3, y + 2.9, z + i * 6.4, 1.0, 19, 1.5, 0, redL); if (i < 2) quad(b, win2, x + s * 25.06, y + 11, z + i * 6.4 + 3.2, 1.9, 9.5, s * Math.PI / 2); }
      b.box(gold, x, y + 21.6, z, 52, 1.2, 38, 0, gild); b.box(redStone, x, y + 22.8, z, 50.6, 1.2, 36.6, 0, redD);
      // north portal
      b.box(redStone, x, y + 2.9, z - 19.5, 16, 24, 3, 0, redL); quad(b, dark, x, y + 9, z - 21.06, 7, 12, Math.PI); quad(b, win2, x, y + 18.5, z - 21.06, 4, 4, Math.PI); b.box(bronze, x, y + 26.9, z - 19.5, 16.6, 0.8, 3.4, 0, gild);
      b.prism(redStone, x, y + 27.7, z - 19.5, 3.4, 4, 16.6, Math.PI / 2, redD);
      // upper tier
      b.box(redStone, x, y + 24, z, 38, 6, 24, 0, red); b.box(gold, x, y + 30, z, 39, 0.8, 25, 0, gild);
      for (let i = -3; i <= 3; i++) for (const s of [-1, 1]) quad(b, win2, x + i * 5, y + 27, z + s * 12.06, 1.4, 3.6, s < 0 ? Math.PI : 0);
      // central tiered tower
      let yy = y + 30.8;
      for (const [r0, hh, tp] of [[9.5, 11, 0.9], [7.8, 10, 0.88], [6.4, 9, 0.86], [5, 8, 0.84]]) {
        b.cyl(redStone, x, yy, z, r0, hh, { top: tp, seg: 16, color: hh > 10 ? red : redL }); b.cyl(gold, x, yy + hh, z, r0 * tp + 0.8, 0.8, { seg: 16, color: gild });
        for (let m = 0; m < 6; m++) { const a = m / 6 * TAU + 0.3; quad(b, win2, x + Math.cos(a) * r0 * (tp + 1) / 2 * 1.01, yy + hh * 0.5, z + Math.sin(a) * r0 * (tp + 1) / 2 * 1.01, 0.9, hh * 0.45, Math.PI / 2 - a); }
        yy += hh + 0.8;
      }
      b.cone(redStone, x, yy, z, 4.0, 16, { seg: 16, color: redL }); b.cyl(bronze, x, yy + 15.4, z, 0.5, 2.5, { seg: 6, color: gild });
      const crown = [x, yy + 18.6, z];
      // seven spires (with the central tower: eight)
      const spires = [[-22, -15, 3.4, 54], [22, -15, 3.4, 54], [-22, 15, 3.4, 54], [22, 15, 3.4, 54], [-12.5, -21.5, 2.4, 42], [12.5, -21.5, 2.4, 42], [0, 21.5, 2.8, 46]], spireTops = [crown];
      for (const [sx, sz, r, h] of spires) {
        const bx = x + sx, bz = z + sz, y0 = y + (Math.abs(sz) > 20 ? 2.9 : 22.8);
        b.cyl(redStone, bx, y0, bz, r, h - (y0 - y), { top: 0.55, seg: 10, color: red });
        for (const k of [0.35, 0.62, 0.86]) { const yk = y0 + (h - (y0 - y)) * k; b.cyl(gold, bx, yk, bz, r * (1 - 0.45 * k) + 0.45, 0.6, { seg: 10, color: gild }); }
        b.cone(redStone, bx, y + h, bz, r * 0.62, r * 3.2, { seg: 10, color: redL }); b.cyl(bronze, bx, y + h + r * 3.2 - 0.3, bz, 0.25, 1.6, { seg: 5, color: gild });
        spireTops.push([bx, y + h + r * 3.2 + 1.8, bz]);
      }
      // forecourt plaza with braziers
      b.cyl(cobble, 128, H(128, -6) - 0.3, -6, 15, 0.5, { seg: 24, color: 0xcdbf9f }); b.cyl(redStone, 128, H(128, -6), -6, 3, 1.4, { seg: 12, color: redD });
      TEMPLE = { spireTops, braz: [[128, H(128, -6) + 2.4, -6], [x - 15, y + 1.2, z - 30], [x + 15, y + 1.2, z - 30]] };
      for (const [bx2, by2, bz2] of TEMPLE.braz.slice(1)) b.cyl(bronze, bx2, by2 - 1.2, bz2, 0.9, 1.4, { top: 1.4, seg: 8, color: gild });
      mark(x, z, 4);
    }

    // ---- Triarchs' hall (interpretive): podium, pillared portico, drum with lit windows and a great glazed dome
    { const x = HX, z = HZ, y = H(x, z) + 0.4;
      b.box(marble, x, y - 2.4, z, 44, 2.6, 34, 0, 0xe0d8c4); for (let k = 0; k < 4; k++) b.box(marble, x, y - 2.4, z + 17 + (4 - k) * 0.8, 26, 0.6 + k * 0.6, 0.9, 0, 0xece3d0);
      b.box(plaster, x, y + 0.2, z - 2, 34, 14, 22, 0, 0xf0e4c8); b.box(marble, x, y + 14, z - 2, 36, 1.0, 24, 0, 0xf6eedc);
      for (const s of [-1, 1]) { b.box(plaster, x + s * 21, y + 0.2, z - 2, 8, 10, 18, 0, 0xe8dcc0); b.box(marble, x + s * 21, y + 10, z - 2, 9, 0.7, 19, 0, 0xf6eedc); b.pyramid(tile, x + s * 21, y + 10.6, z - 2, 9, 3, 19, 0, 0xb8582f); }
      K.columns(b, Array.from({ length: 10 }, (_, i) => [x - 18 + i * 4, z + 12.6]), { h: 13, r: 0.8, mat: marble, y: y + 0.2, color: 0xf6f0e4 });
      b.box(marble, x, y + 13.6, z + 11.5, 40, 1.4, 5, 0, 0xf6eedc); b.prism(marble, x, y + 15, z + 11.5, 40.5, 3.2, 5.6, 0, 0xf0e8d8);
      for (let i = 0; i < 7; i++) quad(b, win, x - 12 + i * 4, y + 6, z + 9.06, 1.4, 5.4, 0);
      b.cyl(plaster, x, y + 15, z - 2, 10.5, 5, { seg: 24, color: 0xf0e4c8 }); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; quad(b, win, x + Math.cos(a) * 10.52, y + 17.5, z - 2 + Math.sin(a) * 10.52, 1.0, 2.6, Math.PI / 2 - a); }
      b.cyl(marble, x, y + 20, z - 2, 11.2, 0.9, { seg: 24, color: 0xf6eedc }); b.dome(glaze, x, y + 20.9, z - 2, 10.6, { seg: 24, sy: 0.92, color: 0x2a7c9e });
      b.cyl(marble, x, y + 30.4, z - 2, 1.6, 2.4, { seg: 8, color: 0xf6eedc }); b.dome(gold, x, y + 32.8, z - 2, 1.7, { seg: 10, sy: 1.3 }); b.cyl(gold, x, y + 34.8, z - 2, 0.12, 2.6, { seg: 5 });
      mark(x, z, 3);
    }
    b.ribbon(cobble, av1, 9, H, 0.25, 0xd6c8a8); b.ribbon(cobble, av2, 8, H, 0.25, 0xd6c8a8);

    // ============================================================================================ THE BLACK WALLS
    // one seamless swept surface: battered plinth, sloping outer face, corbelled cornice, outer parapet, a 15 m chariot-way, inner parapet
    { const N = q.low ? 120 : 176, prof = [[11.8, -3], [11.8, 2.2], [10.6, 3.4], [8.8, 25.4], [10, 26.6], [10, 28], [9.2, 28], [9.2, 31.4], [7.8, 31.4], [7.8, 28.8], [-7.8, 28.8], [-7.8, 30.8], [-9, 30.8], [-9, 27.4], [-8.3, 26.6], [-8.9, 6], [-9.9, 5], [-9.9, -3]];
      const pos = [], nor = [], col = [], cc = new THREE.Color();
      const P = (i) => { const a = (i / N) * TAU, ca = Math.cos(a), sa = Math.sin(a); let nx = ca / ORX, nz = sa / ORZ; const l = Math.hypot(nx, nz); return [OC[0] + ca * ORX, OC[1] + sa * ORZ, nx / l, nz / l, a]; };
      const ring = Array.from({ length: N + 1 }, (_, i) => P(i));
      const colAt = (k, y, a) => {
        const streak = K.fbm(a * 14, y * 0.09, 3, 17), big = K.fbm(a * 2.2, 0.5, 2, 5);
        if (k === 9) return cc.setRGB(0.30, 0.29, 0.28).multiplyScalar(0.85 + 0.3 * streak);                          // chariot-way
        let v = 0.15 + 0.08 * streak + 0.04 * big;
        v *= 0.72 + 0.28 * K.smoothstep(-2, 8, y);                                                                   // wet, dark foot
        if (k >= 4 && k <= 8 || k >= 10 && k <= 13) v *= 1.25;                                                       // lit cornice/parapet edges
        return cc.setRGB(v * 0.98, v, v * 1.12);
      };
      for (let k = 0; k < prof.length - 1; k++) {
        const [o0, y0] = prof[k], [o1, y1] = prof[k + 1], dO = o1 - o0, dY = y1 - y0, Lk = Math.hypot(dO, dY), eo = dY / Lk, ey = -dO / Lk;
        for (let i = 0; i < N; i++) {
          const A = ring[i], B = ring[i + 1];
          const V = (p, o, y) => [p[0] + p[2] * o, y, p[1] + p[3] * o], Nn = (p) => { const nx = p[2] * eo, nz = p[3] * eo, l = Math.hypot(nx, ey, nz); return [nx / l, ey / l, nz / l]; };
          const a0 = V(A, o0, y0), a1 = V(A, o1, y1), b0 = V(B, o0, y0), b1 = V(B, o1, y1);
          let tris = [[a0, A, y0], [b0, B, y0], [b1, B, y1], [a0, A, y0], [b1, B, y1], [a1, A, y1]];
          // winding check against the intended normal
          const e1 = [b0[0] - a0[0], b0[1] - a0[1], b0[2] - a0[2]], e2 = [b1[0] - a0[0], b1[1] - a0[1], b1[2] - a0[2]], gn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]], wn = Nn(A);
          if (gn[0] * wn[0] + gn[1] * wn[1] + gn[2] * wn[2] < 0) tris = [tris[0], tris[2], tris[1], tris[3], tris[5], tris[4]];
          for (const [v, p, yy] of tris) { pos.push(...v); nor.push(...Nn(p)); const c2 = colAt(k, yy, p[4]); col.push(c2.r, c2.g, c2.b); }
        }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      const wm = new THREE.Mesh(g, black); wm.castShadow = true; wm.receiveShadow = true; root.add(wm);
    }
    const ringPt = (a, off = 0) => { const ca = Math.cos(a), sa = Math.sin(a); let nx = ca / ORX, nz = sa / ORZ; const l = Math.hypot(nx, nz); nx /= l; nz /= l; return { x: OC[0] + ca * ORX + nx * off, z: OC[1] + sa * ORZ + nz * off, nx, nz }; };
    const basis = (nx, nz, x, y, z) => { const n = new THREE.Vector3(nx, 0, nz), t = new THREE.Vector3().crossVectors(n, _up); return new THREE.Matrix4().makeBasis(n, _up, t).setPosition(x, y, z); };
    // merlons on the outer parapet, lanterns along the inner one
    { const n = q.low ? 110 : 170;
      for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * TAU; if (Math.abs(a - Math.PI) < 0.22) continue; const p = ringPt(a, 8.5); b.box(blackB, p.x, 31.3, p.z, 1.7, 1.5, 1.4, K.headingX(-p.nz, p.nx), 0x2f303a); }
      for (let i = 0; i < 40; i++) { const p = ringPt((i + 0.25) / 40 * TAU, -8.4); lamps.push([p.x, 31.6, p.z]); }
    }
    // tapering spurs between the towers (fused buttresses)
    { const sh = new THREE.Shape([[10.2, -3], [14.2, -3], [14.2, 1.5], [10.6, 21.5], [9.0, 25.2]].map(([u, v]) => new THREE.Vector2(u, v)));
      const sg = new THREE.ExtrudeGeometry(sh, { depth: 4.6, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 1 }); sg.translate(0, 0, -2.3);
      for (let i = 0; i < 36; i++) { const a = (i + 0.5) / 36 * TAU; if (Math.abs(a - Math.PI) < 0.3) continue; if (i % 3 === 1) continue; const p = ringPt(a, 0); b.addGeometry(blackB, sg, basis(p.nx, p.nz, p.x - p.nx * 0, 0, p.z), 0x34353f); }
    }
    // drum towers (two taller flank the west gate)
    const GD = 0.19, towerAs = [Math.PI - GD, Math.PI + GD]; for (let i = 0; i < 10; i++) towerAs.push(Math.PI + GD + (i + 1) * (TAU - 2 * GD) / 11);
    const wallFires = [];
    towerAs.forEach((a, i) => {
      const gate = i < 2, p = ringPt(a, gate ? 7 : 5.5), R = gate ? 11 : 9.6, Ht = gate ? 45 : 38, tp = 0.88;
      b.cyl(blackB, p.x, -3, p.z, R + 2.2, 8, { top: 0.82, seg: 24, color: 0x24252e });
      b.cyl(black, p.x, 4, p.z, R, Ht - 4, { top: tp, seg: 24, color: 0x2a2b34 });
      for (const f of [0.38, 0.7]) { const rr2 = R * (1 - (1 - tp) * f) + 0.35; b.cyl(blackB, p.x, 4 + (Ht - 4) * f, p.z, rr2, 0.8, { seg: 24, color: 0x3a3b46 }); }
      const rt = R * tp; b.cyl(blackB, p.x, Ht, p.z, rt, 1.8, { top: 1.14, seg: 24, color: 0x383944 }); b.cyl(black, p.x, Ht + 1.8, p.z, rt * 1.14, 2.6, { seg: 24, color: 0x30313b });
      const nm = gate ? 18 : 16; for (let k = 0; k < nm; k++) { const t2 = k / nm * TAU; b.box(blackB, p.x + Math.cos(t2) * (rt * 1.14 - 0.6), Ht + 4.4, p.z + Math.sin(t2) * (rt * 1.14 - 0.6), 1.6, 1.4, 1.1, -t2 + Math.PI / 2, 0x30313b); }
      b.cyl(blackB, p.x, Ht + 1.9, p.z, rt * 0.5, gate ? 7 : 3.4, { top: 0.8, seg: 12, color: 0x30313b }); if (gate) b.cone(blackB, p.x, Ht + 8.9, p.z, rt * 0.5, 8, { seg: 12, color: 0x30313b });
      for (const [f, w2, h2] of [[0.3, 0.7, 2.6], [0.58, 0.7, 2.6], [0.82, 1.0, 1.8]]) for (let k = -2; k <= 2; k++) {
        const t2 = Math.atan2(p.nz, p.nx) + k * 0.42, rr2 = R * (1 - (1 - tp) * f) + 0.06; quad(b, f > 0.8 ? lan : dark, p.x + Math.cos(t2) * rr2, 4 + (Ht - 4) * f, p.z + Math.sin(t2) * rr2, w2, h2, Math.PI / 2 - t2, 0x101014);
      }
      lamps.push([p.x, Ht + 5.6, p.z]); if (gate) wallFires.push([p.x, Ht + 17.6, p.z]);
    });
    // the west gate: a projecting gate block with a deep round-headed portal facing the Long Bridge
    { const p = ringPt(Math.PI, 0), tx = -p.nz, tz = p.nx, ry = K.headingX(tx, tz), y0 = H(p.x - 16, p.z);
      b.box(black, p.x + p.nx * 9, -3, p.z + p.nz * 9, 22, 37, 11, ry, 0x2c2d36); b.box(blackB, p.x + p.nx * 9.3, 34, p.z + p.nz * 9.3, 23.4, 1.4, 12, ry, 0x3a3b46);
      for (let k = -4; k <= 4; k++) b.box(blackB, p.x + p.nx * 14.6 + tx * k * 2.5, 35.4, p.z + p.nz * 14.6 + tz * k * 2.5, 1.6, 1.6, 1.1, ry, 0x30313b);
      const arch = (wd, ht) => { const s = new THREE.Shape(); s.moveTo(-wd / 2, 0); s.lineTo(wd / 2, 0); s.lineTo(wd / 2, ht - wd / 2); s.absarc(0, ht - wd / 2, wd / 2, 0, Math.PI, false); s.lineTo(-wd / 2, 0); return new THREE.ShapeGeometry(s, 12); };
      const ux = new THREE.Vector3().crossVectors(_up, new THREE.Vector3(p.nx, 0, p.nz)), nn = new THREE.Vector3(p.nx, 0, p.nz);
      for (const [wd, ht, off, mat, col] of [[18, 26, 14.62, blackB, 0x77777e], [15, 23.4, 14.8, black, 0x34353e], [12.2, 20.6, 14.98, blackB, 0x5c5c64], [10, 18, 15.14, dark, 0x0a0908]]) {
        const g = arch(wd, ht); b.addGeometry(mat, g, new THREE.Matrix4().makeBasis(ux, _up, nn).setPosition(p.x + p.nx * off, y0 - 0.5, p.z + p.nz * off), col); g.dispose();
      }
      for (const s of [-1, 1]) { const dx = p.x + p.nx * 15.6 + tx * s * 3.6, dz = p.z + p.nz * 15.6 + tz * s * 3.6; b.box(bronze, dx, y0 - 0.5, dz, 2.6, 15.5, 0.5, ry + s * 0.5, 0xc89548); for (let k = 1; k < 5; k++) b.box(gold, dx, y0 - 0.5 + k * 3.2, dz, 2.7, 0.3, 0.6, ry + s * 0.5, 0xe0b050); }
      b.box(marble, p.x + p.nx * 22, y0 - 0.8, p.z + p.nz * 22, 14, 0.9, 18, ry, 0x6a6870);
      for (const s of [-1, 1]) { const fx = p.x + p.nx * 15.6 + tx * s * 9.5, fz = p.z + p.nz * 15.6 + tz * s * 9.5; b.cyl(bronze, fx, y0 + 7, fz, 0.7, 1.2, { top: 1.5, seg: 8, color: 0xa8743a }); wallFires.push([fx, y0 + 9, fz]); }
    }

    // ============================================================================================ OUTER CITY: dense ochre/brick street blocks
    const WBW = [0xc9955f, 0xd8b078, 0xb98558, 0xe0c796, 0xc08a68, 0xd0a06a, 0xbf7d55, 0xd9bc8c], WBR = [0xb0522c, 0x9a4a2c, 0xc8683a, 0x8c5a3a, 0xa8482c];
    const MH = [-60, -50], SM = [-104, 30];                                                         // merchant's house, slave market
    const westOK = (x, z, m) => x < bankW(z) - 24 - m && x > -270 && z > -150 && z < 205 && Math.abs(z - BZ) > 8 + m && Math.hypot(x - MH[0], z - MH[1]) > 20 + m && !(Math.abs(x - SM[0]) < 26 + m && Math.abs(z - SM[1]) < 22 + m) && !(z > 120 && x > bankW(z) - 40);
    const eastOK = (x, z, m) => x > bankE(z) + 24 + m && x < 320 && z > -150 && z < 175 && ell(x, z) > 1.2 + m / 90 && Math.abs(z - BZ) > 7 + m && !(x < 60 && Math.abs(z - BZ) < 14);
    const townHouse = (x, z, w, d, h, ry, wcol, rcol, style) => {
      const y = H(x, z), wc = jit(wcol, rr, 0.015, 0.08, 0.06), L = (lx, lz) => { const [a, c] = rot(lx, lz, ry); return [x + a, z + c]; }, mat = rr() < 0.55 ? brick : mud;
      b.box(mat, x, y - 1.4, z, w, h + 1.4, d, ry, wc);
      if (style === 'gable') b.prism(tile, x, y + h, z, w + 0.5, Math.min(w, d) * 0.34 + 0.5, d + 0.6, ry, jit(rcol, rr, 0.012, 0.08, 0.06));
      else if (style === 'hip') b.pyramid(tile, x, y + h, z, w + 0.6, Math.min(w, d) * 0.36 + 0.4, d + 0.6, ry, jit(rcol, rr, 0.012, 0.08, 0.06));
      else {                                                                                            // flat roof with lip, stair-head, awning or roof garden
        b.box(mud, x, y + h, z, w + 0.25, 0.55, d + 0.25, ry, shade(wcol, 1.06)); b.box(mud, x, y + h + 0.5, z, w - 0.5, 0.1, d - 0.5, ry, shade(wcol, 0.8));
        const u = rr(); if (u < 0.45) { const [px, pz] = L(w * 0.22, -d * 0.2); b.box(mud, px, y + h, pz, w * 0.36, 2.3, d * 0.34, ry, shade(wcol, 0.94)); }
        else if (u < 0.75) { const [px, pz] = L(0, 0); b.box(cloth, px, y + h + 2.0, pz, w * 0.7, 0.1, d * 0.5, ry, jit(rr.pick(clothC), rr)); }
        else if (u < 0.85) palms.push([x, y + h + 0.5, z, 0.4]);
      }
      const nF = Math.max(1, Math.round(h / 3.4)), nW = Math.max(1, Math.floor(w / 2.4));
      for (let f = 0; f < nF; f++) for (let i = 0; i < nW; i++) { const lx = (i + 0.5) * (w / nW) - w / 2, [wx, wz] = L(lx, d / 2 + 0.06); quad(b, rr() < 0.35 ? win : dark, wx, y + (f + 0.55) * (h / nF), wz, 0.7, 1.1, ry, 0x6a5038); }
      const [dx, dz] = L(w * 0.25, d / 2 + 0.07); quad(b, shut, dx, y + 1.0, dz, 1.1, 2.0, ry);
      if (rr() < 0.18) { const [ax, az] = L(0, d / 2 + 0.9); b.box(cloth, ax, y + 2.5, az, w * 0.8, 0.1, 1.8, ry, jit(rr.pick(clothC), rr), -0.22, 0); }
      mark(x, z, 1); if (rr() < 0.06) stacks.push([x, y + h + 2, z]);
    };
    const blocks = (ox, oz, ang, nu, nv, BW, BD, ok, style) => {
      const ca = Math.cos(ang), sa = Math.sin(ang), dens = q.dens(100) / 100;
      for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
        const bu = i * (BW + 5.5), bv = j * (BD + 5.5), dd = rr.range(6, 8);
        const place = (lu, lv, w, ry) => { const u = bu + lu, v = bv + lv, x = ox + u * ca + v * sa, z = oz - u * sa + v * ca; if (!ok(x, z, 3) || rr() > dens) return;
          const tall = rr() < 0.08, h = tall ? rr.range(10, 14) : rr.range(4.2, 9); townHouse(x, z, w - 0.15, dd, h, ry + ang, rr.pick(WBW), rr.pick(WBR), style(x, z)); };
        for (const side of [0, 1, 2, 3]) {
          const ns = side < 2, len = ns ? BW : BD - 2 * dd; let t = 0;
          while (t < len - 3.6) { const w = Math.min(rr.range(4.2, 7.2), len - t); const c = t + w / 2 - len / 2; t += w;
            if (side === 0) place(c, -BD / 2 + dd / 2, w, Math.PI); else if (side === 1) place(c, BD / 2 - dd / 2, w, 0);
            else if (side === 2) place(-BW / 2 + dd / 2, c, w, -Math.PI / 2); else place(BW / 2 - dd / 2, c, w, Math.PI / 2); }
        }
        if (rr() < 0.4) { const x = ox + bu * ca + bv * sa, z = oz - bu * sa + bv * ca; if (ok(x, z, 3)) palms.push([x + rr.range(-3, 3), H(x, z), z + rr.range(-3, 3), rr.range(0.7, 1)]); }
      }
    };
    const wStyle = () => rr.pick(['gable', 'gable', 'flat', 'flat', 'hip']), eStyle = () => rr.pick(['flat', 'gable', 'flat', 'hip']);
    blocks(-262, -140, 0.07, 8, 12, 28, 22, westOK, wStyle);
    blocks(52, -120, -0.05, 10, 11, 26, 22, eastOK, eStyle);

    // ---- Merchant's House: big inn on the west waterfront, a loggia and lit windows facing the bridge and the Black Walls
    { const [x, z] = MH, y = H(x, z), wc = 0xe6cfa0;
      b.box(marble, x, y - 1.6, z, 26, 2.8, 20, 0, 0xcdb890); b.box(plaster, x, y + 1, z, 24, 16, 18, 0, wc);
      b.box(marble, x, y + 8.6, z, 24.4, 0.4, 18.4, 0, 0xf4ecd8); b.box(marble, x, y + 16.6, z, 25, 0.9, 19, 0, 0xf8f0dc); b.pyramid(tile, x, y + 17.4, z, 25, 6, 19, 0, 0xb04e2a);
      for (const sz of [-6, -2, 2, 6]) { quad(b, win, x + 12.06, y + 12.4, z + sz, 2.0, 3.4, Math.PI / 2); quad(b, win, x + 12.06, y + 4.6, z + sz, 2.0, 3.0, Math.PI / 2); }
      for (const sx of [-8, -3, 3, 8]) for (const s of [-1, 1]) quad(b, s > 0 ? win : shut, x + sx, y + 12.4, z + s * 9.06, 1.6, 3, s < 0 ? Math.PI : 0);
      for (const sz of [-8, -4, 0, 4, 8]) b.cyl(marble, x + 15.6, y, z + sz, 0.42, 8.4, { seg: 8, color: 0xf2ece0 });
      b.box(marble, x + 13.8, y + 8.4, z, 4.4, 0.6, 18, 0, 0xf4ecd8); for (let k = -8; k <= 8; k += 1) b.box(marble, x + 15.8, y + 9, z + k, 0.18, 1.0, 0.18, 0, 0xf4ecd8);
      b.box(cloth, x + 16.8, y + 4.4, z, 3.6, 0.15, 17, 0, 0xb5472f, 0, 0.32); b.box(wood, x + 12.1, y, z, 0.4, 4.6, 3.6);
      b.box(cobble, x + 22, y - 0.3, z, 12, 0.5, 24, 0, 0xc8b898); mark(x, z, 2); stacks.push([x - 6, y + 22, z - 3]);
      lamps.push([x + 18, y + 3.2, z - 8], [x + 18, y + 3.2, z + 8]);
    }
    // ---- slave market: open plaza with awnings, raised wooden platforms and stalls (no figures)
    { const [x0, z0] = SM, y = H(x0, z0);
      b.box(cobble, x0, y - 0.4, z0, 50, 0.7, 42, 0, 0xf2dcb0); b.box(wood, x0 + 2, y + 0.3, z0 - 6, 12, 1.4, 8, 0, 0x6a4e34); b.box(wood, x0 - 14, y + 0.3, z0 + 6, 9, 1.2, 7, 0, 0x6a4e34);
      for (const [ox, oz] of [[2, -6], [-14, 6]]) for (const sg of [-1, 1]) b.cyl(wood, x0 + ox + sg * 4.4, y + 1.7, z0 + oz, 0.2, 3.2, { seg: 5 });
      for (let i = 0; i < 14; i++) { const x = x0 - 22 + (i % 7) * 7.4, z = z0 + (i < 7 ? 16 : -17); for (const dx of [-1.8, 1.8]) b.cyl(wood, x + dx, y, z, 0.16, 3, { seg: 4 }); b.box(cloth, x, y + 3, z, 4.8, 0.14, 4.2, 0.05, jit(clothC[i % 6], rr)); }
      b.box(brick, x0 - 25.5, y - 0.4, z0, 1.2, 3.2, 42, 0, 0xb98558); b.box(brick, x0 + 25.5, y - 0.4, z0 - 12, 1.2, 3.2, 18, 0, 0xb98558);
      mark(x0, z0, 3);
    }
    // ---- quays: stone embankments, wooden piers, warehouses
    for (const side of [-1, 1]) {
      const pts = []; for (let z = -140; z <= 175; z += 6) pts.push([(side < 0 ? bankW(z) - 3.5 : bankE(z) + 3.5), z]);
      b.ribbon(cobble, pts, 9, (x, z) => Math.max(H(x, z), 1.6), 0.15, 0xbcae90);
      for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1]; if (Math.abs((z0 + z1) / 2 - BZ) < 8) continue; const mx = (x0 + x1) / 2 + side * -4.4, mz = (z0 + z1) / 2; b.box(marble, mx, -4, mz, 1.4, 6.1, Math.hypot(x1 - x0, z1 - z0) + 0.4, K.headingX(z1 - z0, -(x1 - x0)) + Math.PI / 2, 0xc8bea8); }
    }
    const moorings = [];
    for (let i = 0; i < 10; i++) for (const side of [-1, 1]) {
      const z = 26 + i * 15 + (side > 0 ? 6 : 0), x0 = side < 0 ? bankW(z) - 1 : bankE(z) + 1, len = 16 + (i % 3) * 5, dir = -side;
      b.box(wood, x0 + dir * len / 2, 0.8, z, len, 0.45, 3.2, 0, 0x7a5a3a); for (let k = 2; k <= len; k += 3.5) for (const s of [-1, 1]) b.cyl(wood, x0 + dir * k, -3, z + s * 1.5, 0.22, 4.2, { seg: 4, color: 0x5a4430 });
      if (i % 2 === 0) lamps.push([x0 + dir * len, 2.4, z]);
      moorings.push([x0 + dir * Math.max(len * 0.55, 12.5), z + 4.6, side], [x0 + dir * Math.max(len * 0.5, 12.5), z - 4.6, side]);
      if (side < 0 && i < 8 || side > 0 && i < 7) { const wz = z, wx = side < 0 ? bankW(z) - 16 : bankE(z) + 16; townHouse(wx, wz, 13, 9, 7, side < 0 ? Math.PI / 2 : -Math.PI / 2, WBW[i % 8], WBR[i % 5], 'gable'); }
    }

    // ============================================================================================ THE LONG BRIDGE
    const bxA = bankW(BZ) - 4, bxC = bankE(BZ) + 4, BY0 = 3.4, BR = 5.6, BW = 15, span = bxC - bxA;
    const deckY = (x) => BY0 + Math.sin(K.clamp((x - bxA) / span, 0, 1) * Math.PI) * BR;
    K.bridge(b, [bxA, BY0, BZ], [bxC, BY0, BZ], { w: BW, rise: BR, mat: marble, pillars: false, rail: false, thick: 1.8, sink: 2, color: 0xe2d8c0 });
    { const NS = 5, Ls = span / NS, ar = (Ls - 4.4) / 2;
      for (let i = 0; i < NS; i++) {
        const x0 = bxA + i * Ls, xm = x0 + Ls / 2, ytop = Math.min(deckY(x0), deckY(x0 + Ls)) - 1.6, yc = ytop - ar - 0.6;
        const sh = new THREE.Shape(); sh.moveTo(-Ls / 2, -7); sh.lineTo(Ls / 2, -7); sh.lineTo(Ls / 2, ytop); sh.lineTo(-Ls / 2, ytop); sh.closePath();
        const hole = new THREE.Path(); hole.moveTo(-ar, -6.5); hole.lineTo(-ar, yc); hole.absarc(0, yc, ar, Math.PI, 0, true); hole.lineTo(ar, -6.5); hole.lineTo(-ar, -6.5); sh.holes.push(hole);
        const eg = new THREE.ExtrudeGeometry(sh, { depth: BW - 0.6, bevelEnabled: false, curveSegments: 14 }); eg.translate(0, 0, -(BW - 0.6) / 2);
        b.addGeometry(archM, eg, new THREE.Matrix4().makeTranslation(xm, 0, BZ), jit(0xd6cab0, rr, 0.01, 0.04, 0.04)); eg.dispose();
        if (i) for (const s of [-1, 1]) { b.cyl(marble, x0, -6, BZ + s * (BW / 2 + 0.8), 2.4, deckY(x0) + 4, { seg: 10, top: 0.85, color: 0xd4c8ae }); b.cone(marble, x0, deckY(x0) - 2, BZ + s * (BW / 2 + 0.8), 2.1, 3.2, { seg: 10, color: 0xd8ccb2 }); }
      }
      // cornice band along both faces
      for (let i = 0; i < 24; i++) { const xa = bxA + span * i / 24, xb = bxA + span * (i + 1) / 24, ya = deckY(xa), yb = deckY(xb); for (const s of [-1, 1]) b.box(marble, (xa + xb) / 2, (ya + yb) / 2 - 1.9, BZ + s * (BW / 2 - 0.1), xb - xa + 0.2, 0.7, 0.8, 0, 0xeee6d2, 0, Math.atan2(yb - ya, xb - xa)); }
    }
    // sixteen shop-houses a side: jettied upper storeys, mixed roofs, awnings over the street
    for (let i = 0; i < 16; i++) for (const sd of [-1, 1]) {
      const t = (i + 0.5) / 16, x = bxA + 5 + (span - 10) * t, y = deckY(x) - 0.2, w = (span - 10) / 16 - 0.25, h = 3.2 + ((i * 7 + (sd > 0 ? 3 : 0)) % 4) * 0.9, d = 4.2, z = BZ + sd * (BW / 2 - d / 2 + 0.2), wc = jit(rr.pick([0xe8d6ae, 0xd8a870, 0xe4c494, 0xc98f5e, 0xf0e2c4]), rr, 0.012, 0.07, 0.06);
      b.box(plaster, x, y - 0.6, z, w, h + 0.6, d, 0, wc);
      b.box(plaster, x, y + h, z + sd * 0.5, w + 0.15, 2.8, d + 1.0, 0, jit(wc.getHex(), rr, 0.01, 0.03, 0.05));               // jettied upper storey over the river
      for (let k = -1; k <= 1; k += 2) b.box(wood, x + k * w * 0.35, y + h - 0.6, z + sd * (d / 2 + 0.6), 0.25, 0.6, 1.0, 0, 0x5a4430);
      const ty = y + h + 2.8, st = (i + (sd > 0 ? 1 : 0)) % 4;
      if (st === 0 || st === 2) b.prism(tile, x, ty, z + sd * 0.5, w + 0.5, 1.8, d + 1.6, Math.PI / 2, jit(0xb8582f, rr)); else if (st === 1) { b.box(plaster, x, ty, z + sd * 0.5, w + 0.4, 0.4, d + 1.3, 0, 0xf4ead0); if (i % 3 === 0) b.dome(glaze, x, ty + 0.4, z + sd * 0.5, Math.min(w, d) * 0.36, { seg: 10, color: 0x2a7c9e }); } else b.pyramid(tile, x, ty, z + sd * 0.5, w + 0.5, 1.6, d + 1.4, 0, jit(0xa84a2a, rr));
      b.box(cloth, x, y + 2.6, z - sd * (d / 2 + 0.8), w * 0.9, 0.12, 1.8, 0, jit(clothC[(i + (sd > 0 ? 2 : 0)) % 6], rr), sd * 0.3, 0);
      quad(b, win, x, y + 1.3, z - sd * (d / 2 + 0.05), w * 0.55, 1.6, sd > 0 ? Math.PI : 0); quad(b, i % 2 ? win : shut, x, y + h + 1.4, z + sd * (d / 2 + 1.06), w * 0.4, 1.2, sd > 0 ? 0 : Math.PI);
      if (i % 3 === 1) stacks.push([x, ty + 2.5, z]); if (i % 2 === 0 && sd < 0) lamps.push([x, y + 3.1, BZ]);
    }
    for (const [ex] of [[bxA - 2], [bxC + 2]]) for (const sz of [-1, 1]) { b.cyl(marble, ex, 0, BZ + sz * (BW / 2 + 1), 1.4, 10, { top: 0.8, seg: 10, color: 0xe6dec8 }); b.sphere(bronze, ex, 10.2, BZ + sz * (BW / 2 + 1), 1.0, { seg: 8, color: 0xc89a48 }); lamps.push([ex, 12, BZ + sz * (BW / 2 + 1)]); }
    // avenue west from the bridge, becoming the dark Valyrian road
    const roadW = [[bxA - 2, BZ], [-120, BZ + 1], [-190, -20]];
    b.ribbon(cobble, K.smoothPath(roadW, 6), 10, H, 0.25, 0xcbbd9c);
    const vroad = Array.from({ length: 16 }, (_, i) => [-190 - i * 24, -20 + Math.sin(i * 0.5) * 6]);
    b.ribbon(tri('cobble', { color: 0x4a4852, scale: 6, snow: false, rough: 0.5 }), K.smoothPath(vroad, 3), 8, (x, z) => H(x, z) + 0.6, 0.2);
    { const sp = K.smoothPath(vroad, 3); for (let i = 0; i < sp.length - 1; i++) for (const s of [-1, 1]) { const [x0, z0] = sp[i], [x1, z1] = sp[i + 1], l = Math.hypot(x1 - x0, z1 - z0), nx = -(z1 - z0) / l, nz = (x1 - x0) / l; b.box(blackB, (x0 + x1) / 2 + nx * s * 4.3, H((x0 + x1) / 2, (z0 + z1) / 2) - 0.6, (z0 + z1) / 2 + nz * s * 4.3, l + 0.3, 1.5, 0.9, K.headingX(x1 - x0, z1 - z0), 0x34343c); } }
    { const sp = K.smoothPath(vroad, 3); for (let i = 2; i < sp.length; i += 6) palms.push([sp[i][0], H(sp[i][0], sp[i][1]), sp[i][1] + 8, 1.05], [sp[i][0], H(sp[i][0], sp[i][1] - 8), sp[i][1] - 8, 1.0]); }

    // lanterns (glow beads)
    for (const [x, y, z] of lamps) b.sphere(lan, x, y, z, 0.45, { seg: 6 });
    root.add(b.build({}));

    // ============================================================================================ TERRAIN, WATER, SKIRTS
    const lush = new THREE.Color(0x6f8f42), lush2 = new THREE.Color(0x8aa04c), dry = new THREE.Color(0xb7a26c), mudC = new THREE.Color(0x5e5238), jungle = new THREE.Color(0x3e5e34),
      paved = new THREE.Color(0xd2c29c), dust = new THREE.Color(0xb59a70), reedC = new THREE.Color(0x96a050), field = [0x7f9e3e, 0xc0a85a, 0x6a8a36, 0xcfa866, 0x93a84a, 0x5f7f34].map((h) => new THREE.Color(h)), c = new THREE.Color();
    const colorAt = (x, z, h, s) => {
      const n = K.fbm(x * 0.012, z * 0.012, 2, 4), n2 = K.fbm(x * 0.07, z * 0.07, 2, 13), n3 = K.fbm(x * 0.007, z * 0.007, 2, 9);
      c.copy(lush).lerp(lush2, K.clamp(n * 1.3, 0, 1)).lerp(dry, K.clamp(n3 * 1.5 - 0.5, 0, 0.6)).multiplyScalar(0.92 + 0.16 * n2);
      const r = Math.hypot(x - 40, z), fx = Math.floor((x * 0.995 + z * 0.1) / 46), fz = Math.floor((z - x * 0.1) / 30), fh = K.noise2(fx * 1.7, fz * 2.3, 3);
      if (r > 200 && r < 600 && h < 14 && fh > 0.3 && !(ell(x, z) < 1.6)) c.lerp(field[Math.floor(fh * 97) % 6], 0.8 * K.smoothstep(200, 260, r));          // cultivated plots
      c.lerp(jungle, K.clamp(K.smoothstep(8, 30, h), 0, 0.85));
      const e = ell(x, z); c.lerp(paved, 0.75 * (1 - K.smoothstep(0.8, 0.98, e)));
      if (isBuilt(x, z) || westOK(x, z, -12) || eastOK(x, z, -12)) c.lerp(dust, 0.72);
      if (h < 1.8) c.lerp(h < 0.6 ? mudC : reedC, K.clamp((1.8 - h) / 1.2, 0, 0.85));
      if (s > 0.06) c.lerp(dry, K.clamp(s * 3, 0, 0.45));
      return c;
    };
    root.add(K.terrain({ size: 1100, seg: q.seg(140), heightAt, kind: 'sand', scale: 18, colorAt }));
    const outerH = (x, z) => (Math.abs(x) < 505 && Math.abs(z) < 505 ? -30 : heightAt(x, z) - 0.3);
    root.add(K.terrain({ size: 4200, seg: q.seg(56), heightAt: outerH, kind: 'sand', scale: 30, colorAt }));
    const wopt = { deep: 0x1c3c36, shallow: 0x58623a, opacity: 0.95, choppy: 0.42, speed: 0.5 };
    const wat = K.water({ w: 720, d: 1100, seg: q.seg(84), level: 0, heightAt, center: [0, 0], ...wopt });
    root.add(wat); ctx.registerWater(wat);
    for (const [x, z, w, d] of [[0, 1600, 6000, 2100], [1730, 400, 2740, 300], [-1730, 400, 2740, 300], [0, -1600, 260, 2100]]) {
      const sk = K.water({ w, d, seg: 2, level: 0, heightAt: () => -8, center: [x, z], ...wopt }); root.add(sk); ctx.registerWater(sk);
    }

    // ============================================================================================ VEGETATION (instanced)
    const trunkM = tri('wood', { color: 0x8a7050, scale: 2, snow: false }), leafM = flat(0xffffff, { rough: 0.85, side: THREE.DoubleSide, flatShading: false }), crownM = flat(0xffffff, { rough: 1 });
    // palm: leaning ringed trunk + nine drooping V-folded fronds + a date cluster
    const pb = new Batch(), pl = new Batch();
    limb(pb, trunkM, [0, -0.3, 0], [0.5, 4, 0.1], 0.36, 0.3, 5, 0x9a8462, true); limb(pb, trunkM, [0.5, 4, 0.1], [0.9, 8.2, 0.25], 0.3, 0.24, 5, 0x9a8462, true);
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + (k % 2) * 0.2, top = [0.9, 8.2, 0.25], up = k % 3 === 0 ? 1.4 : 0.8, L1 = 2.3 + (k % 2) * 0.4;
      const m1 = [top[0] + Math.cos(a) * L1, top[1] + up, top[2] + Math.sin(a) * L1], m2 = [top[0] + Math.cos(a) * (L1 * 2.1), top[1] - 0.6 + up * 0.3, top[2] + Math.sin(a) * (L1 * 2.1)];
      const g = k % 2 ? 0xc0c8a0 : 0xffffff; leaf(pl, leafM, top, m1, 1.3, 0.25, g); leaf(pl, leafM, m1, m2, 1.1, 0.35, g); }
    pl.sphere(crownM, 0.9, 7.6, 0.25, 0.7, { seg: 5, color: 0x8a6a30 });
    const palmTrunk = geoOf(pb), palmLeafG = pl.build({}).children, palmLeaf = palmLeafG.find((m) => m.material === leafM).geometry;
    const pT = new Inst(palmTrunk, trunkM), pL = new Inst(palmLeaf, leafM), pr = K.rng(55), pg = [0x3f5e2a, 0x4a6a30, 0x36552a, 0x52703a, 0x5a6a34];
    const addPalm = (x, y, z, k) => { const ry = pr() * TAU, s = k * pr.range(0.85, 1.15); pT.add(x, y, z, s, s * pr.range(0.9, 1.15), s, ry, 0xffffff); pL.add(x, y, z, s, s * pr.range(0.9, 1.15), s, ry, jit(pr.pick(pg), pr, 0.02, 0.06, 0.05)); };
    // broadleaf canopy tree (fig/mango-like): three merged lumps
    const tb = new Batch(), tl = new Batch();
    limb(tb, trunkM, [0, -0.3, 0], [0.2, 3.4, 0], 0.5, 0.35, 5, 0x6a5440, true);
    for (const [ox, oy, oz, r] of [[0, 4.6, 0, 2.8], [1.7, 4.0, 0.7, 2.1], [-1.2, 4.6, -1.0, 2.2]]) tl.sphere(crownM, ox, oy - r * 0.7, oz, r, { seg: 6, sy: 0.75 });
    const bT = new Inst(geoOf(tb), trunkM), bL = new Inst(geoOf(tl), crownM), bg = [0x3e6a34, 0x4a7a3a, 0x36602f, 0x557f3c];
    const addTree = (x, y, z, k, col) => { const ry = pr() * TAU; bT.add(x, y, z, k, k, k, ry, 0xffffff); bL.add(x, y, z, k * pr.range(0.9, 1.2), k, k * pr.range(0.9, 1.2), ry, col ?? jit(pr.pick(bg), pr, 0.02, 0.06, 0.05)); };
    for (const [x, y, z, k] of palms) addPalm(x, y, z, k);
    const wild = (x, z) => H(x, z) < 0.9 || isBuilt(x, z) || ell(x, z) < 1.18 || Math.abs(z - BZ) < 10 && x > -200 || K.distToPolyline(x, z, vroad).d < 7;
    for (const [x, z] of K.scatter({ rng: K.rng(5), count: q.dens(190), bounds: [-430, -330, 430, 250], minDist: 7, avoid: (x, z) => wild(x, z) || K.fbm(x * 0.012, z * 0.012, 2, 77) < 0.45 || H(x, z) > 9 })) {
      const nearBank = Math.min(Math.abs(x - bankW(z)), Math.abs(x - bankE(z))) < 45 || Math.hypot(x - 40, z) < 300;
      if (nearBank || pr() < 0.35) addPalm(x, H(x, z), z, pr.range(0.85, 1.25)); else addTree(x, H(x, z), z, pr.range(0.9, 1.4));
    }
    // palm groves around the walls (gardens of the old blood outside the gate)
    for (const [x, z] of K.scatter({ rng: K.rng(7), count: q.dens(90), bounds: [40, -130, 280, 90], minDist: 6, accept: (x, z) => ell(x, z) > 1.2 && ell(x, z) < 1.55, avoid: (x, z) => isBuilt(x, z) || H(x, z) < 0.9 })) addPalm(x, H(x, z), z, pr.range(0.85, 1.2));
    // dark jungle on the upriver hills
    for (const [x, z] of K.scatter({ rng: K.rng(6), count: q.dens(165), bounds: [-540, -540, 540, -120], minDist: 10, accept: (x, z) => H(x, z) > 6 && K.fbm(x * 0.01, z * 0.01, 2, 78) > 0.42 && !isBuilt(x, z) })) addTree(x, H(x, z) - 0.5, z, pr.range(1.1, 1.9), jit(pr.pick([0x2e4e2c, 0x36572f, 0x2a4528]), pr, 0.02, 0.05, 0.04));
    for (const m of [pT.build(), pL.build(), bT.build(), bL.build()]) root.add(m);
    // reeds along the muddy banks (one double-sided blade fan, instanced)
    { const rg = new THREE.BufferGeometry(), arr = [];
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, dx = Math.cos(a), dz = Math.sin(a), h = 1.6 + (k % 3) * 0.5; arr.push(-dz * 0.12, 0, dx * 0.12, dz * 0.12, 0, -dx * 0.12, dx * 0.7, h, dz * 0.7); }
      rg.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); rg.computeVertexNormals();
      const ri = new Inst(rg, leafM, { cast: false }), rp = K.rng(3);
      for (const [x, z] of K.scatter({ rng: rp, count: q.dens(500), bounds: [-430, -500, 430, 270], minDist: 2.4, accept: (x, z) => { const h = H(x, z); return h > -0.4 && h < 1.0 && !isBuilt(x, z) && Math.abs(z - BZ) > 12; } })) ri.add(x, H(x, z) - 0.1, z, rp.range(0.8, 1.6), rp.range(0.7, 1.4), rp.range(0.8, 1.6), rp() * TAU, jit(rp.pick([0x8a9a48, 0x9aa456, 0x7a8a40, 0xb0a868]), rp));
      root.add(ri.build());
    }

    // ============================================================================================ SHIPS (instanced: hulls + sails per type)
    const shipMat = flat(0xffffff, { rough: 0.7, flatShading: false, side: THREE.DoubleSide }), sailMat = flat(0xffffff, { rough: 1, flatShading: false, side: THREE.DoubleSide });
    const hullInto = (hb, len, beam, dep, { sheer = 0.3, transom = 0, stripe = 0xd8c49a, bottom = 0x4a3a2a } = {}) => {
      const W = (t) => Math.max(beam / 2 * (t < 0.5 ? Math.pow(Math.sin(Math.PI * t), 0.45) : Math.pow(Math.sin(Math.PI * t), 0.8)), t < 0.5 ? transom * beam / 2 : 0.02);
      const YD = (t) => dep * (1 + sheer * Math.pow(2 * t - 1, 2) * (t > 0.5 ? 1.3 : 1)), YK = (t) => -dep * 0.6 * Math.pow(Math.max(Math.sin(Math.PI * t), 0.04), 0.35);
      const sec = (t, v) => { const a = (v - 0.5) * Math.PI, w = W(t), yd = YD(t), yk = YK(t); return [(t - 0.5) * len, yk + (yd - yk) * Math.pow(1 - Math.cos(a), 0.7), -Math.sign(a) * w * Math.pow(Math.abs(Math.sin(a)), 0.45)]; };
      hb.addGeometry(shipMat, sheet((u, v) => sec(u, v * 0.12), 14, 1), _I, stripe); hb.addGeometry(shipMat, sheet((u, v) => sec(u, 0.88 + v * 0.12), 14, 1), _I, stripe);
      hb.addGeometry(shipMat, sheet((u, v) => sec(u, 0.12 + v * 0.76), 14, 4), _I, 0xffffff);
      hb.addGeometry(shipMat, sheet((u, v) => { const t = 0.03 + u * 0.94, w = W(t) * 0.92; return [(t - 0.5) * len, YD(t) - 0.35, (v * 2 - 1) * w]; }, 12, 1), _I, 0xb89a70);
      return { YD };
    };
    const TYPES = {
      galley: () => { const hb = new Batch(), sb = new Batch(), len = 26, { YD } = hullInto(hb, len, 4.4, 1.5, { sheer: 0.22, stripe: 0xe0c070 });
        limb(hb, shipMat, [len / 2 - 1.5, 0.2, 0], [len / 2 + 2.6, 0.1, 0], 0.45, 0.12, 5, 0x8a6a3a);                                   // ram
        limb(hb, shipMat, [-len / 2 + 0.8, YD(0.02), 0], [-len / 2 - 0.6, YD(0) + 2.8, 0], 0.4, 0.15, 5, 0xffffff);                       // stern post
        hb.box(shipMat, -len * 0.34, YD(0.16) - 0.4, 0, 4, 1.8, 3.2, 0, 0xc8b088); hb.box(shipMat, -len * 0.34, YD(0.16) + 1.4, 0, 4.4, 0.12, 3.6, 0, 0xb5472f);
        for (let k = 0; k < 13; k++) for (const s of [-1, 1]) { const x = -len * 0.28 + k * 1.45; hb.box(shipMat, x, YD(0.5) - 0.5, s * 2.0, 0.16, 0.16, 6.2, 0, 0x9a8060, s * 0.42, 0); }
        const mx = len * 0.12, mh = 14; limb(hb, shipMat, [mx, 0, 0], [mx, mh, 0], 0.25, 0.16, 5, 0x6a5038); limb(hb, shipMat, [mx + 8.5, 3.0, 0], [mx - 8, mh + 2.6, 0], 0.16, 0.1, 4, 0x6a5038);
        const A = [mx + 8, 3.2, 0], B = [mx - 7.6, mh + 2.3, 0], C = [mx - 4.6, 2.6, 0];
        sb.addGeometry(sailMat, sheet((u, v) => { const bx = B[0] + (C[0] - B[0]) * v, by = B[1] + (C[1] - B[1]) * v; const x = A[0] + (bx - A[0]) * u, y = A[1] + (by - A[1]) * u; return [x, y, 1.1 * Math.sin(Math.PI * u) * Math.sin(Math.PI * Math.min(1, v * 1.2 + 0.1)) + (x - mx) * 0.08]; }, 6, 5), _I, 0xffffff);
        return [geoOf(hb), geoOf(sb)]; },
      cog: () => { const hb = new Batch(), sb = new Batch(), len = 17, { YD } = hullInto(hb, len, 6.4, 2.4, { sheer: 0.22, transom: 0.6, stripe: 0x3a5a6a });
        hb.box(shipMat, -len * 0.38, YD(0.1) - 0.6, 0, 4.0, 2.4, 5.6, 0, 0x8a6a4a); hb.box(shipMat, -len * 0.37, YD(0.1) + 2.0, 0, 4.6, 0.3, 5.8, 0, 0x7a5a3a);
        hb.box(shipMat, len * 0.36, YD(0.88) - 0.5, 0, 3.0, 1.8, 3.6, 0, 0x8a6a4a); limb(hb, shipMat, [len / 2 - 0.5, YD(0.97), 0], [len / 2 + 4, YD(1) + 2, 0], 0.22, 0.1, 4, 0x6a5038);
        const mh = 15; limb(hb, shipMat, [0, 0, 0], [0, mh, 0], 0.32, 0.2, 5, 0x6a5038); hb.box(shipMat, 0, mh - 1.4, 0, 0.3, 0.3, 10, 0, 0x6a5038); hb.cyl(shipMat, 0, mh - 0.4, 0, 0.9, 1.1, { seg: 6, color: 0x8a6a48 });
        sb.addGeometry(sailMat, sheet((u, v) => { const z = (u - 0.5) * 9.4, y = mh - 1.4 - v * 9.6; return [0.4 + 1.5 * Math.sin(Math.PI * u) * Math.sin(Math.PI * (0.25 + v * 0.75)), y, z * (1 - v * 0.06)]; }, 6, 5), _I, 0xffffff);
        return [geoOf(hb), geoOf(sb)]; },
      trader: () => { const hb = new Batch(), sb = new Batch(), len = 21, { YD } = hullInto(hb, len, 5.4, 2.0, { sheer: 0.4, stripe: 0xd8c49a });
        hb.box(shipMat, -len * 0.33, YD(0.15) - 0.4, 0, 4.4, 2.0, 4.0, 0, 0xc8a878); hb.box(shipMat, -len * 0.18, YD(0.3) + 1.2, 0, 4, 0.12, 4.2, 0, 0x3f8a90);
        for (const [mx, mh, sc] of [[len * 0.12, 15, 1], [-len * 0.2, 11, 0.72]]) {
          limb(hb, shipMat, [mx, 0, 0], [mx, mh, 0], 0.24, 0.15, 5, 0x6a5038); limb(hb, shipMat, [mx + 7 * sc, 2.8, 0], [mx - 6.5 * sc, mh + 2.6 * sc, 0], 0.15, 0.09, 4, 0x6a5038);
          const A = [mx + 6.6 * sc, 3.0, 0], B = [mx - 6.2 * sc, mh + 2.3 * sc, 0], C = [mx - 3.8 * sc, 2.6, 0];
          sb.addGeometry(sailMat, sheet((u, v) => { const bx = B[0] + (C[0] - B[0]) * v, by = B[1] + (C[1] - B[1]) * v; const x = A[0] + (bx - A[0]) * u, y = A[1] + (by - A[1]) * u; return [x, y, 1.0 * sc * Math.sin(Math.PI * u) * Math.sin(Math.PI * Math.min(1, v * 1.2 + 0.1)) + (x - mx) * 0.08]; }, 6, 5), _I, 0xffffff);
        }
        return [geoOf(hb), geoOf(sb)]; },
    };
    const sr = K.rng(8), hulls = [0x6a4a30, 0x7a3a2a, 0x3a4a52, 0x5a4a34, 0x2e2a26, 0x8a5a3a], sails = [0xeee4cc, 0xd8c08a, 0xb5472f, 0xf2ece0, 0x3c7f8e, 0xc89a58, 0x8a3b32];
    const fleet = [];
    const lanes = [[-260, -40], [6, 330]];
    for (let i = 0; i < q.dens(18); i++) fleet.push({ type: ['galley', 'trader', 'cog'][i % 3], lane: lanes[i % 3 === 0 ? 0 : 1], off: sr.range(-0.6, 0.6), z0: sr.range(0, 600), speed: sr.range(2.4, 4.2) * (i % 2 ? 1 : -1), ph: sr.range(0, 6) });
    for (let i = 0; i < moorings.length; i += (q.low ? 3 : 1)) { const [x, z, side] = moorings[i]; if (sr() < 0.25) continue; fleet.push({ type: sr() < 0.5 ? 'cog' : 'trader', moored: true, x: x + side * 0, z, ry: sr() < 0.5 ? 0 : Math.PI, ph: sr.range(0, 6) }); }
    for (let i = 0; i < 7; i++) fleet.push({ type: i % 2 ? 'cog' : 'trader', moored: true, x: cx(250) + (i - 3) * 34 + sr.range(-6, 6), z: 255 + sr.range(-20, 30), ry: -Math.PI / 2 + sr.range(-0.6, 0.6), ph: sr.range(0, 6), anchored: true });
    const shipMeshes = [];
    for (const type of Object.keys(TYPES)) {
      const list = fleet.filter((f) => f.type === type); if (!list.length) continue;
      const [hg, sg] = TYPES[type](), hm = new THREE.InstancedMesh(hg, shipMat, list.length), sm = new THREE.InstancedMesh(sg, sailMat, list.length);
      list.forEach((f, i) => { hm.setColorAt(i, jit(sr.pick(hulls), sr, 0.01, 0.05, 0.04)); sm.setColorAt(i, new THREE.Color(sr.pick(sails))); f.i = i; f.hm = hm; f.sm = sm; });
      for (const m of [hm, sm]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; root.add(m); } shipMeshes.push(hm, sm);
    }
    const o3 = new THREE.Object3D(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
    const updShips = (t) => {
      for (const f of fleet) {
        if (f.moored) { o3.position.set(f.x, Math.sin(t * 0.8 + f.ph) * 0.1, f.z); o3.rotation.set(Math.sin(t * 0.6 + f.ph) * 0.015, f.ry, Math.sin(t * 0.7 + f.ph) * 0.02); }
        else { const [za, zb] = f.lane, Ln = zb - za, z = za + (((f.z0 + t * f.speed) % Ln) + Ln) % Ln, w = (half(z) - 26) * 0.9; o3.position.set(cx(z) + f.off * w, Math.sin(t * 0.9 + f.ph) * 0.12, z); o3.rotation.set(Math.sin(t * 0.7 + f.ph) * 0.02, f.speed > 0 ? -Math.PI / 2 : Math.PI / 2, Math.sin(t * 0.9 + f.ph) * 0.025); }
        o3.updateMatrix(); f.hm.setMatrixAt(f.i, o3.matrix); f.sm.setMatrixAt(f.i, f.moored && !f.anchored ? zero : o3.matrix);
      }
      for (const m of shipMeshes) m.instanceMatrix.needsUpdate = true;
    };
    updShips(0); ctx.onUpdate((dt, t) => updShips(t));

    // ============================================================================================ ATMOSPHERE & LIFE
    // humid mist: soft lit sheets lying on the river and bay, and a high haze layer in front of the hills
    { const N = 64, data = new Uint8Array(N * N * 4);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const u = i / (N - 1) * 2 - 1, v = j / (N - 1) * 2 - 1, r = Math.hypot(u, v), nn = K.fbm(i * 0.09, j * 0.09, 3, 41); data.set([255, 255, 255, Math.round(K.clamp((1 - K.smoothstep(0.25, 1.0, r + (nn - 0.5) * 0.55)) * (0.55 + nn * 0.7), 0, 1) * 255)], (j * N + i) * 4); }
      const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat); tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
      const mistM = new THREE.MeshLambertMaterial({ color: 0xf6eedc, map: tex, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide, fog: true });
      const fb = new Batch(), fr = K.rng(71), plane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
      for (let i = 0; i < 22; i++) { const z = fr.range(-320, 200), x = cx(z) + fr.range(-0.8, 0.8) * (half(z) + 20); _e.set(0, fr() * 3, 0); _q.setFromEuler(_e); _m.compose(_p.set(x, fr.range(0.8, 3.5), z), _q, _s.set(fr.range(70, 150), 1, fr.range(40, 80))); fb.addGeometry(mistM, plane, _m); }
      for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + fr.range(-1.3, 1.3), r = fr.range(380, 620); _e.set(0, fr() * 3, 0); _q.setFromEuler(_e); _m.compose(_p.set(60 + Math.cos(a) * r, fr.range(14, 34), Math.sin(a) * r), _q, _s.set(fr.range(220, 380), 1, fr.range(120, 200))); fb.addGeometry(mistM, plane, _m); }
      const mist = fb.build({ shadow: false, receive: false }); mist.children[0].renderOrder = 3; root.add(mist);
      ctx.onUpdate((dt, t) => { mist.position.set(Math.sin(t * 0.03) * 12, 0, Math.cos(t * 0.02) * 10); });
    }
    root.add(K.smoke(stacks.slice(0, 60), { size: 16, rise: 12, opacity: 0.16, color: 0xe0d8c8 }));
    const T = TEMPLE;
    const fire = K.fires([...T.spireTops, ...T.braz, ...wallFires, [SM[0] - 22, H(SM[0], SM[1]) + 1.2, SM[1] + 18], [SM[0] + 22, H(SM[0], SM[1]) + 1.2, SM[1] + 18]], { size: 9, light: q.low ? 0 : 3, intensity: 55 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const bans = [[TX - 9, H(TX, TZ) + 22, TZ - 21.5], [TX + 9, H(TX, TZ) + 22, TZ - 21.5]].map(([x, y, z]) => ({ x, y: y - 6, z, w: 2.6, h: 10, color: 0xc4301f, ry: 0 }));
    for (const a of [Math.PI / 2, -Math.PI / 2, 0.4, -0.4, Math.PI - 0.9, Math.PI + 0.9]) { const p = ringPt(a, 6); bans.push({ x: p.x, y: 40, z: p.z, w: 3, h: 9, color: 0x8a2a24, ry: -a }); }
    root.add(K.banners(bans));
    const wk = K.walkers({ paths: [[[bxA, BZ - 2.6], [bxC, BZ - 2.6]], [[bxC, BZ + 2.6], [bxA, BZ + 2.6]], [[bxA - 4, BZ], [-150, BZ + 1]], [[bxC, BZ], [GATE[0] - 15, -20.5]], [[60, -19], [106, -9], [128, -2]], [[-60, -30], [-60, 60]], [[-150, -60], [-150, 100]], [[bankE(60) + 6, 20], [bankE(140) + 6, 140]], [[bankW(40) - 6, 30], [bankW(150) - 6, 150]]],
      heightAt: (x, z) => (Math.abs(z - BZ) < 6 && x > bxA - 1 && x < bxC + 1 ? deckY(x) - 0.2 : H(x, z)), count: q.dens(60), rng: K.rng(5), colors: [0xb5472f, 0x8a3b32, 0xdcc8a0, 0x3f6a78, 0xd9a84a, 0x6a4a34, 0xe8e0d0] });
    root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    for (const [ctr, n, s] of [[[-10, 40, 120], 16, 1.5], [[150, 70, -20], 8, 1.3]]) { const g = K.birds({ center: ctr, radius: 80, count: q.dens(n), color: 0xf4f4f0, size: s, spreadY: 14, seed: n }); root.add(g); ctx.onUpdate((dt, t) => g.userData.update(t)); }
    const cl = K.clouds({ y: 260, extent: 1100, count: 10, opacity: 0.32, color: 0xfff6e8 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    const gp = ringPt(Math.PI, 0);
    return {
      radius: 300, center: [40, 0, 10], minDistance: 20,
      hero: { pos: [-118, 118, 178], target: [108, 6, -26] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        day: { top: 0x5f93c4, horizon: 0xeedcb4, fog: 0xe8d6aa, fogD: 0.00125, sunC: 0xffe6b8, sunI: 3.4, az: 0.75, elev: 0.48, hemiSky: 0xd0dcdc, hemiGround: 0x907a4c, hemiI: 1.0, exposure: 1.02 },
        dawn: { top: 0x5c6ea8, horizon: 0xf4c49a, fog: 0xead0b4, fogD: 0.0016, sunC: 0xffbc80, sunI: 2.8, az: 0.3, elev: 0.12, hemiSky: 0xb0b4d4, hemiGround: 0x66503c, hemiI: 0.85 },
        dusk: { top: 0x2e3478, horizon: 0xf2925c, fog: 0xcf9282, fogD: 0.0014, sunC: 0xff9a52, sunI: 3.0, az: 2.9, elev: 0.1, hemiSky: 0x9c96cc, hemiGround: 0x6c5458, hemiI: 1.05 },
        night: { top: 0x070d2c, horizon: 0x22345e, fog: 0x1a2846, fogD: 0.0017, sunC: 0xa0b8f4, sunI: 1.6, hemiSky: 0x5a6cac, hemiGround: 0x283440, hemiI: 1.35 },
      } },
      landmarks: {
        'black-walls': { pos: [gp.x - 2, 50, gp.z], r: 24, cam: { pos: [-34, 34, 6], target: [60, 20, -21] } },
        'long-bridge': { pos: [0, 16, BZ], r: 24, cam: { pos: [-34, 30, 40], target: [4, 6, BZ] } },
        'old-volantis': { ...lm(185, -20, 34, 30), cam: { pos: [262, 92, 70], target: [165, 10, -28] } },
        'red-temple': { ...lm(TX, TZ, 26, 82), cam: { pos: [86, 52, -54], target: [TX, 30, TZ] } },
        'triarchs-hall': { ...lm(HX, HZ, 16, 36), cam: { pos: [92, 34, 2], target: [HX, 14, HZ] } },
        'merchants-house': { ...lm(MH[0], MH[1], 12, 26), cam: { pos: [-14, 26, -78], target: [MH[0], 8, MH[1]] } },
        'slave-markets': lm(SM[0], SM[1], 20, 10), 'harbour': lm(cx(90), 90, 30, 14), 'rhoyne-mouth': lm(cx(220), 220, 50, 12), 'western-quarters': lm(-170, 40, 44, 16), 'valyrian-road': lm(-270, -20, 20, 8),
      },
    };
  },
};
