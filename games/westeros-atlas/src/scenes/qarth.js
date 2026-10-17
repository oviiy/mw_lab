// Qarth - flagship eastern port. Book anchors: three concentric walls (outer red sandstone ~30ft with animal carvings,
// middle grey granite ~40ft with scenes of war, inner black marble ~50ft with scenes of lovemaking), carved gates, the Pureborn
// in their towers, the Hall of a Thousand Thrones (tiered carved chairs, domed painted ceiling), the House of the Undying
// (low, long, serpent-coiled, black tiles, face-wall entrance), Warlock's Way (windowless houses), Temple of Memory, a harbour
// of merchant princes. Plan, layout and all proportions are interpretation (wall heights are exaggerated ~1.8x for readability).
// Polish pass: ivory/sand plaster with jewel-glazed domes and roofs (jittered per building), banded walls with string courses and
// cornices, tapered towers, turquoise sea, warm opulent light and lantern glow.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const OASES = [[-60, -250, 14], [92, -300, 12], [-150, -360, 10]];
const SHORE = 96, R_OUT = 170, R_MID = 122, R_IN = 76, ZEND = [88, 80, 72];
const wallPts = (R, zEnd, gap = 0, side = 0) => { // polyline around the landward side with a gap at the north gate
  const pts = [];
  if (side <= 0) { pts.push([-R, zEnd], [-R, 0]); for (let i = 0; i <= 24; i++) { const a = Math.PI + (i / 24) * (Math.PI / 2 - gap / R); pts.push([Math.cos(a) * R, Math.sin(a) * R]); } }
  else { for (let i = 0; i <= 24; i++) { const a = Math.PI * 1.5 + gap / R + (i / 24) * (Math.PI / 2 - gap / R); pts.push([Math.cos(a) * R, Math.sin(a) * R]); } pts.push([R, 0], [R, zEnd]); }
  return pts;
};
// jewel glaze colours (slightly dusted so they read as ceramic, not plastic)
const JEWEL = [0x2a9d8f, 0x2f62a8, 0x8a4a86, 0xd9a23a, 0xc4553f, 0x2f8f66, 0x5b45a0];
const GLAZE = [0x2a9d8f, 0x2a9d8f, 0x2f62a8, 0xd9a23a, 0x2f8f66]; // town glazes: turquoise-led, no purples (those belong to the towers)
const WALLC = [0xf0e2c2, 0xe6cda6, 0xf3ead2, 0xdfb890, 0xe8c4aa, 0xeadbbd];
const _hsl = {};
function jit(hex, r, dh = 0.012, ds = 0.07, dl = 0.05) {
  const c = new THREE.Color(hex); c.getHSL(_hsl);
  return c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, K.clamp(_hsl.s + r.range(-ds, ds), 0, 1), K.clamp(_hsl.l + r.range(-dl, dl), 0, 1));
}
const shade = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
/** split polyline segments longer than maxL so wall details follow straight runs too */
const resample = (pts, maxL) => { const o = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [ax, az] = pts[i - 1], [bx, bz] = pts[i], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / maxL)); for (let k = 1; k <= n; k++) o.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]); } return o; };
const rot = (dx, dz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return [dx * c + dz * s, -dx * s + dz * c]; };

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(77);
    const shoreZ = (x) => SHORE + K.smoothstep(185, 300, Math.abs(x)) * 105 + (K.fbm(x * 0.02, 3, 2, 5) - 0.5) * 6;
    const heightAt = (x, z) => {
      const r = Math.hypot(x, z * 0.9);
      let h = 2.2 + (K.fbm(x * 0.012, z * 0.012, 3, 8) - 0.5) * 5 * K.smoothstep(150, 260, r);
      h += K.smoothstep(200, 420, r) * (K.fbm(x * 0.008, z * 0.008, 3, 3) * 26) * (z < 60 ? 1 : 0.2);
      h += K.smoothstep(230, 330, Math.abs(x)) * 12 * (1 - K.smoothstep(120, 210, z)); // headlands (fall away into the sea)
      h += (1 - K.smoothstep(40, 110, r)) * 1.2;
      const s = z - shoreZ(x), k = K.smoothstep(-10, 14, s); // sea floor
      return h * (1 - k) - 5.5 * k;
    };
    // ---- terrain: pale dunes with ripple strata, rocky headlands, wet shore sand, lush Gehane garden
    const sandA = new THREE.Color(0xe6d8b4), sandB = new THREE.Color(0xd0ae80), grass = new THREE.Color(0x6f9a4a), rock = new THREE.Color(0x9a846a), wet = new THREE.Color(0xb7a47e), pave = new THREE.Color(0xe0cda4), c = new THREE.Color();
    const terr = K.terrain({ size: 1300, seg: q.seg(104), heightAt, kind: 'sand', scale: 16, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.01, z * 0.01, 2, 7), n2 = K.fbm(x * 0.07, z * 0.07, 2, 17);
      c.copy(sandA).lerp(sandB, K.clamp(n * 1.2 - 0.3 + s * 3, 0, 0.75)).multiplyScalar(0.94 + 0.12 * n2);
      const r = Math.hypot(x, z * 0.9); c.lerp(pave, 0.5 * (1 - K.smoothstep(150, 200, r)));
      if (h > 9) c.lerp(rock, K.clamp((h - 9) / 12, 0, 0.7) * (0.6 + 0.4 * Math.sin(h * 1.3 + n2 * 6)));
      if (h < 1.2) c.lerp(wet, 0.6 * K.clamp((1.2 - h) / 1.2, 0, 1) + 0.15);
      const gd = Math.hypot(x + 105, z - 45); if (gd < 30) c.lerp(grass, 0.75 * (1 - K.smoothstep(18, 30, gd)));
      for (const [ox, oz] of OASES) { const od = Math.hypot(x - ox, (z - oz) * 1.2); if (od < 40) c.lerp(grass, 0.45 * (1 - K.smoothstep(14, 40, od))); }
      return c; } });
    root.add(terr);
    // far skirt: a coarse continuation of the same dunes so the terrain never ends in a visible edge against the sky
    { const edge = (x, z) => 1 - K.smoothstep(560, 660, Math.max(Math.abs(x), Math.abs(z)));
      const skirt = K.terrain({ size: 4200, seg: 28, heightAt: (x, z) => heightAt(x, z) - 0.4 - 9 * edge(x, z), kind: 'sand', scale: 16, colorAt: (x, z, h, sl) => { c.copy(sandA).lerp(sandB, K.clamp(K.fbm(x * 0.004, z * 0.004, 2, 7) * 1.2 - 0.3, 0, 0.7)); if (h > 9) c.lerp(rock, 0.3); return c; } });
      skirt.receiveShadow = false; root.add(skirt); }
    const wat = K.water({ w: 1400, d: 920, seg: q.seg(118), center: [0, 400], level: 0, heightAt, deep: 0x0b507a, shallow: 0x3ea8a6, opacity: 0.92, choppy: 0.35, speed: 0.6 });
    root.add(wat); ctx.registerWater(wat);
    const farSea = K.water({ w: 3200, d: 1600, seg: 20, center: [0, 1600], level: -0.06, heightAt: () => -30, deep: 0x0b507a, shallow: 0x0b507a, opacity: 1, choppy: 0.3, speed: 0.6 }); root.add(farSea); ctx.registerWater(farSea); // open Jade Sea to the haze

    // materials
    const sandstone = tri('stone', { color: 0xc2603f, scale: 8, snow: false, bump: 0.6 }), granite = tri('stone', { color: 0x9a9ca2, scale: 8, snow: false, bump: 0.6 }), marble = tri('marble', { color: 0x4c4a58, scale: 7, snow: false, rough: 0.24 });
    const whiteM = tri('marble', { color: 0xf3ecdb, scale: 6, snow: false, rough: 0.4 }), plaster = tri('plaster', { color: 0xf2e4c2, scale: 6, snow: false });
    const tile = tri('tile', { color: 0xffffff, scale: 9, snow: false, rough: 0.78, bump: 0.5 }), glaze = tri('tile', { color: 0xffffff, scale: 4, snow: false, rough: 0.36, metal: 0.05, bump: 0.35 }), cobble = tri('cobble', { color: 0xc2ae8f, scale: 8, snow: false }), woodM = tri('wood', { color: 0x6b4d33, scale: 4, snow: false });
    const gold = flat(0xe0ad34, { rough: 0.3, metal: 0.55, flatShading: false }), winG = glow(0xffc46b), lan = glow(0xffa84a, 1.3), black = tri('slate', { color: 0x4e4c5a, scale: 4, snow: false, rough: 0.55, bump: 0.4 }), dark = flat(0x050507);
    const cloth = flat(0xffffff, { rough: 1, flatShading: false, side: THREE.DoubleSide }), reliefM = flat(0xffffff, { rough: 0.86, flatShading: true });
    const b = new Batch();
    const H = heightAt;

    // ---- three walls, with relief panels, string courses, cornices and carved gates
    const WALLS = [
      { R: R_OUT, ze: ZEND[0], h: 11, t: 6, mat: sandstone, cap: sandstone, pan: [0x8e4430, 0xe0a070, 0xa04a30], trim: 0xe2b078, base: 0x8e4630 },
      { R: R_MID, ze: ZEND[1], h: 14.5, t: 6.5, mat: granite, cap: granite, pan: [0x6a6c74, 0xd2d4d8, 0x70737a], trim: 0xd6d6d0, base: 0x6a6c72 },
      { R: R_IN, ze: ZEND[2], h: 18, t: 7, mat: marble, cap: marble, pan: [0x2a2834, 0xc8a24a, 0x2a2230], trim: 0xe0b44a, base: 0x1d1d26 },
    ];
    const GAP = 11;
    WALLS.forEach((w, wi) => {
      for (const side of [-1, 1]) K.wall(b, wallPts(w.R, w.ze, GAP, side), { h: w.h, t: w.t, mat: w.mat, capMat: w.cap, heightAt, closed: false, crenel: wi !== 2, merlon: 2.1 });
      const path = K.smoothPath([...wallPts(w.R, w.ze, GAP, -1), ...wallPts(w.R, w.ze, GAP, 1)], 4, false), pathC = resample([...wallPts(w.R, w.ze, GAP, -1), ...wallPts(w.R, w.ze, GAP, 1)], 9); // trims follow the wall's own chords
      // base batter, string course and cornice along the whole wall
      for (let i = 0; i < pathC.length - 1; i++) {
        const [x0, z0] = pathC[i], [x1, z1] = pathC[i + 1], dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz);
        if (l > 12 || l < 0.05 || (Math.abs((x0 + x1) / 2) < GAP + 6 && (z0 + z1) / 2 < 0)) continue;
        const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ry = K.headingX(dx, dz), g = Math.min(H(x0, z0), H(x1, z1));
        b.box(w.mat, mx, g - 2, mz, l + 0.5, 4.2, w.t + 1.8, ry, shade(w.base, 1));
        const tm = wi === 2 ? gold : w.mat, tc = wi === 2 ? 0xffffff : w.trim;
        b.box(tm, mx, g + w.h * 0.45, mz, l + 0.4, 0.7, w.t + 0.5, ry, tc);
        b.box(tm, mx, Math.max(H(x0, z0), H(x1, z1)) + w.h - 1.1, mz, l + 0.4, 1.0, w.t + 1.2, ry, tc);
      }
      // carved frieze: a continuous recessed relief band on both faces; on the outer face it is populated with figures -
      // beasts on the sandstone, warriors on the granite, lovers on the black marble (shadowless: it is surface detail)
      for (let i = 0; i < pathC.length - 1; i++) {
        const [x0, z0] = pathC[i], [x1, z1] = pathC[i + 1], x = (x0 + x1) / 2, z = (z0 + z1) / 2; if (Math.abs(x) < GAP + 4 && z < 0) continue;
        const dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz) || 1; if (l > 12) continue;
        const nx = dz / l, nz = -dx / l, ang = Math.atan2(-dz, dx), y = H(x, z) + w.h * 0.13, bh = w.h * 0.27, outS = (x * nx + z * nz) >= 0 ? 1 : -1;
        for (const out of [1, -1]) { const px = x + nx * out * (w.t / 2 + 0.06), pz = z + nz * out * (w.t / 2 + 0.06); b.box(reliefM, px, y, pz, l + 0.05, bh, 0.3, ang, w.pan[0]); }
        for (const fu of [0]) {
        const fx = x + dx * fu + nx * outS * (w.t / 2 + 0.3), fz = z + dz * fu + nz * outS * (w.t / 2 + 0.3), tc = w.pan[1], c2 = Math.cos(ang), s2 = Math.sin(ang), T = (u) => [fx + c2 * u, fz - s2 * u];
        if (wi === 0) { b.box(reliefM, fx, y + bh * 0.3, fz, 2.2, bh * 0.32, 0.3, ang, tc); const [hx2, hz2] = T(1.25); b.box(reliefM, hx2, y + bh * 0.5, hz2, 0.7, bh * 0.3, 0.3, ang, tc); for (const u of [-0.8, 0.8]) { const [lx2, lz2] = T(u); b.box(reliefM, lx2, y + bh * 0.08, lz2, 0.3, bh * 0.24, 0.3, ang, tc); } }
        else if (wi === 1) { b.box(reliefM, fx, y + bh * 0.08, fz, 0.6, bh * 0.78, 0.3, ang, tc); const [sx2, sz2] = T(0.6); b.box(reliefM, sx2, y + bh * 0.05, sz2, 0.14, bh * 0.92, 0.3, ang, tc, 0, 0.25); const [hx2, hz2] = T(-0.7); b.box(reliefM, hx2, y + bh * 0.3, hz2, 0.7, bh * 0.4, 0.32, ang, tc); }
        else { for (const sd of [-1, 1]) { const [lx2, lz2] = T(sd * 0.42); b.box(reliefM, lx2, y + bh * 0.08, lz2, 0.5, bh * 0.78, 0.3, ang, tc, 0, -sd * 0.18); } }
      } }
      // wall towers: tapered shafts with a gilded cap ring
      for (let i = 4; i < path.length - 4; i += 12) { const [x, z] = path[i]; if (Math.abs(x) < 22 && z < 0) continue;
        K.tower(b, x, z, { r: 4.4, h: w.h + 6, y: H(x, z), mat: w.mat, roofMat: w.mat, roof: 'flat', seg: 12, windows: false, taper: 0.82 });
        b.cyl(w.mat, x, H(x, z) + w.h * 0.62, z, 4.4 * 0.9 + 0.5, 1.0, { seg: 12, color: w.trim }); b.sphere(lan, x, H(x, z) + w.h + 8.2, z, 0.6, { seg: 5 }); }
      // gate of carved pillars at the north
      const gz = -w.R, gy = H(0, gz);
      for (const s of [-1, 1]) {
        b.cyl(w.mat, s * 9.5, gy - 2, gz, 3.4, w.h + 12, { top: 0.9, seg: 14, color: w.trim === 0xe0b44a ? 0x40414c : 0xffffff });
        for (let k = 0; k < 4; k++) b.cyl(w.mat, s * 9.5, gy + 2 + k * ((w.h + 6) / 4), gz, 3.5 - k * 0.1, 0.9, { seg: 14, color: w.trim }); // carved bands
        for (let k = 0; k < 5; k++) b.box(flat(0xffffff), s * 9.5 + Math.cos(k * 1.3) * 3.55, gy + 3.4 + k * (w.h / 5), gz + Math.sin(k * 1.3) * 3.55, 1.5, 2.4, 1.1, k, w.pan[k % 3]); // carved figures
        b.cyl(whiteM, s * 9.5, gy + w.h + 10, gz, 3.7, 0.9, { seg: 14, color: w.trim }); b.cyl(gold, s * 9.5, gy + w.h + 10.9, gz, 1.5, 1.6, { top: 0.4, seg: 10 }); b.sphere(gold, s * 9.5, gy + w.h + 12.3, gz, 0.8, { seg: 8 });
        b.box(w.mat, s * 14.5, gy - 2, gz, 5, w.h + 2, w.t + 2);
      }
      b.box(w.mat, 0, gy + w.h - 2, gz, 24, 6, w.t + 1.5); b.box(w.mat, 0, gy + w.h + 4, gz, 17, 2.6, w.t + 0.8, 0, w.trim); b.box(gold, 0, gy + w.h + 6.6, gz, 18, 0.7, w.t + 1.6);
      for (let k = -3; k <= 3; k++) { b.cyl(w.mat, k * 2.4, gy + w.h + 7.3, gz, 0.7, 1.2, { seg: 8, color: w.trim }); b.sphere(gold, k * 2.4, gy + w.h + 8.5, gz, 0.6, { seg: 6 }); }
      for (const s of [-1, 1]) b.sphere(lan, s * 9.5, gy + w.h + 13.2, gz, 0.9, { seg: 6 });
      b.box(dark, 0, gy, gz, 11, w.h * 0.62, w.t + 1.6); b.box(whiteM, 0, gy + w.h * 0.62, gz, 12.4, 0.8, w.t + 2, 0, w.trim); // dark archway with lintel
    });
    // main road & ring roads
    const mainRoad = [[0, -R_OUT - 24], [0, -R_OUT], [2, -R_MID], [0, -R_IN], [-3, -30], [0, 10], [4, 50], [0, SHORE - 4]];
    b.ribbon(cobble, K.smoothPath(mainRoad, 8), 9, heightAt, 0.15, 0xe6d6b4);
    const ring = (R, a0, a1) => Array.from({ length: 20 }, (_, i) => { const a = a0 + (a1 - a0) * i / 19; return [Math.cos(a) * R, Math.sin(a) * R * 0.98 + 0]; });
    const roads = [ring(99, Math.PI * 0.98, Math.PI * 2.02), ring(146, Math.PI * 0.98, Math.PI * 2.02), [[-R_OUT + 8, 30], [-100, 40], [-40, 55], [0, 60]], [[R_OUT - 8, 30], [100, 40], [40, 55], [0, 60]]];
    roads.forEach((r) => b.ribbon(cobble, r, 5.5, heightAt, 0.14, 0xdacbab));
    const nearRoad = (x, z) => [mainRoad, ...roads].some((r) => K.distToPolyline(x, z, r) < (r === mainRoad ? 8 : 5));

    // ---- Hall of a Thousand Thrones (inner city): marble drum, great glazed dome, colonnade
    const hx = -8, hz = -30, hy = H(hx, hz);
    b.box(whiteM, hx, hy - 1, hz, 52, 3, 52); b.box(whiteM, hx, hy + 2, hz, 46, 1.2, 46); b.box(whiteM, hx, hy + 0.8, hz, 50, 1.2, 50, 0, 0xe4dcc6);
    b.cyl(whiteM, hx, hy + 3, hz, 20, 18, { top: 1.0, seg: 28 });
    b.cyl(whiteM, hx, hy + 21, hz, 21.5, 1.6, { seg: 28 });
    b.dome(glaze, hx, hy + 22.6, hz, 20.5, { seg: 32, sy: 0.85, color: 0x2f62a8 });
    for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283; b.box(gold, hx + Math.cos(a) * 12, hy + 22.6 + 14.2, hz + Math.sin(a) * 12, 0.5, 1.2, 0.5, -a, 0xe0ad34); } // gilded rib hints
    b.cyl(gold, hx, hy + 22.6 + 17.2, hz, 3.0, 0.7, { seg: 10 }); b.sphere(gold, hx, hy + 22.6 + 17.4, hz, 1.8, { seg: 10 }); b.cyl(gold, hx, hy + 22.6 + 19, hz, 0.4, 5, { seg: 6 });
    for (let i = 0; i < 20; i++) { const a = (i / 20) * 6.283; K.columns(b, [[hx + Math.cos(a) * 23, hz + Math.sin(a) * 23]], { h: 7, r: 0.8, mat: whiteM, y: hy + 3 }); }
    b.cyl(whiteM, hx, hy + 10.3, hz, 24.2, 0.7, { seg: 28 });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; b.box(winG, hx + Math.cos(a) * 20.1, hy + 10, hz + Math.sin(a) * 20.1, 1.6, 6, 0.4, -a + Math.PI / 2); }
    for (let i = 0; i < 6; i++) b.box(whiteM, hx, hy + 3 + i * 0.0, hz + 27 + (5 - i) * 0.9 - 4.5, 12 + (5 - i) * 0.0 + 2, 0.45 * (i + 1) * 0 + 0.4 * (i + 1), 1.0, 0, 0xe8e0cc); // broad stair
    // ---- Pureborn towers: cluster of tall slender towers with jewel-glazed caps and gilded bands
    const pb = [[34, -34, 46, 2], [46, -18, 38, 4], [28, -54, 34, 0], [52, -44, 42, 3], [14, -58, 30, 1], [-30, -62, 28, 5]];
    pb.forEach(([x, z, h, ci], i) => { const col = JEWEL[ci];
      K.tower(b, x, z, { r: 4.2, h, y: H(x, z), mat: whiteM, roofMat: glaze, roof: i % 2 ? 'dome' : 'spire', roofH: h * 0.22, roofColor: col, seg: 14, glowMat: winG, taper: 0.8, crenel: false });
      for (const k of [0.45, 0.6, 0.78]) b.cyl(gold, x, H(x, z) + h * k, z, 4.2 * (1 - 0.2 * k) + 0.45, 0.7, { seg: 14 });
      b.cyl(whiteM, x, H(x, z) - 1, z, 6, 4, { top: 0.78, seg: 14, color: 0xe8dfc8 }); b.sphere(gold, x, H(x, z) + h + h * 0.22 + (i % 2 ? 4.4 : 1.2) + 0.4, z, 0.7, { seg: 6 }); });
    b.box(whiteM, 40, H(40, -34) - 1, -33, 22, 17, 12, 0.4, 0xe9dfc6); b.box(gold, 40, H(40, -34) + 15.4, -33, 23, 0.7, 13, 0.4); for (let k = -4; k <= 4; k++) { const [wx, wz] = rot(k * 2.2, 6.06, 0.4); b.box(winG, 40 + wx, H(40, -34) + 8, -33 + wz, 1.0, 3, 0.12, 0.4); }
    // ---- Temple of Memory
    const tx = -40, tz = 6, ty = H(tx, tz);
    b.box(whiteM, tx, ty, tz, 24, 2, 20); b.box(plaster, tx, ty + 2, tz, 16, 10, 12); b.dome(glaze, tx, ty + 12, tz, 7, { seg: 18, sy: 0.9, color: 0xc4553f }); b.sphere(gold, tx, ty + 12 + 6.3, tz, 0.7, { seg: 6 });
    for (let i = -3; i <= 3; i++) K.columns(b, [[tx + i * 3.4, tz + 9]], { h: 8, r: 0.7, mat: whiteM, y: ty + 2 });
    b.box(whiteM, tx, ty + 10, tz + 9, 24, 0.7, 3.2);
    // ---- Xaro's palace & merchant towers (between inner and middle walls)
    const xp = [-96, -52], xy = H(xp[0], xp[1]);
    b.box(plaster, xp[0], xy, xp[1], 34, 9, 26, 0.2, 0xf4e6c8); b.box(plaster, xp[0] + 8, xy + 9, xp[1] - 3, 16, 7, 14, 0.2, 0xe8cfa0); b.box(whiteM, xp[0], xy + 8.4, xp[1], 35, 0.9, 27, 0.2, 0xe8ddc4);
    b.dome(glaze, xp[0] - 8, xy + 9, xp[1] + 2, 6, { seg: 16, color: 0x2a9d8f }); b.sphere(gold, xp[0] - 8, xy + 15, xp[1] + 2, 0.6, { seg: 6 });
    b.dome(gold, xp[0] + 8, xy + 16, xp[1] - 3, 5, { seg: 14 }); b.box(winG, xp[0] + 1, xy + 4, xp[1] + 13.1, 18, 2.2, 0.15, 0.2);
    for (let i = 0; i < 9; i++) { const x = xp[0] + 20 + (i % 3) * 7, z = xp[1] + 10 + ((i / 3) | 0) * 6; K.house(b, x, H(x, z), z, { w: 6, d: 5, h: 4, style: 'flat', wallMat: plaster, roofMat: tile, wall: jit(WALLC[i % 6], rr), roof: i % 3 === 0 ? JEWEL[i % 7] : [0xc78a5e, 0xd6a878, 0xb87a56][i % 3] }); }
    const mt = [[90, -60], [104, -34], [-108, -12], [96, -86], [-70, -96], [-118, -80], [-84, 24]];
    mt.forEach(([x, z], i) => { const h = 36 + (i % 4) * 7, col = JEWEL[(i * 3 + 1) % 7];
      K.tower(b, x, z, { r: 5.4, h, y: H(x, z), mat: plaster, roofMat: glaze, roof: i % 3 ? 'dome' : 'spire', roofH: h * 0.2, roofColor: col, seg: 14, glowMat: winG, taper: 0.78, color: jit(i % 2 ? 0xf2dcae : 0xe6bfa4, rr), crenel: false });
      for (let k = 1; k < 4; k++) b.cyl(flat(0xffffff), x, H(x, z) + h * k / 4, z, 5.4 * (1 - 0.22 * k / 4) + 0.35, 0.8, { seg: 14, color: k === 2 ? 0xe0ad34 : col });
      b.cyl(plaster, x, H(x, z) - 1, z, 7.4, 4, { top: 0.8, seg: 14, color: 0xe2cfa4 }); });
    // ---- House of the Undying: low serpentine palace, black tiles, face-wall entrance, black trees
    // ---- House of the Undying: one long, low, windowless body of grey stone coiling like a serpent; black slate roof with a
    // spine ridge; the only opening is a tall oval door in a carved stone face at the serpent's head; black-barked trees around.
    const greyS = granite; // the Undying's grey stone shares the granite material (tinted)
    const coil = []; for (let i = 0; i <= 26; i++) { const t = i / 26, a = 0.4 + t * 7.4, rad = 18.5 - t * 13.5; coil.push([144 + Math.cos(a) * rad, 14 + Math.sin(a) * rad * 0.9]); }
    const hu = K.smoothPath(coil, 3, false);
    for (let i = 0; i < hu.length - 1; i++) {
      const [x0, z0] = hu[i], [x1, z1] = hu[i + 1], mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, l = Math.hypot(x1 - x0, z1 - z0) + 1.6, ry = K.headingX(x1 - x0, z1 - z0), y = H(mx, mz), t = i / hu.length;
      const wH = 5.2 - t * 1.8, wW = 5.6 - t * 2.4; // tapers toward the tail
      b.box(greyS, mx, y - 1.5, mz, l, wH + 1.5, wW, ry, jit(0x9a96a0, rr, 0.005, 0.02, 0.03));
      b.box(greyS, mx, y + wH - 0.2, mz, l, 0.5, wW + 0.8, ry, 0x7e7a86); // eave
      b.prism(black, mx, y + wH + 0.3, mz, l, 2.0 - t * 0.6, wW + 0.6, ry, 0x55525e); // black slate roof
      if (i % 3 === 0) b.box(black, mx, y + wH + 2.1 - t * 0.6, mz, 1.2, 0.6, 1.0, ry, 0x3a3846); // spine scale
    }
    const [hx0, hz0] = hu[0], [hx1, hz1] = hu[1], headRy = K.headingX(hx1 - hx0, hz1 - hz0), fx = hx0 - (hx1 - hx0) * 0.5, fz = hz0 - (hz1 - hz0) * 0.5, fy = H(fx, fz);
    { const L = (lx, lz) => rot(lx, lz, headRy), P2 = (lx, lz) => { const [ox, oz] = L(lx, lz); return [fx + ox, fz + oz]; };
      // the face: a broad stone mask set across the head, the oval door as its mouth
      const [ax, az] = P2(-0.6, 0); b.box(greyS, ax, fy - 1, az, 2.2, 13.5, 13, headRy, 0x8e8a94);
      const [ex, ez] = P2(-1.75, 0); b._add(dark, G.sphere(12), ex, fy - 0.4, ez, 0.5, 4.8, 2.3, headRy, 0xffffff); // tall oval door
      for (const sd of [-1, 1]) { const [px, pz] = P2(-1.6, sd * 3.0); b.sphere(dark, px, fy + 8.6, pz, 0.9, { seg: 8, sy: 0.7 }); const [bx2, bz2] = P2(-1.9, sd * 3.0); b.box(greyS, bx2, fy + 9.6, bz2, 0.9, 0.8, 3.6, headRy, 0x7a7680); } // eyes + brow
      const [nx2, nz2] = P2(-2.0, 0); b.box(greyS, nx2, fy + 5.4, nz2, 1.4, 2.8, 1.4, headRy, 0x8a8690);
      const [cx2, cz2] = P2(-0.6, 0); b.box(black, cx2, fy + 12.5, cz2, 2.6, 1.0, 13.6, headRy, 0x3a3846); }
    grove(b, K.scatter({ rng: K.rng(61), count: 30, bounds: [118, -16, 176, 46], minDist: 5.5, avoid: (x, z) => hu.some(([a2, c2]) => Math.hypot(x - a2, z - c2) < 7) || Math.hypot(x - fx, z - fz) < 9 || Math.hypot(x, z) < R_MID + 6 || Math.hypot(x, z) > R_OUT - 7 }), H, 'black');
    // Warlock's Way: a street of blank-walled houses (no windows), pale blue-grey stucco
    for (let i = 0; i < 7; i++) { const x = 82 + i * 6, z = 4 + (i % 2) * 14 - 8, y = H(x, z); b.box(plaster, x, y - 1, z, 5.5, 7.5, 7, 0.1, jit(0xb4bed2, rr)); b.box(black, x, y + 6.5, z, 6, 0.6, 7.5, 0.1); }
    // ---- bazaar: striped awnings & stalls (east, between mid & outer walls)
    const bz = [100, 46];
    const awn = [0xc4553f, 0xe0ad34, 0x2a9d8f, 0x8a4a86, 0x2f62a8, 0xefe4c8];
    for (let i = 0; i < 28; i++) { const x = bz[0] + ((i % 7) - 3) * 8, z = bz[1] + (((i / 7) | 0) - 1.5) * 9, y = H(x, z); b.box(woodM, x, y, z, 5, 2.4, 0.4); b.box(cloth, x, y + 2.7, z, 6, 0.35, 5, 0.1 * (i % 3), jit(awn[i % 6], rr)); b.box(cloth, x, y + 2.75, z, 6.05, 0.3, 1.4, 0.1 * (i % 3), 0xefe4c8); for (const s of [-1, 1]) b.cyl(woodM, x + s * 2.8, y, z + 2, 0.15, 2.8, { seg: 5 }); }
    // ---- Gardens of Gehane (west): hedges, pond, palms
    const gg = [-105, 45];
    grove(b, K.scatter({ rng: K.rng(62), count: q.dens(42), bounds: [gg[0] - 22, gg[1] - 20, gg[0] + 22, gg[1] + 20], minDist: 5, avoid: (x, z) => Math.hypot(x - gg[0], z - gg[1]) < 8 }), H, 'palm');
    grove(b, K.scatter({ rng: K.rng(63), count: q.dens(40), bounds: [gg[0] - 22, gg[1] - 20, gg[0] + 22, gg[1] + 20], minDist: 4, avoid: (x, z) => Math.hypot(x - gg[0], z - gg[1]) < 8 }), H, 'bush');
    const pond = K.waterPatch({ w: 14, d: 14, level: H(gg[0], gg[1]) - 0.4, center: gg, depth: 1.5, deep: 0x1d7a86, shallow: 0x58c0b8, opacity: 0.92 }); root.add(pond); ctx.registerWater(pond);
    b.cyl(whiteM, gg[0], H(gg[0], gg[1]) - 1, gg[1], 8.2, 1.0, { seg: 20 });
    // ---- harbour: stone quay, piers, warehouses
    b.box(whiteM, 0, 0.3, SHORE + 2, 330, 2.4, 6, 0, 0xd8cdb0); b.box(whiteM, 0, 2.6, SHORE + 4.6, 330, 0.5, 1.0, 0, 0xe9e0c8);
    for (let i = -6; i <= 6; i++) if (i % 2 === 0) { K.pier(b, i * 22 + 5, 1.6, SHORE + 4, { len: 34, w: 4.5, ry: -Math.PI / 2, mat: woodM }); b.sphere(lan, i * 22 + 5, 3.4, SHORE + 4.4, 0.45, { seg: 5 }); }
    for (let i = -7; i <= 7; i++) K.house(b, i * 20 + 2, H(i * 20 + 2, SHORE - 14), SHORE - 14, { w: 11, d: 7, h: 5, style: 'hip', wallMat: plaster, roofMat: tile, wall: jit(WALLC[(i + 7) % 6], rr), roof: i % 3 === 0 ? jit(new THREE.Color(JEWEL[(i + 7) % 7]).lerp(new THREE.Color(0xd8cfb8), 0.25), rr) : jit([0xc78a5e, 0xd6a878, 0xb87a56][(i + 7) % 3], rr), glowMat: winG });

    // ---- the town fill: ivory/sand plaster, jewel-glazed domes and roofs on ~1/3 of the buildings
    const keepOut = [[hx, hz, 34], [-40, 6, 20], [-96, -52, 30], [146, 14, 34], [100, 46, 30], [-105, 45, 30], [45, -35, 28], [-88, -6, 14]];
    const pts = K.scatter({ rng: K.rng(33), count: q.dens(362), bounds: [-166, -166, 166, 86], minDist: 9.0,
      avoid: (x, z) => nearRoad(x, z) || keepOut.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr) || (Math.hypot(x, z) > R_OUT - 8 && z < 20) || Math.abs(x) > R_OUT - 8 || z > 78 || (Math.hypot(x, z) > R_IN - 8 && Math.hypot(x, z) < R_IN + 8) || (Math.hypot(x, z) > R_MID - 8 && Math.hypot(x, z) < R_MID + 8) });
    const placed = [];
    for (const [x, z] of pts) {
      const w = rr.range(4.5, 8), d = rr.range(4.5, 8) * rr.range(1, 1.35), tall = rr() < 0.16, h = tall ? rr.range(8, 13) : rr.range(4, 8), y = H(x, z), ry = Math.atan2(z, x) + Math.PI / 2 + rr.range(-0.08, 0.08);
      const wc = jit(rr.pick(WALLC), rr, 0.012, 0.06, 0.05), sn = Math.sin(ry), cs = Math.cos(ry), kind = rr(), jc = jit(new THREE.Color(rr.pick(GLAZE)).lerp(new THREE.Color(0xd8cfb8), 0.15), rr, 0.01, 0.05, 0.04);
      b.box(plaster, x, y - 1.2, z, w, h + 1.2, d, ry, wc); // (ground contact is darkened by the material's AO term)
      b.box(plaster, x, y + h - 0.45, z, w + 0.7, 0.9, d + 0.7, ry, jit(0xf8f0dc, rr, 0.01, 0.04, 0.03)); // cornice
      const TERRA = [0xc78a5e, 0xd6a878, 0xb87a56, 0xdcc49a];
      if (kind < 0.07) { b.cyl(plaster, x, y + h + 0.4, z, Math.min(w, d) * 0.42, 0.9, { seg: 10, color: wc }); b.dome(glaze, x, y + h + 1.3, z, Math.min(w, d) * 0.44, { seg: 10, sy: 0.95, color: jc }); b.sphere(gold, x, y + h + 1.3 + Math.min(w, d) * 0.43, z, 0.32, { seg: 5 }); }
      else if (tall) { const gl = rr() < 0.3; b.pyramid(gl ? glaze : tile, x, y + h + 0.4, z, w + 0.8, Math.min(w, d) * 0.6 + 0.8, d + 0.8, ry, gl ? jc : jit(rr.pick(TERRA), rr, 0.015, 0.08, 0.05)); }
      else if (kind < 0.3) { b.pyramid(tile, x, y + h + 0.4, z, w + 0.8, Math.min(w, d) * 0.45 + 0.6, d + 0.8, ry, jit(rr.pick(TERRA), rr, 0.015, 0.08, 0.05)); }
      else if (kind < 0.62) { const [px, pz] = rot(0, d / 2 + 1.0, ry); b.box(cloth, x + px, y + h * 0.6, z + pz, w * 0.85, 0.2, 2.2, ry, jit(rr.pick(awn), rr), -0.25, 0); b.box(plaster, x + w * 0.2, y + h + 0.4, z - d * 0.15, w * 0.4, 1.8, d * 0.4, ry, shade(wc, 0.97)); }
      else { b.box(plaster, x + w * 0.2, y + h + 0.4, z - d * 0.15, w * 0.5, 2.2, d * 0.5, ry, shade(wc, 0.97)); b.box(plaster, x + w * 0.2, y + h + 2.4, z - d * 0.15, w * 0.5 + 0.5, 0.5, d * 0.5 + 0.5, ry, 0xf8f0dc); }
      if (kind >= 0.3) { const [px, pz] = rot(0, -d / 2 + 0.25, ry); b.box(plaster, x + px, y + h + 0.4, z + pz, w + 0.5, 0.8, 0.4, ry, shade(wc, 0.95)); } // roof-terrace parapet
      if (rr() < 0.3) { const [px, pz] = rot(w / 2 + 0.5, 0, ry); b.box(woodM, x + px, y + h * 0.55, z + pz, 1.0, 0.25, d * 0.6, ry); } // balcony
      const [dpx, dpz] = rot(0, d / 2 + 0.06, ry); b.box(dark, x + dpx, y, z + dpz, 1.4, 2.4, 0.2, ry);
      for (const sd of [-1, 1]) { const [wx, wz] = rot(sd * w * 0.27, d / 2 + 0.06, ry); b.box(winG, x + wx, y + h * 0.52, z + wz, 0.9, 1.4, 0.12, ry); }
      placed.push({ x, z, h });
    }
    // outside: dunes trees
    for (const [ox, oz, n] of OASES) grove(b, K.scatter({ rng: K.rng(71 + n), count: q.dens(n), bounds: [ox - 26, oz - 20, ox + 26, oz + 20], minDist: 5.5, avoid: (x, z) => Math.abs(x) < 8 }), H, 'palm');
    b.ribbon(cobble, K.smoothPath([[0, -R_OUT - 24], [6, -260], [-14, -340], [10, -430], [-6, -560]], 6), 7, heightAt, 0.1, 0xc9b49a); // caravan road into the Red Waste

    const built = b.build({}), noShadow = new Set([winG, lan, dark, cloth, reliefM]); built.children.forEach((m) => { if (noShadow.has(m.material)) m.castShadow = false; }); root.add(built);
    // ---- life: ships, birds, banners, fires, walkers, smoke
    const ships = [], types = ['cog', 'galley', 'dhow', 'galley', 'cog', 'dhow', 'galley', 'cog'];
    const sc = [0xe0ad34, 0xc4553f, 0xf0e6cc, 0x2f62a8, 0x8a4a86, 0x2a9d8f];
    types.forEach((tp, i) => { const s = K.ship(tp, { len: 15 + (i % 3) * 3, hull: [0x6b3a20, 0x3f2a1a, 0x8a4a2a][i % 3], sail: sc[i % 6], sailColor2: sc[(i + 2) % 6] }); const x = -150 + i * 44 + (i % 2) * 10, z = SHORE + 36 + (i % 3) * 22; s.position.set(x, 0.1, z); s.rotation.y = (i % 2 ? 0.3 : -0.4) + 1.57 * (i % 2); s.userData.base = [x, z]; ships.push(s); root.add(s); });
    ctx.onUpdate((dt, t) => ships.forEach((s, i) => { K.animateShip(s, t, i); s.position.x = s.userData.base[0] + Math.sin(t * 0.07 + i) * 6; }));
    const gulls = K.birds({ center: [0, 55, 100], radius: 110, count: q.dens(14), color: 0xf4f4f0, size: 1.2, spreadY: 14, seed: 4 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const bn = []; pb.forEach(([x, z, h, ci], i) => bn.push({ x, y: H(x, z) + h * 0.8, z, w: 3, h: 8, color: JEWEL[ci], ry: 0.5 }));
    mt.forEach(([x, z], i) => bn.push({ x, y: H(x, z) + 28, z, w: 2.6, h: 7, color: JEWEL[(i + 3) % 7], ry: 1 }));
    for (const w of WALLS) bn.push({ x: 8, y: H(0, -w.R) + w.h + 14, z: -w.R, w: 3, h: 8, color: 0xe0ad34, ry: 0 }, { x: -8, y: H(0, -w.R) + w.h + 14, z: -w.R, w: 3, h: 8, color: 0xe0ad34, ry: 0 });
    root.add(K.banners(bn));
    const fire = K.fires([[0, H(0, -R_IN) + 4, -R_IN + 5], [0, H(0, -R_MID) + 4, -R_MID + 5], [-12, H(-12, SHORE - 2) + 3, SHORE - 2], [12, H(12, SHORE - 2) + 3, SHORE - 2], [hx + 26, hy + 5, hz + 26], [hx - 26, hy + 5, hz + 26], [0, H(0, -R_OUT) + 4, -R_OUT + 5]], { size: 8, light: q.low ? 0 : 3, intensity: 45 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    root.add(K.smoke(placed.filter((_, i) => i % 9 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 3, p.z]), { size: 14, rise: 10, opacity: 0.16, color: 0xe6dccd }));
    const wk = K.walkers({ paths: [mainRoad, roads[0], roads[1], roads[2], roads[3], [[-150, SHORE - 4], [0, SHORE - 3], [150, SHORE - 4]]], heightAt, count: q.dens(60), rng: K.rng(8), colors: JEWEL.concat([0xf0e6cc]) }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const cl = K.clouds({ y: 280, extent: 900, count: 8, opacity: 0.32, color: 0xfff4e0 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 280, center: [0, 0, 10], minDistance: 18,
      hero: { pos: [-138, 112, 238], target: [6, 14, -22] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        day: { top: 0x3f8fd0, horizon: 0xeee4d2, fog: 0xdcdcd0, fogD: 0.00085, sunC: 0xfff0d0, sunI: 3.5, az: 2.45, elev: 0.55, hemiSky: 0xb4d0ee, hemiGround: 0x8c7050, hemiI: 0.85 },
        dawn: { top: 0x5a6aa8, horizon: 0xf6b896, fog: 0xe6b6a0, fogD: 0.0015, sunC: 0xffb87c, hemiGround: 0x6a4a44 },
        dusk: { top: 0x3b3478, horizon: 0xf0907c, fog: 0xd08a8e, fogD: 0.0014, sunC: 0xff9a68, sunI: 3.2, az: 1.1, hemiSky: 0x9a90c8, hemiGround: 0x7a5658, hemiI: 0.95 },
        night: { top: 0x0a0e34, horizon: 0x2a3664, fog: 0x1c2748, fogD: 0.0019, sunC: 0xa8c0f8, sunI: 2.0, hemiSky: 0x6a7cc0, hemiGround: 0x3a3850, hemiI: 1.35 },
      } },
      landmarks: {
        'triple-walls': lm(-R_MID * Math.cos(0.5), -R_MID * Math.sin(0.5), 16, 26), 'gate-of-pillars': lm(0, -R_OUT, 14, 32),
        'hall-of-a-thousand-thrones': lm(hx, hz, 24, 42), 'pureborn-towers': lm(40, -36, 20, 52), 'house-of-the-undying': { ...lm(146, 14, 26, 10), cam: { pos: [182, 50, -44], target: [146, 3, 16] } },
        'warlocks-way': lm(98, -2, 16, 10), 'temple-of-memory': lm(tx, tz, 14, 18), 'xaro-palace': lm(xp[0], xp[1], 20, 20),
        'merchant-towers': lm(104, -34, 18, 52), 'bazaar': lm(bz[0], bz[1], 22, 6), 'gardens-of-gehane': lm(gg[0], gg[1], 22, 10), 'harbour': lm(0, SHORE + 20, 40, 8),
      },
      cutaways: [{ id: 'hall-of-a-thousand-thrones', name: { en: 'Hall of a Thousand Thrones (cutaway)', zh: '千座之厅（剖面）' }, build: buildHall }],
    };
  },
};

function buildHall(ctx) {
  // Section through the Hall of a Thousand Thrones: the front of the drum and dome is cut away along a gilded arch, revealing a
  // horseshoe of carved thrones (wood, gilt, ivory, ebony, inlaid with amber, onyx, lapis and jade) under a painted lapis dome.
  const g = ctx.root, b = new Batch(), rr = K.rng(91);
  const floorM = tri('marble', { color: 0xeee6d4, scale: 16, snow: false, rough: 0.32, bump: 0.15 }), wood = tri('wood', { color: 0x5a3620, scale: 2.5, snow: false, bump: 0.5 });
  const riserM = tri('marble', { color: 0xe6dcc8, scale: 14, snow: false, rough: 0.4, bump: 0.15, side: THREE.DoubleSide }), inlay = flat(0xffffff, { rough: 0.35, flatShading: false });
  const gilt = flat(0xd9a52f, { rough: 0.3, metal: 0.65, flatShading: false }), ivory = flat(0xffffff, { rough: 0.5, flatShading: false }), dark = flat(0x0c0a0a);
  const paint = flat(0xffffff, { rough: 0.85, side: THREE.DoubleSide, flatShading: false });
  const R = 32, DY = 15, a0 = 0.64, aL = Math.PI * 2 - 1.28; // horseshoe opening toward the viewer (+z)
  const lathe = (pts, s0 = a0, sl = aL, seg = 44) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, s0, sl);
  const I = new THREE.Matrix4(), flatRing = (r0, r1, y, col, seg = 56) => b.addGeometry(inlay, new THREE.RingGeometry(r0, r1, seg).rotateX(-Math.PI / 2), new THREE.Matrix4().makeTranslation(0, y, 0), col);
  // floor and the petitioners' rosette (lapis, jade, amber, onyx)
  b.cyl(floorM, 0, -0.8, 0, R + 4, 0.8, { seg: 48 });
  flatRing(0, 1.6, 0.03, 0xd9a52f); flatRing(1.6, 3.2, 0.03, 0x24448e); flatRing(3.2, 3.6, 0.03, 0xd9a52f); flatRing(3.6, 6.4, 0.03, 0x2f7a5a); flatRing(6.4, 6.8, 0.03, 0x1a1418); flatRing(6.8, 10.5, 0.03, 0xe8dcc0); flatRing(10.5, 11.0, 0.03, 0xc78a34);
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; b.box(inlay, Math.sin(a) * 8.6, 0.02, Math.cos(a) * 8.6, 0.5, 0.04, 3.4, a, k % 2 ? 0x24448e : 0xc78a34); }
  // tiered horseshoe: continuous marble risers with gilt edges, a throne on each step
  const types = [{ m: wood, c: 0x6b4026 }, { m: gilt, c: 0xffffff }, { m: ivory, c: 0xeee2c8 }, { m: wood, c: 0x2a1a14 }], gems = [0xe0962a, 0x18161c, 0x2a46b0, 0x2f9a6a];
  for (let k = 0; k < 8; k++) {
    const rad = 13 + k * 2.3, y = k * 1.25;
    b.addGeometry(riserM, lathe([[rad - 1.25, -0.8], [rad - 1.25, y + 1.0], [rad + 1.1, y + 1.0], [rad + 1.1, -0.8]]), I, k % 2 ? 0xf0e8d6 : 0xe4d8c0);
    b.addGeometry(gilt, lathe([[rad - 1.3, y + 0.85], [rad - 1.3, y + 1.08], [rad - 1.0, y + 1.08], [rad - 1.0, y + 0.85]]), I, 0xffffff);
    const n = 12 + k * 3;
    for (let i = 0; i < n; i++) {
      const a = -2.42 + (4.84 * i) / (n - 1), x = Math.sin(a) * (rad + 0.1), z = -Math.cos(a) * (rad + 0.1), ty = types[(i * 7 + k * 3) % 4], fx = Math.sin(a), fz = -Math.cos(a), base = y + 1.0;
      b.box(ty.m, x, base, z, 1.6, 0.55, 1.4, -a, ty.c); // seat
      const bh = 1.9 + ((i + k) % 3) * 0.35; b.box(ty.m, x + fx * 0.62, base + 0.55, z + fz * 0.62, 1.6, bh, 0.3, -a, ty.c); // back
      b.box(gilt, x + fx * 0.62, base + 0.55 + bh, z + fz * 0.62, 1.75, 0.22, 0.42, -a, 0xffffff); // gilt cresting
      for (const sd of [-1, 1]) b.sphere(gilt, x + fx * 0.62 + Math.cos(a) * sd * 0.72, base + 0.75 + bh, z + fz * 0.62 + Math.sin(a) * sd * 0.72, 0.17, { seg: 5 });
      for (const sd of [-1, 1]) b.box(ty.m, x + Math.cos(a) * sd * 0.75, base + 0.55, z + Math.sin(a) * sd * 0.75, 0.18, 0.7, 1.2, -a, ty.c); // arms
      b.sphere(inlay, x + fx * 0.45, base + 0.55 + bh * 0.72, z + fz * 0.45, 0.24, { seg: 6, color: gems[(i + k) % 4] }); // inlaid stone
    }
  }
  for (const sd of [-1, 1]) { const a = sd * 2.55, rIn = 11.6, rOut = 13 + 7 * 2.3 + 1.2, cx = Math.sin(a) * (rIn + rOut) / 2, cz = -Math.cos(a) * (rIn + rOut) / 2;
    for (let k = 0; k < 8; k++) { const rad = 13 + k * 2.3; b.box(riserM, Math.sin(a) * rad, -0.8, -Math.cos(a) * rad, 2.4, k * 1.25 + 2.1, 0.7, -a + Math.PI / 2, 0xe8dcc6); }
    void cx; void cz; }
  // drum wall behind: red dado, ivory wall with dark arched niches, a painted frieze, gilt cornice; columns before it
  b.addGeometry(paint, lathe([[R + 0.6, -0.8], [R + 0.6, 2.4]], a0 - 0.12, aL + 0.24, 56), I, 0x6a1f22);
  b.addGeometry(paint, lathe([[R + 0.6, 2.4], [R + 0.6, 11.2]], a0 - 0.12, aL + 0.24, 56), I, 0xe8dcc0);
  b.addGeometry(paint, lathe([[R + 0.6, 11.2], [R + 0.6, 13.6]], a0 - 0.12, aL + 0.24, 56), I, 0x24448e);
  b.addGeometry(gilt, lathe([[R + 0.6, 13.6], [R - 0.4, 13.8], [R - 0.4, DY], [R + 0.6, DY]], a0 - 0.12, aL + 0.24, 56), I, 0xffffff);
  for (let k = 0; k < 40; k++) { const a = a0 - 0.1 + (k + 0.5) / 40 * (aL + 0.2); b.box(gilt, Math.sin(a) * (R + 0.45), 12.0, Math.cos(a) * (R + 0.45), 0.9, 0.9, 0.2, a, 0xffffff); } // frieze medallions
  for (let k = 0; k < 18; k++) { const a = a0 + (k + 0.5) / 18 * aL, x = Math.sin(a) * (R + 0.45), z = Math.cos(a) * (R + 0.45);
    b.box(dark, x, 3.2, z, 2.4, 5.6, 0.3, a); b._add(dark, G.sphere(10), x, 7.6, z, 1.2, 1.2, 0.15, a, 0xffffff); b.box(glow(0xffc070), x * 0.985, 4.2, z * 0.985, 0.4, 0.9, 0.2, a); }
  for (let k = 0; k < 19; k++) { const a = a0 + k / 18 * aL, x = Math.sin(a) * (R - 1.0), z = Math.cos(a) * (R - 1.0);
    b.cyl(floorM, x, 0, z, 0.95, 12.6, { top: 0.86, seg: 12 }); b.cyl(gilt, x, 12.6, z, 1.25, 1.0, { top: 1.2, seg: 10 }); b.cyl(gilt, x, 0, z, 1.25, 0.6, { seg: 10 }); }
  // painted dome: lapis deepening toward the crown, gilt ribs, star glints, an oculus of daylight; cut along a gilded arch
  { const dg = new THREE.SphereGeometry(R + 0.6, 40, 16, a0 - 0.12 + Math.PI / 2, aL + 0.24, 0, Math.PI / 2), col = [], c1 = new THREE.Color(0x356e8a), c2 = new THREE.Color(0x121c4a), tmp = new THREE.Color();
    for (let i = 0; i < dg.attributes.position.count; i++) { const yy = dg.attributes.position.getY(i) / (R + 0.6); tmp.copy(c1).lerp(c2, K.smoothstep(0.05, 0.9, yy)); col.push(tmp.r, tmp.g, tmp.b); }
    dg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    // SphereGeometry phi = lathe phi + PI/2, so the opening lines up with the horseshoe (+z)
    const dm = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })); dm.position.y = DY; g.add(dm); }
  const meridian = (geo, phi) => b.addGeometry(gilt, geo, new THREE.Matrix4().makeTranslation(0, DY, 0).multiply(new THREE.Matrix4().makeRotationY(phi - Math.PI / 2)));
  { const rib = new THREE.TorusGeometry(R + 0.15, 0.22, 4, 20, Math.PI / 2); for (let r = 0; r < 12; r++) meridian(rib, a0 + (r + 0.5) / 12 * aL); }
  for (let i = 0; i < 60; i++) { const a = a0 + rr() * aL, th = 0.2 + rr() * 1.15, rr2 = (R - 0.2) * Math.cos(th), yy = DY + (R - 0.2) * Math.sin(th); b.box(glow(0xffe08a), Math.sin(a) * rr2, yy, Math.cos(a) * rr2, 0.35, 0.35, 0.12, a); }
  b.addGeometry(glow(0xfff2c8), new THREE.CircleGeometry(3.2, 20).rotateX(Math.PI / 2), new THREE.Matrix4().makeTranslation(0, DY + R + 0.3, 0)); // oculus
  b.addGeometry(gilt, new THREE.TorusGeometry(3.4, 0.35, 6, 24).rotateX(Math.PI / 2), new THREE.Matrix4().makeTranslation(0, DY + R + 0.2, 0));
  { const arch = new THREE.TorusGeometry(R + 0.6, 0.6, 6, 28, Math.PI / 2); meridian(arch, a0 - 0.12); meridian(arch, -(a0 - 0.12)); } // gilded cut edge
  g.add(b.build({}));
  // light: daylight shaft from the oculus, warm braziers on tripods before the lowest tier
  const sun = new THREE.SpotLight(0xfff0d0, 260, 90, 0.62, 0.8, 1.2); sun.position.set(0, DY + R + 4, 0); sun.target.position.set(0, 0, 0); g.add(sun, sun.target);
  const bz = [[-8, 1.9, 9], [8, 1.9, 9], [-11, 1.9, -4], [11, 1.9, -4]], tb = new Batch();
  for (const [x, , z] of bz) { for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; tb.box(gilt, x + Math.cos(a) * 0.35, 0, z + Math.sin(a) * 0.35, 0.12, 1.9, 0.12, 0, 0xffffff, 0, Math.cos(a) * 0.15); } tb.cyl(gilt, x, 1.8, z, 0.7, 0.4, { top: 1.3, seg: 10 }); }
  g.add(tb.build({}));
  const lamps = K.fires(bz.map(([x, y, z]) => [x, y + 0.6, z]), { size: 6, light: 2, intensity: 34, color: 0xffa24a }); g.add(lamps); ctx.onUpdate((dt, t) => lamps.userData.update(t));
  const fill = new THREE.HemisphereLight(0x9ab0d8, 0x5a4030, 1.0); g.add(fill);
  for (const a of [Math.PI - 0.9, Math.PI, Math.PI + 0.9]) { const l = new THREE.PointLight(0xffc27a, 70, 42, 1.4); l.position.set(Math.sin(a) * (R - 3), 7, Math.cos(a) * (R - 3)); g.add(l); }
  return { center: [0, 8, -6], hero: { pos: [0, 19, 46], target: [0, 8, -8] }, minDistance: 10, maxDistance: 100 };
}
function gold() { return flat(0xd9a52f, { rough: 0.35, metal: 0.6 }); }

const TREEC = { palm: [0x3f7a42, 0x4a8446, 0x56883e], bush: [0x456f38, 0x50783c, 0x3c6332], black: [0x252338, 0x2c2a44, 0x1e1d2e] };
function grove(b, pts, H, kind) {
  const r = K.rng(pts.length + 3), trunkM = flat(0xffffff, { rough: 1 }), leaf = flat(0xffffff, { rough: 1, side: THREE.DoubleSide });
  for (const [x, z] of pts) {
    const y = H(x, z), k = r.range(0.8, 1.2), col = r.pick(TREEC[kind]);
    if (kind === 'bush') { b.sphere(leaf, x, y, z, 2.2 * k, { seg: 6, sy: 0.8, color: col }); continue; }
    if (kind === 'black') { b.cyl(trunkM, x, y, z, 0.45 * k, 4 * k, { seg: 5, color: 0x16141c }); b.cone(leaf, x, y + 2.6 * k, z, 2.1 * k, 9 * k, { seg: 7, color: col }); continue; }
    b.cyl(trunkM, x, y, z, 0.38 * k, 7 * k, { top: 0.7, seg: 5, color: 0x8d7452 });
    for (let i = 0; i < 6; i++) b.box(leaf, x + Math.cos(i) * 1.6 * k, y + 7 * k - 0.4, z + Math.sin(i) * 1.6 * k, 3.4 * k, 0.25, 1.1 * k, -i, col, 0, 0.35);
  }
}
