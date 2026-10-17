// The Eyrie — dramatic vertical scene. Book anchors: Gates of the Moon at the foot, a mule path climbing past three waycastles
// (Stone, Snow, Sky), a tiny white fortress of slender towers on a shoulder of the Giant's Lance, the High Hall with the Moon Door
// (a drop to the valley), open sky cells, Alyssa's Tears falling from the mountain and vanishing into mist, a small garden/godswood.
// Heights, switchback layout and building shapes are interpretation — see content/the-eyrie.js.
// Visual language: a crag of banded rock above a frosted vale; seven slender white marble towers bundled on a terraced shoulder,
// pale silver-blue spires, sky-blue falcon banners, warm hearth windows, cloud seas below.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const R = 260, HM = 420, BASE = 60, E = [0, 88], EY = 345; // mountain radius, height, summit-base, Eyrie plateau centre/height
const rgb = (r, g, b) => (Math.min(255, (r * 255) | 0) << 16) | (Math.min(255, (g * 255) | 0) << 8) | Math.min(255, (b * 255) | 0);

export default {
  build(ctx) {
    const q = ctx.q, rng = K.rng(31), root = ctx.root;
    const vary = (lo = 0.85) => { const v = lo + rng() * (1 - lo); return rgb(v, v * (0.99 + rng() * 0.03), Math.min(1, v * (1.0 + rng() * 0.04))); };
    // ------------------------------------------------------------ terrain
    const mtn = (r) => { const t = K.clamp((R - r) / (R - BASE), 0, 1); return HM * Math.pow(t, 1.3) + 300 * Math.exp(-((r / 30) ** 2)) * (r < BASE ? 1 : Math.exp(-(r - BASE) * 0.08)); };
    const baseH = (x, z) => {
      const r = Math.hypot(x, z);
      const ang = Math.atan2(z, x), gul = (Math.abs(K.fbm(ang * 4.2, r * 0.012, 3, 21) - 0.5) - 0.12) * 70 * K.smoothstep(R, 140, r) * K.smoothstep(40, 100, r);
      let h = gul + mtn(r) * (1 + (K.fbm(x * 0.02, z * 0.02, 3, 7) - 0.5) * 0.3) + (K.fbm(x * 0.07, z * 0.07, 3, 9) - 0.5) * 34 * K.smoothstep(R, 90, r) * K.smoothstep(40, 90, r);
      // crags: ridged noise gives the flanks buttresses and broken cliff bands
      const rg = 1 - Math.abs(2 * K.fbm(x * 0.014, z * 0.014, 4, 31) - 1);
      h += rg * rg * 70 * K.smoothstep(R, 130, r) * K.smoothstep(50, 110, r);
      h += (1 - Math.abs(2 * K.fbm(x * 0.04, z * 0.04, 3, 41) - 1)) ** 2 * 16 * K.smoothstep(R, 120, r) * K.smoothstep(50, 100, r);
      const north = 1 - K.smoothstep(-0.25, 0.55, z / Math.max(r, 1));
      h += K.smoothstep(300, 600, r) * north * (170 + K.fbm(x * 0.005, z * 0.005, 3, 3) * 210) + K.smoothstep(520, 820, r) * 50;
      { // stratified ledges: soft stair-stepping of the flanks reads as banded cliffs and broken shelves
        const tt = h / 26, st = (Math.floor(tt) + K.smoothstep(0.35, 0.95, tt - Math.floor(tt))) * 26;
        h = K.lerp(h, st, 0.75 * K.smoothstep(R + 20, 190, r) * K.smoothstep(70, 130, r) * K.smoothstep(20, 60, h));
      }
      h = Math.max(h, 0);
      const dl = Math.hypot(x - 210, z - 390); if (dl < 90) h -= (1 - K.smoothstep(30, 90, dl)) * 3.5;
      const dE = Math.hypot(x - E[0], z - E[1]); h = K.lerp(EY, h, K.smoothstep(30, 64, dE));
      return h;
    };
    const path = [[0, 266], [48, 240], [-42, 214], [46, 192], [-40, 170], [44, 150], [-34, 132], [30, 118], [8, 113]];
    const pathY = path.map(([x, z]) => baseH(x, z));
    const sites = [[-42, 214], [-40, 170], [-34, 132], [8, 278]].map(([x, z]) => [x, z, baseH(x, z)]);
    const heightAt = (x, z) => {
      let h = baseH(x, z);
      if (z > 100 && z < 270) {
        const p = K.distToPolyline(x, z, path);
        if (p.d < 9) { const i = Math.min(path.length - 2, Math.floor(p.t)), u = p.t - i, ty = K.lerp(pathY[i], pathY[i + 1], u); h = K.lerp(ty - 0.3, h, K.smoothstep(2.6, 9, p.d)); }
      }
      for (const [sx, sz, sy] of sites) { const d = Math.hypot(x - sx, z - sz); if (d < 22) h = K.lerp(sy, h, K.smoothstep(11, 22, d)); }
      return h;
    };
    const H = heightAt;
    const cLight = new THREE.Color(0xb8a98c), cMid = new THREE.Color(0x6e5f52), cDark = new THREE.Color(0x34333a), cTan = new THREE.Color(0xa58f6e), cSnow = new THREE.Color(0xeef3f8), cPine = new THREE.Color(0x3e5848), cGrass = new THREE.Color(0x6a8550), cField = new THREE.Color(0xb3a65e), cFrost = new THREE.Color(0xa7b59f), c = new THREE.Color();
    const colorAt = (x, z, h, s) => {
      const n = K.fbm(x * 0.02, z * 0.02, 3, 4), n2 = K.fbm(x * 0.06, z * 0.06, 3, 12), strata = Math.sin(h * 0.12 + n * 5 + n2 * 1.5) * 0.5 + 0.5;
      c.copy(cMid).lerp(cLight, strata * 0.7).lerp(cTan, K.smoothstep(0.52, 0.8, n2) * 0.45);
      c.lerp(cDark, K.clamp(s * 2.6 - 0.15, 0, 0.8) * (0.7 + 0.3 * strata));
      { const rr_ = Math.hypot(x, z), gv = K.fbm(Math.atan2(z, x) * 24, rr_ * 0.012, 3, 5); c.lerp(cDark, K.smoothstep(0.48, 0.68, gv) * 0.7 * K.smoothstep(40, 200, rr_) * K.smoothstep(R, 160, rr_)); }
      const tree = K.smoothstep(12, 40, h) * (1 - K.smoothstep(150, 230, h + (n2 - 0.5) * 70)) * (1 - K.clamp(s * 2.4, 0, 1));
      c.lerp(cPine, tree * 0.95);
      c.lerp(cSnow, K.smoothstep(225, 330, h + (K.fbm(x * 0.05, z * 0.05, 3, 2) - 0.5) * 150) * (1 - K.clamp(s * 2.0, 0, 0.7)));
      const vale = 1 - K.smoothstep(2, 70, h);
      if (vale > 0) { const field = K.noise2(x * 0.02, z * 0.02, 4) > 0.5 ? cField : cGrass; c.lerp(cFrost, 0.25).lerp(field, vale * 0.85 * (1 - K.clamp(s * 4, 0, 1))); }
      return c;
    };
    root.add(K.terrain({ size: 1500, seg: q.seg(206), heightAt, kind: 'rock', scale: 110, colorAt }));
    const farH = (x, z) => { const e = Math.max(Math.abs(x), Math.abs(z)); return baseH(x, z) - 14 * (1 - K.smoothstep(700, 752, e)) + K.smoothstep(780, 1700, e) * (60 + K.fbm(x * 0.003, z * 0.003, 3, 6) * 180); };
    root.add(K.terrain({ size: 6000, seg: q.seg(96), heightAt: farH, kind: 'rock', scale: 40, colorAt }));
    const lake = K.waterPatch({ w: 200, d: 200, level: -1.1, center: [210, 390], depth: 3, deep: 0x1e4a60, shallow: 0x4f8697, opacity: 0.92 }); root.add(lake); ctx.registerWater(lake);

    // ------------------------------------------------------------ materials
    const marble = tri('marble', { color: 0xf4f5f8, scale: 8, snow: false, rough: 0.7 }), marbleB = tri('marble', { color: 0xdfe6f0, scale: 8, snow: false, rough: 0.7 }), vein = tri('marble', { color: 0xb8c8e0, scale: 6, snow: false });
    const roofM = tri('slate', { color: 0x8aa0bf, scale: 6 }), roofD = tri('slate', { color: 0x6c829f, scale: 6 });
    const stone = tri('stone', { color: 0x8d8f95, scale: 6 }), stoneD = tri('stone', { color: 0x666870, scale: 6 }), stoneL = tri('stone', { color: 0xa9abb1, scale: 6 });
    const wood = tri('wood', { color: 0x5a4430, scale: 4, snow: false }), woodD = tri('wood', { color: 0x3a2c20, scale: 4, snow: false });
    const snowM = tri('snow', { color: 0xf3f7fb, scale: 9, snow: false, rough: 0.85, bump: 0.35 });
    const dark = flat(0x12161c, { rough: 1 }), iron = flat(0x50545c, { metal: 0.5 }), gold = flat(0xd9c27a, { metal: 0.7, rough: 0.35 });
    const win = glow(0xffd28a, 1.5), winB = glow(0xffe2a8, 1.2), unlit = flat(0x3a4658, { rough: 0.5, metal: 0.2 });
    const b = new Batch(), lampB = new Batch();
    const [ex, ez] = E;
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
    const window_ = (f, ry, lx, lz, y, w, h, lit = 1, mat = win) => { const [x, z] = f(lx, lz); b.box(dark, x, y - 0.2, z, w + 0.4, h + 0.4, 0.2, ry); b.box(lit ? mat : unlit, x, y, z, w, h, 0.28, ry); };
    const snowGable = (x, y, z, w, rh, d, ry, cov = 0.9) => b.prism(snowM, x, y + rh * (1 - cov) + 0.14, z, w + 0.35, rh, d * cov, ry);
    const chimneys = [];
    const bldg = (x, z, o) => {
      const { w, d, h, ry = 0, wall = stone, wcol = 0xffffff, roof = roofD, rcol = 0xffffff, rh = Math.min(w, d) * 0.55, y = H(x, z), chim = 0, lit = 0.6, doorX = null } = o;
      const f = rot(x, z, ry);
      b.box(stoneD, x, y - 2, z, w + 0.5, 2.9, d + 0.5, ry, vary(0.8));
      b.box(wall, x, y - 1.2, z, w, h + 1.2, d, ry, wcol);
      b.box(stoneD, x, y + h - 0.2, z, w + 0.5, 0.5, d + 0.5, ry, vary(0.8));
      b.prism(roof, x, y + h + 0.3, z, w + 1.4, rh, d + 1.3, ry, rcol); snowGable(x, y + h + 0.3, z, w + 1.4, rh, d + 1.3, ry, 0.82 + rng() * 0.12);
      for (let i = 0; i < chim; i++) { const [cx, cz] = f((i ? -1 : 1) * (w / 2 - 1.2), 0); b.box(stoneD, cx, y + h - 0.5, cz, 1.3, rh + 1.5, 1.3, ry); b.box(snowM, cx, y + h + rh + 1.0, cz, 1.5, 0.16, 1.5, ry); chimneys.push([cx, y + h + rh + 2, cz]); }
      const nW = Math.max(1, Math.round(w / 4.5));
      for (const sz of [-1, 1]) for (let i = 0; i < nW; i++) { const lx = (i - (nW - 1) / 2) * (w / nW); if (doorX !== null && sz === 1 && Math.abs(lx - doorX) < 1.5) continue; window_(f, ry, lx, sz * (d / 2 + 0.04), y + h * 0.5, 0.9, 1.3, rng() < lit ? 1 : 0); }
      if (doorX !== null) { const [px, pz] = f(doorX, d / 2 + 0.06); b.box(woodD, px, y, pz, 1.6, 2.4, 0.3, ry); }
      return y;
    };
    const tower2 = (x, z, o) => {
      const { r = 4, h = 18, roof = 'cone', roofH = r * 2.2, mat = stone, seg = 10, y = H(x, z), col = vary(0.86), taper = 0.9, win_ = 2, base = stoneD } = o;
      b.cyl(base, x, y - 3, z, r + 0.7, 5, { top: (r + 0.2) / (r + 0.7), seg, color: vary(0.85) });
      b.cyl(mat, x, y + 2, z, r + 0.15, h - 2, { top: taper * r / (r + 0.15), seg, color: col });
      const rt = r * taper;
      for (let i = 0; i < win_; i++) { const a = (i * 2.4 + x * 0.3) % (Math.PI * 2), yy = y + h * (0.3 + 0.2 * i), rr = r * (1 - (1 - taper) * ((yy - y) / h)) + 0.1; b.box(rng() < 0.7 ? win : unlit, x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr, 0.5, 1.6, 0.2, -a + Math.PI / 2); }
      b.cyl(base, x, y + h - 1.2, z, rt + 0.2, 1.2, { top: 1.2, seg, color: vary(0.8) });
      const rr = rt * 1.2 + 0.1;
      if (roof === 'cone') { b.cone(roofD, x, y + h, z, rr + 0.5, roofH, { seg, color: vary(0.9) }); b.cone(snowM, x, y + h + roofH * 0.48, z, (rr + 0.5) * 0.52 * 1.1, roofH * 0.52 + 0.18, { seg }); }
      else if (roof === 'flat') { b.cyl(base, x, y + h, z, rr + 0.35, 0.7, { top: 1, seg }); const n = Math.max(7, Math.round((Math.PI * 2 * rr) / 2.3)); for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; b.box(mat, x + Math.cos(a) * (rr + 0.1), y + h + 0.7, z + Math.sin(a) * (rr + 0.1), 1.2, 1.4, 0.7, -a + Math.PI / 2, vary(0.84)); } b.cyl(snowM, x, y + h + 0.7, z, rr - 0.5, 0.25, { top: 1, seg }); }
    };
    const sqTower = (x, z, o) => {
      const { w = 9, d = w, h = 20, ry = 0, roof = 'pyr', roofH = w * 0.9, mat = stoneD, y = H(x, z), col = vary(0.88) } = o;
      const f = rot(x, z, ry);
      b.box(stoneD, x, y - 3, z, w + 1.2, 5, d + 1.2, ry, vary(0.85));
      b.box(mat, x, y - 1.2, z, w, h + 1.2, d, ry, col);
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const [px, pz] = f(sx * (w / 2), sz * (d / 2)); b.box(stoneL, px, y, pz, 1.0, h, 1.0, ry, vary(0.84)); }
      b.box(stoneD, x, y + h * 0.5, z, w + 0.5, 0.5, d + 0.5, ry, vary(0.85)); b.box(stoneD, x, y + h - 0.9, z, w + 1.2, 0.9, d + 1.2, ry, vary(0.8));
      const nw = Math.max(1, Math.floor(h / 8));
      for (let i = 1; i <= nw; i++) for (const s of [-1, 1]) window_(f, ry, i % 2 ? -w * 0.18 : w * 0.18, s * (d / 2 + 0.05), y + (h * i) / (nw + 1), 0.8, 1.6, rng() < 0.55 ? 1 : 0);
      const yt = y + h;
      if (roof === 'pyr') { b.pyramid(roofD, x, yt, z, w + 1.4, roofH, d + 1.4, ry, vary(0.9)); b.pyramid(snowM, x, yt + roofH * 0.42, z, (w + 1.4) * 0.58 * 1.08, roofH * 0.58 + 0.2, (d + 1.4) * 0.58 * 1.08, ry); }
      else if (roof === 'gable') { b.prism(roofD, x, yt, z, w + 1.4, roofH, d + 1.4, ry, vary(0.9)); snowGable(x, yt, z, w + 1.4, roofH, d + 1.4, ry, 0.86); }
      else if (roof === 'flat') { b.box(stoneD, x, yt, z, w + 1.2, 0.6, d + 1.2, ry); for (const [ox, oz, sx, sz] of [[0, d / 2 + 0.4, w * 0.62, 0.7], [0, -d / 2 - 0.4, w * 0.62, 0.7], [w / 2 + 0.4, 0, 0.7, d * 0.62], [-w / 2 - 0.4, 0, 0.7, d * 0.62]]) { const [px, pz] = f(ox, oz); b.box(mat, px, yt + 0.6, pz, sx, 1.4, sz, ry, vary(0.84)); } b.box(snowM, x, yt + 0.6, z, w - 0.2, 0.25, d - 0.2, ry); }
    };
    const gate = (gx, gz, o) => { // gatehouse with passage along Z: two drum towers, arch block
      const { y = H(gx, gz), w = 14, d = 8, h = 13, tr = 3.4, mat = stone, ry = 0, roof = true } = o;
      b.box(stoneD, gx, y - 3, gz, w + 1.6, 5, d + 1.2, ry, vary(0.85)); b.box(mat, gx, y - 1.2, gz, w, h + 1.2, d, ry, vary(0.88));
      const f = rot(gx, gz, ry);
      for (const sgn of [-1, 1]) { const [tx, tz] = f(sgn * (w / 2), 0); tower2(tx, tz, { r: tr, h: h + 5, y, mat, roofD, seg: 10, win_: 2 }); }
      for (const s of [-1, 1]) { const [px, pz] = f(0, s * (d / 2 + 0.05)); b.box(dark, px, y, pz, 4.4, 5.2, 0.3, ry); const [lx, lz] = f(3.6, s * (d / 2 + 0.3)); lampB.box(win, lx, y + 4.2, lz, 0.45, 0.7, 0.45, ry); }
      b.box(stoneD, gx, y + h - 0.5, gz, w - 1, 0.9, d + 1.2, ry, vary(0.8)); b.box(snowM, gx, y + h + 0.4, gz, w - 1.5, 0.22, d - 0.4, ry);
    };

    // ------------------------------------------------------------ the Eyrie: seven slender white towers around the High Hall, on terraced foundations
    {
      const ring = 29;
      // terraced foundation: the fortress is built out of the mountain's shoulder, with buttressed rings stepping down the cliff
      b.cyl(stone, ex, EY - 30, ez, ring + 5.2, 28.5, { top: (ring + 2) / (ring + 5.2), seg: 24, color: vary(0.9) });
      b.cyl(stoneD, ex, EY - 56, ez, ring + 9, 27, { top: (ring + 5.2) / (ring + 9), seg: 24, color: vary(0.86) });
      b.cyl(stoneL, ex, EY - 2.5, ez, ring + 1.6, 2.5, { top: 1, seg: 24, color: vary(0.92) });
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.2; b.box(stoneD, ex + Math.cos(a) * (ring + 3.6), EY - 26, ez + Math.sin(a) * (ring + 3.6), 3.0, 24, 3.6, -a + Math.PI / 2, vary(0.86)); b.box(snowM, ex + Math.cos(a) * (ring + 3.6), EY - 2.2, ez + Math.sin(a) * (ring + 3.6), 3.2, 0.2, 3.8, -a + Math.PI / 2); }
      // parapet ring wall with merlons and snow
      const pw = 25, nM = 48;
      b.cyl(marble, ex, EY - 0.1, ez, pw, 5.1, { top: 1, seg: 36, color: 0xf0f2f6 });
      for (let i = 0; i < nM; i++) { const a = (i / nM) * Math.PI * 2; if (a > 1.35 && a < 1.8) continue; b.box(marble, ex + Math.cos(a) * (pw + 0.1), EY + 5, ez + Math.sin(a) * (pw + 0.1), 1.5, 1.3, 0.9, -a + Math.PI / 2, 0xf0f2f6); b.box(snowM, ex + Math.cos(a) * (pw + 0.1), EY + 6.3, ez + Math.sin(a) * (pw + 0.1), 1.6, 0.14, 1.0, -a + Math.PI / 2); }
      // courtyard paving (inside the ring), pale
      b.cyl(tri('marble', { color: 0xc9d1dc, scale: 5, snow: false }), ex, EY + 4.8, ez, pw - 1.4, 0.3, { top: 1, seg: 36 });
      // High Hall
      b.box(marble, ex, EY + 5, ez, 34, 18, 11, 0, 0xf4f6fa); b.box(vein, ex, EY + 5, ez, 34.8, 0.5, 11.8, 0); b.box(vein, ex, EY + 20, ez, 34.8, 0.6, 11.8, 0);
      b.prism(roofM, ex, EY + 23, ez, 36, 6.5, 13, 0, vary(0.92)); snowGable(ex, EY + 23, ez, 36, 6.5, 13, 0, 0.82);
      for (let i = -4; i <= 4; i++) { window_(rot(ex, ez, 0), 0, i * 3.5, 5.55, EY + 12, 1.1, 6.2, i % 4 === 0 ? 0 : 1, winB); window_(rot(ex, ez, 0), 0, i * 3.5, -5.55, EY + 12, 1.1, 6.2, i % 2, winB); }
      const th = [66, 80, 56, 90, 70, 78, 60];
      const centers = th.map((h, i) => { const a = (i / 7) * Math.PI * 2 + 0.3; return [ex + Math.cos(a) * 17, ez + Math.sin(a) * 17, h, a]; });
      centers.forEach(([tx, tz, h, a], i) => {
        const r = 2.9 + (i % 3) * 0.3, y = EY + 4.8, mat = i % 2 ? marble : marbleB;
        b.cyl(marbleB, tx, y - 2, tz, r + 0.8, 4, { top: (r + 0.3) / (r + 0.8), seg: 12, color: 0xe8edf4 });
        b.cyl(mat, tx, y + 1, tz, r + 0.2, h - 1, { top: 0.76 * r / (r + 0.2), seg: 12, color: vary(0.94) });
        for (const k of [0.34, 0.62, 0.84]) { const rr = r * (1 - 0.24 * k) + 0.3; b.cyl(marbleB, tx, y + h * k, tz, rr + 0.5, 0.55, { top: 1, seg: 12, color: 0xe9eef5 }); b.cyl(vein, tx, y + h * k - 0.4, tz, rr + 0.3, 0.3, { top: 1, seg: 12 }); }
        for (let k = 0; k < 7; k++) { const aa = (k * 2.3 + i) % (Math.PI * 2), yy = y + h * (0.16 + 0.11 * k), rr = r * (1 - 0.24 * (yy - y) / h) + 0.12; b.box(k % 3 === 2 ? unlit : win, tx + Math.cos(aa) * rr, yy, tz + Math.sin(aa) * rr, 0.55, 2.3, 0.22, -aa + Math.PI / 2); }
        const rt = r * 0.76;
        b.cyl(marbleB, tx, y + h - 1.2, tz, rt + 0.25, 1.4, { top: 1.24, seg: 12, color: 0xe9eef5 });
        const rr = rt * 1.24 + 0.2, rhh = 15 + (i % 3) * 4;
        b.cone(roofM, tx, y + h + 0.2, tz, rr + 0.5, rhh, { seg: 12, color: vary(0.92) }); b.cone(snowM, tx, y + h + 0.2 + rhh * 0.55, tz, (rr + 0.5) * 0.45 * 1.12, rhh * 0.45 + 0.16, { seg: 12 });
        b.cyl(gold, tx, y + h + rhh, tz, 0.14, 3.4, { seg: 5 });
      });
      // covered galleries bridging neighbouring towers
      for (let i = 0; i < 7; i++) { const A = centers[i], B = centers[(i + 1) % 7], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz), ry = K.headingX(dx, dz); for (const [lv, y0] of [[0.42, 0], [0.7, 1]]) { const hh = Math.min(A[2], B[2]) * lv + EY + 4.8, mx = (A[0] + B[0]) / 2, mz = (A[1] + B[1]) / 2; b.box(marbleB, mx, hh, mz, len - 3.4, 2.8, 2.4, ry, 0xeef1f6); b.prism(roofM, mx, hh + 2.8, mz, len - 3.2, 1.3, 3.0, ry, vary(0.9)); lampB.box(win, mx, hh + 0.8, mz + 0, 0.5, 0.9, 0.5, ry); } }
      // gatehouse + stair to the courtyard, falcon banners
      gate(ex, ez + pw + 1, { y: EY, ry: 0, mat: marble, w: 12, d: 6, h: 12, tr: 2.6 });
      // Moon Door: a pale threshold & balcony on the cliff side (north-west) of the hall
      b.box(marble, ex - 18.5, EY + 2.5, ez - 2, 4, 2.2, 5, 0); b.box(flat(0xe8e0c8, { rough: 0.8 }), ex - 17.2, EY + 5, ez - 2, 0.3, 4.2, 1.8, 0);
      for (const sz of [-1, 1]) b.box(marbleB, ex - 17.3, EY + 5, ez - 2 + sz * 1.3, 0.7, 5.2, 0.5, 0);
      // sky cells: open shelves cut into the eastern cliff (sloping floors, bars on the open sides)
      for (let i = 0; i < 3; i++) {
        const cx = ex + 33.5 + i * 0.4, cz = ez - 6 + i * 6, cy = EY - 8 - i * 7;
        b.box(stoneD, cx + 2, cy, cz, 7, 1, 5, 0, 0xffffff, 0, -0.08); b.box(stoneD, cx - 1.2, cy, cz, 0.8, 5, 5, 0);
        for (let k = -2; k <= 2; k++) b.box(iron, cx + 5, cy + 1, cz + k, 0.12, 3.6, 0.12, 0);
      }
      // godswood garden (small, snow-dusted) in the courtyard
      b.box(stoneD, ex - 8, EY + 5, ez - 8, 9, 0.3, 7, 0.3);
      root.add(K.forest({ rng: K.rng(5), count: 1, bounds: [ex - 11, ez - 10, ex - 5, ez - 6], heightAt: () => EY + 5, species: 'weirwood', scale: [1.0, 1.0] }));
      root.add(K.forest({ rng: K.rng(6), count: 6, bounds: [ex - 13, ez - 12, ex - 3, ez - 4], heightAt: () => EY + 5, species: 'pine', scale: [0.45, 0.7], minDist: 2, snow: true }));
      // banners
      var bannerItems = centers.map(([tx, tz, h], i) => ({ x: tx + 3.4, y: EY + 4.8 + h * 0.78, z: tz, w: 3, h: 9, color: 0x5b93c9, ry: i * 0.7 }));
      var towerTops = centers.map(([tx, tz, h]) => [tx, EY + 4.8 + h + 20, tz]);
    }

    // ------------------------------------------------------------ mule path with waycastles
    const pathPts = K.smoothPath(path, 5);
    ribbonUp(b, tri('cobble', { color: 0xc2bcae, scale: 5, snow: false }), pathPts, 5.5, heightAt, 0.25, 0xffffff, 0.1);
    const wc = (i) => { const [x, z] = path[i]; return [x, z, H(x, z)]; };
    // Stone: low, squat, ironbound gate between two stout towers
    { const [x, z, y] = wc(2); gate(x, z, { y, ry: 0.6, mat: stone, w: 16, d: 8, h: 14, tr: 4 }); b.box(stone, x + 9, y, z - 8, 12, 7, 8, 0.2, vary(0.85)); b.prism(roofD, x + 9, y + 7, z - 8, 13, 3.4, 9, 0.2); b.box(stone, x - 9, y, z + 8, 10, 6, 7, -0.2, vary(0.85)); b.prism(roofD, x - 9, y + 6, z + 8, 11, 3, 8, -0.2); K.wall(b, [[x - 24, z + 14], [x - 8, z + 4], [x + 8, z - 4], [x + 24, z - 14]], { h: 6, t: 2.4, mat: stone, heightAt, sink: 8 }); }
    // Snow: tower and hall built into the rock face
    { const [x, z, y] = wc(4); sqTower(x, z, { w: 10, h: 22, y, mat: stoneD, roof: 'gable', roofH: 6 }); tower2(x + 10, z - 4, { r: 4.2, h: 17, y, mat: stone, roof: 'cone', roofH: 8 }); bldg(x - 9, z + 3, { w: 14, d: 10, h: 8, wall: stone, roof: roofD, rh: 4, ry: 0.4, y, lit: 0.8, chim: 1 }); }
    // Sky: last waycastle, with the timber winch frame and basket that hauls guests the last stretch
    { const [x, z, y] = wc(6); tower2(x, z, { r: 4.6, h: 24, y, mat: stone, roof: 'flat', seg: 12, win_: 3 }); sqTower(x + 11, z + 2, { w: 8, h: 14, y, mat: stoneD, roof: 'pyr', roofH: 6 }); b.box(wood, x - 8, y, z - 4, 1.2, 28, 1.2, 0); b.box(wood, x - 8, y + 27, z - 4, 1.2, 1.2, 9, 0); b.box(wood, x - 8, y + 18, z - 4, 0.8, 0.8, 8, 0, 0xffffff, 0.0, 0); }
    // Gates of the Moon: the castle at the foot of the mountain
    { const [gx, gz, gy] = sites[3]; const pts = [[gx - 38, gz - 22], [gx + 38, gz - 22], [gx + 38, gz + 22], [gx - 38, gz + 22]];
      K.wall(b, pts, { h: 11, t: 3, mat: stone, capMat: stone, heightAt, closed: true });
      for (let i = 0; i < 4; i++) { const [px, pz] = pts[i]; tower2(px, pz, { r: 5, h: 19, y: H(px, pz), mat: stone, roof: 'cone', roofH: 9, seg: 12, win_: 3 }); }
      gate(gx, gz - 22, { y: gy, mat: stone, w: 18, d: 8, h: 15, tr: 4 });
      sqTower(gx + 8, gz + 4, { w: 20, d: 15, h: 22, y: gy, mat: stone, roof: 'gable', roofH: 8 });
      for (const [ox, oz] of [[-8, -8], [8, -8], [-8, 8], [8, 8]]) tower2(gx + 8 + ox, gz + 4 + oz * 0.7, { r: 2.6, h: 28, y: gy, mat: stone, roof: 'cone', roofH: 7, seg: 8, win_: 2 });
      bldg(gx - 22, gz + 8, { w: 24, d: 10, h: 8, wall: stone, roof: roofD, rh: 4.4, y: gy, lit: 0.8, chim: 2, doorX: 0 });
      // town beneath the walls
      const pal = [[0.88, 0.83, 0.73], [0.82, 0.78, 0.68], [0.9, 0.88, 0.82]], rr = K.rng(12);
      const pts2 = K.scatter({ rng: K.rng(12), count: q.dens(34), bounds: [gx - 90, gz + 30, gx + 90, gz + 120], minDist: 9 });
      const plaster = tri('plaster', { color: 0xd9d1bb, scale: 6 });
      for (const [x, z] of pts2) { const p = pal[Math.floor(rr() * 3)]; bldg(x, z, { w: rr.range(6, 10), d: rr.range(5, 8), h: rr.range(3.6, 5), ry: (Math.round(rr() * 3) * Math.PI) / 2 * 0 + rr.range(-0.3, 0.3), wall: plaster, wcol: rgb(...p), roof: roofD, rh: rr.range(2.6, 3.6), lit: 0.6, chim: rr() < 0.6 ? 1 : 0 }); } }
    root.add(b.build({})); root.add(lampB.build({ shadow: false }));

    // ------------------------------------------------------------ Alyssa's Tears: a bright braided cascade draped over the western shoulder, with spray at the foot
    {
      const line = [[-44, 76], [-60, 96], [-84, 124], [-116, 160], [-142, 196]], pts = K.smoothPath(line, 7), N = pts.length;
      const pos = [], uv = [], idx = []; let acc = 0;
      pts.forEach(([x, z], i) => { if (i) acc += Math.hypot(x - pts[i - 1][0], z - pts[i - 1][1]); const a = pts[Math.max(0, i - 1)], c2 = pts[Math.min(N - 1, i + 1)]; let dx = c2[0] - a[0], dz = c2[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; const w = 3 + (i / N) * 5;
        for (const s of [-1, 1]) { const px = x - dz * w * s, pz = z + dx * w * s; pos.push(px, H(px, pz) + 1.0, pz); uv.push(s < 0 ? 0 : 1, acc * 0.08); } });
      for (let i = 0; i < N - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
      const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uTime: K.shared.uTime, uDim: { value: 1 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform float uTime, uDim; varying vec2 vUv; void main(){ float e = smoothstep(0.0,0.22,vUv.x) * smoothstep(1.0,0.78,vUv.x); float s = sin(vUv.y*6.0 - uTime*2.6 + sin(vUv.x*9.0)*2.0)*0.5+0.5; float s2 = sin(vUv.y*17.0 - uTime*4.0 + vUv.x*13.0)*0.5+0.5; float s3 = sin(vUv.x*26.0 + sin(vUv.y*3.0)*3.0)*0.5+0.5; float a = e * (0.5 + 0.28*s + 0.14*s2 + 0.12*s3); vec3 c = mix(vec3(0.78,0.9,1.0), vec3(1.0), s2*0.6); gl_FragColor = vec4(c * uDim, a * 0.85); }' });
      dimmers.push((n) => { m.uniforms.uDim.value = 1 - 0.72 * n; });
      const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 3; mesh.frustumCulled = false; root.add(mesh);
      root.add(dimSmoke(K.smoke([[-140, H(-140, 192) + 2, 194], [-132, H(-132, 182) + 4, 184], [-146, H(-146, 200) + 2, 200], [-100, H(-100, 144) + 2, 144], [-70, H(-70, 110) + 2, 110]], { color: 0xf4f8ff, size: 70, rise: 40, opacity: 0.4, perStack: 10, spread: 12 })));
    }
    // ------------------------------------------------------------ vale vegetation & ground cover
    const oakF = K.forest({ rng: K.rng(77), count: q.dens(260), bounds: [-420, 90, 420, 520], heightAt, species: 'oak', scale: [0.8, 1.3], minDist: 8, tint: 0x5a8040, avoid: (x, z) => H(x, z) < -0.5 || H(x, z) > 20 || Math.hypot(x - 8, z - 278) < 70 }); root.add(oakF);
    root.add(K.forest({ rng: K.rng(82), count: q.dens(110), bounds: [-420, 90, 420, 520], heightAt, species: 'oak', scale: [0.7, 1.1], minDist: 8, tint: 0x8aa24a, avoid: (x, z) => H(x, z) < -0.5 || H(x, z) > 20 || Math.hypot(x - 8, z - 278) < 70 }));
    root.add(K.forest({ rng: K.rng(78), count: q.dens(560), bounds: [-240, 60, 240, 300], heightAt, species: 'pine', snow: true, tint: 0x2a4636, minDist: 4.6, avoid: (x, z) => H(x, z) < 12 || H(x, z) > 230 || K.distToPolyline(x, z, path).d < 9 }));
    {
      const rocks = new Inst(G.sphere(5), tri('rock', { color: 0x7d7f86, scale: 3 })), caps = new Inst(G.sphere(5), snowM);
      for (let i = 0; i < q.dens(120); i++) { const a = rng() * 6.28, r = rng.range(60, 250), x = Math.cos(a) * r, z = Math.sin(a) * r, y = H(x, z); if (y < 8 || y > 300) continue; const s = rng.range(1.4, 4.5); rocks.add(x, y - s * 0.3, z, s * 1.2, s * 0.8, s, rng() * 3, vary(0.75)); if (y > 120) caps.add(x, y + s * 0.2, z, s * 0.9, s * 0.34, s * 0.75, rng() * 3); }
      root.add(rocks.build(), caps.build());
    }

    // ------------------------------------------------------------ life: falcons, mist, clouds, banners, winch basket, mules
    const fal = K.birds({ center: [0, EY + 40, ez], radius: 70, count: q.dens(14), color: 0xdfe3ea, size: 1.8, spreadY: 40, seed: 11 }); root.add(fal); dimmed(fal.material.color, 0.7); ctx.onUpdate((dt, t) => fal.userData.update(t));
    const fal2 = K.birds({ center: [0, 160, 200], radius: 120, count: q.dens(8), color: 0x7e8794, size: 1.8, spreadY: 50, seed: 3, speed: 0.07 }); root.add(fal2); ctx.onUpdate((dt, t) => fal2.userData.update(t));
    const [sx, sz, sy] = wc(6), bx = sx - 8, bz = sz - 4;
    const basket = new THREE.Group(); { const bb = new Batch(); bb.box(wood, 0, 0, 0, 2.4, 0.3, 2.4); for (const [px, pz] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]]) bb.box(wood, px, 0, pz, 0.15, 1.6, 0.15); basket.add(bb.build({})); }
    root.add(basket);
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 4), iron); root.add(rope);
    const topY = EY - 6, botY = sy + 3;
    ctx.onUpdate((dt, t) => { const u = 0.5 - 0.5 * Math.cos(t * 0.12); const y = botY + u * (topY - botY - 6); basket.position.set(bx, y, bz); rope.scale.y = Math.max(1, sy + 27 - (y + 2)); rope.position.set(bx, y + 2 + rope.scale.y / 2, bz); });
    const bannerSet = (items) => { const pb = new Batch(), pm = flat(0x3a2c20, { rough: 0.9 }); for (const it of items) pb.cyl(pm, it.x, it.y - (it.h ?? 5) - 0.6, it.z, 0.13, (it.h ?? 5) + 1.4, { seg: 5 }); const g = new THREE.Group(); g.add(pb.build({ shadow: false }), K.banners(items, { pole: false })); return g; };
    root.add(bannerSet(bannerItems));
    const wk = K.walkers({ paths: [pathPts.slice(0, 40), pathPts.slice(30)], heightAt, count: q.dens(10), rng: K.rng(4), speed: [0.6, 1.1], colors: [0x6b5a44, 0x4d5a6a, 0x7a3a34, 0x66656a] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    root.add(dimSmoke(K.smoke(chimneys.filter((_, i) => i % 2 === 0), { size: 22, rise: 16, opacity: 0.28, color: 0xdfe3e8, perStack: 4 })));
    root.add(dimSmoke(K.smoke([[0, 250, 300], [200, 120, 240], [-210, 140, 220], [60, 200, 200]], { color: 0xffffff, size: 220, rise: 30, opacity: 0.2, perStack: 12, spread: 40 })));
    root.add(dimSmoke(K.smoke(Array.from({ length: 12 }, (_, i) => [Math.cos(i * 0.52) * 300, 30 + (i % 3) * 14, Math.sin(i * 0.52) * 300]), { color: 0xeef3f9, size: 300, rise: 14, opacity: 0.2, perStack: 6, spread: 50 })));
    root.add(dimClouds(K.clouds({ y: 90, extent: 700, count: 18, opacity: 0.6, color: 0xffffff, seed: 7 })));
    root.add(dimClouds(K.clouds({ y: 210, extent: 500, count: 7, opacity: 0.4, color: 0xf0f4fa, seed: 9 })));
    const fire = K.fires([[ex - 4, EY + 9, ez + 27], [ex + 4, EY + 9, ez + 27], [sx, sy + 28, sz], [8, H(8, 262) + 3, 262]], { size: 7, light: 0 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    const w1 = wc(2), w2 = wc(4), w3 = wc(6);
    return {
      radius: 300, center: [0, 200, 120], minDistance: 18,
      hero: { pos: [178, 340, 410], target: [0, 322, 88] },
      climate: {
        atmos: 'day', weather: 'clear', snow: 0.35,
        tint: {
          day: { top: 0x3d74bf, horizon: 0xb6d2ec, fog: 0xbdd3e8, sunC: 0xfff3de, sunI: 3.1, elev: 0.36, az: 2.25, hemiSky: 0xa9c9ee, hemiGround: 0x5f5a4c, hemiI: 1.05, fogD: 0.0010 },
          dawn: { top: 0x4a5f9c, horizon: 0xf0b592, fog: 0xdcb7a3, sunC: 0xffbd86, sunI: 3.0, hemiSky: 0x9aa8d6, hemiGround: 0x54443f, fogD: 0.0012 },
          dusk: { top: 0x26376e, horizon: 0xe8845e, fog: 0xc88a82, sunC: 0xff8a48, sunI: 3.0, az: 2.0, elev: 0.14, hemiSky: 0x8a90c8, hemiGround: 0x453636, fogD: 0.0013 },
          night: { top: 0x070e2e, horizon: 0x253860, fog: 0x1b2744, sunC: 0x9fb4ff, sunI: 1.2, hemiSky: 0x5d70b0, hemiGround: 0x1e2434, hemiI: 1.1, fogD: 0.0013 },
        },
      },
      landmarks: {
        'gates-of-the-moon': lm(8, 278, 36, 24),
        'stone-waycastle': { pos: [w1[0], w1[2] + 20, w1[1]], r: 14 },
        'snow-waycastle': { pos: [w2[0], w2[2] + 28, w2[1]], r: 14 },
        'sky-waycastle': { pos: [w3[0], w3[2] + 30, w3[1]], r: 14 },
        'giants-lance': { pos: [0, 700, 0], r: 50, cam: { pos: [140, 540, 300], target: [0, 560, 0] } },
        'alyssas-tears': lm(-84, 124, 18, 6),
        'eyrie-towers': { pos: [0, EY + 98, ez], r: 26 },
        'high-hall': { pos: [ex, EY + 32, ez], r: 18 },
        'moon-door': { pos: [ex - 17.6, EY + 10.5, ez - 2], r: 5, cam: { pos: [ex - 60, EY + 22, ez + 30], target: [ex - 17, EY + 8, ez - 2] } },
        'sky-cells': { pos: [ex + 35, EY - 6, ez + 2], r: 8, cam: { pos: [ex + 80, EY - 10, ez + 50], target: [ex + 35, EY - 12, ez + 2] } },
        'eyrie-godswood': { pos: [ex - 8, EY + 14, ez - 8], r: 8 },
        'the-vale': { pos: [60, 80, 480], r: 80 },
      },
      cutaways: [{ id: 'high-hall', name: { en: 'High Hall & Moon Door (cutaway)', zh: '高厅与月门（剖面）' }, build: buildHall }],
    };
  },
};

function buildHall(ctx) {
  const g = ctx.root, b = new Batch(), W = 44, D = 16, Hh = 18;
  const marble = tri('marble', { color: 0xe8ecf3, scale: 5, snow: false }), vein = tri('marble', { color: 0x8aa0c0, scale: 3, snow: false }), floor = tri('marble', { color: 0xc7ccd6, scale: 4, snow: false }), wood = tri('wood', { color: 0xe3dccb, scale: 3, snow: false }), dark = tri('wood', { color: 0x4a3524, scale: 3, snow: false });
  b.box(floor, 0, -0.5, 0, W + 4, 0.5, D + 3);
  b.box(marble, 0, 0, -D / 2, W, Hh, 1); b.box(marble, -W / 2, 0, 0, 1, Hh, D); b.box(marble, W / 2, 0, 0, 1, Hh, D);
  for (let i = -4; i <= 4; i++) for (const s of [-1, 1]) b.cyl(vein, i * 4.6, 0, s * 5.6, 0.55, Hh - 1, { top: 0.8, seg: 10 }); // blue-veined columns
  for (let i = -4; i <= 4; i++) b.box(flat(0xaecdf2, { rough: 0.4 }), i * 4.6 + 2.3, 5, -D / 2 + 0.6, 1.2, 8, 0.15); // tall arched windows (pale sky)
  // Moon Door at the head of the hall: narrow pale door between two slender pillars, dark void beyond; floor stops at a sill
  const hx = -W / 2 + 1;
  b.box(dark, hx + 0.3, 0, 0, 0.3, 7, 2.2); b.box(marble, hx + 0.2, 0, -2.2, 0.8, 9, 0.7); b.box(marble, hx + 0.2, 0, 2.2, 0.8, 9, 0.7);
  b.box(flat(0x1a2433), hx - 0.2, 0, 0, 0.2, 7.2, 3);
  // long table, benches, and the lord's seat on a low dais at the east end
  b.box(dark, 0, 2.2, 0, 24, 0.3, 1.6); for (let i = -5; i <= 5; i++) b.box(dark, i * 2.2, 0, 0, 0.3, 2.2, 1.2);
  b.box(marble, W / 2 - 5, 0, 0, 8, 1, 10); b.box(wood, W / 2 - 3, 1, 0, 1.5, 4.5, 2.4);
  g.add(b.build({}));
  const fire = K.fires([[-12, 4.5, -7], [12, 4.5, -7], [W / 2 - 4, 6, -5]], { size: 6, light: 3, intensity: 55 }); g.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
  const lamp = new THREE.PointLight(0xdfeaff, 160, 70, 1.4); lamp.position.set(0, 14, 5); g.add(lamp);
  const mist = K.smoke([[-W / 2 - 2, 1, -2], [-W / 2 - 3, 2, 2]], { color: 0xffffff, size: 22, rise: 5, opacity: 0.35, perStack: 8, spread: 2 }); g.add(mist);
  return { center: [0, 5, 0], hero: { pos: [4, 9, 34], target: [-4, 5, -2] }, minDistance: 6, maxDistance: 70 };
}
