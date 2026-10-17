// King's Landing — flagship scene. Book anchors: three hills (Aegon's High Hill / Red Keep, Visenya's Hill / Great Sept of Baelor,
// Rhaenys's Hill / Dragonpit), the Blackwater Rush and Blackwater Bay, a walled city with seven named gates, Flea Bottom, the Street of Steel
// and Street of the Sisters, Maegor's Holdfast (dry moat, spikes, seven drum towers), the Tower of the Hand, Traitor's Walk, and the Iron Throne hall.
// Everything else (street plan, positions, building shapes, harbour layout) is artistic interpretation — see content/kings-landing.js.
//
// Visual language: warm red-sandstone Red Keep with pale string courses and slate-blue roofs, a golden-sand city wall, a city of
// plaster/timber houses under muted terracotta, white marble Sept with crystal spires, hazy golden southern light.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

// x = east (Blackwater Bay), -z = north, +z = south (the Blackwater Rush lies south of the city).
const AEG = [110, 70], VIS = [-135, 45], RHA = [10, -150], HF = [104, 58], FLEA = [25, 25];
const bayEdge = (z) => 232 + 18 * Math.sin(z * 0.012);
const riverZ = (x) => 222 + 16 * Math.sin(x * 0.011 + 1);
const riverW = (x) => 34 + K.smoothstep(-200, 200, x) * 28;
const bump = (x, z, c, r, h, kw = 1) => h * (1 - K.smoothstep(r * 0.55, r, Math.hypot((x - c[0]) * (x < c[0] ? kw : 1), z - c[1])));
const WALL = [[-300, 165], [-312, 30], [-292, -100], [-226, -196], [-110, -250], [10, -262], [120, -236], [212, -176]];
const onWall = (i, t) => { const a = WALL[i], b = WALL[i + 1]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, Math.atan2(-(b[1] - a[1]), b[0] - a[0])]; };
const GATES = { lion: onWall(1, 0.3), iron: onWall(5, 0.5), old: onWall(3, 0.35), gods: onWall(4, 0.5), dragon: onWall(6, 0.55), kings: onWall(0, 0.8) };
const MUD = [50, 172];
const ROADS = {
  steel: [[-302, 138], [-230, 125], [-140, 118], [-60, 100], [0, 92], [56, 72]],
  sisters: [[-135, 45], [-120, -40], [-95, -130], [-70, -200], [-50, -256]],
  dragon: [[170, -203], [110, -150], [70, -110], [40, -50], [30, 10], [60, 55], [72, 66]],
  iron: [[65, -249], [85, -200], [70, -110]],
  old: [[-185, -215], [-160, -130], [-140, -60], [-135, 45]],
  lion: [[-306, -9], [-230, 10], [-170, 40], [-135, 45]],
  mud: [[50, 172], [48, 120], [30, 60], [30, 20]],
  harbor: [[30, 20], [100, -20], [170, 0], [232, 20]],
  quay: [[232, 20], [245, 90], [238, 150]],
};
const roadList = Object.values(ROADS);
const roadSm = roadList.map((r) => K.smoothPath(r, 4));

// ---- small helpers --------------------------------------------------------------------------------------------------------
const tint = (r, v = 0.12, w = 0.05) => { const k = 1 - v * r(); return new THREE.Color(k, k * (1 - w * r()), k * (1 - w * r() * 1.4)); };
const jit = (hex, r, dh = 0.012, ds = 0.05, dl = 0.03) => new THREE.Color(hex).offsetHSL((r() - 0.5) * 2 * dh, (r() - 0.5) * 2 * ds, (r() - 0.5) * 2 * dl);
const TAU = Math.PI * 2;
const _up = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _d = new THREE.Vector3(), _e = new THREE.Euler();
const loc = (cx, cz, ry) => { const c = Math.cos(ry), s = Math.sin(ry); return (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c]; };

/** Beam from p to q (arrays) — rafters, cranes, ribs, rigging. */
function strut(b, mat, p, q, w, color = 0xffffff, d = w) {
  _d.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); const len = _d.length(); if (len < 1e-3) return;
  _q.setFromUnitVectors(_up, _d.multiplyScalar(1 / len)); _m.compose(_p.set(p[0], p[1], p[2]), _q, _s.set(w, len, d));
  b.addGeometry(mat, G.box(), _m, color);
}
const _quad = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
/** Single flat panel (doors) — 2 triangles, facing local +Z of heading ry. */
function quad(b, mat, x, y, z, ry, w, h) { _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(w, h, 1)); b.addGeometry(mat, _quad, _m, 0xffffff); }
const archCache = new Map();
function archGeo(w, h, depth) {
  const k = `${w}|${h}|${depth}`; let g = archCache.get(k); if (g) return g;
  const r = w / 2, s = new THREE.Shape(); s.moveTo(-r, 0); s.lineTo(-r, h - r); s.absarc(0, h - r, r, Math.PI, 0, true); s.lineTo(r, 0); s.closePath();
  g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 5 }); archCache.set(k, g); return g;
}
/** Arched panel (window / doorway) standing on the base point, facing local +Z of heading ry, extruding outward. */
function arch(b, mat, x, y, z, ry, w, h, depth = 0.25, color = 0xffffff) {
  _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(1, 1, 1)); b.addGeometry(mat, archGeo(w, h, depth), _m, color);
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root;
    // ---- terrain ---------------------------------------------------------------------------------------------------
    const heightAt = (x, z) => {
      let h = 4 + (K.fbm(x * 0.008, z * 0.008, 3, 3) - 0.5) * 9 + (K.fbm(x * 0.05, z * 0.05, 2, 8) - 0.5) * 0.9;
      h += bump(x, z, AEG, 104, 44, 0.62) + bump(x, z, VIS, 92, 32) + bump(x, z, RHA, 88, 28);
      h += K.smoothstep(200, 440, -z) * 60 * (0.6 + K.fbm(x * 0.006, z * 0.006, 3, 2));
      const dz = z - riverZ(x);
      h += K.smoothstep(40, 320, dz) * 24 * (0.4 + K.fbm(x * 0.007, z * 0.007, 3, 6));
      const flea = Math.hypot(x - FLEA[0], z - FLEA[1]); h -= (1 - K.smoothstep(20, 62, flea)) * 1.6;
      const cityK = (1 - K.smoothstep(-44, -18, x - bayEdge(z))) * (1 - K.smoothstep(-46, -22, z - riverZ(x)));
      h = K.lerp(h, Math.max(h, 2.5 + (1 - K.smoothstep(20, 62, flea)) * 0.2), cityK);
      const hd = Math.abs(Math.hypot(x - HF[0], z - HF[1]) - 31); h -= (1 - K.smoothstep(1.5, 5.5, hd)) * 4.2; // Maegor's dry ditch
      const w = riverW(x); h = K.lerp(h, -4.5, 1 - K.smoothstep(w * 0.5, w, Math.abs(dz)));
      const d = x - bayEdge(z); h = K.lerp(h, -9, K.smoothstep(-10, 25, d));
      return h;
    };
    const H = heightAt;
    const C = (h) => new THREE.Color(h);
    const gA = C(0x8c9858), gB = C(0xaaa466), gC = C(0x6f7f48), dry = C(0xc4ae74), straw = C(0xcfb878), dirt = C(0x9c8668), dust = C(0xb0a080), olive = C(0x8a8a5a), mud = C(0x6c694b), rockC = C(0x8a7f72), rockHi = C(0xa99c86), sandC = C(0xcbbf94), c = new THREE.Color();
    const cityPoly = [...WALL, [245, -60], [250, 60], [238, 150], [150, 168], [0, 172], [-150, 170]];
    const colorAt = (x, z, h, s) => {
      const n1 = K.fbm(x * 0.012, z * 0.012, 3, 1), n2 = K.fbm(x * 0.05, z * 0.05, 2, 2), n3 = K.fbm(x * 0.006, z * 0.006, 2, 5);
      c.copy(gA).lerp(gB, n1).lerp(gC, K.smoothstep(0.45, 0.7, n2) * 0.55).lerp(dry, K.clamp(n3 * 1.3 - 0.4, 0, 0.7));
      const inCity = K.pointInPoly(x, z, cityPoly);
      // patchwork fields on the gentle lowlands outside the walls
      if (!inCity && h > 2 && h < 16 && s < 0.12 && K.fbm(x * 0.004, z * 0.004, 2, 11) > 0.42) {
        const v = Math.floor(K.noise2(x * 0.013, z * 0.017, 9) * 4) / 4;
        c.lerp(v < 0.25 ? gC : v < 0.5 ? straw : v < 0.75 ? gB : dry, 0.55);
      }
      if (inCity) c.lerp(dust, 0.5 + 0.2 * n2).lerp(dirt, 0.18 * n1).lerp(olive, 0.14 * K.smoothstep(0.5, 0.7, n3));
      if (Math.hypot(x - AEG[0], z - AEG[1]) < 56) c.lerp(dust, 0.3).lerp(olive, 0.3);                              // Red Keep yards
      if (h < 1.9) c.lerp(mud, K.clamp((1.9 - h) * 0.45, 0, 0.8));                                    // tidal flats / Flea Bottom
      if (h < 0.5 && h > -1.5) c.lerp(sandC, 0.45);                                                   // pale shore line
      const strata = 0.5 + 0.5 * Math.sin(h * 0.7 + K.fbm(x * 0.03, z * 0.03, 2, 4) * 7);
      c.lerp(strata > 0.5 ? rockHi : rockC, K.clamp((s - 0.1) * 3.4, 0, 0.7));
      if (h > 26 && z < -180) c.lerp(strata > 0.55 ? straw : gC, 0.25);                               // far northern downs
      return c;
    };
    const terr = K.terrain({ w: 1500, d: 1500, seg: q.seg(115), center: [60, 40], heightAt, kind: 'rock', scale: 22, colorAt });
    root.add(terr);
    const wat = K.water({ w: 1300, d: 1300, seg: q.seg(88), center: [150, 50], level: 0, heightAt, deep: 0x173f58, shallow: 0x4f8a88, opacity: 0.93, choppy: 0.6, speed: 0.55 });
    root.add(wat); ctx.registerWater(wat);
    const farSea = K.water({ w: 7000, d: 7000, seg: 6, level: -0.4, heightAt: () => -20, deep: 0x173f58, shallow: 0x173f58, opacity: 0.92, choppy: 0.6, speed: 0.55, center: [1500, 50] }); root.add(farSea); ctx.registerWater(farSea);
    // far land is sunk under the detailed terrain: its coarse triangles used to bridge the valleys between the hills and bury whole streets
    const farLand = K.terrain({ w: 5200, d: 5200, seg: 56, center: [-1400, 0], heightAt: (x, z) => { if (x > -600 && x < 720 && z > -620 && z < 700) return -40; const h = H(x, z); return h < 3 ? -25 : h - 5; }, kind: 'rock', scale: 40, colorAt: (x, z) => c.copy(gA).lerp(dry, 0.25 + 0.5 * K.fbm(x * 0.004, z * 0.004, 2, 3)).lerp(gC, 0.3) }); root.add(farLand);

    // ---- materials -------------------------------------------------------------------------------------------------
    const T = (k, color, scale = 7, o = {}) => tri(k, { color, scale, snow: false, ...o });
    const M = {
      red: T('stone', 0xb9786a, 5, { bump: 0.45 }), redLo: T('stone', 0x925d50, 5, { bump: 0.45 }), trim: T('stone', 0xe0cbae, 4),
      slate: T('slate', 0x6f7684, 4, { bump: 0.5 }), slateDk: T('slate', 0x545a68, 4, { bump: 0.5 }),
      sand: T('stone', 0xd6c093, 5), sandLo: T('stone', 0xa6916c, 5), stoneB: T('stone', 0xa69c8c, 5),
      plA: T('plaster', 0xf1e7d0, 6), plB: T('plaster', 0xe5c79e, 6), plC: T('plaster', 0xe4c2b0, 6), plD: T('plaster', 0xd3d4c8, 6),
      wood: T('wood', 0x765a40, 4), woodDk: T('wood', 0x4c3b2d, 4), green: T('wood', 0x46695a, 3),
      tileA: T('tile', 0xd89468, 5), tileB: T('tile', 0xc07a62, 5), tileC: T('tile', 0xcfa878, 5), thatch: T('thatch', 0x9d8a5a, 5),
      marble: T('marble', 0xf5f0e6, 8), basalt: T('stone', 0xaea99f, 5.5), basaltIn: T('stone', 0x9c968c, 5.5, { side: THREE.DoubleSide }), cobble: T('cobble', 0x9a9183, 8),
      iron: flat(0x2c2b30, { metal: 0.7, rough: 0.5 }), gold: flat(0xd8b050, { metal: 0.55, rough: 0.35 }), dark: flat(0x171310, { rough: 1 }), door: flat(0x33271c, { rough: 0.9 }),
      win: glow(0xffc46b), lamp: glow(0xffa24a, 1.15), crystal: flat(0xffffff, { rough: 0.1, metal: 0.3, transparent: true, opacity: 0.72, flatShading: false }),
      deck: T('wood', 0xa58a64, 3), hullW: T('wood', 0x8a6a4c, 3, { side: THREE.DoubleSide }),
    };
    const rt = K.rng(404);
    const b = new Batch(), gb = new Batch();

    // ---- reusable structure builders --------------------------------------------------------------------------------------
    /** Tapered drum tower: battered plinth, string courses, slits, corbelled crown, conical or crenellated top, gilt finial. */
    function drum(x, y, z, r, h, o = {}) {
      const { seg = 12, taper = 0.86, roof = 'cone', roofH = r * 2.7, rings = [0.34, 0.68], stone = M.red, trim = M.trim, base = M.redLo, roofMat = M.slate, col = 0xffffff, rcol = 0xffffff, slits = 3, lit = 1, balcony = 0, finial = true, merMat = stone } = o;
      const rA = (t) => r * (1 - (1 - taper) * t);
      b.cyl(base, x, y - 3, z, r * 1.14, 5.6, { top: 0.9, seg, color: col });
      b.cyl(stone, x, y, z, r, h, { top: taper, seg, color: col });
      for (const t of rings) b.cyl(trim, x, y + t * h - 0.3, z, rA(t) * 1.05, 0.6, { top: 1, seg, color: col });
      if (balcony) b.cyl(trim, x, y + h * balcony, z, rA(balcony) * 1.32, 0.7, { top: 1.0, seg, color: col });
      const yt = y + h, rt2 = rA(1), R2 = rt2 * 1.02 * 1.28;
      b.cyl(trim, x, yt - 0.2, z, rt2 * 1.02, 1.6, { top: 1.28, seg, color: col });
      for (let k = 0; k < slits; k++) { const a = k * 2.1 + r * 1.3, t = 0.2 + 0.5 * k / slits, rr = rA(t) + 0.04; b.box(M.dark, x + Math.cos(a) * rr, y + h * t, z + Math.sin(a) * rr, 0.32, 1.7, 0.16, Math.PI / 2 - a); }
      for (let k = 0; k < lit; k++) { const a = k * 2.7 + 0.6 + r, t = 0.62 + 0.1 * k, rr = rA(t) + 0.05; b.box(M.win, x + Math.cos(a) * rr, y + h * t, z + Math.sin(a) * rr, 0.55, 1.5, 0.12, Math.PI / 2 - a); }
      if (roof === 'cone') {
        b.cone(roofMat, x, yt + 1.4, z, R2 * 1.04, roofH, { seg, color: rcol });
        if (finial) { b.cyl(M.gold, x, yt + 1.2 + roofH, z, 0.16, 2.4, { seg: 5, top: 0.5 }); b.sphere(M.gold, x, yt + 3.4 + roofH, z, 0.42, { seg: 6 }); }
      } else {
        b.cyl(stone, x, yt + 1.4, z, R2, 1.0, { top: 1, seg, color: col });
        const n = Math.max(7, Math.round((TAU * R2) / 2.7));
        for (let i = 0; i < n; i++) { const a = (i / n) * TAU; b.box(merMat, x + Math.cos(a) * (R2 - 0.3), yt + 2.4, z + Math.sin(a) * (R2 - 0.3), 1.4, 1.5, 0.7, Math.PI / 2 - a, col); }
        if (roof === 'flatcap') { b.cyl(stone, x, yt + 2.4, z, R2 * 0.55, 3.2, { top: 0.9, seg, color: col }); b.cone(roofMat, x, yt + 5.6, z, R2 * 0.62, R2 * 0.9, { seg, color: rcol }); }
      }
    }
    /** Square tower: battered plinth, courses, corbelled parapet or pyramid roof. */
    function sqTower(x, y, z, w, h, o = {}) {
      const { ry = 0, roof = 'pyramid', roofH = w * 1.1, stone = M.red, trim = M.trim, base = M.redLo, roofMat = M.slate, col = 0xffffff, rcol = 0xffffff, d = w } = o;
      const L = loc(x, z, ry);
      b.box(base, x, y - 3, z, w * 1.1, 6, d * 1.1, ry, col); b.box(stone, x, y - 3, z, w, h + 3, d, ry, col);
      for (const t of [0.4, 0.72]) b.box(trim, x, y + h * t, z, w + 0.45, 0.5, d + 0.45, ry, col);
      b.box(trim, x, y + h - 1.2, z, w + 1.3, 1.1, d + 1.3, ry, col);
      for (const [lx, lz] of [[0, d / 2 + 0.05], [0, -d / 2 - 0.05]]) { const [px, pz] = L(lx, lz); b.box(M.dark, px, y + h * 0.28, pz, 0.35, 1.8, 0.16, ry); }
      const [wx, wz] = L(0, d / 2 + 0.06); arch(b, M.win, wx, y + h * 0.55, wz, ry, 1.1, 2.4, 0.12);
      if (roof === 'pyramid') b.pyramid(roofMat, x, y + h, z, w + 2.4, roofH, d + 2.4, ry, rcol);
      else {
        b.box(stone, x, y + h, z, w + 1.3, 0.9, d + 1.3, ry, col);
        for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const t = (i + 0.5) / 4 - 0.5; for (const [ax, az] of [[sx * (w / 2 + 0.3), t * d * 0.95], [t * w * 0.95, sx * (d / 2 + 0.3)]]) { const [px, pz] = L(ax, az); b.box(stone, px, y + h + 0.9, pz, 1.1, 1.0, 1.1, ry, col); } }
      }
    }
    /** Wall plinth, string course and corbel table, replicating K.wall's segmentation. */
    function wallTrim(pts, { h, t, closed = false, plinth, trim, plinthH = 3.2 }) {
      const n = closed ? pts.length : pts.length - 1;
      for (let i = 0; i < n; i++) {
        const A = pts[i], B = pts[(i + 1) % pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz); if (len < 0.01) continue;
        const steps = Math.max(1, Math.ceil(len / 14)), ry = Math.atan2(-dz, dx);
        for (let s = 0; s < steps; s++) {
          const t0 = s / steps, t1 = (s + 1) / steps, x0 = A[0] + dx * t0, z0 = A[1] + dz * t0, x1 = A[0] + dx * t1, z1 = A[1] + dz * t1;
          const g = Math.min(H(x0, z0), H(x1, z1), H((x0 + x1) / 2, (z0 + z1) / 2)), top = Math.max(H(x0, z0), H(x1, z1)) + h, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sl = Math.hypot(x1 - x0, z1 - z0) + 0.6;
          b.box(plinth, cx, g - 3, cz, sl + 0.2, plinthH + 3, t + 1.5, ry);
          b.box(trim, cx, top - 1.0, cz, sl, 0.95, t + 0.9, ry);
          b.box(trim, cx, g + (top - g) * 0.55, cz, sl, 0.4, t + 0.35, ry);
        }
      }
    }
    /** Gatehouse dressing: dark tunnel behind the portcullis, lintel frame, torches. Returns torch positions. */
    function gateDress(gx, gz, y, ry, { w, d, h, gate, mat = M.trim }) {
      const L = loc(gx, gz, ry), out = [];
      const [bx, bz] = L(0, -d * 0.2); b.box(M.dark, bx, y, bz, gate - 0.2, gate * 1.15, 0.3, ry);
      b.box(mat, gx, y + gate * 1.15 - 0.8, gz, gate + 1.6, 0.8, d + 0.5, ry);
      b.box(mat, gx, y + h - 1.1, gz, w, 0.95, d + 1.5, ry);
      for (const sx of [-1, 1]) {
        const [px, pz] = L(sx * (gate / 2 + 1.5), d / 2 + 0.45);
        b.box(M.iron, px, y + 4.6, pz, 0.25, 0.9, 0.25, ry); b.box(M.lamp, px, y + 5.5, pz, 0.5, 0.6, 0.5, ry); out.push([px, y + 6.4, pz]);
      }
      return out;
    }

    // ---- city wall + gates -----------------------------------------------------------------------------------------
    K.wall(b, WALL, { h: 15, t: 4.2, mat: M.sand, capMat: M.sand, heightAt, closed: false });
    wallTrim(WALL, { h: 15, t: 4.2, plinth: M.sandLo, trim: M.trim });
    for (let i = 0; i < WALL.length - 1; i++) {
      const [x0, z0] = WALL[i], [x1, z1] = WALL[i + 1], n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / 46));
      for (let k = 0; k <= n; k++) {
        const x = x0 + (x1 - x0) * k / n, z = z0 + (z1 - z0) * k / n, cone = false;
        drum(x, H(x, z), z, 4.7, 21 + ((i + k) % 2) * 3, { seg: 10, stone: M.sand, base: M.sandLo, roof: cone ? 'cone' : 'flat', roofH: 8, roofMat: M.slate, col: tint(rt, 0.06, 0.03), rings: [0.5], slits: 2, lit: 0, taper: 0.9 });
      }
    }
    const torches = [];
    for (const [gx, gz, ry] of Object.values(GATES)) {
      const gy = H(gx, gz), o = { w: 24, d: 11, h: 22, gate: 6 };
      K.gatehouse(b, gx, gz, { y: gy, ry, mat: M.sand, roofMat: M.slate, w: o.w, d: o.d, h: o.h, gate: o.gate, wood: M.wood, towerR: 5 });
      torches.push(...gateDress(gx, gz, gy, ry, o));
    }
    // river wall and the Mud Gate beside Flea Bottom
    const RW = [[-20, 166], [10, 168], [90, 168], [130, 162]];
    K.wall(b, RW, { h: 11, t: 3.4, mat: M.sand, capMat: M.sand, heightAt, closed: false }); wallTrim(RW, { h: 11, t: 3.4, plinth: M.sandLo, trim: M.trim, plinthH: 2.4 });
    { const my = Math.max(H(MUD[0], MUD[1] - 4), 1.5), o = { w: 22, d: 10, h: 18, gate: 5.5 };
      K.gatehouse(b, MUD[0], MUD[1] - 4, { y: my, ry: 0, mat: M.sand, roofMat: M.slate, w: o.w, d: o.d, h: o.h, gate: o.gate, wood: M.wood, towerR: 4.6 });
      torches.push(...gateDress(MUD[0], MUD[1] - 4, my, 0, o)); }
    b.box(M.wood, MUD[0], 0.2, MUD[1] + 8, 6, 0.5, 14, 0); // landing

    // ---- roads -----------------------------------------------------------------------------------------------------
    for (const [name, pts] of Object.entries(ROADS)) {
      const sp = K.smoothPath(pts, 5), wide = name === 'steel' || name === 'dragon' || name === 'harbor', wd = wide ? 7.5 : 5.5;
      b.ribbon(M.cobble, sp, wd + 2.4, heightAt, 0.24, 0x7d7264);                                          // worn verge
      b.ribbon(M.cobble, sp, wd, heightAt, 0.34, name === 'quay' ? 0xd8d0c0 : wide ? 0xc9bfae : 0xb4aa98);
    }

    // ---- Red Keep on Aegon's High Hill ----------------------------------------------------------------------------------
    const rkRing = Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * TAU, r = 54 + 3 * Math.sin(i * 2.1); return [AEG[0] + Math.cos(a) * r, AEG[1] + Math.sin(a) * r]; });
    K.wall(b, rkRing, { h: 13, t: 4, mat: M.red, capMat: M.redLo, heightAt, closed: true });
    wallTrim(rkRing, { h: 13, t: 4, closed: true, plinth: M.redLo, trim: M.trim });
    rkRing.forEach(([x, z], i) => {
      const col = tint(rt, 0.1, 0.06), y = H(x, z);
      if (i % 4 === 0) sqTower(x, y, z, 7.5, 24 + (i % 8) * 1.5, { ry: Math.atan2(z - AEG[1], x - AEG[0]) * -1, roof: i === 8 ? 'pyramid' : 'flat', roofH: 11, col, rcol: tint(rt, 0.12, 0.02) });
      else if (i % 2 === 0) drum(x, y, z, 5.0, 25 + (i % 3) * 3, { seg: 12, roof: 'flat', merMat: M.redLo, col, rcol: tint(rt, 0.12, 0.02) });
    });
    { const gx = AEG[0] - 56, gy = H(gx, AEG[1]), o = { w: 22, d: 10, h: 20, gate: 5.5 };
      K.gatehouse(b, gx, AEG[1], { y: gy, ry: Math.PI / 2, mat: M.red, roofMat: M.slate, w: o.w, d: o.d, h: o.h, gate: o.gate, wood: M.wood, towerR: 4.5 });
      torches.push(...gateDress(gx, AEG[1], gy, Math.PI / 2, o)); }
    // Maegor's Holdfast: square keep, seven drum towers, dry ditch with iron spikes
    const hy = H(HF[0], HF[1]) + 0.4, HL = loc(HF[0], HF[1], 0);
    b.box(M.redLo, HF[0], hy - 3, HF[1], 39.6, 8, 39.6, 0); b.box(M.red, HF[0], hy - 3, HF[1], 36, 27, 36, 0);
    for (const t of [9, 17]) b.box(M.trim, HF[0], hy + t, HF[1], 36.7, 0.55, 36.7, 0);
    b.box(M.trim, HF[0], hy + 22.2, HF[1], 38.4, 1.8, 38.4, 0); b.box(M.red, HF[0], hy + 24, HF[1], 37.2, 1.0, 37.2, 0);
    for (let s = 0; s < 4; s++) for (let i = 0; i < 12; i++) { const u = (i + 0.5) / 12 - 0.5, a = s * Math.PI / 2, ex = Math.cos(a), ez = Math.sin(a), px = HF[0] + ex * 18.3 - ez * u * 36, pz = HF[1] + ez * 18.3 + ex * u * 36; b.box(M.red, px, hy + 25, pz, 1.8, 1.2, 1.0, Math.PI / 2 - a); }
    for (const sd of [-1, 1]) for (const lx of [-9, 9]) { arch(b, M.win, HF[0] + lx, hy + 11, HF[1] + sd * 18.05, sd > 0 ? 0 : Math.PI, 1.6, 5, 0.2); arch(b, M.win, HF[0] + sd * 18.05, hy + 11, HF[1] + lx, sd > 0 ? Math.PI / 2 : -Math.PI / 2, 1.6, 5, 0.2); }
    for (const [ox, oz] of [[-18, -18], [18, -18], [-18, 18], [18, 18], [0, -18], [-18, 0], [18, 0]]) drum(HF[0] + ox, hy, HF[1] + oz, 5.8, 33, { seg: 14, stone: M.red, roof: 'flatcap', merMat: M.redLo, roofH: 15, base: M.redLo, col: tint(rt, 0.08, 0.05), rings: [0.25, 0.5, 0.75], lit: 2, slits: 4, rcol: tint(rt, 0.1, 0.02) });
    for (let i = 0; i < 70; i++) { const a = (i / 70) * TAU, x = HF[0] + Math.cos(a) * 31, z = HF[1] + Math.sin(a) * 31; b.cone(M.iron, x, H(x, z), z, 0.35, 2.4, { seg: 4 }); }
    K.bridge(b, [HF[0], hy + 0.5, HF[1] + 20], [HF[0], hy + 0.5, HF[1] + 42], { w: 6, rise: 0.8, mat: M.wood, rail: false, pillars: false });
    K.keep(b, HF[0], HF[1] - 8, { w: 14, d: 14, h: 18, y: hy + 25, mat: M.red, roofMat: M.slate, turret: false, roof: 'pyramid', roofH: 9, color: tint(rt, 0.06, 0.03) });
    // Tower of the Hand: the tallest, slimmest tower
    const th = [78, 94];
    drum(th[0], H(th[0], th[1]), th[1], 6.6, 58, { seg: 14, taper: 0.76, roofH: 15, rings: [0.2, 0.4, 0.6, 0.82], balcony: 0.9, lit: 4, slits: 5, roofMat: M.slateDk, col: tint(rt, 0.04, 0.02) });
    // Great Hall / throne hall: tall, narrow windows between buttresses, slate roof
    const gh = [132, 104], ghy = H(gh[0], gh[1]), GR = 0.15, GL = loc(gh[0], gh[1], GR);
    b.box(M.redLo, gh[0], ghy - 3, gh[1], 43.2, 6.4, 23.2, GR); b.box(M.red, gh[0], ghy - 3, gh[1], 42, 26, 22, GR);
    b.box(M.trim, gh[0], ghy + 21, gh[1], 43, 1.0, 23, GR); b.prism(M.slate, gh[0], ghy + 22, gh[1], 45, 9, 25, GR); b.box(M.slateDk, gh[0], ghy + 30.8, gh[1], 45.4, 0.5, 0.8, GR);
    for (let i = -4; i <= 4; i++) for (const sd of [-1, 1]) { const [wx, wz] = GL(i * 4.6, sd * 11.06); arch(b, M.win, wx, ghy + 7, wz, GR + (sd < 0 ? Math.PI : 0), 1.7, 9, 0.16); }
    for (let i = -5; i <= 5; i++) for (const sd of [-1, 1]) { const [wx, wz] = GL(i * 4.6 + 2.3, sd * 11.5); b.box(M.red, wx, ghy - 1, wz, 1.5, 17, 1.6, GR); b.box(M.trim, wx, ghy + 16, wz, 1.8, 0.4, 1.9, GR); }
    // service halls inside the ring
    const halls = [];
    const hall = (x, z, w, d, h, ry = 0) => halls.push({ x, z, w, d, h, ry });
    hall(82, 52, 18, 12, 9, 0.3); hall(150, 62, 16, 11, 8, 0.1); hall(92, 120, 14, 12, 8); hall(162, 78, 12, 12, 8); hall(70, 70, 10, 12, 8);
    for (const [x, z, h, rf] of [[150, 40, 40, 'cone'], [66, 40, 34, 'flat'], [158, 98, 36, 'flat'], [100, 112, 32, 'cone'], [140, 128, 28, 'flat']]) drum(x, H(x, z), z, 4.6, h, { seg: 12, roof: rf, merMat: M.redLo, roofH: 12, col: tint(rt, 0.1, 0.05), rcol: tint(rt, 0.12, 0.02) }); // Rhaenys's tower and neighbours (placeholder positions)
    // Traitor's Walk: stair + water gate at the hill foot on the Blackwater Rush
    const tw = [100, 154], twy = Math.max(H(tw[0], tw[1]), 1.2);
    b.box(M.redLo, tw[0], twy - 1, tw[1], 14, 11, 9, 0); arch(b, M.dark, tw[0], twy - 0.2, tw[1] + 4.5, 0, 4.2, 6, 0.3); b.box(M.trim, tw[0], twy + 11, tw[1], 15.2, 1, 10.2, 0);
    for (let i = 0; i < 12; i++) b.box(M.redLo, tw[0], twy - i * 0.2, tw[1] + 5 + i * 1.0, 5, 0.4, 1.2, 0); b.box(M.wood, tw[0], 0.15, tw[1] + 18, 7, 0.4, 7, 0);
    K.wall(b, [[tw[0], tw[1] - 6], [104, 130], [AEG[0] - 10, AEG[1] + 48]], { h: 9, t: 3, mat: M.red, capMat: M.redLo, heightAt, closed: false });

    // ---- Great Sept of Baelor on Visenya's Hill -----------------------------------------------------------------------------
    const sy = H(VIS[0], VIS[1]) + 2.0; // the Sept stands on a raised podium: the Plaza of Pride sits clear of the hilltop's undulations
    b.cyl(M.cobble, VIS[0], sy - 2.6, VIS[1], 41, 3.2, { seg: 32, color: 0xe4dccb }); b.cyl(M.marble, VIS[0], sy - 2, VIS[1], 29, 2.6, { seg: 28, top: 0.96 }); // Plaza of Pride + marble apron
    b.cyl(M.marble, VIS[0], sy, VIS[1], 15, 24, { top: 0.95, seg: 21 });
    b.cyl(M.trim, VIS[0], sy + 23, VIS[1], 15.6, 1.4, { seg: 21 }); b.cyl(M.gold, VIS[0], sy + 24.4, VIS[1], 14.2, 0.5, { seg: 21, top: 1.0 });
    b.dome(M.marble, VIS[0], sy + 24.8, VIS[1], 14.2, { seg: 21, sy: 0.72 });
    for (let k = 0; k < 14; k++) { const a = (k / 14) * TAU; arch(b, M.win, VIS[0] + Math.cos(a) * 14.2, sy + 8, VIS[1] + Math.sin(a) * 14.2, Math.PI / 2 - a, 1.7, 8, 0.15); }
    b.cyl(M.marble, VIS[0], sy + 24.8 + 9.5, VIS[1], 3.4, 2.5, { seg: 12 }); b.dome(M.gold, VIS[0], sy + 24.8 + 11.8, VIS[1], 3.4, { seg: 12, sy: 0.8 });
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * TAU + 0.3, x = VIS[0] + Math.cos(a) * 19, z = VIS[1] + Math.sin(a) * 19;
      b.cyl(M.marble, x, sy, z, 3.4, 36, { seg: 12, top: 0.8 });
      for (const t of [0.3, 0.62]) b.cyl(M.trim, x, sy + t * 36, z, 3.4 * (1 - 0.2 * t) * 1.05, 0.55, { seg: 12 });
      b.cyl(M.gold, x, sy + 35.5, z, 3.05, 0.6, { seg: 12 });
      gb.cone(M.crystal, x, sy + 36, z, 3.3, 15, { seg: 12, color: 0xbfe6ee }); b.sphere(M.gold, x, sy + 50.6, z, 0.5, { seg: 6 });
      b.box(M.win, x + Math.cos(a) * 3.0, sy + 24, z + Math.sin(a) * 3.0, 0.7, 2.6, 0.2, Math.PI / 2 - a);
    }
    for (let k = 0; k < 14; k++) { const a = (k / 14) * TAU + 0.1; let prev = null; for (let ph = 0; ph <= 80; ph += 20) { const f = ph * Math.PI / 180, rho = 14.4 * Math.cos(f), pt = [VIS[0] + Math.cos(a) * rho, sy + 24.8 + 10.4 * Math.sin(f) * 0.99, VIS[1] + Math.sin(a) * rho]; if (prev) strut(b, M.gold, prev, pt, 0.36, 0xffffff, 0.5); prev = pt; } }
    gb.cone(M.crystal, VIS[0], sy + 24.8 + 14.4, VIS[1], 3.6, 12, { seg: 10, color: 0xcdeff5 });
    b.box(M.marble, VIS[0], sy, VIS[1] + 22, 16, 14, 14, 0); b.prism(M.slate, VIS[0], sy + 14, VIS[1] + 22, 17.6, 5.5, 15.6, 0); b.box(M.trim, VIS[0], sy + 13, VIS[1] + 22, 16.6, 1, 14.6, 0);
    for (let i = 0; i < 6; i++) b.cyl(M.marble, VIS[0] - 6.5 + i * 2.6, sy, VIS[1] + 30, 0.7, 11, { seg: 8, top: 0.9 });
    for (let i = 0; i < 4; i++) b.box(M.marble, VIS[0], sy - 0.8 + i * 0.35, VIS[1] + 31.6 + (3 - i) * 0.9, 17 + (3 - i) * 1.6, 0.4, 1.0, 0);
    b.box(M.marble, VIS[0] - 22, sy, VIS[1] - 8, 14, 11, 12, 0.4); b.box(M.marble, VIS[0] + 22, sy, VIS[1] - 8, 14, 11, 12, -0.4); // sept annexes (Sept of Remembrance et al. unplaced)
    b.prism(M.slate, VIS[0] - 22, sy + 11, VIS[1] - 8, 15, 4.5, 13, 0.4); b.prism(M.slate, VIS[0] + 22, sy + 11, VIS[1] - 8, 15, 4.5, 13, -0.4);

    // ---- Dragonpit on Rhaenys's Hill (ruin) --------------------------------------------------------------------------------
    const dy = H(RHA[0], RHA[1]), rr = K.rng(77);
    b.cyl(M.basalt, RHA[0], dy - 2, RHA[1], 31.5, 3.4, { seg: 30, color: 0x8d8a82 });
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * TAU, x = RHA[0] + Math.cos(a) * 28, z = RHA[1] + Math.sin(a) * 28, broken = i >= 3 && i <= 8, hh = broken ? rr.range(5, 13) : rr.range(21, 24);
      b.box(M.basalt, x, dy - 1, z, 9.6, hh + 1, 6, Math.PI / 2 - a, jit(0xcfc9be, rr, 0.01, 0.04, 0.04));
      if (!broken) b.box(M.basalt, x, dy + hh, z, 10.2, 1.1, 6.8, Math.PI / 2 - a, 0xe0dbd0);
    }
    for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU + 0.2, x = RHA[0] + Math.cos(a) * 31.4, z = RHA[1] + Math.sin(a) * 31.4; if (a > 0.55 && a < 1.95) continue; arch(b, M.green, x, dy, z, Math.PI / 2 - a, 6, 9, 0.5); } // bronze doors gone green
    for (let k = 0; k < 7; k++) { // fragments of the lost dome: ribs springing from intact piers, snapped off at varied heights
      const a = (k / 7) * TAU + 0.2 + 0.2, top = dy + 23.5; if (a > 0.55 && a < 1.95) continue; const lim = k === 0 || k === 3 ? 62 : rr.range(26, 52);
      let prev = [RHA[0] + Math.cos(a) * 28, top, RHA[1] + Math.sin(a) * 28];
      for (let ph = 12; ph <= lim; ph += 12) { const f = ph * Math.PI / 180, rho = 28 * Math.cos(f) - 2, pt = [RHA[0] + Math.cos(a) * rho, top + 24 * Math.sin(f), RHA[1] + Math.sin(a) * rho]; strut(b, M.basalt, prev, pt, 1.7, 0xdad4c8, 2.2); prev = pt; }
    }
    { // the surviving sector of the fallen dome: a ragged shell still vaulting over the northern piers
      const top = dy + 23.5, th = [1.25, 0.95, 0.7, 0.52, 0.46, 0.58, 0.66, 0.9, 1.15, 1.32];
      for (let k = 0; k < th.length; k++) {
        const g = new THREE.SphereGeometry(28.6, 3, 7, 3.95 + k * 0.19, 0.2, th[k], Math.PI / 2 - th[k]);
        _m.compose(_p.set(RHA[0], top - 0.4, RHA[1]), _q.identity(), _s.set(1, 0.86, 1)); b.addGeometry(M.basaltIn, g, _m, jit(0xd2ccc0, rr, 0.01, 0.03, 0.05));
      }
      // blind arcade on the drum, two tiers, skipping the collapsed bay
      for (let i = 0; i < 28; i++) { if (i >= 3 && i <= 8) continue; const a = (i / 28) * TAU + Math.PI / 28, x = RHA[0] + Math.cos(a) * 31.05, z = RHA[1] + Math.sin(a) * 31.05;
        arch(b, M.dark, x, dy + 11.5, z, Math.PI / 2 - a, 2.6, 5.5, 0.2); arch(b, M.dark, x, dy + 17.6, z, Math.PI / 2 - a, 2.0, 3.6, 0.2); }
      // rubble of the fallen vault heaped inside and spilling through the breach
      for (let i = 0; i < 46; i++) { const a = i % 2 ? rr.range(0.5, 2.1) : rr.range(0, TAU), d = i % 2 ? rr.range(14, 34) : rr.range(3, 25), x = RHA[0] + Math.cos(a) * d, z = RHA[1] + Math.sin(a) * d, sz = rr.range(1.4, 4.2);
        b.box(M.basalt, x, dy + rr.range(-0.6, 0.6), z, sz * rr.range(1, 2.2), sz * rr.range(0.5, 1), sz, rr.range(0, 3), jit(0xcbc5b8, rr, 0.01, 0.04, 0.08), rr.range(-0.4, 0.4), rr.range(-0.4, 0.4)); }
    }
    b.cyl(T('stone', 0x2e2b2d, 8), RHA[0], dy + 0.3, RHA[1], 24, 0.5, { seg: 24 });
    b.sphere(T('rock', 0x56703c, 6), RHA[0] + 9, dy + 0.5, RHA[1] - 6, 6, { sy: 0.35 }); b.sphere(T('rock', 0x56703c, 6), RHA[0] - 11, dy + 0.5, RHA[1] + 8, 4.5, { sy: 0.3 });

    // ---- harbour: quay, piers, warehouses, cranes ----------------------------------------------------------------------------
    for (let z = 0; z <= 150; z += 25) K.pier(b, bayEdge(z) - 2, 0.7, z, { len: 36, w: 4.2, mat: M.wood, color: jit(0xd8d0c4, rt, 0.01, 0.05, 0.05) });
    for (let z = -38; z <= 168; z += 6) { // dressed-stone quay wall with a pale coping and bollards
      const ry = Math.atan(18 * 0.012 * Math.cos(z * 0.012)), x = bayEdge(z), ox = Math.cos(ry), oz = -Math.sin(ry);
      b.box(M.sandLo, x + 0.6 * ox, -4.5, z + 0.6 * oz, 8.6, 6.1, 6.3, ry, jit(0xd2c6b0, rt, 0.01, 0.04, 0.05));
      b.box(M.trim, x + 4.6 * ox, 1.55, z + 4.6 * oz, 1.2, 0.4, 6.3, ry, 0xe6dccb);
      if ((z + 38) % 12 === 0) b.cyl(M.iron, x + 4.2 * ox, 1.9, z + 4.2 * oz, 0.28, 0.8, { seg: 6 });
    }
    const lampPosts = [];
    for (let z = 0; z <= 150; z += 25) { lampPosts.push([bayEdge(z) + 33.5, 0.95, z + 1.9], [bayEdge(z) + 33.5, 0.95, z - 1.9]); }
    for (const z of [30, 80, 125]) { const x = bayEdge(z) - 6, y0 = 0.8; // quay cranes
      b.box(M.woodDk, x, y0, z, 1.4, 11, 1.4, 0); strut(b, M.woodDk, [x, y0 + 10.6, z], [x + 9, y0 + 13, z], 0.55); strut(b, M.woodDk, [x, y0 + 5, z], [x + 5, y0 + 11.6, z], 0.35); strut(b, M.iron, [x + 8.6, y0 + 12.9, z], [x + 8.6, y0 + 6.5, z], 0.1); b.box(M.woodDk, x + 8.2, y0 + 5.6, z - 0.5, 1.2, 1.0, 1.0, 0);
    }
    root.add(gb.build({ shadow: false }));

    // ---- city fabric -----------------------------------------------------------------------------------------------
    const dRoad = (x, z) => { let m = 1e9; for (const r of roadSm) { const d = K.distToPolyline(x, z, r).d; if (d < m) m = d; } return m; };
    const keepAvoid = (x, z) => Math.hypot(x - AEG[0], z - AEG[1]) < 64 || Math.hypot(x - VIS[0], z - VIS[1]) < 48 || Math.hypot(x - RHA[0], z - RHA[1]) < 40 || x > bayEdge(z) - 28 && z > -30 && z < 170
      || K.distToPolyline(x, z, WALL).d < 11 || H(x, z) < 1.9 || Math.abs(z - 166) < 12 && x > -30 && x < 140 || (x - 100) ** 2 + (z - 150) ** 2 < 24 * 24;
    const roadAngle = (x, z) => { let best = 1e9, ang = 0; for (const r of roadSm) { const o = K.distToPolyline(x, z, r); if (o.d < best) { best = o.d; const i = Math.min(r.length - 2, Math.floor(o.t)); ang = Math.atan2(-(r[i + 1][1] - r[i][1]), r[i + 1][0] - r[i][0]); } } return best < 60 ? ang : K.noise2(x * 0.05, z * 0.05) * 6.28; };

    const bb = b; // one batch for the whole city: one draw call per material
    const winG = new THREE.PlaneGeometry(0.9, 1.3); winG.translate(0, 0.65, 0);
    const wins = new Inst(winG, M.win), awn = new Inst(G.box(), flat(0xffffff, { rough: 1 }));
    const awnCols = [0xa8473a, 0xc89a40, 0x3f6e8e, 0xe6dcc4, 0x587a4a, 0x8a4a62];
    const stacks = [];
    const kinds = {
      rich: { size: [6, 9], h: [5.5, 9], walls: [M.plA, M.plA, M.plB, M.plC, M.plD], roofs: [M.tileA, M.tileA, M.tileB, M.tileC, M.slate], styles: ['gable', 'gable', 'tall', 'hip', 'tall', 'flat'], glow: 0.7, awn: 0.22 },
      mid: { size: [5, 8], h: [4.5, 7.5], walls: [M.plA, M.wood, M.plB, M.wood, M.plD], roofs: [M.tileB, M.tileB, M.slate, M.tileA, M.tileC], styles: ['gable', 'gable', 'tall', 'hip', 'tall'], glow: 0.6, awn: 0.08 },
      poor: { size: [3.6, 6], h: [3, 5.5], walls: [M.wood, M.woodDk, M.wood, M.plD], roofs: [M.thatch, M.thatch, M.tileB, M.thatch, M.tileC], styles: ['tall', 'gable', 'tall', 'gable'], glow: 0.3, awn: 0.1 },
      steel: { size: [6, 9], h: [5, 8], walls: [M.stoneB, M.stoneB, M.plD], roofs: [M.slate, M.slate, M.slateDk], styles: ['gable'], glow: 0.7, awn: 0 },
      keep: { size: [8, 12], h: [8, 9], walls: [M.red], roofs: [M.slate, M.slateDk], styles: ['gable'], glow: 0.8, awn: 0 },
      ware: { size: [12, 15], h: [5.5, 7], walls: [M.wood, M.woodDk, M.plB], roofs: [M.tileB, M.tileA, M.slate], styles: ['gable'], glow: 0.2, awn: 0 },
    };
    /** One building. Long axis along local X (ridge), faces road. Sits on its lowest corner, stone plinth hides the slope. */
    function building(x, z, kindName, r, opts = {}) {
      const K0 = kinds[kindName];
      let w = r.range(K0.size[0], K0.size[1]), d = r.range(K0.size[0], K0.size[1]) * r.range(0.85, 1.2); if (d > w) { const t = w; w = d; d = t; }
      if (opts.w) { w = opts.w; d = opts.d; }
      if (opts.check && dRoad(x, z) < 2.7 + d / 2) return null;
      const h = opts.h ?? r.range(K0.h[0], K0.h[1]), ry = opts.ry ?? 0, st = opts.style ?? r.pick(K0.styles), L = loc(x, z, ry);
      let y0 = 1e9, yb = -1e9; for (const [sx, sz] of [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const [px, pz] = L(sx * w / 2, sz * d / 2), hh0 = H(px, pz); y0 = Math.min(y0, hh0); yb = Math.max(yb, hh0); }
      const wm = r.pick(K0.walls), rm = r.pick(K0.roofs), wc = tint(r, 0.14, 0.06), rc = rm === M.slate || rm === M.slateDk ? tint(r, 0.18, 0.03) : tint(r, 0.22, 0.08);
      const drop = yb - y0; if (drop > 0.7 || kindName === 'rich' || kindName === 'keep' || kindName === 'ware') b_(bb, M.stoneB, x, y0 - 1.4, z, w + 0.25, drop + 2.4, d + 0.25, ry, tint(r, 0.2, 0.04));
      b_(bb, wm, x, y0 - 1.4, z, w, drop + h + 1.4, d, ry, wc);
      const rh = st === 'flat' ? 0 : (d / 2 + 0.45) * r.range(0.62, 0.9);
      if (st === 'gable' || st === 'tall') {
        if (st === 'tall') { b_(bb, M.woodDk, x, yb + h * 0.5, z, w + 0.5, 0.35, d + 0.5, ry); b_(bb, wm, x, yb + h * 0.5, z, w + 0.7, h * 0.5, d + 0.7, ry, wc); }
        bb.prism(rm, x, yb + h, z, w + 0.9, rh, d + 0.9, ry, rc); if (kindName === 'rich') b_(bb, M.woodDk, x, yb + h + rh - 0.12, z, w + 1.0, 0.3, 0.55, ry);
      } else if (st === 'hip') { bb.pyramid(rm, x, yb + h, z, w + 1.0, rh * 0.95, d + 1.0, ry, rc); }
      else { // flat terrace roof: parapet rim, rooftop awning
        b_(bb, wm, x, yb + h, z, w + 0.4, 0.7, d + 0.4, ry, wc);
        for (const sd of [-1, 1]) { const [px, pz] = L(0, sd * (d / 2 + 0.1)), [qx, qz] = L(sd * (w / 2 + 0.1), 0); b_(bb, wm, px, yb + h + 0.7, pz, w + 0.4, 0.55, 0.35, ry, wc); b_(bb, wm, qx, yb + h + 0.7, qz, 0.35, 0.55, d + 0.4, ry, wc); }
      }
      // storey line for richer houses, door, chimney, lit windows
      if (kindName === 'rich') b_(bb, M.trim, x, yb + h * 0.5 - 0.15, z, w + 0.25, 0.3, d + 0.25, ry, 0xe8dcc6);
      const [dx0, dz0] = L(w * r.range(-0.3, 0.3), d / 2 + 0.07); quad(bb, M.door, dx0, yb, dz0, ry, 1.1, 2.1);
      if (r() < (kindName === 'poor' ? 0.3 : 0.42) && st !== 'flat') { const [cx, cz] = L(w * (r() < 0.5 ? -0.28 : 0.28), d * 0.1), ch = rh + 1.3 + (st === 'hip' ? -rh * 0.5 : 0); b_(bb, M.stoneB, cx, yb + h * 0.6, cz, 0.95, h * 0.4 + ch, 0.95, ry, tint(r, 0.2, 0.05)); b_(bb, M.stoneB, cx, yb + h + ch, cz, 1.3, 0.25, 1.3, ry); stacks.push([cx, yb + h + ch + 1.2, cz]); }
      if (kindName === 'rich' && st !== 'flat' && r() < 0.07) { const [tx, tz] = L(w * 0.34, -d * 0.1); b_(bb, wm, tx, yb - 1, tz, 3.6, h + 4.4, 3.6, ry, wc); bb.pyramid(M.slate, tx, yb + h + 3.4, tz, 4.6, 3.8, 4.6, ry, tint(r, 0.15, 0.02)); }
      if (r() < K0.glow) { const hh = yb + h * 0.42; for (const sd of [-1, 1]) for (const fx of [-0.24, 0.24]) { if (r() < 0.45 && sd < 0) continue; const [px, pz] = L(w * fx, sd * (d / 2 + 0.09)); wins.add(px, hh, pz, 1, 1, 1, ry + (sd < 0 ? Math.PI : 0), new THREE.Color(1, r.range(0.78, 1), r.range(0.45, 0.8))); } }
      if (opts.noAwn !== true && r() < K0.awn && st !== 'flat') { const [px, pz] = L(w * 0.2, d / 2 + 0.9); awn.add(px, yb + 2.7, pz, Math.min(3.6, w * 0.42), 0.14, 1.8, ry, awnCols[r.int(0, awnCols.length - 1)]); }
      return { x, z, w, d, h, ry, y0 };
    }
    const b_ = (B, mat, x, y, z, w, h, d, ry, col) => B.box(mat, x, y, z, w, h, d, ry, col ?? 0xffffff);
    const steep = (x, z) => Math.hypot(H(x + 2.5, z) - H(x - 2.5, z), H(x, z + 2.5) - H(x, z - 2.5)) / 5 > 1.25;
    const fleaD = (x, z) => Math.hypot(x - FLEA[0], z - FLEA[1]);
    // main fabric: wealth falls off with distance from the keep / sept and with noise
    {
      const rg = K.rng(31);
      const pts = K.scatter({ rng: rg, count: q.dens(1400), bounds: [-295, -255, 245, 168], poly: cityPoly, minDist: 5.9, avoid: (x, z) => keepAvoid(x, z) || steep(x, z) || fleaD(x, z) < 48 || dRoad(x, z) < 2.8 });
      for (const [x, z] of pts) {
        const wealth = 1 - K.smoothstep(40, 200, Math.min(Math.hypot(x - AEG[0], z - AEG[1]) * 0.9, Math.hypot(x - VIS[0], z - VIS[1]))) + (K.fbm(x * 0.025, z * 0.025, 2, 7) - 0.5) * 0.9;
        const kind = x < 20 && z > 88 && K.distToPolyline(x, z, ROADS.steel).d < 17 ? 'steel' : wealth > 0.55 ? 'rich' : wealth > 0.12 ? 'mid' : 'poor';
        const ry = roadAngle(x, z) + (rg() - 0.5) * 0.12;
        building(x, z, kind, rg, { ry, check: true });
      }
    }
    // Flea Bottom: crowded timber and thatch
    {
      const rg = K.rng(32);
      const pts = K.scatter({ rng: rg, count: q.dens(300), bounds: [FLEA[0] - 50, FLEA[1] - 50, FLEA[0] + 50, FLEA[1] + 50], poly: cityPoly, minDist: 5.0, avoid: (x, z) => keepAvoid(x, z) || steep(x, z) || dRoad(x, z) < 2.6 || fleaD(x, z) > 50 });
      for (const [x, z] of pts) building(x, z, 'poor', rg, { ry: K.noise2(x * 0.2, z * 0.2) * 6, check: true });
    }
    // Red Keep service halls
    { const rg = K.rng(35); for (const p of halls) { const o = { w: p.w, d: p.d, h: p.h, ry: p.ry, style: 'gable', noAwn: true }; building(p.x, p.z, 'keep', rg, o); } }
    // warehouses on the quay
    { const rg = K.rng(36); for (let z = 4; z <= 140; z += 17) { const x = bayEdge(z) - 16; if (H(x, z) > 0.4) building(x, z, 'ware', rg, { ry: Math.PI / 2, w: 13, d: 8, h: 6.5, style: 'gable' }); } }
    root.add(bb.build({}));

    // street lanterns (glow at night) + pier lamps
    const lan = new Inst(G.box(), M.lamp), lanPost = new Inst(G.cyl(5, 1), M.woodDk);
    for (const sp of roadSm) for (let i = 0; i < sp.length; i += 4) { const [x, z] = sp[i], o = (i % 2 ? 1 : -1) * 4.4; if (H(x + o, z) < 1.2 || keepAvoid(x + o, z) && Math.hypot(x - AEG[0], z - AEG[1]) < 58) continue; lanPost.add(x + o, H(x + o, z), z, 0.15, 3.2, 0.15); lan.add(x + o, H(x + o, z) + 3.2, z, 0.5, 0.7, 0.5); }
    const tab = new Inst(G.box(), M.wood);
    { // market stalls along the mud, harbour and steel roads: striped canvas on two posts
      const rg = K.rng(37), picks = [[roadSm[6], 12], [roadSm[7], 14], [roadSm[0], 6], [roadSm[2], 6]];
      for (const [sp, n] of picks) for (let i = 0; i < n; i++) {
        const k = rg.int(2, sp.length - 3), a = sp[k], bq = sp[k + 1], ang = Math.atan2(-(bq[1] - a[1]), bq[0] - a[0]), side = rg() < 0.5 ? -1 : 1, off = 4.6 * side;
        const x = a[0] - Math.sin(-ang) * 0 + Math.sin(ang) * off, z = a[1] + Math.cos(ang) * off, y = H(x, z);
        if (y < 1.5 || keepAvoid(x, z)) continue;
        awn.add(x, y + 2.4, z, 3.0, 0.14, 2.2, ang, awnCols[rg.int(0, awnCols.length - 1)]);
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) lanPost.add(x + Math.cos(ang) * sx * 1.3 + Math.sin(ang) * sz * 0.95, y, z - Math.sin(ang) * sx * 1.3 + Math.cos(ang) * sz * 0.95, 0.09, 2.4, 0.09);
        tab.add(x, y, z, 2.2, 0.9, 0.9, ang);
      }
    }
    for (const [x, y, z] of lampPosts) { lanPost.add(x, y, z, 0.15, 2.6, 0.15); lan.add(x, y + 2.6, z, 0.5, 0.6, 0.5); }

    // ---- trees: Kingswood hint south of the Rush, orchards, cypress in the north ------------------------------------------------
    const TR = { trunk: new Inst(G.cyl(5, 0.7), T('wood', 0xffffff, 3)), A: new Inst(G.sphere(6), T('grass', 0xffffff, 3, { rough: 1 })), B: new Inst(G.sphere(6), T('grass', 0xffffff, 3, { rough: 1 })), cone: new Inst(G.cone(6), T('grass', 0xffffff, 3, { rough: 1 })) };
    const trees = ({ rng, count, bounds, poly, minDist = 5, avoid, kind = 'oak', scale = [0.9, 1.4], greens }) => {
      const pts = K.scatter({ rng, count, bounds, poly, minDist, avoid });
      for (const [x, z] of pts) {
        const k = rng.range(scale[0], scale[1]), y = H(x, z), gc = jit(rng.pick(greens), rng, 0.02, 0.08, 0.04);
        if (kind === 'cypress') { TR.trunk.add(x, y, z, 0.35 * k, 2 * k, 0.35 * k, 0, 0x5d4733); TR.cone.add(x, y + 1.4 * k, z, 1.5 * k, 8.5 * k, 1.5 * k, rng() * 6, gc); }
        else {
          TR.trunk.add(x, y, z, 0.5 * k, 3.4 * k, 0.5 * k, 0, jit(0x6a523a, rng, 0.01, 0.05, 0.04));
          TR.A.add(x, y + 2.6 * k, z, 2.7 * k, 2.4 * k, 2.7 * k, rng() * 6, gc);
          if (rng() < 0.25) TR.B.add(x + rng.range(-1.2, 1.2) * k, y + 3.9 * k, z + rng.range(-1.2, 1.2) * k, 1.8 * k, 1.7 * k, 1.8 * k, 0, jit(rng.pick(greens), rng, 0.02, 0.08, 0.06));
        }
      }
    };
    const oaks = [0x56803a, 0x658f3f, 0x4b7536, 0x7a9a40], cyps = [0x2f4f3a, 0x3a5a40, 0x35553b];
    trees({ rng: K.rng(61), count: q.dens(380), bounds: [-420, 258, 360, 600], minDist: 4.2, scale: [0.9, 1.7], greens: [0x4a6e34, 0x557a38, 0x3f6430, 0x66843c, 0x5b7436], avoid: (x, z) => H(x, z) < 2.2 || K.fbm(x * 0.012, z * 0.012, 2, 23) < 0.47 - 0.25 * K.smoothstep(380, 520, z) });
    trees({ rng: K.rng(62), count: q.dens(60), bounds: [-420, -520, 260, -280], kind: 'cypress', minDist: 3.5, greens: cyps, avoid: (x, z) => H(x, z) < 2 || Math.hypot(x - RHA[0], z - RHA[1]) < 60 || K.fbm(x * 0.02, z * 0.02, 2, 29) < 0.55 });
    trees({ rng: K.rng(63), count: q.dens(70), bounds: [-380, -250, -300, 150], greens: oaks, avoid: (x, z) => H(x, z) < 2 || x > -310 });
    trees({ rng: K.rng(64), count: q.dens(40), bounds: [-75, 60, -10, 160], greens: oaks, minDist: 7, avoid: (x, z) => keepAvoid(x, z) || dRoad(x, z) < 6 });
    trees({ rng: K.rng(65), count: q.dens(60), bounds: [-300, -420, 260, -270], greens: oaks, minDist: 4.5, avoid: (x, z) => H(x, z) < 2 || K.fbm(x * 0.01, z * 0.01, 2, 21) < 0.56 }); // northern groves
    trees({ rng: K.rng(66), count: q.dens(70), bounds: [AEG[0] - 100, AEG[1] - 90, AEG[0] + 100, AEG[1] + 100], kind: 'cypress', minDist: 4, scale: [0.8, 1.2], greens: cyps,
      avoid: (x, z) => { const d = Math.hypot(x - AEG[0], z - AEG[1]); return d < 62 || d > 104 || !steep(x, z) || H(x, z) < 3 || keepAvoid(x, z) && d > 70; } });
    for (const i of Object.values(TR)) if (i.items.length) root.add(i.build());

    // ---- ships & boats ---------------------------------------------------------------------------------------------
    const hullCols = [0x6a4a30, 0x4e3a2a, 0x74502f, 0x3e3026, 0x5a5a62, 0x6e3e30], sailCols = [0xece2cb, 0xdccaa0, 0xb84a38, 0xe9ddb8, 0xcfa43e, 0xe6e0d2];
    const sailMat = (hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 1, side: THREE.DoubleSide });
    function makeShip(type, len, hullHex, sailHex, seed) {
      const g = new THREE.Group(), sb = new Batch(), r = K.rng(seed), beamH = len * (type === 'barge' ? 0.13 : 0.15), Dp = len * 0.09;
      const N = 10, J = 6, pos = [], idx = [], rowN = 2 * J + 1;
      for (let i = 0; i <= N; i++) {
        const u = i / N, e = Math.abs(2 * u - 1), bf = Math.pow(Math.sin(Math.PI * (0.05 + 0.9 * u)), 0.5) * (1 - K.smoothstep(0.62, 1, u) * 0.92), x = (u - 0.5) * len;
        const keel = -Dp * 0.35 + Dp * 0.25 * e * e, top = Dp * 0.62 + len * 0.045 * e * e * (type === 'barge' ? 0.3 : 1);
        for (let j = 0; j < rowN; j++) { const f = ((j / (rowN - 1)) * 2 - 1) * Math.PI / 2; pos.push(x, keel + (top - keel) * (1 - Math.cos(f)), beamH * bf * Math.sin(f)); }
      }
      for (let i = 0; i < N; i++) for (let j = 0; j < rowN - 1; j++) { const a = i * rowN + j, bI = a + 1, cI = a + rowN, dI = cI + 1; idx.push(a, cI, bI, bI, cI, dI); }
      const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setIndex(idx); hg.computeVertexNormals();
      sb.addGeometry(M.hullW, hg, new THREE.Matrix4(), hullHex);
      const top0 = Dp * 0.62;
      sb.box(M.hullW, -len * 0.5, -Dp * 0.1, 0, 0.5, top0 + Dp * 0.1 + len * 0.045, beamH * 0.8, 0, hullHex);          // transom
      sb.box(M.hullW, 0, top0 - 0.55, 0, len * 0.72, 0.18, beamH * 1.5, 0, 0xe6cda4);
      if (type !== 'barge') { sb.box(M.hullW, -len * 0.36, top0 - 0.5, 0, len * 0.22, 1.9, beamH * 1.5, 0, hullHex); sb.box(M.hullW, -len * 0.36, top0 + 1.4, 0, len * 0.25, 0.25, beamH * 1.7, 0, 0x6a5240); sb.box(M.hullW, len * 0.4, top0 - 0.5, 0, len * 0.1, 1.0, beamH * 0.9, 0, hullHex); }
      const sails = [], masts = type === 'galley' ? 2 : 1;
      for (let m = 0; m < masts; m++) {
        const mx = masts === 1 ? len * 0.04 : (m ? -len * 0.2 : len * 0.2), mh = len * (type === 'barge' ? 0.62 : 0.82);
        sb.cyl(M.hullW, mx, top0 - 0.5, 0, 0.2 + len * 0.004, mh, { seg: 6, top: 0.7, color: 0x6a5240 });
        const yw = top0 + mh * 0.8, sw = beamH * (type === 'galley' ? 2.3 : 2.9), sh = mh * 0.55;
        sb.box(M.hullW, mx, yw, 0, 0.18, 0.18, sw * 1.12, 0, 0x6a5240);
        const sg = new THREE.PlaneGeometry(sw, sh, 6, 4), sm = new THREE.Mesh(sg, sailMat(m === 0 ? sailHex : sailCols[(seed + 2) % 6]));
        sm.position.set(mx + 0.15, yw - sh / 2, 0); sm.rotation.y = Math.PI / 2; sm.castShadow = true; sm.userData.base = Float32Array.from(sg.attributes.position.array); sm.userData.hw = sw / 2; sm.userData.hh = sh / 2; sm.userData.ph = r() * 6;
        sails.push(sm); g.add(sm);
        strut(sb, M.hullW, [mx, top0 + mh * 0.97, 0], [len * 0.47, top0 + 0.6, 0], 0.07, 0x4a3a2e); strut(sb, M.hullW, [mx, top0 + mh * 0.97, 0], [-len * 0.48, top0 + 1.6, 0], 0.07, 0x4a3a2e);
      }
      if (type === 'galley') for (let i = 0; i < 7; i++) for (const sd of [-1, 1]) { const x = (i - 3) * len * 0.09; strut(sb, M.hullW, [x, top0 + 0.1, sd * beamH * 0.95], [x - 0.4, -0.5, sd * (beamH + len * 0.2)], 0.1, 0xd8c8a8); }
      g.add(sb.build()); g.userData.sails = []; g.userData.sl = sails; return g;
    }
    function animSails(s, t, ph) {
      s.rotation.z = Math.sin(t * 0.9 + ph) * 0.025; s.rotation.x = Math.sin(t * 0.7 + ph * 1.3) * 0.02;
      for (const sm of s.userData.sl) {
        const pos = sm.geometry.attributes.position, bs = sm.userData.base, hw = sm.userData.hw, hh = sm.userData.hh, p2 = sm.userData.ph + ph;
        for (let i = 0; i < pos.count; i++) { const nx = bs[i * 3] / hw, ny = bs[i * 3 + 1] / hh; pos.setZ(i, (1 - nx * nx) * (0.55 + 0.45 * (ny * 0.5 + 0.5)) * hw * 0.32 * (0.8 + 0.2 * Math.sin(t * 1.3 + p2 + ny * 1.4))); }
        pos.needsUpdate = true;
      }
    }
    const ships = [];
    const addShip = (type, len, hi, si, x, z, ry, mover) => { const s = makeShip(type, len, hullCols[hi % hullCols.length], sailCols[si % sailCols.length], ships.length + 3); s.position.set(x, 0.25, z); s.rotation.y = ry; root.add(s); ships.push({ s, mover, ph: ships.length * 1.7 }); };
    [[290, 20, 0.2], [305, 60, -0.1], [292, 100, 0.15], [310, 135, 0], [330, -20, 0.3], [300, -50, -0.2]].forEach(([x, z, r], i) => addShip(i % 3 === 1 ? 'galley' : 'cog', 30 + (i % 3) * 5, i, i, x, z, r, null));
    [[25, 12.5], [75, 12.5], [125, 12.5]].forEach(([z, o], i) => addShip(i === 1 ? 'galley' : 'cog', 22, i + 2, i + 3, bayEdge(z) + 17, z + o, 0, null));
    [[0, 420, 40, 90, 0.01], [1, 520, -100, 140, -0.012], [2, 380, 200, 70, 0.008]].forEach(([i, cx, cz, R, sp]) => addShip(i === 1 ? 'galley' : 'cog', 32, i, i + 1, cx + R, cz, 0, { cx, cz, R, sp, a0: i * 2 }));
    for (let i = 0; i < 3; i++) addShip('barge', 14, i + 3, i + 5, -80 + i * 60, riverZ(-80 + i * 60) + (i % 2 ? 6 : -6), 0, { river: true, i });
    ctx.onUpdate((dt, t) => {
      for (const o of ships) {
        const m = o.mover;
        if (m && m.R) { const a = m.a0 + t * m.sp * 2; o.s.position.set(m.cx + Math.cos(a) * m.R, 0.25, m.cz + Math.sin(a) * m.R); o.s.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)) + (m.sp < 0 ? Math.PI : 0); }
        else if (m && m.river) { const u = ((t * 0.03 + m.i * 0.33) % 1), x = -150 + u * 380; o.s.position.set(x, 0.2, riverZ(x) + (m.i % 2 ? 7 : -7)); o.s.rotation.y = 0; }
        animSails(o.s, t, o.ph);
      }
    });

    // ---- life: smoke, fires, banners, folk, gulls ----------------------------------------------------------------------------------
    root.add(K.smoke(stacks.filter((_, i) => i % 4 === 0), { size: 20, rise: 18, opacity: 0.26, perStack: 4, color: 0xc4bdb2 }));
    const forges = stacks.filter(([x, , z]) => K.distToPolyline(x, z, ROADS.steel).d < 18 && x < 20);
    root.add(K.smoke(forges, { size: 24, rise: 22, opacity: 0.4, color: 0x59554f, perStack: 5 }));
    root.add(K.smoke([[132, 40, 104], [92, 18, 126], [160, 20, 62]], { size: 26, rise: 20, opacity: 0.3, color: 0xcfc9c0 }));
    const fireSpots = [[tw[0] - 5, twy + 1.5, tw[1] + 6], [AEG[0] - 58, H(AEG[0] - 58, AEG[1] + 4) + 4, AEG[1] + 4], [VIS[0] + 20, sy + 2, VIS[1] + 38], [HF[0] - 8, hy + 1.5, HF[1] + 19], [MUD[0] - 6, 4, MUD[1]], ...torches];
    const fire = K.fires(fireSpots, { size: 6, light: q.low ? 0 : 3, intensity: 55 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const bn = [[AEG[0] - 56, 28, AEG[1]], [HF[0] - 18, hy + 38, HF[1] - 18], [HF[0] + 18, hy + 38, HF[1] - 18], [th[0], H(th[0], th[1]) + 72, th[1]], [gh[0], ghy + 33, gh[1]], [150, H(150, 40) + 52, 40], [MUD[0], 24, MUD[1] - 4], ...Object.values(GATES).map(([x, z]) => [x, H(x, z) + 30, z])];
    root.add(K.banners(bn.map(([x, y, z], i) => ({ x, y, z, w: 3, h: 7, color: i % 3 === 2 ? 0x8a2a28 : 0xd9ad2c, ry: i })), { pole: false }));
    for (const [x, y, z] of bn) lanPost.add(x, y - 7.2, z, 0.2, 8.4, 0.2);
    const wk = K.walkers({ paths: [K.smoothPath(ROADS.steel, 4), K.smoothPath(ROADS.dragon, 4), K.smoothPath(ROADS.mud, 3), K.smoothPath(ROADS.harbor, 4), K.smoothPath(ROADS.sisters, 4), K.smoothPath(ROADS.lion, 3)], heightAt, count: q.dens(90), rng: K.rng(5) });
    root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    for (const [cx, cy, cz, R, n, s] of [[240, 40, 60, 120, 14, 3], [110, 70, 70, 80, 6, 4], [-135, 70, 45, 60, 5, 5]]) { const g = K.birds({ center: [cx, cy, cz], radius: R, count: q.dens(n), color: 0xf4f4f0, size: 1.3, spreadY: 14, seed: s }); root.add(g); ctx.onUpdate((dt, t) => g.userData.update(t)); }
    const cl = K.clouds({ y: 280, extent: 800, count: 5, opacity: 0.32, color: 0xfff6ea }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    root.add(lan.build(), lanPost.build(), wins.build(), awn.build(), tab.build());

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 330, center: [20, 10, 20], minDistance: 20,
      hero: { pos: [80, 172, 470], target: [-10, 10, -20] },
      climate: {
        atmos: 'day', weather: 'clear',
        tint: {
          dawn: { top: 0x536a9e, horizon: 0xf0bd9a, fog: 0xd8b09a, fogD: 0.001, sunC: 0xffc08a, hemiSky: 0xa8b2d8, hemiGround: 0x6a5446 },
          day: { top: 0x3a76c0, horizon: 0xd2dce0, fog: 0xccd2c8, fogD: 0.00055, sunC: 0xffe2b0, sunI: 3.5, elev: 0.48, az: -0.2, hemiSky: 0xb4cce6, hemiGround: 0x8a7350, hemiI: 0.9 },
          dusk: { top: 0x24356e, horizon: 0xf09a5c, fog: 0xa86e62, fogD: 0.0009, sunC: 0xff9a52, sunI: 3.2, elev: 0.1, az: 3.6, hemiSky: 0x7c80b8, hemiGround: 0x4a3832, hemiI: 0.72 },
          night: { top: 0x0a1236, horizon: 0x2f4472, fog: 0x24365c, fogD: 0.0017, sunC: 0xb0c4f4, sunI: 1.7, hemiSky: 0x7488c4, hemiGround: 0x343a50, hemiI: 1.2 },
        },
      },
      landmarks: {
        'red-keep': lm(AEG[0] + 22, AEG[1] + 8, 40, 32), 'maegors-holdfast': lm(HF[0], HF[1], 22, 60), 'hands-tower': lm(th[0], th[1], 9, 72),
        'iron-throne-hall': lm(gh[0], gh[1], 22, 34), 'traitors-walk': lm(tw[0], tw[1], 10, 16), 'great-sept-of-baelor': lm(VIS[0], VIS[1], 30, 58),
        'dragonpit': lm(RHA[0], RHA[1], 34, 26), 'flea-bottom': lm(FLEA[0], FLEA[1], 40, 10), 'street-of-steel': lm(-100, 112, 24, 9),
        'street-of-sisters': lm(-100, -100, 24, 9), 'harbor': lm(268, 70, 50, 14), 'blackwater-rush': lm(40, 215, 36, 6),
        'city-walls-and-gates': lm(GATES.dragon[0], GATES.dragon[1], 28, 40), 'mud-gate': lm(MUD[0], MUD[1] - 4, 14, 26),
      },
      cutaways: [{ id: 'iron-throne-hall', name: { en: 'Iron Throne hall (cutaway)', zh: '铁王座大厅（剖面）' }, build: buildThroneHall }],
    };
  },
};

function buildThroneHall(ctx) {
  // Long red-stone nave, open on the +Z side (cutaway). Tall windows on the back wall throw shafts of light across a dark floor;
  // the Iron Throne sits high on a steep stair at the east (+X) end so the whole hall has to look up at it.
  const g = ctx.root, b = new Batch(), W = 70, D = 30, Hh = 28;
  const T = (k, color, scale = 6, o = {}) => tri(k, { color, scale, snow: false, ...o });
  const stone = T('stone', 0x9a7064, 3.2, { emissive: 0x1c100c, bump: 0.4 }), pale = T('stone', 0xcbb6a0, 2.6, { emissive: 0x1a140f, bump: 0.35 }), dais = T('stone', 0x7d6c68, 2.6, { emissive: 0x1a1414, bump: 0.4 });
  const floor = T('marble', 0x4f474c, 4, { rough: 0.45, emissive: 0x141012 }), floorLt = T('marble', 0x8c8078, 4, { rough: 0.5 }), wood = T('wood', 0x3e2c1e, 3);
  const steel = flat(0x3c3e44, { metal: 0.6, rough: 0.42 }), steelHi = flat(0x8a8d94, { metal: 0.7, rough: 0.3 }), cloth = flat(0xffffff, { rough: 1 }), wg = glow(0xffd8a0, 0.45);
  const shaft = K.M.basic(0xffe6c0, { transparent: true, opacity: 0.04, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  b.box(flat(0x0e0b0a, { rough: 1 }), 0, -0.7, 0, 300, 0.2, 300); b.box(flat(0x0b0908, { rough: 1, side: THREE.BackSide }), 0, -1, 0, 260, 120, 260); // dark set enclosure: no void around the cut
  b.box(floor, 0, -0.5, 0, W + 10, 0.5, D + 6); b.box(floorLt, -4, 0.01, 0, W - 16, 0.05, 6.4);
  b.box(stone, 0, 0, -D / 2, W, Hh, 1.4); b.box(stone, -W / 2, 0, 0, 1.4, Hh, D); b.box(stone, W / 2, 0, 0, 1.4, Hh, D);
  b.box(pale, 0, 0, -D / 2 + 0.75, W, 1.2, 0.4); b.box(pale, 0, 14.5, -D / 2 + 0.75, W, 0.6, 0.5); // plinth + string course
  // back wall: tall narrow windows in deep reveals, each throwing a slanted shaft of light into the nave
  for (let i = -5; i <= 5; i++) {
    const x = i * 6;
    b.box(pale, x, 6.6, -D / 2 + 0.75, 2.6, 0.5, 0.6); b.box(pale, x, 21.4, -D / 2 + 0.75, 2.6, 1.2, 0.6);
    b.box(wg, x, 7.1, -D / 2 + 0.72, 1.5, 14.3, 0.12);
    if (i % 2 === 0) b.box(shaft, x + 3.5, -0.4, -D / 2 + 9, 1.6, 30, 0.6, 0, 0xffffff, -0.75, 0.22);
  }
  // nave arcade: paired pale columns carrying a clerestory beam; dark timber ceiling
  for (let i = -5; i <= 5; i++) for (const s of [-1]) {
    const x = i * 6;
    b.box(pale, x, 0, s * 9.5, 2.8, 1.0, 2.8); b.cyl(pale, x, 1.0, s * 9.5, 1.0, Hh - 5, { top: 0.88, seg: 12 }); b.box(pale, x, Hh - 4.2, s * 9.5, 2.6, 1.2, 2.6);
  }
  b.box(stone, 0, Hh - 3.0, -9.5, W - 4, 1.8, 2.0);
  for (let i = -5; i <= 5; i++) { b.box(wood, i * 6, Hh - 1.2, 0, 0.9, 1.2, D); b.box(wood, i * 6 + 3, Hh - 0.6, 0, 0.5, 0.6, D); }
  b.box(wood, 0, Hh, 0, W, 0.4, D);
  // dais and steep stair
  const X0 = W / 2 - 8;
  for (let i = 0; i < 14; i++) b.box(dais, X0 - 10 + i * 0.85, 0, 0, 1.3, 0.55 + i * 0.5, 9 - i * 0.2);
  b.box(dais, X0 + 3, 0, 0, 8, 7.4, 11); b.box(pale, X0 + 3, 7.2, 0, 8.4, 0.35, 11.4);
  // the Iron Throne: a seat in a bristling, lopsided fan of blades
  const tx = X0 + 2.2, ty = 7.55, r = K.rng(13);
  b.box(steel, tx, ty, 0, 4.2, 1.8, 5.4); b.box(steelHi, tx - 0.2, ty + 1.8, 0, 3.4, 0.25, 3.6); b.box(steel, tx + 1.7, ty + 1.8, 0, 0.8, 5.2, 3.2);
  for (const s of [-1, 1]) b.box(steel, tx - 0.3, ty + 1.8, s * 2.3, 3.4, 1.6, 0.6);
  for (let i = 0; i < 150; i++) {
    const back = i < 105, th = back ? r.range(-1.25, 1.25) : r.range(-1.5, 1.5), len = back ? r.range(4, 12) * (1.15 - Math.abs(th) * 0.45) : r.range(2, 5);
    const bx = back ? tx + 1.4 + r.range(0, 1.6) : tx + r.range(-1.6, 1.2), by = back ? ty + r.range(1.2, 6.5) : ty + r.range(0.2, 2.6), bz = back ? r.range(-2.2, 2.2) : r.range(-2.8, 2.8);
    b.box(i % 6 ? steel : steelHi, bx, by, bz, 0.12 + r() * 0.1, len, 0.34, r.range(-0.3, 0.3), 0xffffff, th, back ? -r.range(0.05, 0.4) : r.range(-1.3, 1.3));
  }
  // the long carpet, banners of the royal house between the windows and on the arcade
  b.box(cloth, -6, 0.07, 0, W - 22, 0.06, 3.2, 0, 0x6e1616);
  const items = []; for (let i = -4; i <= 4; i++) items.push({ x: i * 6 + 3, y: 23.5, z: -D / 2 + 1.4, w: 2.6, h: 9, color: i % 2 ? 0x1b1414 : 0xc49a2c, ry: 0 });
  for (let i = -3; i <= 3; i++) items.push({ x: i * 6 + 3, y: 21, z: -11.2, w: 2, h: 6.5, color: 0x7c1a1a, ry: Math.PI / 2 });
  g.add(b.build({})); g.add(K.banners(items, { pole: false }));
  const fire = K.fires([[-24, 2.4, -6], [-24, 2.4, 6], [0, 2.4, -6], [0, 2.4, 6], [tx - 11, 2.4, -6], [tx - 11, 2.4, 6]], { size: 8, light: 3, intensity: 70 }); g.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
  for (const [x, y, z, col, I, dd] of [[-6, 20, -8, 0xffe8c8, 190, 70], [tx - 6, 16, 4, 0xffb070, 220, 40], [-30, 14, 6, 0xffd9a0, 120, 50], [tx + 1, 22, 0, 0xffd2a0, 45, 26]]) { const l = new THREE.PointLight(col, I, dd, 1.6); l.position.set(x, y, z); g.add(l); }
  return { center: [4, 8, 0], hero: { pos: [-30, 9, 21], target: [18, 9.5, -4] }, minDistance: 8, maxDistance: 90 };
}
