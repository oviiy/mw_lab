// Kayakayanaya (Tall Trees Town) - port of the Summer Isles. Interpretive: a warm harbour beneath enormous trees, with houses and
// walkways in the canopy. Little is fixed by the books; scale, layout and every building are invented here.
// Polish pass: gently leaning buttressed trunks with moss-to-bark banding and boughs, layered multi-tone crowns with hanging vines,
// spiral stairs and railed deck rings, sagging rope bridges with lanterns, stilt houses and striped market stalls on a lagoon-edge
// boardwalk, jungle-shaded ground, fireflies and drifting leaves, saturated tropical light with lantern glow at dusk and night.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color(), _d = new THREE.Vector3(), _Y = new THREE.Vector3(0, 1, 0);
const GEO = {};
const geo = (k, f) => GEO[k] || (GEO[k] = f().toNonIndexed());
const boxG = () => geo('box', () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
const sphG = () => geo('sph', () => new THREE.SphereGeometry(1, 8, 4));
const frondG = () => geo('frond', () => new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0, 0));
const cylG = (seg, top) => geo(`cyl${seg}|${top}`, () => new THREE.CylinderGeometry(top, 1, 1, seg, 1).translate(0, 0.5, 0));
const coneG = () => geo('cone', () => new THREE.ConeGeometry(1, 1, 5, 1).translate(0, 0.5, 0));
function part(b, mat, g, x, y, z, sx, sy, sz, rx, ry, rz, color) {
  _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); _m4.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); b.addGeometry(mat, g, _m4, color);
}
/** Oriented beam from p0 to p1 (box cross-section tw x td). */
function beam(b, mat, x0, y0, z0, x1, y1, z1, tw, td, color) {
  _d.set(x1 - x0, y1 - y0, z1 - z0); const L = _d.length() || 1; _d.divideScalar(L); _q.setFromUnitVectors(_Y, _d);
  _m4.compose(_p.set(x0, y0, z0), _q, _s.set(tw, L, td)); b.addGeometry(mat, boxG(), _m4, color);
}
const vary = (r, hex, a = 0.1) => { _c.set(hex); const k = 1 + (r() - 0.5) * 2 * a; return _c.clone().multiplyScalar(k); };
/** Drifting additive motes (fireflies / leaves): one draw call. */
function motes(bounds, n, { color = 0xd8f08a, size = 60, h = 14, rise = 0.6, seed = 3, heightAt = () => 0, y0 = 1.5 } = {}) {
  const r = K.rng(seed), pos = new Float32Array(n * 3), sd = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = r.range(bounds[0], bounds[2]), z = r.range(bounds[1], bounds[3]); pos.set([x, heightAt(x, z) + y0 + r() * 8, z], i * 3); sd[i] = r(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1));
  const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: K.shared.uTime, uColor: { value: new THREE.Color(color) }, uSize: { value: size }, uH: { value: h }, uRise: { value: rise } },
    vertexShader: `attribute float aSeed; uniform float uTime,uSize,uH,uRise; varying float vA; void main(){ float t=uTime*0.15+aSeed*20.0; vec3 p=position; p.x+=sin(t*1.3+aSeed*9.0)*5.0; p.z+=cos(t*1.1+aSeed*5.0)*5.0; float f=fract(uTime*0.02*uRise+aSeed); p.y+=f*uH+sin(t*0.9)*1.2; vec4 mv=modelViewMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=min(uSize*(0.5+aSeed)/max(1.0,-mv.z),22.0); vA=sin(f*3.14159)*(0.55+0.45*sin(uTime*1.3+aSeed*40.0)); }`,
    fragmentShader: `uniform vec3 uColor; varying float vA; void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.0,d); gl_FragColor=vec4(uColor,a*a*vA*0.9); }` });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 6; return pts;
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, R = K.rng(21);
    const heightAt = (x, z) => {
      const shore = 60 + Math.sin(x * 0.02) * 10 + K.fbm(x * 0.02, 1, 2, 3) * 12;
      let h = 1.5 + (K.fbm(x * 0.015, z * 0.015, 3, 4) - 0.5) * 5 + K.smoothstep(-50, -240, z) * 40 * K.fbm(x * 0.01, z * 0.01, 3, 8);
      h -= K.smoothstep(shore - 14, shore + 12, z) * 8.5;
      h += K.smoothstep(150, 250, Math.abs(x)) * 14;
      return h;
    };
    const H = heightAt;
    // ---- giant tree sites first (the ground is shaded round them)
    const sites = K.scatter({ rng: R, count: 22, bounds: [-150, -80, 150, 40], minDist: 38, avoid: (x, z) => Math.abs(x) < 8 && z > 0 });
    // ---- terrain: jungle floor, shaded loam under the crowns, bright beach sand, wet tideline
    const sand = new THREE.Color(0xeadcb0), wetS = new THREE.Color(0xb8a880), gr = new THREE.Color(0x4a8a38), gr2 = new THREE.Color(0x6aa844), shade = new THREE.Color(0x2c5428), loam = new THREE.Color(0x6a5a38), c = new THREE.Color();
    root.add(K.terrain({ size: 1000, seg: q.seg(172), heightAt: H, kind: 'grass', scale: 12, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.02, z * 0.02, 3, 3), n2 = K.fbm(x * 0.1, z * 0.1, 2, 6);
      c.copy(gr).lerp(gr2, K.clamp(n * 1.3, 0, 1)).multiplyScalar(0.88 + 0.24 * n2);
      let dmin = 99; for (const [sx, sz] of sites) dmin = Math.min(dmin, Math.hypot(x - sx, z - sz)); if (dmin < 22) c.lerp(shade, 0.65 * (1 - K.smoothstep(6, 22, dmin))); if (dmin < 9) c.lerp(loam, 0.5 * (1 - dmin / 9));
      if (h < 1.7) c.lerp(sand, K.clamp((1.7 - h) * 0.9, 0, 0.95)); if (h < 0.6) c.lerp(wetS, K.clamp((0.6 - h) * 0.9, 0, 0.8));
      c.lerp(new THREE.Color(0x3a6a30), K.clamp(s * 3, 0, 0.5)); return c; } }));
    const wat = K.water({ w: 1000, d: 640, seg: q.seg(110), level: 0, heightAt: H, deep: 0x0c6a88, shallow: 0x5ad8c4, opacity: 0.88, choppy: 0.3, speed: 0.6, center: [0, 340] });
    root.add(wat); ctx.registerWater(wat);

    // ---- materials
    const bark = tri('wood', { color: 0xf0e4d6, scale: 6, snow: false, bump: 1.3 }), plank = tri('wood', { color: 0xf6e2c0, scale: 3, snow: false }), thatch = tri('thatch', { color: 0xe0cca0, scale: 4, snow: false }), plaster = tri('plaster', { color: 0xffffff, scale: 6, snow: false });
    const leaf = tri('grass', { color: 0xffffff, scale: 2.2, snow: false, rough: 0.9, side: THREE.DoubleSide, bump: 1.6 }), winG = glow(0xffd48a, 1.0), lanG = glow(0xffb040, 1.3), cloth = flat(0xffffff, { rough: 1, side: THREE.DoubleSide, flatShading: false }), rope = flat(0xffffff, { rough: 1, flatShading: false });
    const b = new Batch(), lb = new Batch();
    const LEAVES = [0x7ac060, 0x62b058, 0x8acc58, 0x58a850, 0x70b850, 0x4a9a48];

    // ---- the giant trees: leaning, banded, buttressed, with boughs and layered crowns
    const trees = [];
    sites.forEach(([x, z], i) => {
      const TR = K.rng(500 + i), y = H(x, z), h = TR.range(52, 74), rr = TR.range(3.4, 5);
      // trunk in three leaning sections; axis(y) returns the centreline
      const secs = []; let cx = x, cz = z, cy = y - 2; const hs = [h * 0.28, h * 0.36, h * 0.36 + 4];
      let r0 = rr * 1.18;
      hs.forEach((s, k) => { const tx = TR.range(-0.045, 0.045), tz = TR.range(-0.045, 0.045), r1 = r0 * (k === 2 ? 0.66 : 0.8); secs.push({ cx, cy, cz, tx, tz, hs: s }); part(b, bark, cylG(10, r1 / r0), cx, cy, cz, r0, s, r0, tx, 0, tz, vary(TR, k === 0 ? 0x5a5438 : k === 1 ? 0x6a4a30 : 0x7a5a3a, 0.08)); cx += -Math.sin(tz) * s; cz += Math.sin(tx) * s; cy += s * Math.cos(tx) * Math.cos(tz); r0 = r1; });
      const axis = (yy) => { for (const s of secs) if (yy <= s.cy + s.hs * 1.001) { const f = (yy - s.cy) / s.hs; return [s.cx + -Math.sin(s.tz) * s.hs * f, s.cz + Math.sin(s.tx) * s.hs * f]; } const s = secs[2]; return [s.cx - Math.sin(s.tz) * s.hs, s.cz + Math.sin(s.tx) * s.hs]; };
      b.cyl(bark, x, y - 3, z, rr * 1.9, 9.5, { top: 0.62, seg: 10, color: vary(TR, 0x584a34, 0.08) });
      for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.283 + i, ca = Math.cos(a), sa = Math.sin(a); beam(b, bark, x + ca * rr * 1.0, y - 1.6, z + sa * rr * 1.0, x + ca * rr * 2.7, y - 1.6, z + sa * rr * 2.7, 0.9, 0.8, 0x4a3e2c); beam(b, bark, x + ca * rr * 1.5, y + 7, z + sa * rr * 1.5, x + ca * rr * 2.7, y - 1.6, z + sa * rr * 2.7, 1.2, 0.6, 0x5a4a34); }   // buttress flanges
      const [tx, tz] = axis(y + h - 5), cy2 = y + h - 5, cr = TR.range(15, 21);
      for (let k = 0; k < 5; k++) { const a = k * 1.26 + i, ex = tx + Math.cos(a) * cr * 0.7, ez = tz + Math.sin(a) * cr * 0.7, by = y + h * (0.74 + (k % 2) * 0.06), [bx, bz] = axis(by); beam(b, bark, bx, by, bz, ex, cy2 - 1 + (k % 2) * 2, ez, 1.7, 1.5, 0x5a4430); }   // boughs
      for (let k = 0; k < 24; k++) { // layered crown of many overlapping leaf-masses
        const ring = k < 3 ? 0.15 : k < 14 ? 0.56 : 0.86, a = k * 2.4 + i + TR() * 0.5, lo = ring * cr * TR.range(0.85, 1.1), rrad = cr * (k < 3 ? 0.5 : k < 14 ? 0.34 : 0.26) * TR.range(0.85, 1.15);
        const ly = cy2 + (k < 3 ? 3 + k * 1.5 : k < 14 ? 0.5 + (k % 3) * 2.2 : -2.5 + (k % 2) * 2.4);
        part(lb, leaf, sphG(), tx + Math.cos(a) * lo, ly, tz + Math.sin(a) * lo, rrad, rrad * 0.62, rrad, 0, TR() * 6, 0, vary(TR, LEAVES[(k + i) % 6], 0.1));
        if (k < 9) part(lb, leaf, sphG(), tx + Math.cos(a) * lo, ly + rrad * 0.38, tz + Math.sin(a) * lo, rrad * 0.62, rrad * 0.3, rrad * 0.62, 0, TR() * 6, 0, vary(TR, 0xb8e070, 0.1));   // sunlit tops
      }
      for (let k = 0; k < 9; k++) { const a = TR() * 6.283, d = cr * TR.range(0.5, 0.9), vl = TR.range(7, 16); part(lb, leaf, coneG(), tx + Math.cos(a) * d, cy2 - 3 - vl, tz + Math.sin(a) * d, 0.35, vl, 0.35, Math.PI, 0, 0, vary(TR, 0x3a6a30, 0.15)); }  // hanging vines
      trees.push({ x, z, y, h, rr, cy: cy2, axis });
    });
    // ---- decks, railings, braces, spiral stairs, houses
    const lamps = [], plat = [];
    const dec = (t, lvl, ti) => {
      const DR = K.rng(900 + ti * 3 + lvl), py = t.y + t.h * (lvl ? 0.62 : 0.4), pr = (t.rr * 2.4 + 5) * (lvl ? 0.82 : 1), [ax, az] = t.axis(py);
      part(b, plank, cylG(14, 1), ax, py, az, pr, 0.7, pr, 0, 0, 0, vary(DR, 0xb08a52, 0.06));
      part(b, plank, cylG(14, 1), ax, py - 0.5, az, pr * 1.03, 0.5, pr * 1.03, 0, 0, 0, 0x6a4a2c);   // underside ring beam
      for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283, a2 = ((i + 1) / 14) * 6.283, x0 = ax + Math.cos(a) * pr * 0.97, z0 = az + Math.sin(a) * pr * 0.97, x1 = ax + Math.cos(a2) * pr * 0.97, z1 = az + Math.sin(a2) * pr * 0.97;
        beam(b, plank, x0, py + 0.7, z0, x0, py + 2.0, z0, 0.28, 0.28, 0x6a4a2c); beam(b, rope, x0, py + 1.9, z0, x1, py + 1.9, z1, 0.18, 0.18, 0x3a2a1a);
        if (i % 2 === 0) { b.sphere(lanG, x0, py + 2.55, z0, 0.34, { seg: 5 }); lamps.push([x0, py + 2.55, z0]); }
        if (i % 3 === 0) beam(b, bark, ax + Math.cos(a) * t.rr * 1.1, py - 4.5, az + Math.sin(a) * t.rr * 1.1, x0, py - 0.4, z0, 0.55, 0.55, 0x5a4430);   // braces back to the trunk
      }
      const n = 2 + (lvl ? 0 : 1);
      for (let k = 0; k < n; k++) { const a = k * (6.283 / n) + t.x, hx = ax + Math.cos(a) * (pr - 4.6), hz = az + Math.sin(a) * (pr - 4.6), wc = [0xe6c27a, 0xd08a5a, 0xb0c870, 0xe8d4a0][(k + ti) % 4];
        K.house(b, hx, py + 0.7, hz, { w: 5.5, d: 4.5, h: 3.6, ry: -a, style: 'hip', wallMat: plank, roofMat: thatch, wall: wc, roof: vary(DR, 0xd0b46a, 0.12), glowMat: winG, windows: true });
        part(b, cloth, boxG(), hx + Math.cos(a) * 3.2, py + 3.0, hz + Math.sin(a) * 3.2, 3.6, 0.15, 2.4, 0.3, -a + Math.PI / 2, 0, vary(DR, [0xd9362a, 0xe8c44a, 0x2fa05a, 0xf2e6c6][(k + ti) % 4], 0.08)); }   // porch awning
      if (!lvl) { // spiral stairs wrap the trunk from the ground
        const N = Math.round((py - t.y) / 0.85); for (let s = 0; s < N; s++) { const yy = t.y + 0.3 + s * 0.85, a = s * 0.3 + ti, rad = t.rr * 1.5 + 1.6, [sx, sz] = t.axis(yy); part(b, plank, boxG(), sx + Math.cos(a) * rad, yy, sz + Math.sin(a) * rad, 2.2, 0.25, 1.1, 0, -a, 0, 0x8a6a40); }
        for (let s = 0; s < N; s += 7) { const yy = t.y + 0.3 + s * 0.85, a = s * 0.3 + ti, rad = t.rr * 1.5 + 1.6, [sx, sz] = t.axis(yy); b.cyl(bark, sx + Math.cos(a) * (rad + 1.2), yy - 0.4, sz + Math.sin(a) * (rad + 1.2), 0.1, 2.4, { seg: 4, color: 0x4a3a28 }); }
      }
      return { py, pr, ax, az };
    };
    trees.forEach((t, i) => { plat.push({ lo: dec(t, 0, i), hi: t.rr > 4.2 ? dec(t, 1, i) : null }); });
    // ---- rope bridges: planked, sagging, with hand-ropes and lanterns
    const bridges = []; let br = 0;
    for (let i = 0; i < trees.length; i++) for (let j = i + 1; j < trees.length; j++) {
      const d = Math.hypot(trees[i].x - trees[j].x, trees[i].z - trees[j].z);
      if (d < 70 && br < 26 && (i + j) % 2 === 0) { const a = plat[i].lo, c2 = plat[j].lo, dx = c2.ax - a.ax, dz = c2.az - a.az, l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l;
        bridges.push([[a.ax + ux * a.pr, a.py + 0.7, a.az + uz * a.pr], [c2.ax - ux * c2.pr, c2.py + 0.7, c2.az - uz * c2.pr]]); br++; }
    }
    bridges.forEach(([p0, p1], bi) => {
      const dx = p1[0] - p0[0], dz = p1[2] - p0[2], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = -uz, nz = ux, ry = K.headingX(dx, dz), sag = Math.min(3.6, L * 0.06), n = Math.max(6, Math.round(L / 0.95));
      const Pt = (t) => [p0[0] + dx * t, p0[1] + (p1[1] - p0[1]) * t - Math.sin(t * Math.PI) * sag, p0[2] + dz * t];
      for (let k = 0; k < n; k++) { const [x, y, z] = Pt((k + 0.5) / n); part(b, plank, boxG(), x, y - 0.15, z, 0.8, 0.14, 2.3, 0, ry, 0, k % 2 ? 0xa88050 : 0xb89060); }
      for (const sd of [-1, 1]) { for (let k = 0; k < n; k += 3) { const t0 = k / n, t1 = Math.min(1, (k + 3) / n), A = Pt(t0), B = Pt(t1); beam(b, rope, A[0] + nx * sd * 1.1, A[1] + 1.15, A[2] + nz * sd * 1.1, B[0] + nx * sd * 1.1, B[1] + 1.15, B[2] + nz * sd * 1.1, 0.14, 0.14, 0x3a2a1a); beam(b, rope, A[0] + nx * sd * 1.1, A[1] + 0.1, A[2] + nz * sd * 1.1, A[0] + nx * sd * 1.1, A[1] + 1.15, A[2] + nz * sd * 1.1, 0.1, 0.1, 0x3a2a1a); }
        beam(b, rope, p0[0] + nx * sd * 1.1, p0[1] + 0.1, p0[2] + nz * sd * 1.1, p1[0] + nx * sd * 1.1, p1[1] + 0.1, p1[2] + nz * sd * 1.1, 0.12, 0.12, 0x3a2a1a); }
      const mid = Pt(0.5); b.sphere(lanG, mid[0], mid[1] + 1.9, mid[2], 0.38, { seg: 5 }); lamps.push([mid[0], mid[1] + 1.9, mid[2]]);
    });

    // ---- ground-level town: lagoon-edge boardwalk, stilt houses, market stalls, quay, piers
    const bw = K.smoothPath([[-130, 52], [-70, 56], [0, 58], [70, 56], [130, 52]], 6); b.ribbon(plank, bw, 5, H, 0.45, 0xb89060);
    b.box(plank, 0, 0.1, 62, 150, 1.4, 5, 0, 0x9a7444); for (let i = -4; i <= 4; i++) K.pier(b, i * 16 + 4, 0.9, 64, { len: 24, w: 3.4, ry: -Math.PI / 2, mat: plank, color: 0xa88050 });
    for (let i = -9; i <= 9; i++) { b.cyl(bark, i * 8 + 1, -2.5, 64.4, 0.22, 4.4, { seg: 5, color: 0x4a3a28 }); if (i % 2 === 0) { b.sphere(lanG, i * 8 + 1, 2.2, 64.4, 0.36, { seg: 5 }); lamps.push([i * 8 + 1, 2.2, 64.4]); } }
    const stilt = (x, z, w, d, h, ry, wc, rc) => { const gy = 1.6; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const c = Math.cos(ry), s = Math.sin(ry); b.cyl(bark, x + sx * w * 0.42 * c + sz * d * 0.42 * s, gy - 4.5, z - sx * w * 0.42 * s + sz * d * 0.42 * c, 0.26, 4.6, { seg: 5, color: 0x4a3a28 }); }
      part(b, plank, boxG(), x, gy - 0.1, z, w + 1.2, 0.35, d + 1.2, 0, ry, 0, 0x8a6a40); K.house(b, x, gy + 0.25, z, { w, d, h, ry, style: 'hip', wallMat: plank, roofMat: thatch, wall: wc, roof: rc, glowMat: winG }); };
    for (let i = 0; i < 11; i++) { const x = -120 + i * 24 + (i % 2) * 3, z = 49 + (i % 3) * 0.5; if (Math.abs(x) < 10) continue; stilt(x, z, 6.5, 5.6, 3.6, (i % 3 - 1) * 0.06, [0xe2c07a, 0xc88a5a, 0xd8e0b0, 0xe6a878][i % 4], vary(R, 0xc4a860, 0.12)); }
    // market: striped awnings, tables, baskets of fruit
    const mk = [-40, 36], AW = [0xd9362a, 0xe8c44a, 0x2fa05a, 0xf2e6c6, 0x2a8ab8];
    for (let i = 0; i < 12; i++) { const x = mk[0] + ((i % 4) - 1.5) * 7.5, z = mk[1] + (((i / 4) | 0) - 1) * 8, y = H(x, z); part(b, plank, boxG(), x, y, z, 4.2, 1.0, 1.5, 0, 0, 0, 0x8a6a40);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(bark, x + sx * 2.1, y, z + sz * 1.1, 0.12, 3.0, { seg: 4, color: 0x4a3a28 });
      part(b, cloth, boxG(), x, y + 2.9, z, 4.9, 0.12, 3.0, 0.12, 0, 0, vary(R, AW[i % 5], 0.06)); part(b, cloth, boxG(), x, y + 2.95, z - 0.3, 4.95, 0.1, 0.8, 0.12, 0, 0, 0xefe4c8);
      for (let k = 0; k < 3; k++) b.sphere(flat(0xffffff, { rough: 0.9 }), x - 1.3 + k * 1.3, y + 1.0, z, 0.38, { seg: 5, sy: 0.7, color: [0xe8a030, 0xd9362a, 0x7ac040][(i + k) % 3] }); }
    // shore-side houses on the land, away from the trees
    const near = (x, z) => trees.some((t) => Math.hypot(x - t.x, z - t.z) < t.rr * 2.4 + 9) || K.distToPolyline(x, z, bw).d < 6 || (Math.abs(x - mk[0]) < 20 && Math.abs(z - mk[1]) < 16) || z > 44;
    const placed = K.town(b, { rng: K.rng(24), count: q.dens(80), bounds: [-135, 8, 135, 46], minDist: 10, size: [4.5, 7], height: [3.5, 5], heightAt: H, style: 'hip', palette: [{ wall: 0xe2c07a, roof: 0xd0b46a }, { wall: 0xc88a5a, roof: 0xc4a860 }, { wall: 0xd8e0b0, roof: 0xd0b46a }, { wall: 0xe6a878, roof: 0xc4a860 }], wallMat: plank, roofMat: thatch, glowMat: winG, avoid: near });
    root.add(b.build({})); root.add(lb.build({ shadow: false }));
    // ---- palms and undergrowth (instanced)
    { const pb = new Batch(), pr = K.rng(9), PG = [0x4aa84a, 0x5cb850, 0x3a984a];
      K.scatter({ rng: pr, count: q.dens(110), bounds: [-260, -140, 260, 56], minDist: 9, avoid: (x, z) => near(x, z) && z < 44 }).forEach(([x, z]) => {
        const y = H(x, z); if (y < 0.6) return; const k = pr.range(0.85, 1.3), lean = pr.range(-0.12, 0.12), la = pr() * 6.283, hh = 8.5 * k;
        part(pb, bark, cylG(6, 0.7), x, y - 0.4, z, 0.42 * k, hh * 0.55, 0.42 * k, Math.sin(la) * lean, 0, Math.cos(la) * lean, 0xa08460);
        const tx = x + Math.cos(la) * lean * -hh * 0.55, tz = z + Math.sin(la) * lean * hh * 0.55, ty = y - 0.4 + hh * 0.55;
        part(pb, bark, cylG(6, 0.75), tx, ty, tz, 0.3 * k, hh * 0.5, 0.3 * k, Math.sin(la) * lean * 1.6, 0, Math.cos(la) * lean * 1.6, 0x8d7452);
        const cx = tx + Math.cos(la) * lean * 1.6 * -hh * 0.5, cz = tz + Math.sin(la) * lean * 1.6 * hh * 0.5, cy = ty + hh * 0.5;
        for (let f = 0; f < 8; f++) { const a = f * 0.785 + pr() * 0.3, c1 = PG[f % 3], L1 = 2.5 * k, L2 = 2.8 * k, e1x = cx + Math.cos(a) * L1 * Math.cos(0.4), e1y = cy + L1 * Math.sin(0.4), e1z = cz - Math.sin(a) * L1 * Math.cos(0.4);
          part(pb, leaf, frondG(), cx, cy, cz, L1, 0.1, 1.0 * k, 0, a, 0.4, c1); part(pb, leaf, frondG(), e1x, e1y, e1z, L2, 0.1, 0.9 * k, 0, a, -0.75, vary(pr, c1, 0.1)); }
        for (let n = 0; n < 3; n++) pb.sphere(flat(0xffffff, { rough: 0.8 }), cx + Math.cos(n * 2.1) * 0.5, cy - 0.5, cz + Math.sin(n * 2.1) * 0.5, 0.32 * k, { seg: 5, color: 0x4a3a20 });
      });
      root.add(pb.build({})); }
    { const fe = new Inst(G.sphere(6), flat(0xffffff, { rough: 1, flatShading: true })), fr = K.rng(15);
      for (let i = 0; i < q.dens(240); i++) { const x = fr.range(-220, 220), z = fr.range(-130, 50), h = H(x, z); if (h < 1.4 || K.distToPolyline(x, z, bw).d < 6) continue; const k = fr.range(0.8, 2.2); fe.add(x, h - k * 0.2, z, k * 1.3, k * 0.6, k * 1.3, fr() * 6, vary(fr, [0x2f6a30, 0x3f8a3a, 0x58a040][i % 3], 0.1)); }
      root.add(fe.build()); }

    // ---- life: ships, parrots, gulls, banners, fires, smoke, walkers (ground + one bridge), fireflies, falling leaves
    const sc = [0xd9362a, 0x2fa05a, 0xe8c44a, 0xf2e6c6];
    const ships = [['dhow', -110, 110, 0.5], ['galley', -40, 130, 3.4], ['dhow', 30, 115, 1.6], ['cog', 90, 140, 2.4], ['dhow', 140, 105, 0.9]].map(([tp, x, z, ry], i) => { const s = K.ship(tp, { len: 15, hull: 0x7a5232, sail: sc[i % 4], sailColor2: sc[(i + 1) % 4] }); s.position.set(x, 0.1, z); s.rotation.y = ry; s.userData.b = x; root.add(s); return s; });
    ctx.onUpdate((dt, t) => ships.forEach((s, i) => { K.animateShip(s, t, i); s.position.x = s.userData.b + Math.sin(t * 0.07 + i) * 4; }));
    const birds = K.birds({ center: [0, 70, -20], radius: 110, count: q.dens(14), color: 0xd9362a, size: 1.1, spreadY: 14, seed: 31 }); root.add(birds); ctx.onUpdate((dt, t) => birds.userData.update(t));
    const gulls = K.birds({ center: [0, 40, 90], radius: 100, count: q.dens(8), color: 0xf6f4ee, size: 1.2, spreadY: 10, seed: 32 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    root.add(K.banners(trees.slice(0, 10).map((t, i) => ({ x: t.x + t.rr * 1.5, y: t.y + t.h * 0.7, z: t.z, w: 2.6, h: 6, color: [0xd9362a, 0x2fa05a, 0xe8c44a][i % 3], ry: i }))));
    const fire = K.fires(trees.slice(0, 5).map((t) => [t.x + t.rr * 2.4 + 2, t.y + t.h * 0.4 + 3, t.z]).concat([[-30, 2.5, 60], [30, 2.5, 60]]), { size: 6, light: q.low ? 0 : 2, intensity: 30 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    root.add(K.smoke(placed.filter((_, i) => i % 6 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 3, p.z]), { size: 10, rise: 8, opacity: 0.14 }));
    const wk = K.walkers({ paths: [bw, [[-100, 30], [-40, 24], [30, 30], [100, 26]]], heightAt: H, count: q.dens(26), rng: K.rng(4), lift: 0.8, colors: [0xd9362a, 0x2fa05a, 0xe8c44a, 0x3a7ab8, 0xf2e6c6] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    bridges.slice(0, 4).forEach(([p0, p1], bi) => { const L = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]); const hy = (x, z) => { const t = K.clamp(Math.hypot(x - p0[0], z - p0[2]) / L, 0, 1); return p0[1] + (p1[1] - p0[1]) * t - Math.sin(t * Math.PI) * Math.min(3.6, L * 0.06) - 0.1; };
      const w2 = K.walkers({ paths: [[[p0[0], p0[2]], [p1[0], p1[2]]]], heightAt: hy, count: 2, rng: K.rng(40 + bi), lift: 0.1, speed: [0.8, 1.4], colors: [0xd9362a, 0x2fa05a, 0xe8c44a, 0xf2e6c6] }); root.add(w2); ctx.onUpdate((dt, t) => w2.userData.update(t)); });
    root.add(motes([-150, -80, 150, 50], q.dens(110), { heightAt: H, y0: 2, h: 14, seed: 3 }));
    root.add(motes([-150, -80, 150, 40], q.dens(40), { heightAt: H, y0: 30, h: 20, seed: 8, color: 0xb8e070, size: 50, rise: 0.4 }));
    const cl = K.clouds({ y: 260, extent: 800, count: 8, opacity: 0.4, color: 0xffffff }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    const t0 = trees.reduce((a, t) => (Math.abs(t.x) + Math.abs(t.z + 10) < Math.abs(a.x) + Math.abs(a.z + 10) ? t : a), trees[0]);
    const t1 = trees.reduce((a, t) => (t.h > a.h ? t : a), trees[0]);
    return {
      radius: 250, center: [0, 0, 0], minDistance: 18,
      hero: { pos: [-90, 105, 205], target: [0, 28, -10] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x6a7ab8, horizon: 0xf8c8a0, fog: 0xe8c8a8, fogD: 0.0015, sunC: 0xffc888, sunI: 2.6, hemiSky: 0xb0b8dc, hemiGround: 0x5a6a3a, hemiI: 0.85 },
        day: { top: 0x3a96d6, horizon: 0xeef4dc, fog: 0xc4e2d0, fogD: 0.0011, sunI: 2.8, elev: 0.58, hemiSky: 0xb4dcf0, hemiGround: 0x5a7a3a, hemiI: 1.1, sunC: 0xfff0c8 },
        dusk: { top: 0x3a3a82, horizon: 0xf08a6a, fog: 0xd88a80, fogD: 0.0016, sunC: 0xff9a60, sunI: 2.6, hemiSky: 0x9a9ccc, hemiGround: 0x4a5a38, hemiI: 1.0 },
        night: { top: 0x061428, horizon: 0x1e4658, fog: 0x10282e, fogD: 0.002, sunC: 0x9ac0f0, sunI: 1.5, hemiSky: 0x5a86b4, hemiGround: 0x1c3a30, hemiI: 1.45, exposure: 1.2 },
      } },
      landmarks: { 'giant-trees': lm(t1.x, t1.z, 24, t1.h * 0.9), 'canopy-houses': { ...lm(t0.x, t0.z, 20, t0.h * 0.45), cam: { pos: [t0.x - 6, t0.y + t0.h * 0.4 + 12, t0.z + 34], target: [t0.x, t0.y + t0.h * 0.4 + 2, t0.z] } }, 'rope-walkways': { ...lm((trees[0].x + trees[1].x) / 2, (trees[0].z + trees[1].z) / 2, 24, trees[0].h * 0.45), cam: { pos: [(trees[0].x + trees[1].x) / 2 - 10, trees[0].y + trees[0].h * 0.4 + 14, (trees[0].z + trees[1].z) / 2 + 40], target: [(trees[0].x + trees[1].x) / 2, trees[0].y + trees[0].h * 0.4, (trees[0].z + trees[1].z) / 2] } }, 'harbour': lm(0, 66, 40, 6), 'shore-market': lm(-40, 36, 24, 5), 'feather-banners': lm(trees[2].x + trees[2].rr * 1.5, trees[2].z, 14, trees[2].h * 0.7) },
    };
  },
};
