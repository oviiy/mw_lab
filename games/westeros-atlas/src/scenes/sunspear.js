// Sunspear - seat of House Martell. Book anchors: coastal promontory with sea on three sides and the Shadow City on the fourth,
// the Sandship (dun, a stone dromond), the slender Spear Tower topped with a gilded spear, the domed Tower of the Sun (gold and
// leaded-glass dome, twin high seats), the Old Palace complex, the maze-like Shadow City with Winding Walls and the Threefold Gate,
// and the Water Gardens a few leagues up the coast (drawn far too close here). Plans and proportions are interpretation.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

// ---- helpers ----------------------------------------------------------------------------------------------------
const _c = new THREE.Color(), _c2 = new THREE.Color(), _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _p = new THREE.Vector3(), _d = new THREE.Vector3(), _s3 = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0), _one = new THREE.Vector3(1, 1, 1);
const jit = (hex, r, dh = 0.014, ds = 0.05, dl = 0.05) => { const h = {}; _c.set(hex).getHSL(h); return _c.setHSL((h.h + r.range(-dh, dh) + 1) % 1, K.clamp(h.s + r.range(-ds, ds), 0, 1), K.clamp(h.l + r.range(-dl, dl), 0, 1)).getHex(); };
const mix = (a, b, t) => _c.set(a).lerp(_c2.set(b), t).getHex();
function portal(b, mat, x, y, z, ry, W, Hh, D, aw, ah, color) {
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, Hh); sh.lineTo(-W / 2, Hh); sh.closePath();
  const r = aw / 2, hole = new THREE.Path(); hole.moveTo(-r, 0); hole.lineTo(-r, ah - r); hole.absarc(0, ah - r, r, Math.PI, 0, true); hole.lineTo(r, 0); hole.closePath(); sh.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(sh, { depth: D, bevelEnabled: false, curveSegments: 8 }); g.translate(0, 0, -D / 2);
  _e.set(0, ry, 0); _q.setFromEuler(_e); _m4.compose(_v.set(x, y, z), _q, _one); b.addGeometry(mat, g, _m4, color); g.dispose();
}
function parapet(b, mat, x, y, z, w, d, ry, t, h, color) {
  const c = Math.cos(ry), s = Math.sin(ry), put = (ox, oz, ww, dd) => b.box(mat, x + ox * c + oz * s, y, z - ox * s + oz * c, ww, h, dd, ry, color);
  put(0, -d / 2 + t / 2, w, t); put(0, d / 2 - t / 2, w, t); put(-w / 2 + t / 2, 0, t, d - 2 * t); put(w / 2 - t / 2, 0, t, d - 2 * t);
}
function limb(b, mat, a, c, r0, r1, col, seg = 10) {
  _d.set(c[0] - a[0], c[1] - a[1], c[2] - a[2]); const L = _d.length(); if (L < 1e-3) return;
  const g = new THREE.CylinderGeometry(r1, r0, L, seg, 1, false); g.translate(0, L / 2, 0);
  _q.setFromUnitVectors(_up, _d.normalize()); _m4.compose(_p.set(a[0], a[1], a[2]), _q, _one); b.addGeometry(mat, g, _m4, col); g.dispose();
}
function blob(b, mat, c, to, rl, rw, rp, col, seg = 12) {
  _d.set(to[0] - c[0], to[1] - c[1], to[2] - c[2]).normalize();
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg >> 1)); _q.setFromUnitVectors(_up, _d); _m4.compose(_p.set(c[0], c[1], c[2]), _q, _s3.set(rw, rl, rp)); b.addGeometry(mat, g, _m4, col); g.dispose();
}
function palm(b, wood, leaf, x, y, z, k, r) {
  const g = jit(0x5f9040, r, 0.03, 0.08, 0.05); b.cyl(wood, x, y, z, 0.28 * k, 6.6 * k, { top: 0.7, seg: 6, color: 0x9b8058 });
  for (let i = 0; i < 8; i++) { const a = i * 0.785 + r() * 0.3; b.box(leaf, x + Math.cos(a) * 1.4 * k, y + 6.5 * k, z + Math.sin(a) * 1.4 * k, 3.3 * k, 0.1, 0.9 * k, -a, i % 2 ? g : mix(g, 0x3a6a2c, 0.5), 0, -0.45); }
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(14);
    const PEN = [30, 0]; // peninsula centre
    const heightAt = (x, z) => {
      const dp = Math.hypot(x - PEN[0], (z - PEN[1]) * 1.15);
      const pen = 1 - K.smoothstep(66, 92, dp);
      const main = K.smoothstep(-10, 40, -x) * (1 - K.smoothstep(150, 200, Math.abs(z)));
      const land = Math.max(pen, main, K.smoothstep(150, 230, -x));
      let h = -6 + land * 8.4;
      h += (K.fbm(x * 0.02, z * 0.02, 3, 3) - 0.5) * 3.2 * land;
      h += K.smoothstep(150, 420, -x) * (K.fbm(x * 0.01, z * 0.01, 3, 6) * 46);
      h += pen * 2.5 * (1 - K.smoothstep(0, 60, dp)); // palace rise
      return h;
    };
    const H = heightAt, wgx = -170, wgz = -130;
    // ---- terrain: pale dune sand rippling to ochre, wet-sand and salt-white shore, red-rock strata inland, green oasis round the Water Gardens
    const T = { a: new THREE.Color(0xe9d6a6), b: new THREE.Color(0xcf9f66), c2: new THREE.Color(0xdcc690), wet: new THREE.Color(0xc9b585), salt: new THREE.Color(0xf4ecd2), red: new THREE.Color(0xb2663f), green: new THREE.Color(0x7a9a4a), scrub: new THREE.Color(0x938e52) }, c = new THREE.Color();
    root.add(K.terrain({ size: 1250, seg: q.seg(190), heightAt, kind: 'sand', scale: 16, colorAt: (x, z, h, s) => {
      const n1 = K.fbm(x * 0.012, z * 0.012, 2, 9), n2 = K.fbm(x * 0.05, z * 0.05, 2, 4);
      c.copy(T.a).lerp(T.b, K.clamp(n1 * 1.3 - 0.35 + s * 3, 0, 0.85)); c.lerp(T.c2, K.clamp((n2 - 0.5) * 2, 0, 0.5));
      c.lerp(T.scrub, K.clamp((n2 - 0.6) * 3, 0, 0.35) * K.smoothstep(1.5, 4, h));
      if (h > 10) c.lerp(T.red, K.clamp((h - 10) / 22 + Math.sin(h * 1.1 + n1 * 6) * 0.08, 0, 0.85));
      if (h < 1.6) c.lerp(T.wet, K.smoothstep(1.6, 0.4, h) * 0.55); if (h < 0.5) c.lerp(T.salt, K.smoothstep(0.5, -0.4, h) * 0.65);
      c.lerp(T.green, K.smoothstep(64, 22, Math.hypot(x - wgx, z - wgz)) * 0.8);
      return c; } }));
    const wat = K.water({ w: 1100, d: 800, seg: q.seg(150), level: 0, heightAt, deep: 0x0b628a, shallow: 0x58c4bc, foam: 0xfdf6e2, opacity: 0.92, choppy: 0.35, speed: 0.55, center: [200, 0] });
    root.add(wat); ctx.registerWater(wat);

    const sandM = tri('stone', { color: 0xffffff, scale: 9, bump: 0.5, snow: false }), plaster = tri('plaster', { color: 0xffffff, scale: 6, snow: false });
    const tile = tri('tile', { color: 0xffffff, scale: 4, snow: false }), cobble = tri('cobble', { color: 0xffffff, scale: 10, bump: 0.6, snow: false }), woodM = tri('wood', { color: 0xffffff, scale: 4, snow: false });
    const marble = tri('marble', { color: 0xffffff, scale: 6, snow: false });
    const gold = flat(0xffffff, { rough: 0.42, metal: 0.3, flatShading: false }), glassM = flat(0xffffff, { rough: 0.2, metal: 0.4, transparent: true, opacity: 0.5, flatShading: false }), winG = glow(0xffc46b), lampG = glow(0xffc477, 1.4), cloth = flat(0xffffff, { rough: 1, flatShading: false });
    const b = new Batch(), gb = new Batch();
    const SD = 0xc3a36d, SDD = 0x9a7e50, SAND = [0xe8d6aa, 0xe2cfa0, 0xefe1bc, 0xdcc794], TEAL = 0x3a9d96, TERRA = 0xc0704a, GOLD = 0xe0b040;
    const palms = [];
    const road = (pts, w = 6) => b.ribbon(cobble, K.smoothPath(pts, 6), w, heightAt, 0.15, 0xcdb88c);

    // ---- Old Palace compound: sand-stone walls with battered footing, tower crowns in glazed domes, gilded spear standards along the parapet
    const walls = [[-12, -50], [30, -58], [78, -42], [88, 0], [76, 40], [30, 54], [-12, 46], [-20, 0]], NW = walls.length;
    for (let i = 0; i < NW; i++) { const seg = [walls[i], walls[(i + 1) % NW]], col = jit(0xe6d2a2, rr, 0.01, 0.05, 0.04); K.wall(b, seg, { h: 9, t: 3.2, mat: sandM, capMat: sandM, heightAt, color: col }); K.wall(b, seg, { h: 2.6, t: 4.4, mat: sandM, crenel: false, heightAt, color: SDD }); }
    walls.forEach(([x, z], i) => { const y = H(x, z), h = 14 + (i % 2) * 2, col = jit(0xe8d6aa, rr);
      K.tower(b, x, z, { r: 3.6, h, y, mat: sandM, roof: 'none', seg: 12, windows: false, color: col }); b.cyl(sandM, x, y + h, z, 4.4, 1.0, { top: 1.1, seg: 12, color: 0xf0e2bc });
      if (i % 2) { b.cyl(plaster, x, y + h + 1, z, 3.0, 1.8, { seg: 12, color: 0xf0e4c0 }); b.dome(tile, x, y + h + 2.8, z, 3.1, { seg: 12, sy: 0.95, color: i % 4 === 1 ? TEAL : TERRA }); b.cone(gold, x, y + h + 5.7, z, 0.18, 2.2, { seg: 5, color: GOLD }); }
      else { for (let k = 0; k < 8; k++) { const a = k * 0.785; b.box(sandM, x + Math.cos(a) * 4.0, y + h + 1, z + Math.sin(a) * 4.0, 1.5, 1.1, 0.7, -a + Math.PI / 2, col); } }
      b.box(winG, x + 3.5, y + h * 0.6, z, 0.14, 1.8, 0.8, 0); });
    for (let i = 0; i < NW; i++) { const A = walls[i], B = walls[(i + 1) % NW]; for (let k = 1; k < 4; k++) { const t = k / 4, x = A[0] + (B[0] - A[0]) * t, z = A[1] + (B[1] - A[1]) * t, y = H(x, z) + 10.1; limb(b, gold, [x, y, z], [x, y + 5.5, z], 0.1, 0.07, GOLD, 5); blob(b, gold, [x, y + 6.2, z], [x, y + 7.2, z], 1.0, 0.1, 0.4, GOLD, 8); } }
    // Sandship: a dun stone dromond — tiered, pointed hull in plan, castles fore and aft, domed Rhoynish towers on deck
    const sx = 34, sz = -28, sy = H(sx, sz), sa = 0.12, ca = Math.cos(sa), sn = Math.sin(sa), SH = (u, v) => [sx + u * ca + v * sn, sz - u * sn + v * ca];
    const hullPlan = (k, o = 0) => [[31 * k + o, 0], [27 * k, 5.2 * k], [12 * k, 8 * k], [-10 * k, 8.4 * k], [-26 * k, 7.2 * k], [-31 * k, 4.4 * k], [-31 * k, -4.4 * k], [-26 * k, -7.2 * k], [-10 * k, -8.4 * k], [12 * k, -8 * k], [27 * k, -5.2 * k]].map(([u, v]) => SH(u, v));
    b.extrude(sandM, hullPlan(0.86), sy - 3, 4.4, 0xa88a58); b.extrude(sandM, hullPlan(0.95), sy + 1.4, 3.2, SD); b.extrude(sandM, hullPlan(1.0), sy + 4.6, 3.0, mix(SD, 0xe6d2a2, 0.35));
    b.extrude(sandM, hullPlan(0.93), sy + 7.6, 0.8, 0xf0e2bc);
    { const bowC = SH(33, 0); b.cone(sandM, bowC[0], sy + 6.2, bowC[1], 1.8, 6, { seg: 6, color: SD }); }
    for (let i = -6; i <= 6; i++) for (const sg of [-1, 1]) { const [px, pz] = SH(i * 4.6, sg * 8.0 * (1 - Math.abs(i) * 0.012)); b.box(winG, px, sy + 5.4, pz, 0.9, 1.5, 0.2, sa + (sg > 0 ? 0 : Math.PI)); b.box(sandM, px, sy + 7.6, pz, 1.4, 1.1, 0.7, sa, 0xf0e2bc); }
    { const [fx, fz] = SH(-26, 0), [bx, bz] = SH(22, 0); b.box(sandM, fx, sy + 8.4, fz, 10, 9, 11, sa, SD); b.box(sandM, fx, sy + 17.4, fz, 11, 0.8, 12, sa, 0xf0e2bc); b.box(sandM, bx, sy + 8.4, bz, 8, 5, 8, sa, SD); parapet(b, sandM, bx, sy + 13.4, bz, 8.4, 8.4, sa, 0.6, 1.1, 0xf0e2bc); }
    for (const [u, h, r, col] of [[-12, 20, 3.2, TEAL], [3, 27, 3.4, GOLD], [15, 18, 3.0, TERRA]]) { const [tx, tz] = SH(u, 0), y = sy + 8.4;
      K.tower(b, tx, tz, { r, h, y, mat: sandM, roof: 'none', seg: 12, taper: 0.82, windows: false, color: 0xe2cf9e }); b.cyl(sandM, tx, y + h, tz, r + 0.9, 0.9, { top: 1.1, seg: 12, color: 0xf0e2bc });
      b.dome(tile, tx, y + h + 0.9, tz, r + 0.7, { seg: 12, sy: 1.0, color: col }); b.cone(gold, tx, y + h + 0.9 + r + 0.6, tz, 0.2, 2.6, { seg: 5, color: GOLD }); for (let k = 0; k < 3; k++) b.box(winG, tx + Math.cos(k * 2.1 + 0.4) * (r * 0.85), y + h * 0.55 + k * 2.2, tz + Math.sin(k * 2.1 + 0.4) * (r * 0.85), 0.16, 1.8, 0.7, 0.4 - k * 2.1); }
    // Spear Tower: tall, slender, banded, with balconies and a long gilded spear (shaft, collar, leaf-shaped head)
    const px = 56, pz = 20, py = H(px, pz);
    b.cyl(sandM, px, py - 3, pz, 4.9, 54, { top: 0.74, seg: 14, color: 0xe6d2a2 });
    for (const [yy, rw] of [[14, 5.2], [28, 4.6], [40, 4.0]]) { b.cyl(sandM, px, py + yy, pz, rw + 0.5, 0.9, { top: 1.0, seg: 14, color: 0xf0e2bc }); }
    b.cyl(sandM, px, py + 49, pz, 5.5, 1.4, { top: 1.12, seg: 14, color: 0xf0e2bc }); b.cyl(plaster, px, py + 50.4, pz, 3.9, 2.6, { top: 0.9, seg: 14, color: 0xf0e4c0 });
    for (let k = 0; k < 8; k++) { const a = k * 0.785; b.box(sandM, px + Math.cos(a) * 5.4, py + 50.4, pz + Math.sin(a) * 5.4, 1.8, 1.1, 0.8, -a + Math.PI / 2, 0xf0e2bc); }
    limb(b, gold, [px, py + 53, pz], [px, py + 74, pz], 0.5, 0.18, GOLD, 8); b.cyl(gold, px, py + 66, pz, 0.8, 0.8, { top: 0.9, seg: 8, color: 0xf0c860 });
    blob(b, gold, [px, py + 77.5, pz], [px, py + 80, pz], 3.6, 0.35, 1.3, 0xf2cc64, 10);
    for (let k = 1; k < 6; k++) { b.box(winG, px + 3.7 - k * 0.1, py + k * 8, pz, 0.15, 2.6, 0.9, 0); b.box(winG, px - 3.7 + k * 0.1, py + k * 8 + 3, pz, 0.15, 2.6, 0.9, 0); }
    // Tower of the Sun: stout drum with arched windows, colonnade skirt, ribbed gold dome over a leaded-glass dome
    const tx = 30, tz = 20, ty = H(tx, tz);
    b.cyl(sandM, tx, ty - 3, tz, 12.2, 34, { top: 0.88, seg: 24, color: 0xe6d2a2 }); b.cyl(sandM, tx, ty + 30, tz, 12.6, 3.4, { seg: 24, color: 0xf0e2bc }); b.cyl(sandM, tx, ty + 5, tz, 12.8, 1.0, { seg: 24, color: 0xf0e2bc });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; b.box(winG, tx + Math.cos(a) * 11.5, ty + 17, tz + Math.sin(a) * 11.5, 1.5, 4.8, 0.3, -a + Math.PI / 2); b.box(sandM, tx + Math.cos(a + 0.26) * 12.1, ty - 1, tz + Math.sin(a + 0.26) * 12.1, 1.3, 31, 1.3, -a, 0xf0e2bc); }
    K.columns(b, Array.from({ length: 16 }, (_, i) => [tx + Math.cos((i / 16) * 6.283) * 15, tz + Math.sin((i / 16) * 6.283) * 15]), { h: 5.4, r: 0.55, mat: marble, y: ty, color: 0xf0e8d4 }); b.cyl(sandM, tx, ty + 5.9, tz, 15.8, 0.7, { top: 0.98, seg: 24, color: 0xf0e2bc });
    b.dome(gold, tx, ty + 33.4, tz, 11.8, { seg: 24, sy: 0.9, color: 0xe6b84a }); gb.dome(glassM, tx, ty + 33.8, tz, 10.8, { seg: 18, sy: 0.85, color: 0xcfe8e0 });
    for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283; limb(b, gold, [tx + Math.cos(a) * 12.0, ty + 33.5, tz + Math.sin(a) * 12.0], [tx + Math.cos(a) * 1.2, ty + 43.6, tz + Math.sin(a) * 1.2], 0.3, 0.3, 0xc99a30, 5); }
    b.sphere(gold, tx, ty + 43.8, tz, 1.5, { seg: 10, color: 0xf0c860 }); b.cone(gold, tx, ty + 45, tz, 0.3, 4, { seg: 5, color: 0xf0c860 });
    // palace halls: sand-white blocks with parapets, roof kiosks and glazed domes; courtyards with pools and orange trees
    for (const [x, z, w, d, h, col] of [[0, -10, 26, 18, 10, 0xf0e2bc], [64, -12, 18, 22, 9, 0xe8d8ae], [60, 34, 24, 14, 8, 0xf0e2bc], [8, 28, 20, 14, 8, 0xe8d8ae], [-4, 8, 14, 12, 8, 0xf0e2bc]]) {
      const y = H(x, z); b.box(plaster, x, y - 1.2, z, w, h + 1.2, d, 0, col); b.box(plaster, x, y - 0.5, z, w + 0.4, 1.4, d + 0.4, 0, mix(col, SDD, 0.4)); b.box(plaster, x, y + h, z, w + 0.6, 0.6, d + 0.6, 0, 0xf4ead0); parapet(b, plaster, x, y + h + 0.6, z, w + 0.6, d + 0.6, 0, 0.5, 0.8, 0xf8f0da);
      b.dome(tile, x, y + h + 1.2, z, Math.min(w, d) * 0.28, { seg: 14, color: [GOLD, TEAL, TERRA][((x + z) | 0) % 3 < 0 ? 0 : Math.abs((x + z) | 0) % 3] });
      for (let k = -2; k <= 2; k++) { b.box(winG, x + k * w * 0.18, y + h * 0.5, z + d / 2 + 0.05, 1.0, 2.0, 0.12, 0); b.box(sandM, x + k * w * 0.18, y + h * 0.5 + 2.1, z + d / 2 + 0.05, 1.5, 0.3, 0.2, 0, 0xf0e2bc); b.box(winG, x + k * w * 0.18, y + h * 0.5, z - d / 2 - 0.05, 1.0, 2.0, 0.12, 0); }
    }
    for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283, x = 46 + Math.cos(a) * 9, z = 4 + Math.sin(a) * 9; b.cyl(marble, x, H(x, z), z, 0.5, 5, { top: 0.88, seg: 8, color: 0xf0e8d4 }); b.box(marble, x, H(x, z) + 5, z, 1.4, 0.5, 1.4, 0, 0xf4ecda); }
    b.cyl(marble, 46, H(46, 4), 4, 4.4, 0.9, { seg: 18, color: 0xf0e8d4 }); b.cyl(marble, 46, H(46, 4) + 0.9, 4, 3.6, 0.1, { seg: 18, color: 0x4ab0aa });
    for (const [x, z] of [[38, 12], [54, -4], [40, -4], [52, 12]]) { const y = H(x, z); b.cyl(woodM, x, y, z, 0.2, 1.8, { seg: 5, color: 0x6b4a30 }); b.sphere(cloth, x, y + 2.8, z, 1.4, { seg: 8, color: jit(0x5f8f3e, rr, 0.03) }); b.sphere(cloth, x + 0.5, y + 2.8, z + 0.4, 0.28, { seg: 5, color: 0xe08a2a }); }

    // ---- Shadow City: the Winding Walls maze and the Threefold Gate
    const wind = [0, 1, 2, 3].map((k) => Array.from({ length: 14 }, (_, i) => { const z = -86 + i * 13.2; return [-52 - k * 26 + Math.sin(z * 0.06 + k * 1.7) * 9, z]; }));
    wind.forEach((w, i) => { K.wall(b, w, { h: 6, t: 2.2, mat: sandM, capMat: sandM, heightAt, crenel: false, color: jit(0xe2cfa0, rr) }); K.wall(b, w, { h: 6.5, t: 2.7, mat: sandM, heightAt, crenel: false, sink: -5.4, color: 0xf0e2bc }); });
    const gx = -38, gyy = H(gx, 0);
    K.gatehouse(b, gx, 0, { y: gyy, ry: Math.PI / 2, mat: sandM, roofMat: tile, w: 24, d: 10, h: 14, gate: 5, wood: woodM, towerR: 4, color: 0xe6d2a2, roofColor: TERRA });
    portal(b, sandM, gx + 0.4, gyy, 0, Math.PI / 2, 22, 11, 11, 5.4, 7.6, 0xe6d2a2); b.box(winG, gx - 5.6, gyy + 8.6, 0, 0.14, 1.8, 1.0, 0);
    for (const dz of [-9, 9]) { b.box(sandM, gx - 1, H(gx, dz), dz, 8, 12, 4, 0, 0xe6d2a2); portal(b, sandM, gx - 1, H(gx, dz), dz + (dz > 0 ? 2.05 : -2.05), 0, 7, 8, 0.6, 3, 5.4, 0xf0e2bc); }
    const main = [[-190, 0], [-120, 6], [-78, -4], [-38, 0], [-8, 0], [20, 0]];
    road(main, 9); road([[-150, -80], [-110, -40], [-80, 10], [-60, 60], [-70, 100]], 5); road([[-150, 90], [-100, 50], [-70, 20]], 5);
    const nearWalls = (x, z) => wind.some((w) => K.distToPolyline(x, z, w).d < 3.8) || K.distToPolyline(x, z, main).d < 7.5;
    // houses: whitewash and sand tones, terracotta tile hips, turquoise shutters and domes, striped awnings
    const stripes = [[0xc4604a, 0xf0e4c4], [0x3a9d96, 0xf0e4c4], [0xd9a64a, 0xf0e4c4]], hr = K.rng(77);
    const spots = K.scatter({ rng: K.rng(14), count: q.dens(460), bounds: [-190, -90, -50, 90], minDist: 7, avoid: nearWalls }), placed = [];
    for (const [x, z] of spots) {
      const y = H(x, z), w = hr.range(4.2, 6.8), d = hr.range(4.2, 6.8), h = hr.range(3.6, 7.4), ry = (hr() < 0.5 ? 0 : Math.PI / 2) + hr.range(-0.12, 0.12), wc = jit(hr.pick([0xf0e6c8, 0xe9dcb8, 0xd9c79c, 0xe2cfa4, 0xd8b98a, 0xf3ead2]), hr, 0.012, 0.05, 0.04), k = hr(), c0 = Math.cos(ry), s0 = Math.sin(ry);
      b.box(plaster, x, y - 1.2, z, w, h + 1.2, d, ry, wc); b.box(plaster, x, y - 0.4, z, w + 0.3, 1.3, d + 0.3, ry, mix(wc, SDD, 0.4)); let top = h;
      if (k < 0.15) { b.box(plaster, x, y + h, z, w + 0.4, 0.5, d + 0.4, ry, 0xf4ead0); b.cyl(plaster, x, y + h + 0.5, z, Math.min(w, d) * 0.32, 0.9, { seg: 10, color: 0xf0e4c0 }); b.dome(tile, x, y + h + 1.4, z, Math.min(w, d) * 0.38, { seg: 10, sy: 0.9, color: hr() < 0.6 ? TEAL : GOLD }); top += 3; }
      else if (k < 0.37) { b.pyramid(tile, x, y + h, z, w + 0.9, Math.min(w, d) * 0.45 + 0.7, d + 0.9, ry, jit(TERRA, hr, 0.012, 0.06, 0.05)); top += 3.2; }
      else { b.box(plaster, x, y + h, z, w + 0.4, 0.5, d + 0.4, ry, 0xf4ead0); parapet(b, plaster, x, y + h + 0.5, z, w + 0.4, d + 0.4, ry, 0.35, 0.65, 0xf8f0da); top += 1.2;
        if (k < 0.55) { b.box(plaster, x + c0 * w * 0.1, y + h + 0.5, z - s0 * w * 0.1, w * 0.45, 2.1, d * 0.45, ry, jit(wc, hr)); top += 2.1; }
        else if (k < 0.7) { const [ca, cb] = stripes[hr.int(0, 2)]; b.box(cloth, x + s0 * (d / 2 + 0.7), y + h * 0.6, z + c0 * (d / 2 + 0.7), w * 0.8, 0.1, 1.9, ry, ca, -0.35, 0); } }
      b.box(woodM, x + s0 * (d / 2 + 0.05), y, z + c0 * (d / 2 + 0.05), 1.2, 2.2, 0.14, ry, 0x4a8f8a);
      for (const sd of [-1, 1]) if (hr() < 0.6) { const wx = x - s0 * sd * (d / 2 + 0.05) + c0 * sd * w * 0.2, wz = z - c0 * sd * (d / 2 + 0.05) - s0 * sd * w * 0.2; b.box(winG, wx, y + h * 0.58, wz, 0.8, 1.3, 0.12, ry); b.box(woodM, wx + c0 * 0.65, y + h * 0.58, wz - s0 * 0.65, 0.12, 1.3, 0.2, ry, 0x3a9d96); }
      placed.push({ x, z, h: top });
    }
    // ---- harbour (north side) with piers, quay, warehouses and ships
    K.pier(b, 20, 1.6, -66, { len: 36, w: 4, ry: Math.PI / 2 * 0, mat: woodM, color: 0x7c5a3a }); K.pier(b, 44, 1.6, -66, { len: 30, w: 4, ry: 0.4, mat: woodM, color: 0x7c5a3a });
    for (let i = 0; i < 5; i++) { const x = 8 + i * 12, y = H(x, -58), wc = jit(hr.pick([0xf0e6c8, 0xe2cfa4, 0xe8d6aa]), hr); b.box(plaster, x, y - 1.2, -58, 9, 6.2, 6, 0, wc); b.pyramid(tile, x, y + 5, -58, 9.8, 2.4, 6.8, 0, jit(TERRA, hr)); b.box(winG, x + 2, y + 2.4, -54.95, 1.0, 1.4, 0.12, 0); b.box(woodM, x - 1.5, y, -54.95, 1.6, 2.4, 0.14, 0, 0x3a9d96); }
    for (let i = 0; i < 12; i++) { const x = rr.range(10, 56), z = rr.range(-64, -60); b.box(woodM, x, H(x, z) + 0.4, z, rr.range(0.9, 1.4), rr.range(0.8, 1.1), rr.range(0.9, 1.4), rr() * 3, jit(0xa0784a, rr)); }
    // ---- Water Gardens (placed very near; in the books ~3 leagues up the coast)
    const wgy = H(wgx, wgz);
    b.box(marble, wgx, wgy - 1.2, wgz, 62, 2.4, 46, 0.2, 0xf4ead0); b.box(marble, wgx, wgy + 1.1, wgz, 58, 0.3, 42, 0.2, 0xe8dcbc);
    for (const [dx, dz] of [[-24, -16], [24, -16], [-24, 16], [24, 16]]) { const x = wgx + dx, z = wgz + dz;
      b.box(plaster, x, wgy + 1.4, z, 10, 8, 10, 0.2, 0xf8ecd2); b.box(plaster, x, wgy + 9.4, z, 10.8, 0.6, 10.8, 0.2, 0xfff6de); b.cyl(plaster, x, wgy + 10, z, 3.4, 1.0, { seg: 12, color: 0xf8ecd2 }); b.dome(tile, x, wgy + 11, z, 4.0, { seg: 12, sy: 0.95, color: [TEAL, TERRA, GOLD, TEAL][(dx > 0 ? 1 : 0) + (dz > 0 ? 2 : 0)] }); b.box(winG, x + 5.05, wgy + 4.4, z, 0.12, 2.2, 1.2, 0.2); }
    K.columns(b, Array.from({ length: 13 }, (_, i) => [wgx - 18 + i * 3, wgz - 20]), { h: 5, r: 0.5, mat: marble, y: wgy + 1.2, color: 0xf0e8d4 }); b.box(marble, wgx, wgy + 6.2, wgz - 20, 40, 0.6, 1.6, 0.2, 0xf4ecda);
    for (const [dx, dz, r] of [[0, 0, 9], [-14, 4, 4], [14, -4, 4]]) { b.cyl(marble, wgx + dx, wgy + 0.9, wgz + dz, r + 1.0, 0.7, { seg: 20, color: 0xf0e8d4 }); const p = K.waterPatch({ w: r * 2, d: r * 2, level: wgy + 1.55, center: [wgx + dx, wgz + dz], depth: 0.8, deep: 0x2a9aa8, shallow: 0x6fd0c8, opacity: 0.9 }); root.add(p); ctx.registerWater(p); }
    for (let i = 0; i < q.dens(70); i++) { const x = wgx + rr.range(-30, 30), z = wgz + rr.range(-22, 22); if (Math.hypot(x - wgx, z - wgz) < 17 || Math.abs(x - wgx) > 28) continue; palms.push([x, wgy + 1.3, z]); }
    for (const [x, z] of K.scatter({ rng: K.rng(6), count: q.dens(30), bounds: [-120, -140, 20, 140], minDist: 14, avoid: (x, z) => x > -50 || nearWalls(x, z) })) palms.push([x, H(x, z), z]);
    for (const [x, z] of [[40, 28], [20, 10]]) palms.push([x, H(x, z), z]);
    for (const [x, y, z] of palms) palm(b, woodM, cloth, x, y, z, rr.range(0.85, 1.2), rr);
    root.add(b.build({})); root.add(gb.build({ shadow: false }));
    { const sc = new Inst(G.sphere(5), new THREE.MeshStandardMaterial({ roughness: 1 })), rs = K.rng(7);
      for (let i = 0; i < q.dens(110); i++) { const cx = rs.range(-400, -200), cz = rs.range(-300, 300), nn = rs.int(3, 6); for (let j = 0; j < nn; j++) { const x = cx + rs.range(-6, 6), z = cz + rs.range(-6, 6), k = rs.range(0.5, 1.4); sc.add(x, H(x, z) - 0.1, z, k * 1.5, k * 0.6, k * 1.5, rs() * 3, [0x8a8a4a, 0x9a8f52, 0x7a7a42, 0x9a9458][j % 4]); } }
      root.add(sc.build()); }

    // ---- life: dhows and galleys under sail, gulls, banners, torchlight, smoke, people on the streets
    const ships = [];
    [['dhow', 50, -100], ['galley', 110, -70], ['dhow', 130, 40], ['cog', 90, 100], ['dhow', 30, -130], ['galley', 140, 120]].forEach(([tp, x, z], i) => { const s = K.ship(tp, { len: 14 + (i % 3) * 3, hull: [0x7a4a2a, 0x5a3a22][i % 2], sail: [0xf2e8cc, 0xdcae62, 0xcf7a52][i % 3], sailColor2: 0xf2e8cc }); s.position.set(x, 0.1, z); s.rotation.y = i; s.userData.b = [x, z]; ships.push(s); root.add(s); });
    ctx.onUpdate((dt, t) => ships.forEach((s, i) => { K.animateShip(s, t, i); s.position.x = s.userData.b[0] + Math.sin(t * 0.08 + i) * 5; }));
    const gulls = K.birds({ center: [60, 50, -20], radius: 100, count: q.dens(12), color: 0xf6f4ee, size: 1.2, spreadY: 14, seed: 3 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    root.add(K.banners([[px, py + 58, pz], [tx, ty + 46, tz], [78, H(78, -42) + 20, -42], [gx, gyy + 24, 0], [-12, H(-12, -50) + 20, -50], [sx, sy + 30, sz]].map(([x, y, z]) => ({ x, y: y - 8, z, w: 3.4, h: 8, color: 0xd9702a, ry: 0.6 }))));
    const fire = K.fires([[gx - 6, gyy + 6, 8], [gx - 6, gyy + 6, -8], [46, H(46, 4) + 1.2, 4], [20, 3, -62], [sx - 20, sy + 8.8, sz + 4]], { size: 7, light: q.low ? 0 : 2 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    root.add(K.smoke(placed.filter((_, i) => i % 12 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 1, p.z]), { size: 12, rise: 9, opacity: 0.15, color: 0xe6dccd }));
    root.add(K.smoke(Array.from({ length: 14 }, () => { const a = rr() * 6.28, r = rr.range(120, 280); const x = -180 + Math.cos(a) * r * 0.6, z = Math.sin(a) * r; return [x, H(x, z) + 1, z]; }), { color: 0xeed8a8, size: 60, rise: 7, opacity: 0.12, spread: 12, perStack: 4 }));
    const wk = K.walkers({ paths: [main, [[-150, -80], [-110, -40], [-80, 10], [-60, 60]], [[-60, -10], [-20, -6], [20, -2], [40, 10]], [[10, -58], [50, -62]]], heightAt, count: q.dens(44), rng: K.rng(2), colors: [0xd9702a, 0xf2e8cc, 0xa04a3a, 0x3a9d96, 0xd9a52f] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const cl = K.clouds({ y: 280, extent: 900, count: 6, opacity: 0.28, color: 0xfff2d8 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 250, center: [-20, 0, 0], minDistance: 18,
      hero: { pos: [190, 118, 150], target: [-10, 8, -5] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn:  { top: 0x4c6eae, horizon: 0xf4c49a, fog: 0xe8c8a0, fogD: 0.0012, sunC: 0xffc084, sunI: 3.2, hemiSky: 0xaab8dc, hemiGround: 0x7a6044, hemiI: 0.8 },
        day:   { top: 0x3f8ed6, horizon: 0xf8e6bc, fog: 0xf0e0b8, fogD: 0.00095, sunC: 0xffeac0, sunI: 3.8, hemiSky: 0xc4d8ee, hemiGround: 0xb8985e, hemiI: 1.05 },
        dusk:  { top: 0x3a3a78, horizon: 0xf6a468, fog: 0xdb9c72, fogD: 0.0013, sunC: 0xff9a50, sunI: 3.1, hemiSky: 0xb4aadc, hemiGround: 0x7a5c48, hemiI: 0.95 },
        night: { top: 0x0a1540, horizon: 0x2e4a78, fog: 0x213856, fogD: 0.0016, sunC: 0xa8c4f2, sunI: 1.4, hemiSky: 0x7a90c8, hemiGround: 0x30363c, hemiI: 1.35, exposure: 1.3 },
      } },
      landmarks: {
        'spear-tower': lm(px, pz, 12, 70), 'tower-of-the-sun': lm(tx, tz, 16, 52), 'sandship': lm(sx, sz, 22, 14), 'old-palace': lm(0, -10, 24, 18),
        'threefold-gate': lm(gx, 0, 12, 14), 'shadow-city': lm(-110, 20, 50, 6), 'winding-walls': lm(-78, -50, 16, 8), 'harbour': lm(30, -66, 22, 6), 'water-gardens': lm(wgx, wgz, 26, 10),
      },
    };
  },
};
