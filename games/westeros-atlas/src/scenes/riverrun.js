// Riverrun — book anchors: Tully seat on a triangle of land where the Tumblestone meets the Red Fork; water on two sides, a man-made
// ditch (floodable) on the third; red stone walls; a Water Gate; a Wheel Tower; triangular keep, Great Hall, sept, godswood. Positions interpretive.
//
// Visual language: warm rose-red sandstone with buff trim and pale strata, dark blue-slate roofs, a sunlit green valley of fields and
// orchards, two bright rivers meeting at the castle's prow, a great timber water wheel, red-leafed weirwood in the godswood.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G: GG, tri, flat, glow } = K;

const TAU = Math.PI * 2;
const A = [-78, -50], Bc = [-78, 50], C = [92, 0];
const TUM = [[-420, -240], [-260, -168], [-130, -110], [-84, -74], [0, -48], [60, -30], [112, -12], [142, 0]];
const RED = TUM.map(([x, z]) => [x, -z]);
const EAST = [[142, 0], [260, 4], [420, 28], [620, 70]];
const MOAT = [[-90, -76], [-90, 0], [-90, 76]];

const jit = (hex, r, dh = 0.012, ds = 0.05, dl = 0.03) => new THREE.Color(hex).offsetHSL((r() - 0.5) * 2 * dh, (r() - 0.5) * 2 * ds, (r() - 0.5) * 2 * dl);
const tint = (r, v = 0.12, w = 0.05) => { const k = 1 - v * r(); return new THREE.Color(k, k * (1 - w * r()), k * (1 - w * r() * 1.5)); };
const _up = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _d = new THREE.Vector3(), _e = new THREE.Euler();
function strut(b, mat, p, q, w, color = 0xffffff, d = w) {
  _d.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); const len = _d.length(); if (len < 1e-3) return;
  _q.setFromUnitVectors(_up, _d.multiplyScalar(1 / len)); _m.compose(_p.set(p[0], p[1], p[2]), _q, _s.set(w, len, d));
  b.addGeometry(mat, GG.box(), _m, color);
}
const archCache = new Map();
function archGeo(w, h, depth) {
  const k = `${w}|${h}|${depth}`; let g = archCache.get(k); if (g) return g;
  const r = w / 2, s = new THREE.Shape(); s.moveTo(-r, 0); s.lineTo(-r, h - r); s.absarc(0, h - r, r, Math.PI, 0, true); s.lineTo(r, 0); s.closePath();
  g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 }); archCache.set(k, g); return g;
}
function arch(b, mat, x, y, z, ry, w, h, depth = 0.25, color = 0xffffff) {
  _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(1, 1, 1)); b.addGeometry(mat, archGeo(w, h, depth), _m, color);
}
const ringCache = new Map();
function ringGeo(w, h, th, depth) {
  const k = `${w}|${h}|${th}|${depth}`; let g = ringCache.get(k); if (g) return g;
  const r = w / 2, s = new THREE.Shape(); s.moveTo(-r - th, 0); s.lineTo(-r - th, h - r); s.absarc(0, h - r, r + th, Math.PI, 0, true); s.lineTo(r + th, 0); s.closePath();
  const hole = new THREE.Path(); hole.moveTo(-r, 0); hole.lineTo(-r, h - r); hole.absarc(0, h - r, r, Math.PI, 0, true); hole.lineTo(r, 0); hole.closePath(); s.holes.push(hole);
  g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 }); ringCache.set(k, g); return g;
}
function ring(b, mat, x, y, z, ry, w, h, th = 0.5, depth = 0.4, color = 0xffffff) {
  _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(1, 1, 1)); b.addGeometry(mat, ringGeo(w, h, th, depth), _m, color);
}
const loc = (cx, cz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c]; };
/** soft blob with true centre semantics (non-uniform) */
function blob(b, mat, cx, cy, cz, rx, ry_, rz, color = 0xffffff, rot = 0) {
  _m.compose(_p.set(cx, cy - ry_, cz), _q.setFromEuler(_e.set(0, rot, 0)), _s.set(rx, ry_, rz)); b.addGeometry(mat, GG.sphere(8), _m, color);
}

/** Smooth-hulled little ship (hull length along X) with a billowing sail; shared look with Harrenhal's boats. */
function makeShip(hullMat, type, len, hullHex, sailHex, seed) {
  const g = new THREE.Group(), sb = new Batch(), r = K.rng(seed), beamH = len * (type === 'barge' ? 0.14 : 0.15), Dp = len * 0.09;
  const N = 10, J = 6, pos = [], idx = [], rowN = 2 * J + 1;
  for (let i = 0; i <= N; i++) {
    const u = i / N, e = Math.abs(2 * u - 1), bf = Math.pow(Math.sin(Math.PI * (0.05 + 0.9 * u)), 0.5) * (1 - K.smoothstep(0.62, 1, u) * 0.92), x = (u - 0.5) * len;
    const keel = -Dp * 0.35 + Dp * 0.25 * e * e, top = Dp * 0.62 + len * 0.045 * e * e * (type === 'barge' ? 0.3 : 1);
    for (let j = 0; j < rowN; j++) { const f = ((j / (rowN - 1)) * 2 - 1) * Math.PI / 2; pos.push(x, keel + (top - keel) * (1 - Math.cos(f)), beamH * bf * Math.sin(f)); }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < rowN - 1; j++) { const a = i * rowN + j, bI = a + 1, cI = a + rowN, dI = cI + 1; idx.push(a, cI, bI, bI, cI, dI); }
  const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setIndex(idx); hg.computeVertexNormals();
  sb.addGeometry(hullMat, hg, new THREE.Matrix4(), hullHex);
  const top0 = Dp * 0.62;
  sb.box(hullMat, -len * 0.5, -Dp * 0.1, 0, 0.4, top0 + Dp * 0.1 + len * 0.045, beamH * 0.8, 0, hullHex); sb.box(hullMat, 0, top0 - 0.55, 0, len * 0.72, 0.18, beamH * 1.5, 0, 0xe6cda4);
  if (type !== 'barge') sb.box(hullMat, -len * 0.36, top0 - 0.5, 0, len * 0.22, 1.6, beamH * 1.5, 0, hullHex);
  const mx = len * 0.04, mh = len * (type === 'barge' ? 0.7 : 0.85), yw = top0 + mh * 0.8, sw = beamH * 2.9, sh = mh * 0.55;
  sb.cyl(hullMat, mx, top0 - 0.5, 0, 0.2, mh, { seg: 6, top: 0.7, color: 0x6a5240 }); sb.box(hullMat, mx, yw, 0, 0.16, 0.16, sw * 1.12, 0, 0x6a5240);
  const sg = new THREE.PlaneGeometry(sw, sh, 6, 4), sm = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: sailHex, roughness: 1, side: THREE.DoubleSide }));
  sm.position.set(mx + 0.15, yw - sh / 2, 0); sm.rotation.y = Math.PI / 2; sm.castShadow = true; sm.userData.base = Float32Array.from(sg.attributes.position.array); sm.userData.hw = sw / 2; sm.userData.hh = sh / 2; sm.userData.ph = r() * 6; g.add(sm);
  strut(sb, hullMat, [mx, top0 + mh * 0.97, 0], [len * 0.47, top0 + 0.6, 0], 0.06, 0x4a3a2e); strut(sb, hullMat, [mx, top0 + mh * 0.97, 0], [-len * 0.48, top0 + 1.4, 0], 0.06, 0x4a3a2e);
  g.add(sb.build()); g.userData.sl = [sm]; return g;
}
function animSails(s, t, ph) {
  s.rotation.z = Math.sin(t * 0.9 + ph) * 0.025; s.rotation.x = Math.sin(t * 0.7 + ph * 1.3) * 0.02;
  for (const sm of s.userData.sl) {
    const pos = sm.geometry.attributes.position, bs = sm.userData.base, hw = sm.userData.hw, hh = sm.userData.hh, p2 = sm.userData.ph + ph;
    for (let i = 0; i < pos.count; i++) { const nx = bs[i * 3] / hw, ny = bs[i * 3 + 1] / hh; pos.setZ(i, (1 - nx * nx) * (0.55 + 0.45 * (ny * 0.5 + 0.5)) * hw * 0.3 * (0.8 + 0.2 * Math.sin(t * 1.3 + p2 + ny * 1.4))); }
    pos.needsUpdate = true;
  }
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, Gd = 6;
    const rivers = [[TUM, 19], [RED, 19], [EAST, 24], [MOAT, 7.5]];
    const tri3 = [A, Bc, C];
    const heightAt = (x, z) => {
      const dc = Math.hypot(x - 10, z);
      let h = 6 + (K.fbm(x * 0.008, z * 0.008, 3, 4) - 0.5) * 22 * K.smoothstep(130, 330, dc) + (K.fbm(x * 0.03, z * 0.03, 2, 8) - 0.5) * 1.4 * K.smoothstep(70, 160, dc);
      h += K.smoothstep(380, 620, dc) * (30 + (0.5 + K.fbm(x * 0.005 + 4, z * 0.005, 4, 2)) * 56);
      for (const [pl, hw] of rivers) { const d = K.distToPolyline(x, z, pl).d; const wide = hw * 1.25 + Math.max(0, h - 10) * 1.2; const f = 1 - K.smoothstep(hw * 0.55, wide, d); if (f > 0) h = h * (1 - f) + -4.5 * f; }
      // the castle plateau, with the two river sides carved hard against the walls so the red stone rises straight out of the water
      if (K.pointInPoly(x, z, tri3)) h = Gd;
      else { const de = K.distToPolyline(x, z, [A, C, Bc]).d; if (x > -80) { const f = 1 - K.smoothstep(6, 14, de); if (f > 0) h = h * (1 - f) + -4.5 * f; } }
      return h;
    };
    const H = heightAt;
    const grass = new THREE.Color(0x6e9244), crop = new THREE.Color(0xc2b050), crop2 = new THREE.Color(0x8aa04c), dry = new THREE.Color(0x92924f), bank = new THREE.Color(0x7d7452), hillC = new THREE.Color(0x5a7242), rockC = new THREE.Color(0x77735f), paved = new THREE.Color(0x8d8372), c = new THREE.Color();
    root.add(K.terrain({ size: 1400, seg: q.seg(190), heightAt, kind: 'grass', scale: 12, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.012, z * 0.012, 3, 5), dcs = Math.hypot(x - 10, z);
      c.copy(grass).lerp(dry, K.clamp(n * 1.2 - 0.3, 0, 0.7));
      const f = K.fbm(x * 0.03, z * 0.03, 2, 11), f2 = Math.sin((x * 0.5 + z * 0.3) * 0.5 + f * 6) * 0.5 + 0.5;
      if (f > 0.52 && dcs > 140 && h < 30) c.lerp(f2 > 0.5 ? crop : crop2, K.smoothstep(0.52, 0.6, f) * 0.75);
      if (h > 26) c.lerp(hillC, K.smoothstep(26, 60, h) * 0.8); if (h > 50) c.lerp(rockC, K.clamp(s * 2.5, 0, 0.6));
      if (h < 1.3) c.lerp(bank, 0.7);
      if (K.pointInPoly(x, z, [[-88, -60], [-88, 60], [102, 0]])) c.lerp(paved, 0.8);
      return c;
    } }));
    const wat = K.water({ w: 1100, d: 560, seg: q.seg(150), center: [100, 0], level: 0, heightAt, deep: 0x1f4a52, shallow: 0x6a9c8c, opacity: 0.9, choppy: 0.5, speed: 0.7 });
    root.add(wat); ctx.registerWater(wat);

    const T = (k, color, scale = 8, o = {}) => tri(k, { color, scale, ...o });
    const M = {
      red: T('stone', 0xefb99c, 9, { rough: 0.88 }), redD: T('stone', 0xc98a70, 7), trim: T('stone', 0xf4e2c8, 6), wet: T('stone', 0xa89888, 8, { rough: 0.5 }),
      slate: T('slate', 0x9aa6bc, 5, { rough: 0.6, metal: 0.05 }), slateD: T('slate', 0x7a859a, 5), tile: T('tile', 0xd49a80, 5),
      wood: T('wood', 0x9a7a54, 4, { snow: false }), woodD: T('wood', 0x5a4632, 4, { snow: false }), woodL: T('wood', 0xc0a074, 3, { snow: false }), cobble: T('cobble', 0xcfc2ad, 8), plaster: T('plaster', 0xeee2c8, 6), thatch: T('thatch', 0xd6c07e, 5),
      iron: flat(0x2c2d30, { metal: 0.6, rough: 0.5 }), dark: flat(0x0b0a09, { rough: 1 }), door: flat(0x3a2a1c, { rough: 0.9 }),
      win: glow(0xffc46b, 1.2), lamp: glow(0xffb45a, 1.5),
      leaf: T('grass', 0xffffff, 3, { rough: 1, snow: false }), bark: T('wood', 0xffffff, 3, { snow: false }), barkW: T('plaster', 0xf0e9db, 4, { snow: false }), hay: T('thatch', 0xe0c870, 3, { snow: false }), reed: flat(0xffffff, { rough: 1, flatShading: false }),
    };
    const stained = [0xd84a3a, 0x3a6ad8, 0x4aa85a, 0xe0b038, 0x9a4ac8, 0xe07a30, 0x38b0c0].map((h) => glow(h, 1.1));
    const b = new Batch(), rt = K.rng(808), lampPts = [], chim = [];
    const SLATE = 0x6f7f9e, SLATE2 = 0x8493b0;

    // ---- builders --------------------------------------------------------------------------------------------------------------
    function drum(x, z, o = {}) {
      const { r = 6.5, h = 32, y = Gd, seg = 12, roofH = 12, taper = 0.9, windows = 3, mat = M.red, roof = 'cone' } = o, R = rt, col = tint(R, 0.1, 0.06);
      const rA = (t) => r * (1 - (1 - taper) * t);
      b.cyl(M.wet, x, y - 12, z, r * 1.2, 13, { top: 0.96, seg, color: 0xd8c8b8 });
      b.cyl(M.redD, x, y - 1, z, r * 1.14, 5.6, { top: 0.9, seg, color: col });
      b.cyl(mat, x, y, z, r, h, { top: taper, seg, color: col });
      for (const t of [0.28, 0.6]) b.cyl(M.trim, x, y + t * h - 0.3, z, rA(t) * 1.04, 0.6, { top: 1, seg, color: 0xf0e0cc });
      for (let k = 0; k < windows; k++) { const a = k * 2.1 + x * 0.37, t = 0.25 + 0.17 * k, rad = rA(t) + 0.04, lit = (k + Math.round(x)) % 3 !== 1; arch(b, lit ? M.win : M.dark, x + Math.cos(a) * rad, y + h * t, z + Math.sin(a) * rad, Math.PI / 2 - a, 0.9, 2.8, 0.2); }
      const yt = y + h, rr = rA(1);
      b.cyl(M.trim, x, yt - 0.4, z, rr * 1.03, 1.6, { top: 1.22, seg, color: 0xf0e0cc });
      b.cyl(M.redD, x, yt + 1.2, z, rr * 1.25, 1.2, { top: 1.0, seg, color: col });
      const n = Math.max(8, Math.round((TAU * rr * 1.25) / 2.6));
      if (roof === 'cone') {
        for (let i = 0; i < n; i++) { const a = (i / n) * TAU; if (i % 2) arch(b, M.dark, x + Math.cos(a) * rr * 1.2, yt + 1.4, z + Math.sin(a) * rr * 1.2, Math.PI / 2 - a, 0.7, 1.2, 0.12); }
        b.cyl(M.slateD, x, yt + 2.3, z, rr * 1.42, 1.1, { top: 1.0, seg, color: 0xa8b0c0 });
        b.cone(M.slate, x, yt + 3.3, z, rr * 1.3, roofH, { seg, color: jit(SLATE, R, 0.01, 0.06, 0.04) });
        b.cone(M.slateD, x, yt + 3.3 + roofH * 0.62, z, rr * 1.3 * 0.42, roofH * 0.38 + 0.2, { seg, color: SLATE2 });
        b.cyl(M.iron, x, yt + 3.3 + roofH, z, 0.12, 3.6, { seg: 4 });
      } else { // crenellated flat crown
        b.cyl(M.redD, x, yt + 2.3, z, rr * 1.3, 0.8, { top: 1, seg, color: col });
        const nn = Math.max(8, Math.round((TAU * rr * 1.3) / 2.4)); for (let i = 0; i < nn; i++) { const a = (i / nn) * TAU; b.box(M.trim, x + Math.cos(a) * rr * 1.24, yt + 3.1, z + Math.sin(a) * rr * 1.24, 1.3, 1.3, 0.7, Math.PI / 2 - a, 0xf2e4d0); }
      }
    }
    function sqTower(x, z, o = {}) {
      const { w = 14, d = w, h = 36, ry = 0, y = Gd } = o, L = loc(x, z, ry), col = tint(rt, 0.08, 0.05);
      b.box(M.wet, x, y - 12, z, w + 3.2, 13, d + 3.2, ry, 0xd8c8b8); b.box(M.redD, x, y - 1, z, w + 1.6, 4.4, d + 1.6, ry, col); b.box(M.red, x, y, z, w, h, d, ry, col);
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const [px, pz] = L(sx * w / 2, sz * d / 2); b.box(M.trim, px, y, pz, 1.3, h, 1.3, ry, 0xf2e4d0); }
      for (const t of [0.3, 0.64]) b.box(M.trim, x, y + h * t, z, w + 0.7, 0.6, d + 0.7, ry, 0xf0e0cc);
      for (const sz of [-1, 1]) for (let i = 0; i < 2; i++) for (const t of [0.22, 0.48]) { const [px, pz] = L((i - 0.5) * w * 0.4, sz * (d / 2 + 0.05)); arch(b, (i + Math.round(t * 9)) % 2 ? M.win : M.dark, px, y + h * t, pz, ry + (sz < 0 ? Math.PI : 0), 1.2, 3.4, 0.2); }
      b.box(M.trim, x, y + h - 1, z, w + 2.2, 2, d + 2.2, ry, 0xf0e0cc); b.box(M.redD, x, y + h + 1, z, w + 2.6, 1, d + 2.6, ry, col);
      const nm = Math.round(w / 1.8); for (let i = 0; i < nm; i++) { const u = (i + 0.5) / nm - 0.5; for (const sz of [-1, 1]) { const [px, pz] = L(u * (w + 2.2), sz * (d / 2 + 1.2)); b.box(M.trim, px, y + h + 2, pz, 1.25, 1.3, 0.8, ry, 0xf2e4d0); } for (const sx of [-1, 1]) { const [px, pz] = L(sx * (w / 2 + 1.2), u * (d + 2.2)); b.box(M.trim, px, y + h + 2, pz, 0.8, 1.3, 1.25, ry, 0xf2e4d0); } }
      b.pyramid(M.slate, x, y + h + 1, z, w - 2, 5, d - 2, ry, SLATE);
    }
    function curtain(pts, { h = 22, t = 5, closed = true, skip = null } = {}) {
      K.wall(b, pts, { h, t, mat: M.red, capMat: M.trim, heightAt: () => Gd, closed, sink: 12, merlon: 1.3, color: 0xf6ece0 });
      const n = closed ? pts.length : pts.length - 1;
      for (let i = 0; i < n; i++) {
        const P = pts[i], Q = pts[(i + 1) % pts.length], dx = Q[0] - P[0], dz = Q[1] - P[1], len = Math.hypot(dx, dz), ry = Math.atan2(-dz, dx), cx = (P[0] + Q[0]) / 2, cz = (P[1] + Q[1]) / 2;
        b.box(M.wet, cx, -2.2, cz, len, 3.4, t + 1.2, ry, 0xd0c0b0);                                                          // water-stained footing
        b.box(M.redD, cx, 1, cz, len, 6, t + 0.8, ry, 0xe0b8a0);                                                              // battered plinth
        b.box(M.trim, cx, Gd + 8, cz, len, 0.5, t + 0.4, ry, 0xf0e0cc);
        b.box(M.trim, cx, Gd + h - 1.2, cz, len, 1.1, t + 0.9, ry, 0xf0e0cc);
        const nx = -dz / len, nz = dx / len, ns = Math.floor(len / 8.5);
        for (let k = 0; k < ns; k++) { const u = (k + 0.5) / ns - 0.5; for (const sd of [-1, 1]) { const px = cx + (dx / len) * u * len + nx * sd * (t / 2 + 0.06), pz = cz + (dz / len) * u * len + nz * sd * (t / 2 + 0.06); arch(b, M.dark, px + nx * sd * 0.03, Gd + 12, pz + nz * sd * 0.03, ry + (sd > 0 ? 0 : Math.PI), 0.8, 2.4, 0.15); } }
      }
    }
    function hall(x, z, o) {
      const { w, d, h, ry = 0, wall = M.plaster, wc = 0xeee2c8, rf = M.slate, rc = SLATE, rh = Math.min(w, d) * 0.62, doorSide = 1, chimney = true, y = Gd } = o, L = loc(x, z, ry), col = tint(rt, 0.08, 0.04);
      b.box(M.redD, x, y - 1.5, z, w + 0.6, 2.4, d + 0.6, ry, col); b.box(wall, x, y - 0.4, z, w, h + 0.4, d, ry, wc);
      for (const sx of [-0.5, 0.5]) for (const sz of [-1, 1]) { const [px, pz] = L(sx * w, sz * (d / 2 + 0.03)); b.box(M.woodD, px, y, pz, 0.35, h, 0.3, ry); }
      b.box(M.woodD, x, y + h * 0.52, z, w + 0.12, 0.28, d + 0.12, ry); b.box(M.woodD, x, y + h - 0.35, z, w + 0.2, 0.5, d + 0.2, ry);
      b.prism(rf, x, y + h, z, w + 1.2, rh, d + 1.2, ry, jit(rc, rt, 0.01, 0.06, 0.05)); b.box(M.slateD, x, y + h + rh - 0.1, z, w + 1.3, 0.35, 0.6, ry, 0x8895b0);
      const nW = Math.max(2, Math.round(w / 3.6));
      for (const sz of [-1, 1]) for (let i = 0; i < nW; i++) { const lx = (i - (nW - 1) / 2) * (w / nW); if (sz === doorSide && Math.abs(lx) < 1.3) continue; const [px, pz] = L(lx, sz * (d / 2 + 0.06)); arch(b, rt() < 0.8 ? M.win : M.dark, px, y + h * 0.28, pz, ry + (sz < 0 ? Math.PI : 0), 0.9, 2.2, 0.12); }
      const [dx0, dz0] = L(0, doorSide * (d / 2 + 0.08)); arch(b, M.door, dx0, y - 0.1, dz0, ry + (doorSide < 0 ? Math.PI : 0), 1.7, 2.8, 0.2);
      if (chimney) { const [cx, cz] = L(w * 0.28, 0); b.box(M.red, cx, y + h * 0.6, cz, 1.3, h * 0.4 + rh + 1.6, 1.3, ry); b.box(M.trim, cx, y + h + rh + 1.6, cz, 1.8, 0.35, 1.8, ry); chim.push([cx, y + h + rh + 2.4, cz]); }
    }
    function lampPost(x, y, z, h = 3) { b.cyl(M.iron, x, y, z, 0.12, h, { seg: 5 }); b.box(M.iron, x, y + h, z, 0.5, 0.12, 0.5); b.box(M.lamp, x, y + h + 0.12, z, 0.34, 0.5, 0.34); b.box(M.iron, x, y + h + 0.62, z, 0.5, 0.1, 0.5); lampPts.push([x, y + h + 0.4, z]); }
    /** weirwood: pale smooth bark, root flare, bent limbs, red crown, carved face (looking `facing`) */
    function weirwood(x, y, z, s, facing, Rn) {
      const R0 = 1.5 * s, th = 9 * s;
      b.cyl(M.barkW, x, y - 1, z, R0 * 1.7, 2.6 * s, { top: 0.6, seg: 10 });
      b.cyl(M.barkW, x, y, z, R0, th, { top: 0.62, seg: 10 });
      for (let i = 0; i < 6; i++) { const a = i * 1.05 + Rn() * 0.5; strut(b, M.barkW, [x + Math.cos(a) * R0 * 0.5, y + 1.6 * s, z + Math.sin(a) * R0 * 0.5], [x + Math.cos(a) * R0 * 2.8, y - 0.2, z + Math.sin(a) * R0 * 2.8], 0.55 * s); }
      const tops = [];
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + Rn() * 0.5, len = th * 0.42 * Rn.range(0.8, 1.2), by = y + th * (0.6 + Rn() * 0.25), mid = [x + Math.cos(a) * len * 0.45, by + len * 0.55, z + Math.sin(a) * len * 0.45], end = [x + Math.cos(a) * len, by + len * 0.95, z + Math.sin(a) * len]; strut(b, M.barkW, [x, by, z], mid, 0.5 * s); strut(b, M.barkW, mid, end, 0.34 * s); tops.push(end); }
      tops.push([x, y + th + 2 * s, z]);
      const reds = [0xc9503e, 0xb53f35, 0xd8664c, 0xa8342e];
      for (const [tx, ty, tz] of tops) for (let k = 0; k < 3; k++) blob(b, M.leaf, tx + Rn.range(-1.5, 1.5) * s, ty + Rn.range(-1, 1.2) * s, tz + Rn.range(-1.5, 1.5) * s, Rn.range(2.2, 3.3) * s, Rn.range(1.5, 2.2) * s, Rn.range(2.2, 3.3) * s, jit(Rn.pick(reds), Rn, 0.015, 0.1, 0.05));
      const fh = th * 0.36, rad = R0 * (1 - 0.38 * 0.36) + 0.02, ry = Math.atan2(Math.cos(facing), Math.sin(facing)), px = x + Math.cos(facing) * rad, pz = z + Math.sin(facing) * rad, tx = Math.cos(ry), tz = -Math.sin(ry);
      blob(b, M.barkW, px, y + fh - R0 * 0.5, pz, R0 * 0.8, R0 * 1.9, R0 * 0.2, 0xa89c88, ry);
      for (const sd of [-1, 1]) { b.box(M.dark, px + tx * sd * R0 * 0.36, y + fh, pz + tz * sd * R0 * 0.36, R0 * 0.38, R0 * 0.26, R0 * 0.22, ry, 0xffffff, 0, sd * 0.25); b.box(flat(0x7a1511, { rough: 0.6 }), px + tx * sd * R0 * 0.36, y + fh - R0 * 1.0, pz + tz * sd * R0 * 0.36, R0 * 0.08, R0 * 1.0, R0 * 0.1, ry); }
      b.box(M.dark, px, y + fh - R0 * 1.3, pz, R0 * 0.42, R0 * 0.8, R0 * 0.25, ry);
    }

    // ---- walls (rising from the water), corner towers ---------------------------------------------------------------------------
    curtain([A, Bc, C]);
    const wgA = Math.atan2(C[1] - A[1], C[0] - A[0]);
    sqTower(A[0], A[1], { w: 14, h: 36, ry: 0 }); sqTower(Bc[0], Bc[1], { w: 14, h: 34, ry: 0 });
    drum(C[0], C[1], { r: 8, h: 34, seg: 14, roof: 'flat', windows: 4 });
    // west gatehouse with a drawbridge over the ditch
    K.gatehouse(b, -78, 0, { y: Gd, ry: Math.PI / 2, mat: M.red, roofMat: M.slate, w: 24, d: 12, h: 28, gate: 6, wood: M.woodD, towerR: 5.5, color: 0xf2e4d4, roofColor: SLATE });
    for (const sd of [-1, 1]) { const xf = -78 + sd * 6, ry = sd > 0 ? Math.PI / 2 : -Math.PI / 2, x0 = xf - sd * 0.2; arch(b, M.dark, x0, Gd, 0, ry, 6, 6.8, 0.5); ring(b, M.trim, x0, Gd, 0, ry, 6, 6.8, 0.8, 0.5, 0xf2e4d0); for (let i = -2; i <= 2; i++) b.box(M.iron, xf + sd * 0.4, Gd + 0.3, i * 1.1, 0.16, 5.6, 0.16); }
    b.box(M.wood, -88, 4.6, 0, 22, 0.8, 7, 0, 0xb09068); for (const sd of [-1, 1]) { b.box(M.woodD, -88, 5.4, sd * 3.4, 22, 0.8, 0.4); for (let i = 0; i < 5; i++) b.box(M.woodD, -97 + i * 4.5, 4.6, sd * 3.4, 0.4, 1.6, 0.4); }
    b.ribbon(M.cobble, [[-98, 0], [-150, 8], [-210, 30], [-280, 50]], 7, heightAt, 0.15, 0xbcb09a); b.ribbon(M.cobble, [[-98, 0], [-150, 8], [-210, 30], [-280, 50]], 9.2, heightAt, 0.1, 0x6e6450);
    for (const sx of [-1, 1]) lampPost(-92, 5.4, sx * 3.4, 2.4);
    // ---- water gate (north / Tumblestone side): wide red arch, portcullis, wet stair into the river
    const wg = { x: -30, z: -36 }, WL = loc(wg.x, wg.z, -wgA);
    for (const sd of [-1, 1]) { const [px, pz] = WL(sd * 9, 0); b.box(M.red, px, Gd - 12, pz, 5.5, 36, 7.4, -wgA, 0xfae8d6); b.box(M.trim, px, Gd + 6, pz, 6, 0.6, 7.8, -wgA, 0xf0e0cc); }
    for (const sd of [-1, 1]) {
      const [ax, az] = WL(0, sd * 2.7), yy = 0.2, ryy = -wgA + (sd < 0 ? 0 : Math.PI);
      arch(b, M.dark, ax, yy, az, ryy, 9, 11.5, 0.5); ring(b, M.trim, ax, yy, az, ryy, 9, 11.5, 0.9, 0.5, 0xf2e4d0);
      for (let i = -4; i <= 4; i++) { const [bx, bz] = WL(i * 1.0, sd * 3.2); b.box(M.iron, bx, yy + 2.5, bz, 0.2, 8, 0.2, -wgA); }
    }
    for (let i = 0; i < 6; i++) { const [sx, sz] = WL(0, -4.4 - i * 1.2); b.box(M.wet, sx, 1.4 - i * 0.5, sz, 10 - i * 0.2, 0.7, 1.3, -wgA, 0xb09c88); }
    for (const sd of [-1, 1]) { const [lx, lz] = WL(sd * 6.5, -4.5); lampPost(lx, 1.9, lz, 2.4); }

    // ---- keep (triangular), halls, sept, godswood -------------------------------------------------------------------------------
    const keepPts = [[-12, -22], [32, -2], [-6, 26]];
    const centroid = [(keepPts[0][0] + keepPts[1][0] + keepPts[2][0]) / 3, (keepPts[0][1] + keepPts[1][1] + keepPts[2][1]) / 3];
    const grow = (k) => keepPts.map(([x, z]) => [centroid[0] + (x - centroid[0]) * k, centroid[1] + (z - centroid[1]) * k]);
    b.extrude(M.redD, grow(1.06), Gd - 1, 5, 0xe0b8a0); b.extrude(M.red, keepPts, Gd - 1, 44, 0xfae8d6);
    for (const [y, hh] of [[Gd + 13, 0.7], [Gd + 28, 0.7]]) b.extrude(M.trim, grow(1.025), y, hh, 0xf0e0cc);
    b.extrude(M.redD, grow(1.09), Gd + 41, 2.4, 0xe8c0a8); b.extrude(M.slateD, grow(0.78), Gd + 43, 3, 0x8895b0); b.extrude(M.slate, grow(0.56), Gd + 46, 3.4, SLATE);
    for (let e = 0; e < 3; e++) {
      const P = keepPts[e], Q = keepPts[(e + 1) % 3], dx = Q[0] - P[0], dz = Q[1] - P[1], len = Math.hypot(dx, dz), ry = Math.atan2(-dz, dx), nx = dz / len, nz = -dx / len; // outward-ish (centroid check below)
      const mx = (P[0] + Q[0]) / 2, mz = (P[1] + Q[1]) / 2, out = ((mx - centroid[0]) * nx + (mz - centroid[1]) * nz) > 0 ? 1 : -1;
      for (let i = 0; i < 4; i++) for (const t of [0.2, 0.42, 0.64]) { const u = ((i + 0.5) / 4 - 0.5) * len * 0.78, px = mx + (dx / len) * u + nx * out * 0.06, pz = mz + (dz / len) * u + nz * out * 0.06; arch(b, (i + Math.round(t * 10) + e) % 3 ? M.win : M.dark, px, Gd + 44 * t, pz, ry + (out < 0 ? Math.PI : 0), 1.3, 3.8, 0.2); }
      const nm = Math.floor(len / 2.2); for (let i = 0; i < nm; i++) { const u = ((i + 0.5) / nm - 0.5) * len; b.box(M.trim, mx + (dx / len) * u + nx * out * 2.2, Gd + 43.4, mz + (dz / len) * u + nz * out * 2.2, 1.3, 1.2, 0.8, ry, 0xf2e4d0); }
    }
    keepPts.forEach(([x, z], i) => drum(x, z, { r: 5.2, h: 54, seg: 10, roofH: 14, windows: 3, roof: i === 1 ? 'cone' : 'flat' }));
    // Great Hall
    hall(-32, 14, { w: 44, d: 18, h: 16, ry: 0.05, rh: 10, wall: M.red, wc: 0xfae0cc, doorSide: 1, chimney: true });
    for (let i = -3; i <= 3; i++) { const [bx, bz] = loc(-32, 14, 0.05)(i * 6.3, 9.8); b.box(M.trim, bx, Gd, bz, 1.4, 12, 1, 0.05, 0xf2e4d0); }
    // Sept (seven-sided tower with coloured windows and a lantern)
    { const sx = -58, sz = -14, seg = 7;
      b.cyl(M.redD, sx, Gd - 1, sz, 10, 3, { seg, top: 0.94, color: 0xe0b8a0 }); b.cyl(M.plaster, sx, Gd, sz, 9, 22, { seg, top: 0.94, color: 0xfff0dc }); b.cyl(M.trim, sx, Gd + 21, sz, 9.4, 1.6, { seg, top: 1.06, color: 0xf6e8d4 });
      for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU + Math.PI / 7 * 0 ; const rad = 9 * 0.97 * Math.cos(Math.PI / 7) + 0.1; arch(b, stained[i], sx + Math.cos(a) * rad, Gd + 7, sz + Math.sin(a) * rad, Math.PI / 2 - a, 2.2, 8, 0.2); }
      b.cone(M.slate, sx, Gd + 22.6, sz, 9.8, 9, { seg, color: SLATE }); b.cyl(M.plaster, sx, Gd + 31, sz, 2.2, 3.2, { seg, color: 0xfff0dc }); for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; b.box(stained[(i + 2) % 7], sx + Math.cos(a) * 2.25, Gd + 31.6, sz + Math.sin(a) * 2.25, 0.5, 1.8, 0.2, Math.PI / 2 - a); } b.cone(M.slate, sx, Gd + 34.2, sz, 2.8, 4.2, { seg, color: SLATE }); b.cyl(M.iron, sx, Gd + 38, sz, 0.1, 2.4, { seg: 4 }); }
    // Wheel Tower on the Tumblestone wall
    const wp = [(A[0] + C[0]) * 0.5, (A[1] + C[1]) * 0.5];
    sqTower(wp[0], wp[1] + 2, { w: 14, d: 12, h: 30, ry: -wgA });
    // service buildings along the south wall
    hall(-44, 36, { w: 18, d: 8, h: 6 }); hall(-18, 36, { w: 12, d: 9, h: 6 }); hall(8, 28, { w: 12, d: 8, h: 6, ry: 0.3 }); hall(-60, 14, { w: 12, d: 8, h: 6, ry: 0.2 });
    // courtyard paving, well, barrels
    b.extrude(M.cobble, [[-70, -40], [80, -2], [-70, 42]], Gd - 0.05, 0.25, 0xc0b49e);
    b.cyl(M.redD, 4, Gd, 8, 1.5, 1.1, { seg: 10 }); b.cyl(M.dark, 4, Gd + 1.05, 8, 1.1, 0.1, { seg: 10 });
    for (let i = 0; i < 9; i++) { const a = rt() * TAU, rr2 = 3 + rt() * 3, px = -34 + Math.cos(a) * rr2, pz = 30 + Math.sin(a) * rr2; if (i % 2) b.cyl(M.wood, px, Gd, pz, 0.55, 1.0, { seg: 8, top: 0.92, color: tint(rt, 0.3, 0.1) }); else b.box(M.woodD, px, Gd, pz, 1.1, 1.0, 1.1, rt() * 3); }
    for (const [x, z] of [[-70, -16], [-70, 16], [-8, 20], [44, 6], [20, -18], [-40, -30]]) lampPost(x, Gd, z, 3);
    // fishers' huts & landing on the south bank, farmstead east of the ditch, haystacks
    const hutAt = (x, z, ry) => { const y = H(x, z); hall(x, z, { y, w: 6, d: 8, h: 3.2, ry, wall: M.plaster, wc: 0xd8c8a2, rf: M.thatch, rc: 0xe0cc8c, rh: 3, chimney: true }); };
    hutAt(-120, 100, 0.4); hutAt(-100, 124, 1.2); hutAt(-60, 140, 0); hutAt(40, 120, 0.8); hutAt(-150, -120, 0.3); hutAt(-110, -150, 1); hutAt(-170, 70, 0.9); hutAt(70, -120, 0.2);
    K.pier(b, 4, 0.9, 52, { len: 14, w: 3, ry: Math.PI / 2, mat: M.woodL }); K.pier(b, -50, 0.9, -44, { len: 10, w: 2.6, ry: -Math.PI / 2, mat: M.woodL, color: 0xe0d0a8 });
    lampPost(5, 1.4, 62, 2.2);
    for (const [x, z] of [[-130, 120], [-150, 112], [60, 134], [-200, -80], [-180, -100], [90, -135]]) { const y = H(x, z); b.cone(M.hay, x, y, z, 2.4, 3.6, { seg: 8, color: 0xe8d078 }); b.cyl(M.hay, x, y, z, 2.4, 1.4, { seg: 8, color: 0xd8c06c }); }
    root.add(b.build({}));

    // ---- the wheel itself: timber rim, paddles, spokes, hub; gear housing on the tower ------------------------------------------------
    {
      const wb = new Batch(), spin = new THREE.Group(), wheel = new THREE.Group(), RR = 9;
      const n = 16; for (let i = 0; i < n; i++) { const a = (i / n) * TAU, a2 = ((i + 1) / n) * TAU; for (const sx of [-1.6, 1.6]) strut(wb, M.wood, [sx, Math.cos(a) * RR, Math.sin(a) * RR], [sx, Math.cos(a2) * RR, Math.sin(a2) * RR], 0.5, 0xc0a074, 0.6); wb.box(M.woodD, 0, Math.cos(a) * (RR + 0.2), Math.sin(a) * (RR + 0.2), 3.4, 0.3, 1.0, 0, 0xffffff, a + Math.PI / 2, 0); }
      for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + 0.1; strut(wb, M.woodD, [0, 0, 0], [0, Math.cos(a) * RR, Math.sin(a) * RR], 0.35, 0x7a5c40, 0.35); }
      for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; const px = 0, py = Math.cos(a) * (RR + 0.5), pz = Math.sin(a) * (RR + 0.5); const L2 = new THREE.Matrix4().compose(new THREE.Vector3(px, py, pz), new THREE.Quaternion().setFromEuler(new THREE.Euler(a, 0, 0)), new THREE.Vector3(3.4, 0.25, 2.4)); wb.addGeometry(M.woodD, GG.box(), L2, 0x8a6a48); }
      wb.cyl(M.woodD, 0, 0, 0, 0.9, 0.1, { seg: 8 });
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 4.2, 10), M.wood); hub.rotation.z = Math.PI / 2; spin.add(hub); spin.add(wb.build({ shadow: true })); wheel.add(spin);
      const ng = [Math.sin(wgA), -Math.cos(wgA)]; wheel.position.set(wp[0] + ng[0] * 8.5, 7.2, wp[1] + ng[1] * 8.5); wheel.rotation.y = -wgA; root.add(wheel);
      ctx.onUpdate((dt) => { spin.rotation.x -= dt * 0.5; });
      // bearing frame: two posts in the river and a beam to the tower, plus a spillway of white water under the wheel
      const fb = new Batch(), FL = loc(wheel.position.x, wheel.position.z, -wgA);
      for (const sx of [-3.2, 3.2]) { const [px, pz] = FL(sx, 0); fb.cyl(M.woodD, px, -4, pz, 0.7, 12, { seg: 6, color: 0x7a6044 }); }
      { const [px, pz] = FL(0, 4.2); fb.box(M.woodD, px, 7, pz, 7.6, 0.7, 1.2, -wgA, 0x6a523a); fb.box(M.woodD, px, 6.2, pz, 0.7, 1.4, 6, -wgA, 0x6a523a); }
      root.add(fb.build({}));
      const sp = FL(0, -0.5); root.add(K.smoke([[sp[0], 0.8, sp[1]], [sp[0] + 3, 0.8, sp[1] + 1], [sp[0] - 3, 0.8, sp[1] - 1]], { color: 0xf0f6f6, size: 12, rise: 4, opacity: 0.35, perStack: 6, spread: 2.5 }));
    }
    // ---- godswood: small wood by the river inside the walls, with a weirwood and yews -------------------------------------------------
    { const wr = K.rng(6); weirwood(-54, Gd, 38, 1.5, -2.3, wr);
      const gb = new Batch(), gp = [[-70, 22], [-52, 34], [-32, 44], [-60, 46], [-72, 38]], pts = K.scatter({ rng: K.rng(5), count: 16, bounds: [-72, 20, -30, 47], poly: gp, minDist: 3.6, avoid: (x, z) => Math.hypot(x + 54, z - 38) < 7 });
      for (const [x, z] of pts) { const k = 0.9 + wr() * 0.5; gb.cyl(M.bark, x, Gd - 0.2, z, 0.4 * k, 3.4 * k, { seg: 6, color: 0x5a4636 }); for (let j = 0; j < 3; j++) blob(gb, M.leaf, x + wr.range(-0.9, 0.9) * k, Gd + 3.6 * k + j * 0.9 * k, z + wr.range(-0.9, 0.9) * k, 2.0 * k - j * 0.3, 1.5 * k, 2.0 * k - j * 0.3, jit(0x35563a, wr, 0.02, 0.1, 0.05)); }
      root.add(gb.build({})); }

    // ---- the valley: orchards, hedgerows, willows, alders, hills with pine -------------------------------------------------------------
    function broadleaf({ rng, count, bounds, poly, avoid, scale = [1, 1.5], minDist = 6, greens, willow = false, rows = false }) {
      const pts = K.scatter({ rng, count, bounds, poly, minDist, avoid }), grp = new THREE.Group();
      const trunk = new Inst(GG.cyl(6, 0.62), M.bark), Aa = new Inst(GG.sphere(7), M.leaf), Bb = new Inst(GG.sphere(7), M.leaf), Cc = new Inst(GG.sphere(7), M.leaf);
      for (const [x, z] of pts) {
        const k = rng.range(scale[0], scale[1]), y = H(x, z), gc = jit(rng.pick(greens), rng, 0.02, 0.1, 0.05), a = rng() * 6;
        trunk.add(x, y - 0.3, z, 0.55 * k, 3.9 * k, 0.55 * k, a, jit(0x4a3a2c, rng, 0.01, 0.05, 0.05));
        Aa.add(x, y + 2.7 * k, z, 2.9 * k, willow ? 3.4 * k : 2.5 * k, 2.9 * k, a, gc);
        Bb.add(x + Math.cos(a) * 1.5 * k, y + 3.6 * k, z + Math.sin(a) * 1.5 * k, 2.1 * k, 1.9 * k, 2.1 * k, a, jit(rng.pick(greens), rng, 0.02, 0.1, 0.06));
        Cc.add(x - Math.cos(a) * 1.3 * k, y + 3.2 * k, z - Math.sin(a) * 1.3 * k, 1.8 * k, 1.6 * k, 1.8 * k, a, jit(rng.pick(greens), rng, 0.02, 0.1, 0.07));
      }
      for (const i of [trunk, Aa, Bb, Cc]) if (i.items.length) grp.add(i.build());
      return grp;
    }
    const open = (x, z) => Math.hypot(x - 10, z) < 150 || H(x, z) < 1.5 || H(x, z) > 44;
    root.add(broadleaf({ rng: K.rng(12), count: q.dens(380), bounds: [-480, -480, 480, 480], avoid: open, scale: [1.1, 1.9], minDist: 8, greens: [0x5a8a40, 0x4f7e3a, 0x669648, 0x45723a, 0x739a48] }));
    root.add(broadleaf({ rng: K.rng(13), count: q.dens(60), bounds: [-300, -300, 300, 300], avoid: (x, z) => Math.hypot(x - 10, z) < 100 || H(x, z) > 3 || H(x, z) < 0.5, scale: [1.3, 1.8], minDist: 12, willow: true, greens: [0x88a858, 0x96b05c, 0x7a9c50] }));
    root.add(K.forest({ rng: K.rng(14), count: q.dens(260), bounds: [-640, -640, 640, 640], heightAt, species: 'pine', tint: 0x2c4a35, scale: [1.6, 2.8], minDist: 8, avoid: (x, z) => H(x, z) < 30 || Math.hypot(x - 10, z) < 340 }));
    // orchard rows west of the castle
    { const og = new THREE.Group(), tr = new Inst(GG.cyl(5, 0.6), M.bark), cr = new Inst(GG.sphere(7), M.leaf), orr = K.rng(4);
      for (let i = 0; i < 6; i++) for (let j = 0; j < 8; j++) { const x = -230 - i * 11, z = 120 + j * 11, y = H(x, z); if (y < 1.5 || y > 12) continue; tr.add(x, y - 0.2, z, 0.35, 2.4, 0.35, 0, 0x5a4636); cr.add(x, y + 2.8, z, 2.1, 1.8, 2.1, orr() * 6, jit(0x6a9a42, orr, 0.02, 0.08, 0.05)); }
      og.add(tr.build(), cr.build()); root.add(og); }
    const reeds = new Inst(GG.cone(4), M.reed, { cast: false }), rr = K.rng(9); let nr = 0;
    for (let i = 0; i < q.dens(9000) && nr < q.dens(1700); i++) { const x = rr.range(-380, 380), z = rr.range(-380, 380), h = H(x, z); if (h < -0.4 || h > 1.4 || (x > -100 && x < 100 && Math.abs(z) < 60)) continue; nr++; reeds.add(x, Math.max(h, -0.3), z, 0.2, rr.range(1.6, 3.2), 0.2, rr() * 6, rr.pick([0x8c9a50, 0xa3a860, 0x6f8447, 0xb4a56a, 0x7d8a48])); }
    root.add(reeds.build());

    // night dimming for self-lit sprites (smoke, clouds): glow materials expose the host's night level
    const nightProbe = glow(0xffffff, 1), dimmers = [], night = () => K.clamp((nightProbe.color.r - 0.14) / 1.25, 0, 1);
    const dimmed = (col, k = 0.8) => { const base = col.clone(); dimmers.push((n) => col.copy(base).multiplyScalar(1 - k * n)); };
    const smoke = (...a) => { const p = K.smoke(...a); dimmed(p.material.uniforms.uColor.value); return p; }, cloudsD = (...a) => { const g = K.clouds(...a); dimmed(g.children[0].material.color); return g; };
    ctx.onUpdate(() => { const n = night(); for (const f of dimmers) f(n); });
    // ---- life: banners (blue and red Tully field), smoke, boats, birds ---------------------------------------------------------------------
    const bn = [[keepPts[1][0], Gd + 77, keepPts[1][1]], [A[0], Gd + 50, A[1]], [Bc[0], Gd + 48, Bc[1]], [C[0], Gd + 44, C[1]], [-78, Gd + 36, 0], [keepPts[0][0], Gd + 70, keepPts[0][1]]].map(([x, y, z], i) => ({ x, y, z, w: 3.2, h: 9, color: i % 2 ? 0x2f58a8 : 0xa6282c, ry: 0.3 }));
    root.add(K.banners(bn));
    root.add(smoke(chim.concat([[-120, 8, 100], [-100, 8, 124]]), { size: 18, rise: 16, opacity: 0.28, color: 0xe0dcd8 }));
    const fire = K.fires([[-80, Gd + 4.6, -6], [-80, Gd + 4.6, 6], [90, Gd + 36, 4], ...lampPts], { size: 6, light: q.low ? 0 : 3, intensity: 55 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const wk = K.walkers({ paths: [[[-68, 0], [-20, 6], [30, 6]], [[-60, 32], [-20, 30], [20, 26]], [[-150, 8], [-100, 2]], [[-230, 40], [-170, 30], [-110, 8]]], heightAt: (x, z) => (x > -92 && x < 100 ? Gd : H(x, z)), count: q.dens(16), rng: K.rng(3) }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const hullW = tri('wood', { color: 0xcaa888, scale: 3, snow: false, side: THREE.DoubleSide });
    const boats = [[RED, 0.0, 'barge', 0.05], [RED, 0.55, 'cog', 0.04], [TUM, 0.3, 'barge', -0.05], [EAST, 0.4, 'cog', 0.045], [EAST, 0.8, 'barge', -0.04]].map(([pl, ph, ty, sp], i) => { const s = makeShip(hullW, ty, 11 + i, [0x6a4a30, 0x5a4634, 0x7a5636, 0x6a5440, 0x70503a][i], [0xd9d2bd, 0xc9b996, 0xe2d8bc, 0xb8c4d0, 0xd2b8a0][i], 31 + i); root.add(s); return { s, pl, ph, sp, L: K.polyLength(pl) }; });
    ctx.onUpdate((dt, t) => boats.forEach(({ s, pl, ph, sp, L }, i) => { const d = (((ph + t * Math.abs(sp) / 8 * 1) % 1) + 1) % 1; const p = K.pointAlong(pl, (sp > 0 ? d : 1 - d) * L), off = 3 * (i % 2 ? 1 : -1); s.position.set(p.x + off, 0.2, p.z); s.rotation.y = p.angle - Math.PI / 2 + (sp > 0 ? 0 : Math.PI); animSails(s, t, i); s.position.y = 0.2; }));
    const gull = K.birds({ center: [10, 50, 0], radius: 110, count: q.dens(8), color: 0xf0f0f0, size: 1.2, spreadY: 12, seed: 2 }); root.add(gull); ctx.onUpdate((dt, t) => gull.userData.update(t));
    const swl = K.birds({ center: [-30, 22, 0], radius: 60, count: q.dens(8), color: 0x1c2230, size: 0.7, spreadY: 8, seed: 5, speed: 0.2 }); root.add(swl); ctx.onUpdate((dt, t) => swl.userData.update(t));
    root.add(smoke(Array.from({ length: 10 }, (_, i) => { const p = K.pointAlong(i % 2 ? TUM : RED, 30 + i * 40); return [p.x, 1.4, p.z]; }), { color: 0xf0eee8, size: 70, rise: 6, opacity: 0.08, perStack: 5, spread: 10 }));
    root.add(cloudsD({ y: 280, extent: 800, count: 12, opacity: 0.5, color: 0xffffff }));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, Gd + dy, z], r });
    return {
      radius: 270, center: [10, 0, 0], minDistance: 18,
      hero: { pos: [195, 100, 62], target: [-14, 14, 0] },
      climate: {
        atmos: 'day', weather: 'clear',
        tint: {
          dawn: { top: 0x5a6a9a, horizon: 0xf0bc98, fog: 0xd8b8a8, fogD: 0.0015, sunC: 0xffc088, sunI: 3.0, water: 0.7, hemiSky: 0xa4b0d8, hemiGround: 0x66543e, hemiI: 0.8 },
          day: { top: 0x3f7ac0, horizon: 0xcadfe8, fog: 0xbcd4da, fogD: 0.0012, sunC: 0xfff0d2, sunI: 3.6, hemiSky: 0xb0d0f0, hemiGround: 0x7a6a48, hemiI: 0.85 },
          dusk: { top: 0x2e3a72, horizon: 0xee8a58, fog: 0xc88878, fogD: 0.0016, sunC: 0xff8a44, sunI: 3.0, water: 0.6, hemiSky: 0x8088c4, hemiGround: 0x4c3a38, hemiI: 0.68 },
          night: { top: 0x080d28, horizon: 0x2a3c66, fog: 0x1c2a46, fogD: 0.0019, sunC: 0xa6baf0, sunI: 1.3, hemiSky: 0x6478b4, hemiGround: 0x2a2e42, hemiI: 1.1 },
        },
      },
      landmarks: {
        'water-gate': { ...lm(-30, -34, 12, 26), cam: { pos: [-62, 34, -112], target: [-30, 10, -36] } }, 'triangular-keep': lm(centroid[0], centroid[1], 22, 66), 'great-hall': { ...lm(-32, 14, 14, 22), cam: { pos: [-60, 40, 78], target: [-32, 10, 14] } }, 'wheel-tower': lm(wp[0], wp[1], 12, 40),
        'sept': lm(-58, -14, 10, 40), 'godswood': lm(-52, 36, 13, 12), 'confluence-point': lm(96, 0, 18, 40), 'western-ditch': lm(-90, -30, 14, 0), 'west-gate': lm(-78, 0, 12, 34),
      },
    };
  },
};
