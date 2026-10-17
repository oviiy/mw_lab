// Highgarden — moderate scene. Book anchors: Tyrell seat of the Reach, set among gardens and orchards above the Mander; a palatial castle
// of pale stone; a sept and godswood; roses and green-and-gold banners. Concentric rings, the hedge maze and exact layout are interpretation.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const R1 = 36, R2 = 60, R3 = 84;              // inner, middle, outer wall radii
const HILL_H = 40;
const MANDER = [[-420, 90], [-260, 175], [-130, 160], [-30, 150], [70, 160], [190, 130], [300, 170], [420, 120]];
const hw = 11;
const ringPts = (r, n, seed, j = 0.03) => { const rr = K.rng(seed); return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, k = r * (1 + rr.range(-j, j)); return [Math.cos(a) * k, Math.sin(a) * k]; }); };

const _jc = new THREE.Color();
/** Deterministic colour variation around a hex value (per-building weathering). */
const vary = (r, hex, a = 0.1) => { _jc.set(hex); const k = 1 + (r() - 0.5) * 2 * a; _jc.r = Math.min(1, _jc.r * k * (1 + (r() - 0.5) * a)); _jc.g = Math.min(1, _jc.g * k); _jc.b = Math.min(1, _jc.b * k * (1 + (r() - 0.5) * a)); return _jc.getHex(); };

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
    const river = (x, z) => K.distToPolyline(x, z, MANDER);
    const heightAt = (x, z) => {
      const r = Math.hypot(x, z);
      let h = 3.5 + (K.fbm(x * 0.008, z * 0.008, 3, 12) - 0.5) * 10 + (K.fbm(x * 0.03, z * 0.03, 2, 5) - 0.5) * 1.2;
      h = K.lerp(h, 3.5 + HILL_H, 1 - K.smoothstep(52, 128, r));
      h += K.smoothstep(260, 420, r) * 18 + K.smoothstep(380, 700, r) * (30 + K.fbm(x * 0.006, z * 0.006, 3, 9) * 40);
      const tw = K.smoothstep(24, 40, r) * (1 - K.smoothstep(92, 112, r)); h = K.lerp(h, Math.round(h / 3.2) * 3.2, 0.55 * tw);   // garden terraces
      const d = river(x, z).d; if (d < hw + 7) h = K.lerp(h, Math.min(h, -2.8), 1 - K.smoothstep(hw * 0.5, hw + 4, d));
      return h;
    };
    const H = heightAt, c = new THREE.Color();
    const lawn = new THREE.Color(0x6e9e46), meadow = new THREE.Color(0x88ac52), gold = new THREE.Color(0xcdb858), dark = new THREE.Color(0x46783a), sand = new THREE.Color(0xd2c690), olive = new THREE.Color(0x7a8c46), clover = new THREE.Color(0x5e9a4c);
    const flw = [new THREE.Color(0xf6e46a), new THREE.Color(0xf4f0e8), new THREE.Color(0xe87a9a), new THREE.Color(0xb88ae0)], path = new THREE.Color(0xcdbf94);
    root.add(K.terrain({ size: 1300, seg: q.seg(160), heightAt, kind: 'grass', scale: 12, colorAt: (x, z, h, s) => {
      const f = K.fbm(x * 0.01, z * 0.01, 3, 8), g = K.fbm(x * 0.05, z * 0.05, 2, 19), r = Math.hypot(x, z);
      c.copy(meadow).lerp(lawn, f).lerp(olive, K.clamp(g * 1.6 - 0.7, 0, 0.5)).lerp(clover, K.clamp(K.fbm(x * 0.02, z * 0.02, 2, 3) * 1.5 - 0.6, 0, 0.4));
      const stripe = Math.sin((x * 0.7 + z * 0.3) * 0.12 + f * 6); if (r > 140 && K.fbm(x * 0.006, z * 0.006, 2, 21) > 0.52) c.lerp(gold, 0.45 + 0.2 * stripe);   // ripe barley fields
      if (r < 130) c.lerp(lawn, 0.35);
      const wf = K.fbm(x * 0.3, z * 0.3, 1, 41); if (wf > 0.74 && r > 20) c.lerp(flw[Math.floor(K.fbm(x * 0.03, z * 0.03, 1, 5) * 4) % 4] || flw[0], 0.5);   // wildflower flecks
      c.lerp(dark, K.clamp(s * 2, 0, 0.45)); if (h < 0.9) c.lerp(sand, K.smoothstep(0.9, -0.5, h) * 0.85); return c; } }));
    const wat = K.water({ w: 900, d: 900, seg: q.seg(150), level: 0, heightAt, deep: 0x2a6874, shallow: 0x7ab8a2, opacity: 0.92, choppy: 0.25, speed: 0.35 });
    root.add(wat); ctx.registerWater(wat);

    // materials: bright pale stone, sage-green roofs
    const white = tri('marble', { color: 0xfff8e8, scale: 7 }), wallS = tri('stone', { color: 0xfff6e2, scale: 7, bump: 0.7 }), cream = tri('plaster', { color: 0xf6ecd0, scale: 6 }), roofG = tri('tile', { color: 0xffffff, scale: 5 }), goldM = flat(0xe2bc4a, { rough: 0.3, metal: 0.7 }), terr2 = tri('stone', { color: 0xf0e6c8, scale: 6 }), bloom = flat(0xffffff, { rough: 1 });
    const wood = tri('wood', { color: 0x7a5a3a, scale: 4, snow: false }), cobble = tri('cobble', { color: 0xcfc4a6, scale: 7 }), hedgeM = tri('grass', { color: 0x3a6c34, scale: 3, snow: false });
    const win = glow(0xffe0a0), glassR = glow(0xff8a7a), glassB = glow(0x7aa8ff), glassY = glow(0xffe07a), ivy = flat(0x4a8a3c, { rough: 1 });
    const b = new Batch(), ring = {};
    const wopt = { mat: wallS, capMat: white, heightAt, sink: 6 }, vr = K.rng(17), greens = [0x6fa58a, 0x7ab294, 0x62998a, 0x86b89a];
    const twr = (x, z, o) => { K.tower(b, x, z, { ...o, roofColor: vary(vr, greens[(vr() * 4) | 0], 0.06), color: vary(vr, 0xffffff, 0.05) }); const rh = o.roofH ?? 7; b.sphere(goldM, x, o.y + o.h + 0.9 + rh - 0.2, z, 0.7, { seg: 6 }); b.cone(goldM, x, o.y + o.h + 0.9 + rh, z, 0.2, 2.2, { seg: 4 }); };
    // ---- three concentric white rings; gates staggered so the road switchbacks up the hill
    const rings = [[R3, 11, 3.4, 34, 1], [R2, 13, 3.4, 28, 2], [R1, 15, 3.6, 22, 3]];
    rings.forEach(([r, h, t, n, seed], k) => {
      const pts = ringPts(r, n, seed); K.wall(b, pts, { ...wopt, h, t, closed: true });
      pts.forEach(([x, z], i) => { if (i % 3 === 1) twr(x, z, { r: 3 + (2 - k) * 0.3, h: h + 9 + (i % 2) * 3, y: H(x, z), mat: white, roofMat: roofG, roof: 'cone', roofH: 7 + (i % 3), seg: 10, windows: false }); });
    });
    K.gatehouse(b, 0, R3, { y: H(0, R3), ry: 0, mat: white, roofMat: roofG, roofColor: 0x6fa58a, w: 20, d: 9, h: 15, gate: 5, wood, towerR: 3.8 });
    K.gatehouse(b, R2, 0, { y: H(R2, 0), ry: Math.PI / 2, mat: white, roofMat: roofG, roofColor: 0x6fa58a, w: 18, d: 8, h: 17, gate: 5, wood, towerR: 3.5 });
    K.gatehouse(b, 0, -R1, { y: H(0, -R1), ry: 0, mat: white, roofMat: roofG, roofColor: 0x6fa58a, w: 16, d: 8, h: 19, gate: 4.6, wood, towerR: 3.3 });
    // ---- the keep: palatial, colonnaded, ivy-clad, slender round towers
    const ky = H(0, 0);
    b.box(white, 0, ky - 2, 0, 38, 24, 26, 0); b.box(white, 0, ky + 22, 0, 40, 1.2, 28, 0); b.prism(roofG, 0, ky + 23, 0, 42, 7, 30, 0, 0x78ad92);
    b.box(white, 0, ky - 2, 22, 22, 15, 14, 0); b.prism(roofG, 0, ky + 13, 22, 24, 6, 16, Math.PI / 2 * 0, 0x78ad92);
    K.columns(b, Array.from({ length: 9 }, (_, i) => [-17 + i * 4.25, 14.5]), { h: 11, r: 0.6, mat: white, y: ky });
    b.box(white, 0, ky + 11, 14.5, 38, 0.8, 2, 0);
    for (const [x, z, h] of [[-21, -14, 44], [21, -14, 44], [-21, 14, 38], [21, 14, 38], [0, -16, 54]]) { twr(x, z, { r: 3.6, h, y: ky, mat: white, roofMat: roofG, roof: 'cone', roofH: 12, seg: 12, taper: 0.9 }); b.cyl(white, x, ky + h * 0.6, z, 3.6 * 0.92 + 0.5, 0.9, { seg: 12, top: 1.05 }); }
    K.tower(b, 0, 0, { r: 7, h: 40, y: ky + 20, mat: white, roofMat: flat(0xd9b64a, { rough: 0.35, metal: 0.6 }), roof: 'dome', roofH: 8, seg: 16 });
    for (let i = -2; i <= 2; i++) { b.box(win, i * 7, ky + 5, 13.5, 1.6, 6, 0.15); b.box(ivy, i * 7 + 2.8, ky + 2, 13.3, 1.3, 14, 0.2); }
    for (let i = 0; i < 12; i++) b.box(ivy, -19 + i * 3.4, ky + 8 + (i % 3) * 2, -13.2, 2.2, 9 + (i % 4), 0.2);
    // statues along the colonnade (small pale figures)
    for (let i = 0; i < 6; i++) b.box(white, -12.5 + i * 5, ky + 11.8, 14.5, 1, 2.6, 1);
    // upper loggia: a lighter second tier of slim paired columns with a gilded balustrade rail
    K.columns(b, Array.from({ length: 9 }, (_, i) => [-17 + i * 4.25, 13.6]), { h: 7.5, r: 0.38, mat: white, y: ky + 11.8, cap: true });
    b.box(white, 0, ky + 19.9, 13.6, 38, 0.7, 1.8, 0); b.box(goldM, 0, ky + 12.5, 14.4, 38, 0.35, 0.3, 0);
    // front-court fountain and rose arbours
    { const fy = H(0, 40); b.cyl(white, 0, fy - 0.5, 40, 5.2, 1.5, { seg: 16 }); b.cyl(flat(0x7cc8d0, { rough: 0.1, flatShading: false }), 0, fy + 0.8, 40, 4.6, 0.2, { seg: 16 }); b.cyl(white, 0, fy, 40, 0.9, 3.4, { seg: 8 }); b.cyl(white, 0, fy + 3, 40, 2.1, 0.5, { seg: 12 }); b.sphere(goldM, 0, fy + 3.6, 40, 0.7, { seg: 8 }); }
    for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.283 + 0.15, rad = 48, x = Math.cos(a) * rad, z = Math.sin(a) * rad, yy = H(x, z), ry = -a + Math.PI / 2; if (Math.abs(z) < 8 && x > 0 || Math.abs(x) < 8 && z > 0) continue;
      for (const sd of [-1, 1]) b.box(white, x + Math.cos(a + Math.PI / 2) * sd * 1.6, yy, z + Math.sin(a + Math.PI / 2) * sd * 1.6, 0.4, 3.6, 0.4, ry); b.box(white, x, yy + 3.6, z, 4, 0.4, 0.5, ry); b.box(vary(vr, 0xe44f6a) && flat(0xffffff, { rough: 1 }), x, yy + 4, z, 3.6, 0.7, 1, ry, [0xe44f6a, 0xf3b4c6, 0xfafafa, 0xf4d44a][i % 4]); }
    // ---- sept with stained glass, east side of the inner ward
    { const x = 22, z = 22, y = H(x, z); b.box(white, x, y - 1, z, 12, 12, 9, 0); b.prism(roofG, x, y + 11, z, 13, 5, 10, 0, 0x78ad92); K.tower(b, x + 5, z + 3, { r: 2, h: 20, y, mat: white, roofMat: roofG, roofColor: 0x6fa58a, roof: 'spire', roofH: 7, seg: 8, windows: false }); [-4, -2, 0, 2, 4].forEach((o, i) => b.box([glassR, glassB, glassY, glassB, glassR][i], x + o, y + 3, z + 4.6, 1.2, 5, 0.12)); }
    // service buildings in the middle ward
    [[-44, 12, 14, 8, 5], [-40, -26, 12, 9, 5], [30, -40, 14, 8, 6], [44, 10, 10, 8, 5], [-18, 44, 12, 7, 5]].forEach(([x, z, w, d, h]) => K.house(b, x, H(x, z), z, { w, d, h, ry: Math.atan2(z, x) + Math.PI / 2, style: 'gable', wallMat: cream, roofMat: roofG, roof: 0xb86a45, glowMat: win, chimney: true }));
    // ---- garden terraces & rose beds (inner/middle wards)
    const bed = new Inst(G.box(), flat(0xffffff, { rough: 1 })), rr = K.rng(3);
    const flowers = [0xe44f6a, 0xf3b4c6, 0xf4d44a, 0xfafafa, 0xd23a3a, 0xff9ab0];
    for (let i = 0; i < q.dens(420); i++) { const a = rr() * 6.283, rad = rr.range(R1 + 4, R2 - 5), x = Math.cos(a) * rad, z = Math.sin(a) * rad; if (Math.abs(x) < 6 || x > 20 && z > 14 && x < 34) continue; bed.add(x, H(x, z), z, rr.range(1.4, 2.8), rr.range(0.6, 1.2), rr.range(1.4, 2.8), rr() * 3, rr.pick(flowers)); }
    // ---- hedge-maze ring between outer and middle walls (interpretation of the briar labyrinth)
    const mz = K.rng(8), hedges = new Batch();
    for (const rad of [R2 + 6, R2 + 10, R2 + 14, R2 + 18]) {
      const steps = Math.round(rad * 0.45); for (let i = 0; i < steps; i++) { if (mz() < 0.14 || Math.abs(Math.cos(i / steps * 6.283 + rad)) > 0.98) continue; const a = ((i + 0.5) / steps) * 6.283, x = Math.cos(a) * rad, z = Math.sin(a) * rad; if (Math.abs(z - 0) < 7 && x > 0 || Math.abs(x) < 7 && z > 0) continue; hedges.box(hedgeM, x, H(x, z) - 0.4, z, (6.283 * rad) / steps + 0.4, 3.4, 1.4, -a + 1.5708, 0xffffff); }
    }
    for (let i = 0; i < 22; i++) { const a = (i / 22) * 6.283 + 0.1, ra = R2 + 6 + (i % 4) * 4; if (Math.abs(Math.sin(a)) < 0.12 && Math.cos(a) > 0 || Math.abs(Math.cos(a)) < 0.12 && Math.sin(a) > 0) continue; hedges.box(hedgeM, Math.cos(a) * (ra + 2), H(Math.cos(a) * ra, Math.sin(a) * ra) - 0.4, Math.sin(a) * (ra + 2), 1.4, 3.4, 4, -a); }
    // ---- roads, bridge, town
    const road = [[0, R3 + 4], [-10, 110], [-8, 134], [-2, 160], [0, 210], [20, 280]];
    b.ribbon(cobble, K.smoothPath([[0, R3], [18, 100], [10, 125]], 6), 6, heightAt, 0.15);
    b.ribbon(cobble, K.smoothPath([[10, 125], [6, 148], [14, 190], [40, 260]], 6), 6, heightAt, 0.15);
    b.ribbon(cobble, K.smoothPath([[R2 - 1, 0], [R2 + 10, 20], [R3 - 6, 40], [R3 + 2, 54]], 4), 5, heightAt, 0.15); // spiral up
    b.ribbon(cobble, K.smoothPath([[-30, 150], [-130, 150], [-250, 170]], 6), 5, heightAt, 0.15);
    for (const rad of [48, 72]) { const rp = Array.from({ length: 49 }, (_, i) => [Math.cos((i / 48) * 6.283) * rad, Math.sin((i / 48) * 6.283) * rad]); b.ribbon(cobble, rp, 3.4, heightAt, 0.18, 0xe6dcb8); }
    K.bridge(b, [8, H(8, 130) + 0.6, 128], [8, H(8, 166) + 0.6, 168], { w: 6, rise: 2.6, mat: white, pillars: true });
    const townAvoid = (x, z) => Math.hypot(x, z) < 132 || river(x, z).d < hw + 5;
    const placed = K.town(b, { rng: K.rng(31), count: q.dens(120), bounds: [90, -120, 230, 90], minDist: 9, size: [5, 8], height: [4, 7], heightAt, avoid: townAvoid, wallMat: cream, roofMat: roofG, glowMat: win, styles: ['gable', 'hip', 'gable'], chimneyChance: 0.3,
      palette: [{ wall: 0xf4ecd6, roof: 0xc77a4c }, { wall: 0xe9dcb4, roof: 0x7aa58a }, { wall: 0xf7f1e0, roof: 0xb86845 }, { wall: 0xe8d6a8, roof: 0x8fb08d }, { wall: 0xf0d8c0, roof: 0xd08a58 }, { wall: 0xfaf4e4, roof: 0x6f9a98 }, { wall: 0xe4d2a0, roof: 0xc8a860 }, { wall: 0xf2e6cc, roof: 0xa65a3c }] });
    root.add(b.build({}), hedges.build({}), bed.build());
    // ---- orchards (rows) & godswood & wild
    const trunk = new Inst(G.cyl(6, 0.7), tri('wood', { color: 0x6a4e32, scale: 3, snow: false })), crown = new Inst(G.sphere(7), PLAIN), fruit = [0x5fa845, 0x6cb04a, 0x4f9a3c, 0x7bb84f, 0x7aa84a, 0x5a9a48, 0xf1c4d0, 0xf8e6ea, 0xd8e06a];
    const orchards = [[-330, -80, -150, 80], [-120, 190, 120, 300], [150, -240, 330, -120], [130, 190, 330, 290], [-340, 200, -170, 330], [-100, -300, 120, -170]];
    const orr = K.rng(5);
    for (const [x0, z0, x1, z1] of orchards) for (let x = x0; x < x1; x += 11) for (let z = z0; z < z1; z += 11) {
      const px = x + orr.range(-0.6, 0.6), pz = z + orr.range(-0.6, 0.6); if (Math.hypot(px, pz) < 135 || river(px, pz).d < hw + 6) continue; if (q.low && ((x + z) / 11 | 0) % 2) continue;
      const y = H(px, pz), k = orr.range(0.85, 1.2); trunk.add(px, y, pz, 0.4 * k, 2.2 * k, 0.4 * k, 0, 0x6a4e32); crown.add(px, y + 1.6 * k, pz, 2.5 * k, 2.3 * k, 2.5 * k, 0, orr.pick(fruit));
    }
    for (const i of [trunk, crown]) { const m = i.build(); m.castShadow = true; root.add(m); }
    root.add(grove({ rng: K.rng(41), count: 26, bounds: [-70, -76, -40, -40], heightAt, species: 'oak', minDist: 4.5, tint: 0x3f7a3a, scale: [1.1, 1.5] }));
    root.add(grove({ rng: K.rng(42), count: 3, bounds: [-62, -62, -52, -52], heightAt, species: 'weirwood', scale: [2, 2.4] }));
    root.add(grove({ rng: K.rng(43), count: q.dens(260), bounds: [-420, -420, 420, -310], heightAt, species: 'oak', avoid: (x, z) => river(x, z).d < 16 }));
    root.add(grove({ rng: K.rng(44), count: q.dens(60), bounds: [-130, 110, 120, 125], heightAt, species: 'cypress', avoid: (x, z) => river(x, z).d < hw + 4 }));
    // ---- life
    const banners = [[0, ky + 62, -16], [-21, ky + 50, -14], [21, ky + 50, -14], [0, H(0, R3) + 24, R3 + 1], [R2, H(R2, 0) + 26, 0], [0, H(0, -R1) + 28, -R1]].map(([x, y, z], i) => ({ x: x + 0.3, y, z, w: 3, h: 7, color: 0x2f8a46, ry: 0.4 * i }));
    root.add(K.banners(banners));
    root.add(K.smoke(placed.filter((_, i) => i % 3 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 4, p.z]).concat([[-44, H(-44, 12) + 12, 12], [-18, H(-18, 44) + 12, 44]]), { size: 18, rise: 14, opacity: 0.22, color: 0xe6e2d8 }));
    const doves = K.birds({ center: [0, ky + 45, 0], radius: 90, count: q.dens(14), color: 0xffffff, size: 0.9, spreadY: 14, seed: 2 }); root.add(doves); ctx.onUpdate((dt, t) => doves.userData.update(t));
    const swallows = K.birds({ center: [100, 40, 140], radius: 120, count: q.dens(8), color: 0x2a2f3a, size: 0.8, spreadY: 10, speed: 0.2, seed: 6 }); root.add(swallows); ctx.onUpdate((dt, t) => swallows.userData.update(t));
    const paths = [K.smoothPath([[0, R3 + 6], [18, 100], [10, 125], [6, 148]], 4), K.smoothPath([[-30, 24], [0, 24], [25, 10], [0, -30]], 4), K.smoothPath([[R2 + 10, 20], [R3 - 6, 40], [R3 + 2, 54]], 4), K.smoothPath([[100, 0], [130, 30], [170, 60]], 3)];
    const wk = K.walkers({ paths, heightAt, count: q.dens(30), rng: K.rng(5), colors: [0x6a8a4a, 0xc9a24a, 0xdedede, 0x8a5a3a, 0x3f6a4a] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const barges = [0, 1, 2].map(() => { const s = K.ship('barge', { len: 11, hull: 0x6d4a2d, sail: 0xf0e8d0 }); root.add(s); return s; });
    ctx.onUpdate((dt, t) => barges.forEach((s, i) => { const u = (t * 0.01 + i * 0.31) % 1, f = u * (MANDER.length - 1), k = Math.min(MANDER.length - 2, Math.floor(f)), r = f - k, A = MANDER[k], B = MANDER[k + 1]; s.position.set(K.lerp(A[0], B[0], r), 0.1, K.lerp(A[1], B[1], r)); s.rotation.y = Math.atan2(-(B[1] - A[1]), B[0] - A[0]); K.animateShip(s, t, i); }));
    const fire = K.fires([[-7, H(-7, R3 - 3) + 2.5, R3 - 3], [7, H(7, R3 - 3) + 2.5, R3 - 3], [R2 - 3, H(R2 - 3, -7) + 2.5, -7], [18, ky + 14, 16]], { size: 8, light: q.low ? 0 : 2 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    root.add(K.clouds({ y: 250, extent: 800, count: 10, opacity: 0.45 }));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 260, center: [0, 20, 40], minDistance: 18,
      hero: { pos: [170, 100, 190], target: [-4, 30, 6] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x5a78b8, horizon: 0xf6c8a0, fog: 0xeccaa8, fogD: 0.0015, sunC: 0xffc890, sunI: 2.8, hemiSky: 0xb0b8d8, hemiGround: 0x6a6a48, hemiI: 0.95 },
        day: { top: 0x4f94d6, horizon: 0xf2e6c0, fog: 0xe6dcba, fogD: 0.0011, az: 0.2, elev: 0.5, sunC: 0xffe8c0, sunI: 3.3, hemiSky: 0xb0cce8, hemiGround: 0x7a8248, hemiI: 1.0 },
        dusk: { top: 0x3a4478, horizon: 0xf0a468, fog: 0xd8a888, fogD: 0.0016, sunC: 0xffa860, sunI: 2.9, hemiSky: 0x9a98c8, hemiGround: 0x5a5a40, hemiI: 0.9 },
        night: { top: 0x0e1840, horizon: 0x3a4c7c, fog: 0x2a3860, fogD: 0.0019, sunC: 0xb0c4f8, sunI: 1.5, elev: 0.5, hemiSky: 0x7a94c8, hemiGround: 0x2a3a34, hemiI: 1.45, exposure: 1.2 },
      } },
      landmarks: {
        'tyrell-keep': lm(0, 0, 26, 56), 'concentric-walls': lm(-R3 * 0.7, R3 * 0.7, 18, 18), 'rose-gardens': lm(-34, 14, 18, 3), 'hedge-maze': lm(R2 + 12, 40, 18, 5),
        'castle-sept': lm(22, 22, 9, 26), 'godswood': lm(-58, -56, 14, 6), 'mander': lm(60, 160, 18, 4), 'orchards': lm(-240, 0, 40, 8), 'highgarden-town': lm(160, -20, 40, 8), 'the-hill-and-road': lm(14, 110, 24, 6),
      },
    };
  },
};
