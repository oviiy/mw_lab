// Selhorys — sparse. Books/TWOIAF establish little: a walled Volantene river-port town where the Selhoru meets the lower Rhoyne, sandstone walls,
// shops and storehouses by the piers. Everything else here is restrained, atmospheric interpretation.
// Polish pass: ochre sandstone walls and flat-roofed terraces with awnings, a stone quay with hoist-beam warehouses and real piers, market square, reed banks and a sandbar
// in a green-turquoise Rhoyne, palm and cypress groves on patchwork fields, warm golden haze. Budget ~170k tris.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const rcz = (x) => Math.sin(x * 0.011) * 14;      // Rhoyne centreline (flows +x)
const rw = 34;                                    // river half-width
const _hsl = {};
function jit(hex, r, dh = 0.012, ds = 0.07, dl = 0.05) {
  const c = new THREE.Color(hex); c.getHSL(_hsl);
  return c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, K.clamp(_hsl.s + r.range(-ds, ds), 0, 1), K.clamp(_hsl.l + r.range(-dl, dl), 0, 1));
}
const shade = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const hash2 = (i, j) => { const t = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return t - Math.floor(t); };
const dummyMat = flat(0xffffff);
const grey = (v) => new THREE.Color(v, v, v);
const proto = (fn) => { const bb = new Batch(); fn(bb); return bb.build({}).children[0].geometry; };
const openCone = (seg) => { const c = new THREE.ConeGeometry(1, 1, seg, 1, true); c.translate(0, 0.5, 0); return c; };
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
function tilted(b, mat, geom, x, y, z, sx, sy, sz, rx, ry, rz, color) { _e.set(rx, ry, rz); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); b.addGeometry(mat, geom, _m, color); }

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(31);
    const cxT = 0, czT = 126, RX = 86, RZ = 50;
    const barD = (x, z) => Math.hypot((x - 118) / 38, (z - rcz(x) - 7) / 7);
    const heightAt = (x, z) => {
      let d = Math.abs(z - rcz(x)) - rw;
      // tributary (Selhoru) joins from the north at x~60
      const d2 = Math.abs(x - 60 - (z < -20 ? Math.sin(z * 0.02) * 8 : 0)) - 14; const trib = z < rcz(x) ? d2 : 99;
      const dd = Math.min(d, trib);
      const t = 1 - K.smoothstep(-5, 4, dd);
      const land = 2.2 + (K.fbm(x * 0.02, z * 0.02, 3, 5) - 0.5) * 1.4 + K.smoothstep(150, 400, Math.abs(z)) * 3 + K.smoothstep(280, 400, Math.hypot(x, z)) * (1 - K.smoothstep(400, 490, Math.max(Math.abs(x), Math.abs(z)))) * (10 + 14 * K.fbm(x * 0.006, z * 0.006, 3, 2));
      let h = K.lerp(land, -5, t);
      h = Math.max(h, K.lerp(-5, 0.85, K.smoothstep(0.1, 0.7, 1 - barD(x, z))));                                           // sandbar in the river
      return h;
    };
    const H = heightAt;
    // ---- terrain: sun-baked ochre plain, irrigated green strips along the river, patchwork fields, silty mud and wet sand banks
    const grass = new THREE.Color(0x9cb44e), dry = new THREE.Color(0xdcc47a), mud = new THREE.Color(0x7a6a4a), wetS = new THREE.Color(0xa89870), bar = new THREE.Color(0xd8c690), paved = new THREE.Color(0xc4a878), c = new THREE.Color(), fc = new THREE.Color();
    const FIELDS = [0xe4cc64, 0x78b048, 0xb89a56, 0x5e9c3e, 0xdcd48c, 0xb89a62], th = -0.25, ct = Math.cos(th), st = Math.sin(th);
    root.add(K.terrain({ size: 1000, seg: q.seg(160), heightAt, kind: 'rock', scale: 22, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.01, z * 0.01, 2, 3), n2 = K.fbm(x * 0.06, z * 0.06, 2, 8), dr = Math.abs(z - rcz(x)) - rw;
      c.copy(dry).lerp(grass, K.clamp(1.15 - dr * 0.02 + n * 0.5, 0, 1) * 0.8).multiplyScalar(0.92 + 0.16 * n2);
      const e = Math.hypot((x - cxT) / (RX + 24), (z - czT) / (RZ + 24));
      const fm = K.smoothstep(1.0, 1.35, e) * K.smoothstep(2, 8, dr) * (1 - K.clamp(s * 8, 0, 1));
      if (fm > 0.01) { const u = (x * ct + z * st) / 40, v = (-x * st + z * ct) / 28, i = Math.floor(u), j = Math.floor(v), ed = Math.min(Math.min(u - i, 1 - (u - i)) * 40, Math.min(v - j, 1 - (v - j)) * 28);
        fc.setHex(FIELDS[Math.floor(hash2(i, j) * FIELDS.length)]).multiplyScalar(1.0 + 0.1 * n2); if (ed < 2.2) fc.lerp(grass, 0.5).multiplyScalar(0.82); c.lerp(fc, fm * 0.95); }
      if (h < 1.3) c.lerp(h < 0.4 ? mud : wetS, K.clamp((1.3 - h) / 1.0, 0, 0.9));
      if (barD(x, z) < 1) c.lerp(bar, 0.8);
      c.lerp(paved, 0.75 * (1 - K.smoothstep(0.9, 1.04, e)));
      return c; } }));
    const wat = K.water({ w: 760, d: 760, seg: q.seg(140), level: 0, heightAt, deep: 0x1f6670, shallow: 0x86bba4, opacity: 0.9, choppy: 0.35, speed: 0.5 });
    root.add(wat); ctx.registerWater(wat);

    // ---- materials
    const stone = tri('stone', { color: 0xffffff, scale: 8, snow: false, bump: 0.8 }), plaster = tri('plaster', { color: 0xffffff, scale: 6, snow: false, bump: 0.55 }), tile = tri('tile', { color: 0xffffff, scale: 5, snow: false, rough: 0.75 });
    const wood = tri('wood', { color: 0xffffff, scale: 4, snow: false }), cobble = tri('cobble', { color: 0xffffff, scale: 6, snow: false });
    const cloth = flat(0xffffff, { rough: 1, side: THREE.DoubleSide, flatShading: false }), soft = flat(0xffffff, { rough: 1, flatShading: false }), dark = flat(0x0a0806);
    const win = glow(0xffc46b), lan = glow(0xffa84a, 1.4);
    const b = new Batch();
    const SAND = 0xdcbc86, SAND_D = 0xb89a68, WALLS = [0xdcc28e, 0xe8d3a2, 0xd2b27c, 0xeedfb6, 0xc8a46e, 0xf0e6cc, 0xd8a878], TERRA = [0xb2582f, 0xc0683a, 0x9a4a2c, 0xc8784a], CLOTH = [0xb5472f, 0xe0b040, 0x3c7f8e, 0xe4dcc4, 0x8a3b5a, 0xc86a3a];

    // ---- walls: ochre sandstone, battered plinth, towers with flat crenellated crowns, two gates
    const NW = 40, wp = Array.from({ length: NW }, (_, i) => { const a = (i / NW) * Math.PI * 2; return [cxT + Math.cos(a) * RX, czT + Math.sin(a) * RZ]; });
    K.wall(b, wp, { h: 11, t: 4, mat: stone, capMat: stone, heightAt: H, closed: true, color: SAND, merlon: 1.3, sink: 4 });
    for (let i = 0; i < NW; i++) { const A = wp[i], B2 = wp[(i + 1) % NW], dx = B2[0] - A[0], dz = B2[1] - A[1], len = Math.hypot(dx, dz), y0 = Math.min(H(A[0], A[1]), H(B2[0], B2[1]));
      b.box(stone, (A[0] + B2[0]) / 2, y0 - 1, (A[1] + B2[1]) / 2, len + 0.5, 2.6, 5.4, K.headingX(dx, dz), shade(SAND, 0.82)); }
    wp.forEach(([x, z], i) => { if (i % 3 !== 0) return; const y = H(x, z);
      K.tower(b, x, z, { r: 3.8, h: 16, y, mat: stone, roofMat: tile, roof: i % 6 === 0 ? 'cone' : 'flat', roofH: 7, seg: 12, windows: false, color: SAND, roofColor: TERRA[i % 4] });
      b.cyl(stone, x, y + 9, z, 4.1, 0.6, { seg: 12, color: shade(SAND, 0.92) }); });
    const gate = (gx, gz) => { const gy = H(gx, gz); K.gatehouse(b, gx, gz, { y: gy, ry: 0, mat: stone, roofMat: tile, w: 17, d: 8.5, h: 14, gate: 4.8, wood, towerR: 3.8, color: SAND, roofColor: 0xb2582f }); b.box(dark, gx, gy, gz, 5.2, 5, 5.5);
      for (const sg of [-1, 1]) { b.cyl(stone, gx + sg * 4.2, gy, gz + (gz > czT ? 5 : -5), 0.3, 3, { seg: 6, color: SAND_D }); b.box(lan, gx + sg * 4.2, gy + 3, gz + (gz > czT ? 5 : -5), 0.6, 0.7, 0.6); } };
    gate(0, czT + RZ); gate(0, czT - RZ);

    // ---- quay: embankment wall along the south shore, steps, bollards, lanterns, hoist-beam warehouses and real piers
    const shore = [];
    for (let x = -112; x <= 112; x += 7) { let z = rcz(x) + rw + 18; while (z > rcz(x) + 5 && H(x, z) > 0.55) z -= 0.5; shore.push([x, z + 0.3]); }
    K.wall(b, shore, { h: 1.5, t: 2.4, crenel: false, mat: stone, heightAt: H, sink: 3.5, color: SAND });
    shore.forEach(([x, z], i) => { if (i % 3 === 1) { const y = H(x, z + 2); b.cyl(wood, x, y + 1.4, z + 0.6, 0.28, 0.9, { seg: 6, top: 0.8, color: 0x2c2418 }); } if (i % 6 === 2) { b.box(stone, x, H(x, z) + 1.4, z + 1.2, 0.5, 1.9, 0.5, 0, SAND_D); b.box(lan, x, H(x, z) + 3.4, z + 1.2, 0.6, 0.65, 0.6); } });
    const piers = []; for (let i = 0; i < 8; i++) { const x = -84 + i * 22, z = shore[Math.round((x + 112) / 7)][1] - 0.5, len = 14 + (i % 3) * 5; K.pier(b, x, 0.8, z, { len, w: 3.2, mat: wood, ry: Math.PI / 2, color: 0x9a7e58 }); piers.push({ x, z, len }); }
    const wares = [];
    for (let i = 0; i < 6; i++) { const x = -66 + i * 24, zq = shore[Math.round((x + 112) / 7)][1] + 13, y = H(x, zq), wc = jit(WALLS[i % 5], rr, 0.01, 0.05, 0.04);
      b.box(stone, x, y - 1.5, zq, 15.6, 2.6, 8.6, 0, shade(SAND_D, 0.9)); b.box(plaster, x, y + 1.0, zq, 15, 6, 8, 0, wc); b.box(plaster, x, y + 6.8, zq, 15.8, 0.7, 8.8, 0, 0xf0e6cc);
      b.prism(tile, x, y + 7.5, zq, 16.6, 3.6, 9.6, 0, jit(TERRA[i % 4], rr, 0.01, 0.06, 0.04));
      b.box(dark, x - 3, y + 1.0, zq - 4.05, 3.6, 4.4, 0.2); b.box(dark, x + 3.4, y + 1.0, zq - 4.05, 3.0, 4.0, 0.2); b.box(win, x + 0.2, y + 4.8, zq - 4.05, 1.0, 1.3, 0.12);
      b.box(wood, x - 3, y + 7.4, zq - 4.8, 0.45, 0.45, 5.4, 0, 0x3a2a1c); b.box(wood, x - 3, y + 6.2, zq - 7.4, 0.2, 1.4, 0.2, 0, 0x3a2a1c);        // hoist beam over the quay
      for (let k = 0; k < 5; k++) { const bx = x + 6 + (k % 3) * 1.1, bz = zq - 5.8 - (k >> 1) * 1.2; b.cyl(wood, bx, y + 0.0, bz, 0.55, 1.0, { seg: 7, top: 0.92, color: [0x7a5a3a, 0x6a4a2c][k % 2] }); }
      for (let k = 0; k < 3; k++) b.box(wood, x - 7.5 + k * 1.4, y, zq - 6, 1.2, 0.9 + (k % 2) * 0.9, 1.2, 0.1 * k, [0x8a6a42, 0x7a5a38, 0x6a4a2c][k]);
      wares.push([x, zq]);
    }

    // ---- town: flat-roofed terraces and tiled houses on a loose grid, awnings, roof stairs and water tanks
    const placed = [], plazaC = [0, czT];
    const inT = (x, z) => ((x - cxT) / (RX - 8)) ** 2 + ((z - czT) / (RZ - 8)) ** 2 < 1;
    for (let gz = czT - 46, row = 0; gz <= czT + 46; gz += 9.4, row++) for (let gx = -84, ci = 0; gx <= 84; gx += 8.6, ci++) {
      if (ci % 5 === 3 || rr() < 0.08) continue;
      const x = gx + rr.range(-0.8, 0.8), z = gz + rr.range(-0.8, 0.8);
      if (!inT(x, z) || Math.abs(x) < 5 || Math.hypot(x - plazaC[0], z - plazaC[1]) < 13) continue;
      const w = rr.range(4.8, 6.6), d = rr.range(5.0, 6.8), h = rr.range(4.2, 8.0), ry = (row % 2 ? 0 : Math.PI / 2) * 0 + rr.range(-0.05, 0.05), y = H(x, z), kind = rr() < 0.62 ? 'flat' : (rr() < 0.55 ? 'hip' : 'gable');
      const wc = jit(rr.pick(WALLS), rr, 0.012, 0.06, 0.05), c1 = Math.cos(ry), s1 = Math.sin(ry);
      b.box(stone, x, y - 1.4, z, w + 0.5, 2.4, d + 0.5, ry, shade(SAND_D, 0.85));
      b.box(plaster, x, y + 1.0, z, w, h - 1.0, d, ry, wc);
      if (kind === 'flat') {
        b.box(plaster, x, y + h, z, w + 0.5, 0.75, d + 0.5, ry, shade(0xf2e8cc, 0.95));
        if (rr() < 0.5) b.box(plaster, x + c1 * w * 0.22, y + h + 0.75, z - s1 * w * 0.22, 1.9, 2.3, 1.9, ry, shade(wc, 0.96));
        if (rr() < 0.45) { const ac = CLOTH[rr.int(0, 5)]; b.box(cloth, x - c1 * w * 0.15, y + h + 2.3, z + s1 * w * 0.15, w * 0.7, 0.12, d * 0.55, ry, ac, 0.0, 0.12); for (const sx of [-1, 1]) b.box(wood, x + c1 * sx * w * 0.32 - c1 * w * 0.15, y + h + 0.75, z - s1 * sx * w * 0.32 + s1 * w * 0.15, 0.14, 1.6, 0.14, 0, 0x4a3a2a); }
        else if (rr() < 0.3) b.cyl(wood, x - c1 * w * 0.25, y + h + 0.75, z + s1 * w * 0.25, 0.75, 1.3, { seg: 8, color: 0x8a6a46 });
      } else if (kind === 'hip') b.pyramid(tile, x, y + h, z, w + 1.0, Math.min(w, d) * 0.5 + 0.9, d + 1.0, ry, jit(rr.pick(TERRA), rr, 0.012, 0.08, 0.05));
      else b.prism(tile, x, y + h, z, w + 1.0, Math.min(w, d) * 0.45 + 0.8, d + 1.0, ry, jit(rr.pick(TERRA), rr, 0.012, 0.08, 0.05));
      for (const sd of [-1, 1]) for (const lx of [-w * 0.24, w * 0.24]) if (rr() < 0.75) b.box(win, x + c1 * lx + s1 * sd * (d / 2 + 0.05), y + h * 0.52, z - s1 * lx + c1 * sd * (d / 2 + 0.05), 0.75, 1.2, 0.12, ry);
      b.box(dark, x + s1 * (d / 2 + 0.05), y + 1.0, z + c1 * (d / 2 + 0.05), 1.0, 2.0, 0.12, ry);
      placed.push({ x, z, h: h + 1 });
    }
    // central square: fountain basin, cypresses are added with the trees
    { const py = H(plazaC[0], plazaC[1]); b.cyl(cobble, plazaC[0], py - 0.5, plazaC[1], 12, 0.9, { seg: 24, color: 0xc4ae88 }); b.cyl(stone, plazaC[0], py + 0.3, plazaC[1], 3.6, 0.9, { seg: 14, color: SAND }); b.cyl(stone, plazaC[0], py + 1.2, plazaC[1], 0.7, 1.9, { seg: 8, color: SAND_D }); b.cyl(flat(0x2a6a72, { rough: 0.15, metal: 0.3, flatShading: false }), plazaC[0], py + 1.15, plazaC[1], 3.1, 0.1, { seg: 14 }); }
    // streets
    b.ribbon(cobble, [[0, czT + RZ + 50], [0, czT - RZ - 4], [0, shore[Math.round(112 / 7)][1] + 1]], 5, H, 0.28, 0xb8a47c);
    b.ribbon(cobble, [[-RX + 8, czT], [RX - 8, czT]], 4, H, 0.28, 0xb8a47c);
    b.ribbon(cobble, shore.map(([x, z]) => [x, z + 4.5]), 4, H, 0.28, 0xb8a47c);
    b.ribbon(cobble, K.smoothPath([[0, czT + RZ + 40], [-60, czT + RZ + 80], [-140, czT + RZ + 100]], 6), 4, H, 0.28, 0xb8a47c);

    // ---- market: stalls with striped awnings under the river gate, crates and fruit
    const stalls = [];
    for (let i = 0; i < 12; i++) { const row = i % 2, x = -30 + (i >> 1) * 11.5 + row * 3, z = czT - RZ - 6 - row * 9.5, y = H(x, z), ac = CLOTH[i % 6];
      if (Math.abs(x) < 4) continue;
      for (const [px, pz] of [[-1.7, -1.3], [1.7, -1.3], [-1.7, 1.3], [1.7, 1.3]]) b.cyl(wood, x + px, y, z + pz, 0.11, 2.7 + (pz < 0 ? 0.3 : 0), { seg: 5, color: 0x4a3a2a });
      b.box(cloth, x, y + 2.85, z, 4.2, 0.1, 3.3, 0, ac, 0.16, 0); b.box(cloth, x, y + 2.6, z - 1.7, 4.2, 0.5, 0.08, 0, shade(ac, 0.8));
      b.box(wood, x, y, z + 0.4, 3.2, 1.0, 1.2, 0, 0x6a4a2c);
      for (let k = 0; k < 5; k++) b.sphere(soft, x - 1.2 + k * 0.6, y + 1.0, z + 0.4, 0.26, { seg: 5, color: [0xd0502c, 0xe0a030, 0x8aa83a, 0xb03a4a, 0xe8b440][(k + i) % 5] });
      stalls.push([x, z]); }
    for (let k = 0; k < 7; k++) b.box(wood, -8 + k * 2.6, H(-8 + k * 2.6, 83), 83 + (k % 2), 1.3, 0.8 + (k % 3) * 0.5, 1.2, k * 0.3, 0x8a6a42);
    root.add(b.build({}));

    // ---- vegetation: palms, cypress rows, round olive-like trees; reeds; all instanced with baked ramps
    const trunkP = proto((bb) => bb.cyl(dummyMat, 0, 0, 0, 0.32, 7.2, { top: 0.55, seg: 5, color: grey(1) }));
    const frond = proto((bb) => { const oc = openCone(4); for (let k = 0; k < 8; k++) { const a = k * 0.785; tilted(bb, dummyMat, oc, Math.cos(a) * 0.3, 7.0, Math.sin(a) * 0.3, 0.55, 3.2, 0.55, Math.sin(a) * 1.15, 0, -Math.cos(a) * 1.15, grey(0.85 + (k % 2) * 0.2)); } });
    const cyp = proto((bb) => { bb.cyl(dummyMat, 0, 0, 0, 0.25, 1.2, { top: 0.7, seg: 4, color: grey(0.7) }); tilted(bb, dummyMat, openCone(7), 0, 0.8, 0, 1.0, 9, 1.0, 0, 0, 0, grey(0.95)); });
    const oliv = proto((bb) => { bb.cyl(dummyMat, 0, 0, 0, 0.35, 2.2, { top: 0.7, seg: 4, color: grey(0.7) }); bb.sphere(dummyMat, 0, 1.7, 0, 2.2, { seg: 6, sy: 0.78, color: grey(0.95) }); bb.sphere(dummyMat, 0.8, 2.6, 0.3, 1.4, { seg: 5, sy: 0.8, color: grey(1.1) }); });
    const reed = proto((bb) => { const oc = openCone(4); for (let k = 0; k < 4; k++) tilted(bb, dummyMat, oc, Math.cos(k * 1.6) * 0.5, 0, Math.sin(k * 1.6) * 0.5, 0.13, 2.2 + k * 0.4, 0.13, Math.sin(k * 2) * 0.14, 0, Math.cos(k * 2) * 0.14, grey(0.8 + k * 0.08)); });
    const leafM = tri('grass', { color: 0xffffff, scale: 2.4, rough: 1, snow: false, bump: 0.5 }), trunkM = tri('wood', { color: 0xffffff, scale: 2, snow: false });
    const palmT = new Inst(trunkP, trunkM), palmF = new Inst(frond, leafM), cypI = new Inst(cyp, leafM), olI = new Inst(oliv, leafM), reedI = new Inst(reed, soft), tr = K.rng(5);
    const townE = (x, z) => Math.hypot((x - cxT) / (RX + 12), (z - czT) / (RZ + 12));
    const free = (x, z) => H(x, z) < 1.2 || townE(x, z) < 1 || (Math.abs(x) < 6 && z > 40) || (Math.abs(z - (czT + RZ + 30)) < 22 && Math.abs(x) < 30) || z < rcz(x) + rw + 22 && z > rcz(x) + rw - 8 && Math.abs(x) < 125;
    for (const [x, z] of K.scatter({ rng: tr, count: q.dens(75), bounds: [-300, -250, 300, 300], minDist: 10, avoid: (x, z) => free(x, z) })) { const y = H(x, z), k = tr.range(0.9, 1.35), a = tr() * 6; palmT.add(x, y - 0.2, z, k, k, k, a, 0x8a7452); palmF.add(x, y - 0.2, z, k, k, k, a, [0x4a9a48, 0x58a650, 0x3f8a42][tr.int(0, 2)]); }
    for (const [x, z] of K.scatter({ rng: K.rng(15), count: q.dens(90), bounds: [-300, 40, 300, 300], minDist: 9, avoid: (x, z) => free(x, z) || H(x, z) > 6 })) { const y = H(x, z), k = tr.range(0.9, 1.5); if (tr() < 0.5) olI.add(x, y - 0.2, z, k, k, k, tr() * 6, [0x7a8a52, 0x8a9a58, 0x6a7a4a][tr.int(0, 2)]); else cypI.add(x, y - 0.2, z, k * 0.8, k * 1.1, k * 0.8, 0, [0x3a5a3c, 0x44663f][tr.int(0, 1)]); }
    for (let i = 0; i < 18; i++) { const x = -200 + i * 24, z = czT + RZ + 56 + Math.sin(i * 0.5) * 6; if (H(x, z) > 1.2 && townE(x, z) > 1.2) cypI.add(x, H(x, z), z, 0.9, 1.3, 0.9, 0, 0x3a5a3c); }   // cypress row along the south road
    for (const [px, pz] of [[-8, czT - 8], [8, czT - 8], [-8, czT + 8], [8, czT + 8]]) cypI.add(px, H(px, pz), pz, 0.8, 0.9, 0.8, 0, 0x3f6040);
    for (const [x, z] of K.scatter({ rng: K.rng(8), count: q.dens(230), bounds: [-330, -330, 330, 120], minDist: 3.0, accept: (x, z) => { const h = H(x, z); return h > 0.1 && h < 0.95 && !(Math.abs(x) < 125 && z > rcz(x) + rw - 3); } })) { const k = tr.range(0.8, 1.5); reedI.add(x, H(x, z) - 0.1, z, k, k, k, tr() * 6, [0x9aa65a, 0xa8b064, 0x889a50][tr.int(0, 2)]); }
    for (const i of [palmT, palmF, cypI, olI, reedI]) if (i.items.length) root.add(i.build());

    // ---- life: river boats, moored craft at the piers, gulls, smoke, banners, crowds, cloud drift
    const types = ['barge', 'cog', 'dhow'], boats = [], sr = K.rng(2);
    for (let i = 0; i < q.dens(9); i++) { const s = K.ship(types[i % 3], { len: sr.range(10, 16), hull: [0x6a5430, 0x5b4129, 0x7a3a2a][i % 3], sail: [0xe8dfc8, 0xd8c08a, 0xb5472f, 0x3c7f8e][i % 4] }); root.add(s); boats.push({ s, o: sr.range(-0.5, 0.45), x0: sr.range(-300, 300), v: sr.range(4, 7) * (i % 2 ? 1 : -1), ph: sr.range(0, 6) }); }
    ctx.onUpdate((dt, t) => { for (const o of boats) { const x = ((o.x0 + t * o.v + 380) % 760 + 760) % 760 - 380; o.s.position.set(x, 0.05, rcz(x) + o.o * rw * 0.7); K.animateShip(o.s, t, o.ph); o.s.rotation.y = o.v > 0 ? 0 : Math.PI; } });
    const moored = []; piers.forEach((p, i) => { if (i % 2) return; const s = K.ship(i % 4 ? 'barge' : 'cog', { len: 14, hull: [0x6a5430, 0x7a3a2a][i % 3 ? 0 : 1], sail: [0xe8dfc8, 0xd8c08a][i % 2] }); s.position.set(p.x + 5.2, 0.05, p.z - 9); s.rotation.y = 0.04 * i; root.add(s); moored.push(s); });
    ctx.onUpdate((dt, t) => moored.forEach((s, i) => { s.position.y = 0.05 + Math.sin(t * 0.8 + i) * 0.08; K.animateShip(s, t * 0.5, i); }));
    root.add(K.smoke(placed.filter((_, i) => i % 9 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 3, p.z]), { size: 14, rise: 10, opacity: 0.17, color: 0xe6ddd0 }));
    const g = K.birds({ center: [0, 38, 30], radius: 80, count: q.dens(10), color: 0xf4f4f0, size: 1.3, spreadY: 10, seed: 3 }); root.add(g); ctx.onUpdate((dt, t) => g.userData.update(t));
    root.add(K.banners([[-8, czT - RZ, 0], [8, czT - RZ, 0], [-8, czT + RZ, 0], [8, czT + RZ, 0]].map(([x, z], i) => ({ x, y: H(x, z) + 22, z: z + (z < czT ? -1 : 1) * 5, w: 2.6, h: 6.5, color: [0xb5472f, 0x3c7f8e][i % 2], ry: z < czT ? 0 : Math.PI }))));
    const wk = K.walkers({ paths: [[[0, czT + RZ + 50], [0, czT], [0, czT - RZ + 4]], [[-70, shore[6][1] + 4.5], [70, shore[26][1] + 4.5]], [[-30, czT - RZ - 8], [30, czT - RZ - 14]]], heightAt: H, count: q.dens(26), rng: K.rng(4), colors: [0xb5472f, 0x3c7f8e, 0xe0b040, 0x6a5a3a, 0xe4dcc4, 0x8a3b5a] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const cl = K.clouds({ y: 230, extent: 800, count: 8, opacity: 0.42, color: 0xfff6e8 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));
    const fire = K.fires([[-8, H(-8, czT - RZ) + 3.4, czT - RZ - 5], [8, H(8, czT - RZ) + 3.4, czT - RZ - 5], [-30, 3.4, shore[11][1] + 6], [30, 3.4, shore[25][1] + 6]], { size: 3.5, light: q.low ? 0 : 3, intensity: 40 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 230, center: [0, 0, 70], minDistance: 15,
      hero: { pos: [-128, 62, -22], target: [14, 4, 100] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x6678b0, horizon: 0xf4c49a, fog: 0xe6c0a0, fogD: 0.0018, sunC: 0xffc080, sunI: 2.8, az: -2.2, elev: 0.16, hemiSky: 0xb4b6dc, hemiGround: 0x7a6248, hemiI: 0.9 },
        day: { top: 0x4a92d0, horizon: 0xf2e2bc, fog: 0xe8d8b2, fogD: 0.0012, sunC: 0xffe2a8, sunI: 3.1, az: -2.2, elev: 0.5, hemiSky: 0xb8d6ee, hemiGround: 0x8a7650, hemiI: 1.0 },
        dusk: { top: 0x34407e, horizon: 0xf29058, fog: 0xca8c70, fogD: 0.0017, sunC: 0xff8c48, sunI: 3.0, az: -2.3, elev: 0.13, hemiSky: 0xa4a0d4, hemiGround: 0x6a5048, hemiI: 1.05 },
        night: { top: 0x080e30, horizon: 0x26386a, fog: 0x1a2848, fogD: 0.002, sunC: 0xa0b8f4, sunI: 1.9, az: -2.0, elev: 0.5, hemiSky: 0x6478b8, hemiGround: 0x2c3a40, hemiI: 1.5, water: 0.18 },
      } },
      landmarks: {
        'sandstone-walls': lm(RX, czT, 12, 16), 'river-gate': lm(0, czT - RZ, 9, 18), 'piers': lm(-20, rcz(-20) + rw - 4, 14, 5), 'storehouses': lm(-18, shore[13][1] + 13, 12, 10), 'confluence': lm(60, -10, 22, 6), 'market-quarter': lm(0, czT - RZ - 12, 12, 6),
      },
    };
  },
};
