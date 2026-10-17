// Astapor — the Red City. Book anchors: red-brick, ancient and crumbling; stepped pyramids of the Good Masters (Nakloz, Ullhor);
// the Plaza of Pride with a bronze harpy fountain; Unsullied trained and sold; a harbour on Slaver's Bay with a harpy on the harbour gate.
// Everything else (plan, positions, sizes) is interpretation — see content/astapor.js.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const CX = 0, CZ = 8, RX = 118, RZ = 92, GY = 2.2;
const ringPts = (n, seed, jitter = 0.05) => { const rr = K.rng(seed); return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, k = 1 + rr.range(-jitter, jitter); return [CX + Math.cos(a) * RX * k, CZ + Math.sin(a) * RZ * k]; }); };

// ---- small helpers ----------------------------------------------------------------------------------------------
const _c = new THREE.Color(), _c2 = new THREE.Color(), _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _one = new THREE.Vector3(1, 1, 1);
/** hue/sat/value jitter inside a colour family */
const jit = (hex, r, dh = 0.014, ds = 0.05, dl = 0.05) => { const h = {}; _c.set(hex).getHSL(h); return _c.setHSL((h.h + r.range(-dh, dh) + 1) % 1, K.clamp(h.s + r.range(-ds, ds), 0, 1), K.clamp(h.l + r.range(-dl, dl), 0, 1)).getHex(); };
const mix = (a, b, t) => _c.set(a).lerp(_c2.set(b), t).getHex();
/** slab with an arched opening, passage along local Z */
function portal(b, mat, x, y, z, ry, W, Hh, D, aw, ah, color) {
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, Hh); sh.lineTo(-W / 2, Hh); sh.closePath();
  const r = aw / 2, hole = new THREE.Path(); hole.moveTo(-r, 0); hole.lineTo(-r, ah - r); hole.absarc(0, ah - r, r, Math.PI, 0, true); hole.lineTo(r, 0); hole.closePath(); sh.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(sh, { depth: D, bevelEnabled: false, curveSegments: 8 }); g.translate(0, 0, -D / 2);
  _e.set(0, ry, 0); _q.setFromEuler(_e); _m4.compose(_v.set(x, y, z), _q, _one); b.addGeometry(mat, g, _m4, color); g.dispose();
}
/** four low parapet walls around a rectangle (local frame rotated by ry); skipFront leaves a gap for stairs */
function parapet(b, mat, x, y, z, w, d, ry, t, h, color, gap = 0) {
  const c = Math.cos(ry), s = Math.sin(ry), at = (ox, oz) => [x + ox * c + oz * s, z - ox * s + oz * c];
  const put = (ox, oz, ww, dd) => { const [px, pz] = at(ox, oz); b.box(mat, px, y, pz, ww, h, dd, ry, color); };
  put(0, -d / 2 + t / 2, w, t); put(-w / 2 + t / 2, 0, t, d - 2 * t); put(w / 2 - t / 2, 0, t, d - 2 * t);
  if (gap) { const sw = (w - gap) / 2; put(-(gap / 2 + sw / 2), d / 2 - t / 2, sw, t); put(gap / 2 + sw / 2, d / 2 - t / 2, sw, t); } else put(0, d / 2 - t / 2, w, t);
}
/** bronze/clay harpy facing +Z: pedestal, bird-hipped body, woman's torso, six-feather raised wings, tail feathers */
function harpy(b, mat, x, y, z, s, ry = 0, col = 0xffffff, col2 = col) {
  const c = Math.cos(ry), sn = Math.sin(ry), at = (ox, oz) => [x + ox * c + oz * sn, z - ox * sn + oz * c];
  b.cyl(mat, x, y, z, 0.85 * s, 0.45 * s, { top: 0.8, seg: 10, color: col2 });                       // perch drum
  b.cyl(mat, x, y + 0.45 * s, z, 0.55 * s, 1.0 * s, { top: 0.7, seg: 10, color: col });                  // hips / feathered thighs
  b.cyl(mat, x, y + 1.4 * s, z, 0.42 * s, 1.7 * s, { top: 0.85, seg: 10, color: col });                  // torso
  b.sphere(mat, x, y + 3.2 * s, z, 0.34 * s, { seg: 8, color: col });                                   // head
  b.cone(mat, x, y + 3.45 * s, z, 0.2 * s, 0.65 * s, { seg: 5, color: col2 });                      // crest
  for (const sd of [-1, 1]) {
    const [px, pz] = at(sd * 0.38 * s, -0.05 * s);
    for (let k = 0; k < 5; k++) {
      const len = (2.1 + k * 0.5) * s, ang = 0.28 + k * 0.21;
      b.box(mat, px, y + (2.55 + k * 0.02) * s, pz, 0.5 * s, len, 0.12 * s, ry, k % 2 ? col : col2, 0, -sd * ang);
    }
    const [lx, lz] = at(sd * 0.28 * s, 0.25 * s); b.box(mat, lx, y + 0.5 * s, lz, 0.16 * s, 0.9 * s, 0.16 * s, ry, col2, 0.5, 0); // talons gripping the perch
  }
  for (let k = -1; k <= 1; k++) { const [tx, tz] = at(k * 0.28 * s, -0.4 * s); b.box(mat, tx, y + 0.1 * s, tz, 0.3 * s, 1.5 * s, 0.1 * s, ry, col2, -2.6, k * 0.3); } // tail
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root;
    const coastZ = (x) => -98 + Math.sin(x * 0.025) * 4 + (K.fbm(x * 0.03, 3, 2, 7) - 0.5) * 6;
    const ell = (x, z) => Math.hypot((x - CX) / RX, (z - CZ) / RZ);
    const heightAt = (x, z) => {
      const d = z - coastZ(x);
      const outer = K.smoothstep(1.15, 1.9, ell(x, z));
      let land = 2.2 + outer * ((K.fbm(x * 0.012, z * 0.012, 3, 3) - 0.35) * 14 + (K.fbm(x * 0.04, z * 0.04, 2, 5) - 0.5) * 2.2);
      land += K.smoothstep(240, 420, Math.hypot(x, z)) * 24 * K.fbm(x * 0.005, z * 0.005, 3, 8);
      return K.lerp(-9, land, K.smoothstep(-30, 3, d));
    };
    const H = heightAt, rr = K.rng(12);
    // ---- terrain: sun-baked dust, ochre strata on the rises, scrub, salt pans, trampled earth round the walls, damp shore
    const T = { sand: new THREE.Color(0xd3b280), dust: new THREE.Color(0xb88f5f), ochre: new THREE.Color(0xc58a50), rust: new THREE.Color(0x9a6648), scrub: new THREE.Color(0x8c8a52), salt: new THREE.Color(0xe6d8b8), trod: new THREE.Color(0xa68259), wet: new THREE.Color(0x8e8468) }, c = new THREE.Color();
    root.add(K.terrain({ size: 1000, seg: q.seg(170), heightAt, kind: 'sand', scale: 16, colorAt: (x, z, h, s) => {
      const n1 = K.fbm(x * 0.015, z * 0.015, 3, 1), n2 = K.fbm(x * 0.05, z * 0.05, 2, 4), n3 = K.fbm(x * 0.004, z * 0.004, 2, 9);
      c.copy(T.sand).lerp(T.dust, K.clamp(n1 * 2.0 - 0.45, 0, 1)); c.lerp(T.ochre, K.clamp(K.fbm(x * 0.009 + 5, z * 0.02, 3, 12) * 2 - 0.9, 0, 0.5));
      c.lerp(T.ochre, (Math.sin(h * 1.3 + n1 * 7) * 0.5 + 0.5) * 0.4 * K.smoothstep(3, 9, h));
      c.lerp(T.scrub, K.clamp((n2 - 0.46) * 3.2, 0, 0.7) * K.smoothstep(1.5, 3.5, h));
      c.lerp(T.salt, K.clamp((n3 - 0.56) * 3, 0, 0.5));
      c.lerp(T.rust, K.clamp(s * 3.2, 0, 0.7));
      c.lerp(T.trod, K.smoothstep(1.45, 1.05, ell(x, z)) * 0.5);
      if (h < 1.7) c.lerp(T.wet, K.smoothstep(1.7, 0.3, h) * 0.7);
      return c; } }));
    const wat = K.water({ w: 760, d: 300, seg: q.seg(140), center: [0, -210], level: 0, heightAt, deep: 0x1b5a62, shallow: 0x82b9a6, foam: 0xf6ecd4, opacity: 0.93, choppy: 0.5, speed: 0.55 });
    root.add(wat); ctx.registerWater(wat);

    // ---- materials (tint white: colours are set per object so every building drifts within the red family)
    const brick = tri('brick', { color: 0xffffff, scale: 9, bump: 0.5, snow: false }), paving = tri('cobble', { color: 0xffffff, scale: 10, bump: 0.6, snow: false }), plaster = tri('plaster', { color: 0xffffff, scale: 6, snow: false });
    const wood = tri('wood', { color: 0xffffff, scale: 4, snow: false }), roadMat = tri('sand', { color: 0xffffff, scale: 8, snow: false }), stone = tri('stone', { color: 0xffffff, scale: 6, snow: false });
    const bronze = flat(0xffffff, { rough: 0.38, metal: 0.65, flatShading: false }), clay = tri('plaster', { color: 0xffffff, scale: 4, snow: false }), dark = flat(0x1a110d), cloth = flat(0xffffff, { rough: 1, flatShading: false });
    const windowG = glow(0xffb259), lampG = glow(0xffc477, 1.4);
    const instStd = new THREE.MeshStandardMaterial({ roughness: 1 });
    const BR = [0xcf7a5c, 0xc4705a, 0xd98a68, 0xbb6850, 0xd2825f, 0xc9775a], BRD = 0x8a523f, BRL = 0xe3ae8e, PLA = [0xe8cfa8, 0xdfc19a, 0xeed8b4, 0xd8b890];
    const b = new Batch();

    // ---- walls: thick, slumped red brick; battered dark base, bleached cap, broken merlons; squat stub towers
    const ring = ringPts(28, 3, 0.05), N = ring.length;
    for (let i = 0; i < N; i++) {
      const seg = [ring[i], ring[(i + 1) % N]];
      K.wall(b, seg, { h: 13, t: 5.2, mat: brick, capMat: brick, crenel: false, heightAt, sink: 2.5, color: jit(BR[i % 6], rr, 0.01, 0.05, 0.05) });
      K.wall(b, seg, { h: 3.4, t: 6.5, mat: brick, crenel: false, heightAt, sink: 2.5, color: BRD });
      K.wall(b, seg, { h: 13.3, t: 6.0, mat: brick, crenel: false, heightAt, sink: -12.5, color: mix(BRL, 0xd9b090, rr()) });
      const A = seg[0], B = seg[1], ang = Math.atan2(-(B[1] - A[1]), B[0] - A[0]);
      for (let k = 0; k < 7; k++) if (rr() < 0.55) { const t = (k + 0.5) / 7, x = A[0] + (B[0] - A[0]) * t, z = A[1] + (B[1] - A[1]) * t, nx = -(B[1] - A[1]) / 26, nz = (B[0] - A[0]) / 26, sd = rr() < 0.5 ? -1 : 1; b.box(brick, x + nx * sd * 2.3, H(x, z) + 13.3, z + nz * sd * 2.3, rr.range(1.4, 2.4), rr.range(0.7, 2.4), 1.0, ang, jit(BR[k % 6], rr)); }
    }
    ring.forEach(([x, z], i) => { if (i % 2 !== 1) return; const y = H(x, z), ry = (i / N) * 6.28, h = rr.range(15, 20), col = jit(BR[i % 6], rr);
      K.squareTower(b, x, z, { w: 7, h, y, mat: brick, roof: 'flat', crenel: false, windows: false, ry, color: col });
      b.box(brick, x, y - 1, z, 9.4, 4.2, 9.4, ry, BRD);                                                         // battered footing
      for (let k = 0; k < 4; k++) { const a = ry + k * 1.57, ox = Math.cos(k * 1.57 + 0.6) * 2.4, oz = Math.sin(k * 1.57 + 0.6) * 2.4; b.box(brick, x + ox, y + h + 0.8, z + oz, rr.range(1.8, 3), rr.range(0.6, 2.8), rr.range(1.8, 3), a, jit(BRL, rr)); } // slumped, broken crown
      b.box(windowG, x + Math.sin(ry) * 3.55, y + h * 0.6, z + Math.cos(ry) * 3.55, 0.7, 1.7, 0.14, ry); });
    const gate = (i, ry, w = 20) => { const [x, z] = ring[i], y = H(x, z), c = Math.cos(ry), s = Math.sin(ry), col = jit(0xd0785a, rr);
      for (const sg of [-1, 1]) { const tx = x + sg * (w / 2) * c, tz = z - sg * (w / 2) * s; K.squareTower(b, tx, tz, { w: 8, d: 12, h: 21, y, ry, mat: brick, roof: 'flat', crenel: false, windows: false, color: col }); b.box(brick, tx, y - 1, tz, 10, 3.6, 14, ry, BRD); b.box(lampG, tx + s * 6.1, y + 13, tz + c * 6.1, 0.6, 1.1, 0.12, ry); }
      portal(b, brick, x, y, z, ry, w - 4, 13, 11, 5.8, 8.6, col);
      b.box(dark, x, y, z, 5.6, 8, 0.5, ry);                                                                       // dark interior
      b.box(brick, x, y + 13, z, w - 3, 1.1, 12, ry, BRL);                                                         // frieze
      for (let k = 0; k < 5; k++) b.box(brick, x + (k - 2) * 3.2 * c, y + 14.1, z - (k - 2) * 3.2 * s, 1.6, 1.4 + (k % 2) * 0.5, 1.8, ry, jit(BRL, rr));
      return [x, z]; };
    const gN = gate(21, 0, 26), gS = gate(7, 0), gE = gate(0, Math.PI / 2), gW = gate(14, Math.PI / 2);
    { const [x, z] = gN, y = H(x, z) + 15.3; b.box(brick, x, y - 0.4, z, 8, 2.2, 5, 0, BRD); harpy(b, clay, x, y + 1.8, z, 3.3, 0, 0xc8734f, 0xa65a40); }  // colossal crumbling clay harpy on the harbour gate

    // ---- streets and Plaza of Pride
    const streets = [[gN, [0, 6], gS], [gW, [0, 6], gE], [[-70, -50], [0, 6]], [[70, -45], [0, 6]], [[-60, 60], [0, 6]], [[60, 62], [0, 6]]];
    streets.forEach((s, i) => b.ribbon(roadMat, s, i < 2 ? 9 : 6, heightAt, 0.14, 0xc09a6c));
    for (const [g, dx, dz] of [[gN, 0, -1], [gS, 0, 1], [gE, 1, 0], [gW, -1, 0]]) b.ribbon(roadMat, [g, [g[0] + dx * 60, g[1] + dz * 60], [g[0] + dx * 130 + dz * 20, g[1] + dz * 130 + dx * 14]], 8, heightAt, 0.14, 0xb48e62);
    const PZ = 6;
    b.box(paving, 0, GY - 0.12, PZ, 54, 0.5, 54, 0, 0xcaa77c);
    b.box(paving, 0, GY + 0.36, PZ, 46, 0.1, 46, 0, 0xb8946b); b.box(paving, 0, GY + 0.42, PZ, 36, 0.08, 36, 0, 0xd6b48a); b.box(paving, 0, GY + 0.48, PZ, 22, 0.08, 22, 0, 0xc29f74);
    for (let i = -1; i <= 1; i += 2) for (let j = -1; j <= 1; j += 2) { const px = i * 26.5, pz = PZ + j * 26.5; b.box(brick, px, GY, pz, 3, 1.0, 3, 0, BRD); b.box(brick, px, GY + 1, pz, 2.2, 3.6, 2.2, 0, BRL); b.box(brick, px, GY + 4.6, pz, 2.8, 0.5, 2.8, 0, BRD); b.box(lampG, px, GY + 5.1, pz, 1.1, 1.0, 1.1, 0); }
    // fountain: stepped basin, pedestal, bronze harpy (about twenty feet in the books; shown a little larger)
    b.cyl(brick, 0, GY, PZ, 9, 1.0, { top: 0.97, seg: 28, color: BRL }); b.cyl(brick, 0, GY + 1.0, PZ, 8.3, 0.6, { top: 1, seg: 28, color: BRD });
    b.cyl(brick, 0, GY + 1.6, PZ, 7.4, 0.2, { seg: 28, color: BRL });
    b.cyl(brick, 0, GY + 1.6, PZ, 2.3, 1.0, { top: 0.85, seg: 12, color: BRL }); b.cyl(brick, 0, GY + 2.6, PZ, 1.5, 2.6, { top: 0.6, seg: 12, color: 0xd9a584 });
    b.cyl(brick, 0, GY + 5.2, PZ, 2.0, 0.5, { top: 1.1, seg: 12, color: BRL });
    harpy(b, bronze, 0, GY + 5.7, PZ, 1.85, 0.4, 0xb9923f, 0x8a6a2c);
    const pool = K.waterPatch({ w: 14.4, d: 14.4, level: GY + 1.5, center: [0, PZ], depth: 1, deep: 0x4b7266, shallow: 0x78a18f, opacity: 0.88, seg: 2 }); root.add(pool); ctx.registerWater(pool);

    // ---- pyramids of the Good Masters: stepped tiers fading from dark footing to bleached crown, copings, parapets, stairs, roof gardens
    const pyrs = [], palms = [];
    const pyramid = (x, z, base, steps, stepH, ry, seed) => {
      const r = K.rng(seed), f = [Math.sin(ry), Math.cos(ry)], y0 = H(x, z);
      let s = base, y = y0, top;
      for (let i = 0; i < steps; i++) {
        const t = i / Math.max(1, steps - 1), col = jit(mix(0xb3604a, 0xe0a07e, t), r, 0.012, 0.05, 0.04);
        b.box(brick, x, y - (i ? 0 : 3), z, s, stepH + (i ? 0 : 3), s, ry, col);
        b.box(brick, x, y + stepH, z, s + 0.7, 0.5, s + 0.7, ry, mix(0xd7a07f, BRL, t));                      // bleached coping
        if (i === 0) b.box(brick, x, y0 - 1, z, s + 1.6, 2.2, s + 1.6, ry, BRD);                                   // dark footing
        const ns = s * 0.8, ter = (s - ns) / 2;
        if (i < steps - 1) {
          parapet(b, brick, x, y + stepH + 0.5, z, s + 0.4, s + 0.4, ry, 0.5, 0.9, jit(BRL, r), 6);
          const dep = ter - 0.2, cx = x + f[0] * (ns / 2 + dep / 2), cz = z + f[1] * (ns / 2 + dep / 2);
          b.wedge(brick, cx, y + stepH + 0.5, cz, dep, stepH + 0.1, 5.6, ry + Math.PI / 2, 0xe2ad8a);       // stair up to the next tier
          if (i % 2 === 0) for (const sd of [-1, 1]) { const px = x + f[1] * sd * (ns / 2 - 2), pz = z - f[0] * sd * (ns / 2 - 2); if (r() < 0.8) palms.push([px + f[0] * (ns / 2 + ter / 2), y + stepH + 0.5, pz + f[1] * (ns / 2 + ter / 2)]); }
        }
        y += stepH + 0.5; s = ns;
      }
      { const dep = stepH * 1.1; b.wedge(brick, x + f[0] * (base / 2 + dep / 2), y0, z + f[1] * (base / 2 + dep / 2), dep, stepH + 0.5, 6, ry + Math.PI / 2, 0xe2ad8a); }   // grand stair from the ground
      b.box(plaster, x, y, z, s, 3, s, ry, 0xeed6b0); parapet(b, plaster, x, y + 3, z, s + 0.2, s + 0.2, ry, 0.5, 0.8, 0xf4e2c2);
      b.cyl(clay, x, y + 3, z, s * 0.34, 1.0, { seg: 12, color: 0xd9ba92 }); b.dome(clay, x, y + 4, z, s * 0.38, { seg: 12, sy: 0.72, color: r() < 0.5 ? jit(0xe2c8a4, r) : jit(0xb0694c, r) });
      b.box(dark, x + f[0] * (base / 2 + 0.05), H(x, z), z + f[1] * (base / 2 + 0.05), 5, 5.2, 0.3, ry);  // great door
      b.box(windowG, x + f[0] * (s / 2 + 0.05), y + 0.9, z + f[1] * (s / 2 + 0.05), 1.0, 1.4, 0.12, ry);
      pyrs.push({ x, z, r: base * 0.78, top: y + 3 + s * 0.3 }); return y + 3 + s * 0.3;
    };
    const nTop = pyramid(-56, -18, 46, 6, 6, 0.1, 1), uTop = pyramid(62, 14, 42, 6, 5.5, -0.2, 2);
    pyramid(-52, 52, 30, 4, 5, 0.3, 3); pyramid(52, 58, 30, 4, 5, -0.3, 4); pyramid(58, -46, 32, 4, 5.5, 0.2, 5); pyramid(-92, 22, 26, 4, 4.6, 0.1, 6); pyramid(88, 40, 24, 3, 5, 0, 7);

    // ---- Unsullied training pits: sunken sand yards behind brick walls with a gate, ranks of spiked-helm soldiers
    const pitSpots = [[-96, -6, 22], [-18, 70, 24], [26, 80, 22]];
    const man = new Inst(G.cyl(6, 0.8), instStd), head = new Inst(G.sphere(6), instStd), helm = new Inst(G.cone(5), instStd), spear = new Inst(G.cyl(4, 1), instStd);
    for (const [x, z, sz] of pitSpots) {
      const y = GY;
      b.box(roadMat, x, y - 0.2, z, sz, 0.5, sz, 0, 0xdcc08c);
      for (const [ox, oz, w, d] of [[0, sz / 2, sz + 3, 2], [0, -sz / 2, sz + 3, 2], [sz / 2, 0, 2, sz], [-sz / 2, 0, 2, sz]]) { b.box(brick, x + ox, y, z + oz, w, 4.2, d, 0, jit(0xb8654d, rr)); b.box(brick, x + ox, y + 4.2, z + oz, w + 0.3, 0.5, d + 0.3, 0, BRL); }
      b.box(dark, x, y, z + sz / 2 + 0.05, 3, 3, 2.2, 0);
      const n = Math.floor(sz / 4);
      for (let i = 0; i < n; i++) for (let j = 0; j < n - 1; j++) { const px = x - sz / 2 + 3 + i * 3.2, pz = z - sz / 2 + 3 + j * 3.4; man.add(px, y + 0.3, pz, 0.42, 1.3, 0.42, 0, 0xb8b4a8); head.add(px, y + 1.6, pz, 0.24, 0.24, 0.24, 0, 0x7a5439); helm.add(px, y + 1.8, pz, 0.14, 0.45, 0.14, 0, 0xc09a48); spear.add(px + 0.35, y + 0.3, pz, 0.05, 2.5, 0.05, 0, 0x5a4332); }
    }
    root.add(man.build(), head.build(), helm.build(), spear.build());

    // ---- slave market near the plaza: muted striped awnings, counters, barrels and crates, a raised auction block with canopy, low pens
    const stripes = [[0xc9a14a, 0xe6d9b8], [0x3d5873, 0xe6d9b8], [0xa6473a, 0xe0c9a0], [0x7c8a5a, 0xe6d9b8], [0x8a5a7a, 0xe0c9a0]];
    for (let i = 0; i < 18; i++) {
      const x = 22 + (i % 6) * 8.5, z = 40 + Math.floor(i / 6) * 9, y = H(x, z), ry = 0.06 * ((i % 3) - 1), [ca, cb] = stripes[i % 5], c0 = Math.cos(ry), s0 = Math.sin(ry);
      b.box(cloth, x - 1.5 * c0, y + 2.7, z + 1.5 * s0, 3.1, 0.14, 4.8, ry, ca, 0.0, 0.16); b.box(cloth, x + 1.5 * c0, y + 2.7, z - 1.5 * s0, 3.1, 0.14, 4.8, ry, cb, 0.0, -0.16);   // pitched striped roof
      for (const [dx, dz] of [[-2.7, -2], [2.7, -2], [-2.7, 2], [2.7, 2]]) b.cyl(wood, x + dx * c0 + dz * s0, y, z - dx * s0 + dz * c0, 0.1, 2.8, { seg: 5, color: 0x6b4a30 });
      b.box(wood, x, y, z + 1.2, 4.2, 1.0, 1.4, ry, jit(0x7a5a3c, rr)); b.box(cloth, x, y + 1.0, z + 1.2, 3.6, 0.1, 1.0, ry, jit([0xcf8a3a, 0x8a9a4a, 0xb04a3a][i % 3], rr));
      if (i % 2) b.cyl(wood, x - 3.4, y, z - 1.4, 0.55, 0.95, { seg: 8, color: 0x8a6240 }); else b.box(wood, x + 3.4, y, z - 1.2, 1.0, 0.9, 0.9, 0.3, 0xa0784a);
    }
    for (let i = 0; i < 3; i++) { const x = 36 + i * 16; b.box(wood, x, GY, 26, 7, 1.2, 5, 0, 0x7a5a3c); b.box(wood, x, GY + 1.2, 26, 5, 1.0, 3.4, 0, 0x8a6a46); b.box(wood, x + 3.6, GY, 26, 1.8, 0.7, 1.4, 0, 0x7a5a3c); }
    { const x = 52, z = 26; for (const [dx, dz] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) b.cyl(wood, x + dx, GY + 2.2, z + dz, 0.12, 3.2, { seg: 5, color: 0x5a3f2a }); b.box(cloth, x, GY + 5.4, z, 7.6, 0.3, 5.6, 0, 0x8a3a2e); b.pyramid(cloth, x, GY + 5.7, z, 7.6, 1.2, 5.6, 0, 0x9c4a3a); }

    // ---- houses: dense low red-brick blocks, each in its own shade; parapets, roof huts, lean-to awnings, drum-and-dome roofs, lit slits
    const poly = ring.map(([x, z]) => [x * 0.93, CZ + (z - CZ) * 0.93]);
    const dist = (x, z) => Math.min(...streets.map((s) => K.distToPolyline(x, z, s).d));
    const keepClear = (x, z) => dist(x, z) < 6.5 || (Math.abs(x) < 33 && Math.abs(z - 6) < 33) || pyrs.some((p) => Math.hypot(x - p.x, z - p.z) < p.r + 4) || pitSpots.some(([px, pz, sz]) => Math.abs(x - px) < sz / 2 + 7 && Math.abs(z - pz) < sz / 2 + 7) || (x > 14 && x < 70 && z > 30 && z < 64);
    const spots = K.scatter({ rng: K.rng(31), count: q.dens(330), bounds: [-110, -84, 110, 98], poly, minDist: 7.2, avoid: keepClear }), placed = [], hr = K.rng(77);
    for (const [x, z] of spots) {
      const w = hr.range(4.8, 7.4), d = hr.range(4.8, 7.4), h = hr.range(3.8, 8.6), ry = (hr() < 0.5 ? 0 : Math.PI / 2) + hr.range(-0.07, 0.07), y = GY, wc = hr() < 0.16 ? jit(0xe6cfaa, hr, 0.01, 0.04, 0.04) : hr() < 0.24 ? jit(0xd8a572, hr, 0.012, 0.05, 0.04) : jit(BR[hr.int(0, 5)], hr, 0.016, 0.06, 0.06), c0 = Math.cos(ry), s0 = Math.sin(ry);
      b.box(brick, x, y - 1.2, z, w, h + 1.2, d, ry, wc); b.box(brick, x, y - 0.4, z, w + 0.35, 1.5, d + 0.35, ry, mix(wc, BRD, 0.55));      // wall + sooty/damp footing
      const kind = hr(); let roofTop = y + h;
      if (kind < 0.16) { b.box(plaster, x, y + h, z, w + 0.5, 0.6, d + 0.5, ry, jit(PLA[0], hr)); b.cyl(clay, x, y + h + 0.6, z, Math.min(w, d) * 0.36, 0.9, { seg: 10, color: 0xd8b68e }); b.dome(clay, x, y + h + 1.5, z, Math.min(w, d) * 0.4, { seg: 10, sy: 0.75, color: hr() < 0.55 ? jit(0xe0c6a2, hr) : jit(0xa9654a, hr) }); roofTop += 3; }
      else {
        b.box(plaster, x, y + h, z, w + 0.5, 0.6, d + 0.5, ry, jit(PLA[hr.int(0, 3)], hr, 0.01, 0.04, 0.04)); parapet(b, plaster, x, y + h + 0.6, z, w + 0.5, d + 0.5, ry, 0.4, 0.7, mix(wc, 0xeed8b4, 0.55)); roofTop += 1.3;
        if (kind < 0.38) { b.box(brick, x + c0 * w * 0.12, y + h + 0.6, z - s0 * w * 0.12, w * 0.42, 2.2, d * 0.42, ry, jit(wc, hr)); roofTop += 2.2; }
        else if (kind < 0.55) { const [ca] = stripes[hr.int(0, 4)]; b.box(cloth, x + s0 * (d / 2 + 0.7), y + h * 0.62, z + c0 * (d / 2 + 0.7), w * 0.8, 0.12, 1.9, ry, ca, -0.35, 0); }
        else if (kind < 0.64) { b.box(brick, x + c0 * w * 0.5, y + h + 0.6, z - s0 * w * 0.5, 0.9, 2.2, 0.9, ry, BRD); }       // chimney / flue
      }
      b.box(dark, x + s0 * (d / 2 + 0.05), y, z + c0 * (d / 2 + 0.05), 1.3, 2.3, 0.14, ry);                                    // door
      for (const sd of [-1, 1]) if (hr() < 0.65) b.box(windowG, x + s0 * sd * (d / 2 + 0.05) * -1 + c0 * sd * w * 0.22, y + h * 0.58, z + c0 * sd * (d / 2 + 0.05) * -1 - s0 * sd * w * 0.22, 0.85, 1.4, 0.12, ry);
      placed.push({ x, z, h: roofTop - y });
    }

    // ---- harbour: stone quay that follows the shore, wooden piers with lanterns, warehouses, crates
    for (let x = -76; x <= 76; x += 8) { const cz = coastZ(x) - 2, cs = coastZ(x + 8) - coastZ(x); b.box(brick, x, -3.5, cz, 8.6, 5.7 + 0.1, 7, Math.atan(-cs / 8) * 0.0, jit(0xb9674f, rr)); b.box(brick, x, 2.1, cz + 1.2, 8.6, 0.45, 4.6, 0, BRL); }
    for (const px of [-48, -16, 18, 52]) { const pz = coastZ(px); K.pier(b, px, 2.0, pz + 2, { len: 30, w: 4.5, ry: Math.PI / 2, mat: wood, color: 0x7c5a3a }); for (const zz of [pz + 1, pz - 27]) { b.cyl(wood, px + 1.8, 2.5, zz, 0.12, 2.8, { seg: 5, color: 0x4a3626 }); b.box(lampG, px + 1.8, 5.3, zz, 0.6, 0.9, 0.6); } }
    for (let i = 0; i < 18; i++) { const x = rr.range(-70, 70), z = coastZ(x) + rr.range(0.5, 4.5); if (i % 3 === 0) b.cyl(wood, x, 2.5, z, 0.55, 0.95, { seg: 8, color: jit(0x8a6240, rr) }); else b.box(wood, x, 2.5, z, rr.range(0.9, 1.5), rr.range(0.8, 1.2), rr.range(0.9, 1.5), rr() * 3, jit(0xa0784a, rr)); }
    for (let i = 0; i < 6; i++) { const x = -60 + i * 24 + rr.range(-4, 4), z = coastZ(x) + 12; if (Math.abs(x - gN[0]) < 18) continue; b.box(brick, x, GY - 0.8, z, 14, 5.4, 7, 0, jit(BR[i % 6], rr)); b.prism(plaster, x, GY + 4.6, z, 15, 2.8, 8, 0, jit(0xd3b289, rr)); b.box(dark, x, GY, z + 3.55, 3.4, 3.4, 0.2, 0); }

    // ---- palms: pyramid terraces and plaza (drooping fronds)
    for (const a of [[-12, PZ - 14], [12, PZ - 14], [-12, PZ + 14], [12, PZ + 14], [-18, PZ], [18, PZ]]) palms.push([a[0], GY + 0.4, a[1]]);
    for (const [x, y, z] of palms) { const k = rr.range(0.85, 1.2), g = jit(0x5a8a3e, rr, 0.03, 0.08, 0.05); b.cyl(wood, x, y, z, 0.28 * k, 6.4 * k, { top: 0.7, seg: 6, color: 0x9b8058 }); for (let i = 0; i < 8; i++) { const a = i * 0.785 + rr() * 0.3; b.box(cloth, x + Math.cos(a) * 1.4 * k, y + 6.3 * k, z + Math.sin(a) * 1.4 * k, 3.2 * k, 0.1, 0.9 * k, -a, i % 2 ? g : mix(g, 0x3a6a2c, 0.5), 0, -0.45); } }
    root.add(b.build({}));

    // ---- ships: cogs, galleys and dhows; moored near the piers and one beating along the bay
    const ships = [], defs = [['cog', 18, -60, -128, 0.1], ['galley', 22, -10, -142, -0.2], ['cog', 16, 40, -127, 0.5], ['dhow', 14, 90, -155, 1.2], ['galley', 24, -110, -172, 2.0]];
    defs.forEach(([type, len, x, z, ph], i) => { const s = K.ship(type, { len, hull: [0x6a4a30, 0x5a3e28, 0x7a5636][i % 3], sail: [0xe9dcc0, 0xd2956a, 0xe2d2b0, 0xc4805a, 0xefe4cc][i] }); s.position.set(x, 0.2, z); s.rotation.y = ph; root.add(s); ships.push({ s, x, z, ph, i }); });
    ctx.onUpdate((dt, t) => { for (const o of ships) { K.animateShip(o.s, t, o.ph); if (o.i >= 3) { o.s.position.x = o.x + Math.sin(t * 0.05 + o.ph) * 40; o.s.rotation.y = Math.PI / 2 - Math.cos(t * 0.05 + o.ph) * 0.4 + (o.i === 3 ? 0 : 3); } } });

    // ---- life: wind-blown dust, hearth smoke, banners, braziers, people, gulls, drifting cloud
    const dustPts = []; for (let i = 0; i < 24; i++) { const a = rr() * 6.28, r = rr.range(110, 270); dustPts.push([Math.cos(a) * r, H(Math.cos(a) * r, Math.sin(a) * r * 0.8) + 1, Math.sin(a) * r * 0.8]); }
    root.add(K.smoke(dustPts, { color: 0xdcc08e, size: 70, rise: 7, opacity: 0.15, spread: 16, perStack: 5 }));
    root.add(K.smoke(placed.filter((_, i) => i % 7 === 0).map((p) => [p.x, GY + p.h + 1.5, p.z]), { color: 0xb9ada0, size: 16, rise: 14, opacity: 0.2 }));
    const bn = [[0, 30, gN[1]], [-56, nTop + 9, -18], [62, uTop + 9, 14], [gE[0], 28, gE[1]], [gW[0], 28, gW[1]], [0, 26, gS[1]]].map(([x, y, z]) => ({ x: x + 4, y, z, w: 3, h: 8, color: 0x8a2a22, ry: 0.4 }));
    root.add(K.banners(bn));
    const fire = K.fires([[-24, 4.2, -12], [24, 4.2, -12], [-24, 4.2, 26], [24, 4.2, 26], [gN[0] + 14, 4, gN[1] + 8]], { size: 8, light: q.low ? 0 : 2 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const wk = K.walkers({ paths: [[gN, [0, 6], gS], [gW, [0, 6], gE], [[30, 38], [70, 38]], [[-40, 20], [0, 6], [40, 30]], [[-70, coastZ(-70) + 3], [70, coastZ(70) + 3]]], heightAt, count: q.dens(64), rng: K.rng(5), colors: [0xb5533a, 0xe0d2b0, 0x3f5a78, 0x8a6a3a, 0x7e1f1a, 0xc9a14a] });
    root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const gulls = K.birds({ center: [0, 40, -105], radius: 90, count: q.dens(10), color: 0xf4f0e6, size: 1.2, spreadY: 14, seed: 4 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const cl = K.clouds({ y: 260, extent: 800, count: 8, opacity: 0.26, color: 0xf3e2c6 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));
    // scrub, thorn and rubble on the dry ground outside the walls
    { const sc = new Inst(G.sphere(5), instStd), rk = new Inst(G.box(), instStd), rs = K.rng(70);
      for (let i = 0; i < q.dens(90); i++) { const cx = rs.range(-340, 320), cz = rs.range(-260, 270); if (ell(cx, cz) < 1.25 || cz < coastZ(cx) + 10) continue;
        const nn = rs.int(3, 7); for (let j = 0; j < nn; j++) { const x = cx + rs.range(-6, 6), z = cz + rs.range(-6, 6), k = rs.range(0.5, 1.5); sc.add(x, H(x, z) - 0.1, z, k * 1.4, k * 0.6, k * 1.4, rs() * 3, [0x7a7a46, 0x6c6c40, 0x8a8250, 0x7c6c46, 0x92874e][j % 5]); }
        if (i % 3 === 0) { const k = rs.range(1, 2.2); rk.add(cx + 2, H(cx + 2, cz), cz, k * 1.8, k * 1.1, k * 1.4, rs() * 3, [0x9a7a5a, 0x8a6e52, 0xa68a68][i % 3]); } }
      root.add(sc.build(), rk.build()); }

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 230, center: [0, 0, -10], minDistance: 18,
      hero: { pos: [150, 118, -214], target: [0, 8, -4] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn:  { top: 0x4a5f94, horizon: 0xf0b88c, fog: 0xe4b494, fogD: 0.0013, sunC: 0xffb676, sunI: 3.1, hemiSky: 0xa4acd6, hemiGround: 0x6a4a3e, hemiI: 0.78 },
        day:   { top: 0x4f86c0, horizon: 0xf0d8b0, fog: 0xe9cfa0, fogD: 0.00105, sunC: 0xffe2b0, sunI: 3.5, hemiSky: 0xbcd0e8, hemiGround: 0x8a6244, hemiI: 0.95 },
        dusk:  { top: 0x35306a, horizon: 0xf0925a, fog: 0xd08a68, fogD: 0.0014, sunC: 0xff8a42, sunI: 3.0, hemiSky: 0x8a86c0, hemiGround: 0x4e3a34, hemiI: 0.7 },
        night: { top: 0x0b1236, horizon: 0x33406c, fog: 0x232e50, fogD: 0.0017, sunC: 0xa8bcef, sunI: 1.3, hemiSky: 0x7384bc, hemiGround: 0x2e2a36, hemiI: 1.35, exposure: 1.3 },
      } },
      landmarks: {
        'plaza-of-pride': lm(0, 6, 26, 8), 'harpy-fountain': lm(0, 6, 7, 13), 'pyramid-of-nakloz': lm(-56, -18, 24, nTop - 2), 'pyramid-of-ullhor': lm(62, 14, 22, uTop - 2),
        'unsullied-pits': lm(-18, 70, 18, 6), 'slave-market': lm(40, 46, 20, 7), 'red-walls': lm(-100, -50, 14, 17), 'harbour-gate': lm(gN[0], gN[1], 14, 33),
        'harbour': lm(10, -112, 22, 6), 'brick-warrens': lm(-8, 60, 24, 9),
      },
    };
  },
};
