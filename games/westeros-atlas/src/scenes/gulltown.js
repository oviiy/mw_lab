// Gulltown — the Vale's port on the Narrow Sea. Book/reference anchors: a walled port town on a natural harbour; heavy trade with the Free Cities;
// House Grafton; the Motherhouse of Maris (a septry of silent sisters, on an island in the harbour per reference sources); the Arryn cadet branch.
// The lighthouse, sea-wall mole shape, market and street plan are interpretation (see content/gulltown.js). Colours deliberately differ from
// Lannisport (red-gold) and White Harbor (white stone): sun-bleached sand plaster, slate-blue roofs, terraced up a steep hill.
//
// Visual language: a near-circular harbour ringed by a pale quay and arcaded warehouses; sand, ochre and whitewash houses stepping up
// retaining-wall terraces under slate-blue roofs, cypress and olive in the gardens, a banded lighthouse that throws a beam at night.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const TAU = Math.PI * 2;
const BAY = [0, 65], BAY_R = 82, ISLE = [-30, 106], KEEP = [-10, -128], GULL = [52, -96];
const WALLP = [[-142, 62], [-152, -50], [-100, -118], [-40, -152], [30, -156], [100, -125], [150, -55], [142, 62]];
const MOLE_W = [[-92, 62], [-90, 98], [-74, 130], [-48, 150], [-22, 156]], MOLE_E = MOLE_W.map(([x, z]) => [-x, z]);

const jit = (hex, r, dh = 0.012, ds = 0.05, dl = 0.03) => new THREE.Color(hex).offsetHSL((r() - 0.5) * 2 * dh, (r() - 0.5) * 2 * ds, (r() - 0.5) * 2 * dl);
const tint = (r, v = 0.12, w = 0.05) => { const k = 1 - v * r(); return new THREE.Color(k, k * (1 - w * r()), k * (1 - w * r() * 1.4)); };
const _up = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _d = new THREE.Vector3(), _e = new THREE.Euler();
const loc = (cx, cz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c]; };
function strut(b, mat, p, q, w, color = 0xffffff, d = w) {
  _d.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); const len = _d.length(); if (len < 1e-3) return;
  _q.setFromUnitVectors(_up, _d.multiplyScalar(1 / len)); _m.compose(_p.set(p[0], p[1], p[2]), _q, _s.set(w, len, d)); b.addGeometry(mat, G.box(), _m, color);
}
const _quad = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
function quad(b, mat, x, y, z, ry, w, h) { _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(w, h, 1)); b.addGeometry(mat, _quad, _m, 0xffffff); }
const archCache = new Map();
function archGeo(w, h, depth) {
  const k = `${w}|${h}|${depth}`; let g = archCache.get(k); if (g) return g;
  const r = w / 2, s = new THREE.Shape(); s.moveTo(-r, 0); s.lineTo(-r, h - r); s.absarc(0, h - r, r, Math.PI, 0, true); s.lineTo(r, 0); s.closePath();
  g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 4 }); archCache.set(k, g); return g;
}
function arch(b, mat, x, y, z, ry, w, h, depth = 0.25, color = 0xffffff) { _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(1, 1, 1)); b.addGeometry(mat, archGeo(w, h, depth), _m, color); }

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root;
    const coast = (x) => 72 + 14 * Math.sin(x * 0.018 + 1) + 6 * Math.sin(x * 0.05);
    const TER = 3.4, terr = (h) => { const f = h / TER, fl = Math.floor(f), fr = f - fl; return (fl + K.smoothstep(0.74, 1.0, fr)) * TER; };
    const heightAt = (x, z) => {
      const cz = coast(x), m = 1 - K.smoothstep(cz - 10, cz + 6, z), r = Math.hypot(x - BAY[0], z - BAY[1]);
      const dEdge = Math.max(0, Math.min(cz - z, r - BAY_R)), n = (K.fbm(x * 0.02, z * 0.02, 3, 4) - 0.5) * 9;
      let land = 3.2 + 0.62 * Math.max(0, dEdge - 30) + n * K.smoothstep(40, 140, dEdge);
      land += K.smoothstep(150, 420, -z) * (50 + K.fbm(x * 0.005, z * 0.005, 3, 2) * 60);
      const tm = (1 - K.smoothstep(1.3, 2.5, Math.hypot(x / 200, (z + 50) / 140))) * K.smoothstep(2, 9, land) * (1 - K.smoothstep(70, 120, land));
      land = K.lerp(land, terr(land), tm * 0.92);
      let h = K.lerp(-9, land, m);
      const f = 1 - K.smoothstep(BAY_R - 6, BAY_R + 6, r); h = h * (1 - f) + -7 * f;
      const di = Math.hypot(x - ISLE[0], z - ISLE[1]); h = Math.max(h, -9 + (1 - K.smoothstep(11, 22, di)) * 14);
      return h;
    };
    const H = heightAt, c = new THREE.Color(), C3 = (h) => new THREE.Color(h);
    const sandC = C3(0xb8a77c), grass = C3(0x5e8442), olive = C3(0x7a9258), dry = C3(0xb8aa74), slateR = C3(0x6d7078), stoneR = C3(0xa8a08c), shingle = C3(0xd2c392), garden = C3(0x5f7d44), rockHi = C3(0xb4a98e);
    root.add(K.terrain({ size: 1100, seg: q.seg(180), heightAt, kind: 'sand', scale: 16, colorAt: (x, z, h, s) => {
      const n1 = K.fbm(x * 0.012, z * 0.012, 3, 1), n2 = K.fbm(x * 0.05, z * 0.05, 2, 2), r = Math.hypot(x - BAY[0], z - BAY[1]);
      c.copy(grass).lerp(olive, K.clamp(n1 * 1.5 - 0.2, 0, 0.8)).lerp(dry, K.clamp(0.25 - h * 0.006 + n2 * 0.35, 0, 0.3)).lerp(garden, K.smoothstep(0.5, 0.7, n2) * K.smoothstep(4, 14, h) * (1 - K.smoothstep(40, 80, h)) * 0.55);
      c.lerp(sandC, K.clamp(0.9 - h * 0.14 + K.fbm(x * 0.03, z * 0.03, 2, 3) * 0.3, 0, 0.4));
      const strata = 0.5 + 0.5 * Math.sin(h * 0.9 + K.fbm(x * 0.04, z * 0.04, 2, 4) * 6), riser = K.clamp((s - 0.04) * 6, 0, 1);
      c.lerp(strata > 0.5 ? rockHi : stoneR, riser * (h < 80 ? 0.7 : 0.5)); if (h > 70) c.lerp(slateR, K.clamp((h - 70) * 0.02, 0, 0.6) * (0.5 + n2));
      if (h > 6 && h < 70 && riser < 0.25 && !K.pointInPoly(x, z, WALLP) && K.fbm(x * 0.004, z * 0.004, 2, 11) > 0.38) { const v = Math.floor(K.noise2(x * 0.016, z * 0.02, 9) * 4) / 4; c.lerp(v < 0.25 ? garden : v < 0.5 ? dry : v < 0.75 ? olive : shingle, 0.5); }
      if (h < 3.6 && r > BAY_R - 6) c.lerp(shingle, 0.6);
      if (h < 0.2) c.lerp(shingle, 0.8);
      return c; } }));
    const sea = K.water({ w: 1100, d: 1100, seg: q.seg(105), level: 0, heightAt, deep: 0x15465f, shallow: 0x46a0a2, opacity: 0.92, choppy: 0.9, speed: 0.9 });
    root.add(sea); ctx.registerWater(sea);
    const farSea = K.water({ w: 8000, d: 8000, seg: 6, level: -0.4, heightAt: () => -20, deep: 0x1b5a74, shallow: 0x1b5a74, opacity: 0.93, choppy: 0.6, speed: 0.6, center: [0, 4400] }); root.add(farSea); ctx.registerWater(farSea);
    { const inX = (x) => 550 - Math.abs(x), inZ = (z) => z + 550, cF = C3(0x7a8454), cH = C3(0x7c7a6c);
      root.add(K.terrain({ w: 8000, d: 6800, seg: q.seg(80), center: [0, -2800], heightAt: (x, z) => { const h = H(x, z), dIn = Math.max(0, Math.min(inX(x), inZ(z))); return h < 3 ? -25 : K.lerp(h, -40, K.smoothstep(0, 90, dIn)); }, kind: 'rock', scale: 40, colorAt: (x, z, h) => c.copy(cF).lerp(cH, K.clamp(h * 0.01, 0, 0.7)) })); }

    // ---- materials: sun-bleached plaster, slate-blue roofs, sand-coloured limestone
    const T = (k, color, scale = 7, o = {}) => tri(k, { color, scale, snow: false, ...o });
    const M = {
      stone: T('stone', 0xcdbf9f, 7, { bump: 0.6 }), stoneD: T('stone', 0x9a8d74, 7), stoneW: T('stone', 0x7c735f, 8), trim: T('stone', 0xeee4c8, 6), marble: T('marble', 0xf2ede0, 7),
      slate: T('slate', 0x4d5f78, 5, { bump: 0.5 }), slateB: T('slate', 0x5f7690, 5), slateD: T('slate', 0x3a495e, 5), slateG: T('slate', 0x6a717c, 5), band: T('plaster', 0x93a8c2, 6),
      sand: T('plaster', 0xdcc9a0, 6), ochre: T('plaster', 0xd1a066, 6), white: T('plaster', 0xf0ebde, 6), clay: T('plaster', 0xc9a98a, 6), sea: T('plaster', 0xb6cacb, 6),
      wood: T('wood', 0x6a4d33, 4), woodD: T('wood', 0x46321f, 4), woodW: T('wood', 0xa58a64, 4), cobble: T('cobble', 0x9a9080, 8), quay: T('cobble', 0xb4aa94, 6), hullW: T('wood', 0x8a6a4c, 3, { side: THREE.DoubleSide }),
      iron: flat(0x30343a, { metal: 0.6, rough: 0.5 }), dark: flat(0x14100c, { rough: 1 }), door: flat(0x35291d, { rough: 0.9 }), gold: flat(0xd8b050, { metal: 0.3, rough: 0.4 }), cloth: flat(0xffffff, { rough: 1 }), glass: flat(0xb8d8ea, { rough: 0.3 }),
      win: glow(0xffc46b), lamp: glow(0xffa24a, 1.25), lampH: glow(0xffe8a0, 1.4),
    };
    const b = new Batch(), rt = K.rng(2024);

    // ---- builders
    function drum(x, y, z, r, h, o = {}) {
      const { seg = 12, taper = 0.88, roof = 'cone', roofH = r * 2.4, stone = M.stone, base = M.stoneW, col = 0xffffff, slits = 2, lit = 1, rings = [0.5], roofMat = M.slate } = o, rA = (t) => r * (1 - (1 - taper) * t);
      b.cyl(base, x, y - 4, z, r * 1.14, 6.6, { top: 0.9, seg, color: col }); b.cyl(stone, x, y, z, r, h, { top: taper, seg, color: col });
      for (const t of rings) b.cyl(M.trim, x, y + t * h - 0.3, z, rA(t) * 1.05, 0.6, { top: 1, seg, color: col });
      for (let k = 0; k < slits; k++) { const a = k * 2.1 + r * 1.3, t = 0.2 + 0.5 * k / slits, rr = rA(t) + 0.04; b.box(M.dark, x + Math.cos(a) * rr, y + h * t, z + Math.sin(a) * rr, 0.32, 1.7, 0.16, Math.PI / 2 - a); }
      for (let k = 0; k < lit; k++) { const a = k * 2.7 + 0.6 + r, t = 0.62 + 0.1 * k, rr = rA(t) + 0.05; b.box(M.win, x + Math.cos(a) * rr, y + h * t, z + Math.sin(a) * rr, 0.5, 1.5, 0.12, Math.PI / 2 - a); }
      const yt = y + h, R2 = rA(1) * 1.28; b.cyl(M.trim, x, yt - 1.4, z, rA(1) * 1.02, 1.5, { top: 1.28, seg, color: col });
      if (roof === 'cone') { b.cyl(stone, x, yt, z, R2, 0.8, { top: 1, seg, color: col }); b.cone(roofMat, x, yt + 0.8, z, R2 * 1.08, roofH, { seg, color: tint(rt, 0.14, 0.02) }); b.cyl(M.gold, x, yt + 0.6 + roofH, z, 0.14, 2.0, { seg: 5, top: 0.5 }); }
      else { b.cyl(stone, x, yt, z, R2, 0.9, { top: 1, seg, color: col }); const n = Math.max(7, Math.round((TAU * R2) / 2.7)); for (let i = 0; i < n; i++) { const a = (i / n) * TAU; b.box(stone, x + Math.cos(a) * (R2 - 0.3), yt + 0.9, z + Math.sin(a) * (R2 - 0.3), 1.4, 1.1, 0.7, Math.PI / 2 - a, col); } }
    }
    function wallTrim(pts, { h, t, closed = false, plinth = M.stoneW, trim = M.trim, plinthH = 2.8, g0 }) {
      const n = closed ? pts.length : pts.length - 1;
      for (let i = 0; i < n; i++) {
        const A = pts[i], B = pts[(i + 1) % pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz); if (len < 0.01) continue;
        const steps = Math.max(1, Math.ceil(len / 14)), ry = Math.atan2(-dz, dx);
        for (let s = 0; s < steps; s++) {
          const t0 = s / steps, t1 = (s + 1) / steps, x0 = A[0] + dx * t0, z0 = A[1] + dz * t0, x1 = A[0] + dx * t1, z1 = A[1] + dz * t1, hf = g0 ?? H;
          const g = Math.min(hf(x0, z0), hf(x1, z1), hf((x0 + x1) / 2, (z0 + z1) / 2)), top = Math.max(hf(x0, z0), hf(x1, z1)) + h, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sl = Math.hypot(x1 - x0, z1 - z0) + 0.6;
          b.box(plinth, cx, g - 3, cz, sl + 0.2, plinthH + 3, t + 1.4, ry, tint(rt, 0.14, 0.04)); b.box(trim, cx, top - 1.0, cz, sl, 0.95, t + 0.9, ry); b.box(trim, cx, g + (top - g) * 0.55, cz, sl, 0.4, t + 0.35, ry);
        }
      }
    }
    const torches = [], stacks = [];
    function gateDress(gx, gz, y, ry, { w, d, h, gate }) {
      const L = loc(gx, gz, ry), [bx, bz] = L(0, -d * 0.2); b.box(M.dark, bx, y, bz, gate - 0.2, gate * 1.15, 0.3, ry);
      b.box(M.trim, gx, y + gate * 1.15 - 0.8, gz, gate + 1.6, 0.8, d + 0.5, ry); b.box(M.trim, gx, y + h - 1.1, gz, w, 0.95, d + 1.5, ry);
      for (const sx of [-1, 1]) { const [px, pz] = L(sx * (gate / 2 + 1.5), d / 2 + 0.45); b.box(M.iron, px, y + 3.6, pz, 0.25, 0.9, 0.25, ry); b.box(M.lamp, px, y + 4.5, pz, 0.5, 0.6, 0.5, ry); torches.push([px, y + 5.4, pz]); }
    }
    function hall(x, z, w, d, h, ry, o = {}) {
      const { wallMat = M.stone, roofMat = M.slate, col = tint(rt, 0.1, 0.04), rise = 0.7, y0 = H(x, z) } = o, L = loc(x, z, ry), rh = (d / 2 + 0.5) * rise;
      b.box(M.stoneW, x, y0 - 2, z, w + 0.5, 3.2, d + 0.5, ry, tint(rt, 0.15, 0.04)); b.box(wallMat, x, y0 - 2, z, w, h + 2, d, ry, col); b.box(M.trim, x, y0 + h - 0.5, z, w + 0.5, 0.5, d + 0.5, ry);
      b.prism(roofMat, x, y0 + h, z, w + 1.0, rh, d + 1.0, ry, tint(rt, 0.14, 0.03));
      const nw = Math.max(2, Math.floor(w / 5)); for (const sd of [-1, 1]) for (let i = 0; i < nw; i++) { const [wx, wz] = L((i + 0.5) * w / nw - w / 2, sd * (d / 2 + 0.06)); arch(b, M.win, wx, y0 + h * 0.4, wz, ry + (sd < 0 ? Math.PI : 0), 1.0, 2.4, 0.12); }
      const [cx, cz] = L(w * 0.3, 0); b.box(M.stoneD, cx, y0 + h * 0.5, cz, 1.3, h * 0.5 + rh + 1.4, 1.3, ry); stacks.push([cx, y0 + h + rh + 1.8, cz]);
    }
    const lampPosts = [];

    // ---- sea-wall: two curving moles guarding the harbour mouth; tower on the west arm, lighthouse on the east
    const sw = (pts) => { const sp = K.smoothPath(pts, 6); K.wall(b, sp, { h: 9, t: 8, mat: M.stone, capMat: M.stoneD, heightAt: () => 0, sink: 9, merlon: 1.4, color: 0xeee6d0 }); wallTrim(sp, { h: 9, t: 8, plinthH: 2, g0: () => 0 }); for (let i = 4; i < sp.length - 4; i += 6) lampPosts.push([sp[i][0], 9, sp[i][1]]); };
    sw(MOLE_W); sw(MOLE_E);
    drum(-22, 0, 156, 7.4, 22, { seg: 14, roofH: 10, col: 0xf0ead8, lit: 2, rings: [0.35, 0.7] });
    const LX = 22, LZ = 156, ly = 0;     // lighthouse: banded tapering tower, gallery, lantern room
    b.cyl(M.stoneW, LX, -8, LZ, 10.5, 14, { top: 0.88, seg: 18 }); b.cyl(M.stone, LX, 4, LZ, 8.4, 6, { top: 0.9, seg: 18, color: 0xeee6d0 });
    for (let i = 0; i < 6; i++) { const t0 = i / 6, t1 = (i + 1) / 6, r0 = 7.4 * (1 - 0.4 * t0), r1 = 7.4 * (1 - 0.4 * t1); b.cyl(i % 2 ? M.band : M.marble, LX, 9 + t0 * 46, LZ, r0, 46 / 6 + 0.2, { top: r1 / r0, seg: 18, color: i % 2 ? 0xffffff : 0xfffaf0 }); }
    b.cyl(M.trim, LX, 54.6, LZ, 5.6, 1.0, { top: 1.5, seg: 18 }); b.cyl(M.stoneD, LX, 55.6, LZ, 7.2, 0.9, { top: 1, seg: 18 });
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; b.box(M.iron, LX + Math.cos(a) * 6.9, 56.5, LZ + Math.sin(a) * 6.9, 0.2, 1.1, 0.2, 0); }
    b.cyl(M.lampH, LX, 56.4, LZ, 3.1, 5.2, { top: 0.92, seg: 12 }); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; b.box(M.iron, LX + Math.cos(a) * 3.2, 56.4, LZ + Math.sin(a) * 3.2, 0.22, 5.2, 0.22, 0); }
    b.cyl(M.iron, LX, 61.6, LZ, 3.6, 0.6, { top: 1.1, seg: 12 }); b.cone(M.slateD, LX, 62.2, LZ, 3.9, 5.5, { seg: 12 }); b.cyl(M.gold, LX, 67.5, LZ, 0.14, 2.6, { seg: 5, top: 0.5 });
    for (const [x, z] of [[-13, 150], [13, 150]]) { b.cyl(M.iron, x, 5, z, 0.16, 2.8, { seg: 5 }); b.box(M.lamp, x, 7.8, z, 0.55, 0.7, 0.55); }

    // ---- harbour quay (a pale stone rim around the bay), steps, bollards, piers, arcaded warehouses
    const qpts = Array.from({ length: 56 }, (_, i) => { const a = Math.PI * (0.05 + (i / 55) * 0.9); return [BAY[0] + Math.cos(a) * (BAY_R + 3), BAY[1] - Math.sin(a) * (BAY_R + 3)]; });
    K.wall(b, qpts, { h: 3.4, t: 6, mat: M.stone, capMat: M.trim, heightAt: () => 0, sink: 6, crenel: false, color: 0xf0e8d2 });
    for (let i = 0; i < qpts.length - 1; i += 1) { const [x, z] = qpts[i], [x2, z2] = qpts[i + 1], a = Math.atan2(-(z2 - z), x2 - x), nx = x - BAY[0], nz = z - BAY[1], l = Math.hypot(nx, nz); b.box(M.trim, x + nx / l * 0.5, 3.1, z + nz / l * 0.5, Math.hypot(x2 - x, z2 - z) + 0.4, 0.4, 7, a); if (i % 3 === 0) b.cyl(M.iron, x - nx / l * 1.8, 3.4, z - nz / l * 1.8, 0.4, 0.9, { seg: 6 }); }
    const pierA = [0.28, 0.42, 0.5, 0.58, 0.72];
    for (const a of pierA) { const x = BAY[0] + Math.cos(a * Math.PI) * (BAY_R + 1), z = BAY[1] - Math.sin(a * Math.PI) * (BAY_R + 1), ry = Math.atan2(-(BAY[1] - z), BAY[0] - x); K.pier(b, x, 1.4, z, { len: 24, w: 3.6, ry, mat: M.wood, color: 0xd8cfbc }); const L = loc(x, z, ry), [ex, ez] = L(24, 1.6); b.cyl(M.iron, ex, 1.4, ez, 0.1, 2.8, { seg: 5 }); b.box(M.lamp, ex, 4.2, ez, 0.5, 0.6, 0.5); }
    for (let i = 0; i < 13; i++) { // arcaded warehouses along the quay
      const a = Math.PI * (0.1 + i * 0.065), rr = BAY_R + 13, x = BAY[0] + Math.cos(a) * rr, z = BAY[1] - Math.sin(a) * rr; if (H(x, z) < 1) continue; const ry = -a + Math.PI / 2, L = loc(x, z, ry), y0 = H(x, z);
      hall(x, z, 20, 9, 7.4, ry, { wallMat: i % 2 ? M.sand : M.ochre, roofMat: i % 3 === 0 ? M.slateB : M.slate, col: tint(rt, 0.1, 0.05), rise: 0.5, y0 });
      for (let k = 0; k < 4; k++) { const [px, pz] = L(-7.5 + k * 5, -4.56); arch(b, M.dark, px, y0, pz, ry + Math.PI, 2.6, 4.2, 0.3); const [tx, tz] = L(-7.5 + k * 5, -4.62); b.box(M.trim, tx, y0 + 4.2, tz, 3.6, 0.35, 0.3, ry); }
    }

    // ---- town on terraces: tall narrow ochre / sand / whitewash houses with blue-slate roofs, stair-streets, retaining walls
    const roads = [[[0, -14], [-30, -35], [10, -62], [-26, -92], [-8, -120], [-10, -138]], [[-84, 40], [-90, 0], [-100, -40], [-60, -70], [-26, -92]], [[84, 40], [90, 0], [96, -40], [60, -70], [10, -62]], [[-60, -70], [-30, -35]], [[0, -14], [0, -34]], [[-146, 0], [-90, 0], [-40, -18], [0, -14], [40, -18], [90, 0], [146, 0]]];
    const roadSm = roads.map((r) => K.smoothPath(r, 7)), roadPts = roadSm[0];
    roadSm.forEach((s, i) => { b.ribbon(M.cobble, s, (i === 0 || i === 5 ? 6.4 : 4.6) + 2, H, 0.16, 0x70685a); b.ribbon(M.cobble, s, i === 0 || i === 5 ? 6.4 : 4.6, H, 0.24, 0xc0b6a0); });
    for (const sp of roadSm) for (let i = 1; i < sp.length - 1; i += 3) { const [x, z] = sp[i], dh = H(sp[i + 1][0], sp[i + 1][1]) - H(x, z); if (Math.abs(dh) > 1.2) for (let k = 0; k < 3; k++) { const t = (k + 0.5) / 3; b.box(M.trim, x + (sp[i + 1][0] - x) * t, H(x, z) + dh * t, z + (sp[i + 1][1] - z) * t, 4.8, 0.3, 1.4, Math.atan2(-(sp[i + 1][1] - z), sp[i + 1][0] - x)); } }
    const dRoad = (x, z) => { let m = 1e9; for (const r of roadSm) { const d = K.distToPolyline(x, z, r).d; if (d < m) m = d; } return m; };
    const roadAngle = (x, z) => { let best = 1e9, ang = 0; for (const r of roadSm) { const o = K.distToPolyline(x, z, r); if (o.d < best) { best = o.d; const i = Math.min(r.length - 2, Math.floor(o.t)); ang = Math.atan2(-(r[i + 1][1] - r[i][1]), r[i + 1][0] - r[i][0]); } } return best < 40 ? ang * 0.5 : 0; };
    const wins = new Inst(new THREE.PlaneGeometry(0.9, 1.3).translate(0, 0.65, 0), M.win), awn = new Inst(G.box(), flat(0xffffff, { rough: 1 })), awnCols = [0xb8432f, 0x3a6ea5, 0xd9a93a, 0x4f8a5b, 0xe8e0d0, 0x8a4a62], cloth = new Inst(G.box(), flat(0xffffff, { rough: 1 }));
    const kinds = {
      rich: { size: [6.5, 9], h: [6.5, 10], walls: [M.white, M.sand, M.white, M.ochre, M.sea], roofs: [M.slate, M.slateB, M.slate, M.slateD], styles: ['tall', 'gable', 'hip', 'tall'], glow: 0.7, awn: 0.2 },
      mid: { size: [5, 8], h: [5, 8.5], walls: [M.sand, M.ochre, M.white, M.clay, M.sand], roofs: [M.slate, M.slateB, M.slateG, M.slate], styles: ['gable', 'tall', 'gable', 'hip'], glow: 0.6, awn: 0.08 },
      poor: { size: [4, 6.5], h: [3.8, 6], walls: [M.clay, M.sand, M.woodW, M.ochre], roofs: [M.slateG, M.slate, M.slateD], styles: ['gable', 'tall'], glow: 0.35, awn: 0.02 },
    };
    function building(x, z, kindName, r, o = {}) {
      const k = kinds[kindName]; let w = r.range(k.size[0], k.size[1]), d = r.range(k.size[0], k.size[1]) * r.range(0.85, 1.2); if (d > w) { const t = w; w = d; d = t; }
      const h = r.range(k.h[0], k.h[1]), ry = o.ry ?? 0, st = o.style ?? r.pick(k.styles), L = loc(x, z, ry);
      let y0 = 1e9, yb = -1e9; for (const [sx, sz] of [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const [px, pz] = L(sx * w / 2, sz * d / 2), hh = H(px, pz); y0 = Math.min(y0, hh); yb = Math.max(yb, hh); }
      const wm = r.pick(k.walls), rm = r.pick(k.roofs), wc = tint(r, 0.12, 0.06), rc = tint(r, 0.18, 0.04), drop = yb - y0;
      b.box(M.stoneD, x, y0 - 1.6, z, w + 0.3, drop + 2.8, d + 0.3, ry, tint(r, 0.2, 0.04)); b.box(wm, x, y0 - 1.4, z, w, drop + h + 1.4, d, ry, wc);
      const rh = (d / 2 + 0.5) * r.range(0.75, 1.0);
      if (st === 'gable' || st === 'tall') { if (st === 'tall') { b.box(M.woodD, x, yb + h * 0.5, z, w + 0.5, 0.35, d + 0.5, ry); b.box(wm, x, yb + h * 0.5, z, w + 0.7, h * 0.5, d + 0.7, ry, wc); } b.prism(rm, x, yb + h, z, w + 0.9, rh, d + 0.9, ry, rc); b.box(M.woodD, x, yb + h + rh - 0.12, z, w + 1.0, 0.3, 0.5, ry); }
      else b.pyramid(rm, x, yb + h, z, w + 1.0, rh * 0.95, d + 1.0, ry, rc);
      if (kindName === 'rich') b.box(M.trim, x, yb + h * 0.5 - 0.15, z, w + 0.25, 0.3, d + 0.25, ry, 0xf0e6cc);
      const [dx0, dz0] = L(w * r.range(-0.3, 0.3), d / 2 + 0.07); quad(b, M.door, dx0, yb, dz0, ry, 1.1, 2.1);
      if (r() < 0.45) { const [cx, cz] = L(w * (r() < 0.5 ? -0.28 : 0.28), d * 0.1), ch = rh + 1.3; b.box(M.stoneD, cx, yb + h * 0.6, cz, 0.95, h * 0.4 + ch, 0.95, ry, tint(r, 0.2, 0.05)); b.box(M.stoneD, cx, yb + h + ch, cz, 1.3, 0.25, 1.3, ry); stacks.push([cx, yb + h + ch + 1.2, cz]); }
      if (r() < k.glow) { const hh = yb + h * 0.42; for (const sd of [-1, 1]) for (const fx of [-0.24, 0.24]) { if (r() < 0.45 && sd < 0) continue; const [px, pz] = L(w * fx, sd * (d / 2 + 0.09)); wins.add(px, hh, pz, 1, 1, 1, ry + (sd < 0 ? Math.PI : 0), new THREE.Color(1, r.range(0.78, 1), r.range(0.45, 0.8))); } }
      if (r() < k.awn) { const [px, pz] = L(w * 0.2, d / 2 + 0.9); awn.add(px, yb + 2.7, pz, Math.min(3.6, w * 0.42), 0.14, 1.8, ry, awnCols[r.int(0, awnCols.length - 1)]); }
      if (r() < 0.1) { const [ax, az] = L(-w / 2 - 1.4, 0), [bx, bz] = L(-w / 2 - 1.4, d * 0.9); for (let i = 0; i < 4; i++) cloth.add(ax + (bx - ax) * (i + 0.5) / 4, yb + 2.7, az + (bz - az) * (i + 0.5) / 4, 0.1, 0.9, 0.7, ry, awnCols[(i + 1) % 5]); }   // washing lines
    }
    const avoid = (x, z) => Math.hypot(x - BAY[0], z - BAY[1]) < BAY_R + 24 || Math.abs(x) < 38 && z > -52 && z < -14 || dRoad(x, z) < 4.8 || Math.hypot(x - KEEP[0], z - KEEP[1]) < 38 || Math.hypot(x - GULL[0], z - GULL[1]) < 12 || H(x, z) < 2.4;
    { const rg = K.rng(33), pts = K.scatter({ rng: rg, count: q.dens(360), bounds: [-148, -150, 148, 62], poly: WALLP, minDist: 8, avoid });
      for (const [x, z] of pts) { const wealth = 1 - K.smoothstep(40, 170, Math.hypot(x, z + 10)) + (K.fbm(x * 0.03, z * 0.03, 2, 7) - 0.5) * 0.8; building(x, z, wealth > 0.55 ? 'rich' : wealth > 0.15 ? 'mid' : 'poor', rg, { ry: roadAngle(x, z) + (rg() < 0.15 ? Math.PI / 2 : 0) }); } }
    // lower market square with striped stalls
    { const my = H(0, -32); b.box(M.quay, 0, my - 0.1, -32, 62, 0.4, 30, 0, 0xe0d8c4); const rr = K.rng(4);
      for (let i = 0; i < 24; i++) { const x = -26 + (i % 8) * 7.5, z = -40 + Math.floor(i / 8) * 8, y = my + 0.3; b.box(M.woodW, x, y, z, 4.2, 1.6, 2.4, 0); b.prism(M.cloth, x, y + 1.6, z, 5, 1.3, 3.2, 0, awnCols[(i * 3 + (i >> 2)) % awnCols.length]); for (const sx of [-2, 2]) b.cyl(M.woodD, x + sx, y, z - 1.1, 0.1, 1.7, { seg: 4 }); b.box(M.cloth, x, y + 1.6, z + 1.2, 3.4, 0.14, 0.5, 0, [0xe8d8b8, 0xc0603a, 0x6a8a5a][i % 3]); }
      b.cyl(M.stone, 0, my + 0.2, -32 + 1, 2.8, 0.9, { seg: 12, color: 0xf0e8d4 }); b.cyl(M.stone, 0, my + 1.1, -31, 0.8, 3, { seg: 8, top: 0.6 }); b.sphere(M.marble, 0, my + 4.1, -31, 0.9, { seg: 8 }); b.cyl(M.glass, 0, my + 0.95, -31, 2.4, 0.1, { seg: 12 }); for (let i = 0; i < 3; i++) lampPosts.push([-30 + i * 30, my + 0.3, -17]); }
    // Grafton's keep on the hill, the Gull Tower
    { const [kx, kz] = KEEP, ky = H(kx, kz);
      K.wall(b, [[kx - 30, kz - 22], [kx + 30, kz - 22], [kx + 30, kz + 22], [kx - 30, kz + 22]], { h: 9, t: 3.4, mat: M.stone, capMat: M.stoneD, heightAt: () => ky, closed: true, sink: 8, color: 0xf0e8d4 }); wallTrim([[kx - 30, kz - 22], [kx + 30, kz - 22], [kx + 30, kz + 22], [kx - 30, kz + 22]], { h: 9, t: 3.4, closed: true, plinthH: 1.6, g0: () => ky });
      for (const [ox, oz] of [[-30, -22], [30, -22], [30, 22], [-30, 22]]) drum(kx + ox, ky - 3, kz + oz, 5, 17, { seg: 12, roofH: 9, col: 0xf0ead8, lit: 1 });
      K.keep(b, kx, kz, { w: 32, d: 26, h: 24, y: ky, mat: M.stone, roofMat: M.slate, turretR: 3.4, turretH: 8, roof: 'flat', color: 0xf0e8d4 });
      for (const t of [0.34, 0.66]) b.box(M.trim, kx, ky + 24 * t, kz, 32.5, 0.5, 26.5, 0);
      for (let i = -3; i <= 3; i++) for (const sd of [-1, 1]) arch(b, M.win, kx + i * 4.2, ky + 10, kz + sd * 13.05, sd < 0 ? Math.PI : 0, 1.3, 4.4, 0.14);
      const gx = kx, gz = kz + 22, gy = H(gx, gz) ; { const o = { w: 14, d: 6, h: 13, gate: 4 }; K.gatehouse(b, gx, gz - 0.01, { y: ky, ry: 0, mat: M.stone, roofMat: M.slate, ...o, wood: M.wood, towerR: 3.4, color: 0xf0e8d4 }); gateDress(gx, gz, ky, 0, o); }
      const [gx2, gz2] = GULL, gy2 = H(gx2, gz2), sc = 0xf4efe0; // the Gull Tower: slim, banded, with a gallery crown
      b.box(M.stoneW, gx2, gy2 - 4, gz2, 10.8, 7, 10.8, 0); b.box(M.marble, gx2, gy2 - 3, gz2, 8, 47, 8, 0, sc); for (const t of [0.25, 0.5, 0.75]) b.box(M.slateG, gx2, gy2 + 44 * t, gz2, 8.6, 0.8, 8.6, 0);
      b.box(M.trim, gx2, gy2 + 42, gz2, 10.4, 1.4, 10.4, 0); for (let k = 0; k < 4; k++) for (let i = -2; i <= 2; i++) { const a = k * Math.PI / 2, ex = Math.cos(a), ez = Math.sin(a); b.box(M.marble, gx2 + ex * 5 - ez * i * 2, gy2 + 43.4, gz2 + ez * 5 + ex * i * 2, ez ? 1.4 : 0.8, 1.2, ez ? 0.8 : 1.4, 0); }
      b.pyramid(M.slateB, gx2, gy2 + 44, gz2, 9.6, 12, 9.6, 0, 0xffffff); b.cyl(M.gold, gx2, gy2 + 55.6, gz2, 0.15, 3.2, { seg: 5, top: 0.4 });
      for (let t = 0; t < 4; t++) { const yy = gy2 + 8 + t * 9; for (const [dx, dz, ry] of [[0, 4.05, 0], [0, -4.05, Math.PI], [4.05, 0, Math.PI / 2], [-4.05, 0, -Math.PI / 2]]) if ((t + dx + dz) % 2 !== 0.5) arch(b, M.win, gx2 + dx, yy, gz2 + dz, ry, 1.1, 2.6, 0.12); } }
    // Motherhouse of Maris on its harbour island: ring wall, chapel with a small dome, bell tower
    { const iy = H(ISLE[0], ISLE[1]), ring = Array.from({ length: 16 }, (_, i) => [ISLE[0] + Math.cos(i / 16 * TAU) * 12, ISLE[1] + Math.sin(i / 16 * TAU) * 12]);
      K.wall(b, ring, { h: 6, t: 1.8, mat: M.stone, capMat: M.trim, heightAt: () => iy, closed: true, sink: 3, merlon: 1.2, color: 0xf0e8d4 }); wallTrim(ring, { h: 6, t: 1.8, closed: true, plinthH: 1, g0: () => iy });
      hall(ISLE[0] - 2, ISLE[1] + 1, 12, 8, 6, 0.2, { wallMat: M.white, roofMat: M.slate, col: 0xffffff, rise: 0.8, y0: iy });
      b.cyl(M.marble, ISLE[0] + 4, iy, ISLE[1] - 4, 3, 5, { seg: 12 }); b.dome(M.slateB, ISLE[0] + 4, iy + 5, ISLE[1] - 4, 3.2, { seg: 12, sy: 0.9 });
      drum(ISLE[0] + 5, iy - 2, ISLE[1] + 3, 2.6, 16, { seg: 10, stone: M.white, roofH: 7, lit: 1, slits: 1, rings: [0.5], col: 0xffffff });
      b.box(M.wood, ISLE[0] + 12.4, 1.4, ISLE[1] - 3, 9, 0.35, 2.2, 0.2); for (let i = 0; i < 4; i++) b.cyl(M.woodD, ISLE[0] + 9 + i * 3, -2, ISLE[1] - 3, 0.2, 3.5, { seg: 5 }); b.cyl(M.iron, ISLE[0] + 17, 1.4, ISLE[1] - 3.4, 0.1, 2.4, { seg: 5 }); b.box(M.lamp, ISLE[0] + 17, 3.8, ISLE[1] - 3.4, 0.45, 0.55, 0.45); }
    // town wall (landward) with gates and towers
    const lw = WALLP;
    K.wall(b, lw, { h: 13, t: 4, mat: M.stone, capMat: M.stoneD, heightAt, sink: 5, merlon: 1.3, color: 0xf0e8d4 }); wallTrim(lw, { h: 13, t: 4 });
    lw.forEach(([x, z], i) => drum(x, H(x, z), z, 5, 22, { seg: 12, col: tint(rt, 0.06, 0.03), roof: i % 2 ? 'cone' : 'flat', roofH: 9, lit: 1 }));
    for (let i = 0; i < lw.length - 1; i++) { const [ax, az] = lw[i], [bx, bz] = lw[i + 1], n = Math.floor(Math.hypot(bx - ax, bz - az) / 46); for (let k = 1; k <= n; k++) { const x = ax + (bx - ax) * k / (n + 1), z = az + (bz - az) * k / (n + 1); drum(x, H(x, z), z, 3.8, 17, { seg: 10, col: tint(rt, 0.06, 0.03), roof: 'flat', lit: 0, slits: 2 }); } }
    for (const [gx, gz, ry] of [[-40, -152, Math.PI / 2 - 0.25], [-146, 8, Math.PI / 2], [146, 8, Math.PI / 2]]) { const gy = H(gx, gz), o = { w: 16, d: 9, h: 20, gate: 5 }; K.gatehouse(b, gx, gz, { y: gy, ry, mat: M.stone, roofMat: M.slate, ...o, wood: M.wood, towerR: 4.4, color: 0xf0e8d4 }); gateDress(gx, gz, gy, ry, o); }
    // retaining walls on every terrace riser, so the slope reads as stepped ground
    for (let z = -150; z <= 56; z += 3.2) for (let x = -176; x <= 176; x += 3.2) {
      if (!K.pointInPoly(x, z, WALLP) || Math.hypot(x - BAY[0], z - BAY[1]) < BAY_R + 8) continue; const hn = H(x, z - 1.7), hs = H(x, z + 1.7), dz2 = hn - hs; if (dz2 < 1.5 || dz2 > 6) continue;
      if (dRoad(x, z) < 3.6 || Math.hypot(x - KEEP[0], z - KEEP[1]) < 36) continue; b.box(M.stone, x, hs - 0.5, z, 3.4, dz2 + 0.9, 1.1, 0, tint(rt, 0.14, 0.04)); b.box(M.trim, x, hn + 0.2, z, 3.5, 0.3, 1.5, 0);
    }
    root.add(b.build({}));

    // ---- trees: cypress and olive in terrace gardens, sparse pines on the hills
    const TR = { trunk: new Inst(G.cyl(5, 0.7), T('wood', 0xffffff, 3)), cy: new Inst(G.cone(6), flat(0xffffff, { rough: 1 })), ol: new Inst(G.sphere(6), flat(0xffffff, { rough: 1 })), pA: new Inst(G.cone(7), flat(0xffffff, { rough: 1 })), pB: new Inst(G.cone(7), flat(0xffffff, { rough: 1 })) };
    { const r = K.rng(5);
      for (const [x, z] of K.scatter({ rng: r, count: q.dens(380), bounds: [-420, -420, 420, 40], minDist: 9, avoid: (x, z) => (Math.abs(x) < 170 && z > -170 && z < 90) || H(x, z) < 2 })) { const k = r.range(1.3, 2.2), y = H(x, z), gc = jit(r.pick([0x3d5a3c, 0x486a40, 0x3a5a44]), r, 0.02, 0.08, 0.05); TR.trunk.add(x, y, z, 0.5 * k, 3 * k, 0.5 * k, 0, 0x5d4733); TR.pA.add(x, y + 2 * k, z, 2.5 * k, 5.6 * k, 2.5 * k, r() * 6, gc); TR.pB.add(x, y + 5 * k, z, 1.8 * k, 4.4 * k, 1.8 * k, r() * 6, jit(0x4a6a44, r, 0.02, 0.06, 0.05)); }
      for (const [x, z] of K.scatter({ rng: r, count: q.dens(140), bounds: [-190, -190, 190, 60], minDist: 5.5, avoid: (x, z) => dRoad(x, z) < 6 || Math.hypot(x - BAY[0], z - BAY[1]) < BAY_R + 14 || H(x, z) < 3 || K.pointInPoly(x, z, WALLP) && K.fbm(x * 0.08, z * 0.08, 2, 2) < 0.6 || Math.hypot(x - KEEP[0], z - KEEP[1]) < 40 })) {
        const cyp = r() < 0.5, k = r.range(0.9, 1.4), y = H(x, z); TR.trunk.add(x, y, z, 0.4 * k, 2.4 * k, 0.4 * k, 0, 0x5d4733);
        if (cyp) TR.cy.add(x, y + 1.2 * k, z, 1.3 * k, 8 * k, 1.3 * k, r() * 6, jit(0x2f5a3a, r, 0.02, 0.08, 0.05)); else TR.ol.add(x, y + 2 * k, z, 2.4 * k, 2.2 * k, 2.4 * k, r() * 6, jit(0x7f9060, r, 0.02, 0.08, 0.06)); } }
    for (const i of Object.values(TR)) if (i.items.length) root.add(i.build());

    // ---- lanterns, banners, life
    const lan = new Inst(G.box(), M.lamp), post = new Inst(G.cyl(5, 1), M.woodD);
    for (const sp of roadSm) for (let i = 2; i < sp.length - 1; i += 5) { const [x, z] = sp[i], o = (i % 2 ? 1 : -1) * 3.6; post.add(x + o, H(x + o, z), z, 0.15, 3.2, 0.15); lan.add(x + o, H(x + o, z) + 3.2, z, 0.5, 0.7, 0.5); }
    for (const [x, y, z] of lampPosts) { post.add(x, y, z, 0.15, 2.8, 0.15); lan.add(x, y + 2.8, z, 0.5, 0.7, 0.5); }
    for (let i = 0; i < 28; i++) { const a = Math.PI * (0.06 + i / 27 * 0.88), x = BAY[0] + Math.cos(a) * (BAY_R + 7), z = BAY[1] - Math.sin(a) * (BAY_R + 7); post.add(x, 3.2, z, 0.15, 3.0, 0.15); lan.add(x, 6.2, z, 0.5, 0.7, 0.5); }
    const bnL = [[KEEP[0] - 30, H(KEEP[0], KEEP[1]) + 34, KEEP[2] ?? KEEP[1] - 22], [KEEP[0] + 30, H(KEEP[0], KEEP[1]) + 34, KEEP[1] + 22], [LX, 70, LZ], [GULL[0], H(GULL[0], GULL[1]) + 58, GULL[1]], [-40, H(-40, -152) + 30, -152]];
    root.add(K.banners(bnL.map(([x, y, z], i) => ({ x, y, z, w: 3.2, h: 8, color: i % 2 ? 0x9bb4d8 : 0xf0f4fa, ry: 0.4 + i })), { pole: false })); for (const [x, y, z] of bnL) post.add(x, y - 8.2, z, 0.2, 9.4, 0.2);
    root.add(lan.build(), post.build(), wins.build(), awn.build(), cloth.build());
    // lighthouse beam: two long additive cones that turn through the night (visibility follows the lamp glow)
    { const g = new THREE.Group(), bm = new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide, vertexColors: true }), geo = new THREE.CylinderGeometry(0.5, 6.5, 150, 10, 1, true).rotateZ(Math.PI / 2).translate(75, 0, 0), pa = geo.attributes.position, ca = new Float32Array(pa.count * 3);
      for (let i = 0; i < pa.count; i++) { const f = 1 - pa.getX(i) / 150; ca[i * 3] = ca[i * 3 + 1] = ca[i * 3 + 2] = f * f; } geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
      g.add(new THREE.Mesh(geo, bm)); const m2 = new THREE.Mesh(geo, bm); m2.rotation.y = Math.PI; g.add(m2); g.position.set(LX, 59, LZ); g.traverse((o) => { o.renderOrder = 8; o.frustumCulled = false; }); root.add(g);
      ctx.onUpdate((dt, t) => { const n = (M.lampH.color.r / M.lampH.userData.base.r - 0.14) / (1.25 * 1.4); bm.opacity = K.clamp(n, 0, 1) * 0.1; g.rotation.y = t * 0.6; }); }
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
    function animSails(s, t, ph) {
      s.rotation.z = Math.sin(t * 0.9 + ph) * 0.025; s.rotation.x = Math.sin(t * 0.7 + ph * 1.3) * 0.02;
      for (const sm of s.userData.sl) { const pos = sm.geometry.attributes.position, bs = sm.userData.base, hw = sm.userData.hw, hh = sm.userData.hh, p2 = sm.userData.ph + ph; for (let i = 0; i < pos.count; i++) { const nx = bs[i * 3] / hw, ny = bs[i * 3 + 1] / hh; pos.setZ(i, (1 - nx * nx) * (0.55 + 0.45 * (ny * 0.5 + 0.5)) * hw * 0.32 * (0.8 + 0.2 * Math.sin(t * 1.3 + p2 + ny * 1.4))); } pos.needsUpdate = true; }
    }
    const hulls = [0x5a3f28, 0x3a4a64, 0x6a4a2e, 0x4d3a28, 0x2d3a52, 0x7a2f2a], sails = [0xe8dfc8, 0xcfb06a, 0xd9d2bd, 0xcbbf9d, 0xf0e8d0, 0xe0d4b4];
    const ships = [], mk = (type, len, i, x, z, ry, mv) => { const s = makeShip(type, len, hulls[i % 6], sails[(i + 2) % 6], i + 3); s.position.set(x, 0.2, z); s.rotation.y = ry; root.add(s); ships.push({ s, mv, ph: i * 1.7 }); };
    mk('cog', 15, 0, -42, 72, 0.4); mk('galley', 18, 1, 30, 80, -0.3); mk('cog', 13, 2, 10, 94, 1.4); mk('barge', 10, 3, -16, 52, 0.1); mk('cog', 14, 4, 46, 48, 2.5); mk('cog', 12, 5, -58, 56, -0.5); mk('barge', 9, 3, 60, 30, 1.0);
    mk('galley', 19, 5, 0, 300, 0, { s: 0 }); mk('cog', 15, 1, 70, 260, 0, { s: 1 }); mk('cog', 16, 2, -120, 230, 0, { s: 2 });
    ctx.onUpdate((dt, t) => ships.forEach((o, i) => { const m = o.mv; if (m) { const u = (((t * 0.012 + m.s * 0.33) % 1) + 1) % 1, z = 330 - u * 270; o.s.position.set(m.s === 1 ? 90 - u * 70 : m.s === 2 ? -150 + u * 40 : Math.sin(u * 9) * 4, 0.2, z); o.s.rotation.y = -Math.PI / 2; } else o.s.position.y = 0.2 + Math.sin(t * 0.8 + o.ph) * 0.1; animSails(o.s, t, o.ph); }));
    const gulls = K.birds({ center: [0, 38, 70], radius: 110, count: q.dens(24), color: 0xf6f6f6, size: 1.5, spreadY: 14, seed: 11, speed: 0.1 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const g2 = K.birds({ center: [GULL[0], H(GULL[0], GULL[1]) + 60, GULL[1]], radius: 26, count: q.dens(9), color: 0xf8f8f8, size: 1.5, spreadY: 8, seed: 21, speed: 0.22 }); root.add(g2); ctx.onUpdate((dt, t) => g2.userData.update(t));
    root.add(K.smoke(stacks.filter((_, i) => i % 5 === 0).slice(0, 40), { size: 16, rise: 14, opacity: 0.26, color: 0xdcdcdc }));
    const fire = K.fires([[LX, 59, LZ], [-22, 24, 156], [KEEP[0], H(KEEP[0], KEEP[1]) + 27, KEEP[1]], ...torches.slice(0, 3)], { size: 12, light: q.low ? 0 : 3, intensity: 100 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const wk = K.walkers({ paths: [[[-70, -22], [0, -22], [70, -22]], [[-26, -38], [26, -38], [26, -26]], [[-60, 22], [0, -12], [60, 22]], roadPts.slice(0, 30)], heightAt: H, count: q.dens(44), rng: K.rng(8) }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const cl = K.clouds({ y: 260, extent: 800, count: 9, opacity: 0.4, color: 0xffffff }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 270, center: [0, 0, 20], minDistance: 18,
      hero: { pos: [-120, 84, 322], target: [0, 24, -50] },
      climate: { atmos: 'day', weather: 'clear', tint: {
        dawn: { top: 0x4f6ba2, horizon: 0xf2bc98, fog: 0xe0b8a2, fogD: 0.0014, sunC: 0xffc08a, sunI: 3.0, hemiSky: 0xa8b6dc, hemiGround: 0x6a5648 },
        day: { top: 0x3f86c8, horizon: 0xd8e8ee, fog: 0xcfe0e4, fogD: 0.0008, sunC: 0xffecc4, sunI: 3.5, hemiSky: 0xb4d0ea, hemiGround: 0x8a7a58, hemiI: 0.95 },
        dusk: { top: 0x2a3a78, horizon: 0xf0925c, fog: 0xd49478, fogD: 0.0016, sunC: 0xff9650, sunI: 3.0, hemiSky: 0x8a8ac4, hemiGround: 0x5a4636, hemiI: 0.72 },
        night: { top: 0x080e2e, horizon: 0x2c4272, fog: 0x1e3058, fogD: 0.0018, sunC: 0xb0c4f4, sunI: 1.6, hemiSky: 0x7488c4, hemiGround: 0x343a50, hemiI: 1.25, exposure: 1.18 },
      } },
      landmarks: {
        harbour: { pos: [0, 4, 100], r: 50 }, lighthouse: { pos: [LX, 70, LZ], r: 14 }, 'sea-wall': { pos: [-92, 14, 100], r: 20 }, 'market-square': lm(0, -32, 30, 8),
        'grafton-keep': lm(KEEP[0], KEEP[1], 24, 44), 'gull-tower': lm(GULL[0], GULL[1], 10, 60), 'motherhouse-of-maris': lm(ISLE[0], ISLE[1], 14, 18), 'city-walls': lm(-100, -118, 22, 20), docks: lm(70, 20, 20, 8),
      },
    };
  },
};
