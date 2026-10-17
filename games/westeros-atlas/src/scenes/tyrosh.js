// Tyrosh — the dyed island city north of the Stepstones. Book/TWOIAF anchors: harbour city on an island, high walls with inner walls of
// fused black dragonstone, a large fleet, the Bleeding Tower at the harbour mouth, the Fountain of the Drunken God, the Temple of Trios,
// bright colours (dyed hair and beards), skilled craftsmen of ornate armour. Plan, shapes and colours are interpretation (see content/tyrosh.js).
// Polish pass: dye-lot colour families (madder, saffron, indigo, tyrian, verdigris) assigned by district so saturated blocks stay harmonious
// against cream plaster, a glossy black citadel with spired turrets, dye runoff streaking toward the sea, banded walls, warm lantern glow.
import * as K from '../kit/index.js';
const { THREE, Batch, tri, flat, glow } = K;

const _hsl = {};
function jit(hex, r, dh = 0.012, ds = 0.07, dl = 0.05) { const c = new THREE.Color(hex); c.getHSL(_hsl); return c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, K.clamp(_hsl.s + r.range(-ds, ds), 0, 1), K.clamp(_hsl.l + r.range(-dl, dl), 0, 1)); }
const shade = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const rot = (dx, dz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return [dx * c + dz * s, -dx * s + dz * c]; };

const treeMat = flat(0xffffff, { rough: 1, flatShading: false }), trunkMat = flat(0x6b5238, { rough: 1 });
function trees(b, { rng = K.rng(1), count = 50, bounds, heightAt = () => 0, avoid, species = 'oak', scale = [0.8, 1.2], minDist = 4, tint }) {
  const pts = K.scatter({ rng, count, bounds, minDist, avoid });
  const greens = { oak: [0x6b8a3a, 0x7a9a45, 0x5c7a34], cypress: [0x2f4f3a, 0x38583f, 0x2a4634], pine: [0x3c5a3a, 0x486a40], olive: [0x8a9a62, 0x7d8f58, 0x6f8450] }[species];
  for (const [x, z] of pts) {
    const k = rng.range(scale[0], scale[1]), y = heightAt(x, z), gc = jit(tint ?? rng.pick(greens), rng, 0.012, 0.06, 0.05);
    if (species === 'cypress') { b.cyl(trunkMat, x, y, z, 0.3 * k, 1.4 * k, { seg: 5 }); b.cone(treeMat, x, y + 1.0 * k, z, 1.5 * k, 8.5 * k, { seg: 7, color: gc }); }
    else if (species === 'pine') { b.cyl(trunkMat, x, y, z, 0.4 * k, 2.2 * k, { seg: 5 }); b.cone(treeMat, x, y + 1.6 * k, z, 2.2 * k, 6 * k, { seg: 7, color: gc }); }
    else { b.cyl(trunkMat, x, y, z, 0.35 * k, 2.2 * k, { seg: 5, color: 0x7a6a56 }); b.sphere(treeMat, x, y + 1.8 * k, z, 2.2 * k, { seg: 7, sy: 0.7, color: gc }); b.sphere(treeMat, x + 1.0 * k, y + 2.4 * k, z - 0.6 * k, 1.5 * k, { seg: 6, sy: 0.7, color: shade(gc.getHex(), 1.12) }); }
  }
  return pts;
}

const CIT = [-18, -34];                                    // citadel hill (inner walls)
const COVE = [62, 70, 58];
const CHAN = [[62, 70], [96, 100], [130, 130], [180, 175]];
const cove = (x, z) => Math.hypot(x - COVE[0], z - COVE[1]);
// dye lots: madder red, saffron, indigo, tyrian purple, verdigris, weld yellow, sea green, cream
const DY = { madder: 0xc9452f, saffron: 0xe9a23a, indigo: 0x2f5aa6, tyrian: 0x82418f, verd: 0x2a9c98, weld: 0xe8c84a, green: 0x3f9a6a, cream: 0xf4ead8, rose: 0xd8647a };
const TERRA = [0xb9583a, 0xc4663f, 0xa84e36], SLATE = [0x45557a, 0x3a4a68], VERDR = [0x3a8a86, 0x2f7a78];
// dyed stucco walls under restrained roofs: vividness lives in the walls and cloth, harmony in the roofs
const FAM = [
  { walls: [DY.madder, 0xd8604a, DY.cream, DY.rose], roofs: [...TERRA, ...SLATE] },
  { walls: [DY.indigo, 0x4a78c0, DY.cream, DY.verd], roofs: [...TERRA, 0xd8c8a8] },
  { walls: [DY.saffron, DY.weld, DY.cream, 0xf0b860], roofs: [...VERDR, ...SLATE, TERRA[0]] },
  { walls: [DY.verd, DY.green, DY.cream, 0x5ab8a8], roofs: [...TERRA, 0x8a5a46] },
  { walls: [DY.tyrian, DY.rose, DY.cream, 0xa86ab0], roofs: [...SLATE, ...TERRA.slice(0, 2), VERDR[0]] },
];

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(5051);
    const heightAt = (x, z) => {
      const d = Math.hypot((x + 5) / 195, z / 152) + (K.fbm(x * 0.012, z * 0.012, 3, 3) - 0.5) * 0.12, t = 1 - d;
      let h0 = 2 + (K.fbm(x * 0.02, z * 0.02, 3, 6) - 0.5) * 4;
      const hd = Math.hypot(x - CIT[0], z - CIT[1]); h0 += 38 * (1 - K.smoothstep(8, 92, hd)) + 8 * (1 - K.smoothstep(10, 60, Math.hypot(x + 110, z - 20)));
      let h = -7 + K.smoothstep(0.0, 0.1, t) * (h0 + 7.2);
      const cd = cove(x, z); if (cd < COVE[2] + 18) h = Math.min(h, -6 + K.smoothstep(COVE[2] - 26, COVE[2] + 18, cd) * (h + 6));
      const dc = K.distToPolyline(x, z, CHAN).d; if (dc < 40) h = Math.min(h, -6 + K.smoothstep(16, 40, dc) * (h + 6));
      // the Stepstones: a chain of bare rocks to the east
      for (const [rx, rz, rr2, rh] of ROCKS) { const rd = Math.hypot(x - rx, z - rz); if (rd < rr2) h = Math.max(h, -6 + (rh + 6) * (1 - K.smoothstep(rr2 * 0.2, rr2, rd))); }
      return h;
    };
    const sandC = new THREE.Color(0xe8d4a8), rockC = new THREE.Color(0xc8a47c), scrub = new THREE.Color(0x9ea866), duskC = new THREE.Color(0x8c7a62), seabed = new THREE.Color(0x3f96a0), pave = new THREE.Color(0xe2cfa8), wet = new THREE.Color(0xc0aa82), c = new THREE.Color();
    root.add(K.terrain({ size: 1500, seg: q.seg(190), heightAt, kind: 'rock', scale: 18, colorAt: (x, z, h, s) => {
      if (h < 0) return c.copy(seabed).lerp(sandC, K.clamp(1 + h / 2.5, 0, 1));
      c.copy(sandC).lerp(scrub, K.smoothstep(0.8, 5, h)); c.lerp(rockC, K.clamp(s * 3.2 + h * 0.012, 0, 0.8)); c.lerp(duskC, K.clamp(K.fbm(x * 0.05, z * 0.05, 2, 2) - 0.45, 0, 0.5));
      c.lerp(pave, 0.7 * (1 - K.smoothstep(0.8, 1.0, ((x + 5) / 150) ** 2 + (z / 120) ** 2)) * K.smoothstep(1, 2.4, h));
      if (h < 1) c.lerp(wet, 0.5 * K.clamp((1 - h), 0, 1));
      return c;
    } }));
    const wopt = { deep: 0x146aa0, shallow: 0x56c4c8, opacity: 0.9, choppy: 0.4, speed: 0.55 };
    const wat = K.water({ w: 1500, d: 1500, seg: q.seg(130), level: 0, heightAt, ...wopt });
    root.add(wat); ctx.registerWater(wat);
    for (const [cx, cz, w, d] of [[0, -2250, 8000, 3000], [0, 2250, 8000, 3000], [-2250, 0, 3000, 1500], [2250, 0, 3000, 1500]]) { const sk = K.water({ w, d, seg: 2, level: 0, heightAt: () => -8, center: [cx, cz], ...wopt }); root.add(sk); ctx.registerWater(sk); }

    // materials (near-white tints; colour in the per-object arg)
    const plaster = tri('plaster', { color: 0xffffff, scale: 5, snow: false }), tile = tri('tile', { color: 0xffffff, scale: 8, snow: false, rough: 0.7, bump: 0.6 });
    const stone = tri('stone', { color: 0xf0e6d0, scale: 8, snow: false, bump: 0.6 }), cobble = tri('cobble', { color: 0xf0e0c0, scale: 8, snow: false });
    const wood = tri('wood', { color: 0xd8c0a0, scale: 4, snow: false }), marble = tri('marble', { color: 0xfaf2e6, scale: 7, snow: false, rough: 0.4 });
    const drag = tri('stone', { color: 0x6a667a, scale: 5, rough: 0.5, metal: 0, snow: false, bump: 0.5 }), dragCap = flat(0x2a2836, { rough: 0.3, metal: 0.12, flatShading: false });
    const gold = flat(0xe6c06a, { rough: 0.4, metal: 0.25, flatShading: false }), iron = flat(0x3a3f48, { rough: 0.5, metal: 0.3, flatShading: false });
    const windowG = glow(0xffc46b), lan = glow(0xffa84a, 1.3), emb = glow(0xff6a2a, 1.4), plain = flat(0xffffff, { rough: 0.9, flatShading: false }), cloth = flat(0xffffff, { rough: 1, side: THREE.DoubleSide, flatShading: false }), dark = flat(0x2a1d1a, { rough: 1 });
    const b = new Batch(), H = heightAt;
    const LAND = (x, z) => H(x, z) > 1.2;

    // ---------------------------------------------------------------- outer walls (landward arc) & inner black dragonstone walls
    const outer = []; for (let i = 0; i <= 40; i++) { const a = Math.PI * 0.62 + (i / 40) * Math.PI * 1.55; outer.push([-5 + Math.cos(a) * 150, Math.sin(a) * 118]); }
    const outerOK = outer.filter(([x, z]) => LAND(x, z) && cove(x, z) > COVE[2] + 12 && K.distToPolyline(x, z, CHAN).d > 24);
    K.wall(b, outerOK, { h: 13, t: 4.4, mat: stone, capMat: stone, heightAt: H, closed: false, sink: 6, color: 0xfff0d8 });
    for (let i = 0; i < outerOK.length - 1; i++) {
      const [x0, z0] = outerOK[i], [x1, z1] = outerOK[i + 1], dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz); if (l > 30) continue;
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ry = K.headingX(dx, dz), g = Math.min(H(x0, z0), H(x1, z1)), top = Math.max(H(x0, z0), H(x1, z1)) + 13;
      b.box(stone, mx, g - 2, mz, l + 0.4, 3.8, 5.8, ry, 0xe6d8bc); b.box(stone, mx, g + 6, mz, l + 0.3, 0.6, 4.9, ry, DY.madder === 0 ? 0 : 0xf6ead2); b.box(plain, mx, g + 6.6, mz, l + 0.3, 0.9, 4.7, ry, 0xc9452f); b.box(stone, mx, top - 0.9, mz, l + 0.3, 0.9, 5.2, ry, 0xf8ecd6);   // madder-red banding
    }
    outerOK.forEach(([x, z], i) => { if (i % 4 === 0) { const y = H(x, z), col = FAM[(i >> 2) % 5].roofs[0]; K.squareTower(b, x, z, { w: 8, h: 21, y, mat: stone, roofMat: tile, roof: 'flat', windows: false, color: 0xfff0d8 }); b.box(stone, x, y + 19, z, 9.8, 1.0, 9.8, 0, 0xf2e2c6); b.pyramid(tile, x, y + 22, z, 6.4, 4.4, 6.4, 0, col); b.sphere(lan, x, y + 26.8, z, 0.5, { seg: 5 }); for (const sd of [-1, 1]) { b.box(windowG, x + sd * 4.05, y + 12, z, 0.15, 2.2, 0.9, 0); b.box(windowG, x, y + 12, z + sd * 4.05, 0.9, 2.2, 0.15, 0); } } });
    const outerGate = outerOK[Math.floor(outerOK.length * 0.25)];
    K.gatehouse(b, outerGate[0], outerGate[1], { y: H(...outerGate), ry: 0, mat: stone, roofMat: tile, w: 18, d: 9, h: 20, gate: 6, wood, towerR: 4.4, color: 0xfff0d8, roofColor: DY.madder });
    b.box(plain, outerGate[0], H(...outerGate) + 20, outerGate[1], 19, 0.9, 10, 0, DY.indigo);
    const inner = []; for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; inner.push([CIT[0] + Math.cos(a) * 44, CIT[1] + Math.sin(a) * 38]); }
    K.wall(b, inner, { h: 15, t: 4, mat: drag, capMat: dragCap, heightAt: H, closed: true, sink: 6, merlon: 1.4, color: 0xc8c4e0 });
    for (let i = 0; i < inner.length; i++) { const [x0, z0] = inner[i], [x1, z1] = inner[(i + 1) % inner.length], dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ry = K.headingX(dx, dz), g = Math.min(H(x0, z0), H(x1, z1)); b.box(drag, mx, g - 2.5, mz, l + 0.4, 4.6, 5.2, ry, 0x9a96b8); b.box(drag, mx, Math.max(H(x0, z0), H(x1, z1)) + 14, mz, l + 0.3, 1.0, 4.7, ry, 0xb4b0d0); }
    inner.forEach(([x, z], i) => { if (i % 3 === 0) { const y = H(x, z); K.tower(b, x, z, { r: 4.2, h: 23, y, mat: drag, roofMat: dragCap, roof: 'spire', roofH: 12, seg: 10, windows: false, color: 0xc8c4e0, taper: 0.8, crenel: false }); b.cyl(drag, x, y + 12, z, 3.9, 0.7, { seg: 10, color: 0xb4b0d0 }); b.box(emb, x, y + 16, z + 3.2, 0.5, 2, 0.15, 0); b.box(emb, x, y + 16, z - 3.2, 0.5, 2, 0.15, 0); } });
    K.gatehouse(b, inner[13][0], inner[13][1], { y: H(...inner[13]), ry: 0, mat: drag, roofMat: dragCap, w: 16, d: 8, h: 19, gate: 5, wood, towerR: 4, color: 0xc8c4e0 });
    // citadel (black dragonstone keep inside the inner walls)
    const CY = H(...CIT);
    K.keep(b, CIT[0] - 4, CIT[1] - 4, { w: 30, d: 24, h: 26, y: CY, mat: drag, roofMat: dragCap, turretR: 3.2, turretH: 8, roof: 'flat', color: 0xc8c4e0 });
    b.box(drag, CIT[0] - 4, CY - 3, CIT[1] - 4, 34, 6, 28, 0, 0x9a96b8); b.box(drag, CIT[0] - 4, CY + 13, CIT[1] - 4, 31, 0.9, 25, 0, 0xb4b0d0);
    for (const [ox, oz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) b.cone(dragCap, CIT[0] - 4 + ox * 15, CY + 36, CIT[1] - 4 + oz * 12, 3.6, 9, { seg: 10 });
    b.box(drag, CIT[0] + 22, CY, CIT[1] + 10, 14, 11, 12, 0, 0xc8c4e0); b.box(drag, CIT[0] - 24, CY, CIT[1] + 12, 12, 9, 10, 0, 0xc8c4e0); b.prism(dragCap, CIT[0] + 22, CY + 11, CIT[1] + 10, 15, 4, 13, 0, 0xa4a0c4); b.prism(dragCap, CIT[0] - 24, CY + 9, CIT[1] + 12, 13, 4, 11, 0, 0xa4a0c4);
    b.cone(dragCap, CIT[0] - 4, CY + 26, CIT[1] - 4, 6, 14, { seg: 12 }); b.sphere(emb, CIT[0] - 4, CY + 40.6, CIT[1] - 4, 0.8, { seg: 6 });
    for (let i = -4; i <= 4; i++) b.box(drag, CIT[0] - 4 + i * 3.6, CY + 1, CIT[1] + 8.2, 1.0, 24, 0.9, 0, 0xb4b0d0);
    for (let i = -3; i <= 3; i++) b.box(windowG, CIT[0] - 4 + i * 3.6, CY + 8, CIT[1] + 8.1, 0.9, 3.2, 0.12);
    for (let i = -2; i <= 2; i++) b.box(emb, CIT[0] - 4 + i * 5, CY + 18, CIT[1] + 8.1, 0.7, 2.6, 0.1);

    // ---------------------------------------------------------------- harbour: quays, galley arsenal, the Bleeding Tower
    const quay = []; for (let i = 0; i <= 22; i++) { const a = Math.PI * 0.95 + (i / 22) * Math.PI * 1.1; quay.push([COVE[0] + Math.cos(a) * (COVE[2] + 2), COVE[1] + Math.sin(a) * (COVE[2] + 2)]); }
    const quayOK = quay.filter(([x, z]) => K.distToPolyline(x, z, CHAN).d > 20 && H(x, z) > 0.5);
    b.ribbon(cobble, quayOK, 8, H, 0.3, 0xf0e2c0);
    for (let i = 0; i < quayOK.length - 1; i++) { const [x0, z0] = quayOK[i], [x1, z1] = quayOK[i + 1], dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz), ang = Math.atan2(z0 - COVE[1], x0 - COVE[0]); b.box(stone, (x0 + x1) / 2 - Math.cos(ang) * 4.5, 0.0, (z0 + z1) / 2 - Math.sin(ang) * 4.5, l + 0.2, 0.6, 1.2, K.headingX(dx, dz), 0xf6ead2); }
    quayOK.forEach(([x, z], i) => { const ang = Math.atan2(z - COVE[1], x - COVE[0]); if (i % 2 === 0) K.pier(b, x, 0.9, z, { len: 22 + (i % 3) * 5, w: 3, ry: -ang + Math.PI, mat: wood, color: 0xc9a77a }); if (i % 2) { b.cyl(wood, x, 0.4, z, 0.12, 3.6, { seg: 4, color: 0x6a4a30 }); b.sphere(lan, x, 4.2, z, 0.4, { seg: 5 }); } });
    const AR = [-34, 98], ay = Math.max(H(...AR), 1.2);                    // arsenal: long galley sheds on the shore (interpretation)
    for (let i = 0; i < 6; i++) { const x = AR[0] - 30 + i * 11, yy = Math.max(H(x, AR[1]), 1.2), col = [DY.madder, DY.saffron, DY.indigo, DY.green, DY.weld, DY.tyrian][i]; b.box(plaster, x, yy - 0.6, AR[1], 9, 6.6, 26, 0, shade(0xf0dcc0, 1)); b.box(plain, x, yy + 3.2, AR[1] + 13.02, 8, 0.7, 0.1, 0, col); b.prism(tile, x, yy + 6, AR[1], 10, 4, 27, 0, col); b.box(dark, x, yy - 0.4, AR[1] + 13.05, 5.2, 5, 0.2, 0); }
    K.tower(b, AR[0] + 22, AR[1], { r: 3, h: 22, y: ay, mat: stone, roofMat: tile, roof: 'cone', roofH: 7, seg: 10, windows: true, roofColor: DY.madder, color: 0xf6ead2, taper: 0.84 });
    // Bleeding Tower at the east side of the harbour mouth, red-streaked, with a beacon
    const BT = [146, 90], bty = Math.max(H(...BT), 1.0);
    K.tower(b, BT[0], BT[1], { r: 7, h: 44, y: bty, mat: stone, roofMat: tile, roof: 'flat', seg: 14, windows: true, color: 0xf6e8d2, taper: 0.86 });
    for (let i = 0; i < 14; i++) { const a = i * 0.45; b.box(plain, BT[0] + Math.cos(a) * 6.0, bty + 14 + (i % 4) * 7, BT[1] + Math.sin(a) * 6.0, 0.9, 11 + (i % 3) * 5, 0.5, -a + Math.PI / 2, i % 2 ? 0x9a1c1c : 0xb62a22); }
    b.cyl(stone, BT[0], bty - 2, BT[1], 8.8, 5, { seg: 14, top: 0.8, color: 0xe6d8bc }); b.cyl(stone, BT[0], bty + 44, BT[1], 5.4, 2.6, { seg: 14, top: 1.15, color: 0xf2e2c6 }); b.cone(iron, BT[0], bty + 47, BT[1], 4, 3.4, { seg: 10 }); b.sphere(emb, BT[0], bty + 48.6, BT[1], 1.4, { seg: 7 });
    b.box(stone, BT[0] - 11, bty, BT[1] + 3, 12, 6, 10, 0, 0xe8d8c0); b.box(stone, BT[0] + 9, bty, BT[1] - 4, 8, 5, 8, 0, 0xe8d8c0); b.prism(tile, BT[0] - 11, bty + 6, BT[1] + 3, 13, 3, 11, 0, DY.madder);

    // ---------------------------------------------------------------- the city: saturated houses packed on the slope
    const SQ = [34, -4], DW = [-108, 36];
    const streets = [[[SQ[0], SQ[1]], [10, 20], [-4, 50], [-20, 90]], [[SQ[0], SQ[1]], [60, -20], [100, -50], [130, -64]], [[SQ[0], SQ[1]], [14, -26], [-4, -48]], [[SQ[0], SQ[1]], [-10, 6], [-50, 14], [-96, 30]], [[SQ[0], SQ[1]], [50, 20], [70, 40]]];
    streets.forEach((s) => b.ribbon(cobble, s, 4.6, H, 0.25, 0xe8d6b0));
    const bigF = [[SQ[0], SQ[1], 20], [DW[0], DW[1], 30], [-34, 98, 22], [-52, -86, 24], [CIT[0], CIT[1], 52], [BT[0], BT[1], 18], [72, 30, 20]];
    const pts = K.scatter({ rng: K.rng(77), count: q.dens(660), bounds: [-160, -125, 150, 130], minDist: 7.0,
      avoid: (x, z) => !LAND(x, z) || ((x + 5) / 150) ** 2 + (z / 120) ** 2 > 1 || cove(x, z) < COVE[2] + 8 || K.distToPolyline(x, z, CHAN).d < 22 || streets.some((s) => K.distToPolyline(x, z, s).d < 5.6) || bigF.some(([bx, bz, br]) => Math.hypot(x - bx, z - bz) < br) });
    const placed = [];
    for (const [x, z] of pts) {
      const y = H(x, z), fam = K.noise2(x * 0.02, z * 0.02, 5) * 5.99 | 0, f = FAM[rr() < 0.2 ? rr.int(0, 4) : fam % 5];
      const w = rr.range(5, 7.4), d = w * rr.range(1, 1.25), tall = rr() < 0.28, h = tall ? rr.range(9, 12.5) : rr.range(5, 8.5), ry = -Math.atan2(z - CIT[1], x - CIT[0]) + Math.PI / 2 + rr.range(-0.07, 0.07);
      const wc = jit(rr.pick(f.walls), rr, 0.01, 0.05, 0.03), rc = jit(rr.pick(f.roofs), rr, 0.012, 0.06, 0.04), kind = rr();
      b.box(plaster, x, y - 1.2, z, w + 0.4, 2.2, d + 0.4, ry, 0xe6d6b8);
      b.box(plaster, x, y + 1, z, w, h - 1, d, ry, wc);
      if (wc.getHex() !== DY.cream && rr() < 0.5) b.box(plaster, x, y + h * 0.5, z, w + 0.12, 0.5, d + 0.12, ry, 0xf8eedc);     // cream string band on dyed walls
      b.box(plaster, x, y + h - 0.4, z, w + 0.7, 0.8, d + 0.7, ry, 0xf8eedc);
      if (kind < 0.35) b.pyramid(tile, x, y + h + 0.4, z, w + 0.8, Math.min(w, d) * 0.55 + 0.8, d + 0.8, ry, rc);
      else if (kind < 0.78) b.prism(tile, x, y + h + 0.4, z, w + 0.9, Math.min(w, d) * 0.5 + 0.8, d + 0.9, ry + (rr() < 0.5 ? 0 : Math.PI / 2), rc);
      else { b.box(plaster, x, y + h + 0.4, z, w + 0.4, 0.4, d + 0.4, ry, 0xf0e2c8); const [ax, az] = rot(0, d * 0.25, ry); b.box(cloth, x + ax, y + h + 2.1, z + az, w * 0.7, 0.14, d * 0.45, ry, jit(rr.pick([DY.madder, DY.saffron, DY.indigo, DY.verd, DY.tyrian]), rr), -0.12); for (const s of [-1, 1]) { const [px, pz] = rot(s * w * 0.33, d * 0.46, ry); b.cyl(wood, x + px, y + h + 0.8, z + pz, 0.09, 1.6, { seg: 4, color: 0x8a6a4a }); } }
      if (tall && rr() < 0.6) { const [bx, bz] = rot(0, d / 2 + 0.5, ry); b.box(wood, x + bx, y + h * 0.55, z + bz, w * 0.5, 0.2, 1.0, ry, 0x6f5036); }
      const [dpx, dpz] = rot(0, d / 2 + 0.06, ry); b.box(dark, x + dpx, y, z + dpz, 1.3, 2.3, 0.2, ry);
      for (const sd of [-1, 1]) { const [wx, wz] = rot(sd * w * 0.27, d / 2 + 0.06, ry); b.box(windowG, x + wx, y + h * 0.55, z + wz, 0.85, 1.4, 0.12, ry); }
      placed.push({ x, z, h });
    }
    // Fountain of the Drunken God: tiled square with a basin and statue
    const sy = H(...SQ);
    b.extrude(cobble, [[SQ[0] - 14, SQ[1] - 14], [SQ[0] + 14, SQ[1] - 14], [SQ[0] + 14, SQ[1] + 14], [SQ[0] - 14, SQ[1] + 14]], sy - 5, 5.2, 0xf6ead0);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) b.box(plain, SQ[0] - 12.5 + i * 5, sy + 0.32, SQ[1] - 12.5 + j * 5, 5, 0.1, 5, 0, (i + j) % 2 ? 0xc9452f : 0x2f5aa6);
    const fy = sy + 0.3; b.cyl(marble, SQ[0], fy, SQ[1], 5, 1.4, { seg: 20, color: 0xfaf2e6 }); b.cyl(marble, SQ[0], fy + 1.4, SQ[1], 1.2, 3.4, { seg: 10, color: 0xfaf2e6 }); b.cyl(marble, SQ[0], fy + 3.8, SQ[1], 2.2, 0.4, { seg: 12, color: 0xfaf2e6 });
    b.sphere(gold, SQ[0], fy + 5.2, SQ[1], 1.1, { seg: 8 }); b.box(gold, SQ[0] + 1.2, fy + 4.2, SQ[1], 1.2, 0.5, 0.5, 0, 0xffffff, 0, 0.6);
    const basin = K.waterPatch({ w: 9, d: 9, level: fy + 1.2, center: [SQ[0], SQ[1]], depth: 1, deep: 0x2aa0c0, shallow: 0x7fd8e0, opacity: 0.9 }); root.add(basin); ctx.registerWater(basin);
    // Temple of Trios: three towers joined by a triple-gabled hall (a three-headed god)
    const TT = [72, 30], ty = H(...TT);
    b.box(stone, TT[0], ty - 1, TT[1], 30, 2.4, 20, 0, 0xe6d8bc); b.box(plaster, TT[0], ty + 1, TT[1], 26, 8, 14, 0, 0xfaf2e6); b.box(plain, TT[0], ty + 8.4, TT[1], 27, 0.7, 14.8, 0, DY.cream === 0 ? 0 : 0xf0e2c8); b.prism(tile, TT[0], ty + 9, TT[1], 28, 4, 15, 0, DY.madder);
    [[-9, DY.madder], [0, DY.weld], [9, DY.indigo]].forEach(([ox, col], i) => { const th = 26 + (i === 1 ? 6 : 0); K.tower(b, TT[0] + ox, TT[1] - 9, { r: 3.4, h: th, y: ty, mat: plaster, roofMat: tile, roof: 'cone', roofH: 10, seg: 12, windows: true, color: col === DY.weld ? 0xf0d868 : shade(col, 1.15), roofColor: 0xf4ead8, crenel: false, taper: 0.82 }); b.cyl(plaster, TT[0] + ox, ty + th * 0.55, TT[1] - 9, 3.4 * 0.9 + 0.35, 0.6, { seg: 12, color: 0xf8eedc }); b.sphere(gold, TT[0] + ox, ty + th + 12.4, TT[1] - 9, 0.9, { seg: 6 }); });
    for (let i = -2; i <= 2; i++) b.box(windowG, TT[0] + i * 5, ty + 4.4, TT[1] + 7.05, 1.2, 3, 0.12);
    // Dye works: rows of vats in every colour, cloth hung to dry, on the west shore
    const vatC = [DY.madder, DY.indigo, DY.weld, DY.green, DY.tyrian, DY.saffron, DY.verd, DY.rose], dyBase = H(...DW);
    b.extrude(cobble, [[DW[0] - 24, DW[1] - 22], [DW[0] + 24, DW[1] - 22], [DW[0] + 24, DW[1] + 22], [DW[0] - 24, DW[1] + 22]], dyBase - 0.3, 0.7, 0xe6d6b8);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = DW[0] - 18 + i * 12, z = DW[1] - 15 + j * 10, col = vatC[(i + j * 2) % 8]; b.cyl(wood, x, dyBase + 0.4, z, 3.3, 1.9, { seg: 14, color: 0x9a7a58 }); b.cyl(wood, x, dyBase + 1.0, z, 3.4, 0.25, { seg: 14, color: 0x4a3524 }); b.cyl(plain, x, dyBase + 2.2, z, 2.85, 0.12, { seg: 14, color: col }); }
    b.box(plaster, DW[0] - 26, dyBase, DW[1], 6, 7, 10, 0, 0xf0d8b0); b.prism(tile, DW[0] - 26, dyBase + 7, DW[1], 7, 3, 11, 0, DY.indigo); b.box(dark, DW[0] - 22.95, dyBase, DW[1], 0.2, 3.4, 2.4, 0);
    for (const k of [0, 1, 2]) { const rx = DW[0] - 24 + k * 22; for (const s of [-1, 1]) b.cyl(wood, rx, dyBase, DW[1] + 28 + s * 6, 0.18, 9.6, { seg: 5, color: 0x6a4a30 }); }
    const cl = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) cl.push({ x: DW[0] - 24 + i * 4.4, y: dyBase + 9, z: DW[1] + 28 + r * 5, w: 3.2, h: 8, color: vatC[(i + r * 3) % 8], ry: Math.PI / 2 });
    const rn = [[DW[0] - 6, DW[1] + 24], [DW[0] - 20, DW[1] + 34], [DW[0] - 44, DW[1] + 44]]; [DY.madder, DY.indigo, DY.weld].forEach((col, k) => b.ribbon(plain, [[DW[0] - 4 + k * 4, DW[1] + 22], [DW[0] - 14 + k * 3, DW[1] + 30], [DW[0] - 32 + k * 2, DW[1] + 36], [DW[0] - 56, DW[1] + 40 + k * 4], [DW[0] - 76, DW[1] + 42 + k * 6]], 1.5, H, 0.12, col));   // dye runoff on its way to the sea
    // Armourers' row (forges with ornate helms displayed), interpretive
    const AM = [-52, -84];
    for (let i = 0; i < 4; i++) { const x = AM[0] - 15 + i * 10, y = H(x, AM[1]); b.box(stone, x, y - 0.6, AM[1], 8, 6.6, 9, 0, 0xeed8b8); b.prism(tile, x, y + 6, AM[1], 9, 3, 10, 0, 0x4a505c); b.cyl(stone, x + 2, y + 6, AM[1] - 2, 0.9, 5, { seg: 6, color: 0x6a6258 }); b.cyl(iron, x - 2, y + 0, AM[1] + 4.7, 0.2, 2.6, { seg: 4 }); b.sphere(gold, x - 2, y + 2.7, AM[1] + 4.7, 0.6, { seg: 7 }); b.box(emb, x + 0.5, y + 1.2, AM[1] + 4.55, 1.4, 1.2, 0.1, 0); b.box(dark, x + 0.5, y - 0.6, AM[1] + 4.52, 2.4, 2.2, 0.15, 0); }

    // ---------------------------------------------------------------- scrub, olives, and the Stepstones chain
    const out = (x, z) => !LAND(x, z) || ((x + 5) / 155) ** 2 + (z / 122) ** 2 < 1;
    trees(b, { rng: K.rng(5), count: q.dens(150), bounds: [-190, -150, 190, 150], heightAt: H, species: 'olive', minDist: 6.5, avoid: out });
    trees(b, { rng: K.rng(6), count: q.dens(60), bounds: [-190, -150, 190, 150], heightAt: H, species: 'cypress', minDist: 8, avoid: out });
    root.add(b.build({}));

    // ---------------------------------------------------------------- life
    const mk = (type, len, hull, sail) => { const s = K.ship(type, { len, hull, sail }); root.add(s); return s; };
    const hulls = [0x9a3a2a, 0x24488a, 0xb87a2a, 0x2a7a58, 0x6a3478, 0x2a7a7a, 0x8a3a4a], sails = [0xf2d878, 0xefe0c8, 0xf4ead8, 0x7ab0e0, 0xe8a878];
    const moored = []; for (let i = 0; i < 8; i++) { const a = Math.PI * 1.0 + (i / 7) * Math.PI * 0.95, r = COVE[2] - 24 - (i % 2) * 8, s = mk('galley', 15, hulls[i % 7], sails[i % 5]); s.position.set(COVE[0] + Math.cos(a) * r, 0.25, COVE[1] + Math.sin(a) * r); s.rotation.y = -a + Math.PI; moored.push(s); }
    const sailers = [mk('galley', 17, 0x9a3a2a, 0xf2d878), mk('cog', 14, 0x24488a, 0xf4ead8), mk('galley', 16, 0xb87a2a, 0xefe0c8), ];
    const path = [[320, 280], [250, 230], [190, 180], [130, 132], [96, 100], [66, 74]]; const pl = K.polyLength(path);
    ctx.onUpdate((dt, t) => { sailers.forEach((s, i) => { const u = (((t * 0.011) + i / 3) % 1) * pl, p = K.pointAlong(path, u); s.position.set(p.x + (i % 2) * 14, 0.25, p.z - (i % 2) * 8); s.rotation.y = p.angle; K.animateShip(s, t, i * 2); }); moored.forEach((s, i) => K.animateShip(s, t, i)); });
    root.add(K.smoke(placed.filter((_, i) => i % 6 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 3, p.z]), { size: 14, rise: 11, opacity: 0.18, color: 0xdcd0c0 }));
    root.add(K.smoke([[AM[0] - 12, H(...AM) + 12, AM[1]], [AM[0] - 2, H(...AM) + 12, AM[1]], [AM[0] + 8, H(...AM) + 12, AM[1]], [DW[0], dyBase + 3, DW[1]]], { size: 22, rise: 14, opacity: 0.3, color: 0x8a8a94, perStack: 8 }));
    const gulls = K.birds({ center: [80, 50, 90], radius: 100, count: q.dens(14), color: 0xffffff, size: 1.3, spreadY: 16, seed: 3 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const wk = K.walkers({ paths: [quayOK, streets[0], streets[1], streets[3], [[SQ[0] - 16, SQ[1] + 14], [SQ[0] + 16, SQ[1] + 14]]], heightAt: H, count: q.dens(70), rng: K.rng(5), colors: [DY.madder, DY.indigo, DY.weld, DY.green, DY.tyrian, DY.saffron, DY.cream] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const pennants = []; for (let i = 0; i < 28; i++) { const a = Math.PI * 1.0 + (i / 27) * Math.PI * 0.95; pennants.push({ x: COVE[0] + Math.cos(a) * (COVE[2] + 2), y: 12, z: COVE[1] + Math.sin(a) * (COVE[2] + 2), w: 2.6, h: 6, color: vatC[i % 8], ry: a + 1.57 }); }
    [[CIT[0] - 4, CY + 44, CIT[1] - 4, 0x8a1c1c], [TT[0], ty + 40, TT[1], DY.weld]].forEach(([x, y, z, color]) => pennants.push({ x, y, z, w: 4, h: 9, color, ry: 0.3 }));
    root.add(K.banners(pennants)); root.add(K.banners(cl, { pole: false }));
    const fire = K.fires([[BT[0], bty + 49, BT[1]], [CIT[0] - 6, CY + 15, CIT[1] - 4], [CIT[0] + 12, CY + 15, CIT[1] - 4], [outerGate[0] - 6, H(...outerGate) + 4, outerGate[1] + 6], [outerGate[0] + 6, H(...outerGate) + 4, outerGate[1] + 6]], { size: 9, light: q.low ? 0 : 2, intensity: 80 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const cld = K.clouds({ y: 240, extent: 700, count: 8, opacity: 0.3, color: 0xfff6ee }); root.add(cld); ctx.onUpdate((dt) => cld.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 250, center: [5, 0, 10], minDistance: 18,
      hero: { pos: [205, 88, 205], target: [0, 14, 5] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x5a6aa6, horizon: 0xf6bca0, fog: 0xe6bca8, fogD: 0.0012, sunC: 0xffbe84, sunI: 2.9, hemiSky: 0xb4aadc, hemiGround: 0x6a4e48, hemiI: 0.85 },
        day: { top: 0x4690d6, horizon: 0xf8ecd8, fog: 0xe8e2d6, fogD: 0.0011, sunC: 0xfff2d6, sunI: 3.3, hemiSky: 0xb8d4f0, hemiGround: 0x8a7a60, hemiI: 1.1 },
        dusk: { top: 0x3c3a7e, horizon: 0xf4986c, fog: 0xd48e78, fogD: 0.0013, sunC: 0xff8e54, sunI: 3.0, hemiSky: 0xa098cc, hemiGround: 0x6a4c4a, hemiI: 0.95 },
        night: { top: 0x0a1034, horizon: 0x2e3a6a, fog: 0x1e2a4c, fogD: 0.0018, sunC: 0xa8c0f4, sunI: 1.9, hemiSky: 0x6c7ec4, hemiGround: 0x3a3650, hemiI: 1.3 },
      } },
      landmarks: {
        'bleeding-tower': lm(BT[0], BT[1], 14, 54), 'harbour': lm(COVE[0] - 10, COVE[1] - 4, 36, 10), 'fountain-of-the-drunken-god': lm(SQ[0], SQ[1], 14, 8), 'temple-of-trios': lm(TT[0], TT[1], 16, 40),
        'inner-walls': lm(CIT[0], CIT[1], 46, 36), 'outer-walls': lm(outerGate[0], outerGate[1], 20, 24), 'dye-works': lm(DW[0], DW[1], 26, 10), 'armourers-row': lm(AM[0], AM[1], 20, 12),
        'arsenal': lm(AR[0] - 10, AR[1], 24, 12), 'stepstones-view': lm(300, -110, 70, 12),
      },
      cutaways: [],
    };
  },
};
const ROCKS = [[270, -60, 18, 7], [300, -100, 22, 10], [345, -130, 16, 6], [380, -176, 24, 12], [320, -190, 14, 5], [420, -230, 20, 8], [250, 20, 14, 5]];
