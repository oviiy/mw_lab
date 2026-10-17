// Winterfell — reference scene. Book anchors: two concentric granite walls (inner taller, ~100 ft vs ~80 ft), a moat
// between them, Great Keep, First Keep, Broken Tower, Great Hall, godswood with hot pool, glass gardens, crypts, winter town.
// Everything else (exact plan, positions) is artistic interpretation — see content/winterfell.js.
// Visual language: cool granite with per-block tonal drift, steep slate roofs with snow caps, corbelled wall-walks with merlons and
// buttresses, timber/thatch winter town, frozen moat, warm hearth-light windows that bloom at dusk and night.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const R_IN = 58, R_OUT = 94;
const GODPOLY = [[-52, -12], [-48, -29], [-37, -42], [-22, -49], [-15, -33], [-10, -24], [-12, -7], [-24, 0], [-40, 1], [-52, -3]];
const ringPts = (r, n, seed, jitter = 0.06, sx = 1, sz = 1) => { const rr = K.rng(seed); return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, k = r * (1 + rr.range(-jitter, jitter)); return [Math.cos(a) * k * sx, Math.sin(a) * k * sz]; }); };
const rgb = (r, g, b) => (Math.min(255, (r * 255) | 0) << 16) | (Math.min(255, (g * 255) | 0) << 8) | Math.min(255, (b * 255) | 0);

export default {
  build(ctx) {
    const q = ctx.q, rng = K.rng(11), root = ctx.root;
    const vary = (lo = 0.8, warm = 0) => { const v = lo + rng() * (1 - lo); return rgb(v * (1 + warm * 0.04), v, v * (1 - warm * 0.05 + 0.03)); };

    // ---------------------------------------------------------------- terrain: plain, moat ditch, hills & Wolfswood west
    const moatR = (R_IN + R_OUT) / 2 + 2;
    const hot = [[-34, -16, 6]];
    const roadX = (z) => Math.sin(z * 0.02) * 6, roadDX = (z) => 0.12 * Math.cos(z * 0.02);
    const heightAt = (x, z) => {
      const r = Math.hypot(x, z);
      let h = (K.fbm(x * 0.01, z * 0.01, 3, 4) - 0.5) * 7 * K.smoothstep(100, 200, r) + (K.fbm(x * 0.03, z * 0.03, 2, 9) - 0.5) * 0.8;
      h += K.smoothstep(150, 330, r) * (14 + (K.fbm(x * 0.006, z * 0.006, 3, 2) - 0.2) * 55) * (x < 0 ? 1.4 : 0.8);
      const md = Math.abs(r - moatR); if (md < 9) h -= (1 - K.smoothstep(2.5, 9, md)) * 3.4;
      for (const [hx, hz, hr] of hot) { const d = Math.hypot(x - hx, z - hz); if (d < hr + 3) h -= (1 - K.smoothstep(hr - 2, hr + 3, d)) * 1.8; }
      return h;
    };
    const H = heightAt;
    const gnd = (x, z, rad) => Math.min(H(x, z), H(x + rad, z), H(x - rad, z), H(x, z + rad), H(x, z - rad));
    const cGrass = new THREE.Color(0x66726a), cDry = new THREE.Color(0x8a8467), cSnow = new THREE.Color(0xe2eaee), cRock = new THREE.Color(0x65676e), cMud = new THREE.Color(0x7a7164), cWet = new THREE.Color(0x474e4b), cRoad = new THREE.Color(0x7d7466), cFrost = new THREE.Color(0xb9c6c9), cMoss = new THREE.Color(0x4c5a3e), c = new THREE.Color();
    const colorAt = (x, z, h, s) => {
      const r = Math.hypot(x, z), n = K.fbm(x * 0.03, z * 0.03, 3, 5), n2 = K.fbm(x * 0.09, z * 0.09, 3, 8);
      c.copy(cGrass).lerp(cDry, K.smoothstep(0.42, 0.62, n));
      c.lerp(cFrost, K.clamp(h * 0.03 + 0.18 + (n2 - 0.5) * 0.7, 0, 0.6));
      c.lerp(cSnow, K.smoothstep(0.54, 0.68, n2) * 0.8);
      c.lerp(cRock, K.clamp(s * 3.2 - 0.15, 0, 0.85));
      const md = Math.abs(r - moatR); if (md < 11) c.lerp(cWet, (1 - K.smoothstep(4, 11, md)) * 0.75);
      if (K.pointInPoly(x, z, GODPOLY)) c.lerp(cMoss, 0.75);
      if (r < 57) c.lerp(cMud, 0.8 * (1 - K.smoothstep(46, 57, r)) * (0.65 + 0.35 * n2) + 0.18);
      if (z > 90 && z < 340) { const dd = Math.abs(x - roadX(z)); c.lerp(cRoad, (1 - K.smoothstep(3, 14, dd)) * 0.75); }
      return c;
    };
    root.add(K.terrain({ size: 800, seg: q.seg(140), heightAt, kind: 'rock', scale: 18, colorAt }));
    // outer skirt: coarse far-terrain that continues the same hills under the fog so no horizon edge shows
    const farH = (x, z) => { const e = Math.max(Math.abs(x), Math.abs(z)); const base = H(x, z); return base - 8 * (1 - K.smoothstep(366, 402, e)) + K.smoothstep(380, 900, e) * (30 + K.fbm(x * 0.004, z * 0.004, 3, 6) * 90); };
    root.add(K.terrain({ size: 3600, seg: q.seg(84), heightAt: farH, kind: 'rock', scale: 22, colorAt }));
    const wat = K.water({ w: 220, d: 220, seg: q.seg(140), level: -0.55, heightAt, deep: 0x152c3a, shallow: 0x3d5f6b, opacity: 0.92, choppy: 0.3, speed: 0.3 });
    root.add(wat); ctx.registerWater(wat);
    // moat ice shelves: pale translucent rings hugging both banks, ragged outer edge
    {
      const mk = (r0, r1, y, seed) => {
        const g = new THREE.RingGeometry(r0, r1, 120, 1); g.rotateX(-Math.PI / 2);
        const p = g.attributes.position, col = new Float32Array(p.count * 3), cc = new THREE.Color();
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z), a = Math.atan2(z, x), edge = Math.abs(r - r0) < Math.abs(r - r1) ? 0 : 1;
          const k = (K.fbm(a * 9, seed, 3, seed) - 0.5) * 3.2; const nr = edge ? r + k : r;
          p.setXYZ(i, Math.cos(a) * nr, y, Math.sin(a) * nr);
          cc.set(0xcfe2ec).lerp(new THREE.Color(0xf1f8fc), K.fbm(x * 0.2, z * 0.2, 2, seed)); col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b;
        }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const m = new THREE.Mesh(g, flat(0xffffff, { rough: 0.25, metal: 0.05, transparent: true, opacity: 0.86, flatShading: false })); m.renderOrder = 3; return m;
      };
      root.add(mk(moatR - 7.6, moatR - 3.6, -0.46, 3), mk(moatR + 3.6, moatR + 7.6, -0.46, 7));
    }

    // ---------------------------------------------------------------- materials
    const granite = tri('stone', { color: 0x9a9da4, scale: 3.8, bump: 0.7 }), graniteD = tri('stone', { color: 0x6c7077, scale: 3.8, bump: 0.7 }), graniteL = tri('stone', { color: 0xb1b4ba, scale: 3.8, bump: 0.7 });
    const slate = tri('slate', { color: 0x4f5a68, scale: 3.5 }), slateB = tri('slate', { color: 0x5b667a, scale: 3.5 });
    const wood = tri('wood', { color: 0x6d5037, scale: 4, snow: false }), woodD = tri('wood', { color: 0x453324, scale: 4, snow: false }), woodW = tri('wood', { color: 0x8b6f4e, scale: 4, snow: false });
    const thatch = tri('thatch', { color: 0xa8956a, scale: 5 }), plaster = tri('plaster', { color: 0xd6cdb8, scale: 5 });
    const snowM = tri('snow', { color: 0xf3f7fb, scale: 9, snow: false, rough: 0.85, bump: 0.35 });
    const dark = flat(0x14171c, { rough: 1 }), iron = flat(0x41464e, { metal: 0.5, rough: 0.55 }), moss = flat(0x4a5d47, { rough: 1 });
    const winW = glow(0xffc46b, 1.6), winO = glow(0xff9d4d, 1.5), winC = glow(0x9fc4ff, 0.5), unlit = flat(0x1b222c, { rough: 0.5, metal: 0.2 });
    const glass = flat(0xdff2f4, { rough: 0.1, metal: 0.15, transparent: true, opacity: 0.3, flatShading: false });
    const green = flat(0x4f7f45, { rough: 1 });
    const b = new Batch(), gb = new Batch(), lampB = new Batch();
    // night dimming for self-lit sprites (smoke, clouds, falls): the kit's glow materials expose the host's night level
    const nightProbe = glow(0xffffff, 1), dimmers = [], night = () => K.clamp((nightProbe.color.r - 0.14) / 1.25, 0, 1);
    const dimmed = (col, k = 0.8) => { const base = col.clone(); dimmers.push((n) => col.copy(base).multiplyScalar(1 - k * n)); };
    const dimSmoke = (p) => { dimmed(p.material.uniforms.uColor.value); return p; }, dimClouds = (g) => { dimmed(g.children[0].material.color); return g; };
    ctx.onUpdate(() => { const n = night(); for (const f of dimmers) f(n); });
    const ribbonUp = (bt, mat, pts, width, hAt, lift = 0.15, color = 0xffffff, uvScale = 0.1) => { // kit ribbon() winds face-down (culled); this one faces up
      const g = bt._g(mat), cc = new THREE.Color(color); let dist = 0; const L = [], R = [];
      for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b2 = pts[Math.min(pts.length - 1, i + 1)]; let dx = b2[0] - a[0], dz = b2[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; const nx = -dz * width / 2, nz = dx * width / 2; if (i) dist += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push([pts[i][0] + nx, pts[i][1] + nz, dist]); R.push([pts[i][0] - nx, pts[i][1] - nz, dist]); }
      const push = (p, u) => { g.pos.push(p[0], hAt(p[0], p[1]) + lift, p[1]); g.nor.push(0, 1, 0); g.uv.push(u, p[2] * uvScale); g.col.push(cc.r, cc.g, cc.b); };
      for (let i = 0; i < pts.length - 1; i++) { push(L[i], 0); push(L[i + 1], 0); push(R[i], 1); push(R[i], 1); push(L[i + 1], 0); push(R[i + 1], 1); }
    };
    const rot = (x, z, ry) => { const cs = Math.cos(ry), sn = Math.sin(ry); return (lx, lz) => [x + lx * cs + lz * sn, z - lx * sn + lz * cs]; };

    // ---- reusable pieces -----------------------------------------------------------------------------------------------
    const chimneys = []; // smoke emitters
    const window_ = (f, ry, lx, lz, y, w, h, lit = 1, mat = winW) => { const [x, z] = f(lx, lz); b.box(dark, x, y - 0.25, z, w + 0.5, h + 0.5, 0.25, ry); b.box(lit ? mat : unlit, x, y, z, w, h, 0.34, ry); };
    const snowRoofGable = (x, y, z, w, rh, d, ry, cov = 0.9) => { b.prism(snowM, x, y + rh * (1 - cov) + 0.14, z, w + 0.35, rh, d * cov, ry); };
    const chimney = (f, ry, lx, lz, y, hh, matS = graniteD, smoke = true) => { const [x, z] = f(lx, lz); b.box(matS, x, y, z, 1.3, hh, 1.3, ry, vary(0.8)); b.box(graniteD, x, y + hh, z, 1.8, 0.35, 1.8, ry); b.box(snowM, x, y + hh + 0.35, z, 1.5, 0.18, 1.5, ry); if (smoke) chimneys.push([x, y + hh + 1, z]); };
    // building with plinth, walls, optional timber frame, steep roof + snow, chimneys, windows, door. ridge along local X.
    const bldg = (x, z, o) => {
      const { w, d, h, ry = 0, wall = plaster, wcol = 0xffffff, roof = slate, rcol = 0xffffff, rh = Math.min(w, d) * 0.55, base = graniteD, beams = false, chim = 0, lit = 0.6, doorX = null, smoke = true, tall = false } = o;
      const f = rot(x, z, ry), y = o.y ?? gnd(x, z, Math.max(w, d) * 0.5);
      b.box(base, x, y - 1.6, z, w + 0.5, 1.6 + 0.9, d + 0.5, ry, vary(0.78));
      b.box(wall, x, y - 1.2, z, w, h + 1.2, d, ry, wcol);
      if (beams) {
        b.box(woodD, x, y + h * 0.5, z, w + 0.14, 0.26, d + 0.14, ry); b.box(woodD, x, y + h - 0.3, z, w + 0.2, 0.34, d + 0.2, ry);
        for (const sx of [-1, 0, 1]) for (const sz of [-1, 1]) { const [px, pz] = f(sx * (w / 2 - 0.15), sz * (d / 2 + 0.02)); b.box(woodD, px, y + 0.9, pz, 0.28, h - 0.9, 0.3, ry); }
      }
      if (tall) b.box(wall, x, y + h, z, w + 0.7, 0.5, d + 0.7, ry, wcol);
      const yt = y + h + (tall ? 0.5 : 0);
      b.prism(roof, x, yt, z, w + 1.4, rh, d + 1.3, ry, rcol); snowRoofGable(x, yt, z, w + 1.4, rh, d + 1.3, ry, 0.66 + rng() * 0.26);
      for (let i = 0; i < chim; i++) chimney(f, ry, (i ? -1 : 1) * (w / 2 - 1.2), 0, yt - 1, rh + 1.4, wall === plaster ? graniteD : wall, smoke);
      const nW = Math.max(1, Math.round(w / 4.2));
      for (const sz of [-1, 1]) for (let i = 0; i < nW; i++) { const lx = (i - (nW - 1) / 2) * (w / nW); if (doorX !== null && sz === 1 && Math.abs(lx - doorX) < 1.4) continue; window_(f, ry, lx, sz * (d / 2 + 0.04), y + h * 0.5, 0.9, 1.2, rng() < lit ? 1 : 0, rng() < 0.7 ? winW : winO); }
      if (doorX !== null) { const [px, pz] = f(doorX, d / 2 + 0.06); b.box(woodD, px, y, pz, 1.5, 2.3, 0.3, ry); }
      return { y, f };
    };
    // round / squared tower with plinth, courses, corbels, roof; roof: cone | flat | none
    const tower2 = (x, z, o) => {
      const { r = 4, h = 24, roof = 'cone', roofH = r * 3, mat = granite, seg = 12, y = gnd(x, z, r), col = vary(0.86), win = 3, taper = 0.9, snow = true, rcol = vary(0.8) } = o;
      b.cyl(graniteD, x, y - 3, z, r + 0.8, 5.5, { top: (r + 0.2) / (r + 0.8), seg, color: vary(0.85) });
      b.cyl(mat, x, y + 2.4, z, r + 0.15, h - 2.4, { top: taper * r / (r + 0.15), seg, color: col });
      for (let k = 1; k <= 2; k++) { const yy = y + (h * k) / 3, rr = r * (1 - (1 - taper) * (k / 3)) + 0.28; b.cyl(graniteD, x, yy, z, rr, 0.5, { top: 1, seg, color: vary(0.85) }); }
      const rt = r * taper;
      for (let i = 0; i < win; i++) { const a = (i * 2.4 + x * 0.3) % (Math.PI * 2), yy = y + h * (0.28 + 0.2 * i), rr = r * (1 - (1 - taper) * ((yy - y) / h)) + 0.12; b.box(rng() < 0.7 ? winO : unlit, x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr, 0.5, 1.7, 0.22, -a + Math.PI / 2); }
      b.cyl(graniteD, x, y + h - 1.3, z, rt + 0.2, 1.3, { top: 1.2, seg, color: vary(0.8) });
      const rr = rt * 1.2 + 0.1;
      if (roof === 'cone') {
        b.cone(slate, x, y + h, z, rr + 0.5, roofH, { seg, color: rcol });
        if (snow) b.cone(snowM, x, y + h + roofH * 0.42, z, (rr + 0.5) * 0.58 * 1.1, roofH * 0.58 + 0.18, { seg });
        b.cyl(iron, x, y + h + roofH, z, 0.1, 2.4, { seg: 4 });
      } else if (roof === 'flat') {
        b.cyl(graniteD, x, y + h, z, rr + 0.35, 0.7, { top: 1, seg, color: vary(0.8) });
        const n = Math.max(7, Math.round((Math.PI * 2 * rr) / 2.3));
        for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; b.box(granite, x + Math.cos(a) * (rr + 0.1), y + h + 0.7, z + Math.sin(a) * (rr + 0.1), 1.2, 1.4, 0.7, -a + Math.PI / 2, vary(0.82)); }
        b.cyl(snowM, x, y + h + 0.7, z, rr - 0.5, 0.25, { top: 1, seg });
      }
      return y;
    };
    // square tower; roof: pyr | gable | flat | broken
    const sqTower = (x, z, o) => {
      const { w = 9, d = w, h = 28, ry = 0, roof = 'pyr', roofH = w * 0.95, mat = granite, y = gnd(x, z, w * 0.6), col = vary(0.88), lit = true } = o;
      const f = rot(x, z, ry);
      b.box(graniteD, x, y - 3, z, w + 1.2, 5.4, d + 1.2, ry, vary(0.85));
      b.box(mat, x, y - 1.2, z, w, h + 1.2, d, ry, col);
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const [px, pz] = f(sx * (w / 2), sz * (d / 2)); b.box(graniteL, px, y, pz, 1.1, h, 1.1, ry, vary(0.84)); }
      for (const k of [0.34, 0.68]) b.box(graniteD, x, y + h * k, z, w + 0.5, 0.5, d + 0.5, ry, vary(0.85));
      const nw = Math.max(2, Math.floor(h / 8));
      for (let i = 1; i <= nw; i++) for (const s of [-1, 1]) { const lx = i % 2 ? -w * 0.18 : w * 0.18; window_(f, ry, lx, s * (d / 2 + 0.05), y + (h * i) / (nw + 1), 0.8, 1.7, lit && rng() < 0.55 ? 1 : 0, winO); }
      b.box(graniteD, x, y + h - 1.0, z, w + 1.3, 1.0, d + 1.3, ry, vary(0.8));
      const yt = y + h;
      if (roof === 'pyr') { b.pyramid(slate, x, yt, z, w + 1.4, roofH, d + 1.4, ry, vary(0.8)); b.pyramid(snowM, x, yt + roofH * 0.4, z, (w + 1.4) * 0.6 * 1.08, roofH * 0.6 + 0.2, (d + 1.4) * 0.6 * 1.08, ry); b.cyl(iron, x, yt + roofH, z, 0.1, 2.2, { seg: 4 }); }
      else if (roof === 'gable') { b.prism(slate, x, yt, z, w + 1.4, roofH, d + 1.4, ry, vary(0.8)); snowRoofGable(x, yt, z, w + 1.4, roofH, d + 1.4, ry); }
      else if (roof === 'flat') {
        b.box(graniteD, x, yt, z, w + 1.2, 0.6, d + 1.2, ry);
        for (const [ox, oz, sx, sz] of [[0, d / 2 + 0.4, w * 0.62, 0.7], [0, -d / 2 - 0.4, w * 0.62, 0.7], [w / 2 + 0.4, 0, 0.7, d * 0.62], [-w / 2 - 0.4, 0, 0.7, d * 0.62]]) { const [px, pz] = f(ox, oz); b.box(granite, px, yt + 0.6, pz, sx, 1.5, sz, ry, vary(0.84)); }
        b.box(snowM, x, yt + 0.6, z, w - 0.2, 0.25, d - 0.2, ry);
      }
      return y;
    };
    // ring wall: batter plinth, body, corbelled wall-walk, outward merlons, inner parapet, buttresses, arrow slits, snow on the walk
    const wallRing = (pts, o) => {
      const { h, t, top, seg = 12, outer = false } = o, n = pts.length, drifts = [];
      for (let i = 0; i < n; i++) {
        const A = pts[i], B = pts[(i + 1) % n], dx = B[0] - A[0], dz = B[1] - A[1], len0 = Math.hypot(dx, dz), steps = Math.max(1, Math.ceil(len0 / seg));
        const ry = K.headingX(dx, dz), px = -dz / len0, pz = dx / len0;
        for (let s = 0; s < steps; s++) {
          const t0 = s / steps, t1 = (s + 1) / steps, x0 = A[0] + dx * t0, z0 = A[1] + dz * t0, x1 = A[0] + dx * t1, z1 = A[1] + dz * t1;
          const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, len = Math.hypot(x1 - x0, z1 - z0), g = Math.min(H(x0, z0), H(x1, z1), H(cx, cz));
          const o_ = px * cx + pz * cz > 0 ? 1 : -1, nx = px * o_, nz = pz * o_; // outward (away from centre)
          const f = rot(cx, cz, ry), col = vary(0.82), flipZ = o_;
          b.box(graniteD, cx, g - 3, cz, len + 0.9, 5.2, t + 1.5, ry, vary(0.84)); // plinth
          b.box(granite, cx, g - 3, cz, len + 0.7, top - g + 3, t, ry, col);
          b.box(graniteD, cx, top - 0.2, cz, len + 0.7, 0.9, t + 0.9, ry, vary(0.78)); // corbel / cap
          const wy = top + 0.7;
          b.box(snowM, cx, wy, cz, len + 0.4, 0.22, t - 1.1, ry);
          // outer merlons + inner parapet
          const nm = Math.max(2, Math.round(len / 2.6));
          for (let k = 0; k < nm; k++) { const [mx, mz] = f(-len / 2 + (k + 0.5) * (len / nm), flipZ * (t / 2 + 0.05)); b.box(granite, mx, wy, mz, 1.5, 1.7, 0.85, ry, vary(0.84)); b.box(snowM, mx, wy + 1.7, mz, 1.6, 0.18, 0.95, ry); }
          { const [mx, mz] = f(0, -flipZ * (t / 2 - 0.1)); b.box(granite, mx, wy, mz, len + 0.4, 0.8, 0.5, ry, vary(0.84)); b.box(snowM, mx, wy + 0.8, mz, len + 0.4, 0.16, 0.6, ry); }
          // buttress
          if (len > 6) { const [bx, bz] = f(0, flipZ * (t / 2 + 0.7)); b.box(graniteD, bx, g - 2, bz, 2.4, 4.4, 1.7, ry, vary(0.84)); b.box(granite, bx, g + 2.4, bz, 1.9, (top - g) - 2.4, 1.1, ry, vary(0.86)); b.box(snowM, bx, top - 0.3, bz, 2.0, 0.2, 1.2, ry); }
          for (const u of [-0.3, 0.3]) { const [sx_, sz_] = f(u * len, flipZ * (t / 2 + 0.02)); b.box(dark, sx_, top - h * 0.55, sz_, 0.35, 2.2, 0.2, ry); }
          drifts.push([cx + nx * (t / 2 + 1.0), g, cz + nz * (t / 2 + 1.0), len, ry]);
        }
        // pier at the vertex
        b.box(graniteL, A[0], H(A[0], A[1]) - 3, A[1], 3.2, top - H(A[0], A[1]) + 3 + 0.9, 3.2, ry + 0.4, vary(0.84)); b.box(snowM, A[0], top + 0.9, A[1], 3.3, 0.2, 3.3, ry + 0.4);
      }
      return drifts;
    };

    // ---------------------------------------------------------------- walls, towers, gates, bridges
    const TIN = 17.5, TOUT = 13.5; // wall-top heights (constant ring tops keep the wall-walks level)
    const inner = ringPts(R_IN, 22, 3, 0.05), outer = ringPts(R_OUT, 28, 5, 0.04);
    const dIn = wallRing(inner, { h: 17, t: 4, top: TIN }), dOut = wallRing(outer, { h: 13, t: 3.6, top: TOUT, outer: true });
    inner.forEach(([x, z], i) => { if (i % 3 === 0 && Math.abs(x) > 12) { const v = i % 2; tower2(x, z, { r: 4.2 + (i % 4) * 0.25, h: 25 + (i % 5) * 1.8, roof: i === 9 || i === 15 ? 'cone' : 'flat', roofH: 10 + (i % 3) * 2.2, win: 3 }); } });
    outer.forEach(([x, z], i) => { if (i % 4 === 0 && Math.abs(x) > 14) tower2(x, z, { r: 3.4 + (i % 3) * 0.3, h: 18 + (i % 4) * 1.2, roof: 'flat', roofH: 8, win: 2, seg: 10 }); });
    // gatehouses (passage along Z): flanking towers, machicolated block, dark arched recess, timber doors, lanterns
    const gatehouse = (gx, gz, { w = 20, d = 11, top = 24, tr = 4.4, troof = 'cone' }) => {
      const y = H(gx, gz);
      b.box(graniteD, gx, y - 3, gz, w + 2, 5.4, d + 1.4, 0);
      b.box(granite, gx, y - 3, gz, w, top - y + 3, d, 0, vary(0.88));
      for (const sgn of [-1, 1]) tower2(gx + sgn * (w / 2 + 0.2), gz, { r: tr, h: top + 6, roof: troof, roofH: tr * 3, y, seg: 12, win: 3, rcol: vary(0.78) });
      b.box(graniteD, gx, top - 0.8, gz, w - 2, 1.0, d + 1.8, 0, vary(0.8)); // machicolation corbels
      for (let k = -3; k <= 3; k++) for (const s of [-1, 1]) b.box(granite, gx + k * 2.4, top + 0.2, gz + s * (d / 2 + 0.7), 1.4, 1.6, 0.8, 0, vary(0.84)), b.box(snowM, gx + k * 2.4, top + 1.8, gz + s * (d / 2 + 0.7), 1.5, 0.16, 0.9, 0);
      b.box(snowM, gx, top + 0.2, gz, w - 3, 0.22, d - 1.2, 0);
      for (const s of [-1, 1]) {
        b.box(dark, gx, y, gz + s * (d / 2 + 0.05), 5.4, 6.6, 0.3, 0); b.box(graniteL, gx, y + 6.6, gz + s * (d / 2 + 0.15), 7.0, 0.9, 0.5, 0, vary(0.9));
        for (const sx of [-1, 1]) { b.box(graniteL, gx + sx * 3.1, y, gz + s * (d / 2 + 0.2), 0.9, 7.2, 0.6, 0, vary(0.9)); b.box(woodD, gx + sx * 1.35, y, gz + s * (d / 2 + 0.2), 2.5, 5.6, 0.25, 0); lampB.box(winO, gx + sx * 4.2, y + 4.2, gz + s * (d / 2 + 0.45), 0.5, 0.8, 0.5, 0); }
        for (let k = -2; k <= 2; k++) b.box(iron, gx + k * 0.95, y + 0.4, gz + s * (d / 2 - 0.5), 0.12, 6, 0.12, 0);
        window_(rot(gx, gz, 0), 0, 0, s * (d / 2 + 0.05), y + 11, 1.0, 2.0, 1, winW);
      }
    };
    for (const sg of [1, -1]) {
      gatehouse(0, sg * R_OUT, { w: 20, d: 10, top: 21, tr: 4.4 });
      gatehouse(0, sg * R_IN, { w: 16, d: 8, top: 25, tr: 3.9, troof: 'flat' });
    }
    // drawbridges: timber deck on stone abutments, rails, chain posts
    for (const sg of [1, -1]) {
      const z0 = sg * (moatR - 11.5), z1 = sg * (moatR + 11.5), zc = (z0 + z1) / 2, L = Math.abs(z1 - z0);
      b.box(woodW, 0, 0.0, zc, 6.0, 0.5, L, 0, 0xffffff); b.box(woodD, 0, -0.3, zc, 6.4, 0.35, L - 0.6, 0);
      for (const sx of [-1, 1]) { b.box(woodD, sx * 3.0, 0.3, zc, 0.35, 1.0, L, 0); for (let k = 0; k <= 6; k++) b.box(woodD, sx * 3.0, -3.5, zc + (k / 6 - 0.5) * (L - 3), 0.5, 4.2, 0.5, 0); }
      for (const e of [-1, 1]) b.box(graniteD, 0, -3, zc + e * (L / 2 - 0.2), 7.2, 3.6, 2.2, 0, vary(0.8));
    }
    // road through the ward: gate -> keep
    const cobble = tri('cobble', { color: 0xc4beb2, scale: 7, snow: false });
    ribbonUp(b, cobble, [[0, R_OUT + 12], [0, R_OUT], [0, moatR], [0, R_IN + 2], [0, R_IN - 6], [2, 40], [8, 24]], 6.5, H, 0.16, vary(0.8), 0.1);
    ribbonUp(b, cobble, [[0, -R_OUT - 8], [0, -R_OUT], [0, -moatR], [0, -R_IN - 2], [0, -R_IN + 6], [0, -44]], 6.5, H, 0.16, vary(0.8), 0.1);
    ribbonUp(b, cobble, [[-4, 24], [-14, 16], [-24, 28], [-36, 36]], 4.5, H, 0.16, 0xaaaaaa, 0.1);

    // ---------------------------------------------------------------- inner ward
    // Great Keep: massed block, stepped upper stage under a steep slate roof, corner turrets of varied height, bell tower
    {
      const kx = 10, kz = -4, y = H(kx, kz), W = 30, D = 22, HH = 24, f = rot(kx, kz, 0);
      b.box(graniteD, kx, y - 3, kz, W + 2.4, 5.4, D + 2.4, 0, vary(0.85));
      b.box(granite, kx, y - 1.2, kz, W, HH + 1.2, D, 0, vary(0.9));
      for (const k of [0.3, 0.62]) b.box(graniteD, kx, y + HH * k, kz, W + 0.6, 0.55, D + 0.6, 0, vary(0.84));
      b.box(graniteD, kx, y + HH - 0.8, kz, W + 1.8, 1.0, D + 1.8, 0, vary(0.78));
      b.box(snowM, kx, y + HH + 0.2, kz, W + 1.6, 0.22, D + 1.6, 0);
      // upper stage + big roof
      b.box(graniteL, kx, y + HH + 0.2, kz, 22, 8, 14, 0, vary(0.9));
      b.box(graniteD, kx, y + HH + 8, kz, 23, 0.7, 15, 0);
      b.prism(slateB, kx, y + HH + 8.7, kz, 26, 10, 18, 0, vary(0.82)); snowRoofGable(kx, y + HH + 8.7, kz, 26, 10, 18, 0);
      chimney(f, 0, -9, -3, y + HH + 8, 12.5, graniteD); chimney(f, 0, 9, 3, y + HH + 8, 12.5, graniteD); chimney(f, 0, 0, -3, y + HH + 8, 13.6, graniteD);
      for (let i = 0; i < 4; i++) { window_(f, 0, -7 + i * 4.6, 7.05, y + HH + 3.2, 1.0, 2.4, 1, winW); window_(f, 0, -7 + i * 4.6, -7.05, y + HH + 3.2, 1.0, 2.4, i % 2, winO); }
      // turrets
      [[1, 1, 34, 8.5], [-1, 1, 30, 7.5], [1, -1, 29, 7], [-1, -1, 33, 8]].forEach(([sx, sz, hh, rh], i) => { const [tx, tz] = f(sx * (W / 2), sz * (D / 2)); tower2(tx, tz, { r: 3.6, h: hh, roof: i === 0 || i === 3 ? 'cone' : 'flat', roofH: rh + 3, y, seg: 12, win: 3 }); });
      // facade windows (south & north) and east/west
      for (let r_ = 0; r_ < 3; r_++) for (let i = -3; i <= 3; i++) { window_(f, 0, i * 3.7, D / 2 + 0.06, y + 5 + r_ * 6.2, 1.1, 2.6, rng() < 0.66 ? 1 : 0, rng() < 0.6 ? winW : winO); if ((i + r_) % 2 === 0) window_(f, 0, i * 3.7, -D / 2 - 0.06, y + 5 + r_ * 6.2, 1.1, 2.6, rng() < 0.4 ? 1 : 0, winO); }
      // doorway + steps (south face toward the ward)
      b.box(dark, kx, y, kz + D / 2 + 0.05, 3.6, 4.6, 0.4, 0); b.box(graniteL, kx, y + 4.6, kz + D / 2 + 0.2, 4.8, 0.9, 0.6, 0); b.box(woodD, kx - 0.9, y, kz + D / 2 + 0.2, 1.7, 4.0, 0.25, 0); b.box(woodD, kx + 0.9, y, kz + D / 2 + 0.2, 1.7, 4.0, 0.25, 0);
      b.box(graniteD, kx, y, kz + D / 2 + 1.6, 6, 0.5, 2.6, 0); b.box(graniteD, kx, y, kz + D / 2 + 3.2, 7, 0.3, 2.2, 0);
      // bell tower (belfry with open arches)
      const bx = 30.5, bz = -4, by = H(bx, bz);
      tower2(bx, bz, { r: 3.8, h: 38, roof: 'none', y: by, seg: 12, win: 3, taper: 0.88 });
      b.cyl(granite, bx, by + 38, bz, 3.5, 7.5, { top: 1, seg: 12, color: vary(0.9) });
      for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.78; b.box(dark, bx + Math.cos(a) * 3.45, by + 41, bz + Math.sin(a) * 3.45, 1.5, 3.6, 0.3, -a + Math.PI / 2); b.box(winO, bx + Math.cos(a) * 3.3, by + 42, bz + Math.sin(a) * 3.3, 0.5, 1.4, 0.3, -a + Math.PI / 2); }
      b.cyl(graniteD, bx, by + 45.5, bz, 4.4, 0.8, { top: 1, seg: 12 });
      b.cone(slate, bx, by + 46.3, bz, 4.5, 15, { seg: 12, color: vary(0.8) }); b.cone(snowM, bx, by + 46.3 + 6.4, bz, 4.5 * 0.57 * 1.1, 8.8 + 0.18, { seg: 12 }); b.cyl(iron, bx, by + 61.3, bz, 0.12, 3, { seg: 4 });
    }
    // Great Hall: long steep-roofed hall, buttresses between tall lit windows, porch, louvre cupola, chimney
    {
      const hx = 6, hz = 25, y = H(hx, hz), W = 42, D = 15, HH = 11.5, f = rot(hx, hz, 0);
      b.box(graniteD, hx, y - 3, hz, W + 1.6, 4.8, D + 1.6, 0, vary(0.85));
      b.box(granite, hx, y - 1.2, hz, W, HH + 1.2, D, 0, vary(0.9));
      b.box(graniteD, hx, y + HH - 0.6, hz, W + 1.0, 0.9, D + 1.0, 0, vary(0.8));
      b.prism(slate, hx, y + HH + 0.3, hz, W + 2.4, 9.5, D + 2.2, 0, vary(0.82)); snowRoofGable(hx, y + HH + 0.3, hz, W + 2.4, 9.5, D + 2.2, 0);
      for (let i = 0; i <= 7; i++) for (const s of [-1, 1]) { const [px, pz] = f(-W / 2 + i * (W / 7), s * (D / 2 + 0.55)); b.box(graniteD, px, y - 1, pz, 1.5, HH + 0.4, 1.2, 0, vary(0.84)); b.box(snowM, px, y + HH - 0.6, pz, 1.6, 0.18, 1.3, 0); }
      for (let i = 0; i < 7; i++) { const lx = -W / 2 + (i + 0.5) * (W / 7); for (const s of [-1, 1]) { const [px, pz] = f(lx, s * (D / 2 + 0.05)); b.box(dark, px, y + 2.2, pz, 2.0, 7.2, 0.25, 0); b.box(i % 5 === 3 ? unlit : winW, px, y + 2.5, pz, 1.5, 6.4, 0.34, 0); b.box(dark, px, y + 5.4, pz, 1.7, 0.2, 0.4, 0); } }
      // porch (south face)
      b.box(granite, hx, y - 1, hz + D / 2 + 2.2, 8, 7.5, 5, 0, vary(0.9)); b.prism(slate, hx, y + 6.5, hz + D / 2 + 2.2, 6.4, 4.2, 9.2, Math.PI / 2, vary(0.8));
      b.prism(snowM, hx, y + 6.5 + 0.35, hz + D / 2 + 2.2, 6.0, 4.2, 8.9, Math.PI / 2);
      b.box(dark, hx, y, hz + D / 2 + 4.8, 3.6, 4.6, 0.3, 0); b.box(woodD, hx - 0.9, y, hz + D / 2 + 4.95, 1.7, 4.0, 0.25, 0); b.box(woodD, hx + 0.9, y, hz + D / 2 + 4.95, 1.7, 4.0, 0.25, 0); b.box(winO, hx, y + 5.2, hz + D / 2 + 4.9, 0.9, 1.2, 0.3, 0);
      // louvre cupola on the ridge + chimney at the gable end
      b.box(wood, hx - 8, y + HH + 9.5, hz, 3.2, 2.6, 2.4, 0); b.pyramid(slate, hx - 8, y + HH + 12, hz, 4.2, 2.6, 3.4, 0); for (const s of [-1, 1]) b.box(winO, hx - 8, y + HH + 10.1, hz + s * 1.25, 1.6, 1.2, 0.2, 0);
      chimney(f, 0, W / 2 - 3, 0, y + HH + 4, 7.5, graniteD); chimney(f, 0, -W / 2 + 3, 0, y + HH + 4, 7.5, graniteD);
    }
    // First Keep: old squat round drum, weathered darker stone, mossy courses, gargoyles
    {
      const x = -6, z = -42, y = H(x, z);
      tower2(x, z, { r: 9.5, h: 22, roof: 'none', y, seg: 18, taper: 0.9, win: 2, mat: graniteD, col: vary(0.9), snow: false });
      b.cyl(graniteD, x, y + 21.2, z, 9.9, 1.6, { top: 1.14, seg: 18 });
      for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; b.box(graniteD, x + Math.cos(a) * 10.6, y + 22.8, z + Math.sin(a) * 10.6, 1.8, 1.8, 1.1, -a + Math.PI / 2, vary(0.7)); b.box(snowM, x + Math.cos(a) * 10.6, y + 24.6, z + Math.sin(a) * 10.6, 1.9, 0.18, 1.2, -a + Math.PI / 2); if (i % 2 === 0) { const ty = i % 4 ? y + 19.4 : y + 13.2, rr0 = i % 4 ? 10.3 : 9.6; b.box(graniteD, x + Math.cos(a) * (rr0 + 0.4), ty, z + Math.sin(a) * (rr0 + 0.4), 1.3, 1.3, 1.8, -a + Math.PI / 2, 0x6a6a6a); b.box(graniteD, x + Math.cos(a) * (rr0 + 1.6), ty + 0.8, z + Math.sin(a) * (rr0 + 1.6), 0.9, 0.9, 1.0, -a + Math.PI / 2, 0x5e5e5e, 0.35); b.box(graniteD, x + Math.cos(a) * (rr0 + 1.1), ty + 1.3, z + Math.sin(a) * (rr0 + 1.1), 1.6, 0.25, 0.5, -a + Math.PI / 2, 0x5e5e5e); } }
      b.cyl(snowM, x, y + 22.8, z, 8.8, 0.3, { top: 1, seg: 18 });
      for (let i = 0; i < 6; i++) { const a = i * 1.1; b.box(moss, x + Math.cos(a) * 9.7, y + 1.5 + (i % 3), z + Math.sin(a) * 9.7, 2.4, 1.2, 0.4, -a + Math.PI / 2, 0xffffff); }
    }
    // Broken Tower: tall square shaft with the top snapped, jagged stumps and scorch
    {
      const x = 38, z = -22, y = H(x, z);
      sqTower(x, z, { w: 8.4, h: 36, roof: 'none', y, mat: graniteD, col: vary(0.85) });
      b.box(graniteD, x - 1.5, y + 36, z - 0.5, 4.5, 6, 8.4, 0.05, vary(0.8)); b.box(graniteD, x + 2.6, y + 36, z - 2.2, 3.2, 3.4, 4.4, -0.15, vary(0.8)); b.box(graniteD, x + 0.8, y + 36, z + 3.3, 2.4, 2.2, 1.8, 0.3, vary(0.8));
      b.box(snowM, x - 1.5, y + 42, z - 0.5, 4.6, 0.25, 8.5, 0.05); b.box(dark, x + 4.25, y + 28, z - 1, 0.2, 7.5, 2.4, 0); b.box(flat(0x2b2b30), x - 1.5, y + 32, z + 4.28, 3, 5, 0.18, 0.05);
    }
    // Library tower + covered gallery to the armoury
    {
      const x = -40, z = 8, y = H(x, z);
      sqTower(x, z, { w: 9, h: 26, roof: 'pyr', roofH: 11, y, mat: granite });
      const gy = y + 11;
      b.box(wood, -40, gy, 20.5, 3.8, 4.2, 23, 0, vary(0.85)); b.prism(slate, -40, gy + 4.2, 20.5, 5.0, 2.4, 24, 0); b.prism(snowM, -40, gy + 4.5, 20.5, 5.2, 2.4, 23.2, 0);
      for (let i = 0; i < 5; i++) { b.box(woodD, -40, gy - 3, 11 + i * 5.2, 0.7, 3.2, 0.7, 0); window_(rot(-40, 20.5, Math.PI / 2), Math.PI / 2, -9 + i * 4.5, 1.92, gy + 1.6, 0.9, 1.1, i % 2, winO); }
      bldg(-40, 34, { w: 12, d: 10, h: 8, wall: granite, wcol: vary(0.9), roof: slate, rh: 6.5, chim: 1, lit: 0.8 }); // armoury
    }
    // service buildings: stables, kennels, kitchens, forge
    bldg(-12, 45, { w: 22, d: 9, h: 5.5, wall: plaster, wcol: 0xcabf9f, roof: thatch, rh: 5.5, beams: true, chim: 0, lit: 0.5, doorX: -4 });
    bldg(-33, 41, { w: 12, d: 9, h: 5.5, wall: wood, wcol: vary(0.9, 1), roof: thatch, rh: 5, chim: 1, lit: 0.5, doorX: 0 });
    bldg(28, 38, { w: 15, d: 11, h: 7, wall: granite, wcol: vary(0.9), roof: slate, rh: 6.4, chim: 2, lit: 0.9, doorX: 0 }); // kitchens
    bldg(44, 22, { w: 11, d: 9, h: 6, wall: granite, wcol: vary(0.84), roof: slate, rh: 5, chim: 1, ry: 0.15, lit: 0.9 }); // forge
    b.box(graniteD, 40, H(40, 22), 28.8, 5, 4, 3, 0); // forge lean-to
    // Glass gardens: ironwork glasshouses against the keep's east flank, green beds + warm lamps inside
    for (let i = 0; i < 3; i++) {
      const gx = 37, gz = 8 + i * 10.5, y = H(gx, gz);
      b.box(graniteD, gx, y - 1, gz, 5.2, 2.0, 9.6, 0, vary(0.84));
      gb.box(glass, gx, y + 1, gz, 4.6, 5, 9, 0, 0xcfe8ea); gb.prism(glass, gx, y + 6, gz, 9, 2.2, 4.6, Math.PI / 2, 0xcfe8ea);
      b.box(green, gx, y + 1, gz, 3.6, 0.9, 7.6, 0); b.box(flat(0x6a8f50, { rough: 1 }), gx, y + 1.9, gz, 1.6, 0.9, 5.6, 0);
      for (let k = 0; k <= 6; k++) { const zz = gz - 4.5 + k * 1.5; for (const sx of [-1, 1]) b.box(iron, gx + sx * 2.3, y + 1, zz, 0.12, 5, 0.12, 0); b.box(iron, gx, y + 6.0, zz, 4.6, 0.1, 0.1, 0, 0xffffff, 0, 0.0); }
      b.box(iron, gx, y + 8.2, gz, 0.15, 0.15, 9.2, 0);
      lampB.box(winW, gx, y + 4.2, gz, 0.5, 0.5, 0.5, 0); lampB.box(winW, gx, y + 4.2, gz + 3, 0.4, 0.4, 0.4, 0); lampB.box(winW, gx, y + 4.2, gz - 3, 0.4, 0.4, 0.4, 0);
    }
    // training yard: dummies, weapon rack, fence, paved floor
    {
      const wb_ = tri('cobble', { color: 0x7d7a74, scale: 6 });
      b.box(wb_, -20, H(-20, 22) - 0.1, 22, 22, 0.3, 13, 0, vary(0.8));
      for (let i = 0; i < 4; i++) { const x = -26 + i * 4.8, y = H(x, 22); b.cyl(wood, x, y, 22, 0.28, 2.4, { seg: 6 }); b.box(woodD, x, y + 1.6, 22, 1.6, 0.25, 0.25, 0); b.sphere(wood, x, y + 2.3, 22, 0.32, { seg: 6 }); b.box(snowM, x, y + 2.65, 22, 0.6, 0.12, 0.6, 0); }
      b.box(woodD, -12, H(-12, 14), 14.5, 5.4, 1.9, 0.35, 0); for (let k = 0; k < 5; k++) b.box(iron, -14 + k, H(-12, 14) + 0.8, 14.7, 0.1, 1.2, 0.1, 0.3);
      for (let i = 0; i <= 6; i++) { const x = -31 + i * 3.2; b.cyl(wood, x, H(x, 29), 29, 0.2, 1.5, { seg: 5 }); } b.box(wood, -21.8, H(-21, 29) + 0.9, 29, 19.4, 0.18, 0.15, 0); b.box(wood, -21.8, H(-21, 29) + 0.4, 29, 19.4, 0.18, 0.15, 0);
      // well
      b.cyl(graniteD, 20, H(20, 38), 38, 1.5, 1.0, { seg: 10 }); b.box(woodD, 20, H(20, 38) + 1, 38, 0.2, 2.2, 0.2); b.box(snowM, 20, H(20, 38) + 1.0, 38, 2.4, 0.15, 2.4);
    }
    // crypt entrance: stone facade into a snow mound, pillared door, steps, lantern
    {
      const x = -2, z = -22, y = H(x, z);
      b.sphere(snowM, x, y - 1.5, z - 6, 8, { seg: 10, sy: 0.55 });
      b.box(graniteD, x, y - 1, z, 9, 5, 4, 0, vary(0.8)); b.box(dark, x, y, z + 2.05, 2.6, 3.0, 0.3, 0); b.box(graniteL, x, y + 3.0, z + 2.2, 3.6, 0.6, 0.5, 0); for (const s of [-1, 1]) b.box(graniteL, x + s * 1.7, y, z + 2.25, 0.7, 3.4, 0.5, 0);
      b.box(snowM, x, y + 4.0, z, 9.2, 0.2, 4.2, 0); for (let i = 0; i < 3; i++) b.box(graniteD, x, y - 0.1 - i * 0.2 + 0.2, z + 3.1 + i * 0.9, 4.4 - i * 0.2, 0.4, 0.9, 0);
      for (const s of [-1, 1]) lampB.box(winO, x + s * 2.6, y + 2.4, z + 2.3, 0.4, 0.6, 0.4, 0);
    }
    // winter town: road, varied timber/stone/thatch houses with snow roofs, market square, haystacks, lantern posts
    {
      const townRoad = Array.from({ length: 18 }, (_, i) => [roadX(R_OUT + 8 + i * 12), R_OUT + 8 + i * 12]);
      ribbonUp(b, cobble, townRoad, 7, H, 0.16, vary(0.8), 0.1);
      ribbonUp(b, cobble, [[roadX(150) + 3, 150], [roadX(150) + 30, 156], [roadX(150) + 60, 172], [roadX(150) + 82, 180]], 4.5, H, 0.16, 0xaa9f90, 0.1);
      ribbonUp(b, cobble, [[roadX(190) - 3, 190], [roadX(190) - 28, 196], [roadX(190) - 52, 208], [roadX(190) - 75, 205]], 4.5, H, 0.16, 0xaa9f90, 0.1);
      const pts = K.scatter({ rng: K.rng(31), count: q.dens(125), bounds: [-110, R_OUT + 14, 130, 290], minDist: 8.2, avoid: (x, z) => Math.abs(x - roadX(z)) < 7.5 || (Math.abs(x - roadX(190)) < 18 && Math.abs(z - 190) < 14), accept: (x, z) => K.fbm(x * 0.028 + 3, z * 0.028, 3, 17) > 0.44 - 0.32 * (1 - K.smoothstep(10, 50, Math.abs(x - roadX(z)))) });
      const stonish = [granite, plaster], rr = K.rng(71);
      for (const [x, z] of pts) {
        const kind = rr(), sz = rr(), tall = rr() < 0.3, big = sz > 0.9, hut = sz < 0.22, w = big ? rr.range(15, 22) : hut ? rr.range(4.6, 6.4) : rr.range(7, 12.5) * (tall ? 0.85 : 1), d = big ? rr.range(8, 10) : hut ? rr.range(4, 5.2) : rr.range(5, 8), h = big ? rr.range(4.6, 5.6) : hut ? rr.range(2.8, 3.4) : tall ? rr.range(5.8, 7.2) : rr.range(3.6, 4.8);
        const near = Math.abs(x - roadX(z)) < 20, ry = K.headingX(roadDX(z), 1) + (near ? (rr() < 0.25 ? Math.PI / 2 : 0) : rr.range(-0.5, 0.5)) + rr.range(-0.1, 0.1);
        const roofKind = rr();
        const o = { w, d, h, ry, tall: tall && !hut && !big, rh: (hut ? rr.range(2, 2.6) : rr.range(2.8, 4.2)) + (roofKind > 0.7 ? 0.8 : 0), lit: 0.62, chim: rr() < 0.65 ? 1 : 0, beams: kind < 0.45, doorX: rr.range(-w / 4, w / 4) };
        if (kind < 0.45) { o.wall = plaster; { const v = 0.74 + rr() * 0.2; o.wcol = rgb(v, v * 0.97, v * (0.86 + rr() * 0.1)); } }
        else if (kind < 0.75) { o.wall = granite; o.wcol = vary(0.78); }
        else { o.wall = wood; o.wcol = rgb(0.62 + rr() * 0.4, 0.58 + rr() * 0.36, 0.52 + rr() * 0.3); }
        o.roof = roofKind < 0.5 ? thatch : roofKind < 0.8 ? slate : wood; o.rcol = roofKind < 0.5 ? rgb(0.75 + rr() * 0.25, 0.72 + rr() * 0.25, 0.66 + rr() * 0.2) : vary(0.76);
        bldg(x, z, o);
        if (!hut && rr() < 0.4) { const f = rot(x, z, ry), yw = w + 1, yd = 7, [cx, cz] = f(0, -d / 2 - yd / 2 - 0.4), gy = gnd(cx, cz, 3); // wattle-fenced back yard
          for (const [lx, lz, ww, dd] of [[0, -yd / 2, yw, 0.18], [-yw / 2, 0, 0.18, yd], [yw / 2, 0, 0.18, yd]]) { const [px, pz] = rot(cx, cz, ry)(lx, lz); b.box(woodD, px, gy - 0.3, pz, ww, 1.4, dd, ry, 0x9a8a78); } }
        if (rr() < 0.3) { const f = rot(x, z, ry); const [px, pz] = f(0, d / 2 + 2.1); b.box(woodD, px, gnd(px, pz, 1), pz, 3.4, 0.9, 0.9, ry); b.box(snowM, px, gnd(px, pz, 1) + 0.9, pz, 3.5, 0.14, 1.0, ry); } // woodpile
      }
      // market square + stalls
      const mz = 190, mx = roadX(190);
      b.box(cobble, mx, H(mx, mz), mz, 26, 0.2, 22, 0, vary(0.8));
      [[-8, -6], [0, -7], [8, -6], [-9, 6], [9, 6]].forEach(([ox, oz], i) => { const x = mx + ox, z = mz + oz, y = H(x, z); for (const [px, pz] of [[-1.5, -1], [1.5, -1], [-1.5, 1], [1.5, 1]]) b.cyl(wood, x + px, y, z + pz, 0.12, 2.5, { seg: 5 }); b.box(wood, x, y + 0.8, z, 3.4, 0.2, 2.2, 0); b.prism(i % 2 ? plaster : thatch, x, y + 2.5, z, 3.8, 0.9, 2.8, 0, i % 2 ? 0xb8483c : 0xc8c2a8); b.box(snowM, x, y + 3.45, z, 3.9, 0.12, 0.5, 0); });
      b.cyl(graniteD, mx, H(mx, mz), mz, 1.6, 1.1, { seg: 10 }); b.cyl(woodD, mx, H(mx, mz) + 1.1, mz, 0.12, 2.4, { seg: 5 });
      // lantern posts along the road
      for (let i = 0; i < 14; i++) for (const s of [-1, 1]) { const z = R_OUT + 24 + i * 15, x = roadX(z) + s * 4.6, y = H(x, z); b.cyl(woodD, x, y, z, 0.13, 3.0, { seg: 5 }); lampB.box(winO, x, y + 3.0, z, 0.45, 0.6, 0.45, 0); }
    }
    root.add(b.build({})); root.add(gb.build({ shadow: false })); root.add(lampB.build({ shadow: false }));

    // snow drifts banked against the walls and boulders / rocks on the moors
    {
      const drift = new Inst(G.sphere(12), snowM);
      for (const [x, y, z, l, ry] of [...dIn, ...dOut]) drift.add(x, y - 1.1, z, l * 0.85, rng.range(1.2, 1.9), rng.range(1.9, 2.8), ry);
      for (let i = 0; i < q.dens(60); i++) { const a = rng() * 6.28, r = rng.range(8, 52); const x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.abs(x) < 6) continue; drift.add(x, H(x, z) - 0.4, z, rng.range(2, 5), rng.range(0.5, 1.1), rng.range(2, 4), rng() * 3); }
      root.add(drift.build());
      const rocks = new Inst(G.sphere(5), tri('rock', { color: 0xa9adb4, scale: 3 })), caps = new Inst(G.sphere(5), snowM);
      for (let i = 0; i < q.dens(170); i++) { const a = rng() * 6.28, r = rng.range(104, 340), x = Math.cos(a) * r, z = Math.sin(a) * r; if (z > 100 && Math.abs(x) < 110) continue; const s = rng.range(0.9, 2.8), y = H(x, z); rocks.add(x, y - s * 0.3, z, s * 1.2, s * 0.75, s, rng() * 3, vary(0.75)); caps.add(x, y + s * 0.2, z, s * 0.95, s * 0.36, s * 0.8, rng() * 3); }
      root.add(rocks.build(), caps.build());
    }
    // moat mist + chimney smoke + hot-spring steam
    root.add(dimSmoke(K.smoke(chimneys.filter((_, i) => i % 2 === 0).map(([x, y, z]) => [x, y, z]), { size: 24, rise: 18, opacity: 0.3, color: 0xcdd2d8, perStack: 4 })));
    root.add(dimSmoke(K.smoke([[-34, 1.2, -16], [-30, 1.2, -12], [-38, 1.2, -19]], { color: 0xffffff, size: 34, rise: 12, opacity: 0.22, perStack: 8 })));
    root.add(dimSmoke(K.smoke(Array.from({ length: 14 }, (_, i) => [Math.cos((i / 14) * 6.283) * moatR, 0.4, Math.sin((i / 14) * 6.283) * moatR]), { color: 0xe6f0f6, size: 40, rise: 6, opacity: 0.12, perStack: 3, spread: 4 })));
    // godswood: weirwood heart tree, dark hot pool, oaks and sentinels
    const godPoly = [[-50, -12], [-46, -28], [-36, -40], [-22, -47], [-17, -33], [-12, -24], [-14, -8], [-24, -2], [-40, -1], [-50, -4]];
    const glade = (x, z) => Math.hypot(x + 34, z + 13) < 9.5 || Math.hypot(x + 41.5, z + 18.5) < 6 || Math.hypot(x + 2, z + 22) < 7;
    root.add(K.forest({ rng: K.rng(41), count: 64, bounds: [-52, -48, -10, 0], poly: godPoly, heightAt, species: 'oak', minDist: 3.4, dens: q.dens(1), scale: [1.0, 1.5], avoid: glade }));
    root.add(K.forest({ rng: K.rng(42), count: 40, bounds: [-52, -48, -10, 0], poly: godPoly, heightAt, species: 'pine', minDist: 3.6, dens: q.dens(1), snow: false, tint: 0x2b4a36, scale: [1.0, 1.45], avoid: glade }));
    { // weirwood heart tree: pale trunk with a carved face, spreading limbs, red crown
      const wx = -41.5, wzz = -18.5, wy = H(wx, wzz), bark = tri('wood', { color: 0xe9e4d8, scale: 3, snow: false }), red = flat(0xffffff, { rough: 1 }), wb2 = new Batch();
      wb2.cyl(bark, wx, wy - 1, wzz, 1.8, 9.5, { top: 0.6, seg: 10 });
      for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.3, up = 0.5 + (i % 3) * 0.25; wb2.box(bark, wx + Math.cos(a) * 0.8, wy + 5.5, wzz + Math.sin(a) * 0.8, 0.5, 4.6, 0.5, -a, 0xffffff, Math.sin(a) * up, -Math.cos(a) * up); }
      for (let i = 0; i < 22; i++) { const a = i * 2.4, rr = 1.5 + ((i * 7) % 5) * 1.05; wb2.sphere(red, wx + Math.cos(a) * rr, wy + 8.0 + ((i * 3) % 5) * 0.75, wzz + Math.sin(a) * rr, 1.5 + (i % 3) * 0.45, { seg: 7, sy: 0.62, color: [0x9c2f2a, 0xb83e34, 0x8a2622, 0xc4503f][i % 4] }); }
      wb2.sphere(red, wx, wy + 11.2, wzz, 2.6, { seg: 8, sy: 0.7, color: 0xa8392f });
      wb2.box(red, wx + 1.18, wy + 3.0, wzz - 0.35, 0.2, 0.5, 0.3, 0, 0x7a1f1b); wb2.box(red, wx + 1.18, wy + 3.0, wzz + 0.35, 0.2, 0.5, 0.3, 0, 0x7a1f1b); wb2.box(red, wx + 1.18, wy + 2.1, wzz, 0.2, 0.7, 0.4, 0, 0x7a1f1b);
      root.add(wb2.build({}));
    }
    const pool = K.waterPatch({ w: 14, d: 14, level: H(-34, -16) + 0.1, center: [-34, -12], depth: 3, deep: 0x0b1a22, shallow: 0x203a44, opacity: 0.95 }); root.add(pool); ctx.registerWater(pool);
    // Wolfswood (varied dark greens) + sparse eastern copses
    root.add(K.forest({ rng: K.rng(77), count: q.dens(430), bounds: [-330, -300, -110, 220], heightAt, species: 'pine', snow: true, tint: 0x24402f, avoid: (x, z) => Math.hypot(x, z) < 130 }));
    root.add(K.forest({ rng: K.rng(79), count: q.dens(260), bounds: [-330, -300, -110, 220], heightAt, species: 'pine', snow: true, tint: 0x30503a, scale: [0.7, 1.1], avoid: (x, z) => Math.hypot(x, z) < 130 }));
    root.add(K.forest({ rng: K.rng(78), count: q.dens(190), bounds: [110, -320, 320, -60], heightAt, species: 'pine', snow: true, tint: 0x2a4733, avoid: (x, z) => Math.hypot(x, z) < 130 }));
    root.add(K.forest({ rng: K.rng(80), count: q.dens(90), bounds: [120, 100, 340, 340], heightAt, species: 'pine', snow: true, tint: 0x2a4733, minDist: 8, avoid: (x, z) => Math.hypot(x, z) < 130 }));

    // ---------------------------------------------------------------- life: banners, braziers, walkers, ravens, clouds
    const wolf = 0xd7dce2, bn = [[10, 62, -4], [30.5, 46, -4], [-6, 20, -42], [38, 40, -22], [0, 23, R_IN + 6], [0, 23, -R_IN - 6], [0, 20, R_OUT + 6], [0, 20, -R_OUT - 6], [6, 24, 25]];
    const bannerSet = (items) => { const pb = new Batch(), pm = flat(0x3a2c20, { rough: 0.9 }); for (const it of items) pb.cyl(pm, it.x, it.y - (it.h ?? 5) - 0.6, it.z, 0.13, (it.h ?? 5) + 1.4, { seg: 5 }); const g = new THREE.Group(); g.add(pb.build({ shadow: false }), K.banners(items, { pole: false })); return g; };
    root.add(bannerSet(bn.map(([x, y, z], i) => ({ x, y, z, w: 3, h: 7.5, color: i % 3 === 2 ? 0x9aa1aa : wolf, ry: 0.3 }))));
    const fireSpots = [[10, H(10, 24) + 4.5, 12], [6, H(6, 40) + 5, 31], [-4, H(-4, 54) + 3.5, R_IN - 5], [4, H(4, 54) + 3.5, R_IN - 5], [-4, 3, R_OUT - 5], [4, 3, R_OUT - 5], [30, H(30, 24), 14], [-2, 3.5, -19], [-20, H(-20, 22) + 1.4, 22]];
    const fire = K.fires(fireSpots, { size: 8, light: q.low ? 0 : 3 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const wk = K.walkers({ paths: [[[0, 52], [0, 12], [18, 14]], Array.from({ length: 10 }, (_, i) => [roadX(R_OUT + i * 12), R_OUT + i * 12]), [[-30, 20], [-10, 40], [20, 36]], [[0, -52], [0, -86], [0, -R_OUT - 20]]], heightAt, count: q.dens(36), rng: K.rng(5), colors: [0x6f5a42, 0x4d5a6a, 0x7a3a34, 0x4e5a3c, 0x66656a, 0x3a3f4a] });
    root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const rav = K.birds({ center: [10, 60, -4], radius: 70, count: q.dens(9), color: 0x15151a, size: 1.1, spreadY: 14, seed: 9 }); root.add(rav); ctx.onUpdate((dt, t) => rav.userData.update(t));
    root.add(dimClouds(K.clouds({ y: 260, extent: 700, count: 12, opacity: 0.4, color: 0xdfe5ea })));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 250, center: [0, 0, 40], minDistance: 18,
      hero: { pos: [125, 78, 185], target: [0, 14, 5] },
      climate: {
        atmos: 'day', weather: 'snow', snow: 0.5,
        tint: {
          day: { top: 0x6482a6, horizon: 0xc4d3de, fog: 0xb4c4d1, sunC: 0xfff0d8, sunI: 2.5, elev: 0.46, az: 0.15, hemiSky: 0xa9bdd6, hemiGround: 0x5b5a57, hemiI: 0.95, fogD: 0.0009 },
          dawn: { top: 0x4f6590, horizon: 0xe6b9a6, fog: 0xc9b2b0, sunC: 0xffc08a, sunI: 2.7, hemiSky: 0x9aa9d0, hemiGround: 0x4f4642, fogD: 0.0021 },
          dusk: { top: 0x2b3a6c, horizon: 0xe08a68, fog: 0xa98a8e, sunC: 0xff9a62, sunI: 2.7, hemiSky: 0x8190c0, hemiGround: 0x433a3d, fogD: 0.0016 },
          night: { top: 0x070d28, horizon: 0x24375f, fog: 0x1a2742, sunC: 0x9ab5ff, sunI: 1.1, hemiSky: 0x5d70b0, hemiGround: 0x1e2434, hemiI: 1.1, fogD: 0.0021 },
        },
      },
      landmarks: {
        'great-keep': lm(10, -4, 16, 24), 'great-hall': lm(6, 25, 14, 9), 'first-keep': { ...lm(-6, -42, 11, 18), cam: { pos: [16, 31, -21], target: [-7, 15, -43] } }, 'broken-tower': lm(38, -22, 9, 36),
        'godswood': { ...lm(-32, -22, 18, 3), cam: { pos: [-74, 64, 30], target: [-30, 2, -22] } }, 'glass-gardens': { ...lm(37, 18, 12, 3), cam: { pos: [63, 40, 34], target: [37, 4, 17] } }, 'hot-springs': lm(-34, -16, 6, 1), 'crypts': lm(-2, -21, 6, 3),
        'walls-and-moat': lm(-70, -52, 12, 6), 'gates': lm(0, R_OUT, 12, 6), 'library-tower': lm(-40, 8, 9, 10), 'stables': lm(-12, 45, 10, 3),
        'kitchens': lm(28, 38, 9, 4), 'forge': lm(44, 22, 8, 3), 'training-yard': lm(-20, 22, 11, 1), 'winter-town': lm(10, 160, 40, 6),
      },
      cutaways: [
        { id: 'great-hall', name: { en: 'Great Hall (cutaway)', zh: '大厅（剖面）' }, build: buildGreatHall },
        { id: 'crypts', name: { en: 'Crypts (cutaway)', zh: '地下陵寝（剖面）' }, build: buildCrypts },
      ],
    };
  },
};

function buildGreatHall(ctx) {
  // Long feast hall: back wall with tall windows and two hooded hearths, timber trusses under a slate roof (front slope removed),
  // stone piers dividing a central aisle from the long tables, the lord's high table on a dais at the east end.
  const g = ctx.root, b = new Batch(), W = 46, D = 18, Hh = 13;
  const stone = tri('stone', { color: 0x7c7f86, scale: 2.8, snow: false, bump: 0.6 }), stoneD = tri('stone', { color: 0x5b5e64, scale: 2.8, snow: false, bump: 0.6 });
  const wood = tri('wood', { color: 0x6b4a2e, scale: 2.5, snow: false }), woodD = tri('wood', { color: 0x463020, scale: 2.5, snow: false });
  const floor = tri('cobble', { color: 0x6d675f, scale: 3.5, snow: false }), rush = tri('thatch', { color: 0x9a8656, scale: 2, snow: false });
  const cloth = flat(0xffffff, { rough: 1 }), wg = glow(0xbfd2ff, 0.7), ember = glow(0xff8a3a, 1.4), ground = flat(0x0f0d0c, { rough: 1 });
  b.box(ground, 0, -0.7, 0, 260, 0.2, 260); b.box(flat(0x0b0a09, { rough: 1, side: THREE.BackSide }), 0, -1, 0, 240, 100, 240); // dark ground + enclosure so the set never floats in a void
  b.box(floor, 0, -0.5, 0, W + 6, 0.5, D + 4); b.box(rush, -2, 0.0, 0, W - 14, 0.06, 4.4); // flagstones, rushes down the aisle
  b.box(stone, 0, 0, -D / 2, W, Hh, 1.2); b.box(stone, -W / 2, 0, 0, 1.2, Hh, D); b.box(stone, W / 2, 0, 0, 1.2, Hh, D);
  b.box(stoneD, 0, 0, -D / 2 + 0.7, W, 0.9, 0.4); b.box(stoneD, 0, Hh - 0.8, -D / 2 + 0.7, W, 0.8, 0.6);
  for (let i = -3; i <= 3; i++) { if (i === -2 || i === 2 || i === 0) continue; b.box(stoneD, i * 6, 4.2, -D / 2 + 0.62, 2.3, 7.6, 0.3); b.box(wg, i * 6, 4.6, -D / 2 + 0.75, 1.4, 6.6, 0.12); }
  // roof: back slope only, so the cutaway stays open; principal trusses span the whole width
  { const rise = 6.5, run = D / 2 + 0.8, ang = Math.atan2(rise, run), len = Math.hypot(rise, run);
    b.box(woodD, 0, Hh + 0.1 - 0.3, -D / 2 - 0.8 + run / 2 - 0.2, W + 2, 0.4, len + 0.4, 0, 0xffffff, ang, 0); }
  for (let i = -4; i <= 4; i++) { const x = i * 5.2;
    b.box(wood, x, Hh - 0.6, 0, 0.6, 0.7, D); b.box(wood, x, Hh, 0, 0.4, 6.4, 0.4); // tie beam + king post
    for (const sd of [-1, 1]) b.box(wood, x, Hh - 0.3, sd * D / 4 + sd * 0.5, 0.45, Math.hypot(6.8, D / 2) - 0.6, 0.45, 0, 0xffffff, sd * Math.atan2(D / 2, 6.8), 0); }
  b.box(wood, 0, Hh + 6.2, 0, W, 0.5, 0.6); for (const sd of [-1, 1]) b.box(wood, 0, Hh + 3.2, sd * 4.6, W, 0.35, 0.4);
  // stone piers + long tables + benches
  for (let i = -3; i <= 3; i++) for (const s of [-1]) { if (Math.abs(i) === 2) continue; b.box(stoneD, i * 6.2, 0, s * 6.4, 1.8, 0.8, 1.8); b.cyl(stone, i * 6.2, 0.8, s * 6.4, 0.75, Hh - 2.2, { top: 0.88, seg: 10 }); b.box(stoneD, i * 6.2, Hh - 1.4, s * 6.4, 1.7, 0.8, 1.7); }
  for (const s of [-1, 1]) {
    b.box(wood, -3, 0.75, s * 4.2, 30, 0.22, 1.5); b.box(woodD, -3, 0, s * 4.2, 29, 0.75, 0.25);
    for (const o of [-1.25, 1.25]) { b.box(woodD, -3, 0, s * 4.2 + o, 29, 0.45, 0.45); }
    for (let i = 0; i < 9; i++) { const x = -16 + i * 3.4; b.box(woodD, x, 0.97, s * 4.2 + 0.3, 0.5, 0.25, 0.5); b.cyl(cloth, x + 1, 0.97, s * 4.2 - 0.2, 0.18, 0.3, { seg: 6, color: 0x8a7a5a }); }
  }
  // dais, high table and the lord's chair
  b.box(stoneD, W / 2 - 5, 0, 0, 8, 0.9, D - 2.5); for (let i = 0; i < 2; i++) b.box(stoneD, W / 2 - 9.5 + i * 0.6, 0, 0, 0.8, 0.3 + i * 0.3, 6);
  b.box(wood, W / 2 - 5.5, 1.75, 0, 1.8, 0.25, 13); b.box(woodD, W / 2 - 5.5, 0.9, 0, 1.5, 0.85, 12.6);
  for (let i = -3; i <= 3; i++) { const tall = i === 0; b.box(woodD, W / 2 - 3.6, 0.9, i * 1.8, 0.9, 1.0, 0.9); b.box(woodD, W / 2 - 3.15, 1.9, i * 1.8, 0.2, tall ? 3.2 : 1.6, 0.9); }
  // hearths with hoods and chimney breasts on the west end wall
  for (const x of [-12, 12]) { const z = -D / 2 + 0.6;
    b.box(stoneD, x, 0, z + 0.6, 6.2, 4.6, 2.4); b.box(stone, x, 4.6, z + 0.9, 7.0, 1.3, 3.0); b.box(stone, x, 5.9, z + 0.4, 4.4, Hh - 5.9, 1.8);
    b.box(flat(0x0e0b09), x, 0.3, z + 1.82, 4.0, 3.2, 0.1); b.box(ember, x, 0.3, z + 1.4, 3.0, 0.35, 1.0); for (let k = -1; k <= 1; k++) b.box(woodD, x + k * 0.8, 0.5, z + 1.3, 0.35, 0.3, 1.4, 0.4 * k); }
  // sconces on the piers
  const torches = []; for (let i = -3; i <= 3; i += 2) for (const s of [-1]) { const x = i * 6.2 + 0.05, z = s * 6.4 - s * 0.95; b.box(flat(0x2a2a2e, { metal: 0.5, rough: 0.5 }), x, 5.6, z, 0.2, 0.6, 0.2); torches.push([x, 6.4, z]); }
  // grey and white hangings of the house on the back wall, a long cloth behind the dais
  const items = []; for (let i = -3; i <= 3; i += 2) items.push({ x: i * 6 - 1.3, y: Hh - 1.6, z: -D / 2 + 1.0, w: 2.6, h: 6.5, color: i % 4 === 1 || i % 4 === -3 ? 0x2f343b : 0x474d55, ry: 0 });
  for (const zz of [-3.6, 4.8]) items.push({ x: W / 2 - 0.9, y: Hh - 1.5, z: zz, w: 2.4, h: 7.5, color: 0x3a4048, ry: -Math.PI / 2 });
  g.add(b.build({})); g.add(K.banners(items, { pole: false }));
  const fire = K.fires([[-12, 0.6, -D / 2 + 2.0], [12, 0.6, -D / 2 + 2.0], ...torches], { size: 7, light: 3, intensity: 80 }); g.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
  for (const [x, y, z, col, I, d] of [[-10, 6, 2, 0xffb070, 170, 36], [14, 7, 3, 0xffc890, 140, 36], [0, 10, -4, 0x9fb4e0, 40, 40]]) { const l = new THREE.PointLight(col, I, d, 1.6); l.position.set(x, y, z); g.add(l); }
  return { center: [0, 4, 0], hero: { pos: [-14, 9.5, 23], target: [4, 4, -3] }, minDistance: 8, maxDistance: 60 };
}

function buildCrypts(ctx) {
  // A single long gallery standing for the whole crypt: the dead lords sit in niches in two rows, iron swords across their laps,
  // stone direwolves at their feet, under a low barrel vault (the near half is cut away). Torchlight only.
  const g = ctx.root, b = new Batch(), L = 72, Wd = 16, sh = 5.4;
  const stone = tri('stone', { color: 0x777a80, scale: 2.4, snow: false, bump: 0.6 }), stoneD = tri('stone', { color: 0x55585e, scale: 2.4, snow: false, bump: 0.6 });
  const vault = tri('stone', { color: 0x5d6066, scale: 2.4, snow: false, side: THREE.DoubleSide, bump: 0.5 }), floor = tri('cobble', { color: 0x58544f, scale: 3, snow: false });
  const statue = tri('stone', { color: 0xa9acb2, scale: 1.4, snow: false, bump: 0.3 }), iron = flat(0x50555c, { metal: 0.6, rough: 0.45 }), dark = flat(0x0d0e10, { rough: 1 }), ground = flat(0x0b0b0c, { rough: 1 });
  b.box(ground, 0, -0.7, 0, 260, 0.2, 260); b.box(flat(0x0a0a0b, { rough: 1, side: THREE.BackSide }), 0, -1, 0, 240, 100, 240);
  b.box(floor, 0, -0.5, 0, L, 0.5, Wd); b.box(stoneD, 0, 0, 0, L - 4, 0.04, 3.2);
  b.box(stone, 0, -0.5, -Wd / 2, L, sh + 6, 1); b.box(stone, -L / 2, -0.5, 0, 1, sh + 6, Wd); b.box(stone, L / 2, -0.5, 0, 1, sh + 6, Wd);
  // back half of the barrel vault + transverse ribs on square piers
  { const vg = new THREE.CylinderGeometry(Wd / 2, Wd / 2, L, 20, 1, true, Math.PI / 2, Math.PI / 2); const m = new THREE.Matrix4().compose(new THREE.Vector3(0, sh, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)), new THREE.Vector3(0.62, 1, 1)); b.addGeometry(vault, vg, m); }
  for (let i = -6; i <= 6; i++) { const x = i * 6;
    for (const s of [-1, 1]) b.box(stoneD, x, -0.5, s * 4.4, 1.3, sh + 0.5, 1.3);
    for (let k = 0; k < 8; k++) { const a0 = (k / 8) * Math.PI, a1 = ((k + 1) / 8) * Math.PI, p0 = [x, sh + Math.sin(a0) * 4.4 * 0.62 * 1.4, -Math.cos(a0) * 4.4], p1 = [x, sh + Math.sin(a1) * 4.4 * 0.62 * 1.4, -Math.cos(a1) * 4.4];
      const dx = 0, dy = p1[1] - p0[1], dz = p1[2] - p0[2], len = Math.hypot(dy, dz); b.box(stoneD, x, p0[1], p0[2], 1.0, len + 0.1, 0.8, 0, 0xffffff, Math.atan2(dz, dy), 0); }
  }
  // the dead: seated lords in niches, swords across their laps, direwolves at their feet
  for (let i = -5; i <= 5; i++) for (const s of [-1, 1]) {
    const x = i * 6 + 3, zw = s * 7.45, f = -s; // f = facing direction (toward the aisle)
    b.box(dark, x, 0.4, zw - f * 0.02, 2.8, 4.8, 0.2); // niche shadow
    const z0 = s * 6.6;
    b.box(stoneD, x, 0, z0, 2.4, 0.9, 1.9); b.box(stoneD, x, 0.9, z0 - f * 0.75, 2.2, 3.6, 0.4); // chair + back
    b.box(statue, x, 0.9, z0 - f * 0.1, 1.5, 0.55, 1.4); b.box(statue, x, 1.45, z0 - f * 0.35, 1.3, 1.65, 0.75); // lap + torso
    b.box(statue, x, 0.0, z0 + f * 0.65, 1.2, 0.9, 0.5); // shins
    b.sphere(statue, x, 3.15, z0 - f * 0.35, 0.36, { seg: 8, sy: 1.15 }); b.box(statue, x, 3.85, z0 - f * 0.35, 0.8, 0.18, 0.62); // head + iron-crown band
    b.box(iron, x, 1.5, z0 + f * 0.05, 2.5, 0.1, 0.16); b.box(iron, x - 1.2, 1.42, z0 + f * 0.05, 0.1, 0.3, 0.5); // the sword across the lap
    b.box(statue, x + 0.2, 0, z0 + f * 1.55, 1.6, 0.7, 0.6); b.box(statue, x - 0.7, 0.55, z0 + f * 1.55, 0.55, 0.6, 0.55); b.box(statue, x - 1.05, 0.7, z0 + f * 1.55, 0.35, 0.25, 0.32); // direwolf
  }
  g.add(b.build({}));
  const torches = []; for (let i = -5; i <= 6; i++) { if (i % 2) torches.push([i * 6, 3.4, -7.3]); else if (i % 4 === 0) torches.push([i * 6, 3.4, 3.65]); }
  const tb = new Batch(); for (const [x, , z] of torches) tb.box(iron, x, 2.8, z, 0.15, 0.6, 0.15); g.add(tb.build({}));
  const fire = K.fires(torches, { size: 5, light: 4, intensity: 85, color: 0xff9a3c }); g.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
  const cool = new THREE.PointLight(0x7f9ccf, 18, 60, 1.4); cool.position.set(-6, 7, 6); g.add(cool);
  const fill = new THREE.PointLight(0xffb070, 50, 26, 1.5); fill.position.set(-10, 4.5, -2); g.add(fill);
  return { center: [0, 2.5, 0], hero: { pos: [-21, 3.5, 1.6], target: [-2, 2.0, -6.8] }, minDistance: 6, maxDistance: 60 };
}
