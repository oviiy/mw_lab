// White Harbor — walled northern port on the White Knife. Book/TWOIAF anchors: the only real city of the North, walled, on the bay at the
// mouth of the White Knife; the New Castle (Manderly seat) on a hill inside the walls; the Wolf's Den, an ancient half-ruined fortress by
// the water at the city wall; a domed Sept of the Snows; Fishfoot Yard outside the Seal Gate; busy merchant harbour. Plan is interpretation.
//
// Visual language: pale limestone and whitewash under steep blue-slate and teal roofs, frost-dusted, set against cold grey-green sea, dark
// conifer hills and low pearly light; the New Castle's sea-green banners and a warm lamp glow on every quay at dusk.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const TAU = Math.PI * 2;
const rz = (x) => -128 + Math.sin(x * 0.02) * 9;   // the White Knife: flows west -> east into the bay on the north edge of the city
const WALLP = [[26, -88], [-60, -90], [-108, -70], [-120, 0], [-108, 72], [-60, 92], [26, 90]];
const CAST = [-38, -22], SEPT = [-62, 48], WOLF = [6, -64], FY = [-22, 114];

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

export default {
  build(ctx) {
    const q = ctx.q, rng = K.rng(41), root = ctx.root;
    // ---------------------------------------------------------------- terrain: gentle slope up from the quay, hill for the New Castle, river valley, sea east
    const heightAt = (x, z) => {
      let h = (30 - x) * 0.085;
      if (x > 30) h = -(x - 30) * 0.1 - 2 * K.smoothstep(30, 140, x);
      h += (K.fbm(x * 0.012, z * 0.012, 3, 4) - 0.5) * 12 * K.smoothstep(-40, 160, -x) + (K.fbm(x * 0.05, z * 0.05, 2, 6) - 0.5) * 0.7;
      h += K.smoothstep(100, 420, -x) * 60 * (0.3 + K.fbm(x * 0.006, z * 0.006, 3, 8)) + K.smoothstep(150, 400, Math.abs(z)) * 30 * (x < 20 ? 1 : 0);
      const hill = Math.hypot(x + 38, z + 22); h += (1 - K.smoothstep(0, 46, hill)) * 11;
      const dr = Math.abs(z - rz(x)); h = K.lerp(-1.6, h, K.smoothstep(6, 46, dr));
      if (x > 14 && x < 34 && Math.abs(z) < 82) h = K.lerp(h, 0.9 + (30 - x) * 0.02, 0.9); // flat quay apron
      return h;
    };
    const H = heightAt, c = new THREE.Color(), C3 = (h) => new THREE.Color(h);
    const gA = C3(0x667c58), gB = C3(0x788a60), gC = C3(0x4e6a46), moss = C3(0x435a40), frost = C3(0xdfe7ea), rockC = C3(0x7c8082), rockHi = C3(0xa7aaa8), sandC = C3(0xb9b49c), peat = C3(0x6a6350), dirt = C3(0x8a8068);
    const cityPoly = [...WALLP, [34, 60], [34, -60]];
    const colorAt = (x, z, h, s) => {
      const n1 = K.fbm(x * 0.012, z * 0.012, 3, 1), n2 = K.fbm(x * 0.05, z * 0.05, 2, 2), n3 = K.fbm(x * 0.006, z * 0.006, 2, 5);
      c.copy(gA).lerp(gB, n1).lerp(gC, K.smoothstep(0.45, 0.7, n2) * 0.5).lerp(moss, K.clamp((h - 18) * 0.02, 0, 0.5) * K.smoothstep(0.4, 0.65, n3)).lerp(peat, K.smoothstep(0.58, 0.75, K.fbm(x * 0.02, z * 0.02, 2, 9)) * 0.4);
      c.lerp(frost, K.clamp(h * 0.02 - 0.15, 0, 0.35) * (0.6 + n2 * 0.6));
      if (K.pointInPoly(x, z, cityPoly)) c.lerp(dirt, 0.45 + 0.2 * n2);
      const strata = 0.5 + 0.5 * Math.sin(h * 0.6 + K.fbm(x * 0.03, z * 0.03, 2, 4) * 6);
      c.lerp(strata > 0.5 ? rockHi : rockC, K.clamp((s - 0.1) * 3.4, 0, 0.75));
      if (h < 0.8 && h > -1.2) c.lerp(sandC, 0.55);
      if (x > 30) c.lerp(sandC, 0.4 * (1 - K.smoothstep(0, 1, -h)));
      return c;
    };
    root.add(K.terrain({ w: 1500, d: 1500, seg: q.seg(165), heightAt, kind: 'grass', scale: 12, colorAt }));
    const wat = K.water({ w: 900, d: 760, seg: q.seg(125), level: 0, center: [260, 0], heightAt, deep: 0x1a3a4c, shallow: 0x5e9094, opacity: 0.92, choppy: 0.55, speed: 0.55 }); root.add(wat); ctx.registerWater(wat);
    const farSea = K.water({ w: 8000, d: 8000, seg: 6, level: -0.4, heightAt: () => -20, deep: 0x1d4152, shallow: 0x1d4152, opacity: 0.93, choppy: 0.6, speed: 0.5, center: [3000, 0] }); root.add(farSea); ctx.registerWater(farSea);
    { const inX = (x) => Math.min(x + 750, 750 - x), inZ = (z) => 750 - Math.abs(z), cF = C3(0x56654c), cH = C3(0x6a6f66);   // far skirt: sunk beneath the main terrain, rising to meet it at the rim
      root.add(K.terrain({ w: 8000, d: 8000, seg: q.seg(80), center: [-1500, 0], heightAt: (x, z) => { const h = H(x, z), dIn = Math.max(0, Math.min(inX(x), inZ(z))); return h < 3 ? -25 : K.lerp(h, -40, K.smoothstep(0, 90, dIn)); }, kind: 'rock', scale: 40, colorAt: (x, z, h) => c.copy(cF).lerp(cH, K.clamp(h * 0.012, 0, 0.6)) })); }

    // ---------------------------------------------------------------- materials: pale stone, whitewash, slate-blue roofs, grey-blue timber
    const T = (k, color, scale = 7, o = {}) => tri(k, { color, scale, snow: false, ...o }), TS = (k, color, scale = 6, o = {}) => tri(k, { color, scale, snow: true, ...o });
    const M = {
      stone: T('stone', 0xd2d3ce, 7, { bump: 0.6 }), stoneD: T('stone', 0x9a9c9c, 7), stoneW: T('stone', 0x6e7578, 8), trim: T('stone', 0xeeeee8, 6), ruin: T('stone', 0xb4b6ae, 8, { bump: 1.0 }), moss: T('rock', 0x56694a, 6),
      slate: TS('slate', 0x56687c, 6, { bump: 0.5 }), slateB: TS('slate', 0x6c8296, 6), slateT: TS('slate', 0x3f5c60, 6), slateG: TS('slate', 0x6a6f78, 6), dome: TS('slate', 0x8aa0b4, 8),
      plA: T('plaster', 0xeee8d8, 6), plB: T('plaster', 0xdcd2ba, 6), plC: T('plaster', 0xcdd6d6, 6), plD: T('plaster', 0xe0dccc, 6), wood: T('wood', 0x6a5440, 4), woodD: T('wood', 0x443428, 4), woodW: T('wood', 0x9a7d58, 4), woodG: T('wood', 0x5c6e72, 4),
      cobble: T('cobble', 0x8a867c, 8), quay: T('cobble', 0xa09c92, 6), hullW: T('wood', 0x8a6a4c, 3, { side: THREE.DoubleSide }), thatch: TS('thatch', 0x8a7a58, 5),
      iron: flat(0x30343a, { metal: 0.6, rough: 0.5 }), dark: flat(0x0c0e12, { rough: 1 }), door: flat(0x35291d, { rough: 0.9 }), glass: flat(0xaecdf2, { rough: 0.3 }), gold: flat(0xd8b050, { metal: 0.3, rough: 0.4 }), cloth: flat(0xffffff, { rough: 1 }),
      win: glow(0xffc46b), lamp: glow(0xffa24a, 1.25),
    };
    const b = new Batch(), rt = K.rng(1313);

    // ---------------------------------------------------------------- reusable structure builders
    function drum(x, y, z, r, h, o = {}) {
      const { seg = 12, taper = 0.88, roof = 'cone', roofH = r * 2.5, stone = M.stone, base = M.stoneW, col = 0xffffff, slits = 2, lit = 1, rings = [0.5], roofMat = M.slate } = o;
      const rA = (t) => r * (1 - (1 - taper) * t);
      b.cyl(base, x, y - 3, z, r * 1.14, 5.6, { top: 0.9, seg, color: col }); b.cyl(stone, x, y, z, r, h, { top: taper, seg, color: col });
      for (const t of rings) b.cyl(M.trim, x, y + t * h - 0.3, z, rA(t) * 1.05, 0.6, { top: 1, seg, color: col });
      for (let k = 0; k < slits; k++) { const a = k * 2.1 + r * 1.3, t = 0.2 + 0.5 * k / slits, rr = rA(t) + 0.04; b.box(M.dark, x + Math.cos(a) * rr, y + h * t, z + Math.sin(a) * rr, 0.32, 1.7, 0.16, Math.PI / 2 - a); }
      for (let k = 0; k < lit; k++) { const a = k * 2.7 + 0.6 + r, t = 0.62 + 0.1 * k, rr = rA(t) + 0.05; b.box(M.win, x + Math.cos(a) * rr, y + h * t, z + Math.sin(a) * rr, 0.5, 1.5, 0.12, Math.PI / 2 - a); }
      const yt = y + h, R2 = rA(1) * 1.28; b.cyl(M.trim, x, yt - 1.4, z, rA(1) * 1.02, 1.5, { top: 1.28, seg, color: col });
      if (roof === 'cone') { b.cyl(stone, x, yt, z, R2, 0.8, { top: 1, seg, color: col }); b.cone(roofMat, x, yt + 0.8, z, R2 * 1.08, roofH, { seg, color: tint(rt, 0.14, 0.02) }); b.cyl(M.gold, x, yt + 0.6 + roofH, z, 0.14, 2.0, { seg: 5, top: 0.5 }); }
      else { b.cyl(stone, x, yt, z, R2, 0.9, { top: 1, seg, color: col }); const n = Math.max(7, Math.round((TAU * R2) / 2.7)); for (let i = 0; i < n; i++) { const a = (i / n) * TAU; b.box(stone, x + Math.cos(a) * (R2 - 0.3), yt + 0.9, z + Math.sin(a) * (R2 - 0.3), 1.4, 1.1, 0.7, Math.PI / 2 - a, col); } }
    }
    function sqTower(x, y, z, w, h, o = {}) {
      const { ry = 0, roofH = w * 1.1, stone = M.stone, base = M.stoneW, col = 0xffffff, roofMat = M.slate, d = w, lit = true } = o, L = loc(x, z, ry);
      b.box(base, x, y - 3, z, w * 1.1, 6, d * 1.1, ry, col); b.box(stone, x, y - 3, z, w, h + 3, d, ry, col);
      for (const t of [0.4, 0.74]) b.box(M.trim, x, y + h * t, z, w + 0.45, 0.5, d + 0.45, ry, col); b.box(M.trim, x, y + h - 1.1, z, w + 1.3, 1.0, d + 1.3, ry, col);
      for (const sd of [-1, 1]) { const [px, pz] = L(0, sd * (d / 2 + 0.05)); b.box(M.dark, px, y + h * 0.28, pz, 0.35, 1.8, 0.16, ry); if (lit) { const [wx, wz] = L(0, sd * (d / 2 + 0.06)); arch(b, M.win, wx, y + h * 0.56, wz, ry + (sd < 0 ? Math.PI : 0), 1.0, 2.2, 0.12); } }
      b.pyramid(roofMat, x, y + h, z, w + 2.4, roofH, d + 2.4, ry, tint(rt, 0.14, 0.02));
    }
    function wallTrim(pts, { h, t, closed = false, plinth = M.stoneW, trim = M.trim, plinthH = 2.8 }) {
      const n = closed ? pts.length : pts.length - 1;
      for (let i = 0; i < n; i++) {
        const A = pts[i], B = pts[(i + 1) % pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz); if (len < 0.01) continue;
        const steps = Math.max(1, Math.ceil(len / 14)), ry = Math.atan2(-dz, dx);
        for (let s = 0; s < steps; s++) {
          const t0 = s / steps, t1 = (s + 1) / steps, x0 = A[0] + dx * t0, z0 = A[1] + dz * t0, x1 = A[0] + dx * t1, z1 = A[1] + dz * t1;
          const g = Math.min(H(x0, z0), H(x1, z1), H((x0 + x1) / 2, (z0 + z1) / 2)), top = Math.max(H(x0, z0), H(x1, z1)) + h, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sl = Math.hypot(x1 - x0, z1 - z0) + 0.6;
          b.box(plinth, cx, g - 3, cz, sl + 0.2, plinthH + 3, t + 1.4, ry, tint(rt, 0.14, 0.04)); b.box(trim, cx, top - 1.0, cz, sl, 0.95, t + 0.9, ry); b.box(trim, cx, g + (top - g) * 0.55, cz, sl, 0.4, t + 0.35, ry);
        }
      }
    }
    const torches = [];
    function gateDress(gx, gz, y, ry, { w, d, h, gate }) {
      const L = loc(gx, gz, ry), [bx, bz] = L(0, -d * 0.2); b.box(M.dark, bx, y, bz, gate - 0.2, gate * 1.15, 0.3, ry);
      b.box(M.trim, gx, y + gate * 1.15 - 0.8, gz, gate + 1.6, 0.8, d + 0.5, ry); b.box(M.trim, gx, y + h - 1.1, gz, w, 0.95, d + 1.5, ry);
      for (const sx of [-1, 1]) { const [px, pz] = L(sx * (gate / 2 + 1.5), d / 2 + 0.45); b.box(M.iron, px, y + 3.6, pz, 0.25, 0.9, 0.25, ry); b.box(M.lamp, px, y + 4.5, pz, 0.5, 0.6, 0.5, ry); torches.push([px, y + 5.4, pz]); }
    }
    const stacks = [];
    /** Pitched hall / keep block with plinth, string course, ridge, lit windows. */
    function hall(x, z, w, d, h, ry, o = {}) {
      const { wallMat = M.stone, roofMat = M.slate, col = tint(rt, 0.1, 0.04), rise = 0.7, y0 = H(x, z) } = o, L = loc(x, z, ry), rh = (d / 2 + 0.5) * rise;
      b.box(M.stoneW, x, y0 - 2, z, w + 0.5, 3.2, d + 0.5, ry, tint(rt, 0.15, 0.04)); b.box(wallMat, x, y0 - 2, z, w, h + 2, d, ry, col); b.box(M.trim, x, y0 + h - 0.5, z, w + 0.5, 0.5, d + 0.5, ry);
      b.prism(roofMat, x, y0 + h, z, w + 1.0, rh, d + 1.0, ry, tint(rt, 0.14, 0.03));
      for (const sd of [-1, 1]) for (let i = 0; i < Math.max(2, Math.floor(w / 5)); i++) { const [wx, wz] = L((i + 0.5) * w / Math.max(2, Math.floor(w / 5)) - w / 2, sd * (d / 2 + 0.06)); arch(b, M.win, wx, y0 + h * 0.4, wz, ry + (sd < 0 ? Math.PI : 0), 1.0, 2.4, 0.12); }
      const [cx, cz] = L(w * 0.3, 0); b.box(M.stoneD, cx, y0 + h * 0.5, cz, 1.3, h * 0.5 + rh + 1.4, 1.3, ry); stacks.push([cx, y0 + h + rh + 1.8, cz]);
    }

    // ---------------------------------------------------------------- city walls (landward) with towers and gates
    K.wall(b, WALLP, { h: 14, t: 3.6, mat: M.stone, capMat: M.stoneD, heightAt: H, color: 0xf4f4f0 }); wallTrim(WALLP, { h: 14, t: 3.6 });
    WALLP.forEach(([x, z], i) => drum(x, H(x, z), z, 5.4, 21, { seg: 12, col: tint(rt, 0.07, 0.03), roof: i % 2 ? 'cone' : 'flat', roofH: 10, lit: i % 2 }));
    for (let i = 0; i < WALLP.length - 1; i++) { const [ax, az] = WALLP[i], [bx, bz] = WALLP[i + 1]; if (Math.hypot(bx - ax, bz - az) > 50) { const mx = (ax + bx) / 2, mz = (az + bz) / 2; drum(mx, H(mx, mz), mz, 4.4, 17, { seg: 10, col: tint(rt, 0.07, 0.03), roof: 'cone', roofH: 8, lit: 0 }); } }
    for (const [gx, gz, ry] of [[-22, 91, 0], [-119, 0, Math.PI / 2], [-22, -89, 0]]) { const gy = H(gx, gz), o = { w: 18, d: 8, h: 18, gate: 5 }; K.gatehouse(b, gx, gz, { y: gy, ry, mat: M.stone, roofMat: M.slate, ...o, wood: M.wood, towerR: 4.6, color: 0xf4f4f0 }); gateDress(gx, gz, gy, ry, o); }
    for (const z of [-84, 84]) drum(32, 0, z, 5.6, 22, { seg: 12, roof: 'cone', roofH: 10, lit: 1 });

    // ---------------------------------------------------------------- harbour: quay, piers, breakwater, warehouses, cranes
    b.box(M.stone, 27, -3, 0, 7, 3.9, 160, 0, 0xeaeae4); b.box(M.trim, 24, 0.55, 0, 1.0, 0.45, 160, 0);   // quay face + coping
    b.box(M.quay, 26, 0.88, 0, 8.4, 0.12, 160, 0);
    for (let z = -76; z <= 76; z += 12) { b.cyl(M.iron, 30.1, 0.9, z, 0.38, 0.9, { seg: 6 }); }
    for (let z = -64; z <= 64; z += 16) { K.pier(b, 30, 0.95, z, { len: 30, w: 3.8, ry: 0, mat: M.wood, color: 0xd8d0c4 }); b.cyl(M.iron, 60, 0.95, z - 1.5, 0.1, 2.8, { seg: 5 }); b.box(M.lamp, 60, 3.75, z - 1.5, 0.5, 0.6, 0.5); }
    const mole = [[38, 78], [74, 86], [112, 66], [128, 28], [126, -14], [112, -40]];
    K.wall(b, K.smoothPath(mole, 4), { h: 8, t: 6.5, mat: M.stone, capMat: M.stoneD, heightAt: () => -3, crenel: true, merlon: 1.3, sink: 5, color: 0xe4e4de }); wallTrim(K.smoothPath(mole, 4), { h: 8, t: 6.5, plinthH: 2 });
    { const pts = K.smoothPath(mole, 4); for (let i = 3; i < pts.length - 1; i += 6) { b.cyl(M.iron, pts[i][0], 5.2, pts[i][1], 0.14, 2.6, { seg: 5 }); b.box(M.lamp, pts[i][0], 7.8, pts[i][1], 0.55, 0.7, 0.55); } }
    drum(111, -3, -41, 5.2, 24, { seg: 12, roof: 'cone', roofH: 9, lit: 2, col: 0xf0f0ec, slits: 1 }); b.cyl(M.win, 111, 15, -41, 2.9, 3.6, { seg: 10, top: 0.9 }); // harbour-mouth light tower
    for (let i = 0; i < 6; i++) { const z = -46 + i * 20, ww = i % 2 ? 22 : 18; hall(13, z + 10, 9, ww, 8, 0, { wallMat: i % 3 === 0 ? M.woodW : i % 3 === 1 ? M.woodG : M.plD, roofMat: i % 2 ? M.slateG : M.slate, rise: 0.55, col: tint(rt, 0.12, 0.06) }); }
    for (const z of [-30, 4, 46]) { const x = 26; strut(b, M.woodD, [x, 0.9, z], [x, 11, z], 0.6); strut(b, M.woodD, [x, 10.4, z], [x + 9.5, 12.6, z], 0.45); strut(b, M.woodD, [x, 5, z], [x + 4.5, 11, z], 0.3); strut(b, M.iron, [x + 9.2, 12.5, z], [x + 9.2, 6.6, z], 0.1); b.box(M.woodW, x + 8.8, 5.6, z - 0.5, 1.4, 1.0, 1.0, 0); }  // cargo cranes
    { const r = K.rng(77); for (let i = 0; i < 26; i++) { const z = r.range(-70, 70), x = r.range(21, 24); b.cyl(M.woodD, x, 0.9, z, 0.55, 0.9, { seg: 7, color: tint(r, 0.15, 0.04) }); }       // barrels along the quay
      for (let i = 0; i < 4; i++) { const z = -52 + i * 34, x = 22; strut(b, M.woodD, [x, 0.9, z], [x + 1.4, 3.5, z], 0.14); strut(b, M.woodD, [x + 2.8, 0.9, z], [x + 1.4, 3.5, z], 0.14); b.box(M.woodD, x + 1.4, 3.2, z, 0.12, 0.12, 5.5, 0); for (let k = 0; k < 6; k++) b.box(M.cloth, x + 1.4, 2.0, z - 2.4 + k * 0.95, 0.12, 1.1, 0.35, 0, 0xc4ccd2); } }  // fish-drying racks

    // ---------------------------------------------------------------- Wolf's Den: ancient, half-ruined fortress by the water (north end of the waterfront)
    { const [x0, z0] = WOLF, y0 = H(x0, z0), r = K.rng(21);
      const ring = [[x0 - 26, z0 - 20], [x0 + 20, z0 - 24], [x0 + 28, z0 + 6], [x0 - 4, z0 + 20]];
      K.wall(b, ring, { h: 10, t: 4, mat: M.ruin, capMat: M.ruin, heightAt: H, crenel: false, color: 0xe6e8e0 });
      b.box(M.ruin, x0 + 6, y0 - 2, z0 - 4, 22, 22, 16, 0.2, 0xe8eae2); b.box(M.ruin, x0 + 2, y0 + 20, z0 - 8, 10, 4, 8, 0.5, 0xd6d8d0); b.box(M.ruin, x0 + 11, y0 + 20, z0 - 2, 6, 2.4, 5, 0.1, 0xd0d4cc);    // broken keep, jagged top
      for (let i = 0; i < 7; i++) b.box(M.ruin, x0 + 6 + r.range(-9, 9), y0 + 20 + r.range(0, 1.6), z0 - 4 + r.range(-6, 6), r.range(1.2, 2.6), r.range(1, 2.4), r.range(1.2, 2.6), r() * 3, jit(0xd8dad2, r, 0, 0.02, 0.05));
      drum(x0 - 24, H(x0 - 24, z0 - 18), z0 - 18, 6, 22, { seg: 10, stone: M.ruin, roof: 'flat', lit: 0, slits: 3, rings: [] });                                                // keep stump (battlement left)
      { const px = x0 + 26, pz = z0 - 22, py = H(px, pz); b.cyl(M.ruin, px, py - 3, pz, 5.4, 15, { top: 0.88, seg: 9 }); for (let i = 0; i < 9; i++) { const a = i * 0.46 + 0.3, hh = r.range(1.0, 3.6); b.box(M.ruin, px + Math.cos(a) * 4.5, py + 12, pz + Math.sin(a) * 4.5, 1.7, hh, 1.0, Math.PI / 2 - a, jit(0xd8dad2, r, 0, 0.02, 0.05)); } }   // broken tower: ragged crown
      b.box(M.ruin, x0 - 18, y0, z0 + 14, 14, 9, 8, -0.3, 0xdadcd4); b.box(M.moss, x0 - 18, y0 + 8.9, z0 + 14, 14, 0.4, 8, -0.3, 0xcdd8c0);
      for (let i = 0; i < 18; i++) b.box(M.ruin, x0 + r.range(-28, 28), y0 - 0.4, z0 + r.range(-22, 24), r.range(1.4, 4), r.range(0.8, 3), r.range(1.4, 4), r() * 3, jit(0xdcded6, r, 0, 0.02, 0.07), r.range(-0.2, 0.2), r.range(-0.2, 0.2));
      for (let i = 0; i < 6; i++) b.sphere(M.moss, x0 + r.range(-24, 24), y0 + 0.4, z0 + r.range(-18, 18), r.range(1.6, 3.4), { seg: 6, sy: 0.4, color: jit(0xffffff, r, 0, 0, 0.06) });
      b.box(M.dark, x0 + 6, y0, z0 - 4 + 8.05, 4.2, 6.6, 0.3, 0.2);                                                                                                               // a dark archway
    }

    // ---------------------------------------------------------------- New Castle on its hill, with the Merman's Court hall
    { const [cx, cz] = CAST, cy = H(cx, cz), ring = [[cx - 30, cz - 26], [cx + 26, cz - 26], [cx + 30, cz + 22], [cx - 26, cz + 24]];
      K.wall(b, ring, { h: 11, t: 3, mat: M.stone, capMat: M.stoneD, heightAt: H, closed: true, color: 0xf4f4f0 }); wallTrim(ring, { h: 11, t: 3, closed: true, plinthH: 2.2 });
      ring.forEach(([x, z], i) => drum(x, H(x, z), z, 5.2, 24 + (i % 2) * 3, { seg: 12, col: tint(rt, 0.06, 0.03), rings: [0.35, 0.68], lit: 2, slits: 3, roofH: 12 }));
      K.keep(b, cx - 8, cz - 8, { w: 22, d: 18, h: 26, y: cy, mat: M.stone, roofMat: M.slate, turretR: 3.2, turretH: 8, roof: 'flat', color: 0xf2f2ee }); // keep, stepped parapet and corner turrets
      for (const t of [0.3, 0.62]) b.box(M.trim, cx - 8, cy + 26 * t, cz - 8, 22.5, 0.5, 18.5, 0);
      for (let i = -2; i <= 2; i++) for (const sd of [-1, 1]) { arch(b, M.win, cx - 8 + i * 4, cy + 11, cz - 8 + sd * 9.05, sd < 0 ? Math.PI : 0, 1.2, 4, 0.14); arch(b, M.win, cx - 8 + sd * 11.05, cy + 11, cz - 8 + i * 3.4, sd < 0 ? -Math.PI / 2 : Math.PI / 2, 1.2, 4, 0.14); }
      // Merman's Court: long warm-timber hall with a carved gable and a high pale-slate roof
      const mc = [cx + 10, cz + 10], mh = loc(mc[0], mc[1], 0.1);
      b.box(M.stoneD, mc[0], cy - 2, mc[1], 26.6, 3, 12.6, 0.1, 0xe0e0dc); b.box(M.woodW, mc[0], cy - 1, mc[1], 26, 12, 12, 0.1, 0xf0e6d4); b.box(M.trim, mc[0], cy + 10.6, mc[1], 26.6, 0.5, 12.6, 0.1); b.prism(M.slateB, mc[0], cy + 11, mc[1], 28, 7.4, 14, 0.1, tint(rt, 0.1, 0.02));
      for (let i = -4; i <= 4; i++) { const [px, pz] = mh(i * 2.9, 6.06); b.box(M.woodD, px, cy - 1, pz, 0.4, 11.6, 0.3, 0.1); if (Math.abs(i) < 4) arch(b, M.win, px + 1.45 * Math.cos(0.1), cy + 3.6, pz - 1.45 * Math.sin(0.1), 0.1, 1.5, 4.2, 0.14); }
      for (const s of [-1, 1]) { const [px, pz] = mh(s * 14.3, 0); for (let k = 0; k < 4; k++) strut(b, M.woodD, [px, cy + 11.2 + k * 1.2, pz - 5], [px + s * 0.2, cy + 12 + k * 1.2, pz + 5], 0.3); }
      b.box(M.stone, cx + 22, cy, cz - 6, 8, 14, 8, 0, tint(rt, 0.1, 0.04)); b.prism(M.slate, cx + 22, cy + 14, cz - 6, 9, 5, 9, 0);
      { const gx = cx - 3, gz = cz + 25, gy = H(gx, gz), o = { w: 14, d: 6, h: 14, gate: 4 }; K.gatehouse(b, gx, gz, { y: gy, ry: 0, mat: M.stone, roofMat: M.slate, ...o, wood: M.wood, towerR: 3.4, color: 0xf4f4f0 }); gateDress(gx, gz, gy, 0, o); }
    }
    for (let i = 0; i < 16; i++) { const t = i / 15, x = K.lerp(0, -33, t), z = K.lerp(-48, -2, t), y = H(x, z); b.box(M.stone, x, Math.max(y, H(-33, -2) * t) - 0.8, z, 6.5, 1.5, 3.2, -0.62, 0xf0f0ec); }   // Castle Stair
    for (let i = 0; i < 4; i++) { const t = (i + 0.5) / 4, x = K.lerp(0, -33, t) - 3.2, z = K.lerp(-48, -2, t) - 2.4; b.box(M.stoneD, x, H(x, z), z, 1, 1.6, 1, 0); b.box(M.lamp, x, H(x, z) + 1.6, z, 0.5, 0.6, 0.5, 0); }

    // ---------------------------------------------------------------- Sept of the Snows: great domed sept topped with statues of the Seven
    { const [sx, sz] = SEPT, sy = H(sx, sz), cs = tint(rt, 0.05, 0.02);
      b.cyl(M.cobble, sx, sy - 0.6, sz, 34, 1.0, { seg: 28, color: 0xdcd6c8 });
      b.box(M.stone, sx, sy - 1, sz, 30, 12, 24, 0, cs); b.box(M.stone, sx, sy - 1, sz, 14, 12, 40, 0, cs); b.box(M.trim, sx, sy + 10.6, sz, 30.6, 0.5, 24.6, 0); b.box(M.trim, sx, sy + 10.6, sz, 14.6, 0.5, 40.6, 0);
      b.prism(M.slate, sx, sy + 11, sz, 32, 6, 25, 0, tint(rt, 0.1, 0.02)); b.prism(M.slate, sx, sy + 11, sz, 41, 5.4, 15, Math.PI / 2, tint(rt, 0.1, 0.02));
      b.cyl(M.stone, sx, sy + 11, sz, 9.4, 7.6, { seg: 24, color: 0xf6f6f2 }); b.cyl(M.trim, sx, sy + 18.4, sz, 10, 0.8, { seg: 24 }); b.dome(M.dome, sx, sy + 19.2, sz, 9.6, { seg: 24, sy: 0.92 });
      for (let k = 0; k < 14; k++) { const a = (k / 14) * TAU; arch(b, M.glass, sx + Math.cos(a) * 9.5, sy + 12.6, sz + Math.sin(a) * 9.5, Math.PI / 2 - a, 1.2, 4, 0.12); }
      for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU, px = sx + Math.cos(a) * 10.4, pz = sz + Math.sin(a) * 10.4; b.box(M.trim, px, sy + 11, pz, 1.1, 7.6, 1.1, 0); b.sphere(M.trim, px, sy + 18.8, pz, 0.8, { seg: 6 }); b.cone(M.trim, px, sy + 19, pz, 0.7, 2.4, { seg: 4 }); }
      b.cyl(M.stone, sx, sy + 28.2, sz, 1.6, 3, { seg: 8, top: 0.7 }); b.cyl(M.gold, sx, sy + 31, sz, 0.15, 3.6, { seg: 5, top: 0.4 });
      for (const dz of [-1, 1]) sqTower(sx, sy, sz + dz * 22, 5.6, 24, { roofH: 9, col: 0xf4f4f0 });
      for (let i = -3; i <= 3; i++) { arch(b, M.glass, sx + 15.05, sy + 3, sz + i * 3.4, Math.PI / 2, 1.5, 5.2, 0.15); arch(b, M.win, sx - 15.05, sy + 3, sz + i * 3.4, -Math.PI / 2, 1.5, 5.2, 0.15); }
      for (let k = 0; k < 4; k++) { b.cyl(M.iron, sx - 12 + k * 8, sy, sz + 28.4, 0.14, 2.8, { seg: 5 }); b.box(M.lamp, sx - 12 + k * 8, sy + 2.8, sz + 28.4, 0.5, 0.6, 0.5); } }

    // ---------------------------------------------------------------- Fishfoot Yard outside the Seal Gate: fish market square with fountain & awned stalls
    { const fy = H(FY[0], FY[1]);
      b.box(M.cobble, FY[0], fy + 0.04, FY[1], 42, 0.26, 36, 0, 0xc4beb0);
      b.cyl(M.stone, FY[0], fy, FY[1], 3.6, 1.0, { seg: 14, color: 0xeaeae4 }); b.cyl(M.stone, FY[0], fy + 1.0, FY[1], 1.0, 2.8, { seg: 8, top: 0.6 }); b.sphere(M.stone, FY[0], fy + 3.6, FY[1], 1.0); b.cyl(M.glass, FY[0], fy + 0.9, FY[1], 3.0, 0.12, { seg: 14 });
      const awn = [0x3f6e8f, 0xe6e2d6, 0xc59a3c, 0x7a3b3b, 0x4f7b56, 0x5a8aa8];
      for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) { const x = FY[0] - 16 + i * 5.4, z = FY[1] + (r ? 11 : -11), y = H(x, z); b.box(M.woodW, x, y, z, 3.4, 1.2, 2.2, 0); b.prism(M.cloth, x, y + 2.7, z, 4.2, 1.2, 3.4, 0, awn[(i + r * 2) % 6]); for (const sx of [-1.5, 1.5]) b.cyl(M.woodD, x + sx, y, z - 1, 0.1, 2.8, { seg: 4 }); b.box(M.cloth, x, y + 1.2, z + 0.4, 2.6, 0.18, 1.2, 0, [0xb8c4cc, 0xd8cfc0, 0xc8b4a8][(i + r) % 3]); }
      const rf = K.rng(30); for (let i = 0; i < 12; i++) b.cyl(M.woodW, FY[0] + rf.range(-18, 18), fy, FY[1] + rf.range(-5, 5), 0.5, 0.9, { seg: 6, color: tint(rf, 0.15, 0.04) }); }

    // ---------------------------------------------------------------- streets & houses within the walls
    const streets = [[[30, 10], [0, 8], [-30, 12], [-70, 8], [-118, 2]], [[-22, -88], [-24, -40], [-20, 12], [-24, 52], [-22, 90]], [[28, -76], [28, 78]], [[-22, 90], [-22, 112]], [[-62, -62], [-72, -20], [-88, 20], [-84, 58]], [[-22, -52], [-60, -66]]];
    const stSm = streets.map((s) => K.smoothPath(s, 5));
    stSm.forEach((s, i) => { b.ribbon(M.cobble, s, (i === 0 ? 7 : 5.5) + 2.2, H, 0.16, 0x6e6a60); b.ribbon(M.cobble, s, i === 0 ? 7 : 5.5, H, 0.24, i === 2 ? 0xd2cec2 : 0xb4b0a4); });
    const dRoad = (x, z) => { let m = 1e9; for (const r of stSm) { const d = K.distToPolyline(x, z, r).d; if (d < m) m = d; } return m; };
    const roadAngle = (x, z) => { let best = 1e9, ang = 0; for (const r of stSm) { const o = K.distToPolyline(x, z, r); if (o.d < best) { best = o.d; const i = Math.min(r.length - 2, Math.floor(o.t)); ang = Math.atan2(-(r[i + 1][1] - r[i][1]), r[i + 1][0] - r[i][0]); } } return best < 50 ? ang : Math.round(K.noise2(x * 0.05, z * 0.05) * 2) * (Math.PI / 2); };
    const bb = b, wins = new Inst(new THREE.PlaneGeometry(0.9, 1.3).translate(0, 0.65, 0), M.win), awn = new Inst(G.box(), flat(0xffffff, { rough: 1 })), awnCols = [0x3f6e8f, 0xe6dcc4, 0x5a8aa8, 0x7a4a4a, 0x587a4a];
    const kinds = {
      rich: { size: [6.5, 9.5], h: [6, 9.5], walls: [M.plA, M.plA, M.plB, M.plC, M.plD], roofs: [M.slate, M.slateB, M.slate, M.slateT, M.slateG], styles: ['tall', 'gable', 'hip', 'tall', 'gable'], glow: 0.7, awn: 0.18 },
      mid: { size: [5, 8], h: [5, 8], walls: [M.plA, M.woodG, M.plB, M.woodW, M.plD, M.plC], roofs: [M.slate, M.slateG, M.slateT, M.slate], styles: ['gable', 'tall', 'gable', 'hip'], glow: 0.6, awn: 0.06 },
      poor: { size: [4, 6.5], h: [3.6, 6], walls: [M.woodW, M.woodD, M.woodG, M.plD], roofs: [M.thatch, M.slateG, M.thatch, M.slate], styles: ['gable', 'tall', 'gable'], glow: 0.35, awn: 0 },
    };
    function building(x, z, kindName, r, o = {}) {
      const k = kinds[kindName]; let w = r.range(k.size[0], k.size[1]), d = r.range(k.size[0], k.size[1]) * r.range(0.85, 1.2); if (d > w) { const t = w; w = d; d = t; }
      const h = r.range(k.h[0], k.h[1]), ry = o.ry ?? 0, st = o.style ?? r.pick(k.styles), L = loc(x, z, ry);
      let y0 = 1e9, yb = -1e9; for (const [sx, sz] of [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const [px, pz] = L(sx * w / 2, sz * d / 2), hh = H(px, pz); y0 = Math.min(y0, hh); yb = Math.max(yb, hh); }
      const wm = r.pick(k.walls), rm = r.pick(k.roofs), wc = tint(r, 0.14, 0.06), rc = tint(r, 0.18, 0.04), drop = yb - y0;
      bb.box(M.stoneD, x, y0 - 1.4, z, w + 0.25, drop + 2.4, d + 0.25, ry, tint(r, 0.2, 0.04)); bb.box(wm, x, y0 - 1.4, z, w, drop + h + 1.4, d, ry, wc);
      const rh = (d / 2 + 0.5) * r.range(0.8, 1.1);
      if (st === 'gable' || st === 'tall') { if (st === 'tall') { bb.box(M.woodD, x, yb + h * 0.5, z, w + 0.5, 0.35, d + 0.5, ry); bb.box(wm, x, yb + h * 0.5, z, w + 0.7, h * 0.5, d + 0.7, ry, wc); } bb.prism(rm, x, yb + h, z, w + 0.9, rh, d + 0.9, ry, rc); bb.box(M.woodD, x, yb + h + rh - 0.12, z, w + 1.0, 0.3, 0.5, ry); }
      else bb.pyramid(rm, x, yb + h, z, w + 1.0, rh * 0.95, d + 1.0, ry, rc);
      if (kindName === 'rich') bb.box(M.trim, x, yb + h * 0.5 - 0.15, z, w + 0.25, 0.3, d + 0.25, ry, 0xf0eadc);
      const [dx0, dz0] = L(w * r.range(-0.3, 0.3), d / 2 + 0.07); quad(bb, M.door, dx0, yb, dz0, ry, 1.1, 2.1);
      if (r() < 0.45) { const [cx, cz] = L(w * (r() < 0.5 ? -0.28 : 0.28), d * 0.1), ch = rh + 1.3; bb.box(M.stoneD, cx, yb + h * 0.6, cz, 0.95, h * 0.4 + ch, 0.95, ry, tint(r, 0.2, 0.05)); bb.box(M.stoneD, cx, yb + h + ch, cz, 1.3, 0.25, 1.3, ry); stacks.push([cx, yb + h + ch + 1.2, cz]); }
      if (r() < k.glow) { const hh = yb + h * 0.42; for (const sd of [-1, 1]) for (const fx of [-0.24, 0.24]) { if (r() < 0.45 && sd < 0) continue; const [px, pz] = L(w * fx, sd * (d / 2 + 0.09)); wins.add(px, hh, pz, 1, 1, 1, ry + (sd < 0 ? Math.PI : 0), new THREE.Color(1, r.range(0.78, 1), r.range(0.45, 0.8))); } }
      if (r() < k.awn) { const [px, pz] = L(w * 0.2, d / 2 + 0.9); awn.add(px, yb + 2.7, pz, Math.min(3.6, w * 0.42), 0.14, 1.8, ry, awnCols[r.int(0, awnCols.length - 1)]); }
    }
    const avoid = (x, z) => dRoad(x, z) < 4.8 || Math.hypot(x - CAST[0], z - CAST[1]) < 42 || Math.hypot(x - SEPT[0], z - SEPT[1]) < 34 || (x > -30 && z < -36) || x > 20 || Math.hypot(x - WOLF[0], z - WOLF[1]) < 40;
    { const rg = K.rng(52), poly = [[20, -84], [-58, -86], [-104, -66], [-114, 0], [-104, 68], [-58, 88], [20, 86]];
      for (const [x, z] of K.scatter({ rng: rg, count: q.dens(210), bounds: [-114, -88, 22, 90], poly, minDist: 7.4, avoid })) {
        const dc = Math.hypot(x - CAST[0], z - CAST[1]), wealth = 1 - K.smoothstep(30, 120, Math.min(dc, Math.hypot(x - 10, z - 8))) + (K.fbm(x * 0.03, z * 0.03, 2, 7) - 0.5) * 0.7;
        building(x, z, wealth > 0.55 ? 'rich' : wealth > 0.1 ? 'mid' : 'poor', rg, { ry: roadAngle(x, z) + (rg() - 0.5) * 0.12 }); } }
    { const rg = K.rng(53); for (const [x, z] of K.scatter({ rng: rg, count: q.dens(40), bounds: [-70, 98, 30, 150], minDist: 8, avoid: (x, z) => Math.abs(x - FY[0]) < 25 && Math.abs(z - FY[1]) < 20 || Math.abs(x + 22) < 7 || H(x, z) < 1 })) building(x, z, 'poor', rg, { ry: rg.int(0, 3) * Math.PI / 2 }); }   // fishermen's rows outside the Seal Gate
    K.bridge(b, [-22, 1.0, -112], [-22, 1.0, -144], { w: 5.5, rise: 2.4, mat: M.stone, color: 0xe6e6e0 });
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { const t = (i + 0.5) / 4; b.box(M.lamp, -22 + sd * 2.9, 1.0 + Math.sin(t * Math.PI) * 2.4 + 1.1, -112 - t * 32, 0.4, 0.5, 0.4); }
    root.add(b.build({}));

    // ---------------------------------------------------------------- forests: dark frosted conifers on the hills, a few oaks by the river
    const TR = { trunk: new Inst(G.cyl(5, 0.7), T('wood', 0xffffff, 3)), A: new Inst(G.cone(7), flat(0xffffff, { rough: 1 })), B: new Inst(G.cone(7), flat(0xffffff, { rough: 1 })), O: new Inst(G.sphere(6), T('grass', 0xffffff, 3, { rough: 1 })) };
    const pines = ({ rng: r, count, bounds, avoid, minDist = 6, scale = [0.9, 1.5], greens = [0x2c4a3a, 0x35563f, 0x264535, 0x3b5a46] }) => { for (const [x, z] of K.scatter({ rng: r, count, bounds, minDist, avoid })) { const k = r.range(scale[0], scale[1]), y = H(x, z), gc = jit(r.pick(greens), r, 0.02, 0.08, 0.05), sn = r() < 0.34;
      TR.trunk.add(x, y, z, 0.5 * k, 3 * k, 0.5 * k, 0, 0x5d4733); TR.A.add(x, y + 2 * k, z, 2.7 * k, 5.6 * k, 2.7 * k, r() * 6, gc); TR.B.add(x, y + 5.2 * k, z, 1.9 * k, 4.4 * k, 1.9 * k, r() * 6, sn ? jit(0xdce6ea, r, 0.01, 0.04, 0.03) : gc); } };
    pines({ rng: K.rng(61), count: q.dens(600), bounds: [-460, -340, -118, 340], avoid: (x, z) => H(x, z) < 0.5 || Math.abs(z - rz(x)) < 10 });
    pines({ rng: K.rng(62), count: q.dens(150), bounds: [-120, 100, 40, 330], avoid: (x, z) => H(x, z) < 0.5 || (Math.abs(x + 22) < 14 && z < 140) || Math.hypot(x + 22, z - 114) < 38 || Math.hypot(x + 40, z - 130) < 0 });
    pines({ rng: K.rng(64), count: q.dens(50), bounds: [-120, -150, 30, -96], scale: [0.7, 1.1], avoid: (x, z) => H(x, z) < 0.5 || Math.abs(z - rz(x)) < 8 });
    { const r = K.rng(63); for (const [x, z] of K.scatter({ rng: r, count: 26, bounds: [-30, -168, 40, -82], minDist: 5, avoid: (x, z) => H(x, z) < 0.5 || Math.abs(z - rz(x)) < 6 })) { const k = r.range(0.9, 1.4), y = H(x, z); TR.trunk.add(x, y, z, 0.5 * k, 3.4 * k, 0.5 * k, 0, 0x5a4634); TR.O.add(x, y + 2.6 * k, z, 2.8 * k, 2.5 * k, 2.8 * k, r() * 6, jit(0x4f6e40, r, 0.02, 0.08, 0.05)); } }
    for (const i of Object.values(TR)) if (i.items.length) root.add(i.build());

    // ---------------------------------------------------------------- lanterns on every street, banners, life
    const lan = new Inst(G.box(), M.lamp), post = new Inst(G.cyl(5, 1), M.woodD);
    stSm.forEach((sp, si) => { for (let i = 2; i < sp.length - 1; i += 4) { const [x, z] = sp[i], o = (i % 8 ? 1 : -1) * 3.9; if (Math.hypot(x - SEPT[0], z - SEPT[1]) < 20 && 0) continue; post.add(x + o, H(x + o, z), z, 0.15, 3.2, 0.15); lan.add(x + o, H(x + o, z) + 3.2, z, 0.5, 0.7, 0.5); } });
    const bnL = [[-46, 41, -30], [-12, 40, 2], [-22, 30, 92], [CAST[0] - 30, H(CAST[0] - 30, CAST[1] - 26) + 28, CAST[1] - 26], [CAST[0] + 30, H(CAST[0] + 30, CAST[1] + 22) + 28, CAST[1] + 22], [SEPT[0], H(SEPT[0], SEPT[1]) + 35, SEPT[1]], [-22, 22, -89], [-119, 22, 0]];
    root.add(K.banners(bnL.map(([x, y, z], i) => ({ x, y, z, w: 3.2, h: 7, color: i % 3 === 2 ? 0x2f5f7a : 0x3d7a72, ry: 0.3 + i })), { pole: false })); for (const [x, y, z] of bnL) post.add(x, y - 7.3, z, 0.2, 8.4, 0.2);
    root.add(lan.build(), post.build(), wins.build(), awn.build());
    // lofted ships
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
    const ships = [], hulls = [0x5b4129, 0x4a3a2c, 0x6a4a30, 0x2f4a5c, 0x7a3a30], sails = [0xe8dfc8, 0xd7d2c4, 0xb9c4d0, 0xdcd4bf, 0xa6bfd3];
    const mk = (type, len, x, z, ry, i, moving) => { const s = makeShip(type, len, hulls[i % 5], sails[(i + 1) % 5], ships.length + 2); s.position.set(x, 0.1, z); s.rotation.y = ry; root.add(s); ships.push({ s, moving, ph: ships.length * 1.7 }); };
    [[-50, 1], [-30, 2], [-10, 3], [10, 4], [30, 5], [50, 1]].forEach(([z], i) => mk(i === 2 ? 'galley' : 'cog', 14 + (i % 3) * 2, 49 + (i % 2) * 3, z + 8, 0, i));
    for (let i = 0; i < 3; i++) mk(i === 1 ? 'galley' : 'cog', 16 + i * 3, 0, 0, 0, i + 2, { a: 70 + i * 24, b: 52 + i * 14, cx: 150 + i * 20, cz: -12 + i * 12, sp: 0.03 + i * 0.006, ph: i * 2 });
    for (let i = 0; i < 3; i++) mk('barge', 8, 0, 0, 0, i + 1, { a: 40 + i * 8, b: 22 + i * 4, cx: 92, cz: -18 + i * 16, sp: 0.045, ph: i * 1.3 });
    ctx.onUpdate((dt, t) => ships.forEach((o) => { if (o.moving) { const m = o.moving, a = t * m.sp + m.ph, x = m.cx + Math.cos(a) * m.a, z = m.cz + Math.sin(a) * m.b, dx = -Math.sin(a) * m.a, dz = Math.cos(a) * m.b; o.s.position.set(x, 0.1, z); o.s.rotation.y = K.headingX(dx, dz); } else o.s.position.y = 0.1 + Math.sin(t * 0.8 + o.ph) * 0.1; animSails(o.s, t, o.ph); }));
    // harbour-mouth beacon: a short turning beam that only shows at night (its visibility follows the lamp glow)
    { const g = new THREE.Group(), bm = new THREE.MeshBasicMaterial({ color: 0xffe8b8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide, vertexColors: true }), geo = new THREE.CylinderGeometry(0.4, 6, 110, 10, 1, true).rotateZ(Math.PI / 2).translate(55, 0, 0), pa = geo.attributes.position, ca = new Float32Array(pa.count * 3);
      for (let i = 0; i < pa.count; i++) { const f = 1 - pa.getX(i) / 110; ca[i * 3] = ca[i * 3 + 1] = ca[i * 3 + 2] = f * f; } geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
      g.add(new THREE.Mesh(geo, bm)); const m2 = new THREE.Mesh(geo, bm); m2.rotation.y = Math.PI; g.add(m2); g.position.set(111, 17, -41); g.traverse((o) => { o.renderOrder = 8; o.frustumCulled = false; }); root.add(g);
      ctx.onUpdate((dt, t) => { const n = (M.lamp.color.r / M.lamp.userData.base.r - 0.14) / 1.25; bm.opacity = K.clamp(n, 0, 1) * 0.12; g.rotation.y = t * 0.5; }); }
    const gulls = K.birds({ center: [70, 40, 0], radius: 110, count: q.dens(26), color: 0xf4f4f4, size: 1.3, spreadY: 16, seed: 3 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const sept = K.birds({ center: [SEPT[0], 55, SEPT[1]], radius: 22, count: q.dens(7), color: 0xe8e8e8, size: 1.0, spreadY: 6, seed: 9, speed: 0.25 }); root.add(sept); ctx.onUpdate((dt, t) => sept.userData.update(t));
    root.add(K.smoke(stacks.filter((_, i) => i % 3 === 0).slice(0, 60), { size: 22, rise: 16, opacity: 0.3, color: 0xd0d3d6, perStack: 4 }));
    const fire = K.fires([[111, 19, -41], [32, 24, 84], [32, 24, -84], [-22, 9, 91], [-22, 9, -89], ...torches.slice(0, 4)], { size: 8, light: q.low ? 0 : 3, intensity: 70 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const wk = K.walkers({ paths: [[[27, -70], [27, 70]], [[-22, 112], [-22, 80], [-22, 10]], [[-100, 4], [-30, 12], [26, 10]], [[-40, 112], [-4, 114]]], heightAt: H, count: q.dens(40), rng: K.rng(8), colors: [0x4d5a6a, 0x7a5c3a, 0x57603a, 0x6c7f95, 0x8a8a8a] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const cl = K.clouds({ y: 220, extent: 700, count: 10, opacity: 0.38, color: 0xeef2f6 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 220, center: [-10, 0, 0], minDistance: 18,
      hero: { pos: [205, 112, 165], target: [-34, 8, -6] },
      climate: { atmos: 'day', weather: 'clear', snow: 0.2, tint: {
        dawn: { top: 0x56689e, horizon: 0xe8b8a2, fog: 0xd2b8b0, fogD: 0.0015, sunC: 0xffc29a, sunI: 2.8, hemiSky: 0xa8b4d8, hemiGround: 0x5a5048 },
        day: { top: 0x4a82b8, horizon: 0xb8cede, fog: 0xb4c8d8, sunC: 0xfff0dc, sunI: 3.1, elev: 0.5, fogD: 0.0007, hemiSky: 0xa8c4e2, hemiGround: 0x5c6a58, hemiI: 1.0 },
        dusk: { top: 0x28386e, horizon: 0xdc8c6c, fog: 0xb88a86, fogD: 0.0016, sunC: 0xff9660, sunI: 2.8, hemiSky: 0x8090c8, hemiGround: 0x4a4048, hemiI: 0.75 },
        night: { top: 0x070c24, horizon: 0x2a3c62, fog: 0x1c2a48, fogD: 0.0019, sunC: 0xa8c0f0, sunI: 1.4, hemiSky: 0x6478b4, hemiGround: 0x243040, hemiI: 1.4, exposure: 1.2 },
      } },
      landmarks: {
        'harbour-quays': lm(34, 6, 26, 10), 'city-walls': lm(-108, 40, 16, 20), 'wolfs-den': lm(6, -64, 22, 24), 'new-castle': lm(-46, -30, 20, 34), 'castle-stair': lm(-17, -26, 10, 6),
        'mermans-court': lm(-28, -12, 10, 20), 'sept-of-the-snows': lm(-62, 48, 14, 36), 'fishfoot-yard': lm(-22, 114, 22, 6), 'seal-gate': lm(-22, 91, 10, 22), 'white-knife': lm(10, -126, 26, 3),
      },
      cutaways: [],
    };
  },
};
