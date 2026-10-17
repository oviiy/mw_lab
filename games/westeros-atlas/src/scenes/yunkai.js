// Yunkai — the Yellow City. Book anchors: yellow-brick walls (hence the name), the Wise Masters, pyramids, bed-slave training, a harbour on
// Slaver's Bay, and the plain outside where Daenerys's host camped. Everything else is interpretation — see content/yunkai.js.
// Deliberately different from Astapor: rectangular grid city on a low hill, tall straight walls with round bastions, domed gates, many small pyramids.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const TH = 0.16, CT = Math.cos(TH), ST = Math.sin(TH), HX = 108, HZ = 64, RY = -TH;   // RY: box rotation that lines up with the rotated city grid
const rot = (x, z) => [x * CT - z * ST, x * ST + z * CT];   // local grid -> world
const unrot = (x, z) => [x * CT + z * ST, -x * ST + z * CT];

// ---- small helpers ----------------------------------------------------------------------------------------------
const _c = new THREE.Color(), _c2 = new THREE.Color(), _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _one = new THREE.Vector3(1, 1, 1);
const jit = (hex, r, dh = 0.014, ds = 0.05, dl = 0.05) => { const h = {}; _c.set(hex).getHSL(h); return _c.setHSL((h.h + r.range(-dh, dh) + 1) % 1, K.clamp(h.s + r.range(-ds, ds), 0, 1), K.clamp(h.l + r.range(-dl, dl), 0, 1)).getHex(); };
const mix = (a, b, t) => _c.set(a).lerp(_c2.set(b), t).getHex();
function portal(b, mat, x, y, z, ry, W, Hh, D, aw, ah, color) {
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, Hh); sh.lineTo(-W / 2, Hh); sh.closePath();
  const r = aw / 2, hole = new THREE.Path(); hole.moveTo(-r, 0); hole.lineTo(-r, ah - r); hole.absarc(0, ah - r, r, Math.PI, 0, true); hole.lineTo(r, 0); hole.closePath(); sh.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(sh, { depth: D, bevelEnabled: false, curveSegments: 8 }); g.translate(0, 0, -D / 2);
  _e.set(0, ry, 0); _q.setFromEuler(_e); _m4.compose(_v.set(x, y, z), _q, _one); b.addGeometry(mat, g, _m4, color); g.dispose();
}
function parapet(b, mat, x, y, z, w, d, ry, t, h, color, gap = 0) {
  const c = Math.cos(ry), s = Math.sin(ry), at = (ox, oz) => [x + ox * c + oz * s, z - ox * s + oz * c];
  const put = (ox, oz, ww, dd) => { const [px, pz] = at(ox, oz); b.box(mat, px, y, pz, ww, h, dd, ry, color); };
  put(0, -d / 2 + t / 2, w, t); put(-w / 2 + t / 2, 0, t, d - 2 * t); put(w / 2 - t / 2, 0, t, d - 2 * t);
  if (gap) { const sw = (w - gap) / 2; put(-(gap / 2 + sw / 2), d / 2 - t / 2, sw, t); put(gap / 2 + sw / 2, d / 2 - t / 2, sw, t); } else put(0, d / 2 - t / 2, w, t);
}
function palm(b, wood, leaf, x, y, z, k, r) {
  const g = jit(0x5f8f3e, r, 0.03, 0.08, 0.05); b.cyl(wood, x, y, z, 0.28 * k, 6.4 * k, { top: 0.7, seg: 6, color: 0x9b8058 });
  for (let i = 0; i < 8; i++) { const a = i * 0.785 + r() * 0.3; b.box(leaf, x + Math.cos(a) * 1.4 * k, y + 6.3 * k, z + Math.sin(a) * 1.4 * k, 3.2 * k, 0.1, 0.9 * k, -a, i % 2 ? g : mix(g, 0x3a6a2c, 0.5), 0, -0.45); }
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(21);
    const coastX = (z) => 150 + Math.sin(z * 0.03) * 6 + (K.fbm(z * 0.02, 1, 2, 4) - 0.5) * 10;
    const heightAt = (x, z) => {
      const d = coastX(z) - x; // >0 inland
      const [lx, lz] = unrot(x, z);
      const inCity = 1 - K.smoothstep(0.95, 1.5, Math.max(Math.abs(lx) / HX, Math.abs(lz) / HZ));
      let land = 2.0 + 5.5 * Math.exp(-((x * x * 0.7 + z * z * 1.4) / 5200)) * inCity;
      land += (1 - inCity) * ((K.fbm(x * 0.011, z * 0.011, 3, 2) - 0.3) * 10 + (K.fbm(x * 0.045, z * 0.045, 2, 6) - 0.5) * 1.6);
      land += K.smoothstep(240, 420, Math.hypot(x, z)) * 30 * K.fbm(x * 0.005, z * 0.005, 3, 9);
      // harbour basin carved between the two moles
      const basin = K.smoothstep(34, 22, Math.abs(z)) * K.smoothstep(112, 126, x);
      land = K.lerp(land, -5, basin * 0.95);
      return K.lerp(-9, land, K.smoothstep(-26, 3, d));
    };
    const H = heightAt;
    // ---- terrain: ochre loam, bleached stubble, scrub, green irrigated plots near the walls, trodden camp ground, damp shore
    const T = { sand: new THREE.Color(0xdcc386), dust: new THREE.Color(0xc2a572), stub: new THREE.Color(0xd2c48c), scrub: new THREE.Color(0x959652), field: new THREE.Color(0x8fa152), loam: new THREE.Color(0x8c8260), trod: new THREE.Color(0xa38c62), rock: new THREE.Color(0xa88a62), c: new THREE.Color() }, c = T.c;
    root.add(K.terrain({ size: 1000, seg: q.seg(170), heightAt, kind: 'sand', scale: 16, colorAt: (x, z, h, s) => {
      const n1 = K.fbm(x * 0.012, z * 0.012, 3, 1), n2 = K.fbm(x * 0.05, z * 0.05, 2, 5), n3 = K.fbm(x * 0.02, z * 0.03, 3, 8), [lx, lz] = unrot(x, z);
      c.copy(T.sand).lerp(T.dust, K.clamp(n1 * 2 - 0.5, 0, 1)); c.lerp(T.stub, K.clamp(n3 * 2 - 0.8, 0, 0.6));
      c.lerp(T.scrub, K.clamp((n2 - 0.48) * 3, 0, 0.6) * K.smoothstep(1.2, 3, h));
      const near = Math.max(Math.abs(lx) / HX, Math.abs(lz) / HZ);
      c.lerp(T.field, K.clamp((K.fbm(x * 0.03, z * 0.03, 2, 14) - 0.45) * 4, 0, 0.85) * K.smoothstep(1.12, 1.4, near) * K.smoothstep(2.4, 1.6, near) * (x > -120 ? 1 : 0) * K.smoothstep(150, 100, x));
      c.lerp(T.trod, K.smoothstep(-150, -200, x) * K.smoothstep(-300, -240, x) * 0.0 + (K.smoothstep(-160, -190, x) * K.smoothstep(-300, -250, x) * K.smoothstep(120, 60, Math.abs(z - 20)) * 0.55));
      c.lerp(T.rock, K.clamp(s * 3, 0, 0.6));
      if (h < 1.5) c.lerp(T.loam, K.smoothstep(1.5, 0.2, h) * 0.7);
      return c; } }));
    const wat = K.water({ w: 260, d: 700, seg: q.seg(90), center: [250, 0], level: 0, heightAt, deep: 0x1c5c68, shallow: 0x86bcaa, foam: 0xf6ecd0, opacity: 0.92, choppy: 0.45, speed: 0.5 });
    root.add(wat); ctx.registerWater(wat);

    const yellow = tri('brick', { color: 0xffffff, scale: 9, bump: 0.5, snow: false }), cream = tri('plaster', { color: 0xffffff, scale: 6, snow: false });
    const paving = tri('cobble', { color: 0xffffff, scale: 10, bump: 0.6, snow: false }), wood = tri('wood', { color: 0xffffff, scale: 4, snow: false }), roadMat = tri('sand', { color: 0xffffff, scale: 8, snow: false });
    const tile = tri('tile', { color: 0xffffff, scale: 4, snow: false });
    const dark = flat(0x1b120e), gold = flat(0xffffff, { rough: 0.42, metal: 0.3, flatShading: false }), cloth = flat(0xffffff, { rough: 1, flatShading: false }), leafM = flat(0xffffff, { rough: 1 });
    const windowG = glow(0xffb85a), lampG = glow(0xffc477, 1.4);
    const instStd = new THREE.MeshStandardMaterial({ roughness: 1 });
    const YL = [0xe8c870, 0xdfbf62, 0xedd183, 0xd9b85c, 0xe6c26a, 0xd6a95a], YD = 0x9a7a3c, YC = 0xf0dfa8, CRM = [0xe8d49c, 0xe3cd90, 0xecdcaa];
    const b = new Batch();
    const P = (x, z) => rot(x, z), palms = [];

    // ---- walls: tall straight yellow brick on a battered footing, string course, merlons; round bastions with drum-and-dome caps
    const ring = [];
    const side = (ax, az, bx, bz) => { const n = Math.round(Math.hypot(bx - ax, bz - az) / 26); for (let i = 0; i < n; i++) ring.push(P(ax + ((bx - ax) * i) / n, az + ((bz - az) * i) / n)); };
    side(-HX, -HZ, HX, -HZ); side(HX, -HZ, HX, HZ); side(HX, HZ, -HX, HZ); side(-HX, HZ, -HX, -HZ);
    const N = ring.length;
    for (let i = 0; i < N; i++) {
      const seg = [ring[i], ring[(i + 1) % N]], col = jit(YL[i % 6], rr, 0.01, 0.05, 0.04);
      K.wall(b, seg, { h: 17, t: 3.6, mat: yellow, capMat: yellow, heightAt, merlon: 1.3, sink: 3, color: col });
      K.wall(b, seg, { h: 4.2, t: 5.2, mat: yellow, crenel: false, heightAt, sink: 3, color: YD });
      K.wall(b, seg, { h: 11.4, t: 4.0, mat: yellow, crenel: false, heightAt, sink: -10.4, color: mix(col, 0xfff0c0, 0.25) });   // string course
    }
    const domeCols = [0xe0d2a8, 0xd4ae60, 0x6aa292, 0xe0d2a8, 0xcf8a58];
    ring.forEach(([x, z], i) => { const y = H(x, z), h = 22 + (i % 3), col = jit(YL[(i + 2) % 6], rr);
      b.cyl(yellow, x, y - 3, z, 5.6, 5.5, { top: 0.9, seg: 12, color: YD });
      K.tower(b, x, z, { r: 4.4, h, y, mat: yellow, roofMat: gold, roof: 'none', seg: 12, windows: false, crenel: false, color: col });
      b.cyl(yellow, x, y + h, z, 5.1, 1.0, { top: 1.08, seg: 12, color: mix(col, 0xfff0c0, 0.3) });
      b.cyl(cream, x, y + h + 1, z, 3.4, 2.4, { seg: 12, color: YC }); b.dome(cream, x, y + h + 3.4, z, 3.5, { seg: 12, sy: 0.9, color: domeCols[i % 5] }); b.cone(gold, x, y + h + 6.5, z, 0.2, 1.8, { seg: 5, color: 0xc9a038 });
      for (let k = 0; k < 6; k++) { const a = k * 1.047, ox = Math.cos(a) * 3.4, oz = Math.sin(a) * 3.4; b.box(windowG, x + ox * 1.12, y + h * 0.7, z + oz * 1.12, 0.6, 1.5, 0.14, -a + Math.PI / 2); if (k > 3) break; } });
    // gates: arched portals between paired round towers; the sea gate is the grandest
    const gate = (lx, lz, ry, w) => { const [x, z] = P(lx, lz), y = H(x, z), rry = ry + RY, c = Math.cos(rry), s = Math.sin(rry), col = jit(0xe0c06a, rr);
      for (const sg of [-1, 1]) { const tx = x + sg * (w / 2) * c, tz = z - sg * (w / 2) * s;
        b.cyl(yellow, tx, y - 3, tz, 7.4, 6, { top: 0.9, seg: 14, color: YD }); K.tower(b, tx, tz, { r: 5.5, h: 27, y, mat: yellow, roof: 'none', seg: 14, windows: false, crenel: false, color: col });
        b.cyl(yellow, tx, y + 27, tz, 6.4, 1.1, { top: 1.08, seg: 14, color: YC }); b.cyl(cream, tx, y + 28.1, tz, 4.2, 2.6, { seg: 14, color: YC }); b.dome(cream, tx, y + 30.7, tz, 4.4, { seg: 14, sy: 1, color: 0xd8b25c }); b.cone(gold, tx, y + 35, tz, 0.25, 2.4, { seg: 5, color: 0xc9a038 });
        b.box(lampG, tx + s * 5.7, y + 14, tz + c * 5.7, 0.7, 1.2, 0.14, rry); }
      portal(b, yellow, x, y, z, rry, w - 4, 15, 9.4, 6, 9.4, col); b.box(dark, x, y, z, 5.8, 8.6, 0.5, rry);
      b.box(yellow, x, y + 15, z, w - 3, 1.2, 10.4, rry, YC);
      for (let k = 0; k < 6; k++) b.box(yellow, x + (k - 2.5) * 3.0 * c, y + 16.2, z - (k - 2.5) * 3.0 * s, 1.5, 1.3 + (k % 2) * 0.5, 1.8, rry, jit(YC, rr));
      return [x, z]; };
    const gW = gate(-HX, 0, Math.PI / 2, 24), gE = gate(HX, 0, Math.PI / 2, 28), gN = gate(0, -HZ, 0, 22), gS = gate(0, HZ, 0, 22);

    // ---- streets (a regular grid, the main street running from the land gate to the sea gate)
    const streets = [];
    const line = (a, bb, w) => { const s = [P(...a), P(...bb)]; streets.push(s); b.ribbon(roadMat, s, w, heightAt, 0.13, 0xcfae78); };
    line([-HX, 0], [HX, 0], 10); line([0, -HZ], [0, HZ], 8);
    for (const lz of [-36, 36]) line([-HX + 8, lz], [HX - 8, lz], 5);
    for (const lx of [-66, -33, 33, 66]) line([lx, -HZ + 6], [lx, HZ - 6], 5);
    for (const [g, s0] of [[gW, [-1, 0]], [gN, [0, -1]], [gS, [0, 1]]]) b.ribbon(roadMat, [g, [g[0] + s0[0] * 70, g[1] + s0[1] * 70], [g[0] + s0[0] * 150, g[1] + s0[1] * 150 + 10]], 8, heightAt, 0.13, 0xb89a68);
    { const [px, pz] = P(0, 0); b.cyl(paving, px, H(px, pz) - 0.1, pz, 14, 0.4, { seg: 24, color: 0xd9bf8a }); b.cyl(paving, px, H(px, pz) + 0.28, pz, 9.5, 0.1, { seg: 24, color: 0xc2a574 }); }   // central crossing

    // ---- pyramids: the Wise Masters' stepped pyramids, banded yellow and cream, with copings, parapets, stairs and gilded crowns
    const pyrs = [];
    const pyramid = (lx, lz, base, steps, stepH, seed) => {
      const [x, z] = P(lx, lz), r = K.rng(seed), f = [Math.sin(RY), Math.cos(RY)], y0 = H(x, z);
      let s = base, y = y0;
      for (let i = 0; i < steps; i++) {
        const t = i / Math.max(1, steps - 1), col = i % 2 ? mix(0xf0dc9a, 0xf6e8b8, t) : mix(0xcfa850, 0xe8c96e, t);
        b.box(yellow, x, y - (i ? 0 : 3), z, s, stepH + (i ? 0 : 3), s, RY, jit(col, r, 0.01, 0.04, 0.03));
        b.box(yellow, x, y + stepH, z, s + 0.6, 0.45, s + 0.6, RY, mix(0xe0c070, YC, t));
        if (i === 0) b.box(yellow, x, y0 - 1, z, s + 1.4, 2.0, s + 1.4, RY, YD);
        const ns = s * 0.78, ter = (s - ns) / 2;
        if (i < steps - 1) {
          parapet(b, yellow, x, y + stepH + 0.45, z, s + 0.4, s + 0.4, RY, 0.45, 0.85, YC, 5.6);
          const dep = ter - 0.2; b.wedge(yellow, x + f[0] * (ns / 2 + dep / 2), y + stepH + 0.45, z + f[1] * (ns / 2 + dep / 2), dep, stepH + 0.1, 4.6, RY + Math.PI / 2, 0xe6cc80);
        }
        y += stepH + 0.45; s = ns;
      }
      { const dep = stepH * 1.1; b.wedge(yellow, x + f[0] * (base / 2 + dep / 2), y0, z + f[1] * (base / 2 + dep / 2), dep, stepH + 0.45, 5.2, RY + Math.PI / 2, 0xe6cc80); }
      b.box(cream, x, y, z, s, 2.6, s, RY, 0xf6e8c0); parapet(b, cream, x, y + 2.6, z, s + 0.2, s + 0.2, RY, 0.45, 0.75, 0xfff2d0);
      b.cyl(cream, x, y + 2.6, z, s * 0.32, 0.9, { seg: 12, color: YC }); b.dome(gold, x, y + 3.5, z, s * 0.36, { seg: 12, sy: 0.9, color: 0xd1a83e }); b.cone(gold, x, y + 3.5 + s * 0.33, z, 0.2, 1.8, { seg: 5, color: 0xd1a83e });
      b.box(dark, x + f[0] * (base / 2 + 0.05), H(x, z), z + f[1] * (base / 2 + 0.05), 4.4, 4.6, 0.3, RY);
      pyrs.push({ x, z, r: base * 0.76, top: y + 5 }); return y + 5;
    };
    const topA = pyramid(-6, -4, 40, 6, 5.2, 1);
    pyramid(-40, -18, 28, 4, 5, 2); pyramid(34, -22, 30, 5, 4.6, 3); pyramid(32, 24, 26, 4, 4.6, 4); pyramid(-34, 26, 24, 4, 4.4, 5); pyramid(70, -4, 22, 3, 4.6, 6); pyramid(-80, -22, 20, 3, 4.2, 7); pyramid(-84, 28, 20, 3, 4.2, 8);

    // ---- bed-slave houses: pleasure-house courtyards with garden pools, palms and rose-and-ochre awnings
    const bedSpots = [[-74, -44], [-52, 46], [60, 44], [-18, 48]];
    for (const [lx, lz] of bedSpots) {
      const [x, z] = P(lx, lz), y = H(x, z), S = 20, f = [Math.sin(RY), Math.cos(RY)];
      for (const [ox, oz, w, d] of [[0, -S / 2, S, 3.5], [0, S / 2, S, 3.5], [-S / 2, 0, 3.5, S - 3], [S / 2, 0, 3.5, S - 3]]) {
        const [rx, rz] = rot(ox, oz); b.box(cream, x + rx, y - 1, z + rz, w, 7, d, RY, jit(CRM[0], rr)); b.box(yellow, x + rx, y + 6, z + rz, w + 0.6, 0.5, d + 0.6, RY, YC);
        const [wx, wz] = rot(ox * 0.0 + (oz !== 0 ? 0 : Math.sign(ox) * -1.8), oz * 0.0 + (oz !== 0 ? -Math.sign(oz) * 1.8 : 0));
        b.box(windowG, x + rx + wx, y + 2.8, z + rz + wz, oz !== 0 ? w * 0.6 : 0.14, 1.3, oz !== 0 ? 0.14 : (d - 3) * 0.6, RY);
      }
      b.box(leafM, x, y, z, S - 8, 0.3, S - 8, RY, 0x7aa04a); b.cyl(paving, x, y, z, 3.6, 0.5, { seg: 14, color: 0xd9c9a0 }); b.cyl(paving, x, y + 0.5, z, 2.6, 0.2, { seg: 14, color: 0x6aa8a0 }); b.cyl(cream, x, y + 0.5, z, 0.5, 1.8, { seg: 8, color: 0xf0e4c0 });
      for (const [ox, oz] of [[-6, -6], [6, 6], [-6, 6], [6, -6]]) { const [rx, rz] = rot(ox, oz); palms.push([x + rx, y + 0.2, z + rz]); }
      for (let k = 0; k < 4; k++) { const [rx, rz] = rot(-S / 2 + 2.5 + k * 5, -S / 2 - 1.6); b.box(cloth, x + rx, y + 4.8, z + rz, 4, 0.14, 3, RY, [0xb8556a, 0xd9a64a, 0xb8556a, 0xe6d6b0][k], 0.25, 0); }
    }

    // ---- slave market in the western square: striped awnings, counters, crates, a raised block with canopy
    const stripes = [[0xc0566c, 0xe6d6b0], [0xd9a64a, 0xe6d6b0], [0x4f86a0, 0xe6d6b0], [0x8a9a5a, 0xe6d6b0]];
    for (let i = 0; i < 16; i++) { const lx = -62 + (i % 4) * 10, lz = -16 + Math.floor(i / 4) * 8.5; if (Math.abs(lz) < 6) continue; const [x, z] = P(lx, lz), y = H(x, z), [ca, cb] = stripes[i % 4], c0 = Math.cos(RY), s0 = Math.sin(RY);
      b.box(cloth, x - 1.6 * c0, y + 2.7, z + 1.6 * s0, 3.3, 0.14, 4.6, RY, ca, 0, 0.16); b.box(cloth, x + 1.6 * c0, y + 2.7, z - 1.6 * s0, 3.3, 0.14, 4.6, RY, cb, 0, -0.16);
      for (const [dx, dz] of [[-3.2, -1.9], [3.2, -1.9], [-3.2, 1.9], [3.2, 1.9]]) { const [rx, rz] = rot(dx, dz); b.cyl(wood, x + rx, y, z + rz, 0.1, 2.8, { seg: 5, color: 0x6b4a30 }); }
      b.box(wood, x, y, z + 1.3 * c0, 4.4, 1.0, 1.3, RY, jit(0x7a5a3c, rr)); b.box(cloth, x, y + 1.0, z + 1.3 * c0, 3.8, 0.1, 0.9, RY, jit([0xcf8a3a, 0x8a9a4a, 0xb04a5a][i % 3], rr)); if (i % 2) b.cyl(wood, x - 3.5, y, z - 1.6, 0.55, 0.95, { seg: 8, color: 0x8a6240 }); }
    { const [mx, mz] = P(-58, 4), y = H(mx, mz); b.box(wood, mx, y, mz, 8, 1.2, 6, RY, 0x7a5a3c); b.box(wood, mx, y + 1.2, mz, 5, 1.0, 3.6, RY, 0x8a6a46);
      for (const [dx, dz] of [[-2.2, -1.4], [2.2, -1.4], [-2.2, 1.4], [2.2, 1.4]]) b.cyl(wood, mx + dx, y + 2.2, mz + dz, 0.12, 3.2, { seg: 5, color: 0x5a3f2a }); b.box(cloth, mx, y + 5.4, mz, 6.4, 0.25, 4.4, RY, 0xb8556a); }

    // ---- houses: flat-roofed yellow blocks in graded ochres, parapets, rooftop huts, awnings, glazed domes; a few tiled roofs
    const poly = [[-HX + 6, -HZ + 6], [HX - 6, -HZ + 6], [HX - 6, HZ - 6], [-HX + 6, HZ - 6]].map(([x, z]) => P(x, z));
    const dist = (x, z) => Math.min(...streets.map((s) => K.distToPolyline(x, z, s).d));
    const clear = (x, z) => dist(x, z) < 4.5 || pyrs.some((p) => Math.hypot(x - p.x, z - p.z) < p.r + 3.5) || bedSpots.some(([lx, lz]) => { const [px, pz] = P(lx, lz); return Math.hypot(x - px, z - pz) < 17; }) || (() => { const [lx, lz] = unrot(x, z); return (lx > -70 && lx < -40 && Math.abs(lz) < 24) || lx > 96 || (Math.abs(lx) < 16 && Math.abs(lz) < 16); })();
    const spots = K.scatter({ rng: K.rng(33), count: q.dens(300), bounds: [-130, -110, 130, 110], poly, minDist: 7, avoid: clear }), placed = [], hr = K.rng(91);
    const house = (x, z, w, d, h, ry, y, wc, k) => {
      const c0 = Math.cos(ry), s0 = Math.sin(ry);
      b.box(yellow, x, y - 1.2, z, w, h + 1.2, d, ry, wc); b.box(yellow, x, y - 0.4, z, w + 0.35, 1.5, d + 0.35, ry, mix(wc, YD, 0.5));
      let top = h;
      if (k < 0.14) { b.box(cream, x, y + h, z, w + 0.5, 0.6, d + 0.5, ry, jit(CRM[1], hr)); b.cyl(cream, x, y + h + 0.6, z, Math.min(w, d) * 0.34, 0.9, { seg: 10, color: YC }); b.dome(cream, x, y + h + 1.5, z, Math.min(w, d) * 0.38, { seg: 10, sy: 0.85, color: hr() < 0.5 ? 0xd9b45e : 0x6aa292 }); top += 3; }
      else if (k < 0.3) { b.pyramid(tile, x, y + h, z, w + 0.9, Math.min(w, d) * 0.5 + 0.8, d + 0.9, ry, jit(0xc4704a, hr, 0.012, 0.06, 0.05)); top += Math.min(w, d) * 0.5 + 0.8; }
      else { b.box(cream, x, y + h, z, w + 0.5, 0.6, d + 0.5, ry, jit(CRM[hr.int(0, 2)], hr, 0.01, 0.04, 0.03)); parapet(b, cream, x, y + h + 0.6, z, w + 0.5, d + 0.5, ry, 0.4, 0.7, jit(YC, hr)); top += 1.3;
        if (k < 0.5) { b.box(yellow, x + c0 * w * 0.12, y + h + 0.6, z - s0 * w * 0.12, w * 0.4, 2.2, d * 0.4, ry, jit(wc, hr)); top += 2.2; }
        else if (k < 0.66) { b.box(cloth, x + s0 * (d / 2 + 0.7), y + h * 0.62, z + c0 * (d / 2 + 0.7), w * 0.8, 0.12, 1.9, ry, stripes[hr.int(0, 3)][0], -0.35, 0); } }
      b.box(dark, x + s0 * (d / 2 + 0.05), y, z + c0 * (d / 2 + 0.05), 1.3, 2.3, 0.14, ry);
      for (const sd of [-1, 1]) if (hr() < 0.65) b.box(windowG, x - s0 * sd * (d / 2 + 0.05) + c0 * sd * w * 0.22, y + h * 0.58, z - c0 * sd * (d / 2 + 0.05) - s0 * sd * w * 0.22, 0.85, 1.4, 0.12, ry);
      return top;
    };
    for (const [x, z] of spots) { const w = hr.range(4.8, 7.6), d = hr.range(4.8, 7.6), h = hr.range(3.8, 8.4), ry = RY + (hr() < 0.5 ? 0 : Math.PI / 2) + hr.range(-0.04, 0.04); const top = house(x, z, w, d, h, ry, H(x, z), hr() < 0.12 ? jit(0xf0e0b0, hr) : jit(YL[hr.int(0, 5)], hr, 0.014, 0.06, 0.06), hr()); placed.push({ x, z, h: top }); }

    // ---- harbour: quay, wooden piers, two stone moles with domed gate-towers, fishermen's quarter
    b.box(yellow, 116, -2, 0, 16, 4.7, 68, 0, 0xcfae6a); b.box(yellow, 116, 2.6, 0, 16.4, 0.4, 68.4, 0, 0xe6d3a0);
    for (const sg of [-1, 1]) { b.box(yellow, 142, -4.5, sg * 36, 56, 8, 5, 0, jit(0xcfae6a, rr)); b.box(yellow, 142, 3.4, sg * 36, 56.4, 0.5, 5.4, 0, 0xe6d3a0);
      K.tower(b, 170, sg * 36, { r: 4.2, h: 12, y: -3, mat: yellow, roof: 'none', seg: 10, windows: false, crenel: false, color: 0xdcbc66 }); b.cyl(yellow, 170, 9, sg * 36, 4.9, 0.9, { top: 1.1, seg: 10, color: YC }); b.dome(gold, 170, 9.9, sg * 36, 3.9, { seg: 10, sy: 0.95, color: 0xc9a038 }); b.box(lampG, 170, 14.8, sg * 36, 1.0, 1.2, 1.0); }
    for (const pz of [-18, -6, 6, 18]) { K.pier(b, 123, 2.2, pz, { len: 24, w: 3.6, ry: 0, mat: wood, color: 0x7c5a3a }); b.cyl(wood, 146, 2.5, pz + 1.5, 0.12, 2.8, { seg: 5, color: 0x4a3626 }); b.box(lampG, 146, 5.3, pz + 1.5, 0.6, 0.9, 0.6); }
    for (let i = 0; i < 14; i++) { const x = rr.range(110, 122), z = rr.range(-30, 30); if (i % 3 === 0) b.cyl(wood, x, 3.0, z, 0.55, 0.95, { seg: 8, color: jit(0x8a6240, rr) }); else b.box(wood, x, 3.0, z, rr.range(0.9, 1.5), rr.range(0.8, 1.2), rr.range(0.9, 1.5), rr() * 3, jit(0xa0784a, rr)); }
    const fr = K.scatter({ rng: K.rng(44), count: q.dens(34), bounds: [HX + 4, -100, HX + 34, -48], minDist: 6.5, avoid: (x, z) => coastX(z) - x < 10 });
    for (const [x, z] of fr) { const w = hr.range(4, 5.6), d = hr.range(4, 5.6), y = H(x, z), ry = hr.range(-0.2, 0.2), pitched = hr() < 0.6, wc = jit([0xeed9a0, 0xe0c680, 0xd8c8a0][hr.int(0, 2)], hr);
      b.box(cream, x, y - 1, z, w, 4.4, d, ry, wc);
      if (pitched) b.prism(wood, x, y + 3.4, z, w + 0.9, 2.2, d + 0.9, ry, jit(0x9a7a4c, hr)); else b.box(cream, x, y + 3.4, z, w + 0.4, 0.5, d + 0.4, ry, YC);
      b.box(dark, x + Math.sin(ry) * (d / 2 + 0.05), y, z + Math.cos(ry) * (d / 2 + 0.05), 1.0, 2.0, 0.12, ry); if (hr() < 0.6) b.box(windowG, x - Math.sin(ry) * (d / 2 + 0.05) + Math.cos(ry) * 1.1, y + 1.8, z - Math.cos(ry) * (d / 2 + 0.05) - Math.sin(ry) * 1.1, 0.7, 0.9, 0.12, ry); }
    for (let i = 0; i < 8; i++) { const x = rr.range(120, 130), z = rr.range(-100, -56); if (coastX(z) - x < 4) continue; b.box(wood, x, H(x, z), z, 5, 0.6, 1.6, rr() * 3, 0x8a6a46); b.box(cloth, x + 0.5, H(x, z) + 0.6, z, 3, 0.1, 1.2, rr() * 3, 0xd9cfae); }

    // ---- palms
    for (const a of [[-8, -8], [8, 8], [-8, 8], [8, -8]]) { const [x, z] = P(...a); palms.push([x, H(x, z), z]); }
    for (const [x, y, z] of palms) palm(b, wood, cloth, x, y, z, rr.range(0.85, 1.2), rr);
    root.add(b.build({}));

    // ---- camp of the besiegers outside the west gate: ordered rows of canvas tents, a command pavilion, cookfires, picket lines
    const tents = new Inst(G.pyramid(), tri('plaster', { color: 0xffffff, scale: 3, snow: false })), tpoles = new Inst(G.cyl(5, 1), instStd), tf = [];
    const camp = [];
    for (let row = 0; row < 7; row++) for (let col = 0; col < 8; col++) { const x = -250 + col * 11 + rr.range(-1, 1), z = -52 + row * 20 + (col % 2) * 4 + rr.range(-1, 1); if (Math.hypot(x + 210, z - 30) < 14) continue; camp.push([x, z]); }
    camp.forEach(([x, z], i) => { const k = rr.range(0.9, 1.15), y = H(x, z); tents.add(x, y, z, 7 * k, 4.2 * k, 7 * k, rr.range(-0.1, 0.1), [0xd9c79a, 0xc9b080, 0xdccfa8, 0xb8a07a, 0xa89270, 0xd0bc8a][i % 6]); tpoles.add(x, y + 3.5 * k, z, 0.08, 1.2, 0.08, 0, 0x5a3f2a); if (i % 5 === 0) tf.push([x + 4.5, y + 0.6, z + 3]); });
    { const x = -214, z = 30, y = H(x, z); const cb = new Batch(); cb.box(cloth, x, y, z, 12, 3.4, 9, 0, 0xd9b04a); cb.pyramid(cloth, x, y + 3.4, z, 13, 4.6, 10, 0, 0xb8453a); for (const [dx, dz] of [[-6, -4.5], [6, -4.5], [-6, 4.5], [6, 4.5]]) cb.cyl(wood, x + dx, y, z + dz, 0.2, 4, { seg: 5, color: 0x5a3f2a }); cb.box(windowG, x + 6.05, y + 1.2, z, 0.1, 1.6, 1.4, 0); root.add(cb.build({})); }
    root.add(tents.build(), tpoles.build());
    const campFire = K.fires(tf.slice(0, 12), { size: 6, light: 0 }); root.add(campFire); ctx.onUpdate((dt, t) => campFire.userData.update(t));

    // ---- ships
    const ships = [], defs = [['cog', 18, 138, -12, 0.0], ['galley', 24, 168, 18, 0.5], ['cog', 16, 150, 46, 1.4], ['dhow', 14, 196, -50, 2.2], ['galley', 22, 212, 70, 3.1]];
    defs.forEach(([type, len, x, z, ph], i) => { const s = K.ship(type, { len, hull: [0x7a5636, 0x66472e, 0x84603c][i % 3], sail: [0xf0e4c4, 0xd9b858, 0xe8dab4, 0xcf9a4a, 0xf3e8cc][i] }); s.position.set(x, 0.2, z); s.rotation.y = i < 2 ? Math.PI / 2 : ph; root.add(s); ships.push({ s, x, z, ph, i }); });
    ctx.onUpdate((dt, t) => { for (const o of ships) { K.animateShip(o.s, t, o.ph); if (o.i >= 3) o.s.position.z = o.z + Math.sin(t * 0.05 + o.ph) * 30; } });

    // ---- life
    root.add(K.smoke(placed.filter((_, i) => i % 7 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 1, p.z]), { color: 0xc8baa0, size: 16, rise: 14, opacity: 0.2 }));
    root.add(K.smoke(Array.from({ length: 18 }, () => { const a = rr() * 6.28, r = rr.range(150, 300); const x = Math.cos(a) * r * 0.6 - 60, z = Math.sin(a) * r; return [x, H(x, z) + 1, z]; }), { color: 0xe6cf98, size: 60, rise: 7, opacity: 0.14, spread: 12, perStack: 5 }));
    root.add(K.banners([gW, gE, gN, gS].map(([x, z]) => ({ x: x + 2, y: 40, z, w: 3, h: 8, color: 0xb8872a, ry: 0.5 })).concat(pyrs.slice(0, 4).map((p) => ({ x: p.x, y: p.top + 10, z: p.z, w: 3, h: 7, color: 0xc89a2a, ry: 0.2 })))));
    const wk = K.walkers({ paths: [[gW, rot(0, 0), gE], [gN, rot(0, 0), gS], [rot(-62, -30), rot(-62, 30)], [rot(-90, 40), rot(-30, 36), rot(30, 36)], [[-250, 10], [-190, 30]]], heightAt, count: q.dens(60), rng: K.rng(8), colors: [0xe8c24a, 0xf0e4c4, 0xb8556a, 0x4f86a0, 0x8a6a3a] });
    root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const gulls = K.birds({ center: [150, 38, 0], radius: 70, count: q.dens(9), color: 0xf4f0e6, size: 1.2, spreadY: 12, seed: 3 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const cl = K.clouds({ y: 260, extent: 800, count: 8, opacity: 0.24, color: 0xf6e8c6 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));
    { const sc = new Inst(G.sphere(5), instStd), rs = K.rng(70);
      for (let i = 0; i < q.dens(90); i++) { const cx = rs.range(-330, 300), cz = rs.range(-250, 260); const [lx, lz] = unrot(cx, cz); if ((Math.abs(lx) < HX + 24 && Math.abs(lz) < HZ + 24) || cx > coastX(cz) - 12 || (cx < -160 && cx > -270 && cz > -70 && cz < 100)) continue;
        const nn = rs.int(3, 7); for (let j = 0; j < nn; j++) { const x = cx + rs.range(-6, 6), z = cz + rs.range(-6, 6), k = rs.range(0.5, 1.5); sc.add(x, H(x, z) - 0.1, z, k * 1.4, k * 0.6, k * 1.4, rs() * 3, [0x7f8a4a, 0x6b7a40, 0x8f9556, 0x97904f][j % 4]); } }
      root.add(sc.build()); }

    const lm = (lx, lz, r, dy = 0) => { const [x, z] = P(lx, lz); return { pos: [x, H(x, z) + dy, z], r }; };
    return {
      radius: 240, center: [30, 0, 0], minDistance: 18,
      hero: { pos: [236, 118, 190], target: [20, 8, -4] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn:  { top: 0x4c6aa0, horizon: 0xf2c48e, fog: 0xe6c096, fogD: 0.0013, sunC: 0xffc078, sunI: 3.1, hemiSky: 0xaab4d8, hemiGround: 0x6e5a3e, hemiI: 0.8 },
        day:   { top: 0x4f8ac4, horizon: 0xf3e0a8, fog: 0xead7a0, fogD: 0.00105, sunC: 0xffe9b4, sunI: 3.5, hemiSky: 0xc0d2e4, hemiGround: 0x8e7a48, hemiI: 0.98 },
        dusk:  { top: 0x3a3a70, horizon: 0xf2a05c, fog: 0xd69866, fogD: 0.0014, sunC: 0xff9448, sunI: 3.0, hemiSky: 0x8a8ac0, hemiGround: 0x54443a, hemiI: 0.72 },
        night: { top: 0x0b1438, horizon: 0x2f4670, fog: 0x213450, fogD: 0.0017, sunC: 0xa8c0ee, sunI: 1.3, hemiSky: 0x7488c0, hemiGround: 0x2e3038, hemiI: 1.35, exposure: 1.3 },
      } },
      landmarks: {
        'yellow-walls': lm(-30, -HZ, 14, 28), 'land-gate': lm(-HX, 0, 14, 38), 'sea-gate': lm(HX, 0, 16, 40), 'pyramid-hill': lm(-6, -4, 28, topA),
        'bed-slave-houses': lm(-52, 46, 16, 12), 'slave-market': lm(-58, 4, 18, 7), 'harbour': lm(150, 0, 28, 8), 'fishermens-quarter': lm(HX + 18, -76, 16, 8),
        'besiegers-plain': lm(-205, 0, 40, 6), 'lower-town': lm(30, 44, 28, 10),
      },
    };
  },
};
