// Lorath — sparse. TWOIAF/wiki: an island city in the northern sea off Essos, on the largest of three islands; reclusive. Almost nothing else is established.
// The grey stone, lagoon, mist and every building are interpretation.
// Polish pass: silver-grey stone town on terraced rings round a lagoon, quay wall with lanterns, slender towers with lantern crowns, a quiet cloister on the
// high ground, reeds, dark pines emerging from drifting mist, receding hazy islets, pale cold grade with warm lantern accents. Budget ~150k tris.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const _hsl = {};
function jit(hex, r, dh = 0.012, ds = 0.07, dl = 0.05) {
  const c = new THREE.Color(hex); c.getHSL(_hsl);
  return c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, K.clamp(_hsl.s + r.range(-ds, ds), 0, 1), K.clamp(_hsl.l + r.range(-dl, dl), 0, 1));
}
const shade = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const dummyMat = flat(0xffffff);
const grey = (v) => new THREE.Color(v, v, v);
const proto = (fn) => { const bb = new Batch(); fn(bb); return bb.build({}).children[0].geometry; };
const openCone = (seg) => { const c = new THREE.ConeGeometry(1, 1, seg, 1, true); c.translate(0, 0.5, 0); return c; };
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
function tilted(b, mat, geom, x, y, z, sx, sy, sz, rx, ry, rz, color) { _e.set(rx, ry, rz); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); b.addGeometry(mat, geom, _m, color); }

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(61);
    const isl = [[0, 0, 150, 1], [230, -80, 55, 0.7], [-60, -240, 70, 0.8]]; // x,z,radius,height scale; first is the main island
    const LC = [-40, 20], LA = 70, LB = 48, HX = 42, HZ = -10, PLAT = 6.2;
    const lagoonDist = (x, z) => Math.hypot((x - LC[0]) / LA, (z - LC[1]) / LB);
    const heightAt = (x, z) => {
      let h = -8;
      for (const [ix, iz, ir, k] of isl) {
        const d = Math.hypot(x - ix, z - iz) + (K.fbm(x * 0.02, z * 0.02, 3, 11) - 0.5) * 36;
        h = Math.max(h, K.lerp(-8, 1.4 + 10 * k * (K.fbm(x * 0.012, z * 0.012, 3, 6) + 0.1), 1 - K.smoothstep(ir * 0.55, ir, d)));
      }
      h = K.lerp(h, -4, 1 - K.smoothstep(0.7, 1.05, lagoonDist(x, z)));                                                      // lagoon
      h = K.lerp(h, -4, (1 - K.smoothstep(9, 22, Math.abs(z - 20))) * K.smoothstep(-30, -58, x) * 0.95);                      // channel to the western sea
      if (h > 0) h = K.lerp(h, PLAT, 1 - K.smoothstep(24, 46, Math.hypot(x - HX, z - HZ)));                                    // monastery terrace
      return h;
    };
    const H = heightAt;

    // ---- terrain: cold grey rock, wet kelp-dark shore, moss and heather, flagged ground in town
    const rock = new THREE.Color(0x7a8084), moss = new THREE.Color(0x56694f), heath = new THREE.Color(0x86697a), wet = new THREE.Color(0x44545a), flag = new THREE.Color(0xaaaeb0), c = new THREE.Color();
    root.add(K.terrain({ size: 780, seg: q.seg(150), heightAt, kind: 'rock', scale: 14, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.03, z * 0.03, 3, 5), n2 = K.fbm(x * 0.1, z * 0.1, 2, 17);
      c.copy(moss).lerp(heath, K.clamp(n * 1.5 - 0.4, 0, 0.7)).multiplyScalar(0.85 + 0.3 * n2).lerp(rock, K.clamp(s * 2.6 + (h < 1.8 ? 0.35 : 0), 0, 0.85));
      if (h < 1.2) c.lerp(wet, K.smoothstep(1.2, -1.5, h) * 0.9);
      c.lerp(flag, 0.55 * (1 - K.smoothstep(1.2, 1.6, lagoonDist(x, z))) * K.smoothstep(0.9, 1.05, lagoonDist(x, z)) + 0.8 * (1 - K.smoothstep(22, 28, Math.hypot(x - HX, z - HZ))));
      return c; } }));
    const wat = K.water({ w: 900, d: 900, seg: q.seg(140), level: 0, heightAt, deep: 0x1c3646, shallow: 0x6a98a0, opacity: 0.93, choppy: 0.6, speed: 0.5 });
    const farSea = K.waterPatch({ w: 4600, d: 4600, level: -0.3, deep: 0x1c3646, shallow: 0x1c3646, opacity: 1, choppy: 0.6, speed: 0.5, depth: 6 });
    root.add(wat, farSea); ctx.registerWater(wat); ctx.registerWater(farSea);

    // ---- materials
    const stone = tri('stone', { color: 0xffffff, scale: 7, snow: false, bump: 0.85 }), plaster = tri('plaster', { color: 0xffffff, scale: 6, snow: false, bump: 0.6 }), slate = tri('slate', { color: 0xffffff, scale: 4, snow: false, rough: 0.62, bump: 0.8 });
    const wood = tri('wood', { color: 0xffffff, scale: 4, snow: false }), cobble = tri('cobble', { color: 0xffffff, scale: 6, snow: false }), soft = flat(0xffffff, { rough: 1, flatShading: false }), dark = flat(0x07080a);
    const win = glow(0xffc880), lan = glow(0xffb060, 1.5);
    const b = new Batch();
    const GREY = 0xb4b8b8, GREY_D = 0x80868a, WALLS = [0xc6c8c2, 0xb8bdbe, 0xd0cdc2, 0xaab0b4, 0xbfc4c0], ROOFS = [0x5a6878, 0x6a7686, 0x4e5c6c, 0x5e7468, 0x7a5c52, 0x6a6474];

    // ---- lagoon quay wall: follow the shoreline, lanterns on posts, mooring steps
    const shore = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2; let pt = null;
      for (let r = 1.5; r > 0.7; r -= 0.01) { const x = LC[0] + Math.cos(a) * LA * r, z = LC[1] + Math.sin(a) * LB * r; if (H(x, z) < 0.45) { pt = [x, z]; break; } }
      if (pt && !(pt[0] < -52 && Math.abs(pt[1] - 20) < 30)) shore.push(pt); else shore.push(null);
    }
    { let chain = []; const flush = () => { if (chain.length > 2) K.wall(b, chain, { h: 1.6, t: 2.2, crenel: false, mat: stone, heightAt: H, sink: 3, color: GREY }); chain = []; };
      shore.forEach((p, i) => { if (!p) { flush(); return; } chain.push(p); if (i % 3 === 0) { const y = Math.max(H(p[0], p[1]), 0.5) + 1.7; b.box(stone, p[0], y - 0.2, p[1], 0.5, 1.8, 0.5, 0, GREY_D); b.box(lan, p[0], y + 1.6, p[1], 0.55, 0.65, 0.55); } }); flush(); }
    for (let i = 0; i < 6; i++) { const p = shore[8 + i * 9]; if (!p) continue; const a = Math.atan2(p[1] - LC[1], p[0] - LC[0]); K.pier(b, p[0], 0.7, p[1], { len: 11, w: 2.4, mat: wood, ry: -(a + Math.PI), color: 0x5a4a38 }); }

    // ---- town: terraced rings of narrow slate-roofed houses round the lagoon
    const MON = (x, z) => Math.abs(x - HX) < 31 && Math.abs(z - HZ) < 26;
    const towers = [[-8, 28, 30], [-80, -20, 26], [30, 40, 34], [-100, 50, 24], [10, -22, 40]];
    const placed = [];
    for (let ri = 0; ri < 5; ri++) {
      const ld = 1.2 + ri * 0.17, circ = Math.PI * 2 * 58 * ld, n = Math.floor(circ / 7.3);
      for (let k = 0; k < n; k++) {
        const a = (k + rr.range(-0.15, 0.15)) / n * Math.PI * 2 + ri * 0.5, x = LC[0] + Math.cos(a) * LA * ld, z = LC[1] + Math.sin(a) * LB * ld;
        if (H(x, z) < 1.5 || MON(x, z) || Math.hypot(x, z) > 128 || towers.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 8) || (x < -52 && Math.abs(z - 20) < 30)) continue;
        const ry = Math.atan2(-LB * Math.cos(a), -LA * Math.sin(a)) + rr.range(-0.07, 0.07);
        const w = rr.range(4.2, 5.8), d = rr.range(4.6, 6.2), h = rr.range(4.8, 8.6), c1 = Math.cos(ry), s1 = Math.sin(ry);
        let yb = H(x, z); for (const [ox, oz] of [[w / 2, d / 2], [-w / 2, d / 2], [w / 2, -d / 2], [-w / 2, -d / 2]]) yb = Math.min(yb, H(x + c1 * ox + s1 * oz, z - s1 * ox + c1 * oz));
        const wc = jit(rr.pick(WALLS), rr, 0.01, 0.04, 0.04), rc = jit(rr.pick(ROOFS), rr, 0.01, 0.06, 0.04), rh = Math.min(w, d) * 0.8 + 1;
        b.box(stone, x, yb - 1.8, z, w + 0.5, 2.8 + (H(x, z) - yb), d + 0.5, ry, shade(GREY_D, 0.85));
        b.box(plaster, x, yb + 1.0, z, w, h - 1.0, d, ry, wc);
        b.box(plaster, x, yb + h - 0.4, z, w + 0.5, 0.7, d + 0.5, ry, shade(0xdcdad0, 0.95));
        b.prism(slate, x, yb + h, z, w + 0.9, rh, d + 0.9, ry, rc);
        if (rr() < 0.45) b.box(stone, x + c1 * w * 0.28, yb + h + rh * 0.3, z - s1 * w * 0.28, 0.9, rh + 1.5, 0.9, ry, 0x8e9094);
        for (const sd of [-1, 1]) for (const lx of [-w * 0.22, w * 0.22]) if (rr() < 0.8) b.box(win, x + c1 * lx + s1 * sd * (d / 2 + 0.05), yb + h * 0.5, z - s1 * lx + c1 * sd * (d / 2 + 0.05), 0.7, 1.1, 0.12, ry);
        b.box(dark, x + s1 * (d / 2 + 0.05), yb + 1.0, z + c1 * (d / 2 + 0.05), 0.95, 1.9, 0.12, ry);
        placed.push({ x, z, h: h + rh, y: yb });
      }
    }

    // ---- grey towers: slender banded shafts, arcaded lantern galleries, slate spires (beacons at night)
    towers.forEach(([x, z, h], ti) => { const y = Math.max(H(x, z), 1.2), r = ti === 4 ? 4.8 : 4.1;
      if (H(x, z) < 1.0) { const rm = tri('rock', { color: 0xffffff, scale: 8, snow: false, bump: 1.0 }); b.cyl(rm, x, -6, z, r + 5.5, y + 6.6, { top: 0.72, seg: 9, color: 0x7a8286 }); b.cyl(rm, x + 3, -6, z - 2, r + 2.5, y + 5.4, { top: 0.6, seg: 7, color: 0x6a7276 }); }
      b.cyl(stone, x, y - 3, z, r + 1.4, 5, { top: 0.88, seg: 10, color: shade(GREY, 0.8) });
      b.cyl(stone, x, y, z, r, h, { top: 0.82, seg: 10, color: GREY });
      for (const f of [0.34, 0.66]) b.cyl(stone, x, y + h * f, z, r * (1 - (1 - 0.82) * f) + 0.45, 0.6, { seg: 10, color: shade(GREY, 0.9) });
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; b.box(win, x + Math.cos(a) * (r * 0.9 + 0.05), y + h * 0.48, z + Math.sin(a) * (r * 0.9 + 0.05), 0.5, 1.8, 0.4, -a + Math.PI / 2); }
      const gt = y + h;
      b.cyl(stone, x, gt, z, r * 0.82 + 1.2, 0.9, { seg: 10, color: shade(GREY, 0.95) });
      b.cyl(lan, x, gt + 0.9, z, r * 0.6, 3.0, { seg: 8 });
      for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; b.cyl(stone, x + Math.cos(a) * (r * 0.82 + 0.4), gt + 0.9, z + Math.sin(a) * (r * 0.82 + 0.4), 0.32, 3.0, { seg: 5, color: GREY }); }
      b.cyl(stone, x, gt + 3.9, z, r * 0.82 + 1.0, 0.7, { seg: 10, color: shade(GREY, 0.92) });
      b.cone(slate, x, gt + 4.6, z, r * 0.82 + 1.4, 11 + ti, { seg: 10, color: 0x5a6a80 }); b.sphere(stone, x, gt + 4.6 + 11 + ti, z, 0.4, { seg: 6, color: 0xb8bcc0 });
    });

    // ---- the quiet cloister on the high ground: chapel with bell tower, ranges, arcaded garth, well, terrace wall
    { const y = PLAT, hx = HX, hz = HZ, wallC = [0xcfcec6, 0xc2c6c4];
      K.wall(b, [[hx - 27, hz - 22], [hx + 27, hz - 22], [hx + 27, hz + 22], [hx - 27, hz + 22]], { h: 1.8, t: 1.6, crenel: false, mat: stone, heightAt: () => y, sink: 5, closed: true, color: GREY });
      b.box(cobble, hx, y - 0.05, hz, 50, 0.2, 40, 0, 0x8a8e90);
      const rng = (cx, cz, w, d, h, c0, rf, ry = 0) => { b.box(stone, cx, y - 1, cz, w + 0.6, 2, d + 0.6, ry, shade(GREY_D, 0.9)); b.box(plaster, cx, y + 1, cz, w, h - 1, d, ry, c0); b.prism(slate, cx, y + h, cz, w + 1.0, Math.min(w, d) * 0.62 + 1.2, d + 1.0, ry, rf); };
      rng(hx, hz - 13, 38, 8.5, 8.5, wallC[0], 0x46525f);                         // north range (scriptorium)
      rng(hx - 15.5, hz + 0.5, 7.2, 17, 6.6, wallC[1], 0x4e5e58, 0);             // west range
      rng(hx + 15.5, hz + 0.5, 7.2, 17, 6.6, wallC[1], 0x4e5e58, 0);             // east range (dormitory)
      b.prism(slate, hx - 15.5, y + 6.6, hz + 0.5, 8.2, 5.2, 18, Math.PI / 2 * 0, 0x4e5e58);
      // chapel: tall nave with buttresses, apse and belfry tower
      b.box(stone, hx - 4, y - 1, hz + 13.5, 28.6, 2, 12.6, 0, shade(GREY_D, 0.9)); b.box(plaster, hx - 4, y + 1, hz + 13.5, 28, 10, 12, 0, 0xd2d0c8);
      b.prism(slate, hx - 4, y + 11, hz + 13.5, 29, 8.4, 13.2, 0, 0x3c4654);
      for (let k = 0; k < 6; k++) for (const sd of [-1, 1]) { b.box(stone, hx - 15 + k * 4.6, y, hz + 13.5 + sd * 6.3, 1.1, 8.4, 1.1, 0, GREY); b.box(win, hx - 12.7 + k * 4.6, y + 3.6, hz + 13.5 + sd * 6.05, 1.1, 4.2, 0.2); }
      b.cyl(stone, hx + 10.5, y - 1, hz + 13.5, 6.2, 11.5, { top: 0.94, seg: 9, color: 0xd2d0c8 }); b.cone(slate, hx + 10.5, y + 10.5, hz + 13.5, 7.0, 6.5, { seg: 9, color: 0x3c4654 });
      b.box(win, hx + 10.5 + 5.9, y + 3.6, hz + 13.5, 0.2, 4.2, 1.1);
      b.box(stone, hx - 21.5, y - 2, hz + 13.5, 6.2, 22, 6.2, 0, GREY); b.box(stone, hx - 21.5, y + 20, hz + 13.5, 7.2, 0.8, 7.2, 0, shade(GREY, 0.9));
      b.box(lan, hx - 21.5, y + 14.8, hz + 13.5, 3.9, 4.4, 3.9); for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) b.box(stone, hx - 21.5 + sx * 2.6, y + 14.8, hz + 13.5 + sz * 2.6, 1.1, 5.0, 1.1, 0, GREY);
      b.box(stone, hx - 21.5, y + 19.8, hz + 13.5, 7.4, 0.9, 7.4, 0, shade(GREY, 0.95)); b.pyramid(slate, hx - 21.5, y + 20.8, hz + 13.5, 6.8, 11, 6.8, 0, 0x3c4654);
      // warm scriptorium windows, doors
      for (let k = 0; k < 9; k++) b.box(win, hx - 16 + k * 4, y + 3.6, hz - 13 + 4.34, 1.0, 1.9, 0.12);
      b.box(dark, hx, y, hz - 8.7, 1.8, 2.8, 0.12);
      for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) b.box(win, hx + sx * 11.85, y + 3.3, hz - 4 + k * 5, 0.12, 1.7, 0.9);
      // arcaded garth, well and herb beds
      const cols = []; for (let k = -3; k <= 3; k++) { cols.push([hx + k * 3.2, hz - 7.5], [hx + k * 3.2, hz + 8.0]); } for (let k = -2; k <= 2; k++) cols.push([hx - 11.3, hz + k * 3.2], [hx + 11.3, hz + k * 3.2]);
      K.columns(b, cols.filter(([cx, cz]) => !(Math.abs(cx - hx) < 0.1 && cz > hz)), { h: 3.4, r: 0.32, mat: stone, y, color: 0xdad8ce });
      b.box(stone, hx, y + 3.7, hz - 7.5, 23, 0.4, 0.9, 0, GREY); b.box(stone, hx, y + 3.7, hz + 8.0, 23, 0.4, 0.9, 0, GREY);
      b.box(soft, hx, y, hz + 0.2, 17, 0.25, 11, 0, 0x4e6a46); b.cyl(stone, hx, y, hz + 0.2, 1.3, 1.0, { seg: 10, color: GREY }); b.cyl(wood, hx, y + 1.0, hz + 0.2, 0.12, 2.2, { seg: 5, color: 0x4a3a2a });
      for (let k = 0; k < 4; k++) { const bx = hx + (k < 2 ? -5.5 : 5.5), bz = hz + 0.2 + (k % 2 ? 3 : -3); b.box(soft, bx, y + 0.25, bz, 4.4, 0.25, 2.2, 0, [0x5e7a4a, 0x6e7a46][k % 2]); }
      b.ribbon(cobble, [[hx - 2, hz + 27], [hx - 4, hz + 40], [-6, 44]], 3.4, H, 0.3, 0x8a8e90);
    }
    root.add(b.build({}));

    // ---- trees: dark pines + slim cypress, instanced with baked ramps; reeds along shallows
    const pine = proto((bb) => { const oc = openCone(7); bb.cyl(dummyMat, 0, 0, 0, 0.28, 2.0, { top: 0.7, seg: 4, color: grey(0.7) }); [[1.0, 2.0, 3.0, 0.74], [2.6, 1.6, 2.8, 0.9], [4.2, 1.1, 2.7, 1.08]].forEach(([y, r, h, k]) => tilted(bb, dummyMat, oc, 0, y, 0, r, h, r, 0, 0.3, 0, grey(k))); });
    const slim = proto((bb) => { bb.cyl(dummyMat, 0, 0, 0, 0.25, 1.4, { top: 0.7, seg: 4, color: grey(0.7) }); tilted(bb, dummyMat, openCone(7), 0, 0.9, 0, 1.0, 8.5, 1.0, 0, 0, 0, grey(0.95)); });
    const reed = proto((bb) => { const oc = openCone(4); for (let k = 0; k < 4; k++) tilted(bb, dummyMat, oc, Math.cos(k * 1.6) * 0.5, 0, Math.sin(k * 1.6) * 0.5, 0.12, 2.0 + k * 0.4, 0.12, Math.sin(k * 2) * 0.12, 0, Math.cos(k * 2) * 0.12, grey(0.8 + k * 0.08)); });
    const leafM = tri('grass', { color: 0xffffff, scale: 2.4, rough: 1, snow: false, bump: 0.5 });
    const pineI = new Inst(pine, leafM), slimI = new Inst(slim, leafM), reedI = new Inst(reed, soft), tr = K.rng(5);
    const pineC = [0x2a4638, 0x33503f, 0x263e36, 0x3a5444];
    const noTree = (x, z) => H(x, z) < 1.6 || (lagoonDist(x, z) < 1.8 && lagoonDist(x, z) > 0.5 && x < 40) || MON(x, z) || placed.some((p) => Math.abs(p.x - x) < 5 && Math.abs(p.z - z) < 5);
    for (const [x, z] of K.scatter({ rng: tr, count: q.dens(210), bounds: [-190, -170, 190, 160], minDist: 7, avoid: noTree })) { const y = H(x, z), k = tr.range(1.0, 1.7); if (tr() < 0.7) pineI.add(x, y - 0.2, z, k, k * tr.range(1, 1.4), k, tr() * 6, pineC[tr.int(0, 3)]); else slimI.add(x, y - 0.2, z, k * 0.9, k * tr.range(0.9, 1.3), k * 0.9, 0, [0x30503e, 0x3a5a46][tr.int(0, 1)]); }
    for (const [x, z] of K.scatter({ rng: K.rng(6), count: q.dens(80), bounds: [170, -150, 300, -10], minDist: 7, avoid: (x, z) => H(x, z) < 1.6 })) { const y = H(x, z), k = tr.range(1.0, 1.6); pineI.add(x, y - 0.2, z, k, k * 1.2, k, tr() * 6, pineC[tr.int(0, 3)]); }
    for (const [x, z] of K.scatter({ rng: K.rng(7), count: q.dens(60), bounds: [-130, -300, 10, -190], minDist: 7, avoid: (x, z) => H(x, z) < 1.6 })) { const y = H(x, z), k = tr.range(1.0, 1.6); pineI.add(x, y - 0.2, z, k, k * 1.2, k, tr() * 6, pineC[tr.int(0, 3)]); }
    for (const [cx, cz] of [[HX - 6, HZ + 1], [HX + 6, HZ + 1]]) slimI.add(cx, PLAT, cz, 0.7, 0.55, 0.7, 0, 0x30503e);
    for (const [x, z] of K.scatter({ rng: K.rng(8), count: q.dens(160), bounds: [-300, -300, 330, 190], minDist: 3.2, accept: (x, z) => { const h = H(x, z); return h > 0.05 && h < 0.9 && Math.abs(H(x + 4, z) - H(x - 4, z)) < 1.6; } })) { const k = tr.range(0.8, 1.4); reedI.add(x, H(x, z) - 0.1, z, k, k, k, tr() * 6, [0x9aa078, 0xa8a884, 0x8a9468][tr.int(0, 2)]); }
    for (const i of [pineI, slimI, reedI]) if (i.items.length) root.add(i.build());
    // distant hazy islets receding into the mist (depth layers)
    { const fb = new Batch(), fr = K.rng(18), farM = tri('rock', { color: 0xffffff, scale: 40, snow: false });
      for (let i = 0; i < 9; i++) { const a = 0.4 + i * 0.7, d = fr.range(430, 640), r = fr.range(50, 110);
        for (let k = 0; k < 3; k++) { const px = Math.cos(a) * d + fr.range(-r * 0.5, r * 0.5), pz = Math.sin(a) * d + fr.range(-r * 0.5, r * 0.5), rr2 = r * fr.range(0.45, 0.8); fb.dome(farM, px, -4, pz, rr2, { seg: 9, sy: fr.range(0.22, 0.4), color: shade(0x6c7882, fr.range(0.85, 1.12)) }); }
        for (let k = 0; k < 9; k++) { const px = Math.cos(a) * d + fr.range(-r * 0.5, r * 0.5), pz = Math.sin(a) * d + fr.range(-r * 0.5, r * 0.5); fb.cone(soft, px, r * 0.1, pz, 3.4, fr.range(10, 15), { seg: 5, color: 0x2e4640 }); } }
      root.add(fb.build({ shadow: false })); }

    // ---- life: fishing boats with lanterns, moored dhows, drifting mist, gulls, smoke, walkers, clouds
    const lampB = new Batch(); lampB.sphere(lan, 0, 3.3, 0, 0.28, { seg: 5 }); lampB.box(wood, 0, 2.2, 0, 0.12, 1.2, 0.12, 0, 0x3a2a1c); const lampG = lampB.build({ shadow: false });
    const boats = [], sr = K.rng(3);
    for (let i = 0; i < q.dens(6); i++) { const s = K.ship(i % 2 ? 'cog' : 'dhow', { len: 11, hull: 0x4a4038, sail: 0xd8d2c4 }); s.add(lampG.clone()); root.add(s); boats.push({ s, a0: sr.range(0, 6.28), r: sr.range(210, 330), w: sr.range(0.012, 0.022) * (i % 2 ? 1 : -1), ph: sr.range(0, 6) }); }
    ctx.onUpdate((dt, t) => { for (const o of boats) { const a = o.a0 + t * o.w; o.s.position.set(Math.cos(a) * o.r, 0, Math.sin(a) * o.r); K.animateShip(o.s, t, o.ph); o.s.rotation.y = -a + (o.w > 0 ? Math.PI : 0); } });
    const lag = []; for (let i = 0; i < 4; i++) { const s = K.ship('dhow', { len: 9, hull: 0x4a4038, sail: 0xd8d2c4 }); s.add(lampG.clone()); s.position.set(-50 + i * 14, 0, 12 + (i % 2) * 14); s.rotation.y = i * 1.3; root.add(s); lag.push(s); }
    ctx.onUpdate((dt, t) => { lag.forEach((s, i) => { s.position.y = Math.sin(t * 0.8 + i) * 0.1; s.rotation.z = Math.sin(t * 0.7 + i) * 0.02; }); });
    root.add(K.smoke(placed.filter((_, i) => i % 7 === 0).map((p) => [p.x, p.y + p.h + 2, p.z]), { size: 12, rise: 9, opacity: 0.2, color: 0xe2e6ea }));
    root.add(K.smoke([[-40, 1.2, 20], [-10, 1.2, 10], [20, 1.2, -30], [-90, 1.2, 0], [60, 1.2, 60], [-110, 1.2, -40], [230, 1.2, -80], [-60, 1.2, -240], [-160, 1.2, 80], [100, 1.2, 40], [0, 1.2, 150], [-170, 1.2, -140]], { color: 0xf2f6f8, size: 90, rise: 8, opacity: 0.17, perStack: 8, spread: 26 }));
    const g = K.birds({ center: [-30, 40, 20], radius: 90, count: q.dens(12), color: 0xe4e4e0, size: 1.4, spreadY: 14, seed: 2 }); root.add(g); ctx.onUpdate((dt, t) => g.userData.update(t));
    const wk = K.walkers({ paths: [[[HX - 2, HZ + 27], [HX - 4, HZ + 40], [-6, 44]], [[HX, HZ + 12], [HX, HZ - 12]]], heightAt: (x, z) => Math.max(H(x, z), 0.3), count: q.dens(6), rng: K.rng(4), colors: [0x3a3a40, 0x5a5a5e, 0x4a4a52, 0x8a8a86] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const cl = K.clouds({ y: 200, extent: 800, count: 14, opacity: 0.55, color: 0xcfd6dc }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, Math.max(H(x, z), 0) + dy, z], r });
    return {
      radius: 260, center: [-10, 0, 10], minDistance: 15,
      hero: { pos: [-150, 66, 126], target: [-22, 5, 12] },
      climate: { atmos: 'dawn', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x6a7ba4, horizon: 0xe6cbc6, fog: 0xc8bcc2, fogD: 0.0027, sunC: 0xffd2b4, sunI: 2.1, az: 1.0, elev: 0.2, hemiSky: 0xa4b2d4, hemiGround: 0x5a5e6a, hemiI: 1.45 },
        day: { top: 0x7a90ac, horizon: 0xd0d8dc, fog: 0xc0cad2, fogD: 0.0025, sunC: 0xfff0dc, sunI: 2.2, az: 1.0, elev: 0.4, hemiSky: 0xb4c6dc, hemiGround: 0x5c6670, hemiI: 1.5 },
        dusk: { top: 0x363f72, horizon: 0xd69890, fog: 0x9c8c9c, fogD: 0.0026, sunC: 0xff9c78, sunI: 2.1, az: 1.2, elev: 0.13, hemiSky: 0x8a90c4, hemiGround: 0x4c4c5a, hemiI: 1.2 },
        night: { top: 0x080f26, horizon: 0x2a3c58, fog: 0x1b2a40, fogD: 0.0026, sunC: 0xa4baf0, sunI: 1.7, az: 1.0, elev: 0.5, hemiSky: 0x6a82bc, hemiGround: 0x2a3644, hemiI: 1.5, exposure: 1.18, water: 0.26 },
      } },
      landmarks: { 'three-islands': lm(230, -80, 40, 16), 'lagoon-harbour': lm(-40, 20, 36, 8), 'city-quarter': lm(-50, 70, 24, 12), 'grey-towers': lm(10, -22, 12, 48), 'stone-halls': lm(HX, HZ, 14, 20), 'shivering-sea': lm(-260, 60, 40, 6) },
    };
  },
};
