// Qohor — sparse. Books/TWOIAF: an inland Free City among the great Forest of Qohor (the source of its wealth), famed for smiths and armour, the Black Goat cult.
// The black-stone palette, plan and forms are interpretation.
// Polish pass: basalt walls and slate roofs on a loose street grid, brick forge-stacks that vent smoke and drifting embers, glowing furnace mouths and windows
// (warm night bloom), a horned dark temple, charcoal kilns and log yards, an enormous dense dark forest on a rising bowl of hills, sooty overcast grade.
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
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
/** Add a geometry with full rotation (Batch.cone/cyl only expose yaw). */
function tilted(b, mat, geom, x, y, z, sx, sy, sz, rx, ry, rz, color) { _e.set(rx, ry, rz); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); b.addGeometry(mat, geom, _m, color); }
const openCone = (seg) => { const c = new THREE.ConeGeometry(1, 1, seg, 1, true); c.translate(0, 0.5, 0); return c; };
const proto = (fn) => { const bb = new Batch(); fn(bb); return bb.build({}).children[0].geometry; };
/** Instanced ember sparks: additive points that rise from [[x,y,z],...] and cool from yellow to red. */
function embers(emitters, perEmitter, { rise = 22, spread = 5, size = 2.4 } = {}) {
  const n = emitters.length * perEmitter, pos = new Float32Array(n * 3), seed = new Float32Array(n * 2), r = K.rng(404);
  emitters.forEach((e, i) => { for (let k = 0; k < perEmitter; k++) { const o = i * perEmitter + k; pos.set(e, o * 3); seed[o * 2] = r(); seed[o * 2 + 1] = r(); } });
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 2));
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uTime: K.shared.uTime, uRise: { value: rise }, uSpread: { value: spread }, uSize: { value: size } },
    vertexShader: `attribute vec2 aSeed; uniform float uTime, uRise, uSpread, uSize; varying float vT; varying float vA;
      void main(){ float sp = 0.07 + aSeed.y * 0.09; float t = fract(uTime * sp + aSeed.x); vT = t; vec3 p = position;
        p.y += t * uRise * (0.6 + aSeed.y * 0.8); p.x += sin(aSeed.x * 40.0 + t * 5.0) * uSpread * t + t * uSpread * 0.8; p.z += cos(aSeed.y * 33.0 + t * 4.0) * uSpread * t;
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * (1.0 - t * 0.6) * (70.0 / max(1.0, -mv.z));
        vA = (1.0 - t) * smoothstep(0.0, 0.06, t) * (0.6 + 0.4 * sin(uTime * 14.0 + aSeed.x * 60.0)); }`,
    fragmentShader: `varying float vT; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); vec3 c = mix(vec3(1.0, 0.8, 0.35), vec3(1.0, 0.25, 0.05), vT); gl_FragColor = vec4(c * 1.6, a * vA); }` });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 7; return pts;
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(81);
    const RX = 92, RZ = 78;
    const ell = (x, z) => Math.hypot(x / RX, z / RZ);
    const heightAt = (x, z) => {
      const r = ell(x, z), rw = Math.hypot(x, z);
      return 1 + (K.fbm(x * 0.012, z * 0.012, 3, 4) - 0.5) * 14 * K.smoothstep(0.9, 2.6, r) + 6 * (1 - K.smoothstep(0.3, 1.4, r)) + (K.fbm(x * 0.04, z * 0.04, 2, 7) - 0.5) * 0.8
        + K.smoothstep(230, 430, rw) * (22 + 30 * K.fbm(x * 0.007, z * 0.007, 3, 2));          // wooded bowl of hills closing the horizon
    };
    const H = heightAt;
    // ---- terrain: black forest floor, needle-brown and moss patches, trampled sooty earth round the walls
    const floor = new THREE.Color(0x3a4c36), moss = new THREE.Color(0x4a6038), needle = new THREE.Color(0x6a5238), soot = new THREE.Color(0x6a5e50), ash = new THREE.Color(0x7a7266), c = new THREE.Color();
    root.add(K.terrain({ size: 920, seg: q.seg(150), heightAt, kind: 'rock', scale: 16, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.02, z * 0.02, 3, 3), n2 = K.fbm(x * 0.09, z * 0.09, 2, 12), e = ell(x, z);
      c.copy(floor).lerp(moss, K.clamp(n * 1.4 - 0.2, 0, 1)).lerp(needle, K.clamp(n2 * 1.6 - 0.7, 0, 0.6)).multiplyScalar(0.8 + 0.4 * n2);
      c.lerp(soot, K.smoothstep(1.9, 1.0, e) * 0.85); c.lerp(ash, K.smoothstep(1.25, 1.0, e) * 0.5);
      return c; } }));

    // ---- materials
    const blk = tri('stone', { color: 0xffffff, scale: 7, rough: 0.78, snow: false, bump: 0.9 }), plaster = tri('plaster', { color: 0xffffff, scale: 6, snow: false, bump: 0.7 }), slate = tri('slate', { color: 0xffffff, scale: 4, snow: false, rough: 0.6, bump: 0.8 });
    const wood = tri('wood', { color: 0xffffff, scale: 4, snow: false }), brick = tri('brick', { color: 0xffffff, scale: 5, snow: false, bump: 0.8 }), cobble = tri('cobble', { color: 0xffffff, scale: 6, snow: false });
    const iron = flat(0xffffff, { metal: 0.65, rough: 0.45, flatShading: false }), soft = flat(0xffffff, { rough: 1, flatShading: false }), dark = flat(0x050506);
    const win = glow(0xffb060), furnace = glow(0xff7424, 1.9), hot = glow(0xffc060, 2.2), lan = glow(0xff9a3c, 1.4);
    const b = new Batch();
    const BASALT = 0x4c4c58, BASALT_D = 0x2c2c34, WALLS = [0x74747e, 0x827c72, 0x666a74, 0x7a6e72, 0x6c7476], ROOFS = [0x2e323c, 0x3a3c48, 0x3e3230, 0x282c34];

    // ---- walls: basalt with battered plinth and buttresses, tall towers, iron-banded gates, braziers
    const NW = 40, wp = Array.from({ length: NW }, (_, i) => { const a = (i / NW) * Math.PI * 2; return [Math.cos(a) * RX, Math.sin(a) * RZ]; });
    K.wall(b, wp, { h: 14, t: 4.4, mat: blk, capMat: blk, heightAt: H, closed: true, color: BASALT, merlon: 1.4, sink: 4 });
    const braziers = [];
    for (let i = 0; i < NW; i++) { const A = wp[i], B2 = wp[(i + 1) % NW], dx = B2[0] - A[0], dz = B2[1] - A[1], len = Math.hypot(dx, dz), mx = (A[0] + B2[0]) / 2, mz = (A[1] + B2[1]) / 2, y0 = Math.min(H(A[0], A[1]), H(B2[0], B2[1]));
      b.box(blk, mx, y0 - 1, mz, len + 0.6, 3.2, 6.2, K.headingX(dx, dz), shade(BASALT, 0.66));
      if (i % 2 === 0) { const nx = -dz / len, nz = dx / len, o = (mx * nx + mz * nz) >= 0 ? 1 : -1; b.box(blk, mx + nx * o * 2.9, y0 - 1, mz + nz * o * 2.9, 2.6, 15, 2.6, K.headingX(dx, dz), shade(BASALT, 0.8)); } }
    wp.forEach(([x, z], i) => { if (i % 4 !== 0) return; const y = H(x, z);
      K.tower(b, x, z, { r: 4.6, h: 23, y, mat: blk, roofMat: slate, roof: 'cone', roofH: 11, seg: 10, windows: false, color: BASALT, roofColor: 0x2a2e38 });
      b.cyl(blk, x, y + 12, z, 5.1, 0.8, { seg: 10, color: shade(BASALT, 0.7) }); b.box(furnace, x, y + 16, z + 4.64, 0.5, 1.4, 0.2); braziers.push([x, y + 24.6, z]); });
    for (const [gx, gz, ry] of [[0, RZ, 0], [RX, 0, Math.PI / 2], [-RX, 0, Math.PI / 2]]) {
      const gy = H(gx, gz); K.gatehouse(b, gx, gz, { y: gy, ry, mat: blk, roofMat: slate, w: 17, d: 9.5, h: 17, gate: 5.4, wood, towerR: 4.3, color: BASALT, roofColor: 0x2a2e38 });
      const c1 = Math.cos(ry), s1 = Math.sin(ry); b.box(dark, gx, gy, gz, 5.8, 5.2, 6, ry);
      for (const sg of [-1, 1]) { b.cyl(iron, gx + sg * 4.6 * c1 + s1 * 6.2, gy, gz - sg * 4.6 * s1 + c1 * 6.2, 0.35, 3.2, { seg: 6, color: 0x2a2a30 }); b.sphere(furnace, gx + sg * 4.6 * c1 + s1 * 6.2, gy + 3.5, gz - sg * 4.6 * s1 + c1 * 6.2, 0.7, { seg: 6, sy: 1.3 }); braziers.push([gx + sg * 4.6 * c1 + s1 * 6.2, gy + 4, gz - sg * 4.6 * s1 + c1 * 6.2]); }
    }

    // ---- loose street grid of tall narrow smiths' houses; streets, temple and forge yards left open
    const forges = [[-26, -12], [34, 22], [10, -42], [-42, 28]], TX = 8, TZ = 8;
    const roadsEW = [[-RX - 90, 0], [-RX, 0], [RX, 0], [RX + 90, 0]], roadNS = K.smoothPath([[0, RZ + 90], [0, RZ], [3, 40], [TX, TZ + 14]], 6);
    const placed = [];
    for (let gz = -66; gz <= 66; gz += 10.2) for (let gx = -84, ci = 0; gx <= 84; gx += 8.4, ci++) {
      if (ci % 5 === 4) continue;
      const x = gx + rr.range(-0.7, 0.7), z = gz + rr.range(-0.7, 0.7), e = Math.hypot(x / (RX - 11), z / (RZ - 11));
      if (e > 1 || Math.abs(z) < 5.2 || K.distToPolyline(x, z, roadNS).d < 5 || (Math.abs(x - TX) < 24 && Math.abs(z - TZ) < 19) || forges.some(([fx, fz]) => Math.abs(x - fx) < 14 && Math.abs(z - fz) < 12)) continue;
      const w = rr.range(5.2, 6.6), d = rr.range(5.6, 7.4), h = rr.range(5, 9.2), ry = (Math.floor((gz + 70) / 10.2) % 2 ? Math.PI / 2 : 0) + rr.range(-0.04, 0.04), y = H(x, z);
      const wc = jit(rr.pick(WALLS), rr, 0.01, 0.05, 0.05), rc = jit(rr.pick(ROOFS), rr, 0.01, 0.06, 0.04), rh = Math.min(w, d) * 0.55 + 1, c1 = Math.cos(ry), s1 = Math.sin(ry);
      b.box(blk, x, y - 1.4, z, w + 0.5, 2.4, d + 0.5, ry, shade(BASALT, 0.7));
      b.box(plaster, x, y + 1.0, z, w, h - 1.0, d, ry, wc);
      if (h > 7) b.box(wood, x, y + h * 0.58, z, w + 0.5, 0.3, d + 0.5, ry, 0x2c2218);
      b.box(plaster, x, y + h - 0.4, z, w + 0.6, 0.8, d + 0.6, ry, shade(0x706a60, 0.9));
      b.prism(slate, x, y + h, z, w + 1.0, rh, d + 1.0, ry, rc);
      if (rr() < 0.55) b.box(brick, x + c1 * w * 0.28, y + h + rh * 0.3, z - s1 * w * 0.28, 1.0, rh + 1.6, 1.0, ry, 0x3c2c28);
      for (const sd of [-1, 1]) for (const lx of [-w * 0.24, w * 0.24]) if (rr() < 0.7) b.box(win, x + c1 * lx + s1 * sd * (d / 2 + 0.05), y + h * 0.5, z - s1 * lx + c1 * sd * (d / 2 + 0.05), 0.8, 1.1, 0.12, ry);
      b.box(dark, x + s1 * (d / 2 + 0.05), y + 1.0, z + c1 * (d / 2 + 0.05), 1.0, 2.0, 0.12, ry);
      placed.push({ x, z, h: h + rh });
    }

    // ---- forges: low black halls, furnace mouths, towering brick stacks, anvil yards
    const stackTops = [];
    forges.forEach(([x, z], i) => { const y = H(x, z), ry = 0;
      b.box(blk, x, y - 1.4, z, 16, 2.6, 11, 0, shade(BASALT, 0.7)); b.box(blk, x, y + 1.2, z, 15, 5.6, 10, 0, 0x3a3a44); b.box(plaster, x, y + 6.6, z, 15.8, 0.8, 10.8, 0, 0x55545a);
      b.prism(slate, x, y + 7.4, z, 16.6, 4.2, 11.6, 0, 0x2a2e36);
      b.box(dark, x - 2, y + 1.2, z + 5.05, 7.4, 4.6, 0.3); b.box(furnace, x - 2, y + 1.6, z + 5.22, 5.6, 3.4, 0.2); b.box(hot, x - 2, y + 2.2, z + 5.32, 2.4, 1.4, 0.2);
      for (const sx of [-1, 1]) b.box(blk, x - 2 + sx * 3.9, y + 1.2, z + 5.2, 0.9, 4.8, 0.7, 0, 0x2a2a30);
      b.box(win, x + 5, y + 4, z + 5.05, 1.2, 1.4, 0.12); b.box(win, x + 5, y + 4, z - 5.05, 1.2, 1.4, 0.12);
      // brick stack with iron bands and a glowing mouth
      const sx = x + 5.5, sz = z - 2, sh = 24 + i * 2;
      b.box(brick, sx, y + 4, sz, 3.4, 5, 3.4, 0, 0x4a342e); b.box(brick, sx, y + 8.6, sz, 2.7, sh - 8, 2.7, 0, 0x5a3e34);
      for (const f of [0.38, 0.62, 0.84]) b.box(iron, sx, y + sh * f, sz, 2.95, 0.4, 2.95, 0, 0x3a3a40);
      b.box(brick, sx, y + sh + 0.6, sz, 3.5, 1.0, 3.5, 0, 0x4a342e); b.box(hot, sx, y + sh + 1.5, sz, 2.0, 0.4, 2.0); stackTops.push([sx, y + sh + 2.2, sz]);
      // anvil yard: anvils on stumps, ingots, coal, quench trough, rack
      for (let k = 0; k < 3; k++) { const ax = x - 6 + k * 3.8, az = z + 8.4 + (k % 2) * 1.6; b.cyl(wood, ax, y, az, 0.6, 0.9, { seg: 6, color: 0x2c2218 }); b.box(iron, ax, y + 0.9, az, 1.2, 0.35, 0.55, 0.4 * k, 0x3a3a42); b.box(iron, ax, y + 1.25, az, 0.5, 0.3, 0.4, 0.4 * k, 0x34343a); }
      b.box(wood, x + 7.5, y, z + 8.8, 3.4, 0.9, 1.3, 0, 0x2c2218); b.box(flat(0x1a2a36, { rough: 0.15, metal: 0.4, flatShading: false }), x + 7.5, y + 0.9, z + 8.8, 3.0, 0.1, 0.9);
      for (let k = 0; k < 4; k++) b.box(iron, x - 8.4, y + k * 0.35, z + 2.5 + (k % 2) * 0.2, 2.4, 0.3, 0.8, 0, 0x5a5a62);
      b.cone(soft, x + 9.4, y, z - 3, 1.8, 1.7, { seg: 8, color: 0x1a1a1c });
    });

    // ---- the Black Goat temple (interpretive): massive dark hall, twin towers crowned with curving horns, glowing doorway
    { const y = H(TX, TZ), P = TX, Q = TZ;
      b.box(blk, P, y - 1.6, Q, 36, 2.8, 28, 0, shade(BASALT, 0.7)); b.box(blk, P, y + 1.2, Q, 33, 1.1, 25, 0, shade(BASALT, 0.8)); b.box(blk, P, y + 2.3, Q, 30, 1.1, 22, 0, shade(BASALT, 0.9));
      const py = y + 3.4;
      b.box(blk, P, py, Q - 2, 24, 14, 14, 0, 0x34343e); b.box(blk, P, py + 13.4, Q - 2, 25, 1.2, 15, 0, 0x2a2a32); b.prism(slate, P, py + 14.6, Q - 2, 26, 6.5, 16, 0, 0x24262e);
      b.box(dark, P, py, Q + 5.1, 5.4, 8.2, 0.4); b.box(furnace, P, py + 0.3, Q + 5.25, 3.6, 6.6, 0.2); b.box(hot, P, py + 1.2, Q + 5.3, 1.2, 3.8, 0.2);
      for (const sg of [-1, 1]) {
        const tx = P + sg * 13, tz = Q + 6, th = 24; b.box(blk, tx, py, tz, 7, th, 7, 0, 0x30303a); b.box(blk, tx, py + th, tz, 8.2, 1.0, 8.2, 0, 0x26262e);
        for (const f of [0.4, 0.75]) b.box(win, tx, py + th * f, tz + 3.54, 0.7, 2.0, 0.12);
        // horn: chain of tapering, curving segments
        let hx = tx, hy = py + th + 1, th2 = sg * 0.35, hz = tz;
        for (let k = 0; k < 7; k++) { const len = 3.1, r0 = 1.35 - k * 0.17, ang = th2; tilted(b, blk, G.cyl(7, 0.78), hx, hy, hz, r0, len, r0, 0, 0, -ang, 0x1c1c22);
          hx += Math.sin(ang) * len; hy += Math.cos(ang) * len; th2 -= sg * 0.17 * (1 + k * 0.1); }
      }
      for (const sg of [-1, 1]) { b.cyl(iron, P + sg * 6.5, py - 0.6, Q + 9.5, 0.4, 2.6, { seg: 6, color: 0x2a2a30 }); b.sphere(furnace, P + sg * 6.5, py + 2.3, Q + 9.5, 0.8, { seg: 6, sy: 1.3 }); braziers.push([P + sg * 6.5, py + 3, Q + 9.5]); }
      b.ribbon(cobble, [[P, Q + 14], [P - 3, Q + 24], [2, 40]], 6, H, 0.3, 0x3a3a42);
    }
    b.ribbon(cobble, roadNS, 6, H, 0.3, 0x35353c); b.ribbon(cobble, roadsEW, 5.4, H, 0.3, 0x35353c);

    // ---- outside: charcoal kilns, log yards, stump-cleared ring
    const kilns = [], kp = [[RX + 34, 15], [RX + 38, -17]];
    for (let i = 0; i < 8; i++) kp.push([Math.cos(i * 0.8 + 0.4) * (RX + 38), Math.sin(i * 0.8 + 0.4) * (RZ + 34)]);
    for (const [x, z] of kp) { if (Math.abs(z) < 6) continue; const y = H(x, z);
      b.dome(soft, x, y - 0.4, z, 4.4, { seg: 10, sy: 0.7, color: 0x2a2220 }); b.box(furnace, x + 2.6, y + 0.4, z, 0.8, 0.8, 0.8); kilns.push([x, y + 3, z]); }
    const logC = [0x6a4a30, 0x5a3e28, 0x78563a];
    for (const [lx, lz, lr] of [[RX + 24, 22, 0.15], [RX + 30, -28, -0.1], [-RX - 26, 20, 0.1], [-8, RZ + 30, 1.5]]) {
      const ly = H(lx, lz), cr = Math.cos(lr), sr2 = Math.sin(lr);
      for (let row = 0; row < 4; row++) for (let k = 0; k < 6 - row; k++) { const off = (k - (5 - row) / 2) * 0.82; tilted(b, wood, G.cyl(6, 1), lx + sr2 * off, ly + 0.4 + row * 0.7, lz + cr * off, 0.4, 5.4, 0.4, Math.PI / 2, lr, 0, logC[(k + row) % 3]); }
    }
    root.add(b.build({}));

    // ---- the Forest of Qohor: dense dark conifers + broadleaf, baked grey ramps with per-instance colour
    const pine = proto((bb) => { const oc = openCone(6);
      bb.cyl(dummyMat, 0, 0, 0, 0.3, 2.2, { top: 0.7, seg: 4, color: grey(0.7) });
      [[1.1, 2.2, 3.4, 0.74], [3.0, 1.75, 3.0, 0.9], [4.9, 1.2, 2.8, 1.08]].forEach(([y, r, h, k]) => tilted(bb, dummyMat, oc, 0, y, 0, r, h, r, 0, 0.3, 0, grey(k))); });
    const oakG = proto((bb) => { bb.cyl(dummyMat, 0, 0, 0, 0.38, 3.0, { top: 0.7, seg: 4, color: grey(0.7) }); bb.sphere(dummyMat, 0, 2.0, 0, 2.5, { seg: 6, sy: 0.9, color: grey(0.95) }); bb.sphere(dummyMat, 0.6, 3.6, 0.2, 1.6, { seg: 5, sy: 0.9, color: grey(1.1) }); });
    const leafM = tri('grass', { color: 0xffffff, scale: 2.4, rough: 1, snow: false, bump: 0.5 });
    const pineI = new Inst(pine, leafM), oakI = new Inst(oakG, leafM), tr = K.rng(5);
    const pineC = [0x1f3a2c, 0x264636, 0x1c3430, 0x2a4a38, 0x203a40], oakC = [0x3a4e28, 0x465a2c, 0x34502e, 0x6a4a2a, 0x58602c];
    const edge = (x, z) => 1 + (K.fbm(x * 0.03, z * 0.03, 2, 9) - 0.5) * 0.28;
    const inside = (x, z) => Math.hypot(x / (RX + 24), z / (RZ + 22)) < edge(x, z) * 1.0 || Math.abs(z) < 5.5 && Math.abs(x) < 460 || K.distToPolyline(x, z, roadNS).d < 5 || kilns.some(([kx, , kz]) => Math.hypot(x - kx, z - kz) < 9);
    for (const [x, z] of K.scatter({ rng: tr, count: q.dens(3000), bounds: [-440, -400, 440, 400], minDist: 6.6, avoid: inside })) {
      const y = H(x, z), far = Math.hypot(x, z) > 200, k = tr.range(1.1, 1.9) * (far ? 1.25 : 1);
      if (tr() < 0.76) pineI.add(x, y - 0.2, z, k, k * tr.range(1.0, 1.5), k, tr() * 6, pineC[tr.int(0, 4)]);
      else oakI.add(x, y - 0.2, z, k * 1.15, k * 1.1, k * 1.15, tr() * 6, oakC[tr.int(0, 4)]);
    }
    for (const i of [pineI, oakI]) if (i.items.length) root.add(i.build());

    // ---- life: forge-stack smoke, drifting embers, kiln smoke, ravens, carts and walkers
    root.add(K.smoke(stackTops, { size: 40, rise: 32, opacity: 0.7, color: 0x303236, perStack: 8, spread: 4 }));
    root.add(K.smoke(placed.filter((_, i) => i % 9 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 2, p.z]), { size: 20, rise: 14, opacity: 0.3, color: 0x70727a }));
    root.add(K.smoke(kilns, { size: 26, rise: 18, opacity: 0.3, color: 0x9a9a98, perStack: 5, spread: 4 }));
    root.add(embers(stackTops.concat(forges.map(([x, z]) => [x - 2, H(x, z) + 4, z + 5.4])), 14, { rise: 28, spread: 6, size: 3.6 }));
    root.add(embers(braziers.concat(kilns), 5, { rise: 9, spread: 1.8, size: 2.6 }));
    const fire = K.fires(braziers.concat(forges.map(([x, z]) => [x - 2, H(x, z) + 3.2, z + 6])), { size: 6, light: q.low ? 0 : 3, intensity: 80 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const g = K.birds({ center: [0, 62, 0], radius: 95, count: q.dens(16), color: 0x101014, size: 1.3, spreadY: 18, seed: 6 }); root.add(g); ctx.onUpdate((dt, t) => g.userData.update(t));
    const carts = []; { const cb = new Batch(), cm = wood;
      cb.box(cm, 0, 0.7, 0, 3.4, 0.5, 1.8, 0, 0x4a3524); cb.box(cm, 0, 1.2, 0.9, 3.4, 0.7, 0.2, 0, 0x4a3524); cb.box(cm, 0, 1.2, -0.9, 3.4, 0.7, 0.2, 0, 0x4a3524);
      for (const [wx, wz] of [[-1.1, 1.0], [1.1, 1.0], [-1.1, -1.0], [1.1, -1.0]]) tilted(cb, cm, G.cyl(8, 1), wx, 0.6, wz, 0.6, 0.18, 0.6, Math.PI / 2, 0, 0, 0x2a1e14);
      for (let k = 0; k < 4; k++) tilted(cb, cm, G.cyl(6, 1), -1 + k * 0.7, 1.5, 0, 0.3, 2.6, 0.3, Math.PI / 2, 0, 0, 0x6a4a30);
      for (let i = 0; i < 3; i++) carts.push({ lane: i % 2 ? -1 : 1, x0: i * 150, v: (i % 2 ? -1 : 1) * 5 });
      const cg = cb.build({}); cg.children.forEach((m) => m.castShadow = true);
      carts.forEach((o) => { o.g = cg.clone(); root.add(o.g); });
    }
    ctx.onUpdate((dt, t) => { for (const o of carts) { const x = (((o.x0 + t * o.v + 330) % 660) + 660) % 660 - 330, y = H(x, o.lane * 1.4); o.g.position.set(x, y + 0.25, o.lane * 1.4 - 0.0); o.g.rotation.y = o.v > 0 ? 0 : Math.PI; } });
    const wk = K.walkers({ paths: [[[0, RZ + 60], [0, RZ - 5], [6, 14]], [[-RX - 60, 3], [RX + 60, 3]], [[-30, -14], [20, 22], [34, 26]]], heightAt: H, count: q.dens(20), rng: K.rng(4), colors: [0x3a3a40, 0x5a4a3a, 0x6a2f28, 0x4a5a4a] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const cl = K.clouds({ y: 210, extent: 800, count: 12, opacity: 0.55, color: 0xa8aeb4 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 220, center: [0, 5, 0], minDistance: 15,
      hero: { pos: [-118, 66, 150], target: [0, 14, -2] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x44546a, horizon: 0xcc9c80, fog: 0x867e76, fogD: 0.0022, sunC: 0xffb890, sunI: 2.6, az: 2.2, elev: 0.16, hemiSky: 0x9aa4b8, hemiGround: 0x38402e, hemiI: 1.3 },
        day: { top: 0x4c606a, horizon: 0x9aa8a0, fog: 0x7a8a84, fogD: 0.0019, sunC: 0xe8dcc0, sunI: 3.0, az: 2.2, elev: 0.42, hemiSky: 0x9ab0b4, hemiGround: 0x384a34, hemiI: 1.7, exposure: 1.1 },
        dusk: { top: 0x2a2a50, horizon: 0xcc6850, fog: 0x6a5248, fogD: 0.0019, sunC: 0xff8a50, sunI: 3.0, az: 2.2, elev: 0.14, hemiSky: 0x8c8cbc, hemiGround: 0x4a403a, hemiI: 1.7, exposure: 1.1 },
        night: { top: 0x050814, horizon: 0x1e3040, fog: 0x14202c, fogD: 0.0022, sunC: 0x9ab2e8, sunI: 1.7, az: 2.0, elev: 0.5, hemiSky: 0x6a80ac, hemiGround: 0x243038, hemiI: 1.6, exposure: 1.25 },
      } },
      landmarks: { 'forges': lm(-26, -12, 14, 26), 'black-goat-temple': lm(TX, TZ, 14, 36), 'black-walls': lm(RX, 0, 12, 24), 'forest-of-qohor': lm(-190, -80, 50, 24), 'smiths-quarter': lm(34, 22, 18, 30), 'charcoal-kilns': lm(RX + 34, 0, 16, 5) },
    };
  },
};
