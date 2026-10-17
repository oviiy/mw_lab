// Castle Black & the Wall. Book anchors: the Wall (~700 ft ice, ~300 miles, weathered, with a tunnel gate guarded by iron/ice gates, a lift,
// a long wooden stair), Castle Black with most of its keeps ruinous (Lord Commander's Tower, King's Tower, Hardin's Tower, Commander's Keep,
// armory, hall, Maester Aemon's rookery, stables), the Gift to the south, the Haunted Forest to the north, the Kingsroad.
// Plan, positions and shapes are interpretation — see content/castle-black.js.
// Visual language: the Wall is one continuous displaced ice cliff with blue strata, frost streaks, a corniced crown and a cold inner glow;
// Castle Black is small, dark and weathered at its foot (black stone, tarred timber, broken roofs, trodden slush, warm window-light).
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const WALL_H = 213; // ~700 ft
const wz = (x) => 0.00035 * x * x; // the Wall bows gently away to the south so it reads in perspective
const rgb = (r, g, b) => (Math.min(255, (r * 255) | 0) << 16) | (Math.min(255, (g * 255) | 0) << 8) | Math.min(255, (b * 255) | 0);

export default {
  build(ctx) {
    const q = ctx.q, rng = K.rng(21), root = ctx.root;
    const vary = (lo = 0.8) => { const v = lo + rng() * (1 - lo); return rgb(v, v * (0.98 + rng() * 0.05), v * (1.0 + rng() * 0.06)); };
    // ---------------------------------------------------------------- terrain
    const heightAt = (x, z) => {
      let h = (K.fbm(x * 0.012, z * 0.012, 4, 3) - 0.5) * 16 * K.smoothstep(110, 260, Math.hypot(x, z - 60));
      h += (K.fbm(x * 0.05, z * 0.05, 2, 8) - 0.5) * 1.2 * K.smoothstep(60, 130, Math.hypot(x * 0.8, z - 70));
      h += K.smoothstep(-40, -380, z) * 70 * (K.fbm(x * 0.006, z * 0.006, 3, 5) + 0.2);
      h += K.smoothstep(260, 640, Math.abs(x)) * 40 + K.smoothstep(380, 700, z) * 30;
      return h;
    };
    const H = heightAt;
    const gnd = (x, z, rad) => Math.min(H(x, z), H(x + rad, z), H(x - rad, z), H(x, z + rad), H(x, z - rad));
    const snowC = new THREE.Color(0xe2ebf1), shade = new THREE.Color(0xbccbd9), rockC = new THREE.Color(0x585b62), needle = new THREE.Color(0x4f5a58), c = new THREE.Color();
    const colorAt = (x, z, h, s) => {
      const n = K.fbm(x * 0.02, z * 0.02, 3, 4), n2 = K.fbm(x * 0.08, z * 0.08, 2, 6);
      c.copy(snowC).lerp(shade, K.smoothstep(0.45, 0.7, n) * 0.7 + (n2 - 0.5) * 0.2);
      if (z < -34) c.lerp(needle, K.smoothstep(0.35, 0.6, n2) * 0.35 * K.smoothstep(-34, -80, z));
      c.lerp(rockC, K.clamp(s * 3 - 0.1, 0, 0.85));
      return c;
    };
    root.add(K.terrain({ size: 1500, seg: q.seg(172), heightAt, kind: 'rock', scale: 16, colorAt }));
    const farH = (x, z) => { const e = Math.max(Math.abs(x), Math.abs(z)); return H(x, z) - 10 * (1 - K.smoothstep(690, 752, e)) + K.smoothstep(700, 1500, e) * (50 + K.fbm(x * 0.003, z * 0.003, 3, 6) * 140); };
    root.add(K.terrain({ size: 5200, seg: q.seg(90), heightAt: farH, kind: 'rock', scale: 30, colorAt }));

    // ---------------------------------------------------------------- materials
    const ice = tri('snow', { color: 0xb8d3ee, scale: 24, rough: 0.28, metal: 0.04, snow: false, emissive: 0x1f4676, bump: 0.5 });
    const iceB = tri('snow', { color: 0xc4dcf2, scale: 24, rough: 0.28, metal: 0.04, snow: false, emissive: 0x1f4676, bump: 0.5 });
    const snowM = tri('snow', { color: 0xf1f6fb, scale: 9, snow: false, rough: 0.85, bump: 0.35 });
    const iceShard = flat(0xdcecf8, { rough: 0.2, metal: 0.05, emissive: 0x3a74b0, flatShading: true });
    const stone = tri('stone', { color: 0x8a8e98, scale: 7 }), stoneD = tri('stone', { color: 0x666a74, scale: 7 }), stoneL = tri('stone', { color: 0xa4a8b2, scale: 7 });
    const slate = tri('slate', { color: 0x363c48, scale: 6 });
    const wood = tri('wood', { color: 0x4a3a28, scale: 4, snow: false }), woodD = tri('wood', { color: 0x2e2419, scale: 4, snow: false }), woodR = tri('wood', { color: 0x5a4733, scale: 4, snow: true });
    const iron = flat(0x4b4f57, { metal: 0.6, rough: 0.5 }), char = flat(0x14120f, { rough: 1 }), dark = flat(0x0d1015, { rough: 1 });
    const win = glow(0xffb35a, 1.6), winO = glow(0xff8f40, 1.5), unlit = flat(0x1b222c, { rough: 0.5, metal: 0.2 });
    const slush = tri('rock', { color: 0xd2d8e0, scale: 5, snow: false, bump: 0.45, }), mud = tri('rock', { color: 0xb3a999, scale: 4, snow: false, bump: 0.6 });
    const b = new Batch(), wb = new Batch(), lampB = new Batch();
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

    // ---------------------------------------------------------------- THE WALL: one displaced ice cliff with strata, frost streaks, cornice
    const topAt = (x) => WALL_H - (Math.abs(x) > 420 ? 24 * K.smoothstep(420, 640, Math.abs(x)) : 0) - (K.fbm(x * 0.02, 3.3, 3, 8) - 0.4) * 16;
    const wgt = (x) => (x > 38 && x < 126 ? 1 - K.smoothstep(38, 48, x) * (1 - K.smoothstep(116, 126, x)) : x > -48 && x < -20 ? 1 - K.smoothstep(-48, -40, x) * (1 - K.smoothstep(-28, -20, x)) : 1) * K.smoothstep(12, 34, Math.abs(x));
    const faceT = (x, y, side) => {
      const w = wgt(x), n = K.fbm(x * 0.03 + side * 9, y * 0.025, 3, 11) - 0.5, n2 = K.fbm(x * 0.17, y * 0.012 + side, 3, 5) - 0.5, sw = y / 38 - Math.floor(y / 38);
      let t = 17.5 + w * (n * 11 + n2 * 6.5 + 1.0 + 2.4 * K.smoothstep(0.72, 1.0, sw) * (0.6 + n));
      t += w * 7 * (1 - K.smoothstep(0, 34, y)) * (0.7 + n2); // talus apron
      t += w * 4.5 * K.smoothstep(WALL_H - 38, WALL_H - 4, y) * (0.6 + n * 1.4); // cornice
      return t;
    };
    const wallCol = (x, y, side) => {
      const hn = Math.min(1, y / WALL_H), n1 = K.fbm(x * 0.02 + side * 7, y * 0.06, 3, 4);
      const band = Math.sin(y * 0.16 + n1 * 7) * 0.5 + 0.5, band2 = Math.sin(y * 0.72 + n1 * 11 + x * 0.01) * 0.5 + 0.5, streak = K.fbm(x * 0.5, y * 0.022, 2, 9);
      const deep = band * 0.62 + band2 * 0.3 + (side < 0 ? 0.1 : 0);
      let r = 0.5 + 0.34 * hn - deep * 0.36, g = 0.66 + 0.24 * hn - deep * 0.22, bb = 0.9 + 0.08 * hn - deep * 0.06;
      const dirt = (1 - K.smoothstep(0, 28, y)) * 0.55; r = K.lerp(r, 0.46, dirt); g = K.lerp(g, 0.52, dirt); bb = K.lerp(bb, 0.58, dirt);
      const fr = K.smoothstep(0.58, 0.78, streak) * 0.22; r += fr; g += fr; bb += fr * 0.5;
      return [Math.min(1, r), Math.min(1, g), Math.min(1, bb)];
    };
    {
      const pos = [], col = [], idx = [];
      const grid = (nu, nv, P, C, out) => {
        const base = pos.length / 3;
        for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const p = P(i / nu, j / nv); pos.push(p[0], p[1], p[2]); const cc = C(p); col.push(cc[0], cc[1], cc[2]); }
        const tris = [];
        for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = base + j * (nu + 1) + i, bq = a + 1, c2 = a + nu + 1, d = c2 + 1; tris.push([a, c2, bq], [bq, c2, d]); }
        const [a, bq, c3] = tris[0], pa = pos.slice(a * 3, a * 3 + 3), pb = pos.slice(bq * 3, bq * 3 + 3), pc = pos.slice(c3 * 3, c3 * 3 + 3);
        const e1 = [pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]], e2 = [pc[0] - pa[0], pc[1] - pa[1], pc[2] - pa[2]];
        const nx = e1[1] * e2[2] - e1[2] * e2[1], ny = e1[2] * e2[0] - e1[0] * e2[2], nz = e1[0] * e2[1] - e1[1] * e2[0];
        const flip = nx * out[0] + ny * out[1] + nz * out[2] < 0;
        for (const t of tris) idx.push(...(flip ? [t[0], t[2], t[1]] : t));
      };
      for (const [xa, xb] of [[-660, 660]]) {
        const nu = Math.max(4, Math.round(Math.abs(xb - xa) / 7)), nv = 46;
        const X = (u) => xa + (xb - xa) * u;
        const S = (u, v) => { const x = X(u), top = topAt(x), y = -8 + (top + 8) * v; return [x, y, wz(x) + faceT(x, y, 1)]; };
        const N = (u, v) => { const x = X(u), top = topAt(x), y = -8 + (top + 8) * v; return [x, y, wz(x) - faceT(x, y, -1) + 0.5]; };
        grid(nu, nv, S, (p) => wallCol(p[0], p[1], 1), [0, 0, 1]);
        grid(nu, nv, N, (p) => wallCol(p[0], p[1], -1), [0, 0, -1]);
        grid(nu, 8, (u, v) => { const x = X(u), top = topAt(x), s = S(u, 1), n = N(u, 1), z = K.lerp(n[2], s[2], v); const bump = (K.fbm(x * 0.06, v * 4, 3, 14) - 0.5) * 6 * Math.sin(v * Math.PI); return [x, top + bump + 3 * Math.sin(v * Math.PI), z]; }, (p) => [0.94, 0.98, 1.0], [0, 1, 0]);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
      g.computeVertexNormals(); g.computeBoundingSphere();
      const m = new THREE.Mesh(g, ice); m.receiveShadow = true; m.castShadow = false; root.add(m);
    }
    // gate mouth: the tunnel is painted into the cliff by a dark recess framed in pale ice, on both faces
    {
      const z0 = wz(0);
      for (const sd of [1, -1]) {
        const zf = z0 + sd * 17.55;
        b.box(flat(0x080b10, { rough: 1 }), 0, 0, zf + sd * 0.25, 7, 8.5, 0.9, 0);
        for (const s of [-1, 1]) b.box(iceB, s * 4.3, 0, zf + sd * 0.35, 1.5, 10.2, 1.2, 0, 0xe8f2fa);
        b.box(iceB, 0, 8.5, zf + sd * 0.35, 10.2, 1.8, 1.2, 0, 0xe8f2fa);
        for (let k = -3; k <= 3; k++) b.box(iron, k * 0.95, 0, zf + sd * 0.8, 0.2, 8.2, 0.2, 0);
      }
    }
    // icicles along the crown and under the cornice (instanced); ice shards bristling from the strata
    {
      const icG = new THREE.ConeGeometry(1, 1, 5).rotateX(Math.PI).translate(0, -0.5, 0);
      const icicles = new Inst(icG, iceShard, { cast: false });
      for (let i = 0; i < q.dens(380); i++) { const x = rng.range(-300, 300); if (Math.abs(x) < 12) continue; const h = rng.range(5, 22), y = topAt(x) - rng.range(8, 44), w = wgt(x); icicles.add(x, y - h, wz(x) + faceT(x, y, 1) - 0.2, rng.range(0.5, 1.4), h, rng.range(0.5, 1.4), rng() * 3); }
      root.add(icicles.build());
      const sh = new Inst(G.cone(4), iceShard, { cast: false });
      for (let i = 0; i < q.dens(220); i++) { const x = rng.range(-420, 420); if (Math.abs(x) < 20 || wgt(x) < 0.5) continue; const y = rng.range(40, topAt(x) - 6), s = rng.range(2, 5); sh.add(x, y, wz(x) + faceT(x, y, 1) + 0.5, s * 0.5, s * 1.4, s * 0.5, rng() * 3); }
      root.add(sh.build());
    }
    // tunnel: dark passage + iron gates (south, middle, north)
    const tz = wz(0);
    lampB.box(winO, -4.6, 6.0, tz + 19, 0.5, 0.8, 0.5, 0); lampB.box(winO, 4.6, 6.0, tz + 19, 0.5, 0.8, 0.5, 0);
    // top of the Wall: watch platform with timber crane, braziers and sentry hut above Castle Black
    const topY = WALL_H - 8;
    b.box(woodR, 0, topY, wz(0), 46, 1.2, 12, 0); b.box(woodD, 0, topY - 1, wz(0), 40, 1.0, 9, 0); b.box(wood, -18, topY + 1.2, wz(-18), 9, 5, 7, 0); b.prism(slate, -18, topY + 6.2, wz(-18), 10, 3.5, 8, 0); b.prism(snowM, -18, topY + 6.5, wz(-18), 10.3, 3.5, 7.2, 0);
    for (let i = -5; i <= 5; i++) b.cyl(woodD, i * 4, topY, wz(0) + 6, 0.25, 2.2, { seg: 5 }); b.box(woodD, 0, topY + 1.9, wz(0) + 6, 44, 0.2, 0.25, 0);
    // ---------------------------------------------------------------- stair: long zigzag of timber flights climbing the south face
    const SX0 = 52, SX1 = 112, FL = 7, rise = WALL_H / FL, ang = Math.atan2(rise, SX1 - SX0), len = Math.hypot(SX1 - SX0, rise);
    const stairZ = (x) => wz(x) + 17.5 + 1;
    for (let i = 0; i < FL; i++) {
      const up = i % 2 === 0, y0 = i * rise, xA = up ? SX0 : SX1, xB = up ? SX1 : SX0, cx = (SX0 + SX1) / 2;
      b.box(wood, cx, y0, stairZ(cx), len, 1.2, 4.2, 0, 0xffffff, 0, up ? ang : -ang);
      for (const sd of [-1, 1]) b.box(woodD, cx, y0 + 1.6, stairZ(cx) + sd * 2, len, 0.35, 0.3, 0, 0xffffff, 0, up ? ang : -ang);
      b.box(woodR, xB, y0 + rise - 0.4, stairZ(xB), 10, 1.0, 5, 0); b.box(snowM, xB, y0 + rise + 0.6, stairZ(xB), 9.6, 0.15, 4.6, 0);
      for (let k = 0; k <= 4; k++) { const u = k / 4, px = xA + (xB - xA) * u, py = y0 + rise * u; if (py > 3) b.cyl(woodD, px, 0, stairZ(px) + 2.2, 0.55, py, { seg: 5 }); }
    }
    // ---------------------------------------------------------------- winch & cage lift (west of the gate), an animated iron cage
    const LX = -34, lz = (x) => wz(x) + 18.5;
    for (const sx of [-2.2, 2.2]) b.box(woodD, LX + sx, 0, lz(LX), 0.9, WALL_H - 4, 0.9, 0);
    for (let y = 20; y < WALL_H - 10; y += 22) b.box(woodD, LX, y, lz(LX), 5.2, 0.5, 0.5, 0);
    b.box(wood, LX, WALL_H - 5, lz(LX) + 3, 7, 0.9, 8, 0); b.box(wood, LX, WALL_H - 5, lz(LX) + 6.5, 4.5, 3, 0.7, 0);
    const cage = new THREE.Group(); {
      const cb = new Batch();
      cb.box(wood, 0, 0, 0, 3.8, 0.35, 3.8); for (const [px, pz] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) cb.box(iron, px, 0, pz, 0.14, 3.2, 0.14);
      for (const k of [-1.2, 0, 1.2]) { cb.box(iron, k, 0.3, 1.85, 0.08, 2.9, 0.08); cb.box(iron, k, 0.3, -1.85, 0.08, 2.9, 0.08); cb.box(iron, 1.85, 0.3, k, 0.08, 2.9, 0.08); cb.box(iron, -1.85, 0.3, k, 0.08, 2.9, 0.08); }
      cb.box(iron, 0, 3.2, 0, 3.8, 0.15, 3.8); cage.add(cb.build({})); cage.position.set(LX, 6, lz(LX) + 6.5);
    }
    root.add(cage);
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 4), iron); root.add(rope);
    ctx.onUpdate((dt, t) => { const u = 0.5 - 0.5 * Math.cos(t * 0.05); const y = 6 + u * (WALL_H - 22); cage.position.y = y; rope.scale.y = WALL_H - 5 - (y + 3.4); rope.position.set(LX, y + 3.4 + rope.scale.y / 2, lz(LX) + 6.5); });

    // ---------------------------------------------------------------- building helpers (black stone, tarred timber, snow on every ledge)
    const chimneys = [];
    const window_ = (f, ry, lx, lz2, y, w, h, lit = 1, mat = win) => { const [x, z] = f(lx, lz2); b.box(dark, x, y - 0.25, z, w + 0.5, h + 0.5, 0.25, ry); b.box(lit ? mat : unlit, x, y, z, w, h, 0.34, ry); };
    const snowGable = (x, y, z, w, rh, d, ry, cov = 0.9) => b.prism(snowM, x, y + rh * (1 - cov) + 0.14, z, w + 0.35, rh, d * cov, ry);
    const chimney = (f, ry, lx, lz2, y, hh) => { const [x, z] = f(lx, lz2); b.box(stoneD, x, y, z, 1.4, hh, 1.4, ry, vary(0.8)); b.box(stoneD, x, y + hh, z, 1.9, 0.35, 1.9, ry); b.box(snowM, x, y + hh + 0.35, z, 1.6, 0.18, 1.6, ry); chimneys.push([x, y + hh + 1, z]); };
    const bldg = (x, z, o) => {
      const { w, d, h, ry = 0, wall = stone, wcol = 0xffffff, roof = slate, rcol = 0xffffff, rh = Math.min(w, d) * 0.55, chim = 0, lit = 0.7, doorX = null, beams = false } = o;
      const f = rot(x, z, ry), y = gnd(x, z, Math.max(w, d) * 0.5);
      b.box(stoneD, x, y - 1.6, z, w + 0.5, 2.5, d + 0.5, ry, vary(0.8));
      b.box(wall, x, y - 1.2, z, w, h + 1.2, d, ry, wcol);
      if (beams) { b.box(woodD, x, y + h * 0.5, z, w + 0.14, 0.26, d + 0.14, ry); for (const sx of [-1, 0, 1]) for (const sz of [-1, 1]) { const [px, pz] = f(sx * (w / 2 - 0.15), sz * (d / 2 + 0.02)); b.box(woodD, px, y + 0.9, pz, 0.3, h - 0.9, 0.3, ry); } }
      b.box(stoneD, x, y + h - 0.2, z, w + 0.5, 0.5, d + 0.5, ry, vary(0.8));
      b.prism(roof, x, y + h + 0.3, z, w + 1.4, rh, d + 1.3, ry, rcol); snowGable(x, y + h + 0.3, z, w + 1.4, rh, d + 1.3, ry, 0.8 + rng() * 0.14);
      for (let i = 0; i < chim; i++) chimney(f, ry, (i ? -1 : 1) * (w / 2 - 1.3), 0, y + h - 0.5, rh + 1.6);
      const nW = Math.max(1, Math.round(w / 4.5));
      for (const sz of [-1, 1]) for (let i = 0; i < nW; i++) { const lx = (i - (nW - 1) / 2) * (w / nW); if (doorX !== null && sz === 1 && Math.abs(lx - doorX) < 1.5) continue; window_(f, ry, lx, sz * (d / 2 + 0.04), y + h * 0.5, 0.9, 1.3, rng() < lit ? 1 : 0, rng() < 0.7 ? win : winO); }
      if (doorX !== null) { const [px, pz] = f(doorX, d / 2 + 0.06); b.box(woodD, px, y, pz, 1.6, 2.4, 0.3, ry); }
      return y;
    };
    const tower2 = (x, z, o) => {
      const { r = 4, h = 24, roof = 'cone', roofH = r * 2.6, mat = stone, seg = 12, y = gnd(x, z, r), col = vary(0.86), win_ = 3, taper = 0.9, rcol = vary(0.85) } = o;
      b.cyl(stoneD, x, y - 3, z, r + 0.8, 5.5, { top: (r + 0.2) / (r + 0.8), seg, color: vary(0.85) });
      b.cyl(mat, x, y + 2.4, z, r + 0.15, h - 2.4, { top: taper * r / (r + 0.15), seg, color: col });
      for (let k = 1; k <= 2; k++) { const yy = y + (h * k) / 3, rr = r * (1 - (1 - taper) * (k / 3)) + 0.28; b.cyl(stoneD, x, yy, z, rr, 0.5, { top: 1, seg, color: vary(0.85) }); }
      const rt = r * taper;
      for (let i = 0; i < win_; i++) { const a = (i * 2.4 + x * 0.3) % (Math.PI * 2), yy = y + h * (0.28 + 0.2 * i), rr = r * (1 - (1 - taper) * ((yy - y) / h)) + 0.12; b.box(rng() < 0.7 ? winO : unlit, x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr, 0.5, 1.7, 0.22, -a + Math.PI / 2); }
      b.cyl(stoneD, x, y + h - 1.3, z, rt + 0.2, 1.3, { top: 1.2, seg, color: vary(0.8) });
      const rr = rt * 1.2 + 0.1;
      if (roof === 'cone') { b.cone(slate, x, y + h, z, rr + 0.5, roofH, { seg, color: rcol }); b.cone(snowM, x, y + h + roofH * 0.46, z, (rr + 0.5) * 0.54 * 1.1, roofH * 0.54 + 0.18, { seg }); b.cyl(iron, x, y + h + roofH, z, 0.1, 2.4, { seg: 4 }); }
      else if (roof === 'flat') {
        b.cyl(stoneD, x, y + h, z, rr + 0.35, 0.7, { top: 1, seg, color: vary(0.8) });
        const n = Math.max(7, Math.round((Math.PI * 2 * rr) / 2.3));
        for (let i = 0; i < n; i++) { if (o.ruin && rng() < 0.4) continue; const a = (i / n) * Math.PI * 2; b.box(stone, x + Math.cos(a) * (rr + 0.1), y + h + 0.7, z + Math.sin(a) * (rr + 0.1), 1.2, o.ruin ? rng.range(0.5, 1.4) : 1.4, 0.7, -a + Math.PI / 2, vary(0.82)); }
        b.cyl(snowM, x, y + h + 0.7, z, rr - 0.5, 0.25, { top: 1, seg });
      }
      return y;
    };
    const sqTower = (x, z, o) => {
      const { w = 9, d = w, h = 28, ry = 0, roof = 'pyr', roofH = w * 0.95, mat = stone, y = gnd(x, z, w * 0.6), col = vary(0.88) } = o;
      const f = rot(x, z, ry);
      b.box(stoneD, x, y - 3, z, w + 1.2, 5.4, d + 1.2, ry, vary(0.85));
      b.box(mat, x, y - 1.2, z, w, h + 1.2, d, ry, col);
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const [px, pz] = f(sx * (w / 2), sz * (d / 2)); b.box(stoneL, px, y, pz, 1.1, h, 1.1, ry, vary(0.84)); }
      for (const k of [0.34, 0.68]) b.box(stoneD, x, y + h * k, z, w + 0.5, 0.5, d + 0.5, ry, vary(0.85));
      const nw = Math.max(2, Math.floor(h / 8));
      for (let i = 1; i <= nw; i++) for (const s of [-1, 1]) window_(f, ry, i % 2 ? -w * 0.18 : w * 0.18, s * (d / 2 + 0.05), y + (h * i) / (nw + 1), 0.8, 1.7, o.dead ? 0 : rng() < 0.55 ? 1 : 0, winO);
      b.box(stoneD, x, y + h - 1.0, z, w + 1.3, 1.0, d + 1.3, ry, vary(0.8));
      const yt = y + h;
      if (roof === 'pyr') { b.pyramid(slate, x, yt, z, w + 1.4, roofH, d + 1.4, ry, vary(0.85)); b.pyramid(snowM, x, yt + roofH * 0.42, z, (w + 1.4) * 0.58 * 1.08, roofH * 0.58 + 0.2, (d + 1.4) * 0.58 * 1.08, ry); b.cyl(iron, x, yt + roofH, z, 0.1, 2.2, { seg: 4 }); }
      else if (roof === 'flat') {
        b.box(stoneD, x, yt, z, w + 1.2, 0.6, d + 1.2, ry);
        for (const [ox, oz, sx, sz] of [[0, d / 2 + 0.4, w * 0.62, 0.7], [0, -d / 2 - 0.4, w * 0.62, 0.7], [w / 2 + 0.4, 0, 0.7, d * 0.62], [-w / 2 - 0.4, 0, 0.7, d * 0.62]]) { const [px, pz] = f(ox, oz); b.box(stone, px, yt + 0.6, pz, sx, o.ruin ? rng.range(0.6, 1.6) : 1.5, sz, ry, vary(0.84)); }
        b.box(snowM, x, yt + 0.6, z, w - 0.2, 0.25, d - 0.2, ry);
      }
      return y;
    };
    const rubble = (x, z, n, spread) => { for (let i = 0; i < n; i++) { const px = x + rng.range(-spread, spread), pz = z + rng.range(-spread, spread), s = rng.range(0.9, 3.0); b.box(stoneD, px, H(px, pz) - 0.3, pz, s * rng.range(1, 1.6), s * 0.7, s, rng() * 3, vary(0.7)); if (rng() < 0.7) b.box(snowM, px, H(px, pz) + s * 0.7 - 0.3, pz, s * 1.1, 0.16, s * 0.9, 0); } };

    // ---------------------------------------------------------------- CASTLE BLACK (mostly ruinous; black stone, tarred timber)
    // Commander's Keep: stout keep with a fire-gutted top
    { const x = -34, z = 42, y = H(x, z); sqTower(x, z, { w: 20, d: 17, h: 22, roof: 'flat', mat: stoneD, ruin: true, dead: true, y });
      for (let i = 0; i < 9; i++) { const px = x + rng.range(-8, 8), pz = z + rng.range(-6, 6); b.box(char, px, y + 22.6, pz, rng.range(0.4, 0.9), rng.range(2, 5), rng.range(0.4, 0.9), 0, 0xffffff, rng.range(-0.3, 0.3), rng.range(-0.3, 0.3)); }
      for (let i = 0; i < 4; i++) b.box(flat(0x1a1816), x + rng.range(-8, 8), y + 12 + rng() * 8, z + 8.55, rng.range(0.6, 1.4), rng.range(4, 9), 0.1, 0); // soot streaks
      rubble(x, z + 12, 7, 8); }
    // Lord Commander's Tower: tall round stone tower nearest the Wall
    tower2(8, 38, { r: 6.5, h: 40, roof: 'cone', roofH: 15, seg: 14, win_: 4 });
    // King's Tower: square guest tower, roof intact
    sqTower(-66, 30, { w: 12, d: 12, h: 34, roof: 'pyr', roofH: 13 });
    // Hardin's Tower: severe lean, broken battlement, rubble spilling into the yard
    { const hy = H(64, 36);
      b.box(stoneD, 64, hy - 3, 36, 10.5, 38.5, 10.5, 0, vary(0.8), 0, 0.075); for (const k of [0.3, 0.6]) b.box(stoneL, 64 - 38 * k * 0.075, hy + 38 * k, 36, 11.2, 0.6, 11.2, 0, vary(0.8), 0, 0.075);
      b.box(stoneD, 61, hy + 33.5, 35, 4, 4, 8, 0.3, vary(0.8), 0, 0.075); b.box(stoneD, 66.5, hy + 31, 37, 3, 3, 3, 0.6, vary(0.8), 0, 0.075); b.box(snowM, 61, hy + 37.6, 35, 4.2, 0.2, 8.2, 0.3);
      for (let i = 0; i < 3; i++) b.box(flat(0x2a2a30), 64 - 2.3, hy + 8 + i * 9, 36 + 5.4, 0.9, 1.8, 0.2, 0);
      rubble(56, 40, 10, 8); }
    // Armory with forge
    bldg(-6, 66, { w: 28, d: 10, h: 7, wall: stone, roof: slate, rh: 5.5, chim: 2, lit: 0.9, doorX: -3 });
    b.box(stoneD, 9.5, H(9.5, 66), 66, 4, 14, 4, 0); b.box(snowM, 9.5, H(9.5, 66) + 14, 66, 4.4, 0.2, 4.4, 0);
    // Shield Hall (timber hall)
    bldg(36, 74, { w: 34, d: 14, h: 9, wall: wood, wcol: vary(0.9), roof: woodR, rcol: 0xdfe5ea, rh: 7, chim: 2, lit: 0.8, beams: true, doorX: 0 });
    // Maester Aemon's keep with the ravenry: stone footing, timber loft, open cote
    { const x = -52, z = 78, ry0 = H(x, z);
      b.box(stoneD, x, ry0 - 1, z, 9.5, 7.5, 9.5, 0, vary(0.8)); b.box(wood, x, ry0 + 6.5, z, 8.4, 9, 8.4, 0, vary(0.9)); b.box(woodD, x, ry0 + 6.5, z, 9, 0.4, 9, 0);
      b.prism(woodR, x, ry0 + 15.5, z, 10, 5, 10, 0, 0xe2e6ea); snowGable(x, ry0 + 15.5, z, 10, 5, 10, 0, 0.88);
      for (let i = -1; i <= 1; i++) b.box(dark, x + i * 2.4, ry0 + 11, z + 4.25, 1.4, 2.2, 0.15, 0);
      for (const [ox, oz] of [[-4.2, -4.2], [4.2, -4.2], [-4.2, 4.2], [4.2, 4.2]]) b.box(woodD, x + ox, ry0 + 15, z + oz, 0.3, 4.5, 0.3);
      b.box(woodD, x + 6, ry0 + 8, z, 2.6, 5.5, 3.2, 0); b.prism(woodR, x + 6, ry0 + 13.5, z, 3.2, 1.6, 3.8, Math.PI / 2, 0xdfe5ea);
      window_(rot(x, z, 0), 0, 0, 4.4, ry0 + 9.5, 1.0, 1.4, 1, win);
      chimney(rot(x, z, 0), 0, -3, -2, ry0 + 14, 5); }
    // stables: two long timber barns
    bldg(-84, 64, { w: 32, d: 12, h: 5.5, wall: wood, wcol: vary(0.9), roof: woodR, rcol: 0xdfe5ea, rh: 5, ry: Math.PI / 2, lit: 0.5, beams: true, doorX: 0 });
    bldg(-66, 100, { w: 26, d: 10, h: 5, wall: wood, wcol: vary(0.9), roof: woodR, rcol: 0xdfe5ea, rh: 4.4, lit: 0.5, doorX: 4 });
    // ruined towers, stubs of curtain wall, rubble
    for (const [x, z, w, h] of [[96, 16, 8, 24], [-100, 14, 7, 18], [104, 80, 9, 14], [-110, 112, 8, 22], [10, 112, 7, 12], [58, 104, 7, 10], [-30, 124, 8, 16]]) {
      const y = H(x, z), ry = rng() * 3;
      b.box(stoneD, x, y - 3, z, w + 1, 4.5, w + 1, ry, vary(0.78)); b.box(stone, x, y - 1.5, z, w, h + 1.5, w, ry, vary(0.8));
      for (let i = 0; i < 4; i++) b.box(stone, x + rng.range(-w / 2, w / 2), y + h, z + rng.range(-w / 2, w / 2), rng.range(1.2, 3), rng.range(0.8, 3), rng.range(1.2, 3), rng() * 3, vary(0.78));
      b.box(snowM, x, y + h, z, w * 0.8, 0.2, w * 0.8, ry); rubble(x, z, 7, w * 0.9);
      for (let i = 0; i < 2; i++) b.box(dark, x + (w / 2) * 0, y + h * 0.4 + i * h * 0.3, z + w / 2 + 0.05, 0.7, 1.8, 0.2, 0);
    }
    for (let i = 0; i < 7; i++) { const x = -120 + i * 38, z = 138 + Math.sin(i) * 6, w = rng.range(14, 30); b.box(stoneD, x, H(x, z) - 1, z, w, rng.range(2.5, 6), 3, rng.range(-0.1, 0.1), vary(0.78)); b.box(snowM, x, H(x, z) + 5.4, z, w * 0.9, 0.16, 3.2, 0); }
    // yard: practice posts, plank walkway along the foot of the Wall, barrels, crates, fences
    for (let i = 0; i < 6; i++) { const x = -20 + i * 5, y = H(x, 100); b.cyl(wood, x, y, 100, 0.3, 2.4, { seg: 6 }); b.box(woodD, x, y + 1.7, 100, 1.5, 0.22, 0.22, 0); b.box(snowM, x, y + 2.4, 100, 0.55, 0.1, 0.55, 0); }
    b.box(woodR, 0, 0.15, 21, 60, 0.3, 3, 0); b.box(woodD, 0, 0.0, 21, 60.6, 0.2, 3.4, 0);
    const bar = new Inst(G.cyl(8, 0.9), wood), crate = new Inst(G.box(), woodD);
    for (let i = 0; i < q.dens(46); i++) { const a = rng() * 6.28, rr = rng.range(10, 70), x = -10 + Math.cos(a) * rr * 1.4, z = 62 + Math.sin(a) * rr * 0.6; if (z < 28) continue; const y = H(x, z); if (rng() < 0.6) bar.add(x, y, z, 0.55, 1.1, 0.55, 0); else crate.add(x, y, z, 1.2, 1.1, 1.2, rng() * 3); }
    root.add(bar.build(), crate.build());
    // trodden slush & mud decals + roads (non-snowing materials so paths stay readable under snowfall)
    {
      const blob = (cx, cz, rx, rz, seed, n = 16) => { const r2 = K.rng(seed); return Array.from({ length: n }, (_, i) => { const a = (i / n) * 6.283, k = 1 + (r2() - 0.5) * 0.35; return [cx + Math.cos(a) * rx * k, cz + Math.sin(a) * rz * k]; }); };
      wb.extrude(mud, blob(-6, 62, 78, 46, 3), 0.18, 0.1, 0xb0a8a0); wb.extrude(slush, blob(0, 68, 92, 56, 5), 0.1, 0.1, vary(0.9)); wb.extrude(slush, blob(0, 8, 62, 12, 7), 0.12, 0.1, vary(0.9));
      wb.extrude(mud, blob(-40, 98, 26, 14, 9), 0.22, 0.1, 0xb0a8a0);
      const road = [[0, 440], [20, 340], [-16, 260], [6, 180], [0, 120], [0, 22]];
      ribbonUp(wb, slush, K.smoothPath(road, 6), 8, heightAt, 0.2, vary(0.9), 0.1);
      ribbonUp(wb, slush, K.smoothPath([[0, -16], [-4, -80], [-24, -200], [6, -330], [10, -420]], 6), 6, heightAt, 0.2, vary(0.9), 0.1);
      ribbonUp(wb, mud, [[0, 24], [8, 38], [8, 60], [0, 70]], 4, heightAt, 0.24, 0xa8a09a, 0.1);
    }
    root.add(b.build({})); root.add(wb.build({ shadow: false })); root.add(lampB.build({ shadow: false }));
    // snow drifts at the Wall's foot, against buildings, and ice boulders fallen from the Wall
    {
      const drift = new Inst(G.sphere(9), snowM), blocks = new Inst(G.sphere(5), iceShard);
      for (let i = 0; i < q.dens(150); i++) { const x = rng.range(-300, 300), z = wz(x) + 20 + rng.range(3, 12) * (rng() < 0.5 ? 1 : 0.4); if (Math.abs(x) < 14) continue; drift.add(x, H(x, z) - 0.3, z, rng.range(4, 11), rng.range(1, 3.2), rng.range(3, 7), rng() * 0.3); }
      for (let i = 0; i < q.dens(70); i++) { const x = rng.range(-90, 100), z = rng.range(34, 126), y = H(x, z); drift.add(x, y - 0.3, z, rng.range(2, 6), rng.range(0.6, 1.4), rng.range(2, 4), rng() * 3); }
      for (let i = 0; i < q.dens(60); i++) { const x = rng.range(-300, 300); if (Math.abs(x) < 14) continue; const z = wz(x) + 24 + rng.range(0, 10), s = rng.range(2, 6); blocks.add(x, H(x, z) - s * 0.2, z, s, s * rng.range(0.6, 1.2), s * rng.range(0.7, 1.3), rng() * 3); }
      root.add(drift.build(), blocks.build());
    }

    // ---------------------------------------------------------------- forests: Haunted Forest (north) and the Gift (south)
    root.add(K.forest({ rng: K.rng(77), count: q.dens(780), bounds: [-560, -520, 560, -30], heightAt, species: 'pine', snow: true, tint: 0x1f3a30, avoid: (x, z) => z > -24 - wz(x) || Math.abs(x - (-4 + z * 0.02)) < 5 }));
    root.add(K.forest({ rng: K.rng(81), count: q.dens(420), bounds: [-560, -520, 560, -30], heightAt, species: 'pine', snow: true, tint: 0x2c4a3b, scale: [0.9, 1.5], avoid: (x, z) => z > -24 - wz(x) || Math.abs(x - (-4 + z * 0.02)) < 5 }));
    root.add(K.forest({ rng: K.rng(78), count: q.dens(300), bounds: [-520, 130, 520, 520], heightAt, species: 'pine', snow: true, tint: 0x28443a, scale: [0.7, 1.1], minDist: 7, avoid: (x, z) => Math.abs(x - Math.sin(z * 0.02) * 12) < 12 || (Math.abs(x) < 140 && z < 170) }));
    root.add(K.forest({ rng: K.rng(79), count: 1, bounds: [-62, -102, -58, -98], heightAt, species: 'weirwood', scale: [1.8, 1.8] }));

    // ---------------------------------------------------------------- life
    root.add(dimSmoke(K.smoke(chimneys.map(([x, y, z]) => [x, y, z]).concat([[-34, 26, 42], [-6, 80, 66]]), { size: 24, rise: 18, opacity: 0.32, color: 0xb8bcc2, perStack: 5 })));
    const fireP = [[-4, 2.2, 28], [6, 2.2, 28], [-8, 3, 66], [30, 2, 90], [0, 7.5, wz(0) - 15], [-30, 2.5, 75], [60, 2.5, 60], [20, topY + 4, wz(20) + 2], [-18, topY + 8, wz(-18) + 2], [80, 2, 110], [0, 7.5, wz(0) + 21]];
    const fire = K.fires(fireP, { size: 8, light: q.low ? 0 : 3 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const wk = K.walkers({ paths: [[[-40, 98], [-6, 92], [30, 90], [50, 60], [20, 40], [-20, 52]], [[0, 30], [0, 118], [4, 200]], [[-70, 80], [-50, 92], [-60, 55]]], heightAt, count: q.dens(26), rng: K.rng(6), colors: [0x16161a, 0x1c1c22, 0x24232a, 0x111114, 0x2e2e36] });
    root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const rav = K.birds({ center: [-52, 105, 78], radius: 44, count: q.dens(12), color: 0x0e0e12, size: 1.1, spreadY: 14, seed: 4 }); root.add(rav); ctx.onUpdate((dt, t) => rav.userData.update(t));
    const bannerSet = (items) => { const pb = new Batch(), pm = flat(0x3a2c20, { rough: 0.9 }); for (const it of items) pb.cyl(pm, it.x, it.y - (it.h ?? 5) - 0.6, it.z, 0.13, (it.h ?? 5) + 1.4, { seg: 5 }); const g = new THREE.Group(); g.add(pb.build({ shadow: false }), K.banners(items, { pole: false })); return g; };
    root.add(bannerSet([{ x: -66, y: 54, z: 30, w: 3.5, h: 8, color: 0x1b1b1f, ry: 0.2 }, { x: 8, y: 62, z: 38, w: 3.5, h: 8, color: 0x1b1b1f, ry: 0.4 }, { x: 0, y: WALL_H - 2, z: wz(0) + 6, w: 4, h: 9, color: 0x1b1b1f, ry: 0.1 }, { x: 36, y: 96, z: 74, w: 3, h: 7, color: 0x1b1b1f, ry: 0.3 }]));
    root.add(dimSmoke(K.smoke([[-200, 220, -40], [150, 250, -20], [0, 235, -60], [320, 200, wz(320) - 20], [-320, 190, wz(-320) - 20]], { size: 260, rise: 20, opacity: 0.14, color: 0xdfe9f1, perStack: 10, spread: 30 }))); // wind-blown snow off the crown
    root.add(dimSmoke(K.smoke(Array.from({ length: 12 }, (_, i) => [-330 + i * 60, 6, wz(-330 + i * 60) + 40]), { size: 120, rise: 26, opacity: 0.1, color: 0xe3eef6, perStack: 4, spread: 18 }))); // cold mist along the foot of the Wall
    root.add(dimClouds(K.clouds({ y: 340, extent: 800, count: 10, opacity: 0.35, color: 0xdbe4ec })));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 260, center: [0, 70, 30], minDistance: 20,
      hero: { pos: [-300, 100, 400], target: [10, 92, 10] },
      climate: {
        atmos: 'day', weather: 'snow', snow: 0.9,
        tint: {
          day: { top: 0x5a7aa0, horizon: 0xb7c8d8, fog: 0xaec0d3, sunC: 0xfff1da, sunI: 2.4, elev: 0.42, az: 0.95, hemiSky: 0xaec4de, hemiGround: 0x6d7078, hemiI: 1.3, fogD: 0.0008 },
          dawn: { top: 0x4a6290, horizon: 0xe8b4a0, fog: 0xbfadb6, sunC: 0xffbf8e, sunI: 2.9, az: 1.1, elev: 0.16, hemiSky: 0x9aa9d0, hemiGround: 0x4b4644, hemiI: 0.9, fogD: 0.0011 },
          dusk: { top: 0x2a3a6e, horizon: 0xd88a78, fog: 0x9a8fa6, sunC: 0xff9a66, sunI: 3.0, az: 1.9, elev: 0.15, hemiSky: 0x8190c0, hemiGround: 0x413a3f, hemiI: 0.85, fogD: 0.0011 },
          night: { top: 0x060c28, horizon: 0x203760, fog: 0x16233f, sunC: 0x8fb0ff, sunI: 1.2, hemiSky: 0x5b70b0, hemiGround: 0x1e2434, hemiI: 1.15, fogD: 0.0015 },
        },
      },
      landmarks: {
        'the-wall': { pos: [150, WALL_H + 6, wz(150)], r: 30 },
        'wall-gate': { pos: [0, 12, wz(0)], r: 9, cam: { pos: [-16, 9, 62], target: [0, 5, 0] } },
        'winch-lift': { pos: [LX, 80, lz(LX) + 6], r: 14, cam: { pos: [-90, 60, 90], target: [LX, 60, lz(LX)] } },
        'wall-stairs': { pos: [82, 100, stairZ(82)], r: 22, cam: { pos: [60, 80, 120], target: [82, 100, 20] } },
        'lord-commanders-tower': lm(8, 38, 10, 46),
        'kings-tower': lm(-66, 30, 10, 36),
        'hardins-tower': lm(64, 36, 10, 36),
        'commanders-keep': lm(-34, 42, 12, 24),
        'armory': lm(-6, 66, 12, 8),
        'shield-hall': lm(36, 74, 14, 10),
        'ravenry': lm(-52, 78, 9, 20),
        'stables': lm(-84, 64, 14, 6),
        'haunted-forest': lm(40, -150, 50, 20),
        'kingsroad-gift': lm(4, 190, 40, 6),
      },
      cutaways: [{ id: 'wall-gate', name: { en: 'Gate tunnel & ice cells (cutaway)', zh: '城门隧道与冰牢（剖面）' }, build: buildTunnel }],
    };
  },
};

function buildTunnel(ctx) {
  const g = ctx.root, b = new Batch(), L = 60;
  const ice = tri('snow', { color: 0x9fc3dc, scale: 5, rough: 0.3, snow: false }), floor = tri('cobble', { color: 0x58595c, scale: 4, snow: false });
  const iron = flat(0x4b4f57, { metal: 0.6, rough: 0.5 }), wood = tri('wood', { color: 0x4a3a28, scale: 3, snow: false }), dark = flat(0x07090c, { rough: 1 });
  b.box(floor, 0, -0.5, 0, 12, 0.5, L + 6); b.box(ice, 3.8, 0, 0, 3, 14, L); b.box(ice, -3.8, 0, 0, 3, 14, L); b.box(ice, 0, 7.5, 0, 12, 6, L); // ceiling & walls (side opened in the shot by camera angle)
  b.box(ice, 0, 0, -L / 2, 12, 14, 1); // north end wall with exit gap below
  for (const z of [-L / 2 + 6, 0, L / 2 - 6]) { for (let k = -3; k <= 3; k++) b.box(iron, k * 0.95, 0, z, 0.22, 7.4, 0.22); b.box(iron, 0, 7.2, z, 6.4, 0.35, 0.35); }
  // ice cells: recessed doors in the east wall
  for (let i = -2; i <= 2; i++) { b.box(dark, 2.25, 0, i * 9.5, 0.3, 4.8, 3.4, 0); b.box(wood, 2.0, 0, i * 9.5, 0.25, 4.5, 3.0, 0); for (let k = -1; k <= 1; k++) b.box(iron, 1.8, 2.8, i * 9.5 + k, 0.1, 0.9, 0.1); }
  g.add(b.build({}));
  const fire = K.fires([[-2.9, 4.5, -18], [-2.9, 4.5, 0], [-2.9, 4.5, 18], [-2.9, 4.5, 8]], { size: 5, light: 3, intensity: 40, color: 0xff9a3c }); g.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
  const lamp = new THREE.PointLight(0xbfe0ff, 260, 70, 1.3); lamp.position.set(0, 6.5, 14); g.add(lamp);
  return { center: [0, 4, 0], hero: { pos: [-0.5, 3.6, 36], target: [1, 3.8, -20] }, minDistance: 5, maxDistance: 60 };
}
