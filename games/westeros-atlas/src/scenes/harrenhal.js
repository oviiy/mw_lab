// Harrenhal — book anchors: the largest castle in Westeros on the God's Eye; five colossal towers whose tops were slumped by
// dragonfire (Tower of Dread, Wailing Tower, Kingspyre Tower, Tower of Ghosts, Widow's Tower); the Hall of a Hundred Hearths with
// its forest of chimneys; a walled godswood; a bear pit; baths; vast ruined yards. Plan/positions are interpretation (see content).
//
// Visual language: charcoal-brown black stone with rust and soot streaks, vitrified glassy "wax" crowns with ember-lit cracks,
// a moody overcast moor with heather, pale weirwood with red leaves in the godswood, dim slate lake.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const WALL = [[-130, -20], [-115, -75], [-70, -105], [0, -115], [70, -105], [115, -70], [130, -10], [120, 60], [90, 105], [40, 118], [0, 122], [-45, 118], [-90, 100], [-120, 55]];
const TAU = Math.PI * 2;
const tint = (r, v = 0.12, w = 0.05) => { const k = 1 - v * r(); return new THREE.Color(k, k * (1 - w * r()), k * (1 - w * r() * 1.4)); };
const jit = (hex, r, dh = 0.012, ds = 0.05, dl = 0.03) => new THREE.Color(hex).offsetHSL((r() - 0.5) * 2 * dh, (r() - 0.5) * 2 * ds, (r() - 0.5) * 2 * dl);
const _up = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _d = new THREE.Vector3(), _e = new THREE.Euler();
const loc = (cx, cz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c]; };
function strut(b, mat, p, q, w, color = 0xffffff, d = w) {
  _d.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); const len = _d.length(); if (len < 1e-3) return;
  _q.setFromUnitVectors(_up, _d.multiplyScalar(1 / len)); _m.compose(_p.set(p[0], p[1], p[2]), _q, _s.set(w, len, d));
  b.addGeometry(mat, G.box(), _m, color);
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

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root;
    const heightAt = (x, z) => {
      const r = Math.hypot(x, z);
      let h = 4 + (K.fbm(x * 0.012, z * 0.012, 3, 4) - 0.5) * 6 + (K.fbm(x * 0.05, z * 0.05, 2, 8) - 0.5) * 0.8;
      h += K.smoothstep(340, 520, r) * (40 + K.fbm(x * 0.006, z * 0.006, 3, 2) * 60);
      h += 5 * K.smoothstep(-60, -250, z) * (1 + K.fbm(x * 0.02, z * 0.02, 2, 3));
      const shore = 168 + (K.fbm(x * 0.01, 5, 2, 6) - 0.5) * 40;
      h -= K.smoothstep(shore - 8, shore + 30, z) * 14;
      return h;
    };
    const H = heightAt, C = (h) => new THREE.Color(h);
    const grass = C(0x667444), olive = C(0x80804d), heath = C(0x74606a), dry = C(0x8e8863), rockC = C(0x5d5853), rockHi = C(0x7d766b), sand = C(0x8c8466), yard = C(0x6f685c), scorch = C(0x3b3632), c = new THREE.Color();
    const inWall = (x, z) => K.pointInPoly(x, z, WALL);
    root.add(K.terrain({ size: 1000, seg: q.seg(190), heightAt, kind: 'rock', scale: 16, colorAt: (x, z, h, s) => {
      const n1 = K.fbm(x * 0.02, z * 0.02, 3, 3), n2 = K.fbm(x * 0.07, z * 0.07, 2, 6), n3 = K.fbm(x * 0.012, z * 0.012, 2, 9);
      c.copy(grass).lerp(olive, K.clamp(n1 * 1.3 - 0.2, 0, 1)).lerp(dry, K.smoothstep(0.55, 0.8, n3) * 0.6).lerp(heath, K.smoothstep(0.52, 0.72, n2) * 0.45 * K.smoothstep(8, 20, h));
      const rr = Math.hypot(x, z);
      if (inWall(x, z)) c.lerp(yard, 0.7).lerp(grass, K.smoothstep(0.55, 0.7, n2) * 0.5);        // trodden yards with weeds in the ruins
      else if (rr < 190) c.lerp(scorch, (1 - K.smoothstep(130, 190, rr)) * 0.35);                // scorched halo round the walls
      if (h < 1.6) c.lerp(sand, 0.6);
      const strata = 0.5 + 0.5 * Math.sin(h * 0.6 + n1 * 8);
      c.lerp(strata > 0.5 ? rockHi : rockC, K.clamp(s * 2.6 + (h > 40 ? 0.35 : 0), 0, 0.85)); return c; } }));
    const lake = K.water({ w: 1000, d: 620, seg: q.seg(130), level: 0, center: [0, 380], heightAt, deep: 0x213c4a, shallow: 0x5c7c78, opacity: 0.93, choppy: 0.5, speed: 0.5 });
    root.add(lake); ctx.registerWater(lake);

    const T = (k, color, scale = 8, o = {}) => tri(k, { color, scale, snow: true, ...o });
    const M = {
      stone: T('stone', 0x766f66), stoneLo: T('stone', 0x59534d, 9), trim: T('stone', 0x8a8174, 7), burnt: T('stone', 0x3d3835, 6), cap: T('stone', 0x4b4642, 7),
      melt: T('rock', 0x6c6266, 7), glaze: flat(0x4a3e42, { rough: 0.42, metal: 0.1, emissive: 0x160904, flatShading: false }),
      slate: T('slate', 0x464b54, 6), wood: T('wood', 0x5a4330, 4, { snow: false }), woodDk: T('wood', 0x3a2d22, 4, { snow: false }), cobble: T('cobble', 0x6d675e, 8), plaster: T('plaster', 0x8a8274, 6),
      thatch: T('thatch', 0x7c6e4c, 5), tile: T('tile', 0x8a5a48, 5), dark: flat(0x14110f, { rough: 1 }), door: flat(0x2c2118, { rough: 0.9 }), moss: T('grass', 0x59683a, 5, { rough: 1 }),
      win: glow(0xff9a4a), ember: glow(0xff6a22, 1.2), lamp: glow(0xffa04a, 1.1), iron: flat(0x2b2a2e, { metal: 0.6, rough: 0.5 }),
      deck: T('wood', 0xa58a64, 3), hullW: T('wood', 0x8a6a4c, 3, { side: THREE.DoubleSide }), bone: T('plaster', 0xe9e4d8, 3, { snow: false }),
    };
    const rt = K.rng(808), b = new Batch();

    // ---- builders ---------------------------------------------------------------------------------------------------
    /** Wall tower: battered plinth, courses, corbelled crenellated crown. broken -> ragged shell with rubble. */
    function drum(x, y, z, r, h, o = {}) {
      const { seg = 11, taper = 0.9, rings = [0.3, 0.62], broken = false, col = 0xffffff, stone = M.stone, trim = M.trim, base = M.stoneLo, r: R = rt } = o;
      const rA = (t) => r * (1 - (1 - taper) * t);
      b.cyl(base, x, y - 4, z, r * 1.16, 7.2, { top: 0.9, seg, color: col });
      b.cyl(stone, x, y, z, r, h, { top: taper, seg, color: col });
      for (const t of rings) b.cyl(trim, x, y + t * h - 0.3, z, rA(t) * 1.04, 0.7, { top: 1, seg, color: col });
      for (let k = 0; k < 3; k++) { const a = k * 2.1 + r * 1.7, t = 0.28 + 0.14 * k, rr = rA(t) + 0.04; b.box(M.dark, x + Math.cos(a) * rr, y + h * t, z + Math.sin(a) * rr, 0.4, 2.1, 0.2, Math.PI / 2 - a); }
      if (!broken) {
        const yt = y + h, R2 = rA(1) * 1.02 * 1.26;
        b.cyl(trim, x, yt - 0.3, z, rA(1) * 1.02, 1.8, { top: 1.26, seg, color: col });
        b.cyl(stone, x, yt + 1.5, z, R2, 1.2, { top: 1, seg, color: col });
        const n = Math.max(7, Math.round((TAU * R2) / 3.0));
        for (let i = 0; i < n; i++) { const a = (i / n) * TAU; b.box(stone, x + Math.cos(a) * (R2 - 0.3), yt + 2.7, z + Math.sin(a) * (R2 - 0.3), 1.6, 1.3, 0.8, Math.PI / 2 - a, col); }
      } else {
        const yt = y + h, n = 9;
        for (let i = 0; i < n; i++) { const a = (i / n) * TAU, hh = R.range(1.5, 5.5); b.box(stone, x + Math.cos(a) * (rA(1) * 0.9), yt - 0.5, z + Math.sin(a) * (rA(1) * 0.9), 2.6, hh, 1.6, Math.PI / 2 - a, col, R.range(-0.15, 0.15)); }
        for (let i = 0; i < 6; i++) { const a = R() * TAU, d = r * R.range(1.3, 2.6); b.box(M.burnt, x + Math.cos(a) * d, H(x + Math.cos(a) * d, z + Math.sin(a) * d) - 0.4, z + Math.sin(a) * d, R.range(1.5, 3.2), R.range(0.8, 2.2), R.range(1.5, 3), R() * 3); }
      }
    }
    function wallTrim(pts, { h, t, plinthH = 4, closed = true }) {
      const n = closed ? pts.length : pts.length - 1;
      for (let i = 0; i < n; i++) {
        const A = pts[i], B = pts[(i + 1) % pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz), steps = Math.max(1, Math.ceil(len / 14)), ry = Math.atan2(-dz, dx);
        for (let s = 0; s < steps; s++) {
          const t0 = s / steps, t1 = (s + 1) / steps, x0 = A[0] + dx * t0, z0 = A[1] + dz * t0, x1 = A[0] + dx * t1, z1 = A[1] + dz * t1;
          const g = Math.min(H(x0, z0), H(x1, z1), H((x0 + x1) / 2, (z0 + z1) / 2)), top = Math.max(H(x0, z0), H(x1, z1)) + h, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sl = Math.hypot(x1 - x0, z1 - z0) + 0.6;
          b.box(M.stoneLo, cx, g - 3, cz, sl + 0.2, plinthH + 3, t + 2.2, ry);
          b.box(M.trim, cx, top - 1.3, cz, sl, 1.25, t + 1.2, ry);
          b.box(M.trim, cx, g + (top - g) * 0.5, cz, sl, 0.5, t + 0.45, ry);
          for (const sd of [-1, 1]) if ((i + s) % 2 === 0) { const nx = -dz / len, nz = dx / len; b.box(M.dark, cx + nx * sd * (t / 2 + 0.05), g + (top - g) * 0.7, cz + nz * sd * (t / 2 + 0.05), 0.5, 2.6, 0.2, ry + Math.PI / 2 * 0); }
        }
      }
    }
    // ---- walls and wall-towers
    K.wall(b, WALL, { h: 28, t: 8, mat: M.stone, capMat: M.cap, heightAt, closed: true, merlon: 1.6 });
    wallTrim(WALL, { h: 28, t: 8 });
    WALL.forEach(([x, z], i) => drum(x, H(x, z), z, 8, 40 + (i % 3) * 4, { broken: i % 5 === 2, col: tint(rt, 0.14, 0.06), rings: [0.34, 0.66] }));
    const torches = [];
    function gate(gx, gz, o) {
      const y = H(gx, gz);
      K.gatehouse(b, gx, gz, { y, ry: 0, mat: M.stone, roofMat: M.cap, w: o.w, d: o.d, h: o.h, gate: o.gate, wood: M.wood, towerR: o.tr });
      b.box(M.dark, gx, y, gz - o.d * 0.2, o.gate - 0.2, o.gate * 1.15, 0.3, 0);
      b.box(M.trim, gx, y + o.gate * 1.15 - 0.9, gz, o.gate + 2, 0.9, o.d + 0.6, 0); b.box(M.trim, gx, y + o.h - 1.3, gz, o.w, 1.1, o.d + 1.8, 0);
      for (const sx of [-1, 1]) { const px = gx + sx * (o.gate / 2 + 1.8), pz = gz + o.d / 2 + 0.5; b.box(M.iron, px, y + 5, pz, 0.28, 1.0, 0.28); b.box(M.lamp, px, y + 6, pz, 0.6, 0.7, 0.6); torches.push([px, y + 7, pz]); }
    }
    gate(0, 122, { w: 30, d: 12, h: 34, gate: 8, tr: 7 }); gate(0, -115, { w: 24, d: 10, h: 30, gate: 7, tr: 6 });

    // ---- the five slumped towers
    const melted = (x, z, r, h, seed) => {
      const rr = K.rng(seed), y = H(x, z), tc = tint(rr, 0.1, 0.05);
      b.cyl(M.stoneLo, x, y - 6, z, r * 1.3, 8.5, { top: 0.86, seg: 18, color: tc });
      b.cyl(M.stone, x, y, z, r * 1.05, h, { top: 0.8, seg: 18, color: tc });
      for (const t of [0.18, 0.4, 0.62]) b.cyl(M.trim, x, y + h * t - 0.4, z, r * (1.05 - 0.25 * t) * 1.04, 0.8, { top: 1, seg: 18, color: tc });
      // battered buttress ribs, tapering upward
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + 0.2; b.cyl(M.burnt, x + Math.cos(a) * r * 1.0, y - 1, z + Math.sin(a) * r * 1.0, 1.7, h * 0.58, { top: 0.35, seg: 5 }); }
      // window slits, a few firelit
      for (let i = 0; i < 9; i++) { const a = rr() * TAU, t = rr.range(0.15, 0.62), rad = r * (1.05 - 0.25 * t) + 0.05; const lit = i % 3 === 0; arch(b, lit ? M.win : M.dark, x + Math.cos(a) * rad, y + h * t, z + Math.sin(a) * rad, Math.PI / 2 - a, 1.2, 4.2, 0.2); }
      // corbelled neck, then the slumped crown: ring of sagging lobes, tiers that lean to one side, a collapsed cap
      let cy = y + h; const rad = r * 0.82, sa = rr() * TAU, lx = Math.cos(sa), lz = Math.sin(sa);
      b.cyl(M.trim, x, cy - 2.4, z, rad * 1.0, 2.6, { top: 1.3, seg: 18, color: tc });
      b.cyl(M.melt, x, cy, z, rad * 1.3, 7, { top: 1.05, seg: 14 });
      const lobes = 11;
      for (let i = 0; i < lobes; i++) {
        const a = (i / lobes) * TAU + rr() * 0.3, d = rad * rr.range(1.15, 1.5), sz = r * rr.range(0.22, 0.36), sag = Math.max(0, Math.cos(a - sa)) * 2.5;
        b.sphere(rr() < 0.25 ? M.glaze : M.melt, x + Math.cos(a) * d, cy + rr.range(-1.5, 2.5) - sag, z + Math.sin(a) * d, sz, { seg: 8, sy: rr.range(0.7, 1.1), color: jit(0xa6989c, rr, 0.03, 0.1, 0.05) });
      }
      cy += 6.5; let ox = 0, oz = 0;
      b.cyl(M.melt, x, cy, z, rad * 1.35, 4.5, { top: 0.84, seg: 12 }); cy += 4; ox += lx * r * 0.14; oz += lz * r * 0.14;
      b.cyl(M.melt, x + ox, cy, z + oz, rad * 1.0, 4, { top: 0.72, seg: 10 }); cy += 3.6; ox += lx * r * 0.16; oz += lz * r * 0.16;
      b.sphere(M.melt, x + ox, cy - 1.5, z + oz, rad * 0.85, { seg: 9, sy: 0.55, color: jit(0xb0a2a4, rr, 0.03, 0.1, 0.04) });
      b.sphere(M.glaze, x + ox + lx * rad * 0.7, cy - 2.4, z + oz + lz * rad * 0.7, rad * 0.45, { seg: 8, sy: 0.8 });
      for (let i = 0; i < 3; i++) { const a = rr() * TAU, d = rad * 0.8; b.box(M.burnt, x + Math.cos(a) * d, cy - 2.5, z + Math.sin(a) * d, 2.4, rr.range(5, 10), 2, a, 0xffffff, rr.range(-0.3, 0.3), rr.range(-0.4, 0.4)); } // snapped merlons
      // frozen drips down the flanks, and ember-lit cracks
      for (let i = 0; i < 14; i++) { const a = rr() * TAU, len = rr.range(8, 30), rd = r * 0.8 + 1.1 + rr() * 1.1; b.cyl(i % 4 === 0 ? M.glaze : M.melt, x + Math.cos(a) * rd * 1.05, y + h - len + rr.range(-2, 2), z + Math.sin(a) * rd * 1.05, rr.range(0.55, 1.1), len, { top: rr.range(1.8, 2.8), seg: 5, color: jit(0xa6989c, rr, 0.03, 0.1, 0.05) }); }
      for (let i = 0; i < 9; i++) { const a = rr() * TAU; b.box(M.ember, x + Math.cos(a) * (rad * 1.3), y + h * 0.985 - rr.range(0, 10), z + Math.sin(a) * (rad * 1.3), 0.45, rr.range(2.5, 6.5), 0.25, Math.PI / 2 - a); }
      return { x, z, y, h, top: cy };
    };
    const Tw = { kingspyre: melted(-32, -34, 17, 104, 11), widow: melted(20, -48, 13, 80, 12), dread: melted(-70, 18, 15, 84, 13), wailing: melted(56, 6, 14, 78, 14), ghosts: melted(102, 42, 13, 72, 15) };
    K.bridge(b, [-32 + 15, H(-32, -34) + 50, -36], [20 - 11, H(20, -48) + 50, -47], { w: 4, rise: 0.8, mat: M.stone, rail: true, sink: 2 });

    // ---- Hall of a Hundred Hearths: huge slate-roofed hall with a hedge of chimneys
    const hx = -6, hz = 40, hy = H(hx, hz);
    b.box(M.stoneLo, hx, hy - 3, hz, 98, 8, 36, 0); b.box(M.stone, hx, hy - 3, hz, 96, 29, 34, 0); b.box(M.trim, hx, hy + 11, hz, 97, 0.7, 35, 0); b.box(M.trim, hx, hy + 24.2, hz, 98, 1.8, 36, 0);
    b.prism(M.slate, hx, hy + 26, hz, 101, 14, 38, 0); b.box(M.cap, hx, hy + 39.8, hz, 101.5, 0.7, 1.0, 0);
    for (let i = -4; i <= 4; i++) for (const sd of [-1, 1]) arch(b, M.win, hx + i * 10, hy + 9, hz + sd * 17.05, sd < 0 ? Math.PI : 0, 2.2, 9, 0.2);
    for (let i = -5; i <= 5; i++) for (const sd of [-1, 1]) { b.cyl(M.burnt, hx + i * 10 + 5, hy - 1, hz + sd * 17.9, 1.5, 22, { top: 0.55, seg: 5 }); }
    const chim = [];
    for (let i = 0; i < 17; i++) for (const s of [-1, 1]) { const x = hx - 46 + i * 5.8, z = hz + s * 11, hh = 22 + (i % 3) * 3.2; b.box(M.burnt, x, hy + 18, z, 2.6, hh, 2.6, 0); b.box(M.cap, x, hy + 18 + hh, z, 3.5, 1.1, 3.5, 0); b.box(M.cap, x, hy + 19.1 + hh, z, 2.4, 0.5, 2.4, 0); if (i % 2 === 0) chim.push([x, hy + 20 + hh, z]); if (i % 3 === 1) b.box(M.ember, x, hy + 19.6 + hh, z, 1.8, 0.25, 1.8, 0); }
    b.box(M.stone, hx + 52, hy - 2, hz, 8.5, 24, 22, 0); b.pyramid(M.slate, hx + 52, hy + 22, hz, 10.5, 9, 24, 0);
    // ---- bear pit (ring wall, sunken floor)
    const bx = -78, bz = -46, by = H(bx, bz);
    b.cyl(M.stoneLo, bx, by - 3, bz, 16.5, 8.6, { top: 1, seg: 22 }); b.cyl(flat(0x2c241d), bx, by + 4.9, bz, 12.8, 0.2, { seg: 22 });
    for (let i = 0; i < 20; i++) { const a = (i / 20) * TAU; b.box(M.cap, bx + Math.cos(a) * 14.8, by + 5.4, bz + Math.sin(a) * 14.8, 2.1, 1.2, 1.1, Math.PI / 2 - a); if (i % 3 === 0) arch(b, M.dark, bx + Math.cos(a) * 16.5, by - 0.5, bz + Math.sin(a) * 16.5, Math.PI / 2 - a, 2.2, 3.5, 0.2); }
    // ---- baths (low steaming house) and the lesser buildings of the yards
    const steam = [];
    const hut = (x, z, w, d, h, ry, o = {}) => {
      const L = loc(x, z, ry); let y0 = 1e9; for (const [sx, sz] of [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const [px, pz] = L(sx * w / 2, sz * d / 2); y0 = Math.min(y0, H(px, pz)); }
      const col = tint(rt, 0.15, 0.06), rh = (d / 2 + 0.5) * 0.7;
      b.box(M.stoneLo, x, y0 - 1.4, z, w + 0.3, 2.6, d + 0.3, ry); b.box(o.wall || M.plaster, x, y0 - 1.4, z, w, h + 1.4, d, ry, col);
      b.prism(o.roof || M.slate, x, y0 + h, z, w + 1, rh, d + 1, ry, tint(rt, 0.2, 0.04)); b.box(M.cap, x, y0 + h + rh - 0.12, z, w + 1.1, 0.3, 0.55, ry);
      const [dx, dz] = L(w * 0.2, d / 2 + 0.07); b.box(M.door, dx, y0 - 0.1, dz, 1.3, 2.3, 0.14, ry);
      for (const fx of [-0.3, 0.3]) { const [px, pz] = L(w * fx, d / 2 + 0.08); arch(b, M.win, px, y0 + h * 0.4, pz, ry, 0.9, 1.6, 0.1); }
      const [cx, cz] = L(w * 0.3, 0); b.box(M.stone, cx, y0 + h * 0.5, cz, 1.2, h * 0.5 + rh + 1.4, 1.2, ry); b.box(M.cap, cx, y0 + h + rh + 1.4, cz, 1.6, 0.3, 1.6, ry); steam.push([cx, y0 + h + rh + 2.2, cz]);
    };
    hut(34, 78, 26, 14, 7, 0); hut(76, 62, 14, 10, 6, 0.2); hut(-40, 90, 16, 12, 6, 0); hut(-98, 40, 12, 12, 7, 0.3); hut(86, 78, 12, 12, 7, 0.1);
    hut(60, -78, 14, 9, 5.5, 0.2, { wall: M.stone, roof: M.slate }); hut(-20, -90, 12, 9, 5.5, 0, { wall: M.stone, roof: M.slate });
    // ---- ruined yards: courts of cobble, shattered walls, rubble and weeds
    b.box(M.cobble, 0, H(0, 0) + 0.1, 0, 130, 0.3, 60, 0); b.box(M.cobble, 0, H(0, 85) + 0.1, 85, 160, 0.3, 36, 0);
    const rr = K.rng(77), rub = new Inst(G.sphere(5), M.burnt);
    for (let i = 0; i < 46; i++) { const x = rr.range(-120, -40), z = rr.range(48, 100); if (K.pointInPoly(x, z, WALL)) { const w = rr.range(3, 14), hh = rr.range(1.5, 9), ry = rr() * 3; b.box(M.burnt, x, H(x, z) - 0.8, z, w, hh + 0.8, rr.range(1.4, 3), ry, tint(rr, 0.2, 0.05)); if (hh > 5) b.box(M.stone, x, H(x, z) + hh - 1.2, z, w * 0.5, 1.2, 2.4, ry + 0.4, tint(rr, 0.2, 0.05)); } }
    for (let i = 0; i < 28; i++) { const x = rr.range(-90, 100), z = rr.range(-90, 60); if (!K.pointInPoly(x, z, WALL) || Math.hypot(x + 6, z - 40) < 40 || Math.hypot(x + 78, z + 46) < 22) continue; b.box(M.burnt, x, H(x, z) - 0.8, z, rr.range(1.5, 6), rr.range(1.8, 5), rr.range(1.5, 4), rr() * 3, tint(rr, 0.2, 0.05)); }
    for (let i = 0; i < 160; i++) { const x = rr.range(-125, 125), z = rr.range(-100, 115); if (!K.pointInPoly(x, z, WALL)) continue; const s = rr.range(0.6, 2.2); rub.add(x, H(x, z) - 0.2, z, s * 1.4, s * 0.8, s * 1.2, rr() * 3, tint(rr, 0.35, 0.05)); }
    for (const t of Object.values(Tw)) for (let i = 0; i < 14; i++) { const a = rr() * TAU, d = rr.range(16, 30), s = rr.range(0.8, 2.6); rub.add(t.x + Math.cos(a) * d, H(t.x + Math.cos(a) * d, t.z + Math.sin(a) * d) - 0.2, t.z + Math.sin(a) * d, s * 1.5, s, s * 1.3, rr() * 3, tint(rr, 0.35, 0.05)); }
    K.pier(b, 6, 1.4, 150, { len: 36, w: 4, ry: -Math.PI / 2, mat: M.wood });
    b.ribbon(M.cobble, [[0, 125], [0, 160]], 11, heightAt, 0.3, 0x7a7266); b.ribbon(M.cobble, [[0, 125], [0, 160]], 8.6, heightAt, 0.36, 0xa59d90);
    root.add(b.build({})); root.add(rub.build());

    // ---- vegetation ----------------------------------------------------------------------------------------------------
    const leaf = T('grass', 0xffffff, 3, { rough: 1, snow: false });
    function trees({ rng, count, bounds, poly, avoid, scale = [1, 1.5], minDist = 6, greens, kind = 'oak' }) {
      const pts = K.scatter({ rng, count, bounds, poly, minDist, avoid }), grp = new THREE.Group();
      const trunk = new Inst(G.cyl(5, 0.7), T('wood', 0xffffff, 3, { snow: false })), A = new Inst(kind === 'pine' ? G.cone(6) : G.sphere(7), leaf), B = new Inst(kind === 'pine' ? G.cone(6) : G.sphere(6), leaf);
      for (const [x, z] of pts) {
        const k = rng.range(scale[0], scale[1]), y = H(x, z), gc = jit(rng.pick(greens), rng, 0.02, 0.08, 0.04);
        if (kind === 'pine') { trunk.add(x, y, z, 0.45 * k, 3 * k, 0.45 * k, 0, 0x4d3c2d); A.add(x, y + 1.8 * k, z, 2.5 * k, 5.6 * k, 2.5 * k, rng() * 6, gc); B.add(x, y + 5.4 * k, z, 1.8 * k, 4.4 * k, 1.8 * k, rng() * 6, gc); }
        else { trunk.add(x, y, z, 0.5 * k, 3.2 * k, 0.5 * k, 0, jit(0x57412e, rng, 0.01, 0.05, 0.04)); A.add(x, y + 2.5 * k, z, 2.6 * k, 2.3 * k, 2.6 * k, rng() * 6, gc); if (rng() < 0.5) B.add(x + rng.range(-1.1, 1.1) * k, y + 3.7 * k, z + rng.range(-1.1, 1.1) * k, 1.7 * k, 1.6 * k, 1.7 * k, 0, jit(rng.pick(greens), rng, 0.02, 0.08, 0.06)); }
      }
      for (const i of [trunk, A, B]) if (i.items.length) grp.add(i.build());
      return grp;
    }
    const goPoly = [[38, -92], [100, -68], [108, -24], [60, -22], [36, -50]];
    root.add(trees({ rng: K.rng(5), count: q.dens(46), bounds: [34, -95, 110, -20], poly: goPoly, minDist: 4.2, greens: [0x2c3f2a, 0x364a2d, 0x2a3a22], scale: [1.4, 2.2] }));
    { // the heart tree: a great white weirwood with a crown of red leaves
      const wb = new Batch(), wx = 70, wz = -55, wy = H(wx, wz), rw = K.rng(6);
      wb.cyl(M.bone, wx, wy - 1, wz, 1.9, 7, { top: 0.72, seg: 9 });
      for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.3; strut(wb, M.bone, [wx, wy + 5.2, wz], [wx + Math.cos(a) * 5.2, wy + 9.5 + rw() * 2, wz + Math.sin(a) * 5.2], 0.7); }
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, d = i ? 4.2 : 0; wb.sphere(flat(0xffffff, { rough: 1, flatShading: false }), wx + Math.cos(a) * d, wy + 8.6 + (i % 3) * 1.1, wz + Math.sin(a) * d, 3.5, { seg: 8, sy: 0.75, color: jit(0x93362e, rw, 0.015, 0.1, 0.05) }); }
      root.add(wb.build({}));
    }
    root.add(trees({ rng: K.rng(9), count: q.dens(300), bounds: [-420, -420, 420, 160], avoid: (x, z) => Math.hypot(x * 0.8, z + 5) < 175 || H(x, z) < 1.2, greens: [0x4a6a3a, 0x3f5c34, 0x55703a, 0x62803c], scale: [1.2, 2], minDist: 7 }));
    root.add(trees({ rng: K.rng(10), count: q.dens(200), bounds: [-420, -420, 420, 90], kind: 'pine', avoid: (x, z) => Math.hypot(x * 0.8, z + 5) < 200 || H(x, z) < 12, greens: [0x2c4a35, 0x35563b, 0x264133], scale: [1.4, 2.2], minDist: 7 }));

    // ---- boats on the God's Eye (same hull builder as King's Landing) ------------------------------------------------------------
    const sailMat = (hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 1, side: THREE.DoubleSide });
    function makeShip(type, len, hullHex, sailHex, seed) {
      const g = new THREE.Group(), sb = new Batch(), r = K.rng(seed), beamH = len * (type === 'barge' ? 0.14 : 0.15), Dp = len * 0.09;
      const N = 10, J = 6, pos = [], idx = [], rowN = 2 * J + 1;
      for (let i = 0; i <= N; i++) {
        const u = i / N, e = Math.abs(2 * u - 1), bf = Math.pow(Math.sin(Math.PI * (0.05 + 0.9 * u)), 0.5) * (1 - K.smoothstep(0.62, 1, u) * 0.92), x = (u - 0.5) * len;
        const keel = -Dp * 0.35 + Dp * 0.25 * e * e, top = Dp * 0.62 + len * 0.045 * e * e * (type === 'barge' ? 0.3 : 1);
        for (let j = 0; j < rowN; j++) { const f = ((j / (rowN - 1)) * 2 - 1) * Math.PI / 2; pos.push(x, keel + (top - keel) * (1 - Math.cos(f)), beamH * bf * Math.sin(f)); }
      }
      for (let i = 0; i < N; i++) for (let j = 0; j < rowN - 1; j++) { const a = i * rowN + j, bI = a + 1, cI = a + rowN, dI = cI + 1; idx.push(a, cI, bI, bI, cI, dI); }
      const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setIndex(idx); hg.computeVertexNormals();
      sb.addGeometry(M.hullW, hg, new THREE.Matrix4(), hullHex);
      const top0 = Dp * 0.62;
      sb.box(M.hullW, -len * 0.5, -Dp * 0.1, 0, 0.4, top0 + Dp * 0.1 + len * 0.045, beamH * 0.8, 0, hullHex); sb.box(M.hullW, 0, top0 - 0.55, 0, len * 0.72, 0.18, beamH * 1.5, 0, 0xe6cda4);
      if (type !== 'barge') sb.box(M.hullW, -len * 0.36, top0 - 0.5, 0, len * 0.22, 1.6, beamH * 1.5, 0, hullHex);
      const mx = len * 0.04, mh = len * (type === 'barge' ? 0.7 : 0.85), yw = top0 + mh * 0.8, sw = beamH * 2.9, sh = mh * 0.55;
      sb.cyl(M.hullW, mx, top0 - 0.5, 0, 0.2, mh, { seg: 6, top: 0.7, color: 0x6a5240 }); sb.box(M.hullW, mx, yw, 0, 0.16, 0.16, sw * 1.12, 0, 0x6a5240);
      const sg = new THREE.PlaneGeometry(sw, sh, 6, 4), sm = new THREE.Mesh(sg, sailMat(sailHex));
      sm.position.set(mx + 0.15, yw - sh / 2, 0); sm.rotation.y = Math.PI / 2; sm.castShadow = true; sm.userData.base = Float32Array.from(sg.attributes.position.array); sm.userData.hw = sw / 2; sm.userData.hh = sh / 2; sm.userData.ph = r() * 6; g.add(sm);
      strut(sb, M.hullW, [mx, top0 + mh * 0.97, 0], [len * 0.47, top0 + 0.6, 0], 0.06, 0x4a3a2e); strut(sb, M.hullW, [mx, top0 + mh * 0.97, 0], [-len * 0.48, top0 + 1.4, 0], 0.06, 0x4a3a2e);
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
    const boats = [0, 1, 2].map((i) => { const s = makeShip(i === 1 ? 'cog' : 'barge', 11 + i * 2, [0x5a4128, 0x4a3a2c, 0x6a4a30][i], [0xcfc3a0, 0xb0a58a, 0xd8cdb0][i], 21 + i); s.position.set(-60 + i * 70, 0.2, 230 + i * 25); root.add(s); return s; });
    ctx.onUpdate((dt, t) => boats.forEach((s, i) => { s.position.x = -80 + i * 80 + Math.sin(t * 0.04 + i * 2) * 50; s.position.z = 235 + i * 28 + Math.cos(t * 0.05 + i) * 12; s.rotation.y = Math.cos(t * 0.04 + i * 2) * 0.4 + 1.57; animSails(s, t, i); s.position.y = 0.2; }));

    // ---- life: smoke, embers, fires, banners, folk, crows -----------------------------------------------------------------------------
    root.add(K.smoke(Object.values(Tw).map((t) => [t.x, t.top + 3, t.z]), { color: 0x4a4644, size: 46, rise: 40, opacity: 0.3, perStack: 6 }));
    root.add(K.smoke(chim, { color: 0x77716b, size: 24, rise: 22, opacity: 0.34 }));
    root.add(K.smoke(steam, { color: 0xe4e4e0, size: 18, rise: 14, opacity: 0.3, perStack: 4 }));
    const fireSpots = [[-34, H(-34, 2) + 2.2, 4], [34, H(34, 2) + 2.2, 4], [-78, by + 6, -46], [0, H(0, 118) + 12, 112], ...torches, ...Object.values(Tw).map((t) => [t.x + 2, t.top + 4, t.z])];
    const fire = K.fires(fireSpots, { size: 8, light: q.low ? 0 : 3, intensity: 70 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    root.add(K.banners([[6, 62, 118], [-6, 62, 118], [-32, 118, -34]].map(([x, y, z]) => ({ x, y: H(x, z) + y - 40 + (z < 0 ? 40 : 0), z, w: 3, h: 9, color: 0x2a2423, ry: 0.4 }))));
    const wk = K.walkers({ paths: [[[0, 150], [0, 90], [-5, 55]], [[-40, 18], [30, 18], [60, 14]], [[-70, 80], [-30, 100]]], heightAt, count: q.dens(18), rng: K.rng(4) });
    root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const crows = K.birds({ center: [-20, 90, -20], radius: 110, count: q.dens(16), color: 0x101012, size: 1.3, spreadY: 22, seed: 3 }); root.add(crows); ctx.onUpdate((dt, t) => crows.userData.update(t));
    const gulls = K.birds({ center: [0, 30, 260], radius: 120, count: q.dens(6), color: 0xcfd2d4, size: 1.2, spreadY: 8, seed: 8 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    root.add(K.clouds({ y: 280, extent: 800, count: 10, opacity: 0.38, color: 0xc4c7c6 }));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 280, center: [0, 0, 20], minDistance: 20,
      hero: { pos: [-120, 105, 330], target: [0, 38, -10] },
      climate: {
        atmos: 'day', weather: 'clear',
        tint: {
          dawn: { top: 0x58668a, horizon: 0xdcb09a, fog: 0xb8a39a, fogD: 0.0016, sunC: 0xffc090, hemiSky: 0x9aa4c4, hemiGround: 0x5a4a44 },
          day: { top: 0x5b6d84, horizon: 0xc6c9c2, fog: 0xa4aaa6, fogD: 0.0011, sunC: 0xffe4bc, sunI: 2.9, hemiSky: 0xaebccc, hemiGround: 0x8a8068, hemiI: 1.35 },
          dusk: { top: 0x2c3460, horizon: 0xdc8a64, fog: 0x9a7a7c, fogD: 0.0016, sunC: 0xff9a58, sunI: 2.8, hemiSky: 0x8486b4, hemiGround: 0x4e3e3c, hemiI: 0.75 },
          night: { top: 0x070b22, horizon: 0x303c5e, fog: 0x232e48, fogD: 0.0017, sunC: 0xa6baee, sunI: 1.8, hemiSky: 0x6e82bc, hemiGround: 0x303650, hemiI: 1.25 },
        },
      },
      landmarks: {
        'tower-of-dread': lm(-70, 18, 18, 92), 'wailing-tower': lm(56, 6, 18, 86), 'kingspyre-tower': lm(-32, -34, 22, 112), 'tower-of-ghosts': lm(102, 42, 17, 80),
        'widows-tower': lm(20, -48, 18, 88), 'hall-of-hundred-hearths': lm(-6, 40, 40, 42), godswood: lm(70, -52, 28, 14), 'walls-and-gate': lm(0, 122, 20, 36),
        'bear-pit': lm(-78, -46, 16, 8), baths: lm(34, 78, 14, 8), 'ruined-yards': lm(-82, 74, 26, 6), 'god-s-eye': lm(0, 200, 60, 4),
      },
      cutaways: [{ id: 'hall-of-hundred-hearths', name: { en: 'Hall of a Hundred Hearths (cutaway)', zh: '百炉厅（剖面）' }, build: buildHall }],
    };
  },
};

function buildHall(ctx) {
  const g = ctx.root, b = new Batch(), W = 100, D = 38, Hh = 24;
  const stone = tri('stone', { color: 0x5a544f, scale: 6, snow: false }), floor = tri('cobble', { color: 0x4a4642, scale: 6, snow: false }), wood = tri('wood', { color: 0x5a4330, scale: 3, snow: false });
  b.box(floor, 0, -0.5, 0, W + 6, 0.5, D + 6);
  b.box(stone, 0, 0, -D / 2, W, Hh, 1.4); b.box(stone, -W / 2, 0, 0, 1.4, Hh, D); b.box(stone, W / 2, 0, 0, 1.4, Hh, D);
  for (let i = -8; i <= 8; i++) b.box(wood, i * 6, Hh - 0.6, 0, 0.8, 0.8, D);
  b.box(wood, 0, Hh + 1, 0, W, 0.8, 0.8);
  // hearths: a long row of great fireplaces in the back wall, many more in the end walls
  const fp = [];
  for (let i = -8; i <= 8; i++) { const x = i * 5.6; b.box(stone, x, 0, -D / 2 + 1.6, 4.4, 6.4, 2.2); b.box(flat(0x0b0807), x, 0.3, -D / 2 + 2.8, 2.6, 4.2, 0.3); fp.push([x, 1.4, -D / 2 + 3.2]); }
  for (const s of [-1, 1]) for (let i = -3; i <= 3; i++) { b.box(stone, s * (W / 2 - 1.4), 0, i * 5, 2.2, 6, 3.6); }
  for (let i = -3; i <= 3; i++) for (const s of [-1, 1]) b.cyl(stone, i * 14, 0, s * 9, 1.1, Hh - 1, { top: 0.85, seg: 10 });
  for (let k = -2; k <= 2; k++) b.box(wood, k * 14, 0, 0, 10, 0.4, 1.4);
  g.add(b.build({}));
  const fire = K.fires(fp, { size: 8, light: 4, intensity: 80 }); g.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
  for (const x of [-30, 0, 30]) { const l = new THREE.PointLight(0xffb070, 260, 90, 1.5); l.position.set(x, 14, 4); g.add(l); }
  return { center: [0, 6, 0], hero: { pos: [-30, 20, 60], target: [0, 6, 0] }, minDistance: 10, maxDistance: 110 };
}
