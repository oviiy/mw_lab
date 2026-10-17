// Hardhome — abandoned Free Folk harbour on the cold coast. Sparse in the books: restrained, atmospheric, almost everything is interpretation.
// Anchors (low confidence): a sheltered harbour, a ruined wooden town with a palisade and hall, wrecked ships, weirwoods nearby, bitter cold.
//
// Visual language: nothing is warm here. Bleached grey timbers, black shingle, slate water with a rim of ice, snow-heavy pines, sagging
// turf roofs with drifts, a few pale weirwoods with red leaf on the slope above the town. No lights burn at night (the place is empty).
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G: GG, tri, flat, glow } = K;

const TAU = Math.PI * 2;
const shoreX = (z) => -25 + 0.0042 * z * z; // crescent bay opening east
const jit = (hex, r, dh = 0.012, ds = 0.05, dl = 0.03) => new THREE.Color(hex).offsetHSL((r() - 0.5) * 2 * dh, (r() - 0.5) * 2 * ds, (r() - 0.5) * 2 * dl);
const tint = (r, v = 0.12, w = 0.04) => { const k = 1 - v * r(); return new THREE.Color(k * (1 - w * r()), k, k * (1 + w * 0.3)); };
const _up = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _d = new THREE.Vector3(), _e = new THREE.Euler();
function strut(b, mat, p, q, w, color = 0xffffff, d = w) {
  _d.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); const len = _d.length(); if (len < 1e-3) return;
  _q.setFromUnitVectors(_up, _d.multiplyScalar(1 / len)); _m.compose(_p.set(p[0], p[1], p[2]), _q, _s.set(w, len, d));
  b.addGeometry(mat, GG.box(), _m, color);
}
function blob(b, mat, cx, cy, cz, rx, ry_, rz, color = 0xffffff, rot = 0, seg = 8) {
  _m.compose(_p.set(cx, cy - ry_, cz), _q.setFromEuler(_e.set(0, rot, 0)), _s.set(rx, ry_, rz)); b.addGeometry(mat, GG.sphere(seg), _m, color);
}

export default {
  build(ctx) {
    const q = ctx.q, rng = K.rng(61), root = ctx.root;
    const heightAt = (x, z) => {
      const d = shoreX(z) - x; // >0 on land
      let h = d > 0 ? Math.min(d * 0.1, 1.4) + Math.max(0, d - 14) * 0.1 : d * 0.22 - 0.6 * K.smoothstep(0, 40, -d);
      h += (K.fbm(x * 0.03, z * 0.03, 3, 5) - 0.5) * 3 * K.smoothstep(10, 60, d);
      h += K.smoothstep(60, 280, d) * (28 + K.fbm(x * 0.01, z * 0.01, 3, 9) * 70) + K.smoothstep(95, 150, Math.abs(z)) * (d > -30 ? 34 + K.fbm(x * 0.04, z * 0.04, 2, 3) * 18 : 0) * K.smoothstep(-30, 6, d);
      if (d > -4 && d < 12 && Math.abs(z) < 90) h = K.lerp(h, 1.1, 0.6);
      return h;
    };
    const H = heightAt;
    const shingle = new THREE.Color(0x6e706c), shingleD = new THREE.Color(0x3c4046), tundra = new THREE.Color(0x7c7a62), snow = new THREE.Color(0xe6edf2), snowB = new THREE.Color(0xc4d2de), cliff = new THREE.Color(0x4a4d54), c = new THREE.Color();
    root.add(K.terrain({ size: 1300, seg: q.seg(210), heightAt, kind: 'rock', scale: 12, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.08, z * 0.08, 3, 3), n2 = K.noise2(x * 0.1, z * 0.1);
      c.copy(shingle).lerp(shingleD, K.smoothstep(0.45, 0.7, n) * 0.6);
      if (h < 0.5) c.lerp(shingleD, K.smoothstep(0.5, -0.3, h) * 0.8);
      else if (h < 2.4 && Math.abs(z) < 95) c.lerp(tundra, K.clamp(n2 * 0.9 - 0.05, 0, 0.55));
      const sc = K.clamp(h * 0.12 - 0.1 + n2 * 0.25, 0, 0.92) * (h > 1.7 ? 1 : 0.4);
      c.lerp(n > 0.5 ? snowB : snow, sc);
      c.lerp(cliff, K.clamp(s * 3.2 - 0.05, 0, 0.88)); return c;
    } }));
    const wat = K.water({ w: 800, d: 800, seg: q.seg(190), level: 0, center: [330, 0], heightAt, deep: 0x0f2128, shallow: 0x36535c, opacity: 0.93, choppy: 0.6, speed: 0.45, foam: 0xdbe8ee }); root.add(wat); ctx.registerWater(wat);

    const T = (k, color, scale = 6, o = {}) => tri(k, { color, scale, ...o });
    const M = {
      wood: T('wood', 0xb8b4aa, 4, { rough: 0.95 }), woodB: T('wood', 0x504a42, 4, { snow: false }), woodW: T('wood', 0x9a9488, 4), turf: T('grass', 0x8a8466, 5, { rough: 1 }), stone: T('stone', 0xb4b8b8, 6), rock: T('rock', 0xa4a8a8, 8),
      leaf: T('grass', 0xffffff, 3, { rough: 1, snow: false }), bark: T('plaster', 0xf0ece0, 4, { snow: false }), barkD: T('stone', 0x8a8274, 5, { snow: false }), pineB: T('wood', 0x5a4a3c, 3, { snow: false }), needle: T('grass', 0xffffff, 3, { rough: 1, snow: false, bump: 0.6 }),
      snowM: T('snow', 0xf4f8fc, 5, { snow: false, bump: 0.3, rough: 0.9 }), dark: flat(0x0e0f12, { rough: 1 }), sap: flat(0x7a1511, { rough: 0.5, flatShading: false }), ice: flat(0xdbe8ee, { rough: 0.3, metal: 0.02, flatShading: true, emissive: 0x2a4a68 }),
    };
    const b = new Batch();
    const nightProbe = glow(0xffffff, 1), dimmers = [], night = () => K.clamp((nightProbe.color.r - 0.14) / 1.25, 0, 1);
    const dimmed = (col, k = 0.8) => { const base = col.clone(); dimmers.push((n) => col.copy(base).multiplyScalar(1 - k * n)); };
    const dimSmoke = (p) => { dimmed(p.material.uniforms.uColor.value); return p; }, dimClouds = (g) => { dimmed(g.children[0].material.color); return g; };
    const drift = (x, y, z, rx, ry_, rz, rot = 0) => blob(b, M.snowM, x, y, z, rx, ry_, rz, 0xffffff, rot, 7);

    // ---- ruined hall: log footing, A-frame rafters with collar ties, a slumped sod roof section, standing gable wall, cold hearth
    { const hx = -40, hz = -4, y = H(hx, hz), R = K.rng(7);
      for (const sd of [-1, 1]) b.box(M.stone, hx, y - 0.9, hz + sd * 5.5, 23, 1.0, 0.9, 0.04, 0xb8bcbc); for (const sd of [-1, 1]) b.box(M.stone, hx + sd * 11.2, y - 0.9, hz, 0.9, 1.0, 11.6, 0.04, 0xb8bcbc);
      for (let i = -5; i <= 5; i++) { if (i % 3 === 0) continue; for (const sd of [-1, 1]) { const hh = R.range(1.6, 5.2); b.box(M.woodB, hx + i * 1.9, y, hz + sd * 5.2, 0.55, hh, 0.55, 0.04, tint(R, 0.3)); b.box(M.woodW, hx + i * 1.9, y + hh - 0.1, hz + sd * 5.2, 0.7, 0.25, 0.7, 0.04); } }
      for (let i = -4; i <= 3; i++) { if (R() < 0.25) continue; const x = hx + i * 3.4, hh = R.range(5.6, 7.4); strut(b, M.woodB, [x, y + 2.4, hz - 3.2], [x + R.range(-0.4, 0.4), y + hh + 1.2, hz + R.range(-0.2, 0.2)], 0.42, 0x4a443c); if (R() < 0.8) strut(b, M.woodB, [x, y + 2.2, hz + 3.2], [x, y + hh + 1.2, hz], 0.42, 0x4a443c); if (i % 2) strut(b, M.woodB, [x, y + hh - 1.2, hz - 1.6], [x, y + hh - 1.2, hz + 1.6], 0.3, 0x4a443c); }
      strut(b, M.woodB, [hx - 9, y + 8.6, hz], [hx + 7, y + 8.8, hz + 0.2], 0.42, 0x4a443c);                    // ridge pole fragment
      b.box(M.turf, hx + 7.5, y + 3.0, hz - 3.6, 7.6, 0.7, 4.8, 0.04, 0x8a8466, -0.5, 0.0); drift(hx + 7.6, y + 3.7, hz - 3.6, 4.2, 0.55, 2.6);        // fallen roof panel under snow
      b.box(M.woodW, hx - 11, y, hz, 1.2, 9, 10.5, 0.04, 0xc8c4b8); for (let i = 0; i < 6; i++) b.box(M.woodB, hx - 11.65, y + 1.4 + i * 1.3, hz, 0.12, 0.35, 10.2, 0.04, 0x4a443c);   // gable wall of horizontal logs
      b.box(M.dark, hx - 11.7, y, hz + 1.2, 0.2, 3.4, 2.2, 0.04);                                                // doorway
      for (let i = 0; i < 6; i++) b.box(M.stone, hx - 4 + Math.cos(i * 1.05) * 1.6, y - 0.4, hz + Math.sin(i * 1.05) * 1.1, 0.9, 0.7, 0.8, R() * 3);  // cold hearth ring
      for (let i = 0; i < 10; i++) b.box(M.woodB, hx + R.range(-10, 10), y - 0.2, hz + R.range(-5, 5), R.range(1.2, 4), 0.4, 0.4, R() * 3, tint(R, 0.3), 0, R.range(-0.3, 0.3));
      drift(hx - 2, y + 0.5, hz + 2, 6, 0.7, 3.2); drift(hx + 4, y + 0.5, hz - 2, 4, 0.6, 2.2); drift(hx - 10, y + 0.4, hz + 6.5, 4.5, 1.4, 1.8);
    }
    // ---- huts: three sagging turf-roofed longhouses and a scatter of collapsed ones, all drifted
    const hut = (x, z, w, d, ry, state) => { const y = H(x, z), R = K.rng(Math.round(x * 7 + z * 3)), cs = Math.cos(ry), sn = Math.sin(ry);
      b.box(M.stone, x, y - 0.8, z, w + 0.4, 1.0, d + 0.4, ry, 0xaeb2b2);
      if (state === 'roof') {
        b.box(M.woodW, x, y, z, w, 2.2, d, ry, tint(R, 0.2));
        b.prism(M.turf, x, y + 2.1, z, w + 1.2, 2.6, d + 1.0, ry, jit(0x8a8466, R, 0.01, 0.05, 0.04)); drift(x, y + 3.9, z, w * 0.58, 0.6, d * 0.52, ry); strut(b, M.woodB, [x - cs * w * 0.5, y + 4.8, z + sn * w * 0.5], [x + cs * w * 0.5, y + 4.6, z - sn * w * 0.5], 0.3, 0x3a342c);
        arch(x + sn * 0 + (-cs) * 0, y, z, ry, w, d);
      } else {
        b.box(M.woodW, x, y - 0.5, z, w, 1.1, d, ry, tint(R, 0.2)); b.prism(M.woodB, x + 0.6, y + 0.4, z, w * 0.8, 1.2, d * 0.6, ry + 0.2, 0x4a443c, 0, 0); b.box(M.woodB, x - 0.8, y + 1.2, z + 0.4, w * 0.6, 0.4, 0.4, ry + 0.5, 0x4a443c, R.range(-0.4, 0.4), R.range(-0.5, 0.5)); drift(x, y + 0.6, z, w * 0.55, 0.5, d * 0.5, ry);
      } };
    function arch(x, y, z, ry, w, d) { const cs = Math.cos(ry), sn = Math.sin(ry), dx = x - sn * 0 + (d / 2 + 0.05) * sn, dz = z + (d / 2 + 0.05) * cs; b.box(M.dark, dx, y, dz, 1.2, 1.9, 0.14, ry); }
    hut(-58, 22, 11, 6, 0.1, 'roof'); hut(-66, -34, 9, 5.5, -0.2, 'roof'); hut(-54, 48, 8, 5, 0.3, 'roof');
    for (let i = 0; i < 9; i++) { const x = -58 + rng.range(-8, 18), z = rng.range(-62, 62); if (Math.abs(z + 4) < 14 && x > -56) continue; if (Math.hypot(x + 58, z - 22) < 10 || Math.hypot(x + 66, z + 34) < 8 || Math.hypot(x + 54, z - 48) < 8) continue; hut(x, z, rng.range(4, 7), rng.range(4, 7), rng() * 3, 'ruin'); }
    // ---- jetty: bleached piles with a few surviving planks and a snapped end, mooring posts, an overturned boat
    { const jx = shoreX(8) - 2, jz = 8, jy = 0.9, R = K.rng(9);
      for (let i = 0; i < 12; i++) for (const s of [-1, 1]) if (R() > 0.15) b.cyl(M.woodW, jx + i * 2.6, -2.8, jz + s * 1.6, 0.34, R.range(3.4, 5.0), { seg: 6, color: tint(R, 0.2) });
      for (let i = 0; i < 12; i++) if (R() > 0.4) { b.box(M.wood, jx + i * 2.6, jy, jz, 2.4, 0.22, 4, 0, tint(R, 0.25)); if (R() < 0.5) b.box(M.woodB, jx + i * 2.6 + 0.4, jy + 0.22, jz + R.range(-1.2, 1.2), 1.4, 0.12, 0.3, R() * 0.5); }
      for (let i = 0; i < 12; i += 3) b.box(M.woodW, jx + i * 2.6, jy - 0.5, jz, 0.3, 0.3, 4.2, 0, 0x7a7466);
      b.cyl(M.woodB, jx + 8, jy, jz + 2.2, 0.2, 1.7, { seg: 5 }); b.cyl(M.woodB, jx + 14, jy, jz - 2, 0.2, 1.5, { seg: 5, color: 0x4a443c });
      strut(b, M.woodW, [jx + 17, 1.0, jz - 3.2], [jx + 20.2, 1.15, jz - 3.8], 0.9, 0xa8a498, 0.5); drift(jx + 18.6, 1.6, jz - 3.5, 2, 0.4, 0.8, 0.3);
    }
    // ---- rotting hulls on the beach: keel, stem and stern posts, curved ribs, a few planks, snow in the bilge
    const hull = (x, z, len, ry, lean, mast = false) => { const y = H(x, z), R = K.rng(Math.round(len * 13 + x)), c = Math.cos(ry), s = Math.sin(ry), L = (u, v) => [x + c * u + s * v, z - s * u + c * v];
      const keel = [L(-len / 2, 0), L(len / 2, 0)]; strut(b, M.woodW, [keel[0][0], y + 0.5, keel[0][1]], [keel[1][0], y + 0.5 + lean * len * 0.3, keel[1][1]], 0.6, 0x6a6458, 0.6);
      const N = 9, beam = len * 0.2;
      for (let i = 0; i <= N; i++) { if (R() < 0.15 && i > 1 && i < N - 1) continue; const u = (i / N - 0.5) * len, k = Math.sqrt(Math.max(0, 1 - Math.pow((i / N - 0.5) * 2, 2) * 0.9)), top = 2.4 * k + 0.4 + (Math.abs(i / N - 0.5) * 2) * 1.3; for (const sd of [-1, 1]) { let prev = null; for (let j = 0; j <= 4; j++) { const f = j / 4, v = sd * beam * k * Math.sin(f * Math.PI / 2), yy = 0.5 + top * (1 - Math.cos(f * Math.PI / 2)) * (R() < 0.12 && j === 4 ? 0.5 : 1), P = L(u, v); const pt = [P[0], y + yy + 0.3, P[1]]; if (prev) strut(b, M.woodW, prev, pt, 0.42, jit(0x8c8678, R, 0.01, 0.04, 0.06), 0.3); prev = pt; } } }
      for (let i = 0; i < 6; i++) { const u = R.range(-len / 2.5, len / 2.5), sd = R() < 0.5 ? -1 : 1, P = L(u, sd * beam * 0.6 * R.range(0.7, 1)); b.box(M.wood, P[0], y + R.range(0.4, 1.8), P[1], R.range(2, 3.6), 0.2, 0.7, ry + R.range(-0.2, 0.2), tint(R, 0.2), 0, sd * R.range(0.4, 0.9)); }
      { const P = L(len / 2, 0); strut(b, M.woodB, [P[0], y + 0.4, P[1]], [P[0] + c * 0.8, y + 4.2, P[1] - s * 0.8], 0.5, 0x403a34); const Q = L(-len / 2, 0); strut(b, M.woodB, [Q[0], y + 0.4, Q[1]], [Q[0] - c * 0.6, y + 3.2, Q[1] + s * 0.6], 0.5, 0x403a34); }
      if (mast) { const P = L(len * 0.1, 0); strut(b, M.woodW, [P[0], y + 1, P[1]], [P[0] + 0.7, y + 6.2, P[1] + 0.3], 0.5, 0x8a8478); }
      const P = L(0, 0); drift(P[0], y + 0.9, P[1], len * 0.34, 0.45, beam * 0.7, ry); };
    hull(shoreX(-30) - 6, -30, 15, 0.5, 0.06, true); hull(shoreX(34) - 7, 34, 12, -0.3, -0.05); hull(shoreX(-62) - 5, -62, 10, 0.9, 0.04);
    // ---- palisade: leaning, pointed stakes along an arc, with gaps, a gate frame and rails
    { const arc = K.smoothPath([[-62, -78], [-54, -40], [-50, -8], [-52, 28], [-60, 66]], 8), R = K.rng(11);
      for (let i = 0; i < arc.length - 1; i++) { const [x0, z0] = arc[i], [x1, z1] = arc[i + 1]; for (let k = 0; k < 4; k++) { if (K.noise2(i * 0.3 + k, 4) < 0.28) continue; const t = k / 4, x = K.lerp(x0, x1, t) + R.range(-0.3, 0.3), z = K.lerp(z0, z1, t), hgt = R.range(2.4, 5.4), lx = R.range(-0.3, 0.3), lz2 = R.range(-0.3, 0.3), col = jit(R.pick([0x6a645a, 0x57514a, 0x7c7466]), R, 0.01, 0.04, 0.05), base = H(x, z) - 0.3;
        strut(b, M.woodW, [x, base, z], [x + lx, base + hgt, z + lz2], 0.42, col, 0.42); b.pyramid(M.woodW, x + lx, base + hgt, z + lz2, 0.42, 0.7, 0.42, 0, col); } }
      for (const dz of [-8.5, -1.5]) { const [x, z] = [-50.5, dz], y = H(x, z); b.cyl(M.woodW, x, y - 0.3, z, 0.4, 6.4, { seg: 6, color: 0x6a645a }); } { const y = H(-50.5, -5); b.box(M.woodW, -50.5, y + 5.6, -5, 0.5, 0.5, 7.4, 0, 0x5a544c); }
      for (let i = 0; i < arc.length - 2; i += 3) { const [x0, z0] = arc[i], [x1, z1] = arc[i + 3] || arc[arc.length - 1]; strut(b, M.woodB, [x0 + 0.5, H(x0, z0) + 1.8, z0], [x1 + 0.5, H(x1, z1) + 1.8, z1], 0.2, 0x4a443c, 0.3); } }
    // driftwood and beach boulders
    { const R = K.rng(12); for (let i = 0; i < 36; i++) { const z = R.range(-150, 150), x = shoreX(z) - R.range(-1, 8), y = Math.max(H(x, z), 0); if (x > shoreX(z) + 3) continue; strut(b, M.woodW, [x, y + 0.1, z], [x + R.range(-3, 3), y + R.range(0.1, 0.7), z + R.range(-1.5, 1.5)], R.range(0.25, 0.5), tint(R, 0.2)); } }
    root.add(b.build({}));
    { const bo = new Inst(GG.sphere(6), M.rock), R = K.rng(13); let n = 0; for (let i = 0; i < 900 && n < q.dens(120); i++) { const z = R.range(-200, 200), x = shoreX(z) + R.range(-14, 4), h = H(x, z); if (h < -0.8) continue; n++; const s = R.range(0.6, 2.4); bo.add(x, h - s * 0.35, z, s * 1.3, s * 0.8, s, R() * 3, jit(0xc0c4c6, R, 0.01, 0.04, 0.08)); } root.add(bo.build()); }

    // ---- weirwood grove on the slope: pale boles, thin red crowns, one carved face (restrained)
    { const gb = new Batch(), gp = [[-100, -20], [-84, -34], [-70, -18], [-72, 8], [-92, 14], [-106, 0]], pts = K.scatter({ rng: K.rng(4), count: 7, bounds: [-108, -36, -68, 16], poly: gp, minDist: 8 }), R = K.rng(14), reds = [0xc04a38, 0xa8382f, 0xd0604a];
      pts.forEach(([x, z], i) => { const y = H(x, z), s = R.range(1.0, 1.3), R0 = 1.3 * s, th = 10.5 * s;
        gb.cyl(M.bark, x, y - 0.6, z, R0 * 1.6, 2.2 * s, { top: 0.6, seg: 10 }); gb.cyl(M.bark, x, y, z, R0, th, { top: 0.62, seg: 10 });
        for (let j = 0; j < 5; j++) { const a = (j / 5) * TAU + R() * 0.5, len = th * 0.44 * R.range(0.8, 1.2), by = y + th * (0.58 + R() * 0.28), mid = [x + Math.cos(a) * len * 0.45, by + len * 0.5, z + Math.sin(a) * len * 0.45], end = [x + Math.cos(a) * len, by + len * 0.9, z + Math.sin(a) * len]; strut(gb, M.bark, [x, by, z], mid, 0.42 * s); strut(gb, M.bark, mid, end, 0.28 * s); for (let k = 0; k < 3; k++) blob(gb, M.leaf, end[0] + R.range(-1.8, 1.8) * s, end[1] + R.range(-0.8, 1.2) * s, end[2] + R.range(-1.8, 1.8) * s, R.range(1.2, 1.9) * s, R.range(0.9, 1.4) * s, R.range(1.2, 1.9) * s, jit(R.pick(reds), R, 0.015, 0.1, 0.05)); }
        blob(gb, M.leaf, x, y + th + 1.4 * s, z, 1.9 * s, 1.3 * s, 1.9 * s, jit(R.pick(reds), R, 0.015, 0.1, 0.05));
        if (i === 0) { const f = 0.4, fh = th * 0.34, rad = R0 * (1 - 0.38 * 0.34) + 0.02, ry = Math.atan2(Math.cos(f), Math.sin(f)), px = x + Math.cos(f) * rad, pz = z + Math.sin(f) * rad, tx = Math.cos(ry), tz = -Math.sin(ry); blob(gb, M.bark, px, y + fh - R0 * 0.5, pz, R0 * 0.8, R0 * 1.9, R0 * 0.2, 0xa89c88, ry); for (const sd of [-1, 1]) { gb.box(M.dark, px + tx * sd * R0 * 0.4, y + fh, pz + tz * sd * R0 * 0.4, R0 * 0.46, R0 * 0.26, R0 * 0.26, ry, 0xffffff, 0, sd * 0.3); gb.box(M.sap, px + tx * sd * R0 * 0.42, y + fh - R0 * 1.1, pz + tz * sd * R0 * 0.42, R0 * 0.08, R0 * 1.1, R0 * 0.1, ry); } gb.box(M.dark, px, y + fh - R0 * 1.5, pz, R0 * 0.44, R0 * 0.9, R0 * 0.28, ry); }
      });
      root.add(gb.build({})); }
    // ---- snowy pines: layered skirts with snow-laden shoulders
    { const Rn = K.rng(5), gp = [[-100, -20], [-84, -34], [-70, -18], [-72, 8], [-92, 14], [-106, 0]].map(([a, c2]) => [a * 1.15 + 6, c2 * 1.4]);
      const pts = K.scatter({ rng: Rn, count: q.dens(420), bounds: [-420, -320, -60, 320], minDist: 5.5, avoid: (x, z) => H(x, z) < 2 || K.pointInPoly(x, z, gp) || (x > -66 && Math.abs(z) < 90) });
      const tr = new Inst(GG.cyl(5, 0.7), M.pineB), s1 = new Inst(GG.cone(7), M.needle), s2 = new Inst(GG.cone(7), M.needle), s3 = new Inst(GG.cone(7), M.needle), c1 = new Inst(GG.cone(7), M.snowM), c2 = new Inst(GG.cone(7), M.snowM), c3 = new Inst(GG.cone(7), M.snowM);
      for (const [x, z] of pts) { const k = Rn.range(1.3, 2.4), y = H(x, z), a = Rn() * 6, g = jit(Rn.pick([0x2c4a38, 0x36563f, 0x28423a, 0x3a5a46]), Rn, 0.02, 0.08, 0.05), sn = Rn.range(0.5, 1);
        tr.add(x, y - 0.2, z, 0.5 * k, 3.4 * k, 0.5 * k, 0, 0x4a3a2c);
        s1.add(x, y + 1.3 * k, z, 2.9 * k, 3.6 * k, 2.9 * k, a, g); c1.add(x, y + 2.3 * k, z, 2.9 * k * 0.74, 2.6 * k, 2.9 * k * 0.74, a, new THREE.Color(0xe6eef4).multiplyScalar(0.7 + 0.3 * sn));
        s2.add(x, y + 3.5 * k, z, 2.2 * k, 3.1 * k, 2.2 * k, a, g); c2.add(x, y + 4.4 * k, z, 2.2 * k * 0.72, 2.2 * k, 2.2 * k * 0.72, a, new THREE.Color(0xe6eef4).multiplyScalar(0.7 + 0.3 * sn));
        s3.add(x, y + 5.5 * k, z, 1.45 * k, 3.0 * k, 1.45 * k, a, g); c3.add(x, y + 6.4 * k, z, 1.45 * k * 0.66, 2.1 * k, 1.45 * k * 0.66, a, new THREE.Color(0xeef4f8)); }
      for (const i of [tr, s1, s2, s3, c1, c2, c3]) if (i.items.length) root.add(i.build()); }

    // ---- drifting ice floes: pale slabs with raised edges, bobbing and turning slowly
    const NF = 16, fl = new Inst(GG.cyl(8, 0.92), M.ice, { cast: false }), fl2 = new Inst(GG.cyl(6, 0.7), M.ice, { cast: false }), fd = [];
    for (let i = 0; i < NF; i++) { fd.push({ x: rng.range(10, 230), z: rng.range(-170, 170), s: rng.range(4, 12), v: rng.range(0.2, 0.5), r: rng() * 3, ph: rng() * 6 }); fl.add(0, 0, 0, 1, 1, 1); fl2.add(0, 0, 0, 1, 1, 1); }
    const floes = fl.build(), floes2 = fl2.build(); root.add(floes, floes2);
    const o = new THREE.Object3D();
    const putFloes = (t) => { fd.forEach((d, i) => { let z = d.z + Math.sin(t * 0.05 + i) * 5, x = d.x - ((t * d.v) % 260); if (x < shoreX(z) + 6) x += 260; const bob = Math.sin(t * 0.8 + d.ph) * 0.06, ts = Math.sin(t * 0.5 + d.ph) * 0.03;
      o.position.set(x, -0.35 + bob, z); o.scale.set(d.s, 0.9, d.s * 0.72); o.rotation.set(ts, d.r + t * 0.01, -ts); o.updateMatrix(); floes.setMatrixAt(i, o.matrix);
      o.position.set(x + d.s * 0.12, -0.2 + bob, z - d.s * 0.1); o.scale.set(d.s * 0.55, 0.9, d.s * 0.4); o.updateMatrix(); floes2.setMatrixAt(i, o.matrix); }); floes.instanceMatrix.needsUpdate = true; floes2.instanceMatrix.needsUpdate = true; };
    putFloes(0); ctx.onUpdate((dt, t) => putFloes(t));
    const gulls = K.birds({ center: [40, 40, -70], radius: 70, count: q.dens(10), color: 0xe8eaec, size: 1.1, spreadY: 12, seed: 2 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const crows = K.birds({ center: [-40, 18, -4], radius: 24, count: q.dens(5), color: 0x15161a, size: 1.0, spreadY: 6, seed: 3, speed: 0.1 }); root.add(crows); ctx.onUpdate((dt, t) => crows.userData.update(t));
    root.add(dimSmoke(K.smoke([[-120, 40, 120], [-110, 36, -130], [60, 3, 40], [100, 3, -50], [140, 3, 90], [30, 3, -110]], { color: 0xe6edf0, size: 150, rise: 14, opacity: 0.13, perStack: 8, spread: 20 })));
    root.add(dimSmoke(K.smoke(Array.from({ length: 7 }, (_, i) => [-60 + i * 18, H(-60, -60 + i * 20) + 8, -60 + i * 20]), { color: 0xf0f6fa, size: 40, rise: 6, opacity: 0.1, perStack: 4, spread: 10 })));   // wind-lifted snow
    root.add(dimClouds(K.clouds({ y: 200, extent: 600, count: 9, opacity: 0.4, color: 0xcdd6dc })));
    ctx.onUpdate(() => { const n = night(); for (const f of dimmers) f(n); });

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 190, center: [-10, 0, 0], minDistance: 14,
      hero: { pos: [72, 30, 62], target: [-46, 3, -6] },
      climate: {
        atmos: 'day', weather: 'snow', snow: 0.75,
        tint: {
          dawn: { top: 0x5a6a92, horizon: 0xdcbcb4, fog: 0xb4b4be, fogD: 0.0026, sunC: 0xffc8a0, sunI: 1.9, hemiSky: 0x9aa8c8, hemiGround: 0x4a4a52, hemiI: 0.85 },
          day: { top: 0x58708a, horizon: 0xb7c4cf, fog: 0xb9c6d0, fogD: 0.0021, sunC: 0xf4eee0, sunI: 1.5, hemiSky: 0xaec0d0, hemiGround: 0x6a6e72, hemiI: 1.05 },
          dusk: { top: 0x2e3a64, horizon: 0xd49a86, fog: 0x9c9aa8, fogD: 0.0024, sunC: 0xff9c68, sunI: 2.0, hemiSky: 0x8090b8, hemiGround: 0x403e48, hemiI: 0.78 },
          night: { top: 0x080e26, horizon: 0x2a3c5e, fog: 0x1a2840, fogD: 0.0026, sunC: 0xa6bcf0, sunI: 1.3, hemiSky: 0x6a82bc, hemiGround: 0x2e3648, hemiI: 1.2 },
        },
      },
      landmarks: {
        'harbour-bay': lm(80, 10, 40, 4),
        'old-jetty': lm(shoreX(8) + 12, 8, 14, 5),
        'palisade': lm(-51, -8, 22, 6),
        'ruined-hall': lm(-40, -4, 14, 9),
        'hulls-on-the-shore': lm(shoreX(-30) - 6, -30, 12, 5),
        'weirwood-grove': lm(-88, -8, 18, 12),
        'headland-cliffs': lm(shoreX(130) + 4, 130, 28, 36),
      },
      cutaways: [],
    };
  },
};
