// Lannisport — moderate scene. Book anchors: a rich, large, busy western port at the foot of Casterly Rock, with a great harbour, walls and a Great Sept.
// Grey stone + red roofs, orderly streets, gate lions, breakwaters and lighthouse are mostly wiki-level or interpretation (see content).
//
// Visual language: a strict grid of grey-stone houses under rows of crimson tile, lion-gold finials and bunting on the avenues, the banded
// gold-and-russet bulk of Casterly Rock standing over the town, a tall gold-capped lighthouse; warm western light that turns amber at dusk.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const TAU = Math.PI * 2;
const WALL = [[-150, 74], [-156, -56], [-112, -120], [0, -136], [112, -120], [156, -56], [150, 74]];
const coastZ = (x) => 100 + 6 * Math.sin(x * 0.03 + 0.7);
const PAL = { sept: [-70, -34], palace: [38, -26], market: [-6, 10] };
const ROCKS = [[-90, -340, 95, 62, 150], [-10, -350, 72, 52, 195], [70, -330, 72, 56, 128]];

const jit = (hex, r, dh = 0.012, ds = 0.05, dl = 0.03) => new THREE.Color(hex).offsetHSL((r() - 0.5) * 2 * dh, (r() - 0.5) * 2 * ds, (r() - 0.5) * 2 * dl);
const tint = (r, v = 0.12, w = 0.05) => { const k = 1 - v * r(); return new THREE.Color(k, k * (1 - w * r()), k * (1 - w * r() * 1.4)); };
const _up = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _d = new THREE.Vector3(), _e = new THREE.Euler();
const loc = (cx, cz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c]; };
function strut(b, mat, p, q, w, color = 0xffffff, d = w) {
  _d.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); const len = _d.length(); if (len < 1e-3) return;
  _q.setFromUnitVectors(_up, _d.multiplyScalar(1 / len)); _m.compose(_p.set(p[0], p[1], p[2]), _q, _s.set(w, len, d)); b.addGeometry(mat, G.box(), _m, color);
}
const _quad = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
function quad(b, mat, x, y, z, ry, w, h) { _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(w, h, 1)); b.addGeometry(mat, _quad, _m, 0xffffff); }
const archCache = new Map();
function archGeo(w, h, depth) {
  const k = `${w}|${h}|${depth}`; let g = archCache.get(k); if (g) return g;
  const r = w / 2, s = new THREE.Shape(); s.moveTo(-r, 0); s.lineTo(-r, h - r); s.absarc(0, h - r, r, Math.PI, 0, true); s.lineTo(r, 0); s.closePath();
  g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 4 }); archCache.set(k, g); return g;
}
function arch(b, mat, x, y, z, ry, w, h, depth = 0.25, color = 0xffffff) { _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(1, 1, 1)); b.addGeometry(mat, archGeo(w, h, depth), _m, color); }
/** Terrain on a non-uniform grid: fine cells over [a..b], coarsening smoothly outside, so cliffs get resolution without a huge mesh. */
function warpTerrain({ x: [xl, xh, xa, xb], z: [zl, zh, za, zb], fine = 3, coarse = 14, ramp = 160, heightAt, colorAt, kind = 'rock', scale = 16 }) {
  const axis = (lo, hi, a, b) => { const v = [lo]; let p = lo; while (p < hi) { const d = p < a ? a - p : p > b ? p - b : 0; p += K.lerp(fine, coarse, K.smoothstep(0, ramp, d)); v.push(Math.min(p, hi)); } v[v.length - 1] = hi; return v; };
  const xs = axis(xl, xh, xa, xb), zs = axis(zl, zh, za, zb), nx = xs.length, nz = zs.length, pos = new Float32Array(nx * nz * 3), idx = new Uint32Array((nx - 1) * (nz - 1) * 6);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const o = (j * nx + i) * 3; pos[o] = xs[i]; pos[o + 1] = heightAt(xs[i], zs[j]); pos[o + 2] = zs[j]; }
  let k = 0; for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals();
  const nor = g.attributes.normal, col = new Float32Array(nx * nz * 3), c = new THREE.Color();
  for (let v = 0; v < nx * nz; v++) { c.set(colorAt(pos[v * 3], pos[v * 3 + 2], pos[v * 3 + 1], 1 - nor.getY(v))); col[v * 3] = c.r; col[v * 3 + 1] = c.g; col[v * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(g, tri(kind, { scale, rough: 0.95, color: 0xffffff })); m.receiveShadow = true; return m;
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root;
    const rockProfile = (x, z) => {
      let r = 0; const n = K.fbm(x * 0.02, z * 0.02, 3, 5) - 0.5, n2 = K.fbm(x * 0.06, z * 0.06, 2, 8) - 0.5;
      for (const [cx, cz, rx, rz, hh] of ROCKS) {
        const d = Math.hypot((x - cx) / rx, (z - cz) / rz) + n * 0.34 + n2 * 0.05, t0 = K.clamp((0.93 - d) / 0.12, 0, 1);
        const dd = d + 0.1 * Math.sin(t0 * 14 + n2 * 9) * t0 * (1 - t0) * 4, p = Math.pow(K.clamp((0.93 - dd) / 0.12, 0, 1), 0.6), apron = 14 * (1 - K.smoothstep(0.85, 1.35, d));   // ledged strata, buttresses and coves
        r = Math.max(r, hh * p * (0.94 + 0.12 * K.fbm(x * 0.05, z * 0.05, 2, 6)), apron);
      }
      return r;
    };
    const heightAt = (x, z) => {
      const s = coastZ(x) - z;
      let land = 3.8 + (K.fbm(x * 0.012, z * 0.012, 3, 9) - 0.5) * 5 + K.smoothstep(-100, -320, z) * 10 + K.smoothstep(240, 420, Math.abs(x)) * 22;
      for (const [cx, cz, r, hh] of [[PAL.sept[0], PAL.sept[1], 30, 9], [PAL.palace[0], PAL.palace[1], 34, 12]]) land += hh * (1 - K.smoothstep(r * 0.4, r, Math.hypot(x - cx, z - cz)));
      let h = K.lerp(-6, land, K.smoothstep(-6, 3, s));
      const r = rockProfile(x, z);
      if (r > 0.4) { const f = r / 12, fl = Math.floor(f), rq = (fl + K.smoothstep(0.7, 1.0, f - fl)) * 12, rr = K.lerp(r, rq, 0.65 * K.smoothstep(8, 40, r)); h = Math.max(h, rr + (K.fbm(x * 0.06, z * 0.06, 3, 5) - 0.5) * 7 * K.smoothstep(10, 60, r)); }
      return h;
    };
    const H = heightAt, c = new THREE.Color(), C3 = (h) => new THREE.Color(h);
    const gold = C3(0xdcb676), amber = C3(0xc58c52), russet = C3(0x9a6040), umber = C3(0x70452f), cap = C3(0xd8c496), grass = C3(0x879a58), dry = C3(0xb3a56a), paved = C3(0x9d978a), sandC = C3(0xd9c894), meadow = C3(0x6f8c4c), dirtC = C3(0x9a8a68);
    const colorAt = (x, z, h, sl) => {
      const r = rockProfile(x, z);
      if (r > 12 && h > 10) {
        const n = K.fbm(x * 0.03, z * 0.03, 2, 4), streak = K.fbm(x * 0.45, h * 0.03, 2, 7), lay = Math.floor((h + n * 16) / 6.5), lh = K.noise2(lay * 3.17, 7.7, 3), lh2 = K.noise2(lay * 1.31, 2.2, 9);
        c.copy(lh < 0.28 ? russet : lh < 0.62 ? amber : gold).multiplyScalar(0.8 + 0.34 * lh2).lerp(cap, lh > 0.88 ? 0.5 : 0).multiplyScalar(0.84 + 0.2 * (1 - streak));
        if (sl < 0.12) c.lerp(cap, 0.5 * K.smoothstep(0.12, 0.0, sl)).lerp(meadow, 0.35 * K.smoothstep(0.7, 0.9, n + 0.2));      // flat ledges: pale dust and tufts
        c.lerp(umber, K.clamp(streak - 0.55, 0, 0.4));
        return c;
      }
      c.copy(grass).lerp(dry, K.fbm(x * 0.012, z * 0.012, 3, 8)).lerp(meadow, K.smoothstep(0.55, 0.75, K.fbm(x * 0.04, z * 0.04, 2, 3)) * 0.5);
      if (K.pointInPoly(x, z, WALL)) c.lerp(paved, 0.8); else if (r > 1) c.lerp(gold, K.clamp(r / 14, 0, 0.5)).lerp(dirtC, 0.2);
      if (h < 1.2) c.lerp(sandC, 0.8);
      return c;
    };
    root.add(warpTerrain({ x: [-450, 450, -210, 210], z: [-450, 450, -430, 120], fine: q.low ? 4.5 : 3.4, coarse: q.low ? 18 : 12, ramp: 150, heightAt, colorAt, kind: 'sand', scale: 22 }));
    const sea = K.water({ w: 900, d: 900, seg: q.seg(150), level: 0, heightAt, deep: 0x1d4f6b, shallow: 0x5da9ae, opacity: 0.92, choppy: 0.5, speed: 0.5 });
    root.add(sea); ctx.registerWater(sea);
    const farSea = K.water({ w: 8000, d: 8000, seg: 6, level: -0.4, heightAt: () => -20, deep: 0x1f5878, shallow: 0x1f5878, opacity: 0.93, choppy: 0.5, speed: 0.5, center: [0, 3600] }); root.add(farSea); ctx.registerWater(farSea);
    { const inX = (x) => 450 - Math.abs(x), inZ = (z) => z + 450, cF = C3(0x8a9a5a), cH = C3(0x9a8e68);
      root.add(K.terrain({ w: 8000, d: 6800, seg: q.seg(80), center: [0, -2800], heightAt: (x, z) => { const h = H(x, z), dIn = Math.max(0, Math.min(inX(x), inZ(z))); return h < 3 ? -25 : K.lerp(h, -40, K.smoothstep(0, 90, dIn)); }, kind: 'rock', scale: 40, colorAt: (x, z, h) => c.copy(cF).lerp(cH, K.clamp(h * 0.01, 0, 0.6)) })); }

    // ---- materials: grey western stone, crimson tile, gold
    const T = (k, color, scale = 7, o = {}) => tri(k, { color, scale, snow: false, ...o });
    const M = {
      stone: T('stone', 0xb9b7b0, 7, { bump: 0.6 }), stoneD: T('stone', 0x8b8a86, 7), stoneW: T('stone', 0x6c6c6a, 8), stoneL: T('stone', 0xd2cec2, 7), trim: T('stone', 0xe4e0d2, 6), marble: T('marble', 0xefece2, 7),
      tileA: T('tile', 0xc2432f, 5, { bump: 0.5 }), tileB: T('tile', 0xa93a2c, 5), tileC: T('tile', 0xcf5a3c, 5), tileD: T('tile', 0x8c2e26, 5), slate: T('slate', 0x575c66, 5),
      rockS: T('stone', 0xdcb884, 7, { bump: 0.6 }), plaster: T('plaster', 0xdcd2bd, 6), plaster2: T('plaster', 0xc9c3b4, 6), wood: T('wood', 0x6c4e31, 4), woodD: T('wood', 0x46321f, 4), woodW: T('wood', 0xa58a64, 4), cobble: T('cobble', 0x9f988a, 7), quay: T('cobble', 0xb2aa98, 6), hullW: T('wood', 0x8a6a4c, 3, { side: THREE.DoubleSide }),
      iron: flat(0x2c2e34, { metal: 0.6, rough: 0.5 }), dark: flat(0x100d0b, { rough: 1 }), door: flat(0x33271c, { rough: 0.9 }), gold: flat(0xe0b040, { metal: 0.3, rough: 0.4 }), cloth: flat(0xffffff, { rough: 1 }),
      glassR: flat(0xd04a4a, { rough: 0.4 }), glassB: flat(0x4a7ad0, { rough: 0.4 }), glassY: flat(0xe0c04a, { rough: 0.4 }),
      win: glow(0xffc870), lamp: glow(0xffa24a, 1.2), lampH: glow(0xffe0a0, 1.4), glassG: glow(0xffc060, 0.8),
    };
    const goldM = M.gold, b = new Batch(), rt = K.rng(7070);

    // ---- builders
    function drum(x, y, z, r, h, o = {}) {
      const { seg = 12, taper = 0.88, roof = 'cone', roofH = r * 2.4, stone = M.stone, base = M.stoneW, col = 0xffffff, slits = 2, lit = 1, rings = [0.5], roofMat = M.tileA, gilt = true } = o, rA = (t) => r * (1 - (1 - taper) * t);
      b.cyl(base, x, y - 4, z, r * 1.14, 6.6, { top: 0.9, seg, color: col }); b.cyl(stone, x, y, z, r, h, { top: taper, seg, color: col });
      for (const t of rings) b.cyl(M.trim, x, y + t * h - 0.3, z, rA(t) * 1.05, 0.6, { top: 1, seg, color: col });
      for (let k = 0; k < slits; k++) { const a = k * 2.1 + r * 1.3, t = 0.2 + 0.5 * k / slits, rr = rA(t) + 0.04; b.box(M.dark, x + Math.cos(a) * rr, y + h * t, z + Math.sin(a) * rr, 0.32, 1.7, 0.16, Math.PI / 2 - a); }
      for (let k = 0; k < lit; k++) { const a = k * 2.7 + 0.6 + r, t = 0.62 + 0.1 * k, rr = rA(t) + 0.05; b.box(M.win, x + Math.cos(a) * rr, y + h * t, z + Math.sin(a) * rr, 0.5, 1.5, 0.12, Math.PI / 2 - a); }
      const yt = y + h, R2 = rA(1) * 1.28; b.cyl(M.trim, x, yt - 1.4, z, rA(1) * 1.02, 1.5, { top: 1.28, seg, color: col });
      if (roof === 'cone') { b.cyl(stone, x, yt, z, R2, 0.8, { top: 1, seg, color: col }); b.cone(roofMat, x, yt + 0.8, z, R2 * 1.08, roofH, { seg, color: tint(rt, 0.14, 0.02) }); if (gilt) { b.cyl(goldM, x, yt + 0.6 + roofH, z, 0.16, 2.2, { seg: 5, top: 0.5 }); b.sphere(goldM, x, yt + 2.8 + roofH, z, 0.4, { seg: 6 }); } }
      else { b.cyl(stone, x, yt, z, R2, 0.9, { top: 1, seg, color: col }); const n = Math.max(7, Math.round((TAU * R2) / 2.7)); for (let i = 0; i < n; i++) { const a = (i / n) * TAU; b.box(stone, x + Math.cos(a) * (R2 - 0.3), yt + 0.9, z + Math.sin(a) * (R2 - 0.3), 1.4, 1.1, 0.7, Math.PI / 2 - a, col); } }
    }
    function wallTrim(pts, { h, t, closed = false, plinth = M.stoneW, trim = M.trim, plinthH = 2.8, g0 }) {
      const n = closed ? pts.length : pts.length - 1;
      for (let i = 0; i < n; i++) {
        const A = pts[i], B = pts[(i + 1) % pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz); if (len < 0.01) continue;
        const steps = Math.max(1, Math.ceil(len / 14)), ry = Math.atan2(-dz, dx);
        for (let s = 0; s < steps; s++) {
          const t0 = s / steps, t1 = (s + 1) / steps, x0 = A[0] + dx * t0, z0 = A[1] + dz * t0, x1 = A[0] + dx * t1, z1 = A[1] + dz * t1, hf = g0 ?? H;
          const g = Math.min(hf(x0, z0), hf(x1, z1), hf((x0 + x1) / 2, (z0 + z1) / 2)), top = Math.max(hf(x0, z0), hf(x1, z1)) + h, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sl = Math.hypot(x1 - x0, z1 - z0) + 0.6;
          b.box(plinth, cx, g - 3, cz, sl + 0.2, plinthH + 3, t + 1.4, ry, tint(rt, 0.14, 0.04)); b.box(trim, cx, top - 1.0, cz, sl, 0.95, t + 0.9, ry); b.box(trim, cx, g + (top - g) * 0.55, cz, sl, 0.4, t + 0.35, ry);
        }
      }
    }
    const torches = [], stacks = [], lampPosts = [];
    function gateDress(gx, gz, y, ry, { w, d, h, gate }) {
      const L = loc(gx, gz, ry), [bx, bz] = L(0, -d * 0.2); b.box(M.dark, bx, y, bz, gate - 0.2, gate * 1.15, 0.3, ry);
      b.box(M.trim, gx, y + gate * 1.15 - 0.8, gz, gate + 1.6, 0.8, d + 0.5, ry); b.box(M.trim, gx, y + h - 1.1, gz, w, 0.95, d + 1.5, ry);
      for (const sx of [-1, 1]) { const [px, pz] = L(sx * (gate / 2 + 1.5), d / 2 + 0.45); b.box(M.iron, px, y + 3.6, pz, 0.25, 0.9, 0.25, ry); b.box(M.lamp, px, y + 4.5, pz, 0.5, 0.6, 0.5, ry); torches.push([px, y + 5.4, pz]); }
    }
    function hall(x, z, w, d, h, ry, o = {}) {
      const { wallMat = M.stone, roofMat = M.tileA, col = tint(rt, 0.1, 0.04), rise = 0.7, y0 = H(x, z), nWin = Math.max(2, Math.floor(w / 5)) } = o, L = loc(x, z, ry), rh = (d / 2 + 0.5) * rise;
      b.box(M.stoneW, x, y0 - 2, z, w + 0.5, 3.2, d + 0.5, ry, tint(rt, 0.15, 0.04)); b.box(wallMat, x, y0 - 2, z, w, h + 2, d, ry, col); b.box(M.trim, x, y0 + h - 0.5, z, w + 0.5, 0.5, d + 0.5, ry);
      b.prism(roofMat, x, y0 + h, z, w + 1.0, rh, d + 1.0, ry, tint(rt, 0.14, 0.03)); b.box(M.tileD, x, y0 + h + rh - 0.1, z, w + 1.1, 0.35, 0.6, ry);
      for (const sd of [-1, 1]) for (let i = 0; i < nWin; i++) { const [wx, wz] = L((i + 0.5) * w / nWin - w / 2, sd * (d / 2 + 0.06)); arch(b, M.win, wx, y0 + h * 0.4, wz, ry + (sd < 0 ? Math.PI : 0), 1.0, 2.4, 0.12); }
      const [cx, cz] = L(w * 0.3, 0); b.box(M.stoneD, cx, y0 + h * 0.5, cz, 1.3, h * 0.5 + rh + 1.4, 1.3, ry); stacks.push([cx, y0 + h + rh + 1.8, cz]);
    }

    // ---- walls with round towers; three gates (golden lions guard them); harbour side opens to the quay
    K.wall(b, WALL, { h: 14, t: 3.6, mat: M.stone, capMat: M.stoneL, heightAt, color: 0xf2f0ea }); wallTrim(WALL, { h: 14, t: 3.6 });
    WALL.forEach(([x, z], i) => drum(x, H(x, z), z, 4.9, 22, { seg: 12, col: tint(rt, 0.06, 0.03), roofH: 10, lit: 1, rings: [0.35, 0.7] }));
    for (let i = 0; i < WALL.length - 1; i++) { const A = WALL[i], B = WALL[i + 1], m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; if (Math.abs(m[0]) > 30 && !(i === 2 || i === 3)) drum(m[0], H(m[0], m[1]), m[1], 3.8, 18, { seg: 10, col: tint(rt, 0.06, 0.03), roof: 'flat', lit: 0, slits: 2 }); }
    const lion = (x, y, z, ry, sc = 2.2) => { const cx = Math.cos(ry), cz = -Math.sin(ry); b.box(goldM, x, y + 0.9 * sc, z, 2.6 * sc, 1.2 * sc, 1.0 * sc, ry); b.sphere(goldM, x + cx * 1.6 * sc, y + 1.9 * sc, z + cz * 1.6 * sc, 0.62 * sc, { seg: 8 }); b.cone(goldM, x + cx * 1.6 * sc, y + 2.4 * sc, z + cz * 1.6 * sc, 0.8 * sc, 0.5 * sc, { seg: 7 }); for (const o of [0.8, -0.8]) b.box(goldM, x + cx * o * sc, y, z + cz * o * sc, 0.4 * sc, 0.9 * sc, 0.8 * sc, ry); b.box(goldM, x - cx * 1.4 * sc, y + 1.4 * sc, z - cz * 1.4 * sc, 0.8 * sc, 0.25 * sc, 0.25 * sc, ry); };
    const gates = [[0, -136, 0, 0, -1], [156, -10, Math.PI / 2, 1, 0], [-154, -10, Math.PI / 2, -1, 0]];
    for (const [gx, gz, ry, nx, nz] of gates) {
      const gy = H(gx, gz), o = { w: 24, d: 10, h: 19, gate: 6 }; K.gatehouse(b, gx, gz, { y: gy, ry, mat: M.stone, roofMat: M.tileA, ...o, wood: M.wood, towerR: 4.6, color: 0xf2f0ea }); gateDress(gx, gz, gy, ry, o);
      for (const sg of [-1, 1]) { const px = gx - nz * sg * 5.6 + nx * 10, pz = gz + nx * sg * 5.6 + nz * 10, py = H(px, pz); b.box(M.stoneD, px, py - 0.5, pz, 4, 2.1, 4, ry); b.box(M.trim, px, py + 1.5, pz, 4.4, 0.35, 4.4, ry); lion(px, py + 1.8, pz, Math.atan2(-nz, nx)); }
    }
    // ---- harbour: two moles, lighthouse, quay wall, towers at the mouth
    const moleL = K.smoothPath([[-92, 100], [-80, 128], [-62, 152], [-36, 170]], 5), moleR = K.smoothPath([[96, 104], [88, 130], [70, 152], [42, 168]], 5);
    for (const mp of [moleL, moleR]) { K.wall(b, mp, { h: 3.4, t: 7, mat: M.stoneD, capMat: M.stone, heightAt: () => 0, crenel: false, sink: 6, color: 0xe8e6e0 }); wallTrim(mp, { h: 3.4, t: 7, plinthH: 1.6, g0: () => 0 }); for (let i = 3; i < mp.length - 2; i += 4) lampPosts.push([mp[i][0], 3.4, mp[i][1]]); }
    const LX = 42, LZ = 168;
    b.cyl(M.stoneW, LX, -8, LZ, 10, 14, { top: 0.88, seg: 18 }); b.cyl(M.stoneL, LX, 4, LZ, 8, 6, { top: 0.9, seg: 18 });
    for (let i = 0; i < 6; i++) { const t0 = i / 6, t1 = (i + 1) / 6, r0 = 7.0 * (1 - 0.3 * t0), r1 = 7.0 * (1 - 0.3 * t1); b.cyl(M.stoneL, LX, 9 + t0 * 48, LZ, r0, 48 / 6 + 0.2, { top: r1 / r0, seg: 18, color: i % 2 ? 0xd8d4c8 : 0xf0ece0 }); if (i % 2) b.cyl(M.trim, LX, 9 + t1 * 48 - 0.3, LZ, r1 * 1.05, 0.6, { top: 1, seg: 18 }); }
    b.cyl(M.trim, LX, 56.6, LZ, 5.2, 1.0, { top: 1.55, seg: 18 }); b.cyl(M.stoneD, LX, 57.6, LZ, 7.2, 1.2, { top: 1, seg: 18 });
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; b.cyl(M.stoneL, LX + Math.cos(a) * 5.6, 58.8, LZ + Math.sin(a) * 5.6, 0.5, 7.4, { seg: 6 }); }
    b.cyl(M.lampH, LX, 58.8, LZ, 4.6, 6.4, { top: 0.92, seg: 12 }); b.cyl(M.iron, LX, 65.2, LZ, 7.2, 0.5, { top: 0.92, seg: 12 }); b.cone(goldM, LX, 65.7, LZ, 6.6, 6.5, { seg: 12 }); b.sphere(goldM, LX, 72, LZ, 0.8, { seg: 8 }); b.cone(goldM, LX, 72.5, LZ, 0.45, 3, { seg: 6 });
    drum(-36, 0, 170, 4.8, 22, { seg: 10, roofH: 9, col: 0xf0ece0, lit: 2, rings: [0.35, 0.7] });
    const quay = Array.from({ length: 20 }, (_, i) => { const x = -94 + i * 10; return [x, coastZ(x) - 4]; });
    b.ribbon(M.quay, quay, 10, heightAt, 0.28, 0xd4ccb8);
    for (let i = 0; i < 7; i++) { const x = -70 + i * 22, pz = coastZ(x) - 2; K.pier(b, x, 1.3, pz, { len: 26 + (i % 3) * 8, w: 4, ry: -Math.PI / 2, mat: M.wood, color: 0xd8cfbc }); b.cyl(M.iron, x, 1.3, pz + 28 + (i % 3) * 8, 0.1, 2.6, { seg: 5 }); b.box(M.lamp, x, 3.9, pz + 28 + (i % 3) * 8, 0.5, 0.6, 0.5); }
    for (let i = 0; i < 9; i++) { const x = -85 + i * 21, z = coastZ(x) - 17; if (Math.abs(x - PAL.market[0]) < 9) continue; hall(x, z, 17, 10, 8, 0, { wallMat: M.stoneD, roofMat: i % 2 ? M.tileA : M.tileB, rise: 0.55, col: tint(rt, 0.1, 0.05), nWin: 3 }); for (let k = 0; k < 3; k++) arch(b, M.dark, x - 5 + k * 5, H(x, z), z + 5.06, 0, 2.2, 3.8, 0.3); }
    for (let i = 0; i < 4; i++) { const x = -60 + i * 40, z = coastZ(x) - 9, y = H(x, z); strut(b, M.woodD, [x, y, z], [x, y + 9, z], 0.9); strut(b, M.woodD, [x, y + 8.5, z], [x + 7.5, y + 10.5, z], 0.5); strut(b, M.woodD, [x, y + 4, z], [x + 3.8, y + 9.6, z], 0.3); strut(b, M.iron, [x + 7.2, y + 10.4, z], [x + 7.2, y + 4.6, z], 0.1); b.box(M.woodW, x + 6.8, y + 3.8, z - 0.5, 1.3, 1.0, 1.0, 0); }
    { const r = K.rng(78); for (let i = 0; i < 30; i++) { const x = r.range(-80, 80), z = coastZ(x) - r.range(5, 8); b.cyl(M.woodD, x, H(x, z) + 0.1, z, 0.55, 0.9, { seg: 7, color: tint(r, 0.18, 0.05) }); } }

    // ---- orderly street grid: avenues, then rows of grey houses with crimson tile on a strict lot pattern
    const avX = [-130, -100, -50, 0, 50, 100, 130], avZ = [-105, -70, -34, 20, 60];
    const avs = [];
    avX.forEach((x) => avs.push({ pts: [[x, -130], [x, (coastZ(x) - 6 - 130) / 2], [x, coastZ(x) - 6]], w: x === 0 ? 12 : 6 }));
    avZ.forEach((z) => avs.push({ pts: [[-152, z], [0, z], [152, z]], w: 6 }));
    avs.forEach((s) => { b.ribbon(M.cobble, s.pts, s.w + 2, heightAt, 0.16, 0x9a9282); b.ribbon(M.cobble, s.pts, s.w, heightAt, 0.24, s.w > 8 ? 0xe4dcc8 : 0xd0c8b4); });
    const onAve = (x, z) => avX.some((a) => Math.abs(x - a) < 6.5) || avZ.some((a) => Math.abs(z - a) < 6.5);
    const wins = new Inst(new THREE.PlaneGeometry(0.9, 1.3).translate(0, 0.65, 0), M.win), awn = new Inst(G.box(), flat(0xffffff, { rough: 1 })), flags = new Inst(G.box(), flat(0xffffff, { rough: 1 })), awnCols = [0xc23a3a, 0xe0b040, 0xf0e8d0, 0x3a6aa8];
    const walls = [M.stone, M.stone, M.stoneD, M.stoneL, M.plaster2, M.stone], roofs = [M.tileA, M.tileA, M.tileB, M.tileC, M.tileD, M.tileA];
    const rr = K.rng(31);
    function house(x, z, w, d, h, ry, r, o = {}) {
      const L = loc(x, z, ry); let y0 = 1e9, yb = -1e9; for (const [sx, sz] of [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const [px, pz] = L(sx * w / 2, sz * d / 2), hh = H(px, pz); y0 = Math.min(y0, hh); yb = Math.max(yb, hh); }
      const wm = r.pick(walls), rm = r.pick(roofs), wc = tint(r, 0.12, 0.04), rc = tint(r, 0.2, 0.04), hip = o.hip ?? r() < 0.18, rh = (d / 2 + 0.5) * r.range(0.62, 0.86);
      b.box(M.stoneD, x, y0 - 1.4, z, w + 0.25, yb - y0 + 2.4, d + 0.25, ry, tint(r, 0.2, 0.03)); b.box(wm, x, y0 - 1.4, z, w, yb - y0 + h + 1.4, d, ry, wc);
      b.box(M.trim, x, yb + h - 0.25, z, w + 0.3, 0.3, d + 0.3, ry, 0xe8e4d8);
      if (hip) b.pyramid(rm, x, yb + h, z, w + 1.0, rh * 0.95, d + 1.0, ry, rc); else { b.prism(rm, x, yb + h, z, w + 0.9, rh, d + 0.9, ry, rc); b.box(M.tileD, x, yb + h + rh - 0.1, z, w + 1.0, 0.3, 0.5, ry); }
      if (h > 9) b.box(M.trim, x, yb + h * 0.5, z, w + 0.2, 0.25, d + 0.2, ry, 0xe0dccc);
      const [dx0, dz0] = L(w * r.range(-0.3, 0.3), d / 2 + 0.07); quad(b, M.door, dx0, yb, dz0, ry, 1.1, 2.1);
      if (r() < 0.4) { const [cx, cz] = L(w * (r() < 0.5 ? -0.28 : 0.28), d * 0.1), ch = rh + 1.3; b.box(M.stoneD, cx, yb + h * 0.6, cz, 0.95, h * 0.4 + ch, 0.95, ry, tint(r, 0.2, 0.05)); b.box(M.stoneD, cx, yb + h + ch, cz, 1.3, 0.25, 1.3, ry); stacks.push([cx, yb + h + ch + 1.2, cz]); }
      if (r() < 0.7) { const hh = yb + h * 0.42; for (const sd of [-1, 1]) for (const fx of [-0.24, 0.24]) { if (r() < 0.45 && sd < 0) continue; const [px, pz] = L(w * fx, sd * (d / 2 + 0.09)); wins.add(px, hh, pz, 1, 1, 1, ry + (sd < 0 ? Math.PI : 0), new THREE.Color(1, r.range(0.78, 1), r.range(0.45, 0.8))); } }
      if (r() < 0.14) { const [px, pz] = L(w * 0.2, d / 2 + 0.9); awn.add(px, yb + 2.7, pz, Math.min(3.6, w * 0.42), 0.14, 1.8, ry, awnCols[r.int(0, awnCols.length - 1)]); }
    }
    const placed = [];
    for (let i = 0; i < avX.length - 1; i++) for (let j = 0; j < avZ.length; j++) {
      const x0 = avX[i] + 7, x1 = avX[i + 1] - 7, z0 = j === 0 ? -128 : avZ[j - 1] + 7, z1 = j < avZ.length ? avZ[j] - 7 : 0; if (x1 - x0 < 14 || z1 - z0 < 10) continue;
      const nx = Math.max(1, Math.floor((x1 - x0) / 11.5)), nz = Math.max(1, Math.floor((z1 - z0) / 12)), ry = (i + j) % 2 ? Math.PI / 2 : 0;
      for (let a = 0; a < nx; a++) for (let c2 = 0; c2 < nz; c2++) {
        const px = x0 + (a + 0.5) * (x1 - x0) / nx + rr.range(-0.6, 0.6), pz = z0 + (c2 + 0.5) * (z1 - z0) / nz + rr.range(-0.6, 0.6);
        if (!K.pointInPoly(px, pz, WALL) || pz > coastZ(px) - 26) continue;
        if (Math.hypot(px - PAL.sept[0], pz - PAL.sept[1]) < 32 || Math.hypot(px - PAL.palace[0], pz - PAL.palace[1]) < 36 || Math.hypot(px - PAL.market[0], pz - PAL.market[1]) < 21 || K.distToPolyline(px, pz, WALL).d < 8) continue;
        if (rr() < 0.06) continue;
        const lw = ((x1 - x0) / nx - 2.5) * rr.range(0.78, 0.98), ld = ((z1 - z0) / nz - 2.5) * rr.range(0.78, 0.98), w = ry ? ld : lw, d = ry ? lw : ld, h = rr.range(6, 12);
        house(px, pz, Math.max(5.5, w), Math.max(5.5, d), h, ry, rr); placed.push({ x: px, z: pz, h });
      }
    }
    // market square: striped stalls and a gilded lion column
    { const my = H(PAL.market[0], PAL.market[1]); b.box(M.quay, PAL.market[0], my + 0.04, PAL.market[1], 42, 0.26, 32, 0, 0xcec6b2);
      for (let i = 0; i < 15; i++) { const x = PAL.market[0] - 12 + (i % 5) * 6, z = PAL.market[1] - 8 + Math.floor(i / 5) * 8, y = H(x, z); b.box(M.woodW, x, y, z, 3.6, 1.2, 2.2); b.prism(M.cloth, x, y + 2.7, z, 4.4, 1.0, 3.2, 0, awnCols[i % 4]); for (const sx of [-1.7, 1.7]) b.cyl(M.woodD, x + sx, y, z - 1, 0.1, 2.7, { seg: 4 }); b.box(M.cloth, x, y + 1.2, z + 0.4, 2.8, 0.16, 1.1, 0, [0xd8b87c, 0xc0603a, 0x7aa05a][i % 3]); }
      b.cyl(M.stoneL, PAL.market[0], my, PAL.market[1] - 12, 1.6, 4.5, { seg: 10, top: 0.8 }); b.cyl(M.trim, PAL.market[0], my, PAL.market[1] - 12, 2.2, 1, { seg: 10 }); lion(PAL.market[0], my + 4.5, PAL.market[1] - 12, 0, 1.1); }
    // ---- Great Sept: a long grey cruciform hall with buttresses, rose windows, a great dome with a lantern, four gilt-capped corner towers
    { const [x, z] = PAL.sept, y = H(x, z), cs = 0xf2f0ea;
      b.cyl(M.cobble, x, y - 0.6, z, 30, 1.0, { seg: 28, color: 0xcfc8b6 });
      b.box(M.stoneL, x, y - 1, z, 34, 18, 24, 0, cs); b.box(M.stoneL, x, y - 1, z, 18, 18, 40, 0, cs); b.box(M.trim, x, y + 16.6, z, 34.6, 0.6, 24.6, 0); b.box(M.trim, x, y + 16.6, z, 18.6, 0.6, 40.6, 0);
      b.prism(M.slate, x, y + 17, z, 36, 5.4, 25, 0, tint(rt, 0.1, 0.02)); b.prism(M.slate, x, y + 17, z, 42, 5, 19, Math.PI / 2, tint(rt, 0.1, 0.02));
      for (const sd of [-1, 1]) for (let i = -2; i <= 2; i++) { b.box(M.stoneL, x + i * 6.6, y - 1, z + sd * 12.4, 1.8, 18, 1.4, 0, cs); b.box(M.stoneL, x + sd * 17.4, y - 1, z + i * 4.4, 1.4, 17, 1.8, 0, cs); }
      for (let i = -2; i <= 2; i++) for (const sd of [-1, 1]) { const gc = [M.glassR, M.glassB, M.glassY][(i + 2) % 3]; arch(b, gc, x + i * 6.6 + 3.3 * 0, y + 5, z + sd * 12.2, sd > 0 ? 0 : Math.PI, 2.6, 8.4, 0.2); }
      for (let i = -3; i <= 3; i++) { const gc = [M.glassR, M.glassB, M.glassY][(i + 3) % 3]; arch(b, gc, x + 9.15, y + 5, z + i * 5.2, Math.PI / 2, 2.2, 8, 0.2); arch(b, gc, x - 9.15 - 0.0, y + 5, z + i * 5.2, -Math.PI / 2, 2.2, 8, 0.2); }
      b.cyl(M.stoneL, x, y + 17, z, 13.4, 13, { seg: 24, top: 0.97, color: cs }); b.cyl(M.trim, x, y + 29.4, z, 14.0, 1.1, { seg: 24 });
      for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; arch(b, M.glassG, x + Math.cos(a) * 13.2, y + 21, z + Math.sin(a) * 13.2, Math.PI / 2 - a, 1.4, 5.2, 0.2); }
      b.dome(M.stoneL, x, y + 30.5, z, 13.4, { seg: 24, sy: 0.82, color: 0xcfcdc4 }); for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; let prev = null; for (let ph = 0; ph <= 75; ph += 25) { const f = ph * Math.PI / 180, rho = 13.5 * Math.cos(f), pt = [x + Math.cos(a) * rho, y + 30.5 + 11.2 * Math.sin(f), z + Math.sin(a) * rho]; if (prev) strut(b, goldM, prev, pt, 0.3, 0xffffff, 0.45); prev = pt; } }
      b.cyl(M.stoneL, x, y + 41, z, 2.6, 4, { seg: 10 }); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; arch(b, M.glassG, x + Math.cos(a) * 2.58, y + 41.6, z + Math.sin(a) * 2.58, Math.PI / 2 - a, 0.9, 2.4, 0.12); } b.dome(goldM, x, y + 45, z, 2.9, { seg: 10, sy: 1.1 }); b.cyl(goldM, x, y + 48, z, 0.12, 3.6, { seg: 5, top: 0.5 });
      for (const [ox, oz] of [[-15, -10], [15, -10], [-15, 10], [15, 10]]) drum(x + ox, y - 2, z + oz, 3.0, 32, { seg: 10, stone: M.stoneL, roofMat: M.gold, roofH: 8, lit: 1, slits: 3, rings: [0.3, 0.62, 0.85], col: cs });
      for (let i = -3; i <= 3; i++) { const gc = [M.glassR, M.glassB, M.glassY][(i + 3) % 3]; arch(b, gc, x + i * 4.4, y + 3, z + 12.2 + 8.1, 0, 1.6, 9, 0.15); }
      b.cyl(M.stoneL, x - 12, y - 1, z + 12.6, 0, 0.1); for (let i = 0; i < 5; i++) b.box(M.stoneL, x, y - 1.2 + i * 0.3, z + 21.8 + (4 - i) * 0.9, 12 + (4 - i) * 1.5, 0.35, 1.0, 0); }
    // ---- Lannister palace (cadet branch): long grey façade, crimson roofs, gold finials, a central keep
    { const [x, z] = PAL.palace, y = H(x, z), cs = 0xf0eee6;
      b.box(M.stoneW, x, y - 2, z, 39.6, 4, 25.6, 0); b.box(M.stone, x, y - 1, z, 38, 16, 24, 0, cs); b.box(M.trim, x, y + 14.6, z, 38.6, 0.7, 24.6, 0); b.prism(M.tileA, x, y + 15, z, 40, 7, 26, 0, 0xffffff); b.box(M.tileD, x, y + 21.9, z, 40.2, 0.4, 0.7, 0);
      b.box(M.stone, x, y - 1, z + 20, 16, 12, 12, 0, cs); b.prism(M.tileA, x, y + 11, z + 20, 18, 5, 14, Math.PI / 2, 0xffffff);
      for (const [ox, oz] of [[-19, -12], [19, -12], [-19, 12], [19, 12]]) drum(x + ox, y - 2, z + oz, 3.7, 31, { seg: 10, roofH: 10, lit: 2, rings: [0.3, 0.6, 0.85], col: cs });
      drum(x, y - 1, z - 4, 5.2, 37, { seg: 14, stone: M.stoneL, roofMat: M.gold, roof: 'cone', roofH: 7, lit: 3, slits: 3, rings: [0.25, 0.5, 0.75], col: cs });
      for (let i = -2; i <= 2; i++) { arch(b, M.win, x + i * 7, y + 4.5, z + 12.1, 0, 1.6, 6, 0.2); arch(b, M.win, x + i * 7, y + 4.5, z - 12.1, Math.PI, 1.6, 6, 0.2); arch(b, M.win, x + i * 7, y + 6, z + 26.1, 0, 1.3, 4, 0.2); }
      for (let i = -3; i <= 3; i++) b.cyl(M.stoneL, x + i * 4.4, y - 1, z + 26.8, 0.5, 9, { seg: 8, top: 0.9 });
      const [px, pz] = [x, z + 29]; lion(px - 8, H(px, pz) + 0.4, pz, 0.0, 1.6); lion(px + 8, H(px, pz) + 0.4, pz, 0.0, 1.6); }
    // bunting across the avenues: a thread of crimson and gold pennants, one draw call
    for (const x of [-100, -50, 0, 50, 100]) for (const z of [-90, -52, -6, 40]) { const A = [x - 6, z], B = [x + 6, z], n = 6; for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, sag = Math.sin(t * Math.PI) * 0.8; flags.add(A[0] + (B[0] - A[0]) * t, 7.4 - sag - 0.6 + H(x, z) - 3.8, z, 0.7, 0.9, 0.08, 0, i % 2 ? 0xa5242b : 0xe0b040); } }
    root.add(b.build({}));

    // ---- trees: groves outside the walls, cypress along the roads
    const TR = { trunk: new Inst(G.cyl(5, 0.7), T('wood', 0xffffff, 3)), oak: new Inst(G.sphere(6), flat(0xffffff, { rough: 1 })), cy: new Inst(G.cone(6), flat(0xffffff, { rough: 1 })), pA: new Inst(G.cone(7), flat(0xffffff, { rough: 1 })), pB: new Inst(G.cone(7), flat(0xffffff, { rough: 1 })) };
    { const r = K.rng(61);
      for (const [x, z] of K.scatter({ rng: r, count: q.dens(190), bounds: [-420, -300, 420, -140], minDist: 9, avoid: (x, z) => H(x, z) > 20 || K.pointInPoly(x, z, WALL) })) { const k = r.range(0.8, 1.2), y = H(x, z), gc = jit(r.pick([0x2c4a35, 0x35563b, 0x3b5a46]), r, 0.02, 0.08, 0.05); TR.trunk.add(x, y, z, 0.5 * k, 3 * k, 0.5 * k, 0, 0x6b5238); TR.pA.add(x, y + 2 * k, z, 2.6 * k, 5.6 * k, 2.6 * k, r() * 6, gc); TR.pB.add(x, y + 5 * k, z, 1.9 * k, 4.4 * k, 1.9 * k, r() * 6, jit(0x3a5c42, r, 0.02, 0.06, 0.05)); }
      for (const [x, z] of K.scatter({ rng: r, count: q.dens(170), bounds: [-420, -140, 420, 90], minDist: 9, avoid: (x, z) => K.pointInPoly(x, z, WALL) || z > coastZ(x) - 8 || H(x, z) < 1.5 })) { const k = r.range(0.7, 1.15), y = H(x, z); TR.trunk.add(x, y, z, 0.45 * k, 3 * k, 0.45 * k, 0, 0x6b5238); TR.oak.add(x, y + 2.4 * k, z, 2.6 * k, 2.4 * k, 2.6 * k, r() * 6, jit(r.pick([0x7f9a50, 0x8c9a58, 0x6a8a48]), r, 0.02, 0.08, 0.05)); }
      for (const sd of [-1, 1]) for (let z = -132; z > -330; z -= 11) { const x = 0 + sd * 9.5 + (z < -150 ? Math.sin(z * 0.05) * 4 : 0), y = H(x, z); if (y > 14) continue; const k = r.range(0.9, 1.2); TR.trunk.add(x, y, z, 0.35 * k, 2 * k, 0.35 * k, 0, 0x5d4733); TR.cy.add(x, y + 1.2 * k, z, 1.4 * k, 9 * k, 1.4 * k, r() * 6, jit(0x2f5a3a, r, 0.02, 0.08, 0.05)); } }
    for (const i of Object.values(TR)) if (i.items.length) root.add(i.build());
    // the road north to the Rock
    let gzG = -350 + 56; while (gzG > -350 - 52 && H(-10, gzG) < 6.5) gzG -= 1;
    { const rd = K.smoothPath([[0, -136], [0, -200], [6, -245], [-6, gzG + 22], [-10, gzG + 6]], 6), rb = new Batch(); rb.ribbon(M.cobble, rd, 8, H, 0.16, 0x7a7262); rb.ribbon(M.cobble, rd, 5.8, H, 0.24, 0xbcb09a); root.add(rb.build({ shadow: false })); }
    // Casterly Rock: the lion's mouth gate in the south face and crowning towers
    { const rb = new Batch(), [cx, cz] = [-10, -350], top = (x, z) => H(x, z), rk = K.rng(12);
      // find the south face of the central mass (nearest approach from +z) for the gate
      const gz = gzG;
      const gb = top(cx, gz) - 1; rb.box(M.dark, cx, gb, gz + 0.5, 12, 15, 3, 0); rb.box(M.trim, cx, gb + 15, gz + 1.4, 15, 1.2, 2.4, 0); for (const sd of [-1, 1]) { rb.cyl(M.stoneL, cx + sd * 8.4, gb - 1, gz + 1.5, 1.6, 20, { seg: 8 }); rb.box(M.lamp, cx + sd * 8.4, gb + 7, gz + 3.3, 0.6, 0.8, 0.6); }
      // the fortress carved into the crown of each mass: curtain, golden-stone drum towers, a keep and gilt-capped spires
      for (const [rx, rz, , , hh] of ROCKS) {
        const ty = top(rx, rz), W = 30 + hh * 0.12, D = 20 + hh * 0.06, ry = rx * 0.01, L = loc(rx, rz, ry), ring = [L(-W, -D), L(W, -D), L(W, D), L(-W, D)];
        rb.box(M.rockS, rx, ty - 9, rz, W * 2 + 2, 12, D * 2 + 2, ry, 0xe8d4a8);
        K.wall(rb, ring, { h: 9, t: 3.2, mat: M.rockS, capMat: M.rockS, heightAt: () => ty, closed: true, sink: 3, merlon: 1.3, color: 0xf2e0b8 });
        ring.forEach(([x, z], i) => { const tH = 20 + (i % 2) * 9 + hh * 0.05; rb.cyl(M.rockS, x, ty - 3, z, 6, tH + 3, { seg: 12, top: 0.84, color: tint(rk, 0.08, 0.04) }); rb.cyl(M.trim, x, ty + tH * 0.55, z, 6.1 * 0.93, 0.6, { seg: 12 }); rb.cyl(M.rockS, x, ty + tH, z, 7.4, 1.0, { seg: 12 }); rb.cone(M.tileA, x, ty + tH + 1, z, 7.6, 11, { seg: 12 }); rb.cyl(goldM, x, ty + tH + 11, z, 0.16, 2.6, { seg: 5, top: 0.5 }); for (let k = 0; k < 2; k++) rb.box(M.win, x + Math.cos(k * 2.6 + i) * 5.2, ty + tH * 0.6, z + Math.sin(k * 2.6 + i) * 5.2, 0.6, 1.8, 0.14, Math.PI / 2 - (k * 2.6 + i)); });
        const kh = 30 + hh * 0.12; rb.box(M.rockS, rx, ty, rz, 22, kh, 16, ry, 0xf4e6c0); rb.box(M.trim, rx, ty + kh * 0.55, rz, 22.6, 0.6, 16.6, ry); rb.prism(M.tileA, rx, ty + kh, rz, 24, 8, 18, ry, 0xffffff); rb.box(M.tileD, rx, ty + kh + 7.9, rz, 24.2, 0.4, 0.7, ry);
        for (const sd of [-1, 1]) for (let i = -2; i <= 2; i++) { const [px, pz] = L(i * 4, sd * 8.06); arch(rb, M.win, px, ty + kh * 0.3, pz, ry + (sd < 0 ? Math.PI : 0), 1.2, 4, 0.14); }
        for (const [ox, oz, h2] of [[-10, 0, 20], [10, -2, 16], [0, 5, 26]]) { const [px, pz] = L(ox, oz); rb.cyl(M.rockS, px, ty + kh - 6, pz, 3.6, h2 + 8, { seg: 10, top: 0.84, color: 0xf2e2b8 }); rb.cone(goldM, px, ty + kh + h2 + 2, pz, 4.2, 9, { seg: 10 }); }
      }
      root.add(rb.build({})); }

    // ---- lanterns, banners, life
    const lan = new Inst(G.box(), M.lamp), post = new Inst(G.cyl(5, 1), M.woodD);
    for (const s of avs) for (let i = 0; i < s.pts.length - 1; i++) { const A = s.pts[i], B = s.pts[i + 1], n = Math.floor(Math.hypot(B[0] - A[0], B[1] - A[1]) / 20); for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, x = A[0] + (B[0] - A[0]) * t + (A[0] === B[0] ? 3.8 : 0), z = A[1] + (B[1] - A[1]) * t + (A[1] === B[1] ? 3.8 : 0); if (!K.pointInPoly(x, z, WALL)) continue; post.add(x, H(x, z), z, 0.15, 3.2, 0.15); lan.add(x, H(x, z) + 3.2, z, 0.5, 0.7, 0.5); } }
    for (const [x, y, z] of lampPosts) { post.add(x, y, z, 0.15, 2.8, 0.15); lan.add(x, y + 2.8, z, 0.5, 0.7, 0.5); }
    for (let x = -90; x <= 90; x += 20) { const z = coastZ(x) - 5.5; post.add(x, H(x, z), z, 0.15, 3.2, 0.15); lan.add(x, H(x, z) + 3.2, z, 0.5, 0.7, 0.5); }
    const bn = [[PAL.palace[0], H(PAL.palace[0], PAL.palace[1]) + 50, PAL.palace[1] - 4], [0, H(0, -136) + 30, -136], [156, H(156, -10) + 30, -10], [-154, H(-154, -10) + 30, -10], [PAL.sept[0], H(PAL.sept[0], PAL.sept[1]) + 52, PAL.sept[1]], [LX, 80, LZ]];
    WALL.forEach(([x, z], i) => bn.push([x, H(x, z) + 34, z]));
    root.add(K.banners(bn.map(([x, y, z], i) => ({ x, y, z, w: 3.4, h: 8, color: i % 4 === 3 ? 0xe0b040 : 0xa5242b, ry: i * 0.7 })), { pole: false })); for (const [x, y, z] of bn) post.add(x, y - 8.2, z, 0.2, 9.4, 0.2);
    root.add(lan.build(), post.build(), wins.build(), awn.build(), flags.build());
    // lighthouse beam
    { const g = new THREE.Group(), bm = new THREE.MeshBasicMaterial({ color: 0xffe8b0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide, vertexColors: true }), geo = new THREE.CylinderGeometry(0.5, 7, 160, 10, 1, true).rotateZ(Math.PI / 2).translate(80, 0, 0), pa = geo.attributes.position, ca = new Float32Array(pa.count * 3);
      for (let i = 0; i < pa.count; i++) { const f = 1 - pa.getX(i) / 160; ca[i * 3] = ca[i * 3 + 1] = ca[i * 3 + 2] = f * f; } geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
      g.add(new THREE.Mesh(geo, bm)); const m2 = new THREE.Mesh(geo, bm); m2.rotation.y = Math.PI; g.add(m2); g.position.set(LX, 62, LZ); g.traverse((o) => { o.renderOrder = 8; o.frustumCulled = false; }); root.add(g);
      ctx.onUpdate((dt, t) => { const n = (M.lampH.color.r / M.lampH.userData.base.r - 0.14) / (1.25 * 1.4); bm.opacity = K.clamp(n, 0, 1) * 0.1; g.rotation.y = t * 0.55; }); }
    // lofted ships (crimson hulls for the Lannister fleet)
    function makeShip(type, len, hullHex, sailHex, seed) {
      const g = new THREE.Group(), sb = new Batch(), r = K.rng(seed), beamH = len * (type === 'barge' ? 0.14 : 0.15), Dp = len * 0.09, N = 10, J = 6, pos = [], idx = [], rowN = 2 * J + 1;
      for (let i = 0; i <= N; i++) { const u = i / N, e = Math.abs(2 * u - 1), bf = Math.pow(Math.sin(Math.PI * (0.05 + 0.9 * u)), 0.5) * (1 - K.smoothstep(0.62, 1, u) * 0.92), x = (u - 0.5) * len, keel = -Dp * 0.35 + Dp * 0.25 * e * e, top = Dp * 0.62 + len * 0.045 * e * e * (type === 'barge' ? 0.3 : 1);
        for (let j = 0; j < rowN; j++) { const f = ((j / (rowN - 1)) * 2 - 1) * Math.PI / 2; pos.push(x, keel + (top - keel) * (1 - Math.cos(f)), beamH * bf * Math.sin(f)); } }
      for (let i = 0; i < N; i++) for (let j = 0; j < rowN - 1; j++) { const a = i * rowN + j, bI = a + 1, cI = a + rowN, dI = cI + 1; idx.push(a, cI, bI, bI, cI, dI); }
      const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setIndex(idx); hg.computeVertexNormals(); sb.addGeometry(M.hullW, hg, new THREE.Matrix4(), hullHex);
      const top0 = Dp * 0.62; sb.box(M.hullW, -len * 0.5, -Dp * 0.1, 0, 0.5, top0 + Dp * 0.1 + len * 0.045, beamH * 0.8, 0, hullHex); sb.box(M.hullW, 0, top0 - 0.55, 0, len * 0.72, 0.18, beamH * 1.5, 0, 0xe6cda4);
      if (type !== 'barge') { sb.box(M.hullW, -len * 0.36, top0 - 0.5, 0, len * 0.22, 1.9, beamH * 1.5, 0, hullHex); sb.box(M.hullW, len * 0.4, top0 - 0.5, 0, len * 0.1, 1.0, beamH * 0.9, 0, hullHex); }
      const sails = [], masts = type === 'galley' ? 2 : 1;
      for (let m = 0; m < masts; m++) { const mx = masts === 1 ? len * 0.04 : (m ? -len * 0.2 : len * 0.2), mh = len * (type === 'barge' ? 0.62 : 0.82); sb.cyl(M.hullW, mx, top0 - 0.5, 0, 0.2 + len * 0.004, mh, { seg: 6, top: 0.7, color: 0x6a5240 });
        const yw = top0 + mh * 0.8, sw = beamH * (type === 'galley' ? 2.3 : 2.9), sh = mh * 0.55; sb.box(M.hullW, mx, yw, 0, 0.18, 0.18, sw * 1.12, 0, 0x6a5240);
        const sg = new THREE.PlaneGeometry(sw, sh, 6, 4), sm = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: sailHex, roughness: 1, side: THREE.DoubleSide }));
        sm.position.set(mx + 0.15, yw - sh / 2, 0); sm.rotation.y = Math.PI / 2; sm.castShadow = true; sm.userData.base = Float32Array.from(sg.attributes.position.array); sm.userData.hw = sw / 2; sm.userData.hh = sh / 2; sm.userData.ph = r() * 6; sails.push(sm); g.add(sm);
        strut(sb, M.hullW, [mx, top0 + mh * 0.97, 0], [len * 0.47, top0 + 0.6, 0], 0.07, 0x4a3a2e); strut(sb, M.hullW, [mx, top0 + mh * 0.97, 0], [-len * 0.48, top0 + 1.6, 0], 0.07, 0x4a3a2e); }
      g.add(sb.build()); g.userData.sl = sails; return g;
    }
    function animSails(s, t, ph) {
      s.rotation.z = Math.sin(t * 0.9 + ph) * 0.025; s.rotation.x = Math.sin(t * 0.7 + ph * 1.3) * 0.02;
      for (const sm of s.userData.sl) { const pos = sm.geometry.attributes.position, bs = sm.userData.base, hw = sm.userData.hw, hh = sm.userData.hh, p2 = sm.userData.ph + ph; for (let i = 0; i < pos.count; i++) { const nx = bs[i * 3] / hw, ny = bs[i * 3 + 1] / hh; pos.setZ(i, (1 - nx * nx) * (0.55 + 0.45 * (ny * 0.5 + 0.5)) * hw * 0.32 * (0.8 + 0.2 * Math.sin(t * 1.3 + p2 + ny * 1.4))); } pos.needsUpdate = true; }
    }
    const hulls = [0x6a4a30, 0x8a2a2a, 0x2f4a6a, 0x5c4129], sails = [0xefe6cf, 0xd9b04a, 0xe7d9b8, 0xc2403a];
    const moored = Array.from({ length: 9 }, (_, i) => { const x = -66 + i * 17 + (i % 2) * 4, z = coastZ(x) + 14 + (i % 3) * 7 + (i % 2) * 4; const s = makeShip(i % 3 === 0 ? 'galley' : 'cog', 12 + (i % 4) * 2, hulls[i % 4], sails[i % 4], i + 2); s.position.set(x, 0.2, z); s.rotation.y = Math.PI / 2 + (i % 3 - 1) * 0.08; root.add(s); return s; });
    const sail = [{ s: makeShip('galley', 22, 0x8a2a2a, 0xd9b04a, 31), cx: 0, cz: 260, rx: 150, rz: 50, sp: 0.05, ph: 0 }, { s: makeShip('cog', 17, 0x5a4029, 0xe9dfc8, 32), cx: 40, cz: 230, rx: 110, rz: 40, sp: -0.045, ph: 2 }, { s: makeShip('galley', 20, 0x2f4a6a, 0xe0c060, 33), cx: -60, cz: 300, rx: 120, rz: 40, sp: 0.04, ph: 4 }];
    sail.forEach((o) => root.add(o.s));
    ctx.onUpdate((dt, t) => { sail.forEach(({ s, cx, cz, rx, rz, sp, ph }) => { const a = t * sp + ph, dx = -Math.sin(a) * rx * Math.sign(sp), dz = Math.cos(a) * rz * Math.sign(sp); s.position.set(cx + Math.cos(a) * rx, 0.2, cz + Math.sin(a) * rz); s.rotation.y = Math.atan2(-dz, dx); animSails(s, t, ph); }); moored.forEach((s, i) => { s.position.y = 0.2 + Math.sin(t * 0.8 + i) * 0.08; animSails(s, t, i * 1.7); }); });
    const gulls = K.birds({ center: [0, 30, 110], radius: 110, count: q.dens(22), color: 0xf4f4f0, size: 1.3, spreadY: 14, seed: 3 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const rooks = K.birds({ center: [-10, 215, -345], radius: 70, count: q.dens(10), color: 0x3a3a3e, size: 2.0, spreadY: 14, seed: 17, speed: 0.1 }); root.add(rooks); ctx.onUpdate((dt, t) => rooks.userData.update(t));
    root.add(K.smoke([...placed.filter((_, i) => i % 5 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 4, p.z]), ...stacks.filter((_, i) => i % 6 === 0)].slice(0, 64), { size: 18, rise: 16, opacity: 0.25, color: 0xcdc8be }));
    const fire = K.fires([[LX, 62, LZ], [0, H(0, -136) + 14, -128], [-154, 14, 2], [156, 14, 2], [-36, 24, 170], ...torches.slice(0, 2)], { size: 14, light: q.low ? 0 : 3, intensity: 100 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    root.add(K.fires(torches, { size: 5 }));
    const wk = K.walkers({ paths: [[[0, -128], [0, 40], [0, coastZ(0) - 6]], [[-148, 20], [0, 20], [148, 20]], [[-120, coastZ(-120) - 6], [0, coastZ(0) - 6], [90, coastZ(90) - 6]], [[-100, -70], [100, -70]]], heightAt, count: q.dens(70), rng: K.rng(5), colors: [0xa5242b, 0xd9b04a, 0x6a5a4a, 0x4d5a6a, 0x8a8a8a] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const cl = K.clouds({ y: 260, extent: 800, count: 9, opacity: 0.4, color: 0xf0eee6 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 250, center: [0, 15, 20], minDistance: 18,
      hero: { pos: [-250, 126, 232], target: [10, 40, -110] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x536a9e, horizon: 0xf0b898, fog: 0xe2bca4, fogD: 0.0015, sunC: 0xffc08a, sunI: 3.0, hemiSky: 0xa8b0d6, hemiGround: 0x6a5446 },
        day: { top: 0x4a86c6, horizon: 0xe6dcc0, fog: 0xd8d2bc, sunI: 3.0, sunC: 0xffe8c0, fogD: 0.0007, hemiSky: 0xb4cce8, hemiGround: 0x84714f, hemiI: 1.0 },
        dusk: { top: 0x2a3a74, horizon: 0xf0925c, fog: 0xd49478, fogD: 0.0016, sunC: 0xff9650, sunI: 3.0, hemiSky: 0x8a8ac0, hemiGround: 0x5a4236, hemiI: 0.72 },
        night: { top: 0x080e2e, horizon: 0x2c4272, fog: 0x1e3058, fogD: 0.0018, sunC: 0xb0c4f4, sunI: 1.6, hemiSky: 0x7488c4, hemiGround: 0x343a50, hemiI: 1.25, exposure: 1.18 },
      } },
      landmarks: {
        'harbor': lm(0, coastZ(0) + 40, 40, 6), 'lighthouse': { pos: [42, 78, 168], r: 12 }, 'breakwaters': lm(-62, 152, 20, 6),
        'great-sept': lm(PAL.sept[0], PAL.sept[1], 20, 56), 'cadet-palace': lm(PAL.palace[0], PAL.palace[1], 22, 48), 'city-walls': lm(-132, -90, 18, 22),
        'lion-gates': lm(0, -150, 14, 14), 'market-square': lm(PAL.market[0], PAL.market[1], 16, 7), 'warehouses': lm(-30, coastZ(-30) - 17, 20, 10),
        'lion-street': lm(0, -60, 14, 4), 'casterly-rock-view': { pos: [-10, 205, -350], r: 60, cam: { pos: [70, 150, -50], target: [-10, 90, -350] } }, 'lannister-fleet': lm(-30, coastZ(-30) + 25, 26, 14),
      },
    };
  },
};
