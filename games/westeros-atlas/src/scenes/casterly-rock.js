// Casterly Rock — moderate scene. Book anchors: Lannister seat, a colossal rock above the sea, the Lion's Mouth cavern entrance, mines/gold,
// its watchtower/ravenry and sea access, with the port of Lannisport below. Shapes, positions and the stair are interpretation.
import * as K from '../kit/index.js';
const { THREE, Batch, tri, flat, glow } = K;

const LOBES = [[-48, 2, 50, 40, 98], [14, -8, 62, 46, 152], [84, 4, 46, 38, 112], [30, -52, 40, 30, 70]];
const COAST = (z) => -94 + 14 * Math.sin(z * 0.03);
const STAIR_X = 16;

const _jc = new THREE.Color();
/** Deterministic colour variation around a hex value (per-building weathering). */
const vary = (r, hex, a = 0.1) => { _jc.set(hex); const k = 1 + (r() - 0.5) * 2 * a; _jc.r = Math.min(1, _jc.r * k * (1 + (r() - 0.5) * a)); _jc.g = Math.min(1, _jc.g * k); _jc.b = Math.min(1, _jc.b * k * (1 + (r() - 0.5) * a)); return _jc.getHex(); };
/** Instanced, pulsing sea-foam rings (one draw call). rings: [[x,z,r]] */
function foamRings(ctx, rings, { y = 0.3, width = 3, opacity = 0.5, speed = 0.9 } = {}) {
  const g = new THREE.RingGeometry(0.9, 1, 28, 1); g.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending, fog: true });
  const n = rings.length * 2, m = new THREE.InstancedMesh(g, mat, n); m.frustumCulled = false; m.renderOrder = 3;
  const o = new THREE.Object3D(), c = new THREE.Color();
  ctx.root.add(m);
  ctx.onUpdate((dt, t) => {
    for (let i = 0; i < n; i++) {
      const [x, z, r] = rings[i >> 1], ph = ((t * 0.18 * speed + (i & 1) * 0.5 + (i >> 1) * 0.173) % 1);
      const s = r + 1 + ph * width * 2.2;
      o.position.set(x, y, z); o.scale.set(s, 1, s); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      const a = Math.sin(ph * Math.PI) * opacity * 0.55; m.setColorAt(i, c.setRGB(a, a, a));
    }
    m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true;
  });
}


// Local tree helper: K.forest's crown material is vertexColors-based and renders black when instanced, so scenes build their own.
const PLAIN = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true });
function grove({ rng = K.rng(3), count = 100, bounds, poly, heightAt = () => 0, avoid = () => false, species = 'oak', scale = [0.9, 1.3], minDist = 4, tint, greens }) {
  const pts = K.scatter({ rng, count, bounds, poly, minDist, avoid }), grp = new THREE.Group();
  const trunk = new K.Inst(K.G.cyl(6, 0.7), K.tri('wood', { color: 0x6b5238, scale: 3, snow: false })), crown = new K.Inst(species === 'cypress' || species === 'pine' ? K.G.cone(7) : K.G.sphere(7), PLAIN);
  const gs = greens || { oak: [0x4b7a3a, 0x58863f, 0x3f6a33], cypress: [0x2f5a3a, 0x386a42], pine: [0x2c4a35, 0x35563b], weirwood: [0xf0ece2, 0xe6e0d4], olive: [0x8a9a62, 0x7c8c58], palm: [0x3f8f45, 0x4aa04d] }[species];
  for (const [x, z] of pts) {
    const k = rng.range(scale[0], scale[1]), y = heightAt(x, z), gc = tint ?? rng.pick(gs);
    if (species === 'cypress') { trunk.add(x, y, z, 0.35 * k, 2 * k, 0.35 * k, 0, 0x5d4733); crown.add(x, y + 1.2 * k, z, 1.5 * k, 9 * k, 1.5 * k, rng() * 6, gc); }
    else if (species === 'pine') { trunk.add(x, y, z, 0.5 * k, 3 * k, 0.5 * k, 0, 0x6b5238); crown.add(x, y + 2 * k, z, 2.8 * k, 8 * k, 2.8 * k, rng() * 6, gc); }
    else if (species === 'weirwood') { trunk.add(x, y, z, 0.9 * k, 7 * k, 0.9 * k, 0, 0xe9e4d8); crown.add(x, y + 5 * k, z, 3.8 * k, 3.4 * k, 3.8 * k, 0, 0xb0463d); }
    else { trunk.add(x, y, z, 0.45 * k, 3 * k, 0.45 * k, 0, 0x6b5238); crown.add(x, y + 2.4 * k, z, 2.6 * k, 2.4 * k, 2.6 * k, 0, gc); }
  }
  for (const i of [trunk, crown]) if (i.items.length) { const m = i.build(); m.castShadow = true; grp.add(m); }
  grp.userData.positions = pts; return grp;
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root;
    const rockBase = (x, z) => {
      const wx = x + (K.fbm(x * 0.018, z * 0.018, 2, 3) - 0.5) * 46, wz = z + (K.fbm(x * 0.018 + 9, z * 0.018, 2, 4) - 0.5) * 46;   // domain-warped outline: crags, not cylinders
      let r = 0; for (const [cx, cz, rx, rz, hh] of LOBES) { const d = Math.hypot((wx - cx) / rx, (wz - cz) / rz); r = Math.max(r, hh * (1 - K.smoothstep(0.58, 1.0, d))); }
      const crag = 1 - Math.abs(2 * K.fbm(x * 0.045, z * 0.045, 3, 7) - 1);
      r += (K.fbm(x * 0.05, z * 0.05, 3, 7) - 0.5) * 12 * K.smoothstep(10, 60, r) + (crag - 0.5) * 9 * K.smoothstep(25, 80, r) + (K.fbm(x * 0.14, z * 0.14, 2, 3) - 0.5) * 3 * K.smoothstep(20, 70, r);
      return K.lerp(r, Math.round(r / 11) * 11, 0.5 * K.smoothstep(12, 50, r));   // sandstone benches and ledges
    };
    const landAt = (x, z) => 5 + (K.fbm(x * 0.01, z * 0.01, 3, 5) - 0.5) * 10 + K.smoothstep(130, 420, x) * 26 + K.smoothstep(150, 420, -z) * 20;
    const baseH = (x, z) => Math.max(K.lerp(-6, landAt(x, z), K.smoothstep(-8, 6, x - COAST(z))), rockBase(x, z) - 6);
    // mouth: the south face where the cliff reaches ~30 m above the plain
    let mouthZ = 140; while (mouthZ > 0 && rockBase(STAIR_X, mouthZ) < 36) mouthZ -= 1; mouthZ += 1;
    const MY = 32, S0 = 62, ground0 = baseH(STAIR_X, mouthZ + S0);
    const ramp = (z) => K.lerp(ground0, MY, K.clamp((mouthZ + S0 - z) / S0, 0, 1));
    const heightAt = (x, z) => {
      let h = baseH(x, z);
      if (z < mouthZ + S0 + 10 && z > mouthZ - 10) { const w = (1 - K.smoothstep(12, 20, Math.abs(x - STAIR_X))) * K.smoothstep(mouthZ - 10, mouthZ - 2, z); h = K.lerp(h, ramp(Math.max(z, mouthZ)), w); }
      return h;
    };
    const H = heightAt;
    const gold = new THREE.Color(0xf4cc70), ochre = new THREE.Color(0xd89a50), red = new THREE.Color(0xc4522e), dkred = new THREE.Color(0x7d3626), umber = new THREE.Color(0x5a3a2c), grass = new THREE.Color(0x9aa660), grass2 = new THREE.Color(0x7c9450), dry = new THREE.Color(0xc8b26a), sand = new THREE.Color(0xe0cd96), plough = new THREE.Color(0x9a7a4c), wetR = new THREE.Color(0x4a3430), c = new THREE.Color();
    root.add(K.terrain({ size: 1300, seg: q.seg(210), heightAt, kind: 'rock', scale: 16, colorAt: (x, z, h, s) => {
      const f = K.fbm(x * 0.02, z * 0.02, 3, 4), g = K.fbm(x * 0.09, z * 0.09, 2, 11);
      if (h > 10 || s > 0.18) {
        const bands = [gold, ochre, red, dkred], u = K.clamp(0.5 + 0.5 * Math.sin(h * 0.36 + f * 4.5 + g * 1.2), 0, 1) * 3, k0 = Math.floor(u) % 3;   // layered sandstone strata
        c.copy(bands[k0]).lerp(bands[k0 + 1], u - Math.floor(u)).lerp(umber, K.clamp(s * 1.8 - 0.25, 0, 0.5) * (0.5 + g));
        c.multiplyScalar(0.9 + 0.2 * g);
        if (h < 22) c.lerp(grass, K.clamp((22 - h) / 14, 0, 1) * (s < 0.12 ? 0.6 : 0));
        if (h < 6) c.lerp(wetR, K.smoothstep(6, 0, h) * 0.6);       // sea-darkened base
      } else {
        c.copy(grass).lerp(grass2, f).lerp(dry, K.clamp(g * 1.5 - 0.5, 0, 0.6));
        if (x > 40 && z > 60) { const row = Math.sin((x * 0.9 + z * 0.4) * 0.5); if (K.fbm(x * 0.012, z * 0.012, 2, 8) > 0.5) c.lerp(row > 0 ? plough : dry, 0.5); }   // strip fields around Lannisport
        if (h < 1.1) c.lerp(sand, K.smoothstep(1.1, 0, h) * 0.9);
      }
      return c; } }));
    const wat = K.water({ w: 1300, d: 1300, seg: q.seg(200), level: 0, heightAt, deep: 0x124c78, shallow: 0x56b4b6, opacity: 0.92, choppy: 0.7, speed: 0.6 });
    root.add(wat); ctx.registerWater(wat);

    const rock = tri('rock', { color: 0xd2a05c, scale: 10 }), stone = tri('stone', { color: 0xd9b370, scale: 7 }), stoneR = tri('stone', { color: 0xb5603f, scale: 7 }), wood = tri('wood', { color: 0x70502f, scale: 4, snow: false });
    const dark = flat(0x0a0605, { rough: 1 }), goldM = flat(0xe0b442, { rough: 0.35, metal: 0.65 }), crimson = tri('tile', { color: 0xffffff, scale: 5 }), win = glow(0xffc870), cobble = tri('cobble', { color: 0xb59a76, scale: 7 }), spoil = flat(0x8a6a48, { rough: 1 }), rail = flat(0x2a2522, { rough: 1 });
    const b = new Batch(), vr = K.rng(23), manE = glow(0xffc060, 1.4), sand2 = tri('stone', { color: 0xe6c88e, scale: 7 }), redT = tri('tile', { color: 0xffffff, scale: 5 }), trimG = flat(0xe8c050, { rough: 0.4, metal: 0.55 });

    // ---- Lion's Mouth: dark cavern in the south face, framed by rock jambs and a heavy lintel; a wide stair climbs to it
    const mz = mouthZ - 2.2;
    b.box(dark, STAIR_X, MY, mz, 26, 50, 6); b.box(dark, STAIR_X, MY + 44, mz, 22, 14, 6);
    for (const sg of [-1, 1]) { b.box(rock, STAIR_X + sg * 15.5, MY - 2, mz + 0.4, 7, 62, 8, 0, 0xd9a860); b.box(rock, STAIR_X + sg * 11.5, MY + 48, mz + 0.8, 5, 18, 6, 0, 0xc6864a); }
    b.box(rock, STAIR_X, MY + 56, mz + 0.4, 40, 9, 9, 0, 0xc98f50); b.box(rock, STAIR_X, MY + 64, mz + 0.2, 30, 6, 8, 0, 0xbf7a42);
    for (let i = 0; i < 9; i++) b.cone(rock, STAIR_X - 10 + i * 2.5, MY, mz + 3.2, 0.9, 3 + (i % 3) * 1.4, { seg: 5, color: 0xe8d6b0 }); // "teeth"
    // the carved lion: brow, nose, amber eyes and a radiating mane of rock spikes around the open mouth
    { const fz = mz + 1.2, cx = STAIR_X, cy = MY + 52;
      b.box(rock, cx, MY + 70, fz, 38, 3.6, 5.5, 0, 0xcf9456); b.box(rock, cx, MY + 73, fz + 0.4, 7, 20, 5, 0, 0xe0b070);                                 // heavy brow, long nose bridge
      for (const sg of [-1, 1]) { b.box(manE, cx + sg * 12, MY + 75.4, fz + 3.2, 6.4, 2.0, 0.5, 0, 0xffffff, 0, sg * -0.25); b.box(rock, cx + sg * 12, MY + 73.6, fz + 0.8, 8.6, 1.8, 4.6, 0, 0xb8783c, 0, sg * -0.25); b.box(rock, cx + sg * 21, MY + 60, fz, 6, 11, 5, 0, 0xcf9456); b.box(rock, cx + sg * 14, MY + 80.5, fz, 3, 6, 3, 0, 0xd8a460, 0, sg * -0.3); } // amber eyes, lids, cheek bones, ears
      for (let k = 0; k < 13; k++) { const a = Math.PI * (0.06 + 0.88 * (k / 12)), R0 = 30 + (k % 2) * 2.6; b.box(rock, cx + Math.cos(a) * R0, cy + 4 + Math.sin(a) * R0 * 0.8, fz - 0.6, 3.6, 9 + (k % 3) * 2.2, 3.4, 0, vary(vr, 0xe2b26a, 0.1), 0, a - Math.PI / 2); }  // mane
      for (const sg of [-1, 1]) for (let k = 0; k < 3; k++) b.box(rock, cx + sg * (27 + k * 2.2), MY + 38 - k * 9, fz - 0.8, 3.4, 9, 3.2, 0, vary(vr, 0xd79a58, 0.1), 0, sg * (-1.2 - k * 0.1)); }
    const nSteps = 26;
    for (let i = 0; i < nSteps; i++) { const z = mouthZ + 1 + (S0 - 1) * (i / nSteps) + 1.2; b.box(stone, STAIR_X, ramp(z) - 1.6, z, 31, 1.7, (S0 / nSteps) + 0.1, 0, i % 2 ? 0xe9d3a2 : 0xd7bd88); }
    for (const sg of [-1, 1]) { for (let i = 0; i < 7; i++) { const z = mouthZ + 4 + i * 9; b.box(stoneR, STAIR_X + sg * 17.5, ramp(z) - 1, z, 1.6, 6, 1.6); } b.box(stone, STAIR_X + sg * 17.5, MY - 0.5, mouthZ + 8, 1.4, 1.4, 12, 0, 0xc8a060); }
    // ---- summit crown: battlemented ring, red-gold towers, the rookery watchtower
    const SC = [16, -8], sy = H(SC[0], SC[1]);
    const sring = Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * 6.283, r = 24 + (i % 2) * 1.5; return [SC[0] + Math.cos(a) * r, SC[1] + Math.sin(a) * r * 0.8]; });
    K.wall(b, sring, { h: 8, t: 3, mat: stoneR, capMat: stone, heightAt, closed: true, sink: 4 });
    sring.forEach(([x, z], i) => { if (i % 2 === 0) { const hh = 17 + (i % 4) * 2; K.tower(b, x, z, { r: 3.2, h: hh, y: H(x, z), mat: i % 4 ? stone : sand2, roofMat: crimson, roofColor: [0xb03030, 0xa42a2a, 0xc04a30][i % 3], roof: 'cone', roofH: 7, seg: 10, windows: i % 4 === 0, color: vary(vr, 0xffffff, 0.08) }); b.sphere(trimG, x, H(x, z) + hh + 7.4, z, 0.55, { seg: 6 }); } });
    K.tower(b, SC[0], SC[1], { r: 5, h: 48, y: sy, mat: stoneR, roofMat: stone, roof: 'flat', seg: 14, taper: 0.88 });
    b.cyl(rail, SC[0], sy + 50, SC[1], 5.6, 1.4, { seg: 14 }); b.cone(goldM, SC[0], sy + 51.4, SC[1], 2.4, 10, { seg: 8 });
    K.keep(b, SC[0] - 6, SC[1] + 6, { w: 16, d: 12, h: 12, y: sy, mat: stone, roofMat: crimson, turretR: 2.2, turretH: 4, roof: 'flat' });
    // ---- mines on the north flank: adits, spoil heaps, rail tracks, headframes
    const mines = [];
    for (const x of [70, 88, 104, 118, 34]) { let z = -150; while (z < 0 && H(x, z) < 14) z += 1; mines.push([x, z]); }
    mines.forEach(([x, z], i) => { const y = H(x, z); b.box(dark, x, y, z - 0.8, 6, 6.5, 3); b.box(wood, x - 3.4, y, z - 1, 0.9, 7, 1.2); b.box(wood, x + 3.4, y, z - 1, 0.9, 7, 1.2); b.box(wood, x, y + 6.5, z - 1, 8, 0.9, 1.2);
      b.cone(spoil, x + 7, H(x + 7, z - 7), z - 9, 6, 5, { seg: 7 }); b.ribbon(rail, [[x, z - 2], [x + 3, z - 10], [x + 7, z - 16]], 1.4, heightAt, 0.3); if (i % 2 === 0) { b.box(wood, x - 8, H(x - 8, z - 6), z - 6, 0.7, 9, 0.7, 0, 0xffffff, 0.2); b.box(wood, x - 9.5, H(x - 8, z - 6) + 8.6, z - 6, 4, 0.5, 0.5); } });
    // ---- sea gate & private docks on the west cliff
    let gx = -150; while (gx < 0 && H(gx, 12) < 1.5) gx += 1;
    b.box(dark, gx + 1, -2, 12, 8, 20, 22); b.box(rock, gx - 1.5, -4, 12 - 14, 5, 30, 6, 0, 0xcf9a58); b.box(rock, gx - 1.5, -4, 12 + 14, 5, 30, 6, 0, 0xcf9a58); b.box(rock, gx - 1.5, 17, 12, 6, 6, 34, 0, 0xc4894c);
    K.pier(b, gx - 38, 1.2, 8, { len: 36, w: 4, ry: 0, mat: wood }); K.pier(b, gx - 26, 1.2, 20, { len: 24, w: 3, ry: 0, mat: wood });
    K.gatehouse(b, gx + 9, 12, { y: 0.2, ry: Math.PI / 2, mat: stone, roofMat: crimson, roofColor: 0xb03030, w: 20, d: 8, h: 12, gate: 8, wood, towerR: 3 });
    // ---- terraced citadels on the flank lobes: walled benches of sandstone houses stepping up the rock
    const cit = [];
    for (const [cx, cz, rr0] of [[-48, 2, 22], [84, 4, 20], [30, -52, 15]]) {
      const base = H(cx, cz), ring2 = Array.from({ length: 11 }, (_, i) => { const a = (i / 11) * 6.283; return [cx + Math.cos(a) * rr0, cz + Math.sin(a) * rr0 * 0.85]; });
      K.wall(b, ring2, { h: 7, t: 2.6, mat: sand2, capMat: stone, heightAt, closed: true, sink: 5, color: 0xf0dcb0 });
      ring2.forEach(([x, z], i) => { if (i % 2 === 0) { K.tower(b, x, z, { r: 2.6, h: 13 + (i % 3) * 2, y: H(x, z), mat: stone, roofMat: redT, roofColor: [0xb03030, 0xc04a30, 0xa42a2a][i % 3], roof: 'cone', roofH: 6, seg: 8, windows: false, color: vary(vr, 0xffffff, 0.08) }); } });
      const ps = K.town(b, { rng: K.rng(70 + (cx | 0)), count: 30, bounds: [cx - rr0 + 4, cz - rr0 * 0.8 + 4, cx + rr0 - 4, cz + rr0 * 0.8 - 4], minDist: 6, size: [3.6, 6], height: [3.6, 6], heightAt, accept: (x, z) => Math.hypot((x - cx) / rr0, (z - cz) / (rr0 * 0.85)) < 0.8 && Math.abs(H(x + 2, z) - H(x - 2, z)) + Math.abs(H(x, z + 2) - H(x, z - 2)) < 2.6, wallMat: tri('plaster', { color: 0xf0dcb0, scale: 6 }), roofMat: redT, glowMat: win, styles: ['gable', 'hip'], chimneyChance: 0.3, palette: [{ wall: 0xf0dcb0, roof: 0xb4442c }, { wall: 0xe6c88e, roof: 0xc4602e }, { wall: 0xf4e4c0, roof: 0x9a3a2a }, { wall: 0xd8b878, roof: 0xb84a32 }] });
      cit.push(...ps);
    }
    // ---- road & hamlet under the stair
    b.ribbon(cobble, K.smoothPath([[STAIR_X, mouthZ + S0], [26, mouthZ + S0 + 30], [70, mouthZ + S0 + 70], [140, mouthZ + S0 + 100], [230, mouthZ + S0 + 130]], 6), 7, heightAt, 0.15);
    const hamlet = K.town(b, { rng: K.rng(12), count: q.dens(52), bounds: [-40, mouthZ + S0 + 10, 120, mouthZ + S0 + 90], minDist: 9, size: [5, 8], height: [4, 6.5], heightAt, avoid: (x, z) => Math.abs(x - STAIR_X) < 24 && z < mouthZ + S0 + 40 || H(x, z) < 1.5, wallMat: tri('plaster', { color: 0xe0cca4, scale: 6 }), roofMat: crimson, glowMat: win, styles: ['gable', 'hip'], palette: [{ wall: 0xe4d0a4, roof: 0xb4442c }, { wall: 0xd6bf94, roof: 0xa83a2a }, { wall: 0xcdb48a, roof: 0xbf5a38 }, { wall: 0xf4ead0, roof: 0xc87a40 }, { wall: 0xe8d8b0, roof: 0x8a3a30 }, { wall: 0xd4c098, roof: 0x7c8a8c }, { wall: 0xf0e0b8, roof: 0xd49a4c }], chimneyChance: 0.4 });
    // ---- offshore sea-stacks (golden sandstone, surf rings) and haze-bound headlands
    const stk = [], sr = K.rng(44);
    for (let i = 0; i < 12; i++) { const x = sr.range(-330, -120), z = sr.range(-260, 260); if (H(x, z) > -3 || H(x, z) < -9 || Math.abs(z - 12) < 40 && x > -200) continue; const hh = sr.range(6, 22), r = sr.range(3, 7); stk.push([x, z, r * 1.5]);
      b.cyl(rock, x, -8, z, r, hh + 8, { seg: 8, top: 0.78, color: vary(sr, 0xe8b878, 0.12) }); b.cyl(rock, x + 1, -8, z - 1, r * 0.6, hh * 0.6 + 8, { seg: 7, top: 0.7, color: vary(sr, 0xc88848, 0.12) }); }
    foamRings(ctx, stk, { y: 0.3, width: 3, opacity: 0.8 });
    { const fb = new Batch(), fr = K.rng(18), farM = tri('rock', { color: 0xb88a60, scale: 40 });
      for (let i = 0; i < 9; i++) { const a = 2.2 + i * 0.52, d = fr.range(650, 880), r = fr.range(90, 170); fb.dome(farM, Math.cos(a) * d, -10, Math.sin(a) * d, r, { seg: 10, sy: fr.range(0.2, 0.4), color: vary(fr, 0xffffff, 0.1) }); }
      root.add(fb.build({ shadow: false })); }
    root.add(b.build({}));

    // ---- vegetation (sparse western scrub)
    root.add(grove({ rng: K.rng(61), count: q.dens(160), bounds: [-120, 80, 400, 400], heightAt, species: 'oak', minDist: 9, tint: 0x8c9a58, scale: [0.7, 1.1], avoid: (x, z) => rockBase(x, z) > 4 || H(x, z) < 1.5 || Math.abs(x - STAIR_X) < 22 && z < mouthZ + S0 + 40 }));
    root.add(grove({ rng: K.rng(62), count: q.dens(120), bounds: [-300, -400, 420, -100], heightAt, species: 'pine', minDist: 10, scale: [0.8, 1.2], avoid: (x, z) => rockBase(x, z) > 4 || H(x, z) < 1.5 }));

    // ---- life
    const mk = (type, len, hull, sail) => { const s = K.ship(type, { len, hull, sail }); root.add(s); return s; };
    const sail = [{ s: mk('galley', 22, 0x8a2a2a, 0xd9b04a), cx: -230, cz: 40, rx: 120, rz: 90, sp: 0.04, ph: 0 }, { s: mk('cog', 16, 0x5a4029, 0xe9dfc8), cx: -190, cz: 210, rx: 90, rz: 40, sp: -0.05, ph: 2 }, { s: mk('galley', 20, 0x8a2a2a, 0xe0c060), cx: -260, cz: -120, rx: 70, rz: 60, sp: 0.045, ph: 4 }];
    const moored = [[gx - 24, 14.6], [gx - 12, 3]].map(([x, z], i) => { const s = mk('cog', i ? 13 : 11, 0x4a3322, i ? 0xb02a2a : 0xd9b04a); s.position.set(x, 0.2, z); s.rotation.y = 0.1; return s; });
    ctx.onUpdate((dt, t) => { sail.forEach(({ s, cx, cz, rx, rz, sp, ph }) => { const a = t * sp + ph, dx = -Math.sin(a) * rx * Math.sign(sp), dz = Math.cos(a) * rz * Math.sign(sp); s.position.set(cx + Math.cos(a) * rx, 0.2, cz + Math.sin(a) * rz); s.rotation.y = Math.atan2(-dz, dx); K.animateShip(s, t, ph); }); moored.forEach((s, i) => K.animateShip(s, t, i)); });
    const gulls = K.birds({ center: [-60, 70, 20], radius: 100, count: q.dens(24), color: 0xf4f4f0, size: 1.4, spreadY: 25, seed: 4 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const rav = K.birds({ center: [SC[0], sy + 60, SC[1]], radius: 30, count: q.dens(9), color: 0x15151a, size: 1.1, spreadY: 10, seed: 8 }); root.add(rav); ctx.onUpdate((dt, t) => rav.userData.update(t));
    root.add(K.smoke(mines.map(([x, z]) => [x + 7, H(x + 7, z - 7) + 6, z - 9]).concat(hamlet.filter((_, i) => i % 3 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 4, p.z])), { size: 20, rise: 16, opacity: 0.24, color: 0xcfc6b8 }));
    const bn = [{ x: SC[0], y: sy + 62, z: SC[1], w: 5, h: 11, color: 0xa5242b, ry: 0 }, { x: STAIR_X - 17, y: MY + 66, z: mouthZ - 2, w: 4, h: 10, color: 0xa5242b, ry: 0.2 }, { x: STAIR_X + 17, y: MY + 66, z: mouthZ - 2, w: 4, h: 10, color: 0xa5242b, ry: -0.2 }, { x: gx + 8, y: 18, z: 12, w: 3, h: 7, color: 0xa5242b, ry: 1.5 }];
    sring.forEach(([x, z], i) => { if (i % 4 === 0) bn.push({ x, y: H(x, z) + 24, z, w: 3, h: 6, color: 0xa5242b, ry: i }); });
    root.add(K.banners(bn));
    const fire = K.fires([[STAIR_X - 20, MY + 2, mouthZ + 6], [STAIR_X + 20, MY + 2, mouthZ + 6], [SC[0], sy + 53, SC[1]], [gx + 4, 3, 2], [gx + 4, 3, 22]], { size: 22, light: q.low ? 0 : 3, intensity: 120 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const wk = K.walkers({ paths: [[[STAIR_X, mouthZ + S0 + 4], [STAIR_X + 2, mouthZ + 4]], [[STAIR_X, mouthZ + S0 + 10], [60, mouthZ + S0 + 60], [140, mouthZ + S0 + 100]]], heightAt, count: q.dens(22), rng: K.rng(5), colors: [0xa5242b, 0xd9b04a, 0x6a5a4a, 0x4d5a6a] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    root.add(K.clouds({ y: 280, extent: 800, count: 8, opacity: 0.4 }));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 250, center: [10, 40, 10], minDistance: 18,
      hero: { pos: [-110, 125, 330], target: [20, 60, 0] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x4a5c98, horizon: 0xf4b890, fog: 0xe8b898, fogD: 0.0015, sunC: 0xffb070, sunI: 3.0, hemiSky: 0xa8aed0, hemiGround: 0x6a5238, hemiI: 0.95 },
        day: { top: 0x4a90d2, horizon: 0xf4dcae, fog: 0xe8d4aa, fogD: 0.0011, az: 2.6, elev: 0.46, sunC: 0xffe0b0, sunI: 3.4, hemiSky: 0xb0cae8, hemiGround: 0x8a6a40, hemiI: 1.0 },
        dusk: { top: 0x2a3068, horizon: 0xf08a48, fog: 0xd49068, fogD: 0.0016, sunC: 0xff8a40, sunI: 3.0, hemiSky: 0x8c8cc0, hemiGround: 0x6a4030, hemiI: 0.9 },
        night: { top: 0x0a1238, horizon: 0x34447a, fog: 0x2a3660, fogD: 0.0019, sunC: 0xaabff0, sunI: 1.5, elev: 0.5, hemiSky: 0x7690c8, hemiGround: 0x3a3040, hemiI: 1.45, exposure: 1.2 },
      } },
      landmarks: {
        'the-rock': { pos: [-20, 120, -4], r: 40, cam: { pos: [-170, 120, 150], target: [10, 60, 0] } },
        'lions-mouth': { pos: [STAIR_X, MY + 66, mouthZ], r: 20, cam: { pos: [STAIR_X, MY + 30, mouthZ + 110], target: [STAIR_X, MY + 25, mouthZ] } },
        'great-stair': lm(STAIR_X, mouthZ + 30, 22, 8),
        'rookery-tower': { pos: [SC[0], sy + 56, SC[1]], r: 12 },
        'summit-crown': lm(SC[0] + 12, SC[1] + 14, 22, 18),
        'sea-gate': lm(gx - 6, 12, 18, 14),
        'private-docks': lm(gx - 26, 14, 18, 6),
        'gold-mines': lm(mines[2][0], mines[2][1], 20, 12),
        'sea-cliffs': lm(-90, -30, 26, 30),
        'ocean-road': lm(80, mouthZ + S0 + 60, 28, 6),
      },
    };
  },
};
