// Storm's End — one colossal round drum tower on a seaward cliff above Shipbreaker Bay, inside a very thick curtain wall (thicker on the sea side).
// Book / TWOIAF anchors: built to defy the storms, a single immense round tower, walls many yards thick, Shipbreaker Bay, Kingswood to the north,
// stormy climate. Everything else (plan, village, coves) is artistic interpretation — see content/storms-end.js.
//
// Visual language: storm-grey masonry in jittered courses with pale string courses, a battered wet-dark skirt, a corbelled crown with a
// beacon; a layered strata cliff with breakers and sea-stacks; wind-bent moor, thatch hamlet; rain, lightning, lit slits at night.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const TAU = Math.PI * 2;
const C = [40, 0], TW = [76, 0], TR = 31, TH = 86, RX = 86, RZ = 58, HAM = [-8, 238];
const cliffX = (z) => 156 - 104 * (1 - Math.exp(-((z / 125) ** 2))) + 7 * Math.sin(z * 0.045 + 1) + 4 * Math.sin(z * 0.13);

const jit = (hex, r, dh = 0.012, ds = 0.05, dl = 0.03) => new THREE.Color(hex).offsetHSL((r() - 0.5) * 2 * dh, (r() - 0.5) * 2 * ds, (r() - 0.5) * 2 * dl);
const tint = (r, v = 0.12, w = 0.05) => { const k = 1 - v * r(); return new THREE.Color(k, k * (1 - w * r()), k * (1 - w * r() * 1.4)); };
const _up = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _d = new THREE.Vector3(), _e = new THREE.Euler();
const loc = (cx, cz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c]; };
function strut(b, mat, p, q, w, color = 0xffffff, d = w) {
  _d.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); const len = _d.length(); if (len < 1e-3) return;
  _q.setFromUnitVectors(_up, _d.multiplyScalar(1 / len)); _m.compose(_p.set(p[0], p[1], p[2]), _q, _s.set(w, len, d)); b.addGeometry(mat, G.box(), _m, color);
}
const archCache = new Map();
function archGeo(w, h, depth) {
  const k = `${w}|${h}|${depth}`; let g = archCache.get(k); if (g) return g;
  const r = w / 2, s = new THREE.Shape(); s.moveTo(-r, 0); s.lineTo(-r, h - r); s.absarc(0, h - r, r, Math.PI, 0, true); s.lineTo(r, 0); s.closePath();
  g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 4 }); archCache.set(k, g); return g;
}
function arch(b, mat, x, y, z, ry, w, h, depth = 0.25, color = 0xffffff) { _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(1, 1, 1)); b.addGeometry(mat, archGeo(w, h, depth), _m, color); }
/** Instanced pulsing breaker rings (one draw call). rings: [[x,z,r]] */
function foamRings(ctx, rings, { y = 0.3, width = 3, opacity = 0.5, speed = 0.9, dim = () => 1 } = {}) {
  const g = new THREE.RingGeometry(0.9, 1, 28, 1); g.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending, fog: true }); mat.userData.ring = true;
  const n = rings.length * 2, m = new THREE.InstancedMesh(g, mat, n); m.frustumCulled = false; m.renderOrder = 3;
  const o = new THREE.Object3D(), c = new THREE.Color(); ctx.root.add(m);
  ctx.onUpdate((dt, t) => {
    const k = dim();
    for (let i = 0; i < n; i++) {
      const [x, z, r] = rings[i >> 1], ph = ((t * 0.18 * speed + (i & 1) * 0.5 + (i >> 1) * 0.173) % 1), s = r + 1 + ph * width * 2.2;
      o.position.set(x, y, z); o.scale.set(s, 1, s); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      const a = Math.sin(ph * Math.PI) * opacity * 0.55 * k; m.setColorAt(i, c.setRGB(a, a, a));
    }
    m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true;
  });
}

/** Terrain on a non-uniform grid: fine cells over [a0..a1] x [b0..b1], coarsening smoothly outside, so a cliff gets resolution without a huge mesh. */
function warpTerrain({ x: [xl, xh, xa, xb], z: [zl, zh, za, zb], fine = 3, coarse = 14, ramp = 160, heightAt, colorAt, kind = 'rock', scale = 16 }) {
  const axis = (lo, hi, a, b) => { const v = [lo]; let p = lo; while (p < hi) { const d = p < a ? a - p : p > b ? p - b : 0; p += K.lerp(fine, coarse, K.smoothstep(0, ramp, d)); v.push(Math.min(p, hi)); } v[v.length - 1] = hi; return v; };
  const xs = axis(xl, xh, xa, xb), zs = axis(zl, zh, za, zb), nx = xs.length, nz = zs.length, pos = new Float32Array(nx * nz * 3), idx = new Uint32Array((nx - 1) * (nz - 1) * 6);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const o = (j * nx + i) * 3; pos[o] = xs[i]; pos[o + 1] = heightAt(xs[i], zs[j]); pos[o + 2] = zs[j]; }
  let k = 0; for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals();
  const nor = g.attributes.normal, col = new Float32Array(nx * nz * 3), c = new THREE.Color();
  for (let v = 0; v < nx * nz; v++) { c.set(colorAt(pos[v * 3], pos[v * 3 + 2], pos[v * 3 + 1], 1 - nor.getY(v))); col[v * 3] = c.r; col[v * 3 + 1] = c.g; col[v * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(g, tri(kind, { scale, rough: 0.95, color: 0xffffff })); m.receiveShadow = true; return m;
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root;
    // ---- terrain ---------------------------------------------------------------------------------------------------
    const heightAt = (x, z) => {
      const dcastle = Math.hypot(x - C[0], z - C[1]), az = Math.abs(z), low = K.smoothstep(100, 230, az);
      const topH = K.lerp(46, 9, K.smoothstep(100, 250, az));
      let land = topH + (K.fbm(x * 0.012, z * 0.012, 3, 3) - 0.5) * 16 * K.smoothstep(70, 220, dcastle) + (K.fbm(x * 0.06, z * 0.06, 2, 7) - 0.5) * 1.6;
      land += K.smoothstep(-120, -520, x) * (50 + (K.fbm(x * 0.006, z * 0.006, 3, 4) - 0.3) * 50) + K.smoothstep(-80, -320, z) * 24 * (0.5 + K.fbm(x * 0.008, z * 0.008, 3, 2));
      land = K.lerp(land, 7 + (K.fbm(x * 0.03, z * 0.03, 2, 4) - 0.5) * 3, (1 - K.smoothstep(30, 130, Math.hypot(x - HAM[0], z - HAM[1]))) * 0.75);   // hamlet flats (gentle)
      const dcb = cliffX(z) + (K.fbm(x * 0.05, z * 0.05, 3, 8) - 0.5) * 10 + (K.fbm(x * 0.022, z * 0.022, 2, 12) - 0.5) * 30 - x, w = K.lerp(12, 34, low), t0 = K.smoothstep(-3, w, dcb);
      const dc = dcb + (1 - low) * 4.2 * Math.sin(t0 * 24 + K.fbm(x * 0.07, z * 0.07, 2, 3) * 8) * t0 * (1 - t0) * 4, t = K.smoothstep(-3, w, dc);
      let h = K.lerp(-16, land, t);
      h = K.lerp(h, Math.round(h / 5) * 5 + (K.fbm(x * 0.2, z * 0.2, 2, 5) - 0.5) * 1.5, t * (1 - t) * 3.2 * (1 - low));  // ledged cliff
      return h;
    };
    const H = heightAt;
    const C3 = (h) => new THREE.Color(h), c = new THREE.Color();
    const grass = C3(0x6a8a44), moor = C3(0x8a8a52), heath = C3(0x70585e), brack = C3(0x8a7440), turf = C3(0x4a6a38), slateR = C3(0x6a7278), warmR = C3(0xb0a58f), rustR = C3(0x96725a), wetR = C3(0x303a3e), pebble = C3(0x9a978c), lip = C3(0xa2a595);
    const colorAt = (x, z, h, s) => {
      const n1 = K.fbm(x * 0.012, z * 0.012, 3, 1), n2 = K.fbm(x * 0.05, z * 0.05, 2, 2), n3 = K.fbm(x * 0.007, z * 0.007, 2, 6);
      c.copy(grass).lerp(moor, K.clamp(n1 * 1.5 - 0.3, 0, 0.85)).lerp(turf, K.smoothstep(0.5, 0.72, n2) * 0.5).lerp(heath, K.smoothstep(0.52, 0.7, n3) * 0.7).lerp(brack, K.smoothstep(0.55, 0.8, K.fbm(x * 0.03, z * 0.03, 2, 9)) * 0.45);
      if (h > 60) c.lerp(slateR, K.clamp((h - 60) * 0.02, 0, 0.35));                                        // upland
      const band = 0.5 + 0.5 * Math.sin(h * 0.52 + K.fbm(x * 0.04, z * 0.04, 2, 4) * 5), band2 = 0.5 + 0.5 * Math.sin(h * 1.7 + n2 * 4);
      const rock = new THREE.Color().copy(slateR).lerp(band > 0.62 ? warmR : band < 0.25 ? rustR : slateR, 0.35 + band * 0.55).multiplyScalar(0.8 + 0.34 * band2);
      c.lerp(rock, K.clamp((s - 0.05) * 4.2, 0, 0.96));
      if (h > 30 && h < 52 && s < 0.2 && s > 0.03) c.lerp(lip, 0.3 * K.smoothstep(0.03, 0.12, s));     // wind-scoured lip above the face
      if (h < 6) c.lerp(wetR, K.smoothstep(6, -2, h) * 0.85);                                          // sea-wet, kelp-dark base
      if (h > -0.8 && h < 2.4 && s < 0.25) c.lerp(pebble, 0.75);                                        // shingle
      return c;
    };
    root.add(warpTerrain({ x: [-870, 630, -20, 215], z: [-550, 550, -200, 290], fine: q.low ? 4.5 : 3.3, coarse: q.low ? 18 : 15, heightAt, colorAt, scale: 18 }));
    const wat = K.water({ w: 1500, d: 1500, seg: q.seg(100), center: [250, 0], level: 0, heightAt, deep: 0x1c3640, shallow: 0x5c8a90, opacity: 0.95, choppy: 2.4, speed: 1.5 });
    root.add(wat); ctx.registerWater(wat);
    const farSea = K.water({ w: 8000, d: 8000, seg: 6, level: -0.4, heightAt: () => -20, deep: 0x1f3a46, shallow: 0x1f3a46, opacity: 0.95, choppy: 1.0, speed: 0.8, center: [1500, 0] }); root.add(farSea); ctx.registerWater(farSea);
    { // far land skirt: coarse, sunk under the detailed terrain and rising to meet it at its rim so no edge shows
      const inX = (x) => Math.min(x + 870, 630 - x), inZ = (z) => 550 - Math.abs(z), cF = C3(0x4d5c3e), cH = C3(0x5a5a50);
      root.add(K.terrain({ w: 6400, d: 6400, seg: 56, center: [-2200, 0], heightAt: (x, z) => { const h = H(x, z), dIn = Math.max(0, Math.min(inX(x), inZ(z))); return h < 3 ? -25 : K.lerp(h, -40, K.smoothstep(0, 90, dIn)); }, kind: 'rock', scale: 40, colorAt: (x, z, h) => c.copy(cF).lerp(cH, K.clamp(h * 0.012, 0, 0.6)) })); }

    // ---- materials -------------------------------------------------------------------------------------------------
    const T = (k, color, scale = 8, o = {}) => tri(k, { color, scale, snow: false, ...o });
    const M = {
      stone: T('stone', 0xb4b6b0, 9, { bump: 0.7 }), stoneD: T('stone', 0x8b8e8c, 9), stoneW: T('stone', 0x5e6769, 9), trim: T('stone', 0xd2d4cc, 6), mossS: T('rock', 0x6b7a58, 7),
      slate: T('slate', 0x6a7686, 6, { bump: 0.6 }), slateD: T('slate', 0x4e5866, 6), wood: T('wood', 0x5c4630, 4), woodD: T('wood', 0x3b2d22, 4), thatch: T('thatch', 0xb09a68, 5), plaster: T('plaster', 0xd0c9b6, 6),
      rock: T('rock', 0xa4a6a2, 11), rockD: T('rock', 0x80858a, 10), kelp: T('rock', 0x2a3a36, 7), cobble: T('cobble', 0x8e897c, 8), hullW: T('wood', 0x8a6a4c, 3, { side: THREE.DoubleSide }),
      iron: flat(0x2c2d32, { metal: 0.6, rough: 0.5 }), dark: flat(0x0b0c10, { rough: 1 }), gold: flat(0xd8b050, { metal: 0.3, rough: 0.4 }),
      win: glow(0xffc46b), lamp: glow(0xffa24a, 1.2), beacon: glow(0xffb060, 1.5),
    };
    const rt = K.rng(808), b = new Batch();
    const gy = (x, z) => Math.max(H(x, z), 4);

    // ---- reusable pieces ---------------------------------------------------------------------------------------------
    /** Round tower: battered plinth, string courses, slits, corbelled crown, flat battlement or conical roof. */
    function drum(x, y, z, r, h, o = {}) {
      const { seg = 14, taper = 0.88, roof = 'flat', roofH = r * 2.4, stone = M.stone, base = M.stoneW, col = 0xffffff, slits = 3, lit = 1, rings = [0.4, 0.72] } = o;
      const rA = (t) => r * (1 - (1 - taper) * t);
      b.cyl(base, x, y - 4, z, r * 1.16, 7.4, { top: 0.88, seg, color: col });
      b.cyl(stone, x, y, z, r, h, { top: taper, seg, color: col });
      for (const t of rings) b.cyl(M.trim, x, y + t * h - 0.3, z, rA(t) * 1.045, 0.7, { top: 1, seg, color: col });
      for (let k = 0; k < slits; k++) { const a = k * 2.1 + r * 1.3, t = 0.18 + 0.5 * k / slits, rr = rA(t) + 0.04; b.box(M.dark, x + Math.cos(a) * rr, y + h * t, z + Math.sin(a) * rr, 0.34, 1.9, 0.16, Math.PI / 2 - a); }
      for (let k = 0; k < lit; k++) { const a = k * 2.7 + 0.6 + r, t = 0.6 + 0.1 * k, rr = rA(t) + 0.05; b.box(M.win, x + Math.cos(a) * rr, y + h * t, z + Math.sin(a) * rr, 0.5, 1.5, 0.12, Math.PI / 2 - a); }
      const yt = y + h, rt2 = rA(1), R2 = rt2 * 1.3;
      b.cyl(M.trim, x, yt - 1.8, z, rt2 * 1.02, 1.8, { top: 1.3, seg, color: col });                // corbel flare
      if (roof === 'cone') { b.cyl(stone, x, yt, z, R2, 1.0, { top: 1, seg, color: col }); b.cone(M.slate, x, yt + 1, z, R2 * 1.06, roofH, { seg, color: tint(rt, 0.14, 0.02) }); b.cyl(M.gold, x, yt + roofH, z, 0.15, 2.2, { seg: 5, top: 0.4 }); }
      else { b.cyl(stone, x, yt, z, R2, 1.1, { top: 1, seg, color: col }); const n = Math.max(8, Math.round((TAU * R2) / 2.9)); for (let i = 0; i < n; i++) { const a = (i / n) * TAU; b.box(stone, x + Math.cos(a) * (R2 - 0.3), yt + 1.1, z + Math.sin(a) * (R2 - 0.3), 1.5, 1.2, 0.8, Math.PI / 2 - a, col); } }
    }
    /** Wall plinth + string course + corbel table, replicating K.wall's segmentation. */
    function wallTrim(pts, { h, t, closed = false, plinth = M.stoneW, trim = M.trim, plinthH = 3.2 }) {
      const n = closed ? pts.length : pts.length - 1;
      for (let i = 0; i < n; i++) {
        const A = pts[i], B = pts[(i + 1) % pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz); if (len < 0.01) continue;
        const steps = Math.max(1, Math.ceil(len / 14)), ry = Math.atan2(-dz, dx);
        for (let s = 0; s < steps; s++) {
          const t0 = s / steps, t1 = (s + 1) / steps, x0 = A[0] + dx * t0, z0 = A[1] + dz * t0, x1 = A[0] + dx * t1, z1 = A[1] + dz * t1;
          const g = Math.min(H(x0, z0), H(x1, z1), H((x0 + x1) / 2, (z0 + z1) / 2)), top = Math.max(H(x0, z0), H(x1, z1)) + h, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sl = Math.hypot(x1 - x0, z1 - z0) + 0.6;
          b.box(plinth, cx, g - 3, cz, sl + 0.2, plinthH + 3, t + 1.8, ry, tint(rt, 0.15, 0.04));
          b.box(trim, cx, top - 1.0, cz, sl, 0.95, t + 1.0, ry);
          b.box(trim, cx, g + (top - g) * 0.52, cz, sl, 0.4, t + 0.4, ry);
        }
      }
    }
    /** Pitched hall with plinth, string course, ridge, chimney and lit gable windows. Returns chimney top. */
    const stacks = [];
    function hall(x, z, w, d, h, ry = 0, mat = M.stone, col = null) {
      const L = loc(x, z, ry); let y0 = 1e9, yb = -1e9;
      for (const [sx, sz] of [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const [px, pz] = L(sx * w / 2, sz * d / 2), hh = H(px, pz); y0 = Math.min(y0, hh); yb = Math.max(yb, hh); }
      const wc = col ?? tint(rt, 0.14, 0.05), rh = (d / 2 + 0.5) * 0.7;
      b.box(M.stoneW, x, y0 - 1.6, z, w + 0.5, yb - y0 + 3.2, d + 0.5, ry, tint(rt, 0.2, 0.04)); b.box(mat, x, y0 - 1.4, z, w, yb - y0 + h + 1.4, d, ry, wc);
      b.box(M.trim, x, yb + h - 0.5, z, w + 0.5, 0.5, d + 0.5, ry); b.prism(M.slate, x, yb + h, z, w + 1.0, rh, d + 1.0, ry, tint(rt, 0.2, 0.03)); b.box(M.slateD, x, yb + h + rh - 0.1, z, w + 1.1, 0.3, 0.5, ry);
      for (const sd of [-1, 1]) { const [px, pz] = L(w * 0.5 + 0.05, sd * d * 0.18); arch(b, M.win, px, yb + h * 0.4, pz, ry + Math.PI / 2, 0.9, 2.2, 0.12); for (const fx of [-0.3, 0.3]) { const [qx, qz] = L(w * fx, sd * (d / 2 + 0.06)); arch(b, M.win, qx, yb + h * 0.4, qz, ry + (sd < 0 ? Math.PI : 0), 0.9, 2.0, 0.12); } }
      const [cx, cz] = L(w * 0.28, d * 0.1); b.box(M.stoneD, cx, yb + h * 0.5, cz, 1.2, h * 0.5 + rh + 1.2, 1.2, ry); b.box(M.stoneD, cx, yb + h + rh + 0.7, cz, 1.6, 0.4, 1.6, ry); stacks.push([cx, yb + h + rh + 1.6, cz]);
    }

    // ---- curtain wall: very thick on the sea side, thinner on the land side ------------------------------------------------------
    const seaArc = []; for (let i = 0; i <= 14; i++) { const a = -Math.PI * 0.43 + (i / 14) * Math.PI * 0.86; seaArc.push([C[0] + Math.cos(a) * RX, C[1] + Math.sin(a) * RZ]); }
    const landArc = []; for (let i = 0; i <= 16; i++) { const a = Math.PI * 0.43 + (i / 16) * Math.PI * 1.14; landArc.push([C[0] + Math.cos(a) * RX, C[1] + Math.sin(a) * RZ]); }
    K.wall(b, seaArc, { h: 34, t: 20, mat: M.stone, capMat: M.stoneD, heightAt, closed: false, sink: 8, merlon: 1.7, color: 0xf0f0ec });
    wallTrim(seaArc, { h: 34, t: 20 });
    K.wall(b, landArc, { h: 27, t: 11, mat: M.stone, capMat: M.stoneD, heightAt, closed: false, sink: 8, merlon: 1.4, color: 0xf0f0ec });
    wallTrim(landArc, { h: 27, t: 11, plinthH: 2.6 });
    seaArc.forEach(([x, z], i) => { if (i % 3 === 0 && i > 0 && i < 14) drum(x, H(x, z), z, 7.2, 42, { seg: 12, col: tint(rt, 0.08, 0.04), rings: [0.5], slits: 2, lit: 0, taper: 0.9, roof: i % 6 === 0 ? 'cone' : 'flat', roofH: 13 }); });
    landArc.forEach(([x, z], i) => { if (i % 3 === 1) drum(x, H(x, z), z, 6, 34 + (i % 2) * 3, { seg: 12, col: tint(rt, 0.08, 0.04), rings: [0.55], slits: 2, lit: 1, taper: 0.9, roof: i % 2 ? 'cone' : 'flat', roofH: 11 }); });
    // gatehouse (landward, west): low, squat, thick; torches, lintel, dark tunnel, drawbridge ramp
    const gate = [C[0] - RX, C[1]], gyg = gy(gate[0], gate[1]), torches = [];
    K.gatehouse(b, gate[0], gate[1], { y: gyg, ry: Math.PI / 2, mat: M.stone, roofMat: M.slate, w: 26, d: 16, h: 30, gate: 7, wood: M.wood, towerR: 7, color: 0xf2f2ee });
    { const L = loc(gate[0], gate[1], Math.PI / 2), [bx, bz] = L(0, -3.2); b.box(M.dark, bx, gyg, bz, 6.6, 8.2, 0.3, Math.PI / 2); b.box(M.trim, gate[0], gyg + 8.2, gate[1], 8.6, 0.8, 16.6, Math.PI / 2); b.box(M.trim, gate[0], gyg + 29.2, gate[1], 26, 0.95, 16.8, Math.PI / 2);
      for (const sx of [-1, 1]) { const [px, pz] = L(sx * 5.2, -8.6); b.box(M.iron, px, gyg + 4.2, pz, 0.25, 0.9, 0.25, 0); b.box(M.lamp, px, gyg + 5.1, pz, 0.5, 0.6, 0.5, 0); torches.push([px, gyg + 6, pz]); } }
    b.box(M.wood, gate[0] - 16, gyg + 0.1, gate[1], 14, 0.6, 7, 0, 0xd8d0c4); for (const sz of [-1, 1]) b.box(M.woodD, gate[0] - 16, gyg + 0.7, gate[1] + sz * 3.4, 14, 0.5, 0.3);

    // ---- the Great Drum Tower: courses of weathered stone, buttress piers, spiral slits, corbelled crown with a beacon
    const ty = H(TW[0], TW[1]), rT = (t) => TR * (1 - 0.17 * t), NC = 15, chh = TH / NC;
    b.cyl(M.stoneW, TW[0], ty - 6, TW[1], TR + 10, 22, { top: (TR * 1.0) / (TR + 10), seg: 40, color: 0xe8e8e8 });                         // battered skirt
    b.cyl(M.trim, TW[0], ty + 15.4, TW[1], TR * 1.045, 0.8, { top: 1, seg: 40 });
    for (let i = 0; i < NC; i++) {
      const t0 = i / NC, t1 = (i + 1) / NC, wet = 0.84 + 0.16 * K.smoothstep(0.0, 0.45, t0), col = jit(0xc6c2b6, rt, 0.01, 0.04, 0.04).multiplyScalar(wet);
      b.cyl(M.stone, TW[0], ty + i * chh, TW[1], rT(t0), chh + 0.25, { top: rT(t1) / rT(t0), seg: 40, color: col, ry: i * 0.4 });
      if (i % 4 === 3 && i < NC - 1) b.cyl(M.trim, TW[0], ty + t1 * TH - 0.45, TW[1], rT(t1) * 1.04, 0.9, { top: 1, seg: 40 });
    }
    for (let k = 0; k < 14; k++) {          // radial pilasters rising from the skirt, in three steps
      const a = (k / 14) * TAU + 0.12, ry = Math.PI / 2 - a, col = tint(rt, 0.1, 0.03);
      for (const [tt, w, dp, hh] of [[0, 3.6, 4.4, 26], [0.16, 2.8, 2.6, 24], [0.34, 2.0, 1.7, 18]]) { const r0 = rT(tt) + dp / 2 - 0.4; b.box(M.stone, TW[0] + Math.cos(a) * r0, ty + (tt === 0 ? 9 : tt * TH), TW[1] + Math.sin(a) * r0, w, hh * (tt === 0 ? 1 : 1), dp, ry, col); }
    }
    for (let k = 0; k < 40; k++) { const a = k * 0.62 + 2.4, t = 0.12 + (k / 40) * 0.74, r = rT(t) + 0.05; b.box(M.dark, TW[0] + Math.cos(a) * r, ty + TH * t, TW[1] + Math.sin(a) * r, 0.36, 2.2, 0.16, Math.PI / 2 - a); }   // spiral slits
    for (let k = 0; k < 5; k++) for (const [lv, w, h] of [[0.34, 1.7, 3.8], [0.55, 1.6, 3.6], [0.74, 1.5, 3.4]]) { const a = Math.PI - 0.95 + k * 0.48; if (k % 2 && lv === 0.55) continue; const r = rT(lv) + 0.02; arch(b, M.win, TW[0] + Math.cos(a) * r, ty + TH * lv, TW[1] + Math.sin(a) * r, Math.PI / 2 - a, w, h, 0.18); b.box(M.trim, TW[0] + Math.cos(a) * (r + 0.1), ty + TH * lv + h, TW[1] + Math.sin(a) * (r + 0.1), w + 0.9, 0.4, 0.5, Math.PI / 2 - a); }
    for (let k = 0; k < 9; k++) for (const lv of [0.3, 0.5, 0.68, 0.84]) { if ((k + Math.round(lv * 10)) % 3 === 0) continue; const a = -0.95 + k * 0.24 + (lv > 0.6 ? 0.1 : 0), r = rT(lv) + 0.02; arch(b, M.win, TW[0] + Math.cos(a) * r, ty + TH * lv, TW[1] + Math.sin(a) * r, Math.PI / 2 - a, 0.8, 2.0, 0.14); }   // seaward lit lancets
    const yt = ty + TH, rtop = rT(1), RC = rtop * 1.2;
    b.cyl(M.trim, TW[0], yt - 3.4, TW[1], rtop * 1.02, 3.4, { top: 1.2, seg: 40 });                                                       // corbel flare
    for (let k = 0; k < 40; k++) { const a = (k / 40) * TAU; b.box(M.stoneD, TW[0] + Math.cos(a) * (rtop * 1.08), yt - 3.2, TW[1] + Math.sin(a) * (rtop * 1.08), 1.1, 2.6, 1.6, Math.PI / 2 - a); }
    b.cyl(M.stoneD, TW[0], yt, TW[1], RC, 1.4, { top: 1.0, seg: 40 });
    for (let i = 0; i < 44; i++) { const a = (i / 44) * TAU; b.box(M.stone, TW[0] + Math.cos(a) * (RC - 0.4), yt + 1.4, TW[1] + Math.sin(a) * (RC - 0.4), 3.2, 2.8, 1.5, Math.PI / 2 - a, tint(rt, 0.08, 0.02)); }
    b.cyl(M.stoneD, TW[0], yt + 1.4, TW[1], RC - 1.6, 0.8, { top: 1, seg: 36 });
    b.cyl(M.stone, TW[0], yt + 1.4, TW[1], rtop * 0.56, 14, { top: 0.92, seg: 28, color: 0xe6e6e2 });                                  // inner turret
    b.cyl(M.trim, TW[0], yt + 14.6, TW[1], rtop * 0.62, 1.2, { top: 1.0, seg: 28 });
    for (let i = 0; i < 20; i++) { const a = (i / 20) * TAU; b.box(M.stone, TW[0] + Math.cos(a) * (rtop * 0.6), yt + 15.8, TW[1] + Math.sin(a) * (rtop * 0.6), 2.0, 1.4, 1.0, Math.PI / 2 - a); }
    for (let k = 0; k < 6; k++) { const a = k * 1.05 + 0.4; arch(b, M.win, TW[0] + Math.cos(a) * rtop * 0.56 * 0.995, yt + 6, TW[1] + Math.sin(a) * rtop * 0.56 * 0.995, Math.PI / 2 - a, 1.2, 3.2, 0.2); }
    b.cyl(M.iron, TW[0], yt + 15.8, TW[1], 1.7, 1.2, { top: 1.3, seg: 8 }); b.cyl(M.beacon, TW[0], yt + 16.9, TW[1], 1.2, 0.5, { seg: 8 });  // beacon brazier
    { const rx = TW[0] + 8, rz = TW[1] - 6; b.cyl(M.stoneD, rx, yt + 2.2, rz, 4.6, 9, { top: 0.9, seg: 12 }); b.cone(M.slateD, rx, yt + 11, rz, 5.3, 8, { seg: 12 }); b.cyl(M.gold, rx, yt + 18.5, rz, 0.15, 3, { seg: 5, top: 0.5 }); }  // rookery turret
    for (let k = 0; k < 8; k++) { const a = k * 0.78 + 0.3; b.box(M.woodD, TW[0] + Math.cos(a) * RC * 0.99, yt + 3.6, TW[1] + Math.sin(a) * RC * 0.99, 0.5, 0.3, 4.2, Math.PI / 2 - a); }   // rafter stubs for hoardings

    // ---- bailey buildings, yard, well, stalls -------------------------------------------------------------------------------------
    hall(-8, -26, 26, 12, 10, 0); hall(-14, 24, 24, 12, 9, 0.1); hall(16, 38, 15, 10, 8, 0); hall(10, -38, 17, 10, 8, -0.1, M.stone, tint(rt, 0.1, 0.04)); hall(34, 26, 11, 9, 7, 0);
    for (let i = 0; i < 6; i++) { const sx = -2 + i * 3.4; b.box(M.wood, sx, gy(sx, 4), 4, 2.6, 2.4, 2.6, 0, tint(rt, 0.2, 0.05)); b.prism(M.thatch, sx, gy(sx, 4) + 2.4, 4, 3.0, 1.1, 3.0, 0, tint(rt, 0.2, 0.05)); }
    { const wy = gy(10, 0); b.cyl(M.stoneD, 10, wy, 0, 3.6, 1.6, { seg: 12 }); b.cyl(M.dark, 10, wy + 1.55, 0, 2.6, 0.1, { seg: 12 }); for (const sx of [-1, 1]) b.box(M.woodD, 10 + sx * 2.9, wy, 0, 0.3, 4.2, 0.3); b.box(M.woodD, 10, wy + 4.2, 0, 6.4, 0.3, 0.3); b.prism(M.slateD, 10, wy + 4.4, 0, 7, 1.5, 3.2, 0); }
    b.cyl(M.cobble, 10, gy(10, 0) - 0.2, 0, 22, 0.35, { seg: 24, color: 0xb8b2a4 });
    // road from gate to the world beyond, curving through the moors
    const road = K.smoothPath([[gate[0] - 8, gate[1]], [-90, 10], [-150, 30], [-210, 20], [-300, 40], [-380, 20]], 6);
    b.ribbon(M.cobble, road, 8.4, heightAt, 0.16, 0x6e6a5e); b.ribbon(M.cobble, road, 6, heightAt, 0.26, 0xb4ae9e);

    // ---- fishing hamlet on the low coast to the south: fieldstone and thatch, jetty, drying racks, a stone breakwater
    const hamP = K.scatter({ rng: K.rng(5), count: q.dens(34), bounds: [HAM[0] - 60, HAM[1] - 26, HAM[0] + 40, HAM[1] + 26], minDist: 12, accept: (x, z) => H(x, z) > 2.6 && H(x, z) < 14 });
    const vil = [], rv = K.rng(17);
    for (const [x, z] of hamP) {
      const w = rv.range(6.5, 10), d = rv.range(5, 7), h = rv.range(3.2, 4.4), ry = (rv() < 0.5 ? 0 : Math.PI / 2) + rv.range(-0.25, 0.25), y = H(x, z), L = loc(x, z, ry), wc = tint(rv, 0.18, 0.05), th = jit(0xb09a68, rv, 0.015, 0.1, 0.06);
      b.box(M.stone, x, y - 1.2, z, w, h + 1.2, d, ry, wc); b.box(M.plaster, x, y + h * 0.5, z, w + 0.06, h * 0.5, d + 0.06, ry, tint(rv, 0.1, 0.06));
      b.prism(M.thatch, x, y + h, z, w + 1.2, d * 0.62 + 0.5, d + 1.2, ry, th); b.box(M.woodD, x, y + h + d * 0.62 + 0.3, z, w + 1.3, 0.2, 0.45, ry);
      const [dx, dz] = L(w * rv.range(-0.25, 0.25), d / 2 + 0.05); b.box(M.woodD, dx, y, dz, 1.0, 1.9, 0.12, ry);
      if (rv() < 0.6) { const [wx, wz] = L(w * 0.3, -d / 2 - 0.05); b.box(M.win, wx, y + h * 0.4, wz, 0.8, 0.9, 0.1, ry + Math.PI); }
      if (rv() < 0.65) { const [cx, cz] = L(w * 0.3, 0); b.box(M.stoneD, cx, y + h * 0.5, cz, 0.9, h * 0.5 + d * 0.62 + 0.9, 0.9, ry); vil.push([cx, y + h + d * 0.62 + 1.8, cz]); }
      vil.push(null);
    }
    const hamS = vil.filter(Boolean);
    { const jy = 1.3; K.pier(b, 30, jy, HAM[1] - 2, { len: 34, w: 3.4, ry: 0, mat: M.wood, color: 0xd0c8b8 }); b.box(M.lamp, 63, jy + 0.5, HAM[1] - 3.5, 0.5, 0.6, 0.5); b.box(M.woodD, 63, jy, HAM[1] - 3.5, 0.2, 3, 0.2);
      for (let i = 0; i < 3; i++) { const rx = HAM[0] - 6 + i * 11, rz = HAM[1] + 18, ry = H(rx, rz); strut(b, M.woodD, [rx, ry, rz], [rx + 2.4, ry + 3.6, rz], 0.2); strut(b, M.woodD, [rx + 4.8, ry, rz], [rx + 2.4, ry + 3.6, rz], 0.2); b.box(M.woodD, rx + 2.4, ry + 3.1, rz, 0.15, 0.15, 3.2, 0); }   // net racks
      K.wall(b, [[24, HAM[1] - 14], [38, HAM[1] - 20], [54, HAM[1] - 22]], { h: 3.6, t: 4.4, mat: M.stoneD, capMat: M.stone, heightAt: () => 0, crenel: false, sink: 4 }); }

    // ---- sea-stacks, skerries and the ledge of fallen rock at the foot of the cliff
    const rr = K.rng(9), STK = [];
    for (let i = 0, n = 0; i < 90 && n < 22; i++) { const z = rr.range(-150, 170), x = cliffX(z) + rr.range(10, 66); if (H(x, z) > -3) continue; n++; STK.push([x, z, rr.range(2.2, 5.6), rr.range(11, 36)]); }
    STK.forEach(([x, z, r, h], k) => {
      const tiers = 5, tot = h + 14, R = (y) => r * (1.45 - 0.78 * (y + 14) / tot); let ox = 0, oz = 0;
      for (let t = 0; t < tiers; t++) {
        const y0 = -14 + (t * tot) / tiers, y1 = -14 + ((t + 1) * tot) / tiers, last = t === tiers - 1, col = jit(t < 1 ? 0x8a9292 : t === 1 ? 0xb4b8b4 : 0xdcdedc, rr, 0.01, 0.04, 0.06);
        if (!last) { ox += rr.range(-0.14, 0.14) * r; oz += rr.range(-0.14, 0.14) * r; } else { ox *= 0.4; oz *= 0.4; }
        b.cyl(t < 2 ? M.rockD : M.rock, x + ox, y0, z + oz, R(y0), y1 - y0 + 0.4, { top: R(y1) / R(y0) * (last ? 1.0 : 1.04), seg: 6 + (k % 3), color: col, ry: rr() * 3 });
      }
      b.cyl(M.kelp, x, -2.2, z, R(-2.2) * 1.03, 5.4, { top: R(3.2) / R(-2.2), seg: 9 });
      for (let i = 0; i < 4; i++) { const a = rr() * TAU, d = r * rr.range(0.9, 1.2); b.box(M.rockD, x + Math.cos(a) * d, rr.range(-2, h * 0.3), z + Math.sin(a) * d, rr.range(2, 4), rr.range(h * 0.2, h * 0.5), rr.range(2, 4), a, jit(0xffffff, rr, 0, 0, 0.04), rr.range(-0.12, 0.12), rr.range(-0.18, 0.18)); }
      b.cyl(M.rock, x, h - 1.0, z, R(h) * 1.02, 2.4, { top: 0.5, seg: 6 + (k % 3), color: 0xe6e8e4 });
    });
    for (let z = -160; z <= 190; z += 5) { // fallen blocks along the foot of the cliff
      let x = cliffX(z) + 40; while (x > cliffX(z) - 40 && H(x, z) < 0.5) x -= 1.5; if (H(x, z) < -6 || Math.abs(z) > 120 && rr() < 0.5) continue;
      for (let i = 0; i < 2; i++) b.box(M.rockD, x + rr.range(-4, 6), -1.2, z + rr.range(-3, 3), rr.range(2.6, 6), rr.range(2.5, 6.5), rr.range(2.6, 6), rr() * 3, jit(0xc8cac8, rr, 0, 0.02, 0.06), rr.range(-0.2, 0.2), rr.range(-0.25, 0.25));
    }
    // a wreck on the rocks (Shipbreaker Bay): rib frames, keel, snapped mast
    { const wx = 170, wz = 62, wy = -0.4, ry = 0.5, L = loc(wx, wz, ry), keel = [L(-9, 0), L(9, 0)];
      strut(b, M.woodD, [keel[0][0], wy, keel[0][1]], [keel[1][0], wy + 1.5, keel[1][1]], 0.5);
      for (let i = -4; i <= 4; i++) { if (i === 3) continue; const u = i / 4, wd = 3.4 * Math.sqrt(1 - u * u * 0.9), ht = (i % 2 ? 4.0 : 3.1) + (3 - Math.abs(i)) * 0.3; for (const sd of [-1, 1]) { let prev = L(i * 2.1, 0); let py = wy + 0.2; for (let s = 1; s <= 4; s++) { const f = s / 4, [px, pz] = L(i * 2.1, sd * wd * Math.sin(f * 1.4)); const yy = wy + 0.2 + ht * (1 - Math.cos(f * 1.3)) * 0.9; strut(b, M.woodD, [prev[0], py, prev[1]], [px, yy, pz], 0.28, 0xffffff, 0.36); prev = [px, pz]; py = yy; } } }
      const [mx, mz] = L(2, 0.4); strut(b, M.woodD, [mx, wy + 0.5, mz], [mx + 1.6, wy + 9, mz + 1.1], 0.4); }
    // arrow-slits in rows along the outer face of both curtain walls
    for (const [arc, t, hh] of [[seaArc, 20, 34], [landArc, 11, 27]]) for (let i = 0; i < arc.length - 1; i++) {
      const A = arc[i], B = arc[i + 1], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz), mx = (A[0] + B[0]) / 2, mz = (A[1] + B[1]) / 2; let nx = -dz / len, nz = dx / len; if (nx * (mx - C[0]) + nz * (mz - C[1]) < 0) { nx = -nx; nz = -nz; }
      const nc = Math.floor(len / 2.6); for (let k = 0; k < nc; k++) { const u = (k + 0.5) / nc - 0.5, px = mx + dx * u + nx * (t / 2 + 0.5), pz = mz + dz * u + nz * (t / 2 + 0.5), g = Math.max(H(px, pz), H(mx, mz)); b.box(M.stoneD, px, g + hh - 3.4, pz, 1.0, 2.4, 1.3, Math.atan2(-nz, nx) + Math.PI / 2); }   // corbel table under the parapet
      const n = Math.floor(len / 7); for (let k = 0; k < n; k++) { const u = (k + 0.5) / n - 0.5, px = mx + dx * u + nx * (t / 2 + 0.9), pz = mz + dz * u + nz * (t / 2 + 0.9), g = H(px, pz); for (const f of [0.62, 0.84]) if (f === 0.62 || k % 2) b.box((k + i) % 4 === 0 ? M.win : M.dark, px, Math.max(g, H(mx, mz)) + hh * f - 1.4, pz, 0.45, 2.6, 0.25, Math.atan2(-nz, nx) + Math.PI / 2); }
    }
    root.add(b.build({}));

    // ---- breaker line along the foot of the cliff + pulsing rings round every stack
    { const pts = []; for (let z = -150; z <= 150; z += 6) { let x = cliffX(z) + 40; while (x > cliffX(z) - 60 && H(x, z) < 0.2) x -= 1; pts.push([x + 2, z]); }
      const fb = new Batch(), fm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false, vertexColors: true, fog: true, blending: THREE.AdditiveBlending });
      fb.ribbon(fm, pts, 11, () => 0.28, 0.0, 0x9aa8a8); const fg = fb.build({ shadow: false }); fg.traverse((o) => { if (o.isMesh) o.renderOrder = 3; }); root.add(fg);
      ctx.onUpdate((dt, t) => { const nt = K.clamp((M.win.color.r / M.win.userData.base.r - 0.14) / 1.25, 0, 1); fm.opacity = (0.34 + 0.2 * Math.sin(t * 1.3) + 0.1 * Math.sin(t * 2.9)) * (1 - 0.8 * nt); }); }
    foamRings(ctx, STK.map(([x, z, r]) => [x, z, r * 1.45]), { y: 0.35, width: 2.6, opacity: 0.34, speed: 1.1, dim: () => 1 - 0.8 * K.clamp((M.win.color.r / M.win.userData.base.r - 0.14) / 1.25, 0, 1) });
    root.add(K.smoke(STK.slice(0, 10).flatMap(([x, z, r]) => [[x + r, 1, z + r * 0.4], [x - r, 1, z - r * 0.4]]), { color: 0xeef2f4, size: 24, rise: 9, opacity: 0.26, perStack: 3, spread: 5 }));

    // ---- Kingswood to the north-west, hedge-oaks along the road, windblown birch on the headland ---------------------------------------------
    // muted, rain-soaked woods (jittered greens; instanced, one call per part)
    const TRs = { trunk: new Inst(G.cyl(5, 0.7), T('wood', 0xffffff, 3)), A: new Inst(G.sphere(6), T('grass', 0xffffff, 3, { rough: 1 })), B: new Inst(G.sphere(6), T('grass', 0xffffff, 3, { rough: 1 })) };
    const trees = ({ rng, count, bounds, avoid, minDist = 6, scale = [0.9, 1.5], greens }) => { for (const [x, z] of K.scatter({ rng, count, bounds, minDist, avoid })) { const k = rng.range(scale[0], scale[1]), y = H(x, z), gc = jit(rng.pick(greens), rng, 0.02, 0.08, 0.04);
      TRs.trunk.add(x, y, z, 0.5 * k, 3.4 * k, 0.5 * k, 0, jit(0x5a4634, rng, 0.01, 0.05, 0.04)); TRs.A.add(x, y + 2.6 * k, z, 2.8 * k, 2.5 * k, 2.8 * k, rng() * 6, gc); if (rng() < 0.22) TRs.B.add(x + rng.range(-1.2, 1.2) * k, y + 3.9 * k, z + rng.range(-1.2, 1.2) * k, 1.8 * k, 1.7 * k, 1.8 * k, 0, jit(rng.pick(greens), rng, 0.02, 0.08, 0.06)); } };
    const oaks = [0x3f5f33, 0x4a6a38, 0x365530, 0x5a7038, 0x6a6a3c];
    trees({ rng: K.rng(61), count: q.dens(460), bounds: [-640, -560, -80, -60], greens: oaks, avoid: (x, z) => H(x, z) < 3 || z > -90 && x > -280, minDist: 5.5 });
    trees({ rng: K.rng(62), count: q.dens(150), bounds: [-420, 80, -80, 330], greens: [0x6a7a3c, 0x5a6e38, 0x7a7a40], scale: [0.7, 1.1], avoid: (x, z) => H(x, z) < 3 || Math.hypot(x - HAM[0], z - HAM[1]) < 50, minDist: 8 });
    trees({ rng: K.rng(63), count: q.dens(110), bounds: [-300, -130, 0, 130], greens: oaks, avoid: (x, z) => H(x, z) < 3 || K.distToPolyline(x, z, road).d < 12 || Math.hypot(x - C[0], z) < 96, minDist: 9 });
    for (const i of Object.values(TRs)) if (i.items.length) root.add(i.build());

    // ---- lanterns, banner poles ------------------------------------------------------------------------------------------------------------
    const lan = new Inst(G.box(), M.lamp), post = new Inst(G.cyl(5, 1), M.woodD);
    for (let i = 3; i < 16; i += 3) { const [x, z] = road[i], o = (i % 2 ? 1 : -1) * 4.8; post.add(x, H(x + o, z), z, 0.18, 3.2, 0.18); lan.add(x, H(x + o, z) + 3.2, z, 0.5, 0.7, 0.5); }
    for (const [x, y, z] of [[HAM[0] + 4, H(HAM[0] + 4, HAM[1] + 8), HAM[1] + 8], [HAM[0] - 24, H(HAM[0] - 24, HAM[1] - 6), HAM[1] - 6]]) { post.add(x, y, z, 0.18, 3, 0.18); lan.add(x, y + 3, z, 0.5, 0.7, 0.5); }
    const bn = [[TW[0], yt + 24, TW[1] + 0.001], [TW[0] + 8, yt + 21, TW[1] - 6], [TW[0] - 8, yt + 2, TW[1] + RC * 0.7], [gate[0], gyg + 36, gate[1] + 10], [C[0] + RX - 6, gy(C[0] + RX - 6, 0) + 40, 8]];
    root.add(K.banners(bn.map(([x, y, z], i) => ({ x, y, z, w: 4.2, h: 9.5, color: i % 2 ? 0x15151a : 0xe0b020, ry: i * 0.8 })), { pole: false }));
    for (const [x, y, z] of bn) post.add(x, y - 9.7, z, 0.24, 10.8, 0.24);
    root.add(lan.build(), post.build());

    // ---- life: smoke, fires, ravens, gulls, ships, lightning --------------------------------------------------------------------------------------
    root.add(K.smoke([...stacks, ...hamS], { size: 18, rise: 18, opacity: 0.28, perStack: 4, color: 0xaaa6a0 }));
    const fires = K.fires([[gate[0] + 0, gyg + 6, gate[1] + 8], ...torches.slice(0, 1), [TW[0], yt + 19, TW[1]], [HAM[0] + 4, 8, HAM[1] + 6]], { size: 10, light: q.low ? 0 : 3, intensity: 90 }); root.add(fires); ctx.onUpdate((dt, t) => fires.userData.update(t));
    root.add(K.fires([...torches, [63, 3.4, HAM[1] - 3.5], [C[0] + RX - 8, gy(C[0] + RX - 8, 0) + 36, 0]], { size: 5 }));
    const wk = K.walkers({ paths: [[[gate[0] - 8, gate[1]], [-6, 0], [30, 6]], road.slice(0, 20), [[HAM[0] - 20, HAM[1] - 2], [HAM[0], HAM[1] + 4], [28, HAM[1] - 2]]], heightAt, count: q.dens(26), rng: K.rng(5), colors: [0x4d5a6a, 0x6a5a3a, 0x5a2a20, 0x6a6a6a] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    for (const [cx, cy, cz, R, n, s, col, sz] of [[TW[0] + 28, 100, TW[1], 60, 8, 3, 0xe8e8e4, 1.5], [TW[0], TW[1] + 116, TW[1], 28, 8, 4, 0x15151a, 1.5], [180, 34, 90, 80, 8, 5, 0xe8e8e4, 1.5]]) { const g = K.birds({ center: [cx, cy, cz], radius: R, count: q.dens(n), color: col, size: sz, spreadY: 12, seed: s, speed: 0.2 }); root.add(g); ctx.onUpdate((dt, t) => g.userData.update(t)); }
    const clouds = K.clouds({ y: 190, extent: 700, count: 14, opacity: 0.62, color: 0x70767e }); root.add(clouds); ctx.onUpdate((dt) => clouds.userData.update(dt));
    // lofted ships
    function makeShip(type, len, hullHex, sailHex, seed) {
      const g = new THREE.Group(), sb = new Batch(), r = K.rng(seed), beamH = len * (type === 'barge' ? 0.14 : 0.15), Dp = len * 0.09, N = 10, J = 6, pos = [], idx = [], rowN = 2 * J + 1;
      for (let i = 0; i <= N; i++) { const u = i / N, e = Math.abs(2 * u - 1), bf = Math.pow(Math.sin(Math.PI * (0.05 + 0.9 * u)), 0.5) * (1 - K.smoothstep(0.62, 1, u) * 0.92), x = (u - 0.5) * len, keel = -Dp * 0.35 + Dp * 0.25 * e * e, top = Dp * 0.62 + len * 0.045 * e * e * (type === 'barge' ? 0.3 : 1);
        for (let j = 0; j < rowN; j++) { const f = ((j / (rowN - 1)) * 2 - 1) * Math.PI / 2; pos.push(x, keel + (top - keel) * (1 - Math.cos(f)), beamH * bf * Math.sin(f)); } }
      for (let i = 0; i < N; i++) for (let j = 0; j < rowN - 1; j++) { const a = i * rowN + j, bI = a + 1, cI = a + rowN, dI = cI + 1; idx.push(a, cI, bI, bI, cI, dI); }
      const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setIndex(idx); hg.computeVertexNormals(); sb.addGeometry(M.hullW, hg, new THREE.Matrix4(), hullHex);
      const top0 = Dp * 0.62; sb.box(M.hullW, -len * 0.5, -Dp * 0.1, 0, 0.5, top0 + Dp * 0.1 + len * 0.045, beamH * 0.8, 0, hullHex); sb.box(M.hullW, 0, top0 - 0.55, 0, len * 0.72, 0.18, beamH * 1.5, 0, 0xe6cda4);
      if (type !== 'barge') { sb.box(M.hullW, -len * 0.36, top0 - 0.5, 0, len * 0.22, 1.9, beamH * 1.5, 0, hullHex); sb.box(M.hullW, len * 0.4, top0 - 0.5, 0, len * 0.1, 1.0, beamH * 0.9, 0, hullHex); }
      const sails = [], masts = type === 'galley' ? 2 : 1;
      for (let m = 0; m < masts; m++) { const mx = masts === 1 ? len * 0.04 : (m ? -len * 0.2 : len * 0.2), mh = len * (type === 'barge' ? 0.62 : 0.82); sb.cyl(M.hullW, mx, top0 - 0.5, 0, 0.2 + len * 0.004, mh, { seg: 6, top: 0.7, color: 0x6a5240 });
        const yw = top0 + mh * 0.8, sw = beamH * (type === 'galley' ? 2.3 : 2.9), sh = mh * 0.55; sb.box(M.hullW, mx, yw, 0, 0.18, 0.18, sw * 1.12, 0, 0x6a5240);
        const sg = new THREE.PlaneGeometry(sw, sh, 6, 4), sm = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: sailHex, roughness: 1, side: THREE.DoubleSide }));
        sm.position.set(mx + 0.15, yw - sh / 2, 0); sm.rotation.y = Math.PI / 2; sm.castShadow = true; sm.userData.base = Float32Array.from(sg.attributes.position.array); sm.userData.hw = sw / 2; sm.userData.hh = sh / 2; sm.userData.ph = r() * 6; sails.push(sm); g.add(sm);
        strut(sb, M.hullW, [mx, top0 + mh * 0.97, 0], [len * 0.47, top0 + 0.6, 0], 0.07, 0x4a3a2e); strut(sb, M.hullW, [mx, top0 + mh * 0.97, 0], [-len * 0.48, top0 + 1.6, 0], 0.07, 0x4a3a2e); }
      g.add(sb.build()); g.userData.sl = sails; return g;
    }
    function animSails(s, t, ph, amp = 1) {
      s.rotation.z = Math.sin(t * 0.9 + ph) * 0.025 * amp; s.rotation.x = Math.sin(t * 0.7 + ph * 1.3) * 0.02 * amp;
      for (const sm of s.userData.sl) { const pos = sm.geometry.attributes.position, bs = sm.userData.base, hw = sm.userData.hw, hh = sm.userData.hh, p2 = sm.userData.ph + ph; for (let i = 0; i < pos.count; i++) { const nx = bs[i * 3] / hw, ny = bs[i * 3 + 1] / hh; pos.setZ(i, (1 - nx * nx) * (0.55 + 0.45 * (ny * 0.5 + 0.5)) * hw * 0.32 * (0.8 + 0.2 * Math.sin(t * 1.3 + p2 + ny * 1.4))); } pos.needsUpdate = true; }
    }
    const ships = [];
    const addShip = (type, len, hull, sail, x, z, ry, mv) => { const s = makeShip(type, len, hull, sail, ships.length + 4); s.position.set(x, 0.3, z); s.rotation.y = ry; root.add(s); ships.push({ s, mv, ph: ships.length * 1.9 }); };
    addShip('cog', 30, 0x4a3524, 0xc9c1a8, 330, 40, 0.6, { cx: 380, cz: 40, R: 70, sp: 0.007 }); addShip('galley', 34, 0x2a2a2e, 0xe0b020, 300, -120, 1.0, { cx: 330, cz: -120, R: 60, sp: -0.006 });
    addShip('cog', 18, 0x4a3524, 0xb8b0a0, 76, HAM[1] - 6, 0, null); addShip('barge', 11, 0x4a3a2a, 0xc8bfa5, 66, HAM[1] + 6, 0.3, null);
    ctx.onUpdate((dt, t) => { for (const o of ships) { const m = o.mv; if (m) { const a = t * m.sp * 2 + 1; o.s.position.set(m.cx + Math.cos(a) * m.R, 0.3 + Math.sin(t * 1.1 + o.ph) * 0.25, m.cz + Math.sin(a) * m.R); o.s.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)) + (m.sp < 0 ? Math.PI : 0); } else o.s.position.y = 0.3 + Math.sin(t * 0.9 + o.ph) * 0.12; animSails(o.s, t, o.ph, m ? 2.2 : 1); } });
    // lightning over Shipbreaker Bay: a branching bolt and a cold flash on the tower
    if (!q.low) {
      const fl = new THREE.PointLight(0xaec4ff, 0, 900, 1.1); fl.position.set(210, 160, 20); root.add(fl);
      const pts = [], rb = K.rng(3); let bx = 0, bz = 0, by = 230; const seg = (x0, y0, z0, x1, y1, z1) => pts.push(x0, y0, z0, x1, y1, z1);
      for (let i = 0; i < 14; i++) { const ny = by - 16, nx = bx + rb.range(-9, 9), nz = bz + rb.range(-9, 9); seg(bx, by, bz, nx, ny, nz); if (i % 4 === 2) { let px = nx, py = ny, pz = nz; for (let k = 0; k < 4; k++) { const mx = px + rb.range(2, 10), my = py - 9, mz = pz + rb.range(-6, 6); seg(px, py, pz, mx, my, mz); px = mx; py = my; pz = mz; } } bx = nx; by = ny; bz = nz; }
      const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const bm = new THREE.LineBasicMaterial({ color: 0xd8e4ff, transparent: true, opacity: 0, fog: false, depthWrite: false, blending: THREE.AdditiveBlending }), bolt = new THREE.LineSegments(bg, bm); bolt.frustumCulled = false; bolt.renderOrder = 7; root.add(bolt);
      ctx.onUpdate((dt, t) => {
        const P = 11, u = t % P, n = Math.floor(t / P), v = u < 0.07 ? 1 : u < 0.14 ? 0.15 : u < 0.22 ? 0.9 : u < 0.5 ? 0.5 * (1 - (u - 0.22) / 0.28) : 0;
        fl.intensity = v * 6000; bm.opacity = u < 0.24 ? v : 0; if (u < 0.01) bolt.position.set(150 + ((n * 97) % 170), 0, -140 + ((n * 61) % 280));
      });
    }

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 300, center: [30, 20, 0], minDistance: 25,
      hero: { pos: [236, 78, 150], target: [66, 62, 0] },
      climate: { atmos: 'day', weather: 'rain', tint: {
        dawn: { top: 0x3a4666, horizon: 0xc79a8e, fog: 0x8a8592, fogD: 0.0019, sunC: 0xffb08a, sunI: 2.0, hemiSky: 0x8a93b0, hemiGround: 0x3e3a3a, hemiI: 0.9 },
        day: { top: 0x4a5866, horizon: 0x929da6, fog: 0x838e97, fogD: 0.0013, sunC: 0xe8ecec, sunI: 2.3, elev: 0.4, hemiSky: 0xa4b2be, hemiGround: 0x4a5444, hemiI: 1.55 },
        dusk: { top: 0x1f2845, horizon: 0xb4705e, fog: 0x6e5f6c, fogD: 0.0019, sunC: 0xff8a5a, sunI: 2.6, hemiSky: 0x7f92c0, hemiGround: 0x3e4048, hemiI: 1.35 },
        night: { top: 0x050914, horizon: 0x1d2b44, fog: 0x16223a, fogD: 0.0022, sunC: 0x93acdc, sunI: 1.3, elev: 0.5, hemiSky: 0x5a70a6, hemiGround: 0x20282e, hemiI: 1.55, exposure: 1.2 },
      } },
      landmarks: {
        'great-drum-tower': lm(TW[0], TW[1], 40, TH + 10), 'seaward-wall': lm(C[0] + RX - 6, 0, 24, 46), 'landward-wall': lm(C[0] - 40, -RZ + 8, 26, 38), 'gatehouse': lm(gate[0], gate[1], 16, 38),
        'bailey': lm(10, 4, 24, 16), 'seaward-cliff': lm(cliffX(40) - 4, 40, 30, 2), 'shipbreaker-bay': lm(260, 40, 60, 6), 'kingswood-edge': lm(-330, -190, 50, 24),
        'fishing-hamlet': lm(HAM[0], HAM[1], 36, 8), 'rookery': lm(TW[0] + 8, TW[1] - 6, 10, TH + 26),
      },
    };
  },
};
