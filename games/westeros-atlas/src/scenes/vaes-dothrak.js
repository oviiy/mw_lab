// Vaes Dothrak — the only city of the Dothraki. Book anchors: no walls and no steel (no blade may be drawn); the Horse Gate (two huge bronze horses);
// the godsway lined with plundered monuments; Western and Eastern markets; the Mother of Mountains (only men climb it) and the Womb of the World
// (a bottomless lake); the dosh khaleen; huge halls of the khals among tents and huts, all in the grass sea. Everything else is interpretation.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const ROAD = [[-210, 14], [-150, 8], [-90, 2], [-30, -2], [30, 0], [100, -6], [160, -16], [205, -28]];
const MT = [310, -62], LAKE = [118, 48, 34];

// ---- helpers ----------------------------------------------------------------------------------------------------
const _c = new THREE.Color(), _c2 = new THREE.Color(), _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _d = new THREE.Vector3(), _s3 = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0), _one = new THREE.Vector3(1, 1, 1);
const jit = (hex, r, dh = 0.014, ds = 0.05, dl = 0.05) => { const h = {}; _c.set(hex).getHSL(h); return _c.setHSL((h.h + r.range(-dh, dh) + 1) % 1, K.clamp(h.s + r.range(-ds, ds), 0, 1), K.clamp(h.l + r.range(-dl, dl), 0, 1)).getHex(); };
const mix = (a, b, t) => _c.set(a).lerp(_c2.set(b), t).getHex();
/** tapered cylinder from a to c (world points), radius r0 at a, r1 at c */
function limb(b, mat, a, c, r0, r1, col, seg = 10) {
  _d.set(c[0] - a[0], c[1] - a[1], c[2] - a[2]); const L = _d.length(); if (L < 1e-3) return;
  const g = new THREE.CylinderGeometry(r1, r0, L, seg, 1, false); g.translate(0, L / 2, 0);
  _q.setFromUnitVectors(_up, _d.normalize()); _m4.compose(_p.set(a[0], a[1], a[2]), _q, _one); b.addGeometry(mat, g, _m4, col); g.dispose();
}
/** ellipsoid centred at c, long axis along (to - c); rl along axis, rw lateral (x), rp perpendicular in plane */
function blob(b, mat, c, to, rl, rw, rp, col, seg = 12) {
  _d.set(to[0] - c[0], to[1] - c[1], to[2] - c[2]).normalize(); if (_d.lengthSq() < 0.5) _d.set(0, 1, 0);
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg >> 1)); _q.setFromUnitVectors(_up, _d); _m4.compose(_p.set(c[0], c[1], c[2]), _q, _s3.set(rw, rl, rp)); b.addGeometry(mat, g, _m4, col); g.dispose();
}
/** Smooth variable-radius tube along a Catmull-Rom path (lateral squash on the binormal), capped at both ends. */
function loft(b, mat, pts, radii, col, squash = 1, radial = 14) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5), N = Math.max(10, pts.length * 7), fr = curve.computeFrenetFrames(N, false);
  const rad = (t) => { const f = t * (radii.length - 1), i = Math.min(radii.length - 2, Math.floor(f)), k = f - i, sm = k * k * (3 - 2 * k); return radii[i] + (radii[i + 1] - radii[i]) * sm; };
  const pos = [], idx = [];
  for (let i = 0; i <= N; i++) { const t = i / N, P = curve.getPointAt(t), r = rad(t), n = fr.normals[i], bn = fr.binormals[i];
    for (let j = 0; j < radial; j++) { const a = (j / radial) * 6.2832, ca = Math.cos(a) * r, sa = Math.sin(a) * r * squash; pos.push(P.x + n.x * ca + bn.x * sa, P.y + n.y * ca + bn.y * sa, P.z + n.z * ca + bn.z * sa); } }
  for (let i = 0; i < N; i++) for (let j = 0; j < radial; j++) { const a = i * radial + j, b2 = i * radial + (j + 1) % radial, c2 = (i + 1) * radial + j, d2 = (i + 1) * radial + (j + 1) % radial; idx.push(a, b2, c2, b2, d2, c2); }
  for (const [ring, flip, P] of [[0, 1, curve.getPointAt(0)], [N, 0, curve.getPointAt(1)]]) { const ci = pos.length / 3; pos.push(P.x, P.y, P.z); for (let j = 0; j < radial; j++) { const a = ring * radial + j, b2 = ring * radial + (j + 1) % radial; if (flip) idx.push(ci, a, b2); else idx.push(ci, b2, a); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  _m4.identity(); b.addGeometry(mat, g, _m4, col); g.dispose();
}
/** One rearing bronze stallion in its own (u,y) plane; u runs toward the road's centre line. Origin on the plinth top. */
function stallion(b, mats, GX, base, z0, sd) {
  const { bronze } = mats, W = (u, y, w = 0) => [GX + w, base + y, z0 - sd * u];
  const B = 0xb98d44, B2 = 0xa67b38, MANE = 0x5e4622, hoof = 0x4e3a1e;
  const LF = (pts, radii, col = B, sq = 1) => loft(b, bronze, pts.map((p) => W(...p)), radii, col, sq);
  const E = (c, to, rl, rw, rp, col = B, seg = 16) => blob(b, bronze, W(...c), W(...to), rl, rw, rp, col, seg);
  LF([[-2.5, 17.5], [2.5, 25.5], [6.8, 32.5], [9.6, 39.5]], [6.4, 6.6, 5.9, 5.0], B, 0.92);                    // haunch, loin and barrel in one sweep
  LF([[8.6, 37], [11.2, 43], [13.8, 48.6], [15.8, 53]], [4.9, 3.9, 3.1, 2.7], B, 0.72);                         // arched neck
  LF([[15.8, 53], [19.6, 54.6], [23.8, 54.3], [26, 53.2]], [2.8, 2.5, 1.85, 1.4], B, 0.78);                     // fine head
  E([20.3, 52.6, 0], [24, 52.2, 0], 4.2, 1.6, 1.4, B2); E([26.1, 53.1, 0], [27, 52.7, 0], 1.3, 1.3, 1.2, B2);  // jaw and muzzle
  for (const sw of [-1, 1]) { E([19.4, 55.4, sw * 1.9], [19.9, 55.4, sw * 1.9], 0.45, 0.3, 0.45, 0x2a1d0e, 8); E([15.4, 56.2, sw * 1.3], [14.9, 59.4, sw * 1.5], 1.7, 0.45, 0.6, B2, 8); }  // eyes and ears
  for (let i = 0; i < 8; i++) { const t = i / 7, u = 8.2 + t * 7.6, y = 41 + t * 12; E([u - 2.4, y + 0.6, 0], [u - 3.6, y - 1.8, 0], 2.1, 0.55, 1.0, MANE, 8); }   // mane along the crest
  for (const sw of [-1, 1]) {
    LF([[0.4, 19, sw * 3.4], [-1.0, 12.5, sw * 3.3], [-2.6, 7.2, sw * 3.1], [-2.8, 1.8, sw * 3.0]], [3.7, 2.6, 1.5, 1.2], B2);       // hind leg: thigh, hock, cannon
    E([-2.7, 0.8, sw * 3.0], [-2.7, 2.0, sw * 3.0], 1.0, 2.0, 2.2, hoof, 10);
    LF([[8.8, 34, sw * 3.5], [12.6, 31.2, sw * 3.6], [16.2, 34.2, sw * 3.7], [18.4, 37.6, sw * 3.8], [21.8, 34.6, sw * 3.8], [22.8, 32.2, sw * 3.8]], [2.7, 2.1, 1.7, 1.45, 1.1, 1.0], B2);   // foreleg folded and pawing
    E([22.9, 31.4, sw * 3.8], [23.2, 32.6, sw * 3.8], 0.9, 1.3, 1.4, hoof, 10);
  }
  LF([[-2, 24, 0], [-6.2, 21.5, 0], [-9.4, 14.5, 0], [-11.4, 6.2, 0]], [1.6, 1.5, 1.2, 0.3], MANE, 1.7);                     // streaming tail
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(61);
    const road = K.smoothPath(ROAD, 8);
    const roadD = (x, z) => K.distToPolyline(x, z, road).d;
    const heightAt = (x, z) => {
      let h = 3 + (K.fbm(x * 0.008, z * 0.008, 3, 3) - 0.5) * 7 + (K.fbm(x * 0.03, z * 0.03, 2, 4) - 0.5) * 1.4;
      const dm = Math.hypot((x - MT[0]) / 1.2, z - MT[1]);
      h += 86 * Math.exp(-(dm * dm) / (2 * 58 * 58)) * (0.75 + 0.5 * K.fbm(x * 0.02, z * 0.02, 3, 8));
      h += K.smoothstep(380, 560, Math.hypot(x - 20, z)) * 26 * K.fbm(x * 0.004, z * 0.004, 3, 11);    // far rolling downs, so the horizon is never a straight edge
      const dl = Math.hypot(x - LAKE[0], z - LAKE[1]);
      h -= (1 - K.smoothstep(LAKE[2] * 0.7, LAKE[2] + 8, dl)) * 8;
      return h;
    };
    const H = heightAt;
    // ---- terrain: green-gold steppe in drifts, straw-dry patches, bare trodden earth beside the godsway, lush lake margin, stony mountain
    const T = { g1: new THREE.Color(0x869e50), g2: new THREE.Color(0xc9b86a), straw: new THREE.Color(0xcdb877), lush: new THREE.Color(0x6e9048), dirt: new THREE.Color(0xb59b68), rock: new THREE.Color(0x8d8a7c), peak: new THREE.Color(0xa79f88), dry: new THREE.Color(0xc4a866) }, c = new THREE.Color();
    root.add(K.terrain({ size: 1300, seg: q.seg(180), heightAt, kind: 'grass', scale: 14, colorAt: (x, z, h, s) => {
      const n1 = K.fbm(x * 0.012, z * 0.012, 3, 6), n2 = K.fbm(x * 0.03, z * 0.03, 2, 3), n3 = K.fbm(x * 0.006 + 9, z * 0.006, 3, 2);
      c.copy(T.g1).lerp(T.g2, K.clamp(n1 * 2.4 - 0.7, 0, 1)); c.lerp(T.straw, K.clamp((n3 - 0.5) * 3, 0, 0.6)); c.lerp(T.dry, K.clamp((n2 - 0.58) * 3, 0, 0.4));
      const dl = Math.hypot(x - LAKE[0], z - LAKE[1]); c.lerp(T.lush, K.smoothstep(LAKE[2] + 40, LAKE[2], dl) * 0.8);
      const rd = Math.abs(x) < 260 ? roadD(x, z) : 99; c.lerp(T.dirt, K.smoothstep(22, 6, rd) * 0.55);
      c.lerp(T.rock, K.clamp(s * 3.2 + K.smoothstep(22, 62, h) * 0.8, 0, 0.92)); c.lerp(T.peak, K.smoothstep(55, 90, h) * 0.5);
      return c; } }));
    const lake = K.water({ w: 100, d: 100, seg: q.seg(40), center: LAKE, level: 1.3, heightAt, deep: 0x15303f, shallow: 0x588f8a, foam: 0xe8e4d0, opacity: 0.95, choppy: 0.3, speed: 0.35 });
    root.add(lake); ctx.registerWater(lake);

    const mud = tri('plaster', { color: 0xffffff, scale: 6, snow: false }), thatch = tri('thatch', { color: 0xffffff, scale: 3, bump: 0.35, snow: false }), wood = tri('wood', { color: 0xffffff, scale: 4, snow: false });
    const stone = tri('stone', { color: 0xffffff, scale: 8, bump: 0.6, snow: false }), roadMat = tri('sand', { color: 0xffffff, scale: 7, snow: false });
    const bronze = flat(0xffffff, { rough: 0.4, metal: 0.4, flatShading: false }), dark = flat(0x1b120e), cloth = flat(0xffffff, { rough: 1, flatShading: false });
    const felt = tri('thatch', { color: 0xffffff, scale: 2.5, bump: 0.3, snow: false }), feltW = tri('plaster', { color: 0xffffff, scale: 3, snow: false });
    const lampG = glow(0xffc477, 1.3), doorG = glow(0xffa84a, 1.0);
    const instStd = new THREE.MeshStandardMaterial({ roughness: 1 });
    const grassMat = new THREE.MeshStandardMaterial({ roughness: 1, side: THREE.DoubleSide });
    grassMat.onBeforeCompile = (sh) => {      // blades bend in the wind: bend grows with height, phase comes from the instance position
      sh.uniforms.uWind = K.shared.uTime;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uWind;').replace('#include <begin_vertex>', '#include <begin_vertex>\n float ph_ = uWind * 1.7 + instanceMatrix[3].x * 0.09 + instanceMatrix[3].z * 0.06; transformed.x += (sin(ph_) * 0.7 + sin(ph_ * 2.3) * 0.25) * position.y * 0.9; transformed.z += cos(ph_ * 0.8) * position.y * 0.4;');
    };
    grassMat.customProgramCacheKey = () => 'vdgrass';
    const b = new Batch();

    // ---- godsway: broad worn road of beaten earth and grass, shouldered with a darker rut line
    b.ribbon(roadMat, road, 20, heightAt, 0.14, 0xcdbb88); b.ribbon(roadMat, road, 12, heightAt, 0.18, 0xbfa874);
    // ---- the Horse Gate: two enormous bronze stallions rearing toward one another over the godsway
    const GX = -150, GZ = 7, gy = H(GX, GZ);
    for (const sd of [-1, 1]) {
      const z0 = GZ + sd * 28.2, by = gy + 8;
      b.box(stone, GX, gy - 3, z0, 34, 7, 22, 0, 0xcfc4a8); b.box(stone, GX, gy + 3, z0, 30, 2, 18, 0, 0xddd2b6); b.box(stone, GX, gy + 5, z0, 27, 3, 15, 0, 0xcdc2a6);   // stepped plinth
      for (const dx of [-14, 14]) b.box(stone, GX + dx, gy + 3, z0 - sd * 10.6, 1.6, 4, 1.6, 0, 0xb8ad90);
      stallion(b, { bronze }, GX, by, z0, sd);
    }
    // ---- monuments along the godsway: obelisks, headless statues, bronze columns, cairns, seated idols from a hundred conquered peoples
    const mk = K.rng(9);
    for (let i = 0; i < 46; i++) {
      const pt = K.pointAlong(road, 30 + i * ((K.polyLength(road) - 90) / 46)), side = i % 2 ? 1 : -1, off = 15 + mk.range(0, 6);
      const x = pt.x + Math.cos(pt.angle) * off * side, z = pt.z - Math.sin(pt.angle) * off * side, y = H(x, z), kind = i % 5, k = mk.range(0.8, 1.6), sc = jit(0xd6cdb8, mk, 0.01, 0.05, 0.06);
      b.box(stone, x, y - 0.8, z, 4.2, 1.4, 4.2, mk() * 0.3, mix(sc, 0x8a8068, 0.4));
      if (kind === 0) { b.box(stone, x, y + 0.6, z, 1.6 * k, 12 * k, 1.6 * k, 0.3, sc); b.pyramid(stone, x, y + 0.6 + 12 * k, z, 1.6 * k, 1.8 * k, 1.6 * k, 0.3, 0xe6dcc0); }
      else if (kind === 1) { b.cyl(stone, x, y + 0.6, z, 1.1 * k, 5.4 * k, { top: 0.72, seg: 8, color: sc }); b.cyl(stone, x, y + 0.6 + 4.6 * k, z, 1.3 * k, 0.5, { seg: 8, color: mix(sc, 0x6a6050, 0.3) }); b.sphere(stone, x, y + 0.6 + 5.6 * k, z, 0.85 * k, { seg: 8, color: sc }); }
      else if (kind === 2) { b.cyl(bronze, x, y + 0.6, z, 0.85 * k, 8 * k, { top: 0.8, seg: 10, color: 0x9a7a3c }); b.cyl(bronze, x, y + 0.6 + 8 * k, z, 1.4 * k, 0.8, { seg: 10, color: 0xb98d44 }); b.sphere(bronze, x, y + 1.6 + 8 * k, z, 0.8 * k, { seg: 8, color: 0xb98d44 }); }
      else if (kind === 3) { b.cone(stone, x, y + 0.6, z, 2.6 * k, 7 * k, { seg: 6, color: mix(sc, 0xb8a070, 0.4) }); b.cone(stone, x + 1.8, y + 0.6, z + 1, 1.4 * k, 3.4 * k, { seg: 5, color: sc }); }
      else { b.box(stone, x, y + 0.6, z, 2.2, 3, 2.2, 0, sc); b.box(stone, x, y + 3.6, z, 5 * k, 1.2, 1.5, 0.4, mix(sc, 0xa89878, 0.5)); b.sphere(stone, x, y + 4.8, z, 1.1, { seg: 8, color: sc }); }
    }

    // ---- markets: Western (Free Cities caravans) and Eastern (Yi Ti / Asshai / Jade Sea caravans) — muted striped awnings, rugs, crates, hooped wagons
    const markets = [{ c: [-92, 2], pal: [0xa8483c, 0xcda650, 0x44728a, 0xe0d4b4] }, { c: [22, 2], pal: [0x4b7f64, 0xc08a38, 0x7a4a7a, 0xd8cdb0, 0x3f8490] }];
    for (const mkt of markets) {
      for (let i = 0; i < 28; i++) {
        const x = mkt.c[0] + rr.range(-38, 38), z = mkt.c[1] + rr.range(-34, 34); if (roadD(x, z) < 12) continue; const y = H(x, z), col = mkt.pal[i % mkt.pal.length], ry = rr.range(-0.4, 0.4), c0 = Math.cos(ry), s0 = Math.sin(ry);
        if (i % 3) {
          b.box(cloth, x - 1.5 * c0, y + 2.7, z + 1.5 * s0, 3.1, 0.14, 4.6, ry, col, 0, 0.17); b.box(cloth, x + 1.5 * c0, y + 2.7, z - 1.5 * s0, 3.1, 0.14, 4.6, ry, mix(col, 0xefe2c4, 0.55), 0, -0.17);
          for (const [dx, dz] of [[-2.8, -2], [2.8, -2], [-2.8, 2], [2.8, 2]]) b.cyl(wood, x + dx * c0 + dz * s0, y, z - dx * s0 + dz * c0, 0.1, 2.8, { seg: 5, color: 0x6b4a30 });
          b.box(wood, x, y, z, 3.8, 0.9, 1.2, ry, jit(0x7a5a3c, rr)); b.box(cloth, x + 2.4 * c0, y, z - 2.4 * s0, 1.6, 0.06, 1.2, ry + 0.3, mix(col, 0x8a3a2a, 0.5));
        } else { b.cyl(feltW, x, y, z, 3.1, 2.2, { seg: 10, color: mix(col, 0xe0d4b4, 0.5) }); b.dome(feltW, x, y + 2.2, z, 3.1, { seg: 10, sy: 0.7, color: mix(col, 0xe0d4b4, 0.5) }); b.box(dark, x + s0 * 3.05, y, z + c0 * 3.05, 1.2, 1.8, 0.14, ry); }
      }
      for (let i = 0; i < 8; i++) { const x = mkt.c[0] + rr.range(-42, 42), z = mkt.c[1] + rr.range(-40, 40); if (roadD(x, z) < 13) continue; const y = H(x, z), ry = rr() * 3;
        b.box(wood, x, y + 0.7, z, 5, 1.0, 2.4, ry, jit(0x7a5a3c, rr)); limb(b, cloth, [x - 2 * Math.cos(ry), y + 1.6, z + 2 * Math.sin(ry)], [x + 2 * Math.cos(ry), y + 1.6, z - 2 * Math.sin(ry)], 1.15, 1.15, 0xe4d8bc, 8);
        for (const sg of [-1, 1]) b.cyl(wood, x + sg * 1.6 * Math.cos(ry) + Math.sin(ry) * 1.3, y, z - sg * 1.6 * Math.sin(ry) + Math.cos(ry) * 1.3, 0.8, 0.3, { seg: 8, color: 0x4a3626 }); }
    }

    // ---- halls of the khals: great timber-and-thatch halls with carved posts and bronze horse-head finials, no wall around them
    const halls = [[-60, -52], [-30, 56], [58, -58], [50, 72], [-120, 58], [-130, -54], [8, -66], [-8, 70]], hallFire = [], tentSeeds = [];
    halls.forEach(([x, z], i) => {
      const y = H(x, z), ry = rr.range(-0.5, 0.5), c0 = Math.cos(ry), s0 = Math.sin(ry), len = 28, wd = 10, h = 6, at = (ox, oz) => [x + ox * c0 + oz * s0, z - ox * s0 + oz * c0];
      b.box(stone, x, y - 1.2, z, len + 1.8, 2.0, wd + 1.8, ry, 0xb2a688); b.box(mud, x, y + 0.7, z, len, h - 0.7, wd, ry, jit(0xcdb48a, rr, 0.012, 0.05, 0.05));
      for (let k = 0; k <= 8; k++) for (const sg of [-1, 1]) { const [px, pz] = at((k / 8 - 0.5) * len, sg * (wd / 2 + 0.1)); b.cyl(wood, px, y, pz, 0.34, h + 0.2, { seg: 6, color: 0x6b4a30 }); }
      b.box(wood, x, y + h - 0.2, z, len + 0.6, 0.5, wd + 0.5, ry, 0x5e4228);
      b.prism(thatch, x, y + h + 0.2, z, len + 4.6, 5.6, wd + 5.2, ry, jit(0xb59a52, rr, 0.015, 0.06, 0.05));
      b.prism(thatch, x, y + h + 5.0, z, len + 5.0, 1.0, wd * 0.28, ry, 0x9a8240);                     // ridge cap
      for (const sg of [-1, 1]) { const [fx, fz] = at(sg * (len / 2 + 2.3), 0); b.cyl(wood, fx, y + h + 3.2, fz, 0.2, 3.6, { seg: 5, color: 0x5e4228 }); b.sphere(bronze, fx, y + h + 6.8, fz, 0.7, { seg: 8, color: 0xb98d44 }); b.cone(bronze, fx, y + h + 6.6, fz, 0.25, 1.6, { seg: 5, color: 0xb98d44 }); }
      const [dx, dz] = at(0, wd / 2 + 0.05); b.box(dark, dx, y, dz, 4.4, 4.4, 0.25, ry); b.box(wood, dx, y + 4.4, dz, 6, 0.6, 0.6, ry, 0x5e4228);
      for (const sg of [-1, 1]) { const [lx, lz] = at(sg * 3.6, wd / 2 + 1.2); b.cyl(wood, lx, y, lz, 0.4, 5.2, { seg: 6, color: 0x5e4228 }); b.box(doorG, lx, y + 5.2, lz, 0.7, 0.9, 0.7, ry); }
      for (const sg of [-1, 1]) { const [wx, wz] = at(sg * 8, wd / 2 + 0.05); b.box(doorG, wx, y + 2.6, wz, 1.1, 1.4, 0.12, ry); }
      { const [fx, fz] = at(0, wd / 2 + 4); hallFire.push([fx, y + 0.8, fz]); } tentSeeds.push([x, z, 24, 9 + (i % 4)]);
    });

    // ---- the dosh khaleen: a ring of round thatched huts around a council hall near the Mother of Mountains
    const DK = [192, -40];
    for (let i = 0; i < 18; i++) { const a = (i / 18) * 6.28, r = 24 + (i % 2) * 7, x = DK[0] + Math.cos(a) * r, z = DK[1] + Math.sin(a) * r * 0.8, y = H(x, z), k = rr.range(0.9, 1.15);
      b.cyl(mud, x, y - 0.6, z, 3.4 * k, 3.6 * k, { seg: 10, color: jit(0xcdb48a, rr) }); b.cone(thatch, x, y + 2.8 * k, z, 4.5 * k, 4.4 * k, { seg: 10, color: jit(0xa8884a, rr, 0.015, 0.06, 0.05) }); b.sphere(bronze, x, y + 7.1 * k, z, 0.35, { seg: 6, color: 0xb98d44 });
      b.box(dark, x + Math.cos(a + 3.14) * 3.3 * k, y, z + Math.sin(a + 3.14) * 3.3 * 0.8 * k, 1.1, 1.8, 0.2, -a); }
    { const [x, z] = DK, y = H(x, z); b.box(stone, x, y - 1.2, z, 28, 2, 13, 0.2, 0xb2a688); b.box(mud, x, y + 0.7, z, 26, 5.3, 11, 0.2, 0xd2b88e); b.prism(thatch, x, y + 6, z, 31, 6, 14, 0.2, 0xa88c4a); for (const sg of [-1, 1]) b.cyl(wood, x + sg * 15, y, z - sg * 3, 0.5, 9, { seg: 6, color: 0x5e4228 }); }
    hallFire.push([DK[0] + 6, H(...DK) + 1, DK[1] + 9], [DK[0] - 6, H(...DK) + 1, DK[1] - 9]);

    // ---- the Mother of Mountains: a switchback path of beaten earth up the flank to a ring of standing stones (only men may climb)
    { const sp = []; for (let i = 0; i <= 26; i++) { const t = i / 26, a = -2.9 + t * 7.6, rad = 62 * (1 - t * 0.9); sp.push([MT[0] + Math.cos(a) * rad * 1.15, MT[1] + Math.sin(a) * rad]); }
      b.ribbon(roadMat, K.smoothPath(sp, 4), 4.2, heightAt, 0.45, 0xcbb888);
      const tx = MT[0] - 4, tz = MT[1] + 2, ty = H(tx, tz); for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.28; b.box(stone, tx + Math.cos(a) * 6, ty, tz + Math.sin(a) * 6, 1.1, rr.range(3.4, 5.4), 0.9, -a, jit(0xbfb49a, rr)); } b.cyl(stone, tx, ty, tz, 2.6, 0.5, { seg: 10, color: 0xa89c84 }); }
    // ---- the Womb of the World: the standing circle of weathered idols around the lake
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.28 + 0.2, r = LAKE[2] + 9, x = LAKE[0] + Math.cos(a) * r, z = LAKE[1] + Math.sin(a) * r, y = H(x, z); b.box(stone, x, y - 0.5, z, 1.6, rr.range(3.5, 6), 1.4, -a, jit(0xc8bfa8, rr)); }

    // ---- felt tents (low domes on short walls) in loose camps around halls and in rings across the plain, lit doors at night
    const camps = tentSeeds.concat(Array.from({ length: 14 }, () => [rr.range(-200, 200), rr.range(-100, 105), 20, 8]));
    const tD = new Inst(G.cone(10), felt), tW = new Inst(G.cyl(9, 1), feltW), tL = new Inst(G.box(), doorG), tP = new Inst(G.cyl(5, 1), instStd), feltCols = [0xe4cf9c, 0xc9a56c, 0xa98757, 0xdcc088, 0x8c6c46, 0xe8d8ae];
    for (const [cx, cz, rad, n] of camps) {
      if (Math.hypot(cx - LAKE[0], cz - LAKE[1]) < LAKE[2] + 26) continue;
      for (let i = 0; i < Math.round(n * (q.low ? 0.6 : 1)); i++) { const a = rr() * 6.28, rd = Math.sqrt(rr()) * rad + 10, x = cx + Math.cos(a) * rd, z = cz + Math.sin(a) * rd * 0.8;
        if (roadD(x, z) < 15 || Math.hypot(x - LAKE[0], z - LAKE[1]) < LAKE[2] + 12 || Math.hypot(x - DK[0], z - DK[1]) < 40 || markets.some((m) => Math.abs(x - m.c[0]) < 44 && Math.abs(z - m.c[1]) < 40)) continue;
        const y = H(x, z), k = rr.range(0.85, 1.35), col = rr.pick(feltCols); tW.add(x, y - 0.3, z, 3.0 * k, 2.2 * k, 3.0 * k, 0, col); tD.add(x, y + 1.9 * k, z, 3.15 * k, 3.0 * k, 3.15 * k, rr() * 6, col);
        if (rr() < 0.45) tL.add(x, y + 0.2, z + 2.98 * k, 0.8, 1.3, 0.2, 0, 0xffffff); if (rr() < 0.4) tP.add(x, y + 4.8 * k, z, 0.07, 1.4, 0.07, 0, 0x4a3626); }
    }
    root.add(b.build({}), tD.build(), tW.build(), tL.build(), tP.build());

    // ---- grass in the wind: clumped blades, straw and green, plus a scatter of wildflowers and lake reeds
    const tuft = new Inst(G.cone(4), grassMat), reed = new Inst(G.cone(4), grassMat), flo = new Inst(G.sphere(5), instStd), gcols = [0x8fa050, 0xa8ae5c, 0xc4b468, 0x7f9448, 0xb8a860, 0x9aa856];
    for (let i = 0; i < q.dens(3200); i++) { const cx = rr.range(-330, 340), cz = rr.range(-250, 260), cy = H(cx, cz); if (cy > 16 || K.fbm(cx * 0.02, cz * 0.02, 2, 21) < 0.4 || roadD(cx, cz) < 11 || Math.hypot(cx - LAKE[0], cz - LAKE[1]) < LAKE[2] - 2) continue;
      const base = gcols[i % 6]; for (let j = 0; j < 3; j++) { const x = cx + rr.range(-0.9, 0.9), z = cz + rr.range(-0.9, 0.9), k = rr.range(0.8, 1.9); tuft.add(x, H(x, z) - 0.05, z, 0.26 * k, 2.1 * k, 0.26 * k, rr() * 3, j === 0 ? mix(base, 0xe0d090, 0.3) : base); } }
    for (let i = 0; i < q.dens(240); i++) { const a = rr() * 6.28, r = LAKE[2] + rr.range(-3, 6), x = LAKE[0] + Math.cos(a) * r, z = LAKE[1] + Math.sin(a) * r, y = H(x, z); reed.add(x, y, z, 0.35, rr.range(2.5, 4), 0.35, 0, [0x6d8a3c, 0x7c9a48, 0x8a9a50][i % 3]); }
    for (let i = 0; i < q.dens(700); i++) { const x = rr.range(-300, 320), z = rr.range(-240, 240), y = H(x, z); if (y > 14 || roadD(x, z) < 12 || Math.hypot(x - LAKE[0], z - LAKE[1]) < LAKE[2]) continue; flo.add(x, y + 0.5, z, 0.22, 0.22, 0.22, 0, [0xe8e2c8, 0xd9b040, 0xb04a5a, 0x8a6ab0][i % 4]); }
    root.add(tuft.build(), reed.build(), flo.build());

    // ---- life: riders, herds, hearth smoke, horsetail standards, fires at the hall doors, hawks, cloud shadow
    const wk = K.walkers({ paths: [road, K.smoothPath([[-140, 10], [-120, -30], [-60, -52], [-30, 56]], 6), [[-100, 40], [-40, 30], [10, 40], [60, 54]], [[150, -10], DK]], heightAt, count: q.dens(74), rng: K.rng(5), speed: [1.6, 3.4], colors: [0x6b4a34, 0x3f5a50, 0x8a3b32, 0x8f7a4a, 0xe0d4b4], height: 1.8 });
    root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const herd = K.walkers({ paths: [[[-200, -90], [-120, -85], [0, -95]], [[40, 95], [120, 90], [180, 70]], [[-170, 80], [-110, 95], [-60, 85]]], heightAt, count: q.dens(46), rng: K.rng(7), speed: [1.2, 2.6], colors: [0x3a2a1c, 0x8a6a42, 0xd8d0c0, 0x5a4030, 0x6b4a30], height: 1.5 });
    root.add(herd); ctx.onUpdate((dt, t) => herd.userData.update(t));
    root.add(K.smoke(halls.map(([x, z]) => [x, H(x, z) + 11, z]).concat([[DK[0], H(...DK) + 11, DK[1]], [-92, H(-92, 10) + 3, 10], [22, H(22, 10) + 3, 10]]), { size: 22, rise: 16, opacity: 0.22, color: 0xcfc4b0 }));
    root.add(K.smoke(Array.from({ length: 16 }, () => { const x = rr.range(-300, 300), z = rr.range(-220, 220); return [x, H(x, z) + 1, z]; }), { color: 0xdccc98, size: 60, rise: 6, opacity: 0.1, spread: 14, perStack: 4 }));
    root.add(K.smoke([[LAKE[0] - 10, 2.5, LAKE[1] + 6], [LAKE[0] + 14, 2.5, LAKE[1] - 8], [LAKE[0], 2.5, LAKE[1] - 20]], { color: 0xe8ece8, size: 50, rise: 3, opacity: 0.12, spread: 10, perStack: 6 }));
    root.add(K.banners([[-60, 22, -52], [58, 22, -58], [50, 22, 72], [-30, 22, 56], [DK[0], 18, DK[1]], [GX, 76, GZ - 12]].map(([x, y, z]) => ({ x, y: H(x, z) + y - 8, z, w: 3, h: 9, color: [0x9a3a30, 0x2f5a3a, 0xc8a850][Math.abs(Math.round(x)) % 3], ry: 0.6 }))));
    const fire = K.fires(hallFire.concat([[-92, H(-92, 24) + 1, 24], [22, H(22, 24) + 1, 24]]), { size: 7, light: q.low ? 0 : 2 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const birds = K.birds({ center: [LAKE[0], 30, LAKE[1]], radius: 70, count: q.dens(9), color: 0xe6e2d8, size: 1.2, spreadY: 10, seed: 6 }); root.add(birds); ctx.onUpdate((dt, t) => birds.userData.update(t));
    const hawks = K.birds({ center: [0, 90, 0], radius: 180, count: q.dens(5), color: 0x3a2a1c, size: 2.2, spreadY: 16, seed: 2 }); root.add(hawks); ctx.onUpdate((dt, t) => hawks.userData.update(t));
    const cl = K.clouds({ y: 260, extent: 900, count: 12, opacity: 0.36, color: 0xf6ecd6 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 260, center: [40, 0, 0], minDistance: 20,
      hero: { pos: [-318, 128, 186], target: [40, 10, -10] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn:  { top: 0x4e6aa4, horizon: 0xf0c294, fog: 0xe2c49c, fogD: 0.0011, sunC: 0xffc07a, sunI: 3.0, hemiSky: 0xa8b4d8, hemiGround: 0x6a5c40, hemiI: 0.78 },
        day:   { top: 0x4f8ccc, horizon: 0xf0e2b4, fog: 0xe4d9ae, fogD: 0.0008, sunC: 0xfff0cc, sunI: 3.4, hemiSky: 0xbcd0e8, hemiGround: 0x84764a, hemiI: 0.98 },
        dusk:  { top: 0x38356e, horizon: 0xf09e62, fog: 0xd4966c, fogD: 0.0012, sunC: 0xff9a56, sunI: 3.4, hemiSky: 0xc0b4dc, hemiGround: 0x9a7a58, hemiI: 1.25 },
        night: { top: 0x0a1236, horizon: 0x2e4068, fog: 0x1f2c4a, fogD: 0.0015, sunC: 0xa6bcf0, sunI: 1.35, hemiSky: 0x7488c0, hemiGround: 0x2a3030, hemiI: 1.3, exposure: 1.3 },
      } },
      landmarks: {
        'horse-gate': { ...lm(GX, GZ, 40, 66), cam: { pos: [GX - 95, H(GX, GZ) + 46, GZ + 18], target: [GX, H(GX, GZ) + 40, GZ] } }, 'godsway-monuments': lm(-50, -2, 30, 14), 'western-market': lm(-92, 2, 40, 8), 'eastern-market': lm(22, 2, 40, 8),
        'khals-halls': lm(58, -58, 22, 12), 'dosh-khaleen-huts': lm(DK[0], DK[1], 30, 8), 'womb-of-the-world': lm(LAKE[0], LAKE[1], 34, 5), 'mother-of-mountains': lm(MT[0] - 20, MT[1], 70, 62), 'sea-of-grass': lm(-60, 120, 60, 6),
      },
    };
  },
};
