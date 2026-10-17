// Myr — the lens-makers' and carpet-weavers' city on a sheltered bay. Book/TWOIAF anchors: Free City on the Narrow Sea/Sea of Myrth shore,
// famed for lenses (Myrish eyes), glass, mirrors, lace and carpets; rules itself by a conclave of magisters; fights over the Disputed Lands
// with hired free companies rather than citizens. Everything about plan and buildings is interpretation (see content/myr.js): an orderly,
// gridded walled city with moles closing its harbour, glassworks, carpet yards and mercenary camps outside the walls.
// Polish pass: strictly ordered blocks with per-block teal / blue / terracotta roof themes, banded brick walls, glass-roofed workshops that
// glow from within at night, brass lens domes, patterned carpets with fringe, lamp posts at every crossing, painted farmland, sea/land skirts.
import * as K from '../kit/index.js';
const { THREE, Batch, tri, flat, glow } = K;

const _hsl = {};
function jit(hex, r, dh = 0.012, ds = 0.07, dl = 0.05) { const c = new THREE.Color(hex); c.getHSL(_hsl); return c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, K.clamp(_hsl.s + r.range(-ds, ds), 0, 1), K.clamp(_hsl.l + r.range(-dl, dl), 0, 1)); }
const shade = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const rot = (dx, dz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return [dx * c + dz * s, -dx * s + dz * c]; };
function skirt(root, cx, cz, w, d, y, color) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color, roughness: 1 })); m.position.set(cx, y, cz); root.add(m); }

const treeMat = flat(0xffffff, { rough: 1, flatShading: false }), trunkMat = flat(0x6b5238, { rough: 1 });
function trees(b, { rng = K.rng(1), count = 50, bounds, heightAt = () => 0, avoid, species = 'oak', scale = [0.8, 1.2], minDist = 4, tint }) {
  const pts = K.scatter({ rng, count, bounds, minDist, avoid });
  const greens = { oak: [0x5f8a3c, 0x6b9a45, 0x4f7a34], cypress: [0x2f4f3a, 0x38583f, 0x2a4634], olive: [0x8a9a62, 0x7d8f58, 0x6f8450] }[species];
  for (const [x, z] of pts) {
    const k = rng.range(scale[0], scale[1]), y = heightAt(x, z), gc = jit(tint ?? rng.pick(greens), rng, 0.012, 0.06, 0.05);
    if (species === 'cypress') { b.cyl(trunkMat, x, y, z, 0.3 * k, 1.4 * k, { seg: 5 }); b.cone(treeMat, x, y + 1.0 * k, z, 1.5 * k, 8.5 * k, { seg: 7, color: gc }); }
    else { b.cyl(trunkMat, x, y, z, 0.35 * k, 2.2 * k, { seg: 5, color: 0x7a6a56 }); b.sphere(treeMat, x, y + 1.8 * k, z, 2.2 * k, { seg: 7, sy: 0.7, color: gc }); b.sphere(treeMat, x + 1.0 * k, y + 2.4 * k, z - 0.6 * k, 1.5 * k, { seg: 6, sy: 0.7, color: shade(gc.getHex(), 1.12) }); }
  }
  return pts;
}

const SHORE = -80;                                   // quay line; sea to the west
const CX0 = -72, CX1 = 152, CZ0 = -88, CZ1 = 88;     // wall rectangle
const MOLES = [[-84, -82, -238, -82], [-84, 82, -238, 82]];
const EDGE = 2.4;
const TEAL = [0x3a9aa4, 0x4aa896, 0x3489a0], BLUE = [0x5a84be, 0x7a9acc, 0x4f78b2], TERRA = [0xc4663a, 0xb85a34, 0xd0764a];
const THEMES = [TEAL, BLUE, TERRA];

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(4141);
    const heightAt = (x, z) => {
      const sx = SHORE + Math.sin(z * 0.04) * 3;
      let h = 1.5 + (K.fbm(x * 0.012, z * 0.012, 3, 5) - 0.5) * 4 + K.smoothstep(150, 420, x) * 26 + K.smoothstep(200, 520, x) * K.fbm(x * 0.01, z * 0.01, 3, 8) * 24;
      for (const [hx, hz, hr, hh] of [[-170, -230, 120, 26], [-170, 230, 120, 26], [-60, 320, 150, 18], [-60, -320, 150, 18]]) { const d = Math.hypot(x - hx, z - hz); h = Math.max(h, -6 + (hh + 6) * (1 - K.smoothstep(hr * 0.3, hr, d))); }
      { const dxr = Math.max(CX0 - x, 0, x - CX1), dzr = Math.max(CZ0 - z, 0, z - CZ1), m = 1 - K.smoothstep(0, 14, Math.hypot(dxr, dzr)); h = h + (1.8 - h) * m * 0.95; }
      const dx = x - sx; if (dx < 0) { const wB = 1 - K.smoothstep(125, 185, Math.abs(z)); h = h + (Math.min(h, 0.8 + dx * 0.2) - h) * wB; }
      const ed = Math.max(K.smoothstep(520, 690, Math.abs(x)), K.smoothstep(540, 690, Math.abs(z)));
      return h + (EDGE - h) * ed * K.smoothstep(0.2, 1.8, h);
    };
    const sandC = new THREE.Color(0xe6d6ac), hill = new THREE.Color(0x8d9a62), seabed = new THREE.Color(0x509a9c), pave = new THREE.Color(0xe2d4b4), wet = new THREE.Color(0xbfae86), c = new THREE.Color();
    const FIELD = [0xaebc66, 0xcbbd68, 0x9db25c, 0xb6a85a, 0xc4c872, 0x93a95a].map((x) => new THREE.Color(x));
    root.add(K.terrain({ size: 1400, seg: q.seg(190), heightAt, kind: 'plaster', scale: 28, colorAt: (x, z, h) => {
      if (h < 0) return c.copy(seabed).lerp(sandC, K.clamp(1 + h / 2.5, 0, 1));
      c.copy(sandC).lerp(FIELD[0], K.smoothstep(0.8, 3.5, h));
      const u = x * 0.94 + z * 0.34, v = z * 0.94 - x * 0.34, cell = Math.floor(u / 30) * 5 + Math.floor(v / 46) * 3, f = FIELD[((cell % 6) + 6) % 6];
      const edge = Math.min(((u % 30) + 30) % 30, ((v % 46) + 46) % 46); c.lerp(f, 0.85 * K.smoothstep(0, 1.3, edge) * K.smoothstep(0.8, 3, h));
      c.multiplyScalar(0.97 + 0.06 * K.noise2(u * 0.2, v * 0.2, 3));
      if (x > 200) c.lerp(hill, K.smoothstep(200, 400, x) * 0.7);
      const inW = Math.max(Math.abs(x - (CX0 + CX1) / 2) - (CX1 - CX0) / 2, Math.abs(z) - CZ1);
      c.lerp(pave, 0.9 * (1 - K.smoothstep(-2, 14, inW)) * (x > SHORE + 6 ? 1 : 0.4));
      if (h < 1.0) c.lerp(wet, 0.5 * K.clamp((1.0 - h), 0, 1));
      return c;
    } }));
    const wopt = { deep: 0x1a708f, shallow: 0x62bcbe, opacity: 0.9, choppy: 0.25, speed: 0.4 };
    const wat = K.water({ w: 1400, d: 1400, seg: q.seg(130), level: 0, heightAt, ...wopt });
    root.add(wat); ctx.registerWater(wat);
    for (const [cx, cz, w, d] of [[0, -2200, 8000, 3000], [0, 2200, 8000, 3000], [-2200, 0, 3000, 1400], [2200, 0, 3000, 1400]]) { const sk = K.water({ w, d, seg: 2, level: 0, heightAt: () => -8, center: [cx, cz], ...wopt }); root.add(sk); ctx.registerWater(sk); }
    // far land: plains and hills beyond the terrain edge (the bay continues west between the two western skirts)
    const LC = 0x9aa266;
    skirt(root, 0, -1900, 9000, 2400, EDGE - 0.1, LC); skirt(root, 0, 1900, 9000, 2400, EDGE - 0.1, LC); skirt(root, 2200, 0, 3000, 1400, EDGE - 0.1, LC); skirt(root, -2200, -425, 3000, 550, EDGE - 0.1, LC); skirt(root, -2200, 425, 3000, 550, EDGE - 0.1, LC);

    const plaster = tri('plaster', { color: 0xffffff, scale: 6, snow: false }), tile = tri('tile', { color: 0xffffff, scale: 10, snow: false, rough: 0.72, bump: 0.6 }), brick = tri('brick', { color: 0xffffff, scale: 7, snow: false, bump: 0.6 });
    const stone = tri('stone', { color: 0xf0e8d6, scale: 8, snow: false, bump: 0.6 }), cobble = tri('cobble', { color: 0xf0e4cc, scale: 8, snow: false });
    const wood = tri('wood', { color: 0xd8c0a0, scale: 4, snow: false }), marble = tri('marble', { color: 0xf8f2e8, scale: 7, snow: false, rough: 0.4 });
    const glass = flat(0xa4e4ee, { rough: 0.06, metal: 0.25, transparent: true, opacity: 0.55, flatShading: false }), brass = flat(0xd6a840, { rough: 0.38, metal: 0.3, flatShading: false });
    const windowG = glow(0xffc46b), kilnG = glow(0xff7a2a, 1.4), lan = glow(0xffb060, 1.3), plain = flat(0xffffff, { rough: 0.95, flatShading: false }), dark = flat(0x2a1f1a, { rough: 1 }), awning = flat(0xffffff, { rough: 1, side: THREE.DoubleSide, flatShading: false });
    const b = new Batch(), gb = new Batch(), H = heightAt;
    const BRK = 0xf2d2b2, WALLC = [0xf0e2c6, 0xe8d5b0, 0xf6ecd8, 0xe4cca4, 0xefd9ba];

    // ---------------------------------------------------------------- orderly walls: rectangle, regular towers, three land gates
    const rectPts = [[CX0, CZ0], [CX1, CZ0], [CX1, CZ1], [CX0, CZ1]];
    K.wall(b, rectPts, { h: 13, t: 4.4, mat: brick, capMat: brick, heightAt: H, closed: false, sink: 4, color: shade(0xfbe2c8, 1.3) });
    for (let i = 0; i < 3; i++) { const [x0, z0] = rectPts[i], [x1, z1] = rectPts[i + 1], dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz), N = Math.ceil(l / 14); for (let k = 0; k < N; k++) { const t0 = k / N, t1 = (k + 1) / N, ax = x0 + dx * t0, az = z0 + dz * t0, bx = x0 + dx * t1, bz = z0 + dz * t1, mx = (ax + bx) / 2, mz = (az + bz) / 2, ry = K.headingX(dx, dz), g = Math.min(H(ax, az), H(bx, bz)), sl = l / N;
      b.box(brick, mx, g - 2.2, mz, sl + 0.3, 3.8, 5.8, ry, 0xe0b898); b.box(stone, mx, g + 6, mz, sl + 0.3, 0.6, 4.8, ry, 0xf0e2c8); b.box(brick, mx, g + 6.6, mz, sl + 0.3, 0.9, 4.65, ry, 0x2e8c9a); b.box(stone, mx, Math.max(H(ax, az), H(bx, bz)) + 12.1, mz, sl + 0.3, 0.9, 5.1, ry, 0xf6ead4); } }
    const tower = (x, z, w, hh, col, pyr = 6) => { const y = H(x, z); K.squareTower(b, x, z, { w, h: hh, y, mat: brick, roofMat: tile, roof: 'pyramid', roofH: pyr, windows: false, color: shade(0xfde6cc, 1.3), roofColor: col }); b.box(stone, x, y + hh - 1.8, z, w + 1.6, 0.9, w + 1.6, 0, 0xf0e2c8); b.box(brick, x, y - 1.6, z, w + 1.8, 4, w + 1.8, 0, 0xdcb090); b.sphere(lan, x, y + hh + pyr + 0.9, z, 0.45, { seg: 5 }); for (const sd of [-1, 1]) { b.box(windowG, x + sd * (w / 2 + 0.05), y + hh * 0.6, z, 0.15, 2.2, 0.9, 0); b.box(windowG, x, y + hh * 0.6, z + sd * (w / 2 + 0.05), 0.9, 2.2, 0.15, 0); } };
    for (let x = CX0; x <= CX1 + 1; x += 28) for (const z of [CZ0, CZ1]) tower(x, z, 8, 20, TEAL[0]);
    for (let z = CZ0 + 28; z < CZ1; z += 28) tower(CX1, z, 8, 20, TEAL[0]);
    for (const [x, z] of rectPts) tower(x, z, 11, 27, BLUE[0], 9);
    const gates = [[CX1, 0, Math.PI / 2], [28, CZ0, 0], [28, CZ1, 0]];
    gates.forEach(([x, z, ry]) => { K.gatehouse(b, x, z, { y: H(x, z), ry, mat: brick, roofMat: tile, w: 20, d: 9, h: 21, gate: 6.5, wood, towerR: 4.6, color: shade(0xfde6cc, 1.3), roofColor: BLUE[0] }); b.box(stone, x, H(x, z) + 21, z, ry ? 10.4 : 21, 0.9, ry ? 21 : 10.4, 0, 0xf6ead4); });
    // seafront: quay wall with sea gates, two long moles enclosing the sheltered harbour
    b.extrude(stone, [[SHORE - 8, CZ0], [SHORE + 6, CZ0], [SHORE + 6, CZ1], [SHORE - 8, CZ1]], -1, 2.4, 0xf0e8d4);
    b.extrude(marble, [[SHORE - 8.1, CZ0], [SHORE - 6.9, CZ0], [SHORE - 6.9, CZ1], [SHORE - 8.1, CZ1]], 1.4, 0.5, 0xfaf2e0);
    MOLES.forEach(([x0, z0, x1, z1]) => { const sg = Math.sign(z0); b.extrude(stone, [[x1, z0 - 6 * sg], [x0, z0 - 6 * sg], [x0, z0 + 6 * sg], [x1, z0 + 6 * sg]], -2, 4.4, 0xe8dec8); b.extrude(marble, [[x1, z0 - 6.5 * sg], [x0, z0 - 6.5 * sg], [x0, z0 - 5.5 * sg], [x1, z0 - 5.5 * sg]], 2.3, 0.6, 0xf6ead4); for (let x = x1; x < x0; x += 40) { const ty = 2.4; K.squareTower(b, x + 4, z0, { w: 7, h: 12, y: ty, mat: brick, roofMat: tile, roof: 'pyramid', roofH: 4, windows: false, color: shade(0xfde6cc, 1.3), roofColor: TEAL[0] }); b.sphere(lan, x + 4, ty + 17, z0, 0.4, { seg: 5 }); } });
    for (const sg of [-1, 1]) { const x = -238, z = sg * 82; K.tower(b, x, z, { r: 6, h: 22, y: 2.4, mat: brick, roofMat: tile, roof: 'cone', roofH: 9, seg: 12, windows: true, color: shade(0xfde6cc, 1.3), roofColor: BLUE[0], taper: 0.85 }); b.cyl(stone, x, 2.4, z, 7, 1.0, { seg: 12, color: 0xf0e2c8 }); b.sphere(kilnG, x, 2.4 + 22 + 10.5, z, 1.1, { seg: 6 }); }
    for (let i = 0; i < 9; i++) { const z = CZ0 + 14 + i * 20; K.pier(b, SHORE - 6, 1.2, z, { len: 30 + (i % 3) * 8, w: 3.4, ry: Math.PI, mat: wood, color: 0xbfa070 }); b.sphere(lan, SHORE - 7, 2.9, z + 1.5, 0.35, { seg: 5 }); }
    for (let z = CZ0 + 4; z < CZ1; z += 10) { b.cyl(stone, SHORE - 6, 1.5, z, 0.45, 0.9, { seg: 6, color: 0x5a4a3a }); }

    // ---------------------------------------------------------------- the grid: blocks of courtyard houses, per-block roof themes
    const STREETS = []; for (const x of [-72, -34, 4, 42, 80, 118, 152]) STREETS.push([[x, CZ0], [x, CZ1]]); for (const z of [-88, -58, -28, 2, 32, 62, 88]) STREETS.push([[CX0, z], [CX1, z]]);
    STREETS.forEach((s) => b.ribbon(cobble, s, 7, H, 0.2, 0xeadec6));
    for (const x of [-72, -34, 4, 42, 80, 118, 152]) for (const z of [-88, -58, -28, 2, 32, 62, 88]) { const lx = x + 4, lz = z + 4; if (lx > CX1 + 1 || lz > CZ1 + 1) continue; const y = H(lx, lz); b.cyl(wood, lx, y, lz, 0.14, 3.6, { seg: 4, color: 0x4a3a2a }); b.sphere(lan, lx, y + 3.9, lz, 0.4, { seg: 6 }); }   // street lamps at every crossing
    const special = { square: [24, 2, 24, 22], hall: [24, -28, 22, 14], lens: [62, 32, 30, 20], glass: [100, -58, 26, 20], carpet: [100, 32, 30, 20], eye: [-34, 62, 8, 8] };
    const inRect = ([cx, cz, hw, hd], x, z, m = 0) => Math.abs(x - cx) < hw + m && Math.abs(z - cz) < hd + m;
    b.extrude(tri('plaster', { color: 0xffffff, scale: 9, snow: false }), [[CX0, CZ0], [CX1, CZ0], [CX1, CZ1], [CX0, CZ1]], 1.0, 0.95, 0xe6d8bc);
    const rng = K.rng(41); const placed = [];
    const row = (x0, x1, z, ry, depth, theme, base) => { let x = x0 + 0.5; while (x < x1 - 4) { const w = rng.range(5.4, 7.4), h = base + rng.range(-0.6, 0.9); if (x + w > x1) break; const cx = x + w / 2, y = H(cx, z);
      const wc = jit(rng.pick(WALLC), rng, 0.008, 0.04, 0.03), rc = jit(rng.pick(theme), rng, 0.01, 0.06, 0.04), st = rng();
      b.box(brick, cx, y - 1.2, z, w + 0.4, 2.2, depth + 0.4, ry, jit(BRK, rng, 0.01, 0.04, 0.04));
      b.box(plaster, cx, y + 1, z, w, h - 1, depth, ry, wc); b.box(stone, cx, y + h - 0.4, z, w + 0.6, 0.8, depth + 0.6, ry, 0xf8eedc);
      if (st < 0.55) b.pyramid(tile, cx, y + h + 0.4, z, w + 0.8, Math.min(w, depth) * 0.5 + 0.8, depth + 0.8, ry, rc); else if (st < 0.9) b.prism(tile, cx, y + h + 0.4, z, w + 0.8, Math.min(w, depth) * 0.45 + 0.8, depth + 0.8, ry, rc); else { b.box(plaster, cx, y + h + 0.4, z, w + 0.3, 0.4, depth + 0.3, ry, wc); b.box(awning, cx, y + h + 2.0, z, w * 0.6, 0.14, depth * 0.5, ry, rc, -0.1); }
      const [dx, dz] = rot(0, depth / 2 + 0.06, ry); b.box(dark, cx + dx, y, z + dz, 1.3, 2.3, 0.2, ry); for (const sd of [-1, 1]) { const [wx, wz] = rot(sd * w * 0.27, depth / 2 + 0.06, ry); b.box(windowG, cx + wx, y + h * 0.55, z + wz, 0.8, 1.3, 0.12, ry); }
      placed.push({ x: cx, z, h }); x += w + 0.35; } };
    const blocks = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      const x0 = [-68, -30, 8, 46, 84, 122][i] + 4, x1 = x0 + 30, z0 = [-84, -54, -24, 6, 36, 66][j] + 4.5, z1 = z0 + 21;
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      if (Object.values(special).some((s) => inRect(s, cx, cz, 2))) continue;
      blocks.push([x0, x1, z0, z1]);
      const theme = THEMES[(i + j * 2) % 3], base = 6.2 + ((i * 3 + j) % 3) * 0.7;
      row(x0, x1, z0 + 4.5, 0, 8, theme, base); row(x0, x1, z1 - 4.5, Math.PI, 8, theme, base);
      const wx = (x0 + x1) / 2, wz = (z0 + z1) / 2, wy = H(wx, wz); b.cyl(stone, wx, wy, wz, 1.4, 1, { seg: 10, color: 0xe8dcc0 }); b.cyl(wood, wx, wy + 1, wz, 0.1, 1.8, { seg: 4, color: 0x5a4a3a }); b.box(awning, wx, wy + 2.7, wz, 2.2, 0.1, 1.6, 0, theme[0]);   // courtyard well with canopy
    }
    // ---------------------------------------------------------------- central square & the Magisters' hall
    const SQ = special.square, sy = H(SQ[0], SQ[1]);
    b.extrude(cobble, [[SQ[0] - SQ[2], SQ[1] - SQ[3]], [SQ[0] + SQ[2], SQ[1] - SQ[3]], [SQ[0] + SQ[2], SQ[1] + SQ[3]], [SQ[0] - SQ[2], SQ[1] + SQ[3]]], sy - 0.3, 0.5, 0xf6ecd4);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) b.box(plain, SQ[0] - 9 + i * 6, sy + 0.24, SQ[1] - 9 + j * 6, 6, 0.08, 6, 0, (i + j) % 2 ? 0xe2d2ac : 0xefe3c6);    // chequered paving
    const stalls = []; for (let i = 0; i < 14; i++) { const x = SQ[0] - 20 + (i % 7) * 6.6, z = SQ[1] + (i < 7 ? -12 : 12); b.box(wood, x, sy + 0.2, z, 3.4, 1.4, 2.2, 0, 0xb08a60); for (const s of [-1, 1]) b.cyl(wood, x + s * 1.7, sy + 0.2, z + 1.0, 0.1, 3.2, { seg: 4, color: 0x6a4a30 }); stalls.push({ x, y: sy + 3.4, z, w: 3.8, h: 1.6, color: [0x2f5d9a, 0xc4663a, 0x2e8c9a, 0xd8a838, 0x8a3b6a][i % 5], ry: 0 }); }
    b.cyl(marble, SQ[0], sy + 0.3, SQ[1], 2.8, 1.0, { seg: 16 }); b.cyl(marble, SQ[0], sy + 1.3, SQ[1], 0.5, 2.4, { seg: 8 }); b.cyl(marble, SQ[0], sy + 3.4, SQ[1], 1.4, 0.3, { seg: 10 }); b.sphere(brass, SQ[0], sy + 4.4, SQ[1], 0.7, { seg: 8 });
    const HL = special.hall, hy = H(HL[0], HL[1]);
    b.extrude(stone, [[HL[0] - 24, HL[1] - 16], [HL[0] + 24, HL[1] - 16], [HL[0] + 24, HL[1] + 14], [HL[0] - 24, HL[1] + 14]], hy - 4, 4.5, 0xf0e8d4);
    for (let i = 0; i < 4; i++) b.box(stone, HL[0], hy + 0.0, HL[1] + 14.4 + (3 - i) * 1.0, 30, 0.35 * (i + 1) * 0.5 + 0.2, 1.1, 0, 0xf6ecd8);
    b.box(marble, HL[0], hy + 0.5, HL[1], 40, 12, 20, 0, 0xfaf4e8); b.box(marble, HL[0], hy + 12.2, HL[1], 41.6, 0.8, 21.6, 0, 0xf0e4cc); b.prism(tile, HL[0], hy + 12.8, HL[1], 42, 6, 22, 0, BLUE[0]);
    b.cyl(marble, HL[0], hy + 12.5, HL[1], 6.5, 6, { seg: 18 }); b.cyl(marble, HL[0], hy + 18.4, HL[1], 7.2, 0.6, { seg: 18, color: 0xf0e4cc }); b.dome(brass, HL[0], hy + 19, HL[1], 6.8, { seg: 18 }); b.cyl(brass, HL[0], hy + 25.4, HL[1], 0.25, 3, { seg: 4 });
    for (let i = -7; i <= 7; i++) b.cyl(marble, HL[0] + i * 2.6, hy + 0.5, HL[1] + 11.5, 0.5, 9, { seg: 10, top: 0.9 }); b.box(marble, HL[0], hy + 9.5, HL[1] + 11.5, 40, 0.8, 2.4, 0);
    for (let i = -3; i <= 3; i++) b.box(windowG, HL[0] + i * 5, hy + 4.2, HL[1] + 10.05, 1.3, 3.4, 0.12);
    for (const sg of [-1, 1]) { K.tower(b, HL[0] + sg * 24, HL[1] - 4, { r: 3, h: 22, y: hy, mat: marble, roofMat: tile, roof: 'cone', roofH: 8, seg: 12, windows: true, color: 0xfaf4e8, roofColor: TEAL[0], taper: 0.84 }); b.cyl(marble, HL[0] + sg * 24, hy + 12, HL[1] - 4, 2.9, 0.5, { seg: 12, color: 0xf0e4cc }); }

    // ---------------------------------------------------------------- Lens-makers' quarter: glass-roofed workshops with brass lenses; the Myrish eye tower
    const LQ = special.lens, ly = H(LQ[0], LQ[1]);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
      const x = LQ[0] - 22 + i * 14, z = LQ[1] - 10 + j * 18; b.box(brick, x, ly - 1, z, 11.4, 2.2, 12.4, 0, 0xe0b898); b.box(plaster, x, ly + 0.5, z, 11, 5, 12, 0, jit(0xf4ead4, rr));
      b.box(windowG, x, ly + 5.02, z, 9.6, 0.1, 10.6, 0);     // lit interior shows through the glass at night
      for (let k = 0; k <= 4; k++) b.box(brass, x - 5.2 + k * 2.6, ly + 5.0, z, 0.2, 0.25, 12.4, 0, 0x7a808a);
      gb.prism(glass, x, ly + 5, z, 11.4, 4, 12.4, 0, 0xa8e8f0);
      b.box(brass, x, ly + 8.9, z, 11.6, 0.35, 0.35, 0, 0xffffff); for (const dx of [-3, 3]) { b.cyl(brass, x + dx, ly + 8.9, z, 1.2, 0.5, { seg: 12 }); b.sphere(brass, x + dx, ly + 9.3, z, 1.1, { seg: 10, sy: 0.55 }); } b.box(plain, x, ly + 5.1, z - 6.1, 11.6, 0.4, 0.4, 0, 0x8a8f98); b.box(plain, x, ly + 5.1, z + 6.1, 11.6, 0.4, 0.4, 0, 0x8a8f98);
      b.cyl(brass, x + 2, ly + 5, z, 0.9, 0.5, { seg: 12 }); b.sphere(brass, x + 2, ly + 5.5, z, 0.8, { seg: 8, sy: 0.5 }); b.box(windowG, x, ly + 1.4, z + 6.05, 5, 2, 0.1); b.box(dark, x - 4.6, ly, z + 6.04, 1.3, 2.4, 0.15);
    }
    const ET = special.eye, ey = H(ET[0], ET[1]);
    K.tower(b, ET[0], ET[1], { r: 3.2, h: 36, y: ey, mat: brick, roofMat: tile, roof: 'flat', seg: 12, windows: true, color: shade(0xfde6cc, 1.3), crenel: false, taper: 0.82 });
    b.cyl(brick, ET[0], ey - 2, ET[1], 5.4, 4, { seg: 12, top: 0.8, color: 0xe0b898 }); for (const k of [0.3, 0.6]) b.cyl(stone, ET[0], ey + 36 * k, ET[1], 3.2 * (1 - 0.18 * k) + 0.35, 0.6, { seg: 12, color: 0xf0e2c8 });
    b.cyl(stone, ET[0], ey + 36, ET[1], 4.6, 1.0, { seg: 14, color: 0xf0e2c8 }); b.box(brass, ET[0], ey + 37.4, ET[1], 1.4, 1.4, 12, 0, 0xffffff, -0.5, 0); b.cyl(brass, ET[0], ey + 37, ET[1], 2.2, 0.7, { seg: 12 }); b.sphere(brass, ET[0], ey + 40.2, ET[1] - 4.6, 1.5, { seg: 10 });
    // ---------------------------------------------------------------- Glassworks: kilns & chimneys (NE corner)
    const GW = special.glass, gy = H(GW[0], GW[1]); const kilns = [];
    for (let i = 0; i < 5; i++) { const x = GW[0] - 18 + i * 9, z = GW[1] + (i % 2 ? 4 : -4); b.cyl(brick, x, gy - 1, z, 3.6, 8, { seg: 12, top: 0.7, color: 0xf0b090 }); b.cone(brick, x, gy + 7, z, 2.5, 6.5, { seg: 12, color: 0xe8a080 }); b.cyl(stone, x, gy + 3.2, z, 3.1, 0.5, { seg: 12, color: 0xf0e2c8 }); b.box(kilnG, x, gy + 0.6, z + 3.2, 1.8, 1.6, 0.15); b.box(dark, x, gy - 0.4, z + 3.35, 2.4, 2.8, 0.1); kilns.push([x, gy + 13.8, z]); }
    b.box(plaster, GW[0], gy, GW[1] + 14, 40, 5, 6, 0, 0xf0e2c6); gb.prism(glass, GW[0], gy + 5, GW[1] + 14, 40, 3, 7, 0, 0xa8e8f0); b.box(brass, GW[0], gy + 7.9, GW[1] + 14, 40.4, 0.3, 0.3, 0, 0xffffff); b.box(kilnG, GW[0], gy + 5.02, GW[1] + 14, 36, 0.1, 5.4, 0);
    for (let i = 0; i < 6; i++) b.box(brass, GW[0] - 17 + i * 6.8, gy + 5.0, GW[1] + 14, 0.2, 0.25, 7, 0, 0x7a808a);
    // ---------------------------------------------------------------- Carpet weavers: drying yard of patterned carpets and hanging racks
    const CP = special.carpet, cy = H(CP[0], CP[1]), cp = [0xa8322a, 0x2f5d9a, 0xd8a838, 0x2e8c9a, 0x7a2f6a, 0xe0d2b0], cloth = [];
    b.extrude(cobble, [[CP[0] - CP[2], CP[1] - CP[3]], [CP[0] + CP[2], CP[1] - CP[3]], [CP[0] + CP[2], CP[1] + CP[3]], [CP[0] - CP[2], CP[1] + CP[3]]], cy - 0.3, 0.5, 0xf0e4cc);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const x = CP[0] - 25 + i * 9, z = CP[1] - 14 + j * 11, col = cp[(i + j) % 6]; b.box(plain, x, cy + 0.25, z, 8.0, 0.1, 8.6, 0, 0xe8dcc0); b.box(plain, x, cy + 0.33, z, 7.4, 0.1, 8.0, 0, col); b.box(plain, x, cy + 0.42, z, 5.6, 0.1, 6.2, 0, cp[(i + j + 2) % 6]); b.box(plain, x, cy + 0.5, z, 3.6, 0.1, 4.2, 0, cp[(i + j + 4) % 6]); b.box(plain, x, cy + 0.58, z, 1.4, 0.1, 1.8, 0, cp[(i + j + 1) % 6]); }
    for (let i = 0; i < 10; i++) cloth.push({ x: CP[0] - 28 + i * 6.2, y: cy + 8, z: CP[1] - CP[3] - 1, w: 4.8, h: 7, color: cp[i % 6], ry: 0 });
    for (let i = 0; i <= 10; i++) b.cyl(wood, CP[0] - 28 + i * 6.2 - 3.1, cy, CP[1] - CP[3] - 1, 0.18, 8.6, { seg: 5, color: 0x6a4a30 }); b.box(wood, CP[0], cy + 8.5, CP[1] - CP[3] - 1, 62, 0.25, 0.25, 0, 0x6a4a30);
    for (let k = 0; k < 3; k++) { const lx = CP[0] - 24 + k * 24, lz = CP[1] + CP[3] - 3; b.box(wood, lx, cy, lz, 0.3, 3.4, 0.3, 0); b.box(wood, lx + 4, cy, lz, 0.3, 3.4, 0.3, 0); b.box(wood, lx + 2, cy + 3.2, lz, 4.4, 0.3, 0.3, 0); b.box(plain, lx + 2, cy + 0.9, lz, 3.6, 1.8, 0.1, 0, cp[k * 2 % 6]); }   // looms

    // ---------------------------------------------------------------- Mercenary camps beyond the east wall (free companies)
    const camps = [[190, -50, 0xa8322a], [196, 40, 0x2f5d9a], [226, -4, 0x35353d]], campB = [], tents = [];
    camps.forEach(([cx, cz, col], k) => {
      for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.28, r = 12 + (i % 3) * 4.5, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, y = H(x, z); b.cone(plain, x, y, z, 3.1, 4.4, { seg: 7, color: jit([0xe8dcc0, 0xd9c9a0, 0xc9b890][i % 3], rr) }); b.box(plain, x, y + 2.2, z, 3.3, 0.3, 0.2, a, col); }
      for (let i = 0; i < 20; i++) { const a = (i / 20) * 6.28, x = cx + Math.cos(a) * 25, z = cz + Math.sin(a) * 25; b.cyl(wood, x, H(x, z), z, 0.16, 2.2, { seg: 4, color: 0x6a4a30 }); b.cone(wood, x, H(x, z) + 2.2, z, 0.2, 0.7, { seg: 4, color: 0x6a4a30 }); }
      b.box(plain, cx, H(cx, cz), cz, 7, 3.2, 6, 0.2, col); b.pyramid(plain, cx, H(cx, cz) + 3.2, cz, 7.6, 3, 6.6, 0.2, shade(col, 1.2));
      campB.push({ x: cx, y: H(cx, cz) + 16, z: cz, w: 3.4, h: 6.5, color: col, ry: 0 }); tents.push([cx + 4, H(cx, cz) + 1, cz + 3], [cx - 5, H(cx, cz) + 1, cz - 5]);
    });
    // orchards and olive groves among the painted fields
    const nearCamp = (x, z, r) => camps.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < r);
    trees(b, { rng: K.rng(8), count: q.dens(110), bounds: [160, -170, 320, 170], heightAt: H, species: 'olive', minDist: 6.5, scale: [0.8, 1.1], avoid: (x, z) => nearCamp(x, z, 34) });
    trees(b, { rng: K.rng(9), count: q.dens(28), bounds: [-70, -86, 150, 86], heightAt: H, species: 'cypress', minDist: 9, avoid: (x, z) => !blocks.some(([x0, x1, z0, z1]) => x > x0 + 6 && x < x1 - 6 && z > z0 + 10 && z < z1 - 10) });
    root.add(b.build({})); root.add(gb.build({ shadow: false }));

    // ---------------------------------------------------------------- life
    const mk = (type, len, hull, sail) => { const s = K.ship(type, { len, hull, sail }); root.add(s); return s; };
    const moored = []; for (let i = 0; i < 12; i++) { const z = CZ0 + 24 + i * 12.5, s = mk(i % 4 ? 'cog' : 'galley', 12 + (i % 3) * 2, [0x4a3a2a, 0x2f4a6a, 0x6a3a2a][i % 3], [0xf0e6d0, 0xd8e4ea, 0xe8d8b0][i % 3]); s.position.set(SHORE - 22 - (i % 2) * 12, 0.25, z); s.rotation.y = Math.PI * (i % 2 ? 1 : -1) * 0.5 + Math.PI / 2; moored.push(s); }
    const sailers = [mk('galley', 16, 0x2f4a6a, 0xf0e6d0), mk('cog', 14, 0x6a3a2a, 0xe8d8b0), mk('galley', 15, 0x3a4a3a, 0xd8e4ea)];
    const path = [[-440, 40], [-340, 10], [-260, 0], [-190, 0], [-130, 4]]; const pl = K.polyLength(path);
    ctx.onUpdate((dt, t) => { sailers.forEach((s, i) => { const u = (((t * 0.011) + i / 3) % 1) * pl, p = K.pointAlong(path, u); s.position.set(p.x, 0.25, p.z + (i - 1) * 16); s.rotation.y = p.angle; K.animateShip(s, t, i * 2); }); moored.forEach((s, i) => K.animateShip(s, t, i)); });
    root.add(K.smoke(kilns, { size: 22, rise: 20, opacity: 0.3, color: 0x8a8a90, perStack: 8 }));
    root.add(K.smoke(blocks.filter((_, i) => i % 3 === 0).map(([x0, x1, z0, z1]) => [(x0 + x1) / 2, H((x0 + x1) / 2, (z0 + z1) / 2) + 11, (z0 + z1) / 2]), { size: 14, rise: 10, opacity: 0.18, color: 0xdcd4c8 }));
    const gulls = K.birds({ center: [-150, 40, 0], radius: 110, count: q.dens(14), color: 0xffffff, size: 1.3, spreadY: 16, seed: 3 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const wk = K.walkers({ paths: [STREETS[0 + 7 + 3], STREETS[7 + 1], STREETS[7 + 4], STREETS[2], STREETS[3], [[SHORE + 2, -70], [SHORE + 2, 70]]], heightAt: H, count: q.dens(80), rng: K.rng(5), colors: [0x2f5d9a, 0xa8322a, 0xd8a838, 0x2e8c9a, 0xe0d2b0] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    root.add(K.banners(stalls, { pole: false })); root.add(K.banners(cloth, { pole: false }));
    root.add(K.banners([...campB, ...gates.map(([x, z]) => ({ x, y: H(x, z) + 29, z, w: 3.4, h: 7, color: 0x2f5d9a, ry: 0.4 })), { x: HL[0], y: hy + 32, z: HL[1], w: 4, h: 9, color: 0x2e8c9a, ry: 0.3 }]));
    const fire = K.fires([...tents, ...kilns.map(([x, y, z]) => [x, y - 1, z]), [-238, 36, 82], [-238, 36, -82]], { size: 5, light: 0 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update?.(t));
    const cl2 = K.clouds({ y: 240, extent: 700, count: 7, opacity: 0.3, color: 0xfffaf0 }); root.add(cl2); ctx.onUpdate((dt) => cl2.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 250, center: [30, 0, 0], minDistance: 18,
      hero: { pos: [-215, 105, 150], target: [30, 8, 0] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x5c74a8, horizon: 0xf0c0aa, fog: 0xe0c0b4, fogD: 0.0012, sunC: 0xffc496, sunI: 2.9, hemiSky: 0xb4bcdc, hemiGround: 0x6a5a50, hemiI: 0.85 },
        day: { top: 0x5090d4, horizon: 0xeaf0f0, fog: 0xdce6ea, fogD: 0.0011, sunC: 0xfff4de, sunI: 3.2, hemiSky: 0xbcd6f0, hemiGround: 0x8a8068, hemiI: 1.1 },
        dusk: { top: 0x3a4482, horizon: 0xf0a082, fog: 0xd29488, fogD: 0.0013, sunC: 0xff9a64, sunI: 2.9, hemiSky: 0xa4a4d0, hemiGround: 0x6a5252, hemiI: 0.95 },
        night: { top: 0x0a1236, horizon: 0x2a3e68, fog: 0x1c2a4a, fogD: 0.0017, sunC: 0xa8c0f2, sunI: 1.9, hemiSky: 0x6c82c4, hemiGround: 0x3a3c52, hemiI: 1.3 },
      } },
      landmarks: {
        'sheltered-bay': lm(-160, 0, 60, 8), 'city-walls': lm(CX1, 0, 22, 30), 'magisters-hall': lm(HL[0], HL[1], 24, 28), 'market-square': lm(SQ[0], SQ[1], 18, 6),
        'lens-makers-quarter': lm(LQ[0], LQ[1], 26, 12), 'myrish-eye-tower': lm(ET[0], ET[1], 10, 42), 'glassworks': lm(GW[0], GW[1], 22, 14), 'carpet-weavers': lm(CP[0], CP[1], 26, 10),
        'mercenary-camps': lm(196, 0, 50, 10),
      },
      cutaways: [],
    };
  },
};
