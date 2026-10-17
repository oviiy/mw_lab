// Isle of Faces — book anchors: an island in the God's Eye, sacred to the old gods, with weirwoods whose bark was carved with faces
// (the "green men" keep it). Everything else — the grove plan, the stones, the huts, the distant shore — is restrained interpretation.
//
// Visual language: a reverent hush. Pale smooth weirwood boles with deep-cut faces and dark-red sap, crowns of red leaf, a carpet of
// fallen leaves over dark loam, low mist on a pewter lake, soft dawn light; the only warmth is the green men's hearth and lantern.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G: GG, tri, flat, glow } = K;

const TAU = Math.PI * 2;
const jit = (hex, r, dh = 0.012, ds = 0.05, dl = 0.03) => new THREE.Color(hex).offsetHSL((r() - 0.5) * 2 * dh, (r() - 0.5) * 2 * ds, (r() - 0.5) * 2 * dl);
const _up = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _d = new THREE.Vector3(), _e = new THREE.Euler();
function strut(b, mat, p, q, w, color = 0xffffff, d = w) {
  _d.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); const len = _d.length(); if (len < 1e-3) return;
  _q.setFromUnitVectors(_up, _d.multiplyScalar(1 / len)); _m.compose(_p.set(p[0], p[1], p[2]), _q, _s.set(w, len, d));
  b.addGeometry(mat, GG.box(), _m, color);
}
/** soft blob with true centre semantics (non-uniform) */
function blob(b, mat, cx, cy, cz, rx, ry_, rz, color = 0xffffff, rot = 0, seg = 8) {
  _m.compose(_p.set(cx, cy - ry_, cz), _q.setFromEuler(_e.set(0, rot, 0)), _s.set(rx, ry_, rz)); b.addGeometry(mat, GG.sphere(seg), _m, color);
}

/** Smooth-hulled little ship (hull length along X) with a billowing sail; shared look with Harrenhal's boats. */
function makeShip(hullMat, type, len, hullHex, sailHex, seed) {
  const g = new THREE.Group(), sb = new Batch(), r = K.rng(seed), beamH = len * (type === 'barge' ? 0.14 : 0.15), Dp = len * 0.09;
  const N = 10, J = 6, pos = [], idx = [], rowN = 2 * J + 1;
  for (let i = 0; i <= N; i++) {
    const u = i / N, e = Math.abs(2 * u - 1), bf = Math.pow(Math.sin(Math.PI * (0.05 + 0.9 * u)), 0.5) * (1 - K.smoothstep(0.62, 1, u) * 0.92), x = (u - 0.5) * len;
    const keel = -Dp * 0.35 + Dp * 0.25 * e * e, top = Dp * 0.62 + len * 0.045 * e * e * (type === 'barge' ? 0.3 : 1);
    for (let j = 0; j < rowN; j++) { const f = ((j / (rowN - 1)) * 2 - 1) * Math.PI / 2; pos.push(x, keel + (top - keel) * (1 - Math.cos(f)), beamH * bf * Math.sin(f)); }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < rowN - 1; j++) { const a = i * rowN + j, bI = a + 1, cI = a + rowN, dI = cI + 1; idx.push(a, cI, bI, bI, cI, dI); }
  const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setIndex(idx); hg.computeVertexNormals();
  sb.addGeometry(hullMat, hg, new THREE.Matrix4(), hullHex);
  const top0 = Dp * 0.62;
  sb.box(hullMat, -len * 0.5, -Dp * 0.1, 0, 0.4, top0 + Dp * 0.1 + len * 0.045, beamH * 0.8, 0, hullHex); sb.box(hullMat, 0, top0 - 0.55, 0, len * 0.72, 0.18, beamH * 1.5, 0, 0xe6cda4);
  if (type !== 'barge') sb.box(hullMat, -len * 0.36, top0 - 0.5, 0, len * 0.22, 1.6, beamH * 1.5, 0, hullHex);
  const mx = len * 0.04, mh = len * (type === 'barge' ? 0.7 : 0.85), yw = top0 + mh * 0.8, sw = beamH * 2.9, sh = mh * 0.55;
  sb.cyl(hullMat, mx, top0 - 0.5, 0, 0.2, mh, { seg: 6, top: 0.7, color: 0x6a5240 }); sb.box(hullMat, mx, yw, 0, 0.16, 0.16, sw * 1.12, 0, 0x6a5240);
  const sg = new THREE.PlaneGeometry(sw, sh, 6, 4), sm = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: sailHex, roughness: 1, side: THREE.DoubleSide }));
  sm.position.set(mx + 0.15, yw - sh / 2, 0); sm.rotation.y = Math.PI / 2; sm.castShadow = true; sm.userData.base = Float32Array.from(sg.attributes.position.array); sm.userData.hw = sw / 2; sm.userData.hh = sh / 2; sm.userData.ph = r() * 6; g.add(sm);
  strut(sb, hullMat, [mx, top0 + mh * 0.97, 0], [len * 0.47, top0 + 0.6, 0], 0.06, 0x4a3a2e); strut(sb, hullMat, [mx, top0 + mh * 0.97, 0], [-len * 0.48, top0 + 1.4, 0], 0.06, 0x4a3a2e);
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

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root;
    const POOL = [14, -10];
    const bump = (x, z) => { const d = Math.hypot(x, z) + (K.fbm(x * 0.03, z * 0.03, 2, 3) - 0.5) * 22; return 1 - K.smoothstep(64, 98, d); };
    const baseH = (x, z) => {
      const r = Math.hypot(x, z);
      let h = -9 + bump(x, z) * 14.8 + bump(x, z) * (K.fbm(x * 0.04, z * 0.04, 3, 7) - 0.5) * 3.4 + (1 - K.smoothstep(0, 30, r)) * 2.4 + (1 - K.smoothstep(0, 14, r)) * 0.8;
      h += K.smoothstep(270, 430, r) * (34 + K.fbm(x * 0.006, z * 0.006, 3, 2) * 70);
      return h;
    };
    const POOL_LEVEL = baseH(POOL[0], POOL[1]) - 0.55;
    const heightAt = (x, z) => { const h = baseH(x, z), pd = Math.hypot((x - POOL[0]) / 10.5, (z - POOL[1]) / 8.2); return h - (1 - K.smoothstep(0.35, 1, pd)) * 1.9 * (h > 2 ? 1 : 0); };
    const H = heightAt;
    const moss = new THREE.Color(0x6a8a42), moss2 = new THREE.Color(0x4f7040), leafC = new THREE.Color(0x8a3a2a), loam = new THREE.Color(0x4a3426), sand = new THREE.Color(0x8a8668), hill = new THREE.Color(0x3d4e3f), rockC = new THREE.Color(0x6c6a60), c = new THREE.Color();
    root.add(K.terrain({ size: 1100, seg: q.seg(180), heightAt, kind: 'grass', scale: 10, colorAt: (x, z, h, s) => {
      const r = Math.hypot(x, z), n = K.fbm(x * 0.05, z * 0.05, 2, 5), n2 = K.fbm(x * 0.15, z * 0.15, 2, 8);
      c.copy(moss).lerp(moss2, K.smoothstep(0.4, 0.7, n)).lerp(leafC, K.clamp((1 - K.smoothstep(18, 70, r)) * (0.5 + n2 * 0.7) + n * 0.1 - 0.05, 0, 0.78));
      c.lerp(loam, (1 - K.smoothstep(0, 16, r)) * 0.55);
      if (h < 1.1) c.lerp(sand, K.smoothstep(1.1, 0.0, h) * 0.8);
      if (r > 120) c.lerp(h > 14 ? hill : moss2, 0.7);
      c.lerp(rockC, K.clamp(s * 2.4 - 0.1, 0, 0.7));
      return c;
    } }));
    const lake = K.water({ w: 1100, d: 1100, seg: q.seg(110), level: 0, heightAt, deep: 0x1a3440, shallow: 0x5a7c76, opacity: 0.93, choppy: 0.25, speed: 0.25, foam: 0xdfe6e2 });
    root.add(lake); ctx.registerWater(lake);

    const T = (k, color, scale = 8, o = {}) => tri(k, { color, scale, snow: false, ...o });
    const M = {
      bark: T('plaster', 0xf6f1e6, 4, { rough: 0.85, bump: 0.7 }), barkD: T('stone', 0x8a8274, 5), leaf: T('grass', 0xffffff, 3, { rough: 1, bump: 0.8 }), leafG: T('grass', 0xffffff, 3, { rough: 1 }),
      dark: flat(0x160807, { rough: 1 }), sap: flat(0x7a1511, { rough: 0.5, flatShading: false }), wood: T('wood', 0xa08460, 4), woodD: T('wood', 0x5a4632, 4), thatch: T('thatch', 0xcdb784, 4),
      stone: T('stone', 0xb4b2a6, 6), rock: T('rock', 0x9a988c, 8), moss: T('grass', 0x7a9a50, 5, { rough: 1 }), flag: T('cobble', 0xb4ae9c, 5), hide: T('plaster', 0xd8ccb0, 5),
      lamp: glow(0xffb45a, 1.5), win: glow(0xffc46b, 1.2), iron: flat(0x2c2d30, { metal: 0.5, rough: 0.6 }),
    };
    const b = new Batch(), rr = K.rng(21), reds = [0xc9503e, 0xb53f35, 0xd8664c, 0xa8342e, 0xe07a52, 0x9a2f2c], lampPts = [];

    // a weirwood with a carved face looking toward heading `facing`
    const weirwood = (x, z, s, facing, heart = false) => {
      const y = H(x, z), R0 = 1.5 * s, th = (heart ? 11 : 10.5) * s;
      b.cyl(M.bark, x, y - 1.2, z, R0 * 1.9, 3.2 * s, { top: 0.58, seg: 12, color: 0xfffaf0 });
      b.cyl(M.bark, x, y, z, R0, th, { top: 0.6, seg: 12, color: 0xfffaf0 });
      for (let i = 0; i < (heart ? 9 : 6); i++) { const a = i * (heart ? 0.7 : 1.05) + rr() * 0.5, L = R0 * (heart ? 4.2 : 3), dy = -0.9; strut(b, M.bark, [x + Math.cos(a) * R0 * 0.5, y + 1.8 * s, z + Math.sin(a) * R0 * 0.5], [x + Math.cos(a) * R0 * 1.8, y + 0.6 * s, z + Math.sin(a) * R0 * 1.8], 0.7 * s, 0xfffaf0); strut(b, M.bark, [x + Math.cos(a) * R0 * 1.8, y + 0.6 * s, z + Math.sin(a) * R0 * 1.8], [x + Math.cos(a) * L, y + dy, z + Math.sin(a) * L], 0.42 * s, 0xf0e8da); }
      const tops = [], nl = heart ? 8 : 6;
      for (let i = 0; i < nl; i++) {
        const a = (i / nl) * TAU + rr() * 0.5, len = th * 0.44 * rr.range(0.8, 1.2), by = y + th * (0.58 + rr() * 0.28), cur = rr.range(-0.5, 0.5);
        const mid = [x + Math.cos(a) * len * 0.45, by + len * 0.5, z + Math.sin(a) * len * 0.45], end = [x + Math.cos(a + cur) * len, by + len * 0.95, z + Math.sin(a + cur) * len];
        strut(b, M.bark, [x, by, z], mid, 0.55 * s, 0xfffaf0); strut(b, M.bark, mid, end, 0.36 * s, 0xf0e8da);
        const tw = [end[0] + Math.cos(a + 0.8) * len * 0.35, end[1] + len * 0.25, end[2] + Math.sin(a + 0.8) * len * 0.35]; strut(b, M.bark, end, tw, 0.22 * s, 0xe8e0d0); tops.push(end, tw);
      }
      tops.push([x, y + th + 2.4 * s, z]);
      for (const [tx, ty, tz] of tops) for (let k = 0; k < (heart ? 5 : 4); k++) blob(b, M.leaf, tx + rr.range(-2.2, 2.2) * s, ty + rr.range(-1.4, 1.6) * s, tz + rr.range(-2.2, 2.2) * s, rr.range(1.3, 2.3) * s, rr.range(1.0, 1.6) * s, rr.range(1.3, 2.3) * s, jit(rr.pick(reds), rr, 0.015, 0.1, 0.05), rr() * 3, 6);
      // drooping leaf curtains
      for (let i = 0; i < (heart ? 14 : 6); i++) { const [tx, ty, tz] = tops[Math.floor(rr() * tops.length)]; blob(b, M.leaf, tx + rr.range(-2, 2) * s, ty - rr.range(2, 4) * s, tz + rr.range(-2, 2) * s, 0.6 * s, rr.range(1.0, 1.8) * s, 0.6 * s, jit(rr.pick(reds), rr, 0.015, 0.1, 0.06)); }
      // the face: recessed plate, slanted eyes weeping red sap, a long open mouth, brow ridge and nose
      const fh = th * (heart ? 0.36 : 0.34), rad = R0 * (1 - 0.4 * (fh / th)) + 0.02, ry = Math.atan2(Math.cos(facing), Math.sin(facing)), px = x + Math.cos(facing) * rad, pz = z + Math.sin(facing) * rad, tx = Math.cos(ry), tz = -Math.sin(ry);
      blob(b, M.bark, px, y + fh - R0 * 0.55, pz, R0 * 0.82, R0 * 2.1, R0 * 0.2, 0xa89c88, ry);                              // sunken, darker plate
      for (const sd of [-1, 1]) {
        const ex = px + tx * sd * R0 * 0.4, ez = pz + tz * sd * R0 * 0.4;
        blob(b, M.bark, ex, y + fh + R0 * 0.34, ez, R0 * 0.36, R0 * 0.1, R0 * 0.2, 0xe8dfcc, ry);                              // brow ridge
        blob(b, M.dark, ex + Math.cos(facing) * 0.05, y + fh, ez + Math.sin(facing) * 0.05, R0 * 0.3, R0 * 0.13, R0 * 0.2, 0xffffff, ry);   // eye socket
        b.box(M.sap, px + tx * sd * R0 * 0.44, y + fh - R0 * 1.4, pz + tz * sd * R0 * 0.44, R0 * 0.09, R0 * 1.4, R0 * 0.1, ry); b.box(M.sap, px + tx * sd * R0 * 0.44, y + fh - R0 * 1.9, pz + tz * sd * R0 * 0.44, R0 * 0.15, R0 * 0.18, R0 * 0.14, ry);
      }
      blob(b, M.bark, px + Math.cos(facing) * 0.06, y + fh - R0 * 0.55, pz + Math.sin(facing) * 0.06, R0 * 0.13, R0 * 0.5, R0 * 0.2, 0xf0e8d8, ry);   // nose
      blob(b, M.dark, px + Math.cos(facing) * R0 * 0.14, y + fh - R0 * 1.75, pz + Math.sin(facing) * R0 * 0.14, R0 * 0.28, R0 * 0.58, R0 * 0.2, 0xffffff, ry);  // open mouth
    };
    weirwood(0, 0, 2.3, 1.2, true);                                                           // the heart tree
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + 0.15, r = 34 + rr.range(-3, 4); weirwood(Math.cos(a) * r, Math.sin(a) * r, rr.range(0.95, 1.2), a + (i % 2 ? Math.PI : 0)); }
    for (let i = 0; i < 7; i++) { const a = rr() * TAU, r = rr.range(52, 66); weirwood(Math.cos(a) * r, Math.sin(a) * r, rr.range(0.8, 1.05), a + rr.range(-0.5, 0.5)); }
    // standing stones of the old pact, leaning, mossed, around a flat altar slab
    const pact = [-48, 22], py = H(pact[0], pact[1]);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU, h0 = 3.2 + rr() * 1.6, sx = pact[0] + Math.cos(a) * 6.5, sz = pact[1] + Math.sin(a) * 6.5; b.cyl(M.rock, sx, py - 0.4, sz, 0.95, h0, { top: 0.66, seg: 6, color: jit(0xb6b4a8, rr, 0.01, 0.04, 0.06) }); b.box(M.moss, sx, py + h0 * 0.4, sz, 1.5, 0.35, 1.5, rr() * 3, 0xffffff, rr.range(-0.1, 0.1)); b.cyl(M.moss, sx, py - 0.3, sz, 1.5, 0.7, { seg: 7, top: 0.85 }); }
    b.cyl(M.rock, pact[0], py - 0.3, pact[1], 2.5, 1.0, { seg: 7, top: 0.9, color: 0xc8c6ba }); b.cyl(M.moss, pact[0], py + 0.7, pact[1], 2.2, 0.12, { seg: 7 });
    // the pool's stone kerb
    for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU, ex = POOL[0] + Math.cos(a) * 10.2, ez = POOL[1] + Math.sin(a) * 8.0; b.box(M.rock, ex, H(ex, ez) - 0.5, ez, rr.range(1.2, 2.2), rr.range(0.6, 1.2), rr.range(1.0, 1.8), rr() * 3, jit(0xb0aea2, rr, 0.01, 0.04, 0.06)); }
    // green men's clearing: two thatched round huts, a hearth, drying frame, canoes
    const hut = (x, z, r, h, seed) => { const y = H(x, z), r2 = K.rng(seed); b.cyl(M.stone, x, y - 0.8, z, r + 0.3, 1.4, { seg: 10, color: 0xaaa89c }); b.cyl(M.hide, x, y, z, r, h, { seg: 10, color: 0xcab896 }); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; b.box(M.woodD, x + Math.cos(a) * (r + 0.05), y, z + Math.sin(a) * (r + 0.05), 0.26, h, 0.26, 0); }
      b.cone(M.thatch, x, y + h - 0.2, z, r + 1.1, h * 0.95 + 0.5, { seg: 10, color: jit(0xd6c088, r2, 0.01, 0.06, 0.05) }); b.cone(M.thatch, x, y + h + h * 0.7, z, (r + 1.1) * 0.35, h * 0.35, { seg: 10, color: 0xb8a068 });
      b.cyl(M.woodD, x, y + h * 1.9 - 0.2, z, 0.1, 1.8, { seg: 4 }); arch(b, M.win, x + r + 0.04, y, z, 0, 0.8, 1.7); };
    function arch(bb, mat, x, y, z, ry, w, h) { const g = new THREE.Shape(), rw = w / 2; g.moveTo(-rw, 0); g.lineTo(-rw, h - rw); g.absarc(0, h - rw, rw, Math.PI, 0, true); g.lineTo(rw, 0); g.closePath(); const gg = new THREE.ExtrudeGeometry(g, { depth: 0.12, bevelEnabled: false, curveSegments: 4 }); gg.rotateY(Math.PI / 2); _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(1, 1, 1)); bb.addGeometry(mat, gg, _m); }
    hut(34, -44, 3.2, 2.7, 1); hut(43, -50, 2.7, 2.4, 2);
    { const y = H(38, -38); b.cyl(M.rock, 38.5, y - 0.2, -37.5, 1.3, 0.35, { seg: 8, color: 0x6a645a }); b.cyl(M.dark, 38.5, y + 0.1, -37.5, 0.9, 0.12, { seg: 8 });
      for (const sd of [-1, 1]) { b.cyl(M.woodD, 30 + sd * 2.2, H(30, -36), -36, 0.12, 2.6, { seg: 4 }); } b.box(M.woodD, 30, H(30, -36) + 2.3, -36, 4.6, 0.12, 0.12);
      for (let i = 0; i < 2; i++) { const cx = 28 + i * 3, cz = -30 + i * 1.5, cy = H(cx, cz); strut(b, M.woodD, [cx - 2.2, cy + 0.2, cz], [cx + 2.2, cy + 0.2, cz + 0.5], 0.9, 0x6a5238, 0.5); } }
    // landing: a rough stone quay, flagstone path up to the grove, lantern posts
    K.pier(b, -4, 0.7, 92, { len: 16, w: 3, ry: -Math.PI / 2, mat: M.wood, color: 0xb09a78 });
    b.ribbon(M.flag, K.smoothPath([[-4, 96], [-5, 80], [-2, 62], [0, 48], [0, 34]], 5), 3.4, H, 0.16, 0xb8b2a0); b.ribbon(M.flag, K.smoothPath([[-4, 96], [-5, 80], [-2, 62], [0, 48], [0, 34]], 5), 4.6, H, 0.1, 0x6a5a44);
    for (const sx of [-1, 1]) { const x = -4 + sx * 2.2, z = 90, y = 0.7; b.cyl(M.woodD, x, y, z, 0.12, 2.8, { seg: 5 }); b.box(M.lamp, x, y + 2.8, z, 0.34, 0.5, 0.34); b.box(M.iron, x, y + 3.3, z, 0.5, 0.1, 0.5); lampPts.push([x, y + 3, z]); }
    for (const [x, z] of [[-2, 56], [2, 66]]) { const y = H(x, z); b.cyl(M.woodD, x + 2.4, y, z, 0.1, 2.2, { seg: 5 }); b.box(M.lamp, x + 2.4, y + 2.2, z, 0.3, 0.45, 0.3); lampPts.push([x + 2.4, y + 2.4, z]); }
    // far-shore silhouette of Harrenhal (five melted towers) — a hint only: stepped shafts, lumpy slumped crowns
    { const fx = 60, fz = -440, dk = flat(0xffffff, { rough: 1, flatShading: false }), rf = K.rng(5);
      for (let i = 0; i < 5; i++) { const x = fx - 54 + i * 27, z = fz + (i % 2) * 14, y = H(x, z), h = 62 + (i === 2 ? 22 : 0) - (i % 3) * 6, k = 0x3a3b40; b.cyl(dk, x, y - 3, z, 10.5, h + 3, { top: 0.78, seg: 10, color: k }); b.cyl(dk, x, y + h - 2, z, 10, 7, { top: 1.3, seg: 10, color: 0x2e2f34 });
        for (let j = 0; j < 7; j++) { const a = (j / 7) * TAU; blob(b, dk, x + Math.cos(a) * 8.5, y + h + 4 - rf() * 3, z + Math.sin(a) * 8.5, 4.2, 3.4, 4.2, 0x323338); } blob(b, dk, x + (i - 2) * 1.2, y + h + 7, z, 9, 4.5, 9, 0x2b2c30); b.cyl(dk, x + 9, y + h * 0.4, z + 6, 2, h * 0.6, { top: 0.4, seg: 5, color: 0x2e2f34 }); }
      b.box(dk, fx, H(fx, fz) - 3, fz + 20, 150, 34, 10, 0, 0x34353a); for (let i = -6; i <= 6; i++) b.box(dk, fx + i * 11, H(fx, fz) + 28, fz + 20, 5, 4, 10, 0, 0x34353a); }
    root.add(b.build({}));

    // boulders on the shore, ferns and undergrowth, fallen-leaf carpet, dark oaks and old ironwoods
    { const bo = new Inst(GG.sphere(6), M.rock), sr = K.rng(8); let n = 0;
      for (let i = 0; i < 1200 && n < q.dens(90); i++) { const a = sr() * TAU, r = sr.range(64, 104), x = Math.cos(a) * r, z = Math.sin(a) * r, h = H(x, z); if (h < -0.9 || h > 0.9) continue; n++; const s = sr.range(0.8, 2.6); bo.add(x, h - s * 0.4, z, s * 1.3, s * 0.8, s, sr() * 3, jit(0x9a988c, sr, 0.01, 0.05, 0.08)); }
      root.add(bo.build()); }
    { const fern = new Inst(GG.cone(5), M.leafG, { cast: false }), lit = new Inst(GG.box(), flat(0xffffff, { rough: 1 }), { cast: false }), fr = K.rng(15);
      for (let i = 0; i < q.dens(380); i++) { const a = fr() * TAU, r = fr.range(8, 88), x = Math.cos(a) * r, z = Math.sin(a) * r, h = H(x, z); if (h < 1.1) continue; const s = fr.range(0.8, 1.7); for (let k = 0; k < 3; k++) fern.add(x, h - 0.1, z, 0.5 * s, 1.1 * s, 0.9 * s, fr() * 6 + k * 1.05, jit(0x4f7a3a, fr, 0.03, 0.1, 0.06)); }
      for (let i = 0; i < q.dens(900); i++) { const a = fr() * TAU, r = fr.range(4, 78), x = Math.cos(a) * r, z = Math.sin(a) * r, h = H(x, z); if (h < 1.2) continue; lit.add(x, h + 0.03, z, fr.range(0.5, 1.3), 0.04, fr.range(0.4, 1.0), fr() * 6, jit(fr.pick(reds), fr, 0.015, 0.1, 0.08)); }
      root.add(fern.build(), lit.build()); }
    function broadleaf({ rng, count, bounds, avoid, scale = [1, 1.5], minDist = 6, greens }) {
      const pts = K.scatter({ rng, count, bounds, minDist, avoid }), grp = new THREE.Group();
      const trunk = new Inst(GG.cyl(6, 0.62), M.woodD), Aa = new Inst(GG.sphere(7), M.leafG), Bb = new Inst(GG.sphere(7), M.leafG), Cc = new Inst(GG.sphere(7), M.leafG);
      for (const [x, z] of pts) {
        const k = rng.range(scale[0], scale[1]), y = H(x, z), a = rng() * 6;
        trunk.add(x, y - 0.3, z, 0.55 * k, 3.9 * k, 0.55 * k, a, jit(0x4a3a2c, rng, 0.01, 0.05, 0.05));
        Aa.add(x, y + 2.7 * k, z, 2.9 * k, 2.5 * k, 2.9 * k, a, jit(rng.pick(greens), rng, 0.02, 0.1, 0.05));
        Bb.add(x + Math.cos(a) * 1.5 * k, y + 3.6 * k, z + Math.sin(a) * 1.5 * k, 2.1 * k, 1.9 * k, 2.1 * k, a, jit(rng.pick(greens), rng, 0.02, 0.1, 0.06));
        Cc.add(x - Math.cos(a) * 1.3 * k, y + 3.2 * k, z - Math.sin(a) * 1.3 * k, 1.8 * k, 1.6 * k, 1.8 * k, a, jit(rng.pick(greens), rng, 0.02, 0.1, 0.07));
      }
      for (const i of [trunk, Aa, Bb, Cc]) if (i.items.length) grp.add(i.build());
      return grp;
    }
    root.add(broadleaf({ rng: K.rng(31), count: q.dens(70), bounds: [-90, -90, 90, 90], greens: [0x3f5e34, 0x4a6b38, 0x365230], scale: [0.8, 1.3], avoid: (x, z) => Math.hypot(x, z) > 84 || Math.hypot(x, z) < 22 || H(x, z) < 1.4 || Math.hypot(x - POOL[0], z - POOL[1]) < 14 || Math.hypot(x + 4, z - 70) < 8 || Math.hypot(x - 38, z + 46) < 15, minDist: 6 }));
    root.add(K.forest({ rng: K.rng(32), count: q.dens(260), bounds: [-460, -460, 460, 240], heightAt, species: 'pine', tint: 0x2c4a35, avoid: (x, z) => Math.hypot(x, z) < 240 || H(x, z) < 2, scale: [1.5, 2.5], minDist: 9 }));
    root.add(broadleaf({ rng: K.rng(33), count: q.dens(160), bounds: [-460, -460, 460, 460], greens: [0x6a7a3a, 0x8a6a34, 0x7a8a3c, 0x5a7038, 0x9a5a30], scale: [1.4, 2.4], avoid: (x, z) => Math.hypot(x, z) < 250 || H(x, z) < 6 || H(x, z) > 40, minDist: 9 }));
    // dark pool beneath the heart tree
    const pool = K.waterPatch({ w: 24, d: 20, level: POOL_LEVEL, center: POOL, depth: 3, deep: 0x07100f, shallow: 0x1b302c, opacity: 0.97, speed: 0.15, choppy: 0.1 }); root.add(pool); ctx.registerWater(pool);

    // night dimming for self-lit sprites (smoke, clouds): glow materials expose the host's night level
    const nightProbe = glow(0xffffff, 1), dimmers = [], night = () => K.clamp((nightProbe.color.r - 0.14) / 1.25, 0, 1);
    const dimmed = (col, k = 0.8) => { const base = col.clone(); dimmers.push((n) => col.copy(base).multiplyScalar(1 - k * n)); };
    const smoke = (...a) => { const p = K.smoke(...a); dimmed(p.material.uniforms.uColor.value); return p; }, cloudsD = (...a) => { const g = K.clouds(...a); dimmed(g.children[0].material.color); return g; };
    ctx.onUpdate(() => { const n = night(); for (const f of dimmers) f(n); });
    // ---- life: drifting red leaves, mist banks, doves, a rowing boat, hearth smoke ----------------------------------------------------
    const NL = q.dens(150), lg = new THREE.PlaneGeometry(0.9, 0.55), lm_ = new THREE.InstancedMesh(lg, new THREE.MeshBasicMaterial({ color: 0xc04a36, side: THREE.DoubleSide, fog: true }), NL), ld = [], oo = new THREE.Object3D(), lc = new THREE.Color();
    for (let i = 0; i < NL; i++) { ld.push({ x: rr.range(-70, 70), y: rr.range(0, 38), z: rr.range(-70, 70), v: rr.range(0.9, 1.8), ph: rr() * 6, s: rr.range(0.8, 1.5) }); lm_.setColorAt(i, lc.set(rr.pick(reds))); }
    lm_.frustumCulled = false; root.add(lm_); dimmed(lm_.material.color, 0.65);
    ctx.onUpdate((dt, t) => { for (let i = 0; i < NL; i++) { const d = ld[i]; d.y -= d.v * dt; d.x += dt * 0.6; if (d.y < H(d.x, d.z) + 0.1) { d.y = 30 + rr() * 8; d.x = rr.range(-70, 70); d.z = rr.range(-70, 70); } oo.position.set(d.x + Math.sin(t * 0.7 + d.ph) * 3, d.y, d.z + Math.cos(t * 0.5 + d.ph) * 3); oo.rotation.set(t * 1.3 + d.ph, t * 0.9 + d.ph * 2, t * 1.7 + d.ph); oo.scale.setScalar(d.s); oo.updateMatrix(); lm_.setMatrixAt(i, oo.matrix); } lm_.instanceMatrix.needsUpdate = true; });
    const mist = []; for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU + rr() * 0.2, r = rr.range(96, 170); mist.push([Math.cos(a) * r, 0.8, Math.sin(a) * r]); }
    root.add(smoke(mist, { color: 0xeae6e2, size: 100, rise: 9, opacity: 0.2, perStack: 6, spread: 6 }));
    const grove = []; for (let i = 0; i < 10; i++) { const a = rr() * TAU, r = rr.range(10, 70); grove.push([Math.cos(a) * r, H(Math.cos(a) * r, Math.sin(a) * r) + 0.8, Math.sin(a) * r]); }
    root.add(smoke(grove, { color: 0xe4ece8, size: 46, rise: 4, opacity: 0.1, perStack: 4, spread: 4 }));
    root.add(smoke([[38, 6, -46], [44, 5, -52], [38.5, H(38, -38) + 1, -37.5]], { size: 14, rise: 12, opacity: 0.3, color: 0xcfcac4 }));
    const fire = K.fires([[38.5, H(38, -38) + 0.9, -37.5], ...lampPts], { size: 5, light: q.low ? 0 : 3, intensity: 40 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const doves = K.birds({ center: [0, 38, 0], radius: 55, count: q.dens(7), color: 0xe9e5dc, size: 0.9, spreadY: 6, seed: 4, speed: 0.07 }); root.add(doves); ctx.onUpdate((dt, t) => doves.userData.update(t));
    const hullW = tri('wood', { color: 0xcaa888, scale: 3, snow: false, side: THREE.DoubleSide });
    const boat = makeShip(hullW, 'barge', 8, 0x5a4634, 0xd0c8b0, 3); boat.position.set(-4, 0.2, 130); root.add(boat);
    ctx.onUpdate((dt, t) => { boat.position.set(-6 + Math.sin(t * 0.05) * 20, 0.2, 130 + Math.cos(t * 0.04) * 15); boat.rotation.y = 1.57 + Math.sin(t * 0.05) * 0.3; animSails(boat, t, 1); boat.position.y = 0.2; });
    // a far fishing skiff
    const skiff = makeShip(hullW, 'cog', 9, 0x4a3a2c, 0xbcb4a0, 4); root.add(skiff); ctx.onUpdate((dt, t) => { skiff.position.set(-200 + ((t * 2.4) % 260) , 0.2, -250 + Math.sin(t * 0.03) * 20); skiff.rotation.y = 0; animSails(skiff, t, 3); skiff.position.y = 0.2; });
    root.add(cloudsD({ y: 260, extent: 700, count: 8, opacity: 0.3, color: 0xe8e8e6 }));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 230, center: [0, 0, 0], minDistance: 12,
      hero: { pos: [78, 36, 100], target: [0, 15, 0] },
      climate: {
        atmos: 'dawn', weather: 'fog',
        tint: {
          dawn: { top: 0x6a76a4, horizon: 0xd8b0a8, fog: 0xc2aaa8, fogD: 0.00085, sunC: 0xffc896, sunI: 2.2, water: 0.55, hemiSky: 0xb0b4d4, hemiGround: 0x5a4640, hemiI: 0.85 },
          day: { top: 0x5a7ab0, horizon: 0xd8dcd8, fog: 0xcdd6d4, fogD: 0.0008, sunC: 0xfff0d8, sunI: 2.6, water: 0.7, hemiSky: 0xb4c6d8, hemiGround: 0x6a5e48, hemiI: 0.9 },
          dusk: { top: 0x3a4478, horizon: 0xe49a78, fog: 0xc8a09a, fogD: 0.00105, sunC: 0xff9a58, sunI: 2.3, water: 0.5, hemiSky: 0x8a90c4, hemiGround: 0x4a3c3c, hemiI: 0.7 },
          night: { top: 0x0a1230, horizon: 0x2c3c64, fog: 0x1e2c48, fogD: 0.0014, sunC: 0xa6bcf0, sunI: 1.25, hemiSky: 0x6a7eb8, hemiGround: 0x2c3042, hemiI: 1.1 },
        },
      },
      landmarks: {
        'heart-tree': { ...lm(0, 0, 18, 30), cam: { pos: [9, H(9, 22) + 11, 23], target: [0.4, H(0, 0) + 9.5, 1.2] } }, 'ring-of-faces': { ...lm(30, 20, 28, 14), cam: { pos: [58, 11, 22], target: [30, 8, 8] } }, 'pact-stones': lm(pact[0], pact[1], 11, 7), 'green-men': { ...lm(38, -47, 12, 8), cam: { pos: [60, 12, -26], target: [38, 4, -46] } },
        'landing': lm(-4, 100, 12, 5), 'red-leaves': lm(-34, -30, 22, 16), 'dark-pool': lm(14, -10, 8, 3), 'far-shore': lm(60, -420, 60, 90), 'god-s-eye': lm(-120, 140, 50, 3),
      },
    };
  },
};
