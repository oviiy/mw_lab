// Yin - imperial city of Yi Ti, known to the books only second-hand: a great port on the Jade Sea, a river running down from
// the forests, and the imperial court seated here. Everything visual is an INTERPRETATION (tiered roofs, vermilion, jade and gold).
// Polish pass: rectilinear walled city on a levelled plateau with a moat, grey-brick walls and double-eaved gate pavilions,
// concave multi-tier roofs with upturned corners (jade, blue, gold ridge), lacquered vermilion halls on a white marble terrace stack,
// courtyard compounds on a street grid, octagonal and square pagodas, lantern-lit avenue, patchwork fields, warm jade-sea light.
import * as K from '../kit/index.js';
const { THREE, Batch, tri, flat, glow } = K;
const W = 130, D0 = -110, D1 = 70; // city walls: x in [-W, W], z in [D0, D1]
const CZ = (D0 + D1) / 2, HZ = (D1 - D0) / 2, PLATEAU = 2.6;

const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
const GEO = {};
const geo = (k, f) => GEO[k] || (GEO[k] = f().toNonIndexed());
const boxG = () => geo('box', () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
const flickG = () => geo('flick', () => new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0));
const frustG = (top, seg) => geo(`fr${seg}|${top}`, () => new THREE.CylinderGeometry(top, 1, 1, seg, 1).rotateY(Math.PI / seg).translate(0, 0.5, 0));
const sphG = () => geo('sph', () => new THREE.SphereGeometry(1, 8, 6));
function part(b, mat, g, x, y, z, sx, sy, sz, rx, ry, rz, color) {
  _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); _m4.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); b.addGeometry(mat, g, _m4, color);
}
const vary = (r, hex, a = 0.1) => { _c.set(hex); const k = 1 + (r() - 0.5) * 2 * a; return _c.clone().multiplyScalar(k); };
const sdBox = (x, z) => { const ox = Math.abs(x) - W, oz = Math.abs(z - CZ) - HZ; return Math.hypot(Math.max(ox, 0), Math.max(oz, 0)) + Math.min(Math.max(ox, oz), 0); };

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, R = K.rng(91);
    const riverX = (z) => 178 + Math.sin(z * 0.03) * 14;
    const heightAt = (x, z) => {
      let h = 2 + (K.fbm(x * 0.012, z * 0.012, 3, 4) - 0.5) * 4;
      h += K.smoothstep(-130, -330, z) * (30 + K.fbm(x * 0.01, z * 0.01, 3, 6) * 80); // forested hills to the north
      const rd = Math.abs(x - riverX(z)); h -= (1 - K.smoothstep(4, 16, rd)) * 4 * (z < D1 + 30 ? 1 : 0.4);
      const s = z - (D1 + 28 + Math.sin(x * 0.02) * 6 + K.fbm(x * 0.02, 1, 2, 7) * 8); h -= K.smoothstep(-8, 10, s) * 9;
      const sd = sdBox(x, z);
      const moat = K.smoothstep(5, 8, sd) * (1 - K.smoothstep(18, 21, sd)) * (1 - K.smoothstep(D1 - 6, D1 + 6, z)); // moat on the W, N and E sides
      h = K.lerp(h, -2.6, moat);
      const plat = 1 - K.smoothstep(0, 14, sd); h = K.lerp(h, PLATEAU, plat * (1 - K.smoothstep(D1 + 8, D1 + 22, z)));            // levelled city platform
      return h;
    };
    const H = heightAt;
    // ---- terrain: patchwork fields on the plain, jade-green hills, wet-gold shore sand
    const grass = new THREE.Color(0x6a9a46), dry = new THREE.Color(0xa6a864), hill = new THREE.Color(0x3f6a3a), hill2 = new THREE.Color(0x587c46), crop = [0x7fae48, 0xb8b45a, 0x5f9a4c, 0xc8a85a, 0x8aa84a].map((v) => new THREE.Color(v)), paved = new THREE.Color(0xa89878), sand = new THREE.Color(0xd6c79a), dirt = new THREE.Color(0xb59f78), c = new THREE.Color();
    root.add(K.terrain({ size: 1100, seg: q.seg(210), heightAt: H, kind: 'grass', scale: 14, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.01, z * 0.01, 2, 5), sd = sdBox(x, z);
      c.copy(grass).lerp(dry, K.clamp(n - 0.2, 0, 0.6));
      if (sd > 20 && z > -135 && z < 85 && Math.abs(x) < 330) { const i = Math.floor(x / 17), j = Math.floor(z / 15); const k = K.noise2(i, j, 5); if (K.noise2(i * 0.3, j * 0.3, 9) > 0.35) c.lerp(crop[Math.floor(k * 5) % 5], 0.55); }
      if (z < -135) c.lerp(K.fbm(x * 0.03, z * 0.03, 2, 3) > 0.5 ? hill2 : hill, K.smoothstep(-135, -230, z) * 0.9);
      c.lerp(dirt, K.clamp(s * 3, 0, 0.5));
      if (sd < 14) c.lerp(dirt, 0.6 * (1 - K.smoothstep(0, 14, sd))); if (sd < 3) c.lerp(paved, 0.9 * (1 - K.smoothstep(-1, 3, sd)));
      if (h < 0.5 && z > 60) c.lerp(sand, K.clamp((0.5 - h) * 0.9, 0, 0.8));
      if (h < -0.3 && sd > 5 && sd < 22) c.lerp(new THREE.Color(0x2c4a40), 0.7);
      return c; } }));
    const wat = K.water({ w: 1100, d: 660, seg: q.seg(150), level: 0, heightAt: H, deep: 0x15667a, shallow: 0x58c0a8, opacity: 0.9, choppy: 0.3, speed: 0.5, center: [0, 425] });   // starts south of the walls so it never floods the river/moat channels
    root.add(wat); ctx.registerWater(wat);
    const riv = K.waterPatch({ w: 56, d: 490, level: -0.4, center: [178, -145], depth: 6, deep: 0x1a5e66, shallow: 0x3a8e8a, opacity: 0.92, choppy: 2.5 }); root.add(riv); ctx.registerWater(riv);
    const moatPatches = [[2 * (W + 22), 17, 0, D0 - 13.5], [17, D1 - D0 + 5 + 4, -W - 13.5, (D0 - 5 + D1 + 4) / 2], [17, D1 - D0 + 5 + 4, W + 13.5, (D0 - 5 + D1 + 4) / 2]];
    for (const [pw, pd, cx, cz] of moatPatches) { const m = K.waterPatch({ w: pw, d: pd, seg: pw > pd ? 40 : 4, level: -0.4, center: [cx, cz], depth: 6, deep: 0x1a5e66, shallow: 0x3a8e8a, opacity: 0.94, speed: 0.3, choppy: 2.5 }); root.add(m); ctx.registerWater(m); }

    // ---- materials: near-white tints, colour in the per-part colour
    const brickM = tri('brick', { color: 0xf0e8dc, scale: 5, snow: false, bump: 0.8 }), plaster = tri('plaster', { color: 0xffffff, scale: 6, snow: false }), tile = tri('tile', { color: 0xffffff, scale: 3, snow: false, rough: 0.42, bump: 0.5 });
    const roofC = tri('tile', { color: 0xffffff, scale: 7, snow: false, rough: 0.6, bump: 0.18 }), marble = tri('marble', { color: 0xf4efe6, scale: 6, snow: false, rough: 0.35 }), woodM = tri('wood', { color: 0xc89070, scale: 4, snow: false }), cobble = tri('cobble', { color: 0xe6dcc6, scale: 8, snow: false, bump: 0.7 }), lac = flat(0xffffff, { rough: 0.38, metal: 0.04, flatShading: false });
    const gold = flat(0xffffff, { rough: 0.35, metal: 0.25, flatShading: false }), dark = flat(0x180d0a), lanG = glow(0xff5a34, 1.3), winG = glow(0xffc46b, 1.0);
    const VERM = 0xb23424, VERM2 = 0x96281c, JADE = 0x2a8a68, BLUE = 0x2f6ab0, GOLD = 0xe0b040, TEAL = 0x2a7a7a, GREY = 0x4a5a5c;
    const b = new Batch();

    /** Concave multi-tier roof with upturned corners. W x D footprint, R rise. */
    const eaveRoof = (x, y, z, w, d, rise, col, { ry = 0, seg = 4, trim = VERM2, tiers = 3 } = {}) => {
      const k = 1 / (2 * Math.cos(Math.PI / seg)), prof = tiers === 3 ? [[1, 0.74, 0.28], [0.74, 0.46, 0.34], [0.46, 0.1, 0.38]] : [[1, 0.5, 0.5], [0.5, 0.1, 0.5]];
      part(b, lac, frustG(1, seg), x, y - 0.55, z, w * k, 0.55, d * k, 0, ry, 0, trim);          // painted fascia
      part(b, gold, frustG(1, seg), x, y - 0.12, z, w * k * 1.012, 0.14, d * k * 1.012, 0, ry, 0, GOLD);
      let yy = y;
      for (const [a, cc, hf] of prof) { part(b, tile, frustG(cc / a, seg), x, yy, z, w * a * k, rise * hf, d * a * k, 0, ry, 0, col); yy += rise * hf; }
      const cr = Math.cos(ry), sr = Math.sin(ry), fl = 0.1 * Math.min(w, d) + 1.1;
      for (let i = 0; i < seg; i++) { // upturned corner flicks
        const ph = (2 * Math.PI * i) / seg + Math.PI / seg, cx = Math.sin(ph) * w * k, cz = Math.cos(ph) * d * k, n = Math.hypot(cx, cz), dx = cx / n, dz = cz / n;
        const wx = dx * cr + dz * sr, wz = -dx * sr + dz * cr, px = (cx * 0.94) * cr + (cz * 0.94) * sr, pz = -(cx * 0.94) * sr + (cz * 0.94) * cr;
        part(b, tile, flickG(), x + px, y - 0.05, z + pz, fl, 0.38, 0.5, 0, Math.atan2(-wz, wx), 0.52, col);
      }
      b.sphere(gold, x, yy - 0.1, z, 0.55 + 0.012 * w, { seg: 8, color: GOLD }); part(b, gold, frustG(0.1, 6), x, yy + 0.3, z, 0.22, 1.8 + 0.02 * w, 0.22, 0, 0, 0, GOLD);
    };
    /** Vermilion hall body with a row of columns and lit lattice windows on its long (local +z) face. */
    const hallBody = (x, y, z, w, d, h, { ry = 0, wall = VERM, cols = true } = {}) => {
      part(b, lac, boxG(), x, y, z, w, h, d, 0, ry, 0, wall);
      const cr = Math.cos(ry), sr = Math.sin(ry), loc = (lx, lz) => [x + lx * cr + lz * sr, z - lx * sr + lz * cr];
      part(b, marble, boxG(), x, y - 0.1, z, w + 1.2, 0.7, d + 1.2, 0, ry, 0, 0xe6e0d4);
      if (cols) { const n = Math.max(3, Math.round(w / 3.8)); for (let i = 0; i <= n; i++) { const [cx, cz] = loc(-w / 2 + (i * w) / n, d / 2 + 0.9); b.cyl(lac, cx, y + 0.5, cz, 0.45, h - 0.4, { seg: 7, top: 0.9, color: VERM2 }); } }
      const n = Math.max(2, Math.floor(w / 4.2)); for (let i = 0; i < n; i++) { const [cx, cz] = loc(-w / 2 + (i + 0.5) * (w / n), d / 2 + 0.06); part(b, winG, boxG(), cx, y + h * 0.3, cz, 1.9, h * 0.5, 0.12, 0, ry, 0, 0xffffff); }
    };

    // ---- walls: grey brick with merlons, corner pavilions, double-eaved gate towers, a dry-stone plinth
    const wp = [[-W, D1], [-W, D0], [W, D0], [W, D1]];
    K.wall(b, wp, { h: 12, t: 5, mat: brickM, capMat: brickM, heightAt: H, closed: false, color: vary(R, 0xb4a894, 0.02), merlon: 1.4 });
    K.wall(b, [[-W, D1], [-12, D1]], { h: 12, t: 5, mat: brickM, capMat: brickM, heightAt: H, color: 0xb4a894, merlon: 1.4 }); K.wall(b, [[12, D1], [W, D1]], { h: 12, t: 5, mat: brickM, capMat: brickM, heightAt: H, color: 0xb4a894, merlon: 1.4 });
    // wall base batter + string course along each side
    for (const [x0, z0, x1, z1] of [[-W, D0, W, D0], [-W, D0, -W, D1], [W, D0, W, D1], [-W, D1, -12, D1], [12, D1, W, D1]]) {
      const l = Math.hypot(x1 - x0, z1 - z0), ry = K.headingX(x1 - x0, z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      b.box(brickM, cx, PLATEAU - 1.5, cz, l + 1, 2.6, 7.2, ry, 0x9a8e7c); b.box(brickM, cx, PLATEAU + 11.2, cz, l, 0.7, 5.8, ry, 0xd8cdb6);
    }
    const cornerPavilion = (x, z) => { b.box(brickM, x, PLATEAU - 1, z, 12, 13, 12, 0, 0xa89c88); hallBody(x, PLATEAU + 12, z, 8, 8, 5, { cols: false }); eaveRoof(x, PLATEAU + 17, z, 14, 14, 5.5, JADE, { trim: VERM2 }); };
    for (const [x, z] of wp) cornerPavilion(x, z);
    cornerPavilion(-W, D1); cornerPavilion(W, D1);
    const gateTower = (x, z, wd, ry) => {
      const c = Math.cos(ry), s = Math.sin(ry), loc = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
      part(b, brickM, boxG(), x, PLATEAU - 1.5, z, wd, 13.5, 9, 0, ry, 0, 0xa89c88);
      for (const sd of [-1, 1]) { const [ax, az] = loc(0, sd * 4.55); part(b, dark, boxG(), ax, PLATEAU, az, 6.4, 6.4, 0.2, 0, ry, 0, 0xffffff); part(b, marble, boxG(), ax, PLATEAU + 6.3, az, 7.6, 1.0, 0.5, 0, ry, 0, 0xe0d8c8); for (let k = -2; k <= 2; k++) { const [dx, dz] = loc(k * 1.2, sd * 4.75); b.sphere(gold, dx, PLATEAU + 2.6, dz, 0.2, { seg: 5, color: GOLD }); } }
      hallBody(x, PLATEAU + 12.3, z, wd - 4, 6, 4.4, { ry }); eaveRoof(x, PLATEAU + 16.7, z, wd + 1, 10.5, 4.2, JADE, { ry, trim: VERM2 });
      hallBody(x, PLATEAU + 21, z, wd - 9, 4, 3.4, { ry, cols: false }); eaveRoof(x, PLATEAU + 24.4, z, wd - 3, 8, 5, JADE, { ry, trim: VERM2 });
      for (const sd of [-1, 1]) { const [lx, lz] = loc(sd * (wd / 2 + 1.5), 6); b.cyl(lac, lx, PLATEAU, lz, 0.18, 5.2, { seg: 5, color: 0x3a2a20 }); b.sphere(lanG, lx, PLATEAU + 5.4, lz, 0.55, { seg: 6 }); }
    };
    gateTower(0, D1, 26, 0); gateTower(0, D0, 22, 0); gateTower(-W, -20, 16, Math.PI / 2); gateTower(W, -20, 16, Math.PI / 2);
    // bridges over the moat at the three landward gates
    for (const [x0, z0, x1, z1] of [[-W - 3, -20, -W - 25, -20], [W + 3, -20, W + 25, -20], [0, D0 - 3, 0, D0 - 25]]) K.bridge(b, [x0, PLATEAU + 0.3, z0], [x1, PLATEAU + 0.3, z1], { w: 7, rise: 1.4, mat: marble, color: 0xe8e0d0, thick: 1.3, pillars: true, sink: 5 });

    // ---- the street grid inside the walls (city platform is flat, so ribbons sit cleanly)
    const avenue = [[0, D1 + 25], [0, D1], [0, 30], [0, -30], [0, D0 + 20]];
    b.ribbon(cobble, [[0, D1 + 25], [0, D1 - 6], [0, -26]], 12, H, 0.22, 0xd8cbb0); b.ribbon(cobble, [[-W + 5, -20], [0, -20], [W - 5, -20]], 7, H, 0.2, 0xd8cbb0);
    for (let i = -5; i <= 5; i++) { if (Math.abs(i) < 1) continue; const x = i * 24 + (i > 0 ? -12 : 12); b.ribbon(cobble, [[x, Math.abs(x) < 70 ? -22 : D0 + 6], [x, D1 - 6]], 3.2, H, 0.18, 0xc4b69a); }
    for (const z of [-100, -80, -60, -40, 0, 20, 40, 60]) { const xi = z < -28 ? 66 : 8; b.ribbon(cobble, [[-W + 6, z], [-xi, z]], 3.2, H, 0.18, 0xc4b69a); b.ribbon(cobble, [[xi, z], [W - 6, z]], 3.2, H, 0.18, 0xc4b69a); }
    for (let z = D1 - 2; z > -26; z -= 12) for (const sd of [-1, 1]) { b.cyl(lac, sd * 7.4, PLATEAU, z, 0.16, 4.4, { seg: 5, color: 0x4a2a20 }); b.sphere(lanG, sd * 7.4, PLATEAU + 4.7, z, 0.6, { seg: 6 }); }

    // ---- imperial precinct: marble terrace stack, great double-eaved hall, flanking pavilions, corner towers, inner wall
    const px = 0, pz = -62, py = PLATEAU;
    const prW = 62, prD0 = -102, prD1 = -26;
    K.wall(b, [[-prW, prD0], [prW, prD0], [prW, prD1], [8, prD1]], { h: 6.5, t: 2.2, mat: plaster, capMat: plaster, heightAt: H, crenel: false, color: VERM, sink: 2 });
    K.wall(b, [[-8, prD1], [-prW, prD1], [-prW, prD0]], { h: 6.5, t: 2.2, mat: plaster, capMat: plaster, heightAt: H, crenel: false, color: VERM, sink: 2 });
    for (const [x0, z0, x1, z1] of [[-prW, prD0, prW, prD0], [prW, prD0, prW, prD1], [-prW, prD0, -prW, prD1]]) { const l = Math.hypot(x1 - x0, z1 - z0); b.box(tile, (x0 + x1) / 2, py + 6.3, (z0 + z1) / 2, l * (x1 === x0 ? 0 : 1) + (x1 === x0 ? 3 : 0), 0.7, (z1 === z0 ? 3 : l), 0, 0x2a7a6a); }
    for (const [x0, x1] of [[-prW, -8], [8, prW]]) b.box(tile, (x0 + x1) / 2, py + 6.3, prD1, x1 - x0, 0.7, 3, 0, 0x2a7a6a);
    for (const sx of [-1, 1]) for (const zz of [prD0, prD1]) { b.cyl(brickM, sx * prW, py - 1, zz, 4.2, 8, { seg: 4, top: 0.86, color: 0xb4a894 }); eaveRoof(sx * prW, py + 7.4, zz, 10, 10, 4.5, BLUE, { trim: VERM2, ry: Math.PI / 4 * 0 }); }
    b.box(marble, px, py - 0.3, pz, 112, 3, 70, 0, 0xe4ded0); b.box(marble, px, py + 2.7, pz, 94, 2, 58, 0, 0xeae4d6); b.box(marble, px, py + 4.7, pz, 74, 2, 42, 0, 0xf0eadc);
    for (const [w, d, y] of [[112, 70, 2.7], [94, 58, 4.7], [74, 42, 6.7]]) { // balustrade rails + posts on each terrace edge
      b.box(marble, px, py + y, pz + d / 2 - 0.4, w - 1, 0.9, 0.4, 0, 0xf4efe6); b.box(marble, px, py + y, pz - d / 2 + 0.4, w - 1, 0.9, 0.4, 0, 0xf4efe6); b.box(marble, px + w / 2 - 0.4, py + y, pz, 0.4, 0.9, d - 1, 0, 0xf4efe6); b.box(marble, px - w / 2 + 0.4, py + y, pz, 0.4, 0.9, d - 1, 0, 0xf4efe6);
      for (let i = 0; i <= 14; i++) { b.box(marble, px - w / 2 + 0.4 + (i * (w - 0.8)) / 14, py + y, pz + d / 2 - 0.4, 0.55, 1.5, 0.55, 0, 0xf4efe6); }
    }
    for (let k = 0; k < 7; k++) b.box(marble, px, py + 0.0 + k * 0.5, pz + 35 + 8 - k * 1.3, 18 - k * 0.8, 0.55, 1.4, 0, 0xe8e2d4);       // central stair
    b.box(marble, px, py + 0.2, pz + 38, 6.2, 0.15, 10, 0, 0xcfc3a8);   // carved ramp slab
    const hy = py + 6.7;
    hallBody(px, hy, pz, 50, 26, 12, {}); eaveRoof(px, hy + 12.4, pz, 62, 36, 8, JADE, { trim: VERM2 });
    hallBody(px, hy + 20.4, pz, 36, 18, 5.5, { cols: false }); eaveRoof(px, hy + 25.9, pz, 46, 26, 9.5, GOLD, { trim: VERM2 });
    for (const sx of [-1, 1]) { hallBody(px + sx * 36, hy, pz + 6, 14, 14, 8.5, { wall: VERM }); eaveRoof(px + sx * 36, hy + 8.9, pz + 6, 21, 21, 6.5, BLUE, { trim: VERM2 }); }
    for (const sx of [-1, 1]) { hallBody(px + sx * 26, py + 4.7, pz + 38, 12, 9, 7.5, {}); eaveRoof(px + sx * 26, py + 12.7, pz + 38, 18, 15, 6, JADE, { trim: VERM2 }); }
    for (const sx of [-1, 1]) { const x = px + sx * 52, z = pz - 14; hallBody(x, hy - 2, z, 10, 10, 6, {}); eaveRoof(x, hy + 4.4, z, 15, 15, 5, TEAL, { trim: VERM2 }); }
    // bronze incense burners on the front terrace
    for (const sx of [-1, 1]) { b.cyl(gold, px + sx * 12, py + 4.7, pz + 24, 1.1, 1.8, { seg: 8, top: 1.2, color: 0x8a6a30 }); }

    // ---- pagodas: octagonal and square, marble-based, concave eaves
    const pag = [[-80, -30, 5, 8], [84, -40, 7, 8], [-70, 30, 5, 4], [74, 36, 6, 4], [30, -10, 4, 8]];
    pag.forEach(([x, z, n, seg], i) => {
      let y = PLATEAU; b.cyl(marble, x, y - 0.5, z, 9, 1.9, { seg: 8, top: 0.94, color: 0xe4ded0 }); y += 1.4;
      for (let t = 0; t < n; t++) {
        const w = 8.6 - t * 0.95, body = seg === 8 ? 0 : 1;
        if (seg === 8) b.cyl(lac, x, y, z, w * 0.5, 4.2, { seg: 8, color: t % 2 ? VERM : 0xe8d8b8 }); else b.box(lac, x, y, z, w * 0.84, 4.2, w * 0.84, 0, t % 2 ? VERM : 0xe8d8b8);
        b.box(winG, x, y + 1.4, z + w * 0.42 * (seg === 8 ? 0.93 : 1) + 0.04, 1.2, 1.8, 0.1, 0);
        eaveRoof(x, y + 4.2, z, w + 4, w + 4, 2.6, [JADE, BLUE, TEAL][i % 3], { seg, trim: VERM2 }); y += 6.8;
      }
      b.cyl(gold, x, y - 2.2, z, 0.35, 5, { seg: 6, color: GOLD }); for (let k = 0; k < 4; k++) b.cyl(gold, x, y - 1.8 + k * 0.9, z, 0.9 - k * 0.14, 0.35, { seg: 8, color: GOLD });
    });

    // ---- courtyard compounds on the street grid: north hall, two wings, gate range; grey-tiled gabled roofs
    const hips = [0x44545a, 0x3a4a50, 0x56665c, 0x4c5258, 0x6e4a3a];
    const compound = (cx, cz, sz) => {
      const col = vary(R, R.pick([0xece2cc, 0xe4d8bc, 0xf0e8d6]), 0.04), rf = vary(R, R.pick(hips), 0.08), hh = 3.4 + R() * 1.2;
      const hall = (x, z, w, d, ry, h) => { part(b, plaster, boxG(), x, PLATEAU - 0.4, z, w, h + 0.4, d, 0, ry, 0, col); part(b, lac, boxG(), x, PLATEAU + h - 0.6, z, w + 0.5, 0.5, d + 0.5, 0, ry, 0, 0x7a2a20); b.prism(roofC, x, PLATEAU + h - 0.1, z, w + 1.4, h * 0.5 + 1, d + 1.4, ry, rf); const c = Math.cos(ry), s = Math.sin(ry); b.box(winG, x + s * (d / 2 + 0.06), PLATEAU + h * 0.45, z + c * (d / 2 + 0.06), 1.0, 1.2, 0.1, ry); };
      hall(cx, cz - sz * 0.32, sz * 0.78, 5.2, 0, hh + 0.6);
      hall(cx - sz * 0.38, cz + sz * 0.05, 4.4, sz * 0.5, 0, hh); hall(cx + sz * 0.38, cz + sz * 0.05, 4.4, sz * 0.5, 0, hh);
      hall(cx, cz + sz * 0.42, sz * 0.5, 3.6, 0, hh - 0.6);
      part(b, marble, boxG(), cx, PLATEAU - 0.2, cz + sz * 0.05, sz * 0.3, 0.25, sz * 0.3, 0, 0, 0, 0xcfc4a8);
    };
    const compPos = [];
    for (let i = -5; i <= 5; i++) for (const z of [-90, -70, -50, -30, -10, 10, 30, 50]) {
      const x = i * 24 + (i > 0 ? 0 : 0);
      if (Math.abs(x) < 12 || (Math.abs(x) < 70 && z < -28) || pag.some(([qx, qz]) => Math.hypot(x - qx, z - qz) < 16) || Math.abs(x) > W - 12) continue;
      if (R() < 0.12) continue; compound(x, z, 16); compPos.push([x, z]);
    }

    // ---- port quarter outside the south wall: stone quay, piers, warehouses, lanterns
    b.box(marble, 0, 0.3, D1 + 33, 230, 2.2, 6, 0, 0xcfc3a8); b.box(marble, 0, 2.4, D1 + 35.6, 230, 0.5, 0.9, 0, 0xe0d6bc);
    for (let i = -4; i <= 4; i++) { K.pier(b, i * 24, 1.4, D1 + 36, { len: 28, w: 4, ry: -Math.PI / 2, mat: woodM, color: 0x8a5a40 }); b.cyl(lac, i * 24 + 3, 2.6, D1 + 33, 0.15, 3.8, { seg: 5, color: 0x4a2a20 }); b.sphere(lanG, i * 24 + 3, 6.4, D1 + 33, 0.55, { seg: 6 }); }
    for (let i = -5; i <= 5; i++) { const x = i * 20 + 4, z = D1 + 21; part(b, plaster, boxG(), x, H(x, z) - 1.2, z, 11, 6.2, 8, 0, 0, 0, vary(R, 0xe6d8bc, 0.04)); b.prism(tile, x, H(x, z) + 5, z, 12.4, 4, 9.4, 0, vary(R, i % 2 ? 0x3a4a50 : 0x6e4a3a, 0.08)); b.box(winG, x, H(x, z) + 2, z + 4.06, 1.4, 1.5, 0.1, 0); }
    // river bridge, trade road
    { const rx = riverX(10); K.bridge(b, [rx - 30, H(rx - 30, 10) + 0.3, 10], [rx + 30, H(rx + 30, 10) + 0.3, 10], { w: 6, rise: 3.2, mat: marble, color: 0xe4dccb, thick: 1.4, pillars: true, sink: 5 });
      b.ribbon(cobble, K.smoothPath([[W + 25, -20], [150, -6], [rx - 30, 10]], 8), 6, H, 0.2, 0xd0c4a8); }
    b.ribbon(cobble, K.smoothPath([[0, D0 - 25], [-60, -150], [-140, -200], [-230, -260]], 8), 7, H, 0.2, 0xd0c4a8);
    root.add(b.build({}));

    // ---- trees: jade hills and field-edge shade
    root.add(K.forest({ rng: K.rng(5), count: q.dens(520), bounds: [-420, -400, 420, -135], heightAt: H, species: 'cypress', minDist: 6 }));
    { const tb = new Batch(), tr = K.rng(6), tm = flat(0xffffff, { rough: 1 });
      K.scatter({ rng: tr, count: q.dens(110), bounds: [-300, -120, 300, 80], minDist: 11, avoid: (x, z) => sdBox(x, z) < 26 || Math.abs(x - riverX(z)) < 22 }).forEach(([x, z]) => { const y = H(x, z), k = tr.range(0.9, 1.4); tb.cyl(tm, x, y, z, 0.5 * k, 4 * k, { seg: 5, color: 0x6b5238 }); tb.sphere(tm, x, y + 3.2 * k, z, 3 * k, { seg: 7, sy: 0.85, color: tr.pick([0x4b7a3a, 0x58863f, 0x3f6a33, 0x6a9a3f]) }); tb.sphere(tm, x + 1.4 * k, y + 4.4 * k, z + 0.6 * k, 2 * k, { seg: 6, sy: 0.85, color: tr.pick([0x58863f, 0x6a9a3f]) }); });
      root.add(tb.build({})); }

    // ---- life: junks, river sampans, banners, braziers, incense and kitchen smoke, walkers, gulls, drifting cloud
    const ships = [['junk', -90, 135, 0.2], ['junk', -20, 150, 3.4], ['junk', 60, 140, 1.6], ['galley', 120, 165, 2.6], ['junk', -140, 170, 0.9]].map(([tp, x, z, ry], i) => { const s = K.ship(tp, { len: 20, hull: 0x5a2a1a, sail: [0xc44a2a, 0xe8c84a, 0xb83a2a][i % 3], sailColor2: 0xe8c84a }); s.position.set(x, 0.1, z); s.rotation.y = ry; s.userData.b = x; root.add(s); return s; });
    const sampans = [0, 1, 2].map((i) => { const s = K.ship('barge', { len: 9, hull: 0x4a2a1a, sail: 0xd8c898 }); s.position.set(riverX(-40 + i * 40), -0.2, -40 + i * 40); s.userData.z0 = -120 + i * 60; root.add(s); return s; });
    ctx.onUpdate((dt, t) => { ships.forEach((s, i) => { K.animateShip(s, t, i); s.position.x = s.userData.b + Math.sin(t * 0.06 + i) * 5; }); sampans.forEach((s, i) => { const z = -170 + ((t * 2.2 + s.userData.z0 + 340) % 240); s.position.set(riverX(z), -0.2, z); s.rotation.y = Math.PI / 2 + Math.cos(z * 0.03) * 0.3; K.animateShip(s, t, i); }); });
    const bn = [[-W / 2, 14, D1], [W / 2, 14, D1], [px - 28, hy + 22, pz + 14], [px + 28, hy + 22, pz + 14], [-12, PLATEAU + 30, D1], [12, PLATEAU + 30, D1]].map(([x, y, z], i) => ({ x, y, z, w: 3.2, h: 9, color: i < 2 ? GOLD : i < 4 ? BLUE : VERM, ry: 0.2 }));
    root.add(K.banners(bn));
    const brazier = [[-12, H(-12, D1 - 2) + 2, D1 - 2], [12, H(12, D1 - 2) + 2, D1 - 2], [-12, py + 6.7, pz + 36], [12, py + 6.7, pz + 36], [-W - 4, PLATEAU + 2, -14], [W + 4, PLATEAU + 2, -14]];
    const fire = K.fires(brazier, { size: 7, light: q.low ? 0 : 2, intensity: 28, color: 0xff8a40 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    root.add(K.smoke(compPos.filter((_, i) => i % 5 === 0).map(([x, z]) => [x, PLATEAU + 7, z]), { size: 12, rise: 9, opacity: 0.16 }));
    root.add(K.smoke([...pag.map(([x, z, n]) => [x, PLATEAU + n * 6.8 + 2, z]), [px, hy + 36, pz]], { size: 9, rise: 14, opacity: 0.12, color: 0xe8e0d4 }));
    const hillMist = []; for (let i = 0; i < 16; i++) hillMist.push([-300 + i * 40, 14 + (i % 3) * 8, -200 - (i % 4) * 25]); root.add(K.smoke(hillMist, { size: 80, rise: 12, opacity: 0.2, color: 0xe8eee4, perStack: 5, spread: 16 }));
    const wk = K.walkers({ paths: [[[0, D1 + 25], [0, D1], [0, 30], [0, -30], [0, -30]], [[-W + 5, -20], [W - 5, -20]], [[-150, D1 + 34], [150, D1 + 34]], [[-W + 6, 14], [-8, 14]]], heightAt: H, count: q.dens(40), rng: K.rng(3), colors: [0xb83a2a, 0x2f6ab0, 0xdcaa32, 0x1f8a6a, 0xe8e0cc], lift: 0.25 }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const gulls = K.birds({ center: [0, 55, 90], radius: 110, count: q.dens(10), color: 0xf4f4f0, size: 1.2, spreadY: 12, seed: 6 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const cl = K.clouds({ y: 280, extent: 900, count: 8, opacity: 0.4, color: 0xfaf6ee }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 270, center: [0, 0, -10], minDistance: 18,
      hero: { pos: [-170, 130, 230], target: [0, 8, -20] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x5a6aa8, horizon: 0xf2b8a0, fog: 0xe0b8a8, fogD: 0.0017, sunC: 0xffc090, sunI: 2.5, hemiSky: 0xa8b0d8, hemiGround: 0x6a5048, hemiI: 0.8 },
        day: { top: 0x3f86c6, horizon: 0xeee2c8, fog: 0xcfd8c8, fogD: 0.0010, sunI: 2.7, elev: 0.55, az: 0.8, hemiSky: 0xb0d0ec, hemiGround: 0x7a6a4c, hemiI: 1.0, sunC: 0xffe8c0 },
        dusk: { top: 0x2c3a76, horizon: 0xf0907a, fog: 0xc88a84, fogD: 0.0017, sunC: 0xff9a66, sunI: 2.5, hemiSky: 0x9a94cc, hemiGround: 0x6a4a50, hemiI: 0.95 },
        night: { top: 0x080c2c, horizon: 0x2a2e5a, fog: 0x1a2044, fogD: 0.002, sunC: 0xa0b8f0, sunI: 1.6, hemiSky: 0x6070b4, hemiGround: 0x30304a, hemiI: 1.35, exposure: 1.2 },
      } },
      landmarks: { 'imperial-palace': lm(px, pz, 36, 50), 'city-walls': lm(-W, -40, 20, 18), 'great-port': lm(0, D1 + 34, 50, 8), 'river-quarter': lm(riverX(10), 10, 24, 6), 'trade-road': lm(-60, -150, 24, 6), 'tiered-pagodas': lm(84, -40, 14, 52) },
    };
  },
};
