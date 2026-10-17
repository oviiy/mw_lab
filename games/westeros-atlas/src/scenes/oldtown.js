// Oldtown — deep scene. Book anchors: the Hightower (tallest tower, beacon, on Battle Isle), the Citadel (maesters; ravenry, library,
// towers joined by bridges), the Starry Sept, the Honeywine/Whispering Sound harbour, a walled old city. Plan, shapes and positions are interpretation.
import * as K from '../kit/index.js';
const { THREE, Batch, tri, flat, glow } = K;

const IX = -26, IZ = 114;                     // Battle Isle centre
const RIVER = [[270, -240], [190, -150], [120, -95], [80, -40], [50, 20], [30, 74]];
const coastZ = (x) => 66 + 8 * Math.sin(x * 0.04 + 1) - K.smoothstep(-150, -270, x) * 230;
const riverHalf = (t) => 8 + t * 1.4;
const WALL = [[-120, 60], [-128, -20], [-100, -95], [-30, -150], [60, -178], [150, -170]];
const WALL2 = [[200, -110], [206, -20], [186, 46], [150, 64]];
const CITY = [...WALL, [163, -155], [187, -127], ...WALL2];
const HALF = 400;                              // inner terrain half-size

// ---------------------------------------------------------------------------------------------------------- helpers
const _hsl = {};
/** hex -> Color with hue / saturation / lightness jitter (variation inside one colour family). */
function jit(hex, r, dh = 0.012, ds = 0.05, dl = 0.045) {
  const c = new THREE.Color(hex); c.getHSL(_hsl);
  return c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, K.clamp(_hsl.s + r.range(-ds, ds), 0, 1), K.clamp(_hsl.l + r.range(-dl, dl), 0, 1));
}
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
const _cyl = new Map(), _quad = new THREE.PlaneGeometry(1, 1);
const unitCyl = (seg, top) => { const k = seg + '|' + top; let g = _cyl.get(k); if (!g) { g = new THREE.CylinderGeometry(top, 1, 1, seg, 1); g.translate(0, 0.5, 0); _cyl.set(k, g); } return g; };
function frust(b, mat, x, y, z, rx, rz, h, { top = 1, seg = 10, color = 0xffffff, ry = 0 } = {}) {
  _e.set(0, ry, 0); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s.set(rx, h, rz)); b.addGeometry(mat, unitCyl(seg, top), _m, color);
}
function limb(b, mat, A, C, r0, r1, seg = 9, color = 0xffffff) {
  _a.set(A[0], A[1], A[2]); _b.set(C[0], C[1], C[2]).sub(_a); const len = _b.length(); _q.setFromUnitVectors(_up, _b.normalize());
  const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1); g.translate(0, len / 2, 0);
  _m.compose(_a, _q, _s.set(1, 1, 1)); b.addGeometry(mat, g, _m, color); g.dispose();
}
function quad(b, mat, x, y, z, w, h, ry, color = 0xffffff) {
  _e.set(0, ry, 0); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s.set(w, h, 1)); b.addGeometry(mat, _quad, _m, color);
}
/** terrain beyond the detailed square: rings of coarse land / sea that start exactly on the inner edge and run on into the fog */
function outerRing(heightAt, colorAt, mat, radii) {
  const per = 80, n = per * 4, pos = [], col = [], idx = [], c = new THREE.Color();
  const rimH = (x, z) => heightAt(K.clamp(x, -HALF, HALF), K.clamp(z, -HALF, HALF));
  const ptAt = (i, R) => { const side = Math.floor(i / per), t = (i % per) / per * 2 - 1; return side === 0 ? [R * t, -R] : side === 1 ? [R, R * t] : side === 2 ? [-R * t, R] : [-R, -R * t]; };
  radii.forEach((R, k) => {
    for (let i = 0; i < n; i++) {
      const [x, z] = ptAt(i, R), dist = R - HALF, eh = rimH(x, z);
      let h = k === 0 ? eh : eh < 0.8 ? Math.min(eh, -3.5) : eh + dist * 0.03 + (K.fbm(x * 0.003, z * 0.003, 3, 5) - 0.45) * 60 * K.smoothstep(0, 700, dist);
      pos.push(x, h, z); c.set(colorAt(x, z, h, 0.12)); col.push(c.r, c.g, c.b);
    }
  });
  for (let k = 0; k < radii.length - 1; k++) for (let i = 0; i < n; i++) {
    const a = k * n + i, b2 = k * n + (i + 1) % n, c2 = (k + 1) * n + i, d = (k + 1) * n + (i + 1) % n; idx.push(a, b2, c2, b2, d, c2);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  const uv = new Float32Array(pos.length / 3 * 2); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const mesh = new THREE.Mesh(g, mat); mesh.receiveShadow = false; return mesh;
}

const FAM = [
  { wall: [0xf1e6cb, 0xeadcb8, 0xf5eedb], roof: [0xc0653f, 0xb15538, 0xd07a4c], trim: 0xfbf6e8, shut: 0x4f7a68 },
  { wall: [0xe3cf9f, 0xdcc48f, 0xe9d9ae], roof: [0xb15538, 0x8a5a46, 0x6b7a86], trim: 0xf6efd8, shut: 0x3f6a85 },
  { wall: [0xd8b98a, 0xcfae7e, 0xe0c597], roof: [0x9c4b3a, 0xc89a5a, 0xb85f3f], trim: 0xf1e6c8, shut: 0x6a4a38 },
  { wall: [0xe8c8b0, 0xdfba9f, 0xefd4be], roof: [0xb5603f, 0xc2704a, 0x7a7e72], trim: 0xf8eee0, shut: 0x4a7a78 },
  { wall: [0xf3f0e6, 0xe9e6da, 0xfaf8f0], roof: [0x5f8f86, 0xb0593b, 0xa24e38], trim: 0xffffff, shut: 0x5a6a8a },
];

/** a Reach townhouse: plastered body, cornice, tile roof (or roof terrace), chimney, dormer, shuttered windows, balcony. */
function villa(b, M, x, y, z, o, r, out) {
  const { w, d, h, ry } = o, c = Math.cos(ry), s = Math.sin(ry), wm = o.mat || M.plaster;
  const L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  b.box(wm, x, y - 1.4, z, w, h + 1.4, d, ry, o.wall);
  b.box(M.stone, x, y - 0.5, z, w + 0.24, 1.3, d + 0.24, ry, o.base);
  b.box(M.stone, x, y + h - 0.1, z, w + 0.6, 0.45, d + 0.6, ry, o.trim);
  if (h > 7.6) b.box(M.stone, x, y + h * 0.5, z, w + 0.3, 0.26, d + 0.3, ry, o.trim);
  const rh = K.clamp(d * 0.36, 1.5, 3.0), ry0 = y + h + 0.35;
  if (o.flat) {
    for (const [lx, lz, sw, sd] of [[0, d / 2 + 0.05, w + 0.6, 0.32], [0, -d / 2 - 0.05, w + 0.6, 0.32], [w / 2 + 0.05, 0, 0.32, d + 0.6], [-w / 2 - 0.05, 0, 0.32, d + 0.6]]) { const [px, pz] = L(lx, lz); b.box(M.stone, px, ry0, pz, sw, 0.8, sd, ry, o.trim); }
  } else if (o.hip) b.pyramid(M.tile, x, ry0, z, w + 0.9, rh * 1.15, d + 0.9, ry, o.roofC);
  else b.prism(M.tile, x, ry0, z, w + 0.8, rh, d + 0.8, ry, o.roofC);
  if (!o.hip && !o.flat && o.dormer && w > 5.2) {
    const lz = d * 0.2 + 0.65, lx = (r() < 0.5 ? -1 : 1) * w * 0.22, roofH = rh * (1 - Math.abs(lz) / ((d + 0.8) / 2));
    const [dx, dz] = L(lx, d * 0.2), [fx, fz] = L(lx, lz + 0.1);
    b.box(wm, dx, ry0 + roofH - 0.55, dz, 1.3, 1.6, 1.2, ry, o.wall); b.prism(M.tile, dx, ry0 + roofH + 1.0, dz, 1.8, 0.9, 1.8, ry + Math.PI / 2, o.roofC);
    quad(b, M.glowA, fx, ry0 + roofH + 0.3, fz, 0.65, 0.9, ry);
  }
  if (o.chimney && !o.flat) {
    const [cx, cz] = L(w * 0.3 * (r() < 0.5 ? -1 : 1), -d * 0.16);
    b.box(M.plaster, cx, y + h, cz, 0.9, rh + 1.7, 0.9, ry, o.brick); b.box(M.stone, cx, y + h + rh + 1.7, cz, 1.25, 0.26, 1.25, ry, o.trim);
    if (out) out.push([cx, y + h + rh + 2.3, cz]);
  }
  const nF = h > 7.6 ? 2 : 1, nW = Math.max(1, Math.round((w - 1.3) / 2.2)), sp = (w - 1.3) / nW;
  for (const side of [1, -1]) {
    const ang = ry + (side < 0 ? Math.PI : 0);
    for (let f = 0; f < nF; f++) for (let i = 0; i < nW; i++) {
      const lx = (i + 0.5) * sp - (w - 1.3) / 2, wy = y + (nF === 1 ? h * 0.55 : h * (0.3 + 0.4 * f)), [wx, wz] = L(lx, side * (d / 2 + 0.12));
      const u = r(); quad(b, u < 0.5 ? (u < 0.28 ? M.glowA : M.glowB) : M.shut, wx, wy, wz, 0.8, 1.35, ang);
      if (side === 1) for (const k of [-1, 1]) { const [sx, sz] = L(lx + k * 0.66, side * (d / 2 + 0.13)); quad(b, M.shutter, sx, wy, sz, 0.42, 1.4, ang, o.shutC); }
    }
    if (side === 1 || r() < 0.25) { const [wx, wz] = L(w * 0.18, side * (d / 2 + 0.17)); quad(b, M.shut, wx, y + 1.2, wz, 1.3, 2.3, ang, 0x5a4a3a); }
  }
  if (h > 7.6 && w > 5.2 && r() < 0.26) { const [bx, bz] = L(0, d / 2 + 0.7); b.box(M.stone, bx, y + h * 0.5 - 0.2, bz, w * 0.5, 0.22, 1.3, ry, o.trim); const [rx, rz] = L(0, d / 2 + 1.3); b.box(M.iron, rx, y + h * 0.5 + 0.04, rz, w * 0.5, 0.8, 0.1, ry, 0xffffff); }
}
/** long hall with buttresses, arched windows and a gabled slate roof. Local X = long axis. */
function hall(b, M, x, y, z, ry, w, d, h, o, r) {
  const c = Math.cos(ry), s = Math.sin(ry), L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  b.box(M.stoneW, x, y - 1.5, z, w, h + 1.5, d, ry, o.wall); b.box(M.stone, x, y - 0.5, z, w + 0.5, 1.6, d + 0.5, ry, 0xcfc4a8);
  b.box(M.stone, x, y + h - 0.2, z, w + 0.8, 0.6, d + 0.8, ry, o.trim);
  b.prism(M.slate, x, y + h + 0.4, z, w + 1.2, d * 0.5, d + 1.2, ry, o.roofC);
  const n = Math.floor(w / 4.4);
  for (let i = 0; i < n; i++) {
    const lx = (i + 0.5) * (w / n) - w / 2;
    for (const sd of [1, -1]) {
      const a = ry + (sd < 0 ? Math.PI : 0); const [wx, wz] = L(lx, sd * (d / 2 + 0.1)); quad(b, M.glowA, wx, y + h * 0.5, wz, 1.5, h * 0.55, a);
      quad(b, M.shut, ...(([ax, az]) => [ax, y + h * 0.5 + h * 0.3, az])(L(lx, sd * (d / 2 + 0.11))), 1.2, 1.0, a, 0x5a5348);
      if (i < n - 1) { const [bx, bz] = L(lx + w / n / 2, sd * (d / 2 + 0.5)); b.box(M.stoneW, bx, y - 0.4, bz, 0.9, h + 0.2, 1.1, ry, 0xe6dcc2); }
    }
  }
}

export default {
  build(ctx) {
    const q = ctx.q, rng = K.rng(21), root = ctx.root;
    const riverAt = (x, z) => K.distToPolyline(x, z, RIVER);
    const heightAt = (x, z) => {
      const s = coastZ(x) - z;
      let land = 3.2 + K.smoothstep(-60, -300, z) * 22 + (K.fbm(x * 0.02, z * 0.02, 3, 6) - 0.5) * 3 + K.smoothstep(230, 400, Math.abs(x)) * 16;
      let h = K.lerp(-5, land, K.smoothstep(-6, 3 + Math.max(0, land - 5) * 2.4, s));
      const d = Math.hypot(x - IX, z - IZ); h = Math.max(h, -5 + 13 * (1 - K.smoothstep(14, 31, d)));
      const r = riverAt(x, z); const hw = riverHalf(r.t);
      if (r.d < hw + 6) { const bank = 1 - K.smoothstep(hw * 0.55, hw + 3, r.d); h = K.lerp(h, Math.min(h, -3.6), bank); }
      const di = Math.hypot(x - 84, z + 47); if (di < 12) h = Math.max(h, 1.6 * (1 - K.smoothstep(6, 12, di)) - 0.2 + (di < 8 ? 1.4 : 0));
      return h;
    };
    const H = heightAt;
    // ---- terrain colouring: patchwork farmland, olive and dry grass, sandy shore, pale rock, paved city
    const col = new THREE.Color(), grassA = new THREE.Color(0x7d8f4e), grassB = new THREE.Color(0x9aa25c), dry = new THREE.Color(0xc2ad6e), olive = new THREE.Color(0x7c8a58), sand = new THREE.Color(0xdccb98), paved = new THREE.Color(0xc9b995), rockC = new THREE.Color(0x978c76), wet = new THREE.Color(0x5f7a56), plow = new THREE.Color(0xb59d6a);
    const colorAt = (x, z, h, sl) => {
      const n1 = K.fbm(x * 0.012, z * 0.012, 3, 3), n2 = K.fbm(x * 0.05 + 7, z * 0.05, 2, 9);
      col.copy(grassA).lerp(grassB, K.clamp(n2 * 1.6 - 0.4, 0, 1) * 0.6).lerp(olive, K.clamp(n1 * 1.5 - 0.5, 0, 1) * 0.5).lerp(dry, K.clamp(n1 * 1.6 - 0.45, 0, 1) * 0.55);
      const outside = h > 1.5 && z < 66 && !K.pointInPoly(x, z, CITY);
      if (outside) { const f = K.fbm(x * 0.008 + 3, z * 0.008, 2, 4); if (f > 0.42) { const st = 0.5 + 0.5 * Math.sin((x * 0.9 + z * 0.4) * 0.22 + f * 9); const m = K.smoothstep(0.42, 0.5, f); col.lerp(plow, 0.55 * st * m).lerp(f > 0.56 ? dry : grassB, 0.4 * (1 - st) * m); } }
      if (K.pointInPoly(x, z, CITY)) col.lerp(paved, 0.72 + n2 * 0.15);
      col.lerp(sand, K.clamp(1 - Math.abs(h - 0.4) * 0.5, 0, 0.9) * (h < 2 ? 1 : 0)); col.lerp(rockC, K.clamp(sl * 3, 0, 0.65));
      if (h < 0) col.lerp(wet, 0.4);
      return col;
    };
    const tmat = tri('grass', { scale: 14, rough: 0.95 });
    root.add(K.terrain({ w: HALF * 2, d: HALF * 2, seg: q.seg(160), heightAt, kind: 'grass', scale: 14, colorAt }));
    root.add(outerRing(heightAt, colorAt, tmat, [HALF, 560, 800, 1250, 2000, 3400]));
    const wopt = { deep: 0x1c6682, shallow: 0x74c4b6, opacity: 0.9, choppy: 0.55, speed: 0.55 };
    const sea = K.water({ w: HALF * 2, d: HALF * 2, seg: q.seg(112), level: 0, heightAt, ...wopt }); root.add(sea); ctx.registerWater(sea);
    // skirts continue the inner sea's depth (shallows along the coast) so there is no colour seam at the edge of the detailed square
    const skirtH = (x, z) => H(K.clamp(x, -HALF, HALF), K.clamp(z, -HALF, HALF)) - Math.max(0, Math.abs(x) - HALF, Math.abs(z) - HALF) * 0.02;
    for (const [cx, cz, w, d, sg] of [[0, -1900, 8000, 3000, 2], [0, 1900, 8000, 3000, 24], [-1900, 0, 3000, 800, 40], [1900, 0, 3000, 800, 40]]) { const sk = K.water({ w, d, seg: sg, level: 0, heightAt: skirtH, center: [cx, cz], ...wopt }); root.add(sk); ctx.registerWater(sk); }

    // ---- materials (warm southern palette)
    const M = {
      stone: tri('stone', { color: 0xe2d6ba, scale: 7 }), stoneW: tri('stone', { color: 0xfff8ea, scale: 8 }), stoneG: tri('stone', { color: 0xa09b90, scale: 7 }),
      marble: tri('marble', { color: 0xffffff, scale: 6 }), plaster: tri('plaster', { color: 0xffffff, scale: 6 }), tile: tri('tile', { color: 0xffffff, scale: 5 }),
      slate: tri('slate', { color: 0x66717b, scale: 6 }), wood: tri('wood', { color: 0x7d5e42, scale: 4, snow: false }), cobble: tri('cobble', { color: 0xc2b494, scale: 7 }),
      copper: flat(0x5fa58f, { rough: 0.45, metal: 0.4 }), silver: flat(0xdfe6ee, { rough: 0.3, metal: 0.6 }), gold: flat(0xcaa04a, { rough: 0.35, metal: 0.7 }), iron: flat(0x2c3036, { rough: 0.6, metal: 0.5 }),
      glowA: glow(0xffc470), glowB: glow(0xffdca0), lamp: glow(0xffb85c, 1.8), beacon: glow(0xffd070, 2.6), shut: flat(0x3a4048, { rough: 1 }), shutter: flat(0xffffff, { rough: 0.9 }),
      glassB: glow(0x9ab8ff, 1.2), glassV: glow(0xc2a0f0, 1.2), glassW: glow(0xffe6b0, 1.2),
    };
    const b = new Batch(); const chims = [], lampSpots = [];

    // ---- Battle Isle & the Hightower
    const iy = H(IX, IZ);
    const ring = Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * 6.283; return [IX + Math.cos(a) * 27, IZ + Math.sin(a) * 27]; });
    K.wall(b, ring, { h: 7, t: 2.6, mat: M.stone, capMat: M.stoneW, heightAt, closed: true, sink: 4, color: 0xe8dcc0 });
    ring.forEach(([x, z], i) => { if (i % 5 === 0) K.tower(b, x, z, { r: 3, h: 12, y: H(x, z), mat: M.stone, roofMat: M.tile, roof: 'cone', roofH: 6, seg: 10, windows: false, roofColor: jit(0xc2653f, rng) }); });
    const tiers = [[16, 36, 0.94], [13.9, 32, 0.94], [11.9, 28, 0.93], [10.0, 25, 0.93], [8.2, 20, 0.92], [6.6, 15, 0.92]];
    // the oldest level: a squat, seamless fortress of black stone (TWOIAF's 'fused' base, interpreted); the pale tiers rise from it
    const blackM = tri('marble', { color: 0x34353b, scale: 9, rough: 0.55, bump: 0.25 });
    const oct = (r) => Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * 6.283 + 0.3927; return [IX + Math.cos(a) * r, IZ + Math.sin(a) * r]; });
    b.extrude(blackM, oct(22.5), iy - 4, 18, 0xffffff); b.extrude(blackM, oct(23.4), iy + 13.4, 1.3, 0xc8c8cc);
    for (let m = 0; m < 32; m++) { const a = (m / 32) * 6.283; b.box(blackM, IX + Math.cos(a) * 22.2, iy + 14.7, IZ + Math.sin(a) * 22.2, 1.6, 1.4, 0.9, -a + Math.PI / 2, 0xd0d0d4); }
    for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283 + 0.3927, rr = 20.9; b.box(blackM, IX + Math.cos(a) * rr, iy - 1, IZ + Math.sin(a) * rr, 3.4, 15.6, 3.4, -a, 0xb8b8bc); }   // corner buttresses
    for (const a of [1.5708, 1.5708 + 3.1416]) quad(b, M.shut, IX + Math.cos(a) * 21.7, iy + 3.0, IZ + Math.sin(a) * 21.7, 4.2, 6.2, Math.PI / 2 - a, 0x1a1a1e);                      // great gates
    for (let m = 0; m < 16; m++) { const a = (m / 16) * 6.283 + 0.2; quad(b, m % 2 ? M.glowA : M.glowB, IX + Math.cos(a) * 21.75, iy + 9.5, IZ + Math.sin(a) * 21.75, 0.7, 1.8, Math.PI / 2 - a); }
    let ty = iy + 13.4, topY = 0;
    const tr = K.rng(88), htM = tri('marble', { color: 0xfff6e4, scale: 11, bump: 0.35 });   // fine pale ashlar reads better than the coarse block texture at this height
    tiers.forEach(([r, h, tp], i) => {
      const body = i % 2 ? jit(0xf4ecda, tr, 0.008, 0.03, 0.015) : jit(0xebe1cb, tr, 0.008, 0.03, 0.015);
      frust(b, htM, IX, ty, IZ, r, r, h, { top: tp, seg: 24, color: body });
      for (let c = 1; c * 4.2 < h - 3; c++) { const f = c * 4.2 / h, rc = r * (1 - (1 - tp) * f) + 0.04; frust(b, htM, IX, ty + c * 4.2, IZ, rc, rc, 0.22, { top: 1, seg: 24, color: 0xcfc3a8 }); }   // faint masonry courses give the shaft its scale
      const lr = r * tp + 1.4;
      frust(b, M.stoneW, IX, ty + h - 0.5, IZ, lr - 0.2, lr - 0.2, 1.5, { top: 1.0, seg: 24, color: 0xf4ecd8 });       // gallery slab
      frust(b, M.stone, IX, ty + h - 1.6, IZ, r * tp + 0.35, r * tp + 0.35, 1.2, { top: 1.12, seg: 24, color: 0xcfc3a6 }); // corbel course
      const n = Math.round(lr * 3.4);
      for (let m = 0; m < n; m++) { const a = (m / n) * 6.283; b.box(M.stoneW, IX + Math.cos(a) * (lr - 0.15), ty + h + 1.0, IZ + Math.sin(a) * (lr - 0.15), 0.5, 1.1, 0.5, 0, 0xf4ecd8); }
      b.cyl(M.stoneW, IX, ty + h + 1.88, IZ, lr - 0.1, 0.18, { seg: 24, top: 1, color: 0xf4ecd8 });           // balustrade rail ring (thin)
      for (let m = 0; m < 12; m++) { const a = (m / 12) * 6.283 + i * 0.5, rr = r * (1 - (1 - tp) * 0.62) + 0.06; for (const lv of [0.3, 0.62]) quad(b, m % 3 ? M.glowA : M.glowB, IX + Math.cos(a) * rr, ty + h * lv, IZ + Math.sin(a) * rr, 0.8, 2.4, Math.PI / 2 - a); }
      ty += h; topY = ty;
    });
    for (let m = 0; m < 12; m++) { const a = (m / 12) * 6.283; frust(b, M.stoneW, IX + Math.cos(a) * 5.0, topY, IZ + Math.sin(a) * 5.0, 0.42, 0.42, 7.6, { top: 0.9, seg: 6, color: 0xf4ecd8 }); }
    frust(b, M.beacon, IX, topY + 0.6, IZ, 3.7, 3.7, 6.4, { top: 0.9, seg: 14, color: 0xffffff });                  // lantern room (glowing)
    frust(b, M.stoneW, IX, topY + 7.4, IZ, 6.2, 6.2, 1.1, { top: 0.9, seg: 16, color: 0xf4ecd8 });
    b.cone(M.copper, IX, topY + 8.5, IZ, 5.6, 5.4, { seg: 16 }); b.cone(M.gold, IX, topY + 13.9, IZ, 0.2, 2.6, { seg: 5 }); b.sphere(M.gold, IX, topY + 13.9, IZ, 0.5, { seg: 6 });
    // great hall + stables inside the isle wall
    // (the halls of the Hightower are inside the black base)
    // ---- quays / harbour
    const quayPts = Array.from({ length: 24 }, (_, i) => { const x = -118 + i * 11.5; return [x, coastZ(x) - 3.5]; });
    b.ribbon(M.cobble, quayPts, 8, heightAt, 0.25);
    K.wall(b, Array.from({ length: 24 }, (_, i) => { const x = -118 + i * 11.5; return [x, coastZ(x) - 0.2]; }), { h: 1.5, t: 1.4, mat: M.stone, crenel: false, heightAt: (x, z) => 0.3, sink: 2.5, color: 0xe4d8bc });   // harbour mole
    for (let i = 0; i < 9; i++) { const x = -90 + i * 20, z = coastZ(x) - 2; K.pier(b, x, 1.0, z, { len: 22 + (i % 3) * 8, w: 3.2, ry: -Math.PI / 2, mat: M.wood, posts: true, color: jit(0x8a6a4c, rng) }); }
    for (let i = 0; i < 7; i++) {
      const x = -78 + i * 24 + 8, z = coastZ(x) - 14, f = FAM[i % FAM.length];
      villa(b, M, x, H(x, z), z, { w: 15, d: 8, h: 6.4, ry: 0, wall: jit(rng.pick(f.wall), rng), base: 0x8d836e, trim: f.trim, roofC: jit(rng.pick(f.roof), rng), brick: 0x9a6a52, shutC: f.shut, hip: false, dormer: false, chimney: true }, rng, chims);
      for (const k of [-1, 0, 1]) quad(b, M.shut, x + k * 4.4, H(x, z) + 1.6, z + 4.14, 2.6, 3.0, 0, 0x4a4038);          // loading arches
    }
    for (let i = 0; i < 4; i++) { // dock cranes
      const x = -40 + i * 50, z = coastZ(x) - 8, y = H(x, z);
      b.box(M.wood, x, y, z, 0.9, 8, 0.9, 0, 0x6a4f38); limb(b, M.wood, [x, y + 7.4, z], [x + 4.6, y + 8.6, z + 3.2], 0.3, 0.25, 5, 0x6a4f38); limb(b, M.wood, [x, y + 7.4, z], [x - 2.2, y + 9.6, z - 1.5], 0.3, 0.25, 5, 0x6a4f38);
    }
    for (let i = 0; i < 12; i++) lampSpots.push([-100 + i * 18, 2.9, coastZ(-100 + i * 18) - 3.5]);
    // ---- city walls (gap where the Honeywine flows through)
    const wopt2 = { h: 12, t: 3.2, mat: M.stone, capMat: M.stoneW, heightAt, color: 0xe8dcc0 };
    K.wall(b, WALL.concat([[163, -155]]), wopt2); K.wall(b, [[187, -127]].concat(WALL2), wopt2);
    [...WALL, [163, -155], [187, -127], ...WALL2].forEach(([x, z], i) => K.tower(b, x, z, { r: 4, h: 17, y: H(x, z), mat: M.stone, roofMat: M.tile, roof: i % 2 ? 'cone' : 'flat', roofH: 8, seg: 12, windows: false, taper: 0.9, roofColor: jit(0xc2653f, rng), color: jit(0xe8dcc0, rng) }));
    for (const [gx, gz, gr] of [[14, -164, 0], [202, -66, Math.PI / 2], [-126, -34, Math.PI / 2]]) { K.gatehouse(b, gx, gz, { y: H(gx, gz), ry: gr, mat: M.stone, roofMat: M.tile, w: 22, d: 10, h: 17, gate: 5.5, wood: M.wood, towerR: 4.4, color: 0xe8dcc0, roofColor: 0xb8603f }); }
    // ---- Citadel (both banks of the Honeywine around (100,-67))
    const CX = 100, CZ = -67, ux = 0.59, uz = -0.81, vx = 0.81, vz = 0.59; // u along river (upstream), v across
    const cp = (u, v) => [CX + ux * u + vx * v, CZ + uz * u + vz * v];
    const cy = (u, v) => Math.max(H(...cp(u, v)), 2);
    const cr = K.rng(12), cwall = () => jit(0xf1ead8, cr, 0.01, 0.03, 0.03);
    const ct = (u, v, o) => { const [x, z] = cp(u, v), y = cy(u, v); K.tower(b, x, z, { y, windows: false, ...o }); const n = Math.max(2, Math.floor(o.h / 8)); for (let k = 0; k < n; k++) for (let m = 0; m < 3; m++) { const a = k * 1.3 + m * 2.1, rr = o.r * (1 - (1 - (o.taper ?? 0.86)) * ((k + 1) / (n + 1))); quad(b, k % 2 ? M.glowA : M.glowB, x + Math.cos(a) * (rr + 0.05), y + 4 + (o.h - 6) * (k + 0.5) / n, z + Math.sin(a) * (rr + 0.05), 0.7, 2.0, Math.PI / 2 - a); } };
    ct(-4, 34, { r: 9, h: 54, mat: M.stoneW, roofMat: M.copper, roof: 'dome', roofH: 12, seg: 20, taper: 0.88, color: cwall() });             // Archmaesters' tower (interp.)
    ct(26, -32, { r: 5.2, h: 74, mat: M.stoneG, roofMat: M.slate, roof: 'flat', seg: 14, taper: 0.9, color: jit(0xcfc9bc, cr) });              // Ravenry
    { const [x, z] = cp(26, -32); K.tower(b, x, z, { r: 6.4, h: 4, y: cy(26, -32) + 70, mat: M.stoneG, roof: 'none', seg: 14, windows: false, color: jit(0xcfc9bc, cr) }); for (let m = 0; m < 8; m++) { const a = m / 8 * 6.283; quad(b, M.shut, x + Math.cos(a) * 6.0, cy(26, -32) + 72, z + Math.sin(a) * 6.0, 1.3, 2.0, Math.PI / 2 - a, 0x30343a); } }
    [[-30, 36, 28, 7], [8, 44, 24, 6], [-26, -36, 30, 7], [4, -40, 22, 6], [40, 34, 26, 6], [34, 46, 20, 5]].forEach(([u, v, h, r], i) => ct(u, v, { r, h, mat: i % 2 ? M.stone : M.stoneW, roofMat: i % 3 ? M.copper : M.slate, roof: i % 3 ? 'dome' : 'cone', roofH: r * 1.4, seg: 12, color: cwall() }));
    { const [x, z] = cp(-10, -36), ry = Math.atan2(-uz, ux); hall(b, M, x, cy(-10, -36), z, ry, 34, 15, 13, { wall: cwall(), trim: 0xf1ead8, roofC: 0xa4aeba }, cr); }
    [[-34, 12, 0], [20, 14, 1], [-12, 26, 2]].forEach(([u, v, i]) => { const [x, z] = cp(u, v); villa(b, M, x, cy(u, v), z, { w: 12, d: 9, h: 8, ry: Math.atan2(-uz, ux), wall: cwall(), base: 0x8d836e, trim: 0xf6efd8, roofC: jit(0x5fa58f, cr), brick: 0x9a6a52, shutC: 0x4a7a78, hip: i === 1, flat: i === 1, dormer: false, chimney: i !== 1 }, cr, chims); });
    // stone arching bridges with houses on them (books: stalls and houses on the Citadel's bridges)
    const bridgeAt = (u, w = 7, houses = true) => {
      const a = cp(u, -26), c = cp(u, 26), ya = H(...a) + 0.4, yc = H(...c) + 0.4;
      K.bridge(b, [a[0], ya, a[1]], [c[0], yc, c[1]], { w, rise: 3.2, mat: M.stoneW, pillars: true, rail: !houses, thick: 1.3, color: 0xf1ead8 });
      if (houses) for (let i = 0; i < 4; i++) { const t = 0.2 + i * 0.2, x = a[0] + (c[0] - a[0]) * t, z = a[1] + (c[1] - a[1]) * t, y = ya + (yc - ya) * t + Math.sin(t * 3.1416) * 3.2 + 0.1; villa(b, M, x, y, z, { w: 4.6, d: 5.4, h: 3.8, ry: Math.atan2(-(c[1] - a[1]), c[0] - a[0]), wall: jit(0xece0c0, cr), base: 0x9a9080, trim: 0xf6efd8, roofC: jit(0xb45a3a, cr), brick: 0x9a6a52, shutC: 0x4f7a68, hip: i % 2 === 1, dormer: false, chimney: false }, cr); }
    };
    bridgeAt(14); bridgeAt(-20); bridgeAt(40, 5);
    // Starry Sept: dark-stone central hall, seven slender towers with pale tips (interpretation of "starry")
    const SX = 26, SZ = -14, sy = H(SX, SZ), star = [];
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 - 1.5708, rr = i % 2 ? 17 : 29; star.push([SX + Math.cos(a) * rr, SZ + Math.sin(a) * rr * 0.86]); }
    b.extrude(M.stoneW, star, sy + 0.05, 0.28, 0xe8dfc8);                                                              // star-shaped marble plaza
    const sd = 0x6a7280, sdT = 0xe0dccf;   // dark blue-grey stone with pale trim and silvered spires (interpretation of 'starry')
    b.box(M.marble, SX, sy - 1, SZ, 26, 18, 18, 0.15, sd); b.box(M.stone, SX, sy + 17, SZ, 27.4, 0.9, 19.4, 0.15, sdT); b.box(M.stone, SX, sy - 0.6, SZ, 27.2, 1.6, 19.2, 0.15, sdT);
    b.prism(M.slate, SX, sy + 17.8, SZ, 28, 7, 20, 0.15, 0x59606e);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * 6.283, x = SX + Math.cos(a) * 15, z = SZ + Math.sin(a) * 12, h = 26 + (i % 3) * 7, y = H(x, z);
      K.tower(b, x, z, { r: 2.6, h, y, mat: M.marble, roofMat: M.silver, roof: 'spire', roofH: 12, seg: 10, windows: false, taper: 0.8, color: sd });
      frust(b, M.stoneW, x, y + h * 0.55, z, 2.5, 2.5, 0.5, { top: 1.0, seg: 10, color: sdT }); frust(b, M.stoneW, x, y + h - 0.4, z, 2.4, 2.4, 0.9, { top: 1.0, seg: 10, color: sdT });
      b.sphere(M.gold, x, y + h + 12.6, z, 0.7, { seg: 6 });
      quad(b, [M.glassB, M.glassV, M.glassW][i % 3], x + Math.cos(a) * 2.1, y + h * 0.35, z + Math.sin(a) * 2.1, 0.7, 3.2, Math.PI / 2 - a);
    }
    K.tower(b, SX, SZ, { r: 5, h: 36, y: sy, mat: M.marble, roofMat: M.silver, roof: 'spire', roofH: 26, seg: 14, windows: false, taper: 0.84, color: sd });
    b.sphere(M.gold, SX, sy + 61.6, SZ, 1.1, { seg: 8 }); frust(b, M.stoneW, SX, sy + 35.4, SZ, 4.6, 4.6, 1.1, { seg: 14, color: sdT });
    for (let i = -2; i <= 2; i++) { const c15 = Math.cos(0.15), s15 = Math.sin(0.15); quad(b, [M.glassB, M.glassV, M.glassW, M.glassV, M.glassB][i + 2], SX + i * 4.4 * c15 + 9.12 * s15, sy + 7, SZ - i * 4.4 * s15 + 9.12 * c15, 1.7, 8.0, 0.15); }
    // shrine gardens across the river (seven small shrines)
    for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.283, x = 98 + Math.cos(a) * 9, z = -6 + Math.sin(a) * 9; b.box(M.stoneW, x, H(x, z), z, 2.2, 2.4, 2.2, a, jit(0xf1ead8, rng)); b.pyramid(M.tile, x, H(x, z) + 2.4, z, 2.8, 1.5, 2.8, a, [0xc2653f, 0x5f9f8a, 0xb88a42, 0x8a6aa8, 0x4f7ab0, 0xb85a4a, 0xe8e0d0][i]); lampSpots.push([x, H(x, z) + 3.2, z]); }
    // Quill and Tankard: inn on a terraced river island
    { const x = 84, z = -47, y = H(x, z); villa(b, M, x, y, z, { w: 7.4, d: 6, h: 5.4, ry: 0.4, mat: M.wood, wall: 0xb98f66, base: 0x7a6a58, trim: 0xd8bc8a, roofC: 0x8a5a3a, brick: 0x8a5a48, shutC: 0x3f6a85, hip: false, dormer: false, chimney: true, porch: true }, rng, chims); lampSpots.push([x + 2.6, y + 3.4, z + 3.4]); }
    // ---- streets & houses
    const stR = (pts, w) => b.ribbon(M.cobble, K.smoothPath(pts, 6), w, heightAt, 0.2);
    const streets = [
      [[-110, coastZ(-110) - 6], [-30, coastZ(-30) - 6], [50, coastZ(50) - 6], [150, coastZ(150) - 6]],
      [[40, coastZ(40) - 6], [30, 30], [12, -40], [10, -100], [14, -164]],
      [[-126, -34], [-70, -30], [-20, -22], [14, -16]],
      [[202, -66], [150, -40], [112, -20], [100, -10]],
      [[-60, 56], [-50, 0], [-40, -80], [-30, -148]],
      [[130, 60], [140, 0], [130, -70]],
    ];
    streets.forEach((s, i) => stR(s, i < 2 ? 8 : 5.5));
    const onStreet = (x, z) => streets.some((s) => K.distToPolyline(x, z, s).d < 5.5);
    const townAvoid = (x, z) => riverAt(x, z).d < riverHalf(riverAt(x, z).t) + 6 || Math.hypot(x - IX, z - IZ) < 36 || onStreet(x, z)
      || Math.hypot(x - SX, z - SZ) < 32 || Math.hypot(x - 98, z + 6) < 15 || Math.hypot(x - CX, z - CZ) < 54 || z > coastZ(x) - 20;
    const hr = K.rng(31), spots = K.scatter({ rng: hr, count: q.dens(420), bounds: [-122, -176, 200, 62], poly: CITY, minDist: 7.4, avoid: townAvoid });
    const placed = [];
    for (const [x, z] of spots) {
      const f = FAM[Math.floor(K.noise2(x * 0.02, z * 0.02, 3) * 4.99) % FAM.length], ff = hr() < 0.2 ? hr.pick(FAM) : f;
      const w = hr.range(4.8, 8), d = hr.range(4.6, 7.2), h = hr.range(4.6, 10), ry = Math.round(K.noise2(x * 0.05, z * 0.05) * 3) * (Math.PI / 4) * 0.5, y = H(x, z);
      const st = hr();
      const wall = jit(hr.pick(ff.wall), hr);
      villa(b, M, x, y, z, { w, d, h, ry, wall, base: jit(0x978b74, hr, 0.02, 0.05, 0.05).lerp(wall, 0.2), trim: ff.trim, roofC: jit(hr.pick(ff.roof), hr, 0.012, 0.05, 0.05), brick: jit(0x9a6a52, hr), shutC: ff.shut, flat: st < 0.14, hip: st > 0.14 && st < 0.34 && w < d * 1.35, dormer: hr() < 0.3, chimney: hr() < 0.3, porch: hr() < 0.18 }, hr, chims);
      placed.push({ x, z, h });
    }
    for (const [x, z] of K.scatter({ rng: K.rng(37), count: 26, bounds: [-122, -176, 200, 62], poly: CITY, minDist: 24, avoid: (x, z) => townAvoid(x, z) || Math.hypot(x - SX, z - SZ) < 40 })) lampSpots.push([x, H(x, z) + 3.4, z]);
    for (const [x, y, z] of lampSpots) { b.sphere(M.lamp, x, y - 0.3, z, 0.34, { seg: 6 }); b.cyl(M.iron, x, y - 2.2, z, 0.1, 2.0, { seg: 4 }); }
    root.add(b.build({}));

    // ---- greenery
    const PLAIN = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
    function grove({ rng = K.rng(3), count = 100, bounds, poly, heightAt = () => 0, avoid = () => false, species = 'oak', scale = [0.9, 1.3], minDist = 4, greens, points }) {
      const pts = points || K.scatter({ rng, count, bounds, poly, minDist, avoid }), grp = new THREE.Group();
      const trunk = new K.Inst(K.G.cyl(6, 0.7), tri('wood', { color: 0x6b5238, scale: 3, snow: false })), crown = new K.Inst(species === 'cypress' ? K.G.cone(7) : K.G.sphere(8), PLAIN), crown2 = species === 'cypress' ? null : new K.Inst(K.G.sphere(7), PLAIN);
      const gs = greens || { oak: [0x4f7e3c, 0x5e8a41, 0x436f35, 0x6f9446], cypress: [0x2f5a3a, 0x386a42, 0x2a4f36], olive: [0x8a9a62, 0x7c8c58, 0x93a06a] }[species];
      for (const [x, z] of pts) {
        const k = rng.range(scale[0], scale[1]), y = heightAt(x, z), gc = jit(rng.pick(gs), rng, 0.02, 0.05, 0.05);
        if (species === 'cypress') { trunk.add(x, y, z, 0.35 * k, 2 * k, 0.35 * k, 0, 0x5d4733); crown.add(x, y + 1.2 * k, z, 1.5 * k, 9 * k * rng.range(0.85, 1.15), 1.5 * k, rng() * 6, gc); }
        else { trunk.add(x, y, z, 0.45 * k, 3 * k, 0.45 * k, 0, 0x6b5238); crown.add(x, y + 2.4 * k, z, 2.7 * k, 2.4 * k, 2.7 * k, 0, gc); crown2.add(x + 0.6 * k, y + 4.4 * k, z - 0.4 * k, 1.7 * k, 1.5 * k, 1.7 * k, 0, gc.clone().offsetHSL(0.01, 0, 0.06)); }
      }
      for (const i of [trunk, crown, crown2]) if (i && i.items.length) { const m = i.build(); m.castShadow = true; grp.add(m); }
      return grp;
    }
    // orchards planted in rows inside a few walled-field patches; cypress in clumps and windbreak lines rather than an even sprinkle
    const orchPts = [];
    for (let x = -300; x < 380; x += 7) for (let z = -330; z < -140; z += 6.5) {
      const f = K.fbm(x * 0.009 + 11, z * 0.009, 2, 13);
      if (f > 0.56 && !K.pointInPoly(x, z, CITY) && riverAt(x, z).d > 16 && K.fbm(x * 0.05, z * 0.05, 1, 3) > 0.25) orchPts.push([x + (K.noise2(x, z, 1) - 0.5), z]);
    }
    const orch = grove({ rng: K.rng(61), points: orchPts.filter((_, i) => i % 3 !== 2).slice(0, q.dens(280)), heightAt, species: 'olive', scale: [0.8, 1.0], greens: [0x6e7c4c, 0x657447, 0x76824f] });
    const cyp = grove({ rng: K.rng(62), count: q.dens(130), bounds: [60, -40, 140, 40], heightAt, species: 'cypress', avoid: (x, z) => riverAt(x, z).d < 14 || Math.hypot(x - 98, z + 6) < 10 });
    const hills = grove({ rng: K.rng(63), count: q.dens(300), bounds: [-380, -380, 380, -170], minDist: 3.2, heightAt, species: 'cypress', avoid: (x, z) => K.pointInPoly(x, z, CITY) || riverAt(x, z).d < 14 || K.fbm(x * 0.018, z * 0.018, 2, 71) < 0.52 });
    const oliv = grove({ rng: K.rng(66), count: q.dens(110), bounds: [-380, -140, -140, 40], heightAt, species: 'oak', scale: [0.9, 1.3], avoid: (x, z) => K.pointInPoly(x, z, CITY) || z > coastZ(x) - 14 || riverAt(x, z).d < 14 || K.fbm(x * 0.02, z * 0.02, 2, 77) < 0.5 });
    root.add(orch, cyp, hills, oliv);

    // ---- life: ships, gulls, ravens, smoke, banners, walkers, beacon fire
    const mk = (type, len, hull, sail) => { const s = K.ship(type, { len, hull, sail }); root.add(s); return s; };
    const sailing = [
      { s: mk('cog', 16, 0x5c4129, 0xf0e8d2), cx: -60, cz: 175, rx: 90, rz: 35, sp: 0.045, ph: 0 },
      { s: mk('galley', 22, 0x5a3e2c, 0xdccca4), cx: 20, cz: 165, rx: 120, rz: 30, sp: -0.035, ph: 2 },
      { s: mk('cog', 14, 0x7a5434, 0xe8dcc0), cx: -110, cz: 150, rx: 40, rz: 60, sp: 0.06, ph: 4 },
      { s: mk('galley', 20, 0x7b3a2e, 0xe7d9b8), cx: 110, cz: 125, rx: 55, rz: 25, sp: 0.05, ph: 1 },
    ];
    const hullsC = [0x5b4129, 0x3f5470, 0x6a4a30, 0x4a3a2c, 0x59403a];
    const moored = [[-70, coastZ(-70) + 10], [-30, coastZ(-30) + 14], [10, coastZ(10) + 18], [50, coastZ(50) + 10], [90, coastZ(90) + 14]].map(([x, z], i) => { const s = mk(i % 2 ? 'cog' : 'galley', 13 + (i % 3) * 3, hullsC[i], [0xe9dfc5, 0xe2d4b0, 0xd9c9a0][i % 3]); s.position.set(x, 0.2, z); s.rotation.y = Math.PI / 2 + (i - 2) * 0.1; return s; });
    const boats = Array.from({ length: 5 }, () => { const s = K.ship('barge', { len: 8, hull: 0x6d4a2d, sail: 0xe8dcc0 }); root.add(s); return s; });
    ctx.onUpdate((dt, t) => {
      sailing.forEach(({ s, cx, cz, rx, rz, sp, ph }) => { const a = t * sp + ph, x = cx + Math.cos(a) * rx, z = cz + Math.sin(a) * rz, dx = -Math.sin(a) * rx * Math.sign(sp), dz = Math.cos(a) * rz * Math.sign(sp); s.position.set(x, 0.2, z); s.rotation.y = Math.atan2(-dz, dx); K.animateShip(s, t, ph); });
      moored.forEach((s, i) => K.animateShip(s, t, i));
      boats.forEach((s, i) => { const u = ((t * 0.012 + i * 0.2) % 1); const f = u * (RIVER.length - 1), k = Math.min(RIVER.length - 2, Math.floor(f)), r = f - k; const x = K.lerp(RIVER[k][0], RIVER[k + 1][0], r), z = K.lerp(RIVER[k][1], RIVER[k + 1][1], r); s.position.set(x, 0.2, z); s.rotation.y = Math.atan2(-(RIVER[k + 1][1] - RIVER[k][1]), RIVER[k + 1][0] - RIVER[k][0]) + (i % 2 ? Math.PI : 0); });
    });
    const gulls = K.birds({ center: [0, 30, 90], radius: 110, count: q.dens(18), color: 0xf4f4f2, size: 1.3, spreadY: 14, seed: 3 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const rc = cp(26, -32); const rav = K.birds({ center: [rc[0], 80, rc[1]], radius: 26, count: q.dens(10), color: 0x17171c, size: 1.0, spreadY: 10, seed: 8 }); root.add(rav); ctx.onUpdate((dt, t) => rav.userData.update(t));
    root.add(K.smoke(chims.filter((_, i) => i % 4 === 0).slice(0, 60), { size: 15, rise: 14, opacity: 0.2, color: 0xe0d8c8 }));
    const banC = [0xb8584a, 0xd49a3f, 0xdcc060, 0x5a9a62, 0x4a7ab4, 0x8a65b0, 0xe8e6de];
    root.add(K.banners([{ x: IX, y: topY - 2, z: IZ + 6.5, w: 4, h: 9, color: 0xe6e5df, ry: 0 }, ...[0, 1, 2, 3, 4, 5, 6].map((i) => { const a = (i / 7) * 6.283; return { x: SX + Math.cos(a) * 15, y: H(SX + Math.cos(a) * 15, SZ + Math.sin(a) * 12) + 26 + (i % 3) * 7 + 2, z: SZ + Math.sin(a) * 12, w: 2, h: 5, color: banC[i], ry: a }; }),
      { x: 14, y: 20, z: -164 + 6, w: 3, h: 7, color: 0xe6e5df, ry: 0 }, { x: 202, y: 20, z: -66 + 6, w: 3, h: 7, color: 0xe6e5df, ry: 1.5 }]));
    const fire = K.fires([[IX, topY + 3.4, IZ], [-40, 2.6, coastZ(-40) - 3], [60, 2.6, coastZ(60) - 3]], { size: 70, light: q.low ? 0 : 2, intensity: 300 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const wk = K.walkers({ paths: streets.map((s) => K.smoothPath(s, 4)), heightAt, count: q.dens(60), rng: K.rng(5), colors: [0x7a5c3a, 0x4d5a6a, 0x8a4a3a, 0x57603a, 0x6a6a6a, 0x9a8a62] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    root.add(K.clouds({ y: 280, extent: 800, count: 8, opacity: 0.3 }));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    const lmc = (u, v, r, dy) => lm(...cp(u, v), r, dy);
    return {
      radius: 260, center: [40, 10, -10], minDistance: 14,
      hero: { pos: [262, 118, 318], target: [12, 52, -6] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x566fa6, horizon: 0xeec0a0, fog: 0xeec0a0, fogD: 0.0012, sunC: 0xffc080, sunI: 3.0, hemiSky: 0xb0b4d8, hemiGround: 0x6a5648, hemiI: 0.78 },
        day: { top: 0x3c78c4, horizon: 0xd6e2e6, fog: 0xcfdbdf, fogD: 0.00078, sunC: 0xffe6b8, sunI: 3.5, hemiSky: 0xaecbec, hemiGround: 0x7a6a48, hemiI: 0.9 },
        dusk: { top: 0x2e3a78, horizon: 0xe8925c, fog: 0xe8925c, water: 0.5, fogD: 0.0013, sunC: 0xff8e48, sunI: 3.0, hemiSky: 0x8a8cc4, hemiGround: 0x4e3c38, hemiI: 0.7 },
        night: { top: 0x080e2c, horizon: 0x223860, fog: 0x223860, fogD: 0.0017, sunC: 0x9fb4e8, sunI: 1.2, hemiSky: 0x5a6cb0, hemiGround: 0x20263a, hemiI: 1.05 },
      } },
      landmarks: {
        'hightower': { pos: [IX, iy + 120, IZ], r: 34, cam: { pos: [IX + 130, iy + 90, IZ + 160], target: [IX, iy + 80, IZ] } },
        'beacon': { pos: [IX, topY + 10, IZ], r: 10, cam: { pos: [IX + 40, topY + 18, IZ + 56], target: [IX, topY + 8, IZ] } },
        'battle-isle': lm(IX + 10, IZ + 10, 24, 5),
        'harbor': lm(10, coastZ(10) - 2, 38, 8),
        'old-walls': lm(-100, -95, 18, 16),
        'streets-and-markets': lm(20, -40, 30, 9),
        'honeywine': lm(60, -3, 12, 5),
        'starry-sept': lm(SX, SZ, 22, 40),
        'quill-and-tankard': lm(84, -47, 8, 10),
        'citadel': lmc(0, 0, 40, 60),
        'ravenry': lmc(26, -32, 12, 80),
        'citadel-library': lmc(-10, -36, 18, 18),
        'citadel-bridges': lmc(14, 0, 18, 12),
        'shrine-gardens': lm(98, -6, 14, 6),
      },
      cutaways: [{ id: 'citadel-library', name: { en: 'Citadel library (cutaway)', zh: '学城藏书厅（剖面）' }, build: buildLibrary }],
    };
  },
};

function buildLibrary(ctx) {
  // A museum-style section through one bay of the great library: barrel vault cut open at the crown, two storeys of presses
  // with a gallery, chained books on lecterns, long reading tables, tall windows with daylight falling across the floor.
  const g = ctx.root, b = new Batch(), W = 60, D = 24, Hh = 15, r = K.rng(404);
  const stone = tri('stone', { color: 0xd8ccb2, scale: 2.6, snow: false, bump: 0.5 }), rib = tri('stone', { color: 0xeee4cc, scale: 2.2, snow: false, bump: 0.4 });
  const wood = tri('wood', { color: 0x7a5434, scale: 2.2, snow: false }), dark = tri('wood', { color: 0x4a3220, scale: 2, snow: false });
  const cut = flat(0x2a2320, { rough: 1 }), brass = flat(0xc9a14a, { rough: 0.35, metal: 0.75 }), iron = flat(0x2e3034, { rough: 0.6, metal: 0.5 });
  const paper = flat(0xefe4c8, { rough: 1 }), bookM = flat(0xffffff, { rough: 0.85 }), winG = glow(0xfff0cc, 0.45), candle = glow(0xffc070, 1.6);
  const bookC = [0x7a2a24, 0x3e5a3a, 0x2f3f5c, 0x6b4a22, 0x5a2a3a, 0x8a6a3a, 0x3a3030, 0x9a7a4a, 0x4a5a6a, 0x6a2a1e];
  // floor: two-tone stone flags in a running pattern
  b.box(cut, 0, -1.6, 0, W + 4, 1.6, D + 4, 0, 0xffffff);
  for (let i = 0; i < 20; i++) for (let j = 0; j < 8; j++) b.box(tri('marble', { color: 0xffffff, scale: 4, snow: false }), -W / 2 + 1.5 + i * 3, -0.2, -D / 2 + 1.5 + j * 3, 2.96, 0.2, 2.96, 0, (i + j) % 2 ? 0x9a8a72 : 0xc2b496);
  // back wall, end walls; the cut faces are dark 'poche' like an architectural section
  b.box(stone, 0, 0, -D / 2 - 0.8, W + 2, Hh, 1.6, 0, 0xffffff);
  for (const sx of [-1, 1]) { b.box(stone, sx * (W / 2 + 0.8), 0, 0, 1.6, Hh, D + 1.6, 0, 0xffffff); b.box(cut, sx * (W / 2 + 0.8), 0, D / 2 + 0.81, 1.62, Hh, 0.02, 0, 0xffffff); }
  b.box(cut, 0, -1.6, D / 2 + 2, W + 4, 1.6, 0.02, 0, 0xffffff);
  // barrel vault (back half only, cut at the crown) with transverse ribs
  const VR = D / 2, segs = 10;
  for (let k = 0; k < segs; k++) {
    const a0 = (k / segs) * Math.PI / 2, a1 = ((k + 1) / segs) * Math.PI / 2, z0 = -Math.cos(a0) * VR, y0 = Hh + Math.sin(a0) * VR * 0.75, z1 = -Math.cos(a1) * VR, y1 = Hh + Math.sin(a1) * VR * 0.75;
    const len = Math.hypot(z1 - z0, y1 - y0), ang = Math.atan2(y1 - y0, z1 - z0);
    b.box(stone, 0, (y0 + y1) / 2 - 0.5, (z0 + z1) / 2, W + 3, 1.0, len + 0.1, 0, 0xf0e6d0, -ang);
    for (let i = -5; i <= 5; i++) b.box(rib, i * 5.6, (y0 + y1) / 2 - 1.3, (z0 + z1) / 2, 0.9, 0.9, len + 0.1, 0, 0xffffff, -ang);
  }
  for (const sx of [-1, 1]) b.box(cut, sx * (W / 2 + 1.52), Hh, -VR / 2, 0.05, VR * 0.75, VR, 0, 0xffffff);
  b.box(cut, 0, Hh + VR * 0.75 - 0.6, 0.02, W + 3, 1.1, 0.05, 0, 0xffffff);
  for (let i = -5; i <= 5; i++) { b.box(rib, i * 5.6, 0, -D / 2 + 0.1, 1.3, Hh, 0.7, 0, 0xffffff); b.box(rib, i * 5.6, Hh - 0.6, -D / 2 + 0.3, 1.8, 0.8, 1.2, 0, 0xffffff); }   // wall shafts
  // book presses: two storeys of shelves packed with volumes of uneven height and colour
  for (let lv = 0; lv < 2; lv++) {
    const y0 = lv * 7.2, zf = -D / 2 + 1.6;
    for (let bay = -5; bay < 5; bay++) {
      const x0 = bay * 5.6 + 0.75, bw = 4.1;
      b.box(dark, x0 + bw / 2, y0, zf - 0.6, bw + 0.4, 6.6, 0.25, 0, 0xffffff);                                   // backboard
      for (const e of [0, bw]) b.box(wood, x0 + e, y0, zf, 0.25, 6.8, 1.4, 0, 0xffffff);                       // uprights
      for (let sh = 0; sh < 5; sh++) {
        const ys = y0 + 0.3 + sh * 1.3; b.box(wood, x0 + bw / 2, ys - 0.12, zf, bw, 0.12, 1.4, 0, 0xffffff);
        let x = x0 + 0.2;
        while (x < x0 + bw - 0.3) { const bw2 = r.range(0.13, 0.3), bh = r.range(0.75, 1.1); if (r() < 0.05) { x += 0.35; continue; } b.box(bookM, x + bw2 / 2, ys, zf + r.range(-0.05, 0.1), bw2, bh, 0.9, r() < 0.06 ? r.range(-0.3, 0.3) * 0 : 0, jit(r.pick(bookC), r, 0.01, 0.08, 0.06), 0, r() < 0.08 ? 0.2 : 0); x += bw2 + 0.015; }
      }
      b.box(wood, x0 + bw / 2, y0 + 6.6, zf, bw + 0.5, 0.35, 1.7, 0, 0xffffff);                                   // cornice
    }
  }
  // gallery walkway with balustrade at the upper storey; ladder and a spiral stair to reach it
  b.box(wood, 0, 6.85, -D / 2 + 3.6, W, 0.35, 2.6, 0, 0xffffff);
  for (let i = -29; i <= 29; i++) b.cyl(wood, i, 7.2, -D / 2 + 4.8, 0.08, 1.05, { seg: 5, color: 0xffffff });
  b.box(wood, 0, 8.25, -D / 2 + 4.8, W, 0.15, 0.25, 0, 0xffffff);
  for (let i = -5; i <= 5; i++) if (i % 2) { b.box(dark, i * 5.6, 0, -D / 2 + 4.85, 0.3, 6.85, 0.3, 0, 0xffffff); }                    // gallery posts
  for (const x of [-17, 9]) { for (const e of [-0.45, 0.45]) b.box(wood, x + e, 0, -D / 2 + 3.4, 0.1, 6.9, 0.1, 0, 0xffffff, 0.16); for (let k = 0; k < 11; k++) b.box(wood, x, 0.5 + k * 0.6, -D / 2 + 3.4 - (0.5 + k * 0.6) * 0.16, 0.9, 0.06, 0.08, 0, 0xffffff); }
  { const sx = W / 2 - 4, sz = -D / 2 + 5; b.cyl(dark, sx, 0, sz, 0.35, 7.2, { seg: 8 }); for (let k = 0; k < 14; k++) { const a = k * 0.5; b.box(wood, sx + Math.cos(a) * 1.1, k * 0.5, sz + Math.sin(a) * 1.1, 2.2, 0.12, 0.7, -a, 0xffffff); } }
  // tall arched windows in the end walls; pale shafts of daylight
  for (const sx of [-1, 1]) for (const zz of [-4, 3.5]) {
    b.box(winG, sx * (W / 2 - 0.05), 4, zz, 0.12, 7.5, 2.4, 0, 0xffffff); for (const [yy, hh, ww] of [[11.5, 0.6, 2.0], [12.1, 0.5, 1.4], [12.6, 0.4, 0.7]]) b.box(winG, sx * (W / 2 - 0.05), yy, zz, 0.12, hh, ww, 0, 0xffffff);
    b.box(stone, sx * (W / 2 - 0.2), 3.6, zz, 0.6, 0.4, 3.2, 0, 0xe8dcc0);
  }
  // reading tables, benches, candles and chained books on lecterns
  for (let i = -3; i <= 3; i++) {
    const x = i * 7.8, z = 3;
    b.box(dark, x, 0, z, 5.4, 0.9, 1.6, 0, 0xffffff); b.box(wood, x, 0.9, z, 5.8, 0.18, 2.2, 0, 0xffffff);
    for (const sz of [-1, 1]) b.box(dark, x, 0, z + sz * 1.9, 5.0, 0.55, 0.6, 0, 0xffffff);
    for (let k = 0; k < 3; k++) { const bx = x + r.range(-2.2, 2.2), bz = z + r.range(-0.6, 0.6); b.box(paper, bx, 1.08, bz, 0.9, 0.08, 0.7, r() * 0.6); b.box(bookM, bx + 0.6, 1.08, bz - 0.3, 0.55, 0.22, 0.75, r() * 0.6, jit(r.pick(bookC), r)); }
    b.cyl(brass, x - 1.6, 1.08, z - 0.4, 0.14, 0.08, { seg: 8 }); b.cyl(paper, x - 1.6, 1.16, z - 0.4, 0.06, 0.32, { seg: 6 }); b.box(candle, x - 1.6, 1.48, z - 0.4, 0.07, 0.12, 0.07);
  }
  for (let i = -3; i <= 3; i++) {
    const x = i * 7.8 + 3.9, z = -3.6; if (i === 3) continue;
    b.cyl(dark, x, 0, z, 0.22, 1.25, { seg: 6 }); b.box(wood, x, 1.25, z, 1.2, 0.12, 0.9, 0, 0xffffff, -0.35); b.box(bookM, x, 1.38, z + 0.05, 1.0, 0.1, 0.75, 0, 0x6a2a1e, -0.35);
    for (let k = 0; k < 6; k++) b.box(iron, x - 0.5 - k * 0.12, 1.3 - k * 0.2, z - 0.25, 0.08, 0.08, 0.08);                         // the chain
  }
  // the brass armillary sphere at the centre of the hall
  const ax = 0, ay = 3.1, az = 8.2;
  b.cyl(dark, ax, 0, az, 0.9, 0.5, { seg: 10 }); b.cyl(brass, ax, 0.5, az, 0.18, ay - 0.5, { seg: 8 });
  for (const [rx, ry, rz, rr] of [[Math.PI / 2, 0, 0, 1.6], [0, 0, 0, 1.6], [0, Math.PI / 2, 0, 1.6], [Math.PI / 2, 0, 0.41, 1.45], [0.4, 0.8, 0, 1.3]]) {
    const tg = new THREE.TorusGeometry(rr, 0.05, 5, 32); _e.set(rx, ry, rz); _q.setFromEuler(_e); _m.compose(_p.set(ax, ay + 1.6, az), _q, _s.set(1, 1, 1)); b.addGeometry(brass, tg, _m); tg.dispose();
  }
  b.sphere(brass, ax, ay + 1.35, az, 0.25, { seg: 10 });
  g.add(b.build({}));
  // daylight shafts: additive soft planes slanting in from the windows
  const shaftM = new THREE.MeshBasicMaterial({ color: 0xffe4b0, transparent: true, opacity: 0.035, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  for (const sx of [-1, 1]) for (const zz of [-4, 3.5]) { const sg = new THREE.Group(), m = new THREE.Mesh(new THREE.PlaneGeometry(18, 2.4), shaftM); m.rotation.x = Math.PI / 2; sg.add(m); sg.position.set(sx * (W / 2 - 7.8), 4.2, zz); sg.rotation.z = sx * 0.5; g.add(sg); }
  const fire = K.fires([...[-3, -2, -1, 0, 1, 2, 3].map((i) => [i * 7.8 - 1.6, 1.62, 2.6])], { size: 2.2, light: 2, intensity: 22, color: 0xffb060 }); g.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
  const warm = new THREE.PointLight(0xffd29a, 160, 70, 1.5); warm.position.set(0, 10, 6); g.add(warm);
  for (const sx of [-1, 1]) { const day = new THREE.PointLight(0xcfe0ff, 45, 40, 1.6); day.position.set(sx * (W / 2 - 3), 8, 0); g.add(day); }
  return { center: [0, 6, 0], hero: { pos: [-8, 12.5, 44], target: [3, 6, -2] }, minDistance: 8, maxDistance: 85 };
}
