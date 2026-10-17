// Lys — warm, perfumed island city of Valyrian descent. Book/TWOIAF anchors: fertile palm-and-fruit island, walls and hired swords,
// pillow houses and pleasure gardens, striped galleys, silver-gold-haired people, temples (Trade, a red temple of R'hllor), wealth over birth.
// Plan, shapes, pastel colours and the specific buildings are interpretation (see content/lys.js).
// Polish pass: soft pastel plaster and white marble under silvered spires, a stone crescent quay, bright turquoise cove, terraced pleasure
// gardens with hedges / beds / arbours, lantern-pink night glow, rosy dusk grade, sea skirts so the island floats in an open sea.
import * as K from '../kit/index.js';
const { THREE, Batch, tri, flat, glow } = K;

const _hsl = {};
function jit(hex, r, dh = 0.012, ds = 0.07, dl = 0.05) { const c = new THREE.Color(hex); c.getHSL(_hsl); return c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, K.clamp(_hsl.s + r.range(-ds, ds), 0, 1), K.clamp(_hsl.l + r.range(-dl, dl), 0, 1)); }
const shade = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const rot = (dx, dz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return [dx * c + dz * s, -dx * s + dz * c]; };

const treeMat = flat(0xffffff, { rough: 1, flatShading: false }), trunkMat = flat(0x6b5238, { rough: 1 }), leafMat = flat(0xffffff, { rough: 1, side: THREE.DoubleSide, flatShading: false });
function trees(b, { rng = K.rng(1), count = 50, bounds, heightAt = () => 0, avoid, species = 'oak', scale = [0.8, 1.2], minDist = 4, tint, fruit }) {
  const pts = K.scatter({ rng, count, bounds, minDist, avoid });
  const greens = { oak: [0x4b7a3a, 0x58863f, 0x3f6a33], cypress: [0x2f4f3a, 0x38583f, 0x2a4634], palm: [0x3f8f45, 0x4aa04d, 0x55a652], olive: [0x8a9a62, 0x7d8f58, 0x6f8450] }[species];
  for (const [x, z] of pts) {
    const k = rng.range(scale[0], scale[1]), y = heightAt(x, z), gc = jit(tint ?? rng.pick(greens), rng, 0.012, 0.06, 0.05);
    if (species === 'cypress') { b.cyl(trunkMat, x, y, z, 0.3 * k, 1.4 * k, { seg: 5 }); b.cone(treeMat, x, y + 1.0 * k, z, 1.5 * k, 8.5 * k, { seg: 7, color: gc }); }
    else if (species === 'palm') {   // leaning trunk, fan of drooping fronds
      const lean = rng.range(-0.18, 0.18), a0 = rng() * 6.28, lx = Math.cos(a0) * lean * 7 * k, lz = Math.sin(a0) * lean * 7 * k;
      b.cyl(trunkMat, x, y, z, 0.34 * k, 3.6 * k, { seg: 5, top: 0.8, color: 0x9a8058 }); b.cyl(trunkMat, x + lx * 0.5, y + 3.5 * k, z + lz * 0.5, 0.27 * k, 3.6 * k, { seg: 5, top: 0.85, color: 0xa08a64 });
      const cx = x + lx, cz = z + lz, cy = y + 7 * k;
      for (let i = 0; i < 7; i++) { const a = a0 + (i / 7) * 6.283; b.box(leafMat, cx + Math.cos(a) * 1.7 * k, cy - 0.3 * k, cz + Math.sin(a) * 1.7 * k, 4.0 * k, 0.16, 1.2 * k, -a, i % 2 ? gc : shade(gc.getHex(), 1.12), 0, 0.42); }
      b.sphere(treeMat, cx, cy, cz, 0.55 * k, { seg: 4, color: 0x6a5a38 });
    }
    else if (species === 'olive') { b.cyl(trunkMat, x, y, z, 0.35 * k, 2.2 * k, { seg: 5, color: 0x7a6a56 }); b.sphere(treeMat, x, y + 1.8 * k, z, 2.2 * k, { seg: 7, sy: 0.7, color: gc }); b.sphere(treeMat, x + 1.0 * k, y + 2.4 * k, z - 0.6 * k, 1.5 * k, { seg: 6, sy: 0.7, color: shade(gc.getHex(), 1.12) }); }
    else { b.cyl(trunkMat, x, y, z, 0.4 * k, 2.6 * k, { seg: 6 }); b.sphere(treeMat, x, y + 2.3 * k, z, 2.4 * k, { seg: 8, sy: 0.85, color: gc }); b.sphere(treeMat, x - 0.9 * k, y + 3.3 * k, z + 0.5 * k, 1.5 * k, { seg: 6, sy: 0.8, color: shade(gc.getHex(), 1.15) }); if (fruit) for (let i = 0; i < 5; i++) b.sphere(treeMat, x + Math.cos(i * 2.1) * 2 * k, y + 2.5 * k + (i % 2) * 1.1 * k, z + Math.sin(i * 2.1) * 2 * k, 0.36, { seg: 4, color: fruit }); }
  }
  return pts;
}

const COVE = [-68, 0, 72];                       // harbour cove centre/radius
const HILL = [130, -25, 70, 40];                 // x,z,radius,height
const cove = (x, z) => Math.hypot(x - COVE[0], (z - COVE[1]) * 1.08);

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(2207);
    const heightAt = (x, z) => {
      const d = Math.hypot((x - 40) / 235, z / 178) + (K.fbm(x * 0.012, z * 0.012, 3, 3) - 0.5) * 0.14, t = 1 - d;
      let h0 = 1.6 + (K.fbm(x * 0.02, z * 0.02, 3, 6) - 0.5) * 3 + K.smoothstep(-40, 160, x) * 7;
      const hd = Math.hypot(x - HILL[0], z - HILL[1]); h0 += HILL[3] * (1 - K.smoothstep(HILL[2] * 0.2, HILL[2], hd));
      let h = -7 + K.smoothstep(0.0, 0.12, t) * (h0 + 7.2);
      const cd = cove(x, z); if (cd < COVE[2] + 20) h = Math.min(h, -6 + K.smoothstep(COVE[2] - 30, COVE[2] + 20, cd) * (h + 6));
      return h;
    };
    const sandC = new THREE.Color(0xf4e8c8), grass = new THREE.Color(0x9cbf6c), lush = new THREE.Color(0x6fa650), rock = new THREE.Color(0xd6c8aa), seabed = new THREE.Color(0x52b0b0), pave = new THREE.Color(0xeadfc6), wet = new THREE.Color(0xcdbf9c), c = new THREE.Color();
    root.add(K.terrain({ size: 1400, seg: q.seg(170), heightAt, kind: 'plaster', scale: 28, colorAt: (x, z, h, s) => {
      if (h < 0) return c.copy(seabed).lerp(sandC, K.clamp(1 + h / 2.5, 0, 1));
      c.copy(sandC).lerp(grass, K.smoothstep(0.6, 3.5, h)); c.lerp(lush, K.clamp(K.fbm(x * 0.03, z * 0.03, 2, 8) * 1.4 - 0.4, 0, 0.7) * K.smoothstep(2, 6, h));
      c.lerp(rock, K.clamp(s * 3, 0, 0.6));
      const cityK = 1 - K.smoothstep(0.82, 1.0, ((x - 40) / 128) ** 2 + (z / 120) ** 2); c.lerp(pave, 0.8 * cityK * K.smoothstep(1, 2, h) * (cove(x, z) > COVE[2] ? 1 : 0.3));
      if (h < 1.0) c.lerp(wet, 0.5 * K.clamp((1.0 - h) / 1.0, 0, 1));
      return c;
    } }));
    const wopt = { deep: 0x1a82aa, shallow: 0x76dcd2, opacity: 0.88, choppy: 0.3, speed: 0.5 };
    const wat = K.water({ w: 1400, d: 1400, seg: q.seg(130), level: 0, heightAt, ...wopt });
    root.add(wat); ctx.registerWater(wat);
    for (const [cx, cz, w, d] of [[0, -2200, 8000, 3000], [0, 2200, 8000, 3000], [-2200, 0, 3000, 1400], [2200, 0, 3000, 1400]]) { const sk = K.water({ w, d, seg: 2, level: 0, heightAt: () => -8, center: [cx, cz], ...wopt }); root.add(sk); ctx.registerWater(sk); }

    // materials: pale plaster & marble, pastel tile. Tints near white, colour via vertex arg.
    const plaster = tri('plaster', { color: 0xffffff, scale: 6, snow: false }), marble = tri('marble', { color: 0xffffff, scale: 7, snow: false, rough: 0.35 }), tile = tri('tile', { color: 0xffffff, scale: 11, snow: false, rough: 0.7, bump: 0.5 }), glaze = tri('plaster', { color: 0xffffff, scale: 3, snow: false, rough: 0.42, bump: 0.3 });
    const stone = tri('stone', { color: 0xfaf2e4, scale: 8, snow: false, bump: 0.5 }), cobble = tri('cobble', { color: 0xf6ecd6, scale: 8, snow: false }), wood = tri('wood', { color: 0xd8c0a0, scale: 4, snow: false });
    const gold = flat(0xe6c06a, { rough: 0.4, metal: 0.25, flatShading: false }), silver = flat(0xdfe6ee, { rough: 0.35, metal: 0.25, flatShading: false }), awning = flat(0xffffff, { rough: 1, side: THREE.DoubleSide, flatShading: false });
    const windowG = glow(0xffc79a), lanternG = glow(0xff9ac0, 1.5), lan = glow(0xffb070, 1.3), dark = flat(0x7a5a62, { rough: 1 }), plain = flat(0xffffff, { rough: 0.9, flatShading: false });
    const b = new Batch(), H = heightAt;
    const inCity = (x, z) => H(x, z) > 1.3 && cove(x, z) > COVE[2] + 14 && x > -190;
    const PAS = [{ wall: 0xfbd5d0, roof: 0xe8a898 }, { wall: 0xfdecc8, roof: 0xe3be82 }, { wall: 0xd9e6f5, roof: 0xa898d8 }, { wall: 0xf6e3f0, roof: 0xd890b8 }, { wall: 0xe4f1e0, roof: 0xc4d4a0 }, { wall: 0xfdf5e6, roof: 0xe6a890 }, { wall: 0xe8dcf6, roof: 0xb8aee0 }, { wall: 0xfff8ee, roof: 0x9ac8d8 }];

    // ---------------------------------------------------------------- walls (landward) and gate towers
    const wallPts = []; for (let i = 0; i <= 36; i++) { const a = -1.55 + (i / 36) * 3.1; wallPts.push([40 + Math.cos(a) * 128, Math.sin(a) * 118]); }
    const wallOK = wallPts.filter(([x, z]) => H(x, z) > 0.8);
    K.wall(b, wallOK, { h: 12, t: 3.6, mat: stone, capMat: stone, heightAt: H, closed: false, sink: 5, color: 0xfdf6ea });
    for (let i = 0; i < wallOK.length - 1; i++) {
      const [x0, z0] = wallOK[i], [x1, z1] = wallOK[i + 1], dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz); if (l > 30) continue;
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ry = K.headingX(dx, dz), g = Math.min(H(x0, z0), H(x1, z1));
      b.box(stone, mx, g - 2, mz, l + 0.4, 3.6, 5.2, ry, 0xf1e6d2); b.box(marble, mx, g + 6.2, mz, l + 0.3, 0.6, 4.2, ry, 0xfffaf0); b.box(marble, mx, Math.max(H(x0, z0), H(x1, z1)) + 11, mz, l + 0.3, 0.9, 4.6, ry, 0xfffaf0);
    }
    wallOK.forEach(([x, z], i) => { if (i % 4 === 0) { const y = H(x, z); K.tower(b, x, z, { r: 4, h: 20, y, mat: marble, roofMat: silver, roof: 'cone', roofH: 9, seg: 12, windows: true, color: 0xfbf4ea, taper: 0.84 }); b.cyl(marble, x, y + 12, z, 3.5, 0.6, { seg: 12, color: 0xf3e6d0 }); b.sphere(silver, x, y + 30.6, z, 0.5, { seg: 5 }); } });
    const gate = wallOK[Math.floor(wallOK.length / 2)];
    K.gatehouse(b, gate[0], gate[1], { y: H(...gate), ry: Math.PI / 2, mat: stone, roofMat: silver, w: 18, d: 9, h: 18, gate: 6, wood, towerR: 4.4, color: 0xfdf6ea });
    b.box(marble, gate[0], H(...gate) + 18, gate[1], 20, 0.9, 10, Math.PI / 2, 0xfffaf0); for (const s of [-1, 1]) b.sphere(lan, gate[0] - 6, H(...gate) + 4.5, gate[1] + s * 5, 0.5, { seg: 5 });

    // ---------------------------------------------------------------- the Lysene harbour: stone crescent quay, moles, pastel warehouses
    const quay = []; for (let i = 0; i <= 28; i++) { const a = -1.15 + (i / 28) * 2.3; quay.push([COVE[0] + Math.cos(a) * (COVE[2] + 3), Math.sin(a) * (COVE[2] + 3) / 1.08]); }
    { const outer = [], inner = []; for (let i = 0; i <= 28; i++) { const a = -1.15 + (i / 28) * 2.3; outer.push([COVE[0] + Math.cos(a) * (COVE[2] + 9), Math.sin(a) * (COVE[2] + 9) / 1.08]); inner.push([COVE[0] + Math.cos(a) * (COVE[2] - 1.5), Math.sin(a) * (COVE[2] - 1.5) / 1.08]); }
      b.extrude(stone, [...outer, ...inner.reverse()], -2.2, 3.6, 0xf0e6d0);
      const o2 = [], i2 = []; for (let i = 0; i <= 28; i++) { const a = -1.15 + (i / 28) * 2.3; o2.push([COVE[0] + Math.cos(a) * (COVE[2] - 1.0), Math.sin(a) * (COVE[2] - 1.0) / 1.08]); i2.push([COVE[0] + Math.cos(a) * (COVE[2] - 2.0), Math.sin(a) * (COVE[2] - 2.0) / 1.08]); }
      b.extrude(marble, [...o2, ...i2.reverse()], 1.35, 0.4, 0xfffaf0); }   // quay coping
    for (let i = 2; i < 27; i += 2) { const [x, z] = quay[i], a = -1.15 + (i / 28) * 2.3; K.pier(b, x - Math.cos(a) * 3, 1.0, z - Math.sin(a) * 3 / 1.08, { len: 22 + (i % 3) * 6, w: 3.2, ry: Math.PI - a, mat: wood, color: 0xe0c8a8 }); }
    for (let i = 1; i < 28; i += 2) { const [x, z] = quay[i]; b.cyl(wood, x, 1.4, z, 0.12, 3.4, { seg: 4, color: 0x8a6a4a }); b.sphere(lanternG, x, 4.9, z, 0.42, { seg: 6 }); }
    for (const sg of [-1, 1]) { const mx = -128, mz = sg * 62, my = Math.max(H(mx, mz), 0.8); K.tower(b, mx, mz, { r: 4.2, h: 20, y: my, mat: marble, roofMat: gold, roof: 'cone', roofH: 7, seg: 12, windows: true, color: 0xfbf4ea, taper: 0.85 }); b.cyl(stone, mx, my - 2.4, mz, 7, 3.4, { seg: 12, color: 0xefe3cc, top: 0.8 }); b.sphere(lan, mx, my + 29.4, mz, 0.9, { seg: 6 }); }
    // pastel warehouses behind the quay
    for (let i = 3; i < 26; i += 3) { const a = -1.15 + (i / 28) * 2.3, r = COVE[2] + 17, x = COVE[0] + Math.cos(a) * r, z = Math.sin(a) * r / 1.08, y = H(x, z); if (y < 0.8) continue; const ry = Math.atan2(COVE[0] - x, -z), p = PAS[i % 8];
      b.box(plaster, x, y - 1, z, 12, 5.6, 8, ry, jit(p.wall, rr)); b.prism(tile, x, y + 4.6, z, 13, 3.2, 9, ry + Math.PI / 2, jit(p.roof, rr)); const [dx, dz] = rot(0, 4.06, ry); b.box(dark, x + dx, y, z + dz, 2.6, 3.4, 0.2, ry); for (const s of [-1, 1]) { const [wx, wz] = rot(s * 4, 4.06, ry); b.box(windowG, x + wx, y + 2.4, z + wz, 1.0, 1.4, 0.12, ry); } }

    // ---------------------------------------------------------------- city fabric: pastel houses climbing the slope around the cove
    const streets = [];
    for (let k = 0; k < 7; k++) { const a = -1.1 + k * 0.37, pts = []; for (let i = 0; i <= 12; i++) { const r = COVE[2] + 4 + i * 9; pts.push([COVE[0] + Math.cos(a + Math.sin(i * 0.6) * 0.04) * r, Math.sin(a) * r / 1.08]); } streets.push(pts); }
    streets.forEach((s) => b.ribbon(cobble, s, 4.2, H, 0.25, 0xf2e6cc));
    const ringSt = []; for (let i = 0; i <= 30; i++) { const a = -1.2 + (i / 30) * 2.4; ringSt.push([COVE[0] + Math.cos(a) * (COVE[2] + 30), Math.sin(a) * (COVE[2] + 30) / 1.08]); }
    b.ribbon(cobble, ringSt, 4.2, H, 0.25, 0xf2e6cc);
    const avoidSt = (x, z) => streets.some((s) => K.distToPolyline(x, z, s).d < 5.6) || K.distToPolyline(x, z, ringSt).d < 5.6;
    const big = [[70, 50, 28], [78, -34, 26], [-30, 62, 24], [-24, -78, 24], [-92, -120, 22], [60, 0, 14], [40, -82, 26]];
    const spires = [[-10, -40], [-8, 46], [20, -12], [28, 22], [58, -52], [52, 64], [-60, 96], [-62, -98]], domes = [[34, 10], [26, -26], [50, 36], [14, 62]];
    const pts = K.scatter({ rng: K.rng(33), count: q.dens(560), bounds: [-170, -175, 170, 175], minDist: 7.0,
      avoid: (x, z) => !inCity(x, z) || ((x - 40) / 128) ** 2 + (z / 120) ** 2 > 1 || avoidSt(x, z) || big.some(([bx, bz, br]) => Math.hypot(x - bx, z - bz) < br) || spires.concat(domes).some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 9) });
    const placed = [];
    for (const [x, z] of pts) {
      const y = H(x, z), p = PAS[rr.int(0, 7)], w = rr.range(5, 7.4), d = w * rr.range(1, 1.25), tall = rr() < 0.3, h = tall ? rr.range(9, 12) : rr.range(5, 8), ry = Math.atan2(COVE[0] - x, -z) + rr.range(-0.07, 0.07);
      const wc = jit(p.wall, rr, 0.01, 0.05, 0.03), kind = rr(), rc = jit(p.roof, rr, 0.015, 0.08, 0.05);
      b.box(plaster, x, y - 1.2, z, w + 0.4, 2.2, d + 0.4, ry, shade(wc.getHex(), 0.93));
      b.box(plaster, x, y + 1, z, w, h - 1, d, ry, wc);
      b.box(marble, x, y + h - 0.4, z, w + 0.7, 0.8, d + 0.7, ry, 0xfffaf0);   // pale cornice
      if (kind < 0.3) { const rd = Math.min(w, d) * 0.42; b.cyl(plaster, x, y + h + 0.4, z, rd, 0.9, { seg: 10, color: wc }); b.dome(glaze, x, y + h + 1.2, z, rd + 0.35, { seg: 14, sy: 1.0, color: rc }); b.sphere(gold, x, y + h + 1.2 + rd + 0.35, z, 0.28, { seg: 5 }); }
      else if (kind < 0.6) b.pyramid(tile, x, y + h + 0.4, z, w + 0.8, Math.min(w, d) * 0.62 + 0.8, d + 0.8, ry, rc);
      else if (kind < 0.85) b.prism(tile, x, y + h + 0.4, z, w + 0.9, Math.min(w, d) * 0.5 + 0.8, d + 0.9, ry + (rr() < 0.5 ? 0 : Math.PI / 2), rc);
      else { b.box(marble, x, y + h + 0.4, z, w + 0.4, 0.4, d + 0.4, ry, 0xfffaf0); const [ax, az] = rot(0, d * 0.25, ry); b.box(awning, x + ax, y + h + 2.1, z + az, w * 0.7, 0.14, d * 0.45, ry, jit(rr.pick([0xf0a0c0, 0xc8a8f0, 0xf8d890, 0xa8d8e8]), rr), -0.12); for (const s of [-1, 1]) { const [px, pz] = rot(s * w * 0.33, d * 0.46, ry); b.cyl(wood, x + px, y + h + 0.8, z + pz, 0.09, 1.6, { seg: 4, color: 0xd8b88a }); } }
      if (tall && rr() < 0.7) { const [bx, bz] = rot(0, d / 2 + 0.5, ry); b.box(marble, x + bx, y + h * 0.55, z + bz, w * 0.5, 0.2, 1.0, ry, 0xfffaf0); b.sphere(lanternG, x + bx, y + h * 0.55 - 0.6, z + bz + 0.0, 0.26, { seg: 5 }); }
      const [dpx, dpz] = rot(0, d / 2 + 0.06, ry); b.box(dark, x + dpx, y, z + dpz, 1.3, 2.3, 0.2, ry, 0x8a6a70);
      for (const sd of [-1, 1]) { const [wx, wz] = rot(sd * w * 0.27, d / 2 + 0.06, ry); b.box(windowG, x + wx, y + h * 0.55, z + wz, 0.85, 1.4, 0.12, ry); }
      placed.push({ x, z, h });
    }
    // slender white towers with silvered spires scattered through the town
    spires.forEach(([x, z], i) => { const y = H(x, z), hh = 26 + (i % 3) * 5, col = i % 2 ? 0xfdf4ff : 0xfffaf0;
      K.tower(b, x, z, { r: 2.7, h: hh, y, mat: marble, roofMat: i % 2 ? silver : gold, roof: 'spire', roofH: 12, seg: 12, windows: true, color: col, crenel: false, taper: 0.78 });
      for (const k of [0.3, 0.55, 0.8]) b.cyl(marble, x, y + hh * k, z, 2.7 * (1 - 0.22 * k) + 0.35, 0.5, { seg: 12, color: 0xf6ead4 }); b.cyl(stone, x, y - 1.5, z, 4.4, 3.2, { seg: 12, top: 0.7, color: 0xf0e4cc }); b.sphere(i % 2 ? silver : gold, x, y + hh + 13.4, z, 0.5, { seg: 5 }); });
    // white domes
    for (const [x, z] of domes) { const y = H(x, z); b.cyl(stone, x, y - 1, z, 6.2, 2.4, { seg: 14, color: 0xf0e4cc }); b.cyl(marble, x, y + 1.4, z, 5, 8.6, { seg: 16, color: 0xfffaf0 }); b.cyl(marble, x, y + 9.6, z, 5.6, 0.6, { seg: 16, color: 0xf3e6d0 }); b.dome(marble, x, y + 10.2, z, 5.2, { seg: 16, color: 0xf3ecff }); b.cyl(gold, x, y + 15.2, z, 0.25, 3, { seg: 4 }); for (let k = 0; k < 4; k++) { const a = k * 1.571 + 0.78; b.box(windowG, x + Math.cos(a) * 5.02, y + 5.2, z + Math.sin(a) * 5.02, 0.15, 2.8, 1.0, -a); } }

    // ---------------------------------------------------------------- Pillow houses: low lantern-lit pavilions on the south slope
    const PH = [70, 50], phY = H(...PH);
    b.extrude(stone, [[PH[0] - 24, PH[1] - 18], [PH[0] + 24, PH[1] - 18], [PH[0] + 24, PH[1] + 18], [PH[0] - 24, PH[1] + 18]], phY - 6, 6.2, 0xfff4e6);
    b.box(marble, PH[0], phY + 0.1, PH[1] + 18.2, 49, 0.6, 1.0, 0, 0xfffaf0);
    for (let i = 0; i < 5; i++) { const x = PH[0] - 18 + i * 9, col = [0xf7bfd0, 0xf8d6b0, 0xe8c6f0, 0xf9c8b8, 0xd8c6f4][i]; b.box(plaster, x, phY + 0.2, PH[1] - 6, 7.5, 6, 14, 0, col); b.box(marble, x, phY + 6.0, PH[1] - 6, 8.4, 0.5, 14.9, 0, 0xfffaf0); b.prism(tile, x, phY + 6.4, PH[1] - 6, 8, 3.4, 15, 0, jit(0xe8a8c0, rr)); b.sphere(gold, x, phY + 9.9, PH[1] - 6 + 0.0, 0.3, { seg: 5 }); b.box(lanternG, x, phY + 2.2, PH[1] + 1.1, 1.6, 2.4, 0.15); b.box(lanternG, x + 2.6, phY + 3.5, PH[1] + 1.1, 0.9, 1.4, 0.15); b.box(lanternG, x - 2.6, phY + 3.5, PH[1] + 1.1, 0.9, 1.4, 0.15); for (const s of [-1, 1]) b.cyl(marble, x + s * 3.5, phY + 0.2, PH[1] + 2.2, 0.25, 4.6, { seg: 6, color: 0xfffaf0 }); b.box(awning, x, phY + 4.8, PH[1] + 3.1, 7.6, 0.14, 3.6, 0, jit(col, rr), -0.18); }
    b.cyl(marble, PH[0], phY + 0.2, PH[1] + 9, 3.4, 1.0, { seg: 18, color: 0xf6f0e6 }); b.cyl(marble, PH[0], phY + 1.2, PH[1] + 9, 0.6, 2.4, { seg: 8, color: 0xfffaf0 }); b.cyl(marble, PH[0], phY + 3.6, PH[1] + 9, 1.6, 0.35, { seg: 10, color: 0xfffaf0 });
    for (let i = 0; i < 6; i++) { const x = PH[0] - 20 + i * 8; b.cyl(wood, x, phY, PH[1] + 14, 0.2, 4.4, { seg: 5, color: 0xd8b88a }); b.sphere(lanternG, x, phY + 4.6, PH[1] + 14, 0.38, { seg: 6 }); }

    // ---------------------------------------------------------------- Pleasure gardens: terraced hedges, flower beds, pools, fountains, arbours
    const GA = [100, 58];
    for (let i = 0; i < 5; i++) { const zz = GA[1] - 18 + i * 9, gy = Math.max(H(GA[0] - 6, zz), 0.4); b.box(stone, GA[0] - 6, gy - 0.4, zz, 46, 1.0, 7.6, 0, 0xfff4e6); b.box(plain, GA[0] - 6, gy + 0.55, zz, 44, 0.7, 1.3, 0, [0x4a8a3c, 0x558f40, 0x3f7f38][i % 3]); }   // terrace walls + clipped hedges
    const fl = [0xf0709a, 0xf7c64a, 0xb388e8, 0xff9a66, 0xffffff, 0x7fc4f0];
    for (let i = 0; i < 46; i++) { const x = GA[0] - 24 + (i % 12) * 4.2, z = GA[1] - 18 + Math.floor(i / 12) * 9 + 2.8, y = Math.max(H(x, z), 0.4) + 0.6; b.box(plain, x, y, z, 3.4, 0.5, 2.6, 0, shade(0x4f8a40, 0.9)); b.box(plain, x, y + 0.45, z, 2.8, 0.3, 2.0, 0, fl[i % 6]); b.box(plain, x - 0.6, y + 0.7, z + 0.4, 0.9, 0.3, 0.9, 0, fl[(i + 2) % 6]); }
    for (const [x, z] of [[GA[0] - 20, GA[1] + 22], [GA[0] + 14, GA[1] + 22]]) { const y = Math.max(H(x, z), 0.4); b.cyl(marble, x, y, z, 3.4, 1.2, { seg: 14, color: 0xfffaf0 }); b.cyl(marble, x, y + 1.2, z, 0.5, 2.6, { seg: 6, color: 0xfffaf0 }); b.cyl(marble, x, y + 3.5, z, 1.5, 0.3, { seg: 10, color: 0xfffaf0 }); }
    for (let k = 0; k < 4; k++) { const ax = GA[0] - 22 + k * 11, az = GA[1] + 10, ay = Math.max(H(ax, az), 0.4); for (const s of [-1, 1]) b.cyl(wood, ax + s * 2, ay, az, 0.14, 3.6, { seg: 4, color: 0xf0e4cc }); b.box(wood, ax, ay + 3.5, az, 4.4, 0.18, 0.5, 0, 0xf0e4cc); b.sphere(plain, ax, ay + 3.7, az, 0.8, { seg: 6, color: [0xf0709a, 0xb388e8, 0xf7c64a, 0xff9a66][k] }); }   // rose arbours
    for (let i = 0; i < 18; i++) { const x = GA[0] - 30 + (i % 6) * 12 + rr.range(-2, 2), z = GA[1] + 28 + Math.floor(i / 6) * 6; b.cyl(trunkMat, x, Math.max(H(x, z), 0.4), z, 0.2, 0.6, { seg: 4 }); b.sphere(treeMat, x, Math.max(H(x, z), 0.4) + 1.3, z, 1.1, { seg: 7, color: 0x4a8a3c }); }   // topiary
    trees(b, { rng: K.rng(5), count: q.dens(40), bounds: [GA[0] - 30, GA[1] - 24, GA[0] + 30, GA[1] + 30], heightAt: H, species: 'palm', minDist: 6, scale: [0.9, 1.2], avoid: (x, z) => Math.abs(z - GA[1] - 10) < 3 });
    trees(b, { rng: K.rng(6), count: q.dens(28), bounds: [GA[0] - 30, GA[1] - 24, GA[0] + 30, GA[1] + 30], heightAt: H, species: 'oak', minDist: 5, scale: [0.6, 0.8], tint: 0x5f9a48, fruit: 0xf7a0c0 });
    for (const [x, z, w, d] of [[GA[0] + 20, GA[1] - 4, 12, 7], [GA[0] - 8, GA[1] + 34, 14, 7]]) { const p = K.waterPatch({ w, d, level: Math.max(H(x, z), 0.4) + 0.25, center: [x, z], depth: 1.5, deep: 0x38a8b8, shallow: 0x8fe0d6, opacity: 0.9 }); root.add(p); ctx.registerWater(p); }

    // ---------------------------------------------------------------- Perfumers' quarter: awnings, stills, small domed workshops
    const PQ = [-30, 62];
    for (let i = 0; i < 9; i++) { const x = PQ[0] - 18 + (i % 3) * 12, z = PQ[1] - 12 + Math.floor(i / 3) * 12, y = H(x, z), col = [0xf0a0c0, 0xc8a8f0, 0xf8d890][i % 3]; b.box(plaster, x, y - 1, z, 8, 6.4, 7, 0, jit(0xfff1e6, rr)); b.box(marble, x, y + 5.2, z, 8.7, 0.5, 7.7, 0, 0xfffaf0); b.dome(glaze, x, y + 5.7, z, 3.8, { seg: 14, color: col }); b.sphere(gold, x, y + 9.4, z, 0.3, { seg: 5 }); b.box(awning, x, y + 3.2, z + 4.5, 7, 0.16, 2.6, 0, col, -0.12); b.box(windowG, x, y + 1.2, z + 3.55, 1.6, 2.2, 0.12); for (const s of [-1, 1]) b.cyl(wood, x + s * 3.2, y, z + 5.6, 0.1, 3.2, { seg: 4, color: 0xd8b88a }); b.cyl(gold, x + 2.5, y + 5.7, z - 2, 0.5, 1.0, { seg: 7 }); }
    b.cyl(marble, PQ[0] + 14, H(PQ[0] + 14, PQ[1]) - 1, PQ[1] - 14, 2, 13, { seg: 12, color: 0xfffaf0, top: 0.8 }); b.cone(silver, PQ[0] + 14, H(PQ[0] + 14, PQ[1]) + 12, PQ[1] - 14, 2.3, 4, { seg: 10 });

    // ---------------------------------------------------------------- Temples & Magisters' hall
    const TT = [78, -34], ty = H(...TT);                                            // Temple of Trade: broad columned hall, golden dome
    b.extrude(stone, [[TT[0] - 20, TT[1] - 14], [TT[0] + 20, TT[1] - 14], [TT[0] + 20, TT[1] + 14], [TT[0] - 20, TT[1] + 14]], ty - 5, 5.6, 0xfff6e6);
    for (let i = 0; i < 4; i++) b.box(stone, TT[0], ty - 0.4 + i * 0.0, TT[1] + 14.5 + (3 - i) * 1.1, 26, 0.45 * (i + 1) * 0.5 + 0.3, 1.2, 0, 0xf6ead4);
    b.box(marble, TT[0], ty + 0.6, TT[1], 30, 9, 20, 0, 0xfffaf0); b.box(marble, TT[0], ty + 9.4, TT[1], 31.6, 0.8, 21.6, 0, 0xf6ead4); b.prism(tile, TT[0], ty + 10, TT[1], 32, 5, 22, 0, 0xe6c78a);
    for (let i = -6; i <= 6; i++) { b.cyl(marble, TT[0] + i * 2.4, ty + 0.6, TT[1] + 12, 0.5, 8, { seg: 10, top: 0.9, color: 0xfffaf0 }); } b.box(marble, TT[0], ty + 8.6, TT[1] + 12, 32, 0.8, 2.4, 0, 0xfffaf0);
    b.cyl(marble, TT[0], ty + 14.6, TT[1], 5, 5, { seg: 18, color: 0xfffaf0 }); b.cyl(marble, TT[0], ty + 19.4, TT[1], 5.6, 0.6, { seg: 18, color: 0xf6ead4 }); b.dome(gold, TT[0], ty + 20, TT[1], 5.4, { seg: 18 }); b.cyl(gold, TT[0], ty + 25.4, TT[1], 0.25, 3, { seg: 4 }); for (let k = 0; k < 6; k++) { const a = k * 1.047; b.box(windowG, TT[0] + Math.cos(a) * 5.02, ty + 17, TT[1] + Math.sin(a) * 5.02, 0.15, 2, 1.0, -a); }
    for (let i = -2; i <= 2; i++) b.box(windowG, TT[0] + i * 5.6, ty + 4.2, TT[1] + 10.05, 1.2, 3.2, 0.12);
    const RTm = [-24, -78], ry0 = H(...RTm);                                         // red temple of R'hllor: orange-red stepped tower with braziers
    b.box(stone, RTm[0], ry0 - 1, RTm[1], 22, 2.4, 22, 0, 0xf0e0c8);
    for (let i = 0; i < 4; i++) { b.box(plaster, RTm[0], ry0 + i * 5, RTm[1], 16 - i * 3, 5, 16 - i * 3, 0.2 * i, [0xe0603e, 0xd9573a, 0xe8744a, 0xd04a30][i]); b.box(marble, RTm[0], ry0 + i * 5 + 4.7, RTm[1], 16.8 - i * 3, 0.4, 16.8 - i * 3, 0.2 * i, 0xf6d8b0); }
    b.cone(gold, RTm[0], ry0 + 20, RTm[1], 3, 6, { seg: 12 }); for (const [ox, oz] of [[-9, -9], [9, -9], [-9, 9], [9, 9]]) { b.cyl(plaster, RTm[0] + ox, ry0, RTm[1] + oz, 1.4, 7, { seg: 8, top: 0.8, color: 0xc4482e }); b.cyl(gold, RTm[0] + ox, ry0 + 7, RTm[1] + oz, 1.3, 0.5, { seg: 8 }); }
    b.box(dark, RTm[0], ry0 + 0.2, RTm[1] + 8.05, 3, 4, 0.2, 0.0); b.box(windowG, RTm[0], ry0 + 0.4, RTm[1] + 8.12, 2.2, 3.4, 0.15, 0.0);
    const MH = [40, -82], mh = H(...MH);                                             // Magisters' hall (interpretation): white colonnaded hall with silver dome
    b.box(stone, MH[0], mh - 1, MH[1], 40, 2.4, 26, 0, 0xf6ead4); b.box(marble, MH[0], mh + 0.5, MH[1], 36, 13, 20, 0, 0xfffaf0); b.box(marble, MH[0], mh + 13.2, MH[1], 37.6, 0.8, 21.6, 0, 0xf3e6d0); b.prism(tile, MH[0], mh + 13.8, MH[1], 38, 6, 22, 0, 0xc8caf0);
    for (let i = -7; i <= 7; i++) b.cyl(marble, MH[0] + i * 2.4, mh + 0.5, MH[1] + 11.5, 0.5, 10, { seg: 10, top: 0.9, color: 0xfffaf0 }); b.box(marble, MH[0], mh + 10.5, MH[1] + 11.5, 36, 0.8, 2.4, 0, 0xfffaf0);
    b.cyl(marble, MH[0], mh + 19.8, MH[1], 6.4, 1.2, { seg: 20, color: 0xf3e6d0 }); b.dome(silver, MH[0], mh + 21, MH[1], 7, { seg: 20 }); b.cyl(silver, MH[0], mh + 28, MH[1], 0.25, 3, { seg: 4 });
    for (const s of [-1, 1]) { K.tower(b, MH[0] + s * 22, MH[1], { r: 3, h: 30, y: mh, mat: marble, roofMat: silver, roof: 'spire', roofH: 12, seg: 12, windows: true, color: 0xfffaf0, taper: 0.8 }); for (const k of [0.4, 0.7]) b.cyl(marble, MH[0] + s * 22, mh + 30 * k, MH[1], 3 * (1 - 0.2 * k) + 0.35, 0.5, { seg: 12, color: 0xf3e6d0 }); }
    for (let i = -3; i <= 3; i++) b.box(windowG, MH[0] + i * 4.6, mh + 4, MH[1] + 10.05, 1.2, 3.4, 0.12);
    // ---------------------------------------------------------------- Galley yards (north arm) and palm shore (south beach)
    const GY = [-30, -118];
    for (let i = 0; i < 5; i++) { const x = GY[0] - 24 + i * 12, yy = Math.max(H(x, GY[1]), 1); b.box(plaster, x, yy - 0.6, GY[1], 9, 5.6, 22, 0, jit(0xf0d8b0, rr)); b.prism(tile, x, yy + 5, GY[1], 10, 3.6, 23, 0, jit(PAS[i + 1].roof, rr)); b.box(dark, x, yy - 0.4, GY[1] + 11.05, 4.6, 4.4, 0.2, 0); }
    for (const sx of [-4, 4]) { const x = GY[0] + sx * 7, z = GY[1] + 22; for (let k = 0; k < 7; k++) { b.box(wood, x, Math.max(H(x, z + k * 2), 1), z + k * 2, 0.35, 3.6 - Math.abs(k - 3) * 0.3, 0.35, 0, 0xc09a6a); b.box(wood, x, Math.max(H(x, z), 1) + 3.5 - Math.abs(k - 3) * 0.3, z + k * 2, 3.6 - Math.abs(k - 3) * 0.5, 0.25, 0.35, 0, 0xc09a6a); } }   // half-built hulls on the slips
    const land = (x, z) => H(x, z) < 0.9 || cove(x, z) < COVE[2];
    trees(b, { rng: K.rng(9), count: q.dens(90), bounds: [-130, 110, 150, 175], heightAt: H, species: 'palm', minDist: 6, avoid: land });
    trees(b, { rng: K.rng(10), count: q.dens(50), bounds: [-140, -176, 100, -110], heightAt: H, species: 'palm', minDist: 7, avoid: (x, z) => land(x, z) || cove(x, z) < COVE[2] + 4 || Math.hypot(x - GY[0], z - GY[1]) < 34 });
    trees(b, { rng: K.rng(11), count: q.dens(150), bounds: [150, -130, 260, 130], heightAt: H, species: 'olive', minDist: 6.5, avoid: (x, z) => H(x, z) < 1 });
    trees(b, { rng: K.rng(12), count: q.dens(40), bounds: [-190, -150, 190, 150], heightAt: H, species: 'cypress', minDist: 9, avoid: (x, z) => H(x, z) < 1.2 || ((x - 40) / 132) ** 2 + (z / 124) ** 2 < 1 });
    root.add(b.build({}));

    // ---------------------------------------------------------------- life: striped-colour galleys, gulls, perfume haze, walkers, lanterns
    const mk = (type, len, hull, sail) => { const s = K.ship(type, { len, hull, sail }); root.add(s); return s; };
    const hulls = [0xe85a70, 0x2aa7b8, 0xf0b040, 0x9a6ad0, 0x3a8a5a, 0xf08050], sails = [0xfde0e8, 0xe6f0ff, 0xfff0c8, 0xe8dcf6];
    const moored = []; for (let i = 0; i < 8; i++) { const a = -1.15 + ((3 * i + 4.5) / 28) * 2.3, r = COVE[2] - 15 - (i % 2) * 12, s = mk('galley', 14, hulls[i % 6], sails[i % 4]); s.position.set(COVE[0] + Math.cos(a) * r, 0.25, Math.sin(a) * r / 1.08); s.rotation.y = Math.PI - a; moored.push(s); }
    const sailers = [mk('galley', 17, 0xe85a70, 0xfff4e0), mk('cog', 14, 0x2aa7b8, 0xfde0e8), mk('galley', 16, 0xf0b040, 0xe6f0ff)];
    const path = [[-330, 60], [-240, 30], [-170, 8], [-110, 4], [-80, 0]]; const pl = K.polyLength(path);
    ctx.onUpdate((dt, t) => {
      sailers.forEach((s, i) => { const u = (((t * 0.012) + i / 3) % 1) * pl, p = K.pointAlong(path, u); s.position.set(p.x, 0.25, p.z + (i - 1) * 24); s.rotation.y = p.angle; K.animateShip(s, t, i * 2); });
      moored.forEach((s, i) => K.animateShip(s, t, i));
    });
    root.add(K.smoke(placed.filter((_, i) => i % 9 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 3, p.z]), { size: 14, rise: 9, opacity: 0.16, color: 0xf6ece6 }));
    root.add(K.smoke([[PH[0], phY + 4, PH[1]], [PH[0] + 12, phY + 4, PH[1]], [PQ[0], 8, PQ[1]], [PQ[0] + 14, 14, PQ[1] - 14], [GA[0], H(...GA) + 3, GA[1]]], { size: 40, rise: 12, opacity: 0.14, color: 0xf6c8e0, perStack: 8, spread: 8 })); // perfume haze
    const gulls = K.birds({ center: [-80, 45, 0], radius: 100, count: q.dens(14), color: 0xffffff, size: 1.3, spreadY: 16, seed: 3 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const wk = K.walkers({ paths: [quay, streets[1], streets[3], streets[5], ringSt.slice(0, 16), ringSt.slice(14)], heightAt: H, count: q.dens(70), rng: K.rng(5), colors: [0xf0c0d0, 0xf8e0b0, 0xc8d8f0, 0xe8d0f0, 0xffffff, 0xd8a070] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const lamps = []; for (let i = 0; i < quay.length; i += 4) lamps.push([quay[i][0], 5.2, quay[i][1]]); for (let i = 0; i < 5; i++) lamps.push([PH[0] - 18 + i * 9, phY + 4, PH[1] + 1.6]);
    const lf = K.fires(lamps, { size: 3.4, light: 0, color: 0xff9ac0 }); root.add(lf); ctx.onUpdate((dt, t) => lf.userData.update?.(t));
    root.add(K.banners([[PH[0], phY + 16, PH[1] - 12, 0xf08ab0], [TT[0], ty + 28, TT[1], 0xe6c06a], [MH[0] - 22, mh + 40, MH[1], 0xdfe6ee], [MH[0] + 22, mh + 40, MH[1], 0xdfe6ee], [gate[0], H(...gate) + 28, gate[1], 0xf0a0c0]].map(([x, y, z, color]) => ({ x, y, z, w: 3, h: 7, color, ry: 0.3 }))));
    const cl = K.clouds({ y: 240, extent: 700, count: 8, opacity: 0.3, color: 0xfff6ee }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 260, center: [20, 0, 0], minDistance: 18,
      hero: { pos: [-190, 88, 118], target: [25, 12, -5] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x6a74b0, horizon: 0xf8c0b4, fog: 0xecc2b8, fogD: 0.0012, sunC: 0xffc090, sunI: 2.9, hemiSky: 0xc0b4dc, hemiGround: 0x7a5a58, hemiI: 0.85 },
        day: { top: 0x58a6de, horizon: 0xfff0e4, fog: 0xf4e6e2, fogD: 0.0011, sunC: 0xfff2de, sunI: 3.2, hemiSky: 0xc4dcf4, hemiGround: 0x9a8070, hemiI: 1.2 },
        dusk: { top: 0x4a4488, horizon: 0xf4a090, fog: 0xdc9aa4, fogD: 0.0013, sunC: 0xff9a78, sunI: 2.9, hemiSky: 0xb0a0d4, hemiGround: 0x7a5a62, hemiI: 1.0 },
        night: { top: 0x0e1240, horizon: 0x34407a, fog: 0x242e58, fogD: 0.0017, sunC: 0xb4c4f8, sunI: 1.9, hemiSky: 0x7a88cc, hemiGround: 0x403a58, hemiI: 1.35 },
      } },
      landmarks: {
        'lysene-harbour': lm(-60, 0, 40, 6), 'city-walls': lm(gate[0], gate[1], 20, 22), 'pillow-houses': lm(PH[0], PH[1], 22, 12), 'pleasure-gardens': lm(GA[0], GA[1], 24, 10),
        'perfumers-quarter': lm(PQ[0], PQ[1], 20, 12), 'temple-of-trade': lm(TT[0], TT[1], 20, 26), 'red-temple': lm(RTm[0], RTm[1], 14, 24), 'magisters-hall': lm(MH[0], MH[1], 22, 26),
        'palm-shore': lm(-10, 150, 40, 8), 'galley-yards': lm(GY[0], GY[1], 28, 10),
      },
      cutaways: [],
    };
  },
};
