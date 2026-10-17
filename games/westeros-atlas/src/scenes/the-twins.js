// The Twins — book anchors: two (matching) fortresses on opposite banks of the Green Fork joined by a great bridge of grey stone, with a
// central Water Tower; moats cut from the river make each castle an island; the Freys levy a toll on the crossing. Plan, scale and details interpretive.
//
// Visual language: cool grey ashlar wet with rain, slate-blue conical roofs, a soft sodden marsh of alder and reed, a dark green river
// under low cloud, warm lantern-light spilling from arched windows, a toll-lit bridge with a lamp every few paces.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G: GG, tri, flat, glow } = K;

const G = 12;                                           // bank / castle ground level
const DECK = 25, RISE = 10;                              // bridge deck level and arch rise
const TAU = Math.PI * 2;
const RIVER = [[-700, 6], [-300, -4], [-80, 2], [0, 0], [80, -2], [300, 6], [700, 0]];
const MOAT_N = [[-57, -52], [-57, -153], [57, -153], [57, -52]], MOAT_S = MOAT_N.map(([x, z]) => [x, -z]);
const deckY = (z) => (Math.abs(z) < 68 ? DECK + Math.sin(((z + 68) / 136) * Math.PI) * RISE : G);

const jit = (hex, r, dh = 0.012, ds = 0.05, dl = 0.03) => new THREE.Color(hex).offsetHSL((r() - 0.5) * 2 * dh, (r() - 0.5) * 2 * ds, (r() - 0.5) * 2 * dl);
const tint = (r, v = 0.12, w = 0.05) => { const k = 1 - v * r(); return new THREE.Color(k * (1 - w * r() * 0.5), k * (1 - w * r() * 0.3), k); };
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
  g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 5 }); archCache.set(k, g); return g;
}
function arch(b, mat, x, y, z, ry, w, h, depth = 0.25, color = 0xffffff) {
  _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(1, 1, 1)); b.addGeometry(mat, archGeo(w, h, depth), _m, color);
}
const loc = (cx, cz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c]; };

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
    const q = ctx.q, root = ctx.root;
    const heightAt = (x, z) => {
      const dc = Math.hypot(x, z * 0.7);
      let h = G + (K.fbm(x * 0.01, z * 0.01, 3, 6) - 0.5) * 6 * K.smoothstep(100, 250, dc) + (K.fbm(x * 0.05, z * 0.05, 2, 2) - 0.5) * 0.9;
      const ridge = 0.55 + 0.9 * K.fbm(x * 0.0045 + 3, z * 0.0045, 4, 4), tor = K.fbm(x * 0.02, z * 0.02, 3, 8);
      h += K.smoothstep(340, 700, dc) * (22 + ridge * 62 + tor * 14);
      const d = K.distToPolyline(x, z, RIVER).d, wide = 46 + Math.max(0, h - 14) * 2.2, f = 1 - K.smoothstep(32, wide, d); h = h * (1 - f) + -6 * f;
      for (const m of [MOAT_N, MOAT_S]) { const dm = K.distToPolyline(x, z, m).d, fm = 1 - K.smoothstep(3, 8, dm); if (fm > 0) h = Math.min(h, h * (1 - fm) + -3 * fm); }
      // flatten the two castle islands
      if (Math.abs(x) < 54 && Math.abs(z) > 56 && Math.abs(z) < 150) h = G;
      return h;
    };
    const H = heightAt;
    const marsh = new THREE.Color(0x56683a), reed = new THREE.Color(0x8c8a4e), mud = new THREE.Color(0x4f4636), wet = new THREE.Color(0x3d4a34), hillC = new THREE.Color(0x46563f), rockC = new THREE.Color(0x65675f), paved = new THREE.Color(0x77756c), c = new THREE.Color();
    root.add(K.terrain({ size: 1500, seg: q.seg(190), heightAt, kind: 'grass', scale: 12, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.015, z * 0.015, 3, 7), n2 = K.fbm(x * 0.06, z * 0.06, 2, 9);
      c.copy(marsh).lerp(reed, K.clamp(n * 1.3 - 0.35, 0, 0.7)).lerp(wet, K.smoothstep(0.55, 0.8, n2) * 0.45);
      if (h > 24) c.lerp(hillC, K.smoothstep(24, 60, h) * 0.8);
      if (h > 40) c.lerp(rockC, K.clamp(s * 2.5, 0, 0.7));
      if (h < 2.4) c.lerp(mud, 0.55 + 0.3 * K.smoothstep(1.4, -0.4, h));
      if (Math.abs(x) < 56 && Math.abs(z) > 54 && Math.abs(z) < 152) c.lerp(paved, 0.75);
      return c;
    } }));
    const wat = K.water({ w: 1500, d: 700, seg: q.seg(150), level: 0, heightAt, deep: 0x1b3a3d, shallow: 0x3c5a52, opacity: 0.92, choppy: 0.9, speed: 1.2, foam: 0xc4ccc8 });
    root.add(wat); ctx.registerWater(wat);

    // ---- materials: near-white tints x per-object colour (rain-wet = lower roughness)
    const T = (k, color, scale = 8, o = {}) => tri(k, { color, scale, ...o });
    const M = {
      grey: T('stone', 0xdfe2e8, 8, { rough: 0.7 }), greyD: T('stone', 0xb2b6c0, 8, { rough: 0.72 }), trim: T('stone', 0xeef0f2, 6, { rough: 0.62 }),
      roof: T('slate', 0xe6ecf6, 4, { rough: 0.55, metal: 0.05 }), roofD: T('slate', 0xbfc8d8, 4, { rough: 0.6 }), wood: T('wood', 0x8a6a4a, 4, { snow: false }), woodD: T('wood', 0x4a3a2c, 4, { snow: false }),
      cobble: T('cobble', 0xcfcabd, 8, { rough: 0.55 }), thatch: T('thatch', 0xd0be8c, 5), plaster: T('plaster', 0xe8dfc8, 6), tile: T('tile', 0xc0a88a, 5),
      win: glow(0xffc46b, 1.9), lamp: glow(0xffb45a, 2.2), iron: flat(0x2a2b2e, { metal: 0.6, rough: 0.5 }), dark: flat(0x0b0b0d, { rough: 1 }), door: flat(0x2c2118, { rough: 0.9 }),
      leaf: T('grass', 0xffffff, 3, { rough: 1, snow: false }), bark: T('wood', 0xffffff, 3, { snow: false }), moss: T('grass', 0x6a7a44, 5, { rough: 1, snow: false }), reed: flat(0xffffff, { rough: 1, flatShading: false }),
    };
    const BLUE = 0x7586a8, rt = K.rng(31), b = new Batch(), lampPts = [], chim = [];

    // ---- builders -------------------------------------------------------------------------------------------------------------
    /** Round tower: battered plinth, courses, slit windows, corbelled crown, flared conical slate roof. */
    function drum(x, z, o = {}) {
      const { r = 6.5, h = 32, y = G, seg = 12, roofH = 12, taper = 0.9, windows = 3 } = o, R = rt, col = tint(R, 0.1, 0.05);
      const rA = (t) => r * (1 - (1 - taper) * t);
      b.cyl(M.greyD, x, y - 3, z, r * 1.16, 5.4, { top: 0.9, seg, color: col });
      b.cyl(M.grey, x, y, z, r, h, { top: taper, seg, color: col });
      for (const t of [0.3, 0.62]) b.cyl(M.trim, x, y + t * h - 0.3, z, rA(t) * 1.04, 0.6, { top: 1, seg, color: col });
      for (let k = 0; k < windows; k++) { const a = k * 2.1 + x * 0.37, t = 0.26 + 0.17 * k, rad = rA(t) + 0.04, lit = (k + Math.round(x)) % 3 !== 1; arch(b, lit ? M.win : M.dark, x + Math.cos(a) * rad, y + h * t, z + Math.sin(a) * rad, Math.PI / 2 - a, 0.9, 2.8, 0.2); }
      const yt = y + h, rr = rA(1);
      b.cyl(M.trim, x, yt - 0.4, z, rr * 1.03, 1.6, { top: 1.22, seg, color: col });                          // corbel table
      b.cyl(M.greyD, x, yt + 1.2, z, rr * 1.25, 1.2, { top: 1.0, seg, color: col });                           // gallery drum
      const n = Math.max(8, Math.round((TAU * rr * 1.25) / 2.6)); for (let i = 0; i < n; i++) { const a = (i / n) * TAU; if (i % 2) arch(b, M.dark, x + Math.cos(a) * rr * 1.2, yt + 1.4, z + Math.sin(a) * rr * 1.2, Math.PI / 2 - a, 0.7, 1.2, 0.12); }
      b.cyl(M.roofD, x, yt + 2.3, z, rr * 1.42, 1.1, { top: 1.0, seg, color: 0xb8c0d0 });                      // eave flare
      b.cone(M.roof, x, yt + 3.3, z, rr * 1.3, roofH, { seg, color: jit(BLUE, R, 0.01, 0.06, 0.04) });
      b.cone(M.roofD, x, yt + 3.3 + roofH * 0.62, z, rr * 1.3 * 0.42, roofH * 0.38 + 0.2, { seg, color: 0x93a0bb });
      b.cyl(M.iron, x, yt + 3.3 + roofH, z, 0.12, 3.6, { seg: 4 }); return yt + 3.3 + roofH + 3.4;
    }
    /** Curtain wall with plinth, string course, crenellations, and rain-stained weep streaks. */
    function curtain(pts, { h = 22, t = 5, closed = true, gap = null } = {}) {
      K.wall(b, pts, { h, t, mat: M.grey, capMat: M.trim, heightAt: () => G, closed, sink: 14, merlon: 1.3, color: 0xf0f0f2 });
      const n = closed ? pts.length : pts.length - 1;
      for (let i = 0; i < n; i++) {
        const A = pts[i], B = pts[(i + 1) % pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz), ry = Math.atan2(-dz, dx), cx = (A[0] + B[0]) / 2, cz = (A[1] + B[1]) / 2;
        b.box(M.greyD, cx, G - 1.5, cz, len, 3.6, t + 1.6, ry, 0xd4d6dc);                                      // battered plinth
        b.box(M.trim, cx, G + 9, cz, len, 0.5, t + 0.4, ry);                                                  // string course
        b.box(M.trim, cx, G + h - 1.2, cz, len, 1.1, t + 0.9, ry);                                            // corbel line
        const nx = -dz / len, nz = dx / len, ns = Math.floor(len / 9);
        for (let k = 0; k < ns; k++) { const u = (k + 0.5) / ns - 0.5; for (const sd of [-1, 1]) { const px = cx + (dx / len) * u * len + nx * sd * (t / 2 + 0.06), pz = cz + (dz / len) * u * len + nz * sd * (t / 2 + 0.06); b.box(M.dark, px, G + 14, pz, 0.4, 3.2, 0.2, ry, 0xffffff, 0, 0); if (k % 2) arch(b, M.dark, px + nx * sd * 0.04, G + 14, pz + nz * sd * 0.04, ry, 0.8, 2.4, 0.15); }}
      }
    }
    /** Small timbered / plastered hall with plinth, courses, arched lit windows, door, ridge cap and chimney. */
    function hall(x, z, o) {
      const { w, d, h, ry = 0, wall = M.plaster, wc = 0xe8dfc8, rf = M.roof, rc = 0x7e8eae, rh = Math.min(w, d) * 0.62, doorSide = 1, chimney = true, y = G } = o, L = loc(x, z, ry), col = tint(rt, 0.1, 0.04);
      b.box(M.greyD, x, y - 1.5, z, w + 0.6, 2.4, d + 0.6, ry, col); b.box(wall, x, y - 0.4, z, w, h + 0.4, d, ry, wc);
      for (const sx of [-0.5, 0.5]) for (const sz of [-1, 1]) { const [px, pz] = L(sx * w, sz * (d / 2 + 0.03)); b.box(M.woodD, px, y, pz, 0.35, h, 0.3, ry); }
      b.box(M.woodD, x, y + h * 0.52, z, w + 0.12, 0.28, d + 0.12, ry); b.box(M.woodD, x, y + h - 0.35, z, w + 0.2, 0.5, d + 0.2, ry);
      b.prism(rf, x, y + h, z, w + 1.2, rh, d + 1.2, ry, jit(rc, rt, 0.01, 0.06, 0.05)); b.box(M.roofD, x, y + h + rh - 0.1, z, w + 1.3, 0.35, 0.6, ry, 0x9aa8c4);
      const nW = Math.max(2, Math.round(w / 3.6));
      for (const sz of [-1, 1]) for (let i = 0; i < nW; i++) { const lx = (i - (nW - 1) / 2) * (w / nW); if (sz === doorSide && Math.abs(lx) < 1.3) continue; const [px, pz] = L(lx, sz * (d / 2 + 0.06)); arch(b, rt() < 0.8 ? M.win : M.dark, px, y + h * 0.28, pz, ry + (sz < 0 ? Math.PI : 0), 0.9, 2.2, 0.12); }
      const [dx0, dz0] = L(0, doorSide * (d / 2 + 0.08)); arch(b, M.door, dx0, y - 0.1, dz0, ry + (doorSide < 0 ? Math.PI : 0), 1.7, 2.8, 0.2);
      if (chimney) { const [cx, cz] = L(w * 0.28, 0); b.box(M.grey, cx, y + h * 0.6, cz, 1.3, h * 0.4 + rh + 1.6, 1.3, ry); b.box(M.trim, cx, y + h + rh + 1.6, cz, 1.8, 0.35, 1.8, ry); chim.push([cx, y + h + rh + 2.4, cz]); }
    }
    function lampPost(x, y, z, h = 3) { b.cyl(M.iron, x, y, z, 0.12, h, { seg: 5 }); b.box(M.iron, x, y + h, z, 0.5, 0.12, 0.5); b.box(M.lamp, x, y + h + 0.12, z, 0.34, 0.5, 0.34); b.box(M.iron, x, y + h + 0.62, z, 0.5, 0.1, 0.5); lampPts.push([x, y + h + 0.4, z]); }

    // ---- the two matching castles, mirrored across the river ---------------------------------------------------------------
    const castle = (s) => {
      const cz = s * 105, W = 48, D = 37, ptsW = [[-W, cz - D], [W, cz - D], [W, cz + D], [-W, cz + D]];
      curtain(ptsW);
      for (const [x, z] of ptsW) drum(x, z, { r: 6.5, h: 32, roofH: 12 });
      for (const x of [-W / 2, W / 2]) drum(x, cz - s * D, { r: 5, h: 28, seg: 10, roofH: 10, windows: 2 });                  // river-side flank towers
      // barbican gatehouse on the road side: slate-capped twin drums over an arched, portcullised passage
      const gz = cz + s * D;
      K.gatehouse(b, 0, gz, { y: G, ry: 0, mat: M.grey, roofMat: M.roof, w: 22, d: 10, h: 28, gate: 6.5, wood: M.woodD, towerR: 5.5, color: 0xeceef2, roofColor: BLUE });
      for (const sd of [-1, 1]) { b.box(M.dark, 0, G, gz + sd * 5.12, 6.6, 7.4, 0.25); arch(b, M.dark, 0, G, gz + sd * 5.14 - (sd < 0 ? 0.2 : 0), sd < 0 ? Math.PI : 0, 6.6, 8, 0.2); for (let i = -3; i <= 3; i++) b.box(M.iron, i * 0.9, G + 0.4, gz + sd * 5.3, 0.16, 6.2, 0.16); b.box(M.trim, 0, G + 7.4, gz + sd * 5.3, 8.6, 0.8, 0.8); for (const sx of [-1, 1]) lampPost(sx * 4.4, G, gz + sd * 6.6, 3.2); }
      // keep that the bridge springs from
      const kz = cz - s * 24, kw = 40, kd = 26, kh = 44, kc = tint(rt, 0.06, 0.04);
      b.box(M.greyD, 0, G - 1.5, kz, kw + 1.8, 4.4, kd + 1.8, 0, 0xd0d2d8); b.box(M.grey, 0, G - 1, kz, kw, kh + 1, kd, 0, kc);
      for (const k of [0.3, 0.62]) b.box(M.trim, 0, G + kh * k, kz, kw + 0.7, 0.6, kd + 0.7);
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) b.box(M.trim, sx * (kw / 2), G, kz + sz * (kd / 2), 1.4, kh, 1.4, 0, 0xf2f2f4);   // corner quoins
      for (let i = -3; i <= 3; i++) for (const t of [0.2, 0.46]) { arch(b, (i + Math.round(t * 10)) % 3 ? M.win : M.dark, i * 5.2, G + kh * t, kz + s * (kd / 2 + 0.05) * -1, s > 0 ? Math.PI : 0, 1.5, 4, 0.2); }
      b.box(M.greyD, 0, G + kh, kz, kw + 2, 1.4, kd + 2, 0, 0xcfd2d8); b.pyramid(M.roof, 0, G + kh + 1.4, kz, kw - 3, 8, kd - 3, 0, 0x7a88a6);
      const nm = 17; for (let i = 0; i < nm; i++) { const u = (i + 0.5) / nm; for (const [ox, oz, sx2, sz2] of [[(u - 0.5) * kw, kd / 2 + 0.5, 1.4, 0.8], [(u - 0.5) * kw, -kd / 2 - 0.5, 1.4, 0.8]]) b.box(M.trim, ox, G + kh + 1.4, kz + oz, sx2, 1.2, sz2); }
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) drum(sx * (kw / 2), kz + sz * (kd / 2), { r: 4, h: kh + 6, seg: 10, roofH: 10, windows: 2 });
      // long hall, barracks, stables, toll-house
      hall(-28, cz + s * 8, { w: 18, d: 9, h: 8, ry: Math.PI / 2 });
      hall(28, cz + s * 6, { w: 14, d: 9, h: 7, ry: Math.PI / 2, rc: 0x8a96b4 });
      hall(14, cz + s * 26, { w: 7, d: 6, h: 4.5, wall: M.wood, wc: 0xb89a74, rf: M.roofD, rc: 0xb4c0d6, chimney: false });
      b.box(M.woodD, 10, G, cz + s * 33, 0.4, 3, 0.4); b.box(M.wood, 10.5, G + 2.6, cz + s * 33, 5, 0.3, 0.3); b.box(M.lamp, 13, G + 2.1, cz + s * 33, 0.3, 0.45, 0.3);  // toll bar
      b.box(M.cobble, 0, G - 0.12, cz, 94, 0.34, 72, 0, 0xc0bcb0);
      // well, barrels and crates
      b.cyl(M.greyD, -2, G, cz + s * 14, 1.6, 1.1, { seg: 10 }); b.cyl(M.dark, -2, G + 1.05, cz + s * 14, 1.2, 0.1, { seg: 10 });
      for (let i = 0; i < 9; i++) { const a = rt() * TAU, rr = 4 + rt() * 3, px = 22 + Math.cos(a) * rr, pz = cz + s * 20 + Math.sin(a) * rr; if (i % 2) b.cyl(M.wood, px, G, pz, 0.55, 1.0, { seg: 8, top: 0.92, color: tint(rt, 0.3, 0.1) }); else b.box(M.woodD, px, G, pz, 1.1, 1.0, 1.1, rt() * 3); }
      for (const sx of [-1, 1]) for (const dz of [-14, 4, 18]) lampPost(sx * 8, G, cz + s * dz, 3);
    };
    castle(-1); castle(1);

    // ---- the bridge: massive grey stone viaduct of arches with the Water Tower on the crown ------------------------------------
    {
      const top = []; for (let z = -68; z <= 68.01; z += 4) top.push([z, deckY(z)]);
      const sh = new THREE.Shape(); sh.moveTo(-68, -10); for (const p of top) sh.lineTo(p[0], p[1]); sh.lineTo(68, -10); sh.closePath();
      const spans = [-47, -23, 23, 47];
      for (const zc of spans) { const hw = 9.6, rs = 2, rh = 18, hole = new THREE.Path(); hole.moveTo(zc - hw, -9); hole.lineTo(zc - hw, rs); hole.absellipse(zc, rs, hw, rh, Math.PI, 0, true); hole.lineTo(zc + hw, -9); hole.closePath(); sh.holes.push(hole); }
      const gb = new THREE.ExtrudeGeometry(sh, { depth: 11, bevelEnabled: false, curveSegments: 12 }); gb.translate(0, 0, -5.5); gb.rotateY(-Math.PI / 2);
      b.addGeometry(M.grey, gb, new THREE.Matrix4(), 0xe4e6ea);
      for (const zc of spans) { // archivolt rings, proud of both faces
        const o = new THREE.Shape(), hw = 9.6, rs = 2, rh = 18; o.moveTo(zc - hw - 1.1, -9); o.lineTo(zc - hw - 1.1, rs); o.absellipse(zc, rs, hw + 1.1, rh + 1.1, Math.PI, 0, true); o.lineTo(zc + hw + 1.1, -9); o.closePath();
        const ih = new THREE.Path(); ih.moveTo(zc - hw + 0.3, -9); ih.lineTo(zc - hw + 0.3, rs); ih.absellipse(zc, rs, hw - 0.3, rh - 0.3, Math.PI, 0, true); ih.lineTo(zc + hw - 0.3, -9); ih.closePath(); o.holes.push(ih);
        const gr = new THREE.ExtrudeGeometry(o, { depth: 11.8, bevelEnabled: false, curveSegments: 12 }); gr.translate(0, 0, -5.9); gr.rotateY(-Math.PI / 2); b.addGeometry(M.trim, gr, new THREE.Matrix4(), 0xdcdee2);
      }
      // parapets with merlons and coping following the crown of the road; lanterns on posts
      for (const sd of [-1, 1]) {
        for (let z = -66; z < 66; z += 3) { const y0 = deckY(z), y1 = deckY(z + 3); strut(b, M.grey, [sd * 5.2, y0, z], [sd * 5.2, y1, z + 3], 0.8, 0xe2e4e8, 1.3); }
        for (let z = -66; z < 66; z += 6) { const y0 = deckY(z); b.box(M.trim, sd * 5.2, y0 + 1.3, z + 1.5, 0.95, 0.5, 1.7); }
        for (let z = -60; z <= 60; z += 15) { if (Math.abs(z) < 12) continue; lampPost(sd * 5.2, deckY(z) + 1.3, z, 2.6); }
      }
      b.box(M.trim, 0, DECK + RISE - 0.5, 0, 12.4, 1.2, 40, 0, 0xe4e6ea);
      // water tower on the crown: square body, machicolated crown, corner turrets, slate pyramid, arched passages through its base
      const ty = DECK + RISE;
      b.box(M.grey, 0, ty, 0, 16, 40, 18, 0, 0xe0e2e8); b.box(M.greyD, 0, ty - 1, 0, 17.6, 3, 19.6, 0, 0xd0d2d8);
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) b.box(M.trim, sx * 8, ty, sz * 9, 1.3, 40, 1.3, 0, 0xf2f2f4);
      for (const k of [0.28, 0.56]) b.box(M.trim, 0, ty + 40 * k, 0, 16.7, 0.6, 18.7);
      b.box(M.trim, 0, ty + 38, 0, 18.4, 2, 20.4); b.box(M.greyD, 0, ty + 40, 0, 19, 1.2, 21, 0, 0xd2d4da);
      for (let i = 0; i < 9; i++) for (const sd of [-1, 1]) { b.box(M.trim, -8 + i * 2, ty + 41.2, sd * 10.2, 1.2, 1.3, 0.8); }
      for (let i = 0; i < 8; i++) for (const sd of [-1, 1]) { b.box(M.trim, sd * 9.2, ty + 41.2, -8 + i * 2.3, 0.8, 1.3, 1.2); }
      b.pyramid(M.roof, 0, ty + 41, 0, 15, 19, 17, 0, 0x7c8aa8); b.pyramid(M.roofD, 0, ty + 41 + 19 * 0.64, 0, 15 * 0.36, 19 * 0.36, 17 * 0.36, 0, 0x93a0bb); b.cyl(M.iron, 0, ty + 60, 0, 0.14, 5, { seg: 4 });
      for (const sz of [-1, 1]) {
        arch(b, M.dark, 0, ty - 0.1, sz * 9.12 - (sz < 0 ? 0.25 : 0), sz < 0 ? Math.PI : 0, 7, 9, 0.3);
        for (let i = -3; i <= 3; i++) b.box(M.iron, i * 0.9, ty + 0.3, sz * 9.4, 0.2, 7.4, 0.2); b.box(M.trim, 0, ty + 9, sz * 9.4, 9, 0.8, 0.8);
        for (const [x, y] of [[-4.6, 22], [4.6, 22], [-4.6, 14], [4.6, 14], [0, 28], [0, 17]]) arch(b, M.win, x, ty + y, sz * 9.1 - (sz < 0 ? 0.2 : 0), sz < 0 ? Math.PI : 0, 1.4, 3.6, 0.2);
      }
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) drum(sx * 8.8, sz * 9.8, { y: ty + 38, r: 2.5, h: 8, seg: 8, roofH: 7, windows: 1 });
    }
    // kingsroad (N-S) approaches: cobbled, with wheel-rutted edges
    b.ribbon(M.cobble, [[8, -440], [0, -320], [0, -145]], 8, heightAt, 0.15, 0xb4ae9e); b.ribbon(M.cobble, [[0, 145], [-6, 320], [10, 440]], 8, heightAt, 0.15, 0xb4ae9e);
    b.ribbon(M.cobble, [[8, -440], [0, -320], [0, -145]], 10.4, heightAt, 0.1, 0x6a6350); b.ribbon(M.cobble, [[0, 145], [-6, 320], [10, 440]], 10.4, heightAt, 0.1, 0x6a6350);
    // reed-hut hamlets on the banks, fishing jetties with nets
    const hut = (x, z, ry) => { const y = H(x, z); hall(x, z, { y, w: 6, d: 7, h: 3, ry, wall: M.wood, wc: 0xb09068, rf: M.thatch, rc: 0xd8c690, rh: 2.8, chimney: true }); };
    hut(110, -80, 0.2); hut(126, -62, 1); hut(-120, 80, 0.6); hut(-136, 62, 0); hut(104, -102, 2.4); hut(-104, 104, 0.3);
    K.pier(b, 76, 0.8, -36, { len: 14, w: 3, ry: Math.PI / 2, mat: M.wood, color: 0xb8a080 }); K.pier(b, -74, 0.8, 38, { len: 12, w: 2.6, ry: -Math.PI / 2, mat: M.wood, color: 0xb8a080 });
    lampPost(77, 1.3, -50, 2.2); lampPost(-74, 1.3, 52, 2.2);
    root.add(b.build({}));

    // ---- marsh: reeds along the shore, alders, willows and a few dead stumps -------------------------------------------------
    const reeds = new Inst(GG.cone(4), M.reed, { cast: false }), rr = K.rng(9); let nr = 0;
    for (let i = 0; i < q.dens(9000) && nr < q.dens(2000); i++) { const x = rr.range(-420, 420), z = rr.range(-420, 420), h = H(x, z); if (h < -0.4 || h > 1.5 || Math.abs(x) < 60 && Math.abs(z) < 170) continue; nr++; reeds.add(x, Math.max(h, -0.3), z, 0.2, rr.range(1.6, 3.2), 0.2, rr() * 6, rr.pick([0x8c9a50, 0xa3a860, 0x6f8447, 0xb4a56a, 0x7d8a48])); }
    root.add(reeds.build());
    function broadleaf({ rng, count, bounds, poly, avoid, scale = [1, 1.5], minDist = 6, greens, willow = false }) {
      const pts = K.scatter({ rng, count, bounds, poly, minDist, avoid }), grp = new THREE.Group();
      const trunk = new Inst(GG.cyl(6, 0.62), M.bark), A = new Inst(GG.sphere(7), M.leaf), B = new Inst(GG.sphere(7), M.leaf), Cc = new Inst(GG.sphere(7), M.leaf);
      for (const [x, z] of pts) {
        const k = rng.range(scale[0], scale[1]), y = H(x, z), gc = jit(rng.pick(greens), rng, 0.02, 0.1, 0.05), a = rng() * 6;
        trunk.add(x, y - 0.3, z, 0.55 * k, 3.9 * k, 0.55 * k, a, jit(0x4a3a2c, rng, 0.01, 0.05, 0.05));
        A.add(x, y + 2.7 * k, z, 2.9 * k, willow ? 3.4 * k : 2.5 * k, 2.9 * k, a, gc);
        B.add(x + Math.cos(a) * 1.5 * k, y + 3.6 * k, z + Math.sin(a) * 1.5 * k, 2.1 * k, 1.9 * k, 2.1 * k, a, jit(rng.pick(greens), rng, 0.02, 0.1, 0.06));
        Cc.add(x - Math.cos(a) * 1.3 * k, y + 3.2 * k, z - Math.sin(a) * 1.3 * k, 1.8 * k, 1.6 * k, 1.8 * k, a, jit(rng.pick(greens), rng, 0.02, 0.1, 0.07));
      }
      for (const i of [trunk, A, B, Cc]) if (i.items.length) grp.add(i.build());
      return grp;
    }
    const keepClear = (x, z) => Math.abs(x) < 70 && Math.abs(z) < 175 || H(x, z) < 1.2 || Math.abs(x) < 14;
    root.add(broadleaf({ rng: K.rng(5), count: q.dens(300), bounds: [-480, -480, 480, 480], avoid: (x, z) => keepClear(x, z) || H(x, z) > 40, scale: [1.1, 1.9], minDist: 8, greens: [0x4d6e38, 0x587a3e, 0x41603a, 0x5d7d40, 0x6a8644] }));
    root.add(broadleaf({ rng: K.rng(6), count: q.dens(60), bounds: [-300, -300, 300, 300], avoid: (x, z) => keepClear(x, z) || H(x, z) > 3.2 || H(x, z) < 0.6, scale: [1.2, 1.7], minDist: 10, willow: true, greens: [0x7e9150, 0x8c9c58, 0x6f8448] }));
    root.add(K.forest({ rng: K.rng(7), count: q.dens(280), bounds: [-700, -700, 700, 700], heightAt, species: 'pine', tint: 0x2c4a35, scale: [1.5, 2.6], minDist: 8, avoid: (x, z) => H(x, z) < 26 || Math.hypot(x, z) < 330 }));

    // night dimming for self-lit sprites (smoke, clouds): glow materials expose the host's night level
    const nightProbe = glow(0xffffff, 1), dimmers = [], night = () => K.clamp((nightProbe.color.r - 0.14) / 1.25, 0, 1);
    const dimmed = (col, k = 0.8) => { const base = col.clone(); dimmers.push((n) => col.copy(base).multiplyScalar(1 - k * n)); };
    const smoke = (...a) => { const p = K.smoke(...a); dimmed(p.material.uniforms.uColor.value); return p; }, cloudsD = (...a) => { const g = K.clouds(...a); dimmed(g.children[0].material.color); return g; };
    ctx.onUpdate(() => { const n = night(); for (const f of dimmers) f(n); });
    // ---- life: caravans crossing the bridge, boats, banners, smoke, ravens, river mist -----------------------------------------
    const wk = K.walkers({ paths: [[[3, -148], [3, -70], [3, 0], [3, 70], [3, 148]], [[-3, 148], [-3, 70], [-3, -70], [-3, -148]], [[0, -420], [0, -150]], [[0, 420], [0, 150]]], heightAt: (x, z) => deckY(z), count: q.dens(22), rng: K.rng(7), colors: [0x6a5a48, 0x3e4a5c, 0x5c2e2a, 0x4a5236, 0x54545a, 0x2c3a5a] });
    root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const carts = [0, 1, 2].map((i) => { const g = new THREE.Group(), cb = new Batch(); cb.box(M.wood, 0, 1.0, 0, 3, 0.35, 5, 0, 0x8a6a48); for (const sx of [-1, 1]) { cb.box(M.woodD, sx * 1.5, 1.3, 0, 0.2, 0.8, 5); for (const sz of [-1.6, 1.6]) cb.cyl(M.woodD, sx * 1.62, 0.05, sz, 0.55, 0.22, { seg: 10 }); }
      cb.box(M.plaster, 0, 1.4, -0.4, 2.7, 1.6, 3.2, 0, [0xcdbf9a, 0x7a8aa0, 0xa86f4a][i]); cb.prism(M.plaster, 0, 2.95, -0.4, 3.0, 0.9, 3.2, Math.PI / 2, [0xcdbf9a, 0x7a8aa0, 0xa86f4a][i]); cb.box(M.dark, 0, 1.2, -2.1, 1.4, 1.3, 0.1);
      g.add(cb.build({ shadow: true })); root.add(g); return g; });
    ctx.onUpdate((dt, t) => carts.forEach((g, i) => { const u = (((t * 0.03 + i / 3) % 1) + 1) % 1, z = -170 + u * 340; g.position.set(i % 2 ? 2.8 : -2.8, deckY(z) + 0.1, i % 2 ? -z : z); g.rotation.y = i % 2 ? Math.PI : 0; const nz = i % 2 ? -1 : 1, d = deckY(z + nz) - deckY(z - nz); g.rotation.x = Math.atan2(d, 2) * (i % 2 ? 1 : -1) * -1; }));
    const hullW = tri('wood', { color: 0xcaa888, scale: 3, snow: false, side: THREE.DoubleSide });
    const boats = [0, 1, 2].map((i) => { const s = makeShip(hullW, i === 1 ? 'barge' : 'cog', 11 + i * 2, [0x6a4a30, 0x5a4634, 0x7a5636][i], [0xd2c8a8, 0xbcb298, 0xc8bb98][i], 21 + i); root.add(s); return s; });
    ctx.onUpdate((dt, t) => boats.forEach((s, i) => { s.position.set(i % 2 ? 220 - (t * 4 + 100 + i * 60) % 440 : -220 + ((t * (4 + i) + i * 300) % 440), 0.2, i === 2 ? 14 : 6 * (i ? -1 : 1)); s.rotation.y = i % 2 ? Math.PI : 0; animSails(s, t, i); s.position.y = 0.2; }));
    const bnr = [];
    for (const s of [-1, 1]) for (const [x, z] of [[-48, 105 * s - 37], [48, 105 * s - 37], [-48, 105 * s + 37], [48, 105 * s + 37]]) bnr.push({ x, y: G + 53, z, w: 3, h: 9, color: 0x2a58a8, ry: 0.3 });
    bnr.push({ x: 0, y: DECK + RISE + 64, z: 0, w: 4, h: 11, color: 0x2a58a8, ry: 0.4 }); for (const s of [-1, 1]) bnr.push({ x: 0, y: G + 62, z: 105 * s - s * 24, w: 4, h: 10, color: 0x2a58a8, ry: 0.2 });
    root.add(K.banners(bnr));
    const fire = K.fires([[-4, G + 7.5, -142], [4, G + 7.5, 142], [-4, G + 7.5, 142], [4, G + 7.5, -142], ...lampPts], { size: 6, light: q.low ? 0 : 3, intensity: 55 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    root.add(smoke(chim.concat([[110, 8, -80], [-120, 8, 80]]), { color: 0xaeb2b4, size: 20, rise: 18, opacity: 0.26 }));
    root.add(smoke(Array.from({ length: 12 }, (_, i) => [-300 + i * 55, 1.5, RIVER[Math.min(6, Math.floor(i / 2))][1] * 0.3 + ((i % 2) ? 14 : -14)]), { color: 0xcfd6d8, size: 90, rise: 8, opacity: 0.1, perStack: 5, spread: 12 }));
    const rv = K.birds({ center: [0, 70, 0], radius: 110, count: q.dens(8), color: 0x1a1a1e, size: 1.2, spreadY: 14, seed: 6 }); root.add(rv); ctx.onUpdate((dt, t) => rv.userData.update(t));
    root.add(cloudsD({ y: 260, extent: 800, count: 12, opacity: 0.5, color: 0xb4babe }));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, G + dy, z], r });
    return {
      radius: 250, center: [0, 10, 0], minDistance: 16,
      hero: { pos: [230, 100, 60], target: [0, 24, 0] },
      climate: {
        atmos: 'day', weather: 'rain',
        tint: {
          dawn: { top: 0x56648a, horizon: 0xc4aaa4, fog: 0x9aa0a6, fogD: 0.0017, sunC: 0xffc89c, sunI: 2.2, hemiSky: 0x8f9cbc, hemiGround: 0x4c4842, hemiI: 0.85 },
          day: { top: 0x667688, horizon: 0xb4bcc0, fog: 0x9aa6aa, fogD: 0.0015, sunC: 0xf4eadc, sunI: 1.6, hemiSky: 0xa4b2c0, hemiGround: 0x727260, hemiI: 1.1 },
          dusk: { top: 0x2e3858, horizon: 0xc8886c, fog: 0x82727c, fogD: 0.0019, sunC: 0xff9c64, sunI: 2.1, water: 0.55, hemiSky: 0x7a84b0, hemiGround: 0x403a3c, hemiI: 0.7 },
          night: { top: 0x070c20, horizon: 0x2a3858, fog: 0x1a2438, fogD: 0.0021, sunC: 0x9fb4e8, sunI: 1.2, hemiSky: 0x62749e, hemiGround: 0x2a2e3c, hemiI: 1.1 },
        },
      },
      landmarks: {
        'north-castle': lm(0, -105, 40, 52), 'south-castle': lm(0, 105, 40, 52), bridge: { pos: [0, DECK + RISE * 0.5 + 6, 38], r: 24 }, 'water-tower': { pos: [0, DECK + RISE + 62, 0], r: 14 },
        'north-barbican': lm(0, -142, 14, 32), 'south-barbican': lm(0, 142, 14, 32), 'green-fork': lm(90, 0, 36, 4), 'moat-channels': lm(57, -130, 14, 2), kingsroad: lm(2, 240, 30, 4),
      },
    };
  },
};
