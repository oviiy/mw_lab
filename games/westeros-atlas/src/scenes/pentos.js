// Pentos — brick-and-tile merchant-prince city on the east shore of the Bay of Pentos. Book/TWOIAF anchors: massive high walls (yet
// thought weak), many square brick towers, tiled roofs, walled estates (Illyrio's manse), a large red temple, bazaars, the Sunrise
// Gate east toward the Velvet Hills, a ceremonial Prince. Plan, shapes, palace and gardens are interpretation (see content/pentos.js).
// Polish pass: warm clay palette (ochre plaster, terracotta tile, brick plinths, flat orange terraces), banded walls with string
// courses and cornices, stepped palace terraces, patchwork farmland painted into the terrain, far land/sea skirts, warm light grade.
import * as K from '../kit/index.js';
const { THREE, Batch, tri, flat, glow } = K;

const shoreX = (z) => -76 + 0.0016 * z * z + Math.sin(z * 0.03) * 5;   // coast line: sea lies to the west (-x)
const CX = -46, RX = 150, RZ = 126;                                        // wall ellipse
const wallPt = (a) => [CX + Math.cos(a) * RX, Math.sin(a) * RZ];
const GATE = [CX + RX, 0];
const HILLS = [[40, -38, 42, 17], [180, -135, 55, 20], [-10, 78, 30, 6]]; // prince's hill, manse hill, harbour rise
const EDGE = 4.2;                                                          // plain level the terrain relaxes to at its landward edges

const _hsl = {};
function jit(hex, r, dh = 0.012, ds = 0.07, dl = 0.05) { const c = new THREE.Color(hex); c.getHSL(_hsl); return c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, K.clamp(_hsl.s + r.range(-ds, ds), 0, 1), K.clamp(_hsl.l + r.range(-dl, dl), 0, 1)); }
const shade = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const rot = (dx, dz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return [dx * c + dz * s, -dx * s + dz * c]; };
function skirt(root, cx, cz, w, d, y, color) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color, roughness: 1 })); m.position.set(cx, y, cz); m.receiveShadow = false; root.add(m); }

// local tree helper (trees are baked into the Batch with per-tree colour jitter)
const treeMat = flat(0xffffff, { rough: 1, flatShading: false }), trunkMat = flat(0x6b5238, { rough: 1 });
function trees(b, { rng = K.rng(1), count = 50, bounds, heightAt = () => 0, avoid, species = 'oak', scale = [0.8, 1.2], minDist = 4, tint, fruit }) {
  const pts = K.scatter({ rng, count, bounds, minDist, avoid });
  const greens = { oak: [0x4b7a3a, 0x58863f, 0x3f6a33], cypress: [0x2f4f3a, 0x38583f, 0x2a4634], palm: [0x3f8f45, 0x4aa04d], olive: [0x8a9a62, 0x7d8f58, 0x6f8450] }[species];
  for (const [x, z] of pts) {
    const k = rng.range(scale[0], scale[1]), y = heightAt(x, z), gc = jit(tint ?? rng.pick(greens), rng, 0.01, 0.06, 0.05);
    if (species === 'cypress') { b.cyl(trunkMat, x, y, z, 0.3 * k, 1.4 * k, { seg: 5 }); b.cone(treeMat, x, y + 1.0 * k, z, 1.5 * k, 8.5 * k, { seg: 7, color: gc }); }
    else if (species === 'palm') { b.cyl(trunkMat, x, y, z, 0.3 * k, 7 * k, { seg: 5, color: 0x8d7452 }); b.dome(treeMat, x, y + 6.6 * k, z, 3 * k, { seg: 7, sy: 0.4, color: gc }); }
    else if (species === 'olive') { b.cyl(trunkMat, x, y, z, 0.35 * k, 2.2 * k, { seg: 5, color: 0x7a6a56 }); b.sphere(treeMat, x, y + 1.8 * k, z, 2.2 * k, { seg: 7, sy: 0.7, color: gc }); b.sphere(treeMat, x + 1.0 * k, y + 2.4 * k, z - 0.6 * k, 1.5 * k, { seg: 6, sy: 0.7, color: shade(gc.getHex(), 1.12) }); }
    else { b.cyl(trunkMat, x, y, z, 0.4 * k, 2.4 * k, { seg: 6 }); b.sphere(treeMat, x, y + 2.2 * k, z, 2.4 * k, { seg: 8, sy: 0.85, color: gc }); b.sphere(treeMat, x - 0.9 * k, y + 3.2 * k, z + 0.5 * k, 1.5 * k, { seg: 6, sy: 0.8, color: shade(gc.getHex(), 1.15) }); if (fruit) for (let i = 0; i < 5; i++) b.sphere(treeMat, x + Math.cos(i * 2.1) * 2 * k, y + 2.5 * k + (i % 2) * 1.1 * k, z + Math.sin(i * 2.1) * 2 * k, 0.36, { seg: 4, color: fruit }); }
  }
  return pts;
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(1303);
    // ------------------------------------------------------------ terrain: coastal plain, gentle hills, Velvet Hills far east (relaxed to a plain at the edges)
    const heightAt = (x, z) => {
      const sx = shoreX(z);
      let h = 1.6 + (K.fbm(x * 0.012, z * 0.012, 3, 5) - 0.5) * 5;
      h += K.smoothstep(-20, 300, x) * 16 + K.smoothstep(240, 470, x) * (28 + K.fbm(x * 0.008, z * 0.008, 3, 9) * 26);
      for (const [hx, hz, hr, hh] of HILLS) { const d = Math.hypot(x - hx, z - hz); h += hh * (1 - K.smoothstep(hr * 0.3, hr, d)); }
      const dx = x - sx;                                                      // shore: beach then drop into the bay
      if (dx < 0) h = Math.min(h, 0.6 + dx * 0.16);
      else if (dx < 14) h = Math.min(h, 0.6 + dx * 0.4 * 0.35 + 0.2);
      const ed = Math.max(K.smoothstep(420, 535, x), K.smoothstep(430, 540, Math.abs(z)));  // calm the land down toward the terrain edge
      return h + (EDGE - h) * ed * K.smoothstep(0.2, 1.8, h);
    };
    const sand = new THREE.Color(0xe2cd9e), clay = new THREE.Color(0xc9a06c), grass = new THREE.Color(0xa9a35e), dry = new THREE.Color(0x8e7d4c), hazeC = new THREE.Color(0x9a8264), seabed = new THREE.Color(0x58928c), pave = new THREE.Color(0xd2b58a), wet = new THREE.Color(0xb59f78), c = new THREE.Color();
    const FIELD = [0xc4ae5e, 0x9bad58, 0xb7924c, 0xaebb64, 0xcf9f52, 0x8fa352].map((x) => new THREE.Color(x));
    const inCityG = (x, z) => ((x - CX) / (RX - 2)) ** 2 + (z / (RZ - 2)) ** 2;
    const farmland = (x, z) => x > 130 && Math.abs(z) < 300 && x < 400;
    const tcol = (x, z, h, s) => {
      if (h < 0) return c.copy(seabed).lerp(sand, K.clamp(1 + h / 3, 0, 1));
      c.copy(sand).lerp(grass, K.smoothstep(0.8, 6, h));
      c.lerp(dry, K.clamp(K.fbm(x * 0.02, z * 0.02, 2, 4) * 1.2 - 0.2, 0, 0.5));
      if (farmland(x, z)) {                                                    // patchwork fields: slanted strip parcels
        const u = x * 0.9 + z * 0.35, v = z * 0.9 - x * 0.35, cell = Math.floor(u / 34) * 7 + Math.floor(v / 52) * 3, f = FIELD[((cell % 6) + 6) % 6];
        const edge = Math.min(((u % 34) + 34) % 34, ((v % 52) + 52) % 52); c.lerp(f, 0.8 * K.smoothstep(0, 1.4, edge) * (1 - K.smoothstep(380, 430, x)));
        c.multiplyScalar(0.97 + 0.06 * K.noise2(u * 0.2, v * 0.2, 3));
      }
      if (x > 230) c.lerp(hazeC, K.smoothstep(230, 420, x) * 0.5);
      if (h > 30) c.lerp(clay, K.clamp((h - 30) / 25, 0, 0.5));
      c.lerp(pave, 0.85 * (1 - K.smoothstep(0.9, 1.0, inCityG(x, z))) * (x > shoreX(z) + 8 ? 1 : 0));
      if (h < 1.1) c.lerp(wet, 0.5 * K.clamp((1.1 - h) / 1.1, 0, 1));
      return c;
    };
    root.add(K.terrain({ size: 1100, seg: q.seg(190), heightAt, kind: 'plaster', scale: 28, colorAt: tcol }));
    const wopt = { deep: 0x1b6d8c, shallow: 0x64c0b8, opacity: 0.9, choppy: 0.35, speed: 0.5 };
    const wat = K.water({ w: 1400, d: 1400, center: [0, 0], seg: q.seg(130), level: 0, heightAt, ...wopt });
    root.add(wat); ctx.registerWater(wat);
    for (const [cx, cz, w, d] of [[0, -2200, 8000, 3000], [0, 2200, 8000, 3000], [-2200, 0, 3000, 1400], [2200, 0, 3000, 1400]]) { const sk = K.water({ w, d, seg: 2, level: 0, heightAt: () => -8, center: [cx, cz], ...wopt }); root.add(sk); ctx.registerWater(sk); }
    // far land: the plain continues to the horizon (east, and along the coast to the north and south)
    skirt(root, 1700, 0, 2300, 4600, EDGE - 0.1, 0x9b8a62);
    skirt(root, 900, -1800, 2000, 2500, EDGE - 0.1, 0x9b8a62); skirt(root, 900, 1800, 2000, 2500, EDGE - 0.1, 0x9b8a62);

    // ------------------------------------------------------------ materials: near-white tints, colour lives in the per-object colour arg
    const brick = tri('brick', { color: 0xffffff, scale: 7, snow: false, bump: 0.6 });
    const plaster = tri('plaster', { color: 0xffffff, scale: 6, snow: false }), tile = tri('tile', { color: 0xffffff, scale: 10, snow: false, rough: 0.8, bump: 0.7 });
    const stone = tri('stone', { color: 0xf0e8d6, scale: 8, snow: false, bump: 0.6 }), wood = tri('wood', { color: 0xd8c0a0, scale: 4, snow: false });
    const cobble = tri('cobble', { color: 0xf0e0c4, scale: 8, snow: false }), marble = tri('marble', { color: 0xfaf2e4, scale: 7, snow: false, rough: 0.4 });
    const gold = flat(0xdcae44, { rough: 0.42, metal: 0.25, flatShading: false }), cloth = flat(0xffffff, { rough: 1, side: THREE.DoubleSide, flatShading: false });
    const windowG = glow(0xffc46b), lan = glow(0xffa84a, 1.3), dark = flat(0x2a1d16, { rough: 1 }), plain = flat(0xffffff, { rough: 0.95, flatShading: false });
    const b = new Batch();
    const H = heightAt;
    const WALLC = [0xe9c08c, 0xf0d6aa, 0xdfa876, 0xf2e0bd, 0xd9a47a, 0xedd2a4, 0xe6b490], TILE = [0xd8683a, 0xe07a44, 0xc95a32, 0xe58f55, 0xb84e2e];
    const BRK = 0xe8b894;

    // ------------------------------------------------------------ walls: massive and high, banded with string courses, square brick towers
    const wp = []; for (let i = 0; i <= 44; i++) wp.push(wallPt(-Math.PI / 2 + (i / 44) * Math.PI));
    K.wall(b, wp, { h: 17, t: 5, mat: brick, capMat: brick, heightAt: H, closed: false, sink: 4, color: shade(0xffc9a0, 1.25) });
    for (let i = 0; i < wp.length - 1; i++) {
      const [x0, z0] = wp[i], [x1, z1] = wp[i + 1], dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ry = K.headingX(dx, dz);
      if (Math.abs(mx - GATE[0]) < 14 && Math.abs(mz) < 14) continue;
      const g = Math.min(H(x0, z0), H(x1, z1)), top = Math.max(H(x0, z0), H(x1, z1)) + 17;
      b.box(brick, mx, g - 2.5, mz, l + 0.5, 4.6, 6.6, ry, 0xd9a888);                       // battered plinth
      b.box(stone, mx, g + 8.2, mz, l + 0.3, 0.8, 5.6, ry, 0xf0dcc0);                       // string course
      b.box(stone, mx, top - 0.9, mz, l + 0.3, 1.0, 6.0, ry, 0xf6e6d0);                     // cornice
      for (let k = 0; k < 3; k++) { const u = (k + 0.5) / 3 - 0.5, px = mx + (dx / l) * u * l, pz = mz + (dz / l) * u * l; b.box(dark, px, g + 11.4, pz, 0.9, 2.0, 5.2, ry, 0x4a3226); } // arrow-slits (through the thickness reads as dark slits)
    }
    wp.forEach(([x, z], i) => {
      if (i % 4 === 0 && i > 0 && i < 44 && Math.abs(i - 22) > 1) {
        const y = H(x, z), tallH = 25, ry = Math.atan2(-z, x - CX) * 0;
        K.squareTower(b, x, z, { w: 9, h: tallH, y, mat: brick, roofMat: tile, roof: 'flat', windows: false, color: shade(jit(0xffcfa8, rr, 0.01, 0.05, 0.04).getHex(), 1.25), ry });
        b.box(brick, x, y + tallH - 2.2, z, 11.2, 1.0, 11.2, ry, 0xe6c0a0); b.box(brick, x, y + tallH - 0.4, z, 10.4, 0.7, 10.4, ry, 0xd9a888);    // corbelled cap
        b.pyramid(tile, x, y + tallH + 1.6, z, 6.5, 4.5, 6.5, ry, jit(rr.pick(TILE), rr)); b.sphere(lan, x, y + tallH + 6.4, z, 0.6, { seg: 5 });
        for (const sd of [-1, 1]) { const [px, pz] = rot(sd * 4.55, 0, ry); b.box(windowG, x + px, y + tallH - 7, z + pz, 0.2, 2.4, 0.9, ry); const [qx, qz] = rot(0, sd * 4.55, ry); b.box(windowG, x + qx, y + tallH - 7, z + qz, 0.9, 2.4, 0.2, ry); }
      }
    });
    for (const [x, z] of [wp[0], wp[44]]) { const y = H(x, z); K.squareTower(b, x, z, { w: 11, h: 30, y, mat: brick, roofMat: tile, roof: 'flat', windows: false, color: 0xecc8a6 }); b.box(brick, x, y + 28, z, 13.4, 1.2, 13.4, 0, 0xe2b896); b.pyramid(tile, x, y + 31.2, z, 8.5, 6, 8.5, 0, 0xd8683a); b.sphere(lan, x, y + 38, z, 0.7, { seg: 5 }); }
    K.gatehouse(b, GATE[0], GATE[1], { y: H(...GATE), ry: Math.PI / 2, mat: brick, roofMat: tile, w: 24, d: 11, h: 24, gate: 7, wood, towerR: 5.2, color: 0xf0d2b2, roofColor: 0xd8683a });
    { const gy = H(...GATE); b.box(stone, GATE[0], gy + 24, GATE[1], 26, 1.0, 12.6, Math.PI / 2, 0xf2e4cc); for (const sd of [-1, 1]) { b.sphere(lan, GATE[0] - 7.5, gy + 4.2, GATE[1] + sd * 7.5, 0.5, { seg: 5 }); } }
    // harbour mole & quay (the city opens to the bay)
    b.extrude(stone, [[-62, -92], [-48, -92], [-48, 92], [-62, 92]].map(([x, z]) => [x + (shoreX(z) + 76) * 1, z]), -0.5, 2.5, 0xe4d4b8);
    b.extrude(stone, [[-47.4, -92], [-46.2, -92], [-46.2, 92], [-47.4, 92]].map(([x, z]) => [x + (shoreX(z) + 76) * 1, z]), 1.9, 0.5, 0xf2e6cc);   // coping
    for (let i = 0; i < 9; i++) { const z = -80 + i * 20; K.pier(b, shoreX(z) - 6, 1.95, z, { len: 28 + (i % 3) * 8, w: 3.4, ry: Math.PI, mat: wood, color: 0xb59a76 }); b.sphere(lan, shoreX(z) - 7, 3.2, z - 1.4, 0.35, { seg: 5 }); }
    for (let z = -88; z <= 88; z += 11) { const x = shoreX(z) + 1; b.cyl(stone, x, 1.9, z, 0.5, 0.9, { seg: 6, color: 0x6b4a32 }); if (Math.round((z + 88) / 11) % 2 === 0) { b.cyl(wood, x + 1.0, 1.9, z, 0.12, 3.2, { seg: 4, color: 0x4a3524 }); b.sphere(lan, x + 1.0, 5.3, z, 0.38, { seg: 5 }); } }
    b.cyl(brick, -108, -2.4, -74, 4.5, 9, { seg: 12, top: 0.8, color: 0xeacdb0 }); b.cyl(stone, -108, 6.6, -74, 4.2, 0.8, { seg: 12, color: 0xf2e4cc }); b.sphere(lan, -108, 7.8, -74, 1.4, { seg: 7 }); // harbour light
    for (let i = 0; i < 6; i++) { const z = -84 + i * 31 + (i % 2) * 6, x = shoreX(z) + 11; b.box(brick, x, 0.9, z, 8, 5, 14, 0, jit(0xe6b894, rr)); b.prism(tile, x, 5.9, z, 9, 2.6, 15, Math.PI / 2 * 0, jit(rr.pick(TILE), rr)); b.box(dark, x - 4.05, 1.0, z, 0.2, 3.2, 4, 0); for (const k of [-1, 1]) b.box(windowG, x - 4.05, 3.8, z + k * 4, 0.15, 1.1, 1.2, 0); }   // quayside warehouses

    // ------------------------------------------------------------ streets
    const street = (pts, w = 5) => b.ribbon(cobble, pts, w, H, 0.2, 0xe4d2ae);
    const arcAve = (a0, a1, r, n = 18) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * (i / n); return [CX + Math.cos(a) * RX * r, Math.sin(a) * RZ * r]; });
    const avenues = [
      [[-58, 0], [-20, 2], [30, -2], [70, 0], [GATE[0] - 4, 0]],                       // harbour -> Sunrise Gate (main avenue)
      [[-58, -40], [-10, -42], [40, -62], [80, -90]], [[-58, 40], [-10, 46], [40, 62], [80, 90]],
      arcAve(-1.3, 1.3, 0.6), arcAve(-1.4, 1.4, 0.82),
      [[-56, -90], [-40, -50], [-20, -10]], [[-56, 90], [-40, 50], [-20, 10]],
    ];
    avenues.forEach((a, i) => street(a, i ? 5.4 : 8));
    // ------------------------------------------------------------ city fabric: ochre/cream plaster over brick plinths, terracotta tile, flat orange terraces
    const inCity = (x, z) => ((x - CX) / (RX - 9)) ** 2 + (z / (RZ - 9)) ** 2 < 1 && x > shoreX(z) + 22;
    const avoidAve = (x, z) => avenues.some((a) => K.distToPolyline(x, z, a).d < 6.2);
    const PX = 40, PZ = -38, PY = H(PX, PZ) + 0.5;
    const bigFoot = [[PX, PZ, 40], [-12, -66, 24], [75, 60, 22], [GATE[0] - 12, 0, 20], [-34, 22, 20], [-20, 44, 8], [20, 44, 8], [60, -40, 8], [-30, 70, 8], [92, 30, 8], [0, -20, 8], [-20, -60, 8]];
    const pts = K.scatter({ rng: K.rng(31), count: q.dens(760), bounds: [-70, -130, 100, 130], minDist: 7.0, avoid: (x, z) => !inCity(x, z) || avoidAve(x, z) || bigFoot.some(([bx, bz, br]) => Math.hypot(x - bx, z - bz) < br) });
    const placed = [];
    for (const [x, z] of pts) {
      const w = rr.range(5, 7.6), d = w * rr.range(1, 1.3), tall = rr() < 0.2, h = tall ? rr.range(8.5, 11.5) : rr.range(4.6, 7.8), y = H(x, z), ry = (Math.abs(z) > 60 ? 0.35 * Math.sign(z) : 0) + rr.range(-0.07, 0.07);
      const wc = jit(rr.pick(WALLC), rr, 0.012, 0.06, 0.05), kind = rr(), tc = jit(rr.pick(TILE), rr, 0.012, 0.08, 0.05);
      b.box(brick, x, y - 1.2, z, w + 0.5, 2.6, d + 0.5, ry, jit(BRK, rr, 0.01, 0.05, 0.05));      // brick plinth
      b.box(plaster, x, y + 1.3, z, w, h - 1.3, d, ry, wc);
      b.box(plaster, x, y + h - 0.45, z, w + 0.7, 0.9, d + 0.7, ry, jit(0xf6e8cc, rr, 0.01, 0.04, 0.03));   // cornice
      if (kind < 0.38) b.pyramid(tile, x, y + h + 0.4, z, w + 0.8, Math.min(w, d) * 0.5 + 0.6, d + 0.8, ry, tc);
      else if (kind < 0.7) b.prism(tile, x, y + h + 0.4, z, w + 0.9, Math.min(w, d) * 0.5 + 0.8, d + 0.9, ry + (rr() < 0.5 ? 0 : Math.PI / 2), tc);
      else {                                                                          // terrace roof: parapet, awning, potted orange
        b.box(plaster, x, y + h + 0.45, z, w + 0.4, 0.4, d + 0.4, ry, shade(wc.getHex(), 0.92));
        for (const sd of [-1, 1]) { const [px, pz] = rot(0, sd * (d / 2 + 0.1), ry); b.box(plaster, x + px, y + h + 0.85, z + pz, w + 0.5, 0.9, 0.5, ry, wc); const [qx, qz] = rot(sd * (w / 2 + 0.1), 0, ry); b.box(plaster, x + qx, y + h + 0.85, z + qz, 0.5, 0.9, d, ry, wc); }
        const [ax, az] = rot(-w * 0.15, d * 0.1, ry); b.box(cloth, x + ax, y + h + 2.3, z + az, w * 0.5, 0.16, d * 0.4, ry, jit(rr.pick([0xc0392b, 0xd89b2f, 0xefe2c4, 0x2f6f8f]), rr), -0.15);
        const [tx, tz] = rot(w * 0.22, -d * 0.2, ry); b.cyl(plaster, x + tx, y + h + 0.85, z + tz, 0.55, 0.7, { seg: 6, color: 0xc86a3c }); b.sphere(treeMat, x + tx, y + h + 2.0, z + tz, 0.85, { seg: 6, color: 0x4e8a36 });
      }
      if (tall) { const [px, pz] = rot(w / 2 + 0.55, 0, ry); b.box(wood, x + px, y + h * 0.55, z + pz, 1.0, 0.22, d * 0.55, ry, 0x6f5036); }   // balcony
      const [dpx, dpz] = rot(0, d / 2 + 0.06, ry); b.box(dark, x + dpx, y, z + dpz, 1.3, 2.3, 0.2, ry);
      for (const sd of [-1, 1]) { const [wx, wz] = rot(sd * w * 0.27, d / 2 + 0.06, ry); b.box(windowG, x + wx, y + h * 0.55, z + wz, 0.85, 1.3, 0.12, ry); }
      placed.push({ x, z, h });
    }
    // awnings & bazaar stalls on the main avenue
    const stalls = [];
    for (let i = 0; i < 18; i++) { const x = -40 + i * 6.5, z = i % 2 ? 6.4 : -6.4, y = H(x, z), col = [0xc0392b, 0xd89b2f, 0x2f6f8f, 0x8a3b6a, 0x4c8a3c][i % 5]; b.box(wood, x, y, z, 3, 1.4, 2, 0, 0xa07a55); for (const s of [-1, 1]) b.cyl(wood, x + s * 1.5, y, z + (i % 2 ? 1.1 : -1.1), 0.1, 3.3, { seg: 4, color: 0x6b4a30 }); b.sphere(plain, x, y + 1.7, z, 0.4, { seg: 5, color: [0xe8892b, 0xd8c24a, 0xb8402e][i % 3] }); stalls.push({ x, y: y + 3.2, z, w: 3.4, h: 1.6, color: col, ry: 0 }); }
    // square brick towers inside the city ("spice towers" - interpretation)
    const spiceT = [[-20, -60], [20, 44], [60, -40], [-30, 70], [92, 30], [0, -20]];
    spiceT.forEach(([x, z], i) => { const y = H(x, z), hh = 27 + (i % 3) * 5, col = shade(jit(0xffd2ac, rr, 0.01, 0.05, 0.04).getHex(), 1.25);
      K.squareTower(b, x, z, { w: 9.5, d: 9.5, h: hh, y, mat: brick, roofMat: tile, roof: 'flat', windows: false, color: col });
      b.box(brick, x, y - 1.6, z, 11.6, 4.4, 11.6, 0, 0xd9a888); b.box(stone, x, y + hh * 0.5, z, 10.2, 0.7, 10.2, 0, 0xf2e2c6); b.box(brick, x, y + hh - 2.4, z, 11.6, 1.0, 11.6, 0, 0xe6c0a0); b.box(brick, x, y + hh - 0.4, z, 10.6, 0.7, 10.6, 0, 0xd9a888);
      if (i % 2) b.pyramid(tile, x, y + hh + 0.4, z, 8, 7, 8, 0, jit(rr.pick(TILE), rr)); else { for (const [ox, oz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) b.box(brick, x + ox * 4.3, y + hh + 0.3, z + oz * 4.3, 1.4, 1.3, 1.4, 0, 0xe6c0a0); b.cyl(wood, x, y + hh + 0.3, z, 1.8, 0.8, { seg: 8, color: 0x6a4a30 }); b.sphere(lan, x, y + hh + 1.5, z, 1.0, { seg: 6 }); }
      for (const k of [0.28, 0.72]) for (const sd of [-1, 1]) { b.box(windowG, x + sd * 4.8, y + hh * k, z, 0.15, 2.2, 1.0, 0); b.box(windowG, x, y + hh * k, z + sd * 4.8, 1.0, 2.2, 0.15, 0); } });

    // ------------------------------------------------------------ Prince's Palace on its hill: stepped terraces, colonnade, gilded dome
    for (let i = 0; i < 4; i++) { const ex = 52 - i * 3, ez = 40 - i * 3, yy = PY - 8 + i * 1.7; b.extrude(stone, [[PX - ex, PZ - 28 - i], [PX + ex, PZ - 28 - i], [PX + ex + 4, PZ + 20 + i * 2.2], [PX - ex - 4, PZ + 20 + i * 2.2]].map(([x, z]) => [x, z]), yy - (i ? 0 : 1), 3 - (i ? 1 : 0), jit(i % 2 ? 0xe6d6b8 : 0xf0e4cc, rr)); }
    b.extrude(stone, [[PX - 38, PZ - 28], [PX + 38, PZ - 28], [PX + 42, PZ + 20], [PX - 42, PZ + 20]], PY - 8, 8.5, 0xe9dcc2);
    b.box(stone, PX, PY + 0.4, PZ + 20.4, 88, 0.7, 1.4, 0, 0xf6ead2);                      // terrace parapet cap
    b.box(plaster, PX, PY, PZ - 6, 54, 14, 26, 0, 0xf2e2c4); b.box(stone, PX, PY + 13.2, PZ - 6, 56, 1.0, 28, 0, 0xf8ead0); b.prism(tile, PX, PY + 14, PZ - 6, 56, 8, 28, 0, 0xd8683a);
    b.box(plaster, PX - 36, PY, PZ + 4, 14, 11, 20, 0, 0xecd2a8); b.box(plaster, PX + 36, PY, PZ + 4, 14, 11, 20, 0, 0xecd2a8);
    b.pyramid(tile, PX - 36, PY + 11, PZ + 4, 15, 6, 21, 0, 0xd8683a); b.pyramid(tile, PX + 36, PY + 11, PZ + 4, 15, 6, 21, 0, 0xd8683a);
    b.cyl(plaster, PX, PY + 14, PZ - 6, 8, 8, { seg: 20, color: 0xf2e2c4 }); b.cyl(stone, PX, PY + 21.6, PZ - 6, 8.8, 0.9, { seg: 20, color: 0xf8ead0 }); b.dome(gold, PX, PY + 22.4, PZ - 6, 8.4, { seg: 20, sy: 0.9 }); b.cyl(gold, PX, PY + 29.6, PZ - 6, 0.3, 3.2, { seg: 5 }); b.sphere(lan, PX, PY + 33, PZ - 6, 0.7, { seg: 6 });
    for (const [ox, oz] of [[-42, -26], [42, -26], [-42, 18], [42, 18]]) { const tx = PX + ox, tz = PZ + oz; K.tower(b, tx, tz, { r: 3.6, h: 22, y: PY - 3, mat: plaster, roofMat: tile, roof: 'cone', roofH: 6.5, seg: 12, windows: true, color: 0xf0e0c2, roofColor: 0xd8683a, taper: 0.88 }); b.cyl(stone, tx, PY + 12, tz, 3.4, 0.7, { seg: 12, color: 0xf8ead0 }); }
    for (let i = -8; i <= 8; i++) { b.cyl(marble, PX + i * 3, PY, PZ + 8, 0.55, 7, { seg: 10, top: 0.9 }); b.box(marble, PX + i * 3, PY + 7, PZ + 8, 1.5, 0.5, 1.5, 0, 0xf8f0e0); } b.box(marble, PX, PY + 7.5, PZ + 8, 52, 0.8, 2.6, 0, 0xf8f0e0);
    for (let i = -7; i <= 7; i++) { b.box(windowG, PX + i * 3.4, PY + 4, PZ + 7.2 - 14, 1, 2.8, 0.1); b.box(windowG, PX + i * 3.4, PY + 9.4, PZ + 7.35, 0.9, 2.4, 0.1, 0); }
    for (let i = 0; i < 7; i++) b.box(stone, PX - 12 + i * 0, PY - 8 + i * 1.2, PZ + 21 + (6 - i) * 0.95, 24 - i * 0.6, 1.2, 1.5, 0, 0xe6d8bc);       // grand stair
    // orange-tree terraces around the palace
    trees(b, { rng: K.rng(8), count: q.dens(90), bounds: [PX - 58, PZ - 34, PX + 58, PZ + 46], heightAt: (x, z) => Math.max(H(x, z), PY - 8), species: 'oak', minDist: 5, scale: [0.7, 0.95], tint: 0x4e8a36, fruit: 0xf08a1c, avoid: (x, z) => x > PX - 46 && x < PX + 46 && z > PZ - 32 && z < PZ + 24 });

    // ------------------------------------------------------------ Red temple (large, red-plastered, with braziers)
    const RT = [-12, -66], rty = H(...RT);
    b.box(stone, RT[0], rty - 1, RT[1], 36, 3, 28, 0, 0xe8d6bc); b.box(plaster, RT[0], rty + 1, RT[1], 30, 13, 22, 0, 0xc4503a); b.box(stone, RT[0], rty + 13.4, RT[1], 31.4, 0.9, 23.4, 0, 0xe8c6a0); b.prism(tile, RT[0], rty + 14, RT[1], 32, 6, 24, 0, 0x8a2a20);
    b.cyl(plaster, RT[0], rty + 14, RT[1], 6.5, 10, { seg: 18, color: 0xc4503a, top: 0.95 }); b.cyl(stone, RT[0], rty + 24, RT[1], 7.2, 0.9, { seg: 18, color: 0xe8c6a0 }); b.dome(gold, RT[0], rty + 24.9, RT[1], 7, { seg: 18 }); b.sphere(lan, RT[0], rty + 31.6, RT[1], 0.9, { seg: 6 });
    for (const [ox, oz] of [[-14, -10], [14, -10], [-14, 10], [14, 10]]) { b.cyl(plaster, RT[0] + ox, rty - 1, RT[1] + oz, 2.2, 24, { seg: 10, top: 0.7, color: 0xb84a34 }); b.cyl(stone, RT[0] + ox, rty + 22, RT[1] + oz, 2.5, 0.8, { seg: 10, color: 0xe8c6a0 }); b.cone(gold, RT[0] + ox, rty + 22.8, RT[1] + oz, 2.4, 4, { seg: 10 }); }
    b.box(dark, RT[0], rty + 0.8, RT[1] + 11.05, 4.4, 7.4, 0.2, 0); b.box(windowG, RT[0], rty + 1, RT[1] + 11.15, 3.4, 6.6, 0.15, 0);
    for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) b.box(windowG, RT[0] + sd * (6.5 + k * 3.2), rty + 6, RT[1] + 11.1, 1.1, 3.4, 0.12, 0);
    for (let i = 0; i < 5; i++) b.box(stone, RT[0], rty - 1 + i * 0.0, RT[1] + 14 + (4 - i) * 0.9, 12 + (4 - i) * 0.0, 0.5 * (i + 1) * 0 + 0.5 * (i + 1) * 0.5, 1, 0, 0xe8d6bc);   // steps

    // ------------------------------------------------------------ Illyrio's manse: walled estate outside the walls on a hill
    const MX = 178, MZ = -132, MY = H(MX, MZ) + 0.3;
    const mw = [[MX - 28, MZ - 22], [MX + 28, MZ - 22], [MX + 28, MZ + 22], [MX - 28, MZ + 22]];
    K.wall(b, mw, { h: 6.5, t: 1.8, mat: brick, capMat: brick, heightAt: () => MY, closed: true, sink: 3, color: 0xecc8a6, crenel: false });
    for (const [x, z] of mw) { b.box(brick, x, MY, z, 2.6, 8.4, 2.6, 0, 0xdcae8c); b.pyramid(tile, x, MY + 8.4, z, 3.2, 2.2, 3.2, 0, 0xd8683a); }
    b.box(brick, MX, MY, MZ - 8, 32, 9, 16, 0, 0xe9c4a0); b.box(stone, MX, MY + 8.4, MZ - 8, 33, 0.9, 17, 0, 0xf6e6cc); b.prism(tile, MX, MY + 9, MZ - 8, 33, 5, 17, 0, 0xd0583a);
    b.box(plaster, MX - 18, MY, MZ - 6, 8, 7, 14, 0, 0xecd8b6); b.box(plaster, MX + 18, MY, MZ - 6, 8, 7, 14, 0, 0xecd8b6); b.pyramid(tile, MX - 18, MY + 7, MZ - 6, 9, 3.4, 15, 0, 0xd8683a); b.pyramid(tile, MX + 18, MY + 7, MZ - 6, 9, 3.4, 15, 0, 0xd8683a);
    b.cyl(stone, MX, MY, MZ + 6, 3.4, 1.0, { seg: 18, color: 0xd6dcda }); b.cyl(stone, MX, MY + 1.0, MZ + 6, 0.5, 2.2, { seg: 8, color: 0xe0e8e6 }); b.cyl(stone, MX, MY + 3.2, MZ + 6, 1.4, 0.35, { seg: 10, color: 0xe0e8e6 }); // fountain
    b.box(marble, MX + 12, MY, MZ + 8, 1.5, 3.2, 1.5, 0, 0xe8e2d4); b.sphere(marble, MX + 12, MY + 3.2, MZ + 8, 0.7, { seg: 8, color: 0xe8e2d4 }); // statue of the house's master (the books mention one)
    b.box(dark, MX, MY, MZ - 0.05, 3.4, 5, 0.2); b.box(windowG, MX, MY + 1.5, MZ - 0.02, 2.4, 3.2, 0.15); for (const sd of [-1, 1]) for (const k of [-1, 1]) b.box(windowG, MX + sd * (6 + k * 3), MY + 3.6, MZ - 0.02, 1.0, 2, 0.12);
    for (const sd of [-1, 1]) { b.box(brick, MX + sd * 10, MY, MZ + 6, 12, 0.5, 4, 0, 0xd8b890); }   // garden beds
    K.gatehouse(b, MX, MZ + 22, { y: MY, ry: 0, mat: brick, roofMat: tile, w: 12, d: 4, h: 9, gate: 4, wood, towerR: 2.4, color: 0xecc8a6, roofColor: 0xd0583a });
    trees(b, { rng: K.rng(12), count: q.dens(34), bounds: [MX - 24, MZ - 18, MX + 24, MZ + 18], heightAt: () => MY, species: 'oak', minDist: 4.5, scale: [0.7, 0.9], tint: 0x4e8a36, fruit: 0xf08a1c, avoid: (x, z) => z < MZ - 2 || (Math.abs(x - MX) < 6 && z > MZ) });
    trees(b, { rng: K.rng(14), count: q.dens(22), bounds: [MX - 60, MZ + 20, MX + 60, MZ + 90], heightAt: H, species: 'cypress', minDist: 6 });
    // ------------------------------------------------------------ countryside: olive orchards, farmsteads, cypress lines along the Sunrise road
    trees(b, { rng: K.rng(15), count: q.dens(150), bounds: [112, -140, 260, 140], heightAt: H, species: 'olive', minDist: 6.5, scale: [0.7, 1.0], avoid: (x, z) => Math.abs(z) < 10 });
    const road = Array.from({ length: 12 }, (_, i) => [GATE[0] + 6 + i * 26, Math.sin(i * 0.5) * 12]);
    b.ribbon(cobble, K.smoothPath(road, 4), 5, H, 0.2, 0xdcc89e);
    trees(b, { rng: K.rng(16), count: q.dens(46), bounds: [GATE[0] + 8, -24, 440, 24], heightAt: H, species: 'cypress', minDist: 9, avoid: (x, z) => K.distToPolyline(x, z, road).d < 5 || K.distToPolyline(x, z, road).d > 9 });
    [[150, -80], [230, 70], [200, 110], [260, -90]].forEach(([fx, fz], i) => { const y = H(fx, fz); b.box(plaster, fx, y, fz, 9, 4.4, 7, 0.3 * i, jit(0xe8cfa0, rr)); b.prism(tile, fx, y + 4.4, fz, 10, 2.8, 8, 0.3 * i, jit(0xd0683c, rr)); b.box(dark, fx + 4.6 * Math.cos(0.3 * i), y, fz - 4.6 * Math.sin(0.3 * i) * 0 + 3, 1.2, 2, 0.2, 0.3 * i); for (let k = 0; k < 3; k++) b.cone(plain, fx + 8 + k * 2.6, y, fz + 3 - k, 1.3, 2.4, { seg: 7, color: 0xd8b858 }); });   // farmsteads and haystacks
    root.add(b.build({}));
    root.add(K.banners(stalls, { pole: false }));

    // ------------------------------------------------------------ life
    const sailPath = [[-330, -90], [-240, -50], [-160, -20], [-110, 10]];
    const mk = (type, len, hull, sail) => { const s = K.ship(type, { len, hull, sail }); root.add(s); return s; };
    const HULL = [0x6a4a30, 0x7a3a2a, 0x4a3a2a, 0x2f4a5a], SAIL = [0xf0e4c8, 0xd8683a, 0xe8d8b0, 0xc9d4d8, 0xd8a838];
    const movers = [mk('galley', 16, HULL[0], SAIL[0]), mk('cog', 14, HULL[2], SAIL[1]), mk('galley', 15, HULL[1], SAIL[2]), mk('cog', 12, HULL[3], SAIL[4])];
    const moored = []; for (let i = 0; i < 9; i++) { const z = -80 + i * 20, s = mk(i % 3 ? 'cog' : 'galley', 12 + (i % 3) * 2, HULL[i % 4], SAIL[i % 5]); s.position.set(shoreX(z) - 18 - (i % 3) * 4, 0.25, z + 5.5); s.rotation.y = Math.PI; moored.push(s); }
    const pl = K.polyLength(sailPath);
    ctx.onUpdate((dt, t) => {
      movers.forEach((s, i) => { const u = (((t * 0.012) + i / movers.length) % 1) * pl, p = K.pointAlong(sailPath, u); s.position.set(p.x - (i % 2) * 30, 0.25, p.z + i * 25 - 40); s.rotation.y = p.angle; K.animateShip(s, t, i * 2); });
      moored.forEach((s, i) => K.animateShip(s, t, i));
    });
    root.add(K.smoke(placed.filter((_, i) => i % 6 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 3, p.z]), { size: 14, rise: 12, opacity: 0.2, color: 0xd8c4a8 }));
    const gulls = K.birds({ center: [-100, 40, 0], radius: 90, count: q.dens(14), color: 0xf4f2ea, size: 1.3, spreadY: 18, seed: 3 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const wk = K.walkers({ paths: [avenues[0], avenues[1], avenues[2], avenues[3], [[-62, -80], [-62, 80]], road], heightAt: H, count: q.dens(70), rng: K.rng(5), colors: [0xb8402e, 0xd89b2f, 0x2f6f8f, 0xe8d8b0, 0x8a3b6a, 0x6b4a30] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const fireSpots = [[RT[0] - 14, rty + 25.4, RT[1] - 10], [RT[0] + 14, rty + 25.4, RT[1] - 10], [RT[0] - 14, rty + 25.4, RT[1] + 10], [RT[0] + 14, rty + 25.4, RT[1] + 10], [GATE[0] - 6, H(...GATE) + 4, -6], [GATE[0] - 6, H(...GATE) + 4, 6]];
    const fire = K.fires(fireSpots, { size: 6, light: q.low ? 0 : 2 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    root.add(K.banners([[PX, PY + 36, PZ - 6], [GATE[0], H(...GATE) + 36, 6], [MX, MY + 22, MZ - 8], [RT[0], rty + 38, RT[1]]].map(([x, y, z]) => ({ x, y, z, w: 3, h: 7, color: 0xc0623a, ry: 0.3 }))));
    const cl = K.clouds({ y: 230, extent: 650, count: 8, opacity: 0.3, color: 0xfff2dc }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 250, center: [10, 0, 0], minDistance: 18,
      hero: { pos: [-205, 105, 150], target: [20, 8, -5] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x5a68a0, horizon: 0xf6b48c, fog: 0xe8b498, fogD: 0.0013, sunC: 0xffb070, sunI: 3.0, hemiSky: 0xb4a8c8, hemiGround: 0x6a4a3a, hemiI: 0.8 },
        day: { top: 0x4686ca, horizon: 0xf4e2c4, fog: 0xe8d6b8, fogD: 0.0011, sunC: 0xfff0d0, sunI: 3.3, hemiSky: 0xb8d0ea, hemiGround: 0x8a6a48, hemiI: 1.05 },
        dusk: { top: 0x3a3478, horizon: 0xf09068, fog: 0xd08a72, fogD: 0.0013, sunC: 0xff8c50, sunI: 3.0, hemiSky: 0x9a90c0, hemiGround: 0x6a4a40, hemiI: 0.9 },
        night: { top: 0x0a0f36, horizon: 0x2c3868, fog: 0x1e2a4c, fogD: 0.0018, sunC: 0xa8c0f4, sunI: 1.9, hemiSky: 0x6a7cc0, hemiGround: 0x3a3448, hemiI: 1.3 },
      } },
      landmarks: {
        'walls-and-towers': lm(wp[34][0], wp[34][1], 22, 32), 'sunrise-gate': lm(GATE[0], GATE[1], 16, 30), 'princes-palace': lm(PX, PZ, 30, 34), 'illyrios-manse': lm(MX, MZ, 24, 16),
        'spice-towers': lm(20, 44, 14, 36), 'red-temple': lm(RT[0], RT[1], 18, 30), 'harbour': lm(-92, 0, 36, 8), 'bazaars': lm(-4, 0, 22, 6),
        'citrus-terraces': lm(PX - 30, PZ + 28, 18, 8), 'velvet-hills': lm(380, 40, 70, 50),
      },
      cutaways: [],
    };
  },
};
