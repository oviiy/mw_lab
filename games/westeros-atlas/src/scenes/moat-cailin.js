// Moat Cailin — ruin in the swamps of the Neck. Book anchors: an ancient First Men fortress on the Kingsroad causeway, only three towers
// left standing (Gatehouse Tower, Drunkard's Tower, Children's Tower), crumbled walls, bogs, mist, lizard-lions, crannogmen of the Neck.
// Layout, shapes and sizes are interpretation — see content/moat-cailin.js.
//
// Visual language: ancient dark basalt-grey masonry furred with moss and ivy, black peat water between drowned islets, bald cypress with
// mossy islets, thick low mist, brown reeds; the only warmth is the crannogmen's lantern-lit huts and a few drifting fireflies.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G: GG, tri, flat, glow } = K;

const TAU = Math.PI * 2;
const roadX = (z) => Math.sin(z * 0.016) * 7;
const CRAN = [[-96, 70], [112, -62], [-120, -90]];
const jit = (hex, r, dh = 0.012, ds = 0.05, dl = 0.03) => new THREE.Color(hex).offsetHSL((r() - 0.5) * 2 * dh, (r() - 0.5) * 2 * ds, (r() - 0.5) * 2 * dl);
const tint = (r, v = 0.12, w = 0.05) => { const k = 1 - v * r(); return new THREE.Color(k * (1 - w * r()), k, k * (1 - w * r() * 0.8)); };
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
function blob(b, mat, cx, cy, cz, rx, ry_, rz, color = 0xffffff, rot = 0, seg = 8) {
  _m.compose(_p.set(cx, cy - ry_, cz), _q.setFromEuler(_e.set(0, rot, 0)), _s.set(rx, ry_, rz)); b.addGeometry(mat, GG.sphere(seg), _m, color);
}

export default {
  build(ctx) {
    const q = ctx.q, rng = K.rng(51), root = ctx.root;
    // ---------------------------------------------------------------- terrain: waterlogged mosaic, raised causeway, rocky mound under the ruins
    const heightAt = (x, z) => {
      const r = Math.hypot(x, z);
      const n = K.fbm(x * 0.025, z * 0.025, 4, 5), pool = K.smoothstep(0.5, 0.36, n);
      let h = (n - 0.52) * 5.5 + (K.fbm(x * 0.09, z * 0.09, 2, 8) - 0.5) * 0.9 - pool * 2.2;
      h += (1 - K.smoothstep(24, 62, r)) * 8.5;
      h = K.lerp(h, 1.6, 1 - K.smoothstep(4.5, 10.5, Math.abs(x - roadX(z))));
      for (const [cx, cz] of CRAN) h = K.lerp(h, -1.8, 1 - K.smoothstep(10, 18, Math.hypot(x - cx, z - cz)));   // each crannog sits in its own pool
      return h;
    };
    const H = heightAt;
    const mud = new THREE.Color(0x3c3828), moss = new THREE.Color(0x6e8040), moss2 = new THREE.Color(0x4a5e34), rockC = new THREE.Color(0x5a5f58), dry = new THREE.Color(0x8a8650), peat = new THREE.Color(0x2c2a1e), c = new THREE.Color();
    root.add(K.terrain({ size: 1300, seg: q.seg(200), heightAt, kind: 'grass', scale: 9, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.05, z * 0.05, 3, 4);
      c.copy(mud).lerp(moss, K.smoothstep(-0.4, 0.9, h)).lerp(moss2, K.smoothstep(0.4, 0.75, n) * 0.7).lerp(dry, K.clamp(K.noise2(x * 0.05, z * 0.05, 3) - 0.4, 0, 0.35));
      if (h < 0.2) c.lerp(peat, K.smoothstep(0.2, -1.2, h));
      c.lerp(rockC, K.smoothstep(2, 8, h) * 0.8 + K.clamp(s * 2, 0, 0.5)); return c;
    } }));
    const wat = K.water({ w: 720, d: 720, seg: q.seg(130), level: 0, heightAt, deep: 0x141c14, shallow: 0x3a4630, opacity: 0.92, choppy: 0.08, speed: 0.1, foam: 0x4c5a38 }); root.add(wat); ctx.registerWater(wat);

    // ---------------------------------------------------------------- materials (near-white tints; colour lives in the per-object arg)
    const T = (k, color, scale = 6, o = {}) => tri(k, { color, scale, snow: false, ...o });
    const M = {
      stone: T('stone', 0xb8bcb8, 6, { rough: 0.95 }), stoneDS: T('stone', 0xb8bcb8, 6, { rough: 0.95, side: THREE.DoubleSide }), stoneD: T('stone', 0x8a8e8c, 6), trim: T('stone', 0xd0d2cc, 5), moss: T('grass', 0x8aa050, 4, { rough: 1, bump: 1.2 }), rubble: T('rock', 0xa8aaa0, 5),
      wood: T('wood', 0xa08560, 4), woodD: T('wood', 0x5a4a34, 4), thatch: T('thatch', 0xd0c078, 4), cobble: T('cobble', 0xb0ac98, 6), kerb: T('stone', 0xb0b0a4, 5), reedMat: flat(0xffffff, { rough: 1, flatShading: false }),
      win: glow(0xffb866, 1.4), lamp: glow(0xffa84a, 1.6), dark: flat(0x06080a, { rough: 1 }), iron: flat(0x2c2d30, { metal: 0.4, rough: 0.7 }),
      leaf: T('grass', 0xffffff, 3, { rough: 1, bump: 0.9 }), bark: T('wood', 0xffffff, 3), ivy: T('grass', 0x4f7a3a, 4, { rough: 1, bump: 1.1 }),
    };
    const b = new Batch(), mossy = [0xffffff, 0xd2dcc0, 0xb9cc98, 0xe8ecdc], lampPts = [], chim = [];

    // ---------------------------------------------------------------- masonry builders
    const stoneTone = () => tint(rng, 0.16, 0.05);
    /** drum tower: battered plinth, courses, slits; crown either whole (merlons), or ragged (broken). */
    function drum(x, y, z, r, h, o = {}) {
      const { seg = 12, taper = 0.88, broken = true, lean = [0, 0], slits = 4, lit = 0, R = rng } = o, col = stoneTone(), rA = (t) => r * (1 - (1 - taper) * t);
      const lx = (t) => lean[0] * t, lz = (t) => lean[1] * t;
      b.cyl(M.stoneD, x, y - 4, z, r * 1.2, 6.4, { top: 0.92, seg, color: col });
      const N = Math.max(3, Math.round(h / 5)), rip = o.rip ?? 0, thG = Math.PI / 2 - rip;
      for (let i = 0; i < N; i++) {
        const t0 = i / N, t1 = (i + 1) / N, rb = rA(t0), rt2 = rA(t1), full = !broken || t0 < 0.52;
        if (full) b.cyl(M.stone, x + lx(t0), y + h * t0 - 0.02, z + lz(t0), rb, h / N + 0.04, { top: rt2 / rb, seg, color: tint(R, 0.07, 0.04), ry: i * 0.3 });
        else { // broken shell: the wall peels open toward `rip`, widening with height, showing the dark inner face
          const gh = K.lerp(0.12, 0.8, (t0 - 0.5) * 2), g = new THREE.CylinderGeometry(rt2, rb, h / N + 0.04, seg, 1, true, thG + gh, TAU - 2 * gh); g.translate(0, (h / N + 0.04) / 2, 0);
          _m.compose(_p.set(x + lx(t0), y + h * t0 - 0.02, z + lz(t0)), _q.identity(), _s.set(1, 1, 1)); b.addGeometry(M.stoneDS, g, _m, tint(R, 0.1, 0.04)); g.dispose();
        }
        if (i % 3 === 0 && i && (full || t0 < 0.6)) b.cyl(M.trim, x + lx(t0), y + h * t0 - 0.3, z + lz(t0), rb * 1.035, 0.55, { top: 1, seg, color: 0xc8cac4 });
        if (broken && !full && i % 3 === 1) b.cyl(M.wood, x + lx(t0), y + h * t0 - 0.1, z + lz(t0), rb * 0.9, 0.45, { seg: 10, color: 0x9a8a70 });   // timber floor ring inside
      }
      for (let k = 0; k < slits; k++) { const a = k * 2.3 + r * 1.9, t = 0.2 + 0.17 * k, rad = rA(t) + 0.05; arch(b, k === lit ? M.win : M.dark, x + lx(t) + Math.cos(a) * rad, y + h * t, z + lz(t) + Math.sin(a) * rad, Math.PI / 2 - a, 0.8, 2.8, 0.2); }
      const yt = y + h, rr = rA(1), cx = x + lx(1), cz = z + lz(1);
      if (!broken) { b.cyl(M.trim, cx, yt - 0.4, cz, rr * 1.05, 1.6, { top: 1.2, seg, color: 0xc8cac4 }); const n = Math.max(7, Math.round((TAU * rr * 1.2) / 2.6)); for (let i = 0; i < n; i++) { const a = (i / n) * TAU; b.box(M.stone, cx + Math.cos(a) * rr * 1.14, yt + 1.2, cz + Math.sin(a) * rr * 1.14, 1.5, 1.4, 0.9, Math.PI / 2 - a, col); } }
      else {
        const n = 11; for (let i = 0; i < n; i++) { const a = (i / n) * TAU + R() * 0.2, da = Math.abs((((a - (o.rip ?? 0)) % TAU) + TAU + Math.PI) % TAU - Math.PI); if (da < 0.9) continue; const hh = R.range(0.8, 6) * (0.5 + 0.9 * Math.max(0, -Math.cos(a - (o.rip ?? 0)))); b.box(M.stone, cx + Math.cos(a) * rr * 0.92, yt - 1.2, cz + Math.sin(a) * rr * 0.92, R.range(1.8, 3.2), hh + 1.2, R.range(1.4, 2.0), Math.PI / 2 - a, tint(R, 0.2, 0.05), R.range(-0.08, 0.08), R.range(-0.1, 0.1)); }
        for (let i = 0; i < 9; i++) { const a = R() * TAU, d2 = r * R.range(1.3, 2.9), px = x + Math.cos(a) * d2, pz = z + Math.sin(a) * d2; b.box(M.rubble, px, Math.max(0, H(px, pz)) - 0.4, pz, R.range(1.5, 3.8), R.range(0.8, 2.4), R.range(1.5, 3.2), R() * 3, tint(R, 0.3, 0.05)); }
      }
      // moss mantle on the foot and wind-side, ivy bands
      for (let i = 0; i < 7; i++) { const a = R() * TAU, t = R.range(0.02, 0.5), rad = rA(t) + 0.12; blob(b, M.moss, x + lx(t) + Math.cos(a) * (rad - 0.25), y + h * t, z + lz(t) + Math.sin(a) * (rad - 0.25), R.range(1.6, 3.4), R.range(1.2, 3.4), 0.7, jit(R.pick([0x6c8a3a, 0x7a9448, 0x5e7a34]), R, 0.02, 0.1, 0.06), Math.PI / 2 - a, 6); }
      for (let i = 0; i < 4; i++) { const a = R() * TAU, t = R.range(0.3, 0.8), rad = rA(t) + 0.2; b.box(M.ivy, x + lx(t) + Math.cos(a) * rad, y + h * t - 3, z + lz(t) + Math.sin(a) * rad, 0.9, R.range(4, 9), 0.5, Math.PI / 2 - a, 0xffffff); }
    }

    // ---------------------------------------------------------------- Gatehouse Tower: twin drums over the causeway, broken arch, a tree growing from the north face
    { const gx = roadX(26), gz = 26, y = Math.max(H(gx, gz), 1.6), R = K.rng(1);
      drum(gx - 11, H(gx - 11, gz) - 0.3, gz, 8.6, 44, { R, broken: true, rip: 2.4, slits: 5, lit: 2 });
      drum(gx + 11, H(gx + 11, gz) - 0.3, gz, 8.0, 40, { R, broken: true, rip: 0.4, slits: 5, lit: 4 });
      const aw = 14, ah = 9; b.box(M.stone, gx, y + ah, gz, aw + 1, 26, 15, 0, 0xc4c6c0);                           // span block above the passage
      for (const sd of [-1, 1]) { arch(b, M.dark, gx, y - 0.1, gz + sd * 7.7 - (sd < 0 ? 0.6 : 0), 0, 9, 9.4, 0.7); arch(b, M.stoneD, gx, y - 0.1, gz + sd * 7.4, 0, 11.2, 11, 0.4, 0xaaaca4); }
      b.box(M.dark, gx, y, gz, 8, 8.4, 15.4, 0);
      for (let i = 0; i < 9; i++) { const a = (i / 9) * 7 - 3.5; b.box(M.stone, gx + a * 1.7, y + ah + 26, gz + R.range(-6, 6), R.range(2, 3.4), R.range(1, 5.2), R.range(1.6, 3), R() * 0.4, tint(R, 0.2, 0.05)); }   // ragged upper course
      b.box(M.stone, gx - 4, y + 27, gz + 2, 8, 6, 10, 0.2, 0xb0b2ac);                                                // collapsed corner
      // the leaning tree growing out of the north face
      strut(b, M.bark, [gx + 6, y + 18, gz - 7.5], [gx + 7.4, y + 24, gz - 12], 1.5, 0x5a4a3a); strut(b, M.bark, [gx + 7.4, y + 24, gz - 12], [gx + 6, y + 32, gz - 17], 1.0, 0x5a4a3a); strut(b, M.bark, [gx + 7.4, y + 24, gz - 12], [gx + 11, y + 31, gz - 14], 0.7, 0x5a4a3a);
      for (const [px, py, pz, s] of [[6, 33, -17, 4.2], [11, 32, -14, 3.2], [8, 28, -16, 3.4], [4, 35, -15, 2.8]]) blob(b, M.leaf, gx + px, y + py, gz + pz, s, s * 0.7, s, jit(0x5a7a34, R, 0.02, 0.1, 0.07), R() * 3);
      for (const sd of [-1, 1]) { const lx = gx + sd * 6.2; b.cyl(M.woodD, lx, y, gz + 8.6, 0.12, 3.1, { seg: 5 }); b.box(M.lamp, lx, y + 3.1, gz + 8.6, 0.36, 0.55, 0.36); b.box(M.iron, lx, y + 3.65, gz + 8.6, 0.55, 0.1, 0.55); lampPts.push([lx, y + 3.3, gz + 8.6]); }
      // fallen blocks across the causeway edges
      for (let i = 0; i < 14; i++) { const a = R() * TAU, d2 = R.range(14, 26), px = gx + Math.cos(a) * d2 * 1.4, pz = gz + Math.sin(a) * d2; if (Math.abs(px - roadX(pz)) < 5) continue; b.box(M.rubble, px, Math.max(0, H(px, pz)) - 0.4, pz, R.range(2, 4.4), R.range(1, 2.8), R.range(2, 4), R() * 3, tint(R, 0.3, 0.05)); }
    }
    // ---------------------------------------------------------------- Drunkard's Tower: sunk and leaning, each course stepping sideways, shattered crown
    { const x0 = -34, z0 = 40, y = H(x0, z0) - 3.2, R = K.rng(2);
      drum(x0, y, z0, 7.3, 46, { R, lean: [6.4, -2.6], broken: true, rip: 5.0, slits: 5, lit: 3, seg: 14, taper: 0.93 });
      b.box(M.moss, x0 + 1, y + 6, z0 + 6, 6, 2, 3, 0.3, 0x7a9448);
    }
    // ---------------------------------------------------------------- Children's Tower: tall, slender, straight, top shattered open
    { const x0 = 38, z0 = -8, y = H(x0, z0) - 3, R = K.rng(3);
      drum(x0, y, z0, 5.6, 56, { R, taper: 0.8, broken: true, rip: 1.1, slits: 6, lit: 4, seg: 12 });
      for (let i = 0; i < 6; i++) { const a = R() * TAU, d2 = R.range(6, 12); b.box(M.rubble, x0 + Math.cos(a) * d2, Math.max(0.3, H(x0 + Math.cos(a) * d2, z0 + Math.sin(a) * d2)) - 0.4, z0 + Math.sin(a) * d2, R.range(2, 4), R.range(1, 3), R.range(2, 4), R() * 3, tint(R, 0.3, 0.05)); }
    }
    // ---------------------------------------------------------------- broken curtain wall ring, rubble, tumbled keep and hall
    for (let i = 0; i < 22; i++) {
      if (rng() < 0.38) continue; const a0 = (i / 22) * TAU, a1 = a0 + 0.26, R = 47 + rng.range(-3, 3);
      const p0 = [Math.cos(a0) * R, Math.sin(a0) * R], p1 = [Math.cos(a1) * R, Math.sin(a1) * R];
      if (Math.abs(p0[0] - roadX(p0[1])) < 12 && Math.abs(p0[1]) > 20) continue;
      const hh = rng.range(3, 14), mx = (p0[0] + p1[0]) / 2, mz = (p0[1] + p1[1]) / 2, ang = Math.atan2(-(p1[1] - p0[1]), p1[0] - p0[0]);
      K.wall(b, [p0, p1], { h: hh, t: 4.4, mat: M.stone, capMat: M.stoneD, crenel: rng() < 0.3, heightAt: H, sink: 3, merlon: 1.4, color: tint(rng, 0.14, 0.05) });
      b.box(M.stoneD, mx, Math.max(0, H(mx, mz)) - 2.5, mz, Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + 0.8, 4, 5.6, ang, 0x9a9e98);
      for (let k = 0; k < 3; k++) { const u = rng(); b.box(M.stone, mx + (p1[0] - p0[0]) * (u - 0.5), Math.max(0, H(mx, mz)) + hh, mz + (p1[1] - p0[1]) * (u - 0.5), rng.range(1.4, 3), rng.range(0.6, 2.4), rng.range(1.4, 3), rng() * 3, tint(rng, 0.2, 0.05)); }
      blob(b, M.moss, mx, Math.max(0, H(mx, mz)) + 1, mz, 3.4, 1.6, 3.4, jit(0x6c8a3a, rng, 0.02, 0.1, 0.06));
    }
    { const kx = -6, kz = -30, y = H(kx, kz), R = K.rng(4);
      // tumbled keep: two standing wall-faces with window arches, a cut stair, a floor slab and heaps of fallen stone
      b.box(M.stoneD, kx, y - 2.5, kz, 28, 4, 21, 0.15, 0x9a9e98);
      b.box(M.stone, kx - 8, y - 1.5, kz + 6, 16, 14, 3.4, 0.15, 0xc4c6c0); b.box(M.stone, kx + 6, y - 1.5, kz - 8, 4, 12, 14, 0.15, 0xbcbeb8); b.box(M.stone, kx - 8, y + 11.5, kz + 6, 9, 5, 3.4, 0.15, 0xb8bab4);
      for (let i = 0; i < 3; i++) arch(b, M.dark, kx - 8 + (i - 1) * 4.4 - 0.3, y + 4, kz + 7.8 + 0.2, 0.15, 1.8, 5, 0.3);
      arch(b, M.dark, kx + 4.2, y, kz - 7, 0.15 + Math.PI / 2, 4.4, 6, 0.4); arch(b, M.win, kx - 4.2, y + 5, kz + 7.9, 0.15, 1.2, 3.2, 0.2);
      for (let i = 0; i < 8; i++) b.box(M.stone, kx + 6 + i * 0.4, y + i * 1.2, kz - 1 + i * 0.5, 4, 1.2, 2, 0.15, 0xbcbeb8);
      for (let i = 0; i < 26; i++) b.box(M.rubble, kx + R.range(-26, 26), Math.max(0, H(kx, kz)) - 0.3, kz + R.range(-18, 22), R.range(1.5, 5), R.range(0.8, 3), R.range(1.5, 5), R() * 3, tint(R, 0.3, 0.05));
      b.box(M.stone, 20, H(20, -34) - 1, -34, 9, 9, 9, 0.5, 0xb0b2ac); b.box(M.stoneD, -30, H(-30, -12) - 1, -12, 10, 6, 7, -0.3, 0xa8aaa4);                      // hall stubs
      for (const [mx2, mz2, s] of [[-8, 4, 4.5], [8, -10, 3.5], [-14, -6, 3]]) blob(b, M.moss, kx + mx2, y + 1, kz + mz2, s, 1.8, s, jit(0x6c8a3a, R, 0.02, 0.1, 0.06));
    }
    // causeway: ballast embankment, cobbled carriageway, broken kerb-stones, a few standing pools of rain
    { const road = K.smoothPath(Array.from({ length: 22 }, (_, i) => [roadX(-300 + i * 30), -300 + i * 30]), 4), road2 = K.smoothPath(Array.from({ length: 12 }, (_, i) => [roadX(40 + i * 30), 40 + i * 30]), 4);
      b.ribbon(M.cobble, road, 10.4, H, 0.08, 0x6c6a52); b.ribbon(M.cobble, road, 6.4, H, 0.12, 0xaaa690);
      for (let i = 0; i < road.length - 1; i += 2) for (const sd of [-1, 1]) { const [x, z] = road[i]; if (rng() < 0.25) continue; b.box(M.kerb, x + sd * 3.6, Math.max(0, H(x, z)), z, 1.0, 0.5, 1.8, 0, tint(rng, 0.2, 0.05)); }
      void road2; }
    // ---------------------------------------------------------------- crannogs: reed-thatched huts on stilts joined by railed walkways, lantern-lit, with punts
    const crannog = (cx, cz, n, seed) => {
      const r2 = K.rng(seed), y = 0.7; b.cyl(M.woodD, cx, -2.2, cz, 9, 2.9, { seg: 14, color: 0x8a7a58 }); b.cyl(M.moss, cx, 0.7, cz, 8.8, 0.12, { seg: 14, color: 0x7a9448 });
      for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU; b.cyl(M.woodD, cx + Math.cos(a) * 9, -3.4, cz + Math.sin(a) * 9, 0.3, 4.8, { seg: 5 }); }
      for (let i = 0; i < n; i++) { const a = (i / n) * TAU + r2() * 0.5, hx = cx + Math.cos(a) * 4.2, hz = cz + Math.sin(a) * 4.2; b.cyl(M.wood, hx, y + 0.7, hz, 2.1, 2.7, { seg: 9, color: jit(0xa08460, r2, 0.01, 0.06, 0.06) }); b.cone(M.thatch, hx, y + 3.2, hz, 3.0, 3.4, { seg: 9, color: r2.pick([0xffffff, 0xd8d098, 0xe4dca8]) }); b.cone(M.thatch, hx, y + 5.6, hz, 1.2, 1.4, { seg: 9, color: 0xb8a860 }); arch(b, M.win, hx + Math.cos(a) * 2.02, y + 1.4, hz + Math.sin(a) * 2.02, Math.PI / 2 - a, 0.7, 1.4, 0.1); chim.push([hx, y + 6.3, hz]); }
      for (let i = 0; i < 3; i++) strut(b, M.woodD, [cx + r2.range(-6, 6) - 1.4, y + 0.7, cz + r2.range(-6, 6)], [cx + r2.range(-6, 6) + 1.4, y + 0.7, cz + r2.range(-6, 6) + 0.3], 0.6, 0x6a5238, 0.4);
      b.cyl(M.woodD, cx + 7.4, y, cz, 0.14, 3.2, { seg: 5 }); b.box(M.lamp, cx + 7.4, y + 3.2, cz, 0.34, 0.5, 0.34); lampPts.push([cx + 7.4, y + 3.5, cz]);
    };
    crannog(-96, 70, 5, 3); crannog(112, -62, 4, 4); crannog(-120, -90, 3, 5);
    { const x0 = -88, z0 = 66, x1 = -14, z1 = 36, N = 15; for (let i = 0; i < N; i++) { const t = i / (N - 1), x = K.lerp(x0, x1, t), z = K.lerp(z0, z1, t) + Math.sin(t * 6) * 2, ang = -Math.atan2(z1 - z0, x1 - x0) * 0.4; b.box(M.wood, x, 1.0, z, 6, 0.3, 1.5, ang, tint(rng, 0.2, 0.05)); if (i % 2 === 0) for (const sd of [-1, 1]) b.cyl(M.woodD, x, -1.5, z + sd * 0.8, 0.18, 2.9, { seg: 5 }); if (i % 3 === 0) b.cyl(M.woodD, x + 2.5, 1.0, z - 0.9, 0.1, 1.1, { seg: 4 }); } }
    root.add(b.build({}));

    // ---------------------------------------------------------------- reeds, bald cypress, dead wood
    const reeds = new Inst(GG.cone(4), M.reedMat, { cast: false }), heads = new Inst(GG.cyl(5, 1), flat(0xffffff, { rough: 1 }), { cast: false });
    const rr = K.rng(9); let nr = 0; for (let i = 0; i < q.dens(2600) * 3 && nr < q.dens(1700); i++) { const x = rr.range(-300, 300), z = rr.range(-300, 300), h = H(x, z); if (h < -1.0 || h > 0.45 || Math.hypot(x, z) < 42) continue; nr++; const hh = rr.range(1.2, 2.4); reeds.add(x, Math.max(h, -0.2), z, 0.22, hh, 0.22, rr() * 6, rr.pick([0x70804a, 0x7e8a52, 0x5f7440, 0x8e8458, 0x6c6c3c])); if (rr() < 0.12) heads.add(x, Math.max(h, -0.2) + hh * 0.7, z, 0.22, 0.7, 0.22, 0, 0x4a3422); }
    root.add(reeds.build(), heads.build());
    function bogTrees({ rng: Rg, count, bounds, avoid, scale = [1, 1.5], minDist = 7 }) {
      const pts = K.scatter({ rng: Rg, count, bounds, minDist, avoid }), grp = new THREE.Group();
      const trunk = new Inst(GG.cyl(7, 0.45), M.bark), knee = new Inst(GG.cone(5), M.bark), A1 = new Inst(GG.sphere(7), M.leaf), A2 = new Inst(GG.sphere(7), M.leaf);
      for (const [x, z] of pts) {
        const k = Rg.range(scale[0], scale[1]), y = Math.max(H(x, z), -0.3), a = Rg() * 6, lean = Rg.range(-0.7, 0.7);
        trunk.add(x, y - 0.4, z, 0.95 * k, 5.4 * k, 0.95 * k, a, jit(0x5a4a3a, Rg, 0.01, 0.05, 0.05));
        for (let j = 0; j < 3; j++) { const ka = a + j * 2.1; knee.add(x + Math.cos(ka) * 1.7 * k, y - 0.4, z + Math.sin(ka) * 1.7 * k, 0.26 * k, 1.0 * k, 0.26 * k, 0, 0x5a4a3a); }
        const cx = x + lean * 1.2 * k, cz = z - lean * 0.8 * k;
        A1.add(cx, y + 4.2 * k, cz, 4.0 * k, 2.8 * k, 4.0 * k, a, jit(Rg.pick([0x5a7a3a, 0x687f3e, 0x4f6f36, 0x73823e]), Rg, 0.02, 0.1, 0.06));
        A2.add(cx + Math.cos(a) * 1.8 * k, y + 5.6 * k, cz + Math.sin(a) * 1.8 * k, 3.0 * k, 2.2 * k, 3.0 * k, a, jit(Rg.pick([0x6a8040, 0x5a7a3a]), Rg, 0.02, 0.1, 0.07));
      }
      for (const i of [trunk, knee, A1, A2]) if (i.items.length) grp.add(i.build());
      return grp;
    }
    const clear = (x, z) => H(x, z) < 0.35 || Math.hypot(x, z) < 52 || Math.abs(x - roadX(z)) < 9 || CRAN.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < 22) || (x > -100 && x < -10 && z > 30 && z < 70 && Math.abs(z - (66 - (x + 88) * 0.4)) < 10);
    root.add(bogTrees({ rng: K.rng(71), count: q.dens(300), bounds: [-320, -320, 320, 320], avoid: clear, scale: [0.9, 1.6], minDist: 8 }));
    // dead wood: snags and fallen logs in the water
    { const dw = new Batch(), r3 = K.rng(13); for (let i = 0; i < 70; i++) { const x = r3.range(-220, 220), z = r3.range(-220, 220); if (Math.hypot(x, z) < 55 || Math.abs(x - roadX(z)) < 9) continue; const h = Math.max(H(x, z), -0.3); if (h > 1) continue; strut(dw, M.bark, [x, h, z], [x + r3.range(-1.5, 1.5), h + r3.range(2.5, 6), z + r3.range(-1.5, 1.5)], 0.4, 0x6a5e50); if (r3() < 0.4) strut(dw, M.bark, [x, h + 3, z], [x + r3.range(-3, 3), h + 5.2, z + r3.range(-3, 3)], 0.22, 0x6a5e50); }
      root.add(dw.build({})); }

    // ---------------------------------------------------------------- life: mist, lizard-lions, marsh birds, fireflies, crannog smoke & fires
    // night-aware dimming of self-lit sprites (smoke, clouds) and night-only fireflies
    const nightProbe = glow(0xffffff, 1), dimmers = [], night = () => K.clamp((nightProbe.color.r - 0.14) / 1.25, 0, 1);
    const dimmed = (col, k = 0.8) => { const base = col.clone(); dimmers.push((n) => col.copy(base).multiplyScalar(1 - k * n)); };
    const dimSmoke = (p) => { dimmed(p.material.uniforms.uColor.value); return p; }, dimClouds = (g) => { dimmed(g.children[0].material.color); return g; };
    const mist = []; for (let i = 0; i < 18; i++) { const a = rng() * TAU, r = rng.range(20, 240); mist.push([Math.cos(a) * r, 1.6 + rng() * 2.5, Math.sin(a) * r]); }
    root.add(dimSmoke(K.smoke(mist, { color: 0xdfe6da, size: 160, rise: 8, opacity: 0.13, perStack: 6, spread: 22 })));
    root.add(dimSmoke(K.smoke(Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * TAU, r = 60 + (i % 3) * 24; return [Math.cos(a) * r, 8, Math.sin(a) * r]; }), { color: 0xe0e8dc, size: 90, rise: 14, opacity: 0.09, perStack: 4, spread: 12 })));
    root.add(dimSmoke(K.smoke(chim.slice(0, 6).concat([[-96, 8, 70]]), { size: 22, rise: 14, opacity: 0.3, color: 0xbfc2b8 })));
    const fire = K.fires([[-98, 3, 66], [114, 3, -60], [-118, 3, -88], [27, 19, 36], ...lampPts], { size: 5, light: q.low ? 0 : 3, intensity: 45 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    // fireflies
    { const NF = q.dens(70), fg = new THREE.BufferGeometry(), fp = new Float32Array(NF * 3), fd = []; for (let i = 0; i < NF; i++) fd.push({ x: rr.range(-180, 180), y: rr.range(0.8, 5), z: rr.range(-180, 180), ph: rr() * 6, v: rr.range(0.15, 0.4) });
      fg.setAttribute('position', new THREE.BufferAttribute(fp, 3)); const fm = new THREE.PointsMaterial({ color: 0xd8ff7a, size: 1.4, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }), fpts = new THREE.Points(fg, fm); fpts.frustumCulled = false; root.add(fpts);
      ctx.onUpdate((dt, t) => { const n = night(); fm.opacity = n * 0.9; fpts.visible = n > 0.05; for (let i = 0; i < NF; i++) { const d = fd[i]; fp[i * 3] = d.x + Math.sin(t * d.v + d.ph) * 6; fp[i * 3 + 1] = d.y + Math.sin(t * 0.9 + d.ph) * 0.8; fp[i * 3 + 2] = d.z + Math.cos(t * d.v * 0.8 + d.ph) * 6; } fg.attributes.position.needsUpdate = true; }); }
    // lizard-lions: long tapering bodies gliding through the bog, tail swaying
    const NL = 5, SEG = 6, ll = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.5, 0.7), new THREE.MeshStandardMaterial({ color: 0x4e6040, roughness: 0.8 }), NL * SEG); ll.frustumCulled = false; ll.castShadow = false;
    const lz = Array.from({ length: NL }, (_, i) => ({ cx: rng.range(-120, 120), cz: rng.range(60, 160) * (i % 2 ? -1 : 1), r: rng.range(12, 26), sp: rng.range(0.04, 0.09), ph: rng() * 6 })), oo = new THREE.Object3D();
    const segW = [2.6, 3.0, 2.8, 2.2, 1.7, 1.2], segH = [0.7, 0.8, 0.7, 0.55, 0.4, 0.3], segD = [1.0, 1.3, 1.2, 0.9, 0.6, 0.35];
    ctx.onUpdate((dt, t) => { lz.forEach((d, i) => { const a = t * d.sp + d.ph, x = d.cx + Math.cos(a) * d.r, z = d.cz + Math.sin(a) * d.r, ry = K.headingX(-Math.sin(a), Math.cos(a)); let off = 0; for (let k = 0; k < SEG; k++) { const sw = Math.sin(t * 1.2 + k * 0.9 + d.ph) * 0.22 * k; off += segW[k] * 0.46; const bx = x - Math.cos(ry) * off - Math.sin(ry) * sw * 0 , bz = z + Math.sin(ry) * off; oo.position.set(bx + Math.sin(ry) * sw, -0.12, bz + Math.cos(ry) * sw); oo.rotation.set(0, ry + sw * 0.1, 0); oo.scale.set(segW[k], segH[k], segD[k]); oo.updateMatrix(); ll.setMatrixAt(i * SEG + k, oo.matrix); off += segW[k] * 0.46; } }); ll.instanceMatrix.needsUpdate = true; });
    root.add(ll);
    // crannogmen's punt drifting between huts
    const punt = new THREE.Group(), pb = new Batch(); pb.box(M.woodD, 0, 0, 0, 4.2, 0.35, 1.2, 0, 0x7a6244); pb.box(M.woodD, 2.2, 0.2, 0, 0.5, 0.5, 0.9, 0, 0x7a6244); pb.box(M.woodD, -2.2, 0.2, 0, 0.5, 0.5, 0.9, 0, 0x7a6244); pb.cyl(M.woodD, 0, 0.3, 0.4, 0.07, 3.6, { seg: 4, color: 0x5a4a34 }); punt.add(pb.build({})); root.add(punt);
    ctx.onUpdate((dt, t) => { const u = (t * 0.012) % 1, a = u * TAU; punt.position.set(-96 + Math.cos(a) * 40 + 20, 0.0, 70 + Math.sin(a) * 26); punt.rotation.y = -a + Math.PI; punt.rotation.z = Math.sin(t * 1.1) * 0.03; });
    const crows = K.birds({ center: [0, 55, 10], radius: 80, count: q.dens(10), color: 0x1c211b, size: 1.0, spreadY: 18, seed: 12 }); root.add(crows); ctx.onUpdate((dt, t) => crows.userData.update(t));
    const herons = K.birds({ center: [-60, 14, 90], radius: 50, count: q.dens(5), color: 0x9aa39a, size: 1.2, spreadY: 4, seed: 15, speed: 0.07 }); root.add(herons); ctx.onUpdate((dt, t) => herons.userData.update(t));
    root.add(dimClouds(K.clouds({ y: 240, extent: 700, count: 10, opacity: 0.35, color: 0xb4bcb0 })));
    ctx.onUpdate(() => { const n = night(); for (const f of dimmers) f(n); });

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 190, center: [0, 10, 0], minDistance: 14,
      hero: { pos: [86, 74, 104], target: [4, 16, 8] },
      climate: {
        atmos: 'day', weather: 'clear', snow: 0,
        tint: {
          dawn: { top: 0x566c66, horizon: 0xc2c0a8, fog: 0xa8b4a0, fogD: 0.0022, sunC: 0xffcf9a, sunI: 1.5, hemiSky: 0x93a8a4, hemiGround: 0x4a4a38, hemiI: 0.95 },
          day: { top: 0x61787a, horizon: 0xb8c4b4, fog: 0xa8b8a6, fogD: 0.0019, sunC: 0xf6ecc6, sunI: 2.0, hemiSky: 0xa4bcb4, hemiGround: 0x5a5a3c, hemiI: 1.1 },
          dusk: { top: 0x2c3a52, horizon: 0xc88c64, fog: 0x7a7860, fogD: 0.0023, sunC: 0xff9c58, sunI: 2.2, hemiSky: 0x7488a0, hemiGround: 0x3a3a2c, hemiI: 0.75 },
          night: { top: 0x060c1c, horizon: 0x24344c, fog: 0x1a2a30, fogD: 0.0027, sunC: 0x94b0e0, sunI: 1.2, hemiSky: 0x5a7298, hemiGround: 0x222a28, hemiI: 1.15 },
        },
      },
      landmarks: {
        'gatehouse-tower': { pos: [roadX(26), H(roadX(26), 26) + 48, 26], r: 16 },
        'drunkards-tower': { pos: [-28, H(-34, 40) + 42, 38], r: 12 },
        'childrens-tower': { pos: [38, H(38, -8) + 56, -8], r: 10 },
        'ruined-walls': lm(-40, 24, 14, 10),
        'ruined-keep': lm(-6, -30, 16, 16),
        'kingsroad-causeway': lm(roadX(110), 110, 20, 4),
        'bogs-and-mist': lm(70, 90, 40, 6),
        'crannog': { ...lm(-96, 70, 14, 8), cam: { pos: [-62, 20, 104], target: [-96, 3, 70] } },
        'lizard-lions': lm(-60, -140, 30, 4),
      },
      cutaways: [],
    };
  },
};
